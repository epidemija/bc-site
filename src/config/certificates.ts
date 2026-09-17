/**
 * DEKRA certificates — declared once and imported by every place that shows
 * them (the Über-uns section, the footer), so a registration number or a
 * validity date cannot drift between two hand-written copies.
 */
import dekraImmo from "../assets/certifications/SV-R-Immo-D1_062027_ger_tc_p.svg";
import dekraBauschaden from "../assets/certifications/SV-R-Bauschaden_122028_ger_tc_p.svg";

export interface Certificate {
  img: ImageMetadata;
  title: string;
  standard: string;
  scope: string;
  valid: string;
  registrierNr: string;
  /** Same-origin PDF, opened in the PdfLightbox rather than a new tab. */
  pdfHref: string;
  alt: string;
}

export const CERTIFICATES: Certificate[] = [
  {
    img: dekraImmo,
    title: "Sachverständiger Immobilienbewertung D1",
    standard: "DEKRA Standard Sachverständige/r für Immobilienbewertung D1",
    scope: "Standard EFH / ZFH",
    valid: "gültig bis 06/2027",
    registrierNr: "PC24413-103",
    pdfHref: "/zertifikate/dekra-zertifikat-immobilienbewertung-d1.pdf",
    alt: "DEKRA-Zertifikat: Sachverständiger für Immobilienbewertung D1, Standard EFH/ZFH, gültig bis 06/2027",
  },
  {
    img: dekraBauschaden,
    title: "Sachverständiger Bauschadensbewertung",
    standard: "DEKRA Standard Sachverständige/r für Bauschadensbewertung",
    scope: "Gewerkspezifisch / Spezialisierung",
    valid: "gültig bis 12/2028",
    registrierNr: "PC25402-00249",
    pdfHref: "/zertifikate/dekra-zertifikat-bauschadenbewertung.pdf",
    alt: "DEKRA-Zertifikat: Sachverständiger für Bauschadensbewertung, gewerkspezifisch/Spezialisierung, gültig bis 12/2028",
  },
];

/** DEKRA's own portal — lets a visitor confirm a registration number
 * directly with the issuer rather than just trusting the PDF on this site. */
export const DEKRA_VERIFY_URL =
  "https://www.dekra-certification.de/de/ueberpruefung-von-zertifikaten/";
