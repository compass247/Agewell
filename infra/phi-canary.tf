/* ============================================================
   PHI portal — Cloudflare Tunnel CANARY (blue-green migration off the ALB).

   Goal: portal.compassagewell.com moves from the internet-open ALB (~$24/mo,
   SG allowlist maintenance) to an outbound-only Cloudflare Tunnel fronted by
   Cloudflare Access (auth wall) + the zone's free WAF. This file is the GREEN
   path, built next to the running service without touching it:

   - A SECOND ECS service (`agewell-portal-canary`) runs the same image with
     the same secrets — so it connects to the SAME production RDS and serves
     the SAME live data — plus a cloudflared sidecar.
   - It lives in a PUBLIC subnet (public IP, zero-ingress SG): the private
     subnets have no internet route, so cloudflared cannot reach the
     Cloudflare edge from there. Ingress stays closed (tunnel is
     outbound-only); egress is restricted to 443 + 7844 (CF edge) + 5432 (RDS).
   - Everything here is gated on var.portal_tunnel_token: token empty (the
     default) = nothing is created, so this file is safe to merge and apply
     before the tunnel exists.

   Runbook (Apply A → cutover → Apply B):
   1. Zero Trust → Tunnels → create `agewell-portal`, copy the token.
      Add public hostname portal-test.compassagewell.com → http://localhost:3000
      (awsvpc = shared network namespace, so localhost — not a container link).
   2. Zero Trust → Access → self-hosted app for portal-test + portal,
      Allow policy on the staff email domain. Confirm zone WAF is on.
   3. Set the token: GitHub secret PHI_TUNNEL_TOKEN (CI applies) and/or
      TF_VAR_portal_tunnel_token (local applies). Apply → canary comes up.
   4. VERIFY GATE on https://portal-test.compassagewell.com: Access challenge
      → real login → TOTP → production patient list → open a record → CSV
      export → import template. Full function against live data, or no-go.
   5. Cutover (dashboard, instantly reversible): add public hostname
      portal.compassagewell.com to the tunnel (replaces the CNAME → ALB).
      Rollback = recreate the CNAME to the ALB DNS name. Soak 1-3 days.
   6. Apply B (separate PR): fold the tunnel config into the main service
      (multiple cloudflared replicas can share one tunnel, so no gap), then
      delete this canary, the ALB/ACM/ALB-logs stack, and the interface
      endpoints. See docs/SYSTEM-REVIEW-2026-07.md §P2.

   ⚠️ Real-PHI gate: Cloudflare in front of PHI needs a Cloudflare BAA
   (Enterprise). Fine while all data is synthetic; revisit before go-live.
   ============================================================ */

variable "portal_tunnel_token" {
  description = "Cloudflare Tunnel token for the PHI portal canary (Zero Trust → Tunnels → agewell-portal). Empty = canary disabled. Supply via GitHub secret PHI_TUNNEL_TOKEN / TF_VAR_portal_tunnel_token — terraform.tfvars is gitignored and CI won't see it."
  type        = string
  default     = ""
  sensitive   = true
}

variable "portal_canary_image" {
  description = "Full ECR image URI:tag the canary runs. Must be the SAME image the live portal service runs (deploy-phi.yml pushes phi-<sha> and updates the service via the ECS API, outside Terraform). Empty falls back to local.phi_portal_image (a :bootstrap placeholder that does NOT exist in ECR — so this MUST be set when enabling the canary). Supply via TF_VAR_portal_canary_image / GitHub secret."
  type        = string
  default     = ""
}

locals {
  phi_canary_enabled = var.portal_tunnel_token != "" ? 1 : 0

  # Public subnet in the same AZ as the RDS/endpoints pin (subnet sets share
  # AZ ordering, so the private-subnet index maps 1:1 onto the public set).
  phi_canary_subnet_id = aws_subnet.phi_public[local.phi_pinned_subnet_index].id

  # Canary must run the ACTUAL running portal image, not the :bootstrap
  # fallback (which doesn't exist in ECR).
  phi_canary_image = var.portal_canary_image != "" ? var.portal_canary_image : local.phi_portal_image
}

