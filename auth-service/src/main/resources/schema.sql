-- =============================================================================
-- Authentication Service Database Schema
-- =============================================================================
-- This schema provides the foundational structure for user authentication and 
-- authorization within the Unified Financial Services Platform.
-- 
-- Supports:
-- - OAuth2 authentication workflows
-- - Role-Based Access Control (RBAC)
-- - Multi-Factor Authentication (MFA) 
-- - Digital Customer Onboarding (F-004)
-- - Enterprise-grade security and compliance
-- =============================================================================

-- Enable UUID generation extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Stores core user account information, credentials, and account status.
-- This table serves as the primary entity for customer information upon 
-- successful digital onboarding and identity verification.
-- =============================================================================

CREATE TABLE users (
    -- Primary identifier using UUID for enhanced security and scalability
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Unique username for login authentication
    -- Supports both email-based and custom username login scenarios
    username VARCHAR(255) UNIQUE NOT NULL,
    
    -- Encrypted password hash - never store plain text passwords
    -- Supports bcrypt, scrypt, or other enterprise-grade hashing algorithms
    password VARCHAR(255) NOT NULL,
    
    -- User email address - required for communication and recovery
    -- Must be unique to prevent duplicate accounts
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Account activation status for compliance and security
    -- Supports account deactivation without data deletion
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Audit trail: Record creation timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Audit trail: Last modification timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Additional security and compliance fields
    -- Last successful login for security monitoring
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Failed login attempts counter for brute force protection
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    
    -- Account lockout timestamp for security
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Password expiration for compliance requirements
    password_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Email verification status for digital onboarding
    email_verified BOOLEAN DEFAULT false NOT NULL,
    
    -- Email verification token for secure verification process
    email_verification_token VARCHAR(255),
    
    -- Password reset token for secure password recovery
    password_reset_token VARCHAR(255),
    
    -- Password reset token expiration
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Multi-factor authentication enablement
    mfa_enabled BOOLEAN DEFAULT false NOT NULL,
    
    -- MFA secret key for TOTP/HOTP authentication
    mfa_secret VARCHAR(255),
    
    -- Customer onboarding completion status
    onboarding_completed BOOLEAN DEFAULT false NOT NULL,
    
    -- KYC/AML verification status
    kyc_status VARCHAR(50) DEFAULT 'pending' NOT NULL 
        CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected', 'expired')),
    
    -- Terms of service acceptance timestamp
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Privacy policy acceptance timestamp  
    privacy_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Regulatory compliance flags
    pep_status BOOLEAN DEFAULT false NOT NULL, -- Politically Exposed Person
    sanctions_checked BOOLEAN DEFAULT false NOT NULL,
    sanctions_checked_at TIMESTAMP WITH TIME ZONE,
    
    -- Customer profile metadata
    customer_type VARCHAR(50) DEFAULT 'individual' NOT NULL
        CHECK (customer_type IN ('individual', 'business', 'corporate', 'institutional')),
    
    -- Risk assessment score (0-100)
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- Account tier for service differentiation
    account_tier VARCHAR(50) DEFAULT 'basic' NOT NULL
        CHECK (account_tier IN ('basic', 'premium', 'enterprise', 'institutional'))
);

-- =============================================================================
-- ROLES TABLE
-- =============================================================================
-- Stores user roles within the system to support Role-Based Access Control.
-- Roles define what level of access and permissions users have within the platform.
-- =============================================================================

CREATE TABLE roles (
    -- Primary identifier using UUID for consistency
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Role name - must be unique and descriptive
    -- Examples: CUSTOMER, ADVISOR, ADMIN, COMPLIANCE_OFFICER
    name VARCHAR(255) UNIQUE NOT NULL,
    
    -- Human-readable description of the role
    description TEXT,
    
    -- Role hierarchy level for permission inheritance
    hierarchy_level INTEGER DEFAULT 0 NOT NULL,
    
    -- Role type categorization
    role_type VARCHAR(50) DEFAULT 'user' NOT NULL
        CHECK (role_type IN ('system', 'user', 'service', 'admin')),
    
    -- Role activation status
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Regulatory compliance requirement
    requires_compliance_approval BOOLEAN DEFAULT false NOT NULL,
    
    -- Maximum session duration for security (in minutes)
    max_session_duration INTEGER DEFAULT 480, -- 8 hours default
    
    -- Audit trail timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Role creator for audit purposes
    created_by UUID,
    
    -- Role last modifier for audit purposes
    updated_by UUID
);

