/**
 * Authentication and Authorization Type Definitions
 * 
 * This file contains TypeScript type definitions and interfaces for authentication,
 * authorization, and session management within the Unified Financial Services Platform.
 * 
 * These types support the platform's core security requirements including:
 * - SOC2, PCI-DSS, and GDPR compliance
 * - Role-based access control (RBAC) with audit trails
 * - Digital customer onboarding with KYC/AML verification
 * - Multi-factor authentication and biometric verification
 * - Session management with JWT token handling
 * 
 * Security Considerations:
 * - All sensitive data should be handled according to financial industry standards
 * - Tokens should be stored securely and rotated regularly
 * - User data access must comply with data residency requirements
 * - All authentication events must generate audit logs
 * 
 * @version 1.0.0
 * @author Financial Services Platform Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV
 */

/**
 * Permission type representing granular access rights within the financial platform.
 * 
 * Permissions follow a hierarchical structure aligned with financial services operations:
 * - customer:read, customer:write, customer:delete
 * - transaction:read, transaction:write, transaction:approve
 * - compliance:read, compliance:write, compliance:audit
 * - risk:read, risk:write, risk:assess
 * - admin:users, admin:system, admin:security
 * 
 * Examples:
 * - "customer:read" - Read access to customer data
 * - "transaction:approve" - Ability to approve high-value transactions
 * - "compliance:audit" - Access to compliance audit trails
 * - "risk:assess" - Permission to perform risk assessments
 */
export type Permission = string;

/**
 * Role interface defining user roles within the financial institution.
 * 
 * Roles are designed to support various financial services personas:
 * - customer_advisor: Front-line staff serving retail customers
 * - relationship_manager: Managing high-value client relationships
 * - compliance_officer: Ensuring regulatory compliance
 * - risk_analyst: Performing risk assessments and monitoring
 * - system_administrator: Managing platform infrastructure
 * - auditor: Read-only access for regulatory audits
 * 
 * Each role contains a collection of permissions that define what actions
 * the role can perform within the system. This supports the principle of
 * least privilege access as required by financial regulations.
 */
export interface Role {
  /** Unique identifier for the role */
  id: string;
  
  /** Human-readable role name (e.g., "Customer Advisor", "Risk Manager") */
  name: string;
  
  /** 
   * Array of permissions granted to this role.
   * Permissions are strings following the format "resource:action"
   * to provide granular access control across the platform.
   */
  permissions: Permission[];
}

/**
 * User interface representing authenticated users in the financial platform.
 * 
 * This interface supports all user types within the financial ecosystem:
 * - Financial institution employees (advisors, managers, analysts)
 * - End customers (retail, SME, corporate clients)
 * - Regulatory users (auditors, compliance reviewers)
 * - System administrators and technical staff
 * 
 * User data is handled according to strict privacy and compliance requirements
 * including GDPR data protection rights and financial sector data retention policies.
 */
export interface User {
  /** 
   * Unique user identifier - typically a UUID for security and privacy.
   * This ID is used for all internal references and audit logging.
   */
  id: string;
  
  /** 
   * User's first name. Required for KYC compliance and personalization.
   * Must be validated against identity verification documents during onboarding.
   */
  firstName: string;
  
  /** 
   * User's last name. Required for KYC compliance and legal identification.
   * Must match identity verification documents for regulatory compliance.
   */
  lastName: string;
  
  /** 
   * User's email address - serves as primary identification and communication channel.
   * Must be unique across the platform and verified during registration.
   * Used for security notifications, transaction alerts, and regulatory communications.
   */
  email: string;
  
  /** 
   * Array of roles assigned to the user, supporting multiple role assignments.
   * Each role contains permissions that determine what actions the user can perform.
   * Role assignments must be logged for audit purposes and comply with segregation of duties requirements.
   */
  roles: Role[];
}

/**
 * Session interface managing user authentication state and security tokens.
 * 
 * Sessions are implemented using JWT tokens with the following security features:
 * - Short-lived access tokens (typically 15-30 minutes)
 * - Longer-lived refresh tokens (typically 7-30 days)
 * - Token rotation on refresh for enhanced security
 * - Secure storage requirements (httpOnly cookies recommended)
 * 
 * Session management must comply with financial industry security standards
 * including PCI-DSS requirements for cardholder data protection.
 */
export interface Session {
  /** 
   * JWT access token containing user identity and permissions.
   * Short-lived token (15-30 minutes) used for API authentication.
   * Contains encoded user claims and role information.
   * Must be transmitted over HTTPS only and stored securely.
   */
  accessToken: string;
  
