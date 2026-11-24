# 实验 m6 匀速直线运动 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m6 默认值
#   v = 10 m/s, L = 100 m; 公式 x=vt; t=L/v (OpenStax University Physics Vol.1 §3.4, a=0)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
V = 10.0
L = 100.0
T_END = L / V          # 10 s
SX = 11.6 / L
X0 = -5.8
TRACK_Y = 0.9


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class UniformMotion(Scene):
    def construct(self):
        title = cn("匀速直线运动", 54, YELLOW, BOLD)
        sub = cn("实验 m6 · 速度 v = 10 m/s · 路程 L = 100 m · 速度大小方向都不变", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        track = Line([X0, TRACK_Y, 0], [X0 + L * SX, TRACK_Y, 0], color=GREY_B, stroke_width=4)
        ticks = VGroup()
        for meters in range(0, 101, 20):
            x = X0 + meters * SX
            ticks.add(Line([x, TRACK_Y - 0.12, 0], [x, TRACK_Y + 0.12, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([x, TRACK_Y + 0.42, 0]))
        self.play(Create(track), FadeIn(ticks), run_time=1.0)

        panel_x = -5.8
        t_lab = cn("时间 t", 26).move_to([panel_x, -0.5, 0], aligned_edge=LEFT)
        x_lab = cn("位移 x = v·t", 26).move_to([panel_x, -1.4, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v", 26).move_to([panel_x, -2.3, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(x_lab), FadeIn(v_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def ball_pos():
            return np.array([X0 + V * tracker.get_value() * SX, TRACK_Y, 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 1), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(V * tracker.get_value(), 0), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        v_num = VGroup(num(V, 0), cn(" m/s(不变)", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3)

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while k <= min(t, T_END) + 1e-9:
                dots.add(Dot([X0 + V * k * SX, TRACK_Y, 0], radius=0.05, color=YELLOW, fill_opacity=0.8))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)
        note = cn("黄点:每隔 1 s 的位置,间距完全相等", 20, YELLOW)
        note.move_to([1.2, -0.5, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([1.2, -1.1, 0], aligned_edge=LEFT)

        self.add(ball, t_num, x_num, v_num, strobe_dots)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_END), run_time=8, rate_func=linear)
        self.wait(0.6)
        fin = cn("到达 100 m!", 28, RED, BOLD).move_to([1.2, -1.9, 0], aligned_edge=LEFT)
        self.play(FadeIn(fin), run_time=0.5)
        self.wait(0.5)
        self.play(FadeOut(note), FadeOut(slow), FadeOut(fin), FadeOut(t_lab), FadeOut(x_lab),
                  FadeOut(v_lab), FadeOut(t_num), FadeOut(x_num), FadeOut(v_num), run_time=0.5)

        formulas = VGroup(
            cn("位移  x = v·t", 30),
            cn("全程时间  t = L/v = 100 / 10 = 10 s", 30),
            cn("要点:相等时间内位移相等,频闪点等间距", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-5.8, -1.7, 0], aligned_edge=LEFT)
        self.play(Write(formulas[0]), run_time=0.9)
        self.play(Write(formulas[1]), run_time=1.0)
        self.play(FadeIn(formulas[2]), run_time=0.8)
        self.wait(2.2)
