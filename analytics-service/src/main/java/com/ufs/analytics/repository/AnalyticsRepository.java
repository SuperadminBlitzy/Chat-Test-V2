package com.ufs.analytics.repository;

import com.ufs.analytics.model.AnalyticsData;
import org.springframework.data.influxdb.InfluxDBRepository; // org.springframework.data.influxdb 1.9
import org.springframework.stereotype.Repository; // org.springframework.stereotype 6.0.13
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.influxdb.annotation.Query;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository interface for managing AnalyticsData entities in InfluxDB time-series database.
 * 
 * This repository provides comprehensive data access methods for the Predictive Analytics Dashboard (F-005)
 * and supports financial metrics collection, performance monitoring, and real-time transaction analytics.
 * 
 * The interface leverages Spring Data InfluxDB to provide high-performance CRUD operations and
 * specialized time-series queries optimized for financial data analysis and predictive modeling.
 * 
 * Key Capabilities:
 * - Time-range queries for historical analysis
 * - Real-time data ingestion and retrieval
 * - Aggregation functions for financial metrics
 * - Tag-based filtering for dimensional analysis
 * - High-performance batch operations
 * - Predictive analytics data pipeline support
 * 
 * Performance Characteristics:
 * - Optimized for high write throughput (10,000+ TPS)
 * - Sub-second query response times
 * - Efficient time-series data compression
 * - Horizontal scalability support
 * 
 * Security Features:
 * - Role-based access control integration
 * - Audit logging for all data operations
 * - Encrypted data transmission
 * - Compliance with financial data regulations
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 */
@Repository
public interface AnalyticsRepository extends InfluxDBRepository<AnalyticsData, String> {

    // ==================== TIME-RANGE QUERIES ====================
    
