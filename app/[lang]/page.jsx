import { getContent } from "../../src/content.js";
import { homeMetadata } from "../../src/seo.js";
import HomePageClient from "../../src/components/HomePageClient.jsx";

// Dynamic (SSR per request): the homepage reads the latest CMS content on every
// request, so BD edits in Directus are live immediately — no rebuild, and no
// dependence on on-demand revalidation reaching a specific cached page. The
// site is low-traffic marketing, so per-request SSR is cheap; and getContent
// fails soft to content-data.js, so the homepage never breaks if the CMS is down.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return homeMetadata(lang);
}

export default async function HomePage({ params }) {
  const { lang } = await params;

  // Static approved copy is the base; CMS homepage content overlays on top.
  // If the CMS is unreachable, getContent returns the static content — the
  // homepage never breaks.
  const C = await getContent(lang);

  return <HomePageClient C={C} lang={lang} />;
}
