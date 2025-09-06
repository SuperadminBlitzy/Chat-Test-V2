/**
 * Notification Service Utilities - Main Entry Point
 * 
 * This module serves as the centralized access point for all utility functions and classes
 * used throughout the notification service. It re-exports all utilities from specialized
 * modules, providing a clean and organized interface for other parts of the application.
 * 
 * Key Features:
 * - Unified access to error handling utilities for robust financial services reliability
 * - Comprehensive helper functions for secure operations and data formatting
 * - Enterprise-grade logging capabilities with audit trail support
 * - Real-time processing utilities for event-driven notification delivery
 * - Compliance-ready logging for financial services regulatory requirements
 * 
 * Technical Alignment:
 * - Supports Real-time Processing requirements (2.3.3 Common Services)
 * - Implements Audit Logging capabilities (2.3.3 Common Services)
 * - Provides foundation for event-driven architecture
 * - Ensures enterprise-grade error handling and monitoring
 * 
 * Architecture Benefits:
 * - Single import point reduces dependency complexity
 * - Barrel export pattern enables tree-shaking optimization
 * - Maintains clean separation of concerns across utility modules
 * - Facilitates consistent usage patterns across the codebase
 * 
 * Usage Examples:
 * ```typescript
 * // Import specific utilities as needed
 * import { ApiError, generateRandomString, logger } from '@/utils';
 * 
 * // Or import everything if multiple utilities are needed
 * import * as Utils from '@/utils';
 * 
 * // Error handling in API controllers
 * throw new ApiError(400, 'Invalid notification parameters');
 * 
 * // Secure ID generation for notifications
 * const notificationId = generateNotificationId();
 * 
 * // Audit logging for compliance
 * logger.audit('notification_sent', { userId, notificationId, result: 'success' });
 * ```
 * 
 * Module Dependencies:
 * - ./errors: Custom error classes for structured error handling
 * - ./helper: Utility functions for secure operations and formatting
 * - ./logger: Enterprise logging with audit trail capabilities
 * 
 * @fileoverview Unified utilities export for notification service
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

// Re-export all error-related utilities from the errors module
// Provides: ApiError, NotFoundError, BadRequestError, NotificationError
// These classes enable structured error handling throughout the notification service,
// supporting the reliability requirements for financial services applications
export * from './errors';

// Re-export all helper utilities from the helper module
// Provides: generateRandomString, formatDate, generateNotificationId, generateTransactionReference,
//          formatAuditDate, formatCustomerDate, CHARACTER_SETS, and related TypeScript types
// These functions support secure operations, data formatting, and compliance requirements
// essential for real-time processing and audit logging in financial services
export * from './helper';

// Re-export all logging utilities from the logger module
// Provides: enhancedLogger (default export) and logger (named export)
// The logger supports enterprise-grade logging with specialized methods for:
// - Audit logging for regulatory compliance
// - Performance monitoring for real-time processing optimization
// - Security event logging for threat detection
// - Business event logging for transaction tracking
// - HTTP request/response logging for API monitoring
export * from './logger';

/**
 * Module Export Summary
 * 
 * This index file provides access to the following utility categories:
 * 
 * 1. Error Handling (from ./errors):
 *    - ApiError: Base class for HTTP-aware errors
 *    - NotFoundError: 404 resource not found errors
 *    - BadRequestError: 400 client request validation errors
 *    - NotificationError: Service-specific notification errors
 * 
 * 2. Helper Functions (from ./helper):
 *    - generateRandomString(): Cryptographically secure string generation
 *    - formatDate(): Financial services compliant date formatting
 *    - generateNotificationId(): Pre-configured notification ID generation
 *    - generateTransactionReference(): Transaction reference code generation
 *    - formatAuditDate(): ISO 8601 audit log date formatting
 *    - formatCustomerDate(): Localized customer-facing date formatting
 *    - CHARACTER_SETS: Secure character sets for various use cases
 *    - Type definitions: RandomStringOptions, DateFormatOptions
 * 
 * 3. Logging Capabilities (from ./logger):
 *    - enhancedLogger: Main logger instance with enterprise features
 *    - logger: Named export alias for the enhanced logger
 *    - Specialized logging methods:
 *      * audit(): Compliance and regulatory audit logging
 *      * performance(): System performance and timing metrics
 *      * security(): Security events and threat detection
 *      * business(): Business process and transaction logging
 *      * http(): API request/response logging
 * 
 * All utilities are designed to meet the demanding requirements of financial services
 * applications, including security, compliance, audit trails, and real-time processing
 * capabilities as specified in the technical documentation.
 */