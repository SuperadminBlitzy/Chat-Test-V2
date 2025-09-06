# ==============================================================================
# CORE INFRASTRUCTURE VARIABLES
# ==============================================================================

variable "vpc_id" {
  description = "The ID of the VPC where the security resources will be created."
  type        = string
  validation {
    condition     = can(regex("^vpc-", var.vpc_id))
    error_message = "The VPC ID must be a valid AWS VPC identifier starting with 'vpc-'."
  }
}

variable "project_name" {
  description = "The name of the project, used for tagging resources."
  type        = string
  default     = "unified-financial-services"
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "The environment (e.g., dev, staging, prod) for which the resources are being created."
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "common_tags" {
  description = "A map of common tags to apply to all security resources."
  type        = map(string)
  default     = {}
}

# ==============================================================================
# APPLICATION SECURITY GROUP VARIABLES
# ==============================================================================

variable "app_security_group_name" {
  description = "Name for the application security group."
  type        = string
  default     = "app-sg"
}

variable "app_security_group_description" {
  description = "Description for the application security group."
  type        = string
  default     = "Security group for the application layer"
}

variable "app_ingress_rules" {
  description = "A list of ingress rules for the application security group."
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = []
}

variable "app_egress_rules" {
  description = "A list of egress rules for the application security group."
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow all outbound traffic"
    }
  ]
}

# ==============================================================================
# DATABASE SECURITY GROUP VARIABLES
# ==============================================================================

variable "db_security_group_name" {
  description = "Name for the database security group."
  type        = string
  default     = "db-sg"
}

variable "db_security_group_description" {
  description = "Description for the database security group."
  type        = string
  default     = "Security group for the database layer"
}

variable "db_ingress_rules" {
  description = "A list of ingress rules for the database security group. Expects traffic from the app security group."
  type = list(object({
    from_port               = number
    to_port                 = number
    protocol                = string
    source_security_group_id = string
    description             = string
  }))
  default = []
}

# ==============================================================================
# WEB/DMZ SECURITY GROUP VARIABLES
# ==============================================================================

variable "web_security_group_name" {
  description = "Name for the web/DMZ security group."
  type        = string
  default     = "web-sg"
}

variable "web_security_group_description" {
  description = "Description for the web/DMZ security group."
  type        = string
  default     = "Security group for the web/DMZ layer"
}

variable "web_ingress_rules" {
  description = "A list of ingress rules for the web security group, typically allowing HTTP/HTTPS from the internet."
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTP traffic"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTPS traffic"
    }
  ]
}

# ==============================================================================
# WEB APPLICATION FIREWALL (WAF) VARIABLES
# ==============================================================================

variable "enable_waf" {
  description = "Flag to enable or disable the Web Application Firewall."
  type        = bool
  default     = true
}

variable "waf_name" {
  description = "Name for the WAF WebACL."
  type        = string
  default     = "ufs-waf"
}

variable "waf_managed_rules" {
  description = "A list of managed rule groups to associate with the WAF."
  type        = list(string)
  default = [
    "AWSManagedRulesCommonRuleSet",
    "AWSManagedRulesAmazonIpReputationList",
    "AWSManagedRulesKnownBadInputsRuleSet",
    "AWSManagedRulesSQLiRuleSet"
  ]
}

variable "waf_custom_rules" {
  description = "A list of custom WAF rules for financial services compliance."
  type = list(object({
    name     = string
    priority = number
    action   = string
    statement = object({
      byte_match_statement = optional(object({
        search_string         = string
        field_to_match        = string
        text_transformation   = string
        positional_constraint = string
      }))
      rate_based_statement = optional(object({
        limit              = number
        aggregate_key_type = string
      }))
    })
  }))
  default = []
}

variable "waf_rate_limit" {
  description = "Rate limit for WAF rules (requests per 5-minute window)."
  type        = number
  default     = 10000
}

variable "waf_blocked_countries" {
  description = "List of country codes to block at WAF level for compliance."
  type        = list(string)
  default     = []
}

# ==============================================================================
# ENCRYPTION AND KEY MANAGEMENT VARIABLES
# ==============================================================================

variable "kms_key_alias" {
  description = "Alias for the KMS key used for encryption."
  type        = string
  default     = "alias/ufs-kms-key"
}

variable "enable_kms_key_rotation" {
  description = "Enable or disable automatic rotation of the KMS key."
  type        = bool
  default     = true
}

variable "kms_key_policy" {
  description = "JSON policy document for the KMS key. If not provided, a default policy will be used."
  type        = string
  default     = null
}

variable "kms_key_deletion_window" {
  description = "Duration in days after which the key is deleted after destruction of the resource."
  type        = number
  default     = 7
  validation {
    condition     = var.kms_key_deletion_window >= 7 && var.kms_key_deletion_window <= 30
    error_message = "KMS key deletion window must be between 7 and 30 days."
  }
}

