import test from "node:test";
import assert from "node:assert/strict";
import {
  idealGasPressure, idealGasParticleProperties, strongAcidStrongBasePH, arrheniusRateConstant,
  projectileMotion, pendulumPeriod, ohmsLaw, inclinedPlaneAcceleration, inclinedPlaneForces, springOscillator
} from "../src/domain/index.js";

test("ideal gas law returns SI pressure",()=>{ const p=idealGasPressure({amountMol:1,temperatureK:273.15,volumeM3:0.022414}); assert.ok(Math.abs(p-101325)<1200); });
test("ideal gas calculation avoids avoidable intermediate overflow",()=>{ const pressure=idealGasPressure({amountMol:1e308,temperatureK:1e100,volumeM3:1e308}); assert.ok(Number.isFinite(pressure)); assert.ok(Math.abs(pressure/(8.31446261815324e100)-1)<1e-12); });
test("ideal gas calculation recovers a representable result after ratio underflow",()=>{
 const pressure=idealGasPressure({amountMol:1e-200,temperatureK:1e200,volumeM3:1e200});
 assert.ok(Number.isFinite(pressure) && pressure>0);
 assert.ok(Math.abs(pressure/(8.31446261815324e-200)-1)<1e-12);
});
test("ideal-gas particle properties use consistent SI constants and units",()=>{
 const result=idealGasParticleProperties({
  amountMol:1,temperatureK:300,volumeM3:0.01,molarMassKgPerMol:0.02897
 });
 assert.ok(result.rmsSpeed>500 && result.rmsSpeed<515,
  "room-temperature air RMS speed must be about 508 m/s");
 assert.ok(result.averageKineticEnergyJ>6.1e-21 && result.averageKineticEnergyJ<6.3e-21,
  "mean translational kinetic energy must be about 6.2e-21 J per molecule");
 assert.ok(Math.abs(result.numberDensityPerM3/6.02214076e25-1)<1e-12,
  "one mole in ten litres must contain about 6.022e25 molecules per cubic metre");
 assert.ok(Object.isFrozen(result));
});
test("ideal-gas particle properties preserve zero amount and reject invalid physical inputs",()=>{
 const empty=idealGasParticleProperties({amountMol:0,temperatureK:300,volumeM3:0.01,molarMassKgPerMol:0.02897});
 assert.equal(empty.numberDensityPerM3,0);
 assert.throws(()=>idealGasParticleProperties({amountMol:-1,temperatureK:300,volumeM3:0.01,molarMassKgPerMol:0.02897}),RangeError);
 assert.throws(()=>idealGasParticleProperties({amountMol:1,temperatureK:0,volumeM3:0.01,molarMassKgPerMol:0.02897}),RangeError);
 assert.throws(()=>idealGasParticleProperties({amountMol:1,temperatureK:300,volumeM3:0.01,molarMassKgPerMol:0}),RangeError);
 assert.throws(()=>idealGasParticleProperties({amountMol:1,temperatureK:300,volumeM3:0.01,molarMassKgPerMol:NaN}),TypeError);
});
test("ideal-gas particle properties retain representable outputs across extreme finite scales",()=>{
 const tiny=idealGasParticleProperties({
  amountMol:Number.MIN_VALUE,temperatureK:300,volumeM3:1e23,molarMassKgPerMol:0.02897
 });
 assert.ok(tiny.numberDensityPerM3>0,
  "log-space number density must recover a representable result after amount/volume underflow");
 const extreme=idealGasParticleProperties({
  amountMol:1,temperatureK:1e308,volumeM3:1e308,molarMassKgPerMol:1e308
 });
 assert.ok(Number.isFinite(extreme.rmsSpeed) && extreme.rmsSpeed>0,
  "RMS speed must not overflow at the intermediate 3RT product");
 assert.ok(Number.isFinite(extreme.averageKineticEnergyJ));
 assert.ok(Number.isFinite(extreme.numberDensityPerM3));
});
test("rejects non-positive absolute temperature and volume",()=>{ assert.throws(()=>idealGasPressure({amountMol:1,temperatureK:0,volumeM3:1}),RangeError); assert.throws(()=>idealGasPressure({amountMol:1,temperatureK:300,volumeM3:0}),RangeError); });
test("strong acid/strong base titration pH is correct before, at and after equivalence",()=>{
 const p={acidConcentrationMolPerL:0.1,acidVolumeMl:20,baseConcentrationMolPerL:0.1};
 assert.ok(Math.abs(strongAcidStrongBasePH({...p,baseVolumeMl:0})-1)<1e-12);
 assert.equal(strongAcidStrongBasePH({...p,baseVolumeMl:20}),7);
 const after=strongAcidStrongBasePH({...p,baseVolumeMl:30});
 const excessBaseConcentration=(3-2)/50;
 const expected=14+Math.log10((excessBaseConcentration+
  Math.hypot(excessBaseConcentration,2*Math.sqrt(1e-14)))/2);
 assert.ok(Math.abs(after-expected)<1e-12);
 assert.ok(strongAcidStrongBasePH({...p,baseVolumeMl:19.9})<7);
 assert.ok(strongAcidStrongBasePH({...p,baseVolumeMl:20.1})>7);
});
test("strong acid/base equivalence remains stable when finite input products would overflow",()=>{
 const pH=strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e308,acidVolumeMl:1e308,
  baseConcentrationMolPerL:1e308,baseVolumeMl:1e308
 });
 assert.equal(pH,7,
  "equal acid/base equivalents must remain neutral without overflowing concentration-volume intermediates");
 const acidOnly=strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e308,acidVolumeMl:1e308,
  baseConcentrationMolPerL:1e308,baseVolumeMl:0
 });
 assert.ok(Number.isFinite(acidOnly) && acidOnly<0,
  "a finite high-concentration acid input must yield a finite pH");
});
test("very dilute strong acid and base retain water autoionization near neutral pH",()=>{
 const acid=strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e-10,acidVolumeMl:10,
  baseConcentrationMolPerL:1e-10,baseVolumeMl:0
 });
 const base=strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e-10,acidVolumeMl:10,
  baseConcentrationMolPerL:1e-10,baseVolumeMl:20
 });
 assert.ok(acid<7 && acid>6.99,"a 1e-10 M strong acid must be slightly acidic, not pH 10");
 assert.ok(base>7 && base<7.01,"a 1e-10 M excess strong base must be slightly basic");
 assert.ok(Math.abs(strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e-10,acidVolumeMl:10,
  baseConcentrationMolPerL:1e-10,baseVolumeMl:10
 })-7)<1e-12,"the equivalence point remains neutral at 25 °C");
});
test("strong acid/strong base concentration model does not silently clamp extreme calculated pH",()=>{
 const concentratedAcid=strongAcidStrongBasePH({
  acidConcentrationMolPerL:10,acidVolumeMl:10,
  baseConcentrationMolPerL:0.1,baseVolumeMl:0
 });
 const concentratedBase=strongAcidStrongBasePH({
  acidConcentrationMolPerL:0.1,acidVolumeMl:10,
  baseConcentrationMolPerL:10,baseVolumeMl:20
 });
 assert.ok(concentratedAcid<0,"concentration-based ideal model may calculate negative pH");
 assert.ok(concentratedBase>14,"concentration-based ideal model may calculate pH above 14");
});
test("strong acid/strong base titration rejects invalid concentrations and volumes",()=>{
 const p={acidConcentrationMolPerL:0.1,acidVolumeMl:20,baseConcentrationMolPerL:0.1,baseVolumeMl:0};
 assert.throws(()=>strongAcidStrongBasePH({...p,acidConcentrationMolPerL:0}),RangeError);
 assert.throws(()=>strongAcidStrongBasePH({...p,baseVolumeMl:-1}),RangeError);
 assert.throws(()=>strongAcidStrongBasePH({...p,baseVolumeMl:NaN}),TypeError);
});
test("Arrhenius rate increases with temperature for positive activation energy",()=>{ const a=arrheniusRateConstant({preExponentialFactor:1e7,activationEnergyJPerMol:50000,temperatureK:300}); const b=arrheniusRateConstant({preExponentialFactor:1e7,activationEnergyJPerMol:50000,temperatureK:350}); assert.ok(b>a); });
test("Arrhenius prefactor recovers a representable rate after exponential underflow",()=>{
 const temperatureK=300, exponent=746;
 const rate=arrheniusRateConstant({preExponentialFactor:1e308,activationEnergyJPerMol:exponent*8.31446261815324*temperatureK,temperatureK});
 assert.ok(Number.isFinite(rate) && rate>0);
 assert.ok(Math.abs(rate/Math.exp(Math.log(1e308)-exponent)-1)<1e-12);
});
test("Arrhenius exponent avoids underflow before division by a tiny temperature",()=>{
 const rate=arrheniusRateConstant({preExponentialFactor:1,activationEnergyJPerMol:Number.MIN_VALUE,temperatureK:Number.MIN_VALUE});
 const expected=Math.exp(-1/8.31446261815324);
 assert.ok(Number.isFinite(rate) && rate>0);
 assert.ok(Math.abs(rate/expected-1)<1e-12);
});
test("projectile motion decomposes velocity and returns trajectory invariants",()=>{
 const p=projectileMotion({initialSpeed:20,angleDeg:45,gravity:9.8});
 assert.ok(Math.abs(p.range-20*20/9.8)<1e-10);
 assert.ok(Math.abs(p.horizontalVelocity-p.verticalVelocity)<1e-10);
 const vertical=projectileMotion({initialSpeed:20,angleDeg:90,gravity:9.8});
 assert.equal(vertical.horizontalVelocity,0);
 assert.equal(vertical.range,0);
 assert.ok(Math.abs(vertical.maxHeight-20*20/(2*9.8))<1e-12);
 assert.throws(()=>projectileMotion({initialSpeed:20,angleDeg:100,gravity:9.8}),RangeError);
});
test("pendulum period scales with square root of length",()=>{ const a=pendulumPeriod({lengthM:1,gravity:9.8}), b=pendulumPeriod({lengthM:4,gravity:9.8}); assert.ok(Math.abs(b/a-2)<1e-12); assert.throws(()=>pendulumPeriod({lengthM:0,gravity:9.8}),RangeError); });
test("pendulum period avoids overflowing a ratio before taking its square root",()=>{ const period=pendulumPeriod({lengthM:1e200,gravity:1e-200}); assert.ok(Number.isFinite(period)); assert.ok(Math.abs(period/(2*Math.PI*1e200)-1)<1e-12); });
test("Ohm's law preserves voltage polarity and returns dissipated power and heat",()=>{ const r=ohmsLaw({voltageV:12,resistanceOhm:6}); assert.equal(r.currentA,2); assert.equal(r.powerW,24); assert.equal(r.heatJPerMinute,1440); const reversed=ohmsLaw({voltageV:-12,resistanceOhm:6}); assert.equal(reversed.currentA,-2); assert.equal(reversed.powerW,24); assert.equal(reversed.heatJPerMinute,1440); assert.throws(()=>ohmsLaw({voltageV:12,resistanceOhm:0}),RangeError); });
test("Ohm heating avoids squaring a finite current into an intermediate overflow",()=>{
 const result=ohmsLaw({voltageV:1e100,resistanceOhm:1e-100});
 assert.ok(Number.isFinite(result.currentA));
 assert.ok(Number.isFinite(result.powerW));
 assert.ok(Number.isFinite(result.heatJPerMinute));
 assert.ok(Math.abs(result.heatJPerMinute/(result.powerW*60)-1)<1e-12);
});
test("inclined plane acceleration includes friction threshold and exact vertical-plane limit",()=>{ assert.ok(Math.abs(inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:Math.tan(Math.PI/6)}))<1e-12); assert.equal(inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:1}),0); assert.equal(inclinedPlaneAcceleration({angleDeg:90,frictionCoefficient:0}),9.8); assert.equal(inclinedPlaneAcceleration({angleDeg:90,frictionCoefficient:100}),9.8); assert.equal(inclinedPlaneAcceleration({angleDeg:0,frictionCoefficient:0}),0); assert.throws(()=>inclinedPlaneAcceleration({angleDeg:90.01,frictionCoefficient:0}),RangeError); assert.throws(()=>inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:-0.1}),RangeError); });
test("inclined plane distinguishes static friction from kinetic friction",()=>{
 const held=inclinedPlaneForces({angleDeg:20,frictionCoefficient:0.5,massKg:3});
 assert.equal(held.slipping,false);
 assert.ok(Math.abs(held.frictionForce-held.parallelGravity)<1e-12,
  "static friction must balance the downslope component, not always equal μN");
 assert.equal(held.acceleration,0);
 const sliding=inclinedPlaneForces({angleDeg:45,frictionCoefficient:0.2,massKg:3});
 assert.equal(sliding.slipping,true);
 assert.ok(Math.abs(sliding.frictionForce-0.2*sliding.normalForce)<1e-12);
 assert.ok(Math.abs(sliding.acceleration-(sliding.parallelGravity-sliding.frictionForce)/3)<1e-12);
 assert.equal(inclinedPlaneForces({angleDeg:90,frictionCoefficient:0.5,massKg:2}).frictionForce,0);
 assert.throws(()=>inclinedPlaneForces({angleDeg:30,frictionCoefficient:0.2,massKg:0}),RangeError);
});
test("spring oscillator shares acceleration, period and energy calculations",()=>{ const a=springOscillator({massKg:1,springConstantNPerM:4,displacementM:0.5,velocityMPerS:0}); assert.equal(a.acceleration,-2); assert.ok(Math.abs(a.angularFrequency-2)<1e-12); assert.ok(Math.abs(a.period-Math.PI)<1e-12); assert.equal(a.kineticEnergy,0); assert.equal(a.elasticPotentialEnergy,0.5); assert.equal(a.totalEnergy,0.5); const b=springOscillator({massKg:1,springConstantNPerM:4,displacementM:0,velocityMPerS:1}); assert.equal(b.totalEnergy,a.totalEnergy); assert.throws(()=>springOscillator({massKg:0,springConstantNPerM:4,displacementM:0,velocityMPerS:1}),RangeError); assert.throws(()=>springOscillator({massKg:1,springConstantNPerM:4,displacementM:Infinity,velocityMPerS:1}),TypeError); });
test("spring oscillator frequency avoids overflowing a ratio before its square root",()=>{ const result=springOscillator({massKg:1e-200,springConstantNPerM:1e200,displacementM:0,velocityMPerS:0}); assert.ok(Number.isFinite(result.angularFrequency)); assert.ok(Math.abs(result.angularFrequency/1e200-1)<1e-12); assert.ok(Number.isFinite(result.period)); assert.equal(result.acceleration,0); });
test("spring acceleration avoids intermediate ratio overflow when the final result is finite",()=>{ const result=springOscillator({massKg:1e-200,springConstantNPerM:1e200,displacementM:1e-200,velocityMPerS:0}); assert.ok(Number.isFinite(result.acceleration)); assert.ok(Math.abs(result.acceleration/(-1e200)-1)<1e-12); });
test("spring acceleration avoids intermediate ratio underflow when the final result is finite",()=>{ const result=springOscillator({massKg:1e200,springConstantNPerM:1e-200,displacementM:1e200,velocityMPerS:0}); assert.ok(Number.isFinite(result.acceleration)); assert.ok(Math.abs(result.acceleration/(-1e-200)-1)<1e-12); });
test("spring kinetic and elastic energy survive early half-scale underflow",()=>{
 const value=1e308;
 const result=springOscillator({massKg:Number.MIN_VALUE,springConstantNPerM:Number.MIN_VALUE,displacementM:value,velocityMPerS:value});
 const expected=Math.exp(Math.log(Number.MIN_VALUE)+2*Math.log(value)-Math.LN2);
 assert.ok(Number.isFinite(result.kineticEnergy) && result.kineticEnergy>0);
 assert.ok(Number.isFinite(result.elasticPotentialEnergy) && result.elasticPotentialEnergy>0);
 assert.ok(Math.abs(result.kineticEnergy/expected-1)<1e-12);
 assert.ok(Math.abs(result.elasticPotentialEnergy/expected-1)<1e-12);
 assert.ok(Math.abs(result.totalEnergy/(2*expected)-1)<1e-12);
});
test("projectile trajectory recovers representable results after intermediate square overflow",()=>{
 const result=projectileMotion({initialSpeed:1e200,angleDeg:90,gravity:1e200});
 assert.equal(result.horizontalVelocity,0);
 assert.equal(result.range,0);
 assert.ok(Math.abs(result.flightTime-2)<1e-12);
 assert.ok(Math.abs(result.maxHeight/5e199-1)<1e-12);
});
test("rejects finite inputs whose calculated results overflow",()=>{ assert.throws(()=>idealGasPressure({amountMol:1e308,temperatureK:300,volumeM3:1}),RangeError); assert.throws(()=>pendulumPeriod({lengthM:1e308,gravity:1e-308}),RangeError); assert.throws(()=>ohmsLaw({voltageV:1e308,resistanceOhm:1e-308}),RangeError); assert.throws(()=>springOscillator({massKg:1,springConstantNPerM:1,displacementM:1e308,velocityMPerS:0}),RangeError); assert.throws(()=>projectileMotion({initialSpeed:1e308,angleDeg:45,gravity:9.8}),RangeError); });


test("Ohm minute heat remains representable when instantaneous power rounds to zero",()=>{
 const result=ohmsLaw({voltageV:1e-160,resistanceOhm:1e5});
 assert.equal(result.powerW,0);
 assert.ok(result.heatJPerMinute>0,
  "integrating a subnormal instantaneous power can recover a representable minute heat");
});


test("Ohm heat output remains finite at a tiny voltage when representable",()=>{
 const result=ohmsLaw({voltageV:1e-160,resistanceOhm:1e-300});
 assert.ok(Number.isFinite(result.heatJPerMinute));
 assert.ok(result.heatJPerMinute>0);
});


test("ideal gas pressure rejects positive inputs whose result underflows to zero",()=>{
 assert.throws(()=>idealGasPressure({amountMol:Number.MIN_VALUE,temperatureK:1,volumeM3:1e308}),RangeError);
});


test("ideal-gas particle properties reject positive amount when number density underflows to zero",()=>{
 assert.throws(()=>idealGasParticleProperties({amountMol:Number.MIN_VALUE,temperatureK:300,volumeM3:1e308,molarMassKgPerMol:0.02897}),RangeError);
});
