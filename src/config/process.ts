import type { ProcessStep } from "../components/sections/ProcessSteps.astro";

/**
 * How an assignment runs, from first contact to handover.
 *
 * Declared once and imported by every Gutachten page, because the process
 * genuinely is the same one — a valuation and a damage assessment run through
 * the same five stages. Writing it twice would mean two blocks of near-identical
 * text on the site that drift apart the first time the office changes how it
 * works.
 *
 * The same array feeds the visible section and the HowTo structured data.
 */
export const ABLAUF_GUTACHTEN: ProcessStep[] = [
  {
    icon: "phone",
    title: "Kontaktaufnahme",
    text: "Sie nehmen Kontakt mit uns auf – telefonisch, per E-Mail oder über das Kontaktformular.",
  },
  {
    icon: "document",
    title: "Auftragsklärung",
    text: "Wir besprechen Ihr Anliegen und erfassen alle relevanten Informationen zu Ihrer Immobilie und dem Bewertungszweck.",
  },
  {
    icon: "building",
    title: "Objektbesichtigung und Datenaufnahme",
    text: "Vor Ort verschaffen wir uns einen umfassenden Eindruck und nehmen alle notwendigen Daten und Unterlagen auf.",
  },
  {
    icon: "analysis",
    title: "Auswertung und Erstellung des Gutachtens",
    text: "Wir werten alle Daten sorgfältig aus und erstellen Ihr Gutachten fundiert, neutral und nachvollziehbar.",
  },
  {
    icon: "report",
    title: "Übergabe des Gutachtens",
    text: "Sie erhalten das Gutachten in der vereinbarten Form – digital oder gedruckt.",
  },
];

/**
 * How an engineering assignment runs. Different from ABLAUF_GUTACHTEN on
 * purpose: a modernisation ends with construction being accompanied, not with a
 * report being handed over.
 */
export const ABLAUF_INGENIEUR: ProcessStep[] = [
  {
    icon: "phone",
    title: "Anfrage und Erstgespräch",
    text: "Wir besprechen Ihr Vorhaben und klären, was Sie erreichen möchten.",
  },
  {
    icon: "analysis",
    title: "Bewertung",
    text: "Analyse der technischen und wirtschaftlichen Rahmenbedingungen am Bestand.",
  },
  {
    icon: "document",
    title: "Konzept",
    text: "Entwicklung einer individuellen Lösung, abgestimmt auf Gebäude und Budget.",
  },
  {
    icon: "draft",
    title: "Planung",
    text: "Ausarbeitung der Planung und Koordinierung aller Beteiligten.",
  },
  {
    icon: "helmet",
    title: "Begleitung und Umsetzung",
    text: "Unterstützung während der Ausführung bis zur Fertigstellung.",
  },
];

/**
 * How a purchase or sale consultation runs. Different again: nothing is built
 * and no report is handed over — it ends with the client having a basis on
 * which to decide.
 */
export const ABLAUF_BERATUNG: ProcessStep[] = [
  {
    icon: "phone",
    title: "Anfrage",
    text: "Besprechung Ihres Vorhabens.",
  },
  {
    icon: "document",
    title: "Angebot und Beauftragung",
    text: "Individuelles Angebot und Beauftragung.",
  },
  {
    icon: "building",
    title: "Analyse und Bewertung",
    text: "Besichtigung vor Ort und Prüfung der Objektunterlagen.",
  },
  {
    icon: "analysis",
    title: "Beratung",
    text: "Chancen und Risiken aufzeigen.",
  },
  {
    icon: "check",
    title: "Entscheidung",
    text: "Fundierte Grundlage für Kauf oder Verkauf.",
  },
];

/**
 * How a documents assignment runs — Aufmaß, digitale Grundrisse and
 * Flächenberechnung all follow it, because for the office they are the same
 * job: measure on site, work the data up, hand the paperwork over. Declared
 * once so the three pages cannot drift apart.
 */
export const ABLAUF_UNTERLAGEN: ProcessStep[] = [
  {
    icon: "phone",
    title: "Anfrage",
    text: "Besprechung Ihres Vorhabens.",
  },
  {
    icon: "document",
    title: "Angebot und Auftrag",
    text: "Individuelles Angebot und Auftragserteilung.",
  },
  {
    icon: "building",
    title: "Aufmaß",
    text: "Präzise Aufnahme der Immobilie vor Ort.",
  },
  {
    icon: "analysis",
    title: "Auswertung",
    text: "Digitale Verarbeitung und Plausibilisierung der Daten.",
  },
  {
    icon: "report",
    title: "Übergabe",
    text: "Bereitstellung der gewünschten Unterlagen.",
  },
];

/**
 * How a digitale-Grundrisse assignment runs — its own five steps, close in
 * spirit to ABLAUF_UNTERLAGEN (Aufmaß shares the same underlying job) but
 * worded for this page specifically, per the client's own text.
 */
export const ABLAUF_GRUNDRISSE: ProcessStep[] = [
  {
    icon: "phone",
    title: "Anfrage",
    text: "Besprechung Ihres Vorhabens.",
  },
  {
    icon: "document",
    title: "Angebot und Auftrag",
    text: "Individuelles Angebot und Auftragserteilung.",
  },
  {
    icon: "building",
    title: "Aufmaß",
    text: "Präzise Aufnahme der Immobilie vor Ort.",
  },
  {
    icon: "draft",
    title: "Grundrisserstellung",
    text: "Erstellung des digitalen bemaßten Grundrisses.",
  },
  {
    icon: "report",
    title: "Übergabe",
    text: "Bereitstellung der bestellten Unterlagen.",
  },
];

/**
 * How a Flächenberechnung runs. Close to ABLAUF_UNTERLAGEN but not the same:
 * step three is checking the existing plans, not measuring — the calculation
 * can be built on documents that are still accurate.
 */
export const ABLAUF_FLAECHEN: ProcessStep[] = [
  {
    icon: "phone",
    title: "Anfrage",
    text: "Besprechung Ihres Vorhabens.",
  },
  {
    icon: "document",
    title: "Angebot und Auftrag",
    text: "Individuelles Angebot und Auftragserteilung.",
  },
  {
    icon: "draft",
    title: "Prüfung der Unterlagen",
    text: "Bestandspläne prüfen. Verwendung der Bestandsunterlagen oder neues Vor Ort Aufmaß.",
  },
  {
    icon: "analysis",
    title: "Auswertung",
    text: "Flächenberechnung nach WoFlV und DIN 277.",
  },
  {
    icon: "report",
    title: "Übergabe",
    text: "Bereitstellung der gewünschten Unterlagen.",
  },
];
