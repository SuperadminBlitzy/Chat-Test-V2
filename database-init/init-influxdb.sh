#!/usr/bin/env bash

# InfluxDB Initialization Script for Unified Financial Services Platform
# This script initializes InfluxDB for time-series financial metrics and performance monitoring
# Compatible with InfluxDB 2.7+ and follows enterprise security standards

set -euo pipefail
IFS=$'\n\t'

# =============================================================================
# GLOBAL CONFIGURATION VARIABLES
# =============================================================================

# InfluxDB Connection Configuration
readonly INFLUXDB_URL="${INFLUXDB_URL:-http://localhost:8086}"
readonly INFLUXDB_TOKEN="${INFLUXDB_TOKEN?Environment variable INFLUXDB_TOKEN is required}"
readonly INFLUXDB_ORG="${INFLUXDB_ORG:-UFS}"
readonly INFLUXDB_BUCKET="${INFLUXDB_BUCKET:-financial_metrics}"
readonly INFLUXDB_USER="${INFLUXDB_USER:-ufs_application_user}"
readonly INFLUXDB_PASSWORD="${INFLUXDB_PASSWORD?Environment variable INFLUXDB_PASSWORD is required}"

# Retention Policy Configuration
readonly RETENTION_POLICY_DURATION="${RETENTION_POLICY_DURATION:-730d}"

# Script Configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly LOG_TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"
readonly MAX_RETRY_ATTEMPTS=5
readonly RETRY_DELAY=10
readonly HEALTH_CHECK_TIMEOUT=300
readonly HEALTH_CHECK_INTERVAL=5

# Application-specific configurations for financial services
readonly FINANCIAL_BUCKET_DESCRIPTION="Primary bucket for financial metrics, transaction data, and KPI storage"
readonly PERFORMANCE_BUCKET="performance_metrics"
readonly PERFORMANCE_BUCKET_DESCRIPTION="Performance monitoring and system metrics for observability stack"
readonly AUDIT_BUCKET="audit_logs"
readonly AUDIT_BUCKET_DESCRIPTION="Audit trail and compliance logging for regulatory reporting"

# User permissions and roles for financial services compliance
readonly APP_USER_DESCRIPTION="Application service user for financial metrics collection"
readonly READ_WRITE_PERMISSIONS="read:authorizations read:buckets read:dashboards read:sources read:tasks read:telegrafs read:users read:variables read:secrets read:labels read:views read:documents write:authorizations write:buckets write:tasks write:telegrafs write:users write:variables write:secrets write:labels write:views write:documents"

# =============================================================================
# LOGGING AND UTILITY FUNCTIONS
# =============================================================================

# Centralized logging function with structured output
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S UTC')"
    
    case "$level" in
        "INFO")
            echo "[$timestamp] [INFO] [$SCRIPT_NAME] $message" >&1
            ;;
        "WARN")
            echo "[$timestamp] [WARN] [$SCRIPT_NAME] $message" >&2
            ;;
        "ERROR")
            echo "[$timestamp] [ERROR] [$SCRIPT_NAME] $message" >&2
            ;;
        "DEBUG")
            if [[ "${DEBUG:-false}" == "true" ]]; then
                echo "[$timestamp] [DEBUG] [$SCRIPT_NAME] $message" >&2
            fi
            ;;
        *)
            echo "[$timestamp] [UNKNOWN] [$SCRIPT_NAME] $message" >&2
            ;;
    esac
}

# Error handling function with cleanup
error_exit() {
    local error_message="$1"
    local exit_code="${2:-1}"
    
    log "ERROR" "Fatal error occurred: $error_message"
    log "ERROR" "Script execution failed. Exit code: $exit_code"
    log "INFO" "Performing cleanup operations..."
    
    # Cleanup temporary files if any were created
    if [[ -n "${TEMP_CONFIG_FILE:-}" && -f "$TEMP_CONFIG_FILE" ]]; then
        rm -f "$TEMP_CONFIG_FILE"
        log "DEBUG" "Removed temporary configuration file: $TEMP_CONFIG_FILE"
    fi
    
    exit "$exit_code"
}

