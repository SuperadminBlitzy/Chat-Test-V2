# =============================================================================
# Unified Financial Services Platform - Main Terraform Configuration
# =============================================================================
# This is the root Terraform configuration file that orchestrates the deployment
# of the entire infrastructure for the Unified Financial Services Platform.
# It provisions networking, compute, database, and security resources across
# multiple cloud providers (AWS, Azure, GCP) to support financial services
# compliance requirements (SOC2, PCI-DSS, GDPR) and microservices architecture.
# =============================================================================

terraform {
  required_version = ">= 1.6"
  
  # Multi-cloud backend configuration for state management
  backend "s3" {
    bucket         = var.terraform_state_bucket
    key            = var.terraform_state_key
    region         = var.aws_region
    encrypt        = true
    dynamodb_table = var.terraform_state_lock_table
    
    # Additional security configurations for financial services compliance
    versioning                = true
    server_side_encryption_configuration {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm     = "aws:kms"
          kms_master_key_id = var.terraform_state_kms_key_id
        }
        bucket_key_enabled = true
      }
    }
  }
  
  # Required providers for multi-cloud deployment
  required_providers {
    # AWS Provider - Primary cloud platform for core financial services
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    
    # Azure Provider - Secondary cloud for enterprise integration and compliance
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    
    # Google Cloud Provider - Analytics and machine learning workloads
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    
    # Kubernetes Provider - Container orchestration management
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    
    # Helm Provider - Kubernetes application deployment
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    
    # Random Provider - Secure resource naming and password generation
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    
    # TLS Provider - Certificate and key management
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

# =============================================================================
# DATA SOURCES FOR DYNAMIC CONFIGURATION
# =============================================================================

# Current AWS caller identity for account-specific configurations
data "aws_caller_identity" "current" {}

# Current AWS region for region-specific configurations
data "aws_region" "current" {}

# Available AWS availability zones for multi-AZ deployment
data "aws_availability_zones" "available" {
  state = "available"
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

# =============================================================================
# LOCAL VALUES FOR COMPUTED CONFIGURATIONS
# =============================================================================

locals {
  # Common tags applied to all resources for compliance and governance
  common_tags = merge(
    var.tags,
    {
      Project                = "unified-financial-services"
      Environment           = var.environment
      ManagedBy             = "terraform"
      Owner                 = "platform-engineering"
      CostCenter            = "technology"
      Compliance            = "SOC2,PCI-DSS,GDPR,HIPAA"
      DataClassification    = "confidential"
      BackupRequired        = "true"
      MonitoringRequired    = "true"
      SecurityLevel         = "financial-services"
      DeploymentDate        = timestamp()
      TerraformVersion      = ">=1.6"
      LastUpdated          = timestamp()
    }
  )
  
  # Dynamic availability zones calculation for multi-AZ deployment
  availability_zones = var.availability_zones != null ? var.availability_zones : slice(data.aws_availability_zones.available.names, 0, min(3, length(data.aws_availability_zones.available.names)))
  
  # Environment-specific resource sizing
  is_production = var.environment == "prod"
  
  # Cluster naming with environment and random suffix for uniqueness
  cluster_name = "${var.cluster_name}-${var.environment}"
  
  # Multi-cloud region mapping for disaster recovery
  multi_cloud_regions = {
    aws   = var.aws_region
    azure = var.azure_region
    gcp   = var.gcp_region
  }
  
  # Security configuration based on environment
  security_config = {
    enable_waf                = local.is_production ? true : var.enable_waf
    enable_guardduty         = local.is_production ? true : false
    enable_config            = local.is_production ? true : false
    enable_cloudtrail        = true
    enable_security_hub      = local.is_production ? true : false
    enable_inspector         = local.is_production ? true : false
  }
  
  # Network configuration with environment-specific sizing
  network_config = {
    vpc_cidr_block = var.vpc_cidr_block
    public_subnets = length(var.public_subnets) > 0 ? var.public_subnets : [
      cidrsubnet(var.vpc_cidr_block, 8, 1),
      cidrsubnet(var.vpc_cidr_block, 8, 2),
      cidrsubnet(var.vpc_cidr_block, 8, 3)
    ]
    private_subnets = length(var.private_subnets) > 0 ? var.private_subnets : [
      cidrsubnet(var.vpc_cidr_block, 8, 11),
      cidrsubnet(var.vpc_cidr_block, 8, 12),
      cidrsubnet(var.vpc_cidr_block, 8, 13)
    ]
  }
}

# =============================================================================
# PROVIDER CONFIGURATIONS
# =============================================================================

# AWS Provider Configuration - Primary cloud platform
provider "aws" {
  region = var.aws_region
  
  # Enhanced security configurations for financial services
  default_tags {
    tags = local.common_tags
  }
  
  # Assume role configuration for cross-account deployments
  assume_role {
    role_arn = var.aws_assume_role_arn != "" ? var.aws_assume_role_arn : null
  }
  
  # Enhanced security settings
  skip_region_validation      = false
  skip_credentials_validation = false
  skip_requesting_account_id  = false
}

# Azure Provider Configuration - Enterprise integration and compliance
provider "azurerm" {
  # Required features block for Azure provider v3.x
  features {
    # Key Vault configuration for financial services security
    key_vault {
      purge_soft_delete_on_destroy    = local.is_production ? false : true
      recover_soft_deleted_key_vaults = true
    }
    
    # Resource group configuration
    resource_group {
      prevent_deletion_if_contains_resources = local.is_production ? true : false
    }
    
    # Virtual machine configuration
    virtual_machine {
      delete_os_disk_on_deletion     = local.is_production ? false : true
      graceful_shutdown              = true
      skip_shutdown_and_force_delete = false
    }
  }
  
  # Subscription and tenant configuration
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret
}

# Google Cloud Provider Configuration - Analytics and ML workloads
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
  
  # Service account configuration for authentication
  credentials = var.gcp_credentials_file != "" ? file(var.gcp_credentials_file) : null
  
  # Request timeout for long-running operations
  request_timeout = "60s"
  
  # Billing project for quota and billing management
  billing_project = var.gcp_billing_project != "" ? var.gcp_billing_project : var.gcp_project_id
}

# Kubernetes Provider Configuration - Container orchestration
provider "kubernetes" {
  host                   = module.compute.cluster_endpoint
  cluster_ca_certificate = base64decode(module.compute.cluster_ca_certificate)
  token                  = module.compute.cluster_token
  
  # Enhanced configuration for financial services
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", local.cluster_name, "--region", var.aws_region]
  }
}

