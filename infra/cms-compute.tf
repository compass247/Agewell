/* ============================================================
   CMS compute — ECS launch type EC2 hosting Directus + Postgres.

   ADDITIVE (Phase 1): this adds a new EC2-backed capacity provider
   and a single ECS service running Directus + Postgres as two
   containers on one t4g.small instance. The existing Fargate web
   service in ecs.tf is NOT touched.

   Design:
   - One Auto Scaling Group with exactly 1 ARM (Graviton) instance.
   - user-data: attach + mount the persistent EBS volume, register
     the instance to the ECS cluster.
   - One task definition, bridge network, two containers:
       postgres  -> data on the host's mounted EBS volume
       directus  -> talks to postgres via container link, media to S3
   - Secrets injected from Secrets Manager (cms-secrets.tf).
   ============================================================ */

# --- ECS-optimized AMI for ARM (Graviton), looked up by SSM ---
data "aws_ssm_parameter" "ecs_ami_arm" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id"
}

# ---------------- IAM: EC2 instance role (ECS agent) ----------------
resource "aws_iam_role" "cms_instance" {
  name = "${var.project}-cms-instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cms_instance_ecs" {
  role       = aws_iam_role.cms_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# SSM Session Manager — shell access without opening SSH.
resource "aws_iam_role_policy_attachment" "cms_instance_ssm" {
  role       = aws_iam_role.cms_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Allow the instance to attach the persistent EBS data volume (user-data) and
# upload pg_dump backups to the backup bucket.
resource "aws_iam_role_policy" "cms_instance_ops" {
  name = "${var.project}-cms-instance-ops"
  role = aws_iam_role.cms_instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ec2:AttachVolume", "ec2:DescribeVolumes"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = "${aws_s3_bucket.cms_backup.arn}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "cms_instance" {
  name = "${var.project}-cms-instance"
  role = aws_iam_role.cms_instance.name
}

# ---------------- IAM: task execution role (pull image, logs, read secret) ----------------
resource "aws_iam_role" "cms_task_execution" {
  name = "${var.project}-cms-task-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cms_task_execution" {
  role       = aws_iam_role.cms_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Read the CMS secret to inject into the containers.
resource "aws_iam_role_policy" "cms_task_execution_secrets" {
  name = "${var.project}-cms-exec-secrets"
  role = aws_iam_role.cms_task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_secretsmanager_secret.cms.arn
    }]
  })
}

# ---------------- IAM: task role (Directus -> S3 media) ----------------
resource "aws_iam_role" "cms_task" {
  name = "${var.project}-cms-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cms_task_s3" {
  name = "${var.project}-cms-task-s3"
  role = aws_iam_role.cms_task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.cms_media.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.cms_media.arn
      }
    ]
  })
}

# ---------------- Launch template + Auto Scaling Group ----------------
resource "aws_launch_template" "cms" {
  name_prefix            = "${var.project}-cms-"
  image_id               = data.aws_ssm_parameter.ecs_ami_arm.value
  instance_type          = var.cms_instance_type
  key_name               = var.cms_key_name != "" ? var.cms_key_name : null
  vpc_security_group_ids = [aws_security_group.cms_host.id]

  iam_instance_profile {
    arn = aws_iam_instance_profile.cms_instance.arn
  }

  # Register to the cluster, attach + mount the persistent EBS volume for Postgres.
  user_data = base64encode(<<-EOT
    #!/bin/bash
    set -euo pipefail
    echo "ECS_CLUSTER=${aws_ecs_cluster.main.name}" >> /etc/ecs/ecs.config

    # Attach the persistent data volume (idempotent across reboots).
    TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
    IID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
    aws ec2 attach-volume --region ${var.aws_region} --volume-id ${aws_ebs_volume.cms_data.id} --instance-id "$IID" --device /dev/sdf || true

    # Wait for the device, format on first use, mount at /mnt/cms-data.
    for i in $(seq 1 30); do [ -e /dev/sdf ] || [ -e /dev/nvme1n1 ] && break; sleep 2; done
    DEV=$([ -e /dev/nvme1n1 ] && echo /dev/nvme1n1 || echo /dev/sdf)
    blkid "$DEV" || mkfs -t ext4 "$DEV"
    mkdir -p /mnt/cms-data
    mount "$DEV" /mnt/cms-data
    mkdir -p /mnt/cms-data/postgres

    # Daily Postgres backup -> S3 (self-host means we own backups).
    # pg_dump runs inside the running postgres container; the dump is streamed
    # to the backup bucket. Old dumps expire via the bucket lifecycle rule.
    cat > /usr/local/bin/cms-backup.sh <<'BACKUP'
    #!/bin/bash
    set -euo pipefail
    CID=$(docker ps --filter "name=postgres" --format "{{.ID}}" | head -1)
    [ -z "$CID" ] && { echo "no postgres container"; exit 0; }
    TS=$(date +%Y%m%d-%H%M%S)
    docker exec "$CID" pg_dump -U directus directus | gzip | \
      aws s3 cp - "s3://${aws_s3_bucket.cms_backup.id}/directus-$TS.sql.gz" --region ${var.aws_region}
    BACKUP
    chmod +x /usr/local/bin/cms-backup.sh
    echo "0 3 * * * root /usr/local/bin/cms-backup.sh >> /var/log/cms-backup.log 2>&1" > /etc/cron.d/cms-backup
  EOT
  )

  tag_specifications {
    resource_type = "instance"
    tags          = { Name = "${var.project}-cms" }
  }
}

