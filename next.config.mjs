import createNextIntlPlugin from "next-intl/plugin";

// next-intl: point at the request-config module (locale + messages per request).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

// Two build targets share this one config (see CLAUDE.md → Deploy):
//   BUILD_TARGET=static  → pure static export for Cloudflare Pages. The marketing
//                          site only (app/[lang]/**). The PHI portal + all
//                          server-only surfaces are moved out of app/ first by
//                          scripts/build-static.mjs (via scripts/static-stash.mjs),
//                          so export can succeed. Run it with `npm run build:static`.
//   (default)            → standalone Node server for the PHI Fargate image,
//                          which still serves the portal with SSR + middleware.
const isStatic = process.env.BUILD_TARGET === "static";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // export → static HTML for Pages; standalone → self-contained Node server.
  output: isStatic ? "export" : "standalone",
  reactStrictMode: true,

  // Clean /vi/blog → /vi/blog/index.html on static hosts.
  ...(isStatic ? { trailingSlash: true } : {}),

  // Native addons (argon2) and the postgres driver must run in Node, not be
  // bundled by webpack. Only relevant to the standalone (portal) build.
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2", "postgres", "exceljs"],
  },

  images: isStatic
    ? // Static export has no image optimizer. All images in the marketing site
      // are plain <img>, so this only disables an unused optimizer.
      { unoptimized: true }
    : {
        // Directus media is served from the CMS host. Allow the CMS origin so
        // next/image can optimize remote uploads (standalone build only).
        remotePatterns: [
          { protocol: "https", hostname: "cms.compassagewell.com" },
        ],
      },
};

export default withNextIntl(nextConfig);
