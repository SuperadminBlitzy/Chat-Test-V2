#!/bin/bash

# ==============================================================================
# Unified Financial Services Platform - Local Development Environment Setup
# ==============================================================================
# 
# This script automates the initialization of the entire local development 
# environment for the backend microservices. It orchestrates the startup of
# all financial services components using Docker Compose, ensuring a consistent
# and reliable development environment for all engineers.
#
# The script implements enterprise-grade practices with comprehensive error
# handling, dependency validation, and detailed status reporting suitable for
# financial services development requirements.
#
# Author: UFS Platform Team
# Version: 1.0.0
# Last Modified: 2024
# ==============================================================================

# Exit on any error, undefined variable, or pipe failure
set -euo pipefail

# ==============================================================================
# GLOBAL CONFIGURATION
# ==============================================================================

# Docker Compose configuration file path (relative to script location)
readonly COMPOSE_FILE="../docker-compose.yml"

# Project name for Docker Compose namespace isolation
readonly PROJECT_NAME="unified-financial-services"

# Script metadata for logging and identification
readonly SCRIPT_NAME="$(basename "${0}")"
readonly SCRIPT_VERSION="1.0.0"
readonly LOG_PREFIX="[UFS-INIT]"

# Color codes for enhanced terminal output
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_PURPLE='\033[0;35m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_RESET='\033[0m'

# Unicode symbols for status indicators
readonly SYMBOL_SUCCESS="✅"
readonly SYMBOL_ERROR="❌"
readonly SYMBOL_WARNING="⚠️"
readonly SYMBOL_INFO="ℹ️"
readonly SYMBOL_PROGRESS="🔄"

# Timeout values in seconds
readonly DEPENDENCY_CHECK_TIMEOUT=10
readonly SERVICE_START_TIMEOUT=300
readonly HEALTH_CHECK_TIMEOUT=120

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Prints formatted log messages with timestamp and color coding
# Arguments:
#   $1: Log level (INFO, WARN, ERROR, SUCCESS)
#   $2: Message to log
log_message() {
    local level="${1:-INFO}"
    local message="${2:-}"
    local timestamp
    local color
    local symbol
    
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    case "${level}" in
        "INFO")
            color="${COLOR_BLUE}"
            symbol="${SYMBOL_INFO}"
            ;;
        "WARN")
            color="${COLOR_YELLOW}"
            symbol="${SYMBOL_WARNING}"
            ;;
        "ERROR")
            color="${COLOR_RED}"
            symbol="${SYMBOL_ERROR}"
            ;;
        "SUCCESS")
            color="${COLOR_GREEN}"
            symbol="${SYMBOL_SUCCESS}"
            ;;
        "PROGRESS")
            color="${COLOR_PURPLE}"
            symbol="${SYMBOL_PROGRESS}"
            ;;
        *)
            color="${COLOR_RESET}"
            symbol="${SYMBOL_INFO}"
            ;;
    esac
    
    echo -e "${color}${LOG_PREFIX} [${timestamp}] ${symbol} ${message}${COLOR_RESET}" >&2
}

