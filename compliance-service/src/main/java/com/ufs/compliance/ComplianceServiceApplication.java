package com.ufs.compliance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main application class for the Compliance Service.
 * 
 * This class serves as the entry point for the Spring Boot application responsible for
 * automating regulatory compliance monitoring and reporting across multiple regulatory 
 * frameworks including PSD3, PSR, Basel reforms (CRR3), and FRTB implementation.
 * 
 * The Compliance Service is designed as a critical microservice within the Unified 
 * Financial Services Platform architecture, enabling:
 * - Real-time regulatory change monitoring with 24-hour update cycles
 * - Automated policy updates and compliance reporting
 * - Event-driven communication for regulatory compliance automation
 * - Comprehensive audit trail management for compliance activities
 * 
 * Key Features:
 * - F-003: Regulatory Compliance Automation - Core component for automating 
 *   compliance monitoring and reporting across multiple regulatory frameworks
 * - Microservices Architecture - Independent scalability and deployment
 * - Event-driven communication - Uses Kafka for regulatory event processing
 * - Real-time compliance monitoring with 99.9% accuracy in change detection
 * - Automated regulatory reporting with complete audit trails
 * 
 * Technology Stack:
 * - Java 21 LTS for enterprise-grade stability and performance
 * - Spring Boot 3.2+ for microservices foundation
 * - Spring Cloud 2023.0+ for service discovery and configuration management
 * - Apache Kafka 3.6+ for event streaming and real-time data processing
 * - PostgreSQL 16+ for transactional compliance data
 * - MongoDB 7.0+ for regulatory document storage and analytics
 * - Redis 7.2+ for session storage and caching
 * 
 * Performance Requirements:
 * - 24-hour regulatory update cycle
 * - 99.9% accuracy in regulatory change detection
 * - Sub-second response times for compliance queries
 * - 99.99% system uptime with comprehensive disaster recovery
 * 
 * Security & Compliance:
 * - SOC2, PCI-DSS, GDPR compliance
 * - End-to-end encryption for all regulatory data
 * - Role-based access control with audit trails
 * - Multi-factor authentication for compliance officers
 * 
 * Integration Points:
 * - External regulatory data feeds (Thomson Reuters API, central bank APIs)
 * - Core banking systems via SWIFT and ISO20022 protocols
 * - Internal microservices for risk assessment and customer data
 * - Event streaming with other platform services via Kafka
 * 
 * @author Unified Financial Services Platform Team
 * @version 1.0.0
 * @since 2025-01-01
 */
@SpringBootApplication(
    scanBasePackages = {
        "com.ufs.compliance",
        "com.ufs.common.security",
        "com.ufs.common.monitoring",
        "com.ufs.common.audit"
    }
)
@EnableDiscoveryClient
@EnableKafka
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
@EnableCaching
@EnableJpaRepositories(basePackages = {
    "com.ufs.compliance.repository.jpa"
})
@EnableMongoRepositories(basePackages = {
    "com.ufs.compliance.repository.mongo"
})
@EnableConfigurationProperties
@EnableMethodSecurity(
    prePostEnabled = true,
    securedEnabled = true,
    jsr250Enabled = true
)
@ComponentScan(basePackages = {
    "com.ufs.compliance",
    "com.ufs.common"
})
public class ComplianceServiceApplication {

    /**
     * Main method which serves as the entry point for the Compliance Service application.
     * 
     * This method bootstraps the Spring Boot application and initializes all required
     * components for regulatory compliance automation including:
     * - Service discovery registration with Spring Cloud
     * - Kafka event streaming for regulatory change monitoring
     * - Database connections for compliance data storage
     * - Security configuration for financial data protection
     * - Scheduling services for automated compliance checks
     * - Caching layer for performance optimization
     * 
     * The application startup process includes:
     * 1. Spring Boot auto-configuration initialization
     * 2. Service registration with discovery service (Eureka/Consul)
     * 3. Kafka consumer/producer initialization for event processing
     * 4. Database connection pool setup (PostgreSQL, MongoDB, Redis)
     * 5. Security context initialization with OAuth2 and JWT support
     * 6. Scheduled task initialization for regulatory monitoring
     * 7. Application health checks and monitoring endpoints activation
     * 8. Audit logging system initialization for compliance tracking
     * 
     * Environment Variables Required:
     * - SPRING_PROFILES_ACTIVE: Environment profile (dev, staging, prod)
     * - KAFKA_BOOTSTRAP_SERVERS: Kafka cluster connection string
     * - DATABASE_URL: PostgreSQL connection URL for transactional data
     * - MONGODB_URI: MongoDB connection URI for document storage
     * - REDIS_URL: Redis connection URL for caching and sessions
     * - EUREKA_CLIENT_SERVICE_URL: Service discovery server URL
     * - REGULATORY_API_BASE_URL: Base URL for regulatory data feeds
     * - OAUTH2_ISSUER_URI: OAuth2 authorization server URI
     * 
     * JVM Arguments Recommended:
     * - -Xms512m -Xmx2048m: Memory allocation for compliance processing
     * - -XX:+UseG1GC: Garbage collector for low-latency requirements
     * - -Dspring.profiles.active=prod: Production environment profile
     * - -Dfile.encoding=UTF-8: Character encoding for international compliance
     * 
     * Monitoring and Observability:
     * - Application metrics exported to Prometheus
     * - Distributed tracing with Jaeger for request tracking
     * - Centralized logging with structured JSON format
     * - Health check endpoints for Kubernetes liveness/readiness probes
     * - Custom compliance metrics for regulatory reporting
     * 
     * @param args Command line arguments passed to the application.
     *             Supported arguments:
     *             --spring.profiles.active=<profile>: Set active Spring profile
     *             --server.port=<port>: Override default server port (8080)
     *             --logging.level.com.ufs.compliance=<level>: Set logging level
     *             --management.endpoints.web.exposure.include=*: Enable actuator endpoints
     * 
     * @throws RuntimeException if critical dependencies are unavailable:
     *                         - Database connections cannot be established
     *                         - Kafka brokers are unreachable
     *                         - Service discovery registration fails
     *                         - Required environment variables are missing
     * 
     * @see org.springframework.boot.SpringApplication#run(Class, String...)
     * @see org.springframework.cloud.client.discovery.EnableDiscoveryClient
     * @see org.springframework.kafka.annotation.EnableKafka
     */
    public static void main(String[] args) {
        // Configure system properties for optimal performance in financial services
        System.setProperty("spring.jpa.open-in-view", "false");
        System.setProperty("spring.kafka.consumer.enable-auto-commit", "false");
        System.setProperty("spring.cache.type", "redis");
        System.setProperty("logging.pattern.console", 
            "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n");
        
        // Set default timezone to UTC for consistent regulatory timestamp handling
        System.setProperty("user.timezone", "UTC");
        
        // Configure Spring Boot application properties
        System.setProperty("spring.application.name", "compliance-service");
        System.setProperty("server.servlet.context-path", "/api/v1/compliance");
        
        // Enable graceful shutdown for proper resource cleanup
        System.setProperty("server.shutdown", "graceful");
        System.setProperty("spring.lifecycle.timeout-per-shutdown-phase", "30s");
        
        // Configure actuator endpoints for monitoring
        System.setProperty("management.endpoints.web.base-path", "/actuator");
        System.setProperty("management.endpoint.health.show-details", "when-authorized");
        System.setProperty("management.metrics.export.prometheus.enabled", "true");
        
        // Launch the Spring Boot application
        SpringApplication.run(ComplianceServiceApplication.class, args);
    }
}