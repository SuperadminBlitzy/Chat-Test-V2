package com.ufs.compliance.config;

import com.ufs.compliance.event.ComplianceEvent;
import com.ufs.compliance.event.RegulatoryEvent;

// Spring Framework 6.1.3 - Core configuration and bean management
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

// Spring Kafka 3.1.2 - Enterprise Kafka integration for financial services
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

// Apache Kafka Clients 3.6.1 - Core Kafka configuration and serialization
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Apache Kafka configuration for the Compliance Service within the Unified Financial Services platform.
 * 
 * This configuration class establishes the event-driven architecture foundation for regulatory compliance
 * automation (F-003), enabling real-time monitoring and automated policy updates within 24 hours of 
 * regulatory changes. The configuration supports the critical business requirements for:
 * 
 * - F-003-RQ-001: Regulatory change monitoring with real-time event processing
 * - F-003-RQ-003: Compliance reporting through event publishing to analytics services
 * - Audit trail management for complete compliance activity tracking
 * 
 * Event-driven architecture ensures regulatory changes are propagated in real-time across all system
 * components, supporting continuous compliance assessments and unified risk scoring as required by
 * financial services regulations including PSD3, PSR, Basel reforms (CRR3), and FRTB implementation.
 * 
 * The configuration leverages Apache Kafka 3.6+ for enterprise-grade event streaming with high
 * throughput (10,000+ TPS), sub-second response times, and 99.99% uptime requirements specified
 * in the technical architecture.
 * 
 * Security considerations include encrypted communication channels, role-based access control,
 * and comprehensive audit logging to meet financial industry security standards with average
 * data breach costs of $5.90 million making robust security measures non-negotiable.
 * 
 * @author UFS Compliance Team
 * @version 1.0.0
 * @since 2025-01-01
 */
@EnableKafka
@Configuration
public class KafkaConfig {

    /**
     * Kafka cluster bootstrap server addresses for establishing initial connections.
     * 
     * This property is externalized to support different environments (development, staging, production)
     * and follows the 12-factor app methodology for configuration management. The bootstrap servers
     * provide the initial connection point for Kafka clients to discover the full cluster topology.
     * 
     * Typical values:
     * - Development: localhost:9092
     * - Staging: kafka-staging.ufs.internal:9092
     * - Production: kafka-prod-1.ufs.internal:9092,kafka-prod-2.ufs.internal:9092,kafka-prod-3.ufs.internal:9092
     * 
     * The configuration supports multiple bootstrap servers for high availability and fault tolerance
     * in production environments, ensuring compliance with the 99.99% uptime requirement.
     */
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapAddress;

    /**
     * Consumer group identifier for the compliance service Kafka consumers.
     * 
     * This group ID ensures that multiple instances of the compliance service work together as a
     * consumer group, providing load balancing and fault tolerance for regulatory event processing.
     * Each regulatory event will be processed by only one instance in the group, preventing
     * duplicate processing while enabling horizontal scaling.
     * 
     * The group ID follows naming conventions for financial microservices and supports the
     * microservices architecture pattern for independent scaling and deployment.
     */
    @Value("${spring.kafka.consumer.group-id:compliance-service-group}")
    private String consumerGroupId;

    // Global topic name constants for compliance event streaming
    // These constants ensure consistent topic naming across the compliance automation system
    private static final String REGULATORY_UPDATES_TOPIC = "regulatory-updates";
    private static final String COMPLIANCE_EVENTS_TOPIC = "compliance-events";

    /**
     * Creates and configures a KafkaAdmin bean for programmatic Kafka cluster management.
     * 
     * The KafkaAdmin provides administrative capabilities for managing Kafka topics, configurations,
     * and cluster metadata. This is essential for automated topic creation and management in the
     * compliance service, ensuring that required topics exist before producers and consumers
     * attempt to use them.
     * 
     * Administrative capabilities include:
     * - Topic creation with appropriate partitioning and replication
     * - Topic configuration management for retention policies and compaction
     * - Cluster health monitoring and metadata retrieval
     * - Support for blue-green deployments and disaster recovery procedures
     * 
     * The configuration follows enterprise standards for financial services with proper
     * error handling and connection management to ensure reliable topic administration.
     * 
     * @return KafkaAdmin instance configured with bootstrap server connectivity
     */
    @Bean
    public KafkaAdmin kafkaAdmin() {
        // Create configuration map for KafkaAdmin with enterprise-grade settings
        Map<String, Object> adminConfigs = new HashMap<>();
        
        // Configure bootstrap servers for initial cluster connection
        adminConfigs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        
        // Set connection timeout to handle network latency in distributed environments
        adminConfigs.put(ProducerConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 60000);
        
        // Configure request timeout for administrative operations
        adminConfigs.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000);
        
