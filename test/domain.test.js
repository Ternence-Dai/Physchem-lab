import test from "node:test";
import assert from "node:assert/strict";
import {
  idealGasPressure, arrheniusRateConstant,
  projectileMotion, pendulumPeriod, ohmsLaw, inclinedPlaneAcceleration
} from "../src/domain/index.js";

test("ideal gas law returns SI pressure",()=>{
 const p=idealGasPressure({amountMol:1,temperatureK:273.15,volumeM3:0.022414});
 assert.ok(Math.abs(p-101325)<1200);
});
test("rejects non-positive absolute temperature and volume",()=>{
 assert.throws(()=>idealGasPressure({amountMol:1,temperatureK:0,volumeM3:1}),RangeError);
 assert.throws(()=>idealGasPressure({amountMol:1,temperatureK:300,volumeM3:0}),RangeError);
});
test("Arrhenius rate increases with temperature for positive activation energy",()=>{
 const a=arrheniusRateConstant({preExponentialFactor:1e7,activationEnergyJPerMol:50000,temperatureK:300});
 const b=arrheniusRateConstant({preExponentialFactor:1e7,activationEnergyJPerMol:50000,temperatureK:350});
 assert.ok(b>a);
});
test("projectile motion decomposes velocity and returns trajectory invariants",()=>{
 const p=projectileMotion({initialSpeed:20,angleDeg:45,gravity:9.8});
 assert.ok(Math.abs(p.range-20*20/9.8)<1e-10);
 assert.ok(Math.abs(p.horizontalVelocity-p.verticalVelocity)<1e-10);
 assert.throws(()=>projectileMotion({initialSpeed:20,angleDeg:100,gravity:9.8}),RangeError);
});
test("pendulum period scales with square root of length",()=>{
 const a=pendulumPeriod({lengthM:1,gravity:9.8}), b=pendulumPeriod({lengthM:4,gravity:9.8});
 assert.ok(Math.abs(b/a-2)<1e-12);
 assert.throws(()=>pendulumPeriod({lengthM:0,gravity:9.8}),RangeError);
});
test("Ohm's law returns current, power and per-minute heat",()=>{
 const r=ohmsLaw({voltageV:12,resistanceOhm:6});
 assert.equal(r.currentA,2); assert.equal(r.powerW,24); assert.equal(r.heatJPerMinute,1440);
 assert.throws(()=>ohmsLaw({voltageV:12,resistanceOhm:0}),RangeError);
});
test("inclined plane acceleration includes friction threshold",()=>{
 assert.ok(Math.abs(inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:Math.tan(Math.PI/6)}))<1e-12);
 assert.equal(inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:1}),0,'static friction above the sliding threshold must prevent downhill motion rather than accelerate uphill');
 assert.throws(()=>inclinedPlaneAcceleration({angleDeg:30,frictionCoefficient:-0.1}),RangeError);
});
