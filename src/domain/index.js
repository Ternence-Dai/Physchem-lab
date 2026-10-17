export const GAS_CONSTANT = 8.31446261815324;
export function idealGasPressure({ amountMol, temperatureK, volumeM3 }) {
  for (const [name,value] of Object.entries({amountMol,temperatureK,volumeM3})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (amountMol < 0 || temperatureK <= 0 || volumeM3 <= 0) throw new RangeError("amount must be non-negative; temperature and volume must be positive");
  return amountMol * GAS_CONSTANT * temperatureK / volumeM3;
}
export function arrheniusRateConstant({ preExponentialFactor, activationEnergyJPerMol, temperatureK }) {
  for (const [name,value] of Object.entries({preExponentialFactor,activationEnergyJPerMol,temperatureK})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (preExponentialFactor < 0 || activationEnergyJPerMol < 0 || temperatureK <= 0) throw new RangeError("Arrhenius parameters are outside their physical domain");
  return preExponentialFactor * Math.exp(-activationEnergyJPerMol / (GAS_CONSTANT * temperatureK));
}


export function projectileMotion({initialSpeed,angleDeg,gravity}) {
  for (const [name,value] of Object.entries({initialSpeed,angleDeg,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (initialSpeed < 0 || angleDeg < 0 || angleDeg > 90 || gravity <= 0) throw new RangeError("projectile parameters are outside their physical domain");
  const angle=angleDeg*Math.PI/180, vx=initialSpeed*Math.cos(angle), vy=initialSpeed*Math.sin(angle);
  const flightTime=2*vy/gravity;
  return Object.freeze({horizontalVelocity:vx,verticalVelocity:vy,flightTime,range:vx*flightTime,maxHeight:vy*vy/(2*gravity)});
}
export function pendulumPeriod({lengthM,gravity}) {
  for (const [name,value] of Object.entries({lengthM,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (lengthM <= 0 || gravity <= 0) throw new RangeError("pendulum length and gravity must be positive");
  return 2*Math.PI*Math.sqrt(lengthM/gravity);
}
export function ohmsLaw({voltageV,resistanceOhm}) {
  for (const [name,value] of Object.entries({voltageV,resistanceOhm})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (voltageV < 0 || resistanceOhm <= 0) throw new RangeError("voltage must be non-negative and resistance positive");
  const currentA=voltageV/resistanceOhm;
  return Object.freeze({currentA,powerW:voltageV*currentA,heatJPerMinute:currentA*currentA*resistanceOhm*60});
}
export function inclinedPlaneAcceleration({angleDeg,frictionCoefficient,gravity=9.8}) {
  for (const [name,value] of Object.entries({angleDeg,frictionCoefficient,gravity})) if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  if (angleDeg < 0 || angleDeg >= 90 || frictionCoefficient < 0 || gravity <= 0) throw new RangeError("inclined-plane parameters are outside their physical domain");
  const angle=angleDeg*Math.PI/180;
  return gravity*(Math.sin(angle)-frictionCoefficient*Math.cos(angle));
}
