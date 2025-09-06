# Terraform configuration for compute resources - Unified Financial Services Platform
# This module provisions EKS cluster and node groups for financial services, AI/ML, and data processing workloads

# Provider configuration with required versions
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"    # AWS provider version ~> 5.0
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"    # Kubernetes provider version ~> 2.24
      version = "~> 2.24"
    }
    random = {
      source  = "hashicorp/random"    # Random provider version 3.5.1
      version = "3.5.1"
    }
  }
}

# Generate random suffix for unique resource naming
resource "random_string" "cluster_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Data source to get current AWS caller identity
data "aws_caller_identity" "current" {}

# Data source to get current AWS region
data "aws_region" "current" {}

# Data source for EKS cluster authentication
data "aws_eks_cluster" "cluster" {
  name       = aws_eks_cluster.financial_platform_cluster.name
  depends_on = [aws_eks_cluster.financial_platform_cluster]
}

data "aws_eks_cluster_auth" "cluster" {
  name       = aws_eks_cluster.financial_platform_cluster.name
  depends_on = [aws_eks_cluster.financial_platform_cluster]
}

# Local values for resource tags and configuration
locals {
  cluster_name = "financial-platform-cluster-${random_string.cluster_suffix.result}"
  
  common_tags = {
    Environment     = var.environment
    Project         = "unified-financial-platform"
    Compliance      = "PCI-DSS,SOX,GDPR,SOC2"
    ManagedBy       = "terraform"
    CostCenter      = "financial-platform"
    DataClassification = "confidential"
    BusinessUnit    = "financial-services"
  }
  
  # Security context for financial services compliance
  security_context = {
    encryption_at_rest = true
    encryption_in_transit = true
    audit_logging = true
    vpc_cni_prefix_delegation = true
  }
}

# IAM role for EKS cluster control plane
resource "aws_iam_role" "eks_cluster_role" {
  name = "eks-cluster-role-${random_string.cluster_suffix.result}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "eks-cluster-role"
    Purpose = "EKS cluster control plane IAM role"
  })
}

# Attach required policies to EKS cluster role
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster_role.name
}

# Additional IAM policy for financial services compliance
resource "aws_iam_role_policy" "eks_cluster_additional_policy" {
  name = "eks-cluster-additional-policy"
  role = aws_iam_role.eks_cluster_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM role for EKS worker nodes
resource "aws_iam_role" "eks_node_role" {
  name = "eks-node-role-${random_string.cluster_suffix.result}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "eks-node-role"
    Purpose = "EKS worker nodes IAM role"
  })
}

# Attach required policies to EKS node role
resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_ssm_managed_instance_core" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.eks_node_role.name
}

# Additional IAM policy for node groups with autoscaling permissions
resource "aws_iam_role_policy" "eks_node_additional_policy" {
  name = "eks-node-additional-policy"
  role = aws_iam_role.eks_node_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:DescribeInstanceTypes"
        ]
        Resource = "*"
      }
    ]
  })
}

# KMS key for EKS cluster encryption
resource "aws_kms_key" "eks_cluster_key" {
  description             = "KMS key for EKS cluster encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow EKS service"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "eks-cluster-encryption-key"
    Purpose = "EKS cluster secrets encryption"
  })
}

resource "aws_kms_alias" "eks_cluster_key_alias" {
  name          = "alias/eks-cluster-${random_string.cluster_suffix.result}"
  target_key_id = aws_kms_key.eks_cluster_key.key_id
}

# CloudWatch Log Group for EKS cluster logging
resource "aws_cloudwatch_log_group" "eks_cluster_logs" {
  name              = "/aws/eks/${local.cluster_name}/cluster"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.eks_cluster_key.arn
  
  tags = merge(local.common_tags, {
    Name = "eks-cluster-logs"
    Purpose = "EKS cluster audit and diagnostic logs"
  })
}

