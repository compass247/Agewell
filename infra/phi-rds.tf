/* ============================================================
   PHI portal — RDS PostgreSQL.
   Private (no public access), encrypted at rest with the PHI CMK, Multi-AZ,
   automated backups, deletion-protected. Reachable only from the portal tasks.
   ============================================================ */
resource "aws_db_instance" "phi" {
  identifier     = "${var.project}-phi"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.phi_db_instance_class

  # Storage — gp3, autoscaling headroom, encrypted with the customer CMK.
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.phi.arn

  db_name  = "phi"
  username = var.phi_db_username
  password = random_password.phi_db_master.result
  port     = 5432

  # Network — private subnets, task SG only, never public.
  db_subnet_group_name   = aws_db_subnet_group.phi.name
  vpc_security_group_ids = [aws_security_group.phi_rds.id]
  publicly_accessible    = false
  multi_az               = var.phi_multi_az

  # Backups + safety.
  backup_retention_period    = 30
  deletion_protection        = true
  skip_final_snapshot        = false
  final_snapshot_identifier  = "${var.project}-phi-final"
  copy_tags_to_snapshot      = true
  auto_minor_version_upgrade = true
  apply_immediately          = false

  # Ship Postgres logs to CloudWatch for audit.
  enabled_cloudwatch_logs_exports = ["postgresql"]

  # Performance Insights is encrypted with the same CMK when enabled. Off by
  # default to control cost; flip on if you need query-level diagnostics.
  performance_insights_enabled = false

  tags = { Scope = "phi" }
}
