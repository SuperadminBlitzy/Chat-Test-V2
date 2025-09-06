# Terraform configuration and provider requirements
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# Data sources for availability zones and VPC information
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  
  filter {
    name   = "tag:Type"
    values = ["private"]
  }
}

# Random password generation for database credentials
resource "random_password" "postgresql_password" {
  length  = 16
  special = true
  # Special characters safe for PostgreSQL
  override_special = "!#$%&*()-_=+[]{}<>:?"
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "random_password" "mongodb_password" {
  length  = 16
  special = true
  # Special characters safe for MongoDB
  override_special = "!#$%&*()-_=+[]{}<>:?"
  
  lifecycle {
    create_before_destroy = true
  }
}

# KMS keys for encryption at rest
resource "aws_kms_key" "database_encryption" {
  description             = "KMS key for database encryption - Unified Financial Services Platform"
  deletion_window_in_days = var.is_production ? 30 : 10
  enable_key_rotation     = true
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableIAMUserPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowDatabaseServices"
        Effect = "Allow"
        Principal = {
          Service = [
            "rds.amazonaws.com",
            "docdb.amazonaws.com",
            "elasticache.amazonaws.com"
          ]
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
  
  tags = merge(var.common_tags, {
    Name        = "ufs-database-encryption-key"
    Component   = "security"
    Environment = var.is_production ? "production" : "development"
  })
}

resource "aws_kms_alias" "database_encryption" {
  name          = "alias/ufs-database-encryption"
  target_key_id = aws_kms_key.database_encryption.key_id
}

# Database subnet group for multi-AZ deployment
resource "aws_db_subnet_group" "postgresql" {
  name       = "ufs-postgresql-subnet-group"
  subnet_ids = length(data.aws_subnets.private.ids) > 0 ? data.aws_subnets.private.ids : data.aws_subnets.default.ids
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-subnet-group"
    Component = "database"
    Database  = "postgresql"
  })
}

# DocumentDB subnet group
resource "aws_docdb_subnet_group" "mongodb" {
  name       = "ufs-mongodb-subnet-group"
  subnet_ids = length(data.aws_subnets.private.ids) > 0 ? data.aws_subnets.private.ids : data.aws_subnets.default.ids
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-subnet-group"
    Component = "database"
    Database  = "mongodb"
  })
}

# ElastiCache subnet group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "ufs-redis-subnet-group"
  subnet_ids = length(data.aws_subnets.private.ids) > 0 ? data.aws_subnets.private.ids : data.aws_subnets.default.ids
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-subnet-group"
    Component = "cache"
    Database  = "redis"
  })
}

