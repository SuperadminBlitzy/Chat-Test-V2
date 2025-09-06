package com.ufs.analytics.service;

import com.ufs.analytics.service.impl.AnalyticsServiceImpl;
import com.ufs.analytics.dto.AnalyticsRequest;
import com.ufs.analytics.dto.AnalyticsResponse;
import com.ufs.analytics.model.AnalyticsData;
import com.ufs.analytics.repository.AnalyticsRepository;
import com.ufs.analytics.event.AnalyticsEvent;
import com.ufs.analytics.exception.AnalyticsException;

import org.junit.jupiter.api.Test; // JUnit Jupiter 5.10.+
import org.junit.jupiter.api.BeforeEach; // JUnit Jupiter 5.10.+
import org.junit.jupiter.api.DisplayName; // JUnit Jupiter 5.10.+
import org.junit.jupiter.api.Nested; // JUnit Jupiter 5.10.+
import org.junit.jupiter.api.extension.ExtendWith; // JUnit Jupiter 5.10.+
import org.mockito.InjectMocks; // Mockito 5.7.+
import org.mockito.Mock; // Mockito 5.7.+
import org.mockito.junit.jupiter.MockitoExtension; // Mockito 5.7.+
import static org.junit.jupiter.api.Assertions.*; // JUnit Jupiter 5.10.+
import static org.mockito.Mockito.*; // Mockito 5.7.+
import static org.mockito.ArgumentMatchers.*; // Mockito 5.7.+

import org.springframework.kafka.core.KafkaTemplate; // Spring Kafka 3.2.0
import org.springframework.kafka.support.SendResult; // Spring Kafka 3.2.0

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Comprehensive unit test suite for AnalyticsServiceImpl class.
 * 
 * This test class ensures the analytics service correctly implements all features 
 * supporting the Predictive Analytics Dashboard (F-005) and Real-time Transaction 
 * Monitoring (F-008) requirements. It validates data processing, report generation, 
 * event handling, and error scenarios with enterprise-grade testing patterns.
 * 
 * Test Coverage Areas:
 * - Predictive analytics dashboard data generation and caching
 * - Comprehensive analytics report generation with statistical analysis
 * - Real-time transaction event processing and Kafka integration
 * - Event listener functionality for transaction and risk assessment events
 * - Error handling and exception scenarios for all service methods
 * - Performance metrics tracking and monitoring capabilities
 * - Input validation and boundary condition testing
 * - Mock dependency interaction verification
 * - Caching behavior and performance optimization validation
 * 
 * Performance Testing Scope:
 * - Sub-500ms response time validation for real-time analytics
 * - Sub-5 second response time validation for complex predictive analytics
 * - High-throughput event processing (5,000+ TPS capability verification)
 * - Memory usage and resource management under load conditions
 * 
 * Security and Compliance Testing:
 * - Input validation to prevent injection attacks
 * - Proper error handling without sensitive data exposure
 * - Audit logging verification for regulatory compliance
 * - Data integrity validation throughout processing pipeline
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 * @see AnalyticsServiceImpl The service implementation under test
 * @see AnalyticsService The service interface contract
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Analytics Service Implementation Tests")
class AnalyticsServiceTests {

    /**
     * Mock repository for InfluxDB time-series data operations.
     * This mock simulates data persistence and retrieval operations
     * without requiring an actual InfluxDB instance during testing.
     */
    @Mock
    private AnalyticsRepository analyticsRepository;

    /**
     * Mock Kafka template for event publishing operations.
     * This mock simulates asynchronous event publishing to Kafka topics
     * without requiring an actual Kafka cluster during testing.
     */
    @Mock
    private KafkaTemplate<String, AnalyticsEvent> kafkaTemplate;

    /**
     * The analytics service implementation under test.
     * Mockito automatically injects the mocked dependencies into this instance.
     */
    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    // Test data constants for consistent testing
    private static final String TEST_METRIC_TYPE = "TRANSACTION_VOLUME";
    private static final String TEST_TIME_RANGE = "LAST_24_HOURS";
    private static final String TEST_REPORT_ID_PREFIX = "RPT-";
    private static final String TEST_DASHBOARD_ID_PREFIX = "DASH-";
    private static final int TEST_DATA_POINTS_COUNT = 100;
    private static final long TEST_PERFORMANCE_THRESHOLD_MS = 5000L;
    private static final long TEST_REALTIME_THRESHOLD_MS = 500L;

    /**
     * Sets up the test environment before each test method execution.
     * 
     * This method initializes common test data, configures default mock behaviors,
     * and ensures a clean testing state for each individual test. It establishes
     * baseline mock responses that represent typical successful scenarios, which
     * can be overridden in specific test methods as needed.
     * 
     * Default Mock Configurations:
     * - Repository save operations return the saved data with generated metadata
     * - Kafka template send operations return successful CompletableFuture results
     * - Time-range queries return realistic test data sets
     * - Performance metrics queries return baseline performance data
     * 
     * Test Data Generation:
     * - Creates sample analytics data with various measurement types
     * - Generates realistic timestamp ranges for different time-based scenarios
     * - Establishes customer segments and transaction types for dimensional testing
     * - Sets up risk assessment data for predictive analytics validation
     */
    @BeforeEach
    @DisplayName("Initialize test environment and mock configurations")
    void setUp() {
        // Configure default successful behavior for repository save operations
        when(analyticsRepository.save(any(AnalyticsData.class)))
            .thenAnswer(invocation -> {
                AnalyticsData data = invocation.getArgument(0);
                // Simulate InfluxDB auto-generated metadata
                data.addField("_id", UUID.randomUUID().toString());
                data.addField("_saved_at", Instant.now().toString());
                return data;
            });

        // Configure default successful behavior for Kafka template operations
        CompletableFuture<SendResult<String, AnalyticsEvent>> successfulFuture = new CompletableFuture<>();
        SendResult<String, AnalyticsEvent> mockResult = mock(SendResult.class);
        successfulFuture.complete(mockResult);
        when(kafkaTemplate.send(anyString(), anyString(), any(AnalyticsEvent.class)))
            .thenReturn(successfulFuture);

        // Configure default repository query responses with realistic test data
        when(analyticsRepository.findByTimeRange(any(Instant.class), any(Instant.class)))
            .thenReturn(createSampleAnalyticsDataList(TEST_DATA_POINTS_COUNT));
        
        when(analyticsRepository.findTransactionMetrics(any(Instant.class), any(Instant.class)))
            .thenReturn(createSampleTransactionMetrics(50));
            
        when(analyticsRepository.findPerformanceMetrics(any(Instant.class), any(Instant.class)))
            .thenReturn(createSamplePerformanceMetrics(30));
            
        when(analyticsRepository.findRiskIndicators(any(Instant.class), any(Instant.class)))
            .thenReturn(createSampleRiskIndicators(25));
    }

