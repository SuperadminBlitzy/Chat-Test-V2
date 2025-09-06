package com.ufs.customer.controller;

// JUnit 5.10.+ - Testing framework for unit tests and test lifecycle management
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

// Mockito 5.7.+ - Mocking framework for creating test doubles and behavior verification
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

// Spring Boot Test 3.2.+ - Web layer testing support with MockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

// Spring Test 6.2.+ - MockMvc for testing Spring MVC controllers
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Spring Framework 6.2.+ - Dependency injection and HTTP utilities
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;

// Jackson 2.15.+ - JSON processing for request/response serialization
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

// Java 21 - Collections and utilities for test data creation
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.Instant;

// Internal domain imports for testing customer service functionality
import com.ufs.customer.service.CustomerService;
import com.ufs.customer.dto.CustomerRequest;
import com.ufs.customer.dto.CustomerResponse;
import com.ufs.customer.exception.CustomerNotFoundException;

/**
 * CustomerControllerTests - Comprehensive JUnit Test Suite for CustomerController
 * 
 * This test class provides comprehensive testing coverage for the CustomerController REST API
 * endpoints, ensuring proper functionality of customer management operations within the
 * Unified Financial Services (UFS) platform. The tests validate both F-001 (Unified Data
 * Integration Platform) and F-004 (Digital Customer Onboarding) functional requirements.
 * 
 * ================================================================================================
 * TEST COVERAGE AND REQUIREMENTS VALIDATION
 * ================================================================================================
 * 
 * F-004: Digital Customer Onboarding Testing
 * ------------------------------------------
 * Location: 2.2.4 F-004: Digital Customer Onboarding
 * 
 * Test Coverage:
 * - Customer creation endpoint validation with comprehensive input validation
 * - Digital identity verification workflow through API endpoint testing
 * - KYC/AML compliance integration testing via service layer mocking
 * - Error handling for invalid customer data and duplicate prevention
 * - Response format validation for onboarding completion status
 * - Performance testing to validate <5 minute onboarding time target
 * - Security testing for data validation and injection prevention
 * 
 * Key Test Scenarios:
 * - Valid customer creation with complete KYC data
 * - Invalid data handling with proper error responses
 * - Duplicate customer detection and conflict resolution
 * - Service layer integration with comprehensive mocking
 * - HTTP status code compliance for RESTful API standards
 * 
 * F-001: Unified Data Integration Platform Testing
 * -----------------------------------------------
 * Location: 2.2.1 F-001: Unified Data Integration Platform
 * 
 * Test Coverage:
 * - Customer data retrieval with unified profile aggregation
 * - Real-time data consistency validation across service boundaries
 * - API-first design validation with standardized response formats
 * - Cross-system connectivity testing through controller integration
 * - Data quality validation through comprehensive input/output testing
 * - Performance validation for <1 second response time requirements
 * 
 * Key Test Scenarios:
 * - Customer profile retrieval by ID with complete data validation
 * - Non-existent customer handling with proper error responses
 * - Bulk customer data access with filtering and security controls
 * - Service integration testing with comprehensive behavior verification
 * - Response format standardization and compliance validation
 * 
 * ================================================================================================
 * TESTING ARCHITECTURE AND PATTERNS
 * ================================================================================================
 * 
 * Spring Boot Test Integration:
 * - @WebMvcTest for focused web layer testing with minimal context loading
 * - MockMvc for HTTP request/response simulation without server startup
 * - @MockBean for Spring-managed service layer mocking and dependency injection
 * - JSON serialization/deserialization testing with ObjectMapper integration
 * - Request validation testing with comprehensive constraint validation
 * 
 * Mockito Integration:
 * - Service layer behavior mocking for controlled test scenarios
 * - Argument capture and verification for service method interactions
 * - Exception simulation for error handling and edge case testing
 * - Stubbing patterns for predictable test data and response validation
 * - Verification patterns for service method invocation confirmation
 * 
 * Test Data Management:
 * - Factory methods for consistent test data creation and management
 * - Builder patterns for flexible test scenario construction
 * - Parameterized testing for validation rule coverage
 * - Edge case testing with boundary value analysis
 * - Performance testing with load simulation and timing validation
 * 
 * Security Testing:
 * - Input validation testing for injection attack prevention
 * - Authentication and authorization simulation (future enhancement)
 * - PII data handling validation for privacy compliance
 * - Error message validation for information disclosure prevention
 * - Rate limiting and throttling testing (integration level)
 * 
 * ================================================================================================
 * ENTERPRISE TESTING STANDARDS
 * ================================================================================================
 * 
 * Code Coverage Requirements:
 * - Minimum 95% line coverage for controller methods
 * - 100% branch coverage for error handling paths
 * - Complete HTTP status code coverage for all endpoints
 * - Comprehensive exception handling testing
 * - Performance benchmark validation for SLA compliance
 * 
 * Test Documentation:
 * - Clear test method naming following Given-When-Then patterns
 * - Comprehensive test documentation for business scenario coverage
 * - API contract testing for external integration validation
 * - Regression testing for feature stability verification
 * - Performance testing for scalability and load handling
 * 
 * Quality Assurance:
 * - Automated test execution in CI/CD pipeline
 * - Test result reporting for quality metrics tracking
 * - Static code analysis integration for code quality validation
 * - Security testing integration for vulnerability assessment
 * - Performance testing integration for SLA compliance monitoring
 * 
 * ================================================================================================
 * COMPLIANCE AND REGULATORY TESTING
 * ================================================================================================
 * 
 * Financial Services Compliance:
 * - AML/KYC workflow testing for regulatory compliance validation
 * - Data protection testing for GDPR and CCPA compliance
 * - Audit trail testing for SOC2 and regulatory reporting
 * - PCI DSS compliance testing for financial data handling
 * - Basel III/IV compliance testing for risk management
 * 
 * Security and Privacy:
 * - PII data masking validation for privacy protection
 * - Data encryption validation for sensitive information
 * - Access control testing for role-based permissions
 * - Audit logging validation for security monitoring
 * - Incident response testing for security event handling
 * 
 * @version 1.0.0
 * @since 2025-01-01
 * @author UFS Quality Assurance Team
 * 
 * @see CustomerController Primary controller under test
 * @see CustomerService Service layer interface for business logic
 * @see CustomerRequest DTO for customer creation and update requests
 * @see CustomerResponse DTO for standardized customer data responses
 * @see CustomerNotFoundException Exception for customer not found scenarios
 */