# Security groups
resource "aws_security_group" "postgresql" {
  name_prefix = "ufs-postgresql-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for PostgreSQL database - Unified Financial Services Platform"
  
  ingress {
    description = "PostgreSQL access from application layer"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-sg"
    Component = "security"
    Database  = "postgresql"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "mongodb" {
  name_prefix = "ufs-mongodb-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for MongoDB DocumentDB cluster - Unified Financial Services Platform"
  
  ingress {
    description = "MongoDB access from application layer"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-sg"
    Component = "security"
    Database  = "mongodb"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "ufs-redis-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for Redis ElastiCache cluster - Unified Financial Services Platform"
  
  ingress {
    description = "Redis access from application layer"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-sg"
    Component = "security"
    Database  = "redis"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "influxdb" {
  name_prefix = "ufs-influxdb-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for InfluxDB instance - Unified Financial Services Platform"
  
  ingress {
    description = "InfluxDB HTTP API access"
    from_port   = 8086
    to_port     = 8086
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  
  ingress {
    description = "SSH access for management"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
  
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-sg"
    Component = "security"
    Database  = "influxdb"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# PostgreSQL RDS instance with enterprise-grade configuration
resource "aws_db_instance" "postgresql_instance" {
  # Basic configuration
  identifier     = "ufs-postgresql"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.postgresql_instance_class
  
  # Storage configuration optimized for financial workloads
  allocated_storage     = var.postgresql_allocated_storage
  max_allocated_storage = var.postgresql_allocated_storage * 2
  storage_type          = "gp3"  # Updated to GP3 for better performance
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.database_encryption.arn
  
  # IOPS configuration for high-performance requirements
  iops = var.postgresql_instance_class == "db.t3.micro" ? null : 3000
  
  # Database configuration
  db_name  = "ufs_db"
  username = "ufs_admin"
  password = random_password.postgresql_password.result
  
  # Network and security configuration
  vpc_security_group_ids = [aws_security_group.postgresql.id]
  db_subnet_group_name   = aws_db_subnet_group.postgresql.name
  publicly_accessible    = false
  
  # High availability configuration
  multi_az               = var.is_production
  availability_zone      = var.is_production ? null : data.aws_availability_zones.available.names[0]
  
  # Backup and maintenance configuration
  backup_retention_period   = var.is_production ? 35 : 7
  backup_window            = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"
  skip_final_snapshot      = !var.is_production
  final_snapshot_identifier = var.is_production ? "ufs-postgresql-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  copy_tags_to_snapshot    = true
  
  # Performance and monitoring configuration
  performance_insights_enabled          = var.is_production
  performance_insights_retention_period = var.is_production ? 7 : null
  performance_insights_kms_key_id      = var.is_production ? aws_kms_key.database_encryption.arn : null
  monitoring_interval                   = var.is_production ? 60 : 0
  monitoring_role_arn                  = var.is_production ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  enabled_cloudwatch_logs_exports      = ["postgresql", "upgrade"]
  
  # Deletion protection for production
  deletion_protection = var.is_production
  
  # Parameter group for optimized PostgreSQL configuration
  parameter_group_name = aws_db_parameter_group.postgresql.name
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql"
    Component = "database"
    Database  = "postgresql"
    Backup    = "required"
  })
  
  depends_on = [aws_db_parameter_group.postgresql]
}

# PostgreSQL parameter group for financial services optimization
resource "aws_db_parameter_group" "postgresql" {
  family = "postgres16"
  name   = "ufs-postgresql-params"
  
  # Connection and memory settings optimized for financial workloads
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,pg_hint_plan"
  }
  
  parameter {
    name  = "max_connections"
    value = var.is_production ? "200" : "100"
  }
  
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/32768}"
  }
  
  parameter {
    name  = "effective_cache_size"
    value = "{DBInstanceClassMemory/16384}"
  }
  
  parameter {
    name  = "work_mem"
    value = "16384"  # 16MB for complex financial queries
  }
  
  parameter {
    name  = "maintenance_work_mem"
    value = "2097152"  # 2GB for maintenance operations
  }
  
  # Logging configuration for compliance and auditing
  parameter {
    name  = "log_statement"
    value = var.is_production ? "mod" : "all"
  }
  
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries taking longer than 1 second
  }
  
  parameter {
    name  = "log_lock_waits"
    value = "1"
  }
  
  parameter {
    name  = "log_checkpoints"
    value = "1"
  }
  
  # Security and compliance settings
  parameter {
    name  = "ssl"
    value = "1"
  }
  
  parameter {
    name  = "log_connections"
    value = "1"
  }
  
  parameter {
    name  = "log_disconnections"
    value = "1"
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-params"
    Component = "database"
    Database  = "postgresql"
  })
}

# Read replica for PostgreSQL (production only)
resource "aws_db_instance" "postgresql_read_replica" {
  count = var.is_production ? 1 : 0
  
  identifier             = "ufs-postgresql-read-replica"
  replicate_source_db    = aws_db_instance.postgresql_instance.identifier
  instance_class         = var.postgresql_instance_class
  publicly_accessible    = false
  auto_minor_version_upgrade = false
  
  # Enhanced monitoring
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_enhanced_monitoring[0].arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-read-replica"
    Component = "database"
    Database  = "postgresql"
    Role      = "read-replica"
  })
}

