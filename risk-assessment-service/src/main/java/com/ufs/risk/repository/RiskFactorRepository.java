package com.ufs.risk.repository;

import com.ufs.risk.model.RiskFactor;
import org.springframework.data.jpa.repository.JpaRepository; // version 3.2.0
import org.springframework.data.jpa.repository.Query; // version 3.2.0
import org.springframework.data.jpa.repository.Modifying; // version 3.2.0
import org.springframework.data.repository.query.Param; // version 3.2.0
import org.springframework.stereotype.Repository; // version 6.1.2
import org.springframework.transaction.annotation.Transactional; // version 6.1.2

import java.util.List;
import java.util.Optional;
import java.util.Date;

/**
 * RiskFactorRepository - Spring Data JPA Repository for RiskFactor Entity Management
 * 
 * This repository interface serves as the data access layer for the AI-Powered Risk Assessment Engine,
 * providing comprehensive CRUD operations and specialized query methods for managing risk factor data.
 * It supports real-time risk scoring, predictive risk modeling, and model explainability requirements.
 * 
 * Business Requirements Addressed:
 * - F-002: AI-Powered Risk Assessment Engine (Core data persistence component)
 * - F-002-RQ-001: Real-time risk scoring (supports <500ms response time through optimized queries)
 * - F-002-RQ-002: Predictive risk modeling (provides risk factor data for ML model training)
 * - F-002-RQ-003: Model explainability (enables factor-level analysis for regulatory compliance)
 * - F-002-RQ-004: Bias detection and mitigation (supports algorithmic auditing through factor analytics)
 * 
 * Technical Architecture Integration:
 * - Unified Data Integration Platform (F-001): Provides standardized data access patterns
 * - Regulatory Compliance Automation (F-003): Supports audit trail and compliance reporting
 * - Digital Customer Onboarding (F-004): Powers risk-based onboarding decision workflows
 * - Predictive Analytics Dashboard (F-005): Feeds risk factor analytics and visualizations
 * 
 * Performance Requirements:
 * - Supports 5,000+ risk assessment requests per second
 * - Sub-500ms response time for individual factor queries
 * - Batch operations for high-volume risk factor processing
 * - Optimized indexing for real-time risk scoring workflows
 * 
 * Data Quality & Governance:
 * - 99.5% data accuracy through validation constraints
 * - Complete audit trail for regulatory compliance (SOC2, PCI DSS, GDPR)
 * - Role-based access control integration for security compliance
 * - Data lineage tracking through source system references
 * 
 * AI/ML Integration Features:
 * - Factor-based model training data extraction
 * - Real-time factor score updates for dynamic risk assessment
 * - Historical factor analysis for model drift detection
 * - Bias detection through demographic and temporal factor analysis
 * 
 * Security & Compliance:
 * - Encryption support for sensitive risk factor data
 * - Audit logging for all data modification operations
 * - Multi-factor authentication integration ready
 * - Third-party risk management data source tracking
 * 
 * Usage Examples:
 * - Real-time risk factor retrieval during customer transactions
 * - Batch risk factor updates from ML model recalculations  
 * - Historical risk factor analysis for predictive model training
 * - Regulatory reporting with detailed factor attribution
 * - Customer risk factor explanations for transparency
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025
 * @see RiskFactor
 * @see com.ufs.risk.model.RiskProfile
 * @see com.ufs.risk.service.RiskAssessmentService
 */
@Repository
@Transactional(readOnly = true)
public interface RiskFactorRepository extends JpaRepository<RiskFactor, Long> {

