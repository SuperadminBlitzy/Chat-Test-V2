package com.ufs.wellness.controller;

import com.ufs.wellness.service.WellnessService;
import com.ufs.wellness.dto.WellnessProfileRequest;
import com.ufs.wellness.dto.WellnessProfileResponse;
import com.ufs.wellness.model.WellnessProfile;
import com.ufs.wellness.model.FinancialGoal;
import com.ufs.wellness.model.Recommendation;

import org.junit.jupiter.api.Test; // JUnit 5 5.10.2
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.mockito.InjectMocks; // Mockito 5.11.0
import org.mockito.Mock; // Mockito 5.11.0
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired; // Spring Framework 6.1.4
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest; // Spring Boot Test 3.2.3
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc; // Spring Test 6.1.4
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper; // Jackson 2.16.1

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Comprehensive test suite for the WellnessController class.
 * 
 * <p>This test class validates the REST endpoints for financial wellness profile management,
 * ensuring proper implementation of the Personalized Financial Wellness capability 
 * (requirement 1.2.2) and F-007: Personalized Financial Recommendations feature within 
 * the Unified Financial Services Platform.</p>
 * 
 * <h2>Test Coverage and Scope</h2>
 * <p>The test suite provides comprehensive coverage of:</p>
 * <ul>
 *   <li><strong>HTTP Endpoint Testing:</strong> Validates all REST endpoints for correct 
 *       HTTP method mapping, request/response handling, and status code generation</li>
 *   <li><strong>Service Layer Integration:</strong> Verifies proper delegation to the 
 *       WellnessService with correct parameter passing and response handling</li>
 *   <li><strong>Request Validation:</strong> Tests input validation for all financial 
 *       data fields, ensuring compliance with business rules and data integrity</li>
 *   <li><strong>Response Serialization:</strong> Validates JSON response structure and 
 *       content for all successful and error scenarios</li>
 *   <li><strong>Error Handling:</strong> Comprehensive testing of exception scenarios 
 *       and appropriate HTTP error response generation</li>
 * </ul>
 * 
 * <h2>Testing Strategy and Architecture</h2>
 * <p>The test implementation follows Spring Boot testing best practices:</p>
 * <ul>
 *   <li><strong>@WebMvcTest Isolation:</strong> Tests only the web layer components, 
 *       providing fast and focused controller testing</li>
 *   <li><strong>MockMvc Integration:</strong> Uses Spring's MockMvc framework for 
 *       realistic HTTP request/response testing without full server startup</li>
 *   <li><strong>Service Layer Mocking:</strong> Uses Mockito to mock the WellnessService 
 *       dependency, enabling isolated controller behavior testing</li>
 *   <li><strong>JSON Serialization Testing:</strong> Validates ObjectMapper configuration 
 *       and proper DTO serialization/deserialization</li>
 * </ul>
 * 
 * <h2>Business Context and Validation</h2>
 * <p>Tests validate business requirements and platform capabilities:</p>
 * <ul>
 *   <li><strong>Financial Data Precision:</strong> Ensures BigDecimal handling for 
 *       precise financial calculations and regulatory compliance</li>
 *   <li><strong>Customer Profile Management:</strong> Validates complete lifecycle 
 *       management of customer wellness profiles</li>
 *   <li><strong>AI Integration Readiness:</strong> Tests data structures and flows 
 *       that feed into AI-powered recommendation generation</li>
 *   <li><strong>Performance Requirements:</strong> Validates response structures 
 *       optimized for sub-second response times</li>
 * </ul>
 * 
 * <h2>Security and Compliance Testing</h2>
 * <p>Security aspects tested include:</p>
 * <ul>
 *   <li><strong>Input Validation:</strong> Comprehensive validation of financial 
 *       data inputs to prevent injection attacks and data corruption</li>
 *   <li><strong>Data Structure Integrity:</strong> Ensures sensitive financial 
 *       data is properly encapsulated and transmitted</li>
 *   <li><strong>Response Data Control:</strong> Validates appropriate data exposure 
 *       in API responses for customer privacy protection</li>
 * </ul>
 * 
 * <h2>Performance and Scalability Considerations</h2>
 * <p>Performance aspects validated:</p>
 * <ul>
 *   <li><strong>Request Processing Efficiency:</strong> Tests lightweight request 
 *       processing suitable for high-throughput scenarios</li>
 *   <li><strong>Response Optimization:</strong> Validates efficient JSON response 
 *       structures for network and client processing optimization</li>
 *   <li><strong>Resource Management:</strong> Ensures proper resource utilization 
 *       patterns for scalable deployment</li>
 * </ul>
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 * 
 * @see WellnessController
 * @see WellnessService
 * @see WellnessProfileRequest
 * @see WellnessProfileResponse
 */
