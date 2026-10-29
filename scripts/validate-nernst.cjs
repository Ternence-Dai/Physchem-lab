'use strict';
const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('assets/js/experiment-catalogue.js', 'utf8') + '\n' + fs.readFileSync('assets/js/legacy-app.js', 'utf8');
const start = html.indexOf("id:'ch12'");
if (start < 0) throw new Error('Nernst experiment ch12 not found');
const section = html.slice(start, html.indexOf('\n];', start));
const match = section.match(/fn:function\(p,x\)\{return [^;]+;\}/);
if (!match) throw new Error('Nernst curve function not found');
const fn = new Function('return (' + match[0].slice(3) + ')')();
const assert = require('node:assert/strict');
// The chart x-axis is lg Q, so the curve must be linear in lg Q:
// E = E0 - (0.05916/n) * lgQ, with lgQ = 0 (Q = 1) at E = E0.
for (const p of [{E0:1.1, n:2}, {E0:0.34, n:1}, {E0:-0.76, n:2}]) {
  assert.ok(Math.abs(fn(p, 0) - p.E0) < 1e-12,
    `Nernst curve must pass through E0 at lg Q = 0, got ${fn(p, 0)} for E0=${p.E0}`);
  const expected = p.E0 - 0.05916 / p.n * 6;
  assert.ok(Math.abs(fn(p, 6) - expected) < 1e-12,
    `Nernst curve at lg Q = 6 must be E0 - 0.05916/n*6 = ${expected}, got ${fn(p, 6)}`);
  assert.ok(Number.isFinite(fn(p, -6)), 'Nernst curve must stay finite at lg Q = -6');
}
assert.match(section, /xR:\[-6,6\]/,
  'Nernst chart domain must be lg Q in [-6, 6], not linear Q');
assert.match(section, /mk:\[\{x:0,l:'Q=1'/,
  'Nernst reference marker for Q = 1 must sit at lg Q = 0');
assert.ok(!section.includes('E>0'),
  'half-cell potential must not be labelled spontaneous by its own sign');
console.log('Nernst equation regression checks passed.');