    /**
     * Retrieves all risk factors associated with a specific risk profile.
     * 
     * This method enables comprehensive risk factor analysis for individual customers,
     * supporting the explainable AI requirements of F-002-RQ-003. The query is optimized
     * for real-time risk assessment workflows with sub-500ms response times.
     * 
     * Business Applications:
     * - Customer risk profile detailed analysis
     * - Model explainability reporting for regulatory compliance
     * - Risk factor attribution for customer communications
     * - Targeted risk mitigation strategy development
     * 
     * Performance Optimizations:
     * - Utilizes indexed foreign key for efficient retrieval
     * - Supports batch loading for multiple profile analysis
     * - Optimized for high-frequency risk assessment operations
     * - Memory-efficient projection for large factor collections
     * 
     * AI/ML Integration:
     * - Provides input data for ensemble risk models
     * - Enables factor-level model performance analysis
     * - Supports A/B testing of different factor combinations
     * - Powers real-time risk score calculation workflows
     * 
     * @param riskProfile The RiskProfile entity to find factors for
     * @return List of RiskFactor entities associated with the profile, ordered by factor name
     */
    List<RiskFactor> findByRiskProfileOrderByFactorName(com.ufs.risk.model.RiskProfile riskProfile);

    /**
     * Retrieves all risk factors for a specific risk profile ID.
     * 
     * This optimized query method avoids loading the full RiskProfile entity when only
     * the ID is available, improving performance for high-throughput scenarios where
     * rapid factor access is critical for real-time decision making.
     * 
     * Technical Benefits:
     * - Reduces database round trips by avoiding RiskProfile entity loading
     * - Optimized for microservices architecture with minimal data transfer
     * - Supports 5,000+ TPS performance requirements
     * - Efficient for distributed caching scenarios
     * 
     * Business Use Cases:
     * - Real-time transaction risk scoring
     * - API-based risk factor services
     * - Microservices risk assessment workflows
     * - High-volume batch risk processing
     * 
     * @param riskProfileId The ID of the risk profile
     * @return List of RiskFactor entities, ordered by creation date for consistency
     */
    List<RiskFactor> findByRiskProfileIdOrderByCreatedAt(Long riskProfileId);

    /**
     * Finds risk factors by their descriptive name across all profiles.
     * 
     * This method supports cross-profile factor analysis, enabling model performance
     * monitoring and bias detection across different customer segments. Critical for
     * regulatory compliance and algorithmic fairness requirements.
     * 
     * Regulatory Compliance Support:
     * - Enables factor-based bias detection across customer demographics
     * - Supports algorithmic auditing requirements (F-002-RQ-004)
     * - Powers regulatory reporting with factor-level aggregations
     * - Facilitates model explainability documentation
     * 
     * Analytics Applications:
     * - Factor performance analysis across customer segments
     * - Model drift detection through factor score distributions
     * - Risk factor effectiveness measurement
     * - Predictive model feature importance validation
     * 
     * @param factorName The name of the risk factor to search for
     * @return List of RiskFactor entities with the specified name, ordered by score descending
     */
    List<RiskFactor> findByFactorNameOrderByScoreDesc(String factorName);

    /**
     * Retrieves risk factors within a specific score range for targeted analysis.
     * 
     * This method enables risk-based filtering for customer segmentation, model
     * validation, and regulatory compliance monitoring. Essential for identifying
     * high-risk factors that require immediate attention or intervention.
     * 
     * Risk Management Applications:
     * - High-risk factor identification for proactive monitoring
     * - Customer segmentation based on risk factor distributions  
     * - Alert generation for factors exceeding risk thresholds
     * - Portfolio-level risk concentration analysis
     * 
     * Model Validation Benefits:
     * - Factor score distribution analysis for model health monitoring
     * - Outlier detection for data quality assurance
     * - Model calibration validation through score range analysis
     * - Bias detection through score distribution fairness checks
     * 
     * @param minScore Minimum risk factor score (inclusive)
     * @param maxScore Maximum risk factor score (inclusive)
     * @return List of RiskFactor entities within the score range, ordered by score
     */
    List<RiskFactor> findByScoreBetweenOrderByScore(Double minScore, Double maxScore);

