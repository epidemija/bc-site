import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const browser = await chromium
  .launch({ executablePath: "/opt/pw-browsers/chromium" })
  .catch(() => chromium.launch());

const problems = [];
const note = (m) => problems.push(m);

/* ---------------------------------------------- 1. desktop, light + dark */
let page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await page.screenshot({ path: "v-desktop-light.png" });

// horizontal overflow check
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
if (overflow > 0) note(`horizontal overflow on desktop: ${overflow}px`);

// skip link must be the first tab stop and become visible
await page.keyboard.press("Tab");
await page.waitForTimeout(350);
const skip = await page.evaluate(() => {
  const el = document.activeElement;
  return { text: el?.textContent?.trim(), top: el?.getBoundingClientRect().top };
});
if (!skip.text?.includes("Zum Inhalt")) note(`first tab stop is not the skip link: ${skip.text}`);
if (skip.top < 0) note("skip link does not become visible on focus");

// dropdown keyboard behaviour
await page.evaluate(() => {
  document.querySelector("[data-dropdown-button]").focus();
});
await page.waitForTimeout(400);
const openAfterClick = await page.locator("header a:has-text('Marktgerechte')").isVisible();
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
const closedAfterEsc = !(await page.locator("header a:has-text('Marktgerechte')").isVisible());
if (!openAfterClick) note("dropdown does not open on keyboard focus");
if (!closedAfterEsc) note("Escape does not close the dropdown");

// slider controls
await page.evaluate(() => document.getElementById("leistungen").scrollIntoView({ block: "start" }));
await page.waitForTimeout(900);
await page.screenshot({ path: "v-slider.png" });
const before = await page.evaluate(() => document.getElementById("leistungen-track").scrollLeft);
await page.click("[data-slider-next]");
await page.waitForTimeout(900);
const after = await page.evaluate(() => document.getElementById("leistungen-track").scrollLeft);
if (after <= before) note("slider next button did not scroll the track");

// dark theme
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.click("[data-theme-toggle]");
await page.waitForTimeout(600);
const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
if (!isDark) note("dark theme toggle did not apply the .dark class");
await page.evaluate(() => document.getElementById("leistungen").scrollIntoView({ block: "start" }));
await page.waitForTimeout(900);
await page.screenshot({ path: "v-slider-dark.png" });

// footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1800);
await page.screenshot({ path: "v-footer-dark.png" });
await page.close();

/* --------------------------------------------------------- 2. mobile */
page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
const mOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
if (mOverflow > 0) note(`horizontal overflow on mobile: ${mOverflow}px`);
await page.screenshot({ path: "v-mobile.png", fullPage: false });
await page.click("[data-menu-button]");
await page.waitForTimeout(500);
await page.screenshot({ path: "v-mobile-menu.png" });

// The mobile menu is a full-screen panel: it must actually cover the viewport,
// lock the page behind it, and close from its own cross.
const panel = await page.evaluate(() => {
  const el = document.getElementById("mobile-navigation");
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  return {
    w: Math.round(r.width),
    h: Math.round(r.height),
    top: Math.round(r.top),
    left: Math.round(r.left),
    bg: s.backgroundColor,
    z: s.zIndex,
    locked: getComputedStyle(document.documentElement).overflow,
  };
});
if (panel.w < 390 || panel.h < 800 || panel.top !== 0 || panel.left !== 0)
  note(`mobile menu does not cover the viewport: ${JSON.stringify(panel)}`);
if (/rgba\(.*,\s*0\)/.test(panel.bg) || panel.bg === "transparent")
  note(`mobile menu background is transparent (${panel.bg})`);
if (Number(panel.z) < 50) note(`mobile menu sits below the header (z-index ${panel.z})`);
if (panel.locked !== "hidden") note(`page behind the mobile menu still scrolls (${panel.locked})`);
if (!(await page.isVisible("[data-menu-close]"))) note("mobile menu has no visible close button");


await page.click("[data-menu-close]");
await page.waitForTimeout(300);
if (await page.isVisible("#mobile-navigation")) note("mobile menu did not close");
if (await page.evaluate(() => getComputedStyle(document.documentElement).overflow === "hidden"))
  note("page scroll stayed locked after closing the mobile menu");
