package com.ufs.compliance.model;

// Jakarta Persistence 3.1.0 - JPA entity and field mapping annotations
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

// Java 21 - SQL Timestamp for audit trail
import java.sql.Timestamp;

/**
 * Anti-Money Laundering (AML) Check Entity
 * 
 * Represents a comprehensive AML screening check performed as part of the compliance
 * process for digital customer onboarding and ongoing monitoring. This entity stores
 * the detailed results of screening customers or transactions against various national
 * and international watchlists, sanctions lists, and Politically Exposed Person (PEP)
 * databases as required by regulatory frameworks including:
 * 
 * - Bank Secrecy Act (BSA) requirements
 * - FinCEN Customer Due Diligence (CDD) Rule
 * - OFAC Sanctions Programs
 * - EU Anti-Money Laundering Directives
 * - FATF Recommendations
 * 
 * The entity maintains a foreign key relationship to the parent ComplianceCheck
 * via complianceCheckId, enabling comprehensive audit trails and regulatory
 * reporting capabilities.
 * 
 * This implementation supports the F-004 Digital Customer Onboarding functional
 * requirement, specifically addressing KYC/AML compliance checks and worldwide
 * watchlist screening mandates.
 * 
 * @author UFS Compliance Service
 * @version 1.0.0
 * @since Java 21 LTS
 */
@Entity
public class AmlCheck {

    /**
     * Primary key identifier for the AML check record.
     * 
     * Auto-generated using database sequence to ensure uniqueness
     * and optimal database performance in high-volume compliance
     * processing scenarios.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key reference to the parent ComplianceCheck entity.
     * 
     * Establishes the relationship between this AML check and the broader
     * compliance assessment, enabling hierarchical compliance reporting
     * and audit trail maintenance as required by regulatory frameworks.
     * 
     * This field is mandatory as every AML check must be associated with
     * a parent compliance process for proper regulatory documentation.
     */
    @Column(name = "compliance_check_id", nullable = false)
    private Long complianceCheckId;

    /**
     * Source identifier for the watchlist or sanctions database consulted.
     * 
     * Identifies the specific watchlist source used for screening, such as:
     * - OFAC Specially Designated Nationals (SDN) List
     * - EU Consolidated Sanctions List
     * - UN Security Council Sanctions List
     * - World Bank Debarred Firms and Individuals
     * - Interpol Red Notices
     * - National sanctions and watchlists
     * - PEP databases
     * - Adverse media databases
     * 
     * This information is critical for compliance reporting and audit purposes,
     * demonstrating due diligence in screening against appropriate databases.
     */
    @Column(name = "watchlist_source", nullable = false, length = 255)
    private String watchlistSource;

    /**
     * Match status result from the watchlist screening process.
     * 
     * Indicates the outcome of the screening against the specified watchlist:
     * - "NO_MATCH": No matches found, indicating clear status
     * - "POTENTIAL_MATCH": Possible match requiring manual review
     * - "CONFIRMED_MATCH": Verified match requiring immediate action
     * - "FALSE_POSITIVE": Initially flagged but determined to be incorrect
     * - "PENDING_REVIEW": Match under investigation by compliance team
     * 
     * This field is essential for automated compliance workflows and
     * escalation procedures as defined in the institution's AML program.
     */
    @Column(name = "match_status", nullable = false, length = 50)
    private String matchStatus;

    /**
     * Risk level assessment based on the AML screening results.
     * 
     * Categorizes the risk associated with the customer or transaction:
     * - "LOW": Minimal risk, standard processing approved
     * - "MEDIUM": Elevated risk, enhanced due diligence required
     * - "HIGH": Significant risk, senior management approval needed
     * - "CRITICAL": Extreme risk, potential prohibited activity
     * 
     * Risk levels align with the institution's risk appetite framework
     * and regulatory guidance on risk-based approaches to compliance.
     * This field drives automated decision-making and escalation protocols.
     */
    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    /**
     * Detailed information about the AML check results and findings.
     * 
     * Contains comprehensive details about the screening process including:
     * - Specific match criteria that triggered alerts
     * - Similarity scores and matching algorithms used
     * - Additional context from adverse media searches
     * - Cross-reference information from multiple databases
     * - Analyst comments and investigation notes
     * - Disposition rationale for compliance decisions
     * 
     * This field supports regulatory examination requirements for detailed
     * documentation of compliance procedures and decision-making processes.
     * The information stored here may be subject to regulatory review and
     * must maintain appropriate confidentiality and data protection standards.
     */
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    /**
     * Timestamp indicating when the AML check was performed.
     * 
     * Critical for regulatory compliance and audit purposes, this timestamp
     * establishes the exact time of screening for:
     * - Compliance with real-time screening requirements
     * - Audit trail documentation
     * - Regulatory reporting timelines
     * - Investigation and forensic analysis
     * - Data retention policy enforcement
     * 
     * The timestamp uses database precision to ensure accuracy for
     * high-frequency transaction monitoring and compliance reporting.
     */
    @Column(name = "checked_at", nullable = false)
    private Timestamp checkedAt;

    /**
     * Default constructor for JPA entity instantiation.
     * 
     * Required by the Jakarta Persistence specification for entity
     * management and ORM operations. This constructor enables the
     * JPA provider to create entity instances during database
     * query result processing and entity lifecycle management.
     * 
     * Application code should use appropriate setter methods or
     * builder patterns to populate entity fields after instantiation
     * to ensure proper validation and business rule compliance.
     */
    public AmlCheck() {
        // Default constructor for JPA entity requirements
        // Entity fields will be populated via setter methods or JPA provider
    }

