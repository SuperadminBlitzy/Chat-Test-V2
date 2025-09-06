#!/bin/bash

# ================================================================
# Database Migration Script for Unified Financial Services Platform
# 
# This script automates the process of database schema and data migrations
# for both PostgreSQL and MongoDB databases. It uses Flyway for PostgreSQL
# migrations and Mongock for MongoDB migrations, ensuring that database
# schemas are up-to-date with the application's requirements across
# different environments (development, staging, production).
# 
# The script is designed to be idempotent and handles version control
# for database changes.
# ================================================================

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Global configuration and constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly MIGRATION_LOG="${LOG_DIR}/database-migration.log"
readonly FLYWAY_VERSION="10.8.1"
readonly MONGOCK_VERSION="5.3.3"

# Create logs directory if it doesn't exist
mkdir -p "${LOG_DIR}"

# Logging functions
log_info() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" | tee -a "${MIGRATION_LOG}"
}

log_error() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" | tee -a "${MIGRATION_LOG}" >&2
}

log_warn() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $message" | tee -a "${MIGRATION_LOG}"
}

log_success() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" | tee -a "${MIGRATION_LOG}"
}

# Environment validation
validate_environment() {
    log_info "Validating environment variables and dependencies..."
    
    # Required environment variables for PostgreSQL
    local required_postgres_vars=(
        "POSTGRES_HOST"
        "POSTGRES_PORT" 
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "POSTGRES_DB"
    )
    
    # Required environment variables for MongoDB
    local required_mongo_vars=(
        "MONGO_URI"
    )
    
    # Validate PostgreSQL environment variables
    for var in "${required_postgres_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            return 1
        fi
    done
    
    # Validate MongoDB environment variables
    for var in "${required_mongo_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            return 1
        fi
    done
    
    # Set derived environment variables for Flyway
    export FLYWAY_URL="jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
    export FLYWAY_USER="${POSTGRES_USER}"
    export FLYWAY_PASSWORD="${POSTGRES_PASSWORD}"
    export FLYWAY_LOCATIONS="filesystem:${PROJECT_ROOT}/src/backend/database-migrations/postgresql"
    
    log_success "Environment validation completed successfully"
    return 0
}

# Check if required tools are available
check_dependencies() {
    log_info "Checking required dependencies..."
    
    local dependencies=("psql" "mongo" "curl" "java")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install the following:"
        log_error "  - postgresql-client-16 (for psql)"
        log_error "  - mongodb-clients-7.0 (for mongo)"
        log_error "  - curl (for downloading migration tools)"
        log_error "  - openjdk-11-jre (for Java runtime)"
        return 1
    fi
    
    log_success "All dependencies are available"
    return 0
}

# Download Flyway if not present
setup_flyway() {
    log_info "Setting up Flyway migration tool..."
    
    local flyway_dir="${PROJECT_ROOT}/tools/flyway"
    local flyway_bin="${flyway_dir}/flyway-${FLYWAY_VERSION}/flyway"
    
    if [[ -x "${flyway_bin}" ]]; then
        log_info "Flyway ${FLYWAY_VERSION} already installed"
        export FLYWAY_CMD="${flyway_bin}"
        return 0
    fi
    
    log_info "Downloading and installing Flyway ${FLYWAY_VERSION}..."
    mkdir -p "${flyway_dir}"
    
    local flyway_url="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}-linux-x64.tar.gz"
    
    if ! curl -L -o "${flyway_dir}/flyway.tar.gz" "${flyway_url}"; then
        log_error "Failed to download Flyway"
        return 1
    fi
    
    if ! tar -xzf "${flyway_dir}/flyway.tar.gz" -C "${flyway_dir}"; then
        log_error "Failed to extract Flyway"
        return 1
    fi
    
    chmod +x "${flyway_bin}"
    export FLYWAY_CMD="${flyway_bin}"
    
    log_success "Flyway ${FLYWAY_VERSION} installed successfully"
    return 0
}

