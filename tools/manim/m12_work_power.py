# 实验 m12 功与功率 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m12 默认值
#   F = 20 N, s = 10 m, t = 5 s; 公式 W=F*s; P=W/t=F*v; 平均速度 v=s/t
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m12 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
F = 20.0
S = 10.0
T_END = 5.0
V_AVG = S / T_END        # 2 m/s
W_TOT = F * S            # 200 J
P_AVG = W_TOT / T_END    # 40 W
SX = 10.6 / S
X0 = -5.6
GROUND_Y = -0.4
BLOCK_Y = GROUND_Y + 0.45


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class WorkPower(Scene):
    def construct(self):
        title = cn("功与功率", 54, YELLOW, BOLD)
        sub = cn("实验 m12 · 恒力 F = 20 N 拉动物体 · 位移 s = 10 m · 用时 t = 5 s", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground = Line([X0 - 0.6, GROUND_Y, 0], [6.9, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ticks = VGroup()
        for meters in range(0, 11, 2):
            x = X0 + meters * SX
            ticks.add(Line([x, GROUND_Y, 0], [x, GROUND_Y + 0.14, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([x, GROUND_Y - 0.35, 0]))
        self.play(Create(ground), FadeIn(ticks), run_time=1.0)

        panel_x = -6.4
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.9, 0], aligned_edge=LEFT)
        s_lab = cn("位移 s", 26).move_to([panel_x, 2.05, 0], aligned_edge=LEFT)
        w_lab = cn("力做的功 W = F·s", 26).move_to([panel_x, 1.2, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(s_lab), FadeIn(w_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def block_center():
            return np.array([X0 + V_AVG * tracker.get_value() * SX, BLOCK_Y, 0])

        block = always_redraw(lambda: Rectangle(
            width=0.95, height=0.9, fill_opacity=0.6, fill_color=BLUE_E,
            stroke_color=CYAN, stroke_width=2).move_to(block_center()))

        def f_arrow():
            c = block_center()
            return Arrow(c + np.array([0.48, 0.1, 0]), c + np.array([2.0, 0.1, 0]),
                         color=RED, buff=0.03, stroke_width=6)
        arrow = always_redraw(f_arrow)
        f_text = always_redraw(lambda: cn("F = 20 N", 22, RED, BOLD).move_to(
            block_center() + np.array([1.25, 0.55, 0])))

        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 1), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        s_num = always_redraw(lambda: VGroup(
            num(V_AVG * tracker.get_value(), 1), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(s_lab, RIGHT, buff=0.3))
        w_num = always_redraw(lambda: VGroup(
            num(F * V_AVG * tracker.get_value(), 0), cn(" J", 24)).arrange(RIGHT, buff=0.08).next_to(w_lab, RIGHT, buff=0.3))
        slow = cn("(慢放播放)", 20, GREY_B).move_to([2.2, 2.9, 0], aligned_edge=LEFT)

        self.add(block, arrow, f_text, t_num, s_num, w_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(T_END), run_time=6, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(slow), run_time=0.4)

        formulas = VGroup(
            cn("功  W = F·s = 20 × 10 = 200 J", 30),
            cn("平均功率  P = W/t = 200 / 5 = 40 W", 30),
            cn("平均速度  v = s/t = 2 m/s,也可 P = F·v = 20 × 2 = 40 W", 30),
            cn("要点:功率表示做功的快慢,同样多的功用时越短功率越大", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.5, -2.2, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
