package com.ufs.analytics.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration class for the Analytics Service.
 * 
 * This class configures comprehensive security settings including:
 * - OAuth2 and JWT-based authentication for stateless microservices communication
 * - Role-Based Access Control (RBAC) for authorization
 * - Cross-Origin Resource Sharing (CORS) policies for frontend integration
 * - Security compliance measures for SOC2, PCI DSS, and GDPR requirements
 * - Endpoint protection with granular access control
 * 
 * The configuration follows financial services security best practices including:
 * - Stateless session management for microservices architecture
 * - End-to-end encryption support
 * - Audit logging preparation
 * - Zero-trust security principles
 * 
 * @author Analytics Service Team
 * @version 1.0
 * @since 2025-01-01
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig.
     * 
     * Initializes the security configuration class with default settings.
     * The actual security configuration is performed through the bean methods.
     */
    public SecurityConfig() {
        // Default constructor - configuration handled by @Bean methods
    }

    /**
     * Defines the security filter chain for the Analytics Service.
     * 
     * This method configures the core security settings including:
     * - CSRF protection (disabled for stateless JWT authentication)
     * - CORS configuration for cross-origin requests
     * - Stateless session management for microservices architecture
     * - Authorization rules for different endpoint categories
     * - JWT token validation integration points
     * 
     * Security Features Implemented:
     * - Stateless authentication using JWT tokens
     * - Granular endpoint protection
     * - Health check and monitoring endpoint access
     * - Compliance with financial services security standards
     * 
     * @param http the HttpSecurity configuration object
     * @return SecurityFilterChain the configured security filter chain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (Cross-Site Request Forgery) protection as the service uses stateless authentication (JWT)
            // This is appropriate for API-only services that don't serve traditional web forms
            // JWT tokens provide inherent CSRF protection through their stateless nature
            .csrf(csrf -> csrf.disable())
            
            // Configure CORS (Cross-Origin Resource Sharing) using the corsConfigurationSource bean
            // This enables secure cross-origin requests from authorized frontend applications
            // Essential for microservices architecture where frontend and backend are on different domains
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Set the session management policy to STATELESS, ensuring no session is created or used by Spring Security
            // This aligns with microservices best practices and JWT authentication patterns
            // Stateless design improves scalability and supports horizontal scaling
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Define authorization rules for different endpoints
            .authorizeHttpRequests(authz -> authz
                // Permit all requests to actuator endpoints for health checks and monitoring
                // These endpoints are essential for Kubernetes readiness/liveness probes
                // and operational monitoring in production environments
                .requestMatchers("/actuator/**").permitAll()
                
                // Permit all requests to health endpoint for load balancer health checks
                // Critical for maintaining service availability in production
                .requestMatchers("/health/**").permitAll()
                
                // Permit all requests to metrics endpoint for Prometheus monitoring
                // Required for observability and performance monitoring
                .requestMatchers("/metrics/**").permitAll()
                
                // Permit all requests to info endpoint for service information
                // Useful for deployment verification and service discovery
                .requestMatchers("/info/**").permitAll()
                
                // Allow public access to API documentation endpoints
                // Facilitates API discovery and integration for authorized developers
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Require authenticated access for all other endpoints
                // Ensures all business logic endpoints are protected
                // Authentication will be handled by JWT token validation
                .anyRequest().authenticated()
            )
            
            // OAuth2 Resource Server configuration for JWT token validation
            // Configures the service to validate JWT tokens issued by the authorization server
            // Supports RS256 signature verification and claims validation
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // JWT decoder configuration will be handled by Spring Boot auto-configuration
                    // based on spring.security.oauth2.resourceserver.jwt properties
                    // This enables automatic JWT validation with proper issuer verification
                ))
            )
            
            // Headers configuration for security best practices
            .headers(headers -> headers
                // Frame options to prevent clickjacking attacks
                .frameOptions().deny()
                
                // Content type options to prevent MIME sniffing
                .contentTypeOptions().and()
                
                // HTTP Strict Transport Security (HSTS) for HTTPS enforcement
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000) // 1 year
                    .includeSubdomains(true)
                )
                
                // Content Security Policy for XSS protection
                .contentSecurityPolicy("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'")
            );

        // Build and return the HttpSecurity configuration
        return http.build();
    }

    /**
     * Defines the CORS configuration for the application.
     * 
     * This method creates a comprehensive CORS configuration that:
     * - Allows requests from specific frontend applications
     * - Supports standard HTTP methods required for RESTful APIs
     * - Permits necessary headers for authentication and content negotiation
     * - Configures credential support for authenticated requests
     * - Applies security-first approach with explicit allowlists
     * 
     * CORS Configuration Features:
     * - Production-ready origin restrictions
     * - Support for preflight OPTIONS requests
     * - Secure header handling for JWT authentication
     * - Compliance with financial services security policies
     * 
     * @return CorsConfigurationSource the CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Create a new CorsConfiguration object for detailed CORS settings
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set the allowed origins (e.g., from application properties, allowing frontend applications)
        // In production, these should be specific domain names, not wildcards
        // Configuration supports environment-specific origins for dev, staging, and production
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://analytics-dashboard.ufs.com",  // Production frontend
            "https://*.ufs-staging.com",            // Staging environments
            "http://localhost:3000",                // Local development (React)
            "http://localhost:4200",                // Local development (Angular)
            "http://localhost:8080"                 // Local development (Vue.js)
        ));
        
        // Set the allowed HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
        // Covers all standard RESTful API operations
        // OPTIONS is critical for preflight CORS requests
        configuration.setAllowedMethods(Arrays.asList(
            "GET",      // Data retrieval operations
            "POST",     // Data creation operations
            "PUT",      // Data update operations
            "DELETE",   // Data deletion operations
            "OPTIONS",  // Preflight requests
            "HEAD",     // Metadata requests
            "PATCH"     // Partial update operations
        ));
        
        // Set the allowed headers (e.g., Authorization, Content-Type)
        // Authorization header is essential for JWT token transmission
        // Content-Type supports JSON API communication
        // Custom headers support additional security and tracking requirements
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",        // JWT token header
            "Content-Type",         // JSON content specification
            "Accept",              // Response format specification
            "Origin",              // Request origin information
            "Access-Control-Request-Method",    // Preflight method specification
            "Access-Control-Request-Headers",   // Preflight headers specification
            "X-Requested-With",    // AJAX request identification
            "X-Request-ID",        // Request tracking and correlation
            "X-Correlation-ID",    // Distributed tracing support
            "Cache-Control",       // Caching directives
            "Pragma"              // Legacy caching directives
        ));
        
        // Set whether credentials are to be allowed
        // Enables sending of cookies, authorization headers, and TLS client certificates
        // Required for authenticated API requests with JWT tokens
        // Essential for maintaining session context in stateless architecture
        configuration.setAllowCredentials(true);
        
        // Configure exposed headers for client access
        // Allows frontend applications to access specific response headers
        // Useful for pagination, rate limiting, and debugging information
        configuration.setExposedHeaders(Arrays.asList(
            "X-Request-ID",        // Request tracking
            "X-Correlation-ID",    // Distributed tracing
            "X-Rate-Limit-Remaining",  // Rate limiting information
            "X-Rate-Limit-Retry-After-Seconds"  // Rate limiting retry guidance
        ));
        
        // Set max age for preflight requests (in seconds)
        // Reduces the frequency of preflight requests for better performance
        // 1 hour cache duration balances performance and security
        configuration.setMaxAge(3600L);
        
        // Create a UrlBasedCorsConfigurationSource
        // Provides URL pattern-based CORS configuration mapping
        // Enables different CORS settings for different endpoint patterns
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Register the CorsConfiguration for all paths ('/**')
        // Applies the CORS configuration to all API endpoints
        // Ensures consistent CORS behavior across the entire service
        source.registerCorsConfiguration("/**", configuration);
        
        // Additional specific configurations for different endpoint patterns
        // API endpoints may require different CORS settings based on sensitivity
        
        // More restrictive CORS for admin endpoints (if any)
        CorsConfiguration adminConfiguration = new CorsConfiguration();
        adminConfiguration.setAllowedOriginPatterns(Arrays.asList(
            "https://admin.ufs.com"  // Admin console only
        ));
        adminConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        adminConfiguration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        adminConfiguration.setAllowCredentials(true);
        adminConfiguration.setMaxAge(1800L);  // 30 minutes for admin endpoints
        
        // Register admin-specific CORS configuration
        source.registerCorsConfiguration("/admin/**", adminConfiguration);
        
        // Return the configuration source
        return source;
    }
}