import { setRequestLocale } from "next-intl/server";
import { getContent } from "../../../src/content.js";
import { getContactContent, buildContactMetadata } from "../../../src/contact-content.js";
import { Icon } from "../../../src/components/icons.jsx";
import BlogChrome from "../../../src/components/BlogChrome.jsx";
import "./contact.css";

/* Standalone signup page — /vi/contact-us and /en/contact-us.

   BD hands this URL (and public/assets/qr-contact-us.svg) straight to
   prospects, so the page is exactly: header → short intro → the SAME
   SignupForm the rest of the site uses → footer.

   The form is NOT rendered here on purpose: BlogChrome already renders
   <SignupForm> at the bottom of its <main>. A second one would duplicate
   id="dangky" and break every scrollToId("dangky") CTA on the page.

   The intro band exists so the page has a real <h1> and so the mint form
   section does not butt straight into the 72px sticky header (section-pad is
   only 26px on mobile). It also puts the hotline one tap away — for a QR code
   scanned by a 70-year-old, calling often beats typing.

   The bare path /contact-us resolves in two ways, because the two build
   targets differ: middleware.js (next-intl, localePrefix "always") redirects
   it in dev/standalone, and public/_redirects does the same on the static
   Cloudflare Pages build, where middleware is stashed. */

// Server-rendered (no Reveal) so the copy is always in the HTML, same
// reasoning as src/sections/team-page.jsx.
function ContactIntro({ K, hotline }) {
  return (
    <section className="contact-hero">
      <div className="container contact-hero-inner">
        <span className="eyebrow">{K.hero.eyebrow}</span>
        <h1>{K.hero.title}</h1>
        <p className="lede">{K.hero.sub}</p>
        <p className="contact-hero-pre">{K.hero.callPre}</p>
        <a className="btn btn-ghost btn-lg" href={"tel:" + hotline.tel}>
          <Icon name="phone" /> {hotline.number}
        </a>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildContactMetadata(lang);
}

export default async function ContactUsPage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const C = await getContent(lang);
  const K = getContactContent(lang);

  return (
    <BlogChrome C={C} lang={lang} formSource="contact-us">
      <ContactIntro K={K} hotline={C.hotline} />
    </BlogChrome>
  );
}
