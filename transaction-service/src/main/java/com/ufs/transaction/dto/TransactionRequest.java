package com.ufs.transaction.dto;

import java.math.BigDecimal; // JDK 21 - For precise monetary calculations without floating-point errors
import java.util.UUID; // JDK 21 - For universally unique identifiers for accounts
import jakarta.validation.constraints.NotNull; // Jakarta Validation 3.0.2 - Ensures fields are not null
import jakarta.validation.constraints.Size; // Jakarta Validation 3.0.2 - Validates string length constraints
import jakarta.validation.constraints.Positive; // Jakarta Validation 3.0.2 - Ensures numeric values are positive

/**
 * Data Transfer Object (DTO) for initiating a new financial transaction.
 * 
 * This immutable record class encapsulates all the data required from a client 
 * to create a transaction within the Unified Financial Services Platform. 
 * It serves as the primary input for the transaction processing workflow,
 * capturing all necessary details to initiate a payment or transfer.
 * 
 * The DTO implements comprehensive validation to ensure data integrity and 
 * correctness before processing by the service layer. It supports real-time 
 * transaction monitoring and analysis as specified in F-008 requirements.
 * 
 * Key Features:
 * - Immutable design using Java record for thread safety
 * - Comprehensive validation annotations with custom error messages
 * - Support for various transaction types (TRANSFER, PAYMENT, DEPOSIT, WITHDRAWAL)
 * - ISO 4217 currency code validation
 * - Precise monetary calculations using BigDecimal
 * - UUID-based account identification for global uniqueness
 * 
 * Usage:
 * This record is used in the API interaction sequence for transaction initiation,
 * providing the data payload for REST endpoints and message queue processing.
 * 
 * Validation Rules:
 * - Source and destination account IDs must be valid UUIDs and cannot be null
 * - Amount must be positive and cannot be null (prevents zero/negative transactions)
 * - Currency must be a valid 3-letter ISO 4217 code (e.g., USD, EUR, GBP)
 * - Transaction type is required and defines the nature of the transaction
 * - Description is optional but limited to 255 characters for database efficiency
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2024
 */
public record TransactionRequest(
    /**
     * The unique identifier of the source account from which funds will be debited.
     * Must be a valid UUID that exists in the account management system.
     * This field is mandatory for all transaction types.
     */
    @NotNull(message = "Source account ID cannot be null.")
    UUID sourceAccountId,
    
    /**
     * The unique identifier of the destination account to which funds will be credited.
     * Must be a valid UUID that exists in the account management system.
     * This field is mandatory for all transaction types.
     */
    @NotNull(message = "Destination account ID cannot be null.")
    UUID destinationAccountId,
    
    /**
     * The monetary amount to be transferred in the specified currency.
     * Uses BigDecimal for precise decimal arithmetic required in financial calculations.
     * Must be a positive value greater than zero to prevent invalid transactions.
     * The precision and scale should accommodate the currency's minor units.
     */
    @NotNull(message = "Amount cannot be null.")
    @Positive(message = "Amount must be positive.")
    BigDecimal amount,
    
    /**
     * The currency code for the transaction amount.
     * Must be a valid 3-letter ISO 4217 currency code (e.g., USD, EUR, GBP, JPY).
     * This ensures compatibility with international payment systems and 
     * regulatory compliance for cross-border transactions.
     */
    @NotNull(message = "Currency cannot be null.")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code.")
    String currency,
    
    /**
     * The type of transaction being initiated.
     * Common values include:
     * - TRANSFER: Move funds between accounts
     * - PAYMENT: Payment to a merchant or service provider
     * - DEPOSIT: Add funds to an account
     * - WITHDRAWAL: Remove funds from an account
     * - REFUND: Return previously charged funds
     * 
     * This field is used for transaction categorization, reporting, 
     * and applying appropriate business rules and compliance checks.
     */
    @NotNull(message = "Transaction type cannot be null.")
    String transactionType,
    
    /**
     * Optional descriptive text providing additional context for the transaction.
     * This field can contain references, notes, or other relevant information
     * that helps identify the purpose of the transaction.
     * 
     * Maximum length is limited to 255 characters for database storage efficiency
     * and to prevent abuse. The field is optional and can be null.
     * 
     * Examples:
     * - "Payment for invoice #12345"
     * - "Monthly salary transfer"
     * - "Refund for order #67890"
     */
    @Size(max = 255, message = "Description cannot exceed 255 characters.")
    String description
) {
    /**
     * Compact constructor for the TransactionRequest record.
     * 
     * Java records automatically generate a constructor with all parameters,
     * but we can include a compact constructor for additional validation
     * or normalization if needed in the future.
     * 
     * Current implementation relies on the validation annotations
     * for data integrity checks during the validation phase.
     * 
     * The constructor is automatically generated by the Java compiler
     * and includes all the fields as parameters in the order they are declared.
     */
}