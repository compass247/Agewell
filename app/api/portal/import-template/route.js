/* Downloadable CSV import template (header row only — no PHI).
   Gated to authenticated portal staff. Node runtime. */
export const runtime = "nodejs";

import { auth } from "../../../../auth.js";
import { buildTemplateCsv } from "../../../../src/lib/phi/import.js";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.mfa !== "ok") {
    return new Response("Unauthorized", { status: 401 });
  }
  return new Response(buildTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="patient-import-template.csv"',
    },
  });
}
