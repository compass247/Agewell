/* ============================================================
   COMPASS AGEWELL — App root
   Production build: tweaks panel removed; the chosen design
   values (green accent, 19px base, bordered service cards,
   circular care loop) are applied as fixed defaults.
   ============================================================ */
import { useEffect, useState } from "react";
import { AGEWELL_CONTENT } from "./content-data.js";
import { Header, MobileAnchor, Hero, Problem, Services, CareLoop } from "./sections/sections-a.jsx";
import { UspTeam, Eligibility, SignupForm, Footer, ContactBar } from "./sections/sections-b.jsx";

// Fixed design tokens (previously controlled by the tweaks panel).
const ACCENT = "#26a146";
const ACCENT_D = "#1c7d36";
const ACCENT_SOFT = "#ecf3e0";
const FONT_SIZE = 19;
const SVC_VARIANT = "bordered"; // "Viền màu"
const LOOP_VARIANT = "circle";  // "Vòng tròn"

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("agewell-lang") || "vi"; } catch { return "vi"; }
  });
  const C = AGEWELL_CONTENT[lang];

  useEffect(() => {
    try { localStorage.setItem("agewell-lang", lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", ACCENT);
    r.setProperty("--accent-d", ACCENT_D);
    r.setProperty("--accent-soft", ACCENT_SOFT);
    r.setProperty("--fs-base", FONT_SIZE + "px");
  }, []);

  return (
    <>
      <Header t={C} lang={lang} setLang={setLang} />
      <MobileAnchor t={C} />
      <main key={lang} className="lang-fade">
        <Hero t={C} />
        <Problem t={C} />
        <Services t={C} variant={SVC_VARIANT} />
        <CareLoop t={C} variant={LOOP_VARIANT} />
        <UspTeam t={C} />
        <Eligibility t={C} />
        {/* Testimonials section hidden — chưa có số liệu thật */}
        <SignupForm t={C} />
      </main>
      <Footer t={C} lang={lang} setLang={setLang} />
      <ContactBar t={C} />
    </>
  );
}
