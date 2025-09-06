# =============================================================================
# Unified Financial Services Platform - Development Environment
# =============================================================================
# This Terraform configuration orchestrates the complete infrastructure deployment
# for the development environment of the Unified Financial Services Platform.
# It provisions networking, compute, database, and security resources optimized
# for financial services compliance (SOC2, PCI-DSS, GDPR) with containerized
# microservices architecture on AWS.
# =============================================================================

terraform {
  required_version = ">= 1.6"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # AWS provider version 5.0+ for latest security features
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"  # For generating secure random values
    }
  }
  
  # S3 backend configuration for remote state management with encryption and locking
  backend "s3" {
    bucket         = "ufs-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-dev"
    
    # Additional security configurations for state management
    server_side_encryption_configuration {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
        }
      }
    }
  }
}

# =============================================================================
# PROVIDER CONFIGURATION
# =============================================================================

# AWS Provider configuration for us-east-1 region
provider "aws" {
  region = "us-east-1"
  
  # Default tags applied to all resources for compliance and governance
  default_tags {
    tags = {
      Project         = "unified-financial-services"
      Environment     = "dev"
      ManagedBy      = "terraform"
      Owner          = "platform-engineering"
      CostCenter     = "technology"
      Compliance     = "SOC2,PCI-DSS,GDPR"
      DataClass      = "confidential"
      BackupRequired = "true"
      CreatedDate    = timestamp()
    }
  }
}

# =============================================================================
# DATA SOURCES
# =============================================================================

# Data source for availability zones in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# Data source for current AWS caller identity
data "aws_caller_identity" "current" {}

# Data source for current AWS region
data "aws_region" "current" {}

# =============================================================================
# LOCAL VALUES FOR CONFIGURATION
# =============================================================================

locals {
  # Environment-specific configuration
  environment = "dev"
  region      = "us-east-1"
  
  # Project naming convention
  project_name = "ufs"
  name_prefix  = "${local.project_name}-${local.environment}"
  
  # Network configuration for development environment
  vpc_cidr = "10.0.0.0/16"
  
  # Availability zones (using first 2 for cost optimization in dev)
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
  
  # Subnet CIDR blocks for multi-AZ deployment
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.101.0/24", "10.0.102.0/24"]
  
  # Common tags for all resources
  common_tags = {
    Project         = "unified-financial-services"
    Environment     = local.environment
    Region          = local.region
    DeployedBy     = "terraform"
    BusinessUnit   = "financial-services"
    SecurityLevel  = "financial-grade"
    Monitoring     = "required"
    Compliance     = "SOC2,PCI-DSS,GDPR"
  }
}

# =============================================================================
# NETWORKING MODULE
# =============================================================================

# Core networking infrastructure including VPC, subnets, gateways, and routing
module "networking" {
  source = "../modules/networking"
  
  # Basic configuration
  project_name = local.project_name
  environment  = local.environment
  
  # VPC configuration
  vpc_cidr_block = local.vpc_cidr
  
  # Multi-AZ configuration for high availability
  availability_zones           = local.availability_zones
  public_subnet_cidr_blocks   = local.public_subnet_cidrs
  private_subnet_cidr_blocks  = local.private_subnet_cidrs
  
  # NAT Gateway configuration (single NAT for dev cost optimization)
  enable_nat_gateway  = true
  single_nat_gateway  = true  # Cost optimization for development environment
  
  # Resource tagging
  tags = merge(local.common_tags, {
    Component = "networking"
    Purpose   = "core-infrastructure"
  })
}

# =============================================================================
# COMPUTE MODULE
# =============================================================================

# EKS cluster and worker nodes for containerized microservices
module "compute" {
  source = "../modules/compute"
  
  # Dependencies from networking module
  vpc_id          = module.networking.vpc_id
  vpc_cidr        = module.networking.vpc_cidr_block
  private_subnets = module.networking.private_subnet_ids
  
  # Environment configuration
  environment = local.environment
  
