/**
 * Analytics data models and interfaces for the financial services platform
 * 
 * This file defines comprehensive data structures for analytics, reporting, and dashboards
 * within the web application. These models support the F-005: Predictive Analytics Dashboard
 * requirements and enable advanced data visualization and business intelligence features.
 * 
 * The models are designed to work with the unified data integration platform (F-001) and
 * AI-powered risk assessment engine (F-002) to provide comprehensive analytics capabilities
 * including predictive modeling, trend analysis, and key performance indicators.
 * 
 * @fileoverview Analytics data models for financial services platform
 * @version 1.0.0
 * @author Financial Services Platform Team
 */

// Internal imports for related data models
import { Transaction, TransactionStatus, TransactionType, TransactionCategory } from './transaction';
import { Customer } from './customer';
import { RiskScore } from './risk-assessment';

/**
 * Core interface representing a single analytics data point
 * 
 * This interface forms the foundation of all analytics data structures,
 * providing a standardized format for metrics collection and aggregation
 * across the financial services platform.
 * 
 * Used by the predictive analytics dashboard to display time-series data,
 * key performance indicators, and trend analysis visualizations.
 */
export interface AnalyticsData {
  /** Unique identifier for the analytics data point */
  id: string;
  
  /** 
   * Timestamp when this data point was recorded
   * ISO 8601 format for consistent time-based analytics and sorting
   */
  timestamp: Date;
  
  /**
   * Name of the metric being measured
   * Examples: 'transaction_volume', 'customer_acquisition_rate', 'risk_score_avg'
   */
  metricName: string;
  
  /**
   * Numerical value of the metric
   * All analytics values are normalized to numbers for mathematical operations
   */
  value: number;
  
  /**
   * Key-value pairs for additional categorization and filtering
   * Enables multi-dimensional analytics and drill-down capabilities
   * 
   * Examples:
   * - { "region": "North America", "product": "Savings Account" }
   * - { "risk_level": "High", "customer_segment": "Premium" }
   * - { "channel": "Mobile", "transaction_type": "Transfer" }
   */
  dimensions: Record<string, string>;
}

/**
 * Extended analytics data interface for advanced metrics
 * 
 * Supports complex analytics scenarios including confidence intervals,
 * data quality indicators, and metadata for AI-powered predictions
 */
export interface EnhancedAnalyticsData extends AnalyticsData {
  /**
   * Confidence interval for predicted values (0.0 - 1.0)
   * Used by AI models to indicate prediction reliability
   */
  confidence?: number;
  
  /**
   * Data quality score (0.0 - 1.0)
   * Indicates the reliability of the underlying data
   */
  dataQuality?: number;
  
  /**
   * Source system that generated this data point
   * For traceability and data lineage tracking
   */
  sourceSystem?: string;
  
  /**
   * Calculation method used to derive this metric
   * Examples: 'sum', 'average', 'count', 'predicted_value'
   */
  calculationMethod?: string;
  
  /**
   * Related transaction IDs for drill-down analysis
   * Links analytics data back to source transactions
   */
  relatedTransactionIds?: string[];
  
  /**
   * Related customer IDs for customer-specific analytics
   * Enables customer segmentation and personalized insights
   */
  relatedCustomerIds?: string[];
}

/**
 * Interface representing a comprehensive analytics report
 * 
 * Reports aggregate multiple analytics data points and provide
 * structured output for business intelligence and regulatory reporting.
 * Supports both scheduled and on-demand report generation.
 */
export interface Report {
  /** Unique identifier for the report */
  id: string;
  
  /** Human-readable name for the report */
  name: string;
  
  /** 
   * Timestamp when the report was generated
   * ISO 8601 format for audit trails and version control
   */
  generatedAt: Date;
  
  /**
   * Collection of analytics data points included in this report
   * Core data payload for the report
   */
  data: AnalyticsData[];
  
