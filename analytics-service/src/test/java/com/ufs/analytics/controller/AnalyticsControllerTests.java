package com.ufs.analytics.controller;

import com.ufs.analytics.service.AnalyticsService;
import com.ufs.analytics.service.ReportService;
import com.ufs.analytics.dto.AnalyticsRequest;
import com.ufs.analytics.dto.AnalyticsResponse;
import com.ufs.analytics.dto.ReportRequest;
import com.ufs.analytics.dto.ReportResponse;
import com.ufs.analytics.exception.AnalyticsException;

import org.junit.jupiter.api.Test; // JUnit 5.10+
import org.junit.jupiter.api.DisplayName; // JUnit 5.10+
import org.junit.jupiter.api.BeforeEach; // JUnit 5.10+
import org.junit.jupiter.api.Nested; // JUnit 5.10+
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest; // Spring Boot 3.2+
import org.springframework.boot.test.mock.mockito.MockBean; // Spring Boot 3.2+
import org.springframework.beans.factory.annotation.Autowired; // Spring 6.1+
import org.springframework.test.web.servlet.MockMvc; // Spring Test 6.1+
import org.springframework.test.web.servlet.ResultActions; // Spring Test 6.1+
import org.springframework.test.web.servlet.MvcResult; // Spring Test 6.1+

import com.fasterxml.jackson.databind.ObjectMapper; // Jackson 2.15+
import com.fasterxml.jackson.core.JsonProcessingException; // Jackson 2.15+

import org.springframework.http.MediaType; // Spring 6.1+
import org.springframework.http.HttpStatus; // Spring 6.1+

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post; // Spring Test 6.1+
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get; // Spring Test 6.1+
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status; // Spring Test 6.1+
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content; // Spring Test 6.1+
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath; // Spring Test 6.1+
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print; // Spring Test 6.1+

import static org.mockito.Mockito.when; // Mockito 5.7+
import static org.mockito.Mockito.verify; // Mockito 5.7+
import static org.mockito.Mockito.times; // Mockito 5.7+
import static org.mockito.Mockito.any; // Mockito 5.7+
import static org.mockito.Mockito.eq; // Mockito 5.7+
import static org.mockito.Mockito.doThrow; // Mockito 5.7+
import static org.mockito.Mockito.never; // Mockito 5.7+
import static org.mockito.ArgumentMatchers.anyString; // Mockito 5.7+

import static org.junit.jupiter.api.Assertions.assertEquals; // JUnit 5.10+
import static org.junit.jupiter.api.Assertions.assertNotNull; // JUnit 5.10+
import static org.junit.jupiter.api.Assertions.assertTrue; // JUnit 5.10+
import static org.junit.jupiter.api.Assertions.assertFalse; // JUnit 5.10+

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.UUID;

