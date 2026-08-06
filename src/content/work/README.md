# Work projects

Each markdown file in this directory is one card on `/work`. There is no detail page:
cards link straight out to the live site.

## To add a project

Create a `.md` file here with four values. No code changes, no markup.

```yaml
---
title: Oasis Dental
url: https://oasisdental.com
order: 1
summary: One short paragraph on what we built and why.
image: /work/oasis-dental/preview.png   # optional
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Display name on the card |
| `url` | yes | Must be a full URL. Becomes the card's link and its label |
| `summary` | yes | The blurb. One paragraph, roughly 30 to 50 words |
| `order` | no | Lower numbers first. Defaults to `0` |
| `image` | no | Path under `public/`. Omit it and the card draws a placeholder |

The file body is not rendered. Leave it empty.

## Preview images

Drop a screenshot at `public/work/<slug>/preview.png` and point `image` at it.
Cards crop to a 16:10 frame from the top, so capture the full homepage at desktop
width and let the fold do the trimming.

Until an image exists, leave `image` off. The card renders the studio's gridded
placeholder, which is a designed state rather than a missing one.
