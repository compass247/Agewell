/* ============================================================
   Networking — the account's default VPC + public subnets, used only by the
   CMS EC2 host (cms-compute.tf / cms-network.tf). The old web ALB + web
   Fargate service (and their SGs, subnet pinning, etc.) were removed in the
   cost migration to Cloudflare Pages. The PHI stack has its own VPC
   (phi-network.tf).
   ============================================================ */
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}
