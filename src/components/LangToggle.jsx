"use client";
/* ============================================================
   COMPASS AGEWELL — Language toggle
   Swaps the URL locale prefix (/vi <-> /en) instead of flipping
   client state. Keeps the same path so the user stays on the same
   page in the other language — every language has a crawlable URL.
   Also remembers the choice in localStorage so the middleware can
   honor it as a soft preference on the next "/" visit.
   ============================================================ */
import { usePathname, useRouter } from "../i18n/navigation.js";

export function LangToggle({ lang }) {
  const router = useRouter();
  const pathname = usePathname(); // path WITHOUT the locale prefix

  const switchTo = (next) => {
    try {
      localStorage.setItem("agewell-lang", next);
    } catch {
      /* ignore */
    }
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        className={lang === "vi" ? "active" : ""}
        onClick={() => switchTo("vi")}
        aria-pressed={lang === "vi"}
      >
        VI
      </button>
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => switchTo("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
