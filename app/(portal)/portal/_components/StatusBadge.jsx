/* Status pill. Server-safe (no client hooks). */
const LABELS = {
  NEW: "New",
  REVIEWED_BY_CS: "Reviewed by CS",
  ENTERED_IN_EMR: "Entered in EMR",
  COMPLETE: "Complete",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`pf-badge pf-badge--${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
