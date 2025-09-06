# =============================================================================
# Compute Module Outputs
# =============================================================================
# This file defines the outputs for the compute module, providing essential
# information about the created EKS cluster and associated IAM resources.
# These outputs enable other Terraform configurations and services to connect
# to and interact with the Kubernetes cluster infrastructure.
#
# Author: Infrastructure Team
# Version: 1.0.0
# Compatible with: Terraform >= 1.6, AWS Provider ~> 5.0
# =============================================================================

# -----------------------------------------------------------------------------
# EKS Cluster Endpoint
# -----------------------------------------------------------------------------
# Exposes the EKS cluster API server endpoint for kubectl and other tools
# to connect to the cluster. This endpoint is used for all cluster management
# operations and service communications.
output "cluster_endpoint" {
  description = "The endpoint for the EKS cluster API server. This URL is used by kubectl, CI/CD pipelines, and other services to communicate with the Kubernetes cluster."
  value       = aws_eks_cluster.main.endpoint
  sensitive   = false
}

# -----------------------------------------------------------------------------
# EKS Cluster CA Certificate
# -----------------------------------------------------------------------------
# Provides the base64-encoded certificate authority data for the EKS cluster.
# This certificate is required for secure TLS communication with the cluster
# API server and is used by kubectl and other Kubernetes clients for verification.
output "cluster_ca_certificate" {
  description = "The base64-encoded certificate authority data for the EKS cluster. Required for secure communication with the cluster API server and used by kubectl for TLS verification."
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

# -----------------------------------------------------------------------------
# EKS Cluster Name
# -----------------------------------------------------------------------------
# Returns the name of the created EKS cluster, which is used for resource
# identification, tagging, and integration with other AWS services.
output "cluster_name" {
  description = "The name of the EKS cluster. Used for resource identification, kubectl context configuration, and integration with AWS services like CloudWatch and ALB Ingress Controller."
  value       = aws_eks_cluster.main.name
  sensitive   = false
}

# -----------------------------------------------------------------------------
# Financial Services Node Group IAM Role ARN
# -----------------------------------------------------------------------------
# Exposes the IAM role ARN for the financial services node group, which is
# required for proper RBAC configuration and service account associations.
# This role provides necessary permissions for financial workloads running
# on dedicated compute resources with enhanced security and compliance controls.
output "financial_services_nodegroup_iam_role_arn" {
  description = "The ARN of the IAM role associated with the financial services node group. This role provides necessary permissions for financial workloads and is used for Kubernetes RBAC configuration and service account bindings."
  value       = aws_iam_role.financial_services_nodegroup.arn
  sensitive   = false
}

# -----------------------------------------------------------------------------
# AI/ML Node Group IAM Role ARN
# -----------------------------------------------------------------------------
# Provides the IAM role ARN for the AI/ML node group, enabling proper
# permissions for machine learning workloads, model training, and inference
# operations. This role includes access to specialized compute resources
# and AI/ML services required for risk assessment and fraud detection.
output "ai_ml_nodegroup_iam_role_arn" {
  description = "The ARN of the IAM role associated with the AI/ML node group. This role provides necessary permissions for machine learning workloads, model training, and inference operations, including access to specialized GPU resources."
  value       = aws_iam_role.ai_ml_nodegroup.arn
  sensitive   = false
}

# -----------------------------------------------------------------------------
# Additional Cluster Information (Optional)
# -----------------------------------------------------------------------------
# These outputs provide supplementary information that may be useful for
# monitoring, troubleshooting, and integration with other systems.

# Cluster version information for compatibility checks
output "cluster_version" {
  description = "The Kubernetes version of the EKS cluster. Used for compatibility checks and upgrade planning."
  value       = aws_eks_cluster.main.version
  sensitive   = false
}

# Cluster platform version for AWS-specific features
output "cluster_platform_version" {
  description = "The platform version of the EKS cluster. Indicates the specific EKS platform version with AWS-managed components."
  value       = aws_eks_cluster.main.platform_version
  sensitive   = false
}

# Cluster status for health monitoring
output "cluster_status" {
  description = "The status of the EKS cluster. Used for health monitoring and automation workflows."
  value       = aws_eks_cluster.main.status
  sensitive   = false
}

# Cluster OIDC issuer URL for service account authentication
output "cluster_oidc_issuer_url" {
  description = "The OpenID Connect issuer URL for the EKS cluster. Required for configuring IAM roles for service accounts (IRSA) and enabling pod-level AWS permissions."
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
  sensitive   = false
}

# Cluster security group ID for network configuration
output "cluster_security_group_id" {
  description = "The cluster security group ID created by EKS. Used for additional security group rules and network configuration."
  value       = aws_eks_cluster.main.cluster_security_group_id
  sensitive   = false
}

# Cluster primary security group ID for worker nodes
output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID that worker nodes automatically join. Used for network security configurations."
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
  sensitive   = false
}

# =============================================================================
# Output Usage Examples
# =============================================================================
# 
# These outputs can be used in other Terraform configurations as follows:
#
# # Reference cluster endpoint
# module.compute.cluster_endpoint
#
# # Configure kubectl context
# data "aws_eks_cluster_auth" "cluster" {
#   name = module.compute.cluster_name
# }
#
# provider "kubernetes" {
#   host                   = module.compute.cluster_endpoint
#   cluster_ca_certificate = base64decode(module.compute.cluster_ca_certificate)
#   token                  = data.aws_eks_cluster_auth.cluster.token
# }
#
# # Use IAM role ARNs for service account bindings
# resource "kubernetes_service_account" "financial_service" {
#   metadata {
#     annotations = {
#       "eks.amazonaws.com/role-arn" = module.compute.financial_services_nodegroup_iam_role_arn
#     }
#   }
# }
# =============================================================================