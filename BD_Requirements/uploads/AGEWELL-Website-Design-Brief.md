# AGEWELL WEBSITE — DESIGN BRIEF
## Date: 02/06/2026 | Designer: Luna | Review: Chị Phương
## Status: FINAL — Bắt đầu thiết kế

---

## 1. TỔNG QUAN DỰ ÁN

| Mục | Nội dung |
|-----|----------|
| Dự án | Website Compass AgeWell |
| Trang build trước | Trang Chủ (/) — single-page scroll, mobile-first |
| Ngôn ngữ | Tiếng Việt (chính), có toggle English |
| Tên miền | compassagewell.com |
| Đối tượng | Người Việt 65+ dùng Medicare Original tại Mỹ + người thân |
| Text sử dụng | Content Mapping L2 đã duyệt (dùng làm text tạm, update khi có L3) |

---

## 2. BRAND GUIDELINES

**Logo:** Compass AgeWell logo (nếu có) hoặc Compass VN từ file `Compass_VN-02.png`

**Màu sắc chính:**
- 🟢 Xanh lá: #26a146 — CTA buttons, điểm nhấn chính
- 🔵 Xanh dương: #007bc3 — links, icon dịch vụ
- 🟠 Cam: #f47d42 — hotline, urgency elements
- Nền: Trắng #FFFFFF + xanh lá pastel #ECF3E0, #EAF4ED (xen kẽ section)

**Font chữ:**
- Tiếng Việt Unicode, hỗ trợ đầy đủ dấu
- Body text: tối thiểu 18px
- Heading: 28-36px, đậm
- Tránh font mảnh hoặc cách điệu
- Gợi ý: Be Vietnam Pro, iCiel, hoặc system font tiếng Việt tốt

**Phong cách thiết kế:**
- Sạch sẽ, tối giản, nhiều khoảng trắng
- Nền sáng/trắng chủ đạo
- Hình ảnh lớn, text overlay tinh tế khi cần
- Tone: chuyên nghiệp, ấm áp, gần gũi

---

## 3. CẤU TRÚC TRANG — 9 SECTION

### SECTION 1 — HERO
- **Nội dung:** Tagline "Chăm sóc sức khỏe tại nhà bằng tiếng Việt" + subhead + CTA button + Hotline
- **Visual:** Hero image người cao tuổi Việt vui vẻ tại nhà, tone ấm. Có thể có người thân bên cạnh. Text overlay trên ảnh, chữ trắng/đậm.
- **Kích thước:** Full-width, chiếm ~80-90% viewport height trên mobile

### SECTION 2 — VẤN ĐỀ
- **Nội dung:** 3 pain points: Đi lại xa xôi / Ngồi chờ hàng giờ / Rào cản ngôn ngữ + bridge dẫn sang dịch vụ
- **Visual:** 3 cột (desktop) hoặc 3 hàng (mobile), mỗi cái có icon + heading + 1-2 dòng text. Icon: xe hơi/đường, đồng hồ, bong bóng hội thoại.
- **Màu nền:** Trắng hoặc pastel nhẹ

### SECTION 3 — BA DỊCH VỤ
- **Nội dung:** 3 service cards: Telehealth / CCM / MTM + link "Tìm hiểu thêm →"
- **Visual:** 3 cards, mỗi card có icon riêng + tiêu đề + 2-3 câu mô tả. Icon: điện thoại, lịch + tim, lọ thuốc. Cards có viền hoặc bóng nhẹ, phân biệt 3 dịch vụ.
- **Layout:** 3 cột ngang (desktop), xếp dọc (mobile)

### SECTION 4 — VÒNG LẶP CHĂM SÓC
- **Nội dung:** Visual loop Khám → Quản lý → Theo dõi → Quay lại + key message
- **Visual:** Infographic vòng tròn hoặc sơ đồ 3 bước. Ba bước nối bằng mũi tên, màu tăng dần: xanh dương → xanh lá → cam. Key message nổi bật dưới visual.
- **Màu nền:** Xanh lá pastel #ECF3E0

