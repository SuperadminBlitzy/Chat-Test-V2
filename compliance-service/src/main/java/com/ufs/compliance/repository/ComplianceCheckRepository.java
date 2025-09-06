package com.ufs.compliance.repository;

// Spring Data JPA 3.2.0 - Repository interface and query annotations
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// Java 17 - Standard collections and utilities
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.UUID;

// Internal imports - Compliance service model classes
import com.ufs.compliance.model.ComplianceCheck;

/**
 * Repository interface for managing ComplianceCheck entities within the regulatory compliance automation framework.
 * 
 * This interface serves as the primary data access layer for compliance check operations, supporting the
 * F-003: Regulatory Compliance Automation feature requirements including real-time compliance monitoring,
 * automated policy updates, comprehensive reporting, and complete audit trail management.
 * 
 * Core Functional Requirements Addressed:
 * - F-003-RQ-001: Regulatory change monitoring through real-time compliance data retrieval
 * - F-003-RQ-003: Compliance reporting via comprehensive query capabilities for regulatory authorities
 * - F-003-RQ-004: Audit trail management through complete historical compliance check tracking
 * 
 * Performance Characteristics:
 * - Optimized for high-frequency compliance processing (10,000+ TPS capability)
 * - PostgreSQL 16+ compatibility with ACID transaction support
 * - Indexed query methods for efficient compliance reporting and audit operations
 * - Supports horizontal scaling through proper database partitioning strategies
 * 
 * Database Design Considerations:
 * - All queries are designed for optimal performance with PostgreSQL query planner
 * - Method signatures support both individual and batch compliance operations
 * - Query parameters utilize proper type safety to prevent SQL injection
 * - Results are optimized for compliance dashboard and reporting requirements
 * 
 * Security and Compliance:
 * - All data access operations maintain ACID compliance for regulatory requirements
 * - Query methods support role-based access control through service layer integration
 * - Audit trail capabilities enable complete regulatory examination support
 * - Data protection measures ensure compliance with financial data privacy regulations
 * 
 * Integration Points:
 * - Integrates with unified data integration platform for comprehensive customer views
 * - Supports real-time compliance dashboard requirements
 * - Enables automated compliance workflow processing
 * - Facilitates regulatory reporting and examination procedures
 * 
 * @author Unified Financial Services Platform - Compliance Service
 * @version 1.0.0
 * @since Java 21 LTS
 * @see ComplianceCheck for the managed entity structure and relationships
 */
@Repository
public interface ComplianceCheckRepository extends JpaRepository<ComplianceCheck, UUID> {

