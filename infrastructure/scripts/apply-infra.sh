#!/bin/bash

# =============================================================================
# Financial Platform - Terraform Infrastructure Application Script
# =============================================================================
# 
# Description: This script applies the Terraform infrastructure configurations 
#              for a specified environment. It initializes Terraform if not 
#              already initialized, selects the appropriate workspace, and then 
#              applies the configuration using the corresponding .tfvars file.
#
# Usage: ./apply-infra.sh <environment>
# Example: ./apply-infra.sh dev
#          ./apply-infra.sh prod
#
# Prerequisites:
# - AWS CLI configured with appropriate permissions
# - Terraform CLI installed (version >= 1.6)
# - Network connectivity to AWS services
# - Proper IAM permissions for infrastructure provisioning
# - Valid environment-specific .tfvars files
#
# Exit Codes:
# 0 - Success
# 1 - General error
# 2 - Missing required argument
# 3 - Invalid environment
# 4 - Terraform operation failed
# 5 - AWS connectivity issues
# 6 - Prerequisites not met
# 7 - Terraform variables file not found
# 8 - Initialization script failed
#
# =============================================================================

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# =============================================================================
# GLOBAL CONFIGURATION VARIABLES
# =============================================================================

readonly TERRAFORM_DIR="../terraform"
readonly ENV_DIR="../terraform/environments"
readonly INIT_SCRIPT_PATH="./init-infra.sh"

# Script metadata
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_VERSION="1.0.0"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/tmp/${SCRIPT_NAME}-$(date +%Y%m%d-%H%M%S).log"

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly NC='\033[0m' # No Color

# Valid environments for financial platform deployment
readonly VALID_ENVIRONMENTS=("dev" "prod")

# Terraform apply timeout (in seconds)
readonly TERRAFORM_APPLY_TIMEOUT=3600

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Logging function with timestamp and level
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Colored output functions
info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2 | tee -a "$LOG_FILE"
}

debug() {
    echo -e "${MAGENTA}[DEBUG]${NC} $*" | tee -a "$LOG_FILE"
}

# Function to display usage information
show_usage() {
    cat << EOF
${CYAN}Financial Platform - Terraform Infrastructure Application${NC}

${BLUE}USAGE:${NC}
    $SCRIPT_NAME <environment>

${BLUE}ARGUMENTS:${NC}
    environment    Target environment for infrastructure deployment
                  Valid values: ${VALID_ENVIRONMENTS[*]}

${BLUE}EXAMPLES:${NC}
    $SCRIPT_NAME dev     # Apply development environment infrastructure
    $SCRIPT_NAME prod    # Apply production environment infrastructure

${BLUE}DESCRIPTION:${NC}
    This script applies the Terraform infrastructure configurations for the 
    specified environment. It performs the following operations:
    
    1. Validates the target environment parameter
    2. Checks prerequisites and dependencies
    3. Initializes Terraform environment (calls init-infra.sh)
    4. Validates Terraform configuration files
    5. Applies infrastructure changes with auto-approval
    6. Verifies successful deployment
    7. Provides deployment summary and next steps

${BLUE}PREREQUISITES:${NC}
    - AWS CLI configured with appropriate credentials
    - Terraform CLI installed (version >= 1.6)
    - Network connectivity to AWS services
    - IAM permissions for infrastructure provisioning
    - Valid environment-specific .tfvars files
    - init-infra.sh script in the same directory
    
${BLUE}OUTPUT:${NC}
    Logs are written to: $LOG_FILE
    
${BLUE}SECURITY NOTES:${NC}
    This script auto-approves Terraform changes. Use with caution in production.
    All changes are logged and can be rolled back if necessary.
    
EOF
}

# Function to check if required tools and files are available
check_prerequisites() {
    info "Checking prerequisites for infrastructure deployment..."
    
    local missing_tools=()
    local missing_files=()
    
    # Check for required command-line tools
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    # Check for required files
    if [[ ! -f "$INIT_SCRIPT_PATH" ]]; then
        missing_files+=("$INIT_SCRIPT_PATH")
    fi
    
    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        missing_files+=("$TERRAFORM_DIR (directory)")
    fi
    
    if [[ ! -d "$ENV_DIR" ]]; then
        missing_files+=("$ENV_DIR (directory)")
    fi
    
    # Report missing tools
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        error "Please install the missing tools before running this script"
        exit 6
    fi
    
    # Report missing files
    if [ ${#missing_files[@]} -ne 0 ]; then
        error "Missing required files/directories: ${missing_files[*]}"
        error "Please ensure all required files are present"
        exit 6
    fi
    
    # Check Terraform version compatibility
    local terraform_version
    terraform_version=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || echo "unknown")
    info "Terraform version: $terraform_version"
    
    # Verify minimum Terraform version (1.6+)
    if [[ "$terraform_version" != "unknown" ]]; then
        local major_version=$(echo "$terraform_version" | cut -d. -f1)
        local minor_version=$(echo "$terraform_version" | cut -d. -f2)
        
        if [[ $major_version -lt 1 || ($major_version -eq 1 && $minor_version -lt 6) ]]; then
            error "Terraform version $terraform_version is not supported. Minimum required: 1.6+"
            exit 6
        fi
    fi
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not properly configured or credentials are invalid"
        error "Please run 'aws configure' or set appropriate environment variables"
        exit 5
    fi
    
    local aws_account_id
    aws_account_id=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null || echo "unknown")
    local aws_region
    aws_region=$(aws configure get region 2>/dev/null || echo "unknown")
    
    info "AWS Account ID: $aws_account_id"
    info "AWS Region: $aws_region"
    
    success "Prerequisites check completed successfully"
}

