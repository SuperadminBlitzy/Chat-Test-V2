output "vpc_id" {
  description = "The ID of the VPC created by the networking module"
  value       = aws_vpc.main.id
  sensitive   = false
}

output "public_subnet_ids" {
  description = "A list of IDs for the public subnets"
  value       = aws_subnet.public[*].id
  sensitive   = false
}

output "private_subnet_ids" {
  description = "A list of IDs for the private subnets"
  value       = aws_subnet.private[*].id
  sensitive   = false
}

output "database_subnet_group_name" {
  description = "The name of the database subnet group"
  value       = aws_db_subnet_group.default.name
  sensitive   = false
}

output "api_gateway_security_group_id" {
  description = "The ID of the security group for the API Gateway"
  value       = aws_security_group.api_gateway.id
  sensitive   = false
}

output "eks_cluster_security_group_id" {
  description = "The ID of the security group for the EKS cluster"
  value       = aws_security_group.eks_cluster.id
  sensitive   = false
}

output "database_security_group_id" {
  description = "The ID of the security group for the databases"
  value       = aws_security_group.database.id
  sensitive   = false
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
  sensitive   = false
}

output "public_subnet_cidr_blocks" {
  description = "The CIDR blocks of the public subnets"
  value       = aws_subnet.public[*].cidr_block
  sensitive   = false
}

output "private_subnet_cidr_blocks" {
  description = "The CIDR blocks of the private subnets"
  value       = aws_subnet.private[*].cidr_block
  sensitive   = false
}

output "availability_zones" {
  description = "The availability zones where subnets are deployed"
  value       = distinct(concat(aws_subnet.public[*].availability_zone, aws_subnet.private[*].availability_zone))
  sensitive   = false
}

output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
  sensitive   = false
}

output "nat_gateway_ids" {
  description = "The IDs of the NAT Gateways"
  value       = aws_nat_gateway.main[*].id
  sensitive   = false
}

output "public_route_table_ids" {
  description = "The IDs of the public route tables"
  value       = aws_route_table.public[*].id
  sensitive   = false
}

output "private_route_table_ids" {
  description = "The IDs of the private route tables"
  value       = aws_route_table.private[*].id
  sensitive   = false
}

output "database_subnet_ids" {
  description = "The IDs of the database subnets"
  value       = aws_subnet.database[*].id
  sensitive   = false
}

output "vpc_default_security_group_id" {
  description = "The ID of the default security group for the VPC"
  value       = aws_vpc.main.default_security_group_id
  sensitive   = false
}

output "network_acl_id" {
  description = "The ID of the network ACL"
  value       = aws_network_acl.main.id
  sensitive   = false
}

output "dhcp_options_id" {
  description = "The ID of the DHCP options set"
  value       = aws_vpc_dhcp_options.main.id
  sensitive   = false
}

output "vpc_enable_dns_hostnames" {
  description = "Whether DNS hostnames are enabled for the VPC"
  value       = aws_vpc.main.enable_dns_hostnames
  sensitive   = false
}

output "vpc_enable_dns_support" {
  description = "Whether DNS support is enabled for the VPC"
  value       = aws_vpc.main.enable_dns_support
  sensitive   = false
}

output "load_balancer_security_group_id" {
  description = "The ID of the security group for load balancers"
  value       = aws_security_group.load_balancer.id
  sensitive   = false
}

output "vpc_endpoint_s3_id" {
  description = "The ID of the VPC endpoint for S3"
  value       = aws_vpc_endpoint.s3.id
  sensitive   = false
}

output "vpc_endpoint_dynamodb_id" {
  description = "The ID of the VPC endpoint for DynamoDB"
  value       = aws_vpc_endpoint.dynamodb.id
  sensitive   = false
}

output "flow_log_id" {
  description = "The ID of the VPC flow log"
  value       = aws_flow_log.main.id
  sensitive   = false
}

output "tags" {
  description = "A map of tags assigned to the resources"
  value = {
    Environment = var.environment
    Project     = "unified-financial-platform"
    Compliance  = "PCI-DSS,SOX,GDPR"
    ManagedBy   = "terraform"
    Module      = "networking"
  }
  sensitive = false
}