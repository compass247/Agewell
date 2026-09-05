/* ============================================================
   COMPASS MEDICAL GROUP — /cmg landing page content
   Bilingual (vi / en), key-parallel: same shape in both languages so the page
   component never branches on locale. Copy comes from the Claude Design export
   ("Landing page cho Compass Ecosystem") — the EN strings are its markup, the
   VI strings its embedded VI dictionary.

   This is the PARENT company page (Compass Medical Group, P.C.), not AgeWell:
   it has its own header/footer and links OUT to AgeWell and Vietnam Care, so
   it deliberately does not reuse BlogChrome.
   ============================================================ */
import { SITE_URL, OG_LOCALE, languageAlternates } from "./seo.js";

const IMG = "/assets/cmg";

// Images are locale-independent — declared once, merged in by getCmgContent.
const MEDIA = {
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.webp`,
  eco: [`${IMG}/eco-1.webp`, `${IMG}/eco-2.webp`, `${IMG}/eco-3.webp`, `${IMG}/eco-4.webp`],
  agewell: `${IMG}/svc-agewell.webp`,
  c247: `${IMG}/svc-247.webp`,
  companion: `${IMG}/svc-companion.webp`,
  vietnam: `${IMG}/svc-vietnam.webp`,
  journey: `${IMG}/journey.webp`,
};

// Same in both languages; tel: keeps digits only.
export const CMG_CONTACT = {
  tel: "8559999911",
  phone: "855-999-9911",
  // Hộp thư này CHƯA được tạo, nên footer đang ẩn địa chỉ đi — hiện lên chỉ
  // khiến người dùng gửi thư vào hư không. Đổi emailLive thành true là hiện
  // lại, không phải sửa gì thêm.
  email: "info@compassmedicalgroup.com",
  emailLive: false,
};

export const CMG_CONTENT = {
  en: {
    // alt text for the header lockup — keeps the company name in the HTML
    // now that the header shows an image instead of live text.
    brand: { alt: "Compass Medical Group, P. C." },
    nav: {
      services: "Services",
      how: "How It Works",
      why: "Why Compass",
      who: "Who We Serve",
      partners: "Partners",
      cta: "Explore Services",
    },
    hero: {
      eyebrow: "Compass Medical Group",
      title1: "One Ecosystem.",
      title2: "Connected Healthcare.",
      p1: "Healthcare should feel connected — across everyday needs, urgent concerns, ongoing care, and the people who support you.",
      p2: "Compass brings together healthcare services, physician-led care, intelligent technology, and an integrated care team to make healthcare more accessible, coordinated, and continuous.",
      cta1: "Explore Our Services",
      cta2: "How Compass Works",
      alt: "An older adult at home being supported by their care team.",
    },
    eco: {
      title: "Healthcare is more than a single visit.",
      p: [
        "A healthcare journey rarely happens in one place or at one moment.",
        "You may need ongoing support for a chronic condition, help understanding a medication, an answer to a health concern after hours, or guidance when seeking care while traveling.",
        "Compass connects different points of care into one ecosystem — helping people move between services and moments of need with greater continuity and confidence.",
      ],
      cards: [
        { t: "Access Care", d: "Get the right support when a healthcare need arises." },
        { t: "Manage Your Health", d: "Stay on top of chronic conditions, medications, and ongoing care." },
        { t: "Stay Supported", d: "Keep connected with care teams, family, and everyday health support." },
        { t: "Navigate Care", d: "Get guidance when healthcare becomes unfamiliar or more complicated." },
      ],
      close: "Different needs. Different moments. One connected healthcare ecosystem.",
    },
    services: {
      eyebrow: "Our Services",
      title: "Different needs. One connected ecosystem.",
      sub: "Compass brings together services designed around different healthcare needs — from ongoing care for older adults to 24/7 access, everyday support, and healthcare navigation in Vietnam.",
      agewell: {
        name: "Compass AgeWell",
        tagline: "Comprehensive, continuous care for older adults.",
        p: [
          "Compass AgeWell helps older adults manage their health with ongoing support from a dedicated care team.",
          "From chronic condition management and medication review to telehealth and regular check-ins, AgeWell helps make healthcare more continuous and easier to manage from home.",
        ],
        list: [
          "Chronic Care Management",
          "Medication Management & Review",
          "Telehealth",
          "Regular health monitoring and check-ins",
          "Care coordination and appointment support",
        ],
        quote: "Care that stays with you — not just care when you need a visit.",
        cta: "Visit Compass AgeWell",
        alt: "An older adult at home reviewing medications with a care team member.",
      },
      c247: {
        name: "Compass 24/7",
        badge: "Coming Soon",
        tagline: "Healthcare access, whenever you need it.",
        p: [
          "Compass 24/7 combines AI-powered intake with physician-led care to help people get healthcare guidance beyond traditional office hours.",
          "Members can interact through voice or chat. AI gathers and organizes relevant information, a Vietnamese physician provides clinical assessment, and a U.S.-licensed physician reviews and approves the care plan when required.",
        ],
        list: [
          "Available 24/7",
          "AI-powered intake",
          "Physician-led clinical review",
          "Vietnamese-language support",
          "Guidance and next steps",
          "Prescription support when clinically appropriate",
        ],
        quote: "Faster access. Smarter intake. Physician-led care.",
        alt: "A person getting healthcare support by phone in the evening.",
      },
      companion: {
        name: "Compass Companion",
        badge: "Coming Soon",
        tagline: "Everyday support for older adults.",
        p: [
          "Compass Companion is a bilingual AI companion designed primarily to support older adults in their everyday lives.",
          "It helps older adults stay connected, remember important health routines, better understand their medications, and surface concerns that may need additional attention.",
        ],
        tags: [
          "Proactive Check-ins",
          "Conversation & Memory",
          "Health Reminders",
          "Making Sense of Prescriptions",
          "Detection & Escalation",
        ],
        quote: "Technology that helps older adults stay connected, supported, and on track.",
        alt: "An older adult talking naturally with a device at home.",
      },
      vietnam: {
        name: "Compass Vietnam Care",
        tagline: "Healthcare support while you're in Vietnam.",
        p: [
          "Compass Vietnam Care helps overseas Vietnamese navigate healthcare when traveling back to Vietnam.",
          "From finding appropriate care to coordinating appointments, diagnostics, referrals, and medical information, Compass helps make healthcare in Vietnam easier to navigate.",
        ],
        list: [
          "Healthcare coordination in Vietnam",
          "Guidance on hospitals and clinics",
          "Support with labs and diagnostic imaging",
          "Care coordination and referrals",
          "Help navigating the local healthcare system",
          "Support connecting medical information across countries",
        ],
        quote: "Go back to Vietnam. Feel supported when healthcare gets complicated.",
        cta: "Explore Compass Vietnam Care",
        href: "https://compass247.vn/en",
        alt: "A traveler navigating healthcare in Vietnam.",
      },
    },
    how: {
      eyebrow: "How The Ecosystem Connects",
      title: "One person can need more than one kind of care.",
      p: [
        "Healthcare needs change over time.",
        "Someone may need ongoing support for a chronic condition, an answer to an urgent question after hours, help staying on track with medications, or assistance navigating healthcare while traveling.",
        "Compass is designed so these needs don't have to exist in isolation.",
      ],
      alt: "One family's healthcare journey across different moments of need.",
      steps: [
        {
          n: "01",
          t: "Ongoing Care",
          d: "A member uses Compass AgeWell for continuous support managing chronic conditions and medications.",
        },
        {
          n: "02",
          t: "An After-Hours Concern",
          d: "A new health concern comes up outside regular office hours. Compass 24/7 provides an accessible pathway to healthcare guidance.",
        },
        {
          n: "03",
          t: "Everyday Support",
          d: "Compass Companion helps the member stay on track with reminders, conversations, and everyday health routines.",
        },
        {
          n: "04",
          t: "Traveling to Vietnam",
          d: "When the member travels back to Vietnam, Compass Vietnam Care helps navigate local healthcare and coordinate care.",
        },
      ],
      close: "Different services. One connected journey.",
    },
    why: {
      eyebrow: "Why Compass",
      title: "Healthcare, powered by people and technology.",
      sub: "Compass combines physician-led care with intelligent technology and an integrated Vietnam-based operating team to create a healthcare model that is more accessible, efficient, and responsive.",
      cards: [
        {
          n: "01",
          kicker: "AI-Powered Healthcare",
          t: "AI helps healthcare move faster.",
          p: [
            "AI can support intake, information gathering, organization, communication, and care workflows — helping healthcare teams respond more efficiently and making support available beyond traditional office hours.",
          ],
        },
        {
          n: "02",
          kicker: "Physician-Led, Technology-Enabled",
          t: "Technology doesn't replace physicians. It helps physicians care better.",
          p: [
            "Compass combines intelligent technology with physician oversight.",
            "AI helps gather and organize information. Clinical decisions remain with qualified physicians, creating a model that combines the speed of technology with the judgment and accountability of human care.",
          ],
        },
        {
          n: "03",
          kicker: "Vietnam-Based Talent & Operations",
          t: "Global healthcare. A more efficient operating model.",
          p: [
            "Compass leverages healthcare, technology, and operational talent in Vietnam as part of an integrated operating model serving the U.S. market.",
            "Rather than simply outsourcing individual functions, Compass is building an integrated system across clinical support, technology, operations, and customer service.",
          ],
        },
        {
          n: "04",
          kicker: "Better Access, Including After Hours",
          t: "Healthcare doesn't stop at 5 PM.",
          p: [
            "By combining AI-powered workflows with an efficient operating model and physician oversight, Compass can help extend access beyond traditional U.S. business hours.",
            "The goal is simple: when people need healthcare support, getting started shouldn't have to wait until tomorrow.",
          ],
        },
        {
          n: "05",
          kicker: "Lower Cost, More Access",
          t: "A more efficient model can mean more affordable care.",
          p: [
            "AI-optimized operations and Vietnam-based resources allow Compass to reduce the cost of delivering healthcare services — helping keep prices reasonable and making access more attainable for customers.",
          ],
        },
      ],
      close: "Technology doesn't replace human care. It helps make human care more accessible, efficient, and continuous.",
    },
    who: {
      eyebrow: "Who Compass Serves",
      title: "Healthcare that adapts to different people and different moments.",
      sub: "Compass is building an ecosystem that can support people across different stages of life and different healthcare situations.",
      cards: [
        {
          icon: "heart",
          t: "Older Adults",
          sub: "More support for managing health over time.",
          p: [
            "Older adults may need help managing chronic conditions, medications, appointments, and everyday health routines.",
            "Compass brings together AgeWell and Companion to provide both clinical and everyday support.",
          ],
        },
        {
          icon: "users",
          t: "Families & Caregivers",
          sub: "Support for the people who care from near or far.",
          p: [
            "When families cannot always be there in person, Compass can help provide greater visibility, coordination, and support around an older adult's healthcare journey.",
          ],
        },
        {
          icon: "clock",
          t: "People Seeking Convenient Healthcare Access",
          sub: "Healthcare support when it's needed.",
          p: [
            "For people who need guidance outside traditional office hours or want a more convenient way to begin addressing a health concern, Compass provides technology-enabled access backed by physicians.",
          ],
        },
        {
          icon: "globe",
          t: "People Connected to Both the U.S. & Vietnam",
          sub: "Healthcare support across borders.",
          p: [
            "For overseas Vietnamese traveling between the U.S. and Vietnam, Compass helps bridge healthcare experiences across two healthcare systems.",
          ],
        },
      ],
      close: "Different people. Different needs. One ecosystem built to support them.",
    },
    vision: {
      eyebrow: "Our Vision & Mission",
      title: "A more connected way to experience healthcare.",
      visionLabel: "Vision",
      vision:
        "To make healthcare more supportive, accessible, and connected through the combination of human care and intelligent technology.",
      missionLabel: "Mission",
      mission:
        "Compass is building a connected healthcare ecosystem where physicians, care teams, technology, and services work together to help people access, understand, and manage their healthcare with greater confidence.",
      beliefs: [
        "We believe healthcare should not feel fragmented.",
        "The right technology can connect information.",
        "The right care team can provide continuity.",
        "The right operating model can make care more accessible.",
        "Together, they can create a better healthcare experience.",
      ],
    },
    partners: {
      eyebrow: "Partners & Ecosystem",
      title: "Healthcare works better when the right people work together.",
      p: [
        "No healthcare organization can address every need alone.",
        "Compass works with organizations across the healthcare ecosystem to help connect people with the services, expertise, and support they need.",
      ],
      cta: "Partner With Compass",
      items: [
        { t: "Primary Care & Medical Practices", d: "Connect patients to additional healthcare services and ongoing support." },
        { t: "Pharmacies", d: "Support medication-related needs and coordinated care." },
        { t: "Home Health & Care Organizations", d: "Extend support beyond the clinic." },
        { t: "Community Organizations", d: "Help people access trusted healthcare resources." },
        { t: "Healthcare & Insurance Partners", d: "Create pathways to more accessible and coordinated care." },
        { t: "Travel & Cross-Border Partners", d: "Help people navigate healthcare between the U.S. and Vietnam." },
      ],
    },
    final: {
      title: "Healthcare, connected.",
      p: [
        "From ongoing care to everyday support.",
        "From urgent questions to healthcare access while traveling.",
        "Compass brings different points of care together to make the healthcare journey simpler, more connected, and more supportive.",
      ],
      call: `Call Compass — ${CMG_CONTACT.phone}`,
      partner: "Partner With Compass",
    },
    footer: {
      tagline: "One Ecosystem. Connected Healthcare.",
      servicesLabel: "Services",
      companyLabel: "Company",
      contactLabel: "Contact",
      entity: "Compass Medical Group, P.C.",
      legal: "© 2026 Compass Medical Group, P.C.",
      logoAlt: "Compass Medical Group, P.C.",
    },
    langLabel: "Language",
    meta: {
      title: "Compass Medical Group — One Ecosystem. Connected Healthcare.",
      description:
        "Compass Medical Group brings together physician-led care, intelligent technology, and an integrated care team — AgeWell, 24/7, Companion, and Vietnam Care — into one connected healthcare ecosystem.",
    },
  },

  vi: {
    // alt text for the header lockup — keeps the company name in the HTML
    // now that the header shows an image instead of live text.
    brand: { alt: "Compass Medical Group, P. C." },
    nav: {
      services: "Dịch vụ",
      how: "Cách hoạt động",
      why: "Vì sao chọn Compass",
      who: "Đối tượng phục vụ",
      partners: "Đối tác",
      cta: "Khám phá dịch vụ",
    },
    hero: {
      eyebrow: "Compass Medical Group",
      title1: "Một hệ sinh thái.",
      title2: "Chăm sóc y tế kết nối.",
      p1: "Chăm sóc sức khỏe nên là một trải nghiệm liền mạch — từ những nhu cầu thường ngày, những lo lắng cấp thiết, việc điều trị lâu dài, đến những người luôn ở bên hỗ trợ bạn.",
      p2: "Compass kết hợp các dịch vụ y tế, sự chăm sóc do bác sĩ dẫn dắt, công nghệ thông minh và một đội ngũ chăm sóc tích hợp để việc khám chữa bệnh trở nên dễ tiếp cận, phối hợp tốt hơn và liên tục hơn.",
      cta1: "Khám phá dịch vụ của chúng tôi",
      cta2: "Compass hoạt động thế nào",
      alt: "Người lớn tuổi tại nhà được đội ngũ chăm sóc hỗ trợ.",
    },
    eco: {
      title: "Chăm sóc sức khỏe không chỉ là một lần thăm khám.",
      p: [
        "Hành trình sức khỏe hiếm khi diễn ra ở một nơi hay trong một thời điểm duy nhất.",
        "Bạn có thể cần hỗ trợ lâu dài cho một bệnh mạn tính, cần hiểu rõ về một loại thuốc, cần câu trả lời cho một lo lắng sức khỏe ngoài giờ làm việc, hoặc cần hướng dẫn khi tìm nơi khám chữa bệnh trong lúc đi xa.",
        "Compass kết nối các điểm chăm sóc khác nhau thành một hệ sinh thái — giúp mọi người di chuyển giữa các dịch vụ và các thời điểm cần hỗ trợ với sự liên tục và tự tin hơn.",
      ],
      cards: [
        { t: "Tiếp cận chăm sóc", d: "Nhận được sự hỗ trợ phù hợp khi có nhu cầu về sức khỏe." },
        { t: "Quản lý sức khỏe", d: "Theo sát các bệnh mạn tính, thuốc men và việc điều trị lâu dài." },
        { t: "Luôn được hỗ trợ", d: "Giữ kết nối với đội ngũ chăm sóc, gia đình và hỗ trợ sức khỏe hằng ngày." },
        { t: "Định hướng chăm sóc", d: "Được hướng dẫn khi việc khám chữa bệnh trở nên lạ lẫm hoặc phức tạp hơn." },
      ],
      close: "Nhu cầu khác nhau. Thời điểm khác nhau. Một hệ sinh thái y tế kết nối.",
    },
    services: {
      eyebrow: "Dịch vụ của chúng tôi",
      title: "Nhu cầu khác nhau. Một hệ sinh thái kết nối.",
      sub: "Compass kết hợp các dịch vụ được thiết kế quanh những nhu cầu sức khỏe khác nhau — từ chăm sóc lâu dài cho người lớn tuổi đến tiếp cận 24/7, hỗ trợ hằng ngày và định hướng y tế tại Việt Nam.",
      agewell: {
        name: "Compass AgeWell",
        tagline: "Chăm sóc toàn diện, liên tục cho người lớn tuổi.",
        p: [
          "Compass AgeWell giúp người lớn tuổi quản lý sức khỏe với sự hỗ trợ liên tục từ một đội ngũ chăm sóc riêng.",
          "Từ quản lý bệnh mạn tính và rà soát thuốc đến khám từ xa và các buổi kiểm tra định kỳ, AgeWell giúp việc chăm sóc sức khỏe liền mạch hơn và dễ quản lý hơn ngay tại nhà.",
        ],
        list: [
          "Quản lý bệnh mạn tính",
          "Quản lý & rà soát thuốc",
          "Khám từ xa",
          "Theo dõi sức khỏe và kiểm tra định kỳ",
          "Phối hợp chăm sóc và hỗ trợ lịch hẹn",
        ],
        quote: "Sự chăm sóc luôn đi cùng bạn — không chỉ khi bạn cần một lần thăm khám.",
        cta: "Tìm hiểu Compass AgeWell",
        alt: "Người lớn tuổi tại nhà cùng nhân viên chăm sóc rà soát thuốc.",
      },
      c247: {
        name: "Compass 24/7",
        badge: "Sắp ra mắt",
        tagline: "Tiếp cận y tế, bất cứ khi nào bạn cần.",
        p: [
          "Compass 24/7 kết hợp tiếp nhận thông tin bằng AI với sự chăm sóc do bác sĩ dẫn dắt, giúp mọi người nhận được hướng dẫn y tế ngoài giờ làm việc truyền thống.",
          "Thành viên có thể tương tác bằng giọng nói hoặc tin nhắn. AI thu thập và sắp xếp thông tin liên quan, bác sĩ Việt Nam thực hiện đánh giá lâm sàng, và bác sĩ có giấy phép tại Hoa Kỳ xem xét, phê duyệt kế hoạch chăm sóc khi cần thiết.",
        ],
        list: [
          "Hoạt động 24/7",
          "Tiếp nhận thông tin bằng AI",
          "Đánh giá lâm sàng do bác sĩ dẫn dắt",
          "Hỗ trợ tiếng Việt",
          "Hướng dẫn và các bước tiếp theo",
          "Hỗ trợ kê thuốc khi phù hợp về mặt lâm sàng",
        ],
        quote: "Tiếp cận nhanh hơn. Tiếp nhận thông minh hơn. Chăm sóc do bác sĩ dẫn dắt.",
        alt: "Một người nhận hỗ trợ y tế qua điện thoại vào buổi tối.",
      },
      companion: {
        name: "Compass Companion",
        badge: "Sắp ra mắt",
        tagline: "Hỗ trợ hằng ngày cho người lớn tuổi.",
        p: [
          "Compass Companion là người đồng hành AI song ngữ, được thiết kế trước hết để hỗ trợ người lớn tuổi trong cuộc sống hằng ngày.",
          "Companion giúp người lớn tuổi giữ kết nối, ghi nhớ các thói quen sức khỏe quan trọng, hiểu rõ hơn về thuốc của mình và nhận ra những vấn đề có thể cần được quan tâm thêm.",
        ],
        tags: [
          "Chủ động hỏi thăm",
          "Trò chuyện & ghi nhớ",
          "Nhắc nhở sức khỏe",
          "Hiểu rõ đơn thuốc",
          "Phát hiện & chuyển tiếp",
        ],
        quote: "Công nghệ giúp người lớn tuổi giữ kết nối, được hỗ trợ và đi đúng hướng.",
        alt: "Người lớn tuổi trò chuyện tự nhiên với thiết bị tại nhà.",
      },
      vietnam: {
        name: "Compass Vietnam Care",
        tagline: "Hỗ trợ y tế khi bạn ở Việt Nam.",
        p: [
          "Compass Vietnam Care giúp người Việt ở nước ngoài định hướng việc khám chữa bệnh khi trở về Việt Nam.",
          "Từ việc tìm nơi khám phù hợp đến phối hợp lịch hẹn, xét nghiệm, chuyển tuyến và hồ sơ y tế, Compass giúp việc khám chữa bệnh tại Việt Nam trở nên dễ dàng hơn.",
        ],
        list: [
          "Phối hợp chăm sóc y tế tại Việt Nam",
          "Hướng dẫn về bệnh viện và phòng khám",
          "Hỗ trợ xét nghiệm và chẩn đoán hình ảnh",
          "Phối hợp chăm sóc và chuyển tuyến",
          "Hỗ trợ định hướng trong hệ thống y tế địa phương",
          "Hỗ trợ kết nối hồ sơ y tế giữa hai quốc gia",
        ],
        quote: "Về Việt Nam. Luôn được hỗ trợ khi việc khám chữa bệnh trở nên phức tạp.",
        cta: "Khám phá Compass Vietnam Care",
        href: "https://compass247.vn/vi",
        alt: "Người Việt xa quê tìm nơi khám chữa bệnh khi về Việt Nam.",
      },
    },
    how: {
      eyebrow: "Hệ sinh thái kết nối như thế nào",
      title: "Một người có thể cần nhiều hình thức chăm sóc khác nhau.",
      p: [
        "Nhu cầu sức khỏe thay đổi theo thời gian.",
        "Một người có thể cần hỗ trợ lâu dài cho bệnh mạn tính, cần câu trả lời cho một câu hỏi cấp thiết ngoài giờ, cần giúp đỡ để dùng thuốc đúng lịch, hoặc cần hỗ trợ định hướng y tế khi đi xa.",
        "Compass được thiết kế để những nhu cầu này không còn tồn tại riêng lẻ.",
      ],
      alt: "Hành trình sức khỏe của một gia đình qua những thời điểm khác nhau.",
      steps: [
        {
          n: "01",
          t: "Chăm sóc liên tục",
          d: "Thành viên sử dụng Compass AgeWell để được hỗ trợ liên tục trong việc quản lý bệnh mạn tính và thuốc men.",
        },
        {
          n: "02",
          t: "Một lo lắng ngoài giờ",
          d: "Một vấn đề sức khỏe mới xuất hiện ngoài giờ làm việc. Compass 24/7 mở ra một lối tiếp cận hướng dẫn y tế.",
        },
        {
          n: "03",
          t: "Hỗ trợ hằng ngày",
          d: "Compass Companion giúp thành viên duy trì nhắc nhở, trò chuyện và các thói quen sức khỏe hằng ngày.",
        },
        {
          n: "04",
          t: "Về Việt Nam",
          d: "Khi thành viên trở về Việt Nam, Compass Vietnam Care giúp định hướng hệ thống y tế địa phương và phối hợp chăm sóc.",
        },
      ],
      close: "Nhiều dịch vụ khác nhau. Một hành trình kết nối.",
    },
    why: {
      eyebrow: "Vì sao chọn Compass",
      title: "Chăm sóc y tế, vận hành bởi con người và công nghệ.",
      sub: "Compass kết hợp sự chăm sóc do bác sĩ dẫn dắt với công nghệ thông minh và một đội ngũ vận hành tích hợp tại Việt Nam, tạo nên mô hình y tế dễ tiếp cận, hiệu quả và nhanh nhạy hơn.",
      cards: [
        {
          n: "01",
          kicker: "Y tế được hỗ trợ bởi AI",
          t: "AI giúp việc chăm sóc y tế diễn ra nhanh hơn.",
          p: [
            "AI có thể hỗ trợ tiếp nhận, thu thập và sắp xếp thông tin, giao tiếp và các quy trình chăm sóc — giúp đội ngũ y tế phản hồi hiệu quả hơn và mở rộng sự hỗ trợ ra ngoài giờ làm việc truyền thống.",
          ],
        },
        {
          n: "02",
          kicker: "Bác sĩ dẫn dắt, công nghệ hỗ trợ",
          t: "Công nghệ không thay thế bác sĩ. Công nghệ giúp bác sĩ chăm sóc tốt hơn.",
          p: [
            "Compass kết hợp công nghệ thông minh với sự giám sát của bác sĩ.",
            "AI giúp thu thập và sắp xếp thông tin. Các quyết định lâm sàng vẫn thuộc về bác sĩ có chuyên môn, tạo nên mô hình kết hợp tốc độ của công nghệ với sự phán đoán và trách nhiệm của con người.",
          ],
        },
        {
          n: "03",
          kicker: "Nhân lực & vận hành tại Việt Nam",
          t: "Y tế toàn cầu. Một mô hình vận hành hiệu quả hơn.",
          p: [
            "Compass phát huy nguồn nhân lực y tế, công nghệ và vận hành tại Việt Nam như một phần của mô hình vận hành tích hợp phục vụ thị trường Hoa Kỳ.",
            "Thay vì chỉ thuê ngoài từng chức năng riêng lẻ, Compass đang xây dựng một hệ thống tích hợp bao gồm hỗ trợ lâm sàng, công nghệ, vận hành và dịch vụ khách hàng.",
          ],
        },
        {
          n: "04",
          kicker: "Tiếp cận tốt hơn, kể cả ngoài giờ",
          t: "Nhu cầu sức khỏe không dừng lại lúc 5 giờ chiều.",
          p: [
            "Bằng cách kết hợp quy trình vận hành có AI với mô hình hiệu quả và sự giám sát của bác sĩ, Compass giúp mở rộng khả năng tiếp cận ra ngoài giờ làm việc thông thường tại Hoa Kỳ.",
            "Mục tiêu rất đơn giản: khi cần hỗ trợ y tế, việc bắt đầu không nên phải chờ đến ngày mai.",
          ],
        },
        {
          n: "05",
          kicker: "Chi phí thấp hơn, tiếp cận nhiều hơn",
          t: "Một mô hình hiệu quả hơn có thể mang lại dịch vụ hợp lý hơn.",
          p: [
            "Vận hành được tối ưu bằng AI cùng nguồn lực tại Việt Nam giúp Compass giảm chi phí cung cấp dịch vụ y tế — giữ mức giá hợp lý và giúp nhiều người tiếp cận được hơn.",
          ],
        },
      ],
      close: "Công nghệ không thay thế sự chăm sóc của con người. Công nghệ giúp sự chăm sóc ấy dễ tiếp cận, hiệu quả và liên tục hơn.",
    },
    who: {
      eyebrow: "Compass phục vụ ai",
      title: "Chăm sóc y tế thích ứng với từng người và từng thời điểm.",
      sub: "Compass đang xây dựng một hệ sinh thái có thể hỗ trợ mọi người qua những giai đoạn khác nhau của cuộc sống và những tình huống sức khỏe khác nhau.",
      cards: [
        {
          icon: "heart",
          t: "Người lớn tuổi",
          sub: "Nhiều hỗ trợ hơn để quản lý sức khỏe theo thời gian.",
          p: [
            "Người lớn tuổi có thể cần giúp đỡ trong việc quản lý bệnh mạn tính, thuốc men, lịch hẹn và các thói quen sức khỏe hằng ngày.",
            "Compass kết hợp AgeWell và Companion để mang lại cả hỗ trợ lâm sàng và hỗ trợ hằng ngày.",
          ],
        },
        {
          icon: "users",
          t: "Gia đình & người chăm sóc",
          sub: "Hỗ trợ cho những người quan tâm, dù ở gần hay ở xa.",
          p: [
            "Khi gia đình không thể luôn có mặt, Compass giúp mang lại sự minh bạch, phối hợp và hỗ trợ tốt hơn trong hành trình sức khỏe của người lớn tuổi.",
          ],
        },
        {
          icon: "clock",
          t: "Người cần tiếp cận y tế thuận tiện",
          sub: "Hỗ trợ y tế đúng lúc cần đến.",
          p: [
            "Với những người cần hướng dẫn ngoài giờ làm việc truyền thống hoặc muốn một cách thuận tiện hơn để bắt đầu xử lý một vấn đề sức khỏe, Compass mang đến khả năng tiếp cận có công nghệ hỗ trợ và bác sĩ đứng sau.",
          ],
        },
        {
          icon: "globe",
          t: "Người gắn bó với cả Hoa Kỳ & Việt Nam",
          sub: "Hỗ trợ y tế xuyên biên giới.",
          p: [
            "Với người Việt ở nước ngoài thường xuyên đi lại giữa Hoa Kỳ và Việt Nam, Compass giúp kết nối trải nghiệm y tế giữa hai hệ thống.",
          ],
        },
      ],
      close: "Những con người khác nhau. Những nhu cầu khác nhau. Một hệ sinh thái được xây dựng để hỗ trợ họ.",
    },
    vision: {
      eyebrow: "Tầm nhìn & sứ mệnh",
      title: "Một cách trải nghiệm y tế kết nối hơn.",
      visionLabel: "Tầm nhìn",
      vision:
        "Làm cho việc chăm sóc sức khỏe trở nên gần gũi, dễ tiếp cận và kết nối hơn, thông qua sự kết hợp giữa chăm sóc của con người và công nghệ thông minh.",
      missionLabel: "Sứ mệnh",
      mission:
        "Compass đang xây dựng một hệ sinh thái y tế kết nối, nơi bác sĩ, đội ngũ chăm sóc, công nghệ và dịch vụ cùng phối hợp để giúp mọi người tiếp cận, hiểu và quản lý sức khỏe của mình một cách tự tin hơn.",
      beliefs: [
        "Chúng tôi tin việc chăm sóc sức khỏe không nên rời rạc.",
        "Công nghệ đúng đắn có thể kết nối thông tin.",
        "Đội ngũ chăm sóc đúng đắn có thể mang lại sự liên tục.",
        "Mô hình vận hành đúng đắn có thể giúp chăm sóc dễ tiếp cận hơn.",
        "Cùng nhau, chúng tạo nên một trải nghiệm y tế tốt hơn.",
      ],
    },
    partners: {
      eyebrow: "Đối tác & hệ sinh thái",
      title: "Chăm sóc sức khỏe hiệu quả hơn khi những người phù hợp cùng hợp tác.",
      p: [
        "Không một tổ chức y tế nào có thể tự mình đáp ứng mọi nhu cầu.",
        "Compass hợp tác với các tổ chức trong hệ sinh thái y tế để giúp kết nối mọi người với những dịch vụ, chuyên môn và sự hỗ trợ mà họ cần.",
      ],
      cta: "Trở thành đối tác của Compass",
      items: [
        { t: "Chăm sóc ban đầu & phòng khám", d: "Kết nối bệnh nhân với các dịch vụ y tế bổ sung và hỗ trợ lâu dài." },
        { t: "Nhà thuốc", d: "Hỗ trợ các nhu cầu liên quan đến thuốc và phối hợp chăm sóc." },
        { t: "Tổ chức chăm sóc tại nhà", d: "Mở rộng sự hỗ trợ ra ngoài phòng khám." },
        { t: "Tổ chức cộng đồng", d: "Giúp mọi người tiếp cận các nguồn lực y tế đáng tin cậy." },
        { t: "Đối tác y tế & bảo hiểm", d: "Tạo ra lối tiếp cận chăm sóc dễ dàng và phối hợp hơn." },
        { t: "Đối tác du lịch & xuyên biên giới", d: "Giúp mọi người định hướng y tế giữa Hoa Kỳ và Việt Nam." },
      ],
    },
    final: {
      title: "Y tế, được kết nối.",
      p: [
        "Từ chăm sóc lâu dài đến hỗ trợ hằng ngày.",
        "Từ những câu hỏi cấp thiết đến việc tiếp cận y tế khi đi xa.",
        "Compass kết nối các điểm chăm sóc khác nhau để hành trình sức khỏe trở nên đơn giản, liền mạch và được hỗ trợ nhiều hơn.",
      ],
      call: `Gọi Compass — ${CMG_CONTACT.phone}`,
      partner: "Trở thành đối tác của Compass",
    },
    footer: {
      tagline: "Một hệ sinh thái. Chăm sóc y tế kết nối.",
      servicesLabel: "Dịch vụ",
      companyLabel: "Công ty",
      contactLabel: "Liên hệ",
      entity: "Compass Medical Group, P.C.",
      legal: "© 2026 Compass Medical Group, P.C.",
      logoAlt: "Compass Medical Group, P.C.",
    },
    langLabel: "Ngôn ngữ",
    meta: {
      title: "Compass Medical Group — Một hệ sinh thái. Chăm sóc y tế kết nối.",
      description:
        "Compass Medical Group kết hợp chăm sóc do bác sĩ dẫn dắt, công nghệ thông minh và đội ngũ chăm sóc tích hợp — AgeWell, 24/7, Companion và Vietnam Care — trong một hệ sinh thái y tế kết nối.",
    },
  },
};

// Media + contact are language-independent; merged here so page code reads one
// object (same shape as getContent / getCardContent elsewhere in src/).
export function getCmgContent(lang) {
  const C = CMG_CONTENT[lang] || CMG_CONTENT.vi;
  return { ...C, media: MEDIA, contact: CMG_CONTACT };
}

export function buildCmgMetadata(lang) {
  const C = CMG_CONTENT[lang] || CMG_CONTENT.vi;
  const url = `${SITE_URL}/${lang}/cmg`;
  return {
    metadataBase: new URL(SITE_URL),
    title: C.meta.title,
    description: C.meta.description,
    icons: { icon: "/assets/logo-color.png" },
    alternates: { canonical: url, languages: languageAlternates("/cmg") },
    openGraph: {
      title: C.meta.title,
      description: C.meta.description,
      url,
      type: "website",
      images: [`${SITE_URL}${MEDIA.hero}`],
      locale: OG_LOCALE[lang],
      alternateLocale: lang === "vi" ? "en_US" : "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: C.meta.title,
      description: C.meta.description,
      images: [`${SITE_URL}${MEDIA.hero}`],
    },
  };
}
