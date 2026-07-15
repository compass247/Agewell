# Infrastructure (Terraform)

Provisions the AWS + Cloudflare stack for Compass AgeWell. Current architecture
(post cost-migration — see `COST-MIGRATION.md` for the history):

- **Marketing site**: static export on **Cloudflare Pages** — NO AWS infra.
  Configured in the Cloudflare dashboard (production branch `main`), not here.
  Terraform no longer manages apex/`www` DNS (Pages custom domains own them).
- **Lead backend**: DynamoDB + Lambda + HTTP API Gateway
  (`api.compassagewell.com`) + SES, plus a DynamoDB-Streams→Directus sync
  Lambda (`cms-lead-sync.tf`).
- **CMS (Directus)**: ECS on a single EC2 t4g.small (`cms-*.tf`), Postgres
  sidecar on an EBS volume, media/backup S3 buckets, reached ONLY via a
  **Cloudflare Tunnel** (`cms.compassagewell.com` — no inbound ports).
- **PHI portal**: isolated VPC + Fargate + RDS Postgres 16 + KMS CMK +
  Secrets Manager (`phi-*.tf`). Ingress is migrating from the ALB to a
  Cloudflare Tunnel + Access via a blue-green canary (`phi-canary.tf`,
  enabled by `portal_tunnel_token`). AWS API access from the private subnets
  goes through VPC endpoints (single-AZ, pinned to the RDS AZ — see the cost
  math in `phi-endpoints.tf`).
- **CI/CD identity**: GitHub Actions OIDC — `agewell-github-deploy`
  (near-admin, **main-only**), `agewell-github-plan` (read-only, PR plans),
  `agewell-phi-github-deploy` (least-privilege PHI image/service deploys).
- **CloudTrail**: account-level management-event trail (`create_cloudtrail`,
  default on — first trail is free).

> ⚠️ `terraform.tfvars` is **gitignored** — CI applies (deploy.yml) only see
> the **defaults in `variables.tf`**. Any value that must hold in production
> belongs in the defaults or a `TF_VAR_*` workflow env, never only in tfvars.

## One-time bootstrap

Terraform state lives in S3 with a DynamoDB lock table. Create them once (they
can't be managed by the same state they store):

```bash
AWS_REGION=us-east-1
BUCKET=agewell-tfstate-$(aws sts get-caller-identity --query Account --output text)

aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION"
aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name agewell-tf-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$AWS_REGION"
```

## Prerequisites

1. **Cloudflare**: a zone for `compassagewell.com`. Note the **Zone ID**
   (Overview tab) and create an **API token** with `Zone:DNS:Edit` for the
   zone. Pass both via `TF_VAR_cloudflare_api_token` /
   `TF_VAR_cloudflare_zone_id` (never in a file).
2. **SES**: verify the sender identity (`ses_from` default) and, if you'll
   email unverified recipients, request production access.
3. **Cloudflare Tunnels** (Zero Trust → Networks → Tunnels): `agewell-cms`
   (live) and `agewell-portal` (canary — see `phi-canary.tf` header for the
   full runbook). Tokens go in via `TF_VAR_cms_tunnel_token` /
   `TF_VAR_portal_tunnel_token` (GitHub secrets for CI).

## Apply

Normally you don't apply by hand: **push to `main`** runs
`.github/workflows/deploy.yml` (gated by the `production` environment), and
PRs get a read-only plan comment from `ci.yml`. For a manual apply:

```bash
cd infra

# archive_file zips both Lambdas, so their prod deps must exist first
( cd ../backend/lead-handler && npm ci --omit=dev )
( cd ../backend/lead-sync && npm ci --omit=dev )

terraform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="region=$AWS_REGION" \
  -backend-config="dynamodb_table=agewell-tf-lock"

terraform plan -out tf.plan   # review carefully — DynamoDB destroy = data loss
terraform apply tf.plan
```

The first apply registers the PHI task definitions with a `:bootstrap`
placeholder image — the portal service has no healthy task until
`deploy-phi.yml` pushes the first real image. That's expected.

## Outputs you need afterwards

- `github_deploy_role_arn` → GitHub secret `AWS_DEPLOY_ROLE_ARN`
- `github_plan_role_arn` → GitHub secret `AWS_PLAN_ROLE_ARN` (PR plans)
- `phi_github_deploy_role_arn` → GitHub secret `AWS_PHI_DEPLOY_ROLE_ARN`
- PHI cluster/service/taskdef/subnet/SG outputs → the `PHI_*` repo variables
  consumed by `deploy-phi.yml`

## DNS notes

- Apex/`www` → managed by **Cloudflare Pages custom domains** (removed from
  Terraform state at the Pages cutover — do not re-add here).
- `api` → API Gateway custom domain (DNS-only + ACM validation records).
- `cms` → proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
- `portal` → currently the PHI ALB; moves to the portal tunnel at the canary
  cutover (`phi-canary.tf` runbook step 5).
