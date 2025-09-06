package com.ufs.transaction.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // Spring Framework 6.0.13
import org.springframework.http.HttpStatus; // Spring Framework 6.0.13

/**
 * Custom runtime exception for handling transaction-specific errors within the transaction service.
 * 
 * This exception is designed to provide clear and specific error handling for transaction-related
 * operations that fail during processing. It integrates with Spring's error handling mechanism
 * by automatically setting the HTTP response status to BAD_REQUEST (400) when the exception
 * is not caught by a more specific exception handler.
 * 
 * Key Features:
 * - Extends RuntimeException for unchecked exception handling
 * - Annotated with @ResponseStatus for automatic HTTP status mapping
 * - Provides consistent error response format for transaction failures
 * - Supports the system's resilient error handling patterns as defined in requirements
 * 
 * Usage Context:
 * This exception should be thrown when:
 * - Transaction validation fails
 * - Business rules are violated during transaction processing
 * - Data integrity issues are detected in transaction operations
 * - External service calls fail during transaction processing
 * - Insufficient funds or account limitations are encountered
 * 
 * The exception will be handled by the global exception handler to provide
 * consistent error responses to clients while maintaining proper logging
 * and monitoring capabilities for the financial services platform.
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 1.0
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TransactionException extends RuntimeException {

    /**
     * Serial version UID for serialization compatibility.
     * This ensures proper serialization/deserialization across different versions
     * of the application, which is critical for distributed microservices architecture.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new TransactionException with the specified detail message.
     * 
     * The message should provide clear, actionable information about what went wrong
     * during transaction processing. This message will be logged for debugging purposes
     * and may be included in error responses to clients (after proper sanitization
     * by the global exception handler).
     * 
     * Best Practices for Exception Messages:
     * - Include relevant transaction identifiers when available
     * - Describe the specific validation or business rule that failed
     * - Avoid exposing sensitive financial data in the message
     * - Use consistent error message formats for easier parsing and handling
     * 
     * Examples of appropriate messages:
     * - "Transaction validation failed: insufficient account balance"
     * - "Invalid transaction type for account category"
     * - "Transaction amount exceeds daily limit"
     * - "External payment service unavailable"
     * 
     * @param message the detail message explaining the cause of the transaction failure.
     *                The message is saved for later retrieval by the getMessage() method
     *                and will be used by the error handling framework for logging and
     *                client response generation.
     */
    public TransactionException(String message) {
        // Call the superclass (RuntimeException) constructor with the provided message
        // This ensures proper exception chain initialization and message handling
        super(message);
    }

    /**
     * Constructs a new TransactionException with the specified detail message and cause.
     * 
     * This constructor is useful when wrapping lower-level exceptions (such as database
     * exceptions, network exceptions, or external service exceptions) into a transaction-specific
     * context. The original exception is preserved in the cause chain for debugging purposes
     * while providing a transaction-focused error message to callers.
     * 
     * @param message the detail message explaining the transaction-specific cause of the failure
     * @param cause the underlying exception that caused this transaction exception.
     *              This will be preserved in the exception chain for debugging and logging
     */
    public TransactionException(String message, Throwable cause) {
        // Call the superclass constructor with both message and cause
        // This maintains the full exception chain while providing transaction-specific context
        super(message, cause);
    }

    /**
     * Constructs a new TransactionException with a cause but no detail message.
     * 
     * This constructor is useful when the underlying exception provides sufficient
     * context and no additional transaction-specific message is needed. The cause's
     * message will be used as the detail message for this exception.
     * 
     * @param cause the underlying exception that caused this transaction exception
     */
    public TransactionException(Throwable cause) {
        // Call the superclass constructor with only the cause
        // The cause's message will become this exception's message
        super(cause);
    }
}