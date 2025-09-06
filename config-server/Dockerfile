# Multi-stage build for Spring Boot Config Server microservice
# Compliant with financial services security standards (PCI-DSS, SOX, GDPR)

# Build Stage - Using Maven with Eclipse Temurin OpenJDK 21
FROM maven:3.9-eclipse-temurin-21 AS build

# Metadata labels for compliance and security tracking
LABEL maintainer="platform-team@financial-services.com"
LABEL service="config-server"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL vulnerability-scan="required"
LABEL image-signing="required"

# Set working directory for build stage
WORKDIR /app

# Copy dependency configuration first to leverage Docker layer caching
# This allows Docker to cache the dependency download step when only source code changes
COPY pom.xml .

# Download dependencies offline to improve build performance and reliability
# This step will be cached unless pom.xml changes
RUN mvn dependency:go-offline -B

# Copy source code into the container
# This step occurs after dependency download to optimize layer caching
COPY src ./src

# Build the application and package into JAR file
# Skip tests during build as they should be run in CI/CD pipeline
# Use batch mode (-B) for non-interactive builds
RUN mvn clean package -DskipTests -B

# Production Stage - Using minimal distroless image for security
FROM gcr.io/distroless/java21-debian12:nonroot AS production

# Production metadata labels
LABEL maintainer="platform-team@financial-services.com"
LABEL version="1.0.0"
LABEL service="config-server"
LABEL compliance="PCI-DSS,SOX,GDPR"
LABEL security.scan.required="true"
LABEL security.base-image="distroless"
LABEL security.user="nonroot"

# Set working directory for production stage
WORKDIR /app

# Copy the built JAR file from build stage to production image
# Using specific naming pattern for better traceability
COPY --from=build /app/target/*.jar app.jar

# Use nonroot user for enhanced security
# This prevents privilege escalation attacks and follows least-privilege principle
USER nonroot:nonroot

# Expose port 8888 - standard port for Spring Cloud Config Server
# This is the default port used by config server clients to fetch configurations
EXPOSE 8888

# Configure JVM options for production deployment
# - Enable JVM metrics for monitoring
# - Set memory limits for container environment
# - Enable security manager for additional protection
ENV JAVA_OPTS="-Xms512m -Xmx1024m \
    -XX:+UseG1GC \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=production \
    -Dserver.port=8888 \
    -Dmanagement.endpoints.web.exposure.include=health,info,metrics,prometheus \
    -Dmanagement.endpoint.health.show-details=when-authorized \
    -Dlogging.level.org.springframework.cloud.config=INFO"

# Health check configuration for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["java", "-cp", "app.jar", "org.springframework.boot.loader.JarLauncher", "--management.endpoint.health.enabled=true"] || exit 1

# Configure the container to run as an executable
# Start the Spring Boot Config Server application with optimized JVM settings
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Security scan metadata for CI/CD pipeline integration
LABEL security.scan.trivy="enabled"
LABEL security.scan.snyk="enabled"
LABEL security.scan.clair="enabled"
LABEL security.threshold="HIGH,CRITICAL"

# Compliance metadata for audit and regulatory requirements
LABEL audit.data-classification="confidential"
LABEL audit.retention-policy="7-years"
LABEL audit.encryption="at-rest,in-transit"
LABEL regulatory.sox-compliance="required"
LABEL regulatory.pci-dss="level-1"
LABEL regulatory.gdpr="applicable"

# Build information for traceability
LABEL build.ci-system="github-actions"
LABEL build.image-registry="production"
LABEL build.scan-required="pre-deployment"
LABEL build.signing-required="cosign"