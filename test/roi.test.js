/* ROI partner-tool math: both fee modes in both blocks, the combined block,
   and the empty / zero input cases. Mirrors the worked examples in the BD
   brief (sections 3, 4, 5). */
import { describe, it, expect } from "vitest";
import {
  EMPTY_CCM,
  EMPTY_MTM,
  FEE_FIXED,
  FEE_SHARE,
  BILLER_PCP,
  BILLER_AGEWELL,
  MONTHS_PER_YEAR,
  sanitizeNumberInput,
  hasValue,
  toNumber,
  calcBlock,
  calcCombined,
  formatMoney,
  formatMoneyPrecise,
  formatCount,
} from "../src/lib/roi.js";

// 10 patients x $60/patient/month, $20/patient/month fixed fee — the reference
// scenario used to sanity-check the tool before a partner meeting.
const CCM_FIXED = {
  ...EMPTY_CCM,
  patients: "10",
  revenuePerPatient: "60",
  feeMode: FEE_FIXED,
  fixedFee: "20",
};

const CCM_SHARE = {
  ...EMPTY_CCM,
  patients: "10",
  revenuePerPatient: "60",
  feeMode: FEE_SHARE,
  sharePct: "30",
};

describe("sanitizeNumberInput", () => {
  it("keeps a plain number and passes an empty field through", () => {
    expect(sanitizeNumberInput("60")).toBe("60");
    expect(sanitizeNumberInput("")).toBe("");
    expect(sanitizeNumberInput(null)).toBe("");
  });

  it("blocks negatives by stripping the sign", () => {
    expect(sanitizeNumberInput("-5")).toBe("5");
    expect(sanitizeNumberInput("-")).toBe("");
  });

  it("keeps a half-typed decimal intact", () => {
    expect(sanitizeNumberInput("60.")).toBe("60.");
    expect(sanitizeNumberInput("60.5")).toBe("60.5");
    expect(sanitizeNumberInput("1.2.3")).toBe("1.23");
  });

  it("drops letters and separators", () => {
    expect(sanitizeNumberInput("1,200")).toBe("1200");
    expect(sanitizeNumberInput("$60/mo")).toBe("60");
  });

  it("caps percent at 100 but leaves uncapped fields alone", () => {
    expect(sanitizeNumberInput("150", 100)).toBe("100");
    expect(sanitizeNumberInput("100", 100)).toBe("100");
    expect(sanitizeNumberInput("99.5", 100)).toBe("99.5");
    expect(sanitizeNumberInput("999999")).toBe("999999"); // no cap on money
  });
});

describe("hasValue / toNumber", () => {
  it("treats empty and a lone decimal point as unfilled", () => {
    expect(hasValue("")).toBe(false);
    expect(hasValue(".")).toBe(false);
    expect(hasValue("0")).toBe(true);
    expect(toNumber("")).toBe(0);
    expect(toNumber("0")).toBe(0);
    expect(toNumber("60.5")).toBe(60.5);
  });
});

describe("calcBlock — fixed fee", () => {
  it("computes the reference CCM scenario", () => {
    const r = calcBlock(CCM_FIXED);
    expect(r.revenueMonth).toBe(600);
    expect(r.costMonth).toBe(200);
    expect(r.netMonth).toBe(400);
    expect(r.netYear).toBe(4800);
    expect(r.blocked).toBe(false);
    expect(r.feeMissing).toBe(false);
    expect(r.isShare).toBe(false);
  });

  it("does not emit a per-patient equivalent in fixed mode", () => {
    expect(calcBlock(CCM_FIXED).equivFeePerPatient).toBe(0);
  });

  it("multiplies the monthly net by 12 for the annual figure", () => {
    const r = calcBlock(CCM_FIXED);
    expect(r.netYear).toBe(r.netMonth * MONTHS_PER_YEAR);
  });

  it("handles a fee above revenue as a negative net (no clamping)", () => {
    const r = calcBlock({ ...CCM_FIXED, fixedFee: "80" });
    expect(r.costMonth).toBe(800);
    expect(r.netMonth).toBe(-200);
    expect(r.netYear).toBe(-2400);
  });

  it("accepts decimal inputs", () => {
    const r = calcBlock({ ...CCM_FIXED, revenuePerPatient: "62.5", fixedFee: "20.5" });
    expect(r.revenueMonth).toBe(625);
    expect(r.costMonth).toBe(205);
    expect(r.netMonth).toBe(420);
  });
});

