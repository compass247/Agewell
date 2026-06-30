/* ============================================================
   Apply Drizzle migrations to the local PHI Postgres.

   Reads the committed SQL in ./drizzle (generated from
   src/lib/phi/schema.js via `npm run phi:db:generate`) and applies any
   not-yet-applied migrations. Used by `npm run phi:db:migrate` locally and,
   in a future phase, by the production deploy step — SAME files, never drift.

   Usage:
     DATABASE_URL_PHI=postgres://phi:phi@localhost:5433/phi \
       node backend/phi/migrate.mjs
   (DATABASE_URL_PHI is also read from repo-root .env.local if present.)
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

// Minimal .env.local loader (no dotenv dep): only fills vars not already set.
function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(repoRoot, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* .env.local is optional */
  }
}

loadEnvLocal();

const url = process.env.DATABASE_URL_PHI;
if (!url) {
  console.error(
    "Missing DATABASE_URL_PHI. Set it in repo-root .env.local or the environment.\n" +
      "Example: postgres://phi:phi@localhost:5433/phi"
  );
  process.exit(1);
}

const migrationsFolder = resolve(repoRoot, "drizzle");

const sql = postgres(url, { max: 1 });
const db = drizzle(sql);

try {
  console.log(`Applying PHI migrations from ${migrationsFolder} …`);
  await migrate(db, { migrationsFolder });
  console.log("✓ PHI database is up to date.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
