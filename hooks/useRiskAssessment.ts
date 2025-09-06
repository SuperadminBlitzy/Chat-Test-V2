// External imports - React hooks for state management and side effects
import { useState, useEffect, useCallback } from 'react'; // react@18.2.0

// Internal imports - Risk assessment service and type definitions
import riskAssessmentService from '../services/risk-assessment-service';
import { 
  RiskAssessment, 
  FraudDetectionResponse, 
  FraudDetectionRequest 
} from '../models/risk-assessment';

/**
 * Risk Assessment Data Interface
 * 
 * Represents the comprehensive risk assessment data structure returned by the
 * AI-powered risk assessment engine. This interface supports the F-002: AI-Powered 
 * Risk Assessment Engine requirements with real-time risk scoring, predictive modeling,
 * and automated risk mitigation recommendations.
 * 
 * Risk Assessment Features:
 * - Real-time risk scoring on 0-1000 scale with sub-500ms response times
 * - Risk category classification (LOW, MEDIUM, HIGH, CRITICAL)
 * - Confidence intervals indicating prediction reliability
 * - Feature importance analysis for model explainability
 * - Actionable risk mitigation recommendations
 * - Regulatory compliance and audit trail support
 */
export interface RiskAssessment {
  /** Unique identifier for this risk assessment */
  assessmentId: string;
  
  /** Customer identifier associated with this assessment */
  customerId: string;
  
  /** Risk score on standardized 0-1000 scale */
  riskScore: number;
  
  /** Risk category classification */
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Confidence score indicating prediction reliability (0-1) */
  confidenceScore: number;
  
  /** Array of key risk factors contributing to the score */
  riskFactors: {
    factor: string;
    weight: number;
    contribution: number;
  }[];
  
  /** Actionable risk mitigation recommendations */
  recommendations: string[];
  
  /** Assessment timestamp */
  assessmentTimestamp: number;
  
  /** Processing time in milliseconds */
  processingTimeMs?: number;
  
  /** Model version used for assessment */
  modelVersion: string;
  
  /** Feature importance rankings for explainability */
  featureImportance?: {
    feature: string;
    importance: number;
  }[];
}

/**
 * Fraud Detection Request Interface
 * 
 * Comprehensive request structure for fraud detection analysis supporting
 * the F-006: Fraud Detection System requirements. Includes transaction data,
 * behavioral biometrics, device fingerprinting, and contextual information
 * for advanced fraud pattern recognition.
 */
export interface FraudDetectionRequest {
  /** Unique transaction identifier */
  transactionId?: string;
  
  /** Customer identifier */
  customerId?: string;
  
  /** Transaction data for fraud analysis */
  transactionData?: {
    amount: number;
    currency: string;
    merchantId?: string;
    merchantCategory?: string;
    paymentMethod: string;
    cardToken?: string;
    transactionTimestamp: number;
  };
  
  /** Device fingerprinting data */
  deviceData?: {
    deviceId: string;
    fingerprint: string;
    ipAddress: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
  };
  
  /** Behavioral biometrics data */
  behavioralData?: {
    typingPattern?: object;
    mouseMovements?: number[][];
    sessionDuration?: number;
    pageViews?: number;
    formFillingSpeed?: 'SLOW' | 'NORMAL' | 'FAST';
  };
  
  /** Additional context data */
  contextData?: {
    sessionId?: string;
    referrer?: string;
    previousTransactions?: number;
  };
  
  /** Request timestamp */
  requestTimestamp: number;
  
  /** Request identifier for tracking */
  requestId?: string;
  
  /** Analysis type */
  analysisType?: 'REAL_TIME' | 'BATCH_SCREENING' | 'COMPREHENSIVE';
}

/**
 * Fraud Detection Response Interface
 * 
 * Comprehensive fraud detection analysis results including binary classification,
 * probability scores, fraud type identification, and prevention recommendations.
 * Supports >98% accuracy with <2% false positive rate requirements.
 */
export interface FraudDetectionResponse {
  /** Unique fraud detection analysis identifier */
  detectionId: string;
  
