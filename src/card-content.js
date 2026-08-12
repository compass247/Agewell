/* ============================================================
   COMPASS AGEWELL — Digital business cards (BD)

   Two hand-out pages for CMG leadership, ported 1:1 from the approved design
   in BD_Requirements/Yêu cầu BD - Menu dịch vụ/{Taylornguyen,Chaunguyen}
   business card/CMG Digital Business Card*.dc.html. The two design files are
   identical apart from photo / name / title / phone / email, so everything
   else lives once in SHARED below.

   ENGLISH ONLY, and served from a BARE path (/taylornguyen, not
   /en/taylornguyen). That is what BD asked for and what the QR codes in
   public/assets/qr-*.svg encode, so the slugs here are effectively permanent —
   see app/(cards)/. No next-intl involved; do not add a `vi` variant without
   also moving the route under app/[lang]/ and adding a _redirects hop.
   ============================================================ */
import { SITE_URL } from "./seo.js";

const SHARED = {
  org: "Compass Medical Group, P.C.",
  logo: "/assets/cards/cmg-logo.png",
  blurb:
    "We are Compass Medical Group (CMG), a healthcare ecosystem offering a diverse range of services for comprehensive, connected care, with dedicated language support for the Vietnamese community in the U.S.",
  address: "13071 Brookhurst St. Ste 100, Garden Grove, CA 92843",
  ctaCall: "Let's Connect",
  ctaSite: "Visit our website",
  // The English homepage: these cards are handed to English-speaking partners.
  siteHref: "https://compassagewell.com/en/",
};

const CARDS = {
  taylornguyen: {
    name: "Taylor Nguyen, MD",
    title: "Chief Medical Officer",
    phone: "+1 619 534 5959",
    tel: "+16195345959",
    email: "taylornguyen@compassagewell.com",
    photo: "/assets/cards/taylor.png",
    // Square source, already framed — no crop nudge needed.
    photoPosition: "50% 50%",
  },
  chaunguyen: {
    name: "Chau Nguyen, PhD",
    title: "Chairman",
    phone: "+1 916 917 4538",
    tel: "+19169174538",
    email: "chau.nguyen@compassagewell.com",
    photo: "/assets/cards/chau.jpg",
    // Tall 2:3 source: pull the crop up so the face sits centred in the circle.
    photoPosition: "50% 30%",
  },
};

export const CARD_SLUGS = Object.keys(CARDS);

export function getCardContent(slug) {
  return { ...SHARED, ...CARDS[slug], slug };
}

export function buildCardMetadata(slug) {
  const card = getCardContent(slug);
  const url = `${SITE_URL}/${slug}`;
  const title = `${card.name} — ${card.title} | Compass Medical Group`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: card.blurb,
    icons: { icon: "/assets/logo-color.png" },
    alternates: { canonical: url }, // single-language page: no hreflang alternates
    /* Noindex like /contact-us: this is a link that gets handed over or
       scanned off a QR code, not a page competing in search. `follow: true`
       and NO Disallow in app/robots.js on purpose — blocking the crawl would
       stop Google ever reading this noindex. */
    robots: { index: false, follow: true },
    /* Full OG tags because the whole point of the link is being pasted into
       Zalo / Messenger / email, where the preview card is the first
       impression. The portrait is the OG image. */
    openGraph: {
      type: "profile",
      url,
      siteName: "Compass Medical Group",
      title,
      description: card.blurb,
      locale: "en_US",
      images: [{ url: card.photo, alt: card.name }],
    },
    twitter: {
      card: "summary",
      title,
      description: card.blurb,
      images: [card.photo],
    },
  };
}
