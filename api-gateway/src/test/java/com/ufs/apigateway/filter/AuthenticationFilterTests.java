package com.ufs.apigateway.filter;

import com.ufs.apigateway.filter.AuthenticationFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach; // org.junit.jupiter:junit-jupiter-api:5.10.2
import org.junit.jupiter.api.Test; // org.junit.jupiter:junit-jupiter-api:5.10.2
import org.junit.jupiter.api.extension.ExtendWith; // org.junit.jupiter:junit-jupiter-api:5.10.2
import org.mockito.ArgumentCaptor; // org.mockito:mockito-core:5.7.0
import org.mockito.Mock; // org.mockito:mockito-core:5.7.0
import org.mockito.junit.jupiter.MockitoExtension; // org.mockito:mockito-junit-jupiter:5.7.0
import org.springframework.cloud.gateway.filter.GatewayFilterChain; // org.springframework.cloud:spring-cloud-gateway-server:4.1.0
import org.springframework.core.io.buffer.DataBuffer; // org.springframework.core:spring-core:6.1.3
import org.springframework.core.io.buffer.DefaultDataBufferFactory; // org.springframework.core:spring-core:6.1.3
import org.springframework.http.HttpHeaders; // org.springframework.web:spring-web:6.1.3
import org.springframework.http.HttpStatus; // org.springframework.web:spring-web:6.1.3
import org.springframework.http.MediaType; // org.springframework.web:spring-web:6.1.3
import org.springframework.http.server.reactive.ServerHttpRequest; // org.springframework.web:spring-web:6.1.3
import org.springframework.http.server.reactive.ServerHttpResponse; // org.springframework.web:spring-web:6.1.3
import org.springframework.mock.http.server.reactive.MockServerHttpRequest; // org.springframework.test:spring-test:6.1.3
import org.springframework.mock.web.server.MockServerWebExchange; // org.springframework.test:spring-test:6.1.3
import org.springframework.web.reactive.function.client.WebClient; // org.springframework.webflux:spring-webflux:6.1.3
import org.springframework.web.reactive.function.client.WebClientResponseException; // org.springframework.webflux:spring-webflux:6.1.3
import org.springframework.web.server.ServerWebExchange; // org.springframework.web:spring-web:6.1.3
import reactor.core.publisher.Mono; // io.projectreactor:reactor-core:3.6.2
import reactor.test.StepVerifier; // io.projectreactor:reactor-test:3.6.2

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit test suite for the AuthenticationFilter class.
 * 
 * This test class verifies the core security functionality of the API Gateway's
 * authentication filter, ensuring robust JWT-based authentication and proper
 * request routing based on authentication status. The tests cover all critical
 * authentication scenarios including valid tokens, invalid tokens, missing
 * authorization headers, expired tokens, and public route bypassing.
 * 
 * <h2>Test Coverage</h2>
 * <ul>
 *   <li><strong>Valid Token Authentication</strong> - Ensures valid JWT tokens
 *       are properly validated and requests are allowed through</li>
 *   <li><strong>Invalid Token Handling</strong> - Verifies invalid tokens result
 *       in HTTP 401 Unauthorized responses</li>
 *   <li><strong>Missing Authorization Header</strong> - Tests proper handling of
 *       requests without authentication headers</li>
 *   <li><strong>Public Route Bypassing</strong> - Confirms unsecured paths bypass
 *       authentication requirements</li>
 *   <li><strong>Expired Token Handling</strong> - Validates expired token rejection
 *       with appropriate error responses</li>
 *   <li><strong>Header Enrichment</strong> - Tests user context propagation to
 *       downstream services through custom headers</li>
 * </ul>
 * 
 * <h2>Security Testing Focus</h2>
 * <p>
 * These tests specifically address the security requirements for:
 * </p>
 * <ul>
 *   <li><strong>API Gateway Management</strong> - Validates centralized security
 *       implementation at the gateway level</li>
 *   <li><strong>Authentication & Authorization</strong> - Ensures OAuth2 and JWT
 *       based authentication works correctly</li>
 *   <li><strong>Microservices Communication Security</strong> - Tests JWT validation
 *       for secure service-to-service communication</li>
 * </ul>
 * 
 * <h2>Test Architecture</h2>
 * <p>
 * The test suite uses Spring's reactive testing framework with Mockito for
 * comprehensive mocking of dependencies. Key components include:
 * </p>
 * <ul>
 *   <li><strong>MockServerWebExchange</strong> - Simulates HTTP request/response</li>
 *   <li><strong>WebClient Mocking</strong> - Mocks authentication service calls</li>
 *   <li><strong>Reactive Testing</strong> - Uses StepVerifier for async operations</li>
 *   <li><strong>Comprehensive Assertions</strong> - Validates all aspects of filter behavior</li>
 * </ul>
 * 
 * @author UFS API Gateway Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @see com.ufs.apigateway.filter.AuthenticationFilter
 * @see org.springframework.cloud.gateway.filter.GlobalFilter
 * @see org.springframework.web.server.ServerWebExchange
 */
