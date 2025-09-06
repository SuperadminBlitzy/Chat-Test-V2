package com.ufs.auth.config;

import com.nimbusds.jose.jwk.JWKSet; // 9.31
import com.nimbusds.jose.jwk.RSAKey; // 9.31
import com.nimbusds.jose.jwk.source.ImmutableJWKSet; // 9.31
import com.nimbusds.jose.jwk.source.JWKSource; // 9.31
import com.nimbusds.jose.proc.SecurityContext; // 9.31
import org.springframework.beans.factory.annotation.Autowired; // 6.0.13
import org.springframework.context.annotation.Bean; // 6.0.13
import org.springframework.context.annotation.Configuration; // 6.0.13
import org.springframework.core.annotation.Order; // 6.0.13
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // 6.2.1
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // 6.2.1
import org.springframework.security.oauth2.core.AuthorizationGrantType; // 6.2.1
import org.springframework.security.oauth2.core.ClientAuthenticationMethod; // 6.2.1
import org.springframework.security.oauth2.core.oidc.OidcScopes; // 6.2.1
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository; // 1.2.1
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient; // 1.2.1
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository; // 1.2.1
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration; // 1.2.1
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer; // 1.2.1
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings; // 1.2.1
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings; // 1.2.1
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings; // 1.2.1
import org.springframework.security.web.SecurityFilterChain; // 6.2.1
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint; // 6.2.1
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher; // 6.2.1
import org.springframework.http.MediaType; // 6.2.1
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 6.2.1
import org.springframework.security.crypto.password.PasswordEncoder; // 6.2.1

import java.security.KeyPair; // 1.8
import java.security.KeyPairGenerator; // 1.8
import java.security.interfaces.RSAPrivateKey; // 1.8
import java.security.interfaces.RSAPublicKey; // 1.8
import java.time.Duration; // 1.8
import java.util.UUID; // 1.8

