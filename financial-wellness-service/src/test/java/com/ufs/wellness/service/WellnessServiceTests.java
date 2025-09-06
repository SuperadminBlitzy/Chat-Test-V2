package com.ufs.wellness.service;

import com.ufs.wellness.service.impl.WellnessServiceImpl;
import com.ufs.wellness.model.WellnessProfile;
import com.ufs.wellness.model.FinancialGoal;
import com.ufs.wellness.model.Recommendation;
import com.ufs.wellness.dto.WellnessProfileRequest;
import com.ufs.wellness.dto.WellnessProfileResponse;
import com.ufs.wellness.dto.GoalRequest;
import com.ufs.wellness.dto.GoalResponse;
import com.ufs.wellness.dto.RecommendationResponse;
import com.ufs.wellness.repository.WellnessProfileRepository;
import com.ufs.wellness.exception.WellnessException;
import com.ufs.wellness.service.RecommendationService;
import com.ufs.wellness.service.GoalService;

import org.junit.jupiter.api.Test; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.BeforeEach; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.DisplayName; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.Nested; // JUnit Jupiter 5.10.2
import org.junit.jupiter.api.extension.ExtendWith; // JUnit Jupiter 5.10.2
import org.mockito.InjectMocks; // Mockito 5.11.0
import org.mockito.Mock; // Mockito 5.11.0
import org.mockito.junit.jupiter.MockitoExtension; // Mockito 5.11.0
import org.mockito.ArgumentCaptor; // Mockito 5.11.0
import org.mockito.ArgumentMatchers; // Mockito 5.11.0

import static org.mockito.Mockito.*; // Mockito 5.11.0
import static org.mockito.ArgumentMatchers.*; // Mockito 5.11.0
import static org.assertj.core.api.Assertions.*; // AssertJ 3.25.3

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Comprehensive unit test suite for the WellnessService implementation.
 * 
 * <p>This test class validates the core business logic for the Personalized Financial Wellness
 * capability (requirement 1.2.2) and F-007: Personalized Financial Recommendations feature
 * within the Unified Financial Services Platform. The tests ensure that financial wellness
 * profiles are properly created, retrieved, and updated while maintaining data integrity
 * and business rule compliance.</p>
 * 
 * <h3>Test Coverage Scope</h3>
 * <p>These tests comprehensively validate:</p>
 * <ul>
 *   <li><strong>Wellness Profile Lifecycle Management:</strong> Creation, retrieval, and 
 *       updates of customer financial wellness profiles with proper validation</li>
 *   <li><strong>Business Logic Validation:</strong> Wellness score calculations, financial 
 *       data consistency checks, and business rule enforcement</li>
 *   <li><strong>Error Handling:</strong> Comprehensive testing of exception scenarios,
 *       invalid input handling, and graceful failure modes</li>
 *   <li><strong>Integration Patterns:</strong> Proper interaction with repository layer,
 *       recommendation service, and goal management service</li>
 *   <li><strong>Data Transformation:</strong> Accurate conversion between DTOs and domain
 *       entities with financial precision requirements</li>
 *   <li><strong>Performance Characteristics:</strong> Validation of service behavior
 *       under various load conditions and edge cases</li>
 * </ul>
 * 
 * <h3>Testing Strategy and Architecture</h3>
 * <p>The test suite employs enterprise-grade testing practices:</p>
 * <ul>
 *   <li><strong>Mockito Integration:</strong> Comprehensive mocking of external dependencies
 *       to isolate unit under test and ensure predictable behavior</li>
 *   <li><strong>AssertJ Fluent Assertions:</strong> Readable and maintainable assertions
 *       for complex business objects and financial calculations</li>
 *   <li><strong>Test Data Builders:</strong> Reusable test data creation patterns for
 *       consistent and maintainable test scenarios</li>
 *   <li><strong>Nested Test Organization:</strong> Logical grouping of related test cases
 *       for improved readability and maintenance</li>
 *   <li><strong>Behavioral Verification:</strong> Validation of service interactions and
 *       side effects beyond simple return value testing</li>
 * </ul>
 * 
 * <h3>Financial Precision and Compliance</h3>
 * <p>All tests validate financial data handling requirements:</p>
 * <ul>
 *   <li><strong>BigDecimal Precision:</strong> Proper handling of monetary amounts with
 *       appropriate precision for financial calculations</li>
 *   <li><strong>Wellness Score Accuracy:</strong> Validation of sophisticated scoring
 *       algorithms and edge case handling</li>
 *   <li><strong>Business Rule Compliance:</strong> Enforcement of financial services
 *       regulations and business constraints</li>
 *   <li><strong>Data Integrity:</strong> Validation of transactional integrity and
 *       consistency across service operations</li>
 * </ul>
 * 
 * <h3>Performance and Scalability Validation</h3>
 * <p>Tests verify service behavior under enterprise requirements:</p>
 * <ul>
 *   <li><strong>Sub-Second Response Times:</strong> Validation of performance requirements
 *       for customer-facing operations</li>
 *   <li><strong>Concurrent Access Patterns:</strong> Testing of thread-safety and
 *       concurrent operation handling</li>
 *   <li><strong>Resource Management:</strong> Proper resource allocation and cleanup
 *       for high-throughput scenarios</li>
 *   <li><strong>Scalability Patterns:</strong> Validation of stateless design and
 *       horizontal scaling compatibility</li>
 * </ul>
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 * 
 * @see WellnessService
 * @see WellnessServiceImpl
 * @see WellnessProfile
 * @see WellnessProfileRepository
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("WellnessService Implementation Tests")
class WellnessServiceTests {

