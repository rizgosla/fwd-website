/* Are the process mockups whole, and are they rendered at a sane size?

   Two failures this catches, both visible in the shipped four-up row:
   - CROP: the stage is scaled to the column's WIDTH only, so in the four-up
     regime (where the column has a definite, shorter height) the top and
     bottom of the composition are clipped by .pc-visual's overflow: hidden.
   - LOW RES: a scale far below 1 renders 10-13px mono type at 7-9px, which
     is what reads as "low res" even though it is live DOM.

   Measured against the stage's own painted box, not the frame element. */
import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:4321/";
const WIDTHS = [390, 768, 1200, 1440, 1920];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

let bad = 0;
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    document.querySelectorAll("[data-mv-watch]:not(.is-inview)").forEach((el) => el.classList.add("is-inview"));
    await new Promise((r) => setTimeout(r, 400));
  });

  const rows = await page.evaluate(() => {
    return [...document.querySelectorAll(".pc-stage")].map((stage, i) => {
      const box = stage.parentElement;
      const s = parseFloat(getComputedStyle(stage).getPropertyValue("--pc-scale")) || 0;
      const b = box.getBoundingClientRect();
      const g = stage.getBoundingClientRect();
      return {
        i: i + 1,
        scale: +s.toFixed(3),
        // Positive = painted outside the clipping column on that edge.
        top: Math.round(b.top - g.top),
        bottom: Math.round(g.bottom - b.bottom),
        left: Math.round(b.left - g.left),
        right: Math.round(g.right - b.right),
      };
    });
  });

  console.log(`\n--- ${w}px ---`);
  for (const r of rows) {
    const clipped = Math.max(r.top, r.bottom, r.left, r.right) > 1;
    const tiny = r.scale < 0.42;
    if (clipped || tiny) bad++;
    console.log(
      `card ${r.i} | scale ${String(r.scale).padEnd(5)} | ` +
        `t${String(r.top).padStart(4)} b${String(r.bottom).padStart(4)} ` +
        `l${String(r.left).padStart(4)} r${String(r.right).padStart(4)} | ` +
        `${clipped ? "** CLIPPED **" : tiny ? "** TINY **" : "ok"}`,
    );
  }
}
await browser.close();
console.log(bad === 0 ? "\nEvery mockup renders whole and legible." : `\n${bad} card/width pairs fail.`);
process.exit(bad === 0 ? 0 : 1);
