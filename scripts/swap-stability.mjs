/* The original code avoided text-wrap:balance because the cycling word would
   re-wrap the whole heading on every swap. That risk is only gone if the
   heading's geometry is genuinely identical for all four words — so force each
   word visible in turn and assert the lead's line breaks never move. */
import { chromium } from "playwright";

const PAGES = ["/", "/studio", "/work"];
const browser = await chromium.launch();
let bad = 0;
for (const w of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    const shapes = await page.evaluate(() => {
      const title = document.querySelector(".ctc-title");
      const items = [...title.querySelectorAll(".ctc-swap-item")];
      const read = () => {
        const r = title.getBoundingClientRect();
        const lede = document.querySelector(".ctc-lede").getBoundingClientRect();
        return `h=${Math.round(r.height)} ledeTop=${Math.round(lede.top)}`;
      };
      const out = [];
      for (const it of items) {
        /* Pin one word visible at a time, overriding the animation. */
        items.forEach((o) => {
          o.style.animation = "none";
          o.style.opacity = o === it ? "1" : "0";
        });
        out.push(read());
      }
      return out;
    });
    const stable = new Set(shapes).size === 1;
    if (!stable) bad++;
    console.log(
      `${w}px ${p.padEnd(9)} ${stable ? "STABLE" : "** REFLOWS **"} ${[...new Set(shapes)].join(" / ")}`,
    );
  }
  await page.close();
}
await browser.close();
console.log(bad === 0 ? "\nAll headings stable across every cycling word." : `\n${bad} reflowing.`);
process.exit(bad === 0 ? 0 : 1);
