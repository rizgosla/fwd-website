# Hero rotation, a dark work band, and four things that were broken on a phone

Branch: `claude/mobile-hero-work-process-fixes` (cut from `main`, independent of #29).

Open the PR:
https://github.com/rizgosla/fwd-website/compare/main...claude/mobile-hero-work-process-fixes?expand=1

---

## 1. The hero was static, so the headline now rotates

`Your website is your new storefront.` was one fixed line. It is now
`Your website is the new ___`, where the blank cycles through **storefront →
business card → firm handshake → fancy suit**, with `Make the best first
impression.` beneath it.

Same mechanism as the Oasis Dental hero this was modelled on: the phrases are
stacked in a single `inline-grid` cell so the line never reflows as they swap,
each fading up and out on a shared 12s loop offset 3s apart. Under
`prefers-reduced-motion` the animation is dropped and the first phrase simply
stands.

## 2. The showcase build animation was reading as a slow page load

The browser frame that builds a site in the hero took **3.6s** to get from
blank canvas to live. Long enough that visitors read it as the page struggling
to load rather than as an animation. Now **1.5s**, with the live state held a
little longer (3.0s → 3.8s) so the finished site still gets its moment.

## 3. Selected work is a dark band, and a real disclosure on mobile

The page ran white from the hero all the way down to the studio band. The work
now sits on ink — the one thing on the page that should read as hanging on a
gallery wall — with the heading, frames, pills and cursor stage all recoloured
to match.

On phones each shot became three big pictures you scrolled past, so each card
is now a disclosure: tapping the caption opens **what that project actually
covered**, keyed off the shot's filename slug in `WORK_DETAIL`.

> **Oasis Dental** — Client site · Dental practice
> Full site · Design system · Photography direction · Booking flow · Local SEO

One open at a time. The panel is clipped by `max-height`, never `display: none`
and never `hidden`, so a screen reader walks all of it whatever is open on
screen — and above 900px every panel stands open and the desktop cursor gallery
is untouched.

## 4. Four mobile bugs, each measured

### The mockups in the process section overflowed their cards

`--pc-scale: clamp(0.3, calc(100cqi / var(--stage-w)), 1.6)` divides a length
by a length, which `calc()` does not do. The whole declaration was being
dropped, so every stage fell back to the `@property` initial value of `0.8`:
**376px of artwork inside a 292px column** at 390px wide.

`tan(atan2())` is the usual CSS trick for a length ratio, but Chromium does not
resolve it inside a registered custom property here (verified: the computed
value came back as the literal `tan(atan2(292px, 470px))`), so the ratio is
measured in JS with a `ResizeObserver`, exactly as the hero showcase already
fits its own stage. The stylesheet value is now only the pre-script fallback.

### An open process card could never be closed

The tap handler returned early when the card was already open, so the only way
out was opening a different one. It toggles now. Since the head no longer
navigates below the breakpoint, each open panel carries its own
`See the full scope →` link to /services.

### The mobile menu was broken

`global.css` carries `main, header, footer { position: relative; z-index: 1 }`
**unlayered**, and Tailwind's utilities live in `@layer utilities` — an
unlayered rule beats any layered one regardless of specificity, so the nav's
`sticky top-0 z-50` was being thrown away entirely. The header was not sticky
and shared `z-index: 1` with `<main>`, which paints later, so the hero drew
straight over the open menu.

Stated explicitly in the component's own sheet. While there: the panel gets a
z-index and a shadow, rows get 44px targets, the burger animates into an X so
the open state is legible, and the menu closes on link tap, Escape, an outside
tap, or crossing back above the breakpoint.

### "Who you'll work with" overlapped itself

Five 100px role cards need ~500px of spread and a phone has 390px, so the step
was cut to 52px: every card sat half on top of its neighbour and all five
labels printed over each other. Below 700px they stop being a fan and become a
**wrapped row of chips**. The collapse still plays as a fade-and-shrink into
the studio card, and the stage grew to 290px so that card no longer bleeds over
the caption below it. The desktop fan is unchanged.

## 5. The affordances now say what they do

The arrows alone were not reading as "there is more here". Process heads carry
**TAP TO LEARN MORE**, swapping to **TAP TO CLOSE** when open; work captions
carry **TAP TO SEE THE WORK** / **TAP TO CLOSE**. Both labels are mobile-only,
so desktop hover behaviour and the head-as-link are untouched.

---

## Verification

Measured in headless Chromium at 390×844 with touch emulation, against the dev
server. Two small helpers are committed rather than left as throwaways:
`scripts/shot.cjs` and `scripts/mobile-check.cjs`.

| Check | Result |
| --- | --- |
| Process card tap → open → tap again | `is-open` true, then **false** (was stuck open) |
| Process mockup fit | stage scales to its column; no overflow past the card |
| Role-card overlap at 700/600/480/390/360px | **0 overlapping pairs** at every width |
| Collapsed studio card | sits inside the stage bounds, clear of the caption |
| Mobile menu | opens above the hero, closes on link/Escape/outside/resize |
| Page errors on load and interaction | **0** |
| Elements wider than the viewport | only the marquee/ticker tracks, which are meant to be |
| Desktop cursor gallery at 1440px | still arms and drops shots on the ink band |
| Hint labels above the breakpoint | `display: none` — no "tap" copy on desktop |
| `astro build` | passes |

## Accessibility

- Both disclosures are real `<button>`s carrying `aria-expanded`, and the
  attribute is **removed** above the breakpoint rather than left behind, so a
  disclosure is never announced where none exists.
- Neither panel is ever `display: none` or `hidden` — both are clipped by
  `max-height`, so the full content stays in the accessibility tree at every
  width.
- Tap targets are 44px minimum on the nav rows, the process heads, the work
  captions and the in-panel links.
- The rotating headline collapses to its first phrase under
  `prefers-reduced-motion`, and the shortened build sequence still resolves
  straight to the live state there.