variable "enable_kms_multi_region" {
  description = "Enable multi-region KMS key for cross-region encryption."
  type        = bool
  default     = false
}

# ==============================================================================
# IAM VARIABLES
# ==============================================================================

variable "iam_policy_path" {
  description = "Path for IAM policies."
  type        = string
  default     = "/"
}

variable "iam_role_path" {
  description = "Path for IAM roles."
  type        = string
  default     = "/"
}

variable "enable_iam_access_analyzer" {
  description = "Enable IAM Access Analyzer for zero-trust security compliance."
  type        = bool
  default     = true
}

variable "iam_password_policy" {
  description = "Configuration for IAM password policy to meet compliance requirements."
  type = object({
    minimum_password_length        = number
    require_lowercase_characters   = bool
    require_numbers               = bool
    require_uppercase_characters   = bool
    require_symbols               = bool
    allow_users_to_change_password = bool
    max_password_age              = number
    password_reuse_prevention     = number
  })
  default = {
    minimum_password_length        = 14
    require_lowercase_characters   = true
    require_numbers               = true
    require_uppercase_characters   = true
    require_symbols               = true
    allow_users_to_change_password = true
    max_password_age              = 90
    password_reuse_prevention     = 24
  }
}

# ==============================================================================
# NETWORK ACCESS CONTROL LISTS (NACL) VARIABLES
# ==============================================================================

variable "enable_network_acl" {
  description = "Enable custom Network ACLs for enhanced network security."
  type        = bool
  default     = true
}

variable "dmz_subnet_ids" {
  description = "List of subnet IDs for the DMZ security zone."
  type        = list(string)
  default     = []
}

variable "app_subnet_ids" {
  description = "List of subnet IDs for the application security zone."
  type        = list(string)
  default     = []
}

variable "data_subnet_ids" {
  description = "List of subnet IDs for the data security zone."
  type        = list(string)
  default     = []
}

variable "nacl_rules" {
  description = "Custom NACL rules for network segmentation."
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    port_range = object({
      from = number
      to   = number
    })
    cidr_block = string
  }))
  default = []
}

# ==============================================================================
# SECRETS MANAGER VARIABLES
# ==============================================================================

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager for secure credential storage."
  type        = bool
  default     = true
}

variable "secrets_kms_key_id" {
  description = "KMS key ID for encrypting secrets. If not provided, uses the default KMS key."
  type        = string
  default     = null
}

variable "secrets_rotation_enabled" {
  description = "Enable automatic rotation for secrets."
  type        = bool
  default     = true
}

variable "secrets_rotation_days" {
  description = "Number of days between automatic rotations."
  type        = number
  default     = 30
}

# ==============================================================================
# SECURITY MONITORING VARIABLES
# ==============================================================================

variable "enable_guardduty" {
  description = "Enable AWS GuardDuty for threat detection."
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable AWS Security Hub for centralized security findings."
  type        = bool
  default     = true
}

variable "enable_config" {
  description = "Enable AWS Config for compliance monitoring."
  type        = bool
  default     = true
}

variable "security_hub_standards" {
  description = "List of Security Hub standards to enable."
  type        = list(string)
  default = [
    "standards/aws-foundational-security-standard/v/1.0.0",
    "standards/pci-dss/v/3.2.1",
    "standards/cis-aws-foundations-benchmark/v/1.2.0"
  ]
}

variable "config_rules" {
  description = "List of AWS Config rules to enable for compliance."
  type        = list(string)
  default = [
    "encrypted-volumes",
    "rds-storage-encrypted",
    "s3-bucket-ssl-requests-only",
    "iam-password-policy",
    "root-access-key-check"
  ]
}

# ==============================================================================
# COMPLIANCE AND AUDIT VARIABLES
# ==============================================================================

variable "enable_cloudtrail" {
  description = "Enable AWS CloudTrail for audit logging."
  type        = bool
  default     = true
}

variable "cloudtrail_s3_bucket_name" {
  description = "S3 bucket name for CloudTrail logs."
  type        = string
  default     = null
}

variable "cloudtrail_log_retention_days" {
  description = "Number of days to retain CloudTrail logs."
  type        = number
  default     = 2555 # 7 years for financial compliance
}

variable "enable_data_events" {
  description = "Enable CloudTrail data events for S3 and Lambda."
  type        = bool
  default     = true
}

variable "compliance_frameworks" {
  description = "List of compliance frameworks to configure for."
  type        = list(string)
  default     = ["SOC2", "PCI-DSS", "GDPR", "BASEL-III"]
}

# ==============================================================================
# NETWORK SEGMENTATION VARIABLES
# ==============================================================================

variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs for network monitoring."
  type        = bool
  default     = true
}