# Security group for EKS cluster
resource "aws_security_group" "eks_cluster_security_group" {
  name_prefix = "eks-cluster-sg-"
  vpc_id      = var.vpc_id
  description = "Security group for EKS cluster control plane"
  
  # Ingress rules for cluster communication
  ingress {
    description = "HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  # Egress rules
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "eks-cluster-security-group"
    Purpose = "EKS cluster control plane security"
  })
}

# Main EKS cluster resource
resource "aws_eks_cluster" "financial_platform_cluster" {
  name     = local.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = var.private_subnets
    endpoint_private_access = true
    endpoint_public_access  = false
    public_access_cidrs     = []
    security_group_ids      = [aws_security_group.eks_cluster_security_group.id]
  }
  
  # Enable comprehensive logging for financial services compliance
  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]
  
  # Encryption configuration for secrets
  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_cluster_key.arn
    }
    resources = ["secrets"]
  }
  
  # Ensure proper ordering of resource creation
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
    aws_cloudwatch_log_group.eks_cluster_logs,
  ]
  
  tags = merge(local.common_tags, {
    Name = "financial-platform-cluster"
    Purpose = "Main EKS cluster for unified financial services platform"
  })
}

# Node group for financial services microservices
resource "aws_eks_node_group" "financial_services_node_group" {
  cluster_name    = aws_eks_cluster.financial_platform_cluster.name
  node_group_name = "financial-services-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.private_subnets
  
  # Instance configuration optimized for financial services workloads
  instance_types = ["m6i.2xlarge", "m6i.4xlarge"]
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  disk_size      = 100
  
  # Scaling configuration for financial services
  scaling_config {
    desired_size = 6
    max_size     = 20
    min_size     = 3
  }
  
  # Update configuration for zero-downtime deployments
  update_config {
    max_unavailable_percentage = 25
  }
  
  # Launch template configuration
  launch_template {
    id      = aws_launch_template.financial_services_lt.id
    version = aws_launch_template.financial_services_lt.latest_version
  }
  
  # Node group labels for workload placement
  labels = {
    role                    = "financial-services"
    node-type              = "compute-optimized"
    "node.kubernetes.io/instance-type" = "m6i"
    workload               = "financial-microservices"
  }
  
  # Taints for dedicated financial services workloads
  taint {
    key    = "dedicated"
    value  = "financial-services"
    effect = "NO_SCHEDULE"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
  
  tags = merge(local.common_tags, {
    Name = "financial-services-node-group"
    Purpose = "Node group for core financial services microservices"
    WorkloadType = "financial-services"
  })
}

# Node group for AI/ML workloads with GPU support
resource "aws_eks_node_group" "ai_ml_node_group" {
  cluster_name    = aws_eks_cluster.financial_platform_cluster.name
  node_group_name = "ai-ml-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.private_subnets
  
  # GPU-enabled instances for AI/ML workloads
  instance_types = ["p4d.24xlarge"]
  ami_type       = "AL2_x86_64_GPU"
  capacity_type  = "ON_DEMAND"
  disk_size      = 200
  
  # Scaling configuration for AI/ML workloads
  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 0
  }
  
  # Update configuration
  update_config {
    max_unavailable_percentage = 50
  }
  
  # Launch template configuration
  launch_template {
    id      = aws_launch_template.ai_ml_lt.id
    version = aws_launch_template.ai_ml_lt.latest_version
  }
  
  # Node group labels for AI/ML workload placement
  labels = {
    role                    = "ai-ml"
    node-type              = "gpu-enabled"
    "node.kubernetes.io/instance-type" = "p4d"
    workload               = "ai-ml-processing"
    accelerator            = "nvidia-tesla-a100"
  }
  
  # Taints for dedicated AI/ML workloads
  taint {
    key    = "dedicated"
    value  = "ai-ml"
    effect = "NO_SCHEDULE"
  }
  
  taint {
    key    = "nvidia.com/gpu"
    value  = "present"
    effect = "NO_SCHEDULE"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
  
  tags = merge(local.common_tags, {
    Name = "ai-ml-node-group"
    Purpose = "Node group for AI/ML workloads with GPU support"
    WorkloadType = "ai-ml"
  })
}

# Node group for data processing workloads
resource "aws_eks_node_group" "data_processing_node_group" {
  cluster_name    = aws_eks_cluster.financial_platform_cluster.name
  node_group_name = "data-processing-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.private_subnets
  
  # Memory-optimized instances for data processing
  instance_types = ["r6i.4xlarge"]
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  disk_size      = 150
  
  # Scaling configuration for data processing
  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 2
  }
  
  # Update configuration
  update_config {
    max_unavailable_percentage = 25
  }
  
  # Launch template configuration
  launch_template {
    id      = aws_launch_template.data_processing_lt.id
    version = aws_launch_template.data_processing_lt.latest_version
  }
  
  # Node group labels for data processing workload placement
  labels = {
    role                    = "data-processing"
    node-type              = "memory-optimized"
    "node.kubernetes.io/instance-type" = "r6i"
    workload               = "data-analytics"
  }
  
  # Taints for dedicated data processing workloads
  taint {
    key    = "dedicated"
    value  = "data-processing"
    effect = "NO_SCHEDULE"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
  
  tags = merge(local.common_tags, {
    Name = "data-processing-node-group"
    Purpose = "Node group for data processing and analytics workloads"
    WorkloadType = "data-processing"
  })
}

# Launch template for financial services nodes
resource "aws_launch_template" "financial_services_lt" {
  name_prefix   = "financial-services-lt-"
  image_id      = data.aws_ami.eks_worker.id
  instance_type = "m6i.2xlarge"
  
  vpc_security_group_ids = [aws_security_group.node_group_security_group.id]
  
  monitoring {
    enabled = true
  }
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 100
      volume_type           = "gp3"
      iops                  = 3000
      throughput            = 125
      encrypted             = true
      kms_key_id            = aws_kms_key.eks_cluster_key.arn
      delete_on_termination = true
    }
  }
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }
  
  user_data = base64encode(templatefile("${path.module}/templates/user_data.sh", {
    cluster_name        = aws_eks_cluster.financial_platform_cluster.name
    container_runtime   = "containerd"
    cluster_endpoint    = aws_eks_cluster.financial_platform_cluster.endpoint
    cluster_ca          = aws_eks_cluster.financial_platform_cluster.certificate_authority[0].data
    node_group_type     = "financial-services"
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(local.common_tags, {
      Name = "financial-services-node"
      NodeGroup = "financial-services"
    })
  }
  
  tags = merge(local.common_tags, {
    Name = "financial-services-launch-template"
  })
}

# Launch template for AI/ML nodes
resource "aws_launch_template" "ai_ml_lt" {
  name_prefix   = "ai-ml-lt-"
  image_id      = data.aws_ami.eks_worker_gpu.id
  instance_type = "p4d.24xlarge"
  
  vpc_security_group_ids = [aws_security_group.node_group_security_group.id]
  
  monitoring {
    enabled = true
  }
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 200
      volume_type           = "gp3"
      iops                  = 4000
      throughput            = 250
      encrypted             = true
      kms_key_id            = aws_kms_key.eks_cluster_key.arn
      delete_on_termination = true
    }
  }
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }
  
  user_data = base64encode(templatefile("${path.module}/templates/user_data_gpu.sh", {
    cluster_name        = aws_eks_cluster.financial_platform_cluster.name
    container_runtime   = "containerd"
    cluster_endpoint    = aws_eks_cluster.financial_platform_cluster.endpoint
    cluster_ca          = aws_eks_cluster.financial_platform_cluster.certificate_authority[0].data
    node_group_type     = "ai-ml"
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(local.common_tags, {
      Name = "ai-ml-node"
      NodeGroup = "ai-ml"
    })
  }
  
  tags = merge(local.common_tags, {
    Name = "ai-ml-launch-template"
  })
}

# Launch template for data processing nodes
resource "aws_launch_template" "data_processing_lt" {
  name_prefix   = "data-processing-lt-"
  image_id      = data.aws_ami.eks_worker.id
  instance_type = "r6i.4xlarge"
  
  vpc_security_group_ids = [aws_security_group.node_group_security_group.id]
  
  monitoring {
    enabled = true
  }
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 150
      volume_type           = "gp3"
      iops                  = 3500
      throughput            = 180
      encrypted             = true
      kms_key_id            = aws_kms_key.eks_cluster_key.arn
      delete_on_termination = true
    }
  }
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }
  
  user_data = base64encode(templatefile("${path.module}/templates/user_data.sh", {
    cluster_name        = aws_eks_cluster.financial_platform_cluster.name
    container_runtime   = "containerd"
    cluster_endpoint    = aws_eks_cluster.financial_platform_cluster.endpoint
    cluster_ca          = aws_eks_cluster.financial_platform_cluster.certificate_authority[0].data
    node_group_type     = "data-processing"
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(local.common_tags, {
      Name = "data-processing-node"
      NodeGroup = "data-processing"
    })
  }
  
  tags = merge(local.common_tags, {
    Name = "data-processing-launch-template"
  })
}

# Security group for node groups
resource "aws_security_group" "node_group_security_group" {
  name_prefix = "eks-node-group-sg-"
  vpc_id      = var.vpc_id
  description = "Security group for EKS node groups"
  
  # Ingress rules
  ingress {
    description = "Node to node communication"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }
  
  ingress {
    description     = "Cluster to node communication"
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_security_group.id]
  }
  
  ingress {
    description     = "Cluster API to node communication"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_security_group.id]
  }
  
  # Egress rules
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "eks-node-group-security-group"
    Purpose = "EKS node groups security"
  })
}

