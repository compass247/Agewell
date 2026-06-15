/* ============================================================
   COMPASS AGEWELL — Lead form handler (AWS Lambda)
   Triggered by API Gateway (HTTP API) on POST /api/lead.
   - Validates name + phone
   - Rejects bot submissions via honeypot
   - Stores the lead in DynamoDB
   - Notifies the BD inbox via SES (best-effort)
   ============================================================ */
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.LEADS_TABLE;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const SES_FROM = process.env.SES_FROM;          // verified sender, e.g. "no-reply@compassagewell.com"
const SES_TO = process.env.SES_TO;              // BD inbox; comma-separated allowed

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const ses = new SESv2Client({ region: REGION });

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const reply = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

function digits(s) {
  return (String(s || "").match(/\d/g) || []).length;
}

export async function handler(event) {
  const method =
    event?.requestContext?.http?.method || event?.httpMethod || "POST";

  if (method === "OPTIONS") {
    return reply(204, {});
  }
  if (method !== "POST") {
    return reply(405, { error: "Method not allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  // Honeypot — silently accept so bots think they succeeded, but store nothing.
  if (data.company && String(data.company).trim() !== "") {
    return reply(200, { ok: true });
  }

  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const message = String(data.message || "").trim().slice(0, 2000);
  const services = Array.isArray(data.services)
    ? data.services.map((s) => String(s).slice(0, 120)).slice(0, 10)
    : [];
  const lang = data.lang === "en" ? "en" : "vi";
  const source = String(data.source || "website").slice(0, 60);

  if (name.length < 2) {
    return reply(422, { error: "name_required" });
  }
  if (digits(phone) < 9) {
    return reply(422, { error: "phone_invalid" });
  }

  const lead = {
    leadId: randomUUID(),
    name,
    phone,
    services,
    message,
    lang,
    source,
    createdAt: new Date().toISOString(),
  };

  if (!TABLE) {
    console.error("LEADS_TABLE not configured");
    return reply(500, { error: "server_misconfigured" });
  }

  try {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: lead }));
  } catch (err) {
    console.error("DynamoDB put failed", err);
    return reply(500, { error: "store_failed" });
  }

  // Email notification is best-effort — a failure here must not fail the lead.
  if (SES_FROM && SES_TO) {
    try {
      const subject = `[AgeWell] Lead mới: ${name} (${phone})`;
      const text =
        `Lead mới từ website Compass AgeWell\n\n` +
        `Họ tên: ${name}\n` +
        `Điện thoại: ${phone}\n` +
        `Dịch vụ quan tâm: ${services.join(", ") || "(không chọn)"}\n` +
        `Ngôn ngữ: ${lang}\n` +
        `Lời nhắn: ${message || "(trống)"}\n` +
        `Nguồn: ${source}\n` +
        `Thời gian: ${lead.createdAt}\n` +
        `Lead ID: ${lead.leadId}\n`;
      await ses.send(
        new SendEmailCommand({
          FromEmailAddress: SES_FROM,
          Destination: { ToAddresses: SES_TO.split(",").map((s) => s.trim()) },
          Content: {
            Simple: {
              Subject: { Data: subject, Charset: "UTF-8" },
              Body: { Text: { Data: text, Charset: "UTF-8" } },
            },
          },
        })
      );
    } catch (err) {
      console.error("SES send failed (non-fatal)", err);
    }
  }

  return reply(200, { ok: true, leadId: lead.leadId });
}
