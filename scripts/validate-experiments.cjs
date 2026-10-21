'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const pageHtml = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const html = pageHtml + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + app;
const catalogue = fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8');
const productCss = fs.readFileSync('assets/css/product-system.css', 'utf8');
const notebookCss = fs.readFileSync('assets/css/experiment-notebook-v9.css', 'utf8');
assert.ok(html.includes('product-system.css?v=20261021-ui-restoration-v1'),
  'PhysChem Lab must load the V8 interactive engineering workspace stylesheet');
assert.ok(productCss.includes('PhysChem Lab interactive engineering workspace'),
  'PhysChem Lab V3 visual layer must be present');
for (const selector of [
  '.sb{', '.mn{', '.tb{', '.physchem-intro{', '.sw{', '.bt2{',
  '.bt2 .pnl', '.sidebar-backdrop', '.dr{', '.mobile-menu'
]) assert.ok(productCss.includes(selector),
  'PhysChem Lab V3 must style the key engineering surface: ' + selector);
assert.ok(productCss.includes('@media(max-width:900px)') &&
          productCss.includes('@media(max-width:560px)'),
  'PhysChem Lab must provide tablet and phone layouts');

assert.ok(productCss.includes('V4 · PhysChem Lab scientific exploration console') &&
          productCss.includes('.physchem-intro:after{') &&
          productCss.includes('.lab-commandbar{') &&
          productCss.includes('.product-workflow__grid{'),
  'PhysChem V4 must implement the science hero, lab commandbar and experiment workflow cards');
assert.ok(productCss.includes('@media(max-width:900px)') &&
          productCss.includes('@media(max-width:560px)') &&
          productCss.includes('.product-workflow__item:hover'),
  'PhysChem V4 must include responsive control layouts and workflow interaction states');

assert.ok(productCss.includes('prefers-reduced-motion:reduce'),
  'PhysChem Lab must respect reduced-motion preferences');
assert.ok(pageHtml.includes('experiment-notebook-v9.css?v=20261021-ui-restoration-v1') &&
          pageHtml.includes('id="experimentNote"') &&
          pageHtml.includes('id="experimentNoteCount"'),
  'PhysChem Lab must mount the scientific notebook note field and V9 notebook stylesheet');
for(const selector of [
  '.lab-notebook{', '.lab-notebook__head{', '#experimentNote',
  '.w9-archive-results', '.w9-archive-note', '.w9-archive-formulas'
]) assert.ok(notebookCss.includes(selector),
  'PhysChem notebook styling must include ' + selector);
assert.ok(app.includes('function buildExperimentRecordSnapshot()') &&
          app.includes('function updateExperimentNoteCount()') &&
          app.includes('experimentSnapshotVersion:1') &&
          app.includes('readouts:readouts') &&
          app.includes('formulaSnapshot:formulaSnapshot') &&
          app.includes('tutorSnapshot:tutorSnapshot'),
  'saving an experiment must capture versioned results, formulas, tutor explanation and notebook observations');
assert.ok(app.includes('saved.note') &&
          app.includes('w9-archive-results') &&
          app.includes('w9-archive-note') &&
          app.includes('w9-archive-formulas') &&
          app.includes('w9-archive-tutor'),
  'archive review and parameter restore must expose the saved scientific context');

assert.ok(html.includes('id="mobileMenu"') &&
          html.includes('id="experimentSidebar"') &&
          html.includes('id="sidebarBackdrop"'),
  'mobile experiment navigation controls must be mounted in the page');
assert.ok(html.includes('product-system.css?v=20261021-ui-restoration-v1'));

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

const sidebarFunction = app.indexOf('function setExperimentSidebarOpen(open)');
const selectFunction = app.indexOf('function selectExp(id)');
const bindFunction = app.indexOf('function bindUI()');
assert.ok(sidebarFunction >= 0 && selectFunction > sidebarFunction && bindFunction > selectFunction,
  'responsive experiment drawer helpers and event bindings must exist');
const mobileWiring = app.slice(sidebarFunction, bindFunction);
assert.ok(mobileWiring.includes("sidebar.classList.toggle('open',!!open)") &&
          mobileWiring.includes("backdrop.classList.toggle('show',!!open)") &&
          mobileWiring.includes("button.setAttribute('aria-expanded',open?'true':'false')"),
  'the mobile experiment drawer must synchronize its open state and accessibility attribute');
