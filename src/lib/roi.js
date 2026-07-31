/* ============================================================
   COMPASS AGEWELL — ROI partner-tool math (PURE, no React, no DOM)

   Implements sections 3, 4 and 5 of the BD brief
   ("Compass-AgeWell-ROI-Tool-Brief (2).md"). Kept deliberately free of
   any UI/framework import so it can be unit tested on its own
   (test/roi.test.js) and so the numbers have exactly one source of truth.

   Design rules baked in here:
   - CCM and MTM are two INDEPENDENT blocks. Nothing in this module merges
     them; only calcCombined() adds the two finished results together, and
     only when BOTH are complete.
   - The MTM "who bills" choice (PCP vs AgeWell) is NOT an input to any
     formula. It changes cash-flow narration only (brief §4), so it never
     reaches this module.
   - Everything is monthly. The annual figure is monthly x 12 under the
     explicit "same patient count all year" assumption (brief §3/§4).
   ============================================================ */

export const MONTHS_PER_YEAR = 12;

// Fee modes (brief §3 "Lớp lựa chọn — Hình thức trả phí cho AgeWell").
export const FEE_FIXED = "fixed"; // USD / patient / month
export const FEE_SHARE = "share"; // % of that patient's revenue / month

// MTM billing party (brief §4 "Lớp lựa chọn A"). Narration only.
export const BILLER_PCP = "pcp";
export const BILLER_AGEWELL = "agewell";

// Every field starts EMPTY — the brief (§7) forbids default values, because a
// pre-filled number reads as "the normal range" during a live negotiation.
export const EMPTY_CCM = {
  patients: "",
  revenuePerPatient: "",
  feeMode: FEE_FIXED,
  fixedFee: "",
  sharePct: "",
};

export const EMPTY_MTM = { ...EMPTY_CCM, biller: BILLER_PCP };

/* ---------- input sanitizing ----------
   State holds the RAW STRING the user typed, not a parsed number, so that a
   half-typed decimal ("60.") survives the keystroke instead of collapsing to
   60 and swallowing the next digit. Parsing happens in calcBlock().

   Only two validations exist (brief §7): no negatives, and percent <= 100.
   There is deliberately no other min/max — every partner meeting has wildly
   different numbers and a cap would silently rewrite what the user typed. */
export function sanitizeNumberInput(raw, max = null) {
  if (raw == null) return "";
  // Drop anything that isn't a digit or a decimal point. This also removes any
  // "-", which is how negatives are blocked: they can never enter state.
  let s = String(raw).replace(/[^0-9.]/g, "");
  // Keep only the first decimal point; stray extra points are dropped rather
  // than rejected, so a fumbled "1.2.3" becomes "1.23" instead of clearing the
  // field mid-sentence in front of a partner.
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  if (s === "") return "";
  if (max != null) {
    const n = Number(s);
    if (Number.isFinite(n) && n > max) return String(max);
  }
  return s;
}

// A field counts as "filled" only if it parses to a real number. A lone "."
// is treated as still-empty.
export function hasValue(v) {
  return v !== "" && v != null && Number.isFinite(Number(v));
}

export function toNumber(v) {
  if (!hasValue(v)) return 0;
  return Number(v);
}

/* ---------- the block formula (brief §3 for CCM, §4 for MTM) ----------
   Identical math for both blocks; only the labels differ in the UI. */
export function calcBlock(block) {
  const b = block || {};
  const isShare = b.feeMode === FEE_SHARE;

  const patients = toNumber(b.patients);
  const revenuePerPatient = toNumber(b.revenuePerPatient);
  const fixedFee = toNumber(b.fixedFee);
  const sharePct = toNumber(b.sharePct);

  // Doanh thu tăng thêm = số bệnh nhân x doanh thu/BN/tháng
  const revenueMonth = patients * revenuePerPatient;

  // Chi phí trả AgeWell — the ONLY line the fee mode changes.
  const costMonth = isShare ? revenueMonth * (sharePct / 100) : patients * fixedFee;

  const netMonth = revenueMonth - costMonth;

  return {
    isShare,

    // Brief §6.5: patient count or Medicare revenue empty -> hide the whole
    // output of this block and prompt for the missing field instead.
    hasPatients: hasValue(b.patients),
    hasRevenue: hasValue(b.revenuePerPatient),
    blocked: !hasValue(b.patients) || !hasValue(b.revenuePerPatient),

    // Brief §6.4: AgeWell fee empty -> dim the fee-dependent results and show
    // the red "needs an approved fee" note.
    //
    // NOTE: a fee of 0 is treated the same as empty, matching the BD's own
    // reference build (ROI Partner Tool.dc.html: `noFee: !(fee > 0)`). A zero
    // fee is not an "approved fee", and showing an undimmed full-revenue net
    // benefit off the back of it is exactly the over-promise the brief guards
    // against. Flip these two comparisons to hasValue() if BD wants literal
    // empty-only behaviour.
    feeMissing: isShare ? !(sharePct > 0) : !(fixedFee > 0),

    patients,
    revenueMonth,
    costMonth,
    netMonth,
    netYear: netMonth * MONTHS_PER_YEAR,

    // Revenue-share only: what the % works out to per patient per month, so it
    // can be compared like-for-like against a fixed fee (brief §3 Output).
    equivFeePerPatient: isShare && patients > 0 ? costMonth / patients : 0,
  };
}

/* ---------- combined block (brief §5) ----------
   Optional, bottom of page, ONLY when both blocks are fully usable. */
export function calcCombined(ccmResult, mtmResult) {
  const available =
    !!ccmResult &&
    !!mtmResult &&
    !ccmResult.blocked &&
    !ccmResult.feeMissing &&
    !mtmResult.blocked &&
    !mtmResult.feeMissing;

  if (!available) return { available: false, netMonth: 0, netYear: 0 };

  return {
    available: true,
    netMonth: ccmResult.netMonth + mtmResult.netMonth,
    netYear: ccmResult.netYear + mtmResult.netYear,
  };
}

/* ---------- display formatting (brief §7: "làm tròn hợp lý khi hiển thị") ----
   en-US grouping in BOTH locales on purpose: these are USD figures shown to a
   US practice, and "1.200" (vi-VN grouping) reads as a decimal to that
   audience. Formatting never changes the stored input. */
export function formatMoney(n) {
  const v = Number.isFinite(n) ? n : 0;
  const rounded = Math.round(v);
  // A fee above revenue is a legitimate (if unwelcome) answer, so negatives are
  // shown, formatted as "-$2,400" rather than the "$-2,400" a naive concat
  // would produce.
  const sign = rounded < 0 ? "-" : "";
  return sign + "$" + Math.abs(rounded).toLocaleString("en-US");
}

// Per-patient equivalents are small numbers where whole-dollar rounding hides
// real differences (33% of $60 = $19.80, not $20), so keep up to 2 decimals
// and trim trailing zeros.
export function formatMoneyPrecise(n) {
  const v = Number.isFinite(n) ? n : 0;
  const rounded = Math.round(v * 100) / 100;
  const sign = rounded < 0 ? "-" : "";
  return (
    sign +
    "$" +
    Math.abs(rounded).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

export function formatCount(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
