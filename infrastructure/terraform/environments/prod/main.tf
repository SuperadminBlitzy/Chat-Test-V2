# =============================================================================
# Unified Financial Services Platform - Production Environment Main Configuration
# =============================================================================
# This is the main Terraform configuration for the production environment of the
# Unified Financial Services Platform. It orchestrates the deployment of all
# infrastructure components including networking, compute (EKS), databases, and
# security resources with enterprise-grade configuration for financial services
# compliance (SOC2, PCI-DSS, GDPR).
# =============================================================================

terraform {
  # Terraform version requirement for latest features and security patches
  required_version = ">= 1.6"
  
  # S3 backend configuration for secure, encrypted state management
  backend "s3" {
    bucket         = "financial-platform-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-prod"
    
    # Additional security and versioning for production state
    versioning                = true
    server_side_encryption_configuration {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
        }
      }
    }
  }
  
  # Required providers with specific versions for production stability
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # AWS provider version ~> 5.0 for latest security features
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"  # Kubernetes provider version ~> 2.24 for EKS 1.28 compatibility
      version = "~> 2.24"
    }
  }
}

# =============================================================================
# VARIABLES FOR PRODUCTION CONFIGURATION
# =============================================================================

variable "aws_region" {
  description = "AWS region for production deployment - us-east-1 for primary region with global financial market access"
  type        = string
  default     = "us-east-1"
  
  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "AWS region must be in the format 'us-east-1' for valid region specification."
  }
}

variable "environment" {
  description = "Environment name - fixed to 'prod' for production deployment with strict validation"
  type        = string
  default     = "prod"
  
  validation {
    condition     = var.environment == "prod"
    error_message = "This configuration is specifically for production environment only."
  }
}

variable "project_name" {
  description = "Project name used for resource naming and tagging consistency across the financial platform"
  type        = string
  default     = "ufs"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens for AWS resource naming compliance."
  }
}

variable "availability_zones" {
  description = "Availability zones for multi-AZ deployment ensuring high availability for financial services"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  validation {
    condition     = length(var.availability_zones) >= 3
    error_message = "At least 3 availability zones required for production high availability in financial services."
  }
}

# =============================================================================
# LOCAL VALUES FOR COMPUTED CONFIGURATIONS
# =============================================================================

locals {
  # Common tags applied to all resources for compliance, cost tracking, and governance
  common_tags = {
    Environment         = var.environment
    Project            = "unified-financial-platform"
    ManagedBy          = "terraform"
    BusinessUnit       = "financial-services"
    CostCenter         = "technology-infrastructure"
    Compliance         = "SOC2,PCI-DSS,GDPR,SOX"
    DataClassification = "confidential"
    BackupRequired     = "true"
    MonitoringEnabled  = "true"
    SecurityLevel      = "high"
    CreatedDate        = timestamp()
    Owner              = "platform-engineering"
  }
  
  # Network configuration optimized for financial services with adequate IP space
  vpc_cidr_block = "10.0.0.0/16"
  public_subnet_cidrs = [
    "10.0.1.0/24",   # Public subnet AZ-1a for load balancers
    "10.0.2.0/24",   # Public subnet AZ-1b for NAT gateways
    "10.0.3.0/24"    # Public subnet AZ-1c for high availability
  ]
  private_subnet_cidrs = [
    "10.0.10.0/24",  # Private subnet AZ-1a for compute resources
    "10.0.20.0/24",  # Private subnet AZ-1b for database replicas
    "10.0.30.0/24"   # Private subnet AZ-1c for additional services
  ]
}

# =============================================================================
# PROVIDER CONFIGURATIONS
# =============================================================================

# AWS Provider configuration for production with enhanced security
provider "aws" {
  region = var.aws_region
  
  # Enhanced security and compliance settings for financial services
  default_tags {
    tags = local.common_tags
  }
  
  # Skip metadata API check for faster initialization
  skip_metadata_api_check = false
  
  # Skip region validation for custom regions if needed
  skip_region_validation = false
  
  # Skip requesting account ID for faster initialization
  skip_requesting_account_id = false
}

