# =============================================================================
# TERRAFORM DATABASE MODULE VARIABLES
# Unified Financial Services Platform - Database Configuration
# =============================================================================
# This file defines input variables for the Terraform database module that
# provisions and configures the polyglot persistence infrastructure including:
# - PostgreSQL (Primary transactional database)
# - MongoDB (Document storage and analytics)
# - Redis (Caching and session storage)
# - InfluxDB (Time-series metrics and monitoring)
# =============================================================================

# -----------------------------------------------------------------------------
# GLOBAL CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod). Used for resource naming, configuration, and compliance validation."
  type        = string
  default     = "dev"
  
  validation {
    condition = contains(["dev", "development", "staging", "prod", "production", "test"], var.environment)
    error_message = "Environment must be one of: dev, development, staging, prod, production, test."
  }
}

variable "tags" {
  description = "A map of tags to apply to all database resources for resource management, cost allocation, and compliance tracking."
  type        = map(string)
  default     = {}
  
  validation {
    condition = can(var.tags)
    error_message = "Tags must be a valid map of string key-value pairs."
  }
}

# -----------------------------------------------------------------------------
# NETWORK CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "vpc_id" {
  description = "The ID of the VPC where the database resources will be deployed. Must be a valid VPC ID for security group and subnet association."
  type        = string
  
  validation {
    condition = can(regex("^vpc-[0-9a-f]{8,17}$", var.vpc_id))
    error_message = "VPC ID must be a valid AWS VPC identifier (vpc-xxxxxxxx)."
  }
}

variable "subnet_ids" {
  description = "A list of subnet IDs for database deployment across multiple availability zones. Minimum 2 subnets required for high availability."
  type        = list(string)
  
  validation {
    condition = length(var.subnet_ids) >= 2
    error_message = "At least 2 subnet IDs must be provided for high availability deployment."
  }
  
  validation {
    condition = alltrue([for id in var.subnet_ids : can(regex("^subnet-[0-9a-f]{8,17}$", id))])
    error_message = "All subnet IDs must be valid AWS subnet identifiers (subnet-xxxxxxxx)."
  }
}

variable "security_group_ids" {
  description = "A list of security group IDs to associate with database instances for network access control and compliance."
  type        = list(string)
  
  validation {
    condition = length(var.security_group_ids) > 0
    error_message = "At least one security group ID must be provided."
  }
  
  validation {
    condition = alltrue([for id in var.security_group_ids : can(regex("^sg-[0-9a-f]{8,17}$", id))])
    error_message = "All security group IDs must be valid AWS security group identifiers (sg-xxxxxxxx)."
  }
}

# -----------------------------------------------------------------------------
# POSTGRESQL DATABASE CONFIGURATION
# Primary transactional database for customer profiles, financial records
# -----------------------------------------------------------------------------

variable "postgres_instance_class" {
  description = "The instance class for PostgreSQL database. Controls compute resources and performance characteristics."
  type        = string
  default     = "db.t3.medium"
  
  validation {
    condition = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.postgres_instance_class))
    error_message = "PostgreSQL instance class must be a valid RDS instance type (e.g., db.t3.medium)."
  }
}

variable "postgres_allocated_storage" {
  description = "The allocated storage for PostgreSQL database in GB. Must meet minimum requirements for financial data retention."
  type        = number
  default     = 20
  
  validation {
    condition = var.postgres_allocated_storage >= 20 && var.postgres_allocated_storage <= 65536
    error_message = "PostgreSQL allocated storage must be between 20 GB and 65,536 GB."
  }
}

variable "postgres_engine_version" {
  description = "The PostgreSQL engine version. Must be a supported version for security and compliance requirements."
  type        = string
  default     = "16"
  
  validation {
    condition = can(regex("^(13|14|15|16)(\\.\\d+)?$", var.postgres_engine_version))
    error_message = "PostgreSQL engine version must be 13, 14, 15, or 16 (with optional minor version)."
  }
}

variable "postgres_database_name" {
  description = "The name of the PostgreSQL database for the Unified Financial Services Platform."
  type        = string
  default     = "ufs_db"
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_]{0,62}$", var.postgres_database_name))
    error_message = "PostgreSQL database name must start with a letter and contain only alphanumeric characters and underscores, max 63 characters."
  }
}

variable "postgres_username" {
  description = "The master username for PostgreSQL database. Must comply with security requirements for financial systems."
  type        = string
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_]{2,63}$", var.postgres_username))
    error_message = "PostgreSQL username must start with a letter, be 3-64 characters, and contain only alphanumeric characters and underscores."
  }
}

variable "postgres_password" {
  description = "The master password for PostgreSQL database. Must meet strong password requirements for financial compliance."
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.postgres_password) >= 12
    error_message = "PostgreSQL password must be at least 12 characters long to meet security requirements."
  }
}

