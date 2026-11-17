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
  const pattern = /\{id\s*:\s*['"]([^'"]+)['"]\s*,\s*name\s*:\s*['"]([^'"]+)['"]/g;
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
  assert.deepEqual(record.parameters, model.parameters, record.id + ': parameter bounds and units must match the catalogue');

  const evidence = record.scientificEvidence;
  assert.ok(evidence && Array.isArray(evidence.candidateReferences) &&
    Array.isArray(evidence.itemLevelCitations) && Array.isArray(evidence.declaredAssumptions));
  assert.equal(evidence.formulaReferenceStatus, 'not_yet_item_verified');
  assert.equal(evidence.assumptionsStatus, 'not_structured');
  assert.equal(evidence.independentBenchmarkStatus, 'not_supplied');
  assert.equal(evidence.measuredDatasetStatus, 'not_supplied');
  for (const referenceId of evidence.candidateReferences) {
    assert.ok(manifest.referenceRegistry[referenceId],
      record.id + ': unknown candidate reference ' + referenceId);
  }
  if (evidence.formulaReferenceStatus === 'verified') {
    assert.ok(evidence.itemLevelCitations.length > 0,
      record.id + ': verified formula status requires item-level citations');
    for (const citation of evidence.itemLevelCitations) {
      assert.ok(typeof citation.sourceId === 'string' &&
        manifest.referenceRegistry[citation.sourceId], record.id + ': citation source must exist');
      assert.ok(typeof citation.locator === 'string' && citation.locator.trim(),
        record.id + ': citation requires an exact chapter/section/page locator');
    }
  }
  if (evidence.assumptionsStatus === 'documented') {
    assert.ok(evidence.declaredAssumptions.length > 0,
      record.id + ': documented assumptions must not be empty');
  }
}
assert.equal(declaredIds.size, actualById.size, 'manifest must cover every catalogue model');
for (const id of actualById.keys()) assert.ok(declaredIds.has(id), 'missing evidence record for ' + id);

const pendingReferences = declared.filter(item =>
  item.scientificEvidence.formulaReferenceStatus !== 'verified').length;
const pendingAssumptions = declared.filter(item =>
  item.scientificEvidence.assumptionsStatus !== 'documented').length;
const pendingBenchmarks = declared.filter(item =>
  item.scientificEvidence.independentBenchmarkStatus !== 'verified').length;
const unitNotSpecified = declared.reduce((total, item) =>
  total + item.parameters.filter(parameter => parameter.unitEvidence === 'not_specified_requires_review').length, 0);

console.log('Experiment evidence manifest integrity passed.');
console.log('Experiments: ' + declared.length +
  '; item-level formula references pending: ' + pendingReferences +
  '; structured assumptions pending: ' + pendingAssumptions +
  '; independent benchmark cases pending: ' + pendingBenchmarks +
  '; parameter labels requiring unit-semantic review: ' + unitNotSpecified + '.');
console.log('Candidate source IDs are discovery aids only, not verified citations or model validation.');
