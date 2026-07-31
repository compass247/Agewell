import { setRequestLocale } from "next-intl/server";
import { getRoiContent, buildRoiMetadata } from "../../../src/roi-content.js";
import RoiCalculatorClient from "../../../src/components/RoiCalculatorClient.jsx";
import "./roi.css";

/* ROI partner tool — /vi/roi-calculator and /en/roi-calculator.

   Public (no login) but noindex + nofollow via buildRoiMetadata, absent from
   app/sitemap.js and disallowed in app/robots.js: it is a B2B negotiation aid
   opened live in a meeting, not marketing content.

   Rendered WITHOUT the marketing chrome (Header/Footer/ContactBar/SignupForm)
   on purpose — the design comp is a standalone tool page, and a consumer
   "sign up for a consult" form under a partner fee model would be off-message.

   The bare path /roi-calculator resolves to this page in two ways, because
   the two build targets differ: middleware.js (next-intl, localePrefix
   "always") redirects it in dev/standalone, and public/_redirects does the
   same on the static Cloudflare Pages build, where middleware is stashed. */

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildRoiMetadata(lang);
}

export default async function RoiCalculatorPage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const R = getRoiContent(lang);

  return <RoiCalculatorClient R={R} lang={lang} />;
}