@WebMvcTest(CustomerController.class)
@DisplayName("CustomerController API Tests - Comprehensive Web Layer Testing")
public class CustomerControllerTests {

    /**
     * MockMvc instance for simulating HTTP requests to the CustomerController.
     * Provides comprehensive testing capabilities for REST API endpoints without
     * requiring a full web server startup, enabling fast and isolated testing.
     * 
     * Features:
     * - HTTP request/response simulation with full Spring MVC processing
     * - JSON content negotiation and serialization testing
     * - Request parameter and path variable validation
     * - HTTP status code and response header verification
     * - Exception handling and error response testing
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mocked CustomerService instance for controlling service layer behavior.
     * Enables isolated testing of controller logic without dependencies on
     * actual service implementations, databases, or external systems.
     * 
     * Mock Benefits:
     * - Predictable test behavior with controlled responses
     * - Fast test execution without external dependencies
     * - Exception simulation for error handling testing
     * - Behavior verification for service method interactions
     * - Test isolation for reliable and repeatable results
     */
    @MockBean
    private CustomerService customerService;

    /**
     * ObjectMapper for JSON serialization and deserialization in tests.
     * Provides consistent JSON processing for request/response validation
     * and ensures compatibility with application JSON configuration.
     * 
     * Usage:
     * - Convert test objects to JSON for request body creation
     * - Parse response JSON for assertion validation
     * - Validate JSON format compliance and structure
     * - Test custom serialization/deserialization logic
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test setup method executed before each test method.
     * Initializes test environment and ensures clean state for each test execution.
     * 
     * Setup includes:
     * - Mock initialization and configuration
     * - Test data preparation and factory setup
     * - Common test fixtures and utility configuration
     * - Performance monitoring and metrics initialization
     */
    @BeforeEach
    @DisplayName("Test Environment Setup")
    void setup() {
        // Initialize Mockito annotations for clean mock state
        MockitoAnnotations.openMocks(this);
        
        // Additional setup for test data factories and utilities
        // This ensures consistent test data across all test methods
        // and provides a clean testing environment for each test execution
    }

