# 实验 m13 动能与势能转化 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m13 默认值
#   h = 30 m, m = 2 kg, g = 9.8 m/s^2; 公式 Ep=mgh; Ek=(1/2)mv^2; E=Ep+Ek=常数
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m13 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
M = 2.0
H = 30.0
E_TOT = M * G * H                    # 588 J
T_END = float(np.sqrt(2 * H / G))    # 2.4746 s
V_END = float(np.sqrt(2 * G * H))    # 24.25 m/s
SCALE = 5.6 / H
TOP_Y = 2.8
GROUND_Y = TOP_Y - H * SCALE
BAR_X = 1.6
BAR_W = 0.75
BAR_H = 4.6


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


class EnergyConversion(Scene):
    def construct(self):
        title = cn("动能与势能的转化", 54, YELLOW, BOLD)
        sub = cn("实验 m13 · 质量 m = 2 kg · 从 h = 30 m 静止下落 · 无摩擦无空气阻力", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        cliff = Rectangle(width=1.1, height=H * SCALE, fill_opacity=0.35,
                          fill_color=GREY_BROWN, stroke_color=GREY_B)
        cliff.move_to([-5.2, (TOP_Y + GROUND_Y) / 2, 0])
        ground = Line([-6.8, GROUND_Y, 0], [6.9, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 5.4)
        top_label = cn("释放点 30 m", 22).next_to(cliff, UP, buff=0.15)
        self.play(Create(cliff), Create(ground), FadeIn(ground_label), FadeIn(top_label), run_time=1.0)

        # 能量条框架
        frame_ep = Rectangle(width=BAR_W, height=BAR_H, stroke_color=BLUE, stroke_width=2)
        frame_ep.move_to([BAR_X, 0.3, 0], aligned_edge=DOWN)
        frame_ek = Rectangle(width=BAR_W, height=BAR_H, stroke_color=GREEN, stroke_width=2)
        frame_ek.move_to([BAR_X + 1.35, 0.3, 0], aligned_edge=DOWN)
        lab_ep = cn("势能 Ep", 22, BLUE).next_to(frame_ep, DOWN, buff=0.15)
        lab_ek = cn("动能 Ek", 22, GREEN).next_to(frame_ek, DOWN, buff=0.15)
        tot_lab = cn("总机械能 E = 588 J(不变)", 24, YELLOW).move_to([BAR_X + 0.7, 3.35, 0])
        self.play(Create(frame_ep), Create(frame_ek), FadeIn(lab_ep), FadeIn(lab_ek),
                  FadeIn(tot_lab), run_time=0.9)

        v_lab = cn("速度 v", 26).move_to([4.3, 2.5, 0], aligned_edge=LEFT)
        self.play(FadeIn(v_lab), run_time=0.5)

        tracker = ValueTracker(0.0)

        def state():
            t = tracker.get_value()
            fallen = 0.5 * G * t * t
            h_left = H - fallen
            ep = M * G * h_left
            ek = E_TOT - ep
            return t, fallen, ep, ek

        def ball_pos():
            _, fallen, _, _ = state()
            return np.array([-4.65, TOP_Y - fallen * SCALE, 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))

        def bar(frame, frac, color):
            h = max(frac * (BAR_H - 0.14), 0.01)
            bottom = frame.get_bottom()[1] + 0.07
            r = Rectangle(width=BAR_W - 0.1, height=h, fill_opacity=0.75,
                          fill_color=color, stroke_width=0)
            r.move_to([frame.get_center()[0], bottom + h / 2, 0])
            return r

        ep_bar = always_redraw(lambda: bar(frame_ep, state()[2] / E_TOT, BLUE))
        ek_bar = always_redraw(lambda: bar(frame_ek, state()[3] / E_TOT, GREEN))
        v_num = always_redraw(lambda: VGroup(
            num(G * tracker.get_value(), 1), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))
        slow = cn("(慢放播放)", 20, GREY_B).move_to([4.3, 1.7, 0], aligned_edge=LEFT)

        self.add(ball, ep_bar, ek_bar, v_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(T_END), run_time=6.5, rate_func=linear)
        self.wait(0.6)
        hit = cn("落地:势能全部转化为动能", 26, YELLOW, BOLD).move_to([-3.4, -3.3, 0])
        self.play(FadeIn(hit), run_time=0.6)
        self.wait(0.6)
        self.play(FadeOut(hit), FadeOut(slow), run_time=0.4)

        formulas = VGroup(
            cn("初始势能  Ep = m·g·h = 2 × 9.8 × 30 = 588 J", 30),
            cn("落地动能  Ek = 588 J,落地速度 v = √(2gh) = 24.2 m/s", 30),
            cn("任意时刻  Ep + Ek = 588 J = 常数", 30),
            cn("要点:势能减少多少,动能就增加多少", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.5, -2.2, 0])
        self.remove(ball, ep_bar, ek_bar, v_num)
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
