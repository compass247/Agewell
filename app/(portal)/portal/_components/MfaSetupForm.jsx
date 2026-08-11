"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { confirmMfaEnrollment, regenerateMfaSecret } from "../_actions/auth.js";
import SubmitButton from "./SubmitButton.jsx";

export default function MfaSetupForm() {
  const [state, formAction] = useFormState(confirmMfaEnrollment, {});
  const [busy, setBusy] = useState(false);
  const [rotateError, setRotateError] = useState("");

  async function onRegenerate() {
    if (
      !window.confirm(
        "Issue a new QR code? The one on screen stops working — delete the old entry in your authenticator app and scan again."
      )
    ) {
      return;
    }
    setBusy(true);
    setRotateError("");
    const res = await regenerateMfaSecret();
    setBusy(false);
    if (res?.error) setRotateError(res.error);
  }

  return (
    <>
      <form action={formAction}>
        {state?.error ? <div className="pf-error">{state.error}</div> : null}
        <div className="pf-field">
          <label htmlFor="token">6-digit code</label>
          <input
            id="token"
            name="token"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </div>
        <SubmitButton className="pf-btn" pendingLabel="Verifying…" style={{ width: "100%" }}>
          Finish enrollment
        </SubmitButton>
      </form>

      {rotateError ? <div className="pf-error">{rotateError}</div> : null}
      {/* The QR is stable across reloads now, so a user who scanned a stale one
          needs an explicit way out. */}
      <button
        type="button"
        className="pf-btn pf-btn--ghost"
        style={{ width: "100%", marginTop: 10 }}
        onClick={onRegenerate}
        disabled={busy}
      >
        {busy ? "Generating…" : "Generate a new QR code"}
      </button>
    </>
  );
}
