# =============================================================================
# UNIFIED FINANCIAL SERVICES PLATFORM - NETWORKING MODULE VARIABLES
# =============================================================================
# This file defines input variables for the networking Terraform module used in
# the Unified Financial Services Platform. These variables configure VPC, 
# subnets, and networking resources for hybrid cloud deployment supporting
# BFSI compliance requirements (SOC2, PCI-DSS, GDPR).
#
# Version: 1.0
# Terraform Version: >= 1.6
# AWS Provider Version: ~> 5.0
# =============================================================================

# -----------------------------------------------------------------------------
# CORE DEPLOYMENT VARIABLES
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "The AWS region where the networking resources will be created. Supports multi-region deployment strategy for geographic distribution requirements."
  type        = string
  default     = "us-east-1"

  validation {
    condition = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "AWS region must be in the format 'xx-xxxx-x' (e.g., us-east-1, eu-west-1)."
  }
}

variable "project_name" {
  description = "The name of the project, used for tagging resources and resource naming conventions. Used across all infrastructure components."
  type        = string
  default     = "ufs"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name)) && length(var.project_name) >= 2 && length(var.project_name) <= 20
    error_message = "Project name must be 2-20 characters long and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod). Used for resource tagging and environment-specific configurations."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod", "test", "qa"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod, test, qa."
  }
}

# -----------------------------------------------------------------------------
# VPC CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "The CIDR block for the VPC. Defines the IP address range for the entire virtual private cloud supporting scalable network architecture."
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }

  validation {
    condition     = can(regex("^10\\.|^172\\.(1[6-9]|2[0-9]|3[0-1])\\.|^192\\.168\\.", var.vpc_cidr))
    error_message = "VPC CIDR must use private IP address ranges (10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16)."
  }
}

variable "vpc_enable_dns_hostnames" {
  description = "Enable DNS hostnames in the VPC. Required for EKS and other AWS services integration."
  type        = bool
  default     = true
}

variable "vpc_enable_dns_support" {
  description = "Enable DNS support in the VPC. Required for proper service discovery and internal communication."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# PUBLIC SUBNET CONFIGURATION
# -----------------------------------------------------------------------------

variable "public_subnets_cidr" {
  description = "A list of CIDR blocks for the public subnets. These subnets will host load balancers, NAT gateways, and other internet-facing resources."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnets_cidr) >= 2
    error_message = "At least 2 public subnets are required for high availability."
  }

  validation {
    condition     = length(var.public_subnets_cidr) <= 6
    error_message = "Maximum of 6 public subnets allowed per VPC."
  }
}

variable "public_subnet_map_public_ip_on_launch" {
  description = "Specify true to indicate that instances launched into the public subnet should be assigned a public IP address."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# PRIVATE SUBNET CONFIGURATION
# -----------------------------------------------------------------------------

variable "private_subnets_cidr" {
  description = "A list of CIDR blocks for the private subnets. These subnets will host application servers, databases, and other internal resources for security compliance."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]

  validation {
    condition     = length(var.private_subnets_cidr) >= 2
    error_message = "At least 2 private subnets are required for high availability."
  }

  validation {
    condition     = length(var.private_subnets_cidr) <= 6
    error_message = "Maximum of 6 private subnets allowed per VPC."
  }
}

# -----------------------------------------------------------------------------
# DATABASE SUBNET CONFIGURATION
# -----------------------------------------------------------------------------

variable "database_subnets_cidr" {
  description = "A list of CIDR blocks for the database subnets. These subnets provide additional isolation for database resources (RDS, ElastiCache)."
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24"]

  validation {
    condition     = length(var.database_subnets_cidr) >= 2
    error_message = "At least 2 database subnets are required for RDS high availability."
  }
}

variable "create_database_subnet_group" {
  description = "Controls if database subnet group should be created for RDS instances."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# AVAILABILITY ZONE CONFIGURATION
# -----------------------------------------------------------------------------

variable "availability_zones" {
  description = "A list of availability zones to create the subnets in. Must correspond to the specified AWS region for multi-AZ deployment."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones are required for high availability."
  }

  validation {
    condition     = length(var.availability_zones) <= 6
    error_message = "Maximum of 6 availability zones supported."
  }
}

# -----------------------------------------------------------------------------
# NAT GATEWAY CONFIGURATION
# -----------------------------------------------------------------------------

variable "enable_nat_gateway" {
  description = "Should be true if you want to provision NAT Gateways for each of your private networks."
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Should be true if you want to provision a single shared NAT Gateway across all of your private networks."
  type        = bool
  default     = false
}