# Zero-ingress task SG: the tunnel dials OUT to Cloudflare; nothing connects in.
resource "aws_security_group" "phi_canary_task" {
  count       = local.phi_canary_enabled
  name        = "${var.project}-phi-canary-task"
  description = "PHI portal canary - no ingress (Cloudflare Tunnel is outbound-only)"
  vpc_id      = aws_vpc.phi.id

  egress {
    description = "HTTPS (AWS APIs, cloudflared fallback transport)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "cloudflared QUIC/http2 to the Cloudflare edge"
    from_port   = 7844
    to_port     = 7844
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "cloudflared QUIC (UDP) to the Cloudflare edge"
    from_port   = 7844
    to_port     = 7844
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    # VPC CIDR (not the RDS SG) to avoid an inline-rule dependency cycle with
    # phi_rds's ingress-from-canary rule; the RDS SG still gates the receiving
    # side to exactly this SG.
    description = "Postgres to the PHI RDS (VPC-internal)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.phi.cidr_block]
  }

  tags = { Scope = "phi" }
}

# Same containers as the main task def, plus the tunnel sidecar. AUTH_URL is
# deliberately NOT pinned here: with AUTH_TRUST_HOST=true Auth.js derives the
# canonical URL from the (Cloudflare-forwarded) Host header, so login + MFA
# work on portal-test now and on portal after the cutover without a redeploy.
resource "aws_ecs_task_definition" "phi_canary" {
  count                    = local.phi_canary_enabled
  family                   = "${var.project}-portal-canary"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.phi_task_cpu
  memory                   = var.phi_task_memory
  execution_role_arn       = aws_iam_role.phi_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "portal"
      image     = local.phi_canary_image
      essential = true
      portMappings = [{
        containerPort = 3000
        protocol      = "tcp"
      }]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PHI_SESSION_IDLE_MINUTES", value = tostring(var.phi_session_idle_minutes) },
        { name = "AUTH_TRUST_HOST", value = "true" },
        # Next.js standalone binds to $HOSTNAME. The ALB reaches the portal by
        # task IP so the default is fine there, but the cloudflared sidecar
        # dials 127.0.0.1:3000 over the shared awsvpc loopback — force the
        # server to listen on all interfaces so loopback works too.
        { name = "HOSTNAME", value = "0.0.0.0" },
      ]
      secrets = [
        { name = "DATABASE_URL_PHI", valueFrom = "${aws_secretsmanager_secret.phi.arn}:DATABASE_URL_PHI::" },
        { name = "AUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.phi.arn}:AUTH_SECRET::" },
        { name = "PHI_ENC_KEY", valueFrom = "${aws_secretsmanager_secret.phi.arn}:PHI_ENC_KEY::" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.phi.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "canary"
        }
      }
    },
    {
      # Same pinned image as the CMS tunnel sidecar (cms-compute.tf) — known
      # good with remotely-managed tunnels. All routing lives on the Zero
      # Trust dashboard; the container only needs the token.
      name      = "cloudflared"
      image     = "cloudflare/cloudflared:2024.10.0"
      essential = true
      command   = ["tunnel", "--no-autoupdate", "run"]
      dependsOn = [{ containerName = "portal", condition = "START" }]
      secrets = [
        { name = "TUNNEL_TOKEN", valueFrom = "${aws_secretsmanager_secret.phi.arn}:TUNNEL_TOKEN::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.phi.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "cloudflared"
        }
      }
    }
  ])

  tags = { Scope = "phi" }
}

resource "aws_ecs_service" "phi_canary" {
  count           = local.phi_canary_enabled
  name            = "${var.project}-portal-canary"
  cluster         = aws_ecs_cluster.phi.id
  task_definition = aws_ecs_task_definition.phi_canary[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [local.phi_canary_subnet_id]
    security_groups  = [aws_security_group.phi_canary_task[0].id]
    assign_public_ip = true # public subnet: cloudflared needs an internet path
  }

  tags = { Scope = "phi" }
}
