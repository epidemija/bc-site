// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = process.env.PUBLIC_SITE_URL || "https://bc-immowert.de";

export default defineConfig({
  // Drives canonical URLs, Open Graph URLs and sitemap.xml. Override per
  // environment with PUBLIC_SITE_URL.
  site: SITE,

  // Static output: every page is a real HTML file on disk. No server runtime,
  // no client-side routing, no JavaScript needed to see the content.
  output: "static",

  // Directory-style URLs with a trailing slash (/gutachten/), matching the
  // canonical URLs and the sitemap.
  trailingSlash: "always",
  build: {
    format: "directory",
    // Astro's own choice, per stylesheet: small CSS chunks get inlined
    // straight into the HTML (no separate request, so nothing blocks first
    // render for them); large chunks stay as a linked file so the browser
    // can cache it once across every page instead of re-downloading it with
    // every page's HTML. Added to address Lighthouse's "render-blocking
    // requests" finding on the page's main stylesheet.
    inlineStylesheets: "auto",
  },

  integrations: [
    sitemap({
      // Legal pages stay crawlable but do not belong in the sitemap, which
      // should list the pages worth ranking. /demo/ is noindex, and listing a
      // noindex URL in the sitemap is a contradiction Search Console flags.
      filter: (page) => !/\/(impressum|datenschutz|demo|danke)\//.test(page),
      changefreq: "monthly",
      lastmod: new Date(),
    }),
  ],

  image: {
    // Astro generates AVIF/WebP/JPEG derivatives at build time via sharp,
    // replacing the hand-written Python pipeline.
    layout: "constrained",
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Source maps would publish readable source; keep them out of dist.
      sourcemap: false,
    },
  },

  // Only PUBLIC_-prefixed variables reach the browser. Secrets must never use
  // that prefix.
  env: {
    schema: {},
  },
});
