package com.ufs.auth.dto;

import com.ufs.auth.model.User;
import lombok.Data; // org.projectlombok:lombok:1.18.30
import lombok.Builder; // org.projectlombok:lombok:1.18.30

/**
 * Data Transfer Object (DTO) for returning a response after a successful user login.
 * This class represents the comprehensive authentication response sent to clients
 * upon successful authentication in the Unified Financial Services (UFS) platform.
 * 
 * The LoginResponse DTO encapsulates all necessary information required for
 * establishing an authenticated session, including:
 * - Access tokens for API authorization
 * - Refresh tokens for token renewal
 * - Complete user profile information
 * 
 * This DTO is a critical component of the digital customer onboarding process
 * (F-004) and serves as the foundation for subsequent authorized requests across
 * all financial services within the platform.
 * 
 * <h3>Security Considerations:</h3>
 * <ul>
 *   <li>Access tokens are JWT-based with configurable expiration times</li>
 *   <li>Refresh tokens enable secure token renewal without re-authentication</li>
 *   <li>User information is filtered to exclude sensitive credentials</li>
 *   <li>Response is designed to support OAuth2 and OpenID Connect standards</li>
 * </ul>
 * 
 * <h3>Compliance Features:</h3>
 * <ul>
 *   <li>Supports KYC/AML compliance workflows</li>
 *   <li>Enables audit trail generation for regulatory reporting</li>
 *   <li>Facilitates role-based access control (RBAC) implementation</li>
 *   <li>Compatible with multi-factor authentication (MFA) flows</li>
 * </ul>
 * 
 * <h3>Integration Points:</h3>
 * <ul>
 *   <li>Spring Security authentication framework</li>
 *   <li>JWT token management services</li>
 *   <li>API Gateway authorization filters</li>
 *   <li>Frontend application state management</li>
 * </ul>
 * 
 * <h3>Usage Example:</h3>
 * <pre>
 * LoginResponse response = LoginResponse.builder()
 *     .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
 *     .refreshToken("def502002a8c7b4f9c8d1e2f3a4b5c6d7e8f9...")
 *     .user(authenticatedUser)
 *     .build();
 * </pre>
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 * 
 * @see com.ufs.auth.model.User
 * @see org.springframework.security.core.userdetails.UserDetails
 */
@Data
@Builder
public class LoginResponse {
    
    /**
     * JWT access token for API authentication and authorization.
     * 
     * This token contains encoded user information and permissions that enable
     * the client to make authorized requests to protected endpoints across the
     * UFS platform. The access token is designed with a short lifespan for
     * security purposes and must be included in the Authorization header
     * of subsequent API requests.
     * 
     * <h4>Token Characteristics:</h4>
     * <ul>
     *   <li>Format: JSON Web Token (JWT) as per RFC 7519</li>
     *   <li>Encoding: Base64URL encoded with HMAC SHA-256 signature</li>
     *   <li>Expiration: Configurable (typically 15-60 minutes)</li>
     *   <li>Scope: Full platform access based on user authorities</li>
     * </ul>
     * 
     * <h4>Token Payload:</h4>
     * <ul>
     *   <li>Subject (sub): User ID</li>
     *   <li>Issued At (iat): Token creation timestamp</li>
     *   <li>Expiration (exp): Token expiry timestamp</li>
     *   <li>Authorities: User roles and permissions</li>
     *   <li>Custom claims: Additional user context as needed</li>
     * </ul>
     * 
     * <h4>Security Notes:</h4>
     * <ul>
     *   <li>Token should be transmitted only over HTTPS connections</li>
     *   <li>Client applications must securely store the token</li>
     *   <li>Token should be cleared upon user logout</li>
     *   <li>Server-side token validation occurs on each request</li>
     * </ul>
     */
    private String accessToken;
    
    /**
     * Refresh token for obtaining new access tokens without re-authentication.
     * 
     * The refresh token provides a secure mechanism for clients to obtain new
     * access tokens when the current token expires, without requiring the user
     * to re-enter their credentials. This token has a longer lifespan than
     * access tokens and is used exclusively for token renewal operations.
     * 
     * <h4>Token Characteristics:</h4>
     * <ul>
     *   <li>Format: Cryptographically secure random string</li>
     *   <li>Length: 256-bit entropy for maximum security</li>
     *   <li>Expiration: Long-lived (typically 30-90 days)</li>
     *   <li>Single-use: Consumed and replaced upon each refresh</li>
     * </ul>
     * 
     * <h4>Refresh Flow:</h4>
     * <ul>
     *   <li>Client detects access token expiration</li>
     *   <li>Client presents refresh token to token endpoint</li>
     *   <li>Server validates refresh token and user status</li>
     *   <li>Server issues new access token and refresh token pair</li>
     * </ul>
     * 
     * <h4>Security Considerations:</h4>
     * <ul>
     *   <li>Refresh tokens are stored securely on the server</li>
     *   <li>Token rotation prevents replay attacks</li>
     *   <li>Tokens are invalidated upon suspicious activity</li>
     *   <li>User logout invalidates all associated tokens</li>
     * </ul>
     * 
     * <h4>Compliance Features:</h4>
     * <ul>
     *   <li>Supports regulatory session timeout requirements</li>
     *   <li>Enables audit logging of token usage</li>
     *   <li>Facilitates compliance with PCI DSS standards</li>
     *   <li>Compatible with financial industry security frameworks</li>
     * </ul>
     */
    private String refreshToken;
    
