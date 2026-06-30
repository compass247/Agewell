/* ============================================================
   PHI portal — outputs needed by CI and the deploy runbook.
   ============================================================ */
output "portal_url" {
  description = "PHI portal URL."
  value       = "https://${var.portal_subdomain}"
}

output "phi_alb_dns_name" {
  description = "PHI ALB DNS name (Cloudflare CNAME target)."
  value       = aws_lb.phi.dns_name
}

output "phi_rds_endpoint" {
  description = "PHI RDS endpoint (host:port). Reachable only from the portal tasks."
  value       = aws_db_instance.phi.endpoint
}

output "phi_ecs_cluster" {
  description = "PHI ECS cluster name."
  value       = aws_ecs_cluster.phi.name
}

output "phi_ecs_service" {
  description = "PHI portal ECS service name."
  value       = aws_ecs_service.phi.name
}

output "phi_portal_taskdef_family" {
  description = "Portal task definition family (CI renders new revisions of this)."
  value       = aws_ecs_task_definition.phi.family
}

output "phi_migrate_taskdef_family" {
  description = "Migrate task definition family (run via aws ecs run-task before deploy)."
  value       = aws_ecs_task_definition.phi_migrate.family
}

output "phi_private_subnet_ids" {
  description = "Private subnet IDs for run-task network config."
  value       = aws_subnet.phi_private[*].id
}

output "phi_task_security_group_id" {
  description = "Task security group ID for run-task network config."
  value       = aws_security_group.phi_task.id
}

output "phi_secret_arn" {
  description = "PHI Secrets Manager secret ARN."
  value       = aws_secretsmanager_secret.phi.arn
}

output "phi_kms_key_arn" {
  description = "PHI customer-managed KMS key ARN."
  value       = aws_kms_key.phi.arn
}

output "phi_github_deploy_role_arn" {
  description = "Least-privilege OIDC role ARN for the PHI deploy workflow (set as AWS_PHI_DEPLOY_ROLE_ARN)."
  value       = aws_iam_role.phi_github_deploy.arn
}
