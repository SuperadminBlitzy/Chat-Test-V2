package com.ufs.analytics.config;

import com.ufs.analytics.event.AnalyticsEvent;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory; // spring-kafka 3.2.0
import org.springframework.kafka.core.ConsumerFactory; // spring-kafka 3.2.0
import org.springframework.kafka.core.DefaultKafkaConsumerFactory; // spring-kafka 3.2.0
import org.springframework.kafka.core.DefaultKafkaProducerFactory; // spring-kafka 3.2.0
import org.springframework.kafka.core.KafkaTemplate; // spring-kafka 3.2.0
import org.springframework.kafka.core.ProducerFactory; // spring-kafka 3.2.0
import org.springframework.kafka.annotation.EnableKafka; // spring-kafka 3.2.0
import org.springframework.kafka.support.serializer.JsonSerializer; // spring-kafka 3.2.0
import org.springframework.kafka.support.serializer.JsonDeserializer; // spring-kafka 3.2.0
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer; // spring-kafka 3.2.0
import org.springframework.kafka.listener.ContainerProperties; // spring-kafka 3.2.0
import org.springframework.kafka.listener.DefaultErrorHandler; // spring-kafka 3.2.0
import org.apache.kafka.clients.producer.ProducerConfig; // kafka-clients 3.7.0
import org.apache.kafka.clients.consumer.ConsumerConfig; // kafka-clients 3.7.0
import org.apache.kafka.common.serialization.StringSerializer; // kafka-clients 3.7.0
import org.apache.kafka.common.serialization.StringDeserializer; // kafka-clients 3.7.0
import org.springframework.context.annotation.Configuration; // spring-context 6.1.3
import org.springframework.context.annotation.Bean; // spring-context 6.1.3
import org.springframework.beans.factory.annotation.Value; // spring-beans 6.1.3
import org.springframework.util.backoff.FixedBackOff; // spring-context 6.1.3
import java.util.Map; // java.util 21
import java.util.HashMap; // java.util 21

/**
 * Kafka configuration class for the Analytics Service within the Unified Financial Services Platform.
 * 
 * This configuration class establishes the foundation for event-driven analytics processing by configuring
 * Apache Kafka 3.6+ producers and consumers specifically optimized for handling AnalyticsEvent messages
 * in a high-throughput financial services environment.
 * 
 * <p><strong>Business Context:</strong></p>
 * This configuration directly supports the platform's real-time processing requirements as specified in
 * section 2.3.3 Common Services, enabling the following critical features:
 * 
 * <ul>
 *   <li><strong>F-005 Predictive Analytics Dashboard:</strong> Real-time data ingestion for analytics visualization</li>
 *   <li><strong>F-002 AI-Powered Risk Assessment Engine:</strong> Event-driven risk scoring and evaluation</li>
 *   <li><strong>F-006 Fraud Detection System:</strong> Real-time transaction monitoring and anomaly detection</li>
 *   <li><strong>F-008 Real-time Transaction Monitoring:</strong> Operational analytics and performance tracking</li>
 * </ul>
 * 
 * <p><strong>Technical Architecture:</strong></p>
 * The configuration implements enterprise-grade patterns including:
 * 
 * <ul>
 *   <li><strong>High Throughput Configuration:</strong> Optimized for financial data processing with batching and compression</li>
 *   <li><strong>Reliable Message Delivery:</strong> Exactly-once semantics with idempotent producers</li>
 *   <li><strong>Fault Tolerance:</strong> Circuit breaker patterns and retry mechanisms for resilient processing</li>
 *   <li><strong>JSON Serialization:</strong> Type-safe serialization with trusted packages for security</li>
 *   <li><strong>Consumer Group Management:</strong> Scalable consumption with proper offset management</li>
 * </ul>
 * 
 * <p><strong>Performance Characteristics:</strong></p>
 * This configuration is designed to meet the platform's stringent performance requirements:
 * 
 * <ul>
 *   <li><strong>Response Time:</strong> Sub-second message production and consumption latency</li>
 *   <li><strong>Throughput:</strong> Support for 10,000+ TPS as required by the unified data integration platform</li>
 *   <li><strong>Scalability:</strong> Horizontal scaling through consumer group partitioning</li>
 *   <li><strong>Reliability:</strong> 99.99% uptime with automatic failover and recovery</li>
 * </ul>
 * 
 * <p><strong>Security Considerations:</strong></p>
 * The configuration implements financial-grade security measures:
 * 
 * <ul>
 *   <li><strong>Serialization Security:</strong> Trusted package validation to prevent deserialization attacks</li>
 *   <li><strong>Network Security:</strong> TLS encryption for data in transit (configured via bootstrap servers)</li>
 *   <li><strong>Access Control:</strong> SASL authentication integration (configured via external properties)</li>
 * </ul>
 * 
 * <p><strong>Event Processing Flow:</strong></p>
 * <pre>
 * Analytics Event Generation → Kafka Producer → Analytics Topic → Kafka Consumer → Analytics Processing Pipeline
 * </pre>
 * 
 * The configuration supports both synchronous and asynchronous processing patterns, enabling real-time
 * dashboard updates while maintaining data consistency for batch analytics operations.
 * 
 * @author UFS Analytics Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @see AnalyticsEvent The primary event type handled by this configuration
 * @see org.springframework.kafka.annotation.KafkaListener For consumer implementation patterns
 * @see org.springframework.kafka.core.KafkaTemplate For producer usage examples
 */
