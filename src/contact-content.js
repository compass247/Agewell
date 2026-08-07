/* ============================================================
   COMPASS AGEWELL — Standalone contact/signup page copy (VI / EN)

   Only the page-level meta + the short intro band live here. The signup form
   itself is the shared SignupForm and its copy stays in src/content-data.js
   `form.*` (Directus-overlaid via content.js KEY_MAP) — do NOT duplicate it
   here, or an edit in the CMS would stop reaching this page.

   The slug is /contact-us in BOTH locales (unlike the FAQ page's two-slug
   strategy): BD prints this URL and its QR code, so it has to be one stable,
   locale-independent string. It also lets LangToggle swap /vi <-> /en on the
   same path with no special case.
   ============================================================ */
import { SITE_URL, OG_LOCALE, languageAlternates } from "./seo.js";

export const CONTACT_PATH = "/contact-us";

// Voice note: VI uses "bạn" (not the FAQ page's "anh chị") because the shared
// form copy rendered immediately below says "gọi lại cho bạn" — the page must
// not switch register mid-scroll.
export const CONTACT_CONTENT = {
  vi: {
    meta: {
      title: "Liên hệ — Compass AgeWell",
      description:
        "Đăng ký tư vấn miễn phí với Compass AgeWell: để lại thông tin hoặc gọi hotline, điều phối viên người Việt sẽ liên hệ trong vòng 24 giờ. Miễn phí và không ràng buộc.",
    },
    hero: {
      eyebrow: "Liên hệ",
      title: "Chúng tôi luôn sẵn sàng lắng nghe bạn",
      sub: "Để lại thông tin bên dưới, một điều phối viên người Việt sẽ gọi lại cho bạn trong vòng 24 giờ. Miễn phí và không ràng buộc.",
      callPre: "Hoặc gọi ngay cho chúng tôi",
    },
  },
  en: {
    meta: {
      title: "Contact us — Compass AgeWell",
      description:
        "Get a free consultation with Compass AgeWell: leave your details or call our toll-free hotline and a Vietnamese-speaking coordinator will reach out within 24 hours. Free, no obligation.",
    },
    hero: {
      eyebrow: "Contact",
      title: "We're here to listen",
      sub: "Leave your details below and a Vietnamese-speaking coordinator will call you back within 24 hours. Free and no obligation.",
      callPre: "Or call us right now",
    },
  },
};

export function getContactContent(lang) {
  return CONTACT_CONTENT[lang] || CONTACT_CONTENT.vi;
}

/* Metadata. NOINDEX, and deliberately absent from app/sitemap.js: this is a
   hand-out link (QR code, flyers, email signatures), not a page meant to
   compete in search — the homepage already ranks for the signup form.

   Two differences from buildRoiMetadata, both on purpose:
   - follow: true — nothing here is confidential, so internal links out to the
     homepage/services should still pass normally.
   - NO Disallow in app/robots.js. Disallow blocks crawling, and a crawler that
     cannot fetch the page never reads this noindex tag — the URL could then
     still surface as a bare link. Since BD will spread this URL widely, the
     meta tag is the mechanism that actually keeps it out of results, so the
     crawler has to be allowed in to see it. (The ROI tool adds a Disallow for
     confidentiality reasons that do not apply here.) */
export function buildContactMetadata(lang) {
  const K = getContactContent(lang);
  const canonical = `${SITE_URL}/${lang}${CONTACT_PATH}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: K.meta.title,
    description: K.meta.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical,
      languages: languageAlternates(CONTACT_PATH),
    },
    openGraph: {
      title: K.meta.title,
      description: K.meta.description,
      url: canonical,
      type: "website",
      locale: OG_LOCALE[lang],
    },
  };
}
