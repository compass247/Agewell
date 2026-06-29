# PHI Patient Intake Portal — local dev

A HIPAA-oriented internal portal for BD/CS staff to enter and review patient
intake records. PHI is stored in a **dedicated, isolated Postgres** — never in
Directus, DynamoDB, or SES.

> ⚠️ **LOCAL DEV ONLY — synthetic data exclusively.**
> Never load real patient data onto a developer machine. The local encryption
> key is dev-grade (a static env value, not a KMS-managed key). Production
> hardening (AWS BAA, customer-managed KMS, CloudTrail, network isolation,
> 6-year retention) is a **separate, later phase** and is NOT in place here.

## Architecture

- **Portal routes:** `/portal/*` in the Next.js app (route group `app/(portal)/`),
  English-only, outside the next-intl marketing site. Gated by Auth.js.
- **Database:** self-hosted Postgres 16 (`agewell-phi-db`, host port **5433**,
  named volume `phi-db-data`), separate from the CMS Postgres.
- **ORM:** Drizzle. The schema in `src/lib/phi/schema.js` is the single source of
  truth; `phi:db:generate` compiles it to committed SQL in `drizzle/`.
- **Auth:** Auth.js v5 Credentials (email + password, argon2id) + **mandatory
  TOTP MFA**. 15-minute idle timeout. Roles: Admin, BD, CS.
- **Audit:** every mutation writes an immutable `audit_log` row in the same DB
  transaction. Sensitive fields (Medicare MBI, DOB, MFA secret) are encrypted at
  the app layer (AES-256-GCM) on top of disk encryption.

## First-time setup

```bash
# 1. Configure secrets
cp backend/phi/.env.example backend/phi/.env
#    Edit backend/phi/.env, then ALSO copy the app-facing vars
#    (DATABASE_URL_PHI, AUTH_SECRET, AUTH_URL, PHI_ENC_KEY,
#     PHI_SESSION_IDLE_MINUTES) into the repo-root .env.local.
#    Generate secrets with:  openssl rand -base64 32

# 2. Install deps (from repo root)
npm install

# 3. Start the PHI Postgres
npm run phi:db:up        # docker ps -> agewell-phi-db healthy on :5433

# 4. Create the schema (first time generates SQL, then applies it)
npm run phi:db:generate  # compiles src/lib/phi/schema.js -> drizzle/*.sql
npm run phi:db:migrate   # applies migrations

# 5. Seed staff users + synthetic patients
npm run phi:db:seed      # admin@/bd@/cs@ + sample records

# 6. Run the app
npm run dev              # open http://localhost:3000/portal
```

## Scripts

| Script | What it does |
|---|---|
| `npm run phi:db:up` | Start the PHI Postgres container (keeps data) |
| `npm run phi:db:down` | Stop it (data preserved) |
| `npm run phi:db:reset` | `down -v` — **wipes** the volume (dev reset only) |
| `npm run phi:db:generate` | Compile schema → versioned SQL in `drizzle/` |
| `npm run phi:db:migrate` | Apply migrations to the DB |
| `npm run phi:db:seed` | Seed staff users + synthetic patients |
| `npm run phi:db:studio` | Drizzle Studio (browse the DB locally) |

## Local PHI caveats (read before running)

- **Synthetic data only.** Do not enter or import real patient information.
- **Dev-grade key.** `PHI_ENC_KEY` in `.env.local` is a static local value, not a
  KMS-backed key. App-layer encryption here protects against casual disk/query
  exposure, not a determined attacker on the host.
- **Disk encryption.** Rely on your OS full-disk encryption (FileVault/BitLocker).
- **Never commit** `backend/phi/.env`, the repo-root `.env.local`, or the DB
  volume. `.gitignore` already excludes the env files.

## NOT in this phase (deferred to production)

AWS deploy / RDS / Terraform for PHI · signed AWS BAA · customer-managed KMS +
envelope encryption + key rotation · CloudTrail / immutable audit log shipping ·
WAF / VPC isolation · automated backup-restore + 6-year retention · breach
alerting. See the assessment in the plan file for the production roadmap.
