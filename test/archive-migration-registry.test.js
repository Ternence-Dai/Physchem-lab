// Experiment archive migration registry (wave 4, item 2 — spec
// data-migration-registry-spec-v1, adapted to PhysChem's bare-array
// archive whose version lives in each record's
// experimentSnapshotVersion field). The domain layer owns the
// registry: version constants, the legacy probe, the inspection
// pipeline and the load trace. The registered chain is empty by
// design — legacy (v0, parameter-only) and snapshot (v1) records
// coexist by validation and are never rewritten into each other,
// because a legacy record's snapshot timestamp and readouts cannot
// be fabricated. These tests are the spec §7 admission set:
// oldest-shape -> current chain, idempotence, the negative trio,
// plus a cross-check that the UI segment's startup validators
// (which run before the domain module can load) agree with the
// registry on every shared fixture.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as domain from '../src/domain/index.js';

const {
  EXPERIMENT_ARCHIVE_BASELINE_VERSION,
  EXPERIMENT_ARCHIVE_CURRENT_VERSION,
  EXPERIMENT_ARCHIVE_MIGRATIONS,
  EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION,
  validateExperimentArchiveRegistry,
  isValidExperimentArchiveRow,
  isLegacyExperimentArchiveRow,
  classifyExperimentArchiveRow,
  inspectExperimentArchive
} = domain;

const SAVE_KEY = 'physchem_lab_saved_experiments_v1';

const legacyRow = { name: '旧版参数档案', time: '2026-10-18 08:00:00', params: { v0: 32 } };
const metadataRow = {
  name: 'versioned', experimentId: 'p1', modelVersion: 'physchem-engine-v2',
  time: '2026-10-18', params: { v0: 32 }
};
const snapshotRow = {
  name: '黑体辐射快照', experimentId: 'o4', modelVersion: 'physchem-engine-v2',
  time: '2026-11-20 10:00:00', params: { T: 5000 },
  experimentSnapshotVersion: 1, snapshotAt: '2026-11-20T10:00:00.000Z',
  readouts: [{ label: '峰值波长', value: '579.6 nm' }],
  formulaSnapshot: ['λmax · T = 2.898×10⁻³ m·K']
};

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) deepFreeze(entry);
    Object.freeze(value);
  }
  return value;
}

/* ---------------- registry ---------------- */

test('registry: self-check passes and the chain is empty by design', () => {
  assert.equal(validateExperimentArchiveRegistry(), true);
  assert.equal(EXPERIMENT_ARCHIVE_BASELINE_VERSION, 0);
  assert.equal(EXPERIMENT_ARCHIVE_CURRENT_VERSION, 1);
  assert.equal(EXPERIMENT_ARCHIVE_RECOVERY_ENVELOPE_VERSION, 1);
  assert.deepEqual([...EXPERIMENT_ARCHIVE_MIGRATIONS], [],
    'no transformation steps: generations coexist, nothing is fabricated');
});

test('registry: the legacy probe accepts pre-metadata shapes and nothing else', () => {
  assert.equal(isLegacyExperimentArchiveRow(legacyRow), true);
  assert.equal(isLegacyExperimentArchiveRow(metadataRow), true,
    'metadata rows without a snapshot version are still generation 0');
  assert.equal(isLegacyExperimentArchiveRow(snapshotRow), false);
  assert.equal(isLegacyExperimentArchiveRow({ name: '缺参数' }), false,
    'a shape mismatch is invalid, not legacy');
  assert.equal(isLegacyExperimentArchiveRow(null), false);
});

/* ---------------- chain: oldest shape -> current ---------------- */

test('chain: a pure legacy archive loads as version 0 with a trace', () => {
  const result = inspectExperimentArchive([legacyRow, metadataRow], { storageKey: SAVE_KEY });
  assert.equal(result.ok, true);
  assert.equal(result.loadedVersion, 0);
  assert.equal(result.migratedFrom, null);
  assert.equal(result.source, 'list');
  assert.equal(result.rows.length, 2);
});

test('chain: mixed generations load side by side at the highest generation', () => {
  const result = inspectExperimentArchive([legacyRow, snapshotRow], { storageKey: SAVE_KEY });
  assert.equal(result.ok, true);
  assert.equal(result.loadedVersion, 1);
  assert.equal(result.rows.length, 2, 'no record is dropped or merged by inspection');
  assert.equal(inspectExperimentArchive([snapshotRow], { storageKey: SAVE_KEY }).loadedVersion, 1);
  assert.equal(inspectExperimentArchive([], { storageKey: SAVE_KEY }).loadedVersion, 1,
    'an empty archive is trivially at the current version');
});

