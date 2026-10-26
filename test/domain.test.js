import test from "node:test";
import { compareExperimentArchiveSnapshots } from "../src/domain/experiment-archive-comparison.js";

import assert from "node:assert/strict";
import {
  dilutionConcentration, idealGasPressure, idealGasParticleProperties, strongAcidStrongBasePH, arrheniusRateConstant,
  projectileMotion, pendulumPeriod, pendulumStep, ohmsLaw, inclinedPlaneAcceleration, inclinedPlaneForces, springOscillator
} from "../src/domain/index.js";

test("dilution concentration follows conservation of solute across volume expansion",()=>{
 assert.equal(dilutionConcentration({initialConcentrationMolPerL:2,initialVolumeMl:25,finalVolumeMl:100}),0.5);
 assert.equal(dilutionConcentration({initialConcentrationMolPerL:0,initialVolumeMl:10,finalVolumeMl:10}),0);
 assert.throws(()=>dilutionConcentration({initialConcentrationMolPerL:-1,initialVolumeMl:10,finalVolumeMl:20}),RangeError);
 assert.throws(()=>dilutionConcentration({initialConcentrationMolPerL:1,initialVolumeMl:20,finalVolumeMl:10}),RangeError);
 assert.throws(()=>dilutionConcentration({initialConcentrationMolPerL:1,initialVolumeMl:0,finalVolumeMl:10}),RangeError);
 assert.throws(()=>dilutionConcentration({initialConcentrationMolPerL:1,initialVolumeMl:10,finalVolumeMl:Infinity}),TypeError);
});