  /**
   * Report metadata and configuration
   * Contains information about report parameters and generation context
   */
  metadata?: {
    /** Time range covered by this report */
    timeRange: {
      start: Date;
      end: Date;
    };
    
    /** Filters applied during report generation */
    filters: Record<string, any>;
    
    /** Total number of data points before pagination */
    totalDataPoints: number;
    
    /** Report generation duration in milliseconds */
    generationDuration: number;
    
    /** User or system that requested this report */
    requestedBy: string;
    
    /** Report format type */
    format: 'JSON' | 'CSV' | 'PDF' | 'EXCEL';
    
    /** Data sources included in this report */
    dataSources: string[];
  };
  
  /**
   * Summary statistics for the report
   * Pre-calculated aggregations for quick insights
   */
  summary?: {
    /** Total count of records */
    totalRecords: number;
    
    /** Key metrics summary */
    keyMetrics: Record<string, number>;
    
    /** Trend indicators */
    trends: {
      metricName: string;
      direction: 'up' | 'down' | 'stable';
      changePercent: number;
    }[];
    
    /** Data quality indicators */
    dataQuality: {
      completeness: number;
      accuracy: number;
      consistency: number;
    };
  };
}

/**
 * Interface for customizable analytics dashboard configuration
 * 
 * Dashboards provide interactive visualization of analytics data
 * with customizable layouts and widget configurations for different
 * user roles and use cases (executives, analysts, compliance officers).
 */
export interface Dashboard {
  /** Unique identifier for the dashboard */
  id: string;
  
  /** Dashboard display name */
  name: string;
  
  /**
   * Dashboard layout configuration
   * Defines the visual arrangement and sizing of dashboard components
   */
  layout: {
    /** Layout type (grid, flex, custom) */
    type: 'grid' | 'flex' | 'custom';
    
    /** Number of columns in grid layout */
    columns?: number;
    
    /** Responsive breakpoints for different screen sizes */
    breakpoints?: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    
    /** Custom CSS styles for advanced layouts */
    customStyles?: Record<string, any>;
  };
  
  /**
   * Array of dashboard widgets/components
   * Each widget represents a visualization or control element
   */
  widgets: DashboardWidget[];
  
  /**
   * Dashboard metadata and permissions
   */
  metadata?: {
    /** Dashboard creation timestamp */
    createdAt: Date;
    
    /** Last modification timestamp */
    updatedAt: Date;
    
    /** Dashboard owner/creator */
    owner: string;
    
    /** Users with access to this dashboard */
    sharedWith: string[];
    
    /** Dashboard visibility level */
    visibility: 'private' | 'shared' | 'public';
    
    /** Tags for dashboard categorization */
    tags: string[];
    
    /** Dashboard refresh interval in seconds */
    refreshInterval: number;
  };
}

/**
 * Interface for individual dashboard widgets
 * 
 * Widgets are the building blocks of dashboards, each providing
 * specific visualization or interaction capabilities
 */
export interface DashboardWidget {
  /** Unique identifier for the widget */
  id: string;
  
  /** Widget display title */
  title: string;
  
  /** Type of widget visualization */
  type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'text' | 'filter';
  
  /** Widget position and size in the dashboard */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /**
   * Widget configuration specific to its type
   * Contains visualization-specific settings and data queries
   */
  config: {
    /** Data query configuration */
    dataQuery: {
      /** Metrics to display */
      metrics: string[];
      
      /** Time range for data */
      timeRange: {
        start: Date;
        end: Date;
      };
      
      /** Filters to apply */
      filters: Record<string, any>;
      
      /** Aggregation method */
      aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
      
      /** Group by dimensions */
      groupBy?: string[];
    };
    
    /** Visualization-specific settings */
    visualization: {
      /** Chart type for chart widgets */
      chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'donut';
      
      /** Color scheme */
      colorScheme?: string[];
      
      /** Show/hide legend */
      showLegend?: boolean;
      
      /** Axis configurations for charts */
      axes?: {
        x: { title: string; scale: 'linear' | 'log' | 'time' };
        y: { title: string; scale: 'linear' | 'log' };
      };
      
      /** Format for displaying numbers */
      numberFormat?: string;
      
      /** Threshold values for alerts */
      thresholds?: {
        warning: number;
        critical: number;
      };
    };
  };
  
