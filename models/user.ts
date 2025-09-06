/**
 * User Data Models and Types for Unified Financial Services Platform
 * 
 * This module defines comprehensive user data structures, interfaces, and types
 * that support the platform's core user management requirements including:
 * - Multi-persona user support (Financial Institution Staff, End Customers, Regulatory Users)
 * - Role-based access control (RBAC) with OAuth2 integration
 * - Digital customer onboarding with KYC/AML compliance
 * - Multi-factor authentication and biometric verification
 * - Comprehensive audit trails and compliance tracking
 * - User preferences and notification management
 * 
 * Security and Compliance Features:
 * - SOC2, PCI-DSS, and GDPR compliance
 * - Financial industry regulatory compliance (Basel IV, FINRA)
 * - Secure user data handling with proper encryption
 * - Comprehensive audit logging for all user activities
 * - Data residency and retention policy compliance
 * 
 * The user models support the following key platform features:
 * - F-001: Unified Data Integration Platform (unified customer profiles)
 * - F-003: Regulatory Compliance Automation (user compliance tracking)
 * - F-004: Digital Customer Onboarding (user onboarding status management)
 * 
 * @version 1.0.0
 * @author Financial Services Platform Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV, FINRA
 * @security All user data must be encrypted at rest and in transit
 */

// Internal imports for authentication and authorization types
import { Permission, Role } from './types/auth';

// Internal imports for customer profile integration
import { Customer } from './customer';

// Internal imports for onboarding status tracking
import { OnboardingStatus } from './onboarding';

/**
 * Core User interface representing authenticated users in the financial platform.
 * 
 * This interface serves as the central user model supporting all user types within
 * the financial ecosystem including:
 * - Financial institution employees (advisors, relationship managers, analysts)
 * - End customers (retail, SME, corporate clients)
 * - Regulatory users (auditors, compliance reviewers, supervisors)
 * - System administrators and technical support staff
 * 
 * User Classification by Persona:
 * - INTERNAL_STAFF: Bank employees with internal system access
 * - EXTERNAL_CUSTOMER: End customers using customer-facing services
 * - REGULATORY_USER: External regulatory and audit personnel
 * - SYSTEM_ADMIN: Technical administrators with elevated privileges
 * 
 * Security Considerations:
 * - All user data is subject to financial data protection regulations
 * - User access patterns are monitored for suspicious activity
 * - Authentication events generate comprehensive audit logs
 * - Role assignments must comply with segregation of duties requirements
 * - Personal data handling must comply with GDPR and regional privacy laws
 * 
 * Integration Points:
 * - Links to detailed customer profile for comprehensive customer view
 * - Tracks onboarding status for new user workflows
 * - Integrates with role-based permissions for access control
 * - Supports multi-factor authentication and biometric verification
 */
export interface User {
  /** 
   * Unique user identifier (UUID v4 format for security and privacy).
   * This ID is used for all internal references, audit logging, and data correlation.
   * Must be immutable once assigned and comply with financial data privacy requirements.
   * 
   * @example "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @security Used in audit logs and must be protected from unauthorized access
   * @compliance Required for GDPR data subject identification and audit trails
   */
  id: string;

  /** 
   * User's email address serving as primary identification and communication channel.
   * Must be unique across the platform and verified during registration process.
   * Used for security notifications, transaction alerts, and regulatory communications.
   * 
   * Email validation requirements:
   * - Must be a valid email format (RFC 5322 compliant)
   * - Must be verified through email confirmation process
   * - Cannot be changed without re-verification
   * - Must comply with organizational email policies
   * 
   * @example "john.doe@financialinstitution.com"
   * @validation RFC 5322 email format validation required
   * @security Email changes must be logged and verified
   * @compliance Used for regulatory notifications and must be accurate
   */
  email: string;

  /** 
   * User's legal first name as verified during onboarding and KYC process.
   * Must match identity verification documents for regulatory compliance.
   * Used for personalization, official communications, and legal documentation.
   * 
   * Name validation requirements:
   * - Must match government-issued identification documents
   * - Cannot contain special characters except hyphens and apostrophes
   * - Must be between 1-50 characters in length
   * - Required for KYC/AML compliance verification
   * 
   * @example "John"
   * @validation Must match KYC identity documents
   * @compliance Required for customer identification program (CIP)
   * @privacy Protected under financial privacy regulations
   */
  firstName: string;

  /** 
   * User's legal last name as verified during onboarding and KYC process.
   * Must match identity verification documents for regulatory compliance.
   * Used for legal identification, official communications, and audit purposes.
   * 
   * @example "Doe"
   * @validation Must match KYC identity documents
   * @compliance Required for customer identification program (CIP)
   * @privacy Protected under financial privacy regulations
   */
  lastName: string;

  /** 
   * Array of roles assigned to the user supporting multiple role assignments.
   * Each role contains permissions that determine system access and capabilities.
   * Role assignments must comply with segregation of duties requirements.
   * 
   * Role Management Requirements:
   * - Role assignments must be approved by authorized personnel
   * - Changes to roles must be logged for audit purposes
   * - Must comply with least privilege access principles
   * - Segregation of duties must be enforced for sensitive roles
   * - Regular role reviews required for compliance
   * 
   * @example [{ id: "advisor", name: "Customer Advisor", permissions: ["customer:read", "customer:write"] }]
   * @security Role assignments are audited and monitored
   * @compliance Must comply with segregation of duties requirements
   * @audit All role changes must be logged with timestamp and approver
   */
  roles: Role[];

