/* Ad-hoc screenshot helper: node scripts/shot.cjs <url> <out> [width] [height] [selector] */
const { chromium } = require('playwright');

(async () => {
  const [url, out, w = '390', h = '844', selector] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: +w, height: +h },
    deviceScaleFactor: 2,
    isMobile: +w < 700,
    hasTouch: +w < 700,
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  if (selector) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.locator(selector).screenshot({ path: out });
  } else {
    await page.screenshot({ path: out, fullPage: true });
  }
  await browser.close();
})();
