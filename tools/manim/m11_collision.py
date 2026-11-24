# 实验 m11 动量守恒碰撞 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m11 默认值
#   m1 = 1 kg, v1 = 5 m/s, m2 = 2 kg, v2 = 0 m/s
#   公式: m1v1+m2v2 = m1v1'+m2v2'; 完全非弹性 v'=(m1v1+m2v2)/(m1+m2); 弹性碰撞动能守恒
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m11 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
M1, V1 = 1.0, 5.0
M2, V2 = 2.0, 0.0
P_TOT = M1 * V1 + M2 * V2            # 5 kg·m/s
KE0 = 0.5 * M1 * V1 ** 2             # 12.5 J
V_STICK = P_TOT / (M1 + M2)          # 1.6667 m/s
V1_EL = (M1 - M2) / (M1 + M2) * V1   # -1.6667 m/s
V2_EL = 2 * M1 / (M1 + M2) * V1      # 3.3333 m/s
KE_EL = 0.5 * M1 * V1_EL ** 2 + 0.5 * M2 * V2_EL ** 2   # 12.5 J
KE_STICK = 0.5 * (M1 + M2) * V_STICK ** 2               # 4.17 J
SV = 0.62                            # scene units per (m/s) for travel scaling
TRACK_Y = 0.6
C2_X = 2.2                           # cart2 initial center


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def cart(width, color, label):
    body = Rectangle(width=width, height=0.62, fill_opacity=0.65,
                     fill_color=color, stroke_color=WHITE, stroke_width=2)
    lab = cn(label, 22, WHITE, BOLD).move_to(body.get_center())
    return VGroup(body, lab)


class Collision(Scene):
    def cart_pair(self, y=TRACK_Y):
        c1 = cart(0.9, BLUE_E, "1 kg")
        c2 = cart(1.5, RED_E, "2 kg")
        c1.move_to([-5.6, y, 0])
        c2.move_to([C2_X, y, 0])
        return c1, c2

    def construct(self):
        title = cn("动量守恒碰撞", 54, YELLOW, BOLD)
        sub = cn("实验 m11 · 小车1:1 kg 以 5 m/s 撞向静止的小车2:2 kg · 光滑水平面", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        ground = Line([-6.9, TRACK_Y - 0.33, 0], [6.9, TRACK_Y - 0.33, 0], color=GREY_B, stroke_width=4)
        p_lab = cn("系统总动量 p = m₁v₁ + m₂v₂ = 5 kg·m/s(碰撞前后不变)", 26, YELLOW)
        p_lab.move_to([-6.6, 2.9, 0], aligned_edge=LEFT)
        self.play(Create(ground), FadeIn(p_lab), run_time=0.9)

        # ---------- 第一幕:完全非弹性(粘连) ----------
        act1 = cn("情形一:完全非弹性碰撞(撞后粘在一起)", 30, CYAN, BOLD)
        act1.move_to([-6.6, 2.0, 0], aligned_edge=LEFT)
        c1, c2 = self.cart_pair()
        varr = Arrow(c1.get_right() + np.array([0.05, 0, 0]), c1.get_right() + np.array([1.15, 0, 0]),
                     color=GREEN, buff=0.03, stroke_width=6)
        vlab = cn("5 m/s", 22, GREEN).next_to(varr, UP, buff=0.1)
        self.play(FadeIn(act1), FadeIn(c1), FadeIn(c2), Create(varr), FadeIn(vlab), run_time=1.0)
        gap = (C2_X - 0.75) - (-5.6 + 0.45)
        self.play(c1.animate.shift(RIGHT * gap), varr.animate.shift(RIGHT * gap),
                  vlab.animate.shift(RIGHT * gap), run_time=1.6, rate_func=linear)
        self.play(FadeOut(varr), FadeOut(vlab), run_time=0.3)
        both = VGroup(c1, c2)
        res1 = cn("粘连后共同速度 v′ = 5 / (1+2) = 1.67 m/s", 26, YELLOW)
        res1.move_to([-6.6, -0.7, 0], aligned_edge=LEFT)
        ke1 = cn("动能:12.5 J → 4.17 J(减少,转化为内能等)", 24, GREY_B)
        ke1.move_to([-6.6, -1.35, 0], aligned_edge=LEFT)
        self.play(both.animate.shift(RIGHT * V_STICK * SV * 1.6), run_time=1.6, rate_func=linear)
        self.play(FadeIn(res1), FadeIn(ke1), run_time=0.8)
        self.wait(0.8)
        self.play(FadeOut(both), FadeOut(act1), FadeOut(res1), FadeOut(ke1), run_time=0.6)

        # ---------- 第二幕:弹性碰撞 ----------
        act2 = cn("情形二:弹性碰撞(动量与动能都守恒)", 30, CYAN, BOLD)
        act2.move_to([-6.6, 2.0, 0], aligned_edge=LEFT)
        c1, c2 = self.cart_pair()
        varr = Arrow(c1.get_right() + np.array([0.05, 0, 0]), c1.get_right() + np.array([1.15, 0, 0]),
                     color=GREEN, buff=0.03, stroke_width=6)
        vlab = cn("5 m/s", 22, GREEN).next_to(varr, UP, buff=0.1)
        self.play(FadeIn(act2), FadeIn(c1), FadeIn(c2), Create(varr), FadeIn(vlab), run_time=1.0)
        self.play(c1.animate.shift(RIGHT * gap), varr.animate.shift(RIGHT * gap),
                  vlab.animate.shift(RIGHT * gap), run_time=1.6, rate_func=linear)
        self.play(FadeOut(varr), FadeOut(vlab), run_time=0.3)
        res2 = cn("碰后:小车1 反弹 −1.67 m/s,小车2 以 3.33 m/s 前进", 26, YELLOW)
        res2.move_to([-6.6, -0.7, 0], aligned_edge=LEFT)
        ke2 = cn("动能:12.5 J → 12.5 J(不变)", 24, GREY_B)
        ke2.move_to([-6.6, -1.35, 0], aligned_edge=LEFT)
        self.play(c1.animate.shift(LEFT * 1.4), c2.animate.shift(RIGHT * 2.8),
                  run_time=1.6, rate_func=linear)
        self.play(FadeIn(res2), FadeIn(ke2), run_time=0.8)
        self.wait(0.8)
        self.play(FadeOut(VGroup(c1, c2)), FadeOut(act2), FadeOut(res2), FadeOut(ke2),
                  FadeOut(p_lab), run_time=0.6)

        formulas = VGroup(
            cn("动量守恒  m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′(无外力时)", 30),
            cn("完全非弹性:v′ = (m₁v₁+m₂v₂)/(m₁+m₂),动能损失最大", 30),
            cn("弹性碰撞:动量与动能同时守恒", 30),
            cn("要点:动量是矢量,反弹速度取负号", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.9, -1.9, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
