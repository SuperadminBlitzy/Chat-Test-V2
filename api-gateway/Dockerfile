# Multi-stage build for API Gateway microservice
# Stage 1: Builder stage for compiling the Java application
FROM openjdk:21-jdk-slim AS builder

# Set working directory for the build process
WORKDIR /app

# Copy Maven configuration file first for better layer caching
# This allows Docker to cache dependency downloads when only source code changes
COPY pom.xml .

# Copy source code directory
COPY src ./src

# Build the application JAR file
# Skip tests during build for faster build times (tests should run in CI/CD pipeline)
# Use Maven clean package to ensure clean build and create executable JAR
RUN mvn clean package -DskipTests

# Stage 2: Production stage with minimal footprint and enhanced security
FROM gcr.io/distroless/java21-debian12:nonroot

# Copy the built JAR file from builder stage to production image
# Assumes the JAR file is generated in target directory with standard Maven naming
COPY --from=builder /app/target/*.jar /app.jar

# Expose the application port for the API Gateway service
# Port 8080 is the standard port for Spring Boot applications
EXPOSE 8080

# Use non-root user for enhanced security compliance
# The distroless image already includes a nonroot user
USER nonroot:nonroot

# Set labels for container metadata and compliance tracking
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL compliance="PCI-DSS,SOX,GDPR"

# Define the entrypoint to run the Spring Boot application
# Using exec form for better signal handling and process management
ENTRYPOINT ["java", "-jar", "/app.jar"]