import { ORGANISATION, routes } from "./site";

/**
 * The one character sequence used to join title segments — between a
 * page's own keyword phrase and "Speyer", and between the whole title
 * and the brand name (see DEFAULTS.titleSuffix below). One constant so
 * every separator in every title changes together, never one at a time.
 */
const TITLE_SEP = " | ";

/**
 * Per-page SEO configuration.
 *
 * EVERY page of the website must have exactly one entry here. The build reads
 * this registry to render <head>, to emit sitemap.xml and to prerender the
 * static HTML — so adding a page here is what makes it exist for search
 * engines. Nothing about a page's metadata is written by hand in a component.
 */
export interface PageConfig {
  /** Route path, always with a trailing slash. Must be unique. */
  path: string;
  /**
   * <title>. Unique per page, ~50–60 characters, most specific words first.
   * The brand suffix is appended automatically — do not repeat it here.
   */
  title: string;
  /**
   * Meta description. Unique per page, ~140–160 characters, describes what the
   * page actually contains. Written for people, not for keyword density.
   */
  description: string;
  /** Indexable pages: "index, follow". Utility pages may opt out. */
  robots?: string;
  /** Open Graph type. "website" for the homepage, "article" for articles. */
  ogType?: "website" | "article" | "profile";
  /**
   * Social sharing image, absolute path from the site root. Should be a real
   * image of the business (1200×630 recommended).
   */
  ogImage?: string;
  /** Alt text for the OG image. */
  ogImageAlt?: string;
  /** Include in sitemap.xml? Set false for pages that should not be listed. */
  sitemap?: boolean;
  /** Relative priority within the site (0.0–1.0). */
  sitemapPriority?: number;
  /** Expected update cadence — an honest estimate, not a ranking lever. */
  sitemapChangeFreq?: "daily" | "weekly" | "monthly" | "yearly";
  /**
   * Ancestors between the homepage and this page, excluding both. An empty
   * array means "direct child of the homepage" and still produces breadcrumb
   * structured data; leave the key out entirely only for the homepage.
   */
  breadcrumbs?: { name: string; path: string }[];
  /** Short name for breadcrumbs. Defaults to the title before its dash. */
  breadcrumbLabel?: string;
}

const DEFAULT_OG_IMAGE = "/social/og-startseite.jpg";

/**
 * The homepage entry doubles as the reference example for every future page.
 */
