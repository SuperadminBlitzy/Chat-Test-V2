/**
 * Blockchain Service Models - Main Entry Point
 * 
 * This file serves as the central hub for all data models within the blockchain-service.
 * It re-exports all models, types, enums, interfaces, and utility functions from the
 * individual model files, providing a unified access point for the blockchain-based
 * settlement network components.
 * 
 * The models support the following key features from the technical specification:
 * - F-009: Blockchain-based Settlement Network (2.1.3 Blockchain and Settlement Features)
 * - F-010: Smart Contract Management (2.1.3 Blockchain and Settlement Features)  
 * - F-011: Cross-border Payment Processing (2.1.3 Blockchain and Settlement Features)
 * - F-012: Settlement Reconciliation Engine (2.1.3 Blockchain and Settlement Features)
 * - Transaction Processing Workflow (4.1.1 Core Business Processes)
 * 
 * This centralized export approach enables:
 * - Simplified imports across the blockchain service ecosystem
 * - Consistent access to all blockchain-related data structures
 * - Type safety for settlement operations and smart contract management
 * - Support for Hyperledger Fabric network integration
 * - Comprehensive transaction lifecycle management
 * 
 * @fileoverview Central export hub for blockchain service data models
 * @author Unified Financial Services Platform Development Team
 * @version 1.0.0
 * @since 2024-01-01
 * @compliance Hyperledger Fabric 2.5+, TypeScript 5.3+
 */

// ============================================================================
// SETTLEMENT MODEL EXPORTS
// ============================================================================
// Re-export all settlement-related types, interfaces, enums, and utilities
// Supporting F-009 (Blockchain-based Settlement Network) and 
// F-012 (Settlement Reconciliation Engine)

/**
 * Settlement status enumeration for tracking settlement lifecycle states
 * across the blockchain network. Defines PENDING, COMPLETED, and FAILED states
 * for comprehensive settlement status management.
 */
export { SettlementStatus } from './settlement.model';

/**
 * Core Settlement interface defining the structure for settlement transactions
 * within the blockchain-based settlement network. Includes settlement ID,
 * transaction reference, amount, currency, status, and audit timestamps.
 */
export { Settlement } from './settlement.model';

/**
 * Type guard function for runtime validation of Settlement objects.
 * Ensures data integrity when working with settlement data from external
 * sources or during deserialization processes.
 */
export { isSettlement } from './settlement.model';

/**
 * Utility function to validate settlement status strings against the
 * SettlementStatus enumeration. Provides type safety for status operations.
 */
export { isValidSettlementStatus } from './settlement.model';

/**
 * Factory function for creating new Settlement objects with proper
 * initialization and default values. Ensures consistent settlement
 * object creation across the blockchain service.
 */
export { createSettlement } from './settlement.model';

/**
 * Interface for settlement update operations, excluding immutable fields
 * such as settlement ID and creation timestamp. Used for status transitions
 * and settlement modifications during processing.
 */
export { SettlementUpdate } from './settlement.model';

/**
 * Type definition for settlement status transition rules, defining valid
 * state changes within the settlement lifecycle. Ensures business rule
 * compliance for settlement status management.
 */
export { StatusTransition } from './settlement.model';

/**
 * Predefined settlement status transition rules array defining allowed
 * state changes between settlement statuses. Used by the Settlement
 * Reconciliation Engine for validation and workflow management.
 */
export { SETTLEMENT_STATUS_TRANSITIONS } from './settlement.model';

/**
 * Function to validate settlement status transitions against business rules.
 * Prevents invalid state changes and maintains settlement data integrity
 * throughout the blockchain settlement process.
 */
export { isValidStatusTransition } from './settlement.model';

// ============================================================================
// SMART CONTRACT MODEL EXPORTS  
// ============================================================================
// Re-export all smart contract-related interfaces, types, and utilities
// Supporting F-010 (Smart Contract Management) and Hyperledger Fabric integration

/**
 * Core interface defining smart contract structure and metadata for
 * Hyperledger Fabric deployment. Includes contract identification,
 * versioning, channel information, and deployment timestamps.
 */
export { ISmartContract } from './smartContract.model';

/**
 * Type guard function for validating ISmartContract objects at runtime.
 * Ensures smart contract data conforms to expected structure and
 * validation rules for reliable contract management operations.
 */
export { isValidSmartContract } from './smartContract.model';

