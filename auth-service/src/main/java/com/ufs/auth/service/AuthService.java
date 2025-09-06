package com.ufs.auth.service;

import com.ufs.auth.dto.LoginRequest;
import com.ufs.auth.dto.LoginResponse;
import com.ufs.auth.dto.TokenRefreshRequest;
import com.ufs.auth.dto.TokenRefreshResponse;
import com.ufs.auth.exception.AuthenticationException;

/**
 * Authentication Service Interface for the Unified Financial Services (UFS) Platform.
 * 
 * This interface defines the core contract for authentication operations within the
 * financial services ecosystem, supporting both traditional login authentication and
 * JWT token refresh mechanisms. It serves as the backbone for secure user access
 * management across all financial services and applications.
 * 
 * <h2>Business Context</h2>
 * <p>
 * This service directly supports the following functional requirements:
 * </p>
 * <ul>
 *   <li><strong>F-004 Digital Customer Onboarding</strong> - Handles authentication
 *       part of the customer onboarding process including KYC/AML compliance checks</li>
 *   <li><strong>Authentication & Authorization (2.3.3)</strong> - Provides robust
 *       authentication mechanisms required by all platform features</li>
 *   <li><strong>Real-time Data Synchronization (F-001-RQ-001)</strong> - Enables
 *       secure access for real-time financial data operations</li>
 * </ul>
 * 
 * <h2>Security Architecture</h2>
 * <p>
 * The authentication service implements enterprise-grade security patterns including:
 * </p>
 * <ul>
 *   <li><strong>JWT-based Authentication</strong> - Stateless token-based security
 *       with configurable expiration times</li>
 *   <li><strong>OAuth2 Integration</strong> - Standards-compliant authentication flows
 *       supporting various client types</li>
 *   <li><strong>Refresh Token Mechanism</strong> - Secure token renewal without
 *       requiring re-authentication</li>
 *   <li><strong>Multi-layered Validation</strong> - Input validation, credential
 *       verification, and compliance checks</li>
 * </ul>
 * 
 * <h2>Performance Requirements</h2>
 * <p>
 * This service is designed to meet stringent financial services performance standards:
 * </p>
 * <ul>
 *   <li><strong>Response Time</strong> - Sub-500ms authentication for 99% of requests</li>
 *   <li><strong>Throughput</strong> - Support for 10,000+ transactions per second</li>
 *   <li><strong>Availability</strong> - 99.99% uptime for continuous financial operations</li>
 *   <li><strong>Scalability</strong> - Horizontal scaling for 10x growth capacity</li>
 * </ul>
 * 
 * <h2>Compliance Features</h2>
 * <p>
 * Authentication operations are designed to support regulatory compliance including:
 * </p>
 * <ul>
 *   <li><strong>KYC/AML Integration</strong> - Customer identification and verification
 *       during authentication flows</li>
 *   <li><strong>Audit Logging</strong> - Comprehensive authentication event logging
 *       for regulatory reporting</li>
 *   <li><strong>Risk-based Authentication</strong> - Dynamic security measures based
 *       on user risk profiles</li>
 *   <li><strong>Data Protection</strong> - GDPR, PCI DSS, and SOC2 compliant
 *       credential handling</li>
 * </ul>
 * 
 * <h2>Integration Points</h2>
 * <p>
 * This service integrates with multiple platform components:
 * </p>
 * <ul>
 *   <li><strong>Spring Security</strong> - Core authentication and authorization framework</li>
 *   <li><strong>User Repository</strong> - User credential and profile management</li>
 *   <li><strong>JWT Service</strong> - Token generation, validation, and management</li>
 *   <li><strong>Audit Service</strong> - Authentication event logging and monitoring</li>
 *   <li><strong>Risk Assessment Engine</strong> - Real-time risk evaluation during login</li>
 * </ul>
 * 
 * <h2>Usage Examples</h2>
 * <pre>
 * // Standard user authentication
 * LoginRequest request = new LoginRequest("user@example.com", "securePassword");
 * LoginResponse response = authService.login(request);
 * 
 * // Token refresh operation
 * TokenRefreshRequest refreshRequest = new TokenRefreshRequest(response.getRefreshToken());
 * TokenRefreshResponse refreshResponse = authService.refreshToken(refreshRequest);
 * </pre>
 * 
 * <h2>Error Handling</h2>
 * <p>
 * All authentication operations follow consistent error handling patterns:
 * </p>
 * <ul>
 *   <li><strong>AuthenticationException</strong> - Thrown for credential validation failures</li>
 *   <li><strong>Token Validation Errors</strong> - Comprehensive token verification</li>
 *   <li><strong>Rate Limiting</strong> - Protection against brute force attacks</li>
 *   <li><strong>Security Monitoring</strong> - Automated threat detection and response</li>
 * </ul>
 * 
 * @author UFS Authentication Service Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @see com.ufs.auth.dto.LoginRequest
 * @see com.ufs.auth.dto.LoginResponse
 * @see com.ufs.auth.dto.TokenRefreshRequest
 * @see com.ufs.auth.dto.TokenRefreshResponse
 * @see com.ufs.auth.exception.AuthenticationException
 * @see org.springframework.security.core.userdetails.UserDetails
 */
