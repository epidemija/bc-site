/**
 * SINGLE SOURCE OF TRUTH for the whole website.
 *
 * Every page, every schema.org entity, the footer, the sitemap, robots.txt and
 * llms.txt read their facts from this file. Never hard-code business data in a
 * component — add it here and import it, so the organisation is described
 * identically everywhere (important for search engines and AI systems that
 * build an entity profile from consistent signals).
 *
 * All values must be factually correct. Do not add claims, ratings, awards or
 * statistics that are not verifiably true.
 */

/** Production origin. Override at build time with PUBLIC_SITE_URL. */
export const SITE_URL: string = (
  import.meta.env.PUBLIC_SITE_URL ?? "https://bc-immowert.de"
).replace(/\/+$/, "");

/** Default document language (BCP 47). */
export const SITE_LOCALE = "de-DE";
export const SITE_LANG = "de";

export const ORGANISATION = {
  /** Brand name as displayed. */
  name: "BC IMMOWERT",
  /** Short descriptor used in titles. */
  tagline: "Ingenieur- und Sachverständigenbüro für Immobilien",
  /**
   * Factual description of the business. Plain language, no marketing
   * superlatives — this is what AI systems are most likely to quote.
   */
  description:
    "BC IMMOWERT ist ein Ingenieur- und Sachverständigenbüro für Immobilien in Speyer. " +
    "Als Bauingenieur und DEKRA-zertifizierter Bausachverständiger erstellt das Büro " +
    "Immobilienbewertungen und Bauschadensbewertungen und begleitet Eigentümer, Käufer und " +
    "Unternehmen bei Modernisierung, Aufmaß, digitalen Grundrissen und Flächenberechnungen.",
  email: "info@bc-immowert.de",
  /** Human-readable phone number. */
  phone: "0176 21103488",
  /** E.164 format for tel: links and structured data. */
  phoneE164: "+4917621103488",
  /**
   * Google Business Profile and Bing Places listing. Left null on purpose —
   * the footer shows the icon either way, but only links it once a real URL
   * is filled in here (single source, same reasoning as `geo` below).
   */
  businessProfiles: {
    google: "https://share.google/rOTRgDNDyORHH4ClX" as string | null,
    bing: null as string | null,
  },
  /**
   * Exact position of the office, for the map on the contact page.
   *
   * Left null on purpose: guessing coordinates would drop a pin on somebody
   * else's building. With null, the contact page shows the address and a link
   * that lets OpenStreetMap geocode it; fill this in and the embedded map with
   * a marker switches on. Get the values by right-clicking the building on
   * openstreetmap.org and choosing "Adresse anzeigen" — they also appear in
   * the URL as #map=<zoom>/<lat>/<lon>.
   */
  geo: { lat: 49.329787, lon: 8.430764 } as { lat: number; lon: number } | null,
  address: {
    street: "Otto-Hess-Strasse 23d",
    postalCode: "67346",
    city: "Speyer",
    region: "Rheinland-Pfalz",
    country: "DE",
    countryName: "Deutschland",
  },
  openingHours: {
    /** Schema.org opening hours specification. */
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "16:00",
    /** Human-readable, as shown in the footer. */
    label: "Öffnungszeiten 8:00 – 16:00 Uhr",
  },
  /** Areas the business actually serves. */
  areaServed: ["Speyer", "Rhein-Neckar", "Rheinland-Pfalz"],
  /**
   * Official profiles of THIS organisation only (sameAs). Leave empty until a
   * profile genuinely exists — fabricated links are an entity-trust problem.
   */
  sameAs: [] as string[],
  /**
   * Professional certifications actually held. Shown in the footer as DEKRA
   * seals; mirrored here for structured data.
   */
  credentials: [
    {
      name: "DEKRA zertifizierter Sachverständiger für Immobilienbewertung D1 (Standard EFH/ZFH)",
      issuer: "DEKRA Certification GmbH",
      validUntil: "2027-06",
    },
    {
      name: "DEKRA zertifizierter Sachverständiger für Bauschadensbewertung (gewerkspezifisch/Spezialisierung)",
      issuer: "DEKRA Certification GmbH",
      validUntil: "2028-12",
    },
  ],
} as const;

/**
 * URL convention for the whole site:
 *  - lowercase, hyphen-separated, descriptive German slugs
 *  - always a trailing slash (directory-style URLs)
 *  - no file extensions, no query parameters, no IDs
 *  - hierarchy mirrors the navigation
 */
