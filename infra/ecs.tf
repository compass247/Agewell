/* ============================================================
   ECS Fargate cluster, task definition and service for the
   nginx static web container.
   ============================================================ */
locals {
  # Use the provided image, or a placeholder for the very first apply
  # (before CI has pushed an image). The service will stabilize once a
  # real image exists and CI forces a new deployment.
  web_image = var.container_image != "" ? var.container_image : "${aws_ecr_repository.web.repository_url}:bootstrap"
}

resource "aws_ecs_cluster" "main" {
  name = var.project

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${var.project}-web"
  retention_in_days = 30
}

# Task execution role — pull from ECR, write logs.
resource "aws_iam_role" "task_execution" {
  name = "${var.project}-task-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Let the web task read the REVALIDATE_SECRET from the CMS secret (post-cutover
# the web container is Next.js and needs it for the /api/revalidate webhook).
resource "aws_iam_role_policy" "task_execution_secrets" {
  name = "${var.project}-web-exec-secrets"
  role = aws_iam_role.task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_secretsmanager_secret.cms.arn
    }]
  })
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "web"
    image     = local.web_image
    essential = true
    # Next.js standalone server listens on 3000 (was nginx :80 pre-cutover).
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NEXT_PUBLIC_CMS_BASE", value = "https://${var.cms_subdomain}" },
      { name = "NEXT_PUBLIC_SITE_URL", value = "https://${var.domain}" },
      { name = "NEXT_PUBLIC_API_BASE", value = "https://${var.api_subdomain}" },
    ]
    # Server-side secret for the /api/revalidate webhook (publish = live).
    secrets = [
      { name = "REVALIDATE_SECRET", valueFrom = "${aws_secretsmanager_secret.cms.arn}:REVALIDATE_SECRET::" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.web.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "web"
      }
    }
  }])
}

resource "aws_ecs_service" "web" {
  name            = "${var.project}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true # tasks run in public subnets to reach ECR without NAT
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https]

  # CI deploys by pushing a new image and forcing a new deployment;
  # ignore image drift in the task definition so plans stay clean.
  lifecycle {
    ignore_changes = [task_definition]
  }
}
