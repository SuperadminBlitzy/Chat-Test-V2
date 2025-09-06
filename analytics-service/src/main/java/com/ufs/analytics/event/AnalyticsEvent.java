package com.ufs.analytics.event;

import com.ufs.analytics.model.AnalyticsData;
import java.io.Serializable; // Java 21
import java.util.UUID; // Java 21
import java.util.Date; // Java 21
import java.util.Objects;

/**
 * Represents an analytics event to be published to a Kafka topic for asynchronous
 * communication between different microservices and the analytics service.
 * 
 * This immutable event class is a critical component of the event-driven architecture
 * that enables real-time processing of events for analytics and fraud detection.
 * It carries the data necessary for the predictive analytics dashboard (F-005) to be
 * updated in real-time and supports the overall real-time processing requirements
 * specified in section 2.3.3 Common Services.
 * 
 * The event is designed to be serialized for transmission over Apache Kafka 3.6+
 * message brokers, ensuring reliable delivery and processing across the distributed
 * microservices ecosystem. Each event contains a unique identifier, timestamp,
 * event type classification, and the actual analytics data payload.
 * 
 * Key Features:
 * - Immutable design for thread safety and data integrity
 * - Kafka-compatible serialization support
 * - Unique event identification for tracking and deduplication
 * - Precise timestamping for chronological event ordering
 * - Type-safe event classification system
 * - Rich analytics data payload with time-series capabilities
 * 
 * Usage Examples:
 * - Transaction analytics events for real-time fraud detection
 * - Customer behavior analytics for predictive modeling
 * - System performance metrics for operational monitoring
 * - Risk assessment data points for compliance reporting
 * - Financial metrics for regulatory compliance automation
 * 
 * This class supports the following system requirements:
 * - F-005: Predictive Analytics Dashboard - Real-time data updates
 * - F-002: AI-Powered Risk Assessment Engine - Event-driven risk scoring
 * - F-006: Fraud Detection System - Real-time transaction monitoring
 * - F-008: Real-time Transaction Monitoring - Operational analytics
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 */
public final class AnalyticsEvent implements Serializable {

    /**
     * Serial version UID for Java serialization compatibility.
     * This ensures that serialized instances remain compatible across different
     * versions of the class, which is crucial for Kafka message persistence
     * and cross-service communication in a distributed environment.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Unique identifier for this analytics event.
     * This UUID serves multiple purposes:
     * - Event deduplication in distributed processing systems
     * - Correlation tracking across microservices
     * - Audit trail and debugging support
     * - Idempotent event processing guarantees
     * 
     * The UUID is generated when the event is created and remains immutable
     * throughout the event's lifecycle. This identifier is essential for
     * maintaining data consistency in the event-driven architecture.
     */
    private final UUID eventId;

    /**
     * Timestamp indicating when this analytics event occurred.
     * This timestamp is crucial for:
     * - Chronological ordering of events in stream processing
     * - Time-based partitioning in Kafka topics
     * - Temporal analysis and reporting
     * - Event replay and recovery operations
     * - Compliance audit trails with precise timing
     * 
     * The timestamp should represent the business time when the event occurred,
     * not necessarily when it was created or published. This distinction is
     * important for accurate analytics and real-time processing.
     */
    private final Date eventTimestamp;

    /**
     * Classification of the analytics event type.
     * This string field categorizes the event for proper routing and processing:
     * 
     * Common event types include:
     * - "TRANSACTION_COMPLETED" - Financial transaction completion events
     * - "CUSTOMER_INTERACTION" - Customer engagement and behavior events
     * - "RISK_ASSESSMENT" - Risk scoring and evaluation events
     * - "PERFORMANCE_METRIC" - System performance and monitoring events
     * - "COMPLIANCE_CHECK" - Regulatory compliance and audit events
     * - "FRAUD_DETECTION" - Fraud analysis and alert events
     * - "CUSTOMER_ONBOARDING" - KYC/AML and onboarding process events
     * 
     * The event type determines how the analytics service processes and routes
     * the event, enabling specialized handling for different categories of data.
     * This field also supports filtering and subscription patterns in Kafka consumers.
     */
    private final String eventType;

