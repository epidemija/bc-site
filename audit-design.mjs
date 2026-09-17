/**
 * Static design-system audit, run against dist/ after a build.
 *
 * This is the regression net for the visual system: it fails if a raw hex
 * value, a stray grey, an off-scale radius or a hand-rolled button ever gets
 * added back. It reads the built HTML and CSS rather than the source, so it
 * also catches anything a component injects at build time.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d, out = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const all = walk("dist");
// 404.html is served by the host outside the Astro build, so it cannot import
// the stylesheet and carries a hand-kept copy of the tokens. It is audited
// separately, against the real ones.
const html = all.filter(
  (f) => f.endsWith(".html") && !f.includes("/demo/") && !f.endsWith("404.html")
);
const css = all.filter((f) => f.endsWith(".css"));
// Astro inlines scoped component <style> blocks into each page rather than the
// shared bundle, so auditing only the .css files misses them entirely — that is
// how four retired "Inter Tight" declarations survived inside the SVG diagram
// styles. Scan both.
const inlineStyles = html
  .map((f) => [...readFileSync(f, "utf8").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n"))
  .join("\n");
const cssText = (css.map((f) => readFileSync(f, "utf8")).join("\n") + "\n" + inlineStyles)
  .replace(/\/\*[\s\S]*?\*\//g, "");

const fail = [];
const pass = [];
const check = (name, ok, detail = "") => (ok ? pass : fail).push(name + (detail ? ` — ${detail}` : ""));

/* ---------------------------------------------------------- typography */
check("Manrope @font-face is present", /@font-face[^}]*Manrope/s.test(cssText));
check("Inter @font-face is present", /@font-face[^}]*font-family:\s*Inter/s.test(cssText));
check(
  "no remote font origin",
  !/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit|cdn\.jsdelivr/.test(cssText + html.map((f) => readFileSync(f, "utf8")).join(""))
);
check("retired faces are gone", !/Bricolage|Inter Tight/.test(cssText));

/* ------------------------------------------------------ letter-spacing */
const spacing = [...cssText.matchAll(/letter-spacing:\s*(-?[\d.]+)em/g)].map((m) => parseFloat(m[1]));
const loose = spacing.filter((v) => v > 0.045);
check("no letter-spacing above 0.04em", loose.length === 0, loose.length ? `found ${[...new Set(loose)].join(", ")}em` : "");

let inlineTrack = 0;
for (const f of html) {
  const s = readFileSync(f, "utf8");
  inlineTrack += (s.match(/tracking-\[0\.(?:0[5-9]|1|15|2|25)em\]/g) || []).length;
}
check("no wide tracking utilities in markup", inlineTrack === 0, inlineTrack ? `${inlineTrack} left` : "");

/* -------------------------------------------------------------- colour */
/* Palette drift check. White and black overlay alphas (rgb(255 255 255 / .04)
   on a dark band, and the like) are a legitimate technique and get a pass; what
   must never appear is a brand or neutral value written out by hand instead of
   read from a token.
   inline-critical-css.mjs (beasties) copies each page's critical CSS —
   including every token's real hex value — into a <head><style> block, so
   this check (like the "text ramp" one below) must strip <style> blocks the
   same way it already strips <script>, or every token definition beasties
   duplicated into the head reads as a hand-written hex value. The .css files
   and the <style> blocks are audited on their own via cssText above; this
   check only cares about hex values written directly in markup attributes
   (style="", etc.), which is why both must come out first. */
