# DESIGN.md

Design language derived from the **homepage** (`src/pages/index.astro`), the shared layout
(`src/layouts/BaseLayout.astro`), and `src/styles/global.css`.

Every value below is quoted from source. Nothing here is invented.

Status of this document: descriptive, not aspirational. It records what the homepage already
does so that other pages can adapt it. The homepage itself is locked.

---

## 1. Color tokens

All defined in `global.css:8-59` inside `@theme`.

### Brand palette

| Token | Value | Where it earns its keep |
|---|---|---|
| `--color-paper` | `#ffffff` | Page background, dark-section text, card faces |
| `--color-periwinkle` | `#8e94b8` | The accent. Eyebrow rules, live dots, accents **on dark** |
| `--color-blue` | `#144667` | Accent **on light**. Every `.display em`, numerals, arrows |
| `--color-navy` | `#0d2f45` | Primary dark surface (`.bento-headline`), headings |
| `--color-ink` | `#071722` | Deepest surface. Dark process steps, walkthrough, studio hero |

The two accents are not interchangeable. `--color-blue` is the accent on light surfaces;
`--color-periwinkle` is the accent on ink/navy surfaces. This swap is consistent across every
page and is the single most reliable tell of the house style.

Example, `index.astro:692-701`:
```css
.ps-title em { font-style: italic; color: var(--color-blue); }
.process-step-dark .ps-title em { color: var(--color-periwinkle); }
```

### Surfaces

| Token | Value |
|---|---|
| `--color-bg-soft` | `#f6f6f8` |
| `--color-surface` | `#efeff2` |

### Semantic text

| Token | Value |
|---|---|
| `--color-fg` | `#0d2f45` |
| `--color-fg-soft` | `#243845` |
| `--color-fg-muted` | `#5e6b78` |

### Hairlines

| Token | Value |
|---|---|
| `--color-line` | `rgb(7 23 34 / 0.10)` |
| `--color-line-strong` | `rgb(7 23 34 / 0.30)` |
| `--color-hairline` | `rgb(7 23 34 / 0.08)` |

On dark surfaces, hairlines are written literally rather than tokenized:
`rgba(255,255,255,0.14)` on `.bento-headline`, `rgba(255,255,255,0.08)` on `.process-step-dark`,
`rgb(255 255 255 / 0.12)` on `.walkthrough-track::before`.

### Shadow recipe

Two stacked shadows, both with large negative spread. Never a single soft blur.

```css
/* .ps-visual-frame, index.astro:717-719 */
box-shadow:
  0 40px 100px -45px rgba(7,23,34,0.28),
  0 16px 36px -16px rgba(7,23,34,0.16);

/* .browser, HeroShowcase.astro:139 */
box-shadow: 0 60px 120px -40px rgb(7 23 34 / 0.40), 0 16px 36px -14px rgb(7 23 34 / 0.20);
```

---

## 2. Type

### Families (`global.css:31-33`)

