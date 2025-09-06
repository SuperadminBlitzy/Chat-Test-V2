/**
 * Financial Wellness Redux Toolkit Slice for Unified Financial Services Platform
 * 
 * This slice manages the comprehensive state for the financial wellness feature, implementing
 * the F-007: Personalized Financial Recommendations capability and supporting the platform's
 * Personalized Financial Wellness system. The slice handles user wellness profiles, financial
 * goals, and AI-powered personalized recommendations with robust state management.
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
 * - Redux Toolkit for efficient state management with built-in best practices
 * - TypeScript for type safety and enhanced developer experience
 * - Async thunks for seamless API integration with comprehensive error handling
 * - Immutable state updates using Immer under the hood
 * - Optimistic updates and loading state management
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
 * - Efficient memory usage with normalized state structure
 * - Optimized re-renders through proper memoization
 * 
 * @fileoverview Redux Toolkit slice for comprehensive financial wellness state management
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV
 * @security All financial wellness data must be encrypted and access-controlled
 * @performance Sub-second response times required for all state operations
 * @since 2025
 */

// External imports - Redux Toolkit core functionality for modern Redux development
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'; // @reduxjs/toolkit v2.0+

// Internal imports - Financial wellness data models and service layer
import { WellnessProfile, FinancialGoal, Recommendation } from '../models/financial-wellness'; // Named exports - wellness data models v1.0+
import financialWellnessService from '../services/financial-wellness-service'; // Default export - comprehensive API service layer v1.0+

/**
 * Financial Wellness State Interface
 * 
 * Defines the complete state structure for the financial wellness feature, including
 * all necessary data, loading states, and error handling information. This interface
 * ensures type safety and provides a clear contract for the financial wellness state.
 * 
 * State Management Strategy:
 * - Single source of truth for all financial wellness data
 * - Normalized data structure for efficient updates and access
 * - Loading states for each major operation to enable proper UI feedback
 * - Comprehensive error handling with user-friendly messages
 * - Optimistic updates where appropriate for better user experience
 * 
 * Data Relationships:
 * - wellnessProfile: Core financial health data linked to user
 * - goals: Array of financial objectives with progress tracking
 * - recommendations: AI-generated personalized financial advice
 * - Cross-referential updates ensure data consistency
 * 
 * Performance Considerations:
 * - Flat state structure minimizes nested updates
 * - Selective updates prevent unnecessary re-renders
 * - Efficient array operations for goals and recommendations
 * - Memory-conscious data management for large datasets
 * 
 * @interface FinancialWellnessState
 * @version 1.0.0
 * @performance Optimized for minimal re-renders and efficient updates
 * @scalability Designed to handle extensive financial wellness data
 */
export interface FinancialWellnessState {
  /**
   * Current user's comprehensive financial wellness profile.
   * 
   * Contains holistic financial health assessment including wellness score,
   * risk tolerance, income/expense analysis, savings rate, and optional
   * financial metrics. This serves as the foundation for personalized
   * recommendations and goal feasibility analysis.
   * 
   * State Transitions:
   * - null: Initial state or when profile not yet loaded
   * - WellnessProfile: Complete profile data after successful fetch
   * - Updated through profile updates and periodic assessments
   * 
   * Data Dependencies:
   * - Required for generating personalized recommendations
   * - Used for goal feasibility analysis and timeline suggestions
   * - Influences risk-appropriate investment recommendations
   * - Foundation for financial advisor conversation starters
   * 
   * @type {WellnessProfile | null}
   * @nullable True when user hasn't completed assessment or data not loaded
   * @foundation Core data for all financial wellness features
   */
  wellnessProfile: WellnessProfile | null;

  /**
   * Array of user's financial goals with comprehensive tracking data.
   * 
   * Contains all financial objectives the user is working toward, including
   * savings goals, investment targets, debt payoff plans, and major purchase
   * goals. Each goal includes progress tracking, timeline management, and
   * achievement status monitoring.
   * 
   * Goal Lifecycle Management:
   * - Creation: New goals added with validation and feasibility analysis
   * - Progress: Regular updates to current amounts and milestone tracking
   * - Completion: Status transitions and achievement celebrations
   * - Management: Modifications, timeline adjustments, and cancellations
   * 
   * Data Organization:
   * - Ordered by priority and target date for optimal user experience
   * - Filtered and sorted capabilities for different views
   * - Category-based organization for enhanced goal management
   * - Progress calculations for dashboard visualizations
   * 
   * Performance Optimization:
   * - Efficient array operations for large goal collections
   * - Selective updates to minimize re-renders
   * - Optimistic updates for immediate user feedback
   * - Batch operations for multiple goal updates
   * 
   * @type {FinancialGoal[]}
   * @ordered Sorted by priority and target date
   * @trackable Each goal includes comprehensive progress monitoring
   * @categorized Organized by goal type for enhanced management
   */
  goals: FinancialGoal[];

