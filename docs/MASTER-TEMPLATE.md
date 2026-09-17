# BC IMMOWERT — Master Template

The homepage is the reference implementation. Every future page follows the
rules below. Nothing here is stylistic preference: each rule exists because
breaking it causes a measurable SEO, accessibility, performance or security
problem.

---

## 1. Architecture

Astro, static output. Every page is a real HTML file; the browser downloads
**no framework**. Interactivity is one small progressive-enhancement script.

```
src/
  config/
    site.ts          Business facts, routes, absolute-URL helper.  SINGLE SOURCE OF TRUTH
    pages.ts         SEO registry — one entry per page
    navigation.ts    Header / footer link structure
    services.ts      Service data (slider + schema + llms.txt)
  seo/
    head.ts          Builds <head> (title, description, canonical, OG, Twitter, icons)
    schema.ts        JSON-LD builders (Organization, WebSite, WebPage, Service, Breadcrumb)
  layouts/
    BaseLayout.astro The master layout — every page renders through it
  components/
    layout/          SiteHeader, SiteFooter — used unchanged on every page
    sections/        Page sections
    ui/              Icon, ThemeToggle
  pages/
    index.astro      Homepage
    robots.txt.ts    Generated robots.txt (AI crawler policy)
    llms.txt.ts      Generated llms.txt
  scripts/
    site.js          ALL client-side behaviour (~1.3 KB gz)
  styles/global.css  Tokens, fonts, animations, accessibility utilities
  assets/            Source images, logos, certificates (optimised at build)
public/              Files served verbatim at stable root paths
```

**Images**: Astro's `<Picture>` / `<Image>` generate AVIF/WebP/JPEG derivatives
and `srcset` at build time. There is no manual image pipeline to run.

**Sitemap**: `@astrojs/sitemap` reads the built pages — a new page appears in
`sitemap-index.xml` automatically.

**Rule:** business facts live in `site.ts` and nowhere else. A phone number,
address or certification typed directly into a component will eventually
contradict the footer, the schema and the Impressum — and inconsistent entity
data is exactly what damages trust signals with search and AI systems.

---

## 2. Adding a new page — the required steps

1. **Register it** in `src/config/pages.ts`:

```ts
gutachten: {
  path: routes.gutachten,                 // must exist in site.ts routes
  title: "Gutachten für Immobilien",      // unique, ~50–60 chars, no brand suffix
  description: "…",                       // unique, ~140–160 chars, describes THIS page
  robots: "index, follow",
  ogType: "website",
  ogImage: "/social/og-gutachten.jpg",    // 1200×630
  ogImageAlt: "…",
  sitemap: true,
  sitemapPriority: 0.8,
  sitemapChangeFreq: "monthly",
  breadcrumbs: [],                        // parents only, excluding this page
}
```

2. **Add the route** to `routes` in `site.ts` if it is new.
3. **Link to it** from `navigation.ts` — a page no internal link points to is an
   orphan and will barely be crawled.
4. **Create `src/pages/<slug>/index.astro`** using the skeleton in section 3.
5. Run `npm run build` — the sitemap, llms.txt and the static HTML all update
   automatically.

Title and description are **never** written in a component. `head.ts` is the
only place `<head>` is assembled, which is what guarantees no page ships
without a canonical URL.

---

## 3. Required page skeleton

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { PAGES } from "../../config/pages";
import { subpageSchema } from "../../seo/schema";

const jsonLd = subpageSchema(PAGES.gutachten);
---

<BaseLayout page="gutachten" jsonLd={jsonLd}>
  <h1>…</h1>                              <!-- exactly one per page -->
  <section aria-labelledby="abschnitt-1">
    <h2 id="abschnitt-1">…</h2>
  </section>
</BaseLayout>
```

BaseLayout supplies the skip link, `<header>`, `<main id="inhalt">` and
`<footer>` — a page never repeats them.

- Pass `headerVariant="overlay"` only where the header sits on a full-bleed
  hero image (the homepage).
- Heading levels descend without skipping (h1 → h2 → h3). Never pick a heading
  level for its font size — use a class.
- Landmarks: exactly one `<header>`, one `<main>`, one `<footer>` per page.

---

## 4. Content rules

- Write plain, factual German. State what the service is, who it is for and
  where it is offered. AI systems quote sentences like *"BC IMMOWERT erstellt
  Immobilienbewertungen für Eigentümer und Käufer in Speyer"* — they cannot do
  anything useful with *"Wir liefern erstklassige Lösungen"*.
- Every claim on the site must be true and verifiable. No invented statistics,
  ratings, reviews, awards or client counts.
- Important information must exist as real text. Text baked into an image or
  drawn in a canvas is invisible to search engines, AI crawlers and screen
  readers alike.
- No hidden text, no keyword stuffing, no text-coloured-like-the-background.

---

## 5. Images

Always use Astro's `<Picture>` / `<Image>`; never a bare `<img>` for a
photograph, and always import the source so Astro can optimise it.

```astro
---
import { Picture } from "astro:assets";
import photo from "../assets/images/hero-bc-immowert-aufmass.jpg";
---
<Picture
  src={photo}
  formats={["avif", "webp"]}
  widths={[420, 560]}
  sizes="(max-width: 640px) 320px, 480px"
  alt="Lasermessgerät beim Aufmaß"
  loading="lazy"
/>
```

- Exactly **one** `priority` image per page — the largest above-the-fold one.
  Marking several defeats the purpose; marking none delays the LCP.
- `width`/`height` are emitted automatically — this is what keeps CLS at 0.
- Decorative images take `alt=""`, never a missing `alt`.
- Derivatives are generated automatically during `npm run build`; there is no
  separate asset step to remember.

### Quality settings

Quality is set to 90–92, close to the original. The photographs are the
product; the bandwidth saved by compressing harder is not worth visible
softness. If anything looks soft, raise it — never lower it to chase a score.

### Source resolution — the hard limit

Compression is not what makes an image look soft. **Upscaling is.** A browser
can only stretch the pixels a photograph actually contains, and no quality
setting, format or CDN can invent more.

Work out the requirement before choosing a photo:

    required pixels = display size in CSS px x 2   (for Retina/2x screens)

| Where it is used | Display size | Needs (2x) | Current source |
|---|---|---|---|
| Full-screen hero | 1440 x 900 | **2880 x 1800** | 1780 x 745 → 2.4x upscale |
| Service card | 480 x 640 | **960 x 1280** | 1780 x 745 → 1.7x upscale |

The current photographs are 1780 x 745 — a wide banner format. They are
correctly sized for a banner strip, but a full-height hero and a portrait card
both ask for more vertical pixels than they contain. Two ways to fix it:

1. **Replace the sources with larger files.** For the hero, at least
   2880 x 1620 (ideally 3840 x 2160). For cards, a portrait crop of at least
   1200 x 1600. If the photos came from a stock library, re-download at maximum
   resolution; if from a photographer, ask for the originals.
2. **Reduce the display size.** A banner-height hero (roughly 60vh) is served
   perfectly by 1780 x 745.

### Serving through Cloudflare

Cloudflare Polish and Image Resizing make files *smaller* and convert formats
per browser. They cannot add resolution, so they do not address the table
above. Set Polish to **Lossless** — a second lossy pass on top of AVIF 90 is
what produces artefacts. See the Cloudflare notes below.

### Serving through Cloudflare (optional)

If the site runs behind Cloudflare, image delivery can be handed to the CDN
instead of, or on top of, the build-time pipeline:

- **Polish** (Pro plan and up): recompresses and converts to WebP/AVIF per
  browser automatically. Set it to *Lossless* — the files here are already
  optimised, and a second lossy pass on top of AVIF 72 is what produces
  artefacts. Enable "WebP" only if you drop the build-time AVIF.
- **Image Resizing / Cloudflare Images**: generates widths on demand from one
  high-quality original. If you adopt this, keep a single large master per
  photo, drop the width list in `PROFILES` to one entry, and point
  `ResponsiveImage` at the `/cdn-cgi/image/...` URL pattern.
- **Cache rules**: `/assets/*` is already served `immutable` for a year, so
  Cloudflare will hold derivatives at the edge without extra configuration.

The build-time pipeline is kept because it works on any host, needs no paid
plan, and guarantees the exact crops the layout expects. Cloudflare on top is
an optimisation, not a replacement.

---

## 5b. Breadcrumbs

**Rule: emit the schema everywhere below the homepage, show the visual trail
only from the second level down.**

- `/uber-uns/` — first level. `breadcrumbs: []` in the page config. The
  BreadcrumbList schema is still produced (Google uses it to show the site
  hierarchy instead of a bare URL in results), but no visual trail renders,
  because "Startseite › Über uns" tells a visitor nothing the header does not.
- `/gutachten/immobilienbewertung/` — second level. Set
  `breadcrumbs: [{ name: "Gutachten", path: routes.gutachten }]`. Here the
  trail genuinely helps: it shows where the page sits and offers a one-click
  route back up.

`<Breadcrumbs page="..." />` handles both cases from the same config — drop it
into every subpage and it decides for itself whether to render.

---

## 5c. The header

One component, two variants, used on every page:

- `headerVariant="overlay"` — transparent, fixed over a full-bleed photograph
  (homepage, and any page using `<PageHero>`).
- `headerVariant="solid"` — opaque bar from the start (text-only pages).

Both become a translucent, blurred bar once the page scrolls past 24 px, and
both flip their text from white to the page's ink colour at the same moment.
That colour flip is not cosmetic: a white-on-transparent header sitting over
light page content is unreadable.

The state is a single `is-scrolled` class toggled in `site.js`. Without
JavaScript the header keeps its initial appearance, which is legible either way.

**Note for maintainers:** declare `backdrop-filter` on its own and let the
build add prefixes. Writing the standard and `-webkit-` forms together makes
Lightning CSS collapse them and keep only the prefixed one, which silently
removes the blur in Chrome.

---

## 5d. Page headers: photograph or animation

The site has three kinds of page header, and which one a page gets is decided by
what the page is, not by taste:

| Page kind | Header | Component |
|---|---|---|
| Homepage | Full-bleed photograph, tall | `Hero.astro` |
| Category page (`/gutachten/`, `/ingenieurleistungen/`, `/dienstleistungen/`) | Dark ground with an animated SVG graphic, no photograph | `AnimatedPageHero.astro` + a graphic |
| Individual service, and every other subpage | Banner-height photograph | `PageHero.astro` |

The reason is concrete. A category has no single subject to photograph; the only
candidates are the photographs already used by its own child pages, and reusing
one makes the pair look like a duplicate. An animated diagram instead shows the
*method* — measuring, assessing, valuing — which is what the category is about.

The graphics live in `src/components/sections/` and follow one pattern
(`FloorPlanScan.astro` is the reference): inline SVG, CSS keyframes only, no
JavaScript and no library, `aria-hidden="true"` because they are decorative, and
a `@media (prefers-reduced-motion: reduce)` block that stops all motion and
leaves the finished picture visible. Strokes use `currentColor` so the graphic
inherits the surrounding text colour and works on both light sections and the
dark hero.

**Never put a figure in a decorative graphic that could be read as a real
result.** `ValuationScan.astro` deliberately shows a euro symbol and a coin
stack but no amount: a number there would look like a valuation the office had
actually produced.

### The graphics available

| Component | Shows | Used on |
|---|---|---|
| `FloorPlanScan.astro` | A floor plan drawing itself, scanned by a survey line | Über uns |
| `ValuationScan.astro` | A building assessed, factors recorded, a value stack | Gutachten |
| `ThermalScan.astro` | A wall section losing heat until insulation is applied | Ingenieurleistungen |
| `MeasureScan.astro` | A room surveyed on site becoming three documents | Dienstleistungen |
| `WaveGrid.astro` | A rippling perspective mesh under a data card | free |

`WaveGrid.astro` is self-contained: markup, styles and its drawing code all sit
in that one file, so it can be dropped into any page or carried into another
project on its own. It takes `eyebrow`, `title`, `subtitle`, `rows` and
`equalizer` — pass real figures through `rows` on any page that states facts,
because the defaults are placeholders. A standalone copy that runs by
double-clicking, with no build step, is kept at `docs/animations/wave-grid.html`;
change one and change the other.

## 5e. Long bullet lists: the fact grid

Three or four related lists on one page (when is it worth it, what are the
benefits, what is the goal, why us) must not be stacked as four full-width
bullet columns. Use `FactGrid.astro`: each list becomes a card with an icon, a
heading and a tight list, and the set sits on a two-column grid so the whole
thing is visible at once. Pass `wide: true` on a card with noticeably more
entries so it spans both columns.

Do NOT reach for tabs or an accordion here. This content is exactly what a
visitor scans for and exactly what a search engine should index; both patterns
would hide three quarters of it behind a click and buy nothing at this length.

Cards render a real `<h3>` and a real `<ul>`, so without CSS the reading order
is still heading, list, heading, list.

## 6. Colour and contrast

Use the tokens, not hex values:

| Token | Use |
|---|---|
| `text-ink` | body text |
| `text-muted` / `text-subtle` | secondary text |
| `text-accent` | gold text (auto-darkens on light backgrounds) |
| `bg-accent-solid` | filled buttons, always with white text |
| `--bc-accent-deco` | decorative gold — rules, bars. **Never for text** |

**Known exception — filled buttons.** `--bc-accent-solid` is the brand gold
`#c39a53` at the client's explicit request. White label text on it measures
**2.6:1**, below the WCAG AA minimum of 4.5:1. Two ways to resolve it without
changing the background colour:

1. switch the label to `--bc-ink` → **6.6:1** (this was the original design), or
2. darken the token to `#8f6a26` and keep white text → **4.9:1**.

Gold *text* on light surfaces uses `--bc-accent` (#8a6520, 4.8:1) rather than
the brand gold, which reaches only 2.4:1 there and is genuinely hard to read.
On dark surfaces the brand gold is used unchanged because it passes (5.4:1).

Any new colour pair must be checked before use.

---

## 7. Accessibility (non-negotiable)

- Every interactive element reachable and operable by keyboard.
- Behaviour goes in `src/scripts/site.js` as progressive enhancement: the
  markup must already be complete and readable before that script runs.
- Focus is never suppressed — `:focus-visible` styling is global.
- Interactive targets ≥ 44 px on touch (minimum 24 px, WCAG 2.2 SC 2.5.8).
- Icons are `aria-hidden="true" focusable="false"`; the accessible name comes
  from text or `aria-label`.
- Use native HTML first. Add ARIA only where HTML has no equivalent.
- Animation must respect `prefers-reduced-motion` (handled globally by
  `MotionConfig reducedMotion="user"` — do not bypass it).

---

## 8. Links

- Internal links: relative paths with a trailing slash (`/gutachten/`).
- External links opened in a new tab **must** carry `rel="noopener noreferrer"`.
- `rel="nofollow"` only for paid or untrusted links — not for ordinary
  outbound links.
- Link text must make sense out of context. Never "hier klicken".

---

## 9. Forms (when the contact form is built)

- Validate on the server. HTML validation is a convenience, not a control.
- Verify the CAPTCHA token **server-side**; a frontend result proves nothing.
- `RECAPTCHA_SECRET_KEY` is server-only and must never carry the `PUBLIC_`
  prefix.
- Add a honeypot field, rate-limit the endpoint, cap field lengths, and strip
  CR/LF from any value used in a mail header (email header injection).
- Associate every input with a `<label>`; announce errors in text, not colour
  alone.
- Extend the CSP `connect-src`/`script-src` for the CAPTCHA domain — do not
  relax the whole policy.

---

## 10. Never do

- Ship a page without a canonical URL, unique title or unique description.
- Put a secret in a `PUBLIC_`-prefixed variable or in client code.
- Add structured data for content that is not on the page.
- Add FAQ schema without real, visible FAQ content.
- Create pages whose only purpose is to rank for a keyword.
- Block CSS or JS in robots.txt.
- Rely on `robots.txt`, `noindex` or `llms.txt` to protect private content —
  those are requests, not access control. Use server-side authentication.