# Helm Provider Configuration - Application deployment
provider "helm" {
  kubernetes {
    host                   = module.compute.cluster_endpoint
    cluster_ca_certificate = base64decode(module.compute.cluster_ca_certificate)
    token                  = module.compute.cluster_token
    
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", local.cluster_name, "--region", var.aws_region]
    }
  }
  
  # Repository configuration for financial services charts
  registry {
    url      = "oci://registry.hub.docker.com"
    username = var.docker_registry_username
    password = var.docker_registry_password
  }
}

# =============================================================================
# RANDOM RESOURCES FOR UNIQUE NAMING
# =============================================================================

# Random suffix for unique resource naming across environments
resource "random_id" "deployment_id" {
  byte_length = 4
  
  keepers = {
    environment = var.environment
    project     = "unified-financial-services"
    region      = var.aws_region
  }
}

# =============================================================================
# CORE INFRASTRUCTURE MODULES
# =============================================================================

# Networking Module - VPC, Subnets, Gateways, and Network Security
module "networking" {
  source = "./modules/networking"
  
  # Project identification
  project_name = "ufs"
  environment  = var.environment
  
  # Network configuration with financial services requirements
  vpc_cidr_block              = var.vpc_cidr_block
  availability_zones          = local.availability_zones
  public_subnet_cidr_blocks   = local.network_config.public_subnets
  private_subnet_cidr_blocks  = local.network_config.private_subnets
  
