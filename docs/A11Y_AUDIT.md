# 无障碍结构审计（axe 结构规则子集）

本仓 verify 门挂载了第六波的无障碍结构审计（EKPO 试点后复制）。本
文件说明它的口径、接入点、覆盖面与基线维护方式。先说清边界：

- 审计对象是 jsdom 渲染后的 DOM，运行的是 **axe 结构规则子集**
  （axe-core 的 wcag2a / wcag2aa / wcag21a / wcag21aa 标签集，减去
  下列禁用规则）。jsdom 无布局、无绘制，本审计只查结构与 ARIA 语义。
- **本审计不构成合规结论**：颜色对比、焦点可见性、键盘顺序、真实
  播报质量都不在覆盖内，不得据此宣称页面符合 WCAG 或已通过无障碍
  验收。

## 覆盖面与未覆盖面（本仓实情——先读这一节）

- 与氢枢同型：应用启动依赖动态 `import()` 加载科学计算核心，
  jsdom 无法执行这类模块导入（pageErrors 里有应用自己打出的
  「科学计算核心加载失败」），**应用主体在当前审计环境里没有
  渲染**。
- 已覆盖：`index.html` 静态壳 + 壳层 chrome（约 172 个元素，
  含 workspace 壳注入的命令检索触发器等）。基线违规 **1 条**：
  `aria-valid-attr-value`——命令检索按钮的
  `aria-haspopup="search"` 不是该属性的合法取值（合法值为
  menu/listbox/tree/grid/dialog/true/false），由
  `assets/js/workspace-v5.js` 生成，已回源码核对为真阳性，
  本轮只登记、未修。
- 未覆盖（即应用的几乎全部交互界面）：实验目录、实验详情、
  模拟实验（含小学演示模式）、归档对比等全部功能视图及其表单
  控件，均不在基线内；「1 条违规」只对静态壳成立，不是全站
  数字。
- 后续条件：将来审计环境若能执行 ESM 动态导入（如真浏览器
  Playwright 通道恢复、或 jsdom 后续版本支持），必须重刷基线，
  且应预期违规数与视图数显著变化——那不是回归，是覆盖面从壳
  扩展到应用主体。

## 禁用规则（jsdom 下不可靠，逐项写明）

| 规则 | 禁用理由 |
|---|---|
| `color-contrast` | jsdom 无渲染引擎，计算颜色来自不完整的 CSS 级联、无布局无绘制，对比度数值不可信，需真浏览器 |
| `color-contrast-enhanced` | 同上（AAA 变体） |
| `link-in-text-block` | 需区分链接与周围文字的真实颜色/下划线渲染，jsdom 无法忠实复现 |
| `css-orientation-lock` | 依赖对真实视口/设备方向的媒体查询求值，jsdom 只有固定假视口 |

禁用清单同时固化在 `docs/a11y-baseline.json` 与每次运行的
`artifacts/a11y-report.json` 里，改动必须同步改这两处与 harness 源码。

## 接入形态（仓外共享 harness）

- 本仓**零依赖纪律不变**：jsdom 与 axe-core 不进本仓 `package.json`，
  它们只装在 goal 工作区的共享 harness 里
  （`goals/seven-repo-deep-optimization-and-app-releases/hidden_files/wave6-a11y-harness/`），
  harness 以仓库路径为参数运行，六仓共用一份。
- `scripts/verify.cjs` 的 `a11y-audit` 步按以下顺序找 harness：
  环境变量 `A11Y_HARNESS_DIR` → 本 checkout 同级 goal 工作区的默认
  路径。找不到 harness 时该步记 `skipped`（与浏览器步同一政策），
  不记 pass；在装有 harness 的机器上它真跑并把违规数、基线数、
  新增/已解决数写进 `artifacts/verify-report.json` 该步的 `details`，
  完整报告落 `artifacts/a11y-report.json`。

## 基线纪律

- `docs/a11y-baseline.json` 是当前存量违规基线（生成日期与逐条定位
  都在文件内）。verify 只拦**基线之外的新增违规**：新增即该步红。
- 存量违规逐项修：修掉一条，基线就应缩一条。刷新基线是显式动作，
  不许为了让门变绿而无理由重刷：

```bash
node <harness>/run-a11y.cjs --repo <本仓路径> \
  --baseline docs/a11y-baseline.json --write-baseline
```

- 基线文件带生成日期；发布对账周跑会顺带检查基线是否长期不动。
