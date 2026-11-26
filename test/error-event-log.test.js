// Local error event log (wave 4, item 4 — pattern replicated from
// Human-Digital-Twin-Health): the domain layer owns the event model
// (closed kind set, whitelisted context, fingerprint aggregation,
// 200-fingerprint rolling cap, export envelope); the UI layer wires
// PhysChem's real archive failure paths (corrupt load, storage
// recovery lock, import rejection, save failure) to record events
// without changing any failure behaviour. These tests pin both
// layers, including the privacy red line: archive content (experiment
// names, observation notes) must never appear in a recorded event —
// not even inside a JSON.parse error message snippet.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as domain from '../src/domain/index.js';

const {
  ERROR_EVENT_KINDS,
  ERROR_EVENT_LOG_MAX_EVENTS,
  buildErrorEvent,
  appendErrorEvent,
  summarizeErrorEvents,
  buildErrorLogExport,
  errorEventFingerprint
} = domain;

const AT = '2026-11-25T00:00:00.000Z';
const AT2 = '2026-11-25T01:00:00.000Z';

/* ---------------- domain layer ---------------- */

test('domain: kind set is closed and matches the PhysChem failure paths', () => {
  assert.deepEqual([...ERROR_EVENT_KINDS], [
    'domain_unavailable', 'recovery_locked', 'import_rejected',
    'save_failed', 'storage_fault', 'export_failed'
  ]);
  assert.throws(() => buildErrorEvent({ kind: 'user_note_text', message: 'x' }, AT), TypeError);
  assert.throws(() => buildErrorEvent(null, AT), TypeError);
});

test('domain: buildErrorEvent shapes the event and derives the fingerprint', () => {
  const event = buildErrorEvent({
    kind: 'recovery_locked',
    message: '实验存档读取失败，已启用恢复保护',
    context: { stage: 'archive-load', errorName: 'SyntaxError', fileSizeBytes: 123, preserved: true }
  }, AT);
  assert.equal(event.at, AT);
  assert.equal(event.lastAt, AT);
  assert.equal(event.count, 1);
  assert.equal(event.fingerprint, 'recovery_locked|syntaxerror|archive-load');
  assert.equal(event.fingerprint, errorEventFingerprint('recovery_locked', event.context));
  assert.ok(event.id.startsWith('err-'));
});

test('domain: context whitelist drops user-text keys and non-scalar values', () => {
  const marker = 'SECRET_MARKER_ARCHIVE_NAME';
  const event = buildErrorEvent({
    kind: 'import_rejected',
    message: '档案恢复失败；原有存档保持不变',
    context: {
      stage: 'import-restore', errorName: 'Error', fileSizeBytes: 42,
      name: marker, note: marker, params: { v0: marker }, nested: { x: 1 },
      list: [1, 2], dropped: undefined
    }
  }, AT);
  assert.deepEqual(Object.keys(event.context).sort(), ['errorName', 'fileSizeBytes', 'stage']);
  assert.ok(!JSON.stringify(event).includes(marker), 'no context key may carry archive content into an event');
});

test('domain: message is truncated and non-string messages become empty', () => {
  const long = buildErrorEvent({ kind: 'save_failed', message: 'x'.repeat(500) }, AT);
  assert.equal(long.message.length, 240);
  const none = buildErrorEvent({ kind: 'save_failed' }, AT);
  assert.equal(none.message, '');
});

test('domain: appendErrorEvent aggregates by fingerprint and stays pure', () => {
  const input = { kind: 'save_failed', message: '写入失败', context: { stage: 'archive-write', errorName: 'QuotaExceededError' } };
  const first = appendErrorEvent([], input, AT);
  const second = appendErrorEvent(first, input, AT2);
  assert.equal(second.length, 1);
  assert.equal(second[0].count, 2);
  assert.equal(second[0].at, AT, 'first occurrence timestamp is kept');
  assert.equal(second[0].lastAt, AT2, 'last occurrence timestamp advances');
  assert.equal(first.length, 1);
  assert.equal(first[0].count, 1, 'the input list is never mutated');

  const otherStage = appendErrorEvent(second, { ...input, context: { stage: 'archive-validate', errorName: 'ValidationError' } }, AT2);
  assert.equal(otherStage.length, 2, 'a different stage is a different fingerprint');

  const withGarbage = appendErrorEvent([{ bogus: true }, null, ...second], input, AT2);
  assert.equal(withGarbage.length, 1, 'malformed stored entries are filtered, not carried');
  assert.equal(withGarbage[0].count, 3);
  assert.throws(() => appendErrorEvent('nope', input, AT), TypeError);
});