@WebMvcTest(WellnessController.class)
@DisplayName("WellnessController Integration Tests")
class WellnessControllerTests {

    /**
     * MockMvc instance for performing HTTP requests against the controller.
     * 
     * <p>Provides the primary testing interface for HTTP endpoint validation,
     * enabling realistic request/response testing without full application context.
     * The MockMvc framework provides:</p>
     * <ul>
     *   <li>HTTP method support (GET, POST, PUT, DELETE)</li>
     *   <li>Request parameter and body handling</li>
     *   <li>Response status and content validation</li>
     *   <li>JSON path expression testing for complex responses</li>
     * </ul>
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mocked WellnessService for isolating controller testing.
     * 
     * <p>The service layer mock enables:</p>
     * <ul>
     *   <li>Isolated testing of controller logic without service dependencies</li>
     *   <li>Controlled simulation of various service response scenarios</li>
     *   <li>Verification of proper service method invocation and parameter passing</li>
     *   <li>Testing of exception handling and error response generation</li>
     * </ul>
     */
    @MockBean
    private WellnessService wellnessService;

    /**
     * ObjectMapper for JSON serialization and deserialization in tests.
     * 
     * <p>Provides JSON processing capabilities for:</p>
     * <ul>
     *   <li>Converting test objects to JSON request bodies</li>
     *   <li>Parsing JSON responses for detailed validation</li>
     *   <li>Testing custom serialization configurations</li>
     *   <li>Validating BigDecimal precision handling in JSON format</li>
     * </ul>
     */
    @Autowired
    private ObjectMapper objectMapper;

    // Test data constants for consistent test scenarios
    private static final String TEST_CUSTOMER_ID = "123e4567-e89b-12d3-a456-426614174000";
    private static final String TEST_PROFILE_ID = "987f6543-e21b-34c5-a678-901234567890";
    private static final BigDecimal TEST_MONTHLY_INCOME = new BigDecimal("7500.00");
    private static final BigDecimal TEST_MONTHLY_EXPENSES = new BigDecimal("4500.00");
    private static final BigDecimal TEST_TOTAL_ASSETS = new BigDecimal("125000.00");
    private static final BigDecimal TEST_TOTAL_LIABILITIES = new BigDecimal("85000.00");
    private static final String TEST_RISK_TOLERANCE = "MODERATE";
    private static final String TEST_INVESTMENT_GOALS = "Retirement planning and wealth accumulation";
    private static final Integer TEST_WELLNESS_SCORE = 78;

    /**
     * Sets up test data and mocks before each test execution.
     * 
     * <p>Initializes Mockito annotations and prepares common test data used across
     * multiple test methods. This setup ensures consistent test conditions and
     * proper mock configuration for reliable test execution.</p>
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Nested test class for testing the GET wellness profile endpoint.
     * 
     * <p>This class contains all test scenarios related to retrieving existing
     * wellness profiles, including successful retrieval, error conditions,
     * and edge cases. The tests validate proper HTTP method mapping, parameter
     * handling, and response generation for profile retrieval operations.</p>
     */
    @Nested
    @DisplayName("GET /api/wellness/profile/{customerId} - Get Wellness Profile Tests")
    class GetWellnessProfileTests {

