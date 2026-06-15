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

variable "container_image" {
  description = "Full ECR image URI:tag for the web container. CI overrides this per deploy; default lets the ECS service start before the first image push."
  type        = string
  default     = ""
}

variable "desired_count" {
  description = "Number of ECS tasks for the web service."
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU)."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory (MiB)."
  type        = number
  default     = 512
}

variable "ses_from" {
  description = "Verified SES sender address for lead notifications (e.g. no-reply@compassagewell.com). Empty disables email."
  type        = string
  default     = ""
}

variable "ses_to" {
  description = "Comma-separated recipient(s) for lead notifications (BD inbox)."
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repo in owner/name form, used to scope the OIDC deploy role trust policy."
  type        = string
  default     = "compass247/Agewell"
}
