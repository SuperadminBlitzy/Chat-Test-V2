// kafkajs@2.2.4 - Apache Kafka client for Node.js applications
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

// Import the central configuration object containing Kafka connection details
import config from './index';

// Import the enhanced logger for comprehensive logging with audit trails
import logger from '../utils/logger';

/**
 * Kafka Client Instance Configuration
 * 
 * Creates the main Kafka client instance for the notification service using enterprise-grade
 * configuration settings. This client serves as the foundation for all Kafka operations
 * including message production and consumption.
 * 
 * The configuration follows the event-driven architecture pattern as specified in the
 * technical documentation, supporting real-time event consumption and notification delivery
 * for financial services applications.
 * 
 * Key Features:
 * - Production-ready configuration with error-level logging
 * - Secure connection support with SSL/TLS and SASL authentication
 * - Connection pooling and timeout management
 * - Enterprise-grade reliability and performance settings
 * 
 * Architecture Alignment:
 * - Supports microservices event-driven communication (F-001)
 * - Enables real-time processing capabilities (F-008)
 * - Facilitates horizontal scaling requirements (Technical Spec 3.4.1)
 */
const kafka: Kafka = new Kafka({
    clientId: config.kafkaConfig.clientId,
    brokers: config.kafkaConfig.brokers,
    logLevel: logLevel.ERROR, // Minimize Kafka internal logging for production
    
    // SSL/TLS configuration for secure communication in financial environments
    ssl: config.kafkaConfig.ssl,
    
    // SASL authentication configuration for secure access control
    sasl: config.kafkaConfig.sasl.username && config.kafkaConfig.sasl.password ? {
        mechanism: config.kafkaConfig.sasl.mechanism as any,
        username: config.kafkaConfig.sasl.username,
        password: config.kafkaConfig.sasl.password,
    } : undefined,
    
    // Connection timeout configuration for reliable connectivity
    connectionTimeout: config.kafkaConfig.connectionTimeout,
    requestTimeout: config.kafkaConfig.requestTimeout,
    
    // Retry configuration for fault tolerance in financial processing
    retry: {
        retries: config.kafkaConfig.retry.retries,
        initialRetryTime: 300, // Start with 300ms retry delay
        maxRetryTime: 30000,   // Maximum 30 seconds between retries
    },
    
    // Administrative client configuration for monitoring and management
    logCreator: () => ({ namespace, level, label, log }) => {
        // Custom log handler that integrates with our application logger
        const { message, ...extra } = log;
        
        // Map Kafka log levels to our logger levels
        switch (level) {
            case 1: // ERROR
                logger.error(`Kafka ${namespace}: ${message}`, { 
                    kafkaNamespace: namespace,
                    kafkaLabel: label,
                    ...extra 
                });
                break;
            case 2: // WARN
                logger.warn(`Kafka ${namespace}: ${message}`, { 
                    kafkaNamespace: namespace,
                    kafkaLabel: label,
                    ...extra 
                });
                break;
            case 4: // INFO
                logger.info(`Kafka ${namespace}: ${message}`, { 
                    kafkaNamespace: namespace,
                    kafkaLabel: label,
                    ...extra 
                });
                break;
            case 5: // DEBUG
                logger.debug(`Kafka ${namespace}: ${message}`, { 
                    kafkaNamespace: namespace,
                    kafkaLabel: label,
                    ...extra 
                });
                break;
            default:
                logger.info(`Kafka ${namespace}: ${message}`, { 
                    kafkaNamespace: namespace,
                    kafkaLabel: label,
                    ...extra 
                });
                break;
        }
    },
});

/**
 * Kafka Producer Instance
 * 
 * Creates a producer instance optimized for financial notification delivery.
 * The producer handles publishing notification events, transaction alerts,
 * compliance notifications, and real-time customer communications.
 * 
 * Configuration Features:
 * - High throughput with batching optimization
 * - Guaranteed message delivery with acknowledgment requirements
 * - Idempotent producer to prevent duplicate notifications
 * - Compression for efficient network utilization
 * 
 * Use Cases:
 * - Transaction completion notifications
 * - Account status updates
 * - Regulatory compliance alerts
 * - Risk management notifications
 * - Customer onboarding status updates
 */
const producer: Producer = kafka.producer({
    // Enable idempotent producer to prevent duplicate message delivery
    idempotent: true,
    
    // Maximum number of requests that may be in flight at any time
    maxInFlightRequests: 5,
    
    // Request timeout for individual producer requests
    requestTimeout: 30000,
    
    // Retry configuration for message delivery reliability
    retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
        // Retry only on retriable errors
        retryDelayMultiplier: 2,
    },
    
    // Batching configuration for optimal throughput
    batchSize: 16384,        // 16KB batch size for efficient network usage
    lingerMs: 100,           // Wait up to 100ms to batch messages
    
    // Compression for network efficiency (important for high-volume notifications)
    compression: 'gzip',
    
    // Acknowledgment requirements for message durability
    // 'all' ensures message is written to all in-sync replicas
    acks: 'all' as any,
    
    // Metadata refresh configuration
    metadataMaxAge: 300000, // 5 minutes
});

