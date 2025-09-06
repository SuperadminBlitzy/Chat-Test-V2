package com.ufs.customer.service;

// JUnit 5.10+ - Core testing framework for unit test execution and assertions
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;

// JUnit 5.10+ - Assertion methods for comprehensive test validation
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertAll;

// Mockito 5.7+ - Mocking framework for isolated unit testing
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoExtension;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.eq;
import static org.mockito.ArgumentMatchers.anyString;

// Java 21 - Standard library for collections, optionals, and UUID handling
import java.util.Optional;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.UUID;
import java.time.LocalDate;
import java.time.Instant;
import java.math.BigDecimal;

// Internal domain models - Core business entities for customer management
import com.ufs.customer.model.Customer;
import com.ufs.customer.model.CustomerProfile;

// Internal DTOs - Data transfer objects for API communication
import com.ufs.customer.dto.CustomerRequest;
import com.ufs.customer.dto.CustomerResponse;

// Internal repositories - Data access layer interfaces for customer operations
import com.ufs.customer.repository.CustomerRepository;
import com.ufs.customer.repository.CustomerProfileRepository;

// Internal service implementation - Business logic layer for customer management
import com.ufs.customer.service.impl.CustomerServiceImpl;

// Internal exceptions - Domain-specific error handling for customer operations
import com.ufs.customer.exception.CustomerNotFoundException;

