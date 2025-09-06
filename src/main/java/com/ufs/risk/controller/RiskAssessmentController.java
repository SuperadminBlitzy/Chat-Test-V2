package com.ufs.risk.controller;

import org.springframework.web.bind.annotation.RestController; // spring-boot-starter-web v3.2.1
import org.springframework.web.bind.annotation.RequestMapping; // spring-boot-starter-web v3.2.1
import org.springframework.web.bind.annotation.PostMapping; // spring-boot-starter-web v3.2.1
import org.springframework.web.bind.annotation.RequestBody; // spring-boot-starter-web v3.2.1
import org.springframework.beans.factory.annotation.Autowired; // spring-beans v6.1.2
import org.springframework.http.ResponseEntity; // spring-web v6.1.2
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.annotation.Counted;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import com.ufs.risk.dto.RiskAssessmentRequest;
import com.ufs.risk.dto.RiskAssessmentResponse;
import com.ufs.risk.dto.FraudDetectionRequest;
import com.ufs.risk.dto.FraudDetectionResponse;
import com.ufs.risk.service.RiskAssessmentService;
import com.ufs.risk.service.FraudDetectionService;
import com.ufs.risk.exception.RiskAssessmentException;

/**
 * REST Controller for the AI-Powered Risk Assessment Engine and Fraud Detection System.
 * 
 * This controller serves as the primary API gateway for risk assessment and fraud detection
 * operations within the Unified Financial Services (UFS) platform. It exposes enterprise-grade
 * REST endpoints that integrate with the AI-powered risk assessment engine and fraud detection
 * system to provide real-time risk scoring, predictive modeling, and comprehensive fraud analysis.
 * 
 * Business Requirements Addressed:
 * 
 * F-002: AI-Powered Risk Assessment Engine
 * - Provides endpoints for real-time risk scoring with <500ms response time target
 * - Supports predictive risk modeling analyzing spending habits and investment behaviors
 * - Enables comprehensive creditworthiness assessment with explainable AI capabilities
 * - Implements bias detection and mitigation through algorithmic auditing
 * - Generates risk scores on 0-1000 scale with 95% accuracy rate requirement
 * - Supports model explainability for both expert and lay audiences for regulatory compliance
 * 
 * F-006: Fraud Detection System
 * - Delivers real-time transaction fraud analysis with sub-500ms response times
 * - Implements AI-powered fraud scoring using advanced machine learning models
 * - Provides comprehensive fraud risk assessment with confidence scoring
 * - Supports high-throughput processing (5,000+ requests per second)
 * - Enables explainable fraud detection decisions for regulatory transparency
 * - Integrates with unified customer profiles and transaction history analysis
 * 
 * Technical Architecture:
 * - Built on Spring Boot 3.2+ framework with Java 21 LTS for enterprise scalability
 * - Implements microservices architecture with API-first design principles
 * - Supports horizontal scaling and cloud-native deployment patterns
 * - Integrates with comprehensive monitoring, logging, and observability systems
 * - Provides enterprise-grade security with role-based access control
 * - Implements circuit breaker patterns for external service resilience
 * 
 * Performance Characteristics:
 * - Target response time: <500ms for 99% of requests (F-002-RQ-001)
 * - Concurrent request handling: 5,000+ requests per second capacity
 * - Availability: 99.9% uptime with 24/7 operational capability
 * - Accuracy: 95% accuracy rate in risk assessment and fraud detection
 * - Scalability: Horizontal scaling support for enterprise workloads
 * 
 * Security Features:
 * - End-to-end encryption for all sensitive financial data transmission
 * - Comprehensive audit logging for regulatory compliance and security monitoring
 * - Role-based access control (RBAC) integration with enterprise authentication
 * - Data validation and sanitization to prevent injection attacks
 * - Rate limiting and throttling capabilities for DoS protection
 * - Secure error handling to prevent information disclosure
 * 
 * Regulatory Compliance:
 * - SOC2, PCI-DSS, and GDPR compliance implementation
 * - Banking agencies review compatibility for AI risk management
 * - Model Risk Management (MRM) compliance for AI/ML systems
 * - Complete audit trails for all risk assessment and fraud detection operations
 * - Explainable AI support for regulatory transparency requirements
 * - Data retention and privacy controls aligned with financial services regulations
 * 
 * Integration Context:
 * - Depends on F-001 (Unified Data Integration Platform) for comprehensive data access
 * - Integrates with F-003 (Regulatory Compliance Automation) for policy enforcement
 * - Supports F-004 (Digital Customer Onboarding) through risk profiling capabilities
 * - Enables F-008 (Real-time Transaction Monitoring) integration for continuous assessment
 * 
 * Error Handling Strategy:
 * - Comprehensive exception handling with appropriate HTTP status codes
 * - Graceful degradation when underlying services are temporarily unavailable
 * - Detailed error logging with correlation IDs for troubleshooting
 * - Client-friendly error responses that protect sensitive system information
 * - Circuit breaker implementation for external service dependency management
 * 
 * @author UFS Risk Assessment Development Team
 * @version 1.0
 * @since 2025-01-01
 * @see RiskAssessmentService
 * @see FraudDetectionService
 * @see RiskAssessmentRequest
 * @see RiskAssessmentResponse
 * @see FraudDetectionRequest
 * @see FraudDetectionResponse
 */
