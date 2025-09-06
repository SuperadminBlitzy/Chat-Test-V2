package com.ufs.transaction.dto;

import com.ufs.transaction.model.TransactionStatus;
import java.math.BigDecimal; // java.math version 21
import java.io.Serializable;
import java.util.Objects;

/**
 * Data Transfer Object for sending payment responses to clients within the
 * Unified Financial Services Platform.
 * 
 * This DTO encapsulates the result of a payment operation, providing a standardized
 * response format that includes transaction status and relevant payment details.
 * It serves as part of the Transaction Processing workflow (F-001: Unified Data
 * Integration Platform) to ensure consistent communication between services and
 * external clients.
 * 
 * Key Features:
 * - Immutable data structure for payment response information
 * - Integration with TransactionStatus enum for consistent status tracking
 * - Precise monetary value representation using BigDecimal
 * - Support for internationalization through currency field
 * - Comprehensive error and success messaging capabilities
 * 
 * Usage Context:
 * - REST API responses for payment endpoints
 * - Inter-service communication for payment processing
 * - Client application integration for payment status updates
 * - Audit logging and transaction monitoring systems
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 1.0
 */
public class PaymentResponse implements Serializable {
    
    /**
     * Serial version UID for serialization compatibility
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Unique identifier for the payment transaction.
     * This ID corresponds to the transaction record in the system and provides
     * traceability across all payment processing stages.
     */
    private String transactionId;
    
    /**
     * Current status of the payment transaction.
     * Uses the standardized TransactionStatus enum to ensure consistent
     * status representation across the entire platform.
     */
    private TransactionStatus status;
    
    /**
     * Monetary amount of the payment transaction.
     * Uses BigDecimal for precise decimal arithmetic required in financial
     * calculations, avoiding floating-point precision issues.
     */
    private BigDecimal amount;
    
    /**
     * Currency code for the payment amount.
     * Typically follows ISO 4217 currency codes (e.g., USD, EUR, GBP)
     * to support international payment processing.
     */
    private String currency;
    
    /**
     * Human-readable message providing additional information about the payment.
     * Can contain success confirmations, error descriptions, or informational
     * messages relevant to the payment operation outcome.
     */
    private String message;
    
    /**
     * Default constructor for PaymentResponse.
     * Creates an empty PaymentResponse instance that can be populated
     * using setter methods. Required for serialization frameworks
     * and dependency injection containers.
     */
    public PaymentResponse() {
        // Default constructor for framework compatibility
        // Fields will be initialized to their default values:
        // - transactionId: null
        // - status: null
        // - amount: null
        // - currency: null
        // - message: null
    }
    
    /**
     * Convenience constructor for creating a complete PaymentResponse.
     * 
     * @param transactionId the unique identifier of the transaction
     * @param status the current status of the transaction
     * @param amount the monetary amount of the payment
     * @param currency the currency code for the payment
     * @param message additional information about the payment
     */
    public PaymentResponse(String transactionId, TransactionStatus status, 
                          BigDecimal amount, String currency, String message) {
        this.transactionId = transactionId;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
        this.message = message;
    }
    
    /**
     * Gets the transaction ID.
     * 
     * @return The unique identifier of the transaction, or null if not set
     */
    public String getTransactionId() {
        return transactionId;
    }
    
    /**
     * Sets the transaction ID.
     * 
     * @param transactionId the unique identifier to assign to this transaction.
     *                      Should be a non-null, non-empty string that uniquely
     *                      identifies the payment transaction in the system.
     */
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    /**
     * Gets the status of the transaction.
     * 
     * @return The status of the transaction using the standardized TransactionStatus enum,
     *         or null if not set
     */
    public TransactionStatus getStatus() {
        return status;
    }
    
    /**
     * Sets the status of the transaction.
     * 
     * @param status the status to assign to this transaction using the TransactionStatus enum.
     *               Valid values include PENDING, PROCESSING, AWAITING_APPROVAL,
     *               SETTLEMENT_IN_PROGRESS, COMPLETED, FAILED, REJECTED, CANCELLED.
     */
    public void setStatus(TransactionStatus status) {
        this.status = status;
    }
    
