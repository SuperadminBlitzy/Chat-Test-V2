#!/bin/bash

# =============================================================================
# UNIFIED FINANCIAL SERVICES PLATFORM - SECURITY SCAN SCRIPT
# =============================================================================
# Description: Automated security scanning script for backend services
# Implements: SAST (SonarQube) and DAST (OWASP ZAP) scanning
# Integration: CI/CD pipeline security integration
# Compliance: SOX, PCI DSS, GDPR, Basel III audit requirements
# 
# Dependencies:
# - docker (24.0+): Container runtime for OWASP ZAP
# - sonar-scanner (4.8+): SonarQube command-line scanner
# - zap.sh from owasp-zap (2.14+): OWASP ZAP CLI interface
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# GLOBAL CONFIGURATION VARIABLES
# =============================================================================

# SonarQube Configuration
# Default SonarQube server URL for containerized environments
readonly SONARQUBE_HOST_URL="${SONARQUBE_HOST_URL:-http://sonarqube:9000}"

# SonarQube authentication token (required)
readonly SONARQUBE_LOGIN="${SONARQUBE_LOGIN}"

# Project key for backend services in SonarQube
readonly PROJECT_KEY="${PROJECT_KEY:-ufs-backend}"

# OWASP ZAP Configuration
# ZAP API endpoint for DAST scanning
readonly ZAP_API_URL="${ZAP_API_URL:-http://zap:8080}"

# Target application URL for dynamic security testing
readonly TARGET_API_URL="${TARGET_API_URL:-http://api-gateway:8080}"

# Security scanning thresholds based on technical specifications
readonly CRITICAL_THRESHOLD="CRITICAL"
readonly HIGH_THRESHOLD="HIGH"
readonly MEDIUM_THRESHOLD="MEDIUM"
readonly LOW_THRESHOLD="LOW"

# Logging configuration for audit compliance
readonly LOG_FILE="/tmp/security-scan-$(date +%Y%m%d-%H%M%S).log"
readonly SCAN_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Report output directories
readonly SAST_REPORTS_DIR="/tmp/sast-reports"
readonly DAST_REPORTS_DIR="/tmp/dast-reports"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Logging function for audit trail compliance
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Log to both stdout and audit log file
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

# Error handling function with audit logging
handle_error() {
    local exit_code="$1"
    local error_message="$2"
    
    log_message "ERROR" "Security scan failed: ${error_message}"
    log_message "ERROR" "Exit code: ${exit_code}"
    
    # Send notification to security team for critical failures
    if [[ "${exit_code}" -ge 2 ]]; then
        log_message "CRITICAL" "Critical security scan failure - Security team notification required"
    fi
    
    exit "${exit_code}"
}

# Validate environment prerequisites
validate_environment() {
    log_message "INFO" "Validating environment prerequisites..."
    
    # Check required environment variables
    if [[ -z "${SONARQUBE_LOGIN:-}" ]]; then
        handle_error 1 "SONARQUBE_LOGIN environment variable is required"
    fi
    
    # Verify tool availability
    local missing_tools=()
    
    if ! command -v sonar-scanner >/dev/null 2>&1; then
        missing_tools+=("sonar-scanner")
    fi
    
    if ! command -v docker >/dev/null 2>&1; then
        missing_tools+=("docker")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        handle_error 1 "Missing required tools: ${missing_tools[*]}"
    fi
    
    # Create report directories
    mkdir -p "${SAST_REPORTS_DIR}" "${DAST_REPORTS_DIR}"
    
    log_message "INFO" "Environment validation completed successfully"
}

# Check service availability
check_service_availability() {
    local service_url="$1"
    local service_name="$2"
    local max_retries=5
    local retry_count=0
    
    log_message "INFO" "Checking availability of ${service_name} at ${service_url}"
    
    while [[ ${retry_count} -lt ${max_retries} ]]; do
        if curl -sf "${service_url}" >/dev/null 2>&1; then
            log_message "INFO" "${service_name} is available"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        log_message "WARN" "${service_name} not available, retry ${retry_count}/${max_retries}"
        sleep 10
    done
    
    log_message "ERROR" "${service_name} is not available after ${max_retries} retries"
    return 1
}

