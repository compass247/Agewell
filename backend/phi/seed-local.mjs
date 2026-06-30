/* ============================================================
   Seed the LOCAL PHI database with staff users + synthetic patients.

   ⚠️ LOCAL DEV ONLY. Synthetic data exclusively. Refuses to run against a
   non-local DATABASE_URL_PHI.

   Usage:  npm run phi:db:seed
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { hash as argonHash } from "@node-rs/argon2";
import * as schema from "../../src/lib/phi/schema.js";
import { encryptField } from "../../src/lib/phi/crypto.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

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
    /* optional */
  }
}
loadEnvLocal();

const url = process.env.DATABASE_URL_PHI;
if (!url) {
  console.error("Missing DATABASE_URL_PHI.");
  process.exit(1);
}
if (!/@(localhost|127\.0\.0\.1):/.test(url)) {
  console.error(`Refusing: DATABASE_URL_PHI is not local (${url}).`);
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const db = drizzle(sql, { schema });
const { users, patients } = schema;

// argon2id params (OWASP-ish defaults).
const argonOpts = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

async function upsertUser({ email, password, role }) {
  const passwordHash = await argonHash(password, argonOpts);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, role, isActive: true })
      .where(eq(users.id, existing.id));
    console.log(`= user ${email} (${role}) updated`);
    return existing.id;
  }
  const [row] = await db
    .insert(users)
    .values({ email, passwordHash, role })
    .returning({ id: users.id });
  console.log(`+ user ${email} (${role}) created`);
  return row.id;
}

async function main() {
  console.log(`Seeding LOCAL PHI db → ${url}\n`);

  const adminId = await upsertUser({
    email: "admin@compassagewell.com",
    password: "AdminLocal123!",
    role: "ADMIN",
  });
  const bdId = await upsertUser({
    email: "bd@compassagewell.com",
    password: "BdLocal123!",
    role: "BD",
  });
  const csId = await upsertUser({
    email: "cs@compassagewell.com",
    password: "CsLocal123!",
    role: "CS",
  });

  // Synthetic patients (fake data only).
  const samples = [
    {
      patientExternalId: "PF-100001",
      firstName: "Lan",
      lastName: "Nguyen",
      dob: "03/14/1948",
      primaryPhone: "714-555-0101",
      email: "lan.fake@example.com",
      address1: "123 Bolsa Ave",
      address2: "Apt 4",
      city: "Westminster",
      state: "CA",
      zip: "92683",
      medicareMbi: "1EG4TE5MK73",
      insurancePlan: "Medicare Original",
      insuranceMemberId: "M-0001",
      emergencyName: "Minh Nguyen",
      emergencyRelationship: "Son",
      emergencyPhone: "714-555-0102",
      referralSource: "Community event - Asian Garden Mall",
      preferredLanguage: "VIETNAMESE",
      gender: "FEMALE",
      notes: "Prefers Vietnamese. Interested in CCM.",
      status: "NEW",
      createdBy: bdId,
    },
    {
      patientExternalId: "PF-100002",
      firstName: "Robert",
      lastName: "Tran",
      dob: "11/02/1951",
      primaryPhone: "714-555-0201",
      email: "robert.fake@example.com",
      address1: "456 Brookhurst St",
      city: "Anaheim",
      state: "CA",
      zip: "92804",
      medicareMbi: "2FH5UF6NL84",
      insurancePlan: "Medicare Original",
      insuranceMemberId: "M-0002",
      emergencyName: "Anna Tran",
      emergencyRelationship: "Daughter",
      emergencyPhone: "714-555-0202",
      referralSource: "BD rep: bd@compassagewell.com",
      preferredLanguage: "ENGLISH",
      gender: "MALE",
      notes: "Follow up re: MTM eligibility.",
      status: "REVIEWED_BY_CS",
      assignedCsId: csId,
      createdBy: bdId,
    },
  ];

  for (const s of samples) {
    const { dob, medicareMbi, ...rest } = s;
    await db.insert(patients).values({
      ...rest,
      dobEnc: encryptField(dob),
      medicareMbiEnc: encryptField(medicareMbi),
    });
    console.log(`+ patient ${s.firstName} ${s.lastName} (${s.status})`);
  }

  console.log("\n✓ Seed complete. Logins:");
  console.log("  admin@compassagewell.com / AdminLocal123!  (ADMIN)");
  console.log("  bd@compassagewell.com    / BdLocal123!     (BD)");
  console.log("  cs@compassagewell.com    / CsLocal123!     (CS)");
  void adminId;
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(() => sql.end({ timeout: 5 }));
