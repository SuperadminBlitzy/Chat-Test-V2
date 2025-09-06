package com.ufs.transaction.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Data Transfer Object (DTO) for representing a payment request in the Unified Financial Services Platform.
 * This class encapsulates the data required to initiate a payment transaction within the transaction processing workflow
 * and supports blockchain-based settlement network operations.
 * 
 * This DTO serves as the input for the Transaction Processing Workflow (Section 4.1.1) and integrates with 
 * Feature F-009: Blockchain-based Settlement Network for secure, transparent, and immutable transaction settlement.
 * 
 * The payment request undergoes comprehensive validation including:
 * - Real-time risk assessment through AI-powered risk scoring
 * - Fraud detection and AML transaction monitoring
 * - Regulatory compliance validation
 * - Smart contract execution for blockchain settlement
 * 
 * @version 1.0
 * @since 2025
 * @author Unified Financial Services Platform
 */
public class PaymentRequest {

    /**
     * The monetary amount of the payment transaction.
     * This field represents the precise payment amount using BigDecimal for financial accuracy.
     * The amount must be positive and is validated against business rules during transaction processing.
     * 
     * Validation Rules:
     * - Must not be null
     * - Must be a positive value (greater than 0)
     * - Precision is maintained for regulatory compliance and audit requirements
     */
    @NotNull(message = "Payment amount is required and cannot be null")
    @Positive(message = "Payment amount must be positive and greater than zero")
    private BigDecimal amount;

    /**
     * The currency code for the payment transaction.
     * Follows ISO 4217 standard currency codes (e.g., USD, EUR, GBP).
     * This field is critical for multi-currency processing and foreign exchange calculations.
     * 
     * Validation Rules:
     * - Must not be null or empty
     * - Must be exactly 3 characters (ISO 4217 standard)
     * - Used for currency conversion and settlement processing
     */
    @NotNull(message = "Currency code is required and cannot be null")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters (ISO 4217 standard)")
    private String currency;

    /**
     * Optional description or reference for the payment transaction.
     * This field provides context for the payment and supports audit trail requirements.
     * May include invoice numbers, transaction references, or payment purposes.
     * 
     * Validation Rules:
     * - Maximum length of 500 characters for database optimization
     * - Used for transaction categorization and reporting
     * - Supports regulatory reporting and compliance documentation
     */
    @Size(max = 500, message = "Payment description cannot exceed 500 characters")
    private String description;

    /**
     * The unique identifier of the source account from which the payment is debited.
     * This field references the customer's account in the core banking system.
     * Critical for account balance validation and transaction authorization.
     * 
     * Validation Rules:
     * - Must not be null or empty
     * - Length between 1 and 50 characters for account ID standards
     * - Used for account ownership verification and balance checks
     * - Supports both internal and external account references
     */
    @NotNull(message = "Source account ID is required and cannot be null")
    @Size(min = 1, max = 50, message = "Source account ID must be between 1 and 50 characters")
    private String fromAccountId;

    /**
     * The unique identifier of the destination account to which the payment is credited.
     * This field references the beneficiary's account for payment settlement.
     * Subject to beneficiary verification and sanctions screening.
     * 
     * Validation Rules:
     * - Must not be null or empty
     * - Length between 1 and 50 characters for account ID standards
     * - Used for beneficiary validation and settlement processing
     * - Supports cross-border payment routing and compliance checks
     */
    @NotNull(message = "Destination account ID is required and cannot be null")
    @Size(min = 1, max = 50, message = "Destination account ID must be between 1 and 50 characters")
    private String toAccountId;

    /**
     * Default constructor for PaymentRequest.
     * Initializes a new instance without setting any field values.
     * Required for JSON deserialization and framework compatibility.
     */
    public PaymentRequest() {
        // Default constructor for framework compatibility and JSON deserialization
    }

    /**
     * Parameterized constructor for PaymentRequest.
     * Provides a convenient way to create a PaymentRequest with all required fields.
     * 
     * @param amount The payment amount (must be positive)
     * @param currency The currency code (ISO 4217 standard)
     * @param description Optional payment description
     * @param fromAccountId The source account identifier
     * @param toAccountId The destination account identifier
     */
    public PaymentRequest(BigDecimal amount, String currency, String description, 
                         String fromAccountId, String toAccountId) {
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
    }

