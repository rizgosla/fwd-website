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
fwd-astro/
├── astro.config.mjs       # registers @tailwindcss/vite
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
│   │   ├── PageHero.astro
│   │   ├── SectionRule.astro  # "§ 01 / Services / Two tiers · Flat fee"
│   │   ├── SectionHead.astro
│   │   ├── ServiceCard.astro
│   │   ├── ProcessStep.astro
│   │   ├── TeamMember.astro
│   │   ├── WorkItem.astro
│   │   └── CtaStrip.astro
│   └── pages/
│       ├── index.astro      → /
│       ├── services.astro   → /services
│       ├── work.astro       → /work
│       ├── team.astro       → /team
│       ├── about.astro      → /about
│       └── contact.astro    → /contact
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

The contact form on `/contact` ships as a no-op placeholder that displays a
success message. Wire it to your form service of choice (Formspree, Resend,
your own endpoint) by changing the `submit` handler in `src/pages/contact.astro`.

## License

Original design © Forward Design Consulting.
