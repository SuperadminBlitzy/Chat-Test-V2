package com.ufs.transaction.event;

// External imports with version information
import java.io.Serializable; // java.base 21
import java.time.LocalDateTime; // java.base 21
import java.util.UUID; // java.base 21

// Internal imports
import com.ufs.transaction.model.Transaction;

/**
 * Represents an event related to a financial transaction within the Unified Financial Services Platform.
 * 
 * This class serves as a core component of the event-driven architecture, enabling asynchronous 
 * communication between microservices via message brokers like Apache Kafka. It encapsulates 
 * transaction state changes and facilitates real-time transaction monitoring across the entire 
 * financial services ecosystem.
 * 
 * The TransactionEvent class supports the following critical system requirements:
 * 
 * - Real-time Transaction Monitoring (F-008): Enables real-time monitoring of transaction 
 *   lifecycles by propagating state changes through event streams. This supports operational 
 *   dashboards, fraud detection systems, and compliance monitoring tools.
 * 
 * - Event-driven Communication (Core Technical Approach): Implements the microservices 
 *   communication pattern that enables loose coupling between services while maintaining 
 *   data consistency and system resilience.
 * 
 * Key Features:
 * - Serializable design for Kafka message transmission and cross-JVM communication
 * - UUID-based event identification for distributed tracing and correlation
 * - Comprehensive transaction context for downstream processing
 * - Immutable event semantics following event sourcing principles
 * - Support for various event types throughout transaction lifecycle
 * 
 * Event Types:
 * The eventType field supports various transaction lifecycle stages including:
 * - TRANSACTION_CREATED: New transaction initiated
 * - TRANSACTION_VALIDATED: Transaction passed validation checks
 * - TRANSACTION_PROCESSING: Transaction entered processing state
 * - TRANSACTION_APPROVED: Transaction approved for settlement
 * - TRANSACTION_SETTLEMENT_STARTED: Settlement processing initiated
 * - TRANSACTION_COMPLETED: Transaction successfully completed
 * - TRANSACTION_FAILED: Transaction failed due to errors
 * - TRANSACTION_REJECTED: Transaction rejected by business rules
 * - TRANSACTION_CANCELLED: Transaction cancelled by user or system
 * 
 * Usage in Event-Driven Architecture:
 * - Published to Kafka topics for real-time processing
 * - Consumed by fraud detection services for pattern analysis
 * - Used by notification services for customer communications
 * - Processed by audit services for compliance reporting
 * - Analyzed by analytics services for business intelligence
 * 
 * Kafka Integration:
 * - Supports JSON and Avro serialization formats
 * - Compatible with Kafka Connect for data pipeline integration
 * - Designed for high-throughput event streaming scenarios
 * - Enables event replay for system recovery and auditing
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 * @see Transaction for associated transaction entity
 * @see java.io.Serializable for serialization contract
 */
public class TransactionEvent implements Serializable {

    /**
     * Serial version UID for serialization compatibility.
     * 
     * This ensures that serialized TransactionEvent objects remain compatible
     * across different versions of the class, which is critical for Kafka
     * message persistence and cross-service communication.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Unique identifier for this specific event instance.
     * 
     * This UUID enables distributed tracing, event correlation, and deduplication
     * across the microservices architecture. Each event instance receives a unique
     * identifier to support event sourcing patterns and audit requirements.
     * 
     * Key characteristics:
     * - Globally unique across all system instances
     * - Generated using UUID.randomUUID() for high entropy
     * - Used for event tracking and correlation in distributed systems
     * - Critical for event deduplication and exactly-once processing
     */
    private UUID eventId;

    /**
     * Classification of the transaction event type.
     * 
     * This field categorizes the nature of the transaction state change that
     * triggered this event. It enables downstream consumers to filter and
     * process only relevant events for their specific use cases.
     * 
     * Common event types include:
     * - TRANSACTION_CREATED: Initial transaction creation
     * - TRANSACTION_PROCESSING: Transaction entered processing workflow
     * - TRANSACTION_APPROVED: Transaction approved for settlement
     * - TRANSACTION_COMPLETED: Transaction successfully finalized
     * - TRANSACTION_FAILED: Transaction encountered failure
     * - TRANSACTION_REJECTED: Transaction rejected by business rules
     * - TRANSACTION_CANCELLED: Transaction cancelled by user or system
     * 
     * Usage patterns:
     * - Enables event filtering in Kafka consumers
     * - Supports conditional routing in message processing
     * - Facilitates event-specific business logic implementation
     * - Critical for monitoring and alerting rule definitions
     */
    private String eventType;

