/* ============================================================
   PHI portal — VPC endpoints (replace the NAT gateway).

   The portal Fargate tasks + migrate task live in private subnets and need to
   reach a small, fixed set of AWS APIs: pull the image (ECR), read the secret
   (Secrets Manager), decrypt it (KMS), and ship logs (CloudWatch Logs). The old
   design routed that egress through a NAT gateway (~$32/mo + data). Interface
   endpoints keep the tasks fully private (no internet route at all) and cost
   ~$7/mo/endpoint-AZ instead — cheaper here and a smaller audited surface.

   S3 uses a *gateway* endpoint (free) because ECR image layers are stored in S3.
   ============================================================ */

# SG for the interface endpoints: allow HTTPS from inside the PHI VPC (the tasks).
resource "aws_security_group" "phi_endpoints" {
  name        = "${var.project}-phi-endpoints"
  description = "PHI VPC interface endpoints - ingress 443 from within the PHI VPC"
  vpc_id      = aws_vpc.phi.id

  ingress {
    description = "HTTPS from PHI VPC (tasks reach AWS APIs privately)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.phi.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Scope = "phi" }
}

# Interface endpoints — one ENI per private subnet, private DNS on so the normal
# service hostnames resolve to the endpoint inside the VPC.
locals {
  phi_interface_endpoints = {
    ecr_api = "com.amazonaws.${var.aws_region}.ecr.api"
    ecr_dkr = "com.amazonaws.${var.aws_region}.ecr.dkr"
    secrets = "com.amazonaws.${var.aws_region}.secretsmanager"
    kms     = "com.amazonaws.${var.aws_region}.kms"
    logs    = "com.amazonaws.${var.aws_region}.logs"
  }
}

resource "aws_vpc_endpoint" "phi_interface" {
  for_each = local.phi_interface_endpoints

  vpc_id              = aws_vpc.phi.id
  service_name        = each.value
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.phi_private[*].id
  security_group_ids  = [aws_security_group.phi_endpoints.id]
  private_dns_enabled = true

  tags = { Name = "${var.project}-phi-${each.key}", Scope = "phi" }
}

# S3 gateway endpoint (free) — ECR image layers live in S3, so image pulls need
# it. Attached to the private route table.
resource "aws_vpc_endpoint" "phi_s3" {
  vpc_id            = aws_vpc.phi.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.phi_private.id]

  tags = { Name = "${var.project}-phi-s3", Scope = "phi" }
}
