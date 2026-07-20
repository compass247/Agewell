/* ============================================================
   COMPASS AGEWELL — Medical team page sections
   Server-rendered (no "use client"): the whole page is static
   trust-building content, so its HTML stays fully crawlable —
   same reasoning as the blog body in BlogChrome. Content comes
   from src/team-content.js as a `T` prop; chrome copy (hotline)
   from content-data via `C` where needed.
   ============================================================ */
import { Icon } from "../components/icons.jsx";

/* ---------------- Hero ---------------- */
export function TeamHero({ T, hotline }) {
  const h = T.hero;
  return (
    <section className="mteam-hero">
      <span className="mteam-hero-blob" aria-hidden="true" />
      <div className="container mteam-hero-inner">
        <span className="eyebrow">{h.eyebrow}</span>
        <h1>{h.title}</h1>
        <p className="lede">{h.sub}</p>
        <div className="mteam-hero-ctas">
          <a className="btn btn-primary btn-lg" href="#dangky">
            <Icon name="message" /> {h.ctaPrimary}
          </a>
          <a className="btn btn-ghost btn-lg" href={"tel:" + hotline.tel}>
            <Icon name="phone" /> {hotline.number}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Three trust pillars ---------------- */
export function TeamPillars({ T }) {
  return (
    <section className="mteam-pillars">
      <div className="container">
        <div className="mteam-pillar-grid">
          {T.pillars.map((p, i) => (
            <div key={i} className="mteam-pillar">
              <span className="icon-chip chip-green">
                <Icon name={p.icon} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- System intro band ---------------- */
export function TeamIntro({ T }) {
  return (
    <section className="bg-green section-pad">
      <div className="container mteam-intro">
        <h2>{T.intro.title}</h2>
        <p className="lede">{T.intro.text}</p>
      </div>
    </section>
  );
}

/* ---------------- Member profile grid ---------------- */
function CredBlock({ icon, label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mteam-cred">
      <div className="mteam-cred-label">
        <Icon name={icon} size={16} /> {label}
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function TeamGrid({ T }) {
  const L = T.labels;
  return (
    <section className="bg-white section-pad" id="doingu">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">{T.teamHead.eyebrow}</span>
          <h2>{T.teamHead.title}</h2>
        </div>
        <div className="mteam-grid">
          {T.members.map((m, i) => (
            <article key={i} className="mteam-card">
              <div className="mteam-card-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} loading="lazy" width="64" height="64" />
                <div>
                  <h3>{m.name}</h3>
                  <div className="mteam-degree">{m.degree}</div>
                </div>
              </div>
              <span className={"mteam-badge tone-" + m.tone}>{m.specialty}</span>
              <CredBlock icon="shield" label={L.boardCert} items={m.boardCert} />
              <CredBlock icon="globe" label={L.training} items={m.training} />
              <CredBlock icon="check" label={L.experience} items={m.experience} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Care philosophy band ---------------- */
export function TeamPhilosophy({ T }) {
  const p = T.philosophy;
  return (
    <section className="mteam-philosophy">
      <div className="container">
        <div className="mteam-philosophy-head">
          <h2>{p.title}</h2>
          <p>{p.sub}</p>
        </div>
        <div className="mteam-philosophy-grid">
          {p.items.map((it, i) => (
            <div key={i} className="mteam-philosophy-item">
              <span className="mteam-philosophy-ic">
                <Icon name={it.icon} />
              </span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
