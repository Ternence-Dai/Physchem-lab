export const GAS_CONSTANT = 8.31446261815324;
export const AVOGADRO_CONSTANT = 6.02214076e23;
export const BOLTZMANN_CONSTANT = GAS_CONSTANT / AVOGADRO_CONSTANT;


function finiteResult(value, label) {
  const values = typeof value === "number" ? [value] : Object.values(value);
  if (values.some((item) => !Number.isFinite(item))) throw new RangeError(`${label} exceeds the finite numeric range`);
  return value;
}
function sqrtPositiveRatio(numerator, denominator) {
  return Math.sqrt(numerator) / Math.sqrt(denominator);
}
function multiplyRatioStable(numerator, denominator, multiplier) {
  if (multiplier === 0) return 0;
  const ratio = numerator / denominator;
  const direct = ratio * multiplier;
  if (Number.isFinite(direct) && (direct !== 0 || ratio !== 0)) return direct;
  const magnitude = Math.exp(Math.log(numerator) - Math.log(denominator) + Math.log(Math.abs(multiplier)));
  return Math.sign(multiplier) * magnitude;
}
function halfScaledSquare(scale, value) {
  const magnitude = Math.abs(value);
  if (scale === 0 || magnitude === 0) return 0;
  // Order the three positive factors so an early half-scale underflow or
  // scale*value overflow cannot destroy an otherwise finite ½·scale·value².
  return magnitude >= 1
    ? (scale * (magnitude * 0.5)) * magnitude
    : (scale * magnitude) * (magnitude * 0.5);
}

export function dilutionConcentration({initialConcentrationMolPerL,initialVolumeMl,finalVolumeMl}) {
  for (const [name,value] of Object.entries({initialConcentrationMolPerL,initialVolumeMl,finalVolumeMl})) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  }
  if (initialConcentrationMolPerL < 0 || initialVolumeMl <= 0 || finalVolumeMl < initialVolumeMl) {
    throw new RangeError("initial concentration must be non-negative; initial volume positive; final volume no smaller than initial volume");
  }
  if (initialConcentrationMolPerL === 0) return 0;
  // Keep the direct expression for ordinary inputs (including exact simple
  // decimal results); use log space only when an intermediate loses range.
  const direct = initialConcentrationMolPerL * (initialVolumeMl / finalVolumeMl);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const concentration = Math.exp(
    Math.log(initialConcentrationMolPerL) + Math.log(initialVolumeMl) - Math.log(finalVolumeMl)
  );
  if (concentration === 0) throw new RangeError("positive solute concentration produces a result below the representable numeric range");
  return finiteResult(concentration, "dilution concentration");
}

export function idealGasPressure({ amountMol, temperatureK, volumeM3 }) {
  for (const [name,value] of Object.entries({amountMol,temperatureK,volumeM3})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (amountMol < 0 || temperatureK <= 0 || volumeM3 <= 0) throw new RangeError("amount must be non-negative; temperature and volume must be positive");
  if (amountMol === 0) return 0;
  // Evaluate the positive product/quotient in log space so an intermediate
  // amount/volume underflow does not erase a representable final pressure.
  const pressure = Math.exp(Math.log(amountMol) - Math.log(volumeM3) + Math.log(GAS_CONSTANT) + Math.log(temperatureK));
  if (pressure === 0) throw new RangeError("positive gas amount produces pressure below the representable numeric range");
  return finiteResult(pressure, "ideal gas pressure");
}
export function idealGasParticleProperties({ amountMol, temperatureK, volumeM3, molarMassKgPerMol }) {
  for (const [name, value] of Object.entries({ amountMol, temperatureK, volumeM3, molarMassKgPerMol })) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  }
  if (amountMol < 0 || temperatureK <= 0 || volumeM3 <= 0 || molarMassKgPerMol <= 0) {
    throw new RangeError("amount must be non-negative; temperature, volume and molar mass must be positive");
  }
  // Log-space products avoid losing representable outputs to intermediate
  // overflow/underflow when finite inputs span very different magnitudes.
  const rmsSpeed = Math.exp(0.5 * (Math.log(3) + Math.log(GAS_CONSTANT) +
    Math.log(temperatureK) - Math.log(molarMassKgPerMol)));
  const averageKineticEnergyJ = Math.exp(Math.log(1.5) +
    Math.log(BOLTZMANN_CONSTANT) + Math.log(temperatureK));
  const numberDensityPerM3 = amountMol === 0 ? 0
    : Math.exp(Math.log(amountMol) + Math.log(AVOGADRO_CONSTANT) - Math.log(volumeM3));
  if (rmsSpeed === 0) {
    throw new RangeError("RMS molecular speed is below the representable numeric range");
  }
  if (averageKineticEnergyJ === 0) {
    throw new RangeError("mean translational kinetic energy is below the representable numeric range");
  }
  if (amountMol > 0 && numberDensityPerM3 === 0) {
    throw new RangeError("number density is below the representable numeric range");
  }
  return Object.freeze(finiteResult({
    rmsSpeed,
    averageKineticEnergyJ,
    numberDensityPerM3
  }, "ideal-gas particle properties"));
}

