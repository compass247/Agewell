/* ============================================================
   Leads repo — read-only view over the marketing lead-form table
   (DynamoDB `agewell-leads`) for the portal's Leads screen.

   Deliberately NOT under src/lib/phi/: leads are marketing
   contacts, not PHI. Nothing here touches the PHI Postgres, and
   DynamoDB stays the single source of truth (the same table the
   SES notification and the Directus mirror are fed from).

   The table is small (one item per form submission, no TTL), so
   listing is a full Scan with in-memory filter/sort/paginate —
   same trade-off the Directus mirror makes. Revisit with a GSI
   if volume ever makes Scan noticeable.
   ============================================================ */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.LEADS_TABLE || "agewell-leads";

// DYNAMODB_ENDPOINT points local dev at DynamoDB Local (see docs/LOCAL-DEV.md);
// unset in production so the SDK talks to the real regional endpoint (creds
// then come from the ECS task role). DynamoDB Local wants the same dummy
// credentials the rest of the local stack uses ("local"/"local").
const ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: ENDPOINT,
    ...(ENDPOINT
      ? { credentials: { accessKeyId: "local", secretAccessKey: "local" } }
      : {}),
  })
);

async function scanAll() {
  const items = [];
  let lastKey;
  do {
    const out = await ddb.send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey: lastKey })
    );
    items.push(...(out.Items || []));
    lastKey = out.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

/**
 * List leads, newest first.
 * @param {object} opts { search, lang, page, pageSize } — pageSize 0 = all rows
 *   (used by CSV export). `search` matches name (substring, case-insensitive)
 *   or phone (digit-sequence match).
 */
export async function listLeads({
  search = "",
  lang = "",
  page = 1,
  pageSize = 25,
} = {}) {
  const q = String(search).trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");

  const rows = (await scanAll()).filter((l) => {
    if (lang && l.lang !== lang) return false;
    if (!q) return true;
    if (String(l.name || "").toLowerCase().includes(q)) return true;
    return (
      qDigits.length >= 3 &&
      String(l.phone || "").replace(/\D/g, "").includes(qDigits)
    );
  });

  rows.sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  );

  const total = rows.length;
  if (!pageSize) return { rows, total, page: 1, pageSize: total };
  const p = Math.max(1, page);
  return {
    rows: rows.slice((p - 1) * pageSize, p * pageSize),
    total,
    page: p,
    pageSize,
  };
}

const CSV_COLUMNS = [
  ["createdAt", (l) => l.createdAt || ""],
  ["name", (l) => l.name || ""],
  ["phone", (l) => l.phone || ""],
  ["services", (l) => (Array.isArray(l.services) ? l.services.join("; ") : "")],
  ["lang", (l) => l.lang || ""],
  ["source", (l) => l.source || ""],
  ["message", (l) => l.message || ""],
  ["leadId", (l) => l.leadId || ""],
];

function csvCell(v) {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Rows → CSV string. BOM prefix so Excel opens Vietnamese text correctly. */
export function leadsToCsv(rows) {
  const lines = [CSV_COLUMNS.map(([name]) => name).join(",")];
  for (const l of rows) {
    lines.push(CSV_COLUMNS.map(([, get]) => csvCell(get(l))).join(","));
  }
  const bom = String.fromCharCode(0xfeff);
  return bom + lines.join("\r\n") + "\r\n";
}
