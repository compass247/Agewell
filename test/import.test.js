/* Bulk-import parser: header mapping, validation, duplicates, coercions.
   Builds workbooks in-memory with ExcelJS (write path used in TESTS only). */
import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import {
  parsePatientWorkbook,
  coerceLanguage,
  coerceGender,
  buildTemplateCsv,
  TEMPLATE_HEADERS,
} from "../src/lib/phi/import.js";

const HEADERS = [
  "Patient ID",
  "First Name",
  "Last Name",
  "DOB (MM/DD/YYYY)",
  "Primary Phone",
  "Primary Language",
  "Gender",
];

function row(overrides = {}) {
  return {
    "Patient ID": "",
    "First Name": "Lan",
    "Last Name": "Nguyen",
    "DOB (MM/DD/YYYY)": "01/31/1950",
    "Primary Phone": "408-123-4567",
    "Primary Language": "Vietnamese",
    Gender: "Nữ",
    ...overrides,
  };
}

async function buildXlsx(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("patients");
  ws.addRow(HEADERS);
  for (const r of rows) ws.addRow(HEADERS.map((h) => r[h] ?? ""));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

describe("parsePatientWorkbook", () => {
  it("parses a valid row with alias coercion (language + gender)", async () => {
    const buffer = await buildXlsx([row()]);
    const res = await parsePatientWorkbook(buffer, "a.xlsx");
    expect(res.invalid).toEqual([]);
    expect(res.valid).toHaveLength(1);
    const d = res.valid[0].data;
    expect(d.firstName).toBe("Lan");
    expect(d.preferredLanguage).toBe("VIETNAMESE");
    expect(d.gender).toBe("FEMALE");
  });

  it("defaults a BLANK Primary Language cell to ENGLISH instead of rejecting", async () => {
    const buffer = await buildXlsx([row({ "Primary Language": "" })]);
    const res = await parsePatientWorkbook(buffer, "a.xlsx");
    expect(res.invalid).toEqual([]);
    expect(res.valid[0].data.preferredLanguage).toBe("ENGLISH");
  });

  it("rejects a row with a bad DOB and reports the field", async () => {
    const buffer = await buildXlsx([row({ "DOB (MM/DD/YYYY)": "1950-01-31" })]);
    const res = await parsePatientWorkbook(buffer, "a.xlsx");
    expect(res.valid).toEqual([]);
    expect(res.invalid).toHaveLength(1);
    expect(res.invalid[0].errors.join(" ")).toMatch(/dob/);
  });

  it("skips duplicates against the DB and within the file", async () => {
    const buffer = await buildXlsx([
      row({ "Patient ID": "EXT-1" }),
      row({ "Patient ID": "EXT-1", "First Name": "Trung" }), // dup in file
      row({ "Patient ID": "EXT-9", "First Name": "Mai" }), // dup vs DB
    ]);
    const res = await parsePatientWorkbook(buffer, "a.xlsx", new Set(["EXT-9"]));
    expect(res.valid).toHaveLength(1);
    expect(res.valid[0].data.patientExternalId).toBe("EXT-1");
    expect(res.invalid).toHaveLength(2);
    expect(res.invalid.map((iv) => iv.errors.join(" ")).join(" ")).toMatch(
      /duplicated earlier in this file/
    );
  });

  it("skips fully blank rows", async () => {
    const buffer = await buildXlsx([row(), Object.fromEntries(HEADERS.map((h) => [h, ""]))]);
    const res = await parsePatientWorkbook(buffer, "a.xlsx");
    expect(res.valid).toHaveLength(1);
    expect(res.invalid).toEqual([]);
  });
});

describe("coercions & template", () => {
  it("coerceLanguage maps aliases and defaults", () => {
    expect(coerceLanguage("Tiếng Việt")).toBe("VIETNAMESE");
    expect(coerceLanguage("en")).toBe("ENGLISH");
    expect(coerceLanguage("")).toBe("ENGLISH");
  });

  it("coerceGender maps aliases, blank → null, unknown → OTHER", () => {
    expect(coerceGender("Nam")).toBe("MALE");
    expect(coerceGender("F")).toBe("FEMALE");
    expect(coerceGender("")).toBeNull();
    expect(coerceGender("nonbinary")).toBe("OTHER");
  });

  it("buildTemplateCsv emits the canonical header row", () => {
    expect(buildTemplateCsv()).toBe(TEMPLATE_HEADERS.join(",") + "\n");
  });
});
