/* ============================================================
   COMPASS AGEWELL — Medical team page content (VI / EN)
   Source: BD design "Compass AgeWell - Doi Ngu Y Te" (Jul 2026).
   Key-parallel between languages, like service-content.js.
   Board certifications / training stay in English in both
   languages (proper names of US institutions).
   ============================================================ */

export const TEAM_CONTENT = {
  vi: {
    meta: {
      title: "Đội ngũ y tế",
      description:
        "Gặp gỡ đội ngũ bác sĩ, dược sĩ và điều phối viên song ngữ chăm sóc người Việt dùng Medicare trên khắp nước Mỹ.",
    },
    hero: {
      eyebrow: "Đội ngũ y tế · A service of Compass Medical Group, PC.",
      title: "Đội ngũ y tế tận tâm của Compass AgeWell",
      sub: "Chăm sóc bằng tiếng Việt – tận tâm theo từng bước điều trị, cho người Việt dùng Medicare trên khắp nước Mỹ.",
      ctaPrimary: "Đăng ký tư vấn dịch vụ",
    },
    pillars: [
      {
        icon: "heart",
        title: "Bác sĩ chuyên môn cao",
        text: "Nội khoa, hô hấp, lão khoa và y học gia đình — giám sát toàn diện mỗi ca bệnh.",
      },
      {
        icon: "pill",
        title: "Dược sĩ lâm sàng làm trung tâm",
        text: "Rà soát và tối ưu hóa thuốc hàng tháng, giảm rủi ro dùng thuốc sai hoặc trùng lặp.",
      },
      {
        icon: "users",
        title: "Điều phối viên song ngữ",
        text: "Luôn có người nói tiếng Việt đồng hành, kết nối bác sĩ, dược sĩ và gia đình bạn.",
      },
    ],
    intro: {
      title: "Một hệ thống chăm sóc, không phải một lần khám",
      text: "Compass AgeWell là hệ thống chăm sóc sức khỏe dành riêng cho người Việt dùng Medicare tại Mỹ. Chúng tôi cung cấp dịch vụ khám bệnh từ xa, quản lý bệnh mãn tính và tư vấn rà soát thuốc bằng tiếng Việt, không cần di chuyển.",
    },
    teamHead: {
      eyebrow: "Đội ngũ y tế",
      title: "Những con người đứng sau mỗi cuộc gọi",
    },
    labels: {
      boardCert: "Board Certification",
      training: "Đào tạo",
      experience: "Kinh nghiệm",
    },
    members: [
      {
        name: "Nguyễn Quốc Chương, M.D.",
        degree: "M.D.",
        tone: "green",
        photo: "/assets/team/chuong.png",
        specialty: "Y học gia đình",
        boardCert: ["American Board of Family Medicine (ABFM)"],
        training: [
          "Ross University School of Medicine",
          "Grant Medical Center (Residency)",
        ],
        experience: ["Y học gia đình", "Y học bệnh viện", "Chăm sóc người cao tuổi"],
      },
      {
        name: "Nguyễn Huy Andy, D.O.",
        degree: "D.O.",
        tone: "blue",
        photo: "/assets/team/huy.png",
        specialty: "Chuyên khoa Nội",
        boardCert: ["American Osteopathic Board of Internal Medicine (AOBIM)"],
        training: [
          "Touro University Nevada College of Osteopathic Medicine",
          "Corpus Christi Medical Center (Residency)",
        ],
        experience: [
          "Nội khoa tổng quát",
          "Chăm sóc người cao tuổi",
          "Y học hành vi & sức khỏe tâm thần",
          "Tele Post Acute Care / Sound Physicians",
        ],
      },
      {
        name: "Đạt D. Nguyễn, M.D., FCCP FACP",
        degree: "M.D., FCCP FACP",
        tone: "orange",
        photo: "/assets/team/dat.png",
        specialty: "Nội khoa – Hô hấp – Hồi sức tích cực",
        boardCert: [
          "Internal Medicine (NBPAS)",
          "Pulmonary Disease (ABIM)",
          "Critical Care Medicine (ABIM)",
        ],
        training: [
          "Kingman Regional Medical Center",
          "University of Pennsylvania Center for Connected Care",
        ],
        experience: [
          "Nội khoa tổng quát",
          "Bệnh hô hấp mãn tính",
          "Hồi sức tích cực & Tele-ICU",
        ],
      },
      {
        name: "Phạm Phú Ngọc, Pharm.D, MBA",
        degree: "Pharm.D, MBA",
        tone: "green",
        photo: "/assets/team/ngoc.png",
        specialty: "Dược lâm sàng ngoại trú",
        boardCert: [],
        training: [
          "Doctor of Pharmacy, University of Iowa",
          "MBA, University of Arizona, Eller College of Management",
        ],
        experience: [
          "Dược tin học lâm sàng",
          "Quản lý dược ngoại trú",
          "Rà soát thuốc cho bệnh nhân mãn tính / MTM",
        ],
      },
      {
        name: "Tuyền Lisa Nguyễn, RN, BSN",
        degree: "RN, BSN",
        tone: "blue",
        photo: "/assets/team/lisa.png",
        specialty: "Điều dưỡng cấp cứu",
        boardCert: [],
        training: [
          "Doctor of Nursing Practice (DNP-FNP) Student, University of California, Davis (2024–2027)",
        ],
        experience: [
          "Điều dưỡng cấp cứu",
          "Quản lý bệnh mãn tính",
          "Chăm sóc sức khỏe dự phòng",
        ],
      },
      {
        name: "Đỗ Phương Thảo, Pharm.D",
        degree: "Pharm.D",
        tone: "orange",
        photo: "/assets/team/thao.png",
        specialty: "Dược lâm sàng ngoại trú",
        boardCert: [],
        training: [
          "B.S. Biochemistry, UC San Diego",
          "Doctor of Pharmacy, Western University of Health Sciences",
        ],
        experience: [
          "Dược lâm sàng ngoại trú",
          "Quản lý dược hệ thống lớn (Kaiser)",
          "Rà soát và tối ưu hóa thuốc",
        ],
      },
    ],
    philosophy: {
      title: "Để người cao tuổi luôn được chăm sóc, và người thân luôn được an tâm",
      sub: "Đội ngũ của chúng tôi gồm các bác sĩ có chuyên môn sâu về bệnh nhân cao tuổi, dược sĩ lâm sàng và điều phối viên chăm sóc song ngữ — tất cả vận hành như một hệ thống chăm sóc liên tục, toàn diện.",
      items: [
        {
          icon: "globe",
          title: "Văn hóa trước, công nghệ sau",
          text: "Công nghệ chỉ là công cụ; sự thấu hiểu văn hóa và ngôn ngữ mới là nền tảng.",
        },
        {
          icon: "calendar",
          title: "Chăm sóc liên tục, không phải một lần khám",
          text: "Giá trị nằm ở việc theo dõi và quản lý sức khỏe lâu dài mỗi tháng.",
        },
        {
          icon: "heart",
          title: "Niềm tin trước, mở rộng sau",
          text: "Không có niềm tin thì không có bệnh nhân; mọi kết nối đều bắt đầu từ sự an tâm.",
        },
      ],
    },
  },

  en: {
    meta: {
      title: "Medical Team",
      description:
        "Meet the Vietnamese-speaking doctors, pharmacists and bilingual coordinators caring for Vietnamese Medicare members across America.",
    },
    hero: {
      eyebrow: "Medical team · A service of Compass Medical Group, PC.",
      title: "The dedicated medical team of Compass AgeWell",
      sub: "Care in Vietnamese — devoted at every step of treatment, for Vietnamese Medicare members across America.",
      ctaPrimary: "Request a consultation",
    },
    pillars: [
      {
        icon: "heart",
        title: "Highly specialized physicians",
        text: "Internal medicine, pulmonology, geriatrics and family medicine — comprehensive oversight of every case.",
      },
      {
        icon: "pill",
        title: "Clinical pharmacists at the center",
        text: "Monthly medication review and optimization, reducing the risk of wrong or duplicate medications.",
      },
      {
        icon: "users",
        title: "Bilingual care coordinators",
        text: "A Vietnamese speaker is always by your side, connecting doctors, pharmacists and your family.",
      },
    ],
    intro: {
      title: "A system of care, not a one-time visit",
      text: "Compass AgeWell is a healthcare system dedicated to Vietnamese Medicare members in the U.S. We provide telehealth visits, chronic care management and medication review counseling in Vietnamese — no travel needed.",
    },
    teamHead: {
      eyebrow: "Medical team",
      title: "The people behind every call",
    },
    labels: {
      boardCert: "Board Certification",
      training: "Education",
      experience: "Experience",
    },
    members: [
      {
        name: "Nguyễn Quốc Chương, M.D.",
        degree: "M.D.",
        tone: "green",
        photo: "/assets/team/chuong.png",
        specialty: "Family Medicine",
        boardCert: ["American Board of Family Medicine (ABFM)"],
        training: [
          "Ross University School of Medicine",
          "Grant Medical Center (Residency)",
        ],
        experience: ["Family medicine", "Hospital medicine", "Geriatric care"],
      },
      {
        name: "Nguyễn Huy Andy, D.O.",
        degree: "D.O.",
        tone: "blue",
        photo: "/assets/team/huy.png",
        specialty: "Internal Medicine",
        boardCert: ["American Osteopathic Board of Internal Medicine (AOBIM)"],
        training: [
          "Touro University Nevada College of Osteopathic Medicine",
          "Corpus Christi Medical Center (Residency)",
        ],
        experience: [
          "General internal medicine",
          "Geriatric care",
          "Behavioral medicine & mental health",
          "Tele Post Acute Care / Sound Physicians",
        ],
      },
      {
        name: "Đạt D. Nguyễn, M.D., FCCP FACP",
        degree: "M.D., FCCP FACP",
        tone: "orange",
        photo: "/assets/team/dat.png",
        specialty: "Internal Medicine – Pulmonology – Critical Care",
        boardCert: [
          "Internal Medicine (NBPAS)",
          "Pulmonary Disease (ABIM)",
          "Critical Care Medicine (ABIM)",
        ],
        training: [
          "Kingman Regional Medical Center",
          "University of Pennsylvania Center for Connected Care",
        ],
        experience: [
          "General internal medicine",
          "Chronic respiratory disease",
          "Critical care & Tele-ICU",
        ],
      },
      {
        name: "Phạm Phú Ngọc, Pharm.D, MBA",
        degree: "Pharm.D, MBA",
        tone: "green",
        photo: "/assets/team/ngoc.png",
        specialty: "Ambulatory Clinical Pharmacy",
        boardCert: [],
        training: [
          "Doctor of Pharmacy, University of Iowa",
          "MBA, University of Arizona, Eller College of Management",
        ],
        experience: [
          "Clinical pharmacy informatics",
          "Ambulatory pharmacy management",
          "Medication review for chronic patients / MTM",
        ],
      },
      {
        name: "Tuyền Lisa Nguyễn, RN, BSN",
        degree: "RN, BSN",
        tone: "blue",
        photo: "/assets/team/lisa.png",
        specialty: "Emergency Nursing",
        boardCert: [],
        training: [
          "Doctor of Nursing Practice (DNP-FNP) Student, University of California, Davis (2024–2027)",
        ],
        experience: [
          "Emergency nursing",
          "Chronic disease management",
          "Preventive care",
        ],
      },
      {
        name: "Đỗ Phương Thảo, Pharm.D",
        degree: "Pharm.D",
        tone: "orange",
        photo: "/assets/team/thao.png",
        specialty: "Ambulatory Clinical Pharmacy",
        boardCert: [],
        training: [
          "B.S. Biochemistry, UC San Diego",
          "Doctor of Pharmacy, Western University of Health Sciences",
        ],
        experience: [
          "Ambulatory clinical pharmacy",
          "Large health-system pharmacy (Kaiser)",
          "Medication review & optimization",
        ],
      },
    ],
    philosophy: {
      title: "So seniors are always cared for, and families always at ease",
      sub: "Our team brings together physicians with deep expertise in older patients, clinical pharmacists and bilingual care coordinators — all operating as one continuous, comprehensive system of care.",
      items: [
        {
          icon: "globe",
          title: "Culture first, technology second",
          text: "Technology is only a tool; cultural and language understanding is the foundation.",
        },
        {
          icon: "calendar",
          title: "Continuous care, not a one-time visit",
          text: "The value lies in long-term health monitoring and management, month after month.",
        },
        {
          icon: "heart",
          title: "Trust before scale",
          text: "Without trust there are no patients; every connection begins with peace of mind.",
        },
      ],
    },
  },
};