test("dilution calculation preserves a representable result after volume-ratio underflow",()=>{
 const result=dilutionConcentration({initialConcentrationMolPerL:1e308,initialVolumeMl:1e-200,finalVolumeMl:1e200});
 assert.ok(Number.isFinite(result) && result>0);
 assert.ok(Math.abs(result/1e-92-1)<1e-12);
});
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
test("strong acid/base equivalence survives underflow in an extreme volume fraction",()=>{
 const pH=strongAcidStrongBasePH({
  acidConcentrationMolPerL:1e308,acidVolumeMl:1e-16,
  baseConcentrationMolPerL:1e-16,baseVolumeMl:1e308
 });
 assert.ok(Math.abs(pH-7)<1e-12,
  "equal acid/base equivalents must not lose the small-volume contribution to fraction underflow");
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


test("experiment archive comparison requires the same stable experiment and model version",()=>{
 const left={
  name:"基准温度组",time:"2026/10/23 09:00:00",experimentId:"ideal-gas",
  experimentSnapshotVersion:1,snapshotAt:"2026-10-23T01:00:00.000Z",
  modelVersion:"physchem-engine-v2",params:{temperatureK:300,volumeM3:0.01},
  readouts:[{label:"压力",value:"24943.39 Pa"},{label:"粒子数密度",value:"6.02e25 m⁻³"}]
 };
 const right={
  name:"升温对照组",time:"2026/10/23 09:10:00",experimentId:"ideal-gas",
  experimentSnapshotVersion:1,snapshotAt:"2026-10-23T01:10:00.000Z",
  modelVersion:"physchem-engine-v2",params:{temperatureK:320,volumeM3:0.01},
  readouts:[{label:"压力",value:"26606.28 Pa"},{label:"粒子数密度",value:"5.64e25 m⁻³"}]
 };
 const result=compareExperimentArchiveSnapshots(left,right);
 assert.equal(result.compatible,true);
 assert.equal(result.parameters.find(row=>row.key==="temperatureK").changed,true);
 const pressure=result.readouts.find(row=>row.label==="压力");
 assert.equal(pressure.comparable,true);
 assert.equal(pressure.unit,"Pa");
 assert.ok(Math.abs(pressure.delta-(26606.28-24943.39))<1e-9);
 const frozenBefore=JSON.stringify([left,right]);
 assert.ok(Object.isFrozen(result) && Object.isFrozen(result.readouts));
 assert.equal(JSON.stringify([left,right]),frozenBefore,
   "comparison must not mutate or rewrite historical snapshots");
});

test("experiment archive comparison never converts different units or fabricates non-numeric deltas",()=>{
 const base={
  experimentId:"titration",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{concentration:0.1},
  readouts:[{label:"温度",value:"25 °C"},{label:"观察现象",value:"溶液变为浅粉色"}]
 };
 const next={
  ...base,snapshotAt:"2026-10-23T01:10:00.000Z",
  readouts:[{label:"温度",value:"298.15 K"},{label:"观察现象",value:"颜色保持浅粉色"}]
 };
 const result=compareExperimentArchiveSnapshots(base,next);
 const temperature=result.readouts.find(row=>row.label==="温度");
 const observation=result.readouts.find(row=>row.label==="观察现象");
 assert.equal(temperature.comparable,false);
 assert.equal(temperature.delta,null);
 assert.match(temperature.reason,/单位不同/);
 assert.equal(observation.comparable,false);
 assert.equal(observation.delta,null);
 assert.match(observation.reason,/非纯数值/);
});

test("experiment archive comparison blocks different experiments, model versions and legacy snapshots",()=>{
 const base={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{temperatureK:300},readouts:[{label:"Pressure",value:"1 Pa"}]
 };
 assert.equal(compareExperimentArchiveSnapshots(base,{...base,experimentId:"arrhenius"}).compatible,false);
 assert.equal(compareExperimentArchiveSnapshots(base,{...base,modelVersion:"physchem-engine-v3"}).compatible,false);
 assert.equal(compareExperimentArchiveSnapshots(base,{...base,experimentSnapshotVersion:undefined,snapshotAt:undefined}).compatible,false);
 assert.equal(compareExperimentArchiveSnapshots(base,{...base,readouts:[
  {label:"Pressure",value:"1 Pa"},{label:"Pressure",value:"2 Pa"}
 ]}).compatible,false);
});


test("archive comparison blocks malformed readout rows instead of silently dropping them",()=>{
 const base={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{temperatureK:300},readouts:[{label:"Pressure",value:"1 Pa"}]
 };
 const malformedRows=[
  [null],
  [{}],
  [{label:"",value:"1 Pa"}],
  [{label:"Pressure",value:1}],
  [["Pressure","1 Pa"]],
  [{label:"Pressure",value:"1 Pa"},null]
 ];
 for(const readouts of malformedRows){
  const result=compareExperimentArchiveSnapshots(base,{...base,readouts});
  assert.equal(result.compatible,false,
   "malformed archive rows must block comparison rather than disappear: "+String(readouts));
  assert.match(result.reason,/缺失、无效或重复/);
 }
 const malformedLeft=compareExperimentArchiveSnapshots(
  {...base,readouts:[{label:"Pressure",value:null}]},base
 );
 assert.equal(malformedLeft.compatible,false,
  "malformed rows in either archive must block comparison");
});

test("archive comparison preserves zero deltas and never mutates saved snapshots",()=>{
 const left={
  name:"基准组",time:"2026/10/23 10:00",experimentId:"ideal-gas",
  experimentSnapshotVersion:1,snapshotAt:"2026-10-23T02:00:00.000Z",
  modelVersion:"physchem-engine-v2",params:{temperatureK:300},
  readouts:[{label:"压力",value:"100 Pa"}]
 };
 const right={
  name:"复测组",time:"2026/10/23 10:05",experimentId:"ideal-gas",
  experimentSnapshotVersion:1,snapshotAt:"2026-10-23T02:05:00.000Z",
  modelVersion:"physchem-engine-v2",params:{temperatureK:300},
  readouts:[{label:"压力",value:"100 Pa"}]
 };
 const before=JSON.stringify([left,right]);
 const result=compareExperimentArchiveSnapshots(left,right);
 assert.equal(result.compatible,true);
 assert.equal(result.readouts[0].delta,0);
 assert.equal(result.readouts[0].comparable,true);
 assert.equal(JSON.stringify([left,right]),before);
});


test("archive comparison refuses a numeric delta that overflows the finite number range",()=>{
 const base={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{temperatureK:300},
  readouts:[{label:"压力",value:"-1e308 Pa"}]
 };
 const next={
  ...base,snapshotAt:"2026-10-23T01:10:00.000Z",
  readouts:[{label:"压力",value:"1e308 Pa"}]
 };
 const result=compareExperimentArchiveSnapshots(base,next);
 const pressure=result.readouts.find(row=>row.label==="压力");
 assert.equal(pressure.comparable,false);
 assert.equal(pressure.delta,null);
 assert.equal(pressure.unit,"");
 assert.match(pressure.reason,/超出数值范围/);
});


test("archive comparison requires real calendar timestamps with explicit valid time zones",()=>{
 const base={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{temperatureK:300},readouts:[{label:"Pressure",value:"1 Pa"}]
 };
 for (const snapshotAt of [
  "2026-02-30T01:00:00Z",
  "2026-13-01T01:00:00Z",
  "2026-01-01T24:00:00Z",
  "2026-01-01T01:00:00",
  "2026-01-01T01:00:00+14:30",
  "2026-01-01T01:00:00-00:00"
 ]) {
  assert.equal(compareExperimentArchiveSnapshots(base,{...base,snapshotAt}).compatible,false,
   `invalid snapshot timestamp must be rejected: ${snapshotAt}`);
 }
 assert.equal(compareExperimentArchiveSnapshots(base,{
  ...base,snapshotAt:"2024-02-29T01:00:00+14:00"
 }).compatible,true,"a real leap day and the maximum legal UTC offset are accepted");
 assert.equal(compareExperimentArchiveSnapshots(base,{
  ...base,snapshotAt:"2026-10-23T01:00:00.123456789Z"
 }).compatible,true,"fractional seconds are accepted");
});


test("nonlinear pendulum RK4 conserves undamped energy across variable frame sizes",()=>{
 const lengthM=1,gravity=9.81,initialAngle=0.5;
 const period=pendulumPeriod({lengthM,gravity});
 const energy=state=>0.5*lengthM*state.angularVelocityRadPerS**2+
  gravity*lengthM*(1-Math.cos(state.angleRad));
 const initial={angleRad:initialAngle,angularVelocityRadPerS:0};
 const startEnergy=energy(initial);
 let state={...initial};
 const frameSizes=[period/45,period/90,period/120,period/60];
 for(let cycle=0;cycle<10;cycle++){
  const dt=frameSizes[cycle%frameSizes.length];
  const count=Math.round(period/dt);
  const frameDt=period/count;
  for(let i=0;i<count;i++){
   state=pendulumStep({ ...state,lengthM,gravity,dampingCoefficient:0,deltaTimeSeconds:frameDt });
  }
 }
 assert.ok(Math.abs(energy(state)/startEnergy-1)<1e-8,
  "RK4 substeps should keep nonlinear pendulum energy stable over ten periods");
});

test("nonlinear pendulum RK4 dissipates mechanical energy with positive damping",()=>{
 const parameters={lengthM:0.8,gravity:9.81,dampingCoefficient:0.35};
 const energy=state=>0.5*parameters.lengthM*state.angularVelocityRadPerS**2+
  parameters.gravity*parameters.lengthM*(1-Math.cos(state.angleRad));
 let state={angleRad:0.7,angularVelocityRadPerS:0};
 const initialEnergy=energy(state);
 for(let i=0;i<1200;i++){
  state=pendulumStep({...parameters,...state,deltaTimeSeconds:1/60});
 }
 assert.ok(energy(state)<initialEnergy*0.01,
  "damped pendulum energy should decay rather than grow during the animation");
});

test("nonlinear pendulum RK4 validates physical inputs and bounds pathological frame deltas",()=>{
 const valid={angleRad:0.2,angularVelocityRadPerS:0,lengthM:1,gravity:9.81,dampingCoefficient:0,deltaTimeSeconds:0};
 assert.deepEqual(pendulumStep(valid),{angleRad:0.2,angularVelocityRadPerS:0});
 assert.throws(()=>pendulumStep({...valid,lengthM:0}),RangeError);
 assert.throws(()=>pendulumStep({...valid,dampingCoefficient:-1}),RangeError);
 assert.throws(()=>pendulumStep({...valid,deltaTimeSeconds:-1}),RangeError);
 assert.throws(()=>pendulumStep({...valid,deltaTimeSeconds:1e6}),RangeError);
 assert.throws(()=>pendulumStep({...valid,angleRad:NaN}),TypeError);
});


test("strong acid/base titration preserves one-ULP concentration differences near equivalence",()=>{
 const acidConcentration=1e308;
 const nextConcentration=1.0000000000000002e308;
 const baseExcess=strongAcidStrongBasePH({
  acidConcentrationMolPerL:acidConcentration,acidVolumeMl:1e308,
  baseConcentrationMolPerL:nextConcentration,baseVolumeMl:1e308
 });
 const acidExcess=strongAcidStrongBasePH({
  acidConcentrationMolPerL:nextConcentration,acidVolumeMl:1e308,
  baseConcentrationMolPerL:acidConcentration,baseVolumeMl:1e308
 });
 assert.ok(Number.isFinite(baseExcess) && baseExcess>300,
  "one-ULP excess base must not collapse to neutral pH when logarithms round the contributions equal");
 assert.ok(Number.isFinite(acidExcess) && acidExcess< -290,
  "one-ULP excess acid must remain acidic at extreme concentration");
});


test("archive comparison freezes detached parameter snapshots without freezing source archives",()=>{
 const nestedLeft={calibration:{points:[1,2,3]}};
 const nestedRight={calibration:{points:[1,2,4]}};
 const left={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:00:00.000Z",
  params:{metadata:nestedLeft},readouts:[]
 };
 const right={
  experimentId:"ideal-gas",experimentSnapshotVersion:1,
  modelVersion:"physchem-engine-v2",snapshotAt:"2026-10-23T01:10:00.000Z",
  params:{metadata:nestedRight},readouts:[]
 };
 const result=compareExperimentArchiveSnapshots(left,right);
 assert.equal(result.compatible,true);
 assert.equal(Object.isFrozen(nestedLeft),false);
 assert.equal(Object.isFrozen(nestedLeft.calibration),false);
 assert.equal(Object.isFrozen(nestedLeft.calibration.points),false);
 assert.equal(Object.isFrozen(nestedRight.calibration.points),false);
 assert.notEqual(result.parameters[0].leftValue,nestedLeft);
 assert.notEqual(result.parameters[0].leftValue.calibration,nestedLeft.calibration);
 assert.ok(Object.isFrozen(result.parameters[0].leftValue));
 assert.ok(Object.isFrozen(result.parameters[0].leftValue.calibration.points));
});
