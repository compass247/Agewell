/* BOD-lead input validation + referrer attribution rule. */
import { describe, it, expect } from "vitest";
import { bodLeadInputSchema, bodLeadStatusSchema } from "../src/lib/phi/validation.js";
import {
  pickReferrerUserId,
  formatLeadCode,
  labelOf,
  LEAD_STATUSES,
} from "../src/lib/phi/bod-leads.options.js";

const valid = {
  leadSource: "FOUNDER_REFERRAL",
  referrerUserId: "user-1",
  customerName: "Hoa Pham",
  phone: "714-555-0301",
  state: "CA",
  dob: "07/22/1950",
  tier: "TIER_1",
  preferredContactChannel: "ZALO",
  consentToContact: "yes",
  consentDate: "07/15/2026",
  serviceInterested: "CCM",
  founderNote: "  Cousin of a board member.  ",
  dateReceived: "",
};

describe("bodLeadInputSchema", () => {
  it("accepts a complete lead and normalizes it", () => {
    const parsed = bodLeadInputSchema.parse(valid);
    expect(parsed.consentToContact).toBe(true);
    expect(parsed.founderNote).toBe("Cousin of a board member.");
    expect(parsed.dob).toBe("07/22/1950");
    expect(parsed.dateReceived).toBeNull();
  });

  it("requires the starred fields", () => {
    for (const field of [
      "leadSource",
      "customerName",
      "phone",
      "state",
      "tier",
      "preferredContactChannel",
      "consentToContact",
    ]) {
      const res = bodLeadInputSchema.safeParse({ ...valid, [field]: "" });
      expect(res.success, `${field} should be required`).toBe(false);
    }
  });

  it("leaves DOB optional but format-checked", () => {
    expect(bodLeadInputSchema.parse({ ...valid, dob: "" }).dob).toBeNull();
    expect(bodLeadInputSchema.safeParse({ ...valid, dob: "1950-07-22" }).success).toBe(false);
  });

  it("pairs consent with a consent date", () => {
    const res = bodLeadInputSchema.safeParse({ ...valid, consentDate: "" });
    expect(res.success).toBe(false);
    expect(res.error.issues[0].message).toMatch(/Consent date is required/);
    // "No – do not contact" needs no date.
    expect(
      bodLeadInputSchema.safeParse({ ...valid, consentToContact: "no", consentDate: "" }).success
    ).toBe(true);
  });

  it("treats an unset service interest as null, not an error", () => {
    expect(bodLeadInputSchema.parse({ ...valid, serviceInterested: "" }).serviceInterested).toBeNull();
  });

  it("rejects a status outside the pipeline", () => {
    expect(bodLeadStatusSchema.safeParse("ENROLLED").success).toBe(true);
    expect(bodLeadStatusSchema.safeParse("COMPLETE").success).toBe(false);
  });
});

describe("pickReferrerUserId", () => {
  it("attributes a BOD's lead to themselves, ignoring the posted value", () => {
    const actor = { id: "bod-1", role: "BOD" };
    expect(pickReferrerUserId({ actor, formValue: "someone-else" })).toBe("bod-1");
    expect(pickReferrerUserId({ actor, formValue: undefined })).toBe("bod-1");
  });

  it("uses the picked BOD when BD/ADMIN enter on their behalf", () => {
    expect(pickReferrerUserId({ actor: { id: "bd-1", role: "BD" }, formValue: "bod-9" })).toBe("bod-9");
  });

  it("refuses a BD submission with no referrer chosen", () => {
    expect(() => pickReferrerUserId({ actor: { id: "bd-1", role: "BD" }, formValue: "  " })).toThrow(
      /Referrer is required/
    );
  });
});

describe("display helpers", () => {
  it("formats the lead code from the sequence", () => {
    expect(formatLeadCode(123)).toBe("BOD-000123");
    expect(formatLeadCode(null)).toBe("");
  });

  it("falls back to the raw code for unknown values", () => {
    expect(labelOf(LEAD_STATUSES, "APPOINTMENT")).toBe("Appointment/Consultation");
    expect(labelOf(LEAD_STATUSES, "MYSTERY")).toBe("MYSTERY");
  });
});
