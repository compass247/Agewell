import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { canBodLead, homePathFor } from "../../../../src/lib/phi/rbac.js";
import { listBodLeads } from "../../../../src/lib/phi/bod-leads.repo.js";
import { logBodLeadSearch } from "../../../../src/lib/phi/read-audit.js";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  TIERS,
  formatLeadCode,
  labelOf,
} from "../../../../src/lib/phi/bod-leads.options.js";
import BodLeadStatusBadge from "../_components/BodLeadStatusBadge.jsx";
import BodLeadsExportButton from "../_components/BodLeadsExportButton.jsx";
import "../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_VALUES = LEAD_STATUSES.map(([v]) => v);
const SOURCE_VALUES = LEAD_SOURCES.map(([v]) => v);
const TIER_VALUES = TIERS.map(([v]) => v);

function fmtDate(d) {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US");
}

export default async function BodLeadsPage({ searchParams }) {
  const actor = await requireSession();
  // Middleware already gated this path; re-check here so a direct RSC fetch
  // can never render leads for an unauthorized role.
  if (!canBodLead(actor, "read")) redirect(homePathFor(actor.role));

  const filters = {
    search: searchParams.q || "",
    status: STATUS_VALUES.includes(searchParams.status) ? searchParams.status : "",
    source: SOURCE_VALUES.includes(searchParams.source) ? searchParams.source : "",
    tier: TIER_VALUES.includes(searchParams.tier) ? searchParams.tier : "",
    sort: searchParams.sort || "dateReceived",
    dir: searchParams.dir === "asc" ? "asc" : "desc",
    page: Number(searchParams.page) || 1,
  };

  const { rows, total, page, pageSize } = await listBodLeads(filters);

  // One audit row per search/list request (bounded volume).
  await logBodLeadSearch(actor, {
    filters: { q: filters.search, status: filters.status, source: filters.source },
    resultCount: total,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canExport = canBodLead(actor, "export");

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>BOD Leads</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {canExport ? (
            <BodLeadsExportButton
              filters={{ search: filters.search, status: filters.status, source: filters.source }}
            />
          ) : null}
          <Link className="pf-btn" href="/portal/bod-leads/new">+ New lead</Link>
        </div>
      </div>

      <div className="pf-card">
        {/* Plain GET form — the RSC re-renders from searchParams, no client JS. */}
        <form method="GET" className="pf-toolbar" style={{ marginBottom: 16 }}>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="q">Search (name / phone / referrer / lead ID)</label>
            <input id="q" name="q" defaultValue={filters.search} placeholder="Nguyen, 714-555…" />
          </div>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={filters.status}>
              <option value="">All</option>
              {LEAD_STATUSES.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="source">Source</label>
            <select id="source" name="source" defaultValue={filters.source}>
              <option value="">All</option>
              {LEAD_SOURCES.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="tier">Tier</label>
            <select id="tier" name="tier" defaultValue={filters.tier}>
              <option value="">All</option>
              {TIERS.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <button className="pf-btn pf-btn--ghost" type="submit">Apply</button>
        </form>

        <table className="pf-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>State</th>
              <th>Referrer</th>
              <th>Source</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="pf-muted">No leads match.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link href={`/portal/bod-leads/${r.id}`}>{formatLeadCode(r.leadNo)}</Link>
                  </td>
                  <td>{r.customerName}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.phone}</td>
                  <td>{r.state}</td>
                  <td>{r.referrer}</td>
                  <td>{labelOf(LEAD_SOURCES, r.leadSource)}</td>
                  <td>{labelOf(TIERS, r.tier)}</td>
                  <td><BodLeadStatusBadge status={r.leadStatus} /></td>
                  <td>{fmtDate(r.dateReceived)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 14 }}>
          <span className="pf-muted">
            {total} lead{total === 1 ? "" : "s"} · page {page} of {totalPages}
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
  for (const key of ["q", "status", "source", "tier"]) {
    if (searchParams[key]) sp.set(key, searchParams[key]);
  }
  sp.set("page", String(page));
  return `/portal/bod-leads?${sp.toString()}`;
}
