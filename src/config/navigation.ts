import { routes } from "./site";

export interface NavItem {
  name: string;
  sub: string;
  href: string;
}

export interface NavGroup {
  title: string;
  href: string;
  items: NavItem[];
}

/**
 * The site's service navigation — one source for the header dropdown, the
 * mobile menu, the footer and llms.txt. Adding a page means adding it here, so
 * no page can end up orphaned (unreachable from any internal link).
 */
export const LEISTUNGEN: NavGroup[] = [
  {
    title: "Gutachten",
    href: routes.gutachten,
    items: [
      {
        name: "Immobilienbewertung",
        sub: "Marktgerechte Wertermittlung",
        href: routes.immobilienbewertung,
      },
      {
        name: "Bauschadensbewertung",
        sub: "Ursachenanalyse und Bewertung",
        href: routes.bauschadenbewertung,
      },
      {
        name: "Restnutzungsdauergutachten",
        sub: "Zur Vorlage beim Finanzamt",
        href: routes.restnutzungsdauergutachten,
      },
    ],
  },
  {
    title: "Ingenieurleistungen",
    href: routes.ingenieurleistungen,
    items: [
      {
        name: "Energetische Modernisierung",
        sub: "Planung und Begleitung",
        href: routes.energetischeModernisierung,
      },
      {
        name: "Einzelmaßnahmen",
        sub: "Gezielte Maßnahme",
        href: routes.einzelmodernisierung,
      },
    ],
  },
  {
    title: "Dienstleistungen",
    href: routes.dienstleistungen,
    items: [
      {
        name: "An- und Verkaufsberatung",
        sub: "Beratung und Begleitung",
        href: routes.anUndVerkaufsberatung,
      },
      { name: "Aufmaß", sub: "Präzise Bestandsaufnahme", href: routes.aufmass },
      {
        name: "Digitale Grundrisse",
        sub: "Maßstabgetreue Darstellung",
        href: routes.digitaleGrundrisse,
      },
      {
        name: "Flächenberechnung",
        sub: "Nach WoFlV und DIN 277",
        href: routes.flaechenberechnung,
      },
    ],
  },
];

/** Primary navigation shown in the header. */
export const PRIMARY_NAV = [
  { name: "Startseite", href: routes.home },
  { name: "Über uns", href: routes.about },
];

/** Footer: entry points into the site. */
export const FOOTER_PAGES = [
  { name: "Startseite", href: routes.home },
  { name: "Über uns", href: routes.about },
  { name: "Gutachten", href: routes.gutachten },
  { name: "Ingenieurleistungen", href: routes.ingenieurleistungen },
  { name: "Dienstleistungen", href: routes.dienstleistungen },
];

/** Footer: legal and support pages. */
export const FOOTER_INFO = [
  { name: "FAQ", href: routes.faq },
  { name: "Datenschutz", href: routes.datenschutz },
  { name: "Cookie-Einstellungen", href: routes.cookies },
  { name: "Impressum", href: routes.impressum },
  { name: "Kontakt", href: routes.kontakt },
];
