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
