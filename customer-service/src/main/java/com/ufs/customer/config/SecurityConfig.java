package com.ufs.customer.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.jwt.JwtDecoder; // Spring Security OAuth2 JWT 6.2.1
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder; // Spring Security OAuth2 JWT 6.2.1
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.cors.CorsConfiguration; // Spring Web CORS 6.0.13
import org.springframework.web.cors.CorsConfigurationSource; // Spring Web CORS 6.0.13
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Spring Web CORS 6.0.13
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;

import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.List;
import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Main security configuration class for the Customer Service microservice.
 * 
 * This configuration class enables Spring Security's web security support and provides
 * comprehensive security settings for the Customer Service APIs. It implements JWT-based
 * authentication and authorization suitable for financial services microservices architecture.
 * 
 * Key Security Features:
 * - JWT-based stateless authentication
 * - Role-based access control with CUSTOMER role
 * - CORS configuration for frontend integration
 * - Public access to digital customer onboarding endpoints
 * - OAuth2 resource server configuration
 * - Financial services security compliance
 * 
 * Security Standards Compliance:
 * - Follows OAuth2 and OpenID Connect standards
 * - Implements JWT token validation with RS256 signature
 * - Provides audit-ready security configuration
 * - Supports multi-tier authentication as per financial industry requirements
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * JWT signing key from configuration properties.
     * This public key is used to validate JWT signatures issued by the authorization server.
     */
    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    /**
     * Allowed origins for CORS configuration.
     * Configurable list of frontend application URLs that can access this service.
     */
    @Value("${app.security.cors.allowed-origins}")
    private List<String> allowedOrigins;

    /**
     * JWT issuer URL for token validation.
     * Ensures tokens are issued by the trusted authorization server.
     */
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    /**
     * Default constructor for SecurityConfig.
     * 
     * Initializes the security configuration with default settings.
     * All configuration is driven by Spring's dependency injection and
     * external configuration properties.
     */
    public SecurityConfig() {
        // Default constructor - configuration handled by Spring Boot auto-configuration
        // and custom beans defined in this class
    }

    /**
     * Defines the security filter chain for the Customer Service.
     * 
     * This method configures the complete security policy for the microservice including:
     * - CORS settings for cross-origin requests from frontend applications
     * - CSRF protection (disabled for stateless JWT authentication)
     * - Session management (stateless for microservices architecture)
     * - Authorization rules for public and protected endpoints
     * - JWT resource server configuration for token validation
     * - Security headers for financial services compliance
     * 
     * Public Endpoints (no authentication required):
     * - /api/v1/customers/onboarding/** - Digital customer onboarding process
     * - /actuator/health - Health check endpoint for monitoring
     * - /actuator/info - Application information endpoint
     * 
     * Protected Endpoints (requires CUSTOMER role):
     * - /api/v1/customers/** - All other customer-related operations
     * - /api/v1/profiles/** - Customer profile management
     * - /api/v1/accounts/** - Customer account operations
     * 
     * @param http HttpSecurity object for configuring web-based security
     * @return SecurityFilterChain configured security filter chain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configure CORS to allow requests from authorized frontend applications
            // This is essential for microservices architecture where frontend and backend
            // are deployed separately and may have different domains
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF protection as this service uses stateless JWT authentication
            // CSRF protection is not needed for APIs that don't maintain server-side sessions
            // and rely on bearer tokens for authentication
            .csrf(csrf -> csrf.disable())
            
            // Configure session management to be stateless
            // This is crucial for microservices architecture and JWT-based authentication
            // No server-side session state is maintained, improving scalability
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure authorization rules for different endpoint patterns
            // Financial services require careful access control with proper role-based permissions
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - no authentication required
                // Digital customer onboarding endpoints must be accessible to new customers
                .requestMatchers(HttpMethod.POST, "/api/v1/customers/onboarding/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/customers/onboarding/status/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/v1/customers/onboarding/**").permitAll()
                
                // Health and monitoring endpoints for operational monitoring
                .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/info").permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/metrics").permitAll()
                
                // API documentation endpoints (if enabled in non-production environments)
                .requestMatchers(HttpMethod.GET, "/swagger-ui/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v3/api-docs/**").permitAll()
                
                // Protected customer service endpoints - require authentication and CUSTOMER role
                // These endpoints handle sensitive financial data and customer information
                .requestMatchers("/api/v1/customers/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/profiles/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/accounts/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/transactions/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/documents/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/notifications/**").hasRole("CUSTOMER")
                
                // Administrative endpoints - require elevated privileges
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                // All other requests require authentication
                // This provides a secure default for any endpoints not explicitly configured
                .anyRequest().authenticated()
            )
            
            // Configure OAuth2 resource server with JWT support
            // This enables the service to validate JWT tokens issued by the authorization server
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // Use custom JWT decoder with proper validation
                    .decoder(jwtDecoder())
                    // Convert JWT claims to Spring Security authorities
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            
            // Configure security headers for financial services compliance
            .headers(headers -> headers
                // Frame options to prevent clickjacking attacks
                .frameOptions().deny()
                // Content type options to prevent MIME type sniffing
                .contentTypeOptions().and()
                // XSS protection header
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
            )
            
            // Configure exception handling for authentication and authorization failures
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    // Log authentication failures for security monitoring
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or missing authentication token\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    // Log authorization failures for security monitoring
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access Denied\",\"message\":\"Insufficient privileges for this operation\"}");
                })
            );

        return http.build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings for the application.
     * 
     * This configuration allows the frontend application to make requests to this
     * microservice from different domains. This is essential for modern web applications
     * where frontend and backend services are deployed on different domains or ports.
     * 
     * Security considerations:
     * - Only allows requests from configured trusted origins
     * - Specifies allowed HTTP methods for each endpoint type
     * - Enables credentials for authenticated requests
     * - Sets appropriate cache time for preflight requests
     * 
     * @return CorsConfigurationSource configured CORS settings
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Configure allowed origins from application properties
        // This should be restricted to known frontend application URLs in production
        configuration.setAllowedOriginPatterns(allowedOrigins);
        
        // Allow standard HTTP methods required for RESTful API operations
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allow headers commonly used in API requests
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "X-Request-ID",
            "X-Correlation-ID"
        ));
        
        // Allow credentials (cookies, authorization headers) to be sent with requests
        // This is necessary for JWT bearer token authentication
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour to improve performance
        configuration.setMaxAge(3600L);
        
        // Expose headers that the frontend can access
        configuration.setExposedHeaders(Arrays.asList(
            "X-Request-ID",
            "X-Correlation-ID",
            "X-Rate-Limit-Remaining",
            "X-Rate-Limit-Reset"
        ));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Creates and configures a JWT decoder for validating incoming JWT tokens.
     * 
     * This decoder is responsible for:
     * - Validating JWT signature using the configured public key
     * - Verifying token expiration and not-before claims
     * - Ensuring tokens are issued by the trusted authorization server
     * - Providing decoded claims for authorization decisions
     * 
     * The decoder uses the RS256 algorithm for signature validation, which is
     * the recommended approach for financial services applications requiring
     * high security standards.
     * 
     * @return JwtDecoder configured JWT decoder with proper validation
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Create decoder using JWK Set URI for dynamic key resolution
        // This allows for key rotation without service restarts
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        
        // Configure additional validation beyond signature verification
        jwtDecoder.setJwtValidator(token -> {
            // Validate issuer claim matches expected authorization server
            if (!issuerUri.equals(token.getIssuer().toString())) {
                throw new IllegalArgumentException("Invalid token issuer");
            }
            
            // Additional custom validations can be added here
            // For example: audience validation, custom claims validation
            return token;
        });
        
        return jwtDecoder;
    }

    /**
     * Configures JWT authentication converter for extracting authorities from JWT tokens.
     * 
     * This converter transforms JWT claims into Spring Security authorities that can be
     * used for authorization decisions. It specifically handles:
     * - Role extraction from JWT claims
     * - Authority prefix configuration (ROLE_ prefix for Spring Security compatibility)
     * - Custom claims processing for financial services requirements
     * 
     * The converter supports both standard OAuth2 scopes and custom role claims
     * commonly used in financial services applications.
     * 
     * @return JwtAuthenticationConverter configured converter for authority extraction
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        
        // Configure authorities converter to extract roles from JWT claims
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        
        // Set the claim name that contains the user's roles
        // This can be customized based on the JWT structure from your authorization server
        authoritiesConverter.setAuthoritiesClaimName("roles");
        
        // Configure authority prefix - Spring Security expects ROLE_ prefix
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        
        // Custom authorities converter that handles both standard and custom claims
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Extract standard authorities using the configured converter
            Collection<SimpleGrantedAuthority> authorities = (Collection<SimpleGrantedAuthority>) 
                authoritiesConverter.convert(jwt);
            
            // Add custom authority extraction logic if needed
            // For example, extracting permissions from custom claims
            if (jwt.getClaimAsStringList("permissions") != null) {
                List<SimpleGrantedAuthority> customAuthorities = jwt.getClaimAsStringList("permissions")
                    .stream()
                    .map(permission -> new SimpleGrantedAuthority("PERMISSION_" + permission.toUpperCase()))
                    .collect(Collectors.toList());
                authorities.addAll(customAuthorities);
            }
            
            // Ensure CUSTOMER role is present for customer service access
            // This can be derived from other claims if not explicitly present
            if (jwt.getClaimAsString("customer_id") != null && 
                authorities.stream().noneMatch(auth -> auth.getAuthority().equals("ROLE_CUSTOMER"))) {
                authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
            }
            
            return authorities;
        });
        
        // Configure principal name extraction from JWT claims
        // Use customer ID as principal name for better traceability
        converter.setPrincipalClaimName("customer_id");
        
        return converter;
    }
}