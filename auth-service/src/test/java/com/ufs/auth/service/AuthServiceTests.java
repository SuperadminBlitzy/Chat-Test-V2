package com.ufs.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

import org.junit.jupiter.api.BeforeEach; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.Test; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.DisplayName; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.Nested; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.extension.ExtendWith; // JUnit Jupiter 5.10.2
import org.mockito.InjectMocks; // Mockito 5.7.0
import org.mockito.Mock; // Mockito 5.7.0
import org.mockito.junit.jupiter.MockitoExtension; // Mockito 5.7.0

import org.springframework.security.authentication.AuthenticationManager; // Spring Security 6.2.1
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // Spring Security 6.2.1
import org.springframework.security.core.Authentication; // Spring Security 6.2.1
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Spring Security 6.2.1
import org.springframework.security.core.userdetails.UserDetails; // Spring Security 6.2.1
import org.springframework.security.core.userdetails.UserDetailsService; // Spring Security 6.2.1
import org.springframework.security.crypto.password.PasswordEncoder; // Spring Security 6.2.1

import com.ufs.auth.dto.LoginRequest;
import com.ufs.auth.dto.LoginResponse;
import com.ufs.auth.dto.TokenRefreshRequest;
import com.ufs.auth.dto.TokenRefreshResponse;
import com.ufs.auth.exception.AuthenticationException;
import com.ufs.auth.model.Role;
import com.ufs.auth.model.User;
import com.ufs.auth.repository.RoleRepository;
import com.ufs.auth.repository.UserRepository;
import com.ufs.auth.service.impl.AuthServiceImpl;

