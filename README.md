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

The modernization work is being applied directly to `main`. The current baseline includes a domain-core module, automated domain tests, standalone-app validation, and a GitHub Pages deployment workflow. These checks passing confirms the current baseline is buildable; it does **not** mean the full product rebuild is complete.

Remaining delivery work includes validating the existing application workflows and data, extracting maintainable modules from the legacy entry point, adding migration-safe persistence and import/export checks, and documenting verified domain rules. Existing user data and the legacy application must be preserved while these changes are introduced.

See [the rebuild plan](docs/REBUILD_PLAN.md) and [domain equations, units, and validity boundaries](docs/DOMAIN_CORE.md).