  # Development-specific compute configuration
  # Smaller instance types and reduced node counts for cost optimization
  
  # Tags for resource identification and cost allocation
  tags = merge(local.common_tags, {
    Component = "compute"
    Purpose   = "kubernetes-orchestration"
  })
  
  # Module dependency
  depends_on = [module.networking]
}

# =============================================================================
# DATABASE MODULE  
# =============================================================================

# Multi-database infrastructure for financial services data persistence
module "database" {
  source = "../modules/database"
  
  # Dependencies from networking module
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  
  # Environment configuration
  environment = local.environment
  
  # Database configuration optimized for development
  # PostgreSQL for transactional data
  postgresql_instance_class    = "db.t3.medium"      # Cost-optimized for dev
  postgresql_allocated_storage = 100                 # Smaller storage for dev
  
  # MongoDB DocumentDB for document storage
  mongodb_instance_class = "db.t4g.medium"          # ARM-based for cost efficiency
  mongodb_instance_count = 1                        # Single instance for dev
  
  # Redis ElastiCache for session management and caching
  redis_node_type      = "cache.t3.micro"           # Small cache for dev
  redis_num_nodes      = 1                          # Single node for dev
  
  # InfluxDB for time-series financial data
  influxdb_instance_type = "t3.medium"              # Medium instance for dev
  influxdb_ami          = "ami-0c02fb55956c7d316"   # Amazon Linux 2 AMI
  
  # Development environment flags
  is_production = false                              # Development-specific settings
  
  # Common tags for resource management
  common_tags = merge(local.common_tags, {
    Component = "database"
    Purpose   = "data-persistence"
  })
  
  # Module dependencies
  depends_on = [module.networking]
}

# =============================================================================
# SECURITY MODULE
# =============================================================================

# Comprehensive security configuration including security groups, NACLs, IAM, and WAF
module "security" {
  source = "../modules/security"
  
  # Dependencies from networking module
  vpc_id = module.networking.vpc_id
  
  # Environment configuration
  environment = local.environment
  
  # Security configuration for development environment
  enable_waf = true                                  # Enable WAF for API protection
  
  # Allow broader access for development testing
  allowed_cidr_blocks = [
    "10.0.0.0/16",                                  # VPC CIDR
    "0.0.0.0/0"                                     # Internet access for dev
  ]
  
  # Module dependencies
  depends_on = [module.networking]
}

# =============================================================================
# DEVELOPMENT ENVIRONMENT SPECIFIC RESOURCES
# =============================================================================

# S3 bucket for development data and artifacts
resource "aws_s3_bucket" "dev_data" {
  bucket = "${local.name_prefix}-dev-data-${random_id.bucket_suffix.hex}"
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-dev-data"
    Component = "storage"
    Purpose   = "development-data"
  })
}

# S3 bucket encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "dev_data" {
  bucket = aws_s3_bucket.dev_data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket versioning for development artifacts
resource "aws_s3_bucket_versioning" "dev_data" {
  bucket = aws_s3_bucket.dev_data.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket lifecycle configuration for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "dev_data" {
  bucket = aws_s3_bucket.dev_data.id
  
  rule {
    id     = "dev_data_lifecycle"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    expiration {
      days = 365  # Delete after 1 year for development
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# S3 bucket for development backups
resource "aws_s3_bucket" "dev_backups" {
  bucket = "${local.name_prefix}-dev-backups-${random_id.bucket_suffix.hex}"
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-dev-backups"
    Component = "backup"
    Purpose   = "development-backups"
  })
}

# Random ID for unique bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ec2/financial-platform-dev"
  retention_in_days = 30
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-app-logs"
    Component = "logging"
    Purpose   = "application-logs"
  })
}

# SNS topic for development notifications
resource "aws_sns_topic" "dev_notifications" {
  name = "${local.name_prefix}-notifications"
  
  # Enable encryption for sensitive notifications
  kms_master_key_id = "alias/aws/sns"
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-notifications"
    Component = "messaging"
    Purpose   = "development-alerts"
  })
}

