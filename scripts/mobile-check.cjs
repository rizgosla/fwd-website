/* Tap the first work card and the first process card, then shoot both. */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

  await page.locator('.wk-band').scrollIntoViewIfNeeded();
  await page.locator('[data-wk-toggle]').first().click();
  await page.waitForTimeout(700);
  await page.locator('.wk-band').screenshot({ path: process.argv[2] });

  await page.locator('.process-grid').scrollIntoViewIfNeeded();
  await page.locator('.pc-head').first().click();
  await page.waitForTimeout(700);
  await page.locator('.process-grid').screenshot({ path: process.argv[3] });

  // Anything wider than the viewport is a mobile layout bug.
  const overflow = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
        bad.push(el.className && typeof el.className === 'string' ? el.className : el.tagName);
      }
    });
    return [...new Set(bad)].slice(0, 20);
  });
  console.log('OVERFLOW:', JSON.stringify(overflow));
  console.log('ERRORS:', JSON.stringify(errs));
  await browser.close();
})();
