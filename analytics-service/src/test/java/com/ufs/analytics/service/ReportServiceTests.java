package com.ufs.analytics.service;

import com.ufs.analytics.service.impl.ReportServiceImpl;
import com.ufs.analytics.dto.ReportRequest;
import com.ufs.analytics.dto.ReportResponse;
import com.ufs.analytics.model.Report;
import com.ufs.analytics.repository.ReportRepository;
import com.ufs.analytics.model.AnalyticsData;
import com.ufs.analytics.exception.AnalyticsException;
import com.ufs.analytics.event.AnalyticsEvent;

import org.junit.jupiter.api.Test; // version 5.10.2
import org.junit.jupiter.api.BeforeEach; // version 5.10.2
import org.junit.jupiter.api.extension.ExtendWith; // version 5.10.2
import org.mockito.Mock; // version 5.11.0
import org.mockito.InjectMocks; // version 5.11.0
import org.mockito.junit.jupiter.MockitoExtension; // version 5.11.0
import org.springframework.kafka.core.KafkaTemplate; // version 3.2+
import org.springframework.data.domain.Page; // version 3.2.0
import org.springframework.data.domain.PageImpl; // version 3.2.0
import org.springframework.data.domain.PageRequest; // version 3.2.0
import org.springframework.data.domain.Pageable; // version 3.2.0
import org.springframework.data.domain.Sort; // version 3.2.0

import static org.assertj.core.api.Assertions.assertThat; // version 3.25.3
import static org.assertj.core.api.Assertions.assertThatThrownBy; // version 3.25.3
import static org.mockito.Mockito.when; // version 5.11.0
import static org.mockito.Mockito.verify; // version 5.11.0
import static org.mockito.Mockito.times; // version 5.11.0
import static org.mockito.Mockito.any; // version 5.11.0
import static org.mockito.Mockito.eq; // version 5.11.0
import static org.mockito.ArgumentMatchers.anyString; // version 5.11.0
import static org.mockito.ArgumentMatchers.anyLong; // version 5.11.0
import static org.mockito.Mockito.doThrow; // version 5.11.0
import static org.mockito.Mockito.never; // version 5.11.0

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Arrays;
import java.util.Collections;

/**
 * Comprehensive unit tests for the ReportService implementation.
 * 
 * This test class validates the service layer responsible for generating data for the 
 * predictive analytics dashboard (F-005), settlement reconciliation engine (F-012), 
 * and compliance control center (F-015) reports. The tests ensure proper functionality
 * across all critical business scenarios including success and failure cases.
 * 
 * <p><strong>Test Coverage:</strong></p>
 * <ul>
 *   <li><strong>Report Generation</strong> - Tests the complete report generation workflow
 *       including data validation, processing, persistence, and event publishing</li>
 *   <li><strong>Report Retrieval</strong> - Validates individual report retrieval by ID
 *       with proper error handling for non-existent reports</li>
 *   <li><strong>Report Listing</strong> - Tests paginated report listing functionality
 *       with proper pagination support and empty result handling</li>
 *   <li><strong>Error Handling</strong> - Comprehensive validation of exception scenarios
 *       including invalid requests, data access failures, and system errors</li>
 * </ul>
 * 
 * <p><strong>Testing Framework:</strong></p>
 * <ul>
 *   <li>JUnit 5.10.2 for test structure and lifecycle management</li>
 *   <li>Mockito 5.11.0 for mock object creation and behavior verification</li>
 *   <li>AssertJ 3.25.3 for fluent assertions and comprehensive validation</li>
 *   <li>Spring Boot Test framework for integration with Spring context</li>
 * </ul>
 * 
 * <p><strong>Test Data Standards:</strong></p>
 * <ul>
 *   <li>Realistic financial service data scenarios</li>
 *   <li>Comprehensive edge case coverage</li>
 *   <li>Proper mock configuration for external dependencies</li>
 *   <li>Consistent test data patterns across all test methods</li>
 * </ul>
 * 
 * <p><strong>Compliance and Quality Assurance:</strong></p>
 * <ul>
 *   <li>Validates requirements for F-005 Predictive Analytics Dashboard</li>
 *   <li>Ensures proper handling of F-012 Settlement Reconciliation Engine data</li>
 *   <li>Verifies compliance with F-015 Compliance Control Center reporting requirements</li>
 *   <li>Maintains audit trail integrity through comprehensive logging verification</li>
 * </ul>
 * 
 * @author UFS Analytics Service Team
 * @version 1.0
 * @since 2025-01-01
 * @see ReportService for the interface being tested
 * @see ReportServiceImpl for the implementation under test
 */
