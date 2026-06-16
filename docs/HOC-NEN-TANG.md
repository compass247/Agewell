# Học Nền Tảng — Từ con số 0 đến một website go-live

> Tài liệu này dạy bạn **hiểu sâu** mọi thứ đã được dùng để xây dựng và vận hành website
> Compass AgeWell — từ khái niệm cơ bản nhất đến khi sản phẩm chạy thật trên Internet.
>
> Mục tiêu không phải để bạn nhớ lệnh, mà để bạn **hiểu nguyên lý**, tự ra quyết định, và quản lý
> dự án trong tương lai mà không phụ thuộc vào ai.

## Cách đọc tài liệu này

- Đọc **tuần tự** từ Chương 0. Mỗi chương xây trên chương trước.
- Mỗi chương có cùng một khuôn:
  1. **🌍 Ẩn dụ đời thường** — hình dung khái niệm bằng thứ bạn đã biết.
  2. **⚙️ Nguyên lý** — nó thật sự hoạt động thế nào.
  3. **📁 Trong dự án AgeWell của bạn** — file/lệnh/kết quả thật bạn đã thấy.
  4. **🔬 Đào sâu** — chi tiết cho người muốn hiểu kỹ.
  5. **⚠️ Cạm bẫy** — lỗi thường gặp, hiểu lầm phổ biến.
  6. **✅ Tự kiểm tra** — vài câu hỏi để chắc bạn đã hiểu.
- Mở repo của bạn ra bên cạnh. Khi tài liệu nhắc tới một file (vd `src/api.js`), **mở nó ra đọc** —
  bạn đang học trên chính tài sản của mình, không phải ví dụ giả.
- Thuật ngữ tiếng Anh được giữ lại (vì mọi công cụ/tài liệu đều tiếng Anh) nhưng luôn được giải
  thích lần đầu. Tra nhanh ở **Phụ lục A — Bảng thuật ngữ**.

## Ba tài liệu anh em

Tài liệu này là phần **"học để hiểu"**. Khi đã hiểu rồi, bạn dùng 3 tài liệu **"tra để làm"**:
- [README.md](../README.md) — tổng quan dự án, lệnh cơ bản.
- [docs/DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) — cách code/fix/test/deploy hằng ngày.
- [docs/DEPLOYMENT-PLAYBOOK.md](DEPLOYMENT-PLAYBOOK.md) — dựng lại toàn bộ hạ tầng từ đầu.

---

# MỤC LỤC

