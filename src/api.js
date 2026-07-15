/* ============================================================
   COMPASS AGEWELL — Lead form API client
   POSTs the signup form to the serverless backend
   (API Gateway → Lambda → DynamoDB). Base URL comes from
   NEXT_PUBLIC_API_BASE — https://api.compassagewell.com in prod
   (Cloudflare Pages build env); empty = same-origin /api for local dev.
   ============================================================ */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function submitLead(payload) {
  const res = await fetch(`${API_BASE}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error || "";
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
}
