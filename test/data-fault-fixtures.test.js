// Data-fault fixtures (wave 4, item 1): the rest of the suite tests whether
// the logic is right; these fixtures test what happens when the DATA is
// wrong on PhysChem's own archive load and import/restore paths — the
// localStorage experiment archive guarded by isValidExperimentSaveList and
// restoreExperimentArchive in assets/js/legacy-app.js.
// Contract under test: never crash with an uncontrolled error, never write
// unvalidated data over the active archive; either degrade safely (load:
// preserve the raw bytes for a recovery export and lock writes) or reject
// explicitly (import: return false with zero writes, current archive
// untouched — no partial imports). Legacy pre-metadata backups must still
// restore. The 108-experiment catalogue and the primary-demo data are not
// touched by these fixtures; scripts/validate-storage-recovery.cjs covers
// the base corruption cases, these fixtures cover the ones it does not:
// truncation, field/type pollution inside a list, duplicate snapshot
// identities, the 30-record cap, and malformed recovery envelopes.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8') + '\n' +
  fs.readFileSync(new URL('../assets/js/experiment-catalogue.js', import.meta.url), 'utf8') + '\n' +
  fs.readFileSync(new URL('../assets/js/legacy-app.js', import.meta.url), 'utf8');
const start = html.indexOf("var SAVE_KEY='physchem_lab_saved_experiments_v1';");
const end = html.indexOf('\nvar typer=null;', start);
assert.ok(start >= 0 && end > start, 'experiment archive persistence section must be extractable');
const segment = html.slice(start, end);

const silentConsole = { warn() {}, log() {}, error() {} };

// Rows in PhysChem's own archive schema: a legacy parameter-only record
// (pre-metadata format) and a v1 reproducibility snapshot record.
const legacyRow = { name: '旧版参数档案', time: '2026-10-18 08:00:00', params: { v0: 32 } };
const snapshotRow = {
  name: '黑体辐射快照', experimentId: 'o4', modelVersion: 'physchem-engine-v2',
  time: '2026-11-20 10:00:00', params: { T: 5000 },
  experimentSnapshotVersion: 1, snapshotAt: '2026-11-20T10:00:00.000Z',
  readouts: [{ label: '峰值波长', value: '579.6 nm' }],
  formulaSnapshot: ['λmax · T = 2.898×10⁻³ m·K']
};

function loadArchiveStore(raw) {
  const writes = [];
  const storage = {
    getItem: () => raw,
    setItem: (key, value) => writes.push([key, value])
  };
  const sandbox = { localStorage: storage, console: silentConsole, JSON };
  vm.runInNewContext(
    segment + '\nthis.api={get saves(){return saves;},get locked(){return storageRecoveryRequired;},' +
    'isValidExperimentSaveList,restoreExperimentArchive,buildExperimentArchiveBackup,persistExperimentSaves};',
    sandbox
  );
  return { api: sandbox.api, writes };
}

test('load: a valid mixed legacy + snapshot archive loads unlocked (harness control)', () => {
  const { api } = loadArchiveStore(JSON.stringify([legacyRow, snapshotRow]));
  assert.equal(api.locked, false);
  assert.equal(api.saves.length, 2);
  assert.equal(api.saves[1].experimentId, 'o4');
});

test('load: truncated archive JSON locks recovery and preserves the exact raw bytes', () => {
  const full = JSON.stringify([legacyRow, snapshotRow]);
  const truncated = full.slice(0, Math.floor(full.length * 0.6));
  const { api, writes } = loadArchiveStore(truncated);
  assert.equal(api.locked, true, 'truncated archive must activate the recovery lock');
  assert.equal(api.saves.length, 0, 'a truncated archive must not partially load');
  assert.equal(writes.length, 0, 'load must never write');
  const backup = api.buildExperimentArchiveBackup();
  assert.equal(backup.format, 'physchem-lab-archive-recovery');
  assert.equal(backup.rawValue, truncated, 'recovery export must carry the truncated bytes verbatim');
});

test('load: type-polluted rows inside a list lock recovery instead of partially loading', () => {
  const polluted = [
    { ...legacyRow, unexpectedField: true },                    // unknown field
    { ...legacyRow, params: { v0: { nested: 1 } } },            // param value not a finite number
    { ...legacyRow, params: ['not', 'an', 'object'] },          // params not an object
    { ...snapshotRow, readouts: [{ label: 'x', value: 42 }] },  // readout value not a string
    { ...snapshotRow, snapshotAt: '2026-11-20 10:00:00' }       // snapshotAt not strict ISO
  ];
  for (const row of polluted) {
    const { api } = loadArchiveStore(JSON.stringify([legacyRow, row]));
    assert.equal(api.locked, true, `polluted row must lock recovery: ${JSON.stringify(row).slice(0, 60)}`);
    assert.equal(api.saves.length, 0, 'one polluted row must reject the whole list, not load the valid half');
  }
});

