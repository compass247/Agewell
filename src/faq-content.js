/* ============================================================
   COMPASS AGEWELL — FAQ landing page content (VI / EN)
   VI copy is verbatim from the BD design comp ("AgeWell FAQ
   Landing.dc.html", newer than AGEWELL-FAQ-Sheet-v4); EN is a
   faithful translation. 13 questions in 3 color-coded groups.

   Answer bodies are serializable "blocks" (no JSX — the page body
   is a client component and icons are referenced by name):
   - { type:"p", text, strong?, after? }  plain paragraph; `strong`
     is an inline bold suffix (e.g. the hotline number), `after`
     trailing plain text (e.g. the final period).
   - { type:"cards", items:[{icon,title,text}] }      Q5 services
   - { type:"checklist", title, items:[string] }      Q5 prep box
   - { type:"table", head:[2], rows:[{label,ok,badge,note?}] }  Q6
   - { type:"tip", label, text }                      Q6 blue tip
   - { type:"steps", intro?, items:[{title,text}] }   Q10 timeline
   - { type:"highlight", text }                       Q10 green box

   URL strategy: the static export has no middleware, so localized
   pathnames can't rewrite — each locale gets its own real route
   (both render in either locale; the mismatched combos are
   noindexed via buildFaqMetadata below).
   ============================================================ */
import { SITE_URL, OG_LOCALE } from "./seo.js";

export const FAQ_PATHS = { vi: "/cau-hoi-thuong-gap", en: "/faq" };

