# =============================================================================
# UNIFIED FINANCIAL SERVICES PLATFORM - TERRAFORM VARIABLES
# =============================================================================
# This file defines input variables for the Terraform configuration of the
# Unified Financial Services Platform. These variables allow for parameterization
# and customization of infrastructure for different environments and regions.
#
# The platform supports hybrid cloud deployment across AWS, Azure, and GCP
# with comprehensive security, compliance, and scalability features.
# =============================================================================

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
  default     = "dev"
  
  validation {
    condition = contains(["dev", "staging", "prod", "dr"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod, dr."
  }
}

variable "project_name" {
  description = "The name of the project."
  type        = string
  default     = "unified-financial-services"
  
  validation {
    condition = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "deployment_region" {
  description = "Primary deployment region identifier for global resources."
  type        = string
  default     = "us-east-1"
}

# =============================================================================
# MULTI-CLOUD CONFIGURATION
# =============================================================================

variable "aws_region" {
  description = "The primary AWS region for deployment."
  type        = string
  default     = "us-east-1"
}

variable "aws_secondary_region" {
  description = "The secondary AWS region for disaster recovery."
  type        = string
  default     = "us-west-2"
}

variable "azure_region" {
  description = "The primary Azure region for deployment."
  type        = string
  default     = "East US"
}

variable "azure_secondary_region" {
  description = "The secondary Azure region for disaster recovery."
  type        = string
  default     = "West US 2"
}

variable "gcp_region" {
  description = "The primary GCP region for deployment."
  type        = string
  default     = "us-central1"
}

variable "gcp_secondary_region" {
  description = "The secondary GCP region for disaster recovery."
  type        = string
  default     = "us-west1"
}

variable "enable_multi_cloud" {
  description = "Enable multi-cloud deployment across AWS, Azure, and GCP."
  type        = bool
  default     = true
}

# =============================================================================
# NETWORKING CONFIGURATION
# =============================================================================

variable "vpc_cidr_block" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition = can(cidrhost(var.vpc_cidr_block, 0))
    error_message = "VPC CIDR block must be a valid IPv4 CIDR."
  }
}

variable "public_subnet_cidr_blocks" {
  description = "A list of CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidr_blocks" {
  description = "A list of CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnet_cidr_blocks" {
  description = "A list of CIDR blocks for database subnets."
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets."
  type        = bool
  default     = true
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs for network monitoring."
  type        = bool
  default     = true
}

# =============================================================================
# KUBERNETES CLUSTER CONFIGURATION
# =============================================================================

variable "k8s_cluster_name" {
  description = "The name of the Kubernetes cluster."
  type        = string
  default     = "ufs-prod-cluster"
}

variable "k8s_cluster_version" {
  description = "The version of the Kubernetes cluster."
  type        = string
  default     = "1.28"
  
  validation {
    condition = can(regex("^1\\.(2[8-9]|[3-9][0-9])$", var.k8s_cluster_version))
    error_message = "Kubernetes version must be 1.28 or higher."
  }
}

variable "k8s_enable_private_cluster" {
  description = "Enable private Kubernetes cluster for enhanced security."
  type        = bool
  default     = true
}

variable "k8s_enable_network_policy" {
  description = "Enable Kubernetes network policies for micro-segmentation."
  type        = bool
  default     = true
}

variable "k8s_enable_pod_security_policy" {
  description = "Enable Pod Security Policy for container security."
  type        = bool
  default     = true
}

variable "k8s_master_authorized_networks" {
  description = "List of authorized networks that can access the Kubernetes master."
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = [
    {
      cidr_block   = "10.0.0.0/16"
      display_name = "VPC Network"
    }
  ]
}

# =============================================================================
# NODE POOL CONFIGURATIONS
# =============================================================================

variable "app_node_pool" {
  description = "Configuration for the application node pool."
  type = object({
    min_size       = number
    max_size       = number
    desired_size   = number
    instance_types = list(string)
    disk_size      = number
    disk_type      = string
  })
  default = {
    min_size       = 3
    max_size       = 20
    desired_size   = 6
    instance_types = ["m6i.2xlarge"]
    disk_size      = 100
    disk_type      = "gp3"
  }
}

variable "ai_ml_node_pool" {
  description = "Configuration for the AI/ML GPU node pool."
  type = object({
    min_size       = number
    max_size       = number
    desired_size   = number
    instance_types = list(string)
    disk_size      = number
    disk_type      = string
    enable_gpu     = bool
  })
  default = {
    min_size       = 0
    max_size       = 10
    desired_size   = 2
    instance_types = ["p4d.24xlarge"]
    disk_size      = 500
    disk_type      = "gp3"
    enable_gpu     = true
  }
}

variable "financial_services_node_pool" {
  description = "Configuration for financial services critical workloads."
  type = object({
    min_size       = number
    max_size       = number
    desired_size   = number
    instance_types = list(string)
    disk_size      = number
    disk_type      = string
    enable_spot    = bool
  })
  default = {
    min_size       = 5
    max_size       = 50
    desired_size   = 10
    instance_types = ["m6i.4xlarge", "m6i.8xlarge"]
    disk_size      = 200
    disk_type      = "gp3"
    enable_spot    = false
  }
}

variable "system_node_pool" {
  description = "Configuration for system and monitoring workloads."
  type = object({
    min_size       = number
    max_size       = number
    desired_size   = number
    instance_types = list(string)
    disk_size      = number
    disk_type      = string
  })
  default = {
    min_size       = 2
    max_size       = 10
    desired_size   = 3
    instance_types = ["m6i.large", "m6i.xlarge"]
    disk_size      = 50
    disk_type      = "gp3"
  }
}

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

variable "db_instance_class" {
  description = "The instance class for the PostgreSQL database."
  type        = string
  default     = "db.r6g.large"
}

variable "db_allocated_storage" {
  description = "The allocated storage for the database in GB."
  type        = number
  default     = 100
  
  validation {
    condition = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 65536
    error_message = "Database allocated storage must be between 20 and 65536 GB."
  }
}

variable "db_max_allocated_storage" {
  description = "The maximum allocated storage for auto-scaling in GB."
  type        = number
  default     = 1000
}

variable "db_storage_type" {
  description = "The storage type for the database."
  type        = string
  default     = "gp3"
  
  validation {
    condition = contains(["gp2", "gp3", "io1", "io2"], var.db_storage_type)
    error_message = "Database storage type must be one of: gp2, gp3, io1, io2."
  }
}

variable "db_engine_version" {
  description = "The engine version for PostgreSQL."
  type        = string
  default     = "16.4"
}

variable "db_username" {
  description = "The master username for the database."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The master password for the database."
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.db_password) >= 16
    error_message = "Database password must be at least 16 characters long."
  }
}

variable "db_backup_retention_period" {
  description = "The backup retention period in days."
  type        = number
  default     = 30
  
  validation {
    condition = var.db_backup_retention_period >= 7 && var.db_backup_retention_period <= 35
    error_message = "Backup retention period must be between 7 and 35 days."
  }
}

variable "db_backup_window" {
  description = "The preferred backup window."
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "The preferred maintenance window."
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "enable_multi_az" {
  description = "Flag to enable multi-AZ deployment for high availability."
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable Performance Insights for database monitoring."
  type        = bool
  default     = true
}

# =============================================================================
# MONGODB CONFIGURATION
# =============================================================================

variable "mongodb_instance_class" {
  description = "The instance class for MongoDB."
  type        = string
  default     = "M30"
}

variable "mongodb_cluster_type" {
  description = "The cluster type for MongoDB Atlas."
  type        = string
  default     = "REPLICASET"
  
  validation {
    condition = contains(["REPLICASET", "SHARDED"], var.mongodb_cluster_type)
    error_message = "MongoDB cluster type must be either REPLICASET or SHARDED."
  }
}

variable "mongodb_version" {
  description = "The version of MongoDB."
  type        = string
  default     = "7.0"
}

variable "mongodb_storage_size_gb" {
  description = "The storage size for MongoDB in GB."
  type        = number
  default     = 100
}

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================

variable "redis_node_type" {
  description = "The node type for Redis cluster."
  type        = string
  default     = "cache.r7g.large"
}

variable "redis_num_cache_clusters" {
  description = "The number of cache clusters for Redis."
  type        = number
  default     = 3
}

variable "redis_engine_version" {
  description = "The Redis engine version."
  type        = string
  default     = "7.2"
}

variable "redis_port" {
  description = "The port for Redis."
  type        = number
  default     = 6379
}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all storage."
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit for all communications."
  type        = bool
  default     = true
}

variable "kms_key_rotation_enabled" {
  description = "Enable automatic rotation of KMS keys."
  type        = bool
  default     = true
}

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager for sensitive data."
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Enable Web Application Firewall."
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "The ARN of the SSL certificate for HTTPS."
  type        = string
  default     = ""
}