# Data source for EKS worker AMI
data "aws_ami" "eks_worker" {
  filter {
    name   = "name"
    values = ["amazon-eks-node-1.28-v*"]
  }
  
  most_recent = true
  owners      = ["602401143452"] # Amazon
}

# Data source for EKS worker AMI with GPU support
data "aws_ami" "eks_worker_gpu" {
  filter {
    name   = "name"
    values = ["amazon-eks-gpu-node-1.28-v*"]
  }
  
  most_recent = true
  owners      = ["602401143452"] # Amazon
}

# Kubernetes provider configuration
provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

# EKS add-ons for essential cluster functionality
resource "aws_eks_addon" "vpc_cni" {
  cluster_name         = aws_eks_cluster.financial_platform_cluster.name
  addon_name           = "vpc-cni"
  addon_version        = "v1.15.4-eksbuild.1"
  resolve_conflicts    = "OVERWRITE"
  configuration_values = jsonencode({
    env = {
      ENABLE_PREFIX_DELEGATION = "true"
      WARM_PREFIX_TARGET      = "1"
    }
  })
  
  tags = merge(local.common_tags, {
    Name = "vpc-cni-addon"
  })
}

resource "aws_eks_addon" "coredns" {
  cluster_name      = aws_eks_cluster.financial_platform_cluster.name
  addon_name        = "coredns"
  addon_version     = "v1.10.1-eksbuild.5"
  resolve_conflicts = "OVERWRITE"
  
  tags = merge(local.common_tags, {
    Name = "coredns-addon"
  })
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name      = aws_eks_cluster.financial_platform_cluster.name
  addon_name        = "kube-proxy"
  addon_version     = "v1.28.2-eksbuild.2"
  resolve_conflicts = "OVERWRITE"
  
  tags = merge(local.common_tags, {
    Name = "kube-proxy-addon"
  })
}

resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name             = aws_eks_cluster.financial_platform_cluster.name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.24.0-eksbuild.1"
  resolve_conflicts        = "OVERWRITE"
  service_account_role_arn = aws_iam_role.ebs_csi_driver_role.arn
  
  tags = merge(local.common_tags, {
    Name = "ebs-csi-driver-addon"
  })
}

# IAM role for EBS CSI driver
resource "aws_iam_role" "ebs_csi_driver_role" {
  name = "ebs-csi-driver-role-${random_string.cluster_suffix.result}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks_oidc.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
            "${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "ebs-csi-driver-role"
  })
}

resource "aws_iam_role_policy_attachment" "ebs_csi_driver_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi_driver_role.name
}

# OIDC provider for EKS
data "tls_certificate" "eks_oidc" {
  url = aws_eks_cluster.financial_platform_cluster.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks_oidc" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.financial_platform_cluster.identity[0].oidc[0].issuer
  
  tags = merge(local.common_tags, {
    Name = "eks-oidc-provider"
  })
}

# Kubernetes cluster autoscaler configuration
resource "kubernetes_deployment" "cluster_autoscaler" {
  metadata {
    name      = "cluster-autoscaler"
    namespace = "kube-system"
    labels = {
      app = "cluster-autoscaler"
    }
  }
  
  spec {
    replicas = 1
    
    selector {
      match_labels = {
        app = "cluster-autoscaler"
      }
    }
    
    template {
      metadata {
        labels = {
          app = "cluster-autoscaler"
        }
        annotations = {
          "cluster-autoscaler.kubernetes.io/safe-to-evict" = "false"
        }
      }
      
      spec {
        priority_class_name                   = "system-cluster-critical"
        security_context {
          run_as_non_root = true
          run_as_user     = 65534
          fs_group        = 65534
        }
        
        service_account_name = kubernetes_service_account.cluster_autoscaler.metadata[0].name
        
        container {
          name  = "cluster-autoscaler"
          image = "k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.2"
          
          command = [
            "./cluster-autoscaler",
            "--v=4",
            "--stderrthreshold=info",
            "--cloud-provider=aws",
            "--skip-nodes-with-local-storage=false",
            "--expander=least-waste",
            "--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/${aws_eks_cluster.financial_platform_cluster.name}",
            "--balance-similar-node-groups",
            "--skip-nodes-with-system-pods=false"
          ]
          
          resources {
            limits = {
              cpu    = "100m"
              memory = "600Mi"
            }
            requests = {
              cpu    = "100m"
              memory = "600Mi"
            }
          }
          
          env {
            name  = "AWS_REGION"
            value = data.aws_region.current.name
          }
          
          volume_mount {
            name       = "ssl-certs"
            mount_path = "/etc/ssl/certs/ca-certificates.crt"
            read_only  = true
          }
          
          image_pull_policy = "Always"
          
          security_context {
            allow_privilege_escalation = false
            capabilities {
              drop = ["ALL"]
            }
            read_only_root_filesystem = true
          }
        }
        
        volume {
          name = "ssl-certs"
          host_path {
            path = "/etc/ssl/certs/ca-bundle.crt"
          }
        }
      }
    }
  }
  
  depends_on = [
    aws_eks_node_group.financial_services_node_group,
    aws_eks_node_group.ai_ml_node_group,
    aws_eks_node_group.data_processing_node_group,
  ]
}

