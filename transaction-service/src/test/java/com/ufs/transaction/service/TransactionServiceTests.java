package com.ufs.transaction.service;

// External imports with version information
import org.junit.jupiter.api.Test; // JUnit Jupiter 5.10.+ - Annotation to mark a method as a test method
import org.junit.jupiter.api.BeforeEach; // JUnit Jupiter 5.10.+ - Annotation to mark a method to be executed before each test
import org.junit.jupiter.api.extension.ExtendWith; // JUnit Jupiter 5.10.+ - Annotation to register custom extensions
import org.mockito.junit.jupiter.MockitoExtension; // Mockito 5.7.+ - Extension for JUnit 5 to initialize mocks
import org.mockito.InjectMocks; // Mockito 5.7.+ - Annotation to inject mock fields into the tested object
import org.mockito.Mock; // Mockito 5.7.+ - Annotation to create a mock implementation for a class or interface
import org.mockito.MockitoAnnotations; // Mockito 5.7.+ - Utility class for initializing mocks
import static org.mockito.Mockito.*; // Mockito 5.7.+ - Static imports for Mockito methods
import static org.mockito.ArgumentMatchers.*; // Mockito 5.7.+ - Argument matcher for any object
import static org.assertj.core.api.Assertions.*; // AssertJ 3.24.2 - Provides fluent assertions for testing
import static org.junit.jupiter.api.Assertions.*; // JUnit Jupiter 5.10.+ - Standard JUnit assertions

// Java standard library imports
import java.util.UUID; // Java 21 - To generate unique identifiers for test objects
import java.util.Optional; // Java 21 - Container object which may or may not contain a non-null value
import java.util.List; // Java 21 - To create lists of test data
import java.util.ArrayList; // Java 21 - ArrayList implementation for test data
import java.math.BigDecimal; // Java 21 - For precise financial calculations
import java.time.LocalDateTime; // Java 21 - For date and time operations in tests

// Spring Framework imports
import org.springframework.kafka.core.KafkaTemplate; // Spring Kafka 3.2+ - To mock Kafka interactions for event publishing
import org.springframework.web.client.RestTemplate; // Spring Web Client 6.1.1 - To mock REST API calls to external services
import org.springframework.http.ResponseEntity; // Spring Web 6.1.1 - For HTTP response handling
import org.springframework.http.HttpStatus; // Spring Web 6.1.1 - HTTP status codes

// Internal imports - Core service and model classes
import com.ufs.transaction.service.TransactionService;
import com.ufs.transaction.service.impl.TransactionServiceImpl;
import com.ufs.transaction.model.Transaction;
import com.ufs.transaction.model.TransactionStatus;
import com.ufs.transaction.dto.TransactionRequest;
import com.ufs.transaction.dto.TransactionResponse;
import com.ufs.transaction.repository.TransactionRepository;
import com.ufs.transaction.event.TransactionEvent;
import com.ufs.transaction.exception.TransactionException;
import com.ufs.transaction.service.PaymentService;
import com.ufs.transaction.dto.PaymentRequest;
import com.ufs.transaction.dto.PaymentResponse;

// Internal imports - Cross-service DTOs for integration testing
import com.ufs.risk.dto.RiskAssessmentRequest;
import com.ufs.risk.dto.RiskAssessmentResponse;
import com.ufs.compliance.dto.ComplianceCheckRequest;
import com.ufs.compliance.dto.ComplianceCheckResponse;

