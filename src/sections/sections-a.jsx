/* ============================================================
   COMPASS AGEWELL — Sections A
   Header · MobileAnchor · Hero · Problem · Services · CareLoop
   ============================================================ */
import { Fragment, useState, useEffect } from "react";
import { Icon } from "../components/icons.jsx";
import { AGEWELL_COLORS, Reveal, SectionHead, scrollToId } from "../components/shared.jsx";

const C = () => AGEWELL_COLORS;

/* ---------------- Header ---------------- */
export function Header({ t, lang, setLang }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <img src="/assets/logo-color.png" alt="Compass AgeWell" />
        </a>

        <nav className="nav-anchor" aria-label="Section navigation">
          {t.nav.map((n) => (
            <a key={n.id} href={"#" + n.id} onClick={(e) => { e.preventDefault(); scrollToId(n.id); }}>{n.label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")} aria-pressed={lang === "vi"}>VI</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
          </div>
          <a className="btn btn-primary header-cta" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>
            {t.headerCta}
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Mobile anchor strip ---------------- */
export function MobileAnchor({ t }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={"mobile-anchor" + (show ? "" : " hidden")} aria-hidden={!show}>
      <ul>
        {t.nav.map((n) => (
          <li key={n.id}><a href={"#" + n.id} onClick={(e) => { e.preventDefault(); scrollToId(n.id); }}>{n.label}</a></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Hero ---------------- */
export function Hero({ t }) {
  const h = t.hero;
  return (
    <section className="bg-cream" id="top">
      <div className="container hero">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow">{h.eyebrow}</span>
            <h1>{h.title}</h1>
            <p className="sub">{h.sub}</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>{h.ctaPrimary}</a>
            </div>
            <div className="hero-hotline">
              <span className="ic"><Icon name="phone" /></span>
              <span>
                <small style={{ display: "block", color: "var(--muted)", fontWeight: 600, fontSize: ".82rem" }}>{h.hotlinePre}</small>
                <a className="num" href={"tel:" + t.hotline.tel}>{t.hotline.number}</a>
              </span>
            </div>
            <div className="hero-trust">
              {h.trust.map((tr, i) => (
                <span key={i}><Icon name="check" size={20} />{tr}</span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="hero-media" delay={120}>
          <img
            src="/assets/hero-banner.png"
            alt={h.mediaLabel}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-lg)", display: "block" }}
          />
          <div className="hero-badge">
            <span className="icon-chip chip-green"><Icon name="repeat" /></span>
            <span><b>{h.badge.title}</b><small>{h.badge.sub}</small></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Problem ---------------- */
export function Problem({ t }) {
  const p = t.problem;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
        <div className="prob-grid">
          {p.cards.map((c, i) => (
            <Reveal key={i} className="prob-card" delay={i * 90}>
              <span className="icon-chip chip-green"><Icon name={c.icon} /></span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="prob-bridge" dangerouslySetInnerHTML={{ __html: p.bridge }} />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
export function Services({ t, variant }) {
  const s = t.services;
  return (
    <section className="bg-mint section-pad" id="dichvu">
      <div className="container">
        <SectionHead eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
        <div className={"svc-wrap svc-v-" + variant}>
          <div className="svc-grid">
            {s.cards.map((c, i) => {
              const col = C()[c.color];
              if (variant === "horizontal") {
                return (
                  <Reveal key={i} className="svc-card" delay={i * 90} style={{ ["--c"]: col.hex }}>
                    <span className={"icon-chip " + col.chip}><Icon name={c.icon} /></span>
                    <div className="svc-body">
                      <span className="svc-tag">{c.tag}</span>
                      <h3>{c.title}</h3>
                      <p>{c.text}</p>
                      <a className="svc-link" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>
                        {s.learnMore} <Icon name="arrowRight" />
                      </a>
                    </div>
                  </Reveal>
                );
              }
              return (
                <Reveal key={i} className="svc-card" delay={i * 90} style={{ ["--c"]: col.hex }}>
                  <span className={"icon-chip " + col.chip}><Icon name={c.icon} /></span>
                  <span className="svc-tag">{c.tag}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <a className="svc-link" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>
                    {s.learnMore} <Icon name="arrowRight" />
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Care Loop ---------------- */
export function CareLoop({ t, variant }) {
  const l = t.loop;
  const steps = l.steps;

  const Circle = () => (
    <div className="loop-circle three">
      {steps.map((s, i) => {
        const col = C()[s.color];
        return (
          <Fragment key={i}>
            <div className="loop-node">
              <span className="num" style={{ background: col.hex }}>{i + 1}</span>
              <div className="loop-step-ic" style={{ display: "none" }} />
              <div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="loop-arrow-v"><Icon name="arrowDown" /></div>
            )}
          </Fragment>
        );
      })}
    </div>
  );

  const Horizontal = () => (
    <div className="loop-horizontal">
      {steps.map((s, i) => {
        const col = C()[s.color];
        return (
          <Fragment key={i}>
            <div className="loop-hstep">
              <div className="loop-step-ic"><span className={"icon-chip " + col.chip}><Icon name={s.icon} /></span></div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
            {i < steps.length - 1 && <div className="loop-conn"><Icon name="arrowDown" /></div>}
          </Fragment>
        );
      })}
    </div>
  );

  const Vertical = () => (
    <div className="loop-vertical">
      {steps.map((s, i) => {
        const col = C()[s.color];
        return (
          <div className="loop-vstep" key={i}>
            <span className="icon-chip" style={{ background: col.soft, color: col.d, width: 70, height: 70, borderRadius: 22 }}>
              <Icon name={s.icon} size={32} />
            </span>
            <div className="body">
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="bg-green section-pad" id="vonglap">
      <div className="container">
        <SectionHead center eyebrow={l.eyebrow} title={l.title} lede={l.lede} />
        <Reveal>
          {variant === "horizontal" ? <Horizontal /> : variant === "vertical" ? <Vertical /> : <Circle />}
          <p className="loop-msg" dangerouslySetInnerHTML={{ __html: l.message }} />
        </Reveal>
      </div>
    </section>
  );
}
