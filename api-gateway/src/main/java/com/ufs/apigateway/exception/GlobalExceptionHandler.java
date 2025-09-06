package com.ufs.apigateway.exception;

import org.springframework.web.bind.annotation.ControllerAdvice; // Spring Boot 6.0.13
import org.springframework.web.bind.annotation.ExceptionHandler; // Spring Boot 6.0.13
import org.springframework.http.ResponseEntity; // Spring Boot 6.0.13
import org.springframework.http.HttpStatus; // Spring Boot 6.0.13
import org.slf4j.Logger; // SLF4J 2.0.7
import org.slf4j.LoggerFactory; // SLF4J 2.0.7
import java.util.Map; // Java 1.8
import java.util.Date; // Java 1.8
import java.util.HashMap;
import java.util.UUID;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationException;
import org.springframework.web.servlet.NoHandlerFoundException;
import java.nio.file.AccessDeniedException as NioAccessDeniedException;
import javax.validation.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

/**
 * Global Exception Handler for the API Gateway
 * 
 * This class provides centralized exception handling for all routes and filters
 * within the API Gateway application. It ensures consistent error responses,
 * comprehensive logging, and compliance with financial industry standards.
 * 
 * Features:
 * - Standardized JSON error response format
 * - Comprehensive audit logging for compliance
 * - Security-aware error message sanitization
 * - Performance monitoring for error tracking
 * - Support for multiple exception types
 * 
 * Compliance: Implements error handling patterns as per section 5.4.3
 * Security: Ensures no sensitive information leakage in error responses
 * Performance: Sub-second response times for error handling
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Logger instance for comprehensive error logging and audit trails
     * Critical for financial services compliance and operational monitoring
     */
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Application name constant for consistent error response identification
     */
    private static final String APPLICATION_NAME = "UFS-API-Gateway";

    /**
     * Default constructor
     * Initializes the global exception handler with default configuration
     */
    public GlobalExceptionHandler() {
        // Default constructor - no initialization required
        logger.info("GlobalExceptionHandler initialized for {}", APPLICATION_NAME);
    }

    /**
     * Handles all uncaught exceptions as a last resort
     * 
     * This method serves as the final safety net for any exceptions that are not
     * caught by more specific exception handlers. It ensures that no exception
     * goes unhandled and provides a consistent error response format.
     * 
     * @param ex The exception that was thrown
     * @param request The web request that triggered the exception
     * @return ResponseEntity containing standardized error response with HTTP 500 status
     * 
     * Logging: Comprehensive error logging for audit trails
     * Security: Sanitizes error messages to prevent information disclosure
     * Performance: Optimized for sub-second response times
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, WebRequest request) {
        // Generate unique correlation ID for error tracking and debugging
        String correlationId = UUID.randomUUID().toString();
        
        // Log the full stack trace at ERROR level for comprehensive audit trail
        logger.error("Unhandled exception caught in GlobalExceptionHandler - Correlation ID: {} | Request: {} | Exception: {}", 
                    correlationId, getRequestDetails(request), ex.getClass().getSimpleName(), ex);
        
        // Create standardized error response map
        Map<String, Object> errorResponse = new HashMap<>();
        
        // Add timestamp for audit and debugging purposes
        errorResponse.put("timestamp", new Date());
        
        // Set HTTP status code
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        // Set HTTP status reason phrase
        errorResponse.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        
        // Sanitized error message - no sensitive information exposed
        errorResponse.put("message", "An internal server error occurred. Please contact system administrator.");
        
        // Additional error details for operational purposes
        errorResponse.put("details", "The system encountered an unexpected error while processing your request.");
        
        // Request path for debugging (if available)
        String requestPath = extractRequestPath(request);
        if (requestPath != null) {
            errorResponse.put("path", requestPath);
        }
        
        // Correlation ID for error tracking and support
        errorResponse.put("correlationId", correlationId);
        
        // Application identifier
        errorResponse.put("application", APPLICATION_NAME);
        
        // Log the error response for monitoring and compliance
        logger.warn("Error response generated - Correlation ID: {} | Status: {} | Message: {}", 
                   correlationId, HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error");
        
        // Return standardized error response with HTTP 500 status
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles authentication-related exceptions
     * Provides specific handling for authentication failures
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("Authentication failure - Correlation ID: {} | Request: {} | Exception: {}", 
                   correlationId, getRequestDetails(request), ex.getMessage());
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
        errorResponse.put("error", HttpStatus.UNAUTHORIZED.getReasonPhrase());
        errorResponse.put("message", "Authentication required to access this resource");
        errorResponse.put("details", "Please provide valid authentication credentials");
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles authorization-related exceptions
     * Provides specific handling for access denied scenarios
     */
    @ExceptionHandler({AccessDeniedException.class, NioAccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(Exception ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("Access denied - Correlation ID: {} | Request: {} | User: {} | Exception: {}", 
                   correlationId, getRequestDetails(request), getCurrentUser(request), ex.getMessage());
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.FORBIDDEN.value());
        errorResponse.put("error", HttpStatus.FORBIDDEN.getReasonPhrase());
        errorResponse.put("message", "Access denied to the requested resource");
        errorResponse.put("details", "You do not have sufficient privileges to access this resource");
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles HTTP method not supported exceptions
     * Provides specific handling for unsupported HTTP methods
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("HTTP method not supported - Correlation ID: {} | Request: {} | Method: {} | Supported: {}", 
                   correlationId, getRequestDetails(request), ex.getMethod(), ex.getSupportedHttpMethods());
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());
        errorResponse.put("error", HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase());
        errorResponse.put("message", String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()));
        errorResponse.put("details", String.format("Supported methods: %s", ex.getSupportedHttpMethods()));
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Handles validation exceptions for request parameters and body
     * Provides specific handling for input validation failures
     */
    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class, 
                      MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class,
                      HttpMessageNotReadableException.class})
    public ResponseEntity<Map<String, Object>> handleValidationException(Exception ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("Validation error - Correlation ID: {} | Request: {} | Exception: {}", 
                   correlationId, getRequestDetails(request), ex.getMessage());
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
        errorResponse.put("message", "Invalid request parameters or format");
        errorResponse.put("details", "Please check your request parameters and try again");
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles resource not found exceptions
     * Provides specific handling for 404 scenarios
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NoHandlerFoundException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("Resource not found - Correlation ID: {} | Request: {} | URL: {}", 
                   correlationId, getRequestDetails(request), ex.getRequestURL());
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.NOT_FOUND.value());
        errorResponse.put("error", HttpStatus.NOT_FOUND.getReasonPhrase());
        errorResponse.put("message", "The requested resource was not found");
        errorResponse.put("details", "Please verify the request URL and try again");
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles database and data access exceptions
     * Provides specific handling for data layer errors
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.error("Data access error - Correlation ID: {} | Request: {} | Exception: {}", 
                    correlationId, getRequestDetails(request), ex.getClass().getSimpleName(), ex);
        
        Map<String, Object> errorResponse = createBaseErrorResponse(correlationId);
        errorResponse.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        errorResponse.put("error", HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase());
        errorResponse.put("message", "Service temporarily unavailable");
        errorResponse.put("details", "A temporary issue occurred while processing your request. Please try again later");
        addRequestPath(errorResponse, request);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    /**
     * Creates a base error response map with common fields
     * 
     * @param correlationId Unique correlation ID for error tracking
     * @return Map containing base error response structure
     */
    private Map<String, Object> createBaseErrorResponse(String correlationId) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", new Date());
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("application", APPLICATION_NAME);
        return errorResponse;
    }

    /**
     * Adds request path to error response if available
     * 
     * @param errorResponse The error response map to modify
     * @param request The web request
     */
    private void addRequestPath(Map<String, Object> errorResponse, WebRequest request) {
        String requestPath = extractRequestPath(request);
        if (requestPath != null) {
            errorResponse.put("path", requestPath);
        }
    }

    /**
     * Extracts request path from WebRequest for logging and error response
     * 
     * @param request The web request
     * @return Request path or null if not available
     */
    private String extractRequestPath(WebRequest request) {
        try {
            return request.getDescription(false).replace("uri=", "");
        } catch (Exception e) {
            logger.debug("Could not extract request path", e);
            return null;
        }
    }

    /**
     * Gets detailed request information for logging purposes
     * 
     * @param request The web request
     * @return String containing request details
     */
    private String getRequestDetails(WebRequest request) {
        try {
            StringBuilder details = new StringBuilder();
            details.append("Path: ").append(extractRequestPath(request));
            details.append(" | Headers: ").append(request.getHeaderNames());
            return details.toString();
        } catch (Exception e) {
            logger.debug("Could not extract detailed request information", e);
            return "Request details unavailable";
        }
    }

    /**
     * Gets current user information from the request context
     * 
     * @param request The web request
     * @return Current user identifier or 'anonymous' if not available
     */
    private String getCurrentUser(WebRequest request) {
        try {
            // In a real implementation, this would extract user info from security context
            // For now, return a placeholder
            return request.getRemoteUser() != null ? request.getRemoteUser() : "anonymous";
        } catch (Exception e) {
            logger.debug("Could not extract user information", e);
            return "unknown";
        }
    }
}