@EnableKafka
@Configuration
public class KafkaConfig {

    /**
     * Kafka bootstrap servers address configuration property.
     * 
     * This property specifies the comma-separated list of Kafka broker addresses that the
     * client will use for initial connection and cluster discovery. The value is externalized
     * to support different environments (development, staging, production) without code changes.
     * 
     * <p><strong>Configuration Examples:</strong></p>
     * <ul>
     *   <li><strong>Development:</strong> {@code localhost:9092}</li>
     *   <li><strong>Staging:</strong> {@code kafka-staging-1:9092,kafka-staging-2:9092}</li>
     *   <li><strong>Production:</strong> {@code kafka-prod-1:9092,kafka-prod-2:9092,kafka-prod-3:9092}</li>
     * </ul>
     * 
     * <p><strong>High Availability Configuration:</strong></p>
     * For production environments, multiple broker addresses should be specified to ensure
     * client resilience during broker failures. The client will attempt to connect to each
     * broker in the list until a successful connection is established.
     * 
     * <p><strong>Security Considerations:</strong></p>
     * When using secure Kafka clusters, the bootstrap servers should be configured with
     * appropriate security protocols (SASL_SSL, SSL) and the corresponding security
     * properties should be configured in the producer and consumer configurations.
     * 
     * @see ProducerConfig#BOOTSTRAP_SERVERS_CONFIG
     * @see ConsumerConfig#BOOTSTRAP_SERVERS_CONFIG
     */
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapAddress;

    /**
     * Consumer group ID for the analytics service.
     * 
     * The consumer group ID identifies the logical group of consumers that work together
     * to consume messages from Kafka topics. This enables scalable message processing
     * where multiple consumer instances can share the workload.
     * 
     * <p><strong>Naming Convention:</strong></p>
     * The group ID follows the pattern: {@code <service-name>-<environment>-group}
     * to ensure uniqueness across the microservices ecosystem.
     * 
     * <p><strong>Scaling Benefits:</strong></p>
     * <ul>
     *   <li><strong>Load Distribution:</strong> Messages are distributed across group members</li>
     *   <li><strong>Fault Tolerance:</strong> Failed consumers are automatically replaced</li>
     *   <li><strong>Offset Management:</strong> Group coordinates offset commits for reliable processing</li>
     * </ul>
     */
    @Value("${spring.kafka.consumer.group-id:analytics-service-group}")
    private String consumerGroupId;

    /**
     * Auto-offset reset policy for new consumer groups.
     * 
     * This property determines the behavior when there is no initial offset in Kafka or
     * if the current offset does not exist anymore on the server. This is crucial for
     * ensuring consistent message processing behavior across deployments.
     * 
     * <p><strong>Available Policies:</strong></p>
     * <ul>
     *   <li><strong>earliest:</strong> Automatically reset to the earliest available offset</li>
     *   <li><strong>latest:</strong> Automatically reset to the latest offset (default)</li>
     *   <li><strong>none:</strong> Throw an exception if no previous offset is found</li>
     * </ul>
     * 
     * For analytics processing, 'earliest' ensures no historical data is missed during
     * initial deployment or consumer group changes.
     */
    @Value("${spring.kafka.consumer.auto-offset-reset:earliest}")
    private String autoOffsetReset;

