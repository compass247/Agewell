/* ============================================================
   COMPASS AGEWELL — Bilingual content (VI / EN)
   Text based on Design Brief + Content Mapping L2 (placeholder
   copy, ready to swap for approved L3).
   ============================================================ */
export const AGEWELL_CONTENT = {
  vi: {
    dir: "vi",
    nav: [
      { id: "dichvu",  label: "Dịch vụ" },
      { id: "team",    label: "Đội ngũ y tế", type: "route", href: "/team" },
      { id: "dieukien", label: "Câu hỏi thường gặp" },
      { id: "dangky",  label: "Liên hệ" },
      { id: "blog",    label: "Blog", type: "route", href: "/blog" },
    ],
    headerCta: "Đăng ký tư vấn",
    hotline: { label: "Gọi miễn phí", number: "855-999-9911", tel: "+18559999911" },

    hero: {
      eyebrow: "Compass AgeWell",
      title: "Chăm sóc sức khỏe tại nhà bằng tiếng Việt",
      sub: "Bác sĩ, dược sĩ và điều phối viên người Việt đồng hành cùng bạn mỗi tháng — qua điện thoại, ngay tại nhà.",
      ctaPrimary: "Đăng ký tư vấn miễn phí",
      hotlinePre: "Hoặc gọi ngay",
      trust: ["Phù hợp với người có Medicare Original", "Nói chuyện bằng tiếng Việt"],
      mediaLabel: "Ảnh: người cao tuổi Việt vui vẻ tại nhà",
      badge: { title: "Chăm sóc mỗi tháng", sub: "Liên tục, không gián đoạn" },
    },

    problem: {
      title: "Đi khám bệnh ở Mỹ không hề dễ dàng",
      lede: "Nhất là khi tuổi đã cao và tiếng Anh chưa thật thoải mái.",
      cards: [
        { icon: "car", title: "Đi lại xa xôi", text: "Phòng khám ở xa, phải nhờ con cháu chở đi, mất cả buổi cho một lần tái khám." },
        { icon: "clock", title: "Ngồi chờ hàng giờ", text: "Đến nơi lại chờ đợi mệt mỏi, trong khi sức khỏe và đôi chân không cho phép." },
        { icon: "message", title: "Rào cản ngôn ngữ", text: "Khó diễn đạt triệu chứng, không hiểu hết lời dặn của bác sĩ, lo lắng uống nhầm thuốc." },
      ],
      bridge: "Bạn xứng đáng được chăm sóc. <b>Người thân của bạn xứng đáng được yên tâm.</b>",
    },

    services: {
      eyebrow: "Ba dịch vụ chính",
      title: "Một hệ thống chăm sóc, ba cách đồng hành",
      learnMore: "Tìm hiểu thêm",
      cards: [
        { tag: "Telehealth", icon: "video", color: "blue",
          title: "Khám bệnh từ xa", text: "Gặp bác sĩ qua điện thoại hoặc video, ngay tại nhà. Không cần đi lại, không phải chờ đợi." },
        { tag: "CCM", icon: "calendar", color: "green",
          title: "Quản lý bệnh mãn tính", text: "Theo dõi tiểu đường, huyết áp, tim mạch… mỗi tháng. Điều phối viên gọi điện hỏi thăm đều đặn." },
        { tag: "MTM", icon: "pill", color: "orange",
          title: "Rà soát thuốc", text: "Dược sĩ rà soát toàn bộ thuốc bạn đang dùng, tránh tương tác và uống nhầm liều." },
      ],
    },

    loop: {
      title: "Sức khỏe được theo dõi liên tục, không bỏ sót",
      lede: "Mỗi tháng là một vòng chăm sóc khép kín — không chỉ chữa bệnh khi đã nặng.",
      steps: [
        { icon: "video",   color: "blue",   title: "Khám", text: "Bác sĩ đánh giá tình trạng sức khỏe qua cuộc gọi." },
        { icon: "calendar",color: "green",  title: "Quản lý", text: "Lập kế hoạch chăm sóc và điều chỉnh thuốc phù hợp." },
        { icon: "pill",    color: "orange", title: "Theo dõi", text: "Điều phối viên theo sát, nhắc lịch, hỏi thăm hằng tháng." },
      ],
      backLabel: "Quay lại",
      message: "Mỗi tháng, mỗi cuộc gọi, mỗi lần rà soát thuốc là một điểm chạm <b>xây dựng sức khỏe bền vững</b>.",
    },

    usp: {
      eyebrow: "Vì sao chọn chúng tôi",
      title: "Chăm sóc như người thân theo tiêu chuẩn chuyên gia",
      items: [
        { icon: "shield", color: "green", title: "Toàn diện", text: "Khám, quản lý bệnh và rà soát thuốc trong cùng một hệ thống — không rời rạc." },
        { icon: "heart",  color: "orange", title: "Thấu hiểu", text: "Đội ngũ người Việt, hiểu văn hóa, lắng nghe và tôn trọng gia đình bạn." },
        { icon: "repeat", color: "blue", title: "Liên tục", text: "Chăm sóc đều đặn mỗi tháng, không chờ tới khi bệnh trở nặng." },
      ],
      teamTitle: "Những người đồng hành cùng bạn",
      team: [
        { role: "Bác sĩ", title: "Bác sĩ nói tiếng Việt", text: "Đánh giá sức khỏe, chẩn đoán và xây dựng kế hoạch điều trị cho bạn.", img: "/assets/bac-si.png" },
        { role: "Dược sĩ", title: "Dược sĩ tư vấn", text: "Rà soát thuốc, giải thích cách dùng rõ ràng bằng tiếng Việt.", img: "/assets/duoc-si.png" },
        { role: "Điều phối viên", title: "Điều phối viên chăm sóc", text: "Gọi điện hằng tháng, nhắc lịch và kết nối bạn với bác sĩ.", img: "/assets/dieu-phoi-vien.png" },
      ],
    },

    elig: {
      eyebrow: "Điều kiện & chi phí",
      title: "Bạn có đủ điều kiện tham gia không?",
      lede: "Dịch vụ dành cho người dùng Medicare Original. Hãy kiểm tra nhanh bên dưới.",
      cards: [
        { type: "ok", title: "Medicare Original", text: "Bạn đủ điều kiện tham gia. Hầu hết dịch vụ nằm trong quyền lợi Medicare, không phát sinh chi phí bất ngờ. Part B có thể chi trả cho dịch vụ Khám bệnh từ xa và Quản lý bệnh mãn tính. Part D có thể chi trả cho dịch vụ Rà soát thuốc.", pill: "✓ Được hỗ trợ" },
      ],
      cost: {
        title: "Chi phí của bạn là bao nhiêu?",
        text: "Đăng ký tra cứu miễn phí — chúng tôi sẽ kiểm tra quyền lợi Medicare và báo bạn rõ ràng.",
        cta: "Đăng ký tra cứu chi phí",
      },
      faqTitle: "Câu hỏi thường gặp",
      faqMore: "Xem thêm",
      faqs: [
        { q: "Tôi có phải trả thêm tiền không?", a: "Phần lớn dịch vụ nằm trong quyền lợi Medicare Original của bạn. Chúng tôi sẽ kiểm tra và thông báo rõ trước khi bắt đầu, không có chi phí bất ngờ." },
        { q: "Tôi không rành công nghệ thì sao?", a: "Bạn chỉ cần nghe điện thoại. Điều phối viên sẽ gọi cho bạn, hướng dẫn từng bước bằng tiếng Việt, chậm rãi và rõ ràng." },
        { q: "Người thân của tôi có tham gia cùng được không?", a: "Hoàn toàn được. Chúng tôi khuyến khích con cháu cùng tham gia để hỗ trợ và yên tâm hơn về sức khỏe của ông bà, cha mẹ." },
      ],
    },

    testi: {
      eyebrow: "Khách hàng nói gì",
      title: "Được tin tưởng bởi cộng đồng người Việt",
      stats: [
        { num: "2.000+", lbl: "bệnh nhân được chăm sóc" },
        { num: "12+", lbl: "tiểu bang phục vụ" },
        { num: "98%", lbl: "hài lòng với dịch vụ" },
      ],
      cards: [
        { quote: "Bác sĩ nói tiếng Việt nên tôi hiểu hết, không còn lo uống nhầm thuốc nữa.", name: "Cô Lan", place: "California", initials: "L" },
        { quote: "Mỗi tháng có người gọi hỏi thăm, tôi thấy yên tâm như có con cháu bên cạnh.", name: "Bác Hùng", place: "Texas", initials: "H" },
        { quote: "Không phải nhờ con chở đi khám xa nữa, tiện và đỡ mệt rất nhiều.", name: "Cô Mai", place: "Washington", initials: "M" },
      ],
      note: "Placeholder — sẽ thay bằng cảm nhận thật của khách hàng.",
    },

    form: {
      eyebrow: "Đăng ký",
      title: "Để lại thông tin, chúng tôi sẽ gọi lại cho bạn",
      lede: "Miễn phí và không ràng buộc. Một điều phối viên người Việt sẽ liên hệ trong 24 giờ.",
      fields: {
        name: "Họ và tên", namePh: "Ví dụ: Nguyễn Văn A",
        phone: "Số điện thoại", phonePh: "Ví dụ: 408-123-4567",
        services: "Dịch vụ bạn quan tâm",
        message: "Lời nhắn (không bắt buộc)", messagePh: "Bạn muốn được hỗ trợ điều gì?",
      },
      serviceOptions: ["Khám bệnh từ xa (Telehealth)", "Quản lý bệnh mãn tính (CCM)", "Rà soát thuốc (MTM)", "Tôi chưa chắc, cần tư vấn"],
      errName: "Vui lòng nhập họ tên",
      errPhone: "Vui lòng nhập số điện thoại hợp lệ",
      errSubmit: "Gửi không thành công. Vui lòng thử lại hoặc gọi hotline bên dưới.",
      submit: "Gửi đăng ký",
      submitting: "Đang gửi…",
      hotlinePre: "Hoặc gọi trực tiếp",
      success: { title: "Cảm ơn bạn đã đăng ký!", text: "Một điều phối viên người Việt sẽ gọi lại cho bạn trong vòng 24 giờ. Nếu cần gấp, hãy gọi hotline bên dưới." },
    },

    footer: {
      tagline: "Your Health. Your Language. Our Care.",
      desc: "Hệ thống chăm sóc sức khỏe tại nhà cho người Việt cao tuổi dùng Medicare trên khắp nước Mỹ.",
      contactTitle: "Liên hệ",
      navTitle: "Trang",
      chatTitle: "Nhắn tin với chúng tôi",
      disclaimer: "Disclaimer: Bạn có quyền từ chối hoặc rút khỏi chương trình chăm sóc bất kỳ lúc nào mà không ảnh hưởng đến quyền lợi Medicare Original. Điều kiện tham gia và chi trả phụ thuộc vào gói Medicare Original của từng khách hàng — trong đó dịch vụ Rà Soát Thuốc (MTM) yêu cầu thêm Medicare Part D. Để biết thêm về quyền lợi Medicare, gọi 1-800-MEDICARE (1-800-633-4227). Compass AgeWell không được CMS hay bất kỳ cơ quan chính phủ nào xác nhận hay bảo trợ.",
      rights: "© 2026 Compass AgeWell. Mọi quyền được bảo lưu.",
    },

    contactBar: { call: "Gọi", chat: "Nhắn tin" },
  },

  /* ===================== ENGLISH ===================== */
  en: {
    dir: "en",
    nav: [
      { id: "dichvu",  label: "Services" },
      { id: "team",    label: "Medical Team", type: "route", href: "/team" },
      { id: "dieukien", label: "FAQ" },
      { id: "dangky",  label: "Contact" },
      { id: "blog",    label: "Blog", type: "route", href: "/blog" },
    ],
    headerCta: "Get a free consult",
    hotline: { label: "Toll-free", number: "855-999-9911", tel: "+18559999911" },

    hero: {
      eyebrow: "Compass AgeWell",
      title: "Healthcare at home, in your own language",
      sub: "Vietnamese-speaking doctors, pharmacists and care coordinators by your side every month — by phone, right at home.",
      ctaPrimary: "Get a free consultation",
      hotlinePre: "Or call now",
      trust: ["Suitable for Medicare Original members", "We speak Vietnamese"],
      mediaLabel: "Photo: happy Vietnamese senior at home",
      badge: { title: "Care every month", sub: "Continuous, never interrupted" },
    },

    problem: {
      title: "Getting care in the U.S. isn't easy",
      lede: "Especially when you're older and English still feels uncomfortable.",
      cards: [
        { icon: "car", title: "Long travel", text: "Clinics are far away. You rely on family to drive you, losing half a day for one check-up." },
        { icon: "clock", title: "Hours of waiting", text: "You arrive only to wait, exhausted — when your health and legs won't allow it." },
        { icon: "message", title: "Language barrier", text: "Hard to describe symptoms, hard to follow the doctor, worried about the wrong medication." },
      ],
      bridge: "You deserve to be cared for. <b>Your loved ones deserve peace of mind.</b>",
    },

    services: {
      eyebrow: "Three core services",
      title: "One care system, three ways we walk with you",
      learnMore: "Learn more",
      cards: [
        { tag: "Telehealth", icon: "video", color: "blue",
          title: "Remote visits", text: "See a doctor by phone or video, right at home. No travel, no waiting room." },
        { tag: "CCM", icon: "calendar", color: "green",
          title: "Chronic care management", text: "Monthly monitoring for diabetes, blood pressure, heart health and more, with regular check-in calls." },
        { tag: "MTM", icon: "pill", color: "orange",
          title: "Medication review", text: "A pharmacist reviews every medication you take to avoid interactions and wrong doses." },
      ],
    },

    loop: {
      title: "Your health, monitored continuously — nothing missed",
      lede: "Every month is a closed care loop, not just treatment when things get serious.",
      steps: [
        { icon: "video",   color: "blue",   title: "Visit", text: "The doctor assesses your health over a call." },
        { icon: "calendar",color: "green",  title: "Manage", text: "We build a care plan and adjust medication as needed." },
        { icon: "pill",    color: "orange", title: "Monitor", text: "A coordinator follows up and checks in every month." },
      ],
      backLabel: "Repeat",
      message: "Every month, every call, every medication review is a touchpoint that <b>builds lasting health</b>.",
    },

    usp: {
      eyebrow: "Why choose us",
      title: "Care like family, to expert standards",
      items: [
        { icon: "shield", color: "green", title: "Comprehensive", text: "Visits, chronic care and medication review in one system — never fragmented." },
        { icon: "heart",  color: "orange", title: "Understanding", text: "A Vietnamese team that knows the culture, listens, and respects your family." },
        { icon: "repeat", color: "blue", title: "Continuous", text: "Steady care every month, not just when things turn serious." },
      ],
      teamTitle: "The people by your side",
      team: [
        { role: "Doctor", title: "Vietnamese-speaking doctor", text: "Assesses your health, diagnoses, and builds your treatment plan.", img: "/assets/bac-si.png" },
        { role: "Pharmacist", title: "Consulting pharmacist", text: "Reviews medications and explains them clearly in Vietnamese.", img: "/assets/duoc-si.png" },
        { role: "Coordinator", title: "Care coordinator", text: "Calls every month, sends reminders and connects you to your doctor.", img: "/assets/dieu-phoi-vien.png" },
      ],
    },

    elig: {
      eyebrow: "Eligibility & cost",
      title: "Are you eligible to join?",
      lede: "Our service is for Medicare Original members. Check quickly below.",
      cards: [
        { type: "ok", title: "Medicare Original", text: "You're eligible. Most services are covered by your Medicare benefits, with no surprise costs. Part B may cover Telehealth and Chronic Care Management. Part D may cover Medication Review.", pill: "✓ Supported" },
      ],
      cost: {
        title: "What will it cost you?",
        text: "Sign up for a free check — we'll review your Medicare benefits and explain it clearly.",
        cta: "Check my cost",
      },
      faqTitle: "Frequently asked questions",
      faqMore: "See more questions",
      faqs: [
        { q: "Do I have to pay extra?", a: "Most services are covered by your Medicare Original benefits. We check and explain everything clearly before we begin — no surprise costs." },
        { q: "What if I'm not good with technology?", a: "You only need to answer the phone. A coordinator calls you and guides every step in Vietnamese, slowly and clearly." },
        { q: "Can my family join with me?", a: "Absolutely. We encourage children and grandchildren to take part so everyone feels supported and reassured." },
      ],
    },

    testi: {
      eyebrow: "What members say",
      title: "Trusted by the Vietnamese community",
      stats: [
        { num: "2,000+", lbl: "patients cared for" },
        { num: "12+", lbl: "states served" },
        { num: "98%", lbl: "satisfied with the service" },
      ],
      cards: [
        { quote: "The doctor speaks Vietnamese so I understand everything — no more worry about wrong medication.", name: "Ms. Lan", place: "California", initials: "L" },
        { quote: "Someone calls every month to check on me. I feel reassured, like family is here.", name: "Mr. Hung", place: "Texas", initials: "H" },
        { quote: "No more asking my kids to drive me far for visits. So much easier and less tiring.", name: "Ms. Mai", place: "Washington", initials: "M" },
      ],
      note: "Placeholder — to be replaced with real member stories.",
    },

    form: {
      eyebrow: "Sign up",
      title: "Leave your details and we'll call you back",
      lede: "Free and no obligation. A Vietnamese coordinator will reach out within 24 hours.",
      fields: {
        name: "Full name", namePh: "e.g. John Nguyen",
        phone: "Phone number", phonePh: "e.g. 408-123-4567",
        services: "Services you're interested in",
        message: "Message (optional)", messagePh: "What would you like help with?",
      },
      serviceOptions: ["Remote visits (Telehealth)", "Chronic care (CCM)", "Medication review (MTM)", "Not sure yet, need advice"],
      errName: "Please enter your name",
      errPhone: "Please enter a valid phone number",
      errSubmit: "Something went wrong. Please try again or call the hotline below.",
      submit: "Submit",
      submitting: "Sending…",
      hotlinePre: "Or call us directly",
      success: { title: "Thank you for signing up!", text: "A Vietnamese coordinator will call you back within 24 hours. If it's urgent, please call the hotline below." },
    },

    footer: {
      tagline: "Your Health. Your Language. Our Care.",
      desc: "Healthcare at home for Vietnamese seniors on Medicare, across the United States.",
      contactTitle: "Contact",
      navTitle: "Pages",
      chatTitle: "Message us",
      disclaimer: "Disclaimer: You have the right to refuse or withdraw from the care program at any time without affecting your Medicare Original benefits. Eligibility and coverage depend on each member's Medicare Original plan — Medication Therapy Management (MTM) additionally requires Medicare Part D. For more information about Medicare benefits, call 1-800-MEDICARE (1-800-633-4227). Compass AgeWell is not endorsed or sponsored by CMS or any government agency.",
      rights: "© 2026 Compass AgeWell. All rights reserved.",
    },

    contactBar: { call: "Call", chat: "Chat" },
  },
};
