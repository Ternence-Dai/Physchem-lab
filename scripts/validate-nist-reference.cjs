'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const runtime = fs.readFileSync('assets/js/nist-webbook-reference-v1.js', 'utf8');
const css = fs.readFileSync('assets/css/nist-webbook-reference-v1.css', 'utf8');

assert.ok(html.includes('nist-webbook-reference-v1.css?v=20261022-nist-webbook-v1') &&
          html.includes('nist-webbook-reference-v1.js?v=20261022-nist-webbook-v1'),
  'PhysChem entry point must load the NIST reference search and styles');
assert.ok(runtime.includes('https://webbook.nist.gov/cgi/cbook.cgi?Name=') &&
          runtime.includes('encodeURIComponent(term)') &&
          runtime.includes('&Units=SI'),
  'NIST lookup must construct the official Chemistry WebBook name search URL safely');
assert.ok(runtime.includes('encodeURIComponent(term)') &&
          runtime.includes('noopener noreferrer'),
  'user-entered compound names must be safely encoded and external links isolated');
assert.ok(runtime.includes('不会自动修改实验参数') &&
          runtime.includes('最近更新为 2025') &&
          runtime.includes('不自动写入 108 项实验模型'),
  'NIST reference UI must distinguish reference data from measured or simulated values');
assert.ok(!runtime.includes('localStorage') &&
          !runtime.includes('setItem(') &&
          !runtime.includes('P['),
  'NIST search must not mutate local experiment data or simulation parameters');
assert.ok(css.includes('.nist-reference-dialog') &&
          css.includes('prefers-reduced-motion:reduce'),
  'NIST reference UI must be accessible and respect reduced-motion settings');
const catalogue = fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8');
const browserTest = fs.readFileSync('scripts/browser-smoke.cjs', 'utf8');
assert.ok(browserTest.includes('Expected 108 visible experiment entries') &&
          browserTest.includes('simulationInputsBeforeNist') &&
          browserTest.includes('108-experiment catalogue'),
  'browser acceptance must preserve and exercise the full 108 experiment collection');
assert.ok(catalogue.includes('EXP.push') &&
          catalogue.includes('window.PHYS_DRAW'),
  'all original experiment definitions must keep using the shared canvas drawing API');
const simulationRuntime = fs.readFileSync('assets/js/legacy-app.js', 'utf8');
assert.ok(simulationRuntime.includes('function renderCurrentFrame()'),
  'the original animation loop and simulation renderer must remain in place');
console.log('PhysChem NIST reference lookup safety and catalogue-preservation checks passed.');