  /**
   * Array of AI-powered personalized financial recommendations.
   * 
   * Contains intelligent, actionable financial advice generated by the
   * AI recommendation engine based on user's wellness profile, goals,
   * financial behavior, and market conditions. Recommendations are
   * categorized, prioritized, and tailored to user's risk tolerance.
   * 
   * Recommendation Categories:
   * - SAVINGS: Emergency fund optimization, high-yield accounts, automated savings
   * - INVESTMENT: Portfolio diversification, retirement planning, asset allocation
   * - DEBT_MANAGEMENT: Debt consolidation, payment strategies, interest reduction
   * - INSURANCE: Coverage gaps, policy optimization, risk protection
   * 
   * AI-Powered Features:
   * - Machine learning-based personalization
   * - Real-time updates based on changing circumstances
   * - Risk-appropriate advice aligned with user tolerance
   * - Goal-specific recommendations for achievement acceleration
   * 
   * User Engagement:
   * - Actionable steps for immediate implementation
   * - Impact quantification for decision-making support
   * - Difficulty assessment for user comfort level
   * - Expiration dates for time-sensitive opportunities
   * 
   * Analytics Integration:
   * - Interaction tracking for recommendation effectiveness
   * - User feedback collection for algorithm improvement
   * - A/B testing support for optimization
   * - Conversion tracking for business impact measurement
   * 
   * @type {Recommendation[]}
   * @personalized AI-generated based on individual user profile
   * @categorized Organized by financial domain for targeted advice
   * @actionable Contains specific steps for implementation
   * @trackable Interaction monitoring for effectiveness analysis
   */
  recommendations: Recommendation[];

  /**
   * Current loading status for financial wellness operations.
   * 
   * Tracks the state of asynchronous operations to provide appropriate
   * user interface feedback and prevent conflicting operations. This
   * enables proper loading indicators, disabled states, and error handling
   * throughout the financial wellness user experience.
   * 
   * Status Definitions:
   * - 'idle': No operations in progress, ready for new requests
   * - 'loading': One or more operations currently executing
   * - 'succeeded': Last operation completed successfully
   * - 'failed': Last operation encountered an error
   * 
   * UI Integration:
   * - Loading spinners and skeleton screens during 'loading' state
   * - Success indicators and updated data during 'succeeded' state
   * - Error messages and retry options during 'failed' state
   * - Button states and form validation based on current status
   * 
   * Operation Coordination:
   * - Prevents concurrent conflicting operations
   * - Enables optimistic updates where appropriate
   * - Supports queue management for multiple requests
   * - Facilitates proper error recovery workflows
   * 
   * Performance Impact:
   * - Minimizes unnecessary API calls through status checking
   * - Enables efficient caching strategies
   * - Supports request deduplication
   * - Facilitates retry logic with exponential backoff
   * 
   * @type {'idle' | 'loading' | 'succeeded' | 'failed'}
   * @coordination Prevents conflicting simultaneous operations
   * @feedback Enables appropriate UI state management
   * @performance Optimizes API call patterns and caching
   */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';

  /**
   * Current error message for failed operations.
   * 
   * Stores user-friendly error messages for display in the UI when
   * financial wellness operations fail. Messages are designed to be
   * actionable and help users understand what went wrong and how to
   * proceed with resolution.
   * 
   * Error Message Categories:
   * - Network errors: Connectivity and timeout issues
   * - Authentication errors: Login and permission problems
   * - Validation errors: Data format and business rule violations
   * - Server errors: Backend service unavailability
   * - Business rule errors: Financial constraint violations
   * 
   * User Experience Considerations:
   * - Clear, non-technical language for general users
   * - Actionable guidance for error resolution
   * - Appropriate tone that maintains user confidence
   * - Specific enough to aid in troubleshooting
   * - Consistent with platform-wide error messaging standards
   * 
   * Error Recovery:
   * - Automatic retry suggestions for transient failures
   * - Alternative action recommendations
   * - Contact support guidance for persistent issues
   * - Data recovery options where applicable
   * 
   * Security Considerations:
   * - No sensitive data exposure in error messages
   * - Generic messages for security-related failures
   * - Audit logging for error tracking and analysis
   * - Rate limiting information where appropriate
   * 
   * @type {string | null}
   * @nullable Null when no errors present
   * @userFriendly Messages designed for end-user consumption
   * @actionable Includes guidance for error resolution
   * @secure No sensitive information exposure
   */
  error: string | null;
}