  # High availability configuration
  enable_nat_gateway  = var.enable_nat_gateway
  single_nat_gateway  = local.is_production ? false : var.single_nat_gateway
  
  # Enhanced networking features for financial services
  enable_dns_hostnames = true
  enable_dns_support   = true
  enable_vpn_gateway   = var.enable_vpn_gateway
  
  # Network security configurations
  enable_flow_logs = true
  flow_logs_retention_in_days = local.is_production ? 365 : 30
  
  # Resource tagging for compliance and cost allocation
  tags = merge(local.common_tags, {
    Module    = "networking"
    Component = "core-infrastructure"
    Purpose   = "network-foundation"
  })
  
  depends_on = [random_id.deployment_id]
}

# Compute Module - EKS Clusters and Node Groups
module "compute" {
  source = "./modules/compute"
  
  # Cluster configuration
  environment     = var.environment
  cluster_name    = local.cluster_name
  cluster_version = var.k8s_version
  
  # Network configuration from networking module
  vpc_id      = module.networking.vpc_id
  vpc_cidr    = module.networking.vpc_cidr_block
  private_subnets = module.networking.private_subnet_ids
  public_subnets  = module.networking.public_subnet_ids
  
  # Node group configurations for different workload types
  node_groups = merge(var.node_groups, {
    # Financial services microservices - compute optimized
    financial_services = {
      instance_types = local.is_production ? ["m6i.2xlarge", "m6i.4xlarge"] : ["m6i.large", "m6i.xlarge"]
      capacity_type  = local.is_production ? "ON_DEMAND" : "SPOT"
      min_size       = local.is_production ? 3 : 1
      max_size       = local.is_production ? 20 : 5
      desired_size   = local.is_production ? 6 : 2
      
      # Kubernetes labels for workload placement
      labels = {
        workload-type = "financial-services"
        node-class    = "compute-optimized"
        compliance    = "pci-dss"
      }
      
      # Taints for dedicated workloads
      taints = [{
        key    = "dedicated"
        value  = "financial-services"
        effect = "NO_SCHEDULE"
      }]
    }
    
    # AI/ML workloads - GPU enabled
    ai_ml_workloads = {
      instance_types = local.is_production ? ["p4d.xlarge", "p4d.2xlarge"] : ["g4dn.xlarge"]
      capacity_type  = "ON_DEMAND"
      min_size       = 0
      max_size       = local.is_production ? 10 : 3
      desired_size   = local.is_production ? 2 : 0
      
      labels = {
        workload-type = "ai-ml"
        node-class    = "gpu-enabled"
        accelerator   = "nvidia-tesla"
      }
      
      taints = [{
        key    = "nvidia.com/gpu"
        value  = "present"
        effect = "NO_SCHEDULE"
      }]
    }
    
    # Data processing workloads - memory optimized
    data_processing = {
      instance_types = local.is_production ? ["r6i.2xlarge", "r6i.4xlarge"] : ["r6i.large"]
      capacity_type  = local.is_production ? "ON_DEMAND" : "SPOT"
      min_size       = local.is_production ? 2 : 0
      max_size       = local.is_production ? 10 : 3
      desired_size   = local.is_production ? 3 : 1
      
      labels = {
        workload-type = "data-processing"
        node-class    = "memory-optimized"
        purpose       = "analytics"
      }
    }
  })
  
  # Security configurations
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = !local.is_production
  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs
  
  # Logging and monitoring
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  # Encryption configuration
  cluster_encryption_config = [{
    provider_key_arn = var.cluster_kms_key_id
    resources        = ["secrets"]
  }]
  
  # Add-ons configuration
  cluster_addons = {
    coredns = {
      addon_version     = "v1.10.1-eksbuild.5"
      resolve_conflicts = "OVERWRITE"
    }
    kube-proxy = {
      addon_version     = "v1.28.2-eksbuild.2"
      resolve_conflicts = "OVERWRITE"
    }
    vpc-cni = {
      addon_version     = "v1.15.4-eksbuild.1"
      resolve_conflicts = "OVERWRITE"
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET      = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      addon_version     = "v1.24.0-eksbuild.1"
      resolve_conflicts = "OVERWRITE"
    }
  }
  