export const PAGES: Record<string, PageConfig> = {
  about: {
    path: routes.about,
    title: `Bauingenieur & Sachverständiger für Immobilien${TITLE_SEP}Speyer`,
    description:
      "Bauingenieur und DEKRA-zertifizierter Sachverständiger für Immobilienbewertung, Bauschäden, Ingenieurleistungen und technische Beratung rund um Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt:
      "BC IMMOWERT – Ingenieur- und Sachverständigenbüro für Immobilien in Speyer",
    sitemap: true,
    sitemapPriority: 0.8,
    sitemapChangeFreq: "yearly",
    // First level below the homepage: BreadcrumbList schema is still emitted,
    // but no visual trail is shown (see Breadcrumbs.astro).
    breadcrumbs: [],
    breadcrumbLabel: "Über uns",
  },

  gutachten: {
    path: routes.gutachten,
    title: "Gutachten für Immobilien und Bauschäden in Speyer",
    description:
      "Immobilienbewertungen, Kurzgutachten, Verkehrswertgutachten und Bauschadensbewertungen für private und gewerbliche Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt:
      "BC IMMOWERT – Gutachten für Immobilien und Bauschäden in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Gutachten",
  },

  immobilienbewertung: {
    path: routes.immobilienbewertung,
    title: `Immobilienbewertung & Wertermittlung${TITLE_SEP}Speyer`,
    description:
      "Immobilienbewertung, Wertermittlung, Kurzgutachten und Verkehrswertgutachten für Kauf, Verkauf, Erbschaft, Scheidung, Vermögen und Finanzierungen.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Immobilienbewertung und Verkehrswertgutachten in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    // Second level: this page gets a visible breadcrumb trail as well as the
    // structured data — see Breadcrumbs.astro.
    breadcrumbs: [{ name: "Gutachten", path: routes.gutachten }],
    breadcrumbLabel: "Immobilienbewertung",
  },

  bauschadenbewertung: {
    path: routes.bauschadenbewertung,
    title: `Bauschadensbewertung & Baumängel${TITLE_SEP}Speyer`,
    description:
      "Bewertung von Bauschäden, Baumängeln, Feuchtigkeit, Schimmel, Wasserschäden und Rissen inklusive Ursachenanalyse und Schadensbewertung.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Bauschadensbewertung und Ursachenanalyse in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Gutachten", path: routes.gutachten }],
    breadcrumbLabel: "Bauschadensbewertung",
  },

  restnutzungsdauergutachten: {
    path: routes.restnutzungsdauergutachten,
    title: "Restnutzungsdauergutachten & AfA in Speyer",
    description:
      "Restnutzungsdauergutachten für vermietete Immobilien: kürzere tatsächliche Nutzungsdauer prüfen und Grundlage für eine höhere Gebäude-AfA schaffen.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Restnutzungsdauergutachten in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Gutachten", path: routes.gutachten }],
    breadcrumbLabel: "Restnutzungsdauergutachten",
  },

  ingenieurleistungen: {
    path: routes.ingenieurleistungen,
    title: `Ingenieurleistungen rund um Immobilien${TITLE_SEP}Speyer`,
    description:
      "Ingenieurleistungen für Umbauten, Modernisierungen, Nutzungsänderungen, Bauplanung, Projektbegleitung und technische Beratung von Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Ingenieurleistungen für Modernisierung und Umbau im Bestand",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Ingenieurleistungen",
  },

  energetischeModernisierung: {
    path: routes.energetischeModernisierung,
    title: `Energetische Modernisierung von Immobilien${TITLE_SEP}Speyer`,
    description:
      "Planung energetischer Modernisierungen, Sanierungskonzepte, Energieeinsparung, Gebäudeverbesserung und wirtschaftliche Optimierung von Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – energetische Modernisierung von Bestandsimmobilien",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Ingenieurleistungen", path: routes.ingenieurleistungen }],
    breadcrumbLabel: "Energetische Modernisierung",
  },

  einzelmodernisierung: {
    path: routes.einzelmodernisierung,
    title: `Umbauten & Modernisierung von Immobilien${TITLE_SEP}Speyer`,
    description:
      "Planung und Begleitung von Umbauten, Modernisierungen, Grundrissänderungen, Sanierungen und baulichen Einzelmaßnahmen für Wohn- & Gewerbeimmobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Einzelmaßnahmen, Umbau und Teilmodernisierung im Bestand",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Ingenieurleistungen", path: routes.ingenieurleistungen }],
    breadcrumbLabel: "Einzelmaßnahmen",
  },

  dienstleistungen: {
    path: routes.dienstleistungen,
    title: "Dienstleistungen – Aufmaß, Grundrisse, Flächen",
    description:
      "Vor-Ort-Aufmaß, digitale Grundrisse, Wohn- und Nutzflächenberechnung nach WoFlV und " +
      "DIN 277 sowie An- und Verkaufsberatung – vom Bauingenieur in Speyer.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Aufmaß, digitale Grundrisse und Flächenberechnung in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Dienstleistungen",
  },

  anUndVerkaufsberatung: {
    path: routes.anUndVerkaufsberatung,
    title: `An- & Verkaufsberatung für Immobilien${TITLE_SEP}Speyer`,
    description:
      "Ankaufsberatung, Verkaufsberatung, Objektprüfung, Kaufpreisbewertung, Risikoanalyse und technische Begleitung beim Kauf oder Verkauf von Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – An- und Verkaufsberatung für Immobilien in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Dienstleistungen", path: routes.dienstleistungen }],
    breadcrumbLabel: "An- und Verkaufsberatung",
  },

  aufmass: {
    path: routes.aufmass,
    title: `Gebäudeaufmaß, Grundrisse & Laservermessung${TITLE_SEP}Speyer`,
    description:
      "Digitales Gebäudeaufmaß, Laservermessung, Bestandsaufnahme und Vermessung für Grundrisse, Objektscan, Flächenberechnungen und Planungen.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – lasergenaues Gebäudeaufmaß in Speyer",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Dienstleistungen", path: routes.dienstleistungen }],
    breadcrumbLabel: "Aufmaß",
  },

  digitaleGrundrisse: {
    path: routes.digitaleGrundrisse,
    title: `Digitale Grundrisse für Immobilien${TITLE_SEP}Speyer`,
    description:
      "Digitale Grundrisse, Bestandspläne, Ansichten und Schnitte für Verkauf, Vermietung, Umbau, Planung und Dokumentation von Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – digitale, bemaßte Grundrisse für Bestandsimmobilien",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Dienstleistungen", path: routes.dienstleistungen }],
    breadcrumbLabel: "Digitale Grundrisse",
  },

  flaechenberechnung: {
    path: routes.flaechenberechnung,
    title: `Wohn- & Nutzflächenberechnung nach WoFlV${TITLE_SEP}Speyer`,
    description:
      "Wohnflächenberechnung nach WoFlV, Nutzflächenberechnung nach DIN 277 und Flächenermittlung für Verkauf, Vermietung, Finanzierung und Gutachten.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Wohn- und Nutzflächenberechnung nach WoFlV und DIN 277",
    sitemap: true,
    sitemapPriority: 0.9,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [{ name: "Dienstleistungen", path: routes.dienstleistungen }],
    breadcrumbLabel: "Flächenberechnung",
  },

  kontakt: {
    path: routes.kontakt,
    title: `Kontakt${TITLE_SEP}Ingenieur- & Sachverständigenbüro${TITLE_SEP}Speyer`,
    description:
      "Kontakt für Immobilienbewertung, Bauschadensbewertung, Ankaufsberatung, Aufmaß und Ingenieurleistungen. Unverbindliche Anfrage online stellen.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Kontakt",
    sitemap: true,
    sitemapPriority: 0.8,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Kontakt",
  },

  danke: {
    path: routes.danke,
    title: "Vielen Dank für Ihre Anfrage",
    description:
      "Ihre Anfrage ist bei BC IMMOWERT eingegangen. Wir melden uns in Kürze persönlich bei Ihnen.",
    // Only reached via redirect right after a successful contact-form send —
    // nobody should land here from a search result, and there is nothing
    // here for a crawler to index.
    robots: "noindex, nofollow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Vielen Dank für Ihre Anfrage",
    sitemap: false,
    breadcrumbs: [],
    breadcrumbLabel: "Vielen Dank",
  },

  faq: {
    path: routes.faq,
    title: `Häufige Fragen zu Immobilien & Bauschäden${TITLE_SEP}Speyer`,
    description:
      "Antworten zu Immobilienbewertung, Bauschäden, Modernisierung, Aufmaß, Grundrissen " +
      "und Flächenberechnung – vom Sachverständigen in Speyer.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Häufige Fragen",
    sitemap: true,
    sitemapPriority: 0.7,
    sitemapChangeFreq: "monthly",
    breadcrumbs: [],
    breadcrumbLabel: "Häufige Fragen",
  },

  impressum: {
    path: routes.impressum,
    title: "Impressum",
    description:
      "Anbieterkennzeichnung nach § 5 DDG für BC IMMOWERT, Ingenieur- und " +
      "Sachverständigenbüro für Immobilien in Speyer.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Impressum",
    sitemap: true,
    sitemapPriority: 0.3,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Impressum",
  },

  datenschutz: {
    path: routes.datenschutz,
    title: "Datenschutzerklärung",
    description:
      "Informationen nach Art. 13 DSGVO: welche Daten beim Besuch dieser Website " +
      "anfallen, wozu sie verwendet werden und welche Rechte Sie haben.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Datenschutzerklärung",
    sitemap: true,
    sitemapPriority: 0.3,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Datenschutz",
  },

  cookies: {
    path: routes.cookies,
    title: "Cookie-Einstellungen",
    description:
      "Welche Cookies und lokalen Speicherobjekte diese Website verwendet, welche externen " +
      "Dienste nur mit Ihrer Einwilligung laden und wie Sie Ihre Entscheidung jederzeit anpassen.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "BC IMMOWERT – Cookie-Einstellungen",
    sitemap: true,
    sitemapPriority: 0.2,
    sitemapChangeFreq: "yearly",
    breadcrumbs: [],
    breadcrumbLabel: "Cookie-Einstellungen",
  },

  home: {
    path: routes.home,
    // Client's own wording. The brand suffix is added automatically by
    // pageTitle() in src/seo/head.ts, so the brand name does not belong here.
    title: `Immobilienbewertung & Ingenieurleistungen${TITLE_SEP}Speyer`,
    description:
      "Immobilienbewertung, Bauschadensbewertung, An- und Verkaufsberatung, Aufmaß, Grundrisse, Flächenberechnungen und Ingenieurleistungen für Immobilien.",
    robots: "index, follow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt:
      "Speyerer Dom bei Sonnenuntergang – BC IMMOWERT, Ingenieur- und Sachverständigenbüro für Immobilien",
    sitemap: true,
    sitemapPriority: 1.0,
    sitemapChangeFreq: "monthly",
  },
};

/** All pages that belong in sitemap.xml, in stable order. */
export function sitemapPages(): PageConfig[] {
  return Object.values(PAGES)
    .filter((p) => p.sitemap !== false && !(p.robots ?? "").includes("noindex"))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export const DEFAULTS = {
  robots: "index, follow",
  ogType: "website" as const,
  ogImage: DEFAULT_OG_IMAGE,
  titleSuffix: `${TITLE_SEP}${ORGANISATION.name}`,
  /** Titles that already contain the brand name are not suffixed again. */
  maxTitleLength: 65,
};
