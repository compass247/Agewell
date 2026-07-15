/* ============================================================
   PHI portal — VPC endpoints (replace the NAT gateway).

   The portal Fargate tasks + migrate task live in private subnets and need to
   reach a small, fixed set of AWS APIs: pull the image (ECR), read the secret
   (Secrets Manager), and ship logs (CloudWatch Logs). The old design routed
   that egress through a NAT gateway (~$32/mo + data).

   Cost math (learned the hard way): an interface endpoint bills ~$7.30/mo PER
   ENI, i.e. per endpoint PER AZ. The original 5 endpoints × 2 AZs = 10 ENIs
   ≈ $73/mo — MORE than the NAT it replaced. Trimmed to 4 endpoints × 1 AZ
   ≈ $29/mo by (a) dropping the kms endpoint — nothing in the task calls the
   KMS API through the VPC (PHI_ENC_KEY is a static secret value; Secrets
   Manager / RDS / CloudWatch decrypt with the CMK server-side) — and
   (b) pinning the remaining endpoints to the single AZ where the RDS instance
   lives. Private DNS resolves VPC-wide, so a task in either private subnet
   still reaches them; if that AZ goes down, task launches fail until it
   recovers — same blast radius as the single-AZ RDS (phi_multi_az=false) and
   desired_count=1 service we already run.

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

# Interface endpoints — single ENI in the RDS's AZ (see cost math above),
# private DNS on so the normal service hostnames resolve to the endpoint
# inside the VPC.
locals {
  phi_interface_endpoints = {
    ecr_api = "com.amazonaws.${var.aws_region}.ecr.api"
    ecr_dkr = "com.amazonaws.${var.aws_region}.ecr.dkr"
    secrets = "com.amazonaws.${var.aws_region}.secretsmanager"
    logs    = "com.amazonaws.${var.aws_region}.logs"
  }

  # Pin endpoints + the portal service to the AZ the (single-AZ) RDS instance
  # lives in — no cross-AZ data charges, and everything co-fails with the DB
  # rather than adding independent failure modes. Derived from state, so no
  # manual AZ lookup is needed and it survives an RDS AZ change.
  phi_pinned_subnet_index = index(aws_subnet.phi_private[*].availability_zone, aws_db_instance.phi.availability_zone)
  phi_pinned_subnet_id    = aws_subnet.phi_private[local.phi_pinned_subnet_index].id
}

resource "aws_vpc_endpoint" "phi_interface" {
  for_each = local.phi_interface_endpoints

  vpc_id              = aws_vpc.phi.id
  service_name        = each.value
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [local.phi_pinned_subnet_id]
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
