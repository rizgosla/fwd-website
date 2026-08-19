/* How much air is there between the last line of real content and the top of
   the footer, on every page?

   The earlier check measured section-box to footer and got a uniform 0px,
   which is true and useless: the closing sections butt up against the footer
   by design and carry their own bottom padding. What a reader perceives as
   the bottom margin is the gap from the last TEXT to the footer edge.

   On the four CtaClose pages that padding is ~95px. The legal pages end with
   a plain .section, so this reports whether they get a comparable close or
   run into the dark band. */
import { chromium } from "playwright";

const PAGES = ["/", "/services", "/studio", "/work", "/contact", "/privacy", "/terms"];
const browser = await chromium.launch();

for (const w of [1440, 390]) {
  console.log(`\n=== ${w}px ===`);
  console.log("page       last text -> footer   last section padding-bottom");
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const gaps = [];
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
      const footer = document.querySelector("footer.ft");
      const fTop = footer.getBoundingClientRect().top + window.scrollY;

      /* Deepest element before the footer that actually renders text. */
      let lowest = null;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (!el || el.closest("footer") || el.closest("script") || el.closest("style")) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        const rect = range.getBoundingClientRect();
        if (!rect.height) continue;
        const bottom = rect.bottom + window.scrollY;
        if (bottom <= fTop && (lowest === null || bottom > lowest)) lowest = bottom;
      }

      const last = [...document.querySelectorAll("section")]
        .filter((s) => !s.closest("footer"))
        .pop();
      return {
        gap: lowest === null ? null : Math.round(fTop - lowest),
        padBottom: last ? Math.round(parseFloat(getComputedStyle(last).paddingBottom)) : null,
        lastClass: last ? last.className.split(" ").slice(0, 2).join(" ") : "",
      };
    });

    gaps.push({ p, ...r });
    console.log(
      `${p.padEnd(10)} ${String(r.gap).padStart(10)}px        ${String(r.padBottom).padStart(4)}px  (${r.lastClass})`,
    );
  }

  const cta = gaps.filter((g) => ["/", "/services", "/studio", "/work"].includes(g.p));
  const other = gaps.filter((g) => !["/", "/services", "/studio", "/work"].includes(g.p));
  const avg = (a) => Math.round(a.reduce((s, x) => s + x.gap, 0) / a.length);
  console.log(
    `  CtaClose pages average ${avg(cta)}px; other pages: ` +
      other.map((o) => `${o.p} ${o.gap}px`).join(", "),
  );
  await page.close();
}
await browser.close();