  /** Widget refresh interval in seconds */
  refreshInterval?: number;
  
  /** Widget-specific permissions */
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  };
}

/**
 * Interface for analytics data request payloads
 * 
 * Standardizes how analytics data is requested from the API,
 * supporting complex filtering, time-based queries, and
 * multi-dimensional analytics requirements.
 */
export interface AnalyticsRequest {
  /**
   * Array of metric names to retrieve
   * Supports multiple metrics in a single request for efficiency
   */
  metrics: string[];
  
  /**
   * Time range for the analytics query
   * Defines the temporal scope of the data request
   */
  timeRange: {
    /** Start date/time for the query (inclusive) */
    start: Date;
    
    /** End date/time for the query (inclusive) */
    end: Date;
  };
  
  /**
   * Additional filters for data refinement
   * Supports complex filtering scenarios with multiple criteria
   */
  filters: Record<string, any>;
  
  /**
   * Optional configuration for advanced analytics requests
   */
  options?: {
    /** Aggregation level (minute, hour, day, week, month) */
    granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
    
    /** Group results by specified dimensions */
    groupBy?: string[];
    
    /** Sort order for results */
    sortBy?: {
      field: string;
      direction: 'asc' | 'desc';
    };
    
    /** Limit number of results */
    limit?: number;
    
    /** Offset for pagination */
    offset?: number;
    
    /** Include confidence intervals for predictions */
    includeConfidence?: boolean;
    
    /** Include data quality metrics */
    includeDataQuality?: boolean;
    
    /** Specific calculation methods to apply */
    calculations?: string[];
    
    /** Currency code for financial metrics */
    currency?: string;
    
    /** Timezone for temporal calculations */
    timezone?: string;
  };
}

/**
 * Interface for analytics data response structures
 * 
 * Provides a standardized format for analytics API responses,
 * including data payload, metadata, and summary statistics
 * for comprehensive analytics consumption.
 */
export interface AnalyticsResponse {
  /**
   * Array of analytics data points matching the request
   * Main payload containing the requested metrics and dimensions
   */
  data: AnalyticsData[];
  
  /**
   * Summary statistics and aggregations
   * Pre-calculated insights for quick consumption
   */
  summary: Record<string, number>;
  
  /**
   * Response metadata and context
   */
  metadata?: {
    /** Total number of data points (before pagination) */
    totalCount: number;
    
    /** Query execution time in milliseconds */
    executionTime: number;
    
    /** Data sources used for this response */
    dataSources: string[];
    
    /** Time range actually covered by the data */
    actualTimeRange: {
      start: Date;
      end: Date;
    };
    
    /** Pagination information */
    pagination?: {
      offset: number;
      limit: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    
    /** Data freshness indicator */
    dataFreshness: {
      oldestRecord: Date;
      newestRecord: Date;
      lastUpdated: Date;
    };
    
    /** Applied filters and transformations */
    appliedFilters: Record<string, any>;
    
    /** Warnings or notices about the data */
    warnings?: string[];
  };
  
  /**
   * Trend analysis for time-series data
   */
  trends?: {
    /** Metric name */
    metric: string;
    
    /** Overall trend direction */
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    
    /** Percentage change over the time period */
    changePercent: number;
    
    /** Statistical significance of the trend */
    significance: number;
    
    /** Seasonal patterns detected */
    seasonality?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
      strength: number;
    };
  }[];
}

/**
 * Interface for report generation request payloads
 * 
 * Combines report metadata with analytics queries to generate
 * comprehensive business intelligence reports with proper
 * documentation and audit trails.
 */