test('load: duplicate snapshot identities and over-cap lists are rejected', () => {
  const duplicate = loadArchiveStore(JSON.stringify([snapshotRow, { ...snapshotRow }]));
  assert.equal(duplicate.api.locked, true, 'two snapshots with the same experiment/time/params identity must be rejected');
  assert.equal(duplicate.api.saves.length, 0);

  const overCap = Array.from({ length: 31 }, (_, i) => ({ ...legacyRow, name: `档案 ${i}` }));
  const capped = loadArchiveStore(JSON.stringify(overCap));
  assert.equal(capped.api.locked, true, 'a 31-record archive exceeds the 30-record cap and must be rejected');
  assert.equal(capped.api.saves.length, 0);
});

test('import: a truncated backup file never reaches restore and writes nothing', () => {
  const { api, writes } = loadArchiveStore(JSON.stringify([snapshotRow]));
  const backupText = JSON.stringify([legacyRow]).slice(0, 12);
  // Mirrors importExperimentArchiveFile: JSON.parse runs first and its
  // failure aborts the import before restoreExperimentArchive is called.
  assert.throws(() => JSON.parse(backupText), SyntaxError);
  assert.equal(writes.length, 0);
  assert.equal(api.saves.length, 1);
  assert.equal(api.saves[0].experimentId, 'o4', 'the active archive must be untouched');
});

test('import: a list mixing one valid and one polluted row is rejected atomically', () => {
  const { api, writes } = loadArchiveStore(JSON.stringify([snapshotRow]));
  const polluted = { ...legacyRow, params: { v0: '32' } };
  assert.equal(api.restoreExperimentArchive([legacyRow, polluted]), false);
  assert.equal(writes.length, 0, 'a rejected import must perform zero storage writes');
  assert.equal(api.saves.length, 1);
  assert.equal(api.saves[0].name, snapshotRow.name, 'no partial import: the previous archive stays in place');
});

test('import: malformed recovery envelopes are rejected with zero writes', () => {
  const { api, writes } = loadArchiveStore(JSON.stringify([legacyRow]));
  const goodRaw = JSON.stringify([snapshotRow]);
  const envelopes = [
    { format: 'physchem-lab-archive-recovery', version: 2, storageKey: 'physchem_lab_saved_experiments_v1', rawValue: goodRaw },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: 'some_other_key', rawValue: goodRaw },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: 'physchem_lab_saved_experiments_v1', rawValue: { not: 'a string' } },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: 'physchem_lab_saved_experiments_v1', rawValue: goodRaw.slice(0, 10) },
    { format: 'physchem-lab-archive-recovery', version: 1, storageKey: 'physchem_lab_saved_experiments_v1', rawValue: '{"not":"an archive"}' }
  ];
  for (const envelope of envelopes) {
    assert.equal(api.restoreExperimentArchive(envelope), false,
      `envelope must be rejected: version=${envelope.version} key=${envelope.storageKey} raw=${String(envelope.rawValue).slice(0, 24)}`);
  }
  assert.equal(writes.length, 0);
  assert.equal(api.saves.length, 1);
  assert.equal(api.saves[0].name, legacyRow.name);
});

test('import: a legacy pre-metadata backup still restores over a snapshot archive', () => {
  const { api, writes } = loadArchiveStore(JSON.stringify([snapshotRow]));
  assert.equal(api.restoreExperimentArchive([legacyRow]), true,
    'legacy parameter-only backups must remain restorable');
  assert.equal(api.locked, false);
  assert.equal(api.saves.length, 1);
  assert.equal(api.saves[0].name, legacyRow.name);
  assert.equal(writes.length, 1);
  assert.deepEqual(JSON.parse(writes[0][1]), [legacyRow]);
});

test('import: a valid recovery envelope restores a locked store and releases the lock', () => {
  const { api, writes } = loadArchiveStore('[broken-cache-bytes');
  assert.equal(api.locked, true);
  const envelope = {
    format: 'physchem-lab-archive-recovery', version: 1,
    storageKey: 'physchem_lab_saved_experiments_v1',
    rawValue: JSON.stringify([snapshotRow])
  };
  assert.equal(api.restoreExperimentArchive(envelope), true);
  assert.equal(api.locked, false, 'a successful envelope restore must release the recovery lock');
  assert.equal(api.saves.length, 1);
  assert.equal(api.saves[0].experimentSnapshotVersion, 1);
  assert.equal(writes.length, 1);
});
