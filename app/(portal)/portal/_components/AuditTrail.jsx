/* Renders a patient's audit history (server component, read-only). */
const ACTION_LABELS = {
  CREATE: "Created",
  UPDATE: "Updated",
  READ: "Viewed",
  STATUS_CHANGE: "Status changed",
  DELETE: "Deleted",
  EXPORT: "Exported",
};

function fmt(at) {
  const d = at instanceof Date ? at : new Date(at);
  return d.toLocaleString("en-US");
}

export default function AuditTrail({ entries }) {
  if (!entries?.length) return <p className="pf-muted">No history yet.</p>;
  return (
    <ul className="pf-audit" style={{ listStyle: "none", padding: 0 }}>
      {entries.map((e) => (
        <li key={e.id}>
          <strong>{ACTION_LABELS[e.action] || e.action}</strong>{" "}
          <span className="pf-muted">
            by {e.actorEmail || "system"} · {fmt(e.at)}
          </span>
          {Array.isArray(e.changes) && e.changes.length ? (
            <div className="pf-muted">
              {e.changes.map((c, i) => (
                <div key={i}>
                  {c.field}: <em>{String(c.old ?? "∅")}</em> →{" "}
                  <em>{String(c.new ?? "∅")}</em>
                </div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