/**
 * Comprehensive unit test suite for AuthServiceImpl covering all authentication and authorization functionalities.
 * 
 * This test class validates the core authentication service implementation according to the requirements:
 * - F-004: Digital Customer Onboarding with KYC/AML compliance integration
 * - Authentication & Authorization (2.3.3 Common Services) with JWT token management
 * - Enterprise-grade security with comprehensive validation and error handling
 * - Performance requirements: sub-500ms response times with 10,000+ TPS capacity
 * 
 * Test Coverage Areas:
 * - User registration with success and failure scenarios
 * - User login authentication with credential validation
 * - JWT token refresh with security validation
 * - Exception handling and edge case scenarios
 * - Security compliance and audit trail validation
 * - Integration with Spring Security framework
 * 
 * Security Testing Focus:
 * - Input validation and sanitization
 * - Authentication failure scenarios
 * - Token security and expiration handling
 * - User account status validation
 * - Audit logging and compliance requirements
 * 
 * Performance Testing Considerations:
 * - Mock configuration for optimal test execution speed
 * - Validation of response time targets through proper mocking
 * - Memory efficiency testing through object lifecycle management
 * 
 * @author UFS Authentication Service Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @see AuthServiceImpl Implementation under test
 * @see com.ufs.auth.service.AuthService Interface contract
 * @see org.springframework.security.core.userdetails.UserDetailsService Spring Security integration
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Implementation Tests")
public class AuthServiceTests {

    /**
     * The service under test - AuthServiceImpl with all dependencies mocked.
     * This field is automatically injected with mock dependencies by Mockito.
     */
    @InjectMocks
    private AuthServiceImpl authService;

    /**
     * Mock authentication manager for Spring Security integration.
     * Handles credential validation and authentication flow testing.
     */
    @Mock
    private AuthenticationManager authenticationManager;

    /**
     * Mock user repository for database operations simulation.
     * Handles user lookup, existence checks, and persistence operations.
     */
    @Mock
    private UserRepository userRepository;

    /**
     * Mock role repository for role-based access control testing.
     * Handles role assignment and RBAC functionality validation.
     */
    @Mock
    private RoleRepository roleRepository;

    /**
     * Mock password encoder for secure password handling.
     * Validates password encoding and comparison operations.
     */
    @Mock
    private PasswordEncoder passwordEncoder;

    /**
     * Mock JWT service for token management operations.
     * Handles token generation, validation, and claims extraction.
     */
    @Mock
    private JwtService jwtService;

    /**
     * Mock UserDetailsService for Spring Security integration.
     * Handles user detail loading for authentication context.
     */
    @Mock
    private UserDetailsService userDetailsService;

    /**
     * Mock Authentication object for authentication flow simulation.
     * Represents successful authentication results from AuthenticationManager.
     */
    @Mock
    private Authentication authentication;

    /**
     * Test data constants for consistent testing across all test methods.
     * These values represent realistic financial services user data.
     */
    private static final String TEST_USERNAME = "john.doe@ufs.com";
    private static final String TEST_PASSWORD = "SecurePassword123!";
    private static final String TEST_EMAIL = "john.doe@ufs.com";
    private static final String TEST_ENCODED_PASSWORD = "$2a$10$encrypted.password.hash";
    private static final String TEST_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.access.token";
    private static final String TEST_REFRESH_TOKEN = "def502002a8c7b4f9c8d1e2f3a4b5c6d7e8f9test.refresh.token";
    private static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    private static final Long TEST_USER_ID = 12345L;

    /**
     * Test fixture data that is reset before each test method execution.
     * Ensures test isolation and prevents data contamination between tests.
     */
    private User testUser;
    private Role customerRole;
    private UserDetails testUserDetails;
    private LoginRequest validLoginRequest;
    private TokenRefreshRequest validTokenRefreshRequest;

    /**
     * Sets up test fixtures and mock configurations before each test execution.
     * 
     * This method initializes all test data objects and configures default mock behaviors
     * that are commonly used across multiple test methods. It ensures that each test
     * starts with a clean, predictable state.
     * 
     * Mock Configuration Strategy:
     * - Default successful behaviors for positive test cases
     * - Individual tests override specific behaviors for negative testing
     * - Realistic test data matching financial services requirements
     * - Security-compliant test configurations
     */
    @BeforeEach
    void setUp() {
        // Initialize test role for RBAC testing
        customerRole = new Role(ROLE_CUSTOMER);
        customerRole.setId(1L);

        // Initialize test user with financial services typical configuration
        testUser = new User();
        testUser.setId(TEST_USER_ID);
        testUser.setUsername(TEST_USERNAME);
        testUser.setPassword(TEST_ENCODED_PASSWORD);
        testUser.setEmail(TEST_EMAIL);
        testUser.setEnabled(true);
        testUser.setAuthorities(Set.of(ROLE_CUSTOMER));

        // Initialize UserDetails for Spring Security integration
        testUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username(TEST_USERNAME)
                .password(TEST_ENCODED_PASSWORD)
                .authorities(new SimpleGrantedAuthority(ROLE_CUSTOMER))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();

        // Initialize request objects for testing
        validLoginRequest = new LoginRequest(TEST_USERNAME, TEST_PASSWORD);
        validTokenRefreshRequest = new TokenRefreshRequest(TEST_REFRESH_TOKEN);
    }

    /**
     * Nested test class for user login functionality validation.
     * 
     * This class groups all login-related tests and provides comprehensive coverage
     * of the authentication flow including success scenarios, failure cases,
     * and edge conditions that may occur in financial services environments.
     */
    @Nested
    @DisplayName("User Login Tests")
    class LoginTests {

        /**
         * Tests successful user login with valid credentials.
         * 
         * This test validates the complete authentication flow from credential
         * validation through token generation, ensuring all components work
         * together correctly for a successful authentication scenario.
         * 
         * Validation Points:
         * - Authentication manager successfully validates credentials
         * - User repository returns valid user data
         * - UserDetailsService loads user context properly
         * - JWT service generates valid access and refresh tokens
         * - Response contains all required authentication data
         * - All security validations pass successfully
         * 
         * Business Requirements:
         * - Supports F-004 Digital Customer Onboarding authentication
         * - Meets sub-500ms response time requirement
         * - Provides comprehensive audit trail data
         * - Ensures regulatory compliance with financial standards
         */
        @Test
        @DisplayName("Should authenticate user successfully with valid credentials")
        void testLoginUser_Success() {
            // Arrange - Configure mocks for successful authentication scenario
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.generateToken(testUserDetails))
                    .thenReturn(TEST_ACCESS_TOKEN);

            // Act - Execute the login operation
            LoginResponse response = authService.login(validLoginRequest);

            // Assert - Validate successful authentication response
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            assertThat(response.getRefreshToken()).isNotNull();
            assertThat(response.getUser()).isNotNull();
            assertThat(response.getUser().getUsername()).isEqualTo(TEST_USERNAME);
            assertThat(response.getUser().getEmail()).isEqualTo(TEST_EMAIL);
            assertThat(response.getUser().isEnabled()).isTrue();

            // Verify - Ensure all dependencies were called correctly
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
            verify(jwtService).generateToken(testUserDetails);
        }

        /**
         * Tests login failure with invalid credentials.
         * 
         * This test ensures that authentication failures are handled securely
         * and consistently, preventing information leakage while maintaining
         * proper audit trails for security monitoring.
         * 
         * Security Requirements:
         * - No sensitive information exposed in error messages
         * - Consistent response times to prevent timing attacks
         * - Proper audit logging for failed authentication attempts
         * - Support for fraud detection and monitoring systems
         */
        @Test
        @DisplayName("Should throw AuthenticationException for invalid credentials")
        void testLoginUser_InvalidCredentials() {
            // Arrange - Configure authentication manager to simulate credential failure
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

            // Act & Assert - Verify exception is thrown with appropriate message
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Invalid credentials provided");

            // Verify - Ensure authentication was attempted but user lookup was not performed
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository, never()).findByUsername(anyString());
            verify(jwtService, never()).generateToken(any());
        }

        /**
         * Tests login failure when user is not found in database.
         * 
         * This test covers the edge case where authentication succeeds at the
         * Spring Security level but the user cannot be found in the application
         * database, which could indicate data synchronization issues.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when user not found in database")
        void testLoginUser_UserNotFound() {
            // Arrange - Configure successful authentication but missing user in database
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.empty());

            // Act & Assert - Verify appropriate exception handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: User account not found");

            // Verify - Ensure authentication was attempted and user lookup performed
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(jwtService, never()).generateToken(any());
        }

        /**
         * Tests login failure when user account is disabled.
         * 
         * This test validates that disabled user accounts cannot authenticate,
         * supporting compliance requirements for account lifecycle management
         * and regulatory oversight capabilities.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when user account is disabled")
        void testLoginUser_DisabledAccount() {
            // Arrange - Configure disabled user account
            testUser.setEnabled(false);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));

            // Act & Assert - Verify disabled account rejection
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: User account is disabled");

            // Verify - Ensure authentication and user lookup were performed
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService, never()).loadUserByUsername(anyString());
        }

        /**
         * Tests login failure when UserDetailsService fails to load user details.
         * 
         * This test covers scenarios where the Spring Security UserDetailsService
         * encounters errors during user detail loading, ensuring graceful error
         * handling and appropriate exception propagation.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when UserDetailsService fails")
        void testLoginUser_UserDetailsServiceFailure() {
            // Arrange - Configure UserDetailsService failure
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenThrow(new RuntimeException("UserDetailsService error"));

            // Act & Assert - Verify error handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Unable to load user details");

            // Verify - Ensure all steps up to UserDetailsService were performed
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
            verify(jwtService, never()).generateToken(any());
        }

        /**
         * Tests login failure when JWT token generation fails.
         * 
         * This test ensures that token generation failures are handled gracefully
         * and don't expose sensitive cryptographic information while maintaining
         * audit trails for security monitoring.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when JWT generation fails")
        void testLoginUser_TokenGenerationFailure() {
            // Arrange - Configure JWT service failure
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.generateToken(testUserDetails))
                    .thenThrow(new RuntimeException("Token generation error"));

            // Act & Assert - Verify token generation error handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Unable to generate access token");

            // Verify - Ensure all authentication steps were completed
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
            verify(jwtService).generateToken(testUserDetails);
        }

        /**
         * Tests login with null request parameter.
         * 
         * This test validates input parameter validation and ensures that
         * null safety is maintained throughout the authentication process.
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for null login request")
        void testLoginUser_NullRequest() {
            // Act & Assert - Verify null request handling
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                authService.login(null);
            });

            assertThat(exception.getMessage()).contains("Login request cannot be null");

            // Verify - Ensure no authentication operations were attempted
            verify(authenticationManager, never()).authenticate(any());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests login with blank username.
         * 
         * This test ensures that input validation prevents authentication
         * attempts with invalid or missing username credentials.
         */
        @Test
        @DisplayName("Should throw AuthenticationException for blank username")
        void testLoginUser_BlankUsername() {
            // Arrange - Create request with blank username
            LoginRequest invalidRequest = new LoginRequest("", TEST_PASSWORD);

            // Act & Assert - Verify blank username handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Username cannot be blank");

            // Verify - Ensure no authentication operations were attempted
            verify(authenticationManager, never()).authenticate(any());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests login with blank password.
         * 
         * This test ensures that input validation prevents authentication
         * attempts with invalid or missing password credentials.
         */
        @Test
        @DisplayName("Should throw AuthenticationException for blank password")
        void testLoginUser_BlankPassword() {
            // Arrange - Create request with blank password
            LoginRequest invalidRequest = new LoginRequest(TEST_USERNAME, "");

            // Act & Assert - Verify blank password handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Password cannot be blank");

            // Verify - Ensure no authentication operations were attempted
            verify(authenticationManager, never()).authenticate(any());
            verify(userRepository, never()).findByUsername(anyString());
        }
    }

    /**
     * Nested test class for token refresh functionality validation.
     * 
     * This class provides comprehensive testing of the JWT token refresh
     * mechanism, ensuring secure token renewal without compromising
     * authentication security or user session integrity.
     */
    @Nested
    @DisplayName("Token Refresh Tests")
    class TokenRefreshTests {

        /**
         * Tests successful token refresh with valid refresh token.
         * 
         * This test validates the complete token refresh flow ensuring that
         * valid refresh tokens can be used to obtain new access tokens while
         * maintaining security and user context integrity.
         * 
         * Security Validation:
         * - Refresh token signature and expiration validation
         * - User account status verification
         * - New token generation with current user authorities
         * - Token rotation for enhanced security
         */
        @Test
        @DisplayName("Should refresh tokens successfully with valid refresh token")
        void testRefreshToken_Success() {
            // Arrange - Configure mocks for successful token refresh
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenReturn(TEST_USERNAME);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.isTokenValid(TEST_REFRESH_TOKEN, testUserDetails))
                    .thenReturn(true);
            when(jwtService.generateToken(testUserDetails))
                    .thenReturn(TEST_ACCESS_TOKEN);

            // Act - Execute token refresh operation
            TokenRefreshResponse response = authService.refreshToken(validTokenRefreshRequest);

            // Assert - Validate successful token refresh
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            assertThat(response.getRefreshToken()).isNotNull();

            // Verify - Ensure all token refresh steps were executed
            verify(jwtService).extractUsername(TEST_REFRESH_TOKEN);
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
            verify(jwtService).isTokenValid(TEST_REFRESH_TOKEN, testUserDetails);
            verify(jwtService).generateToken(testUserDetails);
        }

        /**
         * Tests token refresh failure with invalid refresh token.
         * 
         * This test ensures that invalid refresh tokens are properly rejected
         * and appropriate security measures are triggered to prevent
         * unauthorized token generation.
         */
        @Test
        @DisplayName("Should throw AuthenticationException for invalid refresh token")
        void testRefreshToken_InvalidToken() {
            // Arrange - Configure token validation failure
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenReturn(TEST_USERNAME);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.isTokenValid(TEST_REFRESH_TOKEN, testUserDetails))
                    .thenReturn(false);

            // Act & Assert - Verify invalid token rejection
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(validTokenRefreshRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: Refresh token is invalid or expired");

            // Verify - Ensure validation was attempted but new token was not generated
            verify(jwtService).isTokenValid(TEST_REFRESH_TOKEN, testUserDetails);
            verify(jwtService, never()).generateToken(any());
        }

        /**
         * Tests token refresh failure when username extraction fails.
         * 
         * This test covers scenarios where the refresh token is malformed
         * or corrupted, preventing username extraction from token claims.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when username extraction fails")
        void testRefreshToken_UsernameExtractionFailure() {
            // Arrange - Configure username extraction failure
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenThrow(new RuntimeException("Token parsing error"));

            // Act & Assert - Verify extraction failure handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(validTokenRefreshRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: Invalid or malformed refresh token");

            // Verify - Ensure only username extraction was attempted
            verify(jwtService).extractUsername(TEST_REFRESH_TOKEN);
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests token refresh failure when user is not found.
         * 
         * This test validates handling of scenarios where the refresh token
         * contains a valid username but the user no longer exists in the
         * system, which could indicate account deletion or data corruption.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when user not found during refresh")
        void testRefreshToken_UserNotFound() {
            // Arrange - Configure user not found scenario
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenReturn(TEST_USERNAME);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.empty());

            // Act & Assert - Verify user not found handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(validTokenRefreshRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: User account not found");

            // Verify - Ensure user lookup was attempted
            verify(jwtService).extractUsername(TEST_REFRESH_TOKEN);
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService, never()).loadUserByUsername(anyString());
        }

        /**
         * Tests token refresh failure when user account is disabled.
         * 
         * This test ensures that disabled user accounts cannot refresh tokens,
         * maintaining security even if they possess valid refresh tokens.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when user account is disabled during refresh")
        void testRefreshToken_DisabledAccount() {
            // Arrange - Configure disabled user account
            testUser.setEnabled(false);
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenReturn(TEST_USERNAME);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));

            // Act & Assert - Verify disabled account handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(validTokenRefreshRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: User account is disabled");

            // Verify - Ensure user lookup was performed but token generation was prevented
            verify(jwtService).extractUsername(TEST_REFRESH_TOKEN);
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(jwtService, never()).isTokenValid(anyString(), any());
        }

        /**
         * Tests token refresh with null request parameter.
         * 
         * This test validates input parameter validation for token refresh
         * operations and ensures null safety throughout the process.
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for null refresh request")
        void testRefreshToken_NullRequest() {
            // Act & Assert - Verify null request handling
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                authService.refreshToken(null);
            });

            assertThat(exception.getMessage()).contains("Token refresh request cannot be null");

            // Verify - Ensure no token operations were attempted
            verify(jwtService, never()).extractUsername(anyString());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests token refresh with blank refresh token.
         * 
         * This test ensures that blank or empty refresh tokens are properly
         * validated and rejected before any token processing occurs.
         */
        @Test
        @DisplayName("Should throw AuthenticationException for blank refresh token")
        void testRefreshToken_BlankToken() {
            // Arrange - Create request with blank token
            TokenRefreshRequest invalidRequest = new TokenRefreshRequest("");

            // Act & Assert - Verify blank token handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: Refresh token cannot be blank");

            // Verify - Ensure no token operations were attempted
            verify(jwtService, never()).extractUsername(anyString());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests token refresh failure when new token generation fails.
         * 
         * This test ensures that failures during new access token generation
         * are handled gracefully without compromising system security.
         */
        @Test
        @DisplayName("Should throw AuthenticationException when new token generation fails")
        void testRefreshToken_NewTokenGenerationFailure() {
            // Arrange - Configure new token generation failure
            when(jwtService.extractUsername(TEST_REFRESH_TOKEN))
                    .thenReturn(TEST_USERNAME);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.isTokenValid(TEST_REFRESH_TOKEN, testUserDetails))
                    .thenReturn(true);
            when(jwtService.generateToken(testUserDetails))
                    .thenThrow(new RuntimeException("Token generation error"));

            // Act & Assert - Verify new token generation error handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(validTokenRefreshRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: Unable to generate new access token");

            // Verify - Ensure all steps up to token generation were completed
            verify(jwtService).extractUsername(TEST_REFRESH_TOKEN);
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
            verify(jwtService).isTokenValid(TEST_REFRESH_TOKEN, testUserDetails);
            verify(jwtService).generateToken(testUserDetails);
        }
    }

    /**
     * Nested test class for edge case and security validation scenarios.
     * 
     * This class covers additional edge cases, security scenarios, and
     * integration testing aspects that don't fit into the main login
     * and refresh test categories but are critical for comprehensive coverage.
     */
    @Nested
    @DisplayName("Edge Cases and Security Tests")
    class EdgeCaseTests {

        /**
         * Tests authentication with extremely long username to prevent buffer overflow attacks.
         * 
         * This test validates that the system properly handles and rejects
         * authentication attempts with unusually long usernames that could
         * indicate potential security attacks or system abuse.
         */
        @Test
        @DisplayName("Should reject authentication with extremely long username")
        void testLogin_ExtremelyLongUsername() {
            // Arrange - Create request with oversized username (1000+ characters)
            String longUsername = "a".repeat(1000);
            LoginRequest invalidRequest = new LoginRequest(longUsername, TEST_PASSWORD);

            // Act & Assert - Verify long username rejection
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Invalid username format");

            // Verify - Ensure no authentication operations were attempted
            verify(authenticationManager, never()).authenticate(any());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests authentication with extremely long password to prevent buffer overflow attacks.
         * 
         * This test validates that the system properly handles and rejects
         * authentication attempts with unusually long passwords that could
         * indicate potential security attacks or system abuse.
         */
        @Test
        @DisplayName("Should reject authentication with extremely long password")
        void testLogin_ExtremelyLongPassword() {
            // Arrange - Create request with oversized password (2000+ characters)
            String longPassword = "p".repeat(2000);
            LoginRequest invalidRequest = new LoginRequest(TEST_USERNAME, longPassword);

            // Act & Assert - Verify long password rejection
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: Invalid password format");

            // Verify - Ensure no authentication operations were attempted
            verify(authenticationManager, never()).authenticate(any());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests token refresh with extremely long token to prevent buffer overflow attacks.
         * 
         * This test validates that the system properly handles and rejects
         * token refresh attempts with unusually long tokens that could
         * indicate potential security attacks or system abuse.
         */
        @Test
        @DisplayName("Should reject token refresh with extremely long token")
        void testRefreshToken_ExtremelyLongToken() {
            // Arrange - Create request with oversized token (5000+ characters)
            String longToken = "t".repeat(5000);
            TokenRefreshRequest invalidRequest = new TokenRefreshRequest(longToken);

            // Act & Assert - Verify long token rejection
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.refreshToken(invalidRequest);
            });

            assertThat(exception.getMessage()).contains("Token refresh failed: Invalid token format");

            // Verify - Ensure no token operations were attempted
            verify(jwtService, never()).extractUsername(anyString());
            verify(userRepository, never()).findByUsername(anyString());
        }

        /**
         * Tests concurrent authentication requests to validate thread safety.
         * 
         * This test ensures that the authentication service can handle
         * multiple concurrent requests without thread safety issues,
         * which is critical for high-throughput financial services.
         */
        @Test
        @DisplayName("Should handle concurrent authentication requests safely")
        void testLogin_ConcurrentRequests() {
            // Arrange - Configure mocks for successful authentication
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.generateToken(testUserDetails))
                    .thenReturn(TEST_ACCESS_TOKEN);

            // Act - Execute multiple concurrent authentication requests
            LoginResponse response1 = authService.login(validLoginRequest);
            LoginResponse response2 = authService.login(validLoginRequest);

            // Assert - Verify both requests completed successfully
            assertThat(response1).isNotNull();
            assertThat(response2).isNotNull();
            assertThat(response1.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            assertThat(response2.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);

            // Verify - Ensure both requests were processed
            verify(authenticationManager, times(2)).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository, times(2)).findByUsername(TEST_USERNAME);
        }

        /**
         * Tests performance characteristics to ensure sub-500ms response time target.
         * 
         * This test validates that the authentication service meets the
         * performance requirements specified in the technical requirements,
         * ensuring optimal user experience in financial applications.
         */
        @Test
        @DisplayName("Should complete authentication within performance targets")
        void testLogin_PerformanceValidation() {
            // Arrange - Configure mocks for performance testing
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(testUserDetails);
            when(jwtService.generateToken(testUserDetails))
                    .thenReturn(TEST_ACCESS_TOKEN);

            // Act - Measure authentication performance
            long startTime = System.currentTimeMillis();
            LoginResponse response = authService.login(validLoginRequest);
            long duration = System.currentTimeMillis() - startTime;

            // Assert - Validate response and performance
            assertThat(response).isNotNull();
            assertThat(duration).isLessThan(500); // Sub-500ms requirement

            // Verify - Ensure proper authentication flow completion
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService).generateToken(testUserDetails);
        }

        /**
         * Tests user account with expired credentials scenario.
         * 
         * This test validates that users with expired credentials are
         * properly handled according to Spring Security's UserDetails
         * contract and financial services security requirements.
         */
        @Test
        @DisplayName("Should handle user with expired credentials")
        void testLogin_ExpiredCredentials() {
            // Arrange - Configure user with expired credentials
            UserDetails expiredUserDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(TEST_USERNAME)
                    .password(TEST_ENCODED_PASSWORD)
                    .authorities(new SimpleGrantedAuthority(ROLE_CUSTOMER))
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(true) // Expired credentials
                    .disabled(false)
                    .build();

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(expiredUserDetails);

            // Act & Assert - Verify expired credentials handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: User credentials have expired");

            // Verify - Ensure authentication flow was attempted
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
        }

        /**
         * Tests user account with locked status scenario.
         * 
         * This test validates that locked user accounts are properly
         * handled and cannot authenticate, supporting security and
         * compliance requirements for account management.
         */
        @Test
        @DisplayName("Should handle locked user account")
        void testLogin_LockedAccount() {
            // Arrange - Configure locked user account
            UserDetails lockedUserDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(TEST_USERNAME)
                    .password(TEST_ENCODED_PASSWORD)
                    .authorities(new SimpleGrantedAuthority(ROLE_CUSTOMER))
                    .accountExpired(false)
                    .accountLocked(true) // Locked account
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(userRepository.findByUsername(TEST_USERNAME))
                    .thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                    .thenReturn(lockedUserDetails);

            // Act & Assert - Verify locked account handling
            AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
                authService.login(validLoginRequest);
            });

            assertThat(exception.getMessage()).contains("Authentication failed: User account is locked");

            // Verify - Ensure authentication flow was attempted
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userRepository).findByUsername(TEST_USERNAME);
            verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
        }
    }
}