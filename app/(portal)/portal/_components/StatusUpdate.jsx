"use client";
import { useState } from "react";
import { changeStatus } from "../_actions/patients.js";

const STATUSES = [
  ["NEW", "New"],
  ["REVIEWED_BY_CS", "Reviewed by CS"],
  ["ENTERED_IN_EMR", "Entered in EMR"],
  ["COMPLETE", "Complete"],
];

export default function StatusUpdate({ patientId, current }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const next = e.target.value;
    if (next === current) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("status", next);
    const res = await changeStatus(patientId, fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      e.target.value = current; // revert UI
    }
  }

  return (
    <div className="pf-field" style={{ maxWidth: 240 }}>
      <label htmlFor="status">Status</label>
      <select id="status" defaultValue={current} onChange={handleChange} disabled={busy}>
        {STATUSES.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
      {error ? <span className="pf-error">{error}</span> : null}
    </div>
  );
}
