/* Reports how the CTA headline actually breaks on each page, by measuring the
   distinct line-box tops of the lead's text. An orphan is a final lead line
   with a single short word on it. */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work"];
const browser = await chromium.launch();
for (const w of [1440, 390]) {
  console.log(`\n=== ${w}px ===`);
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const title = document.querySelector(".ctc-title");
      const swap = title.querySelector(".ctc-swap");
      /* Walk the lead's text nodes a word at a time with a Range, grouping by
         the top of each word's client rect: that gives the real visual lines,
         which is not something you can read off the DOM. */
      const lines = new Map();
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (swap && swap.contains(n)) continue;
        const text = n.textContent;
        const re = /\S+/g;
        let m;
        while ((m = re.exec(text))) {
          const range = document.createRange();
          range.setStart(n, m.index);
          range.setEnd(n, m.index + m[0].length);
          const top = Math.round(range.getBoundingClientRect().top);
          if (!lines.has(top)) lines.set(top, []);
          lines.get(top).push(m[0]);
        }
      }
      const leadLines = [...lines.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, ws]) => ws.join(" "));
      return {
        leadLines,
        swapWidth: swap ? Math.round(swap.getBoundingClientRect().width) : null,
        titleWidth: Math.round(title.getBoundingClientRect().width),
      };
    });
    const last = r.leadLines[r.leadLines.length - 1] || "";
    const orphan = r.leadLines.length > 1 && last.split(" ").length === 1;
    console.log(
      `${p.padEnd(10)} lead=[${r.leadLines.join(" | ")}]` +
        ` swapW=${r.swapWidth}/${r.titleWidth}${orphan ? `  ** ORPHAN "${last}" **` : ""}`,
    );
  }
  await page.close();
}
await browser.close();
