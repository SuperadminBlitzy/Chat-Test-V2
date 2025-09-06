# Multi-stage build for Financial Wellness Service
# Stage 1: Builder stage for compiling the application
FROM openjdk:21-jdk-slim AS builder

# Set metadata for the builder stage
LABEL stage=builder
LABEL maintainer="platform-team@financial-services.com"
LABEL description="Builder stage for Financial Wellness Service application"

# Set working directory
WORKDIR /app

# Install required build tools and update package list for security
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        wget \
        gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy Maven configuration file first for better Docker layer caching
COPY pom.xml .

# Download dependencies to leverage Docker layer caching
# This step is separated to avoid re-downloading dependencies when source code changes
RUN ./mvnw dependency:go-offline -B 2>/dev/null || true

# Copy source code
COPY src ./src

# Build the application
# -DskipTests: Skip tests in build stage as they should be run in CI/CD pipeline
# -Dmaven.javadoc.skip=true: Skip javadoc generation for faster build
# -B: Batch mode for non-interactive execution
# --no-transfer-progress: Suppress download progress to reduce log noise
RUN ./mvnw clean package -DskipTests -Dmaven.javadoc.skip=true -B --no-transfer-progress

# Verify the JAR file was created successfully
RUN ls -la /app/target/ && \
    test -f /app/target/financial-wellness-service-*.jar

# Stage 2: Production image with minimal footprint and enhanced security
FROM gcr.io/distroless/java21-debian12:nonroot AS production

# Set comprehensive metadata labels for compliance and operational tracking
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL service="financial-wellness-service"
LABEL environment="production"
LABEL security.scan.enabled="true"
LABEL security.base-image="distroless"
LABEL build.date=""
LABEL vcs.ref=""
LABEL description="Financial Wellness Service - Provides personalized financial health assessments and recommendations"

# Copy the application JAR from builder stage
# Using a fixed name for the JAR in production image
COPY --from=builder /app/target/financial-wellness-service-*.jar /app.jar

# Set optimal JVM parameters for containerized environment
# -XX:+UseContainerSupport: Enable container awareness for memory limits
# -XX:MaxRAMPercentage=75.0: Use 75% of available container memory
# -XX:+UseG1GC: Use G1 garbage collector for better performance
# -XX:+UseStringDeduplication: Reduce memory usage through string deduplication
# -Djava.security.egd=file:/dev/./urandom: Use better entropy source for security
# -Dspring.profiles.active=production: Set production profile
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:+UseCompressedOops \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=production \
    -Dmanagement.endpoints.web.exposure.include=health,info,metrics,prometheus \
    -Dmanagement.endpoint.health.show-details=when-authorized \
    -Dlogging.level.com.financialservices=INFO \
    -Dserver.shutdown=graceful"

# Expose the application port
# Port 8080 is the standard port for Spring Boot applications
EXPOSE 8080

# Use nonroot user for enhanced security (already set in base image but explicit for clarity)
USER nonroot:nonroot

# Health check to ensure application is running properly
# This enables container orchestration platforms to monitor application health
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set the entry point to run the application
# Using exec form for better signal handling in containers
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app.jar"]

# Alternative entrypoint for debugging (commented out for production)
# ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar /app.jar"]

# Add build arguments for CI/CD pipeline integration
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0

# Update labels with build-time information
LABEL build.date="${BUILD_DATE}"
LABEL vcs.ref="${VCS_REF}"
LABEL version="${VERSION}"

# Add security scanning metadata
LABEL security.scan.policy="financial-services-security-policy"
LABEL security.vulnerability.threshold="HIGH"
LABEL security.compliance.frameworks="PCI-DSS,SOX,GDPR,ISO27001"

# Resource constraints documentation (for K8s deployment reference)
LABEL resources.cpu.request="500m"
LABEL resources.cpu.limit="2000m"
LABEL resources.memory.request="512Mi"
LABEL resources.memory.limit="2Gi"

# Application-specific metadata
LABEL app.name="financial-wellness-service"
LABEL app.component="backend-service"
LABEL app.tier="application"
LABEL app.framework="spring-boot"
LABEL app.language="java"
LABEL app.java.version="21"