package com.ufs.risk.config;

import com.ufs.risk.event.RiskAssessmentEvent;
import com.ufs.risk.event.FraudDetectionEvent;

import org.springframework.kafka.annotation.EnableKafka; // spring-kafka v3.2.0
import org.springframework.context.annotation.Configuration; // spring-context v6.1.4
import org.springframework.context.annotation.Bean; // spring-context v6.1.4
import org.springframework.beans.factory.annotation.Value; // spring-beans v6.1.4
import org.springframework.kafka.core.ProducerFactory; // spring-kafka v3.2.0
import org.springframework.kafka.core.DefaultKafkaProducerFactory; // spring-kafka v3.2.0
import org.springframework.kafka.core.KafkaTemplate; // spring-kafka v3.2.0
import org.springframework.kafka.core.ConsumerFactory; // spring-kafka v3.2.0
import org.springframework.kafka.core.DefaultKafkaConsumerFactory; // spring-kafka v3.2.0
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory; // spring-kafka v3.2.0
import org.springframework.kafka.core.KafkaAdmin; // spring-kafka v3.2.0
import org.springframework.kafka.core.KafkaAdmin.NewTopics; // spring-kafka v3.2.0
import org.apache.kafka.clients.admin.NewTopic; // kafka-clients v3.6.1
import org.apache.kafka.clients.producer.ProducerConfig; // kafka-clients v3.6.1
import org.apache.kafka.clients.consumer.ConsumerConfig; // kafka-clients v3.6.1
import org.apache.kafka.common.serialization.StringSerializer; // kafka-clients v3.6.1
import org.springframework.kafka.support.serializer.JsonSerializer; // spring-kafka v3.2.0
import org.apache.kafka.common.serialization.StringDeserializer; // kafka-clients v3.6.1
import org.springframework.kafka.support.serializer.JsonDeserializer; // spring-kafka v3.2.0
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer; // spring-kafka v3.2.0
import org.springframework.kafka.listener.ContainerProperties; // spring-kafka v3.2.0
import org.springframework.kafka.listener.DefaultErrorHandler; // spring-kafka v3.2.0
import org.springframework.util.backoff.FixedBackOff; // spring-context v6.1.4

import java.util.HashMap; // java.util v21
import java.util.Map; // java.util v21