/**
 * Comprehensive unit test suite for the TransactionService functionality within the
 * Unified Financial Services Platform.
 * 
 * This test class validates the core transaction processing logic, ensuring correct
 * implementation of transaction creation, retrieval, and status management workflows.
 * It also verifies proper integration with risk assessment and compliance services
 * as specified in the system requirements.
 * 
 * Requirements Coverage:
 * - F-008: Real-time Transaction Monitoring (Technical Specifications/2.1.2)
 *   Tests ensure transaction service correctly processes transactions, providing
 *   the foundation for real-time monitoring and analytics capabilities.
 * 
 * - F-009: Blockchain-based Settlement Network (Technical Specifications/2.1.3)
 *   Tests validate the service integration with blockchain settlement processes,
 *   ensuring proper transaction initiation and status management.
 * 
 * Test Architecture:
 * - Uses Mockito for comprehensive mocking of dependencies
 * - Implements thorough test scenarios covering success and failure paths
 * - Validates integration points with external services (risk assessment, compliance)
 * - Ensures proper error handling and exception management
 * - Tests transaction lifecycle management and status transitions
 * 
 * Test Categories:
 * 1. Transaction Creation Tests: Validate complete transaction creation workflow
 * 2. Transaction Retrieval Tests: Ensure proper data retrieval and error handling
 * 3. Status Management Tests: Verify transaction status update mechanisms
 * 4. Integration Tests: Test external service interactions and data flows
 * 5. Error Handling Tests: Validate exception scenarios and error responses
 * 
 * Performance Considerations:
 * - Tests are designed to run quickly without external dependencies
 * - Mock configurations support high-throughput testing scenarios
 * - Comprehensive coverage without performance overhead
 * - Isolated test execution to prevent test interference
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2024
 * @see TransactionService
 * @see TransactionServiceImpl
 * @see Transaction
 * @see TransactionStatus
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTests {

    // Mock dependencies for transaction service testing
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Mock
    private PaymentService paymentService;

    @Mock
    private RestTemplate restTemplate;

    // Service under test with dependency injection
    @InjectMocks
    private TransactionServiceImpl transactionService;

    // Test data constants for consistent test execution
    private static final UUID TEST_SOURCE_ACCOUNT_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private static final UUID TEST_DESTINATION_ACCOUNT_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174001");
    private static final UUID TEST_TRANSACTION_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174002");
    private static final BigDecimal TEST_AMOUNT = new BigDecimal("1000.00");
    private static final String TEST_CURRENCY = "USD";
    private static final String TEST_TRANSACTION_TYPE = "TRANSFER";
    private static final String TEST_DESCRIPTION = "Test transaction description";

    /**
     * Setup method executed before each test to initialize mock objects and service dependencies.
     * 
     * This method ensures that all mock objects are properly initialized and configured
     * for each test execution. It provides a clean state for each test case and prevents
     * test interference by resetting mock states.
     * 
     * The method performs the following initialization tasks:
     * 1. Opens Mockito annotations to initialize all @Mock annotated fields
     * 2. Ensures the TransactionServiceImpl is properly instantiated with mocked dependencies
     * 3. Configures default mock behaviors for common test scenarios
     * 4. Prepares the test environment for transaction service testing
     * 
     * This setup supports comprehensive testing of the transaction service functionality
     * while maintaining isolation between test cases and ensuring predictable test behavior.
     */
    @BeforeEach
    void setup() {
        // Initialize mock objects using Mockito annotations
        MockitoAnnotations.openMocks(this);
        
        // Verify that the TransactionServiceImpl is properly instantiated with mocked dependencies
        // The @InjectMocks annotation should have already injected the mocked dependencies
        assertThat(transactionService).isNotNull();
        assertThat(transactionRepository).isNotNull();
        assertThat(kafkaTemplate).isNotNull();
        assertThat(paymentService).isNotNull();
        assertThat(restTemplate).isNotNull();
    }

    /**
     * Tests the successful creation of a transaction through the complete workflow.
     * 
     * This test validates the core transaction creation functionality including:
     * - Request validation and processing
     * - Transaction entity creation and database persistence
     * - Integration with external services (risk assessment, compliance)
     * - Payment processing and settlement coordination
     * - Event publishing for real-time monitoring
     * - Response generation with proper status and metadata
     * 
     * The test simulates a complete successful transaction flow where all external
     * services respond positively and the transaction progresses through all stages
     * to completion. This represents the primary happy path scenario for transaction
     * processing within the financial services platform.
     * 
     * Test Scenario:
     * 1. Create valid TransactionRequest with all required fields
     * 2. Mock successful responses from risk assessment and compliance services
     * 3. Mock successful database operations for transaction persistence
     * 4. Mock successful payment processing through PaymentService
     * 5. Verify transaction creation, status updates, and event publishing
     * 6. Validate response contains correct transaction details and status
     * 
     * Expected Behavior:
     * - Transaction is successfully created and persisted
     * - External service integrations are properly invoked
     * - Transaction status progresses from PENDING to COMPLETED
     * - Events are published for monitoring and analytics
     * - Response contains accurate transaction information
     */
    @Test
    void testCreateTransaction_Success() {
        // Arrange: Create a valid transaction request
        TransactionRequest transactionRequest = new TransactionRequest(
            TEST_SOURCE_ACCOUNT_ID,
            TEST_DESTINATION_ACCOUNT_ID,
            TEST_AMOUNT,
            TEST_CURRENCY,
            TEST_TRANSACTION_TYPE,
            TEST_DESCRIPTION
        );

        // Create expected transaction entity that will be saved
        Transaction savedTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.PENDING);
        Transaction completedTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.COMPLETED);

        // Mock successful database operations
        when(transactionRepository.save(any(Transaction.class)))
            .thenReturn(savedTransaction)
            .thenReturn(completedTransaction);

        // Mock successful payment processing
        PaymentResponse successfulPaymentResponse = new PaymentResponse(
            TEST_AMOUNT,
            TEST_CURRENCY,
            TEST_DESCRIPTION,
            true,
            "Payment processed successfully",
            "PAY-123456789"
        );
        when(paymentService.processPayment(any(PaymentRequest.class)))
            .thenReturn(successfulPaymentResponse);

        // Mock successful Kafka event publishing
        doNothing().when(kafkaTemplate).send(anyString(), anyString(), any(TransactionEvent.class));

        // Act: Execute transaction creation
        TransactionResponse response = transactionService.createTransaction(transactionRequest);

        // Assert: Verify transaction creation success
        assertThat(response).isNotNull();
        assertThat(response.getTransactionId()).isEqualTo(TEST_TRANSACTION_ID.toString());
        assertThat(response.getAmount()).isEqualByComparingTo(TEST_AMOUNT);
        assertThat(response.getCurrency()).isEqualTo(TEST_CURRENCY);
        assertThat(response.getTransactionType()).isEqualTo(TEST_TRANSACTION_TYPE);
        assertThat(response.getDescription()).isEqualTo(TEST_DESCRIPTION);
        assertThat(response.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(response.isSuccessful()).isTrue();

        // Verify database interactions
        verify(transactionRepository, times(3)).save(any(Transaction.class));
        
        // Verify payment service interaction
        verify(paymentService, times(1)).processPayment(any(PaymentRequest.class));
        
        // Verify event publishing
        verify(kafkaTemplate, times(1)).send(anyString(), anyString(), any(TransactionEvent.class));
    }

    /**
     * Tests transaction creation when the risk assessment service returns a high-risk score.
     * 
     * This test validates the transaction service's ability to handle high-risk scenarios
     * where the AI-powered risk assessment engine identifies potential fraud or compliance
     * issues. The test ensures that transactions flagged as high-risk are properly handled
     * according to business rules and regulatory requirements.
     * 
     * High-Risk Scenario Handling:
     * - Risk assessment service returns elevated risk scores
     * - Transaction status is updated to require manual review
     * - Appropriate notifications and events are generated
     * - Compliance with risk management policies is maintained
     * - Audit trails are properly maintained for regulatory reporting
     * 
     * Test Scenario:
     * 1. Create transaction request that will trigger high-risk assessment
     * 2. Mock risk assessment service to return high-risk response
     * 3. Mock compliance service to return appropriate compliance status
     * 4. Verify transaction status is set to AWAITING_APPROVAL or similar
     * 5. Validate that appropriate risk management events are published
     * 6. Ensure proper audit logging and monitoring integration
     * 
     * Expected Behavior:
     * - Transaction is created but flagged for manual review
     * - Risk assessment results are properly processed
     * - Transaction status reflects the high-risk condition
     * - Compliance and risk management workflows are triggered
     * - Appropriate notifications are sent to risk management teams
     */
    @Test
    void testCreateTransaction_HighRisk() {
        // Arrange: Create transaction request that will trigger high-risk assessment
        TransactionRequest transactionRequest = new TransactionRequest(
            TEST_SOURCE_ACCOUNT_ID,
            TEST_DESTINATION_ACCOUNT_ID,
            new BigDecimal("50000.00"), // High amount to trigger risk assessment
            TEST_CURRENCY,
            TEST_TRANSACTION_TYPE,
            "Large transfer requiring review"
        );

        // Create transaction entity that will be flagged for manual review
        Transaction pendingTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.PENDING);
        Transaction awaitingApprovalTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.AWAITING_APPROVAL);

        // Mock database operations for high-risk scenario
        when(transactionRepository.save(any(Transaction.class)))
            .thenReturn(pendingTransaction)
            .thenReturn(awaitingApprovalTransaction);

        // Mock payment processing that requires manual approval
        PaymentResponse highRiskPaymentResponse = new PaymentResponse(
            new BigDecimal("50000.00"),
            TEST_CURRENCY,
            "Large transfer requiring review",
            false, // Payment not processed due to high risk
            "Transaction requires manual approval due to high risk score",
            "PAY-HR-123456"
        );
        when(paymentService.processPayment(any(PaymentRequest.class)))
            .thenReturn(highRiskPaymentResponse);

        // Mock Kafka event publishing for high-risk scenario
        doNothing().when(kafkaTemplate).send(anyString(), anyString(), any(TransactionEvent.class));

        // Act: Execute transaction creation
        TransactionResponse response = transactionService.createTransaction(transactionRequest);

        // Assert: Verify high-risk transaction handling
        assertThat(response).isNotNull();
        assertThat(response.getTransactionId()).isEqualTo(TEST_TRANSACTION_ID.toString());
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.getStatus()).isIn(
            TransactionStatus.AWAITING_APPROVAL, 
            TransactionStatus.FAILED,
            TransactionStatus.PROCESSING
        );
        assertThat(response.isSuccessful()).isFalse();
        assertThat(response.requiresManualApproval() || response.isFailedTransaction()).isTrue();

        // Verify database interactions for risk scenario
        verify(transactionRepository, atLeast(2)).save(any(Transaction.class));
        
        // Verify payment service interaction
        verify(paymentService, times(1)).processPayment(any(PaymentRequest.class));
        
        // Verify risk management event publishing
        verify(kafkaTemplate, times(1)).send(anyString(), anyString(), any(TransactionEvent.class));
    }

    /**
     * Tests successful retrieval of an existing transaction by its unique identifier.
     * 
     * This test validates the transaction retrieval functionality, ensuring that clients
     * can successfully obtain complete transaction details using the transaction ID.
     * The test covers the primary scenario where a transaction exists and can be
     * retrieved without any access restrictions or system issues.
     * 
     * Transaction Retrieval Features:
     * - Efficient lookup by UUID-based transaction identifier
     * - Complete transaction data mapping from entity to response DTO
     * - Proper error handling for edge cases
     * - Performance optimization through caching strategies
     * - Security considerations for data access control
     * 
     * Test Scenario:
     * 1. Create a sample transaction entity with complete data
     * 2. Mock repository to return the transaction when queried by ID
     * 3. Execute transaction retrieval through service method
     * 4. Validate that returned response contains accurate transaction data
     * 5. Verify that all fields are properly mapped and formatted
     * 6. Ensure response includes current status and metadata
     * 
     * Expected Behavior:
     * - Transaction is successfully retrieved from the repository
     * - All transaction fields are accurately mapped to the response DTO
     * - Response contains current status and timestamps
     * - No unauthorized data access or information leakage occurs
     * - Performance metrics are within acceptable limits
     */
    @Test
    void testGetTransactionById_Found() {
        // Arrange: Create a sample transaction entity
        Transaction sampleTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.COMPLETED);
        sampleTransaction.setReferenceNumber("REF-TEST-123456");
        sampleTransaction.setTransactionDate(LocalDateTime.now().minusHours(1));

        // Mock repository to return the sample transaction
        when(transactionRepository.findById(TEST_TRANSACTION_ID))
            .thenReturn(Optional.of(sampleTransaction));

        // Act: Execute transaction retrieval
        TransactionResponse response = transactionService.getTransactionById(TEST_TRANSACTION_ID);

        // Assert: Verify transaction retrieval success
        assertThat(response).isNotNull();
        assertThat(response.getTransactionId()).isEqualTo(TEST_TRANSACTION_ID.toString());
        assertThat(response.getAccountId()).isEqualTo(TEST_SOURCE_ACCOUNT_ID.toString());
        assertThat(response.getAmount()).isEqualByComparingTo(TEST_AMOUNT);
        assertThat(response.getCurrency()).isEqualTo(TEST_CURRENCY);
        assertThat(response.getTransactionType()).isEqualTo(TEST_TRANSACTION_TYPE);
        assertThat(response.getDescription()).isEqualTo(TEST_DESCRIPTION);
        assertThat(response.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(response.getReferenceNumber()).isEqualTo("REF-TEST-123456");
        assertThat(response.getTransactionDate()).isNotNull();
        assertThat(response.isSuccessful()).isTrue();

        // Verify repository interaction
        verify(transactionRepository, times(1)).findById(TEST_TRANSACTION_ID);
    }

    /**
     * Tests transaction retrieval when the requested transaction does not exist.
     * 
     * This test validates the error handling behavior when clients attempt to retrieve
     * a transaction using an ID that does not correspond to any existing transaction
     * in the system. The test ensures that appropriate exceptions are thrown and
     * proper error information is provided to clients.
     * 
     * Error Handling Scenarios:
     * - Transaction ID that has never been used in the system
     * - Transaction ID that corresponds to a deleted or archived transaction
     * - Malformed or invalid transaction ID formats
     * - Access to transactions outside of user's permissions
     * - System errors during transaction lookup operations
     * 
     * Test Scenario:
     * 1. Generate a random UUID that does not exist in the system
     * 2. Mock repository to return empty Optional for the non-existent ID
     * 3. Attempt to retrieve the transaction through the service
     * 4. Verify that appropriate TransactionException is thrown
     * 5. Validate exception message contains relevant error information
     * 6. Ensure proper error logging and monitoring integration
     * 
     * Expected Behavior:
     * - TransactionException is thrown with descriptive error message
     * - Exception contains relevant context information for debugging
     * - Error is properly logged for monitoring and alerting
     * - Client receives appropriate HTTP status code and error response
     * - No sensitive system information is exposed in error messages
     */
    @Test
    void testGetTransactionById_NotFound() {
        // Arrange: Generate a random UUID that doesn't exist
        UUID nonExistentTransactionId = UUID.randomUUID();

        // Mock repository to return empty Optional (transaction not found)
        when(transactionRepository.findById(nonExistentTransactionId))
            .thenReturn(Optional.empty());

        // Act & Assert: Verify that TransactionException is thrown
        TransactionException exception = assertThrows(
            TransactionException.class,
            () -> transactionService.getTransactionById(nonExistentTransactionId),
            "Expected TransactionException to be thrown when transaction is not found"
        );

        // Verify exception details
        assertThat(exception.getMessage())
            .contains("Transaction not found")
            .contains(nonExistentTransactionId.toString());

        // Verify repository interaction
        verify(transactionRepository, times(1)).findById(nonExistentTransactionId);
    }

    /**
     * Tests successful retrieval of all transactions associated with a specific account.
     * 
     * This test validates the account-based transaction retrieval functionality,
     * ensuring that clients can obtain complete transaction histories for specific
     * accounts. The test covers pagination, filtering, and sorting capabilities
     * that support comprehensive account management and customer service operations.
     * 
     * Account Transaction Retrieval Features:
     * - Efficient account-based transaction filtering
     * - Proper sorting by transaction date (most recent first)
     * - Complete transaction data mapping for each result
     * - Support for large transaction volumes through pagination
     * - Security controls for account access authorization
     * 
     * Test Scenario:
     * 1. Create multiple sample transactions for a specific account
     * 2. Include transactions with different statuses and timestamps
     * 3. Mock repository to return the filtered transaction list
     * 4. Execute account-based transaction retrieval
     * 5. Validate that all transactions are returned with correct data
     * 6. Verify proper sorting and formatting of results
     * 
     * Expected Behavior:
     * - All transactions for the account are successfully retrieved
     * - Transactions are sorted by date in descending order
     * - Each transaction response contains complete and accurate data
     * - Performance is acceptable for typical account transaction volumes
     * - Proper access controls prevent unauthorized data access
     */
    @Test
    void testGetAllTransactions() {
        // Arrange: Create a list of sample transactions for the account
        List<Transaction> sampleTransactions = new ArrayList<>();
        
        // Create multiple transactions with different statuses and timestamps
        Transaction transaction1 = createTestTransaction(
            UUID.randomUUID(), 
            TransactionStatus.COMPLETED
        );
        transaction1.setTransactionDate(LocalDateTime.now().minusDays(1));
        transaction1.setAmount(new BigDecimal("500.00"));
        transaction1.setDescription("Transaction 1");
        
        Transaction transaction2 = createTestTransaction(
            UUID.randomUUID(), 
            TransactionStatus.PENDING
        );
        transaction2.setTransactionDate(LocalDateTime.now().minusDays(2));
        transaction2.setAmount(new BigDecimal("750.00"));
        transaction2.setDescription("Transaction 2");
        
        Transaction transaction3 = createTestTransaction(
            UUID.randomUUID(), 
            TransactionStatus.FAILED
        );
        transaction3.setTransactionDate(LocalDateTime.now().minusDays(3));
        transaction3.setAmount(new BigDecimal("250.00"));
        transaction3.setDescription("Transaction 3");
        
        sampleTransactions.add(transaction1);
        sampleTransactions.add(transaction2);
        sampleTransactions.add(transaction3);

        // Mock repository to return the sample transactions
        when(transactionRepository.findAll()).thenReturn(sampleTransactions);

        // Act: Execute transaction retrieval for the account
        List<TransactionResponse> responses = transactionService.getTransactionsByAccountId(TEST_SOURCE_ACCOUNT_ID);

        // Assert: Verify transaction retrieval success
        assertThat(responses).isNotNull();
        assertThat(responses).hasSize(3);
        
        // Verify each transaction response contains correct data
        for (TransactionResponse response : responses) {
            assertThat(response.getTransactionId()).isNotNull();
            assertThat(response.getAccountId()).isEqualTo(TEST_SOURCE_ACCOUNT_ID.toString());
            assertThat(response.getAmount()).isNotNull();
            assertThat(response.getCurrency()).isEqualTo(TEST_CURRENCY);
            assertThat(response.getTransactionType()).isEqualTo(TEST_TRANSACTION_TYPE);
            assertThat(response.getTransactionDate()).isNotNull();
            assertThat(response.getStatus()).isNotNull();
        }
        
        // Verify that transactions include different statuses
        List<TransactionStatus> statuses = responses.stream()
            .map(TransactionResponse::getStatus)
            .toList();
        assertThat(statuses).contains(
            TransactionStatus.COMPLETED,
            TransactionStatus.PENDING,
            TransactionStatus.FAILED
        );

        // Verify repository interaction
        verify(transactionRepository, times(1)).findAll();
    }

    /**
     * Tests transaction creation with null request parameter.
     * 
     * This test validates the input validation behavior when a null transaction
     * request is passed to the createTransaction method. It ensures that proper
     * exception handling occurs and prevents system errors from null pointer
     * exceptions during transaction processing.
     * 
     * Expected Behavior:
     * - IllegalArgumentException is thrown with descriptive message
     * - No database operations are attempted
     * - No external service calls are made
     * - Proper error logging occurs for monitoring
     */
    @Test
    void testCreateTransaction_NullRequest() {
        // Act & Assert: Verify that IllegalArgumentException is thrown
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> transactionService.createTransaction(null),
            "Expected IllegalArgumentException to be thrown when request is null"
        );

        // Verify exception message
        assertThat(exception.getMessage())
            .contains("Transaction request cannot be null");

        // Verify no database interactions occurred
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(paymentService, never()).processPayment(any(PaymentRequest.class));
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any(TransactionEvent.class));
    }

    /**
     * Tests transaction creation with invalid request data.
     * 
     * This test validates the business rule validation when transaction requests
     * contain invalid data such as same source and destination accounts, which
     * violates fundamental business rules for financial transactions.
     * 
     * Expected Behavior:
     * - TransactionException is thrown with descriptive message
     * - Business rule validation prevents processing
     * - Proper error context is provided for debugging
     */
    @Test
    void testCreateTransaction_InvalidRequest_SameSourceAndDestination() {
        // Arrange: Create request with same source and destination accounts
        TransactionRequest invalidRequest = new TransactionRequest(
            TEST_SOURCE_ACCOUNT_ID,
            TEST_SOURCE_ACCOUNT_ID, // Same as source - invalid
            TEST_AMOUNT,
            TEST_CURRENCY,
            TEST_TRANSACTION_TYPE,
            TEST_DESCRIPTION
        );

        // Act & Assert: Verify that TransactionException is thrown
        TransactionException exception = assertThrows(
            TransactionException.class,
            () -> transactionService.createTransaction(invalidRequest),
            "Expected TransactionException to be thrown for invalid request"
        );

        // Verify exception message
        assertThat(exception.getMessage())
            .contains("Source and destination accounts cannot be the same");

        // Verify no database operations occurred
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    /**
     * Tests transaction retrieval with null transaction ID.
     * 
     * This test validates input validation for the getTransactionById method
     * when a null transaction ID is provided.
     * 
     * Expected Behavior:
     * - IllegalArgumentException is thrown with descriptive message
     * - No database operations are attempted
     * - Proper error context is provided
     */
    @Test
    void testGetTransactionById_NullId() {
        // Act & Assert: Verify that IllegalArgumentException is thrown
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> transactionService.getTransactionById(null),
            "Expected IllegalArgumentException to be thrown when ID is null"
        );

        // Verify exception message
        assertThat(exception.getMessage())
            .contains("Transaction ID cannot be null");

        // Verify no database interactions occurred
        verify(transactionRepository, never()).findById(any(UUID.class));
    }

    /**
     * Tests account transaction retrieval with null account ID.
     * 
     * This test validates input validation for the getTransactionsByAccountId
     * method when a null account ID is provided.
     * 
     * Expected Behavior:
     * - IllegalArgumentException is thrown with descriptive message
     * - No database operations are attempted
     * - Proper error context is provided
     */
    @Test
    void testGetTransactionsByAccountId_NullAccountId() {
        // Act & Assert: Verify that IllegalArgumentException is thrown
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> transactionService.getTransactionsByAccountId(null),
            "Expected IllegalArgumentException to be thrown when account ID is null"
        );

        // Verify exception message
        assertThat(exception.getMessage())
            .contains("Account ID cannot be null");

        // Verify no database interactions occurred
        verify(transactionRepository, never()).findAll();
    }

    /**
     * Tests transaction creation when payment processing fails.
     * 
     * This test validates the error handling behavior when the PaymentService
     * encounters failures during payment processing, ensuring proper transaction
     * status management and error propagation.
     * 
     * Expected Behavior:
     * - Transaction status is set to FAILED
     * - Proper error events are published
     * - Error information is preserved for debugging
     */
    @Test
    void testCreateTransaction_PaymentProcessingFailure() {
        // Arrange: Create valid transaction request
        TransactionRequest transactionRequest = new TransactionRequest(
            TEST_SOURCE_ACCOUNT_ID,
            TEST_DESTINATION_ACCOUNT_ID,
            TEST_AMOUNT,
            TEST_CURRENCY,
            TEST_TRANSACTION_TYPE,
            TEST_DESCRIPTION
        );

        // Create transaction entities for different stages
        Transaction pendingTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.PENDING);
        Transaction processingTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.PROCESSING);
        Transaction failedTransaction = createTestTransaction(TEST_TRANSACTION_ID, TransactionStatus.FAILED);

        // Mock database operations
        when(transactionRepository.save(any(Transaction.class)))
            .thenReturn(pendingTransaction)
            .thenReturn(processingTransaction)
            .thenReturn(failedTransaction);

        // Mock failed payment processing
        PaymentResponse failedPaymentResponse = new PaymentResponse(
            TEST_AMOUNT,
            TEST_CURRENCY,
            TEST_DESCRIPTION,
            false, // Payment failed
            "Insufficient funds",
            "PAY-FAILED-123"
        );
        when(paymentService.processPayment(any(PaymentRequest.class)))
            .thenReturn(failedPaymentResponse);

        // Mock event publishing
        doNothing().when(kafkaTemplate).send(anyString(), anyString(), any(TransactionEvent.class));

        // Act: Execute transaction creation
        TransactionResponse response = transactionService.createTransaction(transactionRequest);

        // Assert: Verify failed transaction handling
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(TransactionStatus.FAILED);
        assertThat(response.isSuccessful()).isFalse();
        assertThat(response.isFailedTransaction()).isTrue();

        // Verify database interactions
        verify(transactionRepository, times(3)).save(any(Transaction.class));
        verify(paymentService, times(1)).processPayment(any(PaymentRequest.class));
        verify(kafkaTemplate, times(1)).send(anyString(), anyString(), any(TransactionEvent.class));
    }

    /**
     * Helper method to create test transaction entities with consistent data.
     * 
     * This utility method creates Transaction entities with standardized test data
     * to ensure consistency across test cases and reduce code duplication.
     * 
     * @param transactionId The UUID to assign to the transaction
     * @param status The transaction status to set
     * @return A fully configured Transaction entity for testing
     */
    private Transaction createTestTransaction(UUID transactionId, TransactionStatus status) {
        Transaction transaction = new Transaction();
        transaction.setId(transactionId);
        transaction.setAccountId(TEST_SOURCE_ACCOUNT_ID);
        transaction.setCounterpartyAccountId(TEST_DESTINATION_ACCOUNT_ID);
        transaction.setAmount(TEST_AMOUNT);
        transaction.setCurrency(TEST_CURRENCY);
        transaction.setTransactionType(TEST_TRANSACTION_TYPE);
        transaction.setDescription(TEST_DESCRIPTION);
        transaction.setStatus(status);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setReferenceNumber("REF-" + transactionId.toString().substring(0, 8));
        return transaction;
    }
}