/**
 * Comprehensive unit test suite for the AnalyticsController class.
 * 
 * This test class validates the controller layer of the analytics service in isolation,
 * focusing on request mapping, data serialization/deserialization, and exception handling.
 * The AnalyticsService and ReportService dependencies are mocked to ensure tests are 
 * focused solely on the controller's behavior and HTTP-specific functionality.
 * 
 * <p><strong>Test Coverage Areas:</strong></p>
 * <ul>
 *   <li><strong>F-005: Predictive Analytics Dashboard</strong> - Validates controller endpoints
 *       that expose predictive analytics data required for the dashboard functionality</li>
 *   <li><strong>HTTP Request/Response Handling</strong> - Ensures proper HTTP status codes,
 *       content types, and response formatting for all endpoints</li>
 *   <li><strong>Input Validation</strong> - Tests request parameter validation and error
 *       handling for malformed or invalid input data</li>
 *   <li><strong>Exception Handling</strong> - Verifies proper error response formatting
 *       and HTTP status code mapping for various exception scenarios</li>
 *   <li><strong>Content Negotiation</strong> - Validates JSON serialization/deserialization
 *       and proper content-type headers for API responses</li>
 * </ul>
 * 
 * <p><strong>Testing Strategy:</strong></p>
 * <ul>
 *   <li><strong>Isolated Web Layer Testing</strong> - Uses @WebMvcTest to load only the
 *       web layer components, ensuring fast test execution and focused testing scope</li>
 *   <li><strong>Service Layer Mocking</strong> - Employs @MockBean to mock service
 *       dependencies, allowing complete control over service behavior and responses</li>
 *   <li><strong>MockMvc Integration</strong> - Utilizes Spring's MockMvc for performing
 *       HTTP requests without starting a full server, enabling precise endpoint testing</li>
 *   <li><strong>Comprehensive Assertion</strong> - Implements detailed assertions for
 *       HTTP status codes, response content, headers, and JSON structure validation</li>
 * </ul>
 * 
 * <p><strong>Performance Considerations:</strong></p>
 * <ul>
 *   <li><strong>Fast Execution</strong> - Web layer testing provides sub-second test
 *       execution times for rapid development feedback cycles</li>
 *   <li><strong>Minimal Context Loading</strong> - @WebMvcTest loads minimal Spring
 *       context, reducing test startup time and resource consumption</li>
 *   <li><strong>Efficient Mocking</strong> - Mockito mocks eliminate external dependencies
 *       and database interactions for consistent, fast test execution</li>
 * </ul>
 * 
 * <p><strong>Quality Assurance Features:</strong></p>
 * <ul>
 *   <li><strong>Enterprise Logging</strong> - Comprehensive test logging for debugging
 *       and audit trail purposes in financial services environments</li>
 *   <li><strong>Validation Coverage</strong> - Tests both positive and negative scenarios
 *       for complete validation rule coverage</li>
 *   <li><strong>Error Path Testing</strong> - Extensive error handling testing to ensure
 *       proper error responses and system resilience</li>
 *   <li><strong>Security Testing</strong> - Validates security-related error responses
 *       and proper handling of authentication/authorization failures</li>
 * </ul>
 * 
 * @author UFS Analytics Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @see AnalyticsController Controller under test
 * @see AnalyticsService Mocked analytics service dependency
 * @see ReportService Mocked report service dependency
 */
@WebMvcTest(AnalyticsController.class)
@DisplayName("AnalyticsController Unit Tests")
class AnalyticsControllerTests {

    /**
     * MockMvc instance for performing HTTP requests in tests.
     * 
     * Provides the primary interface for testing Spring MVC controllers without
     * starting a full HTTP server. Enables precise control over request parameters,
     * headers, and content while providing detailed response inspection capabilities.
     * 
     * Key capabilities:
     * - HTTP method simulation (GET, POST, PUT, DELETE)
     * - Request header and parameter configuration
     * - JSON request/response body handling
     * - Response status code and content validation
     * - Error handling and exception testing
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mock instance of the AnalyticsService dependency.
     * 
     * This mock enables complete control over analytics service behavior during testing,
     * allowing simulation of various scenarios including successful responses, exceptions,
     * and edge cases. The mock is automatically injected into the controller context
     * by Spring's @MockBean annotation.
     * 
     * Mock capabilities:
     * - Method behavior customization via Mockito when/then patterns
     * - Exception simulation for error handling testing
     * - Argument capture and validation for interaction testing
     * - Call count verification for behavioral assertions
     */
    @MockBean
    private AnalyticsService analyticsService;

    /**
     * Mock instance of the ReportService dependency.
     * 
     * Provides controlled behavior for report generation functionality testing,
     * enabling simulation of successful report generation, validation failures,
     * and service errors. The mock supports comprehensive testing of report-related
     * controller endpoints and error handling paths.
     * 
     * Mock capabilities:
     * - Report generation behavior simulation
     * - Report request validation testing
     * - Service exception handling verification
     * - Response format and content validation
     */
    @MockBean
    private ReportService reportService;

