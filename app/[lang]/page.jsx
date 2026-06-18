import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../src/content.js";
import { homeMetadata } from "../../src/seo.js";
import HomePageClient from "../../src/components/HomePageClient.jsx";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return homeMetadata(lang);
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  // Static approved copy is the base; CMS homepage content overlays on top.
  // If the CMS is unreachable, getContent returns the static content — the
  // homepage never breaks.
  const C = await getContent(lang);

  return <HomePageClient C={C} lang={lang} />;
}