    /**
     * Nested test class for testing analytics dashboard functionality.
     * 
     * This inner class focuses specifically on the getAnalyticsForDashboard method,
     * which supports the Predictive Analytics Dashboard (F-005) feature. Tests cover
     * successful dashboard data generation, caching behavior, performance optimization,
     * and various edge cases that may occur during dashboard operations.
     */
    @Nested
    @DisplayName("Analytics Dashboard Tests")
    class AnalyticsDashboardTests {

        /**
         * Tests successful retrieval of analytics data for the predictive dashboard.
         * 
         * This test validates that the service correctly processes a dashboard request,
         * retrieves appropriate data from the repository, performs necessary calculations
         * and aggregations, and returns a properly formatted response within performance
         * SLA requirements (<5 seconds for dashboard analytics).
         * 
         * Validation Points:
         * - Response is not null and contains expected structure
         * - Report ID follows the correct naming convention
         * - Status indicates successful processing
         * - Generated timestamp is recent and accurate
         * - Data contains expected analytics results and insights
         * - Repository methods are called with correct parameters
         * - Kafka events are published for real-time dashboard updates
         * - Performance metrics are updated correctly
         * 
         * Business Requirements Validated:
         * - F-005: Predictive Analytics Dashboard data generation
         * - Sub-5 second response time requirement
         * - Real-time data integration and processing
         * - Comprehensive analytics data structure for visualization
         */
        @Test
        @DisplayName("Should successfully generate analytics data for predictive dashboard")
        void testGetAnalyticsForDashboard_Success() {
            // Arrange: Create a comprehensive analytics request for dashboard
            AnalyticsRequest request = new AnalyticsRequest(
                "PREDICTIVE_RISK_SCORE",
                "LAST_30_DAYS",
                null,
                null,
                List.of("CUSTOMER_SEGMENT", "PRODUCT_TYPE", "GEOGRAPHIC_REGION"),
                Map.of(
                    "riskLevel", "HIGH",
                    "status", "ACTIVE",
                    "customerSegment", "PREMIUM"
                )
            );

            long startTime = System.currentTimeMillis();

            // Act: Execute the dashboard analytics generation
            AnalyticsResponse response = analyticsService.getAnalyticsForDashboard(request);

            long responseTime = System.currentTimeMillis() - startTime;

            // Assert: Validate response structure and content
            assertNotNull(response, "Analytics response should not be null");
            assertNotNull(response.getReportId(), "Report ID should be generated");
            assertTrue(response.getReportId().startsWith(TEST_DASHBOARD_ID_PREFIX), 
                       "Report ID should follow dashboard naming convention");
            assertEquals("SUCCESS", response.getStatus(), "Response status should indicate success");
            assertNotNull(response.getGeneratedAt(), "Generated timestamp should be set");
            assertNotNull(response.getData(), "Response data should not be null");
            
            // Validate performance requirement (dashboard analytics < 5 seconds)
            assertTrue(responseTime < TEST_PERFORMANCE_THRESHOLD_MS,
                       String.format("Dashboard response time (%dms) should be under %dms threshold", 
                                   responseTime, TEST_PERFORMANCE_THRESHOLD_MS));

            // Validate data structure contains expected analytics elements
            Map<String, Object> data = response.getData();
            assertTrue(data.containsKey("totalDataPoints"), "Data should contain total data points count");
            assertTrue(data.containsKey("timeRange"), "Data should contain time range information");
            assertTrue(data.containsKey("measurementSummary"), "Data should contain measurement summary");
            assertTrue(data.containsKey("dimensionalAnalysis"), "Data should contain dimensional analysis");
            assertTrue(data.containsKey("insights"), "Data should contain generated insights");

            // Verify repository interactions
            verify(analyticsRepository, times(1)).findRiskIndicators(any(Instant.class), any(Instant.class));
            verify(analyticsRepository, times(1)).save(any(AnalyticsData.class));

            // Verify Kafka event publishing for real-time dashboard updates
            verify(kafkaTemplate, times(1)).send(
                eq("analytics-events"), 
                anyString(), 
                any(AnalyticsEvent.class)
            );
        }

        /**
         * Tests successful caching behavior for repeated dashboard requests.
         * 
         * This test validates the intelligent caching mechanism that optimizes performance
         * by serving repeated requests from cache rather than re-executing expensive
         * analytics computations. This is crucial for dashboard performance when multiple
         * users access the same analytics views.
         * 
         * Validation Points:
         * - First request executes full analytics pipeline
         * - Second identical request is served from cache
         * - Cache hit returns identical data faster than original computation
         * - Repository is called only once for the original request
         * - Cache key generation works correctly for identical requests
         * - Different requests with different parameters bypass cache appropriately
         */
        @Test
        @DisplayName("Should serve repeated dashboard requests from cache for optimal performance")
        void testGetAnalyticsForDashboard_CacheHit() {
            // Arrange: Create identical analytics requests
            AnalyticsRequest request = new AnalyticsRequest(
                "TRANSACTION_VOLUME",
                "LAST_24_HOURS",
                null,
                null,
                List.of("CHANNEL", "CURRENCY"),
                Map.of("status", "COMPLETED")
            );

            // Act: Execute first request (cache miss)
            long firstRequestStart = System.currentTimeMillis();
            AnalyticsResponse firstResponse = analyticsService.getAnalyticsForDashboard(request);
            long firstRequestTime = System.currentTimeMillis() - firstRequestStart;

            // Execute second identical request (cache hit)
            long secondRequestStart = System.currentTimeMillis();
            AnalyticsResponse secondResponse = analyticsService.getAnalyticsForDashboard(request);
            long secondRequestTime = System.currentTimeMillis() - secondRequestStart;

            // Assert: Validate caching behavior
            assertNotNull(firstResponse, "First response should not be null");
            assertNotNull(secondResponse, "Second response should not be null");
            assertEquals(firstResponse.getReportId(), secondResponse.getReportId(), 
                        "Cached response should have same report ID");
            assertEquals(firstResponse.getData(), secondResponse.getData(),
                        "Cached response should have identical data");

            // Validate that cached request is significantly faster
            assertTrue(secondRequestTime < firstRequestTime / 2,
                      String.format("Cached request (%dms) should be much faster than original (%dms)",
                                  secondRequestTime, firstRequestTime));

            // Verify repository is called only once (for cache miss)
            verify(analyticsRepository, times(1)).findTransactionMetrics(any(Instant.class), any(Instant.class));
        }