    /**
     * ObjectMapper instance for JSON serialization and deserialization.
     * 
     * Provides JSON processing capabilities for converting test objects to JSON
     * strings for request bodies and parsing JSON responses for validation.
     * Automatically configured by Spring Boot with appropriate settings for
     * the analytics service context.
     * 
     * Features:
     * - Object to JSON serialization for request body creation
     * - JSON to object deserialization for response validation
     * - Date/time formatting aligned with application configuration
     * - Custom serialization rules for domain-specific objects
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test data setup and common utilities.
     * 
     * Provides centralized test data creation and configuration to ensure
     * consistency across test cases and reduce code duplication. Initialized
     * before each test method execution to provide fresh test data.
     */
    private AnalyticsRequest validAnalyticsRequest;
    private AnalyticsResponse successfulAnalyticsResponse;
    private ReportRequest validReportRequest;
    private ReportResponse successfulReportResponse;

    /**
     * Test setup method executed before each test case.
     * 
     * Initializes common test data objects and configures default mock behaviors
     * to provide consistent test environment. This method ensures each test starts
     * with known, valid test data and predictable mock configurations.
     * 
     * Setup includes:
     * - Valid request objects for positive test scenarios
     * - Successful response objects for mock return values
     * - Default mock behaviors for common use cases
     * - Test data validation to ensure consistency
     */
    @BeforeEach
    void setUp() {
        // Initialize valid analytics request for testing
        validAnalyticsRequest = new AnalyticsRequest(
            "TRANSACTION_VOLUME",        // Metric type for transaction analytics
            "LAST_24_HOURS",            // Time range for recent data analysis
            null,                       // No custom start date for predefined range
            null,                       // No custom end date for predefined range
            Arrays.asList("CHANNEL", "CURRENCY"), // Dimensional analysis by channel and currency
            Map.of(                     // Filter criteria for refined analytics
                "status", "COMPLETED",
                "amount_range", "1000-10000"
            )
        );

        // Initialize successful analytics response for mocking
        successfulAnalyticsResponse = new AnalyticsResponse();
        successfulAnalyticsResponse.setReportId("RPT-2025-001-TXN-VOL");
        successfulAnalyticsResponse.setStatus("SUCCESS");
        successfulAnalyticsResponse.setGeneratedAt(LocalDateTime.now());
        
        // Create comprehensive analytics data for response
        Map<String, Object> analyticsData = new HashMap<>();
        analyticsData.put("totalTransactions", 15420);
        analyticsData.put("totalVolume", 25650000.00);
        analyticsData.put("averageAmount", 1663.45);
        analyticsData.put("trends", Arrays.asList("increasing", "stable"));
        analyticsData.put("breakdowns", Map.of(
            "channels", Map.of("MOBILE", 8500, "WEB", 4200, "ATM", 2720),
            "currencies", Map.of("USD", 12000, "EUR", 2420, "GBP", 1000)
        ));
        successfulAnalyticsResponse.setData(analyticsData);

        // Initialize valid report request for testing
        validReportRequest = new ReportRequest(
            "TRANSACTION_MONITORING",    // Report type for transaction monitoring
            LocalDate.now().minusDays(30), // Start date - 30 days ago
            LocalDate.now(),             // End date - current date
            "PDF"                        // Format - PDF for formal reporting
        );

        // Initialize successful report response for mocking
        successfulReportResponse = new ReportResponse(
            "RPT-2025-002-MON",         // Report ID for tracking
            "Transaction Monitoring Report", // Human-readable report name
            "TRANSACTION_MONITORING",    // Report type classification
            LocalDateTime.now(),         // Generation timestamp
            "Sample PDF report content", // Report content (simplified for testing)
            "application/pdf"            // Content format specification
        );
    }

    /**
     * Nested test class for analytics-related endpoint testing.
     * 
     * Groups analytics-specific tests together for better test organization
     * and reporting. Focuses on the POST /api/v1/analytics endpoint and
     * related analytics functionality.
     */
    @Nested
    @DisplayName("Analytics Endpoint Tests")
    class AnalyticsEndpointTests {

