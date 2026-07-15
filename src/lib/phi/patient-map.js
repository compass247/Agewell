/* ============================================================
   Validated patient input → DB row mapper (defined ONCE).

   createPatient, updatePatient, and commitImport all persist the same
   validated patientInputSchema shape; this mapper is the single place that
   translates it to column values (incl. app-layer encryption of DOB/MBI).
   It was previously copy-pasted per action and the copies drifted once
   (missing address columns on update) — don't inline it again.
   ============================================================ */
import { encryptField } from "./crypto.js";

/** Map validated patient input to the shared patients-table columns. */
export function toPatientRow(d) {
  return {
    patientExternalId: d.patientExternalId,
    firstName: d.firstName,
    lastName: d.lastName,
    dobEnc: encryptField(d.dob),
    primaryPhone: d.primaryPhone,
    secondaryPhone: d.secondaryPhone,
    email: d.email,
    address1: d.address1,
    address2: d.address2,
    city: d.city,
    state: d.state,
    zip: d.zip,
    medicareMbiEnc: encryptField(d.medicareMbi),
    insurancePlan: d.insurancePlan,
    insuranceMemberId: d.insuranceMemberId,
    emergencyName: d.emergencyName,
    emergencyRelationship: d.emergencyRelationship,
    emergencyPhone: d.emergencyPhone,
    referralSource: d.referralSource,
    preferredLanguage: d.preferredLanguage,
    gender: d.gender,
    notes: d.notes,
  };
}
