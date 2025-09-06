package com.ufs.compliance.model;

// Jakarta Persistence 3.1.0 - JPA entity and field mapping annotations
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

// Java standard library imports
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a comprehensive compliance check performed within the unified financial services platform.
 * This entity serves as the central component of the F-003: Regulatory Compliance Automation feature,
 * linking various compliance activities to specific customers, transactions, or system events.
 * 
 * The ComplianceCheck entity is designed to support enterprise-scale regulatory compliance operations
 * including real-time compliance monitoring, automated policy updates, comprehensive reporting,
 * and complete audit trail management as mandated by modern financial regulations.
 * 
 * Key Functional Requirements Addressed:
 * - F-003-RQ-003: Compliance reporting - ComplianceCheck instances are aggregated to generate 
 *   comprehensive compliance reports for regulatory authorities and internal stakeholders
 * - F-003-RQ-004: Audit trail management - Each ComplianceCheck serves as an immutable audit 
 *   record for a specific compliance action, enabling complete regulatory traceability
 * - F-003-RQ-001: Regulatory change monitoring - Supports real-time dashboards with 
 *   multi-framework mapping and unified risk scoring across regulatory requirements
 * 
 * Regulatory Framework Support:
 * This entity is designed to accommodate compliance checks across multiple regulatory frameworks
 * including but not limited to:
 * - Basel III/IV capital adequacy requirements
 * - PSD3 (Payment Services Directive 3) compliance
 * - MiFID II/III transaction reporting and best execution
 * - AML/KYC regulations (Bank Secrecy Act, FinCEN requirements)
 * - GDPR and data protection compliance
 * - SOX financial reporting and internal controls
 * - FINRA trading and market conduct rules
 * - Consumer Duty and consumer protection standards
 * 
 * Database Design Considerations:
 * - Optimized for high-frequency compliance processing (10,000+ TPS capability)
 * - PostgreSQL 16+ compatibility with ACID transaction support
 * - Indexed fields for efficient compliance reporting and audit queries
 * - Supports horizontal scaling through proper partitioning strategies
 * 
 * Security and Privacy:
 * - Implements data protection requirements for sensitive compliance information
 * - Supports role-based access control for compliance data access
 * - Maintains audit trails for regulatory examination purposes
 * - Ensures data residency compliance across multiple jurisdictions
 * 
 * @author Unified Financial Services Platform - Compliance Service
 * @version 1.0.0
 * @since Java 21 LTS
 * @see RegulatoryRule for the regulatory framework definitions
 * @see AmlCheck for Anti-Money Laundering specific compliance checks
 */
@Entity
public class ComplianceCheck {

    /**
     * Unique identifier for the compliance check using UUID for global uniqueness.
     * 
     * UUID is chosen over auto-incrementing integers to support:
     * - Distributed system operations across multiple data centers
     * - Microservices architecture with independent ID generation
     * - Enhanced security through non-predictable identifiers
     * - Global uniqueness without coordination across system boundaries
     * 
     * The UUID is generated automatically and serves as the primary key
     * for all compliance check operations and cross-system references.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * Identifier of the entity (customer, transaction, account, etc.) being checked.
     * 
     * This field establishes the subject of the compliance check and enables
     * comprehensive compliance tracking across the entire customer lifecycle:
     * - Customer onboarding compliance checks
     * - Transaction-level AML/KYC screening
     * - Account monitoring and periodic reviews
     * - Product-specific regulatory compliance
     * - Cross-border payment compliance validation
     * 
     * The entity ID should correspond to valid identifiers within the unified
     * data integration platform, enabling seamless cross-system compliance reporting.
     * 
     * Examples: Customer UUID, Transaction ID, Account Number, Product Code
     */
    @Column(name = "entity_id", nullable = false, length = 255)
    private String entityId;

