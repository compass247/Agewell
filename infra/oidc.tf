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
          # Only this repo's workflows may assume the role.
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
        }
      }
    }]
  })
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
        Sid      = "PassRoles"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = [aws_iam_role.task_execution.arn]
      }
    ]
  })
}
