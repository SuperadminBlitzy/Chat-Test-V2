package com.ufs.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties; // 3.2+
import org.springframework.context.annotation.Configuration; // 6.1+
import lombok.Data; // 1.18.30

/**
 * JWT Configuration Properties Class
 * 
 * This configuration class manages all JWT-related settings for the Unified Financial Services
 * authentication service. It centralizes JWT configuration properties including secret keys,
 * token expiration times, and issuer information to ensure consistent token management
 * across the application.
 * 
 * The class implements the enterprise-grade security requirements as specified in the
 * technical documentation, supporting OAuth2 and JWT-based authentication with proper
 * token lifecycle management including refresh token rotation.
 * 
 * Configuration properties are bound from the application.yml file under the 'jwt' prefix,
 * providing a clean separation between configuration and code while maintaining security
 * best practices for financial services applications.
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {

    /**
     * The secret key used for signing and verifying JWT tokens.
     * 
     * This is a critical security parameter that must be kept confidential and
     * should be sufficiently complex to prevent brute-force attacks. The secret
     * is used with HMAC-SHA algorithms to ensure token integrity and authenticity.
     * 
     * In production environments, this should be retrieved from secure configuration
     * management systems rather than plain text files.
     * 
     * Example application.yml configuration:
     * jwt:
     *   secret: "your-256-bit-secret-key-here"
     */
    private String secret;

    /**
     * The expiration time for access tokens in milliseconds.
     * 
     * Following financial services security best practices, access tokens should
     * have short lifespans to minimize exposure in case of token compromise.
     * The technical specification recommends short expiration times with refresh
     * token rotation for enhanced security.
     * 
     * Typical values:
     * - Development: 3600000 (1 hour)
     * - Production: 900000 (15 minutes)
     * 
     * Example application.yml configuration:
     * jwt:
     *   expiration: 900000
     */
    private long expiration;

    /**
     * The expiration time for refresh tokens in milliseconds.
     * 
     * Refresh tokens are used to obtain new access tokens when they expire,
     * allowing users to maintain authenticated sessions without frequent re-login.
     * These tokens have longer lifespans but should still be rotated regularly
     * for security purposes.
     * 
     * Typical values:
     * - Development: 604800000 (7 days)
     * - Production: 86400000 (24 hours)
     * 
     * Example application.yml configuration:
     * jwt:
     *   refreshExpiration: 86400000
     */
    private long refreshExpiration;

    /**
     * The issuer claim (iss) for JWT tokens.
     * 
     * This field identifies the principal that issued the JWT token, providing
     * traceability and enabling token validation against known issuers. This is
     * particularly important in microservices architectures where multiple
     * services may issue tokens.
     * 
     * The issuer should be a unique identifier, typically a URL or service name
     * that can be validated by consuming services.
     * 
     * Example application.yml configuration:
     * jwt:
     *   issuer: "https://auth.unifiedfinancialservices.com"
     */
    private String issuer;

    /**
     * Default constructor for the JwtConfig class.
     * 
     * Spring Boot will automatically populate the fields from the configuration
     * properties during application startup through the @ConfigurationProperties
     * annotation binding mechanism.
     */
    public JwtConfig() {
        // Default constructor - fields will be populated by Spring Boot
        // configuration properties binding mechanism
    }
}