# Unified Financial Services Platform - Coding Standards

## 1. Introduction

### 1.1 Purpose and Scope

This document establishes comprehensive coding standards, best practices, and guidelines for the Unified Financial Services Platform - a comprehensive solution designed to address critical fragmentation challenges facing Banking, Financial Services, and Insurance (BFSI) institutions. These standards are mandatory to ensure code quality, consistency, maintainability, and security across all backend, frontend, and mobile development efforts.

### 1.2 Platform Overview

The Unified Financial Services Platform integrates AI-powered risk assessment, regulatory compliance automation, digital onboarding, personalized financial wellness tools, blockchain-based settlements, and predictive analytics into a single, unified ecosystem. With financial institutions using an average of 1,026 applications across their digital landscape, our platform addresses the critical need for unified data management and integrated service delivery.

### 1.3 Importance of Adherence

Given that financial firms lose approximately $6.08 million per data breach (25% higher than the global average), adherence to these coding standards is critical for:

- **Security Compliance**: Meeting SOC2, PCI-DSS, GDPR, and financial industry regulations
- **Data Quality**: Addressing the fact that companies lose an average of $15 million annually due to poor data quality
- **Performance**: Achieving sub-second response times and 10,000+ TPS capacity requirements
- **Maintainability**: Supporting 10x growth without architectural changes
- **Risk Management**: Ensuring 99.99% uptime and comprehensive disaster recovery

### 1.4 Regulatory Context

The platform operates in a complex regulatory environment spanning global privacy laws, cyber risk frameworks, and financial reporting rules. Our coding standards ensure automated compliance monitoring and audit trails while supporting evolving requirements including PSD3, PSR, Basel reforms (CRR3), and FRTB implementation.

## 2. General Principles

### 2.1 SOLID Principles

All code must adhere to SOLID design principles:

- **Single Responsibility Principle (SRP)**: Each class/module should have only one reason to change
- **Open/Closed Principle (OCP)**: Software entities should be open for extension but closed for modification
- **Liskov Substitution Principle (LSP)**: Objects should be replaceable with instances of their subtypes
- **Interface Segregation Principle (ISP)**: Many client-specific interfaces are better than one general-purpose interface
- **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions

### 2.2 DRY (Don't Repeat Yourself)

- Eliminate code duplication through proper abstraction
- Create reusable components and utilities
- Use inheritance and composition appropriately
- Implement shared constants and configuration

### 2.3 KISS (Keep It Simple, Stupid)

- Write simple, readable code over clever solutions
- Minimize complexity in business logic
- Use clear naming conventions
- Avoid premature optimization

### 2.4 YAGNI (You Aren't Gonna Need It)

- Implement features only when needed
- Avoid speculative development
- Focus on current requirements
- Refactor when requirements change

### 2.5 Financial Services Specific Principles

- **Data Integrity**: All financial data must maintain ACID compliance
- **Auditability**: Every operation must be traceable and logged
- **Security by Design**: Security considerations must be built into every component
- **Regulatory Compliance**: Code must support automated compliance monitoring
- **Performance**: Sub-second response times for 99% of user interactions

## 3. Version Control with Git

### 3.1 Branch Strategy (GitFlow)

Our platform uses GitFlow branching model:

```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/JIRA-123-risk-assessment-engine
│   ├── feature/JIRA-124-compliance-automation
│   └── feature/JIRA-125-digital-onboarding
├── release/1.2.0 (release preparation)
└── hotfix/1.1.1-security-patch (emergency fixes)
```

### 3.2 Branch Naming Conventions

- **Feature branches**: `feature/JIRA-XXX-short-description`
- **Bug fix branches**: `bugfix/JIRA-XXX-short-description`
- **Hotfix branches**: `hotfix/X.X.X-short-description`
- **Release branches**: `release/X.X.X`

### 3.3 Commit Message Conventions (Conventional Commits)

Follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Build process or auxiliary tool changes
- `security`: Security-related changes
- `perf`: Performance improvements

**Examples:**
```bash
feat(risk-engine): implement real-time risk scoring algorithm

Implemented ML-based risk scoring with TensorFlow 2.15+
Supports 500ms response time requirement for 99% of requests
Includes bias detection and model explainability features

Closes JIRA-123
```

```bash
fix(compliance): resolve regulatory data synchronization issue

Fixed 24-hour update cycle for regulatory changes
Added error handling for failed policy updates
Improved audit trail logging

Fixes JIRA-456
```

### 3.4 Pull Request Guidelines

#### 3.4.1 PR Template

All pull requests must use the following template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Financial Services Compliance
- [ ] GDPR compliance verified
- [ ] PCI-DSS requirements met
- [ ] SOC2 controls implemented
- [ ] Audit logging added

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] End-to-end tests added/updated
- [ ] Security tests passed

## Security Review
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] Authentication/authorization verified

## Performance Impact
- [ ] Response time requirements met (<1s for core platform)
- [ ] Throughput requirements verified (10,000+ TPS)
- [ ] Memory usage optimized
- [ ] Database queries optimized
```

#### 3.4.2 Code Review Requirements

- **Minimum 2 reviewers** for production code
- **Security team approval** for authentication/authorization changes
- **Architecture team approval** for new microservices
- **Compliance team approval** for regulatory features

### 3.5 Pre-commit Hooks

Configure pre-commit hooks for:

```bash
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-json
      - id: check-yaml

  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        language_version: python3.12

  - repo: https://github.com/eslint/eslint
    rev: v8.55.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        types: [file]
```

## 4. Backend Coding Standards

### 4.1 Java (Spring Boot)

#### 4.1.1 Language and Framework Versions

- **Java**: 21 LTS (required for enterprise integration and microservices)
- **Spring Boot**: 3.2+ (provides production-ready microservices foundation)
- **Spring Cloud**: 2023.0+ (service discovery, configuration management, circuit breakers)
- **Maven**: 3.9+ (dependency management and build)

#### 4.1.2 Code Style and Formatting

Follow the Google Java Style Guide with these financial services specific additions:

```java
// Good: Clear class naming for financial domain
@RestController
@RequestMapping("/api/v1/risk-assessment")
@Validated
@Slf4j
public class RiskAssessmentController {
    
    private final RiskAssessmentService riskAssessmentService;
    private final AuditLogger auditLogger;
    
    public RiskAssessmentController(
            RiskAssessmentService riskAssessmentService,
            AuditLogger auditLogger) {
        this.riskAssessmentService = riskAssessmentService;
        this.auditLogger = auditLogger;
    }
    
    /**
     * Generates real-time risk score for customer transactions
     * Must complete within 500ms as per F-002-RQ-001 requirement
     * 
     * @param customerId Customer identifier for risk assessment
     * @param transactionData Transaction details for analysis
     * @return RiskScore with confidence interval and explanation
     */
    @PostMapping("/score")
    @PreAuthorize("hasRole('RISK_ANALYST') or hasRole('RELATIONSHIP_MANAGER')")
    public ResponseEntity<RiskScoreResponse> calculateRiskScore(
            @Valid @RequestBody RiskAssessmentRequest request) {
        
        // Log for audit trail (regulatory requirement)
        auditLogger.info("Risk assessment requested for customer: {}", 
            request.getCustomerId());
        
        try {
            RiskScoreResponse response = riskAssessmentService
                .calculateRiskScore(request);
            
            // Ensure response time requirement is met
            if (response.getProcessingTimeMs() > 500) {
                log.warn("Risk assessment exceeded 500ms threshold: {}ms", 
                    response.getProcessingTimeMs());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            auditLogger.error("Risk assessment failed for customer: {}", 
                request.getCustomerId(), e);
            throw new RiskAssessmentException("Failed to calculate risk score", e);
        }
    }
}
```

#### 4.1.3 Naming Conventions

- **Classes**: PascalCase (`RiskAssessmentService`, `ComplianceEngine`)
- **Methods**: camelCase (`calculateRiskScore`, `validateCompliance`)
- **Variables**: camelCase (`customerId`, `transactionAmount`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TRANSACTION_AMOUNT`, `RISK_THRESHOLD`)
- **Packages**: lowercase with financial domain structure (`com.platform.risk`, `com.platform.compliance`)

#### 4.1.4 Microservices Architecture Standards

