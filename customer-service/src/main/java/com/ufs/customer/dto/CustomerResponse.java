package com.ufs.customer.dto;

import java.math.BigDecimal; // Java 21 - High precision decimal representation for financial calculations
import java.time.Instant; // Java 21 - Immutable timestamp representation with nanosecond precision
import java.util.UUID; // Java 21 - Universally unique identifier for customer entities

/**
 * CustomerResponse DTO - Data Transfer Object for Customer Response
 * 
 * This record represents the standardized response format for customer data across
 * the Unified Financial Services platform. It implements the unified data model
 * requirements for F-001 (Unified Data Integration Platform) and supports
 * F-004 (Digital Customer Onboarding) processes.
 * 
 * Key Features:
 * - Immutable data structure using Java 21 record pattern
 * - Standardized customer data representation across microservices
 * - Support for KYC/AML compliance data fields
 * - High-precision risk scoring with BigDecimal
 * - Temporal tracking with nanosecond-precision timestamps
 * - UUID-based customer identification for distributed systems
 * 
 * Security Considerations:
 * - Contains customer PII - ensure proper encryption in transit and at rest
 * - Implements safe-to-expose data filtering for client consumption
 * - Supports audit trail requirements for regulatory compliance
 * 
 * Performance Characteristics:
 * - Immutable structure provides thread safety for high-concurrency scenarios
 * - Compact memory footprint suitable for 10,000+ TPS requirements
 * - Efficient serialization for API responses and inter-service communication
 * 
 * Compliance Alignment:
 * - Supports GDPR data portability requirements
 * - Enables SOC2 and PCI DSS audit trail compliance
 * - Facilitates Basel III/IV risk reporting with structured risk scoring
 * 
 * @author UFS Platform Team
 * @version 1.0
 * @since 2025-01-01
 */
