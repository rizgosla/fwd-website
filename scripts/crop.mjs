/* Crops a region out of a screenshot so a detail can be inspected at real
   scale instead of squeezed into a 6000px-tall full-page shot.
     node scripts/crop.mjs <in.png> <out.png> <x> <y> <w> <h> */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [inp, outp, x, y, w, h] = process.argv.slice(2);
const b64 = fs.readFileSync(inp).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
});
await page.setContent(
  `<body style="margin:0;overflow:hidden">
     <img src="data:image/png;base64,${b64}"
          style="position:absolute;left:${-x}px;top:${-y}px;max-width:none">
   </body>`,
);
await page.waitForTimeout(300);
fs.mkdirSync(path.dirname(outp), { recursive: true });
await page.screenshot({ path: outp });
await browser.close();
console.log(outp);
