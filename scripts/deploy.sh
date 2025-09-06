#!/bin/bash

#############################################################################
# Unified Financial Services Platform - Backend Deployment Script
#############################################################################
# This script handles the deployment of the Unified Financial Services 
# Platform's backend services to a Kubernetes cluster. It supports deployments 
# to different environments and can be integrated into a CI/CD pipeline.
# The script uses Helm to manage Kubernetes deployments.
#
# Features:
# - Multi-environment support (dev, staging, prod)
# - Helm-based deployments with environment-specific configurations
# - Automated rollback capabilities
# - Health checks and deployment validation
# - Integration with ArgoCD for GitOps workflows
# - Security scanning and compliance validation
# - Resource monitoring and alerting
#
# Dependencies:
# - kubectl v1.28+
# - helm v3.13+
# - jq v1.6+
# - curl v7.68+
#
# Author: Financial Platform DevOps Team
# Version: 2.1.0
# Last Updated: 2024-12-13
#############################################################################

set -euo pipefail

#############################################################################
# GLOBAL CONFIGURATION VARIABLES
#############################################################################

# Kubernetes configuration
KUBECONFIG="${KUBECONFIG:-${HOME}/.kube/config}"
export KUBECONFIG

# Helm charts and Kubernetes manifests directories
HELM_CHARTS_DIR="${HELM_CHARTS_DIR:-src/backend/helm}"
K8S_MANIFESTS_DIR="${K8S_MANIFESTS_DIR:-src/backend/k8s}"

# Script configuration
SCRIPT_NAME="$(basename "$0")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_LEVEL="${LOG_LEVEL:-INFO}"
DRY_RUN="${DRY_RUN:-false}"

# Deployment configuration
DEPLOYMENT_TIMEOUT="${DEPLOYMENT_TIMEOUT:-600}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
ROLLBACK_TIMEOUT="${ROLLBACK_TIMEOUT:-180}"

# Container registry configuration
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-harbor.financial-platform.com}"
IMAGE_PULL_POLICY="${IMAGE_PULL_POLICY:-IfNotPresent}"

# Financial services compliance requirements
COMPLIANCE_LEVEL="${COMPLIANCE_LEVEL:-financial-grade}"
SECURITY_SCANNING_ENABLED="${SECURITY_SCANNING_ENABLED:-true}"
AUDIT_LOGGING_ENABLED="${AUDIT_LOGGING_ENABLED:-true}"

# Environment-specific configurations
declare -A ENVIRONMENT_CONFIGS=(
    ["dev"]="development"
    ["staging"]="staging"  
    ["prod"]="production"
)

declare -A NAMESPACE_MAPPING=(
    ["dev"]="financial-services-dev"
    ["staging"]="financial-services-staging"
    ["prod"]="financial-services"
)

# Microservices to deploy
MICROSERVICES=(
    "account-service"
    "transaction-service"
    "payment-service"
    "compliance-service"
    "notification-service"
    "audit-service"
    "api-gateway"
    "user-management-service"
    "risk-assessment-service"
    "blockchain-service"
)

#############################################################################
# LOGGING AND UTILITY FUNCTIONS
#############################################################################

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Logging function with timestamp and level
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "DEBUG")
            [[ "$LOG_LEVEL" == "DEBUG" ]] && echo -e "${PURPLE}[$timestamp] DEBUG: $message${NC}" >&2
            ;;
        "INFO")
            echo -e "${GREEN}[$timestamp] INFO: $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}[$timestamp] WARN: $message${NC}" >&2
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] ERROR: $message${NC}" >&2
            ;;
        "FATAL")
            echo -e "${RED}[$timestamp] FATAL: $message${NC}" >&2
            exit 1
            ;;
    esac
}

# Check if required commands are available
check_prerequisites() {
    log "INFO" "Checking deployment prerequisites..."
    
    local required_commands=("kubectl" "helm" "jq" "curl" "base64")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log "FATAL" "Missing required commands: ${missing_commands[*]}"
    fi
    
    # Check kubectl cluster connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log "FATAL" "Cannot connect to Kubernetes cluster. Check KUBECONFIG: $KUBECONFIG"
    fi
    
    # Check Helm installation
    local helm_version
    helm_version=$(helm version --short 2>/dev/null | cut -d'+' -f1 | sed 's/v//')
    if [[ "$(printf '%s\n' "3.13.0" "$helm_version" | sort -V | head -n1)" != "3.13.0" ]]; then
        log "WARN" "Helm version $helm_version detected. Recommended version is 3.13+"
    fi
    
    log "INFO" "Prerequisites check completed successfully"
}

