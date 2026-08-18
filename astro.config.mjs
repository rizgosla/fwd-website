// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://fwddesignconsulting.com',

  vite: {
    plugins: [tailwindcss()],
  },

  // Cloudflare's runtime has no sharp, so images cannot be optimised on
  // request. "compile" does the work at BUILD time instead, which is all this
  // site needs — every page that carries an image is prerendered. Without it,
  // the work shots would ship at whatever size they were dropped in at.
  adapter: cloudflare({ imageService: "compile" }),
  // The form endpoint is the one non-page route; it has nothing to index.
  // /preview/* is design scaffolding — real routes, but linked from nowhere, so
  // the sitemap would be their only route to a crawler. Keep it closed.
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/api/") && !page.includes("/preview/"),
    }),
  ]
});