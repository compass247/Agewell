import createNextIntlPlugin from "next-intl/plugin";

// next-intl: point at the request-config module (locale + messages per request).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output → a minimal self-contained server for the Docker runtime
  // (replaces the old nginx-static image). See Dockerfile.
  output: "standalone",
  reactStrictMode: true,

  // Native addons (argon2) and the postgres driver must run in Node, not be
  // bundled by webpack. Keep them external on the server.
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2", "postgres"],
  },

  images: {
    // Directus media is served from the CMS host (and/or S3/CloudFront later).
    // Allow the CMS origin so next/image can optimize remote uploads.
    remotePatterns: [
      { protocol: "https", hostname: "cms.compassagewell.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
