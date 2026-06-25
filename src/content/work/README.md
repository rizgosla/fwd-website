# Work case studies

Each markdown file in this directory is one project on `/work`. Live projects get a card on the index page and their own detail page at `/work/[slug]`. In-progress projects (status `build` / `design` / `discovery`) just get a card with a status badge.

## To add a new project

1. Create a new `.md` file here. Filename becomes the URL slug (`oasis-dental.md` → `/work/oasis-dental`).
2. Fill in the frontmatter. Required: `title`, `client`, `summary`. Everything else is optional but recommended for live projects.
3. Put long-form prose (extra "why this mattered", retrospectives) in the markdown body.

## Frontmatter reference

```yaml
title: Oasis Dental                   # required — display name
client: Oasis Family Dental           # required — full client name
summary: One-sentence description.    # required — shown on the index card
location: Irvine, CA
industry: Healthcare · Dental
scope: Full Site                      # default "Full Site"
price: 4000                           # number, no $ sign
turnaround: 9 business days
launched: March 2026                  # for status: live
launchesIn: June 2026                 # for status: build / design / discovery
status: live                          # live | build | design | discovery
order: 1                              # lower numbers appear first
url: https://oasisdental.com
repo: https://github.com/example/site # optional — useful for the next step

deck: |
  Longer hero deck shown on the detail page. Inline HTML
  like <em>italics</em> is allowed.

brief:
  h: Headline for the brief section.
  body:
    - One paragraph per line.
    - Another paragraph.

approach:
  h: Headline for the approach section.
  bullets:
    - First decision we made.
    - Second decision we made.

results:
  - label: Booking inquiries
    value: 3.2×
    sub: vs. the same 30-day window last year.

quote:
  text: A pull quote from the client.
  cite: Dr. Mei Smith
  role: Owner

process:
  - day: Day 1
    title: Intro call
    body: Optional detail.
```

## Building a case study from a repo

If a project has a `repo` field, the easiest way to draft a case study is to point Claude at the repo and ask:

> Read the repository at `<repo URL>` and fill out `src/content/work/<slug>.md` with the appropriate frontmatter and prose. Use the existing `oasis-dental.md` as the template.

Claude will inspect the repo's commits, README, and structure to fill in the scope, results, process, and prose. Review and adjust the draft, then ship.
