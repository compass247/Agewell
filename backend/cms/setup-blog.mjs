/* ============================================================
   One-shot setup for the Blog (posts) in Directus.

   Mirrors setup-team-page.mjs. Does everything via the REST API — no Studio
   clicking, no Docker:
     1. Create the `posts` + `posts_translations` content model (collection,
        fields, translations relation) and grant Public read.
     2. Seed one published sample post (bilingual) so /[lang]/blog shows content
        immediately — delete or edit it in the Studio afterwards.
     3. Create a Directus Flow webhook so editing posts revalidates the live
        site within seconds (publish = live).

   Idempotent: re-runnable. Never overwrites an existing post with the sample
   slug once it has content.

   Usage (production):
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_TOKEN=<admin-static-token> \      # or DIRECTUS_EMAIL + DIRECTUS_PASSWORD
     REVALIDATE_SECRET=<secret> \
       node backend/cms/setup-blog.mjs

   - REVALIDATE_SECRET: from AWS Secrets Manager (infra/cms-secrets.tf) or copy
     from another flow. Omit to skip step 3 (re-run later to add the webhook).
   - SITE_URL (optional, default https://compassagewell.com) is the webhook target.
   - RESET=1 drops the (empty) posts collections first — recovery only, never
     when real posts exist.
   ============================================================ */
const DIRECTUS_URL = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");
const SITE_URL = (process.env.SITE_URL || "https://compassagewell.com").replace(/\/$/, "");
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";
const SAMPLE_SLUG = "chao-mung";

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

