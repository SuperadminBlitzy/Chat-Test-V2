package com.ufs.compliance.service;

import com.ufs.compliance.dto.AmlCheckRequest;
import com.ufs.compliance.dto.AmlCheckResponse;

import org.springframework.stereotype.Service; // Spring Framework 6.1+ - Service annotation for Spring component scanning
import org.springframework.validation.annotation.Validated; // Spring Framework 6.1+ - Enable method-level validation

import javax.validation.Valid; // Java Validation API 3.0+ - Enable validation of method parameters
import javax.validation.constraints.NotNull; // Java Validation API 3.0+ - Ensure parameters are not null

/**
 * Anti-Money Laundering (AML) Service Interface
 * 
 * This interface defines the contract for performing Anti-Money Laundering checks
 * as part of the Digital Customer Onboarding process (F-004) and Regulatory 
 * Compliance Automation (F-003) features within the Unified Financial Services platform.
 * 
 * The AML service provides critical compliance functionality that enables financial
 * institutions to:
 * - Screen customers against global AML watchlists and sanctions lists
 * - Perform Customer Identification Programme (CIP) compliance checks
 * - Execute Customer Due Diligence (CDD) processes
 * - Assess transaction-based money laundering risks
 * - Generate audit trails for regulatory reporting
 * 
 * This service supports the following functional requirements:
 * - F-004-RQ-002: KYC/AML compliance checks for customer verification
 * - F-003-RQ-001: Automated regulatory compliance monitoring and reporting
 * - Watchlist Screening against AML watchlists worldwide
 * - Real-time risk assessment and scoring
 * 
 * The implementation of this interface must ensure:
 * - Sub-second response times for compliance with F-002 performance requirements
 * - Comprehensive audit logging for regulatory compliance (F-003)
 * - Integration with external AML service providers and regulatory databases
 * - Support for multiple regulatory frameworks including BSA, CDD, and international KYC rules
 * - Explainable AI compliance for risk assessment decisions
 * 
 * Security Considerations:
 * - All AML operations must maintain complete audit trails
 * - Customer data handling must comply with data protection regulations
 * - Integration with external watchlists must use secure, encrypted connections
 * - Risk assessments must be explainable and auditable
 * 
 * Performance Requirements:
 * - Target response time: <500ms for 99% of requests (per F-002-RQ-001)
 * - Throughput capacity: Support for 5,000+ AML checks per second
 * - Availability: 99.9% uptime requirement for compliance operations
 * - Scalability: Horizontal scaling capability for varying compliance loads
 * 
 * Integration Points:
 * - AI-Powered Risk Assessment Engine (F-002) for risk scoring
 * - Unified Data Integration Platform (F-001) for customer data access
 * - External AML service providers (Thomson Reuters, Dow Jones, etc.)
 * - Regulatory databases and sanctions lists
 * - Audit logging and compliance reporting systems
 * 
 * Compliance Standards:
 * - Bank Secrecy Act (BSA) requirements
 * - Customer Identification Programme (CIP) compliance
 * - Customer Due Diligence (CDD) processes
 * - International KYC/AML rules and regulations
 * - Financial Action Task Force (FATF) recommendations
 * - Jurisdictional AML regulations and guidelines
 * 
 * @author UFS Compliance Service Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @see com.ufs.compliance.dto.AmlCheckRequest
 * @see com.ufs.compliance.dto.AmlCheckResponse
 * @see com.ufs.compliance.service.impl.AmlServiceImpl
 */
@Service
@Validated
public interface AmlService {

