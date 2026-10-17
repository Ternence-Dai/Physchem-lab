import test from "node:test";
import assert from "node:assert/strict";
import { idealGasPressure, arrheniusRateConstant } from "../src/domain/index.js";
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
