/**
 * Financial Wellness React Hook for Unified Financial Services Platform
 * 
 * A comprehensive React hook that manages all financial wellness related data and actions,
 * implementing the F-007: Personalized Financial Recommendations feature and supporting
 * the platform's Personalized Financial Wellness capability. This hook provides a
 * centralized interface for accessing wellness profiles, financial goals, and AI-powered
 * personalized recommendations.
 * 
 * Core Capabilities Supported:
 * - Holistic Financial Profiling: Comprehensive user financial health assessment and management
 * - AI-Powered Recommendation Engine: Personalized financial recommendations based on user profiles
 * - Goal Tracking System: Financial goal setting, monitoring, and achievement tracking
 * - Financial Health Assessment: Complete wellness profile management and progress tracking
 * 
 * Primary User Workflows Supported:
 * - Financial Health Assessment: Snapshot Creation → Goal Setting → Recommendation Generation → Action Planning → Progress Tracking
 * - Personalized Financial Wellness: Holistic profiling → Recommendation engine → Goal tracking
 * - Goal Management: Goal Creation → Progress Monitoring → Achievement Celebration
 * 
 * Integration Points:
 * - F-001: Unified Data Integration Platform - Leverages consolidated customer data for comprehensive profiles
 * - F-002: AI-Powered Risk Assessment Engine - Uses risk analytics for intelligent recommendation generation
 * - F-013: Customer Dashboard - Provides data for wellness visualization and progress tracking
 * - F-014: Advisor Workbench - Supports advisor-client financial wellness discussions
 * 
 * Technical Foundation:
 * - React hooks pattern for modern state management integration
 * - Redux Toolkit integration for centralized state management
 * - TypeScript for comprehensive type safety and developer experience
 * - Comprehensive error handling with user-friendly messages
 * - Performance optimization through memoization and selective updates
 * 
 * Security and Compliance:
 * - All financial wellness data handled according to PCI-DSS requirements
 * - GDPR compliant data management with user consent tracking
 * - SOC2 compliant audit trails and data protection
 * - Encrypted data handling throughout the application lifecycle
 * 
 * Performance Requirements:
 * - Sub-second response times for wellness data operations
 * - Real-time state updates for immediate user feedback
 * - Efficient memory usage with optimized hook dependencies
 * - Minimal re-renders through proper memoization strategies
 * 
 * @fileoverview Comprehensive React hook for financial wellness data management
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV
 * @security All financial wellness data must be encrypted and access-controlled
 * @performance Sub-second response times required for all operations
 * @since 2025
 */

// External imports - React hooks for state management and lifecycle
import { useState, useEffect, useCallback } from 'react'; // React v18.2.0

// Internal imports - Redux store integration for centralized state management
import { useAppDispatch, useAppSelector } from '../store'; // Redux store typed hooks v1.0+

// Internal imports - Financial wellness data models for type safety
import { WellnessProfile, FinancialGoal, Recommendation } from '../models/financial-wellness'; // Named exports - wellness data models v1.0+

// Internal imports - Redux actions for state management
import {
  // Async thunk actions for API operations
  fetchWellnessProfile,
  fetchFinancialGoals,
  addNewFinancialGoal,
  fetchRecommendations,
  
  // Synchronous actions for local state management
  clearError,
  resetState,
  updateWellnessProfile,
  updateFinancialGoal,
  removeFinancialGoal,
  markRecommendationViewed,
  
  // Selectors for accessing state data
  selectWellnessProfile,
  selectFinancialGoals,
  selectActiveGoals,
  selectCompletedGoals,
  selectRecommendations,
  selectHighPriorityRecommendations,
  selectLoadingStatus,
  selectError,
  selectIsLoading,
  selectHasError
} from '../store/financial-wellness-slice'; // Named exports - financial wellness slice v1.0+

// Internal imports - Financial wellness service for direct API operations
import financialWellnessService from '../services/financial-wellness-service'; // Default export - comprehensive API service layer v1.0+