export function strongAcidStrongBasePH({acidConcentrationMolPerL,acidVolumeMl,baseConcentrationMolPerL,baseVolumeMl}) {
  const values={acidConcentrationMolPerL,acidVolumeMl,baseConcentrationMolPerL,baseVolumeMl};
  for (const [name,value] of Object.entries(values)) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  }
  if (acidConcentrationMolPerL<=0 || baseConcentrationMolPerL<=0 ||
      acidVolumeMl<=0 || baseVolumeMl<0) {
    throw new RangeError("acid/base concentrations and acid volume must be positive; base volume must be non-negative");
  }
  // mol/L × mL gives mmol. The signed excess strong-acid concentration
  // is [H+] - [OH-] after neutralization. Retain water autoionization:
  // [H+][OH-] = Kw = 1e-14 at 25 °C.
  // Compute the volume-weighted excess concentration without forming
  // concentration×volume products or summing raw volumes first. Those
  // intermediates can overflow even when the final mixed concentration is
  // finite (for example, equal very-large acid/base inputs at equivalence).
  const volumeScale=Math.max(acidVolumeMl,baseVolumeMl);
  const normalizedVolumeSum=acidVolumeMl/volumeScale+baseVolumeMl/volumeScale;
  // Scale each concentration contribution independently. The stable ratio
  // helper recovers products when a tiny volume fraction underflows, while
  // subtracting the resulting finite contributions preserves one-ULP
  // differences near equivalence (logarithms can round those inputs equal).
  const acidContribution=multiplyRatioStable(
    acidVolumeMl,volumeScale,acidConcentrationMolPerL/normalizedVolumeSum
  );
  const baseContribution=baseVolumeMl===0 ? 0 : multiplyRatioStable(
    baseVolumeMl,volumeScale,baseConcentrationMolPerL/normalizedVolumeSum
  );
  const netAcidConcentration=acidContribution-baseContribution;
  if (!Number.isFinite(netAcidConcentration)) {
    throw new RangeError("net acid concentration exceeds the finite numeric range");
  }
  const kw=1e-14;
  const discriminant=Math.hypot(netAcidConcentration,2*Math.sqrt(kw));
  // Solve h² - c·h - Kw = 0. Use the conjugate form for c < 0
  // to avoid catastrophic cancellation in very dilute basic solutions.
  const hydrogenConcentration=netAcidConcentration>=0
    ? netAcidConcentration/2+discriminant/2
    : kw/(discriminant/2-netAcidConcentration/2);
  const pH=-Math.log10(hydrogenConcentration);
  return finiteResult(pH,"strong acid/strong base pH");
}

