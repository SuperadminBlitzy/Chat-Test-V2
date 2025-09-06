// next-auth version 4.24.5
import { DefaultSession, DefaultUser } from 'next-auth' // v4.24.5
import { JWT } from 'next-auth/jwt' // v4.24.5

declare module 'next-auth' {
  /**
   * Extends the default next-auth Session object to include the application-specific 
   * user object and accessToken for enhanced authentication and authorization.
   * 
   * This extension supports the OAuth2, RBAC, and MFA authentication requirements
   * specified in section 2.3.3 Common Services of the technical specification.
   */
  interface Session extends DefaultSession {
    /**
     * The user object for the session, containing custom properties such as role
     * and permissions while preserving all default next-auth user properties.
     * This enables type-safe access to user roles and permissions throughout the application.
     */
    user: User & DefaultSession['user']
    
    /**
     * The JWT access token for the authenticated user.
     * Required for secure API communication and maintaining session state
     * across the unified financial services platform components.
     */
    accessToken: string
  }

  /**
   * Extends the default next-auth User object to include application-specific 
   * properties like role and permissions as defined in section 1.3.2 
   * Implementation Boundaries/User Groups Covered.
   * 
   * Supports the following user categories:
   * - Financial Institution Staff (Advisors, Relationship Managers, Compliance Officers, Risk Managers)
   * - End Customers (Retail, SME, Corporate clients)
   * - Regulatory Users (Auditors, Compliance reviewers)
   * - System Administrators (IT staff, Security teams)
   */
  interface User extends DefaultUser {
    /**
     * The role of the user within the financial services platform.
     * 
     * Supported roles include:
     * - 'Customer' (Retail, SME, Corporate clients)
     * - 'Advisor' (Financial Advisors)
     * - 'RelationshipManager' (Relationship Managers)
     * - 'ComplianceOfficer' (Compliance Officers)
     * - 'RiskManager' (Risk Managers)
     * - 'Auditor' (Regulatory auditors)
     * - 'ComplianceReviewer' (Compliance reviewers)
     * - 'SystemAdministrator' (IT staff)
     * - 'SecurityTeam' (Security teams)
     * 
     * This role determines the user's access level and available features
     * within the platform's role-based access control (RBAC) system.
     */
    role: string
    
    /**
     * A list of permissions assigned to the user based on their role
     * and specific access requirements within the unified financial services platform.
     * 
     * Permissions control access to specific features and data domains:
     * - Data access permissions (customer data, product data, risk data, compliance data)
     * - Feature permissions (AI-powered services, compliance automation, digital onboarding)
     * - Administrative permissions (user management, system configuration, audit access)
     * 
     * These permissions enable fine-grained access control with audit trails
     * as required by the platform's security and compliance requirements.
     */
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the JWT object to include custom claims like user role and permissions.
   * 
   * This extension ensures that authentication tokens carry the necessary
   * authorization information for secure, role-based access across all
   * platform services and microservices in the unified financial services ecosystem.
   */
  interface JWT {
    /**
     * The user's role, embedded in the JWT token for stateless authentication.
     * 
     * This claim enables microservices to make authorization decisions
     * without requiring additional database queries, supporting the
     * platform's performance requirements (<1 second response time).
     */
    role: string
    
    /**
     * The user's permissions, embedded in the JWT token as an array of strings.
     * 
     * Embedding permissions in the JWT enables distributed authorization
     * decisions across the microservices architecture while maintaining
     * security and performance standards.
     */
    permissions: string[]
    
    /**
     * The JWT access token used for API authentication and authorization.
     * 
     * This token facilitates secure communication between the web application
     * and backend services, supporting the OAuth2 authentication flow
     * and maintaining session state across the unified platform.
     */
    accessToken: string
  }
}