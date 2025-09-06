#!/bin/bash

# ==============================================================================
# Unified Financial Services Platform - Backend Build Script
# ==============================================================================
# 
# This script automates the build process for all backend microservices of the 
# Unified Financial Services Platform. It supports building Java-based services 
# with Maven, Node.js services with npm, and Python services with pip.
# 
# The script is designed for use in CI/CD pipelines and local development 
# environments, providing options to build all services or specific modules.
# It also includes Docker image creation for each service.
# 
# Version: 1.0.0
# Author: Unified Financial Services Platform Team
# License: Proprietary
# ==============================================================================

set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Pipe failures are treated as command failures

# ==============================================================================
# GLOBAL CONFIGURATION VARIABLES
# ==============================================================================

# All backend service directory names
readonly SERVICES=(
    "api-gateway"
    "discovery-service"
    "config-server"
    "auth-service"
    "customer-service"
    "transaction-service"
    "risk-assessment-service"
    "compliance-service"
    "analytics-service"
    "financial-wellness-service"
    "blockchain-service"
    "notification-service"
    "ai-service"
)

# Java-based service directory names (Spring Boot microservices)
readonly JAVA_SERVICES=(
    "api-gateway"
    "discovery-service"
    "config-server"
    "auth-service"
    "customer-service"
    "transaction-service"
    "risk-assessment-service"
    "compliance-service"
    "analytics-service"
    "financial-wellness-service"
)

# Node.js-based service directory names (Express.js microservices)  
readonly NODE_SERVICES=(
    "blockchain-service"
    "notification-service"
)

# Python-based service directory names (FastAPI microservices)
readonly PYTHON_SERVICES=(
    "ai-service"
)

# Docker registry configuration
readonly DOCKER_REGISTRY="${DOCKER_REGISTRY:-harbor.financial-platform.com}"

# Image version tag (derived from Git tag or environment variable)
IMAGE_VERSION="${IMAGE_VERSION:-latest}"

# Build configuration
readonly BUILD_TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
readonly BUILD_USER="${USER:-ci-build}"
readonly GIT_COMMIT_SHA="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Build counters for summary reporting
BUILD_SUCCESS_COUNT=0
BUILD_FAILURE_COUNT=0
DOCKER_SUCCESS_COUNT=0
DOCKER_FAILURE_COUNT=0

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Print colored output messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Print section headers
print_section() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate required tools are installed
validate_dependencies() {
    print_section "Validating Build Dependencies"
    
    local missing_tools=()
    
    # Check for Java build tools
    if ! command_exists mvn; then
        missing_tools+=("maven")
    fi
    
    if ! command_exists java; then
        missing_tools+=("openjdk-21")
    fi
    
    # Check for Node.js build tools
    if ! command_exists npm; then
        missing_tools+=("nodejs npm")
    fi
    
    # Check for Python build tools
    if ! command_exists python3; then
        missing_tools+=("python3")
    fi
    
    if ! command_exists pip3; then
        missing_tools+=("python3-pip")
    fi
    
    # Check for Docker if building images
    if [[ "${BUILD_DOCKER:-false}" == "true" ]] && ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    # Check for Git for version tagging
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        print_error "Missing required dependencies: ${missing_tools[*]}"
        print_error "Please install missing tools and retry the build"
        exit 1
    fi
    
    print_success "All required dependencies are available"
    
    # Print versions for debugging
    print_info "Java version: $(java -version 2>&1 | head -n 1)"
    print_info "Maven version: $(mvn -version 2>&1 | head -n 1)"
    print_info "Node.js version: $(node --version 2>/dev/null || echo 'Not available')"
    print_info "npm version: $(npm --version 2>/dev/null || echo 'Not available')"
    print_info "Python version: $(python3 --version 2>/dev/null || echo 'Not available')"
    print_info "Docker version: $(docker --version 2>/dev/null || echo 'Not available')"
}

