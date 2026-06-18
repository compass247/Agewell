/* ============================================================
   Bootstrap the Directus content model via the API.
   Creates languages + homepage(singleton) + homepage_translations
   + the translations relation, enough to verify the Next.js overlay
   end-to-end. (posts/pages/leads follow the same pattern.)

   Usage:
     DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=<token> \
       node backend/cms/bootstrap-schema.mjs
   ============================================================ */
const URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_TOKEN;
if (!TOKEN) { console.error("Missing DIRECTUS_TOKEN"); process.exit(1); }

async function api(path, method = "GET", body) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  // GET on a missing collection/field returns 403 (not 404) in Directus 11;
  // treat 400/403/404 as non-fatal "does not exist / already exists" for our
  // idempotent ensure* helpers, and surface the body for inspection.
  if (!res.ok && ![400, 403, 404].includes(res.status)) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return { status: res.status, body: text ? JSON.parse(text) : null };
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
  await api(`/fields/${collection}`, "POST", field);
}

async function main() {
  // languages
  await ensureCollection({
    collection: "languages",
    schema: { name: "languages" },
    meta: { icon: "translate" },
    fields: [
      { field: "code", type: "string", meta: { interface: "input" }, schema: { is_primary_key: true } },
      { field: "name", type: "string", meta: { interface: "input" } },
    ],
  });
  for (const l of [{ code: "vi-VN", name: "Tiếng Việt" }, { code: "en-US", name: "English" }]) {
    await api(`/items/languages`, "POST", l); // 400 if exists → ignored
  }

  // homepage singleton
  await ensureCollection({
    collection: "homepage",
    schema: { name: "homepage" },
    meta: { icon: "home", singleton: true },
    fields: [{ field: "id", type: "integer", schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } }],
  });

  // homepage_translations
  await ensureCollection({
    collection: "homepage_translations",
    schema: { name: "homepage_translations" },
    meta: { icon: "translate", hidden: true },
    fields: [
      { field: "id", type: "integer", schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } },
    ],
  });
  // JSON content fields mirroring content-data.js keys.
  for (const f of ["hero", "problem", "services", "loop", "usp", "elig", "testi", "form", "footer", "nav", "hotline", "contact_bar"]) {
    await ensureField("homepage_translations", { field: f, type: "json", meta: { interface: "input-code" } });
  }
  await ensureField("homepage_translations", { field: "header_cta", type: "string", meta: { interface: "input" } });
  await ensureField("homepage_translations", { field: "homepage_id", type: "integer", meta: { hidden: true } });
  await ensureField("homepage_translations", { field: "languages_code", type: "string", meta: { hidden: true } });

  // translations alias field on homepage + relation
  await ensureField("homepage", {
    field: "translations", type: "alias",
    meta: { interface: "translations", special: ["translations"], options: { languageField: "code" } },
  });
  // relation: homepage_translations.homepage_id -> homepage, junction languages_code -> languages
  const rel = await api(`/relations/homepage_translations/homepage_id`);
  if (rel.status !== 200) {
    await api(`/relations`, "POST", {
      collection: "homepage_translations", field: "homepage_id", related_collection: "homepage",
      meta: { one_field: "translations", junction_field: "languages_code" }, schema: { on_delete: "CASCADE" },
    });
    await api(`/relations`, "POST", {
      collection: "homepage_translations", field: "languages_code", related_collection: "languages",
      meta: { junction_field: "homepage_id" }, schema: { on_delete: "SET NULL" },
    });
    console.log("+ translations relation");
  }

  // Public read on homepage + translations + languages (so the frontend reads w/o token).
  const pubRole = await api(`/policies?filter[name][_eq]=$t:public_label&limit=1`);
  console.log("\nSchema bootstrap done. Grant Public read on homepage/* in the Studio (Access Policies).");
  void pubRole;
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