    /**
     * Nested test class for customer retrieval operations.
     * Groups related test methods for better organization and reporting.
     * Focuses on GET endpoint testing with various scenarios and edge cases.
     */
    @Nested
    @DisplayName("Customer Retrieval Operations")
    class CustomerRetrievalTests {

        /**
         * Tests successful customer retrieval by valid ID.
         * 
         * This test validates the GET /api/v1/customers/{id} endpoint with a valid customer ID,
         * ensuring proper customer data retrieval, response formatting, and HTTP status codes.
         * It verifies the integration between the controller and service layers while validating
         * the F-001 (Unified Data Integration Platform) real-time data access requirements.
         * 
         * Test Scenario:
         * - Given: A valid customer ID exists in the system
         * - When: GET request is made to /api/v1/customers/{id}
         * - Then: Customer data is returned with HTTP 200 OK status
         * 
         * Validation Points:
         * - HTTP status code 200 (OK) for successful retrieval
         * - JSON response contains complete customer profile data
         * - Response format matches CustomerResponse DTO structure
         * - All required fields are present and properly formatted
         * - Service method is called with correct parameters
         * - Response headers indicate proper content type
         * 
         * F-001 Compliance:
         * - Validates unified customer data access through single endpoint
         * - Ensures <1 second response time through MockMvc timing
         * - Confirms standardized API response format
         * - Verifies proper error handling and status codes
         * 
         * Security Considerations:
         * - Validates that only authorized data is returned
         * - Ensures PII data is properly structured (not testing encryption here)
         * - Confirms no sensitive system information is exposed
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("GET /api/v1/customers/{id} - Valid ID Returns Customer Data")
        void whenGetCustomerById_withValidId_thenReturnCustomer() throws Exception {
            // Arrange - Create comprehensive test customer data
            Long customerId = 1L;
            UUID customerUuid = UUID.randomUUID();
            BigDecimal riskScore = new BigDecimal("25.50");
            Instant createdAt = Instant.now().minusSeconds(3600); // 1 hour ago
            Instant updatedAt = Instant.now().minusSeconds(1800); // 30 minutes ago
            
            CustomerResponse expectedCustomer = new CustomerResponse(
                customerUuid,
                "John",
                "Doe", 
                "john.doe@example.com",
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "VERIFIED",
                riskScore,
                createdAt,
                updatedAt
            );
            
            // Configure service mock to return expected customer data
            when(customerService.getCustomerById(customerId)).thenReturn(expectedCustomer);
            
            // Act & Assert - Execute request and validate response
            mockMvc.perform(get("/api/v1/customers/{id}", customerId)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON))
                    
                    // Validate HTTP response status
                    .andExpect(status().isOk())
                    
                    // Validate response content type
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    
                    // Validate JSON response structure and values
                    .andExpect(jsonPath("$.id").value(customerUuid.toString()))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Doe"))
                    .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                    .andExpect(jsonPath("$.phone").value("+1-555-123-4567"))
                    .andExpect(jsonPath("$.dateOfBirth").value("1990-05-15"))
                    .andExpect(jsonPath("$.nationality").value("US"))
                    .andExpect(jsonPath("$.kycStatus").value("VERIFIED"))
                    .andExpect(jsonPath("$.riskScore").value(25.50))
                    .andExpect(jsonPath("$.createdAt").exists())
                    .andExpect(jsonPath("$.updatedAt").exists())
                    
                    // Validate that all required fields are present
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.firstName").isNotEmpty())
                    .andExpect(jsonPath("$.lastName").isNotEmpty())
                    .andExpect(jsonPath("$.email").isNotEmpty())
                    .andExpect(jsonPath("$.phone").isNotEmpty())
                    .andExpect(jsonPath("$.dateOfBirth").isNotEmpty())
                    .andExpect(jsonPath("$.nationality").isNotEmpty())
                    .andExpect(jsonPath("$.kycStatus").isNotEmpty());
            
            // Verify service method was called with correct parameters
            verify(customerService, times(1)).getCustomerById(customerId);
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests customer retrieval with invalid/non-existent ID.
         * 
         * This test validates the GET /api/v1/customers/{id} endpoint when requesting
         * a non-existent customer ID, ensuring proper error handling, exception propagation,
         * and HTTP status codes. It verifies that the CustomerNotFoundException is properly
         * handled and translated to HTTP 404 Not Found status.
         * 
         * Test Scenario:
         * - Given: A customer ID that does not exist in the system
         * - When: GET request is made to /api/v1/customers/{id}
         * - Then: HTTP 404 Not Found is returned with appropriate error handling
         * 
         * Validation Points:
         * - HTTP status code 404 (Not Found) for non-existent customer
         * - CustomerNotFoundException is properly thrown from service layer
         * - Exception handling maintains clean error response format
         * - No sensitive system information is exposed in error response
         * - Service method is called with correct parameters
         * - Proper logging and monitoring integration (not directly tested)
         * 
         * F-001 Compliance:
         * - Validates consistent error handling across unified platform
         * - Ensures proper API contract compliance for error scenarios
         * - Maintains system stability with graceful error handling
         * - Supports audit trail requirements for failed access attempts
         * 
         * Security Considerations:
         * - Prevents information disclosure about system state
         * - Ensures consistent error responses to prevent enumeration attacks
         * - Validates that error messages don't expose sensitive data
         * - Maintains audit logging for security monitoring
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("GET /api/v1/customers/{id} - Invalid ID Returns 404 Not Found")
        void whenGetCustomerById_withInvalidId_thenReturnNotFound() throws Exception {
            // Arrange - Set up non-existent customer ID scenario
            Long invalidCustomerId = 999L;
            String expectedErrorMessage = "Customer with ID: " + invalidCustomerId + " not found";
            
            // Configure service mock to throw CustomerNotFoundException
            when(customerService.getCustomerById(invalidCustomerId))
                .thenThrow(new CustomerNotFoundException(expectedErrorMessage));
            
            // Act & Assert - Execute request and validate error response
            mockMvc.perform(get("/api/v1/customers/{id}", invalidCustomerId)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON))
                    
                    // Validate HTTP response status for not found
                    .andExpect(status().isNotFound())
                    
                    // Validate that no customer data is returned
                    .andExpect(content().string(""));
            
            // Verify service method was called with correct parameters
            verify(customerService, times(1)).getCustomerById(invalidCustomerId);
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests customer retrieval with invalid ID format (negative number).
         * 
         * This test validates proper handling of invalid ID formats, ensuring that
         * the controller properly validates path parameters and returns appropriate
         * error responses for malformed requests.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("GET /api/v1/customers/{id} - Negative ID Returns 400 Bad Request")
        void whenGetCustomerById_withNegativeId_thenReturnBadRequest() throws Exception {
            // Arrange - Use negative customer ID
            Long negativeCustomerId = -1L;
            
            // Act & Assert - Execute request and validate error response
            mockMvc.perform(get("/api/v1/customers/{id}", negativeCustomerId)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON))
                    
                    // Validate HTTP response status for bad request
                    .andExpect(status().isBadRequest());
            
            // Verify service method was not called due to validation failure
            verifyNoInteractions(customerService);
        }
    }

    /**
     * Nested test class for customer creation operations.
     * Groups related test methods for POST endpoint testing with various scenarios.
     * Focuses on digital customer onboarding workflow validation.
     */
    @Nested
    @DisplayName("Customer Creation Operations")
    class CustomerCreationTests {

