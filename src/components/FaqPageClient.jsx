"use client";
/* ============================================================
   COMPASS AGEWELL — FAQ landing page client shell
   Renders the BD FAQ design (hero → sticky quick-nav → 3 color-
   coded groups of accordion cards → disclaimer) inside the shared
   BlogChrome (Header/Footer/ContactBar + SignupForm at the bottom).

   All copy comes from src/faq-content.js via the `F` prop — answer
   bodies are serializable blocks rendered by <FaqBlock>. Accordion:
   multiple items may be open at once; q1/q4/q7 start open.
   ============================================================ */
import { useState } from "react";
import BlogChrome from "./BlogChrome.jsx";
import { Icon } from "./icons.jsx";

// Smooth-scroll to a group anchor. scrollIntoView (unlike the shared
// scrollToId helper's fixed offset) honors each group's scroll-margin-top,
// which accounts for the sticky header + quick-nav.
function scrollToGroup(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- Answer blocks ---------------- */
function FaqBlock({ b }) {
  switch (b.type) {
    case "p":
      return (
        <p className="faqp-p">
          {b.text}
          {b.strong && <strong>{b.strong}</strong>}
          {b.after}
        </p>
      );
    case "cards": // Q5 — the three service mini-cards
      return (
        <div className="faqp-cards">
          {b.items.map((c, i) => (
            <div key={i} className="faqp-scard">
              <span className="faqp-scard-ic"><Icon name={c.icon} size={28} /></span>
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      );
    case "checklist": // Q5 — prep-info box
      return (
        <div className="faqp-check">
          <div className="faqp-check-title">{b.title}</div>
          <ul>
            {b.items.map((it, i) => (
              <li key={i}>
                <Icon name="check" size={18} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "table": // Q6 — Medicare types table
      return (
        <div className="faqp-table-wrap">
          <table className="faqp-table">
            <thead>
              <tr>
                {b.head.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td>
                    <span className={"faqp-badge" + (r.ok ? " ok" : "")}>{r.badge}</span>
                    {r.note && <span className="faqp-note">{r.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "tip": // Q6 — blue tip box
      return (
        <div className="faqp-tip">
          <b>{b.label}</b> <span>{b.text}</span>
        </div>
      );
    case "steps": // Q10 — 3-step timeline
      return (
        <>
          {b.intro && <p className="faqp-p">{b.intro}</p>}
          <div className="faqp-steps">
            {b.items.map((s, i) => (
              <div key={i} className="faqp-step">
                <span className="faqp-step-num" aria-hidden="true">{i + 1}</span>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </>
      );
    case "highlight": // Q10 — green highlight box
      return <div className="faqp-highlight">{b.text}</div>;
    default:
      return null;
  }
}

/* ---------------- Accordion item ---------------- */
function FaqCard({ item }) {
  const [open, setOpen] = useState(!!item.defaultOpen);
  return (
    <div className="faqp-item">
      <button
        type="button"
        className="faqp-q"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{item.q}</span>
        <span className="faqp-arrow" aria-hidden="true">▸</span>
      </button>
      {open && (
        <div className="faqp-a">
          {item.blocks.map((b, i) => <FaqBlock key={i} b={b} />)}
        </div>
      )}
    </div>
  );
}

/* ---------------- Group (section header + cards) ---------------- */
function FaqGroup({ g }) {
  return (
    <section id={g.id} className={"faqp-group " + g.color}>
      <div className="faqp-group-head">
        <div className="faqp-group-num" aria-hidden="true">{g.num}</div>
        <h2>{g.title}</h2>
        <div className="faqp-divider" />
      </div>
      {g.items.map((item) => <FaqCard key={item.id} item={item} />)}
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function FaqPageClient({ C, lang, F }) {
  return (
    <BlogChrome C={C} lang={lang}>
      <div className="faqp">
        <div className="faqp-hero">
          <h1>{F.hero.title}</h1>
          <p className="faqp-sub">{F.hero.sub}</p>
        </div>

        {/* Quick nav: sticky under the header on desktop only — below 1040px
            the site's .mobile-anchor already sticks at top:72px. */}
        <nav className="faqp-nav">
          {F.groups.map((g) => (
            <button
              key={g.id}
              type="button"
              className={"faqp-pill " + g.color}
              onClick={() => scrollToGroup(g.id)}
            >
              {g.navLabel}
            </button>
          ))}
        </nav>

        <div className="faqp-body">
          {F.groups.map((g) => <FaqGroup key={g.id} g={g} />)}

          <div className="faqp-disclaimer" role="note">
            <b>{F.disclaimer.title}</b>
            <p>{F.disclaimer.text}</p>
          </div>
          <p className="faqp-contact">{F.contactLine}</p>
        </div>
      </div>
    </BlogChrome>
  );
}
