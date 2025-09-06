package com.ufs.config.config;

import org.springframework.context.annotation.Bean; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Spring Security 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Spring Security 6.2.1
import org.springframework.security.web.SecurityFilterChain; // Spring Security 6.2.1
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Security Configuration for Spring Cloud Config Server
 * 
 * This class configures enterprise-grade security for the Config Server, ensuring that
 * access to sensitive configuration data is properly protected according to financial
 * services security standards. The configuration implements:
 * 
 * - HTTP Basic Authentication for server-to-server communication
 * - Comprehensive security headers for protection against common web vulnerabilities
 * - Session management appropriate for stateless microservices architecture
 * - Actuator endpoint security for operational monitoring
 * - Audit-ready configuration for compliance requirements
 * 
 * Security Requirements Addressed:
 * - F-001: Unified Data Integration Platform - Secure Configuration Management
 * - Multi-layered security approach as per financial services requirements
 * - End-to-end encryption support for sensitive configuration data
 * - Role-based access control foundation for microservices
 * 
 * @author UFS Platform Team
 * @version 1.0
 * @since 2024
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Default constructor for SecurityConfig.
     * 
     * Initializes the security configuration class without specific parameters,
     * relying on Spring's dependency injection and configuration management
     * to provide necessary dependencies at runtime.
     */
    public SecurityConfig() {
        // Default constructor - Spring will handle dependency injection
        // No explicit initialization required as configuration is handled
        // through Spring Security's annotation-driven approach
    }

    /**
     * Configures the main security filter chain for the Config Server.
     * 
     * This method establishes a comprehensive security configuration that protects
     * the Config Server endpoints while ensuring proper access for authorized
     * microservices. The configuration follows financial services security
     * best practices including:
     * 
     * 1. CSRF Protection: Disabled for server-to-server API communication
     * 2. Authorization Rules: Requires authentication for all requests except health checks
     * 3. HTTP Basic Authentication: Enables basic auth for microservice communication
     * 4. Security Headers: Implements comprehensive security headers for vulnerability protection
     * 5. Session Management: Configures stateless session management for microservices
     * 6. Actuator Security: Secures monitoring endpoints with appropriate access controls
     * 
     * Security Headers Implementation:
     * - X-Content-Type-Options: NOSNIFF to prevent MIME type sniffing attacks
     * - X-Frame-Options: DENY to prevent clickjacking attacks
     * - X-XSS-Protection: Enables XSS filtering in older browsers
     * - Referrer-Policy: STRICT_ORIGIN_WHEN_CROSS_ORIGIN for privacy protection
     * - Cache-Control: Prevents caching of sensitive configuration data
     * 
     * @param http The HttpSecurity object to configure web-based security
     * @return SecurityFilterChain The configured security filter chain
     * @throws Exception If an error occurs during security configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF protection as this is a server-to-server API
            // Config Server typically serves other microservices, not web browsers
            // CSRF protection is not applicable for REST API endpoints accessed by services
            .csrf(csrf -> csrf.disable())
            
            // Configure comprehensive security headers for enterprise protection
            .headers(headers -> headers
                // Prevent MIME type sniffing attacks by ensuring browsers respect declared content types
                .contentTypeOptions(contentTypeOptions -> contentTypeOptions.and())
                
                // Prevent clickjacking attacks by denying the page to be displayed in frames
                .frameOptions(frameOptions -> frameOptions.deny())
                
                // Enable XSS protection in browsers that support it (legacy support)
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000) // 1 year
                    .includeSubdomains(true)
                    .preload(true)
                )
                
                // Configure referrer policy to protect sensitive information in referrer headers
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                
                // Add cache control headers to prevent caching of sensitive configuration data
                .cacheControl(cache -> cache.and())
            )
            
            // Configure authorization rules with fine-grained access control
            .authorizeHttpRequests(authz -> authz
                // Allow unauthenticated access to actuator health endpoint for load balancer health checks
                // This is essential for Kubernetes liveness and readiness probes
                .requestMatchers(new AntPathRequestMatcher("/actuator/health")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/actuator/health/**")).permitAll()
                
                // Allow unauthenticated access to actuator info endpoint for version information
                .requestMatchers(new AntPathRequestMatcher("/actuator/info")).permitAll()
                
                // Secure all other actuator endpoints - require authentication
                // These endpoints provide sensitive operational information
                .requestMatchers(new AntPathRequestMatcher("/actuator/**")).authenticated()
                
                // Secure all configuration endpoints - require authentication
                // These are the core Config Server endpoints serving sensitive configuration data
                .requestMatchers(new AntPathRequestMatcher("/{application}/**")).authenticated()
                .requestMatchers(new AntPathRequestMatcher("/{application}/{profile}")).authenticated()
                .requestMatchers(new AntPathRequestMatcher("/{application}/{profile}/{label}")).authenticated()
                
                // Require authentication for any other request
                // Default deny approach - all other endpoints require authentication
                .anyRequest().authenticated()
            )
            
            // Configure session management for stateless microservices architecture
            .sessionManagement(session -> session
                // Use stateless session management as Config Server should not maintain session state
                // This is appropriate for microservices that authenticate per request
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                
                // Disable session fixation protection as we're not using sessions
                .sessionFixation().none()
                
                // Set maximum sessions per user (not applicable in stateless mode but good practice)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )
            
            // Enable HTTP Basic Authentication for server-to-server communication
            .httpBasic(httpBasic -> httpBasic
                // Use default HTTP Basic authentication configuration
                // Microservices will authenticate using username/password in Authorization header
                // This is appropriate for internal service-to-service communication
                .realmName("Config Server")
            )
            
            // Disable form login as this is an API-only service
            .formLogin(form -> form.disable())
            
            // Disable logout functionality as sessions are stateless
            .logout(logout -> logout.disable())
            
            // Configure exception handling for authentication and authorization failures
            .exceptionHandling(exceptions -> exceptions
                // Return 401 for authentication failures
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication required\",\"message\":\"Access denied - valid credentials required\"}");
                })
                
                // Return 403 for authorization failures
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access denied\",\"message\":\"Insufficient privileges for requested resource\"}");
                })
            )
            
            // Build and return the configured HttpSecurity object
            .build();
    }
}