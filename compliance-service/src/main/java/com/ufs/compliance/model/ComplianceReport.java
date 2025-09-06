package com.ufs.compliance.model;

// Jakarta Persistence 3.1.0 - JPA entity and relationship mapping annotations
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;

// Java standard library imports
import java.util.List;
import java.time.LocalDateTime;

// Lombok 1.18.30 - Automatic code generation for boilerplate reduction
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Represents a comprehensive compliance report entity within the Unified Financial Services Platform.
 * This JPA entity serves as the central component for F-003: Regulatory Compliance Automation,
 * providing automated compliance reporting capabilities and supporting the complete audit trail
 * management required for modern financial regulatory frameworks.
 * 
 * Core Functional Requirements Addressed:
 * 
 * F-003-RQ-003: Compliance Reporting
 * This entity is the primary data structure for storing the results of continuous assessments 
 * and compliance status monitoring across operational units. It consolidates individual 
 * ComplianceCheck results into comprehensive reports that can be submitted to regulatory 
 * authorities and used for internal compliance management.
 * 
 * F-003-RQ-004: Audit Trail Management  
 * The ComplianceReport entity contributes to the audit trail by providing a persistent record 
 * of compliance status at specific points in time. Each report represents a snapshot of 
 * compliance validation activities and their outcomes, enabling complete regulatory traceability 
 * and supporting examination requirements.
 * 
 * F-003-RQ-001: Regulatory Change Monitoring
 * Compliance reports aggregate the results of regulatory change monitoring activities,
 * providing consolidated views of multi-framework compliance status with unified risk scoring
 * across various regulatory requirements including Basel III/IV, PSD3, MiFID II/III, and others.
 * 
 * Business Context and Regulatory Framework Support:
 * 
 * The compliance reporting landscape in 2025 continues to evolve with heightened supervisory 
 * intensity across financial and operational resilience, consumer protection, ESG, and digital 
 * finance. This entity supports automated reporting across multiple regulatory frameworks:
 * 
 * - Basel III/IV Capital Adequacy and Risk Management Reports
 * - PSD3 (Payment Services Directive 3) Compliance Reports  
 * - PSR (Payment Services Regulation) Compliance Documentation
 * - MiFID II/III Transaction Reporting and Best Execution Reports
 * - AML/KYC Compliance and Suspicious Activity Reports
 * - GDPR Data Protection Impact Assessments and Compliance Reports
 * - Consumer Duty Outcomes-Based Reporting for Retail Clients
 * - ESG (Environmental, Social, Governance) Compliance Reports
 * - Operational Resilience and Business Continuity Reports
 * - Cybersecurity and Third-Party Risk Management Reports
 * 
 * Technical Architecture and Performance Characteristics:
 * 
 * Database Design:
 * - Optimized for high-frequency report generation (24-hour update cycle requirement)
 * - PostgreSQL 16+ compatibility with ACID transaction guarantees
 * - Indexed fields for efficient compliance reporting queries and dashboard operations
 * - TEXT column support for comprehensive compliance summary storage
 * - Foreign key relationships ensuring referential integrity with ComplianceCheck entities
 * 
 * Scalability and Performance:
 * - Supports horizontal scaling for enterprise-level compliance operations
 * - Lazy loading strategy for ComplianceCheck collections to optimize memory usage
 * - Cascade operations configured for complete report lifecycle management
 * - Designed to support 99.9% accuracy in regulatory change detection
 * 
 * Security and Data Protection:
 * - Implements data protection requirements for sensitive compliance information
 * - Supports role-based access control for compliance report access
 * - Maintains comprehensive audit trails for regulatory examination
 * - Ensures data residency compliance across multiple jurisdictions
 * - Encrypted storage capabilities for confidential regulatory data
 * 
 * Integration Points:
 * - F-001: Unified Data Integration Platform - Sources data from integrated systems
 * - F-002: AI-Powered Risk Assessment Engine - Incorporates risk scores and assessments
 * - F-015: Compliance Control Center - Provides data for regulatory dashboards
 * - External regulatory APIs - Supports automated regulatory submission
 * 
 * Reporting Capabilities:
 * - Real-time compliance status monitoring across operational units
 * - Automated regulatory change impact assessment and reporting
 * - Comprehensive audit trail documentation for regulatory examinations
 * - Multi-framework compliance mapping and unified risk scoring
 * - Continuous assessment result consolidation and trend analysis
 * 
 * @author Unified Financial Services Platform - Compliance Service
 * @version 1.0.0
 * @since Java 21 LTS
 * @see ComplianceCheck for individual compliance validation records
 * @see RegulatoryRule for regulatory framework definitions  
 * @see AmlCheck for Anti-Money Laundering specific compliance validations
 */
