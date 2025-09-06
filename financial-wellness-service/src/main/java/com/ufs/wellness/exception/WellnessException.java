package com.ufs.wellness.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // Spring Framework 6.0.13
import org.springframework.http.HttpStatus; // Spring Framework 6.0.13

/**
 * Custom runtime exception for handling errors within the financial wellness service.
 * 
 * <p>This exception is specifically designed to handle errors that occur during financial 
 * wellness operations, including but not limited to:</p>
 * <ul>
 *   <li>Creating or updating wellness profiles</li>
 *   <li>Retrieving personalized financial recommendations</li>
 *   <li>Processing wellness goals and milestones</li>
 *   <li>Analyzing financial health scores</li>
 *   <li>Integration failures with AI-powered recommendation engine</li>
 * </ul>
 * 
 * <p>This exception supports the F-007: Personalized Financial Recommendations feature
 * by providing consistent error handling across the financial wellness service ecosystem.</p>
 * 
 * <p>When thrown, this exception automatically returns an HTTP 500 Internal Server Error
 * status code to clients, indicating a server-side processing error that requires
 * attention from the development or operations team.</p>
 * 
 * <p><strong>Usage Examples:</strong></p>
 * <pre>
 * // For general wellness service errors
 * throw new WellnessException("Failed to generate personalized financial recommendations");
 * 
 * // For errors with underlying cause
 * throw new WellnessException("Unable to process wellness profile", cause);
 * </pre>
 * 
 * <p><strong>Error Handling Strategy:</strong></p>
 * <p>This exception is designed to be caught by Spring's global exception handler
 * which will log the error details and return appropriate error responses to clients
 * while maintaining security by not exposing internal system details.</p>
 * 
 * @author Financial Wellness Service Team
 * @version 1.0.0
 * @since 1.0.0
 * @see RuntimeException
 * @see ResponseStatus
 * @see HttpStatus
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class WellnessException extends RuntimeException {

    /**
     * Serial version UID for serialization compatibility.
     * This ensures that serialized instances of this exception can be properly
     * deserialized across different versions of the application.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new WellnessException with the specified detail message.
     * 
     * <p>This constructor is used when a specific error condition is encountered
     * during financial wellness operations, such as recommendation generation
     * failures, profile validation errors, or goal processing issues.</p>
     * 
     * <p>The message should be descriptive enough for developers and operations
     * teams to understand the nature of the failure, but should not contain
     * sensitive customer data or internal system details that could pose
     * security risks if logged or exposed.</p>
     * 
     * @param message the detail message explaining the cause of the exception.
     *                This message is saved for later retrieval by the
     *                {@link Throwable#getMessage()} method. Should not be null
     *                or empty for effective error tracking and debugging.
     * 
     * @throws IllegalArgumentException if the message is null or empty
     *                                 (defensive programming practice)
     * 
     * @example
     * <pre>
     * if (wellnessProfile == null) {
     *     throw new WellnessException("Wellness profile not found for customer ID: " + customerId);
     * }
     * </pre>
     */
    public WellnessException(String message) {
        super(message);
        
        // Validate input for defensive programming
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Exception message cannot be null or empty");
        }
    }

    /**
     * Constructs a new WellnessException with the specified detail message and cause.
     * 
     * <p>This constructor is used when a financial wellness operation fails due to
     * an underlying exception or error condition. It allows for proper exception
     * chaining, which is crucial for debugging and error analysis in production
     * environments.</p>
     * 
     * <p>The cause is typically another exception that triggered this wellness
     * exception, such as database connection failures, external API errors,
     * AI model inference failures, or network timeouts during recommendation
     * processing.</p>
     * 
     * <p>Exception chaining helps maintain the complete error context, enabling
     * better troubleshooting and root cause analysis while providing appropriate
     * abstraction at the service boundary.</p>
     * 
     * @param message the detail message explaining the cause of the exception.
     *                This message is saved for later retrieval by the
     *                {@link Throwable#getMessage()} method. Should provide
     *                context specific to the wellness service operation.
     * 
     * @param cause   the cause of this exception (which is saved for later retrieval
     *                by the {@link Throwable#getCause()} method). A null value is
     *                permitted and indicates that the cause is nonexistent or unknown.
     *                Common causes include {@link java.sql.SQLException},
     *                {@link java.io.IOException}, or custom service exceptions.
     * 
     * @throws IllegalArgumentException if the message is null or empty
     *                                 (defensive programming practice)
     * 
     * @example
     * <pre>
     * try {
     *     recommendationService.generateRecommendations(customerId);
     * } catch (AIModelException e) {
     *     throw new WellnessException("Failed to generate personalized recommendations", e);
     * }
     * </pre>
     */
    public WellnessException(String message, Throwable cause) {
        super(message, cause);
        
        // Validate input for defensive programming
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Exception message cannot be null or empty");
        }
    }
}