// External imports - Sentry error monitoring service v7.100.1
import * as Sentry from '@sentry/nextjs'; // @sentry/nextjs@7.100.1

// External imports - axios HTTP client library v1.6+
import axios from 'axios'; // axios@1.6+

// Internal imports - API error interface for structured error handling
import type { APIError } from './api';

/**
 * Error Handling Module for Unified Financial Services Platform
 * 
 * This module provides comprehensive error handling capabilities designed specifically
 * for financial services applications with strict reliability and compliance requirements.
 * It implements enterprise-grade error handling patterns including structured error parsing,
 * centralized logging, user-friendly messaging, and global exception handling.
 * 
 * Key Features:
 * - API error parsing with structured response handling
 * - Integration with Sentry for production error monitoring and alerting
 * - User-friendly error message generation for customer-facing applications
 * - Global error handling for uncaught exceptions and unhandled promise rejections
 * - Financial services-specific error categorization and handling
 * - Compliance-ready error logging with context enrichment
 * 
 * Requirements Addressed:
 * - F-001: Error Handling (5.4.3) - Resilient error handling patterns for financial services
 * - F-002: Error Tracking (3.4.5) - Sentry integration for monitoring and alerting
 * 
 * @fileoverview Centralized error handling for financial services web application
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 */

/**
 * Enhanced API Error Interface
 * 
 * Extends the base APIError interface to provide comprehensive error information
 * suitable for financial services applications, including status codes, error
 * categories, user messages, and original error context.
 */
export interface EnhancedAPIError extends APIError {
  /** HTTP status code associated with the error */
  statusCode?: number;
  
  /** Error category for classification and handling */
  category?: 'CLIENT_ERROR' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'VALIDATION_ERROR' | 'BUSINESS_LOGIC_ERROR' | 'UNKNOWN_ERROR';
  
  /** User-friendly message suitable for display to end users */
  userMessage?: string;
  
  /** API endpoint where the error occurred */
  endpoint?: string;
  
  /** HTTP method used when the error occurred */
  method?: string;
  
  /** Error code for programmatic error handling */
  code?: string;
  
  /** Original error object for debugging and detailed analysis */
  originalError?: any;
  
  /** Additional context data for error analysis */
  context?: Record<string, any>;
}

/**
 * Structured Error Response Interface
 * 
 * Standardized structure for error responses returned by error handling functions,
 * providing consistent error information across the application.
 */
export interface ErrorResponse {
  /** Human-readable error message */
  message: string;
  
  /** HTTP status code if applicable */
  statusCode?: number;
  
  /** Error category for handling logic */
  category?: string;
  
  /** User-friendly message for display */
  userMessage?: string;
  
  /** Error code for programmatic handling */
  code?: string;
  
  /** Additional error context */
  context?: Record<string, any>;
}

/**
 * Handles API errors by parsing error objects and returning structured error information
 * 
 * This function implements comprehensive error parsing for financial services APIs,
 * handling various error types including Axios HTTP errors, network errors, and
 * application-specific errors. It provides structured error responses with
 * user-friendly messages and detailed error context for debugging.
 * 
 * Error Handling Priority:
 * 1. Axios HTTP errors with response data
 * 2. Network errors without response
 * 3. Generic Error objects with message property
 * 4. Unknown error types with fallback handling
 * 
 * @param {unknown} error - The error object to parse and handle
 * @returns {ErrorResponse} Structured error object with message and metadata
 * 
 * @example
 * ```typescript
 * try {
 *   await api.customer.getProfile('123');
 * } catch (error) {
 *   const parsedError = handleApiError(error);
 *   showErrorMessage(parsedError.userMessage || parsedError.message);
 * }
 * ```
 */
