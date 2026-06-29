"use client";
import { useFormState } from "react-dom";
import { verifyMfaAction } from "../../_actions/auth.js";
import SubmitButton from "../../_components/SubmitButton.jsx";
import "../../portal.css";

export default function MfaVerifyPage() {
  const [state, formAction] = useFormState(verifyMfaAction, {});
  return (
    <div className="pf-login-wrap">
      <h1 className="pf-h1" style={{ textAlign: "center" }}>Two-factor verification</h1>
      <div className="pf-card">
        <p className="pf-muted">
          Enter the current 6-digit code from your authenticator app.
        </p>
        {state?.error ? <div className="pf-error">{state.error}</div> : null}
        <form action={formAction}>
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
              autoFocus
            />
          </div>
          <SubmitButton className="pf-btn" pendingLabel="Verifying…" style={{ width: "100%" }}>
            Verify
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