test('chain: a recovery envelope is inspected through the same pipeline', () => {
  const envelope = {
    format: 'physchem-lab-archive-recovery', version: 1, storageKey: SAVE_KEY,
    rawValue: JSON.stringify([legacyRow])
  };
  const result = inspectExperimentArchive(envelope, { storageKey: SAVE_KEY });
  assert.equal(result.ok, true);
  assert.equal(result.source, 'envelope');
  assert.equal(result.loadedVersion, 0);
  assert.deepEqual(result.rows, [legacyRow]);
});

/* ---------------- idempotence / round trip ---------------- */

test('idempotence: inspecting inspected rows is a no-op and input is never mutated', () => {
  const input = deepFreeze(JSON.parse(JSON.stringify([legacyRow, snapshotRow])));
  const first = inspectExperimentArchive(input, { storageKey: SAVE_KEY });
  assert.equal(first.ok, true);
  const second = inspectExperimentArchive(first.rows, { storageKey: SAVE_KEY });
  assert.equal(second.ok, true);
  assert.equal(second.loadedVersion, first.loadedVersion);
  assert.deepEqual(second.rows, [legacyRow, snapshotRow]);
});

test('round trip: exported rows re-import through the pipeline unchanged', () => {
  const exported = JSON.stringify([legacyRow, snapshotRow]);
  const result = inspectExperimentArchive(JSON.parse(exported), { storageKey: SAVE_KEY });
  assert.equal(result.ok, true);
  assert.deepEqual(result.rows, [legacyRow, snapshotRow]);
});

/* ---------------- negative trio ---------------- */

test('negative: a record from a newer version is refused as unsupported, not guessed', () => {
  const future = { ...snapshotRow, experimentSnapshotVersion: 2 };
  assert.deepEqual(classifyExperimentArchiveRow(future),
    { ok: false, error: 'unsupported-version', version: 2 });
  const result = inspectExperimentArchive([legacyRow, future], { storageKey: SAVE_KEY });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'unsupported-version');
  const envelope = {
    format: 'physchem-lab-archive-recovery', version: 2, storageKey: SAVE_KEY,
    rawValue: JSON.stringify([legacyRow])
  };
  assert.equal(inspectExperimentArchive(envelope, { storageKey: SAVE_KEY }).error,
    'unsupported-version', 'a newer recovery envelope is refused the same way');
});

test('negative: version-less data whose shape matches no generation is refused', () => {
  for (const bad of [
    [{ name: 'No timestamp', params: { v0: 32 } }],
    [{ ...legacyRow, params: { v0: '32' } }],
    [{ ...legacyRow, unexpectedField: true }],
    [{ ...snapshotRow, experimentSnapshotVersion: '1' }],
    [{ ...snapshotRow, experimentSnapshotVersion: 1.5 }],
    [{ ...legacyRow, snapshotAt: '2026-11-20T10:00:00.000Z' }],
    { name: 'not an array' },
    'a string',
    null
  ]) {
    const result = inspectExperimentArchive(bad, { storageKey: SAVE_KEY });
    assert.equal(result.ok, false, `must refuse: ${JSON.stringify(bad).slice(0, 60)}`);
    assert.equal(result.error, 'invalid-shape');
  }
});

test('negative: malformed envelopes and duplicate snapshot identities are refused', () => {
  const goodRaw = JSON.stringify([snapshotRow]);
  for (const envelope of [
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: 'some_other_key', rawValue: goodRaw },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: SAVE_KEY, rawValue: { not: 'a string' } },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: SAVE_KEY, rawValue: goodRaw.slice(0, 10) },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: SAVE_KEY, rawValue: '{"not":"an archive"}' }
  ]) {
    assert.equal(inspectExperimentArchive(envelope, { storageKey: SAVE_KEY }).ok, false,
      `envelope must be refused: version=${envelope.version} key=${envelope.storageKey}`);
  }
  const duplicate = inspectExperimentArchive([snapshotRow, { ...snapshotRow }], { storageKey: SAVE_KEY });
  assert.equal(duplicate.ok, false, 'duplicate snapshot identities stay rejected');
  const overCap = Array.from({ length: 31 }, (_, i) => ({ ...legacyRow, name: `档案 ${i}` }));
  assert.equal(inspectExperimentArchive(overCap, { storageKey: SAVE_KEY }).ok, false,
    'the 30-record cap stays enforced');
});

