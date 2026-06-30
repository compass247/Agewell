"use client";
import { useFormState } from "react-dom";
import { confirmMfaEnrollment } from "../_actions/auth.js";
import SubmitButton from "./SubmitButton.jsx";

export default function MfaSetupForm() {
  const [state, formAction] = useFormState(confirmMfaEnrollment, {});
  return (
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
  );
}