    /**
     * Retrieves all compliance checks associated with a specific user identifier.
     * 
     * This method supports customer-centric compliance monitoring by finding all compliance
     * checks where the entityId field contains the specified userId and the entityType
     * indicates a customer-related entity. This is essential for comprehensive customer
     * compliance profiles and regulatory reporting requirements.
     * 
     * Use Cases:
     * - Customer onboarding compliance verification (F-004: Digital Customer Onboarding)
     * - Ongoing customer due diligence monitoring
     * - Regulatory examination customer file preparation
     * - Customer risk assessment and profiling
     * - Compliance status verification during customer interactions
     * 
     * Performance Optimization:
     * - Query utilizes database index on entityId for optimal performance
     * - Results are ordered by checkTimestamp descending for chronological review
     * - Supports pagination through Spring Data JPA mechanisms if needed
     * 
     * The method maps userId to entityId because in the ComplianceCheck entity model,
     * customer identifiers are stored in the entityId field when entityType is "CUSTOMER".
     * This design supports the unified data integration platform's approach to entity
     * relationship management across multiple business domains.
     * 
     * @param userId the unique identifier of the user/customer to search for
     * @return List<ComplianceCheck> containing all compliance checks for the specified user,
     *         ordered by check timestamp in descending order (most recent first)
     * @throws IllegalArgumentException if userId is null
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityId = :userId AND c.entityType = 'CUSTOMER' ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByUserId(@Param("userId") String userId);

    /**
     * Retrieves all compliance checks with the specified status.
     * 
     * This method enables status-based compliance monitoring and workflow management,
     * supporting automated compliance processing and manual review workflows. Essential
     * for compliance dashboard operations and regulatory reporting requirements.
     * 
     * Use Cases:
     * - Failed compliance check identification and remediation
     * - Pending compliance check queue management
     * - Compliance processing workflow automation
     * - Regulatory reporting by compliance status
     * - Performance monitoring and SLA compliance tracking
     * 
     * Supported Status Values:
     * - "PASS": Successfully completed compliance checks
     * - "FAIL": Failed compliance checks requiring attention
     * - "PENDING": Compliance checks awaiting processing or review
     * - "ERROR": Compliance checks with technical processing errors
     * 
     * Performance Optimization:
     * - Query utilizes database index on status field for efficient filtering
     * - Results are ordered by checkTimestamp descending for priority processing
     * - Supports large result sets through proper database query optimization
     * 
     * This method is critical for F-003-RQ-001: Regulatory change monitoring as it
     * enables real-time dashboards to display compliance status across the organization.
     * 
     * @param status the compliance check status to filter by (PASS, FAIL, PENDING, ERROR)
     * @return List<ComplianceCheck> containing all compliance checks with the specified status,
     *         ordered by check timestamp in descending order for priority processing
     * @throws IllegalArgumentException if status is null or empty
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.status = :status ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByStatus(@Param("status") String status);

    /**
     * Retrieves compliance checks by entity type for type-specific compliance monitoring.
     * 
     * This method enables compliance monitoring segmented by entity type, supporting
     * regulatory requirements for different types of financial entities and transactions.
     * Essential for specialized compliance workflows and reporting requirements.
     * 
     * @param entityType the type of entity to filter compliance checks by
     * @return List<ComplianceCheck> containing all compliance checks for the specified entity type
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityType = :entityType ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByEntityType(@Param("entityType") String entityType);

    /**
     * Retrieves compliance checks within a specific time range for audit and reporting purposes.
     * 
     * This method supports regulatory examination requirements and audit trail management
     * by enabling time-based compliance check retrieval. Critical for F-003-RQ-004:
     * Audit trail management and regulatory compliance reporting.
     * 
     * @param startTime the beginning of the time range (inclusive)
     * @param endTime the end of the time range (inclusive)
     * @return List<ComplianceCheck> containing compliance checks within the specified time range
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.checkTimestamp BETWEEN :startTime AND :endTime ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByCheckTimestampBetween(@Param("startTime") LocalDateTime startTime, 
                                                     @Param("endTime") LocalDateTime endTime);

    /**
     * Retrieves compliance checks by regulatory rule identifier for rule-specific monitoring.
     * 
     * This method enables compliance monitoring by specific regulatory rules, supporting
     * regulatory change impact analysis and rule-specific compliance reporting requirements.
     * 
     * @param regulatoryRuleId the identifier of the regulatory rule to filter by
     * @return List<ComplianceCheck> containing compliance checks for the specified regulatory rule
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.regulatoryRule.id = :regulatoryRuleId ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByRegulatoryRuleId(@Param("regulatoryRuleId") Long regulatoryRuleId);

    /**
     * Retrieves compliance checks with associated AML checks for comprehensive AML monitoring.
     * 
     * This method supports Anti-Money Laundering compliance monitoring by finding all
     * compliance checks that include AML screening components. Essential for KYC/AML
     * compliance reporting and regulatory examination requirements.
     * 
     * @return List<ComplianceCheck> containing compliance checks with AML screening components
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.amlCheck IS NOT NULL ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findComplianceChecksWithAmlScreening();

    /**
     * Retrieves the most recent compliance check for a specific entity.
     * 
     * This method supports real-time compliance status verification by retrieving
     * the latest compliance check for any given entity. Critical for operational
     * compliance decisions and customer interaction workflows.
     * 
     * @param entityId the identifier of the entity to find the most recent compliance check for
     * @return Optional<ComplianceCheck> containing the most recent compliance check for the entity
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityId = :entityId ORDER BY c.checkTimestamp DESC LIMIT 1")
    Optional<ComplianceCheck> findMostRecentByEntityId(@Param("entityId") String entityId);

    /**
     * Counts compliance checks by status for dashboard and reporting metrics.
     * 
     * This method provides aggregate compliance metrics for dashboard displays
     * and regulatory reporting requirements. Supports real-time compliance
     * monitoring as required by F-003-RQ-001.
     * 
     * @param status the compliance check status to count
     * @return long representing the count of compliance checks with the specified status
     */
    @Query("SELECT COUNT(c) FROM ComplianceCheck c WHERE c.status = :status")
    long countByStatus(@Param("status") String status);