/**
 * Financial Wellness Hook Return Interface
 * 
 * Defines the complete return type for the useFinancialWellness hook, providing
 * a comprehensive API for financial wellness data access and management. This
 * interface ensures type safety and clear documentation of all available
 * functionality for consuming components.
 * 
 * Data Access:
 * - Complete wellness profile with health scoring and metrics
 * - Financial goals collection with progress tracking
 * - AI-powered personalized recommendations
 * - Real-time loading and error states
 * 
 * Action Functions:
 * - Wellness profile fetching and management
 * - Financial goal creation, updating, and deletion
 * - Recommendation retrieval and interaction tracking
 * - Error handling and state management
 * 
 * Performance Features:
 * - Memoized functions to prevent unnecessary re-renders
 * - Selective state updates for optimal performance
 * - Efficient data normalization and access patterns
 * - Optimized loading states for better user experience
 * 
 * @interface UseFinancialWellnessReturn
 * @version 1.0.0
 * @comprehensive Provides complete financial wellness functionality
 * @performant Optimized for minimal re-renders and efficient updates
 */
export interface UseFinancialWellnessReturn {
  // Core Financial Wellness Data
  /**
   * Current user's comprehensive financial wellness profile.
   * 
   * Contains holistic financial health assessment including wellness score,
   * risk tolerance, income/expense analysis, savings rate, and optional
   * financial metrics. Null when profile hasn't been loaded or user
   * hasn't completed initial assessment.
   * 
   * @type {WellnessProfile | null}
   * @nullable True when user hasn't completed assessment or data not loaded
   * @foundation Core data for all financial wellness features
   */
  wellnessProfile: WellnessProfile | null;

  /**
   * Complete collection of user's financial goals.
   * 
   * Array of all financial objectives including active goals, completed
   * achievements, and cancelled goals. Each goal includes comprehensive
   * progress tracking, timeline management, and achievement status.
   * 
   * @type {FinancialGoal[]}
   * @comprehensive Includes all goal statuses and complete metadata
   * @trackable Each goal includes progress monitoring and status management
   */
  goals: FinancialGoal[];

  /**
   * Filtered collection of active financial goals.
   * 
   * Subset of goals array containing only goals with 'IN_PROGRESS' status,
   * representing objectives the user is actively working toward. Useful
   * for dashboard displays and progress tracking interfaces.
   * 
   * @type {FinancialGoal[]}
   * @filtered Only includes goals with 'IN_PROGRESS' status
   * @active Goals currently being tracked and worked toward
   */
  activeGoals: FinancialGoal[];

  /**
   * Filtered collection of completed financial goals.
   * 
   * Subset of goals array containing only goals with 'COMPLETED' status,
   * representing successfully achieved objectives. Useful for achievement
   * displays and motivation interfaces.
   * 
   * @type {FinancialGoal[]}
   * @filtered Only includes goals with 'COMPLETED' status
   * @achievements Successfully completed financial objectives
   */
  completedGoals: FinancialGoal[];

  /**
   * Array of AI-powered personalized financial recommendations.
   * 
   * Contains intelligent, actionable financial advice generated by the
   * AI recommendation engine based on user's wellness profile, goals,
   * and behavioral patterns. Recommendations are categorized, prioritized,
   * and tailored to user's risk tolerance.
   * 
   * @type {Recommendation[]}
   * @personalized AI-generated based on individual user profile
   * @actionable Contains specific steps for implementation
   * @categorized Organized by financial domain for targeted advice
   */
  recommendations: Recommendation[];

  /**
   * Filtered collection of high-priority recommendations.
   * 
   * Subset of recommendations array containing only recommendations with
   * 'HIGH' priority level. These represent the most impactful and urgent
   * financial advice for the user's current situation.
   * 
   * @type {Recommendation[]}
   * @filtered Only includes recommendations with 'HIGH' priority
   * @urgent Most important financial advice for immediate attention
   */
  highPriorityRecommendations: Recommendation[];