-- =============================================================================
-- PERMISSIONS TABLE  
-- =============================================================================
-- Stores granular permissions that can be assigned to roles.
-- Supports fine-grained access control for different system functions.
-- =============================================================================

CREATE TABLE permissions (
    -- Primary identifier using UUID for consistency
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Permission name - must be unique and descriptive
    -- Examples: users:read, accounts:write, transactions:approve
    name VARCHAR(255) UNIQUE NOT NULL,
    
    -- Human-readable description of the permission
    description TEXT,
    
    -- Permission category for organization
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    
    -- Resource type this permission applies to
    resource_type VARCHAR(100) NOT NULL,
    
    -- Action type (create, read, update, delete, execute, approve)
    action VARCHAR(50) NOT NULL
        CHECK (action IN ('create', 'read', 'update', 'delete', 'execute', 'approve', 'reject')),
        
    -- Scope of permission (own, team, department, organization, system)
    scope VARCHAR(50) DEFAULT 'own' NOT NULL
        CHECK (scope IN ('own', 'team', 'department', 'organization', 'system')),
    
    -- Permission activation status
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Regulatory compliance requirement
    requires_compliance_approval BOOLEAN DEFAULT false NOT NULL,
    
    -- Risk level associated with this permission
    risk_level VARCHAR(20) DEFAULT 'low' NOT NULL
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Audit trail timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Permission creator for audit purposes
    created_by UUID,
    
    -- Permission last modifier for audit purposes
    updated_by UUID
);

-- =============================================================================
-- USER_ROLES TABLE
-- =============================================================================
-- Junction table to support many-to-many relationship between users and roles.
-- Enables flexible role assignment and supports multiple roles per user.
-- =============================================================================

