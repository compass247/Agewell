/* ============================================================
   CSV cell encoding for PHI exports (pure module — unit-testable).

   Two concerns:
   1. CSV correctness — quote cells containing commas/quotes/newlines.
   2. Formula injection — a cell starting with = + - @ (or a tab/CR remnant)
      executes as a formula when the export is opened in Excel/Sheets.
      Patient-influenceable fields (names, referral source) flow into exports,
      so neutralize with a leading apostrophe (rendered as text, ignored by
      spreadsheet formula parsing).
   ============================================================ */

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/** Encode one value as a safe CSV cell. */
export function csvCell(v) {
  if (v == null) return "";
  let s = String(v);
  if (FORMULA_PREFIX.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Encode a row of values as a CSV line. */
export function csvLine(values) {
  return values.map(csvCell).join(",");
}
