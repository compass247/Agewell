# Review & Kế hoạch Tối ưu Hệ thống — 07/2026

> Kết quả review toàn diện (hạ tầng AWS, source code, CI/CD, docs) bằng multi-agent audit.
> Mục tiêu: **chuẩn chỉnh, chuyên nghiệp, chi phí tối thiểu**.
>
> **Trạng thái thực thi (nhánh `feat/system-optimization`):**
> - ✅ P1 quick wins · ✅ P2 Apply A (canary code, chờ tunnel token) · ✅ P4 bảo mật app
>   · ✅ P5 CI/CD+IAM · ✅ P6 cleanup/docs · ✅ P7 tests (55 tests xanh)
> - ⏳ P2 bước 2.0/2.2/2.3 (tạo tunnel trên dashboard → verify canary → cutover → teardown ALB+endpoints)
> - ⏳ P3 ARM64 (làm SAU khi P2 ổn định, theo thứ tự roadmap) · P3b SP/RI (để sau)
> - Sau merge cần làm tay: secret `PHI_TUNNEL_TOKEN` + `AWS_PLAN_ROLE_ARN`, required reviewer
>   cho environment `production`, chạy `phi:db:migrate` (migrations 0003/0004).

## 1. Tóm tắt điều hành

Kiến trúc hiện tại: marketing site (Next.js static export → Cloudflare Pages) + Directus CMS
(ECS-EC2 t4g.small qua Cloudflare Tunnel) + PHI portal (Fargate + RDS Postgres, VPC riêng)
+ lead form (API GW → Lambda → DynamoDB → SES). Nền tảng **tốt bất thường** so với quy mô
team: PHI portal có defense-in-depth thật (audit-in-transaction, argon2id, AES-GCM app-layer,
edge/Node split), không có secret nào bị commit, schema single-source-of-truth.

Ba nhóm vấn đề chính:

| Nhóm | Phát hiện chính |
|---|---|
| **Chi phí (~$130/th)** | VPC Interface Endpoints ~$73/th (đắt hơn NAT $32 nó thay thế); PHI ALB ~$24/th mở internet; Fargate x86 |
| **Bảo mật (3 Critical)** | Portal mở 0.0.0.0/0; không rate-limit login/TOTP; không WAF; XSS từ CMS HTML; deploy role quá quyền |
| **Chuẩn chỉnh** | Dead code (Testimonials số liệu giả, biến TF chết), docs mô tả sai kiến trúc thật, zero tests, CI không kiểm build:static |

**Mục tiêu chi phí: ~$130/th → ~$38/th** (chưa tính cam kết 1 năm, tiết kiệm thêm ~$8.5/th nếu mua SP/RI sau).

| Phase | Hành động | Tiết kiệm/th |
|---|---|---|
| P1 | Endpoints 1 AZ + bỏ KMS, CloudTrail (free), hygiene | **−$44** |
| P2 | ALB → Cloudflare Tunnel (canary blue-green), xoá hết interface endpoints | **−$49** |
| P3 | Fargate x86 → ARM64 Graviton | −$2 |
| P3b | (Tuỳ chọn, để sau) EC2 Savings Plan + RDS RI 1 năm | −$8.5 |
| P4–P7 | Bảo mật app, CI/CD, cleanup, tests | $0 |

## 2. Chi phí AWS — inventory & phân tích

Chi phí always-on hiện tại (us-east-1, ước tính):

| Resource | Cấu hình | ~$/th |
|---|---|---|
| **PHI VPC Interface Endpoints** | 5 endpoints (ecr.api, ecr.dkr, secretsmanager, kms, logs) × 2 AZ = 10 ENI | **~$73** |
| **PHI ALB** | ALB + LCU + 2 public IPv4 | ~$24 |
| PHI Fargate | 0.25 vCPU / 512 MB x86, 1 task | ~$9 |
| PHI RDS | db.t4g.micro single-AZ + 20 GB gp3 | ~$14 |
| CMS EC2 | t4g.small on-demand + EBS 20 GB gp3 | ~$14 |
| KMS CMK + Secrets Manager (2) | | ~$2 |
| S3/logs/misc | | ~$2 |
| Lambda ×2, DynamoDB on-demand, API GW, SES, CF Pages/Tunnel | scale-to-zero | ~$0 |

