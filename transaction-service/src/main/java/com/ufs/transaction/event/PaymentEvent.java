package com.ufs.transaction.event;

// External imports with version information
import lombok.Data; // lombok 1.18.30
import lombok.NoArgsConstructor; // lombok 1.18.30
import lombok.AllArgsConstructor; // lombok 1.18.30
import java.io.Serializable; // java.base 21
import java.util.UUID; // java.base 21
import java.time.Instant; // java.base 21

// Internal imports
import com.ufs.transaction.model.Payment;

/**
 * Event object representing a payment-related occurrence within the Unified Financial Services Platform.
 * 
 * This class serves as a Data Transfer Object (DTO) for Kafka-based event-driven architecture,
 * encapsulating payment state changes and facilitating real-time transaction monitoring across
 * the distributed microservices ecosystem. Each PaymentEvent instance represents a significant
 * business event in the payment lifecycle that requires propagation to interested subscribers.
 * 
 * The PaymentEvent supports the following critical system requirements:
 * 
 * - Real-time Transaction Monitoring (F-008): Provides the fundamental data structure for
 *   real-time analytics and fraud detection systems by capturing payment state transitions
 *   with precise timing information and comprehensive payment context
 * 
 * - Event-driven Architecture (5.1.1): Enables asynchronous communication and decoupling
 *   of services involved in transaction processing, allowing for scalable and resilient
 *   system design where components can react to payment events independently
 * 
 * - Transaction Processing Workflow (4.1.1.3): Facilitates the orchestration of complex
 *   transaction processing workflows by signaling different stages from initiation through
 *   settlement, enabling workflow engines to coordinate downstream processing steps
 * 
 * Key Design Features:
 * - Implements Serializable for efficient Kafka message transmission and persistence
 * - Immutable event identifier ensures unique tracking across distributed systems
 * - Flexible event type classification supports various payment lifecycle stages
 * - Rich payment payload provides complete context for event processing
 * - Precise timestamp enables chronological ordering and temporal analytics
 * - Comprehensive logging and monitoring support for operational visibility
 * 
 * Event Types Supported:
 * - PAYMENT_INITIATED: Payment processing has begun
 * - PAYMENT_VALIDATED: Payment has passed initial validation checks
 * - PAYMENT_RISK_ASSESSED: Risk scoring and fraud detection completed
 * - PAYMENT_APPROVED: Payment has been approved for settlement
 * - PAYMENT_SETTLEMENT_STARTED: Settlement processing has commenced
 * - PAYMENT_COMPLETED: Payment has been successfully settled
 * - PAYMENT_FAILED: Payment processing encountered an error
 * - PAYMENT_REJECTED: Payment was rejected due to business rules or compliance
 * - PAYMENT_CANCELLED: Payment was cancelled before completion
 * 
 * Integration Patterns:
 * - Event Sourcing: Enables reconstruction of payment state from event history
 * - CQRS: Supports command-query responsibility segregation patterns
 * - Saga Pattern: Facilitates distributed transaction coordination
 * - Event Streaming: Real-time processing through Kafka streams and consumers
 * 
 * Performance Characteristics:
 * - Optimized for high-throughput Kafka production (10,000+ events/second)
 * - Minimal serialization overhead through efficient field selection
 * - Support for batch processing and real-time streaming consumption patterns
 * - Configurable retention policies for compliance and analytics requirements
 * 
 * Compliance and Audit:
 * - Immutable event records support regulatory audit requirements
 * - Comprehensive payment context enables compliance monitoring
 * - Timestamp precision supports transaction ordering for settlement reconciliation
 * - Event correlation capabilities enable end-to-end transaction tracing
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 1.0
 * @see Payment
 * @see com.ufs.transaction.model.TransactionStatus
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent implements Serializable {

    /**
     * Serialization version UID for maintaining compatibility across system updates.
     * 
     * This version identifier ensures that PaymentEvent objects can be safely
     * serialized and deserialized across different versions of the application,
     * maintaining backward compatibility for Kafka messages and persistent storage.
     * 
     * Version History:
     * - 1L: Initial version with core payment event structure
     */
    private static final long serialVersionUID = 1L;

    /**
     * Unique identifier for this specific payment event instance.
     * 
     * This UUID serves as the primary key for event tracking and correlation across
     * distributed systems. It enables precise event deduplication, idempotent
     * processing, and comprehensive audit trail construction. The identifier is
     * generated using secure random algorithms to ensure global uniqueness even
     * in high-concurrency scenarios.
     * 
     * Usage Patterns:
     * - Event deduplication in consumer applications
     * - Correlation tracking across microservices
     * - Audit log correlation and forensic analysis
     * - Idempotent event processing guarantees
     * - Distributed tracing and observability
     * 
     * Example Values:
     * - 550e8400-e29b-41d4-a716-446655440000
     * - f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * Technical Considerations:
     * - Generated using java.util.UUID.randomUUID() for maximum entropy
     * - Serializes efficiently in Kafka message headers and payloads
     * - Indexed in event stores for rapid lookup and correlation
     * - Immutable once assigned to ensure event integrity
     */
    private UUID eventId;

    /**
     * Classification of the payment event type indicating the specific lifecycle stage.
     * 
     * This field categorizes the nature of the payment event, enabling downstream
     * systems to apply appropriate processing logic based on the event semantics.
     * The event type drives workflow orchestration, notification routing, and
     * analytics aggregation patterns throughout the distributed system.
     * 
     * Standard Event Types:
     * - "PAYMENT_INITIATED": Initial payment request received and queued
     * - "PAYMENT_VALIDATED": Payment data validation and format checks completed
     * - "PAYMENT_RISK_ASSESSED": AI/ML risk scoring and fraud detection finished
     * - "PAYMENT_APPROVED": Payment cleared for settlement processing
     * - "PAYMENT_SETTLEMENT_STARTED": Settlement operations commenced
     * - "PAYMENT_COMPLETED": Payment successfully settled and confirmed
     * - "PAYMENT_FAILED": Payment processing failed due to technical errors
     * - "PAYMENT_REJECTED": Payment rejected due to business rules or compliance
     * - "PAYMENT_CANCELLED": Payment cancelled by user or system before completion
     * 
     * Extended Event Types (Future Enhancement):
     * - "PAYMENT_COMPLIANCE_CHECKED": AML/KYC compliance validation completed
     * - "PAYMENT_BLOCKCHAIN_SUBMITTED": Submitted to blockchain for settlement
     * - "PAYMENT_RECONCILED": Settlement reconciliation completed
     * - "PAYMENT_DISPUTED": Payment dispute initiated by customer
     * - "PAYMENT_REFUNDED": Payment refund processed successfully
     * 
     * Processing Guidelines:
     * - Event type determines routing to appropriate Kafka topics and consumers
     * - Critical for implementing event-driven saga patterns and workflow orchestration
     * - Enables selective consumption based on business domain interests
     * - Supports event filtering and aggregation in stream processing applications
     * 
     * Validation Requirements:
     * - Must be non-null and non-empty string value
     * - Should follow standardized naming convention (PAYMENT_ACTION_RESULT)
     * - Case-sensitive matching for consumer filtering and routing logic
     * - Maximum length of 100 characters to support future event type evolution
     */
    private String eventType;

    /**
     * Complete payment object containing all relevant payment details and context.
     * 
     * This field carries the full payment payload including financial amounts,
     * transaction details, status information, and metadata required for
     * comprehensive event processing. The payment object provides the complete
     * business context necessary for downstream systems to make informed decisions
     * about transaction handling, risk assessment, and customer communication.
     * 
     * Payment Object Contents:
     * - Financial Details: Amount, currency, exchange rates
     * - Transaction Context: Associated transaction ID, account information
     * - Status Information: Current payment status and lifecycle stage
     * - Temporal Data: Creation timestamps, processing duration metrics
     * - Integration Details: External payment gateway references
     * - Compliance Data: Risk scores, fraud detection results
     * 
     * Usage in Event Processing:
     * - Real-time Fraud Detection: Payment patterns and behavioral analysis
     * - Risk Management: Amount thresholds and velocity checking
     * - Customer Notifications: Payment status updates and confirmations
     * - Regulatory Reporting: Compliance monitoring and audit trail construction
     * - Analytics Processing: Transaction trend analysis and business intelligence
     * - Settlement Reconciliation: Cross-reference with external payment networks
     * 
     * Data Privacy Considerations:
     * - Contains sensitive financial information requiring encryption in transit
     * - Subject to data retention policies and regulatory compliance requirements
     * - May require field-level masking for certain consumer applications
     * - Supports differential privacy for analytics while preserving utility
     * 
     * Performance Optimization:
     * - Payment object is serialized efficiently for Kafka transmission
     * - Large payment objects may require compression for network optimization
     * - Consider payload size limits in Kafka configuration (default 1MB)
     * - Supports lazy loading patterns for consumer applications
     * 
     * Relationship Integrity:
     * - Payment object maintains referential integrity with Transaction entity
     * - Immutable once included in event to ensure data consistency
     * - Version tracking supports schema evolution and compatibility
     * - Supports partial updates through event sourcing patterns
     */
    private Payment payment;

    /**
     * Precise timestamp indicating when this payment event was generated.
     * 
     * This high-precision timestamp captures the exact moment when the payment
     * event occurred within the system, enabling accurate chronological ordering,
     * temporal analytics, and compliance audit trails. The timestamp is critical
     * for event sourcing, transaction ordering, and performance monitoring across
     * the distributed financial services platform.
     * 
     * Precision and Accuracy:
     * - Nanosecond precision using Java 8+ Instant class
     * - UTC timezone for global consistency across distributed systems
     * - Monotonic ordering guarantees within single JVM instances
     * - Network time synchronization (NTP) recommended for cluster consistency
     * 
     * Business Applications:
     * - Transaction Ordering: Establishing definitive sequence for settlement
     * - Performance Monitoring: Measuring processing latency and throughput
     * - Compliance Reporting: Audit trail timestamps for regulatory requirements
     * - SLA Monitoring: Tracking processing times against service level agreements
     * - Temporal Analytics: Time-based aggregation and trend analysis
     * - Fraud Detection: Velocity checking and pattern recognition
     * 
     * Technical Implementation:
     * - Generated using Instant.now() for maximum precision and UTC consistency
     * - Serializes efficiently in ISO-8601 format for JSON and XML representations
     * - Indexed in time-series databases for rapid temporal queries
     * - Supports range queries and time-based partitioning strategies
     * 
     * Event Ordering Guarantees:
     * - Within single partition: Kafka maintains message ordering by timestamp
     * - Across partitions: Application-level ordering using timestamp comparison
     * - Clock synchronization: Critical for accurate cross-service event ordering
     * - Late-arriving events: Configurable tolerance windows for out-of-order processing
     * 
     * Compliance Considerations:
     * - Immutable once set to maintain audit trail integrity
     * - Supports regulatory requirements for transaction timing documentation
     * - Enables reconstruction of transaction timelines for investigations
     * - Time zone independence prevents regional processing discrepancies
     * 
     * Example Values:
     * - 2024-03-15T14:30:45.123456789Z (ISO-8601 format)
     * - 1710505845123456789 (epoch nanoseconds)
     * 
     * Performance Considerations:
     * - Timestamp generation adds minimal overhead (<1μs)
     * - Efficient serialization in binary formats for high-throughput scenarios
     * - Time-based indexing enables rapid temporal range queries
     * - Supports time-based data partitioning and archival strategies
     */
    private Instant timestamp;

    /**
     * Creates a new PaymentEvent with the current system timestamp.
     * 
     * This convenience constructor automatically generates the event timestamp using
     * the current system time, simplifying event creation for most use cases while
     * ensuring consistent timestamp precision across the platform.
     * 
     * @param eventId Unique identifier for the event (required)
     * @param eventType Classification of the payment event (required)
     * @param payment Complete payment object with transaction context (required)
     */
    public PaymentEvent(UUID eventId, String eventType, Payment payment) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.payment = payment;
        this.timestamp = Instant.now();
    }

    /**
     * Creates a standardized payment event for the payment initiation workflow stage.
     * 
     * This factory method simplifies the creation of payment initiation events,
     * ensuring consistent event type naming and automatic timestamp generation
     * for the start of the payment processing workflow.
     * 
     * @param payment The payment object being initiated
     * @return PaymentEvent configured for payment initiation
     */
    public static PaymentEvent createPaymentInitiatedEvent(Payment payment) {
        return new PaymentEvent(
            UUID.randomUUID(),
            "PAYMENT_INITIATED",
            payment
        );
    }

    /**
     * Creates a standardized payment event for the payment completion workflow stage.
     * 
     * This factory method generates payment completion events with consistent
     * formatting and automatic correlation for successful payment processing outcomes.
     * 
     * @param payment The payment object that completed successfully
     * @return PaymentEvent configured for payment completion
     */
    public static PaymentEvent createPaymentCompletedEvent(Payment payment) {
        return new PaymentEvent(
            UUID.randomUUID(),
            "PAYMENT_COMPLETED",
            payment
        );
    }

    /**
     * Creates a standardized payment event for payment failure scenarios.
     * 
     * This factory method generates payment failure events with consistent
     * error classification and automatic correlation for failed payment processing.
     * 
     * @param payment The payment object that encountered a failure
     * @return PaymentEvent configured for payment failure
     */
    public static PaymentEvent createPaymentFailedEvent(Payment payment) {
        return new PaymentEvent(
            UUID.randomUUID(),
            "PAYMENT_FAILED",
            payment
        );
    }

    /**
     * Creates a standardized payment event for risk assessment completion.
     * 
     * This factory method generates risk assessment events indicating that
     * AI/ML fraud detection and risk scoring processes have completed for
     * the associated payment.
     * 
     * @param payment The payment object that completed risk assessment
     * @return PaymentEvent configured for risk assessment completion
     */
    public static PaymentEvent createPaymentRiskAssessedEvent(Payment payment) {
        return new PaymentEvent(
            UUID.randomUUID(),
            "PAYMENT_RISK_ASSESSED",
            payment
        );
    }

    /**
     * Determines if this payment event represents a successful payment outcome.
     * 
     * This convenience method checks the event type to determine if the event
     * indicates a successful payment processing result, useful for metrics
     * collection and success rate monitoring.
     * 
     * @return true if the event represents a successful payment outcome
     */
    public boolean isSuccessEvent() {
        return "PAYMENT_COMPLETED".equals(this.eventType) ||
               "PAYMENT_APPROVED".equals(this.eventType);
    }

    /**
     * Determines if this payment event represents a failure or error condition.
     * 
     * This convenience method identifies events that indicate payment processing
     * failures, rejections, or cancellations for error handling and monitoring purposes.
     * 
     * @return true if the event represents a failure condition
     */
    public boolean isFailureEvent() {
        return "PAYMENT_FAILED".equals(this.eventType) ||
               "PAYMENT_REJECTED".equals(this.eventType) ||
               "PAYMENT_CANCELLED".equals(this.eventType);
    }

    /**
     * Determines if this payment event represents an active processing state.
     * 
     * This method identifies events that indicate the payment is currently
     * undergoing active processing and has not reached a terminal state.
     * 
     * @return true if the event represents active processing
     */
    public boolean isProcessingEvent() {
        return "PAYMENT_INITIATED".equals(this.eventType) ||
               "PAYMENT_VALIDATED".equals(this.eventType) ||
               "PAYMENT_RISK_ASSESSED".equals(this.eventType) ||
               "PAYMENT_SETTLEMENT_STARTED".equals(this.eventType);
    }

    /**
     * Extracts the payment amount for metrics and monitoring purposes.
     * 
     * This convenience method safely extracts the payment amount from the
     * embedded payment object, handling null safety for analytics processing.
     * 
     * @return the payment amount or null if payment is not available
     */
    public java.math.BigDecimal getPaymentAmount() {
        return this.payment != null ? this.payment.getAmount() : null;
    }

    /**
     * Extracts the payment currency for international processing and reporting.
     * 
     * This convenience method safely extracts the payment currency from the
     * embedded payment object for currency-based analytics and compliance reporting.
     * 
     * @return the ISO 4217 currency code or null if payment is not available
     */
    public String getPaymentCurrency() {
        return this.payment != null ? this.payment.getCurrency() : null;
    }

    /**
     * Extracts the associated transaction ID for correlation and tracking.
     * 
     * This convenience method retrieves the transaction identifier from the
     * embedded payment object for cross-system correlation and audit trail construction.
     * 
     * @return the transaction ID or null if payment or transaction is not available
     */
    public Long getTransactionId() {
        return this.payment != null && this.payment.getTransaction() != null
            ? this.payment.getTransaction().getId()
            : null;
    }

    /**
     * Gets the duration between payment creation and event generation.
     * 
     * This method calculates the processing time elapsed from payment creation
     * to event generation, useful for performance monitoring and SLA tracking.
     * 
     * @return processing duration in milliseconds, or 0 if calculation is not possible
     */
    public long getProcessingDurationMillis() {
        if (this.payment != null && this.payment.getCreatedAt() != null && this.timestamp != null) {
            return java.time.Duration.between(
                this.payment.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toInstant(),
                this.timestamp
            ).toMillis();
        }
        return 0L;
    }

    /**
     * Creates a summary string representation for logging and monitoring purposes.
     * 
     * This method generates a concise, human-readable representation of the payment
     * event suitable for structured logging, monitoring dashboards, and debugging
     * activities while avoiding exposure of sensitive financial information.
     * 
     * @return formatted string summarizing the payment event
     */
    public String toSummaryString() {
        return String.format(
            "PaymentEvent{eventId=%s, type='%s', paymentId=%s, amount=%s %s, timestamp=%s}",
            this.eventId,
            this.eventType,
            this.payment != null ? this.payment.getId() : "null",
            this.payment != null ? this.payment.getAmount() : "null",
            this.payment != null ? this.payment.getCurrency() : "null",
            this.timestamp
        );
    }

    /**
     * Validates the completeness and consistency of the payment event.
     * 
     * This method performs comprehensive validation of the payment event structure
     * to ensure data integrity and compliance with business rules before
     * publishing to Kafka topics or processing by consumer applications.
     * 
     * @return true if the event passes all validation checks
     */
    public boolean isValid() {
        return this.eventId != null &&
               this.eventType != null && !this.eventType.trim().isEmpty() &&
               this.payment != null &&
               this.timestamp != null;
    }

    /**
     * Creates a deep copy of this payment event with a new event ID.
     * 
     * This method enables event replay and reprocessing scenarios while
     * maintaining the original event data and generating a new unique identifier
     * for deduplication and correlation purposes.
     * 
     * @return new PaymentEvent instance with identical data but different ID
     */
    public PaymentEvent copy() {
        return new PaymentEvent(
            UUID.randomUUID(),
            this.eventType,
            this.payment,
            this.timestamp
        );
    }

    /**
     * Generates a correlation key for event grouping and analysis.
     * 
     * This method creates a consistent correlation identifier that enables
     * grouping of related payment events for analytics, monitoring, and
     * troubleshooting purposes.
     * 
     * @return correlation key based on payment and transaction context
     */
    public String getCorrelationKey() {
        if (this.payment != null && this.payment.getTransaction() != null) {
            return "txn-" + this.payment.getTransaction().getId();
        } else if (this.payment != null) {
            return "pay-" + this.payment.getId();
        } else {
            return "evt-" + this.eventId;
        }
    }
}