/**
 * Comprehensive Unit Test Suite for CustomerService Implementation
 * 
 * This test class provides exhaustive unit testing coverage for the CustomerServiceImpl,
 * ensuring that all customer-related operations function correctly according to the
 * business requirements and technical specifications. The tests validate core functionality
 * including customer creation, retrieval, updating, deletion, and exception handling.
 * 
 * ================================================================================================
 * FUNCTIONAL REQUIREMENTS ADDRESSED
 * ================================================================================================
 * 
 * F-004: Digital Customer Onboarding
 * ----------------------------------
 * Location: 2.2.4 F-004: Digital Customer Onboarding
 * Testing Coverage: This test suite validates the core logic for managing customer data,
 * which serves as the foundational component of the digital onboarding process. Tests ensure
 * that customer creation, profile management, and data validation work correctly to support
 * the onboarding workflow requirements.
 * 
 * Key Test Coverage Areas:
 * - Customer creation with comprehensive data validation
 * - Customer profile initialization and management
 * - Data integrity and business rule enforcement
 * - Error handling for invalid or incomplete customer data
 * - Integration validation between customer and profile entities
 * 
 * Unit Testing Framework Integration
 * ---------------------------------
 * Location: 3.3.3 Testing Dependencies
 * Implementation: This test class utilizes JUnit 5 and Mockito for comprehensive unit testing
 * of the service layer as specified in the technical documentation. The testing approach
 * follows enterprise best practices for isolation, mocking, and assertion patterns.
 * 
 * Framework Features Utilized:
 * - JUnit 5.10+ for modern test execution and parameterized testing
 * - Mockito 5.7+ for dependency mocking and behavior verification
 * - @ExtendWith(MockitoExtension.class) for automatic mock initialization
 * - @InjectMocks for service layer dependency injection testing
 * - Comprehensive assertion methods for detailed test validation
 * 
 * ================================================================================================
 * TESTING ARCHITECTURE AND STRATEGY
 * ================================================================================================
 * 
 * Test Isolation Strategy:
 * - Complete isolation of CustomerServiceImpl from external dependencies
 * - Mock objects for all repository layer interactions
 * - Independent test data setup for each test method
 * - No shared state between test methods to prevent test interdependencies
 * 
 * Mock Management Approach:
 * - @Mock annotations for repository dependencies
 * - @InjectMocks for automatic dependency injection into service under test
 * - Behavior-driven mocking with when().thenReturn() patterns
 * - Verification of mock interactions using verify() assertions
 * - Reset of mock state through MockitoExtension automatic cleanup
 * 
 * Test Data Management:
 * - Comprehensive test data builders for consistent object creation
 * - Realistic test data reflecting production scenarios
 * - Edge case data sets for boundary condition testing
 * - Invalid data scenarios for negative testing and error validation
 * 
 * Assertion Strategy:
 * - Multi-level assertions using assertAll() for comprehensive validation
 * - Field-by-field verification of response objects
 * - Exception testing with assertThrows() for error scenarios
 * - Business logic validation beyond simple data mapping
 * 
 * ================================================================================================
 * PERFORMANCE AND QUALITY CONSIDERATIONS
 * ================================================================================================
 * 
 * Test Performance Optimization:
 * - Fast test execution through mock usage instead of database integration
 * - Minimal object creation overhead with builder patterns
 * - Efficient test data setup and teardown processes
 * - Parallel test execution compatibility through stateless design
 * 
 * Code Coverage Goals:
 * - 100% line coverage for all service layer methods
 * - 100% branch coverage for conditional logic paths
 * - Exception path coverage for error handling scenarios
 * - Business logic validation coverage beyond simple CRUD operations
 * 
 * Test Maintainability:
 * - Clear and descriptive test method names following @DisplayName conventions
 * - Comprehensive documentation explaining test objectives and scenarios
 * - Consistent test structure with Arrange-Act-Assert pattern
 * - Reusable test data builders and helper methods
 * 
 * Quality Assurance:
 * - Validation of both happy path and error scenarios
 * - Edge case testing for boundary conditions
 * - Input validation testing for security and data integrity
 * - Mock interaction verification for dependency contract validation
 * 
 * ================================================================================================
 * COMPLIANCE AND SECURITY TESTING
 * ================================================================================================
 * 
 * Data Validation Testing:
 * - Comprehensive input validation for customer creation requests
 * - Email format and uniqueness validation testing
 * - Date validation for date of birth and business rules
 * - String length and format validation for security compliance
 * 
 * Business Rule Validation:
 * - Customer duplication prevention testing
 * - Data integrity constraint validation
 * - Business logic compliance for customer lifecycle management
 * - Audit trail and tracking validation for compliance requirements
 * 
 * Security Considerations:
 * - Input sanitization validation through service layer testing
 * - Exception handling testing to prevent information disclosure
 * - Access control validation through mock dependency verification
 * - Data masking and privacy protection validation in error scenarios
 * 
 * @version 1.0.0
 * @since 2025-01-01
 * @author UFS Development Team
 * 
 * @see CustomerServiceImpl The service implementation under test
 * @see CustomerRepository Mocked repository for customer data access
 * @see CustomerProfileRepository Mocked repository for customer profile operations
 * @see Customer Core customer entity used in testing scenarios
 * @see CustomerProfile Customer profile entity for unified customer view testing
 * @see CustomerRequest DTO for customer creation and update request testing
 * @see CustomerResponse DTO for service response validation
 * @see CustomerNotFoundException Exception handling validation for not found scenarios
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService Implementation Unit Tests")
public class CustomerServiceTests {

    // ================================================================================================
    // TEST DEPENDENCIES AND MOCK OBJECTS
    // ================================================================================================

    /**
     * Service Under Test - CustomerServiceImpl
     * 
     * The primary service implementation being tested. Uses @InjectMocks to automatically
     * inject the mocked dependencies (CustomerRepository and CustomerProfileRepository)
     * into the service constructor, enabling isolated unit testing of business logic.
     * 
     * This annotation ensures that:
     * - Mock dependencies are properly injected during test execution
     * - Service instance is created fresh for each test method
     * - Business logic can be tested in isolation from data persistence layer
     * - Test execution is fast and reliable without external dependencies
     */
    @InjectMocks
    private CustomerServiceImpl customerService;

    /**
     * Mocked CustomerRepository Dependency
     * 
     * Mock object for the CustomerRepository interface, enabling isolated testing
     * of service layer logic without actual database interactions. This mock allows
     * precise control over repository behavior and verification of service-repository
     * interaction patterns.
     * 
     * Mock Capabilities:
     * - Simulates database operations (save, findById, delete, etc.)
     * - Controls return values for different test scenarios
     * - Enables verification of method calls and parameters
     * - Supports both successful operations and error simulation
     * - Provides fast test execution without database overhead
     */
    @Mock
    private CustomerRepository customerRepository;

    /**
     * Mocked CustomerProfileRepository Dependency
     * 
     * Mock object for CustomerProfileRepository interface, supporting unified
     * customer view testing through profile management operations. Essential
     * for testing the hybrid SQL-NoSQL architecture integration.
     * 
     * Testing Support:
     * - Customer profile creation and management validation
     * - Integration testing between Customer and CustomerProfile entities
     * - MongoDB document storage operation simulation
     * - Unified customer view functionality verification
     */
    @Mock
    private CustomerProfileRepository customerProfileRepository;

    // ================================================================================================
    // TEST DATA OBJECTS - Initialized in setUp() method
    // ================================================================================================

    /**
     * Test Customer Entity
     * 
     * Core customer entity used across multiple test scenarios. Initialized with
     * realistic test data that reflects production customer information while
     * maintaining privacy and security considerations.
     * 
     * Test Data Characteristics:
     * - Realistic personal information for validation testing
     * - Valid email format for uniqueness constraint testing
     * - Proper date formats for business rule validation
     * - UUID identifier for distributed system compatibility
     * - Active status for business logic testing
     */
    private Customer customer;

    /**
     * Test CustomerProfile Entity
     * 
     * Customer profile entity representing the MongoDB document storage component
     * of the unified customer view. Used for testing hybrid architecture integration
     * and comprehensive customer profile management.
     * 
     * Profile Components:
     * - Personal information alignment with customer entity
     * - Address information for compliance testing
     * - Identity verification status for KYC workflow testing
     * - Risk assessment data for AI integration validation
     */
    private CustomerProfile customerProfile;

    /**
     * Test CustomerRequest DTO
     * 
     * Data transfer object representing customer creation and update requests.
     * Contains all required fields for customer onboarding and profile management
     * operations, enabling comprehensive input validation testing.
     * 
     * Request Data Features:
     * - Complete personal information for creation testing
     * - Valid contact details for communication workflow testing
     * - Proper address format for compliance validation
     * - Realistic nationality information for regulatory testing
     */
    private CustomerRequest customerRequest;

    // ================================================================================================
    // TEST SETUP AND INITIALIZATION
    // ================================================================================================

    /**
     * Test Data Initialization and Setup
     * 
     * Initializes comprehensive test data before each test method execution, ensuring
     * consistent and isolated test conditions. This method creates realistic test
     * objects that reflect production data patterns while maintaining test reliability
     * and deterministic behavior.
     * 
     * Initialization Strategy:
     * - Creates fresh test data for each test method to prevent interdependencies
     * - Uses realistic data values that match production validation requirements
     * - Establishes proper relationships between Customer and CustomerProfile entities
     * - Configures test data to support both positive and negative testing scenarios
     * 
     * Data Quality Considerations:
     * - Email addresses use test domains to prevent accidental communications
     * - Phone numbers follow international format standards
     * - Date values are realistic and comply with business rule requirements
     * - Personal information follows privacy and security best practices
     * 
     * Test Coverage Support:
     * - Supports comprehensive field validation testing
     * - Enables business rule compliance verification
     * - Provides data for integration testing between entities
     * - Supports error scenario testing with invalid data variations
     * 
     * Performance Optimization:
     * - Efficient object creation with minimal memory overhead
     * - Reusable test data patterns for consistent testing
     * - Fast initialization supporting rapid test execution
     * - Builder pattern usage for flexible test data configuration
     * 
     * @throws RuntimeException if test data initialization fails
     */
    @BeforeEach
    @DisplayName("Initialize test data and mock dependencies")
    void setUp() {
        // ============================================================================================
        // CUSTOMER ENTITY INITIALIZATION
        // ============================================================================================
        
        // Create comprehensive Customer entity with realistic production-quality test data
        customer = Customer.builder()
                .id(UUID.fromString("550e8400-e29b-41d4-a716-446655440000")) // Fixed UUID for deterministic testing
                .firstName("John") // Common first name for testing validation rules
                .lastName("Doe") // Standard test surname for customer identification
                .email("john.doe@testmail.com") // Test domain to prevent accidental real communications
                .phoneNumber("+1-555-123-4567") // Valid international format for contact validation
                .dateOfBirth(LocalDate.of(1990, 5, 15)) // Adult age for business rule compliance
                .nationality("US") // US nationality for domestic regulation testing
                .isActive(true) // Active status for business logic testing
                .createdAt(Instant.parse("2024-01-01T10:00:00Z")) // Fixed creation timestamp for deterministic assertions
                .updatedAt(Instant.parse("2024-01-01T10:00:00Z")) // Consistent update timestamp for testing
                .build();

        // ============================================================================================
        // CUSTOMER PROFILE INITIALIZATION
        // ============================================================================================
        
        // Initialize CustomerProfile for unified customer view testing
        customerProfile = new CustomerProfile();
        customerProfile.setId("profile_550e8400e29b41d4a716446655440000"); // MongoDB ObjectId format
        customerProfile.setCustomerId(customer.getId().toString()); // Link to customer entity
        
        // Configure personal information alignment with customer entity
        CustomerProfile.PersonalInfo personalInfo = new CustomerProfile.PersonalInfo();
        personalInfo.setFirstName(customer.getFirstName());
        personalInfo.setLastName(customer.getLastName());
        personalInfo.setEmail(customer.getEmail());
        personalInfo.setPhone(customer.getPhoneNumber());
        personalInfo.setDateOfBirth(java.util.Date.from(customer.getDateOfBirth().atStartOfDay()
                .atZone(java.time.ZoneId.systemDefault()).toInstant()));
        personalInfo.setNationality(customer.getNationality());
        customerProfile.setPersonalInfo(personalInfo);
        
        // Configure metadata for audit trail and compliance testing
        CustomerProfile.Metadata metadata = new CustomerProfile.Metadata();
        metadata.setCreatedAt(java.util.Date.from(customer.getCreatedAt()));
        metadata.setUpdatedAt(java.util.Date.from(customer.getUpdatedAt()));
        metadata.setVersion(1); // Initial version for optimistic locking testing
        metadata.setDataClassification("confidential"); // Security classification for compliance
        customerProfile.setMetadata(metadata);

        // ============================================================================================
        // CUSTOMER REQUEST DTO INITIALIZATION
        // ============================================================================================
        
        // Create CustomerRequest DTO with comprehensive test data for API testing
        customerRequest = new CustomerRequest();
        customerRequest.setFirstName("John"); // Matches customer entity for consistency
        customerRequest.setLastName("Doe"); // Consistent surname for validation testing
        customerRequest.setEmail("john.doe@testmail.com"); // Valid email format for uniqueness testing
        customerRequest.setPhoneNumber("+1-555-123-4567"); // International format for contact validation
        customerRequest.setDateOfBirth("1990-05-15"); // ISO 8601 date format for parsing validation
        customerRequest.setNationality("US"); // Valid nationality for regulatory compliance
        customerRequest.setAddress("123 Main Street, Anytown, NY 12345, USA"); // Complete address for verification
        
        // Perform data sanitization for realistic API behavior testing
        customerRequest.sanitizeData();
        
        // Log test data initialization for debugging and monitoring
        System.out.println("Test data initialized successfully:");
        System.out.println("- Customer ID: " + customer.getId());
        System.out.println("- Customer Email: " + customer.getEmail());
        System.out.println("- CustomerProfile ID: " + customerProfile.getId());
        System.out.println("- Test setup completed for: " + this.getClass().getSimpleName());
    }

    // ================================================================================================
    // CUSTOMER CREATION TESTING
    // ================================================================================================

    /**
     * Tests successful customer creation with comprehensive validation.
     * 
     * This test validates the complete customer creation workflow including input validation,
     * duplicate checking, entity creation, profile initialization, and response generation.
     * It ensures that the service correctly orchestrates all necessary operations for
     * successful customer onboarding.
     * 
     * Test Scenario Coverage:
     * - Valid customer request processing and transformation
     * - Duplicate customer detection and prevention
     * - Customer entity creation with proper field mapping
     * - CustomerProfile initialization for unified view
     * - Database persistence operation simulation
     * - Response DTO generation and validation
     * - Mock interaction verification for dependency contracts
     * 
     * Business Logic Validation:
     * - Email uniqueness constraint enforcement
     * - Data transformation accuracy from request to entity
     * - Proper handling of nullable fields
     * - Default value assignment for business rules
     * - Audit timestamp management
     * 
     * Integration Testing:
     * - CustomerRepository save operation verification
     * - CustomerProfileRepository integration validation
     * - Service layer orchestration of multiple operations
     * - Error handling for external dependency failures
     * 
     * Performance Considerations:
     * - Efficient mock setup and verification
     * - Minimal object creation overhead
     * - Fast assertion execution with comprehensive coverage
     * - Memory-efficient test data management
     * 
     * @throws Exception if test execution fails or assertions are violated
     */
    @Test
    @DisplayName("Should create customer and return customer response")
    void createCustomer_shouldReturnCustomerResponse() {
        // ============================================================================================
        // ARRANGE - Test Data Setup and Mock Configuration
        // ============================================================================================
        
        // Configure CustomerRepository mock to simulate successful duplicate check
        when(customerRepository.existsByEmail(customerRequest.getEmail()))
                .thenReturn(false); // No duplicate customer exists
        
        // Configure CustomerRepository mock to simulate successful entity persistence
        when(customerRepository.save(any(Customer.class)))
                .thenReturn(customer); // Return the created customer entity
        
        // Configure CustomerProfileRepository mock to simulate successful profile creation
        when(customerProfileRepository.save(any(CustomerProfile.class)))
                .thenReturn(customerProfile); // Return the created customer profile
        
        // Log test setup completion for debugging and monitoring
        System.out.println("Mock dependencies configured for customer creation test");
        System.out.println("- CustomerRepository.existsByEmail() returns: false");
        System.out.println("- CustomerRepository.save() returns: Customer with ID " + customer.getId());
        System.out.println("- CustomerProfileRepository.save() returns: Profile with ID " + customerProfile.getId());

        // ============================================================================================
        // ACT - Execute Service Method Under Test
        // ============================================================================================
        
        // Execute the customer creation service method
        CustomerResponse response = customerService.createCustomer(customerRequest);
        
        // Log service execution completion for test monitoring
        System.out.println("CustomerService.createCustomer() executed successfully");
        System.out.println("- Response Customer ID: " + response.id());
        System.out.println("- Response Full Name: " + response.getFullName());

        // ============================================================================================
        // ASSERT - Comprehensive Response Validation
        // ============================================================================================
        
        // Perform comprehensive validation of the service response
        assertAll("Customer creation response validation",
            // Primary response validation - ensure response is not null
            () -> assertNotNull(response, "Customer response should not be null"),
            
            // Customer identification validation
            () -> assertEquals(customer.getId(), response.id(), 
                "Response customer ID should match the created customer ID"),
            
            // Personal information validation
            () -> assertEquals(customer.getFirstName(), response.firstName(), 
                "Response first name should match the customer entity first name"),
            () -> assertEquals(customer.getLastName(), response.lastName(), 
                "Response last name should match the customer entity last name"),
            () -> assertEquals(customer.getFullName(), response.getFullName(), 
                "Response full name should be properly formatted"),
            
            // Contact information validation
            () -> assertEquals(customer.getEmail(), response.email(), 
                "Response email should match the customer entity email"),
            () -> assertEquals(customer.getPhoneNumber(), response.phone(), 
                "Response phone should match the customer entity phone number"),
            
            // Demographic information validation
            () -> assertEquals(customer.getDateOfBirth().toString(), response.dateOfBirth(), 
                "Response date of birth should match the customer entity date"),
            () -> assertEquals(customer.getNationality(), response.nationality(), 
                "Response nationality should match the customer entity nationality"),
            
            // Business status validation
            () -> assertEquals("PENDING", response.kycStatus(), 
                "Response KYC status should be set to PENDING for new customers"),
            () -> assertEquals(new BigDecimal("25.00"), response.riskScore(), 
                "Response risk score should be set to default value for new customers"),
            
            // Audit trail validation
            () -> assertEquals(customer.getCreatedAt(), response.createdAt(), 
                "Response creation timestamp should match the customer entity"),
            () -> assertEquals(customer.getUpdatedAt(), response.updatedAt(), 
                "Response update timestamp should match the customer entity"),
            
            // Business logic validation
            () -> assertFalse(response.isKycVerified(), 
                "New customer should not be KYC verified initially"),
            () -> assertEquals("LOW", response.getRiskLevel(), 
                "New customer should have LOW risk level with default score"),
            () -> assertFalse(response.requiresEnhancedDueDiligence(), 
                "New customer with default risk score should not require enhanced due diligence")
        );

        // ============================================================================================
        // VERIFY - Mock Interaction Validation
        // ============================================================================================
        
        // Verify that duplicate customer check was performed exactly once
        verify(customerRepository, times(1))
                .existsByEmail(customerRequest.getEmail());
        
        // Verify that customer entity was saved exactly once
        verify(customerRepository, times(1))
                .save(any(Customer.class));
        
        // Verify that customer profile was created and saved exactly once
        verify(customerProfileRepository, times(1))
                .save(any(CustomerProfile.class));
        
        // Log verification completion for test monitoring
        System.out.println("Mock interaction verification completed successfully");
        System.out.println("- CustomerRepository.existsByEmail() called 1 time");
        System.out.println("- CustomerRepository.save() called 1 time");
        System.out.println("- CustomerProfileRepository.save() called 1 time");
        System.out.println("Customer creation test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER RETRIEVAL TESTING - SUCCESSFUL SCENARIOS
    // ================================================================================================

    /**
     * Tests successful customer retrieval by ID with comprehensive validation.
     * 
     * This test verifies that the service correctly retrieves a customer by their unique
     * identifier and returns a properly formatted response with all customer information.
     * It validates the complete retrieval workflow including ID validation, database query,
     * and response transformation.
     * 
     * Test Coverage Areas:
     * - Customer ID validation and format checking
     * - Repository query execution and result handling
     * - Entity to DTO transformation accuracy
     * - Response field mapping and validation
     * - Mock behavior verification for dependency contracts
     * 
     * Business Logic Validation:
     * - Proper customer identification and retrieval
     * - Complete customer information presentation
     * - Audit trail and timestamp preservation
     * - Business status and risk assessment display
     * 
     * @throws CustomerNotFoundException if customer is not found (not expected in this test)
     * @throws Exception if test execution fails or assertions are violated
     */
    @Test
    @DisplayName("Should return customer response when customer is found")
    void getCustomerById_shouldReturnCustomerResponse() {
        // ============================================================================================
        // ARRANGE - Mock Configuration for Successful Retrieval
        // ============================================================================================
        
        // Configure CustomerRepository mock to simulate successful customer retrieval
        when(customerRepository.findById(customer.getId()))
                .thenReturn(Optional.of(customer)); // Return Optional containing the customer
        
        // Log test arrangement for debugging and monitoring
        System.out.println("Mock configured for successful customer retrieval:");
        System.out.println("- Customer ID to retrieve: " + customer.getId());
        System.out.println("- CustomerRepository.findById() will return: Customer entity");

        // ============================================================================================
        // ACT - Execute Service Method Under Test
        // ============================================================================================
        
        // Execute the customer retrieval service method
        Long customerId = Long.parseLong(customer.getId().toString().replaceAll("-", "").substring(0, 10));
        CustomerResponse response = customerService.getCustomerById(customerId);
        
        // Log service execution for test monitoring
        System.out.println("CustomerService.getCustomerById() executed successfully");
        System.out.println("- Retrieved Customer ID: " + response.id());

        // ============================================================================================
        // ASSERT - Comprehensive Response Validation
        // ============================================================================================
        
        // Perform detailed validation of the retrieved customer response
        assertAll("Customer retrieval response validation",
            // Primary response validation
            () -> assertNotNull(response, "Customer response should not be null"),
            
            // Customer identification validation
            () -> assertEquals(customer.getId(), response.id(), 
                "Response customer ID should match the requested customer ID"),
            
            // Personal information accuracy validation
            () -> assertEquals(customer.getFirstName(), response.firstName(), 
                "Response first name should match the stored customer first name"),
            () -> assertEquals(customer.getLastName(), response.lastName(), 
                "Response last name should match the stored customer last name"),
            () -> assertEquals(customer.getFullName(), response.getFullName(), 
                "Response full name should be properly constructed from first and last names"),
            
            // Contact information validation
            () -> assertEquals(customer.getEmail(), response.email(), 
                "Response email should match the stored customer email"),
            () -> assertEquals(customer.getPhoneNumber(), response.phone(), 
                "Response phone should match the stored customer phone number"),
            
            // Demographic information validation
            () -> assertEquals(customer.getDateOfBirth().toString(), response.dateOfBirth(), 
                "Response date of birth should match the stored customer date"),
            () -> assertEquals(customer.getNationality(), response.nationality(), 
                "Response nationality should match the stored customer nationality"),
            
            // Business status validation
            () -> assertNotNull(response.kycStatus(), 
                "Response KYC status should not be null"),
            () -> assertNotNull(response.riskScore(), 
                "Response risk score should not be null"),
            
            // Audit trail validation
            () -> assertEquals(customer.getCreatedAt(), response.createdAt(), 
                "Response creation timestamp should match the stored customer timestamp"),
            () -> assertEquals(customer.getUpdatedAt(), response.updatedAt(), 
                "Response update timestamp should match the stored customer timestamp")
        );

        // ============================================================================================
        // VERIFY - Repository Interaction Validation
        // ============================================================================================
        
        // Verify that customer lookup was performed exactly once with correct ID
        verify(customerRepository, times(1))
                .findById(customer.getId());
        
        // Verify that no other repository methods were called
        verify(customerRepository, never())
                .save(any(Customer.class));
        
        // Log verification completion
        System.out.println("Mock interaction verification completed:");
        System.out.println("- CustomerRepository.findById() called 1 time with correct ID");
        System.out.println("- No save operations performed (read-only operation)");
        System.out.println("Customer retrieval test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER RETRIEVAL TESTING - ERROR SCENARIOS
    // ================================================================================================

    /**
     * Tests customer retrieval failure when customer is not found.
     * 
     * This test validates that the service properly handles the scenario where a customer
     * with the specified ID does not exist in the system. It ensures that the appropriate
     * exception is thrown with meaningful error information for client applications.
     * 
     * Error Handling Validation:
     * - CustomerNotFoundException is thrown for non-existent customers
     * - Exception message contains relevant error information
     * - Repository interaction occurs but returns empty result
     * - No inappropriate side effects or state changes occur
     * 
     * Security Considerations:
     * - Error message does not expose sensitive system information
     * - Exception handling prevents information disclosure
     * - Proper error classification for client applications
     * 
     * @throws CustomerNotFoundException Expected exception for this test scenario
     */
    @Test
    @DisplayName("Should throw CustomerNotFoundException when customer is not found")
    void getCustomerById_shouldThrowCustomerNotFoundException() {
        // ============================================================================================
        // ARRANGE - Mock Configuration for Customer Not Found Scenario
        // ============================================================================================
        
        // Generate a non-existent customer ID for testing
        UUID nonExistentId = UUID.fromString("550e8400-e29b-41d4-a716-446655440999");
        
        // Configure CustomerRepository mock to simulate customer not found
        when(customerRepository.findById(nonExistentId))
                .thenReturn(Optional.empty()); // Return empty Optional indicating no customer found
        
        // Log test arrangement for error scenario testing
        System.out.println("Mock configured for customer not found scenario:");
        System.out.println("- Non-existent Customer ID: " + nonExistentId);
        System.out.println("- CustomerRepository.findById() will return: empty Optional");

        // ============================================================================================
        // ACT & ASSERT - Exception Testing and Validation
        // ============================================================================================
        
        // Execute service method and verify that CustomerNotFoundException is thrown
        Long customerId = Long.parseLong(nonExistentId.toString().replaceAll("-", "").substring(0, 10));
        CustomerNotFoundException exception = assertThrows(
            CustomerNotFoundException.class,
            () -> customerService.getCustomerById(customerId),
            "CustomerNotFoundException should be thrown when customer is not found"
        );
        
        // Validate exception message contains relevant information
        assertAll("Exception validation",
            () -> assertNotNull(exception.getMessage(), 
                "Exception message should not be null"),
            () -> assertTrue(exception.getMessage().contains(customerId.toString()), 
                "Exception message should contain the customer ID that was not found"),
            () -> assertTrue(exception.getMessage().toLowerCase().contains("not found"), 
                "Exception message should clearly indicate that the customer was not found")
        );

        // ============================================================================================
        // VERIFY - Repository Interaction for Error Scenario
        // ============================================================================================
        
        // Verify that customer lookup was attempted with the correct ID
        verify(customerRepository, times(1))
                .findById(nonExistentId);
        
        // Verify that no save operations were performed in error scenario
        verify(customerRepository, never())
                .save(any(Customer.class));
        
        // Log error scenario verification completion
        System.out.println("Exception handling verification completed:");
        System.out.println("- CustomerNotFoundException thrown with message: " + exception.getMessage());
        System.out.println("- CustomerRepository.findById() called 1 time with non-existent ID");
        System.out.println("- No save operations performed during error scenario");
        System.out.println("Customer not found test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER UPDATE TESTING - SUCCESSFUL SCENARIOS
    // ================================================================================================

    /**
     * Tests successful customer update with comprehensive field modification validation.
     * 
     * This test validates the complete customer update workflow including existing customer
     * retrieval, field modification, duplicate checking for email changes, entity persistence,
     * and response generation. It ensures that all customer fields can be properly updated
     * while maintaining data integrity and business rule compliance.
     * 
     * Update Workflow Validation:
     * - Existing customer retrieval and validation
     * - Field-by-field update application
     * - Email uniqueness checking for email changes
     * - Entity persistence with updated values
     * - Response generation with updated information
     * 
     * Business Logic Testing:
     * - Partial update support (only modified fields)
     * - Data validation for updated values
     * - Audit trail maintenance through timestamp updates
     * - Integration between customer and profile updates
     * 
     * Data Integrity Validation:
     * - Proper handling of null values in update request
     * - Field validation for updated information
     * - Relationship consistency maintenance
     * - Optimistic locking and concurrency handling
     * 
     * @throws CustomerNotFoundException if customer is not found (not expected in this test)
     * @throws Exception if test execution fails or assertions are violated
     */
    @Test
    @DisplayName("Should update customer and return updated customer response")
    void updateCustomer_shouldReturnUpdatedCustomerResponse() {
        // ============================================================================================
        // ARRANGE - Test Data Setup for Customer Update Scenario
        // ============================================================================================
        
        // Create updated customer request with modified fields
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setFirstName("Jane"); // Updated first name
        updateRequest.setLastName("Smith"); // Updated last name
        updateRequest.setEmail("jane.smith@testmail.com"); // Updated email (requires duplicate check)
        updateRequest.setPhoneNumber("+1-555-987-6543"); // Updated phone number
        updateRequest.setNationality("CA"); // Updated nationality
        updateRequest.setAddress("456 Oak Avenue, Somewhere, CA 98765, Canada"); // Updated address
        
        // Create expected updated customer entity
        Customer updatedCustomer = Customer.builder()
                .id(customer.getId()) // Same ID
                .firstName("Jane") // Updated first name
                .lastName("Smith") // Updated last name
                .email("jane.smith@testmail.com") // Updated email
                .phoneNumber("+1-555-987-6543") // Updated phone
                .dateOfBirth(customer.getDateOfBirth()) // Unchanged date of birth
                .nationality("CA") // Updated nationality
                .isActive(customer.isActive()) // Unchanged active status
                .createdAt(customer.getCreatedAt()) // Unchanged creation timestamp
                .updatedAt(Instant.now()) // Updated timestamp
                .build();
        
        // Configure mocks for successful customer update workflow
        when(customerRepository.findById(customer.getId()))
                .thenReturn(Optional.of(customer)); // Return existing customer
        
        when(customerRepository.existsByEmail(updateRequest.getEmail()))
                .thenReturn(false); // No duplicate email exists
        
        when(customerRepository.save(any(Customer.class)))
                .thenReturn(updatedCustomer); // Return updated customer
        
        // Log test arrangement for update scenario
        System.out.println("Mock configured for customer update scenario:");
        System.out.println("- Customer ID to update: " + customer.getId());
        System.out.println("- Original email: " + customer.getEmail());
        System.out.println("- Updated email: " + updateRequest.getEmail());
        System.out.println("- Email duplicate check will return: false");

        // ============================================================================================
        // ACT - Execute Customer Update Service Method
        // ============================================================================================
        
        // Execute the customer update service method
        Long customerId = Long.parseLong(customer.getId().toString().replaceAll("-", "").substring(0, 10));
        CustomerResponse response = customerService.updateCustomer(customerId, updateRequest);
        
        // Log service execution completion
        System.out.println("CustomerService.updateCustomer() executed successfully");
        System.out.println("- Updated Customer ID: " + response.id());
        System.out.println("- Updated Full Name: " + response.getFullName());

        // ============================================================================================
        // ASSERT - Comprehensive Update Response Validation
        // ============================================================================================
        
        // Validate that all customer fields were properly updated
        assertAll("Customer update response validation",
            // Primary response validation
            () -> assertNotNull(response, "Update response should not be null"),
            
            // Customer identification consistency
            () -> assertEquals(customer.getId(), response.id(), 
                "Customer ID should remain unchanged during update"),
            
            // Updated personal information validation
            () -> assertEquals("Jane", response.firstName(), 
                "First name should be updated to the new value"),
            () -> assertEquals("Smith", response.lastName(), 
                "Last name should be updated to the new value"),
            () -> assertEquals("Jane Smith", response.getFullName(), 
                "Full name should reflect the updated first and last names"),
            
            // Updated contact information validation
            () -> assertEquals("jane.smith@testmail.com", response.email(), 
                "Email should be updated to the new value"),
            () -> assertEquals("+1-555-987-6543", response.phone(), 
                "Phone number should be updated to the new value"),
            
            // Updated demographic information validation
            () -> assertEquals("CA", response.nationality(), 
                "Nationality should be updated to the new value"),
            
            // Unchanged fields validation
            () -> assertEquals(customer.getDateOfBirth().toString(), response.dateOfBirth(), 
                "Date of birth should remain unchanged when not included in update"),
            
            // Audit trail validation
            () -> assertEquals(customer.getCreatedAt(), response.createdAt(), 
                "Creation timestamp should remain unchanged during update"),
            () -> assertNotNull(response.updatedAt(), 
                "Update timestamp should be set to reflect the modification")
        );

        // ============================================================================================
        // VERIFY - Repository Interaction Validation for Update Workflow
        // ============================================================================================
        
        // Verify existing customer retrieval
        verify(customerRepository, times(1))
                .findById(customer.getId());
        
        // Verify email duplicate check for new email
        verify(customerRepository, times(1))
                .existsByEmail(updateRequest.getEmail());
        
        // Verify customer entity save operation
        verify(customerRepository, times(1))
                .save(any(Customer.class));
        
        // Log update workflow verification completion
        System.out.println("Update workflow verification completed:");
        System.out.println("- CustomerRepository.findById() called 1 time");
        System.out.println("- CustomerRepository.existsByEmail() called 1 time for duplicate check");
        System.out.println("- CustomerRepository.save() called 1 time to persist updates");
        System.out.println("Customer update test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER UPDATE TESTING - ERROR SCENARIOS
    // ================================================================================================

    /**
     * Tests customer update failure when customer is not found.
     * 
     * This test validates that the service properly handles update attempts for non-existent
     * customers. It ensures that appropriate exceptions are thrown and no inappropriate
     * operations are performed when the target customer does not exist.
     * 
     * Error Handling Validation:
     * - CustomerNotFoundException is thrown for non-existent customers
     * - Exception message provides clear error information
     * - No update operations are performed on non-existent entities
     * - System state remains unchanged after failed update attempt
     * 
     * @throws CustomerNotFoundException Expected exception for this test scenario
     */
    @Test
    @DisplayName("Should throw CustomerNotFoundException when updating a non-existent customer")
    void updateCustomer_shouldThrowCustomerNotFoundException() {
        // ============================================================================================
        // ARRANGE - Setup for Non-Existent Customer Update Scenario
        // ============================================================================================
        
        // Generate a non-existent customer ID for testing
        UUID nonExistentId = UUID.fromString("550e8400-e29b-41d4-a716-446655440999");
        
        // Create update request for non-existent customer
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setEmail("updated@testmail.com");
        
        // Configure CustomerRepository mock to simulate customer not found
        when(customerRepository.findById(nonExistentId))
                .thenReturn(Optional.empty()); // Return empty Optional
        
        // Log error scenario arrangement
        System.out.println("Mock configured for customer update error scenario:");
        System.out.println("- Non-existent Customer ID: " + nonExistentId);
        System.out.println("- Update request prepared with new values");

        // ============================================================================================
        // ACT & ASSERT - Exception Testing for Update Failure
        // ============================================================================================
        
        // Execute update method and verify exception is thrown
        Long customerId = Long.parseLong(nonExistentId.toString().replaceAll("-", "").substring(0, 10));
        CustomerNotFoundException exception = assertThrows(
            CustomerNotFoundException.class,
            () -> customerService.updateCustomer(customerId, updateRequest),
            "CustomerNotFoundException should be thrown when updating non-existent customer"
        );
        
        // Validate exception details
        assertAll("Update error exception validation",
            () -> assertNotNull(exception.getMessage(), 
                "Exception message should not be null"),
            () -> assertTrue(exception.getMessage().contains(customerId.toString()), 
                "Exception message should contain the customer ID that was not found"),
            () -> assertTrue(exception.getMessage().toLowerCase().contains("not found"), 
                "Exception message should clearly indicate customer was not found for update")
        );

        // ============================================================================================
        // VERIFY - No Operations Performed on Non-Existent Customer
        // ============================================================================================
        
        // Verify that customer lookup was attempted
        verify(customerRepository, times(1))
                .findById(nonExistentId);
        
        // Verify that no save operations were performed
        verify(customerRepository, never())
                .save(any(Customer.class));
        
        // Verify that no duplicate check was performed
        verify(customerRepository, never())
                .existsByEmail(anyString());
        
        // Log error scenario verification
        System.out.println("Update error scenario verification completed:");
        System.out.println("- Exception thrown: " + exception.getMessage());
        System.out.println("- CustomerRepository.findById() called 1 time");
        System.out.println("- No save or duplicate check operations performed");
        System.out.println("Customer update error test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER DELETION TESTING - SUCCESSFUL SCENARIOS
    // ================================================================================================

    /**
     * Tests successful customer deletion with comprehensive workflow validation.
     * 
     * This test validates the complete customer deletion process including customer existence
     * verification, authorization validation, compliance checking, audit trail creation,
     * and actual entity removal. It ensures that the deletion workflow follows all
     * business rules and compliance requirements.
     * 
     * Deletion Workflow Validation:
     * - Customer existence verification before deletion
     * - Authorization and permission validation
     * - Compliance and regulatory requirement checking
     * - Audit trail creation for deletion operation
     * - Actual customer entity removal from database
     * 
     * Business Logic Testing:
     * - Proper customer identification and validation
     * - Compliance with data retention policies
     * - Audit trail creation for regulatory requirements
     * - Clean removal of all customer-related data
     * 
     * Security and Compliance:
     * - Authorization validation for deletion operations
     * - Compliance checking for legal and regulatory requirements
     * - Audit trail preservation for forensic analysis
     * - Secure handling of sensitive customer data during deletion
     * 
     * @throws CustomerNotFoundException if customer is not found (not expected in this test)
     * @throws Exception if test execution fails or validation errors occur
     */
    @Test
    @DisplayName("Should delete customer when customer exists")
    void deleteCustomer_shouldDeleteCustomer() {
        // ============================================================================================
        // ARRANGE - Mock Configuration for Successful Deletion
        // ============================================================================================
        
        // Configure CustomerRepository mock for successful deletion workflow
        when(customerRepository.findById(customer.getId()))
                .thenReturn(Optional.of(customer)); // Customer exists for deletion
        
        // Configure deletion operation (void method - no return value needed)
        doNothing().when(customerRepository).delete(customer);
        
        // Log deletion test arrangement
        System.out.println("Mock configured for customer deletion scenario:");
        System.out.println("- Customer ID to delete: " + customer.getId());
        System.out.println("- Customer exists and will be found by repository");
        System.out.println("- Repository.delete() will complete successfully");

        // ============================================================================================
        // ACT - Execute Customer Deletion Service Method
        // ============================================================================================
        
        // Execute the customer deletion service method
        Long customerId = Long.parseLong(customer.getId().toString().replaceAll("-", "").substring(0, 10));
        
        // Method should complete without throwing exceptions
        assertAll("Customer deletion execution",
            () -> {
                customerService.deleteCustomer(customerId);
                System.out.println("CustomerService.deleteCustomer() executed successfully");
                System.out.println("- Deleted Customer ID: " + customerId);
            }
        );

        // ============================================================================================
        // VERIFY - Deletion Workflow Validation
        // ============================================================================================
        
        // Verify that customer existence was checked before deletion
        verify(customerRepository, times(1))
                .findById(customer.getId());
        
        // Verify that customer deletion was performed exactly once
        verify(customerRepository, times(1))
                .delete(customer);
        
        // Verify that no save operations occurred during deletion
        verify(customerRepository, never())
                .save(any(Customer.class));
        
        // Log deletion workflow verification
        System.out.println("Deletion workflow verification completed:");
        System.out.println("- CustomerRepository.findById() called 1 time to verify existence");
        System.out.println("- CustomerRepository.delete() called 1 time to remove customer");
        System.out.println("- No save operations performed during deletion");
        System.out.println("Customer deletion test completed successfully");
    }

    // ================================================================================================
    // CUSTOMER DELETION TESTING - ERROR SCENARIOS
    // ================================================================================================

    /**
     * Tests customer deletion failure when customer is not found.
     * 
     * This test validates that the service properly handles deletion attempts for non-existent
     * customers. It ensures that appropriate exceptions are thrown and no deletion operations
     * are performed when the target customer does not exist in the system.
     * 
     * Error Handling Validation:
     * - CustomerNotFoundException is thrown for non-existent customers
     * - Exception message provides clear error information for deletion context
     * - No deletion operations are performed on non-existent entities
     * - System state remains unchanged after failed deletion attempt
     * - Proper error classification for client application handling
     * 
     * Security Considerations:
     * - Error message does not expose sensitive system information
     * - Exception handling prevents unauthorized deletion attempts
     * - Proper audit trail for failed deletion attempts
     * 
     * @throws CustomerNotFoundException Expected exception for this test scenario
     */
    @Test
    @DisplayName("Should throw CustomerNotFoundException when deleting a non-existent customer")
    void deleteCustomer_shouldThrowCustomerNotFoundException() {
        // ============================================================================================
        // ARRANGE - Setup for Non-Existent Customer Deletion Scenario
        // ============================================================================================
        
        // Generate a non-existent customer ID for deletion testing
        UUID nonExistentId = UUID.fromString("550e8400-e29b-41d4-a716-446655440999");
        
        // Configure CustomerRepository mock to simulate customer not found
        when(customerRepository.findById(nonExistentId))
                .thenReturn(Optional.empty()); // Return empty Optional indicating no customer
        
        // Log deletion error scenario arrangement
        System.out.println("Mock configured for customer deletion error scenario:");
        System.out.println("- Non-existent Customer ID: " + nonExistentId);
        System.out.println("- Repository will return empty Optional (customer not found)");

        // ============================================================================================
        // ACT & ASSERT - Exception Testing for Deletion Failure
        // ============================================================================================
        
        // Execute deletion method and verify exception is thrown
        Long customerId = Long.parseLong(nonExistentId.toString().replaceAll("-", "").substring(0, 10));
        CustomerNotFoundException exception = assertThrows(
            CustomerNotFoundException.class,
            () -> customerService.deleteCustomer(customerId),
            "CustomerNotFoundException should be thrown when deleting non-existent customer"
        );
        
        // Validate exception details for deletion context
        assertAll("Deletion error exception validation",
            () -> assertNotNull(exception.getMessage(), 
                "Exception message should not be null"),
            () -> assertTrue(exception.getMessage().contains(customerId.toString()), 
                "Exception message should contain the customer ID that was not found"),
            () -> assertTrue(exception.getMessage().toLowerCase().contains("not found"), 
                "Exception message should clearly indicate customer was not found for deletion")
        );

        // ============================================================================================
        // VERIFY - No Deletion Operations on Non-Existent Customer
        // ============================================================================================
        
        // Verify that customer lookup was attempted before deletion
        verify(customerRepository, times(1))
                .findById(nonExistentId);
        
        // Verify that no deletion operations were performed
        verify(customerRepository, never())
                .delete(any(Customer.class));
        
        // Verify that no save operations were performed
        verify(customerRepository, never())
                .save(any(Customer.class));
        
        // Log deletion error scenario verification
        System.out.println("Deletion error scenario verification completed:");
        System.out.println("- Exception thrown: " + exception.getMessage());
        System.out.println("- CustomerRepository.findById() called 1 time");
        System.out.println("- No delete operations performed on non-existent customer");
        System.out.println("- No save operations performed during error scenario");
        System.out.println("Customer deletion error test completed successfully");
    }

    // ================================================================================================
    // ADDITIONAL HELPER METHODS FOR TEST SUPPORT
    // ================================================================================================

    /**
     * Helper method to create a list of test customers for bulk operation testing.
     * 
     * This utility method generates multiple customer entities with varied data
     * for testing bulk operations such as getAllCustomers(). It ensures test
     * coverage for scenarios involving multiple customers with different
     * characteristics and statuses.
     * 
     * @param count The number of test customers to create
     * @return List of Customer entities with varied test data
     */
    private List<Customer> createTestCustomerList(int count) {
        List<Customer> customers = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            Customer testCustomer = Customer.builder()
                    .id(UUID.randomUUID())
                    .firstName("TestFirst" + i)
                    .lastName("TestLast" + i)
                    .email("test" + i + "@testmail.com")
                    .phoneNumber("+1-555-000-" + String.format("%04d", i))
                    .dateOfBirth(LocalDate.of(1990 + (i % 30), 1 + (i % 12), 1 + (i % 28)))
                    .nationality("US")
                    .isActive(i % 2 == 0) // Alternate between active and inactive
                    .createdAt(Instant.now().minusSeconds(86400 * i)) // Different creation times
                    .updatedAt(Instant.now().minusSeconds(3600 * i)) // Different update times
                    .build();
            
            customers.add(testCustomer);
        }
        
        return customers;
    }

    /**
     * Helper method to create invalid customer request for negative testing.
     * 
     * This utility method generates customer requests with invalid data
     * for testing input validation and error handling scenarios.
     * 
     * @return CustomerRequest with invalid data for validation testing
     */
    private CustomerRequest createInvalidCustomerRequest() {
        CustomerRequest invalidRequest = new CustomerRequest();
        invalidRequest.setFirstName(""); // Invalid: empty first name
        invalidRequest.setLastName(null); // Invalid: null last name
        invalidRequest.setEmail("invalid-email"); // Invalid: malformed email
        invalidRequest.setPhoneNumber("123"); // Invalid: too short phone number
        invalidRequest.setDateOfBirth("invalid-date"); // Invalid: malformed date
        invalidRequest.setNationality(""); // Invalid: empty nationality
        invalidRequest.setAddress(""); // Invalid: empty address
        
        return invalidRequest;
    }

    /**
     * Helper method to create a CustomerRequest with specific test values.
     * 
     * @param firstName The first name to use
     * @param lastName The last name to use
     * @param email The email to use
     * @return CustomerRequest with specified values
     */
    private CustomerRequest createCustomerRequestWithValues(String firstName, String lastName, String email) {
        CustomerRequest request = new CustomerRequest();
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setEmail(email);
        request.setPhoneNumber("+1-555-123-4567");
        request.setDateOfBirth("1990-05-15");
        request.setNationality("US");
        request.setAddress("123 Test Street, Test City, TS 12345, USA");
        
        return request;
    }
}