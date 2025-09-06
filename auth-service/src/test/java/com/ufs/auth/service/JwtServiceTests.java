package com.ufs.auth.service;

import com.ufs.auth.service.impl.JwtServiceImpl;
import com.ufs.auth.config.JwtConfig;
import com.ufs.auth.model.User;
import org.junit.jupiter.api.Test; // junit-jupiter-api 5.10+
import org.junit.jupiter.api.BeforeEach; // junit-jupiter-api 5.10+
import org.junit.jupiter.api.DisplayName; // junit-jupiter-api 5.10+
import org.junit.jupiter.api.extension.ExtendWith; // junit-jupiter-api 5.10+
import org.mockito.junit.jupiter.MockitoExtension; // mockito-junit-jupiter 5.7+
import org.mockito.Mock; // mockito-core 5.7+
import org.mockito.InjectMocks; // mockito-core 5.7+
import static org.mockito.Mockito.when; // mockito-core 5.7+
import static org.assertj.core.api.Assertions.assertThat; // assertj-core 3.24+
import static org.assertj.core.api.Assertions.assertThatThrownBy; // assertj-core 3.24+
import org.springframework.security.core.userdetails.UserDetails; // spring-security-core 6.2+
import org.springframework.security.core.authority.SimpleGrantedAuthority; // spring-security-core 6.2+
import io.jsonwebtoken.Claims; // jjwt-api 0.11.5
import io.jsonwebtoken.Jwts; // jjwt-api 0.11.5
import io.jsonwebtoken.io.Decoders; // jjwt-api 0.11.5
import io.jsonwebtoken.security.Keys; // jjwt-api 0.11.5

import java.util.Set;
import java.util.Date;
import java.util.List;
import java.security.Key;

