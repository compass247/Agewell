/* ============================================================
   PHI portal — least-privilege GitHub Actions deploy role.
   Reuses the existing OIDC provider (one per account) but is a SEPARATE role:
   trust scoped to the MAIN branch only, and permissions limited to building/
   pushing the image and updating the PHI ECS service + running the migrate task.
   It deliberately CANNOT read the PHI secret or do anything else — a distinct
   principal in CloudTrail for PHI deploys.
   ============================================================ */
resource "aws_iam_role" "phi_github_deploy" {
  name = "${var.project}-phi-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          # Stricter than the marketing role (:*): main branch only.
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/main"
        }
      }
    }]
  })

  tags = { Scope = "phi" }
}

resource "aws_iam_role_policy" "phi_github_deploy" {
  name = "${var.project}-phi-github-deploy"
  role = aws_iam_role.phi_github_deploy.id
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
        Sid    = "EcrPushPull"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        Resource = aws_ecr_repository.web.arn
      },
      {
        Sid    = "EcsDeployPhi"
        Effect = "Allow"
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:RunTask",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
        ]
        Resource = "*"
        Condition = {
          # Scope ECS actions to the PHI cluster where possible. (Register/
          # DescribeTaskDefinition are not cluster-scoped in IAM; they're benign.)
          ArnEquals = {
            "ecs:cluster" = aws_ecs_cluster.phi.arn
          }
        }
      },
      {
        # RegisterTaskDefinition + DescribeTaskDefinition are not cluster-scoped;
        # allow them without the cluster condition.
        Sid      = "EcsTaskDefs"
        Effect   = "Allow"
        Action   = ["ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition"]
        Resource = "*"
      },
      {
        Sid      = "PassPhiExecRole"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = aws_iam_role.phi_task_execution.arn
      }
    ]
  })
}
