import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Physchem PWA invalidates only its own legacy cache family', () => {
  const cacheMatch = worker.match(/const CACHE = '([^']+)'/);
  assert.ok(cacheMatch, 'service worker must declare CACHE');
  assert.match(cacheMatch[1], /^physchem-v\d+$/);
  assert.match(worker, /key\.startsWith\('physchem-'\) && key !== CACHE/);
  assert.doesNotMatch(worker, /keys\.filter\(\(key\) => key !== CACHE\)/);
});

test('API and authenticated requests bypass Cache Storage', () => {
  assert.match(worker, /url\.pathname === '\/api' \|\| url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker, /request\.headers\.has\('authorization'\)/);
  assert.match(worker, /if \(!isCacheableStaticRequest\(request\)\) return/);
});

test('only public static responses may be stored', () => {
  assert.match(worker, /STATIC_ASSET_PATH/);
  assert.match(worker, /isPublicCacheableResponse\(response\)/);
  assert.match(worker, /private\|no-store\|no-cache/);
});

test('navigation falls back to the requested page before the main app shell', () => {
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.match(worker, /caches\.match\(request, \{ ignoreSearch: true \}\)\.then/);
  assert.match(worker, /cached \|\| caches\.match\('\.\/index\.html', \{ ignoreSearch: true \}\)/);
  assert.ok(worker.includes("'./primary-zone.html'"));
});

test('versioned page assets use exact cache keys and awaited writes', () => {
  assert.match(worker, /caches\.match\(request\)\.then/);
  assert.doesNotMatch(worker, /caches\.match\(request, \{\s*ignoreSearch:\s*true/);
  assert.match(worker, /await cache\.put\(request, response\.clone\(\)\)/);
  assert.match(worker, /Cache quota\/write failures must not discard a valid response/);

  const block = worker.match(/const PRECACHE = \[([\s\S]*?)\];/);
  assert.ok(block);
  const precached = new Set([...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
  const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((value) => value.startsWith('./') && /\.(?:css|js|mjs|svg|png|webp|ico|woff2?|webmanifest)(?:\?.*)?$/i.test(value));
  assert.ok(assets.length > 0);
  for (const asset of assets) assert.ok(precached.has(asset), 'missing exact precache URL: ' + asset);
});
