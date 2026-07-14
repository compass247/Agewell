# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**Compass AgeWell** — bilingual (VI/EN) marketing website + health services for Vietnamese
seniors on Medicare. The stack today:

- **Marketing site** — **Next.js 14 App Router** + **next-intl** (URL-based locales
  `/vi` `/en`). Statically exported and served on **Cloudflare Pages** (the old Vite SPA on
  nginx/ECS Fargate has been retired).
- **CMS** — self-hosted **Directus** (`cms.compassagewell.com`, reached via a **Cloudflare
  Tunnel**). It overlays homepage/blog/team content on top of the static copy; if the CMS
  is down, pages fall back to `src/content-data.js` and never break.
- **PHI intake portal** — Next.js server-rendered app under `app/(portal)`, still on **AWS
  Fargate** (isolated PHI Postgres, Auth.js + TOTP). Not part of the static export.
- **Lead form** — serverless: API Gateway → Lambda → DynamoDB → SES.
- **Infra** — Terraform (`infra/`); **CI/CD** — GitHub Actions; **DNS** — Cloudflare.

## Commands

```bash
npm run dev          # local dev server → http://localhost:3000 (next dev)
npm run build        # standalone Next build (used for the PHI portal Fargate image)
npm run build:static # BUILD_TARGET=static next build → static export to out/ (Cloudflare Pages)
npm run lint         # eslint (must pass, max-warnings 0)
```

There is **no** `dist/`, `npm run preview`, or port 5173 — those were the old Vite setup.

CMS/PHI helpers (see `docs/LOCAL-DEV.md`): `npm run cms:up`/`cms:down` (Directus local on
`:8055`), `npm run db:up`/`db:init`/`backend:dev` (lead form full-stack local),
`npm run phi:db:*` (PHI Postgres).

## Architecture notes

- **Routing** — file-system App Router. Marketing pages live under `app/[lang]/`:
  `page.jsx` (home), `blog/`, `blog/[slug]/`, `team/`, `services/[slug]/`. There is **no
  `src/App.jsx`** — the homepage is `app/[lang]/page.jsx` → `src/components/HomePageClient.jsx`
  (a `"use client"` shell) which composes the sections from `src/sections/sections-a.jsx`
  (Header · Hero · Problem · Services · CareLoop) and `sections-b.jsx` (USP/Team ·
  Eligibility/FAQ · SignupForm · Footer · ContactBar).
- **Locales** — via next-intl, from the `[lang]` URL segment (`/vi`, `/en`), NOT
  localStorage. Config in `src/i18n/routing.js`; use the locale-aware `Link`/`usePathname`
  from `src/i18n/navigation.js` (not `next/link`). `LangToggle` swaps `/vi`↔`/en` on the
  same path.
- **Content** — bilingual, data-driven:
  - `src/content-data.js` — homepage/chrome copy (`vi` / `en`, key-parallel).
  - `src/service-content.js` — the 3 service detail pages (CCM/MTM/E&M), fed to
    `src/sections/service-detail.jsx` via `src/components/ServicePageClient.jsx`.
  - `src/content.js` (`getContent`) overlays the **Directus** homepage on top of
    content-data.js and fails soft; `src/cms.js` is the Directus client (blog/team/pages).
- **Sub-page chrome** — `src/components/BlogChrome.jsx` wraps Team/Blog/Article, and
  `ServicePageClient.jsx` wraps the service pages, in the same Header/Footer/ContactBar as
  the homepage. Both render the shared `SignupForm` at the bottom (lead form on every page).
- **Design tokens** — green accent `#26a146`, 19px base, live in `src/styles.css` `:root`
  (and are re-applied at runtime as CSS vars in the client shells). No Tailwind; plain CSS.
- **Assets** — static under `public/assets/`, referenced as `/assets/...`.
- **Static export detail** — `output: "export"` (when `BUILD_TARGET=static`) can't compile
  server-only surfaces, so `scripts/static-stash.mjs` (via `npm run build:static`) moves the
  PHI portal / API routes / middleware / auth out of the tree during the export, then
  restores them. Dynamic routes must use `generateStaticParams`; `blog/[slug]` also sets
  `dynamicParams = false` (with a throwaway slug fallback) so an empty CMS at build time
  doesn't break the export.

## Deploy

- **Marketing → Cloudflare Pages.** Production branch is **`main`**; a push to `main` (or a
  Directus publish → **Pages Deploy Hook**) rebuilds via `npm run build:static` and deploys
  the `out/` export. Build config lives in the Cloudflare Pages project (dashboard), not the
  repo. A publish goes live in ~1–2 min without a code change.
- **PHI portal + CMS → AWS.** `.github/workflows/deploy.yml` runs `terraform apply` then
  builds/rolls out the Fargate image + Lambda on push to `main`. (Note: `deploy.yml` still
  contains leftover web-ECS steps from before the Cloudflare Pages cutover — being cleaned up.)
- **PRs** run `ci.yml` (lint + `next build` + `terraform plan`) and the Cloudflare Pages
  check builds a preview. Review the terraform plan before merging — watch for DynamoDB
  table destroy = data loss.
- **DB schema** lives in ONE place: `backend/lead-handler/table-schema.json`.
- **Infra** in `infra/` (Terraform, S3 state + DynamoDB lock). See `infra/README.md`.

## Conventions

- Match the existing component style in `src/sections/` and `src/components/`: functional
  components, ESM imports, content passed down as a `t` (or `C`) prop — **never hardcode
  copy in JSX**. Every string must exist in **both `vi` and `en`**.
- Use `Icon` from `components/icons.jsx`, `Reveal`/`SectionHead`/`AGEWELL_COLORS`/
  `scrollToId` from `components/shared.jsx`. CSS: use vars (`var(--accent)`, `var(--ink)`…),
  not hardcoded hex. Mobile-first (`@media (min-width: …)` for desktop).
- New marketing route under `app/[lang]/` → server component: `setRequestLocale(lang)`,
  `generateMetadata` (reuse `languageAlternates` from `src/seo.js`), render inside
  `BlogChrome`/`ServicePageClient`. Add it to `app/sitemap.js` and (if dynamic) give it
  `generateStaticParams`.
- Keep `npm run lint` and `npm run build` green — CI enforces both. Don't run
  `npm run build` while `npm run dev` is running (they share `.next/` and corrupt it).
- DNS records (apex/www → Cloudflare Pages; api → API Gateway; cms → Cloudflare Tunnel).
