# Chạy & test ở máy LOCAL trước khi lên production

Từ giờ: **mọi thay đổi CMS (schema, script, trang mới) phải test ở máy local
trước, chạy đúng rồi mới push/deploy lên production.** Tài liệu này là quy trình
đầy đủ.

Bạn sẽ có 2 thứ chạy ở máy:
- **Directus local** (Docker) ở `http://localhost:8055` — bản sao cấu trúc của prod.
- **Next.js local** ở `http://localhost:3000` — website đọc từ Directus local.

Production (`cms.compassagewell.com`, `compassagewell.com`) **không bị đụng tới**
trong suốt quá trình test.

---

## Chuẩn bị (làm 1 lần)

1. **Docker Desktop** đang chạy (đã cài sẵn).
2. File `backend/cms/.env` tồn tại (đã có). Đây là cấu hình Directus local.
3. File `.env.local` ở gốc dự án có dòng `NEXT_PUBLIC_CMS_BASE=http://localhost:8055`
   (đã set). Nếu chưa, copy từ `.env.example`.

---

## Quy trình mỗi lần phát triển

### Bước 1 — Bật Directus local
```powershell
npm run cms:up
```
Đợi ~30 giây. Mở `http://localhost:8055`, đăng nhập bằng `ADMIN_EMAIL` /
`ADMIN_PASSWORD` trong `backend/cms/.env`.

### Bước 2 — Kéo cấu trúc thật từ production về (1 lần, hoặc khi prod đổi schema)
Bước này copy **cấu trúc** (collection/field/quan hệ) từ prod, KHÔNG copy nội
dung. Cần token/đăng nhập admin **production**:
```powershell
$env:SRC_URL="https://cms.compassagewell.com"
$env:SRC_EMAIL="admin@compassagewell.com"
$env:SRC_PASSWORD="<mat-khau-prod>"
npm run cms:snapshot:prod
```
→ tạo file `backend/cms/snapshot.json` (không commit).

### Bước 3 — Áp cấu trúc đó vào Directus local
Cần đăng nhập admin **local** (trong `backend/cms/.env`):
```powershell
$env:DST_URL="http://localhost:8055"
$env:DST_EMAIL="admin@compassagewell.com"
$env:DST_PASSWORD="<mat-khau-local trong backend/cms/.env>"
npm run cms:apply:local
```
→ Directus local giờ có cấu trúc giống hệt prod (kể cả pages/posts/team_members
và các quan hệ ảnh).

> Lưu ý: `/schema` của Directus **không** chuyển quyền đọc Public. Bước 4 (seed
> bằng setup script) sẽ tự cấp lại quyền Public ở local.

### Bước 4 — Tạo nội dung mẫu ở local
```powershell
$env:DIRECTUS_URL="http://localhost:8055"
$env:DIRECTUS_EMAIL="admin@compassagewell.com"
$env:DIRECTUS_PASSWORD="<mat-khau-local>"
$env:REVALIDATE_SECRET="local-revalidate-secret"
npm run cms:seed:local
```
Chạy cả 3 script setup (team page, blog, team members) trỏ vào local → có trang
team/bài blog mẫu/3 thành viên, và **cấp quyền đọc Public ở local**.

### Bước 5 — Chạy website local
```powershell
npm run dev
```
Mở:
- `http://localhost:3000/vi` — trang chủ
- `http://localhost:3000/vi/team` — lưới đội ngũ
- `http://localhost:3000/vi/blog` — blog

Tất cả đọc từ **Directus local**. Sửa nội dung trong Studio local
(`localhost:8055`) → tải lại trang để thấy thay đổi.

### Bước 6 — Khi mọi thứ chạy đúng ở local → mới lên production
Theo đúng GitOps như cũ:
1. Tạo nhánh feature, commit thay đổi code.
2. Mở PR → CI chạy (lint/build + terraform plan) → review → merge.
3. Code tự deploy. Nếu cần chạy setup script lên prod (tạo collection mới…), chỉ
   chạy **sau khi** đã verify y hệt ở local — và trỏ `DIRECTUS_URL` vào prod.

---

## Dọn dẹp / làm lại từ đầu
```powershell
npm run cms:down        # tắt Directus local, GIỮ dữ liệu
# hoặc xoá sạch để test lại từ trắng:
docker compose -f backend/cms/docker-compose.cms.yml down -v
```

---

## Quy tắc vàng
- ❌ KHÔNG chạy setup script / sửa schema thẳng trên production khi chưa test local.
- ✅ Local trước → verify → PR → deploy.
- Secret local (`local-...` trong `backend/cms/.env`) KHÁC secret prod — không trộn.
- `snapshot.json` chỉ là cấu trúc, không chứa nội dung/PII; vẫn không commit.

## Liên quan
- `backend/cms/README.md` — chi tiết stack CMS.
- `docs/TEAM-PAGE.md` — trang Đội ngũ + Team Members.
- `docs/CMS-MIGRATION.md` — bối cảnh kiến trúc CMS.
