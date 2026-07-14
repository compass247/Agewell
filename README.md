# Compass AgeWell — Website

Bilingual (Vietnamese / English) marketing website for **Compass AgeWell** — at-home
healthcare for Vietnamese-speaking seniors on Medicare in the U.S.

Built with **Next.js 14 (App Router)** + **next-intl** (URL-based locales `/vi` `/en`).
The marketing site is statically exported and served on **Cloudflare Pages**; content is
overlaid from a self-hosted **Directus CMS** (via a Cloudflare Tunnel) with a static
fallback. A separate **PHI intake portal** (Next.js, server-rendered) runs on **AWS
Fargate**. The lead form is serverless (**API Gateway → Lambda → DynamoDB + SES**). Infra
is **Terraform**; deploys are automated via **GitHub Actions**; DNS is on **Cloudflare**.

## Tài liệu

- **[docs/HOC-NEN-TANG.md](docs/HOC-NEN-TANG.md)** — 📚 tài liệu HỌC nền tảng kỹ thuật từ cơ bản đến go-live (cho người muốn hiểu sâu để tự quản lý: internet, code, cloud, Docker, database, CI/CD, GitOps...). Bắt đầu từ đây nếu bạn muốn *hiểu* chứ không chỉ *làm*.
- **[docs/DEPLOYMENT-PLAYBOOK.md](docs/DEPLOYMENT-PLAYBOOK.md)** — hướng dẫn triển khai từ đầu đến cuối (design → git → Cloudflare Pages + AWS → domain → launch).
- **[docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)** — hướng dẫn dev: code, fix bug, test, deploy cho các thay đổi/bổ sung của BD.
- **[docs/LOCAL-DEV.md](docs/LOCAL-DEV.md)** — chạy Next.js + Directus local trước khi push.
- [infra/README.md](infra/README.md) — bootstrap & vận hành hạ tầng Terraform.
- [CLAUDE.md](CLAUDE.md) — quy ước & kiến trúc cho Claude Code.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 (next dev)
npm run build        # standalone Next build (PHI portal Fargate image)
npm run build:static # static export to out/ (what Cloudflare Pages runs)
npm run lint
```

The signup form POSTs to `/api/lead`. Set `NEXT_PUBLIC_API_BASE` (e.g.
`https://api.compassagewell.com`) to point it at a deployed backend, or run the lead
backend locally — see [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) and
[docs/LOCAL-DEV.md](docs/LOCAL-DEV.md) (Directus local on `:8055`).

## Project layout

```
app/
  layout.jsx             # root layout (imports src/styles.css)
  sitemap.js             # dynamic sitemap (home, blog, team, services, posts)
  [lang]/                # locale-prefixed marketing routes (/vi, /en)
    layout.jsx           # <html lang> + next/font, generateStaticParams
    page.jsx             # homepage (server) → HomePageClient
    blog/  team/  services/[slug]/   # sub-pages
  (portal)/              # PHI intake portal (server-rendered, Fargate only)
  api/                   # portal auth + revalidate (server routes)
src/
  content-data.js        # bilingual homepage/chrome content (VI/EN)
  service-content.js     # CCM/MTM/E&M service pages content (VI/EN)
  content.js  cms.js     # Directus CMS overlay + client (fail-soft)
  seo.js                 # SITE_URL, hreflang, homepage metadata
  api.js                 # lead form API client (NEXT_PUBLIC_API_BASE)
  styles.css             # all styles (CSS variables, mobile-first)
  i18n/                  # next-intl routing + locale-aware Link/usePathname
  components/            # HomePageClient, BlogChrome, ServicePageClient, icons, shared
  sections/              # sections-a (Header…CareLoop), sections-b (USP…Footer), service-detail
public/assets/           # logo, hero, team images
backend/lead-handler/    # Lambda: validate → DynamoDB → SES
backend/cms/  backend/phi/  # Directus CMS + PHI Postgres (Docker compose, scripts)
scripts/                 # build-static.mjs + static-stash.mjs (Cloudflare export)
infra/                   # Terraform (ECS/Fargate portal, ACM, DynamoDB, Lambda, API GW, Cloudflare, OIDC)
.github/workflows/       # ci.yml, deploy.yml, infra.yml
```

The original Claude.ai design prototypes are kept in `BD_Requirements/` for reference
(not built or served).

## Deploy pipeline

- **Marketing → Cloudflare Pages.** Production branch is **`main`**. A push to `main`
  (or a Directus publish → **Pages Deploy Hook**) triggers `npm run build:static` and
  deploys the `out/` export. Build settings live in the Cloudflare Pages project dashboard.
- **PHI portal + CMS + backend → AWS.** `deploy.yml` runs `terraform apply` then builds the
  Fargate image + updates the Lambda on push to `main`. `ci.yml` lints + builds + runs
  `terraform plan` on every PR. `infra.yml` is a manual (`workflow_dispatch`) escape hatch.
- **GitHub repo settings** — Secrets: `AWS_DEPLOY_ROLE_ARN`, `CLOUDFLARE_API_TOKEN`,
  `TF_STATE_BUCKET`. Variables: `AWS_REGION`, `CMS_BASE`, `SITE_URL`, `API_BASE`,
  `CLOUDFLARE_ZONE_ID`, plus the ECR/ECS names used by the portal image.

## Content updates

- **Homepage / service copy** lives in [`src/content-data.js`](src/content-data.js) and
  [`src/service-content.js`](src/service-content.js) (`vi` and `en`). Edit, push to `main`,
  and Cloudflare Pages redeploys automatically.
- **Blog / editable homepage / team** are authored in the **Directus CMS** and overlaid at
  build time; a publish triggers the Pages Deploy Hook to go live (~1–2 min, no code change).
  If the CMS is unreachable, pages fall back to `content-data.js` and never break.
