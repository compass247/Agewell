"use server";
/* CSV export of marketing leads (read-only DynamoDB view — not PHI, so no
   PHI audit row; the export is traced via CloudWatch logs instead). */
import { requireSession } from "../../../../src/lib/phi/session.js";
import { listLeads, leadsToCsv } from "../../../../src/lib/leads.repo.js";

const ALLOWED_ROLES = ["ADMIN", "BD"];

export async function exportLeadsCsv(filters = {}) {
  const actor = await requireSession({ throwOnFail: true });
  if (!ALLOWED_ROLES.includes(actor.role)) {
    throw new Error("Not allowed.");
  }

  const { rows } = await listLeads({
    search: filters.search || "",
    lang: filters.lang || "",
    pageSize: 0, // all matching rows
  });

  console.log(
    `[leads-export] ${actor.email} (${actor.role}) exported ${rows.length} leads`
  );
  return { csv: leadsToCsv(rows) };
}
