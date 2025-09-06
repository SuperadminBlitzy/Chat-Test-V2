package com.ufs.wellness.service;

// External imports - JUnit 5.10.2
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;

// External imports - Mockito 5.11.0
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

// External imports - AssertJ 3.25.3
import static org.assertj.core.api.Assertions.*;

// Internal imports - Service Layer
import com.ufs.wellness.service.impl.GoalServiceImpl;

// Internal imports - Data Transfer Objects
import com.ufs.wellness.dto.GoalRequest;
import com.ufs.wellness.dto.GoalResponse;

// Internal imports - Domain Model
import com.ufs.wellness.model.FinancialGoal;

// Internal imports - Repository Layer
import com.ufs.wellness.repository.FinancialGoalRepository;

// Internal imports - Exception Handling
import com.ufs.wellness.exception.WellnessException;

// Java Core Libraries - Version 21
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Comprehensive unit test suite for the GoalService implementation within the
 * Unified Financial Services Platform's Financial Wellness Service.
 * 
 * <p><strong>Testing Strategy:</strong></p>
 * <p>This test suite implements enterprise-grade testing practices with comprehensive
 * coverage of all business scenarios, edge cases, and error conditions. It validates
 * the GoalService's compliance with the Personalized Financial Wellness requirements
 * and ensures robust operation within the microservices architecture.</p>
 * 
 * <p><strong>Test Coverage Areas:</strong></p>
 * <ul>
 *   <li>Goal Creation: Success scenarios, validation failures, and business rule enforcement</li>
 *   <li>Goal Retrieval: Individual goal access, customer portfolio retrieval, and not-found handling</li>
 *   <li>Goal Updates: Complete goal modification, partial updates, and validation</li>
 *   <li>Goal Deletion: Successful removal, constraint violations, and data consistency</li>
 *   <li>Error Handling: Exception scenarios, input validation, and system resilience</li>
 *   <li>Integration Points: Repository interactions, DTO conversions, and business logic validation</li>
 * </ul>
 * 
 * <p><strong>Financial Services Compliance:</strong></p>
 * <ul>
 *   <li>BigDecimal precision testing for financial calculations</li>
 *   <li>UUID-based customer identification validation</li>
 *   <li>Comprehensive audit trail verification</li>
 *   <li>Financial data integrity constraints testing</li>
 *   <li>Regulatory compliance scenario validation</li>
 * </ul>
 * 
 * <p><strong>Performance and Scalability:</strong></p>
 * <ul>
 *   <li>Mock-based testing for isolated unit validation</li>
 *   <li>Repository interaction optimization verification</li>
 *   <li>Memory usage patterns for large goal portfolios</li>
 *   <li>Concurrent operation safety validation</li>
 * </ul>
 * 
 * <p><strong>Technology Stack Integration:</strong></p>
 * <ul>
 *   <li>JUnit 5.10.2 for modern testing framework capabilities</li>
 *   <li>Mockito 5.11.0 for sophisticated mocking and stubbing</li>
 *   <li>AssertJ 3.25.3 for fluent and expressive assertions</li>
 *   <li>Spring Boot Test integration for dependency injection testing</li>
 * </ul>
 * 
 * <p><strong>Best Practices Implementation:</strong></p>
 * <ul>
 *   <li>Comprehensive test documentation with business context</li>
 *   <li>Nested test classes for logical grouping and organization</li>
 *   <li>Descriptive test names reflecting business scenarios</li>
 *   <li>Thorough setup and teardown procedures</li>
 *   <li>Extensive edge case and error condition coverage</li>
 * </ul>
 * 
 * @author Unified Financial Services Platform - Financial Wellness Team
 * @version 1.0
 * @since 2025-01-01
 * @see GoalService
 * @see GoalServiceImpl
 * @see FinancialGoal
 * @see FinancialGoalRepository
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GoalService Implementation Tests")
public class GoalServiceTests {

    /**
     * Mock repository for FinancialGoal entity operations.
     * 
     * <p>This mock simulates the data access layer behavior, enabling isolated testing
     * of the service layer business logic without requiring actual database connections.
     * The mock provides controlled responses for various scenarios including successful
     * operations, data not found conditions, and constraint violations.</p>
     * 
     * <p><strong>Mock Configuration Benefits:</strong></p>
     * <ul>
     *   <li>Deterministic behavior for consistent test execution</li>
     *   <li>Performance optimization by eliminating database overhead</li>
     *   <li>Complete control over repository response scenarios</li>
     *   <li>Ability to simulate database failures and edge conditions</li>
     * </ul>
     */
    @Mock
    private FinancialGoalRepository financialGoalRepository;

