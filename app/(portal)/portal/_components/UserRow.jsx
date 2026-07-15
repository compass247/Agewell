"use client";
import { useState } from "react";
import { setRole, setActive, resetMfa } from "../_actions/users.js";

const ROLES = ["ADMIN", "BD", "CS"];

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US");
}

export default function UserRow({ user, selfId }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isSelf = user.id === selfId;

  async function onRole(e) {
    const role = e.target.value;
    if (role === user.role) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("role", role);
    const res = await setRole(user.id, fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      e.target.value = user.role;
    }
  }

  async function onToggleActive() {
    setBusy(true);
    setError("");
    const res = await setActive(user.id, !user.isActive);
    setBusy(false);
    if (res?.error) setError(res.error);
  }

  async function onResetMfa() {
    if (!window.confirm(`Reset MFA for ${user.email}? They will re-enroll at next login.`)) return;
    setBusy(true);
    setError("");
    const res = await resetMfa(user.id);
    setBusy(false);
    if (res?.error) setError(res.error);
  }

  return (
    <tr>
      <td>{user.email}{isSelf ? <span className="pf-muted"> (you)</span> : null}</td>
      <td>
        <select defaultValue={user.role} onChange={onRole} disabled={busy || isSelf}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {error ? <div className="pf-error">{error}</div> : null}
      </td>
      <td>
        {user.mfaEnrolledAt ? "Enrolled" : <span className="pf-muted">Not yet</span>}
        {user.mfaEnrolledAt && !isSelf ? (
          <button
            className="pf-btn pf-btn--ghost"
            style={{ padding: "2px 8px", marginLeft: 8 }}
            onClick={onResetMfa}
            disabled={busy}
            title="Clear enrollment so the user re-enrolls at next login"
          >
            Reset
          </button>
        ) : null}
      </td>
      <td>{user.isActive ? "Yes" : "No"}</td>
      <td>{fmt(user.lastLoginAt)}</td>
      <td>
        {!isSelf ? (
          <button
            className={`pf-btn ${user.isActive ? "pf-btn--danger" : "pf-btn--ghost"}`}
            style={{ padding: "5px 12px" }}
            onClick={onToggleActive}
            disabled={busy}
          >
            {user.isActive ? "Deactivate" : "Reactivate"}
          </button>
        ) : null}
      </td>
    </tr>
  );
}