export const FAQ_CONTENT = {
  vi: {
    meta: {
      title: "Câu hỏi thường gặp — Compass AgeWell",
      description: "Tất cả câu hỏi thường gặp về Compass AgeWell",
    },
    hero: {
      title: "Những điều anh/chị muốn biết",
      sub: "Tất cả câu hỏi thường gặp về Compass AgeWell",
    },
    groups: [
      {
        id: "sec1",
        num: "01",
        color: "green",
        navLabel: "Tin tưởng",
        title: "Có tin tưởng được không?",
        items: [
          {
            id: "q1",
            q: "Compass AgeWell là ai? Có đáng tin không?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Compass AgeWell là dịch vụ chăm sóc sức khỏe từ xa dành riêng cho người Việt dùng Medicare tại Mỹ. Nằm trong hệ sinh thái của Compass Medical Group (CMG), chúng tôi có đầy đủ giấy phép hoạt động hợp pháp của doanh nghiệp và của đội ngũ y tế tại Mỹ." },
              { type: "p", text: "Toàn bộ đội ngũ đều có thể nói song ngữ Việt – Anh, luôn ưu tiên giao tiếp với anh chị bằng tiếng Việt thân thuộc." },
              { type: "p", text: "Mọi hoạt động của chúng tôi tuân thủ đầy đủ quy định của Medicare và tiêu chuẩn bảo mật HIPAA của liên bang." },
            ],
          },
          {
            id: "q2",
            q: "Bác sĩ có bằng cấp không? Thuốc tôi đang uống có bị đổi không?",
            blocks: [
              { type: "p", text: "Đội ngũ bác sĩ của chúng tôi đều có bằng MD/DO và giấy phép hành nghề tại Hoa Kỳ (US-licensed). Dược sĩ có bằng PharmD, chuyên sâu về quản lý thuốc cho người cao tuổi." },
              { type: "p", text: "Về thuốc anh chị đang uống: Chúng tôi không tự ý thay đổi toa thuốc. Dược sĩ sẽ rà soát toàn bộ để đảm bảo an toàn, phát hiện sớm các tương tác bất lợi hoặc thuốc trùng lặp. Nếu có điều gì cần lưu ý, dược sĩ sẽ trao đổi cẩn thận với anh chị. Quyết định cuối cùng luôn thuộc về anh chị và bác sĩ điều trị của anh chị." },
            ],
          },
          {
            id: "q3",
            q: "Thông tin sức khỏe của tôi có an toàn không?",
            blocks: [
              { type: "p", text: "Hoàn toàn an toàn. Chúng tôi bảo vệ thông tin sức khỏe của anh chị theo tiêu chuẩn HIPAA của liên bang — đạo luật bảo mật y tế nghiêm ngặt nhất tại Hoa Kỳ. Điều này có nghĩa là:" },
              { type: "p", text: "Mọi thông tin sức khỏe anh chị chia sẻ với bác sĩ và dược sĩ của chúng tôi được lưu trữ trong hồ sơ bệnh án riêng, có mã hóa và kiểm soát truy cập chặt chẽ. Không ai có thể xem hồ sơ của anh chị nếu chưa có sự đồng ý bằng văn bản từ anh chị (kể cả người thân trong gia đình)." },
            ],
          },
        ],
      },
      {
        id: "sec2",
        num: "02",
        color: "blue",
        navLabel: "Chi phí & Điều kiện",
        title: "Chi phí & Điều kiện",
        items: [
          {
            id: "q4",
            q: "Tôi có phải trả thêm chi phí nào không? Có phí hàng tháng hoặc copay không?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Dịch vụ của chúng tôi được Medicare Original Part B và Part D chi trả theo quyền lợi bảo hiểm của anh chị. Một số dịch vụ có thể yêu cầu copay tùy theo gói Medicare Original của anh chị." },
              { type: "p", text: "Chúng tôi sẽ kiểm tra và thông báo rõ ràng với anh chị trước khi thực hiện bất kỳ dịch vụ nào. Không có chi phí bất ngờ." },
            ],
          },
          {
            id: "q4b",
            q: "Nếu có copay thì tôi thanh toán như thế nào? Tôi có nhận được hóa đơn không?",
            blocks: [
              { type: "p", text: "Nếu dịch vụ của anh chị có copay, chúng tôi sẽ thông báo rõ ràng với anh chị trước khi thực hiện dịch vụ. Khoản copay sẽ được thanh toán trực tiếp cho Compass AgeWell." },
              { type: "p", text: "Anh chị sẽ luôn nhận được giải thích chi phí rõ ràng từ Medicare (Medicare Summary Notice) và chúng tôi cũng sẽ giải thích nếu anh chị có thắc mắc." },
            ],
          },
          {
            id: "q4c",
            q: "Nếu bảo hiểm của tôi thay đổi thì dịch vụ có bị ảnh hưởng không?",
            blocks: [
              { type: "p", text: "Có thể có ảnh hưởng, tùy vào sự thay đổi cụ thể. Nếu anh chị vẫn giữ Medicare Original Part B và Part D thì dịch vụ tiếp tục bình thường." },
              { type: "p", text: "Nếu anh chị chuyển sang Medicare Advantage (Part C) hoặc thay đổi gói Part D, một số dịch vụ có thể không còn được chi trả. Trong trường hợp đó, chúng tôi sẽ thông báo sớm cho anh chị và cùng anh chị tìm phương án phù hợp. Anh chị nên báo cho chúng tôi biết ngay khi có thay đổi về bảo hiểm để chúng tôi hỗ trợ kịp thời." },
            ],
          },
          {
            id: "q5",
            q: "Tôi có đủ điều kiện tham gia không? Cần chuẩn bị gì?",
            blocks: [
              { type: "p", text: "Điều kiện tham gia tùy theo từng dịch vụ. Anh chị có thể dùng một hoặc nhiều dịch vụ cùng lúc nếu đủ điều kiện." },
              {
                type: "cards",
                items: [
                  { icon: "phone", title: "Khám bệnh từ xa", text: "Từ 65 tuổi, có Part B, cần khám và đánh giá sức khỏe. Bác sĩ gọi điện hoặc video bằng tiếng Việt." },
                  { icon: "heart", title: "Quản lý bệnh mãn tính", text: "Từ 65 tuổi, có Part B, đang sống với ít nhất 2 bệnh mạn tính từ 12 tháng trở lên." },
                  { icon: "pill", title: "Tư vấn thuốc", text: "Quyền lợi bổ sung từ Part D, chạy song song với Quản lý bệnh mãn tính, không cần rời chương trình." },
                ],
              },
              { type: "p", text: "Điều kiện tham gia Tư vấn thuốc do chương trình Part D của anh chị xác định, dựa trên số lượng thuốc đang dùng và bệnh nền liên quan. Đội ngũ Compass sẽ giúp anh chị kiểm tra, anh chị không cần tự xác định." },
              {
                type: "checklist",
                title: "Anh chị cần chuẩn bị những thông tin sau:",
                items: [
                  "Loại Medicare đang dùng — nếu là Medicare Original, có đăng ký thêm Part D không?",
                  "Tiểu bang anh chị đang sinh sống",
                  "Mã số Medicare ID",
                  "Anh chị hiện có bệnh mãn tính nào đang được theo dõi không?",
                  "Anh chị có đang ở cơ sở điều dưỡng chuyên môn (SNF) hoặc chương trình chăm sóc cuối đời (Hospice) không?",
                ],
              },
              { type: "p", text: "Anh chị chỉ cần cung cấp các thông tin trên, đội ngũ chúng tôi sẽ làm phần còn lại." },
            ],
          },
          {
            id: "q5b",
            q: "Tôi đang được Compass theo dõi sức khỏe hàng tháng, có thêm dịch vụ Tư vấn thuốc được không?",
            blocks: [
              { type: "p", text: "Anh chị hoàn toàn có thể sử dụng hai dịch vụ cùng lúc và được cả Medicare Part B và Part D chi trả nếu đủ điều kiện." },
            ],
          },
          {
            id: "q6",
            q: "Tôi cần loại Medicare nào mới dùng được?",
            blocks: [
              {
                type: "table",
                head: ["Loại Medicare", "Có dùng được không?"],
                rows: [
                  { label: "Medicare Original Part B (thẻ đỏ-xanh)", ok: true, badge: "Có", note: "Khám bệnh từ xa & Quản lý bệnh mãn tính" },
                  { label: "Medicare Original Part D (thẻ đỏ-xanh)", ok: true, badge: "Có", note: "Tư vấn thuốc" },
                  { label: "Medicare Advantage (Part C)", ok: false, badge: "Chưa hỗ trợ" },
                  { label: "D-SNP", ok: false, badge: "Chưa hỗ trợ" },
                  { label: "Chưa có Medicare", ok: false, badge: "Chưa đủ điều kiện" },
                ],
              },
              { type: "p", text: "Cách nhận biết đơn giản: thẻ Medicare màu đỏ-xanh là Medicare Original và dùng được. Còn thẻ của công ty bảo hiểm tư nhân như Kaiser, Humana, UnitedHealthcare thường là Medicare Advantage, hiện chúng tôi chưa hỗ trợ." },
              { type: "tip", label: "Gợi ý:", text: "Anh chị không chắc mình thuộc loại nào, cứ gọi cho chúng tôi. Đội ngũ sẽ giúp anh chị xác nhận." },
            ],
          },
        ],
      },
      {
        id: "sec3",
        num: "03",
        color: "orange",
        navLabel: "Trải nghiệm",
        title: "Trải nghiệm & Cam kết",
        items: [
          {
            id: "q7",
            q: "Tôi không rành công nghệ, có dùng được không?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Hoàn toàn dùng được. Anh chị không cần biết gì về công nghệ, không cần cài ứng dụng, không cần biết Zoom hay máy tính." },
              { type: "p", text: "Bác sĩ và điều phối viên chăm sóc sẽ gọi điện thoại trực tiếp cho anh chị, đơn giản như nghe một cuộc gọi thông thường. Nếu lúc nào muốn gặp bác sĩ qua video, con cháu chỉ cần bấm giúp vào đường link chúng tôi gửi qua tin nhắn, chưa tới vài giây là kết nối được ngay." },
              { type: "p", text: "Chúng tôi thiết kế toàn bộ dịch vụ dành riêng cho người cao tuổi, đơn giản và nhẹ nhàng nhất có thể." },
            ],
          },
          {
            id: "q8",
            q: "Tôi có cần bỏ bác sĩ đang khám hiện tại không?",
            blocks: [
              { type: "p", text: "Không. Anh chị vẫn giữ nguyên bác sĩ gia đình (PCP) và các bác sĩ chuyên khoa hiện tại." },
              { type: "p", text: "Compass AgeWell không thay thế ai cả. Chúng tôi đồng hành thêm bên cạnh, giúp anh chị theo dõi sức khỏe đều đặn hàng tháng giữa các lần tái khám định kỳ. Nếu anh chị cho phép, chúng tôi có thể phối hợp với bác sĩ hiện tại bằng cách cập nhật tình trạng sức khỏe định kỳ, chia sẻ kết quả rà soát thuốc nếu phát hiện điều cần lưu ý, và thông báo khi có thay đổi quan trọng. Như vậy bác sĩ của anh chị cũng có thêm thông tin để chăm sóc anh chị tốt hơn." },
            ],
          },
          {
            id: "q9",
            q: "Lỡ tôi muốn dừng không sử dụng dịch vụ nữa thì có bị phạt gì không?",
            blocks: [
              { type: "p", text: "Không có ràng buộc, không có phạt. Anh chị có thể dừng dịch vụ bất kỳ lúc nào, không cần nêu lý do. Quyền lợi Medicare Original của anh chị không bị ảnh hưởng gì." },
              { type: "p", text: "Để dừng, chỉ cần gọi số ", strong: "855-999-9911", after: "." },
            ],
          },
          {
            id: "q10",
            q: "Tôi đồng ý tham gia rồi thì tiếp theo sẽ như thế nào?",
            blocks: [
              {
                type: "steps",
                intro: "Ba bước đơn giản, tất cả ngay tại nhà:",
                items: [
                  { title: "Cung cấp thông tin", text: "Anh chị cung cấp thông tin Medicare và bệnh mãn tính hiện có để chúng tôi kiểm tra điều kiện chi trả." },
                  { title: "Ký đồng ý tham gia", text: "Khi điều kiện được xác nhận, chúng tôi gửi mẫu đồng ý (consent form). Anh chị xem qua và ký tên là hoàn tất." },
                  { title: "Đặt lịch hẹn khám", text: "Nhân viên AgeWell liên hệ để đặt lịch hẹn phù hợp với nhu cầu của anh chị." },
                ],
              },
              { type: "highlight", text: "Không cần đi đâu. Không cần chuẩn bị gì phức tạp. Tất cả qua điện thoại, bằng tiếng Việt." },
              { type: "p", text: "Nếu anh chị cũng quan tâm đến dịch vụ Tư vấn thuốc, trong cuộc gọi đầu tiên điều phối viên sẽ giúp anh chị kiểm tra xem mình có đủ điều kiện không." },
            ],
          },
        ],
      },
    ],
    disclaimer: {
      title: "Thông tin quan trọng",
      text: "Anh chị có quyền từ chối hoặc rút khỏi chương trình chăm sóc bất kỳ lúc nào. Quyền lợi Medicare Original của anh chị sẽ không bị ảnh hưởng. Điều kiện tham gia và chi trả phụ thuộc vào gói Medicare Original của từng khách hàng. Compass AgeWell không được CMS hay bất kỳ cơ quan chính phủ nào xác nhận hay bảo trợ.",
    },
    contactLine: "Compass AgeWell · 855-999-9911",
  },

  /* ===================== ENGLISH ===================== */
  en: {
    meta: {
      title: "FAQ — Compass AgeWell",
      description: "All frequently asked questions about Compass AgeWell",
    },
    hero: {
      title: "What you'd like to know",
      sub: "All frequently asked questions about Compass AgeWell",
    },
    groups: [
      {
        id: "sec1",
        num: "01",
        color: "green",
        navLabel: "Trust",
        title: "Can you trust us?",
        items: [
          {
            id: "q1",
            q: "Who is Compass AgeWell? Can I trust you?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Compass AgeWell is a telehealth care service created especially for Vietnamese Medicare members in the U.S. As part of the Compass Medical Group (CMG) ecosystem, we hold every required business license, and our medical team is fully licensed to practice in the United States." },
              { type: "p", text: "Our entire team is bilingual in Vietnamese and English, and we always put speaking with you in familiar Vietnamese first." },
              { type: "p", text: "Everything we do fully complies with Medicare regulations and the federal HIPAA privacy standard." },
            ],
          },
          {
            id: "q2",
            q: "Are the doctors qualified? Will my current medications be changed?",
            blocks: [
              { type: "p", text: "Our physicians all hold MD/DO degrees and are US-licensed. Our pharmacists hold PharmD degrees and specialize in medication management for older adults." },
              { type: "p", text: "About the medications you are taking: we never change your prescriptions on our own. A pharmacist reviews everything to keep you safe, catching harmful interactions or duplicate medications early. If anything needs attention, the pharmacist will discuss it carefully with you. The final decision always belongs to you and your treating doctor." },
            ],
          },
          {
            id: "q3",
            q: "Is my health information safe?",
            blocks: [
              { type: "p", text: "Completely safe. We protect your health information under the federal HIPAA standard — the strictest medical privacy law in the United States. That means:" },
              { type: "p", text: "Every piece of health information you share with our doctors and pharmacists is stored in your own medical record, encrypted and under strict access control. No one can view your record without your written consent (including family members)." },
            ],
          },
        ],
      },
      {
        id: "sec2",
        num: "02",
        color: "blue",
        navLabel: "Cost & Eligibility",
        title: "Cost & Eligibility",
        items: [
          {
            id: "q4",
            q: "Will I have to pay anything extra? Is there a monthly fee or copay?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Our services are covered by Medicare Original Part B and Part D according to your insurance benefits. Some services may require a copay depending on your Medicare Original plan." },
              { type: "p", text: "We check and let you know clearly before performing any service. No surprise costs." },
            ],
          },
          {
            id: "q4b",
            q: "If there is a copay, how do I pay? Will I receive a bill?",
            blocks: [
              { type: "p", text: "If your service has a copay, we will let you know clearly before the service is performed. The copay is paid directly to Compass AgeWell." },
              { type: "p", text: "You will always receive a clear explanation of costs from Medicare (the Medicare Summary Notice), and we will gladly explain anything you have questions about." },
            ],
          },
          {
            id: "q4c",
            q: "If my insurance changes, will my services be affected?",
            blocks: [
              { type: "p", text: "Possibly, depending on the specific change. If you keep Medicare Original Part B and Part D, your services continue as normal." },
              { type: "p", text: "If you switch to Medicare Advantage (Part C) or change your Part D plan, some services may no longer be covered. In that case, we will notify you early and work with you to find the right option. Please tell us as soon as your insurance changes so we can support you promptly." },
            ],
          },
          {
            id: "q5",
            q: "Am I eligible to join? What do I need to prepare?",
            blocks: [
              { type: "p", text: "Eligibility depends on each service. You can use one or several services at the same time if you qualify." },
              {
                type: "cards",
                items: [
                  { icon: "phone", title: "Telehealth visits", text: "Age 65+, with Part B, needing a health exam and assessment. The doctor calls by phone or video, in Vietnamese." },
                  { icon: "heart", title: "Chronic care management", text: "Age 65+, with Part B, living with at least 2 chronic conditions lasting 12 months or more." },
                  { icon: "pill", title: "Medication counseling", text: "An added benefit from Part D that runs alongside Chronic care management — no need to leave the program." },
                ],
              },
              { type: "p", text: "Eligibility for Medication counseling is determined by your Part D plan, based on the number of medications you take and the related health conditions. The Compass team will check for you — you don't need to work it out yourself." },
              {
                type: "checklist",
                title: "Please have the following information ready:",
                items: [
                  "The type of Medicare you have — if it's Medicare Original, are you also enrolled in Part D?",
                  "The state you live in",
                  "Your Medicare ID number",
                  "Any chronic conditions currently being monitored",
                  "Whether you are in a skilled nursing facility (SNF) or a hospice program",
                ],
              },
              { type: "p", text: "Just provide the information above — our team will take care of the rest." },
            ],
          },
          {
            id: "q5b",
            q: "Compass already monitors my health every month. Can I add the Medication counseling service?",
            blocks: [
              { type: "p", text: "Absolutely — you can use both services at the same time, covered by both Medicare Part B and Part D if you qualify." },
            ],
          },
          {
            id: "q6",
            q: "Which type of Medicare do I need?",
            blocks: [
              {
                type: "table",
                head: ["Type of Medicare", "Can I use the service?"],
                rows: [
                  { label: "Medicare Original Part B (red-white-and-blue card)", ok: true, badge: "Yes", note: "Telehealth visits & Chronic care management" },
                  { label: "Medicare Original Part D (red-white-and-blue card)", ok: true, badge: "Yes", note: "Medication counseling" },
                  { label: "Medicare Advantage (Part C)", ok: false, badge: "Not yet supported" },
                  { label: "D-SNP", ok: false, badge: "Not yet supported" },
                  { label: "No Medicare yet", ok: false, badge: "Not yet eligible" },
                ],
              },
              { type: "p", text: "A simple way to tell: the red-white-and-blue Medicare card is Medicare Original and works with our services. Cards from private insurance companies such as Kaiser, Humana or UnitedHealthcare are usually Medicare Advantage, which we don't support yet." },
              { type: "tip", label: "Tip:", text: "Not sure which type you have? Just call us — our team will help you confirm." },
            ],
          },
        ],
      },
      {
        id: "sec3",
        num: "03",
        color: "orange",
        navLabel: "Experience",
        title: "Experience & Commitment",
        items: [
          {
            id: "q7",
            q: "I'm not good with technology. Can I still use this?",
            defaultOpen: true,
            blocks: [
              { type: "p", text: "Absolutely. You don't need to know anything about technology — no apps to install, no Zoom, no computer skills needed." },
              { type: "p", text: "Your doctor and care coordinator call you directly — as simple as answering a regular phone call. If you'd ever like to see the doctor by video, your children or grandchildren just tap the link we send by text message, and you're connected within seconds." },
              { type: "p", text: "We designed the entire service especially for seniors — as simple and gentle as possible." },
            ],
          },
          {
            id: "q8",
            q: "Do I have to leave my current doctor?",
            blocks: [
              { type: "p", text: "No. You keep your current primary care physician (PCP) and your specialists." },
              { type: "p", text: "Compass AgeWell doesn't replace anyone. We walk alongside you, helping monitor your health steadily every month between your regular check-ups. With your permission, we can coordinate with your current doctor by sharing periodic health updates, medication review findings when something needs attention, and notice of any important changes. That way your doctor also has more information to care for you even better." },
            ],
          },
          {
            id: "q9",
            q: "What if I want to stop using the service — is there any penalty?",
            blocks: [
              { type: "p", text: "No commitments, no penalties. You can stop the service at any time, no reason needed. Your Medicare Original benefits are not affected in any way." },
              { type: "p", text: "To stop, simply call ", strong: "855-999-9911", after: "." },
            ],
          },
          {
            id: "q10",
            q: "I've agreed to join — what happens next?",
            blocks: [
              {
                type: "steps",
                intro: "Three simple steps, all from home:",
                items: [
                  { title: "Share your information", text: "You provide your Medicare information and current chronic conditions so we can verify your coverage eligibility." },
                  { title: "Sign the consent form", text: "Once eligibility is confirmed, we send you a consent form. Review it, sign it, and you're all set." },
                  { title: "Schedule your visit", text: "An AgeWell staff member contacts you to schedule an appointment that fits your needs." },
                ],
              },
              { type: "highlight", text: "No travel. No complicated preparation. Everything happens by phone, in Vietnamese." },
              { type: "p", text: "If you're also interested in the Medication counseling service, the coordinator will help check your eligibility during the very first call." },
            ],
          },
        ],
      },
    ],
    disclaimer: {
      title: "Important information",
      text: "You have the right to decline or withdraw from the care program at any time. Your Medicare Original benefits will not be affected. Eligibility and coverage depend on each member's Medicare Original plan. Compass AgeWell is not endorsed or sponsored by CMS or any government agency.",
    },
    contactLine: "Compass AgeWell · 855-999-9911",
  },
};

