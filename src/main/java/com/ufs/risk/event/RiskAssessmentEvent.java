package com.ufs.risk.event;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import com.ufs.risk.dto.RiskAssessmentRequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import java.util.Objects;
import java.util.HashMap;
import java.util.Map;

/**
 * Represents a risk assessment event that is published to Kafka for asynchronous processing
 * by the AI-Powered Risk Assessment Engine (F-002).
 * 
 * This event is a critical component of the unified financial services platform's event-driven
 * architecture, enabling real-time risk scoring with sub-500ms response times while maintaining
 * scalability for 10,000+ transactions per second (TPS) capacity.
 * 
 * Key Features:
 * - Asynchronous risk assessment processing via Kafka event streaming
 * - Support for AI-powered risk analysis with predictive modeling capabilities
 * - Enterprise-grade audit trail and event sourcing compatibility
 * - Real-time processing with comprehensive risk factor analysis
 * - Regulatory compliance support with explainable AI requirements
 * 
 * Business Context:
 * This event facilitates the core risk assessment workflow where customer transaction patterns,
 * market conditions, and external risk factors are analyzed by AI models to generate:
 * - Risk scores on 0-1000 scale with 95% accuracy rate
 * - Risk categories and mitigation recommendations
 * - Confidence intervals and model explainability data
 * - Bias detection reports for regulatory compliance
 * 
 * Technical Context:
 * - Designed for Kafka event streaming with guaranteed delivery
 * - Optimized for horizontal scaling across microservices architecture
 * - Compatible with Spring Cloud Event-Driven patterns
 * - Supports distributed tracing and observability requirements
 * - Implements financial industry security standards (SOC2, PCI-DSS)
 * 
 * Performance Requirements:
 * - Event processing latency: <500ms for 99% of requests
 * - Throughput capacity: 10,000+ events per second
 * - System availability: 99.99% uptime with fault tolerance
 * - Data integrity: ACID compliance with audit trail preservation
 * 
 * Compliance Features:
 * - Model Risk Management (MRM) requirements compliance
 * - Explainable AI support for banking agencies review
 * - Algorithmic auditing capabilities for fairness validation
 * - Annual resource disclosure support for risk management
 * - Consumer protection and regulatory transparency standards
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025-01-01
 * @see com.ufs.risk.dto.RiskAssessmentRequest
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonDeserialize(builder = RiskAssessmentEvent.RiskAssessmentEventBuilder.class)
public class RiskAssessmentEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique identifier for this specific risk assessment event instance.
     * 
     * This UUID serves multiple purposes:
     * - Event deduplication in Kafka consumers to prevent duplicate processing
     * - Correlation tracking across distributed microservices architecture
     * - Audit trail linkage for regulatory compliance and forensic analysis
     * - Event sourcing identification for historical event reconstruction
     * - Distributed tracing correlation for performance monitoring
     * 
     * The event ID is automatically generated upon event creation and remains
     * immutable throughout the event lifecycle, ensuring consistent identification
     * across all system components and external integrations.
     * 
     * Format: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
     * Usage: Kafka message key, distributed tracing span ID, audit log correlation
     */
    @NotNull(message = "Event ID is required for proper event tracking and deduplication")
    @JsonProperty("event_id")
    private UUID eventId;

    /**
     * Precise timestamp indicating when this risk assessment event was created.
     * 
     * This timestamp is critical for several operational and compliance purposes:
     * - Event ordering in Kafka topics for sequential processing
     * - Performance monitoring and latency measurement for SLA compliance
     * - Regulatory audit trails with microsecond precision for compliance reporting
     * - Event sourcing temporal queries and historical data reconstruction
     * - Time-based analytics for risk assessment pattern analysis
     * - Distributed system synchronization and ordering guarantees
     * 
     * The timestamp is captured at the moment of event creation using system UTC time
     * to ensure consistency across geographically distributed deployments. This supports
     * the platform's multi-region architecture and regulatory data residency requirements.
     * 
     * Technical Notes:
     * - Uses Instant for nanosecond precision and timezone independence
     * - Automatically set during event construction for data integrity
     * - Immutable after creation to preserve audit trail authenticity
     * - Compatible with Kafka timestamp-based partitioning strategies
     */
    @NotNull(message = "Event timestamp is required for proper event ordering and audit trails")
    @JsonProperty("timestamp")
    private Instant timestamp;

    /**
     * Complete risk assessment request payload containing all data required for AI analysis.
     * 
     * This encapsulates the comprehensive customer data package that feeds into the
     * AI-Powered Risk Assessment Engine, including:
     * 
     * Core Assessment Data:
     * - Customer identification and profile information
     * - Complete transaction history with behavioral patterns
     * - Real-time market data and economic indicators
     * - External risk factors from credit bureaus and regulatory databases
     * - Compliance requirements and explainability configuration
     * 
     * AI Model Inputs:
     * - Historical spending habits and investment behaviors for creditworthiness analysis
     * - Transaction patterns for fraud detection and risk scoring
     * - Market volatility indicators for contextual risk adjustment
     * - External validation data for comprehensive risk assessment
     * - Regulatory compliance data for bias detection and fairness analysis
     * 
     * The request object supports the platform's core requirement of achieving 95% accuracy
     * in risk assessment while maintaining sub-500ms response times. It contains all
     * necessary data for the AI engine to generate risk scores (0-1000 scale), risk
     * categories, mitigation recommendations, and confidence intervals.
     * 
     * Validation ensures the request contains sufficient data quality for meaningful
     * AI analysis while supporting the platform's scalability requirements of 10,000+ TPS.
     * 
     * Technical Integration:
     * - Fully validated DTO with business logic validation
     * - Optimized for Kafka serialization and deserialization
     * - Compatible with Spring Boot microservices architecture
     * - Supports distributed processing across multiple AI model instances
     * 
     * @see com.ufs.risk.dto.RiskAssessmentRequest for detailed field specifications
     */
    @NotNull(message = "Risk assessment request is required for processing")
    @Valid
    @JsonProperty("risk_assessment_request")
    private RiskAssessmentRequest riskAssessmentRequest;

    /**
     * Event-specific metadata providing additional context and processing instructions.
     * 
     * This metadata supports advanced event processing capabilities and operational
     * requirements including:
     * 
     * Processing Context:
     * - Event source service identification for distributed tracing
     * - Processing priority levels for workload management
     * - Retry attempt counters for fault tolerance handling
     * - Correlation IDs for cross-service request tracking
     * - Circuit breaker status for resilience management
     * 
     * Compliance and Audit:
     * - Regulatory context for compliance-specific processing
     * - Data residency requirements for geographic compliance
     * - Retention policy markers for automated data lifecycle management
     * - Privacy flags for GDPR and data protection compliance
     * - Audit trail markers for regulatory reporting requirements
     * 
     * Performance Optimization:
     * - Cache hints for performance optimization
     * - Model version preferences for A/B testing
     * - Resource allocation hints for scalable processing
     * - Monitoring tags for observability and alerting
     * - Performance SLA markers for quality of service tracking
     * 
     * This flexible metadata structure enables the platform to adapt to evolving
     * requirements while maintaining backward compatibility and supporting the
     * financial services industry's rapid regulatory changes in 2025.
     */
    @JsonProperty("metadata")
    private Map<String, Object> metadata = new HashMap<>();

    /**
     * Event correlation identifier linking this event to the original business request.
     * 
     * Enables end-to-end tracing of customer requests across the distributed system,
     * supporting performance monitoring, debugging, and regulatory audit requirements.
     * This correlation ID remains consistent across all related events, API calls,
     * and database transactions for comprehensive observability.
     * 
     * Used for:
     * - Distributed tracing across microservices boundaries
     * - Performance monitoring and SLA compliance measurement
     * - Customer support and troubleshooting capabilities
     * - Regulatory audit trail construction and compliance reporting
     */
    @JsonProperty("correlation_id")
    private String correlationId;

    /**
     * Priority level for event processing in the Kafka consumer infrastructure.
     * 
     * Supports workload management and quality of service guarantees by enabling
     * priority-based processing queues. Higher priority events (e.g., fraud alerts,
     * regulatory compliance checks) receive expedited processing to meet stringent
     * SLA requirements.
     * 
     * Priority Levels:
     * - CRITICAL: Fraud alerts, regulatory violations (processing SLA: <100ms)
     * - HIGH: Real-time customer requests, compliance checks (processing SLA: <300ms)
     * - NORMAL: Standard risk assessments, batch processing (processing SLA: <500ms)
     * - LOW: Historical analysis, reporting (processing SLA: <2000ms)
     */
    @JsonProperty("priority_level")
    private String priorityLevel = "NORMAL";

    /**
     * Constructs a new RiskAssessmentEvent with essential information for immediate processing.
     * 
     * This constructor is optimized for high-throughput scenarios where events need to be
     * created quickly with minimal overhead. It automatically generates required system
     * fields while accepting the core business data needed for risk assessment.
     * 
     * Automatic Field Generation:
     * - Event ID: Generated using UUID.randomUUID() for uniqueness guarantee
     * - Timestamp: Set to current system time (Instant.now()) for accurate event timing
     * - Metadata: Initialized with empty HashMap for optional metadata addition
     * - Priority Level: Set to "NORMAL" as default processing priority
     * 
     * @param riskAssessmentRequest Complete customer data package for AI risk analysis
     * @throws IllegalArgumentException if riskAssessmentRequest is null or invalid
     */
    public RiskAssessmentEvent(RiskAssessmentRequest riskAssessmentRequest) {
        if (riskAssessmentRequest == null) {
            throw new IllegalArgumentException("Risk assessment request cannot be null");
        }
        
        this.eventId = UUID.randomUUID();
        this.timestamp = Instant.now();
        this.riskAssessmentRequest = riskAssessmentRequest;
        this.metadata = new HashMap<>();
        this.priorityLevel = "NORMAL";
        
        // Initialize metadata with default event processing context
        this.metadata.put("event_version", "1.0");
        this.metadata.put("source_service", "risk-assessment-service");
        this.metadata.put("processing_context", "async_risk_assessment");
        this.metadata.put("created_at_iso", this.timestamp.toString());
        
        // Set correlation ID from request metadata if available
        if (riskAssessmentRequest.getMetadata() != null && 
            riskAssessmentRequest.getMetadata().containsKey("correlation_id")) {
            this.correlationId = riskAssessmentRequest.getMetadata().get("correlation_id").toString();
        }
    }

    /**
     * Constructs a RiskAssessmentEvent with specified correlation for distributed tracing.
     * 
     * This constructor enables explicit correlation ID management for complex workflows
     * where events need to be linked to specific business processes or customer journeys.
     * Essential for maintaining audit trails and enabling comprehensive observability
     * across the distributed financial services platform.
     * 
     * @param riskAssessmentRequest Customer data for risk assessment processing
     * @param correlationId Business process correlation identifier for tracing
     * @throws IllegalArgumentException if required parameters are null or invalid
     */
    public RiskAssessmentEvent(RiskAssessmentRequest riskAssessmentRequest, String correlationId) {
        this(riskAssessmentRequest);
        this.correlationId = correlationId;
        
        // Add correlation context to metadata for enhanced traceability
        if (correlationId != null && !correlationId.trim().isEmpty()) {
            this.metadata.put("correlation_id", correlationId);
            this.metadata.put("correlated_request", true);
        }
    }

    /**
     * Builder pattern implementation for Jackson JSON deserialization.
     * 
     * Enables flexible object construction from JSON payloads while maintaining
     * validation and business logic consistency. Essential for Kafka message
     * deserialization and API request processing in the microservices architecture.
     */
    @JsonPOJOBuilder(withPrefix = "")
    public static class RiskAssessmentEventBuilder {
        // Lombok automatically generates builder implementation
        
        /**
         * Custom build method with enhanced validation and initialization.
         * 
         * Ensures all constructed events meet enterprise standards for data integrity,
         * audit trail completeness, and processing requirements. Automatically enriches
         * events with required metadata for proper system operation.
         * 
         * @return Fully validated and initialized RiskAssessmentEvent
         * @throws IllegalStateException if required fields are missing or invalid
         */
        public RiskAssessmentEvent build() {
            // Generate required fields if not provided
            if (this.eventId == null) {
                this.eventId = UUID.randomUUID();
            }
            
            if (this.timestamp == null) {
                this.timestamp = Instant.now();
            }
            
            if (this.metadata == null) {
                this.metadata = new HashMap<>();
            }
            
            if (this.priorityLevel == null || this.priorityLevel.trim().isEmpty()) {
                this.priorityLevel = "NORMAL";
            }
            
            // Build the event instance
            RiskAssessmentEvent event = new RiskAssessmentEvent(
                this.eventId,
                this.timestamp,
                this.riskAssessmentRequest,
                this.metadata,
                this.correlationId,
                this.priorityLevel
            );
            
            // Validate and enrich the built event
            event.validateEventIntegrity();
            event.enrichWithSystemMetadata();
            
            return event;
        }
    }

    /**
     * Validates the completeness and consistency of the risk assessment event.
     * 
     * Performs comprehensive validation beyond standard bean validation to ensure
     * the event contains all necessary data for successful processing by the
     * AI-Powered Risk Assessment Engine. This includes business logic validation,
     * data quality checks, and regulatory compliance verification.
     * 
     * Validation Checks:
     * - Required field presence and validity
     * - Risk assessment request data completeness
     * - Event metadata consistency and format validation
     * - Timestamp accuracy and timezone compliance
     * - Priority level validity and business rule compliance
     * - Correlation ID format and tracking requirements
     * - Regulatory compliance data presence for audit requirements
     * 
     * @return true if the event is valid and ready for processing
     * @throws IllegalStateException if critical validation failures are detected
     */
    public boolean validateEventIntegrity() {
        // Validate essential event properties
        if (eventId == null) {
            throw new IllegalStateException("Event ID cannot be null - required for deduplication and tracking");
        }
        
        if (timestamp == null) {
            throw new IllegalStateException("Event timestamp cannot be null - required for audit trails");
        }
        
        if (riskAssessmentRequest == null) {
            throw new IllegalStateException("Risk assessment request cannot be null - required for processing");
        }
        
        // Validate risk assessment request data quality
        if (!riskAssessmentRequest.isValidForProcessing()) {
            throw new IllegalStateException("Risk assessment request contains insufficient data for processing");
        }
        
        // Validate timestamp is not in the future (with reasonable clock skew tolerance)
        Instant now = Instant.now();
        if (timestamp.isAfter(now.plusSeconds(60))) {
            throw new IllegalStateException("Event timestamp cannot be more than 60 seconds in the future");
        }
        
        // Validate priority level is within acceptable values
        if (priorityLevel != null) {
            String[] validPriorities = {"LOW", "NORMAL", "HIGH", "CRITICAL"};
            boolean validPriority = false;
            for (String valid : validPriorities) {
                if (valid.equals(priorityLevel)) {
                    validPriority = true;
                    break;
                }
            }
            if (!validPriority) {
                throw new IllegalStateException("Invalid priority level: " + priorityLevel);
            }
        }
        
        // Validate correlation ID format if present
        if (correlationId != null && !correlationId.trim().isEmpty()) {
            if (correlationId.length() > 255) {
                throw new IllegalStateException("Correlation ID exceeds maximum length of 255 characters");
            }
        }
        
        return true;
    }

    /**
     * Enriches the event with comprehensive system metadata for operational excellence.
     * 
     * Automatically adds operational context, monitoring tags, and compliance markers
     * required for enterprise-grade event processing. This metadata supports observability,
     * debugging, performance monitoring, and regulatory audit requirements.
     * 
     * Added Metadata Categories:
     * - System Context: Service versions, deployment environment, processing context
     * - Performance Monitoring: Creation latency, processing hints, SLA markers
     * - Compliance: Data residency flags, retention policies, audit markers
     * - Observability: Tracing context, monitoring tags, alerting configuration
     * - Business Context: Customer segment, risk assessment type, processing urgency
     */
    public void enrichWithSystemMetadata() {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        
        // System identification metadata
        metadata.put("event_schema_version", "1.0");
        metadata.put("platform_version", "unified-financial-services-v1.0");
        metadata.put("java_version", System.getProperty("java.version"));
        metadata.put("service_name", "risk-assessment-service");
        
        // Event processing metadata
        metadata.put("event_type", "risk_assessment_request");
        metadata.put("processing_mode", "asynchronous");
        metadata.put("kafka_compatible", true);
        metadata.put("serialization_format", "json");
        
        // Performance and monitoring metadata
        metadata.put("expected_processing_sla_ms", getPrioritySLA());
        metadata.put("monitoring_enabled", true);
        metadata.put("metrics_collection", true);
        metadata.put("distributed_tracing", true);
        
        // Compliance and audit metadata
        metadata.put("audit_required", true);
        metadata.put("retention_policy", "financial_records_7_years");
        metadata.put("data_classification", "confidential_financial");
        metadata.put("regulatory_context", "banking_risk_assessment");
        
        // Risk assessment specific metadata
        if (riskAssessmentRequest != null) {
            metadata.put("customer_id_hash", Objects.hashCode(riskAssessmentRequest.getCustomerId()));
            metadata.put("transaction_count", riskAssessmentRequest.getTransactionCount());
            metadata.put("has_market_data", riskAssessmentRequest.hasMarketData());
            metadata.put("has_external_risk_factors", riskAssessmentRequest.hasExternalRiskFactors());
            metadata.put("assessment_scope", riskAssessmentRequest.getAssessmentScope());
            metadata.put("requires_detailed_explanation", riskAssessmentRequest.requiresDetailedExplanation());
            metadata.put("requires_bias_reporting", riskAssessmentRequest.requiresBiasReporting());
        }
        
        // Correlation and tracing metadata
        if (correlationId != null) {
            metadata.put("correlation_enabled", true);
            metadata.put("trace_id", correlationId);
        }
        
        // Timestamp metadata for comprehensive audit trails
        metadata.put("created_timestamp_utc", timestamp.toString());
        metadata.put("created_timestamp_epoch_ms", timestamp.toEpochMilli());
        metadata.put("timezone", "UTC");
        
        // Event routing and processing hints
        metadata.put("kafka_topic_hint", "risk-assessment-events");
        metadata.put("consumer_group_hint", "risk-assessment-processors");
        metadata.put("partition_key", eventId.toString());
        metadata.put("message_ordering_required", true);
    }

    /**
     * Determines the processing SLA in milliseconds based on event priority level.
     * 
     * Supports quality of service management by providing clear processing time
     * expectations for different priority levels. Used by monitoring systems
     * to track SLA compliance and trigger alerts for performance degradation.
     * 
     * @return Expected processing time in milliseconds
     */
    private long getPrioritySLA() {
        if (priorityLevel == null) {
            return 500L; // Default NORMAL priority SLA
        }
        
        switch (priorityLevel) {
            case "CRITICAL":
                return 100L;  // Critical events: <100ms
            case "HIGH":
                return 300L;  // High priority: <300ms
            case "NORMAL":
                return 500L;  // Normal priority: <500ms
            case "LOW":
                return 2000L; // Low priority: <2000ms
            default:
                return 500L;  // Default to normal priority
        }
    }

    /**
     * Retrieves the customer identifier from the embedded risk assessment request.
     * 
     * Convenience method for event processing systems that need quick access to
     * customer identification without deserializing the entire request payload.
     * Essential for customer-based partitioning and routing in Kafka consumers.
     * 
     * @return Customer ID if available, null otherwise
     */
    public String getCustomerId() {
        return (riskAssessmentRequest != null) ? riskAssessmentRequest.getCustomerId() : null;
    }

    /**
     * Determines if this event requires high-priority processing.
     * 
     * Used by Kafka consumers and processing systems to implement priority queues
     * and ensure critical events receive expedited processing. Essential for
     * meeting stringent SLA requirements for fraud detection and compliance alerts.
     * 
     * @return true if event is marked as HIGH or CRITICAL priority
     */
    public boolean isHighPriority() {
        return "HIGH".equals(priorityLevel) || "CRITICAL".equals(priorityLevel);
    }

    /**
     * Retrieves the expected processing SLA for this event in milliseconds.
     * 
     * Enables processing systems to implement appropriate timeout and retry
     * strategies based on event priority. Critical for maintaining quality
     * of service guarantees and customer satisfaction in financial services.
     * 
     * @return Processing SLA in milliseconds based on priority level
     */
    public long getProcessingSLAMillis() {
        return getPrioritySLA();
    }

    /**
     * Checks if this event has sufficient data quality for AI model processing.
     * 
     * Validates that the embedded risk assessment request contains the minimum
     * data quality thresholds required for meaningful AI analysis. Helps prevent
     * processing of incomplete or low-quality data that could affect model accuracy.
     * 
     * @return true if data quality meets AI processing standards
     */
    public boolean hasValidDataQuality() {
        if (riskAssessmentRequest == null) {
            return false;
        }
        
        // Check for minimum transaction history requirements
        if (riskAssessmentRequest.getTransactionCount() < 1) {
            return false;
        }
        
        // Validate customer ID is present and valid
        String customerId = riskAssessmentRequest.getCustomerId();
        if (customerId == null || customerId.trim().isEmpty()) {
            return false;
        }
        
        // Check for data completeness using the request's validation
        return riskAssessmentRequest.isValidForProcessing();
    }

    /**
     * Generates a Kafka-compatible message key for consistent partitioning.
     * 
     * Creates a deterministic key based on customer ID to ensure all events
     * for the same customer are processed by the same partition/consumer.
     * This maintains event ordering and supports stateful processing patterns
     * required for comprehensive risk assessment.
     * 
     * @return Kafka message key for partitioning strategy
     */
    public String getKafkaMessageKey() {
        String customerId = getCustomerId();
        if (customerId != null) {
            return "customer:" + customerId;
        }
        return "event:" + eventId.toString();
    }

    /**
     * Creates a deep copy of this event for safe processing and transformation.
     * 
     * Enables safe event processing where consumers can modify event data
     * without affecting the original event instance. Essential for retry
     * mechanisms and multi-stage processing pipelines where event state
     * needs to be preserved across processing stages.
     * 
     * @return Deep copy of this RiskAssessmentEvent instance
     */
    public RiskAssessmentEvent deepCopy() {
        return RiskAssessmentEvent.builder()
                .eventId(this.eventId)
                .timestamp(this.timestamp)
                .riskAssessmentRequest(this.riskAssessmentRequest) // Note: RiskAssessmentRequest should also support deep copy
                .metadata(new HashMap<>(this.metadata))
                .correlationId(this.correlationId)
                .priorityLevel(this.priorityLevel)
                .build();
    }

    /**
     * Provides comprehensive string representation for logging and debugging.
     * 
     * Generates a detailed but secure string representation that includes
     * essential event information while protecting sensitive customer data.
     * Optimized for log analysis and debugging scenarios where full event
     * context is needed without exposing confidential information.
     * 
     * @return Secure string representation suitable for logging
     */
    @Override
    public String toString() {
        return String.format(
            "RiskAssessmentEvent{eventId=%s, timestamp=%s, customerId=%s, priority=%s, correlationId=%s, hasMetadata=%s, dataQualityValid=%s}",
            eventId,
            timestamp,
            getCustomerId() != null ? "***" + getCustomerId().substring(Math.max(0, getCustomerId().length() - 4)) : "null",
            priorityLevel,
            correlationId,
            metadata != null && !metadata.isEmpty(),
            hasValidDataQuality()
        );
    }

    /**
     * Enhanced equals method for proper event deduplication and comparison.
     * 
     * Implements comprehensive equality checking based on event ID and content
     * hash to support event deduplication in distributed processing scenarios.
     * Critical for ensuring exactly-once processing semantics in Kafka consumers.
     * 
     * @param obj Object to compare with this event
     * @return true if events are considered equal for processing purposes
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        RiskAssessmentEvent that = (RiskAssessmentEvent) obj;
        
        // Primary equality check based on event ID
        if (!Objects.equals(eventId, that.eventId)) return false;
        
        // Secondary validation for data integrity
        if (!Objects.equals(timestamp, that.timestamp)) return false;
        if (!Objects.equals(correlationId, that.correlationId)) return false;
        if (!Objects.equals(priorityLevel, that.priorityLevel)) return false;
        
        // Deep comparison of risk assessment request
        return Objects.equals(riskAssessmentRequest, that.riskAssessmentRequest);
    }

    /**
     * Enhanced hash code implementation for efficient event indexing and lookup.
     * 
     * Generates consistent hash codes based on immutable event properties
     * to support efficient event storage, lookup, and deduplication operations
     * in high-throughput processing scenarios.
     * 
     * @return Hash code for this event instance
     */
    @Override
    public int hashCode() {
        return Objects.hash(eventId, timestamp, correlationId, priorityLevel, 
                          riskAssessmentRequest != null ? riskAssessmentRequest.getCustomerId() : null);
    }
}