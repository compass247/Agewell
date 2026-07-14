# Playbook: Triển khai website (Design → Next.js → Cloudflare Pages + AWS → Domain → Launch)

Tài liệu này mô tả **toàn bộ quy trình** vận hành website Compass AgeWell hiện tại, viết theo
dạng có thể **lặp lại cho dự án tương tự**: từ một bản thiết kế prototype (Claude.ai hoặc bất
kỳ React/Next prototype nào) → biến thành web production Next.js → deploy marketing lên
**Cloudflare Pages** (static export) + backend/portal/CMS lên **AWS** → trỏ domain qua
Cloudflare → HTTPS → live.

> **Đối tượng**: người setup hạ tầng (DevOps / tech lead). Cần quyền AWS + Cloudflare.
> Sau khi setup xong một lần, dev chỉ cần `git push` (xem [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)).

> **Lịch sử**: dự án khởi đầu là Vite SPA phục vụ bằng nginx trên ECS Fargate + ALB. Sau đợt
> tối ưu chi phí, marketing đã chuyển sang **Cloudflare Pages** (static export ~miễn phí,
> gỡ ALB + web Fargate). Playbook này mô tả trạng thái **hiện tại**.

---

## 0. Kiến trúc tổng quan

```
   Cloudflare
   ┌─────────────────────────────────────────────────────────────┐
   │  compassagewell.com / www  ─────►  Cloudflare PAGES          │
   │      (static export `out/`, build: npm run build:static)     │
   │                                                              │
   │  cms.compassagewell.com  ──Tunnel──►  Directus (CMS)         │
   └───────────────┬──────────────────────────┬──────────────────┘
                   │ /api                      │ (portal, PHI)
                   ▼                           ▼
   ┌───────────────────────────┐   ┌──────────────────────────────┐
   │  AWS: API GW → Lambda      │   │  AWS: ECS Fargate            │
   │  → DynamoDB (+ SES)        │   │  (Next standalone: PHI portal)│
   │  api.compassagewell.com    │   │  + isolated PHI Postgres      │
   └───────────────────────────┘   └──────────────────────────────┘

   git push main
     ├─► Cloudflare Pages: build:static → deploy marketing
     └─► GitHub Actions (deploy.yml): terraform apply → Fargate/Lambda
   Directus publish ─► Pages Deploy Hook ─► rebuild marketing (~1–2 min)
```

**Các quyết định kiến trúc** (và lý do):
| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js 14 App Router + next-intl | SSG + SEO + i18n URL-based (`/vi` `/en`); dễ thêm route/CMS |
| Serving marketing | **Cloudflare Pages** (static export) | Gần như miễn phí, CDN toàn cầu, không cần ALB/container |
| CMS | Directus self-host (Cloudflare Tunnel) | BD tự sửa nội dung; overlay lên static, fail-soft |
| Portal PHI | AWS Fargate (Next standalone) | Cần server runtime + Postgres cô lập cho dữ liệu PHI |
| Backend form | API Gateway + Lambda + DynamoDB | Serverless, scale-to-zero, gần như miễn phí ở traffic thấp |
| IaC | Terraform | Quản cả AWS + Cloudflare, version control, tái lập |

---

## 1. Chuẩn bị công cụ (máy local)

```powershell
winget install OpenJS.NodeJS.LTS          # Node 20+ (build)
winget install Docker.DockerDesktop        # CMS/DB local, build portal image
winget install Hashicorp.Terraform         # dựng hạ tầng AWS
winget install Amazon.AWSCLI               # gọi AWS
winget install GitHub.cli                  # set secrets, theo dõi CI
```

> Sau khi cài, **mở terminal MỚI** để PATH cập nhật. Kiểm tra:
> `node -v`, `docker --version`, `terraform version`, `aws --version`, `gh --version`.

---

## 2. Chuẩn bị tài khoản & quyền (làm thủ công, cần con người)