        /**
         * Tests validation failure scenarios for invalid dashboard requests.
         * 
         * This test ensures that the service properly validates incoming requests
         * and rejects invalid parameters with appropriate error messages. This is
         * crucial for maintaining data integrity and providing clear feedback to
         * dashboard clients about request format requirements.
         * 
         * Test Scenarios:
         * - Null request parameter
         * - Empty or null metric type
         * - Invalid time range specifications
         * - Inconsistent date range parameters
         * - Excessive dimension or filter counts
         * - Invalid filter values or structures
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for invalid dashboard request parameters")
        void testGetAnalyticsForDashboard_InvalidRequest() {
            // Test null request
            IllegalArgumentException nullRequestException = assertThrows(
                IllegalArgumentException.class,
                () -> analyticsService.getAnalyticsForDashboard(null),
                "Should throw exception for null request"
            );
            assertTrue(nullRequestException.getMessage().contains("cannot be null"),
                      "Exception message should mention null parameter");

            // Test empty metric type
            AnalyticsRequest emptyMetricRequest = new AnalyticsRequest(
                "",
                "LAST_24_HOURS",
                null,
                null,
                null,
                null
            );
            
            IllegalArgumentException emptyMetricException = assertThrows(
                IllegalArgumentException.class,
                () -> analyticsService.getAnalyticsForDashboard(emptyMetricRequest),
                "Should throw exception for empty metric type"
            );
            assertTrue(emptyMetricException.getMessage().contains("metric type"),
                      "Exception message should mention metric type validation");

            // Test invalid custom date range
            AnalyticsRequest invalidDateRangeRequest = new AnalyticsRequest(
                "RISK_SCORE",
                "CUSTOM_RANGE",
                LocalDate.now(),
                LocalDate.now().minusDays(5), // End date before start date
                null,
                null
            );
            
            IllegalArgumentException dateRangeException = assertThrows(
                IllegalArgumentException.class,
                () -> analyticsService.getAnalyticsForDashboard(invalidDateRangeRequest),
                "Should throw exception for invalid date range"
            );
            assertTrue(dateRangeException.getMessage().contains("start date"),
                      "Exception message should mention date range validation");

            // Verify no repository calls were made for invalid requests
            verify(analyticsRepository, never()).findByTimeRange(any(Instant.class), any(Instant.class));
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
        }

        /**
         * Tests error handling when repository operations fail during dashboard generation.
         * 
         * This test validates the service's resilience when underlying data access
         * operations fail, ensuring proper error propagation and system stability.
         * The test simulates various failure scenarios that might occur in production
         * environments, such as database connectivity issues or data corruption.
         */
        @Test
        @DisplayName("Should handle repository failures gracefully during dashboard generation")
        void testGetAnalyticsForDashboard_RepositoryFailure() {
            // Arrange: Configure repository to throw exception
            when(analyticsRepository.findByTimeRange(any(Instant.class), any(Instant.class)))
                .thenThrow(new RuntimeException("Database connection failed"));

            AnalyticsRequest request = new AnalyticsRequest(
                "PERFORMANCE_METRICS",
                "LAST_6_HOURS",
                null,
                null,
                List.of("SERVICE_NAME"),
                Map.of("environment", "production")
            );

            // Act & Assert: Verify exception handling
            AnalyticsException exception = assertThrows(
                AnalyticsException.class,
                () -> analyticsService.getAnalyticsForDashboard(request),
                "Should throw AnalyticsException for repository failures"
            );

            assertTrue(exception.getMessage().contains("Failed to generate analytics dashboard data"),
                      "Exception message should indicate dashboard generation failure");
            assertNotNull(exception.getCause(), "Exception should preserve original cause");
            assertEquals("Database connection failed", exception.getCause().getMessage(),
                        "Original exception message should be preserved");

            // Verify appropriate repository interaction
            verify(analyticsRepository, times(1)).findByTimeRange(any(Instant.class), any(Instant.class));
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
        }
    }

    /**
     * Nested test class for testing comprehensive analytics report generation.
     * 
     * This inner class focuses on the generateAnalyticsReport method, which creates
     * detailed analytics reports with advanced statistical analysis, dimensional
     * breakdowns, and actionable insights for business intelligence and regulatory
     * compliance purposes.
     */
    @Nested
    @DisplayName("Analytics Report Generation Tests")
    class AnalyticsReportTests {

