# Work shots

Screenshots and photos of shipped work. The homepage's "Selected work" section
reads this folder directly — **drop a file in here and it appears on the site.**
No code change, no list to update.

## Adding a shot

Drag the image in and name it. That's the whole process.

```
01-oasis-dental.png
02-burnt-crumbs--mockup.jpg
03-kagasoff--in-progress.png
04-oasis-booking-flow.png
```

`.png`, `.jpg`, `.jpeg`, `.webp` and `.avif` all work.

## What the filename does

**Order** — files sort by name, so a numeric prefix controls the sequence.
`01-`, `02-`, `03-`. The prefix is stripped from the caption.

**Caption** — the rest of the name becomes the label, with hyphens turned into
spaces and each word capitalised:

| filename | caption |
|---|---|
| `01-oasis-dental.png` | Oasis Dental |
| `04-oasis-booking-flow.png` | Oasis Booking Flow |

**Badge** — a `--` suffix marks work that isn't a launched client site:

| suffix | badge |
|---|---|
| `--mockup` | Mockup |
| `--in-progress` | In progress |
| *(none)* | no badge |

So `02-burnt-crumbs--mockup.jpg` captions as "Burnt Crumbs" with a Mockup badge.

This matters: Burnt Crumbs is a self-directed redesign, not commissioned work,
and a visitor should never be shown it as a launched client project. Same rule
the cards on /work follow.

## Size

Don't worry about it. These are optimised at build time — converted to WebP and
resized — so a 1.4 MB screenshot ships at roughly 90 KB. Drop in the full-quality
capture.

Capture at desktop width and let the crop do the trimming; the section shows each
shot in a 16:10 frame, anchored to the top of the image.

## Why here and not `public/`

Files in `public/` are served exactly as they are — no compression, no format
conversion. Anything in `src/assets/` goes through Astro's image pipeline first.
That is the entire difference, and at a megabyte-plus per screenshot it is a
large one.
