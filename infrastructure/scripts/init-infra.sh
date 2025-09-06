#!/bin/bash

# =============================================================================
# Financial Platform - Terraform Infrastructure Initialization Script
# =============================================================================
# 
# Description: This script initializes the Terraform environment for a specified 
#              workspace (e.g., dev, prod). It sets up the backend for remote 
#              state storage in Amazon S3, selects the appropriate workspace, 
#              and ensures all necessary plugins are downloaded and configured.
#
# Usage: ./init-infra.sh <environment>
# Example: ./init-infra.sh dev
#          ./init-infra.sh prod
#
# Prerequisites:
# - AWS CLI configured with appropriate permissions
# - Terraform CLI installed (version >= 1.6)
# - Network connectivity to AWS services
# - Proper IAM permissions for S3, DynamoDB, and EKS operations
#
# Exit Codes:
# 0 - Success
# 1 - General error
# 2 - Missing required argument
# 3 - Invalid environment
# 4 - Terraform operation failed
# 5 - AWS connectivity issues
# 6 - Prerequisites not met
#
# =============================================================================

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# =============================================================================
# GLOBAL CONFIGURATION VARIABLES
# =============================================================================

readonly TERRAFORM_DIR="../terraform"
readonly ENV_DIR="../terraform/environments"
readonly S3_BUCKET_NAME="financial-platform-terraform-state"
readonly S3_REGION="us-east-1"
readonly DYNAMODB_TABLE="terraform-state-lock"

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
readonly NC='\033[0m' # No Color

# Valid environments
readonly VALID_ENVIRONMENTS=("dev" "staging" "prod")

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

# Function to display usage information
show_usage() {
    cat << EOF
${CYAN}Financial Platform - Terraform Infrastructure Initialization${NC}

${BLUE}USAGE:${NC}
    $SCRIPT_NAME <environment>

${BLUE}ARGUMENTS:${NC}
    environment    Target environment for infrastructure deployment
                  Valid values: ${VALID_ENVIRONMENTS[*]}

${BLUE}EXAMPLES:${NC}
    $SCRIPT_NAME dev      # Initialize development environment
    $SCRIPT_NAME staging  # Initialize staging environment  
    $SCRIPT_NAME prod     # Initialize production environment

${BLUE}DESCRIPTION:${NC}
    This script initializes the Terraform environment for the specified workspace.
    It performs the following operations:
    
    1. Validates the target environment and prerequisites
    2. Configures Terraform backend for remote state storage in S3
    3. Initializes Terraform with required providers and modules
    4. Creates or selects the appropriate Terraform workspace
    5. Verifies successful initialization

${BLUE}PREREQUISITES:${NC}
    - AWS CLI configured with appropriate credentials
    - Terraform CLI installed (version >= 1.6)
    - Network connectivity to AWS services
    - IAM permissions for S3, DynamoDB, and target services
    
${BLUE}OUTPUT:${NC}
    Logs are written to: $LOG_FILE
    
EOF
}

# Function to check if required tools are installed
check_prerequisites() {
    info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check for AWS CLI
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    # Check for Terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    # Check for jq (useful for parsing AWS responses)
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        error "Please install the missing tools before running this script"
        exit 6
    fi
    
    # Check Terraform version
    local terraform_version
    terraform_version=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || echo "unknown")
    info "Terraform version: $terraform_version"
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not properly configured or credentials are invalid"
        error "Please run 'aws configure' or set environment variables"
        exit 5
    fi
    
    local aws_account_id
    aws_account_id=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null || echo "unknown")
    info "AWS Account ID: $aws_account_id"
    
    success "Prerequisites check completed successfully"
}

# Function to validate environment parameter
validate_environment() {
    local environment="$1"
    
    info "Validating environment: $environment"
    
    # Check if environment is in valid list
    for valid_env in "${VALID_ENVIRONMENTS[@]}"; do
        if [[ "$environment" == "$valid_env" ]]; then
            success "Environment '$environment' is valid"
            return 0
        fi
    done
    
    error "Invalid environment: $environment"
    error "Valid environments are: ${VALID_ENVIRONMENTS[*]}"
    exit 3
}

