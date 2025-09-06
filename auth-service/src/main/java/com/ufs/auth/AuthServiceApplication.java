package com.ufs.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main application class for the Unified Financial Services Authentication Service.
 * 
 * This Spring Boot application serves as the central authentication and authorization 
 * microservice for the entire financial services platform, providing:
 * 
 * <ul>
 * <li>OAuth2 authentication and authorization</li>
 * <li>Role-based access control (RBAC) for financial institutions</li>
 * <li>Multi-factor authentication (MFA) capabilities</li>
 * <li>JWT token management and validation</li>
 * <li>Audit logging for compliance requirements</li>
 * <li>Service discovery registration for microservices architecture</li>
 * </ul>
 * 
 * The service is designed to support:
 * - 99.99% availability as per enterprise SLA requirements
 * - Sub-second response times for authentication requests
 * - 10,000+ transactions per second capacity
 * - SOC2, PCI-DSS, and GDPR compliance standards
 * - Integration with external identity providers and biometric services
 * 
 * This application integrates with the broader financial services ecosystem including:
 * - Core banking systems (FIS, Mambu, Temenos)
 * - Payment networks (VISA, Mastercard, ACH)
 * - Regulatory compliance systems for BFSI sector
 * - AI-powered risk assessment engines
 * - Digital customer onboarding services
 * 
 * Key architectural features:
 * - Microservices architecture with event-driven communication
 * - Service discovery registration for dynamic service location
 * - Database auditing for regulatory compliance
 * - Asynchronous processing for performance optimization
 * - Caching for improved response times
 * - Transaction management for data consistency
 * 
 * Security implementations:
 * - End-to-end encryption for all data flows
 * - Role-based access control with granular permissions
 * - Comprehensive audit trails for all authentication events
 * - Integration with external KYC/AML verification services
 * - Support for biometric authentication and document verification
 * 
 * @author Unified Financial Services Platform Team
 * @version 1.0.0
 * @since Java 21 LTS
 * 
 * @see org.springframework.boot.autoconfigure.SpringBootApplication
 * @see org.springframework.cloud.client.discovery.EnableDiscoveryClient
 */
@SpringBootApplication(
    scanBasePackages = {
        "com.ufs.auth",           // Core authentication components
        "com.ufs.common.security", // Shared security configurations
        "com.ufs.common.audit",    // Audit logging components
        "com.ufs.common.config"    // Common configuration classes
    }
)
@EnableDiscoveryClient
@EntityScan(basePackages = {
    "com.ufs.auth.entity",        // Authentication entities
    "com.ufs.common.entity"       // Shared entity classes
})
@EnableJpaRepositories(basePackages = {
    "com.ufs.auth.repository",    // Authentication repositories
    "com.ufs.common.repository"   // Shared repository interfaces
})
@EnableJpaAuditing
@EnableAsync(proxyTargetClass = true)
@EnableScheduling
@EnableTransactionManagement
@EnableCaching
@EnableConfigurationProperties
@ComponentScan(basePackages = {
    "com.ufs.auth",               // Authentication service components
    "com.ufs.common"              // Common shared components
})
public class AuthServiceApplication {

    /**
     * Main entry point for the Authentication Service application.
     * 
     * This method bootstraps the Spring Boot application and initializes all
     * critical components required for the authentication microservice:
     * 
     * <ul>
     * <li>Spring Boot auto-configuration for web, security, data access</li>
     * <li>Service discovery client registration with discovery server</li>
     * <li>Database connection pooling and transaction management</li>
     * <li>Security context initialization for OAuth2 and RBAC</li>
     * <li>Audit logging framework activation</li>
     * <li>Caching mechanisms for performance optimization</li>
     * <li>Asynchronous processing capability activation</li>
     * <li>Scheduled task execution for maintenance operations</li>
     * </ul>
     * 
     * The application startup process includes:
     * 1. Loading configuration properties from application.yml/properties
     * 2. Establishing connections to PostgreSQL for transactional data
     * 3. Setting up Redis connections for session storage and caching
     * 4. Registering with service discovery server (Eureka/Consul)
     * 5. Initializing security contexts and authentication providers
     * 6. Setting up monitoring and health check endpoints
     * 7. Activating audit logging for compliance requirements
     * 
     * Environment-specific configurations:
     * - Development: Local database connections, debug logging
     * - Staging: Staging environment databases, integration testing setup
     * - Production: High-availability database clusters, production security
     * 
     * Performance considerations:
     * - Connection pooling configured for high-throughput scenarios
     * - Caching strategies for frequently accessed authentication data
     * - Asynchronous processing for non-blocking operations
     * - Health checks and metrics collection for monitoring
     * 
     * Security initialization:
     * - OAuth2 authorization server configuration
     * - JWT token configuration and signing key setup
     * - Role-based access control (RBAC) initialization
     * - Multi-factor authentication (MFA) provider setup
     * - Audit logging configuration for compliance
     * 
     * @param args Command-line arguments passed to the application.
     *             Supported arguments include:
     *             <ul>
     *             <li>--spring.profiles.active: Specify active Spring profiles</li>
     *             <li>--server.port: Override default server port</li>
     *             <li>--spring.config.location: Custom configuration file location</li>
     *             <li>--eureka.client.service-url.defaultZone: Discovery server URL</li>
     *             </ul>
     * 
     * @throws IllegalStateException if critical components fail to initialize
     * @throws SecurityException if security configuration is invalid
     * 
     * @see SpringApplication#run(Class, String...)
     * @see org.springframework.boot.SpringApplication
     */
    public static void main(String[] args) {
        // Configure system properties for enhanced security and performance
        System.setProperty("java.security.egd", "file:/dev/./urandom");
        System.setProperty("spring.jpa.open-in-view", "false");
        System.setProperty("management.endpoints.web.exposure.include", "health,info,metrics,prometheus");
        
        // Start the Spring Boot application with comprehensive logging
        try {
            SpringApplication application = new SpringApplication(AuthServiceApplication.class);
            
            // Configure application properties for enterprise deployment
            application.setAdditionalProfiles("auth-service");
            application.setLogStartupInfo(true);
            application.setRegisterShutdownHook(true);
            
            // Launch the application
            application.run(args);
            
        } catch (Exception e) {
            // Log startup failure for debugging and alerting
            System.err.println("Failed to start Authentication Service: " + e.getMessage());
            e.printStackTrace();
            
            // Exit with error code for orchestration systems
            System.exit(1);
        }
    }
}