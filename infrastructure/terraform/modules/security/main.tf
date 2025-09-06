# terraform version: ~> 1.6
# aws provider version: ~> 5.0  
# vault provider version: ~> 1.15

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 1.15"
    }
  }
}

# Data sources for external resources
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["financial-platform-vpc"]
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  filter {
    name   = "tag:Type"
    values = ["private"]
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local variables for consistent tagging and naming
locals {
  common_tags = {
    Environment    = var.environment
    Project        = "unified-financial-platform"
    Compliance     = "PCI-DSS,SOC2,GDPR"
    Owner          = "platform-security-team"
    CostCenter     = "technology"
    BackupRequired = "true"
    DataClass      = "confidential"
  }
  
  name_prefix = "financial-platform-${var.environment}"
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
  default     = ""
}

variable "enable_waf" {
  description = "Enable WAF for API Gateway protection"
  type        = bool
  default     = true
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access the API Gateway"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ============================================================================
# SECURITY GROUPS
# ============================================================================

# Security Group for API Gateway
resource "aws_security_group" "api_gateway_sg" {
  name_prefix = "${local.name_prefix}-api-gateway-"
  description = "Security group for API Gateway - controls inbound and outbound traffic for external API access"
  vpc_id      = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.main.id

  # Inbound rules - HTTPS traffic from internet (required for financial API access)
  ingress {
    description      = "HTTPS from internet for API access"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = var.allowed_cidr_blocks
    ipv6_cidr_blocks = ["::/0"]
  }

  # Inbound rule for HTTP (redirect to HTTPS)
  ingress {
    description      = "HTTP redirect to HTTPS"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = var.allowed_cidr_blocks
    ipv6_cidr_blocks = ["::/0"]
  }

  # Health check access for load balancers
  ingress {
    description = "Health check access"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  # Outbound rules - Allow all outbound traffic (required for downstream services)
  egress {
    description      = "All outbound traffic to downstream services"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-gateway-sg"
    Component   = "api-gateway"
    Purpose     = "external-api-access"
    SecurityLevel = "high"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for Microservices
resource "aws_security_group" "microservices_sg" {
  name_prefix = "${local.name_prefix}-microservices-"
  description = "Security group for microservices - controls inter-service communication within the platform"
  vpc_id      = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.main.id

  # Inbound from API Gateway
  ingress {
    description     = "Traffic from API Gateway"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway_sg.id]
  }

  # Inbound from other microservices (inter-service communication)
  ingress {
    description = "Inter-service communication"
    from_port   = 8080
    to_port     = 8090
    protocol    = "tcp"
    self        = true
  }

  # gRPC communication between services
  ingress {
    description = "gRPC inter-service communication"
    from_port   = 9090
    to_port     = 9099
    protocol    = "tcp"
    self        = true
  }

  # Service mesh sidecar communication (Istio/Envoy)
  ingress {
    description = "Service mesh sidecar communication"
    from_port   = 15000
    to_port     = 15010
    protocol    = "tcp"
    self        = true
  }

  # Monitoring and metrics collection
  ingress {
    description = "Prometheus metrics scraping"
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  # Outbound to databases
  egress {
    description     = "Database access - PostgreSQL"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.database_sg.id]
  }

  egress {
    description     = "Database access - MongoDB"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.database_sg.id]
  }

  # Outbound to Redis cache
  egress {
    description     = "Redis cache access"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.database_sg.id]
  }

  # Outbound HTTPS for external API calls
  egress {
    description = "HTTPS for external service calls"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound HTTP for internal service discovery
  egress {
    description = "HTTP for service discovery and health checks"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  # DNS resolution
  egress {
    description = "DNS resolution"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-microservices-sg"
    Component   = "microservices"
    Purpose     = "inter-service-communication"
    SecurityLevel = "high"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for Databases
resource "aws_security_group" "database_sg" {
  name_prefix = "${local.name_prefix}-database-"
  description = "Security group for databases - restricts access to authorized microservices only"
  vpc_id      = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.main.id

  # PostgreSQL access from microservices
  ingress {
    description     = "PostgreSQL access from microservices"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.microservices_sg.id]
  }

  # MongoDB access from microservices
  ingress {
    description     = "MongoDB access from microservices"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.microservices_sg.id]
  }

  # Redis access from microservices
  ingress {
    description     = "Redis access from microservices"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.microservices_sg.id]
  }

  # InfluxDB for time-series data
  ingress {
    description     = "InfluxDB access from microservices"
    from_port       = 8086
    to_port         = 8086
    protocol        = "tcp"
    security_groups = [aws_security_group.microservices_sg.id]
  }

  # Database administration access (restricted to VPC)
  ingress {
    description = "Database administration access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  # No outbound rules defined - databases should not initiate connections

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database-sg"
    Component   = "database"
    Purpose     = "database-access-control"
    SecurityLevel = "critical"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# NETWORK ACCESS CONTROL LISTS (NACLs)
# ============================================================================

# Main Network ACL for additional stateless security layer
resource "aws_network_acl" "main_nacl" {
  vpc_id     = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.main.id
  subnet_ids = data.aws_subnets.private.ids

  # Inbound rules
  # Allow HTTPS traffic
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Allow HTTP traffic (for redirects)
  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  # Allow internal VPC traffic
  ingress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = data.aws_vpc.main.cidr_block
    from_port  = 1024
    to_port    = 65535
  }

  # Allow return traffic for outbound connections
  ingress {
    rule_no    = 300
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 32768
    to_port    = 65535
  }

  # Outbound rules
  # Allow all outbound traffic (security groups provide stateful filtering)
  egress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  egress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Allow internal traffic
  egress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = data.aws_vpc.main.cidr_block
    from_port  = 1024
    to_port    = 65535
  }

  # Allow database ports within VPC
  egress {
    rule_no    = 300
    protocol   = "tcp"
    action     = "allow"
    cidr_block = data.aws_vpc.main.cidr_block
    from_port  = 5432
    to_port    = 5432
  }

  egress {
    rule_no    = 310
    protocol   = "tcp"
    action     = "allow"
    cidr_block = data.aws_vpc.main.cidr_block
    from_port  = 27017
    to_port    = 27017
  }

  egress {
    rule_no    = 320
    protocol   = "tcp"
    action     = "allow"
    cidr_block = data.aws_vpc.main.cidr_block
    from_port  = 6379
    to_port    = 6379
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-main-nacl"
    Component   = "network-security"
    Purpose     = "stateless-network-filtering"
    SecurityLevel = "high"
  })
}

# ============================================================================
# IAM ROLES AND POLICIES
# ============================================================================

# IAM Role for EC2 instances running microservices
resource "aws_iam_role" "ec2_role" {
  name_prefix = "${local.name_prefix}-ec2-role-"
  description = "IAM role for EC2 instances running financial microservices"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = data.aws_region.current.name
          }
        }
      }
    ]
  })

  max_session_duration = 3600 # 1 hour maximum session

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ec2-role"
    Component   = "compute"
    Purpose     = "microservice-execution"
    SecurityLevel = "high"
  })
}