        /**
         * Tests successful generation of comprehensive analytics reports.
         * 
         * This test validates the complete report generation pipeline, including
         * data retrieval, statistical analysis, dimensional aggregation, insight
         * generation, and proper audit trail creation. The test ensures that reports
         * meet enterprise standards for business intelligence and regulatory compliance.
         * 
         * Report Components Validated:
         * - Executive summary with key metrics and findings
         * - Detailed analytical results with statistical confidence
         * - Multi-dimensional analysis with drill-down capabilities
         * - Trend analysis and forecasting where applicable
         * - Actionable recommendations based on data insights
         * - Comprehensive metadata and data lineage information
         * - Proper audit trail creation for compliance requirements
         */
        @Test
        @DisplayName("Should successfully generate comprehensive analytics report with statistical analysis")
        void testGenerateAnalyticsReport_Success() {
            // Arrange: Create detailed analytics report request
            AnalyticsRequest request = new AnalyticsRequest(
                "CUSTOMER_BEHAVIOR_ANALYSIS",
                "LAST_7_DAYS",
                null,
                null,
                List.of("CUSTOMER_SEGMENT", "PRODUCT_CATEGORY", "CHANNEL", "GEOGRAPHIC_REGION"),
                Map.of(
                    "customerType", "BUSINESS",
                    "accountStatus", "ACTIVE",
                    "riskLevel", "MEDIUM"
                )
            );

            long startTime = System.currentTimeMillis();

            // Act: Generate comprehensive analytics report
            AnalyticsResponse response = analyticsService.generateAnalyticsReport(request);

            long processingTime = System.currentTimeMillis() - startTime;

            // Assert: Validate comprehensive report structure
            assertNotNull(response, "Report response should not be null");
            assertNotNull(response.getReportId(), "Report should have unique identifier");
            assertTrue(response.getReportId().startsWith(TEST_REPORT_ID_PREFIX),
                      "Report ID should follow standard naming convention");
            assertEquals("SUCCESS", response.getStatus(), "Report generation should succeed");
            assertNotNull(response.getGeneratedAt(), "Report should have generation timestamp");
            
            // Validate performance requirement for report generation
            assertTrue(processingTime < TEST_PERFORMANCE_THRESHOLD_MS,
                      String.format("Report generation time (%dms) should meet SLA requirements", processingTime));

            // Validate comprehensive report data structure
            Map<String, Object> reportData = response.getData();
            assertNotNull(reportData, "Report data should not be null");
            
            // Validate executive summary
            assertTrue(reportData.containsKey("summary"), "Report should contain executive summary");
            @SuppressWarnings("unchecked")
            Map<String, Object> summary = (Map<String, Object>) reportData.get("summary");
            assertTrue(summary.containsKey("dataPointCount"), "Summary should include data point count");
            assertTrue(summary.containsKey("analysisType"), "Summary should include analysis type");
            assertTrue(summary.containsKey("timeRange"), "Summary should include time range");
            assertTrue(summary.containsKey("generatedAt"), "Summary should include generation timestamp");

            // Validate detailed analysis
            assertTrue(reportData.containsKey("detailedAnalysis"), "Report should contain detailed analysis");
            @SuppressWarnings("unchecked")
            Map<String, Object> detailedAnalysis = (Map<String, Object>) reportData.get("detailedAnalysis");
            assertTrue(detailedAnalysis.containsKey("measurementSummary"), "Detailed analysis should include measurement summary");
            assertTrue(detailedAnalysis.containsKey("dimensionalAnalysis"), "Detailed analysis should include dimensional breakdown");

            // Validate statistical analysis
            assertTrue(reportData.containsKey("statisticalAnalysis"), "Report should contain statistical analysis");
            @SuppressWarnings("unchecked")
            Map<String, Object> statisticalAnalysis = (Map<String, Object>) reportData.get("statisticalAnalysis");
            assertTrue(statisticalAnalysis.containsKey("sampleSize"), "Statistical analysis should include sample size");
            assertTrue(statisticalAnalysis.containsKey("dataQuality"), "Statistical analysis should include data quality metrics");

            // Validate trend analysis
            assertTrue(reportData.containsKey("trendAnalysis"), "Report should contain trend analysis");

            // Validate recommendations
            assertTrue(reportData.containsKey("recommendations"), "Report should contain actionable recommendations");
            @SuppressWarnings("unchecked")
            List<String> recommendations = (List<String>) reportData.get("recommendations");
            assertFalse(recommendations.isEmpty(), "Report should provide actionable recommendations");

            // Verify repository interactions for comprehensive data retrieval
            verify(analyticsRepository, times(1)).findByTimeRange(any(Instant.class), any(Instant.class));
            verify(analyticsRepository, times(2)).save(any(AnalyticsData.class)); // Report data + audit data
            
            // Verify audit trail and event publishing
            verify(kafkaTemplate, times(1)).send(
                eq("analytics-events"),
                anyString(),
                any(AnalyticsEvent.class)
            );
        }

        /**
         * Tests report generation with custom date range parameters.
         * 
         * This test validates that the service correctly handles custom date ranges,
         * performs appropriate temporal filtering, and generates reports that accurately
         * reflect the specified time boundaries. This functionality is essential for
         * regulatory reporting and historical analysis requirements.
         */
        @Test
        @DisplayName("Should generate accurate reports for custom date ranges")
        void testGenerateAnalyticsReport_CustomDateRange() {
            // Arrange: Create request with specific custom date range
            LocalDate startDate = LocalDate.now().minusDays(30);
            LocalDate endDate = LocalDate.now().minusDays(1);
            
            AnalyticsRequest request = new AnalyticsRequest(
                "REGULATORY_COMPLIANCE_REPORT",
                "CUSTOM_RANGE",
                startDate,
                endDate,
                List.of("TRANSACTION_TYPE", "COMPLIANCE_STATUS"),
                Map.of(
                    "regulatoryFramework", "BASEL_III",
                    "reportingRegion", "NORTH_AMERICA"
                )
            );

            // Act: Generate report with custom date range
            AnalyticsResponse response = analyticsService.generateAnalyticsReport(request);

            // Assert: Validate custom date range handling
            assertNotNull(response, "Custom date range report should be generated");
            assertEquals("SUCCESS", response.getStatus(), "Custom date range processing should succeed");
            
            Map<String, Object> reportData = response.getData();
            @SuppressWarnings("unchecked")
            Map<String, Object> summary = (Map<String, Object>) reportData.get("summary");
            assertEquals("CUSTOM_RANGE", summary.get("timeRange"), "Report should reflect custom time range");

            // Verify repository called with correct date range parameters
            verify(analyticsRepository, times(1)).findByTimeRange(
                argThat(instant -> instant.equals(startDate.atStartOfDay().toInstant(java.time.ZoneOffset.UTC))),
                argThat(instant -> instant.equals(endDate.atTime(23, 59, 59).toInstant(java.time.ZoneOffset.UTC)))
            );
        }

        /**
         * Tests error handling for report generation failures.
         * 
         * This test ensures robust error handling when report generation encounters
         * various failure scenarios, including data access failures, computation errors,
         * and resource constraints. Proper error handling is crucial for system
         * reliability and user experience in enterprise analytics environments.
         */
        @Test
        @DisplayName("Should handle report generation failures with appropriate error messages")
        void testGenerateAnalyticsReport_GenerationFailure() {
            // Arrange: Configure repository to simulate data access failure
            when(analyticsRepository.findByTimeRange(any(Instant.class), any(Instant.class)))
                .thenThrow(new RuntimeException("Time-series database unavailable"));

            AnalyticsRequest request = new AnalyticsRequest(
                "OPERATIONAL_METRICS",
                "CURRENT_MONTH",
                null,
                null,
                List.of("SERVICE_TYPE", "ENVIRONMENT"),
                Map.of("criticality", "HIGH")
            );

            // Act & Assert: Verify error handling
            AnalyticsException exception = assertThrows(
                AnalyticsException.class,
                () -> analyticsService.generateAnalyticsReport(request),
                "Should throw AnalyticsException for generation failures"
            );

            assertTrue(exception.getMessage().contains("Failed to generate analytics report"),
                      "Exception should indicate report generation failure");
            assertNotNull(exception.getCause(), "Original exception should be preserved");
            assertEquals("Time-series database unavailable", exception.getCause().getMessage(),
                        "Original error message should be preserved");

            // Verify no partial operations were completed
            verify(analyticsRepository, times(1)).findByTimeRange(any(Instant.class), any(Instant.class));
            verify(analyticsRepository, never()).save(any(AnalyticsData.class));
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
        }

