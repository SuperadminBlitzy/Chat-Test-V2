# Multi-stage build for Risk Assessment Service
# Builder stage - Maven with Java 21 for compilation
FROM maven:3.9-eclipse-temurin-21 AS builder

# Set working directory for the build process
WORKDIR /app

# Copy Maven configuration file first to leverage Docker layer caching
# This allows dependency downloads to be cached when source code changes
COPY pom.xml .

# Download all project dependencies to be cached in a separate layer
# This step will be cached unless pom.xml changes, significantly speeding up builds
RUN mvn dependency:go-offline

# Copy source code into the container
COPY src ./src

# Build the application and package it into a JAR file
# Skip tests during build as they should run in the CI/CD pipeline
RUN mvn package -DskipTests

# Production stage - Minimal JRE image for runtime
FROM openjdk:21-jre-slim AS final

# Add metadata labels for compliance and traceability
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL service="risk-assessment-service"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL description="Risk Assessment Service for financial risk evaluation and scoring"

# Create a non-root user for security best practices
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory for the application
WORKDIR /app

# Copy the built JAR file from the builder stage to the final image
# This ensures only the necessary application artifact is included
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user for security compliance
USER appuser

# Expose the port the application runs on
# The actual port configuration will be handled in application.yml
EXPOSE 8080

# Configure JVM options for production deployment
# - Enable JVM memory optimization for containers
# - Set up proper garbage collection for financial services workloads
# - Configure security properties for financial compliance
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -XX:G1HeapRegionSize=16m \
               -XX:+UseStringDeduplication \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.profiles.active=production"

# Health check to ensure the service is running correctly
# This enables Kubernetes to monitor service health and restart if needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set the command to run when the container starts
# Use exec form to ensure proper signal handling in containers
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]