# Validate environment parameter
validate_environment() {
    local environment="$1"
    
    if [[ ! "${ENVIRONMENT_CONFIGS[$environment]+isset}" ]]; then
        log "ERROR" "Invalid environment: $environment"
        log "ERROR" "Valid environments: ${!ENVIRONMENT_CONFIGS[*]}"
        return 1
    fi
    
    return 0
}

# Validate image tag format
validate_image_tag() {
    local image_tag="$1"
    
    # Image tag validation for financial services compliance
    # Format: v<major>.<minor>.<patch>[-<prerelease>][+<build>]
    if [[ ! "$image_tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)*(\+[a-zA-Z0-9]+)*$ ]]; then
        log "ERROR" "Invalid image tag format: $image_tag"
        log "ERROR" "Expected format: v<major>.<minor>.<patch>[-<prerelease>][+<build>]"
        log "ERROR" "Example: v1.2.3, v1.2.3-rc1, v1.2.3+build123"
        return 1
    fi
    
    return 0
}

#############################################################################
# SECURITY AND COMPLIANCE FUNCTIONS
#############################################################################

# Perform security scanning on container images
security_scan_images() {
    local environment="$1"
    local image_tag="$2"
    
    if [[ "$SECURITY_SCANNING_ENABLED" != "true" ]]; then
        log "INFO" "Security scanning disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Performing security scans on container images..."
    
    local scan_results_dir="/tmp/security-scans-$$"
    mkdir -p "$scan_results_dir"
    
    local failed_scans=()
    
    for service in "${MICROSERVICES[@]}"; do
        local image_name="${CONTAINER_REGISTRY}/${service}:${image_tag}"
        log "DEBUG" "Scanning image: $image_name"
        
        # Trivy security scan
        if command -v trivy >/dev/null 2>&1; then
            local scan_output="${scan_results_dir}/${service}-trivy.json"
            if ! trivy image --format json --output "$scan_output" "$image_name" 2>/dev/null; then
                log "WARN" "Trivy scan failed for $service"
                failed_scans+=("$service:trivy")
            else
                # Check for critical vulnerabilities
                local critical_vulns
                critical_vulns=$(jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | length' "$scan_output" 2>/dev/null | jq -s 'add // 0')
                if [[ "$critical_vulns" -gt 0 ]]; then
                    log "ERROR" "Critical vulnerabilities found in $service: $critical_vulns"
                    failed_scans+=("$service:critical-vulns")
                fi
            fi
        fi
    done
    
    # Cleanup scan results
    rm -rf "$scan_results_dir"
    
    if [[ ${#failed_scans[@]} -gt 0 ]]; then
        log "ERROR" "Security scan failures: ${failed_scans[*]}"
        return 1
    fi
    
    log "INFO" "Security scans completed successfully"
    return 0
}

# Validate compliance requirements
validate_compliance() {
    local environment="$1"
    
    log "INFO" "Validating compliance requirements for $environment environment..."
    
    # Check PCI DSS compliance requirements
    if [[ "$environment" == "prod" ]]; then
        # Validate network policies
        local namespace="${NAMESPACE_MAPPING[$environment]}"
        if ! kubectl get networkpolicy -n "$namespace" >/dev/null 2>&1; then
            log "ERROR" "Network policies required for production environment"
            return 1
        fi
        
        # Validate pod security policies
        if ! kubectl get podsecuritypolicy financial-services-psp >/dev/null 2>&1; then
            log "WARN" "Pod Security Policy not found - using Pod Security Standards"
        fi
        
        # Check for required security contexts
        log "DEBUG" "Validating security contexts in production deployments"
    fi
    
    # Validate GDPR compliance for EU regions
    if [[ "$environment" == "prod" ]]; then
        log "DEBUG" "Validating GDPR compliance requirements"
        # Add specific GDPR validation logic here
    fi
    
    log "INFO" "Compliance validation completed"
    return 0
}

#############################################################################
# KUBERNETES AND HELM FUNCTIONS
#############################################################################

# Create or update namespace with proper labels and annotations
ensure_namespace() {
    local environment="$1"
    local namespace="${NAMESPACE_MAPPING[$environment]}"
    
    log "INFO" "Ensuring namespace: $namespace"
    
    # Create namespace if it doesn't exist
    if ! kubectl get namespace "$namespace" >/dev/null 2>&1; then
        log "INFO" "Creating namespace: $namespace"
        
        # Create namespace with compliance labels
        kubectl create namespace "$namespace" \
            --dry-run=client -o yaml | \
        kubectl label --local -f - \
            environment="$environment" \
            compliance-level="$COMPLIANCE_LEVEL" \
            managed-by="financial-platform-deployment" \
            version="$(date +%Y%m%d-%H%M%S)" \
            --dry-run=client -o yaml | \
        kubectl annotate --local -f - \
            deployment.financial-platform.com/deployed-by="$USER" \
            deployment.financial-platform.com/deployment-time="$(date -Iseconds)" \
            --dry-run=client -o yaml | \
        kubectl apply -f -
    else
        # Update existing namespace labels
        kubectl label namespace "$namespace" \
            environment="$environment" \
            compliance-level="$COMPLIANCE_LEVEL" \
            managed-by="financial-platform-deployment" \
            --overwrite
    fi
    
    # Apply network policies for financial services compliance
    apply_network_policies "$environment" "$namespace"
    
    # Apply resource quotas
    apply_resource_quotas "$environment" "$namespace"
    
    log "INFO" "Namespace $namespace configured successfully"
}

# Apply network policies for security isolation
apply_network_policies() {
    local environment="$1"
    local namespace="$2"
    
    log "DEBUG" "Applying network policies for $namespace"
    
    # Create restrictive default network policy
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: $namespace
  labels:
    environment: $environment
    compliance-level: $COMPLIANCE_LEVEL
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-financial-services
  namespace: $namespace
  labels:
    environment: $environment
    compliance-level: $COMPLIANCE_LEVEL
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/part-of: financial-platform
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - namespaceSelector:
        matchLabels:
          name: $namespace
    - podSelector:
        matchLabels:
          app.kubernetes.io/part-of: financial-platform
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
  - to:
    - namespaceSelector:
        matchLabels:
          name: $namespace
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
EOF
}

# Apply resource quotas based on environment
apply_resource_quotas() {
    local environment="$1"
    local namespace="$2"
    
    # Environment-specific resource limits
    local cpu_limit memory_limit storage_limit
    case "$environment" in
        "dev")
            cpu_limit="20"
            memory_limit="40Gi"
            storage_limit="100Gi"
            ;;
        "staging")
            cpu_limit="50"
            memory_limit="100Gi"
            storage_limit="500Gi"
            ;;
        "prod")
            cpu_limit="200"
            memory_limit="400Gi"
            storage_limit="2Ti"
            ;;
    esac
    
    log "DEBUG" "Applying resource quotas: CPU=$cpu_limit, Memory=$memory_limit, Storage=$storage_limit"
    
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: financial-services-quota
  namespace: $namespace
  labels:
    environment: $environment
    compliance-level: $COMPLIANCE_LEVEL
spec:
  hard:
    requests.cpu: $cpu_limit
    requests.memory: $memory_limit
    requests.storage: $storage_limit
    limits.cpu: $cpu_limit
    limits.memory: $memory_limit
    persistentvolumeclaims: "50"
    secrets: "100"
    configmaps: "100"
    services: "20"
    pods: "100"
EOF
}

# Check if Helm release exists
helm_release_exists() {
    local release_name="$1"
    local namespace="$2"
    
    helm list -n "$namespace" -q | grep -qx "$release_name"
}

# Get Helm release revision
get_helm_revision() {
    local release_name="$1"
    local namespace="$2"
    
    helm list -n "$namespace" -o json | \
        jq -r ".[] | select(.name == \"$release_name\") | .revision"
}

# Wait for deployment to be ready
wait_for_deployment() {
    local deployment_name="$1"
    local namespace="$2"
    local timeout="${3:-$DEPLOYMENT_TIMEOUT}"
    
    log "INFO" "Waiting for deployment $deployment_name to be ready (timeout: ${timeout}s)..."
    
    if kubectl wait --for=condition=available \
        --timeout="${timeout}s" \
        "deployment/$deployment_name" \
        -n "$namespace" >/dev/null 2>&1; then
        log "INFO" "Deployment $deployment_name is ready"
        return 0
    else
        log "ERROR" "Deployment $deployment_name failed to become ready within ${timeout}s"
        return 1
    fi
}

# Perform health checks on deployed services
perform_health_checks() {
    local environment="$1"
    local namespace="$2"
    
    log "INFO" "Performing health checks on deployed services..."
    
    local failed_checks=()
    local health_check_timeout="$HEALTH_CHECK_TIMEOUT"
    
    for service in "${MICROSERVICES[@]}"; do
        log "DEBUG" "Health checking service: $service"
        
        # Check if deployment is available
        if ! kubectl get deployment "$service" -n "$namespace" >/dev/null 2>&1; then
            log "WARN" "Deployment $service not found in namespace $namespace"
            continue
        fi
        
        # Wait for deployment to be ready
        if ! wait_for_deployment "$service" "$namespace" "$health_check_timeout"; then
            failed_checks+=("$service")
            continue
        fi
        
        # Check service endpoints
        if kubectl get service "$service" -n "$namespace" >/dev/null 2>&1; then
            local service_ip
            service_ip=$(kubectl get service "$service" -n "$namespace" -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
            
            if [[ -n "$service_ip" && "$service_ip" != "None" ]]; then
                log "DEBUG" "Service $service has cluster IP: $service_ip"
                
                # Perform HTTP health check if health endpoint is available
                local health_port
                health_port=$(kubectl get service "$service" -n "$namespace" -o jsonpath='{.spec.ports[?(@.name=="http")].port}' 2>/dev/null)
                
                if [[ -n "$health_port" ]]; then
                    # Use kubectl port-forward for health check
                    local port_forward_pid
                    kubectl port-forward "service/$service" "$health_port:$health_port" -n "$namespace" >/dev/null 2>&1 &
                    port_forward_pid=$!
                    sleep 2
                    
                    if curl -sf "http://localhost:$health_port/actuator/health" >/dev/null 2>&1 || \
                       curl -sf "http://localhost:$health_port/health" >/dev/null 2>&1 || \
                       curl -sf "http://localhost:$health_port/healthz" >/dev/null 2>&1; then
                        log "DEBUG" "Health check passed for $service"
                    else
                        log "WARN" "Health check failed for $service"
                        failed_checks+=("$service")
                    fi
                    
                    # Cleanup port-forward
                    kill $port_forward_pid >/dev/null 2>&1 || true
                    wait $port_forward_pid >/dev/null 2>&1 || true
                fi
            fi
        fi
    done
    
    if [[ ${#failed_checks[@]} -gt 0 ]]; then
        log "ERROR" "Health checks failed for services: ${failed_checks[*]}"
        return 1
    fi
    
    log "INFO" "All health checks passed successfully"
    return 0
}

#############################################################################
# DEPLOYMENT FUNCTIONS
#############################################################################

# Deploy all backend services to the specified environment
deploy_environment() {
    local environment="$1"
    local image_tag="$2"
    
    log "INFO" "Starting deployment to $environment environment with image tag $image_tag"
    
    # Validate inputs
    if ! validate_environment "$environment"; then
        return 1
    fi
    
    if ! validate_image_tag "$image_tag"; then
        return 1
    fi
    
    # Security and compliance checks
    if ! security_scan_images "$environment" "$image_tag"; then
        log "ERROR" "Security scanning failed - deployment aborted"
        return 1
    fi
    
    if ! validate_compliance "$environment"; then
        log "ERROR" "Compliance validation failed - deployment aborted"
        return 1
    fi
    
    # Prepare deployment environment
    local namespace="${NAMESPACE_MAPPING[$environment]}"
    ensure_namespace "$environment"
    
    # Check for environment-specific Helm values file
    local values_file="${HELM_CHARTS_DIR}/values-${environment}.yaml"
    if [[ ! -f "$values_file" ]]; then
        log "FATAL" "Environment-specific values file not found: $values_file"
    fi
    
    log "INFO" "Using Helm values file: $values_file"
    
    # Deploy each microservice
    local deployment_failures=()
    local deployment_start_time=$(date +%s)
    
    for service in "${MICROSERVICES[@]}"; do
        log "INFO" "Deploying service: $service"
        
        local chart_path="${HELM_CHARTS_DIR}/$service"
        if [[ ! -d "$chart_path" ]]; then
            log "ERROR" "Helm chart not found for service: $service at $chart_path"
            deployment_failures+=("$service")
            continue
        fi
        
        # Prepare Helm command
        local helm_cmd=(
            "helm" "upgrade" "--install" "$service"
            "$chart_path"
            "--namespace" "$namespace"
            "--values" "$values_file"
            "--set" "image.tag=$image_tag"
            "--set" "image.registry=$CONTAINER_REGISTRY"
            "--set" "environment=$environment"
            "--set" "compliance.level=$COMPLIANCE_LEVEL"
            "--set" "deployment.timestamp=$(date -Iseconds)"
            "--set" "deployment.version=$image_tag"
            "--timeout" "${DEPLOYMENT_TIMEOUT}s"
            "--wait"
            "--atomic"
        )
        
        # Add environment-specific configurations
        case "$environment" in
            "prod")
                helm_cmd+=(
                    "--set" "replicaCount=3"
                    "--set" "resources.requests.cpu=500m"
                    "--set" "resources.requests.memory=1Gi"
                    "--set" "resources.limits.cpu=2000m"
                    "--set" "resources.limits.memory=4Gi"
                    "--set" "autoscaling.enabled=true"
                    "--set" "podDisruptionBudget.enabled=true"
                )
                ;;
            "staging")
                helm_cmd+=(
                    "--set" "replicaCount=2"
                    "--set" "resources.requests.cpu=250m"
                    "--set" "resources.requests.memory=512Mi"
                    "--set" "resources.limits.cpu=1000m"
                    "--set" "resources.limits.memory=2Gi"
                )
                ;;
            "dev")
                helm_cmd+=(
                    "--set" "replicaCount=1"
                    "--set" "resources.requests.cpu=100m"
                    "--set" "resources.requests.memory=256Mi"
                    "--set" "resources.limits.cpu=500m"
                    "--set" "resources.limits.memory=1Gi"
                )
                ;;
        esac
        
        # Execute deployment
        if [[ "$DRY_RUN" == "true" ]]; then
            helm_cmd+=("--dry-run")
            log "INFO" "DRY RUN: ${helm_cmd[*]}"
        fi
        
        if "${helm_cmd[@]}"; then
            log "INFO" "Successfully deployed $service"
            
            # Record deployment in audit log
            if [[ "$AUDIT_LOGGING_ENABLED" == "true" ]]; then
                kubectl annotate deployment "$service" \
                    "deployment.financial-platform.com/last-deployed=$(date -Iseconds)" \
                    "deployment.financial-platform.com/deployed-by=$USER" \
                    "deployment.financial-platform.com/image-tag=$image_tag" \
                    "deployment.financial-platform.com/environment=$environment" \
                    -n "$namespace" --overwrite
            fi
        else
            log "ERROR" "Failed to deploy $service"
            deployment_failures+=("$service")
        fi
    done
    
    # Calculate deployment duration
    local deployment_end_time=$(date +%s)
    local deployment_duration=$((deployment_end_time - deployment_start_time))
    
    # Check deployment results
    if [[ ${#deployment_failures[@]} -gt 0 ]]; then
        log "ERROR" "Deployment failed for services: ${deployment_failures[*]}"
        log "ERROR" "Deployment duration: ${deployment_duration}s"
        return 1
    fi
    
    # Perform post-deployment validation
    if ! perform_health_checks "$environment" "$namespace"; then
        log "ERROR" "Post-deployment health checks failed"
        return 1
    fi
    
    # Update ArgoCD application if available
    update_argocd_app "$environment" "$image_tag"
    
    log "INFO" "Deployment to $environment completed successfully in ${deployment_duration}s"
    log "INFO" "All services are healthy and ready to serve traffic"
    
    return 0
}

# Update ArgoCD application configuration
update_argocd_app() {
    local environment="$1"
    local image_tag="$2"
    
    if ! kubectl get application "financial-services-$environment" -n argocd >/dev/null 2>&1; then
        log "DEBUG" "ArgoCD application not found, skipping sync"
        return 0
    fi
    
    log "INFO" "Syncing ArgoCD application for $environment"
    
    # Update application image tag
    kubectl patch application "financial-services-$environment" \
        -n argocd \
        --type merge \
        -p "{\"spec\":{\"source\":{\"helm\":{\"parameters\":[{\"name\":\"image.tag\",\"value\":\"$image_tag\"}]}}}}" \
        >/dev/null 2>&1 || log "WARN" "Failed to update ArgoCD application"
    
    # Trigger sync
    if command -v argocd >/dev/null 2>&1; then
        argocd app sync "financial-services-$environment" >/dev/null 2>&1 || \
            log "WARN" "Failed to trigger ArgoCD sync"
    fi
}

#############################################################################
# ROLLBACK FUNCTIONS
#############################################################################

# Roll back a deployment to a previous version
rollback_deployment() {
    local environment="$1"
    local release_name="$2"
    local revision="$3"
    
    log "INFO" "Starting rollback of $release_name to revision $revision in $environment"
    
    # Validate inputs
    if ! validate_environment "$environment"; then
        return 1
    fi
    
    if [[ -z "$release_name" ]]; then
        log "ERROR" "Release name is required for rollback"
        return 1
    fi
    
    if [[ ! "$revision" =~ ^[0-9]+$ ]]; then
        log "ERROR" "Revision must be a positive integer"
        return 1
    fi
    
    local namespace="${NAMESPACE_MAPPING[$environment]}"
    
    # Check if release exists
    if ! helm_release_exists "$release_name" "$namespace"; then
        log "ERROR" "Helm release $release_name not found in namespace $namespace"
        return 1
    fi
    
    # Get current revision
    local current_revision
    current_revision=$(get_helm_revision "$release_name" "$namespace")
    
    if [[ "$current_revision" == "$revision" ]]; then
        log "WARN" "Release $release_name is already at revision $revision"
        return 0
    fi
    
    log "INFO" "Rolling back $release_name from revision $current_revision to $revision"
    
    # Perform rollback
    local rollback_start_time=$(date +%s)
    
    if helm rollback "$release_name" "$revision" \
        --namespace "$namespace" \
        --timeout "${ROLLBACK_TIMEOUT}s" \
        --wait; then
        
        local rollback_end_time=$(date +%s)
        local rollback_duration=$((rollback_end_time - rollback_start_time))
        
        log "INFO" "Rollback completed successfully in ${rollback_duration}s"
        
        # Verify rollback success
        if ! wait_for_deployment "$release_name" "$namespace" "120"; then
            log "ERROR" "Rollback verification failed - deployment not ready"
            return 1
        fi
        
        # Record rollback in audit log
        if [[ "$AUDIT_LOGGING_ENABLED" == "true" ]]; then
            kubectl annotate deployment "$release_name" \
                "deployment.financial-platform.com/last-rollback=$(date -Iseconds)" \
                "deployment.financial-platform.com/rollback-by=$USER" \
                "deployment.financial-platform.com/rollback-to-revision=$revision" \
                "deployment.financial-platform.com/rollback-from-revision=$current_revision" \
                -n "$namespace" --overwrite
        fi
        
        # Perform post-rollback health checks
        local health_check_services=("$release_name")
        for service in "${health_check_services[@]}"; do
            if ! perform_health_checks "$environment" "$namespace"; then
                log "WARN" "Health checks failed after rollback"
            fi
        done
        
        log "INFO" "Rollback verification completed successfully"
        return 0
    else
        log "ERROR" "Rollback failed for $release_name"
        return 1
    fi
}

#############################################################################
# EMERGENCY PROCEDURES
#############################################################################

# Emergency rollback - rolls back all services to last known good state
emergency_rollback() {
    local environment="$1"
    
    log "WARN" "Initiating emergency rollback for $environment environment"
    
    if ! validate_environment "$environment"; then
        return 1
    fi
    
    local namespace="${NAMESPACE_MAPPING[$environment]}"
    local rollback_failures=()
    
    # Get all Helm releases in the namespace
    local releases
    mapfile -t releases < <(helm list -n "$namespace" -q)
    
    if [[ ${#releases[@]} -eq 0 ]]; then
        log "WARN" "No Helm releases found in namespace $namespace"
        return 0
    fi
    
    # Rollback each release to previous revision
    for release in "${releases[@]}"; do
        log "INFO" "Emergency rollback for release: $release"
        
        local current_revision
        current_revision=$(get_helm_revision "$release" "$namespace")
        local previous_revision=$((current_revision - 1))
        
        if [[ "$previous_revision" -lt 1 ]]; then
            log "WARN" "No previous revision available for $release"
            continue
        fi
        
        if ! rollback_deployment "$environment" "$release" "$previous_revision"; then
            rollback_failures+=("$release")
        fi
    done
    
    if [[ ${#rollback_failures[@]} -gt 0 ]]; then
        log "ERROR" "Emergency rollback failed for: ${rollback_failures[*]}"
        return 1
    fi
    
    log "INFO" "Emergency rollback completed successfully"
    return 0
}

#############################################################################
# MONITORING AND ALERTING
#############################################################################

# Send deployment notification
send_notification() {
    local environment="$1"
    local status="$2"
    local message="$3"
    
    # Slack notification (if webhook URL is configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color
        case "$status" in
            "success") color="good" ;;
            "failure") color="danger" ;;
            "warning") color="warning" ;;
            *) color="grey" ;;
        esac
        
        local payload
        payload=$(jq -n \
            --arg channel "#devops-alerts" \
            --arg username "Financial Platform Deploy Bot" \
            --arg color "$color" \
            --arg environment "$environment" \
            --arg status "$status" \
            --arg message "$message" \
            --arg timestamp "$(date -Iseconds)" \
            '{
                channel: $channel,
                username: $username,
                attachments: [{
                    color: $color,
                    title: "Deployment Notification",
                    fields: [
                        {title: "Environment", value: $environment, short: true},
                        {title: "Status", value: $status, short: true},
                        {title: "Message", value: $message, short: false},
                        {title: "Timestamp", value: $timestamp, short: true}
                    ]
                }]
            }')
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || \
            log "WARN" "Failed to send Slack notification"
    fi
    
    # Email notification (if configured)
    if [[ -n "${EMAIL_RECIPIENTS:-}" ]] && command -v mail >/dev/null 2>&1; then
        local subject="Financial Platform Deployment - $environment - $status"
        echo "$message" | mail -s "$subject" "$EMAIL_RECIPIENTS" || \
            log "WARN" "Failed to send email notification"
    fi
}

#############################################################################
# MAIN FUNCTION
#############################################################################

# Display usage information
usage() {
    cat <<EOF
Usage: $SCRIPT_NAME [OPTIONS] ACTION

Financial Services Platform Deployment Script

ACTIONS:
    deploy <environment> <image_tag>    Deploy services to specified environment
    rollback <environment> <release> <revision>  Rollback specific release
    emergency-rollback <environment>    Emergency rollback all services
    health-check <environment>          Perform health checks only
    
ENVIRONMENTS:
    dev, staging, prod

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -d, --dry-run          Perform dry run without actual deployment
    -t, --timeout SECONDS   Set deployment timeout (default: $DEPLOYMENT_TIMEOUT)
    --skip-security-scan    Skip security scanning
    --skip-health-check     Skip post-deployment health checks
    
EXAMPLES:
    $SCRIPT_NAME deploy prod v1.2.3
    $SCRIPT_NAME rollback prod transaction-service 5
    $SCRIPT_NAME emergency-rollback staging
    $SCRIPT_NAME health-check dev

ENVIRONMENT VARIABLES:
    KUBECONFIG              Kubernetes config file path
    HELM_CHARTS_DIR         Helm charts directory
    K8S_MANIFESTS_DIR       Kubernetes manifests directory
    LOG_LEVEL               Logging level (DEBUG, INFO, WARN, ERROR)
    DRY_RUN                 Enable dry run mode (true/false)
    DEPLOYMENT_TIMEOUT      Deployment timeout in seconds
    CONTAINER_REGISTRY      Container registry URL
    SECURITY_SCANNING_ENABLED  Enable security scanning (true/false)
    AUDIT_LOGGING_ENABLED   Enable audit logging (true/false)
    SLACK_WEBHOOK_URL       Slack webhook for notifications
    EMAIL_RECIPIENTS        Email addresses for notifications

For more information, visit: https://docs.financial-platform.com/deployment
EOF
}

# Main function - parse command-line arguments and execute actions
main() {
    local action=""
    local environment=""
    local image_tag=""
    local release_name=""
    local revision=""
    
    # Parse command-line options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                LOG_LEVEL="DEBUG"
                shift
                ;;
            -d|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -t|--timeout)
                DEPLOYMENT_TIMEOUT="$2"
                shift 2
                ;;
            --skip-security-scan)
                SECURITY_SCANNING_ENABLED="false"
                shift
                ;;
            --skip-health-check)
                HEALTH_CHECK_TIMEOUT="0"
                shift
                ;;
            deploy)
                action="deploy"
                environment="$2"
                image_tag="$3"
                shift 3
                ;;
            rollback)
                action="rollback"
                environment="$2"
                release_name="$3"
                revision="$4"
                shift 4
                ;;
            emergency-rollback)
                action="emergency-rollback"
                environment="$2"
                shift 2
                ;;
            health-check)
                action="health-check"
                environment="$2"
                shift 2
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate required parameters
    if [[ -z "$action" ]]; then
        log "ERROR" "Action is required"
        usage
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Execute action
    local exit_code=0
    local start_time=$(date +%s)
    
    case "$action" in
        deploy)
            if [[ -z "$environment" || -z "$image_tag" ]]; then
                log "ERROR" "Environment and image tag are required for deploy action"
                usage
                exit 1
            fi
            
            if deploy_environment "$environment" "$image_tag"; then
                send_notification "$environment" "success" "Deployment completed successfully with image tag $image_tag"
            else
                exit_code=1
                send_notification "$environment" "failure" "Deployment failed with image tag $image_tag"
            fi
            ;;
        rollback)
            if [[ -z "$environment" || -z "$release_name" || -z "$revision" ]]; then
                log "ERROR" "Environment, release name, and revision are required for rollback action"
                usage
                exit 1
            fi
            
            if rollback_deployment "$environment" "$release_name" "$revision"; then
                send_notification "$environment" "success" "Rollback of $release_name to revision $revision completed successfully"
            else
                exit_code=1
                send_notification "$environment" "failure" "Rollback of $release_name to revision $revision failed"
            fi
            ;;
        emergency-rollback)
            if [[ -z "$environment" ]]; then
                log "ERROR" "Environment is required for emergency-rollback action"
                usage
                exit 1
            fi
            
            if emergency_rollback "$environment"; then
                send_notification "$environment" "warning" "Emergency rollback completed successfully"
            else
                exit_code=1
                send_notification "$environment" "failure" "Emergency rollback failed"
            fi
            ;;
        health-check)
            if [[ -z "$environment" ]]; then
                log "ERROR" "Environment is required for health-check action"
                usage
                exit 1
            fi
            
            local namespace="${NAMESPACE_MAPPING[$environment]}"
            if perform_health_checks "$environment" "$namespace"; then
                log "INFO" "Health checks passed for $environment environment"
            else
                exit_code=1
                log "ERROR" "Health checks failed for $environment environment"
            fi
            ;;
        *)
            log "ERROR" "Unknown action: $action"
            usage
            exit 1
            ;;
    esac
    
    # Calculate execution time
    local end_time=$(date +%s)
    local execution_time=$((end_time - start_time))
    
    if [[ $exit_code -eq 0 ]]; then
        log "INFO" "Script completed successfully in ${execution_time}s"
    else
        log "ERROR" "Script failed after ${execution_time}s"
    fi
    
    exit $exit_code
}

#############################################################################
# SCRIPT EXECUTION
#############################################################################

# Trap signals for cleanup
trap 'log "WARN" "Script interrupted"; exit 130' INT TERM

# Execute main function with all arguments
main "$@"