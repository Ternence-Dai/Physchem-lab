'use strict';

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(() => {
      const total = document.querySelector('#catalogueTotal');
      return total && total.textContent.trim() === '108' &&
        document.querySelectorAll('#lst .it').length === 108 &&
        document.querySelector('#simulationStatus')?.textContent.trim() === '运行中';
    }, { timeout: 20000 });

    const total = await page.locator('#lst .it').count();
    if (total !== 108) throw new Error(`Expected 108 visible experiment entries, received ${total}`);

    const drawResults = [];
    for (let index = 0; index < total; index++) {
      const item = page.locator('#lst .it').nth(index);
      const label = (await item.getAttribute('aria-label')) || `experiment #${index + 1}`;
      await item.click();
      await page.waitForTimeout(100);
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
    console.log(`Browser canvas smoke test passed: ${drawResults.length}/108 experiments drew visible colored output; mobile drawer and canvas passed.`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