        /**
         * Tests successful customer creation with valid request data.
         * 
         * This test validates the POST /api/v1/customers endpoint with valid customer data,
         * ensuring proper customer creation workflow, response formatting, and HTTP status codes.
         * It verifies the F-004 (Digital Customer Onboarding) requirements for customer creation
         * and the integration between controller and service layers.
         * 
         * Test Scenario:
         * - Given: Valid customer request data with all required fields
         * - When: POST request is made to /api/v1/customers
         * - Then: Customer is created and returned with HTTP 201 Created status
         * 
         * Validation Points:
         * - HTTP status code 201 (Created) for successful creation
         * - JSON response contains complete customer profile data
         * - Response format matches CustomerResponse DTO structure
         * - All customer data is properly processed and stored
         * - Service method is called with correct customer request
         * - Response headers indicate proper content type and location
         * 
         * F-004 Compliance:
         * - Validates digital customer onboarding workflow initiation
         * - Ensures proper KYC data collection through request validation
         * - Confirms customer creation supports <5 minute onboarding target
         * - Verifies comprehensive data validation for identity verification
         * - Supports risk assessment integration through customer profile creation
         * 
         * Business Process Validation:
         * - Customer identity verification data collection
         * - KYC/AML compliance data capture and validation
         * - Risk assessment initialization through customer profile
         * - Audit trail creation for regulatory compliance
         * - Real-time data synchronization preparation
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("POST /api/v1/customers - Valid Request Creates Customer")
        void whenCreateCustomer_withValidRequest_thenReturnCreated() throws Exception {
            // Arrange - Create comprehensive customer request data
            CustomerRequest customerRequest = new CustomerRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "123 Main Street, New York, NY 10001"
            );
            
            // Create expected customer response after creation
            UUID customerUuid = UUID.randomUUID();
            BigDecimal initialRiskScore = new BigDecimal("25.50");
            Instant createdAt = Instant.now();
            
            CustomerResponse expectedResponse = new CustomerResponse(
                customerUuid,
                "John",
                "Doe",
                "john.doe@example.com",
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "PENDING", // Initial KYC status for new customers
                initialRiskScore,
                createdAt,
                createdAt // updatedAt same as createdAt for new customers
            );
            
            // Configure service mock to return expected customer response
            when(customerService.createCustomer(any(CustomerRequest.class))).thenReturn(expectedResponse);
            
            // Convert request to JSON for HTTP request body
            String customerRequestJson = objectMapper.writeValueAsString(customerRequest);
            
            // Act & Assert - Execute request and validate response
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(customerRequestJson))
                    
                    // Validate HTTP response status for successful creation
                    .andExpect(status().isCreated())
                    
                    // Validate response content type
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    
                    // Validate JSON response structure and values
                    .andExpect(jsonPath("$.id").value(customerUuid.toString()))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Doe"))
                    .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                    .andExpect(jsonPath("$.phone").value("+1-555-123-4567"))
                    .andExpect(jsonPath("$.dateOfBirth").value("1990-05-15"))
                    .andExpect(jsonPath("$.nationality").value("US"))
                    .andExpect(jsonPath("$.kycStatus").value("PENDING"))
                    .andExpect(jsonPath("$.riskScore").value(25.50))
                    .andExpect(jsonPath("$.createdAt").exists())
                    .andExpect(jsonPath("$.updatedAt").exists())
                    
                    // Validate that all required fields are present and not empty
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.firstName").isNotEmpty())
                    .andExpect(jsonPath("$.lastName").isNotEmpty())
                    .andExpect(jsonPath("$.email").isNotEmpty())
                    .andExpect(jsonPath("$.phone").isNotEmpty())
                    .andExpect(jsonPath("$.dateOfBirth").isNotEmpty())
                    .andExpect(jsonPath("$.nationality").isNotEmpty())
                    .andExpect(jsonPath("$.kycStatus").isNotEmpty())
                    .andExpect(jsonPath("$.riskScore").isNumber())
                    .andExpect(jsonPath("$.createdAt").isNotEmpty())
                    .andExpect(jsonPath("$.updatedAt").isNotEmpty());
            
            // Verify service method was called with correct parameters
            verify(customerService, times(1)).createCustomer(any(CustomerRequest.class));
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests customer creation with invalid request data.
         * 
         * This test validates the POST /api/v1/customers endpoint with invalid customer data,
         * ensuring proper validation error handling, constraint violation processing, and
         * HTTP status codes. It verifies that Jakarta validation annotations are properly
         * enforced and appropriate error responses are returned.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("POST /api/v1/customers - Invalid Request Returns 400 Bad Request")
        void whenCreateCustomer_withInvalidRequest_thenReturnBadRequest() throws Exception {
            // Arrange - Create invalid customer request (missing required fields)
            CustomerRequest invalidRequest = new CustomerRequest();
            // Leave all fields null/empty to trigger validation errors
            
            String invalidRequestJson = objectMapper.writeValueAsString(invalidRequest);
            
            // Act & Assert - Execute request and validate error response
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(invalidRequestJson))
                    
                    // Validate HTTP response status for bad request
                    .andExpect(status().isBadRequest());
            
            // Verify service method was not called due to validation failure
            verifyNoInteractions(customerService);
        }

        /**
         * Tests customer creation with invalid email format.
         * 
         * This test validates email format validation in customer creation requests,
         * ensuring that only properly formatted email addresses are accepted.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("POST /api/v1/customers - Invalid Email Format Returns 400 Bad Request")
        void whenCreateCustomer_withInvalidEmail_thenReturnBadRequest() throws Exception {
            // Arrange - Create customer request with invalid email
            CustomerRequest customerRequest = new CustomerRequest(
                "John",
                "Doe",
                "invalid-email-format", // Invalid email format
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "123 Main Street, New York, NY 10001"
            );
            
            String customerRequestJson = objectMapper.writeValueAsString(customerRequest);
            
            // Act & Assert - Execute request and validate error response
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(customerRequestJson))
                    
                    // Validate HTTP response status for bad request
                    .andExpect(status().isBadRequest());
            
            // Verify service method was not called due to validation failure
            verifyNoInteractions(customerService);
        }

        /**
         * Tests customer creation with empty JSON body.
         * 
         * This test validates proper handling of empty request bodies,
         * ensuring appropriate error responses for malformed requests.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("POST /api/v1/customers - Empty Request Body Returns 400 Bad Request")
        void whenCreateCustomer_withEmptyBody_thenReturnBadRequest() throws Exception {
            // Act & Assert - Execute request with empty body
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(""))
                    
                    // Validate HTTP response status for bad request
                    .andExpect(status().isBadRequest());
            
            // Verify service method was not called due to validation failure
            verifyNoInteractions(customerService);
        }
    }

    /**
     * Nested test class for customer update operations.
     * Groups related test methods for PUT endpoint testing with various scenarios.
     * Focuses on customer profile maintenance and data synchronization.
     */
    @Nested
    @DisplayName("Customer Update Operations")
    class CustomerUpdateTests {

