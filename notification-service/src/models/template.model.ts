/**
 * Notification Template Model
 * 
 * This module defines the data models for notification templates used in the real-time
 * notification processing system. The templates support dynamic content generation
 * across multiple notification channels (EMAIL, SMS, PUSH) as part of the event-driven
 * microservices architecture.
 * 
 * Technical Context:
 * - Part of the Real-time Processing infrastructure using Kafka streams
 * - Supports event-driven architecture for financial services
 * - Implements enterprise-grade data validation and type safety
 * - Complies with TypeScript 5.3+ standards for production environments
 * 
 * @fileoverview Notification template data models for real-time processing
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

/**
 * Enumeration of supported notification types
 * 
 * Defines the available notification channels for the financial services platform.
 * Each type corresponds to a specific delivery mechanism with its own processing
 * pipeline and validation rules.
 * 
 * @enum {string}
 * @readonly
 */
export enum NotificationType {
  /**
   * Email notifications for detailed communications
   * - Supports HTML and plain text formatting
   * - Used for statements, confirmations, and detailed reports
   * - Requires subject and body content
   */
  EMAIL = 'EMAIL',

  /**
   * SMS notifications for urgent, time-sensitive communications
   * - Limited to 160 characters for standard SMS
   * - Used for OTP, alerts, and critical notifications
   * - Body content only (no subject)
   */
  SMS = 'SMS',

  /**
   * Push notifications for mobile applications
   * - Supports rich media and action buttons
   * - Used for real-time alerts and engagement
   * - Requires both subject (title) and body content
   */
  PUSH = 'PUSH'
}

/**
 * Core template interface for notification templates
 * 
 * Defines the standardized structure for notification templates stored in the database.
 * Templates serve as reusable content blueprints that support dynamic variable substitution
 * for personalized notifications across all supported channels.
 * 
 * Template Lifecycle:
 * 1. Creation: Templates are created with initial content and metadata
 * 2. Validation: Content is validated against channel-specific rules
 * 3. Processing: Dynamic variables are replaced with actual values
 * 4. Delivery: Formatted content is sent through appropriate channels
 * 
 * @interface Template
 * @export
 */
export interface Template {
  /**
   * Unique identifier for the template
   * 
   * - Format: UUID v4 string
   * - Immutable once assigned
   * - Used for template referencing and caching
   * - Primary key in database storage
   * 
   * @type {string}
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  readonly id: string;

  /**
   * Human-readable template name
   * 
   * - Unique within the system
   * - Used for template identification and management
   * - Supports alphanumeric characters, spaces, hyphens, and underscores
   * - Maximum length: 100 characters
   * 
   * @type {string}
   * @example "Account Statement Notification"
   */
  name: string;

  /**
   * Template subject/title content
   * 
   * - Required for EMAIL and PUSH notifications
   * - Optional for SMS notifications (typically unused)
   * - Supports template variables for dynamic content
   * - Maximum length: 200 characters
   * 
   * Template Variables:
   * - {{customerName}} - Customer's full name
   * - {{accountNumber}} - Account number (masked)
   * - {{amount}} - Transaction amount
   * - {{date}} - Formatted date
   * - {{time}} - Formatted time
   * 
   * @type {string}
   * @example "Your {{accountType}} statement is ready, {{customerName}}"
   */
  subject: string;

  /**
   * Template body content
   * 
   * - Main content of the notification
   * - Supports template variables for personalization
   * - Format varies by notification type:
   *   - EMAIL: Supports HTML and plain text
   *   - SMS: Plain text only, 160 character limit
   *   - PUSH: Plain text with optional rich media references
   * 
   * Content Guidelines:
   * - Use clear, concise language
   * - Include relevant call-to-action when applicable
   * - Comply with financial services communication standards
   * - Support multi-language content through variable substitution
   * 
   * @type {string}
   * @example "Dear {{customerName}}, your monthly statement for account {{accountNumber}} is now available. Please log in to view your transactions and account summary."
   */
  body: string;

  /**
   * Notification channel type
   * 
   * - Determines the delivery mechanism and processing pipeline
   * - Affects content validation and formatting rules
   * - Used for routing to appropriate service handlers
   * - Immutable once template is created
   * 
   * @type {NotificationType}
   * @see {@link NotificationType}
   */
  readonly type: NotificationType;

  /**
   * Template creation timestamp
   * 
   * - Automatically set when template is first created
   * - Immutable after initial creation
   * - Used for audit trails and version tracking
   * - Stored in UTC timezone
   * 
   * @type {Date}
   * @readonly
   */
  readonly createdAt: Date;

