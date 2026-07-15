/* Audit diff builder: change detection + sensitive-field redaction. */
import { describe, it, expect } from "vitest";
import { diffFields, REDACTED_FIELDS } from "../src/lib/phi/diff.js";

describe("diffFields", () => {
  it("lists only changed fields", () => {
    const changes = diffFields(
      { firstName: "A", lastName: "B", city: "X" },
      { firstName: "A", lastName: "C", city: "X" },
      ["firstName", "lastName", "city"]
    );
    expect(changes).toEqual([{ field: "lastName", old: "B", new: "C" }]);
  });

  it("redacts sensitive fields instead of logging plaintext", () => {
    for (const field of ["dob", "medicareMbi", "mfaSecret", "passwordHash"]) {
      expect(REDACTED_FIELDS.has(field)).toBe(true);
      const changes = diffFields({ [field]: "old-secret" }, { [field]: "new-secret" }, [field]);
      expect(changes).toEqual([{ field, old: "«redacted»", new: "«redacted»" }]);
    }
  });

  it("supports caller-supplied extra redactions", () => {
    const changes = diffFields({ ssn: "1" }, { ssn: "2" }, ["ssn"], ["ssn"]);
    expect(changes).toEqual([{ field: "ssn", old: "«redacted»", new: "«redacted»" }]);
  });

  it("normalizes Dates and treats null == null", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    const changes = diffFields({ at: d, x: null }, { at: d, x: null }, ["at", "x"]);
    expect(changes).toEqual([]);
  });
});
