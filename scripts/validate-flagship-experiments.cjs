'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

function assertFiniteTree(value, label, seen = new Set()) {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), label + ' contains a non-finite number');
    return;
  }
  if (value === null || typeof value !== 'object') return;
  assert.ok(!seen.has(value), label + ' contains a circular state reference');
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    assertFiniteTree(child, label + '.' + key, seen);
  }
  seen.delete(value);
}

async function main() {
  const domainUrl = pathToFileURL(path.resolve(__dirname, '../src/domain/index.js')).href;
  const domain = await import(domainUrl);
  const catalogue = fs.readFileSync(
    path.resolve(__dirname, '../assets/js/experiment-catalogue.js'), 'utf8'
  );
  const models = [];
  const noop = () => {};
  const draw = {
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    roundedRect: noop,
    pill: noop,
    label: noop,
    spring: noop,
    perimeterPoint: () => [0, 0]
  };
  const window = { PHYS_DRAW: draw, PHYS_DOMAIN: domain };
  const context = {
    window,
    EXP: models,
    P: (key, label, min, max, step, value, unit) => ({
      key, label, min, max, step, value, unit: unit || ''
    }),
    F: (value, digits = 2) => Number(value).toFixed(digits),
    mkCurve: model => model,
    mkMotion: model => model,
    mkPart: model => model,
    Math, Number, isFinite
  };

  vm.runInNewContext(catalogue, context, {
    filename: 'assets/js/experiment-catalogue.js',
    timeout: 5000
  });

  const flagship = models.filter(model => /^p[1-8]$/.test(model.id));
  assert.equal(flagship.length, 8, 'all eight flagship experiments must register');
  for (const model of flagship) {
    assert.ok(Array.isArray(model.params) && model.params.length > 0,
      model.id + ': parameter definitions must be present');
    const params = Object.fromEntries(model.params.map(parameter => {
      assert.ok(Number.isFinite(parameter.value),
        model.id + ': parameter default must be finite: ' + parameter.key);
      assert.ok(parameter.min <= parameter.value && parameter.value <= parameter.max,
        model.id + ': parameter default must be inside its declared bounds: ' + parameter.key);
      return [parameter.key, parameter.value];
    }));

    const state = model.init ? model.init.call(model, params) : {};
    assert.ok(state && typeof state === 'object' && !Array.isArray(state),
      model.id + ': initialization must return a state object');
    assertFiniteTree(state, model.id + '.initialState');

    if (typeof model.step === 'function') {
      for (let frame = 0; frame < 12; frame++) {
        model.step.call(model, params, 1 / 60, state);
        assertFiniteTree(state, model.id + '.stateAfterFrame' + frame);
      }
    }

    if (typeof model.calc === 'function') {
      const result = model.calc.call(model, params);
      assert.ok(result && typeof result === 'object',
        model.id + ': calculation must return a result object');
      assertFiniteTree(result, model.id + '.calculation');
    }
    if (typeof model.readout === 'function') {
      const rows = model.readout.call(model, params, state);
      assert.ok(Array.isArray(rows) && rows.length > 0,
        model.id + ': readout must return at least one row');
      for (const row of rows) {
        assert.ok(row && typeof row.k === 'string' && row.k.trim(),
          model.id + ': readout labels must be non-empty strings');
        assert.ok(typeof row.v === 'string' && row.v.trim(),
          model.id + ': readout values must be non-empty strings');
        assert.doesNotMatch(row.v, /(?:NaN|Infinity|undefined)/,
          model.id + ': readout must not expose invalid numeric output: ' + row.k);
      }
    }
    if (typeof model.tutor === 'function') {
      const explanation = model.tutor.call(model, params, state);
      assert.ok(typeof explanation === 'string' && explanation.trim(),
        model.id + ': tutor must return a non-empty explanation');
      assert.doesNotMatch(explanation, /(?:NaN|Infinity|undefined)/,
        model.id + ': tutor must not expose invalid numeric output');
    }
  }

  console.log('PhysChem flagship lifecycle checks passed: ' +
    flagship.map(model => model.id).join(', '));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