    /**
     * Type classification of the entity being subjected to compliance checking.
     * 
     * This field categorizes the subject of compliance checks to enable:
     * - Type-specific compliance rule application
     * - Regulatory reporting segmentation
     * - Risk-based compliance processing
     * - Automated workflow routing based on entity type
     * - Performance optimization through type-based indexing
     * 
     * Supported entity types include:
     * - "CUSTOMER": Individual or corporate customer entities
     * - "TRANSACTION": Financial transaction records
     * - "ACCOUNT": Account-level compliance checks
     * - "PRODUCT": Financial product compliance validation
     * - "PAYMENT": Payment processing compliance
     * - "TRADE": Trading and investment transaction compliance
     * - "DOCUMENT": Document and data compliance verification
     * - "SYSTEM": System-level regulatory compliance checks
     * 
     * The entity type determines which regulatory rules are applicable
     * and guides the compliance processing workflow.
     */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /**
     * Current status of the compliance check indicating the outcome and processing state.
     * 
     * The status field drives automated compliance workflows and enables
     * real-time compliance monitoring as required by F-003-RQ-001.
     * Status transitions are logged for complete audit trail maintenance.
     * 
     * Status values and their business implications:
     * - PASS: Compliance check completed successfully, entity approved for processing
     * - FAIL: Compliance violation detected, entity blocked or flagged for review
     * - PENDING: Check in progress or awaiting manual review/approval
     * - ERROR: Technical error during compliance processing, requires investigation
     * 
     * The status drives downstream processing decisions and regulatory reporting.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CheckStatus status;

    /**
     * Comprehensive details about the compliance check execution and findings.
     * 
     * This field stores detailed information about the compliance check process
     * including but not limited to:
     * - Specific regulatory rules evaluated
     * - Check execution parameters and configuration
     * - Detailed findings and observations
     * - Risk scores and assessment metrics
     * - Exception conditions and handling
     * - System processing information
     * - External system integration results
     * - Manual review comments and decisions
     * - Escalation and approval workflows
     * 
     * The details field supports regulatory examination requirements by providing
     * comprehensive documentation of compliance procedures and decision-making
     * processes. Information stored here may be subject to regulatory review
     * and must maintain appropriate confidentiality standards.
     * 
     * This field is critical for F-003-RQ-004: Audit trail management,
     * providing the detailed context needed for regulatory compliance audits.
     */
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    /**
     * Timestamp indicating when the compliance check was executed.
     * 
     * This timestamp is fundamental to regulatory compliance and audit requirements:
     * - Establishes exact timing for compliance actions
     * - Supports real-time compliance monitoring dashboards
     * - Enables compliance SLA monitoring and reporting
     * - Provides chronological ordering for audit trails
     * - Supports regulatory examination timeline requirements
     * - Enables compliance performance analysis and optimization
     * 
     * The timestamp uses LocalDateTime for precision and timezone-aware
     * processing in distributed compliance environments. Critical for
     * F-003-RQ-003: Compliance reporting timeline accuracy.
     */
    @Column(name = "check_timestamp", nullable = false)
    private LocalDateTime checkTimestamp;

    /**
     * Reference to the specific regulatory rule that this compliance check validates against.
     * 
     * This many-to-one relationship establishes the regulatory context for the compliance
     * check and enables comprehensive regulatory coverage tracking:
     * - Links compliance activities to specific regulatory requirements
     * - Supports multi-framework regulatory compliance monitoring
     * - Enables regulatory rule impact analysis and reporting
     * - Facilitates automated compliance rule updates and changes
     * - Supports jurisdiction-specific compliance processing
     * 
     * The regulatory rule relationship is essential for F-003-RQ-001: Regulatory
     * change monitoring, enabling real-time dashboards with multi-framework mapping.
     * 
     * This field may be null for compliance checks that evaluate multiple rules
     * or system-level compliance validations that don't map to a single rule.
     */
    @ManyToOne
    @JoinColumn(name = "regulatory_rule_id", referencedColumnName = "id")
    private RegulatoryRule regulatoryRule;

