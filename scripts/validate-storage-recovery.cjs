'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf("var SAVE_KEY='physchem_lab_saved_experiments_v1';");
const end = html.indexOf('\nvar typer=null;', start);
assert.ok(start >= 0 && end > start, 'experiment archive persistence section must exist');
const source = html.slice(start, end);
function load(storage) {
  const sandbox = { localStorage: storage, console: { warn() {} }, JSON };
  vm.runInNewContext(source + '\nthis.api={get saves(){return saves;},get locked(){return storageRecoveryRequired;},persistExperimentSaves};', sandbox);
  return sandbox.api;
}
{
  const original = '{broken-json';
  const storage = { getItem: () => original, setItem() { throw new Error('must not overwrite'); } };
  const api = load(storage);
  assert.equal(api.locked, true, 'malformed archive must activate recovery lock');
  assert.equal(api.saves.length, 0);
  assert.equal(api.persistExperimentSaves([{name:'new'}]), false);
  assert.equal(api.locked, true);
}
{
  const storage = { getItem: () => '{"not":"an array"}', setItem() { throw new Error('must not overwrite'); } };
  const api = load(storage);
  assert.equal(api.locked, true, 'valid JSON with invalid archive shape must activate recovery lock');
  assert.equal(api.persistExperimentSaves([{name:'new'}]), false);
}
{
  const storage = { getItem() { throw new Error('storage disabled'); }, setItem() { throw new Error('must not write'); } };
  const api = load(storage);
  assert.equal(api.locked, true, 'unavailable storage must activate recovery lock');
  assert.equal(api.persistExperimentSaves([{name:'new'}]), false);
}
{
  let persisted = null;
  const storage = { getItem: () => '[{"name":"old"}]', setItem: (key, value) => { persisted = {key,value}; } };
  const api = load(storage);
  assert.equal(api.locked, false, 'valid archive must load without recovery lock');
  assert.equal(api.saves.length, 1);
  assert.equal(api.persistExperimentSaves([{name:'new'}]), true);
  assert.deepEqual(JSON.parse(persisted.value), [{name:'new'}]);
  assert.equal(api.saves[0].name, 'new');
}
{
  const original = '[{"name":"old"}]';
  const storage = { getItem: () => original, setItem() { throw new Error('quota exceeded'); } };
  const api = load(storage);
  assert.equal(api.persistExperimentSaves([{name:'new'}]), false, 'quota failure must report failure');
  assert.equal(api.locked, true, 'write failure must activate recovery lock');
  assert.equal(api.saves[0].name, 'old', 'in-memory archive must roll back to the previously loaded records');
}
console.log('Physchem archive recovery checks passed (corrupt JSON, invalid shape, unavailable storage, valid save, quota failure).');