    /**
     * Performs a comprehensive Anti-Money Laundering (AML) check for a customer or transaction.
     * 
     * This method executes a complete AML screening process that includes:
     * - Customer identification verification against government databases
     * - Sanctions list screening (OFAC, UN, EU, and other regulatory lists)
     * - Politically Exposed Person (PEP) screening
     * - Adverse media screening and reputation checks
     * - Geographic risk assessment based on customer location
     * - Transaction pattern analysis for suspicious activity detection
     * - Beneficial ownership verification for corporate customers
     * - Cross-border transaction compliance checks
     * 
     * The AML check process follows these key steps:
     * 1. Input validation and data quality checks
     * 2. Customer identity verification and profile building
     * 3. Multi-list watchlist screening using fuzzy matching algorithms
     * 4. Risk scoring based on multiple risk factors and AI models
     * 5. Threshold-based transaction monitoring and pattern analysis
     * 6. Regulatory compliance validation across applicable jurisdictions
     * 7. Generation of comprehensive audit trail and compliance report
     * 
     * Risk Assessment Factors:
     * - Customer demographics and identity verification status
     * - Geographic risk factors (high-risk countries, sanctioned regions)
     * - Transaction amount, frequency, and pattern analysis
     * - Industry/business type risk assessment
     * - Relationship history and behavioral patterns
     * - External intelligence and adverse media findings
     * 
     * Performance Characteristics:
     * - Target response time: <500ms for standard checks
     * - Complex checks with extensive screening: <2 seconds
     * - Batch processing capability for bulk customer screening
     * - Real-time processing for transaction-based monitoring
     * - Caching of frequently accessed watchlist data for performance
     * 
     * Error Handling:
     * - Input validation errors result in detailed error responses
     * - External service failures trigger fallback screening mechanisms
     * - Partial screening results are clearly indicated in the response
     * - All errors are logged for compliance and operational monitoring
     * 
     * Audit and Compliance:
     * - Every AML check generates immutable audit records
     * - Compliance timestamps are recorded in UTC format
     * - Screening methodology and decision rationale are documented
     * - Regulatory reporting data is automatically generated
     * - Customer privacy is maintained through data masking in logs
     * 
     * Integration Requirements:
     * - Must integrate with AI-Powered Risk Assessment Engine for scoring
     * - Requires access to Unified Data Integration Platform for customer data
     * - Connects to external AML service providers via secure APIs
     * - Updates compliance dashboards and monitoring systems in real-time
     * - Supports integration with case management systems for manual review
     * 
     * @param amlCheckRequest The comprehensive AML check request containing customer
     *                       identification information, transaction details, and 
     *                       screening parameters. This object must include:
     *                       - Customer ID for identification and tracking
     *                       - Transaction ID for audit trail correlation
     *                       - Full customer name for identity verification
     *                       - Date of birth for age-based risk assessment
     *                       - Current address for geographic risk evaluation
     *                       - Transaction amount for threshold monitoring
     *                       - Transaction currency for cross-border compliance
     *                       
     *                       The request object is validated to ensure all required
     *                       fields are populated and meet data quality standards
     *                       for effective AML screening.
     * 
     * @return AmlCheckResponse A comprehensive response object containing the complete
     *                         results of the AML screening process, including:
     *                         - Unique check ID for audit trail and correlation
     *                         - Customer ID linking to the original request
     *                         - Overall screening status (COMPLETED, PENDING, FAILED, etc.)
     *                         - Risk level assessment (LOW, MEDIUM, HIGH, CRITICAL)
     *                         - Detailed list of identified issues and concerns
     *                         - Precise timestamp of screening completion in UTC
     *                         
     *                         The response provides sufficient detail for compliance
     *                         officers to understand screening results and take
     *                         appropriate action based on identified risks.
     * 
     * @throws IllegalArgumentException if the amlCheckRequest is invalid, contains
     *                                 incomplete data, or fails validation checks.
     *                                 This includes scenarios where required fields
     *                                 are missing, data formats are incorrect, or
     *                                 business validation rules are violated.
     * 
     * @throws AmlServiceException if the AML screening process encounters technical
     *                           failures, external service unavailability, or other
     *                           operational issues that prevent completion of the
     *                           compliance check. This exception includes details
     *                           about the failure cause and recommended actions.
     * 
     * @throws ComplianceException if regulatory compliance requirements cannot be
     *                           satisfied, required data sources are unavailable,
     *                           or screening results indicate high-risk scenarios
     *                           that require immediate escalation and review.
     * 
     * @since 1.0.0
     * 
     * @apiNote This method is designed to be called synchronously for real-time
     *          onboarding scenarios and asynchronously for batch processing.
     *          Implementations should consider caching strategies for frequently
     *          accessed watchlist data and implement circuit breaker patterns
     *          for external service integrations.
     * 
     * @implNote Implementations must ensure thread safety for concurrent processing,
     *           maintain comprehensive audit logs, and provide consistent error
     *           handling across different screening scenarios. Performance monitoring
     *           and alerting should be implemented to detect and respond to
     *           service degradation or compliance failures.
     * 
     * @see F-004-RQ-002 KYC/AML compliance checks functional requirement
     * @see F-003-RQ-001 Regulatory compliance automation requirement
     * @see com.ufs.compliance.dto.AmlCheckRequest Request object specification
     * @see com.ufs.compliance.dto.AmlCheckResponse Response object specification
     */
    AmlCheckResponse performAmlCheck(
        @Valid @NotNull(message = "AML check request cannot be null") AmlCheckRequest amlCheckRequest
    );
}