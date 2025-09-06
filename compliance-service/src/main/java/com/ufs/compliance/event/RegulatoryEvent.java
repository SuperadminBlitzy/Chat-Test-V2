package com.ufs.compliance.event;

import java.io.Serializable; // version: Java 21 LTS
import java.util.Date;
import java.util.Objects;

/**
 * Represents an event related to a regulatory change in the Unified Financial Services platform.
 * 
 * This event is published to a Kafka topic when a new regulatory rule is created or an existing 
 * one is updated. The event supports the F-003: Regulatory Compliance Automation feature by 
 * enabling real-time regulatory change monitoring and automated policy updates within 24 hours 
 * of regulatory changes.
 * 
 * Downstream services can consume this event to react to regulatory changes, ensuring 
 * system-wide compliance monitoring and automated reporting across multiple regulatory frameworks.
 * 
 * Event-driven architecture ensures that regulatory changes are propagated in real-time across 
 * all system components, supporting the requirement for continuous compliance assessments and 
 * unified risk scoring.
 * 
 * @author UFS Compliance Team
 * @version 1.0
 * @since 2025-01-01
 */
public class RegulatoryEvent implements Serializable {
    
    /**
     * Serial version UID for serialization compatibility.
     * This ensures that the object can be properly serialized and deserialized 
     * across different versions of the application and when transmitted over Kafka.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Unique identifier for this regulatory event.
     * Used for event deduplication, tracing, and audit trail purposes.
     * This ID should be unique across all regulatory events in the system.
     */
    private String eventId;
    
    /**
     * Identifier of the regulatory rule that triggered this event.
     * References the specific rule in the regulatory database that was 
     * either created or modified, enabling downstream services to fetch 
     * detailed rule information if needed.
     */
    private String ruleId;
    
    /**
     * Type of change that occurred to the regulatory rule.
     * Common values include:
     * - "CREATED" - New regulatory rule has been added
     * - "UPDATED" - Existing regulatory rule has been modified  
     * - "ACTIVATED" - Rule has been activated/enabled
     * - "DEACTIVATED" - Rule has been deactivated/disabled
     * - "DELETED" - Rule has been removed (soft delete)
     * 
     * This enables downstream services to handle different types of 
     * regulatory changes appropriately.
     */
    private String changeType;
    
    /**
     * Timestamp when the regulatory change occurred.
     * This is critical for audit trails, compliance reporting, and ensuring 
     * the system meets the 24-hour regulatory update cycle requirement.
     * Used for chronological ordering of events and compliance timeline tracking.
     */
    private Date timestamp;
    
    /**
     * Default constructor required for serialization frameworks and 
     * object mapping libraries used in Kafka event processing.
     */
    public RegulatoryEvent() {
        // Default constructor for serialization
    }
    
    /**
     * Initializes a new RegulatoryEvent object with all required properties.
     * 
     * This constructor ensures that all critical event data is provided 
     * at object creation time, maintaining data integrity and supporting 
     * the regulatory compliance automation requirements.
     * 
     * @param eventId Unique identifier for this regulatory event, must not be null or empty
     * @param ruleId Identifier of the regulatory rule that triggered this event, must not be null or empty  
     * @param changeType Type of change that occurred (e.g., CREATED, UPDATED, ACTIVATED), must not be null or empty
     * @param timestamp Timestamp when the regulatory change occurred, must not be null
     * 
     * @throws IllegalArgumentException if any parameter is null or empty (for string parameters)
     */
    public RegulatoryEvent(String eventId, String ruleId, String changeType, Date timestamp) {
        // Validate input parameters to ensure data integrity
        if (eventId == null || eventId.trim().isEmpty()) {
            throw new IllegalArgumentException("Event ID cannot be null or empty");
        }
        if (ruleId == null || ruleId.trim().isEmpty()) {
            throw new IllegalArgumentException("Rule ID cannot be null or empty");
        }
        if (changeType == null || changeType.trim().isEmpty()) {
            throw new IllegalArgumentException("Change type cannot be null or empty");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null");
        }
        
        // Assign the eventId to the eventId property
        this.eventId = eventId.trim();
        
        // Assign the ruleId to the ruleId property  
        this.ruleId = ruleId.trim();
        
        // Assign the changeType to the changeType property
        this.changeType = changeType.trim().toUpperCase(); // Normalize to uppercase for consistency
        
        // Assign the timestamp to the timestamp property
        // Create a defensive copy to prevent external modification
        this.timestamp = new Date(timestamp.getTime());
    }
    