# Service account for cluster autoscaler
resource "kubernetes_service_account" "cluster_autoscaler" {
  metadata {
    name      = "cluster-autoscaler"
    namespace = "kube-system"
    labels = {
      "k8s-addon" = "cluster-autoscaler.addons.k8s.io"
      "k8s-app"   = "cluster-autoscaler"
    }
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.cluster_autoscaler_role.arn
    }
  }
}

# IAM role for cluster autoscaler
resource "aws_iam_role" "cluster_autoscaler_role" {
  name = "cluster-autoscaler-role-${random_string.cluster_suffix.result}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks_oidc.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:cluster-autoscaler"
            "${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "cluster-autoscaler-role"
  })
}

resource "aws_iam_role_policy" "cluster_autoscaler_policy" {
  name = "cluster-autoscaler-policy"
  role = aws_iam_role.cluster_autoscaler_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:DescribeInstanceTypes"
        ]
        Resource = "*"
      }
    ]
  })
}

# ClusterRole for cluster autoscaler
resource "kubernetes_cluster_role" "cluster_autoscaler" {
  metadata {
    name = "cluster-autoscaler"
    labels = {
      "k8s-addon" = "cluster-autoscaler.addons.k8s.io"
      "k8s-app"   = "cluster-autoscaler"
    }
  }
  
  rule {
    api_groups = [""]
    resources  = ["events", "endpoints"]
    verbs      = ["create", "patch"]
  }
  
  rule {
    api_groups = [""]
    resources  = ["pods/eviction"]
    verbs      = ["create"]
  }
  
  rule {
    api_groups = [""]
    resources  = ["pods/status"]
    verbs      = ["update"]
  }
  
  rule {
    api_groups     = [""]
    resources      = ["endpoints"]
    resource_names = ["cluster-autoscaler"]
    verbs          = ["get", "update"]
  }
  
  rule {
    api_groups = [""]
    resources  = ["nodes"]
    verbs      = ["watch", "list", "get", "update"]
  }
  
  rule {
    api_groups = [""]
    resources  = ["pods", "services", "replicationcontrollers", "persistentvolumeclaims", "persistentvolumes"]
    verbs      = ["watch", "list", "get"]
  }
  
  rule {
    api_groups = ["extensions"]
    resources  = ["replicasets", "daemonsets"]
    verbs      = ["watch", "list", "get"]
  }
  
  rule {
    api_groups = ["policy"]
    resources  = ["poddisruptionbudgets"]
    verbs      = ["watch", "list"]
  }
  
  rule {
    api_groups = ["apps"]
    resources  = ["statefulsets", "replicasets", "daemonsets"]
    verbs      = ["watch", "list", "get"]
  }
  
  rule {
    api_groups = ["storage.k8s.io"]
    resources  = ["storageclasses", "csinodes", "csidrivers", "csistoragecapacities"]
    verbs      = ["watch", "list", "get"]
  }
  
  rule {
    api_groups = ["batch", "extensions"]
    resources  = ["jobs"]
    verbs      = ["get", "list", "watch", "patch"]
  }
  
  rule {
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
    verbs      = ["create"]
  }
  
  rule {
    api_groups     = ["coordination.k8s.io"]
    resource_names = ["cluster-autoscaler"]
    resources      = ["leases"]
    verbs          = ["get", "update"]
  }
}

