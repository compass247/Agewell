import { defineRouting } from "next-intl/routing";

// URL-based locales: every language gets its own path prefix (/vi, /en) so the
// English site is independently crawlable + we can emit correct hreflang.
// "vi" stays the default (matching the old localStorage default).
export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  // Always show the prefix (/vi and /en) — clean, unambiguous URLs for SEO.
  localePrefix: "always",
});
