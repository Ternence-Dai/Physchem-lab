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
  if (amountMol > 0 && numberDensityPerM3 === 0) throw new RangeError("number density is below the numeric range");
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
  // A direct volume fraction can underflow even when its product with a
  // large finite concentration would remain representable. Keep each
  // weighted concentration in log space until after the subtraction.
  const logAcidContribution=Math.log(acidConcentrationMolPerL)+
    Math.log(acidVolumeMl)-Math.log(volumeScale)-Math.log(normalizedVolumeSum);
  const logBaseContribution=baseVolumeMl===0 ? Number.NEGATIVE_INFINITY :
    Math.log(baseConcentrationMolPerL)+Math.log(baseVolumeMl)-
    Math.log(volumeScale)-Math.log(normalizedVolumeSum);
  let netAcidConcentration;
  if (logAcidContribution===logBaseContribution) {
    netAcidConcentration=0;
  } else {
    const acidExcess=logAcidContribution>logBaseContribution;
    const largerLog=Math.max(logAcidContribution,logBaseContribution);
    const smallerLog=Math.min(logAcidContribution,logBaseContribution);
    const logDifference=largerLog+Math.log1p(-Math.exp(smallerLog-largerLog));
    const magnitude=Math.exp(logDifference);
    netAcidConcentration=acidExcess ? magnitude : -magnitude;
  }
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
  return finiteResult(Math.exp(Math.log(preExponentialFactor) - exponent), "Arrhenius rate constant");
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
export function inclinedPlaneForces({angleDeg,frictionCoefficient,massKg=1,gravity=9.8}) {
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

export function inclinedPlaneAcceleration({angleDeg,frictionCoefficient,gravity=9.8}) {
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