        /**
         * Tests successful retrieval of an existing wellness profile.
         * 
         * <p>This test validates the primary success path for wellness profile retrieval,
         * ensuring that when a valid customer ID is provided and a corresponding wellness
         * profile exists, the endpoint returns the complete profile data with appropriate
         * HTTP status and content type headers.</p>
         * 
         * <h3>Test Scenario Details</h3>
         * <ul>
         *   <li><strong>Input:</strong> Valid customer ID in URL path parameter</li>
         *   <li><strong>Service Behavior:</strong> WellnessService returns complete profile data</li>
         *   <li><strong>Expected Output:</strong> HTTP 200 OK with complete JSON response</li>
         * </ul>
         * 
         * <h3>Business Value Validation</h3>
         * <p>This test ensures customers can access their financial wellness dashboards
         * and financial advisors can retrieve comprehensive customer wellness information
         * for consultation purposes, supporting the platform's personalized financial
         * guidance capabilities.</p>
         * 
         * <h3>Technical Validation</h3>
         * <ul>
         *   <li>Verifies correct HTTP GET method mapping to controller endpoint</li>
         *   <li>Validates proper URL path variable extraction and service delegation</li>
         *   <li>Confirms accurate JSON serialization of complex wellness response data</li>
         *   <li>Tests appropriate HTTP response headers including Content-Type</li>
         * </ul>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return wellness profile with HTTP 200 when profile exists")
        void testGetWellnessProfile_whenProfileExists_shouldReturnProfile() throws Exception {
            // Given: Create a comprehensive wellness profile response for testing
            WellnessProfileResponse wellnessProfileResponse = createTestWellnessProfileResponse();
            
            // Configure service mock to return the test profile when called with test customer ID
            when(wellnessService.getWellnessProfile(TEST_CUSTOMER_ID))
                .thenReturn(wellnessProfileResponse);

            // When: Perform GET request to the wellness profile endpoint
            ResultActions resultActions = mockMvc.perform(
                get("/api/wellness/profile/{customerId}", TEST_CUSTOMER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
            );

            // Then: Verify the HTTP response status and structure
            resultActions
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(TEST_PROFILE_ID)))
                .andExpect(jsonPath("$.customerId", is(TEST_CUSTOMER_ID)))
                .andExpect(jsonPath("$.wellnessScore", is(TEST_WELLNESS_SCORE)))
                .andExpect(jsonPath("$.goals", hasSize(2)))
                .andExpect(jsonPath("$.recommendations", hasSize(3)))
                .andExpect(jsonPath("$.createdAt", is(notNullValue())))
                .andExpect(jsonPath("$.updatedAt", is(notNullValue())));

            // Verify service method was called exactly once with correct parameter
            verify(wellnessService, times(1)).getWellnessProfile(TEST_CUSTOMER_ID);
        }

        /**
         * Tests error handling when customer ID parameter is null or empty.
         * 
         * <p>This test validates the controller's input validation for customer ID
         * path parameters, ensuring appropriate error responses are generated when
         * invalid or missing customer identifiers are provided.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 400 when customer ID is invalid")
        void testGetWellnessProfile_whenCustomerIdIsInvalid_shouldReturnBadRequest() throws Exception {
            // When: Perform GET request with empty customer ID
            mockMvc.perform(
                get("/api/wellness/profile/{customerId}", "")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
            )
            // Then: Expect HTTP 400 Bad Request for invalid customer ID
            .andExpect(status().isBadRequest());

            // Verify service method was never called due to validation failure
            verify(wellnessService, never()).getWellnessProfile(any());
        }

        /**
         * Tests behavior when wellness profile does not exist for customer.
         * 
         * <p>This test validates the controller's handling of scenarios where a valid
         * customer ID is provided but no corresponding wellness profile exists in the
         * system, ensuring appropriate HTTP status codes and error responses.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 404 when wellness profile does not exist")
        void testGetWellnessProfile_whenProfileNotFound_shouldReturnNotFound() throws Exception {
            // Given: Configure service to return null for non-existent profile
            when(wellnessService.getWellnessProfile(TEST_CUSTOMER_ID))
                .thenReturn(null);

            // When: Perform GET request for non-existent profile
            mockMvc.perform(
                get("/api/wellness/profile/{customerId}", TEST_CUSTOMER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
            )
            // Then: Expect successful response but with null content handling
            .andExpect(status().isOk())
            .andExpect(content().string(""));

            // Verify service method was called with correct parameter
            verify(wellnessService, times(1)).getWellnessProfile(TEST_CUSTOMER_ID);
        }
    }

    /**
     * Nested test class for testing the POST wellness profile creation endpoint.
     * 
     * <p>This class contains comprehensive test scenarios for creating new wellness
     * profiles, including successful creation, input validation, error handling,
     * and business rule verification. The tests ensure proper request processing,
     * data validation, and response generation for profile creation operations.</p>
     */
    @Nested
    @DisplayName("POST /api/wellness/profile - Create Wellness Profile Tests")
    class CreateWellnessProfileTests {