public record CustomerResponse(
    /**
     * Unique customer identifier using UUID for distributed system compatibility.
     * This ID is generated during customer creation and remains immutable throughout
     * the customer lifecycle. Supports horizontal scaling and cross-service references.
     * 
     * @apiNote Required for all customer operations and service-to-service communication
     * @implNote Generated using UUID.randomUUID() during customer entity creation
     */
    UUID id,
    
    /**
     * Customer's legal first name as provided during onboarding.
     * Used for identity verification, KYC compliance, and regulatory reporting.
     * 
     * @constraint Non-null, length 1-100 characters
     * @compliance Required for AML/KYC identity verification processes
     * @apiNote Sensitive PII - ensure encryption in transit and storage
     */
    String firstName,
    
    /**
     * Customer's legal last name as provided during onboarding.
     * Used for identity verification, KYC compliance, and regulatory reporting.
     * 
     * @constraint Non-null, length 1-100 characters
     * @compliance Required for AML/KYC identity verification processes
     * @apiNote Sensitive PII - ensure encryption in transit and storage
     */
    String lastName,
    
    /**
     * Customer's primary email address for communication and authentication.
     * Serves as a unique communication channel and secondary identifier.
     * 
     * @constraint Valid email format, unique across platform
     * @feature Supports digital communication and account recovery processes  
     * @apiNote Used for account notifications and security communications
     */
    String email,
    
    /**
     * Customer's primary phone number in international format.
     * Used for two-factor authentication, KYC verification, and emergency contact.
     * 
     * @constraint International format (+country_code followed by national number)
     * @feature Enables SMS-based 2FA and voice verification during onboarding
     * @compliance Required for enhanced due diligence procedures
     */
    String phone,
    
    /**
     * Customer's date of birth in ISO 8601 format (YYYY-MM-DD).
     * Critical for age verification, regulatory compliance, and risk assessment.
     * 
     * @constraint ISO 8601 date format, customer must be 18+ for most services
     * @compliance Required for CIP (Customer Identification Program) compliance
     * @feature Used in age-based product eligibility and risk scoring algorithms
     */
    String dateOfBirth,
    
    /**
     * Customer's nationality/citizenship for regulatory and compliance purposes.
     * Determines applicable regulations, tax implications, and service availability.
     * 
     * @constraint ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "CA")
     * @compliance Required for FATCA, CRS, and sanctions screening
     * @feature Enables geo-based service customization and regulatory compliance
     */
    String nationality,
    
    /**
     * Current Know Your Customer (KYC) verification status.
     * Tracks the customer's progress through the digital onboarding pipeline
     * and determines service access levels.
     * 
     * Valid statuses:
     * - PENDING: Initial status, verification in progress
     * - VERIFIED: Successfully completed KYC verification
     * - REJECTED: KYC verification failed or incomplete
     * - REQUIRES_REVIEW: Manual review required for approval
     * - EXPIRED: KYC verification has expired and requires renewal
     * 
     * @compliance Essential for AML compliance and regulatory reporting
     * @feature Controls access to financial services based on verification level
     * @apiNote Status changes trigger workflow events and notifications
     */
    String kycStatus,
    
    /**
     * Customer's calculated risk score on 0.00-100.00 scale.
     * Generated by AI-Powered Risk Assessment Engine (F-002) using multiple
     * data points including transaction patterns, credit history, and behavioral analytics.
     * 
     * Risk Score Ranges:
     * - 0.00-25.00: Low Risk - Standard services, minimal monitoring
     * - 25.01-50.00: Medium Risk - Enhanced monitoring, standard limits
     * - 50.01-75.00: High Risk - Increased scrutiny, reduced limits
     * - 75.01-100.00: Very High Risk - Manual approval required, restricted services
     * 
     * @precision Scale of 2 decimal places for granular risk assessment
     * @compliance Supports Basel III/IV capital adequacy requirements
     * @feature Enables dynamic pricing and limit adjustment based on risk profile
     * @performance Updated in real-time based on customer behavior and market conditions
     */
    BigDecimal riskScore,
    
    /**
     * Timestamp when the customer record was initially created.
     * Provides audit trail and temporal tracking for regulatory compliance.
     * Uses UTC timezone with nanosecond precision for global consistency.
     * 
     * @format ISO 8601 UTC timestamp with nanosecond precision
     * @compliance Required for audit trails and regulatory reporting
     * @feature Enables temporal analytics and customer lifecycle tracking
     * @apiNote Immutable field - set once during customer creation
     */
    Instant createdAt,
    
    /**
     * Timestamp of the most recent update to any customer data field.
     * Tracks data freshness and supports change detection for downstream systems.
     * Uses UTC timezone with nanosecond precision for global consistency.
     * 
     * @format ISO 8601 UTC timestamp with nanosecond precision
     * @compliance Supports data lineage and change audit requirements
     * @feature Enables cache invalidation and real-time data synchronization
     * @apiNote Updated automatically on any field modification
     */
    Instant updatedAt
) {
    /**
     * Factory method to create CustomerResponse with current timestamp.
     * Convenience method for creating responses with auto-generated update timestamp.
     * 
     * @param id Customer unique identifier
     * @param firstName Customer's first name
     * @param lastName Customer's last name  
     * @param email Customer's email address
     * @param phone Customer's phone number
     * @param dateOfBirth Customer's date of birth
     * @param nationality Customer's nationality
     * @param kycStatus Current KYC status
     * @param riskScore Calculated risk score
     * @param createdAt Creation timestamp
     * @return CustomerResponse with current timestamp as updatedAt
     */
    public static CustomerResponse withCurrentUpdate(
            UUID id,
            String firstName,
            String lastName,
            String email,
            String phone,
            String dateOfBirth,
            String nationality,
            String kycStatus,
            BigDecimal riskScore,
            Instant createdAt) {
        return new CustomerResponse(
            id, firstName, lastName, email, phone, dateOfBirth,
            nationality, kycStatus, riskScore, createdAt, Instant.now()
        );
    }
    
    /**
     * Returns the customer's full name by concatenating first and last names.
     * Convenience method for display purposes and reporting.
     * 
     * @return Formatted full name as "firstName lastName"
     * @apiNote Used in user interfaces and customer communications
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    /**
     * Determines if the customer has completed KYC verification.
     * Used for access control and service eligibility checks.
     * 
     * @return true if KYC status is "VERIFIED", false otherwise
     * @feature Enables conditional service access based on verification status
     */
    public boolean isKycVerified() {
        return "VERIFIED".equals(kycStatus);
    }
    
    /**
     * Categorizes the customer's risk level based on their risk score.
     * Provides human-readable risk classification for business operations.
     * 
     * @return Risk level as string: "LOW", "MEDIUM", "HIGH", or "VERY_HIGH"
     * @feature Used in automated decision making and manual review processes
     */
    public String getRiskLevel() {
        if (riskScore == null) {
            return "UNKNOWN";
        }
        
        BigDecimal score = riskScore;
        if (score.compareTo(BigDecimal.valueOf(25.00)) <= 0) {
            return "LOW";
        } else if (score.compareTo(BigDecimal.valueOf(50.00)) <= 0) {
            return "MEDIUM";
        } else if (score.compareTo(BigDecimal.valueOf(75.00)) <= 0) {
            return "HIGH";
        } else {
            return "VERY_HIGH";
        }
    }
    
    /**
     * Determines if the customer requires enhanced due diligence.
     * Based on risk score thresholds defined by regulatory requirements.
     * 
     * @return true if customer requires enhanced monitoring and review
     * @compliance Supports AML enhanced due diligence requirements
     */
    public boolean requiresEnhancedDueDiligence() {
        return riskScore != null && riskScore.compareTo(BigDecimal.valueOf(50.00)) > 0;
    }
    
    /**
     * Calculates the age of the customer record in days.
     * Useful for data retention policies and customer lifecycle analytics.
     * 
     * @return Number of days since customer creation
     * @feature Supports automated customer lifecycle management
     */
    public long getAccountAgeInDays() {
        return java.time.Duration.between(createdAt, Instant.now()).toDays();
    }
    
    /**
     * Returns a masked version of the email for logging and display purposes.
     * Protects customer PII while maintaining some identifiability for support.
     * 
     * @return Email with middle characters masked (e.g., "jo***@example.com")
     * @security Prevents PII exposure in logs and non-secure contexts
     */
    public String getMaskedEmail() {
        if (email == null || email.length() < 3) {
            return "***";
        }
        
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }
        
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***" + domain;
        }
        
        return localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1) + domain;
    }
    
    /**
     * Returns a masked version of the phone number for logging and display.
     * Protects customer PII while maintaining country code for support purposes.
     * 
     * @return Phone with middle digits masked (e.g., "+1-***-***-****")
     * @security Prevents PII exposure in logs and non-secure contexts
     */
    public String getMaskedPhone() {
        if (phone == null || phone.length() < 4) {
            return "***";
        }
        
        // Assuming format starts with + and country code
        if (phone.startsWith("+")) {
            return phone.substring(0, 3) + "-***-***-****";
        }
        
        return "***-***-****";
    }
}