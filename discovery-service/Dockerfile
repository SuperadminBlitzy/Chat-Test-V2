# Financial Services Discovery Service Dockerfile
# Multi-stage build for optimal security and minimal footprint
# Compliance: PCI-DSS, SOX, GDPR

# =====================================
# Build Stage - Maven Dependencies and Compilation
# =====================================
FROM openjdk:21-jdk-slim AS builder

# Security metadata and compliance labels
LABEL stage="builder"
LABEL maintainer="platform-team@financial-services.com"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL description="Discovery Service for microservices architecture - Build stage"

# Set working directory for build operations
WORKDIR /app

# Install Maven wrapper dependencies and security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Maven configuration files first to leverage Docker layer caching
# This allows dependencies to be cached independently of source code changes
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies separately to leverage Docker caching
# Dependencies are downloaded even if source code changes
RUN ./mvnw dependency:go-offline -B

# Copy source code after dependencies are cached
COPY src ./src

# Build the application with Maven
# Skip tests as they should be run in CI/CD pipeline
# Enable batch mode for CI/CD compatibility
# Use Spring Boot Maven plugin to create executable JAR
RUN ./mvnw clean package -DskipTests -B --no-transfer-progress \
    && ls -la target/ \
    && mv target/discovery-service-*.jar target/discovery-service.jar

# =====================================
# Production Stage - Minimal Runtime Image
# =====================================
FROM gcr.io/distroless/java21-debian12:nonroot

# Production metadata and compliance labels
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL description="Discovery Service for microservices service registration and discovery"
LABEL org.opencontainers.image.title="Financial Services Discovery Service"
LABEL org.opencontainers.image.description="Spring Cloud Eureka-based service discovery server"
LABEL org.opencontainers.image.vendor="Financial Services Platform"
LABEL org.opencontainers.image.licenses="Proprietary"
LABEL org.opencontainers.image.source="https://github.com/financial-services/discovery-service"

# Security annotations for vulnerability scanning
LABEL security.scan.enabled="true"
LABEL security.compliance.level="financial-services"
LABEL security.vulnerability.threshold="HIGH"

# Copy the built JAR from builder stage to production image
# Use distroless base image for minimal attack surface
COPY --from=builder /app/target/discovery-service.jar /app/discovery-service.jar

# Expose Eureka server default port for service discovery
# Port 8761 is the standard port for Spring Cloud Eureka server
EXPOSE 8761

# Health check configuration for container orchestration
# Eureka provides actuator endpoints for health monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["java", "-cp", "/app/discovery-service.jar", \
         "org.springframework.boot.loader.JarLauncher", \
         "--management.endpoint.health.enabled=true"]

# Use non-root user for security compliance (already set in distroless base)
# The distroless image runs as user 'nonroot' by default
USER nonroot:nonroot

# Set Java runtime optimization parameters for containerized environment
# Memory settings optimized for discovery service workload
# GC settings for low-latency service discovery operations
# Security manager disabled as Spring Boot handles security internally
# Enable JVM metrics for monitoring integration
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:G1HeapRegionSize=16m", \
    "-XX:+UseStringDeduplication", \
    "-XX:+OptimizeStringConcat", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=production", \
    "-Dmanagement.endpoints.web.exposure.include=health,info,metrics,prometheus", \
    "-Dmanagement.endpoint.health.show-details=when-authorized", \
    "-Dlogging.level.root=INFO", \
    "-Dlogging.level.org.springframework.cloud=DEBUG", \
    "-Dspring.cloud.config.fail-fast=true", \
    "-Deureka.server.enable-self-preservation=false", \
    "-Deureka.server.eviction-interval-timer-in-ms=15000", \
    "-jar", "/app/discovery-service.jar"]

# Container runtime configuration
# Signal handling for graceful shutdown in Kubernetes
STOPSIGNAL SIGTERM

# Working directory for application logs and temporary files
WORKDIR /app

# Environment variables for production configuration
ENV JAVA_TOOL_OPTIONS="-XX:+ExitOnOutOfMemoryError -XX:+CrashOnOutOfMemoryError"
ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=8761
ENV EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
ENV EUREKA_CLIENT_FETCH_REGISTRY=false
ENV EUREKA_SERVER_ENABLE_SELF_PRESERVATION=false
ENV MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,prometheus
ENV MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=when_authorized
ENV MANAGEMENT_SECURITY_ENABLED=true