test('domain: the log rolls at 200 distinct fingerprints, oldest first', () => {
  let events = [];
  for (let i = 0; i < ERROR_EVENT_LOG_MAX_EVENTS + 5; i++) {
    events = appendErrorEvent(events, {
      kind: 'storage_fault', message: 'm', context: { stage: 'stage-' + i, errorName: 'Error' }
    }, AT);
  }
  assert.equal(events.length, 200);
  assert.equal(events[0].context.stage, 'stage-5', 'the five oldest fingerprints rolled off');
  assert.equal(events[events.length - 1].context.stage, 'stage-204');
});

test('domain: summarize and export envelope carry counts, never extra fields', () => {
  let events = [];
  events = appendErrorEvent(events, { kind: 'import_rejected', message: 'a', context: { stage: 'import-size', errorName: 'FileTooLarge' } }, AT);
  events = appendErrorEvent(events, { kind: 'import_rejected', message: 'a', context: { stage: 'import-size', errorName: 'FileTooLarge' } }, AT2);
  events = appendErrorEvent(events, { kind: 'save_failed', message: 'b', context: { stage: 'archive-write', errorName: 'Error' } }, AT);
  const summary = summarizeErrorEvents(events);
  assert.equal(summary[0].count, 2, 'groups sort by count descending');
  assert.equal(summary[0].firstAt, AT);
  assert.equal(summary[0].lastAt, AT2);
  const exported = buildErrorLogExport(events, AT2);
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.storage, 'local-browser-error-log');
  assert.equal(exported.eventCount, 2);
  assert.equal(exported.totalOccurrences, 3);
  assert.equal(exported.groups.length, 2);
  assert.equal(exported.events.length, 2);
});

/* ---------------- UI wiring (vm-extracted real code) ---------------- */

const appSource = fs.readFileSync(new URL('../assets/js/legacy-app.js', import.meta.url), 'utf8');
const segStart = appSource.indexOf("var ERROR_EVENT_LOG_KEY='physchem-error-events-v1';");
const segEnd = appSource.indexOf('\nvar typer=null;', segStart);
assert.ok(segStart >= 0 && segEnd > segStart, 'error log + archive persistence section must be extractable');
const segment = appSource.slice(segStart, segEnd);

const SAVE_KEY = 'physchem_lab_saved_experiments_v1';
const ERR_KEY = 'physchem-error-events-v1';
const silentConsole = { warn() {}, log() {}, error() {} };
const legacyRow = { name: '旧版参数档案', time: '2026-10-18 08:00:00', params: { v0: 32 } };

function loadWiredStore(raw, options = {}) {
  const store = new Map();
  if (raw !== null && raw !== undefined) store.set(SAVE_KEY, raw);
  const writes = [];
  const storage = {
    getItem(key) {
      if (options.throwReadFor && options.throwReadFor.has(key)) throw new Error('storage unavailable');
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      if (options.throwWriteFor && options.throwWriteFor.has(key)) throw new Error('quota exceeded');
      writes.push([key, String(value)]);
      store.set(key, String(value));
    }
  };
  const toasts = [];
  const blobs = [];
  class FakeBlob { constructor(parts, opts) { this.parts = parts; this.opts = opts; blobs.push(this); } }
  class FakeFileReader {
    readAsText(file) {
      if (file.__readError) { if (this.onerror) this.onerror(); return; }
      if (this.onload) this.onload({ target: { result: file.__text } });
    }
    // Mirrors the real FileReader: result lands on the reader and
    // the load event's target is the reader itself.
    readAsArrayBuffer(file) {
      if (file.__readError) { if (this.onerror) this.onerror(); return; }
      this.result = new TextEncoder().encode(file.__text || '').buffer;
      if (this.onload) this.onload({ target: this });
    }
  }
  const sandbox = {
    localStorage: storage,
    console: silentConsole,
    JSON,
    TextEncoder,
    TextDecoder,
    window: options.domain ? { PHYS_DOMAIN: domain } : {},
    toast: (m) => toasts.push(m),
    E: () => null,
    updateSI() {},
    renderD() {},
    FileReader: FakeFileReader,
    Blob: FakeBlob,
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL() {} },
    document: { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } },
    setTimeout: () => 0
  };
  vm.runInNewContext(
    segment + '\nthis.api={get saves(){return saves;},get locked(){return storageRecoveryRequired;},' +
    'persistExperimentSaves,restoreExperimentArchive,importExperimentArchiveFile,' +
    'exportExperimentArchive,recordErrorEvent,exportErrorLog};',
    sandbox
  );
  return {
    api: sandbox.api,
    store,
    toasts,
    blobs,
    events() {
      const rawEvents = store.get(ERR_KEY);
      return rawEvents ? JSON.parse(rawEvents) : [];
    },
    archiveWrites() { return writes.filter(([key]) => key === SAVE_KEY); }
  };
}

