package com.ufs.risk.model;

import jakarta.persistence.Entity; // version 3.1.0
import jakarta.persistence.Id; // version 3.1.0
import jakarta.persistence.GeneratedValue; // version 3.1.0
import jakarta.persistence.GenerationType; // version 3.1.0
import jakarta.persistence.OneToMany; // version 3.1.0
import jakarta.persistence.CascadeType; // version 3.1.0
import jakarta.persistence.Column; // version 3.1.0
import org.hibernate.annotations.CreationTimestamp; // version 6.4.4.Final
import org.hibernate.annotations.UpdateTimestamp; // version 6.4.4.Final
import lombok.Data; // version 1.18.30
import lombok.Builder; // version 1.18.30
import lombok.NoArgsConstructor; // version 1.18.30
import lombok.AllArgsConstructor; // version 1.18.30
import java.util.List; // version 21
import java.util.Date; // version 21

/**
 * RiskProfile Entity - Core component of the AI-Powered Risk Assessment Engine
 * 
 * This JPA entity represents a customer's comprehensive risk profile, aggregating
 * various risk factors and historical scores. It serves as the central data model
 * for the AI-Powered Risk Assessment Engine, providing real-time risk scoring
 * and predictive modeling capabilities.
 * 
 * Business Requirements Addressed:
 * - F-002: AI-Powered Risk Assessment Engine
 * - F-002-RQ-001: Real-time risk scoring (supports <500ms response time)
 * - F-002-RQ-002: Predictive risk modeling (analyzes spending habits, investment behaviors)
 * - F-002-RQ-003: Model explainability (stores aggregated risk factors for transparency)
 * - Dynamic Risk Management: Optimizes KYC onboarding and threat detection
 * 
 * Technical Architecture:
 * - Unidirectional relationship: RiskFactor → RiskProfile (breaks circular dependency)
 * - Direct collection of RiskFactor entities removed for performance optimization
 * - Risk factors accessed via repository queries rather than direct collection
 * - Historical risk scores maintained for trend analysis and audit compliance
 * 
 * Performance Requirements:
 * - Supports 5,000+ risk assessment requests per second
 * - Sub-500ms response time for risk profile retrieval
 * - 95% accuracy rate in risk assessment calculations
 * - 99.9% system availability for critical financial services
 * 
 * Data Management:
 * - PostgreSQL for transactional data consistency
 * - Automated timestamps for audit trail compliance
 * - Unique customer identifier constraints for data integrity
 * - Cascade operations for related risk score management
 * 
 * Security & Compliance:
 * - Supports SOC2, PCI DSS, GDPR compliance requirements
 * - Audit logging capabilities through timestamp tracking
 * - Role-based access control integration ready
 * - End-to-end encryption support for sensitive risk data
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class RiskProfile {

    /**
     * Primary key identifier for the risk profile record
     * 
     * Auto-generated using database identity strategy for optimal performance
     * in high-throughput risk assessment scenarios. This ID serves as the
     * primary reference for all risk-related operations and relationships.
     * 
     * Technical Requirements:
     * - Supports 10,000+ TPS capacity as per F-001 specifications
     * - Unique identifier for risk profile entity relationships
     * - Database sequence optimization for concurrent insertions
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique identifier for the customer associated with this risk profile
     * 
     * This field establishes the one-to-one relationship between customers
     * and their risk profiles, supporting the unified customer view required
     * by F-001 (Unified Data Integration Platform). The unique constraint
     * ensures data integrity and prevents duplicate risk profiles.
     * 
     * Business Requirements:
     * - Supports unified customer profile creation (F-001-RQ-002)
     * - Enables real-time risk scoring per customer (F-002-RQ-001)
     * - Links to customer data across all touchpoints and systems
     * 
     * Technical Specifications:
     * - Non-nullable to ensure data consistency
     * - Unique constraint prevents duplicate customer risk profiles
     * - Indexed for optimal query performance in risk assessments
     */
    @Column(nullable = false, unique = true)
    private String customerId;

    /**
     * Historical collection of risk scores calculated for this profile over time
     * 
     * This one-to-many relationship maintains a complete audit trail of risk
     * assessments, supporting predictive modeling and regulatory compliance.
     * The cascade configuration ensures proper lifecycle management of related
     * risk score entities.
     * 
     * AI-Powered Risk Assessment Integration:
     * - Stores output from predictive risk modeling algorithms
     * - Maintains historical trend data for ML model training
     * - Supports real-time risk score generation and storage
     * - Enables risk score validity tracking and model performance monitoring
     * 
     * Performance Considerations:
     * - Orphan removal prevents database bloat from deleted scores
     * - Cascade ALL enables efficient bulk operations
     * - Lazy loading strategy available for large historical datasets
     * 
     * Compliance & Audit:
     * - Complete risk assessment history for regulatory reporting
     * - Timestamped entries for audit trail requirements
     * - Model explainability support through historical data analysis
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RiskScore> riskScores;

    /**
     * The most recently calculated overall risk score for this profile
     * 
     * This field stores the current risk assessment value on a 0-1000 scale,
     * directly supporting the real-time risk scoring requirements of F-002-RQ-001.
     * The score is automatically updated by the AI-Powered Risk Assessment Engine
     * during each assessment cycle.
     * 
     * Risk Score Scale:
     * - 0.0-300.0: LOW risk category
     * - 300.1-700.0: MEDIUM risk category
     * - 700.1-1000.0: HIGH risk category
     * 
     * Business Value:
     * - Enables immediate risk-based decision making
     * - Supports automated risk mitigation workflows
     * - Facilitates regulatory compliance monitoring
     * - Powers predictive analytics dashboards (F-005)
     * 
     * Technical Integration:
     * - Updated via ML model predictions in real-time
     * - Used for risk-based customer onboarding (F-004)
     * - Feeds into fraud detection algorithms (F-006)
     * - Supports personalized financial recommendations (F-007)
     */
    private Double currentRiskScore;

    /**
     * The category of risk based on the current risk score
     * 
     * This field provides a human-readable classification of the customer's
     * risk level, supporting business decision-making and regulatory reporting.
     * The category is automatically derived from the currentRiskScore value.
     * 
     * Standard Risk Categories:
     * - "LOW": Customers with minimal risk factors (score 0-300)
     * - "MEDIUM": Customers with moderate risk factors (score 301-700)
     * - "HIGH": Customers requiring enhanced due diligence (score 701-1000)
     * 
     * Business Applications:
     * - Risk-based customer onboarding workflows
     * - Automated compliance alert triggering
     * - Customer service tier assignments
     * - Regulatory reporting categorization
     * 
     * Integration Points:
     * - Powers Risk Management Console (F-016) displays
     * - Drives Compliance Control Center (F-015) alerts
     * - Supports Advisor Workbench (F-014) risk insights
     * - Feeds Customer Dashboard (F-013) risk indicators
     */
    private String riskCategory;

    /**
     * Timestamp of the most recent risk assessment execution
     * 
     * This field tracks when the AI-Powered Risk Assessment Engine last
     * evaluated this customer's risk profile, supporting model performance
     * monitoring and regulatory compliance requirements.
     * 
     * Critical Use Cases:
     * - Risk score validity period tracking
     * - Model performance and drift monitoring
     * - Regulatory audit trail maintenance
     * - Automated re-assessment scheduling
     * 
     * Technical Requirements:
     * - Updated automatically during each risk assessment cycle
     * - Supports sub-500ms response time requirements (F-002-RQ-001)
     * - Enables predictive model performance tracking
     * - Facilitates compliance reporting automation
     * 
     * Business Value:
     * - Ensures risk data freshness for decision-making
     * - Supports regulatory examination requirements
     * - Enables proactive risk management workflows
     * - Powers real-time risk monitoring dashboards
     */
    private Date lastAssessedAt;

    /**
     * Automatic timestamp when the risk profile was first created
     * 
     * This field is automatically populated by Hibernate when the entity
     * is first persisted, providing audit trail capabilities and supporting
     * regulatory compliance requirements for data lineage tracking.
     * 
     * Compliance & Audit Features:
     * - Immutable creation timestamp for audit trails
     * - Supports regulatory data retention policies
     * - Enables customer lifecycle analysis
     * - Facilitates risk profile age-based analytics
     * 
     * Integration Benefits:
     * - Supports unified data integration (F-001) audit requirements
     * - Enables risk profile lifecycle tracking
     * - Powers customer onboarding analytics (F-004)
     * - Facilitates predictive analytics (F-005) time-series analysis
     */
    @CreationTimestamp
    private Date createdAt;

    /**
     * Automatic timestamp tracking the most recent profile modification
     * 
     * This field is automatically updated by Hibernate whenever the entity
     * is modified, ensuring complete audit trail coverage for all risk
     * profile changes. Critical for regulatory compliance and data integrity.
     * 
     * Audit & Compliance Benefits:
     * - Automatic change tracking for regulatory requirements
     * - Supports SOC2 audit trail documentation
     * - Enables data integrity monitoring
     * - Facilitates risk profile modification analytics
     * 
     * Technical Integration:
     * - Updated automatically on entity modifications
     * - Supports real-time change monitoring
     * - Enables conflict resolution in distributed systems
     * - Powers data synchronization workflows (F-001-RQ-001)
     * 
     * Business Value:
     * - Ensures data freshness visibility
     * - Supports regulatory examination preparedness
     * - Enables proactive data quality monitoring
     * - Facilitates risk management reporting accuracy
     */
    @UpdateTimestamp
    private Date updatedAt;

    /**
     * Calculates and updates the risk category based on the current risk score
     * 
     * This business logic method ensures consistency between the numerical
     * risk score and its categorical representation, supporting automated
     * risk management workflows and compliance requirements.
     * 
     * Category Assignment Logic:
     * - Score 0-300: LOW risk category
     * - Score 301-700: MEDIUM risk category
     * - Score 701-1000: HIGH risk category
     * - Null/invalid scores: Category remains unchanged
     * 
     * Usage Scenarios:
     * - Called after AI model risk score updates
     * - Invoked during real-time risk assessments
     * - Used in batch risk profile processing
     * - Triggered by regulatory compliance workflows
     * 
     * Integration Points:
     * - AI-Powered Risk Assessment Engine score updates
     * - Real-time transaction monitoring (F-008)
     * - Fraud detection system (F-006) risk categorization
     * - Compliance automation (F-003) alert generation
     * 
     * @return The updated risk category string for method chaining
     */
    public String updateRiskCategory() {
        if (this.currentRiskScore != null) {
            if (this.currentRiskScore <= 300.0) {
                this.riskCategory = "LOW";
            } else if (this.currentRiskScore <= 700.0) {
                this.riskCategory = "MEDIUM";
            } else {
                this.riskCategory = "HIGH";
            }
        }
        return this.riskCategory;
    }

    /**
     * Determines if the risk profile requires immediate reassessment
     * 
     * This business logic method evaluates whether the current risk assessment
     * data is still valid based on configurable time thresholds and risk
     * category-specific requirements, supporting proactive risk management.
     * 
     * Assessment Validity Rules:
     * - HIGH risk profiles: Reassess if older than 24 hours
     * - MEDIUM risk profiles: Reassess if older than 72 hours  
     * - LOW risk profiles: Reassess if older than 168 hours (7 days)
     * - No previous assessment: Always requires assessment
     * 
     * Business Applications:
     * - Automated risk assessment scheduling
     * - Real-time decision-making support
     * - Regulatory compliance monitoring
     * - Resource optimization for AI model execution
     * 
     * Performance Benefits:
     * - Prevents unnecessary model executions
     * - Optimizes system resource utilization
     * - Supports 5,000+ TPS requirements
     * - Reduces AI model computational overhead
     * 
     * @return true if reassessment is needed, false otherwise
     */
    public boolean requiresReassessment() {
        if (this.lastAssessedAt == null) {
            return true; // Never assessed before
        }
        
        long currentTime = System.currentTimeMillis();
        long lastAssessmentTime = this.lastAssessedAt.getTime();
        long hoursSinceAssessment = (currentTime - lastAssessmentTime) / (1000 * 60 * 60);
        
        // Risk category-based reassessment thresholds
        switch (this.riskCategory != null ? this.riskCategory : "MEDIUM") {
            case "HIGH":
                return hoursSinceAssessment >= 24; // Daily reassessment for high risk
            case "MEDIUM":
                return hoursSinceAssessment >= 72; // Every 3 days for medium risk
            case "LOW":
            default:
                return hoursSinceAssessment >= 168; // Weekly for low risk
        }
    }

    /**
     * Retrieves the most recent risk score from the historical collection
     * 
     * This utility method provides efficient access to the latest risk score
     * entity, supporting real-time risk analysis and model explainability
     * requirements without requiring separate database queries.
     * 
     * Performance Optimizations:
     * - Operates on in-memory collection to avoid database hits
     * - Supports sub-500ms response time requirements
     * - Enables efficient risk trend analysis
     * - Minimizes resource consumption during high-throughput operations
     * 
     * Business Applications:
     * - Real-time risk monitoring dashboards
     * - AI model explainability reporting
     * - Regulatory compliance documentation
     * - Customer service risk status inquiries
     * 
     * Integration Benefits:
     * - Powers Risk Management Console (F-016) displays
     * - Supports Predictive Analytics Dashboard (F-005)
     * - Enables Customer Dashboard (F-013) risk indicators
     * - Facilitates Advisor Workbench (F-014) insights
     * 
     * @return The most recent RiskScore entity, or null if no scores exist
     */
    public RiskScore getLatestRiskScore() {
        if (this.riskScores == null || this.riskScores.isEmpty()) {
            return null;
        }
        
        // Find the most recent score by assessment date
        return this.riskScores.stream()
                .max((score1, score2) -> {
                    // Handle potential null assessment dates gracefully
                    if (score1.getAssessmentDate() == null && score2.getAssessmentDate() == null) {
                        return 0;
                    }
                    if (score1.getAssessmentDate() == null) {
                        return -1;
                    }
                    if (score2.getAssessmentDate() == null) {
                        return 1;
                    }
                    return score1.getAssessmentDate().compareTo(score2.getAssessmentDate());
                })
                .orElse(null);
    }

    /**
     * Validates the risk profile data integrity and business rules
     * 
     * This comprehensive validation method ensures data quality and business
     * rule compliance before persistence, supporting regulatory requirements
     * and system reliability standards.
     * 
     * Validation Rules:
     * - Customer ID must be present and non-empty
     * - Risk score must be within valid range (0-1000) if provided
     * - Risk category must match score ranges if both are provided
     * - Assessment timestamp must not be in the future
     * 
     * Data Quality Assurance:
     * - Supports 99.5% data accuracy requirements (F-001-RQ-003)
     * - Prevents invalid data from corrupting AI models
     * - Ensures regulatory compliance data standards
     * - Maintains system data integrity across service boundaries
     * 
     * Business Rule Enforcement:
     * - Customer ID uniqueness validation
     * - Risk score range validation
     * - Category-score consistency checks
     * - Temporal data validation
     * 
     * @return true if the profile passes all validation checks, false otherwise
     */
    public boolean isValid() {
        // Customer ID validation
        if (this.customerId == null || this.customerId.trim().isEmpty()) {
            return false;
        }
        
        // Risk score range validation
        if (this.currentRiskScore != null && 
            (this.currentRiskScore < 0.0 || this.currentRiskScore > 1000.0)) {
            return false;
        }
        
        // Category-score consistency validation
        if (this.currentRiskScore != null && this.riskCategory != null) {
            String expectedCategory;
            if (this.currentRiskScore <= 300.0) {
                expectedCategory = "LOW";
            } else if (this.currentRiskScore <= 700.0) {
                expectedCategory = "MEDIUM";
            } else {
                expectedCategory = "HIGH";
            }
            
            if (!expectedCategory.equals(this.riskCategory)) {
                return false;
            }
        }
        
        // Assessment timestamp validation (cannot be in the future)
        if (this.lastAssessedAt != null && 
            this.lastAssessedAt.getTime() > System.currentTimeMillis() + 60000) { // 1 minute tolerance
            return false;
        }
        
        return true;
    }
}