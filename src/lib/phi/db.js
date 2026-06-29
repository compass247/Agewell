/* ============================================================
   PHI database client — Drizzle over postgres-js.

   Node runtime ONLY. The edge runtime lacks Node's net/tls and must never hold
   a PHI connection, so we hard-guard against it. Import this only from server
   actions, RSC data fetches, route handlers, and scripts — never from
   middleware or "use client" code.
   ============================================================ */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

// Guard: refuse to load in the edge runtime.
if (process.env.NEXT_RUNTIME === "edge") {
  throw new Error("src/lib/phi/db.js must not be imported in the edge runtime.");
}

const url = process.env.DATABASE_URL_PHI;
if (!url) {
  throw new Error(
    "DATABASE_URL_PHI is not set. Add it to .env.local (see backend/phi/README.md)."
  );
}

// Reuse a single connection pool across hot reloads in dev.
const globalForPhi = globalThis;
const client =
  globalForPhi.__phiSql ||
  postgres(url, {
    max: 10,
    prepare: true,
    // Never log query parameters — they can contain PHI.
    onnotice: () => {},
  });
if (process.env.NODE_ENV !== "production") {
  globalForPhi.__phiSql = client;
}

export const db = drizzle(client, { schema });
export { schema };
