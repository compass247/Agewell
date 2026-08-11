"use client";
import { useState } from "react";
import { changeBodLeadStatus } from "../_actions/bod-leads.js";
import { LEAD_STATUSES } from "../../../../src/lib/phi/bod-leads.options.js";

export default function BodLeadStatusUpdate({ leadId, current }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const next = e.target.value;
    if (next === current) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("status", next);
    const res = await changeBodLeadStatus(leadId, fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      e.target.value = current; // revert UI
    }
  }

  return (
    <div className="pf-field" style={{ maxWidth: 260 }}>
      <label htmlFor="leadStatus">Lead status</label>
      <select id="leadStatus" defaultValue={current} onChange={handleChange} disabled={busy}>
        {LEAD_STATUSES.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
      {error ? <span className="pf-error">{error}</span> : null}
    </div>
  );
}
