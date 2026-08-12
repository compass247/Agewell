# Compass AgeWell — Design System

> **Tagline:** Live Well. Age Well. Be Cared For. · *Sống Khỏe. Sống Vui. Được Chăm Sóc.*

## What this is

A brand-aligned design system for **Compass AgeWell**, a national, culturally-matched
healthcare-management service for **elderly Vietnamese-Americans (65+) on Medicare**. The
brand should feel like *"a knowledgeable family member"* — trustworthy, warm, clear, and
respectful. Not cold like a hospital; not flashy like a startup.

This system gives design agents everything needed to produce on-brand interfaces and assets:
color and type tokens, the Be Vietnam Pro webfont, reusable React primitives, foundation
specimen cards, and two full UI kits (marketing website + member portal).

### Sources provided
- `uploads/AGEWELL_BRAND_TOKENS.md` — brand guideline extract (24-page VN Brand Guideline).
- Logo PNGs: full-color submark, horizontal primary lockup, white/reverse lockup, light icon.
- Creato Display OTF font files (Light / Regular / Medium / Bold / ExtraBold).

**No product codebase, Figma file, or slide deck was provided.** The UI kits are therefore
brand-grounded *recreations* built from the guideline — reasonable interpretations, not
pixel copies of shipped product. Flagged again in each kit's README.

---

## Content Fundamentals

**Language.** Bilingual English–Vietnamese, **Vietnamese-first** for member-facing copy.
The audience is older and often more comfortable in Vietnamese; English appears as a
secondary label or toggle (`EN / VI`). Diacritics are always correct (e.g. *Sống Khỏe*,
*Được Chăm Sóc*).

**Tone.** Like family who happens to know medicine. Calm, plain, unhurried. No medical
jargon — explain in everyday words. Respectful of elders and of family decision-making.

**Person.** Warm second person to the member ("bạn" / "you"), inclusive first-person plural
for the service ("chúng tôi" / "we"). Example: *"Bạn chỉ cần tập trung sống khỏe. Chúng tôi
lo phần giấy tờ phức tạp."*

**Casing.** Sentence case for body and most headings. Display headlines may use Title Case
in English (*Live Well. Age Well.*). Short uppercase eyebrows/overlines, tracked out, used
sparingly. Never ALL-CAPS body copy (hard to read for the audience).

**Vibe & examples.** Reassuring, continuity-focused. The core value is *continuous care* —
"mỗi tháng, mỗi cuộc gọi, mỗi lần review thuốc là một điểm chạm." Concrete and specific:
*"Your next call is Tuesday, June 24 at 10:00 AM."* not *"You have an upcoming appointment."*

**Emoji.** Used very sparingly — at most an occasional friendly 👋 in a personal greeting.
Never as functional iconography, never in formal/clinical contexts. Default to none.

---

## Visual Foundations

**Color.** Three brand hues on a warm neutral base:
- **Restorative Emerald `#26a146`** — primary. Logo ring, primary CTAs, headers, active states.
- **Precision Azure `#007bc3`** — tagline, links, secondary actions, info.
- **Active Vitality `#f47d42`** — the compass needle; small vitality accents and highlights only (never large fills).
- **Warm neutrals** — Cream `#f9f8f6` (page bg), Platinum `#c5c4c4` (borders), warm Ink `#1f2422` (text).
Dark green `#1b6b2f` (the "AGEWELL" wordmark) is used for headings on light and for inverse surfaces. Full ramps in `tokens/colors.css`.

**Type.** Single family — **Be Vietnam Pro** (Google Fonts; humanist geometric sans with
first-class Vietnamese diacritics). ExtraBold (800) for
display/H1 with tight tracking (-0.02em); Bold (700) for H2–H3; **Light (300) for body**.
Base body is **18px**, not 16 — the scale runs large for older readers, with roomy
1.55 line-height. See `tokens/typography.css`.

**Spacing & sizing.** 4px base unit. Controls are large: default control height 48px,
min tap target 48px (lg 56px) — accessibility-first for the audience.

