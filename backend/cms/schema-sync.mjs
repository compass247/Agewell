/* ============================================================
   Copy the Directus SCHEMA (structure only — collections, fields, relations,
   NOT content) from one instance to another. Used to mirror the production
   content model onto a fresh LOCAL Directus so you can test changes locally
   before touching prod.

   Two steps, run separately:

   1) Snapshot the source (e.g. production) to a file:
        SRC_URL=https://cms.compassagewell.com \
        SRC_TOKEN=<admin-token> \            # or SRC_EMAIL + SRC_PASSWORD
          node backend/cms/schema-sync.mjs snapshot
      → writes backend/cms/snapshot.json (gitignored).

   2) Apply the snapshot to the target (e.g. local):
        DST_URL=http://localhost:8055 \
        DST_TOKEN=<admin-token> \            # or DST_EMAIL + DST_PASSWORD
          node backend/cms/schema-sync.mjs apply
      → diffs snapshot.json against the target and applies the difference.

   Apply uses Directus's snapshot → diff → apply flow so it is safe + atomic:
   GET /schema/snapshot, POST /schema/diff (returns a hash-stamped diff),
   POST /schema/apply. If the target already matches, the diff is empty (no-op).

   Permissions/content are NOT moved by /schema (that's by design). Seed local
   content separately with the setup-*.mjs scripts pointed at DST_URL.
   ============================================================ */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = join(HERE, "snapshot.json");

const cmd = process.argv[2];

async function getToken(prefix) {
  const token = process.env[`${prefix}_TOKEN`];
  if (token) return token;
  const url = process.env[`${prefix}_URL`];
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    console.error(`Missing ${prefix}_TOKEN, or ${prefix}_EMAIL + ${prefix}_PASSWORD.`);
    process.exit(1);
  }
  const res = await fetch(`${url}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`Login (${prefix}) failed → ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  return (await res.json()).data.access_token;
}

async function call(url, token, path, method = "GET", body) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function snapshot() {
  const url = (process.env.SRC_URL || "https://cms.compassagewell.com").replace(/\/$/, "");
  const token = await getToken("SRC");
  console.log(`Snapshotting schema from ${url} …`);
  const snap = await call(url, token, "/schema/snapshot", "GET");
  await writeFile(SNAPSHOT_PATH, JSON.stringify(snap.data, null, 2));
  console.log(`✓ Wrote ${SNAPSHOT_PATH}`);
  console.log("  (structure only — no content/permissions. Seed content separately.)");
}

async function apply() {
  const url = (process.env.DST_URL || "http://localhost:8055").replace(/\/$/, "");
  const token = await getToken("DST");
  let raw;
  try {
    raw = await readFile(SNAPSHOT_PATH, "utf8");
  } catch {
    console.error(`No ${SNAPSHOT_PATH}. Run "node backend/cms/schema-sync.mjs snapshot" first.`);
    process.exit(1);
  }
  const snap = JSON.parse(raw);
  console.log(`Diffing snapshot against ${url} …`);
  // diff returns null data when the target already matches the snapshot.
  const diff = await call(url, token, "/schema/diff", "POST", snap);
  if (!diff || !diff.data) {
    console.log("✓ Target already matches the snapshot — nothing to apply.");
    return;
  }
  console.log("Applying schema diff …");
  await call(url, token, "/schema/apply", "POST", diff.data);
  console.log("✓ Schema applied. Target structure now matches the snapshot.");
  console.log("  Next: seed content with the setup-*.mjs scripts (DIRECTUS_URL=" + url + ").");
}

async function main() {
  if (cmd === "snapshot") return snapshot();
  if (cmd === "apply") return apply();
  console.error("Usage: node backend/cms/schema-sync.mjs <snapshot|apply>");
  process.exit(1);
}

main().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
