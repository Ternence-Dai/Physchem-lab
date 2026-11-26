// Unified backup envelope + age encrypted export (wave 6, item 3 —
// replicated from the Human-Digital-Twin-Health pilot, adapted to
// this repository's bare-array archive).
//
// Pins: the envelope manifest shape (schemaVersion / exportedBy /
// exportedAt / the archive dataset's registry version + record
// count, where the dataset version is the registry loadedVersion —
// highest per-record generation, legacy rows count as baseline 0),
// the exact-gate rejections (higher envelope or dataset version,
// count mismatch, manifest/payload version mismatch, missing or
// unlisted dataset — all rejected before rows reach
// inspectExperimentArchive), backward compatibility (bare-array
// backups and the raw recovery packet still inspect exactly as
// before), recognition of age ciphertext, a real encrypt ->
// decrypt round trip through the vendored typage bundle, and the
// passphrase privacy discipline.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  EXPERIMENT_ARCHIVE_CURRENT_VERSION,
  EXPERIMENT_ARCHIVE_BASELINE_VERSION,
  BACKUP_ENVELOPE_VERSION,
  BACKUP_ENVELOPE_FORMAT,
  BACKUP_ENVELOPE_EXPORTED_BY,
  ARCHIVE_DATASET_KEY,
  buildUnifiedBackupEnvelope,
  isUnifiedBackupEnvelope,
  parseUnifiedBackupEnvelope,
  experimentArchiveDatasetVersion,
  inspectExperimentArchive,
  looksLikeAgeCiphertext
} from '../src/domain/index.js';

const exportedAt = '2026-11-26T00:00:00.000Z';

function legacyRow() {
  return { name: '旧实验', time: '2026-10-18 08:00:00', params: { v0: 1.5 } };
}
function snapshotRow() {
  return {
    name: '快照实验',
    time: '2026-11-20 09:30:00',
    params: { temperature: 298.15 },
    experimentId: 'exp-1',
    experimentSnapshotVersion: 1,
    snapshotAt: '2026-11-20T09:30:00.000Z'
  };
}

function loadAgeBundle() {
  const source = fs.readFileSync(new URL('../assets/js/vendor/age-encryption.js', import.meta.url), 'utf8');
  vm.runInThisContext(source + '\n;globalThis.__physchemAgeBundleForTest = age;');
  const api = globalThis.__physchemAgeBundleForTest;
  delete globalThis.__physchemAgeBundleForTest;
  return api;
}

test('dataset version follows the registry loadedVersion rule', () => {
  assert.equal(experimentArchiveDatasetVersion([]), EXPERIMENT_ARCHIVE_CURRENT_VERSION);
  assert.equal(experimentArchiveDatasetVersion([legacyRow()]), EXPERIMENT_ARCHIVE_BASELINE_VERSION);
  assert.equal(experimentArchiveDatasetVersion([legacyRow(), snapshotRow()]), EXPERIMENT_ARCHIVE_CURRENT_VERSION);
  assert.equal(experimentArchiveDatasetVersion([{ experimentSnapshotVersion: 'x' }]), null);
  assert.equal(experimentArchiveDatasetVersion('nope'), null);
});

test('envelope carries a manifest with the dataset version and count', () => {
  const rows = [legacyRow(), snapshotRow()];
  const envelope = buildUnifiedBackupEnvelope(rows, exportedAt);
  assert.equal(envelope.format, BACKUP_ENVELOPE_FORMAT);
  assert.equal(envelope.manifest.schemaVersion, BACKUP_ENVELOPE_VERSION);
  assert.equal(envelope.manifest.exportedBy, BACKUP_ENVELOPE_EXPORTED_BY);
  assert.equal(envelope.manifest.exportedAt, exportedAt);
  assert.deepEqual(envelope.manifest.datasets, [{
    key: ARCHIVE_DATASET_KEY,
    schemaVersion: EXPERIMENT_ARCHIVE_CURRENT_VERSION,
    storage: 'local-browser',
    count: 2
  }]);
  assert.equal(envelope.datasets[ARCHIVE_DATASET_KEY], rows);
});

test('an all-legacy archive is labeled with the baseline version', () => {
  const envelope = buildUnifiedBackupEnvelope([legacyRow()], exportedAt);
  assert.equal(envelope.manifest.datasets[0].schemaVersion, EXPERIMENT_ARCHIVE_BASELINE_VERSION);
  assert.deepEqual(parseUnifiedBackupEnvelope(envelope), [legacyRow()]);
});

test('envelope unwraps to rows that pass the existing inspection', () => {
  const envelope = buildUnifiedBackupEnvelope([legacyRow(), snapshotRow()], exportedAt);
  assert.equal(isUnifiedBackupEnvelope(envelope), true);
  const rows = parseUnifiedBackupEnvelope(envelope);
  const inspected = inspectExperimentArchive(rows, {});
  assert.equal(inspected.ok, true);
  assert.equal(inspected.rows.length, 2);
});

test('existing backup shapes are not unified envelopes and still inspect', () => {
  assert.equal(isUnifiedBackupEnvelope([legacyRow()]), false);
  assert.equal(isUnifiedBackupEnvelope(null), false);
  // Bare-array backup: unchanged behavior.
  assert.equal(inspectExperimentArchive([legacyRow()], {}).ok, true);
  // Raw recovery packet: unchanged behavior.
  const packet = {
    format: 'physchem-lab-archive-recovery',
    version: 1,
    storageKey: 'physchem_lab_saved_experiments_v1',
    rawValue: JSON.stringify([snapshotRow()])
  };
  const viaPacket = inspectExperimentArchive(packet, { storageKey: 'physchem_lab_saved_experiments_v1' });
  assert.equal(viaPacket.ok, true);
  assert.equal(viaPacket.source, 'envelope');
});

