# 实验 m2 竖直上抛运动 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m2 默认值
#   v0 = 20 m/s, g = 9.8 m/s^2; 公式 v(t)=v0-gt; y(t)=v0t-(1/2)gt^2; t_up=v0/g; H=v0^2/(2g)
#   (OpenStax University Physics Vol.1 §3.5, eqs 3.15-3.17)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
V0 = 20.0
T_UP = V0 / G                      # 2.0408 s
H_MAX = V0 * V0 / (2 * G)          # 20.408 m
T_END = 2 * T_UP                   # 4.0816 s
SCALE = 5.2 / H_MAX
GROUND_Y = -2.6
TOP_Y = GROUND_Y + H_MAX * SCALE   # 2.6


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class VerticalThrow(Scene):
    def construct(self):
        title = cn("竖直上抛运动", 54, YELLOW, BOLD)
        sub = cn("实验 m2 · 初速度 v₀ = 20 m/s · g = 9.8 m/s² · 忽略空气阻力", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground = Line([-6.8, GROUND_Y, 0], [6.8, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面(抛出点)", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 4.6)
        ticks = VGroup()
        for meters in (0, 10, 20):
            y = GROUND_Y + meters * SCALE
            ticks.add(Line([-4.55, y, 0], [-4.3, y, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([-3.8, y, 0]))
        top_line = DashedLine([-4.3, TOP_Y, 0], [-1.5, TOP_Y, 0], color=YELLOW)
        top_label = cn("最高点 20.4 m", 22, YELLOW).move_to([-0.2, TOP_Y, 0])
        self.play(Create(ground), FadeIn(ground_label), FadeIn(ticks),
                  Create(top_line), FadeIn(top_label), run_time=1.2)

        panel_x = 1.6
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.5, 0], aligned_edge=LEFT)
        y_lab = cn("高度 y", 26).move_to([panel_x, 1.5, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v = v₀ − g·t", 26).move_to([panel_x, 0.5, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(y_lab), FadeIn(v_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def height(t):
            return V0 * t - 0.5 * G * t * t

        def ball_pos():
            t = tracker.get_value()
            return np.array([-4.65, GROUND_Y + height(t) * SCALE, 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        y_num = always_redraw(lambda: VGroup(
            num(max(height(tracker.get_value()), 0.0), 1), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(y_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(V0 - G * tracker.get_value() if abs(V0 - G * tracker.get_value()) >= 0.05 else 0.0, 1), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_END) + 1e-9:
                tt = 0.5 * k
                dots.add(Dot([-4.65, GROUND_Y + height(tt) * SCALE, 0],
                             radius=0.045, color=YELLOW, fill_opacity=0.75))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)
        note = cn("上升减速、下降加速,关于最高点对称", 20, YELLOW)
        note.move_to([1.6, -0.6, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([1.6, -1.2, 0], aligned_edge=LEFT)

        self.add(ball, t_num, y_num, v_num, strobe_dots)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_UP), run_time=3.5, rate_func=linear)
        peak = cn("最高点:v = 0", 26, YELLOW, BOLD).move_to([1.6, -1.9, 0], aligned_edge=LEFT)
        self.play(FadeIn(peak), run_time=0.5)
        self.wait(0.5)
        self.play(tracker.animate.set_value(T_END), run_time=3.5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(note), FadeOut(slow), FadeOut(peak), run_time=0.5)

        formulas = VGroup(
            cn("高度  y = v₀·t − ½·g·t²", 30),
            cn("上升时间  t = v₀/g = 20 / 9.8 = 2.04 s", 30),
            cn("最大高度  H = v₀²/(2g) = 400 / 19.6 = 20.4 m", 30),
            cn("要点:回到抛出点速度大小不变,总时间 4.08 s", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([1.3, -1.75, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