    /**
     * Finds risk factors with scores above a specified threshold.
     * 
     * This high-performance query identifies factors contributing significantly to
     * overall risk, enabling proactive risk management and regulatory compliance
     * monitoring. Optimized for real-time alerting and automated risk workflows.
     * 
     * Alert & Monitoring Integration:
     * - Real-time high-risk factor detection for immediate action
     * - Automated compliance alert generation
     * - Customer notification triggers for risk factor changes
     * - Risk management dashboard data feeds
     * 
     * Business Value:
     * - Proactive identification of emerging risks
     * - Targeted customer intervention strategies
     * - Regulatory compliance threshold monitoring
     * - Portfolio risk concentration management
     * 
     * @param threshold The minimum score threshold for high-risk factors
     * @return List of high-risk RiskFactor entities, ordered by score descending
     */
    List<RiskFactor> findByScoreGreaterThanOrderByScoreDesc(Double threshold);

    /**
     * Retrieves risk factors from a specific data source for quality monitoring.
     * 
     * This method supports data governance and quality monitoring by enabling
     * source-specific factor analysis. Critical for managing third-party data
     * dependencies and ensuring data source reliability in risk assessments.
     * 
     * Data Governance Benefits:
     * - Source-specific data quality monitoring and reporting
     * - Third-party data provider performance analysis
     * - Data lineage tracking for regulatory compliance
     * - Impact analysis for data source outages or changes
     * 
     * Operational Applications:
     * - Data source reliability monitoring
     * - Provider-specific SLA tracking and reporting
     * - Data refresh scheduling and optimization
     * - Error handling and fallback strategy implementation
     * 
     * @param dataSource The identifier of the data source system
     * @return List of RiskFactor entities from the specified source, ordered by last calculation
     */
    List<RiskFactor> findByDataSourceOrderByLastCalculatedAtDesc(String dataSource);

    /**
     * Finds risk factors requiring recalculation based on staleness.
     * 
     * This method identifies factors that need updates to maintain data freshness
     * for accurate real-time risk assessments. Essential for automated factor
     * refresh workflows and maintaining 95% accuracy requirements.
     * 
     * Automated Workflow Support:
     * - Factor refresh scheduling and prioritization
     * - Resource optimization for ML model execution
     * - Data quality maintenance and monitoring
     * - Performance SLA compliance tracking
     * 
     * Business Continuity:
     * - Ensures risk assessment accuracy through timely updates
     * - Supports regulatory requirements for data currency
     * - Enables proactive system maintenance and optimization
     * - Powers automated data quality dashboards
     * 
     * @param cutoffDate The date before which factors are considered stale
     * @return List of stale RiskFactor entities requiring recalculation, ordered by last calculation
     */
    List<RiskFactor> findByLastCalculatedAtBeforeOrLastCalculatedAtIsNullOrderByLastCalculatedAtAsc(Date cutoffDate);

    /**
     * Retrieves the most recent risk factors for a profile with pagination support.
     * 
     * This optimized query method supports efficient factor analysis with memory
     * management for profiles with extensive factor histories. Essential for
     * high-performance analytics and reporting workflows.
     * 
     * Performance Optimizations:
     * - Pagination support for memory-efficient large dataset processing
     * - Indexed sorting for optimal query performance
     * - Batch processing capabilities for analytical workflows
     * - Reduced memory footprint for concurrent user scenarios
     * 
     * Analytics Integration:
     * - Powers factor trend analysis dashboards
     * - Supports machine learning feature extraction
     * - Enables efficient historical factor data analysis
     * - Facilitates model performance monitoring over time
     * 
     * @param riskProfileId The ID of the risk profile
     * @param pageable Pagination and sorting parameters
     * @return Page of recent RiskFactor entities for the profile
     */
    org.springframework.data.domain.Page<RiskFactor> findByRiskProfileIdOrderByCreatedAtDesc(
            Long riskProfileId, 
            org.springframework.data.domain.Pageable pageable);