export function arrheniusRateConstant({ preExponentialFactor, activationEnergyJPerMol, temperatureK }) {
  for (const [name,value] of Object.entries({preExponentialFactor,activationEnergyJPerMol,temperatureK})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (preExponentialFactor < 0 || activationEnergyJPerMol < 0 || temperatureK <= 0) throw new RangeError("Arrhenius parameters are outside their physical domain");
  if (preExponentialFactor === 0) return 0;
  // Divide sequentially to avoid overflowing R*T, and combine the Arrhenius
  // exponential with its prefactor before exp() to avoid premature underflow.
  const exponent = activationEnergyJPerMol === 0 ? 0
    : Math.exp(Math.log(activationEnergyJPerMol) - Math.log(GAS_CONSTANT) - Math.log(temperatureK));
  const logRate = Math.log(preExponentialFactor) - exponent;
  const rate = Math.exp(logRate);
  if (rate === 0) {
    throw new RangeError("positive Arrhenius inputs produce a rate below the representable numeric range");
  }
  return finiteResult(rate, "Arrhenius rate constant");
}


export function projectileMotion({initialSpeed,angleDeg,gravity}) {
  for (const [name,value] of Object.entries({initialSpeed,angleDeg,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (initialSpeed < 0 || angleDeg < 0 || angleDeg > 90 || gravity <= 0) throw new RangeError("projectile parameters are outside their physical domain");
  const angle=angleDeg*Math.PI/180;
  // Preserve exact endpoint physics: cos(90°) is not exactly zero in IEEE-754.
  const vx=angleDeg===90 ? 0 : angleDeg===0 ? initialSpeed : initialSpeed*Math.cos(angle);
  const vy=angleDeg===0 ? 0 : angleDeg===90 ? initialSpeed : initialSpeed*Math.sin(angle);
  // Log-space ratios avoid overflowing 2·vy or vy² before division when the
  // resulting flight time and maximum height are still representable.
  const flightTime=vy===0 ? 0 : Math.exp(Math.log(2)+Math.log(vy)-Math.log(gravity));
  const maxHeight=vy===0 ? 0 : Math.exp(2*Math.log(vy)-Math.log(2)-Math.log(gravity));
  return Object.freeze(finiteResult({
    horizontalVelocity:vx,verticalVelocity:vy,flightTime,
    range:vx===0 ? 0 : vx*flightTime,maxHeight
  }, "projectile motion"));
}
export function pendulumPeriod({lengthM,gravity}) {
  for (const [name,value] of Object.entries({lengthM,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (lengthM <= 0 || gravity <= 0) throw new RangeError("pendulum length and gravity must be positive");
  return finiteResult(2*Math.PI*sqrtPositiveRatio(lengthM,gravity), "pendulum period");
}

/**
 * Advance a nonlinear damped pendulum with bounded-step fourth-order
 * Runge-Kutta integration. The UI may call this with variable animation-frame
 * deltas; internal substeps are tied to the natural time scale so the result
 * does not depend on the browser refresh rate.
 */
export function pendulumStep({
  angleRad, angularVelocityRadPerS, lengthM, gravity,
  dampingCoefficient = 0, deltaTimeSeconds
}) {
  const values = { angleRad, angularVelocityRadPerS, lengthM, gravity, dampingCoefficient, deltaTimeSeconds };
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) throw new TypeError(name + " must be finite");
  }
  if (lengthM <= 0 || gravity <= 0 || dampingCoefficient < 0 || deltaTimeSeconds < 0) {
    throw new RangeError("pendulum integration parameters are outside their physical domain");
  }
  if (deltaTimeSeconds === 0) {
    return Object.freeze({ angleRad, angularVelocityRadPerS });
  }
  const gravityOverLength = gravity / lengthM;
  if (!Number.isFinite(gravityOverLength)) {
    throw new RangeError("pendulum angular acceleration exceeds the finite numeric range");
  }
  const naturalTimeScale = sqrtPositiveRatio(lengthM, gravity);
  const maxStep = naturalTimeScale * 0.01;
  const stepCount = Math.max(1, Math.ceil(deltaTimeSeconds / maxStep));
  if (!Number.isSafeInteger(stepCount) || stepCount > 10000) {
    throw new RangeError("pendulum time step exceeds the 10000-substep integration limit");
  }
  const h = deltaTimeSeconds / stepCount;
  const acceleration = (angle, velocity) =>
    -gravityOverLength * Math.sin(angle) - dampingCoefficient * velocity;
  let angle = angleRad;
  let velocity = angularVelocityRadPerS;
  for (let index = 0; index < stepCount; index += 1) {
    const k1Angle = velocity;
    const k1Velocity = acceleration(angle, velocity);
    const k2Angle = velocity + h * k1Velocity / 2;
    const k2Velocity = acceleration(angle + h * k1Angle / 2, velocity + h * k1Velocity / 2);
    const k3Angle = velocity + h * k2Velocity / 2;
    const k3Velocity = acceleration(angle + h * k2Angle / 2, velocity + h * k2Velocity / 2);
    const k4Angle = velocity + h * k3Velocity;
    const k4Velocity = acceleration(angle + h * k3Angle, velocity + h * k3Velocity);
    angle += h * (k1Angle + 2 * k2Angle + 2 * k3Angle + k4Angle) / 6;
    velocity += h * (k1Velocity + 2 * k2Velocity + 2 * k3Velocity + k4Velocity) / 6;
  }
  return Object.freeze(finiteResult({ angleRad: angle, angularVelocityRadPerS: velocity }, "pendulum integration"));
}
export function ohmsLaw({voltageV,resistanceOhm}) {
  for (const [name,value] of Object.entries({voltageV,resistanceOhm})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (resistanceOhm <= 0) throw new RangeError("resistance must be positive");
  const currentA=voltageV/resistanceOhm;
  const powerW=voltageV*currentA;
  // Minute-scale heat can remain representable even when the instantaneous
  // power rounds to zero at the subnormal boundary. Evaluate it independently.
  const heatJPerMinute=voltageV===0 ? 0 : powerW>0 ? powerW*60 : Math.exp(
    2*Math.log(Math.abs(voltageV))-Math.log(resistanceOhm)+Math.log(60)
  );
  return Object.freeze(finiteResult({currentA,powerW,heatJPerMinute}, "Ohm's law result"));
}
export function inclinedPlaneForces({angleDeg,frictionCoefficient,massKg=1,gravity=9.80665}) {
  for (const [name,value] of Object.entries({angleDeg,frictionCoefficient,massKg,gravity})) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  }
  if (angleDeg < 0 || angleDeg > 90 || frictionCoefficient < 0 || massKg <= 0 || gravity <= 0) {
    throw new RangeError("inclined-plane force parameters are outside their physical domain");
  }
  const angle=angleDeg*Math.PI/180;
  const weight=massKg*gravity;
  const normalForce=angleDeg===90 ? 0 : weight*Math.cos(angle);
  const parallelGravity=weight*Math.sin(angle);
  // Below the slip threshold, static friction balances the downslope component;
  // above it, the simplified model uses μN as kinetic friction.
  const slipping=parallelGravity > frictionCoefficient*normalForce;
  const frictionForce=slipping ? frictionCoefficient*normalForce : parallelGravity;
  const acceleration=slipping ? (parallelGravity-frictionForce)/massKg : 0;
  const forces=finiteResult({
    normalForce,parallelGravity,frictionForce,acceleration
  },"inclined-plane forces");
  return Object.freeze({...forces,slipping});
}

export function inclinedPlaneAcceleration({angleDeg,frictionCoefficient,gravity=9.80665}) {
  for (const [name,value] of Object.entries({angleDeg,frictionCoefficient,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (angleDeg < 0 || angleDeg > 90 || frictionCoefficient < 0 || gravity <= 0) throw new RangeError("inclined-plane parameters are outside their physical domain");
  // At 90° the normal force is exactly zero, so friction must contribute
  // nothing. Avoid the small non-zero cos(π/2) floating-point residue.
  if (angleDeg === 90) return gravity;
  const angle=angleDeg*Math.PI/180;
  return finiteResult(Math.max(0,gravity*(Math.sin(angle)-frictionCoefficient*Math.cos(angle))), "inclined-plane acceleration");
}


export function springOscillator({massKg,springConstantNPerM,displacementM,velocityMPerS}) {
  for (const [name,value] of Object.entries({massKg,springConstantNPerM,displacementM,velocityMPerS})) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  }
  if (massKg <= 0 || springConstantNPerM <= 0) throw new RangeError("mass and spring constant must be positive");
  const angularFrequency=sqrtPositiveRatio(springConstantNPerM,massKg);
  const acceleration=displacementM === 0 ? 0 : -multiplyRatioStable(springConstantNPerM,massKg,displacementM);
  const kineticEnergy=halfScaledSquare(massKg,velocityMPerS);
  const elasticPotentialEnergy=halfScaledSquare(springConstantNPerM,displacementM);
  return Object.freeze(finiteResult({
    acceleration,
    angularFrequency,
    period:2*Math.PI/angularFrequency,
    kineticEnergy,
    elasticPotentialEnergy,
    totalEnergy:kineticEnergy+elasticPotentialEnergy
  }, "spring oscillator result"));
}

export { compareExperimentArchiveSnapshots } from './experiment-archive-comparison.js';

/* ------------------------------------------------------------------
 * Local error event log (wave 4, item 4 — pattern replicated from
 * Human-Digital-Twin-Health). Sentry's event model — structured
 * events with a closed kind set, a whitelisted context summary and
 * fingerprint grouping with counts — but nothing ever leaves the
 * device: events are appended to a localStorage-backed list owned
 * by the UI layer and leave only inside a user-triggered export
 * file attached to a support report. Before this log existed, every
 * archive failure below was a transient toast or a console line; a
 * user reporting a problem had nothing to show.
 *
 * Privacy discipline (structural, not by convention):
 * - `kind` is a closed set of failure-path identifiers, never free
 *   text from data.
 * - `context` passes through a key whitelist and scalar-only filter:
 *   stage labels, the error's class name, row counts, file sizes,
 *   booleans. Archive content (experiment names, observation notes,
 *   parameter values) has no whitelisted key to travel through, so
 *   it cannot enter an event; there is deliberately no generic
 *   "source"/"detail" key, because an archive row's name and note
 *   fields are user text.
 * - `message` is the application's own error wording, truncated;
 *   the archive layer's error messages are static strings, never
 *   record values.
 *
 * Aggregation: events sharing a fingerprint (kind + errorName +
 * stage) merge into one entry with a count and first/last
 * timestamps, so a recurring failure stays one line. The list is
 * capped at ERROR_EVENT_LOG_MAX_EVENTS distinct fingerprints,
 * oldest-first rolling (the same append-with-cap discipline as the
 * penny review log; the numeric cap is 200).
 * ------------------------------------------------------------------ */

export const ERROR_EVENT_LOG_SCHEMA_VERSION = 1;
export const ERROR_EVENT_LOG_STORAGE_KIND = "local-browser-error-log";
export const ERROR_EVENT_LOG_MAX_EVENTS = 200;

export const ERROR_EVENT_KINDS = Object.freeze([
  "domain_unavailable",
  "recovery_locked",
  "import_rejected",
  "save_failed",
  "storage_fault",
  "export_failed"
]);

const errorEventKindSet = new Set(ERROR_EVENT_KINDS);

// The only context keys an event may carry. Anything else the caller
// passes is dropped here, in the domain layer, regardless of caller.
const ERROR_EVENT_CONTEXT_KEYS = Object.freeze([
  "stage", "errorName", "storageKind",
  "rowCount", "fileSizeBytes", "preserved", "fallback"
]);
const errorEventContextKeySet = new Set(ERROR_EVENT_CONTEXT_KEYS);

function sanitizeErrorEventContext(context) {
  const clean = {};
  if (!context || typeof context !== "object" || Array.isArray(context)) return clean;
  for (const key of ERROR_EVENT_CONTEXT_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(context, key)) continue;
    const value = context[key];
    if (typeof value === "string") clean[key] = value.slice(0, 64);
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean") clean[key] = value;
  }
  return clean;
}

export function errorEventFingerprint(kind, context) {
  const clean = sanitizeErrorEventContext(context);
  const parts = [kind, clean.errorName || "", clean.stage || ""];
  return parts.map(part => String(part).toLowerCase()).join("|");
}

function errorEventId(fingerprint, at) {
  let hash = 5381;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) + hash + fingerprint.charCodeAt(i)) >>> 0;
  }
  return "err-" + hash.toString(16) + "-" + String(Date.parse(at) || 0);
}

export function buildErrorEvent(input, at) {
  if (!input || typeof input !== "object") throw new TypeError("error event input must be an object");
  if (!errorEventKindSet.has(input.kind)) {
    throw new TypeError("unsupported error event kind: " + String(input.kind));
  }
  const timestamp = typeof at === "string" && Number.isFinite(Date.parse(at)) ? at : new Date().toISOString();
  const context = sanitizeErrorEventContext(input.context);
  const fingerprint = errorEventFingerprint(input.kind, context);
  return {
    id: errorEventId(fingerprint, timestamp),
    at: timestamp,
    lastAt: timestamp,
    kind: input.kind,
    message: typeof input.message === "string" ? input.message.slice(0, 240) : "",
    fingerprint,
    count: 1,
    context
  };
}

function isErrorEvent(value) {
  return !!value && typeof value === "object" && !Array.isArray(value) &&
    errorEventKindSet.has(value.kind) &&
    typeof value.fingerprint === "string" && value.fingerprint.length > 0 &&
    typeof value.at === "string" && Number.isFinite(Date.parse(value.at)) &&
    Number.isInteger(value.count) && value.count >= 1;
}

// Append one failure to the log. Pure: returns a new array, never
// mutates the input list or its events. A repeat of an existing
// fingerprint increments that entry's count and lastAt instead of
// adding a row; once the cap is reached the oldest entries roll off.
export function appendErrorEvent(events, input, at) {
  if (!Array.isArray(events)) throw new TypeError("error event log must be an array");
  const event = buildErrorEvent(input, at);
  const existing = events.filter(isErrorEvent);
  const index = existing.findIndex(entry => entry.fingerprint === event.fingerprint);
  let next;
  if (index >= 0) {
    const merged = {
      ...existing[index],
      lastAt: event.at,
      message: event.message || existing[index].message,
      count: existing[index].count + 1
    };
    next = [...existing.slice(0, index), merged, ...existing.slice(index + 1)];
  } else {
    next = [...existing, event];
  }
  if (next.length > ERROR_EVENT_LOG_MAX_EVENTS) {
    next = next.slice(next.length - ERROR_EVENT_LOG_MAX_EVENTS);
  }
  return next;
}

export function summarizeErrorEvents(events) {
  if (!Array.isArray(events)) throw new TypeError("error event log must be an array");
  return events.filter(isErrorEvent)
    .map(entry => ({
      fingerprint: entry.fingerprint,
      kind: entry.kind,
      count: entry.count,
      firstAt: entry.at,
      lastAt: entry.lastAt
    }))
    .sort((a, b) => b.count - a.count || String(a.fingerprint).localeCompare(String(b.fingerprint)));
}

export function buildErrorLogExport(events, exportedAt) {
  if (!Array.isArray(events)) throw new TypeError("error event log must be an array");
  const clean = events.filter(isErrorEvent);
  return {
    schemaVersion: ERROR_EVENT_LOG_SCHEMA_VERSION,
    exportedAt,
    storage: ERROR_EVENT_LOG_STORAGE_KIND,
    eventCount: clean.length,
    totalOccurrences: clean.reduce((sum, entry) => sum + entry.count, 0),
    groups: summarizeErrorEvents(clean),
    events: clean
  };
}

/* ------------------------------------------------------------------
 * Experiment archive migration registry (wave 4, item 2 — pattern
 * from data-migration-registry-spec-v1, pilots EKPO 906e9468 and
 * Health 7de0ec68).
 *
 * PhysChem's archive differs from the spec's root-object repos: the
 * stored value is a bare JSON array of experiment records, and the
 * version lives inside each record — `experimentSnapshotVersion`.
 * Two record generations coexist:
 *   version 0 (legacy): parameter-only records with no
 *     `experimentSnapshotVersion` field (pre-metadata archives);
 *   version 1 (current): reproducibility snapshots carrying
 *     `experimentSnapshotVersion: 1` plus `snapshotAt`, readouts,
 *     formula and tutor snapshots.
 * Generations are NOT transformed into each other: a legacy record
 * has no snapshot timestamp or readouts, and fabricating them would
 * invent data. The registered chain is therefore legitimately
 * empty — legacy rows are probed by shape, current rows are
 * validated, and both load side by side. What this registry adds
 * over the previously scattered UI checks is a single domain-layer
 * home for the version constants, the legacy probe, the inspection
 * pipeline every read path can share, and the load trace
 * ({ loadedVersion, migratedFrom }) the spec requires.
 *
 * Deliberate deviations, with reasons:
 * - No root-level schemaVersion: the healthy export format is a
 *   bare array (pinned by scripts/validate-storage-recovery.cjs)
 *   and every existing user backup is a bare array; wrapping the
 *   root in an envelope would break both. The in-data version is
 *   the per-record field above.
 * - The storage key `physchem_lab_saved_experiments_v1` keeps its
 *   historical `_v1` suffix: key names are frozen (spec §2) and no
 *   code parses the suffix to infer a version — the record field
 *   is the only version source.
 * - The startup load in assets/js/legacy-app.js runs synchronously
 *   while the page script is evaluated, before this module can be
 *   imported, so that one path keeps its segment-local validators
 *   (they mirror the rules below and are cross-checked against
 *   this registry by test/archive-migration-registry.test.js).
 *   The import/restore path, which runs after boot, goes through
 *   inspectExperimentArchive whenever the domain module is loaded.
 * ------------------------------------------------------------------ */

export const EXPERIMENT_ARCHIVE_BASELINE_VERSION = 0;
export const EXPERIMENT_ARCHIVE_CURRENT_VERSION = 1;
export const EXPERIMENT_ARCHIVE_RECOVERY_FORMAT = "physchem-lab-archive-recovery";
export const EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION = 1;
export const EXPERIMENT_ARCHIVE_MAX_RECORDS = 30;

// Registered transformation steps, oldest first. Empty by design
// (see the header): generations coexist by validation, never by
// rewriting a legacy record into a snapshot.
export const EXPERIMENT_ARCHIVE_MIGRATIONS = Object.freeze([]);

// Registry self-check (spec §3.6): chain steps, when any exist,
// must be consecutive { from, to: from + 1, apply, note } entries
// ending at the current version.
export function validateExperimentArchiveRegistry() {
  if (!Number.isSafeInteger(EXPERIMENT_ARCHIVE_BASELINE_VERSION) ||
      !Number.isSafeInteger(EXPERIMENT_ARCHIVE_CURRENT_VERSION) ||
      EXPERIMENT_ARCHIVE_CURRENT_VERSION <= EXPERIMENT_ARCHIVE_BASELINE_VERSION) {
    throw new TypeError("archive registry versions must be increasing integers");
  }
  if (EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION !== EXPERIMENT_ARCHIVE_CURRENT_VERSION) {
    throw new TypeError("recovery envelope version must equal the current archive version");
  }
  let expectedFrom = EXPERIMENT_ARCHIVE_BASELINE_VERSION;
  for (const step of EXPERIMENT_ARCHIVE_MIGRATIONS) {
    if (!step || step.from !== expectedFrom || step.to !== step.from + 1 ||
        typeof step.apply !== "function" || typeof step.note !== "string" || !step.note) {
      throw new TypeError("archive migration chain is not consecutive from the baseline");
    }
    expectedFrom = step.to;
  }
  if (EXPERIMENT_ARCHIVE_MIGRATIONS.length &&
      expectedFrom !== EXPERIMENT_ARCHIVE_CURRENT_VERSION) {
    throw new TypeError("archive migration chain must end at the current version");
  }
  return true;
}

const EXPERIMENT_ARCHIVE_ROW_FIELDS = Object.freeze([
  "name", "time", "params", "note", "readouts", "formulaSnapshot",
  "tutorSnapshot", "experimentId", "modelVersion",
  "experimentSnapshotVersion", "snapshotAt"
]);

// One archive record at either registered generation. Mirrors the
// UI segment validator rule for rule; the cross-check test pins
// the two implementations to identical verdicts on shared fixtures.
export function isValidExperimentArchiveRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return false;
  if (Object.keys(row).some(key => !EXPERIMENT_ARCHIVE_ROW_FIELDS.includes(key))) return false;
  if (typeof row.name !== "string" || !row.name.trim() || row.name.length > 160) return false;
  if (typeof row.time !== "string" || !row.time.trim() || row.time.length > 80) return false;
  if (row.experimentId !== undefined &&
      (typeof row.experimentId !== "string" || !row.experimentId.trim() || row.experimentId.length > 80)) return false;
  if (row.modelVersion !== undefined &&
      (typeof row.modelVersion !== "string" || !row.modelVersion.trim() || row.modelVersion.length > 80)) return false;
  if (row.experimentSnapshotVersion !== undefined && row.experimentSnapshotVersion !== 1) return false;
  if (row.experimentSnapshotVersion === 1 && (!row.experimentId || row.snapshotAt === undefined)) return false;
  if (row.snapshotAt !== undefined && row.experimentSnapshotVersion !== 1) return false;
  if (row.snapshotAt !== undefined && (typeof row.snapshotAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.snapshotAt) ||
      !Number.isFinite(Date.parse(row.snapshotAt)) ||
      new Date(Date.parse(row.snapshotAt)).toISOString() !== row.snapshotAt)) return false;
  if (row.note !== undefined && (typeof row.note !== "string" || row.note.length > 1200 ||
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(row.note))) return false;
  if (row.readouts !== undefined && (!Array.isArray(row.readouts) || row.readouts.length > 30 ||
      !row.readouts.every(entry =>
        !!entry && typeof entry === "object" && !Array.isArray(entry) &&
        typeof entry.label === "string" && entry.label.trim().length > 0 && entry.label.length <= 120 &&
        typeof entry.value === "string" && entry.value.length <= 180))) return false;
  if (row.formulaSnapshot !== undefined && (!Array.isArray(row.formulaSnapshot) ||
      row.formulaSnapshot.length > 20 || !row.formulaSnapshot.every(entry =>
        typeof entry === "string" && entry.length > 0 && entry.length <= 300))) return false;
  if (row.tutorSnapshot !== undefined &&
      (typeof row.tutorSnapshot !== "string" || row.tutorSnapshot.length > 2400)) return false;
  if (!row.params || typeof row.params !== "object" || Array.isArray(row.params)) return false;
  const keys = Object.keys(row.params);
  if (keys.length < 1 || keys.length > 30) return false;
  return keys.every(key =>
    /^[A-Za-z][A-Za-z0-9_]*$/.test(key) && Number.isFinite(row.params[key]));
}

// The legacy probe (spec §4 step 2): a version-0 record is a valid
// archive record that simply predates snapshot metadata. Shape
// mismatch is not "legacy" — it is invalid, and callers reject it.
export function isLegacyExperimentArchiveRow(row) {
  return !!row && typeof row === "object" && !Array.isArray(row) &&
    row.experimentSnapshotVersion === undefined && isValidExperimentArchiveRow(row);
}

// Which registered generation a record belongs to, or why it
// cannot be read at all. An integer snapshot version above the
// current one is reported distinctly so callers can say "from a
// newer version" instead of guessing at its shape (spec §4 step 2).
export function classifyExperimentArchiveRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return { ok: false, error: "invalid-shape" };
  const version = row.experimentSnapshotVersion;
  if (version !== undefined) {
    if (Number.isSafeInteger(version) && version > EXPERIMENT_ARCHIVE_CURRENT_VERSION) {
      return { ok: false, error: "unsupported-version", version };
    }
    if (version !== EXPERIMENT_ARCHIVE_CURRENT_VERSION) return { ok: false, error: "invalid-shape" };
  }
  if (!isValidExperimentArchiveRow(row)) return { ok: false, error: "invalid-shape" };
  return { ok: true, version: version === undefined ? EXPERIMENT_ARCHIVE_BASELINE_VERSION : version };
}

