import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import { getPage } from "../../../src/cms.js";
import { SITE_URL, OG_LOCALE, languageAlternates } from "../../../src/seo.js";
import BlogChrome from "../../../src/components/BlogChrome.jsx";

const SLUG = "team";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const page = await getPage(SLUG, lang);
  const title =
    page?.metaTitle ||
    (lang === "en" ? "Medical Team" : "Đội ngũ y tế");
  const description =
    page?.metaDescription ||
    (lang === "en"
      ? "Meet the Vietnamese-speaking doctors, pharmacists and coordinators caring for you."
      : "Gặp gỡ đội ngũ bác sĩ, dược sĩ và điều phối viên nói tiếng Việt chăm sóc bạn.");
  const url = `${SITE_URL}/${lang}/${SLUG}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} — Compass AgeWell`,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(SLUG),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: page?.coverImage ? [page.coverImage] : undefined,
      locale: OG_LOCALE[lang],
    },
  };
}

export default async function TeamPage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const [C, page] = await Promise.all([getContent(lang), getPage(SLUG, lang)]);

  return (
    <BlogChrome C={C} lang={lang}>
      {page ? (
        <article className="bg-white section-pad">
          <div className="container" style={{ maxWidth: 880 }}>
            <div className="section-head center">
              <h1>{page.title}</h1>
            </div>
            {page.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.coverImage}
                alt={page.title}
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
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </div>
        </article>
      ) : (
        // CMS page not published / unreachable → render the static team grid
        // from content-data.js so the route never shows an empty page.
        <TeamFallback C={C} lang={lang} />
      )}
    </BlogChrome>
  );
}

// Static fallback mirroring the homepage team block (src/sections/sections-b.jsx
// UspTeam). Kept here so /team works before the Directus `pages` content exists.
function TeamFallback({ C, lang }) {
  const u = C.usp;
  const heading = lang === "en" ? "Medical Team" : "Đội ngũ y tế";
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <div className="section-head center">
          <h1>{heading}</h1>
          {u?.teamTitle && <p className="lede">{u.teamTitle}</p>}
        </div>
        <div className="team-grid">
          {(u?.team || []).map((m, i) => (
            <div key={i} className="team-card">
              {m.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.img} alt={m.title} className="team-photo" loading="lazy" />
              )}
              <div className="tbody">
                <div className="role">{m.role}</div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
