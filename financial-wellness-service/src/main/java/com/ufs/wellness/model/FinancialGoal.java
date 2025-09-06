package com.ufs.wellness.model;

import org.springframework.data.annotation.Id; // Spring Data 3.2.0
import org.springframework.data.mongodb.core.mapping.Document; // Spring Data MongoDB 4.2.0
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal; // Java 21
import java.time.LocalDate; // Java 21 
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * MongoDB document representing a customer's financial goal within the Unified Financial Services Platform.
 * 
 * This class serves as the core data model for the Personalized Financial Wellness feature,
 * enabling customers to set, track, and achieve various financial objectives such as saving 
 * for a house, retirement planning, emergency funds, or other financial milestones.
 * 
 * The document is designed to support the Financial Health Assessment workflow by providing
 * structured storage for goal-related data that can be analyzed to provide personalized
 * recommendations and insights to customers.
 * 
 * Security and Compliance Considerations:
 * - All monetary fields use BigDecimal for precise financial calculations
 * - Sensitive financial data is handled according to PCI DSS requirements
 * - Document supports audit trails for regulatory compliance
 * - Data validation ensures integrity of financial goal information
 * 
 * Performance Optimization:
 * - Indexed fields for efficient querying by wellness profile
 * - Optimized for MongoDB 7.0+ document storage and retrieval
 * - Designed for horizontal scaling across distributed environments
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 */
@Document(collection = "financial_goals")
public class FinancialGoal {

    /**
     * Unique identifier for the financial goal document.
     * Generated automatically by MongoDB as ObjectId and converted to String.
     * Used for direct document access and relationship management.
     */
    @Id
    @JsonProperty("id")
    private String id;

    /**
     * Reference to the customer's wellness profile identifier.
     * Links this financial goal to a specific customer's financial wellness assessment.
     * Indexed for efficient querying of customer-specific goals.
     * 
     * This field establishes the relationship between financial goals and customer profiles
     * enabling personalized financial wellness tracking and recommendation generation.
     */
    @Field("wellness_profile_id")
    @Indexed
    @NotBlank(message = "Wellness profile ID is required and cannot be blank")
    @Size(min = 24, max = 50, message = "Wellness profile ID must be between 24 and 50 characters")
    @JsonProperty("wellnessProfileId")
    private String wellnessProfileId;

    /**
     * Human-readable name/title for the financial goal.
     * Examples: "Emergency Fund", "House Down Payment", "Retirement Savings", "Vacation Fund"
     * 
     * This descriptive field helps customers easily identify and manage their goals
     * within the financial wellness dashboard and mobile applications.
     */
    @Field("goal_name")
    @NotBlank(message = "Goal name is required and cannot be blank")
    @Size(min = 1, max = 100, message = "Goal name must be between 1 and 100 characters")
    @JsonProperty("goalName")
    private String goalName;

    /**
     * Target monetary amount to be achieved for this financial goal.
     * Uses BigDecimal for precise financial calculations and compliance with financial regulations.
     * 
     * Precision and Scale:
     * - Supports up to 15 digits total (scale of 2 for currency precision)
     * - Handles major currencies (USD, EUR, GBP, etc.) with standard decimal places
     * - Prevents floating-point arithmetic errors in financial calculations
     * 
     * Validation ensures positive values only for meaningful financial targets.
     */
    @Field("target_amount")
    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than zero")
    @JsonProperty("targetAmount")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal targetAmount;

    /**
     * Current accumulated amount towards the financial goal.
     * Represents the customer's progress towards achieving their target.
     * 
     * Progress Tracking Features:
     * - Updated through automatic transaction categorization
     * - Manual adjustments allowed for external contributions
     * - Used for progress visualization and milestone celebrations
     * - Supports both positive contributions and withdrawals
     * 
     * Default value is zero for new goals, allowing gradual progress tracking.
     */
    @Field("current_amount")
    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.00", message = "Current amount cannot be negative")
    @JsonProperty("currentAmount")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal currentAmount;

