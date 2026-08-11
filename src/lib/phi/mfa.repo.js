/* ============================================================
   Pending-TOTP-secret storage for MFA enrollment.

   WHY THIS EXISTS: the enrollment page used to call a "start enrollment"
   server action while rendering, and that action generated + persisted a NEW
   secret every time. Next renders that page 2-3 times per login (once nested
   inside the login action's redirect, once for the browser navigation, once
   more after every failed submit), so the QR on screen and the secret in the
   database routinely disagreed and the first code entered was always rejected.

   Reading is now idempotent: the secret is created ONCE and reused on every
   subsequent render, so no amount of re-rendering can invalidate a QR the user
   already scanned. Rotation is an explicit user action (rotatePendingSecret).
   ============================================================ */
import { and, eq, isNull } from "drizzle-orm";
import { db } from "./db.js";
import { users } from "./schema.js";
import { encryptField, decryptField } from "./crypto.js";
import { generateTotpSecret } from "./totp.js";

function safeDecrypt(value) {
  if (!value) return null;
  try {
    return decryptField(value);
  } catch {
    // Unreadable ciphertext (key rotated, row tampered): treat as "no secret"
    // so the caller mints a fresh one rather than showing an unusable QR.
    return null;
  }
}

/**
 * The pending secret for a not-yet-enrolled user, creating it on first call.
 *
 * @returns {Promise<null | {enrolled: boolean, secret: string|null}>}
 *   null            — no such user
 *   {enrolled:true} — already enrolled; caller must NOT show a QR (a stolen
 *                     password must not be enough to enroll a new device)
 */
export async function getOrCreatePendingSecret(userId) {
  if (!userId) return null;

  const [row] = await db
    .select({ mfaSecret: users.mfaSecret, mfaEnrolledAt: users.mfaEnrolledAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return null;
  if (row.mfaEnrolledAt) return { enrolled: true, secret: null };

  const existing = safeDecrypt(row.mfaSecret);
  if (existing) return { enrolled: false, secret: existing };

  // Claim the empty slot atomically. Two concurrent renders both reaching this
  // point must not end up with different secrets, so the write is conditional
  // on the column still being NULL and the loser re-reads the winner's value.
  const secret = generateTotpSecret();
  const claimed = await db
    .update(users)
    .set({ mfaSecret: encryptField(secret) })
    .where(
      and(
        eq(users.id, userId),
        isNull(users.mfaSecret),
        isNull(users.mfaEnrolledAt)
      )
    )
    .returning({ id: users.id });
  if (claimed.length) return { enrolled: false, secret };

  const [after] = await db
    .select({ mfaSecret: users.mfaSecret, mfaEnrolledAt: users.mfaEnrolledAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (after?.mfaEnrolledAt) return { enrolled: true, secret: null };
  return { enrolled: false, secret: safeDecrypt(after?.mfaSecret) };
}

/**
 * Discard the pending secret and mint a new one — the deliberate "my QR is
 * stale, give me another" path. Refuses once enrolled, same rule as above.
 *
 * @returns {Promise<string|null>} the new secret, or null if not permitted
 */
export async function rotatePendingSecret(userId) {
  if (!userId) return null;
  const secret = generateTotpSecret();
  const rotated = await db
    .update(users)
    .set({ mfaSecret: encryptField(secret) })
    .where(and(eq(users.id, userId), isNull(users.mfaEnrolledAt)))
    .returning({ id: users.id });
  return rotated.length ? secret : null;
}