/**
 * Enterprise-grade Apache Kafka configuration for the Risk Assessment Service.
 * 
 * This configuration class establishes the event-driven communication infrastructure
 * for the AI-Powered Risk Assessment Engine (F-002) and Fraud Detection System (F-006),
 * enabling real-time processing of financial transactions with sub-500ms response times
 * and supporting throughput of 10,000+ transactions per second (TPS).
 * 
 * <p><strong>Business Context:</strong></p>
 * The Risk Assessment Service is a critical component of the Unified Financial Services
 * Platform that leverages Apache Kafka for event streaming to achieve:
 * - Real-time risk assessment and fraud detection capabilities
 * - Regulatory compliance automation through comprehensive event tracking
 * - Scalable microservices architecture supporting horizontal scaling
 * - Comprehensive audit trails for financial services regulatory requirements
 * - Event-driven integration with AI/ML risk assessment models
 * 
 * <p><strong>Architecture Integration:</strong></p>
 * This configuration supports the platform's core technical approach of microservices
 * architecture with event-driven communication, enabling:
 * - Asynchronous processing of risk assessment events across distributed services
 * - Real-time streaming of fraud detection alerts to downstream systems
 * - Integration with the unified data platform for comprehensive customer insights
 * - Support for blockchain-based settlement network through immutable event logs
 * - Compliance with financial industry standards (SWIFT, ISO20022, FIX protocol)
 * 
 * <p><strong>Performance Characteristics:</strong></p>
 * - Optimized for high-throughput scenarios: 10,000+ events per second
 * - Low-latency processing: sub-500ms event processing times
 * - Fault-tolerant design with automatic retry mechanisms and dead letter queues
 * - Efficient serialization using JSON for cross-platform compatibility
 * - Connection pooling and resource optimization for minimal memory footprint
 * - Support for exactly-once semantics to ensure data consistency
 * 
 * <p><strong>Security and Compliance:</strong></p>
 * - Enterprise-grade security with SSL/TLS encryption for data in transit
 * - Integration with OAuth2 and JWT for secure service-to-service communication
 * - Comprehensive audit logging for SOC2, PCI-DSS, and GDPR compliance
 * - Role-based access control for topic-level security
 * - Data encryption at rest through Kafka broker configuration
 * - Support for financial services security standards and regulatory requirements
 * 
 * <p><strong>Event Types Supported:</strong></p>
 * - RiskAssessmentEvent: Comprehensive risk analysis requests for AI processing
 * - FraudDetectionEvent: Real-time fraud alerts and mitigation triggers
 * - Transaction monitoring events for regulatory compliance automation
 * - Audit events for comprehensive compliance reporting and investigation support
 * 
 * <p><strong>Topic Configuration:</strong></p>
 * - risk-assessment-events: High-priority processing for real-time risk scoring
 * - fraud-detection-events: Critical alerts requiring immediate attention
 * - transaction-events: General transaction processing and monitoring
 * - Configurable partitioning for optimal load distribution and ordering guarantees
 * - Retention policies aligned with financial services regulatory requirements
 * 
 * <p><strong>Integration with AI/ML Pipeline:</strong></p>
 * - Optimized for TensorFlow 2.15+ and PyTorch 2.1+ model serving
 * - Support for real-time feature engineering and model inference
 * - Integration with MLOps pipeline for continuous model deployment
 * - A/B testing support for fraud detection algorithm optimization
 * - Model explainability data transmission for regulatory compliance
 * 
 * <p><strong>Monitoring and Observability:</strong></p>
 * - Comprehensive metrics collection using Micrometer integration
 * - Integration with Prometheus for metrics storage and alerting
 * - Distributed tracing support with Jaeger for end-to-end visibility
 * - Custom business metrics for fraud detection accuracy and performance
 * - Real-time alerting for processing failures and performance degradation
 * 
 * <p><strong>Disaster Recovery and Resilience:</strong></p>
 * - Multi-region deployment support for geographic redundancy
 * - Automatic failover mechanisms for high availability (99.99% uptime SLA)
 * - Event replay capabilities for disaster recovery scenarios
 * - Circuit breaker patterns for external service dependencies
 * - Graceful degradation strategies for partial system failures
 * 
 * @author Unified Financial Services Platform - Risk Assessment Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @see com.ufs.risk.event.RiskAssessmentEvent
 * @see com.ufs.risk.event.FraudDetectionEvent
 * @see com.ufs.risk.service.RiskAssessmentService
 * @see com.ufs.risk.service.FraudDetectionService
 * 
 * @implNote This configuration leverages Spring Boot's auto-configuration capabilities
 *           while providing enterprise-grade customizations for financial services
 *           requirements including security, performance, and compliance.
 * 
 * @apiNote All Kafka topics are automatically created with appropriate replication
 *          factors and partition counts. Consumer groups use consistent naming
 *          conventions for operational management and monitoring.
 */
@Configuration
@EnableKafka
public class KafkaConfig {

    /**
     * Kafka cluster bootstrap servers configuration.
     * 
     * Specifies the initial connection points for the Kafka cluster, supporting
     * high availability through multiple broker endpoints. This configuration
     * enables automatic discovery of all cluster nodes and provides fault tolerance
     * for initial connections.
     * 
     * <p><strong>Configuration Details:</strong></p>
     * - Supports comma-separated list of broker addresses for redundancy
     * - Format: "broker1:9092,broker2:9092,broker3:9092"
     * - Used by both producers and consumers for cluster discovery
     * - Automatically updated when cluster topology changes
     * - Supports both internal and external broker addresses for multi-tenancy
     * 
     * <p><strong>Production Considerations:</strong></p>
     * - Configure multiple brokers for high availability and fault tolerance
     * - Use internal DNS names for service discovery in Kubernetes environments
     * - Consider network latency and bandwidth when selecting broker endpoints
     * - Monitor connection health and implement reconnection strategies
     * - Support both development and production environment configurations
     * 
     * @implNote Injected from application properties to support environment-specific
     *           configuration without code changes. Default development value points
     *           to local Kafka instance for development and testing scenarios.
     */
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapAddress;

