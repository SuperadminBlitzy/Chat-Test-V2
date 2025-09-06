/**
 * Unified Financial Services Platform - Hyperledger Fabric Chaincode Entry Point
 * 
 * This file serves as the main entry point for the UFS blockchain-based settlement network
 * chaincode package. It exports all smart contracts that will be deployed and managed on
 * the Hyperledger Fabric network, enabling secure, transparent, and immutable transaction
 * processing for the unified financial services platform.
 * 
 * Architecture Overview:
 * - Hyperledger Fabric v2.5+ compatibility with modular contract architecture
 * - Multi-contract chaincode supporting specialized financial operations
 * - Atomic settlement operations with multi-party consensus validation
 * - Comprehensive audit trails for regulatory compliance
 * - Real-time settlement status tracking and monitoring
 * 
 * Key Features:
 * - F-009: Blockchain-based Settlement Network implementation
 * - F-010: Smart Contract Management and deployment coordination
 * - Immutable transaction records with cryptographic verification
 * - Multi-currency settlement support with exchange rate handling
 * - Cross-border payment processing with transparent settlement
 * 
 * Smart Contract Components:
 * - SmartContract: Core transaction and settlement management functions
 * - SettlementContract: Specialized settlement lifecycle management
 * - TransactionContract: Transaction-specific operations and validations
 * 
 * Regulatory Compliance:
 * - SOX, IFRS, and GDPR compliance through immutable blockchain records
 * - Basel III/IV settlement risk management implementation
 * - Real-time regulatory reporting capabilities
 * - Complete audit trail maintenance for financial oversight
 * - AML transaction monitoring and sanctions screening integration
 * 
 * Technical Implementation:
 * - Built on Hyperledger Fabric v2.5+ framework for enterprise-grade performance
 * - Supports ISO20022 and SWIFT messaging standards through structured data
 * - Implements atomic settlement design patterns eliminating settlement risk
 * - Provides high-performance settlement processing with sub-second latency
 * - Enables multi-party consensus validation through distributed ledger technology
 * 
 * Deployment Architecture:
 * - Container-based deployment through Kubernetes orchestration
 * - Multi-organization network support with permissioned access
 * - Scalable peer network configuration supporting high transaction volumes
 * - Integrated monitoring and alerting for operational excellence
 * 
 * Security Features:
 * - Cryptographic transaction signing and verification
 * - Role-based access control (RBAC) for contract function execution
 * - Hardware Security Module (HSM) integration for key management
 * - Zero-trust architecture implementation with identity verification
 * 
 * Performance Specifications:
 * - Target throughput: 10,000+ transactions per second
 * - Settlement finality: Sub-second transaction confirmation
 * - High availability: 99.99% uptime SLA with disaster recovery
 * - Scalability: Horizontal scaling across multiple peer nodes
 * 
 * @version 1.0.0
 * @author UFS Blockchain Development Team
 * @license Proprietary - All Rights Reserved
 * @since 2024-01-01
 */

// fabric-contract-api v2.5.0 - Hyperledger Fabric smart contract framework providing
// core blockchain functionality including transaction context, contract base classes,
// and chaincode lifecycle management capabilities
import { Contract } from 'fabric-contract-api';

// Internal smart contract imports for multi-contract chaincode architecture
// These contracts implement the core business logic for the UFS settlement network

/**
 * SettlementContract - Blockchain-based Settlement Network Implementation
 * 
 * Imported from the settlement module, this contract provides comprehensive
 * settlement lifecycle management with atomic transaction guarantees, multi-party
 * consensus validation, and regulatory compliance features for the UFS platform.
 * 
 * Key Capabilities:
 * - Creates and manages settlement batches with complete validation
 * - Provides real-time settlement status tracking and updates
 * - Implements immutable audit trails for regulatory compliance
 * - Supports multi-currency settlement with exchange rate handling
 * - Enables cross-border payment processing with transparent settlement
 */
import { SettlementContract } from './settlement';

/**
 * SmartContract - Core Smart Contract Management Implementation
 * 
 * Imported from the smartContract module, this serves as the primary contract
 * providing foundational transaction management, ledger initialization, and
 * core blockchain operations for the UFS settlement network.
 * 
 * Primary Functions:
 * - Transaction creation and lifecycle management
 * - Ledger initialization and bootstrap operations
 * - Settlement batch creation and management
 * - Real-time transaction status tracking and updates
 * - Event emission for external system integration
 */
import { SmartContract } from './smartContract';

/**
 * TransactionContract - Transaction-Specific Operations Management
 * 
 * Imported from the transaction module, this contract provides specialized
 * transaction processing capabilities, validation logic, and transaction-specific
 * business rules for the UFS blockchain settlement network.
 * 
 * Specialized Features:
 * - Advanced transaction validation and processing
 * - Transaction-specific business rule enforcement
 * - Integration with external payment systems and APIs
 * - Complex transaction workflow management
 * - Transaction analytics and reporting capabilities
 */
import { TransactionContract } from './transaction';

/**
 * SmartContract Export - Named Export for Primary Contract Access
 * 
 * Exports the SmartContract class as a named export to provide direct access
 * to the core contract functionality. This enables specific contract instantiation
 * and method invocation for applications requiring direct SmartContract access.
 * 
 * Usage Scenarios:
 * - Direct contract method invocation from client applications
 * - Testing and development environments requiring specific contract access
 * - Administrative tools and monitoring systems
 * - Integration with external systems requiring SmartContract functionality
 */
export { SmartContract };

/**
 * Contracts Array Export - Chaincode Deployment Configuration
 * 
 * This array contains all contract classes that will be registered and deployed
 * when the chaincode is instantiated on the Hyperledger Fabric network. The
 * Fabric runtime uses this array to discover and register all available contracts
 * within the chaincode package, enabling multi-contract functionality.
 * 
 * Contract Registration Order:
 * 1. SmartContract - Primary contract with core functionality (registered first)
 * 2. SettlementContract - Specialized settlement operations (extends SmartContract)
 * 3. TransactionContract - Transaction-specific operations and validations
 * 
 * Hyperledger Fabric Integration:
 * - Each contract in the array is automatically registered during chaincode instantiation
 * - Contract methods become available as chaincode functions for client invocation
 * - Multiple contracts enable modular architecture with separation of concerns
 * - Contract instances share the same world state and transaction context
 * 
 * Deployment Considerations:
 * - All contracts must extend the fabric-contract-api Contract base class
 * - Contract methods decorated with @Transaction() become invokable functions
 * - Read-only methods decorated with @Transaction(false) enable query operations
 * - Contract events are emitted to the blockchain event stream for monitoring
 * 
 * Runtime Behavior:
 * - Fabric runtime instantiates each contract class during chaincode startup
 * - Contract instances persist throughout the chaincode lifecycle
 * - Transaction context is passed to contract methods during invocation
 * - Contract state is maintained in the distributed ledger world state
 * 
 * Security and Access Control:
 * - Contract method access controlled through Fabric's built-in ACL mechanisms
 * - Client identity available through transaction context for authorization
 * - Transaction endorsement policies applied at the chaincode level
 * - Cryptographic validation ensures transaction integrity and authenticity
 */
export const contracts: typeof Contract[] = [
    SmartContract,      // Primary contract - core transaction and settlement management
    SettlementContract, // Settlement-specific operations with atomic guarantees
    TransactionContract // Transaction-specific processing and validation logic
];