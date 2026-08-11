/* ============================================================
   BOD Leads — dropdown options (SINGLE SOURCE OF TRUTH).

   Every list below feeds three places at once: the pgEnum values in schema.js,
   the zod enums in validation.js, and the <select> options in the form. Adding
   a value here is only half the job for the pgEnum-backed lists — they also
   need one `ALTER TYPE … ADD VALUE` line in a new migration.

   Stored value = the CODE (left), never the label: labels carry Vietnamese
   diacritics and separators (·, /, &) that would be painful to migrate later.
   Labels are BD's wording verbatim.

   Referrer is deliberately NOT a list here — it comes from the BOD user
   accounts themselves (users.name); see bod-leads.repo.js listBodReferrers().
   ============================================================ */

export const LEAD_SOURCES = [
  ["FOUNDER_REFERRAL", "Founder Referral"],
  ["COMMUNITY", "Community"],
  ["PARTNER", "Partner"],
  ["DIGITAL", "Digital"],
  ["OTHER", "Other"],
];

export const TIERS = [
  ["TIER_1", "Tier 1 · Gia đình trực hệ"],
  ["TIER_2A", "Tier 2a · Bạn bè / người quen (khách lẻ)"],
  ["TIER_2B", "Tier 2b · Chủ doanh nghiệp / tổ chức (Partner)"],
];

export const CONTACT_CHANNELS = [
  ["PHONE", "Phone"],
  ["ZALO", "Zalo"],
  ["VIBER", "Viber"],
  ["WHATSAPP", "WhatsApp"],
  ["FACEBOOK", "Facebook"],
  ["EMAIL", "Email"],
  ["OTHER", "Other"],
];

// Consent is a boolean column; these are just its two display labels.
export const CONSENT_OPTIONS = [
  ["yes", "Yes – consent obtained"],
  ["no", "No – do not contact"],
];

export const LEAD_STATUSES = [
  ["NEW", "New"],
  ["ASSIGNED", "Assigned"],
  ["CONTACTING", "Contacting"],
  ["CONTACTED", "Contacted"],
  ["QUALIFIED", "Qualified"],
  ["APPOINTMENT", "Appointment/Consultation"],
  ["ENROLLED", "Enrolled"],
  ["NOT_INTERESTED", "Not Interested"],
  ["UNABLE_TO_REACH", "Unable to Reach"],
  ["NOT_ELIGIBLE", "Not Eligible"],
];

export const SERVICES_INTERESTED = [
  ["CCM", "CCM"],
  ["MTM_CMR", "MTM / CMR"],
  ["EM_TELEHEALTH", "E&M Telehealth"],
  ["CCM_PLUS", "CCM Plus"],
  ["SELF_PAY", "Self-pay"],
  ["UNDECIDED", "Chưa xác định"],
  ["OTHER", "Other"],
];

export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

/** Codes only — what schema.js and validation.js consume. */
const codes = (pairs) => pairs.map(([value]) => value);

export const LEAD_SOURCE_VALUES = codes(LEAD_SOURCES);
export const TIER_VALUES = codes(TIERS);
export const CONTACT_CHANNEL_VALUES = codes(CONTACT_CHANNELS);
export const LEAD_STATUS_VALUES = codes(LEAD_STATUSES);
export const SERVICE_VALUES = codes(SERVICES_INTERESTED);
export const US_STATE_VALUES = codes(US_STATES);

/** Look up a display label; falls back to the raw code for unknown values. */
export function labelOf(pairs, value) {
  if (value == null) return "";
  const hit = pairs.find(([v]) => v === value);
  return hit ? hit[1] : String(value);
}

/** Human-facing Lead ID from the DB sequence: 123 -> "BOD-000123". */
export function formatLeadCode(leadNo) {
  if (leadNo == null) return "";
  return `BOD-${String(leadNo).padStart(6, "0")}`;
}

/**
 * Decide which user a new lead is attributed to.
 *
 * A BOD is ALWAYS attributed to themselves — the form value is ignored, not
 * merely disabled in the browser, because a disabled input is trivially
 * re-enabled and re-POSTed. BD/ADMIN entering a lead on someone's behalf must
 * pick a BOD account explicitly.
 *
 * Pure function (no DB) so the rule is unit-testable.
 */
export function pickReferrerUserId({ actor, formValue }) {
  if (!actor) throw new Error("Missing actor.");
  if (actor.role === "BOD") return actor.id;
  const picked = String(formValue || "").trim();
  if (!picked) {
    const err = new Error("Referrer is required — pick the BOD who referred this lead.");
    err.code = "REFERRER_REQUIRED";
    throw err;
  }
  return picked;
}
