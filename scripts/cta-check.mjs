/* Measures the closing CTA against its neighbours on every page: does its
   left edge line up with the section heading above it, and is its vertical
   rhythm in the same family as the surrounding bands? */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.name} (${vp.width}px) ===`);
  const page = await browser.newPage({ viewport: vp });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const px = (v) => Math.round(parseFloat(v));
      const ctc = document.querySelector(".ctc");
      const title = document.querySelector(".ctc-title");
      /* The nearest real heading above the CTA is the reference for the left
         edge: if these two disagree the CTA looks inset or outdented. */
      const heads = Array.from(
        document.querySelectorAll(".section-title, .work-hero-title, h2.display"),
      ).filter((h) => !h.closest(".ctc") && !h.closest("footer"));
      const ref = heads[heads.length - 1];
      const cs = getComputedStyle(ctc);
      const prev = ctc.previousElementSibling;
      return {
        ctcLeft: Math.round(title.getBoundingClientRect().left),
        refLeft: ref ? Math.round(ref.getBoundingClientRect().left) : null,
        padTop: px(cs.paddingTop),
        padBottom: px(cs.paddingBottom),
        prevPad: prev ? px(getComputedStyle(prev).paddingBottom) : null,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    const delta = r.refLeft === null ? "n/a" : r.ctcLeft - r.refLeft;
    console.log(
      `${p.padEnd(10)} left ctc=${r.ctcLeft} ref=${r.refLeft} delta=${delta}` +
        ` | pad ${r.padTop}/${r.padBottom} (prev band ${r.prevPad})` +
        (r.overflowX ? "  ** H-OVERFLOW **" : ""),
    );
  }
  await page.close();
}
await browser.close();
