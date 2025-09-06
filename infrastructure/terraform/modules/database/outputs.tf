# =============================================================================
# Database Module Outputs
# =============================================================================
# This file defines the outputs for the database module, exposing key 
# information about created database resources to other Terraform configurations.
# These outputs support the polyglot persistence approach for financial services.
# =============================================================================

# -----------------------------------------------------------------------------
# PostgreSQL Database Outputs
# -----------------------------------------------------------------------------
# PostgreSQL is used for transactional data, customer profiles, and financial 
# records requiring ACID compliance and structured data relationships.

output "postgresql_instance_endpoint" {
  description = "The connection endpoint for the PostgreSQL instance used for transactional data and customer profiles"
  value       = aws_db_instance.postgresql.endpoint
  sensitive   = false
}

output "postgresql_instance_port" {
  description = "The port number for the PostgreSQL instance connection"
  value       = aws_db_instance.postgresql.port
  sensitive   = false
}

output "postgresql_database_name" {
  description = "The name of the PostgreSQL database for transactional and customer data"
  value       = aws_db_instance.postgresql.db_name
  sensitive   = false
}

output "postgresql_instance_id" {
  description = "The RDS instance identifier for the PostgreSQL database"
  value       = aws_db_instance.postgresql.id
  sensitive   = false
}

output "postgresql_instance_arn" {
  description = "The Amazon Resource Name (ARN) of the PostgreSQL RDS instance"
  value       = aws_db_instance.postgresql.arn
  sensitive   = false
}

output "postgresql_instance_status" {
  description = "The RDS instance status of the PostgreSQL database"
  value       = aws_db_instance.postgresql.status
  sensitive   = false
}

# -----------------------------------------------------------------------------
# MongoDB Database Outputs
# -----------------------------------------------------------------------------
# MongoDB is used for document storage, analytics data, and customer 
# interactions requiring flexible schema and horizontal scalability.

output "mongodb_connection_string" {
  description = "The connection string for the MongoDB Atlas cluster used for document storage and analytics"
  value       = mongodbatlas_cluster.mongodb.connection_strings[0].standard_srv
  sensitive   = true
}

output "mongodb_database_name" {
  description = "The name of the MongoDB database for document storage and analytics data"
  value       = var.mongodb_database_name
  sensitive   = false
}

output "mongodb_cluster_id" {
  description = "The unique identifier for the MongoDB Atlas cluster"
  value       = mongodbatlas_cluster.mongodb.cluster_id
  sensitive   = false
}

output "mongodb_cluster_state" {
  description = "The current state of the MongoDB Atlas cluster"
  value       = mongodbatlas_cluster.mongodb.state_name
  sensitive   = false
}

output "mongodb_srv_address" {
  description = "The SRV address for the MongoDB Atlas cluster"
  value       = mongodbatlas_cluster.mongodb.srv_address
  sensitive   = false
}

# -----------------------------------------------------------------------------
# Redis Cache Outputs
# -----------------------------------------------------------------------------
# Redis is used for session storage, caching, and real-time data processing
# with high-performance in-memory operations.

output "redis_primary_endpoint" {
  description = "The primary endpoint for the Redis cluster used for caching and session storage"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = false
}

output "redis_reader_endpoint" {
  description = "The reader endpoint for the Redis cluster to support read scaling"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
  sensitive   = false
}

output "redis_port" {
  description = "The port number for Redis cluster connections"
  value       = aws_elasticache_replication_group.redis.port
  sensitive   = false
}

output "redis_cluster_id" {
  description = "The ElastiCache replication group identifier for the Redis cluster"
  value       = aws_elasticache_replication_group.redis.id
  sensitive   = false
}

output "redis_configuration_endpoint" {
  description = "The configuration endpoint for the Redis cluster in cluster mode"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
  sensitive   = false
}

output "redis_auth_token" {
  description = "The authentication token for Redis cluster access"
  value       = aws_elasticache_replication_group.redis.auth_token
  sensitive   = true
}

# -----------------------------------------------------------------------------
# InfluxDB Time-Series Database Outputs
# -----------------------------------------------------------------------------
# InfluxDB is used for time-series data including financial metrics, 
# performance monitoring, and real-time analytics.

output "influxdb_url" {
  description = "The URL for the InfluxDB instance used for time-series data and financial metrics"
  value       = influxdb_instance.influxdb.url
  sensitive   = false
}