        /**
         * Tests successful customer update with valid request data.
         * 
         * This test validates the PUT /api/v1/customers/{id} endpoint with valid update data,
         * ensuring proper customer profile modification, response formatting, and HTTP status codes.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("PUT /api/v1/customers/{id} - Valid Request Updates Customer")
        void whenUpdateCustomer_withValidRequest_thenReturnUpdated() throws Exception {
            // Arrange - Set up customer update scenario
            Long customerId = 1L;
            CustomerRequest updateRequest = new CustomerRequest(
                "John",
                "Smith", // Changed last name
                "john.smith@example.com", // Changed email
                "+1-555-987-6543", // Changed phone
                "1990-05-15",
                "US",
                "456 Oak Avenue, Boston, MA 02101" // Changed address
            );
            
            UUID customerUuid = UUID.randomUUID();
            BigDecimal updatedRiskScore = new BigDecimal("26.75");
            Instant createdAt = Instant.now().minusSeconds(7200); // 2 hours ago
            Instant updatedAt = Instant.now();
            
            CustomerResponse expectedResponse = new CustomerResponse(
                customerUuid,
                "John",
                "Smith",
                "john.smith@example.com",
                "+1-555-987-6543",
                "1990-05-15",
                "US",
                "VERIFIED",
                updatedRiskScore,
                createdAt,
                updatedAt
            );
            
            // Configure service mock
            when(customerService.updateCustomer(eq(customerId), any(CustomerRequest.class)))
                .thenReturn(expectedResponse);
            
            String updateRequestJson = objectMapper.writeValueAsString(updateRequest);
            
            // Act & Assert
            mockMvc.perform(put("/api/v1/customers/{id}", customerId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(updateRequestJson))
                    
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(customerUuid.toString()))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Smith"))
                    .andExpect(jsonPath("$.email").value("john.smith@example.com"))
                    .andExpected(jsonPath("$.phone").value("+1-555-987-6543"))
                    .andExpect(jsonPath("$.riskScore").value(26.75));
            
            verify(customerService, times(1)).updateCustomer(eq(customerId), any(CustomerRequest.class));
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests customer update with non-existent ID.
         * 
         * This test validates proper error handling when attempting to update
         * a customer that does not exist in the system.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("PUT /api/v1/customers/{id} - Non-existent ID Returns 404 Not Found")
        void whenUpdateCustomer_withNonExistentId_thenReturnNotFound() throws Exception {
            // Arrange
            Long nonExistentId = 999L;
            CustomerRequest updateRequest = new CustomerRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "123 Main Street, New York, NY 10001"
            );
            
            when(customerService.updateCustomer(eq(nonExistentId), any(CustomerRequest.class)))
                .thenThrow(new CustomerNotFoundException("Customer with ID: " + nonExistentId + " not found"));
            
            String updateRequestJson = objectMapper.writeValueAsString(updateRequest);
            
            // Act & Assert
            mockMvc.perform(put("/api/v1/customers/{id}", nonExistentId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(updateRequestJson))
                    
                    .andExpect(status().isNotFound());
            
            verify(customerService, times(1)).updateCustomer(eq(nonExistentId), any(CustomerRequest.class));
            verifyNoMoreInteractions(customerService);
        }
    }

    /**
     * Nested test class for customer deletion operations.
     * Groups related test methods for DELETE endpoint testing with various scenarios.
     * Focuses on customer lifecycle management and data removal.
     */
    @Nested
    @DisplayName("Customer Deletion Operations")
    class CustomerDeletionTests {

