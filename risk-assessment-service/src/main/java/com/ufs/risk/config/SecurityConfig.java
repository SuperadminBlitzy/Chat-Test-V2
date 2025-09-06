package com.ufs.risk.config;

import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.1.4
import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.1.4
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.1.4
import org.springframework.security.config.http.SessionCreationPolicy; // Spring Security 6.1.4
import org.springframework.web.cors.CorsConfiguration; // Spring Framework 6.0.13
import org.springframework.web.cors.CorsConfigurationSource; // Spring Framework 6.0.13
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Spring Framework 6.0.13
import java.util.Arrays; // Java 17

/**
 * Security Configuration for the Risk Assessment Service
 * 
 * This configuration class implements enterprise-grade security measures for the AI-Powered Risk Assessment Engine,
 * following zero-trust architecture principles and financial industry compliance standards including SOC2, PCI DSS,
 * GDPR, FINRA, and Basel III/IV requirements.
 * 
 * Key Security Features:
 * - JWT-based stateless authentication
 * - CORS configuration for cross-origin requests
 * - CSRF protection disabled for API-first architecture
 * - Role-based access control (RBAC)
 * - Endpoint-specific authorization rules
 * - Session management optimized for microservices
 * 
 * Performance Requirements:
 * - Supports <500ms response time for AI services
 * - Designed for 99.9% availability
 * - Optimized for horizontal scaling
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig
     * 
     * Initializes the security configuration with default settings optimized for
     * financial services microservices architecture.
     */
    public SecurityConfig() {
        // Default constructor - configuration is handled by Spring Boot auto-configuration
        // and the explicit bean definitions below
    }

    /**
     * Configures the main security filter chain for the Risk Assessment Service
     * 
     * This method establishes the core security framework implementing zero-trust architecture
     * principles where every request must be authenticated and authorized. The configuration
     * supports the AI-Powered Risk Assessment Engine's security requirements while maintaining
     * optimal performance for financial services operations.
     * 
     * Security Layers Implemented:
     * 1. CORS handling for cross-origin requests from frontend applications
     * 2. CSRF protection disabled for stateless API architecture
     * 3. Stateless session management using JWT tokens
     * 4. Fine-grained authorization rules for different endpoint categories
     * 5. Public access for health check endpoints
     * 6. Authenticated access for all risk assessment operations
     * 
     * @param http HttpSecurity object to configure web-based security
     * @return SecurityFilterChain configured security filter chain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Disable CSRF protection as we're using JWT tokens in a stateless API architecture
                // This is appropriate for microservices where each request contains authentication tokens
                .csrf(csrf -> csrf.disable())
                
                // Configure CORS to allow cross-origin requests from approved frontend applications
                // This is essential for financial services applications with separate frontend domains
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Configure session management to be stateless
                // Each request must contain valid JWT token for authentication
                // This approach enhances security and supports horizontal scaling
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Define authorization rules for HTTP requests
                // Implementing defense-in-depth security strategy
                .authorizeHttpRequests(auth -> auth
                        // Allow public access to actuator endpoints for health checks and monitoring
                        // These endpoints are required for Kubernetes liveness/readiness probes
                        // and infrastructure monitoring (Prometheus, Grafana)
                        .requestMatchers("/actuator/**").permitAll()
                        
                        // Allow public access to health endpoint for load balancer health checks
                        .requestMatchers("/health").permitAll()
                        
                        // Allow public access to API documentation endpoints
                        // Required for development and integration testing
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        
                        // Allow public access to error handling endpoints
                        .requestMatchers("/error").permitAll()
                        
                        // Require authentication for all API endpoints
                        // This implements zero-trust security model where every API request
                        // must be authenticated and authorized
                        .requestMatchers("/api/**").authenticated()
                        
                        // Require authentication for all risk assessment operations
                        // Critical for protecting AI-powered risk assessment engine
                        .requestMatchers("/risk/**").authenticated()
                        
                        // Require authentication for all administrative operations
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        // Require authentication for all other requests
                        // Default security posture - deny by default, allow by exception
                        .anyRequest().authenticated())
                
                // Configure JWT token-based authentication
                // This will be handled by JWT authentication filter (to be implemented separately)
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                // JWT decoder will be configured separately
                                // This enables validation of JWT tokens issued by the authentication service
                        ))
                
                // Build and return the configured security filter chain
                .build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) for the application
     * 
     * This configuration is critical for financial services applications where
     * frontend applications may be hosted on different domains than the backend APIs.
     * The CORS policy is configured to balance security with functional requirements
     * for modern web applications.
     * 
     * Security Considerations:
     * - Explicitly defines allowed origins to prevent unauthorized cross-origin requests
     * - Configures allowed HTTP methods for RESTful API operations
     * - Specifies allowed headers including Authorization for JWT tokens
     * - Controls credential sharing for secure authentication flows
     * - Applies to all endpoints for consistent security policy
     * 
     * Frontend Integration:
     * - Supports React-based frontend applications
     * - Enables proper handling of preflight OPTIONS requests
     * - Allows Content-Type and Authorization headers for API requests
     * 
     * @return CorsConfigurationSource configured CORS policy
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Create a new CORS configuration with security-focused settings
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins for cross-origin requests
        // In production, this should be restricted to specific frontend domains
        // For development and testing, we allow localhost origins
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://*.ufs.com",           // Production frontend domains
                "https://*.ufs-dev.com",       // Development frontend domains
                "http://localhost:*",          // Local development
                "https://localhost:*"          // Local development with HTTPS
        ));
        
        // Set allowed HTTP methods for RESTful API operations
        // These methods support full CRUD operations for risk assessment APIs
        configuration.setAllowedMethods(Arrays.asList(
                "GET",      // Read operations - retrieving risk assessments
                "POST",     // Create operations - submitting new risk assessments
                "PUT",      // Update operations - modifying existing assessments
                "DELETE",   // Delete operations - removing assessments
                "OPTIONS",  // Preflight requests - required for CORS
                "PATCH"     // Partial update operations
        ));
        
        // Set allowed headers for API requests
        // These headers are essential for JWT authentication and content negotiation
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",        // JWT tokens for authentication
                "Content-Type",         // Request/response content type
                "Accept",              // Content type negotiation
                "Origin",              // Request origin for CORS
                "X-Requested-With",    // AJAX request identification
                "X-API-Version",       // API versioning support
                "X-Correlation-ID",    // Request tracing for distributed systems
                "X-Client-ID",         // Client identification for audit logging
                "Cache-Control"        // Caching control headers
        ));
        
        // Set exposed headers that the frontend can access
        // These headers provide additional information for client applications
        configuration.setExposedHeaders(Arrays.asList(
                "X-Total-Count",       // Total count for pagination
                "X-Rate-Limit-Remaining", // Rate limiting information
                "X-Response-Time",     // Response time for monitoring
                "X-Correlation-ID"     // Request correlation for debugging
        ));
        
        // Allow credentials to be included in CORS requests
        // This is required for JWT cookie-based authentication if used
        // Set to true to support authentication cookies and authorization headers
        configuration.setAllowCredentials(true);
        
        // Set maximum age for preflight requests caching
        // This reduces the number of preflight requests for better performance
        configuration.setMaxAge(3600L); // 1 hour
        
        // Create URL-based CORS configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Register the CORS configuration for all paths
        // This ensures consistent CORS policy across all API endpoints
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}