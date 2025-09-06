-- ================================================================
-- PostgreSQL Database Initialization Script
-- Unified Financial Services Platform (UFS)
-- 
-- This script initializes the PostgreSQL database for the UFS platform,
-- creating the necessary roles, database, schemas, and tables for all 
-- backend microservices as per the technical specification.
-- ================================================================

-- ================================================================
-- SECTION 1: ROLE CREATION
-- ================================================================

-- Create administrative role for the UFS platform
CREATE ROLE IF NOT EXISTS ufs_admin WITH
    LOGIN
    SUPERUSER
    CREATEDB
    CREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT -1
    PASSWORD 'ufs_admin_secure_password_2024!';

-- Create application user role with limited privileges
CREATE ROLE IF NOT EXISTS ufs_user WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT 100
    PASSWORD 'ufs_user_secure_password_2024!';

-- Create read-only role for reporting and analytics
CREATE ROLE IF NOT EXISTS ufs_reader WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT 50
    PASSWORD 'ufs_reader_secure_password_2024!';

-- ================================================================
-- SECTION 2: DATABASE CREATION
-- ================================================================

-- Create the main UFS database
CREATE DATABASE ufs_db WITH
    OWNER = ufs_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Connect to the UFS database for schema and table creation
\c ufs_db;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- SECTION 3: AUTHENTICATION SERVICE SCHEMA
-- ================================================================

