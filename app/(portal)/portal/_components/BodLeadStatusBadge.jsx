/* BOD-lead status pill. Server-safe (no client hooks). Separate from the
   patient StatusBadge because the two pipelines share no status values. */
import { LEAD_STATUSES, labelOf } from "../../../../src/lib/phi/bod-leads.options.js";

export default function BodLeadStatusBadge({ status }) {
  return (
    <span className={`pf-badge pf-badge--BL_${status}`}>
      {labelOf(LEAD_STATUSES, status)}
    </span>
  );
}