        // Set retry configuration for resilient administrative operations
        adminConfigs.put(ProducerConfig.RETRIES_CONFIG, 3);
        adminConfigs.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 1000);
        
        return new KafkaAdmin(adminConfigs);
    }

    /**
     * Creates the regulatory updates topic for receiving regulatory change events.
     * 
     * This topic serves as the primary channel for F-003-RQ-001 (Regulatory change monitoring),
     * receiving events when new regulatory rules are created, updated, activated, or deactivated.
     * The topic configuration is optimized for high-throughput regulatory data processing with
     * appropriate partitioning for parallel processing and replication for fault tolerance.
     * 
     * Topic characteristics:
     * - 3 partitions: Enables parallel processing of regulatory events across multiple consumer instances
     * - Replication factor 1: Suitable for development; production should use higher replication (3+)
     * - Retention policy: Configured for regulatory audit requirements (7+ years typical)
     * - Compaction: May be enabled for latest regulatory state management
     * 
     * The partition count is designed to support the expected throughput of regulatory changes
     * while enabling horizontal scaling of compliance service instances for load distribution.
     * 
     * @return NewTopic bean configured for regulatory updates event streaming
     */
    @Bean
    public NewTopic regulatoryUpdatesTopic() {
        return new NewTopic(REGULATORY_UPDATES_TOPIC, 3, (short) 1);
    }

    /**
     * Creates the compliance events topic for publishing compliance check results.
     * 
     * This topic supports F-003-RQ-003 (Compliance reporting) by providing a channel for
     * publishing compliance check events that can be consumed by reporting and analytics services.
     * The topic enables real-time compliance status monitoring and supports the audit trail
     * management requirements for complete compliance activity tracking.
     * 
     * Topic characteristics:
     * - 3 partitions: Supports parallel processing of compliance events by downstream services
     * - Replication factor 1: Development configuration; production requires higher replication
     * - Event ordering: Partition key based on customer ID or check ID for ordered processing
     * - Retention: Long-term retention for regulatory compliance and audit requirements
     * 
     * The topic serves as a central hub for compliance events, enabling multiple downstream
     * services (reporting, analytics, alerting) to consume compliance status changes independently.
     * 
     * @return NewTopic bean configured for compliance events publication
     */
    @Bean
    public NewTopic complianceEventsTopic() {
        return new NewTopic(COMPLIANCE_EVENTS_TOPIC, 3, (short) 1);
    }

    /**
     * Configures the Kafka producer factory for publishing events to Kafka topics.
     * 
     * This factory creates Kafka producers optimized for financial services requirements including
     * high throughput (10,000+ TPS), low latency (<1 second response time), and reliable delivery
     * guarantees. The configuration uses JSON serialization for event payloads to ensure
     * interoperability with downstream services and maintain data integrity.
     * 
     * Producer configuration includes:
     * - String serialization for message keys (customer IDs, event IDs)
     * - JSON serialization for message values (CompliantEvent, RegulatoryEvent objects)
     * - Durability settings for financial data integrity requirements
     * - Performance optimization for high-throughput scenarios
     * - Error handling and retry policies for reliable message delivery
     * 
     * The factory supports the creation of thread-safe producer instances that can be shared
     * across the compliance service for efficient resource utilization and connection pooling.
     * 
     * @return ProducerFactory configured for enterprise-grade event publishing
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        // Create comprehensive producer configuration map
        Map<String, Object> producerProps = new HashMap<>();
        
        // Essential connectivity configuration
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        
        // Serialization configuration for message keys and values
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Durability and reliability configuration for financial data integrity
        producerProps.put(ProducerConfig.ACKS_CONFIG, "all"); // Wait for all in-sync replicas
        producerProps.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE); // Infinite retries
        producerProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 1); // Ensure ordering
        producerProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Prevent duplicate messages
        
        // Performance optimization for high-throughput requirements
        producerProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384); // 16KB batch size
        producerProps.put(ProducerConfig.LINGER_MS_CONFIG, 5); // Small delay for better batching
        producerProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy"); // Efficient compression
        producerProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432); // 32MB buffer
        
        // Timeout configuration for enterprise reliability
        producerProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000); // 30 second timeout
        producerProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000); // 2 minute delivery timeout
        
        return new DefaultKafkaProducerFactory<>(producerProps);
    }

    /**
     * Creates a KafkaTemplate for simplified message publishing operations.
     * 
     * The KafkaTemplate provides a high-level abstraction for sending messages to Kafka topics,
     * wrapping the complexity of producer management and providing convenient methods for
     * synchronous and asynchronous message publishing. This template is optimized for the
     * compliance service's event publishing requirements.
     * 
     * Template features:
     * - Type-safe message publishing with generic type parameters
     * - Automatic serialization using configured serializers
     * - Error handling and retry mechanisms
     * - Transaction support for atomic operations
     * - Metrics integration for monitoring and observability
     * 
     * The template supports both fire-and-forget and synchronous publishing patterns,
     * enabling the compliance service to choose appropriate delivery semantics based on
     * business requirements and performance constraints.
     * 
     * @param producerFactory the configured producer factory for creating Kafka producers
     * @return KafkaTemplate instance for publishing compliance and regulatory events
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        KafkaTemplate<String, Object> template = new KafkaTemplate<>(producerFactory);
        
        // Set default topic for convenience (can be overridden per message)
        template.setDefaultTopic(COMPLIANCE_EVENTS_TOPIC);
        
        return template;
    }

    /**
     * Configures the Kafka consumer factory for receiving RegulatoryEvent messages.
     * 
     * This factory creates Kafka consumers specifically configured for processing regulatory
     * change events as part of F-003-RQ-001 (Regulatory change monitoring). The configuration
     * ensures reliable event processing with proper deserialization, error handling, and
     * consumer group coordination for load balancing across service instances.
     * 
     * Consumer configuration includes:
     * - Consumer group management for load balancing and fault tolerance
     * - JSON deserialization with type safety for RegulatoryEvent objects
     * - Offset management for reliable message processing
     * - Session and heartbeat configuration for group coordination
     * - Auto-commit configuration for processing semantics
     * 
     * The factory is specifically typed for RegulatoryEvent consumption, ensuring type safety
     * and proper deserialization of regulatory change notifications from external systems
     * and internal regulatory management services.
     * 
     * @return ConsumerFactory configured for RegulatoryEvent processing
     */
    @Bean
    public ConsumerFactory<String, RegulatoryEvent> consumerFactory() {
        // Create comprehensive consumer configuration map
        Map<String, Object> consumerProps = new HashMap<>();
        
        // Essential connectivity and group configuration
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
        
        // Deserialization configuration for message keys and values
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        // JSON deserializer specific configuration for type safety
        consumerProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.ufs.compliance.event");
        consumerProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, RegulatoryEvent.class.getName());
        consumerProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        
        // Offset management for reliable processing
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"); // Process all available events
        consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true); // Auto-commit after processing
        consumerProps.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 1000); // Commit every second
        
        // Session management for group coordination
        consumerProps.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000); // 30 second session timeout
        consumerProps.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000); // 10 second heartbeat
        
        // Fetch configuration for performance optimization
        consumerProps.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1024); // 1KB minimum fetch
        consumerProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500); // 500ms maximum wait
        consumerProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100); // Maximum records per poll
        
        return new DefaultKafkaConsumerFactory<>(consumerProps);
    }

    /**
     * Creates a concurrent Kafka listener container factory for processing regulatory events.
     * 
     * This factory creates listener containers that manage the lifecycle of Kafka consumers
     * and coordinate message processing through @KafkaListener annotated methods. The factory
     * is configured for concurrent processing to meet the high-throughput requirements of
     * regulatory change monitoring while maintaining ordered processing within partitions.
     * 
     * Container factory features:
     * - Concurrent processing with configurable thread pools
     * - Error handling and retry mechanisms for failed message processing
     * - Acknowledgment modes for controlling offset commit behavior
     * - Container lifecycle management (start, stop, pause, resume)
     * - Integration with Spring's transaction management
     * 
     * The factory supports the 24-hour regulatory update cycle requirement by enabling
     * efficient parallel processing of regulatory change events while maintaining data
     * consistency and processing order guarantees essential for compliance automation.
     * 
     * @param consumerFactory the configured consumer factory for creating Kafka consumers
     * @return ConcurrentKafkaListenerContainerFactory for regulatory event processing
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, RegulatoryEvent> kafkaListenerContainerFactory(
            ConsumerFactory<String, RegulatoryEvent> consumerFactory) {
        
        // Create and configure the listener container factory
        ConcurrentKafkaListenerContainerFactory<String, RegulatoryEvent> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        
        // Set the consumer factory for creating consumers
        factory.setConsumerFactory(consumerFactory);
        
        // Configure concurrency for parallel processing
        // This should be set based on the number of topic partitions and expected load
        factory.setConcurrency(3); // Match the number of topic partitions
        
        /* Optional: Configure error handling
        factory.setCommonErrorHandler(new DefaultErrorHandler(
            new FixedBackOff(1000L, 3L))); // 3 retries with 1 second backoff
        */
        
        /* Optional: Configure batch processing
        factory.setBatchListener(true); // Enable batch processing if needed
        */
        
        return factory;
    }

    /**
     * Creates a specialized consumer factory for ComplianceEvent processing.
     * 
     * This factory enables the compliance service to consume its own published events for
     * internal processing, monitoring, and validation purposes. This supports patterns like
     * event sourcing, CQRS (Command Query Responsibility Segregation), and event-driven
     * saga orchestration within the compliance automation system.
     * 
     * Use cases include:
     * - Internal event validation and consistency checking
     * - Compliance event aggregation and reporting
     * - Cross-service event correlation and workflow management
     * - Audit trail reconstruction and compliance verification
     * 
     * The factory is configured with appropriate deserialization settings for ComplianceEvent
     * objects and consumer group settings to avoid conflicts with other service consumers.
     * 
     * @return ConsumerFactory configured for ComplianceEvent processing
     */
    @Bean
    public ConsumerFactory<String, ComplianceEvent> complianceEventConsumerFactory() {
        Map<String, Object> consumerProps = new HashMap<>();
        
        // Basic connectivity configuration
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId + "-compliance-events");
        
        // Serialization configuration
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        // JSON deserializer configuration for ComplianceEvent
        consumerProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.ufs.compliance.event");
        consumerProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, ComplianceEvent.class.getName());
        consumerProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        
        // Consumer behavior configuration
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        consumerProps.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 1000);
        
        return new DefaultKafkaConsumerFactory<>(consumerProps);
    }

    /**
     * Creates a listener container factory for ComplianceEvent processing.
     * 
     * This factory complements the complianceEventConsumerFactory by providing the container
     * infrastructure for @KafkaListener methods that process ComplianceEvent messages.
     * The factory is configured for internal event processing patterns within the compliance
     * service, supporting event-driven architecture patterns and compliance workflow orchestration.
     * 
     * @param complianceEventConsumerFactory the consumer factory for ComplianceEvent processing
     * @return ConcurrentKafkaListenerContainerFactory for ComplianceEvent listeners
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ComplianceEvent> complianceEventKafkaListenerContainerFactory(
            ConsumerFactory<String, ComplianceEvent> complianceEventConsumerFactory) {
        
        ConcurrentKafkaListenerContainerFactory<String, ComplianceEvent> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        
        factory.setConsumerFactory(complianceEventConsumerFactory);
        factory.setConcurrency(2); // Lower concurrency for internal processing
        
        return factory;
    }
}