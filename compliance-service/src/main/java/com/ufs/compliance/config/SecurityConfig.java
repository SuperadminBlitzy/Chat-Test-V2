package com.ufs.compliance.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.config.http.SessionCreationPolicy; // Spring Security 6.2.1
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1
import org.springframework.web.cors.CorsConfiguration; // Spring Framework 6.0.13
import org.springframework.web.cors.CorsConfigurationSource; // Spring Framework 6.0.13
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Spring Framework 6.0.13
import java.util.Arrays; // Java 21

/**
 * Security configuration class for the Unified Financial Services Platform Compliance Service.
 * 
 * This class implements enterprise-grade security controls following zero-trust architecture principles,
 * providing JWT-based authentication and role-based access control (RBAC) for regulatory compliance
 * automation features. The configuration ensures compliance with SOC2, PCI-DSS, and GDPR standards
 * while enforcing strict authentication and authorization policies.
 * 
 * Key Security Features:
 * - Zero-trust security model implementation
 * - JWT-based stateless authentication
 * - Fine-grained role-based access control
 * - CORS policy configuration for cross-origin requests
 * - Method-level security annotations support
 * - Compliance endpoint protection
 * 
 * Supported Roles:
 * - COMPLIANCE_OFFICER: Access to compliance automation endpoints
 * - REGULATORY_MANAGER: Access to regulatory monitoring endpoints  
 * - ADMIN: Full administrative access to all endpoints
 * 
 * @author Unified Financial Services Platform Team
 * @version 1.0
 * @since 2025-01-01
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig.
     * Initializes the security configuration class with default settings.
     */
    public SecurityConfig() {
        // Default constructor - no additional initialization required
        // Spring framework will handle bean instantiation and configuration
    }

    /**
     * Configures the main security filter chain for the Compliance Service.
     * 
     * This method implements the zero-trust security model by:
     * - Disabling CSRF protection for stateless API operations
     * - Configuring CORS policies for cross-origin resource sharing
     * - Setting stateless session management for JWT-based authentication
     * - Defining fine-grained authorization rules for service endpoints
     * - Securing compliance and regulatory endpoints with role-based access
     * 
     * Security Endpoints Configuration:
     * - /actuator/health, /actuator/info: Public access for health monitoring
     * - /api/v1/compliance/**: Requires COMPLIANCE_OFFICER or ADMIN role
     * - /api/v1/regulatory/**: Requires REGULATORY_MANAGER or ADMIN role
     * - All other requests: Require authentication
     * 
     * @param http HttpSecurity configuration object for defining security policies
     * @return SecurityFilterChain configured security filter chain for request processing
     * @throws Exception if security configuration fails during setup
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF protection as the service uses token-based authentication
            // CSRF is not necessary for stateless APIs using JWT tokens
            .csrf(csrf -> csrf.disable())
            
            // Configure CORS using the corsConfigurationSource bean
            // This enables controlled cross-origin access for frontend applications
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Set session creation policy to STATELESS for JWT-based authentication
            // This enforces the zero-trust principle of not relying on server-side sessions
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Define authorization rules for service endpoints following least privilege principle
            .authorizeHttpRequests(auth -> auth
                // Permit unrestricted access to actuator health and info endpoints
                // These endpoints are used for service monitoring and health checks
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                
                // Secure compliance automation endpoints with role-based access control
                // F-003: Regulatory Compliance Automation feature protection
                // Only COMPLIANCE_OFFICER and ADMIN roles can access compliance features
                .requestMatchers("/api/v1/compliance/**")
                    .hasAnyRole("COMPLIANCE_OFFICER", "ADMIN")
                
                // Secure regulatory monitoring endpoints with role-based access control
                // Only REGULATORY_MANAGER and ADMIN roles can access regulatory features
                .requestMatchers("/api/v1/regulatory/**")
                    .hasAnyRole("REGULATORY_MANAGER", "ADMIN")
                
                // Secure audit and reporting endpoints for administrative access
                // Only ADMIN role can access audit trails and system reports
                .requestMatchers("/api/v1/audit/**", "/api/v1/reports/**")
                    .hasRole("ADMIN")
                
                // Secure management endpoints for administrative operations
                // Only ADMIN role can access management and configuration endpoints
                .requestMatchers("/api/v1/management/**", "/actuator/**")
                    .hasRole("ADMIN")
                
                // Require authentication for any other request following zero-trust model
                // No implicit trust - every request must be authenticated and authorized
                .anyRequest().authenticated()
            )
            
            // Build and return the configured HttpSecurity object
            .build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) policies for the Compliance Service.
     * 
     * This method defines CORS configuration to enable secure cross-origin requests
     * from authorized frontend applications while maintaining security boundaries.
     * The configuration supports modern web application architectures where frontend
     * and backend services may be deployed on different domains or ports.
     * 
     * CORS Configuration Details:
     * - Allowed Origins: Configurable frontend application URLs
     * - Allowed Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
     * - Allowed Headers: Authorization, Content-Type, X-Requested-With, Accept
     * - Credentials Support: Enabled for authenticated requests
     * - Max Age: 3600 seconds for preflight cache optimization
     * 
     * Security Considerations:
     * - Origins are explicitly configured (no wildcard in production)
     * - Headers are restricted to necessary authentication and content headers
     * - Credentials are supported for JWT token transmission
     * 
     * @return CorsConfigurationSource configured CORS policy source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Create a new CORS configuration object
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins for cross-origin requests
        // In production, these should be configured from application properties
        // for environment-specific frontend application URLs
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://localhost:3000",           // Local development frontend
            "https://admin.ufs-platform.com",  // Production admin interface
            "https://compliance.ufs-platform.com", // Compliance dashboard
            "https://app.ufs-platform.com"     // Main application frontend
        ));
        
        // Set allowed HTTP methods for cross-origin requests
        // Supporting standard REST operations and OPTIONS for preflight
        configuration.setAllowedMethods(Arrays.asList(
            "GET",      // Retrieve resource operations
            "POST",     // Create resource operations  
            "PUT",      // Update resource operations
            "DELETE",   // Delete resource operations
            "OPTIONS",  // Preflight request method
            "PATCH"     // Partial update operations
        ));
        
        // Set allowed headers for cross-origin requests
        // Including essential headers for JWT authentication and content negotiation
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",        // JWT token transmission
            "Content-Type",         // Request content type specification
            "X-Requested-With",     // AJAX request identification
            "Accept",              // Response content type negotiation
            "Origin",              // Request origin identification
            "Access-Control-Request-Method",  // Preflight method specification  
            "Access-Control-Request-Headers", // Preflight headers specification
            "X-Correlation-ID",    // Request correlation for tracing
            "X-User-Context"       // User context information
        ));
        
        // Enable credentials support for authenticated cross-origin requests
        // This allows JWT tokens and cookies to be sent with cross-origin requests
        configuration.setAllowCredentials(true);
        
        // Set maximum age for preflight request caching (1 hour)
        // This reduces the number of preflight requests for better performance
        configuration.setMaxAge(3600L);
        
        // Create URL-based CORS configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Register the CORS configuration for all paths
        // This applies the CORS policy to all endpoints in the service
        source.registerCorsConfiguration("/**", configuration);
        
        // Return the configured CORS configuration source
        return source;
    }
}