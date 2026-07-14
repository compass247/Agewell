import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../../src/content.js";
import { getServicePage, SERVICE_SLUGS } from "../../../../src/service-content.js";
import { SITE_URL, OG_LOCALE, languageAlternates } from "../../../../src/seo.js";
import ServicePageClient from "../../../../src/components/ServicePageClient.jsx";

// The three service pages share one template. Enumerate every (locale, slug)
// pair so the static export (Cloudflare Pages) emits all 6 pages. Slugs are a
// fixed constant — no CMS fetch, so this never fails at build time.
export function generateStaticParams() {
  const params = [];
  for (const lang of ["vi", "en"]) {
    for (const slug of SERVICE_SLUGS) params.push({ lang, slug });
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const svc = getServicePage(slug, lang);
  if (!svc) return {};
  const url = `${SITE_URL}/${lang}/services/${slug}`;
  const title = `${svc.meta.title} — Compass AgeWell`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: svc.meta.description,
    alternates: {
      canonical: url,
      languages: languageAlternates(`services/${slug}`),
    },
    openGraph: {
      title: svc.meta.title,
      description: svc.meta.description,
      url,
      type: "website",
      images: svc.hero?.image ? [`${SITE_URL}${svc.hero.image}`] : undefined,
      locale: OG_LOCALE[lang],
    },
  };
}

export default async function ServicePage({ params }) {
  const { lang, slug } = await params;
  setRequestLocale(lang);

  const svc = getServicePage(slug, lang);
  if (!svc) notFound();

  // Chrome content (header nav, footer, hotline). Falls back to static
  // content-data.js if the CMS is unreachable — the page never breaks.
  const C = await getContent(lang);

  return <ServicePageClient C={C} lang={lang} service={svc} />;
}
