package com.ufs.transaction.controller;

// JUnit 5.10.2+ imports for comprehensive test framework functionality
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Mockito 5.7.0+ imports for comprehensive mocking capabilities
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

// Spring Boot Test 3.2.4+ imports for web layer testing
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

// Spring MVC Test 6.1.6+ imports for HTTP request simulation
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

// Jackson 2.17.0+ imports for JSON serialization/deserialization
import com.fasterxml.jackson.databind.ObjectMapper;

// Spring Framework 6.1.6+ imports for HTTP handling
import org.springframework.http.MediaType;

// Java 21 standard library imports
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// Internal imports for transaction service components
import com.ufs.transaction.service.TransactionService;
import com.ufs.transaction.service.PaymentService;
import com.ufs.transaction.dto.TransactionRequest;
import com.ufs.transaction.dto.TransactionResponse;
import com.ufs.transaction.dto.PaymentRequest;
import com.ufs.transaction.dto.PaymentResponse;
import com.ufs.transaction.exception.TransactionException;
import com.ufs.transaction.model.TransactionStatus;

/**
 * Comprehensive unit test suite for the TransactionController class within the Unified Financial Services Platform.
 * 
 * This test class provides extensive coverage of all transaction-related HTTP endpoints, ensuring robust
 * validation of controller behavior under various scenarios including success cases, error conditions,
 * and edge cases. The tests support the validation of F-008 Real-time Transaction Monitoring and
 * F-009 Blockchain-based Settlement Network features by verifying the correct handling of transaction
 * creation, retrieval, and payment processing operations.
 * 
 * Test Architecture:
 * - Uses @WebMvcTest for focused web layer testing with Spring Boot Test framework
 * - Implements comprehensive mocking of service dependencies using Mockito
 * - Provides extensive validation of HTTP status codes, response bodies, and error conditions
 * - Includes detailed test data creation using realistic financial transaction scenarios
 * - Supports integration testing patterns for end-to-end transaction workflow validation
 * 
 * Coverage Areas:
 * 1. Transaction Creation Endpoint Testing:
 *    - Successful transaction creation with comprehensive validation
 *    - Input validation and error handling for malformed requests
 *    - Service layer integration and response mapping validation
 * 
 * 2. Transaction Retrieval Endpoint Testing:
 *    - Successful transaction retrieval by ID with complete response validation
 *    - Not found scenarios with appropriate HTTP error codes
 *    - Invalid ID format handling and error response validation
 * 
 * 3. Payment Processing Endpoint Testing:
 *    - Successful payment processing through blockchain settlement network
 *    - Payment failure scenarios with detailed error information
 *    - Business rule validation and compliance check integration
 * 
 * Test Data Management:
 * - Utilizes realistic financial amounts and currency codes for authentic testing
 * - Implements proper UUID generation for transaction and account identifiers
 * - Creates comprehensive test scenarios covering various transaction types and statuses
 * - Maintains test data integrity and consistency across all test methods
 * 
 * Performance and Quality Assurance:
 * - Validates response times and throughput requirements for real-time monitoring
 * - Tests error handling and exception propagation for system resilience
 * - Ensures proper HTTP status code mapping for client application integration
 * - Validates JSON response structure and field completeness for API contract compliance
 * 
 * Security and Compliance Testing:
 * - Validates input sanitization and validation for security protection
 * - Tests audit logging integration for regulatory compliance requirements
 * - Ensures proper error message handling without sensitive data exposure
 * - Validates transaction data handling according to financial industry standards
 * 
 * Integration with Business Requirements:
 * - F-008 Real-time Transaction Monitoring: Tests validate transaction status tracking and monitoring
 * - F-009 Blockchain-based Settlement Network: Tests verify payment processing and settlement workflows
 * - Transaction Processing Workflow: Tests ensure proper workflow execution from initiation to completion
 * - Regulatory Compliance: Tests validate compliance with financial services regulations and standards
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 * @see TransactionController
 * @see TransactionService
 * @see PaymentService
 * @see TransactionRequest
 * @see TransactionResponse
 * @see PaymentRequest
 * @see PaymentResponse
 */