  /** 
   * Array of granular permissions granted to the user for fine-grained access control.
   * Permissions are strings following the format "resource:action" for consistency.
   * Direct permissions supplement role-based permissions for specific use cases.
   * 
   * Permission Format: "resource:action"
   * Examples:
   * - "customer:read" - Read access to customer data
   * - "transaction:approve" - Ability to approve transactions
   * - "compliance:audit" - Access to compliance audit trails
   * - "risk:assess" - Permission to perform risk assessments
   * 
   * @example ["customer:read", "transaction:view", "reports:generate"]
   * @security Permissions are evaluated for every system access
   * @compliance Permission grants must be documented and auditable
   * @audit Permission changes must be logged with business justification
   */
  permissions: Permission[];

  /** 
   * Boolean flag indicating whether the user account is currently active.
   * Inactive users cannot authenticate or access system resources.
   * Used for account suspension, termination, and temporary access control.
   * 
   * Account Status Management:
   * - Active accounts can authenticate and access permitted resources
   * - Inactive accounts are blocked from all system access
   * - Status changes must be logged for audit and compliance
   * - Automated processes may deactivate accounts based on business rules
   * 
   * @default true
   * @security Account status changes are monitored and logged
   * @compliance Required for access control and audit compliance
   * @audit Status changes must include reason and authorized approver
   */
  isActive: boolean;

  /** 
   * Timestamp of the user's last successful authentication to the platform.
   * Used for security monitoring, inactive account detection, and audit purposes.
   * Updated automatically upon successful login and MFA completion.
   * 
   * Security Applications:
   * - Dormant account detection and automatic deactivation
   * - Suspicious login pattern analysis
   * - Compliance reporting for user activity
   * - Password expiration policy enforcement
   * 
   * @example new Date("2024-01-15T14:30:00Z")
   * @security Used for security analytics and threat detection
   * @compliance Required for user activity audit trails
   * @privacy May be subject to data retention policies
   */
  lastLogin: Date | null;

  /** 
   * Account creation timestamp for audit trails and data lifecycle management.
   * Set automatically during user registration and never modified.
   * Used for compliance reporting, data retention, and user analytics.
   * 
   * @example new Date("2024-01-01T10:00:00Z")
   * @audit Required for complete user lifecycle audit trail
   * @compliance Used for data retention and regulatory reporting
   * @immutable This value should never be modified after creation
   */
  createdAt: Date;

  /** 
   * Last modification timestamp for the user record.
   * Updated automatically whenever any user data is modified.
   * Used for change tracking, audit trails, and data synchronization.
   * 
   * @example new Date("2024-01-15T14:30:00Z")
   * @audit Required for tracking all user data modifications
   * @compliance Used for regulatory change tracking requirements
   * @automatic Updated automatically by the system on any data change
   */
  updatedAt: Date;

  /** 
   * Reference to the user's detailed customer profile when applicable.
   * Links user authentication data to comprehensive customer information.
   * Null for internal staff users who don't have customer profiles.
   * 
   * Customer Profile Integration:
   * - Provides unified view of user and customer data
   * - Supports comprehensive customer relationship management
   * - Enables personalized service delivery
   * - Required for regulatory customer identification
   * 
   * @example Customer object with detailed profile information
   * @nullable Only applicable for external customer users
   * @integration Links to F-001 Unified Data Integration Platform
   * @compliance Required for customer identification program (CIP)
   */
  customerProfile: Customer | null;

  /** 
   * Current status of the user's onboarding process.
   * Tracks progress through digital customer onboarding workflow.
   * Used for onboarding completion monitoring and user experience optimization.
   * 
   * Onboarding Status Values:
   * - PENDING: Initial registration completed, awaiting verification
   * - IN_PROGRESS: Actively completing onboarding steps
   * - COMPLETED: All onboarding requirements fulfilled
   * - REJECTED: Onboarding failed due to compliance or verification issues
   * - NEEDS_REVIEW: Manual review required for completion
   * 
   * @example "COMPLETED"
   * @integration Links to F-004 Digital Customer Onboarding feature
   * @compliance Required for KYC/AML onboarding compliance tracking
   * @business Used for onboarding funnel analysis and optimization
   */
  onboardingStatus: OnboardingStatus;

  /** 
   * User-specific preferences and settings for personalized experience.
   * Optional field supporting customization of user interface and notifications.
   * Stored separately to maintain clean separation of authentication and preference data.
   * 
   * @optional User preferences are not required for basic functionality
   * @personalization Used for customizing user experience
   * @privacy Preference data subject to user privacy controls
   */
  preferences?: UserPreferences;

  /** 
   * Multi-factor authentication configuration and status for the user.
   * Tracks MFA method preferences, backup codes, and security settings.
   * Required for users with elevated privileges or regulatory requirements.
   * 
   * @security Critical for account security and compliance
   * @compliance May be required by regulatory frameworks
   * @optional Not all users may have MFA configured initially
   */
  mfaSettings?: UserMFASettings;

  /** 
   * Account security metadata including failed login attempts and security events.
   * Used for threat detection, account protection, and security analytics.
   * Automatically managed by the security subsystem.
   * 
   * @security Used for threat detection and account protection
   * @automatic Managed automatically by security systems
   * @audit Contributes to security event audit trails
   */
  securityMetadata?: UserSecurityMetadata;