```java
// Service layer implementation with proper error handling
@Service
@Transactional
@Slf4j
public class CustomerOnboardingService {
    
    private final CustomerRepository customerRepository;
    private final KycVerificationService kycService;
    private final RiskAssessmentService riskService;
    private final ComplianceService complianceService;
    private final EventPublisher eventPublisher;
    
    /**
     * Digital customer onboarding with KYC/AML compliance
     * Implements F-004 requirements for <5 minute onboarding
     */
    @Retryable(value = {TransientException.class}, maxAttempts = 3)
    public OnboardingResult processCustomerOnboarding(
            OnboardingRequest request) {
        
        // Validate input data
        ValidationResult validation = validateOnboardingData(request);
        if (!validation.isValid()) {
            throw new OnboardingValidationException(validation.getErrors());
        }
        
        try {
            // Step 1: Digital identity verification (F-004-RQ-001)
            IdentityVerificationResult identityResult = 
                kycService.verifyDigitalIdentity(request.getIdentityData());
            
            // Step 2: KYC/AML compliance checks (F-004-RQ-002)
            ComplianceCheckResult complianceResult = 
                complianceService.performKycAmlChecks(request);
            
            // Step 3: Biometric authentication (F-004-RQ-003)
            BiometricVerificationResult biometricResult = 
                kycService.verifyBiometrics(request.getBiometricData());
            
            // Step 4: Risk-based assessment (F-004-RQ-004)
            RiskScoreResponse riskScore = 
                riskService.calculateOnboardingRisk(request);
            
            // Create customer profile
            Customer customer = createCustomerProfile(
                request, identityResult, complianceResult, riskScore);
            
            // Save to database with audit trail
            Customer savedCustomer = customerRepository.save(customer);
            
            // Publish onboarding completed event
            OnboardingCompletedEvent event = new OnboardingCompletedEvent(
                savedCustomer.getId(), System.currentTimeMillis());
            eventPublisher.publishEvent(event);
            
            return OnboardingResult.success(savedCustomer);
            
        } catch (Exception e) {
            log.error("Customer onboarding failed for request: {}", request, e);
            
            // Publish onboarding failed event for monitoring
            OnboardingFailedEvent event = new OnboardingFailedEvent(
                request.getEmail(), e.getMessage(), System.currentTimeMillis());
            eventPublisher.publishEvent(event);
            
            throw new OnboardingProcessingException(
                "Failed to process customer onboarding", e);
        }
    }
}
```

#### 4.1.5 Configuration Management

```java
// Configuration properties for financial services
@ConfigurationProperties(prefix = "platform.risk")
@Data
@Validated
public class RiskAssessmentProperties {
    
    /**
     * Maximum processing time in milliseconds for risk assessment
     * Must be <= 500ms as per F-002-RQ-001
     */
    @Max(500)
    private int maxProcessingTimeMs = 500;
    
    /**
     * Minimum confidence threshold for risk scores
     */
    @DecimalMin("0.8")
    private BigDecimal minConfidenceThreshold = new BigDecimal("0.85");
    
    /**
     * Model bias detection threshold
     */
    @DecimalMax("0.1")
    private BigDecimal biasDetectionThreshold = new BigDecimal("0.05");
    
    /**
     * Fraud detection sensitivity level
     */
    @NotNull
    private FraudSensitivityLevel fraudSensitivity = FraudSensitivityLevel.HIGH;
}
```

#### 4.1.6 Logging Standards (SLF4J with Logback)

```java
// Structured logging for financial services
@Slf4j
@Component
public class TransactionProcessor {
    
    private static final String TRANSACTION_PROCESSED = "transaction.processed";
    private static final String TRANSACTION_FAILED = "transaction.failed";
    
    public void processTransaction(Transaction transaction) {
        // Structured logging with MDC for correlation
        MDC.put("transactionId", transaction.getId());
        MDC.put("customerId", transaction.getCustomerId());
        MDC.put("amount", transaction.getAmount().toString());
        
        try {
            log.info("Processing transaction: {}", transaction.getId());
            
            // Process transaction
            TransactionResult result = executeTransaction(transaction);
            
            // Success logging with metrics
            log.info(marker(TRANSACTION_PROCESSED), 
                "Transaction processed successfully. " +
                "transactionId={}, customerId={}, amount={}, processingTimeMs={}", 
                transaction.getId(), 
                transaction.getCustomerId(), 
                transaction.getAmount(), 
                result.getProcessingTimeMs());
                
        } catch (InsufficientFundsException e) {
            log.warn("Transaction rejected due to insufficient funds. " +
                "transactionId={}, customerId={}, amount={}", 
                transaction.getId(), 
                transaction.getCustomerId(), 
                transaction.getAmount());
                
        } catch (Exception e) {
            log.error(marker(TRANSACTION_FAILED), 
                "Transaction processing failed. transactionId={}", 
                transaction.getId(), e);
                
        } finally {
            MDC.clear();
        }
    }
}
```

#### 4.1.7 Exception Handling

```java
// Global exception handler for financial services
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RiskAssessmentException.class)
    public ResponseEntity<ErrorResponse> handleRiskAssessmentException(
            RiskAssessmentException e, WebRequest request) {
        
        log.error("Risk assessment error: {}", e.getMessage(), e);
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Risk Assessment Failed")
            .message(e.getMessage())
            .path(request.getDescription(false))
            .build();
            
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(ComplianceViolationException.class)
    public ResponseEntity<ErrorResponse> handleComplianceViolation(
            ComplianceViolationException e, WebRequest request) {
        
        // Log compliance violations for audit
        log.error("Compliance violation detected: {}", e.getMessage(), e);
        
        // Notify compliance team
        complianceNotificationService.notifyViolation(e);
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.FORBIDDEN.value())
            .error("Compliance Violation")
            .message("Operation violates regulatory requirements")
            .path(request.getDescription(false))
            .build();
            
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
}
```

### 4.2 Node.js (Express.js)

#### 4.2.1 Language and Framework Versions

- **Node.js**: 20 LTS (optimal for high-concurrency scenarios and event-driven architecture)
- **Express.js**: 4.18+ (lightweight and flexible for RESTful APIs)
- **npm**: 10+ (package management)

#### 4.2.2 Code Style (Airbnb JavaScript Style Guide)

```javascript
// API Gateway implementation for financial services
const express = require('express'); // Express.js 4.18+
const helmet = require('helmet'); // Security headers
const rateLimit = require('express-rate-limit'); // Rate limiting
const { body, validationResult } = require('express-validator'); // Input validation
const winston = require('winston'); // Structured logging
const { v4: uuidv4 } = require('uuid'); // Request correlation IDs

// Configure structured logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const app = express();

// Security middleware for financial services
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Rate limiting for API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Request correlation middleware
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

// Body parsing with size limits for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Payment processing endpoint with real-time fraud detection
 * Implements high-concurrency requirements for financial transactions
 */
app.post('/api/v1/payments/process',
  // Input validation middleware
  [
    body('amount')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Amount must be between 0.01 and 1,000,000'),
    body('currency')
      .isISO4217()
      .withMessage('Invalid currency code'),
    body('customerId')
      .isUUID()
      .withMessage('Invalid customer ID format'),
    body('merchantId')
      .isUUID()
      .withMessage('Invalid merchant ID format'),
  ],
  async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Payment validation failed', {
          correlationId: req.correlationId,
          errors: errors.array(),
        });
        
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
          correlationId: req.correlationId,
        });
      }

      const { amount, currency, customerId, merchantId } = req.body;
      
      logger.info('Processing payment', {
        correlationId: req.correlationId,
        customerId,
        merchantId,
        amount,
        currency,
      });

      // Real-time fraud detection
      const fraudScore = await fraudDetectionService.analyzeTransaction({
        customerId,
        merchantId,
        amount,
        currency,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      if (fraudScore.riskLevel === 'HIGH') {
        logger.warn('High fraud risk detected', {
          correlationId: req.correlationId,
          customerId,
          fraudScore: fraudScore.score,
        });
        
        return res.status(403).json({
          error: 'Transaction Blocked',
          message: 'Transaction blocked due to high fraud risk',
          correlationId: req.correlationId,
        });
      }

      // Process payment through microservices
      const paymentResult = await paymentService.processPayment({
        correlationId: req.correlationId,
        amount,
        currency,
        customerId,
        merchantId,
        fraudScore,
      });

      // Audit logging for regulatory compliance
      auditLogger.info('Payment processed', {
        correlationId: req.correlationId,
        transactionId: paymentResult.transactionId,
        customerId,
        merchantId,
        amount,
        currency,
        status: paymentResult.status,
        processingTimeMs: paymentResult.processingTimeMs,
      });

      res.status(200).json({
        transactionId: paymentResult.transactionId,
        status: paymentResult.status,
        amount,
        currency,
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    correlationId: req.correlationId,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    correlationId: req.correlationId,
  });
});

module.exports = app;
```

#### 4.2.3 Async/Await Standards

