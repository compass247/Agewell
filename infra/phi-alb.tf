/* ============================================================
   PHI portal — dedicated ALB.
   Public load balancer in the PHI VPC's public subnets, but its security group
   only admits the admin allowlist (var.portal_allowed_cidrs). Forwards to the
   Fargate portal tasks (port 3000) in private subnets. Access logs to an
   encrypted S3 bucket (see phi-logging.tf).
   ============================================================ */
resource "aws_lb" "phi" {
  name                       = "${var.project}-phi-alb"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.phi_alb.id]
  subnets                    = aws_subnet.phi_public[*].id
  drop_invalid_header_fields = true

  access_logs {
    bucket  = aws_s3_bucket.phi_alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  tags = { Scope = "phi" }
}

resource "aws_lb_target_group" "phi" {
  name_prefix = "phi-"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.phi.id
  target_type = "ip" # Fargate awsvpc

  health_check {
    path                = "/healthz"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = { Scope = "phi" }
}

resource "aws_lb_listener" "phi_http" {
  load_balancer_arn = aws_lb.phi.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "phi_https" {
  load_balancer_arn = aws_lb.phi.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.portal.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.phi.arn
  }
}