test('wiring: a corrupt archive load locks recovery AND records one recovery_locked event', () => {
  const { api, events, archiveWrites } = loadWiredStore('[broken-cache-bytes');
  assert.equal(api.locked, true, 'failure behaviour unchanged: recovery lock engages');
  assert.equal(api.saves.length, 0);
  assert.equal(archiveWrites().length, 0, 'load must never write the archive key');
  const log = events();
  assert.equal(log.length, 1);
  assert.equal(log[0].kind, 'recovery_locked');
  assert.equal(log[0].context.stage, 'archive-load');
  assert.equal(log[0].context.preserved, true, 'the raw bytes are preserved in memory for the recovery export');
  assert.equal(log[0].count, 1);
});

test('wiring: unreadable storage records stage archive-read with preserved=false', () => {
  const { api, events } = loadWiredStore(null, { throwReadFor: new Set([SAVE_KEY]) });
  assert.equal(api.locked, true);
  const log = events();
  assert.equal(log.length, 1);
  assert.equal(log[0].kind, 'recovery_locked');
  assert.equal(log[0].context.stage, 'archive-read');
  assert.equal(log[0].context.preserved, false);
});

test('wiring: privacy — archive content markers never reach the event log', () => {
  const marker = 'SECRET_MARKER_ARCHIVE_NAME';
  // Malformed JSON whose bytes contain the marker: a raw SyntaxError
  // message would embed a snippet of these bytes; the recorded event
  // must not.
  const malformed = '{"name":"' + marker + '", broken';
  const loadCase = loadWiredStore(malformed);
  assert.equal(loadCase.api.locked, true);
  assert.ok(!JSON.stringify(loadCase.events()).includes(marker),
    'load-path events must not contain archive bytes, not even via an error message');

  // Structurally invalid (parseable) archive carrying the marker in a
  // user-text field.
  const polluted = JSON.stringify([{ name: marker, time: '2026-10-18 08:00:00', params: { v0: 'bad' }, note: marker }]);
  const pollutedCase = loadWiredStore(polluted);
  assert.equal(pollutedCase.api.locked, true);
  assert.ok(!JSON.stringify(pollutedCase.events()).includes(marker));

  // Import path: a backup file whose content carries the marker and is
  // rejected must record import_rejected without the marker.
  const importCase = loadWiredStore(JSON.stringify([legacyRow]));
  const file = { size: polluted.length, __text: polluted };
  importCase.api.importExperimentArchiveFile({ files: [file], value: 'x' });
  const importLog = importCase.events();
  assert.equal(importLog.length, 1);
  assert.equal(importLog[0].kind, 'import_rejected');
  assert.equal(importLog[0].context.stage, 'import-restore');
  assert.ok(!JSON.stringify(importLog).includes(marker),
    'import-path events must not contain file content');
  assert.equal(importCase.api.saves.length, 1, 'rejected import leaves the archive untouched');
});

test('wiring: import rejections record their stage (size, parse, read)', () => {
  const oversize = loadWiredStore('[]');
  oversize.api.importExperimentArchiveFile({ files: [{ size: 2 * 1024 * 1024 }], value: 'x' });
  assert.equal(oversize.events().length, 1);
  assert.equal(oversize.events()[0].kind, 'import_rejected');
  assert.equal(oversize.events()[0].context.stage, 'import-size');
  assert.equal(oversize.events()[0].context.fileSizeBytes, 2 * 1024 * 1024);

  const parse = loadWiredStore('[]');
  parse.api.importExperimentArchiveFile({ files: [{ size: 9, __text: '{not-json' }], value: 'x' });
  assert.equal(parse.events().length, 1);
  assert.equal(parse.events()[0].context.stage, 'import-parse');
  assert.equal(parse.events()[0].context.errorName, 'SyntaxError');

  const read = loadWiredStore('[]');
  read.api.importExperimentArchiveFile({ files: [{ size: 9, __readError: true }], value: 'x' });
  assert.equal(read.events().length, 1);
  assert.equal(read.events()[0].context.stage, 'import-read');
});

test('wiring: repeated save validation rejections aggregate into one counted event', () => {
  const { api, events, archiveWrites } = loadWiredStore('[]');
  const invalid = [{ name: 'bad', time: '2026-10-18', params: { v0: '32' } }];
  assert.equal(api.persistExperimentSaves(invalid), false);
  assert.equal(api.persistExperimentSaves(invalid), false);
  assert.equal(api.locked, false, 'a rejected save is not corruption: no lock, as before');
  assert.equal(archiveWrites().length, 0, 'rejected saves still perform zero archive writes');
  const log = events();
  assert.equal(log.length, 1);
  assert.equal(log[0].kind, 'save_failed');
  assert.equal(log[0].context.stage, 'archive-validate');
  assert.equal(log[0].count, 2, 'the second identical failure increments the same fingerprint');
});

