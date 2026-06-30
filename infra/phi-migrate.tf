/* ============================================================
   PHI portal — one-off migration task.
   The Next.js standalone image does NOT contain backend/phi/migrate.mjs or the
   drizzle/ SQL, so migrations run from a dedicated migrate image (Dockerfile.migrate)
   pushed to the same ECR repo as migrate-<sha>. This task definition is invoked
   via `aws ecs run-task` (by CI or manually) in the PHI private subnets, BEFORE
   the portal service is updated. Idempotent (Drizzle journal).
   ============================================================ */
locals {
  phi_migrate_image = var.phi_migrate_image != "" ? var.phi_migrate_image : "${aws_ecr_repository.web.repository_url}:migrate-bootstrap"
}

variable "phi_migrate_image" {
  description = "ECR image URI:tag for the migrate task (Dockerfile.migrate). CI overrides per deploy."
  type        = string
  default     = ""
}

resource "aws_cloudwatch_log_group" "phi_migrate" {
  name              = "/ecs/${var.project}-portal-migrate"
  retention_in_days = var.phi_log_retention_days
  kms_key_id        = aws_kms_key.phi.arn
}

resource "aws_ecs_task_definition" "phi_migrate" {
  family                   = "${var.project}-portal-migrate"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.phi_task_execution.arn

  container_definitions = jsonencode([{
    name      = "migrate"
    image     = local.phi_migrate_image
    essential = true
    command   = ["node", "backend/phi/migrate.mjs"]
    secrets = [
      { name = "DATABASE_URL_PHI", valueFrom = "${aws_secretsmanager_secret.phi.arn}:DATABASE_URL_PHI::" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.phi_migrate.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "migrate"
      }
    }
  }])

  tags = { Scope = "phi" }
}
