"use client";
/* ============================================================
   COMPASS AGEWELL — Service detail sections
   The 8-section template shared by all three service landing
   pages (CCM · MTM · E&M). Driven entirely by a per-service
   content object `s` (see src/service-content.js). Reuses the
   homepage's shared helpers + CSS classes wherever possible.

   CTAs smooth-scroll to the signup form rendered at the bottom of
   THIS page (#dangky) — the form is always present on every service
   page (see ServicePageClient), so no page change is needed.
   ============================================================ */
import { Fragment } from "react";
import { Icon } from "../components/icons.jsx";
import { AGEWELL_COLORS, Reveal, SectionHead, Placeholder, scrollToId } from "../components/shared.jsx";
import { Link } from "../i18n/navigation.js";
import { FaqItem } from "./sections-b.jsx";

const C = () => AGEWELL_COLORS;

/* ---------------- Hero ---------------- */
export function ServiceHero({ s, hotline }) {
  const h = s.hero;
  return (
    <section className="bg-cream" id="top">
      <div className="container hero">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow">{h.eyebrow}</span>
            <h1>{h.title}</h1>
            <p className="sub">{h.sub}</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>{h.cta}</a>
            </div>
            <div className="hero-hotline">
              <span className="ic"><Icon name="phone" /></span>
              <span>
                <small style={{ display: "block", color: "var(--muted)", fontWeight: 600, fontSize: ".82rem" }}>{h.hotlinePre}</small>
                <a className="num" href={"tel:" + hotline.tel}>{hotline.number}</a>
              </span>
            </div>
            {h.trust?.length > 0 && (
              <div className="hero-trust">
                {h.trust.map((tr, i) => (
                  <span key={i}><Icon name="check" size={20} />{tr}</span>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        <Reveal className="hero-media" delay={120}>
          {h.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={h.image}
              alt={h.imageAlt || ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-lg)", display: "block" }}
            />
          ) : (
            <Placeholder label={h.imageAlt || "Hero"} />
          )}
          {h.badge && (
            <div className="hero-badge">
              <span className="icon-chip chip-green"><Icon name="repeat" /></span>
              <span><b>{h.badge.title}</b><small>{h.badge.sub}</small></span>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- What is X? ---------------- */
export function ServiceWhatIs({ s }) {
  const w = s.whatIs;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead eyebrow={w.eyebrow} title={w.title} />
        <div className="svc-detail-split">
          <Reveal className="svc-detail-copy">
            {w.paras.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
          <Reveal className="svc-detail-list" delay={90}>
            {w.bulletsTitle && <h3>{w.bulletsTitle}</h3>}
            <ul className="check-list">
              {w.bullets.map((b, i) => (
                <li key={i}><Icon name="check" size={20} /><span>{b}</span></li>
              ))}
            </ul>
          </Reveal>
        </div>
        {w.closing && (
          <Reveal>
            <p className="svc-detail-closing">{w.closing}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------------- Who is it for? ---------------- */
export function ServiceWhoFor({ s }) {
  const w = s.whoFor;
  const listStyle = w.tagsVariant === "list";
  return (
    <section className="bg-mint section-pad">
      <div className="container">
        <SectionHead center eyebrow={w.eyebrow} title={w.title} />
        <div className="whofor-grid">
          <Reveal className="elig-card ok whofor-card">
            <div className="top">
              <span className="badge"><Icon name="check" size={22} /></span>
              <h3>{w.card.title}</h3>
            </div>
            <ul className="check-list">
              {w.card.items.map((it, i) => (
                <li key={i}><Icon name="check" size={18} /><span>{it}</span></li>
              ))}
            </ul>
          </Reveal>

          {w.tags?.length > 0 && (
            <Reveal className="whofor-tags" delay={90}>
              {w.tagsTitle && <h3>{w.tagsTitle}</h3>}
              {listStyle ? (
                <ul className="check-list">
                  {w.tags.map((t, i) => (
                    <li key={i}><Icon name="check" size={18} /><span>{t}</span></li>
                  ))}
                </ul>
              ) : (
                <div className="tag-cloud">
                  {w.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>
              )}
              {w.tagsNote && <p className="tags-note">{w.tagsNote}</p>}
            </Reveal>
          )}
        </div>

        {w.callout && (
          <Reveal>
            <p className="whofor-callout">{w.callout}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------------- 3-step process ---------------- */
export function ServiceSteps({ s }) {
  const st = s.steps;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={st.eyebrow} title={st.title} />
        <div className="svc-steps">
          {st.items.map((it, i) => (
            <Fragment key={i}>
              <Reveal className="svc-step" delay={i * 90}>
                <span className="svc-step-num">{i + 1}</span>
                <span className="icon-chip chip-green"><Icon name={it.icon} /></span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </Reveal>
              {i < st.items.length - 1 && (
                <div className="svc-step-conn" aria-hidden="true"><Icon name="arrowRight" /></div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Concrete benefits ---------------- */
export function ServiceBenefits({ s }) {
  const b = s.benefits;
  return (
    <section className="bg-mint section-pad">
      <div className="container">
        <SectionHead center eyebrow={b.eyebrow} title={b.title} />
        <div className={"benefit-grid cols-" + b.columns.length}>
          {b.columns.map((col, i) => {
            const c = C()[col.color] || C().green;
            return (
              <Reveal key={i} className="benefit-card" delay={i * 90}>
                <div className="benefit-head">
                  <span className={"icon-chip " + c.chip}><Icon name={col.icon} /></span>
                  <h3>{col.title}</h3>
                </div>
                <ul className="check-list">
                  {col.items.map((it, j) => (
                    <li key={j}><Icon name="check" size={18} /><span>{it}</span></li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cost ---------------- */
export function ServiceCost({ s }) {
  const co = s.cost;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={co.eyebrow} title={co.title} />
        <Reveal className="svc-cost-body">
          {co.paras.map((p, i) => <p key={i}>{p}</p>)}
        </Reveal>
        <Reveal className="cost-cta">
          <div className="ct">
            <h3>{co.ctaTitle}</h3>
          </div>
          <a className="btn btn-orange" href="#dangky" onClick={(e) => { e.preventDefault(); scrollToId("dangky"); }}>{co.cta}</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function ServiceFaq({ s }) {
  const f = s.faqs;
  return (
    <section className="bg-mint section-pad">
      <div className="container">
        <SectionHead center eyebrow={f.eyebrow} title={f.title} />
        <div className="faq">
          {f.items.map((it, i) => (
            <FaqItem key={i} q={it.q} a={it.a} defaultOpen={i === 0} />
          ))}
          {f.moreLabel && (
            <p style={{ textAlign: "center", marginTop: 20 }}>
              <Link className="svc-link" style={{ justifyContent: "center" }} href="/#dieukien">
                {f.moreLabel} <Icon name="arrowRight" />
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Related services (cross-links) ---------------- */
export function ServiceRelated({ s }) {
  const r = s.related;
  if (!r?.cards?.length) return null;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={r.eyebrow} title={r.title} />
        <div className="svc-wrap svc-v-bordered">
          <div className="svc-grid svc-grid-related">
            {r.cards.map((card, i) => {
              const col = C()[card.color] || C().green;
              return (
                <Reveal key={i} className="svc-card" delay={i * 90} style={{ ["--c"]: col.hex }}>
                  <span className={"icon-chip " + col.chip}><Icon name={card.icon} /></span>
                  <span className="svc-tag">{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Link className="svc-link" href={"/services/" + card.slug}>
                    {r.more} <Icon name="arrowRight" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
