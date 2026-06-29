/* ============================================================
   requireSession() — server-side session gate (defense in depth).

   Never trust middleware alone. Every server action and protected RSC fetch
   calls requireSession() to independently re-read the Auth.js session on the
   server and produce a typed actor { id, role, email }. Redirects to login if
   unauthenticated, or to MFA if the session hasn't completed TOTP.
   ============================================================ */
import { redirect } from "next/navigation";
import { auth } from "../../../auth.js";

/**
 * Returns { id, role, email } for the current authenticated + MFA-verified
 * staff user, or redirects. Pass { throwOnFail: true } in non-page contexts
 * (e.g. API routes) to get a thrown error instead of a redirect.
 */
export async function requireSession({ throwOnFail = false } = {}) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    if (throwOnFail) throw unauthorized();
    redirect("/portal/login");
  }
  if (session.mfa !== "ok") {
    if (throwOnFail) throw unauthorized("MFA required");
    redirect(user.mfaEnrolled ? "/portal/mfa/verify" : "/portal/mfa/setup");
  }

  return { id: user.id, role: user.role, email: user.email };
}

function unauthorized(message = "Unauthorized") {
  const err = new Error(message);
  err.code = "UNAUTHORIZED";
  err.status = 401;
  return err;
}
