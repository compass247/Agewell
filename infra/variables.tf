variable "aws_region" {
  description = "AWS region for ECS, ALB, ACM, Lambda, DynamoDB."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name prefix for resources."
  type        = string
  default     = "agewell"
}

variable "domain" {
  description = "Apex domain served by the site."
  type        = string
  default     = "compassagewell.com"
}

variable "api_subdomain" {
  description = "Subdomain for the lead API (API Gateway custom domain)."
  type        = string
  default     = "api.compassagewell.com"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the domain (Overview tab in the Cloudflare dashboard)."
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone:DNS:Edit for the zone. Provide via TF_VAR_cloudflare_api_token."
  type        = string
  sensitive   = true
}

variable "cloudflare_proxied" {
  description = "Whether Cloudflare proxies the apex/www records (orange cloud). Keep false (DNS-only) so ACM on the ALB terminates TLS cleanly."
  type        = bool
  default     = false
}

# (alb_subnet_ids / desired_count / task_cpu / task_memory removed — they
# belonged to the retired web ALB + web Fargate service.)

variable "container_image" {
  description = "Full ECR image URI:tag used as the PHI portal image fallback (phi-ecs.tf) before CI pushes the first phi-<sha> tag. Normally left empty — deploy-phi.yml registers image updates directly."
  type        = string
  default     = ""
}

# NOTE: terraform.tfvars is gitignored, so CI applies (deploy.yml) only ever
# see these DEFAULTS. Any value that must hold in production belongs here (or
# in a TF_VAR_* workflow env), not only in the local tfvars — otherwise every
# CI apply silently reverts it. ses_from/ses_to defaulted to "" for a while,
# which blanked the Lambda's SES env on each CI deploy (emails off).
variable "ses_from" {
  description = "Verified SES sender address for lead notifications. Empty disables email."
  type        = string
  default     = "admin@compass247.vn"
}

variable "ses_to" {
  description = "Comma-separated recipient(s) for lead notifications (BD inbox)."
  type        = string
  default     = "admin@compass247.vn"
}

variable "github_repo" {
  description = "GitHub repo in owner/name form, used to scope the OIDC deploy role trust policy."
  type        = string
  default     = "compass247/Agewell"
}

/* ------------------------------------------------------------
   CMS (Directus) — self-hosted on ECS launch type EC2.
   Phase 1 is ADDITIVE: these provision a new EC2-backed capacity
   provider running Directus + Postgres. The existing Fargate web
   service is untouched until the Phase 5 cutover.
   ------------------------------------------------------------ */
variable "cms_subdomain" {
  description = "Subdomain for the Directus admin. Served via Cloudflare Tunnel (see cms_tunnel_id)."
  type        = string
  default     = "cms.compassagewell.com"
}

variable "cms_tunnel_id" {
  description = "Cloudflare Tunnel UUID for the CMS (agewell-cms). The cms DNS record CNAMEs to <id>.cfargotunnel.com. Get it from Zero Trust → Tunnels."
  type        = string
  default     = "d9395bc5-3df5-4f08-b386-86c7075a6cb0"
}

variable "cms_instance_type" {
  description = "EC2 instance type for the ECS EC2 capacity provider hosting Directus + Postgres. t4g.small is ARM/Graviton (cheap)."
  type        = string
  default     = "t4g.small"
}

variable "directus_image" {
  description = "Pinned Directus image (NEVER :latest — it runs schema migrations on boot)."
  type        = string
  default     = "directus/directus:11.3.5"
}

variable "postgres_image" {
  description = "Pinned Postgres image for the CMS database container."
  type        = string
  default     = "postgres:16-alpine"
}

variable "cms_admin_email" {
  description = "Bootstrap Directus admin email (first boot only; change password after)."
  type        = string
  default     = "admin@compassagewell.com"
}

variable "cms_ssh_cidr" {
  description = "CIDR allowed to SSH to the CMS EC2 host (for break-glass ops). Empty disables SSH ingress."
  type        = string
  default     = ""
}

variable "cms_key_name" {
  description = "Optional EC2 key pair name for SSH to the CMS host. Empty = no key (use SSM Session Manager)."
  type        = string
  default     = ""
}

/* ------------------------------------------------------------
   PHI patient-intake portal — ISOLATED HIPAA stack.
   A separate VPC + RDS + KMS + ALB, untouching the marketing infra.
   Stores PHI; only enter real data after the control verification passes.
   ------------------------------------------------------------ */
variable "portal_subdomain" {
  description = "Hostname for the PHI portal (served via Cloudflare Tunnel)."
  type        = string
  default     = "portal.compassagewell.com"
}

# (portal_allowed_cidrs removed — it gated the retired ALB security group.
# The portal now has no public inbound port; ingress is the Cloudflare Tunnel.)

variable "phi_vpc_cidr" {
  description = "CIDR for the isolated PHI VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "phi_db_instance_class" {
  description = "RDS instance class for the PHI Postgres."
  type        = string
  default     = "db.t4g.micro"
}

variable "phi_multi_az" {
  description = "Run the PHI RDS Multi-AZ (HA). Doubles instance cost. Default false — single-AZ is enough in the pre-launch stage (still has 30-day backups); flip true when real patient load needs zero-downtime AZ failover."
  type        = bool
  default     = false
}

variable "phi_db_username" {
  description = "Master username for the PHI Postgres."
  type        = string
  default     = "phi"
}

variable "phi_desired_count" {
  description = "Number of Fargate tasks for the portal service."
  type        = number
  default     = 1
}

variable "phi_task_cpu" {
  description = "Fargate CPU units for the portal task."
  type        = number
  default     = 256
}

variable "phi_task_memory" {
  description = "Fargate memory (MiB) for the portal task."
  type        = number
  default     = 512
}

variable "phi_session_idle_minutes" {
  description = "Idle session timeout (minutes) for the portal (HIPAA auto-logoff)."
  type        = number
  default     = 15
}

variable "phi_log_retention_days" {
  description = "CloudWatch retention (days) for PHI log groups. Kept hot here; HIPAA's 6-year audit requirement is met by archiving to S3 (Glacier) long-term, which is far cheaper than long CloudWatch retention. 90 days hot is enough for operational review."
  type        = number
  default     = 90
}

variable "create_cloudtrail" {
  description = "Create an account-level multi-region CloudTrail (management events — the first trail is free; S3 storage is pennies). Default true: API-level audit is a HIPAA expectation for the PHI stack. Set false ONLY if another account/org trail already exists (check `aws cloudtrail describe-trails`)."
  type        = bool
  default     = true
}
