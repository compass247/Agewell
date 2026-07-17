/* ============================================================
   PHI portal — DNS. Cloudflare CNAME portal.<domain> -> the Cloudflare Tunnel
   (P2 cutover 2026-07). Proxied (orange cloud): Cloudflare terminates TLS and
   the tunnel carries traffic to the portal task — no public ALB, no inbound
   port. Rollback = point content back at the ALB DNS name (kept alive during
   soak) and set proxied=false.

   The tunnel is remotely-managed (created in Zero Trust / via API); Terraform
   only owns this DNS record. `allow_overwrite` adopts the record already
   flipped to the tunnel by the cutover so no manual import is needed.
   ============================================================ */
resource "cloudflare_record" "portal" {
  zone_id         = var.cloudflare_zone_id
  name            = var.portal_subdomain
  type            = "CNAME"
  content         = "${var.portal_tunnel_id}.cfargotunnel.com"
  proxied         = true
  ttl             = 1 # ttl must be 1 (automatic) when proxied
  allow_overwrite = true
}
