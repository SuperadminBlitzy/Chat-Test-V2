import { IsEnum, IsString, IsUUID, IsNumber, IsDate, IsOptional } from 'class-validator'; // v0.14.1

/**
 * Enumeration defining the possible statuses of a blockchain transaction
 * within the Unified Financial Services Platform settlement network.
 * 
 * This enum supports the complete transaction lifecycle from initiation
 * through final settlement on the blockchain network, ensuring compliance
 * with regulatory requirements and audit trail maintenance.
 */
export enum TransactionStatus {
  /**
   * Transaction has been initiated but not yet validated or processed.
   * Initial state when transaction request is received from client.
   */
  PENDING = 'PENDING',

  /**
   * Transaction is currently being processed through validation,
   * risk assessment, and pre-settlement activities.
   * Includes AML checks, fraud detection, and compliance validation.
   */
  PROCESSING = 'PROCESSING',

  /**
   * Transaction has been successfully settled on the blockchain network.
   * Smart contract execution completed and immutable record created.
   * Final state for successful transactions.
   */
  SETTLED = 'SETTLED',

  /**
   * Transaction processing failed due to technical errors,
   * insufficient funds, or system failures.
   * Requires manual investigation and potential retry.
   */
  FAILED = 'FAILED',

  /**
   * Transaction was rejected due to compliance violations,
   * risk assessment failures, or regulatory restrictions.
   * Final state for transactions that cannot be processed.
   */
  REJECTED = 'REJECTED'
}

/**
 * Represents a financial transaction within the blockchain settlement network.
 * 
 * This class defines the complete data structure for transactions processed
 * through the Unified Financial Services Platform, supporting both traditional
 * financial operations and blockchain-based settlement mechanisms.
 * 
 * The model implements comprehensive validation rules to ensure data integrity,
 * regulatory compliance, and seamless integration with the transaction
 * processing workflow described in section 4.1.1 of the technical specification.
 * 
 * @class Transaction
 * @author Unified Financial Services Platform
 * @version 1.0.0
 * @since 2024-01-01
 */
export class Transaction {
  /**
   * Unique identifier for the transaction within the platform.
   * Generated using UUID v4 format to ensure global uniqueness
   * across distributed systems and blockchain networks.
   * 
   * @type {string}
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID(4, {
    message: 'Transaction ID must be a valid UUID v4 format'
  })
  @IsString({
    message: 'Transaction ID must be a string'
  })
  id: string;

  /**
   * Identifier of the account initiating the transaction.
   * Links transaction to specific customer account for compliance
   * tracking and audit trail maintenance.
   * 
   * @type {string}
   * @example "ACC123456789"
   */
  @IsUUID(4, {
    message: 'Account ID must be a valid UUID v4 format'
  })
  @IsString({
    message: 'Account ID must be a string'
  })
  accountId: string;

  /**
   * Transaction amount in the specified currency.
   * Supports decimal precision required for financial calculations
   * and compliance with monetary regulations.
   * 
   * Must be positive for debit transactions, negative for credit adjustments.
   * Validation ensures proper financial transaction processing.
   * 
   * @type {number}
   * @example 1500.75
   */
  @IsNumber(
    {
      maxDecimalPlaces: 2,
      allowNaN: false,
      allowInfinity: false
    },
    {
      message: 'Amount must be a valid number with maximum 2 decimal places'
    }
  )
  amount: number;

  /**
   * ISO 4217 three-letter currency code.
   * Ensures compliance with international financial standards
   * and supports multi-currency transaction processing.
   * 
   * @type {string}
   * @example "USD", "EUR", "GBP", "JPY"
   */
  @IsString({
    message: 'Currency must be a string'
  })
  currency: string;

  /**
   * Current status of the transaction in the processing workflow.
   * Tracks transaction through the complete lifecycle from initiation
   * to final settlement on the blockchain network.
   * 
   * @type {TransactionStatus}
   * @example TransactionStatus.PENDING
   */
  @IsEnum(TransactionStatus, {
    message: 'Status must be a valid TransactionStatus enum value'
  })
  status: TransactionStatus;

  /**
   * Timestamp when the transaction was initiated.
   * Provides temporal tracking for audit purposes and
   * regulatory reporting requirements.
   * 
   * Automatically set during transaction creation and
   * used for performance monitoring and SLA compliance.
   * 
   * @type {Date}
   * @example new Date('2024-01-15T10:30:00.000Z')
   */
  @IsDate({
    message: 'Timestamp must be a valid Date object'
  })
  timestamp: Date;

  /**
   * Classification of the transaction type for routing and processing.
   * Supports different transaction workflows based on business logic
   * and regulatory requirements.
   * 
   * Common types include: PAYMENT, TRANSFER, SETTLEMENT, REFUND, ADJUSTMENT
   * 
   * @type {string}
   * @example "PAYMENT", "CROSS_BORDER_TRANSFER"
   */
  @IsString({
    message: 'Transaction type must be a string'
  })
  transactionType: string;

  /**
   * Human-readable description of the transaction purpose.
   * Provides context for transaction analysis, customer service,
   * and regulatory reporting.
   * 
   * @type {string}
   * @example "International wire transfer to supplier payment"
   */
  @IsOptional()
  @IsString({
    message: 'Description must be a string when provided'
  })
  description: string;

  /**
   * External reference number for transaction tracking.
   * Links transaction to external systems, customer references,
   * or regulatory identifiers for cross-system reconciliation.
   * 
   * @type {string}
   * @example "REF-2024-001-ABC123"
   */
  @IsString({
    message: 'Reference number must be a string'
  })
  referenceNumber: string;

