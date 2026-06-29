"use client";
import { useFormState } from "react-dom";
import { loginAction } from "../_actions/auth.js";
import SubmitButton from "../_components/SubmitButton.jsx";
import "../portal.css";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, {});
  return (
    <div className="pf-login-wrap">
      <h1 className="pf-h1" style={{ textAlign: "center" }}>
        AgeWell Patient Intake
      </h1>
      <p className="pf-muted" style={{ textAlign: "center" }}>
        Staff sign-in. Authorized users only.
      </p>
      <div className="pf-card">
        {state?.error ? <div className="pf-error">{state.error}</div> : null}
        <form action={formAction}>
          <div className="pf-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div className="pf-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <SubmitButton className="pf-btn" pendingLabel="Signing in…" style={{ width: "100%" }}>
            Sign in
          </SubmitButton>
        </form>
      </div>
      <p className="pf-muted" style={{ textAlign: "center" }}>
        Protected health information — every action is logged.
      </p>
    </div>
  );
}
