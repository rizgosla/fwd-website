/* Every section on every page, and the vertical rhythm between them.

   The ask was "check margins of all sections and make it somewhat
   consistent", so this is a census rather than a pass/fail: for each section
   it reports the padding it actually computes to, and then groups the
   distinct values so outliers are obvious at a glance.

   Padding is what matters here, not margin: these bands are full-bleed and
   set their own space with padding-block, so a section's "margin" as a reader
   perceives it is its own padding plus its neighbour's. */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work", "/contact", "/privacy", "/terms"];
const WIDTHS = [1440, 390];

const browser = await chromium.launch();
for (const w of WIDTHS) {
  console.log(`\n================ ${w}px ================`);
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const tally = new Map();

  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
      document
        .querySelectorAll("[data-mv-watch]:not(.is-inview)")
        .forEach((el) => el.classList.add("is-inview"));
      await new Promise((r) => setTimeout(r, 250));
    });

    const rows = await page.evaluate(() => {
      const px = (v) => Math.round(parseFloat(v) || 0);
      return [...document.querySelectorAll("main > section, main > .ctc")].map((s) => {
        const cs = getComputedStyle(s);
        return {
          cls: (s.className || "(none)").split(" ").slice(0, 2).join(" "),
          top: px(cs.paddingTop),
          bottom: px(cs.paddingBottom),
          mt: px(cs.marginTop),
          mb: px(cs.marginBottom),
        };
      });
    });

    console.log(`\n${p}`);
    for (const r of rows) {
      const key = `${r.top}/${r.bottom}`;
      tally.set(key, (tally.get(key) || 0) + 1);
      const marg = r.mt || r.mb ? `  margin ${r.mt}/${r.mb}` : "";
      console.log(`   ${String(r.top).padStart(4)} / ${String(r.bottom).padStart(4)}   ${r.cls}${marg}`);
    }
  }

  console.log(`\n  distinct top/bottom pairs at ${w}px, most common first:`);
  [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, n]) => console.log(`    ${k.padEnd(12)} x${n}`));
  await page.close();
}
await browser.close();