// Swiping is invisible, so the phone layout carries its own slider controls.
const mobileNext = page.locator("[data-slider-next]:visible");
if ((await mobileNext.count()) === 0) note("no visible slider control on mobile");
else {
  const b4 = await page.evaluate(() => document.getElementById("leistungen-track").scrollLeft);
  await mobileNext.first().click();
  await page.waitForTimeout(900);
  const aft = await page.evaluate(() => document.getElementById("leistungen-track").scrollLeft);
  if (aft <= b4) note("mobile slider control did not scroll the track");
}
await page.click("[data-menu-button]");
await page.waitForTimeout(400);

// touch target sizes (WCAG 2.5.8 minimum 24x24; 44x44 recommended)
const small = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("a, button").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width < 24 || r.height < 24)
      out.push(`${el.tagName}"${(el.textContent || el.ariaLabel || "").trim().slice(0, 28)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  return out;
});
if (small.length) note(`touch targets under 24px: ${small.join(" | ")}`);
await page.close();

/* -------------------------------------------------- 3. JavaScript disabled */
const noJs = await browser.newContext({ javaScriptEnabled: false });
const p2 = await noJs.newPage({ viewport: { width: 1280, height: 900 } });
await p2.goto(BASE, { waitUntil: "domcontentloaded" });
await p2.waitForTimeout(1200);
await p2.screenshot({ path: "v-nojs.png" });
const noJsText = await p2.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
for (const probe of ["Willkommen bei", "Immobilienbewertung", "Otto-Hess-Strasse"]) {
  if (!noJsText.includes(probe)) note(`content missing without JS: "${probe}"`);
}
const h1NoJs = await p2.evaluate(() => document.querySelectorAll("h1").length);
if (h1NoJs !== 1) note(`expected exactly 1 h1 without JS, found ${h1NoJs}`);
await noJs.close();

/* ------------------------------------------- 4. every page, structurally */
for (const path of [
  "/",
  "/uber-uns/",
  "/gutachten/",
  "/gutachten/immobilienbewertung/",
  "/gutachten/bauschadenbewertung/",
  "/ingenieurleistungen/",
  "/ingenieurleistungen/energetische-modernisierung/",
  "/ingenieurleistungen/einzelmodernisierung/",
  "/dienstleistungen/",
  "/dienstleistungen/an-und-verkaufsberatung/",
  "/dienstleistungen/aufmass/",
  "/dienstleistungen/digitale-grundrisse/",
  "/dienstleistungen/flachenberechnungen/",
]) {
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(`${path} ${e.message}`));
  await pg.goto(BASE + path, { waitUntil: "networkidle" });
  await pg.waitForTimeout(1200);

  const info = await pg.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    main: document.querySelectorAll("main").length,
    header: document.querySelectorAll("header").length,
    footer: document.querySelectorAll("footer").length,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content?.length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    dupIds: (() => {
      const seen = new Set(), dup = [];
      document.querySelectorAll("[id]").forEach((el) => {
        if (seen.has(el.id)) dup.push(el.id);
        seen.add(el.id);
      });
      return dup;
    })(),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));

  if (info.h1 !== 1) note(`${path}: expected 1 h1, found ${info.h1}`);
  if (info.main !== 1) note(`${path}: expected 1 main, found ${info.main}`);
  if (info.header !== 1) note(`${path}: expected 1 header, found ${info.header}`);
  if (info.footer !== 1) note(`${path}: expected 1 footer, found ${info.footer}`);
  if (!info.canonical) note(`${path}: missing canonical`);
  // Google truncates around 60 characters of title and 160 of description; the
  // upper bounds are what actually gets cut off in the results page.
  if (!info.title || info.title.length < 20) note(`${path}: title too short`);
  if (info.title && info.title.length > 65)
    note(`${path}: title ${info.title.length} chars, over the 65 limit`);
  if (!info.desc || info.desc < 80) note(`${path}: description too short`);
  if (info.desc > 165) note(`${path}: description ${info.desc} chars, over the 165 limit`);
  if (info.jsonLd !== 1) note(`${path}: expected 1 JSON-LD block, found ${info.jsonLd}`);
  if (info.imgsNoAlt) note(`${path}: ${info.imgsNoAlt} image(s) without an alt attribute`);
  if (info.dupIds.length) note(`${path}: duplicate ids: ${info.dupIds.join(", ")}`);
  if (info.overflow > 0) note(`${path}: horizontal overflow ${info.overflow}px`);
  if (errs.length) note(errs.join(" | "));

  // Encoding. A German site that is decoded as latin-1 shows "Aufma\u00c3\u009f" instead
  // of "Aufma\u00df", so both the declared encoding and real umlauts are checked.
  const enc = await pg.evaluate(() => ({
    charset: document.characterSet,
    text: document.body.innerText,
  }));
  if (enc.charset.toUpperCase() !== "UTF-8") note(`${path}: document encoding is ${enc.charset}`);
  for (const bad of ["\u00c3\u00a4", "\u00c3\u00b6", "\u00c3\u00bc", "\u00c3\u009f", "\u00e2\u0080\u0093", "\ufffd"]) {
    if (enc.text.includes(bad)) note(`${path}: mojibake in rendered text ("${bad}")`);
  }
  const umlauts =
    path === "/"
      ? ["Sachverst\u00e4ndigenb\u00fcro", "Aufma\u00df"]
      : path === "/gutachten/"
        ? ["Bauschadensgutachten", "Ha\u00dfloch", "W\u00f6rth am Rhein"]
        : path === "/gutachten/immobilienbewertung/"
          ? ["Verkehrswertgutachten", "Verm\u00f6gensaufteilung", "Objektbesichtigung"]
          : path === "/gutachten/bauschadenbewertung/"
            ? ["Bausch\u00e4den", "Feuchtigkeit", "Ma\u00dfnahmen"]
            : path === "/ingenieurleistungen/"
              ? ["Nutzungs\u00e4nderungen", "Ha\u00dfloch", "Grundrisse"]
              : path === "/ingenieurleistungen/energetische-modernisierung/"
                ? ["Geb\u00e4udetechnik", "F\u00f6rdermitteln", "Marktg\u00e4ngigkeit"]
                : path === "/ingenieurleistungen/einzelmodernisierung/"
                  ? ["Einzelma\u00dfnahmen", "Wohnkomfort", "Handwerkern"]
                  : path === "/dienstleistungen/"
                    ? ["Wohnfl\u00e4chenberechnungen", "Ha\u00dfloch", "Energieberatern"]
                    : path === "/dienstleistungen/an-und-verkaufsberatung/"
                      ? ["Preisverhandlungen", "Bauchgef\u00fchl", "Fehleinsch\u00e4tzungen"]
                      : path === "/dienstleistungen/aufmass/"
                        ? ["Scanverfahren", "Plausibilisierung", "bewohnten"]
                        : path === "/dienstleistungen/digitale-grundrisse/"
                          ? ["Exposés", "Vermarktungsunterlagen", "Handwerkern"]
                          : path === "/dienstleistungen/flachenberechnungen/"
                            ? ["Beleihungspr\u00fcfungen", "Wohnfl\u00e4chenverordnung", "DIN 277"]
        : ["\u00dcber uns", "Fl\u00e4chenberechnungen"];
  for (const w of umlauts) {
    if (!enc.text.includes(w)) note(`${path}: expected "${w}" in the rendered text`);
  }

  // The header must turn opaque once scrolled, otherwise text sits on text.
  await pg.evaluate(() => window.scrollTo(0, 900));
  await pg.waitForTimeout(600);
  const scrolled = await pg.evaluate(() => {
    const h = document.querySelector("[data-header]");
    const cs = getComputedStyle(h);
    return { has: h.classList.contains("is-scrolled"), bg: cs.backgroundColor, blur: cs.backdropFilter };
  });
  if (!scrolled.has) note(`${path}: header did not gain is-scrolled`);
  if (scrolled.bg === "rgba(0, 0, 0, 0)") note(`${path}: scrolled header is fully transparent`);
  if (!scrolled.blur || scrolled.blur === "none") note(`${path}: scrolled header has no blur`);

  await pg.close();
}

/* ---------------------------------------------- 5. JavaScript weight */
const ctxW = await browser.newContext();
const pw = await ctxW.newPage();
let jsBytes = 0;
pw.on("response", async (r) => {
  if (r.request().resourceType() === "script") {
    try { jsBytes += (await r.body()).length; } catch {}
  }
});
await pw.goto(BASE, { waitUntil: "networkidle" });
await ctxW.close();
console.log(`external JS downloaded: ${jsBytes} bytes`);

/* ------------------------------------------------------- 6. Rechtstexte
 * The Impressum and Datenschutzerklärung make factual claims about this site.
 * These checks hold the code to them, so the two cannot silently drift apart —
 * and so the site cannot be deployed with a gap in the Impressum, which in
 * Germany is what earns a business an Abmahnung.
 */
const builtPages = globSync("dist/**/index.html").filter((f) => !f.includes("/demo/"));
const allHtml = builtPages.map((f) => readFileSync(f, "utf8")).join("");

// 6a. No unfilled legal field may reach production.
for (const path of ["impressum", "datenschutz", "kontakt"]) {
  const html = readFileSync(join("dist", path, "index.html"), "utf8");
  const todos = [...html.matchAll(/FEHLT: ([^<]+)</g)].map((m) => m[1]);
  if (todos.length) {
    note(
      `/${path}/ hat ${todos.length} unausgefüllte Pflichtangabe(n): ${todos.join(", ")}` +
        " — in src/config/site.ts unter `legal` eintragen."
    );
  }
}

// 6b. The Datenschutzerklärung promises no third-party requests. Prove it.
for (const [needle, label] of [
  ["fonts.googleapis.com", "Google Fonts"],
  ["fonts.gstatic.com", "Google Fonts"],
  ["google-analytics.com", "Google Analytics"],
  ["googletagmanager.com", "Google Tag Manager"],
  ["connect.facebook.net", "Meta Pixel"],
  ["cdn.jsdelivr.net", "externes CDN"],
  ["cdnjs.cloudflare.com", "externes CDN"],
]) {
  if (allHtml.includes(needle)) {
    note(
      `${label} gefunden (${needle}). Die Datenschutzerklärung sagt zu, dass keine ` +
        "Drittanbieter eingebunden sind — entfernen, oder Erklärung anpassen und " +
        "Cookie-Banner prüfen."
    );
  }
}

// 6b2. The map must not load on page open. No openstreetmap URL may sit in a
//      loading position (src/href of an element the browser fetches); it may
//      only appear as a string the click handler uses, plus the plain link.
{
  const kontaktHtml = readFileSync("dist/kontakt/index.html", "utf8");
  if (/<iframe[^>]+openstreetmap/i.test(kontaktHtml)) {
    note(
      "Die Kontaktseite lädt OpenStreetMap direkt in einem <iframe>. " +
        "Die Datenschutzerklärung (Abschnitt 11) sagt zu, dass die Karte erst " +
        "nach einem Klick geladen wird — sonst ist ein Consent-Banner nötig."
    );
  }
}

// 6c. Section 10 names exactly one stored key. Nothing else may be stored.
const storageKeys = new Set(
  [...allHtml.matchAll(/localStorage\.\w+\(\s*[`"']([^`"']+)/g)].map((m) => m[1])
);
const ALLOWED_STORAGE_KEYS = new Set(["bc-theme", "bc-consent-external"]);
for (const key of storageKeys) {
  if (!ALLOWED_STORAGE_KEYS.has(key)) {
    note(
      `localStorage-Schlüssel "${key}" gefunden; die Datenschutzerklärung nennt nur ` +
        "`bc-theme` (Abschnitt 10) und `bc-consent-external` (Abschnitt 9) — Text anpassen " +
        "oder Schlüssel entfernen."
    );
  }
}

// 6d. The contact form must keep the parts the privacy text describes.
const kontakt = readFileSync("dist/kontakt/index.html", "utf8");
if (!kontakt.includes('name="einwilligung"')) note("Kontaktformular ohne Datenschutz-Checkbox.");
if (!kontakt.includes('name="website"')) note("Kontaktformular ohne Honeypot-Feld.");
if (!/<form[^>]+action="[^"]+"/.test(kontakt)) note("Kontaktformular ohne action-Ziel.");

/* ------------------------------------------------------------- report */
if (consoleErrors.length) note(`console errors: ${consoleErrors.slice(0, 4).join(" | ")}`);

await browser.close();
if (problems.length) {
  console.log("ISSUES:\n - " + problems.join("\n - "));
  process.exitCode = 1; // so `npm run build && node verify.mjs` gates a deploy
} else {
  console.log("All checks passed.");
}