resource "aws_autoscaling_group" "cms" {
  name             = "${var.project}-cms"
  desired_capacity = 1
  min_size         = 1
  max_size         = 1
  # Constrain to the single AZ where the persistent EBS volume lives, so the
  # instance can always attach it.
  vpc_zone_identifier = local.cms_subnet_ids

  launch_template {
    id      = aws_launch_template.cms.id
    version = "$Latest"
  }

  # Required so the ECS capacity provider can manage this ASG.
  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Resolve every default subnet, then keep only those in the CMS AZ — the ASG
# must launch where the EBS data volume lives.
data "aws_subnet" "default" {
  for_each = toset(data.aws_subnets.default.ids)
  id       = each.value
}

locals {
  cms_subnet_ids = [
    for s in data.aws_subnet.default : s.id if s.availability_zone == local.cms_az
  ]
}

# ---------------- ECS capacity provider (EC2) ----------------
resource "aws_ecs_capacity_provider" "cms" {
  name = "${var.project}-cms-ec2"

  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.cms.arn
    managed_scaling {
      status                    = "ENABLED"
      target_capacity           = 100
      minimum_scaling_step_size = 1
      maximum_scaling_step_size = 1
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.cms.name]
}

# ---------------- Log group ----------------
resource "aws_cloudwatch_log_group" "cms" {
  name              = "/ecs/${var.project}-cms"
  retention_in_days = 30
}

# ---------------- Task definition (Postgres + Directus) ----------------
resource "aws_ecs_task_definition" "cms" {
  family             = "${var.project}-cms"
  network_mode       = "bridge"
  execution_role_arn = aws_iam_role.cms_task_execution.arn
  task_role_arn      = aws_iam_role.cms_task.arn

  requires_compatibilities = ["EC2"]

  # Persistent Postgres data on the host's mounted EBS volume.
  volume {
    name      = "pgdata"
    host_path = "/mnt/cms-data/postgres"
  }

  container_definitions = jsonencode([
    {
      name      = "postgres"
      image     = var.postgres_image
      essential = true
      cpu       = 256
      memory    = 512
      environment = [
        { name = "POSTGRES_USER", value = "directus" },
        { name = "POSTGRES_DB", value = "directus" }
      ]
      secrets = [
        { name = "POSTGRES_PASSWORD", valueFrom = "${aws_secretsmanager_secret.cms.arn}:DB_PASSWORD::" }
      ]
      mountPoints = [
        { sourceVolume = "pgdata", containerPath = "/var/lib/postgresql/data" }
      ]
      healthCheck = {
        command  = ["CMD-SHELL", "pg_isready -U directus -d directus"]
        interval = 10
        timeout  = 5
        retries  = 10
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.cms.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "postgres"
        }
      }
    },
    {
      name      = "directus"
      image     = var.directus_image
      essential = true
      cpu       = 512
      memory    = 1024
      portMappings = [
        { containerPort = 8055, hostPort = 8055, protocol = "tcp" }
      ]
      dependsOn = [
        { containerName = "postgres", condition = "HEALTHY" }
      ]
      links = ["postgres"]
      environment = [
        { name = "DB_CLIENT", value = "pg" },
        { name = "DB_HOST", value = "postgres" },
        { name = "DB_PORT", value = "5432" },
        { name = "DB_DATABASE", value = "directus" },
        { name = "DB_USER", value = "directus" },
        { name = "PUBLIC_URL", value = "https://${var.cms_subdomain}" },
        { name = "CORS_ENABLED", value = "true" },
        { name = "CORS_ORIGIN", value = "https://${var.domain},https://www.${var.domain}" },
        { name = "ADMIN_EMAIL", value = var.cms_admin_email },
        # Media to S3.
        { name = "STORAGE_LOCATIONS", value = "s3" },
        { name = "STORAGE_S3_DRIVER", value = "s3" },
        { name = "STORAGE_S3_BUCKET", value = aws_s3_bucket.cms_media.id },
        { name = "STORAGE_S3_REGION", value = var.aws_region },
      ]
      secrets = [
        { name = "KEY", valueFrom = "${aws_secretsmanager_secret.cms.arn}:KEY::" },
        { name = "SECRET", valueFrom = "${aws_secretsmanager_secret.cms.arn}:SECRET::" },
        { name = "DB_PASSWORD", valueFrom = "${aws_secretsmanager_secret.cms.arn}:DB_PASSWORD::" },
        { name = "ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.cms.arn}:ADMIN_PASSWORD::" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.cms.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "directus"
        }
      }
    }
  ])
}

# ---------------- ECS service ----------------
resource "aws_ecs_service" "cms" {
  name            = "${var.project}-cms"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cms.arn
  desired_count   = 1

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.cms.name
    weight            = 1
  }

  # Pin to one task at a time on the single host (stateful Postgres).
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  load_balancer {
    target_group_arn = aws_lb_target_group.cms.arn
    container_name   = "directus"
    container_port   = 8055
  }

  depends_on = [
    aws_lb_listener.https,
    aws_ecs_cluster_capacity_providers.main,
  ]
}