export interface ReportRequest {
  /**
   * Name for the generated report
   * Used for identification and file naming
   */
  reportName: string;
  
  /**
   * Analytics query configuration
   * Defines what data to include in the report
   */
  analyticsRequest: AnalyticsRequest;
  
  /**
   * Optional report-specific configuration
   */
  reportConfig?: {
    /** Output format for the report */
    format: 'JSON' | 'CSV' | 'PDF' | 'EXCEL';
    
    /** Report template to use */
    template?: string;
    
    /** Include executive summary */
    includeExecutiveSummary?: boolean;
    
    /** Include charts and visualizations */
    includeVisualizations?: boolean;
    
    /** Report delivery method */
    delivery?: {
      method: 'download' | 'email' | 'storage';
      recipients?: string[];
      schedule?: 'once' | 'daily' | 'weekly' | 'monthly';
    };
    
    /** Additional report metadata */
    metadata?: {
      author: string;
      department: string;
      tags: string[];
      confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
    };
    
    /** Custom styling for PDF reports */
    styling?: {
      theme: string;
      logo?: string;
      headerFooter?: boolean;
      watermark?: string;
    };
  };
}

/**
 * Interface for report generation response
 * 
 * Provides status information and tracking details for
 * asynchronous report generation processes, enabling
 * proper workflow management and user notifications.
 */
export interface ReportResponse {
  /**
   * Unique identifier for the generated report
   * Used for tracking and retrieval
   */
  reportId: string;
  
  /**
   * Current status of the report generation
   * Enables progress tracking for long-running reports
   */
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  /**
   * Additional response details
   */
  details?: {
    /** Progress percentage (0-100) */
    progress?: number;
    
    /** Estimated completion time */
    estimatedCompletion?: Date;
    
    /** Error message if status is 'failed' */
    errorMessage?: string;
    
    /** Download URL when status is 'completed' */
    downloadUrl?: string;
    
    /** Report file size in bytes */
    fileSize?: number;
    
    /** Report expiration date */
    expiresAt?: Date;
    
    /** Processing start time */
    startedAt?: Date;
    
    /** Processing completion time */
    completedAt?: Date;
    
    /** Queue position if status is 'queued' */
    queuePosition?: number;
  };
}

/**
 * Interface for predictive analytics models and forecasting
 * 
 * Supports AI-powered predictive analytics capabilities as per
 * F-005 requirements, enabling trend forecasting and predictive
 * modeling for business intelligence applications.
 */
export interface PredictiveAnalytics {
  /** Model identifier */
  modelId: string;
  
  /** Model name and description */
  modelName: string;
  
  /** Prediction type */
  predictionType: 'forecast' | 'classification' | 'regression' | 'anomaly_detection';
  
  /** Input parameters for the prediction */
  inputParameters: {
    /** Historical data time range */
    historicalRange: {
      start: Date;
      end: Date;
    };
    
    /** Features to include in the model */
    features: string[];
    
    /** Forecast horizon (for time-series predictions) */
    forecastHorizon?: number;
    
    /** Confidence level for predictions (0.0 - 1.0) */
    confidenceLevel: number;
  };
  
  /** Prediction results */
  predictions: {
    /** Predicted values */
    values: Array<{
      timestamp: Date;
      predictedValue: number;
      confidence: number;
      upperBound: number;
      lowerBound: number;
    }>;
    
    /** Model performance metrics */
    performance: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      rmse?: number;
      mae?: number;
    };
    
    /** Feature importance scores */
    featureImportance: Record<string, number>;
    
    /** Model explanation and insights */
    insights: string[];
  };
  
  /** Model metadata */
  metadata: {
    /** Model training date */
    trainedAt: Date;
    
    /** Model version */
    version: string;
    
    /** Training data size */
    trainingDataSize: number;
    
    /** Model algorithm used */
    algorithm: string;
    
    /** Model validation results */
    validation: {
      method: string;
      score: number;
      crossValidationScores: number[];
    };
  };
}

