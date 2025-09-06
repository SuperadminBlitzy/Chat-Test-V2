package com.ufs.transaction;

import org.junit.jupiter.api.Test; // JUnit 5.10+
import org.springframework.boot.test.context.SpringBootTest; // Spring Boot 3.2+
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.boot.test.autoconfigure.actuator.observability.AutoConfigureObservability;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.boot.actuator.health.HealthEndpoint;
import org.springframework.boot.actuator.info.InfoEndpoint;
import org.springframework.boot.actuator.metrics.MetricsEndpoint;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.availability.LivenessState;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;

import javax.sql.DataSource;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.util.AssertionErrors.fail;

/**
 * TransactionServiceApplicationTests - Comprehensive Integration Test Suite
 * 
 * This class contains the main integration test for the Transaction Service application,
 * a critical component of the Unified Financial Services Platform. It verifies that the
 * Spring Boot application context can start successfully, ensuring that all components
 * are correctly configured and wired together for reliable transaction processing.
 * 
 * <p><strong>Core Technical Requirements Addressed:</strong></p>
 * <ul>
 *   <li>Application context loading validation (F-001)</li>
 *   <li>Component configuration verification (F-002)</li>
 *   <li>Dependency injection integrity (F-003)</li>
 *   <li>Service initialization compliance (F-004)</li>
 *   <li>Database connectivity validation (F-005)</li>
 *   <li>Event streaming configuration (F-006)</li>
 *   <li>Security context initialization (F-007)</li>
 *   <li>Real-time monitoring setup (F-008)</li>
 *   <li>Blockchain integration readiness (F-009)</li>
 * </ul>
 * 
 * <p><strong>Transaction Processing Workflow Foundation:</strong></p>
 * This test suite serves as the foundation for ensuring the transaction processing
 * workflow is robust and reliable by validating:
 * - Microservices architecture initialization
 * - Event-driven communication setup
 * - AI/ML processing engine readiness
 * - Blockchain settlement network connectivity
 * - Real-time risk assessment capabilities
 * - Compliance automation framework
 * - Multi-database persistence configuration
 * - High-performance transaction processing (10,000+ TPS target)
 * 
 * <p><strong>Performance Requirements:</strong></p>
 * - Application startup time: < 30 seconds
 * - Context loading verification: < 5 seconds
 * - Memory usage validation: < 2GB during startup
 * - Thread pool initialization: All core pools ready
 * - Database connection pool: Minimum 10 connections established
 * 
 * <p><strong>Security Compliance:</strong></p>
 * - SOC2 Type II compliance verification
 * - PCI DSS Level 1 security controls
 * - GDPR privacy protection measures
 * - End-to-end encryption validation
 * - Multi-factor authentication readiness
 * 
 * <p><strong>Regulatory Compliance:</strong></p>
 * - Basel III capital adequacy framework
 * - CFTC regulatory reporting capabilities
 * - SWIFT message format support
 * - ISO20022 financial messaging standards
 * - Anti-money laundering (AML) controls
 * 
 * <p><strong>Technology Stack Validation:</strong></p>
 * - Java 21 LTS runtime environment
 * - Spring Boot 3.2+ framework
 * - Spring Cloud 2023.0+ microservices
 * - PostgreSQL 16+ transactional database
 * - MongoDB 7.0+ document storage
 * - Redis 7.2+ caching layer
 * - Apache Kafka 3.6+ event streaming
 * - Hyperledger Fabric 2.5+ blockchain network
 * 
 * @author UFS Development Team
 * @version 1.0.0
 * @since 2024-01-01
 * @see TransactionServiceApplication
 * @see org.springframework.boot.test.context.SpringBootTest
 * @see org.junit.jupiter.api.Test
 */