assert.ok(app.slice(selectFunction, bindFunction).includes('setExperimentSidebarOpen(false)'),
  'selecting an experiment must close the mobile drawer');
assert.ok(app.slice(bindFunction).includes("mobileMenu.onclick") &&
          app.slice(bindFunction).includes("sidebarBackdrop.onclick"),
  'the mobile menu button and backdrop must have working handlers');

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
assert.equal(checked, 100, 'the categorized catalogue must contain exactly 100 validated models');

assert.equal(experimentIds.size, 100, 'all 100 categorized models must have unique identifiers');

// The eight flagship models (p1-p8) are registered in addition to the 100
// categorized models above. Count the complete runtime catalogue, not only
// the seven categorized arrays used by the domain smoke test.
const completeCatalogueIds = [...catalogue.matchAll(/id:'([^']+)'/g)].map(match => match[1]);
assert.equal(completeCatalogueIds.length, 108,
  'the complete interactive catalogue must include 8 flagship and 100 categorized experiments');
assert.equal(new Set(completeCatalogueIds).size, 108,
  'all 108 interactive catalogue IDs must be unique');
assert.ok(pageHtml.includes('id="catalogueTotal"') &&
          pageHtml.includes('id="catalogueTotalInline"') &&
          app.includes('String(EXP.length)'),
  'the visible experiment totals must be derived from the complete runtime catalogue');
assert.ok(!pageHtml.includes('100个物理化学趣味实验') && !pageHtml.includes('/ 100 个实验'),
  'the page must not display a stale hard-coded 100-experiment total');


assert.ok(pageHtml.includes('experiment-catalogue.js?v=20261021-catalogue-restore-v2') &&
          pageHtml.includes('legacy-app.js?v=20261021-catalogue-restore-v2'),
  'catalogue and simulation scripts must use fresh cache-busting versions after restoration');
assert.ok(pageHtml.includes('id="simulationStatus"') &&
          pageHtml.includes('实时动态图示') &&
          app.includes('function syncSimulationStatus()') &&
          app.includes('syncSimulationStatus();'),
  'the interactive simulation canvas must expose and synchronize its running/paused state');
assert.ok(app.includes("box.setAttribute('role','list')") &&
          app.includes("node.onkeydown=function(event)"),
  'the full experiment directory must expose accessible list semantics and keyboard selection');

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

const equilibriumModels = loadArray('C3');
const henry = equilibriumModels.find(model => model.id === 'ch5');
assert.ok(henry && henry.f.includes('P=c/kH'),
  'Henry law must show the correct inverse relation P=c/kH');
assert.equal(henry.fn({kH:0.034,P:2},2),0.068,
  'Henry law concentration must remain c=kH*P');
const leChatelier = equilibriumModels.find(model => model.id === 'ch4');
assert.ok(leChatelier && leChatelier.mk && leChatelier.mk[0],
  'Le Chatelier model must provide an equilibrium reference marker');
assert.equal(leChatelier.mk[0].x({K:25}),25,
  'Le Chatelier chart equilibrium marker must follow the live K parameter');
assert.ok(app.includes("markerX=typeof mk.x==='function'?mk.x(p):mk.x"),
  'curve renderer must resolve parameter-driven reference marker positions');

const kinetics = loadArray('C3').find(model => model.id === 'ch9');
assert.ok(kinetics, 'integrated reaction-order kinetics model must be present');
const kineticsBase = {k:0.1,c0:1,n:3};
assert.ok(Math.abs(kinetics.fn(kineticsBase,10) - 1/Math.sqrt(3)) < 1e-12,
  'third-order kinetics must use [A]=[A]0/sqrt(1+2*k*[A]0^2*t)');
assert.ok(Math.abs(kinetics.fn(kineticsBase,0) - 1) < 1e-12,
  'third-order concentration must start at the initial concentration');
const thirdOrderReadout = kinetics.ro(kineticsBase);
assert.ok(thirdOrderReadout.some(row => row.k === '半衰期' && row.v === '15.00 s'),
  'third-order half-life must be 3/(2*k*[A]0^2)');
assert.ok(thirdOrderReadout.some(row => row.k === 'k 的单位' && row.v === 'L²/(mol²·s)'),
  'third-order rate constant must expose its dimensionally correct units');
assert.ok(kinetics.fn({...kineticsBase,n:2},10) < 1 &&
  kinetics.fn({...kineticsBase,n:1},10) < 1 &&
  kinetics.fn({...kineticsBase,n:0},10) === 0,
  'zero-, first-, second- and third-order models must all decay consistently');

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
assert.ok((inclineBlock.match(/PHYS_DOMAIN\.inclinedPlaneAcceleration/g)||[]).length >= 2,
  'inclined-plane animation and drawing must use the shared acceleration solver');
assert.ok((inclineBlock.match(/PHYS_DOMAIN\.inclinedPlaneForces/g)||[]).length >= 2,
  'inclined-plane readout and tutor must use shared static/kinetic friction force calculations');
assert.ok(inclineBlock.includes("静摩擦力 fₛ") && inclineBlock.includes("动摩擦力 fₖ") &&
  inclineBlock.includes("本实验将静、动摩擦系数简化为同一个 μ"),
  'inclined-plane output must distinguish static and kinetic friction and disclose the coefficient simplification');
assert.doesNotMatch(inclineBlock, /p\.mu\*p\.m\*9\.8\*Math\.cos\(th\)/,
  'inclined-plane readout must not report kinetic friction while the block is static');

console.log('Physics/chemistry model smoke checks passed: ' + checked + ' models.');

const springBlock = catalogue.slice(catalogue.indexOf("id:'p3'"), catalogue.indexOf("id:'p4'"));
assert.ok(springBlock.split('PHYS_DOMAIN.springOscillator').length - 1 >= 4,
  'spring oscillator animation, energy display, readout and tutor must share the domain solver');
assert.ok(!springBlock.includes('2*Math.PI*Math.sqrt(p.m/p.k)') && !springBlock.includes('0.5*p.m*st.v*st.v'),
  'spring oscillator period and energy must not be duplicated in the catalogue');
assert.ok(springBlock.includes('var a0=window.PHYS_DOMAIN.springOscillator') &&
  springBlock.includes('st.x+=st.v*h+0.5*a0*h*h;var a1=window.PHYS_DOMAIN.springOscillator') &&
  springBlock.includes('st.v+=0.5*(a0+a1)*h;'),
  'spring oscillator animation must use velocity-Verlet integration to reduce numerical energy drift');
const titrationBlock = catalogue.slice(catalogue.indexOf("id:'p7'"), catalogue.indexOf("id:'p8'"));
assert.ok(titrationBlock.includes('PHYS_DOMAIN.strongAcidStrongBasePH'),
  'strong acid/base titration curve must use the shared domain pH model');
assert.ok(titrationBlock.includes('K_w=1.0×10⁻¹⁴') &&
  titrationBlock.includes('c=(n酸−n碱)/V总=[H⁺]−[OH⁻]') &&
  titrationBlock.includes('计入水的自解离平衡 K_w=1.0×10⁻¹⁴') &&
  !titrationBlock.includes('水的自解离修正或活度系数'),
  'titration formulas and tutor must agree with the implemented 25°C water-autoionization model');
assert.ok(titrationBlock.includes('不包含弱酸/弱碱的 K_a/K_b 平衡') &&
  titrationBlock.includes('不能直接套用本曲线'),
  'titration tutor must disclose the strong-acid/strong-base model boundary');
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


assert.ok(pageHtml.includes('product-system-v9.css?v=20261021-ui-restoration-v1'),
  'PhysChem Lab must load the current V9.2 workspace and archive interaction layer');
assert.ok(app.includes('function restoreSavedExperiment(index)') &&
          app.includes('data-load-save=') &&
          app.includes('restoreSavedExperiment(Number(button.getAttribute(\'data-load-save\')))'),
  'saved experiment cards must expose a real parameter restore action');
assert.ok(app.includes('saved.modelVersion!==ARCHIVE_MODEL_VERSION') &&
          app.includes('value<definition.min||value>definition.max') &&
          app.includes('nextState=target.init?target.init(nextParams):{}'),
  'archive restore must enforce model version, parameter bounds and successful model initialization');