  /** 
   * Compliance-specific user data including regulatory flags and audit information.
   * Required for users subject to financial services regulations.
   * Used for regulatory reporting and compliance monitoring.
   * 
   * @compliance Required for regulatory compliance tracking
   * @audit Used for regulatory audit and reporting
   * @optional May not be applicable for all user types
   */
  complianceData?: UserComplianceData;
}

/**
 * User preferences interface for personalized platform experience.
 * 
 * Supports customization of user interface elements, notification settings,
 * and operational preferences to enhance user experience and productivity.
 * Preferences are stored per user and synchronized across devices.
 * 
 * Design Principles:
 * - User-controlled customization without compromising security
 * - Consistent experience across web and mobile platforms
 * - Accessibility support for users with disabilities
 * - Privacy-respecting preference management
 * 
 * @version 1.0.0
 * @privacy User preferences are subject to privacy controls
 * @accessibility Must support accessibility requirements
 */
export interface UserPreferences {
  /** 
   * Visual theme preference for the user interface.
   * Supports light and dark themes for user comfort and accessibility.
   * Theme selection persists across user sessions and devices.
   * 
   * Theme Options:
   * - "light": Light theme with bright backgrounds (default)
   * - "dark": Dark theme with dark backgrounds for reduced eye strain
   * 
   * @example "dark"
   * @accessibility Supports users with visual sensitivities
   * @default "light"
   * @persistence Synchronized across all user devices
   */
  theme: 'light' | 'dark';

  /** 
   * Preferred language for the user interface and communications.
   * Must be a valid ISO 639-1 language code (e.g., "en", "es", "fr").
   * Used for localizing interface text, notifications, and documentation.
   * 
   * Language Support:
   * - Interface localization for supported languages
   * - Regulatory communications in user's preferred language
   * - Customer support in preferred language when available
   * - Document generation in selected language
   * 
   * @example "en" for English, "es" for Spanish
   * @validation Must be a valid ISO 639-1 language code
   * @localization Used for interface and communication localization
   * @compliance May be required for regulatory communications
   */
  language: string;

  /** 
   * Notification preferences controlling how and when the user receives alerts.
   * Comprehensive notification settings for various communication channels.
   * Respects user privacy and communication preferences.
   * 
   * @example { email: true, sms: false, push: true }
   * @privacy User controls all notification preferences
   * @compliance May be subject to regulatory notification requirements
   * @channels Supports multiple notification delivery methods
   */
  notifications: NotificationPreferences;

  /** 
   * Dashboard layout and widget preferences for personalized interface.
   * Allows users to customize their workspace for optimal productivity.
   * Layout preferences are role-aware and feature-specific.
   * 
   * @optional Advanced users can customize dashboard layouts
   * @personalization Enhances user productivity and experience
   * @role Layout options may vary based on user roles
   */
  dashboardLayout?: DashboardLayoutPreferences;

  /** 
   * Data display preferences including number formats, date formats, and currency.
   * Supports international users with localized data presentation.
   * Critical for financial data presentation accuracy.
   * 
   * @localization Supports international number and date formats
   * @financial Critical for accurate financial data display
   * @optional Falls back to system defaults if not specified
   */
  dataDisplayPreferences?: DataDisplayPreferences;

  /** 
   * Accessibility preferences for users with disabilities.
   * Supports platform compliance with accessibility standards.
   * Includes visual, auditory, and motor accessibility options.
   * 
   * @accessibility Required for ADA and WCAG compliance
   * @inclusive Supports users with various disabilities
   * @optional Only specified when accessibility features are needed
   */
  accessibilitySettings?: AccessibilitySettings;
}

/**
 * Notification preferences controlling user communication channels.
 * 
 * Provides granular control over how users receive different types of notifications
 * including security alerts, transaction notifications, and system updates.
 * Balances user preference with regulatory notification requirements.
 * 
 * Notification Categories:
 * - Security: Authentication events, suspicious activity alerts
 * - Transactional: Payment confirmations, account changes
 * - Marketing: Product offers, service updates (opt-in only)
 * - Regulatory: Compliance notifications, regulatory changes
 * - System: Maintenance notifications, service updates
 * 
 * @compliance Some notifications may be required by regulation
 * @privacy Users control non-regulatory notifications
 * @security Security notifications may override user preferences
 */
export interface NotificationPreferences {
  /** 
   * Email notification preference for various platform communications.
   * Controls delivery of notifications to the user's registered email address.
   * 
   * Email Notification Types:
   * - Security alerts and authentication events
   * - Transaction confirmations and account updates
   * - Regulatory notifications and compliance alerts
   * - System maintenance and service updates
   * - Marketing communications (opt-in only)
   * 
   * @example true
   * @channel Primary notification channel for most communications
   * @compliance Some email notifications may be legally required
   * @security Critical security notifications may override this preference
   */
  email: boolean;

  /** 
   * SMS notification preference for time-sensitive communications.
   * Controls text message delivery to the user's verified phone number.
   * 
   * SMS Notification Types:
   * - Multi-factor authentication codes
   * - Critical security alerts
   * - High-value transaction confirmations
   * - Account lockout notifications
   * - Emergency system alerts
   * 
   * @example false
   * @channel Used for time-sensitive and security-critical notifications
   * @cost SMS notifications may incur carrier charges
   * @verification Requires verified phone number for delivery
   */
  sms: boolean;

  /** 
   * Push notification preference for mobile and web applications.
   * Controls in-app notifications and browser push notifications.
   * 
   * Push Notification Types:
   * - Real-time transaction alerts
   * - Account activity notifications
   * - Market updates and price alerts
   * - System status and maintenance alerts
   * - Personalized recommendations
   * 
   * @example true
   * @platform Available on mobile apps and supported web browsers
   * @realtime Delivers immediate notifications for time-sensitive events
   * @permission Requires user permission grant for browser notifications
   */
  push: boolean;

