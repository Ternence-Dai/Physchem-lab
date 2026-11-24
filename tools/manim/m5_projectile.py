# 实验 m5 斜抛运动 — Physchem-lab 试点动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m5 默认值
#   v0 = 25 m/s, theta = 60°, g = 9.8 m/s^2
#   公式 x=v0 cos(theta) t; y=v0 sin(theta) t-(1/2)gt^2; T=2 v0 sin(theta)/g;
#        R=v0^2 sin(2theta)/g; H=v0^2 sin^2(theta)/(2g)
#   (OpenStax University Physics Vol.1 §4.3, eqs 4.24-4.26)
#   领域函数 src/domain/index.js projectileMotion 同一模型
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
V0 = 25.0
THETA = 60.0
TH = np.radians(THETA)
VX = V0 * np.cos(TH)                    # 12.5 m/s
VY = V0 * np.sin(TH)                    # 21.65 m/s
T_END = 2 * VY / G                      # 4.4185 s
RANGE = VX * T_END                      # 55.23 m
HMAX = VY ** 2 / (2 * G)                # 23.92 m


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    # Pango 文本数字读数(替代走 LaTeX 的 DecimalNumber,本机无 TeX)
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)



def pos_at(t):
    return VX * t, VY * t - 0.5 * G * t * t


