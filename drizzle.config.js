/* ============================================================
   drizzle-kit config — PHI portal schema.

   The Drizzle schema (src/lib/phi/schema.js) is the SINGLE SOURCE OF TRUTH.
   `npm run phi:db:generate` compiles it to versioned SQL in ./drizzle, which is
   committed and applied identically by `npm run phi:db:migrate` locally and
   (in a future phase) in production — same files, never drift.
   ============================================================ */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/phi/schema.js",
  out: "./drizzle",
  dbCredentials: {
    // Local PHI Postgres (see backend/phi/docker-compose.phi.yml).
    url: process.env.DATABASE_URL_PHI || "postgres://phi:phi@localhost:5433/phi",
  },
  // Surface every generated statement so schema changes are reviewable in PRs.
  verbose: true,
  strict: true,
});