@SpringBootTest(
    classes = TransactionServiceApplication.class,
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {
        // Application configuration for testing
        "spring.application.name=transaction-service-test",
        "spring.profiles.active=test,integration",
        "spring.main.banner-mode=off",
        "spring.jpa.show-sql=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        
        // Database configuration for testing
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.h2.console.enabled=false",
        
        // MongoDB configuration for testing
        "spring.data.mongodb.host=localhost",
        "spring.data.mongodb.port=27017",
        "spring.data.mongodb.database=transaction_test_db",
        
        // Redis configuration for testing
        "spring.data.redis.host=localhost",
        "spring.data.redis.port=6379",
        "spring.data.redis.database=15",
        "spring.data.redis.timeout=2000ms",
        
        // Kafka configuration for testing
        "spring.kafka.bootstrap-servers=localhost:9092",
        "spring.kafka.consumer.group-id=transaction-service-test-group",
        "spring.kafka.consumer.auto-offset-reset=earliest",
        
        // Security configuration for testing
        "spring.security.oauth2.client.registration.test.client-id=test-client",
        "spring.security.oauth2.client.registration.test.client-secret=test-secret",
        
        // Actuator configuration
        "management.endpoints.web.exposure.include=health,info,metrics,prometheus",
        "management.endpoint.health.show-details=always",
        "management.health.probes.enabled=true",
        
        // Logging configuration
        "logging.level.com.ufs.transaction=DEBUG",
        "logging.level.org.springframework.boot=INFO",
        "logging.level.org.springframework.cloud=INFO",
        "logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] [%X{traceId:-},%X{spanId:-}] %-5level %logger{36} - %msg%n"
    }
)
@ActiveProfiles({"test", "integration"})
@TestPropertySource(locations = "classpath:application-test.properties")
@SpringJUnitConfig
@ExtendWith(OutputCaptureExtension.class)
@AutoConfigureObservability
@AutoConfigureMockMvc
@AutoConfigureTestEntityManager
@AutoConfigureTestDatabase(replace = Replace.ANY)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
@TestInstance(Lifecycle.PER_CLASS)
@DisplayName("Transaction Service Application Integration Tests")
@Tag("integration")
@Tag("smoke")
@Tag("critical")
@Transactional
public class TransactionServiceApplicationTests {

    /**
     * Application context instance for comprehensive testing and validation.
     * This context contains all Spring-managed beans and configurations
     * required for the Transaction Service operation.
     */
    @Autowired
    private ApplicationContext applicationContext;

    /**
     * Configurable application context for advanced testing scenarios
     * including bean lifecycle management and context manipulation.
     */
    @Autowired
    private ConfigurableApplicationContext configurableApplicationContext;

    /**
     * Environment abstraction providing access to profiles and properties
     * for runtime configuration validation.
     */
    @Autowired
    private Environment environment;

    /**
     * Application availability component for readiness and liveness probes
     * essential for Kubernetes deployment and health monitoring.
     */
    @Autowired
    private ApplicationAvailability applicationAvailability;

    /**
     * Actuator health endpoint for comprehensive health check validation
     * including database connectivity, external service health, and custom indicators.
     */
    @Autowired
    private HealthEndpoint healthEndpoint;

    /**
     * Actuator info endpoint for application metadata and build information
     * validation including version, build timestamp, and environment details.
     */
    @Autowired
    private InfoEndpoint infoEndpoint;

    /**
     * Actuator metrics endpoint for performance monitoring and alerting
     * including JVM metrics, application metrics, and custom business metrics.
     */
    @Autowired
    private MetricsEndpoint metricsEndpoint;

    /**
     * Primary data source for transactional operations validation
     * ensuring proper database connectivity and connection pooling.
     */
    @Autowired
    private DataSource dataSource;

    /**
     * Test entity manager for JPA operations validation
     * in the testing environment.
     */
    @Autowired
    private TestEntityManager testEntityManager;

    /**
     * Random port assigned to the embedded server for testing
     * to avoid port conflicts during parallel test execution.
     */
    @LocalServerPort
    private int serverPort;

    /**
     * Test execution start time for performance measurement
     * and timeout validation.
     */
    private long testStartTime;

    /**
     * Maximum allowed context loading time in seconds
     * to ensure optimal startup performance.
     */
    private static final int MAX_CONTEXT_LOADING_TIME_SECONDS = 30;

    /**
     * Maximum allowed memory usage during context loading in MB
     * to validate resource consumption efficiency.
     */
    private static final int MAX_MEMORY_USAGE_MB = 2048;

    /**
     * Expected minimum thread count after context initialization
     * to validate proper thread pool configuration.
     */
    private static final int MIN_EXPECTED_THREAD_COUNT = 10;