describe("calcBlock — revenue share", () => {
  it("computes the reference CCM scenario at 30%", () => {
    const r = calcBlock(CCM_SHARE);
    expect(r.revenueMonth).toBe(600);
    expect(r.costMonth).toBe(180);
    expect(r.netMonth).toBe(420);
    expect(r.netYear).toBe(5040);
    expect(r.isShare).toBe(true);
    expect(r.feeMissing).toBe(false);
  });

  it("reports the per-patient equivalent of the share", () => {
    expect(calcBlock(CCM_SHARE).equivFeePerPatient).toBe(18);
    // 33% of $60 is $19.80 — the equivalent must not be pre-rounded here.
    expect(calcBlock({ ...CCM_SHARE, sharePct: "33" }).equivFeePerPatient).toBeCloseTo(19.8, 10);
  });

  it("takes 100% of revenue as cost, leaving zero net", () => {
    const r = calcBlock({ ...CCM_SHARE, sharePct: "100" });
    expect(r.costMonth).toBe(600);
    expect(r.netMonth).toBe(0);
    expect(r.netYear).toBe(0);
  });

  it("keeps patient count and revenue when the fee mode flips", () => {
    // Same block, two modes: only the cost line moves.
    const fixed = calcBlock({ ...CCM_SHARE, feeMode: FEE_FIXED, fixedFee: "20" });
    const share = calcBlock(CCM_SHARE);
    expect(fixed.revenueMonth).toBe(share.revenueMonth);
    expect(fixed.costMonth).not.toBe(share.costMonth);
  });
});

describe("calcBlock — MTM", () => {
  const MTM_FIXED = {
    ...EMPTY_MTM,
    patients: "25",
    revenuePerPatient: "12",
    feeMode: FEE_FIXED,
    fixedFee: "4",
  };

  it("computes MTM with a fixed fee", () => {
    const r = calcBlock(MTM_FIXED);
    expect(r.revenueMonth).toBe(300);
    expect(r.costMonth).toBe(100);
    expect(r.netMonth).toBe(200);
    expect(r.netYear).toBe(2400);
  });

  it("computes MTM with revenue share", () => {
    const r = calcBlock({ ...MTM_FIXED, feeMode: FEE_SHARE, sharePct: "25", fixedFee: "" });
    expect(r.revenueMonth).toBe(300);
    expect(r.costMonth).toBe(75);
    expect(r.netMonth).toBe(225);
    expect(r.netYear).toBe(2700);
    expect(r.equivFeePerPatient).toBe(3);
  });

  it("returns identical numbers whichever party bills (brief section 4)", () => {
    const byPcp = calcBlock({ ...MTM_FIXED, biller: BILLER_PCP });
    const byAgeWell = calcBlock({ ...MTM_FIXED, biller: BILLER_AGEWELL });
    expect(byAgeWell).toEqual(byPcp);

    const sharePcp = calcBlock({ ...MTM_FIXED, feeMode: FEE_SHARE, sharePct: "25", biller: BILLER_PCP });
    const shareAw = calcBlock({ ...MTM_FIXED, feeMode: FEE_SHARE, sharePct: "25", biller: BILLER_AGEWELL });
    expect(shareAw).toEqual(sharePcp);
  });
});

