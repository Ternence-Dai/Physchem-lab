# 实验 m3 圆周运动与向心力 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m3 默认值
#   v = 5 m/s, r = 1 m; 公式 ac=v^2/r; T=2*pi*r/v; omega=v/r
#   (OpenStax University Physics Vol.1 §4.4, eqs 4.27-4.30)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
V = 5.0
R = 1.0
OMEGA = V / R                 # 5 rad/s
AC = V * V / R                # 25 m/s^2
PERIOD = 2 * np.pi * R / V    # 1.2566 s
CENTER = np.array([-2.6, 0.1, 0])
RAD = 2.3                     # scene radius


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class CircularMotion(Scene):
    def construct(self):
        title = cn("圆周运动与向心力", 54, YELLOW, BOLD)
        sub = cn("实验 m3 · 线速度 v = 5 m/s · 半径 r = 1 m · 匀速圆周运动", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        circle = Circle(radius=RAD, color=GREY_B, stroke_width=3).move_to(CENTER)
        center_dot = Dot(CENTER, radius=0.06, color=WHITE)
        center_lab = cn("圆心", 20, GREY_B).next_to(center_dot, DOWN, buff=0.15)
        r_lab = cn("r = 1 m", 22).move_to(CENTER + np.array([RAD / 2, 0.35, 0]))
        self.play(Create(circle), FadeIn(center_dot), FadeIn(center_lab), FadeIn(r_lab), run_time=1.0)

        panel_x = 1.5
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.5, 0], aligned_edge=LEFT)
        v_lab = cn("线速度 v", 26).move_to([panel_x, 1.6, 0], aligned_edge=LEFT)
        a_lab = cn("向心加速度 a = v²/r", 26).move_to([panel_x, 0.7, 0], aligned_edge=LEFT)
        w_lab = cn("角速度 ω = v/r", 26).move_to([panel_x, -0.2, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(v_lab), FadeIn(a_lab), FadeIn(w_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def ang():
            return OMEGA * tracker.get_value()

        def ball_pos():
            return CENTER + RAD * np.array([np.cos(ang()), np.sin(ang()), 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))
        radius_line = always_redraw(lambda: Line(CENTER, ball_pos(), color=GREY_B, stroke_width=2))

        def varrow():
            p = ball_pos()
            tangent = np.array([-np.sin(ang()), np.cos(ang()), 0])
            return Arrow(p, p + tangent * 1.1, color=GREEN, buff=0.05, stroke_width=5)

        def aarrow():
            p = ball_pos()
            inward = (CENTER - p) / RAD
            return Arrow(p, p + inward * 1.1, color=ORANGE, buff=0.05, stroke_width=5)

        vel_arrow = always_redraw(varrow)
        acc_arrow = always_redraw(aarrow)
        vel_lab = always_redraw(lambda: cn("v", 24, GREEN, BOLD).next_to(ball, RIGHT, buff=0.55).shift(UP * 0.55))
        acc_lab = always_redraw(lambda: cn("a", 24, ORANGE, BOLD).next_to(ball, LEFT, buff=0.55).shift(DOWN * 0.5))

        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2), cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        v_num = VGroup(num(V, 0), cn(" m/s(大小不变)", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3)
        a_num = VGroup(num(AC, 0), cn(" m/s²", 24)).arrange(RIGHT, buff=0.08).next_to(a_lab, RIGHT, buff=0.3)
        w_num = VGroup(num(OMEGA, 0), cn(" rad/s", 24)).arrange(RIGHT, buff=0.08).next_to(w_lab, RIGHT, buff=0.3)

        note = cn("速度沿切线、加速度指向圆心,方向都在变", 20, YELLOW)
        note.move_to([1.5, -1.2, 0], aligned_edge=LEFT)
        slow = cn("(慢放播放,共转 2 圈)", 20, GREY_B).move_to([1.5, -1.8, 0], aligned_edge=LEFT)

        self.add(radius_line, ball, vel_arrow, acc_arrow, vel_lab, acc_lab,
                 t_num, v_num, a_num, w_num)
        self.play(FadeIn(note), FadeIn(slow), run_time=0.5)
        self.play(tracker.animate.set_value(2 * PERIOD), run_time=7, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(note), FadeOut(slow), run_time=0.5)

        formulas = VGroup(
            cn("向心加速度  a = v²/r = 25/1 = 25 m/s²", 30),
            cn("周期  T = 2πr/v = 2π/5 = 1.26 s", 30),
            cn("向心力  F = m·a:绳子/引力等指向圆心的力提供", 30),
            cn("要点:速度大小不变,但方向时刻改变,所以有加速度", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([1.2, -2.5, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