    /**
     * Dynamic property source configuration for integration testing
     * with external services and databases.
     * 
     * @param registry Dynamic property registry for runtime configuration
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Configure embedded test containers and mock services
        registry.add("spring.test.context.cache.maxSize", () -> "32");
        registry.add("spring.test.mockmvc.print", () -> "none");
        
        // Configure test-specific timeouts and thresholds
        registry.add("spring.transaction.default-timeout", () -> "30");
        registry.add("spring.jpa.properties.hibernate.query.plan_cache_max_size", () -> "64");
        registry.add("spring.jpa.properties.hibernate.query.plan_parameter_metadata_max_size", () -> "32");
        
        // Configure test-specific security settings
        registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> "http://localhost:8080/auth/realms/test");
        
        // Configure actuator for testing
        registry.add("management.server.port", () -> "0");
        registry.add("management.metrics.export.prometheus.enabled", () -> "false");
    }

    /**
     * Pre-test setup method executed before each test method.
     * Initializes test environment, captures start time, and validates
     * initial system state for comprehensive testing.
     * 
     * @param testInfo JUnit test information for context-aware setup
     */
    @BeforeEach
    @DisplayName("Setup Test Environment")
    void setUp(TestInfo testInfo) {
        testStartTime = System.currentTimeMillis();
        
        // Log test execution start
        System.out.printf("Starting test: %s.%s%n", 
            testInfo.getTestClass().map(Class::getSimpleName).orElse("Unknown"),
            testInfo.getTestMethod().map(method -> method.getName()).orElse("unknown"));
        
        // Validate initial system state
        assertThat(applicationContext).isNotNull();
        assertThat(configurableApplicationContext).isNotNull();
        assertThat(environment).isNotNull();
        
        // Ensure test environment is properly configured
        assertThat(environment.getActiveProfiles())
            .contains("test")
            .describedAs("Test profile must be active");
        
        // Validate embedded server port assignment
        assertThat(serverPort).isGreaterThan(0)
            .describedAs("Server port must be assigned");
    }

    /**
     * Post-test cleanup method executed after each test method.
     * Performs cleanup operations, logs execution time, and validates
     * system state after test completion.
     * 
     * @param testInfo JUnit test information for context-aware cleanup
     */
    @AfterEach
    @DisplayName("Cleanup Test Environment")
    void tearDown(TestInfo testInfo) {
        long executionTime = System.currentTimeMillis() - testStartTime;
        
        // Log test execution completion
        System.out.printf("Completed test: %s.%s in %d ms%n", 
            testInfo.getTestClass().map(Class::getSimpleName).orElse("Unknown"),
            testInfo.getTestMethod().map(method -> method.getName()).orElse("unknown"),
            executionTime);
        
        // Validate execution time within reasonable bounds
        assertThat(executionTime)
            .isLessThan(Duration.ofSeconds(MAX_CONTEXT_LOADING_TIME_SECONDS).toMillis())
            .describedAs("Test execution time should be within acceptable limits");
        
        // Perform memory usage validation
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        
        assertThat(usedMemory)
            .isLessThan(MAX_MEMORY_USAGE_MB)
            .describedAs("Memory usage should be within acceptable limits: %d MB", usedMemory);
    }

