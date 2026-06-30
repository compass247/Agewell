/* ============================================================
   Composed middleware: PHI portal auth vs. marketing i18n.

   Next.js allows only one middleware entrypoint, so the two concerns are
   branched by path here:
     /portal/*  +  /api/portal/*   -> Auth.js gate (auth.config.js authorized())
     everything else               -> next-intl createMiddleware(routing)

   The Auth.js gate uses the EDGE-SAFE auth.config.js (no DB/crypto imports), so
   middleware stays edge-compatible. Coarse gating only — every server action
   re-checks (defense in depth).
   ============================================================ */
import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { routing } from "./src/i18n/routing.js";
import { authConfig } from "./auth.config.js";

const intlMiddleware = createIntlMiddleware(routing);
const { auth: authMiddleware } = NextAuth(authConfig);

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
    return authMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Portal (auth gate)
    "/portal/:path*",
    // Marketing i18n
    "/",
    "/(vi|en)/:path*",
    // Everything except API, healthz, Next internals, static assets, and the
    // portal namespace (handled above). Portal is added to the negative
    // lookahead so next-intl never rewrites portal URLs.
    "/((?!api|healthz|portal|_next|_vercel|assets|.*\\..*).*)",
  ],
};
