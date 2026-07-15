import { getPosts } from "../src/cms.js";
import { SITE_URL } from "../src/seo.js";

// Dynamic sitemap: homepage + blog index + every published post, in both
// languages, with hreflang alternates. Regenerated on each static build
// (Directus publish → Pages Deploy Hook), so new posts appear automatically.
//
// Conventions (kept in sync with src/seo.js languageAlternates):
// - One entry PER LANGUAGE — /vi and /en are both first-class canonical URLs,
//   matching each page's own <link rel="canonical">.
// - hreflang keys are vi-VN / en-US / x-default (same as the on-page tags).
// - lastModified only where a real date exists (post publishedAt). Stamping
//   new Date() on every build made every URL look "just changed" and
//   destroyed the signal value of <lastmod>.
const LANGS = ["vi", "en"];

const STATIC_PATHS = [
  "",
  "/blog",
  "/team",
  "/services/ccm",
  "/services/mtm",
  "/services/em",
];

function alternatesFor(path) {
  return {
    languages: {
      "vi-VN": `${SITE_URL}/vi${path}`,
      "en-US": `${SITE_URL}/en${path}`,
      "x-default": `${SITE_URL}/vi${path}`,
    },
  };
}

export default async function sitemap() {
  const entries = [];

  for (const path of STATIC_PATHS) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}${path}`,
        alternates: alternatesFor(path),
      });
    }
  }

  // Blog posts. Fetch once per language; dedupe by slug and keep the newest
  // publish date for <lastmod>.
  const bySlug = new Map();
  for (const lang of LANGS) {
    const posts = await getPosts(lang);
    for (const p of posts) {
      const prev = bySlug.get(p.slug);
      if (!prev || (p.publishedAt && p.publishedAt > prev)) {
        bySlug.set(p.slug, p.publishedAt || null);
      }
    }
  }
  for (const [slug, publishedAt] of bySlug) {
    const path = `/blog/${slug}`;
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}${path}`,
        ...(publishedAt ? { lastModified: new Date(publishedAt) } : {}),
        alternates: alternatesFor(path),
      });
    }
  }

  return entries;
}