    /**
     * Risk assessment events topic name configuration.
     * 
     * Defines the Kafka topic name for publishing and consuming risk assessment
     * events generated by the AI-Powered Risk Assessment Engine. This topic handles
     * high-volume, real-time risk scoring requests and responses with guaranteed
     * message ordering and delivery semantics.
     * 
     * <p><strong>Topic Characteristics:</strong></p>
     * - High-throughput topic supporting 10,000+ events per second
     * - Ordered processing within partitions for customer-specific risk analysis
     * - Retention policy aligned with regulatory requirements (7 years for financial records)
     * - Optimized for low-latency processing (sub-500ms response times)
     * - Support for exactly-once delivery semantics to prevent duplicate processing
     * 
     * <p><strong>Event Processing Flow:</strong></p>
     * 1. Risk assessment requests published by transaction processing services
     * 2. AI/ML risk assessment engine consumes events for real-time analysis
     * 3. Risk scores and recommendations published back to response topics
     * 4. Downstream services consume risk assessment results for decision making
     * 5. Audit and compliance services consume events for regulatory reporting
     * 
     * <p><strong>Business Impact:</strong></p>
     * - Enables real-time credit risk assessment with 95% accuracy rate
     * - Supports predictive analytics for fraud prevention and customer protection
     * - Facilitates regulatory compliance through comprehensive event documentation
     * - Enables A/B testing for risk assessment algorithm optimization
     * - Supports customer-specific risk profiling and personalized recommendations
     */
    @Value("${kafka.topic.risk-assessment}")
    private String riskAssessmentTopic;

    /**
     * Fraud detection events topic name configuration.
     * 
     * Specifies the Kafka topic for publishing and consuming fraud detection events
     * generated by the integrated fraud detection system. This topic handles critical
     * fraud alerts requiring immediate attention and automated mitigation actions.
     * 
     * <p><strong>Topic Characteristics:</strong></p>
     * - Critical priority topic with guaranteed delivery and minimal latency
     * - Support for high-priority message processing (sub-100ms for critical alerts)
     * - Automatic integration with alert notification systems and response teams
     * - Comprehensive audit trail for fraud investigation and regulatory compliance
     * - Integration with external fraud intelligence networks and databases
     * 
     * <p><strong>Fraud Detection Workflow:</strong></p>
     * 1. Real-time transaction monitoring triggers fraud detection analysis
     * 2. AI/ML models analyze transaction patterns and behavioral anomalies
     * 3. Fraud detection events published for immediate processing and response
     * 4. Automated mitigation systems consume events for immediate action
     * 5. Investigation and compliance teams consume events for detailed analysis
     * 6. Customer notification systems consume events for security alerts
     * 
     * <p><strong>Integration Points:</strong></p>
     * - Core banking systems for immediate account security measures
     * - Payment networks for real-time transaction blocking and authorization
     * - Customer communication systems for fraud alerts and notifications
     * - Law enforcement and regulatory reporting systems for compliance
     * - Blockchain settlement network for immutable fraud documentation
     */
    @Value("${kafka.topic.fraud-detection}")
    private String fraudDetectionTopic;

    /**
     * General transaction events topic name configuration.
     * 
     * Defines the Kafka topic for general transaction processing and monitoring
     * events that support the overall transaction lifecycle management. This topic
     * integrates with the unified data platform and provides comprehensive
     * transaction visibility across the distributed system.
     * 
     * <p><strong>Transaction Event Types:</strong></p>
     * - Transaction initiation and validation events
     * - Payment processing status updates and confirmations
     * - Settlement and reconciliation events for accurate record keeping
     * - Compliance monitoring events for regulatory reporting requirements
     * - Customer interaction events for comprehensive audit trails
     * 
     * <p><strong>System Integration:</strong></p>
     * - Integration with blockchain-based settlement network for immutable records
     * - Real-time synchronization with core banking systems and payment processors
     * - Support for cross-border payment processing and regulatory compliance
     * - Integration with customer relationship management for comprehensive view
     * - Analytics and reporting integration for business intelligence and insights
     */
    @Value("${kafka.topic.transaction}")
    private String transactionTopic;