export function getFaqContent(lang) {
  return FAQ_CONTENT[lang] || FAQ_CONTENT.vi;
}

// hreflang alternates are cross-slug (per-locale slugs), so the generic
// languageAlternates() from seo.js can't be reused here.
export function faqLanguageAlternates() {
  return {
    "vi-VN": `${SITE_URL}/vi${FAQ_PATHS.vi}`,
    "en-US": `${SITE_URL}/en${FAQ_PATHS.en}`,
    "x-default": `${SITE_URL}/vi${FAQ_PATHS.vi}`,
  };
}

// Is /<lang>/<slug> the canonical URL for that locale? (/vi/cau-hoi-thuong-gap
// and /en/faq are; the mismatched combos /en/cau-hoi-thuong-gap and /vi/faq
// still render — so the LangToggle never 404s — but get noindexed below.)
export function isFaqCanonical(lang, slug) {
  return FAQ_PATHS[lang] === `/${slug}`;
}

// Shared metadata builder for both FAQ routes. Mismatched lang+slug combos get
// robots noindex + a canonical pointing at that locale's real URL.
export function buildFaqMetadata(lang, slug) {
  const F = getFaqContent(lang);
  const canonical = `${SITE_URL}/${lang}${FAQ_PATHS[lang] || FAQ_PATHS.vi}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: F.meta.title,
    description: F.meta.description,
    alternates: {
      canonical,
      languages: faqLanguageAlternates(),
    },
    ...(isFaqCanonical(lang, slug) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: F.meta.title,
      description: F.meta.description,
      url: canonical,
      type: "website",
      locale: OG_LOCALE[lang],
    },
  };
}

// FAQPage structured data (all 13 questions; answer = joined paragraph texts).
// Emitted only on the canonical lang+slug combos to avoid duplicates.
export function faqJsonLd(lang) {
  const F = getFaqContent(lang);
  const mainEntity = [];
  for (const g of F.groups) {
    for (const item of g.items) {
      const text = item.blocks
        .filter((b) => b.type === "p")
        .map((b) => [b.text, b.strong, b.after].filter(Boolean).join(""))
        .join(" ");
      mainEntity.push({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text },
      });
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