```javascript
// Service layer with proper async/await usage
class RealTimeAnalyticsService {
  constructor(kafkaProducer, redisClient, mongoClient) {
    this.kafkaProducer = kafkaProducer;
    this.redisClient = redisClient;
    this.mongoClient = mongoClient;
  }

  /**
   * Process real-time financial data streams
   * Handles high-frequency transaction data for analytics
   */
  async processTransactionStream(transactionData) {
    const startTime = Date.now();
    
    try {
      // Parallel processing for performance
      const [
        enrichedData,
        riskScore,
        complianceCheck
      ] = await Promise.all([
        this.enrichTransactionData(transactionData),
        this.calculateRiskScore(transactionData),
        this.performComplianceCheck(transactionData)
      ]);

      // Update real-time cache
      await this.updateRealTimeCache(transactionData.id, {
        enrichedData,
        riskScore,
        complianceCheck,
        timestamp: new Date(),
      });

      // Stream to analytics pipeline
      await this.kafkaProducer.send({
        topic: 'transaction-analytics',
        messages: [{
          key: transactionData.customerId,
          value: JSON.stringify({
            ...transactionData,
            enrichedData,
            riskScore,
            complianceCheck,
            processingTimeMs: Date.now() - startTime,
          }),
        }],
      });

      // Store in time-series database for historical analysis
      await this.storeTimeSeriesData({
        ...transactionData,
        enrichedData,
        riskScore,
        complianceCheck,
      });

      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
        riskScore,
        complianceStatus: complianceCheck.status,
      };

    } catch (error) {
      logger.error('Transaction stream processing failed', {
        transactionId: transactionData.id,
        error: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      
      // Dead letter queue for failed transactions
      await this.sendToDeadLetterQueue(transactionData, error);
      
      throw new TransactionProcessingError(
        `Failed to process transaction ${transactionData.id}`,
        error
      );
    }
  }

  /**
   * Enrich transaction data with external sources
   */
  async enrichTransactionData(transactionData) {
    try {
      // Get customer profile from cache first
      let customerProfile = await this.redisClient.get(
        `customer:${transactionData.customerId}`
      );

      if (!customerProfile) {
        // Fallback to database
        customerProfile = await this.getCustomerProfileFromDB(
          transactionData.customerId
        );
        
        // Cache for future requests (1 hour TTL)
        await this.redisClient.setex(
          `customer:${transactionData.customerId}`,
          3600,
          JSON.stringify(customerProfile)
        );
      } else {
        customerProfile = JSON.parse(customerProfile);
      }

      // Get merchant information
      const merchantData = await this.getMerchantData(
        transactionData.merchantId
      );

      // Get market data for currency conversion if needed
      const exchangeRates = transactionData.currency !== 'USD'
        ? await this.getExchangeRates(transactionData.currency)
        : null;

      return {
        customerProfile,
        merchantData,
        exchangeRates,
        enrichmentTimestamp: new Date(),
      };

    } catch (error) {
      logger.warn('Transaction enrichment failed', {
        transactionId: transactionData.id,
        error: error.message,
      });
      
      // Return minimal enrichment on failure
      return {
        enrichmentFailed: true,
        error: error.message,
      };
    }
  }
}
```

#### 4.2.4 Error Handling Middleware

```javascript
// Centralized error handling for financial services
class FinancialServicesErrorHandler {
  constructor(logger, notificationService) {
    this.logger = logger;
    this.notificationService = notificationService;
  }

  /**
   * Main error handling middleware
   */
  handle() {
    return (error, req, res, next) => {
      // Extract correlation ID for tracing
      const correlationId = req.correlationId || 'unknown';
      
      // Log error with context
      this.logger.error('Request processing error', {
        correlationId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });

      // Handle specific financial service errors
      if (error instanceof InsufficientFundsError) {
        return res.status(402).json({
          error: 'Insufficient Funds',
          message: 'Account balance insufficient for transaction',
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      if (error instanceof ComplianceViolationError) {
        // Notify compliance team immediately
        this.notificationService.notifyComplianceTeam({
          correlationId,
          violation: error.violationType,
          details: error.message,
          timestamp: new Date(),
        });

        return res.status(403).json({
          error: 'Compliance Violation',
          message: 'Transaction violates regulatory requirements',
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      if (error instanceof FraudDetectionError) {
        // Log for security monitoring
        this.logger.warn('Fraud detection triggered', {
          correlationId,
          customerId: req.body?.customerId,
          riskScore: error.riskScore,
          triggers: error.triggers,
        });

        return res.status(403).json({
          error: 'Transaction Blocked',
          message: 'Transaction blocked due to fraud risk',
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details,
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      // Rate limiting errors
      if (error.status === 429) {
        return res.status(429).json({
          error: 'Rate Limit Exceeded',
          message: 'Too many requests, please try again later',
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      // Database connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.logger.error('Database connection error', {
          correlationId,
          error: error.message,
        });

        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database service temporarily unavailable',
          correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      // Default server error
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        correlationId,
        timestamp: new Date().toISOString(),
      });
    };
  }
}
```

### 4.3 Python (FastAPI)

#### 4.3.1 Language and Framework Versions

- **Python**: 3.12 (latest stable version for AI/ML services)
- **FastAPI**: 0.104+ (high-performance framework with automatic API documentation)
- **Pydantic**: 2.0+ (data validation and settings management)
- **SQLAlchemy**: 2.0+ (ORM for database operations)

#### 4.3.2 Code Style (PEP 8 Compliance)

