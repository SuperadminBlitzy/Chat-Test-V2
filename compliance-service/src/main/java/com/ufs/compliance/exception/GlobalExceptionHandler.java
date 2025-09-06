package com.ufs.compliance.exception;

import org.springframework.http.ResponseEntity; // Spring Web 6.0.13
import org.springframework.web.bind.annotation.ExceptionHandler; // Spring Web 6.0.13
import org.springframework.web.bind.annotation.RestControllerAdvice; // Spring Web 6.0.13
import org.springframework.http.HttpStatus; // Spring Web 6.0.13
import org.slf4j.Logger; // SLF4J 2.0.9
import org.slf4j.LoggerFactory; // SLF4J 2.0.9
import org.springframework.web.context.request.WebRequest; // Spring Web 6.0.13
import org.springframework.web.bind.MethodArgumentNotValidException; // Spring Web 6.0.13
import org.springframework.validation.BindException; // Spring Context 6.0.13
import org.springframework.web.HttpRequestMethodNotSupportedException; // Spring Web 6.0.13
import org.springframework.web.HttpMediaTypeNotSupportedException; // Spring Web 6.0.13
import org.springframework.web.bind.MissingServletRequestParameterException; // Spring Web 6.0.13
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException; // Spring Web 6.0.13
import org.springframework.dao.DataAccessException; // Spring TX 6.0.13
import org.springframework.security.access.AccessDeniedException; // Spring Security 6.0.7
import org.springframework.security.authentication.AuthenticationException; // Spring Security 6.0.7

