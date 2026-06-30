/* Authed portal chrome (nav, user menu, idle timeout). Server component:
   requireSession() gates EVERY nested route server-side (defense in depth on
   top of middleware). Auth screens live OUTSIDE this layout's protection by
   being in the same segment but rendered before redirect — see note below. */
import { auth } from "../../../auth.js";
import { logoutAction } from "./_actions/auth.js";
import IdleTimeout from "./_components/IdleTimeout.jsx";
import "./portal.css";

export const runtime = "nodejs";

export default async function PortalLayout({ children }) {
  const session = await auth();
  const user = session?.user;
  const mfaOk = session?.mfa === "ok";

  // Login + MFA pages render their own minimal UI (no nav). When unauthenticated
  // or mid-MFA, show children bare so those screens work; middleware already
  // restricts which routes are reachable in each state.
  if (!user || !mfaOk) {
    return <main className="pf-shell">{children}</main>;
  }

  const idleMinutes = Number(process.env.PHI_SESSION_IDLE_MINUTES || 15);

  return (
    <>
      <nav className="pf-nav">
        <a href="/portal/patients">Patients</a>
        {user.role === "ADMIN" ? <a href="/portal/admin/users">Users</a> : null}
        <span className="pf-spacer" />
        <span className="pf-user">
          {user.email} · {user.role}
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="pf-btn pf-btn--ghost"
            style={{ padding: "6px 12px" }}
          >
            Sign out
          </button>
        </form>
      </nav>
      <main className="pf-shell">{children}</main>
      <IdleTimeout minutes={idleMinutes} />
    </>
  );
}