# Data source to get EKS cluster authentication token
data "aws_eks_cluster_auth" "this" {
  name = module.compute.cluster_id
  
  depends_on = [module.compute]
}

# Kubernetes provider configuration for EKS cluster management
provider "kubernetes" {
  host                   = module.compute.cluster_endpoint
  cluster_ca_certificate = base64decode(module.compute.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.this.token
  
  # Additional configuration for production stability
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = [
      "eks",
      "get-token",
      "--cluster-name",
      module.compute.cluster_id,
      "--region",
      var.aws_region
    ]
  }
}

# =============================================================================
# CORE INFRASTRUCTURE MODULES
# =============================================================================

# Networking Module - Foundation VPC, subnets, gateways, and routing
module "networking" {
  source = "../../modules/networking"
  
  # Core networking configuration
  project_name                = var.project_name
  environment                = var.environment
  vpc_cidr_block             = local.vpc_cidr_block
  availability_zones         = var.availability_zones
  public_subnet_cidr_blocks  = local.public_subnet_cidrs
  private_subnet_cidr_blocks = local.private_subnet_cidrs
  
  # High availability configuration for production
  enable_nat_gateway  = true
  single_nat_gateway  = false  # Multiple NAT gateways for production HA
  
  # Compliance and governance tags
  tags = merge(local.common_tags, {
    Component = "networking"
    Tier      = "infrastructure"
    Purpose   = "vpc-foundation"
  })
}

# Security Module - Security groups, IAM roles, WAF, and compliance controls
module "security" {
  source = "../../modules/security"
  
  # Core security configuration
  environment = var.environment
  vpc_id      = module.networking.vpc_id
  
  # Enhanced security for production
  enable_waf            = true
  allowed_cidr_blocks   = ["0.0.0.0/0"]  # Restricted in WAF rules and security groups
  
  # Dependencies to ensure proper resource creation order
  depends_on = [module.networking]
}

# Compute Module - EKS cluster with multiple node groups for different workloads
module "compute" {
  source = "../../modules/compute"
  
  # Network configuration from networking module
  vpc_id          = module.networking.vpc_id
  vpc_cidr        = module.networking.vpc_cidr_block
  private_subnets = module.networking.private_subnet_ids
  public_subnets  = module.networking.public_subnet_ids
  
  # Core compute configuration
  environment = var.environment
  
  # Cluster configuration optimized for financial services
  cluster_version = "1.28"
  