```css
--font-display: "Fraunces", "Times New Roman", Georgia, serif;
--font-sans:    "Inter Tight", system-ui, -apple-system, sans-serif;
--font-mono:    ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

Fraunces is loaded as a variable font with `opsz`, `wght`, and `SOFT` axes
(`BaseLayout.astro:47`). Oswald and Lora are also loaded, but **only** so the hero showcase can
render client sites in their own typefaces. They are not house fonts.

### Scale (`global.css:36-44`)

| Step | Value |
|---|---|
| `--text-step--2` | `clamp(0.72rem, 0.7rem + 0.1vw, 0.78rem)` |
| `--text-step--1` | `clamp(0.82rem, 0.78rem + 0.18vw, 0.9rem)` |
| `--text-step-0` | `clamp(0.95rem, 0.9rem + 0.22vw, 1.05rem)` |
| `--text-step-1` | `clamp(1.1rem, 1.02rem + 0.4vw, 1.28rem)` |
| `--text-step-2` | `clamp(1.4rem, 1.2rem + 1vw, 1.85rem)` |
| `--text-step-3` | `clamp(1.85rem, 1.5rem + 1.7vw, 2.65rem)` |
| `--text-step-4` | `clamp(2.4rem, 1.9rem + 2.6vw, 3.85rem)` |
| `--text-step-5` | `clamp(3.2rem, 2.4rem + 4vw, 5.6rem)` |
| `--text-step-6` | `clamp(4rem, 2.8rem + 6vw, 8rem)` |

Assignment, as used on the homepage:

- `step-6`: page `h1` only (`.hero-title`, `.svc-hero-title`, `.st-hero-title`)
- `step-4`: section `h2` (`.section-title`, `.ps-title`, `.walkthrough-h`, `.st-title`)
- `step-3`: card titles, `.lede` on some pages, `.ps-glyph`
- `step-2`: `.lede` default, tile titles (`.bf-title`), FAQ questions
- `step-1`: body prose, `.section-sub`, `.meta-val`
- `step-0`: default body
- `step--2`: every mono label, eyebrow, and micro-caption

### The three text roles

**`.display`** (`global.css:117-130`) is the only heading treatment.

```css
.display {
  font-family: var(--font-display);
  font-weight: 350;
  letter-spacing: -0.025em;
  line-height: 0.98;
  font-variation-settings: "opsz" 144, "SOFT" 30;
  text-wrap: balance;
}
.display em {
  font-style: italic;
  font-variation-settings: "opsz" 144, "SOFT" 100;
  color: var(--color-blue);
  font-weight: 350;
}
```

The italic `<em>` inside a display heading is the signature typographic move. It appears in
essentially every heading on the site: "your new *storefront*", "one *number*", "an *honest*
process", "*Real projects*", "two *options*". `SOFT` jumps 30 to 100 on the italic, which is
what makes the accent word read as softer rather than merely tilted.

**`.lede`** (`global.css:132-146`): Fraunces, weight 300, `step-2`, `opsz 80`, `SOFT 50`.

**`.eyebrow`** (`global.css:148-171`): Inter Tight 500, `step--2`, `letter-spacing: 0.22em`,
uppercase, with a 24px periwinkle rule injected via `::before`.

A second eyebrow form is written per-page in mono rather than sans, with the rule as a real
span. Both exist. The mono variant is more common:

```css
/* index.astro:659-660 */
.section-eyebrow { font-family: var(--font-mono); font-size: var(--text-step--2);
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-fg-muted); }
.section-eyebrow-bar { width: 24px; height: 1px; background: var(--color-blue); }
```

Mono letter-spacing ranges `0.06em` to `0.22em` depending on role. Labels sit at `0.10em` to
`0.14em`.

### opsz discipline

`font-variation-settings: "opsz"` is set explicitly at almost every size, and it is **not**
tied to the rendered size. Large display type uses `opsz 144`; mid-size card titles use
`opsz 60`; small inline labels use `opsz 40`. Any new Fraunces usage must set it.

Observed pairs: `step-4`+ uses `144`, `step-2`/`step-1` uses `60` (occasionally `72`),
`step-0` uses `40`.

---

## 3. Spacing and layout rhythm

### Page container

```css
--pad-x: clamp(1.5rem, 4.5vw, 4rem);   /* global.css:65 */
--container-prose: 880px;
--container-page: 1240px;
```

`.full` is the standard page-width wrapper and consumes `--pad-x`.

### Vertical rhythm

Section padding is always a `clamp()` with a `vh` middle term:

| Context | Value |
|---|---|
| Homepage offer section | `clamp(6rem, 11vh, 9rem)` |
| Services offer section | `clamp(4rem, 9vh, 7rem)` |
| Process step inner | `clamp(3rem, 7vh, 5.5rem)` |
| Walkthrough | `clamp(3rem, 7vh, 5rem)` |
| Studio hero | `clamp(5rem, 15vh, 10rem)` |
| Studio thread | `clamp(4rem, 10vh, 7rem)` |
| Meta strip | `clamp(2rem, 4vh, 3.5rem)` |

Section head to body gap: `clamp(2.5rem, 5vh, 4rem)`.

### Grid gaps

Bento: `1rem` mobile, `1.25rem` at 760px, `1.5rem` at 1000px.
Two-column splits: `clamp(2rem, 4vw, 3rem)` to `clamp(2.5rem, 6vw, 5rem)`.

### Radii

| Element | Radius |
|---|---|
| Pills, buttons, dots nav | `999px` |
| Large frames (`.ps-visual-frame`, `.svc-hero-card`, `.st-cap-card`) | `16px` |
| Cards (`.bento-card`, `.work-card-link`, `.browser`, `.walkthrough-panel`) | `14px` |
| Small chips (`.st-fold-card`) | `12px` |
| Inner bars (`.st-cap-run`) | `8px` |

### Breakpoints

`620px`, `700px`, `720px`, `760px`, `800px`, `900px`, `940px`, `950px`, `1000px`.
The load-bearing ones are **760px** (bento goes 2-up, section-head splits) and
**1000px** (bento goes 4-up, hero stacks).

---

## 4. Motion system

### Easings and durations (`global.css:47-54`)

```css
--ease-soft:      cubic-bezier(0.2, 0.7, 0.2, 1);
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);

