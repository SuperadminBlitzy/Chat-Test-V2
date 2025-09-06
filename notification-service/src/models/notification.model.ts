/**
 * Notification Model for Financial Services Platform
 * 
 * This model defines the core data structures for the notification service within
 * the financial platform's microservices architecture. It supports critical
 * business functions including real-time transaction monitoring, regulatory
 * compliance automation, and digital customer onboarding.
 * 
 * Key Features:
 * - Type-safe notification channels (EMAIL, SMS, PUSH)
 * - Comprehensive notification status tracking
 * - Template-based messaging with dynamic data
 * - Audit trail support for regulatory compliance
 * - Real-time notification delivery tracking
 * 
 * Functional Requirements Addressed:
 * - F-008: Real-time Transaction Monitoring - Enables immediate alert delivery
 * - F-003: Regulatory Compliance Automation - Supports compliance notifications
 * - F-004: Digital Customer Onboarding - Facilitates onboarding communications
 * 
 * @fileoverview Core notification data model and interfaces
 * @version 1.0.0
 * @author Financial Platform Engineering Team
 * @since 2025-01-01
 */

/**
 * Enumeration of available notification delivery channels.
 * 
 * Supports multi-channel communication strategy required for:
 * - Critical transaction alerts (EMAIL + SMS for redundancy)
 * - Regulatory notifications (EMAIL for audit trail)
 * - Real-time updates (PUSH for immediate delivery)
 * - Customer onboarding communications (EMAIL for documentation)
 * 
 * Each channel has specific use cases within the financial services context:
 * - EMAIL: Formal communications, audit trails, detailed information
 * - SMS: Time-sensitive alerts, two-factor authentication codes
 * - PUSH: Real-time updates, in-app notifications, instant alerts
 */
export enum NotificationChannel {
  /**
   * Email delivery channel
   * - Primary use: Formal communications, compliance notifications
   * - Delivery method: SMTP protocol via enterprise email gateway
   * - Audit requirement: Full email trail maintained for regulatory compliance
   * - Performance target: <5 seconds delivery time for critical notifications
   */
  EMAIL = 'EMAIL',

  /**
   * SMS delivery channel
   * - Primary use: Time-sensitive alerts, authentication codes
   * - Delivery method: SMS gateway integration (Twilio/AWS SNS)
   * - Compliance: Opt-in required, rate limiting enforced
   * - Performance target: <3 seconds delivery time for critical alerts
   */
  SMS = 'SMS',

  /**
   * Push notification channel
   * - Primary use: Real-time app notifications, instant alerts
   * - Delivery method: Mobile push notification services (FCM/APNS)
   * - Features: Rich content support, action buttons, deep linking
   * - Performance target: <1 second delivery time for real-time updates
   */
  PUSH = 'PUSH'
}

/**
 * Enumeration of notification delivery and processing statuses.
 * 
 * Provides comprehensive state tracking for notification lifecycle management,
 * supporting audit requirements and delivery guarantees essential for
 * financial services operations.
 * 
 * Status progression typically follows:
 * PENDING → SENT → READ (success path)
 * PENDING → FAILED (error path with retry mechanisms)
 */
export enum NotificationStatus {
  /**
   * Notification created and queued for delivery
   * - Initial state when notification is first created
   * - Indicates message is in processing queue
   * - Triggers: Template processing, recipient validation
   * - Next states: SENT (success) or FAILED (error)
   */
  PENDING = 'PENDING',

  /**
   * Notification successfully delivered to target channel
   * - Confirms successful delivery to email/SMS/push service
   * - Does not guarantee recipient has read the message
   * - Audit log: Delivery timestamp and channel confirmation recorded
   * - Next state: READ (when recipient engagement detected)
   */
  SENT = 'SENT',

  /**
   * Notification delivery failed
   * - Indicates delivery failure to target channel
   * - Triggers: Invalid recipient, service unavailable, quota exceeded
   * - Action: Automatic retry logic based on failure type
   * - Audit requirement: Failure reason and retry attempts logged
   */
  FAILED = 'FAILED',

  /**
   * Notification confirmed as read by recipient
   * - Terminal state indicating successful delivery and engagement
   * - Detection methods: Email opens, SMS delivery receipts, push interactions
   * - Compliance: Read receipts support regulatory notification requirements
   * - Audit value: Confirms customer acknowledgment of important notices
   */
  READ = 'READ'
}

/**
 * Core notification interface defining the structure for all notification objects
 * within the financial services platform.
 * 
 * This interface supports the complete notification lifecycle from creation
 * through delivery and tracking, with built-in support for templating,
 * audit trails, and regulatory compliance requirements.
 * 
 * Design Principles:
 * - Immutable notification records for audit integrity
 * - Template-based messaging for consistency and localization
 * - Comprehensive metadata for debugging and compliance
 * - Type safety for reliable financial services operations
 */
export interface Notification {
  /**
   * Unique notification identifier
   * - Format: UUID v4 for global uniqueness across distributed systems
   * - Usage: Primary key, correlation ID for tracking and debugging
   * - Audit requirement: Immutable identifier for regulatory traceability
   * - Example: "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * Target user identifier for notification recipient
   * - Format: Internal user ID from customer management system
   * - Usage: Links notification to specific customer/advisor account
   * - Privacy: Supports GDPR data subject identification
   * - Security: Used for access control and data segregation
   */
  userId: string;

  /**
   * Delivery channel for the notification
   * - Values: One of NotificationChannel enum values
   * - Logic: Determines delivery mechanism and service integration
   * - Fallback: Critical notifications may specify multiple channels
   * - Compliance: Channel selection logged for audit requirements
   */
  channel: NotificationChannel;