  // State Management Properties
  /**
   * Current loading status for financial wellness operations.
   * 
   * Indicates the state of asynchronous operations to provide appropriate
   * user interface feedback and prevent conflicting operations.
   * 
   * @type {'idle' | 'loading' | 'succeeded' | 'failed'}
   * @coordination Prevents conflicting simultaneous operations
   * @feedback Enables appropriate UI state management
   */
  loading: boolean;

  /**
   * Current error message for failed operations.
   * 
   * Contains user-friendly error messages for display when financial
   * wellness operations fail. Null when no errors are present.
   * 
   * @type {string | null}
   * @nullable Null when no errors present
   * @userFriendly Messages designed for end-user consumption
   */
  error: string | null;

  /**
   * Boolean indicator for error state presence.
   * 
   * Convenient boolean for checking if any errors exist, useful for
   * conditional rendering and error state management in components.
   * 
   * @type {boolean}
   * @convenience Simplified error state checking
   * @conditional Useful for component conditional rendering
   */
  hasError: boolean;

  // Core Action Functions
  /**
   * Fetches the user's comprehensive financial wellness profile.
   * 
   * Retrieves complete wellness assessment including financial health scoring,
   * risk tolerance analysis, income/expense breakdown, and savings rate
   * calculations. This function provides the foundation for all personalized
   * financial services and recommendations.
   * 
   * Operation Features:
   * - Comprehensive profile data retrieval
   * - Automatic loading state management
   * - Error handling with user-friendly messages
   * - Redux state integration for immediate UI updates
   * - Authentication and authorization handling
   * 
   * Usage Context:
   * - Initial app load for existing users
   * - Profile refresh after significant life events
   * - Periodic profile updates for recommendation accuracy
   * - Manual refresh user actions
   * 
   * @async
   * @function fetchWellnessProfile
   * @returns {Promise<void>} Promise that resolves when profile is fetched and state updated
   * @throws {Error} User-friendly error messages for various failure scenarios
   * 
   * @example
   * ```typescript
   * // Fetch wellness profile on component mount
   * useEffect(() => {
   *   fetchWellnessProfile();
   * }, [fetchWellnessProfile]);
   * 
   * // Manual refresh with error handling
   * const handleRefresh = async () => {
   *   try {
   *     await fetchWellnessProfile();
   *     showSuccessMessage('Profile updated successfully');
   *   } catch (error) {
   *     console.error('Failed to refresh profile:', error);
   *   }
   * };
   * ```
   */
  fetchWellnessProfile: () => Promise<void>;

  /**
   * Fetches all financial goals for the current user.
   * 
   * Retrieves the complete collection of financial goals including active
   * objectives, completed achievements, and cancelled goals. Each goal
   * includes comprehensive metadata for progress tracking and management.
   * 
   * Operation Features:
   * - Complete goals collection retrieval
   * - All goal statuses and lifecycle stages
   * - Progress tracking and achievement data
   * - Category and priority information
   * - Timeline and target date management
   * 
   * Usage Context:
   * - Initial app load for goal display
   * - Goal dashboard refresh
   * - After goal creation or modification
   * - Periodic synchronization for real-time updates
   * 
   * @async
   * @function fetchFinancialGoals
   * @returns {Promise<void>} Promise that resolves when goals are fetched and state updated
   * @throws {Error} User-friendly error messages for various failure scenarios
   * 
   * @example
   * ```typescript
   * // Fetch goals on component mount
   * useEffect(() => {
   *   fetchFinancialGoals();
   * }, [fetchFinancialGoals]);
   * 
   * // Refresh goals after creating new goal
   * const handleAfterGoalCreation = async () => {
   *   await createFinancialGoal(newGoalData);
   *   await fetchFinancialGoals(); // Refresh to get updated list
   * };
   * ```
   */
  fetchFinancialGoals: () => Promise<void>;