export const handleApiError = (error: unknown): ErrorResponse => {
  // Handle Axios HTTP errors with comprehensive error information extraction
  if (axios.isAxiosError(error)) {
    const axiosError = error;
    const response = axiosError.response;
    const statusCode = response?.status || 0;
    
    // Extract error message from various possible response formats
    let errorMessage: string;
    let errorCode: string = axiosError.code || 'UNKNOWN_ERROR';
    let userMessage: string;
    let category: string;
    
    if (response?.data) {
      // Handle structured API error responses
      if (typeof response.data === 'object') {
        errorMessage = response.data.message || 
                      response.data.error || 
                      response.data.details || 
                      `HTTP ${statusCode}: ${response.statusText}`;
        errorCode = response.data.code || response.data.errorCode || errorCode;
      } else if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else {
        errorMessage = `HTTP ${statusCode}: ${response.statusText}`;
      }
    } else {
      // Handle cases where response data is not available
      errorMessage = axiosError.message || `HTTP Error ${statusCode}`;
    }
    
    // Categorize error based on HTTP status code
    if (statusCode === 401) {
      category = 'AUTHENTICATION_ERROR';
      userMessage = 'Your session has expired. Please log in again.';
    } else if (statusCode === 403) {
      category = 'AUTHORIZATION_ERROR';
      userMessage = 'You do not have permission to perform this action.';
    } else if (statusCode === 400) {
      category = 'VALIDATION_ERROR';
      userMessage = 'Please check your input and try again.';
    } else if (statusCode >= 400 && statusCode < 500) {
      category = 'CLIENT_ERROR';
      userMessage = 'There was an issue with your request. Please check your input and try again.';
    } else if (statusCode >= 500) {
      category = 'SERVER_ERROR';
      userMessage = 'A server error occurred. Please try again later or contact support if the issue persists.';
    } else if (statusCode === 0 || !response) {
      category = 'NETWORK_ERROR';
      userMessage = 'Network error. Please check your internet connection and try again.';
    } else {
      category = 'UNKNOWN_ERROR';
      userMessage = 'An unexpected error occurred. Please try again later.';
    }
    
    return {
      message: errorMessage,
      statusCode,
      category,
      userMessage,
      code: errorCode,
      context: {
        url: axiosError.config?.url,
        method: axiosError.config?.method?.toUpperCase(),
        requestData: axiosError.config?.data,
        responseData: response?.data,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      category: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred. Please try again later.',
      code: error.name || 'GENERIC_ERROR',
      context: {
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      category: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred. Please try again later.',
      code: 'STRING_ERROR',
      context: {
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Handle any other unknown error types
  return {
    message: 'An unknown error occurred',
    category: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again later.',
    code: 'UNKNOWN_ERROR',
    context: {
      errorType: typeof error,
      errorValue: error,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Logs errors to Sentry with enriched context for monitoring and alerting
 * 
 * This function provides centralized error logging capabilities for the financial
 * services platform, integrating with Sentry for production error monitoring.
 * It enriches error reports with contextual information including user data,
 * transaction details, and application state for comprehensive error analysis.
 * 
 * Context Enrichment:
 * - User identification and session information
 * - Transaction and business context
 * - Application state and configuration
 * - Performance and timing data
 * - Custom tags for error classification
 * 
 * @param {Error} error - The error object to log to Sentry
 * @param {Record<string, any>} context - Additional context data for error enrichment
 * @returns {void}
 * 
 * @example
 * ```typescript
 * try {
 *   await processPayment(paymentData);
 * } catch (error) {
 *   logError(error as Error, {
 *     userId: currentUser.id,
 *     transactionId: payment.id,
 *     paymentAmount: payment.amount,
 *     module: 'payment-processing'
 *   });
 * }
 * ```
 */
export const logError = (error: Error, context: Record<string, any> = {}): void => {
  try {
    // Configure Sentry scope with enriched context
    Sentry.withScope((scope) => {
      // Set user context if available
      if (context.userId) {
        scope.setUser({
          id: context.userId,
          email: context.userEmail,
          username: context.username
        });
      }
      
      // Set transaction context for financial operations
      if (context.transactionId) {
        scope.setTransactionName(`Transaction: ${context.transactionId}`);
        scope.setTag('transaction.id', context.transactionId);
      }
      
      // Set financial context tags
      if (context.customerId) {
        scope.setTag('customer.id', context.customerId);
      }
      
      if (context.paymentAmount) {
        scope.setTag('payment.amount', context.paymentAmount);
      }
      
      if (context.currency) {
        scope.setTag('payment.currency', context.currency);
      }
      
      // Set application module context
      if (context.module) {
        scope.setTag('app.module', context.module);
      }
      
      if (context.component) {
        scope.setTag('app.component', context.component);
      }
      
      // Set error severity based on context
      if (context.severity) {
        scope.setLevel(context.severity as Sentry.SeverityLevel);
      } else {
        // Default severity based on error type
        scope.setLevel('error');
      }
      
      // Add fingerprint for error grouping
      if (context.fingerprint) {
        scope.setFingerprint(Array.isArray(context.fingerprint) ? context.fingerprint : [context.fingerprint]);
      }
      
      // Set additional context data
      const additionalContext = { ...context };
      delete additionalContext.userId;
      delete additionalContext.userEmail;
      delete additionalContext.username;
      delete additionalContext.transactionId;
      delete additionalContext.customerId;
      delete additionalContext.paymentAmount;
      delete additionalContext.currency;
      delete additionalContext.module;
      delete additionalContext.component;
      delete additionalContext.severity;
      delete additionalContext.fingerprint;
      
      // Add remaining context as extra data
      if (Object.keys(additionalContext).length > 0) {
        scope.setContext('additional', additionalContext);
      }
      
      // Add application context
      scope.setContext('application', {
        name: 'Financial Services Platform',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      // Capture the exception with enriched context
      Sentry.captureException(error);
    });
  } catch (sentryError) {
    // Fallback error logging if Sentry fails
    console.error('Failed to log error to Sentry:', sentryError);
    console.error('Original error:', error);
    console.error('Error context:', context);
  }
};

/**
 * Extracts user-friendly error messages from unknown error types
 * 
 * This function provides a consistent interface for extracting user-appropriate
 * error messages from various error types. It prioritizes user experience by
 * providing clear, actionable error messages while maintaining technical
 * accuracy for debugging purposes.
 * 
 * Message Priority:
 * 1. Structured API error user messages
 * 2. HTTP error status-based messages
 * 3. Standard Error object messages (sanitized)
 * 4. Generic fallback messages
 * 
 * @param {unknown} error - The error object to extract a message from
 * @returns {string} User-friendly error message suitable for display
 * 
 * @example
 * ```typescript
 * try {
 *   await submitForm(formData);
 * } catch (error) {
 *   const userMessage = getErrorMessage(error);
 *   toast.error(userMessage);
 * }
 * ```
 */
export const getErrorMessage = (error: unknown): string => {
  // First, attempt to parse as API error for structured message
  const apiError = handleApiError(error);
  
  // Return user-friendly message if available, otherwise use technical message
  if (apiError.userMessage && apiError.userMessage !== apiError.message) {
    return apiError.userMessage;
  }
  
  // For API errors, use the technical message if no user message is available
  if (apiError.category !== 'UNKNOWN_ERROR') {
    return apiError.message;
  }
  
  // Handle Error objects directly for better message extraction
  if (error instanceof Error) {
    // Sanitize error messages that might contain sensitive information
    const message = error.message;
    
    // Filter out potentially sensitive technical details
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return 'Request timeout. Please try again.';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    // Return the error message if it appears to be user-friendly
    if (message.length < 200 && !message.includes('stack') && !message.includes('function')) {
      return message;
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error.length < 200 ? error : 'An error occurred. Please try again.';
  }
  
  // Generic fallback for unknown error types
  return 'An unexpected error occurred. Please try again later.';
};

/**
 * Global Error Handler Class
 * 
 * Provides comprehensive global error handling for the financial services application,
 * capturing uncaught exceptions and unhandled promise rejections. This ensures that
 * no errors go unnoticed in production environments and provides a safety net for
 * unexpected errors that could impact user experience or system stability.
 * 
 * Features:
 * - Automatic registration of global error event listeners
 * - Structured error logging with context enrichment
 * - Prevention of default browser error behaviors
 * - Integration with centralized error reporting
 * - Graceful error handling without application crashes
 * 
 * @class GlobalErrorHandler
 * @example
 * ```typescript
 * // Initialize global error handling in the main application entry point
 * const errorHandler = new GlobalErrorHandler();
 * 
 * // The handler will automatically capture and log all uncaught errors
 * ```
 */
export class GlobalErrorHandler {
  private isInitialized = false;
  
  /**
   * Constructor for GlobalErrorHandler
   * 
   * Initializes the global error handling system by setting up event listeners
   * for uncaught exceptions and unhandled promise rejections. This should be
   * called once during application initialization to ensure comprehensive
   * error coverage throughout the application lifecycle.
   * 
   * Event Listeners:
   * - 'error' event for uncaught JavaScript exceptions
   * - 'unhandledrejection' event for unhandled promise rejections
   * - Custom error boundaries for React component errors
   * 
   * @constructor
   */
  constructor() {
    this.initialize();
  }
  
  /**
   * Initializes global error event listeners
   * 
   * Sets up comprehensive error handling for browser environments, ensuring
   * that all uncaught errors are properly logged and handled. This method
   * includes safeguards to prevent multiple initialization and handles
   * server-side rendering environments appropriately.
   * 
   * @private
   * @returns {void}
   */
  private initialize(): void {
    // Prevent multiple initialization
    if (this.isInitialized) {
      return;
    }
    
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.warn('GlobalErrorHandler: Not in browser environment, skipping initialization');
      return;
    }
    
    try {
      // Set up uncaught exception handler
      window.addEventListener('error', this.handleUncaughtException.bind(this), true);
      
      // Set up unhandled promise rejection handler
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this), true);
      
      this.isInitialized = true;
      console.info('GlobalErrorHandler: Successfully initialized global error handling');
    } catch (error) {
      console.error('GlobalErrorHandler: Failed to initialize global error handling:', error);
    }
  }
  
  /**
   * Handles uncaught JavaScript exceptions
   * 
   * Processes uncaught exceptions that occur during script execution, preventing
   * them from causing application crashes while ensuring they are properly
   * logged for debugging and monitoring. This method extracts comprehensive
   * error information and provides appropriate user feedback.
   * 
   * Error Processing:
   * 1. Prevent default browser error handling
   * 2. Extract error details from the ErrorEvent
   * 3. Log error with context enrichment
   * 4. Provide user notification if appropriate
   * 
   * @param {ErrorEvent} event - The error event containing exception details
   * @returns {void}
   * 
   * @private
   */
  public handleUncaughtException(event: ErrorEvent): void {
    try {
      // Prevent the default browser error handling
      event.preventDefault();
      
      // Extract error information from the event
      const error = event.error || new Error(event.message || 'Uncaught exception occurred');
      const errorInfo = {
        message: event.message || 'Unknown error',
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        timestamp: new Date().toISOString()
      };
      
      // Log the error with comprehensive context
      logError(error, {
        module: 'global-error-handler',
        component: 'uncaught-exception',
        errorType: 'uncaught-exception',
        errorInfo,
        severity: 'error',
        fingerprint: ['uncaught-exception', errorInfo.filename, errorInfo.message]
      });
      
      // Log to console for development debugging
      console.error('Uncaught Exception:', {
        error,
        event,
        errorInfo
      });
      
    } catch (handlerError) {
      // Fallback error handling if the handler itself fails
      console.error('GlobalErrorHandler: Error in uncaught exception handler:', handlerError);
      console.error('Original uncaught exception:', event);
    }
  }
  
  /**
   * Handles unhandled promise rejections
   * 
   * Processes unhandled promise rejections that can occur in asynchronous
   * operations, ensuring they are properly logged and don't cause silent
   * failures. This is particularly important for financial applications
   * where all errors must be tracked and handled appropriately.
   * 
   * Rejection Processing:
   * 1. Extract rejection reason and context
   * 2. Convert non-Error rejections to Error objects
   * 3. Log with appropriate categorization
   * 4. Provide debugging information
   * 
   * @param {PromiseRejectionEvent} event - The promise rejection event
   * @returns {void}
   * 
   * @private
   */
  public handleUnhandledRejection(event: PromiseRejectionEvent): void {
    try {
      // Extract the rejection reason
      const reason = event.reason;
      let error: Error;
      
      // Convert the rejection reason to an Error object if it isn't already
      if (reason instanceof Error) {
        error = reason;
      } else if (typeof reason === 'string') {
        error = new Error(`Unhandled Promise Rejection: ${reason}`);
      } else {
        error = new Error(`Unhandled Promise Rejection: ${JSON.stringify(reason)}`);
      }
      
      // Create context information for the rejection
      const rejectionContext = {
        module: 'global-error-handler',
        component: 'unhandled-rejection',
        errorType: 'unhandled-promise-rejection',
        reasonType: typeof reason,
        reason: reason,
        timestamp: new Date().toISOString(),
        severity: 'error',
        fingerprint: ['unhandled-promise-rejection', error.message]
      };
      
      // Log the error with context
      logError(error, rejectionContext);
      
      // Log to console for development debugging
      console.error('Unhandled Promise Rejection:', {
        error,
        reason,
        event,
        context: rejectionContext
      });
      
      // Prevent the default browser handling of the rejection
      event.preventDefault();
      
    } catch (handlerError) {
      // Fallback error handling if the handler itself fails
      console.error('GlobalErrorHandler: Error in unhandled rejection handler:', handlerError);
      console.error('Original unhandled rejection:', event);
    }
  }
  
  /**
   * Manually logs an error through the global error handler
   * 
   * Provides a programmatic interface for logging errors through the global
   * error handling system, useful for catching and logging errors in try-catch
   * blocks or other error handling scenarios where automatic detection doesn't apply.
   * 
   * @param {Error} error - The error to log
   * @param {Record<string, any>} context - Additional context for the error
   * @returns {void}
   * 
   * @public
   */
  public logError(error: Error, context: Record<string, any> = {}): void {
    logError(error, {
      ...context,
      source: 'global-error-handler',
      manual: true
    });
  }
  
  /**
   * Cleanup method to remove global error listeners
   * 
   * Removes the global error event listeners, typically called when the
   * application is being destroyed or during testing scenarios where
   * clean initialization/destruction is required.
   * 
   * @returns {void}
   * 
   * @public
   */
  public destroy(): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      return;
    }
    
    try {
      window.removeEventListener('error', this.handleUncaughtException.bind(this), true);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this), true);
      
      this.isInitialized = false;
      console.info('GlobalErrorHandler: Successfully destroyed global error handling');
    } catch (error) {
      console.error('GlobalErrorHandler: Error during cleanup:', error);
    }
  }
}

// Export all error handling utilities for use throughout the application
export default {
  handleApiError,
  logError,
  getErrorMessage,
  GlobalErrorHandler
};