@ExtendWith(MockitoExtension.class)
public class ReportServiceTests {

    /**
     * Mock repository for database operations on Report entities.
     * 
     * This mock provides controlled responses for database operations during testing,
     * ensuring predictable behavior without requiring actual database connectivity.
     * The mock is configured to simulate various database scenarios including
     * successful operations, data not found conditions, and persistence failures.
     */
    @Mock
    private ReportRepository reportRepository;

    /**
     * Mock Kafka template for event publishing operations.
     * 
     * This mock allows verification of event publishing behavior without requiring
     * actual Kafka infrastructure during testing. It ensures that analytics events
     * are properly published when reports are generated or updated.
     */
    @Mock
    private KafkaTemplate<String, AnalyticsEvent> kafkaTemplate;

    /**
     * The service implementation under test with mocked dependencies injected.
     * 
     * This is the primary subject of testing, with all external dependencies
     * replaced by mock objects to ensure isolated unit testing. The service
     * implementation contains the business logic that is being validated.
     */
    @InjectMocks
    private ReportServiceImpl reportService;

    /**
     * Test fixture data for consistent testing across all test methods.
     * These fields are initialized in the setup method to provide standardized
     * test data for various testing scenarios.
     */
    private ReportRequest validReportRequest;
    private ReportRequest invalidReportRequest;
    private Report sampleReport;
    private ReportResponse expectedReportResponse;

    /**
     * Initializes mocks and test fixtures before each test method execution.
     * 
     * This method sets up the testing environment by creating standardized test data
     * and configuring mock objects with default behaviors. It ensures each test
     * starts with a clean, predictable state and consistent test fixtures.
     * 
     * <p><strong>Setup Activities:</strong></p>
     * <ul>
     *   <li>Creates valid and invalid ReportRequest objects for testing</li>
     *   <li>Initializes sample Report entities with realistic financial data</li>
     *   <li>Configures expected ReportResponse objects for assertion verification</li>
     *   <li>Sets up default mock behaviors for common scenarios</li>
     * </ul>
     * 
     * <p><strong>Test Data Characteristics:</strong></p>
     * <ul>
     *   <li>Realistic financial service report types and date ranges</li>
     *   <li>Valid and invalid data scenarios for comprehensive testing</li>
     *   <li>Consistent entity relationships and data integrity</li>
     *   <li>Proper timestamp handling for audit trail requirements</li>
     * </ul>
     */
    @BeforeEach
    public void setup() {
        // Initialize valid report request for successful test scenarios
        // This represents a typical regulatory compliance report request
        validReportRequest = new ReportRequest();
        validReportRequest.setReportType("REGULATORY_COMPLIANCE");
        validReportRequest.setStartDate(LocalDate.of(2025, 1, 1));
        validReportRequest.setEndDate(LocalDate.of(2025, 1, 31));
        validReportRequest.setFormat("PDF");

        // Initialize invalid report request for failure test scenarios
        // This request has a null report type to trigger validation failures
        invalidReportRequest = new ReportRequest();
        invalidReportRequest.setReportType(null); // Invalid: null report type
        invalidReportRequest.setStartDate(LocalDate.of(2025, 1, 1));
        invalidReportRequest.setEndDate(LocalDate.of(2025, 1, 31));
        invalidReportRequest.setFormat("PDF");

        // Initialize sample report entity representing a persisted report
        // This simulates a report that has been successfully generated and saved
        sampleReport = new Report();
        sampleReport.setId(1L);
        sampleReport.setName("Regulatory Compliance Report - 2025-01-01 to 2025-01-31");
        sampleReport.setDescription("Generated regulatory compliance report covering period from 2025-01-01 to 2025-01-31 in PDF format");
        sampleReport.setType("REGULATORY_COMPLIANCE");
        sampleReport.setContent("Report Content in PDF format\nGenerated at: 2025-01-15T10:30:00\nData Elements: 5\ncomplianceScore: 95.5\nviolationsCount: 0\nprocessedRecords: 0\ngenerationTimestamp: 2025-01-15T10:30:00\ndateRange: 30 days\nreportFormat: PDF\n".getBytes());
        sampleReport.setCreatedAt(LocalDateTime.of(2025, 1, 15, 10, 30, 0));
        sampleReport.setUpdatedAt(LocalDateTime.of(2025, 1, 15, 10, 30, 0));

        // Initialize expected report response for assertion verification
        // This represents the expected DTO structure returned by service methods
        expectedReportResponse = new ReportResponse();
        expectedReportResponse.setReportId("1");
        expectedReportResponse.setReportName("Regulatory Compliance Report - 2025-01-01 to 2025-01-31");
        expectedReportResponse.setReportType("REGULATORY_COMPLIANCE");
        expectedReportResponse.setGeneratedAt(LocalDateTime.of(2025, 1, 15, 10, 30, 0));
        expectedReportResponse.setContent("Report Content in PDF format\nGenerated at: 2025-01-15T10:30:00\nData Elements: 5\ncomplianceScore: 95.5\nviolationsCount: 0\nprocessedRecords: 0\ngenerationTimestamp: 2025-01-15T10:30:00\ndateRange: 30 days\nreportFormat: PDF\n");
        expectedReportResponse.setFormat("text/plain");
    }

