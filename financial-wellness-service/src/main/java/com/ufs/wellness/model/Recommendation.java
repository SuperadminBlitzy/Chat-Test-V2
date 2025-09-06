package com.ufs.wellness.model;

import jakarta.persistence.Entity; // Jakarta Persistence API 3.1.0
import jakarta.persistence.Table; // Jakarta Persistence API 3.1.0
import jakarta.persistence.Id; // Jakarta Persistence API 3.1.0
import jakarta.persistence.GeneratedValue; // Jakarta Persistence API 3.1.0
import jakarta.persistence.GenerationType; // Jakarta Persistence API 3.1.0
import jakarta.persistence.Column; // Jakarta Persistence API 3.1.0
import jakarta.persistence.ManyToOne; // Jakarta Persistence API 3.1.0
import jakarta.persistence.JoinColumn; // Jakarta Persistence API 3.1.0
import java.util.UUID; // Java 1.8
import java.time.LocalDateTime; // Java 1.8
import java.util.Objects;

/**
 * JPA entity representing a personalized financial recommendation provided to users
 * within the Unified Financial Services Platform.
 * 
 * This entity implements the F-007: Personalized Financial Recommendations feature,
 * providing AI-powered financial guidance to help users achieve their financial goals
 * and improve their overall financial wellness. Recommendations are generated based on
 * users' financial profiles, transaction history, and established financial goals.
 * 
 * Business Context:
 * - Supports personalized financial guidance based on user financial profiles
 * - Enables tracking of recommendation effectiveness and user engagement
 * - Facilitates goal-oriented financial planning and wellness improvement
 * - Provides audit trail for regulatory compliance and customer service
 * 
 * Technical Implementation:
 * - Stored in PostgreSQL database for ACID compliance and relational integrity
 * - Uses UUID for primary keys to ensure uniqueness across distributed systems
 * - Implements JPA entity patterns for Spring Data integration
 * - Supports relationship mapping with FinancialGoal entities
 * 
 * Security and Compliance:
 * - Recommendation content is designed to be non-sensitive for audit purposes
 * - Links to user wellness profiles through encrypted identifiers
 * - Supports data retention policies for regulatory compliance
 * - Enables tracking of recommendation lifecycle for accountability
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 */
@Entity
@Table(name = "recommendations")
public class Recommendation {

    /**
     * Unique identifier for the recommendation record.
     * Generated automatically using UUID strategy for global uniqueness.
     * 
     * UUID Generation Benefits:
     * - Eliminates database sequence dependencies
     * - Enables distributed system scalability
     * - Prevents primary key collisions in multi-node environments
     * - Supports offline data generation and synchronization
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Identifier linking this recommendation to a specific user's wellness profile.
     * References the customer's financial wellness assessment and profile data.
     * 
     * This field enables:
     * - Personalized recommendation retrieval by user
     * - User-specific recommendation analytics and tracking
     * - Privacy-compliant data segregation by customer
     * - Efficient querying for customer-facing applications
     * 
     * The wellness profile ID is used to correlate recommendations with
     * user financial data while maintaining appropriate data boundaries.
     */
    @Column(name = "wellness_profile_id", nullable = false)
    private UUID wellnessProfileId;

    /**
     * Optional reference to a specific financial goal this recommendation addresses.
     * Enables goal-oriented financial guidance and progress tracking.
     * 
     * Relationship Details:
     * - Many recommendations can be associated with one financial goal
     * - Relationship is optional to support general financial wellness recommendations
     * - Foreign key relationship enables cascading operations and referential integrity
     * - Supports goal-specific recommendation filtering and analysis
     * 
     * Use Cases:
     * - Goal-specific savings recommendations
     * - Investment strategy suggestions for retirement goals
     * - Debt reduction recommendations for financial objectives
     * - Emergency fund building guidance
     */
    @ManyToOne
    @JoinColumn(name = "financial_goal_id")
    private FinancialGoal financialGoal;

