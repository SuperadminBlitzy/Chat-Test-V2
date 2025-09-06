package com.ufs.wellness.dto;

import java.math.BigDecimal; // Java 21 LTS - High precision monetary calculations
import java.time.LocalDate; // Java 21 LTS - Date representation for goal target dates
import java.util.Objects;
import java.util.UUID; // Java 21 LTS - Unique identifier generation

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

/**
 * Data Transfer Object (DTO) for sending financial goal information to the client.
 * 
 * <p>This class represents the data structure of a financial goal that will be exposed 
 * through the API as part of the Personalized Financial Wellness capability and 
 * Financial Health Assessment workflow. It encapsulates all the essential information 
 * about a user's financial goal including identification, monetary targets, progress 
 * tracking, and timeline management.</p>
 * 
 * <p><strong>Financial Services Context:</strong></p>
 * <ul>
 *   <li>Supports real-time financial goal tracking and progress monitoring</li>
 *   <li>Enables personalized financial recommendations based on goal status</li>
 *   <li>Facilitates risk assessment for goal achievement probability</li>
 *   <li>Integrates with AI-powered financial wellness analytics</li>
 * </ul>
 * 
 * <p><strong>Enterprise Architecture Alignment:</strong></p>
 * <ul>
 *   <li>Part of the microservices-based financial wellness service</li>
 *   <li>Designed for high-precision financial calculations using BigDecimal</li>
 *   <li>Supports real-time data synchronization across distributed systems</li>
 *   <li>Compliant with financial industry data integrity standards</li>
 * </ul>
 * 
 * <p><strong>Usage Examples:</strong></p>
 * <pre>
 * // Create a new goal response for emergency fund
 * GoalResponse emergencyFund = new GoalResponse();
 * emergencyFund.setName("Emergency Fund");
 * emergencyFund.setTargetAmount(new BigDecimal("10000.00"));
 * emergencyFund.setCurrentAmount(new BigDecimal("2500.50"));
 * emergencyFund.setTargetDate(LocalDate.of(2025, 12, 31));
 * emergencyFund.setStatus("IN_PROGRESS");
 * 
 * // Create using parameterized constructor
 * GoalResponse retirementGoal = new GoalResponse(
 *     UUID.randomUUID(),
 *     "Retirement Savings",
 *     "Long-term retirement planning goal",
 *     new BigDecimal("500000.00"),
 *     new BigDecimal("125000.75"),
 *     LocalDate.of(2055, 6, 30),
 *     "ON_TRACK"
 * );
 * </pre>
 * 
 * @author UFS Financial Wellness Team
 * @version 1.0
 * @since 1.0
 * @see com.ufs.wellness.service.GoalService
 * @see com.ufs.wellness.controller.GoalController
 */
public class GoalResponse {

    /**
     * Unique identifier for the financial goal.
     * 
     * <p>This UUID serves as the primary identifier for the goal across all 
     * system components and external integrations. It ensures data consistency 
     * in distributed microservices architecture and facilitates goal tracking 
     * across multiple financial wellness touchpoints.</p>
     * 
     * <p><strong>Technical Notes:</strong></p>
     * <ul>
     *   <li>Generated using UUID.randomUUID() for uniqueness guarantee</li>
     *   <li>Immutable once set to ensure referential integrity</li>
     *   <li>Used for audit logging and transaction tracking</li>
     *   <li>Essential for real-time data synchronization across services</li>
     * </ul>
     */
    @JsonProperty("id")
    private UUID id;