### SECTION 5 — USP + ĐỘI NGŨ
- **Nội dung:** 3 USP (Toàn diện, Thấu hiểu, Liên tục) + 3 team roles (Bác sĩ, Dược sĩ, Điều phối viên)
- **Visual:** 
  - USP: 3 icon + mỗi cái tiêu đề + 2-3 câu giải thích. Layout ngang 3 cột.
  - Đội ngũ: 3 avatar/illustration + tên role + 2 câu mô tả. Layout ngang 3 cột.
  - Phân cách rõ ràng giữa phần USP và phần Đội ngũ

### SECTION 6 — ĐIỀU KIỆN & CHI PHÍ
- **Nội dung:** Medicare info + chi phí + 3 FAQ accordion + link "Xem thêm"
- **Visual:**
  - Medicare info: 2 cards phân biệt — Medicare Original (xanh lá, ✅) vs Medicare Advantage (cam nhạt, ❌ hiện chưa hỗ trợ). Kèm icon thẻ Medicare.
  - CTA "Đăng ký tra cứu chi phí": button riêng, xanh lá
  - 3 FAQ accordion: tap để mở, mỗi câu có icon ❓
- **Màu nền:** Trắng

### SECTION 7 — KHÁCH HÀNG NÓI GÌ
- **Nội dung:** Số liệu "Hơn X bệnh nhân..." + testimonial cards [placeholder]
- **Visual:** 
  - Số liệu: chữ lớn, xanh lá, nổi bật
  - Testimonial cards: 2-3 cards, mỗi card có avatar hình tròn + quote ngắn + tên + địa điểm
  - Nếu chưa có testimonial: chỉ hiển thị số liệu, thiết kế sẵn slot cho cards
- **Màu nền:** Pastel nhẹ

### SECTION 8 — FORM ĐĂNG KÝ
- **Nội dung:** 4 fields + nút submit + confirmation + hotline secondary
- **Visual:**
  - Form giữa trang, nền nổi bật (xanh lá rất nhạt), input lớn dễ bấm
  - Radio/checkbox cho dịch vụ: styled lớn, dễ tap trên mobile
  - Nút submit: xanh lá #26a146, chữ trắng, padding rộng
  - Confirmation: thiết kế sẵn trạng thái sau submit (ẩn form, hiện message)
  - Hotline bên dưới form: icon 📞 + số
- **Fields:** Họ tên*, SĐT*, Dịch vụ quan tâm (checkbox 4 lựa chọn), Lời nhắn (optional)

### SECTION 9 — FOOTER
- **Nội dung:** Logo + hotline + chat links + language toggle + nav + disclaimer
- **Visual:** Nền tối hơn (xanh lá đậm hoặc xám), chữ trắng. Disclaimer chữ nhỏ. Links hàng ngang.

---

## 4. STICKY ELEMENTS

### Bottom Bar (mobile) / Floating Button (desktop)
- **Hiển thị:** Luôn luôn, tất cả section
- **Nội dung:** 📞 855-999-9911 | 💬 Zalo · Messenger · WhatsApp · Viber
- **Thiết kế:** Nền xanh lá #26a146, chữ trắng. Mobile: bar full-width bottom. Desktop: pill button góc phải dưới.

### Anchor Menu (sticky top)
- **Hiển thị:** Xuất hiện sau khi scroll qua Hero
- **Nội dung:** Dịch vụ · Vòng lặp · Điều kiện · Đăng ký
- **Thiết kế:** Nền trắng, border-bottom mảnh, chữ xanh lá. Mobile: hàng ngang scrollable. Desktop: fixed top bar.

---

## 5. TONE & CẢM XÚC