### 2a. AWS — tạo IAM user + access key
1. AWS Console → **IAM** → **Users → Create user** (vd `agewell-admin`)
2. **Attach policies → AdministratorAccess** (thu hẹp sau khi xong)
3. **Security credentials → Create access key → CLI** → tải `.csv`
4. `aws configure` → nhập key/secret/region `us-east-1`/format `json`
5. Verify: `aws sts get-caller-identity`

### 2b. Cloudflare — Zone ID, API token, và project Pages
1. dash.cloudflare.com → chọn domain → **Overview** → copy **Zone ID**
2. **My Profile → API Tokens → Create Token** ("Edit zone DNS" + quyền Pages nếu cần) → copy token
3. **Workers & Pages → Create → Pages → Connect to Git** → chọn repo `compass247/Agewell`:
   - **Production branch**: `main`
   - **Build command**: `npm run build:static`
   - **Build output directory**: `out`
   - **Environment variables**: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_CMS_BASE`,
     `NEXT_PUBLIC_SITE_URL` (Next inline biến `NEXT_PUBLIC_*` lúc build — thiếu là sai)
   - (Tuỳ chọn) **Deploy hook** cho branch `main` → dán URL vào Directus Flow để publish=live.

### 2c. SES — verify email gửi lead (tùy chọn)
```powershell
aws ses verify-email-identity --email-address "you@example.com" --region us-east-1
```
→ mở mail, bấm link. SES mặc định **sandbox** (chỉ gửi tới email đã verify); xin thoát sandbox
để gửi cho bất kỳ ai.

---

## 3. Port prototype → Next.js (nếu bắt đầu từ prototype)

Nếu có prototype kiểu Claude.ai (JSX biên dịch trình duyệt, không build step):

1. **Scaffold** Next.js App Router: `package.json` (next, react, next-intl), `next.config.mjs`
   (`output: "export"` khi `BUILD_TARGET=static`), `app/layout.jsx` + `app/[lang]/layout.jsx`.
2. **Chuyển module pattern**: prototype thường dùng IIFE + `window.X = ...`. Đổi sang
   `import`/`export` ESM. Component tương tác cần `"use client"`.
3. **Tổ chức**: routes trong `app/[lang]/` (`page.jsx`, `blog/`, `team/`, `services/[slug]/`);
   nội dung song ngữ trong `src/content-data.js` + `src/service-content.js`; section trong
   `src/sections/`; helper/chrome trong `src/components/`; i18n trong `src/i18n/`.
4. **Bỏ phần chỉ dùng cho prototype** (vd tweaks-panel), hardcode giá trị đã chốt.
5. **Assets** → `public/assets/`, tham chiếu `/assets/...`. SEO qua `src/seo.js` +
   `generateMetadata` (Next Metadata API), sitemap động `app/sitemap.js`.
6. **Form** → `src/api.js` POST `/api/lead` (base = `NEXT_PUBLIC_API_BASE`), validation + honeypot.
7. **Verify local**:
   ```powershell
   npm install
   npm run build          # standalone build — phải sạch
   npm run lint           # phải xanh
   npm run build:static   # static export → ra out/ (đúng bản Cloudflare Pages chạy)
   ```

---

## 4. Static export cho Cloudflare Pages

Marketing **không cần container**. Cloudflare Pages chạy `npm run build:static`:
- `scripts/build-static.mjs` đặt `BUILD_TARGET=static` rồi gọi `next build` → `output: "export"`
  → ra thư mục `out/`.
- `scripts/static-stash.mjs` tạm **dời** các surface server-only (PHI portal `app/(portal)`,
  `app/api/*`, `middleware.js`, `auth*.js`, `app/healthz`) ra khỏi cây build (vì
  `output: "export"` không biên dịch được middleware/route handler), rồi khôi phục sau — kể cả
  khi build lỗi.
- `public/_redirects` xử lý redirect ở tầng Pages (vd `/` → `/vi/`).

> **Lưu ý dynamic route + export**: route như `blog/[slug]` phải có `generateStaticParams`. Nếu
> nguồn (CMS) rỗng lúc build, `output: "export"` sẽ báo lỗi "missing generateStaticParams" →
> đã xử lý bằng `export const dynamicParams = false` + trả 1 slug fallback (page gọi
> `notFound()`) để build không gãy.

---

## 5. Backend lead form (serverless — AWS)

`backend/lead-handler/`:
- `package.json` (`@aws-sdk/client-dynamodb`, `lib-dynamodb`, `client-sesv2`)
- `index.mjs`: handler `POST /api/lead` → validate (tên + SĐT) → honeypot → ghi DynamoDB → SES (best-effort)
- Cài deps production: `npm install --omit=dev` (Terraform sẽ zip thư mục này)

---

## 6. Hạ tầng Terraform (`infra/`) — API + portal + CMS + DNS

Terraform quản phần **AWS + Cloudflare DNS** (KHÔNG quản Cloudflare Pages — cái đó cấu hình ở
dashboard, bước 2b). Cấu trúc file (tách theo nhóm):
| File | Nội dung |
|---|---|
| `versions.tf` | providers (aws, cloudflare, archive, tls) + backend S3 |
| `variables.tf` | biến đầu vào (region, domain, email, github_repo...) |
| `network.tf` | VPC + subnets + security groups |
| `acm.tf` | ACM cert (cho api.* / portal nếu cần) validate qua Cloudflare DNS |
| `backend.tf` | DynamoDB + Lambda + API Gateway + custom domain api.* |
| `cms-*.tf` | Directus (compute + network + Cloudflare Tunnel) |
| (portal) | ECS/Fargate cho PHI portal + Postgres cô lập |
| `dns.tf` | Cloudflare DNS: api → API GW, cms → Tunnel (apex/www quản bởi Pages) |
| `oidc.tf` | GitHub OIDC provider + deploy role |
| `outputs.tf` | xuất ARN/URL cần cho GitHub config |

> Marketing **không còn** `alb.tf` / web `ecs.tf` / apex-CNAME→ALB — đã gỡ khi chuyển sang Pages.

### 6a. Bootstrap state (làm 1 lần)
```powershell
$ACCOUNT = (aws sts get-caller-identity --query Account --output text)
$BUCKET = "agewell-tfstate-$ACCOUNT"
aws s3api create-bucket --bucket $BUCKET --region us-east-1
aws s3api put-bucket-versioning --bucket $BUCKET --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket $BUCKET --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws dynamodb create-table --table-name agewell-tf-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
```

### 6b. Cấu hình + apply
1. Copy `infra/terraform.tfvars.example` → `infra/terraform.tfvars` (gitignored).
2. Cài deps Lambda: `cd backend/lead-handler; npm install --omit=dev; cd ../..`
3. Đặt biến Cloudflare (KHÔNG ghi vào file):
   ```powershell
   $env:TF_VAR_cloudflare_api_token = "<token>"
   $env:TF_VAR_cloudflare_zone_id   = "<zone-id>"
   ```
4. Init + plan + apply:
   ```powershell
   cd infra
   terraform init -backend-config="bucket=$BUCKET" -backend-config="region=us-east-1" -backend-config="dynamodb_table=agewell-tf-lock"
   terraform plan -out tf.plan        # REVIEW kỹ số resource add/destroy
   terraform apply tf.plan
   ```
5. **Lưu Outputs** (`terraform output`) — cần cho bước 7.

---

## 7. Cấu hình GitHub (secrets + variables)

```powershell
$REPO = "compass247/Agewell"
# Secrets
gh secret set AWS_DEPLOY_ROLE_ARN --repo $REPO --body "<github_deploy_role_arn>"
gh secret set TF_STATE_BUCKET     --repo $REPO --body "agewell-tfstate-<account>"
gh secret set CLOUDFLARE_API_TOKEN --repo $REPO --body "<token>"
# Variables
gh variable set AWS_REGION         --repo $REPO --body "us-east-1"
gh variable set API_BASE           --repo $REPO --body "https://api.compassagewell.com"
gh variable set CMS_BASE           --repo $REPO --body "https://cms.compassagewell.com"
gh variable set SITE_URL           --repo $REPO --body "https://compassagewell.com"
gh variable set CLOUDFLARE_ZONE_ID --repo $REPO --body "<zone-id>"
# (+ các biến ECR/ECS mà image portal dùng)
```

---

## 8. Deploy lần đầu + verify

- **Marketing**: Cloudflare Pages tự build khi push `main` (hoặc bấm "Retry deployment" trên
  dashboard). Nếu bản build ở "Preview", **Promote to production** và đảm bảo Production branch = `main`.
- **Backend/portal/CMS (AWS)**:
  ```powershell
  gh workflow run deploy.yml --repo compass247/Agewell --ref main
  gh run watch <run-id> --repo compass247/Agewell --exit-status
  ```

### Verify production
```powershell
# Marketing (static, trailing slash)
curl -s -o /dev/null -w "%{http_code}" -L https://compassagewell.com/vi/                 # 200
curl -s -o /dev/null -w "%{http_code}" -L https://compassagewell.com/vi/services/ccm     # 200
# Form API
curl -X POST https://api.compassagewell.com/api/lead -H "Content-Type: application/json" -d '{"name":"Test","phone":"408-555-1234","lang":"vi","source":"smoke"}'
# → {"ok":true,...}; kiểm DynamoDB: aws dynamodb scan --table-name agewell-leads --region us-east-1 --query Count
```
Sau đó **xóa lead test** khỏi DynamoDB nếu cần.

---

## 9. Checklist launch

- [ ] `https://<domain>/vi/` trả 200, SSL hợp lệ; Production branch của Pages = `main`
- [ ] `www` + HTTP→HTTPS redirect hoạt động; `/` → `/vi/` redirect
- [ ] Các trang render đúng mobile + desktop, toggle VI/EN OK
- [ ] Form submit thật → lưu DynamoDB (+ email nếu đã verify SES)
- [ ] OG/Twitter card đúng khi share (Zalo/Facebook)
- [ ] `sitemap.xml` + `robots.txt` truy cập được
- [ ] Directus publish → Pages Deploy Hook rebuild → nội dung lên live
- [ ] CI/CD: push commit nhỏ → Pages deploy + `deploy.yml` xanh

---

## 10. Gỡ bỏ (nếu cần huỷ dự án)

```powershell
cd infra
terraform destroy            # xoá resource AWS + DNS Cloudflare do Terraform quản
# Xoá state bucket + lock table thủ công (nằm ngoài Terraform):
aws s3 rb s3://agewell-tfstate-<account> --force
aws dynamodb delete-table --table-name agewell-tf-lock --region us-east-1
# Xoá project Cloudflare Pages thủ công trên dashboard.
```

---

## Phụ lục: Chi phí ước tính (traffic thấp)

| Dịch vụ | Chi phí/tháng (ước) |
|---|---|
| **Cloudflare Pages** (marketing) | ~0 (gói free/CDN) |
| Lambda + DynamoDB + API Gateway (form) | gần như miễn phí ở traffic thấp |
| SES | 0 (vài nghìn email đầu miễn phí) |
| Directus CMS (EC2/Fargate nhỏ) | ~10–15 USD |
| PHI portal Fargate + Postgres | ~15–25 USD (khi bật) |

> So với kiến trúc v1 (ALB ~16–20 + web Fargate ~9 chỉ để phục vụ trang tĩnh), việc chuyển
> marketing sang Cloudflare Pages tiết kiệm ~$25/tháng — lý do chính của đợt cost-cutting.