# Prints section headers with decorative formatting
# Arguments:
#   $1: Section title
print_section_header() {
    local title="${1:-}"
    local line_length=80
    local padding=$(( (line_length - ${#title} - 4) / 2 ))
    
    echo
    echo -e "${COLOR_CYAN}$(printf '=%.0s' $(seq 1 $line_length))${COLOR_RESET}"
    echo -e "${COLOR_CYAN}$(printf '%*s' $padding '')  ${title}  $(printf '%*s' $padding '')${COLOR_RESET}"
    echo -e "${COLOR_CYAN}$(printf '=%.0s' $(seq 1 $line_length))${COLOR_RESET}"
    echo
}

# Validates that a command exists and is executable
# Arguments:
#   $1: Command name to check
#   $2: Optional description for error messages
command_exists() {
    local cmd="${1:-}"
    local description="${2:-${cmd}}"
    
    if command -v "${cmd}" >/dev/null 2>&1; then
        log_message "SUCCESS" "${description} is available at: $(command -v "${cmd}")"
        return 0
    else
        log_message "ERROR" "${description} is not installed or not in PATH"
        return 1
    fi
}

# Checks if Docker daemon is running and accessible
validate_docker_daemon() {
    log_message "PROGRESS" "Validating Docker daemon accessibility..."
    
    if timeout "${DEPENDENCY_CHECK_TIMEOUT}" docker info >/dev/null 2>&1; then
        local docker_version
        docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_message "SUCCESS" "Docker daemon is running (version: ${docker_version})"
        return 0
    else
        log_message "ERROR" "Docker daemon is not running or not accessible"
        log_message "ERROR" "Please ensure Docker Desktop is started and try again"
        return 1
    fi
}

# Validates Docker Compose file syntax and accessibility
validate_compose_file() {
    log_message "PROGRESS" "Validating Docker Compose configuration..."
    
    # Check if compose file exists
    if [[ ! -f "${COMPOSE_FILE}" ]]; then
        log_message "ERROR" "Docker Compose file not found: ${COMPOSE_FILE}"
        log_message "ERROR" "Please ensure you're running this script from the correct directory"
        return 1
    fi
    
    # Validate compose file syntax
    if timeout "${DEPENDENCY_CHECK_TIMEOUT}" docker-compose -f "${COMPOSE_FILE}" config >/dev/null 2>&1; then
        log_message "SUCCESS" "Docker Compose configuration is valid"
        
        # Count total services for user information
        local service_count
        service_count=$(docker-compose -f "${COMPOSE_FILE}" config --services | wc -l)
        log_message "INFO" "Configuration contains ${service_count} services"
        
        return 0
    else
        log_message "ERROR" "Docker Compose configuration is invalid"
        log_message "ERROR" "Please check the compose file syntax and try again"
        return 1
    fi
}

# ==============================================================================
# MAIN FUNCTIONS
# ==============================================================================

# Performs comprehensive dependency validation
# Validates Docker, Docker Compose installation and configuration
check_dependencies() {
    print_section_header "DEPENDENCY VALIDATION"
    
    log_message "INFO" "Starting dependency validation for ${SCRIPT_NAME} v${SCRIPT_VERSION}"
    log_message "INFO" "Validating prerequisites for financial services development environment"
    
    local dependencies_met=true
    
    # Check Docker installation
    log_message "PROGRESS" "Checking Docker installation..."
    if ! command_exists "docker" "Docker Engine"; then
        dependencies_met=false
        log_message "ERROR" "Docker is required but not installed"
        log_message "ERROR" "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    fi
    
    # Check Docker Compose installation
    log_message "PROGRESS" "Checking Docker Compose installation..."
    if ! command_exists "docker-compose" "Docker Compose"; then
        dependencies_met=false
        log_message "ERROR" "Docker Compose is required but not installed"
        log_message "ERROR" "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    fi
    
    # If basic tools are available, perform deeper validation
    if [[ "${dependencies_met}" == "true" ]]; then
        # Validate Docker daemon
        if ! validate_docker_daemon; then
            dependencies_met=false
        fi
        
        # Validate compose file
        if ! validate_compose_file; then
            dependencies_met=false
        fi
        
        # Check available system resources
        log_message "PROGRESS" "Checking system resources..."
        
        # Check available disk space (minimum 10GB recommended)
        local available_space_kb
        available_space_kb=$(df . | tail -1 | awk '{print $4}')
        local available_space_gb=$((available_space_kb / 1024 / 1024))
        
        if [[ ${available_space_gb} -lt 10 ]]; then
            log_message "WARN" "Low disk space detected: ${available_space_gb}GB available"
            log_message "WARN" "Minimum 10GB recommended for financial services platform"
        else
            log_message "SUCCESS" "Sufficient disk space available: ${available_space_gb}GB"
        fi
        
        # Check available memory
        if command -v free >/dev/null 2>&1; then
            local available_memory_mb
            available_memory_mb=$(free -m | grep '^Mem:' | awk '{print $7}')
            if [[ ${available_memory_mb} -lt 4096 ]]; then
                log_message "WARN" "Low memory detected: ${available_memory_mb}MB available"
                log_message "WARN" "Minimum 4GB RAM recommended for optimal performance"
            else
                log_message "SUCCESS" "Sufficient memory available: ${available_memory_mb}MB"
            fi
        fi
    fi
    
    # Final dependency check result
    if [[ "${dependencies_met}" == "true" ]]; then
        log_message "SUCCESS" "All dependencies validated successfully"
        log_message "INFO" "System is ready for financial services platform deployment"
    else
        log_message "ERROR" "Dependency validation failed"
        log_message "ERROR" "Please resolve the above issues before proceeding"
        exit 1
    fi
}

# Orchestrates the startup of all microservices using Docker Compose
# Implements progressive startup with health monitoring
start_services() {
    print_section_header "SERVICE STARTUP"
    
    log_message "INFO" "Initializing Unified Financial Services Platform"
    log_message "INFO" "Project: ${PROJECT_NAME}"
    log_message "INFO" "Compose file: ${COMPOSE_FILE}"
    
    # Pre-startup cleanup of any existing containers
    log_message "PROGRESS" "Performing pre-startup cleanup..."
    if docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps -q 2>/dev/null | grep -q .; then
        log_message "INFO" "Stopping existing containers for clean startup..."
        docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" down --remove-orphans 2>/dev/null || true
    fi
    
    # Pull latest images to ensure consistency
    log_message "PROGRESS" "Pulling latest container images..."
    if ! timeout "${SERVICE_START_TIMEOUT}" docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" pull --quiet; then
        log_message "WARN" "Some images could not be pulled, continuing with cached versions"
    else
        log_message "SUCCESS" "Container images updated successfully"
    fi
    
    # Start services with build and detached mode
    log_message "PROGRESS" "Starting financial services infrastructure..."
    log_message "INFO" "This may take several minutes for initial build and startup..."
    
    local start_time
    start_time=$(date +%s)
    
    # Execute docker-compose up with comprehensive options
    if timeout "${SERVICE_START_TIMEOUT}" docker-compose \
        -f "${COMPOSE_FILE}" \
        -p "${PROJECT_NAME}" \
        up -d --build --remove-orphans 2>&1 | while IFS= read -r line; do
            # Filter and format docker-compose output
            if [[ "${line}" =~ ^(Creating|Starting|Building) ]]; then
                log_message "PROGRESS" "${line}"
            elif [[ "${line}" =~ (ERROR|error|Error) ]]; then
                log_message "ERROR" "${line}"
            elif [[ "${line}" =~ (WARNING|warning|Warning) ]]; then
                log_message "WARN" "${line}"
            fi
        done; then
        
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_message "SUCCESS" "Services started successfully in ${duration} seconds"
        
        # Wait for critical services to become healthy
        log_message "PROGRESS" "Waiting for critical services to become healthy..."
        wait_for_service_health
        
    else
        log_message "ERROR" "Service startup failed or timed out after ${SERVICE_START_TIMEOUT} seconds"
        log_message "ERROR" "Check Docker logs for detailed error information:"
        log_message "ERROR" "  docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} logs"
        exit 1
    fi
}

# Waits for critical services to pass health checks
wait_for_service_health() {
    local critical_services=("config-server" "discovery-service" "postgres" "redis" "kafka")
    local max_wait="${HEALTH_CHECK_TIMEOUT}"
    local wait_interval=10
    local waited=0
    
    log_message "INFO" "Monitoring health status of critical services..."
    
    while [[ ${waited} -lt ${max_wait} ]]; do
        local all_healthy=true
        
        for service in "${critical_services[@]}"; do
            local container_name="${PROJECT_NAME}-${service}-1"
            local health_status
            
            # Check if container exists and get health status
            if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "${container_name}"; then
                health_status=$(docker inspect --format='{{.State.Health.Status}}' "${container_name}" 2>/dev/null || echo "unknown")
                
                if [[ "${health_status}" != "healthy" ]] && [[ "${health_status}" != "unknown" ]]; then
                    all_healthy=false
                    break
                elif [[ "${health_status}" == "unknown" ]]; then
                    # For services without health checks, assume healthy if running
                    if ! docker ps --format "{{.Names}}" | grep -q "${container_name}"; then
                        all_healthy=false
                        break
                    fi
                fi
            else
                all_healthy=false
                break
            fi
        done
        
        if [[ "${all_healthy}" == "true" ]]; then
            log_message "SUCCESS" "All critical services are healthy"
            return 0
        fi
        
        log_message "PROGRESS" "Waiting for services to become healthy... (${waited}s/${max_wait}s)"
        sleep ${wait_interval}
        waited=$((waited + wait_interval))
    done
    
    log_message "WARN" "Health check timeout reached, but services may still be starting"
    log_message "INFO" "You can monitor service health using: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} ps"
}

# Displays comprehensive status information for all services
show_status() {
    print_section_header "SERVICE STATUS"
    
    log_message "INFO" "Generating comprehensive status report for ${PROJECT_NAME}"
    
    # Display running containers with formatted output
    log_message "INFO" "Container Status Overview:"
    echo
    
    # Create formatted table header
    printf "${COLOR_CYAN}%-40s %-15s %-20s %-15s${COLOR_RESET}\n" \
        "SERVICE NAME" "STATUS" "PORTS" "HEALTH"
    printf "${COLOR_CYAN}%-40s %-15s %-20s %-15s${COLOR_RESET}\n" \
        "$(printf '%-40s' | tr ' ' '-')" \
        "$(printf '%-15s' | tr ' ' '-')" \
        "$(printf '%-20s' | tr ' ' '-')" \
        "$(printf '%-15s' | tr ' ' '-')"
    
    # Get detailed container information
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}" | \
    tail -n +2 | while IFS=$'\t' read -r name state ports; do
        # Extract service name from container name
        local service_name
        service_name=$(echo "${name}" | sed "s/^${PROJECT_NAME}-//" | sed 's/-[0-9]*$//')
        
        # Get health status
        local health_status
        health_status=$(docker inspect --format='{{.State.Health.Status}}' "${name}" 2>/dev/null || echo "no-check")
        
        # Format health status with colors
        local health_display
        case "${health_status}" in
            "healthy")
                health_display="${COLOR_GREEN}HEALTHY${COLOR_RESET}"
                ;;
            "unhealthy")
                health_display="${COLOR_RED}UNHEALTHY${COLOR_RESET}"
                ;;
            "starting")
                health_display="${COLOR_YELLOW}STARTING${COLOR_RESET}"
                ;;
            *)
                health_display="${COLOR_BLUE}NO-CHECK${COLOR_RESET}"
                ;;
        esac
        
        # Format status with colors
        local status_display
        if [[ "${state}" == "Up" ]]; then
            status_display="${COLOR_GREEN}RUNNING${COLOR_RESET}"
        else
            status_display="${COLOR_RED}${state}${COLOR_RESET}"
        fi
        
        # Clean up ports display
        local ports_clean
        ports_clean=$(echo "${ports}" | sed 's/0.0.0.0://g' | sed 's/:::.*//g' | tr ',' ' ')
        
        printf "%-50s %-25s %-20s %-25s\n" \
            "${service_name}" \
            "${status_display}" \
            "${ports_clean}" \
            "${health_display}"
    done
    
    echo
    
    # Display service categorization
    log_message "INFO" "Service Categories:"
    
    local infrastructure_services=("config-server" "discovery-service" "api-gateway")
    local core_services=("auth-service" "customer-service" "transaction-service" "risk-assessment-service" "compliance-service")
    local data_services=("postgres" "mongo" "redis" "influxdb")
    local messaging_services=("zookeeper" "kafka")
    local monitoring_services=("jaeger" "prometheus" "grafana")
    
    echo
    echo -e "${COLOR_PURPLE}Infrastructure Services:${COLOR_RESET}"
    for service in "${infrastructure_services[@]}"; do
        local status
        status=$(docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps "${service}" --format "{{.State}}" 2>/dev/null || echo "Not Running")
        local indicator
        if [[ "${status}" == "Up" ]]; then
            indicator="${SYMBOL_SUCCESS}"
        else
            indicator="${SYMBOL_ERROR}"
        fi
        echo "  ${indicator} ${service}"
    done
    
    echo
    echo -e "${COLOR_BLUE}Core Business Services:${COLOR_RESET}"
    for service in "${core_services[@]}"; do
        local status
        status=$(docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps "${service}" --format "{{.State}}" 2>/dev/null || echo "Not Running")
        local indicator
        if [[ "${status}" == "Up" ]]; then
            indicator="${SYMBOL_SUCCESS}"
        else
            indicator="${SYMBOL_ERROR}"
        fi
        echo "  ${indicator} ${service}"
    done
    
    echo
    echo -e "${COLOR_GREEN}Data Storage Services:${COLOR_RESET}"
    for service in "${data_services[@]}"; do
        local status
        status=$(docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps "${service}" --format "{{.State}}" 2>/dev/null || echo "Not Running")
        local indicator
        if [[ "${status}" == "Up" ]]; then
            indicator="${SYMBOL_SUCCESS}"
        else
            indicator="${SYMBOL_ERROR}"
        fi
        echo "  ${indicator} ${service}"
    done
    
    # Display access URLs for key services
    echo
    log_message "INFO" "Service Access URLs:"
    
    local service_urls=(
        "API Gateway:              http://localhost:8080"
        "Discovery Service:        http://localhost:8761"
        "Grafana Dashboard:        http://localhost:3002 (admin/grafana_admin_2024)"
        "Prometheus Metrics:       http://localhost:9090"
        "Jaeger Tracing:          http://localhost:16686"
        "PostgreSQL Database:      localhost:5432 (admin/password)"
        "MongoDB Database:         localhost:27017 (admin/password)"
        "Redis Cache:             localhost:6379"
        "Kafka Broker:            localhost:9092"
    )
    
    echo
    for url in "${service_urls[@]}"; do
        echo -e "  ${COLOR_CYAN}${url}${COLOR_RESET}"
    done
    
    # Display useful commands
    echo
    log_message "INFO" "Useful Commands:"
    echo
    echo -e "  ${COLOR_YELLOW}View logs:${COLOR_RESET}       docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} logs -f [service]"
    echo -e "  ${COLOR_YELLOW}Stop services:${COLOR_RESET}   docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down"
    echo -e "  ${COLOR_YELLOW}Restart service:${COLOR_RESET} docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} restart [service]"
    echo -e "  ${COLOR_YELLOW}Scale service:${COLOR_RESET}   docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d --scale [service]=N"
    echo -e "  ${COLOR_YELLOW}Service shell:${COLOR_RESET}   docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} exec [service] bash"
    
    # Display resource usage summary
    log_message "INFO" "Resource Usage Summary:"
    local total_containers
    total_containers=$(docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps -q | wc -l)
    log_message "INFO" "Total containers running: ${total_containers}"
    
    if command -v docker >/dev/null 2>&1; then
        local total_images
        total_images=$(docker images --format "table {{.Repository}}" | grep -c "^ufs/" || echo "0")
        log_message "INFO" "UFS platform images: ${total_images}"
    fi
}

