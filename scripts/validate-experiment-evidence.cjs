'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const cataloguePath = 'assets/js/experiment-catalogue.js';
const manifestPath = 'data/experiment-evidence-manifest.json';
const source = fs.readFileSync(cataloguePath, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function extractBalanced(text, start, open, close) {
  let depth = 0, quote = null, escape = false, lineComment = false, blockComment = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === '\`') { quote = ch; continue; }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error('Unclosed ' + open + ' starting at ' + start);
}

function splitTopLevel(body) {
  const values = [];
  let start = 0, quote = null, escape = false, round = 0, square = 0, curly = 0;
  let lineComment = false, blockComment = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i], next = body[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === '\`') { quote = ch; continue; }
    if (ch === '(') round += 1; else if (ch === ')') round -= 1;
    else if (ch === '[') square += 1; else if (ch === ']') square -= 1;
    else if (ch === '{') curly += 1; else if (ch === '}') curly -= 1;
    else if (ch === ',' && round === 0 && square === 0 && curly === 0) {
      values.push(body.slice(start, i).trim());
      start = i + 1;
    }
  }
  const tail = body.slice(start).trim();
  if (tail) values.push(tail);
  return values;
}

function parseCatalogue(text) {
  const models = [];
  // Entries may carry extra fields between id and name (e.g. the Manim
  // explainer-video wiring adds mv:/video: there), so do not require
  // name to immediately follow id.
  const pattern = /\{id\s*:\s*['"]([^'"]+)['"]\s*,[^{}]*?name\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = pattern.exec(text))) {
    const objectText = extractBalanced(text, match.index, '{', '}');
    const prefix = text.slice(0, match.index);
    const declarations = [...prefix.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*\[/g)];
    const group = declarations.length ? declarations[declarations.length - 1][1] : 'flagship';
    const fallbackCategory = {
      M: '物理', C1: '物理', C2: '物理',
      C3: '化学', C4: '化学', C5: '化学',
      C6: '物理', flagship: '混合'
    }[group] || '未分类';
    const category = (objectText.match(/\bcat\s*:\s*['"]([^'"]+)['"]/) || [])[1] || fallbackCategory;
    const tagsMatch = objectText.match(/\btags\s*:\s*\[([^\]]*)\]/);
    const tags = tagsMatch
      ? [...tagsMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(item => item[1])
      : [];
    const parameterMatch = objectText.match(/\b(?:p|params)\s*:\s*\[/);
    const parameters = [];
    if (parameterMatch) {
      const arrayStart = parameterMatch.index + parameterMatch[0].lastIndexOf('[');
      const parameterArray = extractBalanced(objectText, arrayStart, '[', ']');
      const pPattern = /P\(\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*(['"])(.*?)\9)?\s*\)/g;
      let parameterMatchItem;
      while ((parameterMatchItem = pPattern.exec(parameterArray))) {
        parameters.push({
          key: parameterMatchItem[2],
          label: parameterMatchItem[4],
          minExpression: parameterMatchItem[5].trim(),
          maxExpression: parameterMatchItem[6].trim(),
          stepExpression: parameterMatchItem[7].trim(),
          defaultExpression: parameterMatchItem[8].trim(),
          unit: parameterMatchItem[10] || ''
        });
      }
    }
    const formulaMatch = objectText.match(/\b(?:f|formulas)\s*:\s*\[/);
    let formulaCount = 0;
    if (formulaMatch) {
      const arrayStart = formulaMatch.index + formulaMatch[0].lastIndexOf('[');
      const formulaArray = extractBalanced(objectText, arrayStart, '[', ']');
      formulaCount = splitTopLevel(formulaArray.slice(1, -1)).length;
    }
    models.push({
      id: match[1],
      name: match[2],
      category,
      sourceGroup: group,
      tags,
      formulaCount,
      parameters
    });
  }
  return models;
}

const actual = parseCatalogue(source);
const declared = manifest.experiments;
assert.equal(manifest.schemaVersion, '1.0.0');
assert.equal(manifest.auditType, 'experiment_evidence_inventory');
assert.equal(manifest.sourceCatalogue.path, cataloguePath);
// Windows checkouts may convert LF to CRLF. Git blob identity is based on
// repository bytes, so normalize working-tree line endings before hashing.
const normalizedSource = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const actualGitBlobSha = crypto.createHash('sha1')
  .update('blob ' + Buffer.byteLength(normalizedSource, 'utf8') + '\0')
  .update(normalizedSource, 'utf8').digest('hex');
assert.equal(manifest.sourceCatalogue.gitBlobSha, actualGitBlobSha,
  'evidence manifest must be regenerated when the catalogue source changes');
assert.equal(actual.length, 108, 'runtime catalogue source must expose exactly 108 experiments');
assert.equal(declared.length, actual.length, 'manifest must contain exactly one record per experiment');

const actualById = new Map(actual.map(item => [item.id, item]));
assert.equal(actualById.size, actual.length, 'catalogue experiment IDs must be unique');
const declaredIds = new Set();

for (const record of declared) {
  assert.ok(!declaredIds.has(record.id), 'duplicate evidence record: ' + record.id);
  declaredIds.add(record.id);
  const model = actualById.get(record.id);
  assert.ok(model, 'manifest contains an unknown experiment ID: ' + record.id);
  assert.equal(record.name, model.name, record.id + ': name must match the catalogue');
  assert.equal(record.category, model.category, record.id + ': category must match the catalogue');
  assert.equal(record.sourceGroup, model.sourceGroup, record.id + ': source group must match the catalogue');
  assert.deepEqual(record.tags, model.tags, record.id + ': tags must match the catalogue');
  assert.equal(record.formulaCount, model.formulaCount, record.id + ': formula count must match the catalogue');
  const comparableParameters = record.parameters.map(({ unitEvidence, ...parameter }) => parameter);
  assert.deepEqual(comparableParameters, model.parameters,
    record.id + ': parameter bounds and unit labels must match the catalogue');
  for (const parameter of record.parameters) {
    const expectedUnitEvidence = parameter.unit.trim()
      ? 'explicit_label_in_catalogue'
      : 'not_specified_requires_review';
    assert.equal(parameter.unitEvidence, expectedUnitEvidence,
      record.id + ': unit evidence state must match its displayed unit');
  }

  const evidence = record.scientificEvidence;
  assert.ok(evidence && Array.isArray(evidence.candidateReferences) &&
    Array.isArray(evidence.itemLevelCitations) && Array.isArray(evidence.declaredAssumptions));
  assert.ok(['not_yet_item_verified', 'partially_verified', 'verified'].includes(evidence.formulaReferenceStatus));
  assert.ok(['not_structured', 'documented'].includes(evidence.assumptionsStatus));
  assert.ok(['not_supplied', 'verified'].includes(evidence.independentBenchmarkStatus));
  assert.ok(['not_supplied', 'verified'].includes(evidence.measuredDatasetStatus));
  for (const referenceId of evidence.candidateReferences) {
    assert.ok(manifest.referenceRegistry[referenceId],
      record.id + ': unknown candidate reference ' + referenceId);
  }
  if (['partially_verified', 'verified'].includes(evidence.formulaReferenceStatus)) {
    assert.ok(evidence.itemLevelCitations.length > 0,
      record.id + ': verified formula status requires item-level citations');
    for (const citation of evidence.itemLevelCitations) {
      assert.ok(typeof citation.sourceId === 'string' &&
        manifest.referenceRegistry[citation.sourceId], record.id + ': citation source must exist');
      assert.ok(typeof citation.locator === 'string' && citation.locator.trim(),
        record.id + ': citation requires an exact chapter/section/page locator');
      assert.ok(typeof citation.formulaCoverage === 'string' && citation.formulaCoverage.trim(),
        record.id + ': citation must state the exact formula coverage');
      assert.ok(typeof citation.limitations === 'string' && citation.limitations.trim(),
        record.id + ': citation must disclose what it does not validate');
    }
  }
  if (evidence.assumptionsStatus === 'documented') {
    assert.ok(evidence.declaredAssumptions.length > 0,
      record.id + ': documented assumptions must not be empty');
    assert.ok(evidence.declaredAssumptions.every(value =>
      typeof value === 'string' && value.trim()),
      record.id + ': assumptions must be non-empty statements');
  }
  if (evidence.formulaReferenceStatus !== 'not_yet_item_verified') {
    assert.equal(evidence.verificationScope && typeof evidence.verificationScope, 'string',
      record.id + ': formula verification must declare its scope and limitations');
  }
  assert.ok(['not_supplied', 'verified'].includes(evidence.independentBenchmarkStatus),
    record.id + ': unsupported independent benchmark state');
  if (evidence.independentBenchmarkStatus === 'verified') {
    assert.equal(evidence.benchmarkEvidenceType, 'closed_form_analytic_reference_vector',
      record.id + ': this register only promotes closed-form analytical reference vectors');
    assert.ok(Array.isArray(evidence.benchmarkCases) && evidence.benchmarkCases.length > 0,
      record.id + ': benchmark verification requires one or more evidence-backed cases');
    const benchmarkFields = new Set();
    for (const item of evidence.benchmarkCases) {
      assert.ok(typeof item.field === 'string' && item.field.trim() &&
        !benchmarkFields.has(item.field),
        record.id + ': benchmark fields must be non-empty and unique');
      benchmarkFields.add(item.field);
      assert.ok(Number.isFinite(item.expected) && Number.isFinite(item.tolerance) &&
        item.tolerance > 0 && item.tolerance <= 1e-6 &&
        typeof item.locator === 'string' && item.locator.trim(),
        record.id + ': benchmark cases require finite expected values, a bounded positive tolerance, and exact locators');
      assert.ok(typeof item.sourceId === 'string' &&
        manifest.referenceRegistry[item.sourceId],
        record.id + ': benchmark source must exist in the reference registry');
    }
    assert.ok(typeof evidence.benchmarkScope === 'string' && evidence.benchmarkScope.trim(),
      record.id + ': benchmark scope must disclose limitations');
  }
  if (evidence.measuredDatasetStatus === 'verified') {
    assert.ok(evidence.measuredDataset && typeof evidence.measuredDataset.sha256 === 'string' &&
      /^[0-9a-f]{64}$/.test(evidence.measuredDataset.sha256) &&
      typeof evidence.measuredDataset.locator === 'string' && evidence.measuredDataset.locator.trim(),
      record.id + ': verified measured data requires a SHA-256 digest and locator');
  }
}
assert.equal(declaredIds.size, actualById.size, 'manifest must cover every catalogue model');
for (const id of actualById.keys()) assert.ok(declaredIds.has(id), 'missing evidence record for ' + id);

// Lock the unit semantics corrected during the catalogue audit. These checks
// prevent a future catalogue edit from reintroducing blank units or changing
// an input to an incompatible basis without an explicit reviewed update.
const expectedUnits = {
  p2: { b: 's⁻¹' },
  p5: { mu: '1' },
  o1: { n1: '1', n2: '1' },
  o10: { n1: '1', n2: '1' },
  o11: { n: '1' },
  e4: { q: '1' },
  e5: { er: '1' },
  e6: { n: '1' },
  e7: { q1: 'μC', q2: 'μC' },
  ch4: { K: '1', Q: '1' },
  ch6: { xs: '1' },
  ch9: { k: '(mol/L)^(1−n)·s⁻¹', n: '1' },
  ch10: { pKa: '1' },
  ch11: { Ksp: '(mol/L)²' },
  ch12: { n: '1', Q: '1' },
  pt5: { n: '1' },
  k8: { K: 'mol/L' },
  k9: { n: '1', Q: '1' },
  k10: { K: '1' },
  k11: { n: '1', m: '1', pH: '1' },
  k13: { A: '1' },
  k21: { J: '1' },
  k22: { v: '1' },
  k25: { z: '1', R: '1' },
  k32: { k: '(mol/L)^(1−n)·s⁻¹', n: '1' },
  k33: { Q: '1' },
  k34: { G: '1' },
  k36: { Kref: '1' },
  mv2: { e: '1' },
  mv5: { sigma: '1', rho: '1', beta: '1' }
};
for (const [experimentId, expected] of Object.entries(expectedUnits)) {
  const record = declared.find(item => item.id === experimentId);
  assert.ok(record, 'unit contract references missing experiment ' + experimentId);
  for (const [key, unit] of Object.entries(expected)) {
    const parameter = record.parameters.find(item => item.key === key);
    assert.ok(parameter, experimentId + ': unit contract parameter missing: ' + key);
    assert.equal(parameter.unit, unit, experimentId + '.' + key + ' unit contract drifted');
  }
}
const unresolvedUnitFields = declared.flatMap(item =>
  item.parameters.filter(parameter => parameter.unitEvidence === 'not_specified_requires_review')
    .map(parameter => item.id + '.' + parameter.key)
).sort();
assert.deepEqual(unresolvedUnitFields, ['k13.k', 'k27.A'],
  'only the two explicitly unresolved model-scale inputs may remain without unit labels');

const pendingReferences = declared.filter(item =>
  item.scientificEvidence.formulaReferenceStatus === 'not_yet_item_verified').length;
const partialReferences = declared.filter(item =>
  item.scientificEvidence.formulaReferenceStatus === 'partially_verified').length;
const verifiedReferences = declared.filter(item =>
  item.scientificEvidence.formulaReferenceStatus === 'verified').length;
const pendingAssumptions = declared.filter(item =>
  item.scientificEvidence.assumptionsStatus !== 'documented').length;
const pendingBenchmarks = declared.filter(item =>
  item.scientificEvidence.independentBenchmarkStatus !== 'verified').length;
const analyticBenchmarks = declared.filter(item =>
  item.scientificEvidence.independentBenchmarkStatus === 'verified').length;
const unitNotSpecified = declared.reduce((total, item) =>
  total + item.parameters.filter(parameter => parameter.unitEvidence === 'not_specified_requires_review').length, 0);

console.log('Experiment evidence manifest integrity passed.');
console.log('Experiments: ' + declared.length +
  '; formula references verified: ' + verifiedReferences +
  '; formula references partially verified: ' + partialReferences +
  '; item-level formula references pending: ' + pendingReferences +
  '; structured assumptions pending: ' + pendingAssumptions +
  '; analytic reference-vector suites: ' + analyticBenchmarks +
  '; independent benchmark cases pending: ' + pendingBenchmarks +
  '; parameter labels requiring unit-semantic review: ' + unitNotSpecified + '.');
console.log('Candidate source IDs are discovery aids only, not verified citations or model validation.');
