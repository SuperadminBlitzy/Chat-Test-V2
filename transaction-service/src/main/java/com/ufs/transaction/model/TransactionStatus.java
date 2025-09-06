package com.ufs.transaction.model;

/**
 * Enumeration representing the various lifecycle statuses of a financial transaction
 * within the Unified Financial Services Platform.
 * 
 * This enum is a critical component for tracking the state of transactions and driving
 * the business logic throughout the transaction processing workflow. Each status
 * corresponds to a distinct stage in the transaction lifecycle, from initial submission
 * to final completion or termination.
 * 
 * The status values are designed to support:
 * - Transaction Processing Workflow (4.1.1.3): Enables tracking through initiation, 
 *   risk assessment, settlement, and confirmation stages
 * - Transaction State Transitions (4.3.1): Provides state machine representation 
 *   for systematic transaction processing
 * - Real-time Transaction Monitoring (F-008): Critical data for operational 
 *   monitoring and analytics dashboards
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 1.0
 */
public enum TransactionStatus {
    
    /**
     * Initial status when a transaction request has been received and queued
     * for processing but has not yet begun validation or risk assessment.
     * 
     * Typical characteristics:
     * - Transaction data has been captured and stored
     * - No validation or business rule checks have been performed
     * - Transaction is awaiting processing resources
     * - Can transition to PROCESSING or FAILED states
     */
    PENDING,
    
    /**
     * Status indicating the transaction is currently undergoing active processing
     * including validation, risk assessment, and initial compliance checks.
     * 
     * Typical characteristics:
     * - Data validation and business rule enforcement in progress
     * - AI-powered risk assessment engine is analyzing the transaction
     * - Fraud detection systems are evaluating transaction patterns
     * - Can transition to AWAITING_APPROVAL, SETTLEMENT_IN_PROGRESS, FAILED, or REJECTED states
     */
    PROCESSING,
    
    /**
     * Status indicating the transaction requires manual approval or additional
     * authorization before proceeding to settlement.
     * 
     * Typical characteristics:
     * - Transaction has exceeded automated approval thresholds
     * - Risk assessment has flagged for enhanced due diligence
     * - Compliance requirements mandate manual review
     * - Awaiting human intervention or additional authentication
     * - Can transition to SETTLEMENT_IN_PROGRESS, REJECTED, or CANCELLED states
     */
    AWAITING_APPROVAL,
    
    /**
     * Status indicating the transaction has been approved and is currently
     * undergoing settlement processing through the blockchain network or
     * traditional payment rails.
     * 
     * Typical characteristics:
     * - All validation and approval requirements have been satisfied
     * - Settlement instructions have been generated and transmitted
     * - Blockchain smart contracts or payment processors are executing
     * - Atomic settlement operations are in progress
     * - Can transition to COMPLETED or FAILED states
     */
    SETTLEMENT_IN_PROGRESS,
    
    /**
     * Final status indicating the transaction has been successfully completed
     * and all settlement operations have been finalized.
     * 
     * Typical characteristics:
     * - Funds have been successfully transferred between accounts
     * - All parties have been notified of completion
     * - Immutable transaction records have been created
     * - Audit trails and regulatory reporting have been updated
     * - This is a terminal state - no further transitions occur
     */
    COMPLETED,
    
    /**
     * Terminal status indicating the transaction encountered a technical failure
     * or system error that prevented successful completion.
     * 
     * Typical characteristics:
     * - System errors or technical failures occurred during processing
     * - Settlement operations could not be completed due to infrastructure issues
     * - Automatic retry mechanisms have been exhausted
     * - Error details have been logged for investigation
     * - This is a terminal state requiring manual intervention for resolution
     */
    FAILED,
    
    /**
     * Terminal status indicating the transaction was rejected due to business
     * rule violations, compliance issues, or risk assessment failures.
     * 
     * Typical characteristics:
     * - Business rules or compliance policies prevented transaction approval
     * - Risk assessment determined transaction exceeds acceptable thresholds
     * - KYC/AML checks identified potential violations
     * - Regulatory restrictions prevented transaction processing
     * - This is a terminal state with rejection reason documented
     */
    REJECTED,
    