# Function to verify AWS resources exist
verify_aws_resources() {
    info "Verifying AWS backend resources..."
    
    # Check if S3 bucket exists
    if ! aws s3api head-bucket --bucket "$S3_BUCKET_NAME" --region "$S3_REGION" 2>/dev/null; then
        warning "S3 bucket '$S3_BUCKET_NAME' does not exist or is not accessible"
        info "Attempting to create S3 bucket..."
        
        if aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$S3_REGION" 2>/dev/null; then
            # Enable versioning on the bucket
            aws s3api put-bucket-versioning --bucket "$S3_BUCKET_NAME" --versioning-configuration Status=Enabled
            # Enable encryption
            aws s3api put-bucket-encryption --bucket "$S3_BUCKET_NAME" --server-side-encryption-configuration '{
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }
                ]
            }'
            success "S3 bucket '$S3_BUCKET_NAME' created successfully"
        else
            error "Failed to create S3 bucket '$S3_BUCKET_NAME'"
            exit 5
        fi
    else
        success "S3 bucket '$S3_BUCKET_NAME' exists and is accessible"
    fi
    
    # Check if DynamoDB table exists
    if ! aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$S3_REGION" &>/dev/null; then
        warning "DynamoDB table '$DYNAMODB_TABLE' does not exist"
        info "Attempting to create DynamoDB table..."
        
        if aws dynamodb create-table \
            --table-name "$DYNAMODB_TABLE" \
            --attribute-definitions 'AttributeName=LockID,AttributeType=S' \
            --key-schema 'AttributeName=LockID,KeyType=HASH' \
            --billing-mode PAY_PER_REQUEST \
            --region "$S3_REGION" &>/dev/null; then
            
            # Wait for table to be active
            info "Waiting for DynamoDB table to become active..."
            aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$S3_REGION"
            success "DynamoDB table '$DYNAMODB_TABLE' created successfully"
        else
            error "Failed to create DynamoDB table '$DYNAMODB_TABLE'"
            exit 5
        fi
    else
        success "DynamoDB table '$DYNAMODB_TABLE' exists and is accessible"
    fi
}

# Function to initialize Terraform backend
initialize_terraform() {
    local environment="$1"
    local tfvars_file="$ENV_DIR/$environment.tfvars"
    
    info "Initializing Terraform for environment: $environment"
    
    # Check if environment-specific tfvars file exists
    if [[ ! -f "$tfvars_file" ]]; then
        error "Environment configuration file not found: $tfvars_file"
        error "Please ensure the environment-specific Terraform variables file exists"
        exit 4
    fi
    
    success "Found environment configuration: $tfvars_file"
    
    # Navigate to Terraform directory
    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        error "Terraform directory not found: $TERRAFORM_DIR"
        exit 4
    fi
    
    info "Changing to Terraform directory: $TERRAFORM_DIR"
    cd "$TERRAFORM_DIR" || {
        error "Failed to change to Terraform directory: $TERRAFORM_DIR"
        exit 4
    }
    
    # Create backend configuration
    local backend_config_file="backend-config-${environment}.hcl"
    info "Creating backend configuration file: $backend_config_file"
    
    cat > "$backend_config_file" << EOF
# Backend configuration for $environment environment
# Generated by $SCRIPT_NAME on $(date)

bucket         = "$S3_BUCKET_NAME"
key            = "environments/$environment/terraform.tfstate"
region         = "$S3_REGION"
encrypt        = true
dynamodb_table = "$DYNAMODB_TABLE"

# Additional backend configuration for enhanced security
acl                     = "private"
server_side_encryption  = "AES256"
workspace_key_prefix    = "workspaces"
EOF
    
    # Initialize Terraform with backend configuration
    info "Running terraform init with backend configuration..."
    
    if terraform init \
        -backend-config="$backend_config_file" \
        -upgrade \
        -get=true \
        -verify-plugins=true \
        -no-color 2>&1 | tee -a "$LOG_FILE"; then
        success "Terraform initialization completed successfully"
    else
        error "Terraform initialization failed"
        exit 4
    fi
    
    # Clean up backend config file (sensitive information)
    rm -f "$backend_config_file"
    info "Cleaned up temporary backend configuration file"
}