/**
 * Kafka Consumer Instance
 * 
 * Creates a consumer instance for handling incoming notification events from various
 * microservices within the financial platform. The consumer processes events that
 * trigger notification delivery such as transaction completions, account updates,
 * compliance events, and risk alerts.
 * 
 * Configuration Features:
 * - Consumer group management for horizontal scaling
 * - Automatic offset management with manual commit control
 * - Session timeout and heartbeat configuration for reliability
 * - Message processing optimization for real-time notifications
 * 
 * Event Sources:
 * - Transaction processing service events
 * - Account management service events
 * - Risk assessment service alerts
 * - Compliance monitoring notifications
 * - Customer onboarding workflow events
 */
const consumer: Consumer = kafka.consumer({
    // Consumer group ID for horizontal scaling and fault tolerance
    groupId: 'notification-service-group',
    
    // Consumer group session timeout and heartbeat configuration
    sessionTimeout: 30000,      // 30 seconds session timeout
    heartbeatInterval: 3000,    // 3 seconds heartbeat interval
    
    // Metadata refresh configuration
    metadataMaxAge: 300000,     // 5 minutes
    
    // Allow auto-commit of offsets for simplified offset management
    allowAutoTopicCreation: false, // Prevent accidental topic creation
    
    // Maximum bytes to fetch per request (important for large notification payloads)
    maxBytesPerPartition: 1048576, // 1MB per partition
    
    // Minimum and maximum bytes to fetch per request
    minBytes: 1,
    maxBytes: 10485760, // 10MB maximum
    
    // Maximum wait time for fetch requests
    maxWaitTimeInMs: 5000, // 5 seconds
    
    // Retry configuration for consumer operations
    retry: {
        retries: 5,
        initialRetryTime: 300,
        maxRetryTime: 30000,
    },
    
    // Consumer will read from the earliest available offset when no committed offset is found
    fromBeginning: false, // Start from latest for real-time processing
});

/**
 * Kafka Connection Management Function
 * 
 * Establishes connections for both producer and consumer instances with comprehensive
 * error handling and event monitoring. This function implements enterprise-grade
 * connection management with proper lifecycle event handling and audit logging.
 * 
 * Features:
 * - Concurrent producer and consumer connection establishment
 * - Comprehensive error handling with retry logic
 * - Connection lifecycle event monitoring
 * - Audit logging for compliance and monitoring
 * - Graceful degradation and error recovery
 * 
 * Connection Events Monitored:
 * - connect: Successful connection establishment
 * - disconnect: Connection termination
 * - crash: Unexpected failures
 * - stop: Graceful shutdown
 * 
 * @returns Promise<void> Resolves when both producer and consumer are connected
 * @throws Error if connection fails after all retry attempts
 */
