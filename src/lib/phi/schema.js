/* ============================================================
   PHI portal — Drizzle schema (SINGLE SOURCE OF TRUTH).

   `npm run phi:db:generate` compiles this to versioned SQL in ../../../drizzle,
   which is committed and applied identically local and (future) prod.

   PHI lives ONLY in this database. Highest-sensitivity columns (Medicare MBI,
   DOB) and the MFA secret are stored as app-layer AES-256-GCM ciphertext (see
   crypto.js) on top of disk encryption — never as plaintext.
   ============================================================ */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  bigserial,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  LEAD_SOURCE_VALUES,
  TIER_VALUES,
  CONTACT_CHANNEL_VALUES,
  LEAD_STATUS_VALUES,
  SERVICE_VALUES,
} from "./bod-leads.options.js";

// ---------------- Enums ----------------
export const roleEnum = pgEnum("role", ["ADMIN", "BD", "CS", "BOD"]);

export const patientStatusEnum = pgEnum("patient_status", [
  "NEW",
  "REVIEWED_BY_CS",
  "ENTERED_IN_EMR",
  "COMPLETE",
]);

export const preferredLanguageEnum = pgEnum("preferred_language", [
  "ENGLISH",
  "VIETNAMESE",
  "SPANISH",
  "OTHER",
]);

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

// BOD-referred lead enums. Values come from bod-leads.options.js so the
// dropdown, the zod schema, and the column type can never drift apart.
export const bodLeadSourceEnum = pgEnum("bod_lead_source", LEAD_SOURCE_VALUES);
export const bodLeadTierEnum = pgEnum("bod_lead_tier", TIER_VALUES);
export const bodContactChannelEnum = pgEnum(
  "bod_contact_channel",
  CONTACT_CHANNEL_VALUES
);
export const bodServiceEnum = pgEnum("bod_service", SERVICE_VALUES);
export const bodLeadStatusEnum = pgEnum("bod_lead_status", LEAD_STATUS_VALUES);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "IMPORT",
  "LOGIN",
  "LOGOUT",
  "LOGIN_FAILED",
  "STATUS_CHANGE",
  "MFA_ENROLL",
]);

// ---------------- users ----------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(), // stored lowercase
    // Display name of the staff member. Doubles as the Referrer shown on BOD
    // leads, so every BOD account must carry the person's real name.
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(), // argon2id
    role: roleEnum("role").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    mfaSecret: text("mfa_secret"), // AES-GCM ciphertext; null until enrolled
    mfaEnrolledAt: timestamp("mfa_enrolled_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by"), // self-ref filled by app (nullable for seed admin)
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    roleIdx: index("users_role_idx").on(t.role),
  })
);

// ---------------- patients ----------------
export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // External identifier from another system (e.g. EMR/Practice Fusion).
    // Plaintext + indexed for search and import de-duplication. Optional;
    // NOT a unique constraint (external IDs may be blank or non-unique).
    patientExternalId: text("patient_external_id"),

    // Identity (name is plaintext + indexed for search).
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dobEnc: text("dob_enc").notNull(), // AES-GCM ciphertext (MM/DD/YYYY)
    gender: genderEnum("gender"), // optional demographic

    // Contact.
    primaryPhone: text("primary_phone").notNull(),
    secondaryPhone: text("secondary_phone"),
    email: text("email"),
    address1: text("address1"),
    address2: text("address2"),
    city: text("city"),
    state: text("state"),
    zip: text("zip"),

    // Insurance.
    medicareMbiEnc: text("medicare_mbi_enc"), // AES-GCM ciphertext
    insurancePlan: text("insurance_plan"),
    insuranceMemberId: text("insurance_member_id"),

    // Emergency contact.
    emergencyName: text("emergency_name"),
    emergencyRelationship: text("emergency_relationship"),
    emergencyPhone: text("emergency_phone"),

    // Intake context.
    referralSource: text("referral_source"),
    preferredLanguage: preferredLanguageEnum("preferred_language")
      .notNull()
      .default("ENGLISH"),
    notes: text("notes"), // freeform intake note (the thread is patient_notes)

    // Workflow.
    status: patientStatusEnum("status").notNull().default("NEW"),
    assignedCsId: uuid("assigned_cs_id").references(() => users.id),

    // System fields.
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastModifiedBy: uuid("last_modified_by").references(() => users.id),
    lastModifiedAt: timestamp("last_modified_at", { withTimezone: true }),

    // Soft delete — records are retained (6-yr HIPAA), NEVER hard-deleted.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (t) => ({
    statusIdx: index("patients_status_idx").on(t.status),
    createdAtIdx: index("patients_created_at_idx").on(t.createdAt),
    assignedCsIdx: index("patients_assigned_cs_idx").on(t.assignedCsId),
    createdByIdx: index("patients_created_by_idx").on(t.createdBy),
    nameIdx: index("patients_name_idx").on(t.lastName, t.firstName),
    primaryPhoneIdx: index("patients_primary_phone_idx").on(t.primaryPhone),
    externalIdIdx: index("patients_external_id_idx").on(t.patientExternalId),
    // Partial index: most queries are over not-deleted rows.
    activeIdx: index("patients_active_idx")
      .on(t.createdAt)
      .where(sql`${t.deletedAt} IS NULL`),
  })
);