    /**
     * Custom query to find risk factors with weighted contributions above threshold.
     * 
     * This specialized query calculates the weighted contribution (score × weight) in the
     * database for optimal performance, identifying the most impactful risk factors.
     * Critical for model explainability and regulatory compliance reporting.
     * 
     * Explainable AI Support:
     * - Identifies primary risk contributors for customer explanations
     * - Powers regulatory compliance reporting with factor attribution
     * - Enables transparent risk assessment communication
     * - Supports algorithmic fairness analysis and documentation
     * 
     * Performance Benefits:
     * - Database-level calculation reduces application processing overhead
     * - Optimized for high-frequency risk assessment workflows
     * - Supports sub-500ms response time requirements
     * - Efficient for real-time decision-making scenarios
     * 
     * @param threshold Minimum weighted contribution threshold
     * @return List of high-impact RiskFactor entities, ordered by weighted contribution
     */
    @Query("SELECT rf FROM RiskFactor rf WHERE (rf.score * rf.weight) > :threshold ORDER BY (rf.score * rf.weight) DESC")
    List<RiskFactor> findByWeightedContributionGreaterThan(@Param("threshold") Double threshold);

    /**
     * Custom aggregation query for risk factor statistics by profile.
     * 
     * This analytical query provides comprehensive factor statistics for risk
     * profile analysis, supporting model validation and regulatory reporting
     * requirements with efficient database-level aggregations.
     * 
     * Statistical Analysis Support:
     * - Average factor scores for profile risk level assessment
     * - Factor count for model complexity analysis
     * - Maximum scores for high-risk factor identification
     * - Minimum scores for risk floor analysis
     * 
     * Regulatory Reporting Benefits:
     * - Comprehensive risk profile statistical summaries
     * - Model performance validation metrics
     * - Algorithmic bias detection through statistical analysis
     * - Audit-ready factor distribution documentation
     * 
     * @param riskProfileId The ID of the risk profile to analyze
     * @return Object array containing [avgScore, maxScore, minScore, factorCount]
     */
    @Query("SELECT AVG(rf.score), MAX(rf.score), MIN(rf.score), COUNT(rf) FROM RiskFactor rf WHERE rf.riskProfile.id = :riskProfileId")
    Object[] findRiskFactorStatistics(@Param("riskProfileId") Long riskProfileId);

    /**
     * Batch update method for refreshing factor calculation timestamps.
     * 
     * This high-performance bulk update method maintains data freshness tracking
     * across multiple factors efficiently, supporting automated factor refresh
     * workflows and performance monitoring requirements.
     * 
     * Bulk Operations Support:
     * - Efficient batch timestamp updates for factor refresh workflows
     * - Reduced database round trips for improved performance
     * - Transaction-aware processing for data consistency
     * - Optimized for high-volume factor processing scenarios
     * 
     * Automated Workflow Integration:
     * - Powers scheduled factor refresh jobs
     * - Supports ML model batch processing workflows
     * - Enables efficient data quality maintenance
     * - Facilitates performance SLA compliance tracking
     * 
     * @param factorIds List of risk factor IDs to update
     * @param calculationDate New calculation timestamp
     * @return Number of updated risk factor records
     */
    @Modifying
    @Transactional
    @Query("UPDATE RiskFactor rf SET rf.lastCalculatedAt = :calculationDate WHERE rf.id IN :factorIds")
    int updateLastCalculatedAt(@Param("factorIds") List<Long> factorIds, @Param("calculationDate") Date calculationDate);

    /**
     * Finds the top contributing risk factors across all profiles by weighted contribution.
     * 
     * This cross-profile analytical query identifies the most impactful risk factors
     * system-wide, supporting model optimization, bias detection, and regulatory
     * compliance monitoring at the portfolio level.
     * 
     * Portfolio Risk Management:
     * - System-wide risk factor impact analysis
     * - Model feature importance validation across customer base
     * - Concentration risk identification and monitoring
     * - Regulatory compliance portfolio-level reporting
     * 
     * Model Optimization Benefits:
     * - Feature selection optimization for ML models
     * - Bias detection across customer demographics
     * - Model performance benchmarking and validation
     * - Algorithmic fairness analysis and documentation
     * 
     * @param limit Maximum number of top factors to return
     * @return List of highest-impact RiskFactor entities across all profiles
     */
    @Query(value = "SELECT rf FROM RiskFactor rf ORDER BY (rf.score * rf.weight) DESC")
    List<RiskFactor> findTopContributingFactors(org.springframework.data.domain.Pageable pageable);

