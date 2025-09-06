/**
 * Settlement Model for Blockchain-based Settlement Network
 * 
 * This module defines the core data structures for managing settlements within the
 * blockchain service. It supports the Blockchain-based Settlement Network (F-009)
 * and Settlement Reconciliation Engine (F-012) features as part of the comprehensive
 * financial services platform.
 * 
 * The model is designed to work with Hyperledger Fabric blockchain infrastructure
 * and provides type safety for settlement operations, status tracking, and
 * reconciliation processes.
 * 
 * @fileoverview Settlement data model and type definitions
 * @author Financial Platform Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enumeration of possible settlement statuses within the blockchain network.
 * 
 * This enum defines the lifecycle states of a settlement as it progresses through
 * the blockchain-based settlement network. Each status represents a distinct phase
 * in the settlement process and is used by the Settlement Reconciliation Engine
 * to track and manage settlement states.
 * 
 * @enum {string}
 * @readonly
 */
export enum SettlementStatus {
  /**
   * Settlement has been initiated but not yet processed by the blockchain network.
   * This is the initial state when a settlement request is created and awaiting
   * blockchain validation and consensus.
   * 
   * @type {string}
   */
  PENDING = 'PENDING',

  /**
   * Settlement has been successfully processed and committed to the blockchain.
   * This indicates that the settlement has achieved consensus across the network
   * nodes and has been immutably recorded in the distributed ledger.
   * 
   * @type {string}
   */
  COMPLETED = 'COMPLETED',

  /**
   * Settlement processing has failed due to validation errors, insufficient funds,
   * network issues, or other blockchain-related failures. Failed settlements
   * require manual intervention or retry mechanisms.
   * 
   * @type {string}
   */
  FAILED = 'FAILED'
}

/**
 * Interface defining the structure of a settlement entity within the blockchain service.
 * 
 * This interface represents a settlement transaction that moves value between parties
 * through the blockchain-based settlement network. It contains all necessary metadata
 * for tracking, reconciling, and auditing settlement operations.
 * 
 * The Settlement interface is designed to support:
 * - Cross-border payment processing
 * - Multi-currency settlement operations
 * - Regulatory compliance and audit trails
 * - Real-time settlement status tracking
 * - Integration with smart contract execution
 * 
 * @interface Settlement
 * @export
 */
export interface Settlement {
  /**
   * Unique identifier for the settlement transaction.
   * 
   * This UUID serves as the primary key for settlement records and is used
   * across all system components for referencing specific settlements.
   * Generated using cryptographically secure random number generation.
   * 
   * @type {string}
   * @format uuid
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  settlementId: string;

  /**
   * Reference to the originating transaction that triggered this settlement.
   * 
   * Links the settlement back to the original payment or transfer request,
   * enabling end-to-end transaction traceability and supporting regulatory
   * compliance requirements for transaction monitoring.
   * 
   * @type {string}
   * @format uuid
   * @example "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
   */
  transactionId: string;

  /**
   * Monetary amount being settled in the specified currency.
   * 
   * Represents the precise value being transferred through the settlement.
   * Should be validated against business rules for minimum/maximum amounts
   * and support high-precision decimal arithmetic for accurate calculations.
   * 
   * @type {number}
   * @minimum 0.01
   * @multipleOf 0.01
   * @example 1250.75
   */
  amount: number;

  /**
   * ISO 4217 three-letter currency code for the settlement amount.
   * 
   * Specifies the currency denomination of the settlement amount.
   * Must conform to ISO 4217 standard currency codes and be validated
   * against supported currencies in the blockchain network.
   * 
   * @type {string}
   * @pattern ^[A-Z]{3}$
   * @example "USD", "EUR", "GBP", "JPY"
   */
  currency: string;

  /**
   * Current processing status of the settlement.
   * 
   * Tracks the settlement through its lifecycle from initiation to completion
   * or failure. Used by the Settlement Reconciliation Engine for status
   * monitoring and automated workflow management.
   * 
   * @type {SettlementStatus}
   * @see {@link SettlementStatus}
   */
  status: SettlementStatus;

  /**
   * Timestamp when the settlement record was initially created.
   * 
   * Records the exact moment the settlement was initiated in the system.
   * Used for audit trails, performance monitoring, and regulatory reporting.
   * Should be stored in UTC and include millisecond precision.
   * 
   * @type {Date}
   * @format date-time
   * @example "2025-01-15T10:30:45.123Z"
   */
  createdAt: Date;

  /**
   * Timestamp when the settlement record was last modified.
   * 
   * Tracks the most recent update to the settlement record, typically
   * when the status changes or additional metadata is added. Essential
   * for change tracking and audit compliance in financial systems.
   * 
   * @type {Date}
   * @format date-time
   * @example "2025-01-15T10:32:15.456Z"
   */
  updatedAt: Date;
}

/**
 * Type guard function to validate if an object conforms to the Settlement interface.
 * 
 * Provides runtime type checking to ensure data integrity when working with
 * settlement objects from external sources or during deserialization.
 * 
 * @param obj - Object to validate as Settlement
 * @returns {boolean} True if object is a valid Settlement, false otherwise
 * 
 * @example
 * ```typescript
 * const data = JSON.parse(settlementJson);
 * if (isSettlement(data)) {
 *   // data is guaranteed to be Settlement type
 *   console.log(`Settlement ${data.settlementId} status: ${data.status}`);
 * }
 * ```
 */