# Function to manage Terraform workspace
manage_workspace() {
    local environment="$1"
    
    info "Managing Terraform workspace for environment: $environment"
    
    # Get list of existing workspaces
    local workspace_list
    workspace_list=$(terraform workspace list 2>/dev/null | grep -v "^*" | tr -d ' ' | grep -v '^$' || true)
    
    info "Existing workspaces: $(echo "$workspace_list" | tr '\n' ' ')"
    
    # Check if workspace already exists
    if echo "$workspace_list" | grep -q "^${environment}$"; then
        info "Workspace '$environment' already exists, selecting it..."
        
        if terraform workspace select "$environment" 2>&1 | tee -a "$LOG_FILE"; then
            success "Successfully selected workspace: $environment"
        else
            error "Failed to select workspace: $environment"
            exit 4
        fi
    else
        info "Workspace '$environment' does not exist, creating it..."
        
        if terraform workspace new "$environment" 2>&1 | tee -a "$LOG_FILE"; then
            success "Successfully created and selected workspace: $environment"
        else
            error "Failed to create workspace: $environment"
            exit 4
        fi
    fi
    
    # Verify current workspace
    local current_workspace
    current_workspace=$(terraform workspace show 2>/dev/null || echo "unknown")
    
    if [[ "$current_workspace" == "$environment" ]]; then
        success "Current active workspace: $current_workspace"
    else
        error "Workspace mismatch. Expected: $environment, Current: $current_workspace"
        exit 4
    fi
}

# Function to validate Terraform configuration
validate_configuration() {
    local environment="$1"
    
    info "Validating Terraform configuration..."
    
    # Run terraform validate
    if terraform validate -no-color 2>&1 | tee -a "$LOG_FILE"; then
        success "Terraform configuration validation passed"
    else
        error "Terraform configuration validation failed"
        exit 4
    fi
    
    # Run terraform plan to verify configuration can be planned
    info "Running terraform plan to verify configuration..."
    local plan_file="tfplan-${environment}-$(date +%Y%m%d-%H%M%S)"
    
    if terraform plan \
        -var-file="../environments/${environment}.tfvars" \
        -out="$plan_file" \
        -detailed-exitcode \
        -no-color 2>&1 | tee -a "$LOG_FILE"; then
        success "Terraform plan completed successfully"
        info "Plan saved to: $plan_file"
    else
        local exit_code=$?
        if [[ $exit_code -eq 2 ]]; then
            success "Terraform plan completed with changes detected"
            info "Plan saved to: $plan_file"
        else
            error "Terraform plan failed with exit code: $exit_code"
            exit 4
        fi
    fi
}

# Function to display completion summary
show_completion_summary() {
    local environment="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    cat << EOF

${GREEN}===============================================================================${NC}
${GREEN}            TERRAFORM INITIALIZATION COMPLETED SUCCESSFULLY${NC}
${GREEN}===============================================================================${NC}

${CYAN}Environment:${NC}        $environment
${CYAN}Workspace:${NC}         $(terraform workspace show 2>/dev/null || echo "unknown")
${CYAN}Backend Bucket:${NC}    $S3_BUCKET_NAME
${CYAN}Backend Region:${NC}    $S3_REGION
${CYAN}State Lock Table:${NC}  $DYNAMODB_TABLE
${CYAN}Duration:${NC}          ${duration}s
${CYAN}Log File:${NC}          $LOG_FILE

${BLUE}Next Steps:${NC}
1. Review the Terraform plan output above
2. Run 'terraform apply' to provision infrastructure
3. Monitor the deployment through AWS Console
4. Verify services are running correctly

${BLUE}Useful Commands:${NC}
• Check current workspace:     terraform workspace show
• List all workspaces:         terraform workspace list  
• Switch workspace:            terraform workspace select <env>
• Plan changes:                terraform plan -var-file="../environments/$environment.tfvars"
• Apply changes:               terraform apply -var-file="../environments/$environment.tfvars"
• Destroy infrastructure:      terraform destroy -var-file="../environments/$environment.tfvars"

${GREEN}===============================================================================${NC}

EOF
}

# =============================================================================
# MAIN FUNCTION
# =============================================================================

main() {
    local start_time=$(date +%s)
    
    # Display script header
    info "Starting $SCRIPT_NAME v$SCRIPT_VERSION"
    info "Initializing Financial Platform Infrastructure"
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
    
    # Main execution flow with comprehensive error handling
    {
        validate_environment "$environment"
        check_prerequisites
        verify_aws_resources
        initialize_terraform "$environment"
        manage_workspace "$environment"
        validate_configuration "$environment"
        show_completion_summary "$environment" "$start_time"
        
    } || {
        local exit_code=$?
        error "Script execution failed with exit code: $exit_code"
        error "Check the log file for details: $LOG_FILE"
        exit $exit_code
    }
    
    success "Infrastructure initialization completed successfully for environment: $environment"
    exit 0
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Trap to handle script interruption
trap 'error "Script interrupted by user"; exit 130' INT TERM

# Execute main function with all arguments
main "$@"