# =============================================================================
# MONITORING AND LOGGING
# =============================================================================

variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch Logs for centralized logging."
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "The retention period for logs in days."
  type        = number
  default     = 90
  
  validation {
    condition = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch Logs retention value."
  }
}

variable "enable_prometheus" {
  description = "Enable Prometheus for metrics collection."
  type        = bool
  default     = true
}

variable "enable_grafana" {
  description = "Enable Grafana for metrics visualization."
  type        = bool
  default     = true
}

variable "enable_jaeger" {
  description = "Enable Jaeger for distributed tracing."
  type        = bool
  default     = true
}

# =============================================================================
# BACKUP AND DISASTER RECOVERY
# =============================================================================

variable "backup_schedule" {
  description = "The cron expression for backup schedule."
  type        = string
  default     = "cron(0 2 * * ? *)"
}

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup for disaster recovery."
  type        = bool
  default     = true
}

variable "disaster_recovery_rto_minutes" {
  description = "Recovery Time Objective (RTO) in minutes."
  type        = number
  default     = 15
}

variable "disaster_recovery_rpo_minutes" {
  description = "Recovery Point Objective (RPO) in minutes."
  type        = number
  default     = 5
}

# =============================================================================
# COMPLIANCE AND GOVERNANCE
# =============================================================================

