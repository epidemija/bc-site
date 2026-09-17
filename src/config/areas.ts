/**
 * Where the office works, written out for readers.
 *
 * Declared once and imported by every page that states the service area,
 * because it is one fact about one office. Two hand-written copies of a town
 * list is how a site ends up claiming two different service areas.
 *
 * These are the place names clients actually search for, which is why they are
 * rendered as visible text and not only as `areaServed` in the structured data.
 */
export interface AreaGroup {
  title: string;
  /** Towns, as one sentence ending in a full stop. */
  orte: string;
}

export const EINSATZGEBIETE: AreaGroup[] = [
  {
    title: "Speyer und Umgebung",
    orte:
      "Speyer, Dudenhofen, Römerberg, Harthausen, Hanhofen, Haßloch, " +
      "Dannstadt-Schauernheim, Schifferstadt, Limburgerhof, Mutterstadt, " +
      "Ludwigshafen, Neuhofen, Otterstadt, Waldsee und Böhl-Iggelheim.",
  },
  {
    title: "Vorderpfalz, Südpfalz und Rhein-Pfalz-Kreis",
    orte:
      "Bad Dürkheim, Neustadt an der Weinstraße, Landau in der Pfalz, " +
      "Bad Bergzabern, Germersheim, Kandel und Wörth am Rhein.",
  },
  {
    title: "Angrenzendes Baden-Württemberg",
    orte:
      "Mannheim, Schwetzingen, Hockenheim, Waghäusel, Altlußheim, Reilingen, " +
      "Philippsburg, Karlsruhe und Heidelberg.",
  },
];

/** The sentence that introduces the list. Same office, same radius, one text. */
export const EINSATZGEBIET_INTRO =
  "Unser Büro befindet sich in Speyer. Von hier aus betreuen wir Eigentümer, Käufer, " +
  "Verkäufer, Unternehmen, Banken und Institutionen in einem Umkreis von rund 150 Kilometern.";

export const EINSATZGEBIET_NACHSATZ =
  "Auf Anfrage begleiten wir selbstverständlich auch Projekte über diese Region hinaus.";
