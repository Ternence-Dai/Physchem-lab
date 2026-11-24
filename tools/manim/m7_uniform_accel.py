# 实验 m7 匀加速直线运动 — Physchem-lab 试点动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m7 默认值
#   v0 = 0 m/s, a = 2 m/s^2, T = 5 s
#   公式 v=v0+at; x=v0 t+(1/2)at^2; v^2=v0^2+2ax
#   (OpenStax University Physics Vol.1 §3.4, eqs 3.12-3.14)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
A = 2.0
T_END = 5.0
X_END = 0.5 * A * T_END ** 2            # 25 m
V_END = A * T_END                       # 10 m/s
X0 = -6.0                               # scene x for 0 m
SCALE = 11.4 / X_END                    # 25 m -> 11.4 scene units
TRACK_Y = 0.9


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    # Pango 文本数字读数(替代走 LaTeX 的 DecimalNumber,本机无 TeX)
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)



def sx(meters):
    return X0 + meters * SCALE


class UniformAccel(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = cn("匀加速直线运动", 54, YELLOW, BOLD)
        sub = cn("实验 m7 · 初速度 v0 = 0 · 加速度 a = 2 m/s² · 观察 5 s", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        # ---------- 轨道与刻度 ----------
        track = Line([X0 - 0.3, TRACK_Y, 0], [sx(X_END) + 0.4, TRACK_Y, 0],
                     color=GREY_B, stroke_width=5)
        self.play(Create(track), run_time=0.8)
        tick_group = VGroup()
        for sec in range(6):
            meters = 0.5 * A * sec * sec
            tick_group.add(Line([sx(meters), TRACK_Y, 0], [sx(meters), TRACK_Y - 0.22, 0],
                                color=GREY_B, stroke_width=2))
            tick_group.add(cn(f"{meters:.0f} m", 17, GREY_B).move_to(
                [sx(meters), TRACK_Y - 0.55, 0]))
            tick_group.add(cn(f"{sec} s", 17, BLUE_B).move_to(
                [sx(meters), TRACK_Y + 0.95, 0]))
        start_lab = cn("出发点", 20).move_to([sx(0), TRACK_Y + 1.45, 0])
        self.play(FadeIn(tick_group), FadeIn(start_lab), run_time=1.0)

        # ---------- 读数 ----------
        tracker = ValueTracker(0.0)
        t_num = always_redraw(lambda: VGroup(
            cn("t =", 24), num(tracker.get_value(), 2),
            cn("s", 24)).arrange(RIGHT, buff=0.08).move_to([-5.9, 3.3, 0], aligned_edge=LEFT))
        x_num = always_redraw(lambda: VGroup(
            cn("位移 x =", 24), num(0.5 * A * tracker.get_value() ** 2, 1),
            cn("m", 24)).arrange(RIGHT, buff=0.08).move_to([-3.2, 3.3, 0], aligned_edge=LEFT))
        v_num = always_redraw(lambda: VGroup(
            cn("速度 v =", 24), num(A * tracker.get_value(), 1),
            cn("m/s", 24)).arrange(RIGHT, buff=0.08).move_to([0.6, 3.3, 0], aligned_edge=LEFT))

        def block():
            x = 0.5 * A * tracker.get_value() ** 2
            sq = Square(side_length=0.52, fill_color=RED, fill_opacity=0.85,
                        stroke_color=WHITE, stroke_width=2)
            sq.move_to([sx(x), TRACK_Y + 0.28, 0])
            return sq
        cart = always_redraw(block)

        # 每秒位置标记(小车经过时亮起)
        def sec_marks():
            t = tracker.get_value()
            g = VGroup()
            for sec in range(6):
                if sec <= t + 1e-9:
                    meters = 0.5 * A * sec * sec
                    g.add(Dot([sx(meters), TRACK_Y + 0.62, 0], radius=0.05, color=YELLOW))
            return g
        marks = always_redraw(sec_marks)
        note = cn("每过 1 秒,小车前进的距离越来越大:1, 3, 5, 7, 9 m", 21, YELLOW)
        note.move_to([0, -0.75, 0])
        slow = cn("(慢放播放)", 19, GREY_B).move_to([4.3, 3.3, 0], aligned_edge=LEFT)

        self.add(cart, marks, t_num, x_num, v_num)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_END), run_time=8, rate_func=linear)
        self.wait(0.8)
        self.play(FadeOut(note), FadeOut(slow), run_time=0.5)

        # ---------- v-t 图 ----------
        axes = Axes(x_range=[0, 5, 1], y_range=[0, 10, 2],
                    x_length=3.4, y_length=1.9,
                    axis_config={"color": GREY_B, "include_ticks": True,
                                 "tick_size": 0.03},
                    tips=False).move_to([-4.3, -2.2, 0])
        graph = axes.plot(lambda x: A * x, x_range=[0, T_END], color=GREEN)
        vt_lab = cn("速度-时间图:v 随 t 均匀增大,斜率 = a", 20, GREEN)
        vt_lab.next_to(axes, DOWN, buff=0.15)
        self.play(Create(axes), Create(graph), FadeIn(vt_lab), run_time=1.4)
        self.wait(0.6)

        # ---------- 公式与结论 ----------
        formulas = VGroup(
            cn("速度  v = v0 + a·t = 0 + 2×5 = 10 m/s", 27),
            cn("位移  x = v0·t + ½·a·t² = ½×2×5² = 25 m", 27),
            cn("每秒位移增量成奇数比 1 : 3 : 5 : 7 : 9", 25, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.26)
        formulas.move_to([3.1, -2.2, 0])
        self.play(Write(formulas[0]), run_time=1.0)
        self.play(Write(formulas[1]), run_time=1.1)
        self.play(FadeIn(formulas[2]), run_time=0.7)
        self.wait(2.2)