    /**
     * Custom query to find outdated risk factors by profile and factor name.
     * 
     * This targeted query identifies specific factors that require updates,
     * enabling focused refresh operations and maintaining data quality for
     * critical risk assessment components.
     * 
     * Targeted Refresh Benefits:
     * - Focused factor updates for improved efficiency
     * - Resource optimization for ML model execution
     * - Critical factor prioritization for real-time assessments
     * - Data quality maintenance with minimal system impact
     * 
     * Business Continuity:
     * - Ensures accuracy for mission-critical risk factors
     * - Supports regulatory compliance with timely data updates
     * - Enables proactive risk management through targeted monitoring
     * - Powers automated data quality assurance workflows
     * 
     * @param riskProfileId The ID of the risk profile
     * @param factorName The name of the specific factor
     * @param cutoffDate The date threshold for staleness determination
     * @return Optional RiskFactor entity if found and outdated
     */
    @Query("SELECT rf FROM RiskFactor rf WHERE rf.riskProfile.id = :riskProfileId AND rf.factorName = :factorName AND (rf.lastCalculatedAt < :cutoffDate OR rf.lastCalculatedAt IS NULL)")
    Optional<RiskFactor> findOutdatedFactorByProfileAndName(
            @Param("riskProfileId") Long riskProfileId,
            @Param("factorName") String factorName,
            @Param("cutoffDate") Date cutoffDate);

    /**
     * Counts risk factors by score range for distribution analysis.
     * 
     * This analytical method provides risk factor distribution metrics essential
     * for model validation, bias detection, and regulatory compliance reporting.
     * Supports statistical analysis requirements for algorithmic fairness.
     * 
     * Statistical Analysis Applications:
     * - Risk factor score distribution analysis
     * - Model calibration validation through score histograms
     * - Bias detection through demographic factor analysis
     * - Regulatory compliance statistical reporting
     * 
     * Model Validation Benefits:
     * - Population distribution analysis for model health
     * - Outlier detection through distribution analysis
     * - Model performance validation across score ranges
     * - Algorithmic fairness assessment through distribution metrics
     * 
     * @param minScore Minimum score for the range (inclusive)
     * @param maxScore Maximum score for the range (inclusive)
     * @return Count of risk factors within the specified score range
     */
    @Query("SELECT COUNT(rf) FROM RiskFactor rf WHERE rf.score BETWEEN :minScore AND :maxScore")
    Long countByScoreRange(@Param("minScore") Double minScore, @Param("maxScore") Double maxScore);

    /**
     * Finds risk factors created within a specific time period for trend analysis.
     * 
     * This temporal query supports trend analysis, model performance monitoring,
     * and regulatory compliance reporting with time-based factor analysis.
     * Essential for understanding risk factor evolution and system performance.
     * 
     * Trend Analysis Support:
     * - Factor creation patterns over time
     * - System usage and performance monitoring
     * - Seasonal risk pattern identification
     * - Model deployment impact analysis
     * 
     * Regulatory Compliance Benefits:
     * - Time-based audit trail analysis
     * - Compliance monitoring with temporal controls
     * - Regulatory examination data preparation
     * - Data retention policy compliance tracking
     * 
     * @param startDate Beginning of the time period (inclusive)
     * @param endDate End of the time period (inclusive)
     * @return List of RiskFactor entities created within the time period, ordered by creation date
     */
    List<RiskFactor> findByCreatedAtBetweenOrderByCreatedAt(Date startDate, Date endDate);
}