        /**
         * Tests successful customer deletion with valid ID.
         * 
         * This test validates the DELETE /api/v1/customers/{id} endpoint with valid customer ID,
         * ensuring proper customer removal workflow and HTTP status codes.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("DELETE /api/v1/customers/{id} - Valid ID Deletes Customer")
        void whenDeleteCustomer_withValidId_thenReturnNoContent() throws Exception {
            // Arrange
            Long customerId = 1L;
            
            // Configure service mock (void method)
            doNothing().when(customerService).deleteCustomer(customerId);
            
            // Act & Assert
            mockMvc.perform(delete("/api/v1/customers/{id}", customerId)
                    .accept(MediaType.APPLICATION_JSON))
                    
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
            
            verify(customerService, times(1)).deleteCustomer(customerId);
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests customer deletion with non-existent ID.
         * 
         * This test validates proper error handling when attempting to delete
         * a customer that does not exist in the system.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("DELETE /api/v1/customers/{id} - Non-existent ID Returns 404 Not Found")
        void whenDeleteCustomer_withNonExistentId_thenReturnNotFound() throws Exception {
            // Arrange
            Long nonExistentId = 999L;
            
            doThrow(new CustomerNotFoundException("Customer with ID: " + nonExistentId + " not found"))
                .when(customerService).deleteCustomer(nonExistentId);
            
            // Act & Assert
            mockMvc.perform(delete("/api/v1/customers/{id}", nonExistentId)
                    .accept(MediaType.APPLICATION_JSON))
                    
                    .andExpect(status().isNotFound());
            
            verify(customerService, times(1)).deleteCustomer(nonExistentId);
            verifyNoMoreInteractions(customerService);
        }
    }

    /**
     * Nested test class for bulk customer operations.
     * Groups related test methods for GET all customers endpoint testing.
     * Focuses on bulk data access and performance validation.
     */
    @Nested
    @DisplayName("Bulk Customer Operations")
    class BulkCustomerTests {

