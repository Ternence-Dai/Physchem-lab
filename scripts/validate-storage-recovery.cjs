'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const start = html.indexOf("var SAVE_KEY='physchem_lab_saved_experiments_v1';");
const end = html.indexOf('\nvar typer=null;', start);
assert.ok(start >= 0 && end > start, 'experiment archive persistence section must exist');
assert.match(html, /ARCHIVE_MODEL_VERSION='physchem-engine-v2'/, 'new PhysChem archives must carry an explicit model version');
assert.match(html, /experimentId:String\(cur\.id\|\|''\)/, 'new PhysChem archives must record the selected experiment identity');
assert.match(html, /旧版模型/, 'archive UI must identify archives created before model metadata existed');

const source = html.slice(start, end);
function load(storage) {
  const sandbox = { localStorage: storage, console: { warn() {} }, JSON };
  vm.runInNewContext(source + '\nthis.api={get saves(){return saves;},get locked(){return storageRecoveryRequired;},persistExperimentSaves,isValidExperimentSave,isValidExperimentSaveList,buildExperimentArchiveBackup,restoreExperimentArchive};', sandbox);
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
  const storage = { getItem: () => '[{"name":"old","time":"2026-10-18 08:00:00","params":{"v0":32}}]', setItem: (key, value) => { persisted = {key,value}; } };
  const api = load(storage);
  assert.equal(api.locked, false, 'valid archive must load without recovery lock');
  assert.equal(api.saves.length, 1);
  const next = [{name:'new',time:'2026-10-18 08:01:00',params:{v0:45,ang:35}}];
  assert.equal(api.persistExperimentSaves(next), true);
  assert.deepEqual(JSON.parse(persisted.value), next);
  assert.equal(api.saves[0].name, 'new');
  assert.notEqual(api.saves, next, 'saved archive must be a defensive copy');
}
{
  const original = '[{"name":"old","time":"2026-10-18 08:00:00","params":{"v0":32}}]';
  const storage = { getItem: () => original, setItem() { throw new Error('quota exceeded'); } };
  const api = load(storage);
  assert.equal(api.persistExperimentSaves([{name:'new',time:'2026-10-18 08:01:00',params:{v0:45}}]), false, 'quota failure must report failure');
  assert.equal(api.locked, true, 'write failure must activate recovery lock');
  assert.equal(api.saves[0].name, 'old', 'in-memory archive must roll back to the previously loaded records');
}

{
  const original = '[broken-cache-bytes';
  let persisted = null;
  const storage = { getItem: () => original, setItem: (key,value) => {persisted={key,value};} };
  const api = load(storage);
  const backup = api.buildExperimentArchiveBackup();
  assert.equal(backup.format,'physchem-lab-archive-recovery',
    'a damaged archive must export a recovery envelope rather than fallback data');
  assert.equal(backup.storageKey,'physchem_lab_saved_experiments_v1');
  assert.equal(backup.rawValue,original,'recovery export must preserve the exact original raw bytes');
  assert.equal(api.restoreExperimentArchive([{name:'recovered',time:'2026-10-18',params:{v0:34}}]),true,
    'a valid explicit backup must restore a locked archive');
  assert.equal(api.locked,false,'successful archive restore must release the recovery lock');
  assert.equal(api.saves[0].name,'recovered');
  assert.equal(JSON.parse(persisted.value)[0].name,'recovered');
}
{
  const original='[broken-cache-bytes';
  const storage={getItem:()=>original,setItem(){throw new Error('quota exceeded');}};
  const api=load(storage);
  const before=api.buildExperimentArchiveBackup();
  assert.equal(api.restoreExperimentArchive([{name:'replacement',time:'2026-10-18',params:{v0:35}}]),false,
    'storage failure must not report a successful archive restore');
  assert.equal(api.locked,true,'failed archive restore must retain recovery lock');
  assert.equal(api.buildExperimentArchiveBackup().rawValue,before.rawValue,
    'failed archive restore must retain exact original bytes');
}
{
  let saved=null;
  const storage={getItem:()=>null,setItem:(key,value)=>{saved={key,value};}};
  const api=load(storage);
  const backup=api.buildExperimentArchiveBackup();
  assert.ok(Array.isArray(backup),'healthy archive export must be a portable JSON array');
  assert.equal(api.restoreExperimentArchive({name:'invalid'}),false,
    'invalid backup objects must not overwrite the current archive');
  const envelope={format:'physchem-lab-archive-recovery',version:1,
    storageKey:'physchem_lab_saved_experiments_v1',rawValue:'[{"name":"from-envelope","time":"2026-10-18","params":{"v0":40}}]'};
  assert.equal(api.restoreExperimentArchive(envelope),true,
    'a valid recovery envelope must restore its embedded raw archive');
  assert.equal(JSON.parse(saved.value)[0].name,'from-envelope');
}
{
  const storage={getItem(){throw new Error('storage unavailable');},setItem(){throw new Error('still unavailable');}};
  const api=load(storage);
  const backup=api.buildExperimentArchiveBackup();
  assert.equal(backup.readFailed,true,'unreadable storage must be disclosed in the recovery package');
  assert.equal(backup.rawValue,null,'the app must not invent raw content when storage cannot be read');
}

console.log('Physchem archive recovery checks passed (corrupt JSON, invalid shape, unavailable storage, valid save, quota failure).');

{
  const cases = [
    '[null]',
    '[{"name":"No timestamp","params":{"v0":32}}]',
    '[{"name":"Bad parameter","time":"2026-10-18","params":{"v0":"NaN"}}]',
    '[{"name":"Too many keys","time":"2026-10-18","params":{"p0":0,"p1":1,"p2":2,"p3":3,"p4":4,"p5":5,"p6":6,"p7":7,"p8":8,"p9":9,"p10":10,"p11":11,"p12":12,"p13":13,"p14":14,"p15":15,"p16":16,"p17":17,"p18":18,"p19":19,"p20":20,"p21":21,"p22":22,"p23":23,"p24":24,"p25":25,"p26":26,"p27":27,"p28":28,"p29":29,"p30":30}}]'
  ];
  for (const original of cases) {
    const storage = {getItem:()=>original,setItem(){throw new Error('must not overwrite malformed data');}};
    const api = load(storage);
    assert.equal(api.locked,true,'malformed saved experiment rows must activate recovery lock');
    assert.equal(api.saves.length,0);
    assert.equal(api.persistExperimentSaves([{name:'new',time:'2026-10-18',params:{v0:1}}]),false);
  }
}
{
  let writes=0;
  const storage={getItem:()=> '[]',setItem(){writes++;}};
  const api=load(storage);
  assert.equal(api.persistExperimentSaves([{name:'bad',time:'2026-10-18',params:{v0:'32'}}]),false,
    'invalid parameter values must not be persisted');
  assert.equal(writes,0,'invalid save attempts must not touch local storage');
  assert.equal(api.locked,false,'a rejected new save is not proof that existing storage is corrupt');
  assert.equal(api.saves.length,0,'rejected saves must not mutate in-memory archive state');
}


{
  let writes=0;
  const storage={getItem:()=> '[]',setItem(key,value){writes++;}};
  const api=load(storage);
  assert.equal(api.persistExperimentSaves([
    {name:'versioned',experimentId:'p1',modelVersion:'physchem-engine-v2',time:'2026-10-18',params:{v0:32}}
  ]),true,'versioned experiment archive metadata must be accepted');
  assert.equal(writes,1);
  assert.equal(api.saves[0].experimentId,'p1');
  assert.equal(api.saves[0].modelVersion,'physchem-engine-v2');
}
