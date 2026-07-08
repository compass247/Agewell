# Cost-migration apply order (READ BEFORE `terraform apply`)

These infra changes cut the AWS bill (~$44/8d → target ~$18/mo, or ~$9/mo if the
PHI portal is later put to sleep). Several steps are destructive or order-
sensitive — apply in the sequence below, reading each `terraform plan` first.

Context: the web ALB + web Fargate move to Cloudflare Pages; the PHI NAT gateway
is replaced by VPC endpoints; the PHI ALB is replaced by a Cloudflare Tunnel;
RDS drops Multi-AZ (already done live). The lead backend (Lambda/DynamoDB) and
the CMS EC2 are untouched here.

## Already applied LIVE via AWS CLI (2026-07-08) — now reconciled in code

- **Web ALB pinned to 2 AZs** (`set-subnets` → us-east-1a + us-east-1c).
  Reconciled by `alb_subnet_ids` in terraform.tfvars + `local.alb_subnet_ids`.
- **RDS Multi-AZ off** (`modify-db-instance --no-multi-az`).
  Reconciled by `phi_multi_az` default → false.

A `terraform plan` now should show **no change** to the ALB subnets or RDS
Multi-AZ. If it wants to revert either, STOP — the tfvars/defaults are wrong.

## Order-sensitive: NAT → VPC endpoints (phi-endpoints.tf)

⚠️ The private PHI tasks reach ECR/Secrets/KMS/Logs through the NAT today. If a
single apply deletes the NAT before the endpoints are live, the portal tasks
can't pull their image or read secrets and the service breaks.

Apply in TWO phases:

1. **Add endpoints first.** Comment out the NAT removal (keep the old NAT +
   private-route in place), apply ONLY `phi-endpoints.tf`. Verify each interface
   endpoint is `available` and the S3 gateway endpoint is attached to
   `aws_route_table.phi_private`. Force a new portal deployment and confirm the
   task still starts (it now resolves ECR/Secrets via the endpoints).
   - Practically: apply with both the NAT and the endpoints present, then
     `aws ecs update-service --force-new-deployment` and watch it go healthy.
2. **Then remove the NAT.** Apply the `phi-network.tf` change that drops
   `aws_nat_gateway.phi` + `aws_eip.phi_nat` and the `0.0.0.0/0` private route.
   The tasks keep working (endpoints), now with no internet path — the intended
   HIPAA posture. NAT + its EIP stop billing.

(The committed code already has the NAT removed. To do the safe 2-phase apply,
temporarily re-add the NAT for phase 1, or apply endpoints on a first run and
network on a second — `terraform apply -target=aws_vpc_endpoint.phi_interface
-target=aws_vpc_endpoint.phi_s3` first, then a full apply.)

## Still TODO (need Cloudflare, done in later stages)

- **Web ALB + web Fargate removal** — only after Cloudflare Pages serves the
  marketing site and apex/www DNS is cut over. Then delete `alb.tf`, the web
  service/taskdef in `ecs.tf`, `acm.tf`, and the apex/www records in `dns.tf`.
- **PHI ALB → Cloudflare Tunnel** — replace `phi-alb.tf` + `phi-dns.tf` with a
  `cloudflared` sidecar; then the PHI public subnets + IGW can go too.
- **Container Insights off** + **log retention 365 → 90** — cheap CloudWatch wins.
- **RDS → Aurora Serverless v2 (scale-to-zero)** — deferred; needs a data
  migration (dump inside the VPC → restore into the cluster → swap
  DATABASE_URL_PHI in Secrets Manager). Biggest care, smallest saving; last.
