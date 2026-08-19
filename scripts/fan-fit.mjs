/* Does the work hero's fan stay inside the page gutters?

   The outer panes are rotated and offset by --spread, so their painted extent
   is wider than any single pane's width — which is why sizing this by eye
   from the middle pane gets it wrong. This measures the real union of all
   three panes' bounding boxes against the container and the page. */
import { chromium } from "playwright";

const WIDTHS = [360, 390, 480, 700, 900, 1100, 1440, 1920];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let bad = 0;
console.log("width | padX | fan L..R          | panes L..R         | overflow");
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:4321/work", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    document
      .querySelectorAll("[data-mv-watch]:not(.is-inview)")
      .forEach((el) => el.classList.add("is-inview"));
    /* The fan settles over ~1.1s with a per-pane delay; measure the resting
       state, not a frame mid-transition. */
    await new Promise((r) => setTimeout(r, 1800));
  });

  const r = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;width:var(--pad-x)";
    document.body.appendChild(probe);
    const padX = Math.round(probe.getBoundingClientRect().width);
    probe.remove();

    const fan = document.querySelector(".wh-fan").getBoundingClientRect();
    const panes = [...document.querySelectorAll(".wh-pane")].map((p) =>
      p.getBoundingClientRect(),
    );
    const left = Math.min(...panes.map((p) => p.left));
    const right = Math.max(...panes.map((p) => p.right));
    return {
      padX,
      fanL: Math.round(fan.left),
      fanR: Math.round(fan.right),
      paneL: Math.round(left),
      paneR: Math.round(right),
      vw: window.innerWidth,
    };
  });

  /* The panes must stay within the page's own gutter on both sides. */
  const overL = r.padX - r.paneL;
  const overR = r.paneR - (r.vw - r.padX);
  const bust = overL > 1 || overR > 1;
  if (bust) bad++;
  console.log(
    `${String(w).padStart(5)} | ${String(r.padX).padStart(4)} |` +
      ` ${String(r.fanL).padStart(5)}..${String(r.fanR).padStart(5)} |` +
      ` ${String(r.paneL).padStart(5)}..${String(r.paneR).padStart(5)} |` +
      ` ${bust ? `L+${overL} R+${overR}  ** BUSTS GUTTER **` : "ok"}`,
  );
}
await browser.close();
console.log(bad === 0 ? "\nFan stays inside the gutters at every width." : `\n${bad} widths overflow.`);
process.exit(bad === 0 ? 0 : 1);