describe("calcBlock — empty and zero inputs", () => {
  it("blocks output on a completely empty block", () => {
    const r = calcBlock(EMPTY_CCM);
    expect(r.blocked).toBe(true);
    expect(r.hasPatients).toBe(false);
    expect(r.hasRevenue).toBe(false);
    expect(r.feeMissing).toBe(true);
    expect(r.revenueMonth).toBe(0);
    expect(r.netMonth).toBe(0);
    expect(r.netYear).toBe(0);
  });

  it("blocks when only the patient count is missing", () => {
    const r = calcBlock({ ...CCM_FIXED, patients: "" });
    expect(r.blocked).toBe(true);
    expect(r.hasPatients).toBe(false);
    expect(r.hasRevenue).toBe(true);
  });

  it("blocks when only the Medicare revenue is missing", () => {
    const r = calcBlock({ ...CCM_FIXED, revenuePerPatient: "" });
    expect(r.blocked).toBe(true);
    expect(r.hasPatients).toBe(true);
    expect(r.hasRevenue).toBe(false);
  });

  it("dims (but does not block) when the fixed fee is missing", () => {
    const r = calcBlock({ ...CCM_FIXED, fixedFee: "" });
    expect(r.blocked).toBe(false);
    expect(r.feeMissing).toBe(true);
    expect(r.revenueMonth).toBe(600); // revenue still computes
    expect(r.costMonth).toBe(0);
    expect(r.netMonth).toBe(600);
  });

  it("dims when the share percent is missing", () => {
    const r = calcBlock({ ...CCM_SHARE, sharePct: "" });
    expect(r.blocked).toBe(false);
    expect(r.feeMissing).toBe(true);
    expect(r.costMonth).toBe(0);
  });

  it("treats a zero fee as a missing fee in both modes", () => {
    expect(calcBlock({ ...CCM_FIXED, fixedFee: "0" }).feeMissing).toBe(true);
    expect(calcBlock({ ...CCM_SHARE, sharePct: "0" }).feeMissing).toBe(true);
  });

  it("computes a real zero block from explicit zeros", () => {
    const r = calcBlock({ ...EMPTY_CCM, patients: "0", revenuePerPatient: "0", fixedFee: "0" });
    expect(r.blocked).toBe(false); // 0 is entered, not empty
    expect(r.revenueMonth).toBe(0);
    expect(r.costMonth).toBe(0);
    expect(r.netMonth).toBe(0);
    expect(r.netYear).toBe(0);
  });

  it("does not divide by zero for the share equivalent at zero patients", () => {
    const r = calcBlock({ ...CCM_SHARE, patients: "0" });
    expect(r.equivFeePerPatient).toBe(0);
    expect(Number.isFinite(r.equivFeePerPatient)).toBe(true);
  });
});

describe("calcCombined", () => {
  it("adds both blocks once each is complete", () => {
    const ccm = calcBlock(CCM_FIXED); // net 400/mo, 4800/yr
    const mtm = calcBlock({
      ...EMPTY_MTM,
      patients: "25",
      revenuePerPatient: "12",
      feeMode: FEE_FIXED,
      fixedFee: "4",
    }); // net 200/mo, 2400/yr
    const total = calcCombined(ccm, mtm);
    expect(total.available).toBe(true);
    expect(total.netMonth).toBe(600);
    expect(total.netYear).toBe(7200);
    expect(total.netYear).toBe(ccm.netYear + mtm.netYear);
  });

  it("stays hidden while either block is blocked", () => {
    const ccm = calcBlock(CCM_FIXED);
    expect(calcCombined(ccm, calcBlock(EMPTY_MTM)).available).toBe(false);
    expect(calcCombined(calcBlock(EMPTY_CCM), ccm).available).toBe(false);
  });

  it("stays hidden while either block is missing its AgeWell fee", () => {
    const ccm = calcBlock(CCM_FIXED);
    const mtmNoFee = calcBlock({
      ...EMPTY_MTM,
      patients: "25",
      revenuePerPatient: "12",
      fixedFee: "",
    });
    expect(calcCombined(ccm, mtmNoFee).available).toBe(false);
  });

  it("returns zeroed, unavailable totals rather than throwing on missing input", () => {
    expect(calcCombined(null, null)).toEqual({ available: false, netMonth: 0, netYear: 0 });
  });

  it("mixes fee modes across the two blocks", () => {
    const ccm = calcBlock(CCM_SHARE); // net 420/mo
    const mtm = calcBlock({
      ...EMPTY_MTM,
      patients: "25",
      revenuePerPatient: "12",
      feeMode: FEE_FIXED,
      fixedFee: "4",
    }); // net 200/mo
    const total = calcCombined(ccm, mtm);
    expect(total.netMonth).toBe(620);
    expect(total.netYear).toBe(7440);
  });
});

describe("display formatting", () => {
  it("formats money to whole dollars with thousands separators", () => {
    expect(formatMoney(400)).toBe("$400");
    expect(formatMoney(4800)).toBe("$4,800");
    expect(formatMoney(0)).toBe("$0");
    expect(formatMoney(1234.6)).toBe("$1,235");
    expect(formatMoney(-2400)).toBe("-$2,400");
  });

  it("keeps cents on per-patient equivalents", () => {
    expect(formatMoneyPrecise(18)).toBe("$18");
    expect(formatMoneyPrecise(19.8)).toBe("$19.8");
    expect(formatMoneyPrecise(19.755)).toBe("$19.76");
  });

  it("formats patient counts for the annual assumption note", () => {
    expect(formatCount(10)).toBe("10");
    expect(formatCount(1500)).toBe("1,500");
  });
});
