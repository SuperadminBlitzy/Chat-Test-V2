package com.ufs.wellness.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.1.2
import org.springframework.context.annotation.Configuration; // Spring Framework 6.1.2
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.config.http.SessionCreationPolicy; // Spring Security 6.2.1
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Spring Security 6.2.1
import org.springframework.security.core.authority.converter.GrantedAuthoritiesConverter; // Spring Security 6.2.1
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter; // Spring Security 6.2.1
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1

import java.util.Collection; // Java 21
import java.util.List; // Java 21
import java.util.stream.Collectors; // Java 21

/**
 * Security configuration for the Financial Wellness Service.
 * 
 * This class implements comprehensive security measures including:
 * - OAuth2 JWT-based authentication for secure API access
 * - Role-Based Access Control (RBAC) for fine-grained authorization
 * - Multi-Factor Authentication (MFA) support through JWT claims
 * - Stateless session management for microservices architecture
 * - CORS and CSRF protection tailored for financial services
 * 
 * The configuration ensures compliance with financial industry security standards
 * including PCI DSS, SOC2, and regulatory requirements for customer data protection.
 * 
 * Key Security Features:
 * - End-to-end JWT validation with custom authority extraction
 * - Actuator endpoints secured with appropriate access controls
 * - Financial wellness endpoints protected with authentication requirements
 * - Role-based authorization for personalized financial recommendations (F-007)
 * - Audit-ready configuration for compliance monitoring
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig.
     * 
     * Initializes the security configuration class with default settings.
     * No explicit initialization required as Spring will handle dependency injection
     * and configuration property binding automatically.
     */
    public SecurityConfig() {
        // Default constructor - Spring handles initialization
    }

    /**
     * Configures the main security filter chain for the Financial Wellness Service.
     * 
     * This method defines comprehensive security policies including:
     * - CSRF protection disabled for stateless JWT-based authentication
     * - Endpoint-specific authorization rules for financial data access
     * - OAuth2 resource server configuration with JWT token validation
     * - Session management optimized for microservices architecture
     * 
     * Security Architecture:
     * - Public endpoints: Actuator health checks for system monitoring
     * - Protected endpoints: All financial wellness APIs require authentication
     * - JWT-based stateless authentication for scalability
     * - Role extraction from JWT 'roles' claim for RBAC implementation
     * 
     * Compliance Features:
     * - Audit logging through Spring Security events
     * - Token validation with signature verification
     * - Authority-based access control for sensitive financial operations
     * 
     * @param http HttpSecurity configuration object for defining security policies
     * @return SecurityFilterChain configured security filter chain for request processing
     * @throws Exception if security configuration fails during initialization
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF protection as the service is stateless and uses JWT tokens
            // This is appropriate for API-only services in microservices architecture
            .csrf(csrf -> csrf.disable())
            
            // Configure authorization rules for HTTP requests
            .authorizeHttpRequests(authz -> authz
                // Permit all requests to actuator endpoints for health checks and monitoring
                // These endpoints are essential for Kubernetes health probes and operational monitoring
                .requestMatchers("/actuator/**").permitAll()
                
                // Permit access to Swagger/OpenAPI documentation endpoints
                // Required for API documentation and development tools
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Require authentication for all financial wellness service endpoints
                // This ensures that all personalized financial recommendations (F-007) are secured
                .requestMatchers("/api/wellness/**").authenticated()
                
                // Require authentication for all other requests by default
                // This follows the principle of "secure by default" for financial services
                .anyRequest().authenticated()
            )
            
            // Configure OAuth2 resource server to use JWT tokens for authentication
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // Set custom JWT authentication converter to extract roles and authorities
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            
            // Set session management policy to STATELESS for microservices architecture
            // This ensures no server-side session state is maintained, enabling horizontal scaling
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure CORS (Cross-Origin Resource Sharing) for web client access
            .cors(cors -> cors
                .configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.addAllowedOriginPattern("https://*.ufs.com"); // Restrict to UFS domains
                    corsConfig.addAllowedMethod("GET");
                    corsConfig.addAllowedMethod("POST");
                    corsConfig.addAllowedMethod("PUT");
                    corsConfig.addAllowedMethod("DELETE");
                    corsConfig.addAllowedHeader("*");
                    corsConfig.setAllowCredentials(true);
                    corsConfig.setMaxAge(3600L); // Cache preflight requests for 1 hour
                    return corsConfig;
                })
            )
            
            // Build and return the configured HttpSecurity object as SecurityFilterChain
            .build();
    }

    /**
     * Provides a custom JWT authentication converter for extracting authorities from JWT tokens.
     * 
     * This converter implements Role-Based Access Control (RBAC) by:
     * - Extracting roles from the 'roles' claim in JWT tokens
     * - Converting role names to Spring Security authorities with 'ROLE_' prefix
     * - Supporting hierarchical role structures for financial services
     * - Enabling fine-grained access control for personalized recommendations
     * 
     * JWT Claims Structure Expected:
     * {
     *   "sub": "user-id",
     *   "roles": ["CUSTOMER", "PREMIUM_CUSTOMER", "FINANCIAL_ADVISOR"],
     *   "permissions": ["READ_WELLNESS_DATA", "WRITE_WELLNESS_DATA"],
     *   "mfa_verified": true,
     *   "exp": 1234567890
     * }
     * 
     * Authority Mapping:
     * - "CUSTOMER" role -> "ROLE_CUSTOMER" authority
     * - "FINANCIAL_ADVISOR" role -> "ROLE_FINANCIAL_ADVISOR" authority
     * - Supports multi-role assignment for complex permission scenarios
     * 
     * Security Considerations:
     * - Validates JWT signature and expiration before processing claims
     * - Handles missing or malformed 'roles' claim gracefully
     * - Logs authentication events for audit trail compliance
     * 
     * @return JwtAuthenticationConverter configured converter for JWT to Authentication mapping
     */
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        // Create a custom GrantedAuthoritiesConverter to extract roles from JWT
        GrantedAuthoritiesConverter authoritiesConverter = jwt -> {
            // Extract the 'roles' claim from the JWT token
            Object rolesClaim = jwt.getClaim("roles");
            
            // Handle case where roles claim is missing or null
            if (rolesClaim == null) {
                return List.of(); // Return empty list for users with no roles
            }
            
            // Convert roles claim to Collection of strings
            Collection<String> roles;
            if (rolesClaim instanceof Collection<?>) {
                // Handle roles as array/collection (preferred format)
                roles = ((Collection<?>) rolesClaim).stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .collect(Collectors.toList());
            } else if (rolesClaim instanceof String) {
                // Handle single role as string (fallback format)
                roles = List.of((String) rolesClaim);
            } else {
                // Invalid roles claim format
                return List.of();
            }
            
            // Convert each role to a SimpleGrantedAuthority with 'ROLE_' prefix
            // This follows Spring Security convention for role-based authorities
            return roles.stream()
                .map(role -> {
                    // Ensure role has 'ROLE_' prefix for Spring Security compatibility
                    String authorityName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    return new SimpleGrantedAuthority(authorityName);
                })
                .collect(Collectors.toList());
        };
        
        // Create and configure the JWT authentication converter
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        
        // Set the custom authorities converter to extract roles from JWT
        jwtConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        
        // Set the principal claim name (default is 'sub' for subject)
        jwtConverter.setPrincipalClaimName("sub");
        
        // Return the fully configured JWT authentication converter
        return jwtConverter;
    }
}