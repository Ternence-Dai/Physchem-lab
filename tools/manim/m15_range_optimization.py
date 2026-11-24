# 实验 m15 斜抛水平射程优化 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m15 默认值
#   v0 = 25 m/s, 默认角 30°, g = 9.8 m/s^2; 公式 R=v0^2*sin(2θ)/g; θ=45° 时 R_max=v0^2/g
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m15 条目一致:
#    f:['R=v₀²·sin2θ/g','θ=45°时 R_max=v₀²/g'])
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
V0 = 25.0
ANGLES = [30, 45, 60]
COLORS = {30: BLUE, 45: RED, 60: GREEN}
RMAX = V0 * V0 / G                      # 63.78 m at 45°
H45 = (V0 * np.sin(np.radians(45))) ** 2 / (2 * G)   # 15.94 m
SX = 10.4 / RMAX
SY = 4.6 / 20.0
OX, OY = -6.3, -2.5


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def range_of(deg):
    return V0 * V0 * np.sin(np.radians(2 * deg)) / G


def pos_at(t, deg):
    a = np.radians(deg)
    return np.array([OX + V0 * np.cos(a) * t * SX,
                     OY + (V0 * np.sin(a) * t - 0.5 * G * t * t) * SY, 0])


def flight_time(deg):
    return 2 * V0 * np.sin(np.radians(deg)) / G


def traj_curve(deg, color):
    pts = [pos_at(flight_time(deg) * k / 60, deg) for k in range(61)]
    return VMobject().set_points_as_corners(pts).set_color(color).set_stroke(width=3)


class RangeOptimization(Scene):
    def construct(self):
        title = cn("斜抛水平射程优化", 54, YELLOW, BOLD)
        sub = cn("实验 m15 · 初速度 v₀ = 25 m/s 固定 · 只改变发射角 θ · g = 9.8 m/s²", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground = Line([OX - 0.3, OY, 0], [6.9, OY, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 6.2)
        launch = Dot([OX, OY, 0], radius=0.08, color=WHITE)
        launch_label = cn("发射点", 22).move_to([OX + 0.1, OY + 0.45, 0])
        self.play(Create(ground), FadeIn(ground_label), FadeIn(launch), FadeIn(launch_label), run_time=1.0)

        # 先静态画出 30° 与 60° 轨迹
        curve30 = traj_curve(30, COLORS[30])
        curve60 = traj_curve(60, COLORS[60])
        lab30 = cn("θ = 30°:R = 55.2 m", 24, COLORS[30]).move_to([OX + range_of(30) * SX - 1.2, OY + 0.5, 0])
        lab60 = cn("θ = 60°:R = 55.2 m", 24, COLORS[60]).move_to([OX + range_of(60) * SX - 1.2, OY + 1.15, 0])
        self.play(Create(curve30), FadeIn(lab30), run_time=1.2)
        self.play(Create(curve60), FadeIn(lab60), run_time=1.2)
        note1 = cn("30° 与 60° 是互补角,射程相同!", 26, YELLOW)
        note1.move_to([0.2, 3.1, 0])
        self.play(FadeIn(note1), run_time=0.7)
        self.wait(0.7)

        # 45° 动态飞行
        panel_x = -6.3
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.2, 0], aligned_edge=LEFT)
        x_lab = cn("水平位移 x", 26).move_to([panel_x, 1.35, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(x_lab), run_time=0.6)
        tracker = ValueTracker(0.0)
        T45 = flight_time(45)
        ball = always_redraw(lambda: Dot(pos_at(tracker.get_value(), 45), radius=0.1, color=RED))
        trail = TracedPath(ball.get_center, stroke_color=RED, stroke_width=3.5)
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(V0 * np.cos(np.radians(45)) * tracker.get_value(), 1),
            cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        lab45 = cn("θ = 45°:R = 63.8 m(最大)", 26, RED, BOLD).move_to([-6.3, 0.45, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([-6.3, -0.35, 0], aligned_edge=LEFT)
        self.add(trail, ball, t_num, x_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(T45), run_time=5.5, rate_func=linear)
        self.play(FadeIn(lab45), run_time=0.6)
        self.wait(0.6)
        self.play(FadeOut(slow), FadeOut(note1), run_time=0.5)

        formulas = VGroup(
            cn("射程  R = v₀²·sin(2θ)/g", 30),
            cn("θ = 45° 时 sin(2θ) = 1,R 最大 = v₀²/g = 63.8 m", 30),
            cn("互补角(30° 与 60°)射程相等,都是 55.2 m", 30),
            cn("要点:射程优化就是找让 sin(2θ) 最大的角度", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.2, -3.35, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
