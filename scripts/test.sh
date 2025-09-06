#!/bin/bash

# ==============================================================================
# Financial Services Backend Test Automation Script
# ==============================================================================
# Description: This shell script is responsible for running automated tests 
#              for all backend microservices. It iterates through each service 
#              directory, executes the Maven test lifecycle, and aggregates 
#              the results to determine the overall success of the test suite.
#              This script is a key component of the CI/CD pipeline, ensuring 
#              code quality and reliability before deployment.
#
# Version: 2.0.0
# Author: Platform Engineering Team
# License: Proprietary - Financial Services Platform
# Compliance: SOC2, PCI-DSS, SOX, GDPR compliant
# ==============================================================================

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# ==============================================================================
# GLOBAL VARIABLES AND CONFIGURATION
# ==============================================================================

# Directory configuration - Backend root directory relative to script location
readonly BACKEND_DIR="$(dirname "$0")/.."

# Maven configuration with financial services compliance settings
readonly MAVEN_OPTS="-Dmaven.test.failure.ignore=false -Xmx2g -XX:+UseG1GC -Dspring.profiles.active=test"

# Test execution tracking
EXIT_CODE=0

# Logging configuration
readonly LOG_LEVEL="${LOG_LEVEL:-INFO}"
readonly LOG_FILE="${LOG_FILE:-/tmp/backend-tests-$(date +%Y%m%d-%H%M%S).log}"
readonly TIMESTAMP_FORMAT="%Y-%m-%d %H:%M:%S"

# Test execution parameters
readonly PARALLEL_JOBS="${PARALLEL_JOBS:-$(nproc)}"
readonly TEST_TIMEOUT="${TEST_TIMEOUT:-1800}"  # 30 minutes timeout per service
readonly MIN_COVERAGE_THRESHOLD="${MIN_COVERAGE_THRESHOLD:-85}"

# Color codes for console output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Arrays to track test results
declare -a SUCCESSFUL_SERVICES=()
declare -a FAILED_SERVICES=()
declare -a SKIPPED_SERVICES=()

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Logging function with timestamp and level
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date +"$TIMESTAMP_FORMAT")
    
    case "$level" in
        ERROR)
            echo -e "${RED}[$timestamp] [ERROR] ${message}${NC}" | tee -a "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[$timestamp] [WARN] ${message}${NC}" | tee -a "$LOG_FILE"
            ;;
        INFO)
            echo -e "${BLUE}[$timestamp] [INFO] ${message}${NC}" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[$timestamp] [SUCCESS] ${message}${NC}" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[$timestamp] [$level] ${message}" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Validate environment and prerequisites
validate_environment() {
    log "INFO" "Validating test environment and prerequisites..."
    
    # Check if Maven is available
    if ! command -v mvn &> /dev/null; then
        log "ERROR" "Maven is not installed or not in PATH. Please install Maven 3.9+ to continue."
        exit 1
    fi
    
    # Check Maven version
    local maven_version=$(mvn -version | head -n 1 | awk '{print $3}')
    log "INFO" "Maven version detected: $maven_version"
    
    # Verify Java version (should be 21 LTS for financial services)
    if ! command -v java &> /dev/null; then
        log "ERROR" "Java is not installed or not in PATH. Please install Java 21 LTS."
        exit 1
    fi
    
    local java_version=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
    log "INFO" "Java version detected: $java_version"
    
    # Check if backend directory exists
    if [ ! -d "$BACKEND_DIR" ]; then
        log "ERROR" "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    # Create log file directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log "SUCCESS" "Environment validation completed successfully"
}

# Function to check if a directory contains a valid Maven project
is_maven_project() {
    local dir="$1"
    [ -f "$dir/pom.xml" ] && [ -d "$dir/src" ]
}

# Function to extract service name from directory path
get_service_name() {
    local dir="$1"
    basename "$dir"
}

# Function to validate test coverage
validate_coverage() {
    local service_dir="$1"
    local service_name="$2"
    
    local coverage_file="$service_dir/target/site/jacoco/index.html"
    if [ -f "$coverage_file" ]; then
        # Extract coverage percentage from JaCoCo report
        local coverage=$(grep -oP '(?<=Total<.*?>)[\d.]+(?=%</.*?>)' "$coverage_file" 2>/dev/null || echo "0")
        if (( $(echo "$coverage >= $MIN_COVERAGE_THRESHOLD" | bc -l) )); then
            log "SUCCESS" "Code coverage for $service_name: ${coverage}% (meets ${MIN_COVERAGE_THRESHOLD}% threshold)"
            return 0
        else
            log "WARN" "Code coverage for $service_name: ${coverage}% (below ${MIN_COVERAGE_THRESHOLD}% threshold)"
            return 1
        fi
    else
        log "WARN" "Coverage report not found for $service_name at $coverage_file"
        return 1
    fi
}

