import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');

test('Physchem PWA invalidates legacy broad cache', () => {
  assert.match(worker, /const CACHE = 'physchem-v2'/);
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
