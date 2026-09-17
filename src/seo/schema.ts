import { ORGANISATION, SCHEMA_IDS, SITE_LANG, SITE_URL, absoluteUrl } from "../config/site";
import { pageTitle } from "./head";
import type { PageConfig } from "../config/pages";

/**
 * Schema.org (JSON-LD) builders.
 *
 * RULES — these are not optional:
 *  1. Only describe things that are genuinely true and visible on the page.
 *  2. Never emit reviews, ratings, awards or price data that do not exist.
 *  3. Entities keep stable @id values so pages can reference one shared
 *     organisation node instead of redefining it and creating conflicting
 *     signals.
 *  4. If a page has no meaningful structured data beyond WebPage, emit only
 *     WebPage. Adding schema for its own sake is a quality risk, not a gain.
 */

type Json = Record<string, unknown>;

/**
 * The organisation node. Modelled as ProfessionalService (a LocalBusiness
 * subtype) because the business has a physical address, service area, opening
 * hours and a phone number — all visible in the footer.
 */
export function organisationSchema(): Json {
  const { address, openingHours } = ORGANISATION;

  return {
    "@type": "ProfessionalService",
    "@id": SCHEMA_IDS.organisation,
    name: ORGANISATION.name,
    legalName: ORGANISATION.name,
    description: ORGANISATION.description,
    url: SITE_URL,
    email: ORGANISATION.email,
    telephone: ORGANISATION.phoneE164,
    image: absoluteUrl("/social/og-startseite.jpg"),
    logo: {
      "@type": "ImageObject",
      "@id": SCHEMA_IDS.logo,
      url: absoluteUrl("/social/logo-bc-immowert.png"),
      contentUrl: absoluteUrl("/social/logo-bc-immowert.png"),
      caption: `${ORGANISATION.name} – ${ORGANISATION.tagline}`,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    areaServed: ORGANISATION.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: openingHours.days,
        opens: openingHours.opens,
        closes: openingHours.closes,
      },
    ],
    // Real, verifiable certifications — mirrored from the DEKRA seals shown in
    // the footer. Remove an entry here the moment a certificate lapses.
    hasCredential: ORGANISATION.credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: c.name,
      recognizedBy: { "@type": "Organization", name: c.issuer },
    })),
    knowsLanguage: ["de"],
    // sameAs is intentionally omitted while no official profiles exist.
    ...(ORGANISATION.sameAs.length > 0 ? { sameAs: [...ORGANISATION.sameAs] } : {}),
  };
}

/** The website node. */
export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    url: SITE_URL,
    name: ORGANISATION.name,
    description: ORGANISATION.description,
    inLanguage: SITE_LANG,
    publisher: { "@id": SCHEMA_IDS.organisation },
  };
}

/** The page node, linked to the website and organisation. */
export function webPageSchema(page: PageConfig): Json {
  const url = absoluteUrl(page.path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: pageTitle(page),
    description: page.description,
    inLanguage: SITE_LANG,
    isPartOf: { "@id": SCHEMA_IDS.website },
    about: { "@id": SCHEMA_IDS.organisation },
    ...(page.ogImage ? { primaryImageOfPage: absoluteUrl(page.ogImage) } : {}),
  };
}

/**
 * The name a page carries in a breadcrumb: short, human, no brand suffix.
 * The <title> is written for the search-results headline and is too long here.
 */
export function breadcrumbLabel(page: PageConfig): string {
  return page.breadcrumbLabel ?? page.title.split(/\s[–-]\s/)[0].trim();
}

/**
 * BreadcrumbList — emit only when a page genuinely sits below the homepage.
 * The homepage itself gets no breadcrumbs.
 */
export function breadcrumbSchema(page: PageConfig): Json | null {
  // `breadcrumbs` lists the ancestors between the homepage and this page, so an
  // empty array is meaningful — a direct child of the homepage still deserves a
  // "Startseite › Über uns" trail in search results. Only the homepage itself,
  // which has no key at all, is skipped.
  if (!page.breadcrumbs) return null;

  const trail = [
    { name: "Startseite", path: "/" },
    ...page.breadcrumbs,
    { name: breadcrumbLabel(page), path: page.path },
  ];

  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(page.path)}#breadcrumb`,
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ServiceEntry {
  name: string;
  description: string;
  path: string;
}