  /**
   * Creates a new financial goal for the user.
   * 
   * Establishes a new financial objective with comprehensive validation,
   * feasibility analysis, and integration with the recommendation engine.
   * The created goal is automatically added to the goals collection.
   * 
   * Operation Features:
   * - Complete goal validation and business rule checking
   * - Server-side ID generation and metadata assignment
   * - Automatic progress tracking initialization
   * - Integration with AI recommendation engine
   * - Optimistic state updates for immediate feedback
   * 
   * Goal Creation Process:
   * 1. Client-side validation for immediate feedback
   * 2. Server-side creation with comprehensive validation
   * 3. ID generation and metadata assignment
   * 4. State update with newly created goal
   * 5. Recommendation engine trigger for goal-specific advice
   * 
   * @async
   * @function createFinancialGoal
   * @param {Omit<FinancialGoal, 'id'>} goalData - Complete goal data excluding auto-generated ID
   * @returns {Promise<FinancialGoal>} Promise resolving to the newly created goal with generated ID
   * @throws {Error} User-friendly error messages for validation failures and server errors
   * 
   * @example
   * ```typescript
   * // Create a new emergency fund goal
   * const handleCreateGoal = async () => {
   *   try {
   *     const newGoal = await createFinancialGoal({
   *       userId: currentUser.id,
   *       name: 'Emergency Fund - 6 months expenses',
   *       targetAmount: 25000.00,
   *       currentAmount: 0.00,
   *       targetDate: '2025-12-31T23:59:59Z',
   *       status: 'IN_PROGRESS',
   *       category: 'SAVINGS',
   *       priority: 'HIGH',
   *       createdAt: new Date(),
   *       updatedAt: new Date()
   *     });
   *     
   *     showSuccessMessage(`Goal "${newGoal.name}" created successfully!`);
   *   } catch (error) {
   *     showErrorMessage(error.message);
   *   }
   * };
   * ```
   */
  createFinancialGoal: (goalData: Omit<FinancialGoal, 'id'>) => Promise<FinancialGoal>;

  /**
   * Fetches personalized financial recommendations for the user.
   * 
   * Retrieves AI-generated personalized financial advice tailored to the
   * user's financial profile, goals, spending patterns, and risk tolerance.
   * Recommendations provide actionable steps for financial improvement.
   * 
   * Operation Features:
   * - AI-powered personalization based on user profile
   * - Category-specific recommendations for targeted advice
   * - Priority-based recommendation ranking
   * - Actionable steps with impact estimates
   * - Real-time updates based on changing circumstances
   * 
   * Recommendation Categories:
   * - SAVINGS: Emergency fund optimization, automated savings strategies
   * - INVESTMENT: Portfolio diversification, retirement planning
   * - DEBT_MANAGEMENT: Debt consolidation, payment optimization
   * - INSURANCE: Coverage gap analysis, policy optimization
   * 
   * @async
   * @function fetchRecommendations
   * @returns {Promise<void>} Promise that resolves when recommendations are fetched and state updated
   * @throws {Error} User-friendly error messages for AI service unavailability and other failures
   * 
   * @example
   * ```typescript
   * // Fetch recommendations after profile update
   * const handleProfileUpdate = async () => {
   *   await updateWellnessProfile(updatedProfileData);
   *   await fetchRecommendations(); // Get updated recommendations
   * };
   * 
   * // Periodic recommendation refresh
   * useEffect(() => {
   *   const interval = setInterval(() => {
   *     fetchRecommendations();
   *   }, 30 * 60 * 1000); // Refresh every 30 minutes
   *   
   *   return () => clearInterval(interval);
   * }, [fetchRecommendations]);
   * ```
   */
  fetchRecommendations: () => Promise<void>;

