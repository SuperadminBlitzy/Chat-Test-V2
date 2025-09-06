package com.ufs.analytics.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // Spring Framework 6.0.13
import org.springframework.http.HttpStatus; // Spring Framework 6.0.13

/**
 * Custom exception class for handling analytics-service specific errors.
 * 
 * This exception is designed to handle errors that occur during analytics operations
 * in the financial services platform. It follows the enterprise-grade error handling
 * patterns required for financial services reliability and regulatory compliance.
 * 
 * The exception is automatically mapped to HTTP 500 Internal Server Error status
 * when thrown from REST endpoints, providing consistent error responses to clients.
 * 
 * Usage scenarios include:
 * - Analytics data processing failures
 * - Model computation errors
 * - Risk assessment calculation issues
 * - Reporting generation failures
 * - Statistical analysis errors
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AnalyticsException extends RuntimeException {
    
    /**
     * Serial version UID for serialization compatibility.
     * This ensures that the exception can be properly serialized and deserialized
     * across different versions of the application, which is critical for
     * distributed microservices architecture.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Constructs a new AnalyticsException with the specified detail message.
     * 
     * This constructor creates an exception with a descriptive error message
     * that can be used for logging, debugging, and error reporting purposes.
     * The message should be clear and actionable to help with troubleshooting
     * analytics-related issues in the financial services platform.
     * 
     * @param message the detail message explaining the reason for the exception.
     *               This message should be descriptive and provide context about
     *               the specific analytics operation that failed.
     */
    public AnalyticsException(String message) {
        // Call the superclass constructor with the provided message
        // This ensures proper initialization of the RuntimeException hierarchy
        super(message);
    }
    
    /**
     * Constructs a new AnalyticsException with the specified detail message
     * and underlying cause.
     * 
     * This constructor is useful when wrapping lower-level exceptions that
     * occurred during analytics operations, preserving the original stack trace
     * while providing analytics-specific context.
     * 
     * @param message the detail message explaining the reason for the exception
     * @param cause the underlying cause of this exception, typically another
     *              exception that was caught and re-thrown as an AnalyticsException
     */
    public AnalyticsException(String message, Throwable cause) {
        // Call the superclass constructor with message and cause
        // This preserves the complete exception chain for debugging
        super(message, cause);
    }
    
    /**
     * Constructs a new AnalyticsException with the specified underlying cause.
     * 
     * This constructor is useful when the underlying cause provides sufficient
     * error context and no additional message is needed.
     * 
     * @param cause the underlying cause of this exception
     */
    public AnalyticsException(Throwable cause) {
        // Call the superclass constructor with the cause
        // This allows the underlying exception's message to be used
        super(cause);
    }
}