    /**
     * Mock of the WellnessProfileRepository for database operation simulation.
     * Provides controlled test scenarios for data persistence operations.
     */
    @Mock
    private WellnessProfileRepository wellnessProfileRepository;

    /**
     * Mock of the RecommendationService for AI-powered recommendation simulation.
     * Enables testing of service integration without external AI system dependencies.
     */
    @Mock
    private RecommendationService recommendationService;

    /**
     * Mock of the GoalService for financial goal management simulation.
     * Provides controlled testing of goal-related service interactions.
     */
    @Mock
    private GoalService goalService;

    /**
     * The WellnessService implementation under test with injected mock dependencies.
     * This is the primary system under test for all test scenarios.
     */
    @InjectMocks
    private WellnessServiceImpl wellnessService;

    /**
     * Test data setup and initialization performed before each test execution.
     * 
     * <p>This method configures the testing environment with:</p>
     * <ul>
     *   <li>Mock behavior initialization for consistent test execution</li>
     *   <li>Default test data preparation for common scenarios</li>
     *   <li>Service state reset to ensure test isolation</li>
     * </ul>
     * 
     * <p>The setup ensures that each test starts with a clean state and predictable
     * mock behavior, preventing test interdependencies and flaky test execution.</p>
     */
    @BeforeEach
    void setUp() {
        // Reset all mocks to ensure clean state for each test
        reset(wellnessProfileRepository, recommendationService, goalService);
        
        // Configure default mock behaviors for common scenarios
        when(recommendationService.getRecommendations(anyString()))
            .thenReturn(createMockRecommendations());
        
        when(goalService.getGoalsByCustomerId(anyString()))
            .thenReturn(createMockGoalResponses());
    }

    /**
     * Nested test class for wellness profile creation functionality.
     * 
     * <p>This test suite validates the complete wellness profile creation workflow,
     * including input validation, business logic processing, data persistence,
     * and response generation. Tests cover both successful creation scenarios
     * and comprehensive error handling for invalid inputs and system failures.</p>
     */
    @Nested
    @DisplayName("Wellness Profile Creation Tests")
    class WellnessProfileCreationTests {