# MongoDB DocumentDB cluster with financial services configuration
resource "aws_docdb_cluster" "mongodb_cluster" {
  cluster_identifier      = "ufs-mongodb-cluster"
  engine                 = "docdb"
  engine_version         = "5.0.0"
  master_username        = "ufs_mongo_admin"
  master_password        = random_password.mongodb_password.result
  
  # High availability configuration
  backup_retention_period = var.is_production ? 35 : 7
  preferred_backup_window = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"
  skip_final_snapshot    = !var.is_production
  final_snapshot_identifier = var.is_production ? "ufs-mongodb-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  # Security configuration
  storage_encrypted   = true
  kms_key_id         = aws_kms_key.database_encryption.arn
  vpc_security_group_ids = [aws_security_group.mongodb.id]
  db_subnet_group_name = aws_docdb_subnet_group.mongodb.name
  
  # Cluster parameter group for optimized configuration
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.mongodb.name
  
  # Logging configuration
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]
  
  # Deletion protection for production
  deletion_protection = var.is_production
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-cluster"
    Component = "database"
    Database  = "mongodb"
    Backup    = "required"
  })
  
  depends_on = [aws_docdb_cluster_parameter_group.mongodb]
}

# DocumentDB cluster parameter group
resource "aws_docdb_cluster_parameter_group" "mongodb" {
  family = "docdb5.0"
  name   = "ufs-mongodb-cluster-params"
  
  # Enable auditing for compliance
  parameter {
    name  = "audit_logs"
    value = "enabled"
  }
  
  # Enable profiler for performance monitoring
  parameter {
    name  = "profiler"
    value = "enabled"
  }
  
  parameter {
    name  = "profiler_threshold_ms"
    value = "1000"  # Profile queries taking longer than 1 second
  }
  
  # TLS configuration for security
  parameter {
    name  = "tls"
    value = "enabled"
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-cluster-params"
    Component = "database"
    Database  = "mongodb"
  })
}

# DocumentDB cluster instances
resource "aws_docdb_cluster_instance" "mongodb_instances" {
  count              = var.is_production ? 3 : 1
  identifier         = "ufs-mongodb-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.mongodb_cluster.id
  instance_class     = var.is_production ? "db.t4g.medium" : "db.t4g.medium"
  
  # Enhanced monitoring
  performance_insights_enabled = var.is_production
  monitoring_interval         = var.is_production ? 60 : 0
  monitoring_role_arn        = var.is_production ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-instance-${count.index + 1}"
    Component = "database"
    Database  = "mongodb"
    Role      = count.index == 0 ? "primary" : "secondary"
  })
}

# Redis ElastiCache cluster with high availability
resource "aws_elasticache_replication_group" "redis_cluster" {
  replication_group_id       = "ufs-redis-cluster"
  description               = "Redis cluster for Unified Financial Services Platform"
  
  # Cluster configuration
  node_type                 = var.redis_node_type
  port                     = 6379
  parameter_group_name     = aws_elasticache_parameter_group.redis.name
  engine_version           = "7.2"
  
  # High availability configuration
  num_cache_clusters       = var.is_production ? 3 : var.redis_num_nodes
  automatic_failover_enabled = var.is_production ? true : false
  multi_az_enabled         = var.is_production ? true : false
  
  # Security configuration
  subnet_group_name        = aws_elasticache_subnet_group.redis.name
  security_group_ids       = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id              = aws_kms_key.database_encryption.arn
  auth_token              = var.is_production ? random_password.redis_auth_token[0].result : null
  
  # Backup configuration
  snapshot_retention_limit = var.is_production ? 7 : 1
  snapshot_window         = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  
  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-cluster"
    Component = "cache"
    Database  = "redis"
    Backup    = "required"
  })
  
  depends_on = [aws_elasticache_parameter_group.redis]
}

