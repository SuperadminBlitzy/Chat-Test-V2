/**
 * Notification Service Models - Barrel Export File
 * 
 * This file serves as a centralized export point for all data models used in the
 * notification service, supporting the Unified Data Integration Platform (F-001)
 * requirements within the financial services microservices architecture.
 * 
 * The notification service is a critical component that enables:
 * - Real-time Transaction Monitoring (F-008) - Instant alert delivery
 * - Regulatory Compliance Automation (F-003) - Compliance notifications
 * - Digital Customer Onboarding (F-004) - Onboarding communications
 * 
 * Architecture Benefits:
 * - Centralized model exports for clean dependency management
 * - Type safety across notification service operations
 * - Consistent data structures for event-driven notifications
 * - Support for multi-channel notification delivery (EMAIL, SMS, PUSH)
 * 
 * Usage:
 * ```typescript
 * // Import all notification models from single source
 * import { 
 *   Notification, 
 *   NotificationChannel, 
 *   Template, 
 *   NotificationType 
 * } from './models';
 * ```
 * 
 * @fileoverview Barrel file for notification service data models
 * @version 1.0.0
 * @author Financial Platform Engineering Team
 * @since 2025-01-01
 */

// ============================================================================
// NOTIFICATION MODELS - Core notification data structures and enums
// ============================================================================

/**
 * Re-export all notification model components
 * 
 * Includes:
 * - NotificationChannel enum: EMAIL, SMS, PUSH delivery channels
 * - NotificationStatus enum: PENDING, SENT, FAILED, READ statuses
 * - Notification interface: Core notification data structure
 * - Type guards: Runtime validation functions
 * - Utility types: Input/output type definitions
 * - Query interfaces: Filtering and search capabilities
 * - Statistics interfaces: Monitoring and reporting data
 */
export * from './notification.model';

// ============================================================================
// TEMPLATE MODELS - Template management and validation structures
// ============================================================================

/**
 * Re-export all template model components
 * 
 * Includes:
 * - NotificationType enum: Template type definitions
 * - Template interface: Template data structure
 * - Validation interfaces: Template validation results
 * - Input types: Template creation and update structures
 * - Query interfaces: Template filtering and search
 * - Statistics interfaces: Template usage analytics
 * - Type guards: Runtime type validation
 * - Default export: Backward compatibility support
 */
export * from './template.model';