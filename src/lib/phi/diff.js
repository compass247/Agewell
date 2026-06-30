/* ============================================================
   Field-level diff builder for the audit trail.

   diffFields(before, after, fields) -> [{ field, old, new }] for every listed
   field whose value changed. Encrypted/sensitive fields must be passed through
   REDACTED_FIELDS so their plaintext never lands in the audit log.
   ============================================================ */

// Columns whose values must never appear in the audit log as plaintext.
export const REDACTED_FIELDS = new Set([
  "dob",
  "dobEnc",
  "medicareMbi",
  "medicareMbiEnc",
  "mfaSecret",
  "passwordHash",
]);

const REDACTED = "«redacted»";

function normalize(v) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}

/**
 * Build a change list for the given fields. `redacted` lets callers add
 * extra field names to redact for a specific entity.
 */
export function diffFields(before, after, fields, redacted = []) {
  const redactSet = new Set([...REDACTED_FIELDS, ...redacted]);
  const changes = [];
  for (const field of fields) {
    const oldVal = normalize(before?.[field]);
    const newVal = normalize(after?.[field]);
    if (oldVal === newVal) continue;
    if (redactSet.has(field)) {
      changes.push({ field, old: REDACTED, new: REDACTED });
    } else {
      changes.push({ field, old: oldVal, new: newVal });
    }
  }
  return changes;
}
