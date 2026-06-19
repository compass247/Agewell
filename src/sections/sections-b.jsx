"use client";
/* ============================================================
   COMPASS AGEWELL — Sections B
   USP+Team · Eligibility+FAQ · Testimonials · Form · Footer · ContactBar
   ============================================================ */
import { useState, useRef } from "react";
import { Icon } from "../components/icons.jsx";
import { AGEWELL_COLORS, Reveal, SectionHead, Placeholder, scrollToId } from "../components/shared.jsx";
import { LangToggle } from "../components/LangToggle.jsx";
import { NavItem } from "./sections-a.jsx";
import { submitLead } from "../api.js";

const C = () => AGEWELL_COLORS;
const go = (id) => scrollToId(id);

const CHATS = [
  { name: "Zalo", href: "#" },
  { name: "Messenger", href: "#" },
  { name: "WhatsApp", href: "#" },
  { name: "Viber", href: "#" },
];

/* ---------------- USP + Team ---------------- */
export function UspTeam({ t }) {
  const u = t.usp;
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={u.eyebrow} title={u.title} />
        <div className="usp-grid">
          {u.items.map((it, i) => {
            const col = C()[it.color];
            return (
              <Reveal key={i} className="usp-item" delay={i * 90}>
                <span className={"icon-chip " + col.chip}><Icon name={it.icon} /></span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </Reveal>
            );
          })}
        </div>

        <hr className="team-sep" />

        <SectionHead center title={u.teamTitle} />
        <div className="team-grid">
          {u.team.map((m, i) => (
            <Reveal key={i} className="team-card" delay={i * 90}>
              {m.img
                ? <img src={m.img} alt={m.title} className="team-photo" loading="lazy" />
                : <Placeholder label={m.label} />}
              <div className="tbody">
                <div className="role">{m.role}</div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ item ---------------- */
function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const inner = useRef(null);
  return (
    <div className="faq-item">
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="q-ic"><Icon name="message" size={18} /></span>
        <span>{q}</span>
        <span className="chev"><Icon name="chevron" /></span>
      </button>
      <div className="faq-a" style={{ maxHeight: open ? (inner.current ? inner.current.scrollHeight + 24 : 400) : 0 }}>
        <div className="faq-a-inner" ref={inner}>{a}</div>
      </div>
    </div>
  );
}

/* ---------------- Eligibility + Cost + FAQ ---------------- */
export function Eligibility({ t }) {
  const e = t.elig;
  return (
    <section className="bg-mint section-pad" id="dieukien">
      <div className="container">
        <SectionHead center eyebrow={e.eyebrow} title={e.title} lede={e.lede} />
        <div className={"elig-grid" + (e.cards.length === 1 ? " single" : "")}>
          {e.cards.map((c, i) => (
            <Reveal key={i} className={"elig-card " + c.type} delay={i * 80}>
              <div className="top">
                <span className="badge"><Icon name={c.type === "ok" ? "check" : "x"} size={22} /></span>
                <h3>{c.title}</h3>
              </div>
              <p>{c.text}</p>
              <span className="pill">{c.pill}</span>
            </Reveal>
          ))}
        </div>

        <Reveal className="cost-cta">
          <div className="ct">
            <h3>{e.cost.title}</h3>
            <p>{e.cost.text}</p>
          </div>
          <a className="btn btn-primary" href="#dangky" onClick={(ev) => { ev.preventDefault(); go("dangky"); }}>{e.cost.cta}</a>
        </Reveal>

        <SectionHead center title={e.faqTitle} />
        <div className="faq">
          {e.faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <a className="svc-link" style={{ justifyContent: "center" }} href="#dangky" onClick={(ev) => { ev.preventDefault(); go("dangky"); }}>
              {e.faqMore} <Icon name="arrowRight" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials + Stats ---------------- */
export function Testimonials({ t }) {
  const ts = t.testi;
  const avatarColors = ["#26a146", "#007bc3", "#f47d42"];
  return (
    <section className="bg-white section-pad">
      <div className="container">
        <SectionHead center eyebrow={ts.eyebrow} title={ts.title} />
        <div className="stats-row">
          {ts.stats.map((s, i) => (
            <Reveal key={i} className="stat" delay={i * 80}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </Reveal>
          ))}
        </div>
        <div className="testi-grid">
          {ts.cards.map((c, i) => (
            <Reveal key={i} className="testi-card" delay={i * 80}>
              <div className="quote-mark">&ldquo;</div>
              <p className="quote">{c.quote}</p>
              <div className="testi-who">
                <span className="testi-avatar" style={{ background: avatarColors[i % 3] }}>{c.initials}</span>
                <span>
                  <b>{c.name}</b>
                  <small><Icon name="pin" size={15} />{c.place}</small>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontSize: ".88rem", fontStyle: "italic" }}>{ts.note}</p>
      </div>
    </section>
  );
}

/* ---------------- Signup form ---------------- */
export function SignupForm({ t }) {
  const f = t.form;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  // honeypot — bots fill hidden fields; humans never see it
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const nameOk = name.trim().length > 1;
  const phoneOk = (phone.match(/\d/g) || []).length >= 9;

  const toggleSvc = (opt) =>
    setServices((s) => (s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]));

  const submit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    setError("");
    if (!nameOk || !phoneOk) return;
    setSubmitting(true);
    try {
      await submitLead({
        name: name.trim(),
        phone: phone.trim(),
        services,
        message: message.trim(),
        lang: t.dir,
        company, // honeypot; backend rejects if non-empty
        source: "website",
      });
      setDone(true);
    } catch {
      setError(f.errSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-mint section-pad" id="dangky">
      <div className="container">
        <SectionHead center eyebrow={f.eyebrow} title={f.title} lede={f.lede} />
        <div className="form-wrap">
          {done ? (
            <div className="form-success">
              <span className="tick"><Icon name="check" size={40} /></span>
              <h3>{f.success.title}</h3>
              <p>{f.success.text}</p>
              <p className="form-hotline" style={{ marginTop: 18 }}>
                <Icon name="phone" size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                <a href={"tel:" + t.hotline.tel}>{t.hotline.number}</a>
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className={"field" + (touched && !nameOk ? " invalid" : "")}>
                <label htmlFor="f-name">{f.fields.name} <span className="req">*</span></label>
                <input id="f-name" type="text" value={name} placeholder={f.fields.namePh}
                  onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <div className="err">{f.errName}</div>
              </div>

              <div className={"field" + (touched && !phoneOk ? " invalid" : "")}>
                <label htmlFor="f-phone">{f.fields.phone} <span className="req">*</span></label>
                <input id="f-phone" type="tel" value={phone} placeholder={f.fields.phonePh}
                  onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                <div className="err">{f.errPhone}</div>
              </div>

              <div className="field">
                <label>{f.fields.services}</label>
                <div className="checkbox-grid">
                  {f.serviceOptions.map((opt, i) => (
                    <label key={i} className={"check-opt" + (services.includes(opt) ? " checked" : "")}>
                      <input type="checkbox" checked={services.includes(opt)} onChange={() => toggleSvc(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-msg">{f.fields.message}</label>
                <textarea id="f-msg" value={message} placeholder={f.fields.messagePh}
                  onChange={(e) => setMessage(e.target.value)} />
              </div>

              {/* honeypot: visually hidden, off-screen, not announced to AT */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={submitting}>
                {submitting ? f.submitting : f.submit}
              </button>

              <p className="form-hotline">
                {f.hotlinePre}{" "}
                <a href={"tel:" + t.hotline.tel}><Icon name="phone" size={18} style={{ verticalAlign: "-3px", marginRight: 4 }} />{t.hotline.number}</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
export function Footer({ t, lang }) {
  const fo = t.footer;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="logo-pill"><img src="/assets/logo-white.png" alt="Compass AgeWell" /></span>
            <p style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>{fo.tagline}</p>
            <p>{fo.desc}</p>
          </div>

          <div className="footer-col">
            <h4>{fo.navTitle}</h4>
            <ul>
              {t.nav.map((n) => (
                <li key={n.id}><NavItem n={n} /></li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>{fo.contactTitle}</h4>
            <a className="num" href={"tel:" + t.hotline.tel}>{t.hotline.number}</a>
            <div style={{ color: "#9fb8a7", fontSize: ".9rem", marginTop: 4 }}>{fo.chatTitle}</div>
            <div className="footer-chats">
              {CHATS.map((c) => (
                <a key={c.name} className="footer-chat" href={c.href}><Icon name="chat" size={18} />{c.name}</a>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <LangToggle lang={lang} />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="disclaimer">{fo.disclaimer}</p>
          <p className="disclaimer">{fo.rights}</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Sticky contact bar ---------------- */
export function ContactBar({ t }) {
  const cb = t.contactBar;
  return (
    <div className="contact-bar" role="complementary" aria-label="Quick contact">
      <a className="call" href={"tel:" + t.hotline.tel}>
        <Icon name="phone" /><span>{cb.call} {t.hotline.number}</span>
      </a>
      <a className="chat-primary" href="#dangky" onClick={(e) => { e.preventDefault(); go("dangky"); }}>
        <Icon name="chat" /><span>{cb.chat}</span>
      </a>
    </div>
  );
}
