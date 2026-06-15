# Infrastructure (Terraform)

Provisions the full AWS + Cloudflare stack for Compass AgeWell:

- **Frontend**: ECR + ECS Fargate (nginx static) behind an ALB with ACM HTTPS
- **Backend**: DynamoDB + Lambda + HTTP API Gateway (`api.compassagewell.com`) + SES
- **DNS**: Cloudflare records for apex, `www`, `api`, and ACM validation
- **CI/CD identity**: GitHub Actions OIDC deploy role

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

1. **Cloudflare**: a zone for `compassagewell.com`. Note the **Zone ID** (Overview tab)
   and create an **API token** with `Zone:DNS:Edit` for the zone.
2. **SES** (optional, for lead emails): verify the sender identity (e.g.
   `no-reply@compassagewell.com`) and, if you'll email unverified recipients,
   request production access.
3. Copy `terraform.tfvars.example` → `terraform.tfvars` and fill it in. Prefer
   passing the Cloudflare token via `TF_VAR_cloudflare_api_token` rather than the file.

## Apply

```bash
cd infra

# Build + zip the Lambda first (archive_file zips backend/lead-handler)
( cd ../backend/lead-handler && npm ci --omit=dev )

terraform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="region=$AWS_REGION" \
  -backend-config="dynamodb_table=agewell-tf-lock"

terraform plan -out tf.plan
terraform apply tf.plan
```

The **first** apply creates the ECS service with a `:bootstrap` placeholder image
tag — the service won't have a healthy task until CI pushes the first real image
and forces a new deployment. That's expected.

## Outputs you need afterwards

- `github_deploy_role_arn` → set as the `AWS_DEPLOY_ROLE_ARN` GitHub secret
- `ecr_repository_url`, `ecs_cluster`, `ecs_service`, `lead_lambda_name` → used by CI
  (the deploy workflow reads them from Terraform outputs or repo variables)

## DNS notes

- Apex/`www` are **CNAMEs to the ALB** (ALBs have no static IP). Cloudflare flattens
  the apex CNAME automatically.
- Records are **DNS-only (grey cloud)** by default so the ALB's ACM cert terminates
  TLS. To proxy through Cloudflare (orange cloud), set `cloudflare_proxied = true`
  and set Cloudflare SSL mode to **Full (strict)**.
