"use client";
/* ============================================================
   COMPASS AGEWELL — Shared helpers
   ============================================================ */
import { useRef, useEffect, useState } from "react";

// Brand color hex map for accents on cards
export const AGEWELL_COLORS = {
  green:  { hex: "#26a146", d: "#1c7d36", chip: "chip-green",  soft: "#ecf3e0" },
  blue:   { hex: "#007bc3", d: "#0367a3", chip: "chip-blue",   soft: "#e2f0fb" },
  orange: { hex: "#f47d42", d: "#e0651f", chip: "chip-orange", soft: "#fdebe0" },
};

// Smooth-scroll to a section by id, accounting for the sticky header.
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// Labelled asset placeholder
export function Placeholder({ label, className, style, round }) {
  return (
    <div
      className={"ph" + (round ? " ph-round" : "") + (className ? " " + className : "")}
      style={style}
    >
      <span className="ph-label">{label}</span>
    </div>
  );
}

// Scroll reveal wrapper (deterministic: checks position on mount + scroll).
// SSR / pre-hydration renders WITHOUT the `reveal` class so the server HTML
// shows content fully (no opacity:0) — important for crawlers and to avoid a
// flash. Once mounted on the client, the scroll-reveal animation takes over.
export function Reveal({ children, as, className, style, delay }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) { setShown(true); return true; }
      return false;
    };
    // immediate check (next frame so layout is settled)
    raf = requestAnimationFrame(() => { if (!check()) setShown((s) => s); });
    const onScroll = () => { if (check()) { window.removeEventListener("scroll", onScroll); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // safety: never leave content invisible
    const safety = setTimeout(() => setShown(true), 1200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const Tag = as || "div";
  // Before mount: no reveal class (content visible). After mount: animate in.
  const cls = !mounted
    ? (className || "")
    : "reveal" + (shown ? " in" : "") + (className ? " " + className : "");
  return (
    <Tag
      ref={ref}
      className={cls}
      style={{ transitionDelay: delay ? delay + "ms" : undefined, ...(style || {}) }}
    >
      {children}
    </Tag>
  );
}

// Section header block
export function SectionHead({ eyebrow, eyebrowClass, title, titleHtml, lede, center, id }) {
  return (
    <div className={"section-head" + (center ? " center" : "")}>
      {eyebrow && <span className={"eyebrow" + (eyebrowClass ? " " + eyebrowClass : "")}>{eyebrow}</span>}
      {titleHtml
        ? <h2 id={id} dangerouslySetInnerHTML={{ __html: title }} />
        : <h2 id={id}>{title}</h2>}
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}