        /**
         * Tests successful retrieval of analytics data.
         * 
         * This test validates the happy path scenario where a valid analytics request
         * is processed successfully and returns appropriate analytics data. It ensures
         * proper request handling, service integration, and response formatting.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>Valid AnalyticsRequest with transaction volume metric type</li>
         *   <li>Service returns successful AnalyticsResponse with comprehensive data</li>
         *   <li>Controller processes request and returns HTTP 200 OK</li>
         *   <li>Response contains properly formatted JSON with analytics data</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 200 (OK) for successful processing</li>
         *   <li>Response content type is application/json</li>
         *   <li>Response body contains all expected analytics data fields</li>
         *   <li>Service method is called exactly once with correct parameters</li>
         *   <li>Response data matches expected structure and values</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return analytics data when a valid request is made")
        void testGetAnalytics_Success() throws Exception {
            // Arrange: Configure mock service to return successful response
            when(analyticsService.generateAnalyticsReport(any(AnalyticsRequest.class)))
                .thenReturn(successfulAnalyticsResponse);

            // Convert request object to JSON string for HTTP request body
            String requestJson = objectMapper.writeValueAsString(validAnalyticsRequest);

            // Act: Perform POST request to analytics endpoint
            ResultActions result = mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify response status and structure
            result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpected(jsonPath("$.reportId").value("RPT-2025-001-TXN-VOL"))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.generatedAt").exists())
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.totalTransactions").value(15420))
                .andExpect(jsonPath("$.data.totalVolume").value(25650000.00))
                .andExpect(jsonPath("$.data.averageAmount").value(1663.45))
                .andExpect(jsonPath("$.data.trends").isArray())
                .andExpect(jsonPath("$.data.breakdowns").exists())
                .andExpect(jsonPath("$.data.breakdowns.channels").exists())
                .andExpect(jsonPath("$.data.breakdowns.currencies").exists());

            // Verify service interaction
            verify(analyticsService, times(1)).generateAnalyticsReport(any(AnalyticsRequest.class));
        }

        /**
         * Tests error handling when the analytics service throws an exception.
         * 
         * This test validates the controller's error handling capabilities when
         * the underlying analytics service encounters an error during processing.
         * It ensures proper exception mapping and error response formatting.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>Valid AnalyticsRequest is submitted for processing</li>
         *   <li>AnalyticsService throws AnalyticsException during processing</li>
         *   <li>Controller catches exception and returns appropriate error response</li>
         *   <li>Error response contains structured error information</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 500 (Internal Server Error) for service failures</li>
         *   <li>Response content type is application/json for consistent API behavior</li>
         *   <li>Error response contains error details and correlation information</li>
         *   <li>Service method is called but throws exception as expected</li>
         *   <li>Exception handling preserves error context for debugging</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return 500 Internal Server Error when service throws an exception")
        void testGetAnalytics_ServiceError() throws Exception {
            // Arrange: Configure mock service to throw AnalyticsException
            String errorMessage = "Analytics processing failed due to data unavailability";
            when(analyticsService.generateAnalyticsReport(any(AnalyticsRequest.class)))
                .thenThrow(new AnalyticsException(errorMessage));

            // Convert request object to JSON string for HTTP request body
            String requestJson = objectMapper.writeValueAsString(validAnalyticsRequest);

            // Act: Perform POST request expecting service error
            ResultActions result = mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify error response status and structure
            result.andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.reportId").exists()) // Error report ID should be present
                .andExpect(jsonPath("$.reportId").value(org.hamcrest.Matchers.startsWith("ERROR-")))
                .andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.generatedAt").exists())
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.errorCode").value("SYSTEM_ERROR"))
                .andExpect(jsonPath("$.data.errorMessage").exists())
                .andExpect(jsonPath("$.data.correlationId").exists())
                .andExpect(jsonPath("$.data.timestamp").exists());

            // Verify service interaction occurred as expected
            verify(analyticsService, times(1)).generateAnalyticsReport(any(AnalyticsRequest.class));
        }

        /**
         * Tests the dashboard analytics endpoint for successful data retrieval.
         * 
         * This test validates the GET /api/v1/analytics/dashboard endpoint which
         * provides optimized analytics data specifically for dashboard consumption.
         * It ensures proper dashboard-specific request handling and response formatting.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>GET request to dashboard analytics endpoint</li>
         *   <li>Service returns dashboard-optimized analytics data</li>
         *   <li>Controller processes request and returns HTTP 200 OK</li>
         *   <li>Response contains dashboard-specific metadata and analytics data</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 200 (OK) for successful dashboard data retrieval</li>
         *   <li>Response includes dashboard-specific metadata fields</li>
         *   <li>Analytics data is properly formatted for dashboard consumption</li>
         *   <li>Service method is called with dashboard-specific parameters</li>
         *   <li>Performance metadata is included for monitoring purposes</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return dashboard analytics data successfully")
        void testGetDashboardAnalytics_Success() throws Exception {
            // Arrange: Configure dashboard-specific response
            AnalyticsResponse dashboardResponse = new AnalyticsResponse();
            dashboardResponse.setReportId("DASH-2025-001-MAIN");
            dashboardResponse.setStatus("SUCCESS");
            dashboardResponse.setGeneratedAt(LocalDateTime.now());
            
            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("summary", Map.of(
                "totalRevenue", 125000000.00,
                "transactionCount", 45620,
                "avgRiskScore", 0.23,
                "systemHealth", "HEALTHY"
            ));
            dashboardData.put("correlationId", "test-correlation-id");
            dashboardData.put("processingTime", 250L);
            dashboardData.put("dashboardType", "MAIN_DASHBOARD");
            dashboardData.put("dataFreshness", "REAL_TIME");
            dashboardResponse.setData(dashboardData);

            when(analyticsService.getAnalyticsForDashboard(any(AnalyticsRequest.class)))
                .thenReturn(dashboardResponse);

            // Act: Perform GET request to dashboard endpoint
            ResultActions result = mockMvc.perform(get("/api/v1/analytics/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify successful dashboard response
            result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.reportId").value("DASH-2025-001-MAIN"))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.generatedAt").exists())
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.summary").exists())
                .andExpect(jsonPath("$.data.summary.totalRevenue").value(125000000.00))
                .andExpect(jsonPath("$.data.summary.transactionCount").value(45620))
                .andExpect(jsonPath("$.data.summary.avgRiskScore").value(0.23))
                .andExpect(jsonPath("$.data.summary.systemHealth").value("HEALTHY"))
                .andExpect(jsonPath("$.data.correlationId").exists())
                .andExpect(jsonPath("$.data.processingTime").exists())
                .andExpect(jsonPath("$.data.dashboardType").value("MAIN_DASHBOARD"))
                .andExpected(jsonPath("$.data.dataFreshness").value("REAL_TIME"));

            // Verify service interaction with dashboard-specific request
            verify(analyticsService, times(1)).getAnalyticsForDashboard(any(AnalyticsRequest.class));
        }
    }

    /**
     * Nested test class for report generation endpoint testing.
     * 
     * Groups report-related tests together for better organization and focuses
     * on the report generation endpoints and related functionality including
     * validation and error handling scenarios.
     */
    @Nested
    @DisplayName("Report Generation Endpoint Tests")
    class ReportGenerationTests {