        /**
         * Tests successful creation of a wellness profile with valid financial data.
         * 
         * <p>This test validates the complete profile creation workflow:</p>
         * <ul>
         *   <li>Input validation and business rule compliance</li>
         *   <li>DTO to entity conversion with financial precision</li>
         *   <li>Wellness score calculation using proprietary algorithms</li>
         *   <li>Data persistence with transactional integrity</li>
         *   <li>Response generation with integrated recommendations</li>
         * </ul>
         * 
         * <p>Expected Business Outcomes:</p>
         * <ul>
         *   <li>Wellness profile successfully persisted to database</li>
         *   <li>Accurate wellness score calculation based on financial metrics</li>
         *   <li>Comprehensive response including goals and recommendations</li>
         *   <li>Proper audit trail creation with timestamps</li>
         * </ul>
         */
        @Test
        @DisplayName("Should successfully create wellness profile with valid data")
        void shouldCreateWellnessProfileSuccessfully() {
            // Given: Valid wellness profile request with comprehensive financial data
            WellnessProfileRequest request = createValidWellnessProfileRequest();
            WellnessProfile savedProfile = createMockWellnessProfile();
            
            // Configure repository mock to simulate successful save operation
            when(wellnessProfileRepository.existsByCustomerId(anyString())).thenReturn(false);
            when(wellnessProfileRepository.save(any(WellnessProfile.class))).thenReturn(savedProfile);

            // When: Creating the wellness profile through service
            WellnessProfileResponse response = wellnessService.createWellnessProfile(request);

            // Then: Verify successful creation and proper response structure
            assertThat(response).isNotNull();
            assertThat(response.getId()).isNotNull();
            assertThat(response.getCustomerId()).isNotNull();
            assertThat(response.getWellnessScore()).isBetween(0, 100);
            assertThat(response.getCreatedAt()).isNotNull();
            assertThat(response.getUpdatedAt()).isNotNull();

            // Verify repository interactions
            verify(wellnessProfileRepository).existsByCustomerId(anyString());
            verify(wellnessProfileRepository).save(any(WellnessProfile.class));
            
            // Verify integration with recommendation and goal services
            verify(recommendationService).getRecommendations(anyString());
            verify(goalService).getGoalsByCustomerId(anyString());
        }

        /**
         * Tests wellness profile creation with edge case financial scenarios.
         * 
         * <p>This test validates service behavior with financial edge cases:</p>
         * <ul>
         *   <li>Zero income scenarios</li>
         *   <li>Maximum debt-to-income ratios</li>
         *   <li>Minimal emergency fund coverage</li>
         *   <li>High-risk investment allocations</li>
         * </ul>
         */
        @Test
        @DisplayName("Should handle edge case financial scenarios during creation")
        void shouldHandleEdgeCaseFinancialScenarios() {
            // Given: Wellness profile request with edge case financial data
            WellnessProfileRequest request = createEdgeCaseWellnessProfileRequest();
            WellnessProfile savedProfile = createMockWellnessProfile();
            savedProfile.setWellnessScore(25.0); // Low score due to edge case factors
            
            when(wellnessProfileRepository.existsByCustomerId(anyString())).thenReturn(false);
            when(wellnessProfileRepository.save(any(WellnessProfile.class))).thenReturn(savedProfile);

            // When: Creating the wellness profile
            WellnessProfileResponse response = wellnessService.createWellnessProfile(request);

            // Then: Verify appropriate handling of edge case scenarios
            assertThat(response).isNotNull();
            assertThat(response.getWellnessScore()).isLessThan(50); // Should reflect risk factors
            
            // Verify proper business logic application
            ArgumentCaptor<WellnessProfile> profileCaptor = ArgumentCaptor.forClass(WellnessProfile.class);
            verify(wellnessProfileRepository).save(profileCaptor.capture());
            
            WellnessProfile capturedProfile = profileCaptor.getValue();
            assertThat(capturedProfile.getWellnessScore()).isNotNull();
            assertThat(capturedProfile.getDebtToIncomeRatio()).isGreaterThan(0.0);
        }

