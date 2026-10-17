# PhysChem Lab — Deep Redesign Roadmap

> Status: discovery and scientific-content baseline. Simulations and educational experiments must be clearly separated from real laboratory procedures.

## Product vision
Rebuild the current experiment catalogue as an interactive physical chemistry studio combining concept visualization, numerical exploration, calculation tools, and reproducible learning reports.

## Product pillars
1. **Experiment library** — curated experiments with objectives, theory, equipment, safety notes, procedure boundaries, and references.
2. **Interactive models** — parameter-controlled simulations with explicit assumptions and units.
3. **Scientific calculators** — tested formula tools with dimensional checks, significant figures, and uncertainty propagation where applicable.
4. **Data analysis** — tables, plots, regression, residuals, and exportable analysis notebooks.
5. **Learning and reporting** — guided inquiry, conceptual checks, and reproducible reports with calculation provenance.

## Proposed architecture
- Frontend: TypeScript + React/Vite, modular experiment and visualization components.
- Scientific core: pure tested calculation packages, unit-aware quantities, typed model parameters.
- Visualization: reusable chart and simulation adapters with accessible controls.
- Content: versioned experiment definitions, reviewed references, safety classification, and localization.
- Optional Python service for advanced numerical routines only where justified and validated.

## Redesign workstreams
### P0 — scientific audit
- Inventory all experiments, formulas, parameter ranges, diagrams, instructions, and references.
- Check equation dimensions, units, constants, assumptions, and numerical edge cases.
- Separate illustrative simulations from measured experimental data.
- Identify experiments that require specialist supervision or additional safety controls.

### P1 — reproducible scientific core
- Build typed quantities and explicit unit conversion.
- Add tests against independently verified reference calculations.
- Record model assumptions, numerical method, input parameters, and software version.
- Add uncertainty and significant-figure handling where scientifically appropriate.

### P2 — modern learning studio
- Redesign around Explore / Experiments / Simulations / Calculators / Data Analysis / Reports.
- Add interactive parameter controls, reset states, stepwise explanations, and accessible chart alternatives.
- Make each experiment page consistent while allowing domain-specific visualizations.
- Provide downloadable structured data and reproducibility metadata.

### P3 — deeper scientific capabilities
- Add fitting/regression and residual diagnostics with warnings for invalid assumptions.
- Add sensitivity analysis and uncertainty propagation where applicable.
- Add AI explanations grounded in reviewed content, never as a substitute for scientific validation.
- Establish educator/scientist review for new experiments and model changes.

## Acceptance criteria
- Each formula has units, assumptions, and verified reference cases.
- Simulations label assumptions and never masquerade as measured results.
- Numerical edge cases and invalid inputs are tested.
- Experiment safety guidance and references are reviewed before publication.
- Critical workflows pass unit and browser tests.

## Non-goals / safeguards
- No invented constants, results, or citations.
- No unsafe unsupervised wet-lab instructions.
- No scientific claims based solely on generated AI output.
