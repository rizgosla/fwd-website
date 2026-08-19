/* The ASCII mark's real alignment problem is not its own padding — it is how
   its box sits against the things around it. This compares, at each width:

     - the mark's box against the type block beside it (do their top and
       bottom edges relate to anything, or does the mark float?)
     - the mark's right edge against the page gutter every other section
       aligns to
     - the empty run between the end of the headline and the start of the art
     - how much of the box the art actually fills, since the box is sized by
       aspect-ratio and the raster inside it is a different shape */
import { chromium } from "playwright";

const WIDTHS = [1100, 1280, 1440, 1680, 1920, 2560];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log(
  "width | ascii box    | box top/bot vs type block | right edge vs gutter | fill of box",
);
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
    document
      .querySelectorAll("[data-mv-watch]:not(.is-inview)")
      .forEach((el) => el.classList.add("is-inview"));
    await new Promise((r) => setTimeout(r, 900));
  });

  const r = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;width:var(--pad-x)";
    document.body.appendChild(probe);
    const padX = Math.round(probe.getBoundingClientRect().width);
    probe.remove();

    const ascii = document.querySelector(".ctc-ascii");
    const main = document.querySelector(".ctc-main");
    const ar = ascii.getBoundingClientRect();
    const mr = main.getBoundingClientRect();

    /* Fraction of the <pre>'s rows/cols the art actually occupies. */
    const lines = ascii.textContent.split("\n").filter((l) => l.length);
    const cols = Math.max(...lines.map((l) => l.length), 1);
    const rows = lines.length || 1;
    let minC = Infinity, maxC = -1, firstR = -1, lastR = -1;
    lines.forEach((line, i) => {
      const a = line.search(/\S/);
      if (a === -1) return;
      const b = line.replace(/\s+$/, "").length - 1;
      if (a < minC) minC = a;
      if (b > maxC) maxC = b;
      if (firstR === -1) firstR = i;
      lastR = i;
    });

    return {
      padX,
      boxW: Math.round(ar.width),
      boxH: Math.round(ar.height),
      topDelta: Math.round(ar.top - mr.top),
      botDelta: Math.round(ar.bottom - mr.bottom),
      rightGutter: Math.round(window.innerWidth - ar.right),
      fillW: +(((maxC + 1 - minC) / cols) * 100).toFixed(0),
      fillH: +(((lastR + 1 - firstR) / rows) * 100).toFixed(0),
    };
  });

  console.log(
    `${String(w).padStart(5)} | ${String(r.boxW).padStart(4)}x${String(r.boxH).padStart(4)} |` +
      ` top ${String(r.topDelta).padStart(5)}  bottom ${String(r.botDelta).padStart(5)} |` +
      ` ${String(r.rightGutter).padStart(4)} vs ${String(r.padX).padStart(3)} ` +
      `${r.rightGutter === r.padX ? "ok " : "OFF"} |` +
      ` ${String(r.fillW).padStart(3)}%w ${String(r.fillH).padStart(3)}%h`,
  );
}
await browser.close();
