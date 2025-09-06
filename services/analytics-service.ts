// External imports - No external dependencies beyond the API client

// Internal imports - Core API client and analytics models
import api from '../lib/api'; // Centralized API client for HTTP requests
import { 
  AnalyticsRequest, 
  AnalyticsResponse, 
  ReportRequest, 
  ReportResponse 
} from '../models/analytics'; // Analytics interface definitions

/**
 * Analytics Service for Financial Services Platform
 * 
 * This service provides a comprehensive interface for all analytics-related operations
 * within the web application. It serves as the primary abstraction layer between the
 * frontend components and the backend analytics microservice, implementing the
 * requirements for F-005: Predictive Analytics Dashboard, F-012: Settlement Reconciliation
 * Engine, and F-016: Risk Management Console.
 * 
 * The service encapsulates all analytics API interactions including:
 * - Fetching general analytics data with complex filtering and aggregation
 * - Generating and retrieving custom reports for business intelligence
 * - Accessing predictive analytics for risk assessment and forecasting
 * - Supporting multi-dimensional analytics queries for comprehensive insights
 * 
 * Key Features:
 * - Type-safe API interactions using TypeScript interfaces
 * - Comprehensive error handling and logging for production environments
 * - Support for real-time analytics and batch processing
 * - Integration with AI/ML models for predictive analytics capabilities
 * - Unified data access across all analytics endpoints
 * 
 * Architecture Alignment:
 * - F-005: Predictive Analytics Dashboard - Provides predictive analytics data
 * - F-012: Settlement Reconciliation Engine - Supports settlement reporting
 * - F-016: Risk Management Console - Enables risk analytics and insights
 * - API Integration (3.3.1) - Uses centralized Axios-based API client
 * 
 * @fileoverview Analytics service layer for comprehensive business intelligence
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 */
export class AnalyticsService {
  /**
   * Private readonly reference to the centralized API client
   * 
   * This property provides access to the configured API client that handles
   * authentication, request/response processing, error handling, and logging
   * for all HTTP communications with the analytics microservice.
   * 
   * The API client is configured with:
   * - Automatic JWT token attachment for authentication
   * - Structured error handling with detailed error information
   * - Request/response logging for debugging and monitoring
   * - Retry logic and circuit breaker patterns for resilience
   */
  private readonly api = api;

  /**
   * Constructor for AnalyticsService
   * 
   * Initializes the analytics service with the centralized API client.
   * The constructor is lightweight and follows the dependency injection
   * pattern by accepting the API client as a dependency.
   * 
   * The service is designed as a singleton to ensure consistent behavior
   * across the application and to optimize resource utilization.
   */
  constructor() {
    // Initialize the service with the imported API client
    // The API client is already configured with base URLs, authentication,
    // error handling, and other cross-cutting concerns
  }

