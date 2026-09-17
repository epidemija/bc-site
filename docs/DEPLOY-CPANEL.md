# Deploying on cPanel

The site itself is a static Astro build: no server, no database needed for
the pages themselves. The contact form is a single PHP file
(`api/kontakt.php`) that ships as part of the same static build — no
separate app, no "Setup Node.js App", no process to keep running. PHP runs
natively on virtually every cPanel host with zero setup.

Two things go to the server, both one-time except step 1:

1. **The site itself** (including the contact form) → the `dist/` folder
   after a build goes into `public_html/`. Every update after that is just
   a re-upload of `dist/`.
2. **Contact-form secrets** → one small PHP file, uploaded once, OUTSIDE
   `public_html/` so it can never be requested over the web.

---

## 1. Build the static site

Locally, before uploading anything:

```bash
cp .env.example .env   # fill in PUBLIC_SITE_URL, PUBLIC_RECAPTCHA_SITE_KEY
npm install
npm run build
```

The result is in `dist/` — every file in it is ready to upload, including
`.htaccess` (security headers, redirects, caching, and the rewrite that
sends `/api/kontakt` to `api/kontakt.php` — comes automatically from
`public/.htaccess`, bundled into the build) and `api/kontakt.php` itself
(comes from `public/api/kontakt.php`, same mechanism).

## 2. Upload the static site

Via cPanel File Manager or FTP: copy the **contents** of `dist/` (not the
`dist/` folder itself) into `public_html/` — `index.html`, `_astro/`,
`.htaccess`, `api/kontakt.php` etc. then sit directly under `public_html/`.

Open the domain in a browser and click through it before finalizing
DNS / going fully live.

## 3. Upload the contact-form secrets (one-time)

`api/kontakt.php` needs `RECAPTCHA_SECRET_KEY` and `RESEND_API_KEY`. These
never go into `public_html` or the repo — they live in one small file
**outside** the web root, so nobody can ever fetch it by URL.

1. Fill in `api-geheim/kontakt-geheim.example.php` in this repo with the
   real values (or copy `api-geheim/kontakt-geheim.php` if it already
   exists locally) and rename it to `kontakt-geheim.php`.
2. In cPanel File Manager, go **one level above** `public_html` (the same
   screen that lists `public_html` as a folder) and upload
   `kontakt-geheim.php` there — next to `public_html`, not inside it.
3. Verify: `https://bc-immowert.de/api/kontakt` in a browser (GET) should
   show `{"ok":true,...}`. If it shows `{"error":"not_configured"}`, the
   file isn't in the right place yet.

This file stays on the server permanently — re-uploading `dist/` to
`public_html/` later (step 2, as often as needed) never touches it.

**Logs (14.09.2026):** the contact form writes its own log file next to
`kontakt-geheim.php` — same level, outside `public_html/`, so it's never
reachable by URL. File name: `kontakt-log.txt`. Open it any time via cPanel
File Manager or FTP to see what the form has been doing (every request,
every rejection reason, every successful send with its Resend ID). It caps
itself at ~2 MB — once it grows past that it's rotated to
`kontakt-log.txt.alt` automatically, no manual cleanup needed.

**Important (14.09.2026):** if `RECAPTCHA_SECRET_KEY` is missing or empty in
this file, the form now fails closed — it rejects every submission with
`captcha_not_configured` instead of silently sending mail with no bot
protection. So a missing/empty key breaks the form loudly (visible as an
error to whoever tests it) rather than quietly turning off spam protection.
If `https://bc-immowert.de/api/kontakt` shows `{"error":"not_configured"}`,
`kontakt-geheim.php` isn't in the right place yet (per step 2 above); if a
real form submission gets `captcha_not_configured` specifically, the file
is found but `RECAPTCHA_SECRET_KEY` inside it is empty or missing.

---

## 4. DNS / domain

The domain usually already points to `public_html/` in cPanel (depending on
the hosting plan). If the domain is being newly set up with this provider,
the host's own interface shows the required DNS entries (A record /
nameservers) — always take the exact values from there.

**Don't cancel the old host until the new site is verified working under
the domain.** As long as the old installation still exists, there's a way
back.

SSL certificate: cPanel generally offers AutoSSL (a free Let's Encrypt
certificate) — enable it under **Security → SSL/TLS Status** if it isn't
already active.

---

## 5. After the move

1. Open the property for `bc-immowert.de` in **Google Search Console** and
   submit the new sitemap: `https://bc-immowert.de/sitemap-index.xml`
2. A few days later, check under *Pages* whether all URLs were picked up.
3. Open `https://bc-immowert.de/robots.txt` and `/sitemap-index.xml` once
   in a browser — both must show text/XML, not trigger a download.
4. Actually submit the contact form once and check that the mail arrives.

---

## 6. Later updates

Static site:

```bash
npm run build
```

then upload the new contents of `dist/` into `public_html/` again
(overwriting existing files).

Contact-form: part of the normal site build (`api/kontakt.php` under
`public/`) — a fix or change to it ships with the next `dist/` upload above,
same as any other page. No separate step, nothing to restart.

---

## Before going live, check

- [ ] `npm run build` runs without errors
- [ ] `node verify.mjs` reports "All checks passed"
- [ ] The Impressum and privacy policy are present and legally reviewed
- [ ] The contact-form API is up (`https://bc-immowert.de/api/kontakt` via
      GET shows `{"ok":true,...}`) and actually sends e-mails
- [ ] Every footer link leads to a page that exists (no 404)
- [ ] The site was clicked through on a real phone, not just a browser
      simulator
- [ ] `https://bc-immowert.de/something-that-does-not-exist` shows a real
      404 (not the homepage)
