import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');

test('Physchem PWA invalidates legacy broad cache', () => {
  // Version-agnostic structural assertion (converted 2026-11-26,
  // same anti-recurrence fix as the other five repos): the intent
  // is that the cache carries a bumpable physchem-v<N> name and the
  // activate handler deletes every cache whose key differs — not
  // that the name is one specific version, which broke on every
  // legitimate cache bump.
  assert.match(worker, /const CACHE = 'physchem-v\d+'/);
  assert.match(worker, /keys\.filter\(\(key\) => key !== CACHE\)\.map\(\(key\) => caches\.delete\(key\)\)/);
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

test('navigation remains network-first with offline app-shell fallback', () => {
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.match(worker, /fetch\(request\)\.catch\(\(\) => caches\.match\('\.\/index\.html'/);
});

test('versioned page assets use exact cache keys and awaited cache persistence', () => {
  const cacheName = worker.match(/const CACHE = '([^']+)'/);
  assert.ok(cacheName);
  assert.equal(cacheName[1], 'physchem-v7');
  assert.match(worker, /caches\\.match\\(request\\)\\.then/);
  assert.doesNotMatch(worker, /caches\\.match\\(request, \\{\\s*ignoreSearch:\\s*true/);
  assert.match(worker, /await cache\\.put\\(request, response\\.clone\\(\\)\\)/);
  assert.match(worker, /Cache quota\\/write failures must not discard a valid response/);

  const precacheBlock = worker.match(/const PRECACHE = \\[([\\s\\S]*?)\\];/);
  assert.ok(precacheBlock, 'service worker must declare PRECACHE');
  const precached = new Set([...precacheBlock[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]));
  const pageAssets = [...html.matchAll(/(?:src|href)="(\\.\\/[^\"]+)"/g)].map((entry) => entry[1]);
  assert.ok(pageAssets.length > 0, 'index.html must reference local assets');
  for (const asset of pageAssets) {
    if (/\\.(?:css|js|mjs|svg|png|webp|ico|woff2?|webmanifest)(?:\\?|$)/i.test(asset)) {
      assert.ok(precached.has(asset), 'page asset must be precached exactly: ' + asset);
    }
  }
});
