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

## Marketing progress (done outside Terraform)

- ✅ Cloudflare Pages live at agewell-b3s.pages.dev (build `npm run build:static`,
  output `out`, branch feat/cost-static-marketing). All routes + CMS content +
  lead form verified.
- ✅ Deploy Hook created + tested (POST → 200 success). Directus Flows repointed
  at it (backend/cms/repoint-flows-to-deployhook.mjs) so BD publish → Pages
  rebuild. This REPLACES the /api/revalidate mechanism.

## ⚠️ ORDER CONSTRAINT: CMS Tunnel BEFORE web ALB removal

The web ALB is **shared**: `cms.compassagewell.com` reaches Directus via a
host-routing rule on it, and `aws_security_group.cms_host` only admits port 8055
**from the ALB security group** (cms-network.tf). So the web ALB CANNOT be
removed until the CMS has its own ingress. Correct sequence:

1. **CMS → Cloudflare Tunnel (Stage 3).** A `cloudflared` sidecar is added to
   the CMS ECS task (cms-compute.tf, `local.cms_cloudflared_container`), gated on
   `var.cms_tunnel_token` (empty = sidecar omitted, CMS stays on the ALB).
   Procedure:
   a. Zero Trust → Networks → Tunnels → Create → Cloudflared → name `agewell-cms`.
      Copy the token (the long `eyJ...` after `--token`).
   b. Public Hostname on that tunnel: `cms.compassagewell.com` → Type HTTP →
      URL `http://directus:8055` (the sidecar links to the directus container).
   c. `TF_VAR_cms_tunnel_token=<token> terraform apply` — puts the token in the
      CMS secret and adds the sidecar. Force a new CMS deployment; watch the
      cloudflared log stream connect.
   d. Verify `https://cms.compassagewell.com` loads the Directus admin THROUGH
      the tunnel (the DNS record for cms will be the tunnel's *.cfargotunnel.com;
      Cloudflare adds it automatically when you set the Public Hostname).
   e. Keep the ALB cms rule as fallback until verified. Then the CMS no longer
      depends on the ALB, and Stage 5 can remove it.
2. **Cutover apex/www DNS → Pages (Stage 4).** Add apex + www as Pages custom
   domains (Cloudflare makes proxied records to *.pages.dev). Remove
   `cloudflare_record.apex` + `.www` from dns.tf so a later apply doesn't reclaim
   them (they use allow_overwrite). Keep the ALB alive as fallback.

   **Exact cutover procedure:**
   a. In Pages → Custom domains → add `compassagewell.com` + `www.compassagewell.com`
      → Activate. Cloudflare rewrites the DNS records to point at *.pages.dev.
   b. Verify: `curl -sI https://compassagewell.com/` shows a `cf-ray` header (served
      by Cloudflare/Pages) and NOT an AWS/ALB origin; the page still returns 200
      and shows the real content.
   c. dns.tf already has apex/www removed (this commit). Drop them from STATE so a
      later `terraform apply` won't try to recreate/delete the Pages-owned records:
        cd infra
        terraform state rm cloudflare_record.apex cloudflare_record.www
      (Requires the Cloudflare + AWS creds the normal apply uses. Run once. If the
      addresses differ, `terraform state list | grep cloudflare_record` to find them.)
   d. A `terraform plan` afterwards must show NO create/delete for apex/www.
3. **Remove web ALB + web Fargate (Stage 5).** Only now: delete `alb.tf`
   entirely (web + cms target groups, listeners, listener rule), the web
   service/taskdef/log-group/exec-role in `ecs.tf`, `acm.tf` (ALB cert), the
   `alb` + `ecs` SGs in network.tf, and the cms `cloudflare_record` + the
   ALB-from SG ingress in cms-network.tf (replaced by the tunnel). `plan` must
   destroy ONLY the ALB/web stack — NOT the CMS EC2, EBS, or DynamoDB.

## Still TODO (later stages)

- **VPC endpoint cost correction (done 2026-07)** — the original estimate here
  and in `phi-endpoints.tf` missed the per-AZ factor: 5 endpoints × 2 AZs =
  10 ENIs ≈ **$73/mo**, MORE than the $32 NAT they replaced. Trimmed to 4
  endpoints (kms dropped — nothing task-side calls the KMS API) × 1 AZ pinned
  to the RDS AZ ≈ **$29/mo**. The remaining endpoints disappear entirely at
  the Stage 6b teardown (task moves to a public subnet for tunnel egress).
- **PHI ALB → Cloudflare Tunnel + Access (Stage 6b — IN PROGRESS)** — being
  done blue-green via `phi-canary.tf`: a second `agewell-portal-canary`
  service (same image/secrets → same RDS data) with a `cloudflared` sidecar,
  running in a PUBLIC subnet (the private subnets have no internet route, so
  the sidecar can't dial the Cloudflare edge from there) behind a
  zero-ingress SG. Cloudflare Access (email allowlist) + the zone WAF replace
  the ALB IP-allowlist (portal_allowed_cidrs, currently 0.0.0.0/0 = open).
  Full runbook in the `phi-canary.tf` header: verify on
  `portal-test.compassagewell.com` against live data → DNS cutover
  (reversible) → soak → teardown Apply B (delete phi-alb.tf/phi-acm.tf, ALB
  logs bucket, interface endpoints; fold the tunnel into the main service;
  delete the canary). ⚠️ Real-PHI gate: Cloudflare BAA needs Enterprise —
  see `backend/phi/README.md`.
- **RDS → Aurora Serverless v2 (scale-to-zero) (Stage 6c)** — deferred; needs a
  data migration: `pg_dump` from INSIDE the PHI VPC (RDS is private — run an ECS
  task or bastion), create the Aurora cluster (min_capacity 0 ACU, PG 16.4–16.10
  — RDS is 16.13, compatible), restore, then swap DATABASE_URL_PHI in Secrets
  Manager (app uses drizzle+postgres-js, no code change). Verify the portal
  (login → enter patient → read back) before deleting the old RDS. Biggest care,
  smallest saving (~$9/mo → ~$1-3/mo); do it LAST.
