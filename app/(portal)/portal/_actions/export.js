"use server";
/* CSV export of patients (Admin + CS only). Audited as a bulk-disclosure EXPORT
   event with the applied filters + row count. Returns the CSV as a string the
   client turns into a download. */
import { db } from "../../../../src/lib/phi/db.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { listPatients } from "../../../../src/lib/phi/patients.repo.js";

const HEADERS = [
  "id",
  "patientExternalId",
  "lastName",
  "firstName",
  "dob",
  "primaryPhone",
  "status",
  "referralSource",
  "assignedCsEmail",
  "createdAt",
];

function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportCsv(filters = {}) {
  const actor = await requireSession();
  requireCan(actor, "export"); // ADMIN or CS only

  // Pull all matching rows (cap to a sane export ceiling).
  const { rows } = await listPatients({ ...filters, page: 1, pageSize: 5000 });

  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.patientExternalId,
        r.lastName,
        r.firstName,
        r.dob, // decrypted for the authorized export
        r.primaryPhone,
        r.status,
        r.referralSource,
        r.assignedCsEmail,
        r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      ]
        .map(csvCell)
        .join(",")
    );
  }
  const csv = lines.join("\n");

  await writeAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "EXPORT",
    entity: "patient",
    meta: { filters, rowCount: rows.length },
  });

  return { csv, rowCount: rows.length };
}