test('a higher envelope version is rejected explicitly, never guessed at', () => {
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  envelope.manifest.schemaVersion = BACKUP_ENVELOPE_VERSION + 1;
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /备份信封版本不受支持/);
});

test('a dataset version above the registry current is rejected', () => {
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  envelope.manifest.datasets[0].schemaVersion = EXPERIMENT_ARCHIVE_CURRENT_VERSION + 1;
  envelope.datasets[ARCHIVE_DATASET_KEY] = [{ ...snapshotRow(), experimentSnapshotVersion: EXPERIMENT_ARCHIVE_CURRENT_VERSION + 1 }];
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /版本不受支持/);
});

test('a manifest version that does not match the payload generation is rejected', () => {
  const envelope = buildUnifiedBackupEnvelope([legacyRow()], exportedAt);
  envelope.manifest.datasets[0].schemaVersion = EXPERIMENT_ARCHIVE_CURRENT_VERSION;
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /不一致/);
});

test('a manifest count that does not match the array is rejected', () => {
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  envelope.manifest.datasets[0].count = 2;
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /完整性校验失败/);
});

test('a listed dataset missing from the payload is rejected', () => {
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  delete envelope.datasets[ARCHIVE_DATASET_KEY];
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /缺失/);
});

test('an unlisted dataset present in the payload is rejected', () => {
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  envelope.datasets.extra = [];
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /未在清单中列出/);
});

test('a non-array dataset is rejected at build and parse', () => {
  assert.throws(() => buildUnifiedBackupEnvelope({ rows: [] }, exportedAt), TypeError);
  assert.throws(() => buildUnifiedBackupEnvelope([{ experimentSnapshotVersion: 1.5 }], exportedAt), TypeError);
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  envelope.datasets[ARCHIVE_DATASET_KEY] = { not: 'an array' };
  assert.throws(() => parseUnifiedBackupEnvelope(envelope), /完整性校验失败/);
});

test('age ciphertext is recognized by its header, JSON is not', () => {
  const binary = new TextEncoder().encode('age-encryption.org/v1\n-> scrypt abc\n--- abc');
  const armored = new TextEncoder().encode('-----BEGIN AGE ENCRYPTED FILE-----\nabc');
  const json = new TextEncoder().encode('[{"name":"x"}]');
  assert.equal(looksLikeAgeCiphertext(binary), true);
  assert.equal(looksLikeAgeCiphertext(armored), true);
  assert.equal(looksLikeAgeCiphertext(json), false);
  assert.equal(looksLikeAgeCiphertext(new Uint8Array(0)), false);
  assert.equal(looksLikeAgeCiphertext(null), false);
});

test('vendored age bundle round-trips the serialized envelope', async () => {
  const age = loadAgeBundle();
  const passphrase = 'correct horse battery staple';
  const envelope = buildUnifiedBackupEnvelope([legacyRow(), snapshotRow()], exportedAt);
  const serialized = JSON.stringify(envelope);
  const encrypter = new age.Encrypter();
  encrypter.setPassphrase(passphrase);
  const ciphertext = await encrypter.encrypt(serialized);
  assert.equal(looksLikeAgeCiphertext(ciphertext), true);
  const decrypter = new age.Decrypter();
  decrypter.addPassphrase(passphrase);
  const decrypted = await decrypter.decrypt(ciphertext, 'text');
  assert.equal(decrypted, serialized);
  const rows = parseUnifiedBackupEnvelope(JSON.parse(decrypted));
  assert.equal(inspectExperimentArchive(rows, {}).ok, true);
});

test('a wrong passphrase cannot decrypt the envelope', async () => {
  const age = loadAgeBundle();
  const encrypter = new age.Encrypter();
  encrypter.setPassphrase('the-right-passphrase');
  const ciphertext = await encrypter.encrypt(JSON.stringify(buildUnifiedBackupEnvelope([snapshotRow()], exportedAt)));
  const decrypter = new age.Decrypter();
  decrypter.addPassphrase('the-wrong-passphrase');
  await assert.rejects(() => decrypter.decrypt(ciphertext, 'text'));
});

test('the passphrase never enters the serialized envelope', () => {
  const passphrase = 'super-secret-passphrase-123';
  const envelope = buildUnifiedBackupEnvelope([snapshotRow()], exportedAt);
  assert.equal(JSON.stringify(envelope).includes(passphrase), false);
});

test('UI source never routes the passphrase to storage or error events', () => {
  const uiSource = fs.readFileSync(new URL('../assets/js/legacy-app.js', import.meta.url), 'utf8');
  assert.equal(/recordErrorEvent\([^)]*passphrase/.test(uiSource), false);
  assert.equal(/localStorage\.setItem\([^)]*passphrase/.test(uiSource), false);
  assert.ok(uiSource.includes('buildUnifiedBackupEnvelope'));
  assert.ok(uiSource.includes('parseUnifiedBackupEnvelope'));
  assert.ok(uiSource.includes('assets/js/vendor/age-encryption.js'));
  // Plaintext export keeps producing the bare array / recovery packet.
  assert.ok(uiSource.includes('buildExperimentArchiveBackup'));
});

test('the vendored age bundle is not in the service-worker precache', () => {
  const swSource = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
  assert.equal(swSource.includes('age-encryption'), false);
});
