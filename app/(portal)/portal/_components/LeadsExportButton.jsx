"use client";
/* Mirror of ExportButton for the Leads screen (different action + filename). */
import { useState } from "react";
import { exportLeadsCsv } from "../_actions/leads-export.js";

export default function LeadsExportButton({ filters }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const { csv } = await exportLeadsCsv(filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="pf-btn pf-btn--ghost" onClick={handleExport} disabled={busy}>
      {busy ? "Exporting…" : "Export CSV"}
    </button>
  );
}