**Phần I — Nền móng**
- [Chương 0 — Bức tranh toàn cảnh](#chương-0--bức-tranh-toàn-cảnh)
- [Chương 1 — Internet & Web hoạt động ra sao](#chương-1--internet--web-hoạt-động-ra-sao)
- [Chương 2 — Frontend, Backend, Database](#chương-2--frontend-backend-database)

**Phần II — Xây dựng sản phẩm**
- [Chương 3 — Code & ngôn ngữ lập trình web](#chương-3--code--ngôn-ngữ-lập-trình-web)
- [Chương 4 — Git & GitHub: quản lý mã nguồn](#chương-4--git--github-quản-lý-mã-nguồn)
- [Chương 5 — Nội dung, cấu hình & biến môi trường](#chương-5--nội-dung-cấu-hình--biến-môi-trường)

**Phần III — Đưa lên mây**
- [Chương 6 — Cloud Computing & AWS](#chương-6--cloud-computing--aws)
- [Chương 7 — Container & Docker](#chương-7--container--docker)
- [Chương 8 — Chạy container trên mây: ECS Fargate + ALB](#chương-8--chạy-container-trên-mây-ecs-fargate--alb)

**Phần IV — Dữ liệu & Backend động**
- [Chương 9 — Database: nơi cất dữ liệu](#chương-9--database-nơi-cất-dữ-liệu)
- [Chương 10 — Serverless: Lambda & API Gateway](#chương-10--serverless-lambda--api-gateway)

**Phần V — Tự động hoá & Vận hành**
- [Chương 11 — Infrastructure as Code (Terraform)](#chương-11--infrastructure-as-code-terraform)
- [Chương 12 — CI/CD & GitHub Actions](#chương-12--cicd--github-actions)
- [Chương 13 — Domain, DNS & HTTPS](#chương-13--domain-dns--https)
- [Chương 14 — GitOps & quy trình chuyên nghiệp](#chương-14--gitops--quy-trình-chuyên-nghiệp)

**Phần VI — Toàn cảnh & tương lai**
- [Chương 15 — Bảo mật, chi phí, giám sát, mở rộng](#chương-15--bảo-mật-chi-phí-giám-sát-mở-rộng)
- [Phụ lục A — Bảng thuật ngữ](#phụ-lục-a--bảng-thuật-ngữ-việtanh)
- [Phụ lục B — Sổ tay lệnh](#phụ-lục-b--sổ-tay-lệnh)
- [Phụ lục C — Lộ trình học tiếp](#phụ-lục-c--lộ-trình-học-tiếp)

---
---

# PHẦN I — NỀN MÓNG

# Chương 0 — Bức tranh toàn cảnh

Trước khi đi vào chi tiết, hãy nhìn toàn cảnh. Nếu bạn hiểu được chương này, mọi chương sau chỉ là
phóng to từng mảnh.

## 🌍 Ẩn dụ: Mở một nhà hàng

Xây một website giống như mở một nhà hàng phục vụ khách khắp nơi:

| Nhà hàng | Website AgeWell |
|---|---|
| Thực đơn, cách bài trí, bộ mặt nhà hàng | **Frontend** — giao diện khách nhìn thấy |
| Nhà bếp xử lý đơn gọi món | **Backend** — xử lý logic (vd nhận đăng ký) |
| Kho chứa nguyên liệu | **Database** — nơi lưu dữ liệu (danh sách lead) |
| Toà nhà, điện nước, mặt bằng | **Hạ tầng (infrastructure)** — máy chủ trên AWS |
| Địa chỉ nhà hàng + biển hiệu | **Domain & DNS** — `compassagewell.com` |
| Bản thiết kế xây dựng | **Code** — mã nguồn |
| Quy trình xây + sửa nhà hàng | **CI/CD** — tự động build & deploy |

Bạn không "đẻ" ra một nhà hàng trong một nốt nhạc. Bạn: thiết kế → xây → trang bị bếp/kho → thuê
mặt bằng → gắn biển hiệu → khai trương → vận hành. Website cũng đi đúng hành trình đó.

## ⚙️ Hành trình một website (đúng thứ tự dự án của bạn)

```
1. THIẾT KẾ      Claude.ai tạo bản mẫu giao diện (prototype)
        │
2. CODE          Port prototype sang dự án Vite + React thật (src/)
        │
3. GIT           Lưu mã nguồn, lịch sử thay đổi (GitHub)
        │
4. ĐÓNG GÓI      Docker đóng website thành "container" chạy được ở mọi nơi
        │
5. HẠ TẦNG       Terraform dựng máy chủ + mạng + database trên AWS
        │
6. DATABASE      DynamoDB lưu lead; Lambda xử lý form
        │
7. CI/CD         GitHub Actions tự động build → đẩy lên AWS mỗi khi có thay đổi
        │
8. DNS + HTTPS   Cloudflare trỏ domain về máy chủ; ACM cấp khoá bảo mật
        │
9. GO LIVE       https://compassagewell.com chạy thật
        │
10. VẬN HÀNH     GitOps: mọi thay đổi qua Git, tự động & an toàn
```

## 📁 Sơ đồ kiến trúc thật của AgeWell

Đây là toàn bộ hệ thống bạn đang sở hữu, vẽ thành một hình. Đừng lo nếu chưa hiểu hết — mỗi mảnh
sẽ được giải thích kỹ ở các chương sau. Hãy quay lại sơ đồ này sau mỗi chương, bạn sẽ thấy nó
ngày càng rõ.

```
   NGƯỜI DÙNG (trình duyệt điện thoại/máy tính)
        │  gõ compassagewell.com
        ▼
   ┌─────────────────┐
   │  CLOUDFLARE DNS │  "compassagewell.com ở đâu?" → trả về địa chỉ máy chủ
   └─────────────────┘
        │
        ▼  HTTPS (mã hoá, ổ khoá xanh)
   ┌──────────────────────────────── AWS (đám mây Amazon) ───────────────────┐
   │                                                                          │
   │   ┌──────────┐      ┌────────────────┐                                   │
   │   │   ALB    │─────▶│  ECS Fargate   │   ← website tĩnh (nginx phục vụ    │
   │   │ (cổng    │      │  (container)   │     các file HTML/CSS/JS đã build) │
   │   │  vào +   │      └────────────────┘                                   │
   │   │  ổ khoá) │                                                           │
   │   └──────────┘                                                           │
   │                                                                          │
   │   Khi khách bấm "Gửi đăng ký" trên form:                                 │
   │        │  POST api.compassagewell.com/api/lead                           │
   │        ▼                                                                  │
   │   ┌──────────────┐    ┌──────────┐    ┌──────────────┐   ┌────────┐      │
   │   │ API Gateway  │───▶│  Lambda  │───▶│  DynamoDB    │   │  SES   │      │
   │   │ (cửa API)    │    │ (xử lý)  │    │ (lưu lead)   │   │(email) │      │
   │   └──────────────┘    └──────────┘────────────────────▶─└────────┘      │
   │                                                                          │
   │   ECR (kho chứa image Docker)   •   S3 (lưu trạng thái Terraform)        │
   └──────────────────────────────────────────────────────────────────────────┘
        ▲
        │  mỗi khi merge code vào nhánh main
   ┌──────────────────┐
   │  GITHUB ACTIONS  │  tự động: build → đẩy image lên ECR → cập nhật ECS + Lambda
   │  (CI/CD)         │  và terraform apply (cập nhật hạ tầng)
   └──────────────────┘
```

## 🔬 Đào sâu: hai loại "đường đi" trong hệ thống

Để ý có **hai luồng** khác nhau trong sơ đồ:

1. **Luồng xem website** (đọc): khách → DNS → ALB → ECS → trả về trang web. Đây là phần **tĩnh** —
   chỉ hiển thị, không thay đổi dữ liệu. Nhanh, rẻ, đơn giản.

2. **Luồng gửi form** (ghi): khách bấm gửi → API Gateway → Lambda → ghi vào DynamoDB + gửi email.
   Đây là phần **động** — có xử lý logic và thay đổi dữ liệu.

Vì sao tách hai luồng? Vì **phần lớn website chỉ là hiển thị** (đọc) — không cần máy chủ mạnh, chỉ
cần phục vụ file. Chỉ có một hành động nhỏ (gửi form) mới cần xử lý động. Tách ra giúp: phần tĩnh
chạy cực rẻ/nhanh, phần động chỉ chạy khi có người dùng (serverless — trả tiền theo lần dùng).
Đây là một **quyết định kiến trúc** quan trọng, sẽ nói kỹ ở Chương 8 và 10.

## ⚠️ Cạm bẫy nhận thức ban đầu

- **"Website là một thứ duy nhất"** — Không. Nó là **nhiều dịch vụ ghép lại**: DNS, máy chủ, database,
  hàm xử lý, mỗi cái một việc. Hiểu được sự tách biệt này là chìa khoá để quản lý.
- **"Deploy = copy file lên máy chủ"** — Ngày xưa thì gần đúng. Ngày nay deploy là một **quy trình tự
  động** gồm build, đóng gói, kiểm thử, cập nhật nhiều dịch vụ — tất cả được kích hoạt bởi một thao
  tác Git. Đó là lý do ta học CI/CD.

## ✅ Tự kiểm tra

1. Kể tên 3 tầng của một ứng dụng (theo ẩn dụ nhà hàng).
2. Khi khách *xem* trang chủ và khi khách *gửi form*, hai luồng đi qua những dịch vụ AWS nào khác nhau?
3. Vì sao tách phần "tĩnh" và phần "động" lại tiết kiệm chi phí?

---

# Chương 1 — Internet & Web hoạt động ra sao

Trước khi hiểu website của mình, phải hiểu **Internet** — môi trường nó sống.

## 🌍 Ẩn dụ: Hệ thống bưu điện toàn cầu

Internet giống một hệ thống bưu điện khổng lồ:
- Mỗi ngôi nhà có một **địa chỉ** duy nhất → trên Internet là **địa chỉ IP** (vd `52.1.2.3`).
- Bạn gửi một **lá thư yêu cầu** ("cho tôi xem trang chủ") → gọi là **request**.
- Bên kia gửi lại một **lá thư trả lời** (nội dung trang web) → gọi là **response**.
- Bạn không cần biết đường đi của lá thư; bưu điện (các router trên Internet) tự định tuyến.

## ⚙️ Nguyên lý: Client – Server

Mọi thứ trên web là cuộc đối thoại giữa hai vai:

- **Client (khách)**: thiết bị của người dùng — thường là **trình duyệt** (Chrome, Safari). Nó *hỏi*.
- **Server (máy chủ)**: máy tính ở đâu đó luôn bật, *trả lời* các câu hỏi.

```
   CLIENT (trình duyệt)                          SERVER (máy chủ)
        │                                              │
        │  ───────  REQUEST  ──────────────────────▶   │
        │  "GET /  (cho tôi trang chủ)"                 │
        │                                              │  xử lý...
        │  ◀──────  RESPONSE  ──────────────────────   │
        │  "200 OK + nội dung HTML"                    │
        ▼                                              ▼
   hiển thị trang
```

Mỗi request/response tuân theo một bộ quy tắc gọi là **HTTP** (HyperText Transfer Protocol — giao
thức truyền tải). Nó định nghĩa cách viết "lá thư": phương thức gì, gửi gì, trả về gì.

### Các phương thức HTTP (động từ)
- **GET** — "cho tôi xem" (lấy dữ liệu). Khi bạn mở trang chủ.
- **POST** — "đây, nhận lấy" (gửi dữ liệu lên). Khi bạn gửi form đăng ký.
- (còn PUT, DELETE... nhưng dự án bạn chủ yếu dùng GET và POST.)

### Mã trạng thái (status code) — câu trả lời ngắn gọn
Mỗi response kèm một con số 3 chữ số cho biết kết quả:
- **2xx** = thành công. `200 OK` là phổ biến nhất.
- **3xx** = chuyển hướng. `301` = "trang đã dời sang chỗ khác" (bạn đã thấy khi HTTP tự nhảy sang HTTPS).
- **4xx** = lỗi phía client. `404 Not Found` = "không tìm thấy". `403` = "cấm".
- **5xx** = lỗi phía server. `500` = "máy chủ gặp sự cố".

> Bạn đã gặp những con số này thật: lúc kiểm tra website, `curl` trả về `HTTP 200` nghĩa là server
> trả lời thành công. Lúc form gửi được, API trả `{"ok":true}` kèm `200`.

## ⚙️ HTTPS — phiên bản có khoá của HTTP

**HTTPS** = HTTP + **S**ecure. Chữ "S" là lớp mã hoá (TLS/SSL). Không có nó, "lá thư" của bạn đi
qua Internet ở dạng văn bản trần — ai chặn được đều đọc được (mật khẩu, thông tin cá nhân...).
HTTPS bọc lá thư trong một phong bì mã hoá mà chỉ server đích mở được.

Dấu hiệu: **ổ khoá xanh** trên thanh địa chỉ trình duyệt, và URL bắt đầu bằng `https://`.

Để có HTTPS, server cần một **chứng chỉ số (SSL/TLS certificate)** do một tổ chức tin cậy cấp — chứng
minh "tôi đúng là compassagewell.com". Trong dự án bạn, chứng chỉ này do **AWS ACM** cấp miễn phí
(Chương 13).

## ⚙️ DNS — danh bạ của Internet

Con người nhớ tên (`compassagewell.com`), nhưng máy tính cần địa chỉ IP (`52.x.x.x`). **DNS** (Domain
Name System) là cuốn **danh bạ** dịch tên → địa chỉ.

```
   Bạn gõ:  compassagewell.com
        │
        ▼
   ┌─────────┐   "compassagewell.com có IP nào?"
   │   DNS   │ ◀──────────────────────────────────
   └─────────┘   ──────▶  "Nó trỏ tới máy chủ ALB ở AWS"
        │
        ▼
   Trình duyệt kết nối tới đúng máy chủ đó
```

Trong dự án bạn, DNS được quản lý bởi **Cloudflare** (nơi bạn mua domain). Chương 13 sẽ mổ xẻ kỹ.

## 📁 Trong dự án AgeWell: một lần xem trang chủ

Khi một bác lớn tuổi mở `compassagewell.com` trên điện thoại, đây là chuỗi sự kiện thật:

```
1. Điện thoại hỏi DNS (Cloudflare): "compassagewell.com ở đâu?"
2. Cloudflare trả: "tới agewell-alb-....elb.amazonaws.com" (máy chủ ALB của bạn trên AWS)
3. Điện thoại mở kết nối HTTPS tới ALB (ổ khoá xanh, nhờ chứng chỉ ACM)
4. ALB chuyển request tới container ECS đang chạy nginx
5. nginx trả về file index.html + CSS + JS (200 OK)
6. Trình duyệt dựng giao diện → bác ấy thấy trang web
```

Toàn bộ chuỗi này thường xong trong dưới 1 giây.

## 🔬 Đào sâu: vì sao có cả Cloudflare lẫn AWS?

Nhiều người thắc mắc tại sao domain ở Cloudflare mà máy chủ ở AWS. Vì chúng làm **hai việc khác nhau**:
- **Cloudflare**: nơi đăng ký domain + quản lý DNS (danh bạ). Nó chỉ "chỉ đường".
- **AWS**: nơi đặt máy chủ thật (nhà hàng). Nó "phục vụ".

Bạn hoàn toàn có thể mua domain một nơi, đặt máy chủ một nơi khác — DNS là cầu nối. Đây là chuyện
rất bình thường và linh hoạt.

## ⚠️ Cạm bẫy

- **Nhầm domain với hosting**: mua domain (cái tên) không có nghĩa là có máy chủ (chỗ chạy). Hai thứ
  riêng biệt, nối với nhau qua DNS.
- **"HTTP cũng được, cần gì HTTPS"**: với site y tế thu thập thông tin cá nhân, HTTPS là **bắt buộc** —
  cả về pháp lý lẫn niềm tin. May là nó miễn phí (ACM) và đã được bật sẵn.
- **DNS không tức thời**: khi đổi bản ghi DNS, có thể mất vài phút tới vài giờ để lan truyền khắp thế
  giới (gọi là "DNS propagation"). Đừng hoảng nếu thay đổi chưa thấy ngay.

## ✅ Tự kiểm tra

1. Client và server, ai hỏi ai trả lời? Trình duyệt là cái nào?
2. `200`, `301`, `404`, `500` mỗi cái nghĩa là gì?
3. DNS làm nhiệm vụ gì? Vì sao domain của bạn ở Cloudflare nhưng máy chủ ở AWS vẫn hoạt động?
4. HTTPS thêm gì so với HTTP, và vì sao nó quan trọng với website y tế?

---

# Chương 2 — Frontend, Backend, Database

Đây là ba "tầng" của hầu hết mọi ứng dụng web. Hiểu rõ ranh giới giữa chúng giúp bạn biết **mỗi vấn
đề thuộc về đâu** khi cần sửa.

## 🌍 Ẩn dụ: Nhà hàng (chi tiết hơn Chương 0)

- **Frontend = phòng ăn + thực đơn + phục vụ bàn**: thứ khách *nhìn thấy và tương tác*. Bàn ghế, menu,
  cách trình bày món. Nếu phòng ăn xấu, khách bỏ đi dù bếp ngon.
- **Backend = nhà bếp**: khách không thấy, nhưng đây là nơi *xử lý*. Nhận đơn, nấu, kiểm tra nguyên
  liệu, quyết định logic ("hết món này thì báo khách").
- **Database = kho nguyên liệu**: nơi *cất giữ* mọi thứ lâu dài. Bếp lấy từ kho, cất vào kho.

Khách gọi món (frontend) → phục vụ chuyển vào bếp (request tới backend) → bếp lấy đồ từ kho
(database) → nấu xong mang ra (response về frontend).

## ⚙️ Nguyên lý: ba tầng, ba trách nhiệm

| Tầng | Trách nhiệm | Chạy ở đâu | Trong AgeWell |
|---|---|---|---|
| **Frontend** | Giao diện, tương tác người dùng | **Trình duyệt** của khách | React (các section, form), CSS |
| **Backend** | Logic, xử lý, quy tắc nghiệp vụ | **Máy chủ** (hoặc Lambda) | Lambda `lead-handler` |
| **Database** | Lưu trữ dữ liệu lâu dài | **Máy chủ database** | DynamoDB `agewell-leads` |

**Điểm mấu chốt**: Frontend chạy trên máy của *khách* (trình duyệt tải code về rồi chạy). Backend và
Database chạy trên máy chủ của *bạn* (AWS). Đó là lý do ai cũng xem được frontend (nó được gửi tới
họ), nhưng không ai đụng được database trực tiếp (nó nằm sau backend, được bảo vệ).

## ⚙️ Vì sao phải tách ra ba tầng?

Hãy tưởng tượng nếu trộn hết vào một cục:
- Muốn đổi màu nút bấm → phải đụng cả phần xử lý dữ liệu → dễ làm hỏng.
- Nhiều người làm cùng lúc → giẫm chân nhau.
- Khó kiểm thử, khó tái sử dụng.

Tách tầng = **chia để trị**. Mỗi tầng:
- Có thể sửa độc lập (đổi giao diện không đụng database).
- Có thể thay thế (đổi database mà frontend không cần biết).
- Dễ phân công, dễ kiểm thử, dễ bảo mật (chỉ backend được nói chuyện với database).

## 📁 Trong dự án AgeWell: một lead đi qua ba tầng

Khi bác lớn tuổi điền form và bấm "Gửi đăng ký":

```
FRONTEND (React, chạy trong trình duyệt bác ấy)
   src/sections/sections-b.jsx — component SignupForm
   • kiểm tra tên + số điện thoại có hợp lệ không (validation)
   • gọi hàm submitLead() trong src/api.js
        │
        │  POST /api/lead  (gửi {name, phone, services, ...})
        ▼
BACKEND (Lambda, chạy trên AWS)
   backend/lead-handler/index.mjs
   • kiểm tra lại dữ liệu (không tin tưởng frontend)
   • chặn bot (honeypot)
   • quyết định: lưu vào đâu, gửi email cho ai
        │
        ▼
DATABASE (DynamoDB, trên AWS)
   bảng agewell-leads
   • lưu vĩnh viễn: {leadId, name, phone, services, createdAt, ...}
```

Mở 3 file đó ra đọc song song, bạn sẽ thấy rõ ranh giới: `src/api.js` chỉ *gửi đi*, `index.mjs` chỉ
*xử lý + lưu*, không file nào lẫn việc của nhau.

## 🔬 Đào sâu: "không tin tưởng frontend"

Để ý form kiểm tra dữ liệu ở frontend (`sections-b.jsx`), **rồi backend kiểm tra lại** (`index.mjs`).
Tại sao kiểm hai lần?

Vì **frontend chạy trên máy của khách → kẻ xấu có thể can thiệp**. Họ có thể bỏ qua trình duyệt và
gửi thẳng dữ liệu rác/độc tới `/api/lead`. Frontend validation chỉ để *trải nghiệm tốt* (báo lỗi
ngay cho người dùng). Backend validation mới là *lá chắn thật* (bảo vệ database). Nguyên tắc vàng:

> **Không bao giờ tin dữ liệu đến từ client. Luôn kiểm tra lại ở backend.**

Đây là nền tảng của bảo mật web. Honeypot (bẫy bot) trong form cũng là một ví dụ: một ô ẩn mà người
thật không thấy, nhưng bot tự động điền — backend thấy ô đó có giá trị thì biết là bot và loại bỏ.

## ⚠️ Cạm bẫy

- **Tưởng database công khai**: database KHÔNG bao giờ để khách truy cập trực tiếp. Luôn nằm sau
  backend. Nếu frontend nói chuyện thẳng với database → lỗ hổng nghiêm trọng.
- **Để logic quan trọng ở frontend**: ví dụ "chỉ admin mới xoá được" mà kiểm tra ở frontend → vô
  dụng, vì khách sửa được frontend. Logic bảo mật phải ở backend.
- **Lẫn lộn khi sửa bug**: trước khi sửa, hỏi "lỗi này thuộc tầng nào?". Giao diện sai → frontend.
  Dữ liệu lưu sai → backend/database. Khoanh đúng tầng tiết kiệm rất nhiều thời gian.

## ✅ Tự kiểm tra

1. Ba tầng chạy ở đâu (máy của ai)? Vì sao ai cũng xem được frontend nhưng không ai đụng được database?
2. Vì sao form kiểm tra dữ liệu cả ở frontend lẫn backend? Cái nào là "lá chắn thật"?
3. Trong dự án, file nào thuộc frontend, file nào thuộc backend, dữ liệu lead cuối cùng nằm ở đâu?
4. "Không tin tưởng client" nghĩa là gì và vì sao quan trọng?

---

# PHẦN II — XÂY DỰNG SẢN PHẨM

# Chương 3 — Code & ngôn ngữ lập trình web

## 🌍 Ẩn dụ: Công thức nấu ăn

**Code** là tập hợp các **chỉ dẫn** viết bằng ngôn ngữ máy hiểu được — giống công thức nấu ăn chi
tiết cho người chưa biết nấu: "cho 200g bột, trộn với 2 trứng, nướng 180°C trong 20 phút". Máy tính
làm đúng từng bước, không sáng tạo, không đoán. Sai một dấu phẩy là hỏng.

## ⚙️ Ba ngôn ngữ nền tảng của web

Mọi website đều dựng từ ba ngôn ngữ này (chúng phối hợp như xương, da, cơ):

| Ngôn ngữ | Vai trò | Ẩn dụ |
|---|---|---|
| **HTML** | Cấu trúc, nội dung | Bộ **xương** — tiêu đề, đoạn văn, nút, ô nhập |
| **CSS** | Trình bày, thẩm mỹ | **Da & quần áo** — màu, font, khoảng cách, bố cục |
| **JavaScript (JS)** | Hành vi, tương tác | **Cơ bắp** — bấm nút thì làm gì, gửi form, đổi ngôn ngữ |

- **HTML** (HyperText Markup Language): khai báo "có cái gì". Ví dụ `<button>Gửi</button>` = một nút.
- **CSS** (Cascading Style Sheets): khai báo "trông thế nào". Ví dụ nút màu xanh lá `#26a146`.
- **JavaScript**: khai báo "làm gì khi tương tác". Ví dụ bấm nút thì gửi dữ liệu lên backend.

Trong dự án bạn: file `src/styles.css` là toàn bộ CSS; HTML và JS được viết lồng nhau qua React (xem
bên dưới).

## ⚙️ Vấn đề: viết web "tay không" rất cực

Viết HTML/CSS/JS thuần cho một trang lớn rất khổ:
- Lặp lại nhiều (mỗi section copy-paste cấu trúc giống nhau).
- Khó quản lý khi trang phức tạp.
- Đổi một chỗ phải sửa nhiều nơi.

Vì vậy người ta tạo ra **framework** (khung sườn) để viết nhanh và gọn hơn. Dự án bạn dùng **React**.

## ⚙️ React — xây giao diện bằng "khối lắp ghép"

**React** là một thư viện JavaScript giúp xây giao diện bằng các **component** (thành phần) — như
những khối LEGO tái sử dụng được.

Ẩn dụ: thay vì xây mỗi bức tường bằng cách xếp từng viên gạch, bạn tạo sẵn các "mảng tường đúc"
(component) rồi lắp lại. Một component có thể là một nút, một thẻ dịch vụ, hay cả một section.

Trong AgeWell, mỗi phần của trang là một component:
```
src/sections/sections-a.jsx   → Header, Hero, Problem, Services, CareLoop
src/sections/sections-b.jsx   → UspTeam, Eligibility, SignupForm, Footer, ContactBar
src/components/icons.jsx       → các icon (component Icon dùng lại nhiều nơi)
src/App.jsx                    → lắp tất cả lại thành trang hoàn chỉnh
```

Mở `src/App.jsx`, bạn sẽ thấy nó chỉ là danh sách các component ghép lại — đọc gần như tiếng Anh
thường:
```jsx
<Hero t={C} />
<Problem t={C} />
<Services t={C} variant="bordered" />
```
Đây là **JSX** — cách React cho phép viết HTML lồng trong JavaScript. `t={C}` là cách "truyền dữ
liệu" (nội dung ngôn ngữ) vào component — gọi là **props** (thuộc tính).

## ⚙️ Vite — công cụ build

Trình duyệt hiểu HTML/CSS/JS thuần, nhưng **không hiểu trực tiếp** JSX và cách viết React hiện đại.
Cần một bước "biên dịch + đóng gói" để chuyển code React thành các file HTML/CSS/JS thuần mà trình
duyệt chạy được. Công cụ làm việc đó là **Vite**.

```
   CODE NGUỒN (bạn viết)              BUILD (Vite)            KẾT QUẢ (trình duyệt chạy)
   src/*.jsx (React/JSX)    ───────────────────────▶    dist/
   src/styles.css                  npm run build            index.html
                                                            assets/index-xxxx.js   (đã gộp + nén)
                                                            assets/index-xxxx.css
```

- `npm run dev` → chạy server phát triển, xem thử ngay, tự cập nhật khi sửa (Chương này + Chương 5).
- `npm run build` → tạo thư mục `dist/` chứa file tối ưu để đưa lên production.

> Bạn đã thấy output thật của `npm run build`: nó báo `dist/index.html`, `dist/assets/index-xxxx.js
> 179 kB (gzip 58 kB)`. Con số gzip là kích thước sau khi nén — nhỏ hơn nhiều, tải nhanh hơn.

## 📁 Trong dự án: vì sao phải "port" prototype?

Bản mẫu ban đầu từ Claude.ai (trong `BD_Requirements/`) chạy React **trực tiếp trong trình duyệt**
qua một thư viện biên dịch tại chỗ (Babel CDN). Cách này tiện cho làm mẫu nhanh nhưng **không phù
hợp cho production**:
- Chậm (trình duyệt phải biên dịch mỗi lần tải).
- Không tối ưu (không nén, không gộp file).
- Phụ thuộc mạng (tải thư viện từ CDN ngoài).

Vì vậy bước đầu của dự án là **port** (chuyển) prototype sang một dự án Vite thật (`src/`): cùng giao
diện, cùng nội dung, nhưng giờ được build đúng cách → nhanh, gọn, sẵn sàng cho hàng nghìn người dùng.

## 🔬 Đào sâu: "npm" và package.json là gì?

- **npm** (Node Package Manager) là công cụ quản lý **thư viện** (package) cho JavaScript. Thay vì tự
  viết mọi thứ, bạn "mượn" code người khác đã viết tốt (React, Vite...).
- **package.json** là "tờ khai" của dự án: tên, các thư viện cần (`dependencies`), và các **lệnh tắt**
  (`scripts`) như `dev`, `build`, `lint`. Mở `package.json` ở gốc repo, mục `scripts`, bạn sẽ thấy
  đúng các lệnh mình hay chạy.
- **npm install** đọc `package.json` rồi tải các thư viện về thư mục `node_modules/` (thư mục này rất
  nặng nên không bao giờ commit lên Git — nó được tái tạo từ `package.json`).

## ⚠️ Cạm bẫy

- **Nhầm `dependencies` với `devDependencies`**: `dependencies` là thư viện cần khi *chạy thật*;
  `devDependencies` chỉ cần khi *phát triển/build* (như Vite, ESLint). Phân biệt giúp gói production nhẹ.
- **Sửa file trong `dist/`**: vô nghĩa — `dist/` là kết quả tự sinh, sẽ bị ghi đè mỗi lần build. Luôn
  sửa ở `src/`.
- **Đụng `BD_Requirements/`**: đó là prototype gốc để tham chiếu, KHÔNG build/serve. Code thật ở `src/`.

## ✅ Tự kiểm tra

1. HTML, CSS, JS mỗi cái lo việc gì (theo ẩn dụ xương/da/cơ)?
2. Component trong React là gì? Kể 2 component trong dự án bạn.
3. Vì sao cần Vite? `npm run build` tạo ra cái gì, ở đâu?
4. Vì sao prototype Claude.ai phải port sang Vite thay vì dùng trực tiếp?

---

# Chương 4 — Git & GitHub: quản lý mã nguồn

Đây là một trong những kỹ năng nền tảng quan trọng nhất. Hiểu Git là hiểu **xương sống** của cách
phần mềm hiện đại được xây dựng và vận hành.

## 🌍 Ẩn dụ: Cỗ máy thời gian + sổ ghi chép chung

Tưởng tượng bạn viết một cuốn sách cùng nhiều người:
- Bạn muốn **lưu lại mọi phiên bản** để lỡ sai thì quay lại được → **cỗ máy thời gian**.
- Mỗi lần sửa, bạn ghi chú "đã đổi gì, vì sao" → **sổ ghi chép**.
- Nhiều người viết các chương khác nhau cùng lúc rồi ghép lại mà không giẫm chân → **bản nháp riêng**.

**Git** chính là cỗ máy đó cho code. **GitHub** là nơi cất bản sao chung trên mạng để mọi người (và
các máy tự động) cùng truy cập.

## ⚙️ Các khái niệm cốt lõi

### Repository (repo) — kho chứa dự án
Toàn bộ dự án + lịch sử của nó. Repo của bạn: `compass247/Agewell` trên GitHub. Có 2 bản:
- **Local** (trên máy bạn): nơi bạn làm việc.
- **Remote** (trên GitHub): bản chung trên mạng, gọi là `origin`.

### Commit — một "ảnh chụp" có ghi chú
Mỗi lần bạn lưu một nhóm thay đổi, bạn tạo một **commit**: một ảnh chụp trạng thái code + lời nhắn
mô tả. Lịch sử dự án là chuỗi các commit nối tiếp.

```
   commit 1 ──▶ commit 2 ──▶ commit 3 ──▶ ... ──▶ hiện tại
   "khởi tạo"   "thêm form"   "sửa lỗi gửi"
```

Bạn đã thấy chúng thật: `git log --oneline` hiện ra danh sách như `feat(gitops): ...`, `fix(ci): ...`.

### Branch (nhánh) — bản nháp song song
Một **nhánh** là một dòng phát triển riêng. Nhánh chính tên là **main** (= phiên bản đang chạy thật).
Khi muốn làm một thay đổi, bạn tạo nhánh mới từ main, làm việc ở đó, xong mới ghép trở lại.

```
   main      ──●──────●──────────────●──  (luôn là bản ổn định, đang live)
                       \            /
   feature/x            ●────●────●    (nhánh nháp: làm thử, không ảnh hưởng main)
                        sửa  thêm  xong → ghép vào main
```

Vì sao cần nhánh? Để **thử nghiệm an toàn**: bạn làm hỏng nhánh nháp cũng không sao, main vẫn chạy
bình thường. Chỉ khi nháp ổn mới ghép vào.

### Merge — ghép nhánh
**Merge** là hành động ghép thay đổi từ nhánh nháp vào main. Sau khi merge, main có thêm thay đổi đó.

### Pull Request (PR) — đề nghị ghép + chỗ review
Trên GitHub, thay vì merge thẳng, bạn mở một **Pull Request**: "tôi đề nghị ghép nhánh này vào main,
mọi người xem giúp". PR là nơi:
- Xem **chính xác** những dòng nào thay đổi.
- Chạy kiểm thử tự động (CI) trước khi ghép.
- Thảo luận, duyệt.

Bạn đã tạo PR #1 và #2 thật, và thấy CI tự chạy trên đó.

## ⚙️ Các lệnh Git xương sống

```bash
git status          # xem đang có gì thay đổi
git add -A          # đánh dấu các thay đổi để chuẩn bị commit ("cho vào giỏ")
git commit -m "..." # tạo commit với lời nhắn
git push            # đẩy commit lên GitHub (remote)
git pull            # kéo thay đổi mới nhất từ GitHub về
git checkout -b ten # tạo nhánh mới tên `ten` và chuyển sang nó
git log --oneline   # xem lịch sử commit gọn
```

Quy trình điển hình một thay đổi:
```
git checkout -b feature/doi-tieu-de   # tạo nhánh
... sửa code ...
git add -A
git commit -m "đổi tiêu đề hero"
git push -u origin feature/doi-tieu-de # đẩy nhánh lên GitHub
gh pr create                           # mở Pull Request
... CI chạy, review, merge ...
```

## 📁 Trong dự án: lịch sử thật của bạn

Chạy `git log --oneline` trong repo, bạn thấy hành trình dự án được ghi lại từng bước: từ commit đầu
"Build Compass AgeWell production site", qua "full local backend stack", tới "GitOps: auto-apply
infra". Mỗi commit là một cột mốc. Đây là **trí nhớ vĩnh viễn** của dự án — ai cũng đọc được vì sao
mọi thứ thành ra như hiện tại.

## 🔬 Đào sâu: vì sao Git quan trọng đến vậy?

Git không chỉ là "lưu file". Nó là **nền tảng cho mọi tự động hoá hiện đại**:
- **CI/CD** (Chương 12) được kích hoạt bởi sự kiện Git (push, merge).
- **GitOps** (Chương 14) coi Git là "nguồn chân lý duy nhất" — trạng thái hệ thống = trạng thái trong Git.
- **Rollback** (quay lui khi lỗi): vì có lịch sử, bạn quay về commit cũ là khôi phục được.
- **Cộng tác**: nhiều người làm song song không loạn.

Nói cách khác: trong dự án của bạn, **Git là cái nút bấm điều khiển tất cả**. Bạn merge một PR thì cả
một dây chuyền tự động chạy (build, deploy, cập nhật hạ tầng). Hiểu Git là hiểu cách "ra lệnh" cho
toàn hệ thống.

## ⚠️ Cạm bẫy

- **Commit lên main trực tiếp**: với GitOps, bạn đã bật **branch protection** chặn việc này — mọi thay
  đổi phải qua PR. Đó là cố ý, để an toàn.
- **Commit file nhạy cảm**: token, mật khẩu, file `.env` KHÔNG được commit. File `.gitignore` liệt kê
  những gì Git phải bỏ qua. Luôn kiểm tra trước khi commit.
- **Lời nhắn commit cẩu thả**: "fix", "update" vô nghĩa. Lời nhắn tốt giải thích *vì sao*, giúp tương
  lai hiểu được. Dự án bạn dùng quy ước như `feat(...)`, `fix(...)`, `docs(...)`.
- **node_modules/ và dist/ lên Git**: không bao giờ — chúng tự tái tạo được, chỉ làm repo nặng.

## ✅ Tự kiểm tra

1. Phân biệt commit, branch, merge, pull request bằng lời của bạn.
2. Vì sao nên làm việc trên nhánh nháp thay vì sửa thẳng main?
3. Pull Request giúp ích gì trước khi ghép code?
4. Vì sao nói "Git là cái nút điều khiển tất cả" trong dự án GitOps của bạn?

---

# Chương 5 — Nội dung, cấu hình & biến môi trường

Chương ngắn nhưng quan trọng: học cách **tách những thứ hay thay đổi ra khỏi code**.

## 🌍 Ẩn dụ: Bảng thực đơn thay được, không phải xây lại nhà hàng

Khi nhà hàng đổi giá món hay thêm món, bạn **thay tờ thực đơn** — không đập đi xây lại nhà hàng. Tương
tự, nội dung website (chữ, giá, số điện thoại) nên tách riêng để đổi dễ, không phải "xây lại" code.

## ⚙️ Nguyên lý 1: Tách nội dung khỏi code

Trong AgeWell, **toàn bộ chữ** (cả tiếng Việt và tiếng Anh) nằm trong **một file dữ liệu**:
`src/content-data.js`. Code (các component) chỉ *hiển thị* nội dung từ file đó, không *chứa* chữ.

```
src/content-data.js          src/sections/*.jsx
   { vi: {...}, en: {...} } ──────▶ component đọc và hiển thị
   (NỘI DUNG — dễ đổi)              (CODE — ít đổi)
```

Lợi ích:
- Đổi một câu chữ → chỉ sửa `content-data.js`, không đụng logic → ít rủi ro.
- **Song ngữ**: cùng một code hiển thị được cả `vi` lẫn `en` — chỉ đổi dữ liệu đầu vào.
- Người không chuyên kỹ thuật cũng sửa được chữ (chỉ cần cẩn thận cú pháp).

> Đây là lý do tài liệu Developer Guide nói: phần lớn yêu cầu của BD chỉ là sửa `content-data.js`.

## ⚙️ Nguyên lý 2: Biến môi trường (environment variables)

Một số giá trị **thay đổi tuỳ môi trường** (chạy ở máy local hay chạy thật trên AWS). Ví dụ: địa chỉ
của API. Ta không hard-code (ghi chết) nó vào code, mà dùng **biến môi trường**.

Ẩn dụ: cùng một lá đơn, nhưng "địa chỉ gửi về" điền khác nhau tuỳ bạn đang ở văn phòng hay ở nhà.

Trong AgeWell:
- `VITE_API_BASE` — địa chỉ backend API.
  - Khi chạy **local**: để trống → form gọi qua proxy tới backend local.
  - Khi **build production**: đặt `https://api.compassagewell.com` → form gọi API thật.
- File `.env.example` ghi mẫu các biến; `.env.local` chứa giá trị thật cho máy bạn (gitignored).

```
   CODE (src/api.js)
   fetch(`${VITE_API_BASE}/api/lead`)   ← VITE_API_BASE được "điền" lúc build
        │
   ┌────┴─────────────────────┐
   │ local:  ""  → /api/lead   │ (proxy về backend local :8787)
   │ prod:   https://api...     │ (API thật trên AWS)
   └──────────────────────────┘
```

## 📁 Trong dự án: vì sao form local từng báo lỗi

Bạn đã gặp tình huống thật: form chạy được trên live nhưng local báo "Gửi không thành công". Lý do
chính là biến môi trường + chỗ gửi:
- Live: `VITE_API_BASE` = API thật → gửi được.
- Local (lúc đầu): không có backend chạy → không có chỗ gửi.

Sau đó bạn dựng **full local stack** (backend + database chạy trên máy) và đặt `.env.local` để form
local gọi đúng backend local. Đó chính là "tách cấu hình theo môi trường" trong thực tế.

## 🔬 Đào sâu: vì sao biến `VITE_` đặc biệt?

Vite chỉ "nhúng" vào code frontend những biến môi trường bắt đầu bằng `VITE_`. Đây là **biện pháp an
toàn**: frontend chạy trên máy khách → mọi thứ nhúng vào đó công khai. Nếu lỡ nhúng một mật khẩu
database vào frontend → cả thế giới đọc được. Quy ước `VITE_` buộc bạn cố ý chọn cái gì được công
khai. Mật khẩu/bí mật thật chỉ nằm ở **backend** và **GitHub Secrets** (Chương 12), không bao giờ ở frontend.

## ⚠️ Cạm bẫy

- **Hard-code giá trị môi trường**: ghi chết `https://api.compassagewell.com` vào code → không chạy
  được ở local, khó đổi. Dùng biến môi trường.
- **Đổi tên key trong `content-data.js`**: component đọc theo tên key (vd `hero.title`). Đổi tên key
  mà không sửa component → vỡ giao diện. Chỉ đổi *giá trị*, giữ nguyên *tên*.
- **Quên cập nhật cả `vi` và `en`**: thêm chữ mới phải có ở cả hai ngôn ngữ, nếu không một ngôn ngữ sẽ thiếu.
- **Commit `.env.local`**: chứa cấu hình/bí mật cục bộ → đã gitignore, đừng ép commit.

## ✅ Tự kiểm tra

1. Vì sao tách nội dung ra `content-data.js` thay vì viết thẳng chữ trong component?
2. Biến môi trường giải quyết vấn đề gì? Cho ví dụ `VITE_API_BASE` ở local vs production.
3. Vì sao Vite chỉ nhúng biến bắt đầu bằng `VITE_`? Điều này liên quan gì tới bảo mật?
4. Khi form chạy ở live mà lỗi ở local, nguyên nhân gốc thường là gì?

---

# PHẦN III — ĐƯA LÊN MÂY

# Chương 6 — Cloud Computing & AWS

## 🌍 Ẩn dụ: Thuê căn hộ thay vì xây nhà

Để chạy website cho cả thế giới truy cập, bạn cần **máy chủ luôn bật, kết nối Internet mạnh, điện ổn
định, an ninh tốt**. Hai cách:

1. **Tự mua máy chủ + đặt ở nhà/văn phòng**: như **tự xây nhà** — tốn tiền lớn ngay từ đầu, tự lo
   điện/mạng/bảo trì/an ninh, muốn mở rộng phải mua thêm máy. Cứng nhắc, rủi ro.
2. **Thuê hạ tầng trên mây (cloud)**: như **thuê căn hộ** — trả tiền theo dùng, nhà cung cấp lo
   điện/mạng/bảo trì, cần lớn hơn thì nâng cấp gói trong vài phút. Linh hoạt.

**Cloud computing** = thuê tài nguyên máy tính (máy chủ, lưu trữ, mạng, database) qua Internet, trả
theo mức dùng. **AWS** (Amazon Web Services) là nhà cung cấp cloud lớn nhất thế giới — và là nơi
website của bạn đang chạy.

## ⚙️ Nguyên lý: vì sao cloud thắng thế

- **Không vốn lớn ban đầu**: không mua máy chủ vài nghìn đô. Trả vài chục đô/tháng theo dùng.
- **Co giãn (scale)**: 10 khách hay 10.000 khách, tăng/giảm tài nguyên trong vài phút.
- **Toàn cầu**: AWS có trung tâm dữ liệu khắp thế giới (gọi là **region**). Bạn chọn `us-east-1`
  (Virginia, Mỹ) vì khách hàng Medicare ở Mỹ.
- **Dịch vụ sẵn có**: thay vì tự dựng database, email, cân bằng tải... bạn dùng dịch vụ AWS làm sẵn.
- **Bảo mật & độ tin cậy**: Amazon lo phần cứng, điện, mạng, phòng cháy... ở mức mà cá nhân khó đạt.

## ⚙️ Các dịch vụ AWS dùng trong AgeWell (giải thích từng cái)

AWS có hàng trăm dịch vụ. Dự án bạn dùng một nhóm nhỏ. Đây là "vai" của từng cái:

| Dịch vụ | Là gì | Ẩn dụ | Trong dự án |
|---|---|---|---|
| **ECS Fargate** | Chạy container (website) | Đội nhân viên phục vụ | Chạy nginx phục vụ trang tĩnh |
| **ECR** | Kho chứa image Docker | Nhà kho chứa "hộp" đóng gói | Lưu image website mỗi lần build |
| **ALB** | Cân bằng tải + cổng vào | Quầy lễ tân phân khách | Nhận HTTPS, chuyển vào ECS |
| **Lambda** | Chạy hàm khi có sự kiện | Nhân viên gọi-mới-tới làm | Xử lý form lead |
| **API Gateway** | Cổng cho API | Tổng đài tiếp nhận cuộc gọi | Nhận POST /api/lead |
| **DynamoDB** | Database NoSQL | Kho hồ sơ | Lưu danh sách lead |
| **SES** | Gửi email | Bưu tá | Email báo lead mới cho BD |
| **ACM** | Cấp chứng chỉ HTTPS | Cơ quan cấp dấu niêm phong | Ổ khoá xanh cho domain |
| **S3** | Lưu trữ file/object | Kho lưu trữ khổng lồ | Lưu trạng thái Terraform |
| **IAM** | Quản lý quyền truy cập | Hệ thống thẻ ra vào | Ai/cái gì được làm gì |

Đừng cố nhớ hết ngay. Mỗi cái sẽ xuất hiện lại ở chương liên quan. Điều cần nắm: **mỗi dịch vụ làm
một việc, ghép lại thành hệ thống hoàn chỉnh**.

## 📁 Trong dự án: tài khoản & vùng của bạn

- **AWS account**: `381492229787` (một con số định danh tài khoản).
- **Region**: `us-east-1` (mọi dịch vụ của bạn đặt ở đây).
- **IAM user**: `agewell-admin` (danh tính bạn dùng để điều khiển AWS từ máy local).

Khi chạy `aws sts get-caller-identity`, bạn thấy đúng 3 thông tin này — đó là cách AWS xác nhận
"bạn là ai" trước khi cho làm gì.

## 🔬 Đào sâu: IAM — trái tim của bảo mật AWS

**IAM** (Identity and Access Management) là hệ thống quyết định **ai được làm gì** trên AWS. Đây là
khái niệm quan trọng nhất về bảo mật cloud.

- **User**: một danh tính người dùng (vd `agewell-admin`).
- **Role**: một "vai" có thể được "đeo" tạm thời bởi user hoặc dịch vụ khác (vd role để GitHub Actions
  đeo khi deploy — `agewell-github-deploy`).
- **Policy**: tờ giấy phép ghi rõ "được làm hành động X trên tài nguyên Y".

Nguyên tắc vàng: **least privilege** (đặc quyền tối thiểu) — chỉ cấp đúng quyền cần, không hơn. Ví dụ
Lambda xử lý form chỉ được quyền `PutItem` (ghi) vào đúng bảng `agewell-leads`, không được xoá, không
đụng bảng khác. Nếu Lambda bị khai thác, thiệt hại bị giới hạn.

> Bạn đã gặp IAM thật khi: tạo user `agewell-admin`, và khi mở rộng quyền cho role deploy để CI tự
> chạy Terraform (Chương 11-12).

## ⚠️ Cạm bẫy

- **Để lộ Access Key**: chìa khoá AWS (access key) bị lộ = ai đó dùng tài khoản bạn → hoá đơn khổng
  lồ. Không bao giờ commit key lên Git. Dự án bạn dùng **OIDC** (Chương 12) để CI không cần lưu key.
- **Cấp quyền quá rộng**: tiện lúc đầu nhưng nguy hiểm. Càng ít quyền càng an toàn.
- **Quên region**: tạo tài nguyên nhầm region → "không thấy" chúng khi tìm ở region khác. Luôn nhất
  quán `us-east-1`.
- **Không theo dõi chi phí**: cloud trả theo dùng → quên tắt tài nguyên = tốn tiền âm thầm (Chương 15).

## ✅ Tự kiểm tra

1. Vì sao thuê cloud thường tốt hơn tự mua máy chủ cho dự án như AgeWell?
2. Kể vai trò của 5 dịch vụ AWS bất kỳ trong dự án.
3. IAM là gì? Phân biệt user, role, policy. "Least privilege" nghĩa là gì?
4. Vì sao region quan trọng, và dự án bạn dùng region nào?

---

# Chương 7 — Container & Docker

## 🌍 Ẩn dụ: Container vận tải

Trước khi có **container vận tải** (thùng sắt tiêu chuẩn), hàng hoá được chất lên tàu lộn xộn — mỗi
loại hàng một kiểu, bốc dỡ chậm, dễ hỏng. Container thay đổi tất cả: **mọi hàng được đóng vào thùng
tiêu chuẩn**, cần cẩu/tàu/xe tải nào cũng xử lý được giống nhau, bất kể bên trong là gì.

**Docker** mang ý tưởng đó vào phần mềm: đóng gói ứng dụng + mọi thứ nó cần (thư viện, cấu hình, hệ
điều hành thu nhỏ) vào một **container** tiêu chuẩn. Container đó chạy **giống hệt nhau** ở mọi nơi —
máy bạn, máy đồng nghiệp, hay máy chủ AWS.

## ⚙️ Vấn đề Docker giải quyết: "máy tôi chạy được mà!"

Kinh điển trong lập trình: code chạy tốt trên máy người này nhưng lỗi trên máy người khác, vì khác
phiên bản thư viện, khác hệ điều hành, khác cấu hình. Docker xoá bỏ vấn đề này: container chứa **mọi
thứ** → môi trường giống hệt nhau ở mọi nơi. "Chạy được trên máy tôi" trở thành "chạy được ở mọi máy".

## ⚙️ Image vs Container — bản thiết kế vs ngôi nhà

Hai khái niệm dễ nhầm:
- **Image**: bản mẫu đóng băng, chỉ đọc — như **khuôn đúc** hoặc **bản thiết kế**. Bạn build một lần.
- **Container**: một thực thể đang chạy, tạo ra *từ* image — như **ngôi nhà** đúc từ khuôn. Từ một
  image có thể chạy nhiều container giống nhau.

```
   Dockerfile  ──build──▶  Image  ──run──▶  Container (đang chạy)
   (công thức)            (khuôn)          (nhiều bản chạy được)
```

## ⚙️ Dockerfile — công thức đóng gói

**Dockerfile** là file ghi các bước để tạo image. Dockerfile của AgeWell dùng kỹ thuật **multi-stage**
(nhiều giai đoạn) — một mẹo quan trọng:

```
Giai đoạn 1 (build):   dùng Node → chạy `npm run build` → ra thư mục dist/
Giai đoạn 2 (serve):   dùng nginx → copy dist/ vào → phục vụ file tĩnh
```

Vì sao 2 giai đoạn? Vì công cụ *build* (Node, npm, mã nguồn) rất nặng nhưng **chỉ cần lúc build**. Sản
phẩm cuối chỉ cần các file tĩnh + nginx. Multi-stage cho phép **vứt bỏ** mọi thứ của giai đoạn 1, chỉ
giữ kết quả → image cuối nhỏ gọn, nhanh, an toàn (ít thứ thừa = ít lỗ hổng).

> Mở file `Dockerfile` ở gốc repo, bạn thấy đúng 2 khối `FROM node...` và `FROM nginx...`.

## ⚙️ nginx — người phục vụ file tĩnh

**nginx** (đọc: "engine-x") là một web server nhẹ, cực nhanh, chuyên **phục vụ file tĩnh**. Trong
container, nó nhận request và trả về `index.html`, CSS, JS. File `nginx.conf` cấu hình nó:
- **SPA fallback**: mọi đường dẫn lạ đều trả `index.html` (vì website là Single Page Application).
- **/healthz**: một đường dẫn trả "ok" để ALB kiểm tra container còn sống không (Chương 8).
- **gzip, cache headers, security headers**: nén nội dung, cho phép cache, thêm bảo mật.

## 📁 Trong dự án: bạn đã chạy container thật trên máy

Bạn đã build và chạy container ngay trên máy mình để kiểm thử:
```
docker build -t web:test .          # đóng gói thành image "web:test"
docker run -d -p 8099:80 web:test   # chạy container, ánh xạ cổng 8099 → 80
curl http://localhost:8099/healthz  # → trả 200 (container sống)
```
Image y hệt cái này sau đó được đẩy lên ECR và chạy trên ECS. **Đóng-gói-một-lần, chạy-mọi-nơi** —
đúng triết lý Docker.

Ngoài ra, **DynamoDB Local** trong full local stack cũng chạy bằng Docker (`docker compose`) — một ví
dụ khác: bạn chạy database trên máy mà không cần cài đặt phức tạp, chỉ cần một container.

## 🔬 Đào sâu: cổng (port) và ánh xạ cổng

Trong `-p 8099:80`, số `80` là cổng container lắng nghe (nginx mặc định cổng 80), `8099` là cổng trên
máy bạn để truy cập. **Port** giống số phòng trong một toà nhà: cùng địa chỉ IP nhưng nhiều dịch vụ
phân biệt nhau bằng số cổng. Web thường dùng cổng 80 (HTTP) và 443 (HTTPS).

Trong production, ALB lắng nghe cổng 443 (HTTPS) từ Internet, rồi chuyển vào container ở cổng 80
(HTTP nội bộ) — mã hoá ở vòng ngoài, nội bộ AWS thì không cần.

## ⚠️ Cạm bẫy

- **Nhầm image với container**: image là khuôn (tĩnh), container là bản chạy (động). Build tạo image;
  run tạo container.
- **Image quá to**: nhét cả công cụ build vào image cuối → nặng, chậm, nhiều lỗ hổng. Dùng multi-stage.
- **Quên `.dockerignore`**: nếu không loại `node_modules`, `.git`... khỏi quá trình build, image phình
  to và chậm. Dự án có file `.dockerignore` để tránh.
- **Sửa trong container đang chạy**: vô nghĩa — container nên là "dùng xong vứt". Muốn đổi → sửa code →
  build image mới → chạy lại. (Gọi là "immutable" — bất biến.)

## ✅ Tự kiểm tra

1. Docker giải quyết vấn đề "máy tôi chạy được mà" thế nào?
2. Phân biệt image và container (theo ẩn dụ khuôn/nhà).
3. Vì sao Dockerfile của bạn dùng multi-stage? Lợi ích là gì?
4. nginx làm gì trong container? `/healthz` để làm gì?

---

# Chương 8 — Chạy container trên mây: ECS Fargate + ALB

Giờ ta đưa container từ máy bạn lên đám mây để cả thế giới truy cập.

## 🌍 Ẩn dụ: Đội nhân viên + quầy lễ tân

Hình dung một cửa hàng đông khách:
- **Quầy lễ tân (ALB)**: khách vào đều qua đây. Lễ tân *phân phối* khách tới nhân viên đang rảnh,
  *kiểm tra* nhân viên nào còn khoẻ (không ốm), và là *bộ mặt an ninh* (kiểm tra giấy tờ = HTTPS).
- **Đội nhân viên (ECS tasks)**: những người thật sự phục vụ khách. Có thể 1 người, có thể nhiều
  người giống hệt nhau. Một người nghỉ thì người khác gánh.
- **Quản lý ca (ECS service)**: đảm bảo luôn đủ số nhân viên trực. Ai nghỉ ốm thì gọi người thay.

## ⚙️ Các khái niệm ECS

**ECS** (Elastic Container Service) là dịch vụ AWS để **chạy và quản lý container**. Các tầng:

- **Task**: một container đang chạy (một "nhân viên"). Trong AgeWell: một bản nginx phục vụ web.
- **Task Definition**: bản mô tả cách chạy task — dùng image nào, bao nhiêu CPU/RAM, cổng nào. Như
  "bản mô tả công việc" của nhân viên.
- **Service**: đảm bảo luôn có đúng số task chạy (vd `desiredCount = 1`). Task chết → service tự khởi
  động task mới. Đây là "quản lý ca".
- **Cluster**: nhóm logic chứa các service (vd cluster `agewell`).

**Fargate** là chế độ chạy ECS mà bạn **không cần quản máy chủ bên dưới** — AWS lo hết phần cứng. Bạn
chỉ nói "chạy container này với ngần này CPU/RAM", Fargate lo phần còn lại. (Ngược lại là EC2, bạn tự
quản máy — phức tạp hơn.)

## ⚙️ ALB — Application Load Balancer

**ALB** đứng giữa Internet và các container, làm 3 việc:

1. **Cổng vào HTTPS**: nhận kết nối mã hoá từ ngoài (dùng chứng chỉ ACM), giải mã, chuyển vào trong.
   Còn redirect HTTP (cổng 80) → HTTPS (cổng 443).
2. **Cân bằng tải (load balancing)**: nếu có nhiều task, ALB chia request đều cho chúng → không task
   nào quá tải.
3. **Health check**: định kỳ gọi `/healthz` của mỗi task. Task không trả "ok" → ALB ngừng gửi khách
   tới nó (coi như "ốm"), chỉ gửi tới task khoẻ.

```
   Internet (HTTPS :443)
        │
        ▼
   ┌─────────┐   health check: gọi /healthz mỗi 30s
   │   ALB   │ ─────────────────────────────────────▶ task khoẻ? gửi khách
   └─────────┘
        │  chia request
    ┌───┴───┐
    ▼       ▼
  task1   task2   ... (ECS service giữ đủ số lượng)
```

## ⚙️ Vì sao cần ≥1 task và health check?

- **≥1 task**: phải có ít nhất một bản chạy thì website mới sống. Muốn an toàn cao (HA — High
  Availability) thì ≥2 task ở 2 khu vực khác nhau, một cái chết vẫn còn cái kia.
- **Health check**: đảm bảo ALB chỉ gửi khách tới task thật sự hoạt động. Đây là cơ chế **tự phục
  hồi**: task lỗi → bị loại khỏi vòng phục vụ → service khởi động task mới → hệ thống tự lành.

> Bạn đã thấy thật: khi kiểm tra, `runningCount: 1, desiredCount: 1` và ALB target `healthy`. Lúc
> deploy, ALB chờ task mới `healthy` rồi mới chuyển khách sang — nên người dùng không bị gián đoạn
> (zero-downtime deploy).

## 📁 Trong dự án: deploy một phiên bản mới diễn ra thế nào

Khi bạn merge code, đây là vũ điệu "rolling deployment":
```
1. Image mới được build & đẩy lên ECR
2. ECS service tạo task MỚI từ image mới
3. ALB health-check task mới → đợi nó "healthy"
4. ALB chuyển dần khách sang task mới
5. Task CŨ bị tắt
→ Suốt quá trình, luôn có task phục vụ → khách không thấy gián đoạn
```

## 🔬 Đào sâu: vì sao tách ALB và ECS?

Có thể hỏi: sao không để container tự nhận request từ Internet? Vì tách ra cho ta:
- **Bảo mật**: container (task) nằm trong mạng riêng, chỉ ALB được nói chuyện với nó (qua security
  group). Internet không chạm thẳng vào container.
- **Linh hoạt**: thêm/bớt task mà địa chỉ ngoài (ALB) không đổi. Khách luôn vào một cửa.
- **Chứng chỉ tập trung**: HTTPS xử lý ở ALB một chỗ, container không cần lo mã hoá.

Đây là một **security group** thực tế trong dự án: nhóm `alb` mở cổng 443 ra Internet; nhóm `ecs` chỉ
cho phép traffic *từ nhóm alb*. Tức container chỉ nhận khách qua ALB, không đường nào khác.

## ⚠️ Cạm bẫy

- **Chỉ 1 task = một điểm chết duy nhất**: nếu task đó chết và chưa kịp khởi động lại, site down vài
  giây. Với traffic thấp thì chấp nhận được; muốn chắc thì tăng lên ≥2 (Chương 15).
- **Health check sai đường dẫn**: nếu `/healthz` không trả 200, ALB tưởng task ốm và không gửi khách →
  site "chết" dù container vẫn chạy. Phải khớp cấu hình nginx và ALB.
- **Quên rằng Fargate tính tiền theo thời gian chạy**: task chạy 24/7 → tốn tiền cố định. ALB cũng
  vậy. Đây là chi phí chính của dự án (~25-30 USD/tháng — Chương 15).

## ✅ Tự kiểm tra

1. Phân biệt task, task definition, service, cluster (theo ẩn dụ nhân viên/quản lý ca).
2. Fargate khác gì so với tự quản máy chủ?
3. ALB làm 3 việc gì? Health check để làm gì?
4. Vì sao deploy phiên bản mới không làm gián đoạn người dùng (zero-downtime)?

---

# PHẦN IV — DỮ LIỆU & BACKEND ĐỘNG

# Chương 9 — Database: nơi cất dữ liệu

## 🌍 Ẩn dụ: Tủ hồ sơ

**Database** (cơ sở dữ liệu) là nơi lưu trữ dữ liệu **lâu dài và có tổ chức** — như một tủ hồ sơ
khổng lồ. Khác với biến trong code (mất khi tắt máy), dữ liệu trong database **tồn tại mãi** cho tới
khi bạn xoá. Khi một lead được lưu, nó còn đó tháng sau, năm sau.

## ⚙️ Hai trường phái: SQL và NoSQL

Có hai loại database chính, khác nhau ở cách tổ chức dữ liệu:

### SQL (database quan hệ) — như bảng tính Excel chặt chẽ
- Dữ liệu xếp thành **bảng có cột cố định** (mỗi hàng phải đủ các cột định sẵn).
- Các bảng **liên kết** với nhau (vd bảng "khách" liên kết bảng "đơn hàng").
- Mạnh khi dữ liệu có quan hệ phức tạp, cần truy vấn linh hoạt.
- Ví dụ: PostgreSQL, MySQL. Phải định nghĩa **schema** (cấu trúc cột) trước.

### NoSQL — như tủ ngăn kéo linh hoạt
- Dữ liệu lưu dạng **document/item** linh hoạt, mỗi món có thể có field khác nhau.
- Cực nhanh và dễ co giãn cho dữ liệu đơn giản, lượng lớn.
- Ví dụ: **DynamoDB** (của AWS). **Schemaless** — không bắt định nghĩa cột trước.

## ⚙️ Vì sao AgeWell chọn DynamoDB?

Dữ liệu lead rất đơn giản: tên, điện thoại, dịch vụ quan tâm, thời gian. Không có quan hệ phức tạp.
Với nhu cầu đó, DynamoDB lý tưởng:
- **Serverless**: không cần dựng/quản máy chủ database. AWS lo hết.
- **Trả theo dùng** (PAY_PER_REQUEST): traffic thấp thì gần như miễn phí.
- **Tự co giãn**: 10 lead hay 10 triệu lead, không cần cấu hình lại.
- **Đơn giản**: hợp với dữ liệu dạng "danh sách bản ghi".

> Nếu sau này làm EMR (hồ sơ bệnh án) với dữ liệu quan hệ phức tạp, ta sẽ cân nhắc SQL (PostgreSQL/
> RDS) — đúng công cụ cho đúng việc. Không có database "tốt nhất", chỉ có "hợp nhất với bài toán".

## ⚙️ "Schemaless" nghĩa là gì — và vì sao quan trọng với bạn

DynamoDB chỉ bắt bạn định nghĩa **khoá chính (primary key)** — cách định danh duy nhất mỗi bản ghi.
Trong AgeWell, khoá chính là `leadId` (một mã ngẫu nhiên duy nhất cho mỗi lead). Ngoài khoá chính,
mỗi bản ghi muốn có field gì cũng được, không cần khai báo trước.

Hệ quả thực tế **rất quan trọng** cho việc quản lý sau này:
- **Thêm một field mới** (vd thêm `email` vào lead) → **KHÔNG cần đổi cấu trúc database**. Chỉ cần sửa
  code Lambda ghi thêm field đó. Bản ghi cũ không có `email` vẫn ổn; bản ghi mới có thêm.
- **Chỉ khi đổi khoá chính hoặc thêm "chỉ mục" (index)** mới thật sự là "đổi cấu trúc".

Đây là lý do tài liệu nhắc: thêm field thì dễ (sửa code), nhưng đổi khoá chính thì nguy hiểm (phải
tạo lại bảng = mất dữ liệu).

## ⚙️ Index — "mục lục" để tìm nhanh

Mặc định DynamoDB tìm bản ghi qua khoá chính (`leadId`). Nhưng nếu muốn tìm "tất cả lead có số điện
thoại X", quét cả bảng thì chậm. **Global Secondary Index (GSI)** là một "mục lục phụ" cho phép tìm
nhanh theo field khác (vd `phone`). Hiện dự án chưa cần GSI, nhưng cấu trúc đã sẵn sàng thêm khi cần.

## 📁 Trong dự án: schema 1 nguồn

Một điểm thiết kế đẹp bạn đã làm: cấu trúc bảng được định nghĩa ở **một file duy nhất**
`backend/lead-handler/table-schema.json`. Cả database local (khi dev) lẫn database thật (Terraform
tạo) đều đọc từ file này → **không bao giờ lệch nhau**.

```
backend/lead-handler/table-schema.json   (NGUỒN DUY NHẤT)
        │
   ┌────┴─────────────────────────┐
   ▼                              ▼
create-local-table.mjs        infra/backend.tf
(tạo bảng ở DynamoDB Local)   (tạo bảng thật trên AWS)
```

Mở file đó ra: bạn thấy `tableName`, `hashKey: "leadId"`, danh sách `attributes`, và `globalSecondaryIndexes`
(rỗng). Muốn thêm GSI sau này → chỉ sửa file này → cả local và live tự cập nhật (qua quy trình GitOps).

## 🔬 Đào sâu: một bản ghi lead trông như thế nào

Khi form gửi, Lambda lưu một item vào DynamoDB dạng:
```json
{
  "leadId": "266be7b5-2caa-4b4a-9ad6-745aea0b6628",
  "name": "Nguyễn Văn A",
  "phone": "408-555-1234",
  "services": ["Telehealth", "CCM"],
  "message": "...",
  "lang": "vi",
  "source": "website",
  "createdAt": "2026-06-16T04:52:15.000Z"
}
```
`leadId` được sinh ngẫu nhiên (UUID) để duy nhất. `createdAt` là dấu thời gian. Bạn xem được mọi bản
ghi bằng lệnh `aws dynamodb scan --table-name agewell-leads` (đã dùng thật khi kiểm tra form).

## ⚠️ Cạm bẫy

- **Đổi khoá chính trên bảng có dữ liệu thật**: Terraform sẽ **xoá + tạo lại bảng → mất sạch dữ liệu**.
  Đây là cảnh báo lớn nhất với database. Luôn xem kỹ `terraform plan` (Chương 11) — nếu thấy "destroy"
  trên bảng có data, DỪNG LẠI.
- **Tưởng schemaless = không cần kỷ luật**: dễ thêm field, nhưng nếu mỗi nơi đặt tên field khác nhau
  (`phone` vs `phoneNumber`) → dữ liệu lộn xộn. Vẫn cần nhất quán.
- **Quét toàn bảng (scan) khi dữ liệu lớn**: chậm và tốn kém. Khi cần tìm theo field khác → dùng GSI.
- **Quên backup**: dữ liệu là tài sản. Dự án đã bật **point-in-time recovery** (khôi phục theo thời
  điểm) cho bảng lead — một dạng backup tự động.

## ✅ Tự kiểm tra

1. Phân biệt SQL và NoSQL. Vì sao AgeWell chọn DynamoDB cho lead?
2. "Schemaless" nghĩa là gì? Thêm field mới có cần đổi cấu trúc database không?
3. Hành động nào với database là nguy hiểm (mất dữ liệu)? Làm sao phát hiện trước?
4. Vì sao định nghĩa schema ở một file duy nhất lại quan trọng?

---

# Chương 10 — Serverless: Lambda & API Gateway

## 🌍 Ẩn dụ: Nhân viên gọi-mới-tới vs nhân viên trực ca

Hai cách bố trí nhân viên xử lý việc:
- **Nhân viên trực ca cố định** (server truyền thống): luôn có mặt 24/7, trả lương cả khi không có
  việc. Như ECS task chạy liên tục.
- **Nhân viên gọi-mới-tới** (serverless/Lambda): chỉ xuất hiện *khi có việc*, làm xong biến mất, chỉ
  trả tiền cho thời gian thật sự làm. Nếu cả ngày không ai gọi → không tốn đồng nào.

Với form đăng ký — thỉnh thoảng mới có người gửi — kiểu "gọi-mới-tới" lý tưởng: không phí tiền nuôi
một máy chủ chạy suốt chỉ để chờ vài cú submit mỗi ngày.

## ⚙️ Serverless & AWS Lambda

**Serverless** (không-máy-chủ) không có nghĩa là "không có máy chủ" — mà là **bạn không phải quản lý
máy chủ**. AWS tự động chạy code của bạn khi cần, tự co giãn, tự tắt.

**AWS Lambda** là dịch vụ serverless: bạn đưa lên một **hàm** (function), AWS chạy nó **mỗi khi có sự
kiện kích hoạt**. Trong AgeWell, sự kiện là "có ai POST tới `/api/lead`". Mỗi lần như vậy, Lambda
`agewell-lead-handler` chạy một lần để xử lý lead đó.

```
   Không ai gửi form  →  Lambda KHÔNG chạy  →  0 đồng
   Có người gửi form  →  Lambda chạy 1 lần  →  trả tiền cho ~vài trăm ms
```

## ⚙️ API Gateway — cổng cho API

Lambda tự nó không có địa chỉ web. Cần một "cổng" để Internet gọi tới nó. Đó là **API Gateway** —
nhận request HTTP từ ngoài và chuyển cho Lambda.

```
   Form (frontend)
        │  POST https://api.compassagewell.com/api/lead
        ▼
   ┌──────────────┐      ┌──────────┐      ┌────────────┐
   │ API Gateway  │─────▶│  Lambda  │─────▶│  DynamoDB  │
   │ (cổng API)   │      │ (xử lý)  │      │ (lưu)      │
   └──────────────┘      └────┬─────┘      └────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │   SES    │ (gửi email báo BD)
                        └──────────┘
```

## ⚙️ CORS — vì sao trình duyệt "khó tính"

Một khái niệm bạn sẽ gặp: **CORS** (Cross-Origin Resource Sharing). Vì lý do bảo mật, trình duyệt
**mặc định chặn** một trang web ở domain này gọi API ở domain khác. Trang `compassagewell.com` gọi
`api.compassagewell.com` là "khác origin" → bị chặn, trừ khi API **cho phép rõ ràng**.

API Gateway của bạn được cấu hình CORS cho phép đúng origin `https://compassagewell.com`. Đây là lý
do nếu cấu hình CORS sai, form sẽ báo lỗi gửi dù backend vẫn chạy. (Bạn đã thấy ghi chú này trong
Developer Guide phần debug form.)

## 📁 Trong dự án: hành trình đầy đủ của một lead

Ghép mọi thứ Chương 9-10 lại, đây là đường đi thật khi bác lớn tuổi bấm "Gửi đăng ký":

```
1. Frontend (src/api.js) gửi POST tới https://api.compassagewell.com/api/lead
2. API Gateway nhận, kiểm CORS, chuyển cho Lambda
3. Lambda (backend/lead-handler/index.mjs):
   • kiểm tra tên + điện thoại hợp lệ (không tin frontend)
   • kiểm honeypot (loại bot)
   • sinh leadId ngẫu nhiên
   • ghi vào DynamoDB (bảng agewell-leads)
   • gọi SES gửi email báo BD (admin@compass247.vn)
   • trả {"ok": true, "leadId": "..."}
4. Frontend nhận "ok" → hiện màn hình cảm ơn
```

Bạn đã kiểm chứng thật: `curl POST .../api/lead` trả `{"ok":true,"leadId":"..."}`, rồi `scan` thấy
bản ghi trong DynamoDB.

## 🔬 Đào sâu: cùng một file code chạy 2 nơi

Một điểm tinh tế: file `backend/lead-handler/index.mjs` chạy **cả ở local lẫn production** mà không
sửa gì. Bí quyết là **biến môi trường** (Chương 5):
- Production: không có biến `DYNAMODB_ENDPOINT` → Lambda dùng DynamoDB thật trên AWS.
- Local: đặt `DYNAMODB_ENDPOINT=http://localhost:8000` → cùng code đó ghi vào DynamoDB Local.

Đây là nguyên tắc hay: **một code, nhiều môi trường, khác nhau ở cấu hình**. Nó đảm bảo cái bạn test ở
local chính xác là cái chạy thật — không có chuyện "local khác live".

## ⚠️ Cạm bẫy

- **Cold start**: Lambda lâu không chạy thì lần gọi đầu hơi chậm (vài trăm ms) vì phải "khởi động
  nguội". Với form thì không đáng kể, nhưng cần biết.
- **CORS cấu hình sai**: nguyên nhân #1 khiến form "không gửi được" dù backend ổn. Luôn kiểm origin
  được phép.
- **Tin tưởng dữ liệu từ form**: Lambda PHẢI kiểm tra lại (Chương 2). Frontend có thể bị bỏ qua.
- **Lambng phình code**: Lambda nên nhỏ gọn, một việc. Nhồi quá nhiều logic vào một hàm → khó bảo trì.

## ✅ Tự kiểm tra

1. Serverless/Lambda khác server truyền thống ở điểm nào về chi phí và vận hành?
2. API Gateway đóng vai trò gì giữa form và Lambda?
3. CORS là gì? Vì sao nó có thể khiến form báo lỗi gửi?
4. Vì sao cùng một file `index.mjs` chạy được cả local lẫn production?

---

# PHẦN V — TỰ ĐỘNG HOÁ & VẬN HÀNH

> Đây là phần biến bạn từ "người có một website" thành "người vận hành chuyên nghiệp". Bốn chương này
> là linh hồn của cách làm hiện đại.

# Chương 11 — Infrastructure as Code (Terraform)

## 🌍 Ẩn dụ: Bản vẽ xây nhà vs xây theo trí nhớ

Hai cách dựng hạ tầng AWS (máy chủ, mạng, database...):

1. **Bấm tay trên giao diện AWS** (Console): như xây nhà theo trí nhớ — bấm chỗ này, kéo chỗ kia. Vấn
   đề: không ai nhớ chính xác đã bấm gì; muốn dựng lại y hệt thì khổ; sai sót khó tìm; không có lịch sử.
2. **Mô tả hạ tầng bằng file code** (Infrastructure as Code): như có **bản vẽ kỹ thuật đầy đủ**. Mọi
   thứ ghi rõ trong file. Muốn dựng lại → chạy một lệnh. Muốn biết đã đổi gì → xem lịch sử Git. Sửa sai
   → sửa file.

**Terraform** là công cụ Infrastructure as Code (IaC) phổ biến nhất. Bạn **mô tả** hạ tầng mong muốn
trong các file `.tf`, Terraform **tạo ra** nó trên AWS đúng như mô tả.

## ⚙️ Nguyên lý: khai báo "trạng thái mong muốn"

Điểm hay nhất của Terraform: bạn không viết "các bước làm", bạn viết **trạng thái cuối mong muốn**.
Ví dụ: "tôi muốn có một bảng DynamoDB tên `agewell-leads` với khoá `leadId`". Terraform tự figure out
phải tạo/sửa/xoá gì để đạt trạng thái đó. Đây gọi là **declarative** (khai báo), ngược với
**imperative** (ra lệnh từng bước).

```
   Bạn viết (file .tf):              Terraform làm:
   "muốn có bảng X,                  • so sánh: hiện có gì vs muốn gì
    có ALB Y,           ──────────▶  • tính ra: cần tạo/sửa/xoá gì
    có Lambda Z..."                  • thực hiện để khớp mong muốn
```

## ⚙️ Ba khái niệm cốt lõi của Terraform

### 1. State (trạng thái) — sổ ghi "hiện có gì"
Terraform cần biết **hiện tại đang có gì** để so với mong muốn. Nó ghi vào một file **state**. State
là "bộ nhớ" của Terraform. Dự án bạn lưu state trên **S3** (`agewell-tfstate-...`) + khoá chống ghi
đè đồng thời bằng DynamoDB. Lưu trên cloud để nhiều người/máy (vd CI) cùng dùng chung một state.

### 2. plan & apply — xem trước rồi mới làm
- `terraform plan`: **xem trước** Terraform định làm gì, KHÔNG thực hiện. In ra "sẽ tạo X, sửa Y, xoá
  Z". An toàn tuyệt đối (chỉ đọc).
- `terraform apply`: **thực hiện** các thay đổi đó.

Quy tắc vàng: **luôn `plan` và đọc kỹ trước khi `apply`**. Đặc biệt để ý dòng `destroy` (xoá) — nhất
là trên database.

> Bạn đã thấy thật: `Plan: 39 to add, 0 to change, 0 to destroy` khi dựng lần đầu, và sau này `Plan:
> 2 to add, 1 to change, 0 to destroy`. Con số `0 to destroy` là dấu hiệu an toàn.

### 3. Provider — cầu nối tới nhà cung cấp
Terraform nói chuyện với AWS, Cloudflare... qua các **provider** (trình điều khiển). Dự án bạn dùng
provider `aws` (tạo tài nguyên AWS) và `cloudflare` (tạo bản ghi DNS) — một file Terraform quản cả hai.

## 📁 Trong dự án: hạ tầng của bạn là code

Thư mục `infra/` chứa toàn bộ hạ tầng dưới dạng file, chia theo nhóm cho dễ đọc:
```
infra/
  versions.tf   → khai báo provider + nơi lưu state
  variables.tf  → các biến đầu vào (region, domain, email...)
  network.tf    → VPC, subnet, security group (mạng)
  alb.tf        → load balancer + listener
  ecs.tf        → cluster, service, task (chạy container)
  ecr.tf        → kho image
  backend.tf    → DynamoDB + Lambda + API Gateway
  acm.tf        → chứng chỉ HTTPS
  dns.tf        → bản ghi Cloudflare
  oidc.tf       → quyền cho GitHub Actions deploy
  outputs.tf    → các giá trị xuất ra sau khi tạo (ARN, URL...)
```

Toàn bộ 39 tài nguyên AWS + DNS của bạn được mô tả ở đây. Nếu mai có ai xoá nhầm cả tài khoản AWS,
bạn chỉ cần `terraform apply` để dựng lại y hệt. Đó là sức mạnh của IaC.

## 🔬 Đào sâu: vì sao IaC là "chuyên nghiệp"

- **Tái lập (reproducible)**: dựng môi trường giống hệt bất cứ lúc nào. Không "tài liệu lỗi thời" —
  code CHÍNH LÀ tài liệu, luôn đúng vì nó là thứ chạy thật.
- **Lịch sử & review**: mọi thay đổi hạ tầng đi qua Git → xem được ai đổi gì, vì sao, và review trước.
- **Không "drift"**: nếu ai bấm tay đổi gì đó, `terraform plan` sẽ phát hiện "thực tế khác mong muốn".
- **An toàn**: `plan` cho xem trước, tránh đổi nhầm.

Đây chính là lý do dự án bạn quản hạ tầng bằng Terraform thay vì bấm tay trên AWS Console.

## ⚠️ Cạm bẫy

- **Sửa tay trên Console rồi quên**: tạo "drift" giữa thực tế và code. Nguyên tắc: **chỉ đổi hạ tầng
  qua Terraform**, đừng bấm tay.
- **Mất file state**: state là bộ nhớ của Terraform. Mất nó → Terraform "quên" đang quản gì. Vì vậy
  lưu trên S3 (bền, có version), không để trên máy cá nhân.
- **Apply mà không đọc plan**: có thể vô tình xoá tài nguyên production. LUÔN đọc plan, soi dòng destroy.
- **Commit secret vào .tf**: token, mật khẩu không ghi thẳng vào file. Dùng biến + biến môi trường
  (`TF_VAR_...`). Dự án bạn làm đúng: token Cloudflare truyền qua biến môi trường, không nằm trong file.

## ✅ Tự kiểm tra

1. IaC giải quyết vấn đề gì so với bấm tay trên AWS Console?
2. "Declarative" nghĩa là gì? Bạn mô tả trạng thái mong muốn hay các bước làm?
3. State, plan, apply, provider — mỗi cái là gì?
4. Vì sao luôn phải đọc `terraform plan` trước khi `apply`? Dòng nào nguy hiểm nhất?

---

# Chương 12 — CI/CD & GitHub Actions

## 🌍 Ẩn dụ: Dây chuyền nhà máy tự động

Tưởng tượng làm bánh thủ công: nhào bột, nướng, đóng gói, giao hàng — mỗi bước làm tay, dễ quên, dễ
sai, mệt. Giờ thay bằng **dây chuyền tự động**: nguyên liệu vào một đầu, bánh đóng hộp ra đầu kia, máy
tự làm mọi bước, đều đặn, không quên, không mệt.

**CI/CD** là dây chuyền tự động đó cho phần mềm. Mỗi khi bạn đẩy code, một dây chuyền tự chạy: kiểm
tra → build → đóng gói → triển khai. Không còn "deploy bằng tay" dễ sai.

## ⚙️ CI và CD là gì

- **CI** (Continuous Integration — Tích hợp liên tục): mỗi khi có code mới, **tự động kiểm tra** nó có
  ổn không (lint, build, test). Bắt lỗi sớm, trước khi lên production.
- **CD** (Continuous Deployment — Triển khai liên tục): sau khi kiểm tra xong, **tự động đưa lên** môi
  trường thật.

Gộp lại: từ lúc bạn merge code đến lúc nó chạy thật, **không cần thao tác tay nào** — máy lo hết.

## ⚙️ GitHub Actions — công cụ CI/CD của dự án

**GitHub Actions** chạy các "dây chuyền" (gọi là **workflow**) ngay trên GitHub, kích hoạt bởi sự
kiện Git (push, mở PR, merge). Cấu trúc:
- **Workflow**: một dây chuyền, định nghĩa trong file `.yml` ở `.github/workflows/`.
- **Job**: một công đoạn lớn (có thể chạy song song hoặc nối tiếp).
- **Step**: một bước nhỏ trong job (chạy một lệnh).
- **Trigger**: sự kiện kích hoạt (vd "khi push vào main", "khi mở PR").

## 📁 Trong dự án: ba workflow của bạn

```
.github/workflows/
  ci.yml      → chạy khi MỞ PR: lint + build + docker + terraform PLAN (xem trước)
  deploy.yml  → chạy khi MERGE vào main: terraform APPLY → build image → ECS → Lambda
  infra.yml   → chạy THỦ CÔNG (cửa thoát hiểm): terraform plan/apply khi cần
```

**`ci.yml`** — người gác cổng. Khi bạn mở PR, nó tự:
- `npm run lint` + `npm run build` (code có ổn không?)
- Docker build (đóng gói được không?)
- `terraform plan` → comment kết quả vào PR (hạ tầng sẽ đổi gì?)

**`deploy.yml`** — dây chuyền triển khai. Khi merge vào main, nó chạy 2 job NỐI TIẾP:
1. Job `infra`: `terraform apply` (cập nhật hạ tầng/database) — chạy TRƯỚC.
2. Job `deploy`: build image → đẩy ECR → cập nhật ECS + Lambda.

Thứ tự này có chủ đích: nếu thay đổi gồm cả hạ tầng mới lẫn code mới, hạ tầng phải sẵn sàng trước.

## ⚙️ OIDC — đăng nhập AWS không cần lưu mật khẩu

Đây là một khái niệm bảo mật quan trọng và tinh tế. Để GitHub Actions deploy lên AWS, nó cần "đăng
nhập" AWS. Cách cũ: lưu access key (mật khẩu) trong GitHub. Rủi ro: key bị lộ = tai hoạ.

Cách hiện đại — **OIDC** (OpenID Connect): GitHub và AWS thiết lập một mối **tin cậy** trực tiếp. Khi
workflow chạy, GitHub cấp một "vé tạm thời" chứng minh "đây đúng là workflow của repo compass247/
Agewell". AWS kiểm vé, cấp quyền tạm thời. **Không có mật khẩu nào được lưu** ở đâu cả.

```
   GitHub Actions          AWS
        │  "tôi là workflow của repo compass247/Agewell" (vé OIDC ký số)
        │ ───────────────────▶
        │                     kiểm vé → đúng repo tin cậy?
        │  ◀─────────────────  cấp quyền tạm thời (role agewell-github-deploy)
        ▼
   deploy được, không cần lưu access key
```

Đây là lý do trong dự án bạn không có access key AWS nào nằm trong GitHub — chỉ có một **role** mà
GitHub được phép "đeo" tạm thời.

## ⚙️ Secrets & Variables — nơi cất thông tin cấu hình

Workflow cần một số thông tin: tên cluster, ARN role, token Cloudflare... Chia hai loại:
- **Variables** (biến): thông tin không nhạy cảm (vd `AWS_REGION = us-east-1`, `ECS_CLUSTER = agewell`).
- **Secrets** (bí mật): thông tin nhạy cảm, được mã hoá, không hiện ra log (vd `CLOUDFLARE_API_TOKEN`,
  `AWS_DEPLOY_ROLE_ARN`).

Bạn đã set chúng thật qua `gh secret set` và `gh variable set`.

## 🔬 Đào sâu: vì sao tách `ci.yml` và `deploy.yml`?

- `ci.yml` chạy trên **PR** (trước khi vào main) — nhiệm vụ là **kiểm tra & xem trước**, không thay
  đổi gì thật (chỉ `terraform plan`, không `apply`). An toàn để chạy trên mọi đề xuất thay đổi.
- `deploy.yml` chạy trên **main** (sau khi đã review & merge) — nhiệm vụ là **thực thi** (apply +
  deploy thật).

Tách ra để: thay đổi được kiểm tra kỹ trên PR trước, chỉ khi merge (đã duyệt) mới thật sự đụng
production. Đây là nền tảng của GitOps (Chương 14).

## ⚠️ Cạm bẫy

- **Lưu access key trong GitHub**: lỗi bảo mật cổ điển. Dùng OIDC.
- **In secret ra log**: cẩn thận không `echo` secret trong workflow — nó sẽ lộ trong log.
- **CI chậm/không tin cậy**: nếu kiểm thử hay đỏ vô lý, người ta sẽ bỏ qua nó → mất tác dụng. Giữ CI
  nhanh và đáng tin.
- **Deploy không có kiểm tra**: CD mà không có CI (kiểm tra) trước = tự động đưa lỗi lên production
  nhanh hơn. Luôn kiểm trước khi triển khai.

## ✅ Tự kiểm tra

1. CI và CD mỗi cái lo việc gì? Vì sao cần cả hai?
2. Workflow, job, step, trigger — phân biệt.
3. OIDC giúp gì cho bảo mật? Vì sao không cần lưu access key AWS trong GitHub?
4. Vì sao `ci.yml` chỉ `plan` còn `deploy.yml` mới `apply`?

---

# Chương 13 — Domain, DNS & HTTPS

Chương này nối lại Chương 1 (Internet) với hạ tầng thật của bạn, ở mức chi tiết.

## 🌍 Ẩn dụ: Địa chỉ nhà + biển hiệu + con dấu

- **Domain** (`compassagewell.com`) = cái tên dễ nhớ, như tên cửa hàng.
- **DNS** = danh bạ dịch tên → địa chỉ máy chủ thật, như tổng đài chỉ đường.
- **Bản ghi DNS** = từng dòng trong danh bạ ("tên này → đi tới đâu").
- **HTTPS/chứng chỉ** = con dấu niêm phong chứng minh "đúng là cửa hàng thật, không phải giả mạo".

## ⚙️ Các loại bản ghi DNS

DNS có nhiều loại "bản ghi". Hai loại bạn dùng:
- **A record**: trỏ tên → một **địa chỉ IP cố định** (vd `compassagewell.com → 52.1.2.3`).
- **CNAME record**: trỏ tên → **một tên khác** (vd `compassagewell.com → agewell-alb-xxx.elb.amazonaws.com`).

## ⚙️ Vì sao AgeWell phải dùng CNAME (không phải A)?

Đây là một chi tiết kỹ thuật thực tế bạn đã gặp. **ALB không có IP cố định** — AWS có thể đổi IP của
nó bất cứ lúc nào. Nếu bạn dùng A record trỏ tới một IP, hôm sau IP đổi → website chết.

Giải pháp: dùng **CNAME** trỏ tới *tên* của ALB (`agewell-alb-xxx.elb.amazonaws.com`). Tên này cố
định; AWS lo việc tên đó luôn trỏ đúng IP hiện tại. Bạn "chỉ tên, không chỉ số".

```
   compassagewell.com ──CNAME──▶ agewell-alb-xxx.elb.amazonaws.com ──▶ (IP thật, AWS tự quản)
```

## ⚙️ HTTPS & chứng chỉ ACM

Để có ổ khoá xanh, server cần **chứng chỉ SSL/TLS** chứng minh danh tính. Dự án bạn dùng **AWS ACM**
(Certificate Manager) cấp chứng chỉ **miễn phí** cho `compassagewell.com` + `www` + `api`.

Nhưng ACM phải chắc bạn **thật sự sở hữu** domain trước khi cấp. Cách chứng minh: **DNS validation** —
ACM yêu cầu bạn tạo một bản ghi DNS đặc biệt; nếu tạo được, nghĩa là bạn kiểm soát domain. Terraform
tự động tạo bản ghi này trên Cloudflare → ACM xác nhận → cấp chứng chỉ.

> Bạn đã thấy bước này thật: lúc `terraform apply`, nó "chờ" ở bước `aws_acm_certificate_validation`
> vài phút — đó là lúc ACM kiểm tra bản ghi DNS để xác nhận quyền sở hữu.

## ⚙️ Cloudflare: proxy vs DNS-only

Cloudflare có thể hoạt động 2 chế độ cho mỗi bản ghi:
- **DNS-only** (mây xám): Cloudflare chỉ chỉ đường, traffic đi thẳng tới ALB. Đơn giản.
- **Proxied** (mây cam): traffic đi *qua* Cloudflare trước (thêm CDN, chống DDoS...) rồi mới tới ALB.

Dự án bạn dùng **DNS-only** cho đơn giản — để ALB tự xử lý HTTPS bằng chứng chỉ ACM. Nếu bật proxy,
cần cấu hình thêm để chứng chỉ khớp (đã ghi chú trong tài liệu).

## 📁 Trong dự án: DNS của bạn

Trong `infra/dns.tf` và `infra/backend.tf`, Terraform tạo các bản ghi Cloudflare:
- `compassagewell.com` + `www` → CNAME tới ALB (xem website).
- `api.compassagewell.com` → CNAME tới API Gateway (gửi form).
- Vài bản ghi validation cho ACM (tự động, tạm thời).

Zone ID của bạn: `15d3366808d02cb9a99b043c8e245a10` (định danh "vùng" domain trên Cloudflare).

## 🔬 Đào sâu: vì sao tách `api.` thành subdomain riêng?

Website (`compassagewell.com`) chạy trên ALB→ECS, còn API (`api.compassagewell.com`) chạy trên API
Gateway→Lambda — **hai hệ thống khác nhau**. Tách thành subdomain riêng cho phép mỗi cái trỏ tới đúng
nơi, độc lập. Frontend gọi `api.compassagewell.com` để gửi form, trong khi người dùng xem web ở domain
chính. Sạch sẽ và dễ quản.

## ⚠️ Cạm bẫy

- **Dùng A record cho ALB**: sẽ chết khi AWS đổi IP. Luôn dùng CNAME cho ALB.
- **Quên DNS propagation**: đổi DNS không tức thời, chờ vài phút tới vài giờ. Đừng hoảng.
- **Bật Cloudflare proxy mà không chỉnh SSL**: có thể gây lỗi chứng chỉ. Nếu bật proxy, đặt SSL mode
  "Full (strict)".
- **Chứng chỉ hết hạn**: ACM tự gia hạn nếu bản ghi validation còn đó. Đừng xoá các bản ghi đó.

## ✅ Tự kiểm tra

1. Domain, DNS, bản ghi DNS, chứng chỉ — mỗi cái là gì (theo ẩn dụ địa chỉ/biển hiệu/con dấu)?
2. Vì sao ALB phải dùng CNAME chứ không A record?
3. ACM "DNS validation" hoạt động thế nào để chứng minh bạn sở hữu domain?
4. Vì sao API tách thành `api.compassagewell.com` riêng?

---

# Chương 14 — GitOps & quy trình chuyên nghiệp

Đây là chương tổng hợp — ghép mọi thứ đã học thành một **quy trình vận hành hoàn chỉnh**. Đây chính
là điều khiến một dự án trở nên "chuyên nghiệp".

## 🌍 Ẩn dụ: Sổ cái duy nhất của một ngân hàng

Trong ngân hàng nghiêm túc, **mọi giao dịch phải ghi vào sổ cái chính thức** — không ai được lén sửa
số dư trực tiếp. Sổ cái là **nguồn chân lý duy nhất**: muốn biết tài khoản có bao nhiêu, đọc sổ cái.
Muốn đổi, phải ghi một bút toán mới (có người duyệt), không phải tẩy xoá.

**GitOps** áp dụng đúng nguyên tắc đó cho hệ thống phần mềm: **Git là sổ cái duy nhất**. Trạng thái
hệ thống (code + hạ tầng + cấu hình) = đúng những gì ghi trong Git. Muốn đổi gì → ghi vào Git (qua
PR, có duyệt) → hệ thống tự cập nhật theo. Không ai "lén" đổi thẳng trên production.

## ⚙️ Nguyên lý GitOps

Bốn ý cốt lõi:
1. **Mọi thứ là code trong Git**: code ứng dụng, hạ tầng (Terraform), cấu hình, schema database — tất
   cả đều trong repo.
2. **Git là nguồn chân lý**: trạng thái thật của hệ thống phải khớp với Git. Không sửa tay ngoài Git.
3. **Thay đổi qua Pull Request**: mọi thay đổi đề xuất qua PR → được kiểm tra (CI) và review trước.
4. **Tự động đồng bộ**: khi merge vào main, hệ thống tự cập nhật để khớp Git (CI/CD apply).

## ⚙️ Vòng đời đầy đủ của MỘT thay đổi (trong dự án bạn)

Đây là quy trình bạn đã thiết lập và chạy thật. Hãy nắm thật kỹ — đây là cách bạn sẽ làm việc mãi về sau:

```
1. local: tạo nhánh        git checkout -b feature/doi-gi-do
          sửa code/infra/db
          test tại chỗ      npm run dev + full local stack

2. push nhánh + mở PR       git push -u origin feature/...
                            gh pr create

3. CI tự chạy trên PR (ci.yml):
   • lint + build           ← code có ổn?
   • docker build           ← đóng gói được?
   • terraform plan         ← hạ tầng/DB sẽ đổi gì? (comment vào PR)
   → BẠN REVIEW: đọc plan, soi dòng "destroy", chắc chắn an toàn

4. branch protection gác cổng:
   • bắt buộc qua PR (không push thẳng main)
   • bắt buộc 3 check xanh mới merge được

5. merge vào main           bấm merge trên GitHub

6. deploy.yml tự chạy:
   • job infra:  terraform apply (cập nhật hạ tầng + DB)   ← TRƯỚC
   • job deploy: build image → ECR → ECS + Lambda          ← SAU
   → live cập nhật, zero-downtime

7. live đã đồng bộ với Git
```

## 📁 Trong dự án: bạn đã chứng kiến nó hoạt động

Bạn đã làm thật toàn bộ vòng này: tạo PR #1 (thay đổi GitOps), thấy CI chạy `terraform plan` và
comment "0 to destroy" vào PR, merge, rồi xem `deploy.yml` chạy 2 job nối tiếp (`infra` rồi `deploy`),
và verify website + form vẫn hoạt động. Đó không phải lý thuyết — đó là quy trình sống của dự án bạn.

## ⚙️ Branch protection — người gác cổng

Để GitOps an toàn, bạn đã bật **branch protection** trên nhánh `main`:
- **Không push thẳng** vào main → mọi thay đổi phải qua PR.
- **Bắt buộc CI xanh** (3 check: lint/build, docker, terraform plan) mới merge được.
- **Up-to-date**: nhánh phải cập nhật mới nhất trước khi merge.

Đây là lớp bảo vệ con người + máy: máy chặn merge nếu kiểm thử đỏ; con người review plan trước khi
bấm merge. Hai lớp này khiến việc "tự động apply hạ tầng" trở nên an toàn — không lo một cú merge sai
phá production.

## 🔬 Đào sâu: "staging nhẹ" — vì sao plan trên PR đủ an toàn

Mô hình chuyên nghiệp đầy đủ thường có môi trường **staging** (bản sao production để test). Nhưng nó
tốn tiền gấp đôi (nhân đôi hạ tầng). Dự án bạn dùng cách tiết kiệm thông minh: **`terraform plan`
trên PR làm "bản xem trước"**. Trước khi bất cứ thay đổi hạ tầng nào chạm production, bạn thấy chính
xác nó sẽ làm gì. Với quy mô hiện tại, đây là cân bằng tốt giữa an toàn và chi phí. Khi lớn lên (EMR,
nhiều dev), thêm staging đầy đủ — kiến trúc đã sẵn sàng cho việc đó.

## ⚙️ "Local = bản sao live" — vì sao quan trọng

Một trụ cột của GitOps là: cái bạn test ở local phải **giống** cái chạy thật. Dự án bạn đạt điều này:
- Cùng code frontend (Vite), cùng code backend (`index.mjs` chạy cả 2 nơi).
- Database local (DynamoDB Local) tạo từ **cùng một schema** với production.
- Cùng cách đóng gói (Docker).

Nhờ vậy, "chạy được ở local" thật sự có nghĩa là "sẽ chạy được ở live" — không còn bất ngờ khi deploy.

## ⚠️ Cạm bẫy

- **Sửa tay trên production**: phá vỡ GitOps. Production phải luôn khớp Git. Cần đổi → đổi qua Git.
- **Bỏ qua plan trên PR**: cứ merge bừa → mất tác dụng lưới an toàn. Luôn đọc plan, nhất là database.
- **Auto-apply không có review**: nguy hiểm. Phải có branch protection + người đọc plan.
- **Schema lệch giữa local và live**: nếu định nghĩa 2 nơi, dễ lệch. Dự án bạn đã gộp về 1 nguồn để tránh.

## ✅ Tự kiểm tra

1. "Git là nguồn chân lý duy nhất" nghĩa là gì?
2. Kể đầy đủ vòng đời một thay đổi từ local tới live trong dự án bạn.
3. Branch protection chặn những gì? Vì sao nó làm auto-apply an toàn?
4. Vì sao "local = bản sao live" lại quan trọng, và dự án bạn đạt nó bằng cách nào?

---

# PHẦN VI — TOÀN CẢNH & TƯƠNG LAI

# Chương 15 — Bảo mật, chi phí, giám sát, mở rộng

Chương cuối: những thứ một người **quản lý** dự án cần nắm để vận hành lâu dài và ra quyết định đúng.

## 15.1 — Bảo mật (Security)

Bảo mật không phải một tính năng, mà là **một thói quen xuyên suốt**. Những nguyên tắc bạn đã gặp:

- **Least privilege (đặc quyền tối thiểu)**: cấp đúng quyền cần, không hơn. Lambda chỉ ghi được vào
  đúng bảng lead. Role deploy chỉ repo này đeo được.
- **Không tin client**: backend luôn kiểm tra lại dữ liệu (Chương 2). Honeypot chặn bot.
- **Bí mật không nằm trong code**: token/mật khẩu ở GitHub Secrets + biến môi trường, không commit.
  Frontend không chứa bí mật (chỉ biến `VITE_`).
- **OIDC thay vì access key**: CI deploy không cần lưu mật khẩu AWS.
- **HTTPS khắp nơi**: mã hoá mọi traffic, đặc biệt quan trọng với dữ liệu y tế.
- **Mạng riêng**: container nằm sau ALB, database sau backend — không phơi ra Internet trực tiếp.

**Với hướng EMR tương lai** (hồ sơ bệnh án): bảo mật lên một tầm khác — cần tuân thủ **HIPAA** (luật
bảo vệ thông tin y tế ở Mỹ), ký BAA với AWS, mã hoá dữ liệu nghỉ (at-rest), nhật ký kiểm toán, phân
quyền theo vai trò. Đó là lý do EMR nên là dự án riêng, kiến trúc riêng (đã bàn ở phiên trước).

## 15.2 — Chi phí (Cost)

Cloud trả theo dùng, nên hiểu hoá đơn là kỹ năng quản lý quan trọng. Chi phí AgeWell (~25-30 USD/tháng):

| Thành phần | Chi phí | Vì sao |
|---|---|---|
| ALB | ~16-20 USD/tháng | Chạy 24/7, chi phí cố định chính |
| ECS Fargate (1 task nhỏ) | ~9 USD/tháng | Chạy liên tục |
| Lambda + DynamoDB + API GW | ~0 | Trả theo dùng, traffic thấp → gần miễn phí |
| SES, ECR, S3 | < 1 USD | Rất nhỏ |

Bài học: **chi phí cố định** (ALB, ECS chạy 24/7) là phần chính, không phải traffic. Muốn rẻ hơn nữa
cho site siêu nhỏ: có thể thay bằng S3 + CloudFront (hosting tĩnh) — nhưng mất khả năng chạy container.
Đây là một **đánh đổi kiến trúc** bạn giờ đã đủ hiểu để cân nhắc.

Mẹo quản chi phí:
- Bật **AWS Budgets** để cảnh báo khi vượt ngưỡng (vd > 50 USD/tháng).
- Xem **Cost Explorer** để biết tiền đi đâu.
- Tắt tài nguyên không dùng (vd môi trường test quên tắt).

## 15.3 — Giám sát (Monitoring & Logs)

Khi có sự cố, bạn cần biết **chuyện gì đang xảy ra**. AWS ghi lại mọi thứ vào **CloudWatch**:
- **Logs**: nhật ký từ Lambda và ECS. Lệnh thật bạn dùng được:
  ```
  aws logs tail /aws/lambda/agewell-lead-handler --follow   # log Lambda (form)
  aws logs tail /ecs/agewell-web --follow                   # log web container
  ```
- **Metrics**: số liệu (CPU, RAM, số request, lỗi). Xem để biết hệ thống khoẻ không.
- **Alarms**: cảnh báo tự động (vd "CPU > 80% trong 5 phút thì báo").

Quy tắc khi sự cố: **đọc log trước, đoán sau**. Log thường nói thẳng vấn đề (vd "permission denied",
"table not found"). Developer Guide có mục debug với đúng các lệnh này.

## 15.4 — Mở rộng (Scaling)

Khi website phát triển, bạn mở rộng thế nào? Nhờ kiến trúc hiện tại, phần lớn chỉ là **sửa vài dòng
Terraform → PR → merge**:

- **Nhiều traffic hơn**: tăng `desired_count` (số task ECS) từ 1 lên 2-3, hoặc bật **auto-scaling**
  (tự tăng/giảm theo tải). Sửa trong `infra/variables.tf` / `ecs.tf`.
- **Sẵn sàng cao (HA)**: chạy ≥2 task ở nhiều vùng → một cái chết vẫn còn cái kia.
- **Nhanh hơn cho người dùng xa**: thêm CDN (CloudFront/Cloudflare proxy) để cache gần người dùng.
- **Database lớn**: DynamoDB tự co giãn; nếu cần truy vấn phức tạp → cân nhắc thêm GSI hoặc chuyển SQL.
- **Staging đầy đủ**: khi nhiều dev, dựng môi trường staging riêng (kiến trúc đã sẵn sàng tách).

Nguyên tắc: **đừng tối ưu sớm**. Với traffic thấp, cấu hình hiện tại dư dùng. Đo (CloudWatch) rồi mới
mở rộng đúng chỗ cần — đừng đoán.

## 15.5 — Bạn giờ có thể tự làm gì

Sau khi đọc hết tài liệu này, bạn đã đủ nền để:
- **Hiểu** mọi thành phần hệ thống và cách chúng ghép lại.
- **Đọc** được `terraform plan`, log lỗi, trạng thái deploy — và biết cái gì an toàn, cái gì nguy hiểm.
- **Ra quyết định**: chọn database nào, có cần staging chưa, khi nào scale, đánh đổi chi phí/hiệu năng.
- **Làm việc với dev**: nói cùng ngôn ngữ, review PR có ý nghĩa, giám sát đúng chỗ.
- **Quản lý vòng đời thay đổi**: từ ý tưởng → nhánh → PR → review → merge → live, an toàn.

Bạn không cần tự code mọi thứ. Nhưng giờ bạn **hiểu đủ sâu để làm chủ** — đó mới là điều quan trọng
của một người quản lý kỹ thuật.

## ✅ Tự kiểm tra cuối

1. Kể 4 nguyên tắc bảo mật đã áp dụng trong dự án.
2. Chi phí chính của AgeWell đến từ đâu (cố định hay theo traffic)?
3. Khi website lỗi, bước đầu tiên nên làm gì? Lệnh xem log là gì?
4. Muốn website chịu tải gấp đôi, bạn sửa ở đâu và theo quy trình nào?

---
---

# PHỤ LỤC A — Bảng thuật ngữ (Việt–Anh)

| Thuật ngữ | Tiếng Việt / Giải thích ngắn |
|---|---|
| **Client** | Phía khách — trình duyệt của người dùng, bên *hỏi* |
| **Server** | Máy chủ — bên *trả lời* request |
| **Request / Response** | Yêu cầu / Phản hồi — một cặp hỏi-đáp HTTP |
| **HTTP / HTTPS** | Giao thức truyền web / phiên bản mã hoá (có ổ khoá) |
| **Status code** | Mã trạng thái (200 OK, 404 Not Found, 500 lỗi server...) |
| **DNS** | Hệ thống tên miền — danh bạ dịch tên → địa chỉ máy chủ |
| **Domain** | Tên miền (compassagewell.com) |
| **IP** | Địa chỉ số của máy trên Internet |
| **Frontend** | Giao diện chạy trên trình duyệt khách |
| **Backend** | Logic xử lý chạy trên máy chủ |
| **Database** | Cơ sở dữ liệu — nơi lưu dữ liệu lâu dài |
| **HTML / CSS / JS** | Cấu trúc / Trình bày / Hành vi của trang web |
| **React** | Thư viện xây giao diện bằng component |
| **Component** | Thành phần giao diện tái sử dụng (khối LEGO) |
| **JSX** | Cú pháp viết HTML lồng trong JavaScript (React) |
| **Vite** | Công cụ build frontend (biên dịch + đóng gói) |
| **npm** | Trình quản lý thư viện JavaScript |
| **Git** | Hệ thống quản lý phiên bản mã nguồn |
| **GitHub** | Nền tảng lưu repo Git trên mạng |
| **Repo (repository)** | Kho chứa dự án + lịch sử |
| **Commit** | Một ảnh chụp thay đổi có ghi chú |
| **Branch** | Nhánh — dòng phát triển song song |
| **Merge** | Ghép nhánh vào nhau |
| **Pull Request (PR)** | Đề nghị ghép code + nơi review |
| **Environment variable** | Biến môi trường — cấu hình thay đổi theo nơi chạy |
| **Cloud computing** | Điện toán đám mây — thuê hạ tầng qua Internet |
| **AWS** | Amazon Web Services — nhà cung cấp cloud |
| **Region** | Vùng địa lý của trung tâm dữ liệu AWS (us-east-1) |
| **IAM** | Quản lý danh tính & quyền truy cập AWS |
| **Role / Policy** | Vai trò có thể đeo / Tờ giấy phép quyền |
| **Least privilege** | Đặc quyền tối thiểu — chỉ cấp quyền cần thiết |
| **Container** | Gói ứng dụng tiêu chuẩn chạy mọi nơi giống nhau |
| **Docker** | Công cụ tạo & chạy container |
| **Image** | Khuôn đúc (chỉ đọc) để tạo container |
| **Dockerfile** | Công thức build image |
| **nginx** | Web server nhẹ phục vụ file tĩnh |
| **ECS / Fargate** | Dịch vụ chạy container / chế độ không cần quản máy chủ |
| **Task / Service / Cluster** | Container đang chạy / quản lý số lượng / nhóm chứa |
| **ECR** | Kho chứa image Docker trên AWS |
| **ALB** | Application Load Balancer — cổng vào + cân bằng tải |
| **Health check** | Kiểm tra định kỳ container còn sống không |
| **Zero-downtime deploy** | Triển khai không gián đoạn người dùng |
| **SQL / NoSQL** | DB quan hệ (bảng cố định) / DB linh hoạt |
| **DynamoDB** | Database NoSQL serverless của AWS |
| **Schemaless** | Không cần định nghĩa cấu trúc cột trước |
| **Primary key / Index** | Khoá chính (định danh) / mục lục tìm nhanh |
| **GSI** | Global Secondary Index — mục lục phụ tìm theo field khác |
| **Serverless** | Không phải quản máy chủ — AWS tự chạy khi cần |
| **Lambda** | Dịch vụ chạy hàm theo sự kiện |
| **API Gateway** | Cổng nhận request HTTP cho Lambda |
| **CORS** | Quy tắc trình duyệt chặn gọi API khác domain |
| **SES** | Dịch vụ gửi email của AWS |
| **ACM** | Dịch vụ cấp chứng chỉ HTTPS của AWS |
| **SSL/TLS certificate** | Chứng chỉ bảo mật cho HTTPS (ổ khoá xanh) |
| **S3** | Dịch vụ lưu trữ file/object của AWS |
| **CNAME / A record** | Bản ghi DNS trỏ tới tên khác / tới IP cố định |
| **Cloudflare** | Nơi quản domain + DNS của dự án |
| **Infrastructure as Code (IaC)** | Mô tả hạ tầng bằng file code |
| **Terraform** | Công cụ IaC dùng trong dự án |
| **State** | Bộ nhớ Terraform về "hiện đang có gì" |
| **plan / apply** | Xem trước thay đổi / Thực hiện thay đổi |
| **Provider** | Trình điều khiển Terraform nói chuyện với AWS/Cloudflare |
| **CI/CD** | Tích hợp / Triển khai liên tục (tự động) |
| **GitHub Actions** | Công cụ CI/CD chạy trên GitHub |
| **Workflow / Job / Step** | Dây chuyền / công đoạn / bước |
| **OIDC** | Cơ chế đăng nhập tin cậy không cần lưu mật khẩu |
| **Secret / Variable** | Thông tin nhạy cảm (mã hoá) / không nhạy cảm |
| **GitOps** | Git là nguồn chân lý, mọi thay đổi qua Git, tự đồng bộ |
| **Branch protection** | Quy tắc bảo vệ nhánh main (bắt PR + CI xanh) |
| **Staging** | Môi trường bản sao production để test |
| **HA (High Availability)** | Tính sẵn sàng cao (chịu được sự cố) |
| **CloudWatch** | Dịch vụ log + metrics + cảnh báo của AWS |
| **Honeypot** | Bẫy bot — ô ẩn để phát hiện gửi tự động |

---

# PHỤ LỤC B — Sổ tay lệnh

Các lệnh hay dùng, kèm giải thích. (Tra cứu nhanh — chi tiết xem [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md).)

## Frontend (chạy ở gốc repo)
```bash
npm install        # cài thư viện (lần đầu / sau khi đổi package.json)
npm run dev        # chạy server dev → http://localhost:5173 (tự reload khi sửa)
npm run build      # build production → thư mục dist/
npm run preview    # xem thử bản build (giống production)
npm run lint       # kiểm lỗi code (CI bắt buộc xanh)
```

## Full local stack (test form như live)
```bash
npm run db:up       # bật DynamoDB Local (Docker) + admin UI (:8001)
npm run db:init     # tạo bảng agewell-leads trong DynamoDB Local
npm run backend:dev # chạy backend local (:8787)
npm run dev         # chạy frontend (cửa sổ khác)
npm run db:down     # tắt DynamoDB Local khi xong
```

## Git
```bash
git status                       # xem thay đổi hiện tại
git checkout -b feature/ten      # tạo + chuyển sang nhánh mới
git add -A                       # đưa mọi thay đổi vào "giỏ"
git commit -m "mô tả"            # tạo commit
git push -u origin feature/ten   # đẩy nhánh lên GitHub
git log --oneline -5             # xem 5 commit gần nhất
```

## GitHub CLI (PR & CI)
```bash
gh pr create --fill                              # mở Pull Request
gh pr checks <số PR>                             # xem trạng thái CI của PR
gh pr merge <số PR> --squash --delete-branch     # merge PR
gh run list --workflow deploy.yml --limit 3      # xem các lần deploy gần đây
gh run watch <id>                                # theo dõi một lần chạy
```

## Docker
```bash
docker build -t web:test .              # build image
docker run -d -p 8099:80 web:test       # chạy container (cổng 8099→80)
curl http://localhost:8099/healthz      # kiểm tra container sống
docker ps                               # liệt kê container đang chạy
docker rm -f web-test                   # xoá container
```

## AWS (cần `aws configure` trước)
```bash
aws sts get-caller-identity                              # tôi là ai trên AWS?
aws ecs describe-services --cluster agewell \
    --services agewell-web --region us-east-1            # trạng thái web service
aws dynamodb scan --table-name agewell-leads \
    --region us-east-1                                   # xem các lead đã lưu
aws logs tail /aws/lambda/agewell-lead-handler --follow  # log Lambda (form)
aws logs tail /ecs/agewell-web --follow                  # log web container
```

## Terraform (trong thư mục infra/, cần biến Cloudflare)
```bash
# Đặt token trước (trong terminal của bạn, không commit):
#   $env:TF_VAR_cloudflare_api_token = "..."
#   $env:TF_VAR_cloudflare_zone_id   = "15d3366808d02cb9a99b043c8e245a10"
terraform init -backend-config="bucket=agewell-tfstate-381492229787" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=agewell-tf-lock"
terraform plan -out tf.plan    # XEM TRƯỚC (đọc kỹ, soi dòng destroy)
terraform apply tf.plan        # thực hiện
terraform output               # xem các giá trị xuất ra (ARN, URL...)
```

> ⚠️ Trong GitOps, hầu như KHÔNG cần chạy Terraform tay — nó tự chạy khi merge PR. Các lệnh trên chỉ
> dùng làm "cửa thoát hiểm" hoặc học/debug.

---

# PHỤ LỤC C — Lộ trình học tiếp

Bạn đã có nền vững. Nếu muốn đào sâu từng mảng, đây là hướng đi (theo thứ tự ưu tiên cho người quản lý):

### Ưu tiên 1 — Củng cố nền (1-2 tuần)
- **Git**: làm quen sâu hơn với nhánh, PR, resolve conflict. Tài nguyên: "Pro Git" (sách miễn phí,
  git-scm.com/book), GitHub Skills (skills.github.com — học qua bài tập thực hành).
- **HTTP & Web cơ bản**: MDN Web Docs (developer.mozilla.org) — phần "HTTP" và "How the web works".

### Ưu tiên 2 — Hiểu cloud sâu hơn (2-4 tuần)
- **AWS cơ bản**: khoá "AWS Cloud Practitioner" (chứng chỉ nhập môn, rất hợp người quản lý — hiểu dịch
  vụ + chi phí mà không cần code sâu). aws.amazon.com/training.
- **IAM & bảo mật**: đọc "AWS Well-Architected Framework" phần Security Pillar.

### Ưu tiên 3 — Tự động hoá (2-4 tuần)
- **Terraform**: HashiCorp Learn (developer.hashicorp.com/terraform/tutorials) — hands-on, miễn phí.
- **CI/CD**: tài liệu GitHub Actions chính thức (docs.github.com/actions).
- **Docker**: "Docker Getting Started" (docs.docker.com/get-started).

### Ưu tiên 4 — Cho hướng EMR tương lai
- **HIPAA & AWS**: "Architecting for HIPAA on AWS" (whitepaper của AWS).
- **Database quan hệ (SQL)**: vì EMR cần dữ liệu quan hệ. Học PostgreSQL cơ bản.
- **Kiến trúc hệ thống**: sách "Designing Data-Intensive Applications" (Martin Kleppmann) — kinh điển,
  hơi nặng nhưng giá trị lâu dài.

### Cách học hiệu quả nhất
> **Học trên chính dự án AgeWell của bạn.** Mỗi khi đọc về một khái niệm, mở file/dịch vụ tương ứng
> trong dự án ra xem. Mỗi khi BD yêu cầu thay đổi, tự làm theo quy trình GitOps (nhánh → PR → review →
> merge). Kiến thức gắn với việc thật sẽ nhớ lâu gấp nhiều lần lý thuyết suông.

---

## Lời kết

Bạn bắt đầu dự án này không biết gì về hạ tầng, và giờ bạn sở hữu một website production chạy với
kiến trúc mà nhiều công ty phải thuê cả đội DevOps mới làm được: container trên cloud, serverless
backend, hạ tầng bằng code, CI/CD tự động, GitOps với lưới an toàn. Quan trọng hơn cả việc *có* nó,
giờ bạn *hiểu* nó.

Tài liệu này là bản đồ. Lãnh thổ là dự án thật của bạn. Hãy đi lại nhiều lần — mỗi lần đọc, ghép thêm
một mảnh, bức tranh sẽ ngày càng rõ. Khi gặp khái niệm mới trong tương lai, bạn đã có khung để gắn nó
vào.

Chúc bạn vững vàng làm chủ. 🚀

— *Tài liệu học nền tảng, dự án Compass AgeWell.*
