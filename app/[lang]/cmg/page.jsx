import { setRequestLocale } from "next-intl/server";
import { Link } from "../../../src/i18n/navigation.js";
import { routing } from "../../../src/i18n/routing.js";
import { Icon } from "../../../src/components/icons.jsx";
import { getCmgContent, buildCmgMetadata } from "../../../src/cmg-content.js";
import "./cmg.css";

/* Compass Medical Group landing page — /vi/cmg and /en/cmg.

   This is the PARENT brand (Compass Medical Group, P.C.), not AgeWell, so it
   deliberately does NOT use BlogChrome: it brings its own header, footer and
   design tokens (see cmg.css) and links OUT to AgeWell, Vietnam Care and the
   AgeWell contact form.

   Fully server-rendered — no "use client". The design export drove language
   with a JS toggle and the 4-up journey row with a ResizeObserver; both are
   replaced here by real next-intl routes (/vi/cmg ↔ /en/cmg, so each language
   is crawlable) and a CSS media query.

   The bare path /cmg resolves in two ways because the build targets differ:
   middleware.js (next-intl, localePrefix "always") redirects it in
   dev/standalone, and public/_redirects does it on the static Cloudflare Pages
   build where middleware is stashed out. Same pattern as /contact-us. */

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildCmgMetadata(lang);
}

function Header({ C, lang }) {
  return (
    <header className="cmg-header">
      <div className="cmg-header-inner">
        {/* The full stacked lockup, not the mark + live text it replaced. The
            company name now lives in alt= so crawlers and screen readers still
            get it — the lockup's own "Compass Medical Group, P. C." line is
            only 7.7% of the logo's height and is decorative at this size. */}
        <a href="#top" className="cmg-logo">
          <img src={C.media.logo} alt={C.brand.alt} width={480} height={402} />
        </a>
        <nav className="cmg-nav">
          <span className="cmg-nav-links">
            <a className="cmg-nav-link" href="#services">{C.nav.services}</a>
            <a className="cmg-nav-link" href="#how">{C.nav.how}</a>
            <a className="cmg-nav-link" href="#why">{C.nav.why}</a>
            <a className="cmg-nav-link" href="#who">{C.nav.who}</a>
            <a className="cmg-nav-link" href="#partners">{C.nav.partners}</a>
          </span>
          <span className="cmg-lang" aria-label={C.langLabel}>
            <Link href="/cmg" locale="en" aria-current={lang === "en" ? "true" : undefined}>EN</Link>
            <Link href="/cmg" locale="vi" aria-current={lang === "vi" ? "true" : undefined}>VI</Link>
          </span>
          <a className="cmg-btn xs" href="#services">{C.nav.cta}</a>
        </nav>
      </div>
    </header>
  );
}

function Hero({ C }) {
  return (
    <section id="top" className="cmg-section cmg-hero">
      <div className="cmg-container cmg-hero-grid">
        <div>
          <p className="cmg-eyebrow">{C.hero.eyebrow}</p>
          <h1 className="cmg-h1">
            <span>{C.hero.title1}</span>
            <span className="accent">{C.hero.title2}</span>
          </h1>
          <p>{C.hero.p1}</p>
          <p>{C.hero.p2}</p>
          <div className="cmg-cta-row">
            <a className="cmg-btn" href="#services">{C.hero.cta1}</a>
            <a className="cmg-btn-ghost" href="#how">{C.hero.cta2}</a>
          </div>
        </div>
        <div className="cmg-hero-media">
          <img src={C.media.hero} alt={C.hero.alt} width={1100} height={1375} />
        </div>
      </div>
    </section>
  );
}

