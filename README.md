# Compass AgeWell — Website

Bilingual (Vietnamese / English) single-page marketing site for **Compass AgeWell** —
at-home healthcare for Vietnamese-speaking seniors on Medicare in the U.S.

Built as a **Vite + React 18** static site, served by **nginx on AWS ECS Fargate**
behind an ALB, with a serverless lead form (**API Gateway → Lambda → DynamoDB + SES**).
Infra is **Terraform**; deploys are automated via **GitHub Actions**. DNS is on **Cloudflare**.

## Tài liệu

- **[docs/DEPLOYMENT-PLAYBOOK.md](docs/DEPLOYMENT-PLAYBOOK.md)** — hướng dẫn triển khai từ đầu đến cuối (dựng lại dự án tương tự: design → git → AWS ECS → domain → launch).
- **[docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)** — hướng dẫn dev: code, fix bug, test, deploy cho các thay đổi/bổ sung của BD.
- [infra/README.md](infra/README.md) — bootstrap & vận hành hạ tầng Terraform.
- [CLAUDE.md](CLAUDE.md) — quy ước & kiến trúc cho Claude Code.

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the built dist/
npm run lint
```

The signup form POSTs to `/api/lead`. In dev, Vite proxies `/api` to
`VITE_API_TARGET` (see `.env.example`). Set `VITE_API_BASE` to a deployed API base
to test against the real backend.

## Project layout

```
index.html              # HTML shell + SEO/OG meta
src/
  main.jsx              # React entry
  App.jsx               # page composition (tweaks panel removed; design tokens fixed)
  content-data.js       # bilingual content (VI/EN)
  api.js                # lead form API client
  styles.css            # all styles (CSS variables, mobile-first)
  components/            # icons, shared helpers (Reveal, SectionHead, Placeholder)
  sections/              # sections-a (Hero…CareLoop), sections-b (USP…Footer)
public/assets/           # logo, hero, team images
backend/lead-handler/    # Lambda: validate → DynamoDB → SES
infra/                   # Terraform (ECR, ECS, ALB, ACM, DynamoDB, Lambda, API GW, Cloudflare, OIDC)
.github/workflows/       # ci.yml, deploy.yml, infra.yml
Dockerfile, nginx.conf   # container that serves dist/
```

The original Claude.ai design prototype is kept in `BD_Requirements/` for reference
(not built or served).

## Deploy pipeline

1. **Provision infra once** — see [`infra/README.md`](infra/README.md). It outputs the
   ECR repo, ECS cluster/service, Lambda name, and the GitHub OIDC deploy role ARN.
2. **Configure GitHub repo settings**:
   - Secrets: `AWS_DEPLOY_ROLE_ARN`, `CLOUDFLARE_API_TOKEN`, `TF_STATE_BUCKET`
   - Variables: `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`,
     `LEAD_LAMBDA_NAME`, `API_BASE` (`https://api.compassagewell.com`), `CLOUDFLARE_ZONE_ID`
3. **Push to `main`** → `deploy.yml` builds the image, pushes to ECR, rolls out ECS,
   and updates the Lambda. `ci.yml` lints + builds on every PR. `infra.yml` is manual
   (`workflow_dispatch`) for Terraform plan/apply.

End-to-end: `git push main` → CI build → ECR → ECS rolling deploy → live site.

## Content updates

Marketing copy lives in [`src/content-data.js`](src/content-data.js) (`vi` and `en`).
Edit, push to `main`, and it deploys automatically. Current copy is the approved L2
mapping — swap for L3 when available.
