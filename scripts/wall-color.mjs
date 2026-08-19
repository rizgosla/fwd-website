/* Confirms the hero panel's field is stroked in --color-navy, by reading the
   value the browser actually resolved rather than trusting the source. */
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4321/", { waitUntil: "networkidle" });

const r = await p.evaluate(() => {
  const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const hexToRgb = (h) => {
    const m = h.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)).join(" ");
  };
  const out = {};
  for (const [key, sel] of [
    ["hero panel", ".sc-panel .bw"],
    ["work stage", ".wk-stage .bw"],
    ["footer", ".ft .bw"],
  ]) {
    const el = document.querySelector(sel);
    if (!el) { out[key] = null; continue; }
    const mark = el.querySelector(".bw-mark");
    out[key] = {
      strokeVar: getComputedStyle(el).getPropertyValue("--bw-stroke").trim(),
      resolved: getComputedStyle(mark).stroke,
    };
  }
  return {
    navy: tok("--color-navy"),
    navyRgb: hexToRgb(tok("--color-navy")),
    blue: tok("--color-blue"),
    blueRgb: hexToRgb(tok("--color-blue")),
    ...out,
  };
});

console.log(`--color-navy ${r.navy}  = rgb ${r.navyRgb}`);
console.log(`--color-blue ${r.blue}  = rgb ${r.blueRgb}\n`);
for (const k of ["hero panel", "work stage", "footer"]) {
  if (!r[k]) { console.log(`${k.padEnd(11)} (not present)`); continue; }
  const v = r[k].strokeVar;
  const name = v === r.navyRgb ? "navy" : v === r.blueRgb ? "BLUE (wrong)" : v === "255 255 255" ? "white" : v;
  console.log(`${k.padEnd(11)} --bw-stroke: ${v.padEnd(13)} -> ${name}`);
  console.log(`${"".padEnd(11)} painted: ${r[k].resolved}`);
}
await b.close();
