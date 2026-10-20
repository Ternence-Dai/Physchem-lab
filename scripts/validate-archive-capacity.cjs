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
  syncs:0,
  confirm(){return this.confirms;},
  persistExperimentSaves(next){
    if(!this.allowWrite)return false;
    this.saves=JSON.parse(JSON.stringify(next));
    return true;
  },
  toast(message){this.messages.push(message);},
  updateSI(){this.updates++;},
  renderD(){this.renderCount++;},
  syncArchiveRecoveryUI(){this.syncs++;}
};
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
          app.includes('data-delete-save="'+i+'"') &&
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
