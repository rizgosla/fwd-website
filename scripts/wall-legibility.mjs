/* How strongly does each BrandWall paint behind its own type?

   The absolute pixel delta is not judgeable on its own: a white stroke on ink
   moves a channel much further than a navy stroke on paper at the same alpha,
   so a single threshold would fail the ink surfaces for looking like ink.

   The FOOTER is the reference. The request was that the work band get the
   footer's backing, so the footer's own measured weight behind its own closing
   line is the number the new instances have to sit near — not an invented
   constant. This reports every wall against that baseline.

   Everything animating is frozen and each region is shot twice as a control
   first, so the noise floor is known before any signal is trusted. */
import { chromium } from "playwright";

const CASES = [
  ["footer (reference)", "/", ".ft-line"],
  ["hero", "/", ".hero-title"],
  ["work band", "/", ".wk-band .section-title"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const diff = (p1, p2) =>
  page.evaluate(async ([a, b]) => {
    const decode = async (b64) => {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const bmp = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      return ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    };
    const [d1, d2] = [await decode(a), await decode(b)];
    let changed = 0;
    let worst = 0;
    let sum = 0;
    const n = Math.min(d1.length, d2.length);
    for (let i = 0; i < n; i += 4) {
      let d = 0;
      for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(d1[i + c] - d2[i + c]));
      if (d > 0) changed++;
      sum += d;
      if (d > worst) worst = d;
    }
    return { share: changed / (n / 4), worst, mean: sum / (n / 4) };
  }, [p1, p2]);

const freeze = async () => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    document
      .querySelectorAll("[data-mv-watch]:not(.is-inview)")
      .forEach((el) => el.classList.add("is-inview"));
    await new Promise((r) => setTimeout(r, 600));
    document.querySelectorAll(".hero-swap-item, .ctc-swap-item").forEach((el) => {
      el.style.opacity = getComputedStyle(el).opacity;
      el.style.transform = getComputedStyle(el).transform;
    });
    const kill = document.createElement("style");
    kill.textContent = `*, *::before, *::after {
      animation: none !important; transition: none !important;
    }`;
    document.head.appendChild(kill);
    await new Promise((r) => setTimeout(r, 400));
  });
};

const results = {};
for (const w of [390, 1440, 2560]) {
  await page.setViewportSize({ width: w, height: 900 });
  console.log(`\n=== ${w}px ===`);
  console.log("surface             | control    | wall signal          ");
  for (const [name, path, sel] of CASES) {
    await page.goto(`http://localhost:4321${path}`, { waitUntil: "networkidle" });
    await freeze();
    const shoot = async () =>
      (await page.locator(sel).first().screenshot()).toString("base64");

    const c1 = await shoot();
    await page.waitForTimeout(200);
    const c2 = await shoot();
    const control = await diff(c1, c2);

    await page.evaluate(() =>
      document.querySelectorAll(".bw").forEach((b) => (b.style.display = "none")),
    );
    await page.waitForTimeout(200);
    const off = await shoot();
    const sig = await diff(c2, off);

    results[`${w}|${name}`] = sig;
    console.log(
      `${name.padEnd(19)} | ${String(control.worst).padStart(3)}/255 ${
        control.worst > 2 ? "DIRTY" : "clean"
      } | share ${(sig.share * 100).toFixed(1).padStart(5)}%  worst ${String(sig.worst).padStart(
        3,
      )}/255  mean ${sig.mean.toFixed(2).padStart(5)}`,
    );
  }

  /* The footer usually measures 0 behind its own text — its mask deliberately
     clears the text column — so a RATIO against it divides by zero and prints
     "Infinity x", which reads like a failure when it actually means the
     reference is perfectly clean. The footer is the RULE, not a number to
     divide by: it puts nothing behind its own type, so neither should
     anything else. Report the absolute reading against that rule, and keep
     the footer's own figure only as evidence the measurement still works. */
  const ref = results[`${w}|footer (reference)`];
  console.log(
    `  footer reads ${ref.worst}/255 behind its own text — the rule: keep the type clear`,
  );
  for (const k of ["hero", "work band"]) {
    const s = results[`${w}|${k}`];
    /* A stroke at these alphas moves a channel by single digits; double
       digits means a mark is legibly crossing the type. */
    const verdict =
      s.worst === 0
        ? "clear, like the footer"
        : s.worst <= 12
          ? "faint texture, acceptable"
          : "TOO STRONG";
    console.log(`  -> ${k.padEnd(10)} worst ${String(s.worst).padStart(3)}/255  ${verdict}`);
  }
}
await browser.close();
