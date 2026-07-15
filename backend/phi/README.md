# PHI Patient Intake Portal — local dev

A HIPAA-oriented internal portal for BD/CS staff to enter and review patient
intake records. PHI is stored in a **dedicated, isolated Postgres** — never in
Directus, DynamoDB, or SES.

> ⚠️ **Synthetic data exclusively — everywhere, including production.**
> Never load real patient data onto a developer machine, and none has been
> loaded into the deployed stack either. The production infra (below) is
> live, but the **Real-PHI go-live gate** at the bottom of this file must be
> cleared before any real patient data enters the system.

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

## Production status (what IS deployed)

The production stack is implemented in `infra/phi-*.tf` and live (synthetic
data only):

- **Isolated VPC** (10.20.0.0/16) — private subnets have NO internet route;
  AWS APIs are reached via VPC endpoints. RDS Postgres 16 (db.t4g.micro,
  single-AZ, encrypted with a customer-managed KMS CMK, 30-day backups,
  deletion-protected).
- **Fargate portal service** + one-off migrate task (`deploy-phi.yml` builds
  images, runs migrations, rolls the service; separate least-privilege OIDC
  role).
- **Secrets Manager** (KMS-encrypted) injects DATABASE_URL_PHI / AUTH_SECRET /
  PHI_ENC_KEY at task start; `PHI_ENC_KEY` is frozen in Terraform
  (prevent_destroy — rotating it would brick all ciphertext).
- **Logging/audit**: KMS-encrypted CloudWatch logs (90-day), VPC flow logs,
  account CloudTrail (`create_cloudtrail`), DB-enforced append-only
  `audit_log` (trigger, `drizzle/0004`).
- **App-layer controls**: login/TOTP throttling (`auth_throttle`), mandatory
  MFA with admin-only reset, RBAC re-checked in every action, CSV
  formula-injection neutralization.
- **Ingress**: ALB today; migrating to Cloudflare Tunnel + Access via the
  blue-green canary (`infra/phi-canary.tf` — see its header runbook).

## Real-PHI go-live gate (clear ALL before real patient data)

1. **AWS BAA** signed (AWS Artifact).
2. **Cloudflare BAA** — requires Enterprise. If not purchased, revert portal
   ingress to the ALB + `portal_allowed_cidrs` office /32s + private subnets
   + interface endpoints (the Terraform history keeps this one revert away).
3. Re-evaluate task placement (public-subnet tunnel egress vs private subnets
   + endpoints/NAT) under the chosen ingress.
4. `phi_multi_az = true` (RDS HA) decision.
5. Dedicated low-privilege `phi_app` DB role — the app currently connects as
   the master user, so the audit_log trigger is a guardrail, not a privilege
   boundary; REVOKE only becomes real with a separate role.
6. KMS envelope encryption + rotation for `PHI_ENC_KEY` (today: static
   secret value — flagged in `src/lib/phi/crypto.js`).
7. BD minimum-necessary decision: BD reps can currently READ all patients
   (record-level scoping exists only for edit). Confirm or narrow.
8. Immutable audit-log shipping (e.g. S3 Object Lock), backup-restore drill,
   breach-alerting runbook.
