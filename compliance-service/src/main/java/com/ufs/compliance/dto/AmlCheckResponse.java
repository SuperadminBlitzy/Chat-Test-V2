package com.ufs.compliance.dto;

import lombok.AllArgsConstructor; // v1.18.30 - Generate constructor with all arguments
import lombok.Builder; // v1.18.30 - Provide builder pattern for creating instances
import lombok.Data; // v1.18.30 - Generate boilerplate code like getters, setters, constructors, etc.
import lombok.NoArgsConstructor; // v1.18.30 - Generate no-argument constructor

import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object for representing the response of an Anti-Money Laundering (AML) check.
 * 
 * This DTO encapsulates the results of the AML screening process for a customer as part of the
 * KYC/AML compliance checks required by financial institutions. It contains comprehensive
 * information about the screening results, including risk assessment and any issues identified
 * during the watchlist screening process.
 * 
 * The response is generated as part of the Digital Customer Onboarding process (F-004) and
 * specifically addresses the F-004-RQ-002 requirement for KYC/AML compliance checks, including
 * Customer Identification Programme (CIP) and Customer Due Diligence (CDD) processes.
 * 
 * This class supports the automated compliance monitoring and reporting across multiple
 * regulatory frameworks as part of the broader Regulatory Compliance Automation (F-003) feature.
 * 
 * @see com.ufs.compliance.service.AmlScreeningService
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmlCheckResponse {

    /**
     * Unique identifier for this specific AML check.
     * 
     * This ID is used for audit trail purposes and allows for tracking and correlation
     * of AML screening activities across the compliance system. It enables linking
     * this response to the original check request and supports regulatory reporting
     * requirements.
     */
    private String checkId;

    /**
     * Unique identifier of the customer being screened.
     * 
     * This field links the AML check response to the specific customer record in the
     * unified customer profile system. It supports the Digital Customer Onboarding
     * process and enables correlation with other compliance and risk assessment data.
     */
    private String customerId;

    /**
     * Current status of the AML check process.
     * 
     * Possible values include:
     * - "COMPLETED" - Screening completed successfully
     * - "PENDING" - Screening is in progress
     * - "FAILED" - Screening failed due to technical or data issues
     * - "REQUIRES_REVIEW" - Manual review required due to potential matches
     * - "APPROVED" - Customer cleared for onboarding
     * - "REJECTED" - Customer rejected due to AML concerns
     * 
     * This status drives the workflow decisions in the customer onboarding process
     * and determines whether additional verification steps are required.
     */
    private String status;

    /**
     * Risk level assessment based on the AML screening results.
     * 
     * Possible values include:
     * - "LOW" - Minimal risk identified, standard onboarding can proceed
     * - "MEDIUM" - Moderate risk, enhanced due diligence may be required
     * - "HIGH" - Significant risk identified, manual review required
     * - "CRITICAL" - Severe risk, immediate escalation required
     * 
     * This assessment is used by the AI-Powered Risk Assessment Engine (F-002) to
     * make risk-based onboarding decisions and determine appropriate risk mitigation
     * strategies.
     */
    private String riskLevel;

    /**
     * List of specific issues or concerns identified during the AML screening process.
     * 
     * This list contains detailed information about any matches found during watchlist
     * screening, including:
     * - Sanctions list matches
     * - PEP (Politically Exposed Person) matches
     * - Adverse media findings
     * - Previous regulatory actions
     * - Geographic risk factors
     * - Beneficial ownership concerns
     * 
     * Each issue description provides sufficient detail for compliance officers to
     * understand the nature of the concern and take appropriate action. This supports
     * the requirement for explainable AI systems and regulatory audit trails.
     */
    private List<String> issues;

    /**
     * Timestamp indicating when this AML check was completed.
     * 
     * This timestamp is crucial for regulatory compliance and audit purposes,
     * providing a precise record of when the screening was performed. It supports
     * regulatory requirements for timely customer screening and enables monitoring
     * of screening performance metrics.
     * 
     * The timestamp is stored in UTC format using the ISO-8601 standard to ensure
     * consistency across different time zones and regulatory jurisdictions.
     */
    private Instant timestamp;
}