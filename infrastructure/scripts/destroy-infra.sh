#!/bin/bash

# Infrastructure Destruction Script
# This script automates the destruction of cloud infrastructure for a specified environment using Terraform
# Version: 1.0.0
# Terraform Version: 1.6+

set -euo pipefail

# Global Variables
LOG_FILE="/var/log/ufs/destroy-infra.log"
TERRAFORM_DIR="$(dirname "$0")/../terraform/environments"

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Function: log_message
# Description: Logs a message to both the console and the log file with a timestamp
# Parameters: message (string) - The message to log
# Returns: void - No return value
log_message() {
    local message="$1"
    local log_level="${2:-INFO}"
    
    # Get the current timestamp in ISO 8601 format
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    # Format the log message with timestamp and log level
    local formatted_message="[$timestamp] [$log_level] $message"
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Append the formatted message to the LOG_FILE
    echo "$formatted_message" >> "$LOG_FILE"
    
    # Print the formatted message to standard output with color coding
    case "$log_level" in
        "ERROR")
            echo -e "${RED}$formatted_message${NC}" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}$formatted_message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}$formatted_message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}$formatted_message${NC}"
            ;;
        *)
            echo "$formatted_message"
            ;;
    esac
}

# Function: usage
# Description: Prints the usage instructions for the script and exits
# Parameters: None
# Returns: void - No return value (exits with status code 1)
usage() {
    cat >&2 << EOF
Usage: $0 <environment>

This script destroys the cloud infrastructure for a specified environment using Terraform.

Arguments:
    environment    The target environment (e.g., 'dev', 'staging', 'prod')

Examples:
    $0 dev      # Destroy development environment
    $0 staging  # Destroy staging environment
    $0 prod     # Destroy production environment

Prerequisites:
    - Terraform 1.6+ must be installed
    - AWS CLI configured with appropriate credentials
    - Proper permissions to destroy infrastructure resources
    - Environment-specific Terraform configuration must exist

Log Output:
    All operations are logged to: $LOG_FILE

WARNING: This operation is destructive and cannot be undone!
         All resources in the specified environment will be permanently deleted.

EOF
    exit 1
}

# Function: verify_prerequisites
# Description: Verifies that required tools and permissions are available
verify_prerequisites() {
    log_message "Verifying prerequisites for infrastructure destruction" "INFO"
    
    # Check if Terraform is installed and meets minimum version requirement
    if ! command -v terraform &> /dev/null; then
        log_message "ERROR: Terraform is not installed or not in PATH" "ERROR"
        exit 1
    fi
    
    # Check Terraform version
    local terraform_version=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || terraform version | head -n1 | cut -d' ' -f2 | tr -d 'v')
    log_message "Detected Terraform version: $terraform_version" "INFO"
    
    # Check if AWS CLI is configured (if using AWS backend)
    if command -v aws &> /dev/null; then
        local aws_identity=$(aws sts get-caller-identity 2>/dev/null || echo "")
        if [[ -n "$aws_identity" ]]; then
            log_message "AWS CLI is configured and authenticated" "INFO"
        else
            log_message "WARNING: AWS CLI may not be properly configured" "WARN"
        fi
    fi
    
    log_message "Prerequisites verification completed" "SUCCESS"
}

# Function: confirm_destruction
# Description: Prompts user for confirmation before proceeding with destruction
# Parameters: environment (string) - The environment to be destroyed
confirm_destruction() {
    local environment="$1"
    
    echo
    echo -e "${RED}WARNING: You are about to DESTROY all infrastructure in the '$environment' environment!${NC}"
    echo -e "${RED}This action is IRREVERSIBLE and will permanently delete all resources.${NC}"
    echo
    echo "This includes but is not limited to:"
    echo "  - Kubernetes clusters and all workloads"
    echo "  - Databases and all data"
    echo "  - Storage buckets and all contents"
    echo "  - Network configurations"
    echo "  - Security groups and policies"
    echo "  - Load balancers and DNS records"
    echo
    
    # For production environment, require additional confirmation
    if [[ "$environment" == "prod" || "$environment" == "production" ]]; then
        echo -e "${RED}PRODUCTION ENVIRONMENT DETECTED!${NC}"
        echo "Please type 'DESTROY PRODUCTION' to confirm:"
        read -r confirmation
        if [[ "$confirmation" != "DESTROY PRODUCTION" ]]; then
            log_message "Production destruction cancelled by user" "INFO"
            exit 0
        fi
    else
        echo "Type 'yes' to confirm destruction:"
        read -r confirmation
        if [[ "$confirmation" != "yes" ]]; then
            log_message "Infrastructure destruction cancelled by user" "INFO"
            exit 0
        fi
    fi
    
    log_message "User confirmed destruction of $environment environment" "INFO"
}

# Function: cleanup_on_exit
# Description: Cleanup function to ensure we return to original directory
cleanup_on_exit() {
    local exit_code=$?
    if [[ -n "${ORIGINAL_DIR:-}" ]]; then
        cd "$ORIGINAL_DIR"
        log_message "Returned to original directory: $ORIGINAL_DIR" "INFO"
    fi
    
    if [[ $exit_code -ne 0 ]]; then
        log_message "Script exited with error code: $exit_code" "ERROR"
    fi
    
    exit $exit_code
}

