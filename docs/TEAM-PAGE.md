# Trang "Đội ngũ y tế / Medical Team" — hướng dẫn

Trang `/[lang]/team` đã có sẵn trên web (menu **Đội ngũ y tế / Medical Team**).
Mặc định nó hiển thị **nội dung mẫu** (lấy từ code). Để biên tập được nội dung
trong CMS, làm **một lần** theo 2 bước dưới đây.

## Bước 1 — Chạy script thiết lập (một lần)

Script `backend/cms/setup-team-page.mjs` làm **cả 3 việc** qua API Directus,
không cần bấm chuột trong Studio, không cần Docker:

1. Tạo cấu trúc dữ liệu `pages` + `pages_translations` (các ô: Tiêu đề, Nội dung,
   Ảnh bìa, Trạng thái…) và mở quyền đọc công khai.
2. Tạo sẵn trang `slug = team` (đã Published, có nội dung mẫu vi + en).
3. Bật webhook "Save là hiện ngay" cho `pages` (giống trang Blog).

Script **idempotent**: chạy lại nhiều lần không sao, **không ghi đè** nội dung
trang khi bạn đã sửa.

### Cần chuẩn bị
- **URL CMS**: `https://cms.compassagewell.com`
- **Đăng nhập admin**: một trong hai
  - Static token: Studio → ảnh đại diện (góc dưới-trái) → hồ sơ user → ô **Token** → tạo → lưu.
  - Hoặc dùng thẳng **email + mật khẩu** admin (script tự lấy token).
- **REVALIDATE_SECRET** (cho việc 3): lấy từ AWS Secrets Manager
  (xem `infra/cms-secrets.tf`) hoặc copy từ Flow webhook đang dùng cho Blog
  (`posts`). Nếu chưa có, cứ chạy không có nó — việc 1+2 vẫn xong, chạy lại sau
  để thêm webhook.

### Lệnh chạy

Cách A — dùng token:
```bash
DIRECTUS_URL=https://cms.compassagewell.com \
DIRECTUS_TOKEN=<static-token-admin> \
REVALIDATE_SECRET=<secret> \
  node backend/cms/setup-team-page.mjs
```

Cách B — dùng email/mật khẩu (script tự đăng nhập):
```bash
DIRECTUS_URL=https://cms.compassagewell.com \
DIRECTUS_EMAIL=admin@compassagewell.com \
DIRECTUS_PASSWORD=<mat-khau> \
REVALIDATE_SECRET=<secret> \
  node backend/cms/setup-team-page.mjs
```

> Trên Windows PowerShell, đặt biến trước rồi chạy:
> ```powershell
> $env:DIRECTUS_URL="https://cms.compassagewell.com"
> $env:DIRECTUS_EMAIL="admin@compassagewell.com"
> $env:DIRECTUS_PASSWORD="<mat-khau>"
> $env:REVALIDATE_SECRET="<secret>"
> node backend/cms/setup-team-page.mjs
> ```

Chạy xong, mở `https://compassagewell.com/vi/team` và `/en/team` để kiểm tra.

Script tự cấp **quyền đọc Public** cho `pages` (để web đọc nội dung không cần
đăng nhập). Nếu lần trước đã chạy bị lỗi nửa chừng (sai cấu trúc), chạy lại
**một lần** với cờ `RESET=1` để xoá cấu trúc `pages` cũ (đang trống) rồi tạo lại
sạch — KHÔNG dùng `RESET=1` khi trang đã có nội dung thật:

```powershell
$env:RESET="1"; node backend/cms/setup-team-page.mjs; Remove-Item Env:\RESET
```

## Bước 2 — Biên tập nội dung (làm bất cứ lúc nào)

1. Vào `https://cms.compassagewell.com`, đăng nhập.
2. Menu trái → **Content** → **Pages** → mở mục **team**.
3. Sửa **Tiêu đề** và **Nội dung** ở cả 2 tab ngôn ngữ (Tiếng Việt / English).
4. Bấm **Save**.
5. Nếu đã bật webhook (việc 3): web cập nhật trong vài giây. Nếu chưa: có thể
   chậm tới ~1 giờ (do bộ nhớ đệm).

## Lưới thành viên đẹp (Team Members) — KHUYẾN NGHỊ

Trang Team gồm **2 phần**:
1. **Phần đầu (intro)** — tiêu đề + đoạn mô tả tự do: nhập ở **Content → Pages → team**.
2. **Lưới thành viên** — từng người có ảnh/vai trò/tên/mô tả: nhập ở **Content →
   Team Members**. Web tự dựng lưới thẻ đẹp (3 cột) giống trang chủ.

> Nếu chỉ đổ chữ vào ô Nội dung của Pages→team thì trang sẽ **xấu** (chỉ là khối
> chữ). Hãy nhập từng người ở **Team Members** để có lưới đẹp.

### Thiết lập (một lần) — chạy script
```powershell
$env:DIRECTUS_URL="https://cms.compassagewell.com"
$env:DIRECTUS_EMAIL="admin@compassagewell.com"
$env:DIRECTUS_PASSWORD="<mat-khau>"
$env:REVALIDATE_SECRET="<secret>"
node backend/cms/setup-team-members.mjs
```
Script tạo collection **Team Members** + quyền đọc Public + webhook, và seed sẵn 3
người mẫu (ảnh để trống). Idempotent; `RESET=1` để tạo lại sạch khi cần.

### Biên tập thành viên (bất cứ lúc nào)
1. **Content → Team Members** → mở từng người (hoặc bấm **+** để thêm).
2. Upload **Photo**, điền **Role / Name / Bio** ở cả 2 tab Tiếng Việt + English.
3. Đặt **Status = Published**. Kéo-thả để sắp thứ tự hiển thị.
4. **Save** → web cập nhật trong vài giây.

## Cách trang hoạt động (tham khảo kỹ thuật)

- Route: `app/[lang]/team/page.jsx` gọi `getPage("team", lang)` (intro) +
  `getTeamMembers(lang)` (lưới) trong `src/cms.js`.
- Lưới render bằng class CSS `team-grid`/`team-card` có sẵn (`src/styles.css`).
- Nếu **chưa có** Team Members trong CMS → tự **fallback** sang đội ngũ tĩnh
  trong `src/content-data.js` (`usp.team`), nên trang **không bao giờ trống/xấu**.
- Webhook gọi `app/api/revalidate/route.js` với `collection=pages` (intro) hoặc
  `collection=team_members` (lưới) để xoá cache.
- Cấu trúc `pages`, `team_members` đặc tả trong `backend/cms/schema.yaml`.
