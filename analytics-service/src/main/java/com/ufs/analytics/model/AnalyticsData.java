package com.ufs.analytics.model;

import org.influxdb.annotation.Column; // InfluxDB Java Client 2.23
import org.influxdb.annotation.Measurement; // InfluxDB Java Client 2.23
import java.time.Instant; // Java 1.8
import java.util.HashMap;
import java.util.Map; // Java 1.8

/**
 * Represents a single data point for analytics to be stored in InfluxDB.
 * 
 * This class is designed to be a generic container for various types of time-series data,
 * including financial metrics and performance monitoring data. It serves as the underlying
 * data model for the predictive analytics dashboard (F-005) and real-time transaction
 * monitoring (F-008) features.
 * 
 * The class is optimized for InfluxDB 2.7+ time-series database operations, providing
 * high write throughput capabilities for financial data ingestion and analytics processing.
 * 
 * Key Use Cases:
 * - Financial metrics collection (transaction volumes, amounts, rates)
 * - Performance monitoring data (response times, throughput, error rates)
 * - Real-time transaction monitoring data points
 * - Predictive analytics feature engineering data
 * - Risk assessment historical data points
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 */
@Measurement(name = "analytics_data")
public class AnalyticsData {

    /**
     * The timestamp when this analytics data point was recorded.
     * This serves as the primary time dimension for time-series queries and aggregations.
     * All analytics data points must have a valid timestamp for proper chronological ordering.
     */
    @Column(name = "time")
    private Instant time;

    /**
     * The measurement name that categorizes this data point.
     * Examples: "transaction_metrics", "performance_data", "risk_indicators", "customer_analytics"
     * This field helps organize different types of analytics data within the same InfluxDB instance.
     */
    @Column(name = "measurement")
    private String measurement;

    /**
     * Tags are indexed metadata that provide dimensional context for the data point.
     * Tags are used for efficient querying and grouping operations in InfluxDB.
     * 
     * Common tag examples:
     * - "service_name": "payment-service"
     * - "environment": "production"
     * - "region": "us-east-1"
     * - "customer_segment": "premium"
     * - "transaction_type": "wire_transfer"
     * 
     * Tags should have low cardinality (limited unique values) for optimal performance.
     */
    @Column(name = "tags", tag = true)
    private Map<String, String> tags;

    /**
     * Fields contain the actual metric values and high-cardinality data.
     * Fields are not indexed but store the numerical and descriptive values for analysis.
     * 
     * Common field examples:
     * - "amount": 1500.75 (transaction amount)
     * - "response_time": 245 (milliseconds)
     * - "risk_score": 0.85 (normalized risk score)
     * - "customer_id": "CUST123456"
     * - "error_count": 3
     * 
     * Fields support various data types: numbers, strings, booleans
     */
    @Column(name = "fields")
    private Map<String, Object> fields;

    /**
     * Default constructor for AnalyticsData.
     * Initializes empty collections for tags and fields to prevent null pointer exceptions.
     * Sets the timestamp to the current system time by default.
     */
    public AnalyticsData() {
        this.time = Instant.now();
        this.tags = new HashMap<>();
        this.fields = new HashMap<>();
    }

    /**
     * Parameterized constructor for creating AnalyticsData with initial values.
     * 
     * @param measurement The measurement name for categorizing this data point
     * @param tags The indexed metadata tags for dimensional queries
     * @param fields The actual metric values and data fields
     */
    public AnalyticsData(String measurement, Map<String, String> tags, Map<String, Object> fields) {
        this();
        this.measurement = measurement;
        this.tags = tags != null ? new HashMap<>(tags) : new HashMap<>();
        this.fields = fields != null ? new HashMap<>(fields) : new HashMap<>();
    }

    /**
     * Constructor with explicit timestamp for historical data ingestion.
     * 
     * @param time The specific timestamp for this data point
     * @param measurement The measurement name for categorizing this data point
     * @param tags The indexed metadata tags for dimensional queries
     * @param fields The actual metric values and data fields
     */
    public AnalyticsData(Instant time, String measurement, Map<String, String> tags, Map<String, Object> fields) {
        this.time = time != null ? time : Instant.now();
        this.measurement = measurement;
        this.tags = tags != null ? new HashMap<>(tags) : new HashMap<>();
        this.fields = fields != null ? new HashMap<>(fields) : new HashMap<>();
    }

    /**
     * Gets the timestamp of the data point.
     * The timestamp represents when this analytics event occurred or was recorded.
     * 
     * @return The timestamp of the data point as an Instant
     */
    public Instant getTime() {
        return this.time;
    }

    /**
     * Sets the timestamp of the data point.
     * This method allows for explicit time setting, particularly useful for:
     * - Historical data ingestion
     * - Batch processing of older analytics data
     * - Synchronizing timestamps across distributed systems
     * 
     * @param time The timestamp to set for this data point
     */
    public void setTime(Instant time) {
        this.time = time;
    }

