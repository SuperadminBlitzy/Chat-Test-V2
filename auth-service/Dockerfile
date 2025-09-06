# Multi-stage build for Java microservices
# Stage 1: Build stage using OpenJDK 21 JDK Slim
FROM openjdk:21-jdk-slim AS builder

# Set working directory for build operations
WORKDIR /app

# Copy Maven configuration for dependency resolution
COPY pom.xml .

# Copy source code for compilation
COPY src ./src

# Build the application using Maven, skipping tests for faster build
# Production builds should run tests in CI/CD pipeline
RUN mvn clean package -DskipTests

# Stage 2: Production runtime using minimal distroless image
FROM gcr.io/distroless/java21-debian12:nonroot

# Security and compliance labels for financial services
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL description="Authentication microservice for Unified Financial Services Platform"
LABEL service="auth-service"
LABEL environment="production"

# Copy the built JAR from builder stage to production image
# Using wildcard pattern to handle version-specific JAR naming
COPY --from=builder /app/target/auth-service-*.jar /app.jar

# Expose port 8080 for HTTP traffic
EXPOSE 8080

# Use nonroot user for enhanced security
USER nonroot:nonroot

# Set JVM options for production deployment
# -XX:+UseContainerSupport: Enables container-aware JVM settings
# -XX:MaxRAMPercentage=75.0: Limits heap to 75% of container memory
# -Djava.security.egd=file:/dev/./urandom: Improves startup time
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Define entry point for container execution
ENTRYPOINT ["java", "-jar", "/app.jar"]