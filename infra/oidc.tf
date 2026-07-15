/* ============================================================
   GitHub Actions OIDC — lets the deploy workflow assume an AWS
   role without long-lived access keys.
   ============================================================ */
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
}

resource "aws_iam_role" "github_deploy" {
  name = "${var.project}-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          # This near-admin role must ONLY be assumable from main (push/dispatch)
          # or from the protected `production` environment — NOT from arbitrary
          # branches or PR refs (PR plans use the read-only role below).
          "token.actions.githubusercontent.com:sub" = [
            "repo:${var.github_repo}:ref:refs/heads/main",
            "repo:${var.github_repo}:environment:production",
          ]
        }
      }
    }]
  })
}

/* ------------------------------------------------------------
   Read-only PLAN role for pull requests.
   ci.yml's terraform-plan job runs on every PR; it previously assumed the
   PowerUser deploy role, meaning any PR branch had near-admin credentials.
   This role can only read AWS state (plan/refresh) + use the TF state
   bucket/lock. Set the repo secret AWS_PLAN_ROLE_ARN to its ARN.
   Note: ReadOnlyAccess includes secretsmanager:GetSecretValue (terraform
   refresh needs it for secret_version resources) — same-repo PRs only;
   forked PRs get no OIDC token.
   ------------------------------------------------------------ */
resource "aws_iam_role" "github_plan" {
  name = "${var.project}-github-plan"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:pull_request"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "github_plan_readonly" {
  role       = aws_iam_role.github_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# State bucket writes are NOT needed for plan (read-only backend init), but the
# DynamoDB lock table needs item writes to take/release the state lock.
resource "aws_iam_role_policy" "github_plan_state" {
  name = "${var.project}-github-plan-state"
  role = aws_iam_role.github_plan.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "TfStateLock"
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
      Resource = "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/agewell-tf-lock"
    }]
  })
}

output "github_plan_role_arn" {
  description = "Set the repo secret AWS_PLAN_ROLE_ARN to this ARN (used by ci.yml's PR terraform plan)."
  value       = aws_iam_role.github_plan.arn
}

# Terraform on CI manages the whole stack (ECS, ALB, ACM, API GW, DynamoDB,
# Lambda, IAM roles, the OIDC provider, S3/Dynamo state). Enumerating every
# action is brittle — one new resource type breaks apply. Standard pattern for
# a Terraform CI role: PowerUserAccess (everything except IAM/Organizations)
# plus a scoped IAM-management policy. Trust is locked to this repo, so the
# blast radius is the project's own AWS account.
resource "aws_iam_role_policy_attachment" "github_deploy_poweruser" {
  role       = aws_iam_role.github_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/PowerUserAccess"
}

# IAM management that PowerUserAccess excludes — needed because Terraform creates
# and updates roles, policies, and the GitHub OIDC provider in this stack.
#
# BOOTSTRAP NOTE: when adding a NEW resource type that needs an IAM action not
# yet listed here (e.g. the first time we added instance-profile actions for the
# CMS EC2 host), the deploy role cannot grant itself the permission mid-apply —
# the apply that would add the action fails first on the action it lacks. Fix
# once by patching the action onto this inline policy out-of-band, e.g.:
#   aws iam put-role-policy --role-name agewell-github-deploy \
#     --policy-name agewell-github-deploy-iam --policy-document file://policy.json
# then re-run the deploy. Subsequent applies are idempotent (no drift).
resource "aws_iam_role_policy" "github_deploy_iam" {
  name = "${var.project}-github-deploy-iam"
  role = aws_iam_role.github_deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "IamManage"
      Effect = "Allow"
      Action = [
        "iam:GetRole", "iam:GetRolePolicy", "iam:GetPolicy", "iam:GetPolicyVersion",
        "iam:ListRolePolicies", "iam:ListAttachedRolePolicies", "iam:ListPolicyVersions",
        "iam:CreateRole", "iam:DeleteRole", "iam:UpdateRole",
        "iam:PutRolePolicy", "iam:DeleteRolePolicy",
        "iam:AttachRolePolicy", "iam:DetachRolePolicy",
        "iam:CreatePolicy", "iam:DeletePolicy", "iam:CreatePolicyVersion", "iam:DeletePolicyVersion",
        "iam:TagRole", "iam:UntagRole", "iam:TagPolicy", "iam:UntagPolicy",
        "iam:PassRole",
        "iam:CreateOpenIDConnectProvider", "iam:DeleteOpenIDConnectProvider",
        "iam:GetOpenIDConnectProvider", "iam:UpdateOpenIDConnectProviderThumbprint",
        "iam:TagOpenIDConnectProvider",
        # Instance profile management — the CMS EC2 capacity provider needs one.
        "iam:CreateInstanceProfile", "iam:DeleteInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:AddRoleToInstanceProfile", "iam:RemoveRoleFromInstanceProfile",
        "iam:TagInstanceProfile"
      ]
      Resource = "*"
    }]
  })
}

# Legacy least-privilege policy — kept for the deploy job's narrow needs
# (it still works alongside the broader infra permissions above).
resource "aws_iam_role_policy" "github_deploy" {
  name = "${var.project}-github-deploy"
  role = aws_iam_role.github_deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EcrAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "EcrPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = aws_ecr_repository.web.arn
      },
      {
        Sid    = "EcsDeploy"
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition"
        ]
        Resource = "*"
      },
      {
        Sid      = "LambdaDeploy"
        Effect   = "Allow"
        Action   = ["lambda:UpdateFunctionCode", "lambda:GetFunction"]
        Resource = aws_lambda_function.lead.arn
      },
      {
        Sid    = "PassRoles"
        Effect = "Allow"
        Action = ["iam:PassRole"]
        # The web task-execution role is gone (web moved to Pages). CI can still
        # pass the CMS task-execution role when re-registering the CMS task def.
        Resource = [aws_iam_role.cms_task_execution.arn]
      }
    ]
  })
}