variable "compliance_frameworks" {
  description = "List of compliance frameworks to enable."
  type        = list(string)
  default     = ["PCI-DSS", "SOX", "GDPR", "BASEL-III"]
  
  validation {
    condition = alltrue([
      for framework in var.compliance_frameworks :
      contains(["PCI-DSS", "SOX", "GDPR", "BASEL-III", "DORA", "MiCAR"], framework)
    ])
    error_message = "Compliance frameworks must be from the supported list."
  }
}

variable "enable_audit_logging" {
  description = "Enable comprehensive audit logging."
  type        = bool
  default     = true
}

variable "audit_log_retention_years" {
  description = "The retention period for audit logs in years."
  type        = number
  default     = 7
  
  validation {
    condition = var.audit_log_retention_years >= 5 && var.audit_log_retention_years <= 10
    error_message = "Audit log retention must be between 5 and 10 years."
  }
}

variable "enable_data_classification" {
  description = "Enable automatic data classification."
  type        = bool
  default     = true
}

# =============================================================================
# COST OPTIMIZATION
# =============================================================================

variable "enable_cost_optimization" {
  description = "Enable cost optimization features."
  type        = bool
  default     = true
}

variable "enable_spot_instances" {
  description = "Enable spot instances for non-critical workloads."
  type        = bool
  default     = false
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for compute resources."
  type        = bool
  default     = true
}

variable "auto_scaling_target_cpu" {
  description = "Target CPU utilization for auto-scaling."
  type        = number
  default     = 70
  
  validation {
    condition = var.auto_scaling_target_cpu >= 50 && var.auto_scaling_target_cpu <= 90
    error_message = "Auto-scaling target CPU must be between 50% and 90%."
  }
}

# =============================================================================
# BLOCKCHAIN CONFIGURATION
# =============================================================================