# SQS queue for asynchronous processing in development
resource "aws_sqs_queue" "dev_processing" {
  name = "${local.name_prefix}-processing-queue"
  
  # Queue configuration for development workload
  delay_seconds             = 0
  max_message_size         = 262144
  message_retention_seconds = 345600  # 4 days
  receive_wait_time_seconds = 10      # Long polling
  
  # Dead letter queue configuration
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dev_processing_dlq.arn
    maxReceiveCount     = 3
  })
  
  # Encryption configuration
  kms_master_key_id                 = "alias/aws/sqs"
  kms_data_key_reuse_period_seconds = 300
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-processing-queue"
    Component = "messaging"
    Purpose   = "async-processing"
  })
}

# Dead letter queue for failed messages
resource "aws_sqs_queue" "dev_processing_dlq" {
  name = "${local.name_prefix}-processing-dlq"
  
  message_retention_seconds = 1209600  # 14 days
  
  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-processing-dlq"
    Component = "messaging"
    Purpose   = "dead-letter-queue"
  })
}

# =============================================================================
# OUTPUTS
# =============================================================================

# Networking outputs for other environments and modules
output "vpc_id" {
  description = "ID of the VPC created for the development environment"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC for network configuration"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets for load balancers and public services"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets for microservices and databases"
  value       = module.networking.private_subnet_ids
}

# Compute outputs for application deployment
output "eks_cluster_name" {
  description = "Name of the EKS cluster for kubectl configuration"
  value       = module.compute.cluster_name
  sensitive   = false
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL of the EKS cluster"
  value       = module.compute.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "Security group ID of the EKS cluster"
  value       = module.compute.cluster_security_group_id
}

# Database connection information (stored in SSM Parameter Store)
output "database_endpoints" {
  description = "Database endpoints for application configuration"
  value = {
    postgresql = module.database.postgresql_endpoint
    mongodb    = module.database.mongodb_endpoint
    redis      = module.database.redis_endpoint
    influxdb   = module.database.influxdb_endpoint
  }
  sensitive = true
}

# Security outputs for compliance and monitoring
output "security_group_ids" {
  description = "Security group IDs for application configuration"
  value = {
    api_gateway   = module.security.api_gateway_sg_id
    microservices = module.security.microservices_sg_id
    database      = module.security.database_sg_id
  }
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL for API Gateway protection"
  value       = module.security.waf_web_acl_arn
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile for microservices"
  value       = module.security.ec2_instance_profile_name
}

# Development environment specific outputs
output "s3_buckets" {
  description = "S3 buckets created for the development environment"
  value = {
    data_bucket   = aws_s3_bucket.dev_data.bucket
    backup_bucket = aws_s3_bucket.dev_backups.bucket
  }
}

output "messaging_resources" {
  description = "Messaging resources for asynchronous processing"
  value = {
    sns_topic_arn     = aws_sns_topic.dev_notifications.arn
    sqs_queue_url     = aws_sqs_queue.dev_processing.url
    sqs_dlq_queue_url = aws_sqs_queue.dev_processing_dlq.url
  }
}

# Environment metadata for automation and monitoring
output "environment_metadata" {
  description = "Environment metadata for automation and monitoring tools"
  value = {
    environment         = local.environment
    region             = local.region
    availability_zones = local.availability_zones
    vpc_cidr          = local.vpc_cidr
    project_name      = local.project_name
    deployment_date   = timestamp()
  }
}

# Compliance and governance information
output "compliance_tags" {
  description = "Compliance tags applied to all resources for audit purposes"
  value       = local.common_tags
}

# Connection information for external tools
output "kubectl_config_command" {
  description = "Command to configure kubectl for the EKS cluster"
  value       = "aws eks update-kubeconfig --region ${local.region} --name ${module.compute.cluster_name}"
}

output "terraform_state_backend" {
  description = "Terraform state backend configuration details"
  value = {
    bucket         = "ufs-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock-dev"
  }
}