/**
 * Legal identity of the business, used by the Impressum, the Datenschutz page
 * and the structured data. One source, so the three can never disagree.
 *
 * TODO_LEGAL marks a value only Bojan can supply. `node verify.mjs` fails while
 * any of them is still unfilled, so the site cannot be deployed with a gap in
 * the Impressum — which in Germany is what gets a business an Abmahnung.
 */
export const TODO_LEGAL = "TODO_LEGAL" as const;

export const legal = {
  /** Full name of the natural person responsible. */
  owner: "Bojan Ćustić",
  /**
   * Not a registered business form (no Gewerbe/Handelsregister entry) —
   * Bojan operates as a Freiberufler (liberal profession, § 18 EStG), the
   * status engineers and Sachverständige normally fall under. Stated exactly
   * as Bojan phrases it himself; shown in the Impressum next to the address
   * instead of a "legal form" line, since an individual Freiberufler doesn't
   * have one to disclose the way a GmbH or Einzelunternehmen/Gewerbe would.
   */
  activity: "Freiberuflich tätig als Bauingenieur und Sachverständiger",
  /**
   * NOT CURRENTLY RENDERED ANYWHERE. Bojan's own reference Impressum
   * (10.09.2026) omits a VAT/Steuernummer line entirely — legally fine,
   * since §5 Abs. 1 Nr. 6 DDG only requires this when a VAT ID has actually
   * been issued, which Bojan does not have. Kept here, unused, only in case
   * he wants a VAT ID or the Steuernummer shown later.
   */
  vatId: null as string | null,
  taxNumber: {
    value: "41/026/85556",
    authority: "Finanzamt Speyer-Germersheim",
  } as { value: string; authority: string } | null,
  /**
   * NOT CURRENTLY RENDERED ANYWHERE. §5 Abs. 1 Nr. 5 DDG would normally
   * require naming the chamber for a protected title used publicly
   * ("Ingenieur"), and § 2 Abs. 1 Nr. 11 DL-InfoV would require naming the
   * professional liability insurer for a Sachverständiger — both titles
   * Bojan's own Impressum text does use. He explicitly decided (10.09.2026,
   * after that trade-off was pointed out) to publish without either section
   * rather than leave them open pending the chamber/insurance details.
   * Kept here, unused, only in case he wants them added back later.
   */
  profession: {
    title: "Bauingenieur",
    awardedIn: "Deutschland",
    chamber: TODO_LEGAL,
    chamberId: TODO_LEGAL,
    regulations: TODO_LEGAL,
  },
  insurance: {
    name: TODO_LEGAL,
    address: TODO_LEGAL,
    scope: TODO_LEGAL,
  },
  /**
   * Certifications actually held, as they may be stated publicly — one line
   * each. Wording matches Bojan's own reference Impressum verbatim.
   */
  certifications: [
    "DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1",
    "DEKRA-zertifizierter Sachverständiger für Bauschadenbewertung",
  ],
  /** Supervisory data protection authority for Rheinland-Pfalz. */
  dataProtectionAuthority: {
    name: "Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz",
    address: "Hintere Bleiche 34, 55116 Mainz",
    url: "https://www.datenschutz.rlp.de/",
  },
  /**
   * Hosting provider — named in the Datenschutzerklärung as a processor.
   * Jolt is the trading name of Host Lincoln Limited; both data centres
   * (London and Manchester) are in the UK, so — unlike the US-based
   * processors below — this is a third-country transfer under the UK
   * adequacy decision (Art. 45 DSGVO), not Standard Contractual Clauses.
   */
  host: {
    name: "Host Lincoln Limited (handelnd als Jolt.co.uk)",
    address: "Unit 5, Oak House, Witham Park, Waterside South, Lincoln, LN5 7FB, Vereinigtes Königreich",
    privacyUrl: "https://www.jolt.co.uk/privacy-policy/",
    /** Third country with a UK adequacy decision, not SCCs like the US-based processors. */
    thirdCountryBasis: "adequacy" as "adequacy" | "scc",
  },
  /**
   * Service that receives the contact form and turns it into an e-mail.
   * Named in the Datenschutzerklärung as a processor (see section 6). The
   * Data Processing Addendum (Art. 28 DSGVO) must be accepted in the
   * provider's dashboard before the form goes live — this constant does not
   * do that on its own.
   */
  formProcessor: {
    name: "Resend (Plus Five Five, Inc.)",
    address: "2261 Market Street #5039, San Francisco, CA 94114, USA",
    privacyUrl: "https://resend.com/legal/privacy-policy",
  },
  /**
   * Spam/bot protection on the contact form (reCAPTCHA v3). Named separately
   * from formProcessor in the Datenschutzerklärung (section 7) — a different
   * provider, a different legal basis (legitimate interest, not contract
   * performance) and a different data flow (behavioural signals, not the
   * message itself).
   */
  recaptcha: {
    name: "Google Ireland Limited",
    address: "Gordon House, Barrow Street, Dublin 4, Irland",
    privacyUrl: "https://policies.google.com/privacy",
  },
  /**
   * Reichweitenmessung (Google Analytics 4) — only loads when
   * PUBLIC_GA4_MEASUREMENT_ID is actually set at build time, and even then
   * only after the visitor accepts the external-content consent banner
   * (see ConsentBanner.astro / site.js). Unlike reCAPTCHA above, the legal
   * basis is consent (Art. 6 Abs. 1 lit. a DSGVO), not legitimate interest —
   * named separately in the Datenschutzerklärung for that reason.
   */
  analytics: {
    name: "Google Ireland Limited",
    address: "Gordon House, Barrow Street, Dublin 4, Irland",
    privacyUrl: "https://policies.google.com/privacy",
  },
  /**
   * The coverage-area chart on the Gutachten page (DatawrapperEmbed.astro,
   * chart id K2Bz4) — click-to-load, same reasoning as the OpenStreetMap map
   * above. Datawrapper is EU-based (Berlin), so unlike the providers above
   * this one needs no Standard Contractual Clauses / third-country note.
   */
  datawrapper: {
    name: "Datawrapper GmbH",
    address: "Kreutzigerstraße 26, 10247 Berlin, Deutschland",
    privacyUrl: "https://www.datawrapper.de/privacy",
  },
  /**
   * Stock imagery used across the site. Deliberately general — no per-image
   * credit list or CDN/link inventory, since none of it is personal data and
   * a page-by-page list would only need constant upkeep as images change.
   */
  images: {
    source: "Adobe Stock",
    note:
      "Ein Teil der auf dieser Website verwendeten Bilder stammt von Adobe Stock. Es handelt sich " +
      "um lizenzierte Stockfotografie ohne Personenbezug zu Ihnen als Websitebesucher.",
  },
  /** Last review date of the legal texts, shown to visitors. */
  lastUpdated: "2026-09-03",
} as const;

