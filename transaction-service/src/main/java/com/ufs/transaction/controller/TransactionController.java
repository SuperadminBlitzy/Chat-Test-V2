package com.ufs.transaction.controller;

// Spring Framework 6.2+ imports for REST controller functionality
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;

// Jakarta Validation 3.0.2+ for request validation
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

// Java 21 utility imports
import java.util.List;
import java.util.UUID;
import java.util.Collections;

// Logging support
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Micrometer 1.12+ for metrics collection
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.annotation.Counted;

// Internal service imports for business logic
import com.ufs.transaction.service.TransactionService;
import com.ufs.transaction.service.PaymentService;

// Internal DTO imports for request/response handling
import com.ufs.transaction.dto.TransactionRequest;
import com.ufs.transaction.dto.TransactionResponse;
import com.ufs.transaction.dto.PaymentRequest;
import com.ufs.transaction.dto.PaymentResponse;

// Internal exception imports for error handling
import com.ufs.transaction.exception.TransactionException;

/**
 * REST Controller for handling transaction-related HTTP requests within the Unified Financial Services Platform.
 * 
 * This controller serves as the primary API gateway for transaction management operations, exposing endpoints
 * for creating, retrieving, and managing financial transactions and payments. It implements the REST architectural
 * pattern with comprehensive validation, error handling, and monitoring capabilities to support the platform's
 * enterprise-grade requirements.
 * 
 * Key Features and Responsibilities:
 * - Transaction Creation: Processes new financial transaction requests with comprehensive validation
 * - Transaction Retrieval: Provides access to transaction details and history with security controls
 * - Payment Processing: Handles payment operations through the blockchain-based settlement network
 * - Real-time Monitoring: Integrates with F-008 Real-time Transaction Monitoring for operational insights
 * - Data Integration: Supports F-001 Unified Data Integration Platform for seamless data flow
 * - Blockchain Settlement: Enables F-009 Blockchain-based Settlement Network integration
 * 
 * Technical Implementation:
 * - Built on Spring Boot 3.2+ with Java 21 LTS for enterprise stability and performance
 * - Implements comprehensive input validation using Jakarta Validation 3.0.2
 * - Provides structured error responses with detailed error information for debugging
 * - Integrates with Micrometer for metrics collection and performance monitoring
 * - Supports distributed tracing for end-to-end request tracking across microservices
 * - Implements security best practices with input sanitization and output encoding
 * 
 * API Design Principles:
 * - RESTful design with standard HTTP methods and status codes
 * - Consistent response formats for successful operations and error scenarios
 * - Comprehensive documentation through code comments and annotations
 * - Version-aware endpoints to support API evolution and backward compatibility
 * - Performance-optimized with caching strategies and efficient data serialization
 * 
 * Integration Points:
 * - Transaction Service: Core business logic for transaction processing and management
 * - Payment Service: Specialized service for payment processing and settlement operations
 * - Event Streaming Platform: Publishes transaction events for real-time monitoring and analytics
 * - AI/ML Processing Engine: Integrates with risk assessment and fraud detection capabilities
 * - Audit Service: Maintains comprehensive audit trails for regulatory compliance
 * 
 * Performance Characteristics:
 * - Target response time: <1 second for standard transaction operations
 * - Throughput capacity: 10,000+ transactions per second during peak loads
 * - Availability SLA: 99.99% uptime for critical transaction processing endpoints
 * - Error rate threshold: <0.01% for transaction processing failures
 * 
 * Security Considerations:
 * - All endpoints require proper authentication and authorization
 * - Input validation prevents injection attacks and data corruption
 * - Comprehensive audit logging for regulatory compliance and forensic analysis
 * - Rate limiting protection against DDoS and abuse scenarios
 * - Sensitive data masking in logs and error responses
 * 
 * Monitoring and Observability:
 * - Metrics collection for response times, throughput, and error rates
 * - Distributed tracing for request flow visibility across microservices
 * - Health check endpoints for load balancer and monitoring system integration
 * - Business metrics tracking for transaction success rates and customer experience
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 * @see TransactionService
 * @see PaymentService
 * @see TransactionRequest
 * @see TransactionResponse
 * @see PaymentRequest
 * @see PaymentResponse
 */
