# 实验 m4 平抛运动 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m4 默认值
#   v0 = 15 m/s, h = 30 m, g = 9.8 m/s^2; 公式 x=v0t; h=(1/2)gt^2; t=sqrt(2h/g); R=v0*sqrt(2h/g)
#   (OpenStax University Physics Vol.1 §4.3)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
V0 = 15.0
H = 30.0
T_END = float(np.sqrt(2 * H / G))          # 2.4746 s
R_END = V0 * T_END                          # 37.12 m
VY_END = G * T_END                          # 24.25 m/s
V_END = float(np.hypot(V0, VY_END))         # 28.51 m/s
SX = 9.6 / R_END                            # x scale
SY = 5.0 / H                                # y scale
OX, OY = -6.4, 2.2                          # launch point


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def pos_at(t):
    return np.array([OX + V0 * t * SX, OY - 0.5 * G * t * t * SY, 0])


class HorizontalProjectile(Scene):
    def construct(self):
        title = cn("平抛运动", 54, YELLOW, BOLD)
        sub = cn("实验 m4 · 水平初速度 v₀ = 15 m/s · 高度 h = 30 m · g = 9.8 m/s²", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground_y = OY - H * SY
        cliff = Rectangle(width=0.9, height=H * SY, fill_opacity=0.35,
                          fill_color=GREY_BROWN, stroke_color=GREY_B)
        cliff.move_to([OX - 0.45, (OY + ground_y) / 2, 0])
        ground = Line([-6.9, ground_y, 0], [6.9, ground_y, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 5.6)
        top_label = cn("抛出点 30 m", 22).move_to([OX + 0.4, OY + 0.45, 0])
        varrow = Arrow([OX, OY, 0], [OX + V0 * 0.09, OY, 0], color=RED, buff=0.05)
        varrow_label = cn("v₀ = 15 m/s", 22, RED).move_to([OX + 1.5, OY + 0.45, 0])
        land_x = OX + R_END * SX
        land_mark = Line([land_x, ground_y, 0], [land_x, ground_y + 0.35, 0], color=YELLOW, stroke_width=3)
        land_label = cn("落点:水平射程 37.1 m", 22, YELLOW).move_to([land_x - 0.9, ground_y + 0.62, 0])
        self.play(Create(cliff), Create(ground), FadeIn(ground_label), FadeIn(top_label),
                  Create(varrow), FadeIn(varrow_label), Create(land_mark), FadeIn(land_label), run_time=1.2)

        panel_x = 1.4
        t_lab = cn("时间 t", 26).move_to([panel_x, 1.55, 0], aligned_edge=LEFT)
        x_lab = cn("水平位移 x = v₀·t", 26).move_to([panel_x, 0.65, 0], aligned_edge=LEFT)
        vy_lab = cn("竖直速度 vy = g·t", 26).move_to([panel_x, -0.25, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(x_lab), FadeIn(vy_lab), run_time=0.8)

        tracker = ValueTracker(0.0)
        ball = always_redraw(lambda: Dot(pos_at(tracker.get_value()), radius=0.1, color=RED))
        trail = TracedPath(ball.get_center, stroke_color=RED, stroke_width=3)
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(V0 * tracker.get_value(), 1), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        vy_num = always_redraw(lambda: VGroup(
            num(G * tracker.get_value(), 1), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(vy_lab, RIGHT, buff=0.3))

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_END) + 1e-9:
                dots.add(Dot(pos_at(0.5 * k), radius=0.04, color=YELLOW, fill_opacity=0.75))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)
        note = cn("水平方向匀速,竖直方向自由落体,两运动同时进行", 20, YELLOW)
        note.move_to([1.4, -1.05, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([1.4, -1.6, 0], aligned_edge=LEFT)

        self.add(trail, ball, t_num, x_num, vy_num, strobe_dots)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_END), run_time=6.5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(note), FadeOut(slow), FadeOut(t_lab), FadeOut(x_lab), FadeOut(vy_lab),
                  FadeOut(t_num), FadeOut(x_num), FadeOut(vy_num), FadeOut(land_label), run_time=0.5)

        formulas = VGroup(
            cn("水平:x = v₀·t(匀速)   竖直:h = ½·g·t²(自由落体)", 28),
            cn("落地时间  t = √(2h/g) = √(60/9.8) = 2.47 s", 30),
            cn("水平射程  R = v₀·t = 15 × 2.47 = 37.1 m", 30),
            cn("落地速度  v = √(v₀² + (gt)²) = 28.5 m/s", 30),
            cn("要点:飞行时间只由高度决定,与水平速度无关", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.26)
        formulas.move_to([0.2, -1.95, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