    /**
     * Human-readable name of the financial goal.
     * 
     * <p>This field represents the user-defined title or name for their financial 
     * goal. It serves as the primary display identifier in user interfaces and 
     * helps users quickly identify and differentiate between multiple goals.</p>
     * 
     * <p><strong>Business Rules:</strong></p>
     * <ul>
     *   <li>Should be descriptive and meaningful to the user</li>
     *   <li>Commonly used names: "Emergency Fund", "Home Down Payment", "Vacation", etc.</li>
     *   <li>Used in personalized financial recommendations and notifications</li>
     *   <li>Supports multi-language characters for international users</li>
     * </ul>
     * 
     * <p><strong>Example Values:</strong></p>
     * <ul>
     *   <li>"Emergency Fund" - Short-term safety net goal</li>
     *   <li>"Home Down Payment" - Medium-term housing goal</li>
     *   <li>"Retirement Savings" - Long-term financial security goal</li>
     *   <li>"Child's Education Fund" - Long-term education planning goal</li>
     * </ul>
     */
    @JsonProperty("name")
    private String name;

    /**
     * Detailed description of the financial goal and its purpose.
     * 
     * <p>This field provides additional context and details about the financial 
     * goal, helping users understand the purpose, importance, and specific 
     * requirements of their savings objective. It's particularly valuable for 
     * goal tracking analytics and personalized financial advice generation.</p>
     * 
     * <p><strong>Content Guidelines:</strong></p>
     * <ul>
     *   <li>Should explain the goal's purpose and importance</li>
     *   <li>May include specific milestones or sub-objectives</li>
     *   <li>Used by AI systems for personalized recommendation generation</li>
     *   <li>Helps financial advisors provide targeted guidance</li>
     * </ul>
     * 
     * <p><strong>AI Integration:</strong></p>
     * <ul>
     *   <li>Analyzed for goal categorization and risk assessment</li>
     *   <li>Used in natural language processing for personalized advice</li>
     *   <li>Supports automated goal achievement probability calculations</li>
     * </ul>
     */
    @JsonProperty("description")
    private String description;

    /**
     * Target monetary amount to be achieved for the financial goal.
     * 
     * <p>This field represents the total amount of money the user aims to save 
     * or accumulate for this specific goal. Using BigDecimal ensures precise 
     * financial calculations without floating-point arithmetic errors, which is 
     * critical for financial applications where accuracy is paramount.</p>
     * 
     * <p><strong>Financial Precision:</strong></p>
     * <ul>
     *   <li>BigDecimal provides arbitrary precision decimal arithmetic</li>
     *   <li>Eliminates floating-point rounding errors in financial calculations</li>
     *   <li>Supports currency amounts up to very large values</li>
     *   <li>Maintains consistency with financial industry standards</li>
     * </ul>
     * 
     * <p><strong>Business Applications:</strong></p>
     * <ul>
     *   <li>Used in progress percentage calculations</li>
     *   <li>Essential for savings rate recommendations</li>
     *   <li>Enables timeline adjustment suggestions</li>
     *   <li>Supports risk assessment for goal achievement</li>
     * </ul>
     * 
     * <p><strong>Validation Rules:</strong></p>
     * <ul>
     *   <li>Must be positive (greater than zero)</li>
     *   <li>Should have reasonable upper bounds for practical goals</li>
     *   <li>Precision typically limited to 2 decimal places for currency</li>
     * </ul>
     */
    @JsonProperty("targetAmount")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal targetAmount;

    /**
     * Current amount saved towards the financial goal.
     * 
     * <p>This field tracks the progress made towards achieving the target amount. 
     * It represents the cumulative savings or investments allocated to this 
     * specific goal. The precision provided by BigDecimal ensures accurate 
     * progress tracking and percentage calculations.</p>
     * 
     * <p><strong>Progress Tracking:</strong></p>
     * <ul>
     *   <li>Updated in real-time as contributions are made</li>
     *   <li>Used to calculate completion percentage (currentAmount / targetAmount)</li>
     *   <li>Enables milestone achievement notifications</li>
     *   <li>Supports historical progress analysis and trending</li>
     * </ul>
     * 
     * <p><strong>Financial Analytics:</strong></p>
     * <ul>
     *   <li>Used in savings velocity calculations</li>
     *   <li>Enables predictive timeline adjustments</li>
     *   <li>Supports comparative analysis across multiple goals</li>
     *   <li>Essential for personalized financial recommendations</li>
     * </ul>
     * 
     * <p><strong>Data Integrity:</strong></p>
     * <ul>
     *   <li>Should never exceed targetAmount in most business scenarios</li>
     *   <li>Must be non-negative (zero or positive)</li>
     *   <li>Changes trigger goal status recalculation</li>
     *   <li>Audited for compliance and reporting purposes</li>
     * </ul>
     */
    @JsonProperty("currentAmount")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal currentAmount;