  /** 
   * JWT refresh token used to obtain new access tokens.
   * Longer-lived token (7-30 days) stored securely on the client.
   * Used exclusively for token refresh operations.
   * Must be rotated on each use for maximum security.
   */
  refreshToken: string;
  
  /** 
   * Unix timestamp indicating when the access token expires.
   * Used by clients to proactively refresh tokens before expiration.
   * Critical for maintaining seamless user experience while ensuring security.
   */
  expiresAt: number;
}

/**
 * Authentication state interface managing the overall auth status in the application.
 * 
 * This interface is typically used with state management libraries (Redux, Zustand)
 * to maintain consistent authentication state across the React application.
 * 
 * The state supports loading states for better UX during authentication operations
 * and error handling for various authentication scenarios.
 */
export interface AuthState {
  /** 
   * Boolean flag indicating whether the user is currently authenticated.
   * Derived from the presence and validity of authentication tokens.
   * Used throughout the application for conditional rendering and route protection.
   */
  isAuthenticated: boolean;
  
  /** 
   * Current authenticated user object, null if not authenticated.
   * Contains complete user profile information including roles and permissions.
   * Used for personalization and authorization decisions throughout the app.
   */
  user: User | null;
  
  /** 
   * Current session information, null if not authenticated.
   * Contains authentication tokens and expiration information.
   * Managed automatically by the authentication system with token refresh logic.
   */
  session: Session | null;
  
  /** 
   * Loading state indicator for authentication operations.
   * True during login, logout, token refresh, and user profile loading.
   * Used to show loading indicators and prevent multiple simultaneous auth operations.
   */
  loading: boolean;
  
  /** 
   * Error message from the last authentication operation, null if no error.
   * Contains user-friendly error messages for display in the UI.
   * Should be cleared when new authentication operations begin.
   */
  error: string | null;
}

/**
 * Login request payload interface for user authentication.
 * 
 * This interface defines the structure for login requests to the authentication API.
 * The platform supports multiple authentication methods including:
 * - Email/password authentication
 * - Multi-factor authentication (MFA)
 * - Biometric authentication for mobile applications
 * - Single sign-on (SSO) integration
 * 
 * All login attempts are logged for security monitoring and compliance auditing.
 */
export interface LoginRequest {
  /** 
   * User's email address used as the primary identifier.
   * Must be a valid email format and exist in the user database.
   * Used for account lookup and security notifications.
   */
  email: string;
  
  /** 
   * User's password for authentication.
   * Must meet platform security requirements (complexity, length, etc.).
   * Should be transmitted over HTTPS and never logged or stored in plain text.
   * Supports secure password policies including rotation requirements.
   */
  password: string;
}

/**
 * Login response payload interface returned after successful authentication.
 * 
 * This interface defines the structure of the response from the authentication API
 * after a successful login operation. It provides all necessary information
 * to establish and maintain the user's authenticated session.
 * 
 * The response includes complete user profile and session information needed
 * for immediate application state initialization.
 */
export interface LoginResponse {
  /** 
   * Complete user object with profile information and role assignments.
   * Includes all data necessary for personalization and authorization.
   * Updated with latest information from the user database at login time.
   */
  user: User;
  
  /** 
   * New session object with fresh authentication tokens.
   * Contains access and refresh tokens with appropriate expiration times.
   * Tokens are signed and can be validated for authenticity and integrity.
   */
  session: Session;
}

/**
 * Token refresh request payload interface for obtaining new access tokens.
 * 
 * This interface defines the structure for refresh token requests used to
 * obtain new access tokens without requiring the user to re-authenticate.
 * 
 * Token refresh operations are critical for maintaining seamless user experience
 * while adhering to security best practices of short-lived access tokens.
 * All refresh operations are logged for security monitoring.
 */
export interface TokenRefreshRequest {
  /** 
   * Current refresh token to be exchanged for a new access token.
   * Must be a valid, non-expired refresh token issued by the platform.
   * Token will be validated for authenticity and user association.
   * May be rotated (invalidated and replaced) as part of the refresh process.
   */
  refreshToken: string;
}

/**
 * Token refresh response payload interface returned after successful token refresh.
 * 
 * This interface defines the structure of the response from the token refresh API
 * after successfully exchanging a refresh token for new authentication tokens.
 * 
 * The response provides updated session information with fresh tokens,
 * allowing the application to continue making authenticated requests.
 */
export interface TokenRefreshResponse {
  /** 
   * Updated session object with new authentication tokens.
   * Contains fresh access token with extended expiration time.
   * May include a new refresh token if token rotation is enabled.
   * Expiration times are updated to reflect the new token validity period.
   */
  session: Session;
}