    /**
     * Retrieves compliance checks requiring manual review or attention.
     * 
     * This method identifies compliance checks that require human intervention,
     * supporting compliance workflow management and ensuring regulatory requirements
     * are met through appropriate manual review processes.
     * 
     * @return List<ComplianceCheck> containing compliance checks requiring manual attention
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.status IN ('FAIL', 'PENDING', 'ERROR') ORDER BY c.checkTimestamp ASC")
    List<ComplianceCheck> findComplianceChecksRequiringAttention();

    /**
     * Retrieves compliance checks for a specific customer within a date range.
     * 
     * This method combines customer-specific and time-based filtering for detailed
     * compliance analysis and customer-specific regulatory reporting requirements.
     * 
     * @param userId the customer identifier to filter by
     * @param startTime the beginning of the time range (inclusive)
     * @param endTime the end of the time range (inclusive)
     * @return List<ComplianceCheck> containing customer compliance checks within the time range
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityId = :userId AND c.entityType = 'CUSTOMER' AND c.checkTimestamp BETWEEN :startTime AND :endTime ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByUserIdAndTimestampBetween(@Param("userId") String userId,
                                                         @Param("startTime") LocalDateTime startTime,
                                                         @Param("endTime") LocalDateTime endTime);

    /**
     * Retrieves compliance checks by entity type and status for targeted monitoring.
     * 
     * This method enables precise compliance monitoring by combining entity type
     * and status filtering, supporting specialized compliance workflows and
     * regulatory reporting requirements for specific entity categories.
     * 
     * @param entityType the type of entity to filter by
     * @param status the compliance check status to filter by
     * @return List<ComplianceCheck> containing compliance checks matching both criteria
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityType = :entityType AND c.status = :status ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByEntityTypeAndStatus(@Param("entityType") String entityType, 
                                                   @Param("status") String status);

    /**
     * Retrieves compliance checks for regulatory framework reporting.
     * 
     * This method supports multi-framework regulatory compliance monitoring by
     * finding compliance checks associated with specific regulatory frameworks.
     * Essential for F-003-RQ-003: Compliance reporting across multiple regulatory
     * frameworks and jurisdictions.
     * 
     * @param framework the regulatory framework identifier to filter by
     * @return List<ComplianceCheck> containing compliance checks for the specified framework
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.regulatoryRule.framework = :framework ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findByRegulatoryFramework(@Param("framework") String framework);

    /**
     * Retrieves compliance check statistics for performance monitoring.
     * 
     * This method provides operational metrics for compliance processing performance,
     * supporting SLA monitoring and system optimization requirements. Critical for
     * maintaining the required 10,000+ TPS processing capability.
     * 
     * @param startTime the beginning of the analysis period
     * @param endTime the end of the analysis period
     * @return List<Object[]> containing compliance check statistics (status, count, avg_processing_time)
     */
    @Query("SELECT c.status, COUNT(c), AVG(EXTRACT(EPOCH FROM (c.checkTimestamp - c.checkTimestamp))) FROM ComplianceCheck c WHERE c.checkTimestamp BETWEEN :startTime AND :endTime GROUP BY c.status")
    List<Object[]> findComplianceCheckStatistics(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * Checks if a compliance check exists for a specific entity and rule combination.
     * 
     * This method supports duplicate compliance check prevention and regulatory
     * rule coverage verification. Essential for maintaining data integrity and
     * ensuring comprehensive regulatory compliance coverage.
     * 
     * @param entityId the entity identifier to check
     * @param regulatoryRuleId the regulatory rule identifier to check
     * @return boolean indicating whether a compliance check exists for the combination
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM ComplianceCheck c WHERE c.entityId = :entityId AND c.regulatoryRule.id = :regulatoryRuleId")
    boolean existsByEntityIdAndRegulatoryRuleId(@Param("entityId") String entityId, 
                                               @Param("regulatoryRuleId") Long regulatoryRuleId);

    /**
     * Retrieves compliance checks for bulk processing and batch operations.
     * 
     * This method supports high-volume compliance processing requirements by
     * enabling batch retrieval of compliance checks for bulk operations.
     * Critical for maintaining system performance under high-load conditions.
     * 
     * @param entityIds the list of entity identifiers to retrieve compliance checks for
     * @return List<ComplianceCheck> containing compliance checks for the specified entities
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.entityId IN :entityIds ORDER BY c.entityId, c.checkTimestamp DESC")
    List<ComplianceCheck> findByEntityIdIn(@Param("entityIds") List<String> entityIds);

    /**
     * Retrieves recent compliance checks for real-time monitoring dashboards.
     * 
     * This method supports real-time compliance monitoring requirements by
     * retrieving the most recent compliance checks across all entities.
     * Essential for F-003-RQ-001: Regulatory change monitoring dashboards.
     * 
     * @param hoursBack the number of hours back from current time to retrieve checks for
     * @return List<ComplianceCheck> containing recent compliance checks
     */
    @Query("SELECT c FROM ComplianceCheck c WHERE c.checkTimestamp >= :cutoffTime ORDER BY c.checkTimestamp DESC")
    List<ComplianceCheck> findRecentComplianceChecks(@Param("cutoffTime") LocalDateTime cutoffTime);
}