    /**
     * Tests successful report generation functionality.
     * 
     * This test validates the complete report generation workflow including:
     * - Request validation and processing
     * - Data retrieval and business logic execution
     * - Report entity creation and persistence
     * - Response generation and event publishing
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid regulatory compliance report request with proper date range</li>
     *   <li>Successful repository save operation returning persisted entity</li>
     *   <li>Proper DTO conversion and response generation</li>
     *   <li>Analytics event publishing for downstream processing</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>Report response contains accurate data mapping from request</li>
     *   <li>Repository save method is called exactly once with proper entity</li>
     *   <li>Kafka template publishes analytics event for monitoring</li>
     *   <li>Response fields match expected values for audit trail</li>
     * </ul>
     * 
     * <p><strong>Business Requirements Validated:</strong></p>
     * <ul>
     *   <li>F-005 Predictive Analytics Dashboard data generation</li>
     *   <li>F-012 Settlement Reconciliation Engine report creation</li>
     *   <li>F-015 Compliance Control Center reporting accuracy</li>
     * </ul>
     */
    @Test
    public void testGenerateReport_Success() {
        // Given: Configure mock repository to return sample report when save is called
        // This simulates successful database persistence of the generated report
        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);

        // When: Generate report using valid request parameters
        // This triggers the complete report generation workflow
        ReportResponse result = reportService.generateReport(validReportRequest);

        // Then: Verify that the report response is not null and contains expected data
        assertThat(result).isNotNull();
        assertThat(result.getReportId()).isEqualTo("1");
        assertThat(result.getReportName()).isEqualTo("Regulatory Compliance Report - 2025-01-01 to 2025-01-31");
        assertThat(result.getReportType()).isEqualTo("REGULATORY_COMPLIANCE");
        assertThat(result.getGeneratedAt()).isEqualTo(LocalDateTime.of(2025, 1, 15, 10, 30, 0));
        assertThat(result.getFormat()).isEqualTo("text/plain");
        assertThat(result.getContent()).isNotNull();
        assertThat(result.getContent()).contains("Report Content in PDF format");
        assertThat(result.getContent()).contains("complianceScore: 95.5");
        assertThat(result.getContent()).contains("violationsCount: 0");

        // Verify that repository save was called exactly once with proper entity
        verify(reportRepository, times(1)).save(any(Report.class));

