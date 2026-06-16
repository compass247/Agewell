# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

Marketing website for **Compass AgeWell** (bilingual VI/EN healthcare for Vietnamese
seniors on Medicare). Vite + React 18 static SPA → nginx on ECS Fargate; serverless
lead form (API Gateway + Lambda + DynamoDB + SES); Terraform infra; GitHub Actions CI/CD;
Cloudflare DNS.

## Commands

```bash
npm run dev      # local dev server (proxies /api to VITE_API_TARGET)
npm run build    # production build to dist/
npm run lint     # eslint (must pass, max-warnings 0)
npm run preview  # serve built dist/
```

## Architecture notes

- **No build step in the original prototype** lived in `BD_Requirements/` (browser Babel +
  CDN React). That has been ported to a real Vite project in `src/`. `BD_Requirements/`
  is reference only — do not serve or build it.
- The **tweaks panel** from the prototype is intentionally removed in production. The
  chosen design tokens (green accent `#26a146`, 19px base, bordered service cards,
  circular care loop) are hardcoded in `src/App.jsx`.
- **Bilingual content** is data-driven in `src/content-data.js` (`vi` / `en`). Language
  state persists in `localStorage` under `agewell-lang`. No i18n library.
- The **lead form** (`src/sections/sections-b.jsx` → `src/api.js`) POSTs to `/api/lead`.
  `VITE_API_BASE` (baked at build time) points it at `https://api.compassagewell.com` in
  production; empty = same-origin. A hidden honeypot field (`company`) blocks bots.
- **Assets** are static under `public/assets/` and referenced as `/assets/...`.

## Deploy

- Push to `main` triggers `.github/workflows/deploy.yml`: a `terraform apply` (infra/DB)
  job runs FIRST, then image → ECR → ECS rolling deploy + Lambda update. Infra now
  deploys automatically on merge — no manual apply.
- PRs run `terraform plan` (in `ci.yml`) and post the plan as a PR comment — review
  infra/DB changes before merging. Watch for DynamoDB table destroy = data loss.
- DB schema lives in ONE place: `backend/lead-handler/table-schema.json` (both local
  dev `create-local-table.mjs` and `infra/backend.tf` read it, so they never drift).
- Infra lives in `infra/` (Terraform). `infra.yml` is a manual escape hatch for
  plan/apply. State is in S3 with a DynamoDB lock. See `infra/README.md` for bootstrap.

## Conventions

- Match the existing component style in `src/sections/` and `src/components/`: functional
  components, ESM imports, `Reveal`/`SectionHead` shared helpers, `Icon` from
  `components/icons.jsx`.
- Keep `npm run lint` and `npm run build` green — CI enforces both.
- DNS records (apex/www/api) are Cloudflare CNAMEs to the ALB / API Gateway, DNS-only by
  default. Don't switch to proxied without setting Cloudflare SSL to Full (strict).
