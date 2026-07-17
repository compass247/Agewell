/* ============================================================
   PHI portal — audit/logging controls for HIPAA.
   - VPC Flow Logs for the PHI VPC -> encrypted CloudWatch
   - (optional) account CloudTrail, only if none exists

   (The ALB access-logs bucket was removed with the ALB in the P2 teardown —
   the portal is reached through the Cloudflare Tunnel, whose request logs live
   in Cloudflare. VPC flow logs still capture the task's network activity.)
   ============================================================ */

# ---------------- VPC Flow Logs ----------------
resource "aws_cloudwatch_log_group" "phi_flowlog" {
  name              = "/vpc/${var.project}-phi-flowlog"
  retention_in_days = var.phi_log_retention_days
  kms_key_id        = aws_kms_key.phi.arn
}

resource "aws_iam_role" "phi_flowlog" {
  name = "${var.project}-phi-flowlog"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "vpc-flow-logs.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = { Scope = "phi" }
}

resource "aws_iam_role_policy" "phi_flowlog" {
  name = "${var.project}-phi-flowlog"
  role = aws_iam_role.phi_flowlog.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
      ]
      Resource = "${aws_cloudwatch_log_group.phi_flowlog.arn}:*"
    }]
  })
}

resource "aws_flow_log" "phi" {
  vpc_id                   = aws_vpc.phi.id
  traffic_type             = "ALL"
  log_destination_type     = "cloud-watch-logs"
  log_destination          = aws_cloudwatch_log_group.phi_flowlog.arn
  iam_role_arn             = aws_iam_role.phi_flowlog.arn
  max_aggregation_interval = 600
  tags                     = { Scope = "phi" }
}

# ---------------- Account CloudTrail (optional) ----------------
# Only created when var.create_cloudtrail = true. Verify there is no existing
# account/org trail first (`aws cloudtrail describe-trails`) to avoid duplicate
# trails and double charges.
resource "aws_s3_bucket" "cloudtrail" {
  count         = var.create_cloudtrail ? 1 : 0
  bucket        = "${var.project}-cloudtrail-${data.aws_caller_identity.current.account_id}"
  force_destroy = false
  tags          = { Scope = "phi" }
}

resource "aws_s3_bucket_public_access_block" "cloudtrail" {
  count                   = var.create_cloudtrail ? 1 : 0
  bucket                  = aws_s3_bucket.cloudtrail[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  count  = var.create_cloudtrail ? 1 : 0
  bucket = aws_s3_bucket.cloudtrail[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AWSCloudTrailAclCheck"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:GetBucketAcl"
        Resource  = aws_s3_bucket.cloudtrail[0].arn
      },
      {
        Sid       = "AWSCloudTrailWrite"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.cloudtrail[0].arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      }
    ]
  })
}

resource "aws_cloudtrail" "account" {
  count                         = var.create_cloudtrail ? 1 : 0
  name                          = "${var.project}-account-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail[0].id
  is_multi_region_trail         = true
  include_global_service_events = true
  enable_log_file_validation    = true
  depends_on                    = [aws_s3_bucket_policy.cloudtrail]
  tags                          = { Scope = "phi" }
}
