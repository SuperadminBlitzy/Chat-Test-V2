# =============================================================================
# SECURITY MODULE OUTPUTS
# =============================================================================
# This file defines the outputs for the Terraform security module, exposing 
# key resource identifiers to enable other modules to reference the security 
# infrastructure. These outputs support a zero-trust security architecture 
# and comprehensive network segmentation strategy for financial services.
#
# Security Context:
# - Financial firms lose approximately $6.08 million per data breach
# - Implements multi-layered security with zero-trust architecture
# - Ensures compliance with PCI DSS, SOX, GDPR, FINRA, and Basel III/IV
# - Provides network segmentation based on Zero Trust Architecture principles
# =============================================================================

# -----------------------------------------------------------------------------
# API GATEWAY SECURITY GROUP
# -----------------------------------------------------------------------------
# Exposes the security group ID for the API Gateway infrastructure
# This security group controls ingress/egress traffic for the Kong API Gateway
# and implements rate limiting, authentication, and traffic management policies
output "api_gateway_sg_id" {
  description = "The ID of the security group for the API Gateway. This security group controls access to the Kong API Gateway infrastructure, implementing authentication, rate limiting, and traffic management policies in accordance with zero-trust security principles."
  value       = aws_security_group.api_gateway.id
  sensitive   = false

  depends_on = [
    aws_security_group.api_gateway
  ]
}

# -----------------------------------------------------------------------------
# MICROSERVICES SECURITY GROUP
# -----------------------------------------------------------------------------
# Exposes the security group ID for microservices infrastructure
# This security group implements fine-grained access controls for Spring Boot
# microservices, ensuring service-to-service communication follows zero-trust principles
output "microservices_sg_id" {
  description = "The ID of the security group for the microservices. This security group provides fine-grained access controls for Spring Boot microservices, implementing service-to-service communication policies, mTLS authentication, and network segmentation based on zero-trust architecture principles."
  value       = aws_security_group.microservices.id
  sensitive   = false

  depends_on = [
    aws_security_group.microservices
  ]
}

# -----------------------------------------------------------------------------
# DATABASE SECURITY GROUP
# -----------------------------------------------------------------------------
# Exposes the security group ID for database infrastructure
# This security group controls access to PostgreSQL and MongoDB databases
# implementing data protection measures and restricting database access
output "database_sg_id" {
  description = "The ID of the security group for the databases. This security group controls access to PostgreSQL transactional databases and MongoDB document stores, implementing strict data protection measures, encryption in transit, and access controls for financial data repositories in compliance with PCI DSS and SOX requirements."
  value       = aws_security_group.database.id
  sensitive   = false

  depends_on = [
    aws_security_group.database
  ]
}

# -----------------------------------------------------------------------------
# WEB APPLICATION FIREWALL (WAF) ACCESS CONTROL LIST
# -----------------------------------------------------------------------------
# Exposes the WAF ACL ID for application-layer security
# This WAF provides protection against OWASP Top 10 vulnerabilities
# and implements custom rules for financial services threat detection
output "waf_acl_id" {
  description = "The ID of the Web Application Firewall (WAF) Access Control List. This WAF ACL provides application-layer security protection against OWASP Top 10 vulnerabilities, SQL injection, XSS attacks, and financial services-specific threats. It implements custom rules for fraud detection and compliance with cybersecurity frameworks."
  value       = aws_wafv2_web_acl.financial_platform.id
  sensitive   = false

  depends_on = [
    aws_wafv2_web_acl.financial_platform
  ]
}

# -----------------------------------------------------------------------------
# KMS ENCRYPTION KEY ID
# -----------------------------------------------------------------------------
# Exposes the KMS key ID for data encryption
# This key is used for encrypting sensitive financial data at rest
# and ensures compliance with data protection regulations
output "kms_key_id" {
  description = "The ID of the KMS key used for data encryption. This customer-managed KMS key provides encryption at rest for sensitive financial data, database encryption, S3 bucket encryption, and EBS volume encryption. It supports key rotation, audit logging, and compliance with FIPS 140-2 Level 3 requirements for financial services data protection."
  value       = aws_kms_key.financial_platform.key_id
  sensitive   = false

  depends_on = [
    aws_kms_key.financial_platform
  ]
}

# -----------------------------------------------------------------------------
# KMS ENCRYPTION KEY ARN
# -----------------------------------------------------------------------------
# Exposes the KMS key ARN for cross-service encryption references
# This ARN enables other AWS services to reference the encryption key
# for comprehensive data protection across the platform
output "kms_key_arn" {
  description = "The ARN of the KMS key used for data encryption. This customer-managed KMS key ARN enables cross-service encryption references for comprehensive data protection across AWS services including RDS encryption, S3 server-side encryption, EBS volume encryption, and Lambda environment variable encryption in compliance with financial industry standards."
  value       = aws_kms_key.financial_platform.arn
  sensitive   = false

  depends_on = [
    aws_kms_key.financial_platform
  ]
}

# -----------------------------------------------------------------------------
# IAM SECURITY ADMINISTRATOR ROLE
# -----------------------------------------------------------------------------
# Exposes the IAM role ARN for security administrators
# This role provides privileged access for security operations
# and implements least-privilege access principles
output "iam_role_security_admin_arn" {
  description = "The ARN of the IAM role for security administrators. This role provides privileged access for security operations including security group management, KMS key administration, WAF rule configuration, and security audit functions. It implements least-privilege access principles with MFA requirements and session-based temporary credentials for enhanced security."
  value       = aws_iam_role.security_admin.arn
  sensitive   = false

  depends_on = [
    aws_iam_role.security_admin
  ]
}

# -----------------------------------------------------------------------------
# ADDITIONAL SECURITY METADATA
# -----------------------------------------------------------------------------
# These outputs provide additional context and metadata for security operations
# and compliance reporting

# Security Group Rules Summary for Documentation
output "security_groups_summary" {
  description = "Summary of all security groups created by this module for documentation and compliance reporting"
  value = {
    api_gateway = {
      id          = aws_security_group.api_gateway.id
      name        = aws_security_group.api_gateway.name
      description = aws_security_group.api_gateway.description
    }
    microservices = {
      id          = aws_security_group.microservices.id
      name        = aws_security_group.microservices.name
      description = aws_security_group.microservices.description
    }
    database = {
      id          = aws_security_group.database.id
      name        = aws_security_group.database.name
      description = aws_security_group.database.description
    }
  }
  sensitive = false
}

# KMS Key Policy ARN for Cross-Account Access
output "kms_key_policy_document" {
  description = "The KMS key policy document for compliance and audit purposes"
  value       = data.aws_iam_policy_document.kms_key_policy.json
  sensitive   = false
}

# WAF Rules Summary for Compliance Reporting
output "waf_rules_summary" {
  description = "Summary of WAF rules configured for security compliance and audit reporting"
  value = {
    web_acl_id   = aws_wafv2_web_acl.financial_platform.id
    web_acl_name = aws_wafv2_web_acl.financial_platform.name
    scope        = aws_wafv2_web_acl.financial_platform.scope
  }
  sensitive = false
}

# Security Compliance Tags
output "security_compliance_tags" {
  description = "Standardized compliance tags applied to all security resources for governance and cost allocation"
  value = {
    Environment        = var.environment
    Project           = "unified-financial-platform"
    SecurityCompliance = "PCI-DSS,SOX,GDPR,FINRA,Basel-III"
    DataClassification = "Confidential"
    CostCenter        = "Security-Operations"
    Owner             = "Security-Team"
    BackupRequired    = "true"
    MonitoringEnabled = "true"
  }
  sensitive = false
}