function Ecosystem({ C }) {
  return (
    <section className="cmg-section divided">
      <div className="cmg-container">
        <div className="cmg-split">
          <h2 className="cmg-h2 tight">{C.eco.title}</h2>
          <div>
            {C.eco.p.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
        <div className="cmg-eco-grid">
          {C.eco.cards.map((card, i) => (
            <div key={card.t}>
              <img src={C.media.eco[i]} alt="" width={700} height={700} />
              <h3>{card.t}</h3>
              <p>{card.d}</p>
            </div>
          ))}
        </div>
        <p className="cmg-close">{C.eco.close}</p>
      </div>
    </section>
  );
}

function Services({ C, lang }) {
  const S = C.services;
  return (
    <section id="services" className="cmg-section cmg-band">
      <div className="cmg-container">
        <div className="cmg-intro">
          <p className="cmg-eyebrow">{S.eyebrow}</p>
          <h2 className="cmg-h2">{S.title}</h2>
          <p className="cmg-sub">{S.sub}</p>
        </div>

        {/* AgeWell — the flagship, so it leads with the image and the only
            in-ecosystem CTA that points at a live site. */}
        <article className="cmg-card-wide">
          <img src={C.media.agewell} alt={S.agewell.alt} width={1000} height={1250} />
          <div className="cmg-card-wide-body">
            <h3 className="cmg-service-name">{S.agewell.name}</h3>
            <p className="cmg-tagline">{S.agewell.tagline}</p>
            <div className="cmg-body">
              {S.agewell.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <ul className="cmg-list">
              {S.agewell.list.map((t) => (
                <li key={t}><span>{t}</span></li>
              ))}
            </ul>
            <p className="cmg-quote">{S.agewell.quote}</p>
            <Link className="cmg-btn sm" href="/">{S.agewell.cta}</Link>
          </div>
        </article>

        <article className="cmg-card-wide flat media-right">
          <img src={C.media.c247} alt={S.c247.alt} width={1000} height={1164} />
          <div className="cmg-card-wide-body">
            <div className="cmg-title-row">
              <h3 className="cmg-service-name sm">{S.c247.name}</h3>
              <span className="cmg-badge">{S.c247.badge}</span>
            </div>
            <p className="cmg-tagline sm">{S.c247.tagline}</p>
            <div className="cmg-body">
              {S.c247.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <ul className="cmg-list two-col blue">
              {S.c247.list.map((t) => (
                <li key={t}><span>{t}</span></li>
              ))}
            </ul>
            <p className="cmg-quote blue last">{S.c247.quote}</p>
          </div>
        </article>

        <div className="cmg-pair">
          <article className="cmg-card">
            <img src={C.media.companion} alt={S.companion.alt} width={1100} height={688} />
            <div className="cmg-card-body">
              <div className="cmg-title-row">
                <h3 className="cmg-service-name sm">{S.companion.name}</h3>
                <span className="cmg-badge">{S.companion.badge}</span>
              </div>
              <p className="cmg-tagline">{S.companion.tagline}</p>
              <div className="cmg-body">
                {S.companion.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="cmg-tags">
                {S.companion.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <p className="cmg-quote push">{S.companion.quote}</p>
            </div>
          </article>

          <article className="cmg-card">
            <img src={C.media.vietnam} alt={S.vietnam.alt} width={1100} height={688} />
            <div className="cmg-card-body">
              <h3 className="cmg-service-name sm">{S.vietnam.name}</h3>
              <p className="cmg-tagline">{S.vietnam.tagline}</p>
              <div className="cmg-body">
                {S.vietnam.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <ul className="cmg-list orange">
                {S.vietnam.list.map((t) => (
                  <li key={t}><span>{t}</span></li>
                ))}
              </ul>
              <p className="cmg-quote orange">{S.vietnam.quote}</p>
              {/* Separate product on its own domain — external, per locale. */}
              <a className="cmg-btn sm" href={S.vietnam.href} target="_blank" rel="noopener" lang={lang}>
                {S.vietnam.cta}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

// Each step's accent follows the service it stands for (AgeWell green,
// 24/7 blue, Companion green, Vietnam Care orange), matching the design.
const STEP_TONE = ["", "blue", "", "orange"];
const LINE_TONE = ["", "blue", "orange", ""];

function HowItConnects({ C }) {
  return (
    <section id="how" className="cmg-section">
      <div className="cmg-container">
        <div className="cmg-split centered">
          <div>
            <p className="cmg-eyebrow">{C.how.eyebrow}</p>
            <h2 className="cmg-h2">{C.how.title}</h2>
            {C.how.p.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <img className="cmg-journey-media" src={C.media.journey} alt={C.how.alt} width={1100} height={880} />
        </div>

        <div className="cmg-journey">
          {C.how.steps.map((step, i) => (
            <div key={step.n}>
              <span className="cmg-step-head">
                <span className={`cmg-step-num ${STEP_TONE[i]}`}>{step.n}</span>
                {i < C.how.steps.length - 1 ? (
                  <span className={`cmg-step-line ${LINE_TONE[i]}`} aria-hidden="true" />
                ) : null}
              </span>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
            </div>
          ))}
        </div>

        <p className="cmg-close">{C.how.close}</p>
      </div>
    </section>
  );
}

function WhyCard({ card }) {
  return (
    <article className="cmg-why-card">
      <p className="cmg-why-num">{card.n}</p>
      <p className="cmg-why-kicker">{card.kicker}</p>
      <h3>{card.t}</h3>
      {card.p.map((t) => (
        <p key={t}>{t}</p>
      ))}
    </article>
  );
}

function WhyCompass({ C }) {
  // 2 wide cards on top, 3 narrower ones below — same split as the design.
  const [a, b, ...rest] = C.why.cards;
  return (
    <section id="why" className="cmg-section cmg-band">
      <div className="cmg-container">
        <div className="cmg-intro">
          <p className="cmg-eyebrow">{C.why.eyebrow}</p>
          <h2 className="cmg-h2">{C.why.title}</h2>
          <p className="cmg-sub">{C.why.sub}</p>
        </div>
        <div className="cmg-why-grid">
          <WhyCard card={a} />
          <WhyCard card={b} />
        </div>
        <div className="cmg-why-grid trio">
          {rest.map((card) => (
            <WhyCard key={card.n} card={card} />
          ))}
        </div>
        <p className="cmg-close center">{C.why.close}</p>
      </div>
    </section>
  );
}

function WhoWeServe({ C }) {
  return (
    <section id="who" className="cmg-section">
      <div className="cmg-container">
        <div className="cmg-intro">
          <p className="cmg-eyebrow">{C.who.eyebrow}</p>
          <h2 className="cmg-h2">{C.who.title}</h2>
          <p className="cmg-sub">{C.who.sub}</p>
        </div>
        <div className="cmg-who-grid">
          {C.who.cards.map((card) => (
            <div className="cmg-who-cell" key={card.t}>
              <span className="cmg-who-icon">
                <Icon name={card.icon} size={30} />
              </span>
              <h3>{card.t}</h3>
              <p className="cmg-tagline">{card.sub}</p>
              <div className="cmg-body">
                {card.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="cmg-close">{C.who.close}</p>
      </div>
    </section>
  );
}

function VisionMission({ C }) {
  return (
    <section className="cmg-vision">
      <div className="cmg-container cmg-vision-inner">
        <div className="cmg-vision-grid">
          <div>
            <p className="cmg-eyebrow">{C.vision.eyebrow}</p>
            <h2 className="cmg-h2">{C.vision.title}</h2>
            <div className="cmg-vision-blocks">
              <div>
                <p className="cmg-vision-label">{C.vision.visionLabel}</p>
                <p>{C.vision.vision}</p>
              </div>
              <div>
                <p className="cmg-vision-label">{C.vision.missionLabel}</p>
                <p>{C.vision.mission}</p>
              </div>
            </div>
          </div>
          <div className="cmg-beliefs">
            {C.vision.beliefs.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Partners({ C }) {
  return (
    <section id="partners" className="cmg-section">
      <div className="cmg-container">
        <div className="cmg-split">
          <div>
            <p className="cmg-eyebrow">{C.partners.eyebrow}</p>
            <h2 className="cmg-h2 tight">{C.partners.title}</h2>
          </div>
          <div>
            {C.partners.p.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {/* Scrolls back to the hero, as in the design export (href="#top").
                It briefly pointed at /[lang]/contact-us instead; that sent people
                off to the AgeWell lead form, which is a different brand's intake
                and not what this page's CTA promises. */}
            <a className="cmg-btn" href="#top" style={{ marginTop: 28 }}>
              {C.partners.cta}
            </a>
          </div>
        </div>
        <div className="cmg-partner-grid">
          {C.partners.items.map((item) => (
            <div className="cmg-partner-card" key={item.t}>
              <h3>{item.t}</h3>
              <p>{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing({ C }) {
  return (
    <section className="cmg-final">
      <div className="cmg-container">
        <div className="cmg-final-inner">
          <div style={{ width: "100%" }}>
            <h2>{C.final.title}</h2>
            <div className="cmg-final-grid">
              <div>
                {C.final.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="cmg-cta-row">
                <a className="cmg-btn-white" href={`tel:${C.contact.tel}`}>{C.final.call}</a>
                <a className="cmg-btn-outline" href="#partners">{C.final.partner}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ C }) {
  const S = C.services;
  return (
    <footer className="cmg-footer">
      <div className="cmg-footer-grid">
        <div>
          <img src={C.media.logo} alt={C.footer.logoAlt} width={480} height={402} />
          <p>{C.footer.tagline}</p>
        </div>
        <div>
          <p className="cmg-footer-label">{C.footer.servicesLabel}</p>
          <div className="cmg-footer-links">
            <a href="#services">{S.agewell.name}</a>
            <a href="#services">{S.c247.name}</a>
            <a href="#services">{S.companion.name}</a>
            <a href="#services">{S.vietnam.name}</a>
          </div>
        </div>
        <div>
          <p className="cmg-footer-label">{C.footer.companyLabel}</p>
          <div className="cmg-footer-links">
            <a href="#how">{C.nav.how}</a>
            <a href="#why">{C.nav.why}</a>
            <a href="#who">{C.nav.who}</a>
            <a href="#partners">{C.nav.partners}</a>
          </div>
        </div>
        <div>
          <p className="cmg-footer-label">{C.footer.contactLabel}</p>
          {/* Gated on emailLive — the mailbox does not exist yet, so showing
              the address would just collect mail nobody reads. */}
          {C.contact.emailLive ? (
            <p className="cmg-footer-contact">{C.contact.email}</p>
          ) : null}
          <p>{C.footer.entity}</p>
        </div>
      </div>
      <p className="cmg-legal">{C.footer.legal}</p>
    </footer>
  );
}

export default async function CmgPage({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);

  const C = getCmgContent(lang);

  return (
    <div className="cmg">
      <Header C={C} lang={lang} />
      <main>
        <Hero C={C} />
        <Ecosystem C={C} />
        <Services C={C} lang={lang} />
        <HowItConnects C={C} />
        <WhyCompass C={C} />
        <WhoWeServe C={C} />
        <VisionMission C={C} />
        <Partners C={C} />
        <Closing C={C} />
      </main>
      <Footer C={C} />
    </div>
  );
}