    /**
     * The analytics data payload containing the actual metrics and information.
     * This AnalyticsData instance encapsulates:
     * - Time-series data points for InfluxDB storage
     * - Tagged dimensions for efficient querying
     * - Metric fields with actual measurement values
     * - Contextual metadata for proper categorization
     * 
     * The analytics data is structured to support various use cases:
     * - Real-time dashboard updates with live metrics
     * - Historical trend analysis and reporting
     * - Predictive modeling feature engineering
     * - Regulatory compliance data collection
     * - Performance monitoring and alerting
     * 
     * This payload is designed to be flexible enough to handle different types
     * of analytics data while maintaining consistency with the InfluxDB 2.7+
     * time-series database schema used for persistent storage.
     */
    private final AnalyticsData analyticsData;

    /**
     * Constructs a new immutable AnalyticsEvent instance.
     * 
     * This constructor performs comprehensive validation and defensive copying
     * to ensure data integrity and immutability. All parameters are required
     * and must be non-null to create a valid analytics event.
     * 
     * The constructor implementation follows enterprise-grade practices:
     * - Null parameter validation with descriptive error messages
     * - Defensive copying of mutable objects (Date, AnalyticsData)
     * - Immutable field assignment ensuring thread safety
     * - Input validation for business rule compliance
     * 
     * @param eventId The unique identifier for this event. Must not be null.
     *                This UUID will be used for event deduplication and correlation
     *                across the distributed system. Generate using UUID.randomUUID()
     *                for production events.
     * 
     * @param eventTimestamp The timestamp when this event occurred. Must not be null.
     *                       This should represent the business time of the event,
     *                       not the creation time. Use new Date() for current time
     *                       or specific Date instances for historical events.
     * 
     * @param eventType The type classification of this event. Must not be null or empty.
     *                  Should follow standard event type naming conventions and
     *                  correspond to configured Kafka topic routing rules.
     *                  Examples: "TRANSACTION_COMPLETED", "CUSTOMER_INTERACTION"
     * 
     * @param analyticsData The analytics data payload. Must not be null and should
     *                      contain valid analytics data with at least one field.
     *                      The AnalyticsData instance should be properly configured
     *                      with measurement name, tags, and field values.
     * 
     * @throws IllegalArgumentException if any parameter is null, or if eventType
     *                                  is empty/blank, or if analyticsData is invalid
     */
    public AnalyticsEvent(UUID eventId, Date eventTimestamp, String eventType, AnalyticsData analyticsData) {
        // Validate eventId parameter
        if (eventId == null) {
            throw new IllegalArgumentException("Event ID cannot be null. A valid UUID is required for event identification and correlation.");
        }

        // Validate eventTimestamp parameter
        if (eventTimestamp == null) {
            throw new IllegalArgumentException("Event timestamp cannot be null. A valid Date is required for temporal ordering and analysis.");
        }

        // Validate eventType parameter
        if (eventType == null) {
            throw new IllegalArgumentException("Event type cannot be null. A valid event type string is required for proper event classification and routing.");
        }
        if (eventType.trim().isEmpty()) {
            throw new IllegalArgumentException("Event type cannot be empty or blank. A meaningful event type classification is required.");
        }

        // Validate analyticsData parameter
        if (analyticsData == null) {
            throw new IllegalArgumentException("Analytics data cannot be null. A valid AnalyticsData instance is required for event payload.");
        }
        if (!analyticsData.isValid()) {
            throw new IllegalArgumentException("Analytics data is invalid. The AnalyticsData instance must contain valid measurement name, timestamp, and at least one field.");
        }

        // Assign the eventId to the corresponding class property
        // UUID is immutable, so direct assignment is safe
        this.eventId = eventId;

        // Assign the eventTimestamp to the corresponding class property
        // Create defensive copy of Date to ensure immutability
        this.eventTimestamp = new Date(eventTimestamp.getTime());

        // Assign the eventType to the corresponding class property
        // String is immutable, so direct assignment is safe
        this.eventType = eventType.trim();

        // Assign the analyticsData to the corresponding class property
        // Create defensive copy to ensure immutability and prevent external modification
        this.analyticsData = analyticsData.copy();
    }

