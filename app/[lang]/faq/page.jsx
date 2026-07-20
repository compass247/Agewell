import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import {
  getFaqContent,
  buildFaqMetadata,
  isFaqCanonical,
  faqJsonLd,
} from "../../../src/faq-content.js";
import FaqPageClient from "../../../src/components/FaqPageClient.jsx";

// English slug of the FAQ page (canonical for en; /vi/cau-hoi-thuong-gap is
// the Vietnamese twin — see src/faq-content.js for the two-slug URL strategy).
const SLUG = "faq";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildFaqMetadata(lang, SLUG);
}

export default async function FaqPageEn({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const C = await getContent(lang);
  const F = getFaqContent(lang);

  return (
    <>
      {/* FAQPage structured data — canonical lang+slug combo only, so the
          mismatched twin never duplicates it. */}
      {isFaqCanonical(lang, SLUG) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(lang)) }}
        />
      )}
      <FaqPageClient C={C} lang={lang} F={F} />
    </>
  );
}