  /** 
   * Advanced notification preferences for specific event types.
   * Allows granular control over different categories of notifications.
   * 
   * @optional Provides advanced users with fine-grained control
   * @granular Supports per-event-type notification preferences
   * @power Advanced feature for power users
   */
  advancedPreferences?: AdvancedNotificationPreferences;
}

/**
 * Multi-factor authentication settings and configuration for user accounts.
 * 
 * Manages MFA method preferences, backup authentication options, and security settings
 * required for enhanced account protection in financial services environments.
 * 
 * MFA Methods Supported:
 * - TOTP (Time-based One-Time Password) via authenticator apps
 * - SMS-based authentication codes
 * - Hardware security keys (FIDO2/WebAuthn)
 * - Biometric authentication (fingerprint, face recognition)
 * - Backup codes for account recovery
 * 
 * @security Critical for account security in financial services
 * @compliance May be required by regulatory frameworks
 * @standards Implements industry-standard MFA protocols
 */
export interface UserMFASettings {
  /** 
   * Whether multi-factor authentication is enabled for the user account.
   * Required for users with elevated privileges or regulatory requirements.
   * 
   * @example true
   * @security Essential for financial services security
   * @compliance May be mandated by regulatory requirements
   * @default false (but may be required based on user role)
   */
  isEnabled: boolean;

  /** 
   * Primary MFA method preferred by the user.
   * Used as the default method for authentication challenges.
   * 
   * @example "TOTP"
   * @fallback System will use backup methods if primary fails
   * @user User-controlled preference among available methods
   */
  primaryMethod: MFAMethod;

  /** 
   * Array of backup MFA methods available for account recovery.
   * Provides redundancy in case primary method is unavailable.
   * 
   * @example ["SMS", "BACKUP_CODES"]
   * @recovery Critical for account recovery scenarios
   * @redundancy Ensures users can always access their accounts
   */
  backupMethods: MFAMethod[];

  /** 
   * Configuration details for TOTP authenticator app integration.
   * Includes shared secret and recovery information.
   * 
   * @optional Only present when TOTP is configured
   * @security Shared secret must be encrypted at rest
   * @standard Implements RFC 6238 TOTP standard
   */
  totpConfig?: TOTPConfiguration;

  /** 
   * Hardware security key registrations for FIDO2/WebAuthn authentication.
   * Supports multiple registered keys for redundancy.
   * 
   * @optional Only present when hardware keys are registered
   * @security Most secure MFA method available
   * @standard Implements FIDO2/WebAuthn standards
   */
  securityKeys?: SecurityKeyRegistration[];

  /** 
   * Biometric authentication configuration and preferences.
   * Includes fingerprint and facial recognition settings.
   * 
   * @optional Only available on supported devices
   * @biometric Requires biometric-capable device
   * @privacy Biometric data never leaves the user's device
   */
  biometricConfig?: BiometricAuthConfiguration;

  /** 
   * Backup recovery codes for emergency account access.
   * Single-use codes generated during MFA setup.
   * 
   * @security Each code can only be used once
   * @recovery Essential for account recovery scenarios
   * @encryption Codes must be hashed and encrypted
   */
  backupCodes?: BackupCodesConfiguration;

  /** 
   * Timestamp of last MFA configuration change.
   * Used for security monitoring and audit purposes.
   * 
   * @audit Required for security event tracking
   * @monitoring Used for suspicious activity detection
   * @compliance Part of security audit trail
   */
  lastUpdated: Date;
}

/**
 * User security metadata for threat detection and account protection.
 * 
 * Tracks security-related events, failed authentication attempts, and suspicious
 * activity patterns to protect user accounts from unauthorized access.
 * 
 * Security Features:
 * - Failed login attempt tracking and account lockout
 * - Suspicious activity detection and alerting
 * - Device fingerprinting and recognition
 * - Geographic login pattern analysis
 * - Security event audit trail
 * 
 * @security Critical for account protection and threat detection
 * @automatic Managed automatically by security systems
 * @privacy Security data retention follows privacy policies
 */
export interface UserSecurityMetadata {
  /** 
   * Number of consecutive failed login attempts since last successful login.
   * Used for account lockout policies and brute force attack prevention.
   * 
   * @example 0
   * @security Triggers account lockout when threshold is exceeded
   * @reset Resets to 0 upon successful authentication
   * @policy Configurable threshold based on security policies
   */
  failedLoginAttempts: number;

  /** 
   * Timestamp of last failed login attempt for security monitoring.
   * Used for suspicious activity detection and security analytics.
   * 
   * @example new Date("2024-01-15T14:30:00Z")
   * @security Used for attack pattern detection
   * @analytics Contributes to security analytics and reporting
   * @nullable Null if no failed attempts have occurred
   */
  lastFailedLogin: Date | null;

  /** 
   * Whether the user account is currently locked due to security policies.
   * Locked accounts cannot authenticate until manually unlocked or timeout expires.
   * 
   * @example false
   * @security Prevents unauthorized access during suspicious activity
   * @automatic May be set automatically by security systems
   * @recovery Requires admin intervention or timeout for unlock
   */
  isAccountLocked: boolean;