```python
"""
AI/ML Model Serving API for Financial Risk Assessment
Implements F-002 requirements for real-time risk scoring
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional, Union
from uuid import UUID, uuid4

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
import structlog
import tensorflow as tf
import torch

from app.core.config import settings
from app.core.security import verify_token
from app.core.database import get_db
from app.models.risk_assessment import RiskAssessmentModel
from app.services.bias_detection import BiasDetectionService
from app.services.model_monitoring import ModelMonitoringService
from app.services.audit_logger import AuditLogger

# Configure structured logging for financial services
logger = structlog.get_logger(__name__)

# Security configuration
security = HTTPBearer()

# FastAPI application with financial services configuration
app = FastAPI(
    title="Financial Risk Assessment API",
    description="AI-powered risk assessment engine for financial services",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class RiskAssessmentRequest(BaseModel):
    """
    Request model for risk assessment with comprehensive validation
    """
    customer_id: UUID = Field(..., description="Unique customer identifier")
    transaction_amount: Decimal = Field(
        ..., 
        gt=0, 
        le=1000000,
        description="Transaction amount in USD"
    )
    transaction_type: str = Field(
        ..., 
        regex="^(transfer|payment|withdrawal|deposit)$",
        description="Type of financial transaction"
    )
    merchant_id: Optional[UUID] = Field(None, description="Merchant identifier for payments")
    customer_data: Dict = Field(..., description="Customer profile data")
    transaction_context: Dict = Field(
        default_factory=dict,
        description="Additional transaction context"
    )
    
    @validator('customer_data')
    def validate_customer_data(cls, v):
        """Validate required customer data fields"""
        required_fields = ['credit_score', 'account_balance', 'transaction_history']
        if not all(field in v for field in required_fields):
            raise ValueError(f"Missing required customer data fields: {required_fields}")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "customer_id": "550e8400-e29b-41d4-a716-446655440000",
                "transaction_amount": "1500.00",
                "transaction_type": "payment",
                "merchant_id": "550e8400-e29b-41d4-a716-446655440001",
                "customer_data": {
                    "credit_score": 750,
                    "account_balance": "5000.00",
                    "transaction_history": []
                }
            }
        }


class RiskScoreResponse(BaseModel):
    """
    Response model for risk assessment results
    """
    risk_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0,
        description="Risk score between 0 (low risk) and 1 (high risk)"
    )
    risk_level: str = Field(
        ..., 
        regex="^(LOW|MEDIUM|HIGH|CRITICAL)$",
        description="Categorical risk level"
    )
    confidence_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0,
        description="Model confidence in the prediction"
    )
    risk_factors: List[str] = Field(
        ...,
        description="List of factors contributing to risk score"
    )
    processing_time_ms: int = Field(
        ...,
        description="Processing time in milliseconds"
    )
    model_version: str = Field(..., description="Version of the ML model used")
    bias_metrics: Dict = Field(..., description="Bias detection metrics")
    correlation_id: UUID = Field(..., description="Request correlation ID")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Response timestamp"
    )


class RiskAssessmentService:
    """
    Service class for AI-powered risk assessment
    Implements F-002 requirements for real-time risk scoring
    """
    
    def __init__(self):
        self.tensorflow_model = self._load_tensorflow_model()
        self.pytorch_model = self._load_pytorch_model()
        self.bias_detector = BiasDetectionService()
        self.model_monitor = ModelMonitoringService()
        self.audit_logger = AuditLogger()
        
    def _load_tensorflow_model(self) -> tf.keras.Model:
        """Load TensorFlow model for production deployment"""
        try:
            model_path = settings.TENSORFLOW_MODEL_PATH
            model = tf.keras.models.load_model(model_path)
            logger.info("TensorFlow model loaded successfully", model_path=model_path)
            return model
        except Exception as e:
            logger.error("Failed to load TensorFlow model", error=str(e))
            raise
    
    def _load_pytorch_model(self) -> torch.nn.Module:
        """Load PyTorch model for research and experimentation"""
        try:
            model_path = settings.PYTORCH_MODEL_PATH
            model = torch.load(model_path, map_location=torch.device('cpu'))
            model.eval()
            logger.info("PyTorch model loaded successfully", model_path=model_path)
            return model
        except Exception as e:
            logger.error("Failed to load PyTorch model", error=str(e))
            raise
    
    async def assess_risk(
        self, 
        request: RiskAssessmentRequest,
        correlation_id: UUID
    ) -> RiskScoreResponse:
        """
        Perform real-time risk assessment with bias detection
        Must complete within 500ms as per F-002-RQ-001
        """
        start_time = datetime.now()
        
        try:
            # Log request for audit trail
            await self.audit_logger.log_risk_assessment_request(
                customer_id=request.customer_id,
                transaction_amount=request.transaction_amount,
                correlation_id=correlation_id
            )
            
            # Prepare features for ML model
            features = self._prepare_features(request)
            
            # Get risk prediction from TensorFlow model (production)
            risk_prediction = self._predict_risk_tensorflow(features)
            
            # Calculate risk score and level
            risk_score = float(risk_prediction[0])
            risk_level = self._calculate_risk_level(risk_score)
            
            # Get confidence score
            confidence_score = self._calculate_confidence(features, risk_prediction)
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(features, risk_prediction)
            
            # Perform bias detection (F-002-RQ-004)
            bias_metrics = await self.bias_detector.detect_bias(
                features=features,
                prediction=risk_prediction,
                customer_data=request.customer_data
            )
            
            # Check processing time constraint
            processing_time_ms = int(
                (datetime.now() - start_time).total_seconds() * 1000
            )
            
            if processing_time_ms > 500:
                logger.warning(
                    "Risk assessment exceeded 500ms threshold",
                    processing_time_ms=processing_time_ms,
                    correlation_id=str(correlation_id)
                )
            
            # Log model performance metrics
            await self.model_monitor.log_prediction(
                model_version=settings.MODEL_VERSION,
                features=features,
                prediction=risk_prediction,
                processing_time_ms=processing_time_ms,
                bias_metrics=bias_metrics
            )
            
            response = RiskScoreResponse(
                risk_score=risk_score,
                risk_level=risk_level,
                confidence_score=confidence_score,
                risk_factors=risk_factors,
                processing_time_ms=processing_time_ms,
                model_version=settings.MODEL_VERSION,
                bias_metrics=bias_metrics,
                correlation_id=correlation_id
            )
            
            # Log successful assessment
            await self.audit_logger.log_risk_assessment_response(
                customer_id=request.customer_id,
                risk_score=risk_score,
                risk_level=risk_level,
                correlation_id=correlation_id,
                processing_time_ms=processing_time_ms
            )
            
            return response
            
        except Exception as e:
            # Log error for monitoring
            logger.error(
                "Risk assessment failed",
                customer_id=str(request.customer_id),
                correlation_id=str(correlation_id),
                error=str(e)
            )
            
            await self.audit_logger.log_risk_assessment_error(
                customer_id=request.customer_id,
                correlation_id=correlation_id,
                error=str(e)
            )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Risk assessment failed: {str(e)}"
            )
    
    def _prepare_features(self, request: RiskAssessmentRequest) -> np.ndarray:
        """Prepare features for ML model input"""
        # Convert customer data to feature vector
        features = []
        
        # Transaction features
        features.append(float(request.transaction_amount))
        features.append(self._encode_transaction_type(request.transaction_type))
        
        # Customer features
        customer_data = request.customer_data
        features.append(float(customer_data.get('credit_score', 600)))
        features.append(float(customer_data.get('account_balance', 0)))
        features.append(len(customer_data.get('transaction_history', [])))
        
        # Additional derived features
        features.extend(self._calculate_derived_features(customer_data))
        
        return np.array(features).reshape(1, -1)
    
    def _predict_risk_tensorflow(self, features: np.ndarray) -> np.ndarray:
        """Get risk prediction from TensorFlow model"""
        return self.tensorflow_model.predict(features, verbose=0)
    
    def _calculate_risk_level(self, risk_score: float) -> str:
        """Convert risk score to categorical risk level"""
        if risk_score <= 0.3:
            return "LOW"
        elif risk_score <= 0.6:
            return "MEDIUM"
        elif risk_score <= 0.8:
            return "HIGH"
        else:
            return "CRITICAL"


# Dependency injection for authentication
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """Verify JWT token and return user information"""
    try:
        payload = verify_token(credentials.credentials)
        return payload
    except Exception as e:
        logger.error("Authentication failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Risk assessment service instance
risk_service = RiskAssessmentService()


@app.post(
    "/api/v1/risk-assessment/score",
    response_model=RiskScoreResponse,
    summary="Calculate Risk Score",
    description="Generate real-time risk score for financial transactions",
    tags=["Risk Assessment"]
)
async def calculate_risk_score(
    request: RiskAssessmentRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RiskScoreResponse:
    """
    Calculate risk score for financial transaction
    
    - **customer_id**: Unique customer identifier
    - **transaction_amount**: Transaction amount in USD
    - **transaction_type**: Type of transaction (transfer, payment, etc.)
    - **customer_data**: Customer profile information
    
    Returns risk score with explainability and bias metrics
    """
    correlation_id = uuid4()
    
    # Log API access for audit
    logger.info(
        "Risk assessment requested",
        customer_id=str(request.customer_id),
        user_id=current_user.get('user_id'),
        correlation_id=str(correlation_id)
    )
    
    try:
        # Perform risk assessment
        response = await risk_service.assess_risk(request, correlation_id)
        
        # Schedule background tasks for model monitoring
        background_tasks.add_task(
            update_model_metrics,
            response.risk_score,
            response.processing_time_ms,
            response.bias_metrics
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Unexpected error in risk assessment endpoint",
            correlation_id=str(correlation_id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred"
        )


@app.get(
    "/api/v1/risk-assessment/health",
    tags=["Health Check"]
)
async def health_check() -> Dict:
    """Health check endpoint for load balancer"""
    try:
        # Check model availability
        tensorflow_status = "healthy" if risk_service.tensorflow_model else "unhealthy"
        pytorch_status = "healthy" if risk_service.pytorch_model else "unhealthy"
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "models": {
                "tensorflow": tensorflow_status,
                "pytorch": pytorch_status,
            },
            "version": settings.MODEL_VERSION
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )


async def update_model_metrics(
    risk_score: float,
    processing_time_ms: int,
    bias_metrics: Dict
) -> None:
    """Background task to update model performance metrics"""
    try:
        await risk_service.model_monitor.update_metrics(
            risk_score=risk_score,
            processing_time_ms=processing_time_ms,
            bias_metrics=bias_metrics
        )
    except Exception as e:
        logger.error("Failed to update model metrics", error=str(e))


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        },
    )
```

#### 4.3.3 Type Hints and Data Validation