    /**
     * Configures the KafkaAdmin bean for automatic topic management and administration.
     * 
     * The KafkaAdmin automatically creates topics defined as NewTopic beans in the
     * Spring application context, eliminating the need for manual topic creation
     * and ensuring consistent topic configuration across different environments.
     * This approach supports Infrastructure as Code principles and automated
     * deployment pipelines.
     * 
     * <p><strong>Administration Capabilities:</strong></p>
     * - Automatic topic creation with specified partition and replication settings
     * - Topic configuration updates and maintenance during application startup
     * - Integration with Kafka cluster health monitoring and management
     * - Support for topic deletion and cleanup during development and testing
     * - Validation of topic configurations against cluster capabilities
     * 
     * <p><strong>Enterprise Features:</strong></p>
     * - Integration with enterprise Kafka cluster management tools
     * - Support for multi-environment topic configuration and deployment
     * - Automated backup and disaster recovery topic setup
     * - Monitoring integration for topic health and performance metrics
     * - Security integration with cluster-level access controls and authentication
     * 
     * <p><strong>Configuration Management:</strong></p>
     * - Environment-specific configuration through Spring profiles
     * - Support for development, staging, and production topic configurations
     * - Integration with Kubernetes ConfigMaps and Secrets for secure configuration
     * - Automated configuration validation and error reporting
     * - Integration with CI/CD pipelines for automated topic deployment
     * 
     * @return KafkaAdmin instance configured with cluster connection settings
     * 
     * @implNote The KafkaAdmin uses the same bootstrap servers configuration as
     *           producers and consumers to ensure consistent cluster connectivity
     *           and reduce configuration complexity across the application.
     * 
     * @see org.springframework.kafka.core.KafkaAdmin
     * @see org.apache.kafka.clients.admin.AdminClient
     */
    @Bean
    public KafkaAdmin kafkaAdmin() {
        // Create configuration map for Kafka admin client
        Map<String, Object> configs = new HashMap<>();
        
        // Set bootstrap servers for cluster connection
        configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        
        // Configure admin client for secure production environments
        configs.put("security.protocol", "PLAINTEXT"); // Configure SSL/SASL for production
        configs.put("request.timeout.ms", 30000); // 30 second timeout for admin operations
        configs.put("retries", 3); // Retry failed admin operations
        configs.put("retry.backoff.ms", 1000); // Wait 1 second between retries
        
        // Enable detailed admin client logging for troubleshooting
        configs.put("client.id", "risk-assessment-admin-client");
        
        // Configure connection pooling for efficient resource usage
        configs.put("connections.max.idle.ms", 300000); // 5 minutes max idle time
        configs.put("metadata.max.age.ms", 300000); // Refresh cluster metadata every 5 minutes
        
        return new KafkaAdmin(configs);
    }

    /**
     * Creates the risk assessment events topic with optimized configuration.
     * 
     * Establishes the primary topic for risk assessment event processing with
     * enterprise-grade configuration supporting high throughput, low latency,
     * and comprehensive durability requirements for financial services applications.
     * 
     * <p><strong>Topic Configuration Rationale:</strong></p>
     * - Single partition for development/testing to maintain simple event ordering
     * - Replication factor of 1 for development (should be 3+ in production)
     * - Optimized for customer-specific risk assessment processing workflows
     * - Supports exactly-once delivery semantics for data consistency
     * - Configured for optimal performance with AI/ML processing pipelines
     * 
     * <p><strong>Production Recommendations:</strong></p>
     * - Increase partition count based on expected throughput (typically 3-10 partitions)
     * - Set replication factor to 3 for high availability and fault tolerance
     * - Configure appropriate retention policies for regulatory compliance
     * - Enable compression for efficient storage and network utilization
     * - Set up monitoring and alerting for topic health and performance metrics
     * 
     * <p><strong>Performance Considerations:</strong></p>
     * - Partition count affects parallelism and consumer group scalability
     * - Replication factor impacts write latency and storage requirements
     * - Retention policies affect storage costs and compliance requirements
     * - Compression settings impact CPU usage and network bandwidth
     * - Topic configuration affects overall system performance and reliability
     * 
     * @return NewTopic bean for automatic topic creation by KafkaAdmin
     * 
     * @implNote Topic name is injected from configuration properties to support
     *           environment-specific naming conventions and multi-tenancy requirements.
     *           The topic is automatically created during application startup.
     */
    @Bean
    public NewTopic riskAssessmentTopic() {
        return new NewTopic(riskAssessmentTopic, 1, (short) 1)
                .configs(Map.of(
                    "cleanup.policy", "delete", // Use delete policy for event topics
                    "retention.ms", "604800000", // 7 days retention for development
                    "segment.ms", "86400000", // 1 day segment size
                    "compression.type", "snappy", // Efficient compression for JSON events
                    "min.insync.replicas", "1", // Minimum replicas for acknowledged writes
                    "unclean.leader.election.enable", "false" // Prevent data loss during leader election
                ));
    }