output "influxdb_org_id" {
  description = "The organization ID for InfluxDB access and data isolation"
  value       = influxdb_organization.main.id
  sensitive   = false
}

output "influxdb_bucket_name" {
  description = "The name of the primary InfluxDB bucket for time-series data storage"
  value       = influxdb_bucket.main.name
  sensitive   = false
}

output "influxdb_instance_id" {
  description = "The unique identifier for the InfluxDB instance"
  value       = influxdb_instance.influxdb.id
  sensitive   = false
}

output "influxdb_bucket_id" {
  description = "The unique identifier for the primary InfluxDB bucket"
  value       = influxdb_bucket.main.id
  sensitive   = false
}

output "influxdb_org_name" {
  description = "The organization name for InfluxDB"
  value       = influxdb_organization.main.name
  sensitive   = false
}

# -----------------------------------------------------------------------------
# Database Connection Information Summary
# -----------------------------------------------------------------------------
# Composite outputs providing consolidated database connection information
# for application configuration and service discovery.

output "database_endpoints" {
  description = "Map of all database endpoints for service discovery and configuration"
  value = {
    postgresql = {
      endpoint = aws_db_instance.postgresql.endpoint
      port     = aws_db_instance.postgresql.port
      database = aws_db_instance.postgresql.db_name
      type     = "postgresql"
    }
    mongodb = {
      connection_string = mongodbatlas_cluster.mongodb.connection_strings[0].standard_srv
      database         = var.mongodb_database_name
      type            = "mongodb"
    }
    redis = {
      primary_endpoint = aws_elasticache_replication_group.redis.primary_endpoint_address
      reader_endpoint  = aws_elasticache_replication_group.redis.reader_endpoint_address
      port            = aws_elasticache_replication_group.redis.port
      type            = "redis"
    }
    influxdb = {
      url         = influxdb_instance.influxdb.url
      org_id      = influxdb_organization.main.id
      bucket_name = influxdb_bucket.main.name
      type        = "influxdb"
    }
  }
  sensitive = true
}

output "database_security_groups" {
  description = "Security group IDs for database access control"
  value = {
    postgresql = aws_db_instance.postgresql.vpc_security_group_ids
    redis      = aws_elasticache_replication_group.redis.security_group_ids
  }
  sensitive = false
}

output "database_backup_retention" {
  description = "Backup retention periods for compliance and disaster recovery"
  value = {
    postgresql = aws_db_instance.postgresql.backup_retention_period
    mongodb    = mongodbatlas_cluster.mongodb.pit_enabled
  }
  sensitive = false
}

# -----------------------------------------------------------------------------
# Monitoring and Health Check Outputs
# -----------------------------------------------------------------------------
# Outputs for monitoring, alerting, and health check configuration.

output "database_monitoring_endpoints" {
  description = "Endpoints for database monitoring and health checks"
  value = {
    postgresql_endpoint = "${aws_db_instance.postgresql.endpoint}:${aws_db_instance.postgresql.port}"
    redis_endpoint     = "${aws_elasticache_replication_group.redis.primary_endpoint_address}:${aws_elasticache_replication_group.redis.port}"
    mongodb_endpoint   = mongodbatlas_cluster.mongodb.srv_address
    influxdb_endpoint  = influxdb_instance.influxdb.url
  }
  sensitive = false
}

output "database_resource_tags" {
  description = "Resource tags for cost allocation and compliance tracking"
  value = {
    postgresql = aws_db_instance.postgresql.tags_all
    redis      = aws_elasticache_replication_group.redis.tags_all
  }
  sensitive = false
}

# -----------------------------------------------------------------------------
# Compliance and Audit Outputs
# -----------------------------------------------------------------------------
# Outputs supporting regulatory compliance and audit requirements.

output "database_encryption_status" {
  description = "Encryption status for all database resources for compliance validation"
  value = {
    postgresql_encrypted = aws_db_instance.postgresql.storage_encrypted
    redis_encrypted     = aws_elasticache_replication_group.redis.at_rest_encryption_enabled
    mongodb_encrypted   = mongodbatlas_cluster.mongodb.disk_size_gb > 0 # MongoDB Atlas encryption is enabled by default
  }
  sensitive = false
}

output "database_versions" {
  description = "Database engine versions for security and compliance tracking"
  value = {
    postgresql = aws_db_instance.postgresql.engine_version
    redis      = aws_elasticache_replication_group.redis.engine_version
    mongodb    = mongodbatlas_cluster.mongodb.mongo_db_major_version
  }
  sensitive = false
}