# Main Script Logic
main() {
    # Store original directory for cleanup
    ORIGINAL_DIR=$(pwd)
    
    # Set up cleanup trap
    trap cleanup_on_exit EXIT INT TERM
    
    log_message "Starting infrastructure destruction process" "INFO"
    log_message "Script executed by user: $(whoami)" "INFO"
    log_message "Script arguments: $*" "INFO"
    
    # Check if an environment argument is provided
    if [[ $# -ne 1 ]]; then
        log_message "ERROR: Environment argument is required" "ERROR"
        usage
    fi
    
    # Set the ENVIRONMENT variable to the provided argument
    local ENVIRONMENT="$1"
    
    # Validate environment name (only allow alphanumeric characters, hyphens, and underscores)
    if [[ ! "$ENVIRONMENT" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        log_message "ERROR: Invalid environment name. Only alphanumeric characters, hyphens, and underscores are allowed." "ERROR"
        exit 1
    fi
    
    log_message "Target environment: $ENVIRONMENT" "INFO"
    
    # Construct the path to the environment-specific Terraform directory
    local ENVIRONMENT_DIR="${TERRAFORM_DIR}/${ENVIRONMENT}"
    log_message "Environment directory: $ENVIRONMENT_DIR" "INFO"
    
    # Check if the environment directory exists
    if [[ ! -d "$ENVIRONMENT_DIR" ]]; then
        log_message "ERROR: Environment directory does not exist: $ENVIRONMENT_DIR" "ERROR"
        log_message "Available environments:" "INFO"
        if [[ -d "$TERRAFORM_DIR" ]]; then
            find "$TERRAFORM_DIR" -maxdepth 1 -type d -not -path "$TERRAFORM_DIR" -exec basename {} \; | sort
        else
            log_message "ERROR: Terraform directory does not exist: $TERRAFORM_DIR" "ERROR"
        fi
        exit 1
    fi
    
    # Verify prerequisites
    verify_prerequisites
    
    # Prompt for confirmation
    confirm_destruction "$ENVIRONMENT"
    
    log_message "Beginning infrastructure destruction for environment: $ENVIRONMENT" "INFO"
    
    # Change to the environment-specific Terraform directory
    log_message "Changing to environment directory: $ENVIRONMENT_DIR" "INFO"
    cd "$ENVIRONMENT_DIR"
    
    # Initialize Terraform for the environment
    log_message "Initializing Terraform configuration" "INFO"
    if ! terraform init -reconfigure -input=false 2>&1 | tee -a "$LOG_FILE"; then
        log_message "ERROR: Terraform initialization failed" "ERROR"
        exit 1
    fi
    
    log_message "Terraform initialization completed successfully" "SUCCESS"
    
    # Validate Terraform configuration
    log_message "Validating Terraform configuration" "INFO"
    if ! terraform validate 2>&1 | tee -a "$LOG_FILE"; then
        log_message "ERROR: Invalid Terraform configuration" "ERROR"
        exit 1
    fi
    
    log_message "Terraform configuration validation successful" "SUCCESS"
    
    # Generate and review destroy plan
    log_message "Generating destruction plan" "INFO"
    local plan_file="/tmp/terraform-destroy-plan-${ENVIRONMENT}-$(date +%s)"
    if ! terraform plan -destroy -out="$plan_file" -input=false 2>&1 | tee -a "$LOG_FILE"; then
        log_message "ERROR: Failed to generate destroy plan" "ERROR"
        exit 1
    fi
    
    log_message "Destroy plan generated successfully" "SUCCESS"
    log_message "Plan file saved to: $plan_file" "INFO"
    
    # Execute the infrastructure destruction
    log_message "Executing infrastructure destruction with auto-approval" "INFO"
    log_message "This may take several minutes depending on the infrastructure complexity" "INFO"
    
    # Use the generated plan file for destruction to ensure consistency
    if ! terraform apply -auto-approve "$plan_file" 2>&1 | tee -a "$LOG_FILE"; then
        log_message "ERROR: Infrastructure destruction failed" "ERROR"
        log_message "Please check the logs above for detailed error information" "ERROR"
        log_message "Some resources may require manual cleanup" "WARN"
        exit 1
    fi
    
    # Clean up the plan file
    rm -f "$plan_file"
    
    log_message "Infrastructure destruction completed successfully for environment: $ENVIRONMENT" "SUCCESS"
    
    # Verify destruction by checking if any resources remain
    log_message "Performing post-destruction verification" "INFO"
    local remaining_resources=$(terraform show -json 2>/dev/null | jq -r '.values.root_module.resources // [] | length' 2>/dev/null || echo "unknown")
    
    if [[ "$remaining_resources" == "0" ]]; then
        log_message "Verification successful: No resources remain in the state" "SUCCESS"
    elif [[ "$remaining_resources" == "unknown" ]]; then
        log_message "Could not verify resource cleanup - please check manually" "WARN"
    else
        log_message "WARNING: $remaining_resources resources may still exist in the state" "WARN"
    fi
    
    # Return to the original directory
    cd "$ORIGINAL_DIR"
    log_message "Returned to original directory" "INFO"
    
    # Final success message
    log_message "Infrastructure destruction process completed successfully" "SUCCESS"
    log_message "Environment '$ENVIRONMENT' has been destroyed" "SUCCESS"
    log_message "All operations logged to: $LOG_FILE" "INFO"
    
    # Exit with success status code
    exit 0
}

# Execute main function with all script arguments
main "$@"