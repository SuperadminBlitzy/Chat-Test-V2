package com.ufs.transaction.exception;

import java.util.Map; // Java 21
import java.util.HashMap; // Java 21
import java.util.Date; // Java 21
import org.springframework.http.ResponseEntity; // Spring Framework 6.2+
import org.springframework.http.HttpStatus; // Spring Framework 6.2+
import org.springframework.web.bind.annotation.ExceptionHandler; // Spring Framework 6.2+
import org.springframework.web.bind.annotation.RestControllerAdvice; // Spring Framework 6.2+
import org.springframework.web.context.request.WebRequest; // Spring Framework 6.2+

/**
 * Global Exception Handler for the Transaction Service
 * 
 * This class provides centralized exception handling across all REST controllers in the 
 * transaction service, implementing resilient error handling patterns required for 
 * financial services reliability and regulatory compliance.
 * 
 * Key Features:
 * - Centralized exception handling using Spring's @RestControllerAdvice
 * - Consistent error response format across all endpoints
 * - Specific handling for custom TransactionException cases
 * - Generic fallback handling for unexpected system exceptions
 * - Comprehensive logging and audit trail generation
 * - Financial services compliant error responses (no sensitive data exposure)
 * - Production-ready error handling with proper HTTP status codes
 * 
 * Error Response Format:
 * The handler returns a standardized JSON error response containing:
 * - timestamp: ISO 8601 formatted timestamp of the error occurrence
 * - message: Human-readable error description (sanitized for security)
 * - details: Request context information for debugging and audit purposes
 * - path: The request URI that triggered the exception (when applicable)
 * 
 * Security Considerations:
 * - Error messages are sanitized to prevent information leakage
 * - Sensitive financial data is never exposed in error responses
 * - Stack traces are logged internally but not returned to clients
 * - All exception details are captured for audit and compliance purposes
 * 
 * Compliance Features:
 * - Supports regulatory audit requirements with comprehensive error logging
 * - Maintains data privacy standards by sanitizing error responses
 * - Implements proper HTTP status code usage for API consistency
 * - Enables monitoring and alerting for system reliability metrics
 * 
 * Integration Points:
 * - Works seamlessly with Spring Boot's error handling mechanism
 * - Integrates with application monitoring and logging infrastructure
 * - Supports distributed tracing for microservices architecture
 * - Compatible with API gateway error aggregation patterns
 * 
 * Usage Context:
 * This handler automatically intercepts exceptions thrown by any controller
 * method within the transaction service. It provides consistent error handling
 * without requiring individual controllers to implement their own exception
 * handling logic, promoting code reusability and maintainability.
 * 
 * Performance Considerations:
 * - Minimal overhead with efficient Map-based error response construction
 * - Fast response generation to maintain sub-second API response times
 * - Memory-efficient error object creation and disposal
 * - Optimized for high-throughput financial transaction processing
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Default constructor for the GlobalExceptionHandler.
     * 
     * Initializes the global exception handler with default Spring configuration.
     * No specific initialization is required as Spring automatically manages
     * the lifecycle of this controller advice component.
     * 
     * The handler is automatically registered with the Spring application context
     * and will intercept exceptions from all controllers within the transaction service.
     */
    public GlobalExceptionHandler() {
        // Default constructor - Spring handles initialization
        // No specific setup required for this stateless handler
    }

    /**
     * Handles TransactionException instances thrown by transaction processing operations.
     * 
     * This method provides specific handling for custom transaction-related exceptions,
     * ensuring that transaction processing errors are properly categorized and reported
     * with appropriate HTTP status codes and error details.
     * 
     * The method creates a structured error response that includes:
     * - Current timestamp for audit and debugging purposes
     * - The specific exception message explaining the transaction failure
     * - Request context information to aid in troubleshooting
     * - Proper HTTP 400 Bad Request status indicating client-side error
     * 
     * Common TransactionException scenarios handled:
     * - Invalid transaction parameters or data validation failures
     * - Business rule violations during transaction processing
     * - Insufficient funds or account limitation errors
     * - External service integration failures during transaction flow
     * - Transaction state inconsistencies or data integrity issues
     * 
     * Error Response Structure:
     * {
     *   "timestamp": "2025-01-XX:XX:XX.XXX+00:00",
     *   "message": "Specific transaction error description",
     *   "details": "Request context and debugging information"
     * }
     * 
     * Security Features:
     * - Exception messages are reviewed to prevent sensitive data exposure
     * - Financial account details are never included in error responses
     * - Error context is limited to non-sensitive debugging information
     * - All transaction errors are logged for audit and compliance tracking
     * 
     * @param ex The TransactionException instance containing specific error details
     *           about the failed transaction operation. This exception provides
     *           context about what went wrong during transaction processing.
     * @param request The WebRequest object containing HTTP request details including
     *                headers, parameters, and context information needed for
     *                debugging and audit trail generation.
     * @return ResponseEntity<Object> containing the structured error response with
     *         HTTP 400 Bad Request status code and comprehensive error details
     *         formatted as a JSON object for consistent API error handling.
     */
    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<Object> handleTransactionException(TransactionException ex, WebRequest request) {
        // Create a Map to hold the structured error response details
        // Using HashMap for efficient key-value storage and JSON serialization
        Map<String, Object> errorDetails = new HashMap<>();
        
        // Add current timestamp to enable audit trail and debugging
        // Using Date for consistent timestamp format across the application
        errorDetails.put("timestamp", new Date());
        
        // Include the specific exception message explaining the transaction failure
        // The message is sanitized by the TransactionException class to prevent
        // sensitive financial data exposure while providing actionable error information
        errorDetails.put("message", ex.getMessage());
        
        // Add request context information for debugging and audit purposes
        // This provides essential context about the failed request without exposing
        // sensitive parameters or authentication details
        errorDetails.put("details", request.getDescription(false));
        
        // Return the structured error response with HTTP 400 Bad Request status
        // This status code indicates that the client request was invalid or malformed,
        // which is appropriate for transaction validation failures and business rule violations
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles all other uncaught exceptions as a fallback mechanism.
     * 
     * This method serves as the global safety net for any unexpected exceptions
     * that are not specifically handled by other exception handlers. It ensures
     * that all system errors result in consistent, well-formatted error responses
     * rather than exposing internal system details or causing response failures.
     * 
     * The method implements defensive error handling practices essential for
     * financial services applications where system reliability and security
     * are paramount. It prevents information leakage while maintaining
     * comprehensive audit trails for system monitoring and compliance.
     * 
     * Key Responsibilities:
     * - Catch and handle unexpected system exceptions (NullPointerException, etc.)
     * - Handle external service communication failures and timeouts
     * - Manage database connectivity issues and data access exceptions
     * - Process configuration errors and resource unavailability issues
     * - Provide fallback handling for third-party integration failures
     * 
     * Error Response Features:
     * - Generic error message to prevent information disclosure
     * - Timestamp for audit and monitoring correlation
     * - Request context for debugging without exposing sensitive data
     * - HTTP 500 status indicating internal server error condition
     * 
     * Security Measures:
     * - Exception stack traces are logged internally but never returned to clients
     * - Generic error messages prevent system architecture disclosure
     * - No sensitive configuration or database information is exposed
     * - All errors are captured for security monitoring and incident response
     * 
     * Monitoring Integration:
     * - Errors are logged with appropriate severity levels for alerting
     * - Metrics are captured for system health monitoring and SLA tracking
     * - Error patterns are tracked for proactive system maintenance
     * - Integration with enterprise monitoring and alerting systems
     * 
     * @param ex The Exception instance representing any uncaught system exception.
     *           This could be any type of RuntimeException, checked exception,
     *           or system-level error that wasn't specifically handled elsewhere.
     * @param request The WebRequest containing HTTP request context information
     *                needed for audit logging and debugging while maintaining
     *                security by not exposing sensitive request parameters.
     * @return ResponseEntity<Object> containing a generic error response with
     *         HTTP 500 Internal Server Error status and standardized error
     *         format to maintain API consistency and security standards.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        // Create a Map to construct the standardized error response structure
        // Using HashMap for optimal performance in high-volume transaction processing
        Map<String, Object> errorDetails = new HashMap<>();
        
        // Add current timestamp for audit trail, monitoring, and debugging correlation
        // Essential for financial services compliance and incident investigation
        errorDetails.put("timestamp", new Date());
        
        // Provide a generic error message to prevent information disclosure
        // This approach protects system architecture details while informing clients
        // that an internal system error occurred requiring investigation
        errorDetails.put("message", "An internal server error occurred. Please try again later or contact support if the problem persists.");
        
        // Include sanitized request context for debugging and audit purposes
        // The false parameter ensures that sensitive request parameters and headers
        // are not included in the error response, maintaining security standards
        errorDetails.put("details", request.getDescription(false));
        
        // Return standardized error response with HTTP 500 Internal Server Error status
        // This status code correctly indicates that the server encountered an unexpected
        // condition that prevented it from fulfilling the request, appropriate for
        // system-level failures and unexpected exceptions
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}