/* ============================================================
   Seed the Directus `homepage` singleton from src/content-data.js.

   One-time migration: copies the approved bilingual homepage copy into the
   CMS so BD can edit it in the Studio. After this, the Next.js frontend reads
   homepage content from Directus and overlays it on content-data.js (which
   stays as the safe fallback).

   Usage:
     DIRECTUS_URL=http://localhost:8055 \
     DIRECTUS_TOKEN=<admin-static-token> \
     node backend/cms/seed-homepage.mjs

   Get a static token: Studio → your user → "Token" field → generate → save.
   ============================================================ */
import { AGEWELL_CONTENT } from "../../src/content-data.js";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_TOKEN;

if (!TOKEN) {
  console.error(
    "Missing DIRECTUS_TOKEN. Generate a static token in the Studio (your user " +
      "profile → Token) and pass it as an env var."
  );
  process.exit(1);
}

// Map our content-data.js language keys to Directus locale codes.
const LANG_TO_CODE = { vi: "vi-VN", en: "en-US" };

async function directus(path, init = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus ${init.method || "GET"} ${path} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/**
 * Build the translation row for one language. We store the whole structured
 * homepage content (hero, problem, services, …) as JSON-friendly fields so BD
 * edits each card/step in the Studio. The frontend reads these back and
 * overlays them onto content-data.js.
 */
function buildTranslation(langKey) {
  const c = AGEWELL_CONTENT[langKey];
  return {
    languages_code: LANG_TO_CODE[langKey],
    // Stored as JSON columns in homepage_translations. Field names mirror the
    // content-data.js top-level keys so the overlay merge is a 1:1 mapping.
    hero: c.hero,
    problem: c.problem,
    services: c.services,
    loop: c.loop,
    usp: c.usp,
    elig: c.elig,
    testi: c.testi,
    form: c.form,
    footer: c.footer,
    nav: c.nav,
    header_cta: c.headerCta,
    hotline: c.hotline,
    contact_bar: c.contactBar,
  };
}

async function main() {
  console.log(`Seeding homepage → ${DIRECTUS_URL}`);

  const translations = Object.keys(LANG_TO_CODE).map(buildTranslation);

  // homepage is a singleton: PATCH /items/homepage upserts the single row and
  // its translations. Requires the homepage + homepage_translations collections
  // (and the translations relation) to exist — create them via schema.yaml/Studio first.
  await directus("/items/homepage", {
    method: "PATCH",
    body: JSON.stringify({ translations }),
  });

  console.log("✓ Homepage seeded for:", Object.values(LANG_TO_CODE).join(", "));
  console.log("Edit it now in the Studio → Content → Homepage.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  console.error(
    "\nChecklist: collections homepage + homepage_translations exist, the " +
      "translations relation is wired, and DIRECTUS_TOKEN belongs to an admin."
  );
  process.exit(1);
});