test('wiring: an archive write failure locks recovery and records save_failed/archive-write', () => {
  const { api, events } = loadWiredStore(JSON.stringify([legacyRow]), { throwWriteFor: new Set([SAVE_KEY]) });
  assert.equal(api.persistExperimentSaves([{ ...legacyRow, name: 'new' }]), false);
  assert.equal(api.locked, true, 'failure behaviour unchanged: write failure engages the lock');
  assert.equal(api.saves[0].name, legacyRow.name, 'in-memory archive rolls back');
  const log = events();
  assert.equal(log.length, 1);
  assert.equal(log[0].kind, 'save_failed');
  assert.equal(log[0].context.stage, 'archive-write');
});

test('wiring: a restore write failure records storage_fault and keeps the lock', () => {
  const { api, events } = loadWiredStore('[broken-cache-bytes', { throwWriteFor: new Set([SAVE_KEY]) });
  assert.equal(api.locked, true);
  assert.equal(api.restoreExperimentArchive([legacyRow]), false);
  assert.equal(api.locked, true, 'failed restore keeps the recovery lock');
  const kinds = events().map(e => e.kind + '@' + e.context.stage);
  assert.ok(kinds.includes('storage_fault@archive-restore-write'), 'restore write failure is recorded: ' + kinds.join(','));
});

test('wiring: with the domain module loaded, recording goes through the domain append path', () => {
  const { api, events } = loadWiredStore('[]', { domain: true });
  assert.equal(api.recordErrorEvent('save_failed', new Error('boom'), { stage: 'archive-write' }), true);
  assert.equal(api.recordErrorEvent('save_failed', new Error('boom'), { stage: 'archive-write' }), true);
  const log = events();
  assert.equal(log.length, 1);
  assert.equal(log[0].count, 2);
  assert.equal(log[0].fingerprint, 'save_failed|error|archive-write');
});

test('wiring: a fully broken error log never disturbs the main flow', () => {
  // Every setItem throws (archive AND error log): recording must fail
  // silently and the archive behaviour must be exactly as before.
  const broken = loadWiredStore(JSON.stringify([legacyRow]), {
    throwWriteFor: new Set([SAVE_KEY, ERR_KEY])
  });
  assert.equal(broken.api.recordErrorEvent('save_failed', new Error('x'), { stage: 'archive-write' }), false,
    'recordErrorEvent reports its own failure with false, never by throwing');
  assert.equal(broken.api.persistExperimentSaves([{ ...legacyRow, name: 'new' }]), false,
    'the save still reports failure for its own reason');
  assert.equal(broken.api.locked, true);
  assert.equal(broken.api.saves[0].name, legacyRow.name);

  // A healthy archive still loads and saves normally when only the
  // error-log key is unwritable.
  const logOnly = loadWiredStore('[]', { throwWriteFor: new Set([ERR_KEY]) });
  assert.equal(logOnly.api.locked, false);
  assert.equal(logOnly.api.persistExperimentSaves([legacyRow]), true,
    'archive save succeeds even though every recording attempt failed');
  assert.equal(logOnly.api.saves.length, 1);
});

test('wiring: export produces the versioned envelope; empty log exports nothing', () => {
  const empty = loadWiredStore('[]');
  assert.equal(empty.api.exportErrorLog(), false);
  assert.ok(empty.toasts.some(m => m.includes('暂无错误记录')));

  const { api, blobs, toasts } = loadWiredStore('[broken-cache-bytes', { domain: true });
  assert.equal(api.exportErrorLog(), true);
  assert.equal(blobs.length, 1);
  const payload = JSON.parse(blobs[0].parts[0]);
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.storage, 'local-browser-error-log');
  assert.equal(payload.eventCount, 1);
  assert.equal(payload.totalOccurrences, 1);
  assert.equal(payload.groups.length, 1);
  assert.equal(payload.events[0].kind, 'recovery_locked');
  assert.ok(toasts.some(m => m.includes('错误日志已导出')));
});

test('wiring: archive export failure is recorded and rethrown (record-and-rethrow)', () => {
  const store = new Map([[SAVE_KEY, JSON.stringify([legacyRow])]]);
  const sandbox = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v))
    },
    console: silentConsole,
    JSON,
    window: {},
    toast: () => {},
    E: () => null,
    updateSI() {},
    renderD() {},
    Blob: class { constructor() { throw new Error('blob unsupported'); } },
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL() {} },
    document: { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } },
    setTimeout: () => 0
  };
  vm.runInNewContext(
    segment + '\nthis.api={exportExperimentArchive,recordErrorEvent};',
    sandbox
  );
  assert.throws(() => sandbox.api.exportExperimentArchive(), /blob unsupported/,
    'the original failure still propagates to the caller, unchanged');
  const log = JSON.parse(store.get(ERR_KEY));
  assert.equal(log.length, 1);
  assert.equal(log[0].kind, 'export_failed');
  assert.equal(log[0].context.stage, 'archive-export');
});
