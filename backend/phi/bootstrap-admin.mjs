/* ============================================================
   Bootstrap the FIRST admin user in the PHI database (production).

   One-off: creates an ADMIN user with an argon2id password hash if no user with
   that email exists. Idempotent — safe to re-run (skips if present). Reads:
     DATABASE_URL_PHI   (from Secrets Manager, injected by ECS)
     BOOTSTRAP_EMAIL    (the admin email)
     BOOTSTRAP_PASSWORD (the temporary password)

   Run as a one-off ECS task on the PORTAL image (it has @node-rs/argon2):
     command override: ["node","backend/phi/bootstrap-admin.mjs"]
   The admin enrolls MFA + changes the password on first login.
   ============================================================ */
import postgres from "postgres";
import { hash as argonHash } from "@node-rs/argon2";

const url = process.env.DATABASE_URL_PHI;
const email = (process.env.BOOTSTRAP_EMAIL || "").toLowerCase();
const password = process.env.BOOTSTRAP_PASSWORD || "";

if (!url || !email || !password) {
  console.error("Missing DATABASE_URL_PHI / BOOTSTRAP_EMAIL / BOOTSTRAP_PASSWORD.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  const existing = await sql`select id from users where email = ${email} limit 1`;
  if (existing.length) {
    console.log(`User ${email} already exists — nothing to do.`);
    process.exit(0);
  }
  const passwordHash = await argonHash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  await sql`
    insert into users (email, password_hash, role, is_active)
    values (${email}, ${passwordHash}, 'ADMIN', true)
  `;
  console.log(`✓ Created ADMIN user ${email}. Enroll MFA + change password on first login.`);
} catch (err) {
  console.error("Bootstrap failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