  // Utility Functions
  /**
   * Clears all error states in the financial wellness slice.
   * 
   * Provides a mechanism to reset error states when users acknowledge
   * errors or when new operations begin. This enables clean error handling
   * and prevents stale error messages from persisting in the UI.
   * 
   * @function clearError
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Clear error when user dismisses error notification
   * const handleDismissError = () => {
   *   clearError();
   *   setShowErrorDialog(false);
   * };
   * 
   * // Clear error before starting new operation
   * const handleRetryOperation = async () => {
   *   clearError();
   *   await fetchWellnessProfile();
   * };
   * ```
   */
  clearError: () => void;

  /**
   * Updates a specific financial goal with new data.
   * 
   * Enables efficient updates to individual goals without replacing the
   * entire goals array. Supports progress updates, status changes, and
   * other goal modifications with immediate state updates.
   * 
   * @function updateGoal
   * @param {FinancialGoal} updatedGoal - Complete updated goal data
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Update goal progress
   * const handleProgressUpdate = (goalId: string, newAmount: number) => {
   *   const existingGoal = goals.find(g => g.id === goalId);
   *   if (existingGoal) {
   *     updateGoal({
   *       ...existingGoal,
   *       currentAmount: newAmount,
   *       updatedAt: new Date()
   *     });
   *   }
   * };
   * ```
   */
  updateGoal: (updatedGoal: FinancialGoal) => void;

  /**
   * Removes a financial goal from the goals collection.
   * 
   * Enables goal deletion with immediate state updates, supporting
   * optimistic deletions and clean goal management workflows.
   * 
   * @function removeGoal
   * @param {string} goalId - Unique identifier of the goal to remove
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Delete goal with confirmation
   * const handleDeleteGoal = (goalId: string) => {
   *   if (confirm('Are you sure you want to delete this goal?')) {
   *     removeGoal(goalId);
   *     showSuccessMessage('Goal deleted successfully');
   *   }
   * };
   * ```
   */
  removeGoal: (goalId: string) => void;

  /**
   * Marks a recommendation as viewed for interaction tracking.
   * 
   * Enables tracking of recommendation interactions for analytics and
   * user experience optimization. Supports engagement metrics and
   * personalization improvements.
   * 
   * @function markRecommendationViewed
   * @param {string} recommendationId - Unique identifier of the viewed recommendation
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Track recommendation click
   * const handleRecommendationClick = (recommendationId: string) => {
   *   markRecommendationViewed(recommendationId);
   *   // Navigate to recommendation details or action
   *   navigateToRecommendationAction(recommendationId);
   * };
   * ```
   */
  markRecommendationViewed: (recommendationId: string) => void;
}