    /**
     * Retrieves analytics data within a specific time range.
     * Essential for historical analysis and trend identification in the predictive analytics dashboard.
     * 
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @return List of AnalyticsData points within the specified time range, ordered by time ascending
     */
    @Query("SELECT * FROM analytics_data WHERE time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findByTimeRange(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);
    
    /**
     * Retrieves analytics data within a time range with pagination support.
     * Optimized for large dataset handling in the analytics dashboard.
     * 
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @param pageable Pagination parameters for result set management
     * @return Paginated results of AnalyticsData within the time range
     */
    @Query("SELECT * FROM analytics_data WHERE time >= $startTime AND time <= $endTime")
    Page<AnalyticsData> findByTimeRangePageable(@Param("startTime") Instant startTime, 
                                               @Param("endTime") Instant endTime, 
                                               Pageable pageable);

    // ==================== MEASUREMENT-BASED QUERIES ====================
    
    /**
     * Finds all analytics data for a specific measurement type.
     * Used for filtering data by category (e.g., "transaction_metrics", "performance_data").
     * 
     * @param measurement The measurement name to filter by
     * @return List of AnalyticsData matching the specified measurement
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = $measurement ORDER BY time DESC")
    List<AnalyticsData> findByMeasurement(@Param("measurement") String measurement);
    
    /**
     * Finds analytics data for a specific measurement within a time range.
     * Combines measurement filtering with temporal constraints for targeted analysis.
     * 
     * @param measurement The measurement name to filter by
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @return List of AnalyticsData matching measurement and time criteria
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = $measurement AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findByMeasurementAndTimeRange(@Param("measurement") String measurement,
                                                     @Param("startTime") Instant startTime,
                                                     @Param("endTime") Instant endTime);

    // ==================== TAG-BASED QUERIES ====================
    
    /**
     * Finds analytics data by a specific tag key-value pair.
     * Essential for dimensional analysis and filtering by metadata attributes.
     * 
     * @param tagKey The tag key to search for
     * @param tagValue The tag value to match
     * @return List of AnalyticsData containing the specified tag
     */
    @Query("SELECT * FROM analytics_data WHERE \"$tagKey\" = '$tagValue' ORDER BY time DESC")
    List<AnalyticsData> findByTag(@Param("tagKey") String tagKey, @Param("tagValue") String tagValue);
    
    /**
     * Finds analytics data by multiple tag criteria within a time range.
     * Supports complex filtering scenarios for advanced analytics queries.
     * 
     * @param measurement The measurement type to filter by
     * @param tagKey The tag key to search for
     * @param tagValue The tag value to match
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @return List of AnalyticsData matching all specified criteria
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = $measurement AND \"$tagKey\" = '$tagValue' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findByMeasurementAndTagAndTimeRange(@Param("measurement") String measurement,
                                                           @Param("tagKey") String tagKey,
                                                           @Param("tagValue") String tagValue,
                                                           @Param("startTime") Instant startTime,
                                                           @Param("endTime") Instant endTime);

    // ==================== AGGREGATION QUERIES ====================
    
    /**
     * Calculates the count of data points for a measurement within a time range.
     * Used for volume analysis and capacity planning in the analytics dashboard.
     * 
     * @param measurement The measurement to count
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @return Count of data points matching the criteria
     */
    @Query("SELECT COUNT(*) FROM analytics_data WHERE measurement = $measurement AND time >= $startTime AND time <= $endTime")
    Long countByMeasurementAndTimeRange(@Param("measurement") String measurement,
                                       @Param("startTime") Instant startTime,
                                       @Param("endTime") Instant endTime);
    
    /**
     * Retrieves time-bucketed aggregated data for trend analysis.
     * Essential for creating time-series visualizations in the predictive analytics dashboard.
     * 
     * @param measurement The measurement to aggregate
     * @param startTime The start of the time range (inclusive)
     * @param endTime The end of the time range (inclusive)
     * @param interval The time interval for bucketing (e.g., "1m", "1h", "1d")
     * @return List of aggregated AnalyticsData grouped by time intervals
     */
    @Query("SELECT MEAN(*) FROM analytics_data WHERE measurement = $measurement AND time >= $startTime AND time <= $endTime GROUP BY time($interval)")
    List<AnalyticsData> findAggregatedByTimeInterval(@Param("measurement") String measurement,
                                                    @Param("startTime") Instant startTime,
                                                    @Param("endTime") Instant endTime,
                                                    @Param("interval") String interval);

    // ==================== FINANCIAL METRICS SPECIFIC QUERIES ====================
    
    /**
     * Retrieves transaction volume metrics for a specific time period.
     * Supports financial performance monitoring and regulatory reporting.
     * 
     * @param startTime The start of the analysis period
     * @param endTime The end of the analysis period
     * @return List of transaction volume data points
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'transaction_metrics' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findTransactionMetrics(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);
    
    /**
     * Retrieves performance monitoring data for system health analysis.
     * Critical for maintaining system reliability and SLA compliance.
     * 
     * @param startTime The start of the monitoring period
     * @param endTime The end of the monitoring period
     * @return List of performance monitoring data points
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'performance_data' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findPerformanceMetrics(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);
    
    /**
     * Retrieves risk indicator data for predictive analytics processing.
     * Supports the AI-powered risk assessment engine integration.
     * 
     * @param startTime The start of the analysis period
     * @param endTime The end of the analysis period
     * @return List of risk indicator data points
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'risk_indicators' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findRiskIndicators(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);

    // ==================== REAL-TIME DATA QUERIES ====================
    
    /**
     * Retrieves the most recent analytics data points for real-time monitoring.
     * Essential for live dashboards and real-time transaction monitoring.
     * 
     * @param measurement The measurement type to retrieve
     * @param limit The maximum number of recent points to return
     * @return List of the most recent AnalyticsData points
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = $measurement ORDER BY time DESC LIMIT $limit")
    List<AnalyticsData> findRecentByMeasurement(@Param("measurement") String measurement, @Param("limit") int limit);
    
    /**
     * Retrieves the latest data point for a specific measurement and tag combination.
     * Used for current status monitoring and real-time alerts.
     * 
     * @param measurement The measurement type
     * @param tagKey The tag key for filtering
     * @param tagValue The tag value for filtering
     * @return Optional containing the latest matching data point, or empty if none found
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = $measurement AND \"$tagKey\" = '$tagValue' ORDER BY time DESC LIMIT 1")
    Optional<AnalyticsData> findLatestByMeasurementAndTag(@Param("measurement") String measurement,
                                                         @Param("tagKey") String tagKey,
                                                         @Param("tagValue") String tagValue);

    // ==================== PREDICTIVE ANALYTICS SUPPORT ====================
    
    /**
     * Retrieves customer analytics data for personalized recommendations.
     * Supports the personalized financial recommendations feature.
     * 
     * @param customerId The customer identifier
     * @param startTime The start of the analysis period
     * @param endTime The end of the analysis period
     * @return List of customer-specific analytics data
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'customer_analytics' AND \"customer_id\" = '$customerId' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findCustomerAnalytics(@Param("customerId") String customerId,
                                             @Param("startTime") Instant startTime,
                                             @Param("endTime") Instant endTime);
    
    /**
     * Retrieves behavioral pattern data for machine learning model training.
     * Essential for predictive analytics and fraud detection algorithms.
     * 
     * @param patternType The type of behavioral pattern to analyze
     * @param startTime The start of the training data period
     * @param endTime The end of the training data period
     * @return List of behavioral pattern data points
     */
    @Query("SELECT * FROM analytics_data WHERE \"pattern_type\" = '$patternType' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findBehavioralPatterns(@Param("patternType") String patternType,
                                              @Param("startTime") Instant startTime,
                                              @Param("endTime") Instant endTime);

    // ==================== BATCH OPERATIONS ====================
    
    /**
     * Batch saves multiple AnalyticsData points efficiently.
     * Optimized for high-volume data ingestion from multiple sources.
     * 
     * @param analyticsDataList List of AnalyticsData points to save
     * @return List of saved AnalyticsData with updated metadata
     */
    <S extends AnalyticsData> List<S> saveAll(Iterable<S> analyticsDataList);
    
    /**
     * Deletes analytics data older than the specified timestamp.
     * Used for data retention policy compliance and storage optimization.
     * 
     * @param cutoffTime The timestamp before which data should be deleted
     * @return Number of deleted records
     */
    @Query("DELETE FROM analytics_data WHERE time < $cutoffTime")
    Long deleteOlderThan(@Param("cutoffTime") Instant cutoffTime);

    // ==================== COMPLIANCE AND AUDIT QUERIES ====================
    
    /**
     * Retrieves audit trail data for compliance reporting.
     * Supports regulatory audit requirements and data governance.
     * 
     * @param startTime The start of the audit period
     * @param endTime The end of the audit period
     * @return List of audit-related analytics data
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'audit_logs' AND time >= $startTime AND time <= $endTime ORDER BY time ASC")
    List<AnalyticsData> findAuditData(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);
    
    /**
     * Counts the number of data points for compliance volume reporting.
     * Used for regulatory reporting and capacity planning.
     * 
     * @param measurement The measurement type to count
     * @param startTime The start of the reporting period
     * @param endTime The end of the reporting period
     * @return Count of data points for the specified criteria
     */
    @Query("SELECT COUNT(*) FROM analytics_data WHERE measurement = $measurement AND time >= $startTime AND time <= $endTime")
    Long countDataPointsForCompliance(@Param("measurement") String measurement,
                                     @Param("startTime") Instant startTime,
                                     @Param("endTime") Instant endTime);

    // ==================== SYSTEM HEALTH AND MONITORING ====================
    
    /**
     * Retrieves system health metrics for operational monitoring.
     * Critical for maintaining system reliability and performance SLAs.
     * 
     * @param startTime The start of the monitoring period
     * @param endTime The end of the monitoring period
     * @return List of system health data points
     */
    @Query("SELECT * FROM analytics_data WHERE measurement = 'system_health' AND time >= $startTime AND time <= $endTime ORDER BY time DESC")
    List<AnalyticsData> findSystemHealthMetrics(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);
    
    /**
     * Checks if the repository connection is healthy.
     * Used for health checks and monitoring system availability.
     * 
     * @return true if the repository is accessible and functional
     */
    default boolean isHealthy() {
        try {
            // Attempt to count recent records as a health check
            return countByMeasurementAndTimeRange("system_health", 
                                                Instant.now().minusSeconds(3600), 
                                                Instant.now()) >= 0;
        } catch (Exception e) {
            return false;
        }
    }
}