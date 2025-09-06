package com.ufs.customer.exception;

import org.springframework.http.HttpStatus; // Spring 6.0.13
import org.springframework.web.bind.annotation.ResponseStatus; // Spring 6.0.13

/**
 * Custom runtime exception for handling customer not found scenarios within the 
 * Unified Financial Services (UFS) customer service microservice.
 * 
 * <p>This exception is a critical component of the error handling mechanism for 
 * the customer service, which forms part of the Unified Data Integration Platform 
 * (F-001) as specified in the technical requirements. It ensures that requests 
 * for non-existent customers are handled gracefully and consistently across 
 * the financial services ecosystem.</p>
 * 
 * <p>The exception is automatically mapped to HTTP 404 Not Found status when 
 * thrown from Spring Boot REST controllers, providing standardized error 
 * responses to client applications and external systems.</p>
 * 
 * <p><strong>Business Context:</strong></p>
 * <ul>
 *   <li>Supports the critical requirement for unified customer data management</li>
 *   <li>Enables proper error handling for customer lookup operations</li>
 *   <li>Maintains data integrity within the microservices architecture</li>
 *   <li>Facilitates audit trails and compliance monitoring</li>
 * </ul>
 * 
 * <p><strong>Technical Integration:</strong></p>
 * <ul>
 *   <li>Integrates with Spring Boot's global exception handling mechanism</li>
 *   <li>Supports RESTful API error response standards</li>
 *   <li>Compatible with microservices communication patterns</li>
 *   <li>Enables proper logging and monitoring for operational insights</li>
 * </ul>
 * 
 * <p><strong>Usage Examples:</strong></p>
 * <pre>
 * // Service layer usage
 * if (customer == null) {
 *     throw new CustomerNotFoundException("Customer with ID: " + customerId + " not found");
 * }
 * 
 * // Repository layer usage
 * return customerRepository.findById(id)
 *     .orElseThrow(() -> new CustomerNotFoundException("Customer not found for ID: " + id));
 * </pre>
 * 
 * <p><strong>Compliance Notes:</strong></p>
 * <ul>
 *   <li>Adheres to financial services data protection requirements</li>
 *   <li>Supports audit logging for regulatory compliance</li>
 *   <li>Maintains error handling standards for PCI DSS compliance</li>
 *   <li>Enables proper error tracking for SOC2 requirements</li>
 * </ul>
 * 
 * @author UFS Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @see RuntimeException
 * @see ResponseStatus
 * @see HttpStatus
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class CustomerNotFoundException extends RuntimeException {

    /**
     * Serial version UID for serialization compatibility.
     * This ensures consistent serialization across different versions of the class
     * and supports distributed system communication requirements.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new CustomerNotFoundException with the specified detail message.
     * 
     * <p>The detail message is saved for later retrieval by the {@link #getMessage()} 
     * method and will be included in error responses sent to client applications.</p>
     * 
     * <p><strong>Message Format Recommendations:</strong></p>
     * <ul>
     *   <li>Include specific customer identifier (ID, email, etc.) when available</li>
     *   <li>Use consistent message format across the application</li>
     *   <li>Avoid exposing sensitive customer data in error messages</li>
     *   <li>Consider localization requirements for international deployments</li>
     * </ul>
     * 
     * <p><strong>Security Considerations:</strong></p>
     * <ul>
     *   <li>Error messages should not expose sensitive customer information</li>
     *   <li>Generic identifiers should be used to prevent data enumeration attacks</li>
     *   <li>Detailed error information should be logged separately for internal use</li>
     * </ul>
     * 
     * <p><strong>Performance Impact:</strong></p>
     * <ul>
     *   <li>Exception creation and stack trace generation have minimal overhead</li>
     *   <li>Message formatting should be efficient for high-volume operations</li>
     *   <li>Consider using parameterized logging for better performance</li>
     * </ul>
     * 
     * @param message the detail message explaining the reason for the exception.
     *                This message will be returned by {@link #getMessage()} and
     *                included in HTTP error responses. Should be descriptive but
     *                not expose sensitive customer data.
     * 
     * @throws IllegalArgumentException if the message is null (though null is 
     *                                 technically allowed, it's not recommended 
     *                                 for production use)
     * 
     * @example
     * <pre>
     * // Recommended usage patterns:
     * throw new CustomerNotFoundException("Customer with ID: " + customerId + " not found");
     * throw new CustomerNotFoundException("Customer not found for email: " + maskedEmail);
     * throw new CustomerNotFoundException("Customer record not found in system");
     * </pre>
     */
    public CustomerNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new CustomerNotFoundException with the specified detail message and cause.
     * 
     * <p>This constructor is useful when wrapping lower-level exceptions (such as 
     * database access exceptions) while providing a more specific customer-focused 
     * error message to the application layer.</p>
     * 
     * <p><strong>Use Cases:</strong></p>
     * <ul>
     *   <li>Wrapping database connection exceptions during customer lookup</li>
     *   <li>Converting JPA exceptions to business domain exceptions</li>
     *   <li>Maintaining exception chain for debugging and monitoring</li>
     *   <li>Preserving original error context for troubleshooting</li>
     * </ul>
     * 
     * @param message the detail message explaining the reason for the exception
     * @param cause the underlying cause of this exception, typically a lower-level
     *              technical exception that should be preserved for debugging
     * 
     * @example
     * <pre>
     * try {
     *     return customerRepository.findById(customerId);
     * } catch (DataAccessException ex) {
     *     throw new CustomerNotFoundException(
     *         "Customer lookup failed for ID: " + customerId, ex);
     * }
     * </pre>
     */
    public CustomerNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Constructs a new CustomerNotFoundException with the specified cause.
     * 
     * <p>This constructor is useful when the underlying cause provides sufficient
     * error information, and a detailed message is not required. The message will
     * be automatically derived from the cause's toString() method.</p>
     * 
     * @param cause the underlying cause of this exception
     * 
     * @example
     * <pre>
     * try {
     *     validateCustomerExists(customerId);
     * } catch (IllegalStateException ex) {
     *     throw new CustomerNotFoundException(ex);
     * }
     * </pre>
     */
    public CustomerNotFoundException(Throwable cause) {
        super(cause);
    }
}