/* The other reading of "CTA margins": the call-to-action BUTTONS, not the
   closing section. Reports every .btn on every page — its box, the gap to its
   neighbour, and whether it overflows or gets cramped at mobile width. */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work", "/contact"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  console.log(`\n======== ${vp.name} (${vp.width}px) ========`);
  const page = await browser.newPage({ viewport: vp });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    await page.evaluate(() =>
      document
        .querySelectorAll("[data-mv-watch]:not(.is-inview)")
        .forEach((el) => el.classList.add("is-inview")),
    );
    const rows = await page.evaluate(() => {
      const px = (v) => Math.round(parseFloat(v) || 0);
      const out = [];
      for (const g of document.querySelectorAll(
        ".hero-actions, .ctc-actions, .btn-row, .contact-actions",
      )) {
        const cs = getComputedStyle(g);
        const btns = Array.from(g.querySelectorAll(".btn"));
        if (!btns.length) continue;
        const boxes = btns.map((b) => b.getBoundingClientRect());
        /* Wrapped rows are the interesting case: if the buttons stack, the
           vertical gap between them is what the eye reads as the margin. */
        const wrapped = boxes.length > 1 && boxes[1].top >= boxes[0].bottom - 2;
        out.push({
          group: g.className.split(" ")[0],
          n: btns.length,
          marginTop: px(cs.marginTop),
          gap: cs.gap,
          wrapped,
          gapPx: wrapped
            ? Math.round(boxes[1].top - boxes[0].bottom)
            : boxes.length > 1
              ? Math.round(boxes[1].left - boxes[0].right)
              : null,
          widths: boxes.map((b) => Math.round(b.width)).join(","),
          h: Math.round(boxes[0].height),
          left: Math.round(boxes[0].left),
        });
      }
      return out;
    });
    for (const r of rows) {
      console.log(
        `${p.padEnd(10)} ${r.group.padEnd(14)} n=${r.n} left=${r.left} h=${r.h}` +
          ` mt=${r.marginTop} gap=${r.gap}${r.wrapped ? " WRAPPED" : ""}` +
          ` measuredGap=${r.gapPx} w=[${r.widths}]`,
      );
    }
  }
  await page.close();
}
await browser.close();