  # Resource tagging
  tags = merge(local.common_tags, {
    Module    = "compute"
    Component = "kubernetes-infrastructure"
    Purpose   = "container-orchestration"
  })
  
  depends_on = [module.networking]
}

# Database Module - Multi-database deployment for financial services
module "database" {
  source = "./modules/database"
  
  # Environment configuration
  environment      = var.environment
  is_production   = local.is_production
  
  # Network configuration
  vpc_id              = module.networking.vpc_id
  private_subnet_ids  = module.networking.private_subnet_ids
  availability_zones  = local.availability_zones
  
  # PostgreSQL configuration for transactional data
  postgresql_instance_class     = var.db_instance_class
  postgresql_allocated_storage  = local.is_production ? 1000 : 100
  postgresql_max_allocated_storage = local.is_production ? 10000 : 1000
  postgresql_backup_retention_period = local.is_production ? 35 : 7
  postgresql_multi_az          = local.is_production
  postgresql_storage_encrypted = true
  postgresql_kms_key_id       = var.database_kms_key_id
  
  # PostgreSQL parameters for financial workloads
  postgresql_parameters = {
    shared_preload_libraries = "pg_stat_statements,pg_hint_plan"
    max_connections         = local.is_production ? "500" : "100"
    shared_buffers          = "{DBInstanceClassMemory/32768}"
    effective_cache_size    = "{DBInstanceClassMemory/16384}"
    work_mem               = "32768"  # 32MB for complex financial queries
    maintenance_work_mem   = "2097152"  # 2GB for maintenance
    
    # Logging for compliance
    log_statement           = local.is_production ? "mod" : "all"
    log_min_duration_statement = "1000"
    log_lock_waits         = "1"
    log_checkpoints        = "1"
    log_connections        = "1"
    log_disconnections     = "1"
    
    # Security settings
    ssl                    = "1"
    ssl_ciphers           = "HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA"
  }
  
  # MongoDB configuration for document storage
  mongodb_instance_class = local.is_production ? "db.t4g.large" : "db.t4g.medium"
  mongodb_cluster_size   = local.is_production ? 3 : 1
  mongodb_backup_retention_period = local.is_production ? 35 : 7
  mongodb_storage_encrypted = true
  mongodb_kms_key_id = var.database_kms_key_id
  
  # MongoDB parameters
  mongodb_parameters = {
    audit_logs     = "enabled"
    profiler       = "enabled"
    profiler_threshold_ms = "100"
    tls           = "enabled"
  }
  
  # Redis configuration for caching and sessions
  redis_node_type        = local.is_production ? "cache.r7g.large" : "cache.t4g.medium"
  redis_num_cache_nodes  = local.is_production ? 3 : 1
  redis_automatic_failover_enabled = local.is_production
  redis_multi_az_enabled = local.is_production
  redis_at_rest_encryption_enabled = true
  redis_transit_encryption_enabled = true
  redis_kms_key_id = var.database_kms_key_id
  redis_snapshot_retention_limit = local.is_production ? 7 : 1
  
  # Redis parameters for financial services
  redis_parameters = {
    maxmemory-policy = "allkeys-lru"
    timeout         = "300"
    tcp-keepalive   = "60"
    slowlog-log-slower-than = "10000"
    slowlog-max-len = "1024"
  }
  
  # InfluxDB configuration for time-series data
  influxdb_instance_type = local.is_production ? "m6i.2xlarge" : "t3.large"
  influxdb_volume_size   = local.is_production ? 1000 : 100
  influxdb_volume_type   = "gp3"
  influxdb_volume_encrypted = true
  influxdb_kms_key_id   = var.database_kms_key_id
  