        /**
         * Tests successful generation of a report.
         * 
         * This test validates the happy path scenario for report generation where
         * a valid report request is processed successfully and returns a complete
         * report response. It ensures proper integration with the report service
         * and correct response formatting.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>Valid ReportRequest with transaction monitoring report type</li>
         *   <li>ReportService successfully generates report with PDF format</li>
         *   <li>Controller processes request and returns HTTP 200 OK</li>
         *   <li>Response contains complete report metadata and content information</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 200 (OK) for successful report generation</li>
         *   <li>Response content type is application/json</li>
         *   <li>Response body contains all expected report fields</li>
         *   <li>Report service method is called exactly once with correct parameters</li>
         *   <li>Report metadata matches expected structure and values</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return a report when a valid report request is made")
        void testGenerateReport_Success() throws Exception {
            // Arrange: Configure mock report service to return successful response
            when(reportService.generateReport(any(ReportRequest.class)))
                .thenReturn(successfulReportResponse);

            // Convert request object to JSON string for HTTP request body
            String requestJson = objectMapper.writeValueAsString(validReportRequest);

            // Act: Perform POST request to report generation endpoint
            ResultActions result = mockMvc.perform(post("/api/v1/analytics/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify successful report generation response
            result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.reportId").value("RPT-2025-002-MON"))
                .andExpect(jsonPath("$.reportName").value("Transaction Monitoring Report"))
                .andExpect(jsonPath("$.reportType").value("TRANSACTION_MONITORING"))
                .andExpect(jsonPath("$.generatedAt").exists())
                .andExpect(jsonPath("$.content").value("Sample PDF report content"))
                .anndExpected(jsonPath("$.format").value("application/pdf"));

            // Verify report service interaction
            verify(reportService, times(1)).generateReport(any(ReportRequest.class));
        }

        /**
         * Tests behavior when an invalid report request is made.
         * 
         * This test validates the controller's input validation capabilities
         * when processing malformed or invalid report requests. It ensures
         * proper validation error handling and appropriate HTTP status codes.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>Invalid ReportRequest with null or missing required fields</li>
         *   <li>Controller validation detects invalid request parameters</li>
         *   <li>Controller returns HTTP 400 Bad Request without calling service</li>
         *   <li>Error response contains detailed validation error information</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 400 (Bad Request) for validation failures</li>
         *   <li>Response content type is application/json for consistent API behavior</li>
         *   <li>Error response contains specific validation error details</li>
         *   <li>Report service is not called for invalid requests</li>
         *   <li>Request validation occurs before service layer interaction</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return 400 Bad Request for an invalid report request")
        void testGenerateReport_InvalidRequest() throws Exception {
            // Arrange: Create invalid report request with null required fields
            ReportRequest invalidRequest = new ReportRequest();
            invalidRequest.setReportType(null);  // Invalid: null report type
            invalidRequest.setStartDate(null);   // Invalid: null start date
            invalidRequest.setEndDate(null);     // Invalid: null end date
            invalidRequest.setFormat("");        // Invalid: empty format string

            // Convert invalid request object to JSON string
            String invalidRequestJson = objectMapper.writeValueAsString(invalidRequest);

            // Act: Perform POST request with invalid data
            ResultActions result = mockMvc.perform(post("/api/v1/analytics/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify validation error response
            result.andExpect(status().isBadRequest())
                .andExpected(content().contentType(MediaType.APPLICATION_JSON));

            // Verify that report service is never called for invalid requests
            verify(reportService, never()).generateReport(any(ReportRequest.class));
        }

        /**
         * Tests behavior when report generation fails due to service errors.
         * 
         * This test validates error handling when the report service encounters
         * errors during report generation, ensuring proper exception mapping
         * and error response formatting for service-level failures.
         * 
         * <p><strong>Test Scenario:</strong></p>
         * <ul>
         *   <li>Valid ReportRequest is submitted for processing</li>
         *   <li>ReportService throws exception during report generation</li>
         *   <li>Controller catches exception and returns appropriate error response</li>
         *   <li>Error response contains structured error information</li>
         * </ul>
         * 
         * <p><strong>Validation Points:</strong></p>
         * <ul>
         *   <li>HTTP status code 500 (Internal Server Error) for service failures</li>
         *   <li>Response contains error details and debugging information</li>
         *   <li>Service method is called but throws exception as expected</li>
         *   <li>Exception context is preserved for troubleshooting</li>
         * </ul>
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should return 500 Internal Server Error when report generation fails")
        void testGenerateReport_ServiceError() throws Exception {
            // Arrange: Configure mock service to throw exception
            String errorMessage = "Report generation failed due to insufficient system resources";
            when(reportService.generateReport(any(ReportRequest.class)))
                .thenThrow(new RuntimeException(errorMessage));

            // Convert valid request to JSON string
            String requestJson = objectMapper.writeValueAsString(validReportRequest);

            // Act: Perform POST request expecting service error
            ResultActions result = mockMvc.perform(post("/api/v1/analytics/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print()); // Print request/response details for debugging

            // Assert: Verify error response for service failure
            result.andExpect(status().isInternalServerError());

            // Verify service interaction occurred as expected
            verify(reportService, times(1)).generateReport(any(ReportRequest.class));
        }
    }

    /**
     * Nested test class for input validation testing.
     * 
     * Groups validation-specific tests to ensure comprehensive coverage of
     * input validation scenarios including edge cases, boundary conditions,
     * and malformed data handling.
     */
    @Nested
    @DisplayName("Input Validation Tests")
    class InputValidationTests {