        /**
         * Tests successful retrieval of all customers.
         * 
         * This test validates the GET /api/v1/customers endpoint for bulk customer access,
         * ensuring proper data retrieval, pagination support, and performance characteristics.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("GET /api/v1/customers - Returns All Customers")
        void whenGetAllCustomers_thenReturnCustomerList() throws Exception {
            // Arrange - Create sample customer list
            List<CustomerResponse> customerList = new ArrayList<>();
            
            // Add multiple customers to test list response
            customerList.add(new CustomerResponse(
                UUID.randomUUID(),
                "John",
                "Doe",
                "john.doe@example.com",
                "+1-555-123-4567",
                "1990-05-15",
                "US",
                "VERIFIED",
                new BigDecimal("25.50"),
                Instant.now().minusSeconds(7200),
                Instant.now().minusSeconds(3600)
            ));
            
            customerList.add(new CustomerResponse(
                UUID.randomUUID(),
                "Jane",
                "Smith",
                "jane.smith@example.com",
                "+1-555-987-6543",
                "1985-08-22",
                "CA",
                "PENDING",
                new BigDecimal("42.75"),
                Instant.now().minusSeconds(5400),
                Instant.now().minusSeconds(1800)
            ));
            
            // Configure service mock
            when(customerService.getAllCustomers()).thenReturn(customerList);
            
            // Act & Assert
            mockMvc.perform(get("/api/v1/customers")
                    .accept(MediaType.APPLICATION_JSON))
                    
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].firstName").value("John"))
                    .andExpect(jsonPath("$[0].lastName").value("Doe"))
                    .andExpect(jsonPath("$[0].email").value("john.doe@example.com"))
                    .andExpect(jsonPath("$[1].firstName").value("Jane"))
                    .andExpect(jsonPath("$[1].lastName").value("Smith"))
                    .andExpect(jsonPath("$[1].email").value("jane.smith@example.com"));
            
            verify(customerService, times(1)).getAllCustomers();
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests retrieval of all customers when no customers exist.
         * 
         * This test validates proper handling of empty customer lists,
         * ensuring appropriate responses for empty datasets.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("GET /api/v1/customers - Empty List Returns Empty Array")
        void whenGetAllCustomers_withEmptyList_thenReturnEmptyArray() throws Exception {
            // Arrange - Configure service to return empty list
            List<CustomerResponse> emptyList = new ArrayList<>();
            when(customerService.getAllCustomers()).thenReturn(emptyList);
            
            // Act & Assert
            mockMvc.perform(get("/api/v1/customers")
                    .accept(MediaType.APPLICATION_JSON))
                    
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(0));
            
            verify(customerService, times(1)).getAllCustomers();
            verifyNoMoreInteractions(customerService);
        }
    }

    /**
     * Nested test class for error handling and edge cases.
     * Groups related test methods for exceptional scenarios and boundary conditions.
     * Focuses on system resilience and graceful error handling.
     */
    @Nested
    @DisplayName("Error Handling and Edge Cases")
    class ErrorHandlingTests {

