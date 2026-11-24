// Browser smoke tests for the PhysChem Lab static workbench (Playwright).
//
// This brings the first-screen coverage of scripts/browser-smoke.cjs
// into the `node --test` suite in a compact form: serve the repository
// root over a local HTTP server, open the first screen in Chromium, and
// assert that the experiment workbench shell, the full 108-experiment
// catalogue sidebar and the default experiment render with no uncaught
// page errors and no console errors. The deeper flows of the original
// script (per-experiment runs, archive handling) stay with that script;
// this smoke never runs an experiment and never touches saved archives.
//
// Hermetic by construction: requests to any origin other than the local
// test server are fulfilled with an empty body, so the run never
// depends on external CDNs.
// Read-only guard: any non-GET request to the local origin fails the
// test, so the smoke can never write experiment archives or mutate the
// local state the app keeps in browser storage.
//
// Setup (one time):
//   npm install --no-save --package-lock=false playwright
//   npx playwright install --only-shell chromium
//
// When Playwright or its Chromium build is unavailable every test skips,
// so a plain `npm test` (domain suite) stays green on machines without a
// browser.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
};

let playwright = null;
try {
  playwright = await import('playwright');
} catch {
  playwright = null;
}

let server;
let baseUrl;
let browser;
let browserUnavailableReason = null;

before(async () => {
  server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = normalize(join(ROOT, decodeURIComponent(pathname)));
      if (!filePath.startsWith(ROOT)) {
        response.writeHead(403).end('forbidden');
        return;
      }
      const body = await readFile(filePath);
      response.writeHead(200, {
        'content-type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  if (!playwright) {
    browserUnavailableReason =
      'Playwright is not installed; run: npm install --no-save --package-lock=false playwright';
    return;
  }
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch (error) {
    browserUnavailableReason = `Chromium is unavailable for Playwright: ${error.message}`;
  }
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function openWorkbench(t) {
  if (!browser) {
    t.skip(browserUnavailableReason || 'browser unavailable');
    return null;
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
  });
  // Keep the run hermetic: only the local test server is real; every
  // other origin (the app's CDNs) gets an empty successful response.
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (
      url.startsWith(baseUrl) ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ) {
      route.continue();
    } else {
      route.fulfill({
        status: 200,
        contentType: url.endsWith('.css')
          ? 'text/css; charset=utf-8'
          : 'text/javascript; charset=utf-8',
        body: '',
      });
    }
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const writeRequests = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    if (request.method() !== 'GET' && request.url().startsWith(baseUrl)) {
      writeRequests.push(`${request.method()} ${request.url()}`);
    }
  });
  await page.goto(baseUrl + '/', { waitUntil: 'networkidle', timeout: 30000 });
  return { context, page, pageErrors, consoleErrors, writeRequests };
}

function assertClean({ pageErrors, consoleErrors, writeRequests }) {
  assert.deepEqual(pageErrors, [], `uncaught page errors: ${pageErrors}`);
  assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors}`);
  assert.deepEqual(
    writeRequests,
    [],
    `read-only guard: page issued non-GET requests: ${writeRequests}`,
  );
}

test('experiment workbench first screen renders its shell', async (t) => {
  const session = await openWorkbench(t);
  if (!session) return;
  const { context, page } = session;
  try {
    assert.match(await page.title(), /PhysChem Lab/);
    assert.equal(await page.locator('h1').innerText(), 'PhysChem Lab');
    assertClean(session);
  } finally {
    await context.close();
  }
});

test('catalogue sidebar loads the full experiment list', async (t) => {
  const session = await openWorkbench(t);
  if (!session) return;
  const { context, page } = session;
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('#experimentSidebar') &&
        document
          .querySelector('#experimentSidebar')
          .innerText.includes('目录完整加载'),
      null,
      { timeout: 15000 },
    );
    const sidebarText = await page.locator('#experimentSidebar').innerText();
    assert.match(sidebarText, /108 个可交互实验/);
    assert.match(sidebarText, /小学演示专区/);
    const buttons = await page
      .locator('#experimentSidebar button')
      .count();
    assert.ok(
      buttons >= 108,
      `expected at least the 108 catalogue entries, got ${buttons}`,
    );
    assertClean(session);
  } finally {
    await context.close();
  }
});

test('default experiment renders its chart canvas', async (t) => {
  const session = await openWorkbench(t);
  if (!session) return;
  const { context, page } = session;
  try {
    assert.equal(
      await page.locator('h2').first().innerText(),
      '抛体运动轨迹',
    );
    await page.waitForSelector('#sw canvas', { timeout: 15000 });
    assertClean(session);
  } finally {
    await context.close();
  }
});