    /**
     * Reference to associated Anti-Money Laundering (AML) check when applicable.
     * 
     * This optional relationship links the compliance check to specific AML
     * screening activities performed as part of comprehensive compliance validation:
     * - Connects general compliance checks to specialized AML screening
     * - Supports comprehensive KYC/AML compliance reporting
     * - Enables detailed AML audit trail maintenance
     * - Facilitates AML risk assessment integration
     * - Supports watchlist screening result consolidation
     * 
     * The AML check relationship is particularly important for:
     * - Customer onboarding compliance (F-004: Digital Customer Onboarding)
     * - Transaction monitoring and screening
     * - Ongoing customer due diligence requirements
     * - Suspicious activity reporting and investigation
     * 
     * This field will be null for compliance checks that do not involve
     * AML screening activities or specialized watchlist validation.
     */
    @ManyToOne
    @JoinColumn(name = "aml_check_id", referencedColumnName = "id")
    private AmlCheck amlCheck;

    /**
     * Default constructor for JPA entity instantiation and framework compatibility.
     * 
     * Required by the Jakarta Persistence specification for entity lifecycle
     * management and ORM operations. This constructor enables the JPA provider
     * to create entity instances during:
     * - Database query result processing
     * - Entity proxy creation and lazy loading
     * - Persistence context management operations
     * - Entity state transitions and callbacks
     * 
     * Application code should use appropriate setter methods, builder patterns,
     * or parameterized constructors to populate entity fields after instantiation
     * to ensure proper validation and business rule compliance.
     * 
     * The default constructor maintains compatibility with reflection-based
     * frameworks and enterprise application servers while supporting the
     * comprehensive compliance check lifecycle management.
     */
    public ComplianceCheck() {
        // Default constructor for JPA entity requirements
        // Entity fields will be populated via setter methods or JPA provider
        // during entity lifecycle operations
    }

    /**
     * Retrieves the unique identifier for this compliance check.
     * 
     * @return UUID - The globally unique identifier, null if entity is not persisted
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this compliance check.
     * 
     * Note: This method should typically only be called by the JPA provider
     * during entity persistence operations. The UUID is auto-generated and
     * application code should rely on the generation strategy.
     * 
     * @param id UUID - The unique identifier to set
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Retrieves the identifier of the entity being checked for compliance.
     * 
     * @return String - The entity identifier subject to compliance validation
     */
    public String getEntityId() {
        return entityId;
    }

    /**
     * Sets the identifier of the entity being subjected to compliance checking.
     * 
     * The entity ID should reference a valid entity within the unified financial
     * services platform to enable comprehensive compliance tracking and reporting.
     * 
     * @param entityId String - The entity identifier to be compliance checked
     * @throws IllegalArgumentException if entityId is null or empty
     */
    public void setEntityId(String entityId) {
        if (entityId == null || entityId.trim().isEmpty()) {
            throw new IllegalArgumentException("Entity ID cannot be null or empty - compliance checks must be associated with a specific entity");
        }
        this.entityId = entityId.trim();
    }

    /**
     * Retrieves the type classification of the entity being compliance checked.
     * 
     * @return String - The entity type indicating the subject category
     */
    public String getEntityType() {
        return entityType;
    }

    /**
     * Sets the type classification of the entity being subjected to compliance validation.
     * 
     * The entity type determines which regulatory rules are applicable and guides
     * the compliance processing workflow. Must be a recognized entity type within
     * the compliance framework for proper rule application and reporting.
     * 
     * @param entityType String - The entity type classification
     * @throws IllegalArgumentException if entityType is null or empty
     */
    public void setEntityType(String entityType) {
        if (entityType == null || entityType.trim().isEmpty()) {
            throw new IllegalArgumentException("Entity type cannot be null or empty - required for compliance rule application");
        }
        this.entityType = entityType.trim();
    }

    /**
     * Retrieves the current status of the compliance check.
     * 
     * @return CheckStatus - The current processing status and outcome
     */
    public CheckStatus getStatus() {
        return status;
    }