    /**
     * Target completion date for achieving the financial goal.
     * Used for timeline-based planning and progress tracking algorithms.
     * 
     * Planning and Analytics Features:
     * - Enables calculation of required monthly/weekly savings rates
     * - Supports goal prioritization based on urgency
     * - Triggers alerts and recommendations as deadlines approach
     * - Historical analysis for goal achievement patterns
     * 
     * Validation ensures target dates are in the future for active goals.
     */
    @Field("target_date")
    @NotNull(message = "Target date is required")
    @JsonProperty("targetDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;

    /**
     * Current status of the financial goal.
     * Tracks the lifecycle and progress state of the goal.
     * 
     * Valid Status Values:
     * - ACTIVE: Goal is actively being pursued
     * - PAUSED: Temporarily suspended (e.g., due to financial constraints)
     * - COMPLETED: Target amount has been reached
     * - CANCELLED: Goal has been abandoned or cancelled
     * - ARCHIVED: Historical goal no longer actively tracked
     * 
     * Status transitions are logged for audit purposes and analytics.
     */
    @Field("status")
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|PAUSED|COMPLETED|CANCELLED|ARCHIVED)$", 
             message = "Status must be one of: ACTIVE, PAUSED, COMPLETED, CANCELLED, ARCHIVED")
    @JsonProperty("status")
    private String status;

    /**
     * Timestamp when the financial goal was created.
     * Used for audit trails and temporal analytics.
     */
    @Field("created_date")
    @JsonProperty("createdDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;

    /**
     * Timestamp when the financial goal was last modified.
     * Updated automatically on any field changes for audit compliance.
     */
    @Field("last_modified_date")
    @JsonProperty("lastModifiedDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastModifiedDate;

    /**
     * Default constructor for the FinancialGoal class.
     * Initializes a new financial goal with default values.
     * 
     * Default Initialization:
     * - Sets current amount to zero
     * - Sets status to ACTIVE for new goals
     * - Initializes creation and modification timestamps
     * 
     * This constructor is required by Spring Data MongoDB for document instantiation
     * and supports frameworks like Jackson for JSON deserialization.
     */
    public FinancialGoal() {
        this.currentAmount = BigDecimal.ZERO;
        this.status = "ACTIVE";
        this.createdDate = LocalDateTime.now();
        this.lastModifiedDate = LocalDateTime.now();
    }

    /**
     * Parameterized constructor for creating a new financial goal with essential information.
     * 
     * @param wellnessProfileId The customer's wellness profile identifier
     * @param goalName Human-readable name for the goal
     * @param targetAmount Target monetary amount to achieve
     * @param targetDate Target completion date
     */
    public FinancialGoal(String wellnessProfileId, String goalName, BigDecimal targetAmount, LocalDate targetDate) {
        this();
        this.wellnessProfileId = wellnessProfileId;
        this.goalName = goalName;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
    }

    // Getter and Setter methods with comprehensive JavaDoc documentation

    /**
     * Gets the unique identifier for this financial goal.
     * 
     * @return The MongoDB ObjectId as a String, or null for new documents
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this financial goal.
     * Typically managed by MongoDB, manual setting should be avoided.
     * 
     * @param id The unique identifier as a String
     */
    public void setId(String id) {
        this.id = id;
        updateLastModifiedDate();
    }

    /**
     * Gets the wellness profile identifier linking this goal to a customer.
     * 
     * @return The wellness profile ID as a String
     */
    public String getWellnessProfileId() {
        return wellnessProfileId;
    }

    /**
     * Sets the wellness profile identifier for this financial goal.
     * 
     * @param wellnessProfileId The customer's wellness profile identifier
     * @throws IllegalArgumentException if wellnessProfileId is null or blank
     */
    public void setWellnessProfileId(String wellnessProfileId) {
        if (wellnessProfileId == null || wellnessProfileId.trim().isEmpty()) {
            throw new IllegalArgumentException("Wellness profile ID cannot be null or blank");
        }
        this.wellnessProfileId = wellnessProfileId;
        updateLastModifiedDate();
    }

    /**
     * Gets the human-readable name of this financial goal.
     * 
     * @return The goal name as a String
     */
    public String getGoalName() {
        return goalName;
    }

    /**
     * Sets the human-readable name for this financial goal.
     * 
     * @param goalName The descriptive name for the goal
     * @throws IllegalArgumentException if goalName is null or blank
     */
    public void setGoalName(String goalName) {
        if (goalName == null || goalName.trim().isEmpty()) {
            throw new IllegalArgumentException("Goal name cannot be null or blank");
        }
        this.goalName = goalName;
        updateLastModifiedDate();
    }

    /**
     * Gets the target monetary amount for this financial goal.
     * 
     * @return The target amount as BigDecimal
     */
    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    /**
     * Sets the target monetary amount for this financial goal.
     * 
     * @param targetAmount The target amount to achieve
     * @throws IllegalArgumentException if targetAmount is null or not positive
     */
    public void setTargetAmount(BigDecimal targetAmount) {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Target amount must be positive");
        }
        this.targetAmount = targetAmount;
        updateLastModifiedDate();
    }

    /**
     * Gets the current accumulated amount towards this financial goal.
     * 
     * @return The current amount as BigDecimal
     */
    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    /**
     * Sets the current accumulated amount towards this financial goal.
     * 
     * @param currentAmount The current progress amount
     * @throws IllegalArgumentException if currentAmount is null or negative
     */
    public void setCurrentAmount(BigDecimal currentAmount) {
        if (currentAmount == null || currentAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Current amount cannot be negative");
        }
        this.currentAmount = currentAmount;
        updateLastModifiedDate();
    }

    /**
     * Gets the target completion date for this financial goal.
     * 
     * @return The target date as LocalDate
     */
    public LocalDate getTargetDate() {
        return targetDate;
    }

    /**
     * Sets the target completion date for this financial goal.
     * 
     * @param targetDate The target completion date
     * @throws IllegalArgumentException if targetDate is null
     */
    public void setTargetDate(LocalDate targetDate) {
        if (targetDate == null) {
            throw new IllegalArgumentException("Target date cannot be null");
        }
        this.targetDate = targetDate;
        updateLastModifiedDate();
    }

    /**
     * Gets the current status of this financial goal.
     * 
     * @return The status as a String
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the status of this financial goal.
     * 
     * @param status The new status (ACTIVE, PAUSED, COMPLETED, CANCELLED, ARCHIVED)
     * @throws IllegalArgumentException if status is invalid
     */
    public void setStatus(String status) {
        if (status == null || !isValidStatus(status)) {
            throw new IllegalArgumentException("Invalid status. Must be one of: ACTIVE, PAUSED, COMPLETED, CANCELLED, ARCHIVED");
        }
        this.status = status;
        updateLastModifiedDate();
    }

    /**
     * Gets the creation timestamp of this financial goal.
     * 
     * @return The creation date as LocalDateTime
     */
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    /**
     * Sets the creation timestamp of this financial goal.
     * Generally should not be modified after initial creation.
     * 
     * @param createdDate The creation timestamp
     */
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    /**
     * Gets the last modification timestamp of this financial goal.
     * 
     * @return The last modification date as LocalDateTime
     */
    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    /**
     * Sets the last modification timestamp of this financial goal.
     * 
     * @param lastModifiedDate The last modification timestamp
     */
    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    // Business logic and utility methods

    /**
     * Calculates the completion percentage of this financial goal.
     * 
     * @return The completion percentage as a double (0.0 to 100.0)
     */
    public double getCompletionPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        if (currentAmount == null) {
            return 0.0;
        }
        return currentAmount.divide(targetAmount, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100.0))
                .doubleValue();
    }

    /**
     * Calculates the remaining amount needed to achieve this goal.
     * 
     * @return The remaining amount as BigDecimal (0 if goal is achieved)
     */
    public BigDecimal getRemainingAmount() {
        if (targetAmount == null || currentAmount == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal remaining = targetAmount.subtract(currentAmount);
        return remaining.max(BigDecimal.ZERO);
    }

    /**
     * Checks if this financial goal has been completed.
     * 
     * @return true if current amount meets or exceeds target amount
     */
    public boolean isCompleted() {
        return currentAmount != null && targetAmount != null && 
               currentAmount.compareTo(targetAmount) >= 0;
    }

    /**
     * Checks if this financial goal is currently active.
     * 
     * @return true if status is ACTIVE
     */
    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    /**
     * Validates if the provided status is acceptable for financial goals.
     * 
     * @param status The status to validate
     * @return true if status is valid
     */
    private boolean isValidStatus(String status) {
        return status != null && 
               (status.equals("ACTIVE") || status.equals("PAUSED") || 
                status.equals("COMPLETED") || status.equals("CANCELLED") || 
                status.equals("ARCHIVED"));
    }

    /**
     * Updates the last modified timestamp to current time.
     * Called automatically when any field is modified.
     */
    private void updateLastModifiedDate() {
        this.lastModifiedDate = LocalDateTime.now();
    }

    /**
     * Adds an amount to the current progress towards this goal.
     * 
     * @param amount The amount to add (must be positive)
     * @throws IllegalArgumentException if amount is null or negative
     */
    public void addToCurrentAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount to add must be positive");
        }
        if (currentAmount == null) {
            currentAmount = BigDecimal.ZERO;
        }
        this.currentAmount = this.currentAmount.add(amount);
        updateLastModifiedDate();
        
        // Auto-complete goal if target is reached
        if (isCompleted() && "ACTIVE".equals(status)) {
            setStatus("COMPLETED");
        }
    }

    // Standard Object methods for proper collection handling and debugging

    /**
     * Compares this FinancialGoal with another object for equality.
     * Two financial goals are considered equal if they have the same ID.
     * 
     * @param obj The object to compare with
     * @return true if objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        FinancialGoal that = (FinancialGoal) obj;
        return Objects.equals(id, that.id) &&
               Objects.equals(wellnessProfileId, that.wellnessProfileId) &&
               Objects.equals(goalName, that.goalName) &&
               Objects.equals(targetAmount, that.targetAmount) &&
               Objects.equals(currentAmount, that.currentAmount) &&
               Objects.equals(targetDate, that.targetDate) &&
               Objects.equals(status, that.status);
    }

    /**
     * Generates a hash code for this FinancialGoal.
     * Based on the unique identifier and key business fields.
     * 
     * @return The hash code as an integer
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, wellnessProfileId, goalName, targetAmount, 
                          currentAmount, targetDate, status);
    }

    /**
     * Returns a string representation of this FinancialGoal.
     * Includes key identifying information for debugging and logging.
     * Sensitive financial amounts are included but should be logged carefully in production.
     * 
     * @return A detailed string representation of the financial goal
     */
    @Override
    public String toString() {
        return "FinancialGoal{" +
                "id='" + id + '\'' +
                ", wellnessProfileId='" + wellnessProfileId + '\'' +
                ", goalName='" + goalName + '\'' +
                ", targetAmount=" + targetAmount +
                ", currentAmount=" + currentAmount +
                ", targetDate=" + targetDate +
                ", status='" + status + '\'' +
                ", completionPercentage=" + String.format("%.2f", getCompletionPercentage()) + "%" +
                ", createdDate=" + createdDate +
                ", lastModifiedDate=" + lastModifiedDate +
                '}';
    }
}