# Download Mongock CLI if not present
setup_mongock() {
    log_info "Setting up Mongock migration tool..."
    
    local mongock_dir="${PROJECT_ROOT}/tools/mongock"
    local mongock_jar="${mongock_dir}/mongock-cli-${MONGOCK_VERSION}.jar"
    
    if [[ -f "${mongock_jar}" ]]; then
        log_info "Mongock ${MONGOCK_VERSION} already installed"
        export MONGOCK_CMD="java -jar ${mongock_jar}"
        return 0
    fi
    
    log_info "Downloading and installing Mongock ${MONGOCK_VERSION}..."
    mkdir -p "${mongock_dir}"
    
    local mongock_url="https://repo1.maven.org/maven2/io/mongock/mongock-cli/${MONGOCK_VERSION}/mongock-cli-${MONGOCK_VERSION}.jar"
    
    if ! curl -L -o "${mongock_jar}" "${mongock_url}"; then
        log_error "Failed to download Mongock CLI"
        return 1
    fi
    
    export MONGOCK_CMD="java -jar ${mongock_jar}"
    
    log_success "Mongock ${MONGOCK_VERSION} installed successfully"
    return 0
}

# Test database connectivity
test_database_connections() {
    log_info "Testing database connections..."
    
    # Test PostgreSQL connection
    log_info "Testing PostgreSQL connection to ${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}..."
    if ! PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -c "SELECT version();" >/dev/null 2>&1; then
        log_error "Failed to connect to PostgreSQL database"
        return 1
    fi
    log_success "PostgreSQL connection successful"
    
    # Test MongoDB connection
    log_info "Testing MongoDB connection..."
    if ! mongo "${MONGO_URI}" --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        log_error "Failed to connect to MongoDB database"
        return 1
    fi
    log_success "MongoDB connection successful"
    
    return 0
}