/**
 * Comprehensive unit tests for the JwtServiceImpl class.
 * 
 * This test suite validates the core JWT functionality including token generation,
 * validation, and claims extraction for the Unified Financial Services Platform.
 * The tests ensure compliance with enterprise security requirements and financial
 * industry standards for authentication and authorization.
 * 
 * Test Coverage:
 * - JWT token generation with user details and authorities
 * - Token validation against user credentials and expiration
 * - Username extraction from valid and invalid tokens
 * - Claims extraction with type safety and error handling
 * - Edge cases including expired, malformed, and null tokens
 * - Security validation for financial services compliance
 * 
 * Testing Framework:
 * - JUnit 5 for modern testing capabilities and improved assertions
 * - Mockito for dependency mocking and behavior verification
 * - AssertJ for fluent and readable test assertions
 * - Spring Security integration for UserDetails testing
 * 
 * Security Testing Focus:
 * - Token integrity and signature validation
 * - Expiration time enforcement and validation
 * - Malformed token rejection and error handling
 * - User account status validation integration
 * - Claims extraction security and type safety
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JWT Service Implementation Tests")
public class JwtServiceTests {

    /**
     * Mock JWT configuration containing secret keys, expiration times, and issuer information.
     * This mock allows for controlled testing of different configuration scenarios
     * without requiring actual application.yml properties during unit testing.
     */
    @Mock
    private JwtConfig jwtConfig;

    /**
     * The JWT service implementation under test with mocked dependencies injected.
     * Mockito automatically injects the mocked JwtConfig into the service constructor,
     * enabling isolated testing of the service logic without external dependencies.
     */
    @InjectMocks
    private JwtServiceImpl jwtService;

    // Test data constants for consistent and readable test setup
    private static final String TEST_USERNAME = "john.doe@example.com";
    private static final String TEST_PASSWORD = "$2a$10$encrypted.password.hash";
    private static final String TEST_EMAIL = "john.doe@example.com";
    private static final String TEST_SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdGluZy1wdXJwb3Nlcy1vbmx5LTI1Ni1iaXRz"; // Base64 encoded 256-bit test key
    private static final long TEST_EXPIRATION = 900000L; // 15 minutes in milliseconds
    private static final String TEST_ISSUER = "https://auth.unifiedfinancialservices.com";
    private static final Set<String> TEST_AUTHORITIES = Set.of("ROLE_CUSTOMER", "ROLE_USER");

    // Test user instance for consistent test data across test methods
    private User testUser;
    private UserDetails testUserDetails;

    /**
     * Initializes test data and configures mock behavior before each test execution.
     * 
     * This method sets up a consistent testing environment by creating test user objects
     * and configuring the mocked JwtConfig with realistic values that match production
     * configuration patterns. The setup ensures each test starts with a clean state
     * and predictable mock behavior.
     * 
     * Mock Configuration:
     * - Secret key: Base64-encoded 256-bit key for HMAC-SHA256 signing
     * - Expiration: 15 minutes (recommended for production financial services)
     * - Issuer: Financial services authentication service identifier
     * 
     * Test User Setup:
     * - Username: Email-based authentication pattern common in financial services
     * - Password: BCrypt-hashed password following security best practices
     * - Authorities: Role-based permissions for financial service access
     * - Account status: Enabled and in good standing for positive test scenarios
     */
    @BeforeEach
    @DisplayName("Setup test environment and mock configuration")
    void setUp() {
        // Configure the mocked JwtConfig with realistic production-like values
        // These values match the recommended configuration for financial services
        when(jwtConfig.getSecret()).thenReturn(TEST_SECRET);
        when(jwtConfig.getExpiration()).thenReturn(TEST_EXPIRATION);
        when(jwtConfig.getIssuer()).thenReturn(TEST_ISSUER);
        
        // Create a test user with comprehensive financial service user profile
        // This user represents a typical customer with appropriate authorities
        testUser = new User(
            TEST_USERNAME,
            TEST_PASSWORD,
            TEST_EMAIL,
            true, // Account enabled for positive test scenarios
            TEST_AUTHORITIES
        );
        
        // Set user ID for complete entity setup (simulating database persistence)
        testUser.setId(1L);
        
        // Use the User object as UserDetails since it implements the interface
        // This tests the actual integration between our User entity and Spring Security
        testUserDetails = testUser;
    }

    /**
     * Tests that a valid JWT is generated for a given UserDetails object.
     * 
     * This test validates the core token generation functionality by creating a JWT
     * for a valid user and verifying that the token meets enterprise security standards.
     * The test ensures the token contains proper claims, is correctly signed, and
     * includes user authorities for role-based access control.
     * 
     * Validation Criteria:
     * - Token is not null or empty (successful generation)
     * - Token can be parsed without exceptions (valid JWT format)
     * - Token contains correct username in subject claim
     * - Token includes user authorities for authorization
     * - Token has proper expiration time within acceptable range
     * - Token is cryptographically signed and verifiable
     * 
     * Security Verification:
     * - Signature validation using the same secret key
     * - Claims structure compliance with JWT standards
     * - Authority inclusion for role-based access control
     * - Expiration time enforcement for session management
     */
    @Test
    @DisplayName("Should generate a valid JWT for a user")
    void testGenerateToken_whenValidUserDetails_thenReturnsToken() {
        // Act: Generate token using the JWT service with test user details
        String generatedToken = jwtService.generateToken(testUserDetails);
        
        // Assert: Verify token was successfully generated
        assertThat(generatedToken)
            .as("Generated token should not be null")
            .isNotNull();
        
        assertThat(generatedToken)
            .as("Generated token should not be empty")
            .isNotEmpty();
        
        // Verify token format follows JWT standard (header.payload.signature)
        assertThat(generatedToken.split("\\."))
            .as("JWT should have exactly 3 parts separated by dots")
            .hasSize(3);
        
        // Parse and validate the generated token to ensure it's properly structured
        Key signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET));
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(signingKey)
            .build()
            .parseClaimsJws(generatedToken)
            .getBody();
        
        // Verify token contains correct user information
        assertThat(claims.getSubject())
            .as("Token subject should match username")
            .isEqualTo(TEST_USERNAME);
        
        assertThat(claims.getIssuer())
            .as("Token issuer should match configuration")
            .isEqualTo(TEST_ISSUER);
        
        // Verify token contains user authorities for authorization
        List<String> tokenAuthorities = claims.get("authorities", List.class);
        assertThat(tokenAuthorities)
            .as("Token should contain user authorities")
            .isNotNull()
            .isNotEmpty()
            .containsExactlyInAnyOrder("ROLE_CUSTOMER", "ROLE_USER");
        
        // Verify expiration time is properly set
        assertThat(claims.getExpiration())
            .as("Token should have expiration time")
            .isNotNull()
            .isAfter(new Date()); // Should expire in the future
        
        // Verify issued at time is reasonable (within last minute)
        assertThat(claims.getIssuedAt())
            .as("Token should have issued at time")
            .isNotNull()
            .isBeforeOrEqualTo(new Date())
            .isAfter(new Date(System.currentTimeMillis() - 60000)); // Within last minute
    }

    /**
     * Tests that a valid token is correctly validated.
     * 
     * This test ensures the token validation process correctly identifies valid tokens
     * and confirms all security checks pass for legitimate authentication scenarios.
     * The test covers the complete validation workflow including signature verification,
     * expiration checking, and user account status validation.
     * 
     * Validation Process:
     * 1. Generate a fresh token for the test user
     * 2. Immediately validate the token against the same user
     * 3. Verify all validation criteria pass successfully
     * 4. Confirm the validation result is true for valid scenarios
     * 
     * Security Checks Verified:
     * - Cryptographic signature integrity validation
     * - Token expiration time compliance
     * - Username consistency between token and user
     * - User account status verification (enabled, non-expired, non-locked)
     * - Overall token legitimacy for authentication workflows
     */
    @Test
    @DisplayName("Should return true for a valid token")
    void testValidateToken_whenTokenIsValid_thenReturnsTrue() {
        // Arrange: Generate a fresh token for validation testing
        String validToken = jwtService.generateToken(testUserDetails);
        
        // Act: Validate the token against the same user details
        boolean isValid = jwtService.isTokenValid(validToken, testUserDetails);
        
        // Assert: Verify validation returns true for legitimate token
        assertThat(isValid)
            .as("Valid token should pass validation")
            .isTrue();
        
        // Additional validation to ensure token properties are accessible
        String extractedUsername = jwtService.extractUsername(validToken);
        assertThat(extractedUsername)
            .as("Username should be extractable from valid token")
            .isEqualTo(TEST_USERNAME);
        
        // Verify claims can be extracted successfully
        Date expiration = jwtService.extractClaim(validToken, Claims::getExpiration);
        assertThat(expiration)
            .as("Expiration should be extractable from valid token")
            .isNotNull()
            .isAfter(new Date()); // Should be in the future
    }

    /**
     * Tests that an expired token is correctly identified as invalid.
     * 
     * This test validates the token expiration enforcement mechanism by creating
     * a token with a very short expiration time, waiting for it to expire, and
     * verifying that the validation process correctly rejects expired tokens.
     * This is critical for maintaining session security in financial services.
     * 
     * Expiration Testing Strategy:
     * 1. Configure mock with very short expiration time (1 millisecond)
     * 2. Generate token with short-lived configuration
     * 3. Wait sufficient time to ensure token expiration
     * 4. Validate that expired token is rejected
     * 5. Verify validation returns false for expired tokens
     * 
     * Security Implications:
     * - Prevents use of old tokens after expiration
     * - Enforces session timeout policies for financial services
     * - Protects against token replay attacks with expired credentials
     * - Ensures compliance with security token lifecycle management
     */
    @Test
    @DisplayName("Should return false for an expired token")
    void testValidateToken_whenTokenIsExpired_thenReturnsFalse() throws InterruptedException {
        // Arrange: Configure mock with very short expiration time for testing
        when(jwtConfig.getExpiration()).thenReturn(1L); // 1 millisecond expiration
        
        // Create a new service instance with the short expiration configuration
        JwtServiceImpl shortExpiryService = new JwtServiceImpl(jwtConfig);
        
        // Generate token with short expiration time
        String shortLivedToken = shortExpiryService.generateToken(testUserDetails);
        
        // Wait for token to expire (adding buffer time to ensure expiration)
        Thread.sleep(10); // 10 milliseconds to ensure token has expired
        
        // Act: Attempt to validate the expired token
        boolean isValid = shortExpiryService.isTokenValid(shortLivedToken, testUserDetails);
        
        // Assert: Verify expired token is rejected
        assertThat(isValid)
            .as("Expired token should fail validation")
            .isFalse();
        
        // Additional verification: ensure token was properly generated but is now expired
        String extractedUsername = shortExpiryService.extractUsername(shortLivedToken);
        assertThat(extractedUsername)
            .as("Username should still be extractable from expired token")
            .isEqualTo(TEST_USERNAME);
        
        // Verify expiration time is in the past
        Date expiration = shortExpiryService.extractClaim(shortLivedToken, Claims::getExpiration);
        assertThat(expiration)
            .as("Token expiration should be in the past")
            .isNotNull()
            .isBefore(new Date()); // Should be in the past
    }

    /**
     * Tests that a malformed token is correctly identified as invalid.
     * 
     * This test ensures the JWT service properly handles and rejects malformed
     * tokens that don't conform to JWT standards. This includes tokens with
     * invalid format, corrupted signatures, or incomplete structure. Proper
     * handling of malformed tokens is essential for security and stability.
     * 
     * Malformed Token Scenarios:
     * - Completely invalid token strings
     * - Tokens with incorrect number of segments
     * - Tokens with corrupted base64 encoding
     * - Null and empty token values
     * - Tokens with tampered signatures
     * 
     * Security Protection:
     * - Prevents parsing errors from crashing the application
     * - Rejects tampered or corrupted authentication attempts
     * - Maintains system stability under malicious input
     * - Provides consistent error handling for invalid tokens
     */
    @Test
    @DisplayName("Should return false for a malformed token")
    void testValidateToken_whenTokenIsMalformed_thenReturnsFalse() {
        // Test various malformed token scenarios
        String[] malformedTokens = {
            "invalid.token.format",
            "not-a-jwt-token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.signature",
            "incomplete.token",
            "",
            "   ", // Whitespace only
            "single-segment",
            "two.segments", // Missing third segment
            "header.payload.signature.extra" // Too many segments
        };
        
        for (String malformedToken : malformedTokens) {
            // Act: Attempt to validate malformed token
            boolean isValid = jwtService.isTokenValid(malformedToken, testUserDetails);
            
            // Assert: Verify malformed token is rejected
            assertThat(isValid)
                .as("Malformed token '%s' should fail validation", malformedToken)
                .isFalse();
        }
        
        // Test null token handling
        assertThatThrownBy(() -> jwtService.isTokenValid(null, testUserDetails))
            .as("Null token should throw IllegalArgumentException")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token cannot be null");
        
        // Test null UserDetails handling
        String validToken = jwtService.generateToken(testUserDetails);
        assertThatThrownBy(() -> jwtService.isTokenValid(validToken, null))
            .as("Null UserDetails should throw IllegalArgumentException")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("UserDetails cannot be null");
    }

    /**
     * Tests that the correct username can be extracted from a valid JWT.
     * 
     * This test validates the username extraction functionality which is essential
     * for user identification during the authentication process. The test ensures
     * that usernames are correctly stored in and retrieved from JWT tokens,
     * maintaining consistency between token generation and parsing operations.
     * 
     * Username Extraction Verification:
     * - Username matches the original user's username exactly
     * - Extraction works for different username formats (email, traditional)
     * - Extraction is performed without full token validation
     * - Consistent results across multiple extractions
     * - Proper handling of special characters in usernames
     * 
     * Integration Testing:
     * - Tests the complete username flow from User entity to JWT and back
     * - Verifies Spring Security UserDetails integration
     * - Ensures compatibility with email-based authentication patterns
     * - Validates username preservation through JWT encoding/decoding
     */
    @Test
    @DisplayName("Should extract the correct username from a valid token")
    void testGetUsernameFromToken_whenTokenIsValid_thenReturnsUsername() {
        // Arrange: Generate token for username extraction testing
        String tokenWithUsername = jwtService.generateToken(testUserDetails);
        
        // Act: Extract username from the generated token
        String extractedUsername = jwtService.extractUsername(tokenWithUsername);
        
        // Assert: Verify extracted username matches original
        assertThat(extractedUsername)
            .as("Extracted username should match original")
            .isEqualTo(TEST_USERNAME)
            .isEqualTo(testUserDetails.getUsername());
        
        // Test with different user to ensure consistency
        User differentUser = new User(
            "jane.smith@example.com",
            TEST_PASSWORD,
            "jane.smith@example.com",
            true,
            Set.of("ROLE_ADVISOR", "ROLE_USER")
        );
        
        String differentUserToken = jwtService.generateToken(differentUser);
        String differentUsername = jwtService.extractUsername(differentUserToken);
        
        assertThat(differentUsername)
            .as("Different user's username should be extracted correctly")
            .isEqualTo("jane.smith@example.com")
            .isNotEqualTo(TEST_USERNAME);
        
        // Test username extraction with special characters
        User specialCharUser = new User(
            "user+test@domain-name.co.uk",
            TEST_PASSWORD,
            "user+test@domain-name.co.uk",
            true,
            TEST_AUTHORITIES
        );
        
        String specialCharToken = jwtService.generateToken(specialCharUser);
        String specialCharUsername = jwtService.extractUsername(specialCharToken);
        
        assertThat(specialCharUsername)
            .as("Username with special characters should be extracted correctly")
            .isEqualTo("user+test@domain-name.co.uk");
    }

    /**
     * Tests that claims can be correctly extracted from a valid JWT.
     * 
     * This test validates the flexible claims extraction functionality using
     * the generic extractClaim method with function resolvers. It ensures
     * type safety, proper claim access, and comprehensive token metadata
     * extraction capabilities essential for authorization and audit purposes.
     * 
     * Claims Extraction Testing:
     * - Subject claim extraction and verification
     * - Expiration time claim retrieval and validation
     * - Issued at time claim access and verification
     * - Issuer claim extraction and matching
     * - Custom claims (authorities) extraction and type safety
     * - Generic type parameter functionality and safety
     * 
     * Type Safety Verification:
     * - String claims extracted as String type
     * - Date claims extracted as Date type
     * - List claims extracted as List type with proper generics
     * - Null handling for non-existent claims
     * - ClassCastException prevention through proper typing
     * 
     * Authorization Support:
     * - User authorities extraction for role-based access control
     * - Claims structure validation for security decisions
     * - Comprehensive token metadata access for audit trails
     */
    @Test
    @DisplayName("Should extract claims from a valid token")
    void testGetClaimsFromToken_whenTokenIsValid_thenReturnsClaims() {
        // Arrange: Generate token with comprehensive claims for testing
        String tokenWithClaims = jwtService.generateToken(testUserDetails);
        
        // Act & Assert: Test various claim extraction scenarios
        
        // Test subject claim extraction
        String subject = jwtService.extractClaim(tokenWithClaims, Claims::getSubject);
        assertThat(subject)
            .as("Subject claim should match username")
            .isEqualTo(TEST_USERNAME);
        
        // Test expiration claim extraction
        Date expiration = jwtService.extractClaim(tokenWithClaims, Claims::getExpiration);
        assertThat(expiration)
            .as("Expiration claim should be in the future")
            .isNotNull()
            .isAfter(new Date());
        
        // Test issued at claim extraction
        Date issuedAt = jwtService.extractClaim(tokenWithClaims, Claims::getIssuedAt);
        assertThat(issuedAt)
            .as("Issued at claim should be recent")
            .isNotNull()
            .isBeforeOrEqualTo(new Date())
            .isAfter(new Date(System.currentTimeMillis() - 60000)); // Within last minute
        
        // Test issuer claim extraction
        String issuer = jwtService.extractClaim(tokenWithClaims, Claims::getIssuer);
        assertThat(issuer)
            .as("Issuer claim should match configuration")
            .isEqualTo(TEST_ISSUER);
        
        // Test custom authorities claim extraction with type safety
        @SuppressWarnings("unchecked")
        List<String> authorities = jwtService.extractClaim(tokenWithClaims, 
            claims -> claims.get("authorities", List.class));
        assertThat(authorities)
            .as("Authorities claim should contain user roles")
            .isNotNull()
            .isNotEmpty()
            .containsExactlyInAnyOrder("ROLE_CUSTOMER", "ROLE_USER");
        
        // Test multiple claim extractions on same token for consistency
        String subject2 = jwtService.extractClaim(tokenWithClaims, Claims::getSubject);
        assertThat(subject2)
            .as("Multiple extractions should return consistent results")
            .isEqualTo(subject);
        
        // Test lambda-based claim extraction for custom logic
        boolean isExpired = jwtService.extractClaim(tokenWithClaims, 
            claims -> claims.getExpiration().before(new Date()));
        assertThat(isExpired)
            .as("Token should not be expired when freshly generated")
            .isFalse();
        
        // Test claim existence checking
        String nonExistentClaim = jwtService.extractClaim(tokenWithClaims,
            claims -> claims.get("nonexistent", String.class));
        assertThat(nonExistentClaim)
            .as("Non-existent claim should return null")
            .isNull();
    }

    /**
     * Tests error handling for null and invalid parameters in various JWT operations.
     * 
     * This test ensures robust error handling and parameter validation across
     * all JWT service methods. Proper parameter validation is essential for
     * security and prevents null pointer exceptions that could compromise
     * application stability in production financial services environments.
     * 
     * Parameter Validation Testing:
     * - Null token handling across all methods
     * - Empty and whitespace-only token handling
     * - Null UserDetails validation
     * - Null claims resolver function validation
     * - Consistent exception types and messages
     * 
     * Security Implications:
     * - Prevents null pointer exceptions that could expose system information
     * - Ensures consistent error handling for malicious input
     * - Maintains application stability under edge case conditions
     * - Provides clear error messages for debugging and monitoring
     */
    @Test
    @DisplayName("Should handle invalid parameters gracefully")
    void testInvalidParameterHandling() {
        // Test null token handling in extractUsername
        assertThatThrownBy(() -> jwtService.extractUsername(null))
            .as("extractUsername should reject null token")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token cannot be null");
        
        // Test empty token handling in extractUsername
        assertThatThrownBy(() -> jwtService.extractUsername(""))
            .as("extractUsername should reject empty token")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token cannot be null or empty");
        
        // Test whitespace-only token handling in extractUsername
        assertThatThrownBy(() -> jwtService.extractUsername("   "))
            .as("extractUsername should reject whitespace-only token")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token cannot be null or empty");
        
        // Test null UserDetails handling in generateToken
        assertThatThrownBy(() -> jwtService.generateToken(null))
            .as("generateToken should reject null UserDetails")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("UserDetails cannot be null");
        
        // Test null claims resolver handling in extractClaim
        String validToken = jwtService.generateToken(testUserDetails);
        assertThatThrownBy(() -> jwtService.extractClaim(validToken, null))
            .as("extractClaim should reject null claims resolver")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Claims resolver function cannot be null");
        
        // Test null token in extractClaim
        assertThatThrownBy(() -> jwtService.extractClaim(null, Claims::getSubject))
            .as("extractClaim should reject null token")
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token cannot be null");
    }

    /**
     * Tests JWT service behavior with disabled user accounts.
     * 
     * This test validates that the JWT service properly handles disabled user
     * accounts during token validation, ensuring that disabled accounts cannot
     * authenticate even with valid tokens. This is critical for user account
     * management and security control in financial services.
     * 
     * Disabled Account Scenarios:
     * - Token generation for disabled users (should succeed for testing)
     * - Token validation for disabled users (should fail)
     * - Account status changes after token generation
     * - Integration with Spring Security UserDetails status flags
     * 
     * Security Enforcement:
     * - Disabled accounts cannot authenticate with valid tokens
     * - Real-time account status validation during authentication
     * - Support for administrative account suspension
     * - Compliance with user account lifecycle management
     */
    @Test
    @DisplayName("Should reject tokens for disabled user accounts")
    void testTokenValidation_whenUserAccountDisabled_thenReturnsFalse() {
        // Arrange: Create disabled user account
        User disabledUser = new User(
            "disabled.user@example.com",
            TEST_PASSWORD,
            "disabled.user@example.com",
            false, // Account disabled
            TEST_AUTHORITIES
        );
        disabledUser.setId(2L);
        
        // Generate token for disabled user (this should succeed for token structure testing)
        String tokenForDisabledUser = jwtService.generateToken(disabledUser);
        
        // Act: Attempt to validate token for disabled user
        boolean isValid = jwtService.isTokenValid(tokenForDisabledUser, disabledUser);
        
        // Assert: Verify disabled user token is rejected
        assertThat(isValid)
            .as("Token for disabled user should fail validation")
            .isFalse();
        
        // Verify token structure is valid but user status prevents authentication
        String extractedUsername = jwtService.extractUsername(tokenForDisabledUser);
        assertThat(extractedUsername)
            .as("Username should be extractable from disabled user token")
            .isEqualTo("disabled.user@example.com");
        
        // Verify the token would be valid if the user were enabled
        disabledUser.setEnabled(true);
        boolean validWhenEnabled = jwtService.isTokenValid(tokenForDisabledUser, disabledUser);
        assertThat(validWhenEnabled)
            .as("Same token should be valid when user is enabled")
            .isTrue();
    }

    /**
     * Tests JWT service integration with comprehensive User entity functionality.
     * 
     * This test validates the complete integration between the JWT service and
     * the User entity, ensuring that all UserDetails interface methods work
     * correctly with JWT operations. This includes testing various user account
     * states and authority configurations common in financial services.
     * 
     * Integration Scenarios:
     * - User entity with multiple authorities and roles
     * - Different user account configurations and statuses
     * - Email-based authentication patterns
     * - Authority-based claims inclusion and extraction
     * - User entity equality and consistency across JWT operations
     * 
     * Financial Services Integration:
     * - Customer, advisor, and administrative role handling
     * - Multi-authority user configurations
     * - Email-based usernames for customer authentication
     * - Role-based access control through JWT claims
     */
    @Test
    @DisplayName("Should integrate correctly with User entity and authorities")
    void testUserEntityIntegration() {
        // Arrange: Create user with multiple financial service roles
        User financialAdvisor = new User(
            "advisor@financialservices.com",
            TEST_PASSWORD,
            "advisor@financialservices.com",
            true,
            Set.of("ROLE_ADVISOR", "ROLE_USER", "ROLE_CUSTOMER_SERVICE", "ROLE_COMPLIANCE_READ")
        );
        financialAdvisor.setId(3L);
        
        // Act: Generate and validate token for advisor
        String advisorToken = jwtService.generateToken(financialAdvisor);
        boolean isAdvisorTokenValid = jwtService.isTokenValid(advisorToken, financialAdvisor);
        
        // Assert: Verify advisor authentication works correctly
        assertThat(isAdvisorTokenValid)
            .as("Advisor token should be valid")
            .isTrue();
        
        // Verify advisor username extraction
        String advisorUsername = jwtService.extractUsername(advisorToken);
        assertThat(advisorUsername)
            .as("Advisor username should be extracted correctly")
            .isEqualTo("advisor@financialservices.com");
        
        // Verify advisor authorities are included in token
        @SuppressWarnings("unchecked")
        List<String> advisorAuthorities = jwtService.extractClaim(advisorToken,
            claims -> claims.get("authorities", List.class));
        assertThat(advisorAuthorities)
            .as("Advisor authorities should be included in token")
            .containsExactlyInAnyOrder(
                "ROLE_ADVISOR", 
                "ROLE_USER", 
                "ROLE_CUSTOMER_SERVICE", 
                "ROLE_COMPLIANCE_READ"
            );
        
        // Test User entity UserDetails interface compliance
        assertThat(financialAdvisor.isEnabled())
            .as("User should be enabled")
            .isTrue();
        
        assertThat(financialAdvisor.isAccountNonExpired())
            .as("User account should not be expired")
            .isTrue();
        
        assertThat(financialAdvisor.isAccountNonLocked())
            .as("User account should not be locked")
            .isTrue();
        
        assertThat(financialAdvisor.isCredentialsNonExpired())
            .as("User credentials should not be expired")
            .isTrue();
        
        // Verify Spring Security authorities integration
        assertThat(financialAdvisor.getAuthorities())
            .as("User authorities should be properly converted")
            .hasSize(4)
            .extracting("authority")
            .containsExactlyInAnyOrder(
                "ROLE_ADVISOR", 
                "ROLE_USER", 
                "ROLE_CUSTOMER_SERVICE", 
                "ROLE_COMPLIANCE_READ"
            );
    }
}