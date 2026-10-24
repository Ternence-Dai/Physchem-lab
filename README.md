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
