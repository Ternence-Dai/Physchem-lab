# 实验 p3 弹簧振子与能量转化 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 p3 默认值
#   m = 1 kg, k = 30 N/m; 初始位移 x0 = 0.6 m, v0 = 0 取自仓库 catalogue p3 条目 init
#   公式: F=-kx; omega=sqrt(k/m); T=2*pi*sqrt(m/k); E=(1/2)mv^2+(1/2)kx^2=常数
#   (OpenStax University Physics Vol.1 §15.1, §15.2)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
M = 1.0
K = 30.0
X0 = 0.6                                # m, 仓库 init 初条件
W = float(np.sqrt(K / M))               # 5.4772 rad/s
PERIOD = 2 * np.pi / W                  # 1.1471 s
VMAX = X0 * W                           # 3.286 m/s
E_TOT = 0.5 * K * X0 ** 2               # 5.4 J
WALL_X = -5.9
EQ_X = -1.2                             # equilibrium scene x
SX = 3.4                                # scene units per meter
SPR_Y = 1.5
BAR_X = 2.6
BAR_W = 0.75
BAR_H = 3.9


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def spring_points(x_end, coils=10):
    pts = [np.array([WALL_X, SPR_Y, 0])]
    seg = (x_end - WALL_X) / (coils * 2)
    for i in range(1, coils * 2):
        y = SPR_Y + (0.3 if i % 2 == 1 else -0.3)
        pts.append(np.array([WALL_X + seg * i, y, 0]))
    pts.append(np.array([x_end, SPR_Y, 0]))
    return pts


class SpringOscillator(Scene):
    def construct(self):
        title = cn("弹簧振子与能量转化", 54, YELLOW, BOLD)
        sub = cn("实验 p3 · 质量 m = 1 kg · 劲度系数 k = 30 N/m · 从 x = 0.6 m 静止释放", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        wall = Rectangle(width=0.35, height=2.4, fill_opacity=0.5,
                         fill_color=GREY_BROWN, stroke_color=GREY_B)
        wall.move_to([WALL_X - 0.18, SPR_Y, 0])
        ground = Line([WALL_X - 0.4, SPR_Y - 0.75, 0], [3.4, SPR_Y - 0.75, 0],
                      color=GREY_B, stroke_width=3)
        eq_line = DashedLine([EQ_X, SPR_Y - 1.15, 0], [EQ_X, SPR_Y + 1.15, 0], color=GREY_B)
        eq_lab = cn("平衡位置", 20, GREY_B).move_to([EQ_X, SPR_Y + 1.5, 0])
        self.play(Create(wall), Create(ground), Create(eq_line), FadeIn(eq_lab), run_time=1.0)

        frame_ek = Rectangle(width=BAR_W, height=BAR_H, stroke_color=GREEN, stroke_width=2)
        frame_ek.move_to([BAR_X, -0.4, 0], aligned_edge=DOWN)
        frame_ep = Rectangle(width=BAR_W, height=BAR_H, stroke_color=BLUE, stroke_width=2)
        frame_ep.move_to([BAR_X + 1.35, -0.4, 0], aligned_edge=DOWN)
        lab_ek = cn("动能", 22, GREEN).next_to(frame_ek, DOWN, buff=0.15)
        lab_ep = cn("弹性势能", 22, BLUE).next_to(frame_ep, DOWN, buff=0.15)
        tot_lab = cn("总能量 E = 5.4 J(不变)", 24, YELLOW).move_to([BAR_X + 0.68, 3.1, 0])
        x_lab = cn("位移 x", 26).move_to([-5.9, -1.9, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v", 26).move_to([-5.9, -2.75, 0], aligned_edge=LEFT)
        self.play(Create(frame_ek), Create(frame_ep), FadeIn(lab_ek), FadeIn(lab_ep),
                  FadeIn(tot_lab), FadeIn(x_lab), FadeIn(v_lab), run_time=0.9)

        tracker = ValueTracker(0.0)

        def x_of(t):
            return X0 * np.cos(W * t)

        def v_of(t):
            return -X0 * W * np.sin(W * t)

        def block_left():
            return EQ_X + x_of(tracker.get_value()) * SX - 0.45

        spring = always_redraw(lambda: VMobject().set_points_as_corners(
            spring_points(block_left())).set_color(CYAN).set_stroke(width=3.5))
        block = always_redraw(lambda: Rectangle(
            width=0.9, height=0.85, fill_opacity=0.6, fill_color=BLUE_E,
            stroke_color=CYAN, stroke_width=2).move_to([block_left() + 0.45, SPR_Y, 0]))
        block_lab = always_redraw(lambda: cn("1 kg", 22, WHITE, BOLD).move_to(
            [block_left() + 0.45, SPR_Y, 0]))

        def bar(frame, frac, color):
            h = max(frac * (BAR_H - 0.14), 0.01)
            bottom = frame.get_bottom()[1] + 0.07
            r = Rectangle(width=BAR_W - 0.1, height=h, fill_opacity=0.75,
                          fill_color=color, stroke_width=0)
            r.move_to([frame.get_center()[0], bottom + h / 2, 0])
            return r

        ek_bar = always_redraw(lambda: bar(frame_ek, (0.5 * M * v_of(tracker.get_value()) ** 2) / E_TOT, GREEN))
        ep_bar = always_redraw(lambda: bar(frame_ep, (0.5 * K * x_of(tracker.get_value()) ** 2) / E_TOT, BLUE))
        x_num = always_redraw(lambda: VGroup(
            num(x_of(tracker.get_value()), 2), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(v_of(tracker.get_value()), 2), cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))
        slow = cn("(慢放播放,共 3 个周期)", 20, GREY_B).move_to([-5.9, 3.0, 0], aligned_edge=LEFT)

        self.add(spring, block, block_lab, ek_bar, ep_bar, x_num, v_num)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(3 * PERIOD), run_time=9, rate_func=linear)
        self.wait(0.6)
        self.play(FadeOut(slow), run_time=0.4)

        formulas = VGroup(
            cn("角频率  ω = √(k/m) = √30 = 5.48 rad/s", 30),
            cn("周期  T = 2π√(m/k) = 1.15 s", 30),
            cn("能量  E = ½·k·x₀² = ½ × 30 × 0.6² = 5.4 J,动能与势能此消彼长", 30),
            cn("要点:最大位移处只有势能,平衡位置只有动能(最大 3.29 m/s)", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([-1.15, -2.5, 0])
        self.remove(spring, block, block_lab, ek_bar, ep_bar, x_num, v_num)
        self.play(FadeOut(x_lab), FadeOut(v_lab), run_time=0.4)
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