class Projectile(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = cn("斜抛运动", 54, YELLOW, BOLD)
        sub = cn("实验 m5 · 初速度 v0 = 25 m/s · 发射角 θ = 60° · g = 9.8 m/s²", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        # ---------- 坐标系 ----------
        axes = Axes(
            x_range=[0, 62, 10], y_range=[0, 28, 7],
            x_length=10.6, y_length=5.3,
            axis_config={"color": GREY_B, "include_ticks": True},
            tips=False,
        ).move_to([-0.7, -0.75, 0])
        x_lab = cn("水平距离 x / m", 20, GREY_B).next_to(axes, DOWN, buff=0.12).shift(RIGHT * 3.4)
        y_lab = cn("高度 y / m", 20, GREY_B).next_to(axes, LEFT, buff=0.1).rotate(90 * DEGREES)
        self.play(Create(axes), FadeIn(x_lab), FadeIn(y_lab), run_time=1.2)

        origin = axes.c2p(0, 0)
        # 初速度分解箭头
        v_scale = 0.11
        v0_arrow = Arrow(origin, origin + np.array([VX * v_scale, VY * v_scale, 0]),
                         color=YELLOW, buff=0, stroke_width=6)
        vx_arrow = Arrow(origin, origin + np.array([VX * v_scale, 0, 0]),
                         color=BLUE, buff=0, stroke_width=5)
        vy_arrow = Arrow(origin + np.array([VX * v_scale, 0, 0]),
                         origin + np.array([VX * v_scale, VY * v_scale, 0]),
                         color=GREEN, buff=0, stroke_width=5)
        v0_lab = cn("v0 = 25 m/s", 20, YELLOW).next_to(v0_arrow, UP, buff=0.08)
        vx_lab = cn("vx = v0·cos60° = 12.5 m/s(不变)", 19, BLUE).move_to(
            axes.c2p(17.5, 3.2))
        vy_lab = cn("vy = v0·sin60° = 21.7 m/s", 19, GREEN).move_to(
            axes.c2p(10.5, 16.5))
        angle_arc = Arc(radius=0.55, start_angle=0, angle=TH, color=YELLOW).move_to(
            origin, aligned_edge=LEFT).shift(RIGHT * 0.0)
        angle_arc.move_to(origin + np.array([0.28, 0.1, 0]))
        th_lab = cn("60°", 20, YELLOW).move_to(origin + np.array([0.95, 0.35, 0]))
        self.play(Create(v0_arrow), Create(vx_arrow), Create(vy_arrow),
                  FadeIn(v0_lab), FadeIn(vx_lab), FadeIn(vy_lab),
                  Create(angle_arc), FadeIn(th_lab), run_time=1.4)
        self.wait(0.6)
        self.play(FadeOut(v0_arrow), FadeOut(vx_arrow), FadeOut(vy_arrow),
                  FadeOut(v0_lab), FadeOut(angle_arc), FadeOut(th_lab), run_time=0.6)

        # ---------- 运动 ----------
        tracker = ValueTracker(0.0)

        def ball_dot():
            x, y = pos_at(tracker.get_value())
            return Dot(axes.c2p(x, max(y, 0)), radius=0.09, color=RED)
        ball = always_redraw(ball_dot)

        def trail():
            t = tracker.get_value()
            pts = [axes.c2p(*pos_at(tt)) for tt in np.linspace(0, max(t, 1e-6), 60)]
            return VMobject().set_points_as_corners(pts).set_stroke(ORANGE, 3)
        trail_line = always_redraw(trail)

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_END) + 1e-9:
                x, y = pos_at(0.5 * k)
                dots.add(Dot(axes.c2p(x, max(y, 0)), radius=0.04,
                             color=YELLOW, fill_opacity=0.7))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)

        t_num = always_redraw(lambda: VGroup(
            cn("t =", 22), num(tracker.get_value(), 2, 26),
            cn("s", 22)).arrange(RIGHT, buff=0.08).move_to([-5.6, 3.35, 0], aligned_edge=LEFT))
        x_num = always_redraw(lambda: VGroup(
            cn("x =", 22), num(pos_at(tracker.get_value())[0], 1, 26),
            cn("m", 22)).arrange(RIGHT, buff=0.08).move_to([-3.4, 3.35, 0], aligned_edge=LEFT))
        y_num = always_redraw(lambda: VGroup(
            cn("y =", 22), num(max(pos_at(tracker.get_value())[1], 0), 1, 26),
            cn("m", 22)).arrange(RIGHT, buff=0.08).move_to([-1.2, 3.35, 0], aligned_edge=LEFT))
        slow = cn("(慢放播放,黄点为每 0.5 s 的位置)", 19, GREY_B).move_to(
            [1.2, 3.35, 0], aligned_edge=LEFT)

        self.add(ball, trail_line, strobe_dots, t_num, x_num, y_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(T_END), run_time=8, rate_func=linear)
        self.wait(0.6)

        # ---------- 最高点与落点标注 ----------
        apex_pt = axes.c2p(VX * T_END / 2, HMAX)
        land_pt = axes.c2p(RANGE, 0)
        h_line = DashedLine(axes.c2p(VX * T_END / 2, 0), apex_pt, color=GREEN)
        h_lab = cn("最高点 H = 23.9 m", 21, GREEN).next_to(h_line, RIGHT, buff=0.12).shift(UP * 1.6)
        r_lab = cn("落点 R = 55.2 m", 21, ORANGE).next_to(land_pt, UP, buff=0.25).shift(LEFT * 0.6)
        self.play(Create(h_line), FadeIn(h_lab), FadeIn(r_lab), run_time=1.0)
        self.wait(0.8)
        self.play(FadeOut(vx_lab), FadeOut(vy_lab), FadeOut(slow), run_time=0.5)

        # ---------- 收尾:动态元素换成静态轨迹,整体缩小上移,给公式腾位 ----------
        static_trail = VMobject().set_points_as_corners(
            [axes.c2p(*pos_at(tt)) for tt in np.linspace(0, T_END, 120)]
        ).set_stroke(ORANGE, 3)
        static_strobe = VGroup(*[
            Dot(axes.c2p(*pos_at(0.5 * k)), radius=0.04, color=YELLOW, fill_opacity=0.7)
            for k in range(int(T_END / 0.5) + 1)])
        static_ball = Dot(axes.c2p(RANGE, 0), radius=0.09, color=RED)
        plot_group = VGroup(axes, x_lab, y_lab, static_trail, static_strobe,
                            static_ball, h_line, h_lab, r_lab)
        self.remove(ball, trail_line, strobe_dots, t_num, x_num, y_num,
                    axes, x_lab, y_lab, h_line, h_lab, r_lab)
        self.add(plot_group)
        self.play(plot_group.animate.scale(0.6).to_edge(UP, buff=0.25), run_time=1.0)
        self.wait(0.4)

        # ---------- 公式与结论 ----------
        formulas = VGroup(
            cn("水平方向:匀速  x = v0·cosθ · t", 25),
            cn("竖直方向:匀加速  y = v0·sinθ · t − ½·g·t²", 25),
            cn("飞行时间  T = 2·v0·sinθ / g = 4.42 s", 25),
            cn("射程  R = v0²·sin2θ / g = 55.2 m    最高点  H = v0²·sin²θ / (2g) = 23.9 m", 24),
            cn("要点:两个方向互不影响,轨迹是抛物线", 24, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        formulas.move_to([0, -2.6, 0])
        for f in formulas[:4]:
            self.play(Write(f), run_time=0.9)
        self.play(FadeIn(formulas[4]), run_time=0.7)
        self.wait(2.2)
