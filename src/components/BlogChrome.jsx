"use client";
/* ============================================================
   COMPASS AGEWELL — Blog chrome (header + footer wrapper)
   Wraps blog pages in the same Header/Footer/ContactBar as the
   homepage so navigation + language toggle stay consistent.
   The article body itself is server-rendered (passed as children)
   and deliberately does NOT use Reveal, so its HTML is always
   visible to crawlers.
   ============================================================ */
import { useEffect } from "react";
import { Header, MobileAnchor } from "../sections/sections-a.jsx";
import { Footer, ContactBar } from "../sections/sections-b.jsx";

export default function BlogChrome({ C, lang, children }) {
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", "#26a146");
    r.setProperty("--accent-d", "#1c7d36");
    r.setProperty("--accent-soft", "#ecf3e0");
    r.setProperty("--fs-base", "19px");
  }, []);

  return (
    <>
      <Header t={C} lang={lang} />
      <MobileAnchor t={C} />
      <main className="lang-fade">{children}</main>
      <Footer t={C} lang={lang} />
      <ContactBar t={C} />
    </>
  );
}