variable "enable_blockchain" {
  description = "Enable Hyperledger Fabric blockchain network."
  type        = bool
  default     = true
}

variable "blockchain_network_name" {
  description = "The name of the blockchain network."
  type        = string
  default     = "financial-services-network"
}

variable "blockchain_organizations" {
  description = "List of organizations in the blockchain network."
  type        = list(string)
  default     = ["bank1", "bank2", "regulator"]
}

variable "blockchain_channels" {
  description = "List of channels in the blockchain network."
  type        = list(string)
  default     = ["payments", "compliance", "settlements"]
}

# =============================================================================
# EXTERNAL INTEGRATIONS
# =============================================================================

variable "external_apis" {
  description = "Configuration for external API integrations."
  type = map(object({
    base_url     = string
    timeout      = number
    max_retries  = number
    enable_cache = bool
  }))
  default = {
    "stripe" = {
      base_url     = "https://api.stripe.com"
      timeout      = 30
      max_retries  = 3
      enable_cache = false
    }
    "plaid" = {
      base_url     = "https://production.plaid.com"
      timeout      = 15
      max_retries  = 3
      enable_cache = true
    }
    "experian" = {
      base_url     = "https://api.experian.com"
      timeout      = 45
      max_retries  = 2
      enable_cache = true
    }
  }
}

# =============================================================================
# TAGGING STRATEGY
# =============================================================================

variable "tags" {
  description = "A map of tags to apply to all resources."
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "unified-financial-services"
    Owner       = "platform-team"
    CostCenter  = "technology"
    Compliance  = "pci-dss,sox,gdpr"
    Backup      = "required"
    Monitoring  = "enhanced"
  }
}

variable "additional_tags" {
  description = "Additional tags to merge with the default tags."
  type        = map(string)
  default     = {}
}

# =============================================================================
# FEATURE FLAGS
# =============================================================================

variable "feature_flags" {
  description = "Feature flags for experimental or optional features."
  type = object({
    enable_ai_fraud_detection   = bool
    enable_real_time_analytics  = bool
    enable_automated_compliance = bool
    enable_quantum_encryption   = bool
    enable_edge_computing       = bool
  })
  default = {
    enable_ai_fraud_detection   = true
    enable_real_time_analytics  = true
    enable_automated_compliance = true
    enable_quantum_encryption   = false
    enable_edge_computing       = false
  }
}

# =============================================================================
# PERFORMANCE TUNING
# =============================================================================

variable "performance_tier" {
  description = "Performance tier for the deployment."
  type        = string
  default     = "high"
  
  validation {
    condition = contains(["basic", "standard", "high", "premium"], var.performance_tier)
    error_message = "Performance tier must be one of: basic, standard, high, premium."
  }
}

variable "connection_pool_size" {
  description = "Database connection pool size."
  type        = number
  default     = 20
  
  validation {
    condition = var.connection_pool_size >= 5 && var.connection_pool_size <= 100
    error_message = "Connection pool size must be between 5 and 100."
  }
}

variable "cache_ttl_seconds" {
  description = "Default cache TTL in seconds."
  type        = number
  default     = 900
}

# =============================================================================
# NOTIFICATION CONFIGURATION
# =============================================================================

variable "notification_endpoints" {
  description = "Configuration for notification endpoints."
  type = object({
    email_alerts    = list(string)
    slack_webhook   = string
    pagerduty_key   = string
    teams_webhook   = string
  })
  default = {
    email_alerts  = ["ops-team@company.com"]
    slack_webhook = ""
    pagerduty_key = ""
    teams_webhook = ""
  }
  sensitive = true
}

# =============================================================================
# VALIDATION AND CONSTRAINTS
# =============================================================================

variable "enable_resource_validation" {
  description = "Enable additional resource validation checks."
  type        = bool
  default     = true
}

variable "resource_naming_convention" {
  description = "Naming convention pattern for resources."
  type        = string
  default     = "${var.project_name}-${var.environment}-{resource-type}-{random-suffix}"
}

# =============================================================================
# END OF VARIABLES CONFIGURATION
# =============================================================================