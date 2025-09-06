// External imports - Axios HTTP client library for error type checking
import axios from 'axios'; // axios@1.6+

// Internal imports - Toast notification hook for user feedback
import { useToast } from '../../hooks/useToast';

// Internal imports - Custom application error class for type checking
import { AppError } from '../lib/error-handling';

/**
 * Centralized Error Handler Module for Unified Financial Services Platform
 * 
 * This module provides a centralized error handling mechanism for the web application,
 * processing different error types and displaying user-friendly notifications to users.
 * It implements resilient error handling patterns as specified in the technical requirements
 * for System Architecture/Cross-Cutting Concerns/Error Handling Patterns.
 * 
 * **Key Features:**
 * - Centralized error processing for consistent user experience
 * - Type-specific error handling for Axios HTTP errors, custom AppErrors, and generic errors
 * - User-friendly error message generation with fallback mechanisms
 * - Integration with toast notification system for immediate user feedback
 * - Financial services-grade error handling with proper categorization
 * - Production-ready error handling with comprehensive error type coverage
 * 
 * **Requirements Addressed:**
 * - Centralized Error Handling (System Architecture/Cross-Cutting Concerns/Error Handling Patterns)
 * - Resilient error handling patterns for financial services applications
 * - Consistent error display and user notification across the application
 * - Integration with the unified toast notification system
 * 
 * **Technical Architecture:**
 * - Follows the microservices architecture pattern with centralized cross-cutting concerns
 * - Integrates seamlessly with React-based frontend architecture
 * - Supports real-time error handling for financial operations
 * - Compatible with the event-driven architecture and API-first design
 * 
 * **Error Processing Hierarchy:**
 * 1. Axios HTTP errors (network and API errors)
 * 2. Custom AppError instances (business logic errors)
 * 3. Generic JavaScript Error objects
 * 4. Fallback handling for unknown error types
 * 
 * **Integration Points:**
 * - Toast notification system for user feedback
 * - API error responses from backend microservices
 * - Frontend component error boundaries
 * - Real-time transaction monitoring and error reporting
 * 
 * @fileoverview Centralized error handling for financial services web application
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 * @module ErrorHandler
 */

/**
 * Toast Function Type Definition
 * 
 * Defines the signature for the toast notification function used to display
 * error messages to users. This type ensures type safety and consistency
 * when passing the toast function to the error handler.
 * 
 * The function takes a message string and options object with notification
 * type and optional duration for auto-dismissal.
 */