let rawHex = [];
for (const f of html) {
  const s = readFileSync(f, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
  const body = s.replace(/<meta[^>]*>/g, ""); // theme-color is config, not styling
  for (const m of body.matchAll(/#([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?\b/g)) {
    const hex = m[1].toLowerCase();
    if (hex === "ffffff" || hex === "000000") continue; // overlay alphas
    rawHex.push("#" + hex);
  }
}
rawHex = [...new Set(rawHex)];

check("no hardcoded palette values in markup", rawHex.length === 0, rawHex.join(" "));

// Count each --bc-ink-N declaration once per theme, not once per place it
// physically appears — beasties (see comment above) copies the same
// declaration into every page's inlined critical CSS, so counting raw
// matches across cssText now overcounts by however many pages inline it.
const greys = [...new Set([...cssText.matchAll(/--bc-ink[a-z-]*:\s*(#[0-9a-f]{3,6})/g)].map((m) => m[0]))];
check("text ramp is exactly four steps per theme", greys.length === 8, `${greys.length} declared`);

/* -------------------------------------------------------------- radius */
const radii = new Set([...cssText.matchAll(/border-radius:\s*(\d+)px/g)].map((m) => m[1]));
const allowed = new Set(["0", "1", "2", "4", "8", "2147483647" /* rounded-full */]);
const off = [...radii].filter((r) => !allowed.has(r));
check("radius values stay on the scale", off.length === 0, off.length ? `${off.join("px, ")}px` : "");

/* ------------------------------------------------------------- buttons */
let handRolled = 0;
let buttons = 0;
for (const f of html) {
  const s = readFileSync(f, "utf8");
  buttons += (s.match(/class="[^"]*bc-btn/g) || []).length;
  // an old-style gold CTA that never went through Button.astro
  handRolled += (s.match(/class="[^"]*bg-accent-solid[^"]*px-\d/g) || []).length;
}
check("every gold CTA uses the Button component", handRolled === 0, handRolled ? `${handRolled} hand-rolled` : "");
check("buttons are present in the output", buttons > 0, `${buttons} rendered`);

/* ------------------------------------------------- one icon on all CTAs */
let ctaIconMismatch = 0;
for (const f of html) {
  const s = readFileSync(f, "utf8");
  for (const btn of s.match(/<a[^>]*class="[^"]*bc-btn[^"]*"[\s\S]*?<\/a>|<button[^>]*class="[^"]*bc-btn[^"]*"[\s\S]*?<\/button>/g) || []) {
    if (!btn.includes("bc-btn-ghost") && !/M7 7l10 10/.test(btn)) ctaIconMismatch++;
  }
}
check("every CTA carries the same arrow-dr", ctaIconMismatch === 0, ctaIconMismatch ? `${ctaIconMismatch} without it` : "");

/* --------------------------------------------------------- form system */
const kontakt = html.find((f) => f.includes("kontakt"));
if (kontakt) {
  const s = readFileSync(kontakt, "utf8");
  const fields = (s.match(/class="bc-input"/g) || []).length;
  check("contact form fields use the shared input class", fields >= 5, `${fields} fields`);
  check("consent checkbox still present", /name="einwilligung"/.test(s));
}

/* ------------------------------------------------------ section rhythm */
let sections = 0, tokenised = 0;
for (const f of html) {
  const s = readFileSync(f, "utf8");
  sections += (s.match(/<section/g) || []).length;
  tokenised += (s.match(/class="[^"]*bc-section/g) || []).length;
}
check("section padding comes from the rhythm scale", tokenised >= 15, `${tokenised} of ${sections} sections`);

/* ------------------------------------------------------- FAQ accordions */
{
  let toggles = 0, panels = 0, brokenPair = 0, openPerGroup = [], missingRegion = 0;
  const visibleQuestions = new Map(); // page -> Set of question text
  for (const f of html) {
    const src = readFileSync(f, "utf8");
    const qs = new Set();

    for (const m of src.matchAll(/<button[^>]*data-accordion-toggle[^>]*>/g)) {
      toggles++;
      const tag = m[0];
      const controls = /aria-controls="([^"]+)"/.exec(tag)?.[1];
      const id = /id="([^"]+)"/.exec(tag)?.[1];
      if (!/aria-expanded="(true|false)"/.test(tag)) brokenPair++;
      // the panel it names must actually exist, and must point back
      if (!controls || !src.includes(`id="${controls}"`)) brokenPair++;
      if (!id || !src.includes(`aria-labelledby="${id}"`)) brokenPair++;
    }

    for (const m of src.matchAll(/<div[^>]*class="bc-accordion__panel"[^>]*>/g)) {
      panels++;
      if (!/role="region"/.test(m[0]) || !/aria-labelledby="/.test(m[0])) missingRegion++;
    }

    for (const m of src.matchAll(/<span class="bc-accordion__question">([\s\S]*?)<\/span>/g)) {
      qs.add(m[1].trim());
    }
    if (qs.size) visibleQuestions.set(f, qs);

    // One open item at most, per accordion group. Astro merges class:list, so
    // the wrapper reads class="bc-accordion mt-10 …" — match the token, not the
    // whole attribute, or this check passes without testing anything.
    for (const g of src.split(/<div class="bc-accordion[ "]/).slice(1)) {
      const body = g.split("</section>")[0];
      openPerGroup.push((body.match(/data-accordion-item data-open/g) || []).length);
    }
  }

  check("accordion toggles pair with their panels", brokenPair === 0, brokenPair ? `${brokenPair} broken aria references` : "");
  check("accordion panels are labelled regions", missingRegion === 0, missingRegion ? `${missingRegion} without role/label` : "");
  check("toggle and panel counts match", toggles === panels, `${toggles} toggles / ${panels} panels`);
  check(
    "never more than one answer open per group",
    openPerGroup.length > 0 && openPerGroup.every((n) => n <= 1),
    openPerGroup.length ? `${openPerGroup.length} groups, max ${Math.max(...openPerGroup)} open` : "no groups found — check the selector"
  );

  /* The check that matters most: Google penalises FAQ structured data that
     does not match what the visitor sees. Every question in a page's FAQPage
     node must be a question actually rendered on that page. */
  let drift = [];
  for (const f of html) {
    const src = readFileSync(f, "utf8");
    const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const block of ld) {
      let graph;
      try { graph = JSON.parse(block[1]); } catch { continue; }
      const nodes = graph["@graph"] || [graph];
      for (const node of nodes) {
        if (node["@type"] !== "FAQPage") continue;
        const shown = visibleQuestions.get(f) || new Set();
        for (const q of node.mainEntity || []) {
          if (!shown.has(q.name)) drift.push(`${f}: "${q.name.slice(0, 40)}…"`);
        }
      }
    }
  }
  check("FAQ structured data matches the visible questions", drift.length === 0, drift.slice(0, 3).join(" | "));

  const faqPage = all.find((f) => f.endsWith("faq/index.html"));
  if (faqPage) {
    const src = readFileSync(faqPage, "utf8");
    check("every FAQ answer is in the HTML, not loaded later",
      (src.match(/class="bc-accordion__answer"/g) || []).length === (src.match(/data-accordion-item/g) || []).length);
    check("FAQ categories are linkable sections",
      (src.match(/data-faq-link/g) || []).length >= 8,
      `${(src.match(/data-faq-link/g) || []).length} nav links`);
  }
}

/* ------------------------------------ heading weights are not overridden */
let overridden = 0;
for (const f of html) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/<h[1-4][^>]*class="([^"]*)"/g)) {
    if (/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/.test(m[1])) overridden++;
  }
}
check(
  "heading weights come from the type scale",
  overridden === 0,
  overridden ? `${overridden} headings override it with a utility class` : ""
);

