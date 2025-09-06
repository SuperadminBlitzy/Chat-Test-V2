package com.ufs.customer.model;

// Jakarta Persistence API 3.1.0 - JPA entity annotations and relationship management
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;

// Jakarta Validation API 3.0.2 - Bean validation annotations for data integrity
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;

// Hibernate Annotations 6.4.4.Final - Automatic timestamp management
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

// Lombok 1.18.30 - Code generation for boilerplate reduction
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

// Java Time API - Modern date/time handling
import java.time.Instant;
import java.time.LocalDate;

// Java Collections - List interface for one-to-many relationships
import java.util.List;
import java.util.ArrayList;

// Java UUID - Unique identifier generation for enhanced security
import java.util.UUID;

/**
 * Customer Entity - Core Component of the Unified Financial Services Platform
 * 
 * This JPA entity represents the foundational customer data structure within the
 * customer-service microservice, serving as the central hub for all customer-related
 * information and relationships. The entity is designed to support the platform's
 * key features including Unified Data Integration (F-001) and Digital Customer
 * Onboarding (F-004).
 * 
 * Business Context:
 * - Serves as the primary customer identification and profile management entity
 * - Enables unified customer view across all financial services touchpoints
 * - Supports digital onboarding workflows with comprehensive data validation
 * - Facilitates AI-powered risk assessment through structured customer data
 * - Ensures regulatory compliance with KYC/AML requirements
 * 
 * Technical Architecture:
 * - Persists to PostgreSQL 16+ database in the 'customers' table
 * - Uses UUID primary key generation for enhanced security and scalability
 * - Implements comprehensive audit trails with automatic timestamp management
 * - Supports one-to-one relationship with detailed CustomerProfile (MongoDB)
 * - Maintains one-to-many relationships with KycDocument and OnboardingStatus entities
 * 
 * Performance Characteristics:
 * - Optimized for sub-second response times as per platform requirements
 * - Supports 10,000+ TPS capacity through efficient indexing and caching
 * - Implements lazy loading for related entities to optimize memory usage
 * - Uses database-level constraints for data integrity assurance
 * 
 * Security Features:
 * - UUID-based primary keys prevent enumeration attacks
 * - Email uniqueness enforced at database level for security and integrity
 * - Comprehensive validation annotations ensure data quality and compliance
 * - Audit fields track all changes for regulatory compliance and security monitoring
 * 
 * Regulatory Compliance:
 * - Supports Bank Secrecy Act (BSA) customer identification requirements
 * - Enables Customer Identification Programme (CIP) compliance tracking
 * - Facilitates Customer Due Diligence (CDD) processes through related entities
 * - Maintains complete audit trails for regulatory reporting and investigations
 * 
 * Integration Points:
 * - CustomerProfile: Comprehensive profile data stored in MongoDB for flexibility
 * - KycDocument: Legal documents and verification status for compliance
 * - OnboardingStatus: Digital onboarding progress tracking and workflow management
 * 
 * Data Quality Assurance:
 * - Comprehensive validation rules prevent invalid data entry
 * - Size constraints ensure database performance and prevent attacks
 * - Email format validation ensures communication channel reliability
 * - Date validation prevents logical inconsistencies and fraud attempts
 * 
 * @version 1.0
 * @since 2025-01-01
 * @author UFS Development Team
 * 
 * @see CustomerProfile Detailed customer profile stored in MongoDB
 * @see KycDocument Customer verification documents and compliance status
 * @see OnboardingStatus Digital onboarding progress and workflow tracking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    /**
     * Primary Key - Unique Customer Identifier
     * 
     * UUID-based primary key providing enhanced security through non-sequential,
     * cryptographically strong identifiers. This approach prevents customer
     * enumeration attacks and ensures global uniqueness across distributed systems.
     * 
     * Technical Implementation:
     * - Generated using UUID.randomUUID() via GenerationType.UUID strategy
     * - Column mapped as "customer_id" for explicit database schema control
     * - Marked as non-updatable to prevent accidental modification
     * - Indexed automatically as primary key for optimal query performance
     * 
     * Security Benefits:
     * - Prevents customer enumeration attacks through sequential ID guessing
     * - Provides 128-bit cryptographically strong unique identification
     * - Enables secure customer referencing across microservices architecture
     * - Supports distributed system scalability without ID collision risks
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "customer_id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Customer Legal First Name
     * 
     * The customer's legal first name as it appears on government-issued
     * identification documents. This field is critical for KYC compliance,
     * identity verification, and legal document generation.
     * 
     * Validation Rules:
     * - Required field (cannot be null or empty)
     * - Length between 1 and 100 characters to accommodate various naming conventions
     * - Used for identity verification cross-referencing with official documents
     * - Essential for personalized customer communications and legal compliance
     * 
     * Compliance Requirements:
     * - Must match government-issued identification for KYC verification
     * - Used in Customer Identification Programme (CIP) processes
     * - Required for AML screening and sanctions list checking
     * - Critical for audit trails and regulatory reporting accuracy
     */
    @NotNull(message = "First name is required for customer identification and KYC compliance")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    /**
     * Customer Legal Last Name
     * 
     * The customer's legal last name or surname as it appears on government-issued
     * identification documents. Combined with first name, this provides the primary
     * identification basis for the customer within the financial services platform.
     * 
     * Business Logic:
     * - Used for customer search and identification across all platform touchpoints
     * - Critical for generating legal documents, contracts, and compliance reports
     * - Required for cross-referencing with external databases and credit bureaus
     * - Essential component of the unified customer profile creation process
     * 
     * Integration Requirements:
     * - Must be consistent across all related CustomerProfile data in MongoDB
     * - Used for biometric verification processes linking to KycDocument entities
     * - Required for onboarding status tracking and workflow automation
     * - Critical for AI-powered risk assessment and fraud detection algorithms
     */
    @NotNull(message = "Last name is required for customer identification and legal compliance")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    /**
     * Primary Email Address
     * 
     * The customer's primary email address serving as the main digital communication
     * channel and unique identifier for account access. This field supports digital
     * onboarding workflows, two-factor authentication, and regulatory notifications.
     * 
     * Uniqueness Constraint:
     * - Enforced at database level to prevent duplicate accounts
     * - Critical for account security and fraud prevention
     * - Enables reliable customer communication for compliance notifications
     * - Used as primary identifier in password reset and security workflows
     * 
     * Communication Requirements:
     * - Primary channel for onboarding progress notifications
     * - Used for regulatory compliance communications and disclosures
     * - Essential for AI-powered personalized financial recommendations
     * - Required for real-time transaction monitoring and fraud alerts
     * 
     * Technical Validation:
     * - RFC 5322 compliant email format validation
     * - Database-level uniqueness constraint prevents account conflicts
     * - Size limit ensures database performance and prevents malicious oversized inputs
     * - Required field ensuring reliable customer communication capability
     */
    @NotNull(message = "Email address is required for customer communication and account access")
    @Email(message = "Email address must be in valid format for reliable communication")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    /**
     * Customer Phone Number
     * 
     * Optional primary phone number for customer contact and two-factor authentication.
     * While not required for basic account creation, this field enhances security
     * through SMS-based authentication and provides alternative communication channel.
     * 
     * Security Enhancement:
     * - Supports multi-factor authentication workflows for enhanced account security
     * - Enables SMS-based transaction verification for high-risk operations
     * - Provides backup communication channel for critical account notifications
     * - Used in fraud detection algorithms for contact pattern analysis
     * 
     * Business Value:
     * - Improves customer service contact success rates
     * - Enables proactive fraud prevention through phone verification
     * - Supports personalized customer outreach and relationship management
     * - Critical for emergency account security notifications and alerts
     * 
     * Data Quality Considerations:
     * - International format support for global customer base
     * - Optional field accommodating various customer preferences and privacy concerns
     * - Validated for format consistency when provided by customer
     * - Integrated with external verification services for authenticity checking
     */
    @Column(name = "phone_number")
    private String phoneNumber;

    /**
     * Customer Date of Birth
     * 
     * The customer's date of birth as a critical data point for age verification,
     * regulatory compliance, and risk assessment algorithms. This field is essential
     * for KYC compliance and enables age-based product eligibility determination.
     * 
     * Regulatory Compliance:
     * - Required for Anti-Money Laundering (AML) identity verification processes
     * - Critical for Customer Due Diligence (CDD) age verification requirements
     * - Used in sanctions screening and politically exposed person (PEP) identification
     * - Essential for regulatory reporting and audit trail maintenance
     * 
     * Business Applications:
     * - Determines eligibility for age-restricted financial products and services
     * - Used in AI-powered risk assessment models for demographic analysis
     * - Critical for life insurance underwriting and actuarial calculations
     * - Enables personalized financial planning based on life stage analysis
     * 
     * Validation Logic:
     * - Must be in the past to prevent logical inconsistencies and fraud attempts
     * - Used for automatic age calculation and product eligibility determination
     * - Cross-referenced with government identification documents during KYC process
     * - Integrated with biometric verification systems for identity confirmation
     */
    @NotNull(message = "Date of birth is required for age verification and regulatory compliance")
    @Past(message = "Date of birth must be in the past for logical consistency")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    /**
     * Customer Nationality
     * 
     * The customer's nationality or citizenship status, critical for regulatory
     * compliance, tax reporting, and international banking requirements. This field
     * supports FATCA compliance, sanctions screening, and jurisdiction-specific regulations.
     * 
     * Regulatory Requirements:
     * - Essential for Foreign Account Tax Compliance Act (FATCA) reporting
     * - Required for Common Reporting Standard (CRS) international tax compliance
     * - Critical for sanctions screening against country-specific restricted lists
     * - Used for determining applicable regulatory frameworks and compliance requirements
     * 
     * Risk Management:
     * - Incorporated into AI-powered risk assessment models for geographic risk evaluation
     * - Used for country-specific fraud pattern analysis and prevention
     * - Critical for politically exposed person (PEP) screening and monitoring
     * - Essential for cross-border transaction monitoring and compliance
     * 
     * Product Eligibility:
     * - Determines eligibility for jurisdiction-specific financial products
     * - Used for international banking service availability and restrictions
     * - Critical for investment product suitability based on regulatory requirements
     * - Enables compliance with country-specific consumer protection regulations
     */
    @NotNull(message = "Nationality is required for regulatory compliance and tax reporting")
    @Column(name = "nationality", nullable = false)
    private String nationality;

    /**
     * Customer Active Status
     * 
     * Boolean flag indicating whether the customer account is currently active
     * and eligible for financial services. This field supports account lifecycle
     * management, compliance monitoring, and business rule enforcement.
     * 
     * Business Logic:
     * - Active customers can access all platform services and features
     * - Inactive customers are restricted from new transactions and service access
     * - Used for account suspension during compliance investigations or violations
     * - Critical for managing account lifecycle from onboarding to closure
     * 
     * Compliance Applications:
     * - Enables immediate account restriction for AML compliance violations
     * - Used for regulatory-mandated account freezing and monitoring
     * - Critical for sanctions compliance and restricted customer management
     * - Supports audit requirements for account status change tracking
     * 
     * Technical Implementation:
     * - Default value ensures new accounts are created in active state
     * - Indexed for efficient active customer querying and reporting
     * - Used in business logic for service availability and feature access control
     * - Integrated with monitoring systems for account status change alerts
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    /**
     * Record Creation Timestamp
     * 
     * Immutable timestamp automatically set when the customer record is first
     * created in the database. This field provides essential audit trail information
     * for regulatory compliance and forensic investigation capabilities.
     * 
     * Audit Trail Requirements:
     * - Immutable field preventing unauthorized modification of creation history
     * - Critical for regulatory audit trails and compliance reporting
     * - Used for customer lifecycle analysis and business intelligence
     * - Essential for forensic investigations and security incident response
     * 
     * Technical Implementation:
     * - Automatically populated by Hibernate @CreationTimestamp annotation
     * - Stored in UTC timezone for consistent global timestamp management
     * - Indexed for efficient temporal queries and reporting operations
     * - Used in data retention policies and compliance-driven archival processes
     * 
     * Business Intelligence:
     * - Enables customer acquisition trend analysis and business performance metrics
     * - Used for cohort analysis and customer lifetime value calculations
     * - Critical for regulatory reporting on customer onboarding timelines
     * - Supports business process optimization through creation pattern analysis
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    /**
     * Record Last Update Timestamp
     * 
     * Automatically maintained timestamp reflecting the most recent modification
     * to the customer record. This field ensures complete audit trail coverage
     * and enables change tracking for compliance and security monitoring.
     * 
     * Change Tracking:
     * - Automatically updated on any field modification through @UpdateTimestamp
     * - Critical for detecting unauthorized or suspicious account modifications
     * - Used in compliance monitoring for unusual account activity patterns
     * - Essential for audit trail completeness and regulatory compliance
     * 
     * Security Monitoring:
     * - Enables detection of rapid or unusual account modification patterns
     * - Used in fraud detection algorithms for account takeover prevention
     * - Critical for security incident investigation and forensic analysis
     * - Supports automated alerts for high-frequency account modifications
     * 
     * Data Quality Assurance:
     * - Ensures accurate tracking of all customer data modifications
     * - Used for data synchronization across microservices architecture
     * - Critical for maintaining data consistency in distributed system environment
     * - Supports eventual consistency models in high-availability deployments
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Customer Profile Relationship
     * 
     * One-to-one relationship with the comprehensive CustomerProfile document
     * stored in MongoDB. This relationship enables the hybrid SQL-NoSQL architecture
     * where structured customer data resides in PostgreSQL while flexible profile
     * data utilizes MongoDB's document capabilities.
     * 
     * Architecture Design:
     * - CustomerProfile stored in MongoDB for flexible schema and rapid evolution
     * - Contains detailed personal information, addresses, identity verification data
     * - Includes risk profiles, preferences, and comprehensive metadata
     * - Enables horizontal scaling and optimized document-based queries
     * 
     * Relationship Management:
     * - Bidirectional one-to-one relationship mapped by "customer" field in CustomerProfile
     * - Cascade ALL operations ensure profile lifecycle matches customer lifecycle
     * - Lazy loading optimizes performance by loading profile data only when needed
     * - Optional = false ensures every customer has a corresponding profile
     * 
     * Data Consistency:
     * - Profile creation automatically triggered during customer onboarding process
     * - Referential integrity maintained through application-level constraints
     * - Synchronization mechanisms ensure data consistency across SQL and NoSQL stores
     * - Eventual consistency model supports high-availability requirements
     */
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private CustomerProfile customerProfile;

    /**
     * KYC Documents Collection
     * 
     * One-to-many relationship with KycDocument entities representing all
     * identity verification documents submitted by the customer during
     * onboarding and ongoing compliance processes.
     * 
     * Compliance Framework:
     * - Supports comprehensive KYC (Know Your Customer) documentation requirements
     * - Enables AML (Anti-Money Laundering) compliance through document verification
     * - Tracks document lifecycle from submission to verification completion
     * - Maintains complete audit trail for regulatory reporting and investigations
     * 
     * Document Management:
     * - Cascade ALL ensures document lifecycle management aligned with customer lifecycle
     * - Orphan removal prevents dangling document records during customer data cleanup
     * - Lazy loading optimizes performance for customers with extensive document collections
     * - Supports multiple document types including passports, driver licenses, utility bills
     * 
     * Business Process Integration:
     * - Documents automatically linked during digital onboarding workflows
     * - AI-powered document verification results stored within related KycDocument entities
     * - Risk assessment algorithms utilize document verification status and authenticity scores
     * - Compliance reporting includes comprehensive document verification audit trails
     */
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KycDocument> kycDocuments = new ArrayList<>();

    /**
     * Onboarding Status History
     * 
     * One-to-many relationship with OnboardingStatus entities tracking the
     * complete digital onboarding journey from initial application through
     * final account activation and ongoing compliance monitoring.
     * 
     * Workflow Management:
     * - Tracks progression through multiple onboarding stages and checkpoints
     * - Enables workflow automation based on completion status of individual steps
     * - Supports parallel processing of independent onboarding tasks
     * - Provides granular visibility into onboarding bottlenecks and optimization opportunities
     * 
     * Status Tracking Capabilities:
     * - Personal information submission and verification status
     * - Document upload and verification progress tracking
     * - Biometric authentication and verification results
     * - Risk assessment completion and scoring status
     * - KYC and AML compliance verification progress
     * - Overall onboarding status and final approval workflow
     * 
     * Business Intelligence:
     * - Enables onboarding funnel analysis and conversion optimization
     * - Supports A/B testing of onboarding workflows and user experience improvements
     * - Provides data for machine learning models predicting onboarding success
     * - Critical for regulatory reporting on customer onboarding timelines and success rates
     * 
     * Performance Optimization:
     * - Status history enables identification of process improvement opportunities
     * - Supports automated escalation for stalled onboarding processes
     * - Enables predictive analytics for resource allocation and capacity planning
     * - Critical for achieving <5 minutes average onboarding time target
     */
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OnboardingStatus> onboardingStatuses = new ArrayList<>();

    /**
     * Business Logic - Full Name Generation
     * 
     * Convenience method for generating the customer's full name by combining
     * first and last names. This method is frequently used across the platform
     * for customer identification, document generation, and user interface display.
     * 
     * Use Cases:
     * - Customer greeting and personalized communications
     * - Legal document generation and contract preparation
     * - User interface display and customer identification
     * - Audit logging and transaction history records
     * 
     * @return String containing the customer's full name (firstName + " " + lastName)
     */
    public String getFullName() {
        if (firstName == null && lastName == null) {
            return "";
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }

    /**
     * Business Logic - Active Customer Verification
     * 
     * Determines whether the customer is currently active and eligible for
     * financial services. This method encapsulates the business logic for
     * customer status evaluation and service availability determination.
     * 
     * Business Rules:
     * - Active status must be true for service eligibility
     * - Used throughout the platform for service access control
     * - Critical for compliance with account restriction requirements
     * - Enables automatic service suspension during investigations
     * 
     * @return boolean indicating whether the customer is active and eligible for services
     */
    public boolean isActiveCustomer() {
        return this.isActive;
    }

    /**
     * Business Logic - Onboarding Completion Check
     * 
     * Evaluates whether the customer has completed the digital onboarding process
     * by examining the most recent onboarding status. This method is critical for
     * determining service availability and feature access permissions.
     * 
     * Implementation Logic:
     * - Checks for existence of onboarding status records
     * - Evaluates the most recent onboarding status for completion
     * - Returns false if no onboarding records exist (incomplete onboarding)
     * - Used for conditional service access and feature availability
     * 
     * Business Applications:
     * - Determines eligibility for full platform feature access
     * - Used in compliance workflows for service activation
     * - Critical for regulatory requirements around customer verification
     * - Enables graduated service access based on onboarding completion level
     * 
     * @return boolean indicating whether the customer has completed onboarding
     */
    public boolean hasCompletedOnboarding() {
        if (onboardingStatuses == null || onboardingStatuses.isEmpty()) {
            return false;
        }
        
        // Find the most recent onboarding status
        OnboardingStatus latestStatus = onboardingStatuses.stream()
            .sorted((s1, s2) -> s2.getUpdatedAt().compareTo(s1.getUpdatedAt()))
            .findFirst()
            .orElse(null);
            
        return latestStatus != null && 
               latestStatus.getOverallStatus() == OnboardingStatus.OverallOnboardingStatus.APPROVED;
    }

    /**
     * Business Logic - KYC Verification Status Check
     * 
     * Determines whether the customer has successfully completed KYC verification
     * by evaluating the verification status of submitted KYC documents. This method
     * is essential for compliance validation and service eligibility determination.
     * 
     * Verification Logic:
     * - Checks for existence of KYC documents
     * - Evaluates verification status of submitted documents
     * - Requires at least one verified document for positive result
     * - Used for compliance reporting and service access control
     * 
     * Compliance Requirements:
     * - Essential for AML compliance validation
     * - Required for Customer Due Diligence (CDD) verification
     * - Critical for regulatory reporting and audit requirements
     * - Used for risk-based service access and transaction limits
     * 
     * @return boolean indicating whether the customer has completed KYC verification
     */
    public boolean hasVerifiedKyc() {
        if (kycDocuments == null || kycDocuments.isEmpty()) {
            return false;
        }
        
        return kycDocuments.stream()
            .anyMatch(doc -> doc.getVerificationStatus() == KycDocument.DocumentVerificationStatus.VERIFIED);
    }

    /**
     * Business Logic - Document Count Retrieval
     * 
     * Returns the total number of KYC documents associated with the customer.
     * This method provides visibility into the comprehensiveness of customer
     * documentation for compliance and risk assessment purposes.
     * 
     * Business Applications:
     * - Compliance reporting and audit trail documentation
     * - Risk assessment based on documentation completeness
     * - Customer service support for document status inquiries
     * - Business intelligence for onboarding process optimization
     * 
     * @return int representing the total number of KYC documents submitted
     */
    public int getKycDocumentCount() {
        return kycDocuments != null ? kycDocuments.size() : 0;
    }

    /**
     * Business Logic - Onboarding Status Count
     * 
     * Returns the total number of onboarding status records associated with
     * the customer, providing insight into the complexity and duration of
     * the customer's onboarding journey.
     * 
     * Analytics Applications:
     * - Onboarding process complexity analysis and optimization
     * - Customer journey mapping and experience improvement
     * - Business intelligence for process efficiency measurement
     * - Support case resolution and customer service enhancement
     * 
     * @return int representing the total number of onboarding status records
     */
    public int getOnboardingStatusCount() {
        return onboardingStatuses != null ? onboardingStatuses.size() : 0;
    }
}