# fwd-website — Page Quality Parity Redesign

## Context

`src/pages/index.astro` is far and away the strongest page in this repo.
`services.astro`, `work.astro`, `studio.astro`, and `contact.astro` are
noticeably weaker and read like they were built by someone else. The design
language already exists and is already good — the problem is that only one page
actually uses all of it.

**Your job is to bring the other four pages up to the homepage's standard.**
Not to redesign the site. Not to invent a new direction. The homepage is the
spec; the other pages are behind it.

Work through this document in order. **One item per approval cycle.** Never move
to the next without asking.

---

# STATUS — resume here

*Last updated 2026-08-02. Read this section first; it overrides the item order
below where they disagree.*

## Done

- **Phase 0 audit** — complete. Findings folded into the items below.
- **Item 1 — Footer** — shipped. Committed as `969257b` on branch
  `claude/footer-and-css-sweep` (not yet merged to `main`, no PR opened).
  Includes the `global.css` dead-code sweep: 2,608 → 1,575 lines. Also fixed two
  dead anchors (`/studio#people`, `/services#what-you-get`) and corrected the
  email to `fwddesignconsulting@gmail.com` on the footer and contact page.

## In flight — awaiting approval

**The closing section.** The user flagged that the section before the footer
("Got a practice, a product, or a side project?") is the blandest on the site,
and asked for a creative redesign. Direction chosen: **editorial type takeover**,
built as one **shared component** replacing three different closing treatments.

- `src/components/CtaClose.astro` — built, uncommitted, **wired to no page**.
- `src/pages/preview/cta.astro` — scratch preview. **Delete at Checkpoint 3.**
- Run `npm run dev`, open `/preview/cta`. Odd sections are current, even are new.

What it does: headline with the last word cycling through four audiences on a
12s loop; `tone="light"` for home, `tone="ink"` for services/studio (the
homepage sequence is dark process step → close → dark footer, so an ink close
would give three dark bands in a row); an ASCII render of the brand mark that
ripples away from the cursor.

**Outstanding question: section 02 (homepage close) — ship it, change it, or
drop it?** Then 04 and 05 individually. Do not batch.

On approval: wire into `index.astro` / `services.astro` / `studio.astro`,
remove the dead `.cta-band*` and `.cta-band-light*` CSS from `global.css` and
`index.astro`'s scoped block, verify 375/900/1100/1440/2560, delete the preview.

## Decisions already made — do not re-open

| Question | Answer |
|---|---|
| Oasis Dental case study | Real client, **invented numbers**. Replace or cut `results[]`, `quote`, and the specific claims in `deck`/`brief.body` before `/work` ships. |
| Contact form | Its own item, **after the footer, before Studio**. See below. |
| Dead CSS | Sweep **all** orphaned blocks. Done for `global.css`. |
| `.cta-band h3` bug | **Fold into Items 2 and 3**, not a standalone fix. |
| Duplicate mark on homepage | Resolved by the shared closing component — `.cta-band-light-bg` goes away with it. |
| `/work` closing section | **Deferred to Item 5**, designed with the rebuilt page. |
| Skiper UI / Kokonut UI | React + shadcn + Motion. Not installable here without 4 new deps and a client React runtime. Asked twice, answered twice. `@astrojs/react` is the path if ever genuinely wanted — **ask first**. |

## Revised item order

1. ~~Item 1 — Footer~~ **done**
2. **Item 1.5 — Contact form endpoint** *(new, inserted)* — `contact.astro:293`
   calls `preventDefault()` and fakes success with a `setTimeout`. It posts
   nowhere while telling the user "Your inquiry is in our inbox." Highest-severity
   issue in the repo.
3. Item 2 — Studio *(fix `.cta-band h3` here)*
4. Item 3 — Services *(fix `.cta-band h3` here)*
5. Item 4 — Marquee
6. Item 5 — Work
7. Item 6 — Link work from the homepage

## Verified facts that change the items below

- **Item 4's premise is wrong.** The hover-pause does **not** reproduce on
  current `main`. Confirmed from built HTML: `index.astro`'s `.marquee` rules
  compile to `[data-astro-cid-j7pv25f6]` but the element carries
  `data-astro-cid-tpudeaz7`, because Astro does not propagate a parent's scope
  to a child component's root. The entire `.marquee*` block at
  `index.astro:394-400` is dead code. The two real issues (italic optical
  centring, no lead-in label) stand.