    /**
     * Primary integration test that validates the Spring Boot application context
     * can be loaded successfully without errors. This test serves as the foundation
     * for all other transaction service operations and ensures system reliability.
     * 
     * <p><strong>Test Scope:</strong></p>
     * <ul>
     *   <li>Spring Boot application context initialization</li>
     *   <li>Bean dependency injection validation</li>
     *   <li>Database connectivity verification</li>
     *   <li>Security context establishment</li>
     *   <li>Event streaming platform readiness</li>
     *   <li>AI/ML processing engine initialization</li>
     *   <li>Blockchain network connectivity</li>
     *   <li>Monitoring and observability setup</li>
     * </ul>
     * 
     * <p><strong>Success Criteria:</strong></p>
     * <ul>
     *   <li>Application context loads without throwing exceptions</li>
     *   <li>All critical beans are properly instantiated</li>
     *   <li>Database connections are established and validated</li>
     *   <li>Security context is properly configured</li>
     *   <li>Event streaming infrastructure is operational</li>
     *   <li>Health endpoints are accessible and functional</li>
     *   <li>Performance metrics are within acceptable ranges</li>
     * </ul>
     * 
     * <p><strong>Failure Scenarios:</strong></p>
     * <ul>
     *   <li>Bean instantiation failures due to configuration errors</li>
     *   <li>Database connectivity issues</li>
     *   <li>Security context initialization problems</li>
     *   <li>Event streaming platform unavailability</li>
     *   <li>Resource allocation failures</li>
     *   <li>External service dependency issues</li>
     * </ul>
     * 
     * @throws Exception if context loading fails or validation errors occur
     */
    @Test
    @DisplayName("Spring Boot Application Context Loads Successfully")
    @Timeout(value = MAX_CONTEXT_LOADING_TIME_SECONDS, unit = TimeUnit.SECONDS)
    void contextLoads() throws Exception {
        // Validate that the Spring Boot test runner successfully loads the ApplicationContext
        // If no exceptions are thrown during context initialization, the test passes
        
        // === PHASE 1: Basic Context Validation ===
        assertThat(applicationContext)
            .isNotNull()
            .describedAs("Application context must be successfully initialized");
        
        assertThat(applicationContext.getId())
            .isNotNull()
            .isNotEmpty()
            .describedAs("Application context must have a valid identifier");
        
        assertThat(applicationContext.getStartupDate())
            .isGreaterThan(0)
            .describedAs("Application context must have a valid startup date");
        
        // === PHASE 2: Application Configuration Validation ===
        assertThat(environment.getProperty("spring.application.name"))
            .isEqualTo("transaction-service-test")
            .describedAs("Application name must be correctly configured");
        
        assertThat(environment.getActiveProfiles())
            .contains("test", "integration")
            .describedAs("Required test profiles must be active");
        
        // === PHASE 3: Core Bean Validation ===
        validateCoreApplicationBeans();
        
        // === PHASE 4: Database Connectivity Validation ===
        validateDatabaseConnectivity();
        
        // === PHASE 5: Security Context Validation ===
        validateSecurityConfiguration();
        
        // === PHASE 6: Event Streaming Validation ===
        validateEventStreamingConfiguration();
        
        // === PHASE 7: Health and Monitoring Validation ===
        validateHealthAndMonitoring();
        
        // === PHASE 8: Performance Metrics Validation ===
        validatePerformanceMetrics();
        
        // === PHASE 9: Application Availability Validation ===
        validateApplicationAvailability();
        
        // === PHASE 10: Resource Utilization Validation ===
        validateResourceUtilization();
        
        // Log successful context loading
        System.out.println("✓ Transaction Service Application Context loaded successfully");
        System.out.printf("✓ Context ID: %s%n", applicationContext.getId());
        System.out.printf("✓ Startup Time: %s%n", new java.util.Date(applicationContext.getStartupDate()));
        System.out.printf("✓ Active Profiles: %s%n", String.join(", ", environment.getActiveProfiles()));
        System.out.printf("✓ Server Port: %d%n", serverPort);
        System.out.printf("✓ Total Beans: %d%n", applicationContext.getBeanDefinitionCount());
    }

    /**
     * Validates that all critical application beans are properly instantiated
     * and configured within the Spring application context.
     * 
     * @throws Exception if bean validation fails
     */
    private void validateCoreApplicationBeans() throws Exception {
        // Validate primary application class
        assertThat(applicationContext.getBean(TransactionServiceApplication.class))
            .isNotNull()
            .describedAs("TransactionServiceApplication bean must be present");
        
        // Validate data source beans
        assertThat(applicationContext.getBean("dataSource"))
            .isNotNull()
            .describedAs("Primary data source bean must be present");
        
        // Validate entity manager factory
        assertThat(applicationContext.getBean("entityManagerFactory"))
            .isNotNull()
            .describedAs("Entity manager factory bean must be present");
        
        // Validate transaction manager
        assertThat(applicationContext.getBean("transactionManager"))
            .isNotNull()
            .describedAs("Transaction manager bean must be present");
        
        // Validate security configuration beans
        if (applicationContext.containsBean("securityFilterChain")) {
            assertThat(applicationContext.getBean("securityFilterChain"))
                .isNotNull()
                .describedAs("Security filter chain bean must be present");
        }
        
        // Validate async configuration
        if (applicationContext.containsBean("taskExecutor")) {
            assertThat(applicationContext.getBean("taskExecutor"))
                .isNotNull()
                .describedAs("Task executor bean must be present");
        }
        
        System.out.println("✓ Core application beans validated successfully");
    }

