"use client";
/* ============================================================
   useAccent — applies the fixed design tokens as CSS vars at runtime.

   One hook instead of the same useEffect copy-pasted into every client
   shell (HomePageClient / ServicePageClient / BlogChrome). The values
   mirror the :root defaults in src/styles.css; the runtime re-apply exists
   because the old tweaks-panel era persisted overrides on the root element
   and this guarantees every page lands on the canonical tokens.
   ============================================================ */
import { useEffect } from "react";

export const ACCENT_TOKENS = {
  "--accent": "#26a146",
  "--accent-d": "#1c7d36",
  "--accent-soft": "#ecf3e0",
  "--fs-base": "19px",
};

export function useAccent() {
  useEffect(() => {
    const r = document.documentElement.style;
    for (const [k, v] of Object.entries(ACCENT_TOKENS)) r.setProperty(k, v);
  }, []);
}