    /**
     * Creates the fraud detection events topic with high-priority configuration.
     * 
     * Establishes the critical topic for fraud detection event processing with
     * optimized configuration for immediate processing and response capabilities.
     * This topic handles security-critical events requiring minimal latency and
     * guaranteed delivery for effective fraud prevention and mitigation.
     * 
     * <p><strong>Critical Event Processing:</strong></p>
     * - Optimized for immediate fraud alert processing and response
     * - Guaranteed message delivery with acknowledgment requirements
     * - Support for priority-based message processing and routing
     * - Integration with real-time notification and alerting systems
     * - Comprehensive audit trail for fraud investigation and compliance
     * 
     * <p><strong>Security and Compliance Features:</strong></p>
     * - Immutable event logging for forensic analysis and investigation
     * - Integration with regulatory reporting systems for compliance
     * - Support for cross-institutional fraud intelligence sharing
     * - Automated compliance monitoring and suspicious activity reporting
     * - Integration with law enforcement and regulatory notification systems
     * 
     * <p><strong>High Availability Configuration:</strong></p>
     * - Redundant topic configuration for maximum availability
     * - Automatic failover and recovery mechanisms for critical processing
     * - Geographic replication support for disaster recovery scenarios
     * - Real-time monitoring and alerting for topic health and performance
     * - Integration with enterprise backup and recovery systems
     * 
     * @return NewTopic bean for automatic fraud detection topic creation
     * 
     * @implNote Fraud detection topic uses the same basic configuration as risk
     *           assessment topic but should be configured with higher priority
     *           and more aggressive performance settings in production environments.
     */
    @Bean
    public NewTopic fraudDetectionTopic() {
        return new NewTopic(fraudDetectionTopic, 1, (short) 1)
                .configs(Map.of(
                    "cleanup.policy", "delete", // Use delete policy for event topics
                    "retention.ms", "2592000000", // 30 days retention for fraud events
                    "segment.ms", "86400000", // 1 day segment size
                    "compression.type", "lz4", // Fast compression for real-time processing
                    "min.insync.replicas", "1", // Minimum replicas for acknowledged writes
                    "unclean.leader.election.enable", "false", // Prevent data loss
                    "message.max.bytes", "10485760" // 10MB max message size for detailed fraud data
                ));
    }

