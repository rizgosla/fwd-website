/* Screenshot harness. Usage:
     node scripts/shots.mjs <outDir> <path> [<path> ...]
   Shoots each path at desktop and mobile, full page, into .shots/<outDir>. */
import { chromium } from "playwright";
import fs from "node:fs";

const [outDir, ...paths] = process.argv.slice(2);
const dir = `.shots/${outDir}`;
fs.mkdirSync(dir, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  for (const p of paths) {
    const res = await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });

    /* Every band is held at opacity:0 by [data-mv-watch] until an
       IntersectionObserver adds .is-inview. A full-page screenshot renders the
       whole document at once but only ever *scrolls* through part of it, so
       bands below the fold photograph blank. Scroll the document to arm the
       observer, then add .is-inview to anything it still missed — the point of
       the shot is the layout, not the reveal choreography. */
    await page.evaluate(async () => {
      const h = () => document.documentElement.scrollHeight;
      for (let y = 0; y < h(); y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
      document
        .querySelectorAll("[data-mv-watch]:not(.is-inview)")
        .forEach((el) => el.classList.add("is-inview"));
      await new Promise((r) => setTimeout(r, 900));
    });

    const slug = p === "/" ? "home" : p.replace(/\//g, "-").replace(/^-/, "");
    await page.screenshot({ path: `${dir}/${slug}-${vp.name}.png`, fullPage: true });
    console.log(`${p} ${vp.name} ${res.status()}`);
  }
  if (errors.length) console.log(`  JS ERRORS (${vp.name}):`, errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
console.log(`-> ${dir}`);