    /**
     * Terminal status indicating the transaction was cancelled by the customer,
     * system administrator, or automated processes before completion.
     * 
     * Typical characteristics:
     * - Customer initiated cancellation request
     * - System timeout or expiration occurred
     * - Administrative intervention cancelled the transaction
     * - Cancellation occurred before settlement processing began
     * - This is a terminal state with cancellation reason documented
     */
    CANCELLED;
    
    /**
     * Determines if the current transaction status represents a terminal state
     * where no further processing or state transitions should occur.
     * 
     * Terminal states include: COMPLETED, FAILED, REJECTED, CANCELLED
     * 
     * @return true if this status is terminal, false otherwise
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == REJECTED || this == CANCELLED;
    }
    
    /**
     * Determines if the current transaction status represents an active processing
     * state where the transaction is undergoing validation, approval, or settlement.
     * 
     * Active states include: PROCESSING, AWAITING_APPROVAL, SETTLEMENT_IN_PROGRESS
     * 
     * @return true if this status represents active processing, false otherwise
     */
    public boolean isActivelyProcessing() {
        return this == PROCESSING || this == AWAITING_APPROVAL || this == SETTLEMENT_IN_PROGRESS;
    }
    
    /**
     * Determines if the current transaction status represents a successful outcome
     * where the transaction has been completed successfully.
     * 
     * @return true if this status represents success (COMPLETED), false otherwise
     */
    public boolean isSuccessful() {
        return this == COMPLETED;
    }
    
    /**
     * Determines if the current transaction status represents a failure outcome
     * where the transaction could not be completed due to errors or rejections.
     * 
     * Failed outcomes include: FAILED, REJECTED, CANCELLED
     * 
     * @return true if this status represents a failure outcome, false otherwise
     */
    public boolean isFailedOutcome() {
        return this == FAILED || this == REJECTED || this == CANCELLED;
    }
    
    /**
     * Determines if the current transaction status requires manual intervention
     * or human oversight to progress further.
     * 
     * @return true if manual intervention is required (AWAITING_APPROVAL), false otherwise
     */
    public boolean requiresManualIntervention() {
        return this == AWAITING_APPROVAL;
    }
    
    /**
     * Provides a human-readable description of the transaction status suitable
     * for display in user interfaces and customer notifications.
     * 
     * @return descriptive string representation of the status
     */
    public String getDisplayName() {
        switch (this) {
            case PENDING:
                return "Pending Processing";
            case PROCESSING:
                return "Processing";
            case AWAITING_APPROVAL:
                return "Awaiting Approval";
            case SETTLEMENT_IN_PROGRESS:
                return "Settlement in Progress";
            case COMPLETED:
                return "Completed";
            case FAILED:
                return "Failed";
            case REJECTED:
                return "Rejected";
            case CANCELLED:
                return "Cancelled";
            default:
                return name();
        }
    }
    
    /**
     * Provides a detailed description of what the transaction status means
     * for operational and monitoring purposes.
     * 
     * @return detailed description of the status
     */
    public String getDescription() {
        switch (this) {
            case PENDING:
                return "Transaction has been received and is queued for processing";
            case PROCESSING:
                return "Transaction is undergoing validation, risk assessment, and compliance checks";
            case AWAITING_APPROVAL:
                return "Transaction requires manual approval or additional authorization";
            case SETTLEMENT_IN_PROGRESS:
                return "Transaction is being settled through payment networks or blockchain";
            case COMPLETED:
                return "Transaction has been successfully completed and settled";
            case FAILED:
                return "Transaction failed due to technical errors or system issues";
            case REJECTED:
                return "Transaction was rejected due to business rules or compliance violations";
            case CANCELLED:
                return "Transaction was cancelled before completion";
            default:
                return "Unknown transaction status";
        }
    }
}