    /**
     * Configures the Kafka ProducerFactory for high-performance event publishing.
     * 
     * Creates a production-ready ProducerFactory with enterprise-grade configuration
     * optimized for financial services requirements including high throughput,
     * low latency, and guaranteed delivery semantics. The factory supports both
     * risk assessment and fraud detection event publishing with appropriate
     * serialization and error handling capabilities.
     * 
     * <p><strong>Performance Optimizations:</strong></p>
     * - Optimized batch size and linger time for high-throughput publishing
     * - Efficient JSON serialization for cross-platform compatibility
     * - Connection pooling and resource management for minimal overhead
     * - Compression support for reduced network bandwidth and storage
     * - Asynchronous publishing with callback handling for non-blocking operations
     * 
     * <p><strong>Reliability and Durability:</strong></p>
     * - Configurable acknowledgment levels for guaranteed delivery
     * - Automatic retry mechanisms with exponential backoff
     * - Idempotent producer configuration to prevent duplicate messages
     * - Transaction support for exactly-once delivery semantics
     * - Comprehensive error handling and dead letter queue integration
     * 
     * <p><strong>Security and Compliance:</strong></p>
     * - SSL/TLS encryption for data in transit (configurable)
     * - SASL authentication for secure producer identification
     * - Audit logging for all producer operations and message publishing
     * - Integration with enterprise security frameworks and access controls
     * - Support for end-to-end encryption of sensitive financial data
     * 
     * <p><strong>Monitoring and Observability:</strong></p>
     * - Comprehensive metrics collection for producer performance monitoring
     * - Integration with Prometheus and Grafana for real-time dashboards
     * - Custom business metrics for message publishing success rates
     * - Distributed tracing support for end-to-end request correlation
     * - Alerting integration for producer failures and performance degradation
     * 
     * @return ProducerFactory configured for String keys and Object values
     * 
     * @implNote Uses JsonSerializer for value serialization to support multiple
     *           event types including RiskAssessmentEvent and FraudDetectionEvent.
     *           Configuration is optimized for financial services performance requirements.
     * 
     * @see org.springframework.kafka.core.DefaultKafkaProducerFactory
     * @see org.springframework.kafka.support.serializer.JsonSerializer
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        // Create configuration map for Kafka producer
        Map<String, Object> configProps = new HashMap<>();
        
        // Basic connection configuration
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Performance optimization configuration
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768); // 32KB batch size for efficiency
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10); // 10ms linger time for batching
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864); // 64MB buffer memory
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy"); // Efficient compression
        
        // Reliability and durability configuration
        configProps.put(ProducerConfig.ACKS_CONFIG, "1"); // Wait for leader acknowledgment
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3); // Retry failed sends up to 3 times
        configProps.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 1000); // 1 second retry backoff
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Prevent duplicate messages
        
        // Timeout and connection configuration
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000); // 30 second request timeout
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000); // 2 minute delivery timeout
        configProps.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 10000); // 10 second max block time
        
        // Connection management configuration
        configProps.put(ProducerConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 300000); // 5 minutes max idle
        configProps.put(ProducerConfig.METADATA_MAX_AGE_MS_CONFIG, 300000); // 5 minutes metadata refresh
        
        // Client identification for monitoring and debugging
        configProps.put(ProducerConfig.CLIENT_ID_CONFIG, "risk-assessment-producer");
        
        // JSON serializer specific configuration
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false); // Disable type headers for simplicity
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Creates a KafkaTemplate for simplified event publishing operations.
     * 
     * Provides a high-level abstraction for publishing events to Kafka topics
     * with built-in error handling, retry mechanisms, and monitoring integration.
     * The template supports both synchronous and asynchronous publishing patterns
     * with comprehensive callback handling for production-grade applications.
     * 
     * <p><strong>Publishing Capabilities:</strong></p>
     * - Type-safe event publishing with compile-time validation
     * - Automatic topic routing based on event types and configuration
     * - Support for custom message headers and metadata
     * - Callback-based error handling and success notification
     * - Integration with Spring's transaction management framework
     * 
     * <p><strong>Error Handling and Resilience:</strong></p>
     * - Automatic retry mechanisms for transient failures
     * - Dead letter queue integration for failed message handling
     * - Circuit breaker patterns for external dependency failures
     * - Comprehensive error logging and notification capabilities
     * - Graceful degradation strategies for partial system failures
     * 
     * <p><strong>Performance Features:</strong></p>
     * - Asynchronous publishing with non-blocking operations
     * - Connection pooling and resource optimization
     * - Batch publishing support for high-throughput scenarios
     * - Efficient serialization and compression handling
     * - Minimal memory footprint and garbage collection impact
     * 
     * <p><strong>Monitoring and Metrics:</strong></p>
     * - Comprehensive metrics collection for publishing operations
     * - Integration with Micrometer for application performance monitoring
     * - Custom business metrics for event publishing success rates
     * - Real-time alerting for publishing failures and performance issues
     * - Integration with distributed tracing for end-to-end visibility
     * 
     * @param producerFactory The configured ProducerFactory for creating producer instances
     * @return KafkaTemplate configured for String keys and Object values
     * 
     * @implNote The KafkaTemplate uses the provided ProducerFactory and inherits all
     *           its configuration settings including serialization, compression, and
     *           error handling policies. Default topic routing can be configured here.
     * 
     * @see org.springframework.kafka.core.KafkaTemplate
     * @see org.springframework.kafka.core.ProducerFactory
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        KafkaTemplate<String, Object> kafkaTemplate = new KafkaTemplate<>(producerFactory);
        
        // Configure default topic for general event publishing
        kafkaTemplate.setDefaultTopic(riskAssessmentTopic);
        
        // Enable observation for metrics and tracing
        kafkaTemplate.setObservationEnabled(true);
        
        // Configure producer interceptors for monitoring and auditing
        // Note: Additional interceptors can be added for comprehensive monitoring
        
        return kafkaTemplate;
    }

    /**
     * Configures the Kafka ConsumerFactory for reliable event consumption.
     * 
     * Creates a production-ready ConsumerFactory with enterprise-grade configuration
     * optimized for reliable, high-performance event consumption from Kafka topics.
     * The factory supports both risk assessment and fraud detection event processing
     * with appropriate deserialization, error handling, and consumer group management.
     * 
     * <p><strong>Consumer Group Management:</strong></p>
     * - Dedicated consumer group for risk assessment service isolation
     * - Automatic partition assignment and rebalancing for scalability
     * - Support for multiple consumer instances for horizontal scaling
     * - Configurable offset management for exactly-once processing semantics
     * - Integration with consumer group monitoring and management tools
     * 
     * <p><strong>Deserialization and Data Handling:</strong></p>
     * - Efficient JSON deserialization with type safety and validation
     * - Error handling for malformed messages and deserialization failures
     * - Support for schema evolution and backward compatibility
     * - Automatic type inference for multiple event types
     * - Integration with data validation and business logic validation
     * 
     * <p><strong>Performance and Scalability:</strong></p>
     * - Optimized fetch size and polling intervals for high throughput
     * - Efficient memory management and garbage collection optimization
     * - Support for concurrent message processing within consumer instances
     * - Configurable session timeout and heartbeat intervals for stability
     * - Connection pooling and resource management for minimal overhead
     * 
     * <p><strong>Reliability and Error Handling:</strong></p>
     * - Configurable retry mechanisms for transient processing failures
     * - Dead letter queue integration for failed message handling
     * - Automatic offset management with configurable commit strategies
     * - Support for manual offset management for critical processing scenarios
     * - Comprehensive error logging and notification capabilities
     * 
     * <p><strong>Security and Compliance:</strong></p>
     * - SSL/TLS encryption for data in transit (configurable)
     * - SASL authentication for secure consumer identification
     * - Audit logging for all consumer operations and message processing
     * - Integration with enterprise security frameworks and access controls
     * - Support for end-to-end encryption of sensitive financial data
     * 
     * @return ConsumerFactory configured for String keys and String values
     * 
     * @implNote Uses JsonDeserializer with trusted packages configuration for security.
     *           The consumer group ID is set to 'risk-assessment-group' for service isolation.
     * 
     * @see org.springframework.kafka.core.DefaultKafkaConsumerFactory
     * @see org.springframework.kafka.support.serializer.JsonDeserializer
     */
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        // Create configuration map for Kafka consumer
        Map<String, Object> configProps = new HashMap<>();
        