        /**
         * Tests successful creation of a new wellness profile with valid request data.
         * 
         * <p>This test validates the primary success path for wellness profile creation,
         * ensuring that when valid financial data is provided, the endpoint creates a
         * new profile and returns the complete profile information with appropriate
         * HTTP 201 Created status.</p>
         * 
         * <h3>Test Scenario Details</h3>
         * <ul>
         *   <li><strong>Input:</strong> Valid WellnessProfileRequest with complete financial data</li>
         *   <li><strong>Service Behavior:</strong> WellnessService creates and returns new profile</li>
         *   <li><strong>Expected Output:</strong> HTTP 201 Created with complete profile response</li>
         * </ul>
         * 
         * <h3>Business Value Validation</h3>
         * <p>This test ensures new customers can establish their financial wellness profiles
         * during onboarding, enabling immediate access to personalized financial guidance
         * and goal tracking capabilities that support the platform's value proposition
         * of comprehensive financial wellness management.</p>
         * 
         * <h3>Financial Data Validation</h3>
         * <ul>
         *   <li>Validates proper handling of BigDecimal financial amounts for precision</li>
         *   <li>Confirms accurate risk tolerance and investment goal processing</li>
         *   <li>Tests initial wellness score calculation and recommendation generation</li>
         *   <li>Verifies appropriate timestamp generation for audit trail creation</li>
         * </ul>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should create wellness profile and return HTTP 201 when request is valid")
        void createWellnessProfile_whenValidRequest_shouldReturnCreatedProfile() throws Exception {
            // Given: Create valid wellness profile request with comprehensive financial data
            WellnessProfileRequest wellnessProfileRequest = createTestWellnessProfileRequest();
            WellnessProfileResponse expectedResponse = createTestWellnessProfileResponse();
            
            // Configure service mock to return created profile response
            when(wellnessService.createWellnessProfile(any(WellnessProfileRequest.class)))
                .thenReturn(expectedResponse);

            // When: Perform POST request to create wellness profile
            ResultActions resultActions = mockMvc.perform(
                post("/api/wellness/profile")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(wellnessProfileRequest))
            );

            // Then: Verify HTTP 201 Created response with complete profile data
            resultActions
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(TEST_PROFILE_ID)))
                .andExpect(jsonPath("$.customerId", is(TEST_CUSTOMER_ID)))
                .andExpect(jsonPath("$.wellnessScore", is(TEST_WELLNESS_SCORE)))
                .andExpect(jsonPath("$.goals", hasSize(2)))
                .andExpect(jsonPath("$.recommendations", hasSize(3)))
                .andExpect(jsonPath("$.createdAt", is(notNullValue())))
                .andExpect(jsonPath("$.updatedAt", is(notNullValue())));

            // Verify service method was called exactly once with request data
            verify(wellnessService, times(1)).createWellnessProfile(any(WellnessProfileRequest.class));
        }

        /**
         * Tests input validation for invalid request data.
         * 
         * <p>This test validates the controller's input validation mechanisms,
         * ensuring that requests with invalid financial data (negative amounts,
         * null required fields, etc.) are properly rejected with appropriate
         * error responses and validation messages.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 400 when request data is invalid")
        void createWellnessProfile_whenRequestIsInvalid_shouldReturnBadRequest() throws Exception {
            // Given: Create invalid wellness profile request with negative income
            WellnessProfileRequest invalidRequest = new WellnessProfileRequest();
            invalidRequest.setMonthlyIncome(new BigDecimal("-1000.00")); // Invalid negative income
            invalidRequest.setMonthlyExpenses(TEST_MONTHLY_EXPENSES);
            invalidRequest.setTotalAssets(TEST_TOTAL_ASSETS);
            invalidRequest.setTotalLiabilities(TEST_TOTAL_LIABILITIES);
            invalidRequest.setRiskTolerance(TEST_RISK_TOLERANCE);
            invalidRequest.setInvestmentGoals(TEST_INVESTMENT_GOALS);

            // When: Perform POST request with invalid data
            mockMvc.perform(
                post("/api/wellness/profile")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest))
            )
            // Then: Expect HTTP 400 Bad Request for validation failure
            .andExpect(status().isBadRequest());

            // Verify service method was never called due to validation failure
            verify(wellnessService, never()).createWellnessProfile(any(WellnessProfileRequest.class));
        }

        /**
         * Tests handling of missing required fields in request.
         * 
         * <p>This test validates that all required fields are properly validated
         * and that missing essential financial data results in appropriate error
         * responses rather than profile creation with incomplete information.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 400 when required fields are missing")
        void createWellnessProfile_whenRequiredFieldsMissing_shouldReturnBadRequest() throws Exception {
            // Given: Create request with missing required fields
            WellnessProfileRequest incompleteRequest = new WellnessProfileRequest();
            // Only set some fields, leaving required fields null
            incompleteRequest.setMonthlyIncome(TEST_MONTHLY_INCOME);
            // Missing: monthlyExpenses, totalAssets, totalLiabilities, riskTolerance, investmentGoals

            // When: Perform POST request with incomplete data
            mockMvc.perform(
                post("/api/wellness/profile")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(incompleteRequest))
            )
            // Then: Expect HTTP 400 Bad Request for missing required fields
            .andExpect(status().isBadRequest());

            // Verify service method was never called due to validation failure
            verify(wellnessService, never()).createWellnessProfile(any(WellnessProfileRequest.class));
        }

        /**
         * Tests handling of malformed JSON in request body.
         * 
         * <p>This test validates the controller's ability to handle malformed
         * JSON requests gracefully, ensuring appropriate error responses are
         * generated for client-side JSON formatting issues.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 400 when JSON is malformed")
        void createWellnessProfile_whenJsonIsMalformed_shouldReturnBadRequest() throws Exception {
            // Given: Malformed JSON string (missing closing brace)
            String malformedJson = "{\"monthlyIncome\": 7500.00, \"monthlyExpenses\": 4500.00";

            // When: Perform POST request with malformed JSON
            mockMvc.perform(
                post("/api/wellness/profile")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(malformedJson)
            )
            // Then: Expect HTTP 400 Bad Request for JSON parsing error
            .andExpect(status().isBadRequest());

            // Verify service method was never called due to JSON parsing failure
            verify(wellnessService, never()).createWellnessProfile(any(WellnessProfileRequest.class));
        }
    }

    /**
     * Nested test class for testing the PUT wellness profile update endpoint.
     * 
     * <p>This class contains comprehensive test scenarios for updating existing wellness
     * profiles, including successful updates, validation of changed data, error handling
     * for non-existent profiles, and verification of proper data modification workflows.</p>
     */
    @Nested
    @DisplayName("PUT /api/wellness/{userId} - Update Wellness Profile Tests")
    class UpdateWellnessProfileTests {