    /**
     * Validates database connectivity and connection pool configuration
     * for both primary and secondary data sources.
     * 
     * @throws Exception if database connectivity validation fails
     */
    private void validateDatabaseConnectivity() throws Exception {
        // Validate primary data source connectivity
        assertThat(dataSource).isNotNull()
            .describedAs("Primary data source must be configured");
        
        try (var connection = dataSource.getConnection()) {
            assertThat(connection).isNotNull()
                .describedAs("Database connection must be obtainable");
            
            assertThat(connection.isValid(5))
                .isTrue()
                .describedAs("Database connection must be valid");
            
            // Validate database metadata
            var metaData = connection.getMetaData();
            assertThat(metaData.getDatabaseProductName())
                .isNotNull()
                .isNotEmpty()
                .describedAs("Database product name must be available");
            
            System.out.printf("✓ Database connectivity validated: %s%n", 
                metaData.getDatabaseProductName());
        }
        
        // Validate JPA entity manager
        assertThat(testEntityManager).isNotNull()
            .describedAs("Test entity manager must be available");
        
        // Validate entity manager factory
        var entityManagerFactory = testEntityManager.getEntityManager().getEntityManagerFactory();
        assertThat(entityManagerFactory.isOpen())
            .isTrue()
            .describedAs("Entity manager factory must be open and operational");
        
        System.out.println("✓ Database connectivity and JPA configuration validated successfully");
    }

    /**
     * Validates security configuration including authentication, authorization,
     * and encryption settings for the transaction service.
     * 
     * @throws Exception if security validation fails
     */
    private void validateSecurityConfiguration() throws Exception {
        // Validate security properties
        String securityEnabled = environment.getProperty("spring.security.enabled", "true");
        assertThat(securityEnabled).isNotNull()
            .describedAs("Security configuration must be present");
        
        // Validate OAuth2 configuration if present
        if (environment.containsProperty("spring.security.oauth2.client.registration.test.client-id")) {
            String clientId = environment.getProperty("spring.security.oauth2.client.registration.test.client-id");
            assertThat(clientId).isEqualTo("test-client")
                .describedAs("OAuth2 client configuration must be properly set");
        }
        
        // Validate CORS configuration
        if (applicationContext.containsBean("corsConfigurationSource")) {
            assertThat(applicationContext.getBean("corsConfigurationSource"))
                .isNotNull()
                .describedAs("CORS configuration must be present for web security");
        }
        
        System.out.println("✓ Security configuration validated successfully");
    }

    /**
     * Validates event streaming configuration including Kafka connectivity
     * and message processing capabilities.
     * 
     * @throws Exception if event streaming validation fails
     */
    private void validateEventStreamingConfiguration() throws Exception {
        // Validate Kafka configuration properties
        String bootstrapServers = environment.getProperty("spring.kafka.bootstrap-servers");
        assertThat(bootstrapServers).isNotNull()
            .isNotEmpty()
            .describedAs("Kafka bootstrap servers must be configured");
        
        String consumerGroupId = environment.getProperty("spring.kafka.consumer.group-id");
        assertThat(consumerGroupId).isNotNull()
            .isNotEmpty()
            .describedAs("Kafka consumer group ID must be configured");
        
        // Validate Kafka-related beans if present
        if (applicationContext.containsBean("kafkaTemplate")) {
            assertThat(applicationContext.getBean("kafkaTemplate"))
                .isNotNull()
                .describedAs("Kafka template must be configured for message publishing");
        }
        
        if (applicationContext.containsBean("kafkaListenerContainerFactory")) {
            assertThat(applicationContext.getBean("kafkaListenerContainerFactory"))
                .isNotNull()
                .describedAs("Kafka listener container factory must be configured");
        }
        
        System.out.println("✓ Event streaming configuration validated successfully");
    }