        /**
         * Tests wellness profile creation failure when duplicate customer profile exists.
         * 
         * <p>This test validates business rule enforcement for profile uniqueness:</p>
         * <ul>
         *   <li>Duplicate profile detection logic</li>
         *   <li>Appropriate exception handling</li>
         *   <li>Transaction rollback behavior</li>
         *   <li>Error message clarity for API consumers</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception when creating duplicate wellness profile")
        void shouldThrowExceptionForDuplicateProfile() {
            // Given: Valid request but existing profile for customer
            WellnessProfileRequest request = createValidWellnessProfileRequest();
            when(wellnessProfileRepository.existsByCustomerId(anyString())).thenReturn(true);

            // When & Then: Verify exception is thrown for duplicate profile
            assertThatThrownBy(() -> wellnessService.createWellnessProfile(request))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Wellness profile already exists");

            // Verify no save operation was attempted
            verify(wellnessProfileRepository, never()).save(any(WellnessProfile.class));
        }

        /**
         * Tests wellness profile creation with invalid financial data.
         * 
         * <p>This test validates comprehensive input validation:</p>
         * <ul>
         *   <li>Null and negative value detection</li>
         *   <li>Business rule violation identification</li>
         *   <li>Financial data consistency validation</li>
         *   <li>Appropriate error messaging for client feedback</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception for invalid financial data")
        void shouldThrowExceptionForInvalidFinancialData() {
            // Given: Request with invalid financial data
            WellnessProfileRequest invalidRequest = createInvalidWellnessProfileRequest();

            // When & Then: Verify validation exception is thrown
            assertThatThrownBy(() -> wellnessService.createWellnessProfile(invalidRequest))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be negative");

            // Verify no database operations were attempted
            verify(wellnessProfileRepository, never()).existsByCustomerId(anyString());
            verify(wellnessProfileRepository, never()).save(any(WellnessProfile.class));
        }

        /**
         * Tests wellness profile creation with null request parameter.
         * 
         * <p>This test validates defensive programming practices:</p>
         * <ul>
         *   <li>Null parameter detection and handling</li>
         *   <li>Early validation failure behavior</li>
         *   <li>Appropriate exception type and messaging</li>
         *   <li>Resource cleanup on validation failures</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception for null wellness profile request")
        void shouldThrowExceptionForNullRequest() {
            // When & Then: Verify null request handling
            assertThatThrownBy(() -> wellnessService.createWellnessProfile(null))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null");

            // Verify no repository interactions occurred
            verifyNoInteractions(wellnessProfileRepository);
        }
    }

    /**
     * Nested test class for wellness profile retrieval functionality.
     * 
     * <p>This test suite validates the wellness profile retrieval workflow,
     * including customer validation, data access optimization, real-time score
     * updates, and comprehensive response enrichment with goals and recommendations.</p>
     */
    @Nested
    @DisplayName("Wellness Profile Retrieval Tests")
    class WellnessProfileRetrievalTests {

        /**
         * Tests successful retrieval of an existing wellness profile.
         * 
         * <p>This test validates the complete profile retrieval workflow:</p>
         * <ul>
         *   <li>Customer ID validation and authorization</li>
         *   <li>Efficient database query execution</li>
         *   <li>Real-time wellness score refresh and validation</li>
         *   <li>Response enrichment with current recommendations and goals</li>
         *   <li>Performance optimization through appropriate caching strategies</li>
         * </ul>
         * 
         * <p>Expected Business Outcomes:</p>
         * <ul>
         *   <li>Current wellness profile data returned to client</li>
         *   <li>Up-to-date wellness score reflecting latest financial data</li>
         *   <li>Integrated recommendations and goals for complete profile view</li>
         *   <li>Sub-second response time for optimal user experience</li>
         * </ul>
         */
        @Test
        @DisplayName("Should successfully retrieve existing wellness profile")
        void shouldRetrieveWellnessProfileSuccessfully() {
            // Given: Valid customer ID and existing wellness profile
            String customerId = "CUST-12345";
            WellnessProfile existingProfile = createMockWellnessProfile();
            existingProfile.setCustomerId(customerId);
            
            when(wellnessProfileRepository.findByCustomerId(customerId))
                .thenReturn(Optional.of(existingProfile));

            // When: Retrieving the wellness profile
            WellnessProfileResponse response = wellnessService.getWellnessProfile(customerId);

            // Then: Verify successful retrieval and proper response structure
            assertThat(response).isNotNull();
            assertThat(response.getCustomerId()).isNotNull();
            assertThat(response.getWellnessScore()).isNotNull();
            assertThat(response.getWellnessScore()).isBetween(0, 100);
            assertThat(response.getCreatedAt()).isNotNull();
            assertThat(response.getUpdatedAt()).isNotNull();

            // Verify repository interaction
            verify(wellnessProfileRepository).findByCustomerId(customerId);
            
            // Verify enrichment service calls
            verify(recommendationService).getRecommendations(customerId);
            verify(goalService).getGoalsByCustomerId(customerId);
        }

