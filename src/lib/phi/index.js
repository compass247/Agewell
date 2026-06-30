/* ============================================================
   PHI lib barrel — convenience re-exports.
   Import specific modules directly in performance-sensitive paths.
   ============================================================ */
export { db, schema } from "./db.js";
export * as tables from "./schema.js";
export { encryptField, decryptField, maskTail } from "./crypto.js";
export { diffFields, REDACTED_FIELDS } from "./diff.js";
export { writeAudit } from "./audit.js";
export {
  ROLES,
  can,
  requireCan,
  requireRole,
  assertCanEditPatient,
  forbidden,
} from "./rbac.js";
export { requireSession } from "./session.js";
