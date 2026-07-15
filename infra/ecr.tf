/* ============================================================
   ECR app-image repository. Named "agewell-web" for historical reasons (the
   retired marketing web container); today it holds the PHI portal images —
   `phi-<sha>` (portal, Dockerfile) and `migrate-<sha>` (Dockerfile.migrate),
   pushed by deploy-phi.yml. NOT renamed: changing `name` forces replacement
   and would orphan the image history the running service points at.
   ============================================================ */
resource "aws_ecr_repository" "web" {
  name                 = "${var.project}-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Keep only the most recent images to control storage cost.
resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
