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

async function cms(path, { tags = [], revalidate = 3600, noStore = false } = {}) {
  if (!CMS_BASE) return null; // CMS not configured → callers fall back gracefully
  const res = await fetch(`${CMS_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    // noStore: always fetch fresh (used by the dynamic homepage). Otherwise
    // tag-cached so blog pages can be revalidated on publish.
    ...(noStore ? { cache: "no-store" } : { next: { tags, revalidate } }),
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
 * Fetch a single published dynamic page by slug for a language (e.g. the
 * Medical Team page, slug="team"). Returns null if missing/unreachable so the
 * caller can fall back to static content instead of hard-failing.
 */
export async function getPage(slug, lang) {
  const code = LANG_TO_CODE[lang] || LANG_TO_CODE.vi;
  try {
    const data = await cms(
      `/items/pages?filter[status][_eq]=published&filter[slug][_eq]=${encodeURIComponent(slug)}` +
        `&fields=id,slug,cover_image,translations.*` +
        `&deep[translations][_filter][languages_code][_eq]=${code}` +
        `&limit=1`,
      { tags: ["pages", `page:${slug}`] }
    );
    if (!data || !data.length) return null;
    return flattenPage(data[0]);
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
    // no-store: the homepage is dynamic (force-dynamic), so always read fresh.
    const data = await cms(
      `/items/homepage?fields=translations.*` +
        `&deep[translations][_filter][languages_code][_eq]=${code}`,
      { noStore: true }
    );
    const tr = data?.translations?.[0];
    return tr || null;
  } catch (err) {
    // Log so CMS connectivity issues are visible in CloudWatch (the homepage
    // still falls back to content-data.js — it never breaks).
    console.error("getHomepage failed:", err?.message);
    return null;
  }
}

// Collapse a page's single-language translations array into flat fields.
function flattenPage(p) {
  const tr = p.translations?.[0] || {};
  return {
    id: p.id,
    slug: p.slug,
    coverImage: p.cover_image ? `${CMS_BASE}/assets/${p.cover_image}` : null,
    title: tr.title || "",
    body: tr.body || "",
    metaTitle: tr.meta_title || tr.title || "",
    metaDescription: tr.meta_description || "",
  };
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