variable "postgres_multi_az" {
  description = "Specifies if the PostgreSQL instance should be deployed in multiple availability zones for high availability."
  type        = bool
  default     = false
}

variable "postgres_backup_retention_period" {
  description = "The number of days to retain automated backups. Must meet regulatory requirements for data retention."
  type        = number
  default     = 7
  
  validation {
    condition = var.postgres_backup_retention_period >= 1 && var.postgres_backup_retention_period <= 35
    error_message = "PostgreSQL backup retention period must be between 1 and 35 days."
  }
}

# -----------------------------------------------------------------------------
# MONGODB CONFIGURATION
# Document storage for analytics data and customer interactions
# -----------------------------------------------------------------------------

variable "mongodb_instance_class" {
  description = "The instance class for MongoDB database. Controls compute resources for document storage workloads."
  type        = string
  default     = "db.t3.medium"
  
  validation {
    condition = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.mongodb_instance_class))
    error_message = "MongoDB instance class must be a valid DocumentDB instance type (e.g., db.t3.medium)."
  }
}

variable "mongodb_cluster_size" {
  description = "The number of instances in the MongoDB cluster for high availability and read scalability."
  type        = number
  default     = 3
  
  validation {
    condition = var.mongodb_cluster_size >= 1 && var.mongodb_cluster_size <= 16
    error_message = "MongoDB cluster size must be between 1 and 16 instances."
  }
}

variable "mongodb_engine_version" {
  description = "The MongoDB engine version. Must be compatible with financial services application requirements."
  type        = string
  default     = "7.0"
  
  validation {
    condition = can(regex("^(4\\.0|5\\.0|6\\.0|7\\.0)$", var.mongodb_engine_version))
    error_message = "MongoDB engine version must be 4.0, 5.0, 6.0, or 7.0."
  }
}

variable "mongodb_username" {
  description = "The master username for MongoDB database access and administration."
  type        = string
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_]{2,63}$", var.mongodb_username))
    error_message = "MongoDB username must start with a letter, be 3-64 characters, and contain only alphanumeric characters and underscores."
  }
}

variable "mongodb_password" {
  description = "The master password for MongoDB database. Must comply with enterprise security standards."
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.mongodb_password) >= 12
    error_message = "MongoDB password must be at least 12 characters long to meet security requirements."
  }
}

# -----------------------------------------------------------------------------
# REDIS CONFIGURATION
# In-memory caching and session storage for high-performance operations
# -----------------------------------------------------------------------------

variable "redis_node_type" {
  description = "The node type for Redis cluster instances. Determines memory and compute capacity for caching workloads."
  type        = string
  default     = "cache.t3.small"
  
  validation {
    condition = can(regex("^cache\\.[a-z0-9]+\\.[a-z0-9]+$", var.redis_node_type))
    error_message = "Redis node type must be a valid ElastiCache node type (e.g., cache.t3.small)."
  }
}

variable "redis_cluster_size" {
  description = "The number of cache nodes in the Redis cluster for horizontal scaling and availability."
  type        = number
  default     = 1
  
  validation {
    condition = var.redis_cluster_size >= 1 && var.redis_cluster_size <= 90
    error_message = "Redis cluster size must be between 1 and 90 nodes."
  }
}

variable "redis_engine_version" {
  description = "The Redis engine version. Must support required features for session management and caching."
  type        = string
  default     = "7.2"
  
  validation {
    condition = can(regex("^(6\\.2|7\\.0|7\\.2)$", var.redis_engine_version))
    error_message = "Redis engine version must be 6.2, 7.0, or 7.2."
  }
}

variable "redis_parameter_group_name" {
  description = "The name of the parameter group for Redis cluster configuration optimization."
  type        = string
  default     = "default.redis7"
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9.-]{0,254}$", var.redis_parameter_group_name))
    error_message = "Redis parameter group name must start with a letter and contain only alphanumeric characters, periods, and hyphens."
  }
}

# -----------------------------------------------------------------------------
# INFLUXDB CONFIGURATION
# Time-series database for financial metrics and performance monitoring
# -----------------------------------------------------------------------------

variable "influxdb_instance_type" {
  description = "The instance type for InfluxDB server. Optimized for time-series data ingestion and querying."
  type        = string
  default     = "db.t3.medium"
  
  validation {
    condition = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.influxdb_instance_type))
    error_message = "InfluxDB instance type must be a valid instance type (e.g., db.t3.medium)."
  }
}

variable "influxdb_engine_version" {
  description = "The InfluxDB engine version for time-series data processing and analytics."
  type        = string
  default     = "2.7"
  
  validation {
    condition = can(regex("^2\\.[0-9]+$", var.influxdb_engine_version))
    error_message = "InfluxDB engine version must be 2.x (e.g., 2.7)."
  }
}

