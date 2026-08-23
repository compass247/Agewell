/* ============================================================
   COMPASS AGEWELL — Service detail pages content (VI / EN)
   Three service landing pages (CCM · MTM · E&M / Telehealth),
   each an 8-section template:
     hero · whatIs · whoFor · steps · benefits · cost · faqs · related
   Copy is the approved BD text (BD_Requirements/Yêu cầu BD - Menu
   dịch vụ/). Kept OUT of content-data.js so the CMS homepage overlay
   (src/content.js) can never touch it.

   Compliance wording is deliberate — do not "simplify":
   "Medicare Original Part B" (CCM/E&M) · "Medicare Part D" (MTM),
   "Điều phối viên chăm sóc", "theo quyền lợi của từng bảo hiểm".
   ============================================================ */

export const SERVICE_SLUGS = ["ccm", "mtm", "em"];

// Shared across all pages.
const HOTLINE = "855-999-9911";

/* ============================================================
   CCM — Quản lý bệnh mãn tính / Chronic Care Management
   Accent: green. Source: AGEWELL-LandingPage-CCM-DesignBrief.md
   ============================================================ */
const CCM = {
  vi: {
    slug: "ccm",
    accent: "green",
    breadcrumbLabel: "Quản lý bệnh mãn tính",
    meta: {
      title: "Quản lý bệnh mãn tính",
      description:
        "Chương trình Quản lý Bệnh Mạn tính giúp anh chị được theo dõi sức khỏe hàng tháng với đội ngũ y tế nói tiếng Việt.",
    },
    hero: {
      eyebrow: "Quản lý Bệnh Mạn Tính",
      title: "Chăm sóc đều đặn, an tâm mỗi ngày",
      sub: "Chương trình Quản lý Bệnh Mạn tính giúp anh chị được theo dõi sức khỏe hàng tháng với đội ngũ y tế nói tiếng Việt.",
      cta: "Đăng ký tư vấn ngay",
      hotlinePre: "Hoặc gọi ngay",
      trust: ["Theo dõi sức khỏe hàng tháng", "Đội ngũ nói tiếng Việt"],
      image: "/assets/hero-ccm.webp",
      imageAlt: "Điều phối viên chăm sóc gọi điện cho khách hàng lớn tuổi tại nhà",
      badge: { title: "Điểm chạm định kỳ", sub: "Mỗi tháng, một cuộc gọi" },
    },
    whatIs: {
      eyebrow: "Tìm hiểu dịch vụ",
      title: "Quản lý bệnh mãn tính là gì?",
      paras: [
        "Sống với bệnh mạn tính không chỉ là uống thuốc mỗi ngày. Đó là phải theo dõi huyết áp, nhớ lịch tái khám, lo khi kết quả xét nghiệm thay đổi, và tự hỏi “mình uống cùng lúc mấy loại thuốc thế này có sao không?”",
        "Quản lý Bệnh Mãn Tính (Chronic Care Management) là dịch vụ giúp anh chị có một đội ngũ đồng hành, gồm bác sĩ, dược sĩ và Điều phối viên chăm sóc. Tất cả cùng nói tiếng Việt, làm việc cùng nhau để chăm sóc anh chị mỗi tháng:",
      ],
      bullets: [
        "Bác sĩ thiết lập và điều chỉnh kế hoạch chăm sóc phù hợp với tình trạng sức khỏe của anh chị",
        "Dược sĩ theo dõi và quản lý toàn bộ đơn thuốc, rà soát tương tác thuốc khi cần",
        "Điều phối viên chăm sóc gọi điện hàng tháng: hỏi thăm huyết áp, đường huyết, triệu chứng mới; kiểm tra thuốc anh chị đang uống; nhắc lịch tái khám",
      ],
      closing:
        "Anh chị ở nhà, nhận cuộc gọi là xong. Không cần đến phòng khám, không cần cài ứng dụng gì cả.",
    },
    whoFor: {
      eyebrow: "Điều kiện tham gia",
      title: "Dành cho ai?",
      card: {
        title: "Bạn phù hợp nếu:",
        items: [
          "Từ 65 tuổi trở lên",
          "Có Medicare Original Part B (thẻ đỏ-xanh)",
          "Có từ 2 bệnh mạn tính trở lên",
          "Bệnh kéo dài từ 12 tháng trở lên hoặc đến cuối đời",
          "Có nguy cơ bệnh nặng hơn, phải nhập viện, hoặc suy giảm chức năng nếu không được theo dõi thường xuyên",
        ],
      },
      tagsTitle: "Những bệnh mạn tính thường gặp:",
      tags: [
        "Huyết áp cao", "Tiểu đường", "Bệnh tim mạch", "Rung nhĩ", "COPD",
        "Suy tim", "Thoái hóa khớp", "Viêm khớp dạng thấp",
        "Alzheimer và sa sút trí tuệ", "Trầm cảm", "Hen suyễn", "Loãng xương",
        "Bệnh thận mãn tính", "Ung thư",
      ],
      tagsNote: "Và nhiều bệnh mạn tính khác. Nếu anh chị có từ 2 bệnh trở lên, gọi chúng tôi để kiểm tra điều kiện.",
      callout: `Không chắc mình có đủ điều kiện không? Gọi ${HOTLINE}, đội ngũ sẽ giúp anh chị kiểm tra.`,
    },
    steps: {
      eyebrow: "Cách hoạt động",
      title: "Quy trình 3 bước",
      items: [
        {
          icon: "message",
          title: "Đăng ký",
          text: "Anh chị gọi hotline hoặc điền form đăng ký. Đội ngũ AgeWell kiểm tra bảo hiểm và điều kiện của anh chị. Sau đó bác sĩ của chúng tôi sẽ có một buổi khám đầu tiên với anh chị để thiết lập kế hoạch chăm sóc.",
        },
        {
          icon: "phone",
          title: "Nhận cuộc gọi hàng tháng",
          text: "Mỗi tháng, Điều phối viên chăm sóc nói tiếng Việt sẽ gọi điện cho anh chị ít nhất 20 phút. Hỏi thăm sức khỏe, kiểm tra thuốc, theo dõi các chỉ số, và trả lời mọi câu hỏi của anh chị. Tất cả qua điện thoại, tại nhà.",
        },
        {
          icon: "check",
          title: "Yên tâm cả tháng",
          text: "Anh chị chỉ cần làm theo kế hoạch chăm sóc và lịch nhắc từ Điều phối viên. Mọi thứ đã có đội ngũ theo dõi: uống thuốc đúng giờ, tái khám đúng hẹn, xét nghiệm đúng lịch. Có bất thường, bác sĩ sẽ được báo ngay. Cần hỗ trợ gấp, anh chị gọi chúng tôi 24/7.",
        },
      ],
    },
    benefits: {
      eyebrow: "Vì sao chọn Compass AgeWell",
      title: "Lợi ích cụ thể",
      columns: [
        {
          icon: "heart", color: "green", title: "Cho anh chị",
          items: [
            "Một đội ngũ đồng hành nói tiếng Việt: Điều phối viên gọi điện mỗi tháng, bác sĩ và dược sĩ tham gia khi cần. Không còn cô đơn với bệnh tật.",
            "Phát hiện sớm những thay đổi bất thường như huyết áp tăng, đường huyết dao động, triệu chứng mới, trước khi phải vào bệnh viện.",
            "Không phải tự nhớ lịch tái khám, lịch xét nghiệm. Đã có đội ngũ nhắc lịch cho anh chị.",
            "Có dược sĩ kiểm tra tất cả các loại thuốc anh chị đang uống, tránh tương tác nguy hiểm.",
            "Khi cần gặp bác sĩ gấp, có đội ngũ kết nối ngay. Không phải tự gọi từng nơi.",
            "Chi phí được Medicare Original Part B chi trả theo quyền lợi của từng bảo hiểm.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "Cho người thân",
          items: [
            "Yên tâm vì có đội ngũ chuyên môn đang theo dõi sức khỏe ba mẹ, ông bà mỗi tháng.",
            "Không phải nghỉ làm để đưa đi khám định kỳ.",
            "Nhận thông tin cập nhật rõ ràng bằng tiếng Việt về tình trạng sức khỏe người thân.",
            "Có đội ngũ để gọi khi thấy ba mẹ có dấu hiệu bất thường mà không biết hỏi ai.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Minh bạch, không bất ngờ",
      title: "Chi phí",
      paras: [
        "Dịch vụ Quản lý Bệnh Mãn Tính được Medicare Original Part B chi trả theo quyền lợi bảo hiểm của anh chị. Một số gói Medicare có thể yêu cầu copay tùy theo quyền lợi cụ thể.",
        "Chúng tôi sẽ kiểm tra và thông báo rõ ràng với anh chị trước khi thực hiện bất kỳ dịch vụ nào. Không có chi phí bất ngờ.",
      ],
      ctaTitle: "Không chắc bảo hiểm của mình chi trả bao nhiêu?",
      cta: "Đăng ký tra cứu chi phí",
    },
    faqs: {
      eyebrow: "Giải đáp thắc mắc",
      title: "Câu hỏi thường gặp",
      items: [
        { q: "Tôi có phải đến phòng khám không?", a: "Không. Toàn bộ dịch vụ diễn ra qua điện thoại, ngay tại nhà anh chị. Điều phối viên chăm sóc sẽ gọi cho anh chị mỗi tháng vào ngày giờ đã hẹn. Anh chị không phải đi đâu cả." },
        { q: "Tôi có cần bỏ bác sĩ đang khám hiện tại không?", a: "Không. Anh chị vẫn giữ nguyên bác sĩ gia đình và các bác sĩ chuyên khoa. Dịch vụ quản lý bệnh mãn tính là người đồng hành thêm, giúp kết nối và phối hợp giữa anh chị với tất cả bác sĩ, để không ai bị bỏ sót." },
        { q: "Điều phối viên chăm sóc có phải là bác sĩ không?", a: "Điều phối viên chăm sóc là người được đào tạo chuyên môn, làm việc dưới sự giám sát của bác sĩ. Họ là cầu nối giữa anh chị và bác sĩ. Khi cần quyết định y khoa, bác sĩ sẽ trực tiếp tham gia." },
        { q: "Nếu tôi cần giúp đỡ gấp giữa các cuộc gọi hàng tháng thì sao?", a: "Anh chị có thể gọi chúng tôi 24/7. Nếu là vấn đề khẩn cấp, chúng tôi sẽ kết nối anh chị với bác sĩ ngay. Nếu là cấp cứu, chúng tôi sẽ hướng dẫn anh chị gọi 911." },
      ],
      moreLabel: "Xem tất cả câu hỏi thường gặp",
    },
    related: {
      eyebrow: "Khám phá thêm",
      title: "Bạn cũng có thể quan tâm",
      more: "Xem chi tiết",
    },
  },

  en: {
    slug: "ccm",
    accent: "green",
    breadcrumbLabel: "Chronic Care Management",
    meta: {
      title: "Chronic Care Management (CCM)",
      description:
        "The Chronic Care Management (CCM) program gives you monthly health monitoring from a Vietnamese-speaking care team.",
    },
    hero: {
      eyebrow: "Chronic Care Management · CCM",
      title: "Steady care, peace of mind every day",
      sub: "The Chronic Care Management (CCM) program gives you monthly health monitoring from a Vietnamese-speaking care team.",
      cta: "Get a consultation",
      hotlinePre: "Or call now",
      trust: ["Monthly health monitoring", "A Vietnamese-speaking team"],
      image: "/assets/hero-ccm.webp",
      imageAlt: "A care coordinator calling an older client at home",
      badge: { title: "Regular touchpoints", sub: "One call, every month" },
    },
    whatIs: {
      eyebrow: "About the service",
      title: "What is chronic care management?",
      paras: [
        "Living with a chronic condition is more than taking pills every day. It means tracking your blood pressure, remembering check-up dates, worrying when lab results change, and wondering “is it okay to take all these medications at once?”",
        "Chronic Care Management is a service that gives you a team by your side — a doctor, a pharmacist and a care coordinator. All speak Vietnamese and work together to care for you every month:",
      ],
      bullets: [
        "The doctor sets and adjusts a care plan that fits your health.",
        "The pharmacist tracks and manages all of your prescriptions, checking for interactions when needed.",
        "The care coordinator calls every month: checking your blood pressure, blood sugar and any new symptoms; reviewing the medications you take; and reminding you of upcoming appointments.",
      ],
      closing:
        "You stay home and simply take the call. No clinic visit, no app to install.",
    },
    whoFor: {
      eyebrow: "Eligibility",
      title: "Who is it for?",
      card: {
        title: "You may be a good fit if:",
        items: [
          "You are 65 or older",
          "You have Medicare Original Part B (the red-and-blue card)",
          "You have 2 or more chronic conditions",
          "Your condition is expected to last 12 months or more, or for the rest of your life",
          "You are at risk of worsening health, hospitalization or decline without regular monitoring",
        ],
      },
      tagsTitle: "Common chronic conditions:",
      tags: [
        "High blood pressure", "Diabetes", "Heart disease", "Atrial fibrillation",
        "COPD", "Heart failure", "Osteoarthritis", "Rheumatoid arthritis",
        "Alzheimer’s and dementia", "Depression", "Asthma", "Osteoporosis",
        "Chronic kidney disease", "Cancer",
      ],
      tagsNote: "And many other chronic conditions. If you have 2 or more, call us to check your eligibility.",
      callout: `Not sure if you qualify? Call ${HOTLINE} and our team will help you check.`,
    },
    steps: {
      eyebrow: "How it works",
      title: "Three simple steps",
      items: [
        { icon: "message", title: "Sign up", text: "Call the hotline or fill out the sign-up form. The AgeWell team checks your insurance and eligibility. Then our doctor holds a first visit with you to set up your care plan." },
        { icon: "phone", title: "Get a monthly call", text: "Every month, a Vietnamese-speaking care coordinator calls you for at least 20 minutes — checking on your health, reviewing your medications, tracking your numbers, and answering all of your questions. All by phone, from home." },
        { icon: "check", title: "Peace of mind all month", text: "You just follow the care plan and the coordinator’s reminders. The team keeps track of everything: medications on time, appointments as scheduled, labs on time. If anything is off, the doctor is notified right away. Need urgent help? Call us 24/7." },
      ],
    },
    benefits: {
      eyebrow: "Why choose Compass AgeWell",
      title: "Concrete benefits",
      columns: [
        {
          icon: "heart", color: "green", title: "For you",
          items: [
            "A Vietnamese-speaking team by your side: the coordinator calls every month, with the doctor and pharmacist joining when needed. You are never alone with your illness.",
            "Early detection of changes such as rising blood pressure, fluctuating blood sugar or new symptoms — before a hospital visit.",
            "No need to remember appointment and lab dates yourself. The team reminds you.",
            "A pharmacist reviews every medication you take to avoid dangerous interactions.",
            "When you need to see a doctor urgently, the team connects you right away. No calling around.",
            "Costs are covered by Medicare Original Part B, according to your plan’s benefits.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "For your family",
          items: [
            "Peace of mind knowing a professional team monitors your parents’ or grandparents’ health every month.",
            "No taking time off work for routine visits.",
            "Clear updates in Vietnamese about your loved one’s health.",
            "A team to call when you notice something unusual and don’t know who to ask.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Transparent, no surprises",
      title: "Cost",
      paras: [
        "Chronic Care Management is covered by Medicare Original Part B according to your plan’s benefits. Some Medicare plans may require a copay depending on the specific benefits.",
        "We will check and clearly inform you before providing any service. No surprise costs.",
      ],
      ctaTitle: "Not sure how much your insurance covers?",
      cta: "Check your cost",
    },
    faqs: {
      eyebrow: "Answers",
      title: "Frequently asked questions",
      items: [
        { q: "Do I have to go to a clinic?", a: "No. The entire service takes place by phone, right at home. The care coordinator calls you each month at the agreed time. You don’t have to go anywhere." },
        { q: "Do I have to give up my current doctor?", a: "No. You keep your family doctor and specialists. CCM is an added companion that connects and coordinates you with all of your doctors, so nothing falls through the cracks." },
        { q: "Is the care coordinator a doctor?", a: "The care coordinator is a trained professional working under a doctor’s supervision. They are the bridge between you and your doctor. When a medical decision is needed, the doctor is directly involved." },
        { q: "What if I need urgent help between the monthly calls?", a: "You can call us 24/7. For an urgent issue, we connect you with a doctor right away. In an emergency, we guide you to call 911." },
      ],
      moreLabel: "See all frequently asked questions",
    },
    related: {
      eyebrow: "Explore more",
      title: "You might also be interested in",
      more: "Learn more",
    },
  },
};

/* ============================================================
   MTM — Rà soát thuốc / Medication Therapy Management
   Accent: green. Source: AGEWELL-LandingPage-MTM.md
   ============================================================ */
const MTM = {
  vi: {
    slug: "mtm",
    accent: "green",
    breadcrumbLabel: "Rà soát thuốc",
    meta: {
      title: "Quản lý và rà soát thuốc",
      description:
        "Chương trình Quản lý và Rà soát Thuốc giúp anh chị được dược sĩ kiểm tra toàn bộ đơn thuốc, tránh tương tác nguy hiểm và tối ưu hiệu quả điều trị.",
    },
    hero: {
      eyebrow: "Quản lý và Rà soát Thuốc",
      title: "Mỗi viên thuốc đúng, mỗi ngày an tâm",
      sub: "Chương trình Quản lý và Rà soát Thuốc giúp anh chị được dược sĩ kiểm tra toàn bộ đơn thuốc, tránh tương tác nguy hiểm và tối ưu hiệu quả điều trị.",
      cta: "Đăng ký tư vấn ngay",
      hotlinePre: "Hoặc gọi hotline",
      trust: ["Qua điện thoại, tại nhà", "Dược sĩ nói tiếng Việt", "Nằm trong quyền lợi Medicare Part D"],
      image: "/assets/hero-mtm.webp",
      imageAlt: "Dược sĩ Compass AgeWell tư vấn cho người cao tuổi qua điện thoại",
      badge: { title: "Rà soát định kỳ", sub: "Mỗi quý, dược sĩ kiểm tra thuốc" },
    },
    whatIs: {
      eyebrow: "Giới thiệu dịch vụ",
      title: "Quản lý và rà soát thuốc là gì?",
      paras: [
        "Anh chị có đang uống 5, 6 loại thuốc mỗi ngày không? Thuốc huyết áp, thuốc tiểu đường, thuốc tim mạch, rồi thêm mấy viên bác sĩ mới kê gần đây. Uống nhiều thuốc cùng lúc khiến anh chị lo lắng: “Uống thế này có sao không? Có thuốc nào kỵ nhau không? Có cần uống hết tất cả không?”",
        "Quản lý và Rà soát Thuốc (Medication Therapy Management) là dịch vụ giúp anh chị có một dược sĩ chuyên môn xem xét lại toàn bộ đơn thuốc. Dược sĩ sẽ:",
      ],
      bullets: [
        "Rà soát từng loại thuốc anh chị đang uống — kể cả thuốc kê đơn, thuốc không kê đơn và thực phẩm chức năng",
        "Phát hiện những tương tác thuốc nguy hiểm mà anh chị không biết",
        "Tư vấn cách uống đúng giờ, đúng liều để thuốc phát huy hiệu quả tốt nhất",
        "Đề xuất với bác sĩ nếu có thuốc không cần thiết hoặc cần thay đổi liều lượng",
        "Theo dõi định kỳ mỗi quý, đảm bảo anh chị luôn dùng thuốc an toàn",
      ],
      closing:
        "Dịch vụ được thực hiện qua điện thoại, ngay tại nhà — anh chị không cần đến phòng khám, chỉ cần ngồi kể cho dược sĩ nghe mình đang uống những gì. Rà soát thuốc là quyền lợi bổ sung từ Medicare Part D. Anh chị đang dùng dịch vụ quản lý bệnh mãn tính vẫn có thể tham gia rà soát thuốc song song — hai dịch vụ bổ trợ cho nhau.",
    },
    whoFor: {
      eyebrow: "Kiểm tra điều kiện",
      title: "Dịch vụ này phù hợp cho ai?",
      card: {
        title: "Bạn phù hợp nếu:",
        items: [
          "Từ 65 tuổi trở lên",
          "Có Medicare Part D (bảo hiểm thuốc)",
          "Đang uống từ 5 loại thuốc trở lên được Part D chi trả",
          "Có ít nhất 2 bệnh mạn tính được CMS công nhận",
          "Chi phí thuốc hàng năm ≥ $1,623 (ngưỡng CMS 2025)",
        ],
      },
      tagsTitle: "Những tình huống rà soát thuốc đặc biệt hữu ích:",
      tags: [
        "Anh chị vừa xuất viện, đơn thuốc thay đổi nhiều so với trước",
        "Anh chị khám nhiều bác sĩ chuyên khoa khác nhau, mỗi người kê một ít thuốc",
        "Anh chị cảm thấy mệt, chóng mặt, buồn nôn mà không rõ nguyên nhân, có thể do tương tác thuốc",
        "Người nhà lo lắng không biết ba mẹ uống thuốc có đúng không",
        "Anh chị đang tham gia dịch vụ quản lý bệnh mãn tính và muốn có thêm lớp bảo vệ về thuốc",
      ],
      tagsVariant: "list",
      callout: `Không chắc mình có đủ điều kiện không? Gọi ${HOTLINE} — đội ngũ AgeWell sẽ giúp anh chị kiểm tra.`,
    },
    steps: {
      eyebrow: "Quy trình đơn giản",
      title: "Đăng ký và sử dụng chỉ với 3 bước",
      items: [
        { icon: "message", title: "Gửi danh sách thuốc", text: "Anh chị gọi hotline hoặc điền form đăng ký — đội ngũ AgeWell kiểm tra bảo hiểm Part D và điều kiện của anh chị. Sau đó, anh chị chỉ cần kể cho dược sĩ nghe tất cả các loại thuốc mình đang uống, kể cả thuốc mua ngoài và thực phẩm chức năng." },
        { icon: "pill", title: "Dược sĩ rà soát toàn diện", text: "Dược sĩ của chúng tôi sẽ ngồi lại với anh chị qua điện thoại ít nhất 15 phút — rà soát từng loại thuốc, kiểm tra tương tác, đánh giá liều lượng. Nếu phát hiện vấn đề, dược sĩ giải thích rõ ràng bằng tiếng Việt và đề xuất hướng xử lý với bác sĩ của anh chị." },
        { icon: "shield", title: "Yên tâm dùng thuốc đúng", text: "Sau buổi rà soát, anh chị nhận được bản tóm tắt rõ ràng về từng loại thuốc — uống lúc nào, cần lưu ý gì. Mỗi quý, dược sĩ gọi lại kiểm tra tình hình. Có thắc mắc về thuốc bất kỳ lúc nào, anh chị cứ gọi." },
      ],
    },
    benefits: {
      eyebrow: "Vì sao chọn Compass AgeWell",
      title: "Lợi ích cụ thể cho anh chị và gia đình",
      columns: [
        {
          icon: "pill", color: "green", title: "Cho anh chị",
          items: [
            "Một dược sĩ riêng rà soát toàn bộ đơn thuốc — phát hiện tương tác nguy hiểm trước khi có hậu quả.",
            "Biết chính xác uống thuốc gì, lúc nào, liều bao nhiêu — không còn cảnh “uống cho có”.",
            "Giảm nguy cơ tác dụng phụ do uống sai thuốc hoặc uống thuốc không cần thiết.",
            "Dược sĩ đề xuất với bác sĩ nếu có thuốc cần điều chỉnh — anh chị không phải tự nói.",
            "Được theo dõi định kỳ mỗi quý, không lo sót thay đổi nào về thuốc.",
            "Chi phí được Medicare Part D chi trả theo quyền lợi của từng bảo hiểm.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "Cho người thân",
          items: [
            "Yên tâm vì có dược sĩ chuyên môn kiểm soát toàn bộ thuốc của ba mẹ, ông bà.",
            "Biết rõ ba mẹ đang uống những gì — có vấn đề gì cần lưu ý không.",
            "Không phải tự mày mò tra Google xem thuốc này thuốc kia có kỵ nhau không.",
            "Có người để gọi khi thấy ba mẹ có triệu chứng lạ sau khi đổi thuốc.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Minh bạch, không bất ngờ",
      title: "Chi phí",
      paras: [
        "Dịch vụ Quản lý và Rà soát Thuốc được Medicare Part D chi trả theo quyền lợi bảo hiểm của anh chị. Một số gói Part D có thể yêu cầu copay tùy theo quyền lợi cụ thể.",
        "Chúng tôi sẽ kiểm tra và thông báo rõ ràng với anh chị trước khi thực hiện bất kỳ dịch vụ nào. Không có chi phí bất ngờ.",
      ],
      ctaTitle: "Không chắc bảo hiểm của mình chi trả bao nhiêu?",
      cta: "Đăng ký tra cứu chi phí",
    },
    faqs: {
      eyebrow: "Giải đáp thắc mắc",
      title: "Câu hỏi thường gặp",
      items: [
        { q: "Tôi có phải đến phòng khám không?", a: "Không. Toàn bộ dịch vụ diễn ra qua điện thoại, ngay tại nhà anh chị. Dược sĩ sẽ gọi cho anh chị vào ngày giờ đã hẹn. Anh chị không phải đi đâu cả." },
        { q: "Tôi đang tham gia dịch vụ Quản lý bệnh mãn tính, có được Rà soát thuốc không?", a: "Được. Rà soát thuốc và Quản lý bệnh mãn tính là hai dịch vụ song song, bổ trợ cho nhau. Quản lý bệnh mãn tính giúp anh chị theo dõi sức khỏe toàn diện mỗi tháng. Rà soát thuốc giúp tối ưu toàn bộ đơn thuốc. Cùng một tháng, anh chị vừa nhận cuộc gọi từ Điều phối viên chăm sóc, vừa được dược sĩ rà soát thuốc — hai dịch vụ không thay thế nhau." },
        { q: "Tôi có cần bỏ bác sĩ đang khám hiện tại không?", a: "Không. Anh chị vẫn giữ nguyên bác sĩ gia đình và các bác sĩ chuyên khoa. Dược sĩ của chúng tôi phối hợp với bác sĩ của anh chị, đề xuất điều chỉnh nếu cần — anh chị vẫn là người quyết định cuối cùng." },
        { q: "Tôi uống cả thuốc mua ngoài và thực phẩm chức năng, có cần kể không?", a: "Có — rất quan trọng. Thuốc mua ngoài và thực phẩm chức năng cũng có thể tương tác với thuốc kê đơn. Anh chị hãy kể cho dược sĩ tất cả những gì mình đang uống, kể cả vitamin, thảo dược, thuốc bổ." },
        { q: "Rà soát xong thì sao? Tôi có phải làm gì không?", a: "Dược sĩ sẽ gửi anh chị một bản tóm tắt kết quả rà soát. Nếu mọi thứ ổn, anh chị tiếp tục uống thuốc như bình thường và chờ cuộc gọi theo dõi mỗi quý. Nếu có vấn đề cần điều chỉnh, dược sĩ sẽ giải thích rõ và phối hợp với bác sĩ của anh chị." },
      ],
      moreLabel: "Xem tất cả câu hỏi thường gặp",
    },
    related: {
      eyebrow: "Khám phá thêm",
      title: "Bạn cũng có thể quan tâm",
      more: "Xem chi tiết",
    },
  },

  en: {
    slug: "mtm",
    accent: "green",
    breadcrumbLabel: "Medication Review",
    meta: {
      title: "Medication Therapy Management (MTM)",
      description:
        "The Medication Therapy Management (MTM) program lets a pharmacist review all of your prescriptions to avoid dangerous interactions and improve treatment.",
    },
    hero: {
      eyebrow: "Medication Therapy Management · MTM",
      title: "Every pill right, every day at ease",
      sub: "The Medication Therapy Management (MTM) program lets a pharmacist review all of your prescriptions, avoid dangerous interactions and optimize your treatment.",
      cta: "Get a consultation",
      hotlinePre: "Or call the hotline",
      trust: ["By phone, from home", "A Vietnamese-speaking pharmacist", "Within your Medicare Part D benefits"],
      image: "/assets/hero-mtm.webp",
      imageAlt: "A Compass AgeWell pharmacist advising an older adult by phone",
      badge: { title: "Regular reviews", sub: "A pharmacist checks your meds each quarter" },
    },
    whatIs: {
      eyebrow: "About the service",
      title: "What is medication therapy management?",
      paras: [
        "Are you taking 5 or 6 medications a day? Blood pressure pills, diabetes pills, heart medications, plus a few more your doctor recently prescribed. Taking many at once can be worrying: “Is this okay? Do any of them clash? Do I really need all of them?”",
        "Medication Therapy Management is a service that gives you a professional pharmacist to review all of your prescriptions. The pharmacist will:",
      ],
      bullets: [
        "Review every medication you take — including prescription, over-the-counter and supplements.",
        "Catch dangerous interactions you may not be aware of.",
        "Advise on correct timing and dosing so your medications work best.",
        "Recommend to your doctor if a medication is unnecessary or the dose should change.",
        "Follow up each quarter to keep your medication use safe.",
      ],
      closing:
        "The service is done by phone, right at home — no clinic visit; you just tell the pharmacist what you’re taking. MTM is an added benefit from Medicare Part D. If you’re already in CCM, you can join MTM in parallel — the two services complement each other.",
    },
    whoFor: {
      eyebrow: "Check eligibility",
      title: "Who is this service for?",
      card: {
        title: "You may be a good fit if:",
        items: [
          "You are 65 or older",
          "You have Medicare Part D (drug coverage)",
          "You take 5 or more medications covered by Part D",
          "You have at least 2 CMS-recognized chronic conditions",
          "Your annual drug cost is ≥ $1,623 (2025 CMS threshold)",
        ],
      },
      tagsTitle: "Situations where MTM is especially helpful:",
      tags: [
        "You were just discharged and your prescriptions changed a lot",
        "You see several specialists, each prescribing a few medications",
        "You feel tired, dizzy or nauseous for no clear reason — possibly an interaction",
        "Your family worries whether your parents take their medications correctly",
        "You’re already in CCM and want an extra layer of medication safety",
      ],
      tagsVariant: "list",
      callout: `Not sure if you qualify? Call ${HOTLINE} — the AgeWell team will help you check.`,
    },
    steps: {
      eyebrow: "A simple process",
      title: "Sign up and get started in 3 steps",
      items: [
        { icon: "message", title: "Send your medication list", text: "Call the hotline or fill out the sign-up form — the AgeWell team checks your Part D coverage and eligibility. Then you just tell the pharmacist about every medication you take, including over-the-counter drugs and supplements." },
        { icon: "pill", title: "A full pharmacist review", text: "Our pharmacist sits down with you by phone for at least 15 minutes — reviewing each medication, checking interactions, assessing doses. If an issue is found, the pharmacist explains it clearly in Vietnamese and proposes a plan with your doctor." },
        { icon: "shield", title: "Peace of mind taking meds right", text: "After the review, you receive a clear summary of each medication — when to take it and what to watch for. Each quarter, the pharmacist calls to check in. Any medication questions, anytime — just call." },
      ],
    },
    benefits: {
      eyebrow: "Why choose Compass AgeWell",
      title: "Concrete benefits for you and your family",
      columns: [
        {
          icon: "pill", color: "green", title: "For you",
          items: [
            "A dedicated pharmacist reviews all of your prescriptions — catching dangerous interactions before they cause harm.",
            "Know exactly what to take, when, and how much — no more “taking pills just because.”",
            "Lower risk of side effects from taking the wrong or unnecessary medications.",
            "The pharmacist raises adjustments with your doctor — you don’t have to bring it up yourself.",
            "Quarterly follow-up so no medication change is missed.",
            "Costs are covered by Medicare Part D, according to your plan’s benefits.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "For your family",
          items: [
            "Peace of mind knowing a professional pharmacist oversees your parents’ medications.",
            "Clarity on exactly what your parents take — and what to watch for.",
            "No more Googling whether one drug clashes with another.",
            "Someone to call when you notice odd symptoms after a medication change.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Transparent, no surprises",
      title: "Cost",
      paras: [
        "Medication Therapy Management is covered by Medicare Part D according to your plan’s benefits. Some Part D plans may require a copay depending on the specific benefits.",
        "We will check and clearly inform you before providing any service. No surprise costs.",
      ],
      ctaTitle: "Not sure how much your insurance covers?",
      cta: "Check your cost",
    },
    faqs: {
      eyebrow: "Answers",
      title: "Frequently asked questions",
      items: [
        { q: "Do I have to go to a clinic?", a: "No. The entire service takes place by phone, right at home. The pharmacist calls you at the agreed time. You don’t have to go anywhere." },
        { q: "I’m already in CCM — can I get MTM too?", a: "Yes. MTM and CCM are parallel, complementary services. CCM monitors your overall health each month. MTM optimizes all of your prescriptions. In the same month, you get a call from your care coordinator and a medication review from the pharmacist — the two don’t replace each other." },
        { q: "Do I have to give up my current doctor?", a: "No. You keep your family doctor and specialists. Our pharmacist coordinates with your doctor and proposes adjustments if needed — you remain the final decision-maker." },
        { q: "I take over-the-counter drugs and supplements too — should I mention them?", a: "Yes — it’s very important. Over-the-counter drugs and supplements can also interact with prescriptions. Tell the pharmacist everything you take, including vitamins, herbs and tonics." },
        { q: "After the review, do I have to do anything?", a: "The pharmacist sends you a summary of the review. If everything is fine, keep taking your medications as usual and wait for the quarterly follow-up call. If something needs adjusting, the pharmacist explains it clearly and coordinates with your doctor." },
      ],
      moreLabel: "See all frequently asked questions",
    },
    related: {
      eyebrow: "Explore more",
      title: "You might also be interested in",
      more: "Learn more",
    },
  },
};

/* ============================================================
   E&M — Khám bệnh từ xa / Telehealth
   Accent: green (per BD shipped HTML). Source:
   AGEWELL-LandingPage-E&M-Telehealth.md, reconciled to shipped HTML
   (single eligibility card, 2 benefit columns).
   ============================================================ */
const EM = {
  vi: {
    slug: "em",
    accent: "green",
    breadcrumbLabel: "Khám bệnh từ xa",
    meta: {
      title: "Khám bệnh từ xa",
      description:
        "Gặp bác sĩ nói tiếng Việt qua điện thoại hoặc video, ngay tại nhà. Không lái xe, không phòng chờ, không rào cản ngôn ngữ.",
    },
    hero: {
      eyebrow: "Khám Bệnh Từ Xa",
      title: "Bác sĩ nói tiếng Việt, khám bệnh ngay tại nhà",
      sub: "Không lái xe, không phòng chờ, không rào cản ngôn ngữ. Gặp bác sĩ qua điện thoại hoặc video, tất cả bằng tiếng Việt.",
      cta: "Đăng ký khám ngay",
      hotlinePre: "Hoặc gọi ngay",
      trust: ["Dành cho khách hàng có Medicare Original Part B", "Khám 20–30 phút"],
      image: "/assets/hero-em.webp",
      imageAlt: "Người cao tuổi gọi video khám bệnh với bác sĩ tại nhà",
      badge: { title: "Gọi là gặp bác sĩ", sub: "Không cần cài ứng dụng" },
    },
    whatIs: {
      eyebrow: "Tìm hiểu dịch vụ",
      title: "Khám bệnh từ xa là gì?",
      paras: [
        "Khám bệnh từ xa là buổi khám bệnh với bác sĩ qua điện thoại hoặc video, ngay tại nhà. Bác sĩ sẽ hỏi bệnh, đánh giá triệu chứng và đưa ra hướng điều trị — giống như một buổi khám tại phòng khám, nhưng anh chị không phải đi đâu cả.",
        "Mỗi buổi khám kéo dài khoảng 20-30 phút. Bác sĩ nói tiếng Việt, giải thích cặn kẽ từng điều anh chị cần biết.",
      ],
      bulletsTitle: "Khám được những bệnh gì?",
      bullets: [
        "Cảm cúm, ho, sốt, đau họng",
        "Đau lưng, đau khớp, đau đầu",
        "Theo dõi huyết áp, tiểu đường, cholesterol",
        "Các vấn đề về da, dị ứng",
        "Nhiễm trùng tiểu, viêm xoang",
        "Và nhiều bệnh khác",
      ],
      closing:
        "Nếu cần xét nghiệm hoặc gặp bác sĩ chuyên khoa, bác sĩ sẽ hướng dẫn anh chị cụ thể.",
    },
    whoFor: {
      eyebrow: "Kiểm tra điều kiện",
      title: "Dịch vụ này dành cho ai?",
      card: {
        title: "Dành cho khách hàng:",
        items: [
          "Từ 65 tuổi trở lên",
          "Có Medicare Original Part B (thẻ đỏ-xanh)",
          "Cần khám bệnh nhưng ngại đi lại, ngại chờ đợi",
          "Có triệu chứng mới cần bác sĩ xem xét",
          "Muốn gặp bác sĩ nói tiếng Việt",
        ],
      },
      callout: `Không chắc mình thuộc loại nào? Gọi ${HOTLINE}, đội ngũ sẽ giúp anh chị kiểm tra.`,
    },
    steps: {
      eyebrow: "Dễ dàng bắt đầu",
      title: "Quy trình 3 bước đơn giản",
      items: [
        { icon: "phone", title: "Đăng ký", text: "Anh chị gọi hotline hoặc điền form đăng ký. Đội ngũ AgeWell kiểm tra bảo hiểm và điều kiện của anh chị." },
        { icon: "calendar", title: "Đặt lịch", text: "Chọn ngày giờ phù hợp với anh chị. Bác sĩ sẽ gọi điện thoại hoặc video. Anh chị không cần cài ứng dụng gì cả." },
        { icon: "video", title: "Gặp bác sĩ", text: "Bác sĩ nói tiếng Việt, khám kỹ 20-30 phút. Nhận toa thuốc (nếu cần), hướng dẫn theo dõi, và giấy giới thiệu chuyên khoa (nếu cần)." },
      ],
    },
    benefits: {
      eyebrow: "Vì sao đáng để thử",
      title: "Lợi ích cụ thể cho anh chị và gia đình",
      columns: [
        {
          icon: "heart", color: "green", title: "Cho anh chị",
          items: [
            "Không phải lái xe, không ngồi chờ hàng giờ ở phòng khám.",
            "Bác sĩ nói tiếng Việt — hiểu rõ từng điều được giải thích, không sợ hiểu sai.",
            "Có triệu chứng mới mà không biết có cần vào ER không? Bác sĩ giúp anh chị quyết định, tránh tốn $1,500-$3,000 không cần thiết.",
            "Cần toa thuốc gấp nhưng bác sĩ gia đình chưa có lịch trống? Khám bệnh từ xa giải quyết trong ngày.",
            "Đơn thuốc gửi thẳng đến nhà thuốc, không cần giấy tờ rườm rà.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "Cho người thân",
          items: [
            "Yên tâm vì có bác sĩ đang chăm sóc ba mẹ, ông bà.",
            "Không phải nghỉ làm để đưa đi khám.",
            "Nhận thông tin rõ ràng, bằng tiếng Việt.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Minh bạch, không bất ngờ",
      title: "Chi phí",
      paras: [
        "Khám bệnh từ xa được Medicare Original Part B chi trả, theo quyền lợi bảo hiểm của anh chị. Một số gói Medicare có thể yêu cầu copay tùy theo quyền lợi cụ thể.",
        "Chúng tôi sẽ kiểm tra và thông báo rõ ràng với anh chị trước khi thực hiện bất kỳ dịch vụ nào. Không có chi phí bất ngờ.",
      ],
      ctaTitle: "Không chắc bảo hiểm của mình chi trả bao nhiêu?",
      cta: "Đăng ký tra cứu chi phí",
    },
    faqs: {
      eyebrow: "Giải đáp thắc mắc",
      title: "Câu hỏi thường gặp",
      items: [
        { q: "Tôi không rành công nghệ, có dùng được không?", a: "Hoàn toàn dùng được. Bác sĩ sẽ gọi điện thoại trực tiếp cho anh chị, đơn giản như nghe một cuộc gọi thông thường. Nếu muốn gặp bác sĩ qua video, con cháu chỉ cần bấm vào đường link chúng tôi gửi qua tin nhắn, vài giây là kết nối được." },
        { q: "Tôi có cần bỏ bác sĩ đang khám hiện tại không?", a: "Không. Anh chị vẫn giữ nguyên bác sĩ gia đình và các bác sĩ chuyên khoa. Khám bệnh từ xa là dịch vụ bổ sung — dùng khi anh chị cần gặp bác sĩ nhanh, không phải chờ lịch hẹn." },
        { q: "Sau buổi khám tôi nhận được gì?", a: "Toa thuốc mới hoặc điều chỉnh (nếu cần), gửi thẳng đến nhà thuốc. Hướng dẫn theo dõi và lịch tái khám (nếu cần). Giấy giới thiệu đến chuyên khoa (nếu cần)." },
        { q: "Lỡ tôi muốn dừng, không dùng nữa thì sao?", a: "Anh chị có thể dừng bất kỳ lúc nào, không ràng buộc, không phạt. Quyền lợi Medicare của anh chị không bị ảnh hưởng gì." },
      ],
      moreLabel: "Xem tất cả câu hỏi thường gặp",
    },
    related: {
      eyebrow: "Khám phá thêm",
      title: "Bạn cũng có thể quan tâm",
      more: "Xem chi tiết",
    },
  },

  en: {
    slug: "em",
    accent: "green",
    breadcrumbLabel: "Telehealth",
    meta: {
      title: "Telehealth remote visits",
      description:
        "See a Vietnamese-speaking doctor by phone or video, right at home. No driving, no waiting room, no language barrier.",
    },
    hero: {
      eyebrow: "Telehealth · Remote visits",
      title: "A Vietnamese-speaking doctor, right at home",
      sub: "No driving, no waiting room, no language barrier. See a doctor by phone or video — all in Vietnamese.",
      cta: "Book a visit",
      hotlinePre: "Or call now",
      trust: ["For members with Medicare Original Part B", "20–30 minute visits"],
      image: "/assets/hero-em.webp",
      imageAlt: "An older adult on a video call with a doctor at home",
      badge: { title: "Call and see a doctor", sub: "No app to install" },
    },
    whatIs: {
      eyebrow: "About the service",
      title: "What is a telehealth visit?",
      paras: [
        "A telehealth visit is an appointment with a doctor by phone or video, right at home. The doctor asks about your condition, assesses symptoms and provides a treatment plan — just like a clinic visit, but you don’t have to go anywhere.",
        "Each visit lasts about 20–30 minutes. The doctor speaks Vietnamese and explains everything you need to know.",
      ],
      bulletsTitle: "What can be treated?",
      bullets: [
        "Colds, cough, fever, sore throat",
        "Back pain, joint pain, headaches",
        "Monitoring blood pressure, diabetes, cholesterol",
        "Skin problems and allergies",
        "Urinary tract infections, sinus infections",
        "And many other conditions",
      ],
      closing:
        "If lab tests or a specialist are needed, the doctor will guide you on the specifics.",
    },
    whoFor: {
      eyebrow: "Check eligibility",
      title: "Who is this service for?",
      card: {
        title: "For members who:",
        items: [
          "Are 65 or older",
          "Have Medicare Original Part B (the red-and-blue card)",
          "Need a visit but would rather avoid travel and waiting",
          "Have a new symptom a doctor should review",
          "Want to see a Vietnamese-speaking doctor",
        ],
      },
      callout: `Not sure where you fit? Call ${HOTLINE} and our team will help you check.`,
    },
    steps: {
      eyebrow: "Easy to start",
      title: "Three simple steps",
      items: [
        { icon: "phone", title: "Sign up", text: "Call the hotline or fill out the sign-up form. The AgeWell team checks your insurance and eligibility." },
        { icon: "calendar", title: "Book a time", text: "Pick a day and time that works for you. The doctor calls by phone or video. No app to install." },
        { icon: "video", title: "See the doctor", text: "A Vietnamese-speaking doctor gives a thorough 20–30 minute visit. Get a prescription (if needed), monitoring guidance and a specialist referral (if needed)." },
      ],
    },
    benefits: {
      eyebrow: "Why it’s worth trying",
      title: "Concrete benefits for you and your family",
      columns: [
        {
          icon: "heart", color: "green", title: "For you",
          items: [
            "No driving, no sitting for hours in a waiting room.",
            "A Vietnamese-speaking doctor — understand every explanation, no fear of miscommunication.",
            "New symptom and not sure if you need the ER? The doctor helps you decide, avoiding an unnecessary $1,500–$3,000.",
            "Need an urgent prescription but your family doctor is booked? A telehealth visit solves it the same day.",
            "Prescriptions sent straight to the pharmacy, no paperwork hassle.",
          ],
        },
        {
          icon: "shield", color: "blue", title: "For your family",
          items: [
            "Peace of mind knowing a doctor is caring for your parents.",
            "No taking time off work to drive to appointments.",
            "Clear information, in Vietnamese.",
          ],
        },
      ],
    },
    cost: {
      eyebrow: "Transparent, no surprises",
      title: "Cost",
      paras: [
        "Telehealth visits are covered by Medicare Original Part B according to your plan’s benefits. Some Medicare plans may require a copay depending on the specific benefits.",
        "We will check and clearly inform you before providing any service. No surprise costs.",
      ],
      ctaTitle: "Not sure how much your insurance covers?",
      cta: "Check your cost",
    },
    faqs: {
      eyebrow: "Answers",
      title: "Frequently asked questions",
      items: [
        { q: "I’m not tech-savvy — can I still use it?", a: "Absolutely. The doctor calls you directly, as simple as answering a regular phone call. If you’d like a video visit, a family member just taps the link we send by text and you’re connected in seconds." },
        { q: "Do I have to give up my current doctor?", a: "No. You keep your family doctor and specialists. Telehealth is a supplementary service — use it when you need to see a doctor quickly, without waiting for an appointment." },
        { q: "What do I get after the visit?", a: "A new or adjusted prescription (if needed), sent straight to the pharmacy. Monitoring and follow-up guidance (if needed). A specialist referral (if needed)." },
        { q: "What if I want to stop using it?", a: "You can stop anytime, with no commitment and no penalty. Your Medicare benefits are not affected." },
      ],
      moreLabel: "See all frequently asked questions",
    },
    related: {
      eyebrow: "Explore more",
      title: "You might also be interested in",
      more: "Learn more",
    },
  },
};

// Cross-link cards for the "You might also be interested" section. Each service
// links to the other two, with the accent color used on the shipped designs.
const RELATED_CARDS = {
  vi: {
    ccm: { slug: "ccm", tag: "", icon: "calendar", color: "green", title: "Quản lý bệnh mãn tính", text: "Sống với nhiều bệnh mạn tính? Đội ngũ bác sĩ, dược sĩ và Điều phối viên chăm sóc đồng hành mỗi tháng, theo dõi sức khỏe ngay tại nhà." },
    mtm: { slug: "mtm", tag: "", icon: "pill", color: "orange", title: "Rà soát thuốc", text: "Uống nhiều loại thuốc mỗi ngày? Dược sĩ rà soát toàn bộ toa thuốc, giúp anh chị dùng thuốc an toàn hơn, tránh tương tác nguy hiểm." },
    em: { slug: "em", tag: "", icon: "video", color: "blue", title: "Khám bệnh từ xa", text: "Cần gặp bác sĩ gấp nhưng ngại đi lại? Khám bệnh qua điện thoại hoặc video với bác sĩ nói tiếng Việt, ngay tại nhà." },
  },
  en: {
    ccm: { slug: "ccm", tag: "CCM", icon: "calendar", color: "green", title: "Chronic Care Management", text: "Living with multiple chronic conditions? A team of doctors, pharmacists and care coordinators is by your side every month, monitoring your health from home." },
    mtm: { slug: "mtm", tag: "MTM", icon: "pill", color: "orange", title: "Medication Review", text: "Taking many medications a day? A pharmacist reviews all of your prescriptions to keep you safer and avoid dangerous interactions." },
    em: { slug: "em", tag: "Telehealth", icon: "video", color: "blue", title: "Telehealth remote visits", text: "Need a doctor quickly but would rather avoid travel? See a Vietnamese-speaking doctor by phone or video, right at home." },
  },
};

// Which two services each page cross-links to (order matches the shipped designs).
const RELATED_ORDER = {
  ccm: ["em", "mtm"],
  mtm: ["ccm", "em"],
  em: ["ccm", "mtm"],
};

const PAGES = { ccm: CCM, mtm: MTM, em: EM };

/**
 * Resolve one service page's content for a language, with its cross-link cards
 * attached. Returns null for an unknown slug so the route can 404.
 */
export function getServicePage(slug, lang) {
  const page = PAGES[slug];
  if (!page) return null;
  const L = lang === "en" ? "en" : "vi";
  const base = page[L] || page.vi;
  const relatedCards = (RELATED_ORDER[slug] || []).map(
    (s) => (RELATED_CARDS[L] || RELATED_CARDS.vi)[s]
  );
  return { ...base, related: { ...base.related, cards: relatedCards } };
}
