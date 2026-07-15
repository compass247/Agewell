"use server";
/* ============================================================
   Auth server actions: login, MFA enroll, MFA verify, logout.
   Node runtime. All write audit rows.
   ============================================================ */
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
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
import { encryptField, decryptField } from "../../../../src/lib/phi/crypto.js";
import {
  generateTotpSecret,
  buildEnrollment,
  verifyTotp,
} from "../../../../src/lib/phi/totp.js";
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

/** Begin TOTP enrollment: generate + store an encrypted secret, return a QR. */
export async function startMfaEnrollment() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  // An already-enrolled user must NOT be able to regenerate the secret here:
  // a stolen password would otherwise let an attacker enroll their own
  // authenticator and bypass MFA. Legitimate re-enrollment (lost phone) goes
  // through an ADMIN resetMfa (users.js), which nulls the enrollment first.
  const [row] = await db
    .select({ mfaEnrolledAt: users.mfaEnrolledAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (row?.mfaEnrolledAt) {
    redirect(session.mfa === "ok" ? "/portal/patients" : "/portal/mfa/verify");
  }

  const secret = generateTotpSecret();
  await db
    .update(users)
    .set({ mfaSecret: encryptField(secret) })
    .where(eq(users.id, session.user.id));

  const { qrDataUrl, otpauth } = await buildEnrollment(secret, session.user.email);
  return { qrDataUrl, otpauth };
}

/** Confirm enrollment with a TOTP code → mark enrolled + flip session to ok. */
export async function confirmMfaEnrollment(_prev, formData) {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");
  const token = String(formData.get("token") || "");

  const totpKey = `totp:${session.user.id}`;
  if (await isLocked(db, [totpKey])) return { error: LOCKED_MESSAGE };

  const [row] = await db
    .select({ mfaSecret: users.mfaSecret })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const secret = row?.mfaSecret ? decryptField(row.mfaSecret) : null;
  if (!secret || !verifyTotp(token, secret)) {
    await recordFailure(db, totpKey, TOTP_POLICY);
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
  redirect("/portal/patients");
}

/** Verify a TOTP code at each login → flip session to ok. */
export async function verifyMfaAction(_prev, formData) {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");
  const token = String(formData.get("token") || "");

  const totpKey = `totp:${session.user.id}`;
  if (await isLocked(db, [totpKey])) return { error: LOCKED_MESSAGE };

  const [row] = await db
    .select({ mfaSecret: users.mfaSecret })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const secret = row?.mfaSecret ? decryptField(row.mfaSecret) : null;
  if (!secret || !verifyTotp(token, secret)) {
    await recordFailure(db, totpKey, TOTP_POLICY);
    return { error: "Invalid code." };
  }
  await clearFailures(db, [totpKey]);

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, session.user.id));

  await unstable_update({ mfa: "ok" });
  redirect("/portal/patients");
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
