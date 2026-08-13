import { Icon } from "./icons.jsx";

/* Digital business card — the whole body of /taylornguyen and /chaunguyen.

   Server component on purpose (no "use client"): every control is a plain
   <a href>, there is no state, and the copy must be in the HTML for the
   OG/link-preview scrapers that will hit this URL from Zalo and Messenger.

   Ported 1:1 from the approved design; see src/card-content.js for where the
   data comes from and app/(cards)/card.css for the styles. Content is passed
   in as `card` — no copy is hardcoded here.

   Contact rows are links (tel:/mailto:/maps) where the design had plain text.
   Same pixels, but on the phone this page is actually read on, the details
   are tappable. */

function ContactRow({ icon, href, children }) {
  return (
    <a className="bcard-row" href={href}>
      <span className="bcard-row-icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="bcard-row-text">{children}</span>
    </a>
  );
}

export default function BusinessCard({ card }) {
  return (
    <div className="bcard">
      {/* Decorative only: the pale disc bleeding off the top and the faint
          compass mark in the bottom corner. Hidden from assistive tech. */}
      <div className="bcard-disc" aria-hidden="true" />
      <img className="bcard-watermark" src="/assets/cards/cmg-mark.png" alt="" aria-hidden="true" />

      <header className="bcard-head">
        <img className="bcard-logo" src={card.logo} alt={card.org} />

        <div className="bcard-portrait">
          <div className="bcard-portrait-inner">
            <img
              src={card.photo}
              alt={card.name}
              style={{ objectPosition: card.photoPosition }}
            />
          </div>
        </div>

        <h1 className="bcard-name">{card.name}</h1>
        <p className="bcard-title">{card.title}</p>
      </header>

      <div className="bcard-body">
        <p className="bcard-blurb">{card.blurb}</p>

        <div className="bcard-rows">
          <ContactRow icon="phone" href={`tel:${card.tel}`}>
            {card.phone}
          </ContactRow>
          <ContactRow icon="mail" href={`mailto:${card.email}`}>
            <span className="bcard-email">{card.email}</span>
          </ContactRow>
          <ContactRow
            icon="pin"
            href={`https://maps.google.com/?q=${encodeURIComponent(card.address)}`}
          >
            {card.address}
          </ContactRow>
        </div>

        <div className="bcard-actions">
          <a className="bcard-btn bcard-btn-solid" href={`tel:${card.tel}`}>
            {card.ctaCall}
          </a>
          <a
            className="bcard-btn bcard-btn-ghost"
            href={card.siteHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {card.ctaSite}
          </a>
        </div>
      </div>
    </div>
  );
}
