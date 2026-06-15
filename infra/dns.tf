/* ============================================================
   Cloudflare DNS for the site — apex + www point at the ALB.
   DNS-only (grey cloud) by default so the ALB's ACM cert
   terminates TLS without a Cloudflare proxy in front.

   Note: ALBs have no static IP, so we use CNAMEs. Cloudflare
   flattens the apex CNAME automatically.
   ============================================================ */
resource "cloudflare_record" "apex" {
  zone_id         = var.cloudflare_zone_id
  name            = var.domain
  type            = "CNAME"
  content         = aws_lb.web.dns_name
  proxied         = var.cloudflare_proxied
  ttl             = var.cloudflare_proxied ? 1 : 300
  allow_overwrite = true
}

resource "cloudflare_record" "www" {
  zone_id         = var.cloudflare_zone_id
  name            = "www.${var.domain}"
  type            = "CNAME"
  content         = aws_lb.web.dns_name
  proxied         = var.cloudflare_proxied
  ttl             = var.cloudflare_proxied ? 1 : 300
  allow_overwrite = true
}