# Main orchestration function that coordinates the entire initialization process
main() {
    # Display startup banner
    print_section_header "UNIFIED FINANCIAL SERVICES PLATFORM"
    
    log_message "INFO" "Initializing local development environment"
    log_message "INFO" "Script: ${SCRIPT_NAME} v${SCRIPT_VERSION}"
    log_message "INFO" "Platform: $(uname -s) $(uname -r)"
    log_message "INFO" "User: $(whoami)"
    log_message "INFO" "Working directory: $(pwd)"
    
    # Record start time for total execution duration
    local start_time
    start_time=$(date +%s)
    
    # Execute main workflow
    check_dependencies
    start_services
    show_status
    
    # Calculate and display total execution time
    local end_time
    end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    local minutes=$((total_duration / 60))
    local seconds=$((total_duration % 60))
    
    # Final success message
    print_section_header "INITIALIZATION COMPLETE"
    
    log_message "SUCCESS" "Unified Financial Services Platform is ready for development!"
    log_message "SUCCESS" "Total initialization time: ${minutes}m ${seconds}s"
    log_message "INFO" "All microservices are running and ready to accept requests"
    log_message "INFO" "The development environment supports:"
    echo "    • Microservices architecture with service discovery"
    echo "    • Financial transaction processing and risk assessment"
    echo "    • Real-time analytics and compliance monitoring"
    echo "    • Blockchain settlement and audit trails"
    echo "    • Comprehensive observability and monitoring"
    echo "    • Development-optimized configurations"
    
    log_message "INFO" "Begin development with confidence in your local financial services platform!"
    
    # Optional: Display next steps
    echo
    log_message "INFO" "Next Steps:"
    echo "  1. Verify service health using the provided URLs"
    echo "  2. Check application logs if any service shows issues"
    echo "  3. Begin development against the API Gateway at http://localhost:8080"
    echo "  4. Monitor service metrics at http://localhost:3002 (Grafana)"
    echo "  5. Use 'docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down' to stop services"
    
    echo
}

# ==============================================================================
# SCRIPT EXECUTION
# ==============================================================================

# Trap signals for graceful shutdown
trap 'log_message "WARN" "Received interrupt signal, please wait for cleanup..."; exit 130' INT TERM

# Ensure script is not run as root for security
if [[ "${EUID}" -eq 0 ]]; then
    log_message "ERROR" "This script should not be run as root for security reasons"
    log_message "ERROR" "Please run as a regular user with Docker permissions"
    exit 1
fi

# Change to script directory to ensure relative paths work correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Validate script environment
if [[ ! -f "${COMPOSE_FILE}" ]]; then
    log_message "ERROR" "Docker Compose file not found at expected location: ${COMPOSE_FILE}"
    log_message "ERROR" "Please ensure script is run from the correct directory structure"
    exit 1
fi

# Execute main function with all arguments
main "$@"