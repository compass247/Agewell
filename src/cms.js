/* ============================================================
   COMPASS AGEWELL — Directus CMS client
   Reads published content (blog posts, homepage) from the self-hosted
   Directus instance. Mirrors the style of src/api.js.

   CMS_BASE points at the Directus origin (e.g. https://cms.compassagewell.com).
   Reads are unauthenticated (Directus "Public" role grants read on published
   content only). Used both at request time (Server Components) and by the
   build-time sitemap generator.

   Every fetch is tagged so a Directus Flow webhook -> /api/revalidate can
   invalidate exactly the affected pages on publish (publish = live, no rebuild).
   ============================================================ */
const CMS_BASE = process.env.NEXT_PUBLIC_CMS_BASE || "";

// Map our app locale (vi/en) to Directus language codes (vi-VN/en-US).
const LANG_TO_CODE = { vi: "vi-VN", en: "en-US" };

async function cms(path, { tags = [], revalidate = 3600 } = {}) {
  if (!CMS_BASE) return null; // CMS not configured → callers fall back gracefully
  const res = await fetch(`${CMS_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    next: { tags, revalidate },
  });
  if (!res.ok) {
    throw new Error(`CMS GET ${path} → ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

/**
 * List published blog posts for a language (newest first).
 * Returns [] on any error so the blog index never hard-fails.
 */
export async function getPosts(lang) {
  const code = LANG_TO_CODE[lang] || LANG_TO_CODE.vi;
  try {
    const data = await cms(
      `/items/posts?filter[status][_eq]=published` +
        `&fields=id,slug,published_at,cover_image,translations.title,translations.excerpt,translations.languages_code` +
        `&deep[translations][_filter][languages_code][_eq]=${code}` +
        `&sort=-published_at`,
      { tags: ["posts"] }
    );
    return (data || []).map((p) => flattenPost(p, code));
  } catch {
    return [];
  }
}

/**
 * Fetch a single published post by slug for a language.
 * Returns null if missing/unreachable (caller renders a 404).
 */
export async function getPost(slug, lang) {
  const code = LANG_TO_CODE[lang] || LANG_TO_CODE.vi;
  try {
    const data = await cms(
      `/items/posts?filter[status][_eq]=published&filter[slug][_eq]=${encodeURIComponent(slug)}` +
        `&fields=id,slug,published_at,cover_image,translations.*` +
        `&deep[translations][_filter][languages_code][_eq]=${code}` +
        `&limit=1`,
      { tags: ["posts", `post:${slug}`] }
    );
    if (!data || !data.length) return null;
    return flattenPost(data[0], code);
  } catch {
    return null;
  }
}

/**
 * Fetch the homepage singleton content for a language. Returns null on any
 * error; the homepage overlays this onto content-data.js, so a null result
 * just means "use the static fallback" and the page never breaks.
 */
export async function getHomepage(lang) {
  const code = LANG_TO_CODE[lang] || LANG_TO_CODE.vi;
  try {
    const data = await cms(
      `/items/homepage?fields=translations.*` +
        `&deep[translations][_filter][languages_code][_eq]=${code}`,
      { tags: ["homepage"] }
    );
    const tr = data?.translations?.[0];
    return tr || null;
  } catch {
    return null;
  }
}

// Collapse the single-language translations array into flat fields.
function flattenPost(p, _code) {
  const tr = p.translations?.[0] || {};
  return {
    id: p.id,
    slug: p.slug,
    publishedAt: p.published_at,
    coverImage: p.cover_image
      ? `${CMS_BASE}/assets/${p.cover_image}`
      : null,
    title: tr.title || "",
    excerpt: tr.excerpt || "",
    body: tr.body || "",
    metaTitle: tr.meta_title || tr.title || "",
    metaDescription: tr.meta_description || tr.excerpt || "",
  };
}
