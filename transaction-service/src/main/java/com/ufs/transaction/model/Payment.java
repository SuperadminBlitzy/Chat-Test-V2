package com.ufs.transaction.model;

// External imports with version information
import jakarta.persistence.*; // jakarta.persistence-api 3.1.0
import lombok.Data; // lombok 1.18.30
import java.math.BigDecimal; // java.base 21
import java.time.LocalDateTime; // java.base 21

// Internal imports
import com.ufs.transaction.model.Transaction;
import com.ufs.transaction.model.TransactionStatus;

/**
 * JPA Entity representing a payment record within the Unified Financial Services Platform.
 * 
 * This entity serves as a detailed representation of a specific payment that is part of
 * a broader transaction workflow. It captures comprehensive payment-specific information
 * including financial amounts, status tracking, external gateway integration details,
 * and audit information for complete payment lifecycle management.
 * 
 * The Payment entity supports the following system requirements:
 * - Transaction Processing (Technical Specifications/2.2.1/F-001): Handles the persistence 
 *   of payment information as part of the overall transaction processing workflow, enabling
 *   real-time data synchronization and unified customer profiles
 * - Blockchain-based Settlement Network (Technical Specifications/2.1.3/F-009): The Payment 
 *   model represents the state of a payment before and after it is settled on the blockchain
 *   network, supporting smart contract management and cross-border payment processing
 * 
 * Key Features:
 * - Auto-generated primary keys using JPA GenerationType.IDENTITY for database compatibility
 * - One-to-one relationship with Transaction entity for comprehensive transaction context
 * - Precise decimal arithmetic for payment amounts using BigDecimal with financial precision
 * - Integration with external payment gateways through paymentGatewayId tracking
 * - Comprehensive status tracking through TransactionStatus enum integration
 * - Full audit trail capabilities with creation and update timestamps
 * - Support for multi-currency payments with ISO 4217 currency code compliance
 * - Optimized for real-time transaction monitoring and blockchain settlement workflows
 * 
 * Database Schema:
 * - Table: payments
 * - Primary Key: Auto-generated Long (IDENTITY strategy)
 * - Foreign Key: transaction_id (references transactions.id)
 * - Indexes: Recommended on status, created_at, payment_gateway_id for performance
 * - Constraints: Non-null constraints on critical fields, precision/scale for decimals
 * 
 * Blockchain Integration:
 * - Supports state tracking for blockchain settlement processes
 * - Compatible with smart contract transaction flows
 * - Enables cross-border payment processing with currency conversion tracking
 * - Provides settlement reconciliation capabilities through status management
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 */
@Data
@Entity
@Table(name = "payments")
public class Payment {

    /**
     * Unique identifier for the payment using auto-generated Long values.
     * 
     * Uses IDENTITY generation strategy for optimal database performance and
     * compatibility with most database systems. This approach provides efficient
     * primary key management while maintaining referential integrity.
     * 
     * Database Mapping:
     * - Column: id
     * - Type: BIGINT (auto-increment)
     * - Constraints: Primary Key, Non-updatable, Non-null
     * - Generation: IDENTITY strategy for database-level auto-increment
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    /**
     * One-to-one relationship with the parent Transaction entity.
     * 
     * This establishes a direct relationship between a payment and its associated
     * transaction, providing complete context for the payment within the broader
     * transaction workflow. The relationship supports both blockchain settlement
     * and traditional payment processing scenarios.
     * 
     * Database Mapping:
     * - Foreign Key: transaction_id (references transactions.id)
     * - Relationship: One-to-One (each payment belongs to exactly one transaction)
     * - Constraints: Non-null (every payment must be associated with a transaction)
     * - Cascade: None (transaction lifecycle managed independently)
     */
    @OneToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    /**
     * The monetary amount of the payment using precise decimal arithmetic.
     * 
     * BigDecimal ensures precise financial calculations without floating-point
     * rounding errors, critical for payment processing accuracy. The precision
     * and scale are configured to handle large monetary values while maintaining
     * accuracy to the smallest currency unit (typically cents).
     * 
     * Database Mapping:
     * - Column: amount
     * - Type: DECIMAL(19,4)
     * - Precision: 19 total digits, 4 decimal places
     * - Constraints: Non-null
     * - Range: Supports values up to 999,999,999,999,999.9999
     * - Scale: 4 decimal places for maximum currency precision
     */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    /**
     * ISO 4217 three-letter currency code for the payment amount.
     * 
     * Supports international payments by specifying the currency in which the
     * payment amount is denominated. Essential for blockchain-based settlement
     * networks and cross-border payment processing. Must conform to ISO 4217
     * standard for global interoperability.
     * 
     * Examples: USD, EUR, GBP, JPY, CAD, BTC, ETH
     * 
     * Database Mapping:
     * - Column: currency
     * - Type: VARCHAR(3)
     * - Constraints: Non-null, Fixed length of 3 characters
     * - Validation: Should match ISO 4217 currency codes
     */
    @Column(nullable = false, length = 3)
    private String currency;