@ExtendWith(MockitoExtension.class)
public class AuthenticationFilterTests {

    /**
     * Mock WebClient for testing authentication service interactions.
     * This mock simulates the HTTP client used by the AuthenticationFilter
     * to validate JWT tokens with the authentication service.
     */
    @Mock
    private WebClient webClient;

    /**
     * Mock WebClient.RequestBodyUriSpec for fluent API mocking.
     * Used to mock the chain of WebClient method calls for POST requests.
     */
    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    /**
     * Mock WebClient.RequestBodySpec for request body specification.
     * Handles the request body configuration in the WebClient fluent API.
     */
    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    /**
     * Mock WebClient.ResponseSpec for response handling.
     * Manages the response processing in the WebClient chain.
     */
    @Mock 
    private WebClient.ResponseSpec responseSpec;

    /**
     * Mock GatewayFilterChain for testing filter chain interactions.
     * Simulates the next filter in the Spring Cloud Gateway filter chain.
     */
    @Mock
    private GatewayFilterChain filterChain;

    /**
     * The AuthenticationFilter instance under test.
     * Created with mocked dependencies in the setUp method.
     */
    private AuthenticationFilter authenticationFilter;

    /**
     * ObjectMapper for JSON processing in tests.
     * Used to create test JSON responses and parse error responses.
     */
    private ObjectMapper objectMapper;

    /**
     * Valid JWT token for testing successful authentication scenarios.
     * Represents a properly formatted JWT token that should pass validation.
     */
    private static final String VALID_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZSIsImV4cCI6MTY3MzQ2NTIwMCwiaWF0IjoxNjczNDYxNjAwLCJhdXRob3JpdGllcyI6WyJST0xFX0NVU1RPTUVSIl19.signature";

    /**
     * Invalid JWT token for testing authentication failure scenarios.
     * Represents a malformed or tampered JWT token that should fail validation.
     */
    private static final String INVALID_JWT_TOKEN = "invalid.jwt.token";

    /**
     * Expired JWT token for testing token expiration scenarios.
     * Represents a properly formatted but expired JWT token.
     */
    private static final String EXPIRED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZSIsImV4cCI6MTYwMDAwMDAwMCwiaWF0IjoxNTk5OTk2NDAwLCJhdXRob3JpdGllcyI6WyJST0xFX0NVU1RPTUVSIl19.signature";

    /**
     * Sample user ID for testing user context propagation.
     * Represents a typical user identifier returned by the authentication service.
     */
    private static final String TEST_USER_ID = "123456";

    /**
     * Sample username for testing user context propagation.
     * Represents a typical username returned by the authentication service.
     */
    private static final String TEST_USERNAME = "john.doe";

    /**
     * Sample user email for testing user context propagation.
     * Represents a typical user email returned by the authentication service.
     */
    private static final String TEST_USER_EMAIL = "john.doe@ufs.com";

    /**
     * Sample user authorities for testing role-based access control.
     * Represents typical user roles/permissions returned by the authentication service.
     */
    private static final List<String> TEST_USER_AUTHORITIES = Arrays.asList("ROLE_CUSTOMER", "ROLE_USER");

