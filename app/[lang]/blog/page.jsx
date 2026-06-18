import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import { getPosts } from "../../../src/cms.js";
import { SITE_URL, languageAlternates } from "../../../src/seo.js";
import { Link } from "../../../src/i18n/navigation.js";
import BlogChrome from "../../../src/components/BlogChrome.jsx";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title =
    lang === "en" ? "Blog — Compass AgeWell" : "Bài viết — Compass AgeWell";
  const description =
    lang === "en"
      ? "Health knowledge and news for Vietnamese seniors on Medicare."
      : "Kiến thức và tin tức sức khỏe cho người Việt cao tuổi dùng Medicare.";
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/blog`,
      languages: languageAlternates("blog"),
    },
  };
}

export default async function BlogIndex({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const [C, posts] = await Promise.all([getContent(lang), getPosts(lang)]);
  const heading = lang === "en" ? "Blog" : "Bài viết";
  const empty =
    lang === "en"
      ? "No articles yet. Check back soon."
      : "Chưa có bài viết. Vui lòng quay lại sau.";

  return (
    <BlogChrome C={C} lang={lang}>
      <section className="bg-white section-pad">
        <div className="container">
          <div className="section-head center">
            <h1>{heading}</h1>
          </div>

          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>{empty}</p>
          ) : (
            <div className="prob-grid">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="prob-card"
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      style={{
                        width: "100%",
                        borderRadius: "var(--radius-lg)",
                        marginBottom: 14,
                        display: "block",
                      }}
                      loading="lazy"
                    />
                  )}
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </BlogChrome>
  );
}