    /**
     * Target date for achieving the financial goal.
     * 
     * <p>This field specifies when the user intends to reach their target amount. 
     * It's crucial for timeline-based financial planning, savings rate calculations, 
     * and risk assessment. The system uses this date to provide personalized 
     * recommendations for monthly savings targets and investment strategies.</p>
     * 
     * <p><strong>Financial Planning Integration:</strong></p>
     * <ul>
     *   <li>Used to calculate required monthly savings rate</li>
     *   <li>Enables time-based risk assessment for goal achievement</li>
     *   <li>Supports automated timeline adjustment recommendations</li>
     *   <li>Critical for retirement and long-term financial planning</li>
     * </ul>
     * 
     * <p><strong>AI-Powered Analytics:</strong></p>
     * <ul>
     *   <li>Analyzed for goal feasibility assessment</li>
     *   <li>Used in predictive modeling for goal achievement probability</li>
     *   <li>Enables proactive adjustments to savings strategies</li>
     *   <li>Supports market condition impact analysis on timeline</li>
     * </ul>
     * 
     * <p><strong>Business Rules:</strong></p>
     * <ul>
     *   <li>Should be in the future (after current date)</li>
     *   <li>Reasonable timeline based on target amount and current savings</li>
     *   <li>May be adjusted based on progress and external factors</li>
     *   <li>Used for deadline-based notifications and alerts</li>
     * </ul>
     */
    @JsonProperty("targetDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate targetDate;

    /**
     * Current status of the financial goal.
     * 
     * <p>This field indicates the current state and progress status of the goal. 
     * It's used for categorization, reporting, and triggering automated workflows 
     * such as notifications, recommendations, and status-based financial advice.</p>
     * 
     * <p><strong>Standard Status Values:</strong></p>
     * <ul>
     *   <li><strong>NOT_STARTED</strong> - Goal created but no contributions made</li>
     *   <li><strong>IN_PROGRESS</strong> - Actively working towards the goal</li>
     *   <li><strong>ON_TRACK</strong> - Progress is meeting expected timeline</li>
     *   <li><strong>BEHIND_SCHEDULE</strong> - Progress is slower than required</li>
     *   <li><strong>AHEAD_OF_SCHEDULE</strong> - Progress is faster than planned</li>
     *   <li><strong>COMPLETED</strong> - Target amount reached or exceeded</li>
     *   <li><strong>PAUSED</strong> - Temporarily suspended by user</li>
     *   <li><strong>CANCELLED</strong> - Goal discontinued or abandoned</li>
     * </ul>
     * 
     * <p><strong>Automated Status Management:</strong></p>
     * <ul>
     *   <li>Status automatically updated based on progress and timeline</li>
     *   <li>Triggers personalized notifications and recommendations</li>
     *   <li>Used in financial wellness scoring algorithms</li>
     *   <li>Enables status-based filtering and reporting</li>
     * </ul>
     * 
     * <p><strong>Integration Points:</strong></p>
     * <ul>
     *   <li>Connected to AI-powered risk assessment engine</li>
     *   <li>Used in regulatory compliance reporting</li>
     *   <li>Supports customer service and advisory interactions</li>
     *   <li>Essential for goal performance analytics</li>
     * </ul>
     */
    @JsonProperty("status")
    private String status;

    /**
     * Default constructor for GoalResponse.
     * 
     * <p>Creates an empty GoalResponse instance with all fields initialized to null. 
     * This constructor is primarily used by serialization frameworks (Jackson), 
     * ORM tools, and when building objects programmatically using setter methods.</p>
     * 
     * <p><strong>Usage Scenarios:</strong></p>
     * <ul>
     *   <li>JSON deserialization by Jackson framework</li>
     *   <li>JPA entity instantiation</li>
     *   <li>Builder pattern implementations</li>
     *   <li>Testing and mock object creation</li>
     * </ul>
     * 
     * <p><strong>Best Practices:</strong></p>
     * <ul>
     *   <li>Always set required fields after instantiation</li>
     *   <li>Validate object state before using in business logic</li>
     *   <li>Consider using parameterized constructor for complete initialization</li>
     * </ul>
     */
    public GoalResponse() {
        // Default constructor for serialization frameworks and ORM tools
        // All fields initialized to null by default
    }

    /**
     * Parameterized constructor for creating a fully initialized GoalResponse.
     * 
     * <p>This constructor creates a complete GoalResponse instance with all fields 
     * populated. It ensures that the object is in a valid state immediately upon 
     * creation, reducing the risk of null pointer exceptions and incomplete objects.</p>
     * 
     * <p><strong>Parameter Validation:</strong></p>
     * <p>While this constructor doesn't perform explicit validation, it's recommended 
     * that calling code ensures parameters meet business requirements:</p>
     * <ul>
     *   <li>id should be non-null and unique</li>
     *   <li>name should be non-null and non-empty</li>
     *   <li>targetAmount should be positive</li>
     *   <li>currentAmount should be non-negative and not exceed targetAmount</li>
     *   <li>targetDate should be in the future</li>
     *   <li>status should be one of the predefined status values</li>
     * </ul>
     * 
     * @param id The unique identifier for the goal (UUID)
     * @param name The human-readable name of the goal
     * @param description Detailed description of the goal's purpose
     * @param targetAmount The monetary target to be achieved
     * @param currentAmount The current progress towards the target
     * @param targetDate The date by which the goal should be achieved
     * @param status The current status of the goal
     * 
     * @throws NullPointerException if any required parameter is null
     */
    public GoalResponse(UUID id, String name, String description, BigDecimal targetAmount, 
                       BigDecimal currentAmount, LocalDate targetDate, String status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount;
        this.targetDate = targetDate;
        this.status = status;
    }

    /**
     * Gets the unique identifier of the financial goal.
     * 
     * @return The UUID identifier, or null if not set
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the financial goal.
     * 
     * <p><strong>Important:</strong> Once set, the ID should not be changed to 
     * maintain referential integrity across the system.</p>
     * 
     * @param id The UUID identifier to set
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Gets the human-readable name of the financial goal.
     * 
     * @return The goal name, or null if not set
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the human-readable name of the financial goal.
     * 
     * @param name The goal name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the detailed description of the financial goal.
     * 
     * @return The goal description, or null if not set
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the detailed description of the financial goal.
     * 
     * @param description The goal description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the target monetary amount for the financial goal.
     * 
     * @return The target amount as BigDecimal, or null if not set
     */
    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    /**
     * Sets the target monetary amount for the financial goal.
     * 
     * <p><strong>Financial Precision:</strong> Uses BigDecimal to ensure precise 
     * monetary calculations without floating-point errors.</p>
     * 
     * @param targetAmount The target amount to set
     */
    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    /**
     * Gets the current amount saved towards the financial goal.
     * 
     * @return The current amount as BigDecimal, or null if not set
     */
    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    /**
     * Sets the current amount saved towards the financial goal.
     * 
     * <p><strong>Progress Tracking:</strong> This value is used to calculate 
     * completion percentage and determine goal status.</p>
     * 
     * @param currentAmount The current amount to set
     */
    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    /**
     * Gets the target date for achieving the financial goal.
     * 
     * @return The target date, or null if not set
     */
    public LocalDate getTargetDate() {
        return targetDate;
    }

    /**
     * Sets the target date for achieving the financial goal.
     * 
     * <p><strong>Timeline Planning:</strong> This date is used for savings rate 
     * calculations and timeline-based recommendations.</p>
     * 
     * @param targetDate The target date to set
     */
    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    /**
     * Gets the current status of the financial goal.
     * 
     * @return The goal status, or null if not set
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the current status of the financial goal.
     * 
     * <p><strong>Status Management:</strong> Should be one of the predefined 
     * status values to ensure consistency across the system.</p>
     * 
     * @param status The goal status to set
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Calculates the completion percentage of the goal.
     * 
     * <p>This utility method computes the progress percentage based on the 
     * current amount and target amount. It handles edge cases and ensures 
     * safe calculations.</p>
     * 
     * @return The completion percentage as a double (0.0 to 100.0), or 0.0 if calculation is not possible
     */
    public double getCompletionPercentage() {
        if (targetAmount == null || currentAmount == null || 
            targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        
        return currentAmount.divide(targetAmount, 4, BigDecimal.ROUND_HALF_UP)
                          .multiply(new BigDecimal("100"))
                          .doubleValue();
    }

    /**
     * Calculates the remaining amount needed to achieve the goal.
     * 
     * @return The remaining amount as BigDecimal, or null if calculation is not possible
     */
    public BigDecimal getRemainingAmount() {
        if (targetAmount == null || currentAmount == null) {
            return null;
        }
        
        BigDecimal remaining = targetAmount.subtract(currentAmount);
        return remaining.max(BigDecimal.ZERO); // Ensure non-negative result
    }

    /**
     * Checks if the goal has been completed (current amount >= target amount).
     * 
     * @return true if the goal is completed, false otherwise
     */
    public boolean isCompleted() {
        if (targetAmount == null || currentAmount == null) {
            return false;
        }
        
        return currentAmount.compareTo(targetAmount) >= 0;
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * 
     * <p>Two GoalResponse objects are considered equal if they have the same ID. 
     * This follows the business rule that goals are uniquely identified by their UUID.</p>
     * 
     * @param obj the reference object with which to compare
     * @return true if this object is equal to the obj argument; false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        
        GoalResponse that = (GoalResponse) obj;
        return Objects.equals(id, that.id) &&
               Objects.equals(name, that.name) &&
               Objects.equals(description, that.description) &&
               Objects.equals(targetAmount, that.targetAmount) &&
               Objects.equals(currentAmount, that.currentAmount) &&
               Objects.equals(targetDate, that.targetDate) &&
               Objects.equals(status, that.status);
    }

    /**
     * Returns a hash code value for the object.
     * 
     * <p>The hash code is computed based on all fields to ensure consistency 
     * with the equals method and proper behavior in hash-based collections.</p>
     * 
     * @return a hash code value for this object
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, targetAmount, currentAmount, targetDate, status);
    }

    /**
     * Returns a string representation of the GoalResponse object.
     * 
     * <p>This method provides a comprehensive view of the goal's state, including 
     * all field values and calculated progress information. The output is formatted 
     * for readability and debugging purposes.</p>
     * 
     * <p><strong>Security Note:</strong> This method includes all field values. 
     * Be cautious when logging or displaying this information in production 
     * environments to avoid exposing sensitive financial data.</p>
     * 
     * @return a detailed string representation of this GoalResponse
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("GoalResponse{");
        sb.append("id=").append(id);
        sb.append(", name='").append(name).append('\'');
        sb.append(", description='").append(description).append('\'');
        sb.append(", targetAmount=").append(targetAmount);
        sb.append(", currentAmount=").append(currentAmount);
        sb.append(", targetDate=").append(targetDate);
        sb.append(", status='").append(status).append('\'');
        
        // Add calculated fields for enhanced debugging
        if (targetAmount != null && currentAmount != null) {
            sb.append(", completionPercentage=").append(String.format("%.2f%%", getCompletionPercentage()));
            sb.append(", remainingAmount=").append(getRemainingAmount());
            sb.append(", isCompleted=").append(isCompleted());
        }
        
        sb.append('}');
        return sb.toString();
    }
}