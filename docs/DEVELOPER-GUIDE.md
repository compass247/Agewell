# Developer Guide — Compass AgeWell

Hướng dẫn cho developer xử lý **mọi yêu cầu thay đổi / bổ sung của BD** sau khi website đã
launch: cách code, fix bug, test, và deploy. Đọc kèm [README.md](../README.md) (tổng quan) và
[CLAUDE.md](../CLAUDE.md) (quy ước).

> **TL;DR**: Sửa code trong `src/` → `npm run dev` xem thử → `npm run build && npm run lint`
> phải xanh → `git push origin main` → tự động deploy ~3-4 phút → kiểm `https://compassagewell.com`.

---

## 1. Setup môi trường dev (lần đầu)

```powershell
git clone https://github.com/compass247/Agewell.git
cd Agewell
npm install
npm run dev          # http://localhost:5173
```

Cần Node 20+. Không cần AWS/Docker để code frontend — chỉ cần khi đụng tới container hoặc infra.

---

## 2. Bản đồ codebase — "muốn sửa X thì vào đâu"

| BD yêu cầu | File cần sửa |
|---|---|
| Đổi chữ/nội dung (tiêu đề, mô tả, FAQ, label form...) | [src/content-data.js](../src/content-data.js) — object `vi` và `en` |
| Thêm/bớt **section** trên trang | [src/App.jsx](../src/App.jsx) (thứ tự) + tạo component trong [src/sections/](../src/sections/) |
| Sửa section Hero…CareLoop | [src/sections/sections-a.jsx](../src/sections/sections-a.jsx) |
| Sửa USP/Team, FAQ, Form, Footer | [src/sections/sections-b.jsx](../src/sections/sections-b.jsx) |
| Đổi màu, font, spacing, layout | [src/styles.css](../src/styles.css) (CSS variables ở `:root`) |
| Thêm icon | [src/components/icons.jsx](../src/components/icons.jsx) (thêm vào object `P`) |
| Helper dùng chung (Reveal, SectionHead, scroll) | [src/components/shared.jsx](../src/components/shared.jsx) |
| Đổi ảnh (hero, team, logo) | [public/assets/](../public/assets/) + cập nhật path trong content-data |
| Logic gửi form | [src/api.js](../src/api.js) |
| Xử lý lead phía server (validate, lưu DB, email) | [backend/lead-handler/index.mjs](../backend/lead-handler/index.mjs) |
| SEO meta / OG card | [index.html](../index.html) |
| Hạ tầng (scale, region, thêm dịch vụ AWS) | [infra/*.tf](../infra/) |
| Quy trình CI/CD | [.github/workflows/](../.github/workflows/) |

### Quy ước code (giữ nhất quán với code hiện có)
- Functional components, ESM `import`/`export`.
- Component nhận nội dung qua prop `t` (object ngôn ngữ hiện tại), KHÔNG hardcode chữ trong JSX.
- Mọi chữ phải có **cả `vi` và `en`** trong content-data.js (song ngữ bắt buộc).
- Dùng `Icon` từ `components/icons.jsx`, `Reveal`/`SectionHead` từ `components/shared.jsx`.
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
1. Tạo component trong `src/sections/` (copy mẫu 1 section có sẵn, vd `Problem`).
2. Thêm nội dung vào `content-data.js` (vi + en).
3. Import + đặt vào đúng vị trí trong [src/App.jsx](../src/App.jsx):
   ```jsx
   import { NewSection } from "./sections/sections-a.jsx";
   // trong <main>:
   <NewSection t={C} />
   ```
4. Thêm CSS trong `styles.css`.

### 3c. Bật lại section Testimonials (đang ẩn)
Component `Testimonials` đã có sẵn trong `sections-b.jsx` nhưng bị ẩn (chưa có số liệu thật).
Khi BD có data: import nó vào `App.jsx` và đặt vào `<main>` (đã có nội dung trong `content-data.js`
mục `testi`). Nhớ cập nhật `testi.stats` và `testi.cards` bằng số liệu thật.

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
npm run build     # PHẢI xanh — lỗi build sẽ làm CI đỏ
npm run lint      # PHẢI xanh — max-warnings 0
npm run preview   # serve bản build, kiểm thử như production
```
Checklist tay khi `npm run dev`/`preview`:
- [ ] Section vừa sửa hiển thị đúng
- [ ] Toggle VI/EN — cả 2 ngôn ngữ đều ổn
- [ ] Responsive: thu nhỏ trình duyệt xuống ~375px (mobile) + desktop
- [ ] Form: validation báo lỗi khi bỏ trống tên/SĐT; submit thành công hiện màn cảm ơn

### 4b. Test form end-to-end (khi đụng tới form/backend)
Dev server proxy `/api` sang `VITE_API_TARGET`. Cách nhanh nhất là trỏ thẳng vào API production:
```powershell
# .env.local
VITE_API_BASE=https://api.compassagewell.com
```
Rồi submit thử trên `npm run dev`. Kiểm record:
```powershell
aws dynamodb scan --table-name agewell-leads --region us-east-1 --query 'Count'
```

### 4c. Test container (khi sửa Dockerfile/nginx)
```powershell
docker build -t web:test .
docker run -d --name web-test -p 8099:80 web:test
curl http://localhost:8099/healthz                 # 200
curl http://localhost:8099/some/route              # 200 (SPA fallback)
docker rm -f web-test
```

---

## 5. Deploy

### 5a. Deploy code (mọi thay đổi frontend/backend) — TỰ ĐỘNG
```powershell
git add -A
git commit -m "mô tả thay đổi"
git push origin main
```
→ GitHub Actions `deploy.yml` tự chạy: build image → ECR → ECS rolling deploy → update Lambda.
Mất ~3-4 phút. Trang cũ vẫn phục vụ tới khi task mới healthy (zero downtime).

Theo dõi:
```powershell
gh run watch (gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

### 5b. Deploy thay đổi hạ tầng (infra/*.tf) — THỦ CÔNG
KHÔNG đi qua `deploy.yml`. Chạy local:
```powershell
$env:TF_VAR_cloudflare_api_token = "<token>"
$env:TF_VAR_cloudflare_zone_id   = "<zone-id>"
cd infra
terraform plan -out tf.plan       # REVIEW kỹ trước khi apply
terraform apply tf.plan
```
> Hoặc dùng workflow `infra.yml` (`gh workflow run infra.yml -f action=plan`) nếu đã set
> `CLOUDFLARE_API_TOKEN` secret. Mặc định nên review plan trước, chỉ apply khi chắc.

### 5c. Rollback (nếu deploy lỗi)
Mỗi image tag bằng git SHA. Rollback = trỏ ECS về image cũ:
```powershell
# Cách đơn giản: revert commit rồi push
git revert HEAD
git push origin main
# Cách nhanh: force ECS về task definition revision trước
aws ecs update-service --cluster agewell --service agewell-web --task-definition agewell-web:<revision-cũ> --force-new-deployment --region us-east-1
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

### Debug ECS (web không lên)
```powershell
aws ecs describe-services --cluster agewell --services agewell-web --region us-east-1 --query 'services[0].events[:5]'
aws logs tail /ecs/agewell-web --follow --region us-east-1
```
Target unhealthy thường do `/healthz` không trả 200 → kiểm `nginx.conf`.

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

## 8. Tham chiếu nhanh — tài nguyên AWS

| Thứ | Giá trị |
|---|---|
| AWS account | 381492229787 |
| Region | us-east-1 |
| ECS cluster / service | `agewell` / `agewell-web` |
| ECR repo | `agewell-web` |
| Lambda | `agewell-lead-handler` |
| DynamoDB | `agewell-leads` (PK: `leadId`) |
| Domain | compassagewell.com (Cloudflare, DNS-only) |
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
- **Đừng push** thay đổi infra qua `git push` mong nó tự apply — infra phải `terraform apply` thủ công.
- **Giữ `npm run build` + `npm run lint` luôn xanh** — CI chặn merge nếu đỏ.
- Mọi text mới phải có **cả vi và en**.
