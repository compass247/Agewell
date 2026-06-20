/* ============================================================
   Sync the Directus `homepage` singleton content between instances.

   Why this exists: the homepage uses an OVERLAY model — the Next.js frontend
   reads `src/content-data.js` as the base and overlays the Directus `homepage`
   singleton on top (see src/content.js). Production Directus is the live source
   of truth for the copy. Editing content-data.js alone only changes the
   fallback; to change production you must update Directus.

   Unlike seed-homepage.mjs (which PATCHes EVERY section from content-data.js and
   would clobber edits BD made directly in the Studio), this script:
     - pull : downloads the current homepage from an instance to a JSON backup
     - push : PATCHes ONLY a chosen set of sections (default: the BD-edit batch),
              from content-data.js, leaving every other section (e.g. `hero`,
              which BD edits by hand) untouched.

   Usage:
     # 1) Back up production first (always do this before any push to prod)
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_EMAIL=admin@compassagewell.com DIRECTUS_PASSWORD=<prod-pw> \
       node backend/cms/sync-homepage.mjs pull

     # 2) Push the BD content batch to LOCAL, verify at localhost:3000, then prod
     DIRECTUS_URL=http://localhost:8055 \
     DIRECTUS_EMAIL=admin@compassagewell.com DIRECTUS_PASSWORD=<local-pw> \
       node backend/cms/sync-homepage.mjs push

   Auth: DIRECTUS_TOKEN (static admin token) OR DIRECTUS_EMAIL + DIRECTUS_PASSWORD.

   Options:
     SECTIONS=problem,services,loop,usp,elig,form   # override the push set
     OUTFILE=backend/cms/homepage-prod.json         # override pull destination
   ============================================================ */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { AGEWELL_CONTENT } from "../../src/content-data.js";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");
const LANG_TO_CODE = { vi: "vi-VN", en: "en-US" };

// Sections the BD batch touches. `hero` is intentionally EXCLUDED — BD edits it
// directly in the Studio, so we never overwrite it from code.
const DEFAULT_SECTIONS = ["problem", "services", "loop", "usp", "elig", "form"];
const SECTIONS = (process.env.SECTIONS || DEFAULT_SECTIONS.join(","))
  .split(",").map((s) => s.trim()).filter(Boolean);

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTFILE = process.env.OUTFILE || resolve(__dirname, "homepage-prod.json");

let TOKEN = process.env.DIRECTUS_TOKEN || "";

async function login() {
  if (TOKEN) return;
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;
  if (!email || !password) {
    console.error("Missing credentials. Provide DIRECTUS_TOKEN, or DIRECTUS_EMAIL + DIRECTUS_PASSWORD.");
    process.exit(1);
  }
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`Login failed → ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  TOKEN = (await res.json()).data.access_token;
  console.log("✓ Logged in with email/password");
}

async function api(path, method = "GET", body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function pull() {
  await login();
  console.log(`Pulling homepage ← ${DIRECTUS_URL}`);
  const data = await api("/items/homepage?fields=translations.*");
  writeFileSync(OUTFILE, JSON.stringify(data, null, 2), "utf-8");
  const langs = (data?.data?.translations || []).map((t) => t.languages_code).join(", ");
  console.log(`✓ Saved to ${OUTFILE} (translations: ${langs || "none"})`);
}

async function push() {
  await login();
  console.log(`Pushing homepage → ${DIRECTUS_URL}`);
  console.log(`Sections (from src/content-data.js): ${SECTIONS.join(", ")}`);
  console.log("NOT touched: hero, testi, footer, nav, and any field outside the list above.");

  // Look up the existing translation rows so we can PATCH each one BY ID. A
  // field-level PATCH on /items/homepage_translations/{id} merges only the
  // sections we send — every other section on that row (e.g. hero) is left
  // exactly as-is. (PATCHing the singleton's translations array could be treated
  // as a full M2O set replace, so we avoid it.)
  const existing = await api("/items/homepage?fields=translations.id,translations.languages_code");
  const byCode = {};
  for (const row of existing?.data?.translations || []) byCode[row.languages_code] = row.id;

  for (const [langKey, code] of Object.entries(LANG_TO_CODE)) {
    const id = byCode[code];
    if (!id) { console.log(`! no ${code} row — skipped (run seed-homepage first)`); continue; }
    const c = AGEWELL_CONTENT[langKey];
    const patch = {};
    for (const sec of SECTIONS) patch[sec] = c[sec];
    await api(`/items/homepage_translations/${id}`, "PATCH", patch);
    console.log(`✓ ${code} (row ${id}): patched ${SECTIONS.length} section(s)`);
  }
}

const cmd = process.argv[2];
const run = cmd === "pull" ? pull : cmd === "push" ? push : null;
if (!run) {
  console.error("Usage: node backend/cms/sync-homepage.mjs <pull|push>");
  process.exit(1);
}
run().catch((err) => {
  console.error("\nSync failed:", err.message);
  process.exit(1);
});
