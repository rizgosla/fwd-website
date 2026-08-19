# Hero, work band, CTA rhythm and site-wide section spacing

Eight commits. The bulk is spacing and the brand field; the last three commits
correct earlier ones in the same branch.

## What changed

**Hero**
- Headline title-cased, including the four cycling words: "Your Website is
  The New Storefront." and friends.
- The drifting logo field now lives *inside* the showcase panel and replaces
  the blueprint grid that used to paint there. It is the inverse of the
  footer's field in the literal sense: same logo paths, same drift, stroked
  navy-on-light instead of white-on-ink. The grid it replaces was the third
  copy of the same 46px rule on the page.

**Selected work band**
- Gets the footer's backing, contained to the work stage rather than washing
  across the section.
- `BrandWall` gained `tone` / `mask` / `opacity` props to make that possible;
  it had been written for exactly one home.

**Closing CTA**
- Section padding was `clamp(5rem, 13vh, 9rem)` against neighbouring bands'
  `clamp(4rem, 9vh, 7rem)` — 117px vs 81px at 900px tall, which read as a gap
  rather than emphasis. Now 95px.
- Dropped a stray `margin-top` on the actions row; tightened mobile; the
  button goes full-width under 480px.
- The ASCII mark's box was `aspect-ratio: 4/3`, but the artwork is the
  wordmark band at ~1.65:1, so it could only fill 78% of the box height and
  the remainder sat as dead rows (50px above, 42px below — unequal, hence the
  "floating high" look). Box now matches the art; fill is 91–94%.
- Fixed an orphaned word: `/work` broke as "Want your site to be" / "the" /
  "next one here?".

**Section rhythm, site-wide**
- The seven pages used **twelve distinct padding-block pairs**. Root cause:
  `.section` was declared twice in `global.css` with different values, 680
  lines apart. The later one (54px) won, so nine sections overrode back up to
  81px and whatever did not override sat cramped. Every per-band clamp after
  that was a patch over whichever default had lost.
- Deleted the duplicate, added a three-step scale (`--band-lg/md/sm`), moved
  each outlier to its nearest step. Studio hero 135→104, services hero
  72/63→81/63, FAQ and legal body 54→81, meta strips 36→45.
- Legal and contact pages closed on 54px of padding against the CTA pages'
  95px, so they ran into the dark footer. All seven now close within 10px.

**Process cards**
- The four mockups were cropped: `--pc-scale` is measured in JS (a ratio of two
  lengths, which `calc()` will not compute) and it fitted the stage to the
  column's **width only**. In the four-up regime the column has a definite and
  shorter height, so the 470x500 composition overflowed it and `.pc-visual`'s
  `overflow: hidden` took the difference off the top and bottom — the draft
  browser lost its chrome, the revisions sheet lost its last rows.
- The fit is now `min(w/470, h/500)` whenever the box has a definite height,
  falling back to width-only in the stacked layout, where the stage is
  absolutely positioned so `clientHeight` is 0 and `aspect-ratio` already sizes
  the column.

**Work page**
- The hero *graphic* (the fan of browser frames) is ~1.33x larger. An earlier
  commit in this branch grew the whole section instead, which was the wrong
  reading; `dc95afe` reverts that.
- While measuring, found the fan busting the page gutter at four widths — 29px
  each side at 360px, and 31/38px on the right at 900/1100px. The latter is
  the subtle one: the grid goes two-column at 900px so the container halves,
  but the panes were still sized in `vw` off the whole viewport. Now sized
  against the container.

## Verification

Playwright harnesses in `scripts/`, added alongside the changes they check:

| script | checks |
|---|---|
| `section-rhythm.mjs` | every section's computed padding, grouped so outliers show |
| `cta-check.mjs` | CTA left-edge alignment and vertical rhythm, 4 pages × 2 widths |
| `bottom-air.mjs` | last line of text → footer, all 7 pages |
| `wall-legibility.mjs` | pixel-diffs each headline with the wall shown vs hidden |
| `wall-color.mjs` | each wall's stroke against the real tokens |
| `orphan-check.mjs` | real line-box breaks in the CTA headline |
| `swap-stability.mjs` | heading geometry identical across all four cycling words |
| `fan-fit.mjs` | union of all three fan panes vs the page gutter, 8 widths |
| `ascii-box.mjs` | the mark's box vs the type block, gutter, and its own fill |
| `process-fit.mjs` | each stage's painted box vs its clipping column, 4 cards x 5 widths |

CTA alignment measures delta=0 on four pages at two widths. The work band's
wall reads 0/255 behind its heading (matching the footer, which clears its own
text by design); the hero's reads 3–8/255, faint texture. Production build
passes.

## Known issues, not addressed here

One problem is **still open** and was deliberately left rather than
half-fixed:

1. **The FAQ card on `/services` overflows its band by 36px** at 1440px
   (49px at 390px), because `.section-faq` sets `overflow: hidden`. This
   predates the branch — measured against the merge base — but is worth
   fixing next.

The process-card clipping listed here previously is fixed above;
`process-fit.mjs` passes all 20 card/width pairs with zero clipped edges.

An attempt at closing the CTA-to-footer gap and the doubled seam above the CTA
was reverted before this PR: zeroing the pre-CTA section's bottom padding
sheared 117px off that same FAQ card, because for a clipping section the
padding box *is* the clip box. That work is stashed locally, not lost.
