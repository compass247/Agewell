/* ============================================================
   PHI portal — S3 gateway endpoint + AZ pin.

   The interface endpoints (ecr.api/ecr.dkr/secretsmanager/logs) were REMOVED
   in the P2 teardown: the portal task now runs in a PUBLIC subnet with a
   public IP (so the cloudflared sidecar can reach the Cloudflare edge) and
   pulls images / reads secrets / ships logs over the internet gateway via
   TLS. That deleted ~$29/mo of interface-endpoint ENIs. Ingress stays closed
   at the task security group (the tunnel is outbound-only).

   The S3 *gateway* endpoint is free and kept — ECR image layers live in S3,
   so routing S3 over the AWS backbone (not the IGW) is cheaper and faster.
   It's attached to BOTH route tables now since the task moved to the public
   subnet.
   ============================================================ */

locals {
  # Pin the portal service to the AZ the (single-AZ) RDS instance lives in —
  # no cross-AZ data charges to the DB. Derived from state, so it survives an
  # RDS AZ change. Both the public and private subnet sets share AZ ordering.
  phi_pinned_subnet_index     = index(aws_subnet.phi_private[*].availability_zone, aws_db_instance.phi.availability_zone)
  phi_pinned_subnet_id_public = aws_subnet.phi_public[local.phi_pinned_subnet_index].id
}

# S3 gateway endpoint (free) — ECR image layers live in S3. Attached to both
# route tables so the task (public subnet) and anything left in the private
# subnets reach S3 over the backbone.
resource "aws_vpc_endpoint" "phi_s3" {
  vpc_id            = aws_vpc.phi.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.phi_private.id, aws_route_table.phi_public.id]

  tags = { Name = "${var.project}-phi-s3", Scope = "phi" }
}
