/* ============================================================
   Validated BOD-lead input → DB row mapper (defined ONCE).

   Mirrors patient-map.js: create and update both persist the same validated
   bodLeadInputSchema shape, so the input→column translation (incl. app-layer
   DOB encryption and MM/DD/YYYY → Date) lives in exactly one place.

   Note what is NOT here: referrerUserId / referrer. Attribution is decided by
   the action from the session (see pickReferrerUserId), never from the form,
   and it is immutable after creation.
   ============================================================ */
import { encryptField } from "./crypto.js";

/** "MM/DD/YYYY" → Date at local midnight, or null. Format is pre-validated. */
export function parseUsDate(value) {
  if (!value) return null;
  const [mm, dd, yyyy] = String(value).split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "MM/DD/YYYY" for form defaults. */
export function formatUsDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/** Map validated BOD-lead input to the shared bod_leads columns. */
export function toBodLeadRow(d) {
  return {
    leadSource: d.leadSource,
    customerName: d.customerName,
    phone: d.phone,
    state: d.state,
    dobEnc: encryptField(d.dob),
    tier: d.tier,
    preferredContactChannel: d.preferredContactChannel,
    consentToContact: d.consentToContact,
    consentDate: parseUsDate(d.consentDate),
    serviceInterested: d.serviceInterested,
    founderNote: d.founderNote,
  };
}
