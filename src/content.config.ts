import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!README.md"], base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    location: z.string().optional(),
    industry: z.string().optional(),
    scope: z.string().default("Full Site"),
    price: z.number().default(4000),
    turnaround: z.string().optional(),
    launched: z.string().optional(),
    launchesIn: z.string().optional(),
    status: z.enum(["live", "build", "design", "discovery"]).default("live"),
    order: z.number().default(0),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    summary: z.string(),
    deck: z.string().optional(),
    accent: z.string().optional(),
    results: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          sub: z.string().optional(),
        }),
      )
      .default([]),
    quote: z
      .object({
        text: z.string(),
        cite: z.string(),
        role: z.string().optional(),
      })
      .optional(),
    process: z
      .array(
        z.object({
          day: z.string(),
          title: z.string(),
          body: z.string().optional(),
        }),
      )
      .default([]),
    brief: z
      .object({
        h: z.string(),
        body: z.array(z.string()),
      })
      .optional(),
    approach: z
      .object({
        h: z.string(),
        bullets: z.array(z.string()),
      })
      .optional(),
  }),
});

export const collections = { work };