# Redis parameter group for financial services optimization
resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "ufs-redis-params"
  
  # Memory and performance optimization
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
  
  parameter {
    name  = "timeout"
    value = "300"  # 5 minute timeout for idle connections
  }
  
  parameter {
    name  = "tcp-keepalive"
    value = "60"
  }
  
  # Slow log configuration for monitoring
  parameter {
    name  = "slowlog-log-slower-than"
    value = "10000"  # 10ms threshold
  }
  
  parameter {
    name  = "slowlog-max-len"
    value = "1024"
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-params"
    Component = "cache"
    Database  = "redis"
  })
}

# Auth token for Redis (production only)
resource "random_password" "redis_auth_token" {
  count   = var.is_production ? 1 : 0
  length  = 64
  special = false  # Redis auth token should be alphanumeric only
}

# CloudWatch log group for Redis slow log
resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/aws/elasticache/redis/ufs-redis-slow-log"
  retention_in_days = var.is_production ? 30 : 7
  kms_key_id       = aws_kms_key.database_encryption.arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-slow-log"
    Component = "logging"
    Database  = "redis"
  })
}

# InfluxDB EC2 instance with enterprise configuration
resource "aws_instance" "influxdb_instance" {
  ami           = var.influxdb_ami
  instance_type = var.influxdb_instance_type
  
  # Network configuration
  vpc_security_group_ids = [aws_security_group.influxdb.id]
  subnet_id             = length(data.aws_subnets.private.ids) > 0 ? data.aws_subnets.private.ids[0] : data.aws_subnets.default.ids[0]
  
  # Storage configuration with encryption
  root_block_device {
    volume_type           = "gp3"
    volume_size          = var.is_production ? 500 : 100
    encrypted            = true
    kms_key_id          = aws_kms_key.database_encryption.arn
    delete_on_termination = !var.is_production
    
    tags = merge(var.common_tags, {
      Name = "ufs-influxdb-root-volume"
    })
  }
  
  # Additional data volume for InfluxDB data
  ebs_block_device {
    device_name          = "/dev/sdf"
    volume_type          = "gp3"
    volume_size          = var.is_production ? 1000 : 200
    encrypted            = true
    kms_key_id          = aws_kms_key.database_encryption.arn
    delete_on_termination = !var.is_production
    
    tags = merge(var.common_tags, {
      Name = "ufs-influxdb-data-volume"
    })
  }
  
  # IAM instance profile for CloudWatch and SSM
  iam_instance_profile = aws_iam_instance_profile.influxdb.name
  
  # User data for initial setup
  user_data = base64encode(templatefile("${path.module}/scripts/influxdb-setup.sh", {
    is_production = var.is_production
    kms_key_id   = aws_kms_key.database_encryption.arn
  }))
  
  # Monitoring and backup
  monitoring = var.is_production
  
  # Termination protection for production
  disable_api_termination = var.is_production
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb"
    Component = "database"
    Database  = "influxdb"
    Backup    = "required"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# Enhanced monitoring IAM role for RDS
resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.is_production ? 1 : 0
  name  = "ufs-rds-enhanced-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(var.common_tags, {
    Name      = "ufs-rds-enhanced-monitoring-role"
    Component = "monitoring"
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count      = var.is_production ? 1 : 0
  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# IAM role for InfluxDB instance
resource "aws_iam_role" "influxdb_role" {
  name = "ufs-influxdb-role"
  
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
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-role"
    Component = "compute"
  })
}

resource "aws_iam_role_policy" "influxdb_policy" {
  name = "ufs-influxdb-policy"
  role = aws_iam_role.influxdb_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.database_encryption.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/ufs/influxdb/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "influxdb" {
  name = "ufs-influxdb-profile"
  role = aws_iam_role.influxdb_role.name
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-profile"
    Component = "compute"
  })
}

# Data source for current AWS account ID
data "aws_caller_identity" "current" {}

# Data source for default subnets (fallback)
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

