/* RBAC matrix + record-level edit rule. */
import { describe, it, expect } from "vitest";
import {
  can,
  requireCan,
  requireRole,
  canEditPatient,
  assertCanEditPatient,
  canBodLead,
  requireCanBodLead,
  canEditBodLead,
  assertCanEditBodLead,
  homePathFor,
} from "../src/lib/phi/rbac.js";

const ADMIN = { id: "a", role: "ADMIN" };
const BD = { id: "b", role: "BD" };
const CS = { id: "c", role: "CS" };
const BOD = { id: "d", role: "BOD" };

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

  // A board member must never reach PHI, whatever the action.
  it.each(cases.map(([action]) => [action]))("%s → BOD=false (patients are off-limits)", (action) => {
    expect(can(BOD, action)).toBe(false);
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

describe("canBodLead() matrix", () => {
  const cases = [
    // action     ADMIN  BD     BOD    CS
    ["read", true, true, true, false],
    ["create", true, true, true, false],
    ["update", true, true, true, false],
    ["status", true, true, false, false],
    ["export", true, true, false, false],
    ["delete", true, false, false, false],
    ["unknown", false, false, false, false],
  ];
  it.each(cases)("%s → ADMIN=%s BD=%s BOD=%s CS=%s", (action, admin, bd, bod, cs) => {
    expect(canBodLead(ADMIN, action)).toBe(admin);
    expect(canBodLead(BD, action)).toBe(bd);
    expect(canBodLead(BOD, action)).toBe(bod);
    expect(canBodLead(CS, action)).toBe(cs);
  });

  it("denies a missing actor and throws FORBIDDEN", () => {
    expect(canBodLead(null, "read")).toBe(false);
    expect(() => requireCanBodLead(CS, "read")).toThrow(/Not permitted/);
  });
});

describe("BOD-lead record-level edit rule", () => {
  const ownNew = { id: "l1", referrerUserId: "d", leadStatus: "NEW" };
  const ownAssigned = { id: "l2", referrerUserId: "d", leadStatus: "ASSIGNED" };
  const othersNew = { id: "l3", referrerUserId: "someone-else", leadStatus: "NEW" };

  it("ADMIN and BD edit any lead", () => {
    expect(canEditBodLead(ADMIN, othersNew)).toBe(true);
    expect(canEditBodLead(BD, ownAssigned)).toBe(true);
  });

  it("BOD edits only their own lead, and only while NEW", () => {
    expect(canEditBodLead(BOD, ownNew)).toBe(true);
    expect(canEditBodLead(BOD, ownAssigned)).toBe(false);
    expect(canEditBodLead(BOD, othersNew)).toBe(false);
    expect(() => assertCanEditBodLead(BOD, othersNew)).toThrow(/own leads/);
  });

  it("nobody edits a soft-deleted lead", () => {
    expect(canEditBodLead(ADMIN, { ...othersNew, deletedAt: new Date() })).toBe(false);
  });

  it("CS has no business here", () => {
    expect(canEditBodLead(CS, othersNew)).toBe(false);
  });
});

describe("homePathFor", () => {
  it("sends BOD to their only module and everyone else to patients", () => {
    expect(homePathFor("BOD")).toBe("/portal/bod-leads");
    expect(homePathFor("ADMIN")).toBe("/portal/patients");
    expect(homePathFor("BD")).toBe("/portal/patients");
    expect(homePathFor("CS")).toBe("/portal/patients");
  });
});