import javax.validation.ConstraintViolationException; // Validation API 3.0.2
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global exception handler for the compliance service that provides centralized exception handling
 * across the entire application. This handler is integral to the F-003: Regulatory Compliance 
 * Automation feature, ensuring that all exceptions are properly handled, logged, and reported
 * for compliance and audit purposes.
 * 
 * This handler supports the regulatory compliance automation requirements by:
 * - Providing consistent error response formats for compliance reporting
 * - Maintaining comprehensive audit trails for all exceptions
 * - Ensuring proper error categorization for regulatory monitoring
 * - Supporting real-time compliance status monitoring through standardized error responses
 * 
 * The handler implements enterprise-grade error handling patterns required for financial
 * services platforms, including structured logging, correlation IDs for traceability,
 * and compliance-specific error categorization that aligns with SOC2, PCI DSS, and
 * GDPR requirements.
 * 
 * Key capabilities:
 * - Handles ComplianceException with detailed compliance context
 * - Provides generic exception handling with security-conscious error messages
 * - Maintains audit trails with correlation IDs for complete traceability
 * - Supports regulatory reporting through structured error data
 * - Implements security best practices by not exposing internal system details
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 1.0
 * 
 * @see ComplianceException
 * @see RestControllerAdvice
 * @see ExceptionHandler
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Logger instance for comprehensive audit logging and monitoring.
     * All exceptions are logged with correlation IDs and structured data
     * to support compliance reporting and audit trail requirements.
     */
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Date-time formatter for consistent timestamp formatting across all error responses.
     * Uses ISO-8601 format for standardized regulatory reporting compatibility.
     */
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    /**
     * Default constructor for the GlobalExceptionHandler.
     * Initializes the handler with comprehensive logging configuration
     * to support regulatory compliance and audit requirements.
     */
    public GlobalExceptionHandler() {
        logger.info("GlobalExceptionHandler initialized for compliance service - Ready for F-003 Regulatory Compliance Automation");
    }

    /**
     * Handles ComplianceException instances thrown throughout the compliance service.
     * This method is specifically designed to handle business logic errors related to
     * regulatory compliance operations and provides detailed error information for
     * compliance monitoring and audit purposes.
     * 
     * The method supports F-003: Regulatory Compliance Automation by:
     * - Logging detailed compliance-specific error information
     * - Generating correlation IDs for complete audit trail tracking
     * - Providing structured error responses for regulatory reporting
     * - Maintaining compliance context for downstream error analysis
     * 
     * Error scenarios handled include:
     * - Regulatory update processing failures
     * - Compliance report generation errors
     * - Policy validation failures
     * - Audit trail management issues
     * - Real-time compliance monitoring failures
     * 
     * @param ex the ComplianceException that occurred during compliance operations
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 400 Bad Request status and detailed error information
     *         including correlation ID, timestamp, and compliance-specific error details
     */
    @ExceptionHandler(ComplianceException.class)
    public ResponseEntity<Map<String, Object>> handleComplianceException(ComplianceException ex, WebRequest request) {
        // Generate unique correlation ID for complete audit trail tracking
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        // Log the compliance exception with comprehensive context for audit purposes
        logger.error("COMPLIANCE_EXCEPTION occurred - CorrelationId: {} | Message: {} | Request: {} | Timestamp: {}", 
                    correlationId, ex.getMessage(), request.getDescription(false), timestamp, ex);
        
        // Log additional compliance-specific context if the exception has a cause
        if (ex.getCause() != null) {
            logger.error("COMPLIANCE_EXCEPTION root cause - CorrelationId: {} | Cause: {} | CauseMessage: {}", 
                        correlationId, ex.getCause().getClass().getSimpleName(), ex.getCause().getMessage());
        }
        
        // Create structured error response for compliance monitoring and reporting
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Compliance Exception");
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "COMPLIANCE_VIOLATION");
        
        // Add audit trail metadata for regulatory reporting
        Map<String, String> auditMetadata = new HashMap<>();
        auditMetadata.put("exceptionType", ex.getClass().getSimpleName());
        auditMetadata.put("severity", "HIGH");
        auditMetadata.put("complianceImpact", "REGULATORY_REPORTING_REQUIRED");
        auditMetadata.put("remediationRequired", "true");
        errorResponse.put("auditMetadata", auditMetadata);
        
        // Log structured error response for compliance monitoring systems
        logger.warn("COMPLIANCE_EXCEPTION response generated - CorrelationId: {} | Status: {} | ComplianceContext: F-003", 
                   correlationId, HttpStatus.BAD_REQUEST.value());
        
        // Return structured response with BAD_REQUEST status as defined in ComplianceException annotation
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles all other exceptions not specifically handled by other exception handlers.
     * This method provides a security-conscious approach to error handling by not exposing
     * internal system details while maintaining comprehensive audit logging for compliance
     * and monitoring purposes.
     * 
     * The method supports enterprise security requirements by:
     * - Providing generic error messages that don't expose system internals
     * - Logging detailed technical information for internal debugging and audit
     * - Generating correlation IDs for complete error traceability
     * - Maintaining structured error responses for monitoring systems
     * 
     * This handler serves as the final safety net for all unexpected exceptions,
     * ensuring that the compliance service remains resilient and provides consistent
     * error responses even when encountering unforeseen technical issues.
     * 
     * @param ex the generic Exception that occurred in the system
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 500 Internal Server Error status and generic error message
     *         that maintains security while providing necessary information for operations
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, WebRequest request) {
        // Generate unique correlation ID for complete audit trail tracking
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        // Log the generic exception with comprehensive technical details for internal debugging
        logger.error("GENERIC_EXCEPTION occurred - CorrelationId: {} | ExceptionType: {} | Message: {} | Request: {} | Timestamp: {}", 
                    correlationId, ex.getClass().getSimpleName(), ex.getMessage(), request.getDescription(false), timestamp, ex);
        
        // Log stack trace information for technical analysis while maintaining security
        logger.error("GENERIC_EXCEPTION stack trace - CorrelationId: {} | StackTrace: {}", 
                    correlationId, java.util.Arrays.toString(ex.getStackTrace()));
        
        // Create security-conscious error response that doesn't expose internal system details
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", "An unexpected error occurred. Please contact system administrator if the issue persists.");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "SYSTEM_ERROR");
        
        // Add audit trail metadata for operational monitoring
        Map<String, String> auditMetadata = new HashMap<>();
        auditMetadata.put("exceptionType", ex.getClass().getSimpleName());
        auditMetadata.put("severity", "CRITICAL");
        auditMetadata.put("operationalImpact", "SERVICE_DEGRADATION_POSSIBLE");
        auditMetadata.put("investigationRequired", "true");
        errorResponse.put("auditMetadata", auditMetadata);
        
        // Log structured error response for monitoring and alerting systems
        logger.error("GENERIC_EXCEPTION response generated - CorrelationId: {} | Status: {} | SecurityMessage: Generic error response provided", 
                    correlationId, HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        // Return generic error response with INTERNAL_SERVER_ERROR status
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles validation exceptions that occur during request processing.
     * This method specifically handles method argument validation failures
     * and provides detailed validation error information for client applications.
     * 
     * @param ex the MethodArgumentNotValidException containing validation errors
     * @param request the web request context where the validation failed
     * @return ResponseEntity with HTTP 400 Bad Request status and validation error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.warn("VALIDATION_EXCEPTION occurred - CorrelationId: {} | Request: {} | Timestamp: {}", 
                   correlationId, request.getDescription(false), timestamp);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Validation Failed");
        errorResponse.put("message", "Request validation failed");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "VALIDATION_ERROR");
        
        // Extract validation errors for detailed response
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            validationErrors.put(error.getField(), error.getDefaultMessage()));
        errorResponse.put("validationErrors", validationErrors);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles constraint violation exceptions from Bean Validation.
     * 
     * @param ex the ConstraintViolationException containing constraint violations
     * @param request the web request context where the violation occurred
     * @return ResponseEntity with HTTP 400 Bad Request status and constraint violation details
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.warn("CONSTRAINT_VIOLATION_EXCEPTION occurred - CorrelationId: {} | Message: {} | Request: {}", 
                   correlationId, ex.getMessage(), request.getDescription(false));
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Constraint Violation");
        errorResponse.put("message", "Request constraints violated");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "CONSTRAINT_VIOLATION");
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles data access exceptions that occur during database operations.
     * 
     * @param ex the DataAccessException that occurred during data access
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 500 Internal Server Error status
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.error("DATA_ACCESS_EXCEPTION occurred - CorrelationId: {} | Message: {} | Request: {}", 
                    correlationId, ex.getMessage(), request.getDescription(false), ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Data Access Error");
        errorResponse.put("message", "A database error occurred. Please try again later.");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "DATABASE_ERROR");
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles authentication exceptions for security-related errors.
     * 
     * @param ex the AuthenticationException that occurred during authentication
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 401 Unauthorized status
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.warn("AUTHENTICATION_EXCEPTION occurred - CorrelationId: {} | Request: {} | UserAgent: {}", 
                   correlationId, request.getDescription(false), request.getHeader("User-Agent"));
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
        errorResponse.put("error", "Authentication Failed");
        errorResponse.put("message", "Authentication credentials are required");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "AUTHENTICATION_ERROR");
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles access denied exceptions for authorization-related errors.
     * 
     * @param ex the AccessDeniedException that occurred during authorization
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 403 Forbidden status
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.warn("ACCESS_DENIED_EXCEPTION occurred - CorrelationId: {} | Request: {} | Message: {}", 
                   correlationId, request.getDescription(false), ex.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.FORBIDDEN.value());
        errorResponse.put("error", "Access Denied");
        errorResponse.put("message", "Insufficient privileges to access this resource");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "AUTHORIZATION_ERROR");
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles HTTP method not supported exceptions.
     * 
     * @param ex the HttpRequestMethodNotSupportedException that occurred
     * @param request the web request context where the exception occurred
     * @return ResponseEntity with HTTP 405 Method Not Allowed status
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        String correlationId = UUID.randomUUID().toString();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        logger.warn("METHOD_NOT_SUPPORTED_EXCEPTION occurred - CorrelationId: {} | Method: {} | Request: {}", 
                   correlationId, ex.getMethod(), request.getDescription(false));
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", timestamp);
        errorResponse.put("correlationId", correlationId);
        errorResponse.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());
        errorResponse.put("error", "Method Not Allowed");
        errorResponse.put("message", String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()));
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("supportedMethods", ex.getSupportedMethods());
        errorResponse.put("complianceContext", "F-003: Regulatory Compliance Automation");
        errorResponse.put("errorCategory", "METHOD_NOT_ALLOWED");
        
        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }
}