function inspectExperimentArchiveRows(rows) {
  if (!Array.isArray(rows) || rows.length > EXPERIMENT_ARCHIVE_MAX_RECORDS) {
    return { ok: false, error: "invalid-shape" };
  }
  for (const row of rows) {
    const verdict = classifyExperimentArchiveRow(row);
    if (!verdict.ok) return verdict;
  }
  const identities = Object.create(null);
  for (const row of rows) {
    if (row.experimentSnapshotVersion !== 1 || !row.experimentId || !row.snapshotAt) continue;
    const parameters = Object.keys(row.params).sort().map(key => [key, row.params[key]]);
    const identity = JSON.stringify([row.experimentId, row.snapshotAt, parameters]);
    if (identities[identity]) return { ok: false, error: "invalid-shape" };
    identities[identity] = true;
  }
  const loadedVersion = rows.length === 0
    ? EXPERIMENT_ARCHIVE_CURRENT_VERSION
    : Math.max(...rows.map(row =>
        row.experimentSnapshotVersion === undefined
          ? EXPERIMENT_ARCHIVE_BASELINE_VERSION
          : row.experimentSnapshotVersion));
  // migratedFrom is always null: the chain is empty, so a load
  // never rewrites data — the trace records what was read, and a
  // future registered step will start reporting real migrations.
  return { ok: true, rows, loadedVersion, migratedFrom: null };
}