- **Item 5's two lists don't overlap at all.** `showcase.ts` contains exactly
  one entry — Burnt Crumbs, a real live site — which `/work` never mentions.
  `/work`'s only launched project is Oasis Dental. Consolidating is not a merge;
  it's a decision about which project set is real.

## Traps that already cost time

- Preview folders must not start with `_` — Astro drops them from routing.
- **Scoped styles don't exist on other routes.** `.cta-band-light` lives in
  `index.astro`'s `<style>`, not `global.css`. Copying that markup into a
  preview without its CSS makes the "before" render unstyled and the comparison
  lie. This happened once and looked like a broken page.
- **Never edit files with PowerShell `Get-Content`/`Set-Content`** — reads UTF-8
  as ANSI and double-encodes every em dash in the file. Cost a byte-level repair.

---

# THE LOOP

Every item in this document goes through the same three checkpoints. No
exceptions, no shortcuts, no batching.

## Checkpoint 1 — Analyze, no code

Read the relevant files. Report what you found. Ask me what you need to know.
**Write nothing.** Wait for my reply.

## Checkpoint 2 — Mockup, no edits to real pages

Build a preview route:

```
src/pages/preview/<name>.astro
```

Rules:
- Uses `BaseLayout` and the real `global.css`, so what I see is shippable.
- Contains **only the new/changed sections**, stacked, each with a plain-text
  label saying what it is and what it replaces.
- Where you're changing an existing section, render old and new back to back so
  I can compare directly.
- **Do not name the folder `_preview`** — Astro excludes underscore-prefixed
  folders from routing and it won't build.

Then tell me:

```
Preview ready.
  npm run dev
  http://localhost:4321/preview/<name>
```

I'm on Windows/PowerShell. No shell scripts, no `bash`, no screenshot attempts.
Just the URL.

Then ask me about each section **individually**:

> Section [n] — [name]. Ship it, change it, or drop it?

Do not batch these into one question. Do not treat silence as approval. Iterate
on the preview until I've approved every section: change → tell me to reload →
ask again.

## Checkpoint 3 — Implement, then report

1. Port approved sections into the real page → verify: `npm run build` passes
2. Check every breakpoint the homepage handles → verify: no horizontal overflow,
   no broken grid on mobile
3. Confirm motion → verify: `data-mv-watch` elements animate in, nothing stuck
   at `opacity: 0`
4. Delete the preview route → verify: `src/pages/preview/` is gone

Then report: diff summary (files touched, lines +/-), anything you deviated from
the approved mockup on and why, anything you noticed but left alone.

Then ask whether to continue to the next item.

---

# PHASE 0 — Design language audit

Before any of the work below. Read `src/pages/index.astro` end to end, plus
`src/styles/global.css`, `src/layouts/BaseLayout.astro`, and everything in
`src/components/`. Then read the other four pages.

Produce:

**1. What the homepage actually does** — the recurring devices that make it work,
named by class. Verify and go beyond these starting observations:
- Section heads follow `.section-eyebrow` → `.display .section-title` (with an
  `<em>` accent on one word) → `.section-sub`
- Nearly every block is wrapped in `data-mv-watch` with `mv-rise`, `mv-stagger`,
  or `mv-soften`
- Cards use `data-tilt` plus a `.tier-sheen` overlay
- Visuals are hand-built fake UI — a calendar mock, tickers, browser chrome —
  not icons or stock imagery
- Roman-numeral glyphs (`i.`, `ii.`, `iii.`) recur as a numbering device

**2. A gap table.** For each weaker page: line count, `data-mv-watch` count,
`data-tilt` count, number of custom visuals, whether section heads follow the
pattern. The gaps are measurable — `index.astro` is 843 lines while `studio`,
`work`, and `contact` sit near 320 each, and three of the four use `data-tilt`
zero times.

**3. Anything on the homepage you think is actually wrong.** Don't propagate a
bug into four more pages.

**Stop at Checkpoint 1.**

---

