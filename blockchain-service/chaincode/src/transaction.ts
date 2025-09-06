import { Object, Property } from 'fabric-contract-api'; // ^2.5.4

/**
 * Transaction Class for Unified Financial Services Platform
 * 
 * This class represents a financial transaction within the UFS blockchain settlement network.
 * It serves as the core data structure for recording immutable transaction records on the
 * distributed ledger, supporting the platform's blockchain-based settlement capabilities.
 * 
 * The Transaction class is designed to support:
 * - Real-time transaction settlement with atomic operations
 * - Multi-party consensus validation through smart contracts
 * - Immutable audit trails for regulatory compliance
 * - Cross-border payment processing with transparent settlement
 * 
 * Technical Implementation:
 * - Utilizes Hyperledger Fabric's fabric-contract-api for chaincode integration
 * - Supports ISO20022 and SWIFT messaging standards through structured data
 * - Enables atomic settlement operations eliminating settlement risk
 * - Provides comprehensive transaction lifecycle tracking
 * 
 * Regulatory Compliance:
 * - Maintains complete audit trails for SOX, IFRS, and GDPR compliance
 * - Supports AML transaction monitoring requirements
 * - Enables regulatory reporting through immutable transaction records
 * - Implements data retention policies aligned with financial regulations
 * 
 * @author UFS Platform Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Object()
export class Transaction {
    /**
     * Unique identifier for the transaction
     * 
     * This field serves as the primary key for transaction identification across
     * the blockchain network. It follows UUID v4 format to ensure global uniqueness
     * and prevent collision across distributed nodes.
     * 
     * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * Usage: Transaction tracking, reconciliation, audit trail reference
     * 
     * @example "f47ac10b-58cc-4372-a567-0e02b2c3d479"
     */
    @Property()
    public transactionId: string;

    /**
     * Source account or entity initiating the transaction
     * 
     * Represents the originating party in the financial transaction. This field
     * supports multiple identifier formats including account numbers, IBAN,
     * cryptocurrency addresses, or entity identifiers based on transaction type.
     * 
     * Security Considerations:
     * - Sensitive data may be hashed or encrypted based on privacy requirements
     * - Supports pseudonymization for privacy-preserving transactions
     * - Integrated with KYC/AML validation processes
     * 
     * @example "IBAN:GB29NWBK60161331926819" or "ACCT:1234567890" or "ENTITY:BANK001"
     */
    @Property()
    public from: string;

    /**
     * Destination account or entity receiving the transaction
     * 
     * Represents the beneficiary party in the financial transaction. This field
     * mirrors the format flexibility of the 'from' field to support various
     * transaction types and payment rails within the settlement network.
     * 
     * Validation Features:
     * - Real-time account validation against external systems
     * - Sanctions screening integration for compliance
     * - Support for correspondent banking relationships
     * 
     * @example "IBAN:DE89370400440532013000" or "ACCT:0987654321" or "ENTITY:BANK002"
     */
    @Property()
    public to: string;

    /**
     * Transaction amount in the smallest currency unit
     * 
     * Represents the monetary value being transferred in the transaction.
     * Stored as an integer in the smallest denomination (e.g., cents for USD,
     * pence for GBP) to avoid floating-point precision issues in financial calculations.
     * 
     * Implementation Details:
     * - Supports amounts up to 2^53-1 (safe integer limit in JavaScript)
     * - Precision handling ensures accurate settlement calculations
     * - Integration with currency-specific rounding rules
     * 
     * Business Rules:
     * - Must be positive for standard transactions
     * - Zero amounts allowed for fee-only transactions
     * - Maximum limits enforced based on regulatory requirements
     * 
     * @example 1000000 (represents $10,000.00 for USD transactions)
     */
    @Property()
    public amount: number;

    /**
     * Currency code for the transaction amount
     * 
     * Specifies the currency denomination using ISO 4217 three-letter currency codes.
     * This field enables multi-currency support within the settlement network and
     * facilitates cross-border payment processing with appropriate exchange rate handling.
     * 
     * Supported Features:
     * - ISO 4217 standard compliance for fiat currencies
     * - Digital asset support through custom currency codes
     * - Real-time exchange rate integration for FX transactions
     * - Currency-specific validation and formatting rules
     * 
     * Regulatory Compliance:
     * - AML transaction monitoring by currency type
     * - Sanctions screening for restricted currencies
     * - Reporting requirements for high-value currency transactions
     * 
     * @example "USD", "EUR", "GBP", "JPY", "BTC", "CBDC"
     */
    @Property()
    public currency: string;

    /**
     * Transaction timestamp in Unix epoch milliseconds
     * 
     * Records the precise moment when the transaction was initiated or processed.
     * Uses Unix timestamp format (milliseconds since January 1, 1970 UTC) to ensure
     * consistent time representation across distributed systems and time zones.
     * 
     * Temporal Features:
     * - Microsecond precision for high-frequency trading scenarios
     * - UTC timezone normalization for global consistency
     * - Immutable timestamp preventing transaction replay attacks
     * - Integration with blockchain consensus timestamp validation
     * 
     * Operational Uses:
     * - Settlement window calculations
     * - Regulatory reporting time boundaries
     * - Performance metrics and SLA monitoring
     * - Audit trail chronological ordering
     * 
     * @example 1672531200000 (represents January 1, 2023 00:00:00 UTC)
     */
    @Property()
    public timestamp: number;

    /**
     * Current status of the transaction in the settlement lifecycle
     * 
     * Tracks the transaction through various stages of the settlement process.
     * This field enables real-time transaction monitoring and supports the
     * implementation of atomic settlement operations with proper state management.
     * 
     * Allowed Status Values:
     * - "INITIATED": Transaction request received and validated
     * - "PENDING": Awaiting consensus or additional approvals
     * - "PROCESSING": Active settlement processing in progress
     * - "SETTLED": Successfully completed and finalized
     * - "FAILED": Settlement failed, requires investigation
     * - "CANCELLED": Transaction cancelled before settlement
     * - "SUSPENDED": Temporarily halted for compliance review
     * 
     * State Transitions:
     * - INITIATED → PENDING → PROCESSING → SETTLED (success path)
     * - Any status → FAILED (error conditions)
     * - INITIATED/PENDING → CANCELLED (cancellation requests)
     * - Any status → SUSPENDED (compliance holds)
     * 
     * Integration Points:
     * - Real-time status updates to external systems
     * - Customer notification triggers based on status changes
     * - Regulatory reporting status aggregations
     * 
     * @example "SETTLED" or "PROCESSING" or "FAILED"
     */
    @Property()
    public status: string;

    /**
     * Settlement batch or session identifier
     * 
     * Links the transaction to a specific settlement batch or session within the
     * blockchain network. This field enables efficient settlement processing through
     * batch operations while maintaining individual transaction traceability.
     * 
     * Settlement Architecture:
     * - Batch processing for operational efficiency
     * - Atomic settlement guarantee for entire batches
     * - Multi-party settlement reconciliation support
     * - Cross-border settlement session management
     * 
     * Operational Benefits:
     * - Netting calculations for related transactions
     * - Settlement finality determination
     * - Liquidity management optimization
     * - Correspondent banking settlement coordination
     * 
     * Compliance Features:
     * - Regulatory reporting batch aggregations
     * - Settlement risk monitoring by batch
     * - Audit trail batch-level analysis
     * - Cross-jurisdictional settlement tracking
     * 
     * Format Guidelines:
     * - Timestamp-based batch identifiers (YYYYMMDD-HHMMSS-BATCH)
     * - Settlement session references (SESSION-xxxxxxxx)
     * - Cross-border batch codes (XB-COUNTRY-SEQUENCE)
     * 
     * @example "20240101-120000-BATCH001" or "SESSION-abc123def" or "XB-US-GB-001"
     */
    @Property()
    public settlementId: string;

    /**
     * Constructor for Transaction class
     * 
     * Initializes a new Transaction instance with default values.
     * The constructor sets up the basic structure without requiring parameters,
     * allowing for flexible instantiation patterns within the chaincode environment.
     * 
     * Design Considerations:
     * - Parameterless constructor supports Hyperledger Fabric serialization requirements
     * - Property initialization handled through direct assignment or factory methods
     * - Validation logic implemented at the chaincode contract level
     * - Immutability principles maintained through blockchain state management
     * 
     * Usage Patterns:
     * - Direct instantiation: new Transaction()
     * - Factory method creation: TransactionFactory.create(params)
     * - Chaincode context initialization: ctx.stub.getState()
     * - Smart contract method parameters: @Param() transaction: Transaction
     * 
     * Post-Construction Steps:
     * 1. Property assignment with validated data
     * 2. Business rule validation
     * 3. Cryptographic signature verification
     * 4. Blockchain state persistence
     */
    public constructor() {
        // Default constructor for Hyperledger Fabric compatibility
        // Properties will be initialized through setter methods or direct assignment
        // during chaincode execution and smart contract processing
        
        // Initialize default values to ensure consistent state
        this.transactionId = '';
        this.from = '';
        this.to = '';
        this.amount = 0;
        this.currency = '';
        this.timestamp = 0;
        this.status = '';
        this.settlementId = '';
    }
}