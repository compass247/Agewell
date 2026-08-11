import { redirect } from "next/navigation";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { homePathFor } from "../../../../src/lib/phi/rbac.js";
import { listLeads } from "../../../../src/lib/leads.repo.js";
import LeadsExportButton from "../_components/LeadsExportButton.jsx";
import "../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Marketing leads (website signup form → DynamoDB). Read-only: DynamoDB is
// the source of truth and this screen never writes. Not PHI — served to the
// BD team (plus ADMIN); CS/others are bounced in auth.config.js AND here.
const ALLOWED_ROLES = ["ADMIN", "BD"];
const PAGE_SIZE = 25;

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function LeadsPage({ searchParams }) {
  const actor = await requireSession();
  if (!ALLOWED_ROLES.includes(actor.role)) redirect(homePathFor(actor.role));

  const filters = {
    search: searchParams.q || "",
    lang: ["vi", "en"].includes(searchParams.lang) ? searchParams.lang : "",
    page: Number(searchParams.page) || 1,
    pageSize: PAGE_SIZE,
  };

  let rows = [], total = 0, page = 1, error = null;
  try {
    ({ rows, total, page } = await listLeads(filters));
  } catch (err) {
    console.error("[leads] list failed", err);
    error = "Could not load leads. Check the DynamoDB connection and try again.";
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>Leads</h1>
        <LeadsExportButton filters={{ search: filters.search, lang: filters.lang }} />
      </div>

      <div className="pf-card">
        {/* Plain GET form — the RSC re-renders from searchParams, no client JS. */}
        <form method="GET" className="pf-toolbar" style={{ marginBottom: 16 }}>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="q">Search (name / phone)</label>
            <input id="q" name="q" defaultValue={filters.search} placeholder="Nguyen, 714-555…" />
          </div>
          <div className="pf-field" style={{ marginBottom: 0 }}>
            <label htmlFor="lang">Language</label>
            <select id="lang" name="lang" defaultValue={filters.lang}>
              <option value="">All</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <button className="pf-btn pf-btn--ghost" type="submit">Apply</button>
        </form>

        {error ? <p className="pf-muted">{error}</p> : null}

        <table className="pf-table">
          <thead>
            <tr>
              <th>Received</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Services</th>
              <th>Lang</th>
              <th>Source</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="pf-muted">
                  {error ? "—" : "No leads match."}
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr key={l.leadId}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDateTime(l.createdAt)}</td>
                  <td>{l.name || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{l.phone || "—"}</td>
                  <td>{Array.isArray(l.services) && l.services.length ? l.services.join(", ") : "—"}</td>
                  <td>{(l.lang || "").toUpperCase() || "—"}</td>
                  <td>{l.source || "—"}</td>
                  <td>{l.message || "—"}</td>
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
              <a className="pf-btn pf-btn--ghost" href={pageHref(searchParams, page - 1)}>← Prev</a>
            ) : null}
            {page < totalPages ? (
              <a className="pf-btn pf-btn--ghost" href={pageHref(searchParams, page + 1)}>Next →</a>
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
  if (searchParams.lang) sp.set("lang", searchParams.lang);
  sp.set("page", String(page));
  return `/portal/leads?${sp.toString()}`;
}
