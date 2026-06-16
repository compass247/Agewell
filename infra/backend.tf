/* ============================================================
   Lead backend — DynamoDB table, Lambda handler, HTTP API
   Gateway with a custom domain (api.compassagewell.com).
   ============================================================ */
data "aws_caller_identity" "current" {}

# ---------------- DynamoDB ----------------
# Schema comes from the SAME file local dev uses
# (backend/lead-handler/table-schema.json), so the two can never drift.
locals {
  leads_schema = jsondecode(file("${path.module}/../backend/lead-handler/table-schema.json"))
}

resource "aws_dynamodb_table" "leads" {
  name         = "${var.project}-leads"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = local.leads_schema.hashKey
  range_key    = try(local.leads_schema.rangeKey, null)

  # Key + index attributes from the shared schema.
  dynamic "attribute" {
    for_each = local.leads_schema.attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  # Optional Global Secondary Indexes (empty by default).
  dynamic "global_secondary_index" {
    for_each = try(local.leads_schema.globalSecondaryIndexes, [])
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hashKey
      range_key       = try(global_secondary_index.value.rangeKey, null)
      projection_type = try(global_secondary_index.value.projection, "ALL")
    }
  }

  point_in_time_recovery {
    enabled = true
  }
}

# ---------------- Lambda role ----------------
resource "aws_iam_role" "lambda" {
  name = "${var.project}-lead-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_app" {
  name = "${var.project}-lead-lambda-app"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = aws_dynamodb_table.leads.arn
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail"]
        Resource = "*"
      }
    ]
  })
}

# ---------------- Lambda package ----------------
# CI builds backend/lead-handler (npm ci) and zips it to this path before apply.
data "archive_file" "lead_handler" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/lead-handler"
  output_path = "${path.module}/build/lead-handler.zip"
  excludes    = ["build.mjs"]
}

resource "aws_lambda_function" "lead" {
  function_name    = "${var.project}-lead-handler"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.lead_handler.output_path
  source_code_hash = data.archive_file.lead_handler.output_base64sha256
  timeout          = 10
  memory_size      = 256

  environment {
    variables = {
      LEADS_TABLE    = aws_dynamodb_table.leads.name
      ALLOWED_ORIGIN = "https://${var.domain}"
      SES_FROM       = var.ses_from
      SES_TO         = var.ses_to
    }
  }
}

# ---------------- HTTP API Gateway ----------------
resource "aws_apigatewayv2_api" "lead" {
  name          = "${var.project}-lead-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://${var.domain}", "https://www.${var.domain}"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "lead" {
  api_id                 = aws_apigatewayv2_api.lead.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.lead.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lead" {
  api_id    = aws_apigatewayv2_api.lead.id
  route_key = "POST /api/lead"
  target    = "integrations/${aws_apigatewayv2_integration.lead.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.lead.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 20
    throttling_rate_limit  = 10
  }
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lead.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lead.execution_arn}/*/*"
}

# ---------------- Custom domain for the API ----------------
resource "aws_acm_certificate" "api" {
  domain_name       = var.api_subdomain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_record" "api_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id         = var.cloudflare_zone_id
  name            = each.value.name
  type            = each.value.type
  content         = each.value.value
  proxied         = false
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in cloudflare_record.api_acm_validation : r.hostname]
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.api_subdomain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.lead.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.default.id
}

# Cloudflare CNAME: api.compassagewell.com -> API Gateway regional endpoint.
resource "cloudflare_record" "api" {
  zone_id         = var.cloudflare_zone_id
  name            = var.api_subdomain
  type            = "CNAME"
  content         = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
  proxied         = false
  ttl             = 300
  allow_overwrite = true
}
