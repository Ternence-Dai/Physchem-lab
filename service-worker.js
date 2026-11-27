'use strict';

// Physchem Lab PWA: cache public application assets only. Experiment runs,
// measurements, notebook content and future instrument/API payloads are network-only.
const CACHE = 'physchem-v7';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/maskable.svg',
  './assets/css/legacy-app.css',
  './assets/css/product-system.css?v=20261021-ui-restoration-v1',
  './assets/css/workspace-v5.css?v=20261022-live-context-metrics-v1',
  './assets/css/experiment-notebook-v9.css?v=20261021-ui-restoration-v1',
  './assets/css/physchem-lab-workspace.css?v=20261021-ui-restoration-v1',
  './assets/css/physchem-control-room-v2.css?v=20261022-instrument-workbench-v4',
  './assets/css/instrument-workbench-v3.css?v=20261022-instrument-workbench-v3',
  './assets/css/reference-platform-v4.css?v=20261022-reference-v5',
  './assets/css/nist-webbook-reference-v1.css?v=20261022-nist-webbook-v1',
  './assets/css/archive-comparison-v1.css?v=20261023-archive-compare-v2',
  './assets/css/readability-accessibility-v10.css?v=20261021-ui-v2',
  './assets/css/physchem-authoritative-control-room.css?v=20261024-instrument-room-v1',
  './assets/js/vendor/echarts.min.js',
  './assets/js/legacy-app.js?v=20261126-backup-envelope-v1',
  './assets/js/primary-demos.js?v=20261124-primary-zone-v1',
  './assets/css/primary-zone.css?v=20261124-primary-zone-v1',
  './primary-zone.html',
  './assets/js/experiment-catalogue.js?v=20261125-snell-ray-diagram-v1',
  './assets/js/workspace-v5.js?v=20261021-ui-restoration-v1',
  './assets/js/workspace-v5-context.js?v=20261022-context-mount-v3',
  './assets/js/nist-webbook-reference-v1.js?v=20261022-nist-webbook-v1'
];

const STATIC_ASSET_PATH = /\.(?:css|js|mjs|svg|png|webp|ico|woff2?|webmanifest)$/i;

function isCacheableStaticRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return false;
  if (request.headers && request.headers.has('authorization')) return false;
  return STATIC_ASSET_PATH.test(url.pathname);
}

function isPublicCacheableResponse(response) {
  if (!response || !response.ok) return false;
  const cacheControl = response.headers.get('Cache-Control') || '';
  if (/(?:private|no-store|no-cache)/i.test(cacheControl)) return false;
  const contentType = response.headers.get('Content-Type') || '';
  return /(?:text\/(?:css|javascript)|application\/(?:javascript|manifest\+json)|image\/|font\/)/i.test(contentType);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request, { ignoreSearch: true }).then((cached) =>
          cached || caches.match('./index.html', { ignoreSearch: true })
        )
      )
    );
    return;
  }
  if (!isCacheableStaticRequest(request)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(async (response) => {
        if (isPublicCacheableResponse(response)) {
          try {
            // Await persistence so an immediate offline transition cannot race
            // a detached cache write. Keep valid network data on quota failure.
            const cache = await caches.open(CACHE);
            await cache.put(request, response.clone());
          } catch {
            // Cache quota/write failures must not discard a valid response.
          }
        }
        return response;
      });
    })
  );
});
