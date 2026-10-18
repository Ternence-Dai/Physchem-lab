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
export function idealGasPressure({ amountMol, temperatureK, volumeM3 }) {
  for (const [name,value] of Object.entries({amountMol,temperatureK,volumeM3})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (amountMol < 0 || temperatureK <= 0 || volumeM3 <= 0) throw new RangeError("amount must be non-negative; temperature and volume must be positive");
  if (amountMol === 0) return 0;
  // Evaluate the positive product/quotient in log space so an intermediate
  // amount/volume underflow does not erase a representable final pressure.
  return finiteResult(Math.exp(Math.log(amountMol) - Math.log(volumeM3) + Math.log(GAS_CONSTANT) + Math.log(temperatureK)), "ideal gas pressure");
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
  return Object.freeze(finiteResult({
    rmsSpeed,
    averageKineticEnergyJ,
    numberDensityPerM3
  }, "ideal-gas particle properties"));
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
  // Joule heating is electrical power integrated over one minute. Reuse the
  // validated power result instead of squaring current first, which can
  // overflow even when multiplying I² by a tiny resistance would be finite.
  const heatJPerMinute=powerW*60;
  return Object.freeze(finiteResult({currentA,powerW,heatJPerMinute}, "Ohm's law result"));
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
