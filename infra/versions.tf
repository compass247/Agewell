terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.48"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state. Create the S3 bucket + DynamoDB lock table once (see infra/README.md),
  # then `terraform init`. Values are supplied via backend config or -backend-config.
  backend "s3" {
    key     = "agewell/terraform.tfstate"
    encrypt = true
    # bucket / region / dynamodb_table provided via -backend-config or backend.hcl
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project   = "agewell"
      ManagedBy = "terraform"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
