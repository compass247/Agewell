/* ============================================================
   One-shot setup for structured Team Members in Directus.

   The /[lang]/team page used to dump a single free-text `body` field → it
   looked messy. This sets up a proper `team_members` collection so BD fills
   structured fields (photo, role, name, bio) per person and the site renders
   the same nice card grid as the homepage.

   Like the other setup scripts: everything via REST API, idempotent, no Studio
   clicking. Does:
     1. Create team_members + team_members_translations (collection, fields,
        photo→directus_files relation, translations relation) + Public read.
     2. Seed 3 sample members (bilingual role/name/bio from content-data.js;
        photos left empty for BD to upload). Never overwritten on re-run.
     3. Create a "Revalidate team_members" Flow webhook (publish = live).

   Usage (production):
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_TOKEN=<admin-static-token> \      # or DIRECTUS_EMAIL + DIRECTUS_PASSWORD
     REVALIDATE_SECRET=<secret> \
       node backend/cms/setup-team-members.mjs

   RESET=1 drops the (empty) collections first — recovery only.
   ============================================================ */
import { AGEWELL_CONTENT } from "../../src/content-data.js";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");
const SITE_URL = (process.env.SITE_URL || "https://compassagewell.com").replace(/\/$/, "");
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

let TOKEN = process.env.DIRECTUS_TOKEN || "";

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
  if (!res.ok && ![400, 403, 404].includes(res.status)) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

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