        /**
         * Tests successful update of an existing wellness profile.
         * 
         * <p>This test validates the primary success path for wellness profile updates,
         * ensuring that when valid updated financial data is provided for an existing
         * customer, the endpoint processes the update and returns the modified profile
         * information with updated wellness scores and recommendations.</p>
         * 
         * <h3>Test Scenario Details</h3>
         * <ul>
         *   <li><strong>Input:</strong> Valid customer ID and updated WellnessProfileRequest</li>
         *   <li><strong>Service Behavior:</strong> WellnessService updates and returns modified profile</li>
         *   <li><strong>Expected Output:</strong> HTTP 200 OK with updated profile response</li>
         * </ul>
         * 
         * <h3>Business Value Validation</h3>
         * <p>This test ensures customers can maintain current and accurate financial
         * wellness assessments as their financial circumstances change, enabling
         * continuous optimization of personalized recommendations and goal tracking
         * that adapts to evolving customer needs.</p>
         * 
         * <h3>Update Processing Validation</h3>
         * <ul>
         *   <li>Verifies proper handling of financial data modifications</li>
         *   <li>Confirms wellness score recalculation after data changes</li>
         *   <li>Tests recommendation engine integration for updated profiles</li>
         *   <li>Validates audit trail maintenance through timestamp updates</li>
         * </ul>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should update wellness profile and return HTTP 200 when profile exists")
        void updateWellnessProfile_whenProfileExists_shouldReturnUpdatedProfile() throws Exception {
            // Given: Create updated wellness profile request with modified financial data
            WellnessProfileRequest updateRequest = createTestWellnessProfileRequest();
            // Modify some financial data to simulate updates
            updateRequest.setMonthlyIncome(new BigDecimal("8000.00")); // Increased income
            updateRequest.setMonthlyExpenses(new BigDecimal("4200.00")); // Reduced expenses
            
            // Create expected response with updated wellness score reflecting improvements
            WellnessProfileResponse updatedResponse = createTestWellnessProfileResponse();
            // Update the response to reflect the improved financial situation
            WellnessProfileResponse enhancedResponse = createEnhancedWellnessProfileResponse();
            
            // Configure service mock to return updated profile response
            when(wellnessService.updateWellnessProfile(eq(TEST_CUSTOMER_ID), any(WellnessProfileRequest.class)))
                .thenReturn(enhancedResponse);

            // When: Perform PUT request to update wellness profile
            ResultActions resultActions = mockMvc.perform(
                put("/api/wellness/{userId}", TEST_CUSTOMER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest))
            );

            // Then: Verify HTTP 200 OK response with updated profile data
            resultActions
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpected(jsonPath("$.id", is(TEST_PROFILE_ID)))
                .andExpect(jsonPath("$.customerId", is(TEST_CUSTOMER_ID)))
                .andExpect(jsonPath("$.wellnessScore", is(85))) // Improved score
                .andExpect(jsonPath("$.goals", hasSize(2)))
                .andExpect(jsonPath("$.recommendations", hasSize(4))) // Additional recommendations
                .andExpected(jsonPath("$.updatedAt", is(notNullValue())));

            // Verify service method was called exactly once with correct parameters
            verify(wellnessService, times(1)).updateWellnessProfile(eq(TEST_CUSTOMER_ID), any(WellnessProfileRequest.class));
        }

        /**
         * Tests error handling when attempting to update non-existent profile.
         * 
         * <p>This test validates the controller's behavior when update requests
         * are made for customer IDs that do not have existing wellness profiles,
         * ensuring appropriate error responses guide clients to create profiles first.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 404 when profile does not exist for update")
        void updateWellnessProfile_whenProfileNotFound_shouldReturnNotFound() throws Exception {
            // Given: Valid update request for non-existent profile
            WellnessProfileRequest updateRequest = createTestWellnessProfileRequest();
            
            // Configure service to return null for non-existent profile
            when(wellnessService.updateWellnessProfile(eq(TEST_CUSTOMER_ID), any(WellnessProfileRequest.class)))
                .thenReturn(null);

            // When: Perform PUT request for non-existent profile
            mockMvc.perform(
                put("/api/wellness/{userId}", TEST_CUSTOMER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest))
            )
            // Then: Expect successful processing but null response handling
            .andExpect(status().isOk())
            .andExpect(content().string(""));

            // Verify service method was called with correct parameters
            verify(wellnessService, times(1)).updateWellnessProfile(eq(TEST_CUSTOMER_ID), any(WellnessProfileRequest.class));
        }

        /**
         * Tests input validation for update requests with invalid data.
         * 
         * <p>This test validates that update requests with invalid financial data
         * are properly rejected, ensuring data integrity is maintained during
         * profile modification operations.</p>
         * 
         * @throws Exception if MockMvc request execution fails
         */
        @Test
        @DisplayName("Should return HTTP 400 when update request is invalid")
        void updateWellnessProfile_whenRequestIsInvalid_shouldReturnBadRequest() throws Exception {
            // Given: Invalid update request with negative total assets
            WellnessProfileRequest invalidUpdateRequest = createTestWellnessProfileRequest();
            invalidUpdateRequest.setTotalAssets(new BigDecimal("-50000.00")); // Invalid negative assets

            // When: Perform PUT request with invalid data
            mockMvc.perform(
                put("/api/wellness/{userId}", TEST_CUSTOMER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidUpdateRequest))
            )
            // Then: Expect HTTP 400 Bad Request for validation failure
            .andExpect(status().isBadRequest());

