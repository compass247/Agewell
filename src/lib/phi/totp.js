/* ============================================================
   TOTP (time-based one-time password) helpers for staff MFA.
   Node runtime only (uses otplib + qrcode + the crypto key for storage).
   ============================================================ */
import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Compass AgeWell Portal";

// Allow ±1 step (30s) of clock drift.
authenticator.options = { window: 1 };

/** Generate a new base32 TOTP secret (store ENCRYPTED via crypto.encryptField). */
export function generateTotpSecret() {
  return authenticator.generateSecret();
}

/** otpauth:// URI for authenticator apps, plus a PNG data-URL QR code. */
export async function buildEnrollment(secret, accountEmail) {
  const otpauth = authenticator.keyuri(accountEmail, ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);
  return { otpauth, qrDataUrl };
}

/** Verify a 6-digit token against the (decrypted) secret. */
export function verifyTotp(token, secret) {
  if (!token || !secret) return false;
  try {
    return authenticator.verify({ token: String(token).trim(), secret });
  } catch {
    return false;
  }
}