    /**
     * Current lifecycle status of the payment.
     * 
     * Tracks the payment through its complete lifecycle from initiation to
     * completion or termination. Critical for workflow management, blockchain
     * settlement monitoring, and customer communication. Integrates with the
     * broader transaction status management system.
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
    @Column(nullable = false, length = 50)
    private TransactionStatus status;

    /**
     * External payment gateway identifier for third-party payment processor integration.
     * 
     * This field captures the unique identifier assigned by external payment
     * gateways, processors, or blockchain networks for payment tracking and
     * reconciliation purposes. Essential for integrating with multiple payment
     * channels and settlement networks.
     * 
     * Use Cases:
     * - Traditional payment processor transaction IDs
     * - Blockchain transaction hashes
     * - Smart contract execution references
     * - Cross-border payment network identifiers
     * 
     * Database Mapping:
     * - Column: payment_gateway_id
     * - Type: VARCHAR(255)
     * - Constraints: Nullable (not all payments use external gateways)
     * - Recommended Index: For gateway-based reconciliation queries
     */
    @Column(name = "payment_gateway_id")
    private String paymentGatewayId;

    /**
     * Timestamp indicating when the payment record was created.
     * 
     * This immutable field captures the exact moment when the payment was
     * first recorded in the system. Critical for audit trails, compliance
     * reporting, and temporal analysis of payment patterns.
     * 
     * Database Mapping:
     * - Column: created_at
     * - Type: TIMESTAMP
     * - Constraints: Non-null, Immutable after creation
     * - Recommended Index: For temporal queries and reporting
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating when the payment record was last updated.
     * 
     * This field is automatically updated whenever any payment information
     * changes, providing complete audit trail capabilities. Essential for
     * monitoring payment state transitions and compliance reporting.
     * 
     * Database Mapping:
     * - Column: updated_at
     * - Type: TIMESTAMP
     * - Constraints: Non-null, Automatically updated on modification
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Default no-argument constructor required by JPA specification.
     * 
     * This constructor is used by the JPA provider (Hibernate) for entity
     * instantiation during database operations. The Lombok @Data annotation
     * generates additional constructors and utility methods automatically.
     * 
     * Application code should use builder patterns or parameterized constructors
     * for entity creation to ensure proper initialization of all required fields.
     */
    public Payment() {
        // Default constructor for JPA
        // Lombok @Data annotation provides additional constructors and methods
    }

