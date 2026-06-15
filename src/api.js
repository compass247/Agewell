/* ============================================================
   COMPASS AGEWELL — Lead form API client
   POSTs the signup form to the serverless backend.
   Base URL is configurable via VITE_API_BASE (defaults to same-origin
   so nginx/Cloudflare can route /api to the backend).
   ============================================================ */
const API_BASE = import.meta.env.VITE_API_BASE || "";

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