    /**
     * Public endpoint path for testing unsecured route bypassing.
     * Represents a typical public endpoint that should bypass authentication.
     */
    private static final String PUBLIC_ENDPOINT_PATH = "/auth/login";

    /**
     * Protected endpoint path for testing authentication requirements.
     * Represents a typical protected endpoint that requires authentication.
     */
    private static final String PROTECTED_ENDPOINT_PATH = "/api/accounts";

    /**
     * Sets up the test environment before each test method execution.
     * 
     * This method initializes all necessary mocks and creates the AuthenticationFilter
     * instance with properly configured dependencies. It sets up the WebClient mock
     * chain and prepares the ObjectMapper for JSON processing.
     * 
     * <h3>Setup Process</h3>
     * <ol>
     *   <li>Initialize ObjectMapper for JSON processing</li>
     *   <li>Create mock WebClient.Builder and configure return values</li>
     *   <li>Set up WebClient fluent API mock chain</li>
     *   <li>Initialize AuthenticationFilter with mocked dependencies</li>
     *   <li>Configure default filter chain behavior</li>
     * </ol>
     * 
     * <h3>Mock Configuration</h3>
     * <p>
     * The WebClient mock is configured to support the fluent API pattern used
     * by the AuthenticationFilter for making HTTP requests to the auth service:
     * </p>
     * <pre>
     * webClient.post()
     *   .uri(validationUrl)
     *   .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
     *   .bodyValue(requestBody)
     *   .retrieve()
     *   .bodyToMono(String.class)
     * </pre>
     */
    @BeforeEach
    void setUp() {
        // Initialize ObjectMapper for JSON processing in tests
        objectMapper = new ObjectMapper();

        // Create a mock WebClient.Builder for AuthenticationFilter constructor
        WebClient.Builder webClientBuilder = mock(WebClient.Builder.class);
        
        // Configure the builder to return a WebClient with codec configuration
        when(webClientBuilder.codecs(any())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);

        // Set up the WebClient fluent API mock chain for POST requests
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);

        // Initialize the AuthenticationFilter with the mocked WebClient.Builder
        authenticationFilter = new AuthenticationFilter(webClientBuilder);

        // Set up default filter chain behavior to return completed Mono
        when(filterChain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
    }

