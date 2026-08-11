import { redirect } from "next/navigation";
import { auth } from "../../../../../auth.js";
import { getOrCreatePendingSecret } from "../../../../../src/lib/phi/mfa.repo.js";
import { buildEnrollment } from "../../../../../src/lib/phi/totp.js";
import { homePathFor } from "../../../../../src/lib/phi/rbac.js";
import MfaSetupForm from "../../_components/MfaSetupForm.jsx";
import "../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MfaSetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  // Idempotent: the secret is created once and reused on every later render,
  // so re-rendering this page can never invalidate a QR already scanned. It
  // used to mint a new secret per render — see mfa.repo.js for the full story.
  const pending = await getOrCreatePendingSecret(session.user.id);
  if (!pending) redirect("/portal/login");
  if (pending.enrolled) {
    redirect(
      session.mfa === "ok" ? homePathFor(session.user.role) : "/portal/mfa/verify"
    );
  }

  const { qrDataUrl } = await buildEnrollment(pending.secret, session.user.email);
  // Last 6 characters of the secret. Authenticator apps show every entry under
  // the same "Compass AgeWell Portal (email)" label, so this is how a user (or
  // support) tells a fresh entry apart from a stale duplicate.
  const fingerprint = pending.secret.slice(-6);

  return (
    <div className="pf-login-wrap">
      <h1 className="pf-h1" style={{ textAlign: "center" }}>Set up two-factor auth</h1>
      <div className="pf-card">
        <p className="pf-muted">
          Scan this QR code with an authenticator app (Google Authenticator,
          Authy, 1Password), then enter the 6-digit code to finish enrollment.
          MFA is required for all staff.
        </p>
        <p className="pf-muted">
          <strong>Delete any older “Compass AgeWell Portal” entry first.</strong>{" "}
          Duplicates look identical in the app, and reading a code from the wrong
          one is rejected.
        </p>
        <div style={{ textAlign: "center", margin: "16px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="TOTP QR code" width={200} height={200} />
          <div className="pf-muted">Entry ID: {fingerprint}</div>
        </div>
        <MfaSetupForm />
      </div>
    </div>
  );
}
