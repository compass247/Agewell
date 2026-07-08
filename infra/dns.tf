/* ============================================================
   Cloudflare DNS for the site.

   apex + www are NO LONGER managed here — the marketing site moved to
   Cloudflare Pages, which owns those records as Pages custom domains (proxied
   to *.pages.dev). The old `cloudflare_record.apex` / `.www` (CNAME → ALB) were
   removed from Terraform AND from state (`terraform state rm`) at cutover so a
   later apply can't reclaim them and point the domain back at the ALB.

   Only the CMS record remains here (until the CMS moves to a Cloudflare Tunnel
   in Stage 3, after which this goes too).
   ============================================================ */

# CMS (Directus admin) — CNAME to the Cloudflare Tunnel (agewell-cms), proxied.
# The cloudflared sidecar in the CMS ECS task (cms-compute.tf) connects the
# tunnel and routes this hostname to directus:8055, so the CMS no longer needs
# the ALB. var.cms_tunnel_id is the tunnel's UUID.
resource "cloudflare_record" "cms" {
  zone_id         = var.cloudflare_zone_id
  name            = var.cms_subdomain
  type            = "CNAME"
  content         = "${var.cms_tunnel_id}.cfargotunnel.com"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}
