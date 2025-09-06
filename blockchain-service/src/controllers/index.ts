/**
 * Controllers Barrel Export File - Blockchain Service
 * 
 * This file serves as a central barrel export for all controller modules within the
 * blockchain service of the Unified Financial Services Platform. It implements F-009
 * (Blockchain-based Settlement Network) and F-010 (Smart Contract Management) by
 * providing a simplified import interface for all blockchain controller classes.
 * 
 * The barrel pattern consolidates exports from multiple controller modules into a
 * single import point, improving code organization, maintainability, and developer
 * experience across the application. This approach is particularly valuable in
 * enterprise applications where consistent module access patterns are essential
 * for scalability and maintainability.
 * 
 * Key Features:
 * - Centralized export point for all blockchain service controllers
 * - Simplified import statements for consuming modules (routes, services, tests)
 * - Consistent module access patterns across the application
 * - Support for tree-shaking and optimized bundling in production builds
 * - Type-safe exports with full TypeScript support
 * - Enterprise-grade code organization following barrel export patterns
 * 
 * Exported Controllers:
 * - SettlementController: Handles blockchain-based settlement operations
 * - SmartContractController: Manages smart contract deployment and execution  
 * - TransactionController: Processes blockchain transaction management
 * 
 * Usage Examples:
 * ```typescript
 * // Single controller import
 * import { SettlementController } from './controllers';
 * 
 * // Multiple controller imports
 * import { 
 *   SettlementController, 
 *   SmartContractController,
 *   TransactionController 
 * } from './controllers';
 * 
 * // All controllers import
 * import * as Controllers from './controllers';
 * ```
 * 
 * Architecture Integration:
 * This barrel file integrates with the microservices architecture by providing
 * a clean abstraction layer for controller access. The exported controllers
 * support the Hyperledger Fabric blockchain network integration and implement
 * comprehensive security, performance, and compliance features required for
 * financial services applications.
 * 
 * Security Features:
 * - All exported controllers implement enterprise-grade authentication
 * - Comprehensive input validation and sanitization across all endpoints
 * - Detailed audit logging for regulatory compliance (SOX, PCI DSS, Basel III)
 * - Protection against injection attacks and data tampering
 * - Secure blockchain network communication and transaction processing
 * 
 * Performance Characteristics:
 * - Sub-second response times for blockchain operations
 * - Asynchronous processing for optimal resource utilization
 * - Connection pooling and resource optimization through service integration
 * - High-throughput transaction processing capabilities (10,000+ TPS)
 * - Efficient memory usage through proper module loading patterns
 * 
 * Compliance Features:
 * - Immutable audit trails for all blockchain operations
 * - Regulatory compliance validation and reporting support
 * - Financial services compliance frameworks (AML, KYC, GDPR)
 * - Automated compliance monitoring and risk assessment
 * - Cross-jurisdictional compliance support for global operations
 * 
 * @fileoverview Blockchain Service Controllers Barrel Export
 * @version 1.0.0
 * @since 2024-01-01
 * @author Unified Financial Services Platform Development Team
 * 
 * @requires ./settlement.controller - SettlementController for blockchain settlement operations
 * @requires ./smartContract.controller - SmartContractController for smart contract management
 * @requires ./transaction.controller - TransactionController for transaction processing
 * 
 * @exports SettlementController - Default export from settlement.controller.ts
 * @exports SmartContractController - Default export from smartContract.controller.ts  
 * @exports TransactionController - Default export from transaction.controller.ts
 */

// ============================================================================
// CONTROLLER IMPORTS
// ============================================================================

/**
 * SettlementController - Blockchain Settlement Operations Controller
 * 
 * Imports the SettlementController class which handles blockchain-based settlement
 * operations for the financial services platform. This controller implements
 * Feature F-009 (Blockchain-based Settlement Network) and F-012 (Settlement
 * Reconciliation Engine) with comprehensive security, performance, and compliance.
 * 
 * Key Capabilities:
 * - RESTful API endpoints for settlement creation and retrieval
 * - Integration with Hyperledger Fabric blockchain network
 * - Real-time settlement status tracking and reconciliation
 * - Multi-currency and cross-border payment settlement support
 * - Enterprise-grade error handling and audit logging
 * - Financial compliance and regulatory reporting features
 * 
 * API Endpoints Provided:
 * - GET /:id - Retrieve settlement by unique identifier
 * - POST / - Create new settlement with comprehensive validation
 * 
 * Security Features:
 * - JWT-based authentication and authorization
 * - Comprehensive input validation and sanitization  
 * - Protection against injection attacks and data tampering
 * - Detailed security audit logging for compliance monitoring
 * - Encrypted communication with blockchain network
 * 
 * @since 1.0.0
 */
import SettlementController from './settlement.controller';

/**
 * SmartContractController - Smart Contract Management Controller
 * 
 * Imports the SmartContractController class which provides enterprise-grade
 * smart contract management capabilities for the blockchain-based settlement
 * network. This controller implements Feature F-010 (Smart Contract Management)
 * with comprehensive lifecycle management, security controls, and compliance.
 * 
 * Key Capabilities:
 * - Smart contract deployment with security validation
 * - Contract function invocation with transaction processing
 * - Contract state querying with read-only operations
 * - Contract lifecycle management and version control
 * - Enterprise-grade error handling and performance monitoring
 * - Financial services compliance and audit logging
 * 
 * API Endpoints Provided:
 * - POST /deploy - Deploy new smart contracts with validation
 * - POST /invoke - Invoke smart contract functions with transactions
 * - POST /query - Query smart contract state with read operations
 * 
 * Security Features:
 * - Contract code security scanning and validation
 * - Deployment authorization and permission verification
 * - Function invocation access control and monitoring
 * - Comprehensive audit trails for regulatory compliance
 * - Protection against malicious contract execution
 * 
 * @since 1.0.0
 */