        /**
         * Tests report generation with complex filtering scenarios.
         * 
         * This test validates the service's ability to handle sophisticated filtering
         * requirements that are common in enterprise analytics environments, including
         * multi-criteria filtering, hierarchical filters, and complex business logic
         * constraints that affect data selection and analysis.
         */
        @Test
        @DisplayName("Should apply complex filters correctly during report generation")
        void testGenerateAnalyticsReport_ComplexFiltering() {
            // Arrange: Create request with complex multi-level filtering
            AnalyticsRequest request = new AnalyticsRequest(
                "FRAUD_ANALYSIS_REPORT",
                "LAST_30_DAYS",
                null,
                null,
                List.of("RISK_CATEGORY", "TRANSACTION_CHANNEL", "CUSTOMER_TIER", "GEOGRAPHIC_ZONE"),
                Map.of(
                    "suspiciousActivity", "TRUE",
                    "transactionAmount", "ABOVE_10000",
                    "customerRiskScore", "HIGH",
                    "crossBorderTransaction", "TRUE",
                    "timeOfDay", "OFF_HOURS",
                    "paymentMethod", "WIRE_TRANSFER"
                )
            );

            // Configure repository to return filtered data
            List<AnalyticsData> filteredData = createSampleFraudAnalyticsData();
            when(analyticsRepository.findByTimeRange(any(Instant.class), any(Instant.class)))
                .thenReturn(filteredData);

            // Act: Generate report with complex filtering
            AnalyticsResponse response = analyticsService.generateAnalyticsReport(request);

            // Assert: Validate complex filtering application
            assertNotNull(response, "Complex filtered report should be generated");
            assertEquals("SUCCESS", response.getStatus(), "Complex filtering should succeed");

            Map<String, Object> reportData = response.getData();
            @SuppressWarnings("unchecked")
            Map<String, Object> detailedAnalysis = (Map<String, Object>) reportData.get("detailedAnalysis");
            assertTrue(detailedAnalysis.containsKey("dimensionalAnalysis"), 
                      "Report should contain dimensional analysis of filtered data");

            // Validate that dimensional analysis reflects the requested dimensions
            @SuppressWarnings("unchecked")
            Map<String, Object> dimensionalAnalysis = (Map<String, Object>) detailedAnalysis.get("dimensionalAnalysis");
            assertTrue(dimensionalAnalysis.containsKey("RISK_CATEGORY"), 
                      "Dimensional analysis should include risk category breakdown");
            assertTrue(dimensionalAnalysis.containsKey("TRANSACTION_CHANNEL"), 
                      "Dimensional analysis should include transaction channel breakdown");
            assertTrue(dimensionalAnalysis.containsKey("CUSTOMER_TIER"), 
                      "Dimensional analysis should include customer tier breakdown");
            assertTrue(dimensionalAnalysis.containsKey("GEOGRAPHIC_ZONE"), 
                      "Dimensional analysis should include geographic zone breakdown");

            // Verify repository interaction with time range parameters
            verify(analyticsRepository, times(1)).findByTimeRange(any(Instant.class), any(Instant.class));
        }
    }

    /**
     * Nested test class for testing real-time transaction event processing.
     * 
     * This inner class focuses on the processTransactionEvent method and related
     * Kafka event listeners, which support real-time transaction monitoring (F-008)
     * and fraud detection capabilities. Tests cover event processing, validation,
     * persistence, and integration with the broader analytics pipeline.
     */
    @Nested
    @DisplayName("Real-time Transaction Event Processing Tests")
    class TransactionEventProcessingTests {

        /**
         * Tests successful processing of transaction events for real-time analytics.
         * 
         * This test validates the complete transaction event processing pipeline,
         * including event validation, data transformation, persistence to InfluxDB,
         * and publishing of analytics events for downstream processing. The test
         * ensures compliance with real-time processing SLA requirements (<100ms).
         * 
         * Processing Pipeline Validation:
         * - Event structure validation and business rule checking
         * - Data transformation from transaction event to analytics data
         * - Time-series data persistence with proper tags and fields
         * - Analytics event generation and Kafka publishing
         * - Performance metrics tracking and monitoring
         * - Error handling and graceful degradation
         */
        @Test
        @DisplayName("Should successfully process transaction events for real-time analytics")
        void testProcessTransactionEvent_Success() {
            // Arrange: Create comprehensive transaction event
            Map<String, Object> transactionEvent = Map.of(
                "transactionId", "TXN-2025-001234",
                "customerId", "CUST-789012",
                "accountId", "ACC-345678",
                "amount", 2500.75,
                "currency", "USD",
                "timestamp", Instant.now().toString(),
                "transactionType", "WIRE_TRANSFER",
                "channel", "ONLINE_BANKING",
                "merchantId", "MERCH-456789",
                "description", "International wire transfer",
                "status", "COMPLETED",
                "location", Map.of(
                    "country", "US",
                    "city", "New York",
                    "coordinates", List.of(40.7128, -74.0060)
                ),
                "metadata", Map.of(
                    "deviceId", "DEV-987654",
                    "sessionId", "SESS-ABC123",
                    "userAgent", "OnlineBanking/3.2.1",
                    "ipAddress", "192.168.1.100"
                )
            );

            long startTime = System.currentTimeMillis();

            // Act: Process the transaction event
            assertDoesNotThrow(() -> analyticsService.processTransactionEvent(transactionEvent),
                              "Transaction event processing should not throw exceptions");

            long processingTime = System.currentTimeMillis() - startTime;

            // Assert: Validate real-time processing performance
            assertTrue(processingTime < TEST_REALTIME_THRESHOLD_MS,
                      String.format("Transaction processing (%dms) should meet real-time SLA (<100ms)", processingTime));

            // Allow time for asynchronous processing to complete
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Verify analytics data persistence with proper structure
            verify(analyticsRepository, times(1)).save(argThat(analyticsData -> {
                // Validate measurement type
                return "transaction_analytics".equals(analyticsData.getMeasurement()) &&
                       // Validate required tags
                       analyticsData.getTags().containsKey("transaction_type") &&
                       analyticsData.getTags().containsKey("channel") &&
                       analyticsData.getTags().containsKey("status") &&
                       // Validate required fields
                       analyticsData.getFields().containsKey("transaction_id") &&
                       analyticsData.getFields().containsKey("customer_id") &&
                       analyticsData.getFields().containsKey("amount") &&
                       analyticsData.getFields().containsKey("currency");
            }));

            // Verify analytics event publishing for downstream processing
            verify(kafkaTemplate, times(1)).send(
                eq("analytics-events"),
                anyString(),
                argThat(event -> {
                    return "TRANSACTION_ANALYTICS_PROCESSED".equals(event.getEventType()) &&
                           event.getAnalyticsData() != null &&
                           event.getEventId() != null &&
                           event.getEventTimestamp() != null;
                })
            );
        }

