# CMS Migration Runbook — Next.js + Directus (self-host)

> ✅ **ĐÃ TRIỂN KHAI XONG LÊN PRODUCTION (2026-06-18).** Site live trên Next.js + Directus:
> homepage đọc nội dung từ CMS (publish→live verified), blog/sitemap/hreflang/healthz OK,
> CMS tại cms.compassagewell.com, lead API nguyên vẹn. Tài liệu này giữ lại làm tham chiếu
> vận hành + onboarding. Việc còn lại cho BD: tạo collection `posts` để viết blog, cấu hình
> Flow webhook (Bước 4), service token lead-sync (Bước 3).

Hướng dẫn từng bước đưa CMS lên production sau khi PR [#4](https://github.com/compass247/Agewell/pull/4) được merge. Mỗi bước đều có cách kiểm chứng. Thứ tự quan trọng — làm tuần tự.

> **Nguyên tắc an toàn:** homepage hiện tại (Fargate nginx) **không bị đụng** cho tới bước Cutover (Bước 6). Bạn có thể dừng sau bất kỳ bước nào mà site live vẫn chạy bình thường.

Đã verify local end-to-end (xem PR): Directus + schema + seed → Next render overlay từ CMS → CMS down thì fallback `content-data.js`. Build + lint + terraform validate đều xanh.

---

## Bước 0 — Chuẩn bị repo settings (GitHub) ⚠️ BẮT BUỘC TRƯỚC KHI DEPLOY

Thêm các **Variables** (Settings → Secrets and variables → Actions → Variables):
- `CMS_BASE` = `https://cms.compassagewell.com`
- `SITE_URL` = `https://compassagewell.com`

> **QUAN TRỌNG (lỗi đã gặp thật):** `NEXT_PUBLIC_CMS_BASE` được Next.js **inline lúc build**
> trong Docker. Thiếu var `CMS_BASE` → image build với CMS base rỗng → container KHÔNG gọi
> Directus → homepage luôn rơi về `content-data.js` **im lặng (không lỗi log)**. Sau khi set
> var phải **build lại image**: `gh workflow run deploy.yml --ref main`.
> Đặt nhanh: `gh variable set CMS_BASE --body "https://cms.compassagewell.com"`.

(Các secret/var cũ giữ nguyên: `AWS_DEPLOY_ROLE_ARN`, `CLOUDFLARE_API_TOKEN`, `TF_STATE_BUCKET`, `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`, `LEAD_LAMBDA_NAME`, `API_BASE`, `CLOUDFLARE_ZONE_ID`.)

## Bước 1 — Merge PR #4 → apply hạ tầng CMS

Merge PR vào `main`. `deploy.yml` tự chạy `terraform apply` (đã review plan trên PR: **47 add, DynamoDB in-place, web service không đụng, 4 destroy chỉ là ACM cert re-issue có chủ đích**).

**Kiểm chứng** (sau ~10 phút):
```bash
aws ecs list-services --cluster agewell                 # thấy agewell-cms
curl -s https://cms.compassagewell.com/server/health     # {"status":"ok"}
```
Nếu ACM re-issue làm `cms.` chưa lên ngay, đợi DNS/validation vài phút.

## Bước 2 — Tạo nội dung trong Directus

Lấy mật khẩu admin bootstrap:
```bash
aws secretsmanager get-secret-value --secret-id agewell-cms \
  --query SecretString --output text | jq -r .ADMIN_PASSWORD
```
Đăng nhập `https://cms.compassagewell.com` (admin@compassagewell.com). **Đổi mật khẩu ngay.**

Tạo schema (chạy từ máy có quyền, trỏ vào CMS prod):
```bash
TOKEN=$(curl -s -X POST https://cms.compassagewell.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@compassagewell.com","password":"<new-pass>"}' | jq -r .data.access_token)

DIRECTUS_URL=https://cms.compassagewell.com DIRECTUS_TOKEN=$TOKEN \
  node backend/cms/bootstrap-schema.mjs

DIRECTUS_URL=https://cms.compassagewell.com DIRECTUS_TOKEN=$TOKEN \
  node backend/cms/seed-homepage.mjs
```
Thêm collections `posts`/`pages`/`leads` theo `backend/cms/schema.yaml` (UI hoặc mở rộng bootstrap script).

**Việt hóa cho BD:** Settings → tạo role "BD Editor" (sửa nội dung, không đụng Settings); set ngôn ngữ admin = Tiếng Việt cho user BD.

**Grant Public read** trên `homepage`/`homepage_translations`/`languages`/`posts`/`posts_translations` (Access Policies → Public → read). Kiểm:
```bash
curl -s "https://cms.compassagewell.com/items/homepage?fields=translations.hero" | jq '.data.translations|length'
```

## Bước 3 — Service token cho lead dashboard

1. Studio → role "Lead Sync" (create/update/read trên `leads`).
2. Tạo user trong role đó → generate static token.
3. Đưa vào Terraform: `TF_VAR_directus_sync_token=<token>` (qua GitHub secret + workflow env, hoặc `infra/*.tfvars` không commit) → re-run deploy. Lead Lambda từ đó mirror DynamoDB → Directus.

**Kiểm:** điền form thật trên site → lead xuất hiện trong Directus → Content → Leads.

## Bước 4 — Flow publish=live

Studio → Settings → Flows → Create:
- Trigger **Event Hook**: `items.create` + `items.update` + `items.delete` trên `posts` + `homepage`.
- Operation **Webhook**: `POST https://compassagewell.com/api/revalidate?secret=<REVALIDATE_SECRET>`, body `{"collection":"{{$trigger.collection}}","slugs":["{{$trigger.payload.slug}}"]}`.

Lấy secret: `aws secretsmanager get-secret-value --secret-id agewell-cms --query SecretString --output text | jq -r .REVALIDATE_SECRET`.

## Bước 5 — Tạo bài blog thử

Trong Studio → Content → Posts → tạo 1 bài (VI + EN, status=published). Kiểm bài hiện ở `https://cms...` rồi qua Bước 6 mới thấy trên site.

## Bước 6 — CUTOVER: web service chạy Next.js

> Đây là bước duy nhất đụng homepage. Làm khi đã xác nhận Bước 1-5 ổn.

Cập nhật `infra/ecs.tf` cho task def `web`:
- `containerPort` 80 → **3000**.
- Thêm env runtime `REVALIDATE_SECRET` (từ Secrets Manager, qua task-def `secrets`).
- ALB target group `web` health check path → `/healthz` (Next route đã có).

Cập nhật ECS service `web` load_balancer container_port → 3000.

Merge → `deploy.yml` build image Next.js (đã cấu hình `NEXT_PUBLIC_*`) + rolling deploy. ECS thay container dần, ALB chờ healthz xanh mới chuyển traffic → không downtime.

**Kiểm chứng:**
```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://compassagewell.com/   # 307 -> /vi
curl -s https://compassagewell.com/vi | grep -o "<title>[^<]*"
curl -s -A "Googlebot" https://compassagewell.com/vi/blog/<slug> | grep -o "<h1>[^<]*"   # HTML thật
curl -s https://compassagewell.com/sitemap.xml | grep -c "<loc>"
```

**Publish=live:** sửa 1 bài trong Studio → Save → trong vài giây `curl .../vi/blog/<slug>` thấy nội dung mới, KHÔNG có workflow GitHub nào chạy.

## Bước 7 — SEO polish

- Submit `https://compassagewell.com/sitemap.xml` lên Google Search Console.
- Kiểm crawler view bằng `curl -A Googlebot` (HTML có nội dung, meta, JSON-LD).
- Kiểm hreflang ghép cặp VI↔EN (Search Console → International Targeting).

---

## Rollback

Tới trước Bước 6: web Fargate vẫn chạy image cũ → không cần rollback gì, chỉ cần không cutover.

Sau Bước 6 nếu lỗi: revert task def `web` về image/port cũ (80) + force-new-deployment. Homepage Next cũng tự fallback `content-data.js` nếu CMS down, nên rủi ro thấp.

## Chi phí

~$12-18/tháng mới (1× EC2 t4g.small + EBS + S3). Lead pipeline cũ không đổi.
