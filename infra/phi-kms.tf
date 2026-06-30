/* ============================================================
   PHI portal — customer-managed KMS key (CMK).
   One CMK encrypts the PHI RDS, the PHI Secrets Manager secret, and the PHI
   CloudWatch log groups. HIPAA wants customer-controlled keys with rotation.
   ============================================================ */
# aws_caller_identity.current is declared in backend.tf and reused here.

resource "aws_kms_key" "phi" {
  description             = "CMK for AgeWell PHI portal (RDS, secrets, logs)."
  enable_key_rotation     = true
  deletion_window_in_days = 30

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # Account root retains full admin (so the key is never orphaned).
        Sid       = "EnableRootAdmin"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        # The portal/migrate task execution role decrypts secrets at startup.
        Sid       = "AllowTaskExecutionDecrypt"
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.phi_task_execution.arn }
        Action    = ["kms:Decrypt", "kms:GenerateDataKey*"]
        Resource  = "*"
      },
      {
        # CloudWatch Logs encrypts/decrypts PHI log groups with this key.
        Sid       = "AllowCloudWatchLogs"
        Effect    = "Allow"
        Principal = { Service = "logs.${var.aws_region}.amazonaws.com" }
        Action    = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey*", "kms:DescribeKey"]
        Resource  = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = [
              "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/ecs/${var.project}-portal*",
              "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/vpc/${var.project}-phi*",
            ]
          }
        }
      }
    ]
  })

  tags = { Scope = "phi" }
}

resource "aws_kms_alias" "phi" {
  name          = "alias/${var.project}-phi"
  target_key_id = aws_kms_key.phi.key_id
}
