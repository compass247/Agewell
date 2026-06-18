/* ============================================================
   Application Load Balancer + target group + listeners.
   HTTP :80 redirects to HTTPS :443 (ACM cert).
   ============================================================ */
resource "aws_lb" "web" {
  name               = "${var.project}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "web" {
  # name_prefix (not name) so create_before_destroy can stand up the new
  # target group before the old one is removed — required when changing the
  # port forces replacement while a listener still references it.
  name_prefix = "awweb-"
  port        = 3000 # Next.js server (was nginx :80 pre-cutover)
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip" # Fargate awsvpc networking

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
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.web.arn
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

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.web.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.web.certificate_arn

  # Default: the web (homepage) target group — unchanged.
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

/* ------------------------------------------------------------
   CMS (Directus) — host-based routing on the SAME ALB.
   Additive: only requests for cms.<domain> go to Directus; the
   default action (web/homepage) is untouched.
   ------------------------------------------------------------ */
resource "aws_lb_target_group" "cms" {
  name        = "${var.project}-cms-tg"
  port        = 8055
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "instance" # ECS launch type EC2 (bridge networking)

  health_check {
    path                = "/server/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener_rule" "cms" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  condition {
    host_header {
      values = [var.cms_subdomain]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cms.arn
  }
}