# ITEM 1 — Footer (do this first, it's global)

**Why first:** it appears on every page. Right now it only clashes with the
homepage. Once the other four pages are fixed it becomes the weakest element on
the site, five times over. Fixing it first means every later page is built
against a finished footer.

**The problem:** four-column grid, large `BrandMark`, three link lists, mono
uppercase labels. Nothing is broken — it's inert. It uses none of the site's
design language: no `data-mv-watch`, no `data-tilt`, no `.tier-sheen`, no
editorial display type, no custom visual, no `<em>` accent.

**Do:** redesign it to read as the closing movement of the page rather than a
sitemap bolted to the bottom. Consider these — argue for or against each rather
than doing all of them:
- A large display-type closing line with an `<em>` accent, in the voice of the
  homepage headlines, above the link columns
- The dark ink field is right; it's the only dark surface on most pages. Consider
  leaning into that rather than away
- The `BrandMark` at `clamp(120px, 14vw, 200px)` is already doing decorative
  work. Either commit to it as a graphic element or cut it down and let type
  carry the weight — the current middle ground reads as indecision
- Entry motion, consistent with how homepage sections arrive

**Constraints:**
- It stays a footer. No hero-scale takeover.
- One shared component. No per-page forks.
- Keep hover and `:focus-visible` states. Don't drop outlines in a restyle.
- **`/studio#people` is linked here and Item 2 removes that section.** Fix the
  link in this pass or you ship a dead anchor.

**Also, while you're in `global.css`:** the `mv-*` animation classes are defined
twice (~line 343 and ~line 992), and `.logo-marquee` is defined twice as dead
code (~449–466 and ~2751–2808), referenced by no page. Flag both for deletion
and **ask me** — per CLAUDE.md §3, don't remove pre-existing dead code
unilaterally.

---

# ITEM 2 — Studio page

**The problem:** 319 lines, zero `data-tilt`, no custom visuals, and a third of
its length is a three-person team roster.

**Remove the team section entirely** (`#people`, the `.person-*` blocks). A
three-person roster with portraits and bios on a studio this size reads as
padding, and it's maintenance nobody wants.

**Then:** the page has to justify itself without that section. Keep only what a
prospective client needs to know about who they'd be working with. The `#values`
band and the manifesto are the seed of that — the question is whether they're
saying anything a client cares about or just sounding nice. Audit the copy
honestly and tell me which lines are load-bearing and which are filler.

**Target:** shorter in word count than it is now, but at homepage quality per
section. Fewer sections, each earning its place, each with a real visual and real
motion. Do not pad it back to 300 lines to feel substantial.

**Ask me before writing copy.** Tell me what the page should say and let me
approve the argument before you draft prose in my voice.

---

# ITEM 3 — Services page

The biggest job. One approval cycle, but show me four separate sections in the
mockup.

## 3a. The hero spec card is redundant, not just boring

`.svc-hero-card` is a `<dl>` listing Turnaround / Pages / Revisions / Hosting /
Ownership. The `#offer` bento immediately below presents **the same
information** — up to 8 pages, hosting and domain, three revision rounds — with a
price counter, a ticker, tilt, and sheen.

The reader hits a flat spec list, then immediately hits a better version of the
same content. That's why it drags. The fix is not "make the card prettier."
Decide whether the hero needs a right-hand element at all, and if it does, it
must do something the bento below doesn't.

## 3b. The offer bento is copy-pasted from the homepage

`#offer` on services and the services preview on `index.astro` are near
identical — same headline construction, same six tiles `i.` through `vi.`, same
body copy. A visitor arriving from the homepage sees the same block twice.

The homepage should tease; services should go deeper. Propose how to
differentiate them. **Don't resolve this by deleting one** — that leaves a gap
rather than fixing the repetition.

## 3c. Timeline — strip the names