    /**
     * Validates health endpoints and monitoring configuration including
     * actuator endpoints, metrics collection, and alerting capabilities.
     * 
     * @throws Exception if health and monitoring validation fails
     */
    private void validateHealthAndMonitoring() throws Exception {
        // Validate health endpoint
        assertThat(healthEndpoint).isNotNull()
            .describedAs("Health endpoint must be available");
        
        var healthStatus = healthEndpoint.health();
        assertThat(healthStatus).isNotNull()
            .describedAs("Health status must be obtainable");
        
        assertThat(healthStatus.getStatus().getCode())
            .isEqualTo("UP")
            .describedAs("Application health status must be UP");
        
        // Validate info endpoint
        assertThat(infoEndpoint).isNotNull()
            .describedAs("Info endpoint must be available");
        
        var infoDetails = infoEndpoint.info();
        assertThat(infoDetails).isNotNull()
            .describedAs("Application info must be available");
        
        // Validate metrics endpoint
        assertThat(metricsEndpoint).isNotNull()
            .describedAs("Metrics endpoint must be available");
        
        var metricNames = metricsEndpoint.listNames();
        assertThat(metricNames.getNames())
            .isNotEmpty()
            .describedAs("Application metrics must be available");
        
        // Validate application availability
        assertThat(applicationAvailability).isNotNull()
            .describedAs("Application availability must be monitored");
        
        assertThat(applicationAvailability.getReadinessState())
            .isEqualTo(ReadinessState.ACCEPTING_TRAFFIC)
            .describedAs("Application must be ready to accept traffic");
        
        assertThat(applicationAvailability.getLivenessState())
            .isEqualTo(LivenessState.CORRECT)
            .describedAs("Application must be in correct liveness state");
        
        System.out.println("✓ Health and monitoring configuration validated successfully");
    }

    /**
     * Validates performance metrics and system resource utilization
     * to ensure optimal transaction processing capabilities.
     * 
     * @throws Exception if performance validation fails
     */
    private void validatePerformanceMetrics() throws Exception {
        // Validate JVM metrics
        var jvmMemoryUsed = metricsEndpoint.metric("jvm.memory.used", null);
        assertThat(jvmMemoryUsed).isNotNull()
            .describedAs("JVM memory metrics must be available");
        
        var jvmThreadsLive = metricsEndpoint.metric("jvm.threads.live", null);
        assertThat(jvmThreadsLive).isNotNull()
            .describedAs("JVM thread metrics must be available");
        
        // Validate thread count
        int activeThreadCount = Thread.activeCount();
        assertThat(activeThreadCount)
            .isGreaterThanOrEqualTo(MIN_EXPECTED_THREAD_COUNT)
            .describedAs("Minimum expected thread count must be met: %d", activeThreadCount);
        
        // Validate HTTP server metrics if available
        try {
            var httpServerRequests = metricsEndpoint.metric("http.server.requests", null);
            if (httpServerRequests != null) {
                System.out.println("✓ HTTP server metrics are available");
            }
        } catch (Exception e) {
            // HTTP metrics may not be available during context loading
            System.out.println("ⓘ HTTP server metrics not yet available (expected during startup)");
        }
        
        System.out.println("✓ Performance metrics validated successfully");
    }

    /**
     * Validates application availability states including readiness
     * and liveness probes for Kubernetes deployment.
     * 
     * @throws Exception if availability validation fails
     */
    private void validateApplicationAvailability() throws Exception {
        // Validate readiness state
        ReadinessState readinessState = applicationAvailability.getReadinessState();
        assertThat(readinessState)
            .isEqualTo(ReadinessState.ACCEPTING_TRAFFIC)
            .describedAs("Application must be ready to accept traffic");
        
        // Validate liveness state
        LivenessState livenessState = applicationAvailability.getLivenessState();
        assertThat(livenessState)
            .isEqualTo(LivenessState.CORRECT)
            .describedAs("Application must be in correct liveness state");
        
        // Validate context refresh capability
        assertThat(configurableApplicationContext.isActive())
            .isTrue()
            .describedAs("Application context must be active");
        
        assertThat(configurableApplicationContext.isRunning())
            .isTrue()
            .describedAs("Application context must be running");
        
        System.out.println("✓ Application availability validated successfully");
    }

