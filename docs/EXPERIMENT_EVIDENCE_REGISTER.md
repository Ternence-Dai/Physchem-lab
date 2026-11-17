# 108-item experiment evidence register

## Purpose and status

\`data/experiment-evidence-manifest.json\` is an evidence-gap register synchronized with the live catalogue. It is not a claim that all 108 experiments have been scientifically validated.

The first inventory deliberately separates four things that must not be conflated:

1. **Software regression:** the model executes and returns finite values inside the code's tested domain.
2. **Formula provenance:** an exact source, edition, chapter/section, and equation must support the implemented formula and conventions.
3. **Model assumptions:** the applicable physical/chemical assumptions and validity range must be stated per experiment.
4. **Independent validation:** analytic benchmark vectors or traceable experimental measurements must be compared with declared tolerances.

A passing software test is not experimental validation. A source candidate is not a citation. A user-interface unit label is not proof that the parameter's physical measurand is correctly represented.

## Current inventory

The manifest records all 108 experiment IDs, names, categories, tags, source-group, formula counts, parameter labels, numeric bounds, defaults, and visible units. It was generated from the catalogue Git blob recorded inside the manifest.

- 108 unique experiment records are required.
- Every record currently has \`formulaReferenceStatus=not_yet_item_verified\`.
- Every record currently has \`assumptionsStatus=not_structured\`.
- Every record currently has \`independentBenchmarkStatus=not_supplied\`.
- Blank parameter units are marked \`not_specified_requires_review\`; the validator does not silently infer that a blank string means dimensionless.

The register also lists candidate reference works by broad subject. Candidate references are research starting points only. Each formula still requires exact item-level mapping and review before its status may be changed to verified.

## Candidate authoritative references

- OpenStax *University Physics, Volume 1*: mechanics, kinematics, Newton's laws, work/energy, momentum, rotation, gravitation, oscillations and waves.
- OpenStax *University Physics, Volume 2*: thermodynamics, kinetic theory, electricity, magnetism, DC/AC circuits and induction.
- OpenStax *University Physics, Volume 3*: geometric optics, interference, diffraction, photons and modern physics.
- OpenStax *Chemistry 2e*: gases, thermochemistry, kinetics, equilibrium, acid-base chemistry and electrochemistry.
- NIST/CODATA 2022: recommended fundamental physical constants and conversion factors.
- IUPAC *Green Book*, 4th edition: quantities, units, symbols and conventions in physical chemistry.
- NIST Chemistry WebBook SRD 69: substance-specific thermochemical, thermophysical and spectral reference data.

These sources are not interchangeable: a data database supports property values only under its reported substance, phase, temperature, pressure, and uncertainty conditions. It does not automatically validate an idealized teaching model.

## Validation command

\`npm run check\` invokes \`scripts/validate-experiment-evidence.cjs\`. The validator checks:

- exact 108-item coverage and unique IDs;
- exact names, categories, tags and source-group reconciliation;
- formula counts;
- parameter keys, labels, bounds, defaults and unit labels;
- existence of every candidate reference ID;
- required evidence fields before a record can ever be marked formula-verified or assumption-documented.

The initial validator passes as an inventory integrity check while explicitly printing the remaining evidence debt. It does **not** mark pending items as accepted.

## Acceptance sequence for each experiment

1. Locate the exact primary/reference source and record edition, section, equation, DOI/URL and access date.
2. Reconcile symbol definitions, units, standard-state conventions, activity/concentration basis and conversion factors.
3. Write assumptions, validity range, excluded regimes and numerical method.
4. Add an independently computed reference vector with tolerance and regression test.
5. Where experimental data are relevant, record dataset identity, source, sample/instrument conditions, calibration status, uncertainty and provenance.
6. Only then promote the corresponding status in the manifest.

Do not bulk-mark all 108 entries verified based on a single general textbook citation.


## First item-level source verification tranche (8 flagship experiments)

On 2026-11-17, exact section-level sources were attached to flagship experiments p1–p8:

| ID | Experiment | Formula-source state | Primary locator | Boundary |
|---|---|---|---|---|
| p1 | Projectile trajectory | verified | OpenStax University Physics 1, §4.3 | No air resistance; range assumes same launch/landing elevation |
| p2 | Pendulum | partially verified | OpenStax University Physics 1, §15.4 | Source supports the gravity restoring term and small-angle period; the prototype's added linear damping term is not independently validated |
| p3 | Spring oscillator | verified | OpenStax University Physics 1, §§15.1–15.2 | Ideal Hookean, undamped, conservative oscillator |
| p4 | Ohm's law circuit | verified | OpenStax University Physics 2, §§9.4–9.5 | Fixed ohmic resistance; temperature feedback neglected |
| p5 | Inclined plane/friction | partially verified | OpenStax University Physics 1, §6.2 | Prototype uses one shared coefficient for static threshold and kinetic friction; source uses distinct coefficients |
| p6 | Ideal-gas molecular model | verified | OpenStax University Physics 2, §§2.1–2.2; NIST CODATA 2022 | Ideal gas; translational kinetic energy; fixed approximate dry-air molar mass; particle animation is illustrative |
| p7 | Strong-acid/strong-base titration | verified | OpenStax Chemistry 2e, §14.7, Example 14.21 / Fig. 14.18 | Strong monoprotic acid/base, additive volumes, fixed 25°C and Kw |
| p8 | Arrhenius rate model | verified | OpenStax Chemistry 2e, §12.5 | Formula sourced; A and Ea values are illustrative and not calibrated to a named reaction |

The 6 records marked \`verified\` indicate that the represented formula family has an exact textbook/reference locator. They do **not** mean that the executable code, numerical parameter values, uncertainty, or physical prediction has been independently validated. p2 and p5 remain partially verified because their implementation adds or simplifies behavior not validated by the cited formula.

The 8 records all include explicit model assumptions. No independent experimental dataset or benchmark tolerance is supplied by this source tranche. Those states remain \`not_supplied\`; this prevents a source citation from being mistaken for validation data.


## Closed-form analytical reference vectors for p1–p8

A second validation layer now accompanies the formula citations. The new \`scripts/validate-flagship-reference-vectors.mjs\` computes fixed input cases and compares the domain implementation to independently evaluated closed-form reference values:

- p1 projectile: velocity components, flight time, same-elevation range and maximum height.
- p2 pendulum: the undamped small-angle reference period only; it does not claim to validate the damped nonlinear animation integrator.
- p3 spring oscillator: angular frequency, period, acceleration, kinetic energy, elastic potential and total energy.
- p4 Ohm's law: current, power and constant-power heat over one minute.
- p5 inclined plane: normal force, gravity component, simplified friction force and acceleration; the single shared friction coefficient is explicitly part of the prototype model assumption.
- p6 ideal gas: ideal-gas pressure, dry-air RMS speed, mean translational kinetic energy and number density. Expected values use the exact declared GAS_CONSTANT=8.31446261815324 J/(mol·K) and AVOGADRO_CONSTANT=6.02214076e23 mol⁻¹ from the production domain module; the module derives kB as R/NA. The Arrhenius vector likewise uses this same R value, not a truncated 8.314462618 constant.
- p7 strong-acid/strong-base titration: excess-acid pH and the equivalence-point pH at 25 °C.
- p8 Arrhenius: one rate-constant vector with illustrative, non-fitted prefactor and activation-energy inputs.

The manifest records the exact tested output field, expected value, relative tolerance, source and equation locator for every vector. These are analytical equation-regression checks only. They do not count as laboratory measurements, parameter calibration, uncertainty quantification, or proof of predictive validity for a physical experiment.


## Second item-level source verification tranche (kinematics m1–m8)

The next eight mechanics models now carry exact section-level OpenStax University Physics Volume 1 references and item-specific assumptions:

| ID | Experiment | Source locator | Model boundary |
|---|---|---|---|
| m1 | Free fall | §3.5, equations 3.15–3.17 | Released from rest; constant g; no drag; 1 kg is only the illustrative kinetic-energy readout mass |
| m2 | Vertical upward throw | §3.5, equations 3.15–3.17 | Returns to same elevation; no drag; same-level total flight time |
| m3 | Circular motion | §4.4, equations 4.27–4.30 | Constant speed and radius; 1 kg illustrative force readout; centripetal force is the net inward force |
| m4 | Horizontal projectile | §4.3, horizontal launch from nonzero height | Zero initial vertical velocity; lands below launch; no air resistance |
| m5 | Oblique projectile | §4.3, equations 4.24–4.26 | Same-level landing; 45° maximum range only under no-drag assumptions |
| m6 | Uniform linear motion | §3.4, constant-acceleration equations with a=0 | Fixed direction, constant velocity; start-up and braking omitted |
| m7 | Uniformly accelerated motion | §3.4, equations 3.12–3.14 | One-dimensional constant acceleration and consistent sign convention |
| m8 | Downward vertical throw | §3.5, equations 3.15–3.17 | Positive coordinate downward; constant g; no drag; stops at impact surface |

These eight records now have \`formulaReferenceStatus=verified\` at formula-provenance level and \`assumptionsStatus=documented\`. They remain separate from numerical implementation verification: independent analytic vectors, real measurements and calibration evidence are not claimed by this tranche.
