/**
 * Central Barrel File for Blockchain Service Utilities
 * 
 * This file serves as the central export hub for all utility modules within the
 * blockchain-service utils directory. It implements the barrel pattern to provide
 * a single import point for accessing all utility functions, classes, and types
 * used throughout the blockchain-based settlement network.
 * 
 * Requirements Addressed:
 * - Inter-Service Communication Patterns (6.1.1.2): Provides common logging and
 *   error handling utilities essential for robust inter-service communication
 * - Error Handling Patterns (5.4.3): Exports comprehensive error classes and
 *   handling utilities for consistent error management across the service
 * 
 * Architecture Benefits:
 * - Centralized access to all utility modules
 * - Simplified import statements throughout the codebase
 * - Improved maintainability and discoverability of utility functions
 * - Consistent error handling and logging across the blockchain service
 * - Enhanced developer experience with single import location
 * 
 * Usage Examples:
 * ```typescript
 * // Import specific utilities
 * import { logger, ApiError, buildCCP } from '../utils';
 * 
 * // Import multiple utilities at once
 * import { 
 *   FabricError, 
 *   SettlementError, 
 *   buildWallet, 
 *   prettyJSONString,
 *   logger 
 * } from '../utils';
 * ```
 */

// Export all error classes and utilities from the errors module
// Provides comprehensive error handling capabilities for blockchain operations
// including base ApiError class, HTTP error classes, and blockchain-specific errors
export * from './errors';

// Export all helper functions and utilities from the helper module  
// Provides essential blockchain infrastructure utilities including:
// - Common Connection Profile (CCP) building for Hyperledger Fabric
// - Wallet management for cryptographic identity operations
// - JSON formatting utilities for logging and debugging
// - Validation functions and blockchain-specific constants
export * from './helper';

// Export the enhanced logger instance and related types from the logger module
// Provides enterprise-grade logging capabilities with:
// - Structured logging for production environments
// - Specialized logging methods for blockchain, audit, performance, security, and financial events
// - Compliance-ready audit trails for regulatory requirements
// - Security filtering to prevent accidental logging of sensitive data
export * from './logger';