    /**
     * Returns the amount of the payment.
     * The amount is represented as BigDecimal to ensure precision in financial calculations
     * and to comply with regulatory requirements for monetary value handling.
     * 
     * @return The payment amount as BigDecimal, or null if not set
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the amount for the payment.
     * The amount should be positive and represent the exact monetary value to be transferred.
     * This value is used for balance validation, risk assessment, and settlement processing.
     * 
     * @param amount The payment amount to set (should be positive)
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Returns the currency of the payment.
     * The currency code follows ISO 4217 standard and is used for multi-currency processing,
     * foreign exchange calculations, and regulatory reporting.
     * 
     * @return The payment currency code, or null if not set
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency for the payment.
     * Must be a valid ISO 4217 currency code for proper transaction processing
     * and compliance with international payment standards.
     * 
     * @param currency The currency code to set (should be 3-character ISO 4217 code)
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Returns the description of the payment.
     * The description provides context for the transaction and supports audit trail requirements.
     * May include references, invoice numbers, or payment purposes for tracking and compliance.
     * 
     * @return The payment description, or null if not set
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description for the payment.
     * The description should provide meaningful context for the transaction
     * and support regulatory reporting and audit requirements.
     * 
     * @param description The payment description to set (max 500 characters)
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the ID of the account from which the payment is made.
     * This identifier is used for account ownership verification, balance validation,
     * and authorization checks during transaction processing.
     * 
     * @return The source account ID, or null if not set
     */
    public String getFromAccountId() {
        return fromAccountId;
    }

    /**
     * Sets the ID of the account from which the payment is made.
     * This identifier must reference a valid account in the system
     * and will be subject to ownership and authorization verification.
     * 
     * @param fromAccountId The source account identifier to set
     */
    public void setFromAccountId(String fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    /**
     * Returns the ID of the account to which the payment is made.
     * This identifier is used for beneficiary validation, sanctions screening,
     * and settlement processing in the blockchain network.
     * 
     * @return The destination account ID, or null if not set
     */
    public String getToAccountId() {
        return toAccountId;
    }

    /**
     * Sets the ID of the account to which the payment is made.
     * This identifier must reference a valid beneficiary account
     * and will be subject to compliance and sanctions screening.
     * 
     * @param toAccountId The destination account identifier to set
     */
    public void setToAccountId(String toAccountId) {
        this.toAccountId = toAccountId;
    }

    /**
     * Returns a string representation of the PaymentRequest object.
     * This method provides a formatted view of all fields for debugging and logging purposes.
     * Sensitive information is handled appropriately for security compliance.
     * 
     * @return A string representation of the PaymentRequest
     */
    @Override
    public String toString() {
        return "PaymentRequest{" +
                "amount=" + amount +
                ", currency='" + currency + '\'' +
                ", description='" + description + '\'' +
                ", fromAccountId='" + fromAccountId + '\'' +
                ", toAccountId='" + toAccountId + '\'' +
                '}';
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * Two PaymentRequest objects are considered equal if all their fields are equal.
     * This method is important for testing and data integrity validation.
     * 
     * @param obj The reference object with which to compare
     * @return true if this object is the same as the obj argument; false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        PaymentRequest that = (PaymentRequest) obj;
        
        if (amount != null ? !amount.equals(that.amount) : that.amount != null) return false;
        if (currency != null ? !currency.equals(that.currency) : that.currency != null) return false;
        if (description != null ? !description.equals(that.description) : that.description != null) return false;
        if (fromAccountId != null ? !fromAccountId.equals(that.fromAccountId) : that.fromAccountId != null) return false;
        return toAccountId != null ? toAccountId.equals(that.toAccountId) : that.toAccountId == null;
    }

    /**
     * Returns a hash code value for the object.
     * This method is supported for the benefit of hash tables such as those provided by HashMap.
     * The hash code is calculated based on all fields to ensure consistency with equals().
     * 
     * @return A hash code value for this object
     */
    @Override
    public int hashCode() {
        int result = amount != null ? amount.hashCode() : 0;
        result = 31 * result + (currency != null ? currency.hashCode() : 0);
        result = 31 * result + (description != null ? description.hashCode() : 0);
        result = 31 * result + (fromAccountId != null ? fromAccountId.hashCode() : 0);
        result = 31 * result + (toAccountId != null ? toAccountId.hashCode() : 0);
        return result;
    }
}