The `.walkthrough` timeline names individuals ("Jaiden replies", "Riz builds the
first version"). Rewrite to first-person plural throughout — "we", "one of us",
"the studio". Keep the structure, the day markers, and the tab interaction. This
is a copy edit, not a redesign.

Check the whole repo for the same problem, not just this section.

## 3d. Copywriting is not a service we offer

The "Not included" section lists Copywriting as **Add-on available** — "if you
need us to draft from scratch, we can roll it in." We don't do that.

Two options — **ask me which**, don't guess:
1. Delete the card, leaving two items in that section.
2. Recategorize as **Out of scope** and rewrite the body so it still tells
   clients the useful part: they write the copy, we polish it.

Either way the section header says "Three things" and the sub says "Two of them
can be added" — both need updating.

---

# ITEM 4 — Marquee

**Verify before you change anything.** I've said the marquee pauses on hover and
that it's weird. But `Marquee.astro` contains no hover rule. The
`animation-play-state: paused` on hover belongs to `.logo-marquee`, which is dead
code (see Item 1). Check whether the hover-pause actually reproduces in a local
`npm run dev` build and report what you find before touching it. If it doesn't
reproduce, say so — I may be looking at a deployed build ahead of `main`.

Two real problems regardless:

**Text placement.** Items are display-italic at `--text-step-3` with a periwinkle
dot separator, `align-items: center`, `gap: 44px`, `padding-inline: 22px`, in a
22px band. Italic type has a different optical center than the geometric one, so
`align-items: center` against a `0.5em` dot is the likely culprit. Diagnose
properly and propose a fix.

**No frame.** It scrolls "Practices ● Small businesses ● Studios ●" with nothing
telling the reader what the list *is*. It reads as decoration rather than "here's
who we build for." Propose a fix — a fixed lead-in label, or copy that carries
its own context.

---

# ITEM 5 — Work page

**Keep:** the live project count in the hero. Fine as-is.

**Remove:** individual case study pages. Delete the `/work/[slug].astro` route.
Per-project write-ups with brief / approach / results are more maintenance than
they're worth and will rot the moment we're busy.

**Replace with:** a preview of the site plus a link straight to the live URL.

**This mechanism already exists.** `src/components/HeroShowcase.astro`,
`src/components/showcase/SitePreview.astro`, and `src/data/showcase.ts` already
do exactly this on the homepage — a mini-render of a real site in browser chrome,
with the real domain and a clickable link. It's one of the strongest things on
the site. Reuse it; don't build a second version.

This also fixes a real problem: `src/data/showcase.ts` and
`src/content/work/*.md` are two separate hand-maintained lists of the same
projects. **Consolidate to one source of truth and tell me which one should
win** — that's my call, not yours.

Handle in the same pass:
- `src/content.config.ts` — the `work` schema carries `brief`, `approach`,
  `results`, `deck` fields that die with the case studies. Propose the reduced
  schema.
- The four files in `src/content/work/` lose most of their frontmatter.
- `work.astro` line 52 links to `/work/${entry.id}` and must now link out.
- External links need `rel="noopener"` and should signal they open the live site.
- The section sub reads "Tap any card to read the full case study" — no longer
  true.

**The page must sell the service, not just archive projects.** Right now it's a
catalogue. Someone landing on `/work` from a search result should understand what
we do and what it costs before they leave. At minimum it needs a real close at
the bottom, not a grid that stops.

---

# ITEM 6 — Link work from the homepage, early

**The homepage does not link to `/work` a single time** in 843 lines. The only
work-adjacent thing above the fold is `HeroShowcase`, which shows real sites but
routes nowhere.

Options to weigh:
- Make the `HeroShowcase` frame itself a route into `/work`
- Add `/work` to the hero actions alongside "See services" and "Start a project"
- A dedicated work teaser section high on the page, above the process section

Do this **last**, after the work page is rebuilt, so you're linking to something
worth landing on.

---

# Standing rules

- One item per approval cycle. Never two pages in one pass.
- If you're about to write more than ~150 lines without showing me anything,
  stop and show me what you have.
- Copy in my voice gets approved before implementation, not after.
- When a change breaks a link elsewhere, fix it in the same pass and tell me.
- New CSS goes at the end of `global.css` under a labeled comment block for that
  page. Reuse existing tokens and classes — do not duplicate `.bento-card` under
  a new name.
- If a homepage device genuinely shouldn't be reused on a given page, say so and
  argue for it. Consistency isn't the goal; quality parity is.
- If you disagree with anything in this document, say so before implementing. I'd
  rather argue at the mockup stage than undo it.
