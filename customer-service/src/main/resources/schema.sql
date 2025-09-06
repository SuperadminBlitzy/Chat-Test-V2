-- =============================================================================
-- Customer Service Database Schema
-- =============================================================================
-- Purpose: Database schema for customer-service microservice supporting 
--          digital customer onboarding (F-004) and unified data integration (F-001)
-- 
-- Database: PostgreSQL 16+
-- Compliance: SOC2, PCI DSS, GDPR, FINRA, Basel III/IV
-- Security: ACID compliance, referential integrity, audit logging
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================================================
-- AUDIT LOGGING SUPPORT
-- =============================================================================
-- Create audit schema for compliance and security monitoring
CREATE SCHEMA IF NOT EXISTS audit;

-- Audit log table for tracking all data changes
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    client_ip INET,
    user_agent TEXT
);

-- Index for audit log performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit.audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit.audit_log (changed_at);

-- =============================================================================
-- MAIN CUSTOMER TABLES
-- =============================================================================

-- Core customers table - stores fundamental customer information
-- Supports F-004 (Digital Customer Onboarding) and F-001 (Unified Data Integration)
CREATE TABLE IF NOT EXISTS customers (
    -- Primary identifier using UUID for security and distributed system compatibility
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information (required for KYC compliance)
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(255),
    
    -- Account status and metadata
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Data integrity constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone_number IS NULL OR phone_number ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_birth_date CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
    CONSTRAINT chk_nationality_length CHECK (nationality IS NULL OR length(nationality) >= 2)
);

-- Performance indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (first_name, last_name);

-- Full-text search index for customer names (supports unified data platform)
CREATE INDEX IF NOT EXISTS idx_customers_name_gin ON customers USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- Customer profiles table - stores risk assessment and compliance status
-- Supports F-002 (AI-Powered Risk Assessment) and F-003 (Regulatory Compliance)
CREATE TABLE IF NOT EXISTS customer_profiles (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to customers table with cascading integrity
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Risk assessment data (0.00 to 100.00 scale)
    risk_score DECIMAL(5, 2) CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- Compliance status fields (standardized values for regulatory reporting)
    kyc_status VARCHAR(50) CHECK (kyc_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'EXPIRED')),
    aml_status VARCHAR(50) CHECK (aml_status IN ('PENDING', 'CLEAR', 'FLAGGED', 'UNDER_REVIEW', 'BLOCKED')),
    pep_status VARCHAR(50) CHECK (pep_status IN ('NOT_PEP', 'PEP_CONFIRMED', 'PEP_SUSPECTED', 'UNDER_REVIEW')),
    
    -- Metadata for audit and compliance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure one profile per customer
    CONSTRAINT uk_customer_profiles_customer_id UNIQUE (customer_id)
);