/**
 * Interface for real-time analytics streaming
 * 
 * Supports real-time data streaming and live analytics updates
 * for dynamic dashboards and monitoring applications
 */
export interface StreamingAnalytics {
  /** Stream identifier */
  streamId: string;
  
  /** Stream configuration */
  config: {
    /** Metrics to stream */
    metrics: string[];
    
    /** Update frequency in seconds */
    updateFrequency: number;
    
    /** Buffer size for batching */
    bufferSize: number;
    
    /** Aggregation window size */
    windowSize: number;
    
    /** Filters for the stream */
    filters: Record<string, any>;
  };
  
  /** Current stream status */
  status: 'active' | 'paused' | 'stopped' | 'error';
  
  /** Stream statistics */
  statistics: {
    /** Total events processed */
    eventsProcessed: number;
    
    /** Current throughput (events/second) */
    throughput: number;
    
    /** Stream start time */
    startTime: Date;
    
    /** Last event timestamp */
    lastEventTime: Date;
    
    /** Error count */
    errorCount: number;
  };
}

/**
 * Type aliases for improved type safety and code readability
 */

/** Analytics metric identifier */
export type MetricId = string;

/** Dashboard widget identifier */
export type WidgetId = string;

/** Report identifier */
export type ReportId = string;

/** Stream identifier */
export type StreamId = string;

/** Supported aggregation methods */
export type AggregationMethod = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'stddev';

/** Time granularity options */
export type TimeGranularity = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/** Chart visualization types */
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'donut' | 'heatmap' | 'gauge' | 'treemap';

/** Data quality levels */
export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor';

/** Risk assessment levels integrated with analytics */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Utility interfaces for complex analytics operations
 */

/**
 * Interface for multi-dimensional analytics queries
 * Supports OLAP-style operations for complex business intelligence
 */
export interface MultiDimensionalQuery {
  /** Cube or data source identifier */
  cube: string;
  
  /** Measures to aggregate */
  measures: string[];
  
  /** Dimensions for slicing and dicing */
  dimensions: {
    name: string;
    values?: string[];
    range?: {
      start: any;
      end: any;
    };
  }[];
  
  /** Drill-down hierarchy */
  drillDown?: string[];
  
  /** Filters across dimensions */
  filters: Record<string, any>;
  
  /** Sorting configuration */
  sort?: {
    measure: string;
    direction: 'asc' | 'desc';
  }[];
}

/**
 * Interface for analytics data export configurations
 * Supports various export formats and delivery methods
 */
export interface DataExportConfig {
  /** Export format */
  format: 'CSV' | 'JSON' | 'XLSX' | 'PDF' | 'XML';
  
  /** Data to export */
  data: {
    /** Analytics request configuration */
    analyticsRequest: AnalyticsRequest;
    
    /** Include metadata in export */
    includeMetadata: boolean;
    
    /** Include summary statistics */
    includeSummary: boolean;
  };
  
  /** Export options */
  options: {
    /** File name for the export */
    fileName: string;
    
    /** Compression type */
    compression?: 'zip' | 'gzip';
    
    /** Character encoding */
    encoding?: 'utf-8' | 'ascii' | 'iso-8859-1';
    
    /** Date format for timestamps */
    dateFormat?: string;
    
    /** Number format for numeric values */
    numberFormat?: string;
    
    /** Include column headers */
    includeHeaders?: boolean;
  };
  
  /** Delivery configuration */
  delivery?: {
    /** Delivery method */
    method: 'download' | 'email' | 's3' | 'ftp';
    
    /** Email recipients (if method is email) */
    emailRecipients?: string[];
    
    /** Storage location (if method is s3 or ftp) */
    storageLocation?: string;
    
    /** File retention period in days */
    retentionDays?: number;
  };
}