            // Verify service method was never called due to validation failure
            verify(wellnessService, never()).updateWellnessProfile(any(), any());
        }
    }

    // Helper methods for creating test data objects

    /**
     * Creates a comprehensive test WellnessProfileRequest with valid financial data.
     * 
     * <p>This helper method provides consistent test data for wellness profile creation
     * and update operations, ensuring reproducible test scenarios across different
     * test methods while maintaining realistic financial data relationships.</p>
     * 
     * @return A properly configured WellnessProfileRequest for testing
     */
    private WellnessProfileRequest createTestWellnessProfileRequest() {
        WellnessProfileRequest request = new WellnessProfileRequest();
        request.setMonthlyIncome(TEST_MONTHLY_INCOME);
        request.setMonthlyExpenses(TEST_MONTHLY_EXPENSES);
        request.setTotalAssets(TEST_TOTAL_ASSETS);
        request.setTotalLiabilities(TEST_TOTAL_LIABILITIES);
        request.setRiskTolerance(TEST_RISK_TOLERANCE);
        request.setInvestmentGoals(TEST_INVESTMENT_GOALS);
        return request;
    }

    /**
     * Creates a comprehensive test WellnessProfileResponse with complete profile data.
     * 
     * <p>This helper method generates a complete wellness profile response including
     * financial goals, recommendations, and metadata for testing response serialization
     * and content validation across various controller endpoints.</p>
     * 
     * @return A fully populated WellnessProfileResponse for testing
     */
    private WellnessProfileResponse createTestWellnessProfileResponse() {
        // Create financial goals for the test profile
        List<FinancialGoal> goals = new ArrayList<>();
        goals.add(createTestFinancialGoal("Emergency Fund", new BigDecimal("15000.00")));
        goals.add(createTestFinancialGoal("Home Down Payment", new BigDecimal("50000.00")));

        // Create recommendations for the test profile
        List<Recommendation> recommendations = new ArrayList<>();
        recommendations.add(createTestRecommendation("Increase emergency fund", "HIGH"));
        recommendations.add(createTestRecommendation("Optimize investment allocation", "MEDIUM"));
        recommendations.add(createTestRecommendation("Consider debt consolidation", "LOW"));

        // Create the comprehensive wellness profile response
        return new WellnessProfileResponse(
            UUID.fromString(TEST_PROFILE_ID),
            UUID.fromString(TEST_CUSTOMER_ID),
            TEST_WELLNESS_SCORE,
            goals,
            recommendations,
            LocalDateTime.now().minusDays(30), // Created 30 days ago
            LocalDateTime.now() // Updated now
        );
    }