variable "one_nat_gateway_per_az" {
  description = "Should be true if you want only one NAT Gateway per availability zone. Requires var.enable_nat_gateway to be true."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# INTERNET GATEWAY CONFIGURATION
# -----------------------------------------------------------------------------

variable "create_igw" {
  description = "Controls if an Internet Gateway is created for the VPC."
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# VPC FLOW LOGS CONFIGURATION
# -----------------------------------------------------------------------------

variable "enable_flow_log" {
  description = "Whether or not to enable VPC Flow Logs for security monitoring and compliance."
  type        = bool
  default     = true
}

variable "flow_log_destination_type" {
  description = "Type of flow log destination. Can be cloud-watch-logs or s3."
  type        = string
  default     = "cloud-watch-logs"

  validation {
    condition     = contains(["cloud-watch-logs", "s3"], var.flow_log_destination_type)
    error_message = "Flow log destination type must be either 'cloud-watch-logs' or 's3'."
  }
}

variable "flow_log_traffic_type" {
  description = "The type of traffic to capture. Valid values: ACCEPT, REJECT, ALL."
  type        = string
  default     = "ALL"

  validation {
    condition     = contains(["ACCEPT", "REJECT", "ALL"], var.flow_log_traffic_type)
    error_message = "Flow log traffic type must be one of: ACCEPT, REJECT, ALL."
  }
}

# -----------------------------------------------------------------------------
# SECURITY AND COMPLIANCE VARIABLES
# -----------------------------------------------------------------------------

variable "enable_dhcp_options" {
  description = "Should be true if you want to specify a DHCP options set with a custom domain name, DNS servers, NTP servers, netbios name servers, and/or netbios node type."
  type        = bool
  default     = false
}

variable "dhcp_options_domain_name" {
  description = "Specifies DNS search domains for DHCP options set (requires enable_dhcp_options set to true)."
  type        = string
  default     = ""
}

variable "dhcp_options_domain_name_servers" {
  description = "Specify a list of DNS server addresses for DHCP options set, default to AWS provided (requires enable_dhcp_options set to true)."
  type        = list(string)
  default     = ["AmazonProvidedDNS"]
}

# -----------------------------------------------------------------------------
# TAGGING VARIABLES
# -----------------------------------------------------------------------------

variable "common_tags" {
  description = "Common tags to be applied to all resources for compliance and cost management."
  type        = map(string)
  default = {
    Project     = "unified-financial-platform"
    Compliance  = "PCI-DSS,SOX,GDPR"
    Owner       = "platform-team"
    CostCenter  = "infrastructure"
  }
}

variable "vpc_tags" {
  description = "Additional tags for the VPC."
  type        = map(string)
  default     = {}
}

variable "public_subnet_tags" {
  description = "Additional tags for public subnets."
  type        = map(string)
  default = {
    Type = "public"
    "kubernetes.io/role/elb" = "1"
  }
}

variable "private_subnet_tags" {
  description = "Additional tags for private subnets."
  type        = map(string)
  default = {
    Type = "private"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

variable "database_subnet_tags" {
  description = "Additional tags for database subnets."
  type        = map(string)
  default = {
    Type = "database"
  }
}

# -----------------------------------------------------------------------------
# NETWORK ACL VARIABLES
# -----------------------------------------------------------------------------

variable "manage_default_network_acl" {
  description = "Should be true to adopt and manage Default Network ACL."
  type        = bool
  default     = false
}

variable "public_dedicated_network_acl" {
  description = "Whether to use dedicated network ACL (not default) and custom rules for public subnets."
  type        = bool
  default     = false
}

variable "private_dedicated_network_acl" {
  description = "Whether to use dedicated network ACL (not default) and custom rules for private subnets."
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# SECONDARY CIDR BLOCKS
# -----------------------------------------------------------------------------

variable "secondary_cidr_blocks" {
  description = "List of secondary CIDR blocks to associate with the VPC to extend the IP address range."
  type        = list(string)
  default     = []
}

# -----------------------------------------------------------------------------
# KUBERNETES INTEGRATION VARIABLES
# -----------------------------------------------------------------------------

variable "enable_kubernetes_tags" {
  description = "Enable Kubernetes-specific tags for EKS cluster integration."
  type        = bool
  default     = true
}

variable "kubernetes_cluster_name" {
  description = "Name of the Kubernetes cluster for resource tagging. Used for EKS integration."
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# MONITORING AND ALERTING VARIABLES
# -----------------------------------------------------------------------------

variable "enable_cloudwatch_logs_retention" {
  description = "Enable CloudWatch Logs retention policy for VPC Flow Logs."
  type        = bool
  default     = true
}

variable "cloudwatch_logs_retention_days" {
  description = "Specifies the number of days to retain log events in CloudWatch Logs."
  type        = number
  default     = 30

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.cloudwatch_logs_retention_days)
    error_message = "CloudWatch Logs retention days must be a valid retention period."
  }
}

# -----------------------------------------------------------------------------
# COST OPTIMIZATION VARIABLES
# -----------------------------------------------------------------------------

variable "enable_s3_endpoint" {
  description = "Should be true if you want to provision an S3 endpoint to the VPC."
  type        = bool
  default     = true
}

variable "enable_dynamodb_endpoint" {
  description = "Should be true if you want to provision a DynamoDB endpoint to the VPC."
  type        = bool
  default     = true
}

variable "enable_ec2_endpoint" {
  description = "Should be true if you want to provision an EC2 endpoint to the VPC."
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# BACKUP AND DISASTER RECOVERY VARIABLES
# -----------------------------------------------------------------------------

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup for disaster recovery compliance."
  type        = bool
  default     = false
}

variable "backup_region" {
  description = "The AWS region for disaster recovery backups."
  type        = string
  default     = "us-west-2"

  validation {
    condition = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.backup_region))
    error_message = "Backup region must be in the format 'xx-xxxx-x' (e.g., us-west-2, eu-central-1)."
  }
}