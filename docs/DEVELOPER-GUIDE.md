# Developer Guide — Compass AgeWell

Hướng dẫn cho developer xử lý **mọi yêu cầu thay đổi / bổ sung của BD** sau khi website đã
launch: cách code, fix bug, test, và deploy. Đọc kèm [README.md](../README.md) (tổng quan) và
[CLAUDE.md](../CLAUDE.md) (quy ước).

> **TL;DR**: Sửa code trong `src/` hoặc `app/` → `npm run dev` (`:3000`) xem thử →
> `npm run build && npm run lint` phải xanh → `git push origin main` → **Cloudflare Pages**
> tự build lại & deploy marketing (~1–2 phút) → kiểm `https://compassagewell.com`.
> (Phần backend/portal/CMS trên AWS deploy qua `deploy.yml` — xem mục 5.)

---

## 1. Setup môi trường dev (lần đầu)

```powershell
git clone https://github.com/compass247/Agewell.git
cd Agewell
npm install
npm run dev          # http://localhost:3000
```

Cần Node 20+. Không cần AWS/Docker để code marketing — chỉ cần Docker khi chạy CMS/DB local
(`npm run cms:up`, `npm run db:up`) hoặc khi đụng portal PHI/infra.

---

## 2. Bản đồ codebase — "muốn sửa X thì vào đâu"

