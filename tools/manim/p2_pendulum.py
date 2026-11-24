# 实验 p2 单摆与简谐振动 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 p2 默认值
#   L = 1 m, g = 9.8 m/s^2, b = 0 s^-1(无阻尼)
#   初始角 th0 = 0.17 rad 取自仓库 catalogue p2 条目 init(与网页动画同一初条件)
#   公式: theta''=-(g/L)sin(theta); 小角度近似 T0=2*pi*sqrt(L/g); omega0=sqrt(g/L)
#   (OpenStax University Physics Vol.1 §15.4 eqs 15.17-15.19; §15.1)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
L = 1.0
G = 9.8
TH0 = 0.17                              # rad, 仓库 init 初条件
W0 = float(np.sqrt(G / L))              # 3.1305 rad/s
T0 = 2 * np.pi / W0                     # 2.0071 s
PIVOT = np.array([-2.4, 2.9, 0])
LEN = 3.6                               # scene units for L=1 m


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def theta(t):
    # b=0 且角度小, 用精确周期近似的简谐解(振幅 0.17 rad, 非线性修正 <0.2%)
    return TH0 * np.cos(W0 * t)


class Pendulum(Scene):
    def construct(self):
        title = cn("单摆与简谐振动", 54, YELLOW, BOLD)
        sub = cn("实验 p2 · 摆长 L = 1 m · g = 9.8 m/s² · 无阻尼 · 释放角 0.17 rad", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        support = Rectangle(width=2.4, height=0.28, fill_opacity=0.5,
                            fill_color=GREY_BROWN, stroke_color=GREY_B)
        support.move_to(PIVOT + np.array([0, 0.14, 0]))
        vdash = DashedLine(PIVOT, PIVOT + np.array([0, -LEN - 0.5, 0]), color=GREY_B)
        arc_pts = [PIVOT + LEN * np.array([np.sin(a), -np.cos(a), 0])
                   for a in np.linspace(-TH0, TH0, 25)]
        arc = VMobject().set_points_as_corners(arc_pts).set_color(GREY_B).set_stroke(width=2)
        self.play(Create(support), Create(vdash), Create(arc), run_time=1.0)

        panel_x = 1.6
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.6, 0], aligned_edge=LEFT)
        th_lab = cn("摆角 θ", 26).move_to([panel_x, 1.7, 0], aligned_edge=LEFT)
        per_lab = cn("周期 T₀(小角度近似)", 26).move_to([panel_x, 0.8, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(th_lab), FadeIn(per_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def bob_pos():
            th = theta(tracker.get_value())
            return PIVOT + LEN * np.array([np.sin(th), -np.cos(th), 0])

        rod = always_redraw(lambda: Line(PIVOT, bob_pos(), color=GREY_B, stroke_width=3))
        bob = always_redraw(lambda: Dot(bob_pos(), radius=0.14, color=RED))
        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        th_num = always_redraw(lambda: VGroup(
            num(theta(tracker.get_value()), 2), cn(" rad", 24)).arrange(RIGHT, buff=0.08).next_to(th_lab, RIGHT, buff=0.3))
        per_num = VGroup(num(T0, 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(per_lab, RIGHT, buff=0.3)
        slow = cn("(慢放播放,共 2 个周期)", 20, GREY_B).move_to([1.6, -0.1, 0], aligned_edge=LEFT)

        self.add(rod, bob, t_num, th_num, per_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(2 * T0), run_time=8.5, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(slow), run_time=0.4)

        formulas = VGroup(
            cn("运动方程  θ″ = −(g/L)·sinθ", 30),
            cn("小角度近似 sinθ ≈ θ → 简谐运动", 30),
            cn("周期  T₀ = 2π√(L/g) = 2π√(1/9.8) = 2.01 s(与摆角无关)", 30),
            cn("要点:周期只取决于摆长与 g,摆长越长周期越大", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-0.7, -2.6, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
