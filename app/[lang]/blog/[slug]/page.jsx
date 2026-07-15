import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../../src/content.js";
import { getPost, getPosts } from "../../../../src/cms.js";
import { SITE_URL, OG_LOCALE, languageAlternates } from "../../../../src/seo.js";
import { sanitizeCmsHtml, jsonLdSafe } from "../../../../src/lib/sanitize.js";
import BlogChrome from "../../../../src/components/BlogChrome.jsx";

// Only pre-rendered slugs are served; any other slug 404s (via notFound below)
// instead of being rendered on demand — required for `output: "export"`.
export const dynamicParams = false;

// Enumerate every published post slug (per language) at build time so static
// export can emit each article page.
//
// `output: "export"` rejects a dynamic route whose generateStaticParams()
// returns an EMPTY array ("Page ... is missing generateStaticParams()"). That
// happens when the CMS is unreachable at build time (getPosts fails soft to
// []). To keep the export build from failing in that case we emit a single
// throwaway slug — its page calls notFound(), so it 404s and is never a real,
// indexable article. In normal builds the CMS returns posts and this fallback
// is unused. New posts appear on the next rebuild (Directus publish → Pages
// Deploy Hook).
const EMPTY_FALLBACK = [{ lang: "vi", slug: "__none__" }];

export async function generateStaticParams() {
  const params = [];
  for (const lang of ["vi", "en"]) {
    const posts = await getPosts(lang);
    for (const p of posts) params.push({ lang, slug: p.slug });
  }
  return params.length ? params : EMPTY_FALLBACK;
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const post = await getPost(slug, lang);
  if (!post) return {};
  const url = `${SITE_URL}/${lang}/blog/${slug}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${post.metaTitle} — Compass AgeWell`,
    description: post.metaDescription,
    alternates: {
      canonical: url,
      languages: languageAlternates(`blog/${slug}`),
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
      locale: OG_LOCALE[lang],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function Article({ params }) {
  const { lang, slug } = await params;
  setRequestLocale(lang);

  const [C, post] = await Promise.all([getContent(lang), getPost(slug, lang)]);
  if (!post) notFound();

  // Article JSON-LD (healthcare brand → helps rich results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt || undefined,
    inLanguage: lang === "en" ? "en-US" : "vi-VN",
    publisher: {
      "@type": "Organization",
      name: "Compass AgeWell",
    },
  };

  return (
    <BlogChrome C={C} lang={lang}>
      <article className="bg-white section-pad">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-head">
            <h1>{post.title}</h1>
            {post.publishedAt && (
              <p className="lede">
                {new Date(post.publishedAt).toLocaleDateString(
                  lang === "en" ? "en-US" : "vi-VN",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            )}
          </div>
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              style={{
                width: "100%",
                borderRadius: "var(--radius-lg)",
                margin: "0 0 28px",
                display: "block",
              }}
            />
          )}
          {/* Rich text authored in Directus — sanitized before innerHTML. */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(post.body) }}
          />
        </div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />
    </BlogChrome>
  );
}
