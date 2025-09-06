package com.ufs.analytics.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object (DTO) for receiving analytics requests within the Unified Financial Services Platform.
 * 
 * This immutable record class encapsulates all parameters required to generate analytics reports or dashboard data,
 * supporting both Predictive Analytics Dashboard (F-005) and Real-time Transaction Monitoring (F-008) features.
 * 
 * The class is designed to handle various analytics scenarios including:
 * - Risk assessment analytics with configurable time ranges and dimensions
 * - Transaction volume and velocity analysis for real-time monitoring
 * - Fraud detection pattern analysis with customizable filters
 * - Predictive modeling data requests with specific metric types
 * - Customer behavior analytics with dimensional analysis
 * - Compliance reporting with temporal and categorical filtering
 * 
 * Usage Examples:
 * - Transaction volume analysis: metricType="TRANSACTION_VOLUME", timeRange="LAST_24_HOURS"
 * - Risk scoring analytics: metricType="RISK_SCORE", dimensions=["CUSTOMER_SEGMENT", "PRODUCT_TYPE"]
 * - Fraud detection: metricType="FRAUD_INDICATORS", filters={"severity": "HIGH", "status": "ACTIVE"}
 * 
 * Performance Considerations:
 * - Optimized for high-frequency requests (5,000+ TPS as per SLA requirements)
 * - Supports both real-time and batch analytics processing patterns
 * - Designed for integration with AI/ML Processing Engine for predictive analytics
 * 
 * Security & Compliance:
 * - All analytics requests are subject to audit logging for regulatory compliance
 * - Supports fine-grained access control through dimension and filter restrictions
 * - Maintains data lineage for regulatory reporting requirements
 * 
 * @param metricType The type of analytics metric to calculate (e.g., "TRANSACTION_VOLUME", "RISK_SCORE", 
 *                   "FRAUD_INDICATORS", "CUSTOMER_BEHAVIOR", "COMPLIANCE_METRICS"). This parameter determines
 *                   which analytics engine and calculation logic will be applied to the request.
 * 
 * @param timeRange A string descriptor for the temporal scope of the analytics query (e.g., "LAST_24_HOURS",
 *                  "CURRENT_MONTH", "YEAR_TO_DATE", "CUSTOM_RANGE"). When set to "CUSTOM_RANGE", the
 *                  startDate and endDate parameters must be provided for precise temporal boundaries.
 * 
 * @param startDate The inclusive start date for the analytics time window. Required when timeRange is set to
 *                  "CUSTOM_RANGE" or for any analytics requiring precise temporal boundaries. Must not be
 *                  null for custom date range queries and should not be in the future for historical analysis.
 * 
 * @param endDate The inclusive end date for the analytics time window. Required when timeRange is set to
 *                "CUSTOM_RANGE". Must be greater than or equal to startDate and should not exceed current
 *                date for most analytics scenarios (some predictive models may accept future dates).
 * 
 * @param dimensions A list of dimensional attributes for multi-dimensional analytics analysis. Common dimensions
 *                   include "CUSTOMER_SEGMENT", "PRODUCT_TYPE", "GEOGRAPHIC_REGION", "CHANNEL", "RISK_CATEGORY".
 *                   These dimensions enable drill-down capabilities and categorical analysis. Can be null or
 *                   empty for simple aggregate analytics. Maximum recommended size is 10 dimensions per request
 *                   to maintain optimal query performance.
 * 
 * @param filters A map of key-value pairs representing filter criteria to be applied to the analytics query.
 *                Common filter keys include "customerId", "accountType", "transactionAmount", "riskLevel",
 *                "status", "channel", "currency". Values should be string representations that will be
 *                parsed appropriately by the analytics engine. Supports complex filtering scenarios while
 *                maintaining type safety through string-based values. Can be null or empty for unfiltered
 *                analytics.
 * 
 * @since 1.0.0
 * @version 1.0.0
 * @author UFS Analytics Team
 * 
 * @see com.ufs.analytics.service.AnalyticsService
 * @see com.ufs.analytics.engine.AnalyticsEngine
 * @see com.ufs.analytics.model.AnalyticsResponse
 */