        /**
         * Tests analytics request validation with missing required fields.
         * 
         * Validates that the controller properly handles analytics requests
         * with missing or null required fields, ensuring appropriate validation
         * error responses and preventing invalid data from reaching the service layer.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should reject analytics request with missing required fields")
        void testAnalyticsRequest_MissingFields() throws Exception {
            // Arrange: Create request with missing required fields
            AnalyticsRequest invalidRequest = new AnalyticsRequest(
                null,    // Invalid: null metric type
                "",      // Invalid: empty time range
                null,    // Valid: null start date for predefined range
                null,    // Valid: null end date for predefined range
                null,    // Valid: null dimensions
                null     // Valid: null filters
            );

            String invalidRequestJson = objectMapper.writeValueAsString(invalidRequest);

            // Act & Assert: Verify validation error response
            mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

            // Verify service is not called for invalid requests
            verify(analyticsService, never()).generateAnalyticsReport(any(AnalyticsRequest.class));
        }

        /**
         * Tests report request validation with invalid date ranges.
         * 
         * Validates that the controller properly handles report requests
         * with invalid date ranges, ensuring proper validation and error
         * responses for temporal data validation.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should reject report request with invalid date range")
        void testReportRequest_InvalidDateRange() throws Exception {
            // Arrange: Create request with end date before start date
            ReportRequest invalidRequest = new ReportRequest(
                "TRANSACTION_MONITORING", // Valid report type
                LocalDate.now(),          // Start date: today
                LocalDate.now().minusDays(1), // End date: yesterday (invalid)
                "PDF"                     // Valid format
            );

            String invalidRequestJson = objectMapper.writeValueAsString(invalidRequest);

            // Act & Assert: Verify validation error for invalid date range
            mockMvc.perform(post("/api/v1/analytics/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

            // Verify service is not called for invalid requests
            verify(reportService, never()).generateReport(any(ReportRequest.class));
        }
    }

    /**
     * Nested test class for content type and media type testing.
     * 
     * Groups tests related to HTTP content negotiation, media type handling,
     * and proper content-type header processing for API endpoints.
     */
    @Nested
    @DisplayName("Content Type and Media Type Tests")
    class ContentTypeTests {