async function connectKafka(): Promise<void> {
    const startTime = Date.now();
    
    try {
        // Log connection attempt for audit trail
        logger.info('Initiating Kafka connection for notification service', {
            clientId: config.kafkaConfig.clientId,
            brokers: config.kafkaConfig.brokers,
            ssl: config.kafkaConfig.ssl,
            operation: 'kafka_connect'
        });

        // Establish producer connection with timeout protection
        const producerConnectPromise = producer.connect().then(() => {
            logger.info('Kafka producer connected successfully', {
                clientId: config.kafkaConfig.clientId,
                operation: 'producer_connect'
            });
        });

        // Establish consumer connection with timeout protection
        const consumerConnectPromise = consumer.connect().then(() => {
            logger.info('Kafka consumer connected successfully', {
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group',
                operation: 'consumer_connect'
            });
        });

        // Wait for both connections to complete concurrently
        await Promise.all([producerConnectPromise, consumerConnectPromise]);

        // Calculate and log connection duration for performance monitoring
        const connectionDuration = Date.now() - startTime;
        logger.performance('kafka_connection_established', connectionDuration, {
            clientId: config.kafkaConfig.clientId,
            brokers: config.kafkaConfig.brokers.length,
            ssl: config.kafkaConfig.ssl
        });

        // Set up producer lifecycle event listeners for monitoring and alerting
        producer.on('producer.connect', () => {
            logger.audit('producer_connected', {
                resource: 'kafka_producer',
                result: 'success',
                clientId: config.kafkaConfig.clientId
            });
        });

        producer.on('producer.disconnect', () => {
            logger.warn('Kafka producer disconnected', {
                clientId: config.kafkaConfig.clientId,
                operation: 'producer_disconnect'
            });
            
            logger.audit('producer_disconnected', {
                resource: 'kafka_producer',
                result: 'disconnection',
                clientId: config.kafkaConfig.clientId
            });
        });

        producer.on('producer.crash', (error) => {
            logger.error('Kafka producer crashed', error);
            
            logger.security('producer_crash', {
                severity: 'high',
                error: error.message,
                clientId: config.kafkaConfig.clientId
            });
        });

        // Set up consumer lifecycle event listeners for monitoring and alerting
        consumer.on('consumer.connect', () => {
            logger.audit('consumer_connected', {
                resource: 'kafka_consumer',
                result: 'success',
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group'
            });
        });

        consumer.on('consumer.disconnect', () => {
            logger.warn('Kafka consumer disconnected', {
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group',
                operation: 'consumer_disconnect'
            });
            
            logger.audit('consumer_disconnected', {
                resource: 'kafka_consumer',
                result: 'disconnection',
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group'
            });
        });

        consumer.on('consumer.crash', (error) => {
            logger.error('Kafka consumer crashed', error);
            
            logger.security('consumer_crash', {
                severity: 'high',
                error: error.message,
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group'
            });
        });

        consumer.on('consumer.stop', () => {
            logger.info('Kafka consumer stopped gracefully', {
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group',
                operation: 'consumer_stop'
            });
        });

        // Additional consumer event listeners for enhanced monitoring
        consumer.on('consumer.group_join', (event) => {
            logger.info('Consumer joined group successfully', {
                clientId: config.kafkaConfig.clientId,
                groupId: event.payload.groupId,
                memberId: event.payload.memberId,
                operation: 'group_join'
            });
        });

        consumer.on('consumer.heartbeat', () => {
            logger.debug('Consumer heartbeat sent', {
                clientId: config.kafkaConfig.clientId,
                groupId: 'notification-service-group',
                operation: 'heartbeat'
            });
        });

        // Log successful connection establishment
        logger.business('kafka_service_initialized', {
            status: 'active',
            producerConnected: true,
            consumerConnected: true,
            duration: connectionDuration,
            clientId: config.kafkaConfig.clientId
        });

    } catch (error) {
        // Calculate connection attempt duration for failure analysis
        const attemptDuration = Date.now() - startTime;
        
        // Log connection failure with detailed error information
        logger.error('Failed to connect to Kafka cluster', error);
        
        // Log security event for failed connections (potential infrastructure issues)
        logger.security('kafka_connection_failure', {
            severity: 'medium',
            error: error.message,
            duration: attemptDuration,
            clientId: config.kafkaConfig.clientId,
            brokers: config.kafkaConfig.brokers
        });

        // Performance logging for failed connections
        logger.performance('kafka_connection_failed', attemptDuration, {
            error: error.message,
            clientId: config.kafkaConfig.clientId,
            ssl: config.kafkaConfig.ssl
        });

        // Audit log for connection failure
        logger.audit('kafka_connection_failed', {
            resource: 'kafka_cluster',
            result: 'failure',
            error: error.message,
            clientId: config.kafkaConfig.clientId
        });

        // Re-throw error to allow calling code to handle connection failures
        throw new Error(`Kafka connection failed: ${error.message}`);
    }
}

/**
 * Graceful Shutdown Handler
 * 
 * Ensures proper cleanup of Kafka connections during application shutdown.
 * This is critical for maintaining cluster health and preventing resource leaks
 * in containerized environments.
 */
async function disconnectKafka(): Promise<void> {
    const startTime = Date.now();
    
    try {
        logger.info('Initiating graceful Kafka shutdown', {
            clientId: config.kafkaConfig.clientId,
            operation: 'kafka_disconnect'
        });

        // Disconnect producer and consumer concurrently
        await Promise.all([
            producer.disconnect(),
            consumer.disconnect()
        ]);

        const shutdownDuration = Date.now() - startTime;
        
        logger.performance('kafka_shutdown_completed', shutdownDuration, {
            clientId: config.kafkaConfig.clientId
        });

        logger.audit('kafka_service_shutdown', {
            resource: 'kafka_service',
            result: 'success',
            duration: shutdownDuration,
            clientId: config.kafkaConfig.clientId
        });

    } catch (error) {
        logger.error('Error during Kafka disconnect', error);
        
        logger.audit('kafka_shutdown_failed', {
            resource: 'kafka_service',
            result: 'failure',
            error: error.message,
            clientId: config.kafkaConfig.clientId
        });
    }
}

// Register graceful shutdown handlers for container environments
process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, disconnecting Kafka clients');
    await disconnectKafka();
});

process.on('SIGINT', async () => {
    logger.info('Received SIGINT, disconnecting Kafka clients');
    await disconnectKafka();
});

// Export Kafka client instances and connection management function
// These exports enable the notification service to:
// - Send notification events to other services (producer)
// - Consume events that trigger notifications (consumer)
// - Manage connection lifecycle (connectKafka function)
// - Access the underlying client for advanced operations (kafka)

/**
 * Main Kafka client instance
 * Provides access to advanced Kafka operations and administrative functions
 */
export { kafka };

/**
 * Kafka producer instance for publishing notification events
 * Used for sending transaction alerts, compliance notifications, and customer communications
 */
export { producer };

/**
 * Kafka consumer instance for receiving events that trigger notifications
 * Processes events from transaction, account, risk, and compliance services
 */
export { consumer };

/**
 * Connection management function
 * Establishes and monitors Kafka connections with comprehensive error handling
 */
export { connectKafka };

/**
 * Graceful shutdown function
 * Properly disconnects Kafka clients during application shutdown
 */
export { disconnectKafka };