  /** 
   * Timestamp when account lock will automatically expire.
   * Null if account is not locked or requires manual unlock.
   * 
   * @example new Date("2024-01-15T16:00:00Z")
   * @automatic Account automatically unlocks at this time
   * @nullable Null if account is not locked or requires manual unlock
   * @policy Lockout duration configurable based on security policies
   */
  lockExpiresAt: Date | null;

  /** 
   * Array of known devices that have successfully authenticated.
   * Used for device recognition and suspicious login detection.
   * 
   * @security Helps identify unauthorized device access
   * @recognition Reduces friction for recognized devices
   * @privacy Device fingerprints are anonymized
   */
  knownDevices: DeviceFingerprint[];

  /** 
   * Array of recent security events for audit and monitoring.
   * Includes login attempts, password changes, and suspicious activities.
   * 
   * @audit Complete security event trail for compliance
   * @monitoring Used for security analytics and threat detection
   * @retention Events retained according to security policies
   */
  securityEvents: SecurityEvent[];

  /** 
   * Risk score calculated based on user behavior and security events.
   * Used for adaptive authentication and risk-based security controls.
   * 
   * @example 0.2 (low risk)
   * @range 0.0 (no risk) to 1.0 (high risk)
   * @adaptive Used for risk-based authentication decisions
   * @ml Calculated using machine learning algorithms
   */
  riskScore: number;

  /** 
   * Timestamp of last security risk assessment calculation.
   * Used for tracking risk score freshness and update frequency.
   * 
   * @example new Date("2024-01-15T14:30:00Z")
   * @freshness Indicates how current the risk score is
   * @update Risk scores are updated based on security policies
   * @monitoring Used for security monitoring effectiveness
   */
  lastRiskAssessment: Date;
}

/**
 * Compliance-specific user data for regulatory reporting and audit purposes.
 * 
 * Maintains regulatory compliance information, audit trails, and data required
 * for financial services regulatory reporting and supervisory examinations.
 * 
 * Regulatory Frameworks Supported:
 * - SOC2 (System and Organization Controls)
 * - PCI-DSS (Payment Card Industry Data Security Standard)
 * - GDPR (General Data Protection Regulation)
 * - Basel IV (International banking regulation)
 * - FINRA (Financial Industry Regulatory Authority)
 * - Dodd-Frank Act compliance
 * 
 * @compliance Required for financial services regulatory compliance
 * @audit Comprehensive audit trail for regulatory examinations
 * @retention Data retained according to regulatory requirements
 */
export interface UserComplianceData {
  /** 
   * Unique compliance identifier for regulatory reporting.
   * Used for tracking user data across regulatory systems.
   * 
   * @example "COMP-USER-2024-001234"
   * @regulatory Required for regulatory reporting and tracking
   * @unique Must be unique across all regulatory systems
   * @immutable Cannot be changed once assigned
   */
  complianceId: string;

  /** 
   * KYC (Know Your Customer) verification status and details.
   * Required for customer identification program compliance.
   * 
   * @compliance Required for CIP (Customer Identification Program)
   * @regulatory Mandated by Bank Secrecy Act and AML regulations
   * @verification Status of identity verification process
   */
  kycStatus: ComplianceStatus;

  /** 
   * AML (Anti-Money Laundering) screening status and results.
   * Includes sanctions list screening and PEP (Politically Exposed Person) checks.
   * 
   * @compliance Required for AML compliance programs
   * @screening Results of sanctions list and PEP screening
   * @regulatory Mandated by AML and sanctions regulations
   */
  amlStatus: ComplianceStatus;

  /** 
   * Data subject rights status for GDPR compliance.
   * Tracks user consent, data processing rights, and privacy requests.
   * 
   * @privacy Required for GDPR and privacy regulation compliance
   * @consent Tracks user consent for data processing
   * @rights Manages data subject rights requests
   */
  dataSubjectRights: DataSubjectRights;

  /** 
   * Audit trail of all compliance-related activities and decisions.
   * Required for regulatory examinations and supervisory reviews.
   * 
   * @audit Complete audit trail for regulatory compliance
   * @examination Required for regulatory examinations
   * @retention Retained according to regulatory requirements
   */
  complianceAuditTrail: ComplianceAuditEvent[];

  /** 
   * Regulatory reporting data and submission status.
   * Tracks regulatory reports that include user data.
   * 
   * @reporting Required for regulatory reporting compliance
   * @submission Tracks regulatory report submissions
   * @deadline Manages regulatory reporting deadlines
   */
  regulatoryReporting: RegulatoryReportingData;

  /** 
   * Data classification and handling requirements.
   * Specifies security controls and access restrictions.
   * 
   * @classification Defines data sensitivity and handling requirements
   * @security Specifies required security controls
   * @access Controls access based on data classification
   */
  dataClassification: DataClassification;

  /** 
   * Timestamp of last compliance status review.
   * Used for compliance monitoring and reporting.
   * 
   * @example new Date("2024-01-15T14:30:00Z")
   * @compliance Required for compliance monitoring
   * @review Tracks compliance review frequency
   * @regulatory Used for regulatory reporting
   */
  lastComplianceReview: Date;
}

/**
 * Dashboard layout preferences for personalized user interface.
 * 
 * Allows users to customize their dashboard layout, widget placement,
 * and data visualization preferences for optimal productivity.
 * 
 * @personalization Enhances user productivity and experience
 * @responsive Layout adapts to different screen sizes
 * @role Layout options may vary based on user roles
 */