    /**
     * Gets the name of the measurement.
     * The measurement name serves as the primary categorization for this data point.
     * 
     * @return The name of the measurement as a String
     */
    public String getMeasurement() {
        return this.measurement;
    }

    /**
     * Sets the name of the measurement.
     * The measurement name should follow a consistent naming convention across the system.
     * Recommended format: lowercase with underscores (e.g., "transaction_metrics")
     * 
     * @param measurement The measurement name to set
     */
    public void setMeasurement(String measurement) {
        this.measurement = measurement;
    }

    /**
     * Gets the tags for the data point.
     * Tags are returned as a new HashMap to prevent external modification of the internal state.
     * This ensures data integrity and prevents accidental mutations.
     * 
     * @return A new Map containing the tags for the data point
     */
    public Map<String, String> getTags() {
        return this.tags != null ? new HashMap<>(this.tags) : new HashMap<>();
    }

    /**
     * Sets the tags for the data point.
     * Creates a defensive copy of the input map to prevent external modifications.
     * Tags should be used for dimensions that have relatively low cardinality.
     * 
     * @param tags The tags to set for this data point
     */
    public void setTags(Map<String, String> tags) {
        this.tags = tags != null ? new HashMap<>(tags) : new HashMap<>();
    }

    /**
     * Adds a single tag to the existing tags collection.
     * Convenience method for incrementally building tag sets.
     * 
     * @param key The tag key
     * @param value The tag value
     */
    public void addTag(String key, String value) {
        if (this.tags == null) {
            this.tags = new HashMap<>();
        }
        this.tags.put(key, value);
    }

    /**
     * Gets the fields for the data point.
     * Fields are returned as a new HashMap to prevent external modification.
     * Fields contain the actual metric values and can have high cardinality.
     * 
     * @return A new Map containing the fields for the data point
     */
    public Map<String, Object> getFields() {
        return this.fields != null ? new HashMap<>(this.fields) : new HashMap<>();
    }

    /**
     * Sets the fields for the data point.
     * Creates a defensive copy of the input map to maintain data integrity.
     * Fields can contain various data types: Integer, Long, Double, String, Boolean
     * 
     * @param fields The fields to set for this data point
     */
    public void setFields(Map<String, Object> fields) {
        this.fields = fields != null ? new HashMap<>(fields) : new HashMap<>();
    }

    /**
     * Adds a single field to the existing fields collection.
     * Convenience method for incrementally building field sets.
     * 
     * @param key The field key
     * @param value The field value (can be any supported InfluxDB data type)
     */
    public void addField(String key, Object value) {
        if (this.fields == null) {
            this.fields = new HashMap<>();
        }
        this.fields.put(key, value);
    }

    /**
     * Validates that this AnalyticsData instance has the minimum required data.
     * Checks for presence of timestamp, measurement name, and at least one field.
     * 
     * @return true if the data point is valid for InfluxDB insertion
     */
    public boolean isValid() {
        return this.time != null && 
               this.measurement != null && 
               !this.measurement.trim().isEmpty() &&
               this.fields != null && 
               !this.fields.isEmpty();
    }

    /**
     * Creates a string representation of this AnalyticsData instance.
     * Useful for debugging and logging purposes.
     * 
     * @return A formatted string containing the key attributes of this data point
     */
    @Override
    public String toString() {
        return String.format(
            "AnalyticsData{time=%s, measurement='%s', tags=%d, fields=%d}",
            this.time,
            this.measurement,
            this.tags != null ? this.tags.size() : 0,
            this.fields != null ? this.fields.size() : 0
        );
    }

    /**
     * Compares this AnalyticsData with another object for equality.
     * Two AnalyticsData objects are considered equal if they have the same
     * timestamp, measurement, tags, and fields.
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        AnalyticsData that = (AnalyticsData) obj;
        
        if (time != null ? !time.equals(that.time) : that.time != null) return false;
        if (measurement != null ? !measurement.equals(that.measurement) : that.measurement != null) return false;
        if (tags != null ? !tags.equals(that.tags) : that.tags != null) return false;
        return fields != null ? fields.equals(that.fields) : that.fields == null;
    }

    /**
     * Generates a hash code for this AnalyticsData instance.
     * Used for efficient storage in hash-based collections.
     * 
     * @return The hash code for this object
     */
    @Override
    public int hashCode() {
        int result = time != null ? time.hashCode() : 0;
        result = 31 * result + (measurement != null ? measurement.hashCode() : 0);
        result = 31 * result + (tags != null ? tags.hashCode() : 0);
        result = 31 * result + (fields != null ? fields.hashCode() : 0);
        return result;
    }

    /**
     * Creates a deep copy of this AnalyticsData instance.
     * Useful for creating modified versions without affecting the original.
     * 
     * @return A new AnalyticsData instance with copied values
     */
    public AnalyticsData copy() {
        return new AnalyticsData(
            this.time,
            this.measurement,
            this.tags,
            this.fields
        );
    }
}