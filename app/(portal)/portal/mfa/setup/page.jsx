import { startMfaEnrollment } from "../../_actions/auth.js";
import MfaSetupForm from "../../_components/MfaSetupForm.jsx";
import "../../portal.css";

export const runtime = "nodejs";

export default async function MfaSetupPage() {
  // Generate (or regenerate) the secret + QR for this user.
  const { qrDataUrl } = await startMfaEnrollment();
  return (
    <div className="pf-login-wrap">
      <h1 className="pf-h1" style={{ textAlign: "center" }}>Set up two-factor auth</h1>
      <div className="pf-card">
        <p className="pf-muted">
          Scan this QR code with an authenticator app (Google Authenticator,
          Authy, 1Password), then enter the 6-digit code to finish enrollment.
          MFA is required for all staff.
        </p>
        <div style={{ textAlign: "center", margin: "16px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="TOTP QR code" width={200} height={200} />
        </div>
        <MfaSetupForm />
      </div>
    </div>
  );
}