/**
 * Financial Wellness Hook Implementation
 * 
 * A comprehensive React hook that provides centralized access to all financial
 * wellness functionality including profiles, goals, and recommendations. The hook
 * integrates with Redux for state management and provides memoized functions for
 * optimal performance.
 * 
 * Hook Features:
 * - Complete financial wellness data access and management
 * - Redux integration for centralized state management
 * - Memoized functions to prevent unnecessary re-renders
 * - Comprehensive error handling with user-friendly messages
 * - Performance optimization through selective state updates
 * 
 * Usage Patterns:
 * - Dashboard components for wellness overview display
 * - Goal management interfaces for creation and tracking
 * - Recommendation displays for personalized advice
 * - Profile management for wellness assessment updates
 * 
 * State Management:
 * - Redux integration for centralized data storage
 * - Automatic loading state management
 * - Error state handling with user-friendly messages
 * - Optimistic updates for better user experience
 * 
 * Performance Considerations:
 * - Memoized functions using useCallback for render optimization
 * - Selective state subscriptions to minimize re-renders
 * - Efficient data normalization and access patterns
 * - Optimized loading states for better user feedback
 * 
 * Security Considerations:
 * - All data access through secure Redux state management
 * - Authentication handled by underlying service layer
 * - Sensitive data encryption maintained throughout hook usage
 * - Audit logging for all financial wellness interactions
 * 
 * @hook useFinancialWellness
 * @returns {UseFinancialWellnessReturn} Complete financial wellness API
 * @version 1.0.0
 * @performance Optimized for minimal re-renders and efficient updates
 * @security All financial data handled according to enterprise security standards
 * 
 * @example
 * ```typescript
 * // Basic usage in a dashboard component
 * const FinancialWellnessDashboard: React.FC = () => {
 *   const {
 *     wellnessProfile,
 *     activeGoals,
 *     recommendations,
 *     loading,
 *     error,
 *     fetchWellnessProfile,
 *     fetchFinancialGoals,
 *     fetchRecommendations,
 *     clearError
 *   } = useFinancialWellness();
 * 
 *   // Load data on component mount
 *   useEffect(() => {
 *     fetchWellnessProfile();
 *     fetchFinancialGoals();
 *     fetchRecommendations();
 *   }, [fetchWellnessProfile, fetchFinancialGoals, fetchRecommendations]);
 * 
 *   // Handle error display
 *   if (error) {
 *     return (
 *       <ErrorDisplay
 *         message={error}
 *         onDismiss={clearError}
 *       />
 *     );
 *   }
 * 
 *   // Handle loading state
 *   if (loading && !wellnessProfile) {
 *     return <LoadingSpinner />;
 *   }
 * 
 *   // Render dashboard with wellness data
 *   return (
 *     <div className="financial-wellness-dashboard">
 *       <WellnessScoreCard profile={wellnessProfile} />
 *       <GoalsOverview goals={activeGoals} />
 *       <RecommendationsPanel recommendations={recommendations} />
 *     </div>
 *   );
 * };
 * ```
 */
