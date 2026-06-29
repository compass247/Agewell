/* ============================================================
   Transactional audit writer.

   writeAudit(tx, entry) inserts an audit_log row using the SAME drizzle
   transaction handle as the mutation, so an action and its audit record commit
   or roll back atomically — no mutation can exist without its audit trail.

   For login/read/export events with no surrounding mutation, pass the top-level
   `db` as `tx` (a single insert is atomic on its own).
   ============================================================ */
import { auditLog } from "./schema.js";

/**
 * @param {object} tx    drizzle transaction handle (or db for standalone events)
 * @param {object} entry
 * @param {string|null} entry.actorId
 * @param {string|null} entry.actorEmail
 * @param {string} entry.action     one of auditActionEnum
 * @param {string} [entry.entity]   patient | user | note | session
 * @param {string|null} [entry.entityId]
 * @param {Array}  [entry.changes]  [{ field, old, new }]
 * @param {object} [entry.meta]     { ip, userAgent, rowCount, query, ... }
 */
export async function writeAudit(tx, entry) {
  await tx.insert(auditLog).values({
    actorId: entry.actorId ?? null,
    actorEmail: entry.actorEmail ?? null,
    action: entry.action,
    entity: entry.entity ?? null,
    entityId: entry.entityId ?? null,
    changes: entry.changes ?? null,
    meta: entry.meta ?? null,
  });
}
