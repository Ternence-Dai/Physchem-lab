'use strict';
const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const section = html.slice(html.indexOf("id:'o4'"));
if (!section) throw new Error('Blackbody experiment o4 not found');
const match = section.match(/fn:function\(p,x\)\{[\s\S]*?\n \},/);
if (!match) throw new Error('Blackbody spectrum function not found');
const fn = new Function('return (' + match[0].slice(3, -1) + ')')();
const assert = require('node:assert/strict');
assert.equal(fn({T:5000}, 0), 0, 'zero wavelength must have a finite limiting value');
assert.equal(fn({T:5000}, -1), 0, 'negative wavelength must be rejected');
for (const wavelength of [1, 10, 100, 580, 1000, 3000]) {
  const value = fn({T:5000}, wavelength);
  assert.ok(Number.isFinite(value) && value >= 0, `invalid spectrum at ${wavelength} nm: ${value}`);
}
const peak = fn({T:5000}, 579.55);
assert.ok(peak > 0.999 && peak < 1.01, `expected near-unity peak, got ${peak}`);
assert.equal(fn({T:0}, 500), 0, 'non-positive temperature must be rejected');
// The ECharts refactor (3ee6146) moved sampling into curveSeriesData as the
// single source of truth shared by the canvas fallback and ECharts: N=300
// samples, non-finite values become null breakpoints at sampling time, and
// drawCurve breaks path continuity on those null points. The invariant these
// assertions protect is unchanged — invalid samples must never be plotted as
// a continuous line — only its location in the code moved.
assert.match(html, /var N=300,out=\[\];/,
  'curve sampling must keep N=300 samples in curveSeriesData');
assert.match(html, /Number\.isFinite\(yv\)\?yv:null/,
  'non-finite curve samples must become null breakpoints at sampling time');
assert.match(html, /if\(pt\[1\]===null\)\{hasPrev=false;continue;\}/,
  'invalid curve values must break the plotted path in the canvas renderer');
console.log('Blackbody spectrum regression checks passed.');
