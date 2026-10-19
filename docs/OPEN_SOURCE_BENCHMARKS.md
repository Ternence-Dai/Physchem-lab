# 开源项目深度对标：PhysChem Lab 交互实验平台

> 对标日期：2026-10-19。优先参考可解释的科学模型与教学交互，不把旧版演示的简化公式当作完整热力学/动力学模型。

## 1. 上游项目与可借鉴点

### PhET Acid-Base Solutions — 模型变量与教学可视化
- 仓库：[phetsims/acid-base-solutions](https://github.com/phetsims/acid-base-solutions)
- 模型说明：[doc/model.md](https://github.com/phetsims/acid-base-solutions/blob/main/doc/model.md)。
- 参考内容：溶液分为纯水、强酸、弱酸、强碱和弱碱；模型显式区分浓度、Ka/Kb、Kw、离子浓度与 pH；模型说明把假设和简化（例如电导率显示值）写明。
- 维护状态注意：该单独仓库已标注不再维护并已整合。因此只将其模型说明作为可核查的教学参考，不复制旧代码，也不把其 0–14 显示范围作为所有浓溶液模型的通用限制。

### PhET 教学交互的可迁移原则
- 控制变量应与观测量有直接关系；每个滑块调整应同步更新可见结果。
- 模型状态与绘图层分离；暂停、继续、重置不应悄悄改变输入参数。
- 给出公式、变量和单位，允许学习者把“改变输入—观察结果—理解关系”连起来。

## 2. 对本项目的产品映射

| 实验工作区 | 借鉴模式 | 验收点 |
|---|---|---|
| 实验目录 | 按学科/主题筛选与搜索 | 选择实验后标题、简介和参数同步 |
| 变量控制台 | 参数标签、单位、范围、滑块 | 滑块输入和数值读数一致 |
| 仿真画布 | 实验状态的视觉投影 | 画布尺寸变化后 DPR 和比例正确 |
| 公式/实时计算 | 公式与读数并列 | 每一读数可追溯到当前参数 |
| 公式助教 | 分步骤解释变量关系 | 解释不冒充外部 AI 或实验测量 |
| 实验档案 | 保存参数、实验 ID、模型版本和时间 | 旧档案保留兼容与恢复保护 |

## 3. 本轮实际落地
- 新增实验操作快捷栏：检索实验、暂停/继续、保存当前实验、查看实验档案。
- 快捷动作复用原有控件事件，避免新增第二套实验状态逻辑。
- 本项目强酸/强碱 pH 的模型边界已保留在领域层，不跟随教学 UI 任意截断。

## 4. 后续重构要求
1. 每个实验模型需声明输入、输出、单位、适用范围、假设和参考来源。
2. 模型计算、状态推进和 canvas 绘制分离；绘图不得反向修改科学状态。
3. 对典型工况建立数值基准与边界测试；比较外部模型前必须统一单位与假设。
4. 对简化模型明确标记教学近似；在高浓度、非理想溶液等条件下提示活度效应。
5. 存档记录模型版本，模型升级后能够解释旧存档的来源。

## 5. 参考链接
- [PhET Acid-Base Solutions](https://github.com/phetsims/acid-base-solutions)
- [PhET 模型说明](https://github.com/phetsims/acid-base-solutions/blob/main/doc/model.md)
- [PhET 交互式模拟网站](https://phet.colorado.edu/)


## 6. 2026-10-19 实施补充：极稀强酸/强碱的水自电离边界

- 对照 PhET 模型说明中的水自电离常数 Kw，本项目 strongAcidStrongBasePH 不再只用“过量酸/碱浓度”直接取对数；现在求解 [H+] - [OH-] = C_excess 与 [H+][OH-] = Kw，在 25 °C 使用 Kw = 10^-14。
- 使用 Math.hypot 和共轭形式，减少极稀碱溶液求根时的数值抵消。
- 新增回归测试：1e-10 mol/L 强酸仍略呈酸性、等量中和仍为 pH 7、极稀强碱仍略呈碱性。
- 适用边界仍须明确：浓度在此处近似活度；高离子强度浓溶液需要活度系数等更完整模型。PhET 的教学模型文档用于核对变量与假设，并不意味着将其旧版 pH 0–14 视觉范围套用到所有溶液。


## 7. 扩展开源对标：科学模型、实验流程与交互模拟

> 覆盖说明：这里同时参考科学模型模拟和教学流程模拟。二者的精度目标不同：桌面教学模拟不能视为研究级计算化学或真实实验的替代物。

| 上游项目 | 可核查入口 | 可迁移模式 | 状态/边界 |
|---|---|---|---|
| [PhET Acid-Base Solutions](https://github.com/phetsims/acid-base-solutions) | [模型说明](https://github.com/phetsims/acid-base-solutions/blob/main/doc/model.md) | 浓度、Ka/Kb、Kw、离子浓度、pH 的模型变量显式化；把公式假设写成可学习内容 | 独立仓库已归档/整合，仅作模型说明参考；不可照搬其 UI 范围作为浓溶液通用边界 |
| [PhET pH Scale Basics](https://github.com/phetsims/ph-scale-basics) | [仓库状态说明](https://github.com/phetsims/ph-scale-basics) | 把微观粒子、浓度变化和 pH 显示联系起来，支持面向学习者的概念反馈 | 仓库 README 已声明不再维护并整合；只参考历史教学交互，不作为当前活跃依赖 |
| [VirtualChemLab](https://github.com/qilaidev/virtual-chem-lab) | [功能/架构 README](https://github.com/qilaidev/virtual-chem-lab/blob/main/README.md) | YAML 实验模板、步骤引导、输入校验、曲线与学习记录、安全提示 | Python/PySide6 桌面应用，不是浏览器组件；项目明确不是研究级计算化学引擎 |
| [ChemCollective Virtual Labs](https://chemcollective.org/vlabs) | [虚拟实验教学入口](https://chemcollective.org/vlabs) | 任务情境、试剂/操作步骤、观察结果和学习活动编排 | 教学实验平台，不能替代有明确边界条件的数值物理模型 |

### 对本项目的实现映射
- 首页工作流连接实验目录、变量控制、公式助教和参数存档；四步共享同一个当前实验状态，避免按钮各自维护第二份状态。
- 每个模型继续补齐输入/输出单位、适用区间、数值基准和近似假设；曲线绘制不得改变科学状态。
- 将“教学动画”“方程计算”“实验测量”分开展示。没有真实采集设备时，任何实时动画都不能标注为现场测量。
- 对旧实验模型逐个审查边界值、极限和量纲，并优先把共用方程移入 src/domain 后再接入 UI。
