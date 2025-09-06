package com.ufs.transaction.model;

// External imports with version information
import jakarta.persistence.*; // jakarta.persistence-api 3.1.0
import java.math.BigDecimal; // java.base 17
import java.time.LocalDateTime; // java.base 17
import java.util.UUID; // java.base 17
import org.hibernate.annotations.GenericGenerator; // org.hibernate 6.2.2.Final

// Internal imports
import com.ufs.transaction.model.TransactionStatus;

/**
 * JPA Entity representing a financial transaction within the Unified Financial Services Platform.
 * 
 * This entity serves as the core data model for all financial transactions processed through
 * the transaction-service microservice. It captures comprehensive transaction details including
 * financial amounts, counterparty information, status tracking, and audit information.
 * 
 * The entity supports the following system requirements:
 * - Transaction Processing (Technical Specifications/1.3.1): Enables processing of financial 
 *   transactions including payment initiation, risk scoring, fraud detection, and settlement
 * - F-008 Real-time Transaction Monitoring (Technical Specifications/2.1.2): Provides 
 *   structured data for monitoring transactions in real-time for risk and compliance
 * 
 * Key Features:
 * - UUID-based primary keys for distributed system compatibility
 * - Precise decimal arithmetic for financial amounts using BigDecimal
 * - Comprehensive status tracking through TransactionStatus enum
 * - Full audit trail capabilities with timestamps and reference numbers
 * - Support for multi-currency transactions with exchange rate tracking
 * - Counterparty relationship modeling for complex transaction scenarios
 * 
 * Database Schema:
 * - Table: transactions
 * - Primary Key: UUID (auto-generated using Hibernate UUIDGenerator)
 * - Indexes: Recommended on account_id, transaction_date, status for performance
 * - Constraints: Non-null constraints on critical fields, precision/scale for decimals
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    /**
     * Unique identifier for the transaction using UUID format.
     * 
     * UUIDs provide distributed system compatibility and eliminate the risk of
     * primary key conflicts when data is replicated across multiple systems.
     * Uses Hibernate's UUIDGenerator for consistent UUID generation.
     * 
     * Database Mapping:
     * - Column: id
     * - Type: UUID/VARCHAR(36)
     * - Constraints: Primary Key, Non-updatable, Non-null
     */
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Identifier of the primary account associated with this transaction.
     * 
     * This represents the account that initiated or is primarily responsible
     * for the transaction. For debits, this is the source account; for credits,
     * this is the destination account.
     * 
     * Database Mapping:
     * - Column: account_id
     * - Type: UUID/VARCHAR(36)
     * - Constraints: Non-null (required for all transactions)
     * - Recommended Index: For query performance on account-based lookups
     */
    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    /**
     * The monetary amount of the transaction using precise decimal arithmetic.
     * 
     * BigDecimal is used to ensure precise financial calculations without
     * floating-point rounding errors. The precision and scale are configured
     * to handle large monetary values while maintaining accuracy to the cent.
     * 
     * Database Mapping:
     * - Column: amount
     * - Type: DECIMAL(15,2)
     * - Precision: 15 total digits, 2 decimal places  
     * - Constraints: Non-null
     * - Range: Supports values up to 999,999,999,999.99
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /**
     * ISO 4217 three-letter currency code for the transaction amount.
     * 
     * Supports international transactions by specifying the currency in which
     * the transaction amount is denominated. Must conform to ISO 4217 standard.
     * 
     * Examples: USD, EUR, GBP, JPY, CAD
     * 
     * Database Mapping:
     * - Column: currency
     * - Type: VARCHAR(3)
     * - Constraints: Non-null, Fixed length of 3 characters
     */
    @Column(nullable = false, length = 3)
    private String currency;

    /**
     * Categorization of the transaction type for business and regulatory purposes.
     * 
     * This field enables transaction classification for reporting, compliance,
     * and business intelligence purposes. Common values include payment types,
     * transfer categories, and regulatory classifications.
     * 
     * Examples: PAYMENT, TRANSFER, WITHDRAWAL, DEPOSIT, FEE, REFUND
     * 
     * Database Mapping:
     * - Column: transaction_type
     * - Type: VARCHAR(255)
     * - Constraints: Non-null (required for all transactions)
     */
    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    /**
     * Human-readable description or memo for the transaction.
     * 
     * This optional field provides additional context about the transaction
     * purpose or details. May be provided by the customer or generated by
     * the system based on transaction context.
     * 
     * Database Mapping:
     * - Column: description
     * - Type: VARCHAR(255)
     * - Constraints: Nullable (optional field)
     */
    private String description;

    /**
     * Timestamp indicating when the transaction was initiated or occurred.
     * 
     * This is the business date/time of the transaction, which may differ from
     * system processing timestamps. Used for transaction ordering, reporting,
     * and regulatory compliance.
     * 
     * Database Mapping:
     * - Column: transaction_date
     * - Type: TIMESTAMP
     * - Constraints: Non-null
     * - Recommended Index: For date-range queries and reporting
     */
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    /**
     * Current lifecycle status of the transaction.
     * 
     * Tracks the transaction through its complete lifecycle from initiation
     * to completion or termination. Critical for workflow management, monitoring,
     * and customer communication.
     * 
     * Database Mapping:
     * - Column: status
     * - Type: VARCHAR(50) (enum stored as string)
     * - Constraints: Non-null
     * - Recommended Index: For status-based queries and monitoring
     * 
     * @see TransactionStatus for available status values and state transitions
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    /**
     * Unique reference number for external identification and reconciliation.
     * 
     * This optional field provides an external reference that can be used for
     * customer inquiries, statement reconciliation, and integration with
     * external systems. May be customer-provided or system-generated.
     * 
     * Database Mapping:
     * - Column: reference_number
     * - Type: VARCHAR(255)
     * - Constraints: Nullable (optional field)
     */
    @Column(name = "reference_number")
    private String referenceNumber;

    /**
     * Exchange rate applied for currency conversion in cross-currency transactions.
     * 
     * This optional field captures the exchange rate used when the transaction
     * involves currency conversion. Precision of 6 decimal places provides
     * accuracy for most currency pairs while supporting high-precision rates.
     * 
     * Database Mapping:
     * - Column: exchange_rate
     * - Type: DECIMAL(15,6)
     * - Precision: 15 total digits, 6 decimal places
     * - Constraints: Nullable (only used for currency conversion transactions)
     */
    @Column(name = "exchange_rate", precision = 15, scale = 6)
    private BigDecimal exchangeRate;

    /**
     * Identifier of the counterparty account involved in the transaction.
     * 
     * This optional field identifies the other party in bilateral transactions
     * such as transfers, payments, or trades. For single-party transactions
     * like deposits or withdrawals, this field may be null.
     * 
     * Database Mapping:
     * - Column: counterparty_account_id
     * - Type: UUID/VARCHAR(36)
     * - Constraints: Nullable (not all transactions have counterparties)
     */
    @Column(name = "counterparty_account_id")
    private UUID counterpartyAccountId;

    /**
     * Default no-argument constructor required by JPA specification.
     * 
     * This constructor is used by the JPA provider (Hibernate) for entity
     * instantiation during database operations. Application code should
     * use builder patterns or parameterized constructors for entity creation.
     */
    public Transaction() {
        // Default constructor for JPA
    }

    /**
     * Parameterized constructor for creating new transaction instances.
     * 
     * This constructor initializes a transaction with the minimum required
     * fields for basic transaction creation. Optional fields can be set
     * using setter methods after instantiation.
     * 
     * @param accountId The primary account identifier (required)
     * @param amount The transaction amount (required)
     * @param currency The ISO 4217 currency code (required)
     * @param transactionType The transaction type classification (required)
     * @param transactionDate The business date/time of the transaction (required)
     * @param status The initial transaction status (required)
     */
    public Transaction(UUID accountId, BigDecimal amount, String currency, 
                      String transactionType, LocalDateTime transactionDate, 
                      TransactionStatus status) {
        this.accountId = accountId;
        this.amount = amount;
        this.currency = currency;
        this.transactionType = transactionType;
        this.transactionDate = transactionDate;
        this.status = status;
    }

    // Getter and Setter methods with comprehensive documentation

    /**
     * Gets the unique transaction identifier.
     * 
     * @return The UUID that uniquely identifies this transaction
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique transaction identifier.
     * 
     * Note: This method should typically only be called by the JPA provider.
     * Application code should rely on automatic ID generation.
     * 
     * @param id The UUID to set as the transaction identifier
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Gets the primary account identifier associated with this transaction.
     * 
     * @return The UUID of the primary account
     */
    public UUID getAccountId() {
        return accountId;
    }

    /**
     * Sets the primary account identifier for this transaction.
     * 
     * @param accountId The UUID of the primary account (required)
     */
    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    /**
     * Gets the monetary amount of the transaction.
     * 
     * @return The transaction amount as a BigDecimal for precise arithmetic
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the monetary amount of the transaction.
     * 
     * @param amount The transaction amount (required, must be positive for most transaction types)
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Gets the ISO 4217 currency code for the transaction.
     * 
     * @return The three-letter currency code (e.g., "USD", "EUR")
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the ISO 4217 currency code for the transaction.
     * 
     * @param currency The three-letter currency code (required)
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Gets the transaction type classification.
     * 
     * @return The transaction type string for categorization
     */
    public String getTransactionType() {
        return transactionType;
    }

    /**
     * Sets the transaction type classification.
     * 
     * @param transactionType The transaction type for categorization (required)
     */
    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    /**
     * Gets the human-readable transaction description.
     * 
     * @return The transaction description or null if not provided
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the human-readable transaction description.
     * 
     * @param description The transaction description (optional)
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the business date/time when the transaction occurred.
     * 
     * @return The transaction timestamp as LocalDateTime
     */
    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    /**
     * Sets the business date/time when the transaction occurred.
     * 
     * @param transactionDate The transaction timestamp (required)
     */
    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    /**
     * Gets the current lifecycle status of the transaction.
     * 
     * @return The current TransactionStatus enum value
     */
    public TransactionStatus getStatus() {
        return status;
    }

    /**
     * Sets the current lifecycle status of the transaction.
     * 
     * @param status The new transaction status (required)
     */
    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    /**
     * Gets the external reference number for the transaction.
     * 
     * @return The reference number or null if not provided
     */
    public String getReferenceNumber() {
        return referenceNumber;
    }

    /**
     * Sets the external reference number for the transaction.
     * 
     * @param referenceNumber The external reference number (optional)
     */
    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    /**
     * Gets the exchange rate used for currency conversion.
     * 
     * @return The exchange rate as BigDecimal or null if no conversion was performed
     */
    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    /**
     * Sets the exchange rate used for currency conversion.
     * 
     * @param exchangeRate The exchange rate for currency conversion (optional)
     */
    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    /**
     * Gets the counterparty account identifier.
     * 
     * @return The UUID of the counterparty account or null if not applicable
     */
    public UUID getCounterpartyAccountId() {
        return counterpartyAccountId;
    }

    /**
     * Sets the counterparty account identifier.
     * 
     * @param counterpartyAccountId The UUID of the counterparty account (optional)
     */
    public void setCounterpartyAccountId(UUID counterpartyAccountId) {
        this.counterpartyAccountId = counterpartyAccountId;
    }

    // Utility methods for business logic and monitoring

    /**
     * Determines if this transaction represents a debit (outgoing) transaction.
     * 
     * This method can be used in conjunction with business rules to determine
     * the transaction direction based on amount and transaction type.
     * 
     * @return true if this is likely a debit transaction, false otherwise
     */
    public boolean isDebit() {
        // For most transaction types, negative amounts or certain types indicate debits
        return amount != null && amount.compareTo(BigDecimal.ZERO) < 0;
    }

    /**
     * Determines if this transaction represents a credit (incoming) transaction.
     * 
     * @return true if this is likely a credit transaction, false otherwise
     */
    public boolean isCredit() {
        // For most transaction types, positive amounts indicate credits
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Determines if this transaction involves currency conversion.
     * 
     * @return true if an exchange rate is specified, false otherwise
     */
    public boolean isCurrencyConversion() {
        return exchangeRate != null;
    }

    /**
     * Determines if this transaction involves a counterparty.
     * 
     * @return true if a counterparty account is specified, false otherwise
     */
    public boolean hasCounterparty() {
        return counterpartyAccountId != null;
    }

    /**
     * Gets the absolute value of the transaction amount.
     * 
     * This method is useful for displaying amounts in user interfaces where
     * the sign is indicated separately from the numeric value.
     * 
     * @return The absolute value of the transaction amount
     */
    public BigDecimal getAbsoluteAmount() {
        return amount != null ? amount.abs() : BigDecimal.ZERO;
    }

    /**
     * Determines if this transaction is in a terminal state where no further
     * processing will occur.
     * 
     * @return true if the transaction status is terminal, false otherwise
     */
    public boolean isInTerminalState() {
        return status != null && status.isTerminal();
    }

    /**
     * Determines if this transaction is currently being actively processed.
     * 
     * @return true if the transaction is in an active processing state, false otherwise
     */
    public boolean isActivelyProcessing() {
        return status != null && status.isActivelyProcessing();
    }

    /**
     * Determines if this transaction completed successfully.
     * 
     * @return true if the transaction status indicates successful completion, false otherwise
     */
    public boolean isSuccessful() {
        return status != null && status.isSuccessful();
    }

    /**
     * Determines if this transaction represents a failed outcome.
     * 
     * @return true if the transaction status indicates failure, false otherwise
     */
    public boolean hasFailed() {
        return status != null && status.isFailedOutcome();
    }

    // Object contract methods

    /**
     * Indicates whether some other object is "equal to" this transaction.
     * 
     * Two transactions are considered equal if they have the same UUID identifier.
     * This implementation follows the natural equality contract for entities with
     * persistent identifiers.
     * 
     * @param obj the reference object with which to compare
     * @return true if this object is equal to the obj argument, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Transaction that = (Transaction) obj;
        return id != null && id.equals(that.id);
    }

    /**
     * Returns a hash code value for this transaction.
     * 
     * The hash code is based on the transaction's UUID identifier to ensure
     * consistency with the equals method and proper behavior in collections.
     * 
     * @return a hash code value for this transaction
     */
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    /**
     * Returns a string representation of this transaction.
     * 
     * The string includes key identifying information such as ID, amount,
     * currency, and status. This representation is suitable for logging
     * and debugging purposes.
     * 
     * @return a string representation of this transaction
     */
    @Override
    public String toString() {
        return String.format("Transaction{id=%s, accountId=%s, amount=%s %s, type='%s', status=%s, date=%s}",
                id, accountId, amount, currency, transactionType, status, transactionDate);
    }
}