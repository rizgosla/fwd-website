// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://fwd.studio",
  output: "static",
  adapter: cloudflare(),
  integrations: [
    sitemap({
      // Filter out legal pages from the sitemap if you'd rather they not get
      // indexed prominently; default behavior is to include everything.
      // filter: (page) => !page.endsWith("/privacy") && !page.endsWith("/terms"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
