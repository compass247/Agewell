/* Zod validation for patient intake input. Shared by create/edit actions. */
import { z } from "zod";

// Optional free-text field. Accepts string | null | undefined, trims, and
// normalizes empty/absent to null. Idempotent: re-parsing its own output (null)
// succeeds — important because import re-validates already-parsed rows.
const optional = () =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const t = String(v).trim();
      return t === "" ? null : t.slice(0, 200);
    });

export const PREFERRED_LANGUAGES = ["ENGLISH", "VIETNAMESE", "SPANISH", "OTHER"];
export const GENDERS = ["MALE", "FEMALE", "OTHER"];
export const PATIENT_STATUSES = [
  "NEW",
  "REVIEWED_BY_CS",
  "ENTERED_IN_EMR",
  "COMPLETE",
];

export const patientInputSchema = z.object({
  patientExternalId: optional(z.string()),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  // MM/DD/YYYY
  dob: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date of birth must be MM/DD/YYYY"),
  primaryPhone: z.string().trim().min(7, "Primary phone is required").max(40),
  secondaryPhone: optional(z.string()),
  email: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const t = String(v).trim();
      return t === "" ? null : t;
    })
    .refine((v) => v == null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
      message: "Invalid email",
    }),
  address1: optional(z.string()),
  address2: optional(z.string()),
  city: optional(z.string()),
  state: optional(z.string()),
  zip: optional(z.string()),
  medicareMbi: optional(z.string()),
  insurancePlan: optional(z.string()),
  insuranceMemberId: optional(z.string()),
  emergencyName: optional(z.string()),
  emergencyRelationship: optional(z.string()),
  emergencyPhone: optional(z.string()),
  referralSource: optional(z.string()),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES).default("ENGLISH"),
  // Optional enum: accept a GENDERS value, or null/empty -> null. Idempotent so
  // re-validating the schema's own output (null) during import still succeeds.
  gender: z
    .union([z.enum(GENDERS), z.null(), z.undefined(), z.literal("")])
    .transform((v) => (v ? v : null)),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const t = String(v).trim();
      return t === "" ? null : t.slice(0, 5000);
    }),
});

export const statusSchema = z.enum(PATIENT_STATUSES);

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(5000),
});