**Phát hiện then chốt:** `infra/phi-endpoints.tf:8-9` ước tính "~$7/mo/endpoint" nhưng thiếu
nhân số AZ — thực tế 10 ENI × $7.3 ≈ $73/th, **đắt hơn cả NAT gateway ($32/th) mà nó thay thế**.
Đây là điểm lệch lớn nhất giữa ý định tiết kiệm và chi tiêu thực.

**Phát hiện kiến trúc quan trọng:** PHI private subnets **không có route 0.0.0.0/0**
(`infra/phi-network.tf:60-67`) → cloudflared sidecar không thể chạy ở đó (cần dial-out tới
Cloudflare edge). Phương án P2: chuyển task sang **public subnet + public IP + SG zero-ingress**
(tunnel chỉ outbound) → xoá được ALB **và toàn bộ interface endpoints**. Posture ingress *mạnh hơn*
hiện tại (không còn port nghe trên internet, thêm Cloudflare Access + WAF); posture egress *yếu hơn*
(task có route internet, giảm thiểu bằng SG egress chỉ 443 + 7844 + 5432). Chấp nhận được với
dữ liệu synthetic; xét lại tại Real-PHI gate (mục 7).

Tương lai (chưa làm): EC2 Instance Savings Plan cho CMS ($12.3→~$7.8), RDS RI ($12→~$8 — xung đột
với ý tưởng Aurora Serverless v2 Stage 6c trong `infra/COST-MIGRATION.md`, chọn một).

## 3. Bảo mật

### Critical

| # | Vấn đề | Vị trí |
|---|---|---|
| C1 | `portal_allowed_cidrs` mặc định `0.0.0.0/0`, tfvars không override — login page PHI mở toàn internet | `infra/variables.tf:155-158` |
| C2 | Không rate-limit/lockout login + TOTP; TOTP 6 số, unlimited attempts → brute-force được | `auth.js`, `app/(portal)/portal/_actions/auth.js:98-121` |
| C3 | Không WAF trên bất kỳ stack nào | (không có `wafv2` trong infra/) |

→ P2 (Tunnel + Access + CF WAF) giải quyết C1+C3; P4 (throttle in-app) giải quyết C2.

### Major

| # | Vấn đề | Vị trí |
|---|---|---|
| M1 | Deploy role `PowerUserAccess` + IAM rộng, trust `repo:...:*` (mọi branch); `terraform apply -auto-approve` mỗi push main không gate | `infra/oidc.tf:24-88`, `.github/workflows/deploy.yml:70-71` |
| M2 | XSS: HTML từ Directus render qua `dangerouslySetInnerHTML` không sanitize | `app/[lang]/blog/[slug]/page.jsx:114`, `app/[lang]/team/page.jsx:62` |
| M3 | CSV formula injection khi export (không neutralize `= + - @`) | `app/(portal)/portal/_actions/export.js:25-29` |
| M4 | `audit_log` chưa được DB enforce append-only (app dùng master user) | `src/lib/phi/db.js` |
| M5 | BD đọc được mọi patient — cần quyết định minimum-necessary (product decision) | `src/lib/phi/patients.repo.js` |
| M6 | MFA re-enrollment rotate secret âm thầm — kẻ có password enroll authenticator riêng, bypass MFA | `app/(portal)/portal/_actions/auth.js:51-63` |
| M7 | `ses:SendEmail` Resource `"*"` | `infra/backend.tf:80-85` |
| M8 | `/api/revalidate` so sánh secret non-constant-time; route đã bị Deploy Hook thay thế → xoá hẳn | `app/api/revalidate/route.js:28` |

