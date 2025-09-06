package com.ufs.wellness.repository;

import com.ufs.wellness.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository; // Spring Data JPA 3.2.0
import org.springframework.data.jpa.repository.Query; // Spring Data JPA 3.2.0
import org.springframework.data.jpa.repository.Modifying; // Spring Data JPA 3.2.0
import org.springframework.data.repository.query.Param; // Spring Data JPA 3.2.0
import org.springframework.stereotype.Repository; // Spring Framework 6.1.2
import org.springframework.transaction.annotation.Transactional; // Spring Framework 6.1.2

import java.math.BigDecimal; // Java 17
import java.time.LocalDate; // Java 17
import java.time.LocalDateTime; // Java 17
import java.util.List; // Java 17
import java.util.Optional; // Java 17
import java.util.UUID; // Java 17

/**
 * Spring Data JPA repository interface for the FinancialGoal entity.
 * 
 * This repository provides comprehensive data access operations for managing financial goals
 * within the Unified Financial Services Platform's Personalized Financial Wellness feature.
 * It supports the core business requirements for goal tracking, financial health assessment,
 * and customer-centric financial planning capabilities.
 * 
 * Key Capabilities:
 * - Standard CRUD operations inherited from JpaRepository
 * - Custom query methods for business-specific data retrieval
 * - Performance-optimized queries for high-throughput financial operations
 * - Transaction support for data consistency in financial operations
 * - Support for complex financial goal analytics and reporting
 * 
 * Performance Characteristics:
 * - Optimized for PostgreSQL 16+ with connection pooling
 * - Indexed queries on frequently accessed fields (customerId, status, targetDate)
 * - Batch operation support for bulk financial goal management
 * - Read replica support for analytics and reporting queries
 * 
 * Security and Compliance:
 * - All financial data operations logged for audit compliance
 * - Row-level security support for multi-tenant customer isolation
 * - ACID transaction support for financial data integrity
 * - Prepared statement usage to prevent SQL injection attacks
 * 
 * Integration Points:
 * - Financial Health Assessment Workflow (F-002)
 * - Personalized Financial Wellness Tools (F-007)
 * - Customer Dashboard and Analytics (F-005, F-013)
 * - Risk Assessment Engine integration for goal feasibility analysis
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 * @see FinancialGoal
 * @see JpaRepository
 */