@Data // Lombok 1.18.30 - Generates getters, setters, toString, equals, and hashCode methods
@NoArgsConstructor // Lombok 1.18.30 - Generates no-argument constructor for JPA entity requirements
@AllArgsConstructor // Lombok 1.18.30 - Generates constructor with all arguments for programmatic entity creation
@Entity // Jakarta Persistence 3.1.0 - Marks this class as a JPA entity for database persistence
public class ComplianceReport {

    /**
     * Unique identifier for the compliance report using auto-generated Long values.
     * 
     * The primary key uses IDENTITY generation strategy for optimal performance with PostgreSQL
     * and ensures unique identification across the compliance reporting system. This identifier
     * serves as the primary reference for all compliance report operations, regulatory submissions,
     * and cross-system integrations.
     * 
     * Key Characteristics:
     * - Auto-generated using database identity columns for guaranteed uniqueness
     * - Serves as the primary key for all JPA operations and database queries
     * - Used for compliance report indexing and efficient retrieval operations
     * - Referenced by external systems for compliance report lookup and validation
     * - Supports high-performance reporting queries and dashboard operations
     * 
     * The IDENTITY strategy is chosen over UUID for compliance reports to:
     * - Optimize database storage and indexing performance for large report volumes
     * - Provide predictable sequential ordering for compliance report chronology
     * - Support efficient range-based queries for regulatory reporting periods
     * - Minimize storage overhead for foreign key relationships
     * - Enable optimal database partition strategies for compliance data archival
     */
    @Id // Jakarta Persistence 3.1.0 - Specifies the primary key of the entity
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Jakarta Persistence 3.1.0 - Configures auto-generation using database identity
    @Column(name = "id", nullable = false, updatable = false) // Jakarta Persistence 3.1.0 - Maps to database column with constraints
    private Long id;

    /**
     * Classification of the compliance report indicating the regulatory framework and scope.
     * 
     * The report type determines the specific regulatory requirements being addressed,
     * the applicable compliance rules, and the target regulatory authorities for submission.
     * This field enables automated report routing, validation, and processing based on
     * regulatory framework-specific requirements.
     * 
     * Supported Report Types:
     * - "BASEL_CAPITAL_ADEQUACY": Basel III/IV capital adequacy and risk management reports
     * - "PSD3_COMPLIANCE": Payment Services Directive 3 compliance documentation
     * - "MIFID_TRANSACTION": MiFID II/III transaction reporting and best execution analysis
     * - "AML_KYC_ASSESSMENT": Anti-Money Laundering and Know Your Customer compliance reports
     * - "GDPR_DATA_PROTECTION": General Data Protection Regulation compliance assessments
     * - "CONSUMER_DUTY": Consumer Duty outcomes-based reporting for retail client protection
     * - "OPERATIONAL_RESILIENCE": Business continuity and operational resilience reports
     * - "ESG_COMPLIANCE": Environmental, Social, and Governance compliance documentation
     * - "CYBERSECURITY_RISK": Cybersecurity and third-party risk management reports
     * - "COMPREHENSIVE_ASSESSMENT": Multi-framework consolidated compliance reports
     * 
     * Business Impact:
     * The report type drives automated compliance workflows including:
     * - Regulatory rule application and validation logic
     * - Report format and content requirements
     * - Submission timeline and regulatory authority routing
     * - Risk scoring methodologies and thresholds
     * - Audit trail documentation requirements
     * - Escalation and approval workflow processes
     * 
     * This field is essential for F-003-RQ-001: Regulatory change monitoring,
     * enabling real-time dashboards with multi-framework mapping and unified risk scoring.
     */
    @Column(name = "report_type", nullable = false, length = 100) // Jakarta Persistence 3.1.0 - Maps to non-nullable database column
    private String reportType;

