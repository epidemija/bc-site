import { ORGANISATION, SITE_LANG, SITE_LOCALE, absoluteUrl } from "../config/site";
import { DEFAULTS, type PageConfig } from "../config/pages";

export interface HeadTag {
  tag: "title" | "meta" | "link";
  attrs?: Record<string, string>;
  text?: string;
}

/** Full <title> for a page, with the brand suffix applied once. */
export function pageTitle(page: PageConfig): string {
  const t = page.title.trim();
  return t.includes(ORGANISATION.name) ? t : `${t}${DEFAULTS.titleSuffix}`;
}

/**
 * Builds the complete, ordered set of head tags for a page: charset, viewport,
 * description, canonical, robots, Open Graph and Twitter/X cards.
 *
 * This is the ONLY place metadata is assembled. Both the prerender step and any
 * future runtime head management must go through it, so no page can silently
 * ship with a missing canonical or a duplicated description.
 */
export function buildHead(page: PageConfig): HeadTag[] {
  const canonical = absoluteUrl(page.path);
  const title = pageTitle(page);
  const robots = page.robots ?? DEFAULTS.robots;
  const ogImage = absoluteUrl(page.ogImage ?? DEFAULTS.ogImage);
  const ogType = page.ogType ?? DEFAULTS.ogType;

  return [
    { tag: "meta", attrs: { charset: "UTF-8" } },
    {
      tag: "meta",
      attrs: { name: "viewport", content: "width=device-width, initial-scale=1" },
    },
    { tag: "title", text: title },
    { tag: "meta", attrs: { name: "description", content: page.description } },
    { tag: "link", attrs: { rel: "canonical", href: canonical } },
    { tag: "meta", attrs: { name: "robots", content: robots } },
    // Explicit Googlebot directive: allow full snippets and image previews so
    // the page can be represented properly in search and AI overviews.
    {
      tag: "meta",
      attrs: {
        name: "googlebot",
        content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },
    },
    { tag: "meta", attrs: { name: "author", content: ORGANISATION.name } },
    { tag: "meta", attrs: { name: "theme-color", content: "#c39a53" } },

    // Open Graph
    { tag: "meta", attrs: { property: "og:site_name", content: ORGANISATION.name } },
    { tag: "meta", attrs: { property: "og:locale", content: SITE_LOCALE.replace("-", "_") } },
    { tag: "meta", attrs: { property: "og:type", content: ogType } },
    { tag: "meta", attrs: { property: "og:url", content: canonical } },
    { tag: "meta", attrs: { property: "og:title", content: title } },
    { tag: "meta", attrs: { property: "og:description", content: page.description } },
    { tag: "meta", attrs: { property: "og:image", content: ogImage } },
    { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
    { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
    ...(page.ogImageAlt
      ? [{ tag: "meta" as const, attrs: { property: "og:image:alt", content: page.ogImageAlt } }]
      : []),

    // Twitter / X
    { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
    { tag: "meta", attrs: { name: "twitter:title", content: title } },
    { tag: "meta", attrs: { name: "twitter:description", content: page.description } },
    { tag: "meta", attrs: { name: "twitter:image", content: ogImage } },
    ...(page.ogImageAlt
      ? [{ tag: "meta" as const, attrs: { name: "twitter:image:alt", content: page.ogImageAlt } }]
      : []),

    // Icons & manifest — stable root paths, not build-hashed
    { tag: "link", attrs: { rel: "icon", href: "/favicon.ico", sizes: "32x32" } },
    { tag: "link", attrs: { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" } },
    { tag: "link", attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon.png" } },
    { tag: "link", attrs: { rel: "manifest", href: "/site.webmanifest" } },
  ];
}

/** Serialises head tags to HTML for the static build. */
export function renderHead(tags: HeadTag[], indent = "    "): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return tags
    .map((t) => {
      if (t.tag === "title") return `${indent}<title>${esc(t.text ?? "")}</title>`;
      const attrs = Object.entries(t.attrs ?? {})
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(" ");
      return `${indent}<${t.tag} ${attrs} />`;
    })
    .join("\n");
}

export { SITE_LANG };