  /**
   * Recipient address/identifier for the selected channel
   * - EMAIL channel: Valid email address (RFC 5322 compliant)
   * - SMS channel: E.164 formatted phone number (+1234567890)
   * - PUSH channel: Device token or user identifier for push service
   * - Validation: Format validated before notification processing
   * - Privacy: PII data, encrypted at rest and in transit
   */
  recipient: string;

  /**
   * Subject line or title for the notification
   * - EMAIL: Standard email subject line (max 100 characters)
   * - SMS: Not used (SMS messages don't have subjects)
   * - PUSH: Notification title displayed in system tray/notification center
   * - Localization: Supports multiple languages based on user preferences
   * - Template: Can be dynamically generated from template data
   */
  subject: string;

  /**
   * Main notification message content
   * - Format: Plain text or HTML (for email), plain text (for SMS/push)
   * - Length limits: SMS (160 chars), Push (varies by platform), Email (no limit)
   * - Security: Content sanitized to prevent injection attacks
   * - Template: Dynamically generated using templateId and templateData
   * - Compliance: Message content logged for regulatory audit requirements
   */
  message: string;

  /**
   * Current processing and delivery status
   * - Values: One of NotificationStatus enum values
   * - Lifecycle: Tracks notification from creation through final delivery
   * - Automation: Status updates trigger workflow events and retry logic
   * - Monitoring: Status changes generate metrics for service health monitoring
   */
  status: NotificationStatus;

  /**
   * Notification creation timestamp
   * - Format: ISO 8601 timestamp with timezone (UTC)
   * - Usage: Audit trail, performance monitoring, retention policies
   * - Immutable: Set once at notification creation, never modified
   * - Compliance: Required for regulatory reporting and audit logs
   */
  createdAt: Date;

  /**
   * Actual delivery timestamp to target channel
   * - Format: ISO 8601 timestamp with timezone (UTC)
   * - Null value: When status is PENDING or FAILED
   * - Set when: Status transitions to SENT
   * - SLA monitoring: Used to calculate delivery time metrics
   * - Compliance: Required for proving timely delivery of regulatory notices
   */
  sentAt: Date;

  /**
   * Template identifier for message generation
   * - Purpose: References pre-defined message templates for consistency
   * - Benefits: Supports A/B testing, localization, brand compliance
   * - Security: Template IDs validated against approved template registry
   * - Maintenance: Enables centralized message management and updates
   * - Examples: "transaction_alert", "kyc_reminder", "compliance_notice"
   */
  templateId: string;

  /**
   * Dynamic data for template variable substitution
   * - Type: Key-value pairs supporting any JSON-serializable data
   * - Usage: Personalizes templates with customer-specific information
   * - Security: Data sanitized before template processing to prevent injection
   * - Privacy: May contain PII, encrypted at rest according to data classification
   * - Examples: { customerName: "John Doe", transactionAmount: "$1,000.00", dueDate: "2025-01-15" }
   * 
   * Common template variables by notification type:
   * - Transaction alerts: amount, merchant, timestamp, account
   * - Compliance notices: regulation, deadline, required_action, contact_info
   * - Onboarding updates: step_name, progress_percentage, next_steps, documents_needed
   */
  templateData: Record<string, any>;
}

/**
 * Type guard function to validate NotificationChannel enum values
 * 
 * @param value - The value to check
 * @returns True if value is a valid NotificationChannel
 */
export function isValidNotificationChannel(value: string): value is NotificationChannel {
  return Object.values(NotificationChannel).includes(value as NotificationChannel);
}

/**
 * Type guard function to validate NotificationStatus enum values
 * 
 * @param value - The value to check
 * @returns True if value is a valid NotificationStatus
 */
export function isValidNotificationStatus(value: string): value is NotificationStatus {
  return Object.values(NotificationStatus).includes(value as NotificationStatus);
}

/**
 * Utility type for creating new notifications with required fields only
 * Omits system-generated fields that should not be set manually
 */
export type CreateNotificationInput = Omit<Notification, 'id' | 'status' | 'createdAt' | 'sentAt'> & {
  /**
   * Optional status override for testing scenarios
   * Defaults to PENDING in production implementations
   */
  status?: NotificationStatus;
};

/**
 * Utility type for notification updates
 * Only allows modification of mutable fields
 */
export type UpdateNotificationInput = Partial<Pick<Notification, 'status' | 'sentAt'>>;

/**
 * Notification query interface for filtering and searching
 * Supports common query patterns needed by notification service operations
 */
export interface NotificationQueryOptions {
  /** Filter by user ID */
  userId?: string;
  /** Filter by notification channel */
  channel?: NotificationChannel;
  /** Filter by notification status */
  status?: NotificationStatus;
  /** Filter by template ID */
  templateId?: string;
  /** Date range filter - start date */
  createdAfter?: Date;
  /** Date range filter - end date */
  createdBefore?: Date;
  /** Result pagination - page size */
  limit?: number;
  /** Result pagination - page offset */
  offset?: number;
  /** Sort order for results */
  sortBy?: 'createdAt' | 'sentAt';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Notification statistics interface for monitoring and reporting
 * Provides aggregated metrics for service health and business intelligence
 */
export interface NotificationStats {
  /** Total notifications processed in time period */
  totalCount: number;
  /** Count by delivery channel */
  byChannel: Record<NotificationChannel, number>;
  /** Count by status */
  byStatus: Record<NotificationStatus, number>;
  /** Average delivery time in milliseconds */
  averageDeliveryTime: number;
  /** Success rate percentage (SENT + READ / total) */
  successRate: number;
  /** Time period for these statistics */
  periodStart: Date;
  periodEnd: Date;
}