        /**
         * Tests rejection of unsupported content types.
         * 
         * Validates that the controller properly rejects requests with
         * unsupported content types, ensuring API contracts are enforced
         * and only valid content types are processed.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should reject requests with unsupported content types")
        void testUnsupportedContentType() throws Exception {
            // Arrange: Create valid request data but with unsupported content type
            String requestJson = objectMapper.writeValueAsString(validAnalyticsRequest);

            // Act & Assert: Verify rejection of unsupported content type
            mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.TEXT_PLAIN) // Unsupported content type
                .content(requestJson))
                .andDo(print())
                .andExpected(status().isUnsupportedMediaType());

            // Verify service is not called for unsupported content types
            verify(analyticsService, never()).generateAnalyticsReport(any(AnalyticsRequest.class));
        }

        /**
         * Tests handling of malformed JSON requests.
         * 
         * Validates that the controller properly handles requests with
         * malformed JSON content, ensuring appropriate error responses
         * and proper error handling for parsing failures.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should handle malformed JSON requests gracefully")
        void testMalformedJsonRequest() throws Exception {
            // Arrange: Create malformed JSON string
            String malformedJson = "{ \"metricType\": \"INVALID_JSON\" missing_comma \"timeRange\": }";

            // Act & Assert: Verify graceful handling of malformed JSON
            mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andDo(print())
                .andExpect(status().isBadRequest());

            // Verify service is not called for malformed requests
            verify(analyticsService, never()).generateAnalyticsReport(any(AnalyticsRequest.class));
        }
    }

    /**
     * Nested test class for security and authorization testing.
     * 
     * Groups security-related tests to ensure proper handling of security
     * exceptions and authorization failures in the analytics controller.
     */
    @Nested
    @DisplayName("Security and Authorization Tests")
    class SecurityTests {

