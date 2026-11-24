# Manim 讲解动画管线

为运动学 / 振荡 / 碰撞类实验制作的讲解动画源码（Manim Community Edition
v0.22.1 渲染，1280×720 / 30 fps，字体 Noto Sans CJK SC，数字读数用 Pango
文本而非 DecimalNumber，本机无 TeX 时可跑）。

## 参数纪律

- 每段动画的参数只取 `data/experiment-evidence-manifest.json` 中对应实验的
  默认值，公式与 manifest 的 `scientificEvidence` / 本仓库 catalogue 条目
  一致；各 .py 文件头注释写明出处。
- p2 的释放角 0.17 rad、p3 的初始位移 0.6 m 取自 catalogue 中 p2/p3 条目
  自带的 `init` 初条件（与网页动画同一初条件），不是另编的数。
- m9、m10、m11、m12、m13、m14、m15 在 manifest 中公式核验状态为
  `not_yet_item_verified`，动画公式与 catalogue 条目自带公式一致，未新增
  未核验结论。

## 覆盖（17 个实验）

m1–m15 全部运动学、p2 单摆、p3 弹簧振子、m9 简谐运动、m11 动量守恒碰撞。
成片应放在 `assets/media/<实验id>_<名>.mp4`，catalogue 条目已加 `mv`
（p2/p3 为 `video`）字段引用，`assets/js/legacy-app.js` 的 buildPanel 会在
公式面板下渲染播放器；视频文件缺失时播放器会自动隐藏（onerror 移除），
不会出现坏框。

## 渲染

```bash
python3 -m venv ~/manim-venv && ~/manim-venv/bin/pip install manim==0.22.1
~/manim-venv/bin/manim render -qm <场景>.py <Scene>
```

注意：venv 与 TMPDIR 不要放 /tmp（小容量 tmpfs 会爆盘）；Manim CE 没有
`CYAN` 常量，源码里已用十六进制色值代替。

## 动画定位

动画只是实验讲解素材（家长演示 / 讲解用），不改变题库、抽题逻辑与
「小学演示模式」的既有红线。
