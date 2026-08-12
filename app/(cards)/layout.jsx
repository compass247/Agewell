import { Be_Vietnam_Pro } from "next/font/google";
import "./card.css";

/* Document shell for the digital business cards (/taylornguyen, /chaunguyen).

   These live OUTSIDE app/[lang]/ because BD hands out the bare URL — it is
   what the QR codes in public/assets/qr-*.svg encode — and the cards are
   English-only, so there is nothing for next-intl to do. app/layout.jsx only
   returns its children (the real <html>/<body> belongs to whichever section
   owns the document), so this layout provides them, the same way
   app/(portal)/layout.jsx does for the PHI portal.

   With BUILD_TARGET=static + trailingSlash, this exports to
   out/taylornguyen/index.html, which Cloudflare Pages serves at the bare path
   — no public/_redirects hop needed. On the dev/standalone build, middleware.js
   has to skip these paths or next-intl (localePrefix "always") would bounce
   them to /vi/taylornguyen. */

// Same brand font as the marketing site; app/[lang]/layout.jsx loads its own
// copy for its own <html>, and next/font dedupes the actual font files.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export default function CardLayout({ children }) {
  return (
    <html lang="en" className={beVietnamPro.variable}>
      <body className="bcard-page">{children}</body>
    </html>
  );
}
