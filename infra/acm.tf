/* ============================================================
   ACM certificate for the ALB (apex + www), DNS-validated
   through Cloudflare.
   ============================================================ */
resource "aws_acm_certificate" "web" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# One Cloudflare validation record per distinct domain on the cert.
resource "cloudflare_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.web.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.value
  proxied = false
  ttl     = 60

  # ACM validation CNAMEs must never be proxied.
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "web" {
  certificate_arn         = aws_acm_certificate.web.arn
  validation_record_fqdns = [for r in cloudflare_record.acm_validation : r.hostname]
}
