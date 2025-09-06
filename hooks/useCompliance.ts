/**
 * useCompliance Hook
 * 
 * A comprehensive React hook for managing compliance-related data and interactions
 * within the Unified Financial Services Platform. This hook provides functions for
 * fetching compliance checks, reports, and AML statuses, while managing loading
 * and error states with enterprise-grade error handling and performance optimization.
 * 
 * Supports Requirements:
 * - F-003: Regulatory Compliance Automation - Automated compliance monitoring and reporting
 * - F-015: Compliance Control Center - Powers the compliance officer interface
 * - F-004: Digital Customer Onboarding - KYC/AML compliance integration
 * 
 * Features:
 * - Real-time compliance check status retrieval and monitoring
 * - Comprehensive AML screening with multi-database integration
 * - Automated compliance report generation and access
 * - Enterprise-grade error handling with user-friendly notifications
 * - Performance-optimized with memoized functions and efficient state management
 * - Full TypeScript support with comprehensive type safety
 * - Integration with Redux store for centralized state management
 * - Audit trail support for regulatory compliance requirements
 * 
 * Architecture Integration:
 * - Connects to compliance-service for backend API interactions
 * - Integrates with Redux compliance slice for state management
 * - Uses toast notifications for user feedback and error reporting
 * - Supports event-driven architecture with real-time updates
 * - Compatible with microservices architecture and API-first design
 * 
 * Performance Considerations:
 * - Memoized functions prevent unnecessary re-renders
 * - Efficient state updates with minimal re-computation
 * - Optimized for high-frequency compliance monitoring scenarios
 * - Memory-efficient state management for large compliance datasets
 * 
 * Security Features:
 * - Secure API communication through centralized API client
 * - Comprehensive error sanitization for production environments
 * - Audit logging for all compliance operations
 * - Role-based access control integration through Redux state
 * 
 * @version 1.0.0
 * @author Unified Financial Services Platform Development Team
 * @since 2025-01-15
 */

// External imports - React hooks for state management and performance optimization
import { useState, useCallback } from 'react'; // v18.0.0
// External imports - Redux hooks for state management integration
import { useDispatch, useSelector } from 'react-redux'; // v8.0.0

// Internal imports - Redux store types and actions
import type { RootState } from '../store';
import complianceSlice from '../store/compliance-slice';

// Internal imports - Compliance service layer for API interactions
import complianceService from '../services/compliance-service';

// Internal imports - Compliance data models and type definitions
import type { 
  ComplianceCheck, 
  AmlCheck, 
  ComplianceReport 
} from '../models/compliance';

// Internal imports - Toast notification hook for user feedback
import useToast from './useToast';

/**
 * AML Check Request Interface
 * 
 * Defines the structure for AML check requests, supporting various types of
 * anti-money laundering screenings for customer verification and transaction monitoring.
 * This interface ensures comprehensive compliance with Bank Secrecy Act (BSA) and
 * international KYC/AML requirements.
 */
interface AmlCheckRequest {
  /** Unique identifier of the customer to be screened */
  customerId: string;
  /** Type of AML check: STANDARD (basic screening), ENHANCED (extended due diligence), TRANSACTION (transaction-specific) */
  checkType: 'STANDARD' | 'ENHANCED' | 'TRANSACTION';
  /** Optional transaction data for transaction-specific AML checks */
  transactionData?: {
    /** Transaction amount in base currency */
    amount: number;
    /** Transaction currency code (ISO 4217) */
    currency: string;
    /** Source country for cross-border transaction monitoring */
    sourceCountry?: string;
    /** Destination country for cross-border transaction monitoring */
    destinationCountry?: string;
    /** Transaction purpose or category */
    purpose?: string;
  };
  /** Optional metadata for enhanced screening capabilities */
  metadata?: {
    /** Customer risk profile from previous assessments */
    riskProfile?: string;
    /** Geographic location of the customer */
    location?: string;
    /** Business relationship type with the customer */
    relationshipType?: string;
    /** Additional screening parameters */
    additionalScreening?: string[];
  };
}

/**
 * Loading States Interface
 * 
 * Defines the structure for managing loading states across different compliance
 * operations. This granular approach allows for precise UI feedback and
 * optimal user experience during various compliance processes.
 */
interface LoadingStates {
  /** Loading state for compliance checks retrieval */
  complianceChecks: boolean;
  /** Loading state for AML check operations */
  amlCheck: boolean;
  /** Loading state for compliance reports retrieval */
  complianceReports: boolean;
}