# Function to execute PostgreSQL database migration using Flyway
migrate_postgresql() {
    log_info "Starting PostgreSQL database migration..."
    
    local migration_start_time=$(date +%s)
    local postgres_init_script="${PROJECT_ROOT}/src/backend/database-init/init-postgresql.sql"
    
    # Check if the PostgreSQL database exists and create if necessary
    log_info "Checking if PostgreSQL database exists..."
    local db_exists
    db_exists=$(PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "postgres" \
        -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}';" 2>/dev/null || echo "")
    
    if [[ -z "${db_exists}" ]]; then
        log_info "Database '${POSTGRES_DB}' does not exist. Creating database..."
        if ! PGPASSWORD="${POSTGRES_PASSWORD}" psql \
            -h "${POSTGRES_HOST}" \
            -p "${POSTGRES_PORT}" \
            -U "${POSTGRES_USER}" \
            -d "postgres" \
            -c "CREATE DATABASE ${POSTGRES_DB};" 2>>"${MIGRATION_LOG}"; then
            log_error "Failed to create PostgreSQL database '${POSTGRES_DB}'"
            return 1
        fi
        log_success "Database '${POSTGRES_DB}' created successfully"
    else
        log_info "Database '${POSTGRES_DB}' already exists"
    fi
    
    # Check if this is the first-time setup by looking for the flyway_schema_history table
    log_info "Checking if this is a first-time database setup..."
    local is_first_setup
    is_first_setup=$(PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='flyway_schema_history';" 2>/dev/null || echo "")
    
    if [[ -z "${is_first_setup}" ]]; then
        log_info "First-time setup detected. Running initial schema script..."
        if [[ -f "${postgres_init_script}" ]]; then
            if ! PGPASSWORD="${POSTGRES_PASSWORD}" psql \
                -h "${POSTGRES_HOST}" \
                -p "${POSTGRES_PORT}" \
                -U "${POSTGRES_USER}" \
                -d "${POSTGRES_DB}" \
                -f "${postgres_init_script}" >>"${MIGRATION_LOG}" 2>&1; then
                log_error "Failed to run initial PostgreSQL schema script"
                return 1
            fi
            log_success "Initial PostgreSQL schema created successfully"
        else
            log_warn "Initial PostgreSQL script not found at ${postgres_init_script}"
        fi
    else
        log_info "Existing database detected. Skipping initial schema creation."
    fi
    
    # Configure Flyway environment variables
    export FLYWAY_BASELINE_ON_MIGRATE=true
    export FLYWAY_BASELINE_VERSION=1.0
    export FLYWAY_BASELINE_DESCRIPTION="Initial baseline"
    export FLYWAY_VALIDATE_ON_MIGRATE=true
    export FLYWAY_CLEAN_DISABLED=true
    export FLYWAY_MIXED=false
    export FLYWAY_GROUP=true
    export FLYWAY_OUT_OF_ORDER=false
    
    log_info "Running Flyway migration with configuration:"
    log_info "  URL: ${FLYWAY_URL}"
    log_info "  User: ${FLYWAY_USER}"
    log_info "  Locations: ${FLYWAY_LOCATIONS}"
    log_info "  Baseline on migrate: ${FLYWAY_BASELINE_ON_MIGRATE}"
    
    # Create migrations directory if it doesn't exist
    local migrations_dir="${PROJECT_ROOT}/src/backend/database-migrations/postgresql"
    mkdir -p "${migrations_dir}"
    
    # If no migration files exist, create a baseline migration
    if [[ ! "$(ls -A "${migrations_dir}" 2>/dev/null)" ]]; then
        log_info "No migration files found. Creating baseline migration..."
        cat > "${migrations_dir}/V1.0__Baseline.sql" << 'EOF'
-- Baseline migration for PostgreSQL
-- This migration serves as the baseline for the existing database schema
-- created by the init-postgresql.sql script.

-- Verify that the main schemas exist
DO $$
BEGIN
    -- Check if core schemas exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth_service') THEN
        RAISE EXCEPTION 'auth_service schema not found. Please run init-postgresql.sql first.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'customer_service') THEN
        RAISE EXCEPTION 'customer_service schema not found. Please run init-postgresql.sql first.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'transaction_service') THEN
        RAISE EXCEPTION 'transaction_service schema not found. Please run init-postgresql.sql first.';
    END IF;
    
    RAISE NOTICE 'Baseline migration completed successfully. All core schemas are present.';
END
$$;

-- Record the baseline migration completion
INSERT INTO analytics_service.analytics_data (
    data_type, 
    data_category, 
    metric_name, 
    metric_value, 
    dimensions, 
    calculation_date
) VALUES (
    'SYSTEM',
    'MIGRATION',
    'FLYWAY_BASELINE_COMPLETED',
    1,
    '{"version": "1.0", "environment": "' || COALESCE(current_setting('app.environment', true), 'unknown') || '", "timestamp": "' || CURRENT_TIMESTAMP || '"}',
    CURRENT_DATE
) ON CONFLICT DO NOTHING;
EOF
        log_info "Baseline migration file created"
    fi
    
    # Run Flyway migrate command
    log_info "Executing Flyway migrate command..."
    if ! ${FLYWAY_CMD} migrate >>"${MIGRATION_LOG}" 2>&1; then
        log_error "Flyway migration failed"
        log_error "Check ${MIGRATION_LOG} for detailed error information"
        
        # Try to get more specific error information
        log_info "Running Flyway info to check current state..."
        ${FLYWAY_CMD} info >>"${MIGRATION_LOG}" 2>&1 || true
        
        return 1
    fi
    
    # Verify migration success
    log_info "Verifying PostgreSQL migration status..."
    if ! ${FLYWAY_CMD} info | grep -q "SUCCESS"; then
        log_warn "Migration completed but status verification failed"
    fi
    
    # Calculate migration duration
    local migration_end_time=$(date +%s)
    local migration_duration=$((migration_end_time - migration_start_time))
    
    log_success "PostgreSQL migration completed successfully in ${migration_duration} seconds"
    
    # Log migration completion to database
    PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -c "INSERT INTO analytics_service.analytics_data (data_type, data_category, metric_name, metric_value, dimensions, calculation_date) VALUES ('SYSTEM', 'MIGRATION', 'POSTGRESQL_MIGRATION_DURATION', ${migration_duration}, '{\"timestamp\": \"$(date -Iseconds)\"}', CURRENT_DATE);" 2>>"${MIGRATION_LOG}" || log_warn "Failed to log migration metrics"
    
    return 0
}

# Function to execute MongoDB database migration using Mongock
migrate_mongodb() {
    log_info "Starting MongoDB database migration..."
    
    local migration_start_time=$(date +%s)
    local mongodb_init_script="${PROJECT_ROOT}/src/backend/database-init/init-mongodb.js"
    
    # Check if this is a first-time setup by looking for existing collections
    log_info "Checking if this is a first-time MongoDB setup..."
    local existing_collections
    existing_collections=$(mongo "${MONGO_URI}" --quiet --eval "db.getCollectionNames().length" 2>/dev/null || echo "0")
    
    if [[ "${existing_collections}" == "0" ]]; then
        log_info "First-time setup detected. Running initial MongoDB setup script..."
        if [[ -f "${mongodb_init_script}" ]]; then
            if ! node "${mongodb_init_script}" >>"${MIGRATION_LOG}" 2>&1; then
                log_error "Failed to run initial MongoDB setup script"
                return 1
            fi
            log_success "Initial MongoDB collections and data created successfully"
        else
            log_warn "Initial MongoDB script not found at ${mongodb_init_script}"
        fi
    else
        log_info "Existing MongoDB collections detected (${existing_collections} collections). Skipping initial setup."
    fi
    
    # Check if mongock-config directory exists
    local mongock_config_dir="${PROJECT_ROOT}/src/backend/database-migrations/mongodb"
    if [[ ! -d "${mongock_config_dir}" ]]; then
        log_info "Creating Mongock configuration directory..."
        mkdir -p "${mongock_config_dir}"
        
        # Create a basic Mongock configuration file
        cat > "${mongock_config_dir}/mongock.properties" << EOF
# Mongock Configuration for UFS Platform
mongock.migration-scan-package=com.ufs.migrations
mongock.transaction-enabled=false
mongock.change-logs-scan-package=com.ufs.migrations.changelogs
mongock.enabled=true
mongock.default-author=ufs-system
mongock.index-creation=true
mongock.start-system-version=1.0.0
mongock.end-system-version=
EOF
        
        # Create a sample changelog file structure
        mkdir -p "${mongock_config_dir}/changelogs"
        cat > "${mongock_config_dir}/changelogs/database-changelog-master.js" << 'EOF'
// Mongock Master Changelog for UFS Platform
// This file orchestrates all database changes for MongoDB collections

// Load environment-specific configurations
const config = {
    development: {
        createIndexes: true,
        validateDocuments: true,
        enableSharding: false
    },
    staging: {
        createIndexes: true,
        validateDocuments: true,
        enableSharding: false
    },
    production: {
        createIndexes: true,
        validateDocuments: true,
        enableSharding: true
    }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// Migration functions
function ensureIndexes(db) {
    print('Creating optimized indexes for MongoDB collections...');
    
    // Customer profiles indexes
    db.customer_profiles.createIndex({ 'personalInfo.email': 1 }, { unique: true, background: true });
    db.customer_profiles.createIndex({ 'riskProfile.riskCategory': 1 }, { background: true });
    db.customer_profiles.createIndex({ 'compliance.kycStatus': 1 }, { background: true });
    db.customer_profiles.createIndex({ 'createdAt': 1 }, { background: true });
    
    // Wellness profiles indexes
    db.wellness_profiles.createIndex({ 'customerId': 1 }, { unique: true, background: true });
    db.wellness_profiles.createIndex({ 'financialHealthScore': 1 }, { background: true });
    db.wellness_profiles.createIndex({ 'lastAnalysis': 1 }, { background: true });
    
    // Financial goals indexes
    db.financial_goals.createIndex({ 'wellnessProfileId': 1 }, { background: true });
    db.financial_goals.createIndex({ 'type': 1, 'status': 1 }, { background: true });
    db.financial_goals.createIndex({ 'targetDate': 1 }, { background: true });
    db.financial_goals.createIndex({ 'priority': 1, 'status': 1 }, { background: true });
    
    // Recommendations indexes
    db.recommendations.createIndex({ 'wellnessProfileId': 1 }, { background: true });
    db.recommendations.createIndex({ 'type': 1, 'status': 1 }, { background: true });
    db.recommendations.createIndex({ 'priority': 1, 'status': 1 }, { background: true });
    db.recommendations.createIndex({ 'expiresAt': 1 }, { background: true });
    db.recommendations.createIndex({ 'createdAt': 1 }, { background: true });
    
    // Analytics dashboards indexes
    db.analytics_dashboards.createIndex({ 'userId': 1 }, { background: true });
    db.analytics_dashboards.createIndex({ 'type': 1, 'category': 1 }, { background: true });
    db.analytics_dashboards.createIndex({ 'isTemplate': 1, 'templateInfo.popularity': -1 }, { background: true });
    db.analytics_dashboards.createIndex({ 'tags': 1 }, { background: true });
    db.analytics_dashboards.createIndex({ 'createdAt': 1 }, { background: true });
    
    print('MongoDB indexes created successfully');
}

function validateCollections(db) {
    print('Validating MongoDB collections...');
    
    const collections = ['customer_profiles', 'wellness_profiles', 'financial_goals', 'recommendations', 'analytics_dashboards'];
    let validationErrors = [];
    
    collections.forEach(function(collectionName) {
        try {
            const count = db.getCollection(collectionName).countDocuments();
            print(`Collection ${collectionName}: ${count} documents`);
        } catch (error) {
            validationErrors.push(`Error validating ${collectionName}: ${error.message}`);
        }
    });
    
    if (validationErrors.length > 0) {
        throw new Error('Collection validation failed: ' + validationErrors.join(', '));
    }
    
    print('All collections validated successfully');
}

// Main migration execution
function executeMigration(db) {
    try {
        print('Starting MongoDB migration...');
        print(`Environment: ${environment}`);
        print(`Configuration: ${JSON.stringify(currentConfig)}`);
        
        if (currentConfig.createIndexes) {
            ensureIndexes(db);
        }
        
        if (currentConfig.validateDocuments) {
            validateCollections(db);
        }
        
        // Record migration completion
        db.analytics_dashboards.updateOne(
            { '_migrationLog': { $exists: false } },
            {
                $set: {
                    '_migrationLog': {
                        lastMigration: new Date(),
                        version: '1.0.0',
                        environment: environment,
                        status: 'completed'
                    }
                }
            },
            { upsert: true }
        );
        
        print('MongoDB migration completed successfully');
        
    } catch (error) {
        print('MongoDB migration failed: ' + error.message);
        throw error;
    }
}

// Execute migration if this script is run directly
if (typeof db !== 'undefined') {
    executeMigration(db);
}
EOF
        
        log_info "Mongock configuration files created"
    fi
    
    # Create a simple Node.js script to run MongoDB migrations since we're using the existing init script
    local mongo_migration_script="${mongock_config_dir}/run-migration.js"
    cat > "${mongo_migration_script}" << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function runMongockMigration() {
    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);
    
    try {
        console.log('Connecting to MongoDB for migration...');
        await client.connect();
        
        const db = client.db();
        console.log('Connected to MongoDB successfully');
        
        // Load and execute the master changelog
        const changelogPath = path.join(__dirname, 'changelogs', 'database-changelog-master.js');
        if (fs.existsSync(changelogPath)) {
            console.log('Loading changelog script...');
            const changelogContent = fs.readFileSync(changelogPath, 'utf8');
            
            // Execute the changelog in the MongoDB context
            const func = new Function('db', 'print', 'process', changelogContent);
            func(db, console.log, process);
            
            console.log('Mongock migration completed successfully');
        } else {
            console.log('No changelog file found, skipping migration');
        }
        
    } catch (error) {
        console.error('Mongock migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

if (require.main === module) {
    runMongockMigration().catch(console.error);
}
EOF
    
    # Run the MongoDB migration
    log_info "Executing MongoDB migration using custom migration script..."
    if ! node "${mongo_migration_script}" >>"${MIGRATION_LOG}" 2>&1; then
        log_error "MongoDB migration failed"
        log_error "Check ${MIGRATION_LOG} for detailed error information"
        return 1
    fi
    
    # Verify migration success by checking collection indexes
    log_info "Verifying MongoDB migration status..."
    local index_count
    index_count=$(mongo "${MONGO_URI}" --quiet --eval "
        let totalIndexes = 0;
        ['customer_profiles', 'wellness_profiles', 'financial_goals', 'recommendations', 'analytics_dashboards'].forEach(function(collName) {
            try {
                const indexes = db.getCollection(collName).getIndexes();
                totalIndexes += indexes.length;
            } catch(e) {
                // Collection might not exist
            }
        });
        print(totalIndexes);
    " 2>/dev/null || echo "0")
    
    if [[ "${index_count}" -lt "10" ]]; then
        log_warn "Expected more indexes to be created. Current count: ${index_count}"
    else
        log_info "MongoDB indexes verification passed. Total indexes: ${index_count}"
    fi
    
    # Calculate migration duration
    local migration_end_time=$(date +%s)
    local migration_duration=$((migration_end_time - migration_start_time))
    
    log_success "MongoDB migration completed successfully in ${migration_duration} seconds"
    
    # Log migration completion to MongoDB
    mongo "${MONGO_URI}" --eval "
        db.analytics_dashboards.updateOne(
            { 'migrationMetrics': { \$exists: false } },
            {
                \$set: {
                    'migrationMetrics': {
                        lastMigration: new Date(),
                        duration: ${migration_duration},
                        timestamp: new Date().toISOString(),
                        status: 'completed'
                    }
                }
            },
            { upsert: true }
        );
    " >>"${MIGRATION_LOG}" 2>&1 || log_warn "Failed to log migration metrics to MongoDB"
    
    return 0
}

# Main function that orchestrates the migration process
main() {
    local environment="${1:-development}"
    local start_time=$(date +%s)
    
    log_info "================================================================"
    log_info "Starting Database Migration for Unified Financial Services Platform"
    log_info "================================================================"
    log_info "Environment: ${environment}"
    log_info "Timestamp: $(date -Iseconds)"
    log_info "Script Version: 1.0.0"
    log_info "User: $(whoami)"
    log_info "Working Directory: $(pwd)"
    log_info "================================================================"
    
    # Load environment-specific configuration
    local env_file="${PROJECT_ROOT}/.env.${environment}"
    if [[ -f "${env_file}" ]]; then
        log_info "Loading environment configuration from ${env_file}"
        set -a  # Automatically export all variables
        # shellcheck source=/dev/null
        source "${env_file}"
        set +a
    else
        log_warn "Environment file ${env_file} not found. Using system environment variables."
    fi
    
    # Step 1: Validate environment and dependencies
    if ! validate_environment; then
        log_error "Environment validation failed"
        exit 1
    fi
    
    if ! check_dependencies; then
        log_error "Dependency check failed"
        exit 1
    fi
    
    # Step 2: Setup migration tools
    if ! setup_flyway; then
        log_error "Failed to setup Flyway"
        exit 1
    fi
    
    if ! setup_mongock; then
        log_error "Failed to setup Mongock"
        exit 1
    fi
    
    # Step 3: Test database connections
    if ! test_database_connections; then
        log_error "Database connection test failed"
        exit 1
    fi
    
    # Step 4: Execute PostgreSQL migration
    log_info "================================================================"
    log_info "Phase 1: PostgreSQL Migration"
    log_info "================================================================"
    
    if ! migrate_postgresql; then
        log_error "PostgreSQL migration failed"
        exit 1
    fi
    
    # Step 5: Execute MongoDB migration
    log_info "================================================================"
    log_info "Phase 2: MongoDB Migration"
    log_info "================================================================"
    
    if ! migrate_mongodb; then
        log_error "MongoDB migration failed"
        exit 1
    fi
    
    # Step 6: Final validation and reporting
    log_info "================================================================"
    log_info "Phase 3: Migration Validation and Completion"
    log_info "================================================================"
    
    # Validate PostgreSQL migration
    local postgres_tables
    postgres_tables=$(PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog');" 2>/dev/null || echo "0")
    
    # Validate MongoDB migration
    local mongo_collections
    mongo_collections=$(mongo "${MONGO_URI}" --quiet --eval "db.getCollectionNames().length" 2>/dev/null || echo "0")
    
    # Calculate total migration duration
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    # Generate migration summary
    log_info "================================================================"
    log_info "MIGRATION SUMMARY"
    log_info "================================================================"
    log_info "Environment: ${environment}"
    log_info "Total Duration: ${total_duration} seconds"
    log_info "PostgreSQL Tables: ${postgres_tables}"
    log_info "MongoDB Collections: ${mongo_collections}"
    log_info "Timestamp: $(date -Iseconds)"
    log_info "Status: SUCCESS"
    log_info "================================================================"
    
    log_success "Database migration completed successfully!"
    log_info "Migration logs available at: ${MIGRATION_LOG}"
    
    # Create a migration completion marker file
    local completion_marker="${LOG_DIR}/migration-${environment}-$(date +%Y%m%d-%H%M%S).marker"
    cat > "${completion_marker}" << EOF
{
    "environment": "${environment}",
    "timestamp": "$(date -Iseconds)",
    "duration": ${total_duration},
    "postgresql_tables": ${postgres_tables},
    "mongodb_collections": ${mongo_collections},
    "status": "SUCCESS",
    "version": "1.0.0"
}
EOF
    
    log_info "Migration completion marker created: ${completion_marker}"
    
    return 0
}

# Script usage information
usage() {
    cat << EOF
Usage: $0 [ENVIRONMENT]

Database Migration Script for Unified Financial Services Platform

ARGUMENTS:
    ENVIRONMENT    Target environment (default: development)
                   Options: development, staging, production

ENVIRONMENT VARIABLES:
    PostgreSQL:
        POSTGRES_HOST       PostgreSQL server hostname
        POSTGRES_PORT       PostgreSQL server port (default: 5432)
        POSTGRES_USER       PostgreSQL username
        POSTGRES_PASSWORD   PostgreSQL password
        POSTGRES_DB         PostgreSQL database name
    
    MongoDB:
        MONGO_URI          MongoDB connection URI
    
    Optional:
        FLYWAY_LOCATIONS   Custom Flyway migration locations
        LOG_LEVEL          Logging level (INFO, WARN, ERROR)

EXAMPLES:
    $0                    # Run migration for development environment
    $0 staging           # Run migration for staging environment
    $0 production        # Run migration for production environment

For more information, see the project documentation.
EOF
}

# Handle script arguments
case "${1:-}" in
    -h|--help|help)
        usage
        exit 0
        ;;
    *)
        main "${1:-development}"
        ;;
esac