### Điểm mạnh cần giữ nguyên

Audit ghi trong cùng transaction với mutation; argon2id đúng params; AES-256-GCM app-layer cho
MBI/DOB/TOTP-secret với tamper detection; uniform login failure (chống user enumeration);
Drizzle parameterized (không SQLi); soft-delete 6 năm; secrets qua Secrets Manager `valueFrom`;
OIDC không long-lived key; fail-soft CMS overlay.

## 4. Code quality & dọn dẹp

- **Dead code / liability:** `Testimonials` (`src/sections/sections-b.jsx:129-163`) + block `testi`
  (`src/content-data.js:108-122, 259-273`) chứa số liệu bịa ("2.000+ bệnh nhân", "98%") — xoá;
  `CHATS` href="#" đang render live ở footer (`sections-b.jsx:16-21`); biến TF chết
  `alb_subnet_ids`/`desired_count`/`task_cpu`/`task_memory` (`infra/variables.tf:42-70` —
  giữ `container_image` vì `phi-ecs.tf:70` còn dùng); comment NAT stale (`phi-ecs.tf:125`,
  `phi-network.tf:16`).
- **Duplication:** accent-token hook ×3 (`HomePageClient.jsx:24-30`, `ServicePageClient.jsx:28-34`,
  `BlogChrome.jsx:15-21`); patient insert mapper 24 field ×2 (`_actions/patients.js:73-98` vs
  `_actions/import.js:127-152`); record-level `canEdit` ×3 thay vì dùng `rbac.js`.
- **SEO:** sitemap luôn vi-canonical + `lastModified: new Date()` mỗi build + hreflang `vi`/`en`
  lệch với `vi-VN`/`en-US` của `src/seo.js:16-21`.
- **Hygiene:** `.gitignore` thiếu `sample-patients-import_v1.xlsx`, `testing.xlsx` (rủi ro commit
  file dạng patient); `backend/lead-sync/package-lock.json` chưa commit trong khi lead-handler có
  → CI dùng `npm install` không pin (chuyển `npm ci`).

## 5. Docs & CI/tests

- `infra/README.md` mô tả kiến trúc **đã nghỉ hưu** (nginx/web-ECS/ALB) — viết lại.
- `backend/phi/README.md:76-81` nói AWS/KMS/CloudTrail "NOT in this phase" trong khi `infra/phi-*.tf`
  đã build đủ — **docs mâu thuẫn control thật là finding HIPAA** — đối soát lại.
- `CLAUDE.md` note deploy.yml còn web-ECS steps đã stale (đã dọn xong); `docs/LOCAL-DEV.md` tả
  `/api/revalidate` như cơ chế prod (giờ chỉ local).
- **Zero tests** trong toàn repo — trong khi crypto/RBAC/import/CSV là module thuần dễ test.
- CI (`ci.yml`) không chạy `npm run build:static` — đường build production (static-stash) chỉ được
  kiểm khi deploy thật; `scripts/static-stash.mjs` không có crash-recovery (crash giữa chừng để lại
  cây repo hỏng).

## 6. Roadmap thực thi (7 phase)

### P1 — Quick wins (~1-2h, −$44/th)
1. `infra/phi-endpoints.tf`: bỏ endpoint `kms` (app không gọi KMS API trực tiếp — Secrets Manager/
   RDS/logs mã hoá server-side); rút `subnet_ids` về **1 AZ trùng AZ của RDS** (pre-flight:
   `aws rds describe-db-instances` để chọn index). Sửa comment ước tính giá sai.
2. `infra/phi-ecs.tf`: pin service vào cùng AZ; sửa comment NAT stale. **Không đụng**
   `aws_db_subnet_group` (RDS bắt buộc ≥2 AZ).
3. `infra/terraform.tfvars`: `create_cloudtrail = true` (trail đầu tiên free — pre-flight
   `aws cloudtrail describe-trails` xác nhận chưa có).
