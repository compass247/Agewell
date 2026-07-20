import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import {
  getFaqContent,
  buildFaqMetadata,
  isFaqCanonical,
  faqJsonLd,
} from "../../../src/faq-content.js";
import FaqPageClient from "../../../src/components/FaqPageClient.jsx";

// Vietnamese slug of the FAQ page (canonical for vi; /en/faq is the English
// twin — see src/faq-content.js for the two-slug URL strategy).
const SLUG = "cau-hoi-thuong-gap";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildFaqMetadata(lang, SLUG);
}

export default async function FaqPageVi({ params }) {
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
