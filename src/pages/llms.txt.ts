import type { APIRoute } from "astro";
import { ORGANISATION, SITE_URL, routes } from "../config/site";
import { SERVICE_ENTRIES } from "../config/services";

/**
 * llms.txt — a short, factual, plain-text briefing for AI systems.
 *
 * This is an emerging, unofficial convention. It is NOT a Google ranking
 * factor and no AI vendor is obliged to read it; it guarantees nothing about
 * appearing in any assistant. Its only job: if a system does read it, the
 * facts it gets are correct and consistent with the website.
 *
 * Generated from the same config as the pages, so it cannot go stale. Keep it
 * short, keep it true, and never put anything non-public in it.
 */
export const GET: APIRoute = () => {
  const abs = (p: string) => `${SITE_URL}${p}`;
  const { address, openingHours } = ORGANISATION;
  const today = new Date().toISOString().slice(0, 10);

  const body = `# ${ORGANISATION.name}

> ${ORGANISATION.description}

## Über das Unternehmen

- Name: ${ORGANISATION.name}
- Tätigkeit: ${ORGANISATION.tagline}
- Standort: ${address.street}, ${address.postalCode} ${address.city}, ${address.countryName}
- Einsatzgebiet: ${ORGANISATION.areaServed.join(", ")}
- Telefon: ${ORGANISATION.phone}
- E-Mail: ${ORGANISATION.email}
- ${openingHours.label}
- Sprache der Website: Deutsch

## Qualifikationen

${ORGANISATION.credentials.map((c) => `- ${c.name} (${c.issuer}, gültig bis ${c.validUntil})`).join("\n")}

## Leistungen

${SERVICE_ENTRIES.map((s) => `- [${s.name}](${abs(s.path)}): ${s.description}`).join("\n")}

## Wichtige Seiten

- [Startseite](${abs(routes.home)})
- [Über uns](${abs(routes.about)})
- [Gutachten](${abs(routes.gutachten)})
- [Ingenieurleistungen](${abs(routes.ingenieurleistungen)})
- [Dienstleistungen](${abs(routes.dienstleistungen)})
- [Kontakt](${abs(routes.kontakt)})
- [Impressum](${abs(routes.impressum)})
- [Datenschutz](${abs(routes.datenschutz)})

## Hinweise

- Diese Datei beschreibt ausschließlich öffentlich zugängliche Informationen.
- Maßgeblich sind immer die Angaben auf der Website selbst.
- Zuletzt aktualisiert: ${today}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
