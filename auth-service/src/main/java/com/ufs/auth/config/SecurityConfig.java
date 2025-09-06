package com.ufs.auth.config;

import org.springframework.context.annotation.Bean; // spring-context v6.1.2
import org.springframework.context.annotation.Configuration; // spring-context v6.1.2
import org.springframework.security.authentication.AuthenticationManager; // spring-security-core v6.2.1
import org.springframework.security.authentication.AuthenticationProvider; // spring-security-core v6.2.1
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // spring-security-core v6.2.1
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration; // spring-security-config v6.2.1
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // spring-security-config v6.2.1
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // spring-security-config v6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // spring-security-config v6.2.1
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // spring-security-config v6.2.1
import org.springframework.security.config.http.SessionCreationPolicy; // spring-security-config v6.2.1
import org.springframework.security.core.userdetails.UserDetailsService; // spring-security-core v6.2.1
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // spring-security-crypto v6.2.1
import org.springframework.security.crypto.password.PasswordEncoder; // spring-security-crypto v6.2.1
import org.springframework.security.web.SecurityFilterChain; // spring-security-web v6.2.1
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // spring-security-web v6.2.1
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter; // spring-security-web v6.2.1
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter; // spring-security-web v6.2.1
import org.springframework.web.cors.CorsConfiguration; // spring-web v6.1.2
import org.springframework.web.cors.CorsConfigurationSource; // spring-web v6.1.2
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // spring-web v6.1.2
import org.springframework.beans.factory.annotation.Autowired; // spring-beans v6.1.2
import org.springframework.beans.factory.annotation.Value; // spring-beans v6.1.2

import com.ufs.auth.security.JwtAuthenticationEntryPoint; // Internal JWT entry point handler
import com.ufs.auth.security.JwtAuthenticationFilter; // Internal JWT authentication filter
import com.ufs.auth.security.CustomAccessDeniedHandler; // Internal access denied handler

import java.util.Arrays; // java.base
import java.util.List; // java.base

