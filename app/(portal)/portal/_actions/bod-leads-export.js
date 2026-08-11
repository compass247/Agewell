"use server";
/* CSV export of BOD leads (Admin + BD only — never BOD themselves). Audited as
   a bulk-disclosure EXPORT event with the applied filters + row count. Returns
   the CSV as a string the client turns into a download. */
import { db } from "../../../../src/lib/phi/db.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { requireCanBodLead } from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { listBodLeads } from "../../../../src/lib/phi/bod-leads.repo.js";
import { formatLeadCode } from "../../../../src/lib/phi/bod-leads.options.js";
import { csvLine } from "../../../../src/lib/phi/csv.js";

const HEADERS = [
  "leadId",
  "leadSource",
  "referrer",
  "customerName",
  "phone",
  "state",
  "dob",
  "tier",
  "preferredContactChannel",
  "consentToContact",
  "serviceInterested",
  "leadStatus",
  "dateReceived",
];

export async function exportBodLeadsCsv(filters = {}) {
  const actor = await requireSession();
  requireCanBodLead(actor, "export"); // ADMIN or BD only

  // Pull all matching rows (cap to a sane export ceiling).
  const { rows } = await listBodLeads({ ...filters, page: 1, pageSize: 5000 });

  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      csvLine([
        formatLeadCode(r.leadNo),
        r.leadSource,
        r.referrer,
        r.customerName,
        r.phone,
        r.state,
        r.dob, // decrypted for the authorized export
        r.tier,
        r.preferredContactChannel,
        r.consentToContact ? "Yes" : "No",
        r.serviceInterested,
        r.leadStatus,
        r.dateReceived instanceof Date
          ? r.dateReceived.toISOString()
          : r.dateReceived,
      ])
    );
  }
  const csv = lines.join("\n");

  await writeAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "EXPORT",
    entity: "bod_lead",
    meta: { filters, rowCount: rows.length },
  });

  return { csv, rowCount: rows.length };
}