export interface DashboardLayoutPreferences {
  /** 
   * Array of dashboard widgets and their configuration.
   * Controls which widgets are displayed and their settings.
   * 
   * @customization User-controlled widget selection and configuration
   * @productivity Optimizes dashboard for user workflow
   * @role Available widgets may depend on user roles
   */
  widgets: DashboardWidget[];

  /** 
   * Grid layout configuration for dashboard widgets.
   * Defines widget positioning and sizing on the dashboard.
   * 
   * @layout Controls visual arrangement of dashboard elements
   * @responsive Adapts to different screen sizes
   * @drag Supports drag-and-drop widget arrangement
   */
  layout: GridLayout;

  /** 
   * Default page or dashboard to display upon login.
   * Personalizes the initial user experience.
   * 
   * @example "customer-overview"
   * @personalization Customizes initial user experience
   * @productivity Reduces clicks to reach frequently used features
   */
  defaultPage: string;

  /** 
   * Refresh interval preferences for real-time data updates.
   * Controls how frequently dashboard data is refreshed.
   * 
   * @realtime Controls real-time data update frequency
   * @performance Balances data freshness with system performance
   * @user User-controlled refresh preferences
   */
  refreshInterval: number;
}

/**
 * Data display preferences for localized number, date, and currency formatting.
 * 
 * Supports international users with proper localization of financial data,
 * dates, and numbers according to regional conventions.
 * 
 * @localization Supports international data display formats
 * @financial Critical for accurate financial data presentation
 * @regional Adapts to regional formatting conventions
 */
export interface DataDisplayPreferences {
  /** 
   * Number formatting preferences including decimal separators and grouping.
   * Supports international number formatting conventions.
   * 
   * @example { decimalSeparator: ".", thousandsSeparator: "," }
   * @localization Supports international number formats
   * @financial Critical for financial data display accuracy
   */
  numberFormat: NumberFormatSettings;

  /** 
   * Date and time formatting preferences for display consistency.
   * Supports various date formats and timezone preferences.
   * 
   * @example { format: "MM/DD/YYYY", timezone: "America/New_York" }
   * @localization Supports international date formats
   * @timezone User-preferred timezone for date display
   */
  dateFormat: DateFormatSettings;

  /** 
   * Currency display preferences including symbols and precision.
   * Critical for accurate financial data presentation.
   * 
   * @example { symbol: "$", position: "before", precision: 2 }
   * @financial Critical for financial data accuracy
   * @localization Supports international currency formats
   */
  currencyFormat: CurrencyFormatSettings;

  /** 
   * Chart and graph display preferences for data visualization.
   * Controls colors, themes, and visualization styles.
   * 
   * @visualization Customizes data visualization appearance
   * @accessibility Supports accessibility requirements
   * @theme Integrates with overall theme preferences
   */
  chartPreferences: ChartDisplaySettings;
}

/**
 * Accessibility settings for users with disabilities.
 * 
 * Supports platform compliance with accessibility standards including
 * ADA (Americans with Disabilities Act) and WCAG (Web Content Accessibility Guidelines).
 * 
 * @accessibility Required for ADA and WCAG compliance
 * @inclusive Supports users with various disabilities
 * @standards Implements accessibility best practices
 */
export interface AccessibilitySettings {
  /** 
   * High contrast mode for users with visual impairments.
   * Enhances visual contrast for better readability.
   * 
   * @example true
   * @visual Supports users with visual impairments
   * @contrast Enhances visual contrast and readability
   */
  highContrast: boolean;

  /** 
   * Font size multiplier for users with visual impairments.
   * Allows enlarging text for better readability.
   * 
   * @example 1.5
   * @range 0.8 to 2.0 (80% to 200% of normal size)
   * @visual Supports users with visual impairments
   */
  fontSize: number;

  /** 
   * Screen reader compatibility settings and preferences.
   * Optimizes interface for screen reader software.
   * 
   * @screenreader Supports users with visual impairments
   * @compatibility Optimizes for screen reader software
   * @aria Enhances ARIA label and description support
   */
  screenReaderOptimized: boolean;

  /** 
   * Keyboard navigation preferences and shortcuts.
   * Supports users who cannot use mouse or touch input.
   * 
   * @keyboard Supports keyboard-only navigation
   * @motor Supports users with motor impairments
   * @shortcuts Customizable keyboard shortcuts
   */
  keyboardNavigation: boolean;

  /** 
   * Audio cues and sound notification preferences.
   * Provides audio feedback for interface interactions.
   * 
   * @audio Provides audio feedback for interactions
   * @notification Audio alternatives to visual notifications
   * @feedback Enhances user interaction feedback
   */
  audioFeedback: boolean;

  /** 
   * Reduced motion preferences for users with vestibular disorders.
   * Minimizes animations and motion effects.
   * 
   * @motion Reduces motion for users with vestibular disorders
   * @animation Minimizes or eliminates animated elements
   * @health Supports users with motion sensitivities
   */
  reducedMotion: boolean;
}

/**
 * Advanced notification preferences for granular control.
 * 
 * Provides power users with fine-grained control over specific
 * types of notifications and delivery preferences.
 * 
 * @advanced For power users requiring granular control
 * @granular Specific notification type preferences
 * @optional Additional layer of notification control
 */
export interface AdvancedNotificationPreferences {
  /** 
   * Security notification preferences for authentication and account events.
   * Controls notifications for security-related activities.
   * 
   * @security Critical security event notifications
   * @override Some security notifications may override user preferences
   * @compliance Required for security compliance
   */
  securityNotifications: SecurityNotificationSettings;

