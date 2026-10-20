'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const app = fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('assets/css/experiment-notebook-v9.css', 'utf8');

const saveStart = app.indexOf("var bs=E('bs')");
const saveEnd = app.indexOf("var bd=E('bd')", saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart, 'experiment save handler must be available');
const saveHandler = app.slice(saveStart, saveEnd);
assert.ok(saveHandler.includes('if(saves.length>=30)') &&
          saveHandler.includes('系统不会自动覆盖') &&
          !saveHandler.includes('.slice(0,30)'),
  'a full archive must refuse new saves rather than silently discard its oldest record');

const deleteStart = app.indexOf('function deleteSavedExperiment(index)');
const deleteEnd = app.indexOf('function restoreSavedExperiment(index)', deleteStart);
assert.ok(deleteStart >= 0 && deleteEnd > deleteStart, 'individual archive deletion must be implemented');
const deleteSource = app.slice(deleteStart, deleteEnd);
const state = {
  saves:[
    {name:'Newest',time:'2026-10-20',params:{a:1}},
    {name:'Middle',time:'2026-10-19',params:{a:2}},
    {name:'Oldest',time:'2026-10-18',params:{a:3}}
  ],
  storageRecoveryRequired:false,
  allowWrite:true,
  confirms:true,
  messages:[],
  renderCount:0,
  updates:0,
  syncs:0
};
state.confirm=()=>state.confirms;
state.persistExperimentSaves=next=>{
  if(!state.allowWrite)return false;
  state.saves=JSON.parse(JSON.stringify(next));
  return true;
};
state.toast=message=>state.messages.push(message);
state.updateSI=()=>{state.updates++;};
state.renderD=()=>{state.renderCount++;};
state.syncArchiveRecoveryUI=()=>{state.syncs++;};
vm.createContext(state);
vm.runInContext(deleteSource+'\nthis.deleteSavedExperiment=deleteSavedExperiment;',state);
assert.equal(state.deleteSavedExperiment(1),true);
assert.deepEqual(state.saves.map(row=>row.name),['Newest','Oldest'],
  'deleting one archive must preserve the order and content of all other records');
assert.equal(state.renderCount,1);
assert.equal(state.updates,1);
state.confirms=false;
assert.equal(state.deleteSavedExperiment(0),false,
  'cancelling the delete confirmation must not change the archive');
assert.deepEqual(state.saves.map(row=>row.name),['Newest','Oldest']);
state.confirms=true;
state.allowWrite=false;
assert.equal(state.deleteSavedExperiment(0),false,
  'failed persistence must not report a successful archive deletion');
assert.deepEqual(state.saves.map(row=>row.name),['Newest','Oldest']);
state.storageRecoveryRequired=true;
state.allowWrite=true;
const before=state.saves.map(row=>row.name);
assert.equal(state.deleteSavedExperiment(0),false,
  'recovery lock must block record deletion until the archive is restored');
assert.deepEqual(state.saves.map(row=>row.name),before);

assert.ok(app.includes("event.target.closest('[data-delete-save]')") &&
          /data-delete-save="\x27\+i\+\x27"/.test(app) &&
          app.includes('saves.length>=30'),
  'archive UI must expose delegated per-record deletion and enforce its capacity');
assert.ok(html.includes('最多保留 30 份实验档案') &&
          html.includes('legacy-app.js?v=20261020-archive-capacity-v2'),
  'archive capacity must be visible and the new main runtime must be cache-busted');
assert.ok(css.includes('.archive-capacity-note') &&
          css.includes('.w9-archive-delete') &&
          css.includes('@media(max-width:520px)'),
  'capacity notice and delete controls must remain visible on mobile');
console.log('PhysChem archive capacity and explicit deletion checks passed.');


for (const invalidIndex of [-1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER]) {
  const beforeInvalidDelete = state.saves.map(row => row.name);
  assert.equal(state.deleteSavedExperiment(invalidIndex), false,
    'archive deletion must reject negative, fractional, non-finite and out-of-range indexes');
  assert.deepEqual(state.saves.map(row => row.name), beforeInvalidDelete,
    'invalid archive indexes must never mutate persisted records');
}


const restoreStart = app.indexOf('function restoreSavedExperiment(index)');
const restoreEnd = app.indexOf('function updateExperimentNoteCount()', restoreStart);
const restoreSource = app.slice(restoreStart, restoreEnd);
assert.ok(restoreStart >= 0 && restoreEnd > restoreStart, 'archive restore handler must remain discoverable');
const restoreState = {
  saves: [{ name:'Known', time:'2026-10-20', params:{a:1} }],
  EXP: [{ id:'known', name:'Known', params:[{key:'a',min:0,max:2}], init:p=>({value:p.a}) }],
  ARCHIVE_MODEL_VERSION:'physchem-engine-v2',
  toast() {}, setExperimentSidebarOpen() {}, buildParams() {}, buildPanel() {},
  renderList() {}, refreshTutor() {}, updateExperimentNoteCount() {},
  setTimeout() {}, paused:false, P:{}, ST:{}, cur:null,
  E: id => ({textContent:'',value:''})
};
vm.createContext(restoreState);
vm.runInContext(restoreSource + String.fromCharCode(10) + 'this.restoreSavedExperiment=restoreSavedExperiment;',restoreState);
for (const invalidIndex of [-1,1.5,Number.NaN,Number.MAX_SAFE_INTEGER]) {
  assert.equal(restoreState.restoreSavedExperiment(invalidIndex),false,
    'archive restore must reject invalid indexes before applying parameters');
  assert.equal(restoreState.cur,null,'invalid archive restore must not switch the active experiment');
}


const validationStart = app.indexOf('function isValidExperimentSave(item)');
const validationEnd = app.indexOf('var rawSaved', validationStart);
assert.ok(validationStart >= 0 && validationEnd > validationStart,
  'archive save validators must be available for import validation');
const validationState = {};
vm.createContext(validationState);
vm.runInContext(app.slice(validationStart, validationEnd) +
  '\nthis.isValidExperimentSaveList = isValidExperimentSaveList;', validationState);
const versionedSave = {
  name:'Versioned experiment',time:'2026-10-20 09:00:00',
  experimentId:'EXP-42',experimentSnapshotVersion:1,
  snapshotAt:'2026-10-20T09:00:00.000Z',params:{temperature:298.15,pressure:1}
};
assert.equal(validationState.isValidExperimentSaveList([versionedSave]),true);
assert.equal(validationState.isValidExperimentSaveList([
  versionedSave,{...versionedSave,params:{pressure:1,temperature:298.15}}
]),false,'an imported archive must reject duplicate versioned snapshots even when parameter key order differs');
assert.equal(validationState.isValidExperimentSaveList([
  versionedSave,{...versionedSave,params:{temperature:300,pressure:1}}
]),true,'distinct parameter snapshots for the same experiment and instant remain available for reconciliation');
