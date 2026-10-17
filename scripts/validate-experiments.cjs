'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const P = (key,label,min,max,step,value,unit) => ({key,label,min,max,step,value,unit:unit||''});
const F = (value,digits=2) => Number(value).toFixed(digits);
function loadArray(name) {
  const start = html.indexOf('var ' + name + '=[');
  if (start < 0) throw new Error(name + ' model array not found');
  const end = html.indexOf('\n];', start);
  if (end < 0) throw new Error(name + ' model array end not found');
  const source = html.slice(start + ('var ' + name + '=').length, end + 2);
  return vm.runInNewContext('(' + source + ')', {P,F,Math,Number,isFinite});
}
let checked = 0;
for (const name of ['M','C1','C2','C3','C4','C5','C6']) {
  const models = loadArray(name);
  assert.ok(models.length > 0, name + ' must contain models');
  for (const model of models) {
    const params = Object.fromEntries((model.p||[]).map(item => [item.key,item.value]));
    if (typeof model.fn === 'function') {
      assert.ok(Array.isArray(model.xR) && model.xR.length === 2, model.id + ': missing x range');
      for (let i=0;i<=20;i++) {
        const x=model.xR[0]+(model.xR[1]-model.xR[0])*i/20;
        const value=model.fn(params,x,0);
        assert.ok(typeof value === 'number' && !Number.isInfinite(value),
          model.id + ': curve returned non-number/infinite value at ' + x);
      }
      if (typeof model.ro === 'function') assert.ok(Array.isArray(model.ro(params)), model.id + ': readout must return rows');
      if (typeof model.tt === 'function') assert.equal(typeof model.tt(params),'string',model.id + ': tutor must return text');
    } else if (typeof model.dur === 'function' && typeof model.pos === 'function') {
      const duration=model.dur(params);
      assert.ok(Number.isFinite(duration) && duration>0,model.id+': invalid animation duration');
      for(const t of [0,duration/2,duration]) {
        const point=model.pos(params,t,800,500);
        assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y),model.id+': invalid trajectory point');
      }
    } else {
      throw new Error(model.id + ': no recognized model evaluator');
    }
    checked++;
  }
}
console.log('Physics/chemistry model smoke checks passed: ' + checked + ' models.');
