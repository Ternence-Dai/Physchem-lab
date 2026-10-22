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

    const contextScript = await page.locator('script[src*="workspace-v5-context.js"]').getAttribute('src');
    if (!contextScript || !contextScript.includes('v=20261022-live-context-metrics-v2')) {
      throw new Error('Live experiment context metrics asset version is missing: ' + contextScript);
    }

    const total = await page.locator('#lst .it').count();
    if (total !== 108) throw new Error(`Expected 108 visible experiment entries, received ${total}`);

    await page.waitForSelector('#w5ExperimentCatalogue', { timeout: 10000 });
    await page.waitForTimeout(150);
    const initialContext = await page.evaluate(() => ({
      title: document.querySelector('#w5ExperimentTitle')?.textContent.trim(),
      catalogue: document.querySelector('#w5ExperimentCatalogue')?.textContent.trim(),
      params: document.querySelector('#w5ExperimentParams')?.textContent.trim(),
      archive: document.querySelector('#w5ExperimentArchive')?.textContent.trim()
    }));
    const initialStatus = await page.locator('#w5ExperimentStatus').innerText();
    if (!initialContext.title || !initialContext.catalogue.startsWith('108 / 108') ||
        !/^\d+ 个可调变量$/.test(initialContext.params) ||
        !initialContext.archive.includes('0 条') || !['正在运行', '静态预览'].includes(initialStatus)) {
      throw new Error('Live experiment context metrics did not reflect the full catalogue, active parameters, archive and simulation state: ' +
        JSON.stringify({ ...initialContext, status: initialStatus, visibleItems: total, simulationStatus: await page.locator('#simulationStatus').innerText() }));
    }

    const drawResults = [];
    for (let index = 0; index < total; index++) {
      const item = page.locator('#lst .it').nth(index);
      const label = (await item.getAttribute('aria-label')) || `experiment #${index + 1}`;
      await item.click();
      await page.waitForTimeout(100);
      if (index === 0) {
        await page.waitForFunction(() =>
          document.querySelector('#w5ExperimentTitle')?.textContent === document.querySelector('#et')?.textContent
        );
        await page.locator('#bp').click();
        await page.waitForFunction(() => document.querySelector('#w5ExperimentStatus')?.textContent === '已暂停');
        await page.locator('#bp').click();
        await page.waitForFunction(() => document.querySelector('#w5ExperimentStatus')?.textContent === '正在运行');
        await page.locator('#bs').click();
        await page.waitForFunction(() =>
          document.querySelector('#si')?.textContent.includes('1 条') &&
          document.querySelector('#w5ExperimentArchive')?.textContent.includes('1 条')
        , undefined, { timeout: 10000 });
      }
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

    // Reduced-motion must freeze the simulation without removing its static drawing,
    // then restore animation when the operating-system/browser preference is cleared.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('#simulationStatus')?.textContent.includes('静态预览'));
    await page.waitForFunction(() => document.querySelector('#w5ExperimentStatus')?.textContent === '静态预览');
    const reducedExperiment = page.locator('#lst .it').filter({ hasText: '单摆与简谐振动' }).first();
    await reducedExperiment.click();
    await page.waitForFunction(() => document.querySelector('#et')?.textContent === '单摆与简谐振动');
    const frozenFrames = [];
    for (let sample = 0; sample < 3; sample++) {
      await page.waitForTimeout(280);
      frozenFrames.push(await frameSignature());
    }
    if (new Set(frozenFrames).size !== 1) {
      throw new Error('Reduced-motion preference did not freeze the experiment canvas: ' + frozenFrames.join(','));
    }
    if (!(await page.locator('#bp').isDisabled())) {
      throw new Error('Animation control must be disabled while reduced-motion is active');
    }

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('#simulationStatus')?.textContent === '运行中');
    await page.waitForFunction(() => document.querySelector('#w5ExperimentStatus')?.textContent === '正在运行');
    const resumedFrames = [];
    for (let sample = 0; sample < 3; sample++) {
      await page.waitForTimeout(280);
      resumedFrames.push(await frameSignature());
    }
    if (new Set(resumedFrames).size < 2) {
      throw new Error('Animation did not resume after reduced-motion preference was cleared: ' + resumedFrames.join(','));
    }
    if (await page.locator('#bp').isDisabled()) {
      throw new Error('Animation controls remained disabled after reduced-motion preference was cleared');
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
