import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import { TEAM_CONTENT } from "../../../src/team-content.js";
import { SITE_URL, OG_LOCALE, languageAlternates } from "../../../src/seo.js";
import BlogChrome from "../../../src/components/BlogChrome.jsx";
import {
  TeamHero,
  TeamPillars,
  TeamIntro,
  TeamGrid,
  TeamPhilosophy,
} from "../../../src/sections/team-page.jsx";

const SLUG = "team";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const T = TEAM_CONTENT[lang] || TEAM_CONTENT.vi;
  const url = `${SITE_URL}/${lang}/${SLUG}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${T.meta.title} — Compass AgeWell`,
    description: T.meta.description,
    alternates: {
      canonical: url,
      languages: languageAlternates(SLUG),
    },
    openGraph: {
      title: T.meta.title,
      description: T.meta.description,
      url,
      type: "website",
      locale: OG_LOCALE[lang],
    },
  };
}

// BD medical-team landing page (Jul 2026): hero → 3 trust pillars → system
// intro → 6 structured member profiles → care philosophy. Content is static
// (src/team-content.js) — the BD profile structure (board certs, training,
// experience) doesn't exist in the Directus team schema, so the old CMS
// overlay (Pages → team + Team Members) no longer drives this page.
export default async function TeamPage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const C = await getContent(lang);
  const T = TEAM_CONTENT[lang] || TEAM_CONTENT.vi;

  return (
    <BlogChrome C={C} lang={lang}>
      <TeamHero T={T} hotline={C.hotline} />
      <TeamPillars T={T} />
      <TeamIntro T={T} />
      <TeamGrid T={T} />
      <TeamPhilosophy T={T} />
    </BlogChrome>
  );
}
