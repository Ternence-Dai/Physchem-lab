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

## Rebuild status

The rebuild/platform-v2 branch is the new implementation track. The existing main branch remains unchanged during development. This repository is not considered rebuilt until the implementation, tests, documentation, and deployment path have been verified.

See [the rebuild plan](docs/REBUILD_PLAN.md).
