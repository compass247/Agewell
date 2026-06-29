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
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------- Enums ----------------
export const roleEnum = pgEnum("role", ["ADMIN", "BD", "CS"]);

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

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXPORT",
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

    // Identity (name is plaintext + indexed for search).
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dobEnc: text("dob_enc").notNull(), // AES-GCM ciphertext (MM/DD/YYYY)

    // Contact.
    primaryPhone: text("primary_phone").notNull(),
    secondaryPhone: text("secondary_phone"),
    email: text("email"),
    street: text("street"),
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