**Backgrounds.** Mostly flat cream or white surfaces. Soft tinted brand wash (`green-50/100`)
for emphasis bands; solid dark green (`green-700`) for high-contrast CTA bands and inverse
panels. Occasional large soft-blurred green circle behind hero cards. **No** busy gradients,
no purple/blue tech gradients, no photographic noise/grain by default. The guideline mentions
a "crossing line" care-pathway pattern as an optional decorative motif (not yet supplied as an asset).

**Corners.** Soft and friendly, never sharp/clinical: cards 16px (`radius-lg`), controls 10px,
buttons & tags fully pill (`radius-pill`).

**Shadows.** Soft, low-spread, warm-tinted (`rgba(31,36,34,…)`). `shadow-sm` for resting cards,
`shadow-md` on hover/raised, `shadow-lg` for modals. A dedicated green glow (`shadow-brand`)
sits under primary buttons.

**Cards.** White surface, 1px subtle border, `radius-lg`, `shadow-sm`. Interactive cards lift
2px and deepen to `shadow-md` on hover.

**Motion.** Restrained and gentle. 140–360ms, standard/`ease-out` curves. Buttons nudge up 1px
and darken ~6% on hover; switches/toggles slide. No bounces, no infinite decorative loops.

**Hover / press.** Hover = slight lift + brightness 0.94 (filled) or soft tint (ghost/soft).
Active/press = settle back to baseline. Focus = 3px azure focus ring, 2px offset (always visible).

**Transparency & blur.** Sparing. Sticky site header uses a translucent cream + `blur(10px)`.
Otherwise surfaces are opaque for legibility.

**Imagery vibe.** Warm, human, real (member + family photos when available); never cold stock
clinical imagery. (No photo assets supplied yet — placeholders / avatars stand in.)

---

## Iconography

- **System:** Lucide-style **stroke** icons — 2.2px stroke weight, round caps/joins, 24px grid.
  Friendly and legible at large sizes for the audience. Bundled inline in `ui_kits/icons.jsx`
  (phone, calendar, pill, heart, shield, users, message, globe, check, arrow, clock, menu).
- **Why a substitute:** the brand guideline does not ship an icon set. Lucide is the chosen
  CDN-available match for the rounded, approachable feel. **Flagged** — swap for the official
  set if/when one is provided. To use the real CDN: `https://unpkg.com/lucide@latest`.
- **Emoji:** essentially not used as icons (see Content Fundamentals).
- **The compass mark** (orange 4-point needle in a green ring) is the brand's signature glyph —
  prefer the real logo asset over redrawing it. Logo files live in `assets/`.

---

## Index / Manifest

**Root**
- `styles.css` — global entry (import this). `@import`s everything below.
- `readme.md` — this file. `SKILL.md` — Agent-Skill front-matter wrapper.

**Tokens** (`tokens/`)
- `colors.css`, `typography.css`, `spacing.css` (spacing + radius + shadow + motion), `base.css`
  (element defaults + `.eyebrow` helper), `fonts.css` (Be Vietnam Pro via Google Fonts `@import`).

**Assets** (`assets/`)
- `logo-horizontal-primary.png`, `logo-horizontal-white.png`, `logo-icon-fullcolor.png`, `logo-icon-light.png`.

**Components** (`components/`)
- `core/` — `Button`, `IconButton`, `Badge`, `Avatar`, `Card`
- `forms/` — `Input`, `Switch`
- `feedback/` — `Alert`
- Each has `.jsx` + `.d.ts` + `.prompt.md`; one `*.card.html` per group powers the Design System tab.

**Foundation cards** (`guidelines/cards/`) — Colors, Type, Spacing, Brand specimen cards.

**UI kits** (`ui_kits/`)
- `website/` — bilingual marketing landing page.
- `portal/` — member care portal (login → dashboard).
- `icons.jsx` — shared stroke-icon set.

**Namespace:** components are exposed at `window.CompassAgeWellDesignSystem_ce0e6d.<Name>`.

---

## Caveats
- UI kits & icon set are brand-derived (no product code/Figma/deck supplied).
- Lucide icons are a documented substitute for an unshipped official set.
- The "crossing line" care-pathway pattern is described in the guideline but no asset was provided.
- Type is now **Be Vietnam Pro** (Google Fonts) — chosen for its strong Vietnamese diacritics. The guideline's original Creato Display OTFs remain in `uploads/` if you'd rather self-host that face.
