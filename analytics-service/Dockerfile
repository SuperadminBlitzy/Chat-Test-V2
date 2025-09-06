# Multi-stage build for Analytics Service
# Stage 1: Build stage using Maven with OpenJDK 21
FROM maven:3.9-eclipse-temurin-21 AS builder

# Set working directory for build stage
WORKDIR /app

# Copy Maven configuration first for better layer caching
COPY pom.xml .

# Download dependencies (separate layer for caching optimization)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application with production optimizations
# Skip tests in build stage as they should run in CI/CD pipeline
# Enable parallel builds and optimize memory usage
RUN mvn clean package -DskipTests -B -T 1C \
    && ls -la target/ \
    && mv target/*.jar target/analytics-service.jar

# Stage 2: Production stage using distroless image for security
# Following financial services security best practices with minimal attack surface
FROM gcr.io/distroless/java21-debian12:nonroot AS production

# Security and compliance labels as per financial services requirements
LABEL maintainer="platform-team@financial-services.com" \
      version="1.0.0" \
      compliance="PCI-DSS,SOX,GDPR,SOC2" \
      service="analytics-service" \
      component="backend" \
      security.scan="enabled" \
      security.distroless="true" \
      java.version="21"

# Set working directory in production image
WORKDIR /app

# Copy the built JAR from builder stage with specific naming for clarity
COPY --from=builder /app/target/analytics-service.jar /app/analytics-service.jar

# Create non-root user context (distroless already uses nonroot)
USER nonroot:nonroot

# Expose application port for Spring Boot
EXPOSE 8080

# Health check endpoint for Kubernetes liveness/readiness probes
# Note: Distroless doesn't include curl, so this will need to be handled by K8s HTTP probes
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#   CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set JVM optimization flags for containerized environment
# -XX:+UseContainerSupport: Enable container-aware resource detection
# -XX:MaxRAMPercentage: Limit heap to percentage of container memory
# -XX:+UseG1GC: Use G1 garbage collector for better latency
# -XX:+UseStringDeduplication: Optimize memory usage for strings
# -Djava.security.egd: Use faster entropy source for SSL/TLS
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=production"

# Application entry point with JVM optimizations
# Using exec form for proper signal handling in containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=70.0", "-XX:+UseG1GC", "-XX:+UseStringDeduplication", "-XX:+ExitOnOutOfMemoryError", "-Djava.security.egd=file:/dev/./urandom", "-Dspring.profiles.active=production", "-jar", "/app/analytics-service.jar"]

# Alternative stage: Development/debugging version with JRE slim (if needed)
FROM openjdk:21-jre-slim AS development

# Install debugging and monitoring tools for development
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    netcat-traditional \
    procps \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create application user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/analytics-service.jar /app/analytics-service.jar

# Change ownership to application user
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Health check for development environment
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Development entry point with JVM debugging options
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=70.0", "-XX:+UseG1GC", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", "-jar", "/app/analytics-service.jar"]