/* ============================================================
   Patient bulk-import: parse an uploaded .xlsx or .csv buffer, map columns to
   the patient schema, validate each row, and flag duplicates.

   Node runtime only. Reads with ExcelJS (we only PARSE here — the uuid advisory
   in ExcelJS's write path / v3-v5 buf usage is not on this code path).

   Returns { headers, valid: [{ rowNumber, data }], invalid: [{ rowNumber, errors,
   raw }], duplicates: Set<rowNumber> }. The caller previews this, then commits
   only the valid rows.
   ============================================================ */
import ExcelJS from "exceljs";
import { patientInputSchema } from "./validation.js";

// Human column label (as it appears in the file header) -> schema field.
// Case-insensitive, trimmed, punctuation-insensitive matching (see normalize).
export const COLUMN_MAP = {
  "patient id": "patientExternalId",
  "first name": "firstName",
  "last name": "lastName",
  "dob": "dob",
  "dob mm dd yyyy": "dob",
  "date of birth": "dob",
  "patient dob": "dob",
  "primary phone": "primaryPhone",
  "phone": "primaryPhone",
  "secondary phone": "secondaryPhone",
  "email": "email",
  "address 1": "address1",
  "address1": "address1",
  "address 2": "address2",
  "address2": "address2",
  "city": "city",
  "state": "state",
  "zip": "zip",
  "zip code": "zip",
  "gender": "gender",
  "medicare mbi": "medicareMbi",
  "insurance plan": "insurancePlan",
  "member id": "insuranceMemberId",
  "emergency name": "emergencyName",
  "emergency relationship": "emergencyRelationship",
  "emergency phone": "emergencyPhone",
  "referral source": "referralSource",
  "primary language": "preferredLanguage",
  "preferred language": "preferredLanguage",
  "notes": "notes",
};

// The canonical template header order (also used to build the downloadable CSV).
export const TEMPLATE_HEADERS = [
  "Patient ID",
  "First Name",
  "Last Name",
  "DOB (MM/DD/YYYY)",
  "Primary Phone",
  "Secondary Phone",
  "Email",
  "Address 1",
  "Address 2",
  "City",
  "State",
  "ZIP",
  "Medicare MBI",
  "Insurance Plan",
  "Member ID",
  "Emergency Name",
  "Emergency Relationship",
  "Emergency Phone",
  "Referral Source",
  "Primary Language",
  "Gender",
  "Notes",
];

const LANGUAGE_ALIASES = {
  english: "ENGLISH",
  en: "ENGLISH",
  vietnamese: "VIETNAMESE",
  vi: "VIETNAMESE",
  "tieng viet": "VIETNAMESE",
  spanish: "SPANISH",
  es: "SPANISH",
  other: "OTHER",
};

const GENDER_ALIASES = {
  m: "MALE",
  male: "MALE",
  nam: "MALE",
  f: "FEMALE",
  female: "FEMALE",
  nu: "FEMALE", // "nữ" normalizes to "nu"
  o: "OTHER",
  other: "OTHER",
};

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[()./_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Format an Excel/JS Date as MM/DD/YYYY using UTC parts (Excel stores dates as
// UTC midnight; using local parts could shift the day across timezones).
function formatExcelDate(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function cellText(value) {
  if (value == null) return "";
  // Excel date cells come through as JS Date objects → MM/DD/YYYY.
  if (value instanceof Date) return formatExcelDate(value);
  // ExcelJS rich/hyperlink/formula cells expose .text / .result.
  if (typeof value === "object") {
    // A formula/result cell can itself hold a Date.
    if (value.result instanceof Date) return formatExcelDate(value.result);
    if (value.text != null) return String(value.text).trim();
    if (value.result != null) return String(value.result).trim();
    if (value.richText) return value.richText.map((r) => r.text).join("").trim();
    return "";
  }
  return String(value).trim();
}

/**
 * Parse + validate. `filename` picks the parser (.csv vs workbook).
 * `existingIds` is a Set of Patient IDs already in the DB — rows whose Patient
 * ID collides with the DB, or with an earlier row in the same file, are treated
 * as INVALID (skipped), not imported. Rows with a blank Patient ID are never
 * counted as duplicates.
 * Returns { headers, valid: [{rowNumber, data}], invalid: [{rowNumber, errors}] }.
 */
export async function parsePatientWorkbook(buffer, filename = "", existingIds = new Set()) {
  const wb = new ExcelJS.Workbook();
  const isCsv = /\.csv$/i.test(filename);
  if (isCsv) {
    const { Readable } = await import("node:stream");
    await wb.csv.read(Readable.from(buffer));
  } else {
    await wb.xlsx.load(buffer);
  }

  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], valid: [], invalid: [], duplicates: new Set() };

  // Header row = first row. Map each column index -> schema field.
  const headerRow = ws.getRow(1);
  const colToField = {};
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    const label = cellText(cell.value);
    headers.push(label);
    const field = COLUMN_MAP[normalize(label)];
    if (field) colToField[colNumber] = field;
  });

  const valid = [];
  const invalid = [];
  const seenExternalIds = new Set(); // Patient IDs seen earlier in THIS file

  const lastRow = ws.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const row = ws.getRow(r);
    const raw = {};
    let anyValue = false;
    for (const [colNumber, field] of Object.entries(colToField)) {
      const text = cellText(row.getCell(Number(colNumber)).value);
      if (text !== "") anyValue = true;
      raw[field] = text;
    }
    if (!anyValue) continue; // skip blank rows

    // Accept friendly language spellings ("English", "Tiếng Việt") → enum.
    if (raw.preferredLanguage) {
      raw.preferredLanguage = coerceLanguage(raw.preferredLanguage);
    }
    // Accept friendly gender spellings ("M", "Male", "Nam") → enum, or null.
    if (raw.gender !== undefined) {
      raw.gender = coerceGender(raw.gender);
    }

    const parsed = patientInputSchema.safeParse(raw);
    if (!parsed.success) {
      invalid.push({
        rowNumber: r,
        errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        raw,
      });
      continue;
    }

    const data = parsed.data;

    // Duplicate Patient ID → skip (do not import). Blank ID is never a dup.
    if (data.patientExternalId) {
      if (existingIds.has(data.patientExternalId)) {
        invalid.push({
          rowNumber: r,
          errors: [`patientExternalId: already exists in the system (${data.patientExternalId})`],
          raw,
        });
        continue;
      }
      if (seenExternalIds.has(data.patientExternalId)) {
        invalid.push({
          rowNumber: r,
          errors: [`patientExternalId: duplicated earlier in this file (${data.patientExternalId})`],
          raw,
        });
        continue;
      }
      seenExternalIds.add(data.patientExternalId);
    }

    valid.push({ rowNumber: r, data });
  }

  return { headers, valid, invalid };
}

/**
 * Pre-normalize a raw row's language so common spellings pass the enum.
 * Exposed for the preview/commit path to apply before schema parse if needed.
 */
export function coerceLanguage(value) {
  const key = normalize(value);
  return LANGUAGE_ALIASES[key] || (value ? String(value).toUpperCase() : "ENGLISH");
}

/**
 * Normalize a raw gender value to the MALE/FEMALE/OTHER enum, or null if blank.
 * Unknown non-blank values fall back to OTHER so a row isn't rejected over gender.
 */
export function coerceGender(value) {
  if (value == null || String(value).trim() === "") return null;
  const key = normalize(value);
  return GENDER_ALIASES[key] || "OTHER";
}

/** Build the downloadable CSV template (header row only). */
export function buildTemplateCsv() {
  return TEMPLATE_HEADERS.join(",") + "\n";
}