  /** Binary fraud classification */
  fraudClassification: 'FRAUD' | 'LEGITIMATE' | 'SUSPICIOUS';
  
  /** Fraud probability score (0-1) */
  fraudProbability: number;
  
  /** Confidence score for the classification (0-1) */
  confidenceScore: number;
  
  /** Detected fraud types if any */
  detectedFraudTypes: string[];
  
  /** Risk indicators that triggered fraud detection */
  riskIndicators: {
    indicator: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
  }[];
  
  /** Fraud prevention recommendations */
  preventionRecommendations: string[];
  
  /** Analysis timestamp */
  analysisTimestamp: number;
  
  /** Processing time in milliseconds */
  processingTimeMs?: number;
  
  /** Model version used for detection */
  modelVersion: string;
  
  /** Additional fraud analysis metadata */
  metadata?: {
    rulesTriggered: string[];
    behavioralScore?: number;
    deviceRiskScore?: number;
    velocityRiskScore?: number;
  };
}

/**
 * Custom React Hook for Risk Assessment and Fraud Detection
 * 
 * This hook provides comprehensive risk assessment and fraud detection capabilities
 * for the Unified Financial Services Platform, implementing the F-002: AI-Powered 
 * Risk Assessment Engine and F-006: Fraud Detection System requirements.
 * 
 * Key Features:
 * - Real-time risk scoring with 95% accuracy and sub-500ms response times
 * - Advanced fraud detection with >98% accuracy and <2% false positives
 * - Comprehensive state management for loading and error conditions
 * - Automatic error handling and recovery mechanisms
 * - Type-safe API interactions with full TypeScript support
 * - Performance monitoring and logging integration
 * - Regulatory compliance and audit trail support
 * 
 * Business Benefits:
 * - 40% reduction in credit risk through AI-powered predictive modeling
 * - Real-time fraud prevention with machine learning algorithms
 * - Improved customer experience through faster risk decisions
 * - Enhanced regulatory compliance with explainable AI models
 * - Reduced operational costs through automated risk assessment
 * 
 * Technical Implementation:
 * - Leverages React hooks for optimal performance and re-rendering
 * - Implements error boundaries for graceful error handling
 * - Provides memoized callback functions to prevent unnecessary re-renders
 * - Supports concurrent risk assessment and fraud detection operations
 * - Integrates with centralized logging and monitoring systems
 * 
 * @returns {object} Hook state and methods for risk assessment and fraud detection
 * 
 * @example
 * ```typescript
 * const { 
 *   riskAssessment, 
 *   fraudCheck, 
 *   loading, 
 *   error, 
 *   getRiskAssessment, 
 *   checkForFraud 
 * } = useRiskAssessment();
 * 
 * // Perform risk assessment for a customer
 * await getRiskAssessment('CUST_12345');
 * 
 * // Check transaction for fraud
 * await checkForFraud({
 *   transactionId: 'TXN_67890',
 *   transactionData: {
 *     amount: 5000.00,
 *     currency: 'USD',
 *     paymentMethod: 'CREDIT_CARD',
 *     transactionTimestamp: Date.now()
 *   },
 *   requestTimestamp: Date.now()
 * });
 * ```
 */