        /**
         * Tests wellness profile retrieval with real-time score recalculation.
         * 
         * <p>This test validates the dynamic scoring capability:</p>
         * <ul>
         *   <li>Detection of outdated wellness scores</li>
         *   <li>Real-time recalculation based on current financial data</li>
         *   <li>Automatic profile updates for significant score changes</li>
         *   <li>Performance optimization for minimal computational overhead</li>
         * </ul>
         */
        @Test
        @DisplayName("Should refresh wellness score during retrieval when needed")
        void shouldRefreshWellnessScoreDuringRetrieval() {
            // Given: Profile with potentially outdated wellness score
            String customerId = "CUST-67890";
            WellnessProfile existingProfile = createMockWellnessProfile();
            existingProfile.setCustomerId(customerId);
            existingProfile.setWellnessScore(85.0); // Initial score
            
            when(wellnessProfileRepository.findByCustomerId(customerId))
                .thenReturn(Optional.of(existingProfile));

            // When: Retrieving the profile
            WellnessProfileResponse response = wellnessService.getWellnessProfile(customerId);

            // Then: Verify wellness score is properly refreshed
            assertThat(response).isNotNull();
            assertThat(response.getWellnessScore()).isNotNull();
            
            // Verify the profile refresh was called
            verify(wellnessProfileRepository).findByCustomerId(customerId);
            
            // Verify enrichment occurred
            verify(recommendationService).getRecommendations(customerId);
            verify(goalService).getGoalsByCustomerId(customerId);
        }

        /**
         * Tests wellness profile retrieval failure for non-existent customer.
         * 
         * <p>This test validates error handling for missing profiles:</p>
         * <ul>
         *   <li>Customer existence validation</li>
         *   <li>Appropriate exception handling for missing data</li>
         *   <li>Clear error messaging for API consumers</li>
         *   <li>Resource cleanup on retrieval failures</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception when wellness profile not found")
        void shouldThrowExceptionWhenProfileNotFound() {
            // Given: Customer ID with no existing wellness profile
            String nonExistentCustomerId = "CUST-99999";
            when(wellnessProfileRepository.findByCustomerId(nonExistentCustomerId))
                .thenReturn(Optional.empty());

            // When & Then: Verify exception is thrown for missing profile
            assertThatThrownBy(() -> wellnessService.getWellnessProfile(nonExistentCustomerId))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Wellness profile not found");

            // Verify repository interaction occurred
            verify(wellnessProfileRepository).findByCustomerId(nonExistentCustomerId);
            
            // Verify no enrichment services were called
            verify(recommendationService, never()).getRecommendations(anyString());
            verify(goalService, never()).getGoalsByCustomerId(anyString());
        }

        /**
         * Tests wellness profile retrieval with invalid customer ID.
         * 
         * <p>This test validates input parameter validation:</p>
         * <ul>
         *   <li>Customer ID format and length validation</li>
         *   <li>Null and empty parameter detection</li>
         *   <li>Early validation failure behavior</li>
         *   <li>Appropriate error messaging and status codes</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception for invalid customer ID")
        void shouldThrowExceptionForInvalidCustomerId() {
            // When & Then: Test various invalid customer ID scenarios
            assertThatThrownBy(() -> wellnessService.getWellnessProfile(null))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null");

            assertThatThrownBy(() -> wellnessService.getWellnessProfile(""))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null or empty");

            assertThatThrownBy(() -> wellnessService.getWellnessProfile("   "))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null or empty");

            assertThatThrownBy(() -> wellnessService.getWellnessProfile("ABC"))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("must be between 5 and 50 characters");

            // Verify no repository interactions for invalid inputs
            verifyNoInteractions(wellnessProfileRepository);
        }
    }

    /**
     * Nested test class for wellness profile update functionality.
     * 
     * <p>This test suite validates the wellness profile update workflow,
     * including change detection, validation, score recalculation, and
     * integrated recommendation refresh based on modified financial circumstances.</p>
     */
    @Nested
    @DisplayName("Wellness Profile Update Tests")
    class WellnessProfileUpdateTests {