# Set image version based on Git tag or environment
set_image_version() {
    if [[ -n "${CI:-}" ]]; then
        # In CI environment, use CI-specific versioning
        if [[ -n "${GITHUB_REF_NAME:-}" ]]; then
            IMAGE_VERSION="${GITHUB_REF_NAME}-${BUILD_TIMESTAMP}"
        elif [[ -n "${BUILD_NUMBER:-}" ]]; then
            IMAGE_VERSION="build-${BUILD_NUMBER}"
        else
            IMAGE_VERSION="${GIT_COMMIT_SHA}-${BUILD_TIMESTAMP}"
        fi
    else
        # Local development environment
        local git_tag
        git_tag=$(git describe --tags --exact-match 2>/dev/null || echo "")
        
        if [[ -n "$git_tag" ]]; then
            IMAGE_VERSION="$git_tag"
        else
            IMAGE_VERSION="${GIT_COMMIT_SHA}-dev"
        fi
    fi
    
    print_info "Using image version: ${IMAGE_VERSION}"
}

# ==============================================================================
# SERVICE BUILD FUNCTIONS
# ==============================================================================

# Build a single Java microservice using Maven
build_java_service() {
    local service_name="$1"
    local service_dir="src/backend/${service_name}"
    
    print_info "Building Java service: ${service_name}"
    
    # Check if service directory exists
    if [[ ! -d "$service_dir" ]]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    # Check if pom.xml exists
    if [[ ! -f "$service_dir/pom.xml" ]]; then
        print_error "pom.xml not found in $service_dir"
        return 1
    fi
    
    # Navigate to service directory
    pushd "$service_dir" > /dev/null
    
    # Clean and build the service
    print_info "Running Maven clean package for ${service_name}..."
    
    # Use Maven wrapper if available, otherwise use system Maven
    local maven_cmd="mvn"
    if [[ -f "../../mvnw" ]]; then
        maven_cmd="../../mvnw"
        chmod +x "../../mvnw"
    fi
    
    # Build with different profiles based on environment
    local maven_profile="dev"
    if [[ "${BUILD_ENV:-dev}" == "prod" ]]; then
        maven_profile="prod"
    elif [[ "${BUILD_ENV:-dev}" == "test" ]]; then
        maven_profile="test"
    fi
    
    if $maven_cmd clean package -P"$maven_profile" -DskipTests="${SKIP_TESTS:-true}" \
        -Dmaven.repo.local="${HOME}/.m2/repository" \
        -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn; then
        
        print_success "Successfully built Java service: ${service_name}"
        ((BUILD_SUCCESS_COUNT++))
        popd > /dev/null
        return 0
    else
        print_error "Failed to build Java service: ${service_name}"
        ((BUILD_FAILURE_COUNT++))
        popd > /dev/null
        return 1
    fi
}

# Build a single Node.js microservice using npm
build_node_service() {
    local service_name="$1"
    local service_dir="src/backend/${service_name}"
    
    print_info "Building Node.js service: ${service_name}"
    
    # Check if service directory exists
    if [[ ! -d "$service_dir" ]]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    # Check if package.json exists
    if [[ ! -f "$service_dir/package.json" ]]; then
        print_error "package.json not found in $service_dir"
        return 1
    fi
    
    # Navigate to service directory
    pushd "$service_dir" > /dev/null
    
    # Set Node.js environment
    export NODE_ENV="${BUILD_ENV:-development}"
    
    # Clean install dependencies
    print_info "Installing dependencies for ${service_name}..."
    if ! npm ci --silent; then
        print_error "Failed to install dependencies for ${service_name}"
        ((BUILD_FAILURE_COUNT++))
        popd > /dev/null
        return 1
    fi
    
    # Run TypeScript build
    print_info "Building TypeScript code for ${service_name}..."
    if ! npm run build; then
        print_error "Failed to build TypeScript code for ${service_name}"
        ((BUILD_FAILURE_COUNT++))
        popd > /dev/null
        return 1
    fi
    
    # Run tests if not skipped
    if [[ "${SKIP_TESTS:-true}" != "true" ]]; then
        print_info "Running tests for ${service_name}..."
        if ! npm test; then
            print_warning "Tests failed for ${service_name}, continuing build..."
        fi
    fi
    
    # Run linting
    if [[ "${SKIP_LINT:-false}" != "true" ]]; then
        print_info "Running linting for ${service_name}..."
        if ! npm run lint; then
            print_warning "Linting issues found in ${service_name}, continuing build..."
        fi
    fi
    
    print_success "Successfully built Node.js service: ${service_name}"
    ((BUILD_SUCCESS_COUNT++))
    popd > /dev/null
    return 0
}