    /**
     * Gets the unique identifier for this regulatory event.
     * 
     * @return The event ID as a string
     */
    public String getEventId() {
        return eventId;
    }
    
    /**
     * Sets the unique identifier for this regulatory event.
     * 
     * @param eventId The event ID to set, must not be null or empty
     * @throws IllegalArgumentException if eventId is null or empty
     */
    public void setEventId(String eventId) {
        if (eventId == null || eventId.trim().isEmpty()) {
            throw new IllegalArgumentException("Event ID cannot be null or empty");
        }
        this.eventId = eventId.trim();
    }
    
    /**
     * Gets the identifier of the regulatory rule that triggered this event.
     * 
     * @return The rule ID as a string
     */
    public String getRuleId() {
        return ruleId;
    }
    
    /**
     * Sets the identifier of the regulatory rule that triggered this event.
     * 
     * @param ruleId The rule ID to set, must not be null or empty
     * @throws IllegalArgumentException if ruleId is null or empty
     */
    public void setRuleId(String ruleId) {
        if (ruleId == null || ruleId.trim().isEmpty()) {
            throw new IllegalArgumentException("Rule ID cannot be null or empty");
        }
        this.ruleId = ruleId.trim();
    }
    
    /**
     * Gets the type of change that occurred to the regulatory rule.
     * 
     * @return The change type as a string
     */
    public String getChangeType() {
        return changeType;
    }
    
    /**
     * Sets the type of change that occurred to the regulatory rule.
     * 
     * @param changeType The change type to set, must not be null or empty
     * @throws IllegalArgumentException if changeType is null or empty
     */
    public void setChangeType(String changeType) {
        if (changeType == null || changeType.trim().isEmpty()) {
            throw new IllegalArgumentException("Change type cannot be null or empty");
        }
        this.changeType = changeType.trim().toUpperCase(); // Normalize to uppercase for consistency
    }
    
    /**
     * Gets the timestamp when the regulatory change occurred.
     * 
     * @return A copy of the timestamp to prevent external modification
     */
    public Date getTimestamp() {
        // Return a defensive copy to prevent external modification
        return timestamp != null ? new Date(timestamp.getTime()) : null;
    }
    
    /**
     * Sets the timestamp when the regulatory change occurred.
     * 
     * @param timestamp The timestamp to set, must not be null
     * @throws IllegalArgumentException if timestamp is null
     */
    public void setTimestamp(Date timestamp) {
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null");
        }
        // Create a defensive copy to prevent external modification
        this.timestamp = new Date(timestamp.getTime());
    }
    
    /**
     * Compares this RegulatoryEvent with another object for equality.
     * Two RegulatoryEvent objects are considered equal if all their properties are equal.
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        
        RegulatoryEvent that = (RegulatoryEvent) obj;
        return Objects.equals(eventId, that.eventId) &&
               Objects.equals(ruleId, that.ruleId) &&
               Objects.equals(changeType, that.changeType) &&
               Objects.equals(timestamp, that.timestamp);
    }
    
    /**
     * Generates a hash code for this RegulatoryEvent object.
     * The hash code is computed based on all properties of the object.
     * 
     * @return The hash code value for this object
     */
    @Override
    public int hashCode() {
        return Objects.hash(eventId, ruleId, changeType, timestamp);
    }
    
    /**
     * Returns a string representation of this RegulatoryEvent object.
     * Useful for logging, debugging, and audit trail purposes in compliance monitoring.
     * 
     * @return A string representation containing all properties of the event
     */
    @Override
    public String toString() {
        return String.format(
            "RegulatoryEvent{eventId='%s', ruleId='%s', changeType='%s', timestamp=%s}",
            eventId, ruleId, changeType, timestamp
        );
    }
    
    /**
     * Validates that this RegulatoryEvent object contains all required data.
     * This method can be used before publishing the event to Kafka to ensure data integrity.
     * 
     * @return true if the event is valid, false otherwise
     */
    public boolean isValid() {
        return eventId != null && !eventId.trim().isEmpty() &&
               ruleId != null && !ruleId.trim().isEmpty() &&
               changeType != null && !changeType.trim().isEmpty() &&
               timestamp != null;
    }
    
    /**
     * Creates a formatted message suitable for audit logging.
     * This supports the audit trail management requirement (F-003-RQ-004) 
     * by providing a standardized log format for compliance activities.
     * 
     * @return A formatted audit message string
     */
    public String toAuditMessage() {
        return String.format(
            "REGULATORY_EVENT: Rule %s was %s at %s (Event ID: %s)",
            ruleId, changeType.toLowerCase(), timestamp, eventId
        );
    }
}