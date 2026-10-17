# Rebuild plan — 物理化学数字实验室

## Product intent

A rigorous interactive laboratory for physical chemistry concepts, with parameterized experiments, numerical solvers, live plots, derivations, and reproducible experiment notebooks.

## Target capabilities

1. Curated experiment catalogue and learning objectives
2. Unit-aware formula and constants library
3. Interactive parameter controls and live plots
4. Numerical methods with convergence/error reporting
5. Derivations, assumptions, and references
6. Experiment notebooks, export, and regression benchmarks

## Non-negotiable correctness and safety gates

Every model documents assumptions, units, numerical method, and domain limits. Compare against analytic solutions or published reference cases; surface numerical error and never imply simulation is measured data.

## Delivery sequence

1. Inventory current behavior, assets, data formats, and dependencies.
2. Define domain model, API contracts, permissions, and migration/import strategy.
3. Implement the smallest end-to-end vertical slice with typed interfaces.
4. Add unit, integration, and browser-level tests for critical workflows.
5. Add CI, security/dependency scanning, and reproducible build instructions.
6. Validate with reference datasets and document known limitations.
7. Review deployment, backup, recovery, and release process before production use.

## Open-source adoption policy

For each dependency or reference project, record its repository URL, license, maintenance activity, security posture, exact component being reused or adapted, and attribution obligations. Prefer stable standards and small interoperable components over copying whole applications.

## Status

- [ ] Existing repository and data audit complete
- [ ] Domain model and architecture approved
- [ ] Core vertical slice implemented
- [ ] Critical workflows tested
- [ ] CI and security checks passing
- [ ] Deployment and backup procedure verified
- [ ] Release candidate reviewed