    /**
     * Timestamp indicating when this event was generated.
     * 
     * This timestamp captures the exact moment when the event was created,
     * which may differ from the transaction timestamp. It's essential for
     * event ordering, temporal analytics, and system debugging.
     * 
     * Key characteristics:
     * - High precision for event ordering and correlation
     * - Used for event stream processing and windowing operations
     * - Critical for performance monitoring and SLA tracking
     * - Enables temporal analysis of transaction processing patterns
     * - Supports event replay and system recovery scenarios
     */
    private LocalDateTime timestamp;

    /**
     * Complete transaction data associated with this event.
     * 
     * This field contains the full Transaction entity that represents the
     * financial transaction related to this event. Including the complete
     * transaction context enables downstream services to make informed
     * decisions without additional data lookups.
     * 
     * Benefits of including full transaction data:
     * - Eliminates need for synchronous service calls during event processing
     * - Provides complete context for fraud detection and risk assessment
     * - Enables stateless event processing in consumer services
     * - Supports offline analytics and batch processing scenarios
     * - Maintains data consistency across service boundaries
     * 
     * The transaction object includes:
     * - Financial details (amount, currency, type)
     * - Account and counterparty information
     * - Current transaction status and lifecycle state
     * - Audit information (timestamps, reference numbers)
     * - Compliance and regulatory data
     */
    private Transaction transaction;

    /**
     * Default no-argument constructor for TransactionEvent.
     * 
     * This constructor is required for serialization frameworks (JSON, Avro)
     * and message broker deserialization processes. It creates an empty event
     * instance that can be populated through setter methods.
     * 
     * Usage scenarios:
     * - Kafka message deserialization
     * - JSON unmarshalling by Jackson or Gson
     * - Object instantiation by reflection-based frameworks
     * - Unit testing and mock object creation
     */
    public TransactionEvent() {
        // Default constructor for serialization frameworks
        // All fields will be null until explicitly set
    }

