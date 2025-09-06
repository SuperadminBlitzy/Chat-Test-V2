/**
 * Middlewares Barrel Export File
 * 
 * This file serves as a central export point for all middleware modules within
 * the blockchain service. It implements the barrel pattern to simplify imports
 * and provide a clean API surface for consuming modules.
 * 
 * This barrel file exports all middleware functions and types from:
 * - Authentication middleware for JWT-based security
 * - Error handling middleware for standardized error responses
 * - Validation middleware for request data validation
 * 
 * Usage:
 * ```typescript
 * // Import specific middleware
 * import { authMiddleware, errorMiddleware } from './middlewares';
 * 
 * // Import validation functions
 * import { validateCreateTransaction, handleValidationErrors } from './middlewares';
 * 
 * // Import types
 * import { RequestWithUser } from './middlewares';
 * ```
 * 
 * Enterprise Benefits:
 * - Centralized middleware management
 * - Simplified import statements
 * - Consistent module structure
 * - Easy maintenance and refactoring
 * - Clear dependency management
 * 
 * Financial Services Compliance:
 * - All middleware includes comprehensive audit logging
 * - Security middleware implements financial industry standards
 * - Error handling provides compliance-ready error tracking
 * - Validation middleware ensures data integrity for financial transactions
 */

// Re-export all authentication middleware exports
// Includes: authMiddleware, RequestWithUser, isAuthenticatedRequest, extractUserRoles, hasRequiredPermissions
export * from './auth.middleware';

// Re-export all error handling middleware exports
// Includes: errorMiddleware
export * from './error.middleware';

// Re-export all validation middleware exports
// Includes: validateCreateTransaction, validateCreateSettlement, validateInvokeSmartContract, handleValidationErrors
export * from './validation.middleware';