# Prepare a Python microservice for deployment by installing dependencies
build_python_service() {
    local service_name="$1"
    local service_dir="src/backend/${service_name}"
    
    print_info "Building Python service: ${service_name}"
    
    # Check if service directory exists
    if [[ ! -d "$service_dir" ]]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    # Check if requirements.txt exists
    if [[ ! -f "$service_dir/requirements.txt" ]]; then
        print_error "requirements.txt not found in $service_dir"
        return 1
    fi
    
    # Navigate to service directory
    pushd "$service_dir" > /dev/null
    
    # Set Python environment variables
    export PYTHONPATH="${PWD}:${PYTHONPATH:-}"
    export PYTHONDONTWRITEBYTECODE=1
    export PYTHONUNBUFFERED=1
    
    # Create virtual environment if it doesn't exist
    local venv_dir="venv"
    if [[ ! -d "$venv_dir" ]]; then
        print_info "Creating virtual environment for ${service_name}..."
        python3 -m venv "$venv_dir"
    fi
    
    # Activate virtual environment
    print_info "Activating virtual environment for ${service_name}..."
    source "$venv_dir/bin/activate"
    
    # Upgrade pip
    print_info "Upgrading pip for ${service_name}..."
    pip install --upgrade pip setuptools wheel
    
    # Install dependencies
    print_info "Installing dependencies for ${service_name}..."
    if ! pip install -r requirements.txt --no-cache-dir; then
        print_error "Failed to install dependencies for ${service_name}"
        deactivate
        ((BUILD_FAILURE_COUNT++))
        popd > /dev/null
        return 1
    fi
    
    # Run tests if not skipped
    if [[ "${SKIP_TESTS:-true}" != "true" ]] && [[ -f "pytest.ini" || -f "pyproject.toml" ]]; then
        print_info "Running tests for ${service_name}..."
        if ! pytest; then
            print_warning "Tests failed for ${service_name}, continuing build..."
        fi
    fi
    
    # Deactivate virtual environment
    deactivate
    
    print_success "Successfully built Python service: ${service_name}"
    ((BUILD_SUCCESS_COUNT++))
    popd > /dev/null
    return 0
}

# Build a Docker image for a single microservice
build_docker_image() {
    local service_name="$1"
    local service_dir="src/backend/${service_name}"
    
    print_info "Building Docker image for service: ${service_name}"
    
    # Check if service directory exists
    if [[ ! -d "$service_dir" ]]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    # Check if Dockerfile exists
    if [[ ! -f "$service_dir/Dockerfile" ]]; then
        print_error "Dockerfile not found in $service_dir"
        return 1
    fi
    
    # Navigate to service directory
    pushd "$service_dir" > /dev/null
    
    # Construct Docker image tag
    local image_tag="${DOCKER_REGISTRY}/${service_name}:${IMAGE_VERSION}"
    local latest_tag="${DOCKER_REGISTRY}/${service_name}:latest"
    
    # Build Docker image with BuildKit for better performance
    print_info "Building Docker image: ${image_tag}"
    
    # Set Docker buildx context if available
    export DOCKER_BUILDKIT=1
    
    # Build image with multiple tags and build arguments
    if docker build \
        --tag "$image_tag" \
        --tag "$latest_tag" \
        --build-arg BUILD_DATE="$BUILD_TIMESTAMP" \
        --build-arg VCS_REF="$GIT_COMMIT_SHA" \
        --build-arg VERSION="$IMAGE_VERSION" \
        --build-arg BUILD_USER="$BUILD_USER" \
        --label "org.label-schema.build-date=$BUILD_TIMESTAMP" \
        --label "org.label-schema.vcs-ref=$GIT_COMMIT_SHA" \
        --label "org.label-schema.version=$IMAGE_VERSION" \
        --label "maintainer=platform-team@financial-services.com" \
        --label "service=$service_name" \
        --label "compliance=PCI-DSS,SOX,GDPR" \
        .; then
        
        print_success "Successfully built Docker image: ${image_tag}"
        
        # Display image size
        local image_size
        image_size=$(docker images --format "table {{.Size}}" "$image_tag" | tail -n 1)
        print_info "Image size: ${image_size}"
        
        ((DOCKER_SUCCESS_COUNT++))
        popd > /dev/null
        return 0
    else
        print_error "Failed to build Docker image for: ${service_name}"
        ((DOCKER_FAILURE_COUNT++))
        popd > /dev/null
        return 1
    fi
}