const restoreStart=app.indexOf('function restoreSavedExperiment(index){');
const restoreEnd=app.indexOf('\nfunction renderD()',restoreStart);
assert.ok(restoreStart>=0&&restoreEnd>restoreStart,'saved experiment restore function must be bounded for regression testing');
const restoreSource=app.slice(restoreStart,restoreEnd);
const mockTarget={
  id:'p-test',name:'Test experiment',brief:'Test parameter model',
  params:[{key:'v0',min:0,max:100}],
  init:params=>({initializedAt:params.v0})
};
const restoreToasts=[];
const restoredNoteField={value:''};
const restoreContext=vm.createContext({
  saves:[{name:'Test experiment',experimentId:'p-test',modelVersion:'physchem-engine-v2',time:'2026-10-19',params:{v0:42},note:'Observed stable response at the reference point.'}],
  EXP:[mockTarget],ARCHIVE_MODEL_VERSION:'physchem-engine-v2',
  cur:null,P:{v0:12},ST:{initializedAt:12},paused:true,
  restoredNote:restoredNoteField,
  updateExperimentNoteCount(){},
  toast(message){restoreToasts.push(message);},
  setExperimentSidebarOpen(){},
  E(id){
    if(id==='bp')return {textContent:'⏸ 暂停',className:'bt'};
    if(id==='et')return {textContent:''};
    if(id==='eb2')return {textContent:''};
    if(id==='experimentNote')return restoredNoteField;
    return null;
  },
  buildParams(){},buildPanel(){},renderList(){},refreshTutor(){},
  setTimeout(){},resize(){}
});
vm.runInContext(restoreSource+'\nthis.restore=restoreSavedExperiment;',restoreContext);
assert.equal(restoreContext.restore(0),true,
  'valid saved parameters must load into the matching current experiment');
assert.equal(restoreContext.cur.id,'p-test');
assert.equal(restoreContext.P.v0,42);
assert.equal(restoreContext.ST.initializedAt,42);
assert.equal(restoreContext.paused,false);
assert.equal(restoreContext.saves.length,1,
  'loading a saved parameter set must not delete or mutate the original archive');
assert.equal(restoredNoteField.value,'Observed stable response at the reference point.',
  'loading a saved experiment must restore its observation note');

const validParams=JSON.stringify(restoreContext.P);
restoreContext.saves[0].params={v0:101};
assert.equal(restoreContext.restore(0),false,
  'out-of-range saved parameters must be refused');
assert.equal(JSON.stringify(restoreContext.P),validParams,
  'refused parameter restore must not partially modify the live experiment');
restoreContext.saves[0].params={v0:42};
restoreContext.saves[0].modelVersion='physchem-engine-v1';
assert.equal(restoreContext.restore(0),false,
  'a different declared model version must not be auto-applied');
console.log('PhysChem experiment archive parameter-restore checks passed.');


// Execute the complete catalogue in script order with the same factory contract as the browser.
assert.ok(pageHtml.indexOf('legacy-app.js?v=20261021-catalogue-restore-v2') <
          pageHtml.indexOf('experiment-catalogue.js?v=20261021-catalogue-restore-v2'),
  'the engine must load before the catalogue because the catalogue uses its model factories');
assert.ok(app.includes('window.mkCurve=mkCurve') &&
          app.includes('window.mkMotion=mkMotion') &&
          app.includes('window.mkPart=mkPart'),
  'the engine must expose its catalogue factories before the catalogue script executes');
const runtimeModels=[];
const runtimeWindow={EXP:runtimeModels,PHYS_DOMAIN:{},PHYS_DRAW:{clamp(){},roundedRect(){},pill(){},label(){}}};
const runtimeContext={
  window:runtimeWindow,EXP:runtimeModels,
  P:(key,label,min,max,step,value,unit)=>({key,label,min,max,step,value,unit:unit||''}),
  F:(value,digits=2)=>Number(value).toFixed(digits),
  mkCurve:model=>({id:model.id,name:model.name,cat:model.cat}),
  mkMotion:model=>({id:model.id,name:model.name,cat:model.cat}),
  mkPart:model=>({id:model.id,name:model.name,cat:model.cat}),
  Math,Number,isFinite
};
vm.runInNewContext(catalogue,runtimeContext,{timeout:2000});
assert.equal(runtimeModels.length,108,
  'executing the catalogue must register all 8 flagship and 100 categorized experiments at runtime');
assert.equal(new Set(runtimeModels.map(model=>model.id)).size,108,
  'the runtime catalogue must contain 108 unique experiment IDs');
assert.ok(runtimeModels.every(model=>model.id&&model.name&&model.cat),
  'every runtime experiment must expose its visible directory fields');
console.log('PhysChem runtime catalogue registration passed: ' + runtimeModels.length + ' experiments.');