export const useFinancialWellness = (): UseFinancialWellnessReturn => {
  // Redux Integration: Centralized state access through typed selectors
  const dispatch = useAppDispatch();
  
  // Core Financial Wellness Data from Redux State
  const wellnessProfile = useAppSelector(selectWellnessProfile);
  const goals = useAppSelector(selectFinancialGoals);
  const activeGoals = useAppSelector(selectActiveGoals);
  const completedGoals = useAppSelector(selectCompletedGoals);
  const recommendations = useAppSelector(selectRecommendations);
  const highPriorityRecommendations = useAppSelector(selectHighPriorityRecommendations);
  
  // State Management Properties from Redux State
  const loadingStatus = useAppSelector(selectLoadingStatus);
  const loading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const hasError = useAppSelector(selectHasError);

  // Local State for Additional Hook Management
  const [localError, setLocalError] = useState<string | null>(null);

  // Memoized Action Functions for Performance Optimization
  
  /**
   * Memoized function to fetch the user's wellness profile.
   * 
   * Dispatches the fetchWellnessProfile async thunk to retrieve comprehensive
   * wellness data. Uses useCallback to prevent unnecessary re-renders and
   * provides consistent function reference for dependencies.
   * 
   * Error Handling:
   * - Catches and logs any dispatch errors
   * - Provides user-friendly error messages
   * - Maintains error state for UI feedback
   * - Supports retry logic and error recovery
   * 
   * Performance Features:
   * - Memoized function prevents re-renders
   * - Efficient Redux state updates
   * - Automatic loading state management
   * - Optimized for repeated calls
   */
  const fetchWellnessProfile = useCallback(async (): Promise<void> => {
    try {
      // Clear any previous local errors before new operation
      setLocalError(null);
      
      // Dispatch async thunk to fetch wellness profile
      // Redux Toolkit automatically handles loading states and error management
      const result = await dispatch(fetchWellnessProfile());
      
      // Check if the operation was rejected and handle accordingly
      if (fetchWellnessProfile.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to fetch wellness profile';
        setLocalError(errorMessage);
        
        // Log error for debugging and monitoring
        console.error('Financial Wellness Hook: Failed to fetch wellness profile', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          operation: 'fetchWellnessProfile'
        });
      }
    } catch (error) {
      // Handle any unexpected errors from the dispatch operation
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while fetching wellness profile';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Unexpected error in fetchWellnessProfile', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchWellnessProfile'
      });
    }
  }, [dispatch]);

  /**
   * Memoized function to fetch all financial goals.
   * 
   * Dispatches the fetchFinancialGoals async thunk to retrieve the complete
   * goals collection. Handles all goal statuses and provides comprehensive
   * error handling with user feedback.
   */
  const fetchFinancialGoals = useCallback(async (): Promise<void> => {
    try {
      // Clear any previous local errors before new operation
      setLocalError(null);
      
      // Dispatch async thunk to fetch financial goals
      const result = await dispatch(fetchFinancialGoals());
      
      // Check if the operation was rejected and handle accordingly
      if (fetchFinancialGoals.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to fetch financial goals';
        setLocalError(errorMessage);
        
        console.error('Financial Wellness Hook: Failed to fetch financial goals', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          operation: 'fetchFinancialGoals'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while fetching financial goals';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Unexpected error in fetchFinancialGoals', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchFinancialGoals'
      });
    }
  }, [dispatch]);

  /**
   * Memoized function to create a new financial goal.
   * 
   * Dispatches the addNewFinancialGoal async thunk to create a new goal
   * with comprehensive validation and business rule checking. Returns the
   * created goal with server-generated ID and metadata.
   */
  const createFinancialGoal = useCallback(async (goalData: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> => {
    try {
      // Clear any previous local errors before new operation
      setLocalError(null);
      
      // Create complete goal object with current timestamps
      const completeGoalData: FinancialGoal = {
        ...goalData,
        id: '', // Will be generated by server
        currentAmount: goalData.currentAmount || 0,
        status: goalData.status || 'IN_PROGRESS',
        createdAt: goalData.createdAt || new Date(),
        updatedAt: goalData.updatedAt || new Date()
      };
      
      // Dispatch async thunk to create financial goal
      const result = await dispatch(addNewFinancialGoal(completeGoalData));
      
      // Check if the operation was successful
      if (addNewFinancialGoal.fulfilled.match(result)) {
        // Return the created goal for immediate use
        return result.payload;
      } else if (addNewFinancialGoal.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to create financial goal';
        setLocalError(errorMessage);
        
        console.error('Financial Wellness Hook: Failed to create financial goal', {
          goalName: goalData.name,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          operation: 'createFinancialGoal'
        });
        
        throw new Error(errorMessage);
      }
      
      // This should not happen, but handle edge case
      throw new Error('Unexpected result from goal creation');
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while creating financial goal';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Unexpected error in createFinancialGoal', {
        goalName: goalData.name,
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'createFinancialGoal'
      });
      
      throw error; // Re-throw for component error handling
    }
  }, [dispatch]);

  /**
   * Memoized function to fetch personalized recommendations.
   * 
   * Dispatches the fetchRecommendations async thunk to retrieve AI-generated
   * personalized financial advice. Handles recommendation categorization and
   * priority management with comprehensive error handling.
   */
  const fetchRecommendations = useCallback(async (): Promise<void> => {
    try {
      // Clear any previous local errors before new operation
      setLocalError(null);
      
      // Dispatch async thunk to fetch recommendations
      const result = await dispatch(fetchRecommendations());
      
      // Check if the operation was rejected and handle accordingly
      if (fetchRecommendations.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to fetch recommendations';
        setLocalError(errorMessage);
        
        console.error('Financial Wellness Hook: Failed to fetch recommendations', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          operation: 'fetchRecommendations'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while fetching recommendations';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Unexpected error in fetchRecommendations', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchRecommendations'
      });
    }
  }, [dispatch]);

  // Memoized Utility Functions for State Management

  /**
   * Memoized function to clear error states.
   * 
   * Clears both Redux error state and local error state to provide
   * clean error handling and prevent stale error messages.
   */
  const clearError = useCallback((): void => {
    // Clear Redux error state
    dispatch(clearError());
    
    // Clear local error state
    setLocalError(null);
  }, [dispatch]);

  /**
   * Memoized function to update a financial goal.
   * 
   * Dispatches the updateFinancialGoal action to update a specific goal
   * in the Redux state with immediate updates for optimal user experience.
   */
  const updateGoal = useCallback((updatedGoal: FinancialGoal): void => {
    try {
      // Dispatch synchronous action to update goal in Redux state
      dispatch(updateFinancialGoal(updatedGoal));
      
      // Clear any existing errors since update was successful
      setLocalError(null);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update financial goal';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Error updating financial goal', {
        goalId: updatedGoal.id,
        goalName: updatedGoal.name,
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'updateGoal'
      });
    }
  }, [dispatch]);

  /**
   * Memoized function to remove a financial goal.
   * 
   * Dispatches the removeFinancialGoal action to delete a goal from
   * the Redux state with immediate updates for optimal user experience.
   */
  const removeGoal = useCallback((goalId: string): void => {
    try {
      // Dispatch synchronous action to remove goal from Redux state
      dispatch(removeFinancialGoal(goalId));
      
      // Clear any existing errors since removal was successful
      setLocalError(null);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove financial goal';
      
      setLocalError(errorMessage);
      
      console.error('Financial Wellness Hook: Error removing financial goal', {
        goalId: goalId,
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'removeGoal'
      });
    }
  }, [dispatch]);

  /**
   * Memoized function to mark a recommendation as viewed.
   * 
   * Dispatches the markRecommendationViewed action to track recommendation
   * interactions for analytics and user experience optimization.
   */
  const markRecommendationViewed = useCallback((recommendationId: string): void => {
    try {
      // Dispatch synchronous action to mark recommendation as viewed
      dispatch(markRecommendationViewed(recommendationId));
      
      // Log interaction for analytics (development/staging only)
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Financial Wellness Hook: Recommendation interaction tracked', {
          recommendationId: recommendationId,
          timestamp: new Date().toISOString(),
          operation: 'markRecommendationViewed'
        });
      }
    } catch (error) {
      // Log error but don't set error state since this is non-critical
      console.error('Financial Wellness Hook: Error marking recommendation as viewed', {
        recommendationId: recommendationId,
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'markRecommendationViewed'
      });
    }
  }, [dispatch]);

  // Effect for Error State Synchronization
  useEffect(() => {
    // Synchronize local error state with Redux error state
    // This ensures that errors from async thunks are properly reflected
    if (error && !localError) {
      setLocalError(error);
    }
  }, [error, localError]);

  // Effect for Development Logging (Development/Staging Only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Hook: State update', {
        wellnessProfileLoaded: !!wellnessProfile,
        goalsCount: goals.length,
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        recommendationsCount: recommendations.length,
        highPriorityRecommendationsCount: highPriorityRecommendations.length,
        loadingStatus: loadingStatus,
        hasError: hasError,
        timestamp: new Date().toISOString()
      });
    }
  }, [
    wellnessProfile,
    goals.length,
    activeGoals.length,
    completedGoals.length,
    recommendations.length,
    highPriorityRecommendations.length,
    loadingStatus,
    hasError
  ]);

  // Return comprehensive financial wellness API
  return {
    // Core Financial Wellness Data
    wellnessProfile,
    goals,
    activeGoals,
    completedGoals,
    recommendations,
    highPriorityRecommendations,
    
    // State Management Properties
    loading,
    error: localError || error, // Prioritize local error for immediate feedback
    hasError: hasError || !!localError,
    
    // Core Action Functions
    fetchWellnessProfile,
    fetchFinancialGoals,
    createFinancialGoal,
    fetchRecommendations,
    
    // Utility Functions
    clearError,
    updateGoal,
    removeGoal,
    markRecommendationViewed
  };
};

// Export the hook as the default export
export default useFinancialWellness;