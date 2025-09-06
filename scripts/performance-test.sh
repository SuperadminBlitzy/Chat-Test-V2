#!/bin/bash

# =============================================================================
# Unified Financial Services Platform - Performance Test Script
# =============================================================================
# Description: Automates execution of performance tests using Apache JMeter
# Version: 1.0.0
# JMeter Version: 5.6.2
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# GLOBAL CONFIGURATION VARIABLES
# =============================================================================

# Default configuration values - can be overridden by environment variables
readonly TARGET_URL="${TARGET_URL:-http://localhost:8080}"
readonly NUM_USERS="${NUM_USERS:-1000}"
readonly RAMP_UP_PERIOD="${RAMP_UP_PERIOD:-60}"
readonly TEST_DURATION="${TEST_DURATION:-300}"
readonly JMX_FILE="${JMX_FILE:-tests/performance/UFS_Performance_Test.jmx}"
readonly REPORT_DIR="${REPORT_DIR:-target/performance-reports}"

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
readonly LOG_FILE="${REPORT_DIR}/performance-test-${TIMESTAMP}.log"
readonly RESULTS_FILE="${REPORT_DIR}/results-${TIMESTAMP}.jtl"
readonly HTML_REPORT_DIR="${REPORT_DIR}/html-report-${TIMESTAMP}"

# Performance thresholds based on technical specifications
readonly MAX_RESPONSE_TIME_MS="1000"      # Sub-second response time requirement
readonly MIN_THROUGHPUT_TPS="10000"       # 10,000+ TPS capacity requirement
readonly MAX_ERROR_RATE_PERCENT="0.1"     # 99.9% success rate minimum
readonly AVAILABILITY_TARGET="99.99"      # 99.99% uptime requirement

# JMeter configuration
readonly JMETER_MIN_VERSION="5.6"
readonly JAVA_MIN_VERSION="8"
readonly DEFAULT_HEAP_SIZE="4g"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Enhanced logging function with different levels
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    case "$level" in
        "INFO")  echo -e "\033[0;32m[INFO]\033[0m  [$timestamp] $message" ;;
        "WARN")  echo -e "\033[0;33m[WARN]\033[0m  [$timestamp] $message" ;;
        "ERROR") echo -e "\033[0;31m[ERROR]\033[0m [$timestamp] $message" ;;
        "DEBUG") [[ "${DEBUG:-false}" == "true" ]] && echo -e "\033[0;36m[DEBUG]\033[0m [$timestamp] $message" ;;
    esac
    
    # Also log to file if log directory exists
    if [[ -d "$(dirname "$LOG_FILE")" ]]; then
        echo "[$level] [$timestamp] $message" >> "$LOG_FILE"
    fi
}

# Function to validate prerequisites
validate_prerequisites() {
    log "INFO" "Validating prerequisites for performance testing..."
    
    # Check if Java is installed and meets minimum version
    if ! command -v java &> /dev/null; then
        log "ERROR" "Java is not installed or not in PATH"
        log "ERROR" "Please install Java ${JAVA_MIN_VERSION}+ before running performance tests"
        exit 1
    fi
    
    local java_version
    java_version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1-2)
    log "DEBUG" "Detected Java version: $java_version"
    
    # Check if JMeter is available
    if ! command -v jmeter &> /dev/null; then
        log "ERROR" "Apache JMeter is not installed or not in PATH"
        log "ERROR" "Please install Apache JMeter ${JMETER_MIN_VERSION}+ to run performance tests"
        log "INFO" "Download from: https://jmeter.apache.org/download_jmeter.cgi"
        exit 1
    fi
    
    # Validate JMeter version
    local jmeter_version
    jmeter_version=$(jmeter --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
    log "DEBUG" "Detected JMeter version: $jmeter_version"
    
    # Check if test plan file exists
    if [[ ! -f "$JMX_FILE" ]]; then
        log "ERROR" "JMeter test plan file not found: $JMX_FILE"
        log "ERROR" "Please ensure the test plan exists before running performance tests"
        exit 1
    fi
    
    # Validate target URL accessibility
    log "INFO" "Validating target URL accessibility: $TARGET_URL"
    if ! curl -s --max-time 10 --fail "$TARGET_URL/health" > /dev/null 2>&1; then
        log "WARN" "Health check endpoint not accessible at $TARGET_URL/health"
        log "WARN" "Proceeding with performance test - ensure target system is running"
    fi
    
    log "INFO" "Prerequisites validation completed successfully"
}

