package com.ufs.customer.model;

import jakarta.persistence.*; // jakarta.persistence:3.1.0
import java.time.LocalDateTime; // java.time:1.8
import lombok.Data; // lombok:1.18.30
import lombok.Builder; // lombok:1.18.30
import lombok.NoArgsConstructor; // lombok:1.18.30
import lombok.AllArgsConstructor; // lombok:1.18.30

/**
 * OnboardingStatus Entity
 * 
 * Represents the comprehensive status tracking for digital customer onboarding process
 * as defined in F-004: Digital Customer Onboarding feature specification.
 * 
 * This entity tracks the progress of various onboarding stages including:
 * - Personal information submission and verification
 * - Document upload and verification processes
 * - Biometric authentication and verification
 * - Risk assessment and scoring
 * - KYC (Know Your Customer) compliance checks
 * - AML (Anti-Money Laundering) screening
 * - Overall onboarding status and progress
 * 
 * Performance Requirements:
 * - Supports <5 minutes average onboarding time requirement
 * - Enables 99% accuracy in identity verification tracking
 * - Provides complete audit trails for regulatory compliance
 * 
 * Compliance Features:
 * - Bank Secrecy Act (BSA) requirements tracking
 * - International KYC/AML rules compliance
 * - Customer Identification Programme (CIP) status
 * - Customer Due Diligence (CDD) process tracking
 * 
 * The circular dependency with Customer entity has been resolved by making
 * this relationship unidirectional, owned by the Customer entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "onboarding_statuses")
public class OnboardingStatus {

    /**
     * Primary key for the onboarding status record
     * Auto-generated using IDENTITY strategy for optimal performance
     * with PostgreSQL database as specified in technology stack
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    /**
     * Status of personal information submission and verification step
     * Tracks customer's progress in providing and verifying personal details
     * including full name, date of birth, address, and contact information
     * 
     * Required for F-004-RQ-001: Digital identity verification
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "personal_info_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus personalInfoStatus = OnboardingStepStatus.PENDING;

    /**
     * Status of document upload and verification process
     * Tracks submission and verification of government-issued ID documents,
     * proof of address, and other required documentation
     * 
     * Supports authentic and valid documentary evidence validation
     * including ID card, passport, and utility bill verification
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "document_upload_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus documentUploadStatus = OnboardingStepStatus.PENDING;

    /**
     * Status of biometric verification and authentication
     * Tracks digital identity verification using biometrics, AI, and machine learning
     * to determine customer authenticity through live selfie comparison
     * and Identity Document Verification (IDV)
     * 
     * Required for F-004-RQ-003: Biometric authentication
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "biometric_verification_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus biometricVerificationStatus = OnboardingStepStatus.PENDING;

    /**
     * Status of risk assessment and scoring process
     * Tracks AI-powered risk assessment including spending habits analysis,
     * investment behavior evaluation, and creditworthiness determination
     * 
     * Supports F-004-RQ-004: Risk-based onboarding with tailored information
     * gathering and automated workflows that adjust based on customer risk profile
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_assessment_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus riskAssessmentStatus = OnboardingStepStatus.PENDING;

    /**
     * Status of Know Your Customer (KYC) compliance checks
     * Tracks Customer Identification Programme (CIP) and Customer Due Diligence (CDD)
     * processes to verify customer legitimacy and identity
     * 
     * Required for F-004-RQ-002: KYC/AML compliance checks
     * Ensures compliance with international KYC rules and regulations
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus kycStatus = OnboardingStepStatus.PENDING;

    /**
     * Status of Anti-Money Laundering (AML) screening and verification
     * Tracks watchlist screening against AML watchlists worldwide
     * and compliance with Bank Secrecy Act (BSA) requirements
     * 
     * Essential for protecting against fraud, corruption, money-laundering,
     * terrorist financing, and other financial crimes
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "aml_status", nullable = false)
    @Builder.Default
    private OnboardingStepStatus amlStatus = OnboardingStepStatus.PENDING;

    /**
     * Overall onboarding process status
     * Aggregated status representing the complete onboarding journey
     * from initial application to final account activation
     * 
     * Used for high-level reporting and customer communication
     * about their onboarding progress
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false)
    @Builder.Default
    private OverallOnboardingStatus overallStatus = OverallOnboardingStatus.NOT_STARTED;

    /**
     * Timestamp when the onboarding status record was created
     * Provides audit trail for compliance and regulatory reporting
     * 
     * Automatically set during entity persistence for accurate tracking
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the onboarding status was last updated
     * Tracks the most recent modification to any onboarding step status
     * 
     * Critical for monitoring onboarding progress and ensuring
     * compliance with time-based regulatory requirements
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * JPA callback method to set creation timestamp
     * Automatically called before entity is persisted to database
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * JPA callback method to update modification timestamp
     * Automatically called before entity is updated in database
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

/**
 * OnboardingStepStatus Enumeration
 * 
 * Represents the status of individual steps in the customer onboarding process.
 * Provides granular tracking of each verification and compliance stage.
 * 
 * Status Progression:
 * PENDING -> IN_PROGRESS -> COMPLETED (success path)
 * PENDING -> IN_PROGRESS -> FAILED (failure path)
 * PENDING -> SKIPPED (optional steps)
 */
enum OnboardingStepStatus {
    /**
     * Initial state - step has not been started
     * Customer has not yet initiated this onboarding step
     */
    PENDING,
    
    /**
     * Step is currently being processed
     * Customer has started the step but verification is ongoing
     * May include automated processing, manual review, or external verification
     */
    IN_PROGRESS,
    
    /**
     * Step has been successfully completed
     * All verification requirements have been met
     * Customer can proceed to next onboarding step
     */
    COMPLETED,
    
    /**
     * Step has failed verification or processing
     * May require customer intervention or manual review
     * Could trigger additional verification requirements
     */
    FAILED,
    
    /**
     * Step has been skipped due to business rules
     * May be applicable for certain customer segments or risk profiles
     * Supports risk-based onboarding workflows
     */
    SKIPPED
}

/**
 * OverallOnboardingStatus Enumeration
 * 
 * Represents the comprehensive status of the entire customer onboarding process.
 * Provides high-level view of customer's journey from application to account activation.
 * 
 * Status Flow:
 * NOT_STARTED -> IN_PROGRESS -> PENDING_REVIEW -> APPROVED (success)
 * NOT_STARTED -> IN_PROGRESS -> PENDING_REVIEW -> REJECTED (failure)
 */
enum OverallOnboardingStatus {
    /**
     * Customer has not begun the onboarding process
     * Initial state before any onboarding steps are initiated
     */
    NOT_STARTED,
    
    /**
     * Onboarding is actively in progress
     * One or more onboarding steps are being completed
     * Customer is actively engaged in the verification process
     */
    IN_PROGRESS,
    
    /**
     * All steps completed, awaiting final review
     * Automated checks are complete, manual review may be required
     * Typically involves compliance team verification
     */
    PENDING_REVIEW,
    
    /**
     * Onboarding successfully completed
     * All verification and compliance requirements met
     * Customer account is activated and ready for use
     */
    APPROVED,
    
    /**
     * Onboarding has been rejected
     * Failed to meet verification or compliance requirements
     * May require additional documentation or manual intervention
     */
    REJECTED
}