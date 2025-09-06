-- ==================================================
-- UNIFIED FINANCIAL SERVICES PLATFORM
-- Authentication Service - Initial Data Seeding
-- ==================================================
-- This file populates the authentication service database with:
-- 1. Default roles for different user categories
-- 2. Comprehensive permissions for platform features
-- 3. Default system administrator user
-- 4. Role-permission mappings for RBAC implementation
-- ==================================================

-- ==================================================
-- ROLES TABLE SEEDING
-- ==================================================
-- Inserting roles based on user groups defined in technical specification
-- Supports Financial Institution Staff, End Customers, Regulatory Users, and System Administrators

INSERT INTO roles (id, name, description, is_active, created_at, updated_at) VALUES
(1, 'SYSTEM_ADMINISTRATOR', 'System administrators with full platform access and administrative privileges', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'FINANCIAL_ADVISOR', 'Financial advisors providing customer guidance and portfolio management', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'RELATIONSHIP_MANAGER', 'Relationship managers handling customer relationships and business development', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'COMPLIANCE_OFFICER', 'Compliance officers ensuring regulatory adherence and risk management', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'RISK_MANAGER', 'Risk managers overseeing risk assessment and mitigation strategies', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'RETAIL_CUSTOMER', 'Individual retail banking customers accessing personal financial services', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'SME_CUSTOMER', 'Small and medium enterprise customers with business banking needs', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'CORPORATE_CUSTOMER', 'Large corporate clients with enterprise financial service requirements', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'REGULATORY_AUDITOR', 'External auditors with read-only access to compliance and reporting data', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'COMPLIANCE_REVIEWER', 'Internal compliance reviewers monitoring regulatory adherence', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'IT_SUPPORT', 'IT support staff with technical system access and troubleshooting privileges', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'SECURITY_TEAM', 'Security team members monitoring platform security and threat detection', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- PERMISSIONS TABLE SEEDING
-- ==================================================
-- Comprehensive permissions covering all platform features as defined in F-001 through F-016
-- Organized by functional domains: Data Management, Risk Management, Compliance, Customer Management, etc.

INSERT INTO permissions (id, name, description, resource, action, is_active, created_at, updated_at) VALUES
-- Data Integration Platform Permissions (F-001)
(1, 'DATA_INTEGRATION_READ', 'Read access to unified data integration platform', 'data_integration', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'DATA_INTEGRATION_WRITE', 'Write access to data integration configurations', 'data_integration', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'DATA_INTEGRATION_ADMIN', 'Administrative access to data integration platform', 'data_integration', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'CUSTOMER_PROFILE_READ', 'Read access to unified customer profiles', 'customer_profiles', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'CUSTOMER_PROFILE_WRITE', 'Write access to customer profile data', 'customer_profiles', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'DATA_SYNC_MONITOR', 'Monitor real-time data synchronization status', 'data_sync', 'MONITOR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- AI-Powered Risk Assessment Permissions (F-002)
(7, 'RISK_ASSESSMENT_READ', 'Read access to risk assessment results and scores', 'risk_assessment', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'RISK_ASSESSMENT_EXECUTE', 'Execute risk assessment models and scoring', 'risk_assessment', 'EXECUTE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'RISK_MODEL_ADMIN', 'Administrative access to risk assessment models', 'risk_models', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'PREDICTIVE_ANALYTICS_READ', 'Read access to predictive risk modeling results', 'predictive_analytics', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'RISK_MITIGATION_WRITE', 'Create and update risk mitigation recommendations', 'risk_mitigation', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regulatory Compliance Automation Permissions (F-003)
(12, 'COMPLIANCE_READ', 'Read access to compliance monitoring and reports', 'compliance', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'COMPLIANCE_WRITE', 'Update compliance policies and configurations', 'compliance', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'COMPLIANCE_ADMIN', 'Administrative access to compliance automation system', 'compliance', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'REGULATORY_REPORTS_READ', 'Read access to regulatory reports and submissions', 'regulatory_reports', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'REGULATORY_REPORTS_GENERATE', 'Generate and submit regulatory reports', 'regulatory_reports', 'GENERATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'AUDIT_TRAIL_READ', 'Read access to audit trails and compliance logs', 'audit_trails', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Digital Customer Onboarding Permissions (F-004)
(18, 'ONBOARDING_READ', 'Read access to customer onboarding status and data', 'onboarding', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 'ONBOARDING_PROCESS', 'Process customer onboarding applications', 'onboarding', 'PROCESS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'KYC_AML_READ', 'Read access to KYC/AML verification results', 'kyc_aml', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'KYC_AML_EXECUTE', 'Execute KYC/AML verification processes', 'kyc_aml', 'EXECUTE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'BIOMETRIC_AUTH_READ', 'Read access to biometric authentication data', 'biometric_auth', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 'DOCUMENT_VERIFICATION_PROCESS', 'Process document verification for customer onboarding', 'document_verification', 'PROCESS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Predictive Analytics Dashboard Permissions (F-005)
(24, 'ANALYTICS_DASHBOARD_READ', 'Read access to predictive analytics dashboards', 'analytics_dashboard', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'ANALYTICS_DASHBOARD_ADMIN', 'Administrative access to analytics dashboard configuration', 'analytics_dashboard', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(26, 'BUSINESS_INTELLIGENCE_READ', 'Read access to business intelligence reports', 'business_intelligence', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Fraud Detection System Permissions (F-006)
(27, 'FRAUD_DETECTION_READ', 'Read access to fraud detection alerts and results', 'fraud_detection', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, 'FRAUD_DETECTION_ADMIN', 'Administrative access to fraud detection system', 'fraud_detection', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(29, 'FRAUD_INVESTIGATION_WRITE', 'Create and update fraud investigation cases', 'fraud_investigation', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Personalized Financial Recommendations Permissions (F-007)
(30, 'FINANCIAL_RECOMMENDATIONS_READ', 'Read access to personalized financial recommendations', 'financial_recommendations', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(31, 'FINANCIAL_RECOMMENDATIONS_GENERATE', 'Generate personalized financial recommendations', 'financial_recommendations', 'GENERATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, 'RECOMMENDATION_ENGINE_ADMIN', 'Administrative access to recommendation engine configuration', 'recommendation_engine', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Real-time Transaction Monitoring Permissions (F-008)
(33, 'TRANSACTION_MONITORING_READ', 'Read access to real-time transaction monitoring', 'transaction_monitoring', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, 'TRANSACTION_MONITORING_ADMIN', 'Administrative access to transaction monitoring system', 'transaction_monitoring', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(35, 'TRANSACTION_ALERTS_MANAGE', 'Manage transaction alerts and notifications', 'transaction_alerts', 'MANAGE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Blockchain Settlement Network Permissions (F-009)
(36, 'BLOCKCHAIN_SETTLEMENT_READ', 'Read access to blockchain settlement network data', 'blockchain_settlement', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(37, 'BLOCKCHAIN_SETTLEMENT_EXECUTE', 'Execute blockchain settlement transactions', 'blockchain_settlement', 'EXECUTE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(38, 'BLOCKCHAIN_SETTLEMENT_ADMIN', 'Administrative access to blockchain settlement network', 'blockchain_settlement', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Smart Contract Management Permissions (F-010)
(39, 'SMART_CONTRACT_READ', 'Read access to smart contract data and status', 'smart_contracts', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(40, 'SMART_CONTRACT_DEPLOY', 'Deploy and execute smart contracts', 'smart_contracts', 'DEPLOY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(41, 'SMART_CONTRACT_ADMIN', 'Administrative access to smart contract management', 'smart_contracts', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Cross-border Payment Processing Permissions (F-011)
(42, 'CROSS_BORDER_PAYMENT_READ', 'Read access to cross-border payment data', 'cross_border_payments', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(43, 'CROSS_BORDER_PAYMENT_PROCESS', 'Process cross-border payment transactions', 'cross_border_payments', 'PROCESS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(44, 'CROSS_BORDER_PAYMENT_ADMIN', 'Administrative access to cross-border payment system', 'cross_border_payments', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Settlement Reconciliation Engine Permissions (F-012)
(45, 'SETTLEMENT_RECONCILIATION_READ', 'Read access to settlement reconciliation data', 'settlement_reconciliation', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(46, 'SETTLEMENT_RECONCILIATION_EXECUTE', 'Execute settlement reconciliation processes', 'settlement_reconciliation', 'EXECUTE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(47, 'SETTLEMENT_RECONCILIATION_ADMIN', 'Administrative access to reconciliation engine', 'settlement_reconciliation', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- User Interface Permissions (F-013 to F-016)
(48, 'CUSTOMER_DASHBOARD_READ', 'Read access to customer dashboard features', 'customer_dashboard', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(49, 'ADVISOR_WORKBENCH_READ', 'Read access to advisor workbench tools', 'advisor_workbench', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(50, 'ADVISOR_WORKBENCH_WRITE', 'Write access to advisor workbench data', 'advisor_workbench', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(51, 'COMPLIANCE_CONTROL_CENTER_READ', 'Read access to compliance control center', 'compliance_control_center', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(52, 'COMPLIANCE_CONTROL_CENTER_ADMIN', 'Administrative access to compliance control center', 'compliance_control_center', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(53, 'RISK_MANAGEMENT_CONSOLE_READ', 'Read access to risk management console', 'risk_management_console', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(54, 'RISK_MANAGEMENT_CONSOLE_ADMIN', 'Administrative access to risk management console', 'risk_management_console', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- System Administration Permissions
(55, 'USER_MANAGEMENT_READ', 'Read access to user management functions', 'user_management', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(56, 'USER_MANAGEMENT_WRITE', 'Create, update, and delete user accounts', 'user_management', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(57, 'ROLE_MANAGEMENT_READ', 'Read access to role and permission management', 'role_management', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(58, 'ROLE_MANAGEMENT_WRITE', 'Create, update, and delete roles and permissions', 'role_management', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(59, 'SYSTEM_CONFIGURATION_READ', 'Read access to system configuration settings', 'system_configuration', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(60, 'SYSTEM_CONFIGURATION_WRITE', 'Update system configuration and settings', 'system_configuration', 'WRITE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(61, 'AUDIT_LOG_READ', 'Read access to system audit logs', 'audit_logs', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(62, 'SECURITY_MONITORING_READ', 'Read access to security monitoring data', 'security_monitoring', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(63, 'SECURITY_MONITORING_ADMIN', 'Administrative access to security monitoring system', 'security_monitoring', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- USERS TABLE SEEDING
-- ==================================================
-- Creating default system administrator user for initial platform setup
-- Password is hashed using BCrypt (password: Admin@123!)

INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, is_email_verified, failed_login_attempts, account_locked_until, created_at, updated_at, last_login_at) VALUES
(1, 'admin', 'admin@unifiedfinancialservices.com', '$2a$12$LQv3c1yqBwWVHEUNOFo4VO1WmV7e2GZjAMz3kLq3MJdDmJVk5pPqm', 'System', 'Administrator', true, true, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- ==================================================
-- USER_ROLES TABLE SEEDING
-- ==================================================
-- Assigning SYSTEM_ADMINISTRATOR role to the default admin user

INSERT INTO user_roles (id, user_id, role_id, assigned_at, assigned_by, is_active) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, 1, true);

-- ==================================================
-- ROLE_PERMISSIONS TABLE SEEDING
-- ==================================================
-- Comprehensive role-permission mappings supporting RBAC for all user categories
-- Each role receives appropriate permissions based on their functional responsibilities

-- SYSTEM_ADMINISTRATOR - Full platform access
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(1, 1, 1, CURRENT_TIMESTAMP, 1, true),   -- DATA_INTEGRATION_READ
(2, 1, 2, CURRENT_TIMESTAMP, 1, true),   -- DATA_INTEGRATION_WRITE
(3, 1, 3, CURRENT_TIMESTAMP, 1, true),   -- DATA_INTEGRATION_ADMIN
(4, 1, 4, CURRENT_TIMESTAMP, 1, true),   -- CUSTOMER_PROFILE_READ
(5, 1, 5, CURRENT_TIMESTAMP, 1, true),   -- CUSTOMER_PROFILE_WRITE
(6, 1, 6, CURRENT_TIMESTAMP, 1, true),   -- DATA_SYNC_MONITOR
(7, 1, 9, CURRENT_TIMESTAMP, 1, true),   -- RISK_MODEL_ADMIN
(8, 1, 14, CURRENT_TIMESTAMP, 1, true),  -- COMPLIANCE_ADMIN
(9, 1, 25, CURRENT_TIMESTAMP, 1, true),  -- ANALYTICS_DASHBOARD_ADMIN
(10, 1, 28, CURRENT_TIMESTAMP, 1, true), -- FRAUD_DETECTION_ADMIN
(11, 1, 32, CURRENT_TIMESTAMP, 1, true), -- RECOMMENDATION_ENGINE_ADMIN
(12, 1, 34, CURRENT_TIMESTAMP, 1, true), -- TRANSACTION_MONITORING_ADMIN
(13, 1, 38, CURRENT_TIMESTAMP, 1, true), -- BLOCKCHAIN_SETTLEMENT_ADMIN
(14, 1, 41, CURRENT_TIMESTAMP, 1, true), -- SMART_CONTRACT_ADMIN
(15, 1, 44, CURRENT_TIMESTAMP, 1, true), -- CROSS_BORDER_PAYMENT_ADMIN
(16, 1, 47, CURRENT_TIMESTAMP, 1, true), -- SETTLEMENT_RECONCILIATION_ADMIN
(17, 1, 52, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_CONTROL_CENTER_ADMIN
(18, 1, 54, CURRENT_TIMESTAMP, 1, true), -- RISK_MANAGEMENT_CONSOLE_ADMIN
(19, 1, 55, CURRENT_TIMESTAMP, 1, true), -- USER_MANAGEMENT_READ
(20, 1, 56, CURRENT_TIMESTAMP, 1, true), -- USER_MANAGEMENT_WRITE
(21, 1, 57, CURRENT_TIMESTAMP, 1, true), -- ROLE_MANAGEMENT_READ
(22, 1, 58, CURRENT_TIMESTAMP, 1, true), -- ROLE_MANAGEMENT_WRITE
(23, 1, 59, CURRENT_TIMESTAMP, 1, true), -- SYSTEM_CONFIGURATION_READ
(24, 1, 60, CURRENT_TIMESTAMP, 1, true), -- SYSTEM_CONFIGURATION_WRITE
(25, 1, 61, CURRENT_TIMESTAMP, 1, true), -- AUDIT_LOG_READ
(26, 1, 62, CURRENT_TIMESTAMP, 1, true), -- SECURITY_MONITORING_READ
(27, 1, 63, CURRENT_TIMESTAMP, 1, true); -- SECURITY_MONITORING_ADMIN

-- FINANCIAL_ADVISOR - Customer advisory and portfolio management permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(28, 2, 4, CURRENT_TIMESTAMP, 1, true),  -- CUSTOMER_PROFILE_READ
(29, 2, 5, CURRENT_TIMESTAMP, 1, true),  -- CUSTOMER_PROFILE_WRITE
(30, 2, 7, CURRENT_TIMESTAMP, 1, true),  -- RISK_ASSESSMENT_READ
(31, 2, 10, CURRENT_TIMESTAMP, 1, true), -- PREDICTIVE_ANALYTICS_READ
(32, 2, 24, CURRENT_TIMESTAMP, 1, true), -- ANALYTICS_DASHBOARD_READ
(33, 2, 30, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_READ
(34, 2, 31, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_GENERATE
(35, 2, 49, CURRENT_TIMESTAMP, 1, true), -- ADVISOR_WORKBENCH_READ
(36, 2, 50, CURRENT_TIMESTAMP, 1, true); -- ADVISOR_WORKBENCH_WRITE

-- RELATIONSHIP_MANAGER - Customer relationship and business development permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(37, 3, 4, CURRENT_TIMESTAMP, 1, true),  -- CUSTOMER_PROFILE_READ
(38, 3, 5, CURRENT_TIMESTAMP, 1, true),  -- CUSTOMER_PROFILE_WRITE
(39, 3, 7, CURRENT_TIMESTAMP, 1, true),  -- RISK_ASSESSMENT_READ
(40, 3, 18, CURRENT_TIMESTAMP, 1, true), -- ONBOARDING_READ
(41, 3, 19, CURRENT_TIMESTAMP, 1, true), -- ONBOARDING_PROCESS
(42, 3, 24, CURRENT_TIMESTAMP, 1, true), -- ANALYTICS_DASHBOARD_READ
(43, 3, 30, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_READ
(44, 3, 49, CURRENT_TIMESTAMP, 1, true), -- ADVISOR_WORKBENCH_READ
(45, 3, 50, CURRENT_TIMESTAMP, 1, true); -- ADVISOR_WORKBENCH_WRITE

-- COMPLIANCE_OFFICER - Regulatory compliance and monitoring permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(46, 4, 12, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_READ
(47, 4, 13, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_WRITE
(48, 4, 15, CURRENT_TIMESTAMP, 1, true), -- REGULATORY_REPORTS_READ
(49, 4, 16, CURRENT_TIMESTAMP, 1, true), -- REGULATORY_REPORTS_GENERATE
(50, 4, 17, CURRENT_TIMESTAMP, 1, true), -- AUDIT_TRAIL_READ
(51, 4, 20, CURRENT_TIMESTAMP, 1, true), -- KYC_AML_READ
(52, 4, 21, CURRENT_TIMESTAMP, 1, true), -- KYC_AML_EXECUTE
(53, 4, 51, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_CONTROL_CENTER_READ
(54, 4, 61, CURRENT_TIMESTAMP, 1, true); -- AUDIT_LOG_READ

-- RISK_MANAGER - Risk assessment and management permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(55, 5, 7, CURRENT_TIMESTAMP, 1, true),  -- RISK_ASSESSMENT_READ
(56, 5, 8, CURRENT_TIMESTAMP, 1, true),  -- RISK_ASSESSMENT_EXECUTE
(57, 5, 10, CURRENT_TIMESTAMP, 1, true), -- PREDICTIVE_ANALYTICS_READ
(58, 5, 11, CURRENT_TIMESTAMP, 1, true), -- RISK_MITIGATION_WRITE
(59, 5, 24, CURRENT_TIMESTAMP, 1, true), -- ANALYTICS_DASHBOARD_READ
(60, 5, 27, CURRENT_TIMESTAMP, 1, true), -- FRAUD_DETECTION_READ
(61, 5, 29, CURRENT_TIMESTAMP, 1, true), -- FRAUD_INVESTIGATION_WRITE
(62, 5, 33, CURRENT_TIMESTAMP, 1, true), -- TRANSACTION_MONITORING_READ
(63, 5, 53, CURRENT_TIMESTAMP, 1, true); -- RISK_MANAGEMENT_CONSOLE_READ

-- RETAIL_CUSTOMER - Personal banking customer permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(64, 6, 30, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_READ
(65, 6, 48, CURRENT_TIMESTAMP, 1, true); -- CUSTOMER_DASHBOARD_READ

-- SME_CUSTOMER - Small and medium enterprise customer permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(66, 7, 30, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_READ
(67, 7, 42, CURRENT_TIMESTAMP, 1, true), -- CROSS_BORDER_PAYMENT_READ
(68, 7, 48, CURRENT_TIMESTAMP, 1, true); -- CUSTOMER_DASHBOARD_READ

-- CORPORATE_CUSTOMER - Enterprise customer permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(69, 8, 24, CURRENT_TIMESTAMP, 1, true), -- ANALYTICS_DASHBOARD_READ
(70, 8, 30, CURRENT_TIMESTAMP, 1, true), -- FINANCIAL_RECOMMENDATIONS_READ
(71, 8, 36, CURRENT_TIMESTAMP, 1, true), -- BLOCKCHAIN_SETTLEMENT_READ
(72, 8, 42, CURRENT_TIMESTAMP, 1, true), -- CROSS_BORDER_PAYMENT_READ
(73, 8, 45, CURRENT_TIMESTAMP, 1, true), -- SETTLEMENT_RECONCILIATION_READ
(74, 8, 48, CURRENT_TIMESTAMP, 1, true); -- CUSTOMER_DASHBOARD_READ

-- REGULATORY_AUDITOR - External auditor read-only permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(75, 9, 12, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_READ
(76, 9, 15, CURRENT_TIMESTAMP, 1, true), -- REGULATORY_REPORTS_READ
(77, 9, 17, CURRENT_TIMESTAMP, 1, true), -- AUDIT_TRAIL_READ
(78, 9, 51, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_CONTROL_CENTER_READ
(79, 9, 61, CURRENT_TIMESTAMP, 1, true); -- AUDIT_LOG_READ

-- COMPLIANCE_REVIEWER - Internal compliance monitoring permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(80, 10, 12, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_READ
(81, 10, 13, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_WRITE
(82, 10, 15, CURRENT_TIMESTAMP, 1, true), -- REGULATORY_REPORTS_READ
(83, 10, 17, CURRENT_TIMESTAMP, 1, true), -- AUDIT_TRAIL_READ
(84, 10, 20, CURRENT_TIMESTAMP, 1, true), -- KYC_AML_READ
(85, 10, 51, CURRENT_TIMESTAMP, 1, true), -- COMPLIANCE_CONTROL_CENTER_READ
(86, 10, 61, CURRENT_TIMESTAMP, 1, true); -- AUDIT_LOG_READ

-- IT_SUPPORT - Technical support and troubleshooting permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(87, 11, 1, CURRENT_TIMESTAMP, 1, true),  -- DATA_INTEGRATION_READ
(88, 11, 6, CURRENT_TIMESTAMP, 1, true),  -- DATA_SYNC_MONITOR
(89, 11, 55, CURRENT_TIMESTAMP, 1, true), -- USER_MANAGEMENT_READ
(90, 11, 59, CURRENT_TIMESTAMP, 1, true), -- SYSTEM_CONFIGURATION_READ
(91, 11, 61, CURRENT_TIMESTAMP, 1, true); -- AUDIT_LOG_READ

-- SECURITY_TEAM - Security monitoring and threat management permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, is_active) VALUES
(92, 12, 27, CURRENT_TIMESTAMP, 1, true), -- FRAUD_DETECTION_READ
(93, 12, 29, CURRENT_TIMESTAMP, 1, true), -- FRAUD_INVESTIGATION_WRITE
(94, 12, 33, CURRENT_TIMESTAMP, 1, true), -- TRANSACTION_MONITORING_READ
(95, 12, 35, CURRENT_TIMESTAMP, 1, true), -- TRANSACTION_ALERTS_MANAGE
(96, 12, 61, CURRENT_TIMESTAMP, 1, true), -- AUDIT_LOG_READ
(97, 12, 62, CURRENT_TIMESTAMP, 1, true), -- SECURITY_MONITORING_READ
(98, 12, 63, CURRENT_TIMESTAMP, 1, true); -- SECURITY_MONITORING_ADMIN

-- ==================================================
-- FINAL SEQUENCE ADJUSTMENTS
-- ==================================================
-- Adjusting sequences to accommodate the seeded data for proper auto-increment functionality

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('user_roles_id_seq', (SELECT MAX(id) FROM user_roles));
SELECT setval('role_permissions_id_seq', (SELECT MAX(id) FROM role_permissions));

-- ==================================================
-- DATA SEEDING COMPLETION
-- ==================================================
-- Initial data seeding completed successfully
-- Default admin user: admin@unifiedfinancialservices.com (password: Admin@123!)
-- RBAC system fully configured with 12 roles and 63 permissions
-- All user categories properly mapped to appropriate permissions
-- System ready for Unified Financial Services Platform deployment
-- ==================================================