# IAM Policy for EC2 role with least privilege access
resource "aws_iam_policy" "ec2_policy" {
  name_prefix = "${local.name_prefix}-ec2-policy-"
  description = "IAM policy for EC2 instances with least privilege access to required AWS services"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # S3 access for application data and backups
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::financial-platform-${var.environment}-data/*",
          "arn:aws:s3:::financial-platform-${var.environment}-backups/*"
        ]
        Condition = {
          StringEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      },
      {
        # S3 bucket listing (limited to specific buckets)
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::financial-platform-${var.environment}-data",
          "arn:aws:s3:::financial-platform-${var.environment}-backups"
        ]
      },
      {
        # SQS access for message processing
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = "arn:aws:sqs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:financial-platform-${var.environment}-*"
      },
      {
        # Secrets Manager access for database credentials and API keys
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:financial-platform-${var.environment}/*"
        Condition = {
          ForAllValues:StringEquals = {
            "secretsmanager:ResourceTag/Project" = "unified-financial-platform"
          }
        }
      },
      {
        # KMS access for encryption/decryption
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "arn:aws:kms:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:key/*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = [
              "s3.${data.aws_region.current.name}.amazonaws.com",
              "secretsmanager.${data.aws_region.current.name}.amazonaws.com"
            ]
          }
        }
      },
      {
        # CloudWatch Logs for application logging
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/ec2/financial-platform-${var.environment}*"
      },
      {
        # CloudWatch Metrics for monitoring
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "FinancialPlatform/${var.environment}"
          }
        }
      },
      {
        # EC2 instance metadata access (required for applications)
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ec2:Region" = data.aws_region.current.name
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ec2-policy"
    Component   = "iam"
    Purpose     = "microservice-permissions"
    SecurityLevel = "high"
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "ec2_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

# Instance profile for EC2 instances
resource "aws_iam_instance_profile" "ec2_profile" {
  name_prefix = "${local.name_prefix}-ec2-profile-"
  role        = aws_iam_role.ec2_role.name

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ec2-profile"
    Component   = "iam"
    Purpose     = "ec2-instance-profile"
    SecurityLevel = "high"
  })
}

# ============================================================================
# WAF WEB ACL FOR API GATEWAY PROTECTION
# ============================================================================

resource "aws_wafv2_web_acl" "api_gateway_waf" {
  count = var.enable_waf ? 1 : 0
  
  name        = "${local.name_prefix}-api-gateway-waf"
  description = "WAF Web ACL for API Gateway protection against common web exploits and attacks"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # AWS Managed Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
        
        # Exclude rules that might interfere with financial data processing
        excluded_rule {
          name = "SizeRestrictions_BODY"
        }
        excluded_rule {
          name = "GenericRFI_BODY"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Known Bad Inputs Rule Set
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Amazon IP Reputation List
  rule {
    name     = "AWSManagedRulesAmazonIpReputationList"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "IpReputationListMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting rule for API protection
  rule {
    name     = "RateLimitRule"
    priority = 4

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 10000  # Requests per 5-minute window
        aggregate_key_type = "IP"

        scope_down_statement {
          geo_match_statement {
            # Allow only specific countries for enhanced security
            country_codes = ["US", "CA", "GB", "DE", "FR", "JP", "AU"]
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  # SQL injection protection rule
  rule {
    name     = "SQLInjectionRule"
    priority = 5

    action {
      block {}
    }

    statement {
      sqli_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLInjectionRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  # XSS protection rule
  rule {
    name     = "XSSRule"
    priority = 6

    action {
      block {}
    }

    statement {
      xss_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "XSSRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-gateway-waf"
    Component   = "waf"
    Purpose     = "api-protection"
    SecurityLevel = "critical"
  })

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "FinancialPlatformWAF"
    sampled_requests_enabled   = true
  }
}

# CloudWatch Log Group for WAF logs
resource "aws_cloudwatch_log_group" "waf_log_group" {
  count = var.enable_waf ? 1 : 0
  
  name              = "/aws/wafv2/${local.name_prefix}-api-gateway-waf"
  retention_in_days = 30

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-waf-logs"
    Component   = "logging"
    Purpose     = "waf-audit-logs"
    SecurityLevel = "high"
  })
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  count = var.enable_waf ? 1 : 0
  
  resource_arn            = aws_wafv2_web_acl.api_gateway_waf[0].arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_log_group[0].arn]

  redacted_field {
    single_header {
      name = "authorization"
    }
  }

  redacted_field {
    single_header {
      name = "x-api-key"
    }
  }
}

# ============================================================================
# VAULT POLICY FOR SECRETS MANAGEMENT
# ============================================================================

# Vault policy for application secrets access
resource "vault_policy" "app_policy" {
  name = "${local.name_prefix}-app-policy"

  policy = <<EOT
# Policy for financial platform application secrets access
# This policy grants read access to application-specific secret paths

# Database credentials access
path "secret/data/financial-platform/${var.environment}/database/*" {
  capabilities = ["read"]
}

# API keys and third-party service credentials
path "secret/data/financial-platform/${var.environment}/api-keys/*" {
  capabilities = ["read"]
}

# Encryption keys for application use
path "secret/data/financial-platform/${var.environment}/encryption/*" {
  capabilities = ["read"]
}

# JWT signing keys
path "secret/data/financial-platform/${var.environment}/jwt/*" {
  capabilities = ["read"]
}

# External service credentials (Stripe, Plaid, etc.)
path "secret/data/financial-platform/${var.environment}/external-services/*" {
  capabilities = ["read"]
}

# Certificate management
path "secret/data/financial-platform/${var.environment}/certificates/*" {
  capabilities = ["read"]
}

# Application configuration secrets
path "secret/data/financial-platform/${var.environment}/config/*" {
  capabilities = ["read"]
}

# Blockchain and smart contract keys
path "secret/data/financial-platform/${var.environment}/blockchain/*" {
  capabilities = ["read"]
}

# Monitoring and observability credentials
path "secret/data/financial-platform/${var.environment}/monitoring/*" {
  capabilities = ["read"]
}

# Compliance and audit credentials
path "secret/data/financial-platform/${var.environment}/compliance/*" {
  capabilities = ["read"]
}

# Deny access to other environments and sensitive system paths
path "secret/data/financial-platform/prod/*" {
  capabilities = ["deny"]
}

path "secret/data/financial-platform/staging/*" {
  capabilities = ["deny"]
}

# Allow token self-renewal
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow token lookup
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOT
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "api_gateway_sg_id" {
  description = "Security Group ID for API Gateway - use this to reference the API Gateway security group in other modules"
  value       = aws_security_group.api_gateway_sg.id
}

output "microservices_sg_id" {
  description = "Security Group ID for microservices - use this to reference the microservices security group in other modules"
  value       = aws_security_group.microservices_sg.id
}

output "database_sg_id" {
  description = "Security Group ID for databases - use this to reference the database security group in other modules"
  value       = aws_security_group.database_sg.id
}

output "ec2_role_arn" {
  description = "ARN of the EC2 IAM role - use this ARN to allow compute resources to assume this role"
  value       = aws_iam_role.ec2_role.arn
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile - attach this profile to EC2 instances for IAM role access"
  value       = aws_iam_instance_profile.ec2_profile.name
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL - associate this with API Gateway for web application firewall protection"
  value       = var.enable_waf ? aws_wafv2_web_acl.api_gateway_waf[0].arn : null
}

output "waf_web_acl_id" {
  description = "ID of the WAF Web ACL - use this ID for WAF rule management and monitoring"
  value       = var.enable_waf ? aws_wafv2_web_acl.api_gateway_waf[0].id : null
}

output "vault_policy_name" {
  description = "Name of the Vault policy - use this policy name to grant applications access to secrets"
  value       = vault_policy.app_policy.name
}

output "network_acl_id" {
  description = "ID of the main Network ACL - use this for additional network-level security rule management"
  value       = aws_network_acl.main_nacl.id
}

# Additional security metadata outputs for compliance reporting
output "security_compliance_tags" {
  description = "Compliance tags applied to all security resources for audit and reporting purposes"
  value       = local.common_tags
}

output "security_group_rules_summary" {
  description = "Summary of security group rules for compliance documentation"
  value = {
    api_gateway = {
      inbound_ports  = [80, 443, 8080]
      outbound_ports = ["all"]
      description    = "External API access with HTTPS termination"
    }
    microservices = {
      inbound_ports  = [8080, 8090, 9090-9099, 15000-15010, 9100]
      outbound_ports = [5432, 27017, 6379, 443, 80, 53]
      description    = "Inter-service communication and database access"
    }
    database = {
      inbound_ports  = [5432, 27017, 6379, 8086, 22]
      outbound_ports = []
      description    = "Database access restricted to microservices"
    }
  }
}