# ==============================================================================
# MAIN BUILD ORCHESTRATION FUNCTION
# ==============================================================================

# Main function that orchestrates the build process
main() {
    local args=("$@")
    local specific_services=()
    local build_docker=false
    local build_all=true
    local push_images=false
    
    print_section "Unified Financial Services Platform - Backend Build Script"
    print_info "Build started at: $(date)"
    print_info "Build user: ${BUILD_USER}"
    print_info "Git commit: ${GIT_COMMIT_SHA}"
    
    # Parse command-line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --service)
                specific_services+=("$2")
                build_all=false
                shift 2
                ;;
            --docker)
                build_docker=true
                shift
                ;;
            --push)
                push_images=true
                build_docker=true
                shift
                ;;
            --all)
                build_all=true
                shift
                ;;
            --java-only)
                specific_services=("${JAVA_SERVICES[@]}")
                build_all=false
                shift
                ;;
            --node-only)
                specific_services=("${NODE_SERVICES[@]}")
                build_all=false
                shift
                ;;
            --python-only)
                specific_services=("${PYTHON_SERVICES[@]}")
                build_all=false
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown argument: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate dependencies
    validate_dependencies
    
    # Set image version
    set_image_version
    
    # Determine which services to build
    local services_to_build=()
    if [[ "$build_all" == "true" ]]; then
        services_to_build=("${SERVICES[@]}")
    else
        services_to_build=("${specific_services[@]}")
    fi
    
    print_info "Services to build: ${services_to_build[*]}"
    
    # Build Java services
    print_section "Building Java Services"
    for service in "${services_to_build[@]}"; do
        if [[ " ${JAVA_SERVICES[*]} " =~ " ${service} " ]]; then
            if ! build_java_service "$service"; then
                if [[ "${FAIL_FAST:-true}" == "true" ]]; then
                    print_error "Build failed, exiting due to fail-fast mode"
                    exit 1
                fi
            fi
        fi
    done
    
    # Build Node.js services
    print_section "Building Node.js Services"
    for service in "${services_to_build[@]}"; do
        if [[ " ${NODE_SERVICES[*]} " =~ " ${service} " ]]; then
            if ! build_node_service "$service"; then
                if [[ "${FAIL_FAST:-true}" == "true" ]]; then
                    print_error "Build failed, exiting due to fail-fast mode"
                    exit 1
                fi
            fi
        fi
    done
    
    # Build Python services
    print_section "Building Python Services"
    for service in "${services_to_build[@]}"; do
        if [[ " ${PYTHON_SERVICES[*]} " =~ " ${service} " ]]; then
            if ! build_python_service "$service"; then
                if [[ "${FAIL_FAST:-true}" == "true" ]]; then
                    print_error "Build failed, exiting due to fail-fast mode"
                    exit 1
                fi
            fi
        fi
    done
    
    # Build Docker images if requested
    if [[ "$build_docker" == "true" ]]; then
        print_section "Building Docker Images"
        for service in "${services_to_build[@]}"; do
            if ! build_docker_image "$service"; then
                if [[ "${FAIL_FAST:-true}" == "true" ]]; then
                    print_error "Docker build failed, exiting due to fail-fast mode"
                    exit 1
                fi
            fi
        done
        
        # Push images if requested
        if [[ "$push_images" == "true" ]]; then
            print_section "Pushing Docker Images"
            for service in "${services_to_build[@]}"; do
                local image_tag="${DOCKER_REGISTRY}/${service}:${IMAGE_VERSION}"
                local latest_tag="${DOCKER_REGISTRY}/${service}:latest"
                
                print_info "Pushing image: ${image_tag}"
                if docker push "$image_tag" && docker push "$latest_tag"; then
                    print_success "Successfully pushed: ${image_tag}"
                else
                    print_error "Failed to push: ${image_tag}"
                    if [[ "${FAIL_FAST:-true}" == "true" ]]; then
                        exit 1
                    fi
                fi
            done
        fi
    fi
    
    # Print build summary
    print_build_summary
    
    # Exit with appropriate code
    if [[ $BUILD_FAILURE_COUNT -gt 0 ]] || [[ $DOCKER_FAILURE_COUNT -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Display usage information
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    --service SERVICE    Build a specific service (can be used multiple times)
    --docker            Build Docker images for services
    --push              Push Docker images to registry (implies --docker)
    --all               Build all services (default)
    --java-only         Build only Java services
    --node-only         Build only Node.js services  
    --python-only       Build only Python services
    --help, -h          Show this help message

Environment Variables:
    BUILD_ENV           Build environment (dev, test, prod) [default: dev]
    SKIP_TESTS          Skip running tests (true/false) [default: true]
    SKIP_LINT           Skip running linting (true/false) [default: false]
    FAIL_FAST           Exit on first failure (true/false) [default: true]
    DOCKER_REGISTRY     Docker registry URL [default: harbor.financial-platform.com]
    IMAGE_VERSION       Docker image version tag [default: auto-generated]

Examples:
    $0                              # Build all services
    $0 --service api-gateway        # Build specific service
    $0 --java-only --docker         # Build Java services with Docker images
    $0 --all --docker --push        # Build all services and push Docker images

Available Services:
    Java Services:      ${JAVA_SERVICES[*]}
    Node.js Services:   ${NODE_SERVICES[*]}
    Python Services:    ${PYTHON_SERVICES[*]}
EOF
}

# Print comprehensive build summary
print_build_summary() {
    print_section "Build Summary"
    
    print_info "Build completed at: $(date)"
    print_info "Total build time: $((SECONDS / 60))m $((SECONDS % 60))s"
    print_info "Build user: ${BUILD_USER}"
    print_info "Git commit: ${GIT_COMMIT_SHA}"
    print_info "Image version: ${IMAGE_VERSION}"
    
    echo
    print_info "Service Build Results:"
    print_success "  Successful builds: ${BUILD_SUCCESS_COUNT}"
    if [[ $BUILD_FAILURE_COUNT -gt 0 ]]; then
        print_error "  Failed builds: ${BUILD_FAILURE_COUNT}"
    fi
    
    if [[ "${BUILD_DOCKER:-false}" == "true" ]]; then
        echo
        print_info "Docker Build Results:"
        print_success "  Successful images: ${DOCKER_SUCCESS_COUNT}"
        if [[ $DOCKER_FAILURE_COUNT -gt 0 ]]; then
            print_error "  Failed images: ${DOCKER_FAILURE_COUNT}"
        fi
    fi
    
    echo
    if [[ $BUILD_FAILURE_COUNT -eq 0 ]] && [[ $DOCKER_FAILURE_COUNT -eq 0 ]]; then
        print_success "🎉 All builds completed successfully!"
    else
        print_error "❌ Some builds failed. Check the logs above for details."
    fi
}

# ==============================================================================
# SCRIPT ENTRY POINT
# ==============================================================================

# Ensure script is run from the correct directory (project root)
if [[ ! -f "src/backend/pom.xml" ]]; then
    print_error "This script must be run from the project root directory"
    print_error "Expected to find: src/backend/pom.xml"
    exit 1
fi

# Trap to ensure cleanup on script exit
trap 'print_info "Build script interrupted or completed"' EXIT

# Execute main function with all arguments
main "$@"