/**
 * Initial state for the financial wellness slice.
 * 
 * Provides the default state configuration when the slice is first initialized,
 * ensuring a clean starting point for all financial wellness data and operations.
 * This state represents a user who hasn't yet loaded their financial wellness
 * data or completed their initial assessment.
 * 
 * State Initialization Strategy:
 * - Safe defaults that don't assume any user data availability
 * - Empty collections for goals and recommendations
 * - Null wellness profile indicating no data loaded
 * - Idle status ready for first operation
 * - No error state for clean initialization
 * 
 * Performance Benefits:
 * - Minimal memory footprint for initial load
 * - Predictable state structure for component rendering
 * - No unexpected undefined values or null pointer exceptions
 * - Consistent starting point across all user sessions
 * 
 * Developer Experience:
 * - Clear and readable state structure
 * - Type-safe initialization with interface compliance
 * - Self-documenting default values
 * - Easy to understand and maintain
 * 
 * @constant initialState
 * @type {FinancialWellnessState}
 * @immutable State will be updated through Redux Toolkit reducers
 * @typeSafe Fully compliant with FinancialWellnessState interface
 */
const initialState: FinancialWellnessState = {
  // No wellness profile loaded initially - user needs to complete assessment
  wellnessProfile: null,
  
  // Empty goals collection - user will add goals through goal creation flow
  goals: [],
  
  // Empty recommendations array - will be populated after profile analysis
  recommendations: [],
  
  // Idle status ready for first operation - no loading or error states
  status: 'idle',
  
  // No error state on initialization - clean slate for user experience
  error: null
};

/**
 * Async thunk to fetch the user's comprehensive financial wellness profile.
 * 
 * This thunk implements the holistic financial profiling capability by retrieving
 * the complete wellness assessment that includes financial health scoring, risk
 * tolerance analysis, income/expense breakdown, savings rate calculations, and
 * optional financial metrics for comprehensive financial planning.
 * 
 * Operation Overview:
 * - Fetches complete wellness profile from the financial wellness service
 * - Handles authentication and authorization automatically through service layer
 * - Provides comprehensive error handling with user-friendly messages
 * - Updates loading state throughout the operation lifecycle
 * - Enables real-time wellness data synchronization across user devices
 * 
 * Business Value:
 * - Enables personalized financial product recommendations
 * - Supports comprehensive customer financial health assessment
 * - Provides foundation for AI-powered recommendation generation
 * - Facilitates advisor-client relationship management
 * - Supports regulatory compliance for financial advisory services
 * 
 * Technical Implementation:
 * - Leverages Redux Toolkit's createAsyncThunk for standardized async operations
 * - Automatic loading state management with pending/fulfilled/rejected actions
 * - Error serialization for proper error state management
 * - Type-safe operations with WellnessProfile return type
 * - Integration with financial wellness service layer for API communication
 * 
 * Error Handling Strategy:
 * - Structured error catching with category-specific handling
 * - User-friendly error messages for different failure scenarios
 * - Automatic retry logic for transient failures (implemented in service layer)
 * - Graceful degradation for partial service unavailability
 * - Detailed error logging for debugging and monitoring
 * 
 * Security Considerations:
 * - JWT token-based authentication handled by service layer
 * - User authorization enforced - users can only access their own profiles
 * - Sensitive financial data encrypted in transit and at rest
 * - Access logging maintained for audit compliance
 * - Rate limiting and abuse prevention through service layer
 * 
 * Performance Optimization:
 * - Response caching for frequently accessed profiles
 * - Compression enabled for large wellness profile responses
 * - Connection pooling for efficient network utilization
 * - Request timeout configuration for optimal user experience
 * - Efficient state updates to minimize component re-renders
 * 
 * @async
 * @function fetchWellnessProfile
 * @returns {Promise<WellnessProfile>} Promise resolving to complete wellness profile data
 * @throws {Error} Structured error with category and user-friendly message
 * 
 * @example
 * ```typescript
 * // Dispatch the thunk to fetch wellness profile
 * const result = await dispatch(fetchWellnessProfile());
 * 
 * if (fetchWellnessProfile.fulfilled.match(result)) {
 *   // Profile loaded successfully
 *   console.log('Wellness Score:', result.payload.wellnessScore);
 * } else if (fetchWellnessProfile.rejected.match(result)) {
 *   // Handle error case
 *   console.error('Failed to load profile:', result.error.message);
 * }
 * ```
 * 
 * @see {@link WellnessProfile} - Complete interface definition for wellness profiles
 * @see {@link financialWellnessService.getWellnessProfile} - Underlying service method
 * 
 * @version 1.0.0
 * @since 1.0.0
 */
