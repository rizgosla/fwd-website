# fwd. — Polish & SEO suggestions

A working list, ordered roughly by impact-vs-effort. Each item notes which files
it touches so you can pick them off one at a time.

---

## 1 · SEO — the things Google actually rewards

### 1.1 · Add Open Graph + Twitter Card meta tags
Right now `BaseLayout.astro` ships `<title>` and `<meta description>` but nothing
for social previews. When someone pastes a fwd link in iMessage, Slack, or X,
they get a flat URL.

```astro
<!-- in BaseLayout.astro <head> -->
<meta property="og:type"        content="website" />
<meta property="og:title"       content={title} />
<meta property="og:description" content={description} />
<meta property="og:url"         content={Astro.site + Astro.url.pathname} />
<meta property="og:image"       content={`${Astro.site}og-default.png`} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"       content="summary_large_image" />
<meta name="twitter:title"      content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image"      content={`${Astro.site}og-default.png`} />
```

You'll need a `public/og-default.png` (1200×630). For pages with their own
flavor (services, work, about) ship per-page OG images — Astro can auto-generate
them with `@vercel/og` or `astro-og-canvas`.

### 1.2 · Canonical URLs
Single line, prevents www/non-www and trailing-slash duplicates from competing.

```astro
<link rel="canonical" href={Astro.site + Astro.url.pathname} />
```

Set `site: "https://fwd.studio"` in `astro.config.mjs`.

### 1.3 · `robots.txt` + `sitemap.xml`
Install `@astrojs/sitemap` and add to the integrations array. It generates
`/sitemap-index.xml` at build time. Then add a `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://fwd.studio/sitemap-index.xml
```

### 1.4 · JSON-LD structured data
Search engines render rich results from schema.org markup. For a studio,
`ProfessionalService` is the right type:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Forward Design Consulting",
  "url": "https://fwd.studio",
  "logo": "https://fwd.studio/logo.png",
  "description": description,
  "areaServed": "US",
  "priceRange": "$800–$1,800",
  "address": { "@type": "PostalAddress", "addressLocality": "Irvine", "addressRegion": "CA", "addressCountry": "US" },
  "sameAs": ["https://instagram.com/...", "https://read.cv/..."]
})} />
```

Add per-page `BreadcrumbList` and per-FAQ `FAQPage` schemas — Google shows
FAQ accordions directly in search results for the latter.

### 1.5 · Better page descriptions
Current descriptions are good but a few are generic ("Three people. One studio.").
Aim for ~150–160 chars, lead with the value prop, end with a hook. Examples:

- **about**: "Forward Design Consulting is a three-person studio building clean, flat-priced websites for practices and small businesses. Here's why."
- **work**: "Selected websites built by fwd. — practices, studios, and small businesses. Each project: real goals, real decisions, live URL."
- **team**: "Meet Riz, Alex, and JVL — the three people behind fwd. Designers and builders who'd rather work with clients they like."

### 1.6 · Internal linking + anchor text
Right now every CTA says "Start with Landing" or "See services". Mix in
descriptive anchor text in body copy — "our **flat-priced landing pages**" beats
"learn more" for keyword density.

### 1.7 · Image alt text
The SVG portrait/work thumbnails ship without alt text. Add `aria-label` to the
inline `<svg>` or wrap them in a `<figure>` with `<figcaption class="sr-only">`.

### 1.8 · Heading hierarchy audit
Each page should have **one** `<h1>` and a clean h2 → h3 cascade. Quick win:
the `SectionRule` component renders text that visually reads like a heading but
uses a `<span>` — leave it as is, but make sure the h2 in `SectionHead` follows
it (it does today, good).

---

## 2 · Polish — the things that make the site feel finished

### 2.1 · Real screenshots, not SVG placeholders
`work.astro` and `team.astro` currently ship hand-drawn SVG cards. They're
charming as placeholders, but:
- Visitors landing on `/work` from search will judge the studio by what's
  shown there.
- Real screenshots create implicit social proof.

Even one or two real projects with `<img>` tags beats a full grid of SVG
mockups. Until you have them: keep the SVGs but add a small "_concept_" tag
in the corner so it's clear they're representative.

### 2.2 · Connect the contact form to a real backend
Currently `contact.astro`'s submit handler shows a thank-you message but never
sends anything. Easiest path: **Formspree**, **Web3Forms**, or **Resend**.
Drop-in change to the `<form>` action. Add a honeypot field
(`<input type="text" name="company_url" tabindex="-1" autocomplete="off"
style="position:absolute;left:-9999px">`) to keep spam down.

### 2.3 · Custom 404 page
Create `src/pages/404.astro`. Match the brand voice — most studios miss this
and ship the default. Suggested copy: a single Fraunces line ("This page took
a wrong turn.") + a link back to home + a link to /contact.

### 2.4 · Loading states + form errors
The contact form sets `status.textContent` but doesn't disable the submit
button during submission, doesn't show a spinner, and doesn't keep the
message if validation fails. Quick fixes:
- Disable + add "Sending…" text on submit.
- Inline error states per field (red border + below-field hint).
- Keep field values on validation failure (you already do, good).

### 2.5 · Performance — fonts and images
- **Preload the display font.** Fraunces is the brand voice; preloading the
  variable woff2 prevents a FOUT flash on slow connections:
  ```html
  <link rel="preload" as="font" type="font/woff2" crossorigin
        href="https://fonts.gstatic.com/s/fraunces/...woff2" />
  ```
- Add `loading="lazy"` and explicit `width`/`height` attrs to any future
  `<img>` tags so layout doesn't shift.
- When you swap in real screenshots, generate AVIF + WebP variants
  (`<picture>` element).

### 2.6 · Accessibility passes
- Focus rings: most buttons + links currently rely on browser default focus.
  Add a consistent `:focus-visible` ring on `.btn`, `a`, `summary`, form
  fields. The brand blue at 3px works:
  `outline: 2px solid var(--color-blue); outline-offset: 2px;`
- Color contrast: `--color-fg-muted` against paper is on the edge of WCAG AA
  (~4.4:1). Bump to `#4a5662` to clear AA comfortably.