async function dropCollection(name) {
  const exists = await api(`/collections/${name}`);
  if (exists.status !== 200) return;
  const r = await api(`/collections/${name}`, "DELETE");
  if (r.status >= 400 && r.status !== 404) throw new Error(`drop ${name} → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log(`- ${name} (dropped)`);
}

// ---- Step 1: content model -------------------------------------------------
async function setupSchema() {
  console.log("\n[1/3] Content model: posts + posts_translations");

  if (process.env.RESET === "1") {
    console.log("RESET=1 → dropping existing posts collections first");
    await dropCollection("posts_translations");
    await dropCollection("posts");
  }

  // UUID PK defined inside the payload so posts.id is uuid from the start
  // (matches pages_id below — an integer PK would break the foreign key).
  // No sort_field in meta: declaring a `sort` column we don't create makes
  // anonymous Public reads fail.
  await ensureCollection({
    collection: "posts",
    schema: { name: "posts" },
    meta: { icon: "article", archive_field: "status", archive_value: "archived" },
    fields: [
      {
        field: "id", type: "uuid",
        schema: { is_primary_key: true, has_auto_increment: false },
        meta: { hidden: true, readonly: true, special: ["uuid"] },
      },
    ],
  });
  await ensureField("posts", {
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
  await ensureField("posts", {
    field: "slug", type: "string",
    schema: { is_nullable: false, is_unique: true },
    meta: { interface: "input", width: "half", options: { slug: true },
      note: "URL slug (the /[lang]/blog/<slug> path), shared across languages." },
  });
  await ensureField("posts", {
    field: "cover_image", type: "uuid",
    meta: { interface: "file-image", special: ["file"] },
  });
  await ensureField("posts", {
    field: "published_at", type: "timestamp",
    meta: { interface: "datetime", width: "half" },
  });
  await ensureField("posts", {
    field: "translations", type: "alias",
    meta: { interface: "translations", special: ["translations"], options: { languageField: "code" } },
  });

  await ensureCollection({
    collection: "posts_translations",
    schema: { name: "posts_translations" },
    meta: { icon: "translate", hidden: true },
  });
  await ensureField("posts_translations", {
    field: "id", type: "integer",
    schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true },
  });
  await ensureField("posts_translations", { field: "posts_id", type: "uuid", meta: { hidden: true } });
  await ensureField("posts_translations", { field: "languages_code", type: "string", meta: { hidden: true } });
  await ensureField("posts_translations", { field: "title", type: "string", meta: { interface: "input" } });
  await ensureField("posts_translations", {
    field: "excerpt", type: "text", meta: { interface: "input-multiline" },
  });
  await ensureField("posts_translations", {
    field: "body", type: "text",
    meta: { interface: "input-rich-text-html", note: "Article body (WYSIWYG)." },
  });
  await ensureField("posts_translations", { field: "meta_title", type: "string", meta: { interface: "input" } });
  await ensureField("posts_translations", {
    field: "meta_description", type: "text", meta: { interface: "input-multiline" },
  });

  const rel = await api(`/relations/posts_translations/posts_id`);
  if (rel.status !== 200) {
    await api(`/relations`, "POST", {
      collection: "posts_translations", field: "posts_id", related_collection: "posts",
      meta: { one_field: "translations", junction_field: "languages_code", sort_field: null },
      schema: { on_delete: "CASCADE" },
    });
    await api(`/relations`, "POST", {
      collection: "posts_translations", field: "languages_code", related_collection: "languages",
      meta: { junction_field: "posts_id" }, schema: { on_delete: "SET NULL" },
    });
    console.log("+ translations relation (posts)");
  } else {
    console.log("= translations relation (exists)");
  }

  await grantPublicRead();
}

// Grant Public read so getPosts()/getPost() can fetch published content
// unauthenticated. Detect the Public policy by its hallmark name (the role
// field on directus_policies is non-readable on Directus 11).
async function grantPublicRead() {
  const policies = await api(`/policies?fields=id,name,admin_access,app_access&limit=-1`);
  const list = policies.body?.data || [];
  const pub =
    list.find((p) => p.name === "$t:public_label") ||
    list.find((p) => p.admin_access === false && p.app_access === false);
  if (!pub) {
    console.log("! Could not auto-detect the Public policy. Grant read on posts + " +
      "posts_translations manually: Studio → Settings → Access Policies → Public.");
    return;
  }
  // languages + directus_files may already be granted by setup-team-page.mjs;
  // the existence check below keeps this idempotent.
  for (const collection of ["posts", "posts_translations", "languages", "directus_files"]) {
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

// ---- Step 2: seed a sample post -------------------------------------------
async function seedSamplePost() {
  console.log(`\n[2/3] Seed sample post: slug=${SAMPLE_SLUG}`);
  const existing = await api(`/items/posts?filter[slug][_eq]=${SAMPLE_SLUG}&limit=1`);
  if (existing.body?.data?.length) {
    console.log(`= post '${SAMPLE_SLUG}' already exists — leaving it untouched`);
    return;
  }
  const translations = [
    {
      languages_code: "vi-VN",
      title: "Chào mừng đến với Blog Compass AgeWell",
      excerpt: "Bài viết mẫu — hãy thay bằng nội dung thật trong Directus.",
      body: "<p>Đây là bài viết mẫu để bạn thấy Blog hoạt động. " +
        "Vào Directus → Content → Posts để sửa hoặc xoá bài này và đăng bài của bạn.</p>",
      meta_title: "Chào mừng đến với Blog Compass AgeWell",
      meta_description: "Bài viết mẫu của Compass AgeWell.",
    },
    {
      languages_code: "en-US",
      title: "Welcome to the Compass AgeWell Blog",
      excerpt: "Sample post — replace it with real content in Directus.",
      body: "<p>This is a sample post so you can see the blog working. " +
        "Go to Directus → Content → Posts to edit or delete it and publish your own.</p>",
      meta_title: "Welcome to the Compass AgeWell Blog",
      meta_description: "A sample Compass AgeWell post.",
    },
  ];
  // published_at: omitted (null) — the blog sorts by it but tolerates null.
  const r = await api(`/items/posts`, "POST", {
    status: "published", slug: SAMPLE_SLUG, translations,
  });
  if (r.status >= 400) throw new Error(`create sample post → ${r.status}: ${JSON.stringify(r.body)}`);
  console.log(`+ post '${SAMPLE_SLUG}' (published, vi + en)`);
}

// ---- Step 3: revalidate webhook flow --------------------------------------
async function setupFlow() {
  console.log("\n[3/3] Revalidate webhook flow for 'posts'");
  if (!REVALIDATE_SECRET) {
    console.log("! REVALIDATE_SECRET not set — skipping webhook. Re-run with it set to add 'publish = live'.");
    return;
  }
  const name = "Revalidate posts";
  const found = await api(`/flows?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`);
  if (found.body?.data?.length) { console.log("= flow 'Revalidate posts' (exists)"); return; }

  const flow = await api(`/flows`, "POST", {
    name, icon: "bolt", status: "active", trigger: "event", accountability: "all",
    options: { type: "action", scope: ["items.create", "items.update", "items.delete"], collections: ["posts"] },
  });
  if (flow.status >= 400) throw new Error(`create flow → ${flow.status}: ${JSON.stringify(flow.body)}`);
  const flowId = flow.body.data.id;

  const op = await api(`/operations`, "POST", {
    flow: flowId, key: "revalidate", name: "Revalidate", type: "request", position_x: 19, position_y: 1,
    options: {
      url: `${SITE_URL}/api/revalidate?secret=${encodeURIComponent(REVALIDATE_SECRET)}`,
      method: "POST",
      headers: [{ header: "Content-Type", value: "application/json" }],
      body: '{ "collection": "posts", "slugs": ["{{$trigger.payload.slug}}"] }',
    },
  });
  if (op.status >= 400) throw new Error(`create operation → ${op.status}: ${JSON.stringify(op.body)}`);

  await api(`/flows/${flowId}`, "PATCH", { operation: op.body.data.id });
  console.log("+ flow 'Revalidate posts' → POST /api/revalidate on posts changes");
}

async function main() {
  console.log(`Setup blog → ${DIRECTUS_URL}`);
  await login();
  await setupSchema();
  await seedSamplePost();
  await setupFlow();
  console.log("\n✓ Done. Open https://compassagewell.com/vi/blog and /en/blog.");
  console.log("  Edit posts in Studio → Content → Posts.");
}

main().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
