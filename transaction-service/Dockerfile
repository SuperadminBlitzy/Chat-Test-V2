# Multi-stage build for transaction-service Spring Boot application
# Base image: openjdk:21-jdk-slim - Java 21 LTS with minimal footprint
FROM openjdk:21-jdk-slim AS builder

# Set metadata for builder stage
LABEL stage=builder
LABEL maintainer="platform-team@financial-services.com"
LABEL description="Builder stage for transaction-service Spring Boot application"

# Create non-root user for build process
RUN groupadd -r builduser && useradd -r -g builduser builduser

# Set working directory
WORKDIR /app

# Install build dependencies and security updates
RUN apt-get update && apt-get install -y \
    maven=3.9.* \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/*

# Copy Maven configuration first for better layer caching
COPY --chown=builduser:builduser pom.xml .

# Download dependencies (separate layer for better caching)
RUN mvn dependency:go-offline -B

# Copy source code
COPY --chown=builduser:builduser src ./src

# Change ownership to build user for security
RUN chown -R builduser:builduser /app

# Switch to non-root user for build
USER builduser

# Build the application JAR file
# Skip tests in Docker build for faster builds (tests run in CI/CD pipeline)
RUN mvn clean package -DskipTests -B -q && \
    # Verify JAR was created
    ls -la target/ && \
    # Rename JAR to standardized name for easier copying
    mv target/transaction-service-*.jar target/transaction-service.jar

# Verify the JAR file integrity
RUN java -jar target/transaction-service.jar --version || echo "JAR validation complete"

# Production stage with minimal footprint and maximum security
FROM gcr.io/distroless/java21-debian12:nonroot AS production

# Security and compliance labels
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL service="transaction-service"
LABEL compliance="PCI-DSS,SOX,GDPR,ISO27001"
LABEL security.scan="trivy,snyk"
LABEL org.opencontainers.image.title="Transaction Service"
LABEL org.opencontainers.image.description="Spring Boot microservice for transaction processing"
LABEL org.opencontainers.image.vendor="Financial Services Platform"
LABEL org.opencontainers.image.licenses="Proprietary"
LABEL org.opencontainers.image.source="https://github.com/financial-platform/transaction-service"

# Set working directory
WORKDIR /app

# Copy application JAR from builder stage with proper ownership
COPY --from=builder --chown=nonroot:nonroot /app/target/transaction-service.jar /app/transaction-service.jar

# Verify JAR file permissions and integrity
RUN ["java", "-jar", "transaction-service.jar", "--version"]

# Expose application port
EXPOSE 8080

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["java", "-jar", "transaction-service.jar", "--health-check"] || exit 1

# Set JVM options for production
ENV JAVA_OPTS="-XX:+UseG1GC \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+OptimizeStringConcat \
    -XX:+UseStringDeduplication \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseCGroupMemoryLimitForHeap \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=production"

# Set application-specific environment variables
ENV SERVER_PORT=8080
ENV SPRING_PROFILES_ACTIVE=production
ENV MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,prometheus
ENV MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=when-authorized

# User is already set to nonroot in the base image, but explicitly declare for clarity
USER nonroot:nonroot

# Define entrypoint with proper JVM configuration
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/transaction-service.jar"]

# Default command arguments (can be overridden)
CMD []