- Add `aria-current="page"` on the active nav link (Nav.astro can compare
  `Astro.url.pathname`).
- The mobile nav toggle exists but I don't see ARIA state syncing visually
  — confirm `aria-expanded` flips trigger the menu's visible state.

### 2.7 · Animation polish
- The hero loads with text already in viewport, so the reveal fires
  immediately. Consider a tiny entrance delay (~150ms) so the page paints
  first, then animates — feels less janky on slow networks.
- The marquee never pauses. Add `prefers-reduced-motion` handling (the CSS
  already does, good) and a hover-pause on the marquee for accessibility.

### 2.8 · Analytics
Pick one privacy-respecting analytics provider — **Plausible** or **Fathom**
— and add the snippet. ~1KB, no cookie banner needed, gives you bounce rate
+ source attribution. Avoid GA4 unless you specifically want it.

### 2.9 · Microcopy passes
A few small wins:
- The CTA says "Got a practice, a product, or a side project?" — strong.
- Footer says "Built with Astro + Tailwind" — fine, but consider replacing
  with a more personal line ("Made in Irvine · 2026") for warmth.
- "Forward Design Consulting LLC" in the footer is the legal name; "fwd."
  is the brand. Lean into the brand in copy; reserve the legal name for
  legal contexts (privacy policy, terms).

### 2.10 · Privacy + Terms
You'll need a `/privacy` and `/terms` page eventually — keep them short and
plain-language. Link from the footer.

### 2.11 · Skip-to-content link
For keyboard users — invisible until focused, jumps past the nav:
```html
<a href="#main" class="skip-link">Skip to content</a>
```
Style it `position: absolute; left: -9999px;` and on `:focus`, bring it back.

### 2.12 · Print stylesheet
Low priority, but classy: `@media print` rules that drop the nav/footer,
flatten colors, and ensure pricing tiers print on a single page. Useful when
clients want to share with a partner.

---

## 3 · Stretch — bigger plays

### 3.1 · Case studies
The biggest SEO and trust unlock you have: convert each `WorkItem` into a
proper case study page (`/work/hillside-dental`). 500–800 words on the
problem, what you did, what changed. Each one is an indexed page targeting
its own keyword cluster (e.g. "dental website design").

### 3.2 · Blog or writing section
Doesn't need to be a content marketing factory — even six posts a year on
your design POV (pricing transparency, why flat fees, redesign vs rebuild)
compounds over time. Format: long-form essays, no listicles.

### 3.3 · Pricing calculator / project quiz
Interactive widget that helps a visitor self-qualify into Landing vs Full
Site (or "we should talk"). High-engagement, great for conversion, and
generates first-party data on what people are looking for.

### 3.4 · Testimonials
Once you have shipped projects, drop pull quotes into the home page and
service pages. Even three short quotes ("two weeks, no surprises") moves
conversion more than any visual polish.

---

## Quick wins to do this week

1. Open Graph meta tags + a default OG image (§1.1)
2. Canonical URL line (§1.2)
3. Sitemap + robots.txt (§1.3)
4. Wire the contact form to a real backend (§2.2)
5. Build a 404 page (§2.3)
6. Add `:focus-visible` rings (§2.6)
7. Pick Plausible or Fathom and install (§2.8)

Everything else can wait for case studies and real photography to land first.
