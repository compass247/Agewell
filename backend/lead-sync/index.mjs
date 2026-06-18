/* ============================================================
   COMPASS AGEWELL — Lead sync (DynamoDB Streams -> Directus)

   Mirrors new/updated leads from the `agewell-leads` DynamoDB table into a
   read-only `leads` collection in Directus, so the BD team can view + export
   submissions in the same admin they use for blog/homepage.

   The lead WRITE path is unchanged: the form still POSTs to the lead Lambda,
   which writes to DynamoDB + sends SES. This sync is one-way and additive —
   DynamoDB stays the source of truth; PII never leaves AWS for a 3rd party.

   Triggered by DynamoDB Streams (NEW_IMAGE). Idempotent upsert keyed by leadId.

   Env:
     DIRECTUS_URL    - e.g. https://cms.compassagewell.com
     DIRECTUS_TOKEN  - static token for a service account with create/update
                       rights on the `leads` collection (from Secrets Manager).
   ============================================================ */
import { unmarshall } from "@aws-sdk/util-dynamodb";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";

export async function handler(event) {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    console.error("Missing DIRECTUS_URL / DIRECTUS_TOKEN — skipping sync.");
    return { batchItemFailures: [] };
  }

  const failures = [];

  for (const record of event.Records || []) {
    try {
      // Only INSERT/MODIFY carry a new image worth syncing.
      if (record.eventName === "REMOVE") continue;
      const img = record.dynamodb?.NewImage;
      if (!img) continue;

      const lead = unmarshall(img);
      await upsertLead(lead);
    } catch (err) {
      console.error("Sync failed for record:", record.dynamodb?.Keys, err);
      // Report this record so the stream retries just it (partial batch).
      failures.push({ itemIdentifier: record.dynamodb?.SequenceNumber });
    }
  }

  return { batchItemFailures: failures };
}

async function upsertLead(lead) {
  // Map the DynamoDB item to the Directus `leads` collection fields.
  const payload = {
    lead_id: lead.leadId,
    name: lead.name || "",
    phone: lead.phone || "",
    services: Array.isArray(lead.services) ? lead.services.join(", ") : "",
    message: lead.message || "",
    lang: lead.lang || "",
    source: lead.source || "",
    created_at: lead.createdAt || null,
  };

  // Upsert by lead_id: check existence, then PATCH or POST. The `leads`
  // collection uses lead_id as a unique field.
  const existing = await directus(
    `/items/leads?filter[lead_id][_eq]=${encodeURIComponent(lead.leadId)}&fields=id&limit=1`
  );

  if (existing?.length) {
    await directus(`/items/leads/${existing[0].id}`, "PATCH", payload);
  } else {
    await directus(`/items/leads`, "POST", payload);
  }
}

async function directus(path, method = "GET", body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus ${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  const json = await res.json();
  return json.data;
}