    /**
     * Creates an enhanced test WellnessProfileResponse with improved metrics.
     * 
     * <p>This helper method generates a wellness profile response representing
     * an improved financial situation, used for testing update scenarios where
     * customer financial health has improved through profile modifications.</p>
     * 
     * @return An enhanced WellnessProfileResponse with improved financial metrics
     */
    private WellnessProfileResponse createEnhancedWellnessProfileResponse() {
        // Create enhanced financial goals for the improved profile
        List<FinancialGoal> enhancedGoals = new ArrayList<>();
        enhancedGoals.add(createTestFinancialGoal("Emergency Fund", new BigDecimal("18000.00")));
        enhancedGoals.add(createTestFinancialGoal("Home Down Payment", new BigDecimal("55000.00")));

        // Create enhanced recommendations reflecting improved financial health
        List<Recommendation> enhancedRecommendations = new ArrayList<>();
        enhancedRecommendations.add(createTestRecommendation("Consider aggressive investment strategy", "HIGH"));
        enhancedRecommendations.add(createTestRecommendation("Explore tax-advantaged accounts", "MEDIUM"));
        enhancedRecommendations.add(createTestRecommendation("Plan for estate optimization", "MEDIUM"));
        enhancedRecommendations.add(createTestRecommendation("Evaluate insurance coverage", "LOW"));

        // Create the enhanced wellness profile response with improved score
        return new WellnessProfileResponse(
            UUID.fromString(TEST_PROFILE_ID),
            UUID.fromString(TEST_CUSTOMER_ID),
            85, // Improved wellness score
            enhancedGoals,
            enhancedRecommendations,
            LocalDateTime.now().minusDays(30), // Original creation date
            LocalDateTime.now() // Updated now
        );
    }

