import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import { getPage, getTeamMembers } from "../../../src/cms.js";
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

  // Two sources: an optional intro (Pages → team: title + free text) and the
  // structured member list (Team Members → the card grid). Fetched in parallel.
  const [C, page, members] = await Promise.all([
    getContent(lang),
    getPage(SLUG, lang),
    getTeamMembers(lang),
  ]);

  const heading =
    page?.title || (lang === "en" ? "Medical Team" : "Đội ngũ y tế");

  return (
    <BlogChrome C={C} lang={lang}>
      <section className="bg-white section-pad">
        <div className="container">
          <div className="section-head center">
            <h1>{heading}</h1>
            {/* Optional intro text authored in Pages → team. */}
            {page?.body && (
              <div
                className="lede"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            )}
          </div>

          {members.length > 0 ? (
            <div className="team-grid">
              {members.map((m) => (
                <div key={m.id} className="team-card">
                  {m.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="team-photo" loading="lazy" />
                  )}
                  <div className="tbody">
                    {m.role && <div className="role">{m.role}</div>}
                    <h3>{m.name}</h3>
                    <p>{m.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No CMS members yet → static grid from content-data.js (never empty).
            <TeamFallbackGrid C={C} />
          )}
        </div>
      </section>
    </BlogChrome>
  );
}

// Static member grid from content-data.js (usp.team), shown until Team Members
// exist in the CMS. Header is rendered by the page above, so this is grid-only.
function TeamFallbackGrid({ C }) {
  const u = C.usp;
  return (
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
  );
}
