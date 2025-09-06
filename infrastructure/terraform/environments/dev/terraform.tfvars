# Development Environment Configuration for Unified Financial Services Platform
# This file contains variable definitions for the dev environment infrastructure
# Values are configured for development and testing purposes

# ==============================================================================
# ENVIRONMENT CONFIGURATION
# ==============================================================================
aws_region  = "us-east-2"
environment = "dev"

# ==============================================================================
# EKS CLUSTER CONFIGURATION
# ==============================================================================
cluster_name    = "ufs-dev-eks"
cluster_version = "1.28"

# ==============================================================================
# NETWORKING CONFIGURATION
# ==============================================================================
vpc_cidr_block = "10.0.0.0/16"

# Subnet configurations for development environment
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
database_subnet_cidrs = ["10.0.100.0/24", "10.0.200.0/24"]

# Availability zones for multi-AZ deployment
availability_zones = ["us-east-2a", "us-east-2b"]

# ==============================================================================
# EKS NODE GROUP CONFIGURATION
# ==============================================================================
app_node_instance_type = "t3.medium"
app_node_min_size      = 1
app_node_max_size      = 3
app_node_desired_size  = 2

# Additional node group configurations for development
app_node_disk_size = 20
app_node_ami_type  = "AL2_x86_64"
app_node_capacity_type = "ON_DEMAND"

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================

# PostgreSQL Configuration (Primary transactional database)
db_instance_class      = "db.t3.medium"
db_allocated_storage   = 20
db_max_allocated_storage = 100
db_engine_version      = "16.1"
db_name               = "ufs_dev"
db_username           = "ufs_admin"
db_port               = 5432
db_multi_az           = false
db_publicly_accessible = false
db_backup_retention_period = 7
db_backup_window      = "03:00-04:00"
db_maintenance_window = "sun:04:00-sun:05:00"
db_deletion_protection = false

# MongoDB Configuration (Document storage and analytics)
mongodb_instance_class = "db.t3.small"
mongodb_engine_version = "7.0"
mongodb_port          = 27017

# ==============================================================================
# REDIS CACHE CONFIGURATION
# ==============================================================================
redis_node_type        = "cache.t3.small"
redis_num_cache_nodes  = 1
redis_engine_version   = "7.2"
redis_port            = 6379
redis_parameter_group_name = "default.redis7"
redis_subnet_group_name = "ufs-dev-redis-subnet-group"

# ==============================================================================
# KAFKA CONFIGURATION
# ==============================================================================
kafka_broker_instance_type    = "kafka.m5.large"
kafka_number_of_broker_nodes  = 1
kafka_kafka_version          = "3.6.0"
kafka_ebs_volume_size        = 100
kafka_client_subnets         = []

# ==============================================================================
# SECURITY CONFIGURATION
# ==============================================================================

# KMS Key Configuration
kms_key_deletion_window = 7
kms_enable_key_rotation = true

# Security Group Rules
enable_ssh_access = true
ssh_cidr_blocks  = ["10.0.0.0/16"]

# ==============================================================================
# MONITORING AND LOGGING
# ==============================================================================

# CloudWatch Configuration
enable_container_insights = true
log_retention_days       = 7

# Prometheus and Grafana
enable_prometheus = true
enable_grafana   = true
grafana_admin_password = "dev-password-change-me"

# ==============================================================================
# APPLICATION CONFIGURATION
# ==============================================================================

# Application Load Balancer
alb_idle_timeout    = 60
alb_deletion_protection = false

# Auto Scaling Configuration
enable_cluster_autoscaler = true
autoscaler_min_nodes     = 1
autoscaler_max_nodes     = 10

# ==============================================================================
# COMPLIANCE AND GOVERNANCE
# ==============================================================================

# Tagging Strategy
common_tags = {
  Environment = "dev"
  Project     = "unified-financial-platform"
  Owner       = "dev-team"
  CostCenter  = "development"
  Compliance  = "development-only"
  DataClass   = "internal"
  Backup      = "daily"
}

# Resource naming
resource_prefix = "ufs-dev"
resource_suffix = "dev"

# ==============================================================================
# FEATURE FLAGS
# ==============================================================================

# Enable/Disable specific features for development
enable_blockchain_network = true
enable_ai_ml_services    = true
enable_compliance_engine = true
enable_fraud_detection   = true

# Development specific features
enable_debug_logging     = true
enable_metrics_collection = true
enable_tracing          = true

# ==============================================================================
# BACKUP AND DISASTER RECOVERY
# ==============================================================================

# Backup Configuration
backup_retention_period = 7
enable_point_in_time_recovery = true

# Cross-region backup (disabled for dev to save costs)
enable_cross_region_backup = false
backup_destination_region = "us-west-2"

# ==============================================================================
# COST OPTIMIZATION
# ==============================================================================

# Instance scheduling for cost optimization
enable_instance_scheduling = true
instance_schedule_start   = "08:00"
instance_schedule_stop    = "18:00"
schedule_timezone        = "America/New_York"

# Spot instance configuration for non-critical workloads
enable_spot_instances    = true
spot_instance_percentage = 50

# ==============================================================================
# DEVELOPMENT SPECIFIC CONFIGURATION
# ==============================================================================

# Development tools and utilities
enable_bastion_host     = true
bastion_instance_type   = "t3.micro"

# Development database seeding
enable_db_seeding      = true
seed_data_source       = "development"

# Testing configuration
enable_load_testing    = true
enable_chaos_engineering = false

# Development SSL/TLS
ssl_certificate_arn = ""
enable_ssl_redirect = false

# ==============================================================================
# EXTERNAL INTEGRATIONS
# ==============================================================================

# Third-party service endpoints
stripe_webhook_endpoint = "https://dev-api.unifiedfs.com/webhooks/stripe"
plaid_webhook_endpoint  = "https://dev-api.unifiedfs.com/webhooks/plaid"

# API Gateway configuration
api_gateway_stage = "dev"
api_throttle_rate_limit = 1000
api_throttle_burst_limit = 2000

# ==============================================================================
# CONTAINER REGISTRY
# ==============================================================================

# ECR Configuration
ecr_image_tag_mutability = "MUTABLE"
ecr_scan_on_push        = true
ecr_lifecycle_policy    = true
ecr_max_image_count     = 10

# ==============================================================================
# SERVICE MESH CONFIGURATION
# ==============================================================================

# Istio Service Mesh
enable_service_mesh     = true
istio_version          = "1.19"
enable_mutual_tls      = true

# Traffic management
enable_traffic_splitting = true
canary_deployment_enabled = true