    /**
     * Complete user profile information for the authenticated user.
     * 
     * This field contains the full User entity representing the authenticated
     * user, providing comprehensive profile information required by client
     * applications for personalization, authorization decisions, and user
     * interface customization. The user object includes all necessary data
     * for implementing role-based access control and compliance workflows.
     * 
     * <h4>Included User Information:</h4>
     * <ul>
     *   <li>User ID: Unique identifier for the user</li>
     *   <li>Username: Primary authentication identifier</li>
     *   <li>Email: Contact information and secondary identifier</li>
     *   <li>Enabled Status: Account activation state</li>
     *   <li>Authorities: Granted roles and permissions</li>
     * </ul>
     * 
     * <h4>Excluded Sensitive Data:</h4>
     * <ul>
     *   <li>Password: Never included in response objects</li>
     *   <li>Password Hash: Kept secure on server side</li>
     *   <li>Internal Security Tokens: Server-side only</li>
     *   <li>Audit Trail Details: Available through separate endpoints</li>
     * </ul>
     * 
     * <h4>Business Applications:</h4>
     * <ul>
     *   <li>Customer Dashboard: Personalized financial overview</li>
     *   <li>Advisor Workbench: Client relationship management</li>
     *   <li>Compliance Control: Regulatory oversight capabilities</li>
     *   <li>Risk Management: User-specific risk assessment</li>
     * </ul>
     * 
     * <h4>Integration Support:</h4>
     * <ul>
     *   <li>Frontend State Management: User context initialization</li>
     *   <li>API Authorization: Permission-based endpoint access</li>
     *   <li>Audit Logging: User activity tracking</li>
     *   <li>Analytics: User behavior and engagement metrics</li>
     * </ul>
     * 
     * <h4>Compliance and Regulatory:</h4>
     * <ul>
     *   <li>KYC/AML: Customer identification and verification status</li>
     *   <li>GDPR: Data subject rights and consent management</li>
     *   <li>PCI DSS: Cardholder data protection compliance</li>
     *   <li>SOC 2: Access control and user management</li>
     * </ul>
     * 
     * @see com.ufs.auth.model.User
     * @see org.springframework.security.core.userdetails.UserDetails
     */
    private User user;
    
    /**
     * Constructs a new LoginResponse with all required authentication components.
     * 
     * This constructor initializes a complete authentication response containing
     * all necessary tokens and user information for establishing an authenticated
     * session in the UFS platform. The constructor is automatically generated
     * by Lombok's @Builder annotation, providing a fluent API for object creation.
     * 
     * <h4>Parameter Validation:</h4>
     * <ul>
     *   <li>Access token must be non-null and valid JWT format</li>
     *   <li>Refresh token must be non-null and cryptographically secure</li>
     *   <li>User object must be non-null and fully populated</li>
     *   <li>All tokens must be associated with the provided user</li>
     * </ul>
     * 
     * <h4>Construction Process:</h4>
     * <ul>
     *   <li>Initialize the accessToken field with the provided JWT</li>
     *   <li>Initialize the refreshToken field with the secure token</li>
     *   <li>Initialize the user field with the authenticated user object</li>
     *   <li>Ensure all references are properly established</li>
     * </ul>
     * 
     * <h4>Usage Context:</h4>
     * <ul>
     *   <li>Successful user authentication flows</li>
     *   <li>Token refresh operations</li>
     *   <li>Single sign-on (SSO) implementations</li>
     *   <li>API gateway authentication responses</li>
     * </ul>
     * 
     * <h4>Post-Construction Validation:</h4>
     * <ul>
     *   <li>Verify token signature and expiration</li>
     *   <li>Confirm user account is active and enabled</li>
     *   <li>Validate authority assignments</li>
     *   <li>Ensure compliance with security policies</li>
     * </ul>
     * 
     * @param accessToken The JWT access token for API authorization
     *                   Must be a valid, signed JWT with appropriate claims
     * @param refreshToken The refresh token for token renewal operations
     *                    Must be a cryptographically secure random string
     * @param user The authenticated user object containing profile information
     *            Must be a complete User entity with all required fields
     * 
     * @throws IllegalArgumentException if any parameter is null or invalid
     * @throws SecurityException if tokens are not properly associated with user
     * 
     * @see lombok.Builder
     * @see com.ufs.auth.model.User
     */
    public LoginResponse(String accessToken, String refreshToken, User user) {
        // Initialize the accessToken field with the provided JWT token
        // This token will be used for subsequent API authentication
        this.accessToken = accessToken;
        
        // Initialize the refreshToken field with the secure refresh token
        // This token enables seamless token renewal without re-authentication
        this.refreshToken = refreshToken;
        
        // Initialize the user field with the authenticated user object
        // This provides complete user context for client applications
        this.user = user;
    }
}