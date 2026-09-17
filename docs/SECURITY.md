# Security & Deployment Notes

## 1. Secrets

The codebase currently contains **no secrets** — there is no API key, token or
credential in the repository or the built bundle. Keep it that way:

- `vite.config.ts` sets `envPrefix: "PUBLIC_"`. Only variables with that prefix
  reach client code. Everything else stays server-side.
- Anything with `PUBLIC_` is inlined into the JavaScript bundle and is visible
  to every visitor. Treat it as published.
- `.env` and `.env.*` are git-ignored; `.env.example` documents what is needed.
- Real values belong in the hosting provider's environment settings, never in
  the repository.

## 2. Must never be reachable over HTTP

`.env` · `.git/` · `node_modules/` · `package.json` / `package-lock.json` ·
`src/` · `scripts/` · `docs/` · `*.zip` · `*.sql` · `*.bak` · `*.map`

Only the contents of `dist/` are deployed. Verify after every deploy:

```bash
for p in .env .git/config package.json src/config/site.ts docs/SECURITY.md public/api/kontakt.php api-geheim/kontakt-geheim.php; do
  printf "%-24s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://bc-immowert.de/$p)"
done
# every line must show 404 (or 403)
```

Source maps are disabled in `vite.config.ts` (`sourcemap: false`) so readable
source is not published.

## 3. Security headers

The site is deployed on cPanel/Apache; `public/.htaccess` is the live, active
configuration (Astro copies it into `dist/.htaccess` on every build, so it
ships automatically — no separate step). Two more `.htaccess` files,
`public/_astro/.htaccess` and `public/fonts/.htaccess`, add the one-year
immutable cache for those two directories specifically. **`public/.htaccess`
is the file to edit for a header change** — the `nginx` snippet below is kept
only as a reference in case the site is ever moved to a host without Apache.

### Apache (`public/.htaccess` — the live config)

See `public/.htaccess` directly for the exact, current rules (redirects,
headers, compression, 404 handling). Not duplicated here to avoid the two
drifting apart — this file used to happen with the old `public/_headers`
(Netlify/Cloudflare-style) file next to `vercel.json`, which is exactly what
led to it being removed.

### nginx (reference only — not the live config)

```nginx
server {
    listen 443 ssl http2;
    server_name bc-immowert.de;
    root /var/www/bc-immowert/dist;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://datawrapper.dwcdn.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.gstatic.com https://datawrapper.dwcdn.net; font-src 'self'; connect-src 'self' https://www.google.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://datawrapper.dwcdn.net; frame-src 'self' https://www.openstreetmap.org https://www.google.com https://datawrapper.dwcdn.net; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()" always;
    add_header X-Frame-Options "DENY" always;

    server_tokens off;              # do not advertise the nginx version
    autoindex off;                  # no directory listing

    # Block dotfiles and dev artefacts outright.
    location ~ /\.          { deny all; return 404; }
    location ~* \.(env|map|sql|bak|zip|log)$ { deny all; return 404; }

    # German content: text/plain without a charset is decoded as windows-1252
    # and every umlaut breaks. charset_types covers robots.txt and llms.txt.
    charset utf-8;
    charset_types text/plain text/css application/javascript application/xml
                  application/rss+xml text/html;

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /fonts/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Real 404 status — never rewrite unknown paths to index.html, that
    # produces soft-404s which Google indexes as duplicates of the homepage.
    error_page 404 /404.html;

    location / {
        try_files $uri $uri/index.html $uri/ =404;
    }
}

# Canonical host: one redirect, no chains.
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.bc-immowert.de;
    return 301 https://bc-immowert.de$request_uri;
}
server {
    listen 80;
    server_name bc-immowert.de;
    return 301 https://bc-immowert.de$request_uri;
}
```

### About the CSP

Derived from what the site actually loads:

| Directive | Value | Why |
|---|---|---|
| `script-src` | `'self'` + Google (reCAPTCHA, GTM), datawrapper | Own bundle plus the third-party scripts actually loaded: reCAPTCHA v3, Google Tag Manager (GA4, consent-gated), a Datawrapper embed. No `unsafe-eval`. |
| `style-src` | `'self' 'unsafe-inline'` | A few components set inline `style` attributes (e.g. dynamic background gradients). `unsafe-inline` for **styles** does not permit script execution. |
| `font-src` | `'self'` | Fonts are self-hosted (`public/fonts/`). |
| `img-src` | `'self' data:` + gstatic, datawrapper | Own images/data URIs plus reCAPTCHA badge assets and the Datawrapper embed. |
| `connect-src` | `'self'` + Google, google-analytics, datawrapper | Same-origin (the contact form's `/api/kontakt`) plus reCAPTCHA verification, GA4 (consent-gated), the Datawrapper embed. |
| `frame-src` | `'self'` + OpenStreetMap, Google, datawrapper | The Einsatzgebiet map (OSM), reCAPTCHA's invisible frame, the Datawrapper embed. |
| `frame-ancestors` | `'none'` | Clickjacking protection. |

When a new third party is added, extend the **specific** directive with the
**specific** host, in `public/.htaccess`. Never add a wildcard.

## 4. HTTP status codes

| Code | Where |
|---|---|
| 200 | All real pages |
| 301 | www → apex, http → https. One hop only, no chains. |
| 404 | Unknown paths, served with `public/404.html` and a genuine 404 status |
| 410 | Use for pages deliberately and permanently removed |

Do not serve `index.html` for unknown paths — that creates soft 404s.

## 5. Third-party dependencies

| Package | Why | Ships to browser | Risk |
|---|---|---|---|
| `astro` | Site generator | No (build-time only, emits plain HTML) | Low, well maintained |
| `@astrojs/sitemap` | Generates `sitemap-index.xml` | No | None at runtime |
| `tailwindcss`, `@tailwindcss/vite`, `typescript` | Build tooling | No | None at runtime |
| `playwright` | `verify.mjs`/`measure.mjs` only, not the site itself | No | Dev-only |

`server/` (the contact-form API) has **no dependencies at all** — it uses only
Node's built-in `http`/`crypto` modules and the global `fetch`.

The site's own JavaScript is one small vanilla-JS bundle (`src/scripts/site.js`,
~2 KB gzip) — no UI framework ships to the browser. At runtime the page does
load a small, fixed set of third-party origins, each consent-gated or
functionally necessary — see the CSP table above (`script-src`): reCAPTCHA v3
(the contact form's spam check), Google Tag Manager/GA4 (behind the cookie
consent banner, inert until accepted), and a Datawrapper embed. No CDN, no
Google Fonts (self-hosted), no third party beyond that fixed list, and nothing
loads before it's needed or consented to.

## 6. Privacy status

The site loads reCAPTCHA v3 (for the contact form) and, only after consent, a
GA4/GTM tag — see `src/components/ui/ConsentBanner.astro`, `src/scripts/site.js`
and the Datenschutz page (section 8) for the actual consent flow. `localStorage`
holds `bc-theme` (light/dark preference — functional, not consent-relevant)
and the recorded consent choice itself.

A cookie/consent banner is therefore required and already implemented. Any
*new* third party (another embed, another analytics tool) needs the same
treatment: added to the CSP in `public/.htaccess`, and gated behind consent if
it sets cookies or loads before the user interacts.
