"use client";
/* ============================================================
   COMPASS AGEWELL — Homepage (client shell)
   Ported from the old App.jsx. The language now comes from the
   URL (the [lang] route segment) instead of localStorage, and the
   VI/EN toggle navigates between /vi and /en (see Header/Footer).
   Receives the already-resolved content object `C` and `lang` from
   the server component so this stays a thin presentational shell.
   ============================================================ */
import { useEffect } from "react";
import { Header, MobileAnchor, Hero, Problem, Services, CareLoop } from "../sections/sections-a.jsx";
import { UspTeam, Eligibility, SignupForm, Footer, ContactBar } from "../sections/sections-b.jsx";
import { scrollToId } from "./shared.jsx";
import { useAccent } from "./useAccent.js";

// Fixed section variants (previously controlled by the removed tweaks panel).
const SVC_VARIANT = "bordered";
const LOOP_VARIANT = "circle";

export default function HomePageClient({ C, lang }) {
  useAccent();

  // Landing on "/#id" (e.g. an anchor nav item clicked from /blog or /team)
  // — apply the same header-offset smooth scroll as in-page nav, since the
  // browser's native hash jump ignores the 76px sticky header.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    // next frame so sections are laid out before we measure the offset.
    const raf = requestAnimationFrame(() => scrollToId(id));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <Header t={C} lang={lang} />
      <MobileAnchor t={C} />
      <main className="lang-fade">
        <Hero t={C} />
        <Problem t={C} />
        <Services t={C} variant={SVC_VARIANT} />
        <CareLoop t={C} variant={LOOP_VARIANT} />
        <UspTeam t={C} />
        <Eligibility t={C} />
        <SignupForm t={C} />
      </main>
      <Footer t={C} lang={lang} />
      <ContactBar t={C} />
    </>
  );
}