// The single inspection pipeline for parsed archive candidates
// (spec §4): a bare record list, or a recovery envelope whose
// embedded raw archive is parsed and inspected the same way.
// Pure — the input is never mutated. Returns
// { ok: true, rows, loadedVersion, migratedFrom, source } or
// { ok: false, error } with error one of 'invalid-shape',
// 'unsupported-version', 'invalid-envelope'.
export function inspectExperimentArchive(input, options) {
  const storageKey = options && typeof options.storageKey === "string" ? options.storageKey : null;
  let candidate = input;
  let source = "list";
  if (candidate && !Array.isArray(candidate) && candidate.format === EXPERIMENT_ARCHIVE_RECOVERY_FORMAT) {
    const version = candidate.version;
    if (Number.isSafeInteger(version) && version > EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION) {
      return { ok: false, error: "unsupported-version", version };
    }
    if (version !== EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION ||
        (storageKey !== null && candidate.storageKey !== storageKey) ||
        typeof candidate.rawValue !== "string") {
      return { ok: false, error: "invalid-envelope" };
    }
    try { candidate = JSON.parse(candidate.rawValue); }
    catch { return { ok: false, error: "invalid-envelope" }; }
    source = "envelope";
  }
  const inspected = inspectExperimentArchiveRows(candidate);
  if (!inspected.ok) return inspected;
  return { ...inspected, source };
}

