// dotenv@16.3.1 - Load environment variables from .env file
import { config } from 'dotenv';

// Initialize dotenv to load environment variables from .env file into process.env
config();

/**
 * Kafka Configuration Object
 * 
 * This configuration object centralizes all Kafka-related settings for the notification service.
 * It follows the event-driven architecture pattern as specified in the technical documentation,
 * supporting real-time event consumption and notification delivery.
 * 
 * The configuration uses environment variables with sensible fallbacks to ensure
 * the service can operate in various deployment environments (development, staging, production).
 * 
 * Key Features:
 * - Environment-aware configuration with fallbacks
 * - SSL/TLS support for secure communication
 * - SASL authentication for access control
 * - Configurable timeouts and retry policies
 * - Production-ready defaults aligned with enterprise requirements
 * 
 * Kafka Version: 3.6+ (as per technical specification)
 * Protocol Support: SASL/PLAINTEXT, SASL/SSL, SSL
 */
const kafkaConfig = {
    /**
     * Client identifier for this Kafka consumer/producer instance
     * Used for logging, monitoring, and debugging purposes
     * Default: 'notification-service'
     */
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',

    /**
     * List of Kafka broker addresses
     * Supports comma-separated list of brokers for high availability
     * Format: 'host1:port1,host2:port2,host3:port3'
     * Default: Single broker for local development
     */
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['kafka:9092'],

    /**
     * Enable SSL/TLS encryption for secure communication
     * Required for production environments handling financial data
     * Default: false (for local development)
     */
    ssl: process.env.KAFKA_SSL === 'true',

    /**
     * SASL (Simple Authentication and Security Layer) configuration
     * Provides authentication mechanism for secure Kafka access
     * Supports PLAIN, SCRAM-SHA-256, SCRAM-SHA-512, and other mechanisms
     */
    sasl: {
        /**
         * SASL authentication mechanism
         * Common values: 'plain', 'scram-sha-256', 'scram-sha-512'
         * Default: 'plain' for basic authentication
         */
        mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',

        /**
         * Username for SASL authentication
         * Required when SASL is enabled
         * Should be provided via environment variables for security
         */
        username: process.env.KAFKA_SASL_USERNAME,

        /**
         * Password for SASL authentication
         * Required when SASL is enabled
         * Should be provided via environment variables for security
         */
        password: process.env.KAFKA_SASL_PASSWORD
    },

    /**
     * Maximum time to wait for initial connection to Kafka cluster
     * Value in milliseconds
     * Default: 3000ms (3 seconds) - balance between quick startup and network reliability
     */
    connectionTimeout: process.env.KAFKA_CONNECTION_TIMEOUT 
        ? parseInt(process.env.KAFKA_CONNECTION_TIMEOUT, 10) 
        : 3000,

    /**
     * Maximum time to wait for a request to complete
     * Value in milliseconds
     * Default: 30000ms (30 seconds) - suitable for financial transaction processing
     */
    requestTimeout: process.env.KAFKA_REQUEST_TIMEOUT 
        ? parseInt(process.env.KAFKA_REQUEST_TIMEOUT, 10) 
        : 30000,

    /**
     * Retry configuration for failed operations
     * Critical for ensuring message delivery in financial services
     */
    retry: {
        /**
         * Maximum number of retry attempts for failed operations
         * Default: 5 retries - provides good balance between reliability and performance
         */
        retries: process.env.KAFKA_RETRIES 
            ? parseInt(process.env.KAFKA_RETRIES, 10) 
            : 5
    }
};

/**
 * Export the Kafka configuration object for use throughout the notification service
 * 
 * This configuration enables:
 * - Real-time event consumption from various microservices
 * - Notification delivery triggers based on business events
 * - Integration with the event-driven architecture
 * - Scalable message processing for high-volume financial operations
 * 
 * Usage:
 * import { kafkaConfig } from './config';
 * const kafka = new KafkaJS(kafkaConfig);
 */
export { kafkaConfig };