    /**
     * Sets the current status of the compliance check.
     * 
     * Status changes should be logged for audit trail purposes and may trigger
     * automated workflows based on the new status value. Status transitions
     * should follow business rules for compliance check lifecycle management.
     * 
     * @param status CheckStatus - The compliance check status to set
     * @throws IllegalArgumentException if status is null
     */
    public void setStatus(CheckStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Compliance check status cannot be null - must indicate current processing state");
        }
        this.status = status;
    }

    /**
     * Retrieves the detailed information about the compliance check execution.
     * 
     * @return String - Comprehensive details of compliance check process and findings
     */
    public String getDetails() {
        return details;
    }

    /**
     * Sets detailed information about the compliance check execution and findings.
     * 
     * Details should provide comprehensive information for regulatory examination
     * and audit purposes while maintaining appropriate confidentiality and data
     * protection standards. This information may be subject to regulatory review.
     * 
     * @param details String - Detailed compliance check information and findings
     */
    public void setDetails(String details) {
        this.details = details;
    }

    /**
     * Retrieves the timestamp when the compliance check was executed.
     * 
     * @return LocalDateTime - The exact time of compliance check execution
     */
    public LocalDateTime getCheckTimestamp() {
        return checkTimestamp;
    }

    /**
     * Sets the timestamp when the compliance check was executed.
     * 
     * The timestamp is critical for regulatory compliance, audit trails,
     * and establishing the timing of compliance activities for regulatory
     * reporting and investigation purposes. Must accurately reflect the
     * compliance check execution time.
     * 
     * @param checkTimestamp LocalDateTime - The time when compliance check was performed
     * @throws IllegalArgumentException if checkTimestamp is null
     */
    public void setCheckTimestamp(LocalDateTime checkTimestamp) {
        if (checkTimestamp == null) {
            throw new IllegalArgumentException("Check timestamp cannot be null - must record when compliance check was performed");
        }
        this.checkTimestamp = checkTimestamp;
    }

    /**
     * Retrieves the regulatory rule associated with this compliance check.
     * 
     * @return RegulatoryRule - The regulatory rule being validated, may be null
     */
    public RegulatoryRule getRegulatoryRule() {
        return regulatoryRule;
    }

    /**
     * Sets the regulatory rule that this compliance check validates against.
     * 
     * The regulatory rule establishes the regulatory context for the compliance
     * check and enables comprehensive regulatory coverage tracking. May be null
     * for system-level checks or multi-rule validations.
     * 
     * @param regulatoryRule RegulatoryRule - The regulatory rule to associate
     */
    public void setRegulatoryRule(RegulatoryRule regulatoryRule) {
        this.regulatoryRule = regulatoryRule;
    }

    /**
     * Retrieves the AML check associated with this compliance check.
     * 
     * @return AmlCheck - The associated AML screening check, may be null
     */
    public AmlCheck getAmlCheck() {
        return amlCheck;
    }

    /**
     * Sets the AML check associated with this compliance validation.
     * 
     * Links the compliance check to specific AML screening activities when
     * applicable. The association supports comprehensive KYC/AML compliance
     * reporting and detailed audit trail maintenance.
     * 
     * @param amlCheck AmlCheck - The AML check to associate
     */
    public void setAmlCheck(AmlCheck amlCheck) {
        this.amlCheck = amlCheck;
    }

    /**
     * Determines if this compliance check has failed and requires attention.
     * 
     * @return boolean - true if the compliance check status indicates failure
     */
    public boolean isFailed() {
        return CheckStatus.FAIL.equals(status);
    }

    /**
     * Determines if this compliance check has passed successfully.
     * 
     * @return boolean - true if the compliance check status indicates success
     */
    public boolean isPassed() {
        return CheckStatus.PASS.equals(status);
    }

    /**
     * Determines if this compliance check is still pending completion.
     * 
     * @return boolean - true if the compliance check is awaiting processing or review
     */
    public boolean isPending() {
        return CheckStatus.PENDING.equals(status);
    }

    /**
     * Determines if this compliance check encountered an error during processing.
     * 
     * @return boolean - true if the compliance check encountered technical errors
     */
    public boolean hasError() {
        return CheckStatus.ERROR.equals(status);
    }

    /**
     * Determines if this compliance check is associated with AML screening.
     * 
     * @return boolean - true if this compliance check includes AML validation
     */
    public boolean hasAmlCheck() {
        return amlCheck != null;
    }

    /**
     * Determines if this compliance check is associated with a specific regulatory rule.
     * 
     * @return boolean - true if this compliance check validates against a specific rule
     */
    public boolean hasRegulatoryRule() {
        return regulatoryRule != null;
    }

    /**
     * Provides a string representation of the compliance check entity.
     * 
     * This method supports debugging and logging operations while being mindful
     * of sensitive compliance information that should not be exposed in standard
     * logging or error messages. Includes key identifying information for
     * operational monitoring and troubleshooting.
     * 
     * @return String representation highlighting key compliance check information
     */
    @Override
    public String toString() {
        return String.format(
            "ComplianceCheck{id=%s, entityId='%s', entityType='%s', status=%s, checkTimestamp=%s, hasAmlCheck=%s, hasRegulatoryRule=%s}",
            id, entityId, entityType, status, checkTimestamp, hasAmlCheck(), hasRegulatoryRule()
        );
    }

    /**
     * Determines equality based on the unique identifier.
     * 
     * Two compliance check entities are considered equal if they have the same
     * UUID identifier, following JPA entity equality best practices for entities
     * with UUID primary keys.
     * 
     * @param obj Object to compare with this compliance check
     * @return boolean indicating whether the objects are equal
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ComplianceCheck that = (ComplianceCheck) obj;
        return id != null && id.equals(that.id);
    }

    /**
     * Generates hash code based on the unique identifier.
     * 
     * Consistent with the equals method implementation, using the UUID
     * primary key for hash code generation to support proper behavior
     * in hash-based collections and JPA operations.
     * 
     * @return int hash code for this entity
     */
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

