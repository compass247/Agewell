/* Read helpers for the patient detail view: audit history + notes thread. */
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db.js";
import { auditLog, patientNotes, users } from "./schema.js";

/** Audit rows for a patient (the record itself + its notes), newest first. */
export async function getPatientAudit(patientId, limit = 100) {
  return db
    .select({
      id: auditLog.id,
      at: auditLog.at,
      actorEmail: auditLog.actorEmail,
      action: auditLog.action,
      entity: auditLog.entity,
      changes: auditLog.changes,
      meta: auditLog.meta,
    })
    .from(auditLog)
    .where(and(eq(auditLog.entity, "patient"), eq(auditLog.entityId, patientId)))
    .orderBy(desc(auditLog.at))
    .limit(limit);
}

/** Notes thread for a patient with author email, oldest first. */
export async function getPatientNotes(patientId) {
  return db
    .select({
      id: patientNotes.id,
      body: patientNotes.body,
      createdAt: patientNotes.createdAt,
      authorEmail: users.email,
    })
    .from(patientNotes)
    .leftJoin(users, eq(patientNotes.authorId, users.id))
    .where(eq(patientNotes.patientId, patientId))
    .orderBy(patientNotes.createdAt);
}
