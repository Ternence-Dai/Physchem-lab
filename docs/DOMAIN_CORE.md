# Domain core: equations, units, and validity

This document describes the shared numerical functions in `src/domain/index.js`. Inputs must use the units listed here; the module does not infer or convert units from strings.

## Common numerical contract

- Every required numeric input must be finite.
- Physical-domain checks reject negative quantities where the model requires a non-negative or positive value.
- Derived outputs are checked too. A `RangeError` means the requested result is outside JavaScript's finite-number range; callers should display a clear validation message rather than silently clamp it.
- Numerical-stability branches avoid some intermediate overflow or underflow cases. They do not make a physical model valid outside its stated assumptions.

## Equations

| Function | Inputs | Outputs | Model boundary |
|---|---|---|---|
| `idealGasPressure` | Amount n: mol; temperature T: K; volume V: m³ | Pressure P: Pa | P = nRT/V, with R = 8.31446261815324 J/(mol·K). Assumes ideal-gas behaviour. |
| `strongAcidStrongBasePH` | Strong monoprotic acid/base concentrations: mol/L; dispensed volumes: mL | pH | Neutralization uses concentration×volume (mmol), then calculates excess H⁺ or OH⁻ concentration after mixing. Assumes complete dissociation and concentration as an ideal activity approximation; concentrated solutions require activity corrections. The function does not clamp calculated values to 0–14. |
| `idealGasParticleProperties` | Amount n: mol; temperature T: K; volume V: m³; molar mass M: kg/mol | RMS molecular speed: m/s; mean translational kinetic energy: J/molecule; number density: molecules/m³ | Uses v_rms = sqrt(3RT/M), mean kinetic energy = 1.5 k_B T, and number density = n N_A/V. R, N_A and k_B are shared constants; the experiment uses dry-air molar mass 0.02897 kg/mol. |
| `arrheniusRateConstant` | Prefactor A: units of the desired rate constant; activation energy Ea: J/mol; temperature T: K | k: same units as A | k = A × exp(-Ea/(R×T)). The caller is responsible for choosing a prefactor whose units match the reaction-rate definition. |
| `projectileMotion` | Initial speed: m/s; launch angle: degrees; gravity: m/s² | Velocity components: m/s; flight time: s; range and maximum height: m | Ideal projectile launched and landing at the same elevation, with constant gravity and no air resistance. |
| `pendulumPeriod` | Length: m; gravity: m/s² | Period: s | Small-angle simple-pendulum approximation: T = 2π × sqrt(L/g). Large amplitudes require an amplitude correction. |
| `ohmsLaw` | Voltage: V; resistance: Ω | Current: A; power: W; one-minute heat energy: J | I = U/R; P = U×I; Q over 60 s = 60×P. The heat value assumes a constant operating point over 60 seconds. |
| `inclinedPlaneAcceleration` | Incline angle: degrees; friction coefficient: dimensionless; gravity: m/s² | Acceleration down the plane: m/s² | a = g × (sin θ - μ cos θ), clamped to zero below the sliding threshold. It treats the supplied coefficient as both threshold and sliding coefficient; real static and kinetic coefficients can differ. |
| `springOscillator` | Mass: kg; spring constant: N/m; displacement: m; velocity: m/s | Acceleration: m/s²; angular frequency: rad/s; period: s; kinetic, elastic, and total energy: J | Ideal linear spring and undamped motion. a = -k×x/m; ω = sqrt(k/m); E = 0.5×m×v² + 0.5×k×x². |

## UI integration requirements

- Experiment animations, readouts, and tutor explanations must call the shared domain function for calculated quantities. They must not reimplement the same equation in the catalogue.
- Displayed units must match the quantity. In particular, current is a charge-flow rate in C/s (equivalent to A), not a charge quantity in C.
- Demo animation particles and trajectories are visualisations of the stated model, not measured experimental data.
- When an equation uses an approximation (for example, small-angle pendulum motion or ideal-gas behaviour), the experiment text must disclose that boundary.

## Verification

The domain tests in `test/domain.test.js` cover reference cases, ideal-gas molecular properties, physical-domain rejection, finite-result checks, and numerical edge cases. `scripts/validate-experiments.cjs` checks that the catalogue calls the shared solver for pressure and molecular properties and displays the correct unit and result fields.

These checks establish software consistency and selected numerical properties; they do not independently validate every model against laboratory measurements or a full scientific reference dataset.

## Open-source scientific-computing references

- [Cantera](https://github.com/Cantera/cantera) is a reference for thermodynamic and kinetic model organization, explicit physical state, and reproducible scientific computation. Its chemistry models are not automatically interchangeable with the simplified teaching experiments in this project.
- [Astropy](https://github.com/astropy/astropy) and [SciPy](https://github.com/scipy/scipy) provide useful examples of unit-aware scientific data handling and numerical-method discipline. Any solver adopted here must expose assumptions, convergence or error information, and a benchmark case.
- Passing the local numerical regression suite establishes software behavior for the included cases; it does not establish experimental validation or make the illustrative particle animation a molecular-dynamics trajectory.


## Inclined-plane boundary conditions

The ideal inclined-plane acceleration model accepts angles from 0° through 90°. At exactly 90°, the normal force and friction contribution are exactly zero, so the implementation returns gravitational acceleration directly instead of relying on the floating-point approximation of cos(π/2). Angles above 90° are outside this model's defined domain.