CREATE TABLE user_roles (
    -- Foreign key to users table with cascade delete
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Foreign key to roles table with cascade delete  
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Composite primary key ensures no duplicate role assignments
    PRIMARY KEY (user_id, role_id),
    
    -- Role assignment timestamp for audit trail
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Role assignment expiration for temporary access
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Who assigned this role (for audit purposes)
    assigned_by UUID REFERENCES users(id),
    
    -- Assignment status (active, suspended, expired)
    status VARCHAR(20) DEFAULT 'active' NOT NULL
        CHECK (status IN ('active', 'suspended', 'expired')),
    
    -- Justification for role assignment
    assignment_reason TEXT,
    
    -- Approval status for high-privilege roles
    approval_status VARCHAR(20) DEFAULT 'approved' NOT NULL
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    -- Approver for high-privilege role assignments
    approved_by UUID REFERENCES users(id),
    
    -- Approval timestamp
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Last modification timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- ROLE_PERMISSIONS TABLE
-- =============================================================================  
-- Junction table to support many-to-many relationship between roles and permissions.
-- Enables flexible permission assignment and supports granular access control.
-- =============================================================================

CREATE TABLE role_permissions (
    -- Foreign key to roles table with cascade delete
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Foreign key to permissions table with cascade delete
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    -- Composite primary key ensures no duplicate permission assignments
    PRIMARY KEY (role_id, permission_id),
    
    -- Permission assignment timestamp for audit trail
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Permission assignment expiration for temporary access
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Who assigned this permission (for audit purposes)
    assigned_by UUID REFERENCES users(id),
    
    -- Assignment status (active, suspended, expired)
    status VARCHAR(20) DEFAULT 'active' NOT NULL
        CHECK (status IN ('active', 'suspended', 'expired')),
    
    -- Justification for permission assignment
    assignment_reason TEXT,
    
    -- Approval status for high-privilege permissions
    approval_status VARCHAR(20) DEFAULT 'approved' NOT NULL
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    -- Approver for high-privilege permission assignments
    approved_by UUID REFERENCES users(id),
    
    -- Approval timestamp
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Last modification timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
-- Strategic indexes to optimize common query patterns and improve performance
-- for authentication, authorization, and user management operations.
-- =============================================================================

-- Users table indexes for authentication performance
CREATE INDEX idx_users_username ON users(username) WHERE is_active = true;
CREATE INDEX idx_users_email ON users(email) WHERE is_active = true;
CREATE INDEX idx_users_email_verified ON users(email_verified, is_active);
CREATE INDEX idx_users_mfa_enabled ON users(mfa_enabled, is_active);
CREATE INDEX idx_users_kyc_status ON users(kyc_status, is_active);
CREATE INDEX idx_users_customer_type ON users(customer_type, is_active);
CREATE INDEX idx_users_risk_score ON users(risk_score, is_active);
CREATE INDEX idx_users_last_login ON users(last_login) WHERE is_active = true;
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_password_expires ON users(password_expires_at) WHERE password_expires_at IS NOT NULL;

-- Roles table indexes for authorization performance
CREATE INDEX idx_roles_name ON roles(name) WHERE is_active = true;
CREATE INDEX idx_roles_type ON roles(role_type, is_active);
CREATE INDEX idx_roles_hierarchy ON roles(hierarchy_level, is_active);
CREATE INDEX idx_roles_compliance ON roles(requires_compliance_approval, is_active);

-- Permissions table indexes for authorization performance  
CREATE INDEX idx_permissions_name ON permissions(name) WHERE is_active = true;
CREATE INDEX idx_permissions_category ON permissions(category, is_active);
CREATE INDEX idx_permissions_resource_type ON permissions(resource_type, is_active);
CREATE INDEX idx_permissions_action ON permissions(action, is_active);
CREATE INDEX idx_permissions_scope ON permissions(scope, is_active);
CREATE INDEX idx_permissions_risk_level ON permissions(risk_level, is_active);

-- User roles indexes for role-based queries
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id) WHERE status = 'active';
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id) WHERE status = 'active';
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_roles_assigned_by ON user_roles(assigned_by);
CREATE INDEX idx_user_roles_approval_status ON user_roles(approval_status, status);

-- Role permissions indexes for permission-based queries
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id) WHERE status = 'active';
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id) WHERE status = 'active';
CREATE INDEX idx_role_permissions_expires_at ON role_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_role_permissions_assigned_by ON role_permissions(assigned_by);
CREATE INDEX idx_role_permissions_approval_status ON role_permissions(approval_status, status);

-- Composite indexes for complex authorization queries
CREATE INDEX idx_user_roles_permissions ON user_roles(user_id, role_id) 
    WHERE status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

-- =============================================================================
-- AUDIT TRIGGERS
-- =============================================================================
-- Automatic timestamp updates for audit trail maintenance
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at 
    BEFORE UPDATE ON role_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Initial system roles and permissions for platform operation
-- =============================================================================

-- Insert default system roles
INSERT INTO roles (name, description, role_type, hierarchy_level, requires_compliance_approval, max_session_duration) VALUES
('SYSTEM_ADMIN', 'System Administrator with full access', 'admin', 100, true, 240),
('COMPLIANCE_OFFICER', 'Compliance and regulatory oversight', 'admin', 90, true, 480),
('CUSTOMER_ADVISOR', 'Customer service and advisory roles', 'user', 50, false, 480),
('CUSTOMER', 'Standard customer account', 'user', 10, false, 480),
('GUEST', 'Limited access guest account', 'user', 0, false, 60),
('API_SERVICE', 'Service-to-service authentication', 'service', 80, true, 1440),
('AUDITOR', 'Read-only audit and compliance access', 'user', 70, true, 480),
('RISK_MANAGER', 'Risk assessment and management', 'user', 80, true, 480),
('OPERATIONS', 'Operational management access', 'user', 60, false, 480),
('DEVELOPER', 'Development and testing access', 'user', 40, false, 480);

