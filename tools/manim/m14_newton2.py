# 实验 m14 牛顿第二定律 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m14 默认值
#   F = 20 N, m = 5 kg, v0 = 0 m/s; 公式 F=m*a; a=F/m; v=v0+at; x=v0t+(1/2)at^2
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m14 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
F = 20.0
M = 5.0
A = F / M              # 4 m/s^2
T_SHOW = 4.0           # 展示到 t=4 s: v=16 m/s, x=32 m
X_END = 0.5 * A * T_SHOW ** 2   # 32 m
SX = 10.6 / X_END
X0 = -5.6
GROUND_Y = -0.4
BLOCK_Y = GROUND_Y + 0.45


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class Newton2(Scene):
    def construct(self):
        title = cn("牛顿第二定律", 54, YELLOW, BOLD)
        sub = cn("实验 m14 · 合力 F = 20 N · 质量 m = 5 kg · 初速度 v₀ = 0 · 光滑水平面", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground = Line([X0 - 0.6, GROUND_Y, 0], [6.9, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ticks = VGroup()
        for meters in range(0, 33, 8):
            x = X0 + meters * SX
            ticks.add(Line([x, GROUND_Y, 0], [x, GROUND_Y + 0.14, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([x, GROUND_Y - 0.35, 0]))
        self.play(Create(ground), FadeIn(ticks), run_time=1.0)

        panel_x = -6.4
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.9, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v = a·t", 26).move_to([panel_x, 2.05, 0], aligned_edge=LEFT)
        x_lab = cn("位移 x = ½·a·t²", 26).move_to([panel_x, 1.2, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(v_lab), FadeIn(x_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def block_center():
            t = tracker.get_value()
            return np.array([X0 + 0.5 * A * t * t * SX, BLOCK_Y, 0])

        block = always_redraw(lambda: Rectangle(
            width=0.95, height=0.9, fill_opacity=0.6, fill_color=BLUE_E,
            stroke_color=CYAN, stroke_width=2).move_to(block_center()))
        block_lab = always_redraw(lambda: cn("5 kg", 22, WHITE, BOLD).move_to(block_center()))

        def f_arrow():
            c = block_center()
            return Arrow(c + np.array([0.48, 0.1, 0]), c + np.array([1.9, 0.1, 0]),
                         color=RED, buff=0.03, stroke_width=6)
        arrow = always_redraw(f_arrow)
        f_text = always_redraw(lambda: cn("F = 20 N", 22, RED, BOLD).move_to(
            block_center() + np.array([1.2, 0.55, 0])))

        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_SHOW) + 1e-9:
                tt = 0.5 * k
                dots.add(Dot([X0 + 0.5 * A * tt * tt * SX, BLOCK_Y - 0.75, 0],
                             radius=0.045, color=YELLOW, fill_opacity=0.75))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)

        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 1), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(A * tracker.get_value(), 1), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(0.5 * A * tracker.get_value() ** 2, 1), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        note = cn("黄点:每隔 0.5 s 的位置,间距越来越大", 20, YELLOW)
        note.move_to([1.6, 2.9, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放)", 20, GREY_B).move_to([1.6, 2.3, 0], aligned_edge=LEFT)

        self.add(block, block_lab, arrow, f_text, strobe_dots, t_num, v_num, x_num)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(T_SHOW), run_time=6.5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(note), FadeOut(slow), run_time=0.4)

        formulas = VGroup(
            cn("加速度  a = F/m = 20 / 5 = 4 m/s²", 30),
            cn("t = 4 s 时:v = a·t = 16 m/s,x = ½·a·t² = 32 m", 30),
            cn("要点:力越大加速度越大;质量越大,同样力下加速度越小", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.6, -2.2, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