# Validation function for required environment variables
validate_environment() {
    log "INFO" "Validating environment configuration..."
    
    local required_vars=("INFLUXDB_TOKEN" "INFLUXDB_PASSWORD")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error_exit "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    # Validate InfluxDB URL format
    if ! [[ "$INFLUXDB_URL" =~ ^https?://[^[:space:]]+$ ]]; then
        error_exit "Invalid InfluxDB URL format: $INFLUXDB_URL"
    fi
    
    # Validate retention policy duration format
    if ! [[ "$RETENTION_POLICY_DURATION" =~ ^[0-9]+[hdmy]$ ]]; then
        error_exit "Invalid retention policy duration format: $RETENTION_POLICY_DURATION (expected: Nh, Nd, Nm, Ny)"
    fi
    
    log "INFO" "Environment validation completed successfully"
}

# Retry mechanism with exponential backoff
retry_with_backoff() {
    local max_attempts="$1"
    local delay="$2"
    local description="$3"
    shift 3
    local command=("$@")
    
    local attempt=1
    local backoff_delay="$delay"
    
    while [[ $attempt -le $max_attempts ]]; do
        log "DEBUG" "Attempt $attempt/$max_attempts: $description"
        
        if "${command[@]}"; then
            log "INFO" "Successfully completed: $description"
            return 0
        else
            local exit_code=$?
            
            if [[ $attempt -eq $max_attempts ]]; then
                log "ERROR" "All retry attempts failed for: $description"
                return $exit_code
            fi
            
            log "WARN" "Attempt $attempt failed for: $description. Retrying in ${backoff_delay}s..."
            sleep "$backoff_delay"
            
            # Exponential backoff calculation
            backoff_delay=$((backoff_delay * 2))
            ((attempt++))
        fi
    done
}

# =============================================================================
# INFLUXDB INTERACTION FUNCTIONS
# =============================================================================

# Health check function with timeout and comprehensive validation
wait_for_influxdb_ready() {
    log "INFO" "Waiting for InfluxDB to be ready at $INFLUXDB_URL..."
    
    local start_time
    start_time="$(date +%s)"
    local end_time
    end_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        # Check basic connectivity
        if command -v curl >/dev/null 2>&1; then
            if curl --fail --silent --connect-timeout 5 --max-time 10 "$INFLUXDB_URL/health" >/dev/null 2>&1; then
                log "INFO" "InfluxDB health endpoint is responding"
                
                # Additional validation - check if InfluxDB is ready for operations
                local health_response
                health_response="$(curl --fail --silent --connect-timeout 5 --max-time 10 "$INFLUXDB_URL/health" 2>/dev/null || echo "")"
                
                if [[ -n "$health_response" ]] && echo "$health_response" | grep -q '"status":"pass"'; then
                    log "INFO" "InfluxDB is ready and operational"
                    return 0
                else
                    log "DEBUG" "InfluxDB health check response: $health_response"
                fi
            fi
        else
            error_exit "curl command not found. Required for InfluxDB connectivity checks."
        fi
        
        log "DEBUG" "InfluxDB not ready yet. Waiting ${HEALTH_CHECK_INTERVAL}s..."
        sleep "$HEALTH_CHECK_INTERVAL"
    done
    
    error_exit "Timeout waiting for InfluxDB to be ready after ${HEALTH_CHECK_TIMEOUT}s"
}

# InfluxDB CLI command wrapper with error handling and logging
influx_cmd() {
    local cmd_description="$1"
    shift
    local influx_args=("$@")
    
    log "DEBUG" "Executing InfluxDB command: $cmd_description"
    log "DEBUG" "Command arguments: influx ${influx_args[*]}"
    
    # Execute command with proper error handling
    local output
    local exit_code
    
    if output="$(influx --host "$INFLUXDB_URL" --token "$INFLUXDB_TOKEN" "${influx_args[@]}" 2>&1)"; then
        exit_code=0
        log "DEBUG" "InfluxDB command successful: $cmd_description"
        if [[ -n "$output" ]]; then
            log "DEBUG" "Command output: $output"
        fi
    else
        exit_code=$?
        log "ERROR" "InfluxDB command failed: $cmd_description"
        log "ERROR" "Error output: $output"
        return $exit_code
    fi
    
    # Return output for further processing if needed
    echo "$output"
    return 0
}

# Check if organization exists
check_organization_exists() {
    local org_name="$1"
    log "INFO" "Checking if organization '$org_name' exists..."
    
    local org_list
    if org_list="$(influx_cmd "list organizations" org list --json 2>/dev/null)"; then
        if echo "$org_list" | grep -q "\"name\":\"$org_name\""; then
            log "INFO" "Organization '$org_name' already exists"
            return 0
        else
            log "INFO" "Organization '$org_name' does not exist"
            return 1
        fi
    else
        log "WARN" "Failed to list organizations. Assuming organization needs to be created."
        return 1
    fi
}

# Check if bucket exists
check_bucket_exists() {
    local bucket_name="$1"
    local org_name="$2"
    log "INFO" "Checking if bucket '$bucket_name' exists in organization '$org_name'..."
    
    local bucket_list
    if bucket_list="$(influx_cmd "list buckets" bucket list --org "$org_name" --json 2>/dev/null)"; then
        if echo "$bucket_list" | grep -q "\"name\":\"$bucket_name\""; then
            log "INFO" "Bucket '$bucket_name' already exists"
            return 0
        else
            log "INFO" "Bucket '$bucket_name' does not exist"
            return 1
        fi
    else
        log "WARN" "Failed to list buckets. Assuming bucket needs to be created."
        return 1
    fi
}

# Check if user exists
check_user_exists() {
    local username="$1"
    log "INFO" "Checking if user '$username' exists..."
    
    local user_list
    if user_list="$(influx_cmd "list users" user list --json 2>/dev/null)"; then
        if echo "$user_list" | grep -q "\"name\":\"$username\""; then
            log "INFO" "User '$username' already exists"
            return 0
        else
            log "INFO" "User '$username' does not exist"
            return 1
        fi
    else
        log "WARN" "Failed to list users. Assuming user needs to be created."
        return 1
    fi
}

# =============================================================================
# INFLUXDB SETUP FUNCTIONS
# =============================================================================

# Initialize InfluxDB setup with initial configuration
initialize_influxdb() {
    log "INFO" "Starting InfluxDB initial setup..."
    
    # Create temporary setup configuration
    local setup_config
    setup_config="$(mktemp)"
    readonly TEMP_CONFIG_FILE="$setup_config"
    
    cat > "$setup_config" << EOF
{
    "username": "admin",
    "password": "$INFLUXDB_PASSWORD",
    "org": "$INFLUXDB_ORG",
    "bucket": "$INFLUXDB_BUCKET",
    "retentionPeriodSeconds": $(( $(echo "$RETENTION_POLICY_DURATION" | sed 's/[^0-9]//g') * 86400 )),
    "token": "$INFLUXDB_TOKEN"
}
EOF
    
    # Secure the temporary file
    chmod 600 "$setup_config"
    
    # Check if InfluxDB is already set up
    local setup_status
    if setup_status="$(curl --fail --silent --connect-timeout 10 --max-time 15 "$INFLUXDB_URL/api/v2/setup" 2>/dev/null || echo "")"; then
        if echo "$setup_status" | grep -q '"allowed":false'; then
            log "INFO" "InfluxDB is already initialized"
            rm -f "$setup_config"
            return 0
        fi
    fi
    
    # Perform initial setup
    log "INFO" "Performing InfluxDB initial setup..."
    
    local setup_response
    if setup_response="$(curl --fail --silent --show-error \
        --connect-timeout 15 --max-time 30 \
        --header "Content-Type: application/json" \
        --data "@$setup_config" \
        --request POST \
        "$INFLUXDB_URL/api/v2/setup" 2>&1)"; then
        
        log "INFO" "InfluxDB initial setup completed successfully"
        log "DEBUG" "Setup response: $setup_response"
    else
        local exit_code=$?
        log "ERROR" "InfluxDB initial setup failed"
        log "ERROR" "Setup error: $setup_response"
        rm -f "$setup_config"
        return $exit_code
    fi
    
    # Clean up temporary configuration file
    rm -f "$setup_config"
    unset TEMP_CONFIG_FILE
    
    log "INFO" "Initial InfluxDB setup completed"
}

# Create organization if it doesn't exist
create_organization() {
    local org_name="$1"
    local org_description="Financial Services Organization for UFS Platform"
    
    if check_organization_exists "$org_name"; then
        log "INFO" "Organization '$org_name' already exists, skipping creation"
        return 0
    fi
    
    log "INFO" "Creating organization '$org_name'..."
    
    if retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "create organization $org_name" \
        influx_cmd "create organization" org create \
        --name "$org_name" \
        --description "$org_description"; then
        
        log "INFO" "Successfully created organization: $org_name"
    else
        error_exit "Failed to create organization: $org_name"
    fi
}

# Create bucket with retention policy
create_bucket() {
    local bucket_name="$1"
    local org_name="$2"
    local description="$3"
    local retention="$4"
    
    if check_bucket_exists "$bucket_name" "$org_name"; then
        log "INFO" "Bucket '$bucket_name' already exists, skipping creation"
        return 0
    fi
    
    log "INFO" "Creating bucket '$bucket_name' with retention policy '$retention'..."
    
    if retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "create bucket $bucket_name" \
        influx_cmd "create bucket" bucket create \
        --name "$bucket_name" \
        --org "$org_name" \
        --description "$description" \
        --retention "$retention"; then
        
        log "INFO" "Successfully created bucket: $bucket_name with retention: $retention"
    else
        error_exit "Failed to create bucket: $bucket_name"
    fi
}

# Create application user with appropriate permissions
create_application_user() {
    local username="$1"
    local org_name="$2"
    
    if check_user_exists "$username"; then
        log "INFO" "User '$username' already exists, skipping creation"
        return 0
    fi
    
    log "INFO" "Creating application user '$username'..."
    
    if retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "create user $username" \
        influx_cmd "create user" user create \
        --name "$username" \
        --org "$org_name"; then
        
        log "INFO" "Successfully created user: $username"
    else
        error_exit "Failed to create user: $username"
    fi
}

# Create authentication token for application user
create_application_token() {
    local username="$1"
    local org_name="$2"
    local token_description="Application token for financial metrics collection and monitoring"
    
    log "INFO" "Creating authentication token for user '$username'..."
    
    # Create token with read/write permissions for financial services
    local token_response
    if token_response="$(retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "create auth token" \
        influx_cmd "create auth token" auth create \
        --org "$org_name" \
        --user "$username" \
        --description "$token_description" \
        --read-authorizations \
        --read-buckets \
        --read-dashboards \
        --read-sources \
        --read-tasks \
        --read-telegrafs \
        --read-users \
        --read-variables \
        --read-secrets \
        --read-labels \
        --read-views \
        --read-documents \
        --write-authorizations \
        --write-buckets \
        --write-tasks \
        --write-telegrafs \
        --write-users \
        --write-variables \
        --write-secrets \
        --write-labels \
        --write-views \
        --write-documents)"; then
        
        # Extract token from response and display securely
        local token_value
        token_value="$(echo "$token_response" | grep -o '[a-zA-Z0-9_-]\{88\}' | head -n1 || echo "")"
        
        if [[ -n "$token_value" ]]; then
            log "INFO" "Successfully created authentication token for user: $username"
            log "INFO" "Token created (first 16 chars): ${token_value:0:16}..."
            log "WARN" "Please securely store the full authentication token for application configuration"
        else
            log "WARN" "Token created but unable to extract token value from response"
            log "DEBUG" "Token creation response: $token_response"
        fi
    else
        error_exit "Failed to create authentication token for user: $username"
    fi
}

# Configure retention policies for all buckets
configure_retention_policies() {
    local org_name="$1"
    
    log "INFO" "Configuring retention policies for organization '$org_name'..."
    
    # Apply retention policy to primary financial metrics bucket
    log "INFO" "Applying retention policy to bucket '$INFLUXDB_BUCKET'..."
    if retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "update bucket retention policy" \
        influx_cmd "update bucket retention" bucket update \
        --name "$INFLUXDB_BUCKET" \
        --org "$org_name" \
        --retention "$RETENTION_POLICY_DURATION"; then
        
        log "INFO" "Successfully applied retention policy '$RETENTION_POLICY_DURATION' to bucket: $INFLUXDB_BUCKET"
    else
        log "WARN" "Failed to update retention policy for bucket: $INFLUXDB_BUCKET"
    fi
    
    # Apply retention policies to other buckets if they exist
    for bucket in "$PERFORMANCE_BUCKET" "$AUDIT_BUCKET"; do
        if check_bucket_exists "$bucket" "$org_name"; then
            log "INFO" "Applying retention policy to bucket '$bucket'..."
            if retry_with_backoff "$MAX_RETRY_ATTEMPTS" "$RETRY_DELAY" "update bucket retention policy" \
                influx_cmd "update bucket retention" bucket update \
                --name "$bucket" \
                --org "$org_name" \
                --retention "$RETENTION_POLICY_DURATION"; then
                
                log "INFO" "Successfully applied retention policy '$RETENTION_POLICY_DURATION' to bucket: $bucket"
            else
                log "WARN" "Failed to update retention policy for bucket: $bucket"
            fi
        fi
    done
}

# Verify setup and perform health checks
verify_setup() {
    local org_name="$1"
    local bucket_name="$2"
    local username="$3"
    
    log "INFO" "Verifying InfluxDB setup configuration..."
    
    # Verify organization exists
    if ! check_organization_exists "$org_name"; then
        error_exit "Setup verification failed: Organization '$org_name' not found"
    fi
    
    # Verify primary bucket exists
    if ! check_bucket_exists "$bucket_name" "$org_name"; then
        error_exit "Setup verification failed: Bucket '$bucket_name' not found"
    fi
    
    # Verify user exists
    if ! check_user_exists "$username"; then
        error_exit "Setup verification failed: User '$username' not found"
    fi
    
    # Test basic connectivity and permissions
    log "INFO" "Testing InfluxDB connectivity and permissions..."
    
    local bucket_list
    if bucket_list="$(influx_cmd "verify setup - list buckets" bucket list --org "$org_name" 2>/dev/null)"; then
        log "INFO" "Successfully verified bucket access permissions"
        log "DEBUG" "Available buckets: $(echo "$bucket_list" | grep -o '[a-zA-Z0-9_-]*bucket[a-zA-Z0-9_-]*' | tr '\n' ' ')"
    else
        error_exit "Setup verification failed: Unable to list buckets with current configuration"
    fi
    
    log "INFO" "InfluxDB setup verification completed successfully"
}

# =============================================================================
# MAIN EXECUTION FUNCTION
# =============================================================================

main() {
    log "INFO" "Starting InfluxDB initialization for Unified Financial Services Platform"
    log "INFO" "Script version: 1.0.0"
    log "INFO" "Target InfluxDB URL: $INFLUXDB_URL"
    log "INFO" "Organization: $INFLUXDB_ORG"
    log "INFO" "Primary bucket: $INFLUXDB_BUCKET"
    log "INFO" "Application user: $INFLUXDB_USER"
    log "INFO" "Retention policy: $RETENTION_POLICY_DURATION"
    
    # Step 1: Validate environment and prerequisites
    validate_environment
    
    # Step 2: Wait for InfluxDB to be ready
    wait_for_influxdb_ready
    
    # Step 3: Initialize InfluxDB if needed
    initialize_influxdb
    
    # Step 4: Create organization
    create_organization "$INFLUXDB_ORG"
    
    # Step 5: Create primary financial metrics bucket
    create_bucket "$INFLUXDB_BUCKET" "$INFLUXDB_ORG" "$FINANCIAL_BUCKET_DESCRIPTION" "$RETENTION_POLICY_DURATION"
    
    # Step 6: Create additional buckets for comprehensive monitoring
    create_bucket "$PERFORMANCE_BUCKET" "$INFLUXDB_ORG" "$PERFORMANCE_BUCKET_DESCRIPTION" "$RETENTION_POLICY_DURATION"
    create_bucket "$AUDIT_BUCKET" "$INFLUXDB_ORG" "$AUDIT_BUCKET_DESCRIPTION" "2190d"  # 6 years for compliance
    
    # Step 7: Create application user
    create_application_user "$INFLUXDB_USER" "$INFLUXDB_ORG"
    
    # Step 8: Create authentication token for application
    create_application_token "$INFLUXDB_USER" "$INFLUXDB_ORG"
    
    # Step 9: Configure retention policies
    configure_retention_policies "$INFLUXDB_ORG"
    
    # Step 10: Verify complete setup
    verify_setup "$INFLUXDB_ORG" "$INFLUXDB_BUCKET" "$INFLUXDB_USER"
    
    # Success message
    log "INFO" "InfluxDB initialization completed successfully!"
    log "INFO" "=========================================="
    log "INFO" "Setup Summary:"
    log "INFO" "  Organization: $INFLUXDB_ORG"
    log "INFO" "  Primary Bucket: $INFLUXDB_BUCKET (retention: $RETENTION_POLICY_DURATION)"
    log "INFO" "  Performance Bucket: $PERFORMANCE_BUCKET (retention: $RETENTION_POLICY_DURATION)"
    log "INFO" "  Audit Bucket: $AUDIT_BUCKET (retention: 2190d)"
    log "INFO" "  Application User: $INFLUXDB_USER"
    log "INFO" "  InfluxDB URL: $INFLUXDB_URL"
    log "INFO" "=========================================="
    log "INFO" "InfluxDB is ready for financial metrics and performance monitoring data collection"
    log "INFO" "Please ensure the authentication token is securely stored in your application configuration"
    
    return 0
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Trap signals for graceful shutdown
trap 'error_exit "Script interrupted by signal" 130' INT TERM

# Execute main function
main "$@"

# Exit successfully
exit 0