# fwd. — Astro + Tailwind v4

Conversion of the original single-file `index.html` into a properly structured
Astro project using Tailwind v4 (CSS-first, no config file).

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static build → ./dist
npm run preview  # serve the build
```

## Project structure

```
fwd-website/
├── astro.config.mjs       # registers @tailwindcss/vite + @astrojs/cloudflare adapter
├── wrangler.jsonc          # Cloudflare Worker config (main, assets, compat flags)
├── package.json
├── tsconfig.json
├── public/                # static assets served as-is
├── src/
│   ├── styles/
│   │   └── global.css     # Tailwind import + @theme tokens + custom @layer components
│   ├── layouts/
│   │   └── BaseLayout.astro   # head, fonts, nav, footer, shared scripts
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── BrandMark.astro    # the fwd. logo SVG (reusable)
│   │   ├── Marquee.astro
│   │   ├── HeroShowcase.astro
│   │   ├── CtaClose.astro
│   │   ├── showcase/SitePreview.astro
│   │   └── work/ProjectCard.astro
│   └── pages/
│       ├── index.astro      → /
│       ├── services.astro   → /services
│       ├── studio.astro     → /studio
│       ├── work.astro       → /work
│       ├── contact.astro    → /contact
│       ├── privacy.astro    → /privacy
│       ├── terms.astro      → /terms
│       └── api/
│           └── inquiry.ts   → POST /api/inquiry (contact form handler)
```

## What changed in the conversion

| Original                                     | Now                                                 |
|----------------------------------------------|-----------------------------------------------------|
| Single 2,200-line `index.html`               | 6 routed pages + ~12 reusable components            |
| JS hash-router showing/hiding `<section>`s   | Real Astro file-based routing (`/services`, etc.)   |
| Inline `<style>` block in `<head>`           | `src/styles/global.css` + scoped `<style>` per file |
| Plain CSS                                    | Tailwind v4 utilities + `@theme` tokens + `@layer`  |
| Inline `<svg><symbol id="nxdMark">`          | `<BrandMark />` Astro component                     |
| Cloudflare email obfuscation                 | Plain `mailto:` (replace with your address)         |

## Design tokens

All brand tokens live inside `@theme { … }` in `global.css`. Tailwind v4 reads
them and auto-generates the matching utilities:

| Token                       | Utility examples                          |
|-----------------------------|-------------------------------------------|
| `--color-paper` `#FFFFFF`   | `bg-paper`, `text-paper`, `border-paper`  |
| `--color-periwinkle` `#8E94B8` | `bg-periwinkle`, `text-periwinkle`     |
| `--color-blue` `#144667`    | `bg-blue`, `text-blue`                    |
| `--color-navy` `#0D2F45`    | `bg-navy`, `text-navy`                    |
| `--color-ink` `#071722`     | `bg-ink`, `text-ink`                      |
| `--color-fg`, `-fg-soft`, `-fg-muted` | `text-fg`, `text-fg-soft`, …    |
| `--font-display` (Fraunces) | `font-display`                            |
| `--font-sans` (Inter Tight) | `font-sans` (default)                     |
| `--font-mono`               | `font-mono`                               |
| `--text-step-0..6`, `--text-step--1`, `--text-step--2` | `text-[length:var(--text-step-3)]` etc. |

The fluid type scale uses `clamp()` and is exposed as CSS variables. Use them
inline (`text-[length:var(--text-step-3)]`) since negative-stepped names
(`step--1`) aren't valid Tailwind class identifiers.

## Why some classes stayed custom

The typographic patterns (`.display`, `.lede`, `.eyebrow`) involve Fraunces
variation settings (`opsz`, `SOFT`) plus italic-em treatment that doesn't read
well as a long chain of utilities. They live in `@layer components` inside
`global.css` and stay available everywhere.

## Hosting / contact form

The site deploys to Cloudflare as a Worker via the `@astrojs/cloudflare`
adapter (`npm run build && wrangler deploy`; see `wrangler.jsonc`).

The `/contact` form is a real, working submission handler — `src/pages/api/inquiry.ts`
sends the inquiry to Resend's REST API (`fetch`, no SDK needed) and also
sends a confirmation email back to the submitter. It requires a
`RESEND_API_KEY` Cloudflare secret:

```bash
npx wrangler secret put RESEND_API_KEY
```

Until that secret is set the endpoint returns a real error instead of a fake
success. See `.dev.vars.example` for local development.

## License

Original design © Forward Design Consulting.