--motion-dur-fast:     600ms;
--motion-dur-base:     900ms;
--motion-dur-slow:     1400ms;
--motion-stagger-step: 180ms;
```

Rule observed throughout: **entrances use `--ease-out-expo`, state changes and hovers use
`--ease-soft`.** Hover transitions are 280ms to 460ms. Nothing uses a default/linear ease
except infinite marquee-type loops, which are all `linear`.

### The trigger mechanism

One IntersectionObserver for the whole site, `BaseLayout.astro:123-137`:

```js
const mvIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-inview");
      mvIo.unobserve(entry.target);      // fires once, never replays
    }
  });
}, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
```

`[data-mv-watch]` holds an element at `opacity: 0` until it fires (`global.css:337-339`), with a
`<noscript>` override at `BaseLayout.astro:64` so a dead script does not blank the page.

### The six shared moves (`global.css:252-334`)

| Class | Keyframe | Duration | Easing | Use |
|---|---|---|---|---|
| `.mv-rise` | `mvRise` (opacity 0 to 1, `translateY(14px)` to 0) | `--motion-dur-base` 900ms | expo | Default entry: section heads, hero copy |
| `.mv-wipe` | `mvWipe` (`clip-path: inset(0 100% 0 0)` to 0) | `--motion-dur-fast` 600ms | soft | Rules, underlines, progress fills |
| `.mv-soften` | `mvSoften` (opacity + `scale(0.96)` + `blur(8px)`) | `--motion-dur-slow` 1400ms | expo | Sparingly: heavy cards, image entries |
| `.mv-stagger` | children run `mvRise` | 900ms each, `180ms` apart, `nth-child` 1 to 8 | expo | Grids, card rows, stat rows |
| `.mv-sweep` | `mvSweep` (a 35%-wide periwinkle gradient tracking across) | `3.8s` infinite | soft | Live/breathing elements |
| `.mv-pulse` | `mvPulseRing` (box-shadow ring 0 to 14px) | `2s` infinite | soft | Status dots only |

The comment in source is explicit: *"Use one of these six moves on any element. Anything else
is a ticket."* (`global.css:278`).

`.mv-stagger` caps at 8 children. A ninth child gets no delay.

### Reduced motion

Global kill switch, `global.css:350-355`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

On top of that, every JS-driven animation checks the query itself and jumps to the end state:
HeroShowcase (`BUILD = reduce ? 0 : 3600`), the price count-up, and the walkthrough auto-advance.
Any new JS motion must do the same.

---

## 5. Graphic and animation inventory

Legend: **[S]** = signature move, deliberately designed, do not replicate casually elsewhere.
**[V]** = reusable vocabulary, safe to adapt.

### Homepage

**1. Hero showcase browser build [S]**
`HeroShowcase.astro` + `showcase/SitePreview.astro` + `data/showcase.ts`.
Technique: pure DOM and CSS, driven by `requestAnimationFrame`. No canvas, no SVG, no library.
A fixed `1000 x 931px` stage (`.sc-stage`) is scaled to the frame by a single
`transform: scale()` recomputed by a `ResizeObserver`.
Sequence: build progress `p` runs 0 to 1 over `BUILD = 3600ms`, then holds `HOLD = 3000ms`.
Phases keyed off `p` (`HeroShowcase.astro:329-334`): blank canvas `0`, grid system `0.18`,
wireframe `0.4`, content `0.66`. Grid fades out from `0.66`, wireframe from `0.66`, the real
site fades in from `0.66` over `0.28`.
Trigger: IntersectionObserver at `threshold: 0.2`, fires once.
Also: pauses on `mouseenter`/`focusin`; URL bar text swaps from `localhost:4321` to the real
domain at `p >= 0.66`; the chrome pill goes green with a `scLive` 2.4s pulse at `p >= 1`.
This is the most elaborate thing on the site and the clearest single statement of the brand.

**2. Process step visuals [S]**
`index.astro:170-357`. Four hand-built graphics, all plain HTML and CSS, no images:
- **Step 01, calendar.** A real 7-column month grid for May 2026 with `.off` / `.avail` /
  `.picked` day states and a confirmed-slot footer row.
- **Step 02, browser draft.** A faux browser with chrome dots, a lock, a URL, and a skeleton
  page of empty divs. The CTA block carries `.mv-sweep`.
- **Step 03, revision doc.** A document of `.ps-rev-line` bars with `.edit`, `.struck`, and
  `.added` states, a blinking caret, and three margin comment bubbles with avatars.
- **Step 04, launch log.** A deploy log of check rows with timings, one `.active` pulsing row,
  and three stat cells.
Each sits in a `.ps-visual-frame` locked to `min-height: 560px` so all four steps match, with
a `translateY(-4px)` lift on step hover over `420ms var(--ease-soft)`.
**This is the reference pattern for "text paired with a dedicated visual".** It is the answer
to what a section should look like when it needs a graphic.

**3. Offer bento with mouse spotlight [V]**
`index.astro:420-647`. Dark navy centerpiece plus six soft feature tiles.
- Spotlight: `[data-tilt]` handled at `BaseLayout.astro:103-117`, writing `--mx`/`--my` as
  percentages and `--tiltx`/`--tilty` as unitless `-1..1`. Consumed by
  `radial-gradient(260px circle at var(--mx) var(--my), var(--sheen), transparent 60%)` on
  `.tier-sheen`, opacity 0 to 1 over `360ms var(--ease-soft)`.
- Card lift: `translateY(-3px)` plus a `0 30px 60px -28px` shadow, `360ms`.
- Feature tiles: a 2px periwinkle left rule that grows `scaleY(0)` to `1` over
  `420ms var(--ease-soft)` on hover.
- Numerals are lowercase roman (`i.` through `vi.`) in italic Fraunces, `--color-blue`.

**4. Price count-up [V]**
`index.astro:753-781`. `requestAnimationFrame`, `1400ms`, cubic ease-out written by hand as
`1 - Math.pow(1 - t, 3)`. Triggered by its own IntersectionObserver at `threshold: 0.4`,
disconnects after firing. Formats with `toLocaleString('en-US')`. Honors reduced motion by
writing the final value immediately.

**5. Ticker strips [V]**
`.bh-ticker-track`: `28s linear infinite` `translateX(-50%)`, content duplicated so the loop is
seamless, edges softened with
`mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`.

**6. Phrase marquee [V]**
`Marquee.astro` + `.marquee-track`: `60s linear infinite`, pauses on hover via
`animation-play-state: paused`. Items are Fraunces italic `step-3` separated by periwinkle dots.

**7. Live dot pulse [V]**
`bhPulse` / `mvPulseRing`: `2.4s var(--ease-soft) infinite`, box-shadow ring expanding to 7px
(local) or 14px (global token) then fading.

**8. Paper grain [S]**
`global.css:90-99`. A fixed full-viewport `body::before` at `opacity: 0.04`,
`mix-blend-mode: multiply`, using an inline SVG `feTurbulence` filter
(`baseFrequency='0.85' numOctaves='2'`). Sits under everything at `z-index: 0`; `main`,
`header`, `footer` are lifted to `z-index: 1`.

### Shared / other pages

**9. Spinning FAQ rings [V]** `global.css:414-421`. Two concentric circles at `50vmin`,
positioned `right: -10vw`, one solid hairline spinning `mvSlowSpin 90s linear infinite`, one
dashed periwinkle at `scale(0.65)` spinning `120s` reversed. Purely decorative background.

**10. Walkthrough timeline [V, currently weak]** `global.css:1257-1422`. A 5-column marker
track on ink, with a periwinkle progress line whose width is driven by `data-step` in fixed
steps (`10%`, `30%`, `50%`, `70%`, `90%`) transitioning `700ms var(--ease-soft)`. Auto-advances
every `4200ms`, pauses on hover/focus.

**11. Studio character decode [S]** `studio.astro:290-310`. The answer line is split per
character server-side; each `<span>` holds its real width from first paint and only fades and
rises, so the line never reflows. `stChar 460ms var(--ease-out-expo)`, staggered
`calc(var(--i) * 26ms)`.

**12. Studio capacity gantt [S]** `studio.astro:346-404`. A 13-column quarter grid with run bars
positioned as percentages of the lane rather than grid columns, so they align exactly to the
week ticks. Bars animate `stRun 700ms var(--ease-out-expo)` from `scaleX(0.02)`, staggered
`140ms` per row.

**13. Studio fold [S]** `studio.astro:438-579`. Five role cards spread by index
(`--spread: calc((var(--i) - 2) * clamp(112px, 18vw, 168px))`) with per-card rotation, held
`3000ms`, then collapsing to a single card over `1500ms var(--ease-out-expo)` while the
replacement fades in at `4300ms`. Driven entirely by `.is-inview` from the shared observer,
no extra JS. Captions cross-fade at `2300ms`.

**14. Brand mark [V]** `BrandMark.astro`, a two-layer SVG with an offset shadow layer.

---

## 6. Rules for new work

Derived from the above, not invented:

1. Use the six `.mv-*` moves for entrances. Do not write a new entrance keyframe.
2. Entrances use `--ease-out-expo`. Hovers and state changes use `--ease-soft`. Loops are `linear`.
3. Scroll-triggered means `data-mv-watch`, which means it fires once and never replays.
4. Any new JS animation must check `prefers-reduced-motion` and jump to its end state.
5. Set `font-variation-settings: "opsz"` on every Fraunces usage.
6. Accent is `--color-blue` on light, `--color-periwinkle` on ink or navy. Never mixed.
7. Every heading gets exactly one italic `<em>`. Not two, not zero.
8. Graphics are built from HTML and CSS. The site has no illustration library, no icon set, no
   canvas, and no animation library. The four process visuals and the studio gantt are the
   proof this is sufficient.
9. Two-layer shadows with large negative spread. Never one soft blur.
10. Mono for every label; Fraunces for every heading; Inter Tight for buttons and body UI.
