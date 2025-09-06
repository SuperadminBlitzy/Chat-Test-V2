/**
 * Smart Contract Data Model
 * 
 * This file defines the TypeScript interface and data model for Smart Contracts
 * within the blockchain service, specifically designed for Hyperledger Fabric
 * network integration as part of the F-010: Smart Contract Management feature.
 * 
 * The model supports the blockchain-based settlement network requirements
 * outlined in section 2.1.3 Blockchain and Settlement Features, enabling
 * automated financial agreements and processes on the distributed ledger.
 * 
 * @fileoverview Smart Contract model interface for Hyperledger Fabric integration
 * @version 1.0.0
 * @since TypeScript 5.3+
 * @compliance F-010: Smart Contract Management, Hyperledger Fabric 2.5+
 */

/**
 * Interface defining the structure and metadata for a Smart Contract
 * deployed on the Hyperledger Fabric blockchain network.
 * 
 * This interface represents smart contracts used for automating financial
 * agreements and processes, including payment processing, identity management,
 * compliance automation, and asset tokenization as specified in the
 * Hyperledger Fabric Network Configuration.
 * 
 * @interface ISmartContract
 * @description Comprehensive data model for smart contract metadata and deployment information
 * @example
 * const contract: ISmartContract = {
 *   id: "sc_001_payment_processor",
 *   name: "Payment Processing Contract",
 *   version: "1.2.0",
 *   description: "Handles secure payment transactions with multi-signature approval",
 *   channel: "financial-services-channel",
 *   chaincodeId: "payment-chaincode-v1",
 *   createdAt: new Date("2024-01-15T10:30:00Z"),
 *   updatedAt: new Date("2024-03-20T14:45:30Z")
 * };
 */
export interface ISmartContract {
  /**
   * Unique identifier for the smart contract instance
   * 
   * This serves as the primary key for smart contract identification
   * across the blockchain service ecosystem. The ID should be unique
   * within the entire financial services network.
   * 
   * @type {string}
   * @format Alphanumeric with underscores (e.g., "sc_001_payment_processor")
   * @required
   * @readonly After creation, this field should not be modified
   */
  id: string;

  /**
   * Human-readable name of the smart contract
   * 
   * Descriptive name that clearly identifies the contract's purpose
   * and functionality for business users and administrators.
   * 
   * @type {string}
   * @maxLength 100
   * @required
   * @example "Payment Processing Contract", "KYC Verification Contract"
   */
  name: string;

  /**
   * Semantic version of the smart contract
   * 
   * Version following semantic versioning (SemVer) format to track
   * contract evolution and ensure compatibility across deployments.
   * Used for contract upgrade management and rollback procedures.
   * 
   * @type {string}
   * @format Semantic version (MAJOR.MINOR.PATCH)
   * @pattern ^\d+\.\d+\.\d+$
   * @required
   * @example "1.0.0", "2.1.3", "0.5.0-beta"
   */
  version: string;

  /**
   * Detailed description of the smart contract functionality
   * 
   * Comprehensive explanation of the contract's purpose, business logic,
   * and integration points within the financial services ecosystem.
   * Should include security features and compliance considerations.
   * 
   * @type {string}
   * @maxLength 1000
   * @required
   * @example "Automated payment processing with multi-signature approval, time locks, and regulatory compliance checks"
   */
  description: string;

  /**
   * Hyperledger Fabric channel identifier
   * 
   * The specific channel on the Hyperledger Fabric network where this
   * smart contract is deployed. Channels provide privacy and isolation
   * between different business networks and participant organizations.
   * 
   * @type {string}
   * @format Lowercase alphanumeric with hyphens
   * @pattern ^[a-z0-9-]+$
   * @required
   * @example "financial-services-channel", "payment-processing-channel"
   * @see Hyperledger Fabric Network Configuration for available channels
   */
  channel: string;

