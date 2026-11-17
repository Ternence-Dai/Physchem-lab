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

test("archive comparison rejects accessor properties without invoking getters", () => {
  let getterCalls = 0;
  const params = {};
  Object.defineProperty(params, "temperatureK", {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error("getter must not execute");
    }
  });

  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params
  });

  assert.equal(result.compatible, false);
  assert.equal(getterCalls, 0);
});

test("archive comparison rejects symbol and non-enumerable parameter properties", () => {
  const symbolParams = { temperatureK: 300 };
  symbolParams[Symbol("hidden")] = "not JSON";

  const hiddenParams = { temperatureK: 300 };
  Object.defineProperty(hiddenParams, "hidden", {
    value: "not JSON",
    enumerable: false
  });

  for (const params of [symbolParams, hiddenParams]) {
    const result = compareExperimentArchiveSnapshots(base, {
      ...base,
      params
    });
    assert.equal(result.compatible, false);
  }
});

test("archive comparison converts revoked proxy reflection failures into a blocked result", () => {
  const { proxy, revoke } = Proxy.revocable({ temperatureK: 300 }, {});
  revoke();

  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: proxy
  });

  assert.equal(result.compatible, false);
});


test("archive comparison rejects arrays with replaced prototypes without invoking inherited getters", () => {
  let getterCalls = 0;
  const values = [1, 2];
  const customPrototype = Object.create(Array.prototype);
  Object.defineProperty(customPrototype, "map", {
    get() {
      getterCalls += 1;
      throw new Error("inherited map getter must not execute");
    }
  });
  Object.setPrototypeOf(values, customPrototype);

  const result = compareExperimentArchiveSnapshots(base, {
    ...base,
    params: { values }
  });

  assert.equal(result.compatible, false);
  assert.equal(getterCalls, 0);
});
