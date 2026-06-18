/* ============================================================
   Networking — use the account's default VPC + public subnets.
   A static site behind an ALB needs no private subnets or NAT.
   ============================================================ */
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security group for the ALB — public HTTP/HTTPS in.
resource "aws_security_group" "alb" {
  name        = "${var.project}-alb"
  description = "ALB ingress 80/443"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for the ECS tasks — only the ALB may reach the Next.js port.
resource "aws_security_group" "ecs" {
  name        = "${var.project}-ecs"
  description = "ECS task ingress from ALB only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "From ALB"
    from_port       = 3000 # Next.js server (was nginx :80 pre-cutover)
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