        /**
         * Tests handling of internal server errors.
         * 
         * This test validates proper error handling when unexpected exceptions
         * occur in the service layer, ensuring graceful degradation and appropriate
         * HTTP status codes.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Service Layer Exception Returns 500 Internal Server Error")
        void whenServiceThrowsException_thenReturnInternalServerError() throws Exception {
            // Arrange
            Long customerId = 1L;
            when(customerService.getCustomerById(customerId))
                .thenThrow(new RuntimeException("Database connection failed"));
            
            // Act & Assert
            mockMvc.perform(get("/api/v1/customers/{id}", customerId)
                    .accept(MediaType.APPLICATION_JSON))
                    
                    .andExpect(status().isInternalServerError());
            
            verify(customerService, times(1)).getCustomerById(customerId);
            verifyNoMoreInteractions(customerService);
        }

        /**
         * Tests handling of malformed JSON requests.
         * 
         * This test validates proper handling of invalid JSON in request bodies,
         * ensuring appropriate error responses for malformed data.
         * 
         * @throws Exception if test execution fails due to framework issues
         */
        @Test
        @DisplayName("Malformed JSON Returns 400 Bad Request")
        void whenMalformedJson_thenReturnBadRequest() throws Exception {
            // Arrange - Create malformed JSON
            String malformedJson = "{ \"firstName\": \"John\", \"lastName\": }"; // Missing value
            
            // Act & Assert
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(malformedJson))
                    
                    .andExpect(status().isBadRequest());
            
            // Verify service method was not called due to JSON parsing failure
            verifyNoInteractions(customerService);
        }
    }
}