    /**
     * Category classification for the financial recommendation.
     * Enables systematic organization and filtering of recommendations.
     * 
     * Common Categories:
     * - SAVINGS: Recommendations for improving savings rates and strategies
     * - INVESTMENT: Investment opportunity and portfolio optimization suggestions
     * - DEBT_MANAGEMENT: Debt reduction and consolidation recommendations
     * - BUDGETING: Budget optimization and expense management guidance
     * - INSURANCE: Insurance coverage and risk management recommendations
     * - TAX_PLANNING: Tax optimization and planning strategies
     * - EMERGENCY_FUND: Emergency fund building and maintenance guidance
     * - RETIREMENT: Retirement planning and preparation recommendations
     * 
     * This categorization supports:
     * - User interface filtering and organization
     * - Recommendation analytics and reporting
     * - Personalization algorithm training and optimization
     * - Customer service and support workflows
     */
    @Column(name = "category", nullable = false)
    private String category;

    /**
     * Detailed description of the financial recommendation.
     * Provides comprehensive explanation of the suggested financial action.
     * 
     * Content Guidelines:
     * - Clear, actionable language appropriate for diverse financial literacy levels
     * - Specific numerical targets and timeframes where applicable
     * - Educational context to help users understand the recommendation rationale
     * - Compliance with financial advice regulations and disclaimers
     * 
     * Length Considerations:
     * - Maximum 1024 characters to balance detail with readability
     * - Optimized for mobile and web application display
     * - Supports internationalization for multi-language deployment
     * 
     * The description serves as the primary communication mechanism between
     * the AI recommendation engine and the end user, requiring careful
     * attention to clarity, accuracy, and regulatory compliance.
     */
    @Column(name = "description", nullable = false, length = 1024)
    private String description;

    /**
     * Specific action item or next step for the user to implement the recommendation.
     * Provides concrete, actionable guidance for recommendation implementation.
     * 
     * Action Examples:
     * - "Increase your monthly savings by $200 to reach your emergency fund goal"
     * - "Consider transferring high-interest debt to a lower-rate balance transfer card"
     * - "Review and adjust your investment portfolio allocation for better diversification"
     * - "Set up automatic transfers to increase retirement contributions by 2%"
     * 
     * Design Principles:
     * - Actionable and specific rather than generic advice
     * - Measurable outcomes where possible
     * - Appropriate complexity level for the target user
     * - Integration-ready for task management and tracking systems
     * 
     * This field enables the platform to provide practical, implementable
     * guidance that users can act upon immediately.
     */
    @Column(name = "action", nullable = false)
    private String action;

    /**
     * Priority level indicating the importance or urgency of this recommendation.
     * Helps users prioritize their financial improvement efforts.
     * 
     * Priority Levels:
     * - HIGH: Critical financial issues requiring immediate attention
     * - MEDIUM: Important recommendations with moderate urgency
     * - LOW: Optimization opportunities with flexible timing
     * 
     * Priority Determination Factors:
     * - Financial risk level and potential impact
     * - Regulatory compliance requirements
     * - User-specific financial situation and goals
     * - Market conditions and time-sensitive opportunities
     * 
     * This field supports:
     * - User interface prioritization and highlighting
     * - Recommendation engine optimization
     * - Customer service escalation workflows
     * - Financial advisor consultation prioritization
     */
    @Column(name = "priority")
    private String priority;

    /**
     * Current status of the recommendation in its lifecycle.
     * Tracks user engagement and recommendation effectiveness.
     * 
     * Status Values:
     * - PENDING: Newly generated recommendation awaiting user review
     * - VIEWED: User has seen the recommendation but not acted
     * - ACCEPTED: User has acknowledged and committed to the recommendation
     * - IMPLEMENTED: User has taken action based on the recommendation
     * - DISMISSED: User has explicitly dismissed the recommendation
     * - EXPIRED: Recommendation is no longer relevant due to time or changed circumstances
     * 
     * Status Tracking Benefits:
     * - Enables recommendation effectiveness analysis
     * - Supports user engagement metrics and optimization
     * - Facilitates follow-up workflows and customer service
     * - Provides data for machine learning model improvement
     * 
     * Status transitions are typically managed by service layer business logic
     * and may trigger additional workflows or notifications.
     */
    @Column(name = "status", nullable = false)
    private String status;

