"use server";
/* ============================================================
   Auth server actions: login, MFA enroll, MFA verify, logout.
   Node runtime. All write audit rows.
   ============================================================ */
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import {
  signIn,
  signOut,
  auth,
  unstable_update,
} from "../../../../auth.js";
import { db } from "../../../../src/lib/phi/db.js";
import { users } from "../../../../src/lib/phi/schema.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { decryptField } from "../../../../src/lib/phi/crypto.js";
import { verifyTotp, measureDrift } from "../../../../src/lib/phi/totp.js";
import { rotatePendingSecret } from "../../../../src/lib/phi/mfa.repo.js";
import { homePathFor } from "../../../../src/lib/phi/rbac.js";
import {
  isLocked,
  recordFailure,
  clearFailures,
  requestIp,
  TOTP_POLICY,
  LOCKED_MESSAGE,
} from "../../../../src/lib/phi/throttle.js";

/** Login form action. On success Auth.js sets the cookie; we route to MFA. */
export async function loginAction(_prev, formData) {
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");

  // Friendly pre-check so a locked account/IP gets a clear message; the
  // authoritative (bypass-proof) enforcement lives in authorize() itself.
  const ip = requestIp(headers());
  const lockKeys = [`email:${email}`, ip ? `ip:${ip}` : null];
  if (email && (await isLocked(db, lockKeys))) {
    return { error: LOCKED_MESSAGE };
  }

  try {
    // Let Auth.js set the session cookie AND redirect in one response. Calling
    // auth() in the same action (with redirect:false) would read the OLD request
    // cookies and see no session yet ("Login failed"). Redirect to /portal; the
    // middleware routes a fresh mfa:pending session to /portal/mfa/setup|verify.
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/portal",
    });
  } catch (err) {
    // signIn with redirectTo throws a NEXT_REDIRECT control-flow error on
    // success — it must propagate, not be treated as a login failure.
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err;
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}

/**
 * Discard the pending QR and issue a new one. Deliberate user action only —
 * enrollment itself is idempotent now (see mfa.repo.js), so this is the ONLY
 * way the secret changes before enrollment completes.
 */
export async function regenerateMfaSecret() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  const secret = await rotatePendingSecret(session.user.id);
  // null means the account is already enrolled: a stolen password must not be
  // enough to enroll a new device. Legitimate re-enrollment goes through an
  // ADMIN resetMfa (users.js), which clears the enrollment first.
  if (!secret) return { error: "Already enrolled — ask an admin to reset MFA." };

  await writeAudit(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "MFA_ENROLL",
    entity: "session",
    meta: { regenerated: true },
  });

  revalidatePath("/portal/mfa/setup");
  return { ok: true };
}

/** Stored secret for a user, or null if absent/unreadable. */
async function readSecret(userId) {
  const [row] = await db
    .select({ mfaSecret: users.mfaSecret })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.mfaSecret) return null;
  try {
    return decryptField(row.mfaSecret);
  } catch {
    return null;
  }
}

/**
 * Audit a rejected TOTP code. `drift` is what makes a report actionable: a
 * number means the code was right but the clocks disagree; null means the code
 * belongs to a DIFFERENT secret (typically a stale duplicate entry left in the
 * authenticator app). Before this, a wrong code left no trace at all — the
 * throttle counter is deleted by clearFailures on the next success.
 */
async function auditBadTotp(session, { token, secret, stage }) {
  await writeAudit(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "LOGIN_FAILED",
    entity: "session",
    meta: {
      mfa: true,
      stage,
      reason: secret ? "bad_totp" : "no_secret",
      drift: secret ? measureDrift(token, secret) : null,
    },
  });
}

/** Confirm enrollment with a TOTP code → mark enrolled + flip session to ok. */
export async function confirmMfaEnrollment(_prev, formData) {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");
  const token = String(formData.get("token") || "");

  const totpKey = `totp:${session.user.id}`;
  if (await isLocked(db, [totpKey])) return { error: LOCKED_MESSAGE };

  const secret = await readSecret(session.user.id);
  if (!secret || !verifyTotp(token, secret)) {
    await recordFailure(db, totpKey, TOTP_POLICY);
    await auditBadTotp(session, { token, secret, stage: "enroll" });
    return { error: "Invalid code. Scan the QR and try again." };
  }
  await clearFailures(db, [totpKey]);

  await db
    .update(users)
    .set({ mfaEnrolledAt: new Date() })
    .where(eq(users.id, session.user.id));
  await writeAudit(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "MFA_ENROLL",
    entity: "session",
  });

  await unstable_update({ mfa: "ok", mfaEnrolled: true });
  // Land on the module this role owns — a BOD has no access to /portal/patients
  // and would only be bounced again by the middleware.
  redirect(homePathFor(session.user.role));
}

/** Verify a TOTP code at each login → flip session to ok. */
export async function verifyMfaAction(_prev, formData) {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");
  const token = String(formData.get("token") || "");

  const totpKey = `totp:${session.user.id}`;
  if (await isLocked(db, [totpKey])) return { error: LOCKED_MESSAGE };

  const secret = await readSecret(session.user.id);
  if (!secret || !verifyTotp(token, secret)) {
    await recordFailure(db, totpKey, TOTP_POLICY);
    await auditBadTotp(session, { token, secret, stage: "verify" });
    return { error: "Invalid code." };
  }
  await clearFailures(db, [totpKey]);

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, session.user.id));
  // Completing MFA is the moment the session actually becomes usable; without
  // this row the whole verify step is invisible in audit_log.
  await writeAudit(db, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "LOGIN",
    entity: "session",
    meta: { mfa: true },
  });

  await unstable_update({ mfa: "ok" });
  redirect(homePathFor(session.user.role));
}

/** Logout: audit + clear session. */
export async function logoutAction() {
  const session = await auth();
  if (session?.user) {
    await writeAudit(db, {
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "LOGOUT",
      entity: "session",
    });
  }
  await signOut({ redirectTo: "/portal/login" });
}