/* ------------------------------------------- both themes define the ramp */
{
  const light = [...cssText.matchAll(/:root\s*{([^}]*)}/g)].map((m) => m[1]).join("");
  const dark = [...cssText.matchAll(/\.dark\s*{([^}]*)}/g)].map((m) => m[1]).join("");
  const names = (block) => new Set([...block.matchAll(/(--bc-[a-z-]+):/g)].map((m) => m[1]));
  const lightNames = names(light);
  const darkNames = names(dark);
  // Tokens that are intentionally theme-independent (scale, motion, geometry).
  const shared = /^--bc-(scrim|gold|blue-hover)/;
  const missing = [...lightNames].filter(
    (n) => !darkNames.has(n) && /(page|surface|ink|border|accent|danger)/.test(n) && !shared.test(n)
  );
  check("dark theme redefines every colour token", missing.length === 0, missing.join(" "));
}

/* ---------------------------------------------- 404 token copy in sync */
{
  const src = readFileSync("src/styles/global.css", "utf8");
  const page404 = readFileSync("dist/404.html", "utf8");
  const drift = [];
  for (const token of [
    "--bc-page", "--bc-ink", "--bc-ink-secondary", "--bc-accent",
    "--bc-accent-solid", "--bc-accent-solid-hover", "--bc-accent-deco",
  ]) {
    const want = new RegExp(`\\${token}:\\s*([^;]+);`).exec(src)?.[1].trim();
    const got = new RegExp(`\\${token}:\\s*([^;]+);`).exec(page404)?.[1].trim();
    if (want && got && want.split("/*")[0].trim() !== got.split("/*")[0].trim()) {
      drift.push(`${token} ${got} != ${want}`);
    }
    if (want && !got) drift.push(`${token} missing from 404`);
  }
  check("404 page's token copy matches global.css", drift.length === 0, drift.join("; "));
  check("404 page uses the site's two faces", /Manrope/.test(page404) && /"Inter"/.test(page404));
  check("404 buttons match the button geometry", /min-height:\s*3\.25rem/.test(page404));
}

/* -------------------------------------------------------------- report */
console.log(`\n  Pages audited: ${html.length}\n`);
for (const p of pass) console.log(`  ✓ ${p}`);
for (const f of fail) console.log(`  ✗ ${f}`);
console.log(`\n  ${pass.length} passed, ${fail.length} failed\n`);
process.exit(fail.length ? 1 : 0);
