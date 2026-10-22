'use strict';

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle', timeout: 30000 });
    const skipLink = page.locator('a.skip-link[href="#main-content"]');
    if (await skipLink.count() !== 1) throw new Error('Keyboard skip-navigation link is missing');
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')))) {
      throw new Error('Skip navigation is not the first keyboard focus target');
    }
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.activeElement?.id === 'main-content');
    await page.waitForFunction(() => {
      const total = document.querySelector('#catalogueTotal');
      return total && total.textContent.trim() === '108' &&
        document.querySelectorAll('#lst .it').length === 108 &&
        document.querySelector('#simulationStatus')?.textContent.trim() === '运行中';
    }, undefined, { timeout: 20000 });

    const total = await page.locator('#lst .it').count();
    if (total !== 108) throw new Error(`Expected 108 visible experiment entries, received ${total}`);

    const drawResults = [];
    for (let index = 0; index < total; index++) {
      const item = page.locator('#lst .it').nth(index);
      const label = (await item.getAttribute('aria-label')) || `experiment #${index + 1}`;
      await item.click();
      await page.waitForTimeout(100);
      const renderError = await page.evaluate(() => window.__physchemDrawError || window.__physchemStepError || null);
      if (renderError) throw new Error(`${label}: renderer error: ${renderError.message}`);
      const result = await page.locator('#cv').evaluate(canvas => {
        const context = canvas.getContext('2d');
        if (!context || canvas.width < 100 || canvas.height < 100) return { pixels: 0, colored: 0 };
        const width = Math.min(canvas.width, 900);
        const height = Math.min(canvas.height, 520);
        const pixels = context.getImageData(0, 0, width, height).data;
        let visible = 0;
        let colored = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 0) visible++;
          const max = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
          const min = Math.min(pixels[i], pixels[i + 1], pixels[i + 2]);
          if (pixels[i + 3] > 0 && max - min > 35) colored++;
        }
        return { pixels: visible, colored };
      });
      if (result.pixels < 80 || result.colored < 20) {
        throw new Error(`${label}: canvas appears blank or has no colored model drawing (${JSON.stringify(result)})`);
      }
      drawResults.push(label);
    }

    const animatedExperiments = [
      '抛体运动轨迹',
      '单摆与简谐振动',
      '弹簧振子与能量转化',
      '欧姆定律电路',
      '理想气体分子运动'
    ];
    const frameSignature = async () => page.locator('#cv').evaluate(canvas => {
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas 2D context is unavailable during animation test');
      const width = Math.min(canvas.width, 900);
      const height = Math.min(canvas.height, 520);
      const bytes = context.getImageData(0, 0, width, height).data;
      let hash = 2166136261;
      for (let i = 0; i < bytes.length; i += 32) {
        hash ^= bytes[i];
        hash = Math.imul(hash, 16777619);
        hash ^= bytes[i + 1];
        hash = Math.imul(hash, 16777619);
        hash ^= bytes[i + 2];
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    });
    const motionResults = [];
    for (const name of animatedExperiments) {
      const item = page.locator('#lst .it').filter({ hasText: name }).first();
      if (await item.count() !== 1) throw new Error('Animated experiment is missing or duplicated: ' + name);
      await item.click();
      await page.waitForFunction(expected => document.querySelector('#et')?.textContent === expected, name);
      const frames = [];
      for (let sample = 0; sample < 3; sample++) {
        await page.waitForTimeout(280);
        frames.push(await frameSignature());
      }
      if (new Set(frames).size < 2) {
        throw new Error(name + ': canvas pixels did not change across consecutive animation frames (' + frames.join(',') + ')');
      }
      motionResults.push(name);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelectorAll('#lst .it').length === 108);
    const menu = page.locator('#mobileMenu');
    await menu.click();
    if (await menu.getAttribute('aria-expanded') !== 'true') {
      throw new Error('Mobile experiment drawer did not open accessibly');
    }
    await page.locator('#lst .it').nth(107).click();
    if (await menu.getAttribute('aria-expanded') !== 'false') {
      throw new Error('Selecting a mobile experiment did not close the drawer');
    }
    const mobileCanvas = await page.locator('#cv').evaluate(canvas => ({
      width: canvas.width,
      height: canvas.height,
      cssWidth: canvas.getBoundingClientRect().width
    }));
    if (mobileCanvas.width < 100 || mobileCanvas.height < 100 || mobileCanvas.cssWidth < 200) {
      throw new Error(`Mobile canvas did not size correctly: ${JSON.stringify(mobileCanvas)}`);
    }

    if (pageErrors.length) throw new Error('Browser runtime errors: ' + pageErrors.join(' | '));
    console.log(`Browser canvas smoke test passed: ${drawResults.length}/108 experiments drew visible colored output; ${motionResults.length}/${animatedExperiments.length} representative simulations changed rendered frames; mobile drawer and canvas passed.`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
