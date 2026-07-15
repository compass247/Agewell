/* Login/TOTP throttle: pure state machine (injected clock) + IP extraction. */
import { describe, it, expect } from "vitest";
import {
  nextThrottleState,
  requestIp,
  LOGIN_EMAIL_POLICY,
  LOGIN_IP_POLICY,
  TOTP_POLICY,
} from "../src/lib/phi/throttle.js";

const T0 = new Date("2026-07-15T10:00:00Z");
const at = (mins) => new Date(T0.getTime() + mins * 60_000);

describe("nextThrottleState", () => {
  it("starts a fresh window on the first failure", () => {
    const s = nextThrottleState(undefined, LOGIN_EMAIL_POLICY, T0);
    expect(s.failCount).toBe(1);
    expect(s.firstFailAt).toEqual(T0);
    expect(s.lockedUntil).toBeNull();
  });

  it("increments inside the window and locks at max", () => {
    let s = nextThrottleState(undefined, LOGIN_EMAIL_POLICY, T0);
    for (let i = 1; i < LOGIN_EMAIL_POLICY.max - 1; i++) {
      s = nextThrottleState(s, LOGIN_EMAIL_POLICY, at(i));
      expect(s.lockedUntil).toBeNull();
    }
    // 5th failure inside 15 min → locked for 15 min.
    s = nextThrottleState(s, LOGIN_EMAIL_POLICY, at(5));
    expect(s.failCount).toBe(LOGIN_EMAIL_POLICY.max);
    expect(s.lockedUntil).toEqual(
      new Date(at(5).getTime() + LOGIN_EMAIL_POLICY.lockMs)
    );
  });

  it("resets the counter when the previous failure is outside the window", () => {
    const stale = { failCount: 4, firstFailAt: T0, lockedUntil: null };
    const s = nextThrottleState(stale, LOGIN_EMAIL_POLICY, at(16)); // window is 15 min
    expect(s.failCount).toBe(1);
    expect(s.firstFailAt).toEqual(at(16));
    expect(s.lockedUntil).toBeNull();
  });

  it("extends the lock when failures continue during it", () => {
    const locked = {
      failCount: 5,
      firstFailAt: T0,
      lockedUntil: at(15),
    };
    // Another failure at +1 min (count 6 ≥ max) → re-locked from now.
    const s = nextThrottleState(locked, LOGIN_EMAIL_POLICY, at(1));
    expect(s.failCount).toBe(6);
    expect(s.lockedUntil).toEqual(new Date(at(1).getTime() + LOGIN_EMAIL_POLICY.lockMs));
  });

  it("policies are what the security review promised", () => {
    expect(LOGIN_EMAIL_POLICY).toEqual({ max: 5, windowMs: 900000, lockMs: 900000 });
    expect(LOGIN_IP_POLICY).toEqual({ max: 20, windowMs: 3600000, lockMs: 3600000 });
    expect(TOTP_POLICY).toEqual({ max: 5, windowMs: 900000, lockMs: 900000 });
  });
});

describe("requestIp", () => {
  const headers = (map) => ({ get: (k) => map[k.toLowerCase()] ?? null });

  it("prefers cf-connecting-ip (tunnel path)", () => {
    expect(
      requestIp(headers({ "cf-connecting-ip": "1.2.3.4", "x-forwarded-for": "5.6.7.8" }))
    ).toBe("1.2.3.4");
  });

  it("falls back to the first x-forwarded-for hop (ALB path)", () => {
    expect(requestIp(headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" }))).toBe("5.6.7.8");
  });

  it("returns null when unknown", () => {
    expect(requestIp(headers({}))).toBeNull();
    expect(requestIp(null)).toBeNull();
  });
});
