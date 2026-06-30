"use client";
/* Upload → preview → confirm import flow. Calls previewImport (read-only) then
   commitImport (writes). Shows valid rows (with duplicate flags) and invalid
   rows with per-row errors; imports only valid rows. */
import { useState } from "react";
import { previewImport, commitImport } from "../_actions/import.js";

export default function ImportForm() {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  async function handlePreview(e) {
    e.preventDefault();
    setError("");
    setDone(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await previewImport({}, fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      setPreview(null);
    } else {
      setPreview(res);
    }
  }

  async function handleCommit() {
    if (!preview?.valid?.length) return;
    setBusy(true);
    setError("");
    const res = await commitImport({
      fileName: preview.fileName,
      rows: preview.valid.map((v) => v.data),
    });
    setBusy(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setDone(res);
      setPreview(null);
    }
  }

  return (
    <div>
      <p className="pf-muted">
        Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file. The first
        row must be the header. Need the format?{" "}
        <a href="/api/portal/import-template">Download template</a>.
      </p>
      <div className="pf-error" style={{ background: "#fff7e6", color: "#92670a" }}>
        ⚠️ Local dev: upload <strong>synthetic data only</strong> — never real patient data.
      </div>

      <form onSubmit={handlePreview} className="pf-toolbar" style={{ marginTop: 12 }}>
        <input type="file" name="file" accept=".xlsx,.csv" required />
        <button className="pf-btn pf-btn--ghost" type="submit" disabled={busy}>
          {busy ? "Reading…" : "Preview"}
        </button>
      </form>

      {error ? <div className="pf-error">{error}</div> : null}
      {done != null ? (
        <div className="pf-error" style={{ background: "#dcf5e3", color: "#1d7a3a" }}>
          ✓ Imported {done.imported} patient{done.imported === 1 ? "" : "s"}
          {done.skippedDuplicates
            ? ` · skipped ${done.skippedDuplicates} duplicate Patient ID${done.skippedDuplicates === 1 ? "" : "s"}`
            : ""}
          .{" "}
          <a href="/portal/patients">View list</a>.
        </div>
      ) : null}

      {preview ? (
        <div style={{ marginTop: 16 }}>
          <p>
            <strong>{preview.valid.length}</strong> will import ·{" "}
            <strong>{preview.invalid.length}</strong> skipped (invalid or
            duplicate Patient ID)
          </p>

          {preview.valid.length ? (
            <>
              <h2 className="pf-h2">Will import ({preview.valid.length})</h2>
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>DOB</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.valid.map((v) => (
                    <tr key={v.rowNumber}>
                      <td>{v.rowNumber}</td>
                      <td>{v.data.patientExternalId || "—"}</td>
                      <td>
                        {v.data.lastName}, {v.data.firstName}
                      </td>
                      <td>{v.data.dob}</td>
                      <td>{v.data.primaryPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}

          {preview.invalid.length ? (
            <>
              <h2 className="pf-h2">Skipped — fix and re-upload ({preview.invalid.length})</h2>
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.invalid.map((iv) => (
                    <tr key={iv.rowNumber}>
                      <td>{iv.rowNumber}</td>
                      <td className="pf-error" style={{ margin: 0 }}>
                        {iv.errors.join("; ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}

          {preview.valid.length ? (
            <button
              className="pf-btn"
              onClick={handleCommit}
              disabled={busy}
              style={{ marginTop: 14 }}
            >
              {busy ? "Importing…" : `Import ${preview.valid.length} valid row${preview.valid.length === 1 ? "" : "s"}`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