```python
"""
Comprehensive type hints and validation for financial data models
"""

from typing import Dict, List, Optional, Union, Literal, Annotated
from decimal import Decimal
from datetime import datetime, date
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, validator, root_validator
from pydantic.types import EmailStr, SecretStr


class TransactionType(str, Enum):
    """Enumeration of supported transaction types"""
    TRANSFER = "transfer"
    PAYMENT = "payment"
    WITHDRAWAL = "withdrawal"
    DEPOSIT = "deposit"
    INVESTMENT = "investment"


class RiskLevel(str, Enum):
    """Risk level categories for financial transactions"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class CurrencyCode(str, Enum):
    """ISO 4217 currency codes supported by the platform"""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    CAD = "CAD"
    AUD = "AUD"


class CustomerProfile(BaseModel):
    """
    Customer profile model with comprehensive validation
    """
    customer_id: UUID = Field(..., description="Unique customer identifier")
    email: EmailStr = Field(..., description="Customer email address")
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    date_of_birth: date = Field(..., description="Customer date of birth")
    phone_number: str = Field(..., regex=r'^\+?1?\d{9,15}$')
    
    # Financial information
    credit_score: int = Field(..., ge=300, le=850, description="FICO credit score")
    annual_income: Decimal = Field(..., ge=0, description="Annual income in USD")
    account_balance: Decimal = Field(..., ge=0, description="Current account balance")
    
    # KYC/AML information
    kyc_status: Literal["pending", "verified", "rejected"] = Field(...)
    aml_risk_rating: RiskLevel = Field(..., description="AML risk rating")
    politically_exposed_person: bool = Field(default=False)
    
    # Account information
    account_type: Literal["checking", "savings", "investment", "business"] = Field(...)
    account_opened_date: date = Field(..., description="Account opening date")
    last_activity_date: datetime = Field(..., description="Last account activity")
    
    @validator('date_of_birth')
    def validate_age(cls, v):
        """Validate customer is at least 18 years old"""
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError('Customer must be at least 18 years old')
        return v
    
    @validator('account_opened_date')
    def validate_account_date(cls, v):
        """Validate account opening date is not in the future"""
        if v > date.today():
            raise ValueError('Account opening date cannot be in the future')
        return v
    
    class Config:
        json_encoders = {
            Decimal: lambda v: str(v),
            UUID: lambda v: str(v),
        }


class TransactionData(BaseModel):
    """
    Transaction data model with validation for financial transactions
    """
    transaction_id: UUID = Field(..., description="Unique transaction identifier")
    customer_id: UUID = Field(..., description="Customer identifier")
    transaction_type: TransactionType = Field(..., description="Type of transaction")
    
    # Amount information
    amount: Decimal = Field(..., gt=0, le=1000000, description="Transaction amount")
    currency: CurrencyCode = Field(default=CurrencyCode.USD)
    
    # Transaction details
    description: str = Field(..., min_length=1, max_length=500)
    reference_number: Optional[str] = Field(None, max_length=50)
    
    # Parties involved
    merchant_id: Optional[UUID] = Field(None, description="Merchant identifier")
    beneficiary_account: Optional[str] = Field(None, description="Beneficiary account number")
    
    # Metadata
    transaction_date: datetime = Field(default_factory=datetime.now)
    processed_date: Optional[datetime] = Field(None)
    status: Literal["pending", "completed", "failed", "cancelled"] = Field(default="pending")
    
    # Risk and compliance
    risk_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    fraud_indicators: List[str] = Field(default_factory=list)
    compliance_flags: List[str] = Field(default_factory=list)
    
    @validator('amount')
    def validate_amount_precision(cls, v):
        """Validate amount has at most 2 decimal places"""
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount can have at most 2 decimal places')
        return v
    
    @root_validator
    def validate_merchant_data(cls, values):
        """Validate merchant ID is required for payment transactions"""
        transaction_type = values.get('transaction_type')
        merchant_id = values.get('merchant_id')
        
        if transaction_type == TransactionType.PAYMENT and not merchant_id:
            raise ValueError('Merchant ID is required for payment transactions')
        
        return values


class ComplianceCheckResult(BaseModel):
    """
    Compliance check result with detailed validation
    """
    check_id: UUID = Field(..., description="Unique compliance check identifier")
    customer_id: UUID = Field(..., description="Customer identifier")
    check_type: Literal["kyc", "aml", "sanctions", "pep", "adverse_media"] = Field(...)
    
    # Check results
    status: Literal["passed", "failed", "manual_review"] = Field(...)
    risk_level: RiskLevel = Field(...)
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    
    # Details
    findings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    evidence_documents: List[str] = Field(default_factory=list)
    
    # Metadata
    check_date: datetime = Field(default_factory=datetime.now)
    expiry_date: Optional[datetime] = Field(None)
    reviewed_by: Optional[str] = Field(None)
    
    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        """Validate expiry date is after check date"""
        if v and v <= values.get('check_date', datetime.now()):
            raise ValueError('Expiry date must be after check date')
        return v


# Type aliases for common financial data types
Amount = Annotated[Decimal, Field(gt=0, le=1000000, description="Monetary amount")]
Percentage = Annotated[float, Field(ge=0.0, le=100.0, description="Percentage value")]
Score = Annotated[float, Field(ge=0.0, le=1.0, description="Score between 0 and 1")]
```

#### 4.3.4 Virtual Environment and Dependency Management

```python
# requirements.txt - Financial Services Platform Python Dependencies

# Core framework (FastAPI 0.104+)
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic[email]==2.5.0
pydantic-settings==2.1.0

# Database and ORM
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9  # PostgreSQL adapter
pymongo==4.6.0  # MongoDB driver
redis==5.0.1  # Redis client

# AI/ML frameworks (TensorFlow 2.15+, PyTorch 2.1+)
tensorflow==2.15.0
torch==2.1.0
torchvision==0.16.0
scikit-learn==1.3.2
numpy==1.24.4
pandas==2.1.4

# Security and authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# HTTP clients and API integration
httpx==0.25.2
aiohttp==3.9.1

# Financial services specific
python-dateutil==2.8.2
decimal-helper==0.1.0
iso4217==1.11.20230505  # Currency codes

# Monitoring and observability
structlog==23.2.0
prometheus-client==0.19.0
opentelemetry-api==1.21.0
opentelemetry-sdk==1.21.0

# Background tasks and messaging
celery==5.3.4
redis==5.0.1  # Message broker
kombu==5.3.4

# Development and testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1

# Production deployment
gunicorn==21.2.0
```

```bash
#!/bin/bash
# setup-python-env.sh - Python environment setup script

set -e

echo "Setting up Python 3.12 virtual environment for Financial Services Platform..."

# Check Python version
python_version=$(python3.12 --version 2>&1 | cut -d" " -f2 | cut -d"." -f1,2)
if [ "$python_version" != "3.12" ]; then
    echo "Error: Python 3.12 is required but found version $python_version"
    exit 1
fi

# Create virtual environment
python3.12 -m venv venv-financial-services

# Activate virtual environment
source venv-financial-services/bin/activate

# Upgrade pip to latest version
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Verify installation
echo "Verifying Python environment..."
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"

echo "Python environment setup complete!"
echo "To activate the environment, run: source venv-financial-services/bin/activate"
```

## 5. Frontend Coding Standards

### 5.1 TypeScript & React

#### 5.1.1 Language and Framework Versions

- **TypeScript**: 5.3+ (industry standard with static typing for better tooling)
- **React**: 18.2+ (latest stable version with concurrent features)
- **Next.js**: 14+ (server-side rendering and full-stack development)
- **Node.js**: 20 LTS (runtime environment)

#### 5.1.2 Project Structure and Organization

```
src/
├── components/                 # Reusable UI components
│   ├── ui/                    # Basic UI components (buttons, inputs, etc.)
│   ├── forms/                 # Form components
│   ├── charts/                # Financial data visualization
│   └── layout/                # Layout components
├── containers/                # Container components (business logic)
│   ├── customer/              # Customer management containers
│   ├── risk-assessment/       # Risk assessment containers
│   ├── compliance/            # Compliance management containers
│   └── onboarding/            # Digital onboarding containers
├── pages/                     # Next.js pages
├── hooks/                     # Custom React hooks
├── services/                  # API services and business logic
├── store/                     # Redux store configuration
│   ├── slices/                # Redux Toolkit slices
│   └── middleware/            # Custom middleware
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── constants/                 # Application constants
└── styles/                    # Global styles and themes
```

#### 5.1.3 Component Architecture (Container/Presentational Pattern)

```typescript
// types/risk-assessment.types.ts
export interface RiskAssessmentData {
  customerId: string;
  transactionAmount: number;
  transactionType: 'transfer' | 'payment' | 'withdrawal' | 'deposit';
  merchantId?: string;
  customerData: {
    creditScore: number;
    accountBalance: number;
    transactionHistory: TransactionHistory[];
  };
}

export interface RiskScoreResponse {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  riskFactors: string[];
  processingTimeMs: number;
  modelVersion: string;
  biasMetrics: Record<string, number>;
  correlationId: string;
  timestamp: string;
}

export interface RiskAssessmentState {
  isLoading: boolean;
  riskScore: RiskScoreResponse | null;
  error: string | null;
  history: RiskScoreResponse[];
}
```

