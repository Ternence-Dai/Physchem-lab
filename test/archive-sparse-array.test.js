import test from "node:test";
import assert from "node:assert/strict";
import { compareExperimentArchiveSnapshots } from "../src/domain/experiment-archive-comparison.js";

const base = Object.freeze({
  experimentId: "archive-array-boundary",
  experimentSnapshotVersion: 1,
  modelVersion: "physchem-engine-v2",
  snapshotAt: "2026-11-12T00:00:00.000Z",
  params: { temperatureK: 300 },
  readouts: [{ label: "Pressure", value: "1 Pa" }]
});

test("archive comparison rejects sparse parameter arrays instead of silently skipping holes", () => {
  const sparse = [];
  sparse.length = 2;
  sparse[1] = "x";

  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: { values: sparse }
  });

  assert.equal(result.compatible, false);
  assert.match(result.reason, /安全边界/);
});

test("archive comparison rejects huge sparse arrays before traversing their declared length", () => {
  const hugeSparse = [];
  hugeSparse.length = 1_000_000_000;

  const started = performance.now();
  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: { values: hugeSparse }
  });
  const elapsed = performance.now() - started;

  assert.equal(result.compatible, false);
  assert.match(result.reason, /安全边界/);
  assert.ok(elapsed < 1000, `sparse-array rejection took ${elapsed.toFixed(1)} ms`);
});

test("archive comparison preserves dense JSON arrays and detects nested value changes", () => {
  const unchanged = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: { values: [null, "x", { unit: "K", value: 300 }] }
  });
  assert.equal(unchanged.compatible, true);

  const changed = compareExperimentArchiveSnapshots(
    { ...base, params: { values: [null, "x", { unit: "K", value: 300 }] } },
    { ...base, snapshotAt: "2026-11-12T00:10:00.000Z",
      params: { values: [null, "x", { unit: "K", value: 310 }] } }
  );
  assert.equal(changed.compatible, true);
  assert.equal(changed.parameters.find(parameter => parameter.key === "values").changed, true);
});

test("archive comparison rejects arrays with non-JSON enumerable properties", () => {
  const values = [1, 2];
  values.metadata = "not serialized as an array item";

  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: { values }
  });

  assert.equal(result.compatible, false);
  assert.match(result.reason, /安全边界/);
});
