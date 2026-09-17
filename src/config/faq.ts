import { routes } from "./site";

/**
 * The site's frequently asked questions.
 *
 * SINGLE SOURCE. Every question is written once here and rendered in three
 * places from this one array: the section at the foot of the relevant service
 * page, the /faq/ overview, and the FAQPage structured data. A question can
 * therefore never say one thing to a visitor and another to Google.
 *
 * A category maps 1:1 onto a service page, and every category belongs to one of
 * the three Leistungsbereiche the navigation already uses. That is what lets
 * the overview page group them the same way the header dropdown does, without a
 * second list to keep in step.
 *
 * Adding a question: add it to the right category's `entries`. It appears on
 * the service page, on /faq/ and in the structured data with no further edits.
 */

/** The three Leistungsbereiche, in navigation order. */
export type FaqGroup = "Gutachten" | "Ingenieurleistungen" | "Dienstleistungen";

export interface FaqEntry {
  /** The question, as a visitor would ask it. */
  q: string;
  /**
   * The answer, one string per paragraph. An array rather than a single string
   * because several answers genuinely need two or three paragraphs, and
   * splitting on "\n" in the template would make the data format implicit.
   */
  a: string[];
}

export interface FaqCategory {
  /** Stable id — the anchor on /faq/ and the key used to look the set up. */
  id: string;
  /** Visible category name. */
  title: string;
  /** Which Leistungsbereich this belongs to. */
  group: FaqGroup;
  /** The service page these questions belong to; must exist in `routes`. */
  path: string;
  entries: FaqEntry[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  /* ------------------------------------------------------------ Gutachten */
  {
    id: "immobilienbewertung",
    title: "Immobilienbewertung",
    group: "Gutachten",
    path: routes.immobilienbewertung,
    entries: [
      {
        q: "Welche Immobilienbewertung benötige ich?",
        a: [
          "Das hängt vom Verwendungszweck ab. Für eine erste Preisorientierung reicht häufig eine Wertermittlung aus. Wird eine ausführlichere Begründung benötigt, beispielsweise für Erbschaften oder Vermögensübersichten, kann ein Kurzgutachten sinnvoll sein. Ein Verkehrswertgutachten wird in der Regel im Streitfall oder dann benötigt, wenn Behörden, Gerichte oder andere Institutionen eine umfangreiche und nachvollziehbare Bewertung verlangen. Gerne beraten wir Sie, welche Bewertungsform für Ihr Anliegen die richtige ist.",
        ],
      },
      {
        q: "Was ist der Unterschied zwischen einer Wertermittlung, einem Kurzgutachten und einem Verkehrswertgutachten?",
        a: [
          "Eine Wertermittlung dient der schnellen Marktwertorientierung und eignet sich beispielsweise für Kauf- oder Verkaufsentscheidungen.",
          "Ein Kurzgutachten enthält zusätzlich eine ausführlichere Beschreibung der Immobilie sowie eine nachvollziehbare Herleitung des Marktwertes und wird häufig für private oder steuerliche Zwecke genutzt.",
          "Ein Verkehrswertgutachten wird nach den gesetzlichen Vorgaben (§ 194 BauGB) erstellt und erfüllt die Anforderungen von Behörden, Gerichten, Banken oder anderen Institutionen.",
        ],
      },
      {
        q: "Welche Unterlagen werden für eine Immobilienbewertung benötigt?",
        a: [
          "Für eine möglichst genaue Immobilienbewertung benötigen wir verschiedene Objektunterlagen. Dazu gehören unter anderem Grundrisse, Wohn- und Nutzflächenberechnungen, Bauunterlagen, die Baubeschreibung, ein aktueller Grundbuchauszug sowie Informationen zu bereits durchgeführten Modernisierungen oder besonderen Gegebenheiten der Immobilie.",
          "Damit Sie schnell einen Überblick erhalten, stellen wir Ihnen eine Checkliste mit allen benötigten Unterlagen zur Verfügung. Sollten einzelne Dokumente fehlen oder nicht mehr aktuell sein, unterstützen wir Sie gerne bei der Beschaffung oder erstellen die erforderlichen Unterlagen – beispielsweise durch ein Vor-Ort-Aufmaß, digitale Grundrisse oder eine neue Flächenberechnung.",
        ],
      },
      {
        q: "Wie lange dauert die Erstellung einer Immobilienbewertung?",
        a: [
          "Die Bearbeitungszeit richtet sich nach der Art der Bewertung und dem Umfang der Immobilie. Voraussetzung ist, dass alle erforderlichen Unterlagen vollständig vorliegen und die Vor-Ort-Besichtigung bereits stattgefunden hat.",
          "Wertermittlung: in der Regel innerhalb von 2 bis 3 Werktagen. Kurzgutachten: ca. 7 Werktage. Verkehrswertgutachten: ca. 14 Werktage.",
        ],
      },
    ],
  },
  {
    id: "bauschadenbewertung",
    title: "Bauschadensbewertung",
    group: "Gutachten",
    path: routes.bauschadenbewertung,
    entries: [
      {
        q: "Wann sollte ich einen Bauschadensgutachter hinzuziehen?",
        a: [
          "Immer dann, wenn Sie einen Bauschaden feststellen oder einen Verdacht auf Feuchtigkeit, Schimmel, Risse oder andere bauliche Mängel haben. Je früher die Ursache ermittelt wird, desto besser lassen sich Folgeschäden und unnötige Sanierungskosten vermeiden.",
        ],
      },
      {
        q: "Welche Schäden können beurteilt werden?",
        a: [
          "Wir bewerten unter anderem Feuchtigkeitsschäden, Schimmelbefall, Wasserschäden, Rissbildungen, Putzabplatzungen, Baumängel sowie weitere Schäden an Wohn- und Gewerbeimmobilien. Ziel ist es, die Ursache des Schadens zu ermitteln und eine fachliche Einschätzung des Schadensumfangs zu geben.",
        ],
      },
      {
        q: "Kann ich den Schaden einfach reparieren lassen?",
        a: [
          "Davon raten wir in vielen Fällen zunächst ab. Wird lediglich der sichtbare Schaden beseitigt, ohne die eigentliche Ursache zu beheben, tritt das Problem häufig nach kurzer Zeit erneut auf. Deshalb sollte zunächst geklärt werden, wodurch der Schaden entstanden ist und welche Maßnahmen dauerhaft erforderlich sind.",
        ],
      },
      {
        q: "Wie lange dauert die Erstellung einer Bauschadensbewertung?",
        a: [
          "Die Bearbeitungszeit richtet sich nach Art und Umfang des Schadens. Nach der Vor-Ort-Besichtigung und dem Vorliegen aller erforderlichen Informationen erhalten Sie Ihre schriftliche Stellungnahme in der Regel innerhalb von 10 Werktagen.",
        ],
      },
      {
        q: "Wie wird die Ursache eines Bauschadens festgestellt?",
        a: [
          "Das hängt vom jeweiligen Schadensbild ab. Neben der Besichtigung können beispielsweise Feuchtemessungen, vorhandene Bau- und Entwässerungspläne, frühere Sanierungsmaßnahmen oder die Konstruktion angrenzender Bauteile wichtige Hinweise liefern. Falls weiterführende Untersuchungen erforderlich sind, besprechen wir dies mit Ihnen.",
        ],
      },
      {
        q: "Erhalte ich eine schriftliche Einschätzung?",
        a: [
          "Ja. Sie erhalten eine schriftliche Stellungnahme, in der wir die wesentlichen Feststellungen, die fachliche Einschätzung und Empfehlungen zum weiteren Vorgehen nachvollziehbar zusammenfassen. Anschließend können wir die Ergebnisse gemeinsam besprechen.",
        ],
      },
    ],
  },
  {
    id: "restnutzungsdauergutachten",
    title: "Restnutzungsdauergutachten",
    group: "Gutachten",
    path: routes.restnutzungsdauergutachten,
    entries: [
      {
        q: "Was ist ein Restnutzungsdauergutachten?",
        a: [
          "Ein Restnutzungsdauergutachten untersucht, wie lange ein Gebäude unter Berücksichtigung seiner individuellen Gegebenheiten voraussichtlich noch seiner Zweckbestimmung entsprechend genutzt werden kann. Das Ergebnis wird sachverständig hergeleitet und schriftlich dokumentiert.",
        ],
      },
      {
        q: "Für welche Immobilien kommt ein Gutachten infrage?",
        a: [
          "Insbesondere für vermietete Bestandsimmobilien wie Eigentumswohnungen, Ein- und Mehrfamilienhäuser, Wohn- und Geschäftshäuser sowie bestimmte gewerblich genutzte Immobilien kann eine Prüfung sinnvoll sein.",
        ],
      },
      {
        q: "Muss die Immobilie vor Ort besichtigt werden?",
        a: [
          "Ja. Wir möchten die Restnutzungsdauer nicht allein anhand von Baujahr und Unterlagen bestimmen. Deshalb betrachten wir das Gebäude vor Ort und beziehen die tatsächlichen Gegebenheiten in unsere Einschätzung ein.",
        ],
      },
      {
        q: "Kann ich das Gutachten beim Finanzamt einreichen?",
        a: [
          "Das Gutachten ist für den Nachweis einer sachverständig ermittelten tatsächlichen Restnutzungsdauer bestimmt. Das Gutachten kann dann beim Finanzamt vorgelegt werden.",
        ],
      },
      {
        q: "Kann mein Steuerberater das Gutachten verwenden?",
        a: [
          "Ja. Das Gutachten kann Ihrem Steuerberater als Grundlage für die Prüfung und Geltendmachung einer kürzeren tatsächlichen Nutzungsdauer zur Verfügung gestellt werden.",
        ],
      },
    ],
  },

  /* -------------------------------------------------- Ingenieurleistungen */
  {
    id: "energetische-modernisierung",
    title: "Energetische Modernisierung",
    group: "Ingenieurleistungen",
    path: routes.energetischeModernisierung,
    entries: [
      {
        q: "Wo finde ich verlässliche Fachfirmen für die Umsetzung der Maßnahmen?",
        a: [
          "Auf Wunsch stellen wir Ihnen unser langjährig aufgebautes Netzwerk regionaler Fachfirmen zur Verfügung. Wir arbeiten ausschließlich mit qualifizierten, zuverlässigen und seriösen Handwerksbetrieben zusammen, die wir aus gemeinsamen Projekten kennen und deren Arbeitsweise wir schätzen. So profitieren Sie nicht nur von einer fachgerechten Planung, sondern auch von kompetenten Ansprechpartnern für die spätere Umsetzung.",
        ],
      },
      {
        q: "Werden für eine energetische Modernisierung weitere Fachplaner benötigt?",
        a: [
          "Je nach Vorhaben wird zusätzlich ein Energieberater benötigt, zum Beispiel wenn Fördermittel beantragt oder energetische Nachweise erstellt werden müssen. Wir arbeiten mit erfahrenen und qualifizierten Energieberatern aus der Region zusammen und koordinieren die Zusammenarbeit für Sie. So erhalten Sie alle erforderlichen Leistungen aus einer Hand.",
        ],
      },
      {
        q: "Welche energetischen Standards können bei einer Modernisierung erreicht werden?",
        a: [
          "Welche energetische Qualität nach einer Modernisierung erreicht werden kann, hängt immer von der Immobilie und den geplanten Maßnahmen ab. Je nach Ausgangszustand sind unterschiedliche Energiestandards möglich, beispielsweise KfW 70, KfW 55 oder KfW 40. Welcher Standard technisch und wirtschaftlich sinnvoll ist, prüfen wir individuell und stimmen die Maßnahmen auf Ihre Immobilie und Ihre Ziele ab.",
        ],
      },
      {
        q: "Welche Unterschiede gibt es zwischen den verschiedenen Energiestandards?",
        a: [
          "Die verschiedenen Standards unterscheiden sich vor allem im Energiebedarf eines Gebäudes. Je kleiner die Zahl, desto energieeffizienter ist die Immobilie und desto höher sind in der Regel die Anforderungen an Dämmung, Fenster, Heiztechnik und die gesamte Gebäudehülle.",
        ],
      },
      {
        q: "Welche Förderprogramme gibt es für energetische Modernisierungen?",
        a: [
          "Für viele energetische Modernisierungsmaßnahmen stehen staatliche Förderprogramme zur Verfügung. Welche Förderung möglich ist, hängt unter anderem von der geplanten Maßnahme, dem angestrebten Energiestandard und den zum Zeitpunkt der Antragstellung gültigen Förderbedingungen ab. Gerne beraten wir Sie zu den grundsätzlichen Möglichkeiten und beziehen bei Bedarf einen qualifizierten Energieberater in die Planung mit ein.",
        ],
      },
    ],
  },
  {
    id: "einzelmassnahmen",
    title: "Einzelmaßnahmen",
    group: "Ingenieurleistungen",
    path: routes.einzelmodernisierung,
    entries: [
      {
        q: "Welche Einzelmaßnahmen begleiten Sie?",
        a: [
          "Wir begleiten unter anderem Nutzungsänderungen, Wanddurchbrüche, Grundrissänderungen, Fenster- und Türöffnungen, energetische Einzelmaßnahmen, Badsanierungen sowie weitere bauliche Veränderungen an Bestandsgebäuden.",
        ],
      },
      {
        q: "Welche Kosten entstehen bei der Umsetzung?",
        a: [
          "Die Kosten einer Einzelmaßnahme hängen immer vom Umfang des Vorhabens und den baulichen Gegebenheiten Ihrer Immobilie ab. Auf Wunsch erstellen wir bereits im Vorfeld eine überschlägige Kostenschätzung, damit Sie eine erste Orientierung erhalten. Im Anschluss unterstützen wir Sie bei der Einholung und Prüfung von Angeboten regionaler Fachfirmen, sodass Sie die anstehenden Investitionen realistisch einschätzen und fundiert entscheiden können.",
        ],
      },
      {
        q: "Wo finde ich verlässliche Fachfirmen für die Umsetzung?",
        a: [
          "Auf Wunsch stellen wir Ihnen unser langjährig aufgebautes Netzwerk regionaler Fachfirmen zur Verfügung. Wir arbeiten mit zuverlässigen und qualifizierten Handwerksbetrieben zusammen, die wir aus gemeinsamen Projekten kennen. So profitieren Sie von einer fachgerechten Planung und einer ebenso professionellen Umsetzung.",
        ],
      },
      {
        q: "Können auch einzelne Maßnahmen später erweitert werden?",
        a: [
          "Ja. Nicht jede Modernisierung muss auf einmal umgesetzt werden. Viele Maßnahmen lassen sich sinnvoll in mehreren Bauabschnitten durchführen. Wichtig ist, dass diese bereits im Vorfeld aufeinander abgestimmt werden, damit spätere Arbeiten problemlos ergänzt werden können.",
        ],
      },
      {
        q: "Sollte ich zuerst die Fenster austauschen oder die Fassade dämmen?",
        a: [
          "Eine pauschale Antwort gibt es darauf nicht. Welche Maßnahme sinnvoll ist, hängt vom Zustand Ihrer Immobilie und Ihren Zielen ab. Häufig greifen einzelne Bauteile ineinander. Werden beispielsweise nur neue Fenster eingebaut, ohne die übrige Gebäudehülle zu berücksichtigen, kann dies unerwünschte Folgen begünstigen. Deshalb betrachten wir jede Immobilie als Gesamtsystem und entwickeln gemeinsam mit Ihnen eine sinnvolle Reihenfolge der einzelnen Maßnahmen.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------ Dienstleistungen */
  {
    id: "an-und-verkaufsberatung",
    title: "An- und Verkaufsberatung",
    group: "Dienstleistungen",
    path: routes.anUndVerkaufsberatung,
    entries: [
      {
        q: "Wann ist der richtige Zeitpunkt für eine Ankaufsberatung?",
        a: [
          "Idealerweise erfolgt die Ankaufsberatung vor der finalen Kaufentscheidung. So können der technische und wirtschaftliche Zustand der Immobilie unabhängig bewertet und mögliche Risiken frühzeitig erkannt werden. Die gewonnenen Erkenntnisse können zudem eine wertvolle Grundlage für die Kaufpreisverhandlung sein.",
        ],
      },
      {
        q: "Wann ist eine Verkaufsberatung sinnvoll?",
        a: [
          "Eine Verkaufsberatung empfiehlt sich bereits vor der Vermarktung Ihrer Immobilie. Gemeinsam prüfen wir, ob aktuelle Unterlagen vorhanden sind, ob der Verkaufspreis realistisch gewählt wurde und welche Maßnahmen den Verkaufsprozess unterstützen können.",
        ],
      },
      {
        q: "Erhalte ich eine schriftliche oder eine mündliche Stellungnahme?",
        a: [
          "Beides. Zunächst erhalten Sie eine schriftliche Stellungnahme, in der wir unsere fachliche Einschätzung der Immobilie sowie die wichtigsten Erkenntnisse aus der Besichtigung verständlich und nachvollziehbar zusammenfassen.",
          "Nach Durchsicht der Unterlagen nehmen wir uns gerne Zeit für ein telefonisches Nachgespräch. Gemeinsam besprechen wir die Ergebnisse, beantworten offene Fragen und erläutern einzelne Punkte verständlich und nachvollziehbar.",
          "Unser Ziel ist es, dass Sie die Bewertung nicht nur erhalten, sondern auch vollständig verstehen und Ihre Entscheidung mit einem guten und sicheren Gefühl treffen können.",
        ],
      },
      {
        q: "Kann eine Ankaufsberatung bei der Kaufpreisverhandlung helfen?",
        a: [
          "Ja. Eine objektive Einschätzung des technischen und wirtschaftlichen Zustands kann helfen, den aufgerufenen Kaufpreis besser einzuordnen. Werden Modernisierungsbedarf oder Mängel festgestellt, liefern diese häufig nachvollziehbare Argumente für eine sachliche Preisverhandlung.",
        ],
      },
      {
        q: "Wie lange dauert eine An- oder Verkaufsberatung?",
        a: [
          "Die Dauer richtet sich nach Art und Größe der Immobilie. Der Vor-Ort-Termin dauert in der Regel zwischen einer und zwei Stunden. Die anschließende Auswertung und schriftliche Stellungnahme erfolgt innerhalb von 7 Werktagen. Je nach Dringlichkeit besteht die Möglichkeit, diese auch innerhalb von 3 Werktagen zur Verfügung zu stellen.",
        ],
      },
    ],
  },
  {
    id: "digitale-grundrisse",
    title: "Digitale Grundrisse",
    group: "Dienstleistungen",
    path: routes.digitaleGrundrisse,
    entries: [
      {
        q: "Wie lange dauert die Erstellung eines Grundrisses?",
        a: [
          "In der Regel werden die Grundrisse innerhalb von 6 Werktagen ab vollständigem Vorliegen der Scan- oder Aufmaßdaten fertiggestellt. Mit der Express-Option ist die Lieferung in bis zu 3 Werktagen möglich.",
        ],
      },
      {
        q: "Ist der Grundriss banktauglich?",
        a: [
          "Ja, der Grundriss wird durch unseren Sachverständigenstempel von Banken und Finanzierern anerkannt.",
        ],
      },
      {
        q: "In welchem Maßstab wird der Grundriss geliefert?",
        a: [
          "Standardmäßig im Maßstab 1:100. Für größere Gewerbeobjekte ist auf Anfrage auch ein abweichender Maßstab möglich.",
        ],
      },
      {
        q: "Erhalte ich auch eine CAD-Datei?",
        a: [
          "Ja, gegen Aufpreis liefern wir die technischen Zeichnungen zusätzlich als CAD-DWG-Datei zur Weiterverarbeitung durch Architekten oder Vermesser.",
        ],
      },
      {
        q: "Muss meine Immobilie für einen neuen Grundriss immer aufgemessen werden?",
        a: [
          "Nein. Wenn aktuelle und ausreichend detaillierte Bestandsunterlagen vorhanden sind, können diese je nach Verwendungszweck als Grundlage ausreichen. Stimmen die Unterlagen nicht mehr mit dem heutigen Gebäude überein oder fehlen wichtige Maße, empfehlen wir ein Vor-Ort-Aufmaß.",
        ],
      },
      {
        q: "Können auch alte Papiergrundrisse digitalisiert werden?",
        a: [
          "Ja. Vorhandene Grundrisse können als Grundlage für eine digitale Neuerstellung verwendet werden, sofern die enthaltenen Angaben ausreichend und nachvollziehbar sind. Ob zusätzlich ein Aufmaß erforderlich ist, prüfen wir vorab anhand der Unterlagen.",
        ],
      },
    ],
  },
  {
    id: "flaechenberechnung",
    title: "Flächenberechnung",
    group: "Dienstleistungen",
    path: routes.flaechenberechnung,
    entries: [
      {
        q: "Was ist der Unterschied zwischen der Wohnflächenverordnung (WoFlV) und der DIN 277?",
        a: [
          "Die Wohnflächenverordnung (WoFlV) wird überwiegend für Wohnimmobilien verwendet und regelt, welche Flächen vollständig, teilweise oder gar nicht zur Wohnfläche zählen. Die DIN 277 dient hingegen der Berechnung von Grundflächen und Rauminhalten von Gebäuden und wird häufig bei Gewerbeimmobilien, öffentlichen Gebäuden oder im Bauwesen angewendet. Welche Berechnung im Einzelfall erforderlich ist, richtet sich nach dem Verwendungszweck.",
        ],
      },
      {
        q: "Welche Flächen zählen zur Wohnfläche?",
        a: [
          "Zur Wohnfläche gehören grundsätzlich alle Räume, die ausschließlich zu einer Wohnung oder einem Wohnhaus gehören und zum Wohnen genutzt werden. Dazu zählen beispielsweise Wohn- und Schlafzimmer, Küche, Bad, Flure und Abstellräume innerhalb der Wohnung. Balkone, Terrassen sowie Räume mit Dachschrägen werden je nach Ausführung und den Vorgaben der Wohnflächenverordnung nur anteilig angerechnet.",
        ],
      },
      {
        q: "Zählt ein Balkon oder eine Terrasse zur Wohnfläche?",
        a: [
          "Ja, Balkone, Terrassen und Dachterrassen können zur Wohnfläche gehören. Sie werden jedoch in der Regel nicht vollständig, sondern nur anteilig berücksichtigt. Die Anrechnung richtet sich nach der Wohnflächenverordnung und hängt unter anderem von der Art, Größe und Qualität der Außenfläche ab.",
        ],
      },
      {
        q: "Sind die einzelnen Raummaße in der Flächenberechnung enthalten?",
        a: [
          "Ja. Unsere Flächenberechnungen werden nachvollziehbar und transparent erstellt. Für jeden Raum sind die zugrunde liegenden Maße sowie die berechneten Flächen übersichtlich dargestellt. Dadurch lässt sich die Berechnung jederzeit nachvollziehen und prüfen.",
        ],
      },
      {
        q: "Wann benötige ich eine Wohnflächenberechnung?",
        a: [
          "Eine Wohnflächenberechnung empfiehlt sich insbesondere beim Verkauf oder der Vermietung einer Immobilie, bei Finanzierungen, Bewertungen, Erbschaften, Umbauten oder wenn bestehende Flächenangaben unvollständig oder nicht mehr aktuell sind. Eine korrekt berechnete Wohnfläche schafft Sicherheit für Eigentümer, Käufer, Banken und Behörden.",
        ],
      },
      {
        q: "Warum kann die neu berechnete Wohnfläche von alten Angaben abweichen?",
        a: [
          "Ältere Flächenangaben können auf anderen Berechnungsgrundlagen beruhen oder den heutigen Gebäudebestand nicht mehr vollständig abbilden. Auch Umbauten, Dachschrägen, Balkone oder unterschiedlich berücksichtigte Flächen können zu Abweichungen führen.",
          "Bei Unklarheiten prüfen wir deshalb zunächst die vorhandenen Unterlagen und empfehlen bei Bedarf ein aktuelles Vor-Ort-Aufmaß.",
        ],
      },
    ],
  },
  {
    id: "aufmass",
    title: "Aufmaß",
    group: "Dienstleistungen",
    path: routes.aufmass,
    entries: [
      {
        q: "Wie läuft ein Vor-Ort-Aufmaß ab?",
        a: [
          "Zum vereinbarten Termin kommen wir direkt zu Ihrer Immobilie und erfassen den gesamten Gebäudebestand mit moderner Scantechnik. Dafür sollten alle Räume zugänglich sein.",
        ],
      },
      {
        q: "Wie lange dauert ein Vor-Ort-Aufmaß?",
        a: [
          "Die Dauer richtet sich nach Größe und Komplexität der Immobilie. Für eine Eigentumswohnung planen wir in der Regel etwa 15 bis 30 Minuten ein. Für ein Ein- oder Zweifamilienhaus sollten Sie mit bis zu einer Stunde rechnen. Bei größeren oder komplexeren Gebäuden kann der Termin zwischen einer und zwei Stunden dauern.",
        ],
      },
      {
        q: "Welche Unterlagen kann ich nach dem Aufmaß erhalten?",
        a: [
          "Auf Grundlage des Vor-Ort-Aufmaßes erstellen wir – je nach Bedarf – digitale und bemaßte Grundrisse, Wohn- und Nutzflächenberechnungen, Gebäudeansichten, Gebäudeschnitte sowie die BRI-Kubatur (Bruttorauminhalt). Die Unterlagen eignen sich unter anderem für Verkauf, Vermietung, Umbauten, Planungen oder Finanzierungen.",
        ],
      },
      {
        q: "In welchem Format erhalte ich die Unterlagen?",
        a: ["Alle Unterlagen werden standardmäßig als PDF-Datei bereitgestellt."],
      },
      {
        q: "Muss die Immobilie vor dem Aufmaß leergeräumt werden?",
        a: [
          "Nein. Ein Ausräumen der Räume ist in der Regel nicht erforderlich. Unsere Scanmethode ermöglicht eine präzise Bestandserfassung auch in bewohnten, möblierten oder teilweise vollgestellten Immobilien. Wichtig ist lediglich, dass alle Räume frei zugänglich sind.",
        ],
      },
    ],
  },
];

/** The categories of one Leistungsbereich, in declaration order. */
export const FAQ_GROUPS: { title: FaqGroup; categories: FaqCategory[] }[] = (
  ["Gutachten", "Ingenieurleistungen", "Dienstleistungen"] as FaqGroup[]
).map((title) => ({
  title,
  categories: FAQ_CATEGORIES.filter((c) => c.group === title),
}));

/**
 * The question set for one service page. Returns undefined for a page that has
 * no questions yet, so a page can call this before its FAQ has been written.
 */
export function faqFor(id: string): FaqCategory | undefined {
  return FAQ_CATEGORIES.find((c) => c.id === id);
}

/** Total question count — used in the /faq/ intro copy. */
export const FAQ_COUNT = FAQ_CATEGORIES.reduce((n, c) => n + c.entries.length, 0);
