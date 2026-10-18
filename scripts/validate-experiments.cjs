'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const catalogue = fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8');
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

assert.match(html, /id:'p2'[\s\S]*?init:function\(\)\{return\{th:0\.17,w:0,t:0\};\}/,
  'pendulum animation must start near 10 degrees so its displayed small-angle period formula remains a good approximation');


const pendulumBlock = catalogue.slice(catalogue.indexOf("id:'p2'"), catalogue.indexOf("id:'p3'"));
assert.match(pendulumBlock, /readout:function\(p,st\)\{var T=window\.PHYS_DOMAIN\.pendulumPeriod/,
  'pendulum readout must use the shared domain formula');
assert.match(pendulumBlock, /tutor:function\(p,st\)\{var T=window\.PHYS_DOMAIN\.pendulumPeriod/,
  'pendulum tutor must use the shared domain formula');
const ohmBlock = catalogue.slice(catalogue.indexOf("id:'p4'"), catalogue.indexOf("id:'p5'"));
assert.ok((ohmBlock.match(/PHYS_DOMAIN\.ohmsLaw/g)||[]).length >= 4,
  'Ohm experiment animation, drawing, readout and tutor must share the domain solver');
assert.doesNotMatch(ohmBlock, /I=p\.U\/p\.R|var I=p\.U\/p\.R/,
  'Ohm experiment must not duplicate its current calculation outside the domain core');
assert.ok(ohmBlock.includes("electrical.powerW") && ohmBlock.includes("electrical.heatJPerMinute"),
  'Ohm drawing, readout and tutor must display power and heat from the shared domain result');
assert.doesNotMatch(ohmBlock, /I\*I\*p\.R\*60|p\.U\*I/,
  'Ohm UI must not recompute power or Joule heat outside the shared domain solver');
assert.ok(ohmBlock.includes("电荷流率") && ohmBlock.includes("C/s"),
  'Ohm readout must express current as charge flow per second, not charge in coulombs');

const inclineBlock = catalogue.slice(catalogue.indexOf("id:'p5'"), catalogue.indexOf("id:'p6'"));
assert.ok((inclineBlock.match(/PHYS_DOMAIN\.inclinedPlaneAcceleration/g)||[]).length >= 4,
  'inclined-plane animation, drawing, readout and tutor must share the domain solver');
assert.doesNotMatch(inclineBlock, /9\.8\*\(Math\.sin\(th\)-p\.mu\*Math\.cos\(th\)\)/,
  'inclined-plane experiment must not duplicate the acceleration formula');

console.log('Physics/chemistry model smoke checks passed: ' + checked + ' models.');

const springBlock = catalogue.slice(catalogue.indexOf("id:'p3'"), catalogue.indexOf("id:'p4'"));
assert.ok(springBlock.split('PHYS_DOMAIN.springOscillator').length - 1 >= 4,
  'spring oscillator animation, energy display, readout and tutor must share the domain solver');
assert.ok(!springBlock.includes('2*Math.PI*Math.sqrt(p.m/p.k)') && !springBlock.includes('0.5*p.m*st.v*st.v'),
  'spring oscillator period and energy must not be duplicated in the catalogue');
const gasBlock = catalogue.slice(catalogue.indexOf("id:'p6'"), catalogue.indexOf("id:'p7'"));
assert.ok(gasBlock.split('PHYS_DOMAIN.idealGasPressure').length - 1 >= 3,
  'ideal-gas animation, readout and tutor must use the shared SI pressure calculation');
assert.ok(!gasBlock.includes('p.n*8.314*p.T'),
  'ideal-gas experiment must not duplicate an approximate gas constant in nRT calculations');
assert.ok(gasBlock.split('PHYS_DOMAIN.idealGasParticleProperties').length - 1 >= 2,
  'ideal-gas readout and tutor must share molecular speed, kinetic-energy and number-density calculations');
assert.ok(gasBlock.includes("平均平动动能（单分子）") && gasBlock.includes("单分子平均平动动能"),
  'ideal-gas kinetic energy must be explicitly labelled per molecule');
assert.ok(gasBlock.includes("动画速度按温度趋势视觉缩放") &&
  gasBlock.includes("不按真实 m/s 比例播放"),
  'ideal-gas animation must disclose that particle speed is schematic rather than a real-time molecular velocity');
for (const duplicate of ['3*8.314', '1.381e-23', '6.022e23']) {
  assert.ok(!gasBlock.includes(duplicate),
    'ideal-gas particle metrics must use shared domain constants rather than duplicate ' + duplicate);
}
assert.ok(gasBlock.includes('BOLTZMANN') === false,
  'particle constants should remain encapsulated in the domain solver');