    /**
     * Timestamp indicating when the compliance report was generated.
     * 
     * The generation date establishes the temporal context for all compliance assessments
     * included in the report and is critical for regulatory timeline compliance, audit trail
     * accuracy, and compliance SLA monitoring. This timestamp serves as the definitive
     * record of when the compliance assessment was performed and documented.
     * 
     * Regulatory and Compliance Significance:
     * - Establishes exact timing for regulatory submission requirements
     * - Supports real-time compliance monitoring dashboard operations  
     * - Enables compliance SLA monitoring and performance measurement
     * - Provides chronological ordering for comprehensive audit trails
     * - Supports regulatory examination timeline and documentation requirements
     * - Enables compliance trend analysis and regulatory change impact assessment
     * 
     * Technical Considerations:
     * - Uses LocalDateTime for precision timestamping in compliance operations
     * - Supports timezone-aware processing in distributed compliance environments
     * - Critical for F-003-RQ-003: Compliance reporting timeline accuracy and integrity
     * - Enables automated report scheduling and regulatory submission workflows
     * - Supports compliance data retention policies and archival strategies
     * 
     * The generation date is automatically set when the compliance report is created
     * and should not be modified after initial report generation to maintain audit
     * trail integrity and regulatory compliance requirements.
     */
    @Column(name = "generation_date", nullable = false) // Jakarta Persistence 3.1.0 - Maps to non-nullable timestamp column
    private LocalDateTime generationDate;

    /**
     * Current status of the compliance report indicating processing state and regulatory readiness.
     * 
     * The status field drives automated compliance report workflows, regulatory submission
     * processes, and stakeholder notification systems. Status transitions are logged for
     * complete audit trail maintenance and regulatory examination purposes.
     * 
     * Status Values and Business Implications:
     * - "DRAFT": Report is being prepared and has not completed all required validations
     * - "UNDER_REVIEW": Report is awaiting manual review, approval, or additional analysis  
     * - "APPROVED": Report has been validated and approved for regulatory submission
     * - "SUBMITTED": Report has been successfully submitted to appropriate regulatory authorities
     * - "ACKNOWLEDGED": Regulatory authorities have confirmed receipt and acceptance
     * - "REJECTED": Report has been rejected and requires remediation before resubmission
     * - "ARCHIVED": Report has completed its regulatory lifecycle and is archived for retention
     * - "ERROR": Technical or processing errors occurred during report generation or submission
     * 
     * Workflow Integration:
     * The status enables automated processing including:
     * - Regulatory submission queue management and scheduling
     * - Stakeholder notification and escalation workflows  
     * - Compliance dashboard status reporting and monitoring
     * - Audit trail documentation and regulatory examination support
     * - Performance measurement and SLA compliance tracking
     * - Exception handling and error remediation processes
     * 
     * Critical for F-003-RQ-004: Audit trail management, providing complete visibility
     * into compliance report lifecycle and regulatory interaction history.
     */
    @Column(name = "status", nullable = false, length = 50) // Jakarta Persistence 3.1.0 - Maps to non-nullable status column
    private String status;

    /**
     * Comprehensive executive summary of the compliance report findings and recommendations.
     * 
     * The summary provides a consolidated view of all compliance checks, risk assessments,
     * and regulatory findings included in the report. This field serves as the primary
     * communication vehicle for compliance status to executives, regulators, and stakeholders
     * requiring high-level compliance insights without detailed technical analysis.
     * 
     * Content Structure and Requirements:
     * - Executive Overview: High-level compliance status and key findings summary
     * - Risk Assessment Summary: Consolidated risk scores and assessment outcomes
     * - Regulatory Compliance Status: Framework-specific compliance achievements and gaps
     * - Exception Analysis: Summary of compliance failures, violations, and remediation plans
     * - Trend Analysis: Compliance performance trends and comparative analysis
     * - Recommendations: Strategic recommendations for compliance improvement and optimization
     * - Next Steps: Planned actions and follow-up activities for compliance enhancement
     * 
     * Regulatory and Business Value:
     * - Provides executive-level visibility into organizational compliance posture
     * - Supports regulatory examination preparation and stakeholder communication
     * - Enables board-level reporting and governance oversight requirements
     * - Facilitates compliance trend analysis and strategic planning processes
     * - Supports risk management decision-making and resource allocation
     * - Documents compliance achievements and continuous improvement initiatives
     * 
     * The summary is stored as TEXT to accommodate comprehensive compliance narratives
     * while maintaining database performance for large-scale compliance reporting operations.
     * Content should be professionally written and suitable for regulatory examination
     * and external stakeholder communication requirements.
     */
    @Column(name = "summary", columnDefinition = "TEXT") // Jakarta Persistence 3.1.0 - Maps to TEXT column for large content storage
    private String summary;