```typescript
// containers/risk-assessment/RiskAssessmentContainer.tsx
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  calculateRiskScore, 
  clearRiskAssessment,
  selectRiskAssessmentState 
} from '../../store/slices/riskAssessmentSlice';
import { RiskAssessmentForm } from '../../components/forms/RiskAssessmentForm';
import { RiskScoreDisplay } from '../../components/risk-assessment/RiskScoreDisplay';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/Error';
import { useAuditLogger } from '../../hooks/useAuditLogger';
import type { RiskAssessmentData } from '../../types/risk-assessment.types';

/**
 * Container component for risk assessment functionality
 * Implements F-002 requirements for AI-powered risk assessment
 */
export const RiskAssessmentContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, riskScore, error } = useSelector(selectRiskAssessmentState);
  const auditLogger = useAuditLogger();

  // Clear risk assessment data on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearRiskAssessment());
    };
  }, [dispatch]);

  /**
   * Handle risk assessment form submission
   * Must complete within 500ms as per F-002-RQ-001
   */
  const handleRiskAssessment = useCallback(async (data: RiskAssessmentData) => {
    try {
      // Log user action for audit trail
      auditLogger.logUserAction('risk_assessment_initiated', {
        customerId: data.customerId,
        transactionAmount: data.transactionAmount,
        transactionType: data.transactionType,
      });

      // Dispatch risk assessment action
      const result = await dispatch(calculateRiskScore(data)).unwrap();

      // Log successful assessment
      auditLogger.logUserAction('risk_assessment_completed', {
        customerId: data.customerId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        processingTimeMs: result.processingTimeMs,
      });

      // Check if processing time exceeds threshold
      if (result.processingTimeMs > 500) {
        console.warn(
          `Risk assessment exceeded 500ms threshold: ${result.processingTimeMs}ms`
        );
      }

    } catch (error) {
      // Log failed assessment
      auditLogger.logUserAction('risk_assessment_failed', {
        customerId: data.customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [dispatch, auditLogger]);

  return (
    <div className="risk-assessment-container">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI-Powered Risk Assessment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Assessment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Transaction Details
            </h2>
            
            <RiskAssessmentForm
              onSubmit={handleRiskAssessment}
              isLoading={isLoading}
            />
          </div>

          {/* Risk Score Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Risk Analysis
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">
                  Analyzing transaction risk...
                </span>
              </div>
            )}

            {error && (
              <ErrorAlert
                title="Risk Assessment Failed"
                message={error}
                onRetry={() => dispatch(clearRiskAssessment())}
              />
            )}

            {riskScore && !isLoading && (
              <RiskScoreDisplay
                riskScore={riskScore}
                showDetails={true}
                showBiasMetrics={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

```typescript
// components/forms/RiskAssessmentForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { NumericInput } from '../ui/NumericInput';
import type { RiskAssessmentData } from '../../types/risk-assessment.types';

// Zod validation schema for risk assessment form
const riskAssessmentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  transactionAmount: z
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  transactionType: z.enum(['transfer', 'payment', 'withdrawal', 'deposit']),
  merchantId: z.string().uuid('Invalid merchant ID format').optional(),
  customerData: z.object({
    creditScore: z
      .number()
      .min(300, 'Credit score must be at least 300')
      .max(850, 'Credit score cannot exceed 850'),
    accountBalance: z
      .number()
      .min(0, 'Account balance cannot be negative'),
  }),
});

type RiskAssessmentFormData = z.infer<typeof riskAssessmentSchema>;

interface RiskAssessmentFormProps {
  onSubmit: (data: RiskAssessmentData) => void;
  isLoading: boolean;
}

/**
 * Presentational component for risk assessment form
 * Provides comprehensive validation for financial data input
 */
