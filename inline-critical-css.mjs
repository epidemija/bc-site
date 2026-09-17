/**
 * Post-build step: inlines each page's above-the-fold ("critical") CSS
 * directly into its <head>, and defers the rest of the stylesheet so it no
 * longer blocks the first paint. Addresses Lighthouse's "Render-blocking
 * requests" finding on the page's main stylesheet without hand-picking CSS
 * rules by eye — beasties (the maintained successor to Google's own
 * `critters`) determines what's critical by actually checking which
 * selectors match elements in the rendered page, per HTML file.
 *
 * Runs after `astro build` (see the "build" script in package.json) and
 * rewrites every dist/**\/*.html file in place. Safe to re-run: it always
 * starts from the fresh, unmodified output astro build just produced.
 *
 * Rollback: if this ever needs to be undone, deleting this file and its
 * "&& node inline-critical-css.mjs" call in package.json's build script
 * restores the previous behaviour (a single blocking <link rel="stylesheet">
 * per page) — see archive/backups/2026-09-14-pre-critical-css/ for the
 * pre-change astro.config.mjs.
 */
import Beasties from "beasties";
import { globSync } from "node:fs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";

const beasties = new Beasties({
  path: DIST,
  // "swap" (beasties' usual default) needs an inline onload="" attribute to
  // flip the deferred <link> from preload to stylesheet once it's loaded —
  // and this site's CSP has no 'unsafe-inline' for scripts (script-src is a
  // strict allowlist of exact hashes, by design — see public/.htaccess).
  // Confirmed by testing against the real production CSP header: the
  // deferred stylesheet's onload handler is silently blocked by the browser,
  // so it never actually loads and every page below the first screenful
  // quietly loses its styling. "body" instead moves the plain
  // <link rel="stylesheet"> to the end of <body> — no inline JS at all, so
  // nothing for the CSP to block, and it still stops the stylesheet from
  // blocking first paint since it's no longer in <head>.
  preload: "body",
  compress: true,
  pruneSource: false,
  logLevel: "warn",
});

const htmlFiles = globSync(`${DIST}/**/*.html`);

if (htmlFiles.length === 0) {
  console.error(`[inline-critical-css] no HTML files found under ${DIST}/ — did astro build run first?`);
  process.exit(1);
}

let failures = 0;

for (const file of htmlFiles) {
  const original = readFileSync(file, "utf-8");
  try {
    const result = await beasties.process(original);
    writeFileSync(file, result, "utf-8");
  } catch (err) {
    failures++;
    console.error(`[inline-critical-css] FAILED on ${file}: ${err.message}`);
    // Leave the file exactly as astro build produced it — a page that still
    // has a normal blocking stylesheet is always safer than one beasties
    // left half-rewritten.
    writeFileSync(file, original, "utf-8");
  }
}

console.log(`[inline-critical-css] processed ${htmlFiles.length} page(s), ${failures} failure(s).`);

if (failures > 0) {
  process.exit(1);
}