| BD yêu cầu | File cần sửa |
|---|---|
| Đổi chữ/nội dung homepage (tiêu đề, mô tả, FAQ, label form...) | [src/content-data.js](../src/content-data.js) — object `vi` và `en`. **Lưu ý**: homepage/blog/team còn có thể sửa trong **Directus CMS** (overlay lên file này); xem [LOCAL-DEV.md](LOCAL-DEV.md). |
| Nội dung 3 trang dịch vụ (CCM/MTM/E&M) | [src/service-content.js](../src/service-content.js) (`vi`/`en`) |
| Thêm/bớt **section** trên homepage | [src/components/HomePageClient.jsx](../src/components/HomePageClient.jsx) (thứ tự) + tạo component trong [src/sections/](../src/sections/) |
| Sửa section Header/Hero…CareLoop | [src/sections/sections-a.jsx](../src/sections/sections-a.jsx) |
| Sửa USP/Team, FAQ, Form, Footer | [src/sections/sections-b.jsx](../src/sections/sections-b.jsx) |
| Sửa các section trang dịch vụ | [src/sections/service-detail.jsx](../src/sections/service-detail.jsx) |
| Thêm **trang mới** | Tạo route trong [app/[lang]/](../app/) (vd `app/[lang]/ten-trang/page.jsx`), bọc bằng `BlogChrome` |
| Menu / nav dropdown | [src/content-data.js](../src/content-data.js) mảng `nav` (+ `children`) → render bởi `NavItem`/`NavDropdown` trong sections-a |
| Đổi màu, font, spacing, layout | [src/styles.css](../src/styles.css) (CSS variables ở `:root`) |
| Thêm icon | [src/components/icons.jsx](../src/components/icons.jsx) (thêm vào object `P`) |
| Helper dùng chung (Reveal, SectionHead, scroll) | [src/components/shared.jsx](../src/components/shared.jsx) |
| Đổi ảnh (hero, team, logo) | [public/assets/](../public/assets/) + cập nhật path trong content |
| Logic gửi form | [src/api.js](../src/api.js) |
| Xử lý lead phía server (validate, lưu DB, email) | [backend/lead-handler/index.mjs](../backend/lead-handler/index.mjs) |
| SEO meta / OG card | [src/seo.js](../src/seo.js) + `generateMetadata` trong mỗi `page.jsx` (Next.js Metadata API) |
| Hạ tầng (scale, region, thêm dịch vụ AWS) | [infra/*.tf](../infra/) |
| Quy trình CI/CD | [.github/workflows/](../.github/workflows/) |

### Quy ước code (giữ nhất quán với code hiện có)
- Functional components, ESM `import`/`export`. Component client cần `"use client"` ở đầu file.
- Component nhận nội dung qua prop `t` (hoặc `C`, object ngôn ngữ hiện tại), KHÔNG hardcode chữ trong JSX.
- Mọi chữ phải có **cả `vi` và `en`** trong content-data.js / service-content.js (song ngữ bắt buộc).
- Dùng `Icon` từ `components/icons.jsx`, `Reveal`/`SectionHead` từ `components/shared.jsx`.
- Link nội bộ: dùng `Link`/`usePathname` **locale-aware** từ [src/i18n/navigation.js](../src/i18n/navigation.js), KHÔNG dùng `next/link` trực tiếp (để giữ prefix `/vi` `/en`).
- CSS: dùng biến `var(--accent)`, `var(--ink)`... thay vì hardcode hex.
- Mobile-first: viết style cho mobile trước, `@media (min-width: ...)` cho desktop.

---

## 3. Các tác vụ thường gặp (công thức cụ thể)

### 3a. Đổi nội dung text (yêu cầu phổ biến nhất)
Mở [src/content-data.js](../src/content-data.js), sửa ở **cả hai** `vi` và `en`. Ví dụ đổi tiêu đề Hero:
```js
vi: { hero: { title: "Tiêu đề mới tiếng Việt", ... } }
en: { hero: { title: "New English title", ... } }
```
→ `npm run dev` xem → push.

### 3b. Thêm 1 section mới
1. Tạo component trong `src/sections/` (copy mẫu 1 section có sẵn, vd `Problem`). Nhớ
   `"use client"` ở đầu file section nếu dùng hook/tương tác.
2. Thêm nội dung vào `content-data.js` (vi + en).
3. Import + đặt vào đúng vị trí trong [src/components/HomePageClient.jsx](../src/components/HomePageClient.jsx):
   ```jsx
   import { NewSection } from "../sections/sections-a.jsx";
   // trong <main>:
   <NewSection t={C} />
   ```
4. Thêm CSS trong `styles.css`.

### 3c. Bật lại section Testimonials (đang ẩn)
Component `Testimonials` đã có sẵn trong `sections-b.jsx` nhưng bị ẩn (chưa có số liệu thật).
Khi BD có data: import nó vào `HomePageClient.jsx` và đặt vào `<main>` (đã có nội dung trong
`content-data.js` mục `testi`). Nhớ cập nhật `testi.stats` và `testi.cards` bằng số liệu thật.

### 3d. Cập nhật nội dung L3 (khi BD duyệt content cuối)
Nội dung hiện tại là L2 tạm. Khi có L3: thay toàn bộ object trong `content-data.js`. Giữ nguyên
**cấu trúc key** (đừng đổi tên key, chỉ đổi value) để component không vỡ.

### 3e. Thêm field vào form đăng ký
1. `sections-b.jsx` → `SignupForm`: thêm state + input + đưa vào payload `submitLead({...})`.
2. `content-data.js` → `form.fields`: thêm label (vi+en).
3. `backend/lead-handler/index.mjs`: nhận field mới, validate nếu cần, ghi vào DynamoDB item.
   (DynamoDB schemaless — không cần migration, chỉ thêm thuộc tính vào object `lead`.)

### 3f. Đổi màu thương hiệu / theme
`styles.css` → `:root`: đổi `--green`, `--blue`, `--orange`, hoặc `--accent`. Toàn site cập nhật theo.

---

## 4. Test

### 4a. Test local (bắt buộc trước khi push)
```powershell
npm run build        # PHẢI xanh — lỗi build sẽ làm CI đỏ (standalone Next build)
npm run lint         # PHẢI xanh — max-warnings 0
npm run build:static # (tuỳ chọn) test đúng bản static export mà Cloudflare Pages chạy → ra out/
```
> **Đừng** chạy `npm run build` khi `npm run dev` đang chạy — cả hai dùng chung `.next/`
> và sẽ làm hỏng cache (lỗi `Cannot find module ./vendor-chunks/...`). Tắt dev trước.

Checklist tay khi `npm run dev`:
- [ ] Section vừa sửa hiển thị đúng
- [ ] Toggle VI/EN — cả 2 ngôn ngữ đều ổn
- [ ] Responsive: thu nhỏ trình duyệt xuống ~375px (mobile) + desktop
- [ ] Form: validation báo lỗi khi bỏ trống tên/SĐT; submit thành công hiện màn cảm ơn

### 4b. Test form end-to-end ở local (FULL STACK — chạy như live)

Để form gửi được ở local mà KHÔNG đụng production, chạy backend + database ngay trên máy:
Next (`:3000`) → gọi `/api/lead` (đặt `NEXT_PUBLIC_API_BASE` trỏ backend local `:8787`) →
backend local → **DynamoDB Local** (`:8000`).

**Cần Docker Desktop đang chạy.** Lần đầu cài deps backend: `npm --prefix backend/lead-handler install`.

Mở **3 terminal** (hoặc dùng script):
```powershell
# Terminal 1 — DynamoDB Local + admin UI (qua Docker)
npm run db:up
npm run db:init        # tạo bảng agewell-leads trong DynamoDB Local (chỉ lần đầu / sau khi db:up lại)

# Terminal 2 — backend local (Lambda handler bọc trong server :8787)
npm run backend:dev

# Terminal 3 — frontend
npm run dev            # http://localhost:3000
```
→ Mở `http://localhost:3000`, submit form → lead lưu vào **DynamoDB Local** (không phải production).

**Xem data đã lưu**: mở `http://localhost:8001` (DynamoDB Admin UI) → bảng `agewell-leads`.
Hoặc CLI:
```powershell
aws dynamodb scan --table-name agewell-leads --endpoint-url http://localhost:8000 --region us-east-1
```

**Tắt khi xong**:
```powershell
npm run db:down        # dừng & xoá container DynamoDB Local (data inMemory sẽ mất — sạch sẽ)
```

> Cấu hình local nằm ở: `backend/docker-compose.local.yml` (DB), `backend/lead-handler/local-server.mjs`
> (server bọc handler), `backend/lead-handler/create-local-table.mjs` (tạo bảng), `.env.local`
> (`NEXT_PUBLIC_API_BASE` trỏ backend `:8787`). Handler dùng chung — biến `DYNAMODB_ENDPOINT` chỉ
> set ở local, production không có nên tự dùng AWS thật.

### 4c. (Thay thế) Test form local nhưng gọi API production
Nếu lười dựng backend local, trỏ thẳng form vào API thật:
```powershell
# .env.local
NEXT_PUBLIC_API_BASE=https://api.compassagewell.com
```
Submit trên `npm run dev` → lead vào **DynamoDB production**. Gõ tên "TEST" để dễ xoá:
```powershell
aws dynamodb scan --table-name agewell-leads --region us-east-1 --query 'Count'
```

### 4d. Test bản static export (giống Cloudflare Pages)
Marketing site **không còn** chạy trong container nginx — nó là static export phục vụ bởi
Cloudflare Pages. Để kiểm tra đúng bản mà Pages build:
```powershell
npm run build:static      # ra thư mục out/ (tự stash portal/api rồi export)
npx serve out             # hoặc bất kỳ static server nào, mở http://localhost:3000
```
> Container Docker trong repo giờ là image **PHI portal** (Next standalone, cổng 3000),
> không phải marketing. Chỉ build/test nó khi đụng tới portal.

---

## 5. Deploy (GitOps — mọi thay đổi qua git, có review trên PR)

**Nguyên tắc**: KHÔNG `terraform apply` thủ công nữa. Mọi thay đổi — frontend, backend, **database,
hạ tầng** — đều đi qua git. Quy trình chuẩn:

```
local: sửa (FE/BE/DB/infra) + test  →  push nhánh feature  →  mở PR
   PR tự chạy:  lint + build + docker + TERRAFORM PLAN + Cloudflare Pages preview
   → review plan trong comment PR  →  merge vào main
   main tự chạy:
     • Marketing → Cloudflare Pages build (npm run build:static) → deploy out/
     • Backend/portal/CMS → terraform APPLY (infra/DB) TRƯỚC → build image → ECR → Fargate → Lambda
   → live cập nhật
```
> **2 luồng deploy độc lập**: đổi marketing (`src/`, `app/[lang]/`) → **Cloudflare Pages**
> lo. Đổi backend/portal/infra → **`deploy.yml` (AWS)** lo. Production branch của Pages là `main`.

### 5a. Quy trình chuẩn (mọi thay đổi)
```powershell
git checkout -b feature/ten-thay-doi
# ... sửa code/infra, test local ...
git add -A
git commit -m "mô tả thay đổi"
git push -u origin feature/ten-thay-doi
gh pr create --fill
```
→ Mở PR, **CI tự chạy**: lint + build + docker smoke + `terraform plan` + **Cloudflare Pages**
build một bản preview. Plan in vào **comment PR** để bạn xem chính xác infra/DB sẽ thay đổi gì
(read-only, an toàn, KHÔNG đụng live).

→ Review xanh → **merge** →
- **Cloudflare Pages** tự build lại từ `main` (`npm run build:static`) và deploy marketing.
- `deploy.yml` (AWS) chạy 2 job cho backend/portal/CMS:
  1. **`infra`**: `terraform apply` (cập nhật hạ tầng + DB) — chạy TRƯỚC.
  2. **`deploy`**: build image → ECR → Fargate rolling deploy → update Lambda.

Theo dõi:
```powershell
gh run watch (gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

> Thay đổi chỉ-text/chỉ-code nhỏ vẫn có thể push thẳng `main` (bỏ qua PR) — nhưng với thay đổi
> **infra/DB**, LUÔN đi qua PR để xem `terraform plan` trước.

### 5b. ⚠️ Thay đổi database / infra — đọc kỹ plan trên PR
Khi PR đụng `infra/*.tf` hoặc `backend/lead-handler/table-schema.json`, comment plan sẽ hiện thay đổi.
**Tuyệt đối kiểm tra**:
- Dòng `destroy` hoặc `-/+ replace` trên `aws_dynamodb_table.leads` = **XOÁ BẢNG → MẤT DỮ LIỆU**.
  (Thường do đổi `hashKey`/`rangeKey`. Thêm field thường KHÔNG cần đổi schema — DynamoDB schemaless.)
- Nếu thấy destroy bảng có data thật → KHÔNG merge. Backup trước (DynamoDB có point-in-time recovery),
  lên kế hoạch migration.

Schema DB nằm ở **1 file duy nhất**: `backend/lead-handler/table-schema.json` (cả local lẫn Terraform
đọc từ đó). Thêm Global Secondary Index (vd query lead theo `phone`): thêm vào `attributes` +
`globalSecondaryIndexes` trong file đó → PR → review plan → merge.

### 5c. Cửa thoát hiểm — chạy Terraform thủ công (hiếm khi cần)
Khi cần debug/rollback/import resource ngoài luồng tự động, dùng workflow `infra.yml`:
```powershell
gh workflow run infra.yml -f action=plan    # hoặc -f action=apply
```
Hoặc chạy local (cần `$env:TF_VAR_cloudflare_api_token` + `$env:TF_VAR_cloudflare_zone_id`):
```powershell
cd infra
terraform plan -out tf.plan
terraform apply tf.plan
```

### 5d. Rollback (nếu deploy lỗi)
- **Marketing (Cloudflare Pages)**: vào Pages dashboard → Deployments → chọn bản deploy tốt
  trước đó → **"Rollback to this deployment"** (hoặc `git revert` + push để build lại `main`).
- **Portal/backend (AWS)**: mỗi image tag bằng git SHA → trỏ Fargate về task definition
  revision trước:
```powershell
# Cách đơn giản: revert commit rồi push (cả Pages lẫn AWS build lại từ main)
git revert HEAD
git push origin main
# Cách nhanh cho portal: force service về revision trước
aws ecs update-service --cluster <cluster> --service <portal-service> --task-definition <portal>:<revision-cũ> --force-new-deployment --region us-east-1
```

---

## 6. Fix bug — quy trình

1. **Tái hiện** local: `npm run dev`, mở DevTools (Console + Network) xem lỗi.
2. **Khoanh vùng** bằng bảng ở mục 2 (lỗi hiển thị → section/styles; lỗi form → api.js/Lambda).
3. **Sửa** → `npm run build && npm run lint` xanh.
4. **Tạo branch** cho bug lớn:
   ```powershell
   git checkout -b fix/ten-bug
   # sửa, commit
   git push -u origin fix/ten-bug
   gh pr create        # CI chạy lint+build trên PR
   ```
   Bug nhỏ/text có thể push thẳng `main`.
5. **Verify** sau deploy trên production.

### Debug backend (Lambda)
Xem log:
```powershell
aws logs tail /aws/lambda/agewell-lead-handler --follow --region us-east-1
```
Lỗi form thường gặp:
- Form báo lỗi gửi → check CORS (Lambda env `ALLOWED_ORIGIN`) hoặc API Gateway.
- Lead không lưu → check log Lambda + quyền IAM `dynamodb:PutItem`.
- Email không tới → SES chưa verify sender, hoặc đang sandbox (lead vẫn lưu DB bình thường).

### Debug marketing (Cloudflare Pages build lỗi)
Marketing không còn chạy trên ECS. Nếu trang không cập nhật / build đỏ:
- Vào **Cloudflare Pages → Deployments** → mở build fail → xem log (thường là lỗi
  `npm run build:static`). Tái hiện local: `npm run build:static`.
- Lỗi hay gặp: dynamic route thiếu `generateStaticParams` (xem `blog/[slug]` đã xử lý bằng
  `dynamicParams = false` + fallback khi CMS rỗng). Kiểm Production branch của Pages = `main`.

### Debug portal PHI (Fargate không lên)
```powershell
aws ecs describe-services --cluster <cluster> --services <portal-service> --region us-east-1 --query 'services[0].events[:5]'
aws logs tail /ecs/<portal-log-group> --follow --region us-east-1
```
Target unhealthy thường do health route không trả 200.

---

## 7. Quy trình làm việc với BD (đề xuất)

1. BD gửi yêu cầu (text mới, section mới, đổi ảnh...).
2. Dev tạo branch `feature/...` hoặc sửa thẳng nếu nhỏ.
3. Sửa code → test local (mục 4) → push.
4. Với thay đổi lớn: tạo PR, CI xanh, review, merge.
5. Deploy tự động → gửi link `https://compassagewell.com` cho BD review.
6. BD duyệt / feedback → lặp lại.

### Nội dung là data, không phải code
Phần lớn yêu cầu BD chỉ là **đổi text** → sửa `content-data.js` → push. Không cần đụng logic.
Có thể giao việc này cho người không chuyên dev (chỉ cần cẩn thận giữ đúng cú pháp JS + sửa cả vi/en).

---

## 8. Tham chiếu nhanh — tài nguyên & hạ tầng

| Thứ | Giá trị |
|---|---|
| AWS account | 381492229787 |
| Region | us-east-1 |
| Marketing hosting | **Cloudflare Pages** (project `agewell`, production branch `main`) — không còn ECS web |
| CMS | Directus tại `cms.compassagewell.com` (qua Cloudflare Tunnel) |
| PHI portal | AWS Fargate (Next standalone) |
| Lambda | `agewell-lead-handler` |
| DynamoDB | `agewell-leads` (PK: `leadId`) |
| Domain | compassagewell.com (Cloudflare): apex/www → Pages, api → API Gateway, cms → Tunnel |
| API | https://api.compassagewell.com/api/lead |
| Terraform state | S3 `agewell-tfstate-381492229787` + lock `agewell-tf-lock` |

Xem lead đã thu:
```powershell
aws dynamodb scan --table-name agewell-leads --region us-east-1 --output json
```

---

## 9. Lưu ý quan trọng (đừng làm hỏng)

- **Đừng commit** `infra/terraform.tfvars`, `.env*`, token, access key (đã gitignore — đừng ép thêm).
- **Đừng sửa** `BD_Requirements/` — đó là prototype gốc để tham chiếu, không build/serve.
- **Đừng đổi tên key** trong `content-data.js` mà không sửa component dùng nó.
- **Thay đổi infra/DB LUÔN qua PR** để xem `terraform plan` trước khi merge. Khi merge main, infra
  **tự apply** — nên đọc kỹ plan trên PR (đặc biệt cảnh báo destroy bảng DB = mất data).
- **Đừng đổi `hashKey` trong `table-schema.json`** trên bảng có data thật — Terraform sẽ xoá+tạo lại bảng.
- **Giữ `npm run build` + `npm run lint` luôn xanh** — CI chặn merge nếu đỏ.
- Mọi text mới phải có **cả vi và en**.