async function ensureCollection(payload) {
  const exists = await api(`/collections/${payload.collection}`);
  if (exists.status === 200) { console.log(`= ${payload.collection} (exists)`); return; }
  const r = await api(`/collections`, "POST", payload);
  if (r.status >= 400) throw new Error(`create ${payload.collection} → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log(`+ ${payload.collection}`);
}

async function ensureField(collection, field) {
  const exists = await api(`/fields/${collection}/${field.field}`);
  if (exists.status === 200) return;
  const r = await api(`/fields/${collection}`, "POST", field);
  if (r.status >= 400) throw new Error(`create field ${collection}.${field.field} → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log(`+ ${collection}.${field.field}`);
}

async function ensureFileRelation(collection, field) {
  const rel = await api(`/relations/${collection}/${field}`);
  if (rel.status === 200) { console.log(`= ${collection}.${field} -> directus_files (exists)`); return; }
  const r = await api(`/relations`, "POST", { collection, field, related_collection: "directus_files" });
  if (r.status >= 400) console.log(`! Failed to relate ${collection}.${field} to directus_files (${r.status}).`);
  else console.log(`+ ${collection}.${field} -> directus_files`);
}

async function dropCollection(name) {
  const exists = await api(`/collections/${name}`);
  if (exists.status !== 200) return;
  const r = await api(`/collections/${name}`, "DELETE");
  if (r.status >= 400 && r.status !== 404) throw new Error(`drop ${name} → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log(`- ${name} (dropped)`);
}

// ---- Step 1: content model -------------------------------------------------
async function setupSchema() {
  console.log("\n[1/3] Content model: team_members + team_members_translations");

  if (process.env.RESET === "1") {
    console.log("RESET=1 → dropping existing team_members collections first");
    await dropCollection("team_members_translations");
    await dropCollection("team_members");
  }

  await ensureCollection({
    collection: "team_members",
    schema: { name: "team_members" },
    // sort_field=sort is fine here because we DO create a real `sort` column below.
    meta: { icon: "groups", archive_field: "status", archive_value: "archived", sort_field: "sort" },
    fields: [
      {
        field: "id", type: "uuid",
        schema: { is_primary_key: true, has_auto_increment: false },
        meta: { hidden: true, readonly: true, special: ["uuid"] },
      },
    ],
  });
  await ensureField("team_members", {
    field: "status", type: "string",
    schema: { default_value: "draft", is_nullable: false },
    meta: {
      interface: "select-dropdown", display: "labels", width: "half",
      options: { choices: [
        { text: "Published", value: "published" },
        { text: "Draft", value: "draft" },
        { text: "Archived", value: "archived" },
      ] },
    },
  });
  await ensureField("team_members", {
    field: "sort", type: "integer",
    meta: { interface: "input", hidden: true, note: "Display order (drag to reorder in the list)." },
  });
  await ensureField("team_members", {
    field: "photo", type: "uuid",
    meta: { interface: "file-image", special: ["file"], note: "Member photo." },
  });
  await ensureField("team_members", {
    field: "translations", type: "alias",
    meta: { interface: "translations", special: ["translations"], options: { languageField: "code" } },
  });

  await ensureCollection({
    collection: "team_members_translations",
    schema: { name: "team_members_translations" },
    meta: { icon: "translate", hidden: true },
  });
  await ensureField("team_members_translations", {
    field: "id", type: "integer",
    schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true },
  });
  await ensureField("team_members_translations", { field: "team_members_id", type: "uuid", meta: { hidden: true } });
  await ensureField("team_members_translations", { field: "languages_code", type: "string", meta: { hidden: true } });
  await ensureField("team_members_translations", {
    field: "role", type: "string",
    meta: { interface: "input", note: "Vai trò, e.g. Bác sĩ / Doctor." },
  });
  await ensureField("team_members_translations", {
    field: "name", type: "string",
    meta: { interface: "input", note: "Tên/chức danh, e.g. Bác sĩ nói tiếng Việt." },
  });
  await ensureField("team_members_translations", {
    field: "bio", type: "text",
    meta: { interface: "input-multiline", note: "Mô tả ngắn." },
  });

  const rel = await api(`/relations/team_members_translations/team_members_id`);
  if (rel.status !== 200) {
    await api(`/relations`, "POST", {
      collection: "team_members_translations", field: "team_members_id", related_collection: "team_members",
      meta: { one_field: "translations", junction_field: "languages_code", sort_field: null },
      schema: { on_delete: "CASCADE" },
    });
    await api(`/relations`, "POST", {
      collection: "team_members_translations", field: "languages_code", related_collection: "languages",
      meta: { junction_field: "team_members_id" }, schema: { on_delete: "SET NULL" },
    });
    console.log("+ translations relation (team_members)");
  } else {
    console.log("= translations relation (exists)");
  }

  await ensureFileRelation("team_members", "photo");
  await grantPublicRead();
}

async function grantPublicRead() {
  const policies = await api(`/policies?fields=id,name,admin_access,app_access&limit=-1`);
  const list = policies.body?.data || [];
  const pub =
    list.find((p) => p.name === "$t:public_label") ||
    list.find((p) => p.admin_access === false && p.app_access === false);
  if (!pub) {
    console.log("! Could not auto-detect the Public policy. Grant read on team_members + " +
      "team_members_translations manually: Studio → Settings → Access Policies → Public.");
    return;
  }
  for (const collection of ["team_members", "team_members_translations", "languages", "directus_files"]) {
    const existing = await api(
      `/permissions?filter[policy][_eq]=${pub.id}&filter[collection][_eq]=${collection}` +
      `&filter[action][_eq]=read&limit=1`
    );
    if (existing.body?.data?.length) { console.log(`= Public read on ${collection} (exists)`); continue; }
    const r = await api(`/permissions`, "POST", {
      policy: pub.id, collection, action: "read", fields: ["*"], permissions: {}, validation: {},
    });
    if (r.status >= 400) console.log(`! Failed to grant Public read on ${collection} (${r.status}).`);
    else console.log(`+ Public read on ${collection}`);
  }
}

// ---- Step 2: seed sample members ------------------------------------------
async function seedMembers() {
  console.log("\n[2/3] Seed sample team members");
  const existing = await api(`/items/team_members?limit=1`);
  if (existing.body?.data?.length) {
    console.log("= team_members already has rows — leaving them untouched");
    return;
  }
  const vi = AGEWELL_CONTENT.vi.usp.team || [];
  const en = AGEWELL_CONTENT.en.usp.team || [];
  for (let i = 0; i < vi.length; i++) {
    const v = vi[i];
    const e = en[i] || v;
    const r = await api(`/items/team_members`, "POST", {
      status: "published",
      sort: i + 1,
      // photo intentionally empty — BD uploads each member's photo in the Studio.
      translations: [
        { languages_code: "vi-VN", role: v.role, name: v.title, bio: v.text },
        { languages_code: "en-US", role: e.role, name: e.title, bio: e.text },
      ],
    });
    if (r.status >= 400) throw new Error(`create member ${i} → ${r.status}: ${JSON.stringify(r.body)}`);
    console.log(`+ member: ${v.role}`);
  }
}

// ---- Step 3: revalidate webhook flow --------------------------------------
async function setupFlow() {
  console.log("\n[3/3] Revalidate webhook flow for 'team_members'");
  if (!REVALIDATE_SECRET) {
    console.log("! REVALIDATE_SECRET not set — skipping webhook. Re-run with it set to add 'publish = live'.");
    return;
  }
  const name = "Revalidate team_members";
  const wantUrl = `${SITE_URL}/api/revalidate?secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
  const found = await api(`/flows?filter[name][_eq]=${encodeURIComponent(name)}&fields=id,operations.id,operations.type,operations.options&limit=1`);
  if (found.body?.data?.length) {
    await reconcileWebhookUrl(found.body.data[0], wantUrl, name);
    return;
  }

  const flow = await api(`/flows`, "POST", {
    name, icon: "bolt", status: "active", trigger: "event", accountability: "all",
    options: { type: "action", scope: ["items.create", "items.update", "items.delete"], collections: ["team_members"] },
  });
  if (flow.status >= 400) throw new Error(`create flow → ${flow.status}: ${JSON.stringify(flow.body)}`);
  const flowId = flow.body.data.id;

  const op = await api(`/operations`, "POST", {
    flow: flowId, key: "revalidate", name: "Revalidate", type: "request", position_x: 19, position_y: 1,
    options: {
      url: wantUrl,
      method: "POST",
      headers: [{ header: "Content-Type", value: "application/json" }],
      body: '{ "collection": "team_members" }',
    },
  });
  if (op.status >= 400) throw new Error(`create operation → ${op.status}: ${JSON.stringify(op.body)}`);

  await api(`/flows/${flowId}`, "PATCH", { operation: op.body.data.id });
  console.log("+ flow 'Revalidate team_members' → POST /api/revalidate on changes");
}

// If a flow already exists, make sure its webhook URL matches wantUrl (e.g. so a
// flow created with the prod URL gets repointed at localhost when re-seeding
// locally). Idempotent: no-op when already correct.
async function reconcileWebhookUrl(flow, wantUrl, name) {
  const op = (flow.operations || []).find((o) => o.type === "request");
  const current = op?.options?.url || "";
  if (!op) { console.log(`= flow '${name}' (exists, no webhook op)`); return; }
  if (current === wantUrl) { console.log(`= flow '${name}' (exists, url ok)`); return; }
  const r = await api(`/operations/${op.id}`, "PATCH", { options: { ...op.options, url: wantUrl } });
  if (r.status >= 400) console.log(`! flow '${name}': failed to update url (${r.status})`);
  else console.log(`~ flow '${name}': webhook url → ${wantUrl}`);
}

async function main() {
  console.log(`Setup team members → ${DIRECTUS_URL}`);
  await login();
  await setupSchema();
  await seedMembers();
  await setupFlow();
  console.log("\n✓ Done. Open https://compassagewell.com/vi/team and /en/team.");
  console.log("  Edit members in Studio → Content → Team Members (upload photos there).");
}

main().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