4. `.gitignore`: thêm 2 file xlsx; commit `backend/lead-sync/package-lock.json` + đổi workflows
   sang `npm ci`.
5. `infra/backend.tf`: scope `ses:SendEmail` về identity ARN.

**Guard:** `terraform plan` phải đúng 1 destroy (kms endpoint) + updates in-place; **không đụng RDS**.

### P2 — ALB → Cloudflare Tunnel, blue-green bằng CANARY SERVICE (nửa ngày + soak, −$49/th)

> **Yêu cầu bắt buộc:** `portal-test` phải chạy **đầy đủ chức năng với đúng dữ liệu hiện có**
> (login + MFA + CRUD + import/export) — đạt được vì canary kết nối vào **chính RDS production**
> (cùng DB, không phải copy). **Không đụng service/ALB đang chạy** cho tới khi cutover.

- **2.0 Cloudflare (dashboard):** tạo tunnel `agewell-portal`; hostname
  `portal-test.compassagewell.com` → `http://localhost:3000`; Access app cho cả `portal-test`
  lẫn `portal` (Allow email compass247.vn); bật WAF managed ruleset.
- **2.1 Apply A — canary (file mới `infra/phi-canary.tf`, KHÔNG sửa resource hiện hữu):**
  task def riêng `agewell-portal-canary` — cùng image + cùng secrets (DATABASE_URL_PHI/AUTH_SECRET/
  PHI_ENC_KEY) → cùng RDS = cùng dữ liệu live; `AUTH_TRUST_HOST=true`, không pin `AUTH_URL`
  (Auth.js theo Host header, login/MFA chạy trên cả 2 hostname; session JWT nên 2 instance song song
  vô hại); sidecar `cloudflared` essential nhận `TUNNEL_TOKEN` (thêm key vào secret hiện có — secret
  version mới không redeploy service cũ). Canary chạy public subnet + public IP + SG mới zero-ingress
  (egress 443, 7844 TCP/UDP, 5432→SG RDS); thêm rule SG RDS allow từ SG canary. Gated: token rỗng →
  canary không tạo (merge an toàn trước khi có token). Chi phí tạm +~$9/th khi soak.
- **Gate:** verify trên `portal-test`: Access → login thật → TOTP → đúng danh sách patient
  production → mở record, export CSV, tải template import.
- **2.2 Cutover DNS (dashboard, rollback tức thì):** thêm hostname `portal.compassagewell.com`
  vào tunnel (thay CNAME→ALB). ALB + service cũ còn nguyên — rollback = trỏ CNAME về ALB.
  Soak 1-3 ngày.
- **2.3 Apply B — teardown:** chuyển config tunnel/public-subnet vào service chính (cloudflared
  cho phép nhiều replica cùng tunnel → không gián đoạn) rồi xoá canary; xoá `phi-alb.tf`/`phi-acm.tf`;
  SG task zero-ingress; xoá interface endpoints (giữ S3 gateway, thêm public route table); empty +
  xoá bucket ALB-logs; bỏ hostname `portal-test`; sửa `deploy-phi.yml` (jq select-by-name cho
  multi-container, migrate task sang public subnet + `assignPublicIp=ENABLED`).
  **Plan KHÔNG được đụng:** RDS, db subnet group, private subnets, IGW, KMS key.

### P3 — Fargate ARM64 (−$2/th)
`runtime_platform ARM64` cho 2 task def + `docker buildx --platform linux/arm64` trong
`deploy-phi.yml` (QEMU +5-10 phút CI). `@node-rs/argon2` có prebuild arm64-musl. Thứ tự: merge TF
→ chạy deploy-phi (build arm64 rồi mới roll service). Rollback = update-service revision cũ.
**P3b (quyết định sau):** SP/RI 1 năm khi kiến trúc ổn định.