export const routes = {
  home: "/",
  about: "/uber-uns/",
  gutachten: "/gutachten/",
  immobilienbewertung: "/gutachten/immobilienbewertung/",
  bauschadenbewertung: "/gutachten/bauschadenbewertung/",
  restnutzungsdauergutachten: "/gutachten/restnutzungsdauergutachten/",
  ingenieurleistungen: "/ingenieurleistungen/",
  energetischeModernisierung: "/ingenieurleistungen/energetische-modernisierung/",
  einzelmodernisierung: "/ingenieurleistungen/einzelmodernisierung/",
  dienstleistungen: "/dienstleistungen/",
  anUndVerkaufsberatung: "/dienstleistungen/an-und-verkaufsberatung/",
  aufmass: "/dienstleistungen/aufmass/",
  digitaleGrundrisse: "/dienstleistungen/digitale-grundrisse/",
  /**
   * Spelt "flachen…" and plural on purpose: this is the URL the live site has
   * been indexed under since 2026-07. The spelling is wrong (ä → "a", not
   * "ae") but changing it would throw away that URL's history. The visible
   * label everywhere is the correct singular "Flächenberechnung".
   */
  flaechenberechnung: "/dienstleistungen/flachenberechnungen/",
  kontakt: "/kontakt/",
  /** Reached only via redirect after a successful contact-form send. Not indexed. */
  danke: "/danke/",
  faq: "/faq/",
  impressum: "/impressum/",
  datenschutz: "/datenschutz/",
  cookies: "/cookies/",
} as const;

/** Absolute URL helper — always use this for canonical, OG and JSON-LD URLs. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Stable @id values so schema entities can reference each other across pages. */
export const SCHEMA_IDS = {
  organisation: `${SITE_URL}/#organisation`,
  website: `${SITE_URL}/#website`,
  logo: `${SITE_URL}/#logo`,
} as const;