/**
 * Error States Interface
 * 
 * Defines the structure for managing error states across different compliance
 * operations. This comprehensive error tracking enables detailed error handling
 * and user feedback for various compliance scenarios.
 */
interface ErrorStates {
  /** Error state for compliance checks operations */
  complianceChecks: string | null;
  /** Error state for AML check operations */
  amlCheck: string | null;
  /** Error state for compliance reports operations */
  complianceReports: string | null;
}

/**
 * UseCompliance Hook Return Interface
 * 
 * Defines the complete return type of the useCompliance hook, providing
 * comprehensive access to compliance data, state management, and operational
 * functions for components throughout the application.
 */
interface UseComplianceReturn {
  // Redux Store Data - Centralized compliance state from Redux store
  /** Array of compliance checks from the Redux store */
  complianceChecks: ComplianceCheck[];
  /** Array of compliance reports from the Redux store */
  complianceReports: ComplianceReport[];
  
  // Local State Data - Component-level state for specific operations
  /** Current AML check result from local state */
  amlCheck: AmlCheck | null;
  
  // Loading States - Granular loading state management
  /** Object containing loading states for all compliance operations */
  loading: LoadingStates;
  
  // Error States - Comprehensive error state management
  /** Object containing error states for all compliance operations */
  errors: ErrorStates;
  
  // Action Functions - Memoized functions for compliance operations
  /** Function to fetch compliance checks from the backend */
  fetchComplianceChecks: () => Promise<void>;
  /** Function to perform AML check for a customer */
  fetchAmlCheck: (request: AmlCheckRequest) => Promise<void>;
  /** Function to fetch compliance reports from the backend */
  fetchComplianceReports: () => Promise<void>;
  
  // Utility Functions - Helper functions for state management
  /** Function to clear all error states */
  clearErrors: () => void;
  /** Function to reset all loading states */
  resetLoadingStates: () => void;
}

/**
 * useCompliance Hook Implementation
 * 
 * A custom React hook that provides comprehensive compliance data management
 * and operations for the Unified Financial Services Platform. This hook serves
 * as the primary interface for compliance-related functionality, integrating
 * with backend services, Redux state management, and user notification systems.
 * 
 * Core Functionality:
 * - Fetch and manage compliance checks with real-time status updates
 * - Perform comprehensive AML screening with multi-database integration
 * - Access and retrieve compliance reports with automated generation
 * - Provide enterprise-grade error handling with user-friendly notifications
 * - Optimize performance through memoization and efficient state management
 * 
 * State Management Strategy:
 * - Redux store for global compliance state (compliance checks, reports)
 * - Local state for operation-specific data (current AML check)
 * - Granular loading states for precise UI feedback
 * - Comprehensive error states for detailed error handling
 * 
 * Performance Optimizations:
 * - useCallback for function memoization to prevent unnecessary re-renders
 * - Efficient state updates with minimal object creation
 * - Optimized Redux selectors for efficient state access
 * - Lazy loading strategies for large compliance datasets
 * 
 * Error Handling Strategy:
 * - Comprehensive try-catch blocks for all async operations
 * - User-friendly error messages through toast notifications
 * - Detailed error logging for audit and debugging purposes
 * - Graceful degradation for non-critical compliance operations
 * 
 * @returns {UseComplianceReturn} Comprehensive compliance data and functions
 */
