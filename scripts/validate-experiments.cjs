'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + fs.readFileSync('assets/js/legacy-app.js', 'utf8');
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
const experimentIds = new Set();
for (const name of ['M','C1','C2','C3','C4','C5','C6']) {
  const models = loadArray(name);
  assert.ok(models.length > 0, name + ' must contain models');
  for (const model of models) {
    assert.ok(model.id && model.name, 'every experiment must have an id and name');
    assert.ok(!experimentIds.has(model.id), 'duplicate experiment id: ' + model.id);
    experimentIds.add(model.id);
    const parameterKeys = new Set();
    for (const parameter of model.p || []) {
      assert.ok(parameter.key && !parameterKeys.has(parameter.key), model.id + ': parameter keys must be unique');
      parameterKeys.add(parameter.key);
      assert.ok(Number.isFinite(parameter.min) && Number.isFinite(parameter.max) &&
        Number.isFinite(parameter.value) && parameter.min <= parameter.value &&
        parameter.value <= parameter.max, model.id + ': parameter defaults must be within finite bounds');
    }
    const params = Object.fromEntries((model.p||[]).map(item => [item.key,item.value]));
    if (typeof model.fn === 'function') {
      assert.ok(Array.isArray(model.xR) && model.xR.length === 2, model.id + ': missing x range');
      for (let i=0;i<=20;i++) {
        const x=model.xR[0]+(model.xR[1]-model.xR[0])*i/20;
        const value=model.fn(params,x,0);
        assert.equal(typeof value, 'number', model.id + ': curve must return a numeric value');
        // Infinite endpoints can represent a real physical singularity (e.g. λ→∞ at v=0).
        // Interior infinities indicate a numerical/domain bug; NaN is allowed for forbidden domains.
        if (i > 0 && i < 20) assert.ok(Number.isFinite(value) || Number.isNaN(value),
          model.id + ': unexpected infinite interior value at ' + x);
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
    } else if (typeof model.speed === 'function' && typeof model.hue === 'function') {
      const speed=model.speed(params), hue=model.hue(params);
      assert.ok(Number.isFinite(speed)&&speed>=0,model.id+': invalid particle speed');
      assert.ok(Number.isFinite(hue),model.id+': invalid particle hue');
      if (typeof model.ro === 'function') assert.ok(Array.isArray(model.ro(params)),model.id+': readout must return rows');
      if (typeof model.tt === 'function') assert.equal(typeof model.tt(params),'string',model.id+': tutor must return text');
    } else {
      throw new Error(model.id + ': no recognized model evaluator');
    }
    checked++;
  }
}
assert.equal(checked, 100, 'the catalogue advertises 100 experiments and must contain exactly 100 validated models');
assert.equal(experimentIds.size, 100, 'all 100 experiments must have unique identifiers');
assert.ok(html.includes('公式助教') && html.includes('LOCAL') && !html.includes('LLM'), 'the offline formula tutor must not be presented as a live LLM');
const addedModels = loadArray('C5');
const vanthoff = addedModels.find(model => model.id === 'k36');
const langmuir = addedModels.find(model => model.id === 'k37');
const gibbs = addedModels.find(model => model.id === 'k38');
assert.ok(vanthoff && langmuir && gibbs, 'the three added models must be present');
const vhParams = Object.fromEntries(vanthoff.p.map(item => [item.key,item.value]));
assert.equal(vanthoff.fn(vhParams, vhParams.Tref), vhParams.Kref,
  'van\'t Hoff model must reproduce the reference equilibrium constant at Tref');
const langmuirParams = {qmax:4,K:2,C:0.5};
assert.equal(langmuir.fn(langmuirParams, 0.5), 2,
  'Langmuir model must reach half of qmax when K*C equals 1');
assert.equal(gibbs.fn({dH:10,dS:100}, 300), -20,
  'Gibbs free energy model must use ΔG=ΔH−TΔS with consistent units');

assert.ok(html.includes('var esc=function(v)'),
  'experiment renderer must define an HTML escaping helper');
for (const token of [
  'esc(ex.cat)', 'esc(ex.name)', 'esc(ex.brief)', 'esc(pr.label)', 'esc(vt)',
  "parts.push(esc(k)+'='+esc(", 'esc(s.name)', 'esc(s.time)'
]) assert.ok(html.includes(token), 'experiment and saved-session content must be escaped: ' + token);
assert.doesNotMatch(html, /\\+ex\\.(?:cat|name|brief)\\+|\\+s\\.(?:name|time)\\+/,
  'untrusted catalog and saved-session strings must not be concatenated into HTML');

assert.match(html, /id:'p2'[\s\S]*?init:function\(\)\{return\{th:0\.17,w:0,t:0\}\}/,
  'pendulum animation must start near 10 degrees so its displayed small-angle period formula remains a good approximation');

console.log('Physics/chemistry model smoke checks passed: ' + checked + ' models.');