variable "influxdb_username" {
  description = "The admin username for InfluxDB access and time-series data management."
  type        = string
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_]{2,63}$", var.influxdb_username))
    error_message = "InfluxDB username must start with a letter, be 3-64 characters, and contain only alphanumeric characters and underscores."
  }
}

variable "influxdb_password" {
  description = "The admin password for InfluxDB. Must meet security requirements for time-series data access."
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.influxdb_password) >= 12
    error_message = "InfluxDB password must be at least 12 characters long to meet security requirements."
  }
}

variable "influxdb_bucket_name" {
  description = "The default bucket name for InfluxDB time-series data organization and access control."
  type        = string
  default     = "ufs_metrics"
  
  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_-]{0,63}$", var.influxdb_bucket_name))
    error_message = "InfluxDB bucket name must start with a letter and contain only alphanumeric characters, underscores, and hyphens, max 64 characters."
  }
}

variable "influxdb_retention_period" {
  description = "The data retention period for InfluxDB in hours. Balances storage costs with monitoring requirements."
  type        = number
  default     = 720
  
  validation {
    condition = var.influxdb_retention_period >= 24 && var.influxdb_retention_period <= 8760
    error_message = "InfluxDB retention period must be between 24 hours (1 day) and 8760 hours (1 year)."
  }
}

# -----------------------------------------------------------------------------
# ADVANCED CONFIGURATION VARIABLES
# Additional settings for enterprise deployment and compliance
# -----------------------------------------------------------------------------

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all database instances to meet financial services compliance requirements."
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit for all database connections to ensure data security."
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable Performance Insights for database monitoring and optimization."
  type        = bool
  default     = true
}

variable "backup_window" {
  description = "The preferred backup window for database maintenance operations (UTC)."
  type        = string
  default     = "03:00-04:00"
  
  validation {
    condition = can(regex("^[0-2][0-9]:[0-5][0-9]-[0-2][0-9]:[0-5][0-9]$", var.backup_window))
    error_message = "Backup window must be in format HH:MM-HH:MM (e.g., 03:00-04:00)."
  }
}

variable "maintenance_window" {
  description = "The preferred maintenance window for database updates and patches."
  type        = string
  default     = "sun:04:00-sun:05:00"
  
  validation {
    condition = can(regex("^(mon|tue|wed|thu|fri|sat|sun):[0-2][0-9]:[0-5][0-9]-(mon|tue|wed|thu|fri|sat|sun):[0-2][0-9]:[0-5][0-9]$", var.maintenance_window))
    error_message = "Maintenance window must be in format ddd:HH:MM-ddd:HH:MM (e.g., sun:04:00-sun:05:00)."
  }
}

variable "monitoring_role_arn" {
  description = "The ARN of the IAM role for enhanced monitoring of database instances."
  type        = string
  default     = ""
  
  validation {
    condition = var.monitoring_role_arn == "" || can(regex("^arn:aws:iam::[0-9]{12}:role/[a-zA-Z0-9+=,.@_-]+$", var.monitoring_role_arn))
    error_message = "Monitoring role ARN must be a valid IAM role ARN or empty string."
  }
}

variable "kms_key_id" {
  description = "The KMS key ID for encrypting database instances and backups. Uses default key if not specified."
  type        = string
  default     = ""
  
  validation {
    condition = var.kms_key_id == "" || can(regex("^(arn:aws:kms:[a-z0-9-]+:[0-9]{12}:key/[a-f0-9-]{36}|[a-f0-9-]{36})$", var.kms_key_id))
    error_message = "KMS key ID must be a valid KMS key ARN or key ID, or empty string."
  }
}

# -----------------------------------------------------------------------------
# COMPLIANCE AND AUDIT CONFIGURATION
# Settings for regulatory compliance and audit requirements
# -----------------------------------------------------------------------------

variable "enable_deletion_protection" {
  description = "Enable deletion protection for production database instances to prevent accidental deletion."
  type        = bool
  default     = true
}

variable "enable_cloudwatch_logs_exports" {
  description = "List of log types to export to CloudWatch for compliance and monitoring."
  type        = list(string)
  default     = ["postgresql", "upgrade"]
  
  validation {
    condition = alltrue([for log in var.enable_cloudwatch_logs_exports : contains(["postgresql", "upgrade", "error", "general", "slowquery"], log)])
    error_message = "CloudWatch log exports must be valid log types (postgresql, upgrade, error, general, slowquery)."
  }
}

variable "compliance_tags" {
  description = "Additional tags for compliance tracking and regulatory requirements."
  type        = map(string)
  default = {
    "Compliance"     = "PCI-DSS,SOX,GDPR"
    "DataClass"      = "Financial"
    "BackupRequired" = "true"
    "Monitoring"     = "required"
  }
}