### P4 — Bảo mật app (1-2 ngày)
1. **Throttle (C2):** bảng `auth_throttle` + `src/lib/phi/throttle.js` (5 fail/15min theo email,
   20/h theo IP, 5 TOTP fail/15min theo user; lock 15-60min; tham số hoá `now` để test); gọi trong
   `authorize()` (`auth.js`) + `verifyMfaAction`/`confirmMfaEnrollment`; IP từ `cf-connecting-ip`.
2. **MFA guard (M6):** từ chối re-enroll khi đã enrolled mà session chưa qua MFA; thêm admin
   `resetMfa` (audit).
3. **Audit append-only (M4):** drizzle custom migration — trigger `RAISE EXCEPTION` on
   UPDATE/DELETE `audit_log`.
4. **CSV (M3):** tách `csvCell` → `src/lib/phi/csv.js`, neutralize `= + - @ \t \r` bằng prefix `'`.
5. **Sanitize (M2):** `sanitize-html` (build-time, zero runtime cost với static export) tại 2 điểm
   inject + escape `<` trong JSON-LD.
6. **Xoá `/api/revalidate` (M8):** + `STASH_PATHS` + `REVALIDATE_SECRET` khỏi cms-secrets + docs.
7. **M5:** flag cho product decision, ghi vào `backend/phi/README.md`.

### P5 — CI/CD + IAM (nửa ngày)
- `infra/oidc.tf`: trust apply-role về `refs/heads/main`; thêm role plan **read-only** cho
  `pull_request` (ReadOnlyAccess + S3 state read + DynamoDB lock RW); `ci.yml` dùng
  `AWS_PLAN_ROLE_ARN` mới.
- Gate apply: `environment: production` + required reviewer (fallback repo private không có Team
  plan: push = plan-only, dispatch = apply).
- `ci.yml`: thêm job `build:static`; sau P7 thêm `npm test`.
- `scripts/static-stash.mjs`: tự phục hồi `.static-stash/` sót lại trước khi stash mới.
- `deploy-phi.yml`: bật lại `push` trigger + path filters.

### P6 — Cleanup (1 ngày)
Toàn bộ mục 4 + 5 của báo cáo: xoá Testimonials/testi/CHATS, biến TF chết, sửa comment stale,
hook `useAccent` chung, mapper `toPatientRow` chung, dùng rbac helper, sitemap/hreflang nhất quán,
copy hardcode → content-data, viết lại `infra/README.md`, đối soát `backend/phi/README.md` +
Real-PHI gate, cập nhật `CLAUDE.md`/`LOCAL-DEV.md`/`COST-MIGRATION.md`.
**Guard:** lint + build + build:static xanh; `terraform plan` không đổi resource nào.

### P7 — Tests (1 ngày)
`vitest`: crypto roundtrip/tamper/wrong-key; ma trận rbac đầy đủ; diff redaction; csv (sau P4);
import parse in-memory (exceljs); throttle với clock giả. Thêm `npm test` vào CI.

## 7. Appendix — Real-PHI gate

Trước khi nhận **PHI thật** (hiện toàn bộ dữ liệu là synthetic):

1. AWS BAA (qua AWS Artifact).
2. **Cloudflare BAA — cần Enterprise.** Nếu không mua: revert ingress về ALB + `portal_allowed_cidrs`
   /32 + private subnets + interface endpoints (lịch sử Terraform giữ để revert 1 bước).
3. Cân nhắc đưa task về private subnet (cần endpoints lại; tunnel khi đó cần NAT — quyết định lại ingress).
4. `phi_multi_az = true`.
5. DB role `phi_app` ít quyền (REVOKE trên audit_log mới có ý nghĩa thật; hiện app dùng master user).
6. Chốt BD minimum-necessary (M5).
7. KMS envelope encryption cho `PHI_ENC_KEY` (hiện là static env secret — `src/lib/phi/crypto.js:7-38`);
   runbook rotation/retention.

## 8. Thứ tự & phụ thuộc

P1 → P2 → P3 tuần tự (hạ tầng). P4-P7 độc lập với P2-P3, chạy song song được. P3b chỉ sau khi
P2-P3 ổn định 1-2 tháng.
