/* ============================================================
   COMPASS AGEWELL — Shared helpers
   ============================================================ */
(function () {
  const { useRef, useEffect, useState } = React;

  // Brand color hex map for accents on cards
  window.AGEWELL_COLORS = {
    green:  { hex: "#26a146", d: "#1c7d36", chip: "chip-green",  soft: "#ecf3e0" },
    blue:   { hex: "#007bc3", d: "#0367a3", chip: "chip-blue",   soft: "#e2f0fb" },
    orange: { hex: "#f47d42", d: "#e0651f", chip: "chip-orange", soft: "#fdebe0" },
  };

  // Labelled asset placeholder
  function Placeholder({ label, className, style, round }) {
    return (
      <div
        className={"ph" + (round ? " ph-round" : "") + (className ? " " + className : "")}
        style={style}
      >
        <span className="ph-label">{label}</span>
      </div>
    );
  }

  // Scroll reveal wrapper (deterministic: checks position on mount + scroll)
  function Reveal({ children, as, className, style, delay }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
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
    return (
      <Tag
        ref={ref}
        className={"reveal" + (shown ? " in" : "") + (className ? " " + className : "")}
        style={{ transitionDelay: delay ? delay + "ms" : undefined, ...(style || {}) }}
      >
        {children}
      </Tag>
    );
  }

  // Section header block
  function SectionHead({ eyebrow, title, lede, center, id }) {
    return (
      <div className={"section-head" + (center ? " center" : "")}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 id={id}>{title}</h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
    );
  }

  Object.assign(window, { Placeholder, Reveal, SectionHead });
})();
