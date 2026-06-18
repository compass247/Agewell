/* ============================================================
   COMPASS AGEWELL — SEO helpers
   Centralizes site URL, per-language OG locales and hreflang
   alternates so every page builds correct metadata.
   ============================================================ */
import { AGEWELL_CONTENT } from "./content-data.js";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://compassagewell.com";

export const OG_LOCALE = { vi: "vi_VN", en: "en_US" };

// hreflang alternates: map each app locale to its absolute URL for a given
// path (without locale prefix), e.g. languageAlternates("/blog/abc").
export function languageAlternates(pathWithoutLocale = "") {
  const clean = pathWithoutLocale.replace(/^\/+/, "");
  const suffix = clean ? `/${clean}` : "";
  return {
    "vi-VN": `${SITE_URL}/vi${suffix}`,
    "en-US": `${SITE_URL}/en${suffix}`,
    "x-default": `${SITE_URL}/vi${suffix}`,
  };
}

// Default homepage metadata, ported from the old index.html, per language.
export function homeMetadata(lang) {
  const C = AGEWELL_CONTENT[lang] || AGEWELL_CONTENT.vi;
  const title =
    lang === "en"
      ? "Compass AgeWell — Healthcare at home, in your own language"
      : "Compass AgeWell — Chăm sóc sức khỏe tại nhà bằng tiếng Việt";
  const description = C.hero.sub;
  const url = `${SITE_URL}/${lang}`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    icons: { icon: "/assets/logo-color.png" },
    alternates: {
      canonical: url,
      languages: languageAlternates(""),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [`${SITE_URL}/assets/hero-banner.png`],
      locale: OG_LOCALE[lang],
      alternateLocale: lang === "vi" ? "en_US" : "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/assets/hero-banner.png`],
    },
  };
}
