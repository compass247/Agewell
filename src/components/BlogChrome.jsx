"use client";
/* ============================================================
   COMPASS AGEWELL — Blog chrome (header + footer wrapper)
   Wraps blog pages in the same Header/Footer/ContactBar as the
   homepage so navigation + language toggle stay consistent.
   The article body itself is server-rendered (passed as children)
   and deliberately does NOT use Reveal, so its HTML is always
   visible to crawlers.
   ============================================================ */
import { Header, MobileAnchor } from "../sections/sections-a.jsx";
import { Footer, ContactBar, SignupForm } from "../sections/sections-b.jsx";
import { useAccent } from "./useAccent.js";

// `formSource` tags the leads this page produces (Source column in
// /portal/leads). Omit it and SignupForm falls back to "website".
export default function BlogChrome({ C, lang, children, formSource }) {
  useAccent();

  return (
    <>
      <Header t={C} lang={lang} />
      <MobileAnchor t={C} />
      <main className="lang-fade">
        {children}
        {/* Always offer the signup form at the bottom of every sub-page so a
            visitor can leave their info from anywhere. (The sticky "Nhắn tin"
            button now opens the messaging-channel menu, not this form.) */}
        <SignupForm t={C} source={formSource} />
      </main>
      <Footer t={C} lang={lang} />
      <ContactBar t={C} />
    </>
  );
}
