/* ============================================================
   PHI portal — isolated network.
   A dedicated VPC (NOT the default one) so the PHI RDS stays private and
   the audited boundary is small. Public subnets host the ALB + NAT; private
   subnets host the Fargate tasks + RDS (no internet route in, NAT for egress).
   ============================================================ */
# aws_availability_zones.available is declared in cms-storage.tf and reused here.

resource "aws_vpc" "phi" {
  cidr_block           = var.phi_vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "${var.project}-phi", Scope = "phi" }
}

# --- Public subnets (ALB + NAT) ---
resource "aws_subnet" "phi_public" {
  count                   = 2
  vpc_id                  = aws_vpc.phi.id
  cidr_block              = cidrsubnet(var.phi_vpc_cidr, 8, count.index) # 10.20.0.0/24, 10.20.1.0/24
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project}-phi-public-${count.index}", Scope = "phi", Tier = "public" }
}

# --- Private subnets (Fargate tasks + RDS) ---
resource "aws_subnet" "phi_private" {
  count             = 2
  vpc_id            = aws_vpc.phi.id
  cidr_block        = cidrsubnet(var.phi_vpc_cidr, 8, count.index + 10) # 10.20.10.0/24, 10.20.11.0/24
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags              = { Name = "${var.project}-phi-private-${count.index}", Scope = "phi", Tier = "private" }
}

# --- Internet gateway + NAT (single NAT to control cost) ---
resource "aws_internet_gateway" "phi" {
  vpc_id = aws_vpc.phi.id
  tags   = { Name = "${var.project}-phi", Scope = "phi" }
}

resource "aws_eip" "phi_nat" {
  domain = "vpc"
  tags   = { Name = "${var.project}-phi-nat", Scope = "phi" }
}

resource "aws_nat_gateway" "phi" {
  allocation_id = aws_eip.phi_nat.id
  subnet_id     = aws_subnet.phi_public[0].id
  tags          = { Name = "${var.project}-phi", Scope = "phi" }
  depends_on    = [aws_internet_gateway.phi]
}

# --- Route tables ---
resource "aws_route_table" "phi_public" {
  vpc_id = aws_vpc.phi.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.phi.id
  }
  tags = { Name = "${var.project}-phi-public", Scope = "phi" }
}

resource "aws_route_table_association" "phi_public" {
  count          = 2
  subnet_id      = aws_subnet.phi_public[count.index].id
  route_table_id = aws_route_table.phi_public.id
}

resource "aws_route_table" "phi_private" {
  vpc_id = aws_vpc.phi.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.phi.id
  }
  tags = { Name = "${var.project}-phi-private", Scope = "phi" }
}

resource "aws_route_table_association" "phi_private" {
  count          = 2
  subnet_id      = aws_subnet.phi_private[count.index].id
  route_table_id = aws_route_table.phi_private.id
}

# --- DB subnet group (private only) ---
resource "aws_db_subnet_group" "phi" {
  name       = "${var.project}-phi"
  subnet_ids = aws_subnet.phi_private[*].id
  tags       = { Scope = "phi" }
}

/* ---------------- Security groups ---------------- */

# ALB: 443/80 from the admin allowlist ONLY (no 0.0.0.0/0).
resource "aws_security_group" "phi_alb" {
  name        = "${var.project}-phi-alb"
  description = "PHI portal ALB - ingress 443/80 from allowlisted CIDRs only"
  vpc_id      = aws_vpc.phi.id

  ingress {
    description = "HTTPS from allowlist"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.portal_allowed_cidrs
  }

  ingress {
    description = "HTTP from allowlist (redirects to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.portal_allowed_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Scope = "phi" }
}

# Fargate tasks: 3000 from the ALB SG only.
resource "aws_security_group" "phi_task" {
  name        = "${var.project}-phi-task"
  description = "PHI portal tasks - ingress 3000 from the PHI ALB only"
  vpc_id      = aws_vpc.phi.id

  ingress {
    description     = "From PHI ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.phi_alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Scope = "phi" }
}

# RDS: 5432 from the task SG only. No other ingress.
resource "aws_security_group" "phi_rds" {
  name        = "${var.project}-phi-rds"
  description = "PHI RDS - ingress 5432 from the portal tasks only"
  vpc_id      = aws_vpc.phi.id

  ingress {
    description     = "Postgres from portal tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.phi_task.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Scope = "phi" }
}
