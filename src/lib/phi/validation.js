/* Zod validation for patient intake input. Shared by create/edit actions. */
import { z } from "zod";

const optional = (s) =>
  z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null));

export const PREFERRED_LANGUAGES = ["ENGLISH", "VIETNAMESE", "SPANISH", "OTHER"];
export const PATIENT_STATUSES = [
  "NEW",
  "REVIEWED_BY_CS",
  "ENTERED_IN_EMR",
  "COMPLETE",
];

export const patientInputSchema = z.object({
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
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v == null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
      message: "Invalid email",
    }),
  street: optional(z.string()),
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
  notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => (v ? v : null)),
});

export const statusSchema = z.enum(PATIENT_STATUSES);

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(5000),
});