/**
 * Main security configuration class for the Unified Financial Services Platform auth-service.
 * 
 * This configuration implements enterprise-grade security measures including:
 * - OAuth2 and JWT-based authentication
 * - Role-Based Access Control (RBAC) with financial service roles
 * - Multi-Factor Authentication (MFA) support preparation
 * - Compliance with SOC2, PCI-DSS, and GDPR standards
 * - Financial industry security headers and protections
 * - Audit logging integration for regulatory compliance
 * - Session management for stateless microservices architecture
 * 
 * The configuration supports sub-second response times as required for
 * high-frequency financial transactions while maintaining security.
 * 
 * @author UFS Platform Team
 * @version 1.0
 * @since Spring Security 6.2.1
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    /**
     * User details service for loading user authentication and authorization information.
     * Integrates with the unified data platform for customer and staff authentication.
     */
    private final UserDetailsService userDetailsService;

    /**
     * JWT authentication filter for processing JWT tokens in requests.
     * Handles token validation, extraction, and user context setup.
     */
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Custom JWT authentication entry point for handling authentication failures.
     * Provides standardized error responses for unauthorized access attempts.
     */
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    /**
     * Custom access denied handler for authorization failures.
     * Implements audit logging for compliance and security monitoring.
     */
    @Autowired
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    /**
     * Allowed origins for CORS configuration.
     * Configurable for different deployment environments (dev, staging, production).
     */
    @Value("${security.cors.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    /**
     * JWT token validity period in seconds.
     * Configurable for different security policies and compliance requirements.
     */
    @Value("${security.jwt.expiration:3600}")
    private int jwtExpirationInSeconds;

    /**
     * Maximum number of concurrent sessions per user.
     * Helps prevent credential sharing and enhances security.
     */
    @Value("${security.session.maximum:1}")
    private int maximumSessions;

    /**
     * Constructs the SecurityConfig with required dependencies.
     * 
     * @param userDetailsService The user details service for authentication and authorization
     */
    public SecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Provides a BCrypt password encoder bean for secure password hashing.
     * 
     * BCrypt is chosen for its adaptive nature and resistance to rainbow table attacks,
     * crucial for financial services where password security is paramount for PCI-DSS compliance.
     * 
     * The strength is set to 12 rounds for optimal security-performance balance
     * in high-throughput financial environments.
     * 
     * @return A BCryptPasswordEncoder instance configured for financial services security requirements
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt strength 12 provides optimal security for financial services
        // while maintaining sub-second performance requirements
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Provides a DAO authentication provider bean configured for financial services.
     * 
     * Integrates with the unified data platform to authenticate users against
     * consolidated customer and employee databases. Supports both customer
     * authentication and internal staff authentication with appropriate role mappings.
     * 
     * @return A configured DaoAuthenticationProvider instance
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        
        // Set the custom user details service that integrates with unified data platform
        authProvider.setUserDetailsService(userDetailsService);
        
        // Set the BCrypt password encoder for secure password verification
        authProvider.setPasswordEncoder(passwordEncoder());
        
        // Enable hiding UserNotFound exceptions for security (prevents user enumeration)
        authProvider.setHideUserNotFoundExceptions(true);
        
        return authProvider;
    }

    /**
     * Provides the authentication manager bean from Spring Security configuration.
     * 
     * This manager coordinates the authentication process across all configured
     * authentication providers, supporting both traditional username/password
     * and future OAuth2/OpenID Connect integrations.
     * 
     * @param config The authentication configuration provided by Spring Security
     * @return The configured AuthenticationManager instance
     * @throws Exception If authentication manager cannot be retrieved
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) for the financial services platform.
     * 
     * Implements secure CORS policies that allow legitimate cross-origin requests
     * while preventing unauthorized access from malicious domains. Essential for
     * web-based financial applications and mobile app integrations.
     * 
     * @return Configured CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Configure allowed origins from environment-specific settings
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        
        // Allow standard HTTP methods for RESTful API operations
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow common headers including authorization and content-type
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "Accept", 
            "Origin", 
            "Access-Control-Request-Method", 
            "Access-Control-Request-Headers",
            "X-CSRF-TOKEN"
        ));
        
        // Expose custom headers for client applications
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "X-Total-Count", 
            "X-Page-Number", 
            "X-Page-Size"
        ));
        
        // Allow credentials for authenticated requests
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 30 minutes to improve performance
        configuration.setMaxAge(1800L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Configures the security filter chain for HTTP requests.
     * 
     * This is the core security configuration that implements:
     * - JWT-based stateless authentication
     * - Role-based authorization for different endpoints
     * - Financial industry security headers
     * - CSRF protection where appropriate
     * - Session management for microservices architecture
     * - Compliance with SOC2, PCI-DSS, and GDPR requirements
     * 
     * @param http The HttpSecurity configuration object
     * @return The configured SecurityFilterChain
     * @throws Exception If security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Configure CORS using the defined configuration source
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF for stateless JWT authentication
            // CSRF protection is not needed for JWT-based APIs as tokens are not stored in cookies
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure authorization rules for different endpoint patterns
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - Authentication and health checks
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register", 
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/verify-email",
                    "/api/auth/refresh-token",
                    "/actuator/health",
                    "/actuator/info",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                
                // MFA endpoints - require basic authentication
                .requestMatchers("/api/auth/mfa/**").authenticated()
                
                // OAuth2 endpoints - permit all for standard OAuth2 flows
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                
                // Admin endpoints - require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Compliance and audit endpoints - require COMPLIANCE_OFFICER role
                .requestMatchers("/api/compliance/**", "/api/audit/**").hasRole("COMPLIANCE_OFFICER")
                
                // Risk management endpoints - require RISK_MANAGER role
                .requestMatchers("/api/risk/**").hasRole("RISK_MANAGER")
                
                // Financial advisor endpoints - require ADVISOR role
                .requestMatchers("/api/advisor/**").hasRole("ADVISOR")
                
                // Customer service endpoints - require CUSTOMER_SERVICE role
                .requestMatchers("/api/customer-service/**").hasRole("CUSTOMER_SERVICE")
                
                // Customer-specific endpoints - require CUSTOMER role or higher
                .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "ADVISOR", "CUSTOMER_SERVICE")
                
                // All other authenticated endpoints
                .anyRequest().authenticated()
            )
            
            // Configure session management for stateless JWT authentication
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .maximumSessions(maximumSessions)
                .maxSessionsPreventsLogin(false)
            )
            
            // Set custom authentication entry point for JWT
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler)
            )
            
            // Configure security headers for financial services compliance
            .headers(headers -> headers
                // Prevent clickjacking attacks
                .frameOptions().deny()
                
                // Prevent MIME type sniffing
                .contentTypeOptions().and()
                
                // Configure XSS protection
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
                
                // Configure referrer policy for privacy
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                
                // Configure Content Security Policy for XSS protection
                .contentSecurityPolicy("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';")
                
                // Configure permissions policy
                .and()
                .httpHeadersConfigurer(httpHeaders -> httpHeaders
                    .addHeaderWriter((request, response) -> {
                        response.setHeader("Permissions-Policy", 
                            "geolocation=(), microphone=(), camera=(), payment=()");
                    })
                )
            )
            
            // Set the authentication provider
            .authenticationProvider(authenticationProvider())
            
            // Add JWT authentication filter before username/password authentication
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Build the security filter chain
            .build();
    }
}