# Function to validate test parameters
validate_test_parameters() {
    log "INFO" "Validating test parameters..."
    
    # Validate numeric parameters
    if ! [[ "$NUM_USERS" =~ ^[0-9]+$ ]] || [[ "$NUM_USERS" -le 0 ]]; then
        log "ERROR" "Invalid NUM_USERS value: $NUM_USERS (must be positive integer)"
        exit 1
    fi
    
    if ! [[ "$RAMP_UP_PERIOD" =~ ^[0-9]+$ ]] || [[ "$RAMP_UP_PERIOD" -le 0 ]]; then
        log "ERROR" "Invalid RAMP_UP_PERIOD value: $RAMP_UP_PERIOD (must be positive integer)"
        exit 1
    fi
    
    if ! [[ "$TEST_DURATION" =~ ^[0-9]+$ ]] || [[ "$TEST_DURATION" -le 0 ]]; then
        log "ERROR" "Invalid TEST_DURATION value: $TEST_DURATION (must be positive integer)"
        exit 1
    fi
    
    # Validate URL format
    if ! [[ "$TARGET_URL" =~ ^https?:// ]]; then
        log "ERROR" "Invalid TARGET_URL format: $TARGET_URL (must start with http:// or https://)"
        exit 1
    fi
    
    # Check for reasonable test parameters for financial services
    if [[ "$NUM_USERS" -gt 50000 ]]; then
        log "WARN" "High user count detected ($NUM_USERS). Ensure adequate system resources"
    fi
    
    if [[ "$TEST_DURATION" -gt 3600 ]]; then
        log "WARN" "Long test duration detected (${TEST_DURATION}s). Consider shorter tests for initial validation"
    fi
    
    log "INFO" "Test parameters validation completed successfully"
}

# Function to setup JMeter environment
setup_jmeter_environment() {
    log "INFO" "Setting up JMeter environment for financial services testing..."
    
    # Set JMeter heap size for high-load testing
    export JVM_ARGS="-Xms${DEFAULT_HEAP_SIZE} -Xmx${DEFAULT_HEAP_SIZE} -XX:+UseG1GC -XX:MaxGCPauseMillis=100"
    
    # Configure JMeter properties for financial services requirements
    export JMETER_OPTS="-Djava.security.egd=file:/dev/./urandom"
    export JMETER_OPTS="$JMETER_OPTS -Dsun.net.useExclusiveBind=false"
    export JMETER_OPTS="$JMETER_OPTS -Djmeter.save.saveservice.output_format=csv"
    export JMETER_OPTS="$JMETER_OPTS -Djmeter.save.saveservice.response_data=false"
    export JMETER_OPTS="$JMETER_OPTS -Djmeter.save.saveservice.samplerData=false"
    export JMETER_OPTS="$JMETER_OPTS -Djmeter.save.saveservice.response_headers=false"
    export JMETER_OPTS="$JMETER_OPTS -Djmeter.save.saveservice.requestHeaders=false"
    
    log "DEBUG" "JVM_ARGS set to: $JVM_ARGS"
    log "DEBUG" "JMETER_OPTS set to: $JMETER_OPTS"
    
    log "INFO" "JMeter environment setup completed"
}

# Function to create report directory structure
create_report_directory() {
    log "INFO" "Creating report directory structure..."
    
    if [[ ! -d "$REPORT_DIR" ]]; then
        if ! mkdir -p "$REPORT_DIR"; then
            log "ERROR" "Failed to create report directory: $REPORT_DIR"
            exit 1
        fi
        log "DEBUG" "Created report directory: $REPORT_DIR"
    fi
    
    # Create subdirectories for organized reporting
    local subdirs=("logs" "results" "html-reports" "archives")
    for subdir in "${subdirs[@]}"; do
        if ! mkdir -p "${REPORT_DIR}/${subdir}"; then
            log "ERROR" "Failed to create subdirectory: ${REPORT_DIR}/${subdir}"
            exit 1
        fi
    done
    
    log "INFO" "Report directory structure created successfully"
}

# Function to analyze test results
analyze_test_results() {
    local results_file="$1"
    
    log "INFO" "Analyzing performance test results..."
    
    if [[ ! -f "$results_file" ]]; then
        log "ERROR" "Results file not found: $results_file"
        return 1
    fi
    
    # Extract key metrics using awk (avoiding dependencies on external tools)
    local total_samples avg_response_time error_rate throughput
    
    # Calculate basic statistics from JTL file
    total_samples=$(awk -F',' 'NR>1 {count++} END {print count+0}' "$results_file")
    avg_response_time=$(awk -F',' 'NR>1 {sum+=$2; count++} END {print (count>0) ? int(sum/count) : 0}' "$results_file")
    error_rate=$(awk -F',' 'NR>1 {total++; if($8=="false") errors++} END {print (total>0) ? (errors+0)*100/total : 0}' "$results_file")
    
    # Calculate throughput (samples per second)
    local start_time end_time duration
    start_time=$(awk -F',' 'NR==2 {print $1}' "$results_file")
    end_time=$(awk -F',' 'END {print $1}' "$results_file")
    duration=$(( (end_time - start_time) / 1000 ))
    throughput=$(( duration > 0 ? total_samples / duration : 0 ))
    
    log "INFO" "=== PERFORMANCE TEST RESULTS SUMMARY ==="
    log "INFO" "Total Samples: $total_samples"
    log "INFO" "Average Response Time: ${avg_response_time}ms"
    log "INFO" "Error Rate: ${error_rate}%"
    log "INFO" "Throughput: ${throughput} TPS"
    log "INFO" "Test Duration: ${duration}s"
    
    # Validate against financial services requirements
    local validation_passed=true
    
    if (( $(echo "$avg_response_time > $MAX_RESPONSE_TIME_MS" | bc -l) )); then
        log "ERROR" "Response time (${avg_response_time}ms) exceeds maximum allowed (${MAX_RESPONSE_TIME_MS}ms)"
        validation_passed=false
    fi
    
    if (( $(echo "$error_rate > $MAX_ERROR_RATE_PERCENT" | bc -l) )); then
        log "ERROR" "Error rate (${error_rate}%) exceeds maximum allowed (${MAX_ERROR_RATE_PERCENT}%)"
        validation_passed=false
    fi
    
    if [[ "$throughput" -lt "$MIN_THROUGHPUT_TPS" ]]; then
        log "ERROR" "Throughput (${throughput} TPS) below minimum required (${MIN_THROUGHPUT_TPS} TPS)"
        validation_passed=false
    fi
    
    if [[ "$validation_passed" == "true" ]]; then
        log "INFO" "✅ All performance requirements met successfully"
        return 0
    else
        log "ERROR" "❌ Performance requirements not met - review results and optimize system"
        return 1
    fi
}

# =============================================================================
# MAIN PERFORMANCE TEST FUNCTION
# =============================================================================

run_performance_test() {
    log "INFO" "Starting performance test execution for Unified Financial Services Platform"
    log "INFO" "Test Configuration:"
    log "INFO" "  Target URL: $TARGET_URL"
    log "INFO" "  Concurrent Users: $NUM_USERS"
    log "INFO" "  Ramp-up Period: ${RAMP_UP_PERIOD}s"
    log "INFO" "  Test Duration: ${TEST_DURATION}s"
    log "INFO" "  Test Plan: $JMX_FILE"
    
    # Step 1: Print test start message
    log "INFO" "=== UNIFIED FINANCIAL SERVICES PLATFORM PERFORMANCE TEST ==="
    log "INFO" "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    
    # Step 2: Check if JMeter executable is available
    if ! command -v jmeter &> /dev/null; then
        log "ERROR" "JMeter executable not found in system PATH"
        log "ERROR" "Please ensure Apache JMeter ${JMETER_MIN_VERSION}+ is installed and accessible"
        exit 1
    fi
    
    # Step 3: Create report directory if it doesn't exist
    create_report_directory
    
    # Step 4-12: Execute JMeter command with comprehensive configuration
    log "INFO" "Executing JMeter performance test..."
    
    local jmeter_cmd=(
        "jmeter"
        "-n"                                    # Non-GUI mode for CI/CD integration
        "-t" "$JMX_FILE"                       # Test plan file path
        "-l" "$RESULTS_FILE"                   # JTL results file path
        "-e"                                   # Generate HTML report at end of test
        "-o" "$HTML_REPORT_DIR"               # HTML report output directory
        "-j" "$LOG_FILE"                      # JMeter log file path
        "-Jtarget.url=$TARGET_URL"            # Custom property: target URL
        "-Jnum.users=$NUM_USERS"              # Custom property: number of users
        "-Jramp.up.period=$RAMP_UP_PERIOD"    # Custom property: ramp-up period
        "-Jtest.duration=$TEST_DURATION"      # Custom property: test duration
        "-Jresults.file=$RESULTS_FILE"        # Custom property: results file
        "-Jhtml.report.dir=$HTML_REPORT_DIR"  # Custom property: HTML report directory
    )
    
    # Add additional JMeter properties for financial services testing
    jmeter_cmd+=(
        "-Jjmeter.save.saveservice.output_format=csv"
        "-Jjmeter.save.saveservice.response_data=false"
        "-Jjmeter.save.saveservice.samplerData=false"
        "-Jjmeter.save.saveservice.response_headers=false"
        "-Jjmeter.save.saveservice.requestHeaders=false"
        "-Jjmeter.save.saveservice.encoding=false"
        "-Jjmeter.save.saveservice.label=true"
        "-Jjmeter.save.saveservice.latency=true"
        "-Jjmeter.save.saveservice.response_code=true"
        "-Jjmeter.save.saveservice.response_message=true"
        "-Jjmeter.save.saveservice.successful=true"
        "-Jjmeter.save.saveservice.thread_name=true"
        "-Jjmeter.save.saveservice.time=true"
        "-Jjmeter.save.saveservice.timestamp_format=yyyy/MM/dd HH:mm:ss.SSS"
    )
    
    log "DEBUG" "JMeter command: ${jmeter_cmd[*]}"
    
    # Execute JMeter with timeout and error handling
    local jmeter_exit_code=0
    local test_timeout=$((TEST_DURATION + RAMP_UP_PERIOD + 300))  # Add 5min buffer
    
    log "INFO" "Starting JMeter execution (timeout: ${test_timeout}s)..."
    
    if timeout "$test_timeout" "${jmeter_cmd[@]}"; then
        jmeter_exit_code=0
        log "INFO" "JMeter execution completed successfully"
    else
        jmeter_exit_code=$?
        if [[ $jmeter_exit_code -eq 124 ]]; then
            log "ERROR" "JMeter execution timed out after ${test_timeout} seconds"
        else
            log "ERROR" "JMeter execution failed with exit code: $jmeter_exit_code"
        fi
    fi
    
    # Step 13: Check exit code of JMeter command
    if [[ $jmeter_exit_code -ne 0 ]]; then
        log "ERROR" "Performance test execution failed"
        log "ERROR" "JMeter exit code: $jmeter_exit_code"
        log "ERROR" "Check JMeter log file for details: $LOG_FILE"
        
        # Provide troubleshooting information
        if [[ -f "$LOG_FILE" ]]; then
            log "INFO" "Last 10 lines of JMeter log:"
            tail -n 10 "$LOG_FILE" 2>/dev/null || log "WARN" "Could not read JMeter log file"
        fi
        
        exit $jmeter_exit_code
    fi
    
    # Step 14: Analyze and validate results
    if [[ -f "$RESULTS_FILE" ]]; then
        if analyze_test_results "$RESULTS_FILE"; then
            log "INFO" "Performance test completed successfully with all requirements met"
        else
            log "ERROR" "Performance test completed but requirements not met"
            exit 1
        fi
    else
        log "ERROR" "Results file not generated: $RESULTS_FILE"
        exit 1
    fi
    
    # Step 15: Print success message with report locations
    log "INFO" "=== PERFORMANCE TEST COMPLETED SUCCESSFULLY ==="
    log "INFO" "Test reports available at:"
    log "INFO" "  HTML Report: $HTML_REPORT_DIR/index.html"
    log "INFO" "  Raw Results: $RESULTS_FILE"
    log "INFO" "  Execution Log: $LOG_FILE"
    log "INFO" "Performance test execution completed at $(date '+%Y-%m-%d %H:%M:%S %Z')"
    
    # Archive results for long-term storage
    local archive_file="${REPORT_DIR}/archives/performance-test-${TIMESTAMP}.tar.gz"
    if tar -czf "$archive_file" -C "$REPORT_DIR" "$(basename "$HTML_REPORT_DIR")" "$(basename "$RESULTS_FILE")" "$(basename "$LOG_FILE")" 2>/dev/null; then
        log "INFO" "Test results archived to: $archive_file"
    fi
}

# =============================================================================
# SCRIPT EXECUTION CONTROL
# =============================================================================

# Function to display usage information
show_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Unified Financial Services Platform Performance Test Script

This script automates the execution of performance tests using Apache JMeter
to validate system performance against financial services requirements.

Environment Variables:
  TARGET_URL        Target application URL (default: http://localhost:8080)
  NUM_USERS         Number of concurrent users (default: 1000)
  RAMP_UP_PERIOD    Ramp-up time in seconds (default: 60)
  TEST_DURATION     Test duration in seconds (default: 300)
  JMX_FILE          JMeter test plan file (default: tests/performance/UFS_Performance_Test.jmx)
  REPORT_DIR        Report output directory (default: target/performance-reports)

Options:
  -h, --help        Show this help message
  -v, --verbose     Enable verbose debug logging
  --validate-only   Only validate prerequisites without running tests
  --version         Show script version information

Performance Requirements:
  - Response Time: < 1000ms (sub-second requirement)
  - Throughput: > 10,000 TPS (high-capacity requirement)
  - Error Rate: < 0.1% (99.9% success rate)
  - Availability: 99.99% uptime target

Examples:
  # Run with default settings
  $SCRIPT_NAME

  # Run with custom configuration
  TARGET_URL=https://api.example.com NUM_USERS=5000 $SCRIPT_NAME

  # Validate prerequisites only
  $SCRIPT_NAME --validate-only

Prerequisites:
  - Java 8+ installed and in PATH
  - Apache JMeter 5.6.2+ installed and in PATH
  - Valid JMeter test plan file (.jmx)
  - Target system accessible and running

For more information, visit: https://jmeter.apache.org/
EOF
}

# Main execution function
main() {
    local validate_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                export DEBUG=true
                log "DEBUG" "Verbose logging enabled"
                shift
                ;;
            --validate-only)
                validate_only=true
                shift
                ;;
            --version)
                echo "$SCRIPT_NAME version 1.0.0"
                echo "Apache JMeter Performance Testing Script"
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                log "INFO" "Use '$SCRIPT_NAME --help' for usage information"
                exit 1
                ;;
        esac
    done
    
    # Execute prerequisites validation
    validate_prerequisites
    validate_test_parameters
    setup_jmeter_environment
    
    if [[ "$validate_only" == "true" ]]; then
        log "INFO" "Prerequisites validation completed successfully"
        log "INFO" "System is ready for performance testing"
        exit 0
    fi
    
    # Execute main performance test
    run_performance_test
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Trap signals for graceful shutdown
trap 'log "WARN" "Performance test interrupted by user"; exit 130' INT TERM

# Execute main function with all arguments
main "$@"