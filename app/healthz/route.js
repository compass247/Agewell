// Health endpoint for the ALB target group + Docker healthcheck.
// Static, no CMS/DB dependency, so it stays green even if Directus is down.
export const dynamic = "force-static";

export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}