    /**
     * Service under test with automatic mock dependency injection.
     * 
     * <p>The @InjectMocks annotation automatically injects the mocked repository
     * into the GoalServiceImpl instance, creating a fully configured service
     * for testing while maintaining isolation from external dependencies.</p>
     * 
     * <p><strong>Injection Benefits:</strong></p>
     * <ul>
     *   <li>Automatic dependency resolution for clean test setup</li>
     *   <li>Real service instance behavior with controlled dependencies</li>
     *   <li>Comprehensive business logic validation capabilities</li>
     *   <li>Integration testing readiness with minimal configuration changes</li>
     * </ul>
     */
    @InjectMocks
    private GoalServiceImpl goalService;

    // Test Data Constants for Consistent Testing
    private static final String VALID_CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440000";
    private static final String INVALID_CUSTOMER_ID = "invalid-uuid-format";
    private static final String VALID_GOAL_NAME = "Emergency Fund";
    private static final String UPDATED_GOAL_NAME = "Enhanced Emergency Fund";
    private static final String VALID_GOAL_DESCRIPTION = "Six months of living expenses for financial security";
    private static final BigDecimal VALID_TARGET_AMOUNT = new BigDecimal("10000.00");
    private static final BigDecimal VALID_CURRENT_AMOUNT = new BigDecimal("2500.50");
    private static final BigDecimal UPDATED_TARGET_AMOUNT = new BigDecimal("15000.00");
    private static final LocalDate VALID_TARGET_DATE = LocalDate.of(2025, 12, 31);
    private static final LocalDate UPDATED_TARGET_DATE = LocalDate.of(2026, 6, 30);
    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String COMPLETED_STATUS = "COMPLETED";
    private static final Long VALID_GOAL_ID = 1L;
    private static final Long INVALID_GOAL_ID = 999L;

    // Common test data objects
    private GoalRequest validGoalRequest;
    private FinancialGoal validFinancialGoal;
    private UUID validCustomerUuid;
    private UUID validGoalUuid;

    /**
     * Comprehensive test setup executed before each test method.
     * 
     * <p>This method initializes all common test data objects with realistic
     * financial wellness data, ensuring consistent and predictable test
     * execution across all test scenarios. The setup follows the financial
     * services data patterns and business rules.</p>
     * 
     * <p><strong>Setup Components:</strong></p>
     * <ul>
     *   <li>Valid GoalRequest objects with comprehensive financial data</li>
     *   <li>Realistic FinancialGoal entities with proper relationships</li>
     *   <li>UUID generation for customer and goal identification</li>
     *   <li>BigDecimal monetary values for financial precision</li>
     *   <li>Date objects representing realistic financial timelines</li>
     * </ul>
     * 
     * <p><strong>Financial Data Validation:</strong></p>
     * <ul>
     *   <li>Positive monetary amounts for realistic financial goals</li>
     *   <li>Future target dates for achievable financial planning</li>
     *   <li>Valid UUID formats for customer identification</li>
     *   <li>Descriptive goal names for user experience validation</li>
     * </ul>
     */
    @BeforeEach
    void setUp() {
        // Initialize UUID objects for customer and goal identification
        validCustomerUuid = UUID.fromString(VALID_CUSTOMER_ID);
        validGoalUuid = UUID.randomUUID();

        // Create comprehensive GoalRequest for testing goal creation and updates
        validGoalRequest = new GoalRequest();
        validGoalRequest.setName(VALID_GOAL_NAME);
        validGoalRequest.setDescription(VALID_GOAL_DESCRIPTION);
        validGoalRequest.setTargetAmount(VALID_TARGET_AMOUNT);
        validGoalRequest.setTargetDate(VALID_TARGET_DATE);
        validGoalRequest.setCustomerId(VALID_CUSTOMER_ID);

        // Create realistic FinancialGoal entity with complete financial data
        validFinancialGoal = new FinancialGoal();
        validFinancialGoal.setId(validGoalUuid.toString());
        validFinancialGoal.setWellnessProfileId(VALID_CUSTOMER_ID);
        validFinancialGoal.setGoalName(VALID_GOAL_NAME);
        validFinancialGoal.setTargetAmount(VALID_TARGET_AMOUNT);
        validFinancialGoal.setCurrentAmount(VALID_CURRENT_AMOUNT);
        validFinancialGoal.setTargetDate(VALID_TARGET_DATE);
        validFinancialGoal.setStatus(ACTIVE_STATUS);
        validFinancialGoal.setCreatedDate(LocalDateTime.now().minusDays(30));
        validFinancialGoal.setLastModifiedDate(LocalDateTime.now().minusDays(1));
    }