# Function to run tests for a single service
run_service_tests() {
    local service_dir="$1"
    local service_name=$(get_service_name "$service_dir")
    
    log "INFO" "Starting test execution for service: $service_name"
    log "INFO" "Service directory: $service_dir"
    
    # Change to service directory
    cd "$service_dir" || {
        log "ERROR" "Failed to change to service directory: $service_dir"
        return 1
    }
    
    # Set Maven options for this execution
    export MAVEN_OPTS="$MAVEN_OPTS"
    
    # Execute Maven test lifecycle with timeout
    log "INFO" "Executing Maven test lifecycle for $service_name..."
    log "INFO" "Maven command: mvn clean test -Dmaven.test.failure.ignore=false"
    
    if timeout "$TEST_TIMEOUT" mvn clean test \
        -Dmaven.test.failure.ignore=false \
        -Dspring.profiles.active=test \
        -Djacoco.destFile=target/jacoco.exec \
        -Djacoco.append=false \
        -Dmaven.javadoc.skip=true \
        -Dcheckstyle.skip=false \
        -Dfindbugs.skip=false 2>&1 | tee -a "$LOG_FILE"; then
        
        # Validate code coverage if JaCoCo report is available
        if validate_coverage "$service_dir" "$service_name"; then
            log "SUCCESS" "All tests passed for service: $service_name with adequate coverage"
            SUCCESSFUL_SERVICES+=("$service_name")
            return 0
        else
            log "WARN" "Tests passed for service: $service_name but coverage is below threshold"
            SUCCESSFUL_SERVICES+=("$service_name")
            return 0
        fi
    else
        local test_exit_code=$?
        if [ $test_exit_code -eq 124 ]; then
            log "ERROR" "Test execution timed out for service: $service_name (exceeded ${TEST_TIMEOUT}s)"
        else
            log "ERROR" "Test execution failed for service: $service_name (exit code: $test_exit_code)"
        fi
        
        # Collect test failure details
        if [ -f "target/surefire-reports/TEST-*.xml" ]; then
            log "INFO" "Collecting test failure details for $service_name..."
            find target/surefire-reports -name "TEST-*.xml" -exec grep -l "failure\|error" {} \; | head -5 | while read -r file; do
                log "ERROR" "Failed test details from $(basename "$file"):"
                grep -A 2 -B 1 "failure\|error" "$file" | head -10 | tee -a "$LOG_FILE"
            done
        fi
        
        FAILED_SERVICES+=("$service_name")
        return 1
    fi
}

