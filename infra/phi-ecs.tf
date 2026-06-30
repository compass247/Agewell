/* ============================================================
   PHI portal — ECS Fargate (separate cluster, same Docker image).
   Runs the SAME Next.js image as the marketing web service, but in the PHI
   VPC's private subnets with PHI-only secrets injected from Secrets Manager.
   The marketing service is untouched and never receives these secrets.
   ============================================================ */
resource "aws_ecs_cluster" "phi" {
  name = "${var.project}-phi"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Scope = "phi" }
}

resource "aws_cloudwatch_log_group" "phi" {
  name              = "/ecs/${var.project}-portal"
  retention_in_days = var.phi_log_retention_days
  kms_key_id        = aws_kms_key.phi.arn
}

# Task execution role — pull from ECR, write logs, read the PHI secret, and
# decrypt it with the CMK. (Granted decrypt in the KMS key policy.)
resource "aws_iam_role" "phi_task_execution" {
  name = "${var.project}-phi-task-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = { Scope = "phi" }
}

resource "aws_iam_role_policy_attachment" "phi_task_execution" {
  role       = aws_iam_role.phi_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "phi_exec_secrets" {
  name = "${var.project}-phi-exec-secrets"
  role = aws_iam_role.phi_task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.phi.arn
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.phi.arn
      }
    ]
  })
}

# Portal image = the same web image CI builds/pushes. Default to a placeholder
# for the very first apply (before CI pushes a phi-<sha> tag).
locals {
  phi_portal_image = var.container_image != "" ? var.container_image : "${aws_ecr_repository.web.repository_url}:bootstrap"
}

resource "aws_ecs_task_definition" "phi" {
  family                   = "${var.project}-portal"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.phi_task_cpu
  memory                   = var.phi_task_memory
  execution_role_arn       = aws_iam_role.phi_task_execution.arn

  container_definitions = jsonencode([{
    name      = "portal"
    image     = local.phi_portal_image
    essential = true
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PHI_SESSION_IDLE_MINUTES", value = tostring(var.phi_session_idle_minutes) },
      # Auth.js v5 behind the ALB: trust the proxy host and pin the canonical URL,
      # else login callbacks break.
      { name = "AUTH_TRUST_HOST", value = "true" },
      { name = "AUTH_URL", value = "https://${var.portal_subdomain}" },
    ]
    secrets = [
      { name = "DATABASE_URL_PHI", valueFrom = "${aws_secretsmanager_secret.phi.arn}:DATABASE_URL_PHI::" },
      { name = "AUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.phi.arn}:AUTH_SECRET::" },
      { name = "PHI_ENC_KEY", valueFrom = "${aws_secretsmanager_secret.phi.arn}:PHI_ENC_KEY::" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.phi.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "portal"
      }
    }
  }])

  tags = { Scope = "phi" }
}

resource "aws_ecs_service" "phi" {
  name            = "${var.project}-portal"
  cluster         = aws_ecs_cluster.phi.id
  task_definition = aws_ecs_task_definition.phi.arn
  desired_count   = var.phi_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.phi_private[*].id
    security_groups  = [aws_security_group.phi_task.id]
    assign_public_ip = false # private subnets reach ECR/Secrets via NAT
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.phi.arn
    container_name   = "portal"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.phi_https]

  # CI deploys by pushing a new image + forcing a new deployment.
  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = { Scope = "phi" }
}