@RestController
@RequestMapping("/api/v1/risk")
@Validated
public class RiskAssessmentController {

    private static final Logger logger = LoggerFactory.getLogger(RiskAssessmentController.class);

    /**
     * Core service for AI-powered risk assessment operations.
     * 
     * This service implements the comprehensive risk assessment engine that analyzes
     * customer financial data, transaction patterns, market conditions, and external
     * risk factors to generate accurate risk scores and mitigation recommendations.
     * 
     * The service provides:
     * - Real-time risk scoring with <500ms response time
     * - Predictive risk modeling with 95% accuracy rate
     * - Explainable AI capabilities for regulatory compliance
     * - Bias detection and algorithmic fairness monitoring
     * - Integration with unified data platform for comprehensive analysis
     */
    private final RiskAssessmentService riskAssessmentService;

    /**
     * Specialized service for fraud detection and prevention.
     * 
     * This service implements advanced fraud detection algorithms using machine learning
     * models trained on historical transaction patterns, customer behaviors, and real-time
     * risk factors to identify and prevent fraudulent activities.
     * 
     * The service provides:
     * - Real-time fraud scoring and risk assessment
     * - AI-powered anomaly detection and pattern analysis
     * - High-throughput processing for transaction monitoring
     * - Explainable fraud detection decisions
     * - Integration with threat intelligence and external risk data sources
     */
    private final FraudDetectionService fraudDetectionService;

    /**
     * Constructor for RiskAssessmentController with dependency injection.
     * 
     * Initializes the controller with required service dependencies using Spring's
     * constructor-based dependency injection pattern. This approach ensures that
     * all required dependencies are available at construction time and supports
     * immutable field configuration for thread safety.
     * 
     * The constructor injection pattern provides several benefits:
     * - Ensures all required dependencies are available at startup
     * - Supports immutable field configuration for thread safety
     * - Enables proper unit testing with mock dependencies
     * - Fails fast if required dependencies are not available
     * - Supports Spring's dependency resolution and lifecycle management
     * 
     * @param riskAssessmentService The service responsible for comprehensive risk assessment
     *                              operations including real-time scoring, predictive modeling,
     *                              and explainable AI capabilities. Must not be null.
     * 
     * @param fraudDetectionService The service responsible for fraud detection and prevention
     *                              operations including transaction analysis, anomaly detection,
     *                              and real-time fraud scoring. Must not be null.
     * 
     * @throws IllegalArgumentException if any service dependency is null
     * 
     * @since 1.0
     */
    @Autowired
    public RiskAssessmentController(RiskAssessmentService riskAssessmentService, 
                                  FraudDetectionService fraudDetectionService) {
        if (riskAssessmentService == null) {
            throw new IllegalArgumentException("RiskAssessmentService cannot be null");
        }
        if (fraudDetectionService == null) {
            throw new IllegalArgumentException("FraudDetectionService cannot be null");
        }
        
        this.riskAssessmentService = riskAssessmentService;
        this.fraudDetectionService = fraudDetectionService;
        
        logger.info("RiskAssessmentController initialized with services: RiskAssessmentService={}, FraudDetectionService={}", 
                   riskAssessmentService.getClass().getSimpleName(), 
                   fraudDetectionService.getClass().getSimpleName());
    }

