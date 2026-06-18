/* ============================================================
   Lead sync — DynamoDB Streams -> Lambda -> Directus `leads`.

   Mirrors leads into Directus for the BD dashboard. The lead WRITE path
   (form -> lead Lambda -> DynamoDB -> SES) is unchanged; this is additive
   and one-way. DynamoDB stays the source of truth.
   ============================================================ */

# ---------------- IAM role ----------------
resource "aws_iam_role" "lead_sync" {
  name = "${var.project}-lead-sync"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lead_sync_logs" {
  role       = aws_iam_role.lead_sync.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Read the DynamoDB stream.
resource "aws_iam_role_policy" "lead_sync_stream" {
  name = "${var.project}-lead-sync-stream"
  role = aws_iam_role.lead_sync.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ]
      Resource = aws_dynamodb_table.leads.stream_arn
    }]
  })
}

# ---------------- Lambda package ----------------
# CI runs npm install in backend/lead-sync before apply (mirrors lead-handler).
data "archive_file" "lead_sync" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/lead-sync"
  output_path = "${path.module}/build/lead-sync.zip"
}

resource "aws_lambda_function" "lead_sync" {
  function_name    = "${var.project}-lead-sync"
  role             = aws_iam_role.lead_sync.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.lead_sync.output_path
  source_code_hash = data.archive_file.lead_sync.output_base64sha256
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      DIRECTUS_URL   = "https://${var.cms_subdomain}"
      DIRECTUS_TOKEN = var.directus_sync_token
    }
  }
}

# ---------------- Event source: DynamoDB stream -> Lambda ----------------
resource "aws_lambda_event_source_mapping" "lead_sync" {
  event_source_arn  = aws_dynamodb_table.leads.stream_arn
  function_name     = aws_lambda_function.lead_sync.arn
  starting_position = "LATEST"

  # Partial-batch responses: a failed record retries on its own, not the batch.
  function_response_types = ["ReportBatchItemFailures"]

  batch_size                         = 10
  maximum_batching_window_in_seconds = 5
}