/**
 * OAuth2 Authorization Server Configuration Class
 * 
 * This configuration class provides the comprehensive setup for the OAuth2 Authorization Server
 * within the Unified Financial Services platform. It implements enterprise-grade security
 * standards required for financial services applications, including JWT token management,
 * client registration, and secure authorization endpoint configuration.
 * 
 * The configuration supports the F-004 Digital Customer Onboarding requirement by providing
 * secure authentication infrastructure for the onboarding process, and implements the core
 * Authentication & Authorization mechanisms for the entire platform.
 * 
 * Key Features:
 * - OAuth2 and OIDC compliant authorization server
 * - JWT token issuance and validation with RSA key pair
 * - Client registration and management
 * - Secure authorization endpoints with proper exception handling
 * - Integration with platform's JWT configuration
 * - Support for multiple grant types (authorization_code, refresh_token, client_credentials)
 * - PKCE support for enhanced security
 * - Comprehensive scope management (openid, profile, read, write)
 * 
 * Security Considerations:
 * - RSA-based JWT signing for enhanced security
 * - Proper client authentication methods
 * - Secure redirect URI validation
 * - Token expiration management
 * - Exception handling with proper redirection
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Configuration
@EnableWebSecurity
public class OAuth2Config {

    /**
     * JWT configuration properties injected from JwtConfig
     * Provides access to JWT-related configuration including secret, expiration times, and issuer
     */
    @Autowired
    private JwtConfig jwtConfig;

    /**
     * Creates and configures the repository for OAuth2 clients.
     * 
     * This implementation uses an in-memory repository for development and testing purposes.
     * For production environments, this should be replaced with a JDBC-based repository
     * to persist client configurations in the database for better scalability and management.
     * 
     * The configured client supports:
     * - Multiple authentication methods (client_secret_basic, client_secret_post)
     * - Authorization code grant with PKCE support
     * - Refresh token rotation for enhanced security
     * - Client credentials grant for service-to-service communication
     * - Comprehensive scope support for OIDC and custom scopes
     * - Secure redirect URI validation
     * - Token expiration aligned with security best practices
     * 
     * @return RegisteredClientRepository containing configured OAuth2 clients
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        // Create the primary UFS platform client configuration
        RegisteredClient ufsClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("ufs-client")
                .clientSecret(passwordEncoder().encode("ufs-secret-2024"))
                .clientAuthenticationMethods(authMethods -> {
                    authMethods.add(ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
                    authMethods.add(ClientAuthenticationMethod.CLIENT_SECRET_POST);
                })
                .authorizationGrantTypes(grantTypes -> {
                    grantTypes.add(AuthorizationGrantType.AUTHORIZATION_CODE);
                    grantTypes.add(AuthorizationGrantType.REFRESH_TOKEN);
                    grantTypes.add(AuthorizationGrantType.CLIENT_CREDENTIALS);
                })
                .redirectUris(redirectUris -> {
                    // Development and testing redirect URIs
                    redirectUris.add("http://localhost:3000/auth/callback");
                    redirectUris.add("http://localhost:8080/login/oauth2/code/ufs");
                    // Production redirect URIs
                    redirectUris.add("https://app.unifiedfinancialservices.com/auth/callback");
                    redirectUris.add("https://portal.unifiedfinancialservices.com/login/oauth2/code/ufs");
                })
                .postLogoutRedirectUris(logoutUris -> {
                    logoutUris.add("http://localhost:3000/");
                    logoutUris.add("https://app.unifiedfinancialservices.com/");
                })
                .scopes(scopes -> {
                    // Standard OIDC scopes
                    scopes.add(OidcScopes.OPENID);
                    scopes.add(OidcScopes.PROFILE);
                    scopes.add(OidcScopes.EMAIL);
                    // Custom application scopes
                    scopes.add("read");
                    scopes.add("write");
                    scopes.add("customer:read");
                    scopes.add("customer:write");
                    scopes.add("transactions:read");
                    scopes.add("accounts:read");
                    scopes.add("compliance:read");
                })
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(true)
                        .requireProofKey(true) // PKCE support for enhanced security
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofMillis(jwtConfig.getExpiration()))
                        .refreshTokenTimeToLive(Duration.ofMillis(jwtConfig.getRefreshExpiration()))
                        .reuseRefreshTokens(false) // Refresh token rotation for security
                        .build())
                .build();

        // Create additional client for mobile applications
        RegisteredClient mobileClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("ufs-mobile-client")
                .clientSecret(passwordEncoder().encode("ufs-mobile-secret-2024"))
                .clientAuthenticationMethods(authMethods -> {
                    authMethods.add(ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
                    authMethods.add(ClientAuthenticationMethod.NONE); // For public clients
                })
                .authorizationGrantTypes(grantTypes -> {
                    grantTypes.add(AuthorizationGrantType.AUTHORIZATION_CODE);
                    grantTypes.add(AuthorizationGrantType.REFRESH_TOKEN);
                })
                .redirectUris(redirectUris -> {
                    // Mobile application redirect URIs
                    redirectUris.add("com.ufs.mobile://oauth/callback");
                    redirectUris.add("http://localhost:3000/mobile/auth/callback");
                })
                .scopes(scopes -> {
                    scopes.add(OidcScopes.OPENID);
                    scopes.add(OidcScopes.PROFILE);
                    scopes.add(OidcScopes.EMAIL);
                    scopes.add("read");
                    scopes.add("customer:read");
                    scopes.add("transactions:read");
                    scopes.add("accounts:read");
                })
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false) // Streamlined mobile experience
                        .requireProofKey(true) // PKCE required for mobile clients
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofMinutes(15)) // Shorter duration for mobile
                        .refreshTokenTimeToLive(Duration.ofHours(24))
                        .reuseRefreshTokens(false)
                        .build())
                .build();

        // Create service-to-service client for internal microservices communication
        RegisteredClient serviceClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("ufs-service-client")
                .clientSecret(passwordEncoder().encode("ufs-service-secret-2024"))
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .scopes(scopes -> {
                    scopes.add("internal:read");
                    scopes.add("internal:write");
                    scopes.add("service:communication");
                })
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(1)) // Longer duration for service clients
                        .build())
                .build();

        return new InMemoryRegisteredClientRepository(ufsClient, mobileClient, serviceClient);
    }

    /**
     * Configures the security filter chain for the OAuth2 authorization server endpoints.
     * 
     * This configuration applies the default OAuth2 authorization server security settings
     * while customizing specific behaviors for the financial services platform:
     * - Enables OIDC 1.0 protocol support
     * - Configures exception handling to redirect unauthenticated users to login
     * - Sets up proper content negotiation for different client types
     * - Ensures secure endpoint access with appropriate authentication requirements
     * 
     * The filter chain has the highest precedence to ensure OAuth2 endpoints are
     * processed before other security configurations.
     * 
     * @param http HttpSecurity configuration object
     * @return SecurityFilterChain configured for OAuth2 authorization server
     * @throws Exception if configuration fails
     */
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        // Apply default OAuth2 authorization server security configuration
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        
        // Configure OAuth2 authorization server with OIDC support
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(oidc -> oidc
                        .providerConfigurationEndpoint(providerConfig -> providerConfig.enable())
                        .userInfoEndpoint(userInfo -> userInfo.enable())
                );

        // Configure exception handling for unauthenticated requests
        http.exceptionHandling(exceptions -> exceptions
                .defaultAuthenticationEntryPointFor(
                        new LoginUrlAuthenticationEntryPoint("/login"),
                        new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                )
        );

        // Accept access tokens for User Info and/or Client Registration
        http.oauth2ResourceServer(resourceServer -> resourceServer
                .jwt(jwt -> jwt.jwkSetUri("http://auth-service:9000/.well-known/jwks.json"))
        );

        return http.build();
    }

    /**
     * Configures the default security filter chain for non-OAuth2 endpoints.
     * 
     * This configuration handles authentication and authorization for standard
     * application endpoints outside of the OAuth2 authorization server paths.
     * 
     * @param http HttpSecurity configuration object
     * @return SecurityFilterChain for default application security
     * @throws Exception if configuration fails
     */
    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/.well-known/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(formLogin -> formLogin
                        .loginPage("/login")
                        .permitAll()
                );

        return http.build();
    }

    /**
     * Configures the settings for the OAuth2 authorization server.
     * 
     * This configuration defines the core settings for the authorization server including:
     * - Issuer URL for JWT token identification
     * - Authorization endpoint URL
     * - Token endpoint URL  
     * - User info endpoint URL
     * - JWK set endpoint URL
     * - OIDC provider configuration endpoint
     * 
     * The issuer URL is critical for JWT validation and should match the actual
     * deployment environment. For production, this should be the public-facing
     * domain of the authorization server.
     * 
     * @return AuthorizationServerSettings configured for the platform
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(jwtConfig.getIssuer() != null ? jwtConfig.getIssuer() : "http://auth-service:9000")
                .authorizationEndpoint("/oauth2/authorize")
                .tokenEndpoint("/oauth2/token")
                .tokenIntrospectionEndpoint("/oauth2/introspect")
                .tokenRevocationEndpoint("/oauth2/revoke")
                .userInfoEndpoint("/userinfo")
                .jwkSetEndpoint("/.well-known/jwks.json")
                .oidcProviderConfigurationEndpoint("/.well-known/openid_configuration")
                .oidcLogoutEndpoint("/connect/logout")
                .build();
    }

    /**
     * Creates the JWK source for JWT token signing and verification.
     * 
     * This method generates an RSA key pair for signing JWT tokens and creates
     * a JWK source that provides the public key for token verification. The RSA
     * algorithm provides enhanced security compared to HMAC-based signing and
     * allows for public key distribution for token verification by other services.
     * 
     * Key Features:
     * - 2048-bit RSA key pair generation
     * - JWK set with key ID for key rotation support
     * - Proper key usage specification (signing)
     * - Algorithm specification (RS256)
     * 
     * In production environments, consider:
     * - Storing keys in a secure key management system
     * - Implementing key rotation policies
     * - Using Hardware Security Modules (HSMs) for key generation
     * 
     * @return JWKSource containing the RSA key for JWT signing
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .algorithm(com.nimbusds.jose.JWSAlgorithm.RS256)
                .keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE)
                .build();
        
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    /**
     * Provides a password encoder for client secret encoding.
     * 
     * Uses BCrypt password encoder with default strength for secure password hashing.
     * BCrypt is recommended for financial applications due to its adaptive nature
     * and resistance to rainbow table attacks.
     * 
     * @return PasswordEncoder instance for secure password hashing
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Generates an RSA key pair for JWT token signing.
     * 
     * This method creates a 2048-bit RSA key pair using the platform's
     * default secure random number generator. The key pair is used for
     * JWT token signing and verification.
     * 
     * Security considerations:
     * - Uses 2048-bit key length for adequate security
     * - Utilizes platform's secure random number generator
     * - Key generation follows industry best practices
     * 
     * @return KeyPair containing RSA public and private keys
     * @throws IllegalStateException if key generation fails
     */
    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate RSA key pair for JWT signing", ex);
        }
        return keyPair;
    }
}