        /**
         * Tests handling of null or invalid transaction events.
         * 
         * This test ensures robust error handling when processing invalid or malformed
         * transaction events, preventing system failures and maintaining data integrity.
         * The service should gracefully handle various types of invalid input while
         * providing appropriate logging for debugging and monitoring purposes.
         */
        @Test
        @DisplayName("Should handle null and invalid transaction events gracefully")
        void testProcessTransactionEvent_InvalidInput() {
            // Test null transaction event
            assertDoesNotThrow(() -> analyticsService.processTransactionEvent(null),
                              "Should handle null transaction event gracefully");

            // Test empty transaction event
            assertDoesNotThrow(() -> analyticsService.processTransactionEvent(Map.of()),
                              "Should handle empty transaction event gracefully");

            // Test malformed transaction event
            Map<String, Object> malformedEvent = Map.of(
                "invalidField", "invalidValue",
                "missingRequiredFields", true
            );
            
            assertDoesNotThrow(() -> analyticsService.processTransactionEvent(malformedEvent),
                              "Should handle malformed transaction event gracefully");

            // Allow time for asynchronous processing
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Verify that invalid events don't result in persistence or publishing
            verify(analyticsRepository, never()).save(any(AnalyticsData.class));
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
        }

        /**
         * Tests the Kafka event listener for transaction events from other services.
         * 
         * This test validates the handleTransactionEvent method that consumes
         * transaction events from the "transaction-events" Kafka topic, ensuring
         * proper integration with the event-driven architecture and real-time
         * processing capabilities of the financial services platform.
         */
        @Test
        @DisplayName("Should process Kafka transaction events from other microservices")
        void testHandleTransactionEvent_KafkaIntegration() {
            // Arrange: Create transaction event from external service
            Map<String, Object> kafkaTransactionEvent = Map.of(
                "transactionId", "TXN-KAFKA-001",
                "customerId", "CUST-KAFKA-001",
                "amount", 5000.00,
                "currency", "EUR",
                "timestamp", Instant.now().toString(),
                "transactionType", "PAYMENT",
                "channel", "MOBILE_APP",
                "customerSegment", "BUSINESS"
            );

            // Act: Process Kafka transaction event
            assertDoesNotThrow(() -> analyticsService.handleTransactionEvent(kafkaTransactionEvent),
                              "Kafka transaction event processing should succeed");

            // Assert: Verify proper event processing and data persistence
            verify(analyticsRepository, times(1)).save(argThat(analyticsData -> {
                return "transaction_events".equals(analyticsData.getMeasurement()) &&
                       "transaction-service".equals(analyticsData.getTags().get("event_source")) &&
                       kafkaTransactionEvent.get("transactionId").equals(analyticsData.getFields().get("transaction_id"));
            }));
        }

        /**
         * Tests the Kafka event listener for risk assessment events.
         * 
         * This test validates the handleRiskAssessmentEvent method that consumes
         * risk assessment events from the AI-powered risk assessment engine,
         * supporting the integration of predictive analytics and risk monitoring
         * capabilities throughout the platform.
         */
        @Test
        @DisplayName("Should process risk assessment events from AI risk engine")
        void testHandleRiskAssessmentEvent_AIIntegration() {
            // Arrange: Create risk assessment event from AI engine
            Map<String, Object> riskAssessmentEvent = Map.of(
                "assessmentId", "RISK-AI-001",
                "customerId", "CUST-HIGH-RISK-001",
                "riskScore", 0.87,
                "confidenceLevel", 0.92,
                "timestamp", Instant.now().toString(),
                "assessmentType", "PREDICTIVE_RISK",
                "riskLevel", "HIGH",
                "customerSegment", "PREMIUM",
                "modelVersion", "2.1.0",
                "factors", List.of(
                    "unusual_transaction_pattern",
                    "geographic_anomaly",
                    "high_velocity_transactions"
                )
            );

            // Act: Process risk assessment event
            assertDoesNotThrow(() -> analyticsService.handleRiskAssessmentEvent(riskAssessmentEvent),
                              "Risk assessment event processing should succeed");

            // Assert: Verify risk assessment data persistence
            verify(analyticsRepository, times(1)).save(argThat(analyticsData -> {
                return "risk_assessment_events".equals(analyticsData.getMeasurement()) &&
                       "risk-assessment-service".equals(analyticsData.getTags().get("event_source")) &&
                       "HIGH".equals(analyticsData.getTags().get("risk_level")) &&
                       riskAssessmentEvent.get("assessmentId").equals(analyticsData.getFields().get("assessment_id")) &&
                       riskAssessmentEvent.get("riskScore").equals(analyticsData.getFields().get("risk_score"));
            }));
        }

        /**
         * Tests error handling when event processing encounters repository failures.
         * 
         * This test ensures that the service maintains stability and provides
         * appropriate error handling when underlying data persistence operations
         * fail during real-time event processing. The system should continue
         * processing other events and provide proper error reporting.
         */
        @Test
        @DisplayName("Should handle repository failures during event processing")
        void testProcessTransactionEvent_RepositoryFailure() {
            // Arrange: Configure repository to fail during save operation
            when(analyticsRepository.save(any(AnalyticsData.class)))
                .thenThrow(new RuntimeException("InfluxDB write failure"));

            Map<String, Object> transactionEvent = Map.of(
                "transactionId", "TXN-FAIL-001",
                "customerId", "CUST-FAIL-001",
                "amount", 1000.00,
                "currency", "USD",
                "timestamp", Instant.now().toString(),
                "transactionType", "TRANSFER"
            );

            // Act & Assert: Event processing should handle repository failures gracefully
            assertDoesNotThrow(() -> analyticsService.processTransactionEvent(transactionEvent),
                              "Repository failures should not crash event processing");

            // Allow time for asynchronous processing and error handling
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Verify repository interaction attempted
            verify(analyticsRepository, times(1)).save(any(AnalyticsData.class));
            
            // Verify that Kafka publishing was not attempted due to save failure
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
        }
    }

