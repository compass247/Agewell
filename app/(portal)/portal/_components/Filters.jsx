"use client";
/* Search + status filter. Submits via GET so the URL carries the query (RSC
   reads searchParams). */
const STATUS_LABELS = {
  NEW: "New",
  REVIEWED_BY_CS: "Reviewed by CS",
  ENTERED_IN_EMR: "Entered in EMR",
  COMPLETE: "Complete",
};

export default function Filters({ defaults = {}, statuses = [] }) {
  return (
    <form method="GET" className="pf-toolbar" style={{ marginBottom: 16 }}>
      <div className="pf-field" style={{ marginBottom: 0 }}>
        <label htmlFor="q">Search (name / phone)</label>
        <input id="q" name="q" defaultValue={defaults.q || ""} placeholder="Nguyen, 714-555…" />
      </div>
      <div className="pf-field" style={{ marginBottom: 0 }}>
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={defaults.status || ""}>
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] || s}
            </option>
          ))}
        </select>
      </div>
      <button className="pf-btn pf-btn--ghost" type="submit">Apply</button>
    </form>
  );
}