  # Node group configurations for different workload types
  financial_services_config = {
    instance_types = ["m6i.2xlarge", "m6i.4xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size       = 3
    max_size       = 20
    desired_size   = 6
    disk_size      = 100
  }
  
  ai_ml_config = {
    instance_types = ["p4d.xlarge", "p4d.2xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size       = 0
    max_size       = 10
    desired_size   = 2
    disk_size      = 200
  }
  
  data_processing_config = {
    instance_types = ["r6i.4xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size       = 2
    max_size       = 10
    desired_size   = 2
    disk_size      = 150
  }
  
  # Security integration
  additional_security_group_ids = [module.security.microservices_sg_id]
  
  # Dependencies to ensure proper resource creation order
  depends_on = [module.networking, module.security]
}

# Database Module - Multi-database setup with PostgreSQL, MongoDB, Redis, and InfluxDB
module "database" {
  source = "../../modules/database"
  
  # Network and security configuration
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  database_sg_id        = module.security.database_sg_id
  
  # Environment configuration
  environment     = var.environment
  is_production   = true
  
  # PostgreSQL configuration for transactional data
  postgresql_instance_class     = "db.r6g.2xlarge"
  postgresql_allocated_storage  = 1000
  postgresql_max_storage        = 2000
  postgresql_backup_retention   = 35
  enable_postgresql_monitoring  = true
  
  # MongoDB DocumentDB configuration for document storage
  mongodb_instance_class    = "db.t4g.medium"
  mongodb_cluster_size     = 3
  mongodb_backup_retention = 35
  
  # Redis ElastiCache configuration for caching and sessions
  redis_node_type              = "cache.r6g.xlarge"
  redis_num_nodes             = 3
  redis_automatic_failover    = true
  redis_multi_az              = true
  redis_backup_retention      = 7
  
  # InfluxDB configuration for time-series data
  influxdb_instance_type = "m6i.xlarge"
  influxdb_storage_size  = 1000
  
  # Encryption and compliance
  enable_encryption_at_rest = true
  enable_encryption_in_transit = true
  enable_performance_insights = true
  
  # Monitoring and alerting
  enable_enhanced_monitoring = true
  monitoring_interval = 60
  
  # Common tags for compliance
  common_tags = merge(local.common_tags, {
    Component = "database"
    Tier      = "data"
    Purpose   = "data-persistence"
  })
  
  # Dependencies to ensure proper resource creation order
  depends_on = [module.networking, module.security]
}

# =============================================================================
# OUTPUTS FOR INTER-MODULE COMMUNICATION AND EXTERNAL REFERENCE
# =============================================================================

# Networking outputs for external reference
output "vpc_id" {
  description = "VPC ID of the production environment for external integrations"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the production VPC for network planning"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs for load balancer and public-facing resources"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs for application and database deployment"
  value       = module.networking.private_subnet_ids
}

output "availability_zones" {
  description = "List of availability zones used for high availability deployment"
  value       = module.networking.availability_zones
}

# Compute outputs for application deployment and monitoring
output "cluster_id" {
  description = "EKS cluster ID for Kubernetes operations and CI/CD integration"
  value       = module.compute.cluster_id
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint for Kubernetes API access"
  value       = module.compute.cluster_endpoint
  sensitive   = true
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data for secure API communication"
  value       = module.compute.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID for additional security rule management"
  value       = module.compute.cluster_security_group_id
}

output "node_group_arns" {
  description = "List of EKS node group ARNs for monitoring and scaling operations"
  value       = module.compute.node_group_arns
}

# Database outputs for application configuration
output "postgresql_endpoint" {
  description = "PostgreSQL database endpoint for application connectivity"
  value       = module.database.postgresql_endpoint
  sensitive   = true
}

output "mongodb_endpoint" {
  description = "MongoDB cluster endpoint for document database connectivity"
  value       = module.database.mongodb_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint for caching and session management"
  value       = module.database.redis_endpoint
  sensitive   = true
}

output "influxdb_endpoint" {
  description = "InfluxDB endpoint for time-series data ingestion and queries"
  value       = module.database.influxdb_endpoint
  sensitive   = true
}

# Security outputs for compliance and additional security configuration
output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN for API Gateway association and DDoS protection"
  value       = module.security.waf_web_acl_arn
}

output "api_gateway_security_group_id" {
  description = "API Gateway security group ID for external traffic management"
  value       = module.security.api_gateway_sg_id
}

output "microservices_security_group_id" {
  description = "Microservices security group ID for inter-service communication"
  value       = module.security.microservices_sg_id
}

output "database_security_group_id" {
  description = "Database security group ID for data layer access control"
  value       = module.security.database_sg_id
}

output "ec2_instance_profile_name" {
  description = "EC2 instance profile name for IAM role attachment to compute resources"
  value       = module.security.ec2_instance_profile_name
}

# Compliance and governance outputs
output "environment_metadata" {
  description = "Production environment metadata for compliance reporting and documentation"
  value = {
    environment           = var.environment
    region               = var.aws_region
    project_name         = var.project_name
    compliance_standards = "SOC2,PCI-DSS,GDPR,SOX"
    deployment_date      = timestamp()
    high_availability    = true
    multi_az_deployment  = true
    encryption_enabled   = true
    monitoring_enabled   = true
    backup_enabled       = true
    disaster_recovery    = true
  }
}

output "resource_tags" {
  description = "Common resource tags applied to all infrastructure for governance and cost allocation"
  value       = local.common_tags
}

# Integration outputs for external systems and CI/CD
output "terraform_state_config" {
  description = "Terraform state configuration for remote state reference by other environments"
  value = {
    bucket     = "financial-platform-terraform-state-prod"
    key        = "prod/terraform.tfstate"
    region     = var.aws_region
    lock_table = "terraform-state-lock-prod"
  }
}