    /**
     * Performs comprehensive risk assessment based on customer and transaction data.
     * 
     * This endpoint implements the core functionality of the AI-Powered Risk Assessment Engine (F-002),
     * providing real-time risk scoring and predictive modeling capabilities. The endpoint processes
     * comprehensive risk assessment requests containing customer profiles, transaction history,
     * market data, and external risk factors to generate detailed risk analysis with actionable
     * mitigation recommendations.
     * 
     * Business Capabilities:
     * - Real-time risk scoring with <500ms response time target (F-002-RQ-001)
     * - Predictive risk modeling analyzing spending habits, investment behaviors, and creditworthiness
     * - Comprehensive risk assessment with confidence intervals and explainable AI features
     * - Bias detection and mitigation through algorithmic auditing for regulatory compliance
     * - Integration with unified data platform for comprehensive customer and market analysis
     * 
     * Processing Workflow:
     * 1. Request Validation: Validates incoming request for completeness and data integrity
     * 2. Security Check: Performs authentication and authorization validation
     * 3. Data Enrichment: Integrates with unified data platform for additional context
     * 4. AI/ML Processing: Executes risk assessment algorithms with feature engineering
     * 5. Risk Scoring: Generates risk scores on 0-1000 scale with confidence intervals
     * 6. Explanation Generation: Creates explainable AI outputs for transparency
     * 7. Response Assembly: Constructs comprehensive response with recommendations
     * 8. Audit Logging: Records assessment details for compliance and monitoring
     * 
     * Risk Assessment Features:
     * - Multi-dimensional risk analysis including credit, operational, and market risks
     * - Customer behavior analysis based on transaction patterns and spending habits
     * - Real-time market data integration for dynamic risk adjustment
     * - External risk factor validation through third-party data sources
     * - ML model ensemble approach for improved accuracy and robustness
     * - Confidence scoring and uncertainty quantification for decision support
     * 
     * Compliance and Regulatory Features:
     * - Model explainability for both expert and lay audiences (F-002-RQ-003)
     * - Algorithmic bias detection and fairness monitoring
     * - Complete audit trails for regulatory review and compliance reporting
     * - Data privacy protection with secure handling of sensitive information
     * - Integration with regulatory compliance automation systems
     * 
     * Performance Characteristics:
     * - Target response time: <500ms for 99% of requests
     * - Concurrent processing: Support for high-volume enterprise workloads
     * - Accuracy: 95% accuracy rate with continuous model improvement
     * - Scalability: Horizontal scaling capability for variable demand
     * - Availability: 24/7 operation with enterprise-grade reliability
     * 
     * Error Handling:
     * - Comprehensive input validation with detailed error messages
     * - Graceful degradation when external services are unavailable
     * - Timeout management to ensure response time SLA compliance
     * - Security-aware error responses that protect sensitive system information
     * - Correlation ID generation for end-to-end request tracing
     * 
     * @param request Comprehensive risk assessment request containing:
     *                - Customer identification and profile information
     *                - Historical transaction data for behavioral analysis
     *                - Real-time market data and economic indicators
     *                - External risk factors from third-party sources
     *                - Processing preferences and explainability requirements
     *                - Compliance specifications and regulatory constraints
     *                
     *                The request must pass validation including:
     *                - Non-null customer ID with proper format validation
     *                - Non-empty transaction history with minimum required transactions
     *                - Valid timestamp information for temporal analysis
     *                - Proper data type validation for all numeric fields
     * 
     * @return ResponseEntity containing RiskAssessmentResponse with:
     *         - Calculated risk score on 0-1000 scale with confidence intervals
     *         - Risk category classification (LOW, MEDIUM, HIGH, CRITICAL)
     *         - Comprehensive list of actionable mitigation recommendations
     *         - Model explainability data for regulatory transparency
     *         - Assessment metadata including processing time and model version
     *         - HTTP 200 OK status for successful processing
     *         
     *         Response includes comprehensive risk analysis supporting:
     *         - Automated decision-making systems integration
     *         - Human reviewer workflows and manual override capabilities
     *         - Regulatory reporting and compliance documentation
     *         - Real-time monitoring and alerting system integration
     * 
     * @throws RiskAssessmentException when risk assessment processing fails due to:
     *         - AI/ML model inference errors or timeout conditions
     *         - External data source unavailability or invalid responses
     *         - System resource constraints preventing processing completion
     *         - Data quality issues that prevent accurate risk assessment
     * 
     * @since 1.0
     * @see RiskAssessmentRequest for detailed request parameter specifications
     * @see RiskAssessmentResponse for comprehensive response field descriptions
     * @see RiskAssessmentService#assessRisk(RiskAssessmentRequest)
     */
    @PostMapping("/assess")
    @Timed(value = "risk_assessment_duration", description = "Time taken to complete risk assessment")
    @Counted(value = "risk_assessment_requests", description = "Number of risk assessment requests processed")
    public ResponseEntity<RiskAssessmentResponse> assessRisk(@Valid @RequestBody RiskAssessmentRequest request,
                                                            HttpServletRequest httpRequest) {
        
        // Generate correlation ID for request tracking and audit trails
        String correlationId = UUID.randomUUID().toString();
        
        // Log incoming request with security-safe information
        logger.info("Risk assessment request received - CorrelationId: {}, CustomerId: {}, TransactionCount: {}, RequestIP: {}", 
                   correlationId, 
                   request.getCustomerId(), 
                   request.getTransactionCount(),
                   getClientIpAddress(httpRequest));
        
        try {
            // Record request start time for performance monitoring
            long startTime = System.currentTimeMillis();
            
            // Enrich request with default values and validation
            request.enrichWithDefaults();
            
            // Validate request for processing completeness
            if (!request.isValidForProcessing()) {
                logger.warn("Risk assessment request validation failed - CorrelationId: {}, CustomerId: {}", 
                           correlationId, request.getCustomerId());
                throw new RiskAssessmentException("Request validation failed: insufficient data for risk assessment");
            }
            
            // Execute risk assessment through service layer
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(request);
            
            // Calculate processing time for performance monitoring
            long processingTime = System.currentTimeMillis() - startTime;
            
            // Log successful assessment completion with performance metrics
            logger.info("Risk assessment completed successfully - CorrelationId: {}, CustomerId: {}, " +
                       "RiskScore: {}, RiskCategory: {}, ProcessingTime: {}ms, HighRisk: {}, ManualReview: {}", 
                       correlationId, 
                       request.getCustomerId(),
                       response.getRiskScore(),
                       response.getRiskCategory(),
                       processingTime,
                       response.isHighRisk(),
                       response.requiresManualReview());
            
            // Add correlation ID to response headers for tracking
            return ResponseEntity.ok()
                    .header("X-Correlation-ID", correlationId)
                    .header("X-Processing-Time", String.valueOf(processingTime))
                    .header("X-Risk-Level", response.getRiskCategory())
                    .body(response);
            
        } catch (RiskAssessmentException e) {
            // Log service-specific errors with context
            logger.error("Risk assessment service error - CorrelationId: {}, CustomerId: {}, Error: {}", 
                        correlationId, request.getCustomerId(), e.getMessage(), e);
            throw e; // Re-throw to be handled by global exception handler
            
        } catch (IllegalArgumentException e) {
            // Log validation errors
            logger.warn("Risk assessment request validation error - CorrelationId: {}, CustomerId: {}, Error: {}", 
                       correlationId, request.getCustomerId(), e.getMessage());
            throw new RiskAssessmentException("Invalid request parameters: " + e.getMessage(), e);
            
        } catch (Exception e) {
            // Log unexpected errors with full context
            logger.error("Unexpected error during risk assessment - CorrelationId: {}, CustomerId: {}, Error: {}", 
                        correlationId, request.getCustomerId(), e.getMessage(), e);
            throw new RiskAssessmentException("Risk assessment processing failed due to system error", e);
        }
    }