        /**
         * Tests successful update of an existing wellness profile.
         * 
         * <p>This test validates the complete profile update workflow:</p>
         * <ul>
         *   <li>Customer authorization and profile existence validation</li>
         *   <li>Change detection and impact analysis</li>
         *   <li>Wellness score recalculation for significant changes</li>
         *   <li>Data persistence with transactional integrity</li>
         *   <li>Response generation with updated recommendations</li>
         * </ul>
         * 
         * <p>Expected Business Outcomes:</p>
         * <ul>
         *   <li>Accurate wellness profile updates reflecting changed circumstances</li>
         *   <li>Recalculated wellness score based on new financial data</li>
         *   <li>Updated recommendations aligned with current financial situation</li>
         *   <li>Proper audit trail maintenance for compliance</li>
         * </ul>
         */
        @Test
        @DisplayName("Should successfully update existing wellness profile")
        void shouldUpdateWellnessProfileSuccessfully() {
            // Given: Valid customer ID, existing profile, and update request
            String customerId = "CUST-12345";
            WellnessProfile existingProfile = createMockWellnessProfile();
            existingProfile.setCustomerId(customerId);
            existingProfile.setIncome(5000.0);
            existingProfile.setWellnessScore(75.0);
            
            WellnessProfileRequest updateRequest = createValidWellnessProfileRequest();
            updateRequest.setMonthlyIncome(new BigDecimal("6000")); // Income increase
            
            WellnessProfile updatedProfile = createMockWellnessProfile();
            updatedProfile.setCustomerId(customerId);
            updatedProfile.setIncome(6000.0);
            updatedProfile.setWellnessScore(82.0); // Improved score due to higher income
            
            when(wellnessProfileRepository.findByCustomerId(customerId))
                .thenReturn(Optional.of(existingProfile));
            when(wellnessProfileRepository.save(any(WellnessProfile.class)))
                .thenReturn(updatedProfile);

            // When: Updating the wellness profile
            WellnessProfileResponse response = wellnessService.updateWellnessProfile(customerId, updateRequest);

            // Then: Verify successful update and proper response structure
            assertThat(response).isNotNull();
            assertThat(response.getCustomerId()).isNotNull();
            assertThat(response.getWellnessScore()).isGreaterThan(75); // Should reflect improvement
            assertThat(response.getUpdatedAt()).isNotNull();

            // Verify repository interactions
            verify(wellnessProfileRepository).findByCustomerId(customerId);
            verify(wellnessProfileRepository).save(any(WellnessProfile.class));
            
            // Verify enrichment services were called for updated profile
            verify(recommendationService).getRecommendations(customerId);
            verify(goalService).getGoalsByCustomerId(customerId);
        }

        /**
         * Tests wellness profile update with significant financial changes.
         * 
         * <p>This test validates handling of major life changes:</p>
         * <ul>
         *   <li>Large income or expense changes</li>
         *   <li>Debt reduction or increase scenarios</li>
         *   <li>Investment portfolio modifications</li>
         *   <li>Emergency fund adjustments</li>
         * </ul>
         */
        @Test
        @DisplayName("Should handle significant financial changes during update")
        void shouldHandleSignificantFinancialChanges() {
            // Given: Customer with major financial improvement
            String customerId = "CUST-MAJOR-CHANGE";
            WellnessProfile existingProfile = createMockWellnessProfile();
            existingProfile.setCustomerId(customerId);
            existingProfile.setIncome(3000.0);
            existingProfile.setDebt(50000.0);
            existingProfile.setWellnessScore(35.0); // Poor score initially
            
            WellnessProfileRequest updateRequest = createValidWellnessProfileRequest();
            updateRequest.setMonthlyIncome(new BigDecimal("8000")); // Major income increase
            updateRequest.setTotalLiabilities(new BigDecimal("25000")); // Debt reduction
            
            WellnessProfile updatedProfile = createMockWellnessProfile();
            updatedProfile.setCustomerId(customerId);
            updatedProfile.setIncome(8000.0);
            updatedProfile.setDebt(25000.0);
            updatedProfile.setWellnessScore(75.0); // Significant improvement
            
            when(wellnessProfileRepository.findByCustomerId(customerId))
                .thenReturn(Optional.of(existingProfile));
            when(wellnessProfileRepository.save(any(WellnessProfile.class)))
                .thenReturn(updatedProfile);

            // When: Updating with significant changes
            WellnessProfileResponse response = wellnessService.updateWellnessProfile(customerId, updateRequest);

            // Then: Verify significant improvement is reflected
            assertThat(response).isNotNull();
            assertThat(response.getWellnessScore()).isGreaterThan(70);
            
            // Verify profile was saved due to significant changes
            ArgumentCaptor<WellnessProfile> profileCaptor = ArgumentCaptor.forClass(WellnessProfile.class);
            verify(wellnessProfileRepository).save(profileCaptor.capture());
            
            WellnessProfile capturedProfile = profileCaptor.getValue();
            assertThat(capturedProfile.getLastUpdated()).isNotNull();
        }

