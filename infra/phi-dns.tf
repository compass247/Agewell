/* ============================================================
   PHI portal — DNS. Cloudflare CNAME portal.<domain> -> the PHI ALB.
   DNS-only (grey cloud) so the ALB's ACM cert terminates TLS, matching the
   marketing records. Access is restricted by the ALB security group, not DNS.
   ============================================================ */
resource "cloudflare_record" "portal" {
  zone_id = var.cloudflare_zone_id
  name    = var.portal_subdomain
  type    = "CNAME"
  content = aws_lb.phi.dns_name
  proxied = false
  ttl     = 300
}
