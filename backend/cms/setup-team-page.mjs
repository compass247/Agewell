/* ============================================================
   One-shot setup for the "Đội ngũ y tế / Medical Team" page in Directus.

   Does everything via the Directus REST API — no Studio clicking, no Docker:
     1. Create the `pages` + `pages_translations` content model (collection,
        fields, translations relation) and grant Public read.
     2. Seed a published page with slug="team" (bilingual sample content from
        src/content-data.js — BD edits it afterwards in the Studio).
     3. Create a Directus Flow webhook so editing the page revalidates the live
        site within seconds (publish = live), like the existing posts flow.

   Idempotent: safe to re-run. It only creates what's missing and never
   overwrites the team page once it has content.

   Usage (production):
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_TOKEN=<admin-static-token> \
     REVALIDATE_SECRET=<secret> \
       node backend/cms/setup-team-page.mjs

   Or log in with email/password instead of a token:
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_EMAIL=admin@compassagewell.com \
     DIRECTUS_PASSWORD=<password> \
     REVALIDATE_SECRET=<secret> \
       node backend/cms/setup-team-page.mjs

   - REVALIDATE_SECRET is the shared secret the webhook sends to the Next.js
     /api/revalidate route. Get it from AWS Secrets Manager (infra/cms-secrets.tf)
     or copy it from the existing "posts" flow. If omitted, step 3 is skipped
     (re-run later with the secret to add the webhook — step 3 is idempotent).
   - SITE_URL (optional, default https://compassagewell.com) is the webhook target.
   ============================================================ */
import { AGEWELL_CONTENT } from "../../src/content-data.js";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");
const SITE_URL = (process.env.SITE_URL || "https://compassagewell.com").replace(/\/$/, "");
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";
const SLUG = "team";

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
  // GET on a missing collection/field returns 403 (not 404) in Directus 11;
  // treat 400/403/404 as non-fatal "does not exist / already exists" so the
  // ensure* helpers stay idempotent. Surface the body for inspection.
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
    console.error(
      "Missing credentials. Provide DIRECTUS_TOKEN, or DIRECTUS_EMAIL + DIRECTUS_PASSWORD."
    );
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

// Drop a collection if it exists (used by RESET to recover from a half-created
// schema). Directus deletes its fields/relations with it. Only ever called for
// pages/pages_translations, and only when RESET=1 is set explicitly.
async function dropCollection(name) {
  const exists = await api(`/collections/${name}`);
  if (exists.status !== 200) return;
  const r = await api(`/collections/${name}`, "DELETE");
  if (r.status >= 400 && r.status !== 404) {
    throw new Error(`drop ${name} → ${r.status}: ${JSON.stringify(r.body)}`);
  }
  console.log(`- ${name} (dropped)`);
}