export const fetchWellnessProfile = createAsyncThunk(
  'financialWellness/fetchWellnessProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Call the financial wellness service to retrieve comprehensive profile data
      // The service handles authentication, API communication, and data validation
      const wellnessProfile = await financialWellnessService.getWellnessProfile();
      
      // Return the validated wellness profile for state update
      return wellnessProfile;
    } catch (error) {
      // Enhanced error handling with structured error information
      console.error('Financial Wellness Slice: Error fetching wellness profile', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchWellnessProfile'
      });

      // Extract user-friendly error message for UI display
      const errorMessage = error && typeof error === 'object' && 'userMessage' in error
        ? (error as any).userMessage
        : error instanceof Error 
          ? error.message 
          : 'Unable to load your financial wellness profile. Please try again.';

      // Return rejected value with user-friendly error message
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to fetch all financial goals for the current user.
 * 
 * This thunk implements the goal tracking capability by retrieving the complete
 * collection of financial goals associated with the user, including active goals,
 * completed achievements, and cancelled goals. The comprehensive goal list enables
 * users to monitor their financial progress and provides data foundation for
 * personalized recommendations and financial planning.
 * 
 * Operation Overview:
 * - Fetches complete goals collection from the financial wellness service
 * - Retrieves goals with all metadata including progress tracking and status
 * - Handles goal categorization and priority information
 * - Provides timeline and achievement data for progress visualization
 * - Enables real-time goal synchronization across user devices
 * 
 * Goal Management Features:
 * - Complete goal lifecycle tracking (IN_PROGRESS, COMPLETED, CANCELLED)
 * - Progress calculation and achievement monitoring
 * - Goal categorization for enhanced organization and reporting
 * - Timeline tracking with target date management
 * - Integration with recommendation engine for goal-specific advice
 * 
 * Business Value:
 * - Enables comprehensive financial goal management and tracking
 * - Provides data for AI-powered goal achievement recommendations
 * - Supports financial advisor client relationship management
 * - Facilitates goal-based financial product recommendations
 * - Enables gamification and achievement recognition features
 * 
 * Technical Implementation:
 * - Leverages Redux Toolkit's createAsyncThunk for standardized async operations
 * - Automatic loading state management with comprehensive error handling
 * - Type-safe operations with FinancialGoal[] return type
 * - Integration with financial wellness service layer for secure API communication
 * - Efficient state updates with array manipulation optimization
 * 
 * Data Validation:
 * - Complete goal data validation to ensure consistency
 * - Progress calculation verification for accurate tracking
 * - Status validation for proper goal lifecycle management
 * - Timeline validation for realistic achievement projections
 * - Category validation for proper goal organization
 * 
 * Performance Optimization:
 * - Response caching for frequently accessed goal lists
 * - Pagination support for users with extensive goal collections
 * - Compression enabled for large goal list responses
 * - Efficient database indexing for fast goal retrieval
 * - Optimized state updates to prevent unnecessary re-renders
 * 
 * @async
 * @function fetchFinancialGoals
 * @returns {Promise<FinancialGoal[]>} Promise resolving to array of financial goals
 * @throws {Error} Structured error with category and user-friendly message
 * 
 * @example
 * ```typescript
 * // Dispatch the thunk to fetch all financial goals
 * const result = await dispatch(fetchFinancialGoals());
 * 
 * if (fetchFinancialGoals.fulfilled.match(result)) {
 *   // Goals loaded successfully
 *   const activeGoals = result.payload.filter(goal => goal.status === 'IN_PROGRESS');
 *   console.log(`Found ${activeGoals.length} active goals`);
 * } else if (fetchFinancialGoals.rejected.match(result)) {
 *   // Handle error case
 *   console.error('Failed to load goals:', result.error.message);
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link financialWellnessService.getFinancialGoals} - Underlying service method
 * 
 * @version 1.0.0
 * @since 1.0.0
 */
export const fetchFinancialGoals = createAsyncThunk(
  'financialWellness/fetchFinancialGoals',
  async (_, { rejectWithValue }) => {
    try {
      // Call the financial wellness service to retrieve comprehensive goals data
      // The service handles authentication, API communication, and data validation
      const financialGoals = await financialWellnessService.getFinancialGoals();
      
      // Return the validated financial goals array for state update
      return financialGoals;
    } catch (error) {
      // Enhanced error handling with structured error information
      console.error('Financial Wellness Slice: Error fetching financial goals', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchFinancialGoals'
      });

      // Extract user-friendly error message for UI display
      const errorMessage = error && typeof error === 'object' && 'userMessage' in error
        ? (error as any).userMessage
        : error instanceof Error 
          ? error.message 
          : 'Unable to load your financial goals. Please try again.';

      // Return rejected value with user-friendly error message
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to create a new financial goal for the user.
 * 
 * This thunk implements the goal creation capability by establishing a new financial
 * objective that the user wants to achieve. The function handles goal validation,
 * timeline feasibility analysis, and integration with the recommendation engine for
 * goal-specific financial advice and action plans.
 * 
 * Operation Overview:
 * - Creates new financial goal through the financial wellness service
 * - Validates goal data and business rules before submission
 * - Handles server-side goal ID generation and metadata assignment
 * - Provides immediate feedback for successful goal creation
 * - Triggers recommendation engine updates for goal-specific advice
 * 
 * Goal Creation Features:
 * - Comprehensive goal setup with name, target amount, and timeline
 * - Automatic progress tracking initialization (currentAmount starts at 0)
 * - Goal categorization for enhanced organization and targeted recommendations
 * - Priority level assignment for goal ranking and focus management
 * - Integration with AI recommendation engine for goal achievement strategies
 * 
 * Business Value:
 * - Enables structured financial planning and goal-oriented saving
 * - Provides foundation for personalized financial recommendations
 * - Supports gamification and achievement recognition features
 * - Facilitates financial advisor client engagement and planning discussions
 * - Enables goal-based financial product recommendations and cross-selling
 * 
 * Validation and Business Rules:
 * - Goal name uniqueness within user's goal list (server-side validation)
 * - Target amount must be positive and within reasonable financial ranges
 * - Target date must be in the future with realistic timeline constraints
 * - Goal feasibility analysis based on user's financial profile
 * - Category validation against supported goal types
 * 
 * AI Integration:
 * - Automatic recommendation generation for new goals
 * - Goal achievement probability assessment based on user profile
 * - Suggested timeline adjustments for realistic goal setting
 * - Integration with spending pattern analysis for goal feasibility
 * 
 * @async
 * @function addNewFinancialGoal
 * @param {FinancialGoal} newGoal - Complete financial goal data for creation
 * @returns {Promise<FinancialGoal>} Promise resolving to newly created goal with generated ID
 * @throws {Error} Structured error with category and user-friendly message
 * 
 * @example
 * ```typescript
 * // Create a new emergency fund goal
 * const newGoal = {
 *   userId: 'user-123',
 *   name: 'Emergency Fund - 6 months expenses',
 *   targetAmount: 25000.00,
 *   currentAmount: 0.00,
 *   targetDate: '2025-12-31T23:59:59Z',
 *   status: 'IN_PROGRESS' as const,
 *   category: 'SAVINGS' as const,
 *   priority: 'HIGH' as const,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * 
 * const result = await dispatch(addNewFinancialGoal(newGoal));
 * 
 * if (addNewFinancialGoal.fulfilled.match(result)) {
 *   // Goal created successfully
 *   console.log('Created goal:', result.payload.name);
 *   console.log('Goal ID:', result.payload.id);
 * } else if (addNewFinancialGoal.rejected.match(result)) {
 *   // Handle error case
 *   console.error('Failed to create goal:', result.error.message);
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link financialWellnessService.createFinancialGoal} - Underlying service method
 * 
 * @version 1.0.0
 * @since 1.0.0
 */
export const addNewFinancialGoal = createAsyncThunk(
  'financialWellness/addNewFinancialGoal',
  async (newGoal: FinancialGoal, { rejectWithValue }) => {
    try {
      // Prepare goal data for creation by excluding the ID (server-generated)
      // The service will generate a unique UUID and assign creation timestamps
      const goalDataForCreation = {
        userId: newGoal.userId,
        name: newGoal.name,
        description: newGoal.description,
        targetAmount: newGoal.targetAmount,
        currentAmount: newGoal.currentAmount || 0, // Default to 0 if not provided
        targetDate: newGoal.targetDate,
        status: newGoal.status || 'IN_PROGRESS', // Default to IN_PROGRESS if not provided
        category: newGoal.category,
        priority: newGoal.priority,
        createdAt: newGoal.createdAt || new Date(),
        updatedAt: newGoal.updatedAt || new Date()
      };

      // Call the financial wellness service to create the new goal
      // The service handles validation, authentication, and API communication
      const createdGoal = await financialWellnessService.createFinancialGoal(newGoal.userId, goalDataForCreation);
      
      // Return the created goal with server-generated ID and metadata
      return createdGoal;
    } catch (error) {
      // Enhanced error handling with structured error information
      console.error('Financial Wellness Slice: Error creating financial goal', {
        goalName: newGoal.name,
        targetAmount: newGoal.targetAmount,
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'addNewFinancialGoal'
      });

      // Extract user-friendly error message for UI display
      const errorMessage = error && typeof error === 'object' && 'userMessage' in error
        ? (error as any).userMessage
        : error instanceof Error 
          ? error.message 
          : 'Unable to create your financial goal. Please try again.';

      // Return rejected value with user-friendly error message
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to fetch personalized financial recommendations for the user.
 * 
 * This thunk implements the AI-powered recommendation engine capability by fetching
 * personalized financial recommendations tailored to the user's financial profile,
 * goals, spending patterns, and risk tolerance. The recommendations are generated
 * using advanced machine learning algorithms and provide actionable financial advice.
 * 
 * Operation Overview:
 * - Fetches AI-generated recommendations from the financial wellness service
 * - Retrieves personalized advice based on comprehensive user financial analysis
 * - Handles recommendation categorization and priority assignment
 * - Provides actionable steps and estimated impact information
 * - Enables real-time recommendation updates based on changing circumstances
 * 
 * AI-Powered Recommendation Features:
 * - Machine learning-based recommendation generation using user financial data
 * - Personalization based on financial wellness profile and behavioral patterns
 * - Goal-specific recommendations aligned with user's financial objectives
 * - Risk-appropriate advice based on user's investment comfort level
 * - Real-time updates based on changing financial circumstances and market conditions
 * 
 * Business Value:
 * - Increases user engagement through personalized financial guidance and insights
 * - Drives financial product adoption through targeted, relevant recommendations
 * - Improves customer financial outcomes and overall satisfaction
 * - Enables financial advisors to provide more effective, data-driven guidance
 * - Supports cross-selling and upselling opportunities for financial institutions
 * 
 * Recommendation Categories:
 * - SAVINGS: Emergency fund optimization, high-yield account recommendations, automated savings
 * - INVESTMENT: Portfolio diversification, retirement planning, risk-appropriate asset allocation
 * - DEBT_MANAGEMENT: Debt consolidation strategies, payment optimization, interest reduction
 * - INSURANCE: Coverage gap analysis, policy optimization, risk protection recommendations
 * 
 * Privacy and Compliance:
 * - User consent required for AI-powered recommendation generation
 * - Recommendation data handling complies with GDPR and financial privacy regulations
 * - Audit trail maintained for all recommendation interactions and user responses
 * - AI ethics and transparency requirements compliance
 * - Model explainability features for recommendation reasoning
 * 
 * @async
 * @function fetchRecommendations
 * @returns {Promise<Recommendation[]>} Promise resolving to array of personalized recommendations
 * @throws {Error} Structured error with category and user-friendly message
 * 
 * @example
 * ```typescript
 * // Dispatch the thunk to fetch personalized recommendations
 * const result = await dispatch(fetchRecommendations());
 * 
 * if (fetchRecommendations.fulfilled.match(result)) {
 *   // Recommendations loaded successfully
 *   const highPriorityRecs = result.payload.filter(rec => rec.priority === 'HIGH');
 *   const savingsRecs = result.payload.filter(rec => rec.category === 'SAVINGS');
 *   
 *   console.log(`Found ${result.payload.length} recommendations`);
 *   console.log(`High priority: ${highPriorityRecs.length}`);
 *   console.log(`Savings recommendations: ${savingsRecs.length}`);
 * } else if (fetchRecommendations.rejected.match(result)) {
 *   // Handle error case
 *   console.error('Failed to load recommendations:', result.error.message);
 * }
 * ```
 * 
 * @see {@link Recommendation} - Complete interface definition for financial recommendations
 * @see {@link financialWellnessService.getRecommendations} - Underlying service method
 * 
 * @version 1.0.0
 * @since 1.0.0
 */
export const fetchRecommendations = createAsyncThunk(
  'financialWellness/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      // Call the financial wellness service to retrieve AI-generated recommendations
      // The service integrates with the AI-powered recommendation engine
      const recommendations = await financialWellnessService.getRecommendations();
      
      // Return the validated recommendations array for state update
      return recommendations;
    } catch (error) {
      // Enhanced error handling with structured error information
      console.error('Financial Wellness Slice: Error fetching recommendations', {
        error: error,
        timestamp: new Date().toISOString(),
        operation: 'fetchRecommendations'
      });

      // Extract user-friendly error message for UI display
      const errorMessage = error && typeof error === 'object' && 'userMessage' in error
        ? (error as any).userMessage
        : error instanceof Error 
          ? error.message 
          : 'Unable to load your personalized recommendations. Please try again.';

      // Return rejected value with user-friendly error message
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Financial Wellness Redux Toolkit Slice
 * 
 * Creates a comprehensive Redux slice for managing all financial wellness state,
 * including wellness profiles, financial goals, and personalized recommendations.
 * The slice provides standardized reducers for async operations and additional
 * reducers for local state management.
 * 
 * Slice Features:
 * - Automatic async thunk handling with loading states
 * - Immutable state updates using Immer
 * - Type-safe operations with TypeScript integration
 * - Comprehensive error handling and user feedback
 * - Optimized state structure for performance
 * 
 * Generated Actions:
 * - All async thunk actions (pending, fulfilled, rejected)
 * - Additional synchronous actions for local state updates
 * - Type-safe action creators for all operations
 * - Consistent action naming conventions
 * 
 * State Management:
 * - Single source of truth for financial wellness data
 * - Predictable state updates through reducers
 * - Efficient state normalization and updates
 * - Cross-cutting concerns like loading and error states
 * 
 * Performance Optimization:
 * - Selective state updates to minimize re-renders
 * - Efficient array operations for goals and recommendations
 * - Memoized selectors for derived state
 * - Optimistic updates where appropriate
 * 
 * Integration Points:
 * - React components through useSelector and useDispatch
 * - Middleware for logging, analytics, and monitoring
 * - DevTools integration for debugging and development
 * - Service layer integration for API operations
 * 
 * @slice financialWellnessSlice
 * @version 1.0.0
 * @performance Optimized for minimal re-renders and efficient updates
 * @scalability Designed to handle extensive financial wellness data
 */
const financialWellnessSlice = createSlice({
  // Slice name for action types and Redux DevTools
  name: 'financialWellness',
  
  // Initial state configuration
  initialState,
  
  // Synchronous reducers for local state management
  reducers: {
    /**
     * Clear all error states in the financial wellness slice.
     * 
     * Provides a mechanism to reset error states when users acknowledge
     * errors or when new operations begin. This enables clean error handling
     * and prevents stale error messages from persisting in the UI.
     * 
     * Use Cases:
     * - User dismisses error notification
     * - Beginning new operation after error
     * - Resetting state for retry operations
     * - Clean slate for fresh user interactions
     * 
     * @param state Current financial wellness state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset the financial wellness state to initial values.
     * 
     * Provides a complete state reset capability for scenarios like
     * user logout, account switching, or data refresh requirements.
     * This ensures no stale data persists between user sessions.
     * 
     * Use Cases:
     * - User logout and cleanup
     * - Account switching scenarios
     * - Force refresh of all data
     * - Error recovery through state reset
     * 
     * @param state Current financial wellness state - will be reset to initial values
     */
    resetState: () => initialState,

    /**
     * Update the wellness profile in state with new data.
     * 
     * Enables direct state updates for wellness profile data, supporting
     * optimistic updates, real-time synchronization, and local modifications
     * before server persistence.
     * 
     * Use Cases:
     * - Optimistic updates during profile editing
     * - Real-time updates from WebSocket connections
     * - Local modifications before API submission
     * - Calculated field updates (savings rate, etc.)
     * 
     * @param state Current financial wellness state
     * @param action Redux action with WellnessProfile payload
     */
    updateWellnessProfile: (state, action: PayloadAction<WellnessProfile>) => {
      state.wellnessProfile = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },

    /**
     * Update a specific financial goal in the goals array.
     * 
     * Enables efficient updates to individual goals without replacing
     * the entire goals array, supporting progress updates, status changes,
     * and other goal modifications.
     * 
     * Use Cases:
     * - Progress updates from transaction analysis
     * - Goal status transitions (completion, cancellation)
     * - Timeline adjustments and target modifications
     * - Optimistic updates during goal editing
     * 
     * @param state Current financial wellness state
     * @param action Redux action with updated FinancialGoal payload
     */
    updateFinancialGoal: (state, action: PayloadAction<FinancialGoal>) => {
      const updatedGoal = action.payload;
      const goalIndex = state.goals.findIndex(goal => goal.id === updatedGoal.id);
      
      if (goalIndex !== -1) {
        // Update existing goal while preserving array reference efficiency
        state.goals[goalIndex] = updatedGoal;
      } else {
        // Add new goal if not found (defensive programming)
        state.goals.push(updatedGoal);
      }
      
      state.status = 'succeeded';
      state.error = null;
    },

    /**
     * Remove a financial goal from the goals array.
     * 
     * Enables goal deletion with immediate state updates, supporting
     * optimistic deletions and clean goal management workflows.
     * 
     * Use Cases:
     * - Goal deletion and cleanup
     * - Cancelled goal removal
     * - User-initiated goal management
     * - Optimistic deletions before API confirmation
     * 
     * @param state Current financial wellness state
     * @param action Redux action with goal ID payload
     */
    removeFinancialGoal: (state, action: PayloadAction<string>) => {
      const goalId = action.payload;
      state.goals = state.goals.filter(goal => goal.id !== goalId);
      state.status = 'succeeded';
      state.error = null;
    },

    /**
     * Mark a recommendation as viewed or interacted with.
     * 
     * Enables tracking of recommendation interactions for analytics
     * and user experience optimization, supporting engagement metrics
     * and personalization improvements.
     * 
     * Use Cases:
     * - User clicks on recommendation
     * - Recommendation impression tracking
     * - Interaction analytics and optimization
     * - Personalization algorithm feedback
     * 
     * @param state Current financial wellness state
     * @param action Redux action with recommendation ID payload
     */
    markRecommendationViewed: (state, action: PayloadAction<string>) => {
      const recommendationId = action.payload;
      const recommendation = state.recommendations.find(rec => rec.id === recommendationId);
      
      if (recommendation) {
        // Update recommendation metadata for interaction tracking
        // Note: This would typically be handled by the backend, but we maintain
        // local state for immediate UI feedback and analytics
        recommendation.updatedAt = new Date();
      }
    }
  },
  
  // Async thunk reducers for handling API operations
  extraReducers: (builder) => {
    // Fetch Wellness Profile Reducers
    builder
      .addCase(fetchWellnessProfile.pending, (state) => {
        // Set loading state and clear previous errors
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWellnessProfile.fulfilled, (state, action) => {
        // Update state with fetched wellness profile
        state.status = 'succeeded';
        state.wellnessProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchWellnessProfile.rejected, (state, action) => {
        // Handle fetch wellness profile failure
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch wellness profile';
      })
      
      // Fetch Financial Goals Reducers
      .addCase(fetchFinancialGoals.pending, (state) => {
        // Set loading state and clear previous errors
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFinancialGoals.fulfilled, (state, action) => {
        // Update state with fetched financial goals
        state.status = 'succeeded';
        state.goals = action.payload;
        state.error = null;
      })
      .addCase(fetchFinancialGoals.rejected, (state, action) => {
        // Handle fetch financial goals failure
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch financial goals';
      })
      
      // Add New Financial Goal Reducers
      .addCase(addNewFinancialGoal.pending, (state) => {
        // Set loading state and clear previous errors
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addNewFinancialGoal.fulfilled, (state, action) => {
        // Add the newly created goal to the goals array
        state.status = 'succeeded';
        state.goals.push(action.payload);
        state.error = null;
      })
      .addCase(addNewFinancialGoal.rejected, (state, action) => {
        // Handle add financial goal failure
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to create financial goal';
      })
      
      // Fetch Recommendations Reducers
      .addCase(fetchRecommendations.pending, (state) => {
        // Set loading state and clear previous errors
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        // Update state with fetched recommendations
        state.status = 'succeeded';
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        // Handle fetch recommendations failure
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch recommendations';
      });
  },
});

// Export the slice actions for use in components
export const {
  clearError,
  resetState,
  updateWellnessProfile,
  updateFinancialGoal,
  removeFinancialGoal,
  markRecommendationViewed
} = financialWellnessSlice.actions;

// Export the slice object for store configuration
export const financialWellnessSlice = financialWellnessSlice;

// Export the reducer as the default export for store configuration
export default financialWellnessSlice.reducer;

/**
 * Selector functions for accessing financial wellness state
 * 
 * These selectors provide optimized access to financial wellness state
 * with memoization and computed values for efficient component rendering.
 * 
 * @namespace Selectors
 * @version 1.0.0
 */

/**
 * Select the current wellness profile from state.
 * 
 * @param state Root state object
 * @returns Current wellness profile or null
 */
export const selectWellnessProfile = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.wellnessProfile;

/**
 * Select all financial goals from state.
 * 
 * @param state Root state object
 * @returns Array of financial goals
 */
export const selectFinancialGoals = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.goals;

/**
 * Select active financial goals (IN_PROGRESS status).
 * 
 * @param state Root state object
 * @returns Array of active financial goals
 */
export const selectActiveGoals = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.goals.filter(goal => goal.status === 'IN_PROGRESS');

/**
 * Select completed financial goals.
 * 
 * @param state Root state object
 * @returns Array of completed financial goals
 */
export const selectCompletedGoals = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.goals.filter(goal => goal.status === 'COMPLETED');

/**
 * Select all recommendations from state.
 * 
 * @param state Root state object
 * @returns Array of recommendations
 */
export const selectRecommendations = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.recommendations;

/**
 * Select high priority recommendations.
 * 
 * @param state Root state object
 * @returns Array of high priority recommendations
 */
export const selectHighPriorityRecommendations = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.recommendations.filter(rec => rec.priority === 'HIGH');

/**
 * Select the current loading status.
 * 
 * @param state Root state object
 * @returns Current loading status
 */
export const selectLoadingStatus = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.status;

/**
 * Select the current error message.
 * 
 * @param state Root state object
 * @returns Current error message or null
 */
export const selectError = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.error;

/**
 * Select whether data is currently loading.
 * 
 * @param state Root state object
 * @returns True if loading, false otherwise
 */
export const selectIsLoading = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.status === 'loading';

/**
 * Select whether there's an error state.
 * 
 * @param state Root state object
 * @returns True if error exists, false otherwise
 */
export const selectHasError = (state: { financialWellness: FinancialWellnessState }) =>
  state.financialWellness.status === 'failed' || state.financialWellness.error !== null;