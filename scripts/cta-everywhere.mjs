/* "CTA margins EVERYWHERE" — every page, not just the four that render
   CtaClose. This walks all seven routes and reports, for whatever closing
   call-to-action each one actually has:

     - the left edge of its heading/button against the page's own content
       gutter (--pad-x), which is the line everything else on the page aligns
       to. A CTA that does not sit on it looks inset or outdented.
     - the vertical gap between the end of the last content section and the
       start of the footer, which is the "margin" a reader actually perceives
       at the bottom of a page.

   /privacy and /terms have no CTA section at all; they are included because
   the bottom-of-page gap is still a margin, and an outlier there is the same
   defect in a different place. */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work", "/contact", "/privacy", "/terms"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
const rows = [];
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: vp });
  for (const p of PAGES) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
      document
        .querySelectorAll("[data-mv-watch]:not(.is-inview)")
        .forEach((el) => el.classList.add("is-inview"));
      await new Promise((r) => setTimeout(r, 300));
    });

    const r = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;width:var(--pad-x)";
      document.body.appendChild(probe);
      const padX = Math.round(probe.getBoundingClientRect().width);
      probe.remove();

      /* Whatever this page uses as its closing call to action. */
      const cta =
        document.querySelector(".ctc-title") ||
        document.querySelector(".ask-submit") ||
        null;
      const ctaKind = document.querySelector(".ctc-title")
        ? "CtaClose"
        : document.querySelector(".ask-submit")
          ? "form submit"
          : "none";

      const footer = document.querySelector("footer.ft");
      const fTop = footer.getBoundingClientRect().top + window.scrollY;
      /* The last thing before the footer that actually paints content. */
      const main = [...document.querySelectorAll("section")]
        .filter((s) => !s.closest("footer"))
        .pop();
      const mainBottom = main
        ? main.getBoundingClientRect().bottom + window.scrollY
        : null;

      return {
        padX,
        ctaKind,
        ctaLeft: cta ? Math.round(cta.getBoundingClientRect().left) : null,
        gapToFooter: mainBottom === null ? null : Math.round(fTop - mainBottom),
      };
    });

    rows.push({ vp: vp.name, p, ...r });
  }
  await page.close();
}
await browser.close();

for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.name} (${vp.width}px) ===`);
  console.log("page       padX  CTA           left  vs gutter   gap->footer");
  for (const r of rows.filter((x) => x.vp === vp.name)) {
    const delta = r.ctaLeft === null ? null : r.ctaLeft - r.padX;
    console.log(
      `${r.p.padEnd(10)} ${String(r.padX).padStart(4)}  ${r.ctaKind.padEnd(12)} ` +
        `${r.ctaLeft === null ? "   -" : String(r.ctaLeft).padStart(4)}  ` +
        `${delta === null ? "     -" : (delta === 0 ? "  ok  " : ` ${delta > 0 ? "+" : ""}${delta}px`)}` +
        `      ${String(r.gapToFooter).padStart(4)}px`,
    );
  }
}

/* Flag any page whose bottom gap is an outlier against the others at the same
   width — that is the "margin everywhere" question stated numerically. */
console.log("");
for (const vp of VIEWPORTS) {
  const gaps = rows.filter((x) => x.vp === vp.name).map((x) => x.gapToFooter);
  const uniq = [...new Set(gaps)];
  console.log(
    `${vp.name}: bottom gaps ${uniq.join(", ")}px` +
      (uniq.length === 1 ? "  (uniform)" : "  <- differs by page"),
  );
}
