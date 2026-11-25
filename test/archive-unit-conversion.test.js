import test from "node:test";
import assert from "node:assert/strict";
import { compareExperimentArchiveSnapshots } from "../src/domain/experiment-archive-comparison.js";

const base = {
  experimentId: "unit-conversion-regression",
  experimentSnapshotVersion: 1,
  modelVersion: "physchem-engine-v2",
  snapshotAt: "2026-11-25T00:00:00.000Z",
  params: { temperatureK: 298.15 },
  readouts: [{ label: "Pressure", value: "1 bar" }]
};

function compare(leftValue, rightValue) {
  return compareExperimentArchiveSnapshots(
    { ...base, readouts: [{ label: "Result", value: leftValue }] },
    { ...base, snapshotAt: "2026-11-25T00:01:00.000Z", readouts: [{ label: "Result", value: rightValue }] }
  ).readouts[0];
}

test("archive comparison converts pressure units through the explicit SI allowlist", () => {
  const result = compare("1 bar", "100 kPa");
  assert.equal(result.comparable, true);
  assert.equal(result.converted, true);
  assert.equal(result.unit, "bar");
  assert.equal(result.delta, 0);
  assert.match(result.reason, /已按受控换算表转换/);
});

test("archive comparison handles affine temperature conversion without changing the reference unit", () => {
  const result = compare("25 °C", "298.15 K");
  assert.equal(result.comparable, true);
  assert.equal(result.converted, true);
  assert.equal(result.unit, "°C");
  assert.ok(Math.abs(result.delta) < 1e-10);
});

test("archive comparison retains exact-unit comparisons without marking a conversion", () => {
  const result = compare("2.5 MPa", "2.1 MPa");
  assert.equal(result.comparable, true);
  assert.equal(result.converted, false);
  assert.equal(result.unit, "MPa");
  assert.equal(result.delta, -0.4);
});

test("archive comparison refuses unknown or cross-dimension unit conversions", () => {
  for (const [left, right] of [["1 psi", "6.9 kPa"], ["1 V", "1000 mA"]]) {
    const result = compare(left, right);
    assert.equal(result.comparable, false);
    assert.equal(result.converted, false);
    assert.equal(result.delta, null);
    assert.match(result.reason, /不在受控换算表内/);
  }
});

test("archive comparison reports non-finite converted deltas as incomparable", () => {
  const result = compare("1 Pa", "1e308 MPa");
  assert.equal(result.comparable, false);
  assert.equal(result.delta, null);
  assert.match(result.reason, /换算结果超出数值范围/);
});
