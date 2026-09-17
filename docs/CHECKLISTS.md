# Checklists

## A. New subpage checklist

Run through this before every new page goes live.

### Registration
- [ ] Route added to `routes` in `src/config/site.ts`
- [ ] Entry added to `PAGES` in `src/config/pages.ts`
- [ ] Page rendered by `src/entry-server.tsx` (so it is prerendered)
- [ ] Linked from the header, footer or a parent page — no orphans
- [ ] Appears in `dist/sitemap.xml` after `npm run build`

### Metadata
- [ ] Title unique across the site, ~50–60 characters
- [ ] Description unique across the site, ~140–160 characters, describes *this* page
- [ ] Canonical URL is self-referencing and uses the HTTPS apex domain
- [ ] `robots` correct (`index, follow` unless there is a documented reason)
- [ ] OG image exists at 1200×630 with meaningful `og:image:alt`

### Structure
- [ ] Exactly one `<h1>`, and it describes the page
- [ ] Heading levels descend without skipping
- [ ] One `<header>`, one `<main id="inhalt">`, one `<footer>`
- [ ] Skip link present and first in tab order
- [ ] Sections labelled with `aria-labelledby`

### Content
- [ ] Facts are true and match `site.ts`
- [ ] Plain German, no unverifiable claims
- [ ] No important text locked inside images
- [ ] Internal links to related pages, with descriptive anchor text

### Structured data
- [ ] Uses `subpageSchema()`; describes only what is on the page
- [ ] Breadcrumbs set for any page below the homepage
- [ ] No reviews, ratings or FAQ schema without real, visible content
- [ ] Validates in Google's Rich Results Test

### Images
- [ ] Every photograph uses `<ResponsiveImage>`
- [ ] Derivatives generated (`npm run assets`)
- [ ] Exactly one `priority` image (the LCP), all others lazy
- [ ] Meaningful `alt`, or `alt=""` if decorative

### Accessibility
- [ ] Fully operable by keyboard; focus always visible
- [ ] Touch targets ≥ 44 px
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text) in both themes
- [ ] Works with `prefers-reduced-motion: reduce`

### Verification
- [ ] `npm run check` passes (TypeScript)
- [ ] `npm run build` succeeds
- [ ] `node verify.mjs` reports "All checks passed"
- [ ] Content visible with JavaScript disabled
- [ ] No horizontal scrollbar at 390 px, 768 px, 1440 px

---

## B. Deployment checklist

### Before the first deploy
- [ ] `PUBLIC_SITE_URL` set in `.env` before the build (baked into the build, no host-side env step on cPanel)
- [ ] Only the *contents* of `dist/` are published as `public_html/` — not the `dist/` folder itself
- [ ] Security headers active (`public/.htaccess` — becomes `dist/.htaccess` on build, see docs/SECURITY.md)
- [ ] Contact-form API (`server/`) set up as its own cPanel Node.js App and reachable (`GET /api/kontakt` returns `{"ok":true,...}`)
- [ ] HTTPS enforced; HSTS enabled
- [ ] One canonical host — decide www vs apex and 301 the other, single hop
- [ ] Custom 404 returns a real HTTP 404, not 200
- [ ] `.env`, `.git`, `src`, `docs`, `*.zip`, `*.map` all return 404 (see docs/SECURITY.md)
- [ ] Directory listing disabled; server version header suppressed

### After the deploy
- [ ] `https://bc-immowert.de/robots.txt` loads and lists the sitemap
- [ ] `https://bc-immowert.de/sitemap.xml` loads and contains only live URLs
- [ ] `https://bc-immowert.de/llms.txt` loads
- [ ] `https://bc-immowert.de/favicon.ico` and `/site.webmanifest` load
- [ ] Sharing the URL on WhatsApp/LinkedIn shows the OG image

### Google Search Console (manual, after go-live)
- [ ] Add the property (DNS verification preferred over an HTML tag)
- [ ] Submit `https://bc-immowert.de/sitemap.xml`
- [ ] Run URL Inspection on the homepage → "URL is on Google"
- [ ] Check Coverage for excluded pages
- [ ] Check Core Web Vitals after ~28 days of field data
- [ ] Confirm the correct canonical is reported

### Validation tools (run and record results — do not assume a pass)
- [ ] Rich Results Test → structured data valid
- [ ] Schema Markup Validator → no errors
- [ ] PageSpeed Insights (mobile + desktop)
- [ ] Lighthouse: Performance / Accessibility / Best Practices / SEO
- [ ] W3C HTML validator on the deployed URL
- [ ] Mobile-Friendly check
- [ ] `securityheaders.com` scan
- [ ] `ssllabs.com` SSL test

### Before adding analytics or any embed
- [ ] Privacy policy updated to name the service and the data it collects
- [ ] Consent gate implemented — nothing loads before opt-in
- [ ] CSP extended for the specific host only
- [ ] Documented in `docs/AI-CRAWLER-POLICY.md` §4 and `docs/SECURITY.md` §6
