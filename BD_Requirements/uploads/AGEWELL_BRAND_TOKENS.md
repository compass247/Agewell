# Compass AgeWell — Brand Design Tokens

> Source: VN Brand Guideline Compass AgeWell (24 pages)
> Created: 2026-05-27 | Updated: 2026-05-27

---

## 01. Brand Identity Overview

- **Brand Name:** Compass AgeWell
- **Tagline:** Live Well. Age Well. Be Cared For.
- **Brand Essence:** Hệ thống chăm sóc sức khỏe quốc gia chuyên biệt cho người Mỹ gốc Việt cao tuổi (65+) đang sử dụng Medicare
- **Tone & Mood:** Như người thân trong gia đình có kiến thức y tế — đáng tin cậy, ấm áp, rõ ràng, tôn trọng. Không lạnh lùng như bệnh viện, không hào nhoáng như startup.
- **Voice:** Song ngữ Anh-Việt, nói chậm rõ ràng, không thuật ngữ kỹ thuật, tôn trọng văn hóa gia đình Việt

---

## 02. Color Tokens

### Primary Palette

| Token Name | Swatch | Hex | RGB | CMYK | Usage |
|---|---|---|---|---|---|
| `agewell-green` | 🟢 | `#26a146` | R28 G161 B70 | C78 M2 Y98 K9 | Primary brand green — logo ring, headers, CTAs |
| `agewell-blue` | 🔵 | `#007bc3` | R0 G123 B195 | C100 M42 Y0 K0 | Tagline, accents, secondary elements |
| `agewell-orange` | 🟠 | `#f47d42` | R244 G125 B66 | C0 M63 Y81 K0 | Compass icon, vitality accents, highlights |

**Named Colors:**
- Restorative Emerald = `#26a146`
- Precision Azure = `#007bc3`
- Active Vitality = `#f47d42`

### Secondary Palette

| Token Name | Swatch | Hex | RGB | CMYK | Usage |
|---|---|---|---|---|---|
| `agewell-cream` | ⚪ | `#f9f8f6` | R249 G248 B246 | C2 M1 Y2 K0 | Backgrounds, light surfaces |
| `agewell-gray` | ◽ | `#c5c4c4` | R197 G196 B196 | C23 M18 Y18 K0 | Subtle borders, secondary text, dividers |

**Named Colors:**
- Molecular Cloud = `#f9f8f6`
- Platinum Pure = `#c5c4c4`

### CSS Variables (ready to use)

```css
:root {
  --agewell-green: #26a146;
  --agewell-blue: #007bc3;
  --agewell-orange: #f47d42;
  --agewell-cream: #f9f8f6;
  --agewell-gray: #c5c4c4;
}
```

---

## 03. Typography Tokens

### Primary Font: Creato Display

A versatile, modern sans-serif with multiple weights.

| Weight | Font Stack | Usage |
|---|---|---|
| ExtraBold (800) | `CreatoDisplay-ExtraBold` | H1 — main headlines |
| Bold (700) | `CreatoDisplay-Bold` | H2 — sub-headlines, navigation |
| Light (300) | `CreatoDisplay-Light` | Body text, paragraphs, small text |

### Type Scale

| Level | Font | Weight | Tracking | Use |
|---|---|---|---|---|
| H1 | Creato Display | ExtraBold (800) | -10 | Page titles, hero headlines |
| H2 | Creato Display | Bold (700) | Default | Section headings, sub-headlines |
| Body | Creato Display | Light (300) | Default | Paragraphs, descriptions |

### CSS Font Declarations

```css
@font-face {
  font-family: 'Creato Display';
  src: url('./fonts/CreatoDisplay-ExtraBold.woff2') format('woff2');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Creato Display';
  src: url('./fonts/CreatoDisplay-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Creato Display';
  src: url('./fonts/CreatoDisplay-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
}
```

---

## 04. Logo Assets Catalog

### Logo Inventory

| # | Asset File | Variant | Colorway | Format | Recommended Use |
|---|---|---|---|---|---|
| 1 | `agewell-icon-fullcolor` | Icon-only (submark) | Full color | PNG | App icon, favicon, social avatar, small badges |
| 2 | `agewell-horizontal-primary` | Horizontal lockup | Full color | PNG | Primary logo — website header, documents, presentations |
| 3 | `agewell-banner` | Banner/header graphic | Full color | PNG | Website hero, cover images, wide-format headers |
| 4 | `agewell-horizontal-large` | Horizontal lockup (large icon) | Full color | PNG | Large-format headers, signage, hero sections |
| 5 | `agewell-horizontal-white` | Horizontal lockup | White/reverse | PNG | Dark backgrounds, colored sections, footer |
| 6 | `agewell-icon-light` | Icon-only (submark) | Light green monochrome | PNG | Watermarks, subtle backgrounds, secondary favicon |

### Logo Files (source)

| Original Filename | Mapped To | Description |
|---|---|---|
| `VN_Compass_Agewell_120---*.png` | Icon-only full-color submark | Green ring + orange compass, no text |
| `VN_Compass_Agewell_Artboard_4-37---*.png` | Horizontal primary logo | Icon left + "COMPASS AGEWELL" + tagline |
| `VN_Compass_Agewell_Artboard_6-36---*.png` | Banner/header graphic | Green swoosh + compass icon, wide format |
| `VN_Compass_Agewell-32---*.png` | Horizontal large icon logo | Larger icon + "COMPASS AGEWELL" + tagline |
| `VN_Compass_Agewell-33---*.png` | Horizontal white/reverse logo | White wordmark + light icon for dark backgrounds |
| `VN_Compass_Agewell-35---*.png` | Icon-only light submark | Light green simplified compass mark |

### Logo Usage Rules

- **Minimum size:** 45px height
- **Clear space:** 3u (3× icon unit) surrounding; 1u minimum in tight layouts
- **Grid system:** Logo built on precise mathematical grid; icon-to-text spacing = 1.5u, text block height = 2u
- **Never:** stretch, rotate, recolor, add effects, place on busy backgrounds
- **Preferred placement:** Top-left or centered

---

## 05. Brand Elements

### Pattern/Motif

Crossing line pattern representing clinical care pathways and data flows — symbolizes Compass's precision in navigating complex medical networks. Available as decorative background element.

### Favicon

Separate favicon variant (simplified compass icon) for browser tabs and bookmarks.

---

## 06. Mission, Vision & Values

- **Mission:** Cung cấp hệ thống chăm sóc sức khỏe phù hợp ngôn ngữ và văn hóa cho người Việt Medicare — ở bất kỳ đâu tại Mỹ
- **Vision:** Trở thành nền tảng quản lý chăm sóc sức khỏe quốc gia đáng tin cậy nhất cho cộng đồng người Việt tại Hoa Kỳ
- **Core Value:** Chăm sóc liên tục — mỗi tháng, mỗi cuộc gọi, mỗi lần review thuốc là một điểm chạm xây dựng sức khỏe bền vững