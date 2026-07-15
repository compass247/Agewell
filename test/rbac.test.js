/* RBAC matrix + record-level edit rule. */
import { describe, it, expect } from "vitest";
import {
  can,
  requireCan,
  requireRole,
  canEditPatient,
  assertCanEditPatient,
} from "../src/lib/phi/rbac.js";

const ADMIN = { id: "a", role: "ADMIN" };
const BD = { id: "b", role: "BD" };
const CS = { id: "c", role: "CS" };

describe("can() matrix", () => {
  const cases = [
    // action        ADMIN  BD     CS
    ["read", true, true, true],
    ["create", true, true, true],
    ["update", true, true, true],
    ["status", true, true, true],
    ["export", true, false, true],
    ["delete", true, false, false],
    ["manageUsers", true, false, false],
    ["unknown", false, false, false],
  ];
  it.each(cases)("%s → ADMIN=%s BD=%s CS=%s", (action, admin, bd, cs) => {
    expect(can(ADMIN, action)).toBe(admin);
    expect(can(BD, action)).toBe(bd);
    expect(can(CS, action)).toBe(cs);
  });

  it("denies a missing actor", () => {
    expect(can(null, "read")).toBe(false);
    expect(() => requireCan(null, "read")).toThrow();
  });

  it("requireCan throws a FORBIDDEN error", () => {
    try {
      requireCan(BD, "delete");
      expect.unreachable();
    } catch (err) {
      expect(err.code).toBe("FORBIDDEN");
      expect(err.status).toBe(403);
    }
  });
});

describe("requireRole", () => {
  it("passes an allowed role and throws otherwise", () => {
    expect(() => requireRole(ADMIN, "ADMIN")).not.toThrow();
    expect(() => requireRole(BD, "ADMIN", "CS")).toThrow();
  });
});

describe("record-level edit rule", () => {
  const ownPatient = { id: "p1", createdBy: "b" };
  const otherPatient = { id: "p2", createdBy: "someone-else" };

  it("ADMIN and CS edit any record", () => {
    expect(canEditPatient(ADMIN, otherPatient)).toBe(true);
    expect(canEditPatient(CS, otherPatient)).toBe(true);
  });

  it("BD edits only records they created", () => {
    expect(canEditPatient(BD, ownPatient)).toBe(true);
    expect(canEditPatient(BD, otherPatient)).toBe(false);
    expect(() => assertCanEditPatient(BD, ownPatient)).not.toThrow();
    expect(() => assertCanEditPatient(BD, otherPatient)).toThrow(/BD may only edit/);
  });

  it("denies missing actor/patient", () => {
    expect(canEditPatient(null, ownPatient)).toBe(false);
    expect(canEditPatient(BD, null)).toBe(false);
    expect(() => assertCanEditPatient(null, null)).toThrow();
  });
});