    /**
     * Returns the unique identifier of the event.
     * 
     * This method provides access to the event's UUID, which serves as the
     * primary key for event identification throughout the system. The UUID
     * is immutable and guaranteed to be unique across all events in the system.
     * 
     * Common use cases for the event ID include:
     * - Event deduplication in stream processing pipelines
     * - Correlation tracking across microservice boundaries
     * - Audit logging and compliance reporting
     * - Error tracking and debugging support
     * - Idempotent event processing implementations
     * 
     * @return The unique identifier of the event as a UUID. Never returns null.
     */
    public UUID getEventId() {
        // Return the value of the eventId property
        return this.eventId;
    }

    /**
     * Returns the timestamp of when the event occurred.
     * 
     * This method provides access to the event's business timestamp, which
     * represents when the actual business event took place. The returned Date
     * is a defensive copy to maintain the immutability of the AnalyticsEvent.
     * 
     * The timestamp is used for:
     * - Chronological ordering in event stream processing
     * - Time-based partitioning and sharding strategies
     * - Temporal analysis and trend detection
     * - Event replay and recovery operations
     * - Compliance audit trails with precise timing
     * - Real-time dashboard updates and alerting
     * 
     * @return A new Date instance representing the timestamp of the event.
     *         Never returns null. The returned Date is a defensive copy and
     *         modifications to it will not affect the original event.
     */
    public Date getEventTimestamp() {
        // Return a defensive copy of the eventTimestamp property
        return new Date(this.eventTimestamp.getTime());
    }

    /**
     * Returns the type of the event.
     * 
     * This method provides access to the event classification string, which
     * is used for routing, filtering, and processing logic throughout the
     * analytics system. The event type is immutable and follows standardized
     * naming conventions for consistency across the platform.
     * 
     * Event types are used for:
     * - Kafka topic routing and consumer group assignment
     * - Stream processing pipeline branching logic
     * - Analytics dashboard categorization and filtering
     * - Alert and notification rule configuration
     * - Data warehouse partitioning and indexing strategies
     * - Compliance reporting and audit trail categorization
     * 
     * @return The type of the event as a String. Never returns null or empty.
     *         The returned string is trimmed and follows standard event type
     *         naming conventions (e.g., "TRANSACTION_COMPLETED").
     */
    public String getEventType() {
        // Return the value of the eventType property
        return this.eventType;
    }

    /**
     * Returns the data payload of the event.
     * 
     * This method provides access to the analytics data contained within the event.
     * The returned AnalyticsData instance is a defensive copy to maintain
     * immutability and prevent external modifications that could compromise
     * data integrity in the event-driven architecture.
     * 
     * The analytics data payload contains:
     * - Time-series measurement data for InfluxDB storage
     * - Tagged dimensions for efficient querying and grouping
     * - Field values with actual metrics and measurements
     * - Contextual metadata for proper data categorization
     * 
     * Common use cases for the analytics data include:
     * - Real-time dashboard updates and visualization
     * - Time-series database storage and retrieval
     * - Predictive analytics feature engineering
     * - Risk assessment scoring and evaluation
     * - Performance monitoring and alerting
     * - Regulatory compliance data collection
     * - Historical trend analysis and reporting
     * 
     * @return A new AnalyticsData instance containing the event payload.
     *         Never returns null. The returned instance is a deep copy and
     *         modifications to it will not affect the original event data.
     */
    public AnalyticsData getAnalyticsData() {
        // Return a defensive copy of the analyticsData property
        return this.analyticsData.copy();
    }