/* ------------------------------------------------------------------
 * Unified backup envelope (wave 6, item 3 — replicated from the
 * Human-Digital-Twin-Health pilot, adapted to this repository's
 * bare-array archive).
 *
 * One fixed container for a full backup, independent of the
 * delivery channel: a manifest plus the datasets themselves, each
 * dataset kept in exactly the shape its existing exporter already
 * produces. This repository's healthy export is the bare record
 * array itself, so the envelope's single dataset ("archive") is
 * that array, unchanged — existing user backups (bare arrays, and
 * the physchem-lab-archive-recovery raw packet) keep importing
 * through inspectExperimentArchive exactly as before; the envelope
 * is an additional wrapper, never a replacement format. The
 * wrapper is what the age-encrypted export encrypts, and what the
 * import path pre-checks before the rows reach
 * inspectExperimentArchive above.
 *
 * Manifest discipline mirrors this registry: the envelope carries
 * its own schemaVersion, exportedBy and exportedAt, and lists the
 * archive dataset with its registry version and record count. The
 * dataset version is the archive's loadedVersion as the registry
 * defines it — the highest per-record generation present (legacy
 * records count as the baseline 0), or the current version for an
 * empty archive. Judgements:
 * - An envelope whose schemaVersion is not BACKUP_ENVELOPE_VERSION
 *   is rejected explicitly (a higher version is never guessed at).
 * - A listed dataset missing from the payload, an unlisted dataset
 *   present in the payload, a dataset version above this registry's
 *   current version (or one that does not match the payload's own
 *   computed generation), or a record count that does not match
 *   the array all reject the whole envelope before any row is
 *   inspected or restored.
 * - The passphrase for the encrypted form never enters this layer:
 *   the envelope is plaintext by construction, and encryption
 *   happens in the UI layer around the serialized envelope.
 * ------------------------------------------------------------------ */

