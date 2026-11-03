'use strict';

// Physchem Lab PWA: cache public application assets only. Experiment runs,
// measurements, notebook content and future instrument/API payloads are network-only.
const CACHE = 'physchem-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/maskable.svg',
  './assets/css/legacy-app.css',
  './assets/css/product-system.css',
  './assets/css/workspace-v5.css',
  './assets/css/experiment-notebook-v9.css',
  './assets/css/physchem-lab-workspace.css',
  './assets/css/physchem-control-room-v2.css',
  './assets/css/instrument-workbench-v3.css',
  './assets/css/reference-platform-v4.css',
  './assets/css/nist-webbook-reference-v1.css',
  './assets/css/archive-comparison-v1.css',
  './assets/css/readability-accessibility-v10.css',
  './assets/css/physchem-authoritative-control-room.css',
  './assets/js/legacy-app.js',
  './assets/js/experiment-catalogue.js',
  './assets/js/workspace-v5.js',
  './assets/js/workspace-v5-context.js',
  './assets/js/nist-webbook-reference-v1.js'
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
      fetch(request).catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }
  if (!isCacheableStaticRequest(request)) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (isPublicCacheableResponse(response)) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