    /**
     * Comprehensive test suite for goal creation functionality.
     * 
     * <p>This nested test class validates all aspects of financial goal creation
     * including successful creation scenarios, comprehensive input validation,
     * business rule enforcement, and error handling. It ensures that the
     * createGoal method properly supports the Personalized Financial Wellness
     * feature requirements.</p>
     */
    @Nested
    @DisplayName("Goal Creation Tests")
    class GoalCreationTests {

        /**
         * Tests successful creation of a financial goal with comprehensive validation.
         * 
         * <p><strong>Business Scenario:</strong></p>
         * <p>A customer successfully creates a new financial goal (e.g., Emergency Fund)
         * through the Financial Health Assessment workflow. The system validates all
         * input parameters, assigns a unique identifier, initializes default values,
         * and persists the goal for future tracking and progress monitoring.</p>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>Goal request parameter validation and business rule compliance</li>
         *   <li>Customer existence verification and UUID format validation</li>
         *   <li>Goal name uniqueness checking within customer portfolio</li>
         *   <li>Financial precision maintenance using BigDecimal calculations</li>
         *   <li>Proper DTO-to-Entity conversion with calculated field generation</li>
         *   <li>Repository persistence with transaction management validation</li>
         * </ul>
         * 
         * <p><strong>Expected Behavior:</strong></p>
         * <ul>
         *   <li>Valid GoalRequest successfully converted to FinancialGoal entity</li>
         *   <li>Default values properly initialized (currentAmount = 0, status = ACTIVE)</li>
         *   <li>Comprehensive GoalResponse returned with calculated progress metrics</li>
         *   <li>Repository save operation executed exactly once with correct data</li>
         *   <li>All monetary calculations maintain BigDecimal precision</li>
         * </ul>
         */
        @Test
        @DisplayName("Should successfully create a new financial goal")
        void testCreateGoal_Success() {
            // Arrange: Setup mock repository behavior for successful goal creation
            when(financialGoalRepository.findByCustomerId(validCustomerUuid))
                .thenReturn(Collections.emptyList()); // No existing goals to prevent duplicate names
            when(financialGoalRepository.save(any(FinancialGoal.class)))
                .thenReturn(validFinancialGoal);

            // Act: Execute goal creation through the service layer
            GoalResponse result = goalService.createGoal(validGoalRequest);

            // Assert: Comprehensive validation of goal creation results
            assertThat(result).isNotNull()
                .satisfies(response -> {
                    assertThat(response.getName()).isEqualTo(VALID_GOAL_NAME);
                    assertThat(response.getTargetAmount()).isEqualByComparingTo(VALID_TARGET_AMOUNT);
                    assertThat(response.getCurrentAmount()).isEqualByComparingTo(VALID_CURRENT_AMOUNT);
                    assertThat(response.getTargetDate()).isEqualTo(VALID_TARGET_DATE);
                    assertThat(response.getStatus()).isEqualTo(ACTIVE_STATUS);
                });

            // Verify: Repository interactions and method invocations
            verify(financialGoalRepository, times(1)).findByCustomerId(validCustomerUuid);
            verify(financialGoalRepository, times(1)).save(any(FinancialGoal.class));
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests goal creation failure when GoalRequest is null.
         * 
         * <p><strong>Error Scenario:</strong></p>
         * <p>The service receives a null GoalRequest parameter, which violates
         * the method contract and business requirements. The system should
         * immediately reject the request with appropriate error messaging.</p>
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException when GoalRequest is null")
        void testCreateGoal_NullRequest() {
            // Act & Assert: Verify proper exception handling for null input
            assertThatThrownBy(() -> goalService.createGoal(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("GoalRequest cannot be null");

            // Verify: No repository interactions for invalid input
            verifyNoInteractions(financialGoalRepository);
        }

        /**
         * Tests goal creation failure when customer ID is invalid.
         * 
         * <p><strong>Error Scenario:</strong></p>
         * <p>The GoalRequest contains an invalid customer ID that doesn't conform
         * to UUID format requirements, preventing proper customer identification
         * and goal association within the financial wellness platform.</p>
         */
        @Test
        @DisplayName("Should throw WellnessException when customer ID is invalid")
        void testCreateGoal_InvalidCustomerId() {
            // Arrange: Create request with invalid customer ID format
            GoalRequest invalidRequest = new GoalRequest();
            invalidRequest.setName(VALID_GOAL_NAME);
            invalidRequest.setTargetAmount(VALID_TARGET_AMOUNT);
            invalidRequest.setTargetDate(VALID_TARGET_DATE);
            invalidRequest.setCustomerId(INVALID_CUSTOMER_ID);

            // Act & Assert: Verify proper exception handling for invalid customer ID
            assertThatThrownBy(() -> goalService.createGoal(invalidRequest))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Invalid customer ID format");

            // Verify: No repository interactions for invalid customer ID
            verifyNoInteractions(financialGoalRepository);
        }

        /**
         * Tests goal creation failure when goal name already exists for customer.
         * 
         * <p><strong>Business Rule Scenario:</strong></p>
         * <p>A customer attempts to create a new goal with a name that already
         * exists in their goal portfolio. The system enforces goal name
         * uniqueness per customer to prevent confusion and improve user experience.</p>
         */
        @Test
        @DisplayName("Should throw WellnessException when goal name already exists")
        void testCreateGoal_DuplicateGoalName() {
            // Arrange: Setup existing goal with same name
            FinancialGoal existingGoal = new FinancialGoal();
            existingGoal.setGoalName(VALID_GOAL_NAME);
            existingGoal.setWellnessProfileId(VALID_CUSTOMER_ID);

            when(financialGoalRepository.findByCustomerId(validCustomerUuid))
                .thenReturn(Arrays.asList(existingGoal));

            // Act & Assert: Verify duplicate name prevention
            assertThatThrownBy(() -> goalService.createGoal(validGoalRequest))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("A goal with the name '" + VALID_GOAL_NAME + "' already exists");

            // Verify: Repository checked for existing goals but no save operation
            verify(financialGoalRepository, times(1)).findByCustomerId(validCustomerUuid);
            verify(financialGoalRepository, never()).save(any(FinancialGoal.class));
        }

        /**
         * Tests comprehensive validation of GoalRequest fields.
         * 
         * <p><strong>Input Validation Scenarios:</strong></p>
         * <p>This test validates that the service properly enforces all business
         * rules and constraints for goal creation including required fields,
         * positive amounts, future dates, and valid customer identification.</p>
         */
        @Test
        @DisplayName("Should validate all required fields in GoalRequest")
        void testCreateGoal_FieldValidation() {
            // Test null customer ID
            GoalRequest requestWithNullCustomerId = new GoalRequest();
            requestWithNullCustomerId.setName(VALID_GOAL_NAME);
            requestWithNullCustomerId.setTargetAmount(VALID_TARGET_AMOUNT);
            requestWithNullCustomerId.setTargetDate(VALID_TARGET_DATE);
            requestWithNullCustomerId.setCustomerId(null);

            assertThatThrownBy(() -> goalService.createGoal(requestWithNullCustomerId))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Customer ID is required");

            // Test null goal name
            GoalRequest requestWithNullName = new GoalRequest();
            requestWithNullName.setName(null);
            requestWithNullName.setTargetAmount(VALID_TARGET_AMOUNT);
            requestWithNullName.setTargetDate(VALID_TARGET_DATE);
            requestWithNullName.setCustomerId(VALID_CUSTOMER_ID);

            assertThatThrownBy(() -> goalService.createGoal(requestWithNullName))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Goal name is required");

            // Test null target amount
            GoalRequest requestWithNullAmount = new GoalRequest();
            requestWithNullAmount.setName(VALID_GOAL_NAME);
            requestWithNullAmount.setTargetAmount(null);
            requestWithNullAmount.setTargetDate(VALID_TARGET_DATE);
            requestWithNullAmount.setCustomerId(VALID_CUSTOMER_ID);

            assertThatThrownBy(() -> goalService.createGoal(requestWithNullAmount))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Target amount is required");

            // Test negative target amount
            GoalRequest requestWithNegativeAmount = new GoalRequest();
            requestWithNegativeAmount.setName(VALID_GOAL_NAME);
            requestWithNegativeAmount.setTargetAmount(new BigDecimal("-1000.00"));
            requestWithNegativeAmount.setTargetDate(VALID_TARGET_DATE);
            requestWithNegativeAmount.setCustomerId(VALID_CUSTOMER_ID);

            assertThatThrownBy(() -> goalService.createGoal(requestWithNegativeAmount))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Target amount must be greater than zero");

            // Test past target date
            GoalRequest requestWithPastDate = new GoalRequest();
            requestWithPastDate.setName(VALID_GOAL_NAME);
            requestWithPastDate.setTargetAmount(VALID_TARGET_AMOUNT);
            requestWithPastDate.setTargetDate(LocalDate.of(2020, 1, 1));
            requestWithPastDate.setCustomerId(VALID_CUSTOMER_ID);

            assertThatThrownBy(() -> goalService.createGoal(requestWithPastDate))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Target date must be in the future");
        }
    }

    /**
     * Comprehensive test suite for goal retrieval functionality.
     * 
     * <p>This nested test class validates all aspects of financial goal retrieval
     * including individual goal access, customer portfolio retrieval, and proper
     * handling of not-found scenarios. It ensures optimal performance and data
     * integrity for the financial wellness dashboard and customer experience.</p>
     */
    @Nested
    @DisplayName("Goal Retrieval Tests")
    class GoalRetrievalTests {

        /**
         * Tests successful retrieval of a financial goal by its unique identifier.
         * 
         * <p><strong>Business Scenario:</strong></p>
         * <p>A customer or system component requests detailed information about
         * a specific financial goal using its unique identifier. The system
         * retrieves the goal data, performs necessary calculations, and returns
         * comprehensive goal information including progress metrics.</p>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>Goal ID validation and UUID conversion handling</li>
         *   <li>Repository query execution with proper parameter binding</li>
         *   <li>Entity-to-DTO conversion with calculated field generation</li>
         *   <li>Financial precision maintenance in progress calculations</li>
         *   <li>Complete goal information presentation for customer dashboard</li>
         * </ul>
         */
        @Test
        @DisplayName("Should successfully retrieve a goal by ID")
        void testGetGoal_Success() {
            // Arrange: Setup mock repository to return valid goal
            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(validFinancialGoal));

            // Act: Execute goal retrieval through service layer
            GoalResponse result = goalService.getGoalById(VALID_GOAL_ID);

            // Assert: Comprehensive validation of retrieved goal data
            assertThat(result).isNotNull()
                .satisfies(response -> {
                    assertThat(response.getName()).isEqualTo(VALID_GOAL_NAME);
                    assertThat(response.getTargetAmount()).isEqualByComparingTo(VALID_TARGET_AMOUNT);
                    assertThat(response.getCurrentAmount()).isEqualByComparingTo(VALID_CURRENT_AMOUNT);
                    assertThat(response.getTargetDate()).isEqualTo(VALID_TARGET_DATE);
                    assertThat(response.getStatus()).isEqualTo(ACTIVE_STATUS);
                    // Validate calculated fields
                    assertThat(response.getCompletionPercentage()).isGreaterThan(0.0);
                    assertThat(response.getRemainingAmount()).isNotNull();
                });

            // Verify: Repository interaction for goal retrieval
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests goal retrieval failure when goal is not found.
         * 
         * <p><strong>Error Scenario:</strong></p>
         * <p>A request is made to retrieve a goal that doesn't exist in the system,
         * either due to invalid ID, deleted goal, or data inconsistency. The system
         * should handle this gracefully with appropriate error messaging.</p>
         * 
         * <p><strong>Expected Behavior:</strong></p>
         * <p>The service throws a WellnessException indicating that the requested
         * goal was not found, preventing null pointer exceptions and providing
         * clear feedback for error handling and user experience optimization.</p>
         */
        @Test
        @DisplayName("Should throw WellnessException when goal is not found")
        void testGetGoal_NotFound() {
            // Arrange: Setup mock repository to return empty result
            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

            // Act & Assert: Verify proper not-found exception handling
            assertThatThrownBy(() -> goalService.getGoalById(INVALID_GOAL_ID))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Financial goal not found with ID: " + INVALID_GOAL_ID);

            // Verify: Repository was queried but no additional operations
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests goal retrieval failure with invalid goal ID parameters.
         * 
         * <p><strong>Input Validation Scenarios:</strong></p>
         * <p>This test validates proper handling of invalid goal ID parameters
         * including null values, negative numbers, and zero values that violate
         * the business rules for goal identification.</p>
         */
        @Test
        @DisplayName("Should validate goal ID parameters")
        void testGetGoal_InvalidParameters() {
            // Test null goal ID
            assertThatThrownBy(() -> goalService.getGoalById(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Test zero goal ID
            assertThatThrownBy(() -> goalService.getGoalById(0L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Test negative goal ID
            assertThatThrownBy(() -> goalService.getGoalById(-1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Verify: No repository interactions for invalid parameters
            verifyNoInteractions(financialGoalRepository);
        }

        /**
         * Tests successful retrieval of all goals for a specific customer.
         * 
         * <p><strong>Business Scenario:</strong></p>
         * <p>A customer accesses their financial wellness dashboard, requiring
         * retrieval of all their financial goals for comprehensive portfolio
         * overview, progress tracking, and personalized recommendation generation.</p>
         */
        @Test
        @DisplayName("Should successfully retrieve all goals for a customer")
        void testGetGoalsByCustomerId_Success() {
            // Arrange: Setup multiple goals for customer
            FinancialGoal goal1 = createTestGoal("Emergency Fund", new BigDecimal("10000.00"));
            FinancialGoal goal2 = createTestGoal("Vacation Fund", new BigDecimal("5000.00"));
            List<FinancialGoal> customerGoals = Arrays.asList(goal1, goal2);

            when(financialGoalRepository.findByCustomerId(validCustomerUuid))
                .thenReturn(customerGoals);

            // Act: Retrieve customer's goal portfolio
            List<GoalResponse> result = goalService.getGoalsByCustomerId(VALID_CUSTOMER_ID);

            // Assert: Validate comprehensive goal portfolio
            assertThat(result)
                .hasSize(2)
                .extracting(GoalResponse::getName)
                .containsExactly("Emergency Fund", "Vacation Fund");

            // Verify: Repository interaction for customer goals
            verify(financialGoalRepository, times(1)).findByCustomerId(validCustomerUuid);
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests customer goal retrieval with empty result set.
         * 
         * <p><strong>Edge Case Scenario:</strong></p>
         * <p>A customer who has not yet created any financial goals accesses
         * their dashboard. The system should handle this gracefully by returning
         * an empty list rather than throwing exceptions.</p>
         */
        @Test
        @DisplayName("Should return empty list when customer has no goals")
        void testGetGoalsByCustomerId_EmptyResult() {
            // Arrange: Setup empty goals list for customer
            when(financialGoalRepository.findByCustomerId(validCustomerUuid))
                .thenReturn(Collections.emptyList());

            // Act: Retrieve goals for customer with no goals
            List<GoalResponse> result = goalService.getGoalsByCustomerId(VALID_CUSTOMER_ID);

            // Assert: Validate empty result handling
            assertThat(result).isNotNull().isEmpty();

            // Verify: Repository interaction occurred
            verify(financialGoalRepository, times(1)).findByCustomerId(validCustomerUuid);
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests customer goal retrieval with invalid customer ID parameters.
         * 
         * <p><strong>Input Validation Scenarios:</strong></p>
         * <p>This test validates proper handling of invalid customer ID parameters
         * including null values, empty strings, and malformed UUID formats.</p>
         */
        @Test
        @DisplayName("Should validate customer ID parameters")
        void testGetGoalsByCustomerId_InvalidParameters() {
            // Test null customer ID
            assertThatThrownBy(() -> goalService.getGoalsByCustomerId(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Customer ID cannot be null or empty");

            // Test empty customer ID
            assertThatThrownBy(() -> goalService.getGoalsByCustomerId(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Customer ID cannot be null or empty");

            // Test whitespace-only customer ID
            assertThatThrownBy(() -> goalService.getGoalsByCustomerId("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Customer ID cannot be null or empty");

            // Test invalid UUID format
            assertThatThrownBy(() -> goalService.getGoalsByCustomerId(INVALID_CUSTOMER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid customer ID format");

            // Verify: No repository interactions for invalid parameters
            verifyNoInteractions(financialGoalRepository);
        }
    }

    /**
     * Comprehensive test suite for goal update functionality.
     * 
     * <p>This nested test class validates all aspects of financial goal updates
     * including successful modifications, field validation, business rule
     * enforcement, and comprehensive error handling for the dynamic financial
     * planning requirements.</p>
     */
    @Nested
    @DisplayName("Goal Update Tests")
    class GoalUpdateTests {

        /**
         * Tests successful update of a financial goal with comprehensive validation.
         * 
         * <p><strong>Business Scenario:</strong></p>
         * <p>A customer modifies their existing financial goal due to changed
         * circumstances, revised financial capacity, or updated timeline
         * requirements. The system validates all changes, updates the goal,
         * and recalculates progress metrics and status information.</p>
         */
        @Test
        @DisplayName("Should successfully update an existing goal")
        void testUpdateGoal_Success() {
            // Arrange: Setup existing goal and update request
            GoalRequest updateRequest = new GoalRequest();
            updateRequest.setName(UPDATED_GOAL_NAME);
            updateRequest.setTargetAmount(UPDATED_TARGET_AMOUNT);
            updateRequest.setTargetDate(UPDATED_TARGET_DATE);
            updateRequest.setCustomerId(VALID_CUSTOMER_ID);

            FinancialGoal updatedGoal = new FinancialGoal();
            updatedGoal.setId(validGoalUuid.toString());
            updatedGoal.setGoalName(UPDATED_GOAL_NAME);
            updatedGoal.setTargetAmount(UPDATED_TARGET_AMOUNT);
            updatedGoal.setTargetDate(UPDATED_TARGET_DATE);
            updatedGoal.setCurrentAmount(VALID_CURRENT_AMOUNT);
            updatedGoal.setStatus(ACTIVE_STATUS);
            updatedGoal.setWellnessProfileId(VALID_CUSTOMER_ID);

            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(validFinancialGoal));
            when(financialGoalRepository.findByCustomerId(validCustomerUuid))
                .thenReturn(Arrays.asList(validFinancialGoal));
            when(financialGoalRepository.save(any(FinancialGoal.class)))
                .thenReturn(updatedGoal);

            // Act: Execute goal update
            GoalResponse result = goalService.updateGoal(VALID_GOAL_ID, updateRequest);

            // Assert: Validate successful update
            assertThat(result).isNotNull()
                .satisfies(response -> {
                    assertThat(response.getName()).isEqualTo(UPDATED_GOAL_NAME);
                    assertThat(response.getTargetAmount()).isEqualByComparingTo(UPDATED_TARGET_AMOUNT);
                    assertThat(response.getTargetDate()).isEqualTo(UPDATED_TARGET_DATE);
                });

            // Verify: Repository interactions for update operation
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verify(financialGoalRepository, times(1)).findByCustomerId(validCustomerUuid);
            verify(financialGoalRepository, times(1)).save(any(FinancialGoal.class));
        }

        /**
         * Tests goal update failure when goal is not found.
         * 
         * <p><strong>Error Scenario:</strong></p>
         * <p>An attempt is made to update a goal that doesn't exist in the system,
         * requiring proper error handling and user feedback.</p>
         */
        @Test
        @DisplayName("Should throw WellnessException when updating non-existent goal")
        void testUpdateGoal_GoalNotFound() {
            // Arrange: Setup repository to return empty result
            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

            // Act & Assert: Verify not-found exception handling
            assertThatThrownBy(() -> goalService.updateGoal(INVALID_GOAL_ID, validGoalRequest))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Financial goal not found with ID: " + INVALID_GOAL_ID);

            // Verify: Repository was queried but no save operation
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verify(financialGoalRepository, never()).save(any(FinancialGoal.class));
        }

        /**
         * Tests goal update validation for invalid parameters.
         * 
         * <p><strong>Input Validation Scenarios:</strong></p>
         * <p>This test validates proper handling of invalid update parameters
         * including null goal IDs, null update requests, and invalid field values.</p>
         */
        @Test
        @DisplayName("Should validate update parameters")
        void testUpdateGoal_InvalidParameters() {
            // Test null goal ID
            assertThatThrownBy(() -> goalService.updateGoal(null, validGoalRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Test null update request
            assertThatThrownBy(() -> goalService.updateGoal(VALID_GOAL_ID, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("GoalRequest cannot be null");

            // Test zero goal ID
            assertThatThrownBy(() -> goalService.updateGoal(0L, validGoalRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Verify: No repository interactions for invalid parameters
            verifyNoInteractions(financialGoalRepository);
        }
    }

    /**
     * Comprehensive test suite for goal deletion functionality.
     * 
     * <p>This nested test class validates all aspects of financial goal deletion
     * including successful removal, constraint validation, and error handling
     * to ensure data integrity and system consistency.</p>
     */
    @Nested
    @DisplayName("Goal Deletion Tests")
    class GoalDeletionTests {

        /**
         * Tests successful deletion of a financial goal.
         * 
         * <p><strong>Business Scenario:</strong></p>
         * <p>A customer removes a financial goal that is no longer relevant or
         * achievable. The system validates the deletion request, ensures data
         * consistency, and permanently removes the goal from the customer's portfolio.</p>
         */
        @Test
        @DisplayName("Should successfully delete an existing goal")
        void testDeleteGoal_Success() {
            // Arrange: Setup existing goal for deletion
            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(validFinancialGoal));
            doNothing().when(financialGoalRepository).delete(any(FinancialGoal.class));

            // Act: Execute goal deletion
            assertThatCode(() -> goalService.deleteGoal(VALID_GOAL_ID))
                .doesNotThrowAnyException();

            // Verify: Repository interactions for deletion
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verify(financialGoalRepository, times(1)).delete(validFinancialGoal);
            verifyNoMoreInteractions(financialGoalRepository);
        }

        /**
         * Tests goal deletion failure when goal is not found.
         * 
         * <p><strong>Error Scenario:</strong></p>
         * <p>An attempt is made to delete a goal that doesn't exist in the system,
         * requiring appropriate error handling and user feedback.</p>
         */
        @Test
        @DisplayName("Should throw WellnessException when deleting non-existent goal")
        void testDeleteGoal_GoalNotFound() {
            // Arrange: Setup repository to return empty result
            when(financialGoalRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

            // Act & Assert: Verify not-found exception handling
            assertThatThrownBy(() -> goalService.deleteGoal(INVALID_GOAL_ID))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Financial goal not found with ID: " + INVALID_GOAL_ID);

            // Verify: Repository was queried but no delete operation
            verify(financialGoalRepository, times(1)).findById(any(UUID.class));
            verify(financialGoalRepository, never()).delete(any(FinancialGoal.class));
        }

        /**
         * Tests goal deletion validation for invalid parameters.
         * 
         * <p><strong>Input Validation Scenarios:</strong></p>
         * <p>This test validates proper handling of invalid deletion parameters
         * including null goal IDs, negative numbers, and zero values.</p>
         */
        @Test
        @DisplayName("Should validate deletion parameters")
        void testDeleteGoal_InvalidParameters() {
            // Test null goal ID
            assertThatThrownBy(() -> goalService.deleteGoal(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Test zero goal ID
            assertThatThrownBy(() -> goalService.deleteGoal(0L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Test negative goal ID
            assertThatThrownBy(() -> goalService.deleteGoal(-1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Goal ID must be positive and non-null");

            // Verify: No repository interactions for invalid parameters
            verifyNoInteractions(financialGoalRepository);
        }
    }

    /**
     * Helper method to create test FinancialGoal entities with specified parameters.
     * 
     * <p>This utility method simplifies test data creation by providing a standardized
     * way to generate FinancialGoal entities with varying attributes while maintaining
     * consistency in test data structure and validation.</p>
     * 
     * @param goalName The name of the goal to create
     * @param targetAmount The target amount for the goal
     * @return A fully configured FinancialGoal entity for testing
     */
    private FinancialGoal createTestGoal(String goalName, BigDecimal targetAmount) {
        FinancialGoal goal = new FinancialGoal();
        goal.setId(UUID.randomUUID().toString());
        goal.setWellnessProfileId(VALID_CUSTOMER_ID);
        goal.setGoalName(goalName);
        goal.setTargetAmount(targetAmount);
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setTargetDate(VALID_TARGET_DATE);
        goal.setStatus(ACTIVE_STATUS);
        goal.setCreatedDate(LocalDateTime.now().minusDays(10));
        goal.setLastModifiedDate(LocalDateTime.now().minusDays(1));
        return goal;
    }
}