  /**
   * Exchange rate applied for currency conversion transactions.
   * Required for cross-border payments and multi-currency processing.
   * Set to 1.0 for same-currency transactions.
   * 
   * Supports the cross-border payment processing feature (F-011)
   * described in the technical requirements.
   * 
   * @type {number}
   * @example 1.2745
   */
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 6,
      allowNaN: false,
      allowInfinity: false
    },
    {
      message: 'Exchange rate must be a valid number with maximum 6 decimal places'
    }
  )
  exchangeRate: number;

  /**
   * Account identifier of the transaction counterparty.
   * Required for bilateral transactions, transfers, and settlements.
   * Supports the peer-to-peer transaction processing described
   * in the blockchain settlement workflow.
   * 
   * @type {string}
   * @example "ACC987654321"
   */
  @IsOptional()
  @IsUUID(4, {
    message: 'Counterparty Account ID must be a valid UUID v4 format when provided'
  })
  @IsString({
    message: 'Counterparty Account ID must be a string when provided'
  })
  counterpartyAccountId: string;

  /**
   * Unique identifier assigned by the blockchain network upon settlement.
   * Links the platform transaction to the immutable blockchain record
   * for complete audit trail and regulatory compliance.
   * 
   * Set when transaction reaches SETTLED status through the
   * Hyperledger Fabric network described in the architecture.
   * 
   * @type {string}
   * @example "0x1234567890abcdef1234567890abcdef12345678"
   */
  @IsOptional()
  @IsString({
    message: 'Blockchain transaction ID must be a string when provided'
  })
  blockchainTransactionId: string;

  /**
   * Initializes a new Transaction instance with validation support.
   * 
   * The constructor sets up the transaction object with default values
   * and ensures proper initialization for the validation decorators
   * to function correctly during data processing.
   * 
   * Default values are applied for:
   * - Status: PENDING (initial state)
   * - Timestamp: Current date/time
   * - Exchange rate: 1.0 (same currency)
   * 
   * @constructor
   */
  constructor() {
    // Initialize with safe defaults for required fields
    this.status = TransactionStatus.PENDING;
    this.timestamp = new Date();
    this.exchangeRate = 1.0;
  }

  /**
   * Validates if the transaction can proceed to blockchain settlement.
   * 
   * Performs business logic validation to ensure the transaction
   * meets all requirements for blockchain processing, including
   * data completeness and regulatory compliance checks.
   * 
   * @returns {boolean} True if transaction can be settled on blockchain
   */
  public canProceedToSettlement(): boolean {
    return (
      this.status === TransactionStatus.PROCESSING &&
      this.amount > 0 &&
      this.accountId?.length > 0 &&
      this.currency?.length === 3 &&
      this.transactionType?.length > 0 &&
      this.referenceNumber?.length > 0
    );
  }

  /**
   * Marks the transaction as settled with blockchain confirmation.
   * 
   * Updates transaction status to SETTLED and records the blockchain
   * transaction ID for immutable audit trail and regulatory compliance.
   * 
   * @param {string} blockchainTxId - Blockchain transaction identifier
   */
  public markAsSettled(blockchainTxId: string): void {
    this.status = TransactionStatus.SETTLED;
    this.blockchainTransactionId = blockchainTxId;
  }

  /**
   * Updates transaction status based on processing results.
   * 
   * Provides controlled state transitions following the transaction
   * processing workflow defined in the technical specification.
   * 
   * @param {TransactionStatus} newStatus - New transaction status
   * @param {string} [reason] - Optional reason for status change
   */
  public updateStatus(newStatus: TransactionStatus, reason?: string): void {
    // Validate allowed state transitions
    const allowedTransitions: Record<TransactionStatus, TransactionStatus[]> = {
      [TransactionStatus.PENDING]: [TransactionStatus.PROCESSING, TransactionStatus.REJECTED],
      [TransactionStatus.PROCESSING]: [TransactionStatus.SETTLED, TransactionStatus.FAILED, TransactionStatus.REJECTED],
      [TransactionStatus.SETTLED]: [], // Final state
      [TransactionStatus.FAILED]: [TransactionStatus.PROCESSING], // Allow retry
      [TransactionStatus.REJECTED]: [] // Final state
    };

    if (!allowedTransitions[this.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
  }

  /**
   * Calculates the equivalent amount in base currency using exchange rate.
   * 
   * Supports multi-currency transaction processing and cross-border
   * payment calculations as required by the F-011 feature specification.
   * 
   * @returns {number} Amount converted to base currency
   */
  public getBaseAmount(): number {
    return this.amount * (this.exchangeRate || 1.0);
  }

  /**
   * Determines if this is a cross-border transaction.
   * 
   * Identifies transactions requiring enhanced compliance checks
   * and regulatory reporting as per international banking standards.
   * 
   * @returns {boolean} True if transaction involves currency conversion
   */
  public isCrossBorder(): boolean {
    return this.exchangeRate !== undefined && this.exchangeRate !== 1.0;
  }

  /**
   * Generates a comprehensive audit log entry for the transaction.
   * 
   * Creates detailed logging information for regulatory compliance,
   * fraud detection analysis, and operational monitoring as required
   * by the audit logging configuration in the technical specification.
   * 
   * @returns {object} Structured audit log entry
   */
  public generateAuditLog(): object {
    return {
      transactionId: this.id,
      accountId: this.accountId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      timestamp: this.timestamp.toISOString(),
      transactionType: this.transactionType,
      referenceNumber: this.referenceNumber,
      exchangeRate: this.exchangeRate,
      counterpartyAccountId: this.counterpartyAccountId,
      blockchainTransactionId: this.blockchainTransactionId,
      isCrossBorder: this.isCrossBorder(),
      baseAmount: this.getBaseAmount(),
      auditTimestamp: new Date().toISOString()
    };
  }
}