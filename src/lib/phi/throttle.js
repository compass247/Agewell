/* ============================================================
   Login/TOTP brute-force throttle (defense for C2 — no WAF in front of the
   credentials endpoint, so the app enforces its own lockouts).

   Counters live in the auth_throttle table, one row per key:
     "email:<addr>"  — failed password attempts for an account
     "ip:<ip>"       — failed password attempts from a client IP
     "totp:<userId>" — failed 6-digit TOTP attempts (brute-forceable in ~10^6
                       tries without this)

   A failure inside the policy window increments the counter; hitting the max
   sets lockedUntil. Failures older than the window reset the counter. Success
   deletes the keys. State transitions are a pure function
   (nextThrottleState) so the policy is unit-testable with an injected clock.
   ============================================================ */
import { eq, gt, inArray, sql } from "drizzle-orm";
import { authThrottle } from "./schema.js";

const MIN = 60_000;

// 5 wrong passwords per account in 15 min → 15 min lock.
export const LOGIN_EMAIL_POLICY = { max: 5, windowMs: 15 * MIN, lockMs: 15 * MIN };
// 20 wrong passwords from one IP in 1 h → 1 h lock (credential stuffing).
export const LOGIN_IP_POLICY = { max: 20, windowMs: 60 * MIN, lockMs: 60 * MIN };
// 5 wrong TOTP codes in 15 min → 15 min lock.
export const TOTP_POLICY = { max: 5, windowMs: 15 * MIN, lockMs: 15 * MIN };

/** Uniform user-facing lockout message (also used by the login action). */
export const LOCKED_MESSAGE = "Too many failed attempts. Try again later.";

/**
 * Pure state transition for one recorded failure. Exported for tests.
 * @param {{failCount:number, firstFailAt:Date|null, lockedUntil:Date|null}|undefined} prev
 * @returns {{failCount:number, firstFailAt:Date, lockedUntil:Date|null}}
 */
export function nextThrottleState(prev, policy, now = new Date()) {
  const windowStart = new Date(now.getTime() - policy.windowMs);
  const inWindow = prev?.firstFailAt && prev.firstFailAt > windowStart;
  const failCount = inWindow ? prev.failCount + 1 : 1;
  return {
    failCount,
    firstFailAt: inWindow ? prev.firstFailAt : now,
    lockedUntil:
      failCount >= policy.max
        ? new Date(now.getTime() + policy.lockMs)
        : (prev?.lockedUntil ?? null),
  };
}

/** True if any of the keys is currently locked. */
export async function isLocked(dbc, keys, now = new Date()) {
  const list = keys.filter(Boolean);
  if (!list.length) return false;
  const rows = await dbc
    .select({ key: authThrottle.key })
    .from(authThrottle)
    .where(sql`${inArray(authThrottle.key, list)} AND ${gt(authThrottle.lockedUntil, now)}`)
    .limit(1);
  return rows.length > 0;
}

/**
 * Record one failure for a key. Returns { locked, justLocked } so callers can
 * audit the lock transition without double-counting.
 */
export async function recordFailure(dbc, key, policy, now = new Date()) {
  if (!key) return { locked: false, justLocked: false };
  let locked = false;
  let justLocked = false;
  await dbc.transaction(async (tx) => {
    // Ensure the row exists, then lock it so concurrent failures serialize.
    await tx.insert(authThrottle).values({ key }).onConflictDoNothing();
    const [prev] = await tx
      .select()
      .from(authThrottle)
      .where(eq(authThrottle.key, key))
      .for("update");
    const next = nextThrottleState(prev, policy, now);
    await tx.update(authThrottle).set(next).where(eq(authThrottle.key, key));
    locked = Boolean(next.lockedUntil && next.lockedUntil > now);
    justLocked = locked && !(prev?.lockedUntil && prev.lockedUntil > now);
  });
  return { locked, justLocked };
}

/** Clear counters after a success. */
export async function clearFailures(dbc, keys) {
  const list = keys.filter(Boolean);
  if (!list.length) return;
  await dbc.delete(authThrottle).where(inArray(authThrottle.key, list));
}

/**
 * Client IP from a Headers-like object. Behind the Cloudflare Tunnel
 * cf-connecting-ip is authoritative; behind the ALB use the first
 * x-forwarded-for hop. Returns null when unknown (key is skipped).
 */
export function requestIp(headers) {
  if (!headers?.get) return null;
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || null;
  return null;
}
