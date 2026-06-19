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

## Bước 2 — Biên tập nội dung (làm bất cứ lúc nào)

1. Vào `https://cms.compassagewell.com`, đăng nhập.
2. Menu trái → **Content** → **Pages** → mở mục **team**.
3. Sửa **Tiêu đề** và **Nội dung** ở cả 2 tab ngôn ngữ (Tiếng Việt / English).
4. Bấm **Save**.
5. Nếu đã bật webhook (việc 3): web cập nhật trong vài giây. Nếu chưa: có thể
   chậm tới ~1 giờ (do bộ nhớ đệm).

## Cách trang hoạt động (tham khảo kỹ thuật)

- Route: `app/[lang]/team/page.jsx` gọi `getPage("team", lang)` trong `src/cms.js`.
- Nếu CMS chưa có trang / không kết nối được → tự **fallback** sang đội ngũ tĩnh
  trong `src/content-data.js` (`usp.team`), nên trang **không bao giờ trống**.
- Webhook gọi `app/api/revalidate/route.js` với `collection=pages` để xoá cache.
- Cấu trúc `pages` được đặc tả trong `backend/cms/schema.yaml`.