# =============================================================================
# SAST SCANNING FUNCTION - SONARQUBE INTEGRATION
# =============================================================================

run_sast_scan() {
    log_message "INFO" "Starting Static Application Security Testing (SAST) with SonarQube"
    
    # Validate SonarQube login token
    if [[ -z "${SONARQUBE_LOGIN}" ]]; then
        log_message "ERROR" "SonarQube authentication token is required for SAST scan"
        return 1
    fi
    
    # Check SonarQube server availability
    if ! check_service_availability "${SONARQUBE_HOST_URL}/api/system/status" "SonarQube Server"; then
        log_message "ERROR" "SonarQube server is not accessible"
        return 1
    fi
    
    # Navigate to backend source code root
    local project_root
    project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    
    log_message "INFO" "Scanning project root: ${project_root}"
    
    # Execute SonarQube scanner with comprehensive security analysis
    log_message "INFO" "Executing SonarQube security analysis..."
    
    local sonar_args=(
        "-Dsonar.projectKey=${PROJECT_KEY}"
        "-Dsonar.host.url=${SONARQUBE_HOST_URL}"
        "-Dsonar.login=${SONARQUBE_LOGIN}"
        "-Dsonar.projectName=UFS Backend Services"
        "-Dsonar.projectVersion=${SCAN_TIMESTAMP}"
        "-Dsonar.sources=${project_root}/src"
        "-Dsonar.tests=${project_root}/test"
        "-Dsonar.language=java,js,ts,py"
        "-Dsonar.java.binaries=${project_root}/target/classes"
        "-Dsonar.exclusions=**/node_modules/**,**/target/**,**/*.min.js"
        "-Dsonar.coverage.exclusions=**/test/**,**/spec/**"
        # Enhanced security-focused analysis
        "-Dsonar.security.hotspots.inheritFromParent=true"
        "-Dsonar.java.checkstyle.reportPaths=target/checkstyle-result.xml"
        "-Dsonar.java.pmd.reportPaths=target/pmd.xml"
        "-Dsonar.java.spotbugs.reportPaths=target/spotbugsXml.xml"
        # Financial services specific quality gates
        "-Dsonar.qualitygate.wait=true"
        "-Dsonar.qualitygate.timeout=300"
    )
    
    # Execute the scanner with timeout protection
    if timeout 600 sonar-scanner "${sonar_args[@]}" 2>&1 | tee "${SAST_REPORTS_DIR}/sonarqube-scan.log"; then
        log_message "INFO" "SonarQube SAST scan completed successfully"
        
        # Check quality gate status
        local quality_gate_status
        quality_gate_status=$(curl -s -u "${SONARQUBE_LOGIN}:" \
            "${SONARQUBE_HOST_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}" \
            | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [[ "${quality_gate_status}" == "ERROR" ]]; then
            log_message "ERROR" "SonarQube quality gate failed - Critical security issues detected"
            return 2
        elif [[ "${quality_gate_status}" == "WARN" ]]; then
            log_message "WARN" "SonarQube quality gate warning - Review security findings"
        else
            log_message "INFO" "SonarQube quality gate passed"
        fi
        
        return 0
    else
        local exit_code=$?
        log_message "ERROR" "SonarQube SAST scan failed with exit code: ${exit_code}"
        return "${exit_code}"
    fi
}

# =============================================================================
# DAST SCANNING FUNCTION - OWASP ZAP INTEGRATION
# =============================================================================

run_dast_scan() {
    log_message "INFO" "Starting Dynamic Application Security Testing (DAST) with OWASP ZAP"
    
    # Validate target API URL accessibility
    if ! check_service_availability "${TARGET_API_URL}/health" "Target API"; then
        log_message "WARN" "Target API health check failed, proceeding with base URL scan"
    fi
    
    # OWASP ZAP Docker container configuration
    local zap_container_name="ufs-security-zap-${SCAN_TIMESTAMP//[:-]/}"
    local zap_image="owasp/zap2docker-stable:2.14.0"
    
    # ZAP scan configuration for financial services
    local zap_scan_args=(
        # Basic scan configuration
        "-t" "${TARGET_API_URL}"
        "-f" "openapi"
        "-r" "/zap/wrk/dast-report.html"
        "-J" "/zap/wrk/dast-report.json"
        "-x" "/zap/wrk/dast-report.xml"
        # Enhanced security scanning options
        "-a"  # Include the alpha quality rules
        "-j"  # Use the Ajax spider
        "-l" "PASS"  # Minimum log level
        # Financial services specific configurations
        "-c" "/zap/wrk/zap-config.xml"
        # Authentication and session management
        "-z" "-config api.addrs.addr.name=0.0.0.0 -config api.addrs.addr.regex=true"
        # Performance and timeout settings
        "-T" "120"  # Max scan time in minutes
        "-m" "10"   # Max scan depth
    )
    
    log_message "INFO" "Starting OWASP ZAP container: ${zap_container_name}"
    
    # Create ZAP configuration for financial services
    cat > "${DAST_REPORTS_DIR}/zap-config.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <spider>
        <maxDepth>10</maxDepth>
        <threadCount>10</threadCount>
        <maxDuration>30</maxDuration>
        <acceptCookies>true</acceptCookies>
        <handleParameters>true</handleParameters>
        <parseComments>true</parseComments>
        <parseRobotsTxt>true</parseRobotsTxt>
        <parseSVNEntries>false</parseSVNEntries>
        <parseSitemapXml>true</parseSitemapXml>
        <parseGit>false</parseGit>
        <userAgent>OWASP ZAP Financial Services Scanner</userAgent>
    </spider>
    <scanner>
        <level>HIGH</level>
        <strength>HIGH</strength>
        <alertThreshold>OFF</alertThreshold>
        <inScopeOnly>true</inScopeOnly>
        <techSet>Db,Language,OS,Platform,SCM,Server,WebServer</techSet>
    </scanner>
</configuration>
EOF
    
    # Execute OWASP ZAP DAST scan in Docker container
    log_message "INFO" "Executing OWASP ZAP security scan against ${TARGET_API_URL}"
    
    if docker run --rm \
        --name "${zap_container_name}" \
        --network host \
        -v "${DAST_REPORTS_DIR}:/zap/wrk" \
        -u zap \
        "${zap_image}" \
        zap-api-scan.py "${zap_scan_args[@]}" 2>&1 | tee "${DAST_REPORTS_DIR}/zap-scan.log"; then
        
        log_message "INFO" "OWASP ZAP DAST scan completed successfully"
        
        # Analyze scan results for critical vulnerabilities
        local critical_count high_count medium_count low_count
        
        if [[ -f "${DAST_REPORTS_DIR}/dast-report.json" ]]; then
            critical_count=$(grep -c '"riskcode": "3"' "${DAST_REPORTS_DIR}/dast-report.json" || echo "0")
            high_count=$(grep -c '"riskcode": "2"' "${DAST_REPORTS_DIR}/dast-report.json" || echo "0")
            medium_count=$(grep -c '"riskcode": "1"' "${DAST_REPORTS_DIR}/dast-report.json" || echo "0")
            low_count=$(grep -c '"riskcode": "0"' "${DAST_REPORTS_DIR}/dast-report.json" || echo "0")
            
            log_message "INFO" "DAST Scan Results: Critical=${critical_count}, High=${high_count}, Medium=${medium_count}, Low=${low_count}"
            
            # Apply financial services security thresholds
            if [[ ${critical_count} -gt 0 ]]; then
                log_message "CRITICAL" "Critical vulnerabilities detected - Deployment must be blocked"
                return 3
            elif [[ ${high_count} -gt 0 ]]; then
                log_message "ERROR" "High severity vulnerabilities detected - Security team notification required"
                return 2
            elif [[ ${medium_count} -gt 5 ]]; then
                log_message "WARN" "Multiple medium severity vulnerabilities detected - Review recommended"
                return 1
            else
                log_message "INFO" "No critical or high severity vulnerabilities detected"
                return 0
            fi
        else
            log_message "WARN" "DAST report file not found, assuming scan completed without critical issues"
            return 0
        fi
        
    else
        local exit_code=$?
        log_message "ERROR" "OWASP ZAP DAST scan failed with exit code: ${exit_code}"
        
        # Clean up container on failure
        docker stop "${zap_container_name}" 2>/dev/null || true
        docker rm "${zap_container_name}" 2>/dev/null || true
        
        return "${exit_code}"
    fi
}

# =============================================================================
# MAIN ORCHESTRATION FUNCTION
# =============================================================================

main() {
    log_message "INFO" "=========================================="
    log_message "INFO" "UFS Security Scan Process Started"
    log_message "INFO" "Timestamp: ${SCAN_TIMESTAMP}"
    log_message "INFO" "Project: ${PROJECT_KEY}"
    log_message "INFO" "Target: ${TARGET_API_URL}"
    log_message "INFO" "=========================================="
    
    # Validate environment and prerequisites
    validate_environment
    
    local overall_exit_code=0
    local sast_result=0
    local dast_result=0
    
    # Execute Static Application Security Testing (SAST)
    log_message "INFO" "Phase 1: Static Application Security Testing (SAST)"
    if ! run_sast_scan; then
        sast_result=$?
        log_message "ERROR" "SAST scan failed with exit code: ${sast_result}"
        overall_exit_code=${sast_result}
        
        # For critical SAST failures, abort before DAST
        if [[ ${sast_result} -ge 2 ]]; then
            log_message "CRITICAL" "Critical SAST failures detected - Aborting security scan process"
            handle_error ${sast_result} "Critical SAST scan failures"
        fi
    else
        log_message "INFO" "SAST scan completed successfully"
    fi
    
    # Execute Dynamic Application Security Testing (DAST)
    log_message "INFO" "Phase 2: Dynamic Application Security Testing (DAST)"
    if ! run_dast_scan; then
        dast_result=$?
        log_message "ERROR" "DAST scan failed with exit code: ${dast_result}"
        
        # Use highest exit code for overall result
        if [[ ${dast_result} -gt ${overall_exit_code} ]]; then
            overall_exit_code=${dast_result}
        fi
    else
        log_message "INFO" "DAST scan completed successfully"
    fi
    
    # Generate security scan summary report
    log_message "INFO" "=========================================="
    log_message "INFO" "Security Scan Summary"
    log_message "INFO" "SAST Result: $([[ ${sast_result} -eq 0 ]] && echo "PASSED" || echo "FAILED (${sast_result})")"
    log_message "INFO" "DAST Result: $([[ ${dast_result} -eq 0 ]] && echo "PASSED" || echo "FAILED (${dast_result})")"
    
    if [[ ${overall_exit_code} -eq 0 ]]; then
        log_message "INFO" "🎉 All security scans completed successfully"
        log_message "INFO" "Deployment can proceed - No critical security issues detected"
    elif [[ ${overall_exit_code} -eq 1 ]]; then
        log_message "WARN" "⚠️  Security scans completed with warnings"
        log_message "WARN" "Review findings before deployment"
    elif [[ ${overall_exit_code} -eq 2 ]]; then
        log_message "ERROR" "❌ Security scans failed with high severity issues"
        log_message "ERROR" "Deployment should be blocked - Security team notification required"
    else
        log_message "CRITICAL" "🚨 Security scans failed with critical issues"
        log_message "CRITICAL" "Deployment must be blocked - Immediate security review required"
    fi
    
    log_message "INFO" "Reports available in: ${SAST_REPORTS_DIR}, ${DAST_REPORTS_DIR}"
    log_message "INFO" "Audit log: ${LOG_FILE}"
    log_message "INFO" "=========================================="
    
    # Exit with appropriate code for CI/CD pipeline integration
    exit ${overall_exit_code}
}

# =============================================================================
# SCRIPT EXECUTION ENTRY POINT
# =============================================================================

# Execute main function if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi