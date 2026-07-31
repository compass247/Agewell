/* ============================================================
   COMPASS AGEWELL — ROI partner-tool copy (VI / EN)

   VI copy is VERBATIM from the BD brief
   ("BD Requirement -PCP/uploads/Compass-AgeWell-ROI-Tool-Brief (2).md",
   sections 3, 4, 5, 6 and the section-10 label table) and from the BD design
   comp ("ROI Partner Tool.dc.html"). Do not paraphrase the Vietnamese —
   several strings are compliance wording, not marketing copy.

   EN is a faithful translation written to keep the financial and legal
   meaning exact, in particular the Anti-Kickback Statute banner and the
   page-level "this is an estimate, not a commitment" disclaimer.

   This page is a B2B negotiation aid, NOT a marketing page: it is noindexed
   (see buildRoiMetadata below), kept out of app/sitemap.js, and rendered
   without the site header/footer/lead form.
   ============================================================ */
import { SITE_URL, OG_LOCALE } from "./seo.js";

export const ROI_PATH = "/roi-calculator";

// {count} / {service} are filled by fillTemplate() at render time.
export const ROI_CONTENT = {
  vi: {
    meta: {
      title: "Công cụ ước tính lợi ích hợp tác với PCP — Compass AgeWell",
      description:
        "Công cụ ước tính minh họa lợi ích ròng khi PCP hợp tác triển khai CCM và MTM cùng Compass AgeWell. Số liệu chỉ mang tính minh họa, không phải cam kết.",
    },
    page: {
      title: "Công cụ ước tính lợi ích hợp tác với PCP",
      sub: "CCM và MTM tính tách biệt, đều theo tháng · Số liệu tổng hợp, không lưu trữ",
      reset: "Xóa hết, nhập lại",
      langSwitch: "EN",
      langSwitchLabel: "Xem bản tiếng Anh",
    },
    // Brief 6.3 — permanent, non-dismissible.
    disclaimer:
      "Đây là công cụ ước tính minh họa dựa trên giả định — không phải cam kết kết quả hay cam kết Medicare thanh toán. Không dùng số liệu nội bộ (chi phí, phí thật) chưa được cấp phê duyệt xác nhận.",
    // Brief 3 — shown in whichever block currently has revenue share selected.
    aks: "Mô hình revenue share cho {service} cần được cấp phê duyệt/pháp lý xác nhận trước khi dùng chính thức với đối tác (liên quan Anti-Kickback Statute). Số liệu ở đây chỉ mang tính minh họa nội bộ, chưa phải mô hình đã được duyệt.",
    feeMode: {
      label: "Hình thức trả phí AgeWell",
      fixed: "Phí cố định (USD/BN/tháng)",
      share: "Revenue share (% doanh thu/BN/tháng)",
    },
    biller: {
      label: "Ai billing MTM?",
      pcp: "PCP tự billing",
      agewell: "AgeWell billing hộ",
      flowLabel: "Dòng tiền",
      flowPcp: "Medicare Part D → PCP nhận doanh thu MTM → PCP trả phí cho AgeWell",
      flowAgewell:
        "Medicare Part D → AgeWell nhận doanh thu MTM → AgeWell chuyển lại 100% cho PCP → PCP trả phí cho AgeWell",
      flowNote: "Lựa chọn này không đổi kết quả tính — chỉ đổi cách diễn giải dòng tiền.",
    },
    fields: {
      patientsPlaceholder: "Nhập số bệnh nhân",
      revPlaceholder: "Nhập doanh thu/BN/tháng",
      feeLabel: "Phí trả AgeWell",
      feeHint:
        "Đơn vị: USD / bệnh nhân / tháng · chỉ dùng mức phí đã được cấp phê duyệt xác nhận",
      feePlaceholder: "Nhập phí",
      pctLabel: "% phí trả AgeWell",
      pctPlaceholder: "Nhập % phí",
      requiredLabel: "Bắt buộc nhập",
    },
    ccm: {
      title: "CCM — Quản lý bệnh mạn tính",
      note: "PCP tự billing qua Medicare Part B · mọi số tính theo tháng",
      patientsLabel: "Số bệnh nhân CCM AgeWell chăm sóc trong tháng",
      patientsHint: "Đơn vị: số bệnh nhân / tháng (trong tháng đang tính, không lũy kế)",
      revLabel: "Doanh thu CCM Medicare chi trả",
      revHint: "Đơn vị: USD / bệnh nhân / tháng",
      pctHint: "Đơn vị: % trên doanh thu CCM / bệnh nhân / tháng (0–100%)",
      revRowLabel: "Doanh thu CCM tăng thêm",
      netEyebrow: "Lợi ích ròng ước tính — CCM",
      promptPatients: "Nhập số bệnh nhân CCM chăm sóc trong tháng để xem kết quả.",
      promptRevenue: "Nhập doanh thu CCM Medicare chi trả (USD/BN/tháng) để xem kết quả.",
    },
    mtm: {
      title: "MTM — Quản lý & rà soát thuốc",
      note: "Medicare Part D · quy đổi tương đương theo tháng khi ước tính",
      patientsLabel: "Số bệnh nhân MTM AgeWell chăm sóc trong tháng",
      patientsHint: "Đơn vị: số bệnh nhân / tháng (trong tháng đang tính)",
      revLabel: "Doanh thu MTM Medicare chi trả",
      revHint:
        "Đơn vị: USD / bệnh nhân / tháng · tự quy đổi tương đương theo tháng từ CMR (hàng năm) + TMR (hàng quý)",
      pctHint: "Đơn vị: % trên doanh thu MTM / bệnh nhân / tháng (0–100%)",
      revRowLabel: "Doanh thu MTM tăng thêm",
      netEyebrow: "Lợi ích ròng ước tính — MTM",
      promptPatients: "Nhập số bệnh nhân MTM chăm sóc trong tháng để xem kết quả.",
      promptRevenue: "Nhập doanh thu MTM Medicare chi trả (USD/BN/tháng) để xem kết quả.",
    },
    results: {
      groupSub: "toàn bộ nhóm",
      costLabel: "Chi phí trả AgeWell",
      unitMonth: "USD/tháng",
      netUnit: "USD/tháng · toàn bộ nhóm",
      netYearLabel: "Lợi ích ròng ước tính",
      netYearUnit: "USD/năm · toàn bộ nhóm",
      equivUnit: "USD/BN/tháng",
      yearNote:
        "Chiếu theo giả định duy trì đều {count} bệnh nhân mỗi tháng suốt năm — số thực tế sẽ khác nếu số bệnh nhân tăng/giảm theo từng tháng.",
      // Brief 6.4 — shown under a dimmed result block.
      feeMissing:
        "Cần nhập phí đã được cấp phê duyệt xác nhận trước khi dùng số này với đối tác.",
    },
    combined: {
      eyebrow: "Tổng hợp CCM + MTM",
      note: "Tổng hợp giả định PCP triển khai cả hai dịch vụ — số bệnh nhân CCM và MTM có thể trùng hoặc không trùng nhau, tùy tình huống thực tế.",
      label: "Tổng lợi ích ròng ước tính",
      unit: "USD/năm · toàn bộ nhóm",
      monthlyUnit: "USD/tháng",
    },
    footer:
      "Công cụ không lưu trữ dữ liệu, không gửi thông tin ra ngoài và không nhận bất kỳ dữ liệu bệnh nhân cá nhân nào. Mọi con số chỉ tồn tại trong phiên làm việc hiện tại. Không có giá trị mặc định ở bất kỳ trường nào — mọi con số do người dùng nhập theo tình huống đàm phán thực tế.",
  },

  en: {
    meta: {
      title: "PCP Partnership Benefit Estimator — Compass AgeWell",
      description:
        "An illustrative estimate of the net benefit to a PCP practice from partnering with Compass AgeWell on CCM and MTM. Illustrative figures only, not a commitment.",
    },
    page: {
      title: "PCP Partnership Benefit Estimator",
      sub: "CCM and MTM are calculated separately, both monthly · Aggregate figures, nothing is stored",
      reset: "Clear all, start over",
      langSwitch: "VI",
      langSwitchLabel: "View the Vietnamese version",
    },
    disclaimer:
      "This is an illustrative estimate based on the assumptions entered — not a guarantee of results and not a commitment that Medicare will pay. Do not use internal figures (real costs or fees) that have not been confirmed by leadership.",
    aks: "The revenue-share model for {service} requires leadership and legal sign-off before it is used with a partner (Anti-Kickback Statute exposure). The figures shown here are an internal illustration only, not an approved model.",
    feeMode: {
      label: "How AgeWell is paid",
      fixed: "Fixed fee (USD/patient/month)",
      share: "Revenue share (% of revenue/patient/month)",
    },
    biller: {
      label: "Who bills MTM?",
      pcp: "PCP bills directly",
      agewell: "AgeWell bills on their behalf",
      flowLabel: "Cash flow",
      flowPcp: "Medicare Part D → PCP receives the MTM revenue → PCP pays AgeWell's fee",
      flowAgewell:
        "Medicare Part D → AgeWell receives the MTM revenue → AgeWell passes 100% of it back to the PCP → PCP pays AgeWell's fee",
      flowNote: "This choice does not change any figure — only how the cash flow is described.",
    },
    fields: {
      patientsPlaceholder: "Enter patient count",
      revPlaceholder: "Enter revenue/patient/month",
      feeLabel: "Fee paid to AgeWell",
      feeHint:
        "Unit: USD / patient / month · only use a fee that leadership has confirmed",
      feePlaceholder: "Enter fee",
      pctLabel: "% fee paid to AgeWell",
      pctPlaceholder: "Enter fee %",
      requiredLabel: "Required",
    },
    ccm: {
      title: "CCM — Chronic Care Management",
      note: "PCP bills through Medicare Part B · every figure is monthly",
      patientsLabel: "CCM patients AgeWell cares for this month",
      patientsHint: "Unit: patients / month (the month being calculated, not cumulative)",
      revLabel: "CCM revenue paid by Medicare",
      revHint: "Unit: USD / patient / month",
      pctHint: "Unit: % of CCM revenue / patient / month (0–100%)",
      revRowLabel: "Additional CCM revenue",
      netEyebrow: "Estimated net benefit — CCM",
      promptPatients: "Enter the number of CCM patients cared for this month to see results.",
      promptRevenue: "Enter the CCM revenue Medicare pays (USD/patient/month) to see results.",
    },
    mtm: {
      title: "MTM — Medication Therapy Management",
      note: "Medicare Part D · convert to a monthly equivalent when estimating",
      patientsLabel: "MTM patients AgeWell serves this month",
      patientsHint: "Unit: patients / month (the month being calculated)",
      revLabel: "MTM revenue paid by Medicare",
      revHint:
        "Unit: USD / patient / month · convert the annual CMR and quarterly TMR into a monthly equivalent yourself",
      pctHint: "Unit: % of MTM revenue / patient / month (0–100%)",
      revRowLabel: "Additional MTM revenue",
      netEyebrow: "Estimated net benefit — MTM",
      promptPatients: "Enter the number of MTM patients served this month to see results.",
      promptRevenue: "Enter the MTM revenue Medicare pays (USD/patient/month) to see results.",
    },
    results: {
      groupSub: "whole group",
      costLabel: "Fee paid to AgeWell",
      unitMonth: "USD/month",
      netUnit: "USD/month · whole group",
      netYearLabel: "Estimated net benefit",
      netYearUnit: "USD/year · whole group",
      equivUnit: "USD/patient/month",
      yearNote:
        "Projected on the assumption of a steady {count} patients every month for a year — the actual figure will differ if the patient count rises or falls month to month.",
      feeMissing:
        "Enter a fee confirmed by leadership before using this number with a partner.",
    },
    combined: {
      eyebrow: "Combined CCM + MTM",
      note: "The combined figure assumes the PCP runs both services — the CCM and MTM patient groups may or may not overlap, depending on the real situation.",
      label: "Total estimated net benefit",
      unit: "USD/year · whole group",
      monthlyUnit: "USD/month",
    },
    footer:
      "This tool stores no data, sends nothing off the page and accepts no personal patient information. Every figure exists only in the current browser session. No field has a default value — every number is entered by hand for the negotiation at hand.",
  },
};

export function getRoiContent(lang) {
  return ROI_CONTENT[lang] || ROI_CONTENT.vi;
}

// Minimal {placeholder} interpolation so the copy above stays plain data.
export function fillTemplate(template, values) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

/* Metadata. Deliberately noindex/nofollow in BOTH locales: this is an internal
   negotiation aid that quotes fee models, not a public marketing page. It is
   also intentionally absent from app/sitemap.js and disallowed in
   app/robots.js — three independent signals, since only the meta tag survives
   into the static export. */
export function buildRoiMetadata(lang) {
  const R = getRoiContent(lang);
  const canonical = `${SITE_URL}/${lang}${ROI_PATH}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: R.meta.title,
    description: R.meta.description,
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical },
    openGraph: {
      title: R.meta.title,
      description: R.meta.description,
      url: canonical,
      type: "website",
      locale: OG_LOCALE[lang],
    },
  };
}
