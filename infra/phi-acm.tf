/* ============================================================
   PHI portal — ACM certificate for portal.<domain>, DNS-validated via
   Cloudflare. Separate cert (not a SAN on the marketing cert) so the PHI ALB
   is fully independent.
   ============================================================ */
resource "aws_acm_certificate" "portal" {
  domain_name       = var.portal_subdomain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_record" "portal_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.portal.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id         = var.cloudflare_zone_id
  name            = each.value.name
  type            = each.value.type
  content         = each.value.value
  proxied         = false
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "portal" {
  certificate_arn         = aws_acm_certificate.portal.arn
  validation_record_fqdns = [for r in cloudflare_record.portal_acm_validation : r.hostname]
}