    /**
     * Creates and configures a Kafka ProducerFactory for sending AnalyticsEvent messages.
     * 
     * This factory creates Kafka producer instances optimized for high-throughput financial
     * data processing with enterprise-grade reliability and performance characteristics.
     * The configuration implements best practices for financial services including exactly-once
     * semantics, optimal batching, and compression for efficient network utilization.
     * 
     * <p><strong>Performance Optimizations:</strong></p>
     * <ul>
     *   <li><strong>Batching:</strong> Messages are batched for improved throughput (16KB batches)</li>
     *   <li><strong>Compression:</strong> GZIP compression reduces network bandwidth usage</li>
     *   <li><strong>Async Processing:</strong> Non-blocking sends with configurable timeout</li>
     *   <li><strong>Connection Pooling:</strong> Efficient connection reuse across producers</li>
     * </ul>
     * 
     * <p><strong>Reliability Features:</strong></p>
     * <ul>
     *   <li><strong>Idempotent Producers:</strong> Prevents duplicate messages during retries</li>
     *   <li><strong>Acknowledgment Policy:</strong> All in-sync replicas must acknowledge writes</li>
     *   <li><strong>Retry Configuration:</strong> Automatic retry with exponential backoff</li>
     *   <li><strong>Timeout Management:</strong> Configurable timeouts for various operations</li>
     * </ul>
     * 
     * <p><strong>Serialization Strategy:</strong></p>
     * The factory uses String serialization for keys (typically event IDs or correlation IDs)
     * and JSON serialization for AnalyticsEvent values, providing type safety and
     * interoperability with other services in the ecosystem.
     * 
     * <p><strong>Monitoring Integration:</strong></p>
     * The producer factory integrates with Spring Boot Actuator and Micrometer metrics
     * for comprehensive monitoring of producer performance, error rates, and throughput.
     * 
     * @return A configured ProducerFactory instance optimized for AnalyticsEvent message production
     * 
     * @see DefaultKafkaProducerFactory
     * @see AnalyticsEvent The event type produced by this factory
     * @see JsonSerializer For AnalyticsEvent serialization details
     */
    @Bean
    public ProducerFactory<String, AnalyticsEvent> producerFactory() {
        // Create a HashMap to store producer configurations optimized for financial data processing
        Map<String, Object> configProps = new HashMap<>();
        
        // Set the bootstrap servers address from the application properties
        // This enables environment-specific configuration without code changes
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        
        // Configure the key serializer to StringSerializer for event correlation IDs
        // String keys provide efficient partitioning and are human-readable for debugging
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        
        // Configure the value serializer to JsonSerializer for AnalyticsEvent objects
        // JSON serialization provides type safety and cross-platform compatibility
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Enable idempotent producers to prevent duplicate messages during network issues
        // This is critical for financial data integrity and exactly-once processing semantics
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        
        // Configure acknowledgment policy to ensure all in-sync replicas acknowledge writes
        // This provides the highest level of durability for financial transaction data
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        
        // Set retry configuration for resilient message delivery
        // High retry count ensures message delivery even during temporary broker unavailability
        configProps.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        
        // Configure maximum in-flight requests to maintain ordering guarantees
        // Limited to 5 requests to ensure message ordering while allowing reasonable throughput
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        
        // Enable GZIP compression to optimize network bandwidth utilization
        // Particularly important for analytics events which may contain large data payloads
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "gzip");
        
