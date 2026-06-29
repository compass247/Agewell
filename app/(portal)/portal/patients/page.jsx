import Link from "next/link";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { listPatients } from "../../../../src/lib/phi/patients.repo.js";
import { logPatientSearch } from "../../../../src/lib/phi/read-audit.js";
import StatusBadge from "../_components/StatusBadge.jsx";
import Filters from "../_components/Filters.jsx";
import ExportButton from "../_components/ExportButton.jsx";
import "../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "REVIEWED_BY_CS", "ENTERED_IN_EMR", "COMPLETE"];

function fmtDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US");
}

export default async function PatientsPage({ searchParams }) {
  const actor = await requireSession();

  const filters = {
    search: searchParams.q || "",
    status: STATUSES.includes(searchParams.status) ? searchParams.status : "",
    from: searchParams.from ? new Date(searchParams.from) : undefined,
    to: searchParams.to ? new Date(searchParams.to) : undefined,
    sort: searchParams.sort || "createdAt",
    dir: searchParams.dir === "asc" ? "asc" : "desc",
    page: Number(searchParams.page) || 1,
  };

  const { rows, total, page, pageSize } = await listPatients(filters);

  // One audit row per search/list request (bounded volume).
  await logPatientSearch(actor, {
    filters: { q: filters.search, status: filters.status },
    resultCount: total,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canExport = actor.role === "ADMIN" || actor.role === "CS";

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>Patients</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {canExport ? <ExportButton filters={{ search: filters.search, status: filters.status }} /> : null}
          <Link className="pf-btn pf-btn--ghost" href="/portal/patients/import">Import</Link>
          <Link className="pf-btn" href="/portal/patients/new">+ New patient</Link>
        </div>
      </div>

      <div className="pf-card">
        <Filters defaults={{ q: filters.search, status: filters.status }} statuses={STATUSES} />

        <table className="pf-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Referral</th>
              <th>Created</th>
              <th>Assigned CS</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="pf-muted">No patients match.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.patientExternalId || "—"}</td>
                  <td>
                    <Link href={`/portal/patients/${r.id}`}>
                      {r.lastName}, {r.firstName}
                    </Link>
                  </td>
                  <td>{r.dob || "—"}</td>
                  <td>{r.primaryPhone}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.referralSource || "—"}</td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td>{r.assignedCsEmail || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 14 }}>
          <span className="pf-muted">
            {total} record{total === 1 ? "" : "s"} · page {page} of {totalPages}
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            {page > 1 ? (
              <Link className="pf-btn pf-btn--ghost" href={pageHref(searchParams, page - 1)}>
                ← Prev
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link className="pf-btn pf-btn--ghost" href={pageHref(searchParams, page + 1)}>
                Next →
              </Link>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

function pageHref(searchParams, page) {
  const sp = new URLSearchParams();
  if (searchParams.q) sp.set("q", searchParams.q);
  if (searchParams.status) sp.set("status", searchParams.status);
  sp.set("page", String(page));
  return `/portal/patients?${sp.toString()}`;
}