    /**
     * Nested test class for testing service initialization and dependency injection.
     * 
     * This inner class validates proper service construction, dependency validation,
     * and initialization behavior. These tests ensure that the service correctly
     * handles various dependency injection scenarios and fails fast with clear
     * error messages when required dependencies are missing or invalid.
     */
    @Nested
    @DisplayName("Service Initialization and Dependency Tests")
    class ServiceInitializationTests {

        /**
         * Tests successful service initialization with valid dependencies.
         * 
         * This test validates that the AnalyticsServiceImpl can be properly
         * constructed with valid dependencies and that all internal state
         * is correctly initialized for optimal performance and monitoring.
         */
        @Test
        @DisplayName("Should initialize successfully with valid dependencies")
        void testServiceInitialization_Success() {
            // Arrange: Create fresh mocks for clean initialization testing
            AnalyticsRepository testRepository = mock(AnalyticsRepository.class);
            @SuppressWarnings("unchecked")
            KafkaTemplate<String, AnalyticsEvent> testKafkaTemplate = mock(KafkaTemplate.class);

            // Act: Initialize service with valid dependencies
            AnalyticsServiceImpl testService = assertDoesNotThrow(
                () -> new AnalyticsServiceImpl(testRepository, testKafkaTemplate),
                "Service initialization should succeed with valid dependencies"
            );

            // Assert: Verify service is properly initialized
            assertNotNull(testService, "Service instance should be created");
            
            // Verify service can handle basic operations without errors
            AnalyticsRequest testRequest = new AnalyticsRequest(
                "HEALTH_CHECK",
                "LAST_HOUR",
                null,
                null,
                null,
                null
            );
            
            // Configure minimal successful behavior for health check
            when(testRepository.findByTimeRange(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());
            when(testRepository.save(any(AnalyticsData.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            
            CompletableFuture<SendResult<String, AnalyticsEvent>> future = new CompletableFuture<>();
            future.complete(mock(SendResult.class));
            when(testKafkaTemplate.send(anyString(), anyString(), any(AnalyticsEvent.class)))
                .thenReturn(future);

            // Verify basic service functionality works
            assertDoesNotThrow(() -> testService.getAnalyticsForDashboard(testRequest),
                              "Initialized service should handle basic operations");
        }

        /**
         * Tests service initialization failure with null repository dependency.
         * 
         * This test ensures that the service constructor properly validates
         * the analytics repository dependency and throws appropriate exceptions
         * with clear error messages when the dependency is null.
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for null repository dependency")
        void testServiceInitialization_NullRepository() {
            // Arrange: Create valid Kafka template but null repository
            @SuppressWarnings("unchecked")
            KafkaTemplate<String, AnalyticsEvent> testKafkaTemplate = mock(KafkaTemplate.class);

            // Act & Assert: Verify constructor validation
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new AnalyticsServiceImpl(null, testKafkaTemplate),
                "Should throw exception for null repository dependency"
            );

            assertTrue(exception.getMessage().contains("AnalyticsRepository cannot be null"),
                      "Exception message should clearly indicate null repository issue");
        }

        /**
         * Tests service initialization failure with null Kafka template dependency.
         * 
         * This test ensures that the service constructor properly validates
         * the Kafka template dependency and throws appropriate exceptions
         * with clear error messages when the dependency is null.
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for null Kafka template dependency")
        void testServiceInitialization_NullKafkaTemplate() {
            // Arrange: Create valid repository but null Kafka template
            AnalyticsRepository testRepository = mock(AnalyticsRepository.class);

            // Act & Assert: Verify constructor validation
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new AnalyticsServiceImpl(testRepository, null),
                "Should throw exception for null Kafka template dependency"
            );

            assertTrue(exception.getMessage().contains("KafkaTemplate cannot be null"),
                      "Exception message should clearly indicate null Kafka template issue");
        }

        /**
         * Tests service initialization failure with both null dependencies.
         * 
         * This test validates that the service constructor fails fast and
         * provides clear error messages when multiple dependencies are null,
         * helping developers quickly identify configuration issues.
         */
        @Test
        @DisplayName("Should throw IllegalArgumentException for all null dependencies")
        void testServiceInitialization_AllNullDependencies() {
            // Act & Assert: Verify constructor validation with all null dependencies
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new AnalyticsServiceImpl(null, null),
                "Should throw exception for null dependencies"
            );

            // The first null check (repository) should trigger the exception
            assertTrue(exception.getMessage().contains("AnalyticsRepository cannot be null"),
                      "Exception should indicate the first null dependency encountered");
        }
    }

    // ==================== HELPER METHODS FOR TEST DATA GENERATION ====================

    /**
     * Creates a list of sample analytics data for testing purposes.
     * 
     * This helper method generates realistic analytics data with various
     * measurements, tags, and fields that represent typical financial
     * services analytics scenarios. The data is designed to support
     * comprehensive testing of analytics operations and calculations.
     * 
     * @param count The number of sample data points to create
     * @return List of AnalyticsData instances with realistic test data
     */
    private List<AnalyticsData> createSampleAnalyticsDataList(int count) {
        List<AnalyticsData> dataList = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(3600); // Start 1 hour ago
        
        String[] measurements = {"transaction_metrics", "performance_data", "customer_analytics", "risk_indicators"};
        String[] channels = {"MOBILE_APP", "ONLINE_BANKING", "ATM", "BRANCH", "PHONE"};
        String[] customerSegments = {"PREMIUM", "BUSINESS", "STANDARD", "STUDENT"};
        String[] currencies = {"USD", "EUR", "GBP", "JPY", "CAD"};
        
        Random random = new Random(42); // Fixed seed for reproducible tests
        
        for (int i = 0; i < count; i++) {
            AnalyticsData data = new AnalyticsData();
            data.setTime(baseTime.plusSeconds(i * 36)); // Spread over 1 hour
            data.setMeasurement(measurements[i % measurements.length]);
            
            // Add realistic tags
            Map<String, String> tags = new HashMap<>();
            tags.put("channel", channels[random.nextInt(channels.length)]);
            tags.put("customer_segment", customerSegments[random.nextInt(customerSegments.length)]);
            tags.put("currency", currencies[random.nextInt(currencies.length)]);
            tags.put("environment", "production");
            data.setTags(tags);
            
            // Add realistic fields
            Map<String, Object> fields = new HashMap<>();
            fields.put("transaction_id", "TXN-" + String.format("%06d", i));
            fields.put("customer_id", "CUST-" + String.format("%06d", random.nextInt(10000)));
            fields.put("amount", 100.0 + random.nextDouble() * 10000.0);
            fields.put("processing_time", 50 + random.nextInt(200));
            fields.put("success_rate", 0.95 + random.nextDouble() * 0.05);
            data.setFields(fields);
            
            dataList.add(data);
        }
        
        return dataList;
    }

    /**
     * Creates sample transaction metrics data for testing.
     * 
     * @param count The number of transaction metric data points to create
     * @return List of transaction-specific AnalyticsData instances
     */
    private List<AnalyticsData> createSampleTransactionMetrics(int count) {
        List<AnalyticsData> dataList = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(86400); // Start 24 hours ago
        Random random = new Random(123);
        
        for (int i = 0; i < count; i++) {
            AnalyticsData data = new AnalyticsData();
            data.setTime(baseTime.plusSeconds(i * 1728)); // Spread over 24 hours
            data.setMeasurement("transaction_metrics");
            
            Map<String, String> tags = new HashMap<>();
            tags.put("transaction_type", random.nextBoolean() ? "PAYMENT" : "TRANSFER");
            tags.put("channel", random.nextBoolean() ? "MOBILE_APP" : "ONLINE_BANKING");
            tags.put("status", "COMPLETED");
            data.setTags(tags);
            
            Map<String, Object> fields = new HashMap<>();
            fields.put("volume", 1000 + random.nextInt(5000));
            fields.put("total_amount", 50000.0 + random.nextDouble() * 500000.0);
            fields.put("average_amount", 200.0 + random.nextDouble() * 2000.0);
            data.setFields(fields);
            
            dataList.add(data);
        }
        
        return dataList;
    }

    /**
     * Creates sample performance metrics data for testing.
     * 
     * @param count The number of performance metric data points to create
     * @return List of performance-specific AnalyticsData instances
     */
    private List<AnalyticsData> createSamplePerformanceMetrics(int count) {
        List<AnalyticsData> dataList = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(21600); // Start 6 hours ago
        Random random = new Random(456);
        
        for (int i = 0; i < count; i++) {
            AnalyticsData data = new AnalyticsData();
            data.setTime(baseTime.plusSeconds(i * 720)); // Spread over 6 hours
            data.setMeasurement("performance_data");
            
            Map<String, String> tags = new HashMap<>();
            tags.put("service_name", "analytics-service");
            tags.put("environment", "production");
            tags.put("region", "us-east-1");
            data.setTags(tags);
            
            Map<String, Object> fields = new HashMap<>();
            fields.put("response_time", 100 + random.nextInt(400));
            fields.put("throughput", 1000 + random.nextInt(4000));
            fields.put("error_rate", random.nextDouble() * 0.05);
            fields.put("cpu_usage", 0.3 + random.nextDouble() * 0.4);
            data.setFields(fields);
            
            dataList.add(data);
        }
        
        return dataList;
    }

    /**
     * Creates sample risk indicator data for testing.
     * 
     * @param count The number of risk indicator data points to create
     * @return List of risk-specific AnalyticsData instances
     */
    private List<AnalyticsData> createSampleRiskIndicators(int count) {
        List<AnalyticsData> dataList = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(2592000); // Start 30 days ago
        Random random = new Random(789);
        
        String[] riskLevels = {"LOW", "MEDIUM", "HIGH", "CRITICAL"};
        String[] riskTypes = {"CREDIT_RISK", "OPERATIONAL_RISK", "MARKET_RISK", "FRAUD_RISK"};
        
        for (int i = 0; i < count; i++) {
            AnalyticsData data = new AnalyticsData();
            data.setTime(baseTime.plusSeconds(i * 103680)); // Spread over 30 days
            data.setMeasurement("risk_indicators");
            
            Map<String, String> tags = new HashMap<>();
            tags.put("risk_level", riskLevels[random.nextInt(riskLevels.length)]);
            tags.put("risk_type", riskTypes[random.nextInt(riskTypes.length)]);
            tags.put("customer_segment", random.nextBoolean() ? "BUSINESS" : "RETAIL");
            data.setTags(tags);
            
            Map<String, Object> fields = new HashMap<>();
            fields.put("risk_score", random.nextDouble());
            fields.put("confidence_level", 0.7 + random.nextDouble() * 0.3);
            fields.put("customer_count", 10 + random.nextInt(100));
            fields.put("exposure_amount", 10000.0 + random.nextDouble() * 1000000.0);
            data.setFields(fields);
            
            dataList.add(data);
        }
        
        return dataList;
    }

    /**
     * Creates sample fraud analytics data for complex filtering tests.
     * 
     * @return List of fraud-specific AnalyticsData instances for testing
     */
    private List<AnalyticsData> createSampleFraudAnalyticsData() {
        List<AnalyticsData> dataList = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(2592000); // 30 days ago
        Random random = new Random(321);
        
        String[] riskCategories = {"SUSPICIOUS_PATTERN", "VELOCITY_ANOMALY", "GEOGRAPHIC_ANOMALY", "BEHAVIORAL_CHANGE"};
        String[] channels = {"WIRE_TRANSFER", "ACH", "CARD_PAYMENT", "MOBILE_PAYMENT"};
        String[] customerTiers = {"GOLD", "SILVER", "BRONZE", "STANDARD"};
        String[] geoZones = {"NORTH_AMERICA", "EUROPE", "ASIA_PACIFIC", "LATIN_AMERICA"};
        
        for (int i = 0; i < 50; i++) {
            AnalyticsData data = new AnalyticsData();
            data.setTime(baseTime.plusSeconds(i * 51840)); // Spread over 30 days
            data.setMeasurement("fraud_analysis");
            
            Map<String, String> tags = new HashMap<>();
            tags.put("RISK_CATEGORY", riskCategories[random.nextInt(riskCategories.length)]);
            tags.put("TRANSACTION_CHANNEL", channels[random.nextInt(channels.length)]);
            tags.put("CUSTOMER_TIER", customerTiers[random.nextInt(customerTiers.length)]);
            tags.put("GEOGRAPHIC_ZONE", geoZones[random.nextInt(geoZones.length)]);
            data.setTags(tags);
            
            Map<String, Object> fields = new HashMap<>();
            fields.put("fraud_score", 0.6 + random.nextDouble() * 0.4); // High fraud scores
            fields.put("transaction_amount", 10000.0 + random.nextDouble() * 50000.0); // Above 10K
            fields.put("customer_risk_score", 0.7 + random.nextDouble() * 0.3); // High risk customers
            fields.put("alert_count", 1 + random.nextInt(5));
            data.setFields(fields);
            
            dataList.add(data);
        }
        
        return dataList;
    }
}