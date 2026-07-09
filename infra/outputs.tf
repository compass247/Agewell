# alb_dns_name + ecs_service removed with the web ALB / web Fargate service.

output "ecr_repository_url" {
  description = "ECR repo URL for the web image (still used by the PHI portal + migrate task)."
  value       = aws_ecr_repository.web.repository_url
}

output "ecs_cluster" {
  description = "ECS cluster name (runs the CMS)."
  value       = aws_ecs_cluster.main.name
}

output "lead_lambda_name" {
  description = "Lambda function name for the lead handler."
  value       = aws_lambda_function.lead.function_name
}

output "api_endpoint" {
  description = "Public API base (custom domain)."
  value       = "https://${var.api_subdomain}"
}

output "api_gateway_target" {
  description = "API Gateway regional target domain (CNAME target for the api subdomain)."
  value       = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
}

output "github_deploy_role_arn" {
  description = "ARN of the GitHub Actions OIDC deploy role. Set as the AWS_DEPLOY_ROLE_ARN repo secret."
  value       = aws_iam_role.github_deploy.arn
}

output "leads_table" {
  description = "DynamoDB table holding leads."
  value       = aws_dynamodb_table.leads.name
}

output "cms_url" {
  description = "Directus CMS admin URL."
  value       = "https://${var.cms_subdomain}"
}

output "cms_media_bucket" {
  description = "S3 bucket for Directus media uploads."
  value       = aws_s3_bucket.cms_media.id
}

output "cms_secret_arn" {
  description = "Secrets Manager ARN holding the CMS credentials."
  value       = aws_secretsmanager_secret.cms.arn
}

output "lead_sync_lambda_name" {
  description = "Lambda that mirrors DynamoDB leads into the Directus dashboard."
  value       = aws_lambda_function.lead_sync.function_name
}