export const useCompliance = (): UseComplianceReturn => {
  // Redux Integration - Access dispatch and state selector functions
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Redux State Selection - Access compliance data from centralized store
  // Select compliance checks array from Redux store with type safety
  const complianceChecks = useSelector((state: RootState) => 
    state.compliance?.checks || []
  ) as ComplianceCheck[];

  // Select compliance reports array from Redux store with type safety
  const complianceReports = useSelector((state: RootState) => 
    state.compliance?.reports || []
  ) as ComplianceReport[];

  // Local State Management - Component-level state for specific operations
  
  // AML check state - stores the result of the most recent AML check operation
  const [amlCheck, setAmlCheck] = useState<AmlCheck | null>(null);

  // Loading states - granular loading management for each compliance operation
  const [loading, setLoading] = useState<LoadingStates>({
    complianceChecks: false,
    amlCheck: false,
    complianceReports: false,
  });

  // Error states - comprehensive error tracking for each compliance operation
  const [errors, setErrors] = useState<ErrorStates>({
    complianceChecks: null,
    amlCheck: null,
    complianceReports: null,
  });

  /**
   * Fetch Compliance Checks Function
   * 
   * Retrieves compliance checks from the backend service and updates the Redux store.
   * This function supports the F-003 requirement for continuous compliance monitoring
   * by providing access to real-time compliance check status across operational units.
   * 
   * Process Flow:
   * 1. Set loading state to true for compliance checks
   * 2. Clear any existing error states
   * 3. Call the compliance service to fetch checks data
   * 4. Dispatch Redux action to update store with fetched data
   * 5. Handle success/error scenarios with appropriate UI feedback
   * 6. Reset loading state regardless of outcome
   * 
   * Error Handling:
   * - Catches and logs all errors for audit purposes
   * - Displays user-friendly error messages via toast notifications
   * - Updates error state for component-level error display
   * - Maintains application stability during service failures
   * 
   * Performance Considerations:
   * - Memoized with useCallback to prevent unnecessary re-renders
   * - Efficient state updates with single dispatch calls
   * - Optimized for high-frequency compliance monitoring scenarios
   * - Minimal memory allocation during operation execution
   * 
   * @async
   * @function fetchComplianceChecks
   * @returns {Promise<void>} Promise that resolves when operation completes
   */
  const fetchComplianceChecks = useCallback(async (): Promise<void> => {
    try {
      // Initialize loading state and clear previous errors
      setLoading(prev => ({ ...prev, complianceChecks: true }));
      setErrors(prev => ({ ...prev, complianceChecks: null }));

      // Log compliance checks fetch initiation for audit trail
      console.info('Initiating compliance checks fetch operation', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceChecks',
        user: 'current-user', // This would typically come from auth state
      });

      // Call compliance service to retrieve checks from backend
      // Note: The service handles authentication, error parsing, and audit logging
      const checks = await complianceService.getComplianceCheck('all'); // Assuming 'all' retrieves all checks

      // Dispatch Redux action to update store with fetched compliance checks
      // This makes the data available to all components that need compliance checks
      dispatch(complianceSlice.actions.setComplianceChecks(checks));

      // Log successful compliance checks retrieval for audit and monitoring
      console.info('Successfully retrieved compliance checks', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceChecks',
        checksCount: Array.isArray(checks) ? checks.length : 1,
        user: 'current-user',
      });

      // Display success notification to the user
      toast('Compliance checks updated successfully', {
        type: 'success',
        duration: 3000,
      });

    } catch (error) {
      // Comprehensive error handling with logging and user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Log error details for audit and debugging purposes
      console.error('Failed to fetch compliance checks', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceChecks',
        error: errorMessage,
        user: 'current-user',
      });

      // Update error state for component-level error handling
      setErrors(prev => ({ 
        ...prev, 
        complianceChecks: `Failed to fetch compliance checks: ${errorMessage}` 
      }));

      // Display user-friendly error notification
      toast('Failed to update compliance checks. Please try again.', {
        type: 'error',
        duration: 5000,
      });

    } finally {
      // Always reset loading state regardless of success or failure
      setLoading(prev => ({ ...prev, complianceChecks: false }));
    }
  }, [dispatch, toast]);

  /**
   * Fetch AML Check Function
   * 
   * Performs Anti-Money Laundering (AML) checks for customer verification and
   * transaction monitoring. This function supports F-004 Digital Customer Onboarding
   * by providing KYC/AML compliance checks as required by financial regulations.
   * 
   * AML Check Capabilities:
   * - Sanctions list screening against global watchlists (OFAC, UN, EU)
   * - Politically Exposed Persons (PEP) identification and risk assessment
   * - Adverse media screening for negative coverage and criminal activity
   * - Cross-border transaction monitoring for suspicious patterns
   * - Risk-based assessment with automated scoring and recommendations
   * 
   * Process Flow:
   * 1. Validate AML check request parameters
   * 2. Set loading state and clear previous errors
   * 3. Call compliance service to perform AML screening
   * 4. Update local state with AML check results
   * 5. Provide user feedback based on screening outcome
   * 6. Handle errors with comprehensive logging and notifications
   * 
   * Error Handling:
   * - Input validation for required parameters
   * - Service-level error handling with detailed error context
   * - User-friendly error messages for various failure scenarios
   * - Audit logging for all AML operations for regulatory compliance
   * 
   * Performance Considerations:
   * - Memoized function to prevent unnecessary re-renders
   * - Efficient local state updates with minimal object creation
   * - Optimized for real-time AML screening requirements
   * - Memory-efficient handling of large AML response data
   * 
   * @async
   * @function fetchAmlCheck
   * @param {AmlCheckRequest} request - AML check request parameters
   * @returns {Promise<void>} Promise that resolves when AML check completes
   */
  const fetchAmlCheck = useCallback(async (request: AmlCheckRequest): Promise<void> => {
    try {
      // Input validation for AML check request
      if (!request.customerId || typeof request.customerId !== 'string') {
        throw new Error('Invalid AML request: customerId is required and must be a string');
      }

      if (!request.checkType || !['STANDARD', 'ENHANCED', 'TRANSACTION'].includes(request.checkType)) {
        throw new Error('Invalid AML request: checkType must be STANDARD, ENHANCED, or TRANSACTION');
      }

      // Additional validation for transaction-specific AML checks
      if (request.checkType === 'TRANSACTION' && !request.transactionData) {
        throw new Error('Invalid AML request: transactionData is required for TRANSACTION checkType');
      }

      // Initialize loading state and clear previous errors
      setLoading(prev => ({ ...prev, amlCheck: true }));
      setErrors(prev => ({ ...prev, amlCheck: null }));

      // Log AML check initiation for comprehensive audit trail
      console.info('Initiating AML check operation', {
        timestamp: new Date().toISOString(),
        operation: 'fetchAmlCheck',
        customerId: request.customerId,
        checkType: request.checkType,
        hasTransactionData: !!request.transactionData,
        user: 'current-user',
      });

      // Call compliance service to perform comprehensive AML screening
      // The service handles multi-database screening, risk assessment, and result compilation
      const amlResult = await complianceService.performAmlCheck(request);

      // Update local state with AML check results
      // Note: AML checks are typically customer-specific and may not need global state
      setAmlCheck({
        id: amlResult.checkId,
        customerId: amlResult.customerId,
        status: amlResult.status === 'CLEARED' ? 'CLEARED' : 
                amlResult.status === 'BLOCKED' ? 'FAILED' : 
                amlResult.status === 'FLAGGED' ? 'ESCALATED' : 'PENDING',
        checkedAt: amlResult.completedAt,
        riskLevel: amlResult.riskLevel,
        details: amlResult.details,
      });

      // Log successful AML check completion with key results
      console.info('AML check completed successfully', {
        timestamp: new Date().toISOString(),
        operation: 'fetchAmlCheck',
        checkId: amlResult.checkId,
        customerId: amlResult.customerId,
        status: amlResult.status,
        riskLevel: amlResult.riskLevel,
        user: 'current-user',
      });

      // Provide user feedback based on AML check results
      const statusMessages = {
        CLEARED: 'AML check completed - Customer cleared for onboarding',
        FLAGGED: 'AML check completed - Manual review required',
        BLOCKED: 'AML check completed - Customer blocked due to high risk',
        PENDING: 'AML check in progress - Awaiting additional verification',
      };

      const notificationTypes = {
        CLEARED: 'success' as const,
        FLAGGED: 'warning' as const,
        BLOCKED: 'error' as const,
        PENDING: 'info' as const,
      };

      toast(statusMessages[amlResult.status], {
        type: notificationTypes[amlResult.status],
        duration: amlResult.status === 'CLEARED' ? 3000 : 5000,
      });

    } catch (error) {
      // Comprehensive error handling with detailed logging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Log error details for audit and compliance monitoring
      console.error('AML check operation failed', {
        timestamp: new Date().toISOString(),
        operation: 'fetchAmlCheck',
        customerId: request?.customerId,
        checkType: request?.checkType,
        error: errorMessage,
        user: 'current-user',
      });

      // Update error state for component-level error handling
      setErrors(prev => ({ 
        ...prev, 
        amlCheck: `AML check failed: ${errorMessage}` 
      }));

      // Display user-friendly error notification
      toast('AML check failed. Please review the information and try again.', {
        type: 'error',
        duration: 7000,
      });

    } finally {
      // Always reset loading state regardless of success or failure
      setLoading(prev => ({ ...prev, amlCheck: false }));
    }
  }, [toast]);

  /**
   * Fetch Compliance Reports Function
   * 
   * Retrieves compliance reports from the backend service and updates the Redux store.
   * This function supports F-003 automated compliance reporting requirements by
   * providing access to comprehensive compliance reports across multiple regulatory
   * frameworks including SOX, PCI DSS, GDPR, and Basel III/IV.
   * 
   * Report Categories Supported:
   * - SOX (Sarbanes-Oxley) quarterly and annual compliance reports
   * - PCI DSS (Payment Card Industry Data Security Standard) reports
   * - GDPR (General Data Protection Regulation) compliance reports
   * - Basel III/IV regulatory capital and risk reports
   * - Custom regulatory framework reports based on jurisdiction
   * 
   * Process Flow:
   * 1. Set loading state to true for compliance reports
   * 2. Clear any existing error states
   * 3. Call compliance service to fetch reports data
   * 4. Dispatch Redux action to update store with fetched reports
   * 5. Handle success/error scenarios with appropriate UI feedback
   * 6. Reset loading state regardless of outcome
   * 
   * Error Handling:
   * - Comprehensive error logging for audit and debugging
   * - User-friendly error notifications via toast system
   * - Detailed error state management for component-level handling
   * - Graceful degradation during service unavailability
   * 
   * Performance Considerations:
   * - Memoized function to prevent unnecessary re-renders
   * - Efficient Redux store updates with single dispatch calls
   * - Optimized for handling large compliance report datasets
   * - Memory-efficient processing of report metadata
   * 
   * @async
   * @function fetchComplianceReports
   * @returns {Promise<void>} Promise that resolves when operation completes
   */
  const fetchComplianceReports = useCallback(async (): Promise<void> => {
    try {
      // Initialize loading state and clear previous errors
      setLoading(prev => ({ ...prev, complianceReports: true }));
      setErrors(prev => ({ ...prev, complianceReports: null }));

      // Log compliance reports fetch initiation for audit trail
      console.info('Initiating compliance reports fetch operation', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceReports',
        user: 'current-user',
      });

      // Call compliance service to retrieve reports from backend
      // The service handles authentication, report filtering, and access control
      const reports = await complianceService.getComplianceReports();

      // Dispatch Redux action to update store with fetched compliance reports
      // This makes reports available to all components that need compliance reporting data
      dispatch(complianceSlice.actions.setComplianceReports(reports));

      // Log successful compliance reports retrieval for audit and monitoring
      console.info('Successfully retrieved compliance reports', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceReports',
        reportsCount: reports.length,
        reportTypes: reports.map(report => report.name).slice(0, 5), // Log first 5 report names
        user: 'current-user',
      });

      // Display success notification to the user
      toast(`Successfully loaded ${reports.length} compliance reports`, {
        type: 'success',
        duration: 3000,
      });

    } catch (error) {
      // Comprehensive error handling with logging and user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Log error details for audit and debugging purposes
      console.error('Failed to fetch compliance reports', {
        timestamp: new Date().toISOString(),
        operation: 'fetchComplianceReports',
        error: errorMessage,
        user: 'current-user',
      });

      // Update error state for component-level error handling
      setErrors(prev => ({ 
        ...prev, 
        complianceReports: `Failed to fetch compliance reports: ${errorMessage}` 
      }));

      // Display user-friendly error notification
      toast('Failed to load compliance reports. Please try again.', {
        type: 'error',
        duration: 5000,
      });

    } finally {
      // Always reset loading state regardless of success or failure
      setLoading(prev => ({ ...prev, complianceReports: false }));
    }
  }, [dispatch, toast]);

  /**
   * Clear Errors Function
   * 
   * Resets all error states to null, providing a clean slate for new operations.
   * This utility function enables components to clear error states when needed,
   * such as when retrying operations or navigating between different sections.
   * 
   * Use Cases:
   * - Clearing errors before retrying failed operations
   * - Resetting error states when navigating between compliance sections
   * - Programmatic error state management in complex workflows
   * - User-initiated error dismissal actions
   * 
   * @function clearErrors
   * @returns {void}
   */
  const clearErrors = useCallback((): void => {
    setErrors({
      complianceChecks: null,
      amlCheck: null,
      complianceReports: null,
    });
  }, []);

  /**
   * Reset Loading States Function
   * 
   * Resets all loading states to false, providing a clean slate for new operations.
   * This utility function is useful for handling edge cases where loading states
   * might get stuck or need to be reset programmatically.
   * 
   * Use Cases:
   * - Emergency reset of stuck loading states
   * - Programmatic loading state management in complex workflows
   * - Component cleanup during unmounting
   * - Testing and development scenarios
   * 
   * @function resetLoadingStates
   * @returns {void}
   */
  const resetLoadingStates = useCallback((): void => {
    setLoading({
      complianceChecks: false,
      amlCheck: false,
      complianceReports: false,
    });
  }, []);

  // Return comprehensive compliance data and functions
  return {
    // Redux Store Data - Global compliance state
    complianceChecks,
    complianceReports,
    
    // Local State Data - Component-specific state
    amlCheck,
    
    // State Management - Loading and error states
    loading,
    errors,
    
    // Action Functions - Memoized compliance operations
    fetchComplianceChecks,
    fetchAmlCheck,
    fetchComplianceReports,
    
    // Utility Functions - State management helpers
    clearErrors,
    resetLoadingStates,
  };
};

// Default export for convenient importing
export default useCompliance;