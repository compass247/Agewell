import { getPosts } from "../src/cms.js";
import { SITE_URL } from "../src/seo.js";

// Dynamic sitemap: homepage + blog index + every published post, in both
// languages, with hreflang alternates. Regenerated on every revalidation, so
// new posts appear automatically (no manual sitemap edits, no rebuild).
export default async function sitemap() {
  const langs = ["vi", "en"];
  const entries = [];

  // Static routes (home, blog index) per language.
  for (const path of ["", "/blog"]) {
    entries.push({
      url: `${SITE_URL}/vi${path}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${SITE_URL}/vi${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  // Blog posts. Fetch once per language; dedupe by slug for the URL set.
  const slugSet = new Set();
  for (const lang of langs) {
    const posts = await getPosts(lang);
    for (const p of posts) slugSet.add(p.slug);
  }
  for (const slug of slugSet) {
    entries.push({
      url: `${SITE_URL}/vi/blog/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${SITE_URL}/vi/blog/${slug}`,
          en: `${SITE_URL}/en/blog/${slug}`,
        },
      },
    });
  }

  return entries;
}
