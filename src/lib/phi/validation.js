/* Zod validation for patient intake + BOD lead input. Shared by create/edit
   actions (and, for patients, by CSV import). */
import { z } from "zod";
import {
  LEAD_SOURCE_VALUES,
  TIER_VALUES,
  CONTACT_CHANNEL_VALUES,
  LEAD_STATUS_VALUES,
  SERVICE_VALUES,
  US_STATE_VALUES,
} from "./bod-leads.options.js";

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

/* ---------------- BOD leads ---------------- */

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;

// Optional MM/DD/YYYY date: blank -> null, otherwise format-checked.
const optionalDate = (label) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null || String(v).trim() === "" ? null : String(v).trim()))
    .refine((v) => v == null || DATE_RE.test(v), {
      message: `${label} must be MM/DD/YYYY`,
    });

export const bodLeadInputSchema = z
  .object({
    leadSource: z.enum(LEAD_SOURCE_VALUES),
    // referrerUserId is authoritative only for BD/ADMIN; for a BOD the action
    // overrides it with the actor's own id (see pickReferrerUserId).
    referrerUserId: optional(z.string()),
    customerName: z.string().trim().min(1, "Customer name is required").max(200),
    phone: z.string().trim().min(7, "Phone is required").max(40),
    state: z.enum(US_STATE_VALUES, { errorMap: () => ({ message: "State is required" }) }),
    dob: optionalDate("Date of birth"),
    tier: z.enum(TIER_VALUES),
    preferredContactChannel: z.enum(CONTACT_CHANNEL_VALUES),
    // Radio/select posts the string "yes" | "no".
    consentToContact: z
      .union([z.enum(["yes", "no"]), z.boolean()])
      .transform((v) => (typeof v === "boolean" ? v : v === "yes")),
    consentDate: optionalDate("Consent date"),
    serviceInterested: z
      .union([z.enum(SERVICE_VALUES), z.null(), z.undefined(), z.literal("")])
      .transform((v) => (v ? v : null)),
    founderNote: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v == null) return null;
        const t = String(v).trim();
        return t === "" ? null : t.slice(0, 5000);
      }),
    dateReceived: optionalDate("Date received"),
  })
  .superRefine((d, ctx) => {
    // "Consent obtained" without a date is the kind of gap that bites during a
    // compliance review — make the pair inseparable.
    if (d.consentToContact && !d.consentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consentDate"],
        message: "Consent date is required when consent has been obtained.",
      });
    }
  });

export const bodLeadStatusSchema = z.enum(LEAD_STATUS_VALUES);