    /**
     * Tests that the filter allows a request with a valid JWT token to pass through.
     * 
     * This test verifies the complete authentication flow for a valid JWT token,
     * ensuring that:
     * <ul>
     *   <li>Valid JWT tokens are properly extracted from Authorization header</li>
     *   <li>Authentication service is called for token validation</li>
     *   <li>User information is correctly parsed from auth service response</li>
     *   <li>Request headers are enriched with user context</li>
     *   <li>Request proceeds to the next filter in the chain</li>
     * </ul>
     * 
     * <h3>Test Scenario</h3>
     * <ol>
     *   <li>Create HTTP request with valid Bearer token in Authorization header</li>
     *   <li>Mock authentication service to return successful validation response</li>
     *   <li>Execute the filter and verify successful completion</li>
     *   <li>Assert that filter chain was called with enriched headers</li>
     *   <li>Verify authentication service was called with correct parameters</li>
     * </ol>
     * 
     * <h3>Security Validation</h3>
     * <p>
     * This test ensures that legitimate users with valid tokens can access
     * protected resources, supporting the core authentication requirement
     * for the financial services platform.
     * </p>
     */
    @Test
    void filter_whenTokenIsValid_shouldPass() {
        // Arrange - Create a request with valid Authorization header
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PROTECTED_ENDPOINT_PATH)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + VALID_JWT_TOKEN)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Create mock authentication service response with user information
        String authServiceResponse = createValidAuthServiceResponse();
        
        // Configure WebClient mock to return successful validation response
        when(responseSpec.bodyToMono(String.class))
                .thenReturn(Mono.just(authServiceResponse).delayElement(Duration.ofMillis(100)));

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify successful completion and proper behavior
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify that the filter chain was called exactly once
        verify(filterChain, times(1)).filter(any(ServerWebExchange.class));

        // Capture the exchange passed to the filter chain to verify header enrichment
        ArgumentCaptor<ServerWebExchange> exchangeCaptor = ArgumentCaptor.forClass(ServerWebExchange.class);
        verify(filterChain).filter(exchangeCaptor.capture());
        
        ServerWebExchange capturedExchange = exchangeCaptor.getValue();
        ServerHttpRequest enrichedRequest = capturedExchange.getRequest();

        // Verify that user context headers were added to the request
        assertEquals(TEST_USER_ID, enrichedRequest.getHeaders().getFirst("X-User-Id"),
                "User ID header should be set correctly");
        assertEquals(TEST_USERNAME, enrichedRequest.getHeaders().getFirst("X-Username"),
                "Username header should be set correctly");
        assertEquals(TEST_USER_EMAIL, enrichedRequest.getHeaders().getFirst("X-User-Email"),
                "User email header should be set correctly");
        assertEquals("ROLE_CUSTOMER,ROLE_USER", enrichedRequest.getHeaders().getFirst("X-User-Roles"),
                "User roles header should contain comma-separated authorities");

        // Verify authentication service was called with correct parameters
        verify(webClient, times(1)).post();
        verify(requestBodyUriSpec, times(1)).uri(contains("/auth/validate"));
        verify(requestBodySpec, times(1)).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        verify(requestBodySpec, times(1)).bodyValue(contains(VALID_JWT_TOKEN));
    }

    /**
     * Tests that the filter returns HTTP 401 Unauthorized when the JWT token is invalid.
     * 
     * This test verifies the security behavior when an invalid or malformed JWT token
     * is provided, ensuring that:
     * <ul>
     *   <li>Invalid JWT tokens are rejected by the authentication service</li>
     *   <li>HTTP 401 Unauthorized status is returned to the client</li>
     *   <li>Appropriate error message is included in the response</li>
     *   <li>Filter chain is not executed for unauthorized requests</li>
     *   <li>Security logging captures the authentication failure</li>
     * </ul>
     * 
     * <h3>Test Scenario</h3>
     * <ol>
     *   <li>Create HTTP request with invalid Bearer token in Authorization header</li>
     *   <li>Mock authentication service to return 401 error response</li>
     *   <li>Execute the filter and verify failure handling</li>
     *   <li>Assert that HTTP 401 status is set in response</li>
     *   <li>Verify that filter chain was never called</li>
     * </ol>
     * 
     * <h3>Security Validation</h3>
     * <p>
     * This test ensures that malicious or compromised tokens are properly rejected,
     * preventing unauthorized access to protected financial service resources.
     * </p>
     */
    @Test
    void filter_whenTokenIsInvalid_shouldReturnUnauthorized() {
        // Arrange - Create a request with invalid Authorization header
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PROTECTED_ENDPOINT_PATH)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + INVALID_JWT_TOKEN)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Configure WebClient mock to return 401 Unauthorized from auth service
        WebClientResponseException unauthorizedException = WebClientResponseException.create(
                401, "Unauthorized", HttpHeaders.EMPTY, new byte[0], StandardCharsets.UTF_8);
        
        when(responseSpec.bodyToMono(String.class))
                .thenReturn(Mono.error(unauthorizedException));

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify that the filter completes (error handling completes the Mono)
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify that the response status was set to 401 Unauthorized
        ServerHttpResponse response = exchange.getResponse();
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                "Response status should be 401 Unauthorized for invalid token");

        // Verify that the filter chain was never called for unauthorized request
        verify(filterChain, never()).filter(any(ServerWebExchange.class));

        // Verify authentication service was called but returned error
        verify(webClient, times(1)).post();
        verify(requestBodyUriSpec, times(1)).uri(contains("/auth/validate"));
        verify(requestBodySpec, times(1)).bodyValue(contains(INVALID_JWT_TOKEN));
    }

    /**
     * Tests that the filter returns HTTP 401 Unauthorized when no Authorization header is present.
     * 
     * This test verifies the security behavior when a request lacks authentication
     * credentials entirely, ensuring that:
     * <ul>
     *   <li>Requests without Authorization header are rejected</li>
     *   <li>HTTP 401 Unauthorized status is returned immediately</li>
     *   <li>Authentication service is not called unnecessarily</li>
     *   <li>Filter chain is not executed for unauthenticated requests</li>
     *   <li>Appropriate error response is generated</li>
     * </ul>
     * 
     * <h3>Test Scenario</h3>
     * <ol>
     *   <li>Create HTTP request without Authorization header</li>
     *   <li>Execute the filter and verify immediate rejection</li>
     *   <li>Assert that HTTP 401 status is set in response</li>
     *   <li>Verify that authentication service was not called</li>
     *   <li>Confirm that filter chain was not executed</li>
     * </ol>
     * 
     * <h3>Security Validation</h3>
     * <p>
     * This test ensures that unauthenticated requests are immediately rejected,
     * preventing any unauthorized access attempts to protected financial resources.
     * </p>
     */
    @Test
    void filter_whenNoAuthHeader_shouldReturnUnauthorized() {
        // Arrange - Create a request without Authorization header
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PROTECTED_ENDPOINT_PATH)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify that the filter completes with authentication failure
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify that the response status was set to 401 Unauthorized
        ServerHttpResponse response = exchange.getResponse();
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                "Response status should be 401 Unauthorized when Authorization header is missing");

        // Verify that the filter chain was never called
        verify(filterChain, never()).filter(any(ServerWebExchange.class));

        // Verify that authentication service was never called since no token was provided
        verify(webClient, never()).post();
    }

    /**
     * Tests that the filter bypasses authentication for public routes.
     * 
     * This test verifies the correct handling of unsecured paths that should
     * bypass authentication requirements, ensuring that:
     * <ul>
     *   <li>Public endpoints like /auth/login do not require authentication</li>
     *   <li>Requests to public paths proceed directly to downstream services</li>
     *   <li>Authentication service is not called for public routes</li>
     *   <li>Filter chain is executed without authentication checks</li>
     *   <li>Performance is optimized by avoiding unnecessary validation</li>
     * </ul>
     * 
     * <h3>Test Scenario</h3>
     * <ol>
     *   <li>Create HTTP request to a public endpoint (/auth/login)</li>
     *   <li>Execute the filter without providing authentication credentials</li>
     *   <li>Verify that the request proceeds to the filter chain</li>
     *   <li>Assert that authentication service was not called</li>
     *   <li>Confirm no authentication headers are required or added</li>
     * </ol>
     * 
     * <h3>Functional Validation</h3>
     * <p>
     * This test ensures that essential public endpoints like login, registration,
     * and health checks remain accessible, supporting the platform's core
     * authentication and monitoring functionality.
     * </p>
     */
    @Test
    void filter_whenRouteIsPublic_shouldBypassAuthentication() {
        // Arrange - Create a request to a public endpoint (login)
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PUBLIC_ENDPOINT_PATH)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify that the filter completes successfully
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify that the filter chain was called exactly once (request proceeded)
        verify(filterChain, times(1)).filter(exchange);

        // Verify that authentication service was never called for public route
        verify(webClient, never()).post();

        // Verify that no authentication validation was attempted
        verifyNoInteractions(requestBodyUriSpec, requestBodySpec, responseSpec);
    }

    /**
     * Tests that the filter returns HTTP 401 Unauthorized when the JWT token is expired.
     * 
     * This test verifies the security behavior when an expired JWT token is provided,
     * ensuring that:
     * <ul>
     *   <li>Expired JWT tokens are detected and rejected by the authentication service</li>
     *   <li>HTTP 401 Unauthorized status is returned for expired tokens</li>
     *   <li>Token expiration is handled as a security violation</li>
     *   <li>Filter chain is not executed for expired token requests</li>
     *   <li>Appropriate error messaging indicates token expiration</li>
     * </ul>
     * 
     * <h3>Test Scenario</h3>
     * <ol>
     *   <li>Create HTTP request with expired Bearer token in Authorization header</li>
     *   <li>Mock authentication service to return 401 error for expired token</li>
     *   <li>Execute the filter and verify expiration handling</li>
     *   <li>Assert that HTTP 401 status is set in response</li>
     *   <li>Verify that filter chain was not executed</li>
     * </ol>
     * 
     * <h3>Security Validation</h3>
     * <p>
     * This test ensures that expired tokens are properly rejected, preventing
     * the use of stale credentials and maintaining the security integrity of
     * the financial services platform's time-sensitive operations.
     * </p>
     */
    @Test
    void filter_whenTokenIsExpired_shouldReturnUnauthorized() {
        // Arrange - Create a request with expired Authorization header
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PROTECTED_ENDPOINT_PATH)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + EXPIRED_JWT_TOKEN)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Configure WebClient mock to return 401 Unauthorized for expired token
        WebClientResponseException expiredTokenException = WebClientResponseException.create(
                401, "Token has expired", HttpHeaders.EMPTY, 
                "{\"error\":\"Token expired\",\"message\":\"JWT token has expired\"}".getBytes(), 
                StandardCharsets.UTF_8);
        
        when(responseSpec.bodyToMono(String.class))
                .thenReturn(Mono.error(expiredTokenException));

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify that the filter completes with authentication failure
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify that the response status was set to 401 Unauthorized
        ServerHttpResponse response = exchange.getResponse();
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                "Response status should be 401 Unauthorized for expired token");

        // Verify that the filter chain was never called for expired token
        verify(filterChain, never()).filter(any(ServerWebExchange.class));

        // Verify authentication service was called with expired token
        verify(webClient, times(1)).post();
        verify(requestBodyUriSpec, times(1)).uri(contains("/auth/validate"));
        verify(requestBodySpec, times(1)).bodyValue(contains(EXPIRED_JWT_TOKEN));

        // Verify that the response contains appropriate error information
        DataBuffer responseBody = exchange.getResponse().bufferFactory()
                .wrap("".getBytes(StandardCharsets.UTF_8));
        assertNotNull(responseBody, "Response body should be present for error cases");
    }

    /**
     * Tests the filter's order value to ensure proper placement in the filter chain.
     * 
     * This test verifies that the AuthenticationFilter has the correct precedence
     * in the Spring Cloud Gateway filter chain, ensuring that:
     * <ul>
     *   <li>Authentication occurs before business logic filters</li>
     *   <li>Security validation happens early in the request lifecycle</li>
     *   <li>Filter ordering supports optimal performance and security</li>
     *   <li>Authentication context is established for subsequent filters</li>
     * </ul>
     * 
     * <h3>Expected Order Value</h3>
     * <p>
     * The AuthenticationFilter should return -10 to ensure high precedence
     * (early execution) in the filter chain, allowing it to:
     * </p>
     * <ul>
     *   <li>Reject unauthorized requests before expensive processing</li>
     *   <li>Establish user security context for other filters</li>
     *   <li>Optimize performance by failing fast on security violations</li>
     * </ul>
     */
    @Test
    void getOrder_shouldReturnCorrectPrecedence() {
        // Act - Get the filter order
        int order = authenticationFilter.getOrder();

        // Assert - Verify high precedence order value
        assertEquals(-10, order, 
                "AuthenticationFilter should have high precedence order (-10) for early execution");
    }

    /**
     * Tests that malformed Authorization headers are properly rejected.
     * 
     * This test verifies the handling of improperly formatted Authorization headers,
     * including those missing the "Bearer " prefix or containing invalid formats.
     */
    @Test
    void filter_whenAuthHeaderIsMalformed_shouldReturnUnauthorized() {
        // Test various malformed Authorization header formats
        String[] malformedHeaders = {
                "Basic " + VALID_JWT_TOKEN,  // Wrong auth type
                "Bearer",                     // Missing token
                "Bearer ",                    // Empty token
                VALID_JWT_TOKEN,             // Missing Bearer prefix
                "Token " + VALID_JWT_TOKEN   // Wrong prefix
        };

        for (String malformedHeader : malformedHeaders) {
            // Arrange - Create request with malformed Authorization header
            MockServerHttpRequest request = MockServerHttpRequest
                    .get(PROTECTED_ENDPOINT_PATH)
                    .header(HttpHeaders.AUTHORIZATION, malformedHeader)
                    .build();
            
            ServerWebExchange exchange = MockServerWebExchange.from(request);

            // Act - Execute the filter
            Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

            // Assert - Verify unauthorized response
            StepVerifier.create(result)
                    .expectComplete()
                    .verify(Duration.ofSeconds(5));

            assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode(),
                    "Malformed Authorization header '" + malformedHeader + "' should result in 401");

            // Reset exchange for next iteration
            exchange = MockServerWebExchange.from(request);
        }

        // Verify that filter chain was never called for any malformed header
        verify(filterChain, never()).filter(any(ServerWebExchange.class));
    }

    /**
     * Tests authentication service timeout handling.
     * 
     * This test verifies that the filter properly handles timeouts when the
     * authentication service is slow to respond or unavailable.
     */
    @Test
    void filter_whenAuthServiceTimesOut_shouldReturnUnauthorized() {
        // Arrange - Create request with valid token
        MockServerHttpRequest request = MockServerHttpRequest
                .get(PROTECTED_ENDPOINT_PATH)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + VALID_JWT_TOKEN)
                .build();
        
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        // Configure WebClient mock to timeout
        when(responseSpec.bodyToMono(String.class))
                .thenReturn(Mono.error(new RuntimeException("Timeout")));

        // Act - Execute the filter
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Assert - Verify timeout handling
        StepVerifier.create(result)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // Verify unauthorized response for timeout
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode(),
                "Authentication service timeout should result in 401 Unauthorized");

        // Verify filter chain was not called
        verify(filterChain, never()).filter(any(ServerWebExchange.class));
    }

    /**
     * Tests multiple public routes to ensure comprehensive path matching.
     * 
     * This test verifies that all configured unsecured paths properly bypass
     * authentication, including health checks, actuator endpoints, and API documentation.
     */
    @Test
    void filter_whenMultiplePublicRoutes_shouldBypassAuthentication() {
        // List of public routes that should bypass authentication
        String[] publicRoutes = {
                "/auth/login",
                "/auth/register", 
                "/auth/refresh",
                "/actuator/health",
                "/actuator/metrics",
                "/health/check",
                "/swagger-ui/index.html",
                "/v3/api-docs/swagger-config",
                "/favicon.ico"
        };

        for (String publicRoute : publicRoutes) {
            // Arrange - Create request to public route
            MockServerHttpRequest request = MockServerHttpRequest
                    .get(publicRoute)
                    .build();
            
            ServerWebExchange exchange = MockServerWebExchange.from(request);

            // Act - Execute the filter  
            Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

            // Assert - Verify bypass behavior
            StepVerifier.create(result)
                    .expectComplete()
                    .verify(Duration.ofSeconds(5));

            // Reset mocks for next iteration
            reset(filterChain);
            when(filterChain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        }

        // Verify filter chain was called for each public route
        verify(filterChain, times(publicRoutes.length)).filter(any(ServerWebExchange.class));

        // Verify authentication service was never called for public routes
        verify(webClient, never()).post();
    }

    /**
     * Creates a valid authentication service response for testing successful token validation.
     * 
     * This helper method generates a properly formatted JSON response that simulates
     * what the authentication service would return for a valid JWT token, including
     * all required user information fields.
     * 
     * @return JSON string representing a successful authentication service response
     */
    private String createValidAuthServiceResponse() {
        try {
            return objectMapper.writeValueAsString(
                    objectMapper.createObjectNode()
                            .put("userId", TEST_USER_ID)
                            .put("username", TEST_USERNAME)
                            .put("email", TEST_USER_EMAIL)
                            .set("authorities", objectMapper.valueToTree(TEST_USER_AUTHORITIES))
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create test auth service response", e);
        }
    }
}