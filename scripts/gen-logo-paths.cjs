const fs = require('fs');
const src = fs.readFileSync('public/assets/fwd-logo.svg', 'utf8');

// The artwork carries the mark twice: cls-1 is a periwinkle shadow layer
// offset ~1.45px below cls-2, the top layer. For an outline we want ONE
// contour, so only the top layer is taken — stroking both would double every
// letterform with a second edge a hair below it.
const top = [...src.matchAll(/<path class="cls-2" d="([^"]+)"/g)].map((m) => m[1]);
if (top.length !== 2) throw new Error(`expected 2 cls-2 paths, found ${top.length}`);

// Measured from the paths themselves (getBBox in a headless browser): the
// mark occupies x 3.25..156.75, y 33.61..124.95 inside the 160x160 artboard,
// so a fifth of the square is empty above and below. A viewBox cropped to the
// ink is what lets the wall lay marks out on their own metrics instead of
// spacing them by the invisible padding baked into the source file.
const PAD = 2;
const box = { x: 3.25, y: 33.61, w: 153.5, h: 91.34 };
const viewBox = [box.x - PAD, box.y - PAD, box.w + PAD * 2, box.h + PAD * 2]
  .map((n) => +n.toFixed(2))
  .join(' ');

const out = `/* ============================================================================
   LOGO PATHS — generated from public/assets/fwd-logo.svg
   ----------------------------------------------------------------------------
   Do not hand-edit. Regenerate with: node scripts/gen-logo-paths.cjs

   The source artwork draws the mark twice: a periwinkle shadow layer (cls-1)
   and the top layer (cls-2) offset ~1.45px above it. Only the TOP layer is
   exported here, because the consumers of this file stroke the paths — and
   stroking both layers would trace every letterform twice, a hair apart.

   VIEWBOX is cropped to the mark's real ink (measured via getBBox) plus a
   small pad for the stroke, rather than the source file's 160x160 artboard,
   which carries ~21% empty space above and below the mark.
   ========================================================================== */

/** viewBox cropped to the mark itself, with room for a stroke. */
export const LOGO_VIEWBOX = "${viewBox}";

/** Top-layer paths of the fwd. mark: [0] the dot, [1] the wordmark. */
export const LOGO_PATHS: string[] = [
${top.map((d) => `  "${d}",`).join('\n')}
];
`;

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/logoPaths.ts', out);
console.log(`wrote src/data/logoPaths.ts — ${top.length} paths, viewBox "${viewBox}"`);