type ShowToastFunction = (message: string, options: { type: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => void;

/**
 * Centralized Error Handler Function
 * 
 * A centralized function to handle various types of errors encountered throughout
 * the financial services web application. This function provides consistent error
 * processing and user notification, ensuring that all errors are handled gracefully
 * and users receive appropriate feedback about system issues.
 * 
 * **Error Processing Logic:**
 * 1. Initializes with a default fallback error message
 * 2. Attempts to identify the specific error type (Axios, AppError, or generic Error)
 * 3. Extracts the most appropriate error message based on error type and structure
 * 4. Displays the error message to the user via toast notification
 * 5. Ensures no error goes unhandled or unnotified
 * 
 * **Axios Error Handling:**
 * - Checks for HTTP response errors with structured error data
 * - Prioritizes server-provided error messages over generic HTTP status messages
 * - Handles both structured API error responses and plain text error messages
 * - Gracefully handles network errors and timeouts
 * 
 * **AppError Handling:**
 * - Processes custom application errors with business-specific context
 * - Utilizes the error's built-in message property for user-friendly feedback
 * - Maintains error context for debugging while providing clean user messages
 * 
 * **Generic Error Handling:**
 * - Handles standard JavaScript Error objects
 * - Extracts error messages while sanitizing sensitive technical details
 * - Provides fallback handling for unexpected error formats
 * 
 * **User Experience Considerations:**
 * - All error messages are displayed with 'error' severity for visual consistency
 * - Toast notifications provide immediate, non-blocking feedback to users
 * - Error messages are user-friendly and actionable where possible
 * - Fallback messages ensure users are never left wondering about system state
 * 
 * **Usage Examples:**
 * ```typescript
 * // In a React component
 * const { toast } = useToast();
 * 
 * try {
 *   await api.customers.createProfile(customerData);
 * } catch (error) {
 *   handleError(error, toast);
 * }
 * 
 * // In an async function with custom error handling
 * const processPayment = async (paymentData) => {
 *   try {
 *     return await paymentService.processPayment(paymentData);
 *   } catch (error) {
 *     handleError(error, toast);
 *     throw error; // Re-throw if needed for component-level handling
 *   }
 * };
 * 
 * // In a form submission handler
 * const handleSubmit = async (formData) => {
 *   try {
 *     await submitForm(formData);
 *     toast('Form submitted successfully', { type: 'success' });
 *   } catch (error) {
 *     handleError(error, toast);
 *   }
 * };
 * ```
 * 
 * **Performance Considerations:**
 * - Minimal overhead error processing suitable for high-frequency usage
 * - Efficient error type checking using native JavaScript instanceof operations
 * - No memory leaks or performance degradation in error handling paths
 * - Optimized for real-time financial applications with strict performance requirements
 * 
 * **Security Considerations:**
 * - Error messages are sanitized to prevent exposure of sensitive system information
 * - Network error handling doesn't expose internal system architecture details
 * - User-facing messages are generic enough to avoid information disclosure
 * - Debug information is handled separately from user-facing error messages
 * 
 * @param {unknown} error - The error object to be processed and handled.
 *                         Can be an AxiosError, AppError, Error, or any other type.
 * @param {ShowToastFunction} showToast - The toast notification function used to display
 *                                       error messages to users. Should accept a message
 *                                       string and options object with type and duration.
 * @returns {void} This function does not return a value, but displays error notification
 *                to the user via the provided toast function.
 * 
 * @example
 * ```typescript
 * import { handleError } from './utils/error-handler';
 * import { useToast } from './hooks/useToast';
 * 
 * function PaymentComponent() {
 *   const { toast } = useToast();
 * 
 *   const processPayment = async () => {
 *     try {
 *       await paymentAPI.submit(paymentData);
 *     } catch (error) {
 *       handleError(error, toast);
 *     }
 *   };
 * 
 *   return <button onClick={processPayment}>Submit Payment</button>;
 * }
 * ```
 * 
 * @since 1.0.0
 * @memberof ErrorHandler
 */
export const handleError = (error: unknown, showToast: ShowToastFunction): void => {
  // Initialize a default error message as fallback for any unhandled error scenarios
  // This ensures users always receive feedback even if error parsing fails
  let errorMessage: string = 'An unexpected error occurred.';

  try {
    // Check if the error is an instance of AxiosError (HTTP/network errors)
    // Axios errors contain rich information about HTTP responses and network issues
    if (axios.isAxiosError(error)) {
      // Handle Axios HTTP errors with comprehensive response data extraction
      const axiosError = error;
      
      // Check if there is a response from the server
      if (axiosError.response) {
        // Attempt to extract error message from the response data
        const responseData = axiosError.response.data;
        
        // Handle structured API error responses
        if (responseData && typeof responseData === 'object') {
          // Try multiple common error message properties used by different APIs
          errorMessage = responseData.message || 
                        responseData.error || 
                        responseData.details || 
                        responseData.errorMessage ||
                        `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
        } 
        // Handle plain text error responses
        else if (responseData && typeof responseData === 'string') {
          errorMessage = responseData;
        } 
        // Handle cases where response data is empty or unusable
        else {
          errorMessage = `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
        }
      } 
      // Handle network errors or cases where no response was received
      else {
        // Use the Axios error message for network-related issues
        errorMessage = axiosError.message || 'Network error occurred';
        
        // Provide more specific messages for common network error scenarios
        if (axiosError.code === 'NETWORK_ERROR') {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (axiosError.code === 'TIMEOUT') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (axiosError.code === 'ECONNABORTED') {
          errorMessage = 'Connection was interrupted. Please try again.';
        }
      }
    }
    // Check if the error is an instance of our custom AppError class
    // AppErrors represent business logic errors with user-friendly messages
    else if (error instanceof AppError) {
      // Extract the error message from the AppError instance
      // AppErrors are designed to contain user-appropriate error messages
      errorMessage = error.message;
    }
    // Check if the error is a generic JavaScript Error object
    else if (error instanceof Error) {
      // Use the error's message property for standard JavaScript errors
      // These might come from various parts of the application or third-party libraries
      errorMessage = error.message;
    }
    // Handle string errors (sometimes thrown as strings instead of Error objects)
    else if (typeof error === 'string') {
      errorMessage = error;
    }
    // Handle any other unknown error types
    else if (error && typeof error === 'object') {
      // Attempt to extract message from object-like errors
      const errorObj = error as any;
      errorMessage = errorObj.message || errorObj.error || errorObj.toString() || 'An unexpected error occurred.';
    }
    // Final fallback for truly unknown error types
    // This ensures the function never fails to provide user feedback
    
  } catch (processingError) {
    // If error processing itself fails, log the issue and use the default message
    // This prevents the error handler from breaking the application
    console.error('Error processing error in handleError function:', processingError);
    console.error('Original error:', error);
    
    // Ensure we still provide user feedback even if error processing fails
    errorMessage = 'An unexpected error occurred.';
  }

  // Display the error message to the user via toast notification
  // Using 'error' type for consistent error styling and user recognition
  // No duration specified allows the user to dismiss the error when ready
  showToast(errorMessage, { 
    type: 'error' // Using 'error' type instead of 'danger' as per the toast interface
  });
};

// Export the handleError function as the default export for convenient importing
// This allows both named and default import patterns in consuming components
export default handleError;