  # Database credentials management
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  # Monitoring and alerting
  enable_performance_insights = local.is_production
  performance_insights_retention_period = local.is_production ? 7 : null
  enable_enhanced_monitoring = local.is_production
  monitoring_interval = local.is_production ? 60 : 0
  
  # Backup and disaster recovery
  backup_window      = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  
  # Security group configuration
  vpc_security_group_ids = [module.security.database_sg_id]
  
  # Resource tagging
  common_tags = merge(local.common_tags, {
    Module    = "database"
    Component = "data-persistence"
    Purpose   = "financial-data-storage"
  })
  
  depends_on = [module.networking, module.security]
}

# Security Module - Comprehensive security controls and compliance
module "security" {
  source = "./modules/security"
  
  # Environment configuration
  environment = var.environment
  
  # Network configuration
  vpc_id = module.networking.vpc_id
  
  # WAF configuration for API protection
  enable_waf = local.security_config.enable_waf
  allowed_cidr_blocks = var.allowed_cidr_blocks
  
  # Security group configurations
  enable_flow_logs = true
  flow_logs_retention_in_days = local.is_production ? 365 : 30
  
  # Compliance configurations
  enable_config_rules = local.security_config.enable_config
  enable_guardduty   = local.security_config.enable_guardduty
  enable_security_hub = local.security_config.enable_security_hub
  enable_inspector   = local.security_config.enable_inspector
  
  # CloudTrail configuration for audit logging
  enable_cloudtrail = local.security_config.enable_cloudtrail
  cloudtrail_s3_bucket_name = var.cloudtrail_s3_bucket_name
  cloudtrail_kms_key_id = var.cloudtrail_kms_key_id
  
  # Secrets management configuration
  enable_secrets_manager = true
  secrets_kms_key_id = var.secrets_kms_key_id
  
  # Certificate management
  enable_acm = true
  domain_name = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  
  # Resource tagging
  tags = merge(local.common_tags, {
    Module    = "security"
    Component = "security-controls"
    Purpose   = "compliance-and-protection"
  })
  
  depends_on = [module.networking]
}

# =============================================================================
# KUBERNETES APPLICATIONS AND CONFIGURATIONS
# =============================================================================

# Core platform services deployment using Helm
resource "helm_release" "istio_base" {
  count = var.enable_istio ? 1 : 0
  
  name       = "istio-base"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "base"
  namespace  = "istio-system"
  version    = var.istio_version
  
  create_namespace = true
  
  values = [
    yamlencode({
      global = {
        istioNamespace = "istio-system"
        meshID        = "mesh1"
        network       = "network1"
      }
    })
  ]
  
  depends_on = [module.compute]
}

resource "helm_release" "istio_control_plane" {
  count = var.enable_istio ? 1 : 0
  
  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"
  namespace  = "istio-system"
  version    = var.istio_version
  
  values = [
    yamlencode({
      global = {
        meshID  = "mesh1"
        network = "network1"
      }
      pilot = {
        env = {
          EXTERNAL_ISTIOD = false
        }
      }
    })
  ]
  
  depends_on = [helm_release.istio_base]
}

# Prometheus monitoring stack
resource "helm_release" "prometheus" {
  count = var.enable_monitoring ? 1 : 0
  
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = var.prometheus_version
  
  create_namespace = true
  
  values = [
    yamlencode({
      prometheus = {
        prometheusSpec = {
          retention = local.is_production ? "90d" : "30d"
          storageSpec = {
            volumeClaimTemplate = {
              spec = {
                storageClassName = "gp3"
                accessModes      = ["ReadWriteOnce"]
                resources = {
                  requests = {
                    storage = local.is_production ? "100Gi" : "20Gi"
                  }
                }
              }
            }
          }
        }
      }
      grafana = {
        adminPassword = var.grafana_admin_password
        persistence = {
          enabled      = true
          storageClassName = "gp3"
          size         = "10Gi"
        }
      }
    })
  ]
  
  depends_on = [module.compute]
}

# =============================================================================
# OUTPUT VALUES
# =============================================================================

