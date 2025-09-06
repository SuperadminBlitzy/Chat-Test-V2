# Production Environment Configuration for Unified Financial Services Platform

# Regional Configuration
region = "us-east-1"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Cluster Configuration
cluster_name = "ufs-prod-eks-cluster"
cluster_version = "1.28"

# Network Configuration
vpc_cidr = "10.0.0.0/16"
private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

# Environment Tags
tags = {
  "Environment" = "production"
  "Project"     = "unified-financial-platform"
  "Compliance"  = "PCI-DSS,SOX,GDPR"
  "Owner"       = "financial-platform-team"
  "CostCenter"  = "financial-services"
  "Backup"      = "required"
  "Monitoring"  = "enhanced"
}

# EKS Node Groups Configuration
node_groups = {
  "financial_services" = {
    "instance_types" = ["m6i.4xlarge", "m6i.8xlarge"]
    "capacity_type"  = "ON_DEMAND"
    "min_size"       = 6
    "max_size"       = 50
    "desired_size"   = 10
    "disk_size"      = 100
    "labels" = {
      "workload-type" = "financial-services"
      "criticality"   = "high"
    }
    "taints" = []
    "subnets" = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  }
  "ai_ml_workloads" = {
    "instance_types" = ["p4d.2xlarge"]
    "capacity_type"  = "ON_DEMAND"
    "min_size"       = 2
    "max_size"       = 10
    "desired_size"   = 2
    "disk_size"      = 200
    "labels" = {
      "workload-type" = "ai-ml"
      "gpu-enabled"   = "true"
    }
    "taints" = [
      {
        "key"    = "nvidia.com/gpu"
        "value"  = "true"
        "effect" = "NO_SCHEDULE"
      }
    ]
    "subnets" = ["10.0.1.0/24", "10.0.2.0/24"]
  }
  "data_processing" = {
    "instance_types" = ["r6i.4xlarge"]
    "capacity_type"  = "ON_DEMAND"
    "min_size"       = 2
    "max_size"       = 15
    "desired_size"   = 4
    "disk_size"      = 150
    "labels" = {
      "workload-type" = "data-processing"
      "memory-optimized" = "true"
    }
    "taints" = []
    "subnets" = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  }
}

# RDS Configuration
database_instance_class = "db.r6g.4xlarge"
database_allocated_storage = 1000
database_max_allocated_storage = 5000
database_storage_type = "gp3"
database_storage_encrypted = true
database_multi_az = true
database_backup_retention_period = 35
database_backup_window = "03:00-04:00"
database_maintenance_window = "sun:04:00-sun:05:00"
database_deletion_protection = true
database_skip_final_snapshot = false
database_final_snapshot_identifier = "ufs-prod-final-snapshot"
database_engine_version = "16.1"
database_parameter_group_family = "postgres16"
database_monitoring_interval = 60
database_performance_insights_enabled = true
database_performance_insights_retention_period = 731

# Redis Configuration
redis_node_type = "cache.r6g.2xlarge"
redis_num_cache_clusters = 3
redis_port = 6379
redis_parameter_group_name = "default.redis7"
redis_engine_version = "7.0"
redis_maintenance_window = "sun:05:00-sun:06:00"
redis_snapshot_retention_limit = 7
redis_snapshot_window = "03:00-05:00"
redis_automatic_failover_enabled = true
redis_multi_az_enabled = true
redis_at_rest_encryption_enabled = true
redis_transit_encryption_enabled = true
redis_auth_token_enabled = true

# Security Configuration
enable_ddos_protection = true
waf_enabled = true
vpc_flow_logs_enabled = true
cloudtrail_enabled = true
config_enabled = true
guardduty_enabled = true
security_hub_enabled = true

# Load Balancer Configuration
alb_access_logs_enabled = true
alb_deletion_protection = true
alb_enable_http2 = true
alb_idle_timeout = 60
alb_internal = false

# Auto Scaling Configuration
cluster_autoscaler_enabled = true
metrics_server_enabled = true
vertical_pod_autoscaler_enabled = true

# Monitoring and Logging
cloudwatch_log_group_retention = 365
prometheus_enabled = true
grafana_enabled = true
elasticsearch_enabled = true
kibana_enabled = true
fluentd_enabled = true

# Backup Configuration
backup_vault_kms_key_id = "alias/aws/backup"
backup_plan_name = "ufs-prod-backup-plan"
backup_rule_name = "daily-backups"
backup_schedule = "cron(0 2 ? * * *)"
backup_start_window = 60
backup_completion_window = 180
backup_delete_after = 2555

# Certificate Configuration
acm_certificate_domain = "*.prod.unifiedfinancial.com"
acm_subject_alternative_names = [
  "prod.unifiedfinancial.com",
  "api.prod.unifiedfinancial.com",
  "app.prod.unifiedfinancial.com"
]

# Route53 Configuration
route53_zone_name = "prod.unifiedfinancial.com"
route53_private_zone = false

# KMS Configuration
kms_key_deletion_window = 30
kms_key_enable_key_rotation = true
kms_key_multi_region = true

# S3 Configuration
s3_bucket_versioning = true
s3_bucket_encryption = true
s3_bucket_public_access_block = true
s3_bucket_logging_enabled = true
s3_lifecycle_enabled = true
s3_intelligent_tiering_enabled = true

# IAM Configuration
iam_password_policy_minimum_length = 14
iam_password_policy_require_uppercase = true
iam_password_policy_require_lowercase = true
iam_password_policy_require_numbers = true
iam_password_policy_require_symbols = true
iam_password_policy_max_age = 90
iam_password_policy_reuse_prevention = 24

# Cost Management
cost_anomaly_detection_enabled = true
budget_limit_amount = 150000
budget_time_unit = "MONTHLY"
budget_time_period_start = "2024-01-01_00:00"
budget_cost_filters = {
  Service = ["Amazon Elastic Kubernetes Service", "Amazon RDS", "Amazon ElastiCache"]
}

# Disaster Recovery Configuration
dr_region = "us-west-2"
rds_cross_region_backup_enabled = true
s3_cross_region_replication_enabled = true

# Compliance Configuration
access_logging_enabled = true
data_residency_region = "us-east-1"
encryption_at_rest_enabled = true
encryption_in_transit_enabled = true
pci_dss_compliance_enabled = true
sox_compliance_enabled = true
gdpr_compliance_enabled = true

# Network Security
nat_gateway_enabled = true
vpc_endpoints_enabled = true
private_dns_enabled = true
network_acls_enabled = true

# Application Configuration
application_name = "unified-financial-services"
application_version = "v1.0.0"
environment_type = "production"
deployment_strategy = "blue-green"

# Secrets Management
secrets_manager_enabled = true
secrets_rotation_enabled = true
secrets_kms_key_id = "alias/secrets-manager-key"

# Container Registry
ecr_repository_name = "unified-financial-services"
ecr_image_tag_mutability = "IMMUTABLE"
ecr_scan_on_push = true
ecr_lifecycle_policy_enabled = true

# Service Mesh Configuration
istio_enabled = true
istio_version = "1.19"
jaeger_enabled = true
kiali_enabled = true

# Machine Learning Configuration
sagemaker_enabled = true
ml_inference_endpoints = 2
ml_training_instances = ["ml.p3.2xlarge"]

# API Gateway Configuration
api_gateway_enabled = true
api_gateway_stage = "prod"
api_gateway_throttling_rate_limit = 10000
api_gateway_throttling_burst_limit = 20000