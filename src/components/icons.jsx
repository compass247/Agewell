/* ============================================================
   COMPASS AGEWELL — Icon set (clean line icons, currentColor)
   Functional UI icons only. 24×24, stroke 2, round caps.
   ============================================================ */
const P = {
  car: (
    <g>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  ),
  message: (
    <g>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </g>
  ),
  video: (
    <g>
      <rect x="2" y="6" width="14" height="12" rx="2.5" />
      <path d="M22 8.5 16 12l6 3.5z" />
    </g>
  ),
  calendar: (
    <g>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M12 18.4c-1.7-1.2-3-2.2-3-3.7a1.5 1.5 0 0 1 3-.5 1.5 1.5 0 0 1 3 .5c0 1.5-1.3 2.5-3 3.7z" />
    </g>
  ),
  pill: (
    <g>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </g>
  ),
  shield: (
    <g>
      <path d="M20 13c0 5-3.5 7.4-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.4 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </g>
  ),
  heart: (
    <g>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </g>
  ),
  repeat: (
    <g>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </g>
  ),
  phone: (
    <g>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </g>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  x: (
    <g>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </g>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  arrowRight: (
    <g>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </g>
  ),
  arrowDown: (
    <g>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </g>
  ),
  pin: (
    <g>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </g>
  ),
  chat: (
    <g>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </g>
  ),
};

export function Icon({ name, size, style, className }) {
  const glyph = P[name];
  if (!glyph) return null;
  return (
    <svg
      className={className}
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