    /**
     * Gets the amount of the payment.
     * 
     * @return The amount of the payment as a BigDecimal for precise monetary calculations,
     *         or null if not set
     */
    public BigDecimal getAmount() {
        return amount;
    }
    
    /**
     * Sets the amount of the payment.
     * 
     * @param amount the monetary amount to assign to this payment. Should be a positive
     *               BigDecimal value representing the payment amount. Negative values
     *               may be used for refunds or reversals depending on business logic.
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    /**
     * Gets the currency of the payment.
     * 
     * @return The currency of the payment, typically as an ISO 4217 currency code,
     *         or null if not set
     */
    public String getCurrency() {
        return currency;
    }
    
    /**
     * Sets the currency of the payment.
     * 
     * @param currency the currency code to assign to this payment. Should follow
     *                 ISO 4217 standards (e.g., "USD", "EUR", "GBP") for consistency
     *                 across international payment processing.
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    /**
     * Gets a message associated with the payment response.
     * 
     * @return A message providing additional information about the payment,
     *         such as success confirmations or error descriptions, or null if not set
     */
    public String getMessage() {
        return message;
    }
    
    /**
     * Sets a message associated with the payment response.
     * 
     * @param message a descriptive message to associate with this payment response.
     *                Can provide context about the payment outcome, error details,
     *                or success confirmations for client consumption.
     */
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Determines if this payment response represents a successful transaction.
     * 
     * @return true if the transaction status indicates success (COMPLETED), false otherwise
     */
    public boolean isSuccessful() {
        return status != null && status.isSuccessful();
    }
    
    /**
     * Determines if this payment response represents a failed transaction.
     * 
     * @return true if the transaction status indicates failure (FAILED, REJECTED, CANCELLED),
     *         false otherwise
     */
    public boolean isFailed() {
        return status != null && status.isFailedOutcome();
    }
    
    /**
     * Determines if this payment response represents a transaction still in progress.
     * 
     * @return true if the transaction is actively being processed, false otherwise
     */
    public boolean isInProgress() {
        return status != null && status.isActivelyProcessing();
    }
    
    /**
     * Gets the display name for the current transaction status.
     * 
     * @return human-readable status description, or "Unknown" if status is null
     */
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }
    
    /**
     * Creates a formatted string representation of the payment amount with currency.
     * 
     * @return formatted amount string (e.g., "100.00 USD"), or "N/A" if amount or currency is null
     */
    public String getFormattedAmount() {
        if (amount != null && currency != null) {
            return String.format("%.2f %s", amount, currency);
        }
        return "N/A";
    }
    
    /**
     * Validates that all required fields are present and valid.
     * 
     * @return true if the PaymentResponse is valid for use, false otherwise
     */
    public boolean isValid() {
        return transactionId != null && !transactionId.trim().isEmpty() &&
               status != null &&
               amount != null &&
               currency != null && !currency.trim().isEmpty();
    }
    
    /**
     * Creates a string representation of the PaymentResponse for logging and debugging.
     * Excludes sensitive information while providing essential transaction details.
     * 
     * @return string representation of this PaymentResponse
     */
    @Override
    public String toString() {
        return String.format("PaymentResponse{transactionId='%s', status=%s, amount=%s, currency='%s', hasMessage=%s}", 
            transactionId, status, amount, currency, message != null && !message.isEmpty());
    }
    
    /**
     * Compares this PaymentResponse with another object for equality.
     * Two PaymentResponse objects are considered equal if all their fields are equal.
     * 
     * @param obj the object to compare with this PaymentResponse
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        PaymentResponse that = (PaymentResponse) obj;
        return Objects.equals(transactionId, that.transactionId) &&
               status == that.status &&
               Objects.equals(amount, that.amount) &&
               Objects.equals(currency, that.currency) &&
               Objects.equals(message, that.message);
    }
    
    /**
     * Generates a hash code for this PaymentResponse based on its field values.
     * 
     * @return hash code value for this PaymentResponse
     */
    @Override
    public int hashCode() {
        return Objects.hash(transactionId, status, amount, currency, message);
    }
}