-- Insert default system permissions
INSERT INTO permissions (name, description, category, resource_type, action, scope, risk_level, requires_compliance_approval) VALUES
-- User management permissions
('users:read', 'View user information', 'user_management', 'user', 'read', 'own', 'low', false),
('users:read:all', 'View all user information', 'user_management', 'user', 'read', 'system', 'medium', true),
('users:create', 'Create new users', 'user_management', 'user', 'create', 'organization', 'medium', true),
('users:update', 'Update user information', 'user_management', 'user', 'update', 'own', 'low', false),
('users:update:all', 'Update any user information', 'user_management', 'user', 'update', 'system', 'high', true),
('users:delete', 'Delete user accounts', 'user_management', 'user', 'delete', 'system', 'critical', true),

-- Role management permissions
('roles:read', 'View roles', 'role_management', 'role', 'read', 'organization', 'low', false),
('roles:create', 'Create new roles', 'role_management', 'role', 'create', 'organization', 'high', true),
('roles:update', 'Update roles', 'role_management', 'role', 'update', 'organization', 'high', true),
('roles:delete', 'Delete roles', 'role_management', 'role', 'delete', 'organization', 'critical', true),
('roles:assign', 'Assign roles to users', 'role_management', 'role', 'execute', 'organization', 'medium', true),

-- Permission management permissions
('permissions:read', 'View permissions', 'permission_management', 'permission', 'read', 'organization', 'low', false),
('permissions:create', 'Create new permissions', 'permission_management', 'permission', 'create', 'system', 'critical', true),
('permissions:update', 'Update permissions', 'permission_management', 'permission', 'update', 'system', 'critical', true),
('permissions:delete', 'Delete permissions', 'permission_management', 'permission', 'delete', 'system', 'critical', true),
('permissions:assign', 'Assign permissions to roles', 'permission_management', 'permission', 'execute', 'system', 'high', true),

-- Authentication permissions
('auth:login', 'User authentication', 'authentication', 'session', 'create', 'own', 'low', false),
('auth:logout', 'User logout', 'authentication', 'session', 'delete', 'own', 'low', false),
('auth:mfa', 'Multi-factor authentication', 'authentication', 'mfa', 'execute', 'own', 'medium', false),
('auth:password_reset', 'Password reset functionality', 'authentication', 'password', 'update', 'own', 'medium', false),

-- Financial operations permissions
('accounts:read', 'View account information', 'financial', 'account', 'read', 'own', 'low', false),
('accounts:read:all', 'View all account information', 'financial', 'account', 'read', 'system', 'high', true),
('transactions:read', 'View transaction history', 'financial', 'transaction', 'read', 'own', 'low', false),
('transactions:create', 'Create transactions', 'financial', 'transaction', 'create', 'own', 'medium', false),
('transactions:approve', 'Approve transactions', 'financial', 'transaction', 'approve', 'organization', 'high', true),

-- Compliance and audit permissions
('audit:read', 'View audit logs', 'compliance', 'audit', 'read', 'organization', 'medium', true),
('compliance:read', 'View compliance reports', 'compliance', 'report', 'read', 'organization', 'medium', true),
('compliance:create', 'Create compliance reports', 'compliance', 'report', 'create', 'organization', 'medium', true),

-- System administration permissions
('system:read', 'View system information', 'system', 'system', 'read', 'system', 'medium', true),
('system:update', 'Update system configuration', 'system', 'system', 'update', 'system', 'critical', true),
('system:backup', 'System backup operations', 'system', 'backup', 'execute', 'system', 'high', true),
('system:monitoring', 'System monitoring access', 'system', 'monitoring', 'read', 'system', 'medium', true);

-- Assign permissions to roles
-- SYSTEM_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id, assigned_by)
SELECT 
    r.id as role_id,
    p.id as permission_id,
    NULL as assigned_by
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SYSTEM_ADMIN';

-- CUSTOMER gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'CUSTOMER' 
AND p.name IN (
    'users:read',
    'users:update',
    'auth:login',
    'auth:logout',
    'auth:mfa',
    'auth:password_reset',
    'accounts:read',
    'transactions:read',
    'transactions:create'
);