    /**
     * Performs real-time fraud detection analysis on transaction data.
     * 
     * This endpoint implements the core functionality of the Fraud Detection System (F-006),
     * providing real-time transaction fraud analysis using advanced AI-powered machine learning
     * models. The endpoint processes transaction requests with comprehensive context data to
     * generate detailed fraud risk assessments with actionable recommendations.
     * 
     * Business Capabilities:
     * - Real-time transaction fraud analysis with sub-500ms response times
     * - AI-powered fraud scoring using ensemble machine learning models
     * - Comprehensive risk assessment with confidence scoring and explainability
     * - High-throughput processing supporting 5,000+ requests per second
     * - Integration with unified customer profiles and behavioral analytics
     * - Advanced anomaly detection and pattern recognition capabilities
     * 
     * Processing Workflow:
     * 1. Request Validation: Validates transaction data for completeness and consistency
     * 2. Security Check: Performs authentication and IP-based security validation
     * 3. Data Enrichment: Integrates customer history and behavioral patterns
     * 4. Feature Engineering: Extracts 100+ features for ML model processing
     * 5. ML Model Inference: Executes ensemble fraud detection algorithms
     * 6. Risk Scoring: Generates fraud scores with confidence intervals
     * 7. Rule Engine: Applies business rules and regulatory constraints
     * 8. Explanation Generation: Creates transparent fraud decision reasoning
     * 9. Response Assembly: Constructs actionable fraud detection response
     * 10. Audit Logging: Records fraud analysis for compliance and monitoring
     * 
     * Fraud Detection Features:
     * - Multi-model ensemble approach combining Random Forest, Gradient Boosting, and Neural Networks
     * - Real-time behavioral analysis comparing against established customer baselines
     * - Geographic and temporal pattern analysis for location-based fraud detection
     * - Device fingerprinting and IP reputation analysis for digital fraud prevention
     * - Merchant risk scoring and category-based fraud pattern recognition
     * - Velocity and frequency analysis for transaction pattern anomaly detection
     * - Cross-channel correlation analysis for comprehensive fraud assessment
     * 
     * Risk Assessment Categories:
     * - Transaction Amount Analysis: Compares against customer profile and spending patterns
     * - Geographic Risk Assessment: Evaluates location-based risk factors and travel patterns
     * - Temporal Pattern Analysis: Identifies unusual timing patterns and velocity anomalies
     * - Device and Network Analysis: Assesses device reputation and network security indicators
     * - Merchant Risk Evaluation: Analyzes merchant category and reputation factors
     * - Customer Behavior Deviation: Compares current transaction against behavioral baseline
     * - External Threat Intelligence: Integrates real-time fraud pattern databases
     * 
     * Compliance and Regulatory Features:
     * - Explainable AI implementation with SHAP values for model interpretability
     * - Complete audit trails for all fraud detection decisions and reasoning
     * - Regulatory compliance with AML, KYC, and financial crime prevention requirements
     * - Privacy-preserving techniques for customer data protection
     * - Integration with regulatory reporting and compliance monitoring systems
     * 
     * Performance Characteristics:
     * - Target response time: <500ms for real-time transaction processing
     * - Concurrent processing: 5,000+ fraud detection requests per second
     * - Model accuracy: 95% with continuous improvement through ML pipelines
     * - False positive rate: <2% to minimize customer friction and operational overhead
     * - Availability: 24/7 operation with enterprise-grade reliability and failover
     * 
     * Security Features:
     * - End-to-end encryption for all sensitive transaction and customer data
     * - Secure handling of payment card and personal identification information
     * - Role-based access control integration with enterprise security systems
     * - Comprehensive security monitoring and threat detection capabilities
     * - Data masking and anonymization for privacy protection
     * 
     * Error Handling and Resilience:
     * - Graceful degradation when ML models are temporarily unavailable
     * - Fallback to rule-based fraud detection for system continuity
     * - Circuit breaker patterns for external service dependency management
     * - Comprehensive error logging with correlation IDs for troubleshooting
     * - Timeout management to meet stringent response time requirements
     * 
     * @param request Comprehensive fraud detection request containing:
     *                - Unique transaction identifier for tracking and correlation
     *                - Customer identifier linking to unified customer profile
     *                - Transaction amount with high-precision monetary calculations
     *                - ISO 4217 currency code for multi-currency support
     *                - Precise transaction timestamp for temporal analysis
     *                - Transaction type for category-specific risk assessment
     *                - Merchant information for merchant-based risk evaluation
     *                - IP address for geographic and network-based risk analysis
     *                - Device fingerprint for device-based fraud detection
     *                
     *                All core fields must be present and valid:
     *                - Transaction ID must be unique and properly formatted
     *                - Customer ID must exist in unified customer database
     *                - Amount must be positive with valid currency code
     *                - Timestamp must be valid and within acceptable time range
     *                - IP address must be properly formatted IPv4 or IPv6
     * 
     * @return ResponseEntity containing FraudDetectionResponse with:
     *         - Transaction ID for correlation and audit trail purposes
     *         - Fraud score (0-1000 scale) indicating comprehensive risk level
     *         - Risk level categorization (LOW, MEDIUM, HIGH, CRITICAL)
     *         - Recommended action (APPROVE, REVIEW, CHALLENGE, BLOCK, MONITOR)
     *         - Confidence score (0.0-1.0) indicating model certainty and reliability
     *         - Detailed list of reasons explaining fraud risk assessment
     *         - HTTP 200 OK status for successful fraud analysis processing
     *         
     *         Response provides comprehensive fraud intelligence supporting:
     *         - Real-time transaction approval/rejection decisions
     *         - Risk management workflow integration and escalation
     *         - Fraud investigation case management and documentation
     *         - Regulatory reporting and compliance audit requirements
     *         - Customer communication and fraud prevention education
     * 
     * @throws IllegalArgumentException when request contains invalid or missing required data
     * @throws SecurityException when security validation fails or access is denied
     * @throws RiskAssessmentException when fraud detection processing fails due to system errors
     * 
     * @since 1.0
     * @see FraudDetectionRequest for detailed request parameter specifications
     * @see FraudDetectionResponse for comprehensive response field descriptions
     * @see FraudDetectionService#detectFraud(FraudDetectionRequest)
     */
    @PostMapping("/fraud-detection")
    @Timed(value = "fraud_detection_duration", description = "Time taken to complete fraud detection analysis")
    @Counted(value = "fraud_detection_requests", description = "Number of fraud detection requests processed")
    public ResponseEntity<FraudDetectionResponse> detectFraud(@Valid @RequestBody FraudDetectionRequest request,
                                                             HttpServletRequest httpRequest) {
        
        // Generate correlation ID for comprehensive request tracking
        String correlationId = UUID.randomUUID().toString();
        
        // Log incoming fraud detection request with security-safe information
        logger.info("Fraud detection request received - CorrelationId: {}, TransactionId: {}, CustomerId: {}, " +
                   "Amount: {}, Currency: {}, TransactionType: {}, RequestIP: {}", 
                   correlationId, 
                   request.getTransactionId(), 
                   request.getCustomerId(),
                   request.getAmount(),
                   request.getCurrency(),
                   request.getTransactionType(),
                   getClientIpAddress(httpRequest));
        
        try {
            // Record request start time for precise performance monitoring
            long startTime = System.currentTimeMillis();
            
            // Validate critical request parameters for fraud detection processing
            validateFraudDetectionRequest(request, correlationId);
            
            // Execute comprehensive fraud detection analysis through service layer
            FraudDetectionResponse response = fraudDetectionService.detectFraud(request);
            
            // Calculate total processing time for performance metrics
            long processingTime = System.currentTimeMillis() - startTime;
            
            // Log successful fraud detection completion with comprehensive metrics
            logger.info("Fraud detection completed successfully - CorrelationId: {}, TransactionId: {}, " +
                       "CustomerId: {}, FraudScore: {}, RiskLevel: {}, Recommendation: {}, " +
                       "ConfidenceScore: {}, ProcessingTime: {}ms, ReasonsCount: {}", 
                       correlationId, 
                       request.getTransactionId(),
                       request.getCustomerId(),
                       response.getFraudScore(),
                       response.getRiskLevel(),
                       response.getRecommendation(),
                       response.getConfidenceScore(),
                       processingTime,
                       response.getReasons() != null ? response.getReasons().size() : 0);
            
            // Add comprehensive response headers for tracking and monitoring
            return ResponseEntity.ok()
                    .header("X-Correlation-ID", correlationId)
                    .header("X-Processing-Time", String.valueOf(processingTime))
                    .header("X-Fraud-Risk-Level", response.getRiskLevel())
                    .header("X-Recommendation", response.getRecommendation())
                    .header("X-Confidence-Score", response.getConfidenceScore().toString())
                    .body(response);
            
        } catch (IllegalArgumentException e) {
            // Log validation errors with request context
            logger.warn("Fraud detection request validation error - CorrelationId: {}, TransactionId: {}, " +
                       "CustomerId: {}, Error: {}", 
                       correlationId, request.getTransactionId(), request.getCustomerId(), e.getMessage());
            throw e; // Re-throw for global exception handler
            
        } catch (SecurityException e) {
            // Log security violations with request context
            logger.error("Fraud detection security error - CorrelationId: {}, TransactionId: {}, " +
                        "CustomerId: {}, RequestIP: {}, Error: {}", 
                        correlationId, request.getTransactionId(), request.getCustomerId(),
                        getClientIpAddress(httpRequest), e.getMessage());
            throw e; // Re-throw for global exception handler
            
        } catch (Exception e) {
            // Log unexpected errors with comprehensive context
            logger.error("Unexpected error during fraud detection - CorrelationId: {}, TransactionId: {}, " +
                        "CustomerId: {}, Error: {}", 
                        correlationId, request.getTransactionId(), request.getCustomerId(), e.getMessage(), e);
            throw new RiskAssessmentException("Fraud detection processing failed due to system error", e);
        }
    }

