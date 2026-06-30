/* ============================================================
   PHI database client — Drizzle over postgres-js.

   Node runtime ONLY. The edge runtime lacks Node's net/tls and must never hold
   a PHI connection, so we hard-guard against it. Import this only from server
   actions, RSC data fetches, route handlers, and scripts — never from
   middleware or "use client" code.

   The connection is created LAZILY on first use, NOT at import time. `next build`
   imports route modules to collect metadata with no DATABASE_URL_PHI present;
   throwing at import time would break the build. We only require the env when a
   query actually runs (at request time, where the secret is injected).
   ============================================================ */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

// Guard: refuse to load in the edge runtime.
if (process.env.NEXT_RUNTIME === "edge") {
  throw new Error("src/lib/phi/db.js must not be imported in the edge runtime.");
}

const globalForPhi = globalThis;

function createDb() {
  const url = process.env.DATABASE_URL_PHI;
  if (!url) {
    throw new Error(
      "DATABASE_URL_PHI is not set. Add it to .env.local (see backend/phi/README.md)."
    );
  }
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
  return drizzle(client, { schema });
}

// Lazy singleton: the real drizzle instance is built on first property access,
// so importing this module never needs a live DB / the env var.
let _db = null;
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!_db) _db = createDb();
      const value = _db[prop];
      return typeof value === "function" ? value.bind(_db) : value;
    },
  }
);

export { schema };
