/* ============================================================
   ECS cluster for the CMS (Directus + Postgres on EC2).

   The web Fargate service that used to run the marketing site here was removed
   in the cost migration — the site is now a static Cloudflare Pages build. This
   cluster keeps hosting the CMS EC2 task (see cms-compute.tf).
   ============================================================ */
resource "aws_ecs_cluster" "main" {
  name = var.project

  # Container Insights disabled to cut per-cluster CloudWatch metric charges.
  # (This cluster runs the CMS EC2 task; the awslogs driver still ships CMS logs.)
  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}
