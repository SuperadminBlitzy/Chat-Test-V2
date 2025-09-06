package com.ufs.compliance.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // Spring Web 6.0.13
import org.springframework.http.HttpStatus; // Spring Web 6.0.13

/**
 * Custom runtime exception for handling business logic errors within the compliance service.
 * 
 * This exception is integral to the F-003: Regulatory Compliance Automation feature,
 * ensuring that failures during compliance-related operations are caught and handled gracefully.
 * It is designed to be thrown when compliance-related operations fail, such as:
 * - Failing to process regulatory updates
 * - Errors during compliance report generation
 * - Regulatory change monitoring failures
 * - Automated policy update errors
 * - Compliance reporting inconsistencies
 * - Audit trail management issues
 * 
 * The exception is annotated with @ResponseStatus to automatically return an HTTP 400 Bad Request
 * response when thrown from a Spring controller, providing appropriate error handling for web clients.
 * 
 * This aligns with the regulatory compliance automation requirements where 88% of IT decision
 * makers across FSIs agree that data silos create challenges, and this exception ensures
 * proper error handling during the automation of compliance processes.
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 1.0
 * 
 * @see RuntimeException
 * @see ResponseStatus
 * @see HttpStatus
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ComplianceException extends RuntimeException {

    /**
     * Serial version UID for serialization compatibility.
     * This ensures that the exception can be properly serialized and deserialized
     * across different versions of the application, which is crucial for
     * distributed microservices architecture.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new ComplianceException with the specified detail message.
     * 
     * This constructor is used when a compliance-related operation fails and
     * only a descriptive error message is available. The message should clearly
     * describe the nature of the compliance failure to aid in troubleshooting
     * and audit trail analysis.
     * 
     * Examples of appropriate usage:
     * - "Failed to process regulatory update for Basel III compliance"
     * - "Compliance report generation failed due to missing data"
     * - "Regulatory change monitoring service unavailable"
     * - "Policy update validation failed for PCI DSS requirements"
     * 
     * @param message the detail message explaining the compliance-related error.
     *                This message is saved for later retrieval by the {@link #getMessage()} method.
     *                Should not be null or empty for proper error reporting and audit purposes.
     */
    public ComplianceException(String message) {
        super(message);
    }

    /**
     * Constructs a new ComplianceException with the specified detail message and cause.
     * 
     * This constructor is used when a compliance-related operation fails due to an
     * underlying exception. It allows for proper exception chaining, which is essential
     * for debugging and maintaining a complete audit trail of the error propagation
     * through the system.
     * 
     * The cause parameter is particularly valuable in compliance scenarios where:
     * - Database connection failures prevent regulatory data retrieval
     * - External API calls to regulatory services fail
     * - Network timeouts occur during compliance data synchronization
     * - File system errors prevent audit log writing
     * - Parsing errors occur when processing regulatory XML/JSON data
     * 
     * This approach aligns with the enterprise-grade error handling requirements
     * for financial services platforms where complete error traceability is
     * mandated by regulatory frameworks such as SOC2, PCI-DSS, and GDPR.
     * 
     * @param message the detail message explaining the compliance-related error.
     *                This message is saved for later retrieval by the {@link #getMessage()} method.
     *                Should provide context about the compliance operation that failed.
     * @param cause   the cause of the exception (which is saved for later retrieval by the
     *                {@link #getCause()} method). A null value is permitted and indicates
     *                that the cause is nonexistent or unknown. This should typically be
     *                the underlying exception that caused the compliance operation to fail.
     */
    public ComplianceException(String message, Throwable cause) {
        super(message, cause);
    }
}