// ---------------- patient_notes (append-only thread) ----------------
export const patientNotes = pgTable(
  "patient_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id),
    body: text("body").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    patientIdx: index("patient_notes_patient_idx").on(
      t.patientId,
      t.createdAt
    ),
  })
);

// ---------------- bod_leads ----------------
// Customer leads referred by BOD (board) members. Lives in the PHI database
// because it carries DOB + contact details; DOB is app-layer encrypted exactly
// like patients.dob_enc. Managed by BD; BOD members see this module only.
export const bodLeads = pgTable(
  "bod_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Human-facing Lead ID (BOD-000123) is derived from this sequence — never
    // typed by hand, so it can't collide or be back-dated.
    leadNo: bigserial("lead_no", { mode: "number" }).notNull().unique(),

    leadSource: bodLeadSourceEnum("lead_source").notNull(),

    // Attribution: the BOD account credited with the referral, plus a snapshot
    // of their name at creation time so renaming/deactivating a user later
    // never rewrites the history of who brought the lead in.
    referrerUserId: uuid("referrer_user_id")
      .notNull()
      .references(() => users.id),
    referrer: text("referrer").notNull(),

    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(), // plaintext + indexed (searchable), like patients.primary_phone
    state: text("state").notNull(),
    dobEnc: text("dob_enc"), // AES-GCM ciphertext (MM/DD/YYYY); optional

    tier: bodLeadTierEnum("tier").notNull(),
    preferredContactChannel: bodContactChannelEnum(
      "preferred_contact_channel"
    ).notNull(),
    consentToContact: boolean("consent_to_contact").notNull(),
    consentDate: timestamp("consent_date", { withTimezone: true }),
    serviceInterested: bodServiceEnum("service_interested"),
    founderNote: text("founder_note"),

    leadStatus: bodLeadStatusEnum("lead_status").notNull().default("NEW"),
    dateReceived: timestamp("date_received", { withTimezone: true })
      .notNull()
      .defaultNow(),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastModifiedBy: uuid("last_modified_by").references(() => users.id),
    lastModifiedAt: timestamp("last_modified_at", { withTimezone: true }),

    // Soft delete — same retention rule as patients, never hard-deleted.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (t) => ({
    statusIdx: index("bod_leads_status_idx").on(t.leadStatus),
    receivedIdx: index("bod_leads_received_idx").on(t.dateReceived),
    referrerIdx: index("bod_leads_referrer_idx").on(t.referrerUserId),
    customerIdx: index("bod_leads_customer_idx").on(t.customerName),
    phoneIdx: index("bod_leads_phone_idx").on(t.phone),
    activeIdx: index("bod_leads_active_idx")
      .on(t.dateReceived)
      .where(sql`${t.deletedAt} IS NULL`),
  })
);

// ---------------- auth_throttle (login/TOTP brute-force counters) ----------------
// One row per throttle key: "email:<addr>" | "ip:<ip>" | "totp:<userId>".
// Maintained by src/lib/phi/throttle.js; rows are upserted on failure and
// deleted on success — no PHI, safe to truncate at any time.
export const authThrottle = pgTable("auth_throttle", {
  key: text("key").primaryKey(),
  failCount: integer("fail_count").notNull().default(0),
  firstFailAt: timestamp("first_fail_at", { withTimezone: true }),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

// ---------------- audit_log (append-only, immutable) ----------------
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actorId: uuid("actor_id").references(() => users.id), // null on LOGIN_FAILED (unknown email)
    actorEmail: text("actor_email"), // denormalized snapshot
    action: auditActionEnum("action").notNull(),
    entity: text("entity"), // patient | user | note | session
    entityId: uuid("entity_id"),
    changes: jsonb("changes"), // [{ field, old, new }] for UPDATE/STATUS_CHANGE
    meta: jsonb("meta"), // { ip, userAgent, rowCount, query, ... }
  },
  (t) => ({
    entityIdx: index("audit_entity_idx").on(t.entity, t.entityId, t.at),
    actorIdx: index("audit_actor_idx").on(t.actorId, t.at),
    actionIdx: index("audit_action_idx").on(t.action, t.at),
  })
);
