import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/* ============================================================
   On-demand revalidation endpoint — "publish = live, no rebuild".

   A Directus Flow on the `posts` / `homepage` collections (create/
   update/delete) fires a Webhook to this route with a shared secret.
   We invalidate the matching cache tags so the next request
   regenerates the affected pages within seconds.

   Auth: the Directus Flow must send `?secret=<REVALIDATE_SECRET>`
   (or an `x-revalidate-secret` header). The secret is the value
   stored in Secrets Manager (cms-secrets.tf) / backend/cms/.env.

   Body (optional, from the Flow payload): { collection, keys: [...] }
   so we can target a specific post by slug. Falls back to broad tags.
   ============================================================ */
const SECRET = process.env.REVALIDATE_SECRET || "";

// Constant-time comparison (hash both sides to equalize lengths first) — a
// plain !== leaks match-prefix length through timing.
function secretMatches(provided) {
  if (!SECRET || !provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(SECRET).digest();
  return timingSafeEqual(a, b);
}

// NOTE: in production the marketing site is a static Cloudflare Pages export —
// publishes rebuild via the Pages Deploy Hook, not this route (it is stashed
// out of the static build). This endpoint only serves the standalone/local
// `next dev` workflow (docs/LOCAL-DEV.md).
export async function POST(request) {
  const url = new URL(request.url);
  const provided =
    url.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret") ||
    "";

  if (!secretMatches(provided)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    // no/invalid body is fine — we fall back to broad revalidation
  }

  const collection = payload?.collection || url.searchParams.get("collection");
  const tags = new Set();

  if (collection === "homepage") {
    tags.add("homepage");
  } else if (collection === "team_members") {
    tags.add("team_members");
  } else if (collection === "pages") {
    tags.add("pages");
    // If the Flow sent specific slugs, target them precisely too.
    const slugs = payload?.slugs || payload?.keys || [];
    for (const s of slugs) tags.add(`page:${s}`);
  } else if (collection === "posts" || !collection) {
    tags.add("posts");
    // If the Flow sent specific slugs, target them precisely too.
    const slugs = payload?.slugs || payload?.keys || [];
    for (const s of slugs) tags.add(`post:${s}`);
  }

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ ok: true, revalidated: [...tags] });
}