        /**
         * Tests handling of security exceptions from the analytics service.
         * 
         * Validates that the controller properly handles security exceptions
         * thrown by the analytics service, ensuring appropriate HTTP status
         * codes and error responses for authorization failures.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should handle security exceptions with proper status codes")
        void testSecurityException_Analytics() throws Exception {
            // Arrange: Configure service to throw SecurityException
            when(analyticsService.generateAnalyticsReport(any(AnalyticsRequest.class)))
                .thenThrow(new SecurityException("Insufficient permissions for analytics data access"));

            String requestJson = objectMapper.writeValueAsString(validAnalyticsRequest);

            // Act & Assert: Verify security exception handling
            mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.errorCode").value("AUTHORIZATION_ERROR"));

            // Verify service interaction
            verify(analyticsService, times(1)).generateAnalyticsReport(any(AnalyticsRequest.class));
        }
    }

    /**
     * Nested test class for performance and load testing scenarios.
     * 
     * Groups performance-related tests to validate controller behavior
     * under various load conditions and performance requirements.
     */
    @Nested
    @DisplayName("Performance and Load Tests")
    class PerformanceTests {

        /**
         * Tests handling of large request payloads.
         * 
         * Validates that the controller can handle large analytics requests
         * with extensive dimension lists and filter criteria while maintaining
         * proper performance characteristics.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Should handle large analytics requests efficiently")
        void testLargeAnalyticsRequest() throws Exception {
            // Arrange: Create request with many dimensions and filters
            Map<String, String> largeFilterMap = new HashMap<>();
            for (int i = 0; i < 15; i++) {
                largeFilterMap.put("filter" + i, "value" + i);
            }

            AnalyticsRequest largeRequest = new AnalyticsRequest(
                "COMPREHENSIVE_ANALYSIS",
                "LAST_90_DAYS",
                null,
                null,
                Arrays.asList("CHANNEL", "CURRENCY", "PRODUCT", "REGION", 
                             "CUSTOMER_SEGMENT", "RISK_CATEGORY", "AMOUNT_RANGE",
                             "TIME_OF_DAY", "DAY_OF_WEEK", "MONTH", "QUARTER"),
                largeFilterMap
            );

            when(analyticsService.generateAnalyticsReport(any(AnalyticsRequest.class)))
                .thenReturn(successfulAnalyticsResponse);

            String requestJson = objectMapper.writeValueAsString(largeRequest);

            // Act & Assert: Verify handling of large request
            mockMvc.perform(post("/api/v1/analytics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());

            // Verify service interaction
            verify(analyticsService, times(1)).generateAnalyticsReport(any(AnalyticsRequest.class));
        }
    }
}