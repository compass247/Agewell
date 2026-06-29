/* Helpers to log PHI READ disclosures at bounded volume: one row per detail
   view, one per search/list request (NOT per result row). */
import { db } from "./db.js";
import { writeAudit } from "./audit.js";

export async function logPatientRead(actor, patientId) {
  await writeAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "READ",
    entity: "patient",
    entityId: patientId,
  });
}

export async function logPatientSearch(actor, { filters, resultCount }) {
  await writeAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "READ",
    entity: "patient",
    meta: { search: true, filters, resultCount },
  });
}
