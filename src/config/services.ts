import { routes } from "./site";

import imgImmobilienbewertung from "../assets/images/hero-bc-immowert-immobilienbewertung.jpg";
import imgBauschadensbewertung from "../assets/images/hero-bc-immowert-bauschadenbewertung.jpg";
import imgImmobilienbewertungForRestnutzung from "../assets/images/hero-bc-immowert-immobilienbewertung.jpg";
import imgEnergetisch from "../assets/images/hero-bc-immowert-energetische-modernisierung.jpg";
import imgEinzel from "../assets/images/hero-bc-immowert-einzelmodernisierung.jpg";
import imgAnVerkauf from "../assets/images/hero-bc-immowert-an-und-verkaufsberatung.jpg";
import imgAufmass from "../assets/images/hero-bc-immowert-aufmass.jpg";
import imgGrundrisse from "../assets/images/hero-bc-immowert-digitale-grundrisse.jpg";
import imgFlaechen from "../assets/images/hero-bc-immowert-flaechenberechnung.jpg";

import type { ImageMetadata } from "astro";

export interface Service {
  /** Service name — the card heading and the Service schema name. */
  name: string;
  /** Factual description, reused verbatim in structured data and llms.txt. */
  description: string;
  /** Destination page; must exist in `routes`. */
  path: string;
  /** Imported image — Astro derives AVIF/WebP/srcset from this at build time. */
  img: ImageMetadata;
  /** Descriptive alt text. */
  imgAlt: string;
}

/**
 * The services offered, in the order they appear on the homepage.
 *
 * Single source for the slider, the Service structured data and llms.txt, so
 * what a visitor reads, what Google parses and what an AI system retrieves can
 * never drift apart.
 */
export const SERVICES: Service[] = [
  {
    name: "Immobilienbewertung",
    description:
      "Eine fundierte Immobilienbewertung schafft Klarheit über den Wert Ihrer Immobilie. Wir liefern Ihnen die passende Bewertung zu Ihrem Anlass.",
    path: routes.immobilienbewertung,
    img: imgImmobilienbewertung,
    imgAlt: "Sachverständiger erstellt eine Immobilienbewertung am Schreibtisch",
  },
  {
    name: "Bauschadensbewertung",
    description:
      "Feuchtigkeit, Risse, Schimmel oder andere Bauschäden können unterschiedliche Ursachen haben. Wir untersuchen die Auffälligkeiten vor Ort, gehen der Ursache nach und zeigen Ihnen sinnvolle nächste Schritte auf.",
    path: routes.bauschadenbewertung,
    img: imgBauschadensbewertung,
    imgAlt: "Bausachverständige dokumentiert einen Bauschaden an einer Fassade",
  },
  {
    name: "Restnutzungsdauergutachten",
    description:
      "Sachverständige Ermittlung der tatsächlichen Restnutzungsdauer vermieteter Immobilien als Nachweis für eine höhere AfA gegenüber dem Finanzamt.",
    path: routes.restnutzungsdauergutachten,
    // TEMPORARY: reusing the Immobilienbewertung image, same as the page
    // itself does, until a dedicated photo exists for this service.
    img: imgImmobilienbewertungForRestnutzung,
    imgAlt: "Sachverständiger bei der Beurteilung der Restnutzungsdauer einer vermieteten Immobilie",
  },
  {
    name: "Energetische Modernisierung",
    description:
      "Nicht jede Immobilie muss komplett saniert werden. Wir prüfen, welche energetischen Maßnahmen für Ihr Gebäude sinnvoll sind, planen die Umsetzung und begleiten Sie auf Wunsch bis zur Ausführung.",
    path: routes.energetischeModernisierung,
    img: imgEnergetisch,
    imgAlt: "Modernisiertes Mehrfamilienhaus mit energieeffizienter Gebäudehülle",
  },
  {
    name: "Einzelmaßnahmen",
    description:
      "Nicht jedes Projekt erfordert eine Komplettsanierung. Gezielte Maßnahmen können bereits einen spürbaren Mehrwert schaffen – wir unterstützen Sie dabei.",
    path: routes.einzelmodernisierung,
    img: imgEinzel,
    imgAlt: "Feuchtigkeitsschaden an einer Innenwand vor der Sanierung",
  },
  {
    name: "An- und Verkaufsberatung",
    description:
      "Beim Kauf oder Verkauf einer Immobilie geht es um viel Geld. Wir prüfen den technischen und wirtschaftlichen Zustand, zeigen möglichen Investitionsbedarf auf und geben Ihnen eine unabhängige Grundlage für Ihre Entscheidung.",
    path: routes.anUndVerkaufsberatung,
    img: imgAnVerkauf,
    imgAlt: "Beratungsgespräch zum An- und Verkauf einer Immobilie",
  },
  {
    name: "Aufmaß",
    description:
      "Die Basis jeder Planung ist der tatsächliche Bestand. Mit modernem digitalem Aufmaß erfassen wir Ihre Immobilie präzise vor Ort – als Grundlage für Grundrisse, Flächenberechnungen und weitere Planungen.",
    path: routes.aufmass,
    img: imgAufmass,
    imgAlt: "Lasermessgerät projiziert Messlinien auf eine Wand beim Aufmaß",
  },
  {
    name: "Digitale Grundrisse",
    description:
      "Aus unserem Vor-Ort-Aufmaß oder vorhandenen Bestandsunterlagen erstellen wir aktuelle, maßstabsgetreue und auf Wunsch bemaßte Grundrisse – als PDF oder CAD-Datei.",
    path: routes.digitaleGrundrisse,
    img: imgGrundrisse,
    imgAlt: "Digitaler Grundriss einer Immobilie auf einem Tablet",
  },
  {
    name: "Flächenberechnung",
    description:
      "Wir erstellen nachvollziehbare Wohn- und Nutzflächenberechnungen nach WoFlV und DIN 277 – für Verkauf, Vermietung, Finanzierung, Immobilienbewertung oder Planung.",
    path: routes.flaechenberechnung,
    img: imgFlaechen,
    imgAlt: "Flächenberechnung einer Wohnung nach WoFlV und DIN 277",
  },
];

/** Plain data for structured data and llms.txt (no image bindings). */
export const SERVICE_ENTRIES = SERVICES.map(({ name, description, path }) => ({
  name,
  description,
  path,
}));
