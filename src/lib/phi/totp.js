/* ============================================================
   TOTP (time-based one-time password) helpers for staff MFA.
   Node runtime only (uses otplib + qrcode + the crypto key for storage).
   ============================================================ */
import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Compass AgeWell Portal";

// Allow ±1 step (30s) of clock drift.
const STEP_MS = 30_000;
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

/**
 * How many 30s steps a rejected token is away from server time — DIAGNOSTIC
 * ONLY, never used to accept a code (the accept window stays ±1 above).
 *
 * Returns the step offset if the token matches this secret within ±maxSteps,
 * or null if it matches no step at all. That distinction is the whole point:
 * a number means clock drift, null means the token came from a DIFFERENT
 * secret (e.g. a stale duplicate entry in the authenticator app). Without it,
 * "Invalid code" reports are unfalsifiable.
 */
export function measureDrift(token, secret, maxSteps = 2) {
  if (!token || !secret) return null;
  const t = String(token).trim();
  try {
    // Generate the expected token at each shifted epoch and compare, rather
    // than widening `window` on a clone: clone() does not carry the instance
    // options set above, so a widened window would silently not apply.
    for (let step = -maxSteps; step <= maxSteps; step += 1) {
      const at = authenticator.clone({ epoch: Date.now() + step * STEP_MS });
      if (at.generate(secret) === t) return step;
    }
  } catch {
    return null;
  }
  return null;
}