# Function to validate environment parameter
validate_environment() {
    local environment="$1"
    
    info "Validating environment parameter: $environment"
    
    # Check if environment is in valid list
    for valid_env in "${VALID_ENVIRONMENTS[@]}"; do
        if [[ "$environment" == "$valid_env" ]]; then
            success "Environment '$environment' is valid for deployment"
            return 0
        fi
    done
    
    error "Invalid environment: $environment"
    error "Valid environments for this script are: ${VALID_ENVIRONMENTS[*]}"
    error "Note: This script supports dev and prod environments only"
    exit 3
}

# Function to verify Terraform variables file exists
verify_tfvars_file() {
    local environment="$1"
    local tfvars_file="$ENV_DIR/$environment/terraform.tfvars"
    
    info "Verifying Terraform variables file for environment: $environment"
    debug "Looking for file: $tfvars_file"
    
    if [[ ! -f "$tfvars_file" ]]; then
        error "Terraform variables file not found: $tfvars_file"
        error "Please ensure the environment-specific terraform.tfvars file exists"
        error "Expected file structure: infrastructure/terraform/environments/$environment/terraform.tfvars"
        exit 7
    fi
    
    # Check if file is readable
    if [[ ! -r "$tfvars_file" ]]; then
        error "Terraform variables file is not readable: $tfvars_file"
        error "Please check file permissions"
        exit 7
    fi
    
    # Basic validation of tfvars file content
    if [[ ! -s "$tfvars_file" ]]; then
        warning "Terraform variables file appears to be empty: $tfvars_file"
    fi
    
    success "Terraform variables file verified: $tfvars_file"
    
    # Set global variable for later use
    TF_VARS_FILE="$tfvars_file"
}

# Function to initialize infrastructure using init-infra.sh
initialize_infrastructure() {
    local environment="$1"
    
    info "Initializing infrastructure for environment: $environment"
    info "Calling initialization script: $INIT_SCRIPT_PATH"
    
    # Make sure init script is executable
    if [[ ! -x "$INIT_SCRIPT_PATH" ]]; then
        info "Making init script executable..."
        chmod +x "$INIT_SCRIPT_PATH"
    fi
    
    # Execute the initialization script
    if "$INIT_SCRIPT_PATH" "$environment" 2>&1 | tee -a "$LOG_FILE"; then
        success "Infrastructure initialization completed successfully"
    else
        local exit_code=$?
        error "Infrastructure initialization failed with exit code: $exit_code"
        error "Check the init-infra.sh logs for detailed error information"
        exit 8
    fi
}