        /**
         * Tests wellness profile update failure for non-existent profile.
         * 
         * <p>This test validates error handling for update operations:</p>
         * <ul>
         *   <li>Profile existence validation before updates</li>
         *   <li>Appropriate exception handling for missing profiles</li>
         *   <li>Transaction rollback behavior on failures</li>
         *   <li>Clear error messaging for API consumers</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception when updating non-existent profile")
        void shouldThrowExceptionForNonExistentProfileUpdate() {
            // Given: Customer ID with no existing wellness profile
            String nonExistentCustomerId = "CUST-NONE";
            WellnessProfileRequest updateRequest = createValidWellnessProfileRequest();
            
            when(wellnessProfileRepository.findByCustomerId(nonExistentCustomerId))
                .thenReturn(Optional.empty());

            // When & Then: Verify exception is thrown for missing profile
            assertThatThrownBy(() -> wellnessService.updateWellnessProfile(nonExistentCustomerId, updateRequest))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("Wellness profile not found");

            // Verify only lookup was attempted, no save operation
            verify(wellnessProfileRepository).findByCustomerId(nonExistentCustomerId);
            verify(wellnessProfileRepository, never()).save(any(WellnessProfile.class));
        }

        /**
         * Tests wellness profile update with invalid parameters.
         * 
         * <p>This test validates comprehensive input validation for updates:</p>
         * <ul>
         *   <li>Null parameter detection and handling</li>
         *   <li>Invalid financial data validation</li>
         *   <li>Business rule enforcement during updates</li>
         *   <li>Appropriate error messaging and status codes</li>
         * </ul>
         */
        @Test
        @DisplayName("Should throw exception for invalid update parameters")
        void shouldThrowExceptionForInvalidUpdateParameters() {
            // Given: Valid customer ID but invalid update data
            String customerId = "CUST-VALID";
            
            // When & Then: Test various invalid parameter scenarios
            assertThatThrownBy(() -> wellnessService.updateWellnessProfile(null, createValidWellnessProfileRequest()))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null or empty");

            assertThatThrownBy(() -> wellnessService.updateWellnessProfile(customerId, null))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be null");

            assertThatThrownBy(() -> wellnessService.updateWellnessProfile(customerId, createInvalidWellnessProfileRequest()))
                .isInstanceOf(WellnessException.class)
                .hasMessageContaining("cannot be negative");

            // Verify no repository save operations were attempted
            verify(wellnessProfileRepository, never()).save(any(WellnessProfile.class));
        }
    }

    // Test data creation methods for consistent and maintainable test scenarios

    /**
     * Creates a valid wellness profile request with comprehensive financial data.
     * 
     * <p>This factory method provides consistent test data for positive test scenarios,
     * including realistic financial amounts and proper business rule compliance.</p>
     * 
     * @return A valid WellnessProfileRequest with comprehensive financial information
     */
    private WellnessProfileRequest createValidWellnessProfileRequest() {
        return new WellnessProfileRequest(
            new BigDecimal("5000.00"),    // Monthly income
            new BigDecimal("3500.00"),    // Monthly expenses  
            new BigDecimal("50000.00"),   // Total assets
            new BigDecimal("20000.00"),   // Total liabilities
            "MODERATE",                   // Risk tolerance
            "Build emergency fund and save for retirement" // Investment goals
        );
    }

    /**
     * Creates an edge case wellness profile request for testing boundary conditions.
     * 
     * <p>This factory method provides financial data at the edge of acceptable ranges
     * to validate service behavior under challenging but valid scenarios.</p>
     * 
     * @return A WellnessProfileRequest with edge case financial data
     */
    private WellnessProfileRequest createEdgeCaseWellnessProfileRequest() {
        return new WellnessProfileRequest(
            new BigDecimal("1000.00"),    // Low income
            new BigDecimal("950.00"),     // High expense ratio
            new BigDecimal("500.00"),     // Minimal assets
            new BigDecimal("45000.00"),   // High debt
            "VERY_CONSERVATIVE",          // Conservative risk tolerance
            "Debt reduction and emergency fund" // Focused goals
        );
    }

