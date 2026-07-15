/* ============================================================
   CMS HTML sanitizer — the ONLY way CMS-authored HTML may reach
   dangerouslySetInnerHTML.

   Directus rich text is trusted-ish (staff-authored), but a compromised or
   lower-privilege CMS account must not be able to plant <script> on the
   marketing domain (stored XSS). Sanitization runs server-side: at build time
   for the static export, at render time in the standalone build — zero client
   cost either way.
   ============================================================ */
import sanitizeHtml from "sanitize-html";

const OPTIONS = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "div", "span",
    "ul", "ol", "li",
    "a", "img", "figure", "figcaption",
    "strong", "b", "em", "i", "u", "s", "sub", "sup",
    "blockquote", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  // Links authored in the CMS always get safe rel semantics.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

/** Sanitize CMS-authored rich-text HTML for safe innerHTML rendering. */
export function sanitizeCmsHtml(html) {
  if (!html) return "";
  return sanitizeHtml(String(html), OPTIONS);
}

/**
 * Serialize a JSON-LD object for a <script type="application/ld+json"> block.
 * Escapes `<` so CMS-sourced strings can never close the script tag.
 */
export function jsonLdSafe(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