/**
 * Service nodes for the offerings actually listed on the page. Each one must
 * correspond to a service block visible to the reader — no phantom services.
 */
export function serviceSchemas(services: ServiceEntry[]): Json[] {
  return services.map((s) => ({
    "@type": "Service",
    "@id": `${absoluteUrl(s.path)}#service`,
    name: s.name,
    description: s.description,
    url: absoluteUrl(s.path),
    serviceType: s.name,
    provider: { "@id": SCHEMA_IDS.organisation },
    areaServed: ORGANISATION.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
  }));
}

/**
 * A service with priced offers.
 *
 * Only ever built from the same array the price cards render, so the figures in
 * the markup and the figures in the structured data are the same figures. Every
 * price here is a starting price, which is what `minPrice` means — quoting it
 * as `price` would tell Google a fixed fee that does not exist.
 */
export function servicePriceSchema(input: {
  page: PageConfig;
  name: string;
  description: string;
  offers: { name: string; description: string; minPrice: number }[];
}): Json {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(input.page.path)}#service`,
    name: input.name,
    description: input.description,
    serviceType: input.name,
    url: absoluteUrl(input.page.path),
    provider: { "@id": SCHEMA_IDS.organisation },
    areaServed: ORGANISATION.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    offers: input.offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      description: offer.description,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        minPrice: offer.minPrice,
        // valueAddedTaxIncluded is deliberately absent: stating it either way
        // without knowing how the office invoices would be a false claim.
        // Add it once the VAT treatment is confirmed.
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": SCHEMA_IDS.organisation },
    })),
  };
}

/**
 * The steps of an assignment, as HowTo.
 *
 * Built from the same array the Ablauf section renders, so the order a visitor
 * reads is the order a search engine is given.
 */
export function howToSchema(input: {
  page: PageConfig;
  name: string;
  steps: { title: string; text: string }[];
}): Json {
  return {
    "@type": "HowTo",
    "@id": `${absoluteUrl(input.page.path)}#ablauf`,
    name: input.name,
    step: input.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.text,
      url: `${absoluteUrl(input.page.path)}#ablauf-titel`,
    })),
  };
}

/**
 * Assembles one @graph document. A single graph per page keeps entity
 * references resolvable and avoids the duplicate-organisation problem that
 * comes from sprinkling separate JSON-LD blocks around a page.
 */
export function buildSchemaGraph(nodes: (Json | null)[]): string {
  const graph = nodes.filter((n): n is Json => n !== null);
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

/** Convenience: the standard graph for the homepage. */
export function homepageSchema(page: PageConfig, services: ServiceEntry[]): string {
  return buildSchemaGraph([
    organisationSchema(),
    websiteSchema(),
    webPageSchema(page),
    ...serviceSchemas(services),
  ]);
}

/**
 * FAQPage — lets Google show the questions as an expandable block under the
 * result. Built from the same array the visible accordion renders, so the two
 * cannot drift; a mismatch between them is a manual-action risk, not just an
 * inconsistency.
 *
 * Google only surfaces one FAQPage per page, so a service page passes its own
 * category and /faq/ passes all of them.
 */
export function faqSchema(entries: { q: string; a: string[] }[]): Json | null {
  if (!entries.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        // Rich results require the answer as text; paragraphs are joined the
        // way a reader would hear them, not with markup.
        text: entry.a.join(" "),
      },
    })),
  };
}

/** Convenience: the standard graph for any subpage. */
export function subpageSchema(page: PageConfig, extra: (Json | null)[] = []): string {
  return buildSchemaGraph([
    organisationSchema(),
    websiteSchema(),
    webPageSchema(page),
    breadcrumbSchema(page),
    ...extra,
  ]);
}