  /**
   * Hyperledger Fabric chaincode identifier
   * 
   * The unique identifier of the chaincode package containing this
   * smart contract logic. Used for lifecycle management, upgrades,
   * and invocation of contract methods on the blockchain network.
   * 
   * @type {string}
   * @format Alphanumeric with hyphens and underscores
   * @pattern ^[a-zA-Z0-9-_]+$
   * @required
   * @example "payment-chaincode-v1", "kyc-verification-cc", "compliance-automation-chaincode"
   * @see Hyperledger Fabric Smart Contract Architecture documentation
   */
  chaincodeId: string;

  /**
   * Timestamp when the smart contract was initially created
   * 
   * ISO 8601 formatted timestamp indicating when the contract
   * metadata was first recorded in the system. Used for audit
   * trails and compliance reporting.
   * 
   * @type {Date}
   * @format ISO 8601 datetime
   * @required
   * @readonly Set automatically upon creation
   * @example new Date("2024-01-15T10:30:00.000Z")
   */
  createdAt: Date;

  /**
   * Timestamp when the smart contract was last updated
   * 
   * ISO 8601 formatted timestamp indicating the most recent
   * modification to the contract metadata or deployment status.
   * Automatically updated on any changes to the contract record.
   * 
   * @type {Date}
   * @format ISO 8601 datetime
   * @required
   * @automatic Updated automatically on record modification
   * @example new Date("2024-03-20T14:45:30.000Z")
   */
  updatedAt: Date;
}

/**
 * Type guard function to validate ISmartContract objects
 * 
 * Provides runtime type checking to ensure objects conform to the
 * ISmartContract interface structure and validation rules.
 * 
 * @param obj - Object to validate
 * @returns {boolean} True if object is valid ISmartContract
 * @example
 * if (isValidSmartContract(contractData)) {
 *   // Safe to use as ISmartContract
 *   console.log(contractData.name);
 * }
 */
export function isValidSmartContract(obj: any): obj is ISmartContract {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.channel === 'string' &&
    typeof obj.chaincodeId === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    obj.id.length > 0 &&
    obj.name.length > 0 &&
    obj.version.match(/^\d+\.\d+\.\d+/) &&
    obj.channel.match(/^[a-z0-9-]+$/) &&
    obj.chaincodeId.match(/^[a-zA-Z0-9-_]+$/)
  );
}

/**
 * Enumeration of supported smart contract types
 * 
 * Defines the categories of smart contracts supported by the
 * financial services platform, aligning with the Hyperledger
 * Fabric Smart Contract Architecture specifications.
 */
export enum SmartContractType {
  /**
   * Payment processing contracts with multi-signature approval
   */
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  
  /**
   * Identity management and KYC/AML verification contracts
   */
  IDENTITY_MANAGEMENT = 'IDENTITY_MANAGEMENT',
  
  /**
   * Regulatory compliance automation contracts
   */
  COMPLIANCE_AUTOMATION = 'COMPLIANCE_AUTOMATION',
  
  /**
   * Digital asset tokenization and transfer contracts
   */
  ASSET_TOKENIZATION = 'ASSET_TOKENIZATION'
}

/**
 * Extended interface for smart contract deployment metadata
 * 
 * Additional properties for tracking deployment status and
 * operational metrics of smart contracts on the blockchain network.
 */
export interface ISmartContractDeployment extends ISmartContract {
  /**
   * Current deployment status of the smart contract
   */
  status: 'DEPLOYED' | 'PENDING' | 'FAILED' | 'UPGRADING' | 'DEPRECATED';
  
  /**
   * Type category of the smart contract
   */
  contractType: SmartContractType;
  
  /**
   * Network endpoint information for contract interaction
   */
  networkEndpoint?: string;
  
  /**
   * Gas/transaction fee estimates for contract operations
   */
  estimatedGasLimit?: number;
  
  /**
   * List of organizations with access to this contract
   */
  authorizedOrganizations?: string[];
}

// Re-export the main interface as default export
export default ISmartContract;

/**
 * Export all public types and interfaces for external consumption
 * This enables comprehensive smart contract management across the
 * blockchain service ecosystem while maintaining type safety.
 */
export type {
  ISmartContract,
  ISmartContractDeployment
};