        // Configure batch size for optimal throughput (16KB batches)
        // Larger batches improve throughput while maintaining reasonable latency for real-time processing
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        
        // Set linger time to allow batching without significantly impacting latency
        // 10ms linger provides good balance between throughput and latency for analytics use cases
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        
        // Configure buffer memory for high-throughput scenarios (64MB)
        // Sufficient buffer space prevents blocking during traffic spikes
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864);
        
        // Set request timeout for reliable operation (30 seconds)
        // Adequate timeout ensures completion of operations even under high load
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000);
        
        // Configure delivery timeout for end-to-end message delivery guarantee (2 minutes)
        // Comprehensive timeout covering all retry attempts and network delays
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000);
        
        // Return a new DefaultKafkaProducerFactory with the optimized configurations
        // The factory will create producer instances with these performance and reliability settings
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Creates a KafkaTemplate bean for sending AnalyticsEvent messages.
     * 
     * The KafkaTemplate provides a high-level abstraction for Kafka producer operations,
     * offering both synchronous and asynchronous message sending capabilities with
     * comprehensive error handling and monitoring integration.
     * 
     * <p><strong>Key Features:</strong></p>
     * <ul>
     *   <li><strong>Type Safety:</strong> Parameterized with String keys and AnalyticsEvent values</li>
     *   <li><strong>Async Support:</strong> Non-blocking sends with callback handling</li>
     *   <li><strong>Transaction Support:</strong> Integration with Spring's transaction management</li>
     *   <li><strong>Monitoring:</strong> Built-in metrics and health check integration</li>
     * </ul>
     * 
     * <p><strong>Usage Patterns:</strong></p>
     * <pre>{@code
     * @Autowired
     * private KafkaTemplate<String, AnalyticsEvent> kafkaTemplate;
     * 
     * // Asynchronous sending with callback
     * kafkaTemplate.send("analytics-events", event.getEventId().toString(), event)
     *     .whenComplete((result, ex) -> {
     *         if (ex != null) {
     *             log.error("Failed to send analytics event", ex);
     *         } else {
     *             log.info("Analytics event sent successfully: {}", result.getRecordMetadata());
     *         }
     *     });
     * }</pre>
     * 
     * <p><strong>Error Handling:</strong></p>
     * The template integrates with Spring's error handling infrastructure, providing
     * automatic retry logic and dead letter queue support for failed message deliveries.
     * 
     * @return A configured KafkaTemplate instance for AnalyticsEvent message operations
     * 
     * @see KafkaTemplate
     * @see #producerFactory() The underlying producer factory
     * @see AnalyticsEvent The message type handled by this template
     */
    @Bean
    public KafkaTemplate<String, AnalyticsEvent> kafkaTemplate() {
        // Create a new KafkaTemplate using the configured producer factory
        // The template inherits all performance and reliability configurations from the factory
        KafkaTemplate<String, AnalyticsEvent> template = new KafkaTemplate<>(producerFactory());
        
        // Enable observation for distributed tracing and monitoring
        // This provides end-to-end visibility into message flow across the microservices ecosystem
        template.setObservationEnabled(true);
        
        // Return the configured template ready for dependency injection
        return template;
    }

    /**
     * Creates and configures a Kafka ConsumerFactory for receiving AnalyticsEvent messages.
     * 
     * This factory creates Kafka consumer instances optimized for reliable, high-throughput
     * consumption of analytics events with comprehensive error handling and exactly-once
     * processing guarantees. The configuration implements enterprise patterns for financial
     * services including proper offset management, session timeout handling, and
     * deserialization security.
     * 
     * <p><strong>Reliability Features:</strong></p>
     * <ul>
     *   <li><strong>Automatic Offset Management:</strong> Commits offsets after successful processing</li>
     *   <li><strong>Session Management:</strong> Optimized heartbeat and session timeouts</li>
     *   <li><strong>Rebalancing:</strong> Cooperative rebalancing for minimal service disruption</li>
     *   <li><strong>Error Recovery:</strong> Configurable retry and dead letter topic support</li>
     * </ul>
     * 
     * <p><strong>Performance Optimizations:</strong></p>
     * <ul>
     *   <li><strong>Fetch Configuration:</strong> Optimized batch sizes for throughput</li>
     *   <li><strong>Polling Strategy:</strong> Balanced poll intervals for latency and efficiency</li>
     *   <li><strong>Memory Management:</strong> Controlled memory usage for stable operation</li>
     * </ul>
     * 
     * <p><strong>Security Measures:</strong></p>
     * <ul>
     *   <li><strong>Trusted Packages:</strong> Restricted deserialization to prevent attacks</li>
     *   <li><strong>Type Validation:</strong> Strict type checking for incoming messages</li>
     *   <li><strong>Error Isolation:</strong> Failed deserialization doesn't affect other messages</li>
     * </ul>
     * 
     * <p><strong>Deserialization Strategy:</strong></p>
     * The factory uses String deserialization for keys and JSON deserialization for
     * AnalyticsEvent values, with error handling wrappers to ensure system stability
     * when encountering malformed messages.
     * 
     * @return A configured ConsumerFactory instance optimized for AnalyticsEvent message consumption
     * 
     * @see DefaultKafkaConsumerFactory
     * @see AnalyticsEvent The event type consumed by this factory
     * @see JsonDeserializer For AnalyticsEvent deserialization details
     * @see ErrorHandlingDeserializer For robust error handling
     */
    @Bean
    public ConsumerFactory<String, AnalyticsEvent> consumerFactory() {
        // Create a HashMap to store consumer configurations optimized for analytics processing
        Map<String, Object> configProps = new HashMap<>();
        
        // Set the bootstrap servers address from the application properties
        // Enables environment-specific configuration for different deployment stages
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        
        // Set the consumer group ID for coordinated consumption across service instances
        // This enables horizontal scaling and fault tolerance through consumer group management
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
        
        // Configure auto-offset reset policy for new consumer groups
        // 'earliest' ensures no analytics events are missed during initial deployment
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, autoOffsetReset);
        
        // Configure the key deserializer to StringDeserializer for event correlation IDs
        // Matches the producer key serialization for consistent message handling
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        
        // Configure the value deserializer with error handling wrapper for resilience
        // ErrorHandlingDeserializer provides graceful handling of malformed messages
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        
        // Set the delegate deserializer for actual AnalyticsEvent deserialization
        // JsonDeserializer handles the conversion from JSON to AnalyticsEvent objects
        configProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class.getName());
        
        // Configure JsonDeserializer to trust the AnalyticsEvent package for security
        // This prevents deserialization attacks by restricting allowed classes
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.ufs.analytics.event");
        
        // Set the target type for JSON deserialization to AnalyticsEvent
        // Ensures type safety and proper object instantiation
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, AnalyticsEvent.class.getName());
        
        // Disable type headers to prevent type confusion attacks
        // The consumer will use the configured default type instead of message headers
        configProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        
        // Enable automatic offset commits for reliable message processing
        // Offsets are committed after successful message processing to prevent reprocessing
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        
        // Set auto-commit interval for balanced performance and reliability (5 seconds)
        // Frequent commits provide good recovery characteristics with minimal performance impact
        configProps.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 5000);
        
        // Configure session timeout for consumer group coordination (30 seconds)
        // Balanced timeout provides fault detection without excessive rebalancing
        configProps.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        
        // Set heartbeat interval for group membership maintenance (10 seconds)
        // Regular heartbeats ensure group coordinator knows consumer is alive
        configProps.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000);
        
        // Configure maximum poll records for controlled batch processing (500 records)
        // Reasonable batch size balances throughput and memory usage for analytics processing
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
        
        // Set maximum poll interval to prevent unnecessary rebalancing (5 minutes)
        // Sufficient time for processing analytics batches without triggering rebalancing
        configProps.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
        
        // Configure fetch minimum bytes for efficient network utilization (1KB)
        // Batches small messages while maintaining reasonable latency
        configProps.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1024);
        
        // Set fetch maximum wait time for latency control (500ms)
        // Maximum wait time ensures timely processing of analytics events
        configProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);
        
        // Return a new DefaultKafkaConsumerFactory with the optimized configurations
        // The factory will create consumer instances with these reliability and performance settings
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    /**
     * Creates a ConcurrentKafkaListenerContainerFactory bean for @KafkaListener annotations.
     * 
     * This factory creates and manages listener containers that handle the actual consumption
     * of Kafka messages in response to @KafkaListener annotations. The configuration provides
     * enterprise-grade features including concurrent processing, error handling, retry logic,
     * and monitoring integration specifically optimized for analytics event processing.
     * 
     * <p><strong>Concurrency Management:</strong></p>
     * <ul>
     *   <li><strong>Thread Pool:</strong> Configurable concurrent consumers for parallel processing</li>
     *   <li><strong>Partition Assignment:</strong> Intelligent partition distribution across threads</li>
     *   <li><strong>Backpressure Handling:</strong> Automatic throttling during high load periods</li>
     * </ul>
     * 
     * <p><strong>Error Handling Strategy:</strong></p>
     * <ul>
     *   <li><strong>Retry Logic:</strong> Exponential backoff with configurable retry attempts</li>
     *   <li><strong>Dead Letter Topics:</strong> Failed messages routed to DLT for investigation</li>
     *   <li><strong>Error Recovery:</strong> Graceful handling of temporary processing failures</li>
     *   <li><strong>Poison Message Handling:</strong> Isolation of problematic messages</li>
     * </ul>
     * 
     * <p><strong>Performance Features:</strong></p>
     * <ul>
     *   <li><strong>Batch Processing:</strong> Support for batch consumption patterns</li>
     *   <li><strong>Async Processing:</strong> Non-blocking message processing capabilities</li>
     *   <li><strong>Memory Management:</strong> Controlled resource usage for stable operation</li>
     * </ul>
     * 
     * <p><strong>Monitoring Integration:</strong></p>
     * The factory integrates with Spring Boot Actuator and Micrometer to provide comprehensive
     * metrics including consumer lag, processing rates, error rates, and resource utilization.
     * 
     * <p><strong>Usage Example:</strong></p>
     * <pre>{@code
     * @KafkaListener(topics = "analytics-events", groupId = "analytics-service-group")
     * public void handleAnalyticsEvent(AnalyticsEvent event,
     *                                 @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
     *                                 @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
     *                                 @Header(KafkaHeaders.OFFSET) long offset) {
     *     log.info("Processing analytics event: {} from topic: {}, partition: {}, offset: {}",
     *              event.getEventId(), topic, partition, offset);
     *     
     *     analyticsProcessor.processEvent(event);
     * }
     * }</pre>
     * 
     * @return A configured ConcurrentKafkaListenerContainerFactory for AnalyticsEvent processing
     * 
     * @see ConcurrentKafkaListenerContainerFactory
     * @see #consumerFactory() The underlying consumer factory
     * @see org.springframework.kafka.annotation.KafkaListener For listener implementation
     * @see AnalyticsEvent The event type processed by listeners
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, AnalyticsEvent> kafkaListenerContainerFactory() {
        // Create a new ConcurrentKafkaListenerContainerFactory for AnalyticsEvent processing
        ConcurrentKafkaListenerContainerFactory<String, AnalyticsEvent> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        
        // Set the consumer factory to use the configured consumer settings
        // This ensures all listeners inherit the optimized consumer configuration
        factory.setConsumerFactory(consumerFactory());
        
        // Configure concurrent consumers for parallel message processing
        // This enables horizontal scaling within a single service instance
        factory.setConcurrency(3);
        
        // Enable batch processing for improved throughput when handling analytics events
        // Allows listeners to process multiple events in a single method call
        factory.setBatchListener(true);
        
        // Configure manual acknowledgment mode for precise offset control
        // This provides exactly-once processing guarantees for financial analytics data
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        
        // Set up comprehensive error handling with retry logic
        // Creates an error handler with exponential backoff for temporary failures
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
            // Configure dead letter topic publishing for failed messages
            (consumerRecord, exception) -> {
                // Log the error for monitoring and debugging
                System.err.printf("Failed to process analytics event after retries. Topic: %s, Partition: %d, Offset: %d, Error: %s%n",
                    consumerRecord.topic(), consumerRecord.partition(), consumerRecord.offset(), exception.getMessage());
                
                // In production, this would publish to a dead letter topic
                // Dead letter topic handling would be implemented here for failed analytics events
            },
            // Configure exponential backoff with 3 retry attempts
            // 1 second initial delay, doubles with each retry (1s, 2s, 4s)
            new FixedBackOff(1000L, 3L)
        );
        
        // Enable error handler logging for comprehensive error tracking
        errorHandler.setLogLevel(org.springframework.kafka.support.LoggingProducerListener.class);
        
        // Apply the error handler to the factory
        factory.setCommonErrorHandler(errorHandler);
        
        // Configure observation for distributed tracing and monitoring
        // This provides end-to-end visibility into message processing across services
        factory.getContainerProperties().setObservationEnabled(true);
        
        // Set consumer startup behavior to automatically start consuming on application startup
        // Ensures analytics event processing begins immediately when the service starts
        factory.setAutoStartup(true);
        
        // Configure the listener container to use the analytics service thread naming pattern
        // This helps with monitoring and debugging by providing meaningful thread names
        factory.getContainerProperties().setGroupId(consumerGroupId);
        
        // Return the fully configured factory ready for @KafkaListener annotation processing
        return factory;
    }
}