/**
 * Enumeration of supported smart contract types within the financial
 * services platform. Includes Payment Processing, Identity Management,
 * Compliance Automation, and Asset Tokenization contract categories.
 */
export { SmartContractType } from './smartContract.model';

/**
 * Extended interface for smart contract deployment metadata, including
 * deployment status, contract type, network endpoints, gas estimates,
 * and authorized organization access controls.
 */
export { ISmartContractDeployment } from './smartContract.model';

/**
 * Default export of the core ISmartContract interface for simplified
 * imports when only the primary smart contract interface is needed.
 */
export { default as SmartContract } from './smartContract.model';

// ============================================================================
// TRANSACTION MODEL EXPORTS
// ============================================================================  
// Re-export all transaction-related classes, enums, and types
// Supporting transaction processing workflow (4.1.1 Core Business Processes)
// and cross-border payment processing (F-011)

/**
 * Enumeration defining transaction status states throughout the complete
 * transaction lifecycle. Includes PENDING, PROCESSING, SETTLED, FAILED,
 * and REJECTED states for comprehensive transaction state management.
 */
export { TransactionStatus } from './transaction.model';

/**
 * Core Transaction class representing financial transactions within the
 * blockchain settlement network. Includes comprehensive validation,
 * state management, audit logging, and blockchain integration capabilities.
 * 
 * Supports multi-currency transactions, cross-border payments, and
 * complete transaction lifecycle management from initiation to settlement.
 */
export { Transaction } from './transaction.model';

// ============================================================================
// TYPE ALIASES AND CONVENIENCE EXPORTS
// ============================================================================
// Provide convenient type aliases and grouped exports for enhanced developer
// experience and simplified import patterns across the blockchain service

/**
 * Union type of all possible transaction and settlement status values
 * for unified status management across blockchain operations.
 */
export type BlockchainStatus = TransactionStatus | SettlementStatus;

/**
 * Union type of all core blockchain model interfaces for type constraints
 * and generic operations across different blockchain entity types.
 */
export type BlockchainEntity = Settlement | ISmartContract | Transaction;

/**
 * Comprehensive type definition encompassing all blockchain-related enumerations
 * used throughout the blockchain service for status tracking and categorization.
 */
export type BlockchainEnum = TransactionStatus | SettlementStatus | SmartContractType;

// ============================================================================
// MODULE METADATA AND VERSION INFORMATION
// ============================================================================
// Export module-level metadata for version tracking, compatibility checks,
// and integration verification across the blockchain service ecosystem

/**
 * Module version information for compatibility tracking and integration
 * verification. Updated with each release to ensure proper version management
 * across distributed blockchain service components.
 */
export const BLOCKCHAIN_MODELS_VERSION = '1.0.0';

/**
 * Supported Hyperledger Fabric version compatibility information.
 * Ensures blockchain service models align with the deployed network
 * infrastructure and smart contract runtime requirements.
 */
export const HYPERLEDGER_FABRIC_COMPATIBILITY = '2.5+';

/**
 * TypeScript version compatibility information for development environment
 * setup and build pipeline configuration validation.
 */
export const TYPESCRIPT_COMPATIBILITY = '5.3+';

/**
 * Module metadata object containing comprehensive information about the
 * blockchain models module for runtime introspection and debugging.
 */
export const MODULE_METADATA = {
  name: 'blockchain-service-models',
  version: BLOCKCHAIN_MODELS_VERSION,
  description: 'Unified data models for blockchain-based financial services',
  features: [
    'F-009: Blockchain-based Settlement Network',
    'F-010: Smart Contract Management', 
    'F-011: Cross-border Payment Processing',
    'F-012: Settlement Reconciliation Engine'
  ],
  compatibility: {
    hyperledgerFabric: HYPERLEDGER_FABRIC_COMPATIBILITY,
    typescript: TYPESCRIPT_COMPATIBILITY
  },
  exportedTypes: {
    interfaces: ['Settlement', 'ISmartContract', 'ISmartContractDeployment', 'SettlementUpdate'],
    classes: ['Transaction'],
    enums: ['SettlementStatus', 'TransactionStatus', 'SmartContractType'],
    functions: [
      'isSettlement',
      'isValidSettlementStatus', 
      'createSettlement',
      'isValidStatusTransition',
      'isValidSmartContract'
    ],
    constants: ['SETTLEMENT_STATUS_TRANSITIONS']
  }
} as const;