public interface AuthService {

    /**
     * Authenticates a user with the provided credentials and returns JWT tokens.
     * 
     * <p>
     * This method implements the core authentication flow for the UFS platform,
     * processing user credentials through multiple validation layers including
     * credential verification, account status checks, and optional risk assessment.
     * Upon successful authentication, the method generates both access and refresh
     * tokens following OAuth2 best practices.
     * </p>
     * 
     * <h3>Authentication Flow</h3>
     * <p>The authentication process follows these steps:</p>
     * <ol>
     *   <li><strong>Input Validation</strong> - Validates the LoginRequest structure
     *       and ensures all required fields are present and properly formatted</li>
     *   <li><strong>Credential Verification</strong> - Authenticates the user against
     *       the user repository using secure password comparison (BCrypt)</li>
     *   <li><strong>Account Status Check</strong> - Verifies that the user account
     *       is enabled and not subject to any restrictions</li>
     *   <li><strong>Risk Assessment</strong> - Performs optional risk-based authentication
     *       checks based on user behavior patterns and threat intelligence</li>
     *   <li><strong>Token Generation</strong> - Creates JWT access token and cryptographically
     *       secure refresh token with appropriate expiration times</li>
     *   <li><strong>Response Assembly</strong> - Constructs LoginResponse with tokens
     *       and filtered user profile information</li>
     * </ol>
     * 
     * <h3>Security Features</h3>
     * <ul>
     *   <li><strong>Credential Protection</strong> - Passwords are never stored or
     *       transmitted in plain text, using BCrypt for secure comparison</li>
     *   <li><strong>Rate Limiting</strong> - Implementation should include protection
     *       against brute force attacks through rate limiting mechanisms</li>
     *   <li><strong>Audit Logging</strong> - All authentication attempts are logged
     *       for security monitoring and compliance reporting</li>
     *   <li><strong>Token Security</strong> - JWT tokens include appropriate claims,
     *       signatures, and expiration times for secure API access</li>
     * </ul>
     * 
     * <h3>Performance Characteristics</h3>
     * <ul>
     *   <li><strong>Response Time</strong> - Target sub-500ms response time for
     *       99% of authentication requests</li>
     *   <li><strong>Throughput</strong> - Designed to handle 10,000+ authentication
     *       requests per second under peak load</li>
     *   <li><strong>Caching</strong> - Implementation may leverage caching for
     *       frequently accessed user data to improve performance</li>
     * </ul>
     * 
     * <h3>Compliance Integration</h3>
     * <ul>
     *   <li><strong>KYC/AML Checks</strong> - Authentication process integrates with
     *       customer identification and verification workflows</li>
     *   <li><strong>Digital Identity Verification</strong> - Supports F-004-RQ-001
     *       requirements for customer identity confirmation</li>
     *   <li><strong>Risk-based Authentication</strong> - Implements F-004-RQ-004
     *       risk assessment tools for adaptive authentication</li>
     * </ul>
     * 
     * <h3>Error Scenarios</h3>
     * <p>This method throws AuthenticationException in the following cases:</p>
     * <ul>
     *   <li><strong>Invalid Credentials</strong> - Username/password combination
     *       does not match any active user account</li>
     *   <li><strong>Account Disabled</strong> - User account has been disabled
     *       by administrators or compliance systems</li>
     *   <li><strong>Account Locked</strong> - Account is temporarily locked due
     *       to security concerns or failed login attempts</li>
     *   <li><strong>System Unavailable</strong> - Authentication system is
     *       temporarily unavailable or experiencing issues</li>
     * </ul>
     * 
     * <h3>Usage Example</h3>
     * <pre>
     * // Prepare login request with user credentials
     * LoginRequest loginRequest = new LoginRequest("customer@ufs.com", "securePassword123");
     * 
     * try {
     *     // Perform authentication
     *     LoginResponse response = authService.login(loginRequest);
     *     
     *     // Extract tokens for subsequent API calls
     *     String accessToken = response.getAccessToken();
     *     String refreshToken = response.getRefreshToken();
     *     User authenticatedUser = response.getUser();
     *     
     * } catch (AuthenticationException e) {
     *     // Handle authentication failure
     *     logger.warn("Authentication failed: {}", e.getMessage());
     *     // Implement appropriate error response to client
     * }
     * </pre>
     * 
     * @param loginRequest The login request containing user credentials (username/password).
     *                    Must not be null and must contain valid, non-blank credentials.
     *                    The request is validated using Jakarta Bean Validation annotations.
     * 
     * @return LoginResponse containing the generated JWT access token, refresh token,
     *         and complete user profile information. The response includes:
     *         <ul>
     *           <li>accessToken - JWT for API authorization (typically 15-60 minutes validity)</li>
     *           <li>refreshToken - Secure token for obtaining new access tokens</li>
     *           <li>user - Complete User entity with profile and authority information</li>
     *         </ul>
     * 
     * @throws AuthenticationException if authentication fails due to:
     *         <ul>
     *           <li>Invalid username or password credentials</li>
     *           <li>User account is disabled or locked</li>
     *           <li>Account does not meet current security policies</li>
     *           <li>System-level authentication errors</li>
     *         </ul>
     * 
     * @see com.ufs.auth.dto.LoginRequest
     * @see com.ufs.auth.dto.LoginResponse
     * @see com.ufs.auth.exception.AuthenticationException
     * @see org.springframework.security.authentication.AuthenticationManager
     */
    LoginResponse login(LoginRequest loginRequest) throws AuthenticationException;