import SmartContractController from './smartContract.controller';

/**
 * TransactionController - Blockchain Transaction Management Controller
 * 
 * Imports the TransactionController class which serves as the primary interface
 * for managing blockchain transactions within the settlement network. This
 * controller implements the core transaction processing workflow supporting
 * Feature F-009 (Blockchain-based Settlement Network) with comprehensive
 * validation, monitoring, and compliance features.
 * 
 * Key Capabilities:
 * - Complete transaction lifecycle management from initiation to settlement
 * - Real-time transaction status tracking and monitoring
 * - Multi-currency transaction support with proper validation
 * - Cross-border payment processing capabilities
 * - Performance optimization with sub-second response times
 * - Enterprise-grade error handling and recovery mechanisms
 * 
 * API Endpoints Provided:
 * - GET /:id - Retrieve transaction by unique identifier
 * - GET / - Retrieve all transactions with pagination support
 * - POST / - Create new transaction with comprehensive validation
 * 
 * Security Features:
 * - JWT-based authentication and authorization for all endpoints
 * - Comprehensive input validation and sanitization
 * - Protection against injection attacks and data tampering
 * - Rate limiting and abuse prevention mechanisms
 * - Detailed security audit logging for compliance and forensics
 * 
 * Performance Features:
 * - High-throughput transaction processing (10,000+ TPS capability)
 * - Asynchronous processing for optimal resource utilization
 * - Connection pooling and resource optimization
 * - Horizontal scaling support through stateless design
 * - Circuit breaker patterns for resilient operation
 * 
 * @since 1.0.0
 */
import TransactionController from './transaction.controller';

// ============================================================================
// CONTROLLER EXPORTS
// ============================================================================

/**
 * SettlementController Export
 * 
 * Re-exports the SettlementController class for use throughout the application.
 * This controller provides blockchain-based settlement operations with comprehensive
 * security, performance, and compliance features required for financial services.
 * 
 * The controller supports the settlement reconciliation engine and cross-border
 * payment processing capabilities, implementing immutable audit trails and
 * regulatory compliance validation for SOX, PCI DSS, Basel III, and GDPR.
 * 
 * @export SettlementController
 * @class SettlementController
 * @description Enterprise blockchain settlement operations controller
 * @compliance SOX, PCI_DSS, Basel_III, AML, GDPR
 * @performance Sub-second response times, 10,000+ TPS capability
 * @security JWT authentication, input validation, audit logging
 */
export { SettlementController };

/**
 * SmartContractController Export
 * 
 * Re-exports the SmartContractController class for use throughout the application.
 * This controller provides comprehensive smart contract management capabilities
 * with enterprise-grade security controls, performance optimization, and
 * regulatory compliance features for financial services applications.
 * 
 * The controller supports the full smart contract lifecycle including deployment,
 * invocation, and querying operations with detailed audit logging and compliance
 * validation for financial industry regulations and standards.
 * 
 * @export SmartContractController  
 * @class SmartContractController
 * @description Enterprise smart contract management controller
 * @compliance SOX, PCI_DSS, ISO27001, Basel_III
 * @performance Optimized contract execution, resource management
 * @security Contract validation, access control, security scanning
 */
export { SmartContractController };

/**
 * TransactionController Export
 * 
 * Re-exports the TransactionController class for use throughout the application.
 * This controller serves as the primary interface for blockchain transaction
 * management with comprehensive validation, monitoring, and compliance features
 * required for enterprise financial services operations.
 * 
 * The controller implements the complete transaction processing workflow from
 * initiation to settlement with support for multi-currency operations, cross-border
 * payments, and regulatory compliance validation for global financial markets.
 * 
 * @export TransactionController
 * @class TransactionController  
 * @description Enterprise blockchain transaction management controller
 * @compliance SOX, PCI_DSS, ISO27001, Basel_III, GDPR, AML
 * @performance High-throughput processing, sub-second response times
 * @security Authentication, validation, audit logging, fraud detection
 */
export { TransactionController };

// ============================================================================
// DEFAULT EXPORT OBJECT
// ============================================================================

/**
 * Default Export Object - All Controllers
 * 
 * Provides a default export containing all controller classes for convenient
 * bulk imports and usage patterns. This approach supports both named imports
 * and default import patterns based on application requirements and coding
 * preferences across the development team.
 * 
 * Usage Examples:
 * ```typescript
 * // Default import usage
 * import Controllers from './controllers';
 * const settlementController = new Controllers.SettlementController();
 * 
 * // Named import usage (recommended)
 * import { SettlementController } from './controllers';
 * const settlementController = new SettlementController();
 * ```
 * 
 * This pattern provides flexibility while maintaining consistency with
 * enterprise development standards and TypeScript best practices for
 * large-scale financial services applications.
 * 
 * @default
 * @object Controllers
 * @property {SettlementController} SettlementController - Blockchain settlement controller
 * @property {SmartContractController} SmartContractController - Smart contract management controller  
 * @property {TransactionController} TransactionController - Transaction management controller
 */
export default {
    SettlementController,
    SmartContractController,
    TransactionController
};