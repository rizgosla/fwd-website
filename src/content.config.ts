import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* One project on /work is four values: a title, a link to the live site, a
   blurb, and an optional preview image. Cards render from these directly —
   there is no detail page, so there is nothing else to carry. */
const work = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!README.md"], base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    summary: z.string(),
    /** Path under /public, e.g. "/work/oasis-dental/preview.png". Omit and the
     *  card draws its placeholder instead. */
    image: z.string().optional(),
    order: z.number().default(0),
    /** "client" (default) is shipped work for a paying client. "mockup" is a
     *  self-directed redesign of an existing site, not commissioned work.
     *  "in-progress" is commissioned work that has not launched yet — the
     *  linked site is still the old one. Anything but "client" gets a badge,
     *  so a visitor is never told a project is finished when it isn't. */
    kind: z.enum(["client", "mockup", "in-progress"]).default("client"),
  }),
});

export const collections = { work };
