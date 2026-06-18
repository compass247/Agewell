/* ============================================================
   CMS storage — persistent EBS volume for the Postgres data dir
   and an S3 bucket for Directus media uploads.

   The EC2 host is a single instance in one AZ (cost-optimized).
   Postgres data lives on a dedicated encrypted EBS volume that
   survives instance/container restarts. Directus media goes to S3
   (cheaper + durable) rather than the instance disk.
   ============================================================ */

# Pin the CMS host + its data volume to one AZ so they always co-locate.
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  cms_az = data.aws_availability_zones.available.names[0]
}

# Persistent data volume for Postgres (mounted at /mnt/cms-data by user-data).
resource "aws_ebs_volume" "cms_data" {
  availability_zone = local.cms_az
  size              = 20
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "${var.project}-cms-data"
  }

  # Guard against accidental destroy = data loss (same vigilance as DynamoDB).
  lifecycle {
    prevent_destroy = true
  }
}

# ---------------- S3 media bucket ----------------
resource "aws_s3_bucket" "cms_media" {
  bucket = "${var.project}-cms-media"
}

resource "aws_s3_bucket_public_access_block" "cms_media" {
  bucket                  = aws_s3_bucket.cms_media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ---------------- S3 backup bucket (pg_dump) ----------------
# Self-hosting means we own backups. A daily pg_dump (cron on the host,
# see cms-compute.tf user-data) is uploaded here. Old dumps expire after 30 days.
resource "aws_s3_bucket" "cms_backup" {
  bucket = "${var.project}-cms-backup"
}

resource "aws_s3_bucket_public_access_block" "cms_backup" {
  bucket                  = aws_s3_bucket.cms_backup.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cms_backup" {
  bucket = aws_s3_bucket.cms_backup.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "cms_backup" {
  bucket = aws_s3_bucket.cms_backup.id
  rule {
    id     = "expire-old-dumps"
    status = "Enabled"
    filter {}
    expiration {
      days = 30
    }
  }
}
