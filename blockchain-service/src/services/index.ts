/**
 * Blockchain Services Barrel File - Enterprise Service Exports
 * 
 * This barrel file provides centralized access to all blockchain-related services
 * for the financial services settlement platform. It implements requirements F-009
 * (Blockchain-based Settlement Network) and F-010 (Smart Contract Management) by
 * exporting the core services needed for Hyperledger Fabric blockchain operations.
 * 
 * Exported Services:
 * - ChaincodeService: Smart contract interaction and transaction management
 * - FabricService: Hyperledger Fabric network connectivity and gateway management
 * - WalletService: User wallet and identity management for blockchain operations
 * 
 * Key Features:
 * - Centralized service access pattern for improved maintainability
 * - Clean import structure for consuming modules
 * - Enterprise-grade service architecture support
 * - Support for financial services blockchain settlement workflows
 * - Comprehensive service integration for multi-party transactions
 * 
 * Usage Examples:
 * - import { ChaincodeService, FabricService, WalletService } from './services';
 * - import { ChaincodeService } from './services';
 * 
 * Security Features:
 * - All exported services implement comprehensive audit logging
 * - Services include enterprise security controls and input validation
 * - Support for regulatory compliance requirements (SOX, PCI DSS, Basel III)
 * - Secure identity and wallet management capabilities
 * 
 * Performance Optimizations:
 * - Services implement caching and connection pooling where appropriate
 * - Asynchronous operations with proper resource management
 * - Performance monitoring and metrics collection capabilities
 * 
 * Compliance Features:
 * - Financial services regulatory compliance support
 * - Immutable audit trails for all blockchain operations
 * - Data classification and retention policy enforcement
 * - Automated compliance validation and reporting capabilities
 * 
 * Architecture Support:
 * - Microservices architecture compatibility
 * - Dependency injection pattern support through NestJS integration
 * - Event-driven architecture support for blockchain events
 * - Multi-channel and multi-contract blockchain operations
 */

// Import blockchain service implementations for re-export
import ChaincodeService from './chaincode.service'; // Default export - Smart contract interaction service
import FabricService from './fabric.service'; // Default export - Hyperledger Fabric network service  
import WalletService from './wallet.service'; // Default export - Blockchain wallet management service

/**
 * ChaincodeService Export
 * 
 * Provides comprehensive smart contract interaction capabilities for the
 * Hyperledger Fabric blockchain network. This service implements F-010
 * (Smart Contract Management) requirements with enterprise-grade security,
 * performance optimization, and regulatory compliance features.
 * 
 * Key Capabilities:
 * - Smart contract function execution and transaction submission
 * - Read-only query evaluation with performance optimization
 * - Comprehensive input validation and sanitization
 * - Financial transaction audit logging and compliance tracking
 * - Multi-party transaction coordination and validation
 * - Settlement network transaction processing
 * 
 * Security Features:
 * - Input parameter validation against injection attacks
 * - Comprehensive audit logging for regulatory compliance
 * - Error handling that prevents information disclosure
 * - User context validation for all operations
 * - Transaction integrity verification and validation
 * 
 * Performance Features:
 * - Contract instance caching for improved throughput
 * - Asynchronous operations with proper resource management
 * - Performance monitoring and metrics collection
 * - Graceful error handling and retry mechanisms
 * - Connection pooling through FabricService integration
 * 
 * Compliance Support:
 * - SOX compliance with immutable transaction records
 * - PCI DSS compliance for payment transaction security
 * - Basel III compliance for risk management and reporting
 * - GDPR compliance for data protection and privacy
 * - AML/KYC compliance for financial crime prevention
 */
export { ChaincodeService };