/* ---------------- UI cross-check and wiring ---------------- */

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8') + '\n' +
  fs.readFileSync(new URL('../assets/js/experiment-catalogue.js', import.meta.url), 'utf8') + '\n' +
  fs.readFileSync(new URL('../assets/js/legacy-app.js', import.meta.url), 'utf8');
const segStart = html.indexOf("var SAVE_KEY='physchem_lab_saved_experiments_v1';");
const segEnd = html.indexOf('\nvar typer=null;', segStart);
assert.ok(segStart >= 0 && segEnd > segStart, 'experiment archive persistence section must be extractable');
const segment = html.slice(segStart, segEnd);
const silentConsole = { warn() {}, log() {}, error() {} };

function loadArchiveStore(raw, extraSandbox) {
  const writes = [];
  const storage = {
    getItem: () => raw,
    setItem: (key, value) => writes.push([key, value])
  };
  const sandbox = { localStorage: storage, console: silentConsole, JSON, ...extraSandbox };
  vm.runInNewContext(
    segment + '\nthis.api={get saves(){return saves;},get locked(){return storageRecoveryRequired;},' +
    'get trace(){return archiveLoadTrace;},isValidExperimentSave,restoreExperimentArchive};',
    sandbox
  );
  return { api: sandbox.api, writes };
}

// Objects created inside the vm realm fail deepStrictEqual on
// prototype identity alone; compare traces by value via JSON.
function traceOf(api) {
  return api.trace === null ? null : JSON.parse(JSON.stringify(api.trace));
}

test('cross-check: UI startup validator and domain registry agree on every fixture', () => {
  const { api } = loadArchiveStore('[]');
  const fixtures = [
    legacyRow, metadataRow, snapshotRow,
    { ...snapshotRow, experimentSnapshotVersion: 2 },
    { ...snapshotRow, snapshotAt: '2026-02-30T10:00:00.000Z' },
    { ...snapshotRow, note: 'x'.repeat(1201) },
    { ...legacyRow, params: { v0: '32' } },
    { ...legacyRow, unexpectedField: 1 },
    { ...legacyRow, snapshotAt: '2026-11-20T10:00:00.000Z' },
    { name: 'No timestamp', params: { v0: 32 } },
    null, [1, 2], 'text'
  ];
  for (const fixture of fixtures) {
    assert.equal(api.isValidExperimentSave(fixture), isValidExperimentArchiveRow(fixture),
      `verdicts must agree for: ${JSON.stringify(fixture).slice(0, 60)}`);
  }
});

test('wiring: startup load records the trace of what was loaded', () => {
  const legacy = loadArchiveStore(JSON.stringify([legacyRow]));
  assert.equal(legacy.api.locked, false);
  assert.deepEqual(traceOf(legacy.api), { loadedVersion: 0, migratedFrom: null, source: 'stored' });
  const mixed = loadArchiveStore(JSON.stringify([legacyRow, snapshotRow]));
  assert.deepEqual(traceOf(mixed.api), { loadedVersion: 1, migratedFrom: null, source: 'stored' });
  const broken = loadArchiveStore('[broken-cache-bytes');
  assert.equal(broken.api.locked, true);
  assert.equal(broken.api.trace, null, 'a refused load leaves no trace');
});

test('wiring: restore goes through the domain pipeline when it is loaded', () => {
  const { api, writes } = loadArchiveStore(JSON.stringify([snapshotRow]), {
    window: { PHYS_DOMAIN: domain }
  });
  const envelope = {
    format: 'physchem-lab-archive-recovery', version: 1, storageKey: SAVE_KEY,
    rawValue: JSON.stringify([legacyRow])
  };
  assert.equal(api.restoreExperimentArchive(envelope), true);
  assert.deepEqual(traceOf(api), { loadedVersion: 0, migratedFrom: null, source: 'envelope' });
  assert.equal(api.saves[0].name, legacyRow.name);
  assert.equal(writes.length, 1);
  const future = { ...snapshotRow, experimentSnapshotVersion: 2 };
  assert.equal(api.restoreExperimentArchive([future]), false,
    'the pipeline refuses a newer-version record on the restore path too');
  assert.equal(api.saves[0].name, legacyRow.name, 'a refused restore changes nothing');
});

test('wiring: restore falls back to segment checks when the domain is unavailable', () => {
  const { api } = loadArchiveStore('[]');
  assert.equal(api.restoreExperimentArchive([legacyRow]), true);
  assert.deepEqual(traceOf(api), { loadedVersion: 0, migratedFrom: null, source: 'list' });
  assert.equal(api.restoreExperimentArchive([{ ...snapshotRow, experimentSnapshotVersion: 2 }]), false);
  assert.equal(api.saves[0].name, legacyRow.name);
});
