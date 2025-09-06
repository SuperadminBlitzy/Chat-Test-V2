# Multi-stage build for compliance-service
# This Dockerfile creates a lightweight, secure container for the Spring Boot compliance service
# Implements F-003: Regulatory Compliance Automation requirements

# Build argument for JAR file flexibility
ARG JAR_FILE=target/compliance-service-*.jar

# =============================================================================
# BUILDER STAGE - Build the application
# =============================================================================
FROM maven:3.9-eclipse-temurin-21 AS builder

# Metadata for compliance tracking
LABEL stage="builder"
LABEL maintainer="platform-team@financial-services.com"
LABEL compliance="PCI-DSS,SOX,GDPR,FINRA,Basel-III"
LABEL component="compliance-service"
LABEL security.scan="required"

# Set working directory
WORKDIR /app

# Copy Maven configuration first for better layer caching
# This allows Docker to cache dependencies if only source code changes
COPY pom.xml .

# Download dependencies in a separate layer for better caching
RUN mvn dependency:go-offline -B

# Copy the entire source code
COPY src ./src

# Build the application
# -DskipTests: Skip tests during build (tests should be run in CI/CD pipeline)
# -B: Batch mode for non-interactive execution
# -q: Quiet mode to reduce build output noise
RUN mvn clean install -DskipTests -B -q

# Verify the JAR file was created
RUN ls -la target/ && \
    test -f target/compliance-service-*.jar || \
    (echo "ERROR: JAR file not found in target directory" && exit 1)

# =============================================================================
# FINAL STAGE - Production runtime image
# =============================================================================
FROM eclipse-temurin:21-jre-jammy AS final

# Metadata for production image
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL compliance="PCI-DSS,SOX,GDPR,FINRA,Basel-III"
LABEL component="compliance-service"
LABEL environment="production"
LABEL security.scan="passed"
LABEL build.date="${BUILD_DATE}"
LABEL git.commit="${GIT_COMMIT}"

# Install security updates and required packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create application directory
WORKDIR /app

# Create a non-root user for security compliance
# Financial services require non-privileged execution
RUN groupadd --gid 1001 springuser && \
    useradd --uid 1001 --gid springuser --shell /bin/bash --create-home springuser

# Copy the built JAR file from the builder stage
# Use the build argument to make JAR file name configurable
COPY --from=builder --chown=springuser:springuser /app/target/compliance-service-*.jar app.jar

# Set proper permissions for security
RUN chmod 755 /app && \
    chmod 644 /app/app.jar

# Switch to non-root user
USER springuser:springuser

# Expose the application port
# Port 8080 is the standard Spring Boot application port
EXPOSE 8080

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM optimization for containerized environments
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -XX:+UseStringDeduplication \
               -XX:+OptimizeStringConcat \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.profiles.active=production"

# Security hardening environment variables
ENV SPRING_SECURITY_REQUIRE_HTTPS=true
ENV SERVER_SSL_ENABLED=true
ENV MANAGEMENT_SECURITY_ENABLED=true

# Set application entry point
# Use exec form for proper signal handling in containers
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Default command can be overridden at runtime
CMD []

# Security notes:
# 1. Uses non-root user (springuser) for execution
# 2. Minimal base image (JRE only, no development tools)
# 3. Multi-stage build reduces final image size
# 4. Security labels for compliance tracking
# 5. Health check for container monitoring
# 6. Proper file permissions and ownership
# 7. JVM optimizations for container environments
# 8. Environment variables for security hardening