    /**
     * Global exception handler for RiskAssessmentException.
     * 
     * Provides centralized exception handling for risk assessment and fraud detection
     * operations, ensuring consistent error responses and comprehensive audit logging.
     * 
     * @param e The RiskAssessmentException to handle
     * @param request The HTTP servlet request for context
     * @return ResponseEntity with appropriate error response
     */
    @ExceptionHandler(RiskAssessmentException.class)
    public ResponseEntity<Map<String, Object>> handleRiskAssessmentException(RiskAssessmentException e, 
                                                                            HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.error("Risk assessment exception handled - CorrelationId: {}, RequestURI: {}, Error: {}", 
                    correlationId, request.getRequestURI(), e.getMessage(), e);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Risk Assessment Error");
        errorResponse.put("message", "Risk assessment processing failed. Please try again later.");
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("correlationId", correlationId);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("X-Correlation-ID", correlationId)
                .body(errorResponse);
    }

    /**
     * Global exception handler for IllegalArgumentException.
     * 
     * Handles validation errors and invalid request parameters with appropriate
     * HTTP status codes and client-friendly error messages.
     * 
     * @param e The IllegalArgumentException to handle
     * @param request The HTTP servlet request for context
     * @return ResponseEntity with validation error response
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e, 
                                                                             HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        
        logger.warn("Validation exception handled - CorrelationId: {}, RequestURI: {}, Error: {}", 
                   correlationId, request.getRequestURI(), e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Validation Error");
        errorResponse.put("message", "Invalid request parameters: " + e.getMessage());
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("correlationId", correlationId);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("X-Correlation-ID", correlationId)
                .body(errorResponse);
    }

    /**
     * Validates fraud detection request parameters for completeness and consistency.
     * 
     * Performs comprehensive validation of fraud detection request data to ensure
     * all required fields are present and properly formatted for processing.
     * 
     * @param request The fraud detection request to validate
     * @param correlationId The correlation ID for logging context
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFraudDetectionRequest(FraudDetectionRequest request, String correlationId) {
        if (request.getTransactionId() == null || request.getTransactionId().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction ID is required and cannot be empty");
        }
        
        if (request.getCustomerId() == null || request.getCustomerId().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer ID is required and cannot be empty");
        }
        
        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        
        if (request.getCurrency() == null || request.getCurrency().length() != 3) {
            throw new IllegalArgumentException("Valid ISO 4217 currency code is required");
        }
        
        if (request.getTransactionTimestamp() == null) {
            throw new IllegalArgumentException("Transaction timestamp is required");
        }
        
        if (request.getTransactionType() == null || request.getTransactionType().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction type is required");
        }
        
        logger.debug("Fraud detection request validation passed - CorrelationId: {}, TransactionId: {}", 
                    correlationId, request.getTransactionId());
    }

    /**
     * Extracts the client IP address from the HTTP request.
     * 
     * Handles various proxy and load balancer headers to determine the original
     * client IP address for security and fraud detection purposes.
     * 
     * @param request The HTTP servlet request
     * @return The client IP address or "unknown" if not available
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("X-Real-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Handle comma-separated IP addresses (first one is the original client)
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress != null ? ipAddress : "unknown";
    }
}