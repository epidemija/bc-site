import type { APIRoute } from "astro";
import { SITE_URL } from "../config/site";

/**
 * robots.txt, generated at build time.
 *
 * AI crawler policy and the reasoning behind each decision live in
 * docs/AI-CRAWLER-POLICY.md. Change the list here, never the built file.
 *
 * robots.txt is a crawl request, not access control — nothing private is
 * listed, because listing a private path would only advertise it.
 */
const CRAWLERS: [agent: string, allow: boolean, reason: string][] = [
  ["Googlebot", true, "Google Search indexing"],
  ["Googlebot-Image", true, "Google Images"],
  ["Google-Extended", true, "Gemini / AI Overviews grounding"],
  ["Bingbot", true, "Bing Search and Copilot"],
  ["Applebot", true, "Apple Search / Siri"],
  ["Applebot-Extended", true, "Apple Intelligence"],
  ["OAI-SearchBot", true, "ChatGPT search results"],
  ["ChatGPT-User", true, "user-initiated ChatGPT page fetches"],
  ["GPTBot", true, "OpenAI crawler"],
  ["ClaudeBot", true, "Claude search and citations"],
  ["anthropic-ai", true, "Anthropic crawler"],
  ["PerplexityBot", true, "Perplexity answers with citations"],
  ["CCBot", true, "Common Crawl"],
];

export const GET: APIRoute = () => {
  const lines = [
    "# robots.txt — BC IMMOWERT",
    "# Generated at build time from src/pages/robots.txt.ts",
    "#",
    "# robots.txt is a crawl request, not an access control mechanism.",
    "# Private content is protected server-side, never by a Disallow rule.",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    "# CSS, JS and images stay crawlable — blocking them would stop Google",
    "# rendering the page and break mobile-friendliness testing.",
    "Allow: /_astro/",
    "",
    "# No Disallow rules: every URL here is public. Duplicate URL variants",
    "# (tracking parameters) are handled by canonical tags, which is the",
    "# mechanism Google recommends — blocking them would hide that signal.",
    "",
  ];

  for (const [agent, allow, reason] of CRAWLERS) {
    lines.push(`# ${reason}`, `User-agent: ${agent}`, allow ? "Allow: /" : "Disallow: /", "");
  }

  lines.push(`Sitemap: ${SITE_URL}/sitemap-index.xml`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