# SSM parameters for storing database connection information securely
resource "aws_ssm_parameter" "postgresql_endpoint" {
  name  = "/ufs/database/postgresql/endpoint"
  type  = "String"
  value = aws_db_instance.postgresql_instance.endpoint
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-endpoint"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "postgresql_username" {
  name  = "/ufs/database/postgresql/username"
  type  = "String"
  value = aws_db_instance.postgresql_instance.username
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-username"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "postgresql_password" {
  name   = "/ufs/database/postgresql/password"
  type   = "SecureString"
  value  = random_password.postgresql_password.result
  key_id = aws_kms_key.database_encryption.arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-password"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "mongodb_endpoint" {
  name  = "/ufs/database/mongodb/endpoint"
  type  = "String"
  value = aws_docdb_cluster.mongodb_cluster.endpoint
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-endpoint"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "mongodb_username" {
  name  = "/ufs/database/mongodb/username"
  type  = "String"
  value = aws_docdb_cluster.mongodb_cluster.master_username
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-username"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "mongodb_password" {
  name   = "/ufs/database/mongodb/password"
  type   = "SecureString"
  value  = random_password.mongodb_password.result
  key_id = aws_kms_key.database_encryption.arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-password"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "/ufs/database/redis/endpoint"
  type  = "String"
  value = aws_elasticache_replication_group.redis_cluster.primary_endpoint_address
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-endpoint"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "redis_auth_token" {
  count  = var.is_production ? 1 : 0
  name   = "/ufs/database/redis/auth_token"
  type   = "SecureString"
  value  = random_password.redis_auth_token[0].result
  key_id = aws_kms_key.database_encryption.arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-auth-token"
    Component = "configuration"
  })
}

resource "aws_ssm_parameter" "influxdb_endpoint" {
  name  = "/ufs/database/influxdb/endpoint"
  type  = "String"
  value = "http://${aws_instance.influxdb_instance.private_ip}:8086"
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-endpoint"
    Component = "configuration"
  })
}

# CloudWatch alarms for database monitoring
resource "aws_cloudwatch_metric_alarm" "postgresql_cpu" {
  alarm_name          = "ufs-postgresql-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/RDS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors PostgreSQL CPU utilization"
  alarm_actions      = var.is_production ? [aws_sns_topic.database_alerts[0].arn] : []
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql_instance.id
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-postgresql-cpu-alarm"
    Component = "monitoring"
  })
}

resource "aws_cloudwatch_metric_alarm" "mongodb_cpu" {
  alarm_name          = "ufs-mongodb-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/DocDB"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors MongoDB CPU utilization"
  alarm_actions      = var.is_production ? [aws_sns_topic.database_alerts[0].arn] : []
  
  dimensions = {
    DBClusterIdentifier = aws_docdb_cluster.mongodb_cluster.id
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-mongodb-cpu-alarm"
    Component = "monitoring"
  })
}

resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "ufs-redis-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/ElastiCache"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors Redis CPU utilization"
  alarm_actions      = var.is_production ? [aws_sns_topic.database_alerts[0].arn] : []
  
  dimensions = {
    CacheClusterId = "${aws_elasticache_replication_group.redis_cluster.replication_group_id}-001"
  }
  
  tags = merge(var.common_tags, {
    Name      = "ufs-redis-cpu-alarm"
    Component = "monitoring"
  })
}

# SNS topic for database alerts (production only)
resource "aws_sns_topic" "database_alerts" {
  count = var.is_production ? 1 : 0
  name  = "ufs-database-alerts"
  
  kms_master_key_id = aws_kms_key.database_encryption.arn
  
  tags = merge(var.common_tags, {
    Name      = "ufs-database-alerts"
    Component = "monitoring"
  })
}

