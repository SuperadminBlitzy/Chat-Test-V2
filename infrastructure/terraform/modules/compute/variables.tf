# =============================================================================
# UNIFIED FINANCIAL SERVICES PLATFORM - COMPUTE MODULE VARIABLES
# =============================================================================
# This file defines the input variables for the compute module responsible for
# provisioning compute resources for the Unified Financial Services Platform.
# The module supports Kubernetes node groups for different workloads including
# financial services, AI/ML, and data processing across various environments.
# =============================================================================

# -----------------------------------------------------------------------------
# CLUSTER CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "cluster_name" {
  description = "The name of the Kubernetes cluster. This name will be used for identifying the cluster across all AWS resources and must be unique within the region."
  type        = string
  default     = "ufs-cluster"

  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$", var.cluster_name)) && length(var.cluster_name) <= 100
    error_message = "Cluster name must start with a letter, contain only alphanumeric characters and hyphens, end with an alphanumeric character, and be no more than 100 characters long."
  }
}

variable "cluster_version" {
  description = "The version of the Kubernetes cluster. This should match the supported EKS versions for optimal compatibility and security updates. Minimum supported version is 1.28 for financial services compliance."
  type        = string
  default     = "1.28"

  validation {
    condition = can(regex("^1\\.(2[8-9]|[3-9][0-9])$", var.cluster_version))
    error_message = "Cluster version must be 1.28 or higher to meet financial services security and compliance requirements."
  }
}

# -----------------------------------------------------------------------------
# NETWORK CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "vpc_id" {
  description = "The ID of the VPC where the Kubernetes cluster and worker nodes will be deployed. This VPC must have the necessary subnets, internet gateway, and NAT gateway configuration for proper cluster operation."
  type        = string

  validation {
    condition = can(regex("^vpc-[a-f0-9]{8}([a-f0-9]{9})?$", var.vpc_id))
    error_message = "VPC ID must be a valid AWS VPC identifier (vpc-xxxxxxxx or vpc-xxxxxxxxxxxxxxxxx)."
  }
}

variable "subnet_ids" {
  description = "A list of subnet IDs where the worker nodes will be launched. These subnets must be in different availability zones for high availability and should be private subnets with NAT gateway access for security. Minimum of 2 subnets required for multi-AZ deployment."
  type        = list(string)

  validation {
    condition = length(var.subnet_ids) >= 2
    error_message = "At least 2 subnet IDs must be provided for multi-AZ deployment to ensure high availability."
  }

  validation {
    condition = alltrue([
      for subnet_id in var.subnet_ids : can(regex("^subnet-[a-f0-9]{8}([a-f0-9]{9})?$", subnet_id))
    ])
    error_message = "All subnet IDs must be valid AWS subnet identifiers (subnet-xxxxxxxx or subnet-xxxxxxxxxxxxxxxxx)."
  }
}

# -----------------------------------------------------------------------------
# NODE GROUP CONFIGURATION VARIABLES
# -----------------------------------------------------------------------------

variable "node_groups" {
  description = "A map of node group configurations to create in the cluster. Each node group can have its own instance types, scaling configuration, and other settings. Node groups are designed to support different workload types including financial services (compute-optimized), AI/ML workloads (GPU-enabled), and data processing (memory-optimized)."
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    min_size       = number
    max_size       = number
    desired_size   = number
  }))
  default = {
    # Financial services node group - optimized for transaction processing
    # and core banking operations with high CPU performance
    financial_services = {
      instance_types = ["m6i.2xlarge", "m6i.4xlarge"] # 8-16 vCPUs, 32-64 GB RAM
      capacity_type  = "ON_DEMAND"                     # Guaranteed capacity for critical workloads
      min_size       = 3                               # Minimum nodes for HA across 3 AZs
      max_size       = 20                              # Scale up to handle peak loads
      desired_size   = 6                               # Initial capacity for baseline operations
    }
    
    # AI/ML workloads node group - GPU-enabled instances for machine learning
    # model training and inference for risk assessment and fraud detection
    ai_ml_workloads = {
      instance_types = ["p4d.xlarge", "p4d.2xlarge"]  # GPU instances with 40GB+ GPU memory
      capacity_type  = "ON_DEMAND"                     # On-demand for consistent ML performance
      min_size       = 0                               # Can scale to zero when not needed
      max_size       = 10                              # Limit for cost control
      desired_size   = 2                               # Baseline for real-time inference
    }
  }

  validation {
    condition = alltrue([
      for k, v in var.node_groups : v.min_size >= 0 && v.max_size >= v.min_size && v.desired_size >= v.min_size && v.desired_size <= v.max_size
    ])
    error_message = "For each node group: min_size must be >= 0, max_size must be >= min_size, and desired_size must be between min_size and max_size."
  }

  validation {
    condition = alltrue([
      for k, v in var.node_groups : contains(["ON_DEMAND", "SPOT"], v.capacity_type)
    ])
    error_message = "Capacity type must be either 'ON_DEMAND' or 'SPOT'."
  }

  validation {
    condition = alltrue([
      for k, v in var.node_groups : length(v.instance_types) > 0
    ])
    error_message = "Each node group must specify at least one instance type."
  }
}

# -----------------------------------------------------------------------------
# RESOURCE TAGGING VARIABLES
# -----------------------------------------------------------------------------

variable "tags" {
  description = "A map of tags to apply to all resources created by this module, for cost allocation, compliance, and identification. Tags are essential for financial services compliance including PCI-DSS, SOX, and GDPR requirements. All resources will inherit these tags plus additional resource-specific tags."
  type        = map(string)
  default = {
    # Project identification for cost allocation and resource management
    Project = "unified-financial-platform"
    
    # Environment designation for deployment pipeline and access control
    Environment = "dev"
    
    # Compliance frameworks this infrastructure must adhere to
    Compliance = "PCI-DSS,SOX,GDPR"
    
    # Workload classification for security and network policies
    WorkloadType = "financial-services"
    
    # Data classification for security and backup policies
    DataClassification = "confidential"
    
    # Business unit for cost allocation and management
    BusinessUnit = "financial-services-platform"
    
    # Technical owner for operational responsibilities
    TechnicalOwner = "platform-engineering"
    
    # Backup and disaster recovery tier
    BackupTier = "tier-1"
    
    # Monitoring and alerting configuration
    MonitoringTier = "critical"
    
    # Cost center for financial tracking and budgeting
    CostCenter = "technology-infrastructure"
  }

  validation {
    condition = contains(keys(var.tags), "Project") && contains(keys(var.tags), "Environment")
    error_message = "Tags must include at least 'Project' and 'Environment' keys for proper resource identification."
  }

  validation {
    condition = alltrue([
      for k, v in var.tags : length(k) <= 128 && length(v) <= 256
    ])
    error_message = "Tag keys must be 128 characters or less, and tag values must be 256 characters or less."
  }
}