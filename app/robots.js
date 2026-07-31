import { SITE_URL } from "../src/seo.js";
import { ROI_PATH } from "../src/roi-content.js";

// robots.txt — allow everything except the internal-facing tools, and point
// crawlers at the dynamic sitemap.
//
// The ROI partner tool is public (no login) but is a B2B negotiation aid that
// quotes fee models, so it must never surface in search. Three independent
// signals cover it: this Disallow, a noindex/nofollow meta tag from
// buildRoiMetadata(), and its absence from app/sitemap.js.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/vi" + ROI_PATH, "/en" + ROI_PATH],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
