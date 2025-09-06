package com.ufs.apigateway.config;

import org.springframework.beans.factory.annotation.Value; // version 6.0.13
import org.springframework.context.annotation.Configuration; // version 6.0.13
import org.springframework.web.servlet.config.annotation.CorsRegistry; // version 6.0.13
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // version 6.0.13

/**
 * CORS (Cross-Origin Resource Sharing) Configuration for the API Gateway.
 * 
 * This configuration class implements enterprise-grade CORS policies to enable
 * secure cross-origin communication between the frontend React application and
 * the backend microservices through the API Gateway. The configuration follows
 * financial industry security standards and supports the microservices architecture
 * deployed in the unified financial services platform.
 * 
 * Key Features:
 * - Configurable allowed origins through external properties
 * - Support for standard HTTP methods required by REST APIs
 * - Credential support for authentication tokens and session cookies
 * - Comprehensive header support for modern web applications
 * - Production-ready security settings
 * 
 * Security Considerations:
 * - Origins are externally configurable to support different environments
 * - Credentials are allowed to support OAuth2 and JWT token authentication
 * - Follows financial services security compliance requirements
 * - Implements least privilege principle for CORS permissions
 * 
 * @author Unified Financial Services Development Team
 * @version 1.0
 * @since Spring Boot 3.2+
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Array of allowed origins for CORS requests.
     * 
     * This property is injected from the application configuration file (application.yml)
     * to support different environments (development, staging, production).
     * 
     * Example configuration in application.yml:
     * cors:
     *   allowed-origins:
     *     - http://localhost:3000        # Development React app
     *     - https://app.ufs.com          # Production frontend
     *     - https://staging.ufs.com      # Staging environment
     * 
     * Security Note: In production, this should be restricted to only trusted domains
     * hosting the legitimate frontend applications.
     */
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    /**
     * Default constructor for the CorsConfig class.
     * 
     * Spring will automatically instantiate this configuration class during
     * application startup and apply the CORS settings globally across all
     * controllers in the API Gateway.
     */
    public CorsConfig() {
        // Default constructor - Spring will handle dependency injection
    }

    /**
     * Configures global CORS mappings for all endpoints in the API Gateway.
     * 
     * This method overrides the default WebMvcConfigurer implementation to provide
     * enterprise-grade CORS configuration suitable for financial services applications.
     * The configuration enables secure cross-origin requests from approved frontend
     * applications while maintaining strict security controls.
     * 
     * CORS Policy Details:
     * - Path Mapping: Applied to all endpoints ("/**") to ensure consistent behavior
     * - Allowed Origins: Configurable list of trusted domains from application properties
     * - HTTP Methods: Standard REST API methods (GET, POST, PUT, DELETE, OPTIONS, PATCH)
     * - Headers: All requested headers are allowed to support modern web application needs
     * - Credentials: Enabled to support authentication tokens and session-based authentication
     * - Max Age: Set to 3600 seconds (1 hour) to optimize preflight request caching
     * 
     * Security Rationale:
     * - Restricts origins to prevent unauthorized cross-origin access
     * - Supports credentials for OAuth2/JWT authentication flows
     * - Allows necessary headers for API functionality
     * - Caches preflight responses to reduce overhead
     * 
     * @param registry The CorsRegistry provided by Spring to configure CORS mappings
     * @throws IllegalArgumentException if allowedOrigins is null or empty
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Validate that allowed origins are configured
        if (allowedOrigins == null || allowedOrigins.length == 0) {
            throw new IllegalArgumentException(
                "CORS allowed origins must be configured. Please set 'cors.allowed-origins' in application properties."
            );
        }

        // Configure CORS mapping for all API Gateway endpoints
        registry.addMapping("/**")
                // Set allowed origins from configuration - supports multiple environments
                .allowedOrigins(allowedOrigins)
                
                // Allow standard HTTP methods used by REST APIs and modern web applications
                // GET: Retrieve resources
                // POST: Create new resources  
                // PUT: Update existing resources
                // DELETE: Remove resources
                // OPTIONS: Preflight requests for complex CORS requests
                // PATCH: Partial resource updates
                // HEAD: Retrieve headers only (useful for metadata checks)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                
                // Allow all requested headers to support:
                // - Content-Type for JSON/XML payloads
                // - Authorization for JWT tokens and API keys
                // - Custom headers used by the frontend application
                // - CSRF protection headers
                .allowedHeaders("*")
                
                // Allow credentials to support:
                // - HTTP cookies for session-based authentication
                // - Authorization headers for Bearer tokens
                // - Custom authentication headers
                // This is essential for OAuth2 and JWT authentication flows
                .allowCredentials(true)
                
                // Set maximum age for preflight request caching
                // 3600 seconds (1 hour) reduces the number of preflight requests
                // while maintaining reasonable security refresh intervals
                .maxAge(3600L)
                
                // Allow all response headers to be exposed to the frontend
                // This enables the client to access custom headers from API responses
                // such as pagination headers, rate limit information, etc.
                .exposedHeaders("*");
    }
}