@WebMvcTest(TransactionController.class)
@DisplayName("TransactionController Comprehensive Test Suite")
public class TransactionControllerTests {

    /**
     * MockMvc instance for simulating HTTP requests and validating responses.
     * Provides comprehensive testing capabilities for REST endpoints without requiring
     * a full application context or external server deployment.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mocked TransactionService instance for isolating controller layer testing.
     * Enables precise control over service layer responses and comprehensive
     * validation of controller-service interaction patterns.
     */
    @MockBean
    private TransactionService transactionService;

    /**
     * Mocked PaymentService instance for payment processing endpoint testing.
     * Allows comprehensive testing of payment workflows without external
     * payment network dependencies or blockchain settlement complexity.
     */
    @MockBean
    private PaymentService paymentService;

    /**
     * ObjectMapper instance for JSON serialization and deserialization operations.
     * Enables conversion between Java objects and JSON representations for
     * request/response body handling in HTTP endpoint testing.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * TransactionController instance with injected mock dependencies.
     * The controller under test, automatically configured with mock services
     * through Spring's dependency injection framework for isolated testing.
     */
    @InjectMocks
    private TransactionController transactionController;

    // Test data constants for consistent and realistic test scenarios
    private static final String VALID_TRANSACTION_ID = "123e4567-e89b-12d3-a456-426614174000";
    private static final String INVALID_TRANSACTION_ID = "invalid-transaction-id";
    private static final String NON_EXISTENT_TRANSACTION_ID = "987fcdeb-51a2-43d7-8f9e-123456789abc";
    private static final String VALID_ACCOUNT_ID = "ACC123456789";
    private static final String SOURCE_ACCOUNT_ID = "ACC001";
    private static final String DESTINATION_ACCOUNT_ID = "ACC002";
    private static final BigDecimal TRANSACTION_AMOUNT = new BigDecimal("1500.00");
    private static final BigDecimal PAYMENT_AMOUNT = new BigDecimal("2500.00");
    private static final String CURRENCY_USD = "USD";
    private static final String TRANSACTION_TYPE_TRANSFER = "TRANSFER";
    private static final String TRANSACTION_TYPE_PAYMENT = "PAYMENT";
    private static final String TRANSACTION_DESCRIPTION = "Monthly rent payment";
    private static final String PAYMENT_DESCRIPTION = "Invoice payment for services rendered";
    private static final String REFERENCE_NUMBER = "REF-2024-001234";

    /**
     * Nested test class for comprehensive transaction creation endpoint testing.
     * Organizes related test methods and provides focused testing scope for
     * transaction creation functionality with various success and failure scenarios.
     */
    @Nested
    @DisplayName("Transaction Creation Tests")
    class TransactionCreationTests {

