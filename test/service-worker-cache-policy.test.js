import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Physchem PWA invalidates the legacy cache namespace', () => {
  const cacheMatch = worker.match(/const CACHE = '([^']+)'/);
  assert.ok(cacheMatch, 'service worker must declare a CACHE constant');
  assert.equal(cacheMatch[1], 'physchem-v7');
  assert.match(worker, /keys\.filter\(\(key\) => key !== CACHE\)/);
});

test('Physchem page assets use exact query-versioned cache keys', () => {
  assert.match(worker, /caches\.match\(request\)\.then/);
  assert.equal(worker.includes('caches.match(request, { ignoreSearch: true })'), false);

  const precacheBlock = worker.match(/const PRECACHE = \[([\s\S]*?)\];/);
  assert.ok(precacheBlock, 'service worker must declare PRECACHE');
  const precached = new Set([...precacheBlock[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]));
  const pageAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((entry) => entry[1])
    .filter((asset) => asset.startsWith('./') && /\.(?:css|js|mjs|svg|png|webp|ico|woff2?|webmanifest)(?:\?.*)?$/i.test(asset));
  assert.ok(pageAssets.length > 0, 'index.html must reference local static assets');
  for (const asset of pageAssets) {
    assert.ok(precached.has(asset), 'page asset must be precached at its exact URL: ' + asset);
  }
});

test('Physchem cache writes are awaited and network data survives cache failures', () => {
  assert.match(worker, /await cache\.put\(request, response\.clone\(\)\)/);
  assert.match(worker, /Cache quota\/write failures must not discard a valid response/);
});

test('Physchem continues to bypass API and authenticated requests', () => {
  assert.match(worker, /url\.pathname === '\/api' \|\| url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker, /request\.headers\.has\('authorization'\)/);
  assert.match(worker, /if \(!isCacheableStaticRequest\(request\)\) return/);
});


test('offline navigation restores the requested cached static page before the app shell', () => {
  assert.match(worker, /caches\.match\(request, \{ ignoreSearch: true \}\)\.then/);
  assert.match(worker, /cached \|\| caches\.match\('\.\/index\.html', \{ ignoreSearch: true \}\)/);
  assert.ok(worker.includes("'./primary-zone.html'"), 'primary-zone must remain in the install precache');
});