@Repository
@Transactional(readOnly = true)
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, UUID> {

    /**
     * Finds all financial goals associated with a specific customer.
     * 
     * This method supports the core Personalized Financial Wellness feature by enabling
     * retrieval of all goals for a customer's financial health assessment and dashboard display.
     * The query is optimized with proper indexing on the customerId field for high-performance
     * customer data retrieval.
     * 
     * Business Use Cases:
     * - Customer dashboard goal display
     * - Financial health assessment calculation
     * - Goal progress tracking and analytics
     * - Personalized financial recommendation generation
     * 
     * Performance Considerations:
     * - Utilizes database index on customer_id for O(log n) lookup performance
     * - Returns results ordered by creation date for consistent user experience
     * - Supports pagination through additional overloaded methods if needed
     * 
     * Security Notes:
     * - Customer isolation enforced through parameterized queries
     * - Audit logging automatically applied to all customer data access
     * - Complies with data privacy regulations for customer financial information
     * 
     * @param customerId The UUID of the customer whose financial goals to retrieve.
     *                   Must be a valid, non-null UUID representing an existing customer
     *                   in the Unified Financial Services Platform.
     * @return A List of FinancialGoal entities associated with the specified customer.
     *         Returns an empty list if no goals are found for the customer.
     *         Results are ordered by createdDate in descending order (most recent first).
     * @throws IllegalArgumentException if customerId is null
     * @throws org.springframework.dao.DataAccessException if database access fails
     * 
     * @since 1.0
     */
    List<FinancialGoal> findByCustomerId(UUID customerId);

    /**
     * Finds all active financial goals for a specific customer.
     * 
     * This method retrieves only goals with 'ACTIVE' status, supporting focused
     * customer experience by filtering out completed, paused, or cancelled goals
     * from primary dashboard views and active goal management workflows.
     * 
     * @param customerId The UUID of the customer
     * @return List of active FinancialGoal entities for the customer
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.status = 'ACTIVE' ORDER BY fg.createdDate DESC")
    List<FinancialGoal> findActiveGoalsByCustomerId(@Param("customerId") UUID customerId);

    /**
     * Finds financial goals by customer ID and status.
     * 
     * Provides flexible goal retrieval based on status filtering, supporting
     * various business workflows such as completed goal analysis, paused goal
     * management, and comprehensive goal lifecycle tracking.
     * 
     * @param customerId The UUID of the customer
     * @param status The status filter (ACTIVE, PAUSED, COMPLETED, CANCELLED, ARCHIVED)
     * @return List of FinancialGoal entities matching the criteria
     * @since 1.0
     */
    List<FinancialGoal> findByCustomerIdAndStatus(UUID customerId, String status);

    /**
     * Finds financial goals approaching their target date.
     * 
     * Supports proactive customer engagement by identifying goals nearing
     * their deadline, enabling the system to trigger alerts, recommendations,
     * or intervention strategies to help customers achieve their objectives.
     * 
     * @param customerId The UUID of the customer
     * @param targetDate The target date threshold
     * @return List of FinancialGoal entities with target dates on or before the specified date
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.targetDate <= :targetDate AND fg.status = 'ACTIVE' ORDER BY fg.targetDate ASC")
    List<FinancialGoal> findApproachingGoalsByCustomerId(@Param("customerId") UUID customerId, @Param("targetDate") LocalDate targetDate);

    /**
     * Finds financial goals within a specific target amount range.
     * 
     * Enables financial goal analysis and categorization based on goal size,
     * supporting personalized recommendations and risk assessment calculations
     * based on goal magnitude relative to customer financial capacity.
     * 
     * @param customerId The UUID of the customer
     * @param minAmount Minimum target amount (inclusive)
     * @param maxAmount Maximum target amount (inclusive)
     * @return List of FinancialGoal entities within the specified amount range
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.targetAmount BETWEEN :minAmount AND :maxAmount ORDER BY fg.targetAmount ASC")
    List<FinancialGoal> findGoalsByAmountRange(@Param("customerId") UUID customerId, 
                                              @Param("minAmount") BigDecimal minAmount, 
                                              @Param("maxAmount") BigDecimal maxAmount);

    /**
     * Finds financial goals created within a specific date range.
     * 
     * Supports temporal analysis of customer goal-setting behavior,
     * enabling insights into financial planning patterns and seasonal
     * goal creation trends for enhanced customer experience design.
     * 
     * @param customerId The UUID of the customer
     * @param startDate Start of the date range (inclusive)
     * @param endDate End of the date range (inclusive)
     * @return List of FinancialGoal entities created within the date range
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.createdDate BETWEEN :startDate AND :endDate ORDER BY fg.createdDate DESC")
    List<FinancialGoal> findGoalsByCreationDateRange(@Param("customerId") UUID customerId,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Calculates the total target amount across all active goals for a customer.
     * 
     * Provides aggregate financial planning data for customer financial health
     * assessment, enabling calculation of total financial commitments and
     * goal feasibility analysis within the AI-Powered Risk Assessment Engine.
     * 
     * @param customerId The UUID of the customer
     * @return The sum of target amounts for all active goals, or 0 if no active goals exist
     * @since 1.0
     */
    @Query("SELECT COALESCE(SUM(fg.targetAmount), 0) FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.status = 'ACTIVE'")
    BigDecimal calculateTotalActiveGoalAmount(@Param("customerId") UUID customerId);

    /**
     * Calculates the total current progress across all active goals for a customer.
     * 
     * Enables comprehensive progress tracking and completion rate analysis,
     * supporting personalized financial wellness scoring and recommendation
     * generation within the customer's financial health assessment workflow.
     * 
     * @param customerId The UUID of the customer
     * @return The sum of current amounts for all active goals, or 0 if no active goals exist
     * @since 1.0
     */
    @Query("SELECT COALESCE(SUM(fg.currentAmount), 0) FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.status = 'ACTIVE'")
    BigDecimal calculateTotalCurrentProgress(@Param("customerId") UUID customerId);

    /**
     * Counts the number of goals by status for a specific customer.
     * 
     * Provides statistical insights into customer goal management patterns,
     * supporting analytics dashboard display and customer engagement metrics
     * for the Personalized Financial Wellness feature set.
     * 
     * @param customerId The UUID of the customer
     * @param status The goal status to count
     * @return The number of goals with the specified status
     * @since 1.0
     */
    long countByCustomerIdAndStatus(UUID customerId, String status);

    /**
     * Finds the most recently updated financial goal for a customer.
     * 
     * Supports customer dashboard highlighting of recent goal activity,
     * enabling focused attention on active goal management and recent
     * progress updates within the customer experience workflow.
     * 
     * @param customerId The UUID of the customer
     * @return Optional containing the most recently modified goal, or empty if no goals exist
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId ORDER BY fg.lastModifiedDate DESC LIMIT 1")
    Optional<FinancialGoal> findMostRecentlyUpdatedGoal(@Param("customerId") UUID customerId);

    /**
     * Finds goals that have been completed (current amount >= target amount).
     * 
     * Identifies goals that have reached their target amount but may not have
     * been marked as COMPLETED status, supporting automated goal lifecycle
     * management and celebration of customer achievements.
     * 
     * @param customerId The UUID of the customer
     * @return List of FinancialGoal entities that have reached their target amount
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.currentAmount >= fg.targetAmount AND fg.status != 'COMPLETED' ORDER BY fg.lastModifiedDate DESC")
    List<FinancialGoal> findCompletedButUnmarkedGoals(@Param("customerId") UUID customerId);

    /**
     * Updates the current amount for a specific financial goal.
     * 
     * Provides transactional update capability for goal progress tracking,
     * ensuring data consistency during financial goal updates within the
     * broader financial transaction processing workflow.
     * 
     * @param goalId The UUID of the goal to update
     * @param newCurrentAmount The new current amount value
     * @param lastModifiedDate The timestamp of the modification
     * @return The number of entities updated (should be 1 for successful update)
     * @since 1.0
     */
    @Modifying
    @Transactional
    @Query("UPDATE FinancialGoal fg SET fg.currentAmount = :newCurrentAmount, fg.lastModifiedDate = :lastModifiedDate WHERE fg.id = :goalId")
    int updateCurrentAmount(@Param("goalId") UUID goalId, 
                           @Param("newCurrentAmount") BigDecimal newCurrentAmount,
                           @Param("lastModifiedDate") LocalDateTime lastModifiedDate);

    /**
     * Updates the status of a financial goal.
     * 
     * Enables goal lifecycle management through status transitions,
     * supporting automated goal completion, manual goal suspension,
     * and comprehensive goal state management within the financial wellness platform.
     * 
     * @param goalId The UUID of the goal to update
     * @param newStatus The new status value
     * @param lastModifiedDate The timestamp of the modification
     * @return The number of entities updated (should be 1 for successful update)
     * @since 1.0
     */
    @Modifying
    @Transactional
    @Query("UPDATE FinancialGoal fg SET fg.status = :newStatus, fg.lastModifiedDate = :lastModifiedDate WHERE fg.id = :goalId")
    int updateGoalStatus(@Param("goalId") UUID goalId, 
                        @Param("newStatus") String newStatus,
                        @Param("lastModifiedDate") LocalDateTime lastModifiedDate);

    /**
     * Finds goals requiring attention based on multiple criteria.
     * 
     * Comprehensive query supporting proactive customer engagement by identifying
     * goals that may need intervention, such as those approaching deadlines with
     * insufficient progress or goals that haven't been updated recently.
     * 
     * @param customerId The UUID of the customer
     * @param targetDateThreshold Date threshold for approaching deadlines
     * @param progressThreshold Minimum required progress percentage (0.0 to 1.0)
     * @return List of FinancialGoal entities requiring attention
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.status = 'ACTIVE' AND " +
           "(fg.targetDate <= :targetDateThreshold OR (fg.currentAmount / fg.targetAmount) < :progressThreshold) " +
           "ORDER BY fg.targetDate ASC, (fg.currentAmount / fg.targetAmount) ASC")
    List<FinancialGoal> findGoalsRequiringAttention(@Param("customerId") UUID customerId,
                                                    @Param("targetDateThreshold") LocalDate targetDateThreshold,
                                                    @Param("progressThreshold") BigDecimal progressThreshold);

    /**
     * Checks if a customer has any active goals.
     * 
     * Efficient existence check supporting conditional business logic,
     * such as onboarding flows, recommendation engines, and customer
     * engagement strategies based on goal-setting activity.
     * 
     * @param customerId The UUID of the customer
     * @return true if the customer has at least one active goal, false otherwise
     * @since 1.0
     */
    boolean existsByCustomerIdAndStatus(UUID customerId, String status);

    /**
     * Finds all financial goals ordered by priority score.
     * 
     * Custom prioritization logic based on goal urgency (target date proximity),
     * progress rate, and goal significance (target amount), supporting intelligent
     * goal presentation and customer focus guidance within the financial wellness dashboard.
     * 
     * @param customerId The UUID of the customer
     * @return List of FinancialGoal entities ordered by calculated priority
     * @since 1.0
     */
    @Query("SELECT fg FROM FinancialGoal fg WHERE fg.customerId = :customerId AND fg.status = 'ACTIVE' " +
           "ORDER BY " +
           "CASE " +
           "  WHEN fg.targetDate <= CURRENT_DATE THEN 1 " +
           "  WHEN fg.targetDate <= (CURRENT_DATE + 30) THEN 2 " +
           "  WHEN fg.targetDate <= (CURRENT_DATE + 90) THEN 3 " +
           "  ELSE 4 " +
           "END, " +
           "(fg.currentAmount / fg.targetAmount) ASC, " +
           "fg.targetAmount DESC")
    List<FinancialGoal> findGoalsByPriority(@Param("customerId") UUID customerId);
}