export const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RiskAssessmentFormData>({
    resolver: zodResolver(riskAssessmentSchema),
    mode: 'onChange',
    defaultValues: {
      transactionType: 'payment',
      customerData: {
        creditScore: 700,
        accountBalance: 5000,
      },
    },
  });

  const transactionType = watch('transactionType');
  const requiresMerchant = transactionType === 'payment';

  const handleFormSubmit = (data: RiskAssessmentFormData) => {
    // Transform form data to include transaction history
    const enrichedData: RiskAssessmentData = {
      ...data,
      customerData: {
        ...data.customerData,
        transactionHistory: [], // Would be fetched from API in real implementation
      },
    };

    onSubmit(enrichedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer ID */}
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
          Customer ID *
        </label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="customerId"
              type="text"
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              error={errors.customerId?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Transaction Amount */}
      <div>
        <label htmlFor="transactionAmount" className="block text-sm font-medium text-gray-700">
          Transaction Amount (USD) *
        </label>
        <Controller
          name="transactionAmount"
          control={control}
          render={({ field }) => (
            <NumericInput
              {...field}
              id="transactionAmount"
              placeholder="0.00"
              prefix="$"
              maxDecimals={2}
              error={errors.transactionAmount?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Transaction Type */}
      <div>
        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
          Transaction Type *
        </label>
        <Controller
          name="transactionType"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id="transactionType"
              options={[
                { value: 'transfer', label: 'Transfer' },
                { value: 'payment', label: 'Payment' },
                { value: 'withdrawal', label: 'Withdrawal' },
                { value: 'deposit', label: 'Deposit' },
              ]}
              error={errors.transactionType?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Merchant ID (conditional) */}
      {requiresMerchant && (
        <div>
          <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700">
            Merchant ID *
          </label>
          <Controller
            name="merchantId"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="merchantId"
                type="text"
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440001"
                error={errors.merchantId?.message}
                disabled={isLoading}
              />
            )}
          />
        </div>
      )}

      {/* Customer Data Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credit Score */}
          <div>
            <label htmlFor="creditScore" className="block text-sm font-medium text-gray-700">
              Credit Score *
            </label>
            <Controller
              name="customerData.creditScore"
              control={control}
              render={({ field }) => (
                <NumericInput
                  {...field}
                  id="creditScore"
                  placeholder="700"
                  min={300}
                  max={850}
                  error={errors.customerData?.creditScore?.message}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          {/* Account Balance */}
          <div>
            <label htmlFor="accountBalance" className="block text-sm font-medium text-gray-700">
              Account Balance (USD) *
            </label>
            <Controller
              name="customerData.accountBalance"
              control={control}
              render={({ field }) => (
                <NumericInput
                  {...field}
                  id="accountBalance"
                  placeholder="5000.00"
                  prefix="$"
                  maxDecimals={2}
                  error={errors.customerData?.accountBalance?.message}
                  disabled={isLoading}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isValid || isLoading}
          isLoading={isLoading}
        >
          {isLoading ? 'Analyzing Risk...' : 'Calculate Risk Score'}
        </Button>
      </div>
    </form>
  );
};
```

#### 5.1.4 State Management (Redux Toolkit 2.0+)

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rtkQueryErrorLogger } from './middleware/errorLogger';
import { auditLogger } from './middleware/auditLogger';

// Import slice reducers
import authReducer from './slices/authSlice';
import riskAssessmentReducer from './slices/riskAssessmentSlice';
import complianceReducer from './slices/complianceSlice';
import customerReducer from './slices/customerSlice';
import onboardingReducer from './slices/onboardingSlice';

// Import API slices
import { financialServicesApi } from './api/financialServicesApi';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, authReducer);

/**
 * Configure Redux store for Financial Services Platform
 * Includes middleware for error logging, audit trails, and API caching
 */
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    riskAssessment: riskAssessmentReducer,
    compliance: complianceReducer,
    customer: customerReducer,
    onboarding: onboardingReducer,
    [financialServicesApi.reducerPath]: financialServicesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(financialServicesApi.middleware)
      .concat(rtkQueryErrorLogger)
      .concat(auditLogger),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// store/slices/riskAssessmentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { riskAssessmentApi } from '../../services/riskAssessmentApi';
import type { 
  RiskAssessmentData, 
  RiskScoreResponse, 
  RiskAssessmentState 
} from '../../types/risk-assessment.types';

// Initial state
const initialState: RiskAssessmentState = {
  isLoading: false,
  riskScore: null,
  error: null,
  history: [],
};

/**
 * Async thunk for calculating risk score
 * Implements F-002-RQ-001 requirement for 500ms response time
 */
export const calculateRiskScore = createAsyncThunk(
  'riskAssessment/calculateScore',
  async (data: RiskAssessmentData, { rejectWithValue }) => {
    try {
      const startTime = Date.now();
      const response = await riskAssessmentApi.calculateRiskScore(data);
      const processingTime = Date.now() - startTime;

      // Log if processing time exceeds threshold
      if (processingTime > 500) {
        console.warn(
          `Risk assessment exceeded 500ms threshold: ${processingTime}ms`
        );
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

/**
 * Risk assessment slice with comprehensive state management
 */
const riskAssessmentSlice = createSlice({
  name: 'riskAssessment',
  initialState,
  reducers: {
    clearRiskAssessment: (state) => {
      state.riskScore = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToHistory: (state, action: PayloadAction<RiskScoreResponse>) => {
      state.history.unshift(action.payload);
      // Keep only last 10 assessments
      if (state.history.length > 10) {
        state.history = state.history.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateRiskScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateRiskScore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.riskScore = action.payload;
        state.error = null;
        
        // Add to history
        state.history.unshift(action.payload);
        if (state.history.length > 10) {
          state.history = state.history.slice(0, 10);
        }
      })
      .addCase(calculateRiskScore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.riskScore = null;
      });
  },
});

export const {
  clearRiskAssessment,
  clearError,
  addToHistory,
} = riskAssessmentSlice.actions;

// Selectors
export const selectRiskAssessmentState = (state: { riskAssessment: RiskAssessmentState }) =>
  state.riskAssessment;

export const selectRiskScore = (state: { riskAssessment: RiskAssessmentState }) =>
  state.riskAssessment.riskScore;

export const selectRiskAssessmentHistory = (state: { riskAssessment: RiskAssessmentState }) =>
  state.riskAssessment.history;

export default riskAssessmentSlice.reducer;
```

#### 5.1.5 Custom Hooks for Reusable Logic

```typescript
// hooks/useAuditLogger.ts
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { auditService } from '../services/auditService';

/**
 * Custom hook for audit logging in financial services
 * Ensures all user actions are tracked for regulatory compliance
 */
export const useAuditLogger = () => {
  const currentUser = useSelector(selectCurrentUser);

  const logUserAction = useCallback(
    (action: string, details: Record<string, any>) => {
      if (!currentUser) {
        console.warn('Audit logging attempted without authenticated user');
        return;
      }

      auditService.logUserAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action,
        details,
        timestamp: new Date().toISOString(),
        sessionId: currentUser.sessionId,
        ipAddress: currentUser.ipAddress,
      });
    },
    [currentUser]
  );

  const logSecurityEvent = useCallback(
    (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>) => {
      auditService.logSecurityEvent({
        userId: currentUser?.id,
        event,
        severity,
        details,
        timestamp: new Date().toISOString(),
        sessionId: currentUser?.sessionId,
        ipAddress: currentUser?.ipAddress,
      });
    },
    [currentUser]
  );

  return {
    logUserAction,
    logSecurityEvent,
  };
};
```

```typescript
// hooks/useFinancialValidation.ts
import { useMemo } from 'react';
import { z } from 'zod';

/**
 * Custom hook for financial data validation
 * Provides reusable validation schemas and utilities
 */
export const useFinancialValidation = () => {
  const schemas = useMemo(() => ({
    // Currency amount validation
    currencyAmount: z
      .number()
      .min(0.01, 'Amount must be greater than $0.01')
      .max(1000000, 'Amount cannot exceed $1,000,000')
      .refine(
        (val) => Number((val * 100).toFixed(0)) / 100 === val,
        'Amount can have at most 2 decimal places'
      ),

    // Credit score validation
    creditScore: z
      .number()
      .int('Credit score must be a whole number')
      .min(300, 'Credit score must be at least 300')
      .max(850, 'Credit score cannot exceed 850'),

    // Account number validation
    accountNumber: z
      .string()
      .regex(/^\d{8,17}$/, 'Account number must be 8-17 digits'),

    // Routing number validation (US)
    routingNumber: z
      .string()
      .regex(/^\d{9}$/, 'Routing number must be exactly 9 digits')
      .refine(
        (val) => {
          // ABA routing number checksum validation
          const digits = val.split('').map(Number);
          const checksum = 
            3 * (digits[0] + digits[3] + digits[6]) +
            7 * (digits[1] + digits[4] + digits[7]) +
            (digits[2] + digits[5] + digits[8]);
          return checksum % 10 === 0;
        },
        'Invalid routing number checksum'
      ),

    // SSN validation (last 4 digits)
    ssnLast4: z
      .string()
      .regex(/^\d{4}$/, 'SSN last 4 digits must be exactly 4 numbers'),

    // Phone number validation
    phoneNumber: z
      .string()
      .regex(/^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, 'Invalid US phone number format'),
  }), []);

  const validateCurrencyAmount = (amount: number): { isValid: boolean; error?: string } => {
    try {
      schemas.currencyAmount.parse(amount);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: 'Invalid amount' };
    }
  };

  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseCurrencyInput = (input: string): number | null => {
    // Remove currency symbols and formatting
    const cleaned = input.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      return null;
    }
    
    // Round to 2 decimal places
    return Math.round(parsed * 100) / 100;
  };

  return {
    schemas,
    validateCurrencyAmount,
    formatCurrency,
    parseCurrencyInput,
  };
};
```

### 5.2 Code Formatting & Linting

#### 5.2.1 ESLint Configuration (8.55+)

```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "security",
    "import"
  ],
  "rules": {
    // TypeScript specific rules for financial services
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-floating-promises": "error",
    
    // React specific rules
    "react/prop-types": "off", // TypeScript handles this
    "react/react-in-jsx-scope": "off", // Next.js handles this
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Security rules for financial applications
    "security/detect-object-injection": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-no-csrf-before-method-override": "error",
    
    // Import/Export rules
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-unused-modules": "error",
    
    // General code quality rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "no-alert": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "dot-notation": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    
    // Financial services specific custom rules
    "financial-services/no-hardcoded-secrets": "error",
    "financial-services/require-audit-logging": "warn",
    "financial-services/validate-currency-precision": "error"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      "env": {
        "jest": true
      },
      "rules": {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "security/detect-object-injection": "off"
      }
    }
  ],
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    }
  }
}
```

#### 5.2.2 Prettier Configuration (3.1+)

```json
// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "insertPragma": false,
  "requirePragma": false,
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 80
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    }
  ]
}
```

#### 5.2.3 Pre-commit Hooks for Code Quality

```yaml
# .pre-commit-config.yaml for frontend
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-json
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|scss|md)$
        exclude: |
          (?x)(
            package-lock\.json|
            yarn\.lock|
            \.min\.(js|css)$
          )

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.55.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        types: [file]
        additional_dependencies:
          - '@typescript-eslint/eslint-plugin@^6.0.0'
          - '@typescript-eslint/parser@^6.0.0'
          - 'eslint-config-next@^14.0.0'
          - 'eslint-plugin-react@^7.33.0'
          - 'eslint-plugin-react-hooks@^4.6.0'
          - 'eslint-plugin-jsx-a11y@^6.8.0'
          - 'eslint-plugin-security@^1.7.0'

  - repo: local
    hooks:
      - id: typescript-check
        name: TypeScript Check
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        pass_filenames: false

      - id: financial-services-lint
        name: Financial Services Custom Linting
        entry: npm run lint:financial-services
        language: system
        files: \.(ts|tsx)$
        pass_filenames: false
```

### 5.3 UI Components

#### 5.3.1 Material-UI (MUI) Configuration (5.15+)

```typescript
// theme/financialServicesTheme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Financial services brand colors
const brandColors = {
  primary: {
    main: '#1976d2', // Professional blue
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#388e3c', // Success green for financial gains
    light: '#66bb6a',
    dark: '#2e7d32',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f', // Risk/error red
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f57c00', // Warning orange for medium risk
    light: '#ff9800',
    dark: '#ef6c00',
    contrastText: '#000000',
  },
  info: {
    main: '#0288d1', // Information blue
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32', // Success green
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
};

// Risk level colors for financial applications
const riskColors = {
  low: '#4caf50',      // Green
  medium: '#ff9800',   // Orange
  high: '#f44336',     // Red
  critical: '#9c27b0', // Purple
};

// Financial services theme configuration
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...brandColors,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 40,
          paddingLeft: 24,
          paddingRight: 24,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
};

export const financialServicesTheme = createTheme(themeOptions);

// Risk level theme variants
export const createRiskTheme = (riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
  return createTheme({
    ...themeOptions,
    palette: {
      ...themeOptions.palette,
      primary: {
        main: riskColors[riskLevel],
        light: alpha(riskColors[riskLevel], 0.7),
        dark: alpha(riskColors[riskLevel], 1.2),
        contrastText: '#ffffff',
      },
    },
  });
};
```

#### 5.3.2 Custom Component Library

```typescript
// components/ui/RiskScoreCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import type { RiskScoreResponse } from '../../types/risk-assessment.types';

// Styled components for risk visualization
const RiskScoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(3),
  position: 'relative',
}));

const RiskScoreValue = styled(Typography)<{ riskLevel: string }>(({ theme, riskLevel }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  color: getRiskLevelColor(riskLevel, theme),
  lineHeight: 1,
}));

const RiskFactorChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontSize: '0.75rem',
}));

// Helper function to get risk level colors
const getRiskLevelColor = (riskLevel: string, theme: any): string => {
  const colors = {
    LOW: theme.palette.success.main,
    MEDIUM: theme.palette.warning.main,
    HIGH: theme.palette.error.main,
    CRITICAL: '#9c27b0',
  };
  return colors[riskLevel as keyof typeof colors] || theme.palette.text.primary;
};

// Helper function to get risk level icon
const getRiskLevelIcon = (riskLevel: string): React.ReactElement => {
  const iconProps = { fontSize: 'small' as const };
  
  switch (riskLevel) {
    case 'LOW':
      return <CheckCircle {...iconProps} color="success" />;
    case 'MEDIUM':
      return <Warning {...iconProps} color="warning" />;
    case 'HIGH':
      return <Error {...iconProps} color="error" />;
    case 'CRITICAL':
      return <Error {...iconProps} sx={{ color: '#9c27b0' }} />;
    default:
      return <Info {...iconProps} />;
  }
};

interface RiskScoreCardProps {
  riskScore: RiskScoreResponse;
  showDetails?: boolean;
  showBiasMetrics?: boolean;
  onDetailsClick?: () => void;
}

/**
 * Risk Score Card component for displaying AI-powered risk assessment results
 * Implements F-002 requirements with comprehensive risk visualization
 */
export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  riskScore,
  showDetails = true,
  showBiasMetrics = false,
  onDetailsClick,
}) => {
  const theme = useTheme();
  
  // Calculate risk percentage for progress bar
  const riskPercentage = riskScore.riskScore * 100;
  
  // Determine trend icon based on historical data (would come from props in real implementation)
  const trendIcon = riskPercentage > 50 ? <TrendingUp /> : <TrendingDown />;

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" color="text.primary">
            Risk Assessment Result
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getRiskLevelIcon(riskScore.riskLevel)}
              label={riskScore.riskLevel}
              color={
                riskScore.riskLevel === 'LOW' ? 'success' :
                riskScore.riskLevel === 'MEDIUM' ? 'warning' :
                'error'
              }
              variant="filled"
            />
            <Tooltip title="Risk trend">
              <IconButton size="small">
                {trendIcon}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <RiskScoreContainer>
          <RiskScoreValue riskLevel={riskScore.riskLevel}>
            {Math.round(riskPercentage)}%
          </RiskScoreValue>
          
          <Typography variant="body2" color="text.secondary" align="center">
            Risk Score
          </Typography>
          
          <Box width="100%" mt={2}>
            <LinearProgress
              variant="determinate"
              value={riskPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getRiskLevelColor(riskScore.riskLevel, theme),
                },
              }}
            />
          </Box>
        </RiskScoreContainer>

        {/* Confidence Score */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Model Confidence
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={riskScore.confidenceScore * 100}
              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" color="text.secondary">
              {Math.round(riskScore.confidenceScore * 100)}%
            </Typography>
          </Box>
        </Box>

        {/* Risk Factors */}
        {showDetails && riskScore.riskFactors.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Key Risk Factors
            </Typography>
            <Box>
              {riskScore.riskFactors.slice(0, 3).map((factor, index) => (
                <RiskFactorChip
                  key={index}
                  label={factor}
                  variant="outlined"
                  size="small"
                />
              ))}
              {riskScore.riskFactors.length > 3 && (
                <RiskFactorChip
                  label={`+${riskScore.riskFactors.length - 3} more`}
                  variant="outlined"
                  size="small"
                  onClick={onDetailsClick}
                  clickable
                />
              )}
            </Box>
          </Box>
        )}

        {/* Performance Metrics */}
        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Processing Time
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {riskScore.processingTimeMs}ms
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Model Version
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {riskScore.modelVersion}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Bias Metrics (if enabled) */}
        {showBiasMetrics && Object.keys(riskScore.biasMetrics).length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Bias Detection Metrics
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(riskScore.biasMetrics).map(([metric, value]) => (
                <Grid item xs={12} key={metric}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {typeof value === 'number' ? value.toFixed(3) : value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Metadata */}
        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Assessment ID: {riskScore.correlationId}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Generated: {new Date(riskScore.timestamp).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
```

```typescript
// components/ui/CurrencyInput.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFinancialValidation } from '../../hooks/useFinancialValidation';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-input': {
    textAlign: 'right',
    fontSize: '1.1rem',
    fontWeight: 500,
    fontFamily: 'monospace',
  },
  '& .MuiInputAdornment-root': {
    '& .MuiTypography-root': {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
  },
}));

interface CurrencyInputProps {
  value?: number | string;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  currency?: string;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  precision?: number;
}

/**
 * Currency Input component with financial validation
 * Provides proper formatting and validation for monetary amounts
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      currency = 'USD',
      label,
      placeholder = '0.00',
      error,
      helperText,
      disabled,
      required,
      fullWidth = true,
      min = 0.01,
      max = 1000000,
      precision = 2,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = useState('');
    const [focused, setFocused] = useState(false);
    const { formatCurrency, parseCurrencyInput, validateCurrencyAmount } = useFinancialValidation();

    useImperativeHandle(ref, () => inputRef.current!);

    // Initialize display value
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numericValue)) {
          setDisplayValue(focused ? numericValue.toFixed(precision) : formatCurrency(numericValue, currency));
        } else {
          setDisplayValue('');
        }
      } else {
        setDisplayValue('');
      }
    }, [value, currency, focused, precision, formatCurrency]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      
      // Allow only numbers, decimal point, and currency symbols
      const cleanedValue = inputValue.replace(/[^0-9.,]/g, '');
      
      // Handle decimal input
      const parts = cleanedValue.split('.');
      if (parts.length > 2) {
        return; // Prevent multiple decimal points
      }
      
      if (parts[1] && parts[1].length > precision) {
        return; // Prevent exceeding precision
      }

      setDisplayValue(cleanedValue);

      // Parse and validate
      const numericValue = parseCurrencyInput(cleanedValue);
      
      if (onChange) {
        if (numericValue === null || cleanedValue === '') {
          onChange(null);
        } else {
          const validation = validateCurrencyAmount(numericValue);
          if (validation.isValid && numericValue >= min && numericValue <= max) {
            onChange(numericValue);
          }
        }
      }
    };

    const handleFocus = () => {
      setFocused(true);
      if (value !== undefined && value !== null) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numericValue)) {
          setDisplayValue(numericValue.toFixed(precision));
        }
      }
    };

    const handleBlur = () => {
      setFocused(false);
      if (onBlur) {
        onBlur();
      }
      
      // Format display value
      if (value !== undefined && value !== null) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numericValue)) {
          setDisplayValue(formatCurrency(numericValue, currency));
        }
      }
    };

    // Currency symbol mapping
    const getCurrencySymbol = (currencyCode: string): string => {
      const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
      };
      return symbols[currencyCode] || currencyCode;
    };

    // Validation state
    const numericValue = typeof value === 'number' ? value : (value ? parseFloat(value) : null);
    const validation = numericValue ? validateCurrencyAmount(numericValue) : { isValid: true };
    const isInvalid = error || !validation.isValid || (numericValue !== null && (numericValue < min || numericValue > max));

    return (
      <Box>
        <StyledTextField
          {...props}
          ref={inputRef}
          fullWidth={fullWidth}
          label={label}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          error={isInvalid}
          disabled={disabled}
          required={required}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {getCurrencySymbol(currency)}
              </InputAdornment>
            ),
          }}
          inputProps={{
            inputMode: 'decimal',
            pattern: '[0-9]*[.,]?[0-9]*',
          }}
        />
        
        {(helperText || validation.error) && (
          <FormHelperText error={isInvalid}>
            {validation.error || helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
```

## 6. Mobile Coding Standards

### 6.1 Kotlin (Android)

#### 6.1.1 Language and Framework Versions

- **Kotlin**: 1.9+ (modern Android development language)
- **Android API Level**: 26+ (Android 8.0) minimum, targeting API 34+
- **Jetpack Compose**: 1.5+ (modern UI toolkit)
- **Coroutines**: 1.7+ (asynchronous programming)

#### 6.1.2 Code Style (Official Kotlin Coding Conventions)

```kotlin
// MainActivity.kt - Main activity for Financial Services Mobile App
package com.platform.financial.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.platform.financial.android.ui.theme.FinancialServicesTheme
import com.platform.financial.android.ui.screens.onboarding.OnboardingScreen
import com.platform.financial.android.ui.screens.risk.RiskAssessmentScreen
import com.platform.financial.android.ui.screens.dashboard.DashboardScreen
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main Activity for Financial Services Platform Mobile App
 * Implements F-004 digital onboarding and F-002 risk assessment features
 * 
 * Security Features:
 * - Biometric authentication integration
 * - Certificate pinning for API calls  
 * - Screen recording prevention
 * - Root detection
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Prevent screenshots and screen recording for financial security
        if (BuildConfig.BUILD_TYPE == "release") {
            window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            )
        }
        
        setContent {
            FinancialServicesTheme {
                FinancialServicesApp()
            }
        }
    }
}

/**
 * Main composable function for the Financial Services app
 * Implements navigation and state management using MVVM-C pattern
 */
@Composable
fun FinancialServicesApp() {
    val navController = rememberNavController()
    
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        NavHost(
            navController = navController,
            startDestination = "onboarding"
        ) {
            composable("onboarding") {
                OnboardingScreen(
                    onNavigateToRiskAssessment = {
                        navController.navigate("risk_assessment")
                    },
                    onNavigateToDashboard = {
                        navController.navigate("dashboard")
                    }
                )
            }
            
            composable("risk_assessment") {
                RiskAssessmentScreen(
                    onNavigateBack = {
                        navController.popBackStack()
                    },
                    onNavigateToDashboard = {
                        navController.navigate("dashboard")
                    }
                )
            }
            
            composable("dashboard") {
                DashboardScreen(
                    onNavigateToRiskAssessment = {
                        navController.navigate("risk_assessment")
                    }
                )
            }
        }
    }
}
```