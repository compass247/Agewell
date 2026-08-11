/* TOTP helpers + the idempotent enrollment secret.

   The getOrCreatePendingSecret tests are the regression guard for the
   long-standing "first MFA code is always rejected" bug: the setup page is
   rendered several times per login, and the old code minted a new secret on
   every one of those renders, so the QR on screen and the secret in the
   database drifted apart. */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { authenticator } from "otplib";

process.env.PHI_ENC_KEY ||= Buffer.alloc(32, 7).toString("base64");

// mfa.repo.js talks to Postgres at import time via the db proxy; swap it for an
// in-memory row so the enrollment logic is testable without a database.
const store = { mfaSecret: null, mfaEnrolledAt: null, missing: false };
let updateCalls = 0;

vi.mock("../src/lib/phi/db.js", () => {
  const select = () => ({
    from: () => ({
      where: () => ({
        limit: async () => (store.missing ? [] : [{ ...store }]),
      }),
    }),
  });
  const update = () => ({
    set: (values) => ({
      // The real query is conditional on mfa_secret IS NULL; mirror that so the
      // "lost the race" branch is exercised rather than silently skipped.
      where: (predicate) => ({
        returning: async () => {
          updateCalls += 1;
          const requiresEmpty = predicate !== "any";
          if (requiresEmpty && store.claimBlocked) return [];
          if (store.mfaEnrolledAt) return [];
          Object.assign(store, values);
          return [{ id: "u1" }];
        },
      }),
    }),
  });
  return { db: { select, update }, schema: {} };
});

const { getOrCreatePendingSecret, rotatePendingSecret } = await import(
  "../src/lib/phi/mfa.repo.js"
);
const { verifyTotp, measureDrift } = await import("../src/lib/phi/totp.js");

beforeEach(() => {
  store.mfaSecret = null;
  store.mfaEnrolledAt = null;
  store.missing = false;
  store.claimBlocked = false;
  updateCalls = 0;
});

describe("getOrCreatePendingSecret", () => {
  it("returns the SAME secret across repeated renders and writes once", async () => {
    const first = await getOrCreatePendingSecret("u1");
    const second = await getOrCreatePendingSecret("u1");
    const third = await getOrCreatePendingSecret("u1");

    expect(first.secret).toBeTruthy();
    expect(second.secret).toBe(first.secret);
    expect(third.secret).toBe(first.secret);
    expect(updateCalls).toBe(1);
  });

  it("refuses to issue a secret once enrolled", async () => {
    store.mfaEnrolledAt = new Date();
    const res = await getOrCreatePendingSecret("u1");
    expect(res).toEqual({ enrolled: true, secret: null });
    expect(updateCalls).toBe(0);
  });

  it("adopts the winner's secret when a concurrent render claims the slot", async () => {
    // Two renders both see an empty column; this one loses the conditional
    // UPDATE and must re-read rather than return a secret nobody stored.
    store.claimBlocked = true;
    const winner = await rotatePendingSecret("u1"); // seeds the row
    store.claimBlocked = true;
    const res = await getOrCreatePendingSecret("u1");
    expect(res.secret).toBe(winner);
  });

  it("returns null for an unknown user", async () => {
    store.missing = true;
    expect(await getOrCreatePendingSecret("nope")).toBeNull();
    expect(await getOrCreatePendingSecret("")).toBeNull();
  });
});

describe("rotatePendingSecret", () => {
  it("issues a different secret on demand", async () => {
    const a = (await getOrCreatePendingSecret("u1")).secret;
    const b = await rotatePendingSecret("u1");
    expect(b).not.toBe(a);
    expect((await getOrCreatePendingSecret("u1")).secret).toBe(b);
  });

  it("refuses once enrolled", async () => {
    store.mfaEnrolledAt = new Date();
    expect(await rotatePendingSecret("u1")).toBeNull();
  });
});

describe("verifyTotp", () => {
  const secret = authenticator.generateSecret();

  it("accepts the current code", () => {
    expect(verifyTotp(authenticator.generate(secret), secret)).toBe(true);
  });

  it("tolerates one step of clock drift either way", () => {
    for (const offset of [-30_000, 30_000]) {
      const shifted = authenticator.clone({ epoch: Date.now() + offset });
      expect(verifyTotp(shifted.generate(secret), secret)).toBe(true);
    }
  });

  it("rejects a code two steps out", () => {
    const shifted = authenticator.clone({ epoch: Date.now() + 90_000 });
    expect(verifyTotp(shifted.generate(secret), secret)).toBe(false);
  });

  it("rejects empty input instead of throwing", () => {
    expect(verifyTotp("", secret)).toBe(false);
    expect(verifyTotp("123456", null)).toBe(false);
  });
});

describe("measureDrift", () => {
  const secret = authenticator.generateSecret();

  it("reports the step offset for a clock-skewed code", () => {
    const shifted = authenticator.clone({ epoch: Date.now() + 60_000 });
    expect(measureDrift(shifted.generate(secret), secret)).toBe(2);
  });

  it("reports 0 for the current code", () => {
    expect(measureDrift(authenticator.generate(secret), secret)).toBe(0);
  });

  it("reports null for a code from a DIFFERENT secret", () => {
    // This is the distinction the audit log relies on: null means the phone is
    // reading a stale duplicate entry, not that the clocks disagree.
    const other = authenticator.generateSecret();
    expect(measureDrift(authenticator.generate(other), secret)).toBeNull();
  });
});