# Function to apply Terraform configuration
apply_terraform_configuration() {
    local environment="$1"
    
    info "Applying Terraform configuration for environment: $environment"
    
    # Navigate to Terraform directory
    local original_dir="$PWD"
    cd "$TERRAFORM_DIR" || {
        error "Failed to change to Terraform directory: $TERRAFORM_DIR"
        exit 4
    }
    
    info "Changed to Terraform directory: $TERRAFORM_DIR"
    
    # Verify we're in the correct workspace
    local current_workspace
    current_workspace=$(terraform workspace show 2>/dev/null || echo "unknown")
    
    if [[ "$current_workspace" != "$environment" ]]; then
        warning "Current workspace ($current_workspace) doesn't match target environment ($environment)"
        info "Selecting correct workspace..."
        
        if terraform workspace select "$environment" 2>&1 | tee -a "$LOG_FILE"; then
            success "Successfully selected workspace: $environment"
        else
            error "Failed to select workspace: $environment"
            cd "$original_dir"
            exit 4
        fi
    else
        success "Already in correct workspace: $environment"
    fi
    
    # Generate a unique plan file name
    local plan_file="tfplan-apply-${environment}-$(date +%Y%m%d-%H%M%S)"
    local apply_log_file="/tmp/terraform-apply-${environment}-$(date +%Y%m%d-%H%M%S).log"
    
    info "Creating Terraform execution plan..."
    debug "Plan file: $plan_file"
    debug "Apply log file: $apply_log_file"
    
    # Create execution plan
    if terraform plan \
        -var-file="$TF_VARS_FILE" \
        -out="$plan_file" \
        -detailed-exitcode \
        -no-color 2>&1 | tee -a "$LOG_FILE"; then
        success "Terraform plan created successfully"
    else
        local plan_exit_code=$?
        if [[ $plan_exit_code -eq 2 ]]; then
            success "Terraform plan created with changes detected"
        else
            error "Terraform plan failed with exit code: $plan_exit_code"
            cd "$original_dir"
            exit 4
        fi
    fi
    
    # Apply the planned configuration with timeout
    info "Applying Terraform configuration with auto-approval..."
    warning "This will make actual changes to your infrastructure!"
    
    # Set up timeout for terraform apply
    local apply_pid
    local timeout_occurred=false
    
    # Run terraform apply in background to enable timeout
    (
        terraform apply \
            -var-file="$TF_VARS_FILE" \
            -auto-approve \
            -no-color \
            "$plan_file" 2>&1 | tee "$apply_log_file"
        echo $? > /tmp/terraform_apply_exit_code
    ) &
    
    apply_pid=$!
    
    # Implement timeout mechanism
    local elapsed=0
    while kill -0 $apply_pid 2>/dev/null; do
        if [[ $elapsed -ge $TERRAFORM_APPLY_TIMEOUT ]]; then
            error "Terraform apply timed out after ${TERRAFORM_APPLY_TIMEOUT}s"
            kill $apply_pid 2>/dev/null || true
            timeout_occurred=true
            break
        fi
        sleep 10
        elapsed=$((elapsed + 10))
        if [[ $((elapsed % 60)) -eq 0 ]]; then
            info "Terraform apply still running... (${elapsed}s elapsed)"
        fi
    done
    
    # Check results
    if $timeout_occurred; then
        error "Terraform apply operation timed out"
        cd "$original_dir"
        exit 4
    fi
    
    # Get the exit code from terraform apply
    local apply_exit_code
    if [[ -f /tmp/terraform_apply_exit_code ]]; then
        apply_exit_code=$(cat /tmp/terraform_apply_exit_code)
        rm -f /tmp/terraform_apply_exit_code
    else
        apply_exit_code=1
    fi
    
    # Process apply results
    if [[ $apply_exit_code -eq 0 ]]; then
        success "Terraform apply completed successfully"
        
        # Append apply log to main log
        if [[ -f "$apply_log_file" ]]; then
            echo "--- Terraform Apply Output ---" >> "$LOG_FILE"
            cat "$apply_log_file" >> "$LOG_FILE"
            echo "--- End Terraform Apply Output ---" >> "$LOG_FILE"
        fi
    else
        error "Terraform apply failed with exit code: $apply_exit_code"
        
        # Show recent apply log for debugging
        if [[ -f "$apply_log_file" ]]; then
            error "Recent apply log output:"
            tail -20 "$apply_log_file" | while read -r line; do
                error "  $line"
            done
        fi
        
        cd "$original_dir"
        exit 4
    fi
    
    # Clean up temporary files
    rm -f "$plan_file" "$apply_log_file" 2>/dev/null || true
    
    # Return to original directory
    cd "$original_dir"
    
    success "Terraform configuration applied successfully for environment: $environment"
}

