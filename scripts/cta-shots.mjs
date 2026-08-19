/* Crops the closing CTA band out of each page so the section that was
   actually changed can be looked at, rather than inferred from numbers. */
import { chromium } from "playwright";
import fs from "node:fs";

const PAGES = ["/", "/services", "/studio", "/work"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const dir = ".shots/cta";
fs.mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: vp });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
      document
        .querySelectorAll("[data-mv-watch]:not(.is-inview)")
        .forEach((el) => el.classList.add("is-inview"));
      await new Promise((r) => setTimeout(r, 700));
    });

    /* `clip` is in PAGE coordinates but getBoundingClientRect is relative to
       the viewport, so the rect has to be taken with the page scrolled to the
       top (or have scrollY added back). Getting this wrong photographs
       whatever happens to be on screen instead of the element. */
    const box = await page.evaluate(() => {
      const r = document.querySelector(".ctc").getBoundingClientRect();
      return { y: r.top + window.scrollY, height: r.height };
    });

    /* Shoot the CTA together with the band above and the footer below, so the
       vertical rhythm between the three is what the picture shows. */
    const pad = 240;
    const slug = p === "/" ? "home" : p.slice(1);
    await page.screenshot({
      path: `${dir}/${slug}-${vp.name}.png`,
      fullPage: true,
      clip: {
        x: 0,
        y: Math.max(0, box.y - pad),
        width: vp.width,
        height: box.height + pad * 2,
      },
    });
    console.log(`${p} ${vp.name} ctcTop=${Math.round(box.y)} h=${Math.round(box.height)}`);
  }
  await page.close();
}
await browser.close();
console.log(`-> ${dir}`);