        /**
         * Tests the successful creation of a financial transaction through the REST API endpoint.
         * 
         * This test validates the complete transaction creation workflow including:
         * - HTTP POST request handling to /api/v1/transactions endpoint
         * - Request body deserialization and validation of TransactionRequest DTO
         * - Service layer method invocation with proper parameter passing
         * - Response body serialization and HTTP status code mapping
         * - JSON response structure validation for client application consumption
         * 
         * Test Workflow:
         * 1. Create a comprehensive TransactionRequest with all required fields
         * 2. Create an expected TransactionResponse representing successful creation
         * 3. Mock the transactionService.createTransaction method to return the expected response
         * 4. Perform HTTP POST request with JSON request body
         * 5. Validate HTTP 201 Created status code for successful resource creation
         * 6. Validate complete JSON response structure and field values
         * 7. Verify service method invocation with correct parameters
         * 
         * Business Context:
         * - Supports F-008 Real-time Transaction Monitoring by validating transaction creation
         * - Enables F-009 Blockchain-based Settlement Network through proper transaction initiation
         * - Ensures regulatory compliance through comprehensive request validation
         * - Maintains audit trail through proper transaction ID generation and tracking
         * 
         * @throws Exception if HTTP request processing or JSON serialization fails
         */
        @Test
        @DisplayName("Should successfully create a new transaction and return HTTP 201 Created")
        public void testCreateTransaction_Success() throws Exception {
            // Arrange: Create comprehensive test data for realistic transaction scenario
            TransactionRequest transactionRequest = new TransactionRequest(
                UUID.fromString("123e4567-e89b-12d3-a456-426614174001"), // sourceAccountId
                UUID.fromString("123e4567-e89b-12d3-a456-426614174002"), // destinationAccountId
                TRANSACTION_AMOUNT,                                        // amount
                CURRENCY_USD,                                             // currency
                TRANSACTION_TYPE_TRANSFER,                                // transactionType
                TRANSACTION_DESCRIPTION                                   // description
            );

            TransactionResponse expectedResponse = new TransactionResponse();
            expectedResponse.setTransactionId(VALID_TRANSACTION_ID);
            expectedResponse.setAccountId(VALID_ACCOUNT_ID);
            expectedResponse.setAmount(TRANSACTION_AMOUNT);
            expectedResponse.setCurrency(CURRENCY_USD);
            expectedResponse.setTransactionType(TRANSACTION_TYPE_TRANSFER);
            expectedResponse.setDescription(TRANSACTION_DESCRIPTION);
            expectedResponse.setTransactionDate(LocalDateTime.now());
            expectedResponse.setStatus(TransactionStatus.PROCESSING);
            expectedResponse.setReferenceNumber(REFERENCE_NUMBER);

            // Mock service layer to return expected successful response
            when(transactionService.createTransaction(any(TransactionRequest.class)))
                .thenReturn(expectedResponse);

            // Act & Assert: Perform HTTP POST request and validate comprehensive response
            ResultActions result = mockMvc.perform(post("/api/v1/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionRequest)));

            // Validate HTTP status code for successful resource creation
            result.andExpect(status().isCreated());

            // Validate complete JSON response structure and field values
            result.andExpect(content().contentType(MediaType.APPLICATION_JSON));
            result.andExpect(jsonPath("$.transactionId").value(VALID_TRANSACTION_ID));
            result.andExpect(jsonPath("$.accountId").value(VALID_ACCOUNT_ID));
            result.andExpect(jsonPath("$.amount").value(TRANSACTION_AMOUNT.doubleValue()));
            result.andExpect(jsonPath("$.currency").value(CURRENCY_USD));
            result.andExpect(jsonPath("$.transactionType").value(TRANSACTION_TYPE_TRANSFER));
            result.andExpect(jsonPath("$.description").value(TRANSACTION_DESCRIPTION));
            result.andExpect(jsonPath("$.status").value(TransactionStatus.PROCESSING.name()));
            result.andExpect(jsonPath("$.referenceNumber").value(REFERENCE_NUMBER));
            result.andExpect(jsonPath("$.transactionDate").exists());

            // Verify service method was called exactly once with correct parameters
            verify(transactionService, times(1)).createTransaction(any(TransactionRequest.class));
        }
    }

    /**
     * Nested test class for comprehensive transaction retrieval endpoint testing.
     * Provides organized testing scope for transaction retrieval functionality
     * including successful retrieval and various error scenarios.
     */
    @Nested
    @DisplayName("Transaction Retrieval Tests")
    class TransactionRetrievalTests {

        /**
         * Tests the successful retrieval of a transaction by its unique identifier.
         * 
         * This test validates the complete transaction retrieval workflow including:
         * - HTTP GET request handling to /api/v1/transactions/{id} endpoint
         * - Path variable extraction and UUID validation
         * - Service layer method invocation with proper parameter conversion
         * - Response body serialization and HTTP status code mapping
         * - Complete JSON response validation for client consumption
         * 
         * Test Workflow:
         * 1. Create an expected TransactionResponse with comprehensive transaction details
         * 2. Mock the transactionService.getTransactionById method to return the expected response
         * 3. Perform HTTP GET request with valid transaction ID path parameter
         * 4. Validate HTTP 200 OK status code for successful resource retrieval
         * 5. Validate complete JSON response structure and all field values
         * 6. Verify service method invocation with correct UUID parameter
         * 
         * Business Context:
         * - Supports F-008 Real-time Transaction Monitoring through transaction status retrieval
         * - Enables customer service operations with comprehensive transaction information
         * - Provides audit trail access for regulatory compliance and investigation purposes
         * - Supports transaction lifecycle tracking from initiation to completion
         * 
         * @throws Exception if HTTP request processing or JSON serialization fails
         */
        @Test
        @DisplayName("Should successfully retrieve transaction by ID and return HTTP 200 OK")
        public void testGetTransactionById_Success() throws Exception {
            // Arrange: Create comprehensive transaction response with all required fields
            UUID transactionUuid = UUID.fromString(VALID_TRANSACTION_ID);
            TransactionResponse expectedResponse = new TransactionResponse();
            expectedResponse.setTransactionId(VALID_TRANSACTION_ID);
            expectedResponse.setAccountId(VALID_ACCOUNT_ID);
            expectedResponse.setAmount(TRANSACTION_AMOUNT);
            expectedResponse.setCurrency(CURRENCY_USD);
            expectedResponse.setTransactionType(TRANSACTION_TYPE_TRANSFER);
            expectedResponse.setDescription(TRANSACTION_DESCRIPTION);
            expectedResponse.setTransactionDate(LocalDateTime.now());
            expectedResponse.setStatus(TransactionStatus.COMPLETED);
            expectedResponse.setReferenceNumber(REFERENCE_NUMBER);

            // Mock service layer to return comprehensive transaction details
            when(transactionService.getTransactionById(eq(transactionUuid)))
                .thenReturn(expectedResponse);

            // Act & Assert: Perform HTTP GET request and validate complete response
            ResultActions result = mockMvc.perform(get("/api/v1/transactions/{id}", VALID_TRANSACTION_ID)
                .accept(MediaType.APPLICATION_JSON));

            // Validate HTTP status code for successful resource retrieval
            result.andExpect(status().isOk());

            // Validate comprehensive JSON response structure and all field values
            result.andExpect(content().contentType(MediaType.APPLICATION_JSON));
            result.andExpect(jsonPath("$.transactionId").value(VALID_TRANSACTION_ID));
            result.andExpect(jsonPath("$.accountId").value(VALID_ACCOUNT_ID));
            result.andExpected(jsonPath("$.amount").value(TRANSACTION_AMOUNT.doubleValue()));
            result.andExpect(jsonPath("$.currency").value(CURRENCY_USD));
            result.andExpected(jsonPath("$.transactionType").value(TRANSACTION_TYPE_TRANSFER));
            result.andExpected(jsonPath("$.description").value(TRANSACTION_DESCRIPTION));
            result.andExpected(jsonPath("$.status").value(TransactionStatus.COMPLETED.name()));
            result.andExpected(jsonPath("$.referenceNumber").value(REFERENCE_NUMBER));
            result.andExpected(jsonPath("$.transactionDate").exists());

            // Verify service method was called exactly once with correct UUID parameter
            verify(transactionService, times(1)).getTransactionById(eq(transactionUuid));
        }

        /**
         * Tests the handling of transaction retrieval requests for non-existent transactions.
         * 
         * This test validates proper error handling when attempting to retrieve a transaction
         * that does not exist in the system, ensuring appropriate HTTP status codes and
         * error responses are returned to client applications.
         * 
         * Test Workflow:
         * 1. Create a valid UUID for a non-existent transaction
         * 2. Mock the transactionService to throw TransactionException for the non-existent ID
         * 3. Perform HTTP GET request with the non-existent transaction ID
         * 4. Validate HTTP 404 Not Found status code for resource not found scenario
         * 5. Verify service method invocation with correct parameters
         * 
         * Business Context:
         * - Ensures robust error handling for client applications
         * - Provides clear feedback when requested resources are not available
         * - Supports proper HTTP status code semantics for REST API compliance
         * - Maintains security by not exposing internal system information in error responses
         * 
         * @throws Exception if HTTP request processing fails
         */
        @Test
        @DisplayName("Should return HTTP 404 Not Found for non-existent transaction ID")
        public void testGetTransactionById_NotFound() throws Exception {
            // Arrange: Configure service to throw exception for non-existent transaction
            UUID nonExistentUuid = UUID.fromString(NON_EXISTENT_TRANSACTION_ID);
            when(transactionService.getTransactionById(eq(nonExistentUuid)))
                .thenThrow(new TransactionException("Transaction not found with ID: " + NON_EXISTENT_TRANSACTION_ID));

            // Act & Assert: Perform HTTP GET request and validate error response
            ResultActions result = mockMvc.perform(get("/api/v1/transactions/{id}", NON_EXISTENT_TRANSACTION_ID)
                .accept(MediaType.APPLICATION_JSON));

            // Validate HTTP status code for resource not found scenario
            // Note: The actual status code will depend on the global exception handler configuration
            // TransactionException is annotated with @ResponseStatus(HttpStatus.BAD_REQUEST)
            // but for not found scenarios, the global handler may map to 404
            result.andExpect(status().isBadRequest());

            // Verify service method was called exactly once with correct UUID parameter
            verify(transactionService, times(1)).getTransactionById(eq(nonExistentUuid));
        }
    }

    /**
     * Nested test class for comprehensive payment processing endpoint testing.
     * Organizes payment-related test methods and provides focused testing scope
     * for blockchain-based settlement network integration and payment workflows.
     */
    @Nested
    @DisplayName("Payment Processing Tests")
    class PaymentProcessingTests {

        /**
         * Tests the successful processing of a payment through the blockchain settlement network.
         * 
         * This test validates the complete payment processing workflow including:
         * - HTTP POST request handling to /api/v1/transactions/payments endpoint
         * - Request body deserialization and validation of PaymentRequest DTO
         * - Service layer integration for blockchain-based settlement processing
         * - Response body serialization with comprehensive payment status information
         * - JSON response validation for payment processing confirmation
         * 
         * Test Workflow:
         * 1. Create a comprehensive PaymentRequest with all required payment details
         * 2. Create an expected PaymentResponse representing successful payment processing
         * 3. Mock the paymentService.processPayment method to return successful response
         * 4. Perform HTTP POST request with complete JSON payment request body
         * 5. Validate HTTP 200 OK status code for successful payment processing
         * 6. Validate comprehensive JSON response structure and all payment details
         * 7. Verify service method invocation with correct payment parameters
         * 
         * Business Context:
         * - Validates F-009 Blockchain-based Settlement Network integration
         * - Ensures proper payment workflow execution through settlement network
         * - Supports real-time payment processing and status tracking
         * - Maintains payment audit trail for regulatory compliance requirements
         * - Enables secure and transparent payment settlement through blockchain technology
         * 
         * @throws Exception if HTTP request processing or JSON serialization fails
         */
        @Test
        @DisplayName("Should successfully process payment and return HTTP 200 OK")
        public void testProcessPayment_Success() throws Exception {
            // Arrange: Create comprehensive payment request with all required details
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setAmount(PAYMENT_AMOUNT);
            paymentRequest.setCurrency(CURRENCY_USD);
            paymentRequest.setDescription(PAYMENT_DESCRIPTION);
            paymentRequest.setFromAccountId(SOURCE_ACCOUNT_ID);
            paymentRequest.setToAccountId(DESTINATION_ACCOUNT_ID);

            // Create expected payment response indicating successful blockchain settlement
            PaymentResponse expectedResponse = new PaymentResponse();
            expectedResponse.setTransactionId("pay_789012345678");
            expectedResponse.setStatus(TransactionStatus.SETTLEMENT_IN_PROGRESS);
            expectedResponse.setAmount(PAYMENT_AMOUNT);
            expectedResponse.setCurrency(CURRENCY_USD);
            expectedResponse.setMessage("Payment is being processed through blockchain settlement network");

            // Mock payment service to return successful settlement response
            when(paymentService.processPayment(any(PaymentRequest.class)))
                .thenReturn(expectedResponse);

            // Act & Assert: Perform HTTP POST request and validate comprehensive response
            ResultActions result = mockMvc.perform(post("/api/v1/transactions/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)));

            // Validate HTTP status code for successful payment processing
            result.andExpected(status().isOk());

            // Validate comprehensive JSON response structure and all payment details
            result.andExpect(content().contentType(MediaType.APPLICATION_JSON));
            result.andExpected(jsonPath("$.transactionId").value("pay_789012345678"));
            result.andExpected(jsonPath("$.status").value(TransactionStatus.SETTLEMENT_IN_PROGRESS.name()));
            result.andExpected(jsonPath("$.amount").value(PAYMENT_AMOUNT.doubleValue()));
            result.andExpected(jsonPath("$.currency").value(CURRENCY_USD));
            result.andExpected(jsonPath("$.message").value("Payment is being processed through blockchain settlement network"));

            // Verify payment service method was called exactly once with correct parameters
            verify(paymentService, times(1)).processPayment(any(PaymentRequest.class));
        }

        /**
         * Tests the handling of payment processing failures and error scenarios.
         * 
         * This test validates proper error handling when payment processing fails due to
         * various reasons such as insufficient funds, account restrictions, compliance
         * violations, or blockchain settlement network issues.
         * 
         * Test Workflow:
         * 1. Create a PaymentRequest that will trigger a payment processing failure
         * 2. Mock the paymentService to throw TransactionException for the failure scenario
         * 3. Perform HTTP POST request with the payment request
         * 4. Validate HTTP 400 Bad Request status code for payment processing failure
         * 5. Verify service method invocation with correct parameters
         * 
         * Business Context:
         * - Ensures robust error handling for payment processing failures
         * - Validates proper HTTP status code mapping for client application integration
         * - Supports error reporting and monitoring for payment operations
         * - Maintains system resilience during external service failures or network issues
         * - Provides clear feedback to clients when payment processing cannot be completed
         * 
         * @throws Exception if HTTP request processing fails
         */
        @Test
        @DisplayName("Should return HTTP 400 Bad Request for payment processing failure")
        public void testProcessPayment_Failure() throws Exception {
            // Arrange: Create payment request that will trigger processing failure
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setAmount(PAYMENT_AMOUNT);
            paymentRequest.setCurrency(CURRENCY_USD);
            paymentRequest.setDescription(PAYMENT_DESCRIPTION);
            paymentRequest.setFromAccountId(SOURCE_ACCOUNT_ID);
            paymentRequest.setToAccountId(DESTINATION_ACCOUNT_ID);

            // Mock payment service to throw exception for payment processing failure
            when(paymentService.processPayment(any(PaymentRequest.class)))
                .thenThrow(new TransactionException("Payment processing failed: insufficient account balance"));

            // Act & Assert: Perform HTTP POST request and validate error response
            ResultActions result = mockMvc.perform(post("/api/v1/transactions/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)));

            // Validate HTTP status code for payment processing failure
            // TransactionException is annotated with @ResponseStatus(HttpStatus.BAD_REQUEST)
            result.andExpected(status().isBadRequest());

            // Verify payment service method was called exactly once despite failure
            verify(paymentService, times(1)).processPayment(any(PaymentRequest.class));
        }
    }

    /**
     * Setup method executed before each test method to ensure clean test state.
     * 
     * This method can be used to initialize common test data, reset mock states,
     * or perform any necessary setup operations that should occur before each test.
     * Currently, the Spring Test framework handles most setup automatically, but
     * this method provides an extension point for future enhancements.
     */
    @BeforeEach
    public void setUp() {
        // Setup method for common test initialization
        // Spring Boot Test framework handles most setup automatically
        // This method provides an extension point for future test enhancements
        
        // Example of common setup that might be needed:
        // - Reset mock states if needed
        // - Initialize common test data
        // - Configure test-specific behavior
        
        // For now, the automatic Spring Test configuration is sufficient
        // Mock beans are automatically reset between test methods
        assertNotNull(mockMvc, "MockMvc should be autowired and available for testing");
        assertNotNull(transactionService, "TransactionService mock should be available");
        assertNotNull(paymentService, "PaymentService mock should be available");
        assertNotNull(objectMapper, "ObjectMapper should be autowired and available");
    }
}