    /**
     * Parameterized constructor for creating new payment instances with essential fields.
     * 
     * This constructor initializes a payment with the minimum required fields for
     * basic payment creation. Optional fields can be set using setter methods
     * after instantiation (provided by Lombok @Data annotation).
     * 
     * @param transaction The associated transaction entity (required)
     * @param amount The payment amount (required)
     * @param currency The ISO 4217 currency code (required)
     * @param status The initial payment status (required)
     */
    public Payment(Transaction transaction, BigDecimal amount, String currency, TransactionStatus status) {
        this.transaction = transaction;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Comprehensive constructor for creating payment instances with all fields.
     * 
     * This constructor provides full control over payment initialization,
     * including external gateway integration and audit timestamps.
     * 
     * @param transaction The associated transaction entity (required)
     * @param amount The payment amount (required)
     * @param currency The ISO 4217 currency code (required)
     * @param status The initial payment status (required)
     * @param paymentGatewayId External payment gateway identifier (optional)
     */
    public Payment(Transaction transaction, BigDecimal amount, String currency, 
                  TransactionStatus status, String paymentGatewayId) {
        this.transaction = transaction;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.paymentGatewayId = paymentGatewayId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * JPA PrePersist callback to set creation timestamp.
     * 
     * This method is automatically called by JPA before the entity is persisted
     * to the database, ensuring consistent timestamp initialization.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * JPA PreUpdate callback to update the modification timestamp.
     * 
     * This method is automatically called by JPA before the entity is updated
     * in the database, maintaining accurate audit trail information.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Business logic methods for payment processing and blockchain integration

    /**
     * Determines if this payment is ready for blockchain settlement processing.
     * 
     * This method evaluates the payment status and associated transaction state
     * to determine if the payment can proceed to blockchain settlement networks.
     * 
     * @return true if the payment is ready for blockchain settlement, false otherwise
     */
    public boolean isReadyForBlockchainSettlement() {
        return this.status == TransactionStatus.SETTLEMENT_IN_PROGRESS && 
               this.transaction != null && 
               this.transaction.getStatus() == TransactionStatus.SETTLEMENT_IN_PROGRESS;
    }

    /**
     * Determines if this payment has been successfully settled.
     * 
     * @return true if the payment status indicates successful completion, false otherwise
     */
    public boolean isSuccessfullySettled() {
        return this.status == TransactionStatus.COMPLETED;
    }

    /**
     * Determines if this payment requires manual intervention or approval.
     * 
     * @return true if the payment status requires manual intervention, false otherwise
     */
    public boolean requiresManualIntervention() {
        return this.status == TransactionStatus.AWAITING_APPROVAL;
    }

    /**
     * Determines if this payment is currently being processed actively.
     * 
     * @return true if the payment is in an active processing state, false otherwise
     */
    public boolean isActivelyProcessing() {
        return this.status != null && this.status.isActivelyProcessing();
    }

    /**
     * Determines if this payment has failed or been rejected.
     * 
     * @return true if the payment status indicates failure or rejection, false otherwise
     */
    public boolean hasFailedOrBeenRejected() {
        return this.status != null && this.status.isFailedOutcome();
    }

    /**
     * Determines if this payment uses an external payment gateway.
     * 
     * @return true if a payment gateway ID is specified, false otherwise
     */
    public boolean usesExternalGateway() {
        return this.paymentGatewayId != null && !this.paymentGatewayId.trim().isEmpty();
    }

    /**
     * Gets the absolute value of the payment amount.
     * 
     * This method is useful for displaying amounts in user interfaces where
     * the sign is indicated separately from the numeric value.
     * 
     * @return The absolute value of the payment amount
     */
    public BigDecimal getAbsoluteAmount() {
        return this.amount != null ? this.amount.abs() : BigDecimal.ZERO;
    }

    /**
     * Determines if this payment is in a terminal state where no further
     * processing will occur.
     * 
     * @return true if the payment status is terminal, false otherwise
     */
    public boolean isInTerminalState() {
        return this.status != null && this.status.isTerminal();
    }

    /**
     * Gets the duration between payment creation and last update.
     * 
     * This method calculates the time elapsed during payment processing,
     * useful for performance monitoring and SLA compliance tracking.
     * 
     * @return Duration in seconds between creation and last update
     */
    public long getProcessingDurationInSeconds() {
        if (this.createdAt != null && this.updatedAt != null) {
            return java.time.Duration.between(this.createdAt, this.updatedAt).getSeconds();
        }
        return 0;
    }

    /**
     * Creates a summary string for the payment suitable for logging and monitoring.
     * 
     * This method provides a concise representation of the payment's key
     * characteristics for operational visibility and debugging purposes.
     * 
     * @return A formatted string summarizing the payment details
     */
    public String toSummaryString() {
        return String.format("Payment{id=%d, amount=%s %s, status=%s, txnId=%s, gateway=%s}",
                this.id, 
                this.amount, 
                this.currency, 
                this.status,
                this.transaction != null ? this.transaction.getId() : "null",
                this.paymentGatewayId);
    }
}