/* ============================================================
   Networking — use the account's default VPC + public subnets.
   A static site behind an ALB needs no private subnets or NAT.
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

# The ALB is pinned to exactly two subnets/AZs (var.alb_subnet_ids) rather than
# every default-VPC subnet. An ALB spins up one node per subnet, and each node
# now carries a billed public IPv4 (~$3.6/mo). Spreading across all 6 default
# AZs cost ~4 extra IPv4 + node-hours for no benefit on a low-traffic site — two
# AZs is the ELB minimum and enough. (This ALB is removed entirely once the
# marketing site moves to Cloudflare Pages; the pin protects the interim bill.)
locals {
  alb_subnet_ids = length(var.alb_subnet_ids) > 0 ? var.alb_subnet_ids : slice(tolist(data.aws_subnets.default.ids), 0, 2)
}

# The ALB security group and the web ECS task security group were removed with
# the web ALB + web Fargate service (cost migration → Cloudflare Pages). The CMS
# host SG lives in cms-network.tf. The VPC/subnet data sources above are still
# used by the CMS EC2 instance.