export const BACKUP_ENVELOPE_VERSION = 1;
export const BACKUP_ENVELOPE_FORMAT = "physchem-backup-envelope";
export const BACKUP_ENVELOPE_EXPORTED_BY = "Physchem-lab";
export const ARCHIVE_DATASET_KEY = "archive";

// First bytes of every age v1 file (binary form) and of the ASCII
// armored form. The import path uses this to route a picked file to
// the decrypt step before any JSON parsing is attempted.
export const AGE_V1_HEADER = "age-encryption.org/v1";
export const AGE_ARMOR_HEADER = "-----BEGIN AGE ENCRYPTED FILE-----";

export function looksLikeAgeCiphertext(bytes) {
  if (!bytes || typeof bytes.length !== "number") return false;
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const head = String.fromCharCode(...view.subarray(0, 36));
  return head.startsWith(AGE_V1_HEADER) || head.startsWith(AGE_ARMOR_HEADER);
}

function isEnvelopeRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// The archive dataset's registry version: the highest per-record
// generation present (a record without experimentSnapshotVersion
// is the legacy baseline), or the current version for an empty
// archive — the same loadedVersion rule inspectExperimentArchive
// reports. Returns null when a row's stamp is not a safe integer,
// which callers treat as an invalid dataset rather than guessing.
export function experimentArchiveDatasetVersion(rows) {
  if (!Array.isArray(rows)) return null;
  if (rows.length === 0) return EXPERIMENT_ARCHIVE_CURRENT_VERSION;
  let version = EXPERIMENT_ARCHIVE_BASELINE_VERSION;
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    const stamp = row.experimentSnapshotVersion;
    if (stamp === undefined) continue;
    if (!Number.isSafeInteger(stamp)) return null;
    if (stamp > version) version = stamp;
  }
  return version;
}

