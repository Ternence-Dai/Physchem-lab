import assert from "node:assert/strict";
import {
  projectileMotion,
  pendulumPeriod,
  springOscillator,
  ohmsLaw,
  inclinedPlaneForces,
  idealGasPressure,
  idealGasParticleProperties,
  strongAcidStrongBasePH,
  arrheniusRateConstant
} from "../src/domain/index.js";

function close(label, actual, expected, relativeTolerance = 1e-11) {
  assert.ok(Number.isFinite(actual), label + ": actual result must be finite");
  const limit = Math.max(1e-14, Math.abs(expected) * relativeTolerance);
  const error = Math.abs(actual - expected);
  assert.ok(error <= limit,
    label + ": expected " + expected + " ± " + limit + ", received " + actual);
}

// p1: ideal projectile launched and landing at the same elevation, no drag.
{
  const result = projectileMotion({
    initialSpeed: 20,
    angleDeg: 30,
    gravity: 9.8
  });
  close("p1.horizontalVelocity", result.horizontalVelocity, 17.320508075688775);
  close("p1.verticalVelocity", result.verticalVelocity, 10);
  close("p1.flightTime", result.flightTime, 2.040816326530612);
  close("p1.range", result.range, 35.34797566467096);
  close("p1.maximumHeight", result.maxHeight, 5.102040816326529);
}

// p2: undamped, small-angle pendulum reference period only. The damped,
// nonlinear Runge-Kutta animation is explicitly outside this benchmark.
{
  const result = pendulumPeriod({ lengthM: 0.8, gravity: 9.80665 });
  close("p2.undampedSmallAnglePeriod", result, 1.7945870275665439);
}

// p3: conservative linear spring oscillator; state energies are calculated
// independently from 1/2 mv² and 1/2 kx².
{
  const result = springOscillator({
    massKg: 1.5,
    springConstantNPerM: 30,
    displacementM: 0.4,
    velocityMPerS: 0.8
  });
  close("p3.angularFrequency", result.angularFrequency, 4.47213595499958);
  close("p3.period", result.period, 1.4049629462081452);
  close("p3.acceleration", result.acceleration, -8);
  close("p3.kineticEnergy", result.kineticEnergy, 0.48);
  close("p3.elasticPotentialEnergy", result.elasticPotentialEnergy, 2.4);
  close("p3.totalEnergy", result.totalEnergy, 2.88);
}

// p4: DC ohmic resistor, fixed resistance.
{
  const result = ohmsLaw({ voltageV: 12, resistanceOhm: 6 });
  close("p4.current", result.currentA, 2);
  close("p4.power", result.powerW, 24);
  close("p4.heatOverOneMinute", result.heatJPerMinute, 1440);
}

// p5: documented prototype simplification: the same mu parameter is used
// for the slip threshold and sliding friction. This is an analytical check
// of that declared simplified model, not a measured friction coefficient.
{
  const result = inclinedPlaneForces({
    angleDeg: 30,
    frictionCoefficient: 0.2,
    massKg: 2,
    gravity: 9.80665
  });
  assert.equal(result.slipping, true);
  close("p5.normalForce", result.normalForce, 16.98561605204533);
  close("p5.parallelGravity", result.parallelGravity, 9.80665);
  close("p5.frictionForce", result.frictionForce, 3.3971232104090663);
  close("p5.acceleration", result.acceleration, 3.2047633947954655);
}

// p6: ideal-gas law and translational kinetic theory; fixed approximate dry-air
// molar mass is part of this specific reference vector.
{
  const input = {
    amountMol: 0.5,
    temperatureK: 300,
    volumeM3: 0.012
  };
  close("p6.pressurePa",
    idealGasPressure(input),
    103930.78272500001);
  const result = idealGasParticleProperties({
    ...input,
    molarMassKgPerMol: 0.02897
  });
  close("p6.rmsSpeed", result.rmsSpeed, 508.234449831825);
  close("p6.meanTranslationalKineticEnergyJ",
    result.averageKineticEnergyJ,
    6.2129205000000004e-21);
  close("p6.numberDensityPerM3",
    result.numberDensityPerM3,
    2.5092253166666665e25);
}

// p7: strong monoprotic acid / strong monoprotic base at 25 °C;
// concentration-activity deviations are outside this vector.
{
  const result = strongAcidStrongBasePH({
    acidConcentrationMolPerL: 0.1,
    acidVolumeMl: 20,
    baseConcentrationMolPerL: 0.1,
    baseVolumeMl: 10
  });
  close("p7.excessStrongAcidPH", result, 1.4771212547157537);
  const equivalence = strongAcidStrongBasePH({
    acidConcentrationMolPerL: 0.1,
    acidVolumeMl: 20,
    baseConcentrationMolPerL: 0.1,
    baseVolumeMl: 20
  });
  close("p7.equivalencePHAt25C", equivalence, 7);
}

// p8: Arrhenius equation with an explicitly declared illustrative prefactor;
// these parameters are not fitted to a named physical reaction.
{
  const result = arrheniusRateConstant({
    preExponentialFactor: 2.5e7,
    activationEnergyJPerMol: 55000,
    temperatureK: 323.15
  });
  close("p8.arrheniusRateConstant", result, 0.03219577450948931);
}

console.log("PhysChem flagship analytic reference vectors passed (p1-p8).");
console.log("Scope: closed-form equation regression only; no experimental calibration or measured dataset is implied.");
