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

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const { password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // Uniform failure path (no user / bad password / inactive) — don't leak
        // which one. Audit the attempt.
        const fail = async (reason) => {
          await writeAudit(db, {
            actorId: user?.id ?? null,
            actorEmail: email,
            action: "LOGIN_FAILED",
            entity: "session",
            meta: { reason },
          });
          return null;
        };

        if (!user) return fail("unknown_email");
        if (!user.isActive) return fail("inactive");

        let ok = false;
        try {
          ok = await argonVerify(user.passwordHash, password);
        } catch {
          ok = false;
        }
        if (!ok) return fail("bad_password");

        await writeAudit(db, {
          actorId: user.id,
          actorEmail: user.email,
          action: "LOGIN",
          entity: "session",
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
