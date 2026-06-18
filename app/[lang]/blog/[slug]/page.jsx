import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../../src/content.js";
import { getPost } from "../../../../src/cms.js";
import { SITE_URL, OG_LOCALE, languageAlternates } from "../../../../src/seo.js";
import BlogChrome from "../../../../src/components/BlogChrome.jsx";

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
          {/* Body is sanitized rich-text HTML authored in Directus. */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </BlogChrome>
  );
}
