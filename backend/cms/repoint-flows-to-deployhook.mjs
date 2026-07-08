/* ============================================================
   Repoint Directus publish Flows → Cloudflare Pages Deploy Hook.

   The marketing site is now a STATIC build on Cloudflare Pages, so the old
   "publish = live" mechanism (a Directus Flow POSTing to the Next server's
   /api/revalidate to invalidate cache tags) no longer applies — there is no
   Next server. Instead, any content change should trigger a Pages REBUILD via
   a Deploy Hook, which re-reads the CMS at build time (~1–2 min → live).

   This script finds every Flow whose webhook operation points at
   `.../api/revalidate` and repoints it at the Deploy Hook URL (a plain POST,
   no secret, no body needed). A single Deploy Hook rebuilds the whole site, so
   all collections (posts, pages, homepage, team_members) can share it.

   Idempotent: re-running with the same hook is a no-op.

   Usage:
     DIRECTUS_URL=https://cms.compassagewell.com \
     DIRECTUS_TOKEN=<admin static token>   (or DIRECTUS_EMAIL + DIRECTUS_PASSWORD) \
     DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxxxx \
     node backend/cms/repoint-flows-to-deployhook.mjs
   ============================================================ */
const DIRECTUS_URL = (process.env.DIRECTUS_URL || "https://cms.compassagewell.com").replace(/\/$/, "");
const DEPLOY_HOOK_URL = process.env.DEPLOY_HOOK_URL || "";
const TOKEN = process.env.DIRECTUS_TOKEN || "";
const EMAIL = process.env.DIRECTUS_EMAIL || "";
const PASSWORD = process.env.DIRECTUS_PASSWORD || "";

let accessToken = TOKEN;

async function api(path, method = "GET", body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body (e.g. 204) is fine */
  }
  return { status: res.status, body: json };
}

async function login() {
  if (accessToken) return; // static token provided
  if (!EMAIL || !PASSWORD) {
    throw new Error("Provide DIRECTUS_TOKEN, or DIRECTUS_EMAIL + DIRECTUS_PASSWORD.");
  }
  const res = await api("/auth/login", "POST", { email: EMAIL, password: PASSWORD });
  if (res.status >= 400) throw new Error(`login → ${res.status}: ${JSON.stringify(res.body)}`);
  accessToken = res.body.data.access_token;
}

// A webhook operation we should repoint: type "request" whose URL hits
// /api/revalidate (the old server-side endpoint) OR an older deploy hook.
function isRevalidateOp(op) {
  if (op?.type !== "request") return false;
  const url = op?.options?.url || "";
  return url.includes("/api/revalidate");
}

// Every content collection whose edits should rebuild the static site, with the
// event scope that makes sense for it. homepage is a Directus singleton (only
// updated), so items.update alone; the rest can be created/deleted too.
const WANT_FLOWS = [
  { name: "Revalidate homepage", collection: "homepage", scope: ["items.update"] },
  { name: "Revalidate posts", collection: "posts", scope: ["items.create", "items.update", "items.delete"] },
  { name: "Revalidate pages", collection: "pages", scope: ["items.create", "items.update", "items.delete"] },
  { name: "Revalidate team_members", collection: "team_members", scope: ["items.create", "items.update", "items.delete"] },
];

// Create a Flow whose single webhook operation POSTs the deploy hook.
async function createDeployFlow({ name, collection, scope }) {
  const flow = await api("/flows", "POST", {
    name,
    icon: "bolt",
    status: "active",
    trigger: "event",
    accountability: "all",
    options: { type: "action", scope, collections: [collection] },
  });
  if (flow.status >= 400) throw new Error(`create flow '${name}' → ${flow.status}: ${JSON.stringify(flow.body)}`);
  const flowId = flow.body.data.id;

  const op = await api("/operations", "POST", {
    flow: flowId,
    key: "deploy",
    name: "Deploy",
    type: "request",
    position_x: 19,
    position_y: 1,
    options: { url: DEPLOY_HOOK_URL, method: "POST", headers: [], body: "" },
  });
  if (op.status >= 400) throw new Error(`create op for '${name}' → ${op.status}: ${JSON.stringify(op.body)}`);

  await api(`/flows/${flowId}`, "PATCH", { operation: op.body.data.id });
  console.log(`+ created '${name}' → deploy hook (${collection}, ${scope.join("/")})`);
}

async function main() {
  if (!DEPLOY_HOOK_URL) throw new Error("DEPLOY_HOOK_URL is required.");
  if (!/^https:\/\/api\.cloudflare\.com\/.+\/deploy_hooks\/.+/.test(DEPLOY_HOOK_URL)) {
    console.log("! DEPLOY_HOOK_URL doesn't look like a Cloudflare Pages deploy hook — continuing anyway.");
  }
  console.log(`Repoint Directus Flows → Deploy Hook  (${DIRECTUS_URL})`);
  await login();

  // Pull every flow + its operations so we can find revalidate webhooks.
  const flows = await api("/flows?fields=id,name,status,options,operations.id,operations.type,operations.options&limit=-1");
  if (flows.status >= 400) throw new Error(`list flows → ${flows.status}: ${JSON.stringify(flows.body)}`);

  const list = flows.body?.data || [];
  let changed = 0;
  let alreadyOk = 0;

  for (const flow of list) {
    const op = (flow.operations || []).find(isRevalidateOp);
    if (!op) continue;

    const current = op.options?.url || "";
    if (current === DEPLOY_HOOK_URL) {
      console.log(`= '${flow.name}' already points at the deploy hook`);
      alreadyOk++;
      continue;
    }

    // Repoint: plain POST to the deploy hook, drop the JSON body/secret.
    const newOptions = { ...op.options, url: DEPLOY_HOOK_URL, method: "POST", headers: [], body: "" };
    const r = await api(`/operations/${op.id}`, "PATCH", { options: newOptions });
    if (r.status >= 400) {
      console.log(`! '${flow.name}': failed to repoint (${r.status}: ${JSON.stringify(r.body)})`);
    } else {
      console.log(`~ '${flow.name}': webhook → Cloudflare Pages deploy hook`);
      changed++;
    }
  }

  // Ensure a Flow exists for every content collection (create the missing ones,
  // e.g. homepage). Match by the collection the Flow triggers on, not its name.
  const covered = new Set();
  for (const flow of list) {
    for (const c of flow.options?.collections || []) covered.add(c);
  }
  let created = 0;
  for (const want of WANT_FLOWS) {
    if (covered.has(want.collection)) continue;
    await createDeployFlow(want);
    created++;
  }

  console.log(`\n✓ Done. Repointed ${changed}, already-ok ${alreadyOk}, created ${created}.`);
  console.log("  Test: edit any published item in Directus → a new Pages build should start within seconds.");
}

main().catch((e) => {
  console.error("\nFAILED:", e.message);
  process.exit(1);
});
