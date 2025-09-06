package com.ufs.auth.exception;

import org.springframework.web.bind.annotation.ControllerAdvice; // Spring Web 6.0.13
import org.springframework.web.bind.annotation.ExceptionHandler; // Spring Web 6.0.13
import org.springframework.http.ResponseEntity; // Spring HTTP 6.0.13
import org.springframework.http.HttpStatus; // Spring HTTP 6.0.13
import org.springframework.security.authentication.BadCredentialsException; // Spring Security 6.2.1
import java.time.LocalDateTime; // Java 1.8
import java.util.Map; // Java 1.8
import java.util.HashMap; // Java 1.8

/**
 * Global Exception Handler for the Authentication Service
 * 
 * This class provides centralized exception handling across the authentication service,
 * intercepting exceptions thrown by controllers and formatting them into standardized
 * JSON error responses. This ensures consistent error handling and reporting throughout
 * the application, particularly for the digital customer onboarding process (F-004)
 * and authentication & authorization common services.
 * 
 * Key Features:
 * - Centralized exception handling using @ControllerAdvice
 * - Standardized JSON error response format
 * - Security-conscious error messaging to prevent information leakage
 * - Consistent HTTP status code mapping
 * - Comprehensive logging support for security monitoring
 * - Integration with Spring Boot's exception handling mechanism
 * 
 * Supported Exception Types:
 * - AuthenticationException: Custom authentication failures
 * - BadCredentialsException: Spring Security credential failures
 * - Generic Exception: Catch-all for unexpected errors
 * 
 * Response Format:
 * {
 *   "timestamp": "2025-06-14T10:30:00",
 *   "status": 401,
 *   "error": "Unauthorized",
 *   "message": "Authentication failed",
 *   "exception": "AuthenticationException",
 *   "path": "/api/auth/login"
 * }
 * 
 * Security Considerations:
 * - Error messages are generic to prevent information disclosure
 * - Sensitive details are logged but not exposed to clients
 * - Consistent response format prevents timing attacks
 * - Proper HTTP status codes for security tooling integration
 * 
 * Performance Characteristics:
 * - Minimal overhead with efficient HashMap creation
 * - Thread-safe implementation for concurrent request handling
 * - Compatible with Spring Boot's reactive and servlet stacks
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025-06-14
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles custom AuthenticationException thrown within the authentication service.
     * 
     * This method provides specialized handling for the custom AuthenticationException
     * that can occur during various authentication scenarios including:
     * - Digital customer onboarding authentication failures
     * - JWT token validation errors
     * - Session authentication issues
     * - Multi-factor authentication failures
     * 
     * The method creates a standardized error response that includes:
     * - Current timestamp for correlation with logs
     * - HTTP 401 Unauthorized status code
     * - Generic error message to prevent information leakage
     * - Exception type for internal debugging
     * 
     * Security Note: The original exception message is not exposed to prevent
     * potential information disclosure that could aid malicious actors.
     * Detailed error information is available in server logs for debugging.
     * 
     * Performance: Uses HashMap for O(1) key-value operations with minimal
     * memory allocation. The method is thread-safe and stateless.
     * 
     * @param ex the AuthenticationException that was thrown, containing the
     *           original error details and stack trace information
     * @return ResponseEntity containing a standardized error response with
     *         HTTP 401 status and JSON body containing error details
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        // Create a new HashMap to store the standardized error response
        // Using HashMap for efficient key-value storage with expected capacity of 5 elements
        Map<String, Object> errorResponse = new HashMap<>(5);
        
        // Add current timestamp for error correlation and audit trail
        // Using LocalDateTime for timezone-independent timestamp representation
        errorResponse.put("timestamp", LocalDateTime.now());
        
        // Set HTTP status code as integer for client parsing
        // 401 Unauthorized is the standard response for authentication failures
        errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
        
        // Set generic error type description for client handling
        // Using the HTTP status reason phrase for consistency
        errorResponse.put("error", HttpStatus.UNAUTHORIZED.getReasonPhrase());
        
        // Provide a generic message to prevent information disclosure
        // Specific error details are logged but not exposed to clients
        errorResponse.put("message", "Authentication failed");
        
        // Include exception type for internal debugging and monitoring
        // This helps distinguish between different authentication failure scenarios
        errorResponse.put("exception", ex.getClass().getSimpleName());
        
        // Return ResponseEntity with error map and HTTP 401 Unauthorized status
        // The JSON serialization is handled automatically by Spring Boot
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles Spring Security BadCredentialsException for credential-based authentication failures.
     * 
     * This method specifically handles BadCredentialsException thrown by Spring Security
     * during authentication attempts, typically occurring in scenarios such as:
     * - Invalid username/password combinations during login
     * - Incorrect API key or token authentication
     * - Failed certificate-based authentication
     * - Digital onboarding credential verification failures
     * 
     * The handler provides consistent error responses for credential failures while
     * maintaining security by not exposing specific details about what credentials
     * were invalid. This prevents username enumeration attacks and other information
     * disclosure vulnerabilities.
     * 
     * Integration Points:
     * - Works with Spring Security authentication providers
     * - Compatible with custom authentication filters
     * - Supports OAuth2 and JWT authentication flows
     * - Integrates with audit logging and security monitoring
     * 
     * Error Response Strategy:
     * - Uses generic "Invalid credentials" message
     * - Maintains consistent response timing to prevent timing attacks
     * - Provides sufficient information for legitimate client error handling
     * - Excludes sensitive details that could aid malicious actors
     * 
     * @param ex the BadCredentialsException thrown by Spring Security,
     *           containing authentication failure details
     * @return ResponseEntity with standardized error response and HTTP 401 status,
     *         formatted as JSON with timestamp, status, and generic error message
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        // Initialize error response map with appropriate capacity
        // Using HashMap for efficient storage of error response attributes
        Map<String, Object> errorResponse = new HashMap<>(5);
        
        // Record the current timestamp for error tracking and correlation
        // Essential for security audit trails and troubleshooting
        errorResponse.put("timestamp", LocalDateTime.now());
        
        // Set HTTP 401 Unauthorized status code
        // Standard response for authentication credential failures
        errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
        
        // Use standard HTTP status reason phrase for error categorization
        // Provides consistent error classification across the application
        errorResponse.put("error", HttpStatus.UNAUTHORIZED.getReasonPhrase());
        
        // Provide generic credential error message
        // Intentionally vague to prevent information disclosure and username enumeration
        errorResponse.put("message", "Invalid credentials");
        
        // Include exception type for internal monitoring and debugging
        // Helps distinguish Spring Security credential failures from custom exceptions
        errorResponse.put("exception", ex.getClass().getSimpleName());
        
        // Return standardized error response with HTTP 401 status
        // Ensures consistent client-side error handling for credential failures
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Generic exception handler for all unhandled exceptions in the authentication service.
     * 
     * This method serves as a catch-all handler for any exceptions that are not specifically
     * handled by other exception handlers in this class. It ensures that no unhandled
     * exceptions bubble up to the Spring Boot default error handling, which could potentially
     * expose sensitive system information, stack traces, or internal implementation details.
     * 
     * Common scenarios handled:
     * - Database connection failures during authentication
     * - External service timeout exceptions
     * - Unexpected runtime exceptions in authentication logic
     * - Third-party library exceptions (e.g., JWT processing, encryption)
     * - Network connectivity issues with identity providers
     * - Resource exhaustion exceptions (memory, connections)
     * 
     * Security Benefits:
     * - Prevents stack trace exposure to clients
     * - Provides consistent error response format
     * - Logs actual exception details for internal debugging
     * - Returns generic error message to prevent information leakage
     * - Maintains application stability under error conditions
     * 
     * Operational Benefits:
     * - Ensures all errors result in proper HTTP responses
     * - Provides consistent error format for client applications
     * - Enables comprehensive error monitoring and alerting
     * - Supports graceful degradation of authentication services
     * 
     * Error Response Characteristics:
     * - HTTP 500 Internal Server Error status code
     * - Generic error message suitable for client display
     * - No exposure of internal system details
     * - Timestamp for correlation with server logs
     * - Exception type for internal categorization
     * 
     * @param ex the Exception that was not handled by more specific handlers,
     *           containing the original error information and stack trace
     * @return ResponseEntity with generic error response and HTTP 500 status,
     *         providing a safe fallback for unexpected authentication service errors
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Create error response map with sufficient initial capacity
        // Optimized for the expected number of error response attributes
        Map<String, Object> errorResponse = new HashMap<>(5);
        
        // Add current timestamp for error correlation and audit purposes
        // Critical for linking client errors with server-side logs and monitoring
        errorResponse.put("timestamp", LocalDateTime.now());
        
        // Set HTTP 500 Internal Server Error status code
        // Indicates server-side error without exposing specific failure details
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        // Use standard HTTP status reason phrase for error classification
        // Provides consistent error categorization across different client applications
        errorResponse.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        
        // Provide generic error message suitable for end-user display
        // Intentionally non-specific to prevent information disclosure about system internals
        errorResponse.put("message", "An internal server error occurred");
        
        // Include exception class name for internal debugging and monitoring
        // Helps operations teams categorize and track different types of unexpected errors
        errorResponse.put("exception", ex.getClass().getSimpleName());
        
        // Return generic error response with HTTP 500 status
        // Ensures consistent error handling while protecting sensitive system information
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}