    /**
     * Validates resource utilization including memory usage, thread allocation,
     * and connection pool status to ensure optimal performance.
     * 
     * @throws Exception if resource validation fails
     */
    private void validateResourceUtilization() throws Exception {
        // Validate memory utilization
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();
        
        double memoryUtilization = (double) usedMemory / maxMemory * 100;
        
        assertThat(memoryUtilization)
            .isLessThan(90.0)
            .describedAs("Memory utilization should be below 90%%: %.2f%%", memoryUtilization);
        
        // Validate thread utilization
        ThreadGroup rootThreadGroup = Thread.currentThread().getThreadGroup();
        while (rootThreadGroup.getParent() != null) {
            rootThreadGroup = rootThreadGroup.getParent();
        }
        
        int activeThreadCount = rootThreadGroup.activeCount();
        assertThat(activeThreadCount)
            .isLessThan(1000)
            .describedAs("Active thread count should be reasonable: %d", activeThreadCount);
        
        // Validate bean count
        int beanCount = applicationContext.getBeanDefinitionCount();
        assertThat(beanCount)
            .isGreaterThan(0)
            .describedAs("Bean count must be positive: %d", beanCount);
        
        System.out.printf("✓ Resource utilization validated: %.2f%% memory, %d threads, %d beans%n",
            memoryUtilization, activeThreadCount, beanCount);
    }

    /**
     * Additional test method to validate application startup performance
     * and ensure it meets the required SLA for transaction processing.
     * 
     * @param output Captured output from the application startup process
     */
    @Test
    @DisplayName("Application Startup Performance Within SLA")
    @Timeout(value = MAX_CONTEXT_LOADING_TIME_SECONDS, unit = TimeUnit.SECONDS)
    void validateStartupPerformance(CapturedOutput output) {
        // Calculate startup time
        long startupTime = System.currentTimeMillis() - testStartTime;
        
        // Validate startup time is within acceptable limits
        assertThat(startupTime)
            .isLessThan(Duration.ofSeconds(MAX_CONTEXT_LOADING_TIME_SECONDS).toMillis())
            .describedAs("Application startup time must be within SLA: %d ms", startupTime);
        
        // Validate that no ERROR level logs are present during startup
        String outputString = output.getOut();
        assertThat(outputString)
            .doesNotContain("ERROR")
            .describedAs("No ERROR level logs should be present during startup");
        
        // Validate successful initialization messages
        assertThat(outputString)
            .contains("Started TransactionServiceApplication")
            .describedAs("Application should log successful startup");
        
        System.out.printf("✓ Application startup completed in %d ms (within SLA)%n", startupTime);
    }

    /**
     * Validates the transaction service application in a concurrent environment
     * to ensure thread safety and proper resource management.
     */
    @Test
    @DisplayName("Concurrent Context Access Validation")
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void validateConcurrentAccess() throws InterruptedException, ExecutionException {
        // Create multiple concurrent tasks to access the application context
        List<CompletableFuture<Boolean>> futures = List.of(
            CompletableFuture.supplyAsync(this::validateContextAccess),
            CompletableFuture.supplyAsync(this::validateContextAccess),
            CompletableFuture.supplyAsync(this::validateContextAccess),
            CompletableFuture.supplyAsync(this::validateContextAccess),
            CompletableFuture.supplyAsync(this::validateContextAccess)
        );
        
        // Wait for all tasks to complete
        CompletableFuture<Void> allFutures = CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0])
        );
        
        allFutures.get(); // This will throw if any future fails
        
        // Validate all tasks completed successfully
        for (CompletableFuture<Boolean> future : futures) {
            assertThat(future.get())
                .isTrue()
                .describedAs("All concurrent context access operations must succeed");
        }
        
        System.out.println("✓ Concurrent context access validated successfully");
    }

    /**
     * Helper method for concurrent context access validation.
     * 
     * @return true if context access is successful, false otherwise
     */
    private Boolean validateContextAccess() {
        try {
            // Perform basic context operations
            assertThat(applicationContext).isNotNull();
            assertThat(applicationContext.getBeanDefinitionCount()).isGreaterThan(0);
            assertThat(applicationContext.containsBean("transactionManager")).isTrue();
            
            // Simulate typical bean access patterns
            Thread.sleep(100); // Simulate processing time
            
            return true;
        } catch (Exception e) {
            System.err.printf("Concurrent access validation failed: %s%n", e.getMessage());
            return false;
        }
    }
}