    /**
     * Timestamp when the recommendation was created by the system.
     * Provides audit trail and enables time-based analysis.
     * 
     * Audit and Analytics Uses:
     * - Recommendation generation performance tracking
     * - User engagement timing analysis
     * - Regulatory compliance audit trails
     * - Data retention policy enforcement
     * 
     * The creation timestamp is set automatically during entity persistence
     * and should not be modified after initial creation to maintain data integrity.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Default constructor for the Recommendation entity.
     * Required by JPA specification for entity instantiation.
     * 
     * Initialization Behavior:
     * - Sets default status to PENDING for new recommendations
     * - Initializes creation timestamp to current time
     * - Prepares entity for persistence without explicit field setting
     * 
     * This constructor is used by:
     * - JPA entity managers during database retrieval
     * - Spring Data repositories for query result mapping
     * - Jackson JSON deserialization for API operations
     * - Unit testing frameworks for entity creation
     */
    public Recommendation() {
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Parameterized constructor for creating a new recommendation with essential fields.
     * Provides convenient initialization for service layer recommendation creation.
     * 
     * @param wellnessProfileId The UUID of the user's wellness profile
     * @param category The recommendation category classification
     * @param description The detailed recommendation description
     * @param action The specific action item for the user
     * @param priority The priority level (HIGH, MEDIUM, LOW)
     */
    public Recommendation(UUID wellnessProfileId, String category, String description, String action, String priority) {
        this();
        this.wellnessProfileId = wellnessProfileId;
        this.category = category;
        this.description = description;
        this.action = action;
        this.priority = priority;
    }

    /**
     * Gets the unique identifier for this recommendation.
     * 
     * @return The UUID identifier, or null for new entities before persistence
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this recommendation.
     * Typically managed by JPA, manual setting should be avoided.
     * 
     * @param id The UUID identifier
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Gets the wellness profile identifier for this recommendation.
     * 
     * @return The UUID of the associated wellness profile
     */
    public UUID getWellnessProfileId() {
        return wellnessProfileId;
    }

    /**
     * Sets the wellness profile identifier for this recommendation.
     * 
     * @param wellnessProfileId The UUID of the wellness profile
     * @throws IllegalArgumentException if wellnessProfileId is null
     */
    public void setWellnessProfileId(UUID wellnessProfileId) {
        if (wellnessProfileId == null) {
            throw new IllegalArgumentException("Wellness profile ID cannot be null");
        }
        this.wellnessProfileId = wellnessProfileId;
    }

    /**
     * Gets the associated financial goal for this recommendation.
     * 
     * @return The FinancialGoal entity, or null if not goal-specific
     */
    public FinancialGoal getFinancialGoal() {
        return financialGoal;
    }

    /**
     * Sets the associated financial goal for this recommendation.
     * 
     * @param financialGoal The FinancialGoal entity to associate
     */
    public void setFinancialGoal(FinancialGoal financialGoal) {
        this.financialGoal = financialGoal;
    }

    /**
     * Gets the category classification for this recommendation.
     * 
     * @return The category as a String
     */
    public String getCategory() {
        return category;
    }

    /**
     * Sets the category classification for this recommendation.
     * 
     * @param category The category classification
     * @throws IllegalArgumentException if category is null or blank
     */
    public void setCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be null or blank");
        }
        this.category = category;
    }

    /**
     * Gets the detailed description of this recommendation.
     * 
     * @return The description as a String
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the detailed description for this recommendation.
     * 
     * @param description The recommendation description
     * @throws IllegalArgumentException if description is null or blank
     */
    public void setDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or blank");
        }
        if (description.length() > 1024) {
            throw new IllegalArgumentException("Description cannot exceed 1024 characters");
        }
        this.description = description;
    }

    /**
     * Gets the specific action item for this recommendation.
     * 
     * @return The action as a String
     */
    public String getAction() {
        return action;
    }

    /**
     * Sets the specific action item for this recommendation.
     * 
     * @param action The action item
     * @throws IllegalArgumentException if action is null or blank
     */
    public void setAction(String action) {
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or blank");
        }
        this.action = action;
    }

    /**
     * Gets the priority level for this recommendation.
     * 
     * @return The priority as a String
     */
    public String getPriority() {
        return priority;
    }

    /**
     * Sets the priority level for this recommendation.
     * 
     * @param priority The priority level (HIGH, MEDIUM, LOW)
     */
    public void setPriority(String priority) {
        this.priority = priority;
    }

    /**
     * Gets the current status of this recommendation.
     * 
     * @return The status as a String
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the current status of this recommendation.
     * 
     * @param status The new status
     * @throws IllegalArgumentException if status is null or blank
     */
    public void setStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or blank");
        }
        this.status = status;
    }

    /**
     * Gets the creation timestamp of this recommendation.
     * 
     * @return The creation timestamp as LocalDateTime
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp of this recommendation.
     * Generally should not be modified after initial creation.
     * 
     * @param createdAt The creation timestamp
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Checks if this recommendation is currently active and actionable.
     * 
     * @return true if status is PENDING, VIEWED, or ACCEPTED
     */
    public boolean isActive() {
        return "PENDING".equals(status) || "VIEWED".equals(status) || "ACCEPTED".equals(status);
    }

    /**
     * Checks if this recommendation has been completed or implemented.
     * 
     * @return true if status is IMPLEMENTED
     */
    public boolean isImplemented() {
        return "IMPLEMENTED".equals(status);
    }

    /**
     * Checks if this recommendation is associated with a specific financial goal.
     * 
     * @return true if financialGoal is not null
     */
    public boolean isGoalSpecific() {
        return financialGoal != null;
    }

    /**
     * Marks this recommendation as viewed by the user.
     * Updates status from PENDING to VIEWED if appropriate.
     */
    public void markAsViewed() {
        if ("PENDING".equals(status)) {
            this.status = "VIEWED";
        }
    }

    /**
     * Marks this recommendation as accepted by the user.
     * Updates status to ACCEPTED indicating user commitment to the recommendation.
     */
    public void markAsAccepted() {
        if ("PENDING".equals(status) || "VIEWED".equals(status)) {
            this.status = "ACCEPTED";
        }
    }

    /**
     * Marks this recommendation as implemented by the user.
     * Updates status to IMPLEMENTED indicating successful completion.
     */
    public void markAsImplemented() {
        if (isActive()) {
            this.status = "IMPLEMENTED";
        }
    }

    /**
     * Marks this recommendation as dismissed by the user.
     * Updates status to DISMISSED indicating user rejection of the recommendation.
     */
    public void markAsDismissed() {
        if (isActive()) {
            this.status = "DISMISSED";
        }
    }

    /**
     * Compares this Recommendation with another object for equality.
     * Two recommendations are considered equal if they have the same ID.
     * 
     * @param obj The object to compare with
     * @return true if objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Recommendation that = (Recommendation) obj;
        return Objects.equals(id, that.id) &&
               Objects.equals(wellnessProfileId, that.wellnessProfileId) &&
               Objects.equals(financialGoal, that.financialGoal) &&
               Objects.equals(category, that.category) &&
               Objects.equals(description, that.description) &&
               Objects.equals(action, that.action) &&
               Objects.equals(priority, that.priority) &&
               Objects.equals(status, that.status) &&
               Objects.equals(createdAt, that.createdAt);
    }

    /**
     * Generates a hash code for this Recommendation.
     * Based on the unique identifier and key business fields.
     * 
     * @return The hash code as an integer
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, wellnessProfileId, financialGoal, category, 
                          description, action, priority, status, createdAt);
    }

    /**
     * Returns a string representation of this Recommendation.
     * Includes key identifying information for debugging and logging.
     * 
     * @return A detailed string representation of the recommendation
     */
    @Override
    public String toString() {
        return "Recommendation{" +
                "id=" + id +
                ", wellnessProfileId=" + wellnessProfileId +
                ", financialGoal=" + (financialGoal != null ? financialGoal.getId() : "null") +
                ", category='" + category + '\'' +
                ", description='" + description + '\'' +
                ", action='" + action + '\'' +
                ", priority='" + priority + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}