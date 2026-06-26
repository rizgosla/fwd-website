/* ============================================================================
   HERO SHOWCASE — registry of real, shipped fwd. sites
   ----------------------------------------------------------------------------
   The home-page hero cycles through these entries inside a browser frame, one
   live site at a time. Each object below is a faithful *mini-render* of a site
   we actually built — its colours, type, and hero copy — not a generic mockup.

   ── HOW TO ADD A NEW SITE ──────────────────────────────────────────────────
   When you hand me another finished site repo, adding it to the cycle is a
   single entry here. No component changes required.

     1. Drop a hero photo (and optional logo) into
            public/showcase/<id>/hero.jpg
        Skip the image entirely for a clean, type-only "split" card.
     2. Add one object to the `showcase` array below, copying the closest
        existing entry. Pull the real colours + headline from that repo so the
        preview matches the live site.
     3. That's it — the carousel, dots, URL bar, and auto-advance all pick it
        up automatically and start cycling between every entry.

   Order in this array = order in the carousel. The first entry shows first.
   ========================================================================== */

export type ShowcaseLayout = "overlay" | "split";

export interface ShowcaseSite {
  /** Stable id; also the folder name under public/showcase/<id>/ */
  id: string;
  /** Studio-facing project name (shown on the footer label) */
  name: string;
  /** What shows in the browser URL bar, e.g. "burntcrumbs.com" */
  domain: string;
  /** Real, clickable link to the live site */
  url: string;
  /** Short descriptor: "Restaurant · Irvine, CA" */
  industry: string;

  /** Mini-hero layout. "overlay" = text over a full-bleed photo (great for
   *  restaurants / visual brands). "split" = editorial text + a side widget
   *  (great for services / practices with no hero photo). */
  layout: ShowcaseLayout;

  /** Colour tokens lifted from the real site. */
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  /** Accent text colour when sitting on the accent (usually white). */
  onAccent?: string;

  /** Headline style: "caps" = condensed uppercase, "serif" = editorial serif. */
  display: "caps" | "serif";

  /** Hero copy. `headline` may contain a single <em> for the accented word. */
  eyebrow: string;
  headline: string;
  sub: string;
  cta: string;

  /** Optional hero photo, relative to /public. Required for "overlay". */
  image?: string;
  /** Optional small wordmark/logo for the mini nav, relative to /public. */
  logo?: string;

  /** For "split" cards: an optional mini-widget echoing the real site's
   *  signature feature (e.g. a booking row). Kept tiny + decorative. */
  widget?: {
    label: string;
    rows: { k: string; v: string }[];
    note?: string;
  };
}

export const showcase: ShowcaseSite[] = [
  {
    id: "burnt-crumbs",
    name: "Burnt Crumbs",
    domain: "burntcrumbs.com",
    url: "https://burntcrumbs.com",
    industry: "Restaurant · Irvine, CA",
    layout: "overlay",
    bg: "#1a1410",
    fg: "#f5ede0",
    muted: "rgba(245,237,224,0.72)",
    accent: "#c5453a",
    onAccent: "#f5ede0",
    display: "caps",
    eyebrow: "Irvine, CA · Est. 2010 · #scratchmade",
    headline: "Keeping it <em>#ScratchMade</em>",
    sub: "Scratch-made comfort bites and a modern, casual dining experience.",
    cta: "Order Online",
    image: "/showcase/burnt-crumbs/hero.jpg",
    logo: "/showcase/burnt-crumbs/logo.png",
  },
  // Add the next finished site here — see the "HOW TO ADD A NEW SITE" notes
  // at the top of this file. With a second entry the hero starts cycling.
];
