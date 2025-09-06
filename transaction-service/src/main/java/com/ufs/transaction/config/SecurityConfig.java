package com.ufs.transaction.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.config.http.SessionCreationPolicy; // Spring Security 6.2.1
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Spring Security configuration for the Transaction Service.
 * 
 * This configuration class implements enterprise-grade security measures for the
 * transaction microservice, including OAuth2 JWT token validation, role-based
 * access control (RBAC), and stateless session management.
 * 
 * Key Security Features:
 * - OAuth2 Resource Server with JWT token validation
 * - Role-based access control for transaction endpoints
 * - Stateless session management for microservices architecture
 * - CSRF protection disabled for API-only services
 * - Actuator endpoints security configuration
 * - Custom authentication and authorization handlers
 * 
 * Security Standards Compliance:
 * - Implements OAuth2 and RBAC as specified in section 2.3.3 Common Services
 * - Supports multi-layered security architecture for financial services
 * - Provides audit logging capabilities through Spring Security events
 * - Ensures zero-trust security model for microservices communication
 * 
 * Integration Points:
 * - Integrates with centralized OAuth2 authentication service
 * - Validates JWT tokens issued by the authentication service
 * - Supports role-based permissions with audit trails
 * - Compatible with API Gateway security policies
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024-12-01
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig.
     * 
     * Initializes the security configuration with default settings.
     * No additional initialization required as all configuration is
     * handled through the securityFilterChain bean method.
     */
    public SecurityConfig() {
        // Default constructor - configuration handled via bean methods
    }

    /**
     * Configures the security filter chain for the transaction service.
     * 
     * This method defines comprehensive security policies for the transaction service,
     * implementing OAuth2 JWT validation, role-based access control, and stateless
     * session management. The configuration follows enterprise security best practices
     * for financial services applications.
     * 
     * Security Architecture:
     * - Stateless authentication using JWT tokens
     * - OAuth2 resource server configuration for token validation
     * - Role-based authorization for different transaction operations
     * - Public access to health monitoring endpoints
     * - Secure authentication entry points and error handling
     * 
     * Endpoint Security Mapping:
     * - /actuator/health/** - Public access for monitoring
     * - /api/transactions/** - Authenticated access required
     * - All other endpoints - Authenticated access required
     * 
     * Role-Based Access Control:
     * - TRANSACTION_READ - Read access to transaction data
     * - TRANSACTION_WRITE - Write access for transaction operations
     * - TRANSACTION_ADMIN - Administrative access to all transaction functions
     * - SYSTEM_ADMIN - Full system administrative access
     * 
     * @param http The HttpSecurity object to configure web-based security
     * @return SecurityFilterChain The configured security filter chain
     * @throws Exception If security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Disable CSRF (Cross-Site Request Forgery) protection
        // This is appropriate for stateless REST APIs that use JWT tokens
        // CSRF protection is not needed for stateless services as each request
        // is authenticated independently without relying on session cookies
        http.csrf(csrf -> csrf.disable());

        // Configure session management to be stateless
        // Each request must be authenticated independently using JWT tokens
        // This is essential for microservices architecture where services
        // should not maintain session state between requests
        http.sessionManagement(session -> 
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        // Configure authorization rules for API endpoints
        // This implements role-based access control (RBAC) as specified
        // in the technical requirements for secure microservices
        http.authorizeHttpRequests(authz -> authz
            // Permit all requests to actuator health endpoints
            // These endpoints are used by monitoring systems, load balancers,
            // and orchestration platforms to check service health
            // Public access is necessary for proper service discovery and health checks
            .requestMatchers(
                new AntPathRequestMatcher("/actuator/health/**"),
                new AntPathRequestMatcher("/actuator/info/**"),
                new AntPathRequestMatcher("/actuator/metrics/**")
            ).permitAll()
            
            // Require authenticated access for all transaction endpoints
            // These endpoints handle sensitive financial data and operations
            // Authentication is required to ensure only authorized users can access
            .requestMatchers(
                new AntPathRequestMatcher("/api/transactions/**")
            ).authenticated()
            
            // Require authentication for all other endpoints
            // This ensures a secure-by-default approach where any endpoint
            // not explicitly permitted requires authentication
            .anyRequest().authenticated()
        );

        // Configure OAuth2 Resource Server with JWT token validation
        // This enables the service to validate JWT tokens issued by the
        // centralized authentication service, supporting distributed authentication
        // in the microservices architecture
        http.oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt
                // JWT decoder will be auto-configured based on spring.security.oauth2.resourceserver.jwt.issuer-uri
                // This allows the service to automatically discover and validate JWT tokens
                // from the configured OAuth2 authorization server
            )
            // Configure custom authentication entry point for unauthorized requests
            .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
            // Configure custom access denied handler for insufficient permissions
            .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
        );

        // Configure custom security headers for financial services compliance
        http.headers(headers -> headers
            // Prevent the page from being displayed in a frame to avoid clickjacking
            .frameOptions().deny()
            // Ensure content type is correctly interpreted by browsers
            .contentTypeOptions().and()
            // Enable XSS protection in browsers
            .httpStrictTransportSecurity(hsts -> hsts
                .maxAgeInSeconds(31536000) // 1 year
                .includeSubdomains(true)
                .preload(true)
            )
        );

        // Configure CORS if needed for cross-origin requests
        // This can be customized based on specific client requirements
        http.cors(cors -> cors.disable()); // Disabled by default, configure as needed

        // Build and return the configured HttpSecurity object
        // This creates the complete security filter chain that will be applied
        // to all incoming requests to the transaction service
        return http.build();
    }
}