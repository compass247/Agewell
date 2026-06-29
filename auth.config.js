/* ============================================================
   Auth.js v5 — edge-safe config.

   This file is imported by middleware (edge runtime), so it must NOT import the
   DB, crypto, or argon2. It only declares callbacks and the coarse `authorized`
   gate. The Credentials provider with the real authorize() lives in auth.js
   (Node), which spreads this config in.
   ============================================================ */

const IDLE_MINUTES = Number(process.env.PHI_SESSION_IDLE_MINUTES || 15);
const IDLE_MS = IDLE_MINUTES * 60 * 1000;

export const authConfig = {
  trustHost: true,
  // The Auth.js route handler lives at /api/portal/auth/[...nextauth], not the
  // default /api/auth — tell Auth.js so its internal URLs/CSRF match.
  basePath: "/api/portal/auth",
  pages: {
    signIn: "/portal/login",
  },
  session: {
    strategy: "jwt",
    // Hard cap; the jwt callback also enforces a sliding idle window.
    maxAge: IDLE_MINUTES * 60,
  },
  callbacks: {
    // Persist identity + MFA state + sliding activity into the JWT.
    async jwt({ token, user, trigger, session }) {
      const now = Date.now();

      if (user) {
        // Fresh sign-in: seed claims from authorize()'s return.
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.mfaEnrolled = Boolean(user.mfaEnrolled);
        token.mfa = "pending"; // becomes "ok" only after TOTP verify
        token.lastActivity = now;
      }

      // MFA verify flips the gate via unstable_update({ mfa: "ok" }).
      if (trigger === "update" && session?.mfa === "ok") {
        token.mfa = "ok";
        token.mfaEnrolled = true;
      }
      if (trigger === "update" && session?.mfaEnrolled) {
        token.mfaEnrolled = true;
      }

      // Sliding idle timeout: expire the token server-side after inactivity.
      if (token.lastActivity && now - token.lastActivity > IDLE_MS) {
        return null; // invalidates the session → forces re-login
      }
      token.lastActivity = now;
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.mfaEnrolled = Boolean(token.mfaEnrolled);
        session.mfa = token.mfa || "pending";
      }
      return session;
    },

    // Coarse middleware gate. Fine-grained, record-level checks are repeated in
    // every server action (never trust middleware alone).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const mfaOk = auth?.mfa === "ok";

      // Public auth screens.
      const isAuthScreen =
        pathname.startsWith("/portal/login") ||
        pathname.startsWith("/portal/mfa");

      if (!isLoggedIn) return isAuthScreen;

      // Logged in but MFA not completed → only MFA screens allowed.
      if (!mfaOk) return isAuthScreen;

      // Logged in + MFA ok: keep them out of auth screens.
      if (isAuthScreen) {
        return Response.redirect(new URL("/portal/patients", request.nextUrl));
      }

      // Admin area requires ADMIN (coarse; actions re-check).
      if (pathname.startsWith("/portal/admin") && auth.user.role !== "ADMIN") {
        return Response.redirect(new URL("/portal/patients", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // real provider added in auth.js (Node)
};
