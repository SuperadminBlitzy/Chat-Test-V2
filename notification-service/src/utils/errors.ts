/**
 * Custom Error Classes for Notification Service
 * 
 * This module defines custom error classes that provide structured error handling
 * throughout the notification service. These error classes are designed for
 * financial services reliability requirements and provide enhanced context
 * over generic Error objects.
 * 
 * All error classes extend the base ApiError class which includes HTTP status codes
 * for proper API response handling in the financial services platform.
 */

/**
 * Base class for custom API errors, extending the built-in Error class with an HTTP status code.
 * 
 * This class serves as the foundation for all custom errors in the notification service,
 * providing consistent error structure with HTTP status codes for proper API responses.
 * Designed to meet financial services reliability and compliance requirements.
 */
export class ApiError extends Error {
    /**
     * HTTP status code associated with this error
     */
    public readonly statusCode: number;

    /**
     * Initializes a new instance of the ApiError class.
     * 
     * @param statusCode - The HTTP status code for this error (e.g., 400, 404, 500)
     * @param message - The error message describing what went wrong
     */
    constructor(statusCode: number, message: string) {
        // Call the parent Error constructor with the message
        super(message);
        
        // Set the statusCode property
        this.statusCode = statusCode;
        
        // Ensure the error name matches the class name for better debugging
        this.name = this.constructor.name;
        
        // Capture the stack trace, excluding the constructor call from the stack trace
        // This provides cleaner stack traces for debugging in production environments
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Represents a 404 Not Found error. Extends ApiError.
 * 
 * Used when a requested resource (such as a notification template, user, or configuration)
 * cannot be found in the system. Common in financial services when accessing
 * customer data, transaction records, or regulatory templates that don't exist.
 */
export class NotFoundError extends ApiError {
    /**
     * Initializes a new instance of the NotFoundError class.
     * 
     * @param message - Optional custom error message. Defaults to 'Not Found'
     */
    constructor(message: string = 'Not Found') {
        // Call the parent ApiError constructor with a 404 status code and the provided message
        super(404, message);
    }
}

/**
 * Represents a 400 Bad Request error. Extends ApiError.
 * 
 * Used when client requests contain invalid data, malformed JSON, missing required fields,
 * or violate business rules. Critical for financial services data validation where
 * incorrect customer information or transaction data could lead to compliance issues.
 */
export class BadRequestError extends ApiError {
    /**
     * Initializes a new instance of the BadRequestError class.
     * 
     * @param message - Optional custom error message. Defaults to 'Bad Request'
     */
    constructor(message: string = 'Bad Request') {
        // Call the parent ApiError constructor with a 400 status code and the provided message
        super(400, message);
    }
}

/**
 * Custom error for notification-specific issues, such as template not found or provider failure. Extends ApiError.
 * 
 * This error class handles notification service-specific problems including:
 * - Email/SMS template not found or invalid
 * - Third-party notification provider failures (e.g., SendGrid, Twilio)
 * - Message formatting or validation errors
 * - Regulatory compliance violations in notification content
 * - Rate limiting exceeded for notification sending
 * 
 * Designed for financial services where notification failures can impact
 * customer communications, regulatory reporting, and compliance requirements.
 */
export class NotificationError extends ApiError {
    /**
     * Initializes a new instance of the NotificationError class.
     * 
     * @param message - Optional custom error message. Defaults to 'Notification service error'
     * @param statusCode - Optional HTTP status code. Defaults to 500 (Internal Server Error)
     */
    constructor(message: string = 'Notification service error', statusCode: number = 500) {
        // Call the parent ApiError constructor with the provided status code and message
        super(statusCode, message);
    }
}