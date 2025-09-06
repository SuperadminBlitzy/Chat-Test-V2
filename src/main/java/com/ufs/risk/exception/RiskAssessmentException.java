package com.ufs.risk.exception;

import org.springframework.web.bind.annotation.ResponseStatus; // version 6.0.13
import org.springframework.http.HttpStatus; // version 6.0.13

/**
 * Custom runtime exception for handling errors related to risk assessment operations
 * within the AI-Powered Risk Assessment Engine (F-002).
 * 
 * This exception is specifically designed to handle failures that occur during:
 * - AI/ML model execution and inference
 * - Risk scoring calculations and threshold evaluations
 * - Data processing and feature engineering operations
 * - Model validation and explainability processes
 * - Real-time risk assessment workflows
 * 
 * The exception automatically returns HTTP 500 Internal Server Error status
 * when thrown from REST endpoints, ensuring consistent error responses for
 * risk assessment service failures.
 * 
 * As part of the enterprise-grade error handling strategy, this exception
 * supports the system's requirement to maintain 95% accuracy rate and
 * sub-500ms response times while providing graceful error handling for
 * the AI-Powered Risk Assessment Engine.
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class RiskAssessmentException extends RuntimeException {
    
    /**
     * Serial version UID for serialization compatibility.
     * This ensures proper serialization/deserialization across different
     * versions of the application, which is critical for distributed
     * microservices architecture and error propagation.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Constructs a new RiskAssessmentException with the specified detail message.
     * 
     * This constructor is designed to provide detailed error information for
     * various risk assessment failure scenarios including:
     * - Model inference failures
     * - Data validation errors
     * - Risk score calculation failures
     * - Feature engineering issues
     * - ML pipeline execution errors
     * 
     * The message should be descriptive enough to aid in troubleshooting
     * while avoiding exposure of sensitive financial data or system internals
     * that could pose security risks.
     * 
     * @param message the detailed error message explaining the risk assessment failure.
     *               This message should be informative for debugging purposes
     *               while maintaining security and compliance standards for
     *               financial services applications.
     */
    public RiskAssessmentException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new RiskAssessmentException with the specified detail message
     * and root cause.
     * 
     * This constructor enables proper exception chaining, which is essential
     * for maintaining complete error context in complex AI/ML processing
     * pipelines where multiple layers of processing may fail.
     * 
     * @param message the detailed error message explaining the risk assessment failure
     * @param cause the underlying cause of the risk assessment failure,
     *              typically from ML frameworks, data processing libraries,
     *              or external service integrations
     */
    public RiskAssessmentException(String message, Throwable cause) {
        super(message, cause);
    }
    
    /**
     * Constructs a new RiskAssessmentException with the specified root cause.
     * 
     * This constructor is useful when the underlying cause provides sufficient
     * context about the failure, commonly used for wrapping exceptions from
     * third-party ML libraries or data processing frameworks.
     * 
     * @param cause the underlying cause of the risk assessment failure
     */
    public RiskAssessmentException(Throwable cause) {
        super(cause);
    }
}