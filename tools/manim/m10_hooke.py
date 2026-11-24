# 实验 m10 胡克定律弹簧 — Physchem-lab 讲解动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m10 默认值
#   k = 30 N/m, F = 10 N; 公式 F=kx; x=F/k; 弹性势能 E=(1/2)kx^2
#   (manifest 该实验公式核验状态为 not_yet_item_verified, 公式与仓库 catalogue m10 条目一致)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
CYAN = "#22d3ee"
K = 30.0
F_MAX = 10.0
X_MAX = F_MAX / K            # 0.3333 m
WALL_X = -5.6
NAT_LEN = 2.6                # scene units, natural length
SX = 4.4                     # scene units per meter of extension (放大显示)
SPR_Y = 1.6


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)


def spring_points(x_end, coils=9):
    pts = [np.array([WALL_X, SPR_Y, 0])]
    seg = (x_end - WALL_X) / (coils * 2)
    for i in range(1, coils * 2):
        y = SPR_Y + (0.32 if i % 2 == 1 else -0.32)
        pts.append(np.array([WALL_X + seg * i, y, 0]))
    pts.append(np.array([x_end, SPR_Y, 0]))
    return pts


class Hooke(Scene):
    def construct(self):
        title = cn("胡克定律:弹簧的伸长", 54, YELLOW, BOLD)
        sub = cn("实验 m10 · 劲度系数 k = 30 N/m · 拉力从 0 增大到 F = 10 N", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        wall = Rectangle(width=0.35, height=2.2, fill_opacity=0.5,
                         fill_color=GREY_BROWN, stroke_color=GREY_B)
        wall.move_to([WALL_X - 0.18, SPR_Y, 0])
        wall_lab = cn("墙", 20, GREY_B).next_to(wall, DOWN, buff=0.15)
        nat_mark = DashedLine([WALL_X + NAT_LEN, SPR_Y - 0.85, 0],
                              [WALL_X + NAT_LEN, SPR_Y + 0.85, 0], color=GREY_B)
        nat_lab = cn("原长位置", 20, GREY_B).move_to([WALL_X + NAT_LEN, SPR_Y + 1.15, 0])
        self.play(Create(wall), FadeIn(wall_lab), Create(nat_mark), FadeIn(nat_lab), run_time=1.0)

        panel_x = -5.6
        f_lab = cn("拉力 F", 26).move_to([panel_x, -0.6, 0], aligned_edge=LEFT)
        x_lab = cn("伸长量 x = F/k", 26).move_to([panel_x, -1.5, 0], aligned_edge=LEFT)
        self.play(FadeIn(f_lab), FadeIn(x_lab), run_time=0.7)

        tracker = ValueTracker(0.0)

        def end_x():
            return WALL_X + NAT_LEN + (tracker.get_value() / K) * SX

        spring = always_redraw(lambda: VMobject().set_points_as_corners(
            spring_points(end_x())).set_color(CYAN).set_stroke(width=3.5))
        block = always_redraw(lambda: Rectangle(
            width=0.7, height=0.9, fill_opacity=0.6, fill_color=BLUE_E,
            stroke_color=CYAN).move_to([end_x() + 0.35, SPR_Y, 0]))

        def pull_arrow():
            bx = end_x() + 0.7
            return Arrow([bx, SPR_Y, 0], [bx + 0.5 + tracker.get_value() * 0.11, SPR_Y, 0],
                         color=RED, buff=0.03, stroke_width=6)
        arrow = always_redraw(pull_arrow)

        f_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 1), cn(" N", 24)).arrange(RIGHT, buff=0.08).next_to(f_lab, RIGHT, buff=0.3))
        x_num = always_redraw(lambda: VGroup(
            num(tracker.get_value() / K, 3), cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(x_lab, RIGHT, buff=0.3))

        note = cn("伸长量示意按比例放大;读数为真实数值", 20, GREY_B)
        note.move_to([1.3, -0.6, 0], aligned_edge=LEFT)

        self.add(spring, block, arrow, f_num, x_num)
        self.play(FadeIn(note), run_time=0.4)
        self.play(tracker.animate.set_value(F_MAX), run_time=6, rate_func=linear)
        self.wait(0.6)

        marks = VGroup()
        for fv in (0, 5, 10):
            xv = fv / K
            marks.add(cn(f"F = {fv} N → x = {xv:.2f} m", 24, YELLOW).move_to(
                [1.3, -1.2 - 0.55 * (fv // 5), 0], aligned_edge=LEFT))
        self.play(FadeIn(marks), run_time=1.0)
        self.wait(0.5)
        self.play(FadeOut(note), run_time=0.4)

        self.remove(f_num, x_num)
        self.play(FadeOut(f_lab), FadeOut(x_lab), run_time=0.4)
        formulas = VGroup(
            cn("胡克定律  F = k·x(在弹性限度内)", 30),
            cn("伸长量  x = F/k = 10 / 30 = 0.33 m", 30),
            cn("弹性势能  E = ½·k·x² = ½ × 30 × 0.33² = 1.67 J", 30),
            cn("要点:F 与 x 成正比,图像是一条过原点的直线", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        formulas.move_to([-0.9, -2.7, 0])
        for f in formulas:
            self.play(Write(f) if f is not formulas[-1] else FadeIn(f), run_time=1.0)
        self.wait(2.2)
