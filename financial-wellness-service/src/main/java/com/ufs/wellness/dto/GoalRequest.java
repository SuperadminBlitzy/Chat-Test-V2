package com.ufs.wellness.dto;

// Jakarta Validation Constraints - Version 3.0.2
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.DecimalMin;

// Java Core Libraries - Version 21
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for creating and updating financial goals.
 * This class carries data from the client to the server and supports the
 * Personalized Financial Wellness feature, enabling users to set and track
 * their financial objectives.
 * 
 * <p>This DTO is designed to support the following system capabilities:</p>
 * <ul>
 *   <li>Personalized Financial Wellness - Goal tracking functionality</li>
 *   <li>Financial Health Assessment - Goal setting and progress tracking workflows</li>
 * </ul>
 * 
 * <p>The class includes comprehensive validation to ensure data integrity
 * and compliance with financial wellness system requirements.</p>
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025-01-01
 */
public class GoalRequest {

    /**
     * The name/title of the financial goal.
     * This field is required and must be between 1 and 100 characters.
     * Examples: "Emergency Fund", "Home Down Payment", "Retirement Savings"
     */
    @NotNull(message = "Goal name is required")
    @Size(min = 1, max = 100, message = "Goal name must be between 1 and 100 characters")
    private String name;

    /**
     * Detailed description of the financial goal.
     * Optional field that can provide additional context about the goal.
     * Maximum length is 500 characters to ensure reasonable storage and display.
     */
    @Size(max = 500, message = "Goal description cannot exceed 500 characters")
    private String description;

    /**
     * The target amount to be achieved for this financial goal.
     * This field is required and must be a positive decimal value.
     * Uses BigDecimal for precision in financial calculations.
     */
    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0")
    private BigDecimal targetAmount;

    /**
     * The target date by which the financial goal should be achieved.
     * This field is required and must be a future date to ensure the goal is actionable.
     */
    @NotNull(message = "Target date is required")
    @Future(message = "Target date must be in the future")
    private LocalDate targetDate;

    /**
     * The unique identifier of the customer who owns this financial goal.
     * This field is required for proper data association and security.
     */
    @NotNull(message = "Customer ID is required")
    @Size(min = 1, max = 50, message = "Customer ID must be between 1 and 50 characters")
    private String customerId;

    /**
     * Default constructor for GoalRequest.
     * Creates an empty instance that can be populated through setters or binding.
     * This constructor is primarily used by frameworks for object instantiation.
     */
    public GoalRequest() {
        // Default constructor - no initialization required
        // Fields will be set through setters or framework binding
    }

    /**
     * Parameterized constructor for GoalRequest.
     * Creates a fully initialized instance with all required fields.
     * 
     * @param name the name/title of the financial goal
     * @param description detailed description of the goal (can be null)
     * @param targetAmount the target amount to be achieved
     * @param targetDate the target date for goal completion
     * @param customerId the unique identifier of the customer
     */
    public GoalRequest(String name, String description, BigDecimal targetAmount, 
                      LocalDate targetDate, String customerId) {
        this.name = name;
        this.description = description;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
        this.customerId = customerId;
    }

    /**
     * Gets the name/title of the financial goal.
     * 
     * @return the goal name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name/title of the financial goal.
     * 
     * @param name the goal name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the detailed description of the financial goal.
     * 
     * @return the goal description, may be null
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the detailed description of the financial goal.
     * 
     * @param description the goal description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the target amount to be achieved for this financial goal.
     * 
     * @return the target amount as BigDecimal for precision
     */
    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    /**
     * Sets the target amount to be achieved for this financial goal.
     * 
     * @param targetAmount the target amount to set
     */
    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    /**
     * Gets the target date by which the financial goal should be achieved.
     * 
     * @return the target date
     */
    public LocalDate getTargetDate() {
        return targetDate;
    }

    /**
     * Sets the target date by which the financial goal should be achieved.
     * 
     * @param targetDate the target date to set
     */
    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    /**
     * Gets the unique identifier of the customer who owns this financial goal.
     * 
     * @return the customer ID
     */
    public String getCustomerId() {
        return customerId;
    }

    /**
     * Sets the unique identifier of the customer who owns this financial goal.
     * 
     * @param customerId the customer ID to set
     */
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    /**
     * Returns a string representation of this GoalRequest.
     * Excludes sensitive customer information for security purposes.
     * 
     * @return a string representation of the object
     */
    @Override
    public String toString() {
        return "GoalRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", targetAmount=" + targetAmount +
                ", targetDate=" + targetDate +
                ", customerId='***'" + // Mask customer ID for security
                '}';
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * Two GoalRequest objects are considered equal if all their fields are equal.
     * 
     * @param obj the reference object with which to compare
     * @return true if this object is the same as the obj argument; false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        GoalRequest that = (GoalRequest) obj;
        
        if (name != null ? !name.equals(that.name) : that.name != null) return false;
        if (description != null ? !description.equals(that.description) : that.description != null) return false;
        if (targetAmount != null ? !targetAmount.equals(that.targetAmount) : that.targetAmount != null) return false;
        if (targetDate != null ? !targetDate.equals(that.targetDate) : that.targetDate != null) return false;
        return customerId != null ? customerId.equals(that.customerId) : that.customerId == null;
    }

    /**
     * Returns a hash code value for the object.
     * This method is supported for the benefit of hash tables such as those provided by HashMap.
     * 
     * @return a hash code value for this object
     */
    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (description != null ? description.hashCode() : 0);
        result = 31 * result + (targetAmount != null ? targetAmount.hashCode() : 0);
        result = 31 * result + (targetDate != null ? targetDate.hashCode() : 0);
        result = 31 * result + (customerId != null ? customerId.hashCode() : 0);
        return result;
    }
}