# Function to discover microservice directories
discover_services() {
    log "INFO" "Discovering microservice directories with Maven projects..."
    
    local services=()
    
    # Find all directories containing pom.xml, excluding the root backend directory
    while IFS= read -r -d '' dir; do
        local relative_dir=$(realpath --relative-to="$BACKEND_DIR" "$dir")
        
        # Skip root directory pom.xml
        if [ "$relative_dir" != "." ] && is_maven_project "$dir"; then
            services+=("$dir")
            log "INFO" "Discovered service: $(get_service_name "$dir") at $relative_dir"
        fi
    done < <(find "$BACKEND_DIR" -name "pom.xml" -type f -print0)
    
    if [ ${#services[@]} -eq 0 ]; then
        log "WARN" "No microservice directories with Maven projects found in $BACKEND_DIR"
        return 1
    fi
    
    log "SUCCESS" "Discovery completed. Found ${#services[@]} microservice(s) to test"
    printf '%s\n' "${services[@]}"
}

# Function to generate test summary report
generate_test_report() {
    log "INFO" "Generating comprehensive test execution report..."
    
    local total_services=$((${#SUCCESSFUL_SERVICES[@]} + ${#FAILED_SERVICES[@]} + ${#SKIPPED_SERVICES[@]}))
    local success_rate=0
    
    if [ $total_services -gt 0 ]; then
        success_rate=$(( ${#SUCCESSFUL_SERVICES[@]} * 100 / total_services ))
    fi
    
    echo "
================================================================================
                        BACKEND TEST EXECUTION REPORT
================================================================================
Execution Date: $(date +"$TIMESTAMP_FORMAT")
Log File: $LOG_FILE
Backend Directory: $BACKEND_DIR

SUMMARY:
- Total Services Tested: $total_services
- Successful: ${#SUCCESSFUL_SERVICES[@]}
- Failed: ${#FAILED_SERVICES[@]}
- Skipped: ${#SKIPPED_SERVICES[@]}
- Success Rate: ${success_rate}%
- Overall Status: $( [ $EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED" )

SUCCESSFUL SERVICES (${#SUCCESSFUL_SERVICES[@]}):
$(printf '  ✓ %s\n' "${SUCCESSFUL_SERVICES[@]}" || echo "  None")

FAILED SERVICES (${#FAILED_SERVICES[@]}):
$(printf '  ✗ %s\n' "${FAILED_SERVICES[@]}" || echo "  None")

SKIPPED SERVICES (${#SKIPPED_SERVICES[@]}):
$(printf '  - %s\n' "${SKIPPED_SERVICES[@]}" || echo "  None")

COMPLIANCE INFORMATION:
- Code Coverage Threshold: ${MIN_COVERAGE_THRESHOLD}%
- Test Timeout: ${TEST_TIMEOUT}s
- Maven Version: $(mvn -version | head -n 1 | awk '{print $3}' 2>/dev/null || echo "Unknown")
- Java Version: $(java -version 2>&1 | head -n 1 | awk -F '\"' '{print $2}' 2>/dev/null || echo "Unknown")

For detailed logs and test reports, please refer to:
- Execution Log: $LOG_FILE
- Individual service test reports: <service>/target/surefire-reports/
- Coverage reports: <service>/target/site/jacoco/
================================================================================
" | tee -a "$LOG_FILE"
}

# Cleanup function for graceful shutdown
cleanup() {
    log "INFO" "Performing cleanup operations..."
    
    # Kill any remaining Maven processes
    pkill -f "maven" 2>/dev/null || true
    
    # Generate final report
    generate_test_report
    
    log "INFO" "Cleanup completed"
}

# Set up trap for cleanup on script exit
trap cleanup EXIT INT TERM

# ==============================================================================
# MAIN FUNCTION
# ==============================================================================

main() {
    log "SUCCESS" "=========================================="
    log "SUCCESS" "FINANCIAL SERVICES BACKEND TEST EXECUTION"
    log "SUCCESS" "=========================================="
    log "INFO" "Starting automated test execution for all backend microservices"
    log "INFO" "Execution started at: $(date +"$TIMESTAMP_FORMAT")"
    log "INFO" "Process ID: $$"
    log "INFO" "Log file: $LOG_FILE"
    
    # Validate environment before proceeding
    validate_environment
    
    # Discover all microservice directories
    log "INFO" "Initiating microservice discovery process..."
    local services
    if ! services=$(discover_services); then
        log "ERROR" "Service discovery failed. No services found to test."
        EXIT_CODE=1
        return 1
    fi
    
    # Convert services string to array
    local service_dirs=()
    while IFS= read -r line; do
        [ -n "$line" ] && service_dirs+=("$line")
    done <<< "$services"
    
    log "INFO" "Beginning test execution phase for ${#service_dirs[@]} services..."
    log "INFO" "Test execution parameters:"
    log "INFO" "  - Parallel jobs: $PARALLEL_JOBS"
    log "INFO" "  - Timeout per service: ${TEST_TIMEOUT}s"
    log "INFO" "  - Coverage threshold: ${MIN_COVERAGE_THRESHOLD}%"
    log "INFO" "  - Maven options: $MAVEN_OPTS"
    
    # Store original directory to restore later
    local original_dir=$(pwd)
    
    # Execute tests for each discovered service
    for service_dir in "${service_dirs[@]}"; do
        local service_name=$(get_service_name "$service_dir")
        
        log "INFO" "----------------------------------------"
        log "INFO" "Processing service: $service_name"
        log "INFO" "Service path: $service_dir"
        
        # Check if service directory is accessible
        if [ ! -d "$service_dir" ]; then
            log "ERROR" "Service directory not accessible: $service_dir"
            SKIPPED_SERVICES+=("$service_name")
            continue
        fi
        
        # Run tests for the current service
        if ! run_service_tests "$service_dir"; then
            log "ERROR" "Test execution failed for service: $service_name"
            EXIT_CODE=1
        fi
        
        # Return to original directory
        cd "$original_dir" || {
            log "ERROR" "Failed to return to original directory: $original_dir"
            EXIT_CODE=1
        }
    done
    
    # Final status evaluation
    log "INFO" "=========================================="
    log "INFO" "TEST EXECUTION PHASE COMPLETED"
    log "INFO" "=========================================="
    
    if [ $EXIT_CODE -eq 0 ]; then
        log "SUCCESS" "✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!"
        log "SUCCESS" "All ${#service_dirs[@]} microservices have passed their test suites"
        log "SUCCESS" "System is ready for deployment to the next stage"
    else
        log "ERROR" "❌ SOME BACKEND TESTS FAILED!"
        log "ERROR" "Test failures detected in ${#FAILED_SERVICES[@]} out of ${#service_dirs[@]} services"
        log "ERROR" "Please review the test results and fix failing tests before proceeding"
        log "ERROR" "Failed services: ${FAILED_SERVICES[*]}"
    fi
    
    log "INFO" "Test execution completed at: $(date +"$TIMESTAMP_FORMAT")"
    log "INFO" "For detailed results, check the test report above or log file: $LOG_FILE"
    
    # Exit with the final status code
    exit $EXIT_CODE
}

# ==============================================================================
# SCRIPT EXECUTION ENTRY POINT
# ==============================================================================

# Execute main function only if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi