# AI and Search Crawler Policy

Internal documentation for the development and maintenance team. Not published
on the website.

Effective configuration lives in `scripts/generate-seo-files.mjs`, which
generates `/robots.txt` at build time. Change the policy there, never by
editing `dist/robots.txt` by hand.

---

## 1. Current decisions

| Crawler | Status | Why | Configured in |
|---|---|---|---|
| `Googlebot` | Allowed | Google Search indexing. Blocking it removes the site from Google. | robots.txt |
| `Googlebot-Image` | Allowed | Image search — relevant for a visual, local service business. | robots.txt |
| `Google-Extended` | Allowed | Controls use for Gemini and AI Overviews grounding. Allowing it makes the business eligible to be *represented and cited* in Google's AI answers. Does not affect ranking. | robots.txt |
| `Bingbot` | Allowed | Bing indexing, and the source behind Microsoft Copilot answers. | robots.txt |
| `Applebot` | Allowed | Apple Search / Siri / Spotlight. | robots.txt |
| `Applebot-Extended` | Allowed | Apple Intelligence. | robots.txt |
| `OAI-SearchBot` | Allowed | Powers ChatGPT search *results* — the crawler that makes the site citable there. | robots.txt |
| `ChatGPT-User` | Allowed | Fetches a page when a user explicitly asks ChatGPT to open it. Blocking it breaks a user's direct request. | robots.txt |
| `GPTBot` | Allowed | OpenAI's general crawler, associated with model training. See section 3. | robots.txt |
| `ClaudeBot` | Allowed | Anthropic crawler used for Claude search and citation. | robots.txt |
| `anthropic-ai` | Allowed | Legacy Anthropic agent string. | robots.txt |
| `PerplexityBot` | Allowed | Perplexity answers link and cite sources. | robots.txt |
| `CCBot` | Allowed | Common Crawl — a widely reused open dataset. See section 3. | robots.txt |
| Everything else | Allowed (`User-agent: *`) | The entire site is public marketing content. | robots.txt |

Nothing is currently blocked. That is a deliberate decision for a business that
benefits from being found and quoted accurately.

---

## 2. What robots.txt does and does not do

**Does:** ask well-behaved crawlers not to fetch certain paths.

**Does not:**
- prevent access — the URL still works for anyone who requests it
- hide anything — robots.txt is itself public, so listing a secret path
  advertises it
- guarantee removal from search — use `noindex` for that
- guarantee exclusion from an AI model — some crawlers ignore it, and content
  already collected is not retroactively deleted

**Therefore:** never list a private path in robots.txt. Anything that must not
be public is protected server-side with authentication, or is simply not
deployed.

---

## 3. The training-vs-citation distinction

Two different things are conflated in most discussions:

- **Citation crawlers** (`OAI-SearchBot`, `PerplexityBot`, `Google-Extended`,
  `ClaudeBot`): feed answer engines that link back. For a local professional
  service this is essentially free qualified referral traffic.
- **Training crawlers** (`GPTBot`, `CCBot`, `anthropic-ai`): content may be
  used to train models, with no link back.

Both are currently allowed to maximise reach. **If the owner ever decides the
content must not be used for model training**, change exactly these three to
`Disallow: /` in `scripts/generate-seo-files.mjs` and rebuild — and understand
that this may also reduce how well those systems can describe the business.

Never block `Googlebot` or `Bingbot`. That is the one change that would take
the site out of search entirely.

---

## 4. Content classification

| Class | Examples | Protection |
|---|---|---|
| **Public** | Homepage, service pages, Über uns, Kontakt, Impressum, Datenschutz | Intentionally crawlable and citable |
| **Private** | None yet. A future client portal or file exchange would belong here. | Server-side authentication. Not `noindex`, not robots.txt. |
| **Sensitive** | `.env`, SMTP credentials, reCAPTCHA secret, client valuation reports, personal data from form submissions | Never deployed to the web root. Secrets in the host's environment variables only. |

If a client area is ever added: put it behind real authentication, return 401/403
to unauthenticated requests, add `noindex` as a secondary signal, and keep it out
of `sitemap.xml` and `llms.txt`.

---

## 5. llms.txt

`/llms.txt` is generated at build time from the same config as the site.

- It is an **emerging, unofficial convention**, not a Google ranking factor and
  not a standard any AI vendor is obliged to honour.
- It guarantees nothing about appearing in ChatGPT, Gemini, Claude, Copilot or
  Perplexity.
- Its only purpose: if an AI system reads it, the facts it gets are correct,
  current and consistent with the website.

Rules: keep it short, factual and public-only. Never put credentials, internal
notes, unpublished pricing or personal data in it. It is a public file.

---

## 6. Deliberately public information

- Company name, service description, service area
- Business address, phone number, email address, opening hours
- Service descriptions and page structure
- DEKRA certifications actually held

All of this is already on the website and in the Impressum. It is exposed in a
machine-readable form (JSON-LD, llms.txt) so search and AI systems describe the
business accurately rather than guessing.

---

## 7. Review cadence

Re-check this policy when:
- a client login, portal or file exchange is added
- analytics or any third-party embed is introduced
- a new significant AI crawler appears
- the owner's position on AI training use changes

Last reviewed: 2026-08-31.