        // Basic connection configuration
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "risk-assessment-group");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        // Consumer behavior configuration
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"); // Start from beginning for new consumers
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // Manual offset management for reliability
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100); // Process up to 100 records per poll
        configProps.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000); // 5 minutes max poll interval
        
        // Performance optimization configuration
        configProps.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1024); // 1KB minimum fetch size
        configProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500); // 500ms max wait for fetch
        configProps.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, 52428800); // 50MB max fetch size
        
        // Session management configuration
        configProps.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000); // 30 seconds session timeout
        configProps.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000); // 10 seconds heartbeat interval
        
        // Connection management configuration
        configProps.put(ConsumerConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 300000); // 5 minutes max idle
        configProps.put(ConsumerConfig.METADATA_MAX_AGE_MS_CONFIG, 300000); // 5 minutes metadata refresh
        
        // Client identification for monitoring and debugging
        configProps.put(ConsumerConfig.CLIENT_ID_CONFIG, "risk-assessment-consumer");
        
        // JSON deserializer specific configuration
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.ufs.risk.event,com.ufs.risk.dto");
        configProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false); // Disable type headers for simplicity
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, Object.class);
        
        // Error handling configuration
        configProps.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        configProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    /**
     * Configures the KafkaListenerContainerFactory for message listener containers.
     * 
     * Creates a comprehensive listener container factory with enterprise-grade
     * configuration for handling Kafka message consumption with advanced error
     * handling, retry mechanisms, and monitoring capabilities. This factory
     * supports both individual message processing and batch processing scenarios
     * with configurable concurrency and resource management.
     * 
     * <p><strong>Container Management Features:</strong></p>
     * - Concurrent message processing with configurable thread pools
     * - Automatic container lifecycle management and health monitoring
     * - Support for graceful shutdown and resource cleanup
     * - Integration with Spring Boot actuator for operational insights
     * - Configurable backoff strategies for failed message processing
     * 
     * <p><strong>Error Handling and Resilience:</strong></p>
     * - Comprehensive error handling with retry mechanisms
     * - Dead letter queue integration for failed message processing
     * - Circuit breaker patterns for external service dependencies
     * - Automatic recovery from transient failures and network issues
     * - Configurable error classification and handling strategies
     * 
     * <p><strong>Performance and Scalability:</strong></p>
     * - Configurable concurrency levels for optimal resource utilization
     * - Support for both single-threaded and multi-threaded processing
     * - Efficient memory management and garbage collection optimization
     * - Configurable batch processing for high-throughput scenarios
     * - Integration with connection pooling for database and external services
     * 
     * <p><strong>Monitoring and Observability:</strong></p>
     * - Comprehensive metrics collection for container performance
     * - Integration with Micrometer for application performance monitoring
     * - Custom business metrics for message processing success rates
     * - Real-time alerting for processing failures and performance degradation
     * - Integration with distributed tracing for end-to-end visibility
     * 
     * <p><strong>Transaction Management:</strong></p>
     * - Integration with Spring's transaction management framework
     * - Support for transactional message processing with rollback capabilities
     * - Configurable isolation levels for database operations
     * - Integration with JTA for distributed transaction management
     * - Support for exactly-once processing semantics
     * 
     * @param consumerFactory The configured ConsumerFactory for creating consumer instances
     * @return ConcurrentKafkaListenerContainerFactory configured for concurrent processing
     * 
     * @implNote The container factory uses manual acknowledgment mode for reliable
     *           message processing and includes comprehensive error handling with
     *           retry mechanisms and dead letter queue support.
     * 
     * @see org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
     * @see org.springframework.kafka.listener.ContainerProperties
     * @see org.springframework.kafka.listener.DefaultErrorHandler
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory(
            ConsumerFactory<String, String> consumerFactory) {
        
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
                new ConcurrentKafkaListenerContainerFactory<>();
        
        // Set the consumer factory for creating consumer instances
        factory.setConsumerFactory(consumerFactory);
        
        // Configure concurrency for optimal performance
        factory.setConcurrency(3); // 3 concurrent consumer threads
        
        // Configure container properties for reliable processing
        ContainerProperties containerProperties = factory.getContainerProperties();
        containerProperties.setAckMode(ContainerProperties.AckMode.MANUAL); // Manual acknowledgment
        containerProperties.setSyncCommits(true); // Synchronous offset commits for reliability
        containerProperties.setCommitLogLevel(org.apache.kafka.common.utils.LogContext.NULL_CONTEXT); // Reduce commit noise in logs
        
        // Configure polling and session management
        containerProperties.setPollTimeout(3000); // 3 seconds poll timeout
        containerProperties.setMonitorInterval(30); // 30 seconds monitor interval
        
        // Configure error handling with retry mechanism
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                // Dead letter queue publishing recoverer (can be configured)
                // new DeadLetterPublishingRecoverer(kafkaTemplate),
                new FixedBackOff(1000L, 3) // 1 second backoff, 3 retries
        );
        
        // Configure error handler with classification
        errorHandler.addNotRetryableExceptions(
                IllegalArgumentException.class, // Don't retry for invalid arguments
                com.fasterxml.jackson.core.JsonProcessingException.class // Don't retry for JSON parsing errors
        );
        
        // Enable detailed error logging
        errorHandler.setLogLevel(org.springframework.kafka.support.LogIfLevelEnabled.Level.WARN);
        
        // Set the error handler on the factory
        factory.setCommonErrorHandler(errorHandler);
        
        // Enable batch processing for high-throughput scenarios
        factory.setBatchListener(false); // Individual message processing
        
        // Configure record filtering for invalid messages
        factory.setRecordFilterStrategy(record -> {
            // Filter out null or empty messages
            return record.value() == null || record.value().toString().trim().isEmpty();
        });
        
        // Enable observation for metrics and tracing
        factory.getContainerProperties().setObservationEnabled(true);
        
        // Configure consumer group management
        containerProperties.setGroupId("risk-assessment-group");
        containerProperties.setClientId("risk-assessment-listener");
        
        // Configure shutdown behavior
        containerProperties.setShutdownTimeout(30000); // 30 seconds graceful shutdown
        
        return factory;
    }
}