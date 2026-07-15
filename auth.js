/* ============================================================
   Auth.js v5 — Node root config.

   Credentials provider (email + password, argon2id). We own the users table so
   there is no DB adapter; the JWT carries identity + MFA state. authorize()
   writes LOGIN / LOGIN_FAILED audit rows. MFA is enforced downstream by the
   `mfa` claim (see auth.config.js + session.js).
   ============================================================ */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify as argonVerify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config.js";
import { db } from "./src/lib/phi/db.js";
import { users } from "./src/lib/phi/schema.js";
import { writeAudit } from "./src/lib/phi/audit.js";
import {
  isLocked,
  recordFailure,
  clearFailures,
  requestIp,
  LOGIN_EMAIL_POLICY,
  LOGIN_IP_POLICY,
} from "./src/lib/phi/throttle.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const { password } = parsed.data;

        // Brute-force throttle — enforced HERE (not only in the login action)
        // so hitting the Auth.js credentials endpoint directly is also gated.
        const ip = requestIp(request?.headers);
        const emailKey = `email:${email}`;
        const ipKey = ip ? `ip:${ip}` : null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // Uniform failure path (no user / bad password / inactive / locked) —
        // don't leak which one. Audit the attempt; count it toward the lockout
        // unless the account/IP is already locked.
        const fail = async (reason, { count = true } = {}) => {
          let justLocked = false;
          if (count) {
            const r1 = await recordFailure(db, emailKey, LOGIN_EMAIL_POLICY);
            const r2 = await recordFailure(db, ipKey, LOGIN_IP_POLICY);
            justLocked = r1.justLocked || r2.justLocked;
          }
          await writeAudit(db, {
            actorId: user?.id ?? null,
            actorEmail: email,
            action: "LOGIN_FAILED",
            entity: "session",
            meta: { reason, ip, ...(justLocked ? { locked: true } : {}) },
          });
          return null;
        };

        if (await isLocked(db, [emailKey, ipKey])) {
          return fail("locked", { count: false });
        }

        if (!user) return fail("unknown_email");
        if (!user.isActive) return fail("inactive");

        let ok = false;
        try {
          ok = await argonVerify(user.passwordHash, password);
        } catch {
          ok = false;
        }
        if (!ok) return fail("bad_password");

        await clearFailures(db, [emailKey]);
        await writeAudit(db, {
          actorId: user.id,
          actorEmail: user.email,
          action: "LOGIN",
          entity: "session",
          meta: ip ? { ip } : undefined,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          mfaEnrolled: Boolean(user.mfaEnrolledAt),
        };
      },
    }),
  ],
});
