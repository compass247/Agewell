import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing.js";

// Locale middleware: redirects "/" to "/vi" (or "/en" by Accept-Language),
// and ensures every page is served under a locale prefix. This replaces the
// old client-only localStorage language toggle as the source of truth.
export default createMiddleware(routing);

export const config = {
  // Match "/" explicitly, all locale-prefixed paths, and everything else
  // except API routes, Next internals, and files with an extension.
  matcher: [
    "/",
    "/(vi|en)/:path*",
    // Exclude api, healthz, Next internals, and static assets so the ALB
    // health check hits /healthz directly (no locale redirect).
    "/((?!api|healthz|_next|_vercel|assets|.*\\..*).*)",
  ],
};