  /** 
   * Transaction notification preferences for financial activities.
   * Controls notifications for payments, transfers, and account changes.
   * 
   * @financial Controls financial activity notifications
   * @threshold May include amount thresholds for notifications
   * @realtime Real-time transaction notifications
   */
  transactionNotifications: TransactionNotificationSettings;

  /** 
   * System notification preferences for maintenance and updates.
   * Controls notifications about system status and changes.
   * 
   * @system System status and maintenance notifications
   * @maintenance Planned maintenance and downtime notifications
   * @updates System and feature update notifications
   */
  systemNotifications: SystemNotificationSettings;

  /** 
   * Marketing and promotional notification preferences.
   * Controls optional marketing communications and product offers.
   * 
   * @marketing Optional marketing and promotional content
   * @optin Requires explicit user opt-in for marketing communications
   * @personalized Personalized offers and recommendations
   */
  marketingNotifications: MarketingNotificationSettings;
}

/**
 * Multi-factor authentication method enumeration.
 * 
 * Defines the available MFA methods supported by the platform
 * with varying levels of security and user convenience.
 * 
 * @security Different methods provide varying security levels
 * @convenience Balances security with user convenience
 * @standards Implements industry-standard MFA protocols
 */
export type MFAMethod = 
  | 'TOTP'           // Time-based One-Time Password (authenticator apps)
  | 'SMS'            // SMS-based authentication codes
  | 'EMAIL'          // Email-based authentication codes
  | 'HARDWARE_KEY'   // Hardware security keys (FIDO2/WebAuthn)
  | 'BIOMETRIC'      // Biometric authentication (fingerprint, face)
  | 'BACKUP_CODES'   // Single-use backup recovery codes
  | 'VOICE_CALL';    // Voice call authentication codes

/**
 * Compliance status enumeration for regulatory tracking.
 * 
 * Standardized status values for tracking compliance with
 * various regulatory requirements and verification processes.
 * 
 * @compliance Standard compliance status values
 * @regulatory Used for regulatory reporting and tracking
 * @audit Required for audit trail documentation
 */
export type ComplianceStatus = 
  | 'PENDING'        // Initial state, verification not started
  | 'IN_PROGRESS'    // Verification process underway
  | 'COMPLETED'      // Verification successfully completed
  | 'APPROVED'       // Verification approved by compliance officer
  | 'REJECTED'       // Verification failed or rejected
  | 'EXPIRED'        // Previously valid verification has expired
  | 'NEEDS_REVIEW'   // Manual review required for completion
  | 'SUSPENDED';     // Temporarily suspended pending investigation

/**
 * Data classification levels for security and access control.
 * 
 * Defines data sensitivity levels and corresponding security
 * controls required for financial services data protection.
 * 
 * @security Defines required security controls by classification
 * @access Controls access based on data sensitivity
 * @compliance Supports regulatory data protection requirements
 */
export type DataClassification = 
  | 'PUBLIC'         // Publicly available information
  | 'INTERNAL'       // Internal use only, not confidential
  | 'CONFIDENTIAL'   // Confidential business information
  | 'RESTRICTED'     // Highly sensitive, restricted access
  | 'SECRET'         // Classified information, highest protection
  | 'PERSONAL'       // Personal data subject to privacy laws
  | 'FINANCIAL'      // Financial data requiring special protection
  | 'REGULATORY';    // Data subject to regulatory protection

// Type definitions for supporting interfaces (these would typically be defined in separate files)

/**
 * TOTP configuration for authenticator app integration.
 * Implements RFC 6238 Time-Based One-Time Password Algorithm.
 */
export interface TOTPConfiguration {
  /** Base32-encoded shared secret for TOTP generation */
  sharedSecret: string;
  /** Algorithm used for TOTP generation (typically SHA1) */
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  /** Number of digits in generated codes (typically 6) */
  digits: number;
  /** Time step in seconds (typically 30) */
  period: number;
  /** QR code data for easy setup */
  qrCodeData: string;
  /** Backup codes for account recovery */
  backupCodes: string[];
  /** Timestamp when TOTP was configured */
  configuredAt: Date;
}

/**
 * Security key registration for FIDO2/WebAuthn authentication.
 */
export interface SecurityKeyRegistration {
  /** Unique identifier for the security key */
  keyId: string;
  /** Human-readable name for the security key */
  keyName: string;
  /** Public key credential data */
  publicKey: string;
  /** Counter value for replay attack prevention */
  counter: number;
  /** Timestamp when key was registered */
  registeredAt: Date;
  /** Timestamp of last use */
  lastUsedAt: Date | null;
}

/**
 * Biometric authentication configuration.
 */
export interface BiometricAuthConfiguration {
  /** Available biometric methods on the device */
  availableMethods: BiometricMethod[];
  /** User's preferred biometric method */
  preferredMethod: BiometricMethod;
  /** Whether biometric authentication is enabled */
  isEnabled: boolean;
  /** Device-specific biometric configuration */
  deviceConfig: Record<string, any>;
  /** Timestamp of last biometric authentication */
  lastUsedAt: Date | null;
}

/**
 * Biometric authentication methods.
 */
export type BiometricMethod = 
  | 'FINGERPRINT'
  | 'FACE_RECOGNITION'
  | 'VOICE_RECOGNITION'
  | 'IRIS_SCAN'
  | 'PALM_PRINT';

/**
 * Backup codes configuration for emergency access.
 */
