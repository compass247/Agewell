/* ============================================================
   PHI portal — Cloudflare Tunnel variables.

   After the P2 teardown the portal is reached ONLY through the Cloudflare
   Tunnel (the ALB is gone). The cloudflared sidecar lives in the main portal
   task (phi-ecs.tf); the tunnel itself is remotely-managed (created in Zero
   Trust / via API), so Terraform only needs the token (injected via the PHI
   secret) and the tunnel UUID (for the portal DNS record).
   ============================================================ */

variable "portal_tunnel_token" {
  description = "Cloudflare Tunnel token for the portal cloudflared sidecar (Zero Trust → Tunnels → agewell-portal). Injected into the PHI secret. Supply via GitHub secret PHI_TUNNEL_TOKEN / TF_VAR_portal_tunnel_token — terraform.tfvars is gitignored and CI won't see it."
  type        = string
  default     = ""
  sensitive   = true
}

variable "portal_tunnel_id" {
  description = "Cloudflare Tunnel UUID for the PHI portal (agewell-portal). The portal DNS record CNAMEs to <id>.cfargotunnel.com. From Zero Trust → Tunnels."
  type        = string
  default     = "b5bd1b98-a1fc-4284-90d6-f5b9d3894c4e"
}