# Backup automation for InfluxDB using AWS Systems Manager
resource "aws_ssm_document" "influxdb_backup" {
  name          = "UFS-InfluxDB-Backup"
  document_type = "Command"
  document_format = "YAML"
  
  content = yamlencode({
    schemaVersion = "2.2"
    description   = "Backup InfluxDB data for Unified Financial Services Platform"
    parameters = {
      bucketName = {
        type        = "String"
        description = "S3 bucket for backup storage"
        default     = "ufs-influxdb-backups-${random_id.bucket_suffix.hex}"
      }
    }
    mainSteps = [
      {
        action = "aws:runShellScript"
        name   = "backupInfluxDB"
        inputs = {
          runCommand = [
            "#!/bin/bash",
            "set -e",
            "BACKUP_DATE=$(date +%Y%m%d_%H%M%S)",
            "BACKUP_DIR=/tmp/influxdb_backup_$BACKUP_DATE",
            "mkdir -p $BACKUP_DIR",
            "influxd backup -portable $BACKUP_DIR",
            "tar -czf /tmp/influxdb_backup_$BACKUP_DATE.tar.gz -C /tmp influxdb_backup_$BACKUP_DATE",
            "aws s3 cp /tmp/influxdb_backup_$BACKUP_DATE.tar.gz s3://{{bucketName}}/backups/influxdb_backup_$BACKUP_DATE.tar.gz",
            "rm -rf $BACKUP_DIR /tmp/influxdb_backup_$BACKUP_DATE.tar.gz",
            "echo \"Backup completed successfully: influxdb_backup_$BACKUP_DATE.tar.gz\""
          ]
        }
      }
    ]
  })
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-backup-document"
    Component = "backup"
  })
}

# Random ID for unique S3 bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 bucket for InfluxDB backups
resource "aws_s3_bucket" "influxdb_backups" {
  bucket = "ufs-influxdb-backups-${random_id.bucket_suffix.hex}"
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-backups"
    Component = "backup"
  })
}

resource "aws_s3_bucket_encryption_configuration" "influxdb_backups" {
  bucket = aws_s3_bucket.influxdb_backups.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.database_encryption.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "influxdb_backups" {
  bucket = aws_s3_bucket.influxdb_backups.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "influxdb_backups" {
  bucket = aws_s3_bucket.influxdb_backups.id
  
  rule {
    id     = "backup_lifecycle"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    
    expiration {
      days = var.is_production ? 2555 : 365  # 7 years for production, 1 year for dev
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# EventBridge rule for automated InfluxDB backups
resource "aws_cloudwatch_event_rule" "influxdb_backup_schedule" {
  name                = "ufs-influxdb-backup-schedule"
  description         = "Trigger InfluxDB backup daily"
  schedule_expression = var.is_production ? "cron(0 2 * * ? *)" : "cron(0 6 * * SUN *)"  # Daily at 2 AM for prod, weekly for dev
  
  tags = merge(var.common_tags, {
    Name      = "ufs-influxdb-backup-schedule"
    Component = "backup"
  })
}

resource "aws_cloudwatch_event_target" "influxdb_backup_target" {
  rule      = aws_cloudwatch_event_rule.influxdb_backup_schedule.name
  target_id = "InfluxDBBackupTarget"
  arn       = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:document/${aws_ssm_document.influxdb_backup.name}"
  
  input = jsonencode({
    bucketName = aws_s3_bucket.influxdb_backups.bucket
  })
  
  run_command_targets {
    key    = "InstanceIds"
    values = [aws_instance.influxdb_instance.id]
  }
  
  role_arn = aws_iam_role.eventbridge_ssm_role.arn
}

# IAM role for EventBridge to execute SSM documents
resource "aws_iam_role" "eventbridge_ssm_role" {
  name = "ufs-eventbridge-ssm-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = merge(var.common_tags, {
    Name      = "ufs-eventbridge-ssm-role"
    Component = "automation"
  })
}

resource "aws_iam_role_policy" "eventbridge_ssm_policy" {
  name = "ufs-eventbridge-ssm-policy"
  role = aws_iam_role.eventbridge_ssm_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:DescribeInstanceInformation",
          "ssm:DescribeCommandInvocations"
        ]
        Resource = "*"
      }
    ]
  })
}

# Data source for current AWS region
data "aws_region" "current" {}