    /**
     * Refreshes an expired JWT access token using a valid refresh token.
     * 
     * <p>
     * This method implements the OAuth2 refresh token flow, allowing clients to
     * obtain new access tokens without requiring user re-authentication. This
     * mechanism is essential for maintaining uninterrupted access to financial
     * services while adhering to security best practices of short-lived access tokens.
     * </p>
     * 
     * <h3>Token Refresh Flow</h3>
     * <p>The refresh process follows these steps:</p>
     * <ol>
     *   <li><strong>Refresh Token Validation</strong> - Validates the provided refresh
     *       token format, signature, and expiration status</li>
     *   <li><strong>Token Association Check</strong> - Verifies that the refresh token
     *       is associated with a valid, active user account</li>
     *   <li><strong>User Status Verification</strong> - Confirms that the associated
     *       user account is still enabled and has not been suspended</li>
     *   <li><strong>Authority Refresh</strong> - Re-evaluates user authorities and
     *       permissions to ensure current access rights</li>
     *   <li><strong>New Token Generation</strong> - Creates a new JWT access token
     *       with updated claims and extended validity period</li>
     *   <li><strong>Token Rotation</strong> - Optionally generates a new refresh token
     *       to implement token rotation security pattern</li>
     * </ol>
     * 
     * <h3>Security Features</h3>
     * <ul>
     *   <li><strong>Token Rotation</strong> - Each refresh operation may invalidate
     *       the current refresh token and issue a new one to prevent replay attacks</li>
     *   <li><strong>Cryptographic Validation</strong> - Refresh tokens undergo
     *       cryptographic verification to ensure authenticity and integrity</li>
     *   <li><strong>Expiration Enforcement</strong> - Expired refresh tokens are
     *       rejected, requiring full re-authentication</li>
     *   <li><strong>Rate Limiting</strong> - Protection against excessive refresh
     *       requests that could indicate malicious activity</li>
     * </ul>
     * 
     * <h3>Performance Optimization</h3>
     * <ul>
     *   <li><strong>Fast Validation</strong> - Token validation optimized for
     *       sub-500ms response times to meet real-time requirements</li>
     *   <li><strong>Caching Strategy</strong> - User information may be cached
     *       to reduce database queries during frequent refresh operations</li>
     *   <li><strong>Concurrent Processing</strong> - Thread-safe implementation
     *       to handle multiple simultaneous refresh requests</li>
     * </ul>
     * 
     * <h3>Compliance Considerations</h3>
     * <ul>
     *   <li><strong>Session Management</strong> - Supports regulatory requirements
     *       for session timeout and access control in financial services</li>
     *   <li><strong>Audit Trail</strong> - Token refresh operations are logged
     *       for security monitoring and compliance reporting</li>
     *   <li><strong>Access Review</strong> - Each refresh operation provides an
     *       opportunity to re-evaluate user access permissions</li>
     * </ul>
     * 
     * <h3>Error Scenarios</h3>
     * <p>This method throws AuthenticationException in the following cases:</p>
     * <ul>
     *   <li><strong>Invalid Refresh Token</strong> - Token format is malformed,
     *       signature is invalid, or token cannot be decrypted</li>
     *   <li><strong>Expired Refresh Token</strong> - Token has exceeded its
     *       configured lifetime and requires full re-authentication</li>
     *   <li><strong>Revoked Token</strong> - Token has been explicitly revoked
     *       due to security concerns or user logout</li>
     *   <li><strong>User Account Issues</strong> - Associated user account is
     *       disabled, locked, or no longer exists</li>
     *   <li><strong>System Errors</strong> - Token service is unavailable or
     *       experiencing technical difficulties</li>
     * </ul>
     * 
     * <h3>Usage Example</h3>
     * <pre>
     * // Client detects access token expiration
     * String currentRefreshToken = getCurrentRefreshToken();
     * TokenRefreshRequest refreshRequest = new TokenRefreshRequest(currentRefreshToken);
     * 
     * try {
     *     // Request new access token
     *     TokenRefreshResponse response = authService.refreshToken(refreshRequest);
     *     
     *     // Update stored tokens
     *     String newAccessToken = response.getAccessToken();
     *     String newRefreshToken = response.getRefreshToken();
     *     
     *     // Update authorization headers for subsequent requests
     *     updateAuthorizationToken(newAccessToken);
     *     storeRefreshToken(newRefreshToken);
     *     
     * } catch (AuthenticationException e) {
     *     // Refresh failed - redirect to login
     *     logger.info("Token refresh failed, redirecting to login: {}", e.getMessage());
     *     redirectToLogin();
     * }
     * </pre>
     * 
     * <h3>Best Practices</h3>
     * <ul>
     *   <li><strong>Proactive Refresh</strong> - Clients should refresh tokens
     *       before expiration to avoid service interruptions</li>
     *   <li><strong>Secure Storage</strong> - Refresh tokens must be stored securely
     *       on the client side to prevent unauthorized access</li>
     *   <li><strong>Error Handling</strong> - Clients should implement proper
     *       fallback mechanisms when refresh operations fail</li>
     *   <li><strong>Token Cleanup</strong> - Old tokens should be properly disposed
     *       of after successful refresh operations</li>
     * </ul>
     * 
     * @param refreshRequest The token refresh request containing the current refresh token.
     *                      Must not be null and must contain a valid, non-blank refresh
     *                      token that was previously issued by this authentication service.
     * 
     * @return TokenRefreshResponse containing the new JWT access token and potentially
     *         a new refresh token. The response includes:
     *         <ul>
     *           <li>accessToken - New JWT for API authorization with extended validity</li>
     *           <li>refreshToken - New refresh token if token rotation is enabled</li>
     *         </ul>
     * 
     * @throws AuthenticationException if token refresh fails due to:
     *         <ul>
     *           <li>Invalid, expired, or revoked refresh token</li>
     *           <li>Associated user account is disabled or suspended</li>
     *           <li>Token service is temporarily unavailable</li>
     *           <li>Security policy violations or suspicious activity detected</li>
     *         </ul>
     * 
     * @see com.ufs.auth.dto.TokenRefreshRequest
     * @see com.ufs.auth.dto.TokenRefreshResponse
     * @see com.ufs.auth.exception.AuthenticationException
     * @see org.springframework.security.oauth2.core.OAuth2RefreshToken
     */
    TokenRefreshResponse refreshToken(TokenRefreshRequest refreshRequest) throws AuthenticationException;
}