-- CUSTOMER_ADVISOR gets customer service permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'CUSTOMER_ADVISOR'
AND p.name IN (
    'users:read',
    'users:update',
    'users:read:all',
    'auth:login',
    'auth:logout',
    'auth:password_reset',
    'accounts:read',
    'accounts:read:all',
    'transactions:read',
    'transactions:create'
);

-- COMPLIANCE_OFFICER gets compliance and audit permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'COMPLIANCE_OFFICER'
AND p.name LIKE '%compliance%' OR p.name LIKE '%audit%' OR p.name LIKE '%users:read%';

-- =============================================================================
-- SECURITY POLICIES
-- =============================================================================
-- Row-level security policies for enhanced data protection
-- =============================================================================

-- Enable row-level security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data unless they have admin privileges
CREATE POLICY users_own_data ON users
    FOR ALL USING (
        id = current_setting('app.current_user_id')::UUID 
        OR EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.current_user_id')::UUID
            AND r.name IN ('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
            AND ur.status = 'active'
        )
    );

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================
-- Optimized views for frequently accessed data patterns
-- =============================================================================

-- View for active users with their roles
CREATE VIEW v_users_with_roles AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.is_active,
    u.kyc_status,
    u.customer_type,
    u.risk_score,
    u.last_login,
    u.created_at,
    r.name as role_name,
    r.role_type,
    r.hierarchy_level,
    ur.assigned_at as role_assigned_at,
    ur.expires_at as role_expires_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.is_active = true 
AND ur.status = 'active'
AND r.is_active = true
AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP);

-- View for user permissions (flattened)
CREATE VIEW v_user_permissions AS
SELECT DISTINCT
    u.id as user_id,
    u.username,
    u.email,
    p.name as permission_name,
    p.resource_type,
    p.action,
    p.scope,
    p.risk_level,
    r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.is_active = true
AND ur.status = 'active'
AND r.is_active = true
AND rp.status = 'active'
AND p.is_active = true
AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
AND (rp.expires_at IS NULL OR rp.expires_at > CURRENT_TIMESTAMP);

-- =============================================================================
-- STORED PROCEDURES
-- =============================================================================
-- Common authentication and authorization procedures
-- =============================================================================

-- Procedure to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_permission_name VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    permission_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM v_user_permissions
        WHERE user_id = p_user_id
        AND permission_name = p_permission_name
        AND (p_resource_type IS NULL OR resource_type = p_resource_type)
    ) INTO permission_exists;
    
    RETURN permission_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_name VARCHAR,
    resource_type VARCHAR,
    action VARCHAR,
    scope VARCHAR,
    risk_level VARCHAR,
    granted_via_role VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.permission_name,
        p.resource_type,
        p.action,
        p.scope,
        p.risk_level,
        p.role_name as granted_via_role
    FROM v_user_permissions p
    WHERE p.user_id = p_user_id
    ORDER BY p.risk_level DESC, p.permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CLEANUP AND MAINTENANCE
-- =============================================================================
-- Procedures for data maintenance and cleanup
-- =============================================================================

-- Procedure to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS INTEGER AS $$
DECLARE
    rows_affected INTEGER := 0;
BEGIN
    -- Clean up expired password reset tokens
    UPDATE users 
    SET password_reset_token = NULL,
        password_reset_expires_at = NULL
    WHERE password_reset_expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Clean up expired role assignments
    UPDATE user_roles 
    SET status = 'expired'
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND status = 'active';
    
    -- Clean up expired permission assignments
    UPDATE role_permissions 
    SET status = 'expired'
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND status = 'active';
    
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SCHEMA VALIDATION
-- =============================================================================
-- Final validation and comments
-- =============================================================================

-- Add table comments for documentation
COMMENT ON TABLE users IS 'Core user accounts and authentication data';
COMMENT ON TABLE roles IS 'System roles for role-based access control';
COMMENT ON TABLE permissions IS 'Granular permissions for fine-grained access control';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';

-- Schema creation completed successfully
-- This schema supports OAuth2, RBAC, MFA, and regulatory compliance requirements
-- for the Unified Financial Services Platform authentication service.