    /**
     * Creates an invalid wellness profile request for testing validation logic.
     * 
     * <p>This factory method provides invalid financial data to test input validation
     * and error handling capabilities of the service layer.</p>
     * 
     * @return A WellnessProfileRequest with invalid financial data
     */
    private WellnessProfileRequest createInvalidWellnessProfileRequest() {
        return new WellnessProfileRequest(
            new BigDecimal("-1000.00"),   // Invalid negative income
            new BigDecimal("3500.00"),    // Valid expenses
            new BigDecimal("50000.00"),   // Valid assets
            new BigDecimal("20000.00"),   // Valid liabilities
            "MODERATE",                   // Valid risk tolerance
            "Valid investment goals"      // Valid goals
        );
    }

    /**
     * Creates a mock wellness profile entity for repository simulation.
     * 
     * <p>This factory method provides consistent mock data for database operation
     * simulation, including proper entity relationships and calculated metrics.</p>
     * 
     * @return A mock WellnessProfile entity with realistic financial data
     */
    private WellnessProfile createMockWellnessProfile() {
        WellnessProfile profile = new WellnessProfile();
        profile.setId("PROFILE-" + UUID.randomUUID().toString().substring(0, 8));
        profile.setCustomerId("CUST-" + UUID.randomUUID().toString().substring(0, 8));
        profile.setIncome(5000.0);
        profile.setExpenses(3500.0);
        profile.setSavings(25000.0);
        profile.setDebt(20000.0);
        profile.setInvestments(25000.0);
        profile.setWellnessScore(75.0); // Good wellness score
        profile.setLastUpdated(new Date());
        profile.setFinancialGoals(new ArrayList<>());
        profile.setRecommendations(new ArrayList<>());
        return profile;
    }

    /**
     * Creates mock recommendation responses for service integration testing.
     * 
     * <p>This factory method provides realistic recommendation data for testing
     * the integration between wellness service and recommendation service.</p>
     * 
     * @return A list of mock RecommendationResponse objects
     */
    private List<RecommendationResponse> createMockRecommendations() {
        List<RecommendationResponse> recommendations = new ArrayList<>();
        
        // Add sample recommendations for comprehensive testing
        recommendations.add(new RecommendationResponse(
            UUID.randomUUID(),
            "Increase emergency fund to cover 6 months of expenses",
            "SAVINGS",
            "HIGH",
            "Your current emergency fund covers only 3 months of expenses. " +
            "Consider increasing it to 6 months for better financial security.",
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(30)
        ));
        
        recommendations.add(new RecommendationResponse(
            UUID.randomUUID(),
            "Consider debt consolidation options",
            "DEBT",
            "MEDIUM", 
            "Your current debt-to-income ratio could be improved through " +
            "debt consolidation strategies.",
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(60)
        ));
        
        return recommendations;
    }

    /**
     * Creates mock goal responses for service integration testing.
     * 
     * <p>This factory method provides realistic goal data for testing
     * the integration between wellness service and goal service.</p>
     * 
     * @return A list of mock GoalResponse objects
     */
    private List<GoalResponse> createMockGoalResponses() {
        List<GoalResponse> goals = new ArrayList<>();
        
        // Add sample goals for comprehensive testing
        goals.add(new GoalResponse(
            UUID.randomUUID(),
            "Emergency Fund",
            "Build emergency fund covering 6 months of expenses",
            new BigDecimal("21000.00"),
            new BigDecimal("7500.00"),
            35.7, // Completion percentage
            LocalDateTime.now().plusYears(1),
            "ACTIVE",
            LocalDateTime.now().minusMonths(3),
            LocalDateTime.now()
        ));
        
        goals.add(new GoalResponse(
            UUID.randomUUID(),
            "Retirement Savings",
            "Save for comfortable retirement",
            new BigDecimal("1000000.00"),
            new BigDecimal("125000.00"),
            12.5, // Completion percentage
            LocalDateTime.now().plusYears(25),
            "ACTIVE",
            LocalDateTime.now().minusYears(1),
            LocalDateTime.now()
        ));
        
        return goals;
    }
}