        // Verify that Kafka event was published for analytics processing
        verify(kafkaTemplate, times(1)).send(eq("analytics-events"), anyString(), any(AnalyticsEvent.class));
    }

    /**
     * Tests report generation failure when the request is invalid.
     * 
     * This test validates proper error handling for invalid report requests,
     * ensuring that the service properly validates input parameters and
     * throws appropriate exceptions with descriptive error messages.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Invalid report request with null report type</li>
     *   <li>Service should perform validation before processing</li>
     *   <li>Appropriate exception should be thrown with descriptive message</li>
     *   <li>No database operations should be performed for invalid requests</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>IllegalArgumentException is thrown for invalid requests</li>
     *   <li>Exception message clearly indicates the validation failure</li>
     *   <li>Repository save method is never called for invalid requests</li>
     *   <li>No analytics events are published for failed requests</li>
     * </ul>
     * 
     * <p><strong>Error Handling Requirements:</strong></p>
     * <ul>
     *   <li>Fail-fast validation to prevent resource waste</li>
     *   <li>Clear error messages for troubleshooting</li>
     *   <li>Proper exception types for different failure scenarios</li>
     *   <li>No side effects for invalid requests</li>
     * </ul>
     */
    @Test
    public void testGenerateReport_Failure() {
        // When & Then: Attempt to generate report with invalid request
        // This should throw IllegalArgumentException due to null report type
        assertThatThrownBy(() -> reportService.generateReport(invalidReportRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Report type is required and cannot be empty");

        // Verify that repository save was never called due to validation failure
        verify(reportRepository, never()).save(any(Report.class));

        // Verify that no Kafka event was published due to validation failure
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
    }

    /**
     * Tests retrieving a report by its ID successfully.
     * 
     * This test validates the report retrieval functionality including:
     * - ID validation and format checking
     * - Database query execution and result handling
     * - Entity to DTO conversion
     * - Response generation and field mapping
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid report ID representing an existing report</li>
     *   <li>Successful repository findById operation returning report entity</li>
     *   <li>Proper DTO conversion maintaining data integrity</li>
     *   <li>Complete response with all required fields populated</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>Report response contains accurate data from repository</li>
     *   <li>All fields are properly mapped from entity to DTO</li>
     *   <li>Repository findById is called with correct ID parameter</li>
     *   <li>Response structure matches expected format</li>
     * </ul>
     * 
     * <p><strong>Use Cases Supported:</strong></p>
     * <ul>
     *   <li>Dashboard report display and refresh operations</li>
     *   <li>Compliance audit trail reconstruction</li>
     *   <li>Report sharing and distribution workflows</li>
     *   <li>Historical data analysis and trend identification</li>
     * </ul>
     */
    @Test
    public void testGetReportById_Success() {
        // Given: Configure mock repository to return sample report for the specified ID
        // This simulates finding an existing report in the database
        when(reportRepository.findById(1L)).thenReturn(Optional.of(sampleReport));

        // When: Retrieve report by ID using valid report identifier
        ReportResponse result = reportService.getReportById("1");

        // Then: Verify that the report response contains expected data
        assertThat(result).isNotNull();
        assertThat(result.getReportId()).isEqualTo("1");
        assertThat(result.getReportName()).isEqualTo("Regulatory Compliance Report - 2025-01-01 to 2025-01-31");
        assertThat(result.getReportType()).isEqualTo("REGULATORY_COMPLIANCE");
        assertThat(result.getGeneratedAt()).isEqualTo(LocalDateTime.of(2025, 1, 15, 10, 30, 0));
        assertThat(result.getFormat()).isEqualTo("text/plain");
        assertThat(result.getContent()).isNotNull();
        assertThat(result.getContent()).contains("Report Content in PDF format");

        // Verify that repository findById was called with the correct ID
        verify(reportRepository, times(1)).findById(1L);
    }

    /**
     * Tests retrieving a non-existent report by ID.
     * 
     * This test validates proper error handling when attempting to retrieve
     * a report that does not exist in the system, ensuring that appropriate
     * exceptions are thrown with clear error messages.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid report ID format but representing non-existent report</li>
     *   <li>Repository findById returns empty Optional</li>
     *   <li>Service should throw RuntimeException with 'not found' message</li>
     *   <li>Error message should clearly indicate the missing report ID</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>RuntimeException is thrown for non-existent reports</li>
     *   <li>Exception message contains specific report ID that was not found</li>
     *   <li>Repository findById is called with correct non-existent ID</li>
     *   <li>No additional database operations are performed</li>
     * </ul>
     * 
     * <p><strong>Error Handling Requirements:</strong></p>
     * <ul>
     *   <li>Clear distinction between not found and system errors</li>
     *   <li>Helpful error messages for debugging and troubleshooting</li>
     *   <li>Consistent exception handling across all retrieval methods</li>
     *   <li>Proper logging for audit trail and monitoring</li>
     * </ul>
     */
    @Test
    public void testGetReportById_NotFound() {
        // Given: Configure mock repository to return empty Optional for non-existent ID
        // This simulates the case where a report with the specified ID does not exist
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then: Attempt to retrieve non-existent report
        // This should throw RuntimeException with 'not found' message
        assertThatThrownBy(() -> reportService.getReportById("999"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Report not found with ID: 999");

        // Verify that repository findById was called with the non-existent ID
        verify(reportRepository, times(1)).findById(999L);
    }

    /**
     * Tests retrieving all reports successfully with pagination.
     * 
     * This test validates the paginated report listing functionality including:
     * - Pagination parameter processing and validation
     * - Database query execution with pagination support
     * - Entity to DTO conversion for multiple reports
     * - Page metadata generation and response structure
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid pagination parameters (page 0, size 20, sorted by creation date)</li>
     *   <li>Repository returns paginated results with multiple reports</li>
     *   <li>Proper conversion of entity page to DTO page</li>
     *   <li>Complete page metadata for navigation support</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>Returned page contains expected number of reports</li>
     *   <li>All reports are properly converted to DTO format</li>
     *   <li>Page metadata is accurate (total elements, total pages, etc.)</li>
     *   <li>Repository findAll is called with correct pagination parameters</li>
     * </ul>
     * 
     * <p><strong>Pagination Features Tested:</strong></p>
     * <ul>
     *   <li>Configurable page sizes for different UI requirements</li>
     *   <li>Efficient navigation with total count and metadata</li>
     *   <li>Consistent ordering across page requests</li>
     *   <li>Proper handling of large result sets</li>
     * </ul>
     * 
     * <p><strong>Dashboard Integration:</strong></p>
     * <ul>
     *   <li>Supports F-005 Predictive Analytics Dashboard report listing</li>
     *   <li>Enables F-015 Compliance Control Center report management</li>
     *   <li>Facilitates F-012 Settlement Reconciliation Engine monitoring</li>
     * </ul>
     */
    @Test
    public void testGetAllReports_Success() {
        // Given: Create multiple sample reports for pagination testing
        Report report1 = new Report();
        report1.setId(1L);
        report1.setName("Risk Assessment Report");
        report1.setType("RISK_ASSESSMENT");
        report1.setContent("Risk assessment content".getBytes());
        report1.setCreatedAt(LocalDateTime.of(2025, 1, 15, 10, 30, 0));

        Report report2 = new Report();
        report2.setId(2L);
        report2.setName("Settlement Reconciliation Report");
        report2.setType("SETTLEMENT_RECONCILIATION");
        report2.setContent("Settlement reconciliation content".getBytes());
        report2.setCreatedAt(LocalDateTime.of(2025, 1, 15, 11, 0, 0));

        Report report3 = new Report();
        report3.setId(3L);
        report3.setName("Compliance Control Report");
        report3.setType("COMPLIANCE");
        report3.setContent("Compliance control content".getBytes());
        report3.setCreatedAt(LocalDateTime.of(2025, 1, 15, 11, 30, 0));

        // Create list of sample reports for pagination
        List<Report> reportList = Arrays.asList(report1, report2, report3);

        // Create pagination parameters for testing
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());

        // Create mock page response with the sample reports
        Page<Report> reportPage = new PageImpl<>(reportList, pageable, reportList.size());

        // Configure mock repository to return the paginated results
        when(reportRepository.findAll(pageable)).thenReturn(reportPage);

        // When: Retrieve all reports with pagination parameters
        Page<ReportResponse> result = reportService.getAllReports(pageable);

        // Then: Verify that the returned page is not empty and has the correct size
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(20);
        assertThat(result.isFirst()).isTrue();
        assertThat(result.isLast()).isTrue();

        // Verify individual report content in the page
        List<ReportResponse> reports = result.getContent();
        assertThat(reports.get(0).getReportId()).isEqualTo("1");
        assertThat(reports.get(0).getReportName()).isEqualTo("Risk Assessment Report");
        assertThat(reports.get(0).getReportType()).isEqualTo("RISK_ASSESSMENT");

        assertThat(reports.get(1).getReportId()).isEqualTo("2");
        assertThat(reports.get(1).getReportName()).isEqualTo("Settlement Reconciliation Report");
        assertThat(reports.get(1).getReportType()).isEqualTo("SETTLEMENT_RECONCILIATION");

        assertThat(reports.get(2).getReportId()).isEqualTo("3");
        assertThat(reports.get(2).getReportName()).isEqualTo("Compliance Control Report");
        assertThat(reports.get(2).getReportType()).isEqualTo("COMPLIANCE");

        // Verify that repository findAll was called with the correct pagination parameters
        verify(reportRepository, times(1)).findAll(pageable);
    }

    /**
     * Tests retrieving all reports with empty results.
     * 
     * This test validates the behavior when no reports exist in the system,
     * ensuring that the service properly handles empty result sets and
     * returns appropriate page structures for empty collections.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid pagination parameters but no reports exist</li>
     *   <li>Repository returns empty page with proper metadata</li>
     *   <li>Service returns empty page without throwing exceptions</li>
     *   <li>Page metadata reflects empty state correctly</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>Returned page is not null but content is empty</li>
     *   <li>Total elements and total pages are zero</li>
     *   <li>Page metadata is consistent with empty state</li>
     *   <li>No exceptions are thrown for empty results</li>
     * </ul>
     */
    @Test
    public void testGetAllReports_EmptyResults() {
        // Given: Create pagination parameters for testing
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());

        // Create empty page response
        Page<Report> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        // Configure mock repository to return empty results
        when(reportRepository.findAll(pageable)).thenReturn(emptyPage);

        // When: Retrieve all reports with pagination parameters
        Page<ReportResponse> result = reportService.getAllReports(pageable);

        // Then: Verify that the returned page is empty but properly structured
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(0);
        assertThat(result.getTotalPages()).isEqualTo(0);
        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(20);
        assertThat(result.isFirst()).isTrue();
        assertThat(result.isLast()).isTrue();

        // Verify that repository findAll was called with the correct pagination parameters
        verify(reportRepository, times(1)).findAll(pageable);
    }

    /**
     * Tests error handling when repository operations fail.
     * 
     * This test validates proper exception handling and error propagation
     * when underlying repository operations fail due to database connectivity
     * issues, constraint violations, or other persistence layer problems.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Valid report generation request</li>
     *   <li>Repository save operation throws RuntimeException</li>
     *   <li>Service should catch and re-throw with additional context</li>
     *   <li>No analytics events should be published for failed operations</li>
     * </ul>
     * 
     * <p><strong>Validation Points:</strong></p>
     * <ul>
     *   <li>RuntimeException is thrown when repository fails</li>
     *   <li>Exception message includes context about the failure</li>
     *   <li>No Kafka events are published for failed operations</li>
     *   <li>Original exception is preserved in the cause chain</li>
     * </ul>
     */
    @Test
    public void testGenerateReport_RepositoryFailure() {
        // Given: Configure mock repository to throw exception during save
        when(reportRepository.save(any(Report.class)))
                .thenThrow(new RuntimeException("Database connection failed"));

        // When & Then: Attempt to generate report with repository failure
        assertThatThrownBy(() -> reportService.generateReport(validReportRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate report")
                .hasCauseInstanceOf(RuntimeException.class);

        // Verify that repository save was attempted
        verify(reportRepository, times(1)).save(any(Report.class));

        // Verify that no Kafka event was published due to the failure
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
    }

    /**
     * Tests input validation for null report requests.
     * 
     * This test ensures that the service properly validates null input
     * and throws appropriate exceptions with clear error messages.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Null report request parameter</li>
     *   <li>Service should validate input before processing</li>
     *   <li>IllegalArgumentException should be thrown</li>
     *   <li>No repository operations should be performed</li>
     * </ul>
     */
    @Test
    public void testGenerateReport_NullRequest() {
        // When & Then: Attempt to generate report with null request
        assertThatThrownBy(() -> reportService.generateReport(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Report request cannot be null");

        // Verify that no repository operations were performed
        verify(reportRepository, never()).save(any(Report.class));
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any(AnalyticsEvent.class));
    }

    /**
     * Tests input validation for invalid report ID formats.
     * 
     * This test ensures proper handling of malformed report IDs
     * that cannot be parsed as valid numeric identifiers.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Invalid report ID format (non-numeric)</li>
     *   <li>Service should validate ID format before database query</li>
     *   <li>IllegalArgumentException should be thrown</li>
     *   <li>No repository operations should be performed</li>
     * </ul>
     */
    @Test
    public void testGetReportById_InvalidIdFormat() {
        // When & Then: Attempt to retrieve report with invalid ID format
        assertThatThrownBy(() -> reportService.getReportById("invalid-id"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid report ID format");

        // Verify that no repository operations were performed
        verify(reportRepository, never()).findById(anyLong());
    }

    /**
     * Tests pagination parameter validation.
     * 
     * This test ensures that null pagination parameters are properly
     * handled with appropriate error messages and no database operations.
     * 
     * <p><strong>Test Scenario:</strong></p>
     * <ul>
     *   <li>Null pageable parameter</li>
     *   <li>Service should validate pagination parameters</li>
     *   <li>IllegalArgumentException should be thrown</li>
     *   <li>No repository operations should be performed</li>
     * </ul>
     */
    @Test
    public void testGetAllReports_NullPageable() {
        // When & Then: Attempt to retrieve reports with null pagination
        assertThatThrownBy(() -> reportService.getAllReports(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Pageable parameter cannot be null");

        // Verify that no repository operations were performed
        verify(reportRepository, never()).findAll(any(Pageable.class));
    }
}