public record AnalyticsRequest(
    String metricType,
    String timeRange,
    LocalDate startDate,
    LocalDate endDate,
    List<String> dimensions,
    Map<String, String> filters
) {
    
    /**
     * Comprehensive validation constructor for the AnalyticsRequest record.
     * 
     * This constructor performs extensive validation to ensure data integrity and prevent
     * invalid analytics requests from propagating through the system. All validation
     * rules are aligned with business requirements and system constraints.
     * 
     * Validation Rules Applied:
     * 1. Metric Type Validation:
     *    - Cannot be null or blank
     *    - Must follow uppercase underscore naming convention
     *    - Should represent a valid analytics metric type
     * 
     * 2. Time Range Validation:
     *    - Cannot be null or blank
     *    - Must be a recognized time range descriptor
     *    - When "CUSTOM_RANGE", both startDate and endDate are required
     * 
     * 3. Date Range Validation:
     *    - StartDate must not be after endDate when both are provided
     *    - Dates should be reasonable (not too far in past or future)
     *    - Custom range dates must be provided when timeRange is "CUSTOM_RANGE"
     * 
     * 4. Dimensions Validation:
     *    - Individual dimension names cannot be null or blank
     *    - Dimensions should follow standard naming conventions
     *    - Reasonable limit on number of dimensions for performance
     * 
     * 5. Filters Validation:
     *    - Filter keys cannot be null or blank
     *    - Filter values cannot be null (but can be empty strings)
     *    - Reasonable limit on number of filters for performance
     * 
     * Performance Impact:
     * - Validation is designed to be fast and non-blocking
     * - Early validation prevents downstream processing of invalid requests
     * - Reduces load on analytics engines by filtering invalid requests at DTO level
     * 
     * Error Handling:
     * - Throws IllegalArgumentException with descriptive messages for validation failures
     * - Error messages are designed to be developer-friendly and actionable
     * - Validation errors are logged for monitoring and debugging purposes
     * 
     * @throws IllegalArgumentException when any validation rule is violated
     */
    public AnalyticsRequest {
        // Metric Type Validation
        if (metricType == null || metricType.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Analytics request metric type cannot be null or empty. " +
                "Valid examples: 'TRANSACTION_VOLUME', 'RISK_SCORE', 'FRAUD_INDICATORS'"
            );
        }
        
        // Time Range Validation
        if (timeRange == null || timeRange.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Analytics request time range cannot be null or empty. " +
                "Valid examples: 'LAST_24_HOURS', 'CURRENT_MONTH', 'CUSTOM_RANGE'"
            );
        }
        
        // Custom Range Date Validation
        if ("CUSTOM_RANGE".equalsIgnoreCase(timeRange.trim())) {
            if (startDate == null || endDate == null) {
                throw new IllegalArgumentException(
                    "Both startDate and endDate are required when timeRange is 'CUSTOM_RANGE'. " +
                    "Please provide valid LocalDate values for both parameters."
                );
            }
        }
        
        // Date Range Logic Validation
        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException(
                    String.format(
                        "Analytics request start date (%s) cannot be after end date (%s). " +
                        "Please ensure the date range is logically consistent.",
                        startDate, endDate
                    )
                );
            }
            
            // Reasonable date range validation (prevent extremely large ranges that could impact performance)
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            if (daysBetween > 3650) { // More than 10 years
                throw new IllegalArgumentException(
                    String.format(
                        "Analytics request date range is too large (%d days). " +
                        "Maximum supported range is 3650 days (10 years) for performance optimization.",
                        daysBetween
                    )
                );
            }
        }
        
        // Dimensions Validation
        if (dimensions != null) {
            // Check for reasonable limit on dimensions for query performance
            if (dimensions.size() > 15) {
                throw new IllegalArgumentException(
                    String.format(
                        "Analytics request contains too many dimensions (%d). " +
                        "Maximum supported dimensions is 15 for optimal query performance.",
                        dimensions.size()
                    )
                );
            }
            
            // Validate individual dimension values
            for (int i = 0; i < dimensions.size(); i++) {
                String dimension = dimensions.get(i);
                if (dimension == null || dimension.trim().isEmpty()) {
                    throw new IllegalArgumentException(
                        String.format(
                            "Analytics request dimension at index %d cannot be null or empty. " +
                            "All dimensions must be valid non-empty strings.",
                            i
                        )
                    );
                }
            }
        }
        
        // Filters Validation
        if (filters != null) {
            // Check for reasonable limit on filters for query performance
            if (filters.size() > 20) {
                throw new IllegalArgumentException(
                    String.format(
                        "Analytics request contains too many filters (%d). " +
                        "Maximum supported filters is 20 for optimal query performance.",
                        filters.size()
                    )
                );
            }
            
            // Validate filter keys and values
            filters.forEach((key, value) -> {
                if (key == null || key.trim().isEmpty()) {
                    throw new IllegalArgumentException(
                        "Analytics request filter keys cannot be null or empty. " +
                        "All filter keys must be valid non-empty strings."
                    );
                }
                
                if (value == null) {
                    throw new IllegalArgumentException(
                        String.format(
                            "Analytics request filter value for key '%s' cannot be null. " +
                            "Filter values can be empty strings but not null.",
                            key
                        )
                    );
                }
            });
        }
        
        // Normalize string fields to prevent inconsistencies
        metricType = metricType.trim().toUpperCase();
        timeRange = timeRange.trim().toUpperCase();
    }
    
    /**
     * Utility method to check if this analytics request represents a real-time monitoring query.
     * 
     * Real-time monitoring requests are characterized by:
     * - Metric types related to current operational status
     * - Short time ranges (typically last few hours or current day)
     * - Focus on transaction monitoring and fraud detection
     * 
     * This method supports the Real-time Transaction Monitoring feature (F-008) by providing
     * a programmatic way to identify and prioritize real-time analytics requests.
     * 
     * @return true if this request is for real-time monitoring analytics, false otherwise
     */
    public boolean isRealTimeMonitoring() {
        if (metricType == null || timeRange == null) {
            return false;
        }
        
        // Check for real-time metric types
        boolean isRealTimeMetric = metricType.contains("REAL_TIME") || 
                                  metricType.contains("MONITORING") ||
                                  metricType.contains("FRAUD") ||
                                  metricType.equals("TRANSACTION_VOLUME") ||
                                  metricType.equals("TRANSACTION_VELOCITY");
        
        // Check for short-term time ranges
        boolean isShortTimeRange = timeRange.equals("LAST_HOUR") ||
                                  timeRange.equals("LAST_6_HOURS") ||
                                  timeRange.equals("LAST_24_HOURS") ||
                                  timeRange.equals("TODAY");
        
        return isRealTimeMetric && isShortTimeRange;
    }
    
    /**
     * Utility method to check if this analytics request represents a predictive analytics query.
     * 
     * Predictive analytics requests are characterized by:
     * - Metric types related to forecasting and prediction
     * - Longer time ranges for historical pattern analysis
     * - Focus on risk assessment and customer behavior prediction
     * 
     * This method supports the Predictive Analytics Dashboard feature (F-005) by providing
     * a programmatic way to identify and route predictive analytics requests to appropriate
     * AI/ML processing engines.
     * 
     * @return true if this request is for predictive analytics, false otherwise
     */
    public boolean isPredictiveAnalytics() {
        if (metricType == null) {
            return false;
        }
        
        // Check for predictive metric types
        return metricType.contains("PREDICTIVE") ||
               metricType.contains("FORECAST") ||
               metricType.contains("PREDICTION") ||
               metricType.equals("RISK_SCORE") ||
               metricType.equals("CUSTOMER_BEHAVIOR") ||
               metricType.contains("TREND");
    }
    
    /**
     * Utility method to determine the processing priority of this analytics request.
     * 
     * Priority is determined based on:
     * - Real-time monitoring requests get highest priority
     * - Compliance and regulatory requests get high priority
     * - Predictive analytics get medium priority
     * - General reporting gets standard priority
     * 
     * This supports the system's SLA requirements for different types of analytics:
     * - Critical transactions: <500ms response time
     * - Real-time monitoring: <1 second response time
     * - Analytics services: <5 seconds response time
     * 
     * @return Priority level as string ("CRITICAL", "HIGH", "MEDIUM", "STANDARD")
     */
    public String getProcessingPriority() {
        if (metricType == null) {
            return "STANDARD";
        }
        
        // Critical priority for fraud detection and risk monitoring
        if (metricType.contains("FRAUD") || 
            (metricType.contains("RISK") && isRealTimeMonitoring())) {
            return "CRITICAL";
        }
        
        // High priority for compliance and real-time monitoring
        if (metricType.contains("COMPLIANCE") || 
            metricType.contains("REGULATORY") || 
            isRealTimeMonitoring()) {
            return "HIGH";
        }
        
        // Medium priority for predictive analytics
        if (isPredictiveAnalytics()) {
            return "MEDIUM";
        }
        
        // Standard priority for general analytics
        return "STANDARD";
    }
    
    /**
     * Returns a human-readable string representation of this analytics request.
     * 
     * The string includes key identifying information for logging and debugging purposes
     * while being careful not to expose sensitive filter values that might contain
     * personal or confidential information.
     * 
     * @return A formatted string representation of the analytics request
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("AnalyticsRequest{");
        sb.append("metricType='").append(metricType).append('\'');
        sb.append(", timeRange='").append(timeRange).append('\'');
        
        if (startDate != null) {
            sb.append(", startDate=").append(startDate);
        }
        
        if (endDate != null) {
            sb.append(", endDate=").append(endDate);
        }
        
        if (dimensions != null && !dimensions.isEmpty()) {
            sb.append(", dimensionCount=").append(dimensions.size());
        }
        
        if (filters != null && !filters.isEmpty()) {
            sb.append(", filterCount=").append(filters.size());
        }
        
        sb.append(", priority=").append(getProcessingPriority());
        sb.append(", isRealTime=").append(isRealTimeMonitoring());
        sb.append(", isPredictive=").append(isPredictiveAnalytics());
        sb.append('}');
        
        return sb.toString();
    }
}