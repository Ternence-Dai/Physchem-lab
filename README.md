# Physical Chemistry Virtual Laboratory

> 物理化学数字实验室

A rigorous interactive laboratory for physical chemistry concepts, with parameterized experiments, numerical solvers, live plots, derivations, and reproducible experiment notebooks.

## Product modules

- Curated experiment catalogue and learning objectives
- Unit-aware formula and constants library
- Interactive parameter controls and live plots
- Numerical methods with convergence/error reporting
- Derivations, assumptions, and references
- Experiment notebooks, export, and regression benchmarks

## Engineering principles

Every model documents assumptions, units, numerical method, and domain limits. Compare against analytic solutions or published reference cases; surface numerical error and never imply simulation is measured data.

- Modular, typed, documented code; no monolithic application entry point.
- Reproducible setup, deterministic tests, and automated quality checks.
- Secure configuration: secrets belong in environment variables or managed secret stores, never in source control.
- Accessible, responsive interface with clear loading, empty, error, and offline states.
- Open-source components are evaluated for maintenance, license compatibility, security, and fit before adoption.

## Delivery status

The current catalogue contains 108 interactive experiments. The shared numerical core covers ideal-gas pressure and molecular properties, Arrhenius kinetics, projectile motion, pendulum period, Ohm's law, inclined-plane motion, and spring oscillation; regression tests cover physical-domain boundaries and extreme floating-point cases. The current V5 workspace combines the experiment directory, simulation canvas, parameter controls, result panels, experiment notes, and a responsive mobile experiment drawer. Experiment archives remain local to the browser and include recovery protection. The NIST Chemistry WebBook entry is a manual reference lookup only: it does not change model parameters or turn reference values into measured results. Ideal-gas particle animations disclose that their speed scale is illustrative rather than a real molecular trajectory.

Automated checks include JavaScript syntax and reference-data safety validation, domain regression tests, and a Playwright browser workflow that exercises the 108-experiment catalogue, canvas rendering, representative animation behavior, archive comparison, reduced-motion behavior, and mobile navigation. These checks are defined in the repository; their presence alone does not imply that the latest workflow run has passed. Remaining delivery work includes reference datasets and citations for every experiment, broader UI-to-domain integration, explicit numerical error reporting, and complete experiment notebook/export workflows. Simulated values and visual animations must not be presented as measured laboratory data.

See [the rebuild plan](docs/REBUILD_PLAN.md) and [domain equations, units, and validity boundaries](docs/DOMAIN_CORE.md).


## 开源项目深度对标

本项目采用的上游参考、架构借鉴、实现边界与后续验收要求见 [docs/OPEN_SOURCE_BENCHMARKS.md](docs/OPEN_SOURCE_BENCHMARKS.md)。

## 科学证据溯源

108 项实验现已建立逐项公式引用、假设、独立基准与实验数据的证据登记表。候选参考来源不会被误记为已验证引用；空缺和待核查单位会保留明确状态。参见 [实验科学证据登记册](docs/EXPERIMENT_EVIDENCE_REGISTER.md) 与 [机器可检验清单](data/experiment-evidence-manifest.json)。

## 旗舰实验解析参考向量

p1–p8 已增加逐输出字段的闭式解析参考向量，CI 对照公式推导值与代码结果；该层是方程实现回归，不是实测数据或模型标定。详见 [实验科学证据登记册](docs/EXPERIMENT_EVIDENCE_REGISTER.md)。