// ---- Step 1: content model -------------------------------------------------
async function setupSchema() {
  console.log("\n[1/3] Content model: pages + pages_translations");

  // RESET=1 wipes the (empty) pages collections first — use it to recover from
  // a half-applied schema, e.g. a prior run that created pages with the wrong
  // id type. Safe only before real content exists. Drop the translations child
  // first (it has the FK to pages).
  if (process.env.RESET === "1") {
    console.log("RESET=1 → dropping existing pages collections first");
    await dropCollection("pages_translations");
    await dropCollection("pages");
  }

  // Define the UUID primary key INSIDE the collection payload so Directus
  // creates pages.id as uuid from the start. (Creating the collection without
  // a PK field makes Directus auto-generate an integer id, which then can't
  // form a foreign key with the uuid pages_id — the relation step fails.)
  await ensureCollection({
    collection: "pages",
    schema: { name: "pages" },
    // No sort_field: we don't create a `sort` column, and declaring one makes
    // Public reads fail with "no permission to access field sort".
    meta: { icon: "description", archive_field: "status", archive_value: "archived" },
    fields: [
      {
        field: "id", type: "uuid",
        schema: { is_primary_key: true, has_auto_increment: false },
        meta: { hidden: true, readonly: true, special: ["uuid"] },
      },
    ],
  });
  await ensureField("pages", {
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
  await ensureField("pages", {
    field: "slug", type: "string",
    schema: { is_nullable: false, is_unique: true },
    meta: { interface: "input", width: "half", options: { slug: true },
      note: "URL slug (the /[lang]/<slug> path), e.g. team." },
  });
  await ensureField("pages", {
    field: "cover_image", type: "uuid",
    meta: { interface: "file-image", special: ["file"] },
  });
  await ensureField("pages", {
    field: "translations", type: "alias",
    meta: { interface: "translations", special: ["translations"], options: { languageField: "code" } },
  });

  await ensureCollection({
    collection: "pages_translations",
    schema: { name: "pages_translations" },
    meta: { icon: "translate", hidden: true },
  });
  await ensureField("pages_translations", {
    field: "id", type: "integer",
    schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true },
  });
  await ensureField("pages_translations", { field: "pages_id", type: "uuid", meta: { hidden: true } });
  await ensureField("pages_translations", { field: "languages_code", type: "string", meta: { hidden: true } });
  await ensureField("pages_translations", { field: "title", type: "string", meta: { interface: "input" } });
  await ensureField("pages_translations", {
    field: "body", type: "text",
    meta: { interface: "input-rich-text-html", note: "Page body (WYSIWYG)." },
  });
  await ensureField("pages_translations", { field: "meta_title", type: "string", meta: { interface: "input" } });
  await ensureField("pages_translations", {
    field: "meta_description", type: "text", meta: { interface: "input-multiline" },
  });

  // Relations (only if missing).
  const rel = await api(`/relations/pages_translations/pages_id`);
  if (rel.status !== 200) {
    await api(`/relations`, "POST", {
      collection: "pages_translations", field: "pages_id", related_collection: "pages",
      meta: { one_field: "translations", junction_field: "languages_code", sort_field: null },
      schema: { on_delete: "CASCADE" },
    });
    await api(`/relations`, "POST", {
      collection: "pages_translations", field: "languages_code", related_collection: "languages",
      meta: { junction_field: "pages_id" }, schema: { on_delete: "SET NULL" },
    });
    console.log("+ translations relation (pages)");
  } else {
    console.log("= translations relation (exists)");
  }

  // cover_image needs an M2O relation to directus_files, otherwise the Studio
  // shows an image picker but Save silently drops the value (the field can't
  // store the file's foreign key). special:["file"] alone is NOT enough.
  await ensureFileRelation("pages", "cover_image");

  await grantPublicRead();
}

// Ensure a file/image field has its relation to directus_files (idempotent).
async function ensureFileRelation(collection, field) {
  const rel = await api(`/relations/${collection}/${field}`);
  if (rel.status === 200) { console.log(`= ${collection}.${field} -> directus_files (exists)`); return; }
  const r = await api(`/relations`, "POST", {
    collection, field, related_collection: "directus_files",
  });
  if (r.status >= 400) {
    console.log(`! Failed to relate ${collection}.${field} to directus_files (${r.status}).`);
  } else {
    console.log(`+ ${collection}.${field} -> directus_files`);
  }
}

// Grant the Public policy read access to pages + pages_translations so the
// frontend getPage() can fetch published content unauthenticated (matches how
// posts/homepage are read).
async function grantPublicRead() {
  // Find the built-in Public policy. On Directus 11 the `role` field on
  // directus_policies can be non-readable, so detect it by its hallmark
  // instead: name "$t:public_label" with admin_access=false & app_access=false.
  const policies = await api(`/policies?fields=id,name,admin_access,app_access&limit=-1`);
  const list = policies.body?.data || [];
  const pub =
    list.find((p) => p.name === "$t:public_label") ||
    list.find((p) => p.admin_access === false && p.app_access === false);
  if (!pub) {
    console.log("! Could not auto-detect the Public policy. Grant read on pages + " +
      "pages_translations manually: Studio → Settings → Access Policies → Public.");
    return;
  }
  // The frontend reads these collections unauthenticated (getPage / getPosts /
  // getHomepage + nested translations + file assets for cover images).
  const collections = [
    "pages", "pages_translations", "languages", "directus_files",
  ];
  for (const collection of collections) {
    const existing = await api(
      `/permissions?filter[policy][_eq]=${pub.id}&filter[collection][_eq]=${collection}` +
      `&filter[action][_eq]=read&limit=1`
    );
    if (existing.body?.data?.length) { console.log(`= Public read on ${collection} (exists)`); continue; }
    const r = await api(`/permissions`, "POST", {
      policy: pub.id, collection, action: "read", fields: ["*"], permissions: {}, validation: {},
    });
    if (r.status >= 400) {
      console.log(`! Failed to grant Public read on ${collection} (${r.status}). Do it manually in the Studio.`);
    } else {
      console.log(`+ Public read on ${collection}`);
    }
  }
}

// ---- Step 2: seed the team page -------------------------------------------
// Build a simple, meaningful HTML body from the existing team data so the page
// is non-empty immediately. BD replaces this in the Studio.
function teamBodyHtml(langKey) {
  const u = AGEWELL_CONTENT[langKey].usp;
  const intro = u.teamTitle ? `<p>${u.teamTitle}</p>` : "";
  const cards = (u.team || []).map((m) =>
    `<h3>${m.title}</h3>\n<p><strong>${m.role}.</strong> ${m.text}</p>`
  ).join("\n");
  return `${intro}\n${cards}`;
}

async function seedTeamPage() {
  console.log("\n[2/3] Seed page: slug=team");
  const existing = await api(`/items/pages?filter[slug][_eq]=${SLUG}&limit=1`);
  if (existing.body?.data?.length) {
    console.log("= page 'team' already exists — leaving its content untouched");
    return;
  }
  const titles = { vi: "Đội ngũ y tế", en: "Medical Team" };
  const metaDesc = {
    vi: "Gặp gỡ đội ngũ bác sĩ, dược sĩ và điều phối viên nói tiếng Việt chăm sóc bạn.",
    en: "Meet the Vietnamese-speaking doctors, pharmacists and coordinators caring for you.",
  };
  const translations = [
    { languages_code: "vi-VN", title: titles.vi, body: teamBodyHtml("vi"),
      meta_title: titles.vi, meta_description: metaDesc.vi },
    { languages_code: "en-US", title: titles.en, body: teamBodyHtml("en"),
      meta_title: titles.en, meta_description: metaDesc.en },
  ];
  const r = await api(`/items/pages`, "POST", { status: "published", slug: SLUG, translations });
  if (r.status >= 400) throw new Error(`create team page → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log("+ page 'team' (published, vi + en sample content)");
}

// ---- Step 3: revalidate webhook flow --------------------------------------
async function setupFlow() {
  console.log("\n[3/3] Revalidate webhook flow for 'pages'");
  if (!REVALIDATE_SECRET) {
    console.log("! REVALIDATE_SECRET not set — skipping webhook. Re-run with it set to add 'publish = live'.");
    return;
  }
  const name = "Revalidate pages";
  const found = await api(`/flows?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`);
  if (found.body?.data?.length) { console.log("= flow 'Revalidate pages' (exists)"); return; }

  const flow = await api(`/flows`, "POST", {
    name, icon: "bolt", status: "active", trigger: "event", accountability: "all",
    options: {
      type: "action", scope: ["items.create", "items.update", "items.delete"], collections: ["pages"],
    },
  });
  if (flow.status >= 400) throw new Error(`create flow → ${flow.status}: ${JSON.stringify(flow.body)}`);
  const flowId = flow.body.data.id;

  const op = await api(`/operations`, "POST", {
    flow: flowId, key: "revalidate", name: "Revalidate", type: "request", position_x: 19, position_y: 1,
    options: {
      url: `${SITE_URL}/api/revalidate?secret=${encodeURIComponent(REVALIDATE_SECRET)}`,
      method: "POST",
      headers: [{ header: "Content-Type", value: "application/json" }],
      body: '{ "collection": "pages", "slugs": ["{{$trigger.payload.slug}}"] }',
    },
  });
  if (op.status >= 400) throw new Error(`create operation → ${op.status}: ${JSON.stringify(op.body)}`);

  // Wire the operation as the flow's first step.
  await api(`/flows/${flowId}`, "PATCH", { operation: op.body.data.id });
  console.log("+ flow 'Revalidate pages' → POST /api/revalidate on pages changes");
}

async function main() {
  console.log(`Setup team page → ${DIRECTUS_URL}`);
  await login();
  await setupSchema();
  await seedTeamPage();
  await setupFlow();
  console.log("\n✓ Done. Open https://compassagewell.com/vi/team and /en/team.");
  console.log("  Edit content in Studio → Content → Pages → team.");
}

main().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