variable "flow_logs_destination_type" {
  description = "Destination type for VPC Flow Logs (cloud-watch-logs or s3)."
  type        = string
  default     = "cloud-watch-logs"
  validation {
    condition     = contains(["cloud-watch-logs", "s3"], var.flow_logs_destination_type)
    error_message = "Flow logs destination type must be either 'cloud-watch-logs' or 's3'."
  }
}

variable "transit_gateway_id" {
  description = "Transit Gateway ID for cross-VPC connectivity in zero-trust architecture."
  type        = string
  default     = null
}

variable "enable_network_segmentation" {
  description = "Enable network segmentation with security zones."
  type        = bool
  default     = true
}

# ==============================================================================
# ZERO-TRUST SECURITY VARIABLES
# ==============================================================================

variable "enable_zero_trust" {
  description = "Enable zero-trust security model configurations."
  type        = bool
  default     = true
}

variable "zero_trust_policies" {
  description = "Zero-trust security policies configuration."
  type = object({
    enable_device_verification = bool
    enable_user_verification   = bool
    enable_app_verification    = bool
    minimum_trust_score        = number
  })
  default = {
    enable_device_verification = true
    enable_user_verification   = true
    enable_app_verification    = true
    minimum_trust_score        = 80
  }
}

variable "trusted_ip_ranges" {
  description = "List of trusted IP ranges for zero-trust network access."
  type        = list(string)
  default     = []
}

variable "enable_conditional_access" {
  description = "Enable conditional access policies for zero-trust."
  type        = bool
  default     = true
}

# ==============================================================================
# DATA LOSS PREVENTION VARIABLES
# ==============================================================================

variable "enable_dlp" {
  description = "Enable Data Loss Prevention (DLP) policies."
  type        = bool
  default     = true
}

variable "dlp_sensitive_data_types" {
  description = "List of sensitive data types to monitor for DLP."
  type        = list(string)
  default = [
    "credit-card-numbers",
    "social-security-numbers",
    "bank-account-numbers",
    "passport-numbers",
    "driver-license-numbers"
  ]
}

variable "dlp_notification_topics" {
  description = "SNS topics for DLP violation notifications."
  type        = list(string)
  default     = []
}

# ==============================================================================
# BACKUP AND RECOVERY VARIABLES
# ==============================================================================

variable "enable_backup" {
  description = "Enable AWS Backup for automated backups."
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "Backup retention period in days."
  type        = number
  default     = 2555 # 7 years for financial compliance
}

variable "backup_schedule" {
  description = "Cron expression for backup schedule."
  type        = string
  default     = "cron(0 2 * * ? *)" # Daily at 2 AM
}

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup replication."
  type        = bool
  default     = true
}

variable "backup_destination_region" {
  description = "Destination region for cross-region backup replication."
  type        = string
  default     = "us-west-2"
}

# ==============================================================================
# INCIDENT RESPONSE VARIABLES
# ==============================================================================

variable "enable_incident_response" {
  description = "Enable automated incident response capabilities."
  type        = bool
  default     = true
}

variable "incident_response_lambda_timeout" {
  description = "Timeout for incident response Lambda functions."
  type        = number
  default     = 300
}

variable "security_notification_email" {
  description = "Email address for security notifications."
  type        = string
  default     = null
}

variable "enable_automatic_remediation" {
  description = "Enable automatic remediation for security findings."
  type        = bool
  default     = false
}

# ==============================================================================
# REGULATORY COMPLIANCE VARIABLES
# ==============================================================================

variable "regulatory_region" {
  description = "Primary regulatory region for compliance (e.g., US, EU, APAC)."
  type        = string
  default     = "US"
  validation {
    condition     = contains(["US", "EU", "APAC", "GLOBAL"], var.regulatory_region)
    error_message = "Regulatory region must be one of: US, EU, APAC, GLOBAL."
  }
}

variable "data_residency_requirements" {
  description = "Data residency requirements for regulatory compliance."
  type = object({
    allowed_regions = list(string)
    encryption_required = bool
    cross_border_transfer_allowed = bool
  })
  default = {
    allowed_regions = ["us-east-1", "us-west-2"]
    encryption_required = true
    cross_border_transfer_allowed = false
  }
}

variable "audit_log_retention_years" {
  description = "Number of years to retain audit logs for regulatory compliance."
  type        = number
  default     = 7
  validation {
    condition     = var.audit_log_retention_years >= 7
    error_message = "Audit log retention must be at least 7 years for financial compliance."
  }
}

# ==============================================================================
# COST OPTIMIZATION VARIABLES
# ==============================================================================

variable "enable_cost_optimization" {
  description = "Enable cost optimization features for security resources."
  type        = bool
  default     = true
}

variable "unused_resource_cleanup_days" {
  description = "Number of days before cleaning up unused security resources."
  type        = number
  default     = 30
}

variable "enable_reserved_capacity" {
  description = "Enable reserved capacity for cost optimization."
  type        = bool
  default     = false
}