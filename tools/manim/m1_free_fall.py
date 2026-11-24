# 实验 m1 自由落体运动 — Physchem-lab 试点动画
# 参数出处: Physchem-lab data/experiment-evidence-manifest.json 实验 m1 默认值
#   h = 45 m, g = 9.8 m/s^2; 公式 v=gt; h=(1/2)gt^2; t=sqrt(2h/g); v=sqrt(2gh)
#   (OpenStax University Physics Vol.1 §3.5, eqs 3.15-3.17)
# 渲染: Manim Community Edition, 字体 Noto Sans CJK SC
from manim import *
import numpy as np

FONT = "Noto Sans CJK SC"
G = 9.8
H = 45.0
T_END = float(np.sqrt(2 * H / G))      # 3.0305 s
V_END = float(np.sqrt(2 * G * H))      # 29.6985 m/s
SCALE = 5.6 / H                        # 45 m -> 5.6 scene units
TOP_Y = 2.8
GROUND_Y = TOP_Y - H * SCALE           # -2.8


def cn(text, size=28, color=WHITE, weight=NORMAL):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def num(value, digits=1, size=30, color=WHITE):
    # Pango 文本数字读数(替代走 LaTeX 的 DecimalNumber,本机无 TeX)
    return Text(f"{value:.{digits}f}", font=FONT, font_size=size, color=color)



class FreeFall(Scene):
    def construct(self):
        # ---------- 标题 ----------
        title = cn("自由落体运动", 54, YELLOW, BOLD)
        sub = cn("实验 m1 · 初始高度 h = 45 m · g = 9.8 m/s² · 忽略空气阻力", 26)
        sub.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(sub), run_time=1.6)
        self.wait(0.8)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.6)

        # ---------- 场景: 高塔 + 地面 + 高度标尺 ----------
        cliff = Rectangle(width=1.1, height=H * SCALE, fill_opacity=0.35,
                          fill_color=GREY_BROWN, stroke_color=GREY_B)
        cliff.move_to([-5.2, (TOP_Y + GROUND_Y) / 2, 0])
        ground = Line([-6.8, GROUND_Y, 0], [6.8, GROUND_Y, 0], color=GREY_B, stroke_width=4)
        ground_label = cn("地面", 22, GREY_B).next_to(ground, DOWN, buff=0.12).shift(LEFT * 5.4)
        top_label = cn("释放点 45 m", 22).next_to(cliff, UP, buff=0.15)

        ticks = VGroup()
        for meters in (0, 15, 30, 45):
            y = GROUND_Y + meters * SCALE
            ticks.add(Line([-4.55, y, 0], [-4.3, y, 0], color=GREY_B, stroke_width=2))
            ticks.add(cn(f"{meters} m", 18, GREY_B).move_to([-3.85, y, 0]))
        self.play(Create(cliff), Create(ground), FadeIn(ground_label),
                  FadeIn(top_label), FadeIn(ticks), run_time=1.2)

        # ---------- 读数面板 ----------
        panel_x = 2.2
        t_lab = cn("时间 t", 26).move_to([panel_x, 2.5, 0], aligned_edge=LEFT)
        d_lab = cn("下落距离", 26).move_to([panel_x, 1.5, 0], aligned_edge=LEFT)
        v_lab = cn("速度 v = g·t", 26).move_to([panel_x, 0.5, 0], aligned_edge=LEFT)
        self.play(FadeIn(t_lab), FadeIn(d_lab), FadeIn(v_lab), run_time=0.8)

        tracker = ValueTracker(0.0)

        def ball_pos():
            t = tracker.get_value()
            fallen = 0.5 * G * t * t
            return np.array([-4.65, TOP_Y - fallen * SCALE, 0])

        ball = always_redraw(lambda: Dot(ball_pos(), radius=0.11, color=RED))

        t_num = always_redraw(lambda: VGroup(
            num(tracker.get_value(), 2),
            cn(" s", 24)).arrange(RIGHT, buff=0.08).next_to(t_lab, RIGHT, buff=0.3))
        d_num = always_redraw(lambda: VGroup(
            num(0.5 * G * tracker.get_value() ** 2, 1),
            cn(" m", 24)).arrange(RIGHT, buff=0.08).next_to(d_lab, RIGHT, buff=0.3))
        v_num = always_redraw(lambda: VGroup(
            num(G * tracker.get_value(), 1),
            cn(" m/s", 24)).arrange(RIGHT, buff=0.08).next_to(v_lab, RIGHT, buff=0.3))

        # 频闪小点: 每 0.5 s 一个, 显示间距越来越大
        def strobe():
            t = tracker.get_value()
            dots = VGroup()
            k = 0
            while 0.5 * k <= min(t, T_END) + 1e-9:
                tt = 0.5 * k
                y = TOP_Y - 0.5 * G * tt * tt * SCALE
                dots.add(Dot([-4.65, y, 0], radius=0.045, color=YELLOW, fill_opacity=0.75))
                k += 1
            return dots
        strobe_dots = always_redraw(strobe)
        strobe_note = cn("黄点:每隔 0.5 s 的位置,间距越来越大", 20, YELLOW)
        strobe_note.move_to([2.2, -0.5, 0], aligned_edge=LEFT)

        self.add(ball, t_num, d_num, v_num, strobe_dots)
        self.play(FadeIn(strobe_note), run_time=0.5)
        # 慢放: 真实下落 3.03 s, 动画用 7 s 播放
        slow = cn("(慢放播放)", 20, GREY_B).move_to([2.2, -1.1, 0], aligned_edge=LEFT)
        self.play(FadeIn(slow), run_time=0.4)
        self.play(tracker.animate.set_value(T_END), run_time=7, rate_func=linear)
        self.wait(0.8)

        # ---------- 落地结论 ----------
        hit = cn("落地!", 30, RED, BOLD).next_to(ball, RIGHT, buff=0.35)
        self.play(FadeIn(hit), run_time=0.5)
        self.wait(0.6)
        self.play(FadeOut(hit), FadeOut(strobe_note), FadeOut(slow), run_time=0.5)

        formulas = VGroup(
            cn("下落距离  h = ½·g·t²", 30),
            cn("落地时间  t = √(2h/g) = √(2×45 / 9.8) = 3.03 s", 30),
            cn("落地速度  v = √(2gh) = √(2×9.8×45) = 29.7 m/s", 30),
            cn("要点:速度均匀变大,相同时间内下落越来越远", 26, YELLOW),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.28)
        formulas.move_to([1.9, -1.75, 0])
        self.play(Write(formulas[0]), run_time=1.0)
        self.play(Write(formulas[1]), run_time=1.2)
        self.play(Write(formulas[2]), run_time=1.2)
        self.play(FadeIn(formulas[3]), run_time=0.8)
        self.wait(2.2)