export const useRiskAssessment = () => {
  // State management for risk assessment data
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  
  // State management for fraud detection data
  const [fraudCheck, setFraudCheck] = useState<FraudDetectionResponse | null>(null);
  
  // Loading state for tracking ongoing operations
  const [loading, setLoading] = useState<boolean>(false);
  
  // Error state for handling operation failures
  const [error, setError] = useState<Error | null>(null);

  /**
   * Retrieves comprehensive risk assessment for a specific customer
   * 
   * This function implements the core F-002: AI-Powered Risk Assessment Engine
   * functionality, providing real-time risk scoring that analyzes multiple data
   * dimensions including customer financial history, behavioral patterns, market
   * conditions, and regulatory compliance status.
   * 
   * The risk assessment process includes:
   * - Customer financial profile analysis
   * - Transaction pattern evaluation
   * - Credit worthiness assessment
   * - Regulatory compliance verification
   * - Market risk factor integration
   * - Predictive risk modeling
   * 
   * Performance Requirements:
   * - Response time: <500ms for 99% of requests (F-002-RQ-001)
   * - Accuracy rate: 95% for risk predictions
   * - Availability: 24/7 with 99.9% uptime
   * 
   * @param {string} customerId - Unique customer identifier for risk assessment
   * @returns {Promise<void>} Promise that resolves when risk assessment is complete
   * 
   * @throws {Error} If customer ID is invalid or risk assessment service fails
   */
  const getRiskAssessment = useCallback(async (customerId: string): Promise<void> => {
    try {
      // Validate input parameters
      if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
        throw new Error('Valid customer ID is required for risk assessment');
      }

      // Log operation start for monitoring and debugging
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[useRiskAssessment] Starting risk assessment', {
          customerId,
          timestamp: new Date().toISOString(),
          operation: 'getRiskAssessment'
        });
      }

      // Set loading state and clear previous error
      setLoading(true);
      setError(null);

      // Prepare risk assessment request
      const riskAssessmentRequest = {
        customerId: customerId.trim(),
        assessmentType: 'CUSTOMER_PROFILE' as const,
        requestTimestamp: Date.now(),
        requestId: `risk_assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contextData: {
          source: 'web_application',
          component: 'useRiskAssessment_hook',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        }
      };

      // Call risk assessment service
      const assessmentResult = await riskAssessmentService.assessRisk(riskAssessmentRequest);

      // Validate response structure
      if (!assessmentResult) {
        throw new Error('Empty response received from risk assessment service');
      }

      if (typeof assessmentResult.riskScore !== 'number' || 
          assessmentResult.riskScore < 0 || 
          assessmentResult.riskScore > 1000) {
        throw new Error('Invalid risk score received: must be between 0 and 1000');
      }

      // Transform service response to hook interface
      const transformedAssessment: RiskAssessment = {
        assessmentId: assessmentResult.assessmentId || `assessment_${Date.now()}`,
        customerId: customerId,
        riskScore: assessmentResult.riskScore,
        riskCategory: assessmentResult.riskCategory || 'MEDIUM',
        confidenceScore: assessmentResult.confidenceScore || 0.8,
        riskFactors: assessmentResult.riskFactors || [],
        recommendations: assessmentResult.recommendations || [],
        assessmentTimestamp: assessmentResult.assessmentTimestamp || Date.now(),
        processingTimeMs: assessmentResult.processingTimeMs,
        modelVersion: assessmentResult.modelVersion || 'v2.1',
        featureImportance: assessmentResult.featureImportance
      };

      // Update state with successful assessment
      setRiskAssessment(transformedAssessment);

      // Log successful completion
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[useRiskAssessment] Risk assessment completed successfully', {
          customerId,
          riskScore: transformedAssessment.riskScore,
          riskCategory: transformedAssessment.riskCategory,
          processingTime: transformedAssessment.processingTimeMs,
          timestamp: new Date().toISOString()
        });
      }

      // Performance monitoring - alert if response exceeds target time
      if (transformedAssessment.processingTimeMs && transformedAssessment.processingTimeMs > 500) {
        console.warn('[useRiskAssessment] Risk assessment exceeded target response time', {
          customerId,
          processingTime: transformedAssessment.processingTimeMs,
          target: 500,
          timestamp: new Date().toISOString()
        });
      }

    } catch (catchError) {
      // Enhanced error handling with context preservation
      const enhancedError = catchError instanceof Error 
        ? catchError 
        : new Error(`Unexpected error during risk assessment: ${String(catchError)}`);

      // Add additional error context
      (enhancedError as any).operation = 'getRiskAssessment';
      (enhancedError as any).customerId = customerId;
      (enhancedError as any).timestamp = new Date().toISOString();

      // Log error for monitoring and debugging
      console.error('[useRiskAssessment] Risk assessment failed', {
        error: enhancedError.message,
        customerId,
        stack: enhancedError.stack,
        timestamp: new Date().toISOString()
      });

      // Update error state
      setError(enhancedError);
      
      // Clear any existing risk assessment data
      setRiskAssessment(null);

    } finally {
      // Always clear loading state
      setLoading(false);
    }
  }, []);

  /**
   * Performs comprehensive fraud detection analysis on transactions
   * 
   * This function implements the F-006: Fraud Detection System requirements,
   * providing advanced fraud analysis that examines multiple fraud indicators
   * including transaction patterns, behavioral biometrics, device fingerprinting,
   * and cross-reference with known fraud patterns.
   * 
   * The fraud detection process includes:
   * - Transaction pattern analysis and anomaly detection
   * - Behavioral biometrics evaluation
   * - Device fingerprinting and risk assessment
   * - Geographic and temporal pattern analysis
   * - Machine learning model predictions
   * - Real-time fraud rule evaluation
   * 
   * Performance Requirements:
   * - Response time: <300ms for real-time transaction screening
   * - Accuracy rate: >98% for fraud detection with <2% false positives
   * - Availability: 24/7 with 99.95% uptime
   * 
   * @param {FraudDetectionRequest} request - Comprehensive fraud detection request data
   * @returns {Promise<void>} Promise that resolves when fraud detection is complete
   * 
   * @throws {Error} If request data is invalid or fraud detection service fails
   */
  const checkForFraud = useCallback(async (request: FraudDetectionRequest): Promise<void> => {
    try {
      // Validate input parameters
      if (!request) {
        throw new Error('Fraud detection request is required');
      }

      if (!request.transactionId && !request.customerId) {
        throw new Error('Either transaction ID or customer ID must be provided for fraud detection');
      }

      // Log operation start for security monitoring
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[useRiskAssessment] Starting fraud detection analysis', {
          transactionId: request.transactionId,
          customerId: request.customerId,
          amount: request.transactionData?.amount,
          timestamp: new Date().toISOString(),
          operation: 'checkForFraud'
        });
      }

      // Set loading state and clear previous error
      setLoading(true);
      setError(null);

      // Enrich request with additional metadata
      const enrichedRequest: FraudDetectionRequest = {
        ...request,
        requestTimestamp: request.requestTimestamp || Date.now(),
        requestId: request.requestId || `fraud_detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        analysisType: request.analysisType || 'REAL_TIME',
        contextData: {
          ...request.contextData,
          source: 'web_application',
          component: 'useRiskAssessment_hook',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        }
      };

      // Security monitoring - log high-value transaction fraud checks
      if (enrichedRequest.transactionData?.amount && enrichedRequest.transactionData.amount > 10000) {
        console.info('[useRiskAssessment] High-value transaction fraud screening', {
          requestId: enrichedRequest.requestId,
          amount: enrichedRequest.transactionData.amount,
          currency: enrichedRequest.transactionData.currency,
          timestamp: new Date().toISOString()
        });
      }

      // Call fraud detection service
      const fraudResult = await riskAssessmentService.detectFraud(enrichedRequest);

      // Validate response structure
      if (!fraudResult) {
        throw new Error('Empty response received from fraud detection service');
      }

      if (!fraudResult.fraudClassification || 
          !['FRAUD', 'LEGITIMATE', 'SUSPICIOUS'].includes(fraudResult.fraudClassification)) {
        throw new Error('Invalid fraud classification received from fraud detection service');
      }

      if (typeof fraudResult.fraudProbability !== 'number' || 
          fraudResult.fraudProbability < 0 || 
          fraudResult.fraudProbability > 1) {
        throw new Error('Invalid fraud probability score: must be between 0 and 1');
      }

      // Transform service response to hook interface
      const transformedFraudCheck: FraudDetectionResponse = {
        detectionId: fraudResult.detectionId || `fraud_detection_${Date.now()}`,
        fraudClassification: fraudResult.fraudClassification,
        fraudProbability: fraudResult.fraudProbability,
        confidenceScore: fraudResult.confidenceScore || 0.9,
        detectedFraudTypes: fraudResult.detectedFraudTypes || [],
        riskIndicators: fraudResult.riskIndicators || [],
        preventionRecommendations: fraudResult.preventionRecommendations || [],
        analysisTimestamp: fraudResult.analysisTimestamp || Date.now(),
        processingTimeMs: fraudResult.processingTimeMs,
        modelVersion: fraudResult.modelVersion || 'v2.1',
        metadata: fraudResult.metadata
      };

      // Update state with successful fraud detection result
      setFraudCheck(transformedFraudCheck);

      // Security alerting for high-fraud-probability transactions
      if (transformedFraudCheck.fraudProbability > 0.8 || 
          transformedFraudCheck.fraudClassification === 'FRAUD') {
        console.warn('[useRiskAssessment] High fraud probability detected', {
          requestId: enrichedRequest.requestId,
          fraudClassification: transformedFraudCheck.fraudClassification,
          fraudProbability: transformedFraudCheck.fraudProbability,
          detectedFraudTypes: transformedFraudCheck.detectedFraudTypes,
          timestamp: new Date().toISOString()
        });
      }

      // Log successful completion
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[useRiskAssessment] Fraud detection completed successfully', {
          requestId: enrichedRequest.requestId,
          fraudClassification: transformedFraudCheck.fraudClassification,
          fraudProbability: transformedFraudCheck.fraudProbability,
          confidenceScore: transformedFraudCheck.confidenceScore,
          processingTime: transformedFraudCheck.processingTimeMs,
          timestamp: new Date().toISOString()
        });
      }

      // Performance monitoring - alert if fraud detection exceeds target time
      if (transformedFraudCheck.processingTimeMs && transformedFraudCheck.processingTimeMs > 300) {
        console.warn('[useRiskAssessment] Fraud detection exceeded target response time', {
          requestId: enrichedRequest.requestId,
          processingTime: transformedFraudCheck.processingTimeMs,
          target: 300,
          timestamp: new Date().toISOString()
        });
      }

    } catch (catchError) {
      // Enhanced error handling with security context
      const enhancedError = catchError instanceof Error 
        ? catchError 
        : new Error(`Unexpected error during fraud detection: ${String(catchError)}`);

      // Add additional error context
      (enhancedError as any).operation = 'checkForFraud';
      (enhancedError as any).transactionId = request?.transactionId;
      (enhancedError as any).customerId = request?.customerId;
      (enhancedError as any).timestamp = new Date().toISOString();

      // Log error for security monitoring
      console.error('[useRiskAssessment] Fraud detection failed', {
        error: enhancedError.message,
        transactionId: request?.transactionId,
        customerId: request?.customerId,
        amount: request?.transactionData?.amount,
        stack: enhancedError.stack,
        timestamp: new Date().toISOString()
      });

      // Security monitoring - log fraud detection failures for investigation
      if (request?.transactionData?.amount && request.transactionData.amount > 1000) {
        console.warn('[useRiskAssessment] Fraud detection failure for significant transaction', {
          requestId: request?.requestId,
          amount: request.transactionData.amount,
          error: enhancedError.message,
          timestamp: new Date().toISOString()
        });
      }

      // Update error state
      setError(enhancedError);
      
      // Clear any existing fraud check data
      setFraudCheck(null);

    } finally {
      // Always clear loading state
      setLoading(false);
    }
  }, []);

  // Clear error state when new operations begin
  useEffect(() => {
    if (loading && error) {
      setError(null);
    }
  }, [loading, error]);

  // Return hook interface with state and methods
  return {
    /** Current risk assessment data, null if no assessment has been performed */
    riskAssessment,
    
    /** Current fraud detection result, null if no fraud check has been performed */
    fraudCheck,
    
    /** Loading state indicating whether an operation is in progress */
    loading,
    
    /** Error state containing any errors from the last operation */
    error,
    
    /** Function to perform risk assessment for a customer */
    getRiskAssessment,
    
    /** Function to perform fraud detection analysis */
    checkForFraud
  };
};

// Export the hook as default for convenient importing
export default useRiskAssessment;