-- Create schema for authentication service
CREATE SCHEMA IF NOT EXISTS auth_service AUTHORIZATION ufs_admin;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS auth_service.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED')),
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS auth_service.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS auth_service.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS auth_service.user_roles (
    user_id UUID REFERENCES auth_service.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES auth_service.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth_service.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, role_id)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS auth_service.role_permissions (
    role_id UUID REFERENCES auth_service.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES auth_service.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- OAuth tokens table for API authentication
CREATE TABLE IF NOT EXISTS auth_service.oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth_service.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(1000) NOT NULL,
    refresh_token VARCHAR(1000),
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session management table
CREATE TABLE IF NOT EXISTS auth_service.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth_service.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 4: CUSTOMER SERVICE SCHEMA
-- ================================================================

-- Create schema for customer service
CREATE SCHEMA IF NOT EXISTS customer_service AUTHORIZATION ufs_admin;

-- Customers table for core customer information
CREATE TABLE IF NOT EXISTS customer_service.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    nationality VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    customer_type VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS', 'CORPORATE')),
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer profiles table for extended customer information
CREATE TABLE IF NOT EXISTS customer_service.customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID UNIQUE REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    communication_preferences JSONB DEFAULT '{}',
    financial_information JSONB DEFAULT '{}',
    employment_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer addresses table for multiple address support
CREATE TABLE IF NOT EXISTS customer_service.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL CHECK (address_type IN ('PRIMARY', 'BILLING', 'MAILING', 'BUSINESS')),
    street_address_1 VARCHAR(255) NOT NULL,
    street_address_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KYC documents table for compliance
CREATE TABLE IF NOT EXISTS customer_service.kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    document_type VARCHAR(255) NOT NULL CHECK (document_type IN ('DRIVER_LICENSE', 'PASSPORT', 'NATIONAL_ID', 'UTILITY_BILL', 'BANK_STATEMENT', 'OTHER')),
    document_number VARCHAR(255),
    document_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    verification_notes TEXT,
    verified_by UUID REFERENCES auth_service.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer onboarding status tracking
CREATE TABLE IF NOT EXISTS customer_service.onboarding_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID UNIQUE REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED' CHECK (status IN ('STARTED', 'IDENTITY_VERIFICATION', 'DOCUMENT_UPLOAD', 'KYC_REVIEW', 'RISK_ASSESSMENT', 'APPROVED', 'REJECTED')),
    current_step VARCHAR(50) NOT NULL DEFAULT 'REGISTRATION',
    completed_steps JSONB DEFAULT '[]',
    step_data JSONB DEFAULT '{}',
    rejection_reason TEXT,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer accounts table
CREATE TABLE IF NOT EXISTS customer_service.customer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT', 'LOAN')),
    account_name VARCHAR(255),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0.00,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED')),
    opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
    closed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 5: TRANSACTION SERVICE SCHEMA
-- ================================================================

-- Create schema for transaction service
CREATE SCHEMA IF NOT EXISTS transaction_service AUTHORIZATION ufs_admin;

-- Transactions table for all financial transactions
CREATE TABLE IF NOT EXISTS transaction_service.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_service.customers(id),
    account_id UUID REFERENCES customer_service.customer_accounts(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'FEE', 'INTEREST', 'ADJUSTMENT')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    reference_number VARCHAR(100),
    external_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED')),
    processing_date TIMESTAMP WITH TIME ZONE,
    settlement_date TIMESTAMP WITH TIME ZONE,
    channel VARCHAR(50) CHECK (channel IN ('ONLINE', 'MOBILE', 'ATM', 'BRANCH', 'API', 'BATCH')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment processing table
CREATE TABLE IF NOT EXISTS transaction_service.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transaction_service.transactions(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CARD', 'ACH', 'WIRE', 'CHECK', 'CASH', 'DIGITAL_WALLET')),
    from_account_id UUID REFERENCES customer_service.customer_accounts(id),
    to_account_id UUID REFERENCES customer_service.customer_accounts(id),
    from_customer_id UUID REFERENCES customer_service.customers(id),
    to_customer_id UUID REFERENCES customer_service.customers(id),
    payment_processor VARCHAR(100),
    processor_transaction_id VARCHAR(100),
    processor_fee DECIMAL(10,2) DEFAULT 0.00,
    exchange_rate DECIMAL(10,6),
    original_amount DECIMAL(15,2),
    original_currency VARCHAR(3),
    payment_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction fees table
CREATE TABLE IF NOT EXISTS transaction_service.transaction_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transaction_service.transactions(id) ON DELETE CASCADE,
    fee_type VARCHAR(50) NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fee_description TEXT,
    waived BOOLEAN DEFAULT FALSE,
    waiver_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 6: RISK ASSESSMENT SERVICE SCHEMA
-- ================================================================

-- Create schema for risk assessment service
CREATE SCHEMA IF NOT EXISTS risk_assessment_service AUTHORIZATION ufs_admin;

-- Risk profiles table for customer risk assessment
CREATE TABLE IF NOT EXISTS risk_assessment_service.risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID UNIQUE REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1000),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_category VARCHAR(50) NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_assessment_date TIMESTAMP WITH TIME ZONE,
    assessment_method VARCHAR(50) CHECK (assessment_method IN ('AUTOMATED', 'MANUAL', 'HYBRID')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risk scores history for tracking changes
CREATE TABLE IF NOT EXISTS risk_assessment_service.risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    risk_profile_id UUID REFERENCES risk_assessment_service.risk_profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
    previous_score INTEGER,
    score_change INTEGER,
    reason_code VARCHAR(50),
    assessment_factors JSONB DEFAULT '{}',
    model_inputs JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risk factors table for detailed risk analysis
CREATE TABLE IF NOT EXISTS risk_assessment_service.risk_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    factor_type VARCHAR(100) NOT NULL,
    factor_name VARCHAR(255) NOT NULL,
    factor_value DECIMAL(10,4),
    factor_weight DECIMAL(5,4),
    impact_score INTEGER,
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_active BOOLEAN DEFAULT TRUE,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fraud alerts table for suspicious activity detection
CREATE TABLE IF NOT EXISTS risk_assessment_service.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transaction_service.transactions(id),
    alert_type VARCHAR(100) NOT NULL,
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE', 'ESCALATED')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 1000),
    detection_method VARCHAR(50),
    detection_rules JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES auth_service.users(id),
    resolved_by UUID REFERENCES auth_service.users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 7: COMPLIANCE SERVICE SCHEMA
-- ================================================================

-- Create schema for compliance service
CREATE SCHEMA IF NOT EXISTS compliance_service AUTHORIZATION ufs_admin;

-- Regulatory rules table for compliance management
CREATE TABLE IF NOT EXISTS compliance_service.regulatory_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(100) UNIQUE NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    regulation_name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    compliance_requirements JSONB NOT NULL DEFAULT '{}',
    implementation_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUPERSEDED')),
    severity_level VARCHAR(20) CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance checks table for ongoing monitoring
CREATE TABLE IF NOT EXISTS compliance_service.compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id),
    transaction_id UUID REFERENCES transaction_service.transactions(id),
    rule_id UUID REFERENCES compliance_service.regulatory_rules(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL,
    check_name VARCHAR(255) NOT NULL,
    check_result VARCHAR(50) NOT NULL CHECK (check_result IN ('PASS', 'FAIL', 'WARNING', 'MANUAL_REVIEW', 'ERROR')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 1000),
    details JSONB DEFAULT '{}',
    violation_details TEXT,
    remediation_required BOOLEAN DEFAULT FALSE,
    remediation_notes TEXT,
    checked_by VARCHAR(100),
    check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AML (Anti-Money Laundering) checks table
CREATE TABLE IF NOT EXISTS compliance_service.aml_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transaction_service.transactions(id),
    check_type VARCHAR(100) NOT NULL CHECK (check_type IN ('WATCHLIST_SCREENING', 'PEP_CHECK', 'SANCTIONS_SCREENING', 'ADVERSE_MEDIA', 'TRANSACTION_MONITORING')),
    screening_result VARCHAR(50) NOT NULL CHECK (screening_result IN ('CLEAR', 'MATCH', 'POTENTIAL_MATCH', 'ERROR', 'MANUAL_REVIEW')),
    match_details JSONB DEFAULT '{}',
    watchlist_name VARCHAR(255),
    match_score DECIMAL(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLEARED', 'FLAGGED', 'ESCALATED')),
    reviewed_by UUID REFERENCES auth_service.users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance reports table for regulatory reporting
CREATE TABLE IF NOT EXISTS compliance_service.compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    regulatory_body VARCHAR(255) NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}',
    report_summary JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SUBMITTED', 'ACKNOWLEDGED')),
    generated_by UUID REFERENCES auth_service.users(id) NOT NULL,
    reviewed_by UUID REFERENCES auth_service.users(id),
    approved_by UUID REFERENCES auth_service.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    file_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 8: FINANCIAL WELLNESS SERVICE SCHEMA
-- ================================================================

-- Create schema for financial wellness service
CREATE SCHEMA IF NOT EXISTS financial_wellness_service AUTHORIZATION ufs_admin;

-- Wellness profiles table for customer financial health
CREATE TABLE IF NOT EXISTS financial_wellness_service.wellness_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID UNIQUE REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    wellness_score INTEGER CHECK (wellness_score >= 0 AND wellness_score <= 100),
    financial_health_status VARCHAR(50) CHECK (financial_health_status IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')),
    income_stability_score INTEGER CHECK (income_stability_score >= 0 AND income_stability_score <= 100),
    spending_behavior_score INTEGER CHECK (spending_behavior_score >= 0 AND spending_behavior_score <= 100),
    savings_rate DECIMAL(5,2),
    debt_to_income_ratio DECIMAL(5,2),
    emergency_fund_months INTEGER,
    financial_stress_indicator VARCHAR(20) CHECK (financial_stress_indicator IN ('LOW', 'MEDIUM', 'HIGH')),
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_assessment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial goals table for customer goal tracking
CREATE TABLE IF NOT EXISTS financial_wellness_service.financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    goal_type VARCHAR(100) NOT NULL CHECK (goal_type IN ('EMERGENCY_FUND', 'DEBT_PAYOFF', 'SAVINGS', 'INVESTMENT', 'RETIREMENT', 'HOME_PURCHASE', 'EDUCATION', 'VACATION', 'OTHER')),
    goal_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    priority_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    monthly_contribution DECIMAL(10,2),
    auto_contribute BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations table for personalized financial advice
CREATE TABLE IF NOT EXISTS financial_wellness_service.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_service.customers(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority_score INTEGER CHECK (priority_score >= 0 AND priority_score <= 100),
    potential_benefit DECIMAL(10,2),
    implementation_effort VARCHAR(20) CHECK (implementation_effort IN ('LOW', 'MEDIUM', 'HIGH')),
    recommendation_data JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISMISSED', 'COMPLETED', 'IN_PROGRESS')),
    action_taken BOOLEAN DEFAULT FALSE,
    action_date TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    generated_by VARCHAR(100) DEFAULT 'AI_ENGINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 9: ANALYTICS SERVICE SCHEMA
-- ================================================================

-- Create schema for analytics service
CREATE SCHEMA IF NOT EXISTS analytics_service AUTHORIZATION ufs_admin;

-- Analytics data table for processed analytics information
CREATE TABLE IF NOT EXISTS analytics_service.analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type VARCHAR(100) NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4),
    dimensions JSONB DEFAULT '{}',
    aggregation_level VARCHAR(50) CHECK (aggregation_level IN ('CUSTOMER', 'ACCOUNT', 'TRANSACTION', 'PRODUCT', 'CHANNEL', 'SYSTEM')),
    time_period VARCHAR(50) CHECK (time_period IN ('MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR')),
    calculation_date DATE NOT NULL,
    calculation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(100),
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0.00 AND quality_score <= 1.00),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dashboards table for analytics dashboard configuration
CREATE TABLE IF NOT EXISTS analytics_service.dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_name VARCHAR(255) NOT NULL,
    dashboard_type VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth_service.users(id),
    configuration JSONB NOT NULL DEFAULT '{}',
    widgets JSONB DEFAULT '[]',
    permissions JSONB DEFAULT '{}',
    refresh_interval INTEGER DEFAULT 300,
    is_public BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table for generated analytical reports
CREATE TABLE IF NOT EXISTS analytics_service.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT,
    report_parameters JSONB DEFAULT '{}',
    report_data JSONB DEFAULT '{}',
    generated_by UUID REFERENCES auth_service.users(id) NOT NULL,
    generation_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    report_period_start TIMESTAMP WITH TIME ZONE,
    report_period_end TIMESTAMP WITH TIME ZONE,
    file_path VARCHAR(500),
    file_format VARCHAR(20) CHECK (file_format IN ('PDF', 'EXCEL', 'CSV', 'JSON')),
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECTION 10: INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================

-- Auth Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON auth_service.users USING btree (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON auth_service.users USING btree (username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON auth_service.users USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oauth_tokens_access_token ON auth_service.oauth_tokens USING btree (access_token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oauth_tokens_expires_at ON auth_service.oauth_tokens USING btree (expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token ON auth_service.user_sessions USING btree (session_token);

-- Customer Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customer_service.customers USING btree (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_customer_number ON customer_service.customers USING btree (customer_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_status ON customer_service.customers USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_profiles_customer_id ON customer_service.customer_profiles USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_profiles_profile_data ON customer_service.customer_profiles USING gin (profile_data);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_customer_id ON customer_service.kyc_documents USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_status ON customer_service.kyc_documents USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_accounts_customer_id ON customer_service.customer_accounts USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_accounts_account_number ON customer_service.customer_accounts USING btree (account_number);

-- Transaction Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_customer_id ON transaction_service.transactions USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_account_id ON transaction_service.transactions USING btree (account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_transaction_id ON transaction_service.transactions USING btree (transaction_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status ON transaction_service.transactions USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_at ON transaction_service.transactions USING btree (created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_type_status ON transaction_service.transactions USING btree (transaction_type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_transaction_id ON transaction_service.payments USING btree (transaction_id);

-- Risk Assessment Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_profiles_customer_id ON risk_assessment_service.risk_profiles USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_profiles_risk_level ON risk_assessment_service.risk_profiles USING btree (risk_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_scores_customer_id ON risk_assessment_service.risk_scores USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_alerts_customer_id ON risk_assessment_service.fraud_alerts USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_alerts_status ON risk_assessment_service.fraud_alerts USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_alerts_alert_level ON risk_assessment_service.fraud_alerts USING btree (alert_level);

-- Compliance Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_regulatory_rules_jurisdiction ON compliance_service.regulatory_rules USING btree (jurisdiction);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_regulatory_rules_status ON compliance_service.regulatory_rules USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_checks_customer_id ON compliance_service.compliance_checks USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_checks_result ON compliance_service.compliance_checks USING btree (check_result);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_aml_checks_customer_id ON compliance_service.aml_checks USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_aml_checks_status ON compliance_service.aml_checks USING btree (status);

-- Financial Wellness Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wellness_profiles_customer_id ON financial_wellness_service.wellness_profiles USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_goals_customer_id ON financial_wellness_service.financial_goals USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_goals_status ON financial_wellness_service.financial_goals USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_customer_id ON financial_wellness_service.recommendations USING btree (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_status ON financial_wellness_service.recommendations USING btree (status);

-- Analytics Service Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_data_type_category ON analytics_service.analytics_data USING btree (data_type, data_category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_data_calculation_date ON analytics_service.analytics_data USING btree (calculation_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_data_dimensions ON analytics_service.analytics_data USING gin (dimensions);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_owner_id ON analytics_service.dashboards USING btree (owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_generated_by ON analytics_service.reports USING btree (generated_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_generation_time ON analytics_service.reports USING btree (generation_time);

-- ================================================================
-- SECTION 11: TRIGGERS FOR AUTOMATED TIMESTAMP UPDATES
-- ================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth_service.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON auth_service.roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customer_service.customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_service.customer_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_service.customer_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON customer_service.kyc_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at BEFORE UPDATE ON customer_service.onboarding_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_accounts_updated_at BEFORE UPDATE ON customer_service.customer_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transaction_service.transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON transaction_service.payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_profiles_updated_at BEFORE UPDATE ON risk_assessment_service.risk_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at BEFORE UPDATE ON risk_assessment_service.fraud_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_rules_updated_at BEFORE UPDATE ON compliance_service.regulatory_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aml_checks_updated_at BEFORE UPDATE ON compliance_service.aml_checks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_reports_updated_at BEFORE UPDATE ON compliance_service.compliance_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_profiles_updated_at BEFORE UPDATE ON financial_wellness_service.wellness_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_wellness_service.financial_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON financial_wellness_service.recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON analytics_service.dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 12: PERMISSIONS AND GRANTS
-- ================================================================

-- Grant usage on all schemas to ufs_user
GRANT USAGE ON SCHEMA auth_service TO ufs_user;
GRANT USAGE ON SCHEMA customer_service TO ufs_user;
GRANT USAGE ON SCHEMA transaction_service TO ufs_user;
GRANT USAGE ON SCHEMA risk_assessment_service TO ufs_user;
GRANT USAGE ON SCHEMA compliance_service TO ufs_user;
GRANT USAGE ON SCHEMA financial_wellness_service TO ufs_user;
GRANT USAGE ON SCHEMA analytics_service TO ufs_user;

-- Grant read-only access to ufs_reader
GRANT USAGE ON SCHEMA auth_service TO ufs_reader;
GRANT USAGE ON SCHEMA customer_service TO ufs_reader;
GRANT USAGE ON SCHEMA transaction_service TO ufs_reader;
GRANT USAGE ON SCHEMA risk_assessment_service TO ufs_reader;
GRANT USAGE ON SCHEMA compliance_service TO ufs_reader;
GRANT USAGE ON SCHEMA financial_wellness_service TO ufs_reader;
GRANT USAGE ON SCHEMA analytics_service TO ufs_reader;

-- Grant table permissions to ufs_user (full CRUD operations)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA customer_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA transaction_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA risk_assessment_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA compliance_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA financial_wellness_service TO ufs_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics_service TO ufs_user;

-- Grant read-only permissions to ufs_reader
GRANT SELECT ON ALL TABLES IN SCHEMA auth_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA customer_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA transaction_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA risk_assessment_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA compliance_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA financial_wellness_service TO ufs_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics_service TO ufs_reader;

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA customer_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA transaction_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA risk_assessment_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA compliance_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA financial_wellness_service TO ufs_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA analytics_service TO ufs_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA customer_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA transaction_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_assessment_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA financial_wellness_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufs_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA customer_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA transaction_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_assessment_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA financial_wellness_service GRANT SELECT ON TABLES TO ufs_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics_service GRANT SELECT ON TABLES TO ufs_reader;

-- ================================================================
-- SECTION 13: INITIAL DATA SETUP
-- ================================================================

-- Insert default roles
INSERT INTO auth_service.roles (id, name, description, is_system_role) VALUES
    (uuid_generate_v4(), 'ADMIN', 'System Administrator with full access', TRUE),
    (uuid_generate_v4(), 'MANAGER', 'Management role with elevated permissions', TRUE),
    (uuid_generate_v4(), 'ANALYST', 'Financial Analyst with read access to analytics', TRUE),
    (uuid_generate_v4(), 'COMPLIANCE_OFFICER', 'Compliance Officer with regulatory access', TRUE),
    (uuid_generate_v4(), 'CUSTOMER_SERVICE', 'Customer Service Representative', TRUE),
    (uuid_generate_v4(), 'CUSTOMER', 'Standard Customer Role', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO auth_service.permissions (id, name, description, resource, action) VALUES
    (uuid_generate_v4(), 'USER_READ', 'Read user information', 'USER', 'READ'),
    (uuid_generate_v4(), 'USER_WRITE', 'Create and update users', 'USER', 'WRITE'),
    (uuid_generate_v4(), 'CUSTOMER_READ', 'Read customer information', 'CUSTOMER', 'READ'),
    (uuid_generate_v4(), 'CUSTOMER_WRITE', 'Create and update customers', 'CUSTOMER', 'WRITE'),
    (uuid_generate_v4(), 'TRANSACTION_READ', 'Read transaction data', 'TRANSACTION', 'READ'),
    (uuid_generate_v4(), 'TRANSACTION_WRITE', 'Create transactions', 'TRANSACTION', 'WRITE'),
    (uuid_generate_v4(), 'RISK_READ', 'Read risk assessment data', 'RISK', 'READ'),
    (uuid_generate_v4(), 'RISK_WRITE', 'Update risk assessments', 'RISK', 'WRITE'),
    (uuid_generate_v4(), 'COMPLIANCE_READ', 'Read compliance data', 'COMPLIANCE', 'READ'),
    (uuid_generate_v4(), 'COMPLIANCE_WRITE', 'Update compliance checks', 'COMPLIANCE', 'WRITE'),
    (uuid_generate_v4(), 'ANALYTICS_READ', 'Read analytics data', 'ANALYTICS', 'READ'),
    (uuid_generate_v4(), 'ANALYTICS_WRITE', 'Create analytics reports', 'ANALYTICS', 'WRITE')
ON CONFLICT (name) DO NOTHING;

-- Insert initial regulatory rules for common financial regulations
INSERT INTO compliance_service.regulatory_rules (id, rule_code, rule_name, regulation_name, jurisdiction, rule_type, description, compliance_requirements, implementation_date, effective_date, status) VALUES
    (uuid_generate_v4(), 'BSA_001', 'Bank Secrecy Act - Currency Transaction Reporting', 'Bank Secrecy Act', 'US', 'REPORTING', 'Requires reporting of currency transactions over $10,000', '{"threshold": 10000, "currency": "USD", "reporting_deadline": 15}', '2024-01-01', '2024-01-01', 'ACTIVE'),
    (uuid_generate_v4(), 'AML_001', 'Anti-Money Laundering - Customer Due Diligence', 'AML Regulations', 'US', 'COMPLIANCE', 'Customer identification and verification requirements', '{"kyc_required": true, "verification_timeframe": 30}', '2024-01-01', '2024-01-01', 'ACTIVE'),
    (uuid_generate_v4(), 'GDPR_001', 'General Data Protection Regulation - Data Processing', 'GDPR', 'EU', 'PRIVACY', 'Data protection and privacy requirements', '{"consent_required": true, "data_retention_limit": 2555}', '2024-01-01', '2024-01-01', 'ACTIVE'),
    (uuid_generate_v4(), 'PCI_001', 'Payment Card Industry - Data Security', 'PCI DSS', 'GLOBAL', 'SECURITY', 'Credit card data protection requirements', '{"encryption_required": true, "access_control": true}', '2024-01-01', '2024-01-01', 'ACTIVE')
ON CONFLICT (rule_code) DO NOTHING;

-- ================================================================
-- SECTION 14: DATABASE MAINTENANCE FUNCTIONS
-- ================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_service.user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired OAuth tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_service.oauth_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer risk levels based on risk scores
CREATE OR REPLACE FUNCTION update_customer_risk_levels()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE customer_service.customers 
    SET risk_level = CASE 
        WHEN rp.risk_score <= 250 THEN 'LOW'
        WHEN rp.risk_score <= 500 THEN 'MEDIUM'
        WHEN rp.risk_score <= 750 THEN 'HIGH'
        ELSE 'CRITICAL'
    END,
    updated_at = CURRENT_TIMESTAMP
    FROM risk_assessment_service.risk_profiles rp
    WHERE customers.id = rp.customer_id
    AND customers.risk_level != CASE 
        WHEN rp.risk_score <= 250 THEN 'LOW'
        WHEN rp.risk_score <= 500 THEN 'MEDIUM'
        WHEN rp.risk_score <= 750 THEN 'HIGH'
        ELSE 'CRITICAL'
    END;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- SECTION 15: COMPLETION AND VERIFICATION
-- ================================================================

-- Create a function to verify database initialization
CREATE OR REPLACE FUNCTION verify_database_initialization()
RETURNS TABLE (
    schema_name TEXT,
    table_count BIGINT,
    index_count BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schema_name::TEXT,
        COUNT(DISTINCT t.table_name) as table_count,
        COUNT(DISTINCT i.indexname) as index_count,
        'INITIALIZED'::TEXT as status
    FROM information_schema.schemata s
    LEFT JOIN information_schema.tables t ON s.schema_name = t.table_schema
    LEFT JOIN pg_indexes i ON s.schema_name = i.schemaname
    WHERE s.schema_name IN (
        'auth_service', 
        'customer_service', 
        'transaction_service', 
        'risk_assessment_service', 
        'compliance_service', 
        'financial_wellness_service', 
        'analytics_service'
    )
    GROUP BY s.schema_name
    ORDER BY s.schema_name;
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
INSERT INTO analytics_service.analytics_data (
    data_type, 
    data_category, 
    metric_name, 
    metric_value, 
    dimensions, 
    calculation_date
) VALUES (
    'SYSTEM',
    'INITIALIZATION',
    'DATABASE_SETUP_COMPLETE',
    1,
    '{"version": "1.0", "environment": "production", "timestamp": "' || CURRENT_TIMESTAMP || '"}',
    CURRENT_DATE
);

-- ================================================================
-- DATABASE INITIALIZATION COMPLETE
-- ================================================================

-- Display initialization summary
SELECT 'PostgreSQL Database Initialization Complete' as message,
       CURRENT_TIMESTAMP as completion_time,
       'UFS Platform v1.0' as version;

-- Verify the initialization
SELECT * FROM verify_database_initialization();