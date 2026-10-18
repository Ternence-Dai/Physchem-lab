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

The modernization work is being applied directly to `main`. The verified slice has a 100-experiment catalogue smoke check and a shared numerical core for ideal-gas pressure and molecular properties, Arrhenius kinetics, projectile motion, pendulum period, Ohm's law, inclined-plane motion, and spring oscillation. The catalogue routes key experiment readouts and tutor explanations through shared functions; regression tests cover physical-domain boundaries and extreme floating-point cases. The V3 interface now provides a redesigned desktop experiment directory, light engineering-control panels, a high-contrast simulation canvas, responsive tablet/phone layouts, and a mobile experiment drawer that closes after selection. The archive remains local to the browser and includes recovery protection. Ideal-gas particle animations now disclose that their speed scale is illustrative rather than a real molecular trajectory. The updated build, model and interface checks are being run for this revision.

Remaining delivery work includes reference datasets and citations for every experiment, more UI-to-domain integration across the full catalogue, explicit numerical error reporting, experiment notebooks and export, and browser-level testing. Simulated values and visual animations must not be presented as measured laboratory data.

See [the rebuild plan](docs/REBUILD_PLAN.md) and [domain equations, units, and validity boundaries](docs/DOMAIN_CORE.md).
