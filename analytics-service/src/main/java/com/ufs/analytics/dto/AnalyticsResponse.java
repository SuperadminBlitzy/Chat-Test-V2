package com.ufs.analytics.dto;

import lombok.Data; // org.projectlombok:lombok:1.18.30
import java.time.LocalDateTime; // java.time:1.8
import java.util.Map; // java.util:1.8

/**
 * Data Transfer Object (DTO) representing the response from an analytics request.
 * 
 * This class encapsulates the results of an analytics query, such as data for a report 
 * or a dashboard. It serves as the primary response container for analytics operations
 * supporting both predictive analytics dashboards and real-time transaction monitoring.
 * 
 * Features Supported:
 * - F-005: Predictive Analytics Dashboard - Provides structured data for analytics dashboards
 * - F-008: Real-time Transaction Monitoring - Carries analytics data for transaction monitoring
 * 
 * The class follows enterprise-grade patterns with immutable timestamps, structured data 
 * containers, and comprehensive status tracking for reliable analytics data transmission
 * in the unified financial services platform.
 * 
 * @author UFS Analytics Service
 * @version 1.0
 * @since 1.0
 */
@Data
public class AnalyticsResponse {
    
    /**
     * Unique identifier for the analytics report or query execution.
     * 
     * This ID serves as a correlation identifier that can be used for:
     * - Tracking analytics requests across microservices
     * - Audit logging and compliance reporting
     * - Caching and result retrieval optimization
     * - Debugging and troubleshooting analytics operations
     * 
     * Format: UUID or custom identifier pattern based on business requirements
     * Example: "RPT-2025-001-PRED-ANALYTICS" or "550e8400-e29b-41d4-a716-446655440000"
     */
    private String reportId;
    
    /**
     * Status of the analytics request processing.
     * 
     * Indicates the current state of the analytics operation:
     * - "SUCCESS": Analytics processing completed successfully
     * - "PARTIAL": Some data processed, may have warnings or missing data points
     * - "FAILED": Analytics processing failed due to errors
     * - "PROCESSING": Request is still being processed (for async operations)
     * - "CACHED": Results served from cache for performance optimization
     * 
     * This status enables proper error handling and user experience optimization
     * in both dashboard and real-time monitoring scenarios.
     */
    private String status;
    
    /**
     * Timestamp indicating when the analytics response was generated.
     * 
     * Uses LocalDateTime to provide precise timing information for:
     * - Data freshness validation in real-time monitoring
     * - Audit trails for regulatory compliance
     * - Performance monitoring and SLA tracking
     * - Cache invalidation and data lifecycle management
     * 
     * The timestamp reflects when the analytics computation completed,
     * not when the request was initiated, ensuring accurate data age information.
     */
    private LocalDateTime generatedAt;
    
    /**
     * Container for the actual analytics data and results.
     * 
     * This flexible Map structure supports various analytics use cases:
     * 
     * For Predictive Analytics Dashboard (F-005):
     * - "predictions": Future trend forecasts and predictive models
     * - "confidence_scores": Statistical confidence intervals
     * - "risk_metrics": Risk assessment scores and thresholds
     * - "recommendations": AI-generated actionable insights
     * 
     * For Real-time Transaction Monitoring (F-008):
     * - "transaction_volume": Current transaction processing rates
     * - "anomaly_scores": Fraud detection and anomaly indicators
     * - "performance_metrics": System performance and latency data
     * - "alerts": Real-time alerts and threshold breaches
     * 
     * Additional common data elements:
     * - "metadata": Query parameters, filters, and execution context
     * - "charts": Chart data for visualization components
     * - "aggregations": Statistical summaries and grouped data
     * - "raw_data": Detailed underlying data when required
     * 
     * The Object value type provides maximum flexibility for complex nested
     * data structures including Lists, Maps, custom POJOs, and primitive types.
     */
    private Map<String, Object> data;
    
    /**
     * Default constructor for AnalyticsResponse.
     * 
     * Creates an empty AnalyticsResponse instance suitable for builder pattern usage
     * or gradual population through setter methods. The @Data annotation from Lombok
     * automatically generates getters, setters, toString, equals, and hashCode methods.
     * 
     * This constructor enables:
     * - Spring framework instantiation and dependency injection
     * - JSON deserialization from REST API requests
     * - JPA entity mapping when used in database contexts
     * - Builder pattern implementation for fluent object creation
     */
    public AnalyticsResponse() {
        // Default constructor automatically provided by Lombok @Data annotation
        // Lombok generates all boilerplate code including:
        // - Getter methods for all fields
        // - Setter methods for all fields  
        // - toString() method with all field values
        // - equals() and hashCode() methods based on all fields
        // - Constructor parameters for final fields (none in this case)
    }
}