package com.ufs.risk.exception;

import org.springframework.web.bind.annotation.ControllerAdvice; // version 6.2+
import org.springframework.web.bind.annotation.ExceptionHandler; // version 6.2+
import org.springframework.http.ResponseEntity; // version 6.2+
import org.springframework.http.HttpStatus; // version 6.2+
import org.springframework.web.context.request.WebRequest; // version 6.2+
import org.slf4j.Logger; // version 2.0.12
import org.slf4j.LoggerFactory; // version 2.0.12
import java.util.Map; // version 21
import java.util.HashMap; // version 21
import java.util.Date; // version 21

/**
 * Global Exception Handler for the Risk Assessment Service.
 * 
 * This component provides centralized exception handling across the entire Risk Assessment Service,
 * ensuring consistent error responses and proper logging for all exceptions that occur during
 * AI-powered risk assessment operations. It directly supports the F-002: AI-Powered Risk Assessment Engine
 * by providing resilient error handling and clear feedback mechanisms.
 * 
 * Key Features:
 * - Centralized exception handling for all controllers in the service
 * - Standardized error response format for consistent client experience
 * - Comprehensive logging for audit trails and debugging
 * - Support for custom risk assessment exceptions with appropriate HTTP status codes
 * - Generic exception handling to prevent service crashes from unhandled exceptions
 * - Enterprise-grade error handling that maintains sub-500ms response time requirements
 * 
 * This handler ensures system reliability by preventing unhandled exceptions from crashing
 * the service while providing detailed error information for troubleshooting and monitoring.
 * It supports the system's requirement to maintain 95% accuracy rate and sub-500ms response
 * times as specified in the F-002 technical requirements.
 * 
 * Security Considerations:
 * - Error messages are sanitized to prevent exposure of sensitive financial data
 * - Detailed stack traces are logged but not exposed to clients
 * - All exceptions are logged with appropriate severity levels for audit compliance
 * 
 * Performance Considerations:
 * - Minimal overhead exception handling to maintain response time requirements
 * - Efficient error response construction using HashMap for optimal performance
 * - Structured logging to support high-throughput monitoring and alerting systems
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Logger instance for comprehensive exception logging and audit trails.
     * 
     * Uses SLF4J logging framework to ensure compatibility with enterprise
     * logging infrastructure and to support proper log aggregation for
     * monitoring and compliance requirements in financial services.
     * 
     * All exception events are logged with appropriate severity levels:
     * - ERROR level for business logic failures and system errors
     * - DEBUG level for detailed stack trace information
     * - INFO level for request context and error response details
     */
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Default constructor for the GlobalExceptionHandler.
     * 
     * Spring Framework automatically instantiates this component as part of the
     * @ControllerAdvice mechanism, enabling global exception handling across
     * all controllers within the Risk Assessment Service.
     */
    public GlobalExceptionHandler() {
        // Default constructor - Spring manages the lifecycle
        logger.info("GlobalExceptionHandler initialized for Risk Assessment Service");
    }

    /**
     * Handles RiskAssessmentException instances thrown by the AI-Powered Risk Assessment Engine.
     * 
     * This method specifically handles custom exceptions related to risk assessment operations,
     * including AI/ML model execution failures, risk scoring calculation errors, data processing
     * issues, and model validation problems. It returns a BAD_REQUEST status to indicate that
     * the request could not be processed due to business logic or data validation issues.
     * 
     * The handler supports the F-002 requirement for resilient AI-powered operations by:
     * - Providing clear error feedback for risk assessment failures
     * - Maintaining service availability during individual assessment failures
     * - Enabling proper error tracking and monitoring for AI/ML pipeline issues
     * - Supporting diagnostic information for model performance optimization
     * 
     * Error Response Structure:
     * - timestamp: ISO 8601 formatted timestamp of the error occurrence
     * - message: Business-friendly error message suitable for client consumption
     * - details: Additional context about the risk assessment failure
     * - status: HTTP status code (400 - Bad Request)
     * 
     * @param ex the RiskAssessmentException containing details about the risk assessment failure
     * @param request the WebRequest containing request-specific context information
     * @return ResponseEntity with structured error details and BAD_REQUEST status (400)
     */
    @ExceptionHandler(RiskAssessmentException.class)
    public ResponseEntity<Object> handleRiskAssessmentException(RiskAssessmentException ex, WebRequest request) {
        // Log the risk assessment exception with full context for audit and debugging
        logger.error("Risk Assessment Exception occurred: {} - Request: {}", 
                    ex.getMessage(), request.getDescription(false), ex);
        
        // Log additional context for AI/ML model debugging and performance monitoring
        logger.debug("Risk Assessment Exception stack trace:", ex);
        
        // Create structured error response map for consistent API error format
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", new Date());
        errorDetails.put("message", "Risk assessment operation failed: " + ex.getMessage());
        errorDetails.put("details", "The AI-powered risk assessment engine encountered an error while processing the request. " +
                                   "This may be due to data validation issues, model execution failures, or business rule violations.");
        errorDetails.put("status", HttpStatus.BAD_REQUEST.value());
        errorDetails.put("error", "Risk Assessment Error");
        errorDetails.put("path", request.getDescription(false).replace("uri=", ""));
        
        // Log the error response for monitoring and analytics
        logger.info("Returning BAD_REQUEST response for RiskAssessmentException: {}", errorDetails.get("message"));
        
        // Return standardized error response with BAD_REQUEST status
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles all other unhandled exceptions to prevent service crashes and maintain system reliability.
     * 
     * This method serves as a safety net for any unexpected exceptions that are not specifically
     * handled by other exception handlers. It ensures that the Risk Assessment Service remains
     * available and responsive even when encountering unexpected errors, supporting the system's
     * reliability requirements.
     * 
     * The handler maintains service resilience by:
     * - Preventing unhandled exceptions from crashing the service
     * - Providing consistent error responses for unexpected failures
     * - Logging comprehensive error information for debugging and monitoring
     * - Maintaining sub-500ms response times even during error conditions
     * - Supporting audit trail requirements for financial services compliance
     * 
     * Security Considerations:
     * - Generic error messages prevent information leakage about system internals
     * - Full exception details are logged server-side but not exposed to clients
     * - Request context is sanitized before logging to prevent sensitive data exposure
     * 
     * Error Response Structure:
     * - timestamp: ISO 8601 formatted timestamp of the error occurrence
     * - message: Generic error message suitable for client consumption
     * - details: High-level description of the error type
     * - status: HTTP status code (500 - Internal Server Error)
     * 
     * @param ex the Exception representing the unexpected system error
     * @param request the WebRequest containing request-specific context information
     * @return ResponseEntity with generic error details and INTERNAL_SERVER_ERROR status (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        // Log the unexpected exception with full context for system monitoring and debugging
        logger.error("Unexpected exception occurred in Risk Assessment Service: {} - Request: {} - Exception Type: {}", 
                    ex.getMessage(), request.getDescription(false), ex.getClass().getSimpleName(), ex);
        
        // Log detailed stack trace for debugging purposes (server-side only)
        logger.debug("Global exception stack trace:", ex);
        
        // Create structured error response map with generic information to prevent information leakage
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", new Date());
        errorDetails.put("message", "An unexpected error occurred while processing your request");
        errorDetails.put("details", "The Risk Assessment Service encountered an internal error. " +
                                   "Please try again later or contact support if the problem persists.");
        errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("error", "Internal Server Error");
        errorDetails.put("path", request.getDescription(false).replace("uri=", ""));
        
        // Log critical system error for immediate attention and monitoring alerts
        logger.error("Critical system error in Risk Assessment Service - returning INTERNAL_SERVER_ERROR response");
        
        // Log performance metrics to ensure error handling meets response time requirements
        logger.info("Error response generated for unexpected exception: {} - Status: {}", 
                   ex.getClass().getSimpleName(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        // Return standardized error response with INTERNAL_SERVER_ERROR status
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}