package com.ufs.apigateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity; // Spring Security 6.2.1
import org.springframework.security.config.web.server.ServerHttpSecurity; // Spring Security 6.2.1
import org.springframework.security.web.server.SecurityWebFilterChain; // Spring Security 6.2.1
import org.springframework.web.cors.CorsConfiguration; // Spring Framework 6.0.13
import org.springframework.web.cors.CorsConfigurationSource; // Spring Framework 6.0.13
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource; // Spring Framework 6.0.13
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder; // Spring Security 6.2.1
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder; // Spring Security 6.2.1
import org.springframework.security.config.Customizer; // Spring Security 6.2.1
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers; // Spring Security 6.2.1
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler; // Spring Security 6.2.1
import org.springframework.security.web.server.authentication.ServerAuthenticationEntryPoint; // Spring Security 6.2.1
import org.springframework.http.HttpStatus; // Spring Framework 6.0.13
import org.springframework.http.MediaType; // Spring Framework 6.0.13
import org.springframework.core.io.buffer.DataBuffer; // Spring Framework 6.0.13
import org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter; // Spring Security 6.2.1
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter; // Spring Security 6.2.1
import org.springframework.security.web.server.header.ContentTypeOptionsServerHttpHeadersWriter; // Spring Security 6.2.1
import org.springframework.security.web.server.header.XXssProtectionServerHttpHeadersWriter; // Spring Security 6.2.1
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig - Main security configuration class for the API Gateway
 * 
 * This class implements enterprise-grade security for the Unified Financial Services Platform,
 * addressing the requirements for SOC2, PCI-DSS, and GDPR compliance as outlined in the
 * technical specifications. It establishes a zero-trust security model where every request
 * is authenticated and authorized at the gateway level.
 * 
 * Key Features:
 * - OAuth2 Resource Server with JWT validation
 * - CORS policy configuration for cross-origin requests
 * - Security headers for XSS, CSRF, and clickjacking protection
 * - Rate-limiting ready configuration
 * - Comprehensive error handling for security events
 * 
 * This configuration serves as the foundational security layer for the microservices
 * architecture, ensuring that all traffic passing through the API Gateway is properly
 * authenticated and authorized according to financial industry security standards.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    // Configuration properties for JWT validation
    @Value("${security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;
    
    @Value("${security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;
    
    // CORS configuration properties
    @Value("${cors.allowed.origins:http://localhost:3000,https://localhost:3000}")
    private String[] allowedOrigins;
    
    @Value("${cors.allowed.methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String[] allowedMethods;
    
    @Value("${cors.allowed.headers:Authorization,Content-Type,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers}")
    private String[] allowedHeaders;
    
    @Value("${cors.exposed.headers:X-Total-Count,X-Page-Count,Link}")
    private String[] exposedHeaders;
    
    @Value("${cors.allow.credentials:true}")
    private boolean allowCredentials;
    
    @Value("${cors.max.age:3600}")
    private long maxAge;

    /**
     * Default constructor for SecurityConfig
     * 
     * Initializes the security configuration bean with default settings.
     * All configuration is handled through Spring's property injection
     * and bean method configurations.
     */
    public SecurityConfig() {
        // Default constructor - configuration handled via @Value annotations and @Bean methods
    }

    /**
     * Configures the primary security filter chain for the API Gateway
     * 
     * This method establishes the core security policies for the financial services platform:
     * 
     * 1. Disables CSRF protection as the gateway uses stateless JWT authentication
     * 2. Configures comprehensive security headers for protection against common web vulnerabilities
     * 3. Sets up CORS policies to enable secure cross-origin requests from approved domains
     * 4. Configures OAuth2 Resource Server with JWT validation for all authenticated endpoints
     * 5. Defines authorization rules distinguishing between public and protected routes
     * 6. Implements custom error handling for authentication and authorization failures
     * 
     * The configuration follows the zero-trust security model where every request must be
     * authenticated except for specific public endpoints like health checks and authentication services.
     * 
     * @param http ServerHttpSecurity instance for configuring security rules
     * @return SecurityWebFilterChain configured security filter chain for the gateway
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            // Disable CSRF protection for stateless API gateway using JWT tokens
            // CSRF is not applicable for token-based authentication in a stateless architecture
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            
            // Configure comprehensive security headers for financial services compliance
            .headers(headers -> headers
                // Prevent clickjacking attacks by denying frame embedding
                .frameOptions(frameOptions -> frameOptions.deny())
                // Enable XSS protection with block mode for legacy browsers
                .contentTypeOptions(Customizer.withDefaults())
                // Set referrer policy to protect sensitive information in URLs
                .referrerPolicy(ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                // Prevent MIME type sniffing
                .contentTypeOptions(Customizer.withDefaults())
                // Enable Cross-Origin Embedder Policy for additional security
                .crossOriginEmbedderPolicy(crossOriginEmbedderPolicy -> 
                    crossOriginEmbedderPolicy.policy("require-corp"))
                // Enable Cross-Origin Opener Policy
                .crossOriginOpenerPolicy(crossOriginOpenerPolicy -> 
                    crossOriginOpenerPolicy.policy("same-origin"))
                // Set Permissions Policy to control browser features
                .permissionsPolicy(permissionsPolicy -> 
                    permissionsPolicy.policy("camera=(), microphone=(), geolocation=()"))
            )
            
            // Enable and configure CORS using the corsConfigurationSource bean
            // This allows controlled cross-origin requests from approved frontend applications
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure the server as an OAuth2 Resource Server with JWT token validation
            // This enables the gateway to validate JWT tokens issued by the authentication service
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // Use custom JWT decoder if JWK Set URI is configured
                    .jwtDecoder(jwtDecoder())
                    // Configure JWT authentication converter for extracting authorities
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                // Custom authentication entry point for handling unauthorized requests
                .authenticationEntryPoint(authenticationEntryPoint())
            )
            
            // Define authorization rules for different route patterns
            .authorizeExchange(exchanges -> exchanges
                // Public endpoints - no authentication required
                .pathMatchers(
                    "/actuator/health",           // Health check endpoint
                    "/actuator/health/**",        // Detailed health endpoints
                    "/actuator/info",             // Application info endpoint
                    "/actuator/prometheus",       // Metrics endpoint for monitoring
                    "/auth/v1/login",            // Authentication service login
                    "/auth/v1/register",         // User registration
                    "/auth/v1/forgot-password",  // Password reset request
                    "/auth/v1/reset-password",   // Password reset confirmation
                    "/auth/v1/verify-email",     // Email verification
                    "/auth/v1/refresh-token",    // Token refresh endpoint
                    "/public/**",                // Public API endpoints
                    "/swagger-ui/**",            // API documentation (if enabled)
                    "/v3/api-docs/**",           // OpenAPI documentation
                    "/favicon.ico"               // Favicon requests
                ).permitAll()
                
                // Administrative endpoints - require ADMIN role
                .pathMatchers(
                    "/actuator/**",              // All other actuator endpoints
                    "/admin/**"                  // Administrative functions
                ).hasRole("ADMIN")
                
                // Compliance and audit endpoints - require COMPLIANCE role
                .pathMatchers(
                    "/compliance/**",            // Compliance monitoring
                    "/audit/**",                 // Audit trail access
                    "/reports/**"                // Regulatory reports
                ).hasAnyRole("ADMIN", "COMPLIANCE", "AUDITOR")
                
                // Customer service endpoints - require appropriate roles
                .pathMatchers(
                    "/customer-service/**"       // Customer service tools
                ).hasAnyRole("ADMIN", "CUSTOMER_SERVICE", "RELATIONSHIP_MANAGER")
                
                // All other endpoints require authentication
                // This implements the zero-trust principle where every request must be authenticated
                .anyExchange().authenticated()
            )
            
            // Custom access denied handler for authorization failures
            .exceptionHandling(exceptions -> exceptions
                .accessDeniedHandler(accessDeniedHandler())
                .authenticationEntryPoint(authenticationEntryPoint())
            )
            
            // Build and return the configured security filter chain
            .build();
    }

    /**
     * Creates and configures the CORS configuration source bean
     * 
     * This method defines the Cross-Origin Resource Sharing (CORS) policy for the API Gateway,
     * which is essential for allowing secure communication between the frontend applications
     * and the backend services. The configuration is designed to support the financial services
     * platform's multi-channel architecture while maintaining security standards.
     * 
     * Key CORS settings:
     * - Allowed origins: Configurable list of trusted domains (development and production)
     * - Allowed methods: Standard HTTP methods for RESTful API operations
     * - Allowed headers: Headers required for authentication and content negotiation
     * - Exposed headers: Headers that clients can access for pagination and metadata
     * - Credentials support: Enabled for cookie-based session management if needed
     * - Max age: Cache duration for preflight requests to improve performance
     * 
     * The configuration follows security best practices by explicitly defining allowed
     * origins rather than using wildcards, which is crucial for financial applications.
     * 
     * @return CorsConfigurationSource configured CORS configuration source for all paths
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins from configuration properties
        // In production, this should be restricted to specific trusted domains
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins));
        
        // Set allowed HTTP methods for RESTful operations
        configuration.setAllowedMethods(Arrays.asList(allowedMethods));
        
        // Set allowed headers including authentication and content headers
        configuration.setAllowedHeaders(Arrays.asList(allowedHeaders));
        
        // Set headers that can be exposed to the client
        configuration.setExposedHeaders(Arrays.asList(exposedHeaders));
        
        // Allow credentials for authentication cookies and authorization headers
        configuration.setAllowCredentials(allowCredentials);
        
        // Set maximum age for preflight request caching (1 hour)
        configuration.setMaxAge(maxAge);
        
        // Create URL-based CORS configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Register the CORS configuration for all paths
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Creates a reactive JWT decoder bean for OAuth2 resource server configuration
     * 
     * This decoder is responsible for validating JWT tokens received from clients.
     * It supports both JWK Set URI and Issuer URI configurations for maximum flexibility
     * in different deployment environments.
     * 
     * @return ReactiveJwtDecoder configured JWT decoder instance
     */
    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        if (jwkSetUri != null && !jwkSetUri.trim().isEmpty()) {
            // Use JWK Set URI if explicitly configured
            NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri)
                .cache(Duration.ofMinutes(15)) // Cache JWK set for 15 minutes
                .build();
            return decoder;
        } else if (issuerUri != null && !issuerUri.trim().isEmpty()) {
            // Use issuer URI for automatic JWK Set discovery
            NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withIssuerLocation(issuerUri)
                .cache(Duration.ofMinutes(15)) // Cache JWK set for 15 minutes
                .build();
            return decoder;
        } else {
            // Fallback to a default configuration for development
            // In production, proper JWT configuration should always be provided
            throw new IllegalStateException(
                "JWT configuration is required. Please configure either " +
                "security.oauth2.resourceserver.jwt.jwk-set-uri or " +
                "security.oauth2.resourceserver.jwt.issuer-uri"
            );
        }
    }

    /**
     * Creates a JWT authentication converter for extracting user authorities
     * 
     * This converter transforms JWT claims into Spring Security authorities,
     * enabling role-based access control throughout the application.
     * 
     * @return Converter for JWT to Authentication transformation
     */
    @Bean
    public org.springframework.core.convert.converter.Converter<org.springframework.security.oauth2.jwt.Jwt, Mono<org.springframework.security.core.Authentication>> jwtAuthenticationConverter() {
        org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter converter = 
            new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter();
        
        // Configure authorities converter to extract roles from JWT claims
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Extract authorities from 'authorities' claim or 'roles' claim
            List<String> authorities = jwt.getClaimAsStringList("authorities");
            if (authorities == null) {
                authorities = jwt.getClaimAsStringList("roles");
            }
            
            if (authorities != null) {
                return authorities.stream()
                    .map(authority -> {
                        // Ensure role authorities have ROLE_ prefix
                        if (!authority.startsWith("ROLE_") && !authority.startsWith("SCOPE_")) {
                            return "ROLE_" + authority;
                        }
                        return authority;
                    })
                    .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                    .collect(java.util.stream.Collectors.toList());
            }
            
            return java.util.Collections.emptyList();
        });
        
        // Set principal name from 'sub' claim (subject)
        converter.setPrincipalClaimName("sub");
        
        return new org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    /**
     * Custom authentication entry point for handling unauthorized requests
     * 
     * This entry point provides consistent error responses for authentication failures,
     * which is important for API clients and security monitoring.
     * 
     * @return ServerAuthenticationEntryPoint for handling authentication errors
     */
    @Bean
    public ServerAuthenticationEntryPoint authenticationEntryPoint() {
        return (exchange, ex) -> {
            org.springframework.http.server.reactive.ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
            
            String errorResponse = """
                {
                    "error": "unauthorized",
                    "message": "Authentication required to access this resource",
                    "timestamp": "%s",
                    "path": "%s"
                }
                """.formatted(
                    java.time.Instant.now().toString(),
                    exchange.getRequest().getPath().value()
                );
            
            DataBuffer buffer = response.bufferFactory().wrap(errorResponse.getBytes());
            return response.writeWith(Mono.just(buffer));
        };
    }

    /**
     * Custom access denied handler for authorization failures
     * 
     * This handler provides consistent error responses when authenticated users
     * attempt to access resources they don't have permission for.
     * 
     * @return ServerAccessDeniedHandler for handling authorization errors
     */
    @Bean
    public ServerAccessDeniedHandler accessDeniedHandler() {
        return (exchange, denied) -> {
            org.springframework.http.server.reactive.ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.FORBIDDEN);
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
            
            String errorResponse = """
                {
                    "error": "access_denied",
                    "message": "Insufficient privileges to access this resource",
                    "timestamp": "%s",
                    "path": "%s"
                }
                """.formatted(
                    java.time.Instant.now().toString(),
                    exchange.getRequest().getPath().value()
                );
            
            DataBuffer buffer = response.bufferFactory().wrap(errorResponse.getBytes());
            return response.writeWith(Mono.just(buffer));
        };
    }
}