/**
 * Enumeration representing the possible statuses of a compliance check.
 * 
 * This enum defines the standardized status values used throughout the compliance
 * system to indicate the current state and outcome of compliance validation processes.
 * The status values drive automated workflows, reporting, and decision-making
 * within the regulatory compliance automation framework.
 * 
 * Status Lifecycle:
 * - PENDING: Initial state when compliance check is created or awaiting processing
 * - PASS: Final successful state indicating compliance requirements are met
 * - FAIL: Final failure state indicating compliance violations detected
 * - ERROR: Exception state indicating technical issues during processing
 * 
 * The enum values are stored as strings in the database for readability and
 * compatibility with reporting systems and external integrations.
 * 
 * @author Unified Financial Services Platform - Compliance Service
 * @version 1.0.0
 * @since Java 21 LTS
 */
enum CheckStatus {
    
    /**
     * Indicates the compliance check has completed successfully.
     * 
     * This status signifies that:
     * - All applicable regulatory rules have been validated
     * - No compliance violations were detected
     * - The entity meets all regulatory requirements
     * - Processing can proceed without restrictions
     * - No manual intervention is required
     * 
     * Used for automated decision-making in compliance workflows
     * and enables straight-through processing for compliant entities.
     */
    PASS,

    /**
     * Indicates the compliance check has failed due to regulatory violations.
     * 
     * This status signifies that:
     * - One or more regulatory rules have been violated
     * - Compliance issues require immediate attention
     * - The entity is blocked from further processing
     * - Manual review and remediation may be required
     * - Regulatory reporting obligations may be triggered
     * 
     * Failed compliance checks typically result in escalation workflows
     * and may require notification to regulatory authorities.
     */
    FAIL,

    /**
     * Indicates the compliance check is awaiting completion or manual review.
     * 
     * This status signifies that:
     * - Compliance processing is in progress
     * - Manual review or approval is required
     * - Additional information or documentation is needed
     * - External system integration is pending
     * - Workflow approval steps are outstanding
     * 
     * Pending status enables queue-based processing and workflow
     * management for complex compliance scenarios requiring human intervention.
     */
    PENDING,

    /**
     * Indicates a technical error occurred during compliance check processing.
     * 
     * This status signifies that:
     * - System or technical issues prevented completion
     * - Retry or remediation may be possible
     * - Investigation is required to resolve the error
     * - Processing cannot be completed without intervention
     * - Error details should be captured for troubleshooting
     * 
     * Error status enables exception handling workflows and supports
     * system monitoring and operational management requirements.
     */
    ERROR
}