| Yếu tố | Mô tả |
|--------|-------|
| Cảm xúc chủ đạo | Ấm áp, tin tưởng, gần gũi |
| Cảm xúc tránh | Lạnh lùng, clinical, quá công nghệ, phức tạp |
| Hình ảnh | Người cao tuổi Việt thật, khoảnh khắc đời thường, gia đình |
| Màu sắc | Ấm (xanh lá, xanh dương, cam), không quá chói |
| Khoảng trắng | Nhiều — nhẹ nhàng, dễ thở |
| Minh họa | Icon đơn giản, dễ hiểu. Tránh icon quá trừu tượng. |

---

## 6. YÊU CẦU KỸ THUẬT

- **Mobile-first:** Thiết kế cho 375-414px trước, desktop scale lên max-width ~1200px
- **Font size:** Body min 18px, input min 16px (tránh iOS zoom)
- **Touch targets:** Tất cả nút/link tối thiểu 44x44px
- **Form:** 4 fields, không CAPTCHA, validation nhẹ nhàng
- **Hình ảnh:** Nén, lazy load, WebP nếu được
- **Animation:** Hạn chế, chỉ dùng fade-in nhẹ khi scroll
- **Không carousel/slider** — người cao tuổi khó tương tác
- **Language toggle:** VI | EN, ở header và footer
- **Sticky bottom bar:** Luôn hiển thị, không che nội dung quan trọng

---

## 7. ASSETS CẦN CHUẨN BỊ

| # | Asset | Loại | Ghi chú |
|---|-------|------|---------|
| 1 | Hero image | Ảnh | Người cao tuổi Việt tại nhà, ấm áp, tự nhiên |
| 2 | Icon đi lại | Icon | Xe hơi hoặc con đường |
| 3 | Icon chờ đợi | Icon | Đồng hồ |
| 4 | Icon ngôn ngữ | Icon | Bong bóng hội thoại |
| 5 | Icon Telehealth | Icon | Điện thoại hoặc video call |
| 6 | Icon CCM | Icon | Lịch + trái tim |
| 7 | Icon MTM | Icon | Lọ thuốc / viên thuốc |
| 8 | Icon Toàn diện | Icon | Vòng tròn khép kín / shield |
| 9 | Icon Thấu hiểu | Icon | Trái tim / bàn tay |
| 10 | Icon Liên tục | Icon | Vòng lặp / đồng hồ chu kỳ |
| 11 | Avatar Bác sĩ | Illustration | Chuyên nghiệp, thân thiện |
| 12 | Avatar Dược sĩ | Illustration | Chuyên nghiệp, thân thiện |
| 13 | Avatar Điều phối viên | Illustration | Chuyên nghiệp, thân thiện |
| 14 | Vòng lặp visual | Infographic | Sơ đồ 3 bước khép kín |
| 15 | Logo AgeWell | Logo | Nếu có; nếu chưa dùng Compass VN |
| 16 | Testimonial avatars | Placeholder | Hình tròn màu pastel + chữ viết tắt |

---

## 8. THAM KHẢO

- **Brand kit:** `brand/compass-vn/Brand_guideline_Compass_VN.pdf`
- **Logo hiện có:** `brand/compass-vn/Compass_VN-02.png`
- **Samples phong cách:** `brand/compass-vn/samples/` (5 ảnh mẫu)
- **Sitemap:** `AGEWELL-Website-Sitemap-L1.md`
- **Content mapping (text tạm):** `AGEWELL-Website-Content-L2.md` (sẽ xuất sau)
- **Cross-link strategy:** `AGEWELL-Website-CrossLink.md`

---

## 9. QUY TRÌNH LÀM VIỆC DESIGN

1. Luna thiết kế từng section → gửi chị Phương review trong thread design
2. Chị Phương feedback → Luna chỉnh sửa → duyệt từng section
3. Sau khi duyệt hết 9 section, Luna ráp thành single-page hoàn chỉnh
4. Test mobile + desktop
5. Bàn giao cho dev (nếu có) hoặc xuất bản
