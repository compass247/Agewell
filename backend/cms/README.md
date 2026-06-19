# Compass AgeWell CMS (Directus) — local spike

This is **Phase 0** of the CMS migration: stand up Directus + Postgres locally so
the BD team can try the editor before we provision anything on AWS. The same
images and env documented here are the reference for the production ECS/EC2 task
definitions, so local and prod don't drift.

See the full plan: the approved plan file under `~/.claude/plans/`.

## Prerequisites

- Docker Desktop running
- (optional) Node 20+ for the seed script

## Quick start

```bash
# 1. Configure secrets (copy the template, then edit values)
cp backend/cms/.env.example backend/cms/.env

# 2. Start Directus + Postgres
docker compose -f backend/cms/docker-compose.cms.yml --env-file backend/cms/.env up -d

# 3. Open the admin
#    http://localhost:8055
#    login with ADMIN_EMAIL / ADMIN_PASSWORD from your .env
```

Stop / reset:

```bash
docker compose -f backend/cms/docker-compose.cms.yml down       # stop, keep data
docker compose -f backend/cms/docker-compose.cms.yml down -v     # stop + WIPE data
```

## Set the admin UI to Vietnamese (for BD)

Directus ships a `vi-VN` locale. After first login:

1. Click the user avatar (bottom-left) → **User Settings**.
2. Set **Language** = *Tiếng Việt*.
3. For BD accounts, create a **"BD Editor"** role (Settings → Access Control) with
   edit access to `posts` / `homepage` / `pages` and read-only on `leads`, no
   access to Settings/schema. Set each BD user's language to Vietnamese.

## Content model

The model is specified in [`schema.yaml`](./schema.yaml):

| Collection | Purpose |
|---|---|
| `languages` | Locale list — seed `vi-VN` (default) and `en-US`. |
| `posts` + `posts_translations` | Blog articles, translated per language. |
| `homepage` (singleton) + `homepage_translations` | Homepage copy — mirrors `src/content-data.js`. |
| `pages` + `pages_translations` | Other dynamic pages (services, team, FAQ). |
| `leads` (read-only) | Mirror of DynamoDB leads for the BD dashboard (populated by sync; do not edit). |

### Creating the collections

`schema.yaml` is a **documented spec**. For the first build, create the
collections in the Studio UI using it as the reference (it mirrors the field
names and the `posts → posts_translations → languages` translations wiring).

Once created, generate the **canonical machine snapshot** so future
environments apply identically:

```bash
docker compose -f backend/cms/docker-compose.cms.yml exec directus \
  npx directus schema snapshot --yes /directus/snapshot.yaml
docker compose -f backend/cms/docker-compose.cms.yml cp \
  directus:/directus/snapshot.yaml backend/cms/snapshot.yaml
```

Apply it to a fresh instance with:

```bash
docker compose -f backend/cms/docker-compose.cms.yml exec directus \
  npx directus schema apply --yes /directus/snapshot.yaml
```

## Seeding homepage content from `content-data.js`

Once the `homepage` collection + translations exist, seed it from the current
approved copy:

```bash
node backend/cms/seed-homepage.mjs   # see the script header for env vars
```

This is one-time. After it runs, the homepage is editable in the Studio; the
Next.js frontend overlays Directus content on top of `src/content-data.js` so
the site never breaks if the CMS is unreachable.

## Medical Team page (`pages` / slug=team)

The `/[lang]/team` route reads a `pages` item with `slug=team`. Set up the
whole thing — content model, the seeded page, and the revalidate webhook — with
one idempotent script (no Studio clicking required):

```bash
DIRECTUS_URL=https://cms.compassagewell.com \
DIRECTUS_TOKEN=<admin-static-token> \      # or DIRECTUS_EMAIL + DIRECTUS_PASSWORD
REVALIDATE_SECRET=<secret> \               # from AWS Secrets Manager; omit to skip the webhook
  node backend/cms/setup-team-page.mjs
```

It creates `pages` + `pages_translations` (mirroring `posts`), grants Public
read, seeds a published `team` page with bilingual sample copy, and adds a
"Revalidate pages" Flow. Re-runnable; it never overwrites the team page once it
has content. Full step-by-step (VI): [`docs/TEAM-PAGE.md`](../../docs/TEAM-PAGE.md).

## Blog (`posts`) setup

Same one-shot approach for the blog. Creates `posts` + `posts_translations`,
grants Public read, seeds one sample post, and adds a "Revalidate posts" flow:

```bash
DIRECTUS_URL=https://cms.compassagewell.com \
DIRECTUS_TOKEN=<admin-static-token> \      # or DIRECTUS_EMAIL + DIRECTUS_PASSWORD
REVALIDATE_SECRET=<secret> \
  node backend/cms/setup-blog.mjs
```

Idempotent; `RESET=1` drops the (empty) posts collections to recover from a
half-applied run. After it runs, manage articles in Studio → Content → Posts.

## Publish = live (no rebuild)

In production, a Directus **Flow** on `posts` (create/update/delete) fires a
webhook to the Next.js `/api/revalidate` route (HMAC-signed with
`REVALIDATE_SECRET`), which calls `revalidateTag`. The published page is live in
seconds — no GitHub Actions rebuild.

Configure the Flow (Settings → Flows → Create):
1. Trigger: **Event Hook**, scope `items.create` + `items.update` +
   `items.delete` on `posts` (and `homepage`).
2. Operation: **Webhook**, `POST https://compassagewell.com/api/revalidate?secret=<REVALIDATE_SECRET>`,
   body `{ "collection": "{{$trigger.collection}}", "slugs": ["{{$trigger.payload.slug}}"] }`.

## Lead dashboard (service token)

The `lead-sync` Lambda mirrors DynamoDB leads into the `leads` collection so BD
can view + export them. It authenticates with a **static token** for a
dedicated service user:

1. Studio → Settings → Access Control → create role **"Lead Sync"** with
   create/update/read on `leads` only.
2. Create a user in that role, open it, generate a **static token**, save.
3. Provide it to Terraform as `TF_VAR_directus_sync_token` (stored in the
   Lambda env). Until set, the sync Lambda no-ops safely.

The lead WRITE path (form → Lambda → DynamoDB → SES) is unchanged; this sync is
one-way and additive. DynamoDB stays the source of truth; PII never leaves AWS.
