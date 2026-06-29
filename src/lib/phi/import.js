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
  "primary phone": "primaryPhone",
  "secondary phone": "secondaryPhone",
  "email": "email",
  "address 1": "address1",
  "address1": "address1",
  "address 2": "address2",
  "address2": "address2",
  "city": "city",
  "state": "state",
  "zip": "zip",
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

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[()./_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cellText(value) {
  if (value == null) return "";
  // ExcelJS rich/hyperlink/formula cells expose .text / .result.
  if (typeof value === "object") {
    if (value.text != null) return String(value.text).trim();
    if (value.result != null) return String(value.result).trim();
    if (value.richText) return value.richText.map((r) => r.text).join("").trim();
    return "";
  }
  return String(value).trim();
}

/**
 * Parse + validate. `filename` is used to pick the parser (.csv vs workbook).
 * Returns the preview structure described in the file header.
 */
export async function parsePatientWorkbook(buffer, filename = "") {
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
  const seenExternalIds = new Map(); // externalId -> first rowNumber
  const duplicates = new Set();

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

    const parsed = patientInputSchema.safeParse(raw);
    if (!parsed.success) {
      invalid.push({
        rowNumber: r,
        errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        raw,
      });
      continue;
    }

    // Normalize language aliases that zod's enum would otherwise reject is done
    // pre-parse below; here data is already canonical.
    const data = parsed.data;

    // In-file duplicate detection on Patient ID.
    if (data.patientExternalId) {
      const prev = seenExternalIds.get(data.patientExternalId);
      if (prev) {
        duplicates.add(r);
      } else {
        seenExternalIds.set(data.patientExternalId, r);
      }
    }

    valid.push({ rowNumber: r, data });
  }

  return { headers, valid, invalid, duplicates };
}

/**
 * Pre-normalize a raw row's language so common spellings pass the enum.
 * Exposed for the preview/commit path to apply before schema parse if needed.
 */
export function coerceLanguage(value) {
  const key = normalize(value);
  return LANGUAGE_ALIASES[key] || (value ? String(value).toUpperCase() : "ENGLISH");
}

/** Build the downloadable CSV template (header row only). */
export function buildTemplateCsv() {
  return TEMPLATE_HEADERS.join(",") + "\n";
}