    /**
     * Compares this AnalyticsEvent with another object for equality.
     * 
     * Two AnalyticsEvent objects are considered equal if and only if they have
     * identical values for all four properties: eventId, eventTimestamp, eventType,
     * and analyticsData. This equality contract is essential for proper event
     * deduplication and comparison operations in distributed systems.
     * 
     * The equality check is performed in the following order for optimization:
     * 1. Reference equality (same object instance)
     * 2. Null check and class type verification
     * 3. Event ID comparison (most likely to differ)
     * 4. Event timestamp comparison
     * 5. Event type comparison
     * 6. Analytics data comparison (most expensive operation)
     * 
     * This method is consistent with the hashCode() implementation and follows
     * the Java Object.equals() contract specifications.
     * 
     * @param obj The object to compare with this AnalyticsEvent
     * @return true if the specified object is equal to this AnalyticsEvent,
     *         false otherwise. Returns false if obj is null or not an instance
     *         of AnalyticsEvent.
     */
    @Override
    public boolean equals(Object obj) {
        // Check for reference equality (same object instance)
        if (this == obj) {
            return true;
        }

        // Check for null and class type compatibility
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        // Cast to AnalyticsEvent for property comparison
        AnalyticsEvent that = (AnalyticsEvent) obj;

        // Compare eventId (most likely to differ, check first for performance)
        if (!Objects.equals(this.eventId, that.eventId)) {
            return false;
        }

        // Compare eventTimestamp
        if (!Objects.equals(this.eventTimestamp, that.eventTimestamp)) {
            return false;
        }

        // Compare eventType
        if (!Objects.equals(this.eventType, that.eventType)) {
            return false;
        }

        // Compare analyticsData (most expensive operation, check last)
        return Objects.equals(this.analyticsData, that.analyticsData);
    }

    /**
     * Returns a hash code value for this AnalyticsEvent.
     * 
     * The hash code is computed using all four properties of the event to ensure
     * consistency with the equals() method. This implementation uses the standard
     * Java approach of combining hash codes with prime number multiplication
     * to minimize hash collisions and ensure good distribution.
     * 
     * The hash code is calculated as:
     * hash = 31 * (31 * (31 * eventId.hashCode() + eventTimestamp.hashCode()) 
     *              + eventType.hashCode()) + analyticsData.hashCode()
     * 
     * This hash code implementation:
     * - Is consistent with the equals() method contract
     * - Provides good distribution for hash-based collections
     * - Handles null values gracefully (though none should exist)
     * - Uses prime number multiplication for collision reduction
     * 
     * @return A hash code value for this AnalyticsEvent. The hash code is computed
     *         from all properties and remains consistent for the lifetime of the
     *         object since all properties are immutable.
     */
    @Override
    public int hashCode() {
        return Objects.hash(eventId, eventTimestamp, eventType, analyticsData);
    }

    /**
     * Returns a string representation of this AnalyticsEvent.
     * 
     * This method provides a human-readable representation of the event that
     * is useful for debugging, logging, and monitoring purposes. The string
     * format includes all key properties of the event in a structured format
     * that is easy to parse and understand.
     * 
     * The string representation includes:
     * - Event ID for unique identification
     * - Event timestamp for temporal context
     * - Event type for classification
     * - Analytics data summary for payload overview
     * 
     * Format: "AnalyticsEvent{eventId=<uuid>, eventTimestamp=<date>, 
     *          eventType='<type>', analyticsData=<summary>}"
     * 
     * This representation is designed to be:
     * - Concise yet informative for log readability
     * - Consistent with standard Java toString() conventions
     * - Safe for production logging (no sensitive data exposure)
     * - Useful for debugging and troubleshooting
     * 
     * @return A string representation of this AnalyticsEvent. Never returns null.
     *         The returned string is formatted for readability and contains
     *         all essential information about the event.
     */
    @Override
    public String toString() {
        return String.format(
            "AnalyticsEvent{eventId=%s, eventTimestamp=%s, eventType='%s', analyticsData=%s}",
            this.eventId,
            this.eventTimestamp,
            this.eventType,
            this.analyticsData
        );
    }
}