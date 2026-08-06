# AUDIT.md

Current state of Work, Services, and Studio measured against `DESIGN.md`.

Scoring against your hard constraint: **every section in scope must pair its text with a
dedicated visual element (animation or graphic). Text-only fails. A generic icon or a colored
dot fails.**

---

## A. The "keep as is" section on Services, confirmed

**It is the section with `id="offer"`, `class="section section-offer"`, heading
"A whole website, *one number*." at `services.astro:41-127`.** The reusable block inside it is
`.offer-bento`.

Evidence it is the homepage-borrowed grid:

| | `index.astro` | `services.astro` |
|---|---|---|
| Section | `:57` `class="section section-offer"` | `:41` `id="offer" class="section section-offer"` |
| Heading | `:60` "A whole website, *one number*." | `:44` identical |
| Grid | `:64` `.offer-bento.mv-stagger` | `:48` identical |
| Centerpiece | `:66` `.bento-card.bento-headline` | `:50` identical |
| Feature tiles | `:100-140`, six tiles `i.` to `vi.` | `:84-124`, same six, same copy |
| Count-up script | `:753-781`, id `bhAmount` | `:616-643`, id `svcAmount` |

The two differ in only three places: the section id, `bh-meta` ("~3 to 4 weeks" vs
"20 business days"), and the CTA (`/services` "See the full scope" vs `/contact` "Start a
project"). The ~200 lines of bento CSS are duplicated verbatim in both files' `<style>` blocks.

**Locked. Not touched in this pass.** Noting the CSS duplication only so it is on record; I am
not deduplicating it, because that would mean editing the homepage.

---

## B. Work page (`src/pages/work.astro`)

| # | Section | Lines | Current visual | Verdict |
|---|---|---|---|---|
| 1 | `.work-hero` | 21-39 | Logo watermark `img` at `opacity: 0.25`, plus a 4-cell stat bar | **FAIL** |
| 2 | `.section-work-grid` | 41-83 | None. Text cards with a 6px gradient stripe | **FAIL** |
| 3 | `.section-upcoming` | 85-111 | None. Colored 7px dot per card | **FAIL** (generic dot) |
| 4 | `.section-note` | 113-122 | None. Two paragraphs | **FAIL** |

Detail:

**1. Hero.** `work-hero-stamp` is a decorative repeat of the site logo, not a designed element,
and it is the same trick the studio hero uses at `opacity: 0.05`. The stats row
(`04 / 00 / 100% / 2026`) is typography in a bordered grid, not a graphic. Nothing here is
built the way the four homepage process visuals are built. Your read is correct.

**2. Project display.** Cards carry industry, location, title, summary, two result stats, scope,
price, and a "Read case study" CTA. That is seven content types where your spec calls for
three. No preview image anywhere on the page.

**3. Pipeline cards.** Status dot plus title plus summary plus scope and price.

**4. Closing note.** Prose only.

The page has no `CtaClose`, unlike Services, Studio, and the homepage.

### Blocking issues found on this page

**B1. `/work/[slug].astro` is an empty file (0 bytes).**
`work.astro:52` links every launched card to `/work/${entry.id}`. `src/pages/work/[slug].astro`
exists but contains nothing, so every "Read case study" link is dead. This matters for the plan:
your new spec is image, link out, blurb, nothing else, which removes the reason for a detail
route at all. Decision needed at Step 2, see §E.

**B2. There are no project screenshots in the repo.**
`public/` contains exactly four files: two logo SVGs, and `showcase/burnt-crumbs/hero.jpg` and
`logo.png`. There is no screenshot of any client site. The Work redesign is specified around a
preview image per project, and I cannot produce those (no screenshotting on this machine, per
your setup). **This is a hard dependency on you.** See §E.

**B3. The work content and the showcase data disagree about what is real.**
- `src/data/showcase.ts` holds one entry, Burnt Crumbs (`burntcrumbs.com`), described in the file
  header as a real shipped site.
- `src/content/work/` holds four entries, none of which is Burnt Crumbs: `oasis-dental.md`
  (status `live`), plus `north-and-pine-books.md`, `lila-park-therapy.md`, `roost-coffee.md`
  (all stubs, 12 lines each, status `build`/`design`/`discovery`).
- `oasis-dental.md` carries specific metrics (`3.2×` booking inquiries, `↓ 41%` bounce,
  `98/100` PageSpeed) and a named client quote from "Dr. Mei Smith".
- Meanwhile `work.astro:118` states: *"we agreed we would never show work that was not ours,
  and we would never dress up a placeholder to look like a case study."*

I am not making a judgment about which of these is real. I am flagging that the page cannot be
rebuilt around "a preview of the live site" until I know which projects have live sites.

---

## C. Services page (`src/pages/services.astro`)

| # | Section | Lines | Current visual | Verdict |
|---|---|---|---|---|
| 1 | `.svc-hero` | 8-38 | `.svc-hero-card` spec list, 5 rows of `dt`/`dd` plus a pulsing dot | **FAIL** |
| 2 | `#offer .offer-bento` | 41-127 | Full bento, spotlight, count-up, ticker | **PASS, LOCKED** |
| 3 | `.walkthrough` | 130-185 | Marker track with a progress line | **FAIL** |
| 4 | `.not-included` | 188-210 | None. Two text cards with a tag | **FAIL** |
| 5 | `.section-faq` | 213-247 | Spinning background rings only | **FAIL** |
| 6 | `CtaClose` | 251-259 | Shared component | Out of scope, see §E |

Detail:

**1. Hero.** The spec card is a `dl`. It is typography in a bordered box, and it duplicates
information the bento below it states again ("up to 8 pages", "3 rounds", "hosting included"
all appear twice within one scroll). It also does something the homepage hero never does: it
puts the page's only right-column element at rest, where the homepage puts a 3.6-second build
animation. This is the sharpest gap between this page and the homepage.

**3. Walkthrough timeline. Confirmed: it displays names.** Three of the five panels do:
- `:155` "An inquiry comes in. *Jaiden replies*." and `:156` "Jaiden writes back within a day"
- `:168` "**Alex** sends a flat-fee proposal" and `:239` (FAQ) "**Alex** sends every invoice"
- `:174` "**Riz** builds the first version"

Structurally it is exactly what you called it: a dotted list. `.walkthrough-marker::before` is a
14px circle (`global.css:1343-1358`), the track is a 1px line, and the progress fill is a 1px
periwinkle line stepping in fixed percentages. There is no graphic, no calendar, no illustration.
The homepage solves this exact problem, "explain a sequence of steps", with four full custom
visuals. The Services page solves it with dots on a line.

Note: `:239` puts a name in the FAQ too, outside the timeline. Flagging so the name removal is
not applied half way.

**4. Not included.** Two prose cards. You said anything on this page that is not the borrowed
grid is fair game, so this is in scope and currently fails.

**5. FAQ.** Six `<details>` elements. The section has decorative spinning rings behind it
(`global.css:414-421`), but those are a background texture on the section, not a visual paired
to the content, and they are `right: -10vw` so they are half off-screen by design. Reads as a
plain list, exactly as you said.

---

## D. Studio page (`src/pages/studio.astro`)

| # | Section | Lines | Current visual | Verdict |
|---|---|---|---|---|
| 1 | `.st-hero` | 24-37 | Two-layer radial glow, oversized mark at `opacity: 0.05` | Leave untouched |
| 2 | `.st-why` | 39-70 | Per-character decode on one line. No graphic | **IN SCOPE, FAIL** |
| 3 | `.st-cap` | 72-125 | 13-week gantt, animated bars, spotlight card | Leave untouched |
| 4 | `.st-thread` | 127-176 | Five-card converge-to-one fold | Leave untouched |
| 5 | `CtaClose` | 178-187 | Shared component | Leave untouched |

**Answering your question: what else on Studio should stay untouched.**

Sections 1, 3, 4, and 5. All four are already at or above the homepage bar:

- `.st-cap` (§5 item 12 in DESIGN.md) is a genuine custom graphic. The comment at
  `studio.astro:99-101` records a real design decision, bars positioned as lane percentages
  rather than grid columns so they align exactly to the week ticks.
- `.st-thread` / `.st-fold` (item 13) is the most complex CSS-only animation on the site, with a
  deliberate 3000ms hold before collapse and a documented reason for it at `:483-484`.
- `.st-hero` matches the homepage hero's weight and needs nothing.

**Why `.st-why` fails.** It has three parts: two text columns under `Custom` / `Template` labels,
a display-serif line that resolves character by character, and a tail paragraph. The decode
(`.st-decode`, item 11) is a genuine signature move, but it animates *text*. Under your
constraint, the section still has no visual element paired to it. It is the only section on the
page where the argument is carried entirely by words, which is also why it reads as
underdeveloped next to the gantt directly beneath it.

One structural note for the plan: `.st-why` currently sits between the ink hero and the
`--color-bg-soft` capacity section, and it is on plain `--color-paper` with no top or bottom
border. Anything added here has to hold that light band without competing with the gantt 200px
further down.

---

## E. Items needing your decision before I can plan

**E1. Screenshots.** Blocking for Work. I need one preview image per project you want shown.
Options: you drop them into `public/work/<slug>/preview.png` and I build to that path; or the
template takes a path and I ship it with the one asset that exists; or we defer Work's image
until you have them. Cannot be resolved by me.

**E2. Which projects are real, and what are their live URLs.** See §B3. Your spec requires a
link out to a live site, and right now only `burntcrumbs.com` is asserted anywhere in the repo
as a real shipped site, and it is not in the work collection.

**E3. What happens to `/work/[slug]`.** The file is empty and every card links to it. Under the
new three-field card spec the detail page has no content to show. Three options: delete the
route and drop the unused frontmatter fields; leave the route empty and stop linking to it; or
keep case studies as a separate concern. My recommendation is delete the route and link cards
straight out to the live site, which is what your spec describes, but it is a deletion so I want
you to say it.

**E4. Em-dash conflict.** The skill's Section 14 fails any output containing `—` or `–`. Your
site uses em-dashes heavily in existing copy, including on the locked homepage
(`index.astro:61` "you bring the brand and the words — we handle every part"), and preserve-brand
mode says keep the voice. These cannot both hold. My default unless you say otherwise: **new
copy I write avoids them; existing copy on locked surfaces stays exactly as is; existing copy in
sections I rewrite gets rephrased without them.** Say the word if you would rather I keep the
house voice and take the Pre-Flight fail.

**E5. `CtaClose` is shared.** It is used by the homepage (`index.astro:365`), Services
(`:251`), Studio (`:178`), and it is a 511-line component. Any change to it changes the
homepage, which is locked. I am treating it as locked by extension. Confirm if you disagree.

---

## E2. Conflict ledger: tasteskill v2 against DESIGN.md

Resolved with the user, in order. "Brief wins" means the skill rule is knowingly
overridden and the corresponding Pre-Flight box fails by design, not by oversight.

| # | Skill rule | Sections | Resolution |
|---|---|---|---|
| 1 | Div-based fake UI banned | 4.8, 9.E, 9.F, PF 947 | Brief wins. Hand-built HTML/CSS visuals are the house technique |
| 2 | Page Theme Lock + one accent | 4.11, 4.2, PF 921, 922 | Brief wins. Light/ink inversion and the blue/periwinkle swap both stay |
| 3 | Eyebrow restraint | 4.7, PF 933 | Skill wins, scoped. Thinned in touched sections only; locked sections keep theirs |
| 4 | Split-header ban | 4.7, 9.F, PF 934 | Brief wins. `.section-head` keeps `1fr 1.1fr` |
| 5 | Image priority order | 4.8, PF 947 | Brief wins. CSS gridded placeholder, no seeded stock photography |

Follow-ons resolved by implication from 1 and 2, not separately asked:

- Fraunces stays (4.1, PF 927). Brand face, and the homepage is locked.
- Decorative status dots stay (9.F, PF 959).
- Zigzag cap (PF 935), marquee count (PF 942), bento background diversity (PF 938),
  generic step labels (9.F), fake-perfect numbers (9.D), middle-dot rationing (9.F),
  version stamps in previews (9.F): all sit inside locked sections. Not actionable
  this pass.
- Em-dashes: removed in every section touched, left untouched on locked surfaces.
  The page-level check (PF 920) therefore cannot pass until the homepage is redone.

Tier 3 (stack level) is unbuildable and not attempted: React/Next/Motion/GSAP (3.A,
3.B, 5.A-5.D), icon libraries (3.C), dual dark mode (6.C, 8). The project is Astro
with zero React and no new dependencies allowed.

Tier 4 applied as ordinary fixes: transform-and-opacity-only animation in rebuilt
sections, Services hero subtext cut under 20 words, row-hairline patterns replaced,
design read and dial values declared. Italic descender clearance is applied in
page-scoped styles only, because `.display` in `global.css` is shared with the
locked homepage. The Work hero stats row moves below the hero per 4.7.

## F. Summary

Sections in scope that currently fail the visual-pairing constraint: **nine.**

Work: hero, project grid, pipeline, closing note.
Services: hero, timeline, not-included, FAQ.
Studio: why we exist.

Locked and untouched: the entire homepage, `#offer` / `.offer-bento` on Services, Studio's hero,
capacity gantt, and thread/fold sections, and `CtaClose`.

Two hard blockers before Work can be implemented: screenshots (E1) and which projects are real
with live URLs (E2).

Stopping here for your review, as instructed. No plan proposed, no code touched.