export function buildUnifiedBackupEnvelope(rows, exportedAt) {
  if (!Array.isArray(rows)) {
    throw new TypeError("备份信封构建失败；实验档案不是记录数组。");
  }
  const version = experimentArchiveDatasetVersion(rows);
  if (version === null) {
    throw new TypeError("备份信封构建失败；实验档案中存在版本戳记无效的记录。");
  }
  return {
    format: BACKUP_ENVELOPE_FORMAT,
    manifest: {
      schemaVersion: BACKUP_ENVELOPE_VERSION,
      exportedBy: BACKUP_ENVELOPE_EXPORTED_BY,
      exportedAt,
      datasets: [
        {
          key: ARCHIVE_DATASET_KEY,
          schemaVersion: version,
          storage: "local-browser",
          count: rows.length
        }
      ]
    },
    datasets: {
      [ARCHIVE_DATASET_KEY]: rows
    }
  };
}

export function isUnifiedBackupEnvelope(payload) {
  return isEnvelopeRecord(payload) &&
    payload.format === BACKUP_ENVELOPE_FORMAT &&
    isEnvelopeRecord(payload.manifest) &&
    isEnvelopeRecord(payload.datasets);
}

// Pre-check an incoming unified envelope and return the archive
// record array, ready for inspectExperimentArchive — the exact
// same inspection a stored value or a bare-array backup goes
// through. Every rejection is an explicit TypeError with
// user-facing wording, raised before any record is inspected.
export function parseUnifiedBackupEnvelope(payload) {
  if (!isUnifiedBackupEnvelope(payload)) {
    throw new TypeError("备份信封格式无效；需要统一备份信封（physchem-backup-envelope）。");
  }
  const manifest = payload.manifest;
  if (manifest.schemaVersion !== BACKUP_ENVELOPE_VERSION) {
    throw new TypeError("备份信封版本不受支持；需要信封 schemaVersion " + BACKUP_ENVELOPE_VERSION +
      "，文件为 " + String(manifest.schemaVersion) + "。版本过高时请先升级应用再导入。");
  }
  if (!Array.isArray(manifest.datasets) || !manifest.datasets.length) {
    throw new TypeError("备份信封清单无效；manifest.datasets 必须是非空数组。");
  }
  const listed = new Map();
  for (const entry of manifest.datasets) {
    if (!isEnvelopeRecord(entry) || typeof entry.key !== "string" || !entry.key) {
      throw new TypeError("备份信封清单无效；数据集条目缺少 key。");
    }
    if (listed.has(entry.key)) {
      throw new TypeError("备份信封清单无效；数据集 " + entry.key + " 被重复列出。");
    }
    listed.set(entry.key, entry);
  }
  for (const key of Object.keys(payload.datasets)) {
    if (!listed.has(key)) {
      throw new TypeError("备份信封完整性校验失败；数据集 " + key + " 未在清单中列出。");
    }
  }
  for (const [key, entry] of listed) {
    const dataset = payload.datasets[key];
    if (dataset === undefined) {
      throw new TypeError("备份信封完整性校验失败；清单列出的数据集 " + key + " 在文件中缺失。");
    }
    if (!Number.isSafeInteger(entry.schemaVersion)) {
      throw new TypeError("备份信封清单无效；数据集 " + key + " 的 schemaVersion 不是整数。");
    }
    if (entry.schemaVersion > EXPERIMENT_ARCHIVE_CURRENT_VERSION) {
      throw new TypeError("备份信封中数据集 " + key + " 的版本不受支持；需要数据版本不高于 " +
        EXPERIMENT_ARCHIVE_CURRENT_VERSION + "，文件为 " + String(entry.schemaVersion) + "。");
    }
    if (!Array.isArray(dataset)) {
      throw new TypeError("备份信封完整性校验失败；数据集 " + key + " 不是记录数组。");
    }
    const actualVersion = experimentArchiveDatasetVersion(dataset);
    if (actualVersion === null) {
      throw new TypeError("备份信封完整性校验失败；数据集 " + key + " 中存在版本戳记无效的记录。");
    }
    if (entry.schemaVersion !== actualVersion) {
      throw new TypeError("备份信封完整性校验失败；数据集 " + key + " 清单版本 " +
        String(entry.schemaVersion) + " 与数据自身版本 " + String(actualVersion) + " 不一致。");
    }
    if (entry.count !== dataset.length) {
      throw new TypeError("备份信封完整性校验失败；数据集 " + key + " 清单计数 " +
        String(entry.count) + " 与实际条目 " + String(dataset.length) + " 不一致。");
    }
  }
  const rows = payload.datasets[ARCHIVE_DATASET_KEY];
  if (rows === undefined) {
    throw new TypeError("备份信封中缺少实验档案数据集（archive）。");
  }
  return rows;
}