  /**
   * Template last modification timestamp
   * 
   * - Automatically updated when template content is modified
   * - Used for cache invalidation and version control
   * - Stored in UTC timezone
   * - Triggers template re-validation on update
   * 
   * @type {Date}
   */
  updatedAt: Date;
}

/**
 * Type guard to check if a value is a valid NotificationType
 * 
 * Provides runtime type checking for notification type validation.
 * Used in API endpoints and data processing pipelines to ensure
 * type safety when dealing with external data sources.
 * 
 * @param value - The value to check
 * @returns {value is NotificationType} True if value is a valid NotificationType
 * 
 * @example
 * ```typescript
 * const userInput = 'EMAIL';
 * if (isValidNotificationType(userInput)) {
 *   // userInput is now typed as NotificationType
 *   console.log(`Valid notification type: ${userInput}`);
 * }
 * ```
 */
export function isValidNotificationType(value: string): value is NotificationType {
  return Object.values(NotificationType).includes(value as NotificationType);
}

/**
 * Template validation interface
 * 
 * Defines the structure for template validation results.
 * Used by validation services to return comprehensive
 * feedback about template content and compliance.
 * 
 * @interface TemplateValidationResult
 * @export
 */
export interface TemplateValidationResult {
  /**
   * Whether the template passes all validation checks
   * @type {boolean}
   */
  isValid: boolean;

  /**
   * Array of validation error messages
   * @type {string[]}
   */
  errors: string[];

  /**
   * Array of validation warning messages
   * @type {string[]}
   */
  warnings: string[];

  /**
   * Detected template variables in the content
   * @type {string[]}
   */
  variables: string[];
}

/**
 * Template creation input interface
 * 
 * Defines the required data structure for creating new templates.
 * Excludes system-generated fields like id, createdAt, and updatedAt.
 * 
 * @interface CreateTemplateInput
 * @export
 */
export interface CreateTemplateInput {
  /**
   * Template name
   * @type {string}
   */
  name: string;

  /**
   * Template subject/title
   * @type {string}
   */
  subject: string;

  /**
   * Template body content
   * @type {string}
   */
  body: string;

  /**
   * Notification type
   * @type {NotificationType}
   */
  type: NotificationType;
}

/**
 * Template update input interface
 * 
 * Defines the structure for updating existing templates.
 * All fields are optional to support partial updates.
 * 
 * @interface UpdateTemplateInput
 * @export
 */
export interface UpdateTemplateInput {
  /**
   * Template name (optional)
   * @type {string}
   * @optional
   */
  name?: string;

  /**
   * Template subject/title (optional)
   * @type {string}
   * @optional
   */
  subject?: string;

  /**
   * Template body content (optional)
   * @type {string}
   * @optional
   */
  body?: string;
}

/**
 * Template query filter interface
 * 
 * Defines the available filters for template queries.
 * Used by repository and service layers for data retrieval.
 * 
 * @interface TemplateQueryFilter
 * @export
 */
export interface TemplateQueryFilter {
  /**
   * Filter by notification type
   * @type {NotificationType}
   * @optional
   */
  type?: NotificationType;

  /**
   * Filter by template name pattern
   * @type {string}
   * @optional
   */
  namePattern?: string;

  /**
   * Filter by creation date range
   * @type {Date}
   * @optional
   */
  createdAfter?: Date;

  /**
   * Filter by creation date range
   * @type {Date}
   * @optional
   */
  createdBefore?: Date;

  /**
   * Limit number of results
   * @type {number}
   * @optional
   */
  limit?: number;

  /**
   * Offset for pagination
   * @type {number}
   * @optional
   */
  offset?: number;
}

/**
 * Template statistics interface
 * 
 * Provides aggregated statistics about template usage
 * for monitoring and analytics purposes.
 * 
 * @interface TemplateStatistics
 * @export
 */
export interface TemplateStatistics {
  /**
   * Total number of templates
   * @type {number}
   */
  totalTemplates: number;

  /**
   * Templates by notification type
   * @type {Record<NotificationType, number>}
   */
  templatesByType: Record<NotificationType, number>;

  /**
   * Most recently created template
   * @type {Date}
   * @optional
   */
  lastCreated?: Date;

  /**
   * Most recently updated template
   * @type {Date}
   * @optional
   */
  lastUpdated?: Date;
}

/**
 * Exported type definitions for external modules
 * 
 * Re-export all types for convenient importing in other modules
 * while maintaining clear module boundaries and type safety.
 */
export type {
  Template,
  TemplateValidationResult,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateQueryFilter,
  TemplateStatistics
};

/**
 * Default export for backward compatibility
 * 
 * Provides a default export containing all core types
 * for legacy import patterns while encouraging named imports.
 */
export default {
  NotificationType,
  isValidNotificationType
} as const;