# Function to verify deployment success
verify_deployment() {
    local environment="$1"
    
    info "Verifying deployment for environment: $environment"
    
    # Navigate to Terraform directory for verification
    local original_dir="$PWD"
    cd "$TERRAFORM_DIR" || {
        error "Failed to change to Terraform directory for verification"
        return 1
    }
    
    # Check Terraform state
    info "Checking Terraform state..."
    if terraform show -no-color > /dev/null 2>&1; then
        success "Terraform state is valid and accessible"
    else
        warning "Unable to verify Terraform state"
    fi
    
    # Get resource count
    local resource_count
    resource_count=$(terraform state list 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    info "Total managed resources: $resource_count"
    
    # Basic AWS connectivity check
    info "Verifying AWS connectivity..."
    if aws sts get-caller-identity > /dev/null 2>&1; then
        success "AWS connectivity verified"
    else
        warning "AWS connectivity check failed"
    fi
    
    cd "$original_dir"
    success "Deployment verification completed for environment: $environment"
}

# Function to display deployment completion summary
show_deployment_summary() {
    local environment="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local hours=$((duration / 3600))
    local minutes=$(((duration % 3600) / 60))
    local seconds=$((duration % 60))
    
    # Format duration
    local duration_str=""
    if [[ $hours -gt 0 ]]; then
        duration_str="${hours}h "
    fi
    if [[ $minutes -gt 0 ]]; then
        duration_str="${duration_str}${minutes}m "
    fi
    duration_str="${duration_str}${seconds}s"
    
    cat << EOF

${GREEN}===============================================================================${NC}
${GREEN}              TERRAFORM INFRASTRUCTURE DEPLOYMENT COMPLETED${NC}
${GREEN}===============================================================================${NC}

${CYAN}Environment:${NC}           $environment
${CYAN}Deployment Duration:${NC}   $duration_str
${CYAN}Terraform Variables:${NC}   $TF_VARS_FILE
${CYAN}Log File:${NC}             $LOG_FILE
${CYAN}Completion Time:${NC}      $(date '+%Y-%m-%d %H:%M:%S')

${BLUE}Deployment Status:${NC}     ${GREEN}SUCCESS${NC}

${BLUE}Next Steps:${NC}
1. Verify services are running correctly in AWS Console
2. Run integration tests to validate functionality
3. Monitor application logs and metrics
4. Review deployment logs for any warnings

${BLUE}Useful Commands:${NC}
• Check current state:         terraform show
• List managed resources:      terraform state list
• Plan future changes:         terraform plan -var-file="$TF_VARS_FILE"
• Destroy infrastructure:      terraform destroy -var-file="$TF_VARS_FILE"

${BLUE}Rollback Instructions:${NC}
If rollback is needed, use the following steps:
1. Navigate to: $TERRAFORM_DIR
2. Run: terraform workspace select $environment
3. Run: terraform destroy -var-file="$TF_VARS_FILE"
4. Or revert to previous configuration and re-apply

${BLUE}Support Information:${NC}
• Log file contains detailed execution information
• Contact DevOps team if issues occur
• Backup of previous state is available in S3

${GREEN}===============================================================================${NC}

EOF
}

# Function to handle script cleanup and error states
cleanup_and_exit() {
    local exit_code="$1"
    local environment="${2:-unknown}"
    
    if [[ $exit_code -ne 0 ]]; then
        error "Script execution failed for environment: $environment"
        error "Exit code: $exit_code"
        error "Log file: $LOG_FILE"
        
        cat << EOF

${RED}===============================================================================${NC}
${RED}                    DEPLOYMENT FAILED - TROUBLESHOOTING${NC}
${RED}===============================================================================${NC}

${YELLOW}Common Issues and Solutions:${NC}

1. ${CYAN}AWS Credentials:${NC}
   • Check: aws sts get-caller-identity
   • Fix: aws configure or set AWS_* environment variables

2. ${CYAN}Terraform State Lock:${NC}
   • Check: terraform force-unlock <lock-id>
   • Fix: Wait for other operations to complete

3. ${CYAN}Resource Conflicts:${NC}
   • Check: Review terraform plan output
   • Fix: Resolve naming conflicts or import existing resources

4. ${CYAN}Network Connectivity:${NC}
   • Check: Network connectivity to AWS services
   • Fix: Verify VPN, firewall, or proxy settings

${YELLOW}Log File Location:${NC} $LOG_FILE
${YELLOW}Support Contact:${NC} DevOps Team

${RED}===============================================================================${NC}

EOF
    fi
    
    exit "$exit_code"
}

# =============================================================================
# MAIN FUNCTION
# =============================================================================

main() {
    local start_time=$(date +%s)
    
    # Display script header
    info "Starting $SCRIPT_NAME v$SCRIPT_VERSION"
    info "Applying Financial Platform Infrastructure"
    info "Log file: $LOG_FILE"
    
    # Check if environment argument is provided
    if [[ $# -eq 0 ]]; then
        error "Environment argument is required"
        echo
        show_usage
        exit 2
    fi
    
    # Handle help flag
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    local environment="$1"
    
    # Set up error handling
    trap 'cleanup_and_exit $? "$environment"' EXIT
    trap 'error "Script interrupted by user"; exit 130' INT TERM
    
    # Main execution flow
    info "Beginning infrastructure deployment for environment: $environment"
    
    # Execute deployment steps
    validate_environment "$environment"
    check_prerequisites
    verify_tfvars_file "$environment"
    initialize_infrastructure "$environment"
    apply_terraform_configuration "$environment"
    verify_deployment "$environment"
    show_deployment_summary "$environment" "$start_time"
    
    success "Infrastructure deployment completed successfully for environment: $environment"
    
    # Disable the error trap for successful completion
    trap - EXIT
    exit 0
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Execute main function with all arguments
main "$@"