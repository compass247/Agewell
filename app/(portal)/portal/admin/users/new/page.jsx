"use client";
import { useFormState } from "react-dom";
import { createUser } from "../../../_actions/users.js";
import SubmitButton from "../../../_components/SubmitButton.jsx";
import "../../../portal.css";

export default function NewUserPage() {
  const [state, formAction] = useFormState(createUser, {});
  return (
    <div style={{ maxWidth: 440 }}>
      <h1 className="pf-h1">New user</h1>
      <div className="pf-card">
        {state?.error ? <div className="pf-error">{state.error}</div> : null}
        <form action={formAction}>
          <div className="pf-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="off" />
          </div>
          <div className="pf-field">
            <label htmlFor="password">Temporary password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
            <span className="pf-muted">At least 10 characters. User sets up MFA on first login.</span>
          </div>
          <div className="pf-field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue="BD" required>
              <option value="ADMIN">Admin</option>
              <option value="BD">BD</option>
              <option value="CS">CS</option>
            </select>
          </div>
          <SubmitButton className="pf-btn" pendingLabel="Creating…">Create user</SubmitButton>
        </form>
      </div>
    </div>
  );
}