# ClusterRoleBinding for cluster autoscaler
resource "kubernetes_cluster_role_binding" "cluster_autoscaler" {
  metadata {
    name = "cluster-autoscaler"
    labels = {
      "k8s-addon" = "cluster-autoscaler.addons.k8s.io"
      "k8s-app"   = "cluster-autoscaler"
    }
  }
  
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.cluster_autoscaler.metadata[0].name
  }
  
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.cluster_autoscaler.metadata[0].name
    namespace = kubernetes_service_account.cluster_autoscaler.metadata[0].namespace
  }
}

# Role for cluster autoscaler
resource "kubernetes_role" "cluster_autoscaler" {
  metadata {
    name      = "cluster-autoscaler"
    namespace = "kube-system"
    labels = {
      "k8s-addon" = "cluster-autoscaler.addons.k8s.io"
      "k8s-app"   = "cluster-autoscaler"
    }
  }
  
  rule {
    api_groups = [""]
    resources  = ["configmaps"]
    verbs      = ["create", "list", "watch"]
  }
  
  rule {
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["cluster-autoscaler-status", "cluster-autoscaler-priority-expander"]
    verbs          = ["delete", "get", "update", "watch"]
  }
}

# RoleBinding for cluster autoscaler
resource "kubernetes_role_binding" "cluster_autoscaler" {
  metadata {
    name      = "cluster-autoscaler"
    namespace = "kube-system"
    labels = {
      "k8s-addon" = "cluster-autoscaler.addons.k8s.io"
      "k8s-app"   = "cluster-autoscaler"
    }
  }
  
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.cluster_autoscaler.metadata[0].name
  }
  
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.cluster_autoscaler.metadata[0].name
    namespace = kubernetes_service_account.cluster_autoscaler.metadata[0].namespace
  }
}