  /**
   * Retrieves analytics data based on specified parameters
   * 
   * This method provides access to the core analytics functionality of the platform,
   * supporting complex queries for business intelligence, performance monitoring,
   * and operational insights. It handles multi-dimensional analytics queries with
   * sophisticated filtering, aggregation, and time-based analysis capabilities.
   * 
   * The method supports various analytics use cases including:
   * - Transaction volume and revenue analytics
   * - Customer behavior and segmentation analysis
   * - Risk assessment and compliance monitoring
   * - Performance metrics and KPI tracking
   * - Predictive modeling and trend analysis
   * 
   * Features:
   * - Comprehensive filtering and grouping options
   * - Time-based analytics with flexible granularity
   * - Multi-dimensional data slicing and dicing
   * - Real-time and historical data access
   * - Pagination support for large datasets
   * - Currency and timezone handling for global operations
   * 
   * Error Handling:
   * - Validates request parameters before sending to API
   * - Provides detailed error messages for debugging
   * - Handles network errors and timeouts gracefully
   * - Logs errors for monitoring and troubleshooting
   * 
   * @param {AnalyticsRequest} params - Analytics query parameters including metrics,
   *                                   time range, filters, and options for data retrieval
   * @returns {Promise<AnalyticsResponse>} A promise that resolves with comprehensive
   *                                       analytics data including data points, summary
   *                                       statistics, metadata, and trend analysis
   * 
   * @throws {Error} Throws an error if the request fails due to network issues,
   *                 authentication problems, or invalid parameters
   * 
   * @example
   * ```typescript
   * // Get transaction volume analytics for the last 30 days
   * const transactionAnalytics = await analyticsService.getAnalytics({
   *   metrics: ['transaction_volume', 'transaction_value'],
   *   timeRange: {
   *     start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
   *     end: new Date()
   *   },
   *   filters: {
   *     status: 'completed',
   *     channel: 'mobile'
   *   },
   *   options: {
   *     granularity: 'day',
   *     groupBy: ['region', 'product_type'],
   *     includeConfidence: true
   *   }
   * });
   * ```
   */
  async getAnalytics(params: AnalyticsRequest): Promise<AnalyticsResponse> {
    try {
      // Validate request parameters
      if (!params.metrics || params.metrics.length === 0) {
        throw new Error('Analytics request must include at least one metric');
      }

      if (!params.timeRange || !params.timeRange.start || !params.timeRange.end) {
        throw new Error('Analytics request must include a valid time range');
      }

      if (params.timeRange.start >= params.timeRange.end) {
        throw new Error('Time range start date must be before end date');
      }

      // Log the analytics request for debugging (non-production environments)
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Fetching analytics data', {
          metrics: params.metrics,
          timeRange: params.timeRange,
          filters: params.filters,
          options: params.options,
          timestamp: new Date().toISOString()
        });
      }

      // Make the API call to fetch analytics data
      // The API client handles authentication, error handling, and response processing
      const response = await this.api.analytics.get('/analytics', {
        params: {
          ...params,
          // Convert date objects to ISO strings for API compatibility
          timeRange: {
            start: params.timeRange.start.toISOString(),
            end: params.timeRange.end.toISOString()
          }
        }
      });

      // Process and validate the response
      if (!response || !response.data) {
        throw new Error('Invalid response from analytics API');
      }

      // Convert ISO date strings back to Date objects for consistent handling
      const processedResponse: AnalyticsResponse = {
        ...response,
        data: response.data.map((dataPoint: any) => ({
          ...dataPoint,
          timestamp: new Date(dataPoint.timestamp)
        })),
        metadata: response.metadata ? {
          ...response.metadata,
          actualTimeRange: {
            start: new Date(response.metadata.actualTimeRange.start),
            end: new Date(response.metadata.actualTimeRange.end)
          },
          dataFreshness: {
            ...response.metadata.dataFreshness,
            oldestRecord: new Date(response.metadata.dataFreshness.oldestRecord),
            newestRecord: new Date(response.metadata.dataFreshness.newestRecord),
            lastUpdated: new Date(response.metadata.dataFreshness.lastUpdated)
          }
        } : undefined
      };

      // Log successful response for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Analytics data retrieved successfully', {
          dataPointCount: processedResponse.data.length,
          executionTime: processedResponse.metadata?.executionTime,
          timestamp: new Date().toISOString()
        });
      }

      return processedResponse;

    } catch (error) {
      // Enhanced error handling with context
      console.error('Analytics Service: Error fetching analytics data', {
        error: error instanceof Error ? error.message : String(error),
        params: {
          metrics: params.metrics,
          timeRange: params.timeRange,
          filters: params.filters
        },
        timestamp: new Date().toISOString()
      });

      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`Failed to fetch analytics data: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch analytics data: ${String(error)}`);
      }
    }
  }

  /**
   * Retrieves a previously generated analytics report
   * 
   * This method provides access to stored analytics reports that have been
   * generated either on-demand or through scheduled report generation processes.
   * It supports various report formats and provides comprehensive report metadata
   * including generation status, progress tracking, and download information.
   * 
   * The method handles different report types including:
   * - Business intelligence reports for executive dashboards
   * - Regulatory compliance reports for audit requirements
   * - Risk assessment reports for risk management
   * - Settlement reconciliation reports for blockchain operations
   * - Custom analytics reports for specific business needs
   * 
   * Features:
   * - Support for multiple report formats (JSON, CSV, PDF, Excel)
   * - Report status tracking and progress monitoring
   * - Secure download URLs with expiration handling
   * - Report metadata including generation context
   * - Error handling for failed or expired reports
   * 
   * @param {ReportRequest} params - Report retrieval parameters including report
   *                                 identification, format preferences, and access
   *                                 control information
   * @returns {Promise<ReportResponse>} A promise that resolves with the report
   *                                    information including status, download URLs,
   *                                    and metadata for tracking and access
   * 
   * @throws {Error} Throws an error if the report cannot be retrieved due to
   *                 access restrictions, expiration, or system errors
   * 
   * @example
   * ```typescript
   * // Retrieve a compliance report
   * const complianceReport = await analyticsService.getReport({
   *   reportName: 'monthly_compliance_report',
   *   analyticsRequest: {
   *     metrics: ['compliance_violations', 'audit_findings'],
   *     timeRange: {
   *       start: new Date('2025-01-01'),
   *       end: new Date('2025-01-31')
   *     },
   *     filters: {
   *       regulation: 'SOX',
   *       severity: 'high'
   *     }
   *   },
   *   reportConfig: {
   *     format: 'PDF',
   *     includeExecutiveSummary: true
   *   }
   * });
   * ```
   */
  async getReport(params: ReportRequest): Promise<ReportResponse> {
    try {
      // Validate report request parameters
      if (!params.reportName || params.reportName.trim() === '') {
        throw new Error('Report request must include a valid report name');
      }

      if (!params.analyticsRequest) {
        throw new Error('Report request must include analytics request parameters');
      }

      // Validate analytics request within the report request
      if (!params.analyticsRequest.metrics || params.analyticsRequest.metrics.length === 0) {
        throw new Error('Report analytics request must include at least one metric');
      }

      if (!params.analyticsRequest.timeRange || 
          !params.analyticsRequest.timeRange.start || 
          !params.analyticsRequest.timeRange.end) {
        throw new Error('Report analytics request must include a valid time range');
      }

      // Log the report request for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Retrieving report', {
          reportName: params.reportName,
          format: params.reportConfig?.format || 'JSON',
          timeRange: params.analyticsRequest.timeRange,
          timestamp: new Date().toISOString()
        });
      }

      // Prepare the request payload with proper date formatting
      const requestPayload = {
        ...params,
        analyticsRequest: {
          ...params.analyticsRequest,
          timeRange: {
            start: params.analyticsRequest.timeRange.start.toISOString(),
            end: params.analyticsRequest.timeRange.end.toISOString()
          }
        }
      };

      // Make the API call to retrieve the report
      const response = await this.api.analytics.get('/analytics/reports', {
        params: requestPayload
      });

      // Validate response structure
      if (!response || !response.reportId) {
        throw new Error('Invalid response from reports API');
      }

      // Process the response with proper date handling
      const processedResponse: ReportResponse = {
        ...response,
        details: response.details ? {
          ...response.details,
          estimatedCompletion: response.details.estimatedCompletion 
            ? new Date(response.details.estimatedCompletion) 
            : undefined,
          expiresAt: response.details.expiresAt 
            ? new Date(response.details.expiresAt) 
            : undefined,
          startedAt: response.details.startedAt 
            ? new Date(response.details.startedAt) 
            : undefined,
          completedAt: response.details.completedAt 
            ? new Date(response.details.completedAt) 
            : undefined
        } : undefined
      };

      // Log successful report retrieval
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Report retrieved successfully', {
          reportId: processedResponse.reportId,
          status: processedResponse.status,
          progress: processedResponse.details?.progress,
          timestamp: new Date().toISOString()
        });
      }

      return processedResponse;

    } catch (error) {
      // Enhanced error handling with context
      console.error('Analytics Service: Error retrieving report', {
        error: error instanceof Error ? error.message : String(error),
        reportName: params.reportName,
        format: params.reportConfig?.format,
        timestamp: new Date().toISOString()
      });

      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve report: ${error.message}`);
      } else {
        throw new Error(`Failed to retrieve report: ${String(error)}`);
      }
    }
  }

  /**
   * Initiates the generation of a new analytics report
   * 
   * This method triggers the creation of a new analytics report based on the
   * provided configuration and analytics parameters. It handles both synchronous
   * and asynchronous report generation processes, supporting complex reports that
   * may require significant processing time and resources.
   * 
   * The method supports various report generation scenarios:
   * - On-demand report generation for immediate business needs
   * - Scheduled report generation for recurring business processes
   * - Batch report generation for large datasets
   * - Custom report generation with specialized formatting
   * - Regulatory reports with compliance requirements
   * 
   * Features:
   * - Asynchronous processing for large reports
   * - Progress tracking and status updates
   * - Multiple output formats (JSON, CSV, PDF, Excel)
   * - Custom styling and branding options
   * - Delivery configuration including email and storage options
   * - Comprehensive error handling and retry logic
   * 
   * The method returns immediately after queuing the report for generation,
   * allowing the client to track progress using the returned report ID.
   * Large reports are processed asynchronously to avoid blocking the API.
   * 
   * @param {ReportRequest} params - Report generation parameters including
   *                                 report configuration, analytics query,
   *                                 formatting options, and delivery settings
   * @returns {Promise<void>} A promise that resolves when the report generation
   *                          process has been successfully initiated (not completed)
   * 
   * @throws {Error} Throws an error if the report generation cannot be initiated
   *                 due to invalid parameters, system limitations, or access restrictions
   * 
   * @example
   * ```typescript
   * // Generate a risk management report
   * await analyticsService.generateReport({
   *   reportName: 'weekly_risk_assessment',
   *   analyticsRequest: {
   *     metrics: ['risk_score', 'violation_count', 'compliance_rating'],
   *     timeRange: {
   *       start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
   *       end: new Date()
   *     },
   *     filters: {
   *       risk_level: ['high', 'critical'],
   *       department: 'trading'
   *     },
   *     options: {
   *       granularity: 'day',
   *       includeConfidence: true
   *     }
   *   },
   *   reportConfig: {
   *     format: 'PDF',
   *     includeExecutiveSummary: true,
   *     includeVisualizations: true,
   *     delivery: {
   *       method: 'email',
   *       recipients: ['risk-management@company.com']
   *     }
   *   }
   * });
   * ```
   */
  async generateReport(params: ReportRequest): Promise<void> {
    try {
      // Comprehensive parameter validation
      if (!params.reportName || params.reportName.trim() === '') {
        throw new Error('Report generation requires a valid report name');
      }

      if (!params.analyticsRequest) {
        throw new Error('Report generation requires analytics request parameters');
      }

      // Validate analytics request parameters
      if (!params.analyticsRequest.metrics || params.analyticsRequest.metrics.length === 0) {
        throw new Error('Report analytics request must include at least one metric');
      }

      if (!params.analyticsRequest.timeRange || 
          !params.analyticsRequest.timeRange.start || 
          !params.analyticsRequest.timeRange.end) {
        throw new Error('Report analytics request must include a valid time range');
      }

      if (params.analyticsRequest.timeRange.start >= params.analyticsRequest.timeRange.end) {
        throw new Error('Report time range start date must be before end date');
      }

      // Validate report configuration if provided
      if (params.reportConfig) {
        const validFormats = ['JSON', 'CSV', 'PDF', 'EXCEL'];
        if (params.reportConfig.format && !validFormats.includes(params.reportConfig.format)) {
          throw new Error(`Invalid report format. Must be one of: ${validFormats.join(', ')}`);
        }

        // Validate delivery configuration
        if (params.reportConfig.delivery) {
          const validMethods = ['download', 'email', 'storage'];
          if (params.reportConfig.delivery.method && 
              !validMethods.includes(params.reportConfig.delivery.method)) {
            throw new Error(`Invalid delivery method. Must be one of: ${validMethods.join(', ')}`);
          }

          // Validate email recipients if email delivery is specified
          if (params.reportConfig.delivery.method === 'email' && 
              (!params.reportConfig.delivery.recipients || 
               params.reportConfig.delivery.recipients.length === 0)) {
            throw new Error('Email delivery requires at least one recipient');
          }
        }
      }

      // Log the report generation request
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Initiating report generation', {
          reportName: params.reportName,
          format: params.reportConfig?.format || 'JSON',
          metrics: params.analyticsRequest.metrics,
          timeRange: params.analyticsRequest.timeRange,
          delivery: params.reportConfig?.delivery?.method,
          timestamp: new Date().toISOString()
        });
      }

      // Prepare the request payload with proper date formatting
      const requestPayload = {
        ...params,
        analyticsRequest: {
          ...params.analyticsRequest,
          timeRange: {
            start: params.analyticsRequest.timeRange.start.toISOString(),
            end: params.analyticsRequest.timeRange.end.toISOString()
          }
        }
      };

      // Make the API call to initiate report generation
      // This is a POST request as it creates a new resource (report generation job)
      await this.api.analytics.post('/analytics/reports', requestPayload);

      // Log successful report generation initiation
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Report generation initiated successfully', {
          reportName: params.reportName,
          timestamp: new Date().toISOString()
        });
      }

      // The method returns void as per the specification
      // Clients should use getReport() to check status and retrieve results

    } catch (error) {
      // Enhanced error handling with detailed context
      console.error('Analytics Service: Error initiating report generation', {
        error: error instanceof Error ? error.message : String(error),
        reportName: params.reportName,
        format: params.reportConfig?.format,
        metricsCount: params.analyticsRequest?.metrics?.length,
        timeRange: params.analyticsRequest?.timeRange,
        timestamp: new Date().toISOString()
      });

      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`Failed to initiate report generation: ${error.message}`);
      } else {
        throw new Error(`Failed to initiate report generation: ${String(error)}`);
      }
    }
  }

  /**
   * Retrieves predictive analytics data for the dashboard
   * 
   * This method provides access to AI-powered predictive analytics capabilities
   * that support the F-005: Predictive Analytics Dashboard requirements. It leverages
   * machine learning models to provide forecasting, trend analysis, and predictive
   * insights for various business metrics and operational parameters.
   * 
   * The predictive analytics functionality includes:
   * - Time-series forecasting for financial metrics
   * - Risk prediction models for proactive risk management
   * - Customer behavior predictions for personalized services
   * - Market trend analysis for strategic planning
   * - Anomaly detection for fraud prevention
   * - Seasonal pattern recognition for capacity planning
   * 
   * Key Features:
   * - Real-time predictive model inference
   * - Confidence intervals for prediction reliability
   * - Model explainability features for regulatory compliance
   * - Multiple prediction horizons (short, medium, long-term)
   * - Integrated risk assessment for prediction validation
   * - Historical accuracy tracking for model performance
   * 
   * The method integrates with the platform's AI/ML infrastructure to provide
   * production-ready predictive analytics that meet enterprise requirements for
   * accuracy, reliability, and regulatory compliance.
   * 
   * Model Integration:
   * - TensorFlow/PyTorch model serving for production inference
   * - Feature engineering pipeline for data preprocessing
   * - Model versioning and A/B testing capabilities
   * - Automated model retraining and validation
   * - Explainable AI features for model interpretability
   * 
   * @returns {Promise<any>} A promise that resolves with comprehensive predictive
   *                         analytics data including forecasts, confidence intervals,
   *                         model explanations, and performance metrics
   * 
   * @throws {Error} Throws an error if predictive analytics data cannot be retrieved
   *                 due to model unavailability, data quality issues, or system errors
   * 
   * @example
   * ```typescript
   * // Get predictive analytics for the dashboard
   * const predictiveData = await analyticsService.getPredictiveAnalytics();
   * 
   * // Access different types of predictions
   * const riskForecast = predictiveData.riskMetrics.forecast;
   * const customerBehavior = predictiveData.customerInsights.predictions;
   * const marketTrends = predictiveData.marketAnalysis.trends;
   * const anomalies = predictiveData.anomalyDetection.alerts;
   * ```
   */
  async getPredictiveAnalytics(): Promise<any> {
    try {
      // Log the predictive analytics request
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Fetching predictive analytics data', {
          endpoint: '/analytics/predictive',
          timestamp: new Date().toISOString()
        });
      }

      // Make the API call to fetch predictive analytics data
      // This endpoint provides access to AI/ML models for predictive insights
      const response = await this.api.analytics.get('/analytics/predictive');

      // Validate response structure
      if (!response) {
        throw new Error('No response received from predictive analytics API');
      }

      // Process the response to ensure consistent date handling
      // Predictive analytics may contain timestamps that need to be converted
      const processedResponse = this.processDateFields(response);

      // Log successful retrieval of predictive analytics
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Analytics Service: Predictive analytics data retrieved successfully', {
          hasRiskMetrics: !!processedResponse.riskMetrics,
          hasCustomerInsights: !!processedResponse.customerInsights,
          hasMarketAnalysis: !!processedResponse.marketAnalysis,
          hasAnomalyDetection: !!processedResponse.anomalyDetection,
          modelCount: processedResponse.models?.length || 0,
          timestamp: new Date().toISOString()
        });
      }

      return processedResponse;

    } catch (error) {
      // Enhanced error handling for predictive analytics
      console.error('Analytics Service: Error fetching predictive analytics data', {
        error: error instanceof Error ? error.message : String(error),
        endpoint: '/analytics/predictive',
        timestamp: new Date().toISOString()
      });

      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`Failed to fetch predictive analytics data: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch predictive analytics data: ${String(error)}`);
      }
    }
  }

  /**
   * Utility method to process date fields in API responses
   * 
   * This private method recursively processes API response objects to convert
   * ISO date strings back to JavaScript Date objects for consistent handling
   * throughout the application. It handles nested objects and arrays to ensure
   * all date fields are properly converted.
   * 
   * @param {any} obj - The response object to process
   * @returns {any} The processed object with Date objects
   * @private
   */
  private processDateFields(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.processDateFields(item));
    }

    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.isISODateString(value)) {
        processed[key] = new Date(value);
      } else if (value && typeof value === 'object') {
        processed[key] = this.processDateFields(value);
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Utility method to check if a string is an ISO date string
   * 
   * @param {string} str - The string to check
   * @returns {boolean} True if the string is a valid ISO date string
   * @private
   */
  private isISODateString(str: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoDateRegex.test(str) && !isNaN(Date.parse(str));
  }
}

/**
 * Singleton instance of the AnalyticsService
 * 
 * This singleton instance provides a centralized access point for all analytics
 * operations throughout the web application. It ensures consistent behavior and
 * optimizes resource utilization by reusing the same service instance across
 * all components and modules.
 * 
 * The singleton pattern is used here to:
 * - Maintain consistent state and configuration across the application
 * - Optimize memory usage by avoiding multiple service instances
 * - Provide a single point of access for analytics functionality
 * - Ensure proper connection pooling and resource management
 * - Facilitate testing and mocking in development environments
 * 
 * Usage across the application:
 * ```typescript
 * import { analyticsService } from '../services/analytics-service';
 * 
 * // Use the service in React components
 * const dashboardData = await analyticsService.getAnalytics(params);
 * const predictiveData = await analyticsService.getPredictiveAnalytics();
 * ```
 * 
 * @type {AnalyticsService} Singleton instance of the analytics service
 */
export const analyticsService = new AnalyticsService();

// Export the singleton instance as the default export for convenience
export default analyticsService;