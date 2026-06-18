import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing.js";

// Locale middleware: redirects "/" to "/vi" (or "/en" by Accept-Language),
// and ensures every page is served under a locale prefix. This replaces the
// old client-only localStorage language toggle as the source of truth.
export default createMiddleware(routing);

export const config = {
  // Match everything except API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next|assets|.*\\..*).*)"],
};