export function isSettlement(obj: any): obj is Settlement {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.settlementId === 'string' &&
    typeof obj.transactionId === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.currency === 'string' &&
    Object.values(SettlementStatus).includes(obj.status) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

/**
 * Type guard function to validate if a string is a valid SettlementStatus.
 * 
 * Ensures that status values conform to the defined enumeration,
 * particularly useful when processing status updates from external systems.
 * 
 * @param status - String to validate as SettlementStatus
 * @returns {boolean} True if string is a valid SettlementStatus, false otherwise
 * 
 * @example
 * ```typescript
 * const statusFromApi = "COMPLETED";
 * if (isValidSettlementStatus(statusFromApi)) {
 *   // statusFromApi is guaranteed to be SettlementStatus
 *   updateSettlementStatus(settlementId, statusFromApi);
 * }
 * ```
 */
export function isValidSettlementStatus(status: string): status is SettlementStatus {
  return Object.values(SettlementStatus).includes(status as SettlementStatus);
}

/**
 * Utility function to create a new Settlement object with default values.
 * 
 * Factory function that ensures all required fields are properly initialized
 * and provides consistent object creation across the application. Useful for
 * testing and creating settlement records programmatically.
 * 
 * @param params - Partial settlement parameters
 * @returns {Settlement} New Settlement object with provided and default values
 * 
 * @example
 * ```typescript
 * const newSettlement = createSettlement({
 *   settlementId: generateUUID(),
 *   transactionId: "existing-transaction-id",
 *   amount: 1000.00,
 *   currency: "USD"
 * });
 * ```
 */
export function createSettlement(params: Partial<Settlement> & {
  settlementId: string;
  transactionId: string;
  amount: number;
  currency: string;
}): Settlement {
  const now = new Date();
  
  return {
    settlementId: params.settlementId,
    transactionId: params.transactionId,
    amount: params.amount,
    currency: params.currency,
    status: params.status || SettlementStatus.PENDING,
    createdAt: params.createdAt || now,
    updatedAt: params.updatedAt || now
  };
}

/**
 * Interface for settlement update operations that excludes immutable fields.
 * 
 * Defines the shape of settlement update requests by excluding fields that
 * should not be modified after initial creation (settlementId, transactionId,
 * createdAt). The updatedAt field is automatically managed by the system.
 * 
 * @interface SettlementUpdate
 * @export
 */
export interface SettlementUpdate {
  /**
   * Updated monetary amount for the settlement.
   * Optional field that allows amount adjustments before settlement completion.
   * 
   * @type {number}
   * @optional
   */
  amount?: number;

  /**
   * Updated currency code for the settlement.
   * Optional field that allows currency changes before settlement completion.
   * 
   * @type {string}
   * @optional
   */
  currency?: string;

  /**
   * Updated status for the settlement.
   * Used to transition settlements through their lifecycle states.
   * 
   * @type {SettlementStatus}
   * @optional
   */
  status?: SettlementStatus;
}

/**
 * Type representing the possible settlement lifecycle transitions.
 * 
 * Defines valid status transitions to ensure business rule compliance
 * and prevent invalid state changes in the settlement workflow.
 * 
 * @type StatusTransition
 * @export
 */
export type StatusTransition = {
  from: SettlementStatus;
  to: SettlementStatus;
  allowed: boolean;
  reason?: string;
};

/**
 * Predefined settlement status transition rules.
 * 
 * Defines the allowed state transitions for settlements to maintain
 * data integrity and business rule compliance. Used by the Settlement
 * Reconciliation Engine to validate status updates.
 * 
 * @constant {StatusTransition[]}
 * @export
 */
export const SETTLEMENT_STATUS_TRANSITIONS: StatusTransition[] = [
  { from: SettlementStatus.PENDING, to: SettlementStatus.COMPLETED, allowed: true },
  { from: SettlementStatus.PENDING, to: SettlementStatus.FAILED, allowed: true },
  { from: SettlementStatus.COMPLETED, to: SettlementStatus.PENDING, allowed: false, reason: 'Completed settlements cannot be reverted' },
  { from: SettlementStatus.COMPLETED, to: SettlementStatus.FAILED, allowed: false, reason: 'Completed settlements cannot be marked as failed' },
  { from: SettlementStatus.FAILED, to: SettlementStatus.PENDING, allowed: true, reason: 'Failed settlements can be retried' },
  { from: SettlementStatus.FAILED, to: SettlementStatus.COMPLETED, allowed: false, reason: 'Failed settlements must be reprocessed through pending state' }
];

/**
 * Function to validate if a settlement status transition is allowed.
 * 
 * Enforces business rules for settlement status changes by checking
 * against predefined transition rules. Prevents invalid state changes
 * that could compromise data integrity.
 * 
 * @param currentStatus - Current settlement status
 * @param newStatus - Desired new settlement status
 * @returns {boolean} True if transition is allowed, false otherwise
 * 
 * @example
 * ```typescript
 * if (isValidStatusTransition(SettlementStatus.PENDING, SettlementStatus.COMPLETED)) {
 *   // Proceed with status update
 *   settlement.status = SettlementStatus.COMPLETED;
 * } else {
 *   throw new Error('Invalid status transition');
 * }
 * ```
 */
export function isValidStatusTransition(
  currentStatus: SettlementStatus,
  newStatus: SettlementStatus
): boolean {
  const transition = SETTLEMENT_STATUS_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === newStatus
  );
  
  return transition?.allowed || false;
}