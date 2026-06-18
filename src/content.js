/* ============================================================
   COMPASS AGEWELL — Resolved content helper
   Returns the merged homepage/chrome content for a language:
   static content-data.js as the base, CMS homepage overlaid on top.
   Used by the homepage and by blog pages (for shared Header/Footer).
   If the CMS is unreachable, returns the static content — pages
   never break.
   ============================================================ */
import { AGEWELL_CONTENT } from "./content-data.js";
import { getHomepage } from "./cms.js";

const KEY_MAP = {
  hero: "hero",
  problem: "problem",
  services: "services",
  loop: "loop",
  usp: "usp",
  elig: "elig",
  testi: "testi",
  form: "form",
  footer: "footer",
  nav: "nav",
  header_cta: "headerCta",
  hotline: "hotline",
  contact_bar: "contactBar",
};

export async function getContent(lang) {
  const base = AGEWELL_CONTENT[lang] || AGEWELL_CONTENT.vi;
  let overlay = null;
  try {
    overlay = await getHomepage(lang);
  } catch {
    overlay = null;
  }
  if (!overlay) return base;
  const out = { ...base };
  for (const [cmsKey, appKey] of Object.entries(KEY_MAP)) {
    if (overlay[cmsKey] != null) out[appKey] = overlay[cmsKey];
  }
  return out;
}