# Networking outputs
output "vpc_id" {
  description = "ID of the created VPC for the financial platform"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = module.networking.internet_gateway_id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = module.networking.nat_gateway_ids
}

# Compute outputs
output "cluster_id" {
  description = "ID of the EKS cluster"
  value       = module.compute.cluster_id
}

output "cluster_arn" {
  description = "ARN of the EKS cluster"
  value       = module.compute.cluster_arn
}

output "cluster_endpoint" {
  description = "Endpoint URL of the EKS cluster"
  value       = module.compute.cluster_endpoint
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "Security group ID of the EKS cluster"
  value       = module.compute.cluster_security_group_id
}

output "cluster_ca_certificate" {
  description = "Base64 encoded certificate data for the EKS cluster"
  value       = module.compute.cluster_ca_certificate
  sensitive   = true
}

output "cluster_token" {
  description = "Authentication token for the EKS cluster"
  value       = module.compute.cluster_token
  sensitive   = true
}

output "node_groups" {
  description = "EKS node group configurations"
  value       = module.compute.node_groups
}

# Database outputs
output "postgresql_endpoint" {
  description = "PostgreSQL database endpoint"
  value       = module.database.postgresql_endpoint
  sensitive   = true
}

output "postgresql_port" {
  description = "PostgreSQL database port"
  value       = module.database.postgresql_port
}

output "mongodb_endpoint" {
  description = "MongoDB cluster endpoint"
  value       = module.database.mongodb_endpoint
  sensitive   = true
}

output "mongodb_port" {
  description = "MongoDB cluster port"
  value       = module.database.mongodb_port
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.database.redis_endpoint
  sensitive   = true
}

output "redis_port" {
  description = "Redis cluster port"
  value       = module.database.redis_port
}

output "influxdb_endpoint" {
  description = "InfluxDB instance endpoint"
  value       = module.database.influxdb_endpoint
  sensitive   = true
}

# Security outputs
output "api_gateway_security_group_id" {
  description = "Security group ID for API Gateway"
  value       = module.security.api_gateway_sg_id
}

output "microservices_security_group_id" {
  description = "Security group ID for microservices"
  value       = module.security.microservices_sg_id
}

output "database_security_group_id" {
  description = "Security group ID for databases"
  value       = module.security.database_sg_id
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = module.security.waf_web_acl_arn
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile"
  value       = module.security.ec2_instance_profile_name
}

# Deployment metadata
output "deployment_id" {
  description = "Unique deployment identifier"
  value       = random_id.deployment_id.hex
}

output "deployment_region" {
  description = "AWS region where resources are deployed"
  value       = data.aws_region.current.name
}

output "deployment_account_id" {
  description = "AWS account ID where resources are deployed"
  value       = data.aws_caller_identity.current.account_id
  sensitive   = true
}

output "common_tags" {
  description = "Common tags applied to all resources"
  value       = local.common_tags
}

# Multi-cloud configuration summary
output "multi_cloud_configuration" {
  description = "Multi-cloud deployment configuration summary"
  value = {
    aws = {
      region           = var.aws_region
      account_id       = data.aws_caller_identity.current.account_id
      vpc_id          = module.networking.vpc_id
      cluster_name    = local.cluster_name
    }
    azure = {
      subscription_id = var.azure_subscription_id
      region         = var.azure_region
      enabled        = var.enable_azure_integration
    }
    gcp = {
      project_id = var.gcp_project_id
      region     = var.gcp_region
      enabled    = var.enable_gcp_integration
    }
  }
}

# Compliance and security summary
output "compliance_summary" {
  description = "Compliance and security configuration summary"
  value = {
    environment           = var.environment
    is_production        = local.is_production
    compliance_standards = "SOC2,PCI-DSS,GDPR,HIPAA"
    security_features = {
      waf_enabled          = local.security_config.enable_waf
      encryption_at_rest   = true
      encryption_in_transit = true
      multi_az_deployment  = local.is_production
      backup_enabled       = true
      monitoring_enabled   = true
      audit_logging        = true
    }
  }
}