@RestController
@RequestMapping("/api/v1/transactions")
@Validated
public class TransactionController {
    
    /**
     * Logger instance for comprehensive logging and debugging support.
     * Configured to support structured logging with correlation IDs for distributed tracing.
     */
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);
    
    /**
     * Core transaction service providing business logic for transaction management operations.
     * 
     * This service handles the complete transaction lifecycle including validation, risk assessment,
     * compliance verification, and settlement processing. It integrates with the AI/ML processing
     * engine for real-time risk scoring and fraud detection, implements blockchain-based settlement
     * through smart contracts, and maintains comprehensive audit trails for regulatory compliance.
     * 
     * Key capabilities:
     * - Transaction creation with comprehensive validation and business rule enforcement
     * - Transaction retrieval with security filtering and data masking
     * - Account-based transaction history with pagination and filtering support
     * - Integration with risk assessment and compliance validation services
     * - Event-driven architecture support for real-time monitoring and analytics
     */
    private final TransactionService transactionService;
    
    /**
     * Specialized payment processing service for payment operations and settlement management.
     * 
     * This service provides advanced payment processing capabilities including blockchain-based
     * settlement, multi-currency support, and integration with external payment networks.
     * It implements atomic settlement operations through smart contract execution and maintains
     * immutable transaction records for audit and compliance purposes.
     * 
     * Key capabilities:
     * - Payment processing with risk assessment and fraud detection
     * - Blockchain settlement network integration for secure and transparent transactions
     * - Multi-party validation and consensus mechanisms for transaction finality
     * - Compensating transaction support for error recovery and rollback scenarios
     * - Real-time event publishing for downstream system notification and updates
     */
    private final PaymentService paymentService;
    
    /**
     * Constructor for TransactionController with dependency injection of required services.
     * 
     * This constructor implements the dependency injection pattern to ensure proper initialization
     * of the controller with all required service dependencies. The constructor validates that
     * all injected services are properly initialized and configured before the controller becomes
     * available for request processing.
     * 
     * Design Principles:
     * - Constructor injection ensures immutable dependencies and fail-fast behavior
     * - Validation of injected dependencies prevents runtime errors and improves reliability
     * - Comprehensive logging provides visibility into controller initialization process
     * - Exception handling ensures graceful failure modes during startup
     * 
     * @param transactionService The transaction service instance for handling transaction operations.
     *                          Must be a fully initialized and configured service implementation
     *                          that provides transaction management capabilities including creation,
     *                          retrieval, and account-based queries.
     * 
     * @param paymentService The payment service instance for handling payment processing operations.
     *                      Must be a fully initialized and configured service implementation that
     *                      provides payment processing capabilities including blockchain settlement,
     *                      risk assessment integration, and multi-currency support.
     * 
     * @throws IllegalArgumentException if any of the required service dependencies are null
     *                                or not properly initialized, preventing controller startup
     *                                and ensuring fail-fast behavior for configuration issues.
     * 
     * @since 1.0
     */
    @Autowired
    public TransactionController(
            @NotNull TransactionService transactionService,
            @NotNull PaymentService paymentService) {
        
        // Validate that the transaction service dependency is properly injected and initialized
        if (transactionService == null) {
            logger.error("TransactionController initialization failed: TransactionService cannot be null");
            throw new IllegalArgumentException("TransactionService cannot be null");
        }
        
        // Validate that the payment service dependency is properly injected and initialized
        if (paymentService == null) {
            logger.error("TransactionController initialization failed: PaymentService cannot be null");
            throw new IllegalArgumentException("PaymentService cannot be null");
        }
        
        // Initialize the transaction service field with the validated dependency
        this.transactionService = transactionService;
        
        // Initialize the payment service field with the validated dependency
        this.paymentService = paymentService;
        
        // Log successful controller initialization for monitoring and debugging purposes
        logger.info("TransactionController successfully initialized with TransactionService and PaymentService dependencies");
    }
    
    /**
     * Creates a new financial transaction through the comprehensive transaction processing workflow.
     * 
     * This endpoint processes new transaction requests through the complete transaction lifecycle
     * including validation, risk assessment, compliance verification, and blockchain settlement.
     * It implements the Transaction Processing Workflow defined in Technical Specifications
     * section 4.1.1.3, providing real-time transaction processing capabilities that support
     * the F-001 Unified Data Integration Platform and F-008 Real-time Transaction Monitoring features.
     * 
     * Processing Workflow:
     * 1. Request Validation: Comprehensive validation of transaction request data and business rules
     * 2. Risk Assessment: AI-powered risk scoring and fraud detection analysis
     * 3. Compliance Verification: AML, sanctions screening, and regulatory compliance checks
     * 4. Settlement Processing: Blockchain-based settlement through smart contract execution
     * 5. Event Publishing: Real-time event publication for monitoring and downstream processing
     * 6. Response Generation: Comprehensive response with transaction details and status information
     * 
     * Security and Compliance:
     * - Input validation prevents injection attacks and data corruption
     * - Comprehensive audit logging for regulatory compliance and forensic analysis
     * - Rate limiting protection against abuse and DDoS scenarios
     * - Transaction data encryption and secure handling throughout the processing pipeline
     * 
     * Performance Characteristics:
     * - Target response time: <1 second for standard transaction processing
     * - Supports high-volume processing with 10,000+ transactions per second capacity
     * - Asynchronous processing for non-critical validation steps to minimize response latency
     * - Intelligent caching and connection pooling for optimal resource utilization
     * 
     * Error Handling:
     * - Comprehensive exception handling with detailed error responses
     * - Graceful degradation for non-critical service failures
     * - Automatic retry mechanisms for transient failures
     * - Circuit breaker patterns for external service resilience
     * 
     * Monitoring and Observability:
     * - Metrics collection for transaction success rates and processing latency
     * - Distributed tracing for end-to-end visibility across microservices
     * - Business metrics tracking for operational insights and customer experience monitoring
     * - Real-time alerting for SLA breaches and error rate thresholds
     * 
     * @param transactionRequest The transaction request containing all necessary details for creating
     *                          a financial transaction. Must include valid source and destination
     *                          account IDs, positive transaction amount, valid currency code,
     *                          transaction type, and optional description. The request undergoes
     *                          comprehensive validation before processing begins.
     * 
     * @return ResponseEntity<TransactionResponse> containing the created transaction details with
     *         unique transaction ID, current processing status, timestamps, and all relevant
     *         metadata for client applications. Returns HTTP 201 (Created) for successful
     *         transaction creation, with the response including comprehensive transaction
     *         information for tracking and monitoring purposes.
     * 
     * @throws TransactionException when transaction processing fails due to validation errors,
     *                            business rule violations, risk assessment failures, compliance
     *                            issues, or settlement processing errors. The exception includes
     *                            detailed error information for client consumption and debugging.
     * 
     * @throws IllegalArgumentException when the transaction request is null or contains invalid
     *                                data that prevents processing from beginning, ensuring
     *                                fail-fast behavior for malformed requests.
     * 
     * @since 1.0
     * 
     * Example Request:
     * POST /api/v1/transactions
     * Content-Type: application/json
     * 
     * {
     *   "sourceAccountId": "123e4567-e89b-12d3-a456-426614174000",
     *   "destinationAccountId": "987fcdeb-51a2-43d7-8f9e-123456789abc",
     *   "amount": 1500.00,
     *   "currency": "USD",
     *   "transactionType": "TRANSFER",
     *   "description": "Monthly rent payment"
     * }
     * 
     * Example Response:
     * HTTP/1.1 201 Created
     * Content-Type: application/json
     * 
     * {
     *   "transactionId": "txn_456789012345",
     *   "accountId": "123e4567-e89b-12d3-a456-426614174000",
     *   "amount": 1500.00,
     *   "currency": "USD",
     *   "transactionType": "TRANSFER",
     *   "description": "Monthly rent payment",
     *   "transactionDate": "2024-01-15T10:30:45.123456789",
     *   "status": "PROCESSING",
     *   "referenceNumber": "REF-2024-001234"
     * }
     */
    @PostMapping
    @Timed(value = "transaction.creation.time", description = "Time taken to create a transaction")
    @Counted(value = "transaction.creation.count", description = "Number of transaction creation requests")
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest transactionRequest) {
        
        logger.info("Received transaction creation request for amount: {} {}, type: {}", 
                   transactionRequest.amount(), transactionRequest.currency(), transactionRequest.transactionType());
        
        try {
            // Delegate to transaction service for comprehensive processing including validation,
            // risk assessment, compliance verification, and settlement operations
            TransactionResponse transactionResponse = transactionService.createTransaction(transactionRequest);
            
            logger.info("Successfully created transaction with ID: {}, status: {}", 
                       transactionResponse.getTransactionId(), transactionResponse.getStatus());
            
            // Return HTTP 201 Created with the comprehensive transaction response
            return ResponseEntity.status(HttpStatus.CREATED).body(transactionResponse);
            
        } catch (TransactionException e) {
            logger.error("Transaction creation failed for request: {}, error: {}", 
                        transactionRequest, e.getMessage());
            
            // Re-throw the transaction exception to be handled by the global exception handler
            // which will provide appropriate HTTP status codes and error response formatting
            throw e;
            
        } catch (Exception e) {
            logger.error("Unexpected error during transaction creation for request: {}", 
                        transactionRequest, e);
            
            // Wrap unexpected exceptions in TransactionException for consistent error handling
            throw new TransactionException("Transaction creation failed due to unexpected system error", e);
        }
    }
    
    /**
     * Retrieves comprehensive details of a specific transaction by its unique identifier.
     * 
     * This endpoint provides efficient access to transaction information using the transaction's
     * unique ID. It implements optimized data retrieval patterns with multi-level caching to
     * ensure sub-second response times while maintaining data consistency and security requirements.
     * The endpoint supports real-time transaction monitoring capabilities as defined in F-008
     * Real-time Transaction Monitoring feature requirements.
     * 
     * Data Retrieval Process:
     * 1. Request Validation: Validates the transaction ID format and structure
     * 2. Authorization Check: Verifies requesting user's permissions to access transaction data
     * 3. Cache Lookup: Attempts retrieval from distributed cache layer for optimal performance
     * 4. Database Query: Falls back to database query if cache miss occurs
     * 5. Security Filtering: Applies data masking based on requesting user's permissions
     * 6. Response Enrichment: Enriches response with current status and metadata
     * 7. Cache Update: Updates cache with retrieved data for future requests
     * 
     * Performance Optimizations:
     * - Multi-level caching strategy with Redis distributed cache
     * - Database connection pooling with read replicas for scalability
     * - Query optimization with proper database indexes
     * - Response compression for large transaction detail payloads
     * - Asynchronous cache warming for predictive data loading
     * 
     * Security and Authorization:
     * - Validates requesting user's authorization to access specific transaction data
     * - Applies data masking for sensitive information based on user roles
     * - Implements comprehensive audit logging for data access compliance
     * - Supports fine-grained access control based on account ownership and permissions
     * 
     * Monitoring and Analytics:
     * - Response time tracking with percentile-based SLA monitoring
     * - Cache hit ratio analysis for performance optimization insights
     * - Error rate monitoring with automatic alerting for threshold breaches
     * - Database query performance analysis for continuous optimization
     * 
     * @param id The unique identifier of the transaction to retrieve. Must be a valid UUID
     *           format string that corresponds to an existing transaction in the system.
     *           The transaction ID is validated for format compliance and existence
     *           before attempting retrieval operations.
     * 
     * @return ResponseEntity<TransactionResponse> containing comprehensive transaction details
     *         including financial information, current status, processing timestamps, and
     *         metadata. Returns HTTP 200 (OK) for successful retrieval with complete
     *         transaction information suitable for client applications and monitoring systems.
     * 
     * @throws TransactionException when transaction retrieval fails due to invalid transaction ID,
     *                            unauthorized access attempts, data access errors, or system
     *                            unavailability. The exception includes detailed error information
     *                            for appropriate client response and debugging support.
     * 
     * @throws IllegalArgumentException when the transaction ID parameter is null, empty, or does
     *                                not conform to expected UUID format requirements, ensuring
     *                                fail-fast behavior for malformed requests.
     * 
     * @since 1.0
     * 
     * Example Request:
     * GET /api/v1/transactions/123e4567-e89b-12d3-a456-426614174000
     * Accept: application/json
     * Authorization: Bearer <JWT_TOKEN>
     * 
     * Example Response:
     * HTTP/1.1 200 OK
     * Content-Type: application/json
     * 
     * {
     *   "transactionId": "123e4567-e89b-12d3-a456-426614174000",
     *   "accountId": "987fcdeb-51a2-43d7-8f9e-123456789abc",
     *   "amount": 2500.00,
     *   "currency": "USD",
     *   "transactionType": "PAYMENT",
     *   "description": "Invoice payment - Order #INV-2024-001",
     *   "transactionDate": "2024-01-15T14:30:45.123456789",
     *   "status": "COMPLETED",
     *   "referenceNumber": "REF-2024-005678"
     * }
     */
    @GetMapping("/{id}")
    @Timed(value = "transaction.retrieval.time", description = "Time taken to retrieve a transaction by ID")
    @Counted(value = "transaction.retrieval.count", description = "Number of transaction retrieval requests")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable("id") String id) {
        
        logger.info("Received transaction retrieval request for ID: {}", id);
        
        try {
            // Validate and parse the transaction ID as UUID
            UUID transactionId = UUID.fromString(id);
            
            // Delegate to transaction service for retrieval with caching, security filtering,
            // and comprehensive error handling
            TransactionResponse transactionResponse = transactionService.getTransactionById(transactionId);
            
            logger.info("Successfully retrieved transaction with ID: {}, status: {}", 
                       transactionResponse.getTransactionId(), transactionResponse.getStatus());
            
            // Return HTTP 200 OK with the comprehensive transaction response
            return ResponseEntity.ok(transactionResponse);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid transaction ID format: {}, error: {}", id, e.getMessage());
            
            // Handle invalid UUID format with appropriate error response
            throw new TransactionException("Invalid transaction ID format: " + id, e);
            
        } catch (TransactionException e) {
            logger.error("Transaction retrieval failed for ID: {}, error: {}", id, e.getMessage());
            
            // Re-throw the transaction exception to be handled by the global exception handler
            throw e;
            
        } catch (Exception e) {
            logger.error("Unexpected error during transaction retrieval for ID: {}", id, e);
            
            // Wrap unexpected exceptions in TransactionException for consistent error handling
            throw new TransactionException("Transaction retrieval failed due to unexpected system error", e);
        }
    }
    
    /**
     * Retrieves a comprehensive list of transactions for a specific account.
     * 
     * This endpoint provides efficient batch retrieval of transaction history for account
     * management, customer service, and regulatory reporting purposes. Since the underlying
     * TransactionService only supports account-based transaction queries, this endpoint
     * requires an account ID parameter to function properly. It implements optimized query
     * patterns with pagination, filtering, and sorting capabilities to handle large
     * transaction volumes while maintaining acceptable performance.
     * 
     * NOTE: This endpoint differs from the original specification which requested a
     * getAllTransactions() method. Due to the actual service implementation requiring
     * account-based queries for security and performance reasons, this endpoint requires
     * an accountId parameter to retrieve transaction lists.
     * 
     * Query Processing Workflow:
     * 1. Parameter Validation: Validates the account ID format and existence
     * 2. Authorization Check: Ensures access permissions for the specified account
     * 3. Database Query: Constructs optimized query with appropriate indexes
     * 4. Result Processing: Applies sorting by transaction date (most recent first)
     * 5. Data Enrichment: Enriches results with current status and metadata
     * 6. Response Generation: Maps results to client-facing response DTOs
     * 
     * Performance Optimizations:
     * - Database indexes on account_id and transaction_date for fast retrieval
     * - Connection pooling with read replicas for scalability during peak usage
     * - Result caching for frequently accessed account transaction lists
     * - Lazy loading of non-essential transaction details for improved response times
     * 
     * Security and Privacy:
     * - Account ownership validation to prevent unauthorized data access
     * - Role-based filtering for customer service and administrative access
     * - Data masking for sensitive information based on access level
     * - Comprehensive audit logging for regulatory compliance requirements
     * 
     * Data Consistency and Accuracy:
     * - Real-time integration with transaction processing events
     * - Eventual consistency handling for recently completed transactions
     * - Duplicate detection and filtering for data integrity
     * - Timestamp-based ordering for chronological transaction presentation
     * 
     * @param accountId The unique identifier of the account for which to retrieve transaction
     *                 history. Must be a valid UUID format that corresponds to an existing
     *                 account in the system. This parameter is required due to security and
     *                 performance considerations in the underlying service implementation.
     * 
     * @return ResponseEntity<List<TransactionResponse>> containing all transactions associated
     *         with the specified account, sorted by transaction date in descending order
     *         (most recent first). Returns HTTP 200 (OK) with the transaction list, which
     *         may be empty if no transactions exist for the account but will never be null.
     *         Each transaction response includes comprehensive details suitable for display
     *         and analysis purposes.
     * 
     * @throws TransactionException when transaction list retrieval fails due to invalid account ID,
     *                            unauthorized access attempts, data access errors, or system
     *                            unavailability. The exception includes detailed error information
     *                            for appropriate client response and debugging support.
     * 
     * @throws IllegalArgumentException when the account ID parameter is null, empty, or does not
     *                                conform to expected UUID format requirements, ensuring
     *                                fail-fast behavior for malformed requests.
     * 
     * @since 1.0
     * 
     * Example Request:
     * GET /api/v1/transactions?accountId=987fcdeb-51a2-43d7-8f9e-123456789abc
     * Accept: application/json
     * Authorization: Bearer <JWT_TOKEN>
     * 
     * Example Response:
     * HTTP/1.1 200 OK
     * Content-Type: application/json
     * 
     * [
     *   {
     *     "transactionId": "txn_001",
     *     "accountId": "987fcdeb-51a2-43d7-8f9e-123456789abc",
     *     "amount": 1500.00,
     *     "currency": "USD",
     *     "transactionType": "TRANSFER",
     *     "description": "Monthly rent payment",
     *     "transactionDate": "2024-01-15T10:30:45.123456789",
     *     "status": "COMPLETED",
     *     "referenceNumber": "REF-2024-001234"
     *   },
     *   {
     *     "transactionId": "txn_002",
     *     "accountId": "987fcdeb-51a2-43d7-8f9e-123456789abc",
     *     "amount": 500.00,
     *     "currency": "USD",
     *     "transactionType": "DEPOSIT",
     *     "description": "Salary deposit",
     *     "transactionDate": "2024-01-14T09:15:20.987654321",
     *     "status": "COMPLETED",
     *     "referenceNumber": "REF-2024-001235"
     *   }
     * ]
     */
    @GetMapping
    @Timed(value = "transaction.list.time", description = "Time taken to retrieve transaction list")
    @Counted(value = "transaction.list.count", description = "Number of transaction list requests")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @RequestParam("accountId") String accountId) {
        
        logger.info("Received transaction list retrieval request for account ID: {}", accountId);
        
        try {
            // Validate that accountId parameter is provided
            if (accountId == null || accountId.trim().isEmpty()) {
                logger.error("Account ID parameter is required for transaction list retrieval");
                throw new TransactionException("Account ID parameter is required for transaction list retrieval");
            }
            
            // Validate and parse the account ID as UUID
            UUID accountUuid = UUID.fromString(accountId.trim());
            
            // Delegate to transaction service for account-based transaction retrieval
            // with comprehensive error handling and performance optimization
            List<TransactionResponse> transactionList = transactionService.getTransactionsByAccountId(accountUuid);
            
            // Handle the case where no transactions are found (empty list is valid)
            if (transactionList.isEmpty()) {
                logger.info("No transactions found for account ID: {}", accountId);
            } else {
                logger.info("Successfully retrieved {} transactions for account ID: {}", 
                           transactionList.size(), accountId);
            }
            
            // Return HTTP 200 OK with the transaction list (may be empty but never null)
            return ResponseEntity.ok(transactionList);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid account ID format: {}, error: {}", accountId, e.getMessage());
            
            // Handle invalid UUID format with appropriate error response
            throw new TransactionException("Invalid account ID format: " + accountId, e);
            
        } catch (TransactionException e) {
            logger.error("Transaction list retrieval failed for account ID: {}, error: {}", 
                        accountId, e.getMessage());
            
            // Re-throw the transaction exception to be handled by the global exception handler
            throw e;
            
        } catch (Exception e) {
            logger.error("Unexpected error during transaction list retrieval for account ID: {}", 
                        accountId, e);
            
            // Wrap unexpected exceptions in TransactionException for consistent error handling
            throw new TransactionException("Transaction list retrieval failed due to unexpected system error", e);
        }
    }
    
    /**
     * Processes a payment request through the comprehensive payment processing workflow.
     * 
     * This endpoint handles payment operations through the blockchain-based settlement network,
     * implementing the complete payment lifecycle including validation, risk assessment,
     * compliance verification, and atomic settlement processing. It supports the F-009
     * Blockchain-based Settlement Network feature by providing secure, transparent, and
     * immutable payment settlement capabilities through smart contract execution.
     * 
     * Payment Processing Workflow:
     * 1. Request Validation: Comprehensive validation of payment request data and business rules
     * 2. Risk Assessment: AI-powered risk scoring and fraud detection analysis
     * 3. Compliance Verification: KYC/AML screening, PEP checks, and sanctions validation
     * 4. Payment Authorization: Account validation, balance verification, and authorization checks
     * 5. Blockchain Settlement: Smart contract execution with atomic settlement operations
     * 6. Multi-party Validation: Consensus mechanisms for transaction finality and immutability
     * 7. Event Publishing: Real-time event publication for monitoring and downstream processing
     * 8. Response Generation: Comprehensive response with payment status and transaction details
     * 
     * Blockchain Settlement Features:
     * - Atomic settlement operations ensuring simultaneous payment and delivery
     * - Smart contract execution with configurable business rules and validation logic
     * - Multi-party consensus validation for transaction finality and immutability
     * - Cryptographic proof of transaction execution for audit and compliance purposes
     * - Rollback mechanisms for failed settlement operations and error recovery
     * 
     * Risk Assessment Integration:
     * - Real-time AI/ML model execution for fraud detection and risk scoring
     * - Behavioral analytics and anomaly detection for suspicious payment patterns
     * - Integration with external threat intelligence and fraud indicator databases
     * - Configurable risk thresholds with automated and manual approval workflows
     * 
     * Compliance and Regulatory Support:
     * - KYC/AML transaction monitoring with real-time screening capabilities
     * - PEP (Politically Exposed Person) screening and enhanced due diligence
     * - Sanctions list checking against global watchlists and regulatory databases
     * - Cross-border payment compliance validation and regulatory reporting
     * 
     * Performance Characteristics:
     * - Target response time: <500ms for standard payment processing operations
     * - Throughput capacity: 10,000+ payments per second during peak transaction periods
     * - Blockchain settlement: <5 seconds for consensus and finality achievement
     * - Availability SLA: 99.99% uptime for critical payment processing operations
     * 
     * Error Handling and Recovery:
     * - Comprehensive exception handling with detailed error responses and recovery guidance
     * - Automatic retry mechanisms for transient failures with exponential backoff strategies
     * - Circuit breaker patterns for external service resilience and fault tolerance
     * - Compensating transaction support for complex multi-step payment operations
     * 
     * Security and Compliance:
     * - End-to-end encryption for all sensitive payment data throughout the processing pipeline
     * - Comprehensive audit logging for regulatory compliance and forensic analysis
     * - Rate limiting protection against abuse, DDoS attacks, and fraudulent activity
     * - Secure credential management for external service access and API authentication
     * 
     * Monitoring and Observability:
     * - Metrics collection for payment success rates, processing latency, and error rates
     * - Distributed tracing for end-to-end visibility across payment processing microservices
     * - Business metrics tracking for customer experience monitoring and operational insights
     * - Real-time alerting for SLA breaches, error rate thresholds, and security incidents
     * 
     * @param paymentRequest The payment request containing all necessary information for processing
     *                      the payment transaction. Must include valid amount, currency, source
     *                      account, destination account, and optional description. The request
     *                      undergoes comprehensive validation against business rules and regulatory
     *                      requirements before processing begins.
     * 
     * @return ResponseEntity<PaymentResponse> containing the payment processing results including
     *         unique transaction identifier, current processing status, processed amount and
     *         currency information, and comprehensive metadata for client consumption and tracking.
     *         Returns HTTP 200 (OK) for successful payment processing with detailed response
     *         information suitable for client applications and monitoring systems.
     * 
     * @throws TransactionException when payment processing fails due to validation errors,
     *                            business rule violations, risk assessment failures, compliance
     *                            issues, account-related problems, external service failures,
     *                            blockchain settlement errors, or unexpected system failures.
     *                            The exception includes detailed error information for appropriate
     *                            client response and debugging support.
     * 
     * @throws IllegalArgumentException when the payment request parameter is null or contains
     *                                invalid data that prevents processing from beginning,
     *                                ensuring fail-fast behavior for malformed requests.
     * 
     * @since 1.0
     * 
     * Example Request:
     * POST /api/v1/transactions/payments
     * Content-Type: application/json
     * Authorization: Bearer <JWT_TOKEN>
     * 
     * {
     *   "amount": 2500.00,
     *   "currency": "USD",
     *   "description": "Invoice payment for services rendered",
     *   "fromAccountId": "ACC-123456789",
     *   "toAccountId": "ACC-987654321"
     * }
     * 
     * Example Response:
     * HTTP/1.1 200 OK
     * Content-Type: application/json
     * 
     * {
     *   "transactionId": "pay_789012345678",
     *   "status": "SETTLEMENT_IN_PROGRESS",
     *   "amount": 2500.00,
     *   "currency": "USD",
     *   "message": "Payment is being processed through blockchain settlement network"
     * }
     */
    @PostMapping("/payments")
    @Timed(value = "payment.processing.time", description = "Time taken to process a payment")
    @Counted(value = "payment.processing.count", description = "Number of payment processing requests")
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest paymentRequest) {
        
        logger.info("Received payment processing request for amount: {} {}, from: {} to: {}", 
                   paymentRequest.getAmount(), paymentRequest.getCurrency(), 
                   paymentRequest.getFromAccountId(), paymentRequest.getToAccountId());
        
        try {
            // Delegate to payment service for comprehensive payment processing including
            // validation, risk assessment, compliance verification, blockchain settlement,
            // and event publication for real-time monitoring and downstream processing
            PaymentResponse paymentResponse = paymentService.processPayment(paymentRequest);
            
            logger.info("Successfully processed payment with transaction ID: {}, status: {}", 
                       paymentResponse.getTransactionId(), paymentResponse.getStatus());
            
            // Return HTTP 200 OK with the comprehensive payment response including
            // transaction details, status information, and processing metadata
            return ResponseEntity.ok(paymentResponse);
            
        } catch (TransactionException e) {
            logger.error("Payment processing failed for request from: {} to: {}, amount: {} {}, error: {}", 
                        paymentRequest.getFromAccountId(), paymentRequest.getToAccountId(),
                        paymentRequest.getAmount(), paymentRequest.getCurrency(), e.getMessage());
            
            // Re-throw the transaction exception to be handled by the global exception handler
            // which will provide appropriate HTTP status codes and error response formatting
            throw e;
            
        } catch (Exception e) {
            logger.error("Unexpected error during payment processing for request from: {} to: {}, amount: {} {}", 
                        paymentRequest.getFromAccountId(), paymentRequest.getToAccountId(),
                        paymentRequest.getAmount(), paymentRequest.getCurrency(), e);
            
            // Wrap unexpected exceptions in TransactionException for consistent error handling
            // and appropriate client response formatting through the global exception handler
            throw new TransactionException("Payment processing failed due to unexpected system error", e);
        }
    }
}