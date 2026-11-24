# 实验 m9 简谐运动(SHM) — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m9 默认值
#   A = 1 m, omega = 2 rad/s; 公式 x=A*sin(omega*t); v=A*omega*cos(omega*t);
#   a=-A*omega^2*sin(omega*t); T=2*pi/omega
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m9 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
A = 1.0
W = 2.0
PERIOD = 2 * np.pi / W        # 3.1416 s
VMAX = A * W                  # 2 m/s
AMAX = A * W * W              # 4 m/s^2
SCALE = 2.3                   # 1 m -> 2.3 units
TRACK_Y = 1.7
GRAPH_Y = -1.6
GRAPH_X0 = -5.2
GRAPH_SX = 9.4 / (2 * PERIOD)  # two periods across


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class SHM(Scene):
    def construct(self):
        title = cn("简谐运动 (SHM)", 54, YELLOW, BOLD)
        sub = cn("实验 m9 · 振幅 A = 1 m · 角频率 ω = 2 rad/s · 周期 T = 2π/ω = 3.14 s", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        track = Line([-3.4, TRACK_Y, 0], [3.4, TRACK_Y, 0], color=GREY_B, stroke_width=4)
        eq = DashedLine([0, TRACK_Y - 0.55, 0], [0, TRACK_Y + 0.55, 0], color=GREY_B)
        eq_lab = cn("平衡位置", 20, GREY_B).move_to([0, TRACK_Y + 0.85, 0])
        a_lab_l = cn("−A", 20, GREY_B).move_to([-SCALE, TRACK_Y + 0.85, 0])
        a_lab_r = cn("+A", 20, GREY_B).move_to([SCALE, TRACK_Y + 0.85, 0])
        axes = VGroup(
            Line([GRAPH_X0, GRAPH_Y - 1.1, 0], [GRAPH_X0, GRAPH_Y + 1.1, 0], color=GREY_B, stroke_width=2),
            Line([GRAPH_X0, GRAPH_Y, 0], [GRAPH_X0 + 2 * PERIOD * GRAPH_SX, GRAPH_Y, 0], color=GREY_B, stroke_width=2),
        )
        graph_lab = cn("位移-时间图 x(t) = A·sin(ωt)", 22, GREY_B).move_to([GRAPH_X0 + 2.2, GRAPH_Y + 1.45, 0])
        self.play(Create(track), Create(eq), FadeIn(eq_lab), FadeIn(a_lab_l), FadeIn(a_lab_r),
                  Create(axes), FadeIn(graph_lab), run_time=1.2)

        panel_x = 4.1
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.6, 0], aligned_edge=LEFT)
        x_lab = cn("位移 x", 26).move_to([panel_x, 1.7, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v", 26).move_to([panel_x, 0.8, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(x_lab), FadeIn(v_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def x_of(t):
            return A * np.sin(W * t)

        ball = always_redraw(lambda: Dot(
            [x_of(tracker.get_value()) * SCALE, TRACK_Y, 0], radius=0.12, color=RED))

        def curve():
            t = tracker.get_value()
            n = max(2, int(120 * t / (2 * PERIOD)))
            pts = [np.array([GRAPH_X0 + tt * GRAPH_SX,
                             GRAPH_Y + x_of(tt) * 0.95, 0])
                   for tt in np.linspace(0, t, n)]
            return VMobject().set_points_as_corners(pts).set_color(CYAN).set_stroke(width=3)
        wave = always_redraw(curve)

        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(x_of(tracker.get_value()) if abs(x_of(tracker.get_value())) >= 0.005 else 0.0, 2), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(A * W * np.cos(W * tracker.get_value()), 2),
            cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))
        slow = cn("(慢放播放,共 2 个周期)", 20, GREY_B).move_to([4.1, -0.2, 0], aligned_edge=LEFT)

        self.add(ball, wave, t_num, x_num, v_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(2 * PERIOD), run_time=9, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(slow), run_time=0.5)

        formulas = VGroup(
            cn("位移  x = A·sin(ωt)   速度  v = Aω·cos(ωt)", 30),
            cn("最大速度  v_max = Aω = 2 m/s(在平衡位置)", 30),
            cn("最大加速度  a_max = Aω² = 4 m/s²(在最大位移处)", 30),
            cn("要点:位移最大时速度为零,过平衡位置时速度最大", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.6, -3.3, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