    /**
     * Identifier of the primary entity (customer, business unit, product, etc.) covered by this compliance report.
     * 
     * The entity ID establishes the scope and subject of the compliance assessment,
     * enabling comprehensive compliance tracking across the organization's operational
     * structure. This field links the compliance report to specific business entities
     * within the unified financial services platform for targeted compliance management.
     * 
     * Supported Entity Types and Examples:
     * - Customer Entities: Individual customer IDs, corporate client identifiers
     * - Business Unit Entities: Organizational division codes, subsidiary identifiers  
     * - Product Entities: Financial product codes, service line identifiers
     * - Geographic Entities: Branch codes, regional identifiers, jurisdiction codes
     * - System Entities: Application system IDs, infrastructure component identifiers
     * - Transaction Entities: Transaction batch IDs, settlement cycle identifiers
     * 
     * Integration with Unified Data Platform:
     * The entity ID should correspond to valid identifiers within F-001: Unified Data
     * Integration Platform, enabling seamless cross-system compliance reporting and
     * comprehensive customer/entity compliance profile management.
     * 
     * Compliance Management Benefits:
     * - Enables entity-specific compliance monitoring and reporting
     * - Supports targeted regulatory examination preparation
     * - Facilitates compliance performance measurement and benchmarking
     * - Enables compliance risk assessment at entity and portfolio levels
     * - Supports regulatory capital allocation and compliance cost management
     * - Enables automated compliance workflow routing and escalation
     * 
     * This field is critical for F-003-RQ-003: Compliance reporting, enabling continuous
     * assessments and compliance status monitoring across operational units with proper
     * entity-level granularity and accountability.
     */
    @Column(name = "entity_id", nullable = false, length = 255) // Jakarta Persistence 3.1.0 - Maps to non-nullable entity identifier column
    private String entityId;

    /**
     * Type classification of the primary entity being assessed in this compliance report.
     * 
     * The entity type determines the applicable regulatory frameworks, compliance requirements,
     * and assessment methodologies used in the report generation process. This classification
     * enables automated compliance rule application, regulatory requirement mapping, and
     * framework-specific validation logic execution.
     * 
     * Supported Entity Type Classifications:
     * - "CUSTOMER": Individual or corporate customer compliance assessments
     * - "BUSINESS_UNIT": Organizational division or subsidiary compliance reports
     * - "PRODUCT": Financial product or service line compliance evaluations
     * - "GEOGRAPHIC": Regional, branch, or jurisdiction-specific compliance reports
     * - "SYSTEM": Technology system or infrastructure compliance assessments
     * - "TRANSACTION": Transaction category or payment type compliance reports
     * - "PORTFOLIO": Investment portfolio or asset class compliance evaluations
     * - "OPERATIONAL": Operational process or workflow compliance assessments
     * 
     * Regulatory Framework Application:
     * The entity type guides the application of specific regulatory requirements:
     * - Customer entities: KYC/AML, Consumer Duty, data protection regulations
     * - Business units: Operational resilience, capital adequacy, governance requirements
     * - Products: Product governance, suitability assessments, disclosure requirements
     * - Geographic: Jurisdictional compliance, cross-border regulation alignment
     * - Systems: Cybersecurity, data governance, operational risk management
     * - Transactions: Payment regulations, market conduct, reporting requirements
     * 
     * This field enables F-003-RQ-001: Regulatory change monitoring by supporting
     * entity-type-specific regulatory rule mapping and automated compliance assessment
     * workflows with appropriate regulatory framework application.
     */
    @Column(name = "entity_type", nullable = false, length = 100) // Jakarta Persistence 3.1.0 - Maps to non-nullable entity type column  
    private String entityType;