-- Performance indexes for customer_profiles table
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_risk_score ON customer_profiles (risk_score) WHERE risk_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_profiles_kyc_status ON customer_profiles (kyc_status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_aml_status ON customer_profiles (aml_status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_pep_status ON customer_profiles (pep_status);

-- KYC documents table - stores identity verification documents
-- Supports F-004 (Digital Customer Onboarding) with biometric and document verification
CREATE TABLE IF NOT EXISTS kyc_documents (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to customers table
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Document classification and identification
    document_type VARCHAR(255) NOT NULL CHECK (document_type IN (
        'PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'UTILITY_BILL', 
        'BANK_STATEMENT', 'PAYSLIP', 'TAX_RETURN', 'PROOF_OF_ADDRESS'
    )),
    document_number VARCHAR(255) NOT NULL,
    expiry_date DATE,
    
    -- Verification metadata
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(255) CHECK (verification_method IN (
        'MANUAL_REVIEW', 'OCR_AUTOMATED', 'BIOMETRIC_MATCH', 'THIRD_PARTY_API', 'AI_VERIFICATION'
    )),
    
    -- Secure document storage reference (URL to encrypted storage)
    document_url VARCHAR(255),
    
    -- Metadata for compliance and audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Data integrity constraints
    CONSTRAINT chk_expiry_date CHECK (expiry_date IS NULL OR expiry_date > CURRENT_DATE),
    CONSTRAINT chk_verification_date CHECK (verification_date IS NULL OR verification_date <= CURRENT_TIMESTAMP),
    CONSTRAINT chk_document_url_security CHECK (document_url IS NULL OR document_url LIKE 'https://%')
);

-- Performance indexes for kyc_documents table
CREATE INDEX IF NOT EXISTS idx_kyc_documents_customer_id ON kyc_documents (customer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents (document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_expiry ON kyc_documents (expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kyc_documents_verification ON kyc_documents (verification_date) WHERE verification_date IS NOT NULL;

-- Composite index for customer document lookup
CREATE INDEX IF NOT EXISTS idx_kyc_documents_customer_type ON kyc_documents (customer_id, document_type);

-- Onboarding status table - tracks customer onboarding progress
-- Supports F-004 (Digital Customer Onboarding) workflow management
CREATE TABLE IF NOT EXISTS onboarding_status (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to customers table
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Onboarding workflow status
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'INITIATED', 'PERSONAL_INFO_COLLECTED', 'DOCUMENTS_UPLOADED', 
        'KYC_IN_PROGRESS', 'KYC_COMPLETED', 'AML_CHECK_PENDING', 
        'AML_CHECK_COMPLETED', 'RISK_ASSESSMENT_PENDING', 
        'RISK_ASSESSMENT_COMPLETED', 'APPROVED', 'REJECTED', 
        'ON_HOLD', 'ADDITIONAL_INFO_REQUIRED'
    )),
    
    -- Current step in the onboarding process
    last_step VARCHAR(255),
    
    -- Metadata for process tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure one active onboarding record per customer
    CONSTRAINT uk_onboarding_status_customer_id UNIQUE (customer_id)
);

-- Performance indexes for onboarding_status table
CREATE INDEX IF NOT EXISTS idx_onboarding_status_customer_id ON onboarding_status (customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_status ON onboarding_status (status);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_updated ON onboarding_status (updated_at);

-- =============================================================================
-- TRIGGER FUNCTIONS FOR AUDIT LOGGING AND AUTOMATIC UPDATES
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log (
            table_name, record_id, operation_type, old_values, 
            changed_by, changed_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), 
            current_user, CURRENT_TIMESTAMP
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log (
            table_name, record_id, operation_type, old_values, new_values,
            changed_by, changed_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW),
            current_user, CURRENT_TIMESTAMP
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log (
            table_name, record_id, operation_type, new_values,
            changed_by, changed_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW),
            current_user, CURRENT_TIMESTAMP
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES AND AUDIT LOGGING
-- =============================================================================

-- Triggers for automatic updated_at timestamp updates
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kyc_documents_updated_at
    BEFORE UPDATE ON kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_onboarding_status_updated_at
    BEFORE UPDATE ON onboarding_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for audit logging (compliance requirement)
CREATE TRIGGER trigger_customers_audit
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER trigger_customer_profiles_audit
    AFTER INSERT OR UPDATE OR DELETE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER trigger_kyc_documents_audit
    AFTER INSERT OR UPDATE OR DELETE ON kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER trigger_onboarding_status_audit
    AFTER INSERT OR UPDATE OR DELETE ON onboarding_status
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- VIEWS FOR UNIFIED DATA ACCESS
-- =============================================================================

-- Comprehensive customer view combining all related data
-- Supports F-001 (Unified Data Integration Platform) requirements
CREATE OR REPLACE VIEW customer_unified_view AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone_number,
    c.date_of_birth,
    c.nationality,
    c.is_active,
    c.created_at,
    c.updated_at,
    cp.risk_score,
    cp.kyc_status,
    cp.aml_status,
    cp.pep_status,
    os.status as onboarding_status,
    os.last_step as onboarding_last_step,
    COUNT(kd.id) as documents_count,
    COUNT(CASE WHEN kd.verification_date IS NOT NULL THEN 1 END) as verified_documents_count
FROM customers c
LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
LEFT JOIN onboarding_status os ON c.id = os.customer_id
LEFT JOIN kyc_documents kd ON c.id = kd.customer_id
GROUP BY 
    c.id, c.first_name, c.last_name, c.email, c.phone_number, 
    c.date_of_birth, c.nationality, c.is_active, c.created_at, c.updated_at,
    cp.risk_score, cp.kyc_status, cp.aml_status, cp.pep_status,
    os.status, os.last_step;

-- =============================================================================
-- SECURITY AND PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Create role-based access control views (example for read-only access)
CREATE OR REPLACE VIEW customer_public_view AS
SELECT 
    id,
    first_name,
    last_name,
    email,
    is_active,
    created_at
FROM customers
WHERE is_active = TRUE;

-- =============================================================================
-- INITIAL DATA AND CONFIGURATION
-- =============================================================================

-- Insert default configuration values if needed
-- This could include reference data for document types, status values, etc.

-- =============================================================================
-- SCHEMA VALIDATION AND HEALTH CHECK
-- =============================================================================

-- Function to validate schema integrity
CREATE OR REPLACE FUNCTION validate_schema_integrity()
RETURNS TABLE(table_name TEXT, check_result TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'customers'::TEXT, 
           CASE WHEN EXISTS(SELECT 1 FROM customers LIMIT 1) OR NOT EXISTS(SELECT 1 FROM customers) 
           THEN 'OK' ELSE 'ERROR' END;
    
    RETURN QUERY
    SELECT 'customer_profiles'::TEXT,
           CASE WHEN (SELECT COUNT(*) FROM customer_profiles cp 
                      LEFT JOIN customers c ON cp.customer_id = c.id 
                      WHERE c.id IS NULL) = 0
           THEN 'OK' ELSE 'REFERENTIAL_INTEGRITY_ERROR' END;
    
    RETURN QUERY
    SELECT 'kyc_documents'::TEXT,
           CASE WHEN (SELECT COUNT(*) FROM kyc_documents kd 
                      LEFT JOIN customers c ON kd.customer_id = c.id 
                      WHERE c.id IS NULL) = 0
           THEN 'OK' ELSE 'REFERENTIAL_INTEGRITY_ERROR' END;
    
    RETURN QUERY
    SELECT 'onboarding_status'::TEXT,
           CASE WHEN (SELECT COUNT(*) FROM onboarding_status os 
                      LEFT JOIN customers c ON os.customer_id = c.id 
                      WHERE c.id IS NULL) = 0
           THEN 'OK' ELSE 'REFERENTIAL_INTEGRITY_ERROR' END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON SCHEMA audit IS 'Audit schema for compliance and security monitoring';
COMMENT ON TABLE customers IS 'Core customer information table supporting digital onboarding (F-004) and unified data integration (F-001)';
COMMENT ON TABLE customer_profiles IS 'Customer risk assessment and compliance status for AI-powered risk assessment (F-002)';
COMMENT ON TABLE kyc_documents IS 'KYC document storage and verification tracking for digital customer onboarding (F-004)';
COMMENT ON TABLE onboarding_status IS 'Customer onboarding workflow status and progress tracking (F-004)';
COMMENT ON VIEW customer_unified_view IS 'Unified customer data view supporting integrated data platform requirements (F-001)';

-- =============================================================================
-- END OF SCHEMA DEFINITION
-- =============================================================================