export interface BackupCodesConfiguration {
  /** Array of hashed backup codes */
  codes: string[];
  /** Number of codes remaining unused */
  remainingCodes: number;
  /** Timestamp when codes were generated */
  generatedAt: Date;
  /** Whether codes have been shown to user */
  hasBeenViewed: boolean;
}

/**
 * Device fingerprint for device recognition.
 */
export interface DeviceFingerprint {
  /** Unique device identifier */
  deviceId: string;
  /** Device type (mobile, desktop, tablet) */
  deviceType: string;
  /** Operating system information */
  operatingSystem: string;
  /** Browser information */
  browser: string;
  /** Screen resolution */
  screenResolution: string;
  /** Timezone information */
  timezone: string;
  /** Approximate geographic location */
  location: string;
  /** Whether device is trusted */
  isTrusted: boolean;
  /** First seen timestamp */
  firstSeen: Date;
  /** Last seen timestamp */
  lastSeen: Date;
}

/**
 * Security event for audit trail.
 */
export interface SecurityEvent {
  /** Unique event identifier */
  eventId: string;
  /** Type of security event */
  eventType: SecurityEventType;
  /** Event description */
  description: string;
  /** Event timestamp */
  timestamp: Date;
  /** IP address of the event source */
  ipAddress: string;
  /** User agent string */
  userAgent: string;
  /** Device information */
  deviceInfo: DeviceFingerprint;
  /** Event severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Whether event indicates suspicious activity */
  isSuspicious: boolean;
}

/**
 * Types of security events.
 */
export type SecurityEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DEVICE_REGISTERED'
  | 'SECURITY_SETTINGS_CHANGED';

/**
 * Data subject rights for GDPR compliance.
 */
export interface DataSubjectRights {
  /** Consent status for data processing */
  consentStatus: ConsentStatus;
  /** Data portability requests */
  portabilityRequests: DataPortabilityRequest[];
  /** Right to be forgotten requests */
  erasureRequests: DataErasureRequest[];
  /** Data access requests */
  accessRequests: DataAccessRequest[];
  /** Data rectification requests */
  rectificationRequests: DataRectificationRequest[];
  /** Processing restriction requests */
  restrictionRequests: ProcessingRestrictionRequest[];
}

/**
 * Consent status for data processing.
 */
export interface ConsentStatus {
  /** Whether user has given consent */
  hasConsented: boolean;
  /** Consent timestamp */
  consentTimestamp: Date;
  /** Consent version */
  consentVersion: string;
  /** Specific consents given */
  specificConsents: Record<string, boolean>;
  /** Consent withdrawal timestamp */
  withdrawalTimestamp: Date | null;
}

/**
 * Compliance audit event for regulatory compliance.
 */
export interface ComplianceAuditEvent {
  /** Unique audit event identifier */
  eventId: string;
  /** Type of compliance event */
  eventType: string;
  /** Event description */
  description: string;
  /** Event timestamp */
  timestamp: Date;
  /** User who performed the action */
  performedBy: string;
  /** Affected data or systems */
  affectedData: string[];
  /** Compliance framework */
  framework: string;
  /** Event outcome */
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  /** Additional metadata */
  metadata: Record<string, any>;
}

/**
 * Regulatory reporting data.
 */
export interface RegulatoryReportingData {
  /** Reports that include this user's data */
  includedReports: string[];
  /** Submission status by report */
  submissionStatus: Record<string, 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'>;
  /** Next reporting deadline */
  nextDeadline: Date | null;
  /** Reporting frequency */
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
}

// Additional supporting types for comprehensive user preferences
export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export interface GridLayout {
  columns: number;
  rows: number;
  cellSize: { width: number; height: number };
  margin: { x: number; y: number };
}

export interface NumberFormatSettings {
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  negativeFormat: string;
}

export interface DateFormatSettings {
  format: string;
  timezone: string;
  use24HourTime: boolean;
  showTimezone: boolean;
}

export interface CurrencyFormatSettings {
  symbol: string;
  position: 'before' | 'after';
  precision: number;
  showSymbol: boolean;
}

export interface ChartDisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  colorPalette: string[];
  animationsEnabled: boolean;
  defaultChartType: string;
}

export interface SecurityNotificationSettings {
  loginAttempts: boolean;
  passwordChanges: boolean;
  mfaChanges: boolean;
  deviceRegistrations: boolean;
  suspiciousActivity: boolean;
}

export interface TransactionNotificationSettings {
  allTransactions: boolean;
  largeTransactions: boolean;
  threshold: number;
  internationalTransactions: boolean;
  failedTransactions: boolean;
}

export interface SystemNotificationSettings {
  maintenance: boolean;
  updates: boolean;
  outages: boolean;
  performanceIssues: boolean;
}

export interface MarketingNotificationSettings {
  productOffers: boolean;
  newsletters: boolean;
  events: boolean;
  surveys: boolean;
}

// Data request types for GDPR compliance
export interface DataPortabilityRequest {
  requestId: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  dataFormat: string;
  completionDate: Date | null;
}

export interface DataErasureRequest {
  requestId: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  scope: string[];
  completionDate: Date | null;
  retentionReason: string | null;
}

export interface DataAccessRequest {
  requestId: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  dataProvided: string[];
  completionDate: Date | null;
}

export interface DataRectificationRequest {
  requestId: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  fieldsToCorrect: string[];
  correctedValues: Record<string, any>;
  completionDate: Date | null;
}

export interface ProcessingRestrictionRequest {
  requestId: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  restrictionScope: string[];
  completionDate: Date | null;
  restrictionReason: string;
}