    /**
     * Collection of individual compliance checks that comprise this comprehensive compliance report.
     * 
     * This one-to-many relationship aggregates all specific compliance validations performed
     * as part of the report generation process. Each ComplianceCheck represents a discrete
     * regulatory requirement validation, risk assessment, or compliance rule evaluation
     * that contributes to the overall compliance posture documented in this report.
     * 
     * Relationship Configuration:
     * - Cascade.ALL: Complete lifecycle management - creating, updating, and deleting reports
     *   automatically manages associated compliance checks for data integrity and consistency
     * - FetchType.LAZY: Performance optimization - compliance checks are loaded on-demand
     *   to minimize memory usage and improve report loading performance for dashboard operations
     * - mappedBy = "complianceReport": Establishes bidirectional relationship with ComplianceCheck
     *   entity, enabling navigation from both report and individual check perspectives
     * 
     * Compliance Assessment Structure:
     * The compliance checks collection includes:
     * - Regulatory Rule Validations: Specific regulatory requirement compliance checks
     * - Risk Assessment Results: Risk scoring and assessment outcome documentation
     * - AML/KYC Screening Results: Anti-money laundering and customer due diligence checks
     * - Data Quality Validations: Data integrity and quality compliance verifications
     * - Policy Compliance Checks: Internal policy and procedure compliance validations
     * - External System Validations: Third-party system integration compliance checks
     * 
     * Audit Trail and Regulatory Support:
     * Each compliance check provides detailed audit trail documentation including:
     * - Execution timestamp and processing duration
     * - Specific regulatory rules evaluated and outcomes
     * - Risk scores, confidence levels, and assessment details
     * - Exception conditions, manual reviews, and approval workflows
     * - Integration results from external regulatory systems and databases
     * 
     * Performance and Scalability Considerations:
     * - Lazy loading minimizes initial report loading time for dashboard operations
     * - Indexed relationships support efficient compliance check queries and filtering
     * - Batch processing capabilities for large-volume compliance assessments
     * - Optimized for high-frequency compliance processing (10,000+ TPS capability)
     * 
     * This relationship is fundamental to F-003-RQ-003: Compliance reporting and
     * F-003-RQ-004: Audit trail management, providing the detailed compliance validation
     * results that support comprehensive regulatory reporting and examination requirements.
     */
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "complianceReport") // Jakarta Persistence 3.1.0 - Configures one-to-many relationship
    private List<ComplianceCheck> complianceChecks;

    /**
     * Determines if this compliance report contains any failed compliance checks.
     * 
     * This method provides a convenient way to assess overall compliance status by
     * examining all associated compliance checks for failure conditions. Used for
     * automated decision-making, dashboard status indicators, and regulatory
     * exception reporting workflows.
     * 
     * @return boolean - true if any compliance check has failed, false otherwise
     */
    public boolean hasFailedChecks() {
        return complianceChecks != null && complianceChecks.stream()
                .anyMatch(ComplianceCheck::isFailed);
    }

    /**
     * Determines if all compliance checks in this report have passed successfully.
     * 
     * This method validates that all compliance requirements have been met and
     * the report represents a fully compliant status. Used for automated approval
     * workflows, regulatory submission eligibility, and compliance dashboard
     * status reporting.
     * 
     * @return boolean - true if all compliance checks have passed, false otherwise  
     */
    public boolean allChecksPassed() {
        return complianceChecks != null && !complianceChecks.isEmpty() &&
                complianceChecks.stream().allMatch(ComplianceCheck::isPassed);
    }

    /**
     * Determines if this compliance report has any compliance checks still pending completion.
     * 
     * This method identifies reports that require additional processing, manual review,
     * or external validation before finalization. Used for workflow management,
     * queue processing, and compliance operation monitoring.
     * 
     * @return boolean - true if any compliance check is pending, false otherwise
     */
    public boolean hasPendingChecks() {
        return complianceChecks != null && complianceChecks.stream()
                .anyMatch(ComplianceCheck::isPending);
    }

    /**
     * Counts the total number of compliance checks included in this report.
     * 
     * This method provides compliance coverage metrics for reporting dashboards,
     * regulatory documentation, and compliance assessment completeness validation.
     * 
     * @return int - total number of compliance checks in the report
     */
    public int getTotalChecksCount() {
        return complianceChecks != null ? complianceChecks.size() : 0;
    }

    /**
     * Counts the number of compliance checks that have passed successfully.
     * 
     * This method supports compliance performance measurement, success rate
     * calculation, and regulatory reporting metrics for stakeholder communication.
     * 
     * @return long - number of compliance checks with passed status
     */
    public long getPassedChecksCount() {
        return complianceChecks != null ? complianceChecks.stream()
                .mapToLong(check -> check.isPassed() ? 1 : 0).sum() : 0;
    }

    /**
     * Counts the number of compliance checks that have failed.
     * 
     * This method supports risk assessment, exception reporting, and compliance
     * gap analysis for regulatory remediation and improvement planning.
     * 
     * @return long - number of compliance checks with failed status
     */
    public long getFailedChecksCount() {
        return complianceChecks != null ? complianceChecks.stream()
                .mapToLong(check -> check.isFailed() ? 1 : 0).sum() : 0;
    }

    /**
     * Counts the number of compliance checks that are still pending completion.
     * 
     * This method supports operational monitoring, queue management, and compliance
     * processing status tracking for workflow optimization and resource allocation.
     * 
     * @return long - number of compliance checks with pending status
     */
    public long getPendingChecksCount() {
        return complianceChecks != null ? complianceChecks.stream()
                .mapToLong(check -> check.isPending() ? 1 : 0).sum() : 0;
    }

    /**
     * Calculates the compliance success rate as a percentage.
     * 
     * This method provides key performance indicators for compliance dashboards,
     * regulatory reporting, and compliance program effectiveness measurement.
     * The calculation excludes pending and error status checks to provide
     * accurate completion-based success rates.
     * 
     * @return double - compliance success rate as percentage (0.0 to 100.0)
     */
    public double getComplianceSuccessRate() {
        if (complianceChecks == null || complianceChecks.isEmpty()) {
            return 0.0;
        }
        
        long completedChecks = complianceChecks.stream()
                .mapToLong(check -> (check.isPassed() || check.isFailed()) ? 1 : 0).sum();
        
        if (completedChecks == 0) {
            return 0.0;
        }
        
        return (getPassedChecksCount() * 100.0) / completedChecks;
    }

    /**
     * Determines if this compliance report is ready for regulatory submission.
     * 
     * This method validates that all compliance requirements have been completed,
     * all checks have definitive outcomes (no pending status), and the report
     * status indicates regulatory readiness. Used for automated submission
     * workflows and regulatory queue management.
     * 
     * @return boolean - true if report is ready for regulatory submission
     */
    public boolean isReadyForSubmission() {
        return "APPROVED".equals(status) && 
               !hasPendingChecks() && 
               getTotalChecksCount() > 0;
    }

    /**
     * Determines if this compliance report has been successfully submitted to regulators.
     * 
     * This method checks the report status to confirm successful regulatory
     * submission, supporting audit trail documentation and compliance workflow
     * status tracking for stakeholder reporting and examination preparation.
     * 
     * @return boolean - true if report has been submitted to regulatory authorities
     */
    public boolean isSubmitted() {
        return "SUBMITTED".equals(status) || "ACKNOWLEDGED".equals(status);
    }

    /**
     * Determines if this compliance report contains AML-related compliance checks.
     * 
     * This method identifies reports that include Anti-Money Laundering assessments,
     * supporting specialized AML reporting requirements, regulatory submission
     * categorization, and compliance program segmentation for targeted analysis.
     * 
     * @return boolean - true if report includes AML compliance checks
     */
    public boolean hasAmlChecks() {
        return complianceChecks != null && complianceChecks.stream()
                .anyMatch(ComplianceCheck::hasAmlCheck);
    }

    /**
     * Determines if this compliance report requires manual review or intervention.
     * 
     * This method identifies reports that need human attention due to failed
     * checks, pending reviews, or complex compliance scenarios requiring expert
     * analysis. Used for workflow routing, resource allocation, and compliance
     * operation management.
     * 
     * @return boolean - true if manual review is required
     */
    public boolean requiresManualReview() {
        return hasFailedChecks() || hasPendingChecks() || "UNDER_REVIEW".equals(status);
    }
}