/**
 * FabricService Export
 * 
 * Provides comprehensive Hyperledger Fabric network connectivity and gateway
 * management capabilities. This service implements F-009 (Blockchain-based
 * Settlement Network) requirements with enterprise-grade security, performance
 * optimization, and compliance features for financial services operations.
 * 
 * Key Capabilities:
 * - Secure gateway connection management with user identity validation
 * - Smart contract lifecycle management and interaction
 * - Transaction submission with comprehensive error handling
 * - Query evaluation with performance optimization and caching
 * - Multi-channel and multi-contract support for complex business scenarios
 * - Automatic connection recovery and health monitoring
 * 
 * Security Features:
 * - User identity validation and authentication
 * - Secure credential management through wallet service integration
 * - Comprehensive audit logging for regulatory compliance
 * - Input sanitization and validation for all operations
 * - Connection state management with automatic cleanup
 * - Zero-trust security model implementation
 * 
 * Performance Features:
 * - Connection pooling and reuse for improved throughput
 * - Intelligent caching of network configurations and contracts
 * - Asynchronous operations with proper resource management
 * - Performance monitoring and metrics collection
 * - Graceful degradation and circuit breaker patterns
 * 
 * Compliance Support:
 * - SOX, PCI DSS, and GDPR compliance through audit logging
 * - Immutable transaction trails for regulatory reporting
 * - Data classification and retention policy enforcement
 * - Automated compliance validation and reporting
 */
export { FabricService };

/**
 * WalletService Export
 * 
 * Provides comprehensive wallet and identity management capabilities for users
 * participating in the Hyperledger Fabric blockchain network. This service
 * supports both F-009 (Blockchain-based Settlement Network) and F-010 
 * (Smart Contract Management) requirements by managing user credentials
 * and identities required for blockchain operations.
 * 
 * Key Capabilities:
 * - File system-based wallet management using Hyperledger Fabric SDK
 * - Secure wallet identity verification and validation
 * - User wallet creation, retrieval, and existence checking
 * - Performance-optimized wallet operations with intelligent caching
 * - Enterprise-grade error handling and audit logging
 * - Support for multiple identity types and authentication methods
 * 
 * Security Features:
 * - Secure path resolution preventing directory traversal attacks
 * - Identity validation ensuring only authorized wallet access
 * - Input validation and sanitization for user identifiers
 * - Comprehensive security logging for compliance requirements
 * - Error handling that prevents information disclosure attacks
 * - TTL-based cache invalidation for security and performance
 * 
 * Performance Features:
 * - Intelligent wallet instance caching with TTL management
 * - Reduced file system operations through optimized caching
 * - Asynchronous operations with proper resource management
 * - Performance monitoring and metrics collection
 * - Efficient wallet existence checking without exceptions
 * 
 * Compliance Support:
 * - SOX, PCI DSS, and GDPR compliance through audit logging
 * - User privacy protection and data classification
 * - Secure credential management and storage
 * - Regulatory compliance validation and reporting
 * - Audit trails for all wallet operations and access attempts
 */
export { WalletService };

/**
 * Barrel Export Summary
 * 
 * This barrel file exports three core blockchain services that work together
 * to provide comprehensive Hyperledger Fabric blockchain functionality:
 * 
 * Service Integration:
 * - ChaincodeService uses FabricService for network connectivity
 * - FabricService uses WalletService for user identity management
 * - All services implement consistent logging and error handling patterns
 * 
 * Architecture Benefits:
 * - Centralized service access reduces coupling between modules
 * - Clean separation of concerns between different blockchain aspects
 * - Consistent interface patterns across all blockchain operations
 * - Enhanced testability through service isolation
 * 
 * Enterprise Features:
 * - Comprehensive audit logging across all services
 * - Performance monitoring and metrics collection
 * - Security controls and input validation
 * - Regulatory compliance support (SOX, PCI DSS, Basel III, GDPR)
 * - Multi-tenant support through user identity management
 * 
 * Financial Services Support:
 * - Settlement network transaction processing
 * - Cross-border payment processing capabilities
 * - Smart contract management for financial instruments
 * - Regulatory compliance automation and reporting
 * - Risk assessment and monitoring integration
 */