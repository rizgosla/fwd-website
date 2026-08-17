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

  adapter: cloudflare(),
  // The form endpoint is the one non-page route; it has nothing to index.
  integrations: [sitemap({ filter: (page) => !page.includes("/api/") })]
});