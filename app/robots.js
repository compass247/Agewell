import { SITE_URL } from "../src/seo.js";

// robots.txt — allow everything, point crawlers at the dynamic sitemap.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
