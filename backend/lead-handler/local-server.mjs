/* ============================================================
   COMPASS AGEWELL — Local dev server for the lead handler.
   Wraps the Lambda handler in an Express server so the form
   works at http://localhost:8787/api/lead, exactly like the
   API Gateway → Lambda path in production.

   Run:  npm run dev   (from backend/lead-handler)
   Needs DynamoDB Local running (see backend/docker-compose.local.yml).
   ============================================================ */
import http from "node:http";
import { handler } from "./index.mjs";

const PORT = process.env.PORT || 8787;

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  // Build an API-Gateway-v2-shaped event for the handler.
  const body = await readBody(req);
  const event = {
    requestContext: { http: { method: req.method } },
    headers: req.headers,
    body,
  };

  let result;
  try {
    result = await handler(event);
  } catch (err) {
    console.error("handler threw", err);
    result = { statusCode: 500, headers: {}, body: JSON.stringify({ error: "server_error" }) };
  }

  // CORS for the Vite dev origin (handler also sets these; this is a safety net).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const headers = result.headers || {};
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.statusCode = result.statusCode || 200;
  res.end(result.body || "");
});

server.listen(PORT, () => {
  console.log(`Lead API (local) → http://localhost:${PORT}/api/lead`);
  console.log(`DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT || "(AWS default)"}`);
  console.log(`Leads table: ${process.env.LEADS_TABLE || "(unset)"}`);
});