    /**
     * Retrieves the unique identifier for this AML check record.
     * 
     * @return Long - The primary key identifier, null if entity is not persisted
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this AML check record.
     * 
     * Note: This method should typically only be called by the JPA provider
     * during entity persistence operations. Application code should rely on
     * auto-generation for primary key assignment.
     * 
     * @param id Long - The primary key identifier to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the foreign key reference to the parent compliance check.
     * 
     * @return Long - The compliance check identifier this AML check belongs to
     */
    public Long getComplianceCheckId() {
        return complianceCheckId;
    }

    /**
     * Sets the foreign key reference to the parent compliance check.
     * 
     * This establishes the hierarchical relationship between the AML check
     * and its parent compliance assessment. The compliance check ID must
     * reference a valid, existing ComplianceCheck entity.
     * 
     * @param complianceCheckId Long - The parent compliance check identifier
     * @throws IllegalArgumentException if complianceCheckId is null
     */
    public void setComplianceCheckId(Long complianceCheckId) {
        if (complianceCheckId == null) {
            throw new IllegalArgumentException("Compliance check ID cannot be null - AML checks must be associated with a parent compliance process");
        }
        this.complianceCheckId = complianceCheckId;
    }

    /**
     * Retrieves the watchlist source identifier used for screening.
     * 
     * @return String - The watchlist or sanctions database source name
     */
    public String getWatchlistSource() {
        return watchlistSource;
    }

    /**
     * Sets the watchlist source identifier for this AML screening.
     * 
     * The source should clearly identify the specific database or list
     * consulted during the screening process for audit and reporting purposes.
     * 
     * @param watchlistSource String - The watchlist source identifier
     * @throws IllegalArgumentException if watchlistSource is null or empty
     */
    public void setWatchlistSource(String watchlistSource) {
        if (watchlistSource == null || watchlistSource.trim().isEmpty()) {
            throw new IllegalArgumentException("Watchlist source cannot be null or empty - must specify the screening database used");
        }
        this.watchlistSource = watchlistSource.trim();
    }

    /**
     * Retrieves the match status result from the screening process.
     * 
     * @return String - The match status indicating screening outcome
     */
    public String getMatchStatus() {
        return matchStatus;
    }

    /**
     * Sets the match status result from the watchlist screening.
     * 
     * Status should conform to standardized values for consistent
     * processing and reporting across the compliance system.
     * 
     * @param matchStatus String - The screening match status
     * @throws IllegalArgumentException if matchStatus is null or empty
     */
    public void setMatchStatus(String matchStatus) {
        if (matchStatus == null || matchStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Match status cannot be null or empty - must indicate screening result");
        }
        this.matchStatus = matchStatus.trim();
    }

    /**
     * Retrieves the risk level assessment for this AML check.
     * 
     * @return String - The risk level categorization
     */
    public String getRiskLevel() {
        return riskLevel;
    }

    /**
     * Sets the risk level assessment based on screening results.
     * 
     * Risk level should align with the institution's risk framework
     * and drive appropriate compliance workflows and approvals.
     * 
     * @param riskLevel String - The risk level categorization
     * @throws IllegalArgumentException if riskLevel is null or empty
     */
    public void setRiskLevel(String riskLevel) {
        if (riskLevel == null || riskLevel.trim().isEmpty()) {
            throw new IllegalArgumentException("Risk level cannot be null or empty - must categorize compliance risk");
        }
        this.riskLevel = riskLevel.trim();
    }

    /**
     * Retrieves the detailed information about the AML check results.
     * 
     * @return String - Comprehensive details of screening results and findings
     */
    public String getDetails() {
        return details;
    }

    /**
     * Sets detailed information about the AML check results and process.
     * 
     * Details should provide sufficient information for regulatory
     * examination and audit purposes while maintaining appropriate
     * confidentiality and data protection standards.
     * 
     * @param details String - Detailed screening information and findings
     */
    public void setDetails(String details) {
        this.details = details;
    }

    /**
     * Retrieves the timestamp when the AML check was performed.
     * 
     * @return Timestamp - The exact time of AML screening execution
     */
    public Timestamp getCheckedAt() {
        return checkedAt;
    }

    /**
     * Sets the timestamp when the AML check was performed.
     * 
     * Timestamp is critical for regulatory compliance, audit trails,
     * and establishing the timing of screening activities for
     * compliance reporting and investigation purposes.
     * 
     * @param checkedAt Timestamp - The time when screening was performed
     * @throws IllegalArgumentException if checkedAt is null
     */
    public void setCheckedAt(Timestamp checkedAt) {
        if (checkedAt == null) {
            throw new IllegalArgumentException("Check timestamp cannot be null - must record when AML screening was performed");
        }
        this.checkedAt = checkedAt;
    }

    /**
     * Provides a string representation of the AML check entity.
     * 
     * This method supports debugging and logging operations while
     * being mindful of sensitive compliance information that should
     * not be exposed in standard logging or error messages.
     * 
     * @return String representation highlighting key identifying information
     */
    @Override
    public String toString() {
        return String.format(
            "AmlCheck{id=%d, complianceCheckId=%d, watchlistSource='%s', matchStatus='%s', riskLevel='%s', checkedAt=%s}",
            id, complianceCheckId, watchlistSource, matchStatus, riskLevel, checkedAt
        );
    }

    /**
     * Determines equality based on the unique identifier.
     * 
     * Two AML check entities are considered equal if they have the same
     * primary key identifier, following JPA entity equality best practices.
     * 
     * @param obj Object to compare with this AML check
     * @return boolean indicating whether the objects are equal
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        AmlCheck amlCheck = (AmlCheck) obj;
        return id != null && id.equals(amlCheck.id);
    }

    /**
     * Generates hash code based on the unique identifier.
     * 
     * Consistent with the equals method implementation, using the
     * primary key for hash code generation to support proper
     * behavior in hash-based collections.
     * 
     * @return int hash code for this entity
     */
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}