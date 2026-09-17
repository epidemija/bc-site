# BC IMMOWERT — Website

Static company website for BC IMMOWERT (engineering and property-valuation
consultancy for property valuation, building-damage assessment and
engineering services, Speyer).

## Technology

- [Astro](https://astro.build) 7 — static site generator, `output: "static"`
- [Tailwind CSS](https://tailwindcss.com) 4 (via `@tailwindcss/vite`)
- TypeScript
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) for `sitemap-index.xml`
- `public/api/kontakt.php` — the contact form's endpoint (reCAPTCHA v3 +
  [Resend](https://resend.com)), a single dependency-free PHP file that
  ships automatically inside `dist/` on every build and runs on ordinary
  cPanel PHP hosting — no Node.js process, no "Setup Node.js App", nothing
  to install separately

The site itself is plain static HTML — no server, no database, no
JavaScript backend. The contact form is the one exception that needs
server-side code at all, and PHP is enough for that; nothing on this site
runs Node.js in production, ever — Node.js is only the local build tool
that turns the Astro source into that static `dist/` output.

## Requirements

- Node.js 22+
- npm

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the local dev server (default: `http://localhost:4321`).

## Production build

```bash
npm run build
```

Builds the static site into `dist/`. `npm run preview` serves that build
locally.

## Environment variables

Copy `.env.example` to `.env` for local development. Real values for
production go partly into this `.env` at build time (the `PUBLIC_*`
variables, because they get baked into the build), and partly into
`api-geheim/kontakt-geheim.php` for the contact form (`api/kontakt.php`) —
see `api-geheim/kontakt-geheim.example.php`.

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Canonical domain — drives canonical URLs, Open Graph, sitemap, robots.txt, JSON-LD |
| `PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key (public) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key — used by `api/kontakt.php`, not by the build |
| `RESEND_API_KEY` | API key for sending mail via Resend — also `api/kontakt.php` |
| `CONTACT_FORM_RECIPIENTS` | *(optional)* recipient list for the contact form |
| `CONTACT_FORM_FROM` | *(optional)* sender address for the contact form |
| `PUBLIC_GA4_MEASUREMENT_ID` | *(optional)* Google Analytics 4 measurement ID, consent-gated |
| `PUBLIC_GSC_VERIFICATION` | *(optional)* Google Search Console verification token |

Details and where to get each value are in `.env.example` /
`api-geheim/kontakt-geheim.example.php`.

## Other scripts

| Command | Purpose |
|---|---|
| `npm run verify` | Playwright regression check against the running dev server |
| `npm run measure` | Performance / load-time measurement via Playwright |
| `npm run audit` | Static design-system audit against `dist/` after a build |

`npm run check` (Astro type-check) additionally needs `@astrojs/check`,
which couldn't currently be installed due to a peer-dependency conflict with
the pinned TypeScript version — see project notes.

## Deployment

Deployment target is cPanel hosting: the static build (`dist/`, including
the contact form as a plain PHP file) goes into `public_html/`. Full
step-by-step guide: [`docs/DEPLOY-CPANEL.md`](docs/DEPLOY-CPANEL.md).

## Project structure

```
src/
  components/   reusable Astro components (layout, sections, ui)
  config/       central configuration: routes, page metadata, navigation, FAQ, process steps
  layouts/      base layout
  pages/        pages (Astro file route = URL route)
  seo/          JSON-LD schema helpers, <head> construction
  styles/       global stylesheet and design tokens
  scripts/      client-side vanilla JS
server/         standalone Node.js app for the contact form — not part of
                the Astro build, set up separately on cPanel
public/         static assets copied into dist/ as-is (includes .htaccess
                with the Apache security headers)
docs/           operations and editorial documentation (deployment, checklists, security, open legal text)
archive/        archived old versions, backups and retired components — not part of the deployment, not in Git
```

## Legal pages

The Impressum contains placeholders (`TODO_LEGAL`) for details that only the
business owner can supply (legal form, VAT ID, chamber membership,
professional liability insurance). `docs/RECHTSTEXTE-OFFEN.md` lists the
open items. `node verify.mjs` fails while these placeholders are still
active — that keeps the site from accidentally going live with an
incomplete Impressum.