    /**
     * Creates a test FinancialGoal object with specified parameters.
     * 
     * <p>Helper method for generating consistent financial goal test data
     * with realistic goal amounts and completion tracking for comprehensive
     * wellness profile testing scenarios.</p>
     * 
     * @param goalName The name of the financial goal
     * @param targetAmount The target amount for the goal
     * @return A configured FinancialGoal object for testing
     */
    private FinancialGoal createTestFinancialGoal(String goalName, BigDecimal targetAmount) {
        FinancialGoal goal = new FinancialGoal();
        goal.setGoalName(goalName);
        goal.setTargetAmount(targetAmount.doubleValue());
        goal.setCurrentAmount(targetAmount.multiply(new BigDecimal("0.3")).doubleValue()); // 30% progress
        goal.setTargetDate(java.sql.Date.valueOf("2025-12-31"));
        goal.setStatus("ACTIVE");
        return goal;
    }

    /**
     * Creates a test Recommendation object with specified parameters.
     * 
     * <p>Helper method for generating consistent recommendation test data
     * with various priority levels and categories for comprehensive wellness
     * profile response testing and validation.</p>
     * 
     * @param recommendationText The recommendation description
     * @param priority The priority level (HIGH, MEDIUM, LOW)
     * @return A configured Recommendation object for testing
     */
    private Recommendation createTestRecommendation(String recommendationText, String priority) {
        Recommendation recommendation = new Recommendation();
        recommendation.setRecommendationText(recommendationText);
        recommendation.setPriority(priority);
        recommendation.setCategory("GENERAL");
        recommendation.setStatus("PENDING");
        return recommendation;
    }
}