package com.ufs.auth.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // Spring Web 6.0.13
import org.springframework.http.HttpStatus; // Spring Web 6.0.13

/**
 * Custom exception for handling authentication-related errors within the authentication service.
 * 
 * This exception is thrown when an authentication attempt fails due to invalid credentials,
 * expired tokens, or other security-related issues. It is integral to securing the digital
 * onboarding process by handling authentication failures and serves as a core part of the
 * authentication and authorization service.
 * 
 * The exception is annotated with @ResponseStatus to automatically return an HTTP 401
 * Unauthorized status when thrown in Spring Boot controllers, providing consistent error
 * handling across the application without requiring explicit exception handling in each controller.
 * 
 * Key features:
 * - Extends RuntimeException for unchecked exception behavior
 * - Automatically maps to HTTP 401 Unauthorized status
 * - Supports descriptive error messages for debugging and logging
 * - Integrates seamlessly with Spring Boot's exception handling mechanism
 * 
 * Usage scenarios:
 * - Invalid username/password combinations during login
 * - Expired or malformed JWT tokens
 * - Failed authentication during digital customer onboarding
 * - Authorization failures in protected endpoints
 * - Security-related authentication violations
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationException extends RuntimeException {
    
    /**
     * Serial version UID for serialization compatibility.
     * This ensures that the exception can be properly serialized and deserialized
     * across different versions of the application, which is important for
     * distributed systems and logging frameworks.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Constructs a new AuthenticationException with the specified detail message.
     * 
     * This constructor allows for descriptive error messages to be passed when
     * authentication failures occur, enabling better debugging, logging, and
     * potentially user feedback (while being careful not to expose sensitive
     * security information).
     * 
     * The message is passed to the superclass RuntimeException constructor,
     * which stores it and makes it available through the getMessage() method.
     * This message will be included in stack traces and can be logged for
     * security monitoring and troubleshooting purposes.
     * 
     * @param message the detail message explaining the reason for the authentication failure.
     *                Should be descriptive enough for debugging but should not expose
     *                sensitive security information that could aid malicious actors.
     *                Examples: "Invalid credentials provided", "Token has expired",
     *                "Authentication failed for user session"
     */
    public AuthenticationException(String message) {
        // Call the superclass (RuntimeException) constructor with the provided message
        // This ensures proper initialization of the exception hierarchy and
        // makes the message available through standard exception methods
        super(message);
    }
}