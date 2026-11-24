# 实验 m8 竖直下抛运动 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m8 默认值
#   v0 = 5 m/s, h = 40 m, g = 9.8 m/s^2; 公式 v=v0+gt; h=v0t+(1/2)gt^2
#   落地时间 t=(sqrt(v0^2+2gh)-v0)/g (OpenStax University Physics Vol.1 §3.5, eqs 3.15-3.17)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
V0 = 5.0
H = 40.0
V_END = float(np.sqrt(V0 * V0 + 2 * G * H))   # 28.44 m/s
T_END = (V_END - V0) / G                       # 2.392 s
SCALE = 5.6 / H
TOP_Y = 2.8
GROUND_Y = TOP_Y - H * SCALE


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class DownwardThrow(Scene):
    def construct(self):
        title = cn("竖直下抛运动", 54, YELLOW, BOLD)
        sub = cn("实验 m8 · 初速度 v₀ = 5 m/s(向下) · 高度 h = 40 m · g = 9.8 m/s²", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        cliff = Rectangle(width=1.1, height=H * SCALE, fill_opacity=0.35,
                          fill_color=GREY_BROWN, stroke_color=GREY_B)
        cliff.move_to([-5.2, (TOP_Y + GROUND_Y) / 2, 0])
        ground = Line([-6.8, GROUND_Y, 0], [6.8, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 5.4)
        top_label = cn("抛出点 40 m", 22).next_to(cliff, UP, buff=0.15)
        ticks = VGroup()
        for meters in (0, 20, 40):
            y = GROUND_Y + meters * SCALE
            ticks.add(Line([-4.55, y, 0], [-4.3, y, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([-3.85, y, 0]))
        arrow = Arrow([-4.65, TOP_Y - 0.1, 0], [-4.65, TOP_Y - 0.75, 0], color=RED, buff=0.05)
        arrow_label = cn("v₀ = 5 m/s", 22, RED).move_to([-3.3, TOP_Y - 0.45, 0])
        self.play(Create(cliff), Create(ground), FadeIn(ground_label), FadeIn(top_label),
                  FadeIn(ticks), Create(arrow), FadeIn(arrow_label), run_time=1.2)

        panel_x = 1.9
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.5, 0], aligned_edge=LEFT)
        d_lab = cn("下落距离", 26).move_to([panel_x, 1.5, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v = v₀ + g·t", 26).move_to([panel_x, 0.5, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(d_lab), FadeIn(v_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def fallen(t):
            return V0 * t + 0.5 * G * t * t

        def ball_pos():
            t = tracker.get_value()
            return np.array([-4.65, TOP_Y - fallen(t) * SCALE, 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        d_num = always_redraw(lambda: VGroup(
            num(fallen(tracker.get_value()), 1), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(d_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(V0 + G * tracker.get_value(), 1), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_END) + 1e-9:
                tt = 0.5 * k
                dots.add(Dot([-4.65, TOP_Y - fallen(tt) * SCALE, 0],
                             radius=0.045, color=YELLOW, fill_opacity=0.75))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)
        note = cn("与自由落体相比:一开始就有速度,落地更快", 20, YELLOW)
        note.move_to([1.9, -0.6, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([1.9, -1.2, 0], aligned_edge=LEFT)

        self.add(ball, t_num, d_num, v_num, strobe_dots)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_END), run_time=6, rate_func=linear)
        self.wait(0.6)
        hit = cn("落地!", 30, RED, BOLD).next_to(ball, RIGHT, buff=0.35)
        self.play(FadeIn(hit), run_time=0.5)
        self.wait(0.5)
        self.play(FadeOut(hit), FadeOut(note), FadeOut(slow), run_time=0.5)

        formulas = VGroup(
            cn("下落距离  h = v₀·t + ½·g·t²", 30),
            cn("落地时间  t = (√(v₀²+2gh) − v₀)/g = 2.39 s", 30),
            cn("落地速度  v = √(v₀²+2gh) = √(25+784) = 28.4 m/s", 30),
            cn("要点:自由落体从 40 m 落地需 2.86 s,下抛只需 2.39 s", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([1.6, -1.75, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
