output "alb_dns_name" {
  description = "ALB DNS name (apex/www CNAME target)."
  value       = aws_lb.web.dns_name
}

output "ecr_repository_url" {
  description = "ECR repo URL for the web image."
  value       = aws_ecr_repository.web.repository_url
}

output "ecs_cluster" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service" {
  description = "ECS service name."
  value       = aws_ecs_service.web.name
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