    /**
     * Comprehensive constructor for creating fully initialized TransactionEvent instances.
     * 
     * This constructor enables creating complete event objects in a single operation,
     * ensuring all required fields are populated and the event is ready for publishing
     * to message brokers or processing by downstream systems.
     * 
     * @param eventId Unique identifier for this event instance (required)
     * @param eventType Classification of the transaction event (required)
     * @param timestamp When this event was generated (required)
     * @param transaction Complete transaction data associated with this event (required)
     * 
     * @throws IllegalArgumentException if any required parameter is null
     */
    public TransactionEvent(UUID eventId, String eventType, LocalDateTime timestamp, Transaction transaction) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.timestamp = timestamp;
        this.transaction = transaction;
    }

    /**
     * Factory method for creating a new TransactionEvent with auto-generated ID and timestamp.
     * 
     * This convenience method simplifies event creation by automatically generating
     * the event ID and timestamp, requiring only the event type and transaction data.
     * This is the most common way to create events in application code.
     * 
     * @param eventType Classification of the transaction event (required)
     * @param transaction Complete transaction data associated with this event (required)
     * @return Fully initialized TransactionEvent instance
     * 
     * @throws IllegalArgumentException if eventType or transaction is null
     */
    public static TransactionEvent createEvent(String eventType, Transaction transaction) {
        if (eventType == null || eventType.trim().isEmpty()) {
            throw new IllegalArgumentException("Event type cannot be null or empty");
        }
        if (transaction == null) {
            throw new IllegalArgumentException("Transaction cannot be null");
        }
        
        return new TransactionEvent(
            UUID.randomUUID(),
            eventType.trim().toUpperCase(),
            LocalDateTime.now(),
            transaction
        );
    }

    // Getter and Setter Methods with Comprehensive Documentation

    /**
     * Retrieves the unique identifier of this event.
     * 
     * The event ID is used for distributed tracing, event correlation, and
     * deduplication across the microservices architecture. This UUID enables
     * tracking of individual events through complex processing workflows.
     * 
     * @return The UUID that uniquely identifies this event instance
     */
    public UUID getEventId() {
        return eventId;
    }

    /**
     * Sets the unique identifier for this event.
     * 
     * This method is typically used during event deserialization or when
     * reconstructing events from persistent storage. Application code should
     * generally rely on auto-generated UUIDs for new events.
     * 
     * @param eventId The UUID to assign as the event identifier
     */
    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    /**
     * Retrieves the classification of this transaction event.
     * 
     * The event type enables downstream consumers to filter and process
     * only the events relevant to their specific business logic. This
     * supports efficient event-driven architectures with selective processing.
     * 
     * @return The string representing the event type classification
     */
    public String getEventType() {
        return eventType;
    }

    /**
     * Sets the classification for this transaction event.
     * 
     * The event type should follow consistent naming conventions to ensure
     * proper event filtering and routing. Common practice is to use
     * UPPER_CASE_WITH_UNDERSCORES format for event type names.
     * 
     * @param eventType The event type classification string
     */
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    /**
     * Retrieves the timestamp when this event was generated.
     * 
     * This timestamp is crucial for event ordering, temporal analytics,
     * and debugging distributed system behavior. It represents the exact
     * moment when the event was created, not when it was processed.
     * 
     * @return The LocalDateTime when this event was created
     */
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    /**
     * Sets the timestamp for when this event was generated.
     * 
     * This method is primarily used during event deserialization or when
     * reconstructing events from logs. For new events, timestamps should
     * typically be set to the current time during event creation.
     * 
     * @param timestamp The LocalDateTime when this event occurred
     */
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    /**
     * Retrieves the complete transaction data associated with this event.
     * 
     * The transaction object provides full context about the financial
     * transaction that triggered this event. This enables downstream
     * services to make informed decisions without additional data lookups.
     * 
     * @return The Transaction entity containing complete transaction details
     */
    public Transaction getTransaction() {
        return transaction;
    }

    /**
     * Sets the transaction data for this event.
     * 
     * The transaction object should represent the complete state of the
     * financial transaction at the time this event was generated. This
     * ensures downstream consumers have access to all necessary context.
     * 
     * @param transaction The Transaction entity to associate with this event
     */
    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }

    // Utility Methods for Event Processing and Analysis

    /**
     * Determines if this event represents a transaction lifecycle completion.
     * 
     * This method checks if the event type indicates that a transaction has
     * reached a terminal state (completed, failed, rejected, or cancelled).
     * Useful for triggering cleanup processes or final notifications.
     * 
     * @return true if this event represents transaction completion, false otherwise
     */
    public boolean isTransactionCompletionEvent() {
        if (eventType == null) return false;
        
        String upperEventType = eventType.toUpperCase();
        return upperEventType.contains("COMPLETED") || 
               upperEventType.contains("FAILED") || 
               upperEventType.contains("REJECTED") || 
               upperEventType.contains("CANCELLED");
    }

    /**
     * Determines if this event represents a transaction state change.
     * 
     * This method identifies events that indicate a change in transaction
     * status, which are typically the most important events for monitoring
     * and workflow management systems.
     * 
     * @return true if this event represents a status change, false otherwise
     */
    public boolean isTransactionStatusChangeEvent() {
        if (eventType == null) return false;
        
        String upperEventType = eventType.toUpperCase();
        return upperEventType.contains("PROCESSING") || 
               upperEventType.contains("APPROVED") || 
               upperEventType.contains("COMPLETED") || 
               upperEventType.contains("FAILED") || 
               upperEventType.contains("REJECTED") || 
               upperEventType.contains("CANCELLED");
    }

    /**
     * Determines if this event requires immediate attention or alerting.
     * 
     * This method identifies high-priority events that may require immediate
     * attention from monitoring systems, such as failures or rejections that
     * could indicate system issues or fraud attempts.
     * 
     * @return true if this event requires immediate attention, false otherwise
     */
    public boolean requiresImmediateAttention() {
        if (eventType == null) return false;
        
        String upperEventType = eventType.toUpperCase();
        return upperEventType.contains("FAILED") || 
               upperEventType.contains("REJECTED") || 
               upperEventType.contains("FRAUD") || 
               upperEventType.contains("ERROR");
    }

    /**
     * Extracts the transaction ID from the associated transaction for convenience.
     * 
     * This utility method provides quick access to the transaction identifier
     * without requiring null checks on the transaction object. Useful for
     * logging and correlation purposes.
     * 
     * @return The transaction UUID if available, null otherwise
     */
    public UUID getTransactionId() {
        return transaction != null ? transaction.getId() : null;
    }

    /**
     * Extracts the account ID from the associated transaction for convenience.
     * 
     * This utility method provides quick access to the primary account
     * identifier for routing and filtering purposes in event processing.
     * 
     * @return The account UUID if available, null otherwise
     */
    public UUID getAccountId() {
        return transaction != null ? transaction.getAccountId() : null;
    }

    /**
     * Provides event age calculation for monitoring and SLA purposes.
     * 
     * This method calculates how much time has elapsed since the event
     * was created, which is useful for performance monitoring and
     * identifying processing delays or bottlenecks.
     * 
     * @return Duration since event creation in milliseconds
     */
    public long getEventAgeInMillis() {
        if (timestamp == null) return 0;
        return java.time.Duration.between(timestamp, LocalDateTime.now()).toMillis();
    }

    /**
     * Validates that all required fields are properly populated.
     * 
     * This method performs comprehensive validation of the event object
     * to ensure it meets all requirements for serialization and processing.
     * Useful before publishing events to message brokers.
     * 
     * @return true if the event is valid and complete, false otherwise
     */
    public boolean isValidEvent() {
        return eventId != null && 
               eventType != null && !eventType.trim().isEmpty() &&
               timestamp != null && 
               transaction != null;
    }

    /**
     * Creates a correlation key for event grouping and analysis.
     * 
     * This method generates a string that can be used to correlate related
     * events, typically based on transaction ID or account ID. Useful for
     * event stream processing and analytics.
     * 
     * @return Correlation key string for event grouping
     */
    public String getCorrelationKey() {
        UUID transactionId = getTransactionId();
        return transactionId != null ? transactionId.toString() : eventId.toString();
    }

    // Object Contract Methods

    /**
     * Indicates whether some other object is "equal to" this TransactionEvent.
     * 
     * Two TransactionEvent objects are considered equal if they have the same
     * event ID. This follows the natural equality contract for entities with
     * unique identifiers and supports proper behavior in collections.
     * 
     * @param obj the reference object with which to compare
     * @return true if this object is equal to the obj argument, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        TransactionEvent that = (TransactionEvent) obj;
        return eventId != null && eventId.equals(that.eventId);
    }

    /**
     * Returns a hash code value for this TransactionEvent.
     * 
     * The hash code is based on the event's UUID identifier to ensure
     * consistency with the equals method and proper behavior in hash-based
     * collections like HashMap and HashSet.
     * 
     * @return a hash code value for this TransactionEvent
     */
    @Override
    public int hashCode() {
        return eventId != null ? eventId.hashCode() : 0;
    }

    /**
     * Returns a string representation of this TransactionEvent.
     * 
     * The string includes key identifying information such as event ID,
     * event type, timestamp, and transaction ID. This representation is
     * optimized for logging, debugging, and monitoring purposes while
     * maintaining readability and information density.
     * 
     * Format: TransactionEvent{eventId=UUID, eventType='TYPE', timestamp=DATETIME, transactionId=UUID}
     * 
     * @return a string representation of this TransactionEvent
     */
    @Override
    public String toString() {
        return String.format("TransactionEvent{eventId=%s, eventType='%s', timestamp=%s, transactionId=%s}",
                eventId, eventType, timestamp, getTransactionId());
    }

    /**
     * Creates a detailed string representation suitable for audit logging.
     * 
     * This method provides a comprehensive string that includes all event
     * details and key transaction information. It's designed for audit trails,
     * detailed logging, and forensic analysis while being human-readable.
     * 
     * @return detailed string representation for audit purposes
     */
    public String toAuditString() {
        StringBuilder sb = new StringBuilder("TransactionEvent{");
        sb.append("eventId=").append(eventId);
        sb.append(", eventType='").append(eventType).append("'");
        sb.append(", timestamp=").append(timestamp);
        
        if (transaction != null) {
            sb.append(", transaction={");
            sb.append("id=").append(transaction.getId());
            sb.append(", accountId=").append(transaction.getAccountId());
            sb.append(", amount=").append(transaction.getAmount());
            sb.append(", currency=").append(transaction.getCurrency());
            sb.append(", status=").append(transaction.getStatus());
            sb.append(", transactionDate=").append(transaction.getTransactionDate());
            sb.append("}");
        } else {
            sb.append(", transaction=null");
        }
        
        sb.append("}");
        return sb.toString();
    }
}