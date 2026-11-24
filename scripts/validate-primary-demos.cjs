#!/usr/bin/env node
'use strict';

/* 小学演示专区校验：
   1) 演示条目恰好 21 个，ID 集合与 2026-11-15 适配度评级的 B 级清单完全一致；
   2) 每个演示 ID 必须真实存在于运行时实验目录，且不得混入 C 级（中学以上）实验；
   3) 每条演示字段完整：家庭材料、分步操作（含家长/孩子/一起标注）、安全提示、观察问题、10 分钟时长；
   4) 专区页只引用这 21 个演示的数据层，主站首页有专区入口与演示横幅。 */
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const EXPECTED_B = ['p1', 'p2', 'p5', 'p6', 'm1', 'm10', 'm11', 'm13', 'o1', 'o9', 'o11',
  'e9', 'pt1', 'pt2', 'pt6', 'k3', 'k14', 'k16', 'mv2', 'mv3', 'mv4'];

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('assets/js/primary-demos.js', 'utf8'), sandbox);
const demos = sandbox.window.PRIMARY_DEMOS;
const themes = sandbox.window.PRIMARY_DEMO_THEMES;
assert.ok(Array.isArray(demos), 'PRIMARY_DEMOS must be an array');
assert.ok(Array.isArray(themes) && themes.length > 0, 'PRIMARY_DEMO_THEMES must be a non-empty array');

assert.equal(demos.length, 21, 'primary demo zone must contain exactly 21 demos');
const ids = demos.map(d => d.id);
assert.equal(new Set(ids).size, 21, 'demo ids must be unique');
assert.deepEqual([...ids].sort(), [...EXPECTED_B].sort(),
  'demo id set must equal the 2026-11-15 B-level rating list exactly');

const catalogue = fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8');
const catalogueIds = new Set([...catalogue.matchAll(/id:'([a-z]+\d+)'/g)].map(m => m[1]));
assert.equal(catalogueIds.size, 108, 'catalogue must still expose 108 experiments');
for (const id of ids) assert.ok(catalogueIds.has(id), 'demo ' + id + ' must exist in the experiment catalogue');

const themeKeys = new Set(themes.map(t => t.key));
const WHO = new Set(['parent', 'child', 'together']);
for (const d of demos) {
  assert.ok(themeKeys.has(d.theme), d.id + ': theme must be declared');
  assert.ok(typeof d.title === 'string' && d.title.length > 0, d.id + ': title required');
  assert.ok(typeof d.sourceName === 'string' && d.sourceName.length > 0, d.id + ': sourceName required');
  assert.ok(typeof d.hook === 'string' && d.hook.length > 0, d.id + ': hook required');
  assert.ok(typeof d.takeaway === 'string' && d.takeaway.length > 0, d.id + ': takeaway required');
  assert.equal(d.minutes, 10, d.id + ': minutes must be labelled 10');
  assert.ok(Array.isArray(d.materials) && d.materials.length >= 2, d.id + ': at least 2 household materials');
  assert.ok(Array.isArray(d.steps) && d.steps.length >= 3, d.id + ': at least 3 steps');
  for (const s of d.steps) {
    assert.ok(WHO.has(s.who), d.id + ': every step must be labelled parent/child/together');
    assert.ok(typeof s.text === 'string' && s.text.length > 0, d.id + ': step text required');
  }
  assert.ok(d.steps.some(s => s.who === 'parent'), d.id + ': at least one parent step required');
  assert.ok(Array.isArray(d.safety) && d.safety.length >= 1, d.id + ': safety notes required');
  assert.ok(Array.isArray(d.questions) && d.questions.length >= 2, d.id + ': at least 2 observation questions');
}

const zone = fs.readFileSync('primary-zone.html', 'utf8');
assert.ok(zone.includes('assets/js/primary-demos.js'), 'zone page must load the demo data layer');
assert.ok(zone.includes('中学以上'), 'zone page must state the full library is for middle school and above');
const zoneExpLinks = [...zone.matchAll(/#exp=([a-z]+\d+)/g)].map(m => m[1]);
for (const id of zoneExpLinks) assert.ok(EXPECTED_B.includes(id), 'zone page must not link to non-B experiment ' + id);

const index = fs.readFileSync('index.html', 'utf8');
assert.ok(index.includes('href="./primary-zone.html"'), 'homepage must link to the primary demo zone');
assert.ok(index.includes('id="demoBanner"'), 'experiment view must contain the demo banner');
assert.ok(index.includes('assets/js/primary-demos.js'), 'homepage must load the demo data layer');

const app = fs.readFileSync('assets/js/legacy-app.js', 'utf8');
assert.ok(app.includes('updateDemoBanner'), 'legacy-app must wire the demo banner');
assert.ok(app.includes('initialExperimentId'), 'legacy-app must support #exp= deep links from the zone');

console.log('validate-primary-demos: 21 B-level demos verified against rating list and catalogue.');
