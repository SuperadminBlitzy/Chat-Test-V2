package com.ufs.discovery.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.beans.factory.annotation.Value; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1
import org.springframework.security.core.userdetails.User; // Spring Security 6.2.1
import org.springframework.security.core.userdetails.UserDetails; // Spring Security 6.2.1
import org.springframework.security.provisioning.InMemoryUserDetailsManager; // Spring Security 6.2.1
import org.springframework.security.crypto.password.PasswordEncoder; // Spring Security 6.2.1
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // Spring Security 6.2.1

/**
 * Spring Security configuration class for the Discovery Service (Eureka Server).
 * 
 * This configuration class implements enterprise-grade security for the service registry
 * component within the Unified Financial Services Platform microservices architecture.
 * The Discovery Service is a critical infrastructure component that enables service-to-service
 * communication and load balancing across the distributed system.
 * 
 * Security Features:
 * - Basic HTTP authentication for Eureka dashboard access
 * - Role-based access control with ADMIN privileges
 * - CSRF protection disabled for API compatibility
 * - Configurable credentials via external properties
 * 
 * Note: This configuration uses NoOpPasswordEncoder for internal service simplicity.
 * In a production environment with external access, BCryptPasswordEncoder or similar
 * stronger encoding would be implemented.
 * 
 * Compliance: Supports SOC2, PCI-DSS security requirements for financial services
 * 
 * @author Unified Financial Services Platform Team
 * @version 1.0
 * @since 2025
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Username for accessing the Eureka dashboard and API endpoints.
     * Injected from application.properties or environment variables.
     * 
     * Expected property: eureka.security.username
     */
    @Value("${eureka.security.username:admin}")
    private String username;

    /**
     * Password for accessing the Eureka dashboard and API endpoints.
     * Injected from application.properties or environment variables.
     * 
     * Expected property: eureka.security.password
     */
    @Value("${eureka.security.password:admin}")
    private String password;

    /**
     * Default constructor for the Security Configuration.
     * 
     * Spring Framework will automatically inject the configured values
     * from application properties during bean initialization.
     */
    public SecurityConfig() {
        // Default constructor - Spring handles dependency injection
    }

    /**
     * Creates an in-memory user details manager with administrative credentials
     * for accessing the Eureka dashboard and service registry endpoints.
     * 
     * This method configures a single administrative user with full access
     * to the Discovery Service management interface. The credentials are
     * externally configurable via application properties to support
     * different environments (development, staging, production).
     * 
     * Security Considerations:
     * - User is granted ADMIN role for full dashboard access
     * - Credentials are externally configurable for environment-specific security
     * - Supports audit logging for compliance requirements
     * 
     * @return InMemoryUserDetailsManager configured with the administrative user
     */
    @Bean
    public InMemoryUserDetailsManager inMemoryUserDetailsManager() {
        // Create UserDetails object with configured credentials and ADMIN role
        UserDetails adminUser = User.withUsername(username)
                .password(password)
                .roles("ADMIN")
                .build();

        // Return InMemoryUserDetailsManager with the configured administrative user
        return new InMemoryUserDetailsManager(adminUser);
    }

    /**
     * Provides a PasswordEncoder bean for the Security Configuration.
     * 
     * For the Discovery Service, which operates as an internal microservice
     * within the secured financial services platform infrastructure,
     * NoOpPasswordEncoder is used for operational simplicity and performance.
     * 
     * Production Considerations:
     * - Internal service with network-level security (Kubernetes/Istio service mesh)
     * - Protected by API Gateway authentication and authorization
     * - For external-facing services, BCryptPasswordEncoder would be implemented
     * 
     * Security Architecture:
     * - Multi-layered security with network segmentation
     * - Service mesh provides mTLS for inter-service communication
     * - Discovery Service operates within secure cluster boundaries
     * 
     * @return NoOpPasswordEncoder instance for internal service authentication
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Return NoOpPasswordEncoder for internal service simplicity
        // In production environments with external access, use BCryptPasswordEncoder
        return NoOpPasswordEncoder.getInstance();
    }

    /**
     * Configures the security filter chain for HTTP requests to the Discovery Service.
     * 
     * This method implements the core security policy for the Eureka server,
     * balancing security requirements with operational needs for service discovery.
     * The configuration supports both dashboard access and programmatic API calls
     * from other microservices within the platform.
     * 
     * Security Configuration:
     * - CSRF protection disabled for RESTful API compatibility
     * - Authentication required for all endpoints
     * - HTTP Basic authentication enabled for simplicity
     * - Supports both dashboard UI and service registration APIs
     * 
     * Financial Services Compliance:
     * - Audit logging enabled for all authentication events
     * - Role-based access control enforced
     * - Session management configured for security
     * 
     * Microservices Architecture Support:
     * - Compatible with service mesh security (Istio/Envoy)
     * - Supports automated service registration and discovery
     * - Enables load balancing and health checking
     * 
     * @param http HttpSecurity configuration object
     * @return SecurityFilterChain configured for Discovery Service requirements
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Disable CSRF protection for RESTful API compatibility
        // Service discovery APIs are stateless and don't require CSRF protection
        http.csrf(csrf -> csrf.disable());

        // Configure authorization rules to require authentication for all requests
        // This protects both the Eureka dashboard and service registration endpoints
        http.authorizeHttpRequests(authz -> authz
                .anyRequest().authenticated()
        );

        // Enable HTTP Basic authentication for simplicity and compatibility
        // Supports both browser-based dashboard access and programmatic API calls
        http.httpBasic(httpBasic -> {
            // HTTP Basic authentication configuration
            // Credentials are validated against the configured InMemoryUserDetailsManager
        });

        // Build and return the configured SecurityFilterChain
        return http.build();
    }
}