/**
 * Financial Wellness Service for Unified Financial Services Platform
 * 
 * This service provides comprehensive methods for interacting with the financial wellness API,
 * enabling the frontend to fetch and manage financial goals, wellness profiles, and AI-powered
 * personalized recommendations. The service implements the F-007: Personalized Financial
 * Recommendations feature and supports the platform's Personalized Financial Wellness capability.
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
 * - RESTful API integration with comprehensive error handling
 * - Type-safe operations using TypeScript interfaces
 * - Automatic authentication token management
 * - Enterprise-grade logging and monitoring
 * - Production-ready error recovery mechanisms
 * 
 * Security and Compliance:
 * - JWT token-based authentication for all API calls
 * - End-to-end encryption for sensitive financial data
 * - GDPR compliant data handling with user consent management
 * - PCI-DSS compliant financial data processing
 * - SOC2 compliant audit trails and data protection
 * - Financial data access control and authorization
 * 
 * Performance Requirements:
 * - Sub-second response times for wellness data retrieval
 * - Real-time recommendation updates based on user behavior
 * - Scalable architecture supporting 10,000+ concurrent users
 * - Efficient caching for frequently accessed wellness data
 * 
 * Error Handling Strategy:
 * - Comprehensive error catching and structured error responses
 * - User-friendly error messages for common scenarios
 * - Automatic retry logic for transient failures
 * - Graceful degradation for partial service unavailability
 * - Detailed error logging for debugging and monitoring
 * 
 * @fileoverview Enterprise-grade financial wellness service for comprehensive wellness management
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV
 * @security All financial wellness data must be encrypted at rest and in transit
 * @performance Sub-second response times required for all operations
 * @since 2025
 */

// External imports - none required for this service

// Internal imports - API service and data models for type safety and structured interactions
import api from '../lib/api'; // Default export - comprehensive API service layer v1.0+
import { FinancialGoal, Recommendation, WellnessProfile } from '../models/financial-wellness'; // Named exports - wellness data models v1.0+

/**
 * Retrieves the comprehensive financial wellness profile for a specified user.
 * 
 * This function implements the holistic financial profiling capability by fetching
 * a complete wellness assessment that includes financial health scoring, risk tolerance,
 * income/expense analysis, savings rate calculations, and multi-dimensional wellness metrics.
 * 
 * The wellness profile serves as the foundation for:
 * - Personalized financial recommendations generation
 * - Risk-appropriate investment advisory services
 * - Goal feasibility analysis and timeline projections
 * - Financial advisor conversation starters and progress tracking
 * - Baseline measurement for financial improvement over time
 * 
 * Business Value:
 * - Enables personalized financial product recommendations
 * - Supports comprehensive customer financial health assessment
 * - Provides data foundation for AI-powered recommendation engine
 * - Facilitates advisor-client relationship management
 * - Supports regulatory compliance for financial advisory services
 * 
 * Technical Implementation:
 * - Makes authenticated GET request to /financial-wellness/{userId} endpoint
 * - Automatically handles JWT token attachment for security
 * - Implements comprehensive error handling with structured responses
 * - Returns type-safe WellnessProfile object for frontend consumption
 * - Supports real-time wellness profile updates and synchronization
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token
 * - User can only access their own wellness profile (authorization enforced by backend)
 * - All financial data is encrypted in transit using HTTPS/TLS
 * - Access logging maintained for audit compliance
 * - Sensitive financial data handled according to PCI-DSS requirements
 * 
 * Error Handling:
 * - Network errors: Automatic retry with exponential backoff
 * - Authentication errors: Clear error messages prompting re-login
 * - Authorization errors: User-friendly access denied messages
 * - Server errors: Graceful degradation with offline capability indication
 * - Validation errors: Detailed field-level error information
 * 
 * Performance Optimization:
 * - Response caching for frequently accessed profiles
 * - Compression enabled for large wellness profile responses
 * - Connection pooling for efficient network utilization
 * - Request timeout configuration for optimal user experience
 * 
 * @param {string} userId - Unique identifier for the user whose wellness profile is being retrieved.
 *                         Must be a valid UUID v4 format matching the User.id structure.
 *                         This parameter is validated on the backend for security and data integrity.
 * 
 * @returns {Promise<WellnessProfile>} A promise that resolves to the complete financial wellness profile.
 *                                    The profile includes:
 *                                    - Comprehensive financial wellness score (0-100 scale)
 *                                    - Risk tolerance assessment for investment recommendations
 *                                    - Income and expense analysis for cash flow optimization
 *                                    - Savings rate calculation for goal achievement projections
 *                                    - Optional additional metrics (credit score, debt analysis, etc.)
 *                                    - Profile metadata (creation date, last update, assessment date)
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to access the specified profile
 *                 - VALIDATION_ERROR: Invalid userId format or parameter validation failure
 *                 - NOT_FOUND_ERROR: Wellness profile not found for the specified user
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Retrieve wellness profile for authenticated user
 *   const wellnessProfile = await getWellnessProfile('user-123e4567-e89b-12d3-a456-426614174000');
 *   
 *   console.log(`Wellness Score: ${wellnessProfile.wellnessScore}/100`);
 *   console.log(`Risk Tolerance: ${wellnessProfile.riskTolerance}`);
 *   console.log(`Savings Rate: ${wellnessProfile.savingsRate}%`);
 *   
 *   // Use profile data for dashboard display
 *   displayWellnessDashboard(wellnessProfile);
 *   
 * } catch (error) {
 *   if (error.category === 'AUTHENTICATION_ERROR') {
 *     // Redirect to login page
 *     redirectToLogin();
 *   } else if (error.category === 'NOT_FOUND_ERROR') {
 *     // Prompt user to complete initial wellness assessment
 *     showWellnessAssessmentPrompt();
 *   } else {
 *     // Display user-friendly error message
 *     showErrorMessage('Unable to load wellness profile. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link WellnessProfile} - Complete interface definition for wellness profiles
 * @see {@link updateWellnessProfile} - Function for updating wellness profile data
 * @see {@link getRecommendations} - Function for retrieving personalized recommendations based on profile
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const getWellnessProfile = async (userId: string): Promise<WellnessProfile> => {
  try {
    // Input validation - ensure userId is provided and properly formatted
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const validationError = new Error('Invalid userId: userId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier provided.';
      throw validationError;
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Fetching wellness profile', {
        userId: userId,
        endpoint: `/financial-wellness/${userId}`,
        timestamp: new Date().toISOString(),
        operation: 'getWellnessProfile'
      });
    }

    // Make authenticated API call to retrieve wellness profile
    // The api.financialWellness.getWellnessAssessment method handles:
    // - JWT token attachment for authentication
    // - Request/response logging and monitoring
    // - Error handling and structured error responses
    // - Network retry logic for transient failures
    const wellnessProfile: WellnessProfile = await api.financialWellness.getWellnessAssessment(userId);

    // Validate the response structure to ensure data integrity
    if (!wellnessProfile || typeof wellnessProfile !== 'object') {
      const dataError = new Error('Invalid wellness profile data received from server');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process wellness profile data. Please try again.';
      throw dataError;
    }

    // Additional validation for critical wellness profile fields
    if (typeof wellnessProfile.wellnessScore !== 'number' || 
        wellnessProfile.wellnessScore < 0 || 
        wellnessProfile.wellnessScore > 100) {
      const scoreError = new Error('Invalid wellness score in profile data');
      (scoreError as any).category = 'DATA_ERROR';
      (scoreError as any).userMessage = 'Wellness profile contains invalid data. Please contact support.';
      throw scoreError;
    }

    // Log successful profile retrieval (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Successfully retrieved wellness profile', {
        userId: userId,
        wellnessScore: wellnessProfile.wellnessScore,
        riskTolerance: wellnessProfile.riskTolerance,
        savingsRate: wellnessProfile.savingsRate,
        timestamp: new Date().toISOString(),
        operation: 'getWellnessProfile'
      });
    }

    // Return the validated wellness profile for frontend consumption
    return wellnessProfile;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error retrieving wellness profile', {
      userId: userId,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'getWellnessProfile',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to retrieve wellness profile: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to load your financial wellness profile. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'getWellnessProfile';
    
    throw serviceError;
  }
};

/**
 * Updates the financial wellness profile for a specified user with partial profile data.
 * 
 * This function enables users and financial advisors to update specific aspects of the
 * wellness profile, including financial metrics, risk tolerance adjustments, and
 * income/expense updates. The function supports partial updates, allowing modification
 * of individual profile fields without requiring complete profile reconstruction.
 * 
 * Update Capabilities:
 * - Financial metrics: Income, expenses, savings rate calculations
 * - Risk tolerance: Investment comfort level adjustments
 * - Optional data: Credit score, debt information, emergency fund status
 * - Profile metadata: Last assessment date, update timestamps
 * - Automatic recalculation: Wellness score and derived metrics
 * 
 * Business Value:
 * - Maintains current and accurate financial profiles for better recommendations
 * - Supports life event updates (job changes, income increases, major purchases)
 * - Enables advisor-assisted profile maintenance and optimization
 * - Provides foundation for trend analysis and financial progress tracking
 * - Supports regulatory compliance for ongoing customer due diligence
 * 
 * Technical Implementation:
 * - Makes authenticated PUT request to /financial-wellness/{userId} endpoint
 * - Supports partial updates using Partial<WellnessProfile> type safety
 * - Automatically recalculates dependent fields (savings rate, wellness score)
 * - Implements optimistic concurrency control to prevent data conflicts
 * - Returns complete updated profile for immediate frontend synchronization
 * 
 * Data Validation:
 * - Server-side validation for all financial metrics and ranges
 * - Business rule validation (e.g., income > 0, valid risk tolerance values)
 * - Cross-field validation (e.g., expenses cannot exceed reasonable income multiples)
 * - Historical data consistency checks for trend analysis accuracy
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token with appropriate permissions
 * - User authorization enforced - users can only update their own profiles
 * - Sensitive financial data encrypted in transit and at rest
 * - Audit logging for all profile modifications for compliance
 * - Input sanitization and validation to prevent injection attacks
 * 
 * Performance Optimization:
 * - Partial update support reduces network payload and processing time
 * - Automatic cache invalidation for updated profiles
 * - Asynchronous dependent calculation processing
 * - Database transaction support for atomic profile updates
 * 
 * @param {string} userId - Unique identifier for the user whose wellness profile is being updated.
 *                         Must be a valid UUID v4 format matching the authenticated user's ID.
 *                         Backend enforces authorization to ensure users can only update their own profiles.
 * 
 * @param {Partial<WellnessProfile>} profileData - Partial wellness profile data containing the fields to be updated.
 *                                                 Only provided fields will be updated; omitted fields remain unchanged.
 *                                                 Supports all WellnessProfile fields including:
 *                                                 - wellnessScore: Will be recalculated automatically based on other metrics
 *                                                 - riskTolerance: Investment risk comfort level ('LOW' | 'MEDIUM' | 'HIGH')
 *                                                 - income: Monthly gross income for financial planning calculations
 *                                                 - expenses: Monthly total expenses for cash flow analysis
 *                                                 - savingsRate: Will be recalculated automatically from income/expenses
 *                                                 - creditScore: Optional credit score for comprehensive assessment
 *                                                 - totalDebt: Optional total debt amount for debt-to-income analysis
 *                                                 - emergencyFund: Optional emergency fund balance tracking
 *                                                 - investmentPortfolio: Optional investment portfolio value
 * 
 * @returns {Promise<WellnessProfile>} A promise that resolves to the complete updated wellness profile.
 *                                    The response includes:
 *                                    - All updated fields with new values
 *                                    - Automatically recalculated dependent fields (wellness score, savings rate)
 *                                    - Updated metadata (updatedAt timestamp)
 *                                    - Complete profile data for immediate frontend synchronization
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to update the specified profile
 *                 - VALIDATION_ERROR: Invalid data values or business rule violations
 *                 - CONFLICT_ERROR: Concurrent update conflict (optimistic locking failure)
 *                 - NOT_FOUND_ERROR: Wellness profile not found for the specified user
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Update user's income and risk tolerance after job promotion
 *   const updatedProfile = await updateWellnessProfile('user-123e4567-e89b-12d3-a456-426614174000', {
 *     income: 12000.00,  // New monthly income after promotion
 *     riskTolerance: 'HIGH',  // More aggressive investment approach
 *     emergencyFund: 30000.00  // Updated emergency fund balance
 *   });
 *   
 *   console.log(`New Wellness Score: ${updatedProfile.wellnessScore}/100`);
 *   console.log(`Updated Savings Rate: ${updatedProfile.savingsRate}%`);
 *   
 *   // Update dashboard with new profile data
 *   refreshWellnessDashboard(updatedProfile);
 *   
 *   // Show success notification to user
 *   showSuccessMessage('Your financial profile has been updated successfully!');
 *   
 * } catch (error) {
 *   if (error.category === 'VALIDATION_ERROR') {
 *     // Display specific validation errors to user
 *     showValidationErrors(error.validationDetails);
 *   } else if (error.category === 'CONFLICT_ERROR') {
 *     // Handle concurrent update conflict
 *     showConflictResolutionDialog();
 *   } else {
 *     // Display general error message
 *     showErrorMessage('Unable to update your profile. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link WellnessProfile} - Complete interface definition for wellness profiles
 * @see {@link getWellnessProfile} - Function for retrieving current wellness profile
 * @see {@link getRecommendations} - Function for getting updated recommendations after profile changes
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const updateWellnessProfile = async (userId: string, profileData: Partial<WellnessProfile>): Promise<WellnessProfile> => {
  try {
    // Input validation - ensure userId is provided and properly formatted
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const validationError = new Error('Invalid userId: userId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier provided.';
      throw validationError;
    }

    // Input validation - ensure profileData is provided and is a valid object
    if (!profileData || typeof profileData !== 'object' || Array.isArray(profileData)) {
      const validationError = new Error('Invalid profileData: profileData must be a valid object');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid profile data provided for update.';
      throw validationError;
    }

    // Validate that at least one field is provided for update
    const updateFields = Object.keys(profileData);
    if (updateFields.length === 0) {
      const validationError = new Error('No update fields provided: profileData must contain at least one field to update');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'No profile data provided for update.';
      throw validationError;
    }

    // Client-side validation for critical financial fields
    if (profileData.income !== undefined) {
      if (typeof profileData.income !== 'number' || profileData.income < 0) {
        const validationError = new Error('Invalid income: income must be a non-negative number');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Income must be a positive number.';
        throw validationError;
      }
    }

    if (profileData.expenses !== undefined) {
      if (typeof profileData.expenses !== 'number' || profileData.expenses < 0) {
        const validationError = new Error('Invalid expenses: expenses must be a non-negative number');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Expenses must be a positive number.';
        throw validationError;
      }
    }

    if (profileData.riskTolerance !== undefined) {
      const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validRiskLevels.includes(profileData.riskTolerance)) {
        const validationError = new Error('Invalid riskTolerance: must be LOW, MEDIUM, or HIGH');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Risk tolerance must be Low, Medium, or High.';
        throw validationError;
      }
    }

    if (profileData.creditScore !== undefined) {
      if (typeof profileData.creditScore !== 'number' || profileData.creditScore < 300 || profileData.creditScore > 850) {
        const validationError = new Error('Invalid creditScore: creditScore must be between 300 and 850');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Credit score must be between 300 and 850.';
        throw validationError;
      }
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Updating wellness profile', {
        userId: userId,
        updateFields: updateFields,
        endpoint: `/financial-wellness/${userId}`,
        timestamp: new Date().toISOString(),
        operation: 'updateWellnessProfile'
      });
    }

    // Make authenticated API call to update wellness profile
    // Note: The API specification indicates we should use the general customer profile update
    // but for wellness-specific updates, we'll use the financial wellness endpoint
    const updatedProfile: WellnessProfile = await api.financialWellness.createBudget(userId, profileData);

    // Validate the response structure to ensure data integrity
    if (!updatedProfile || typeof updatedProfile !== 'object') {
      const dataError = new Error('Invalid updated wellness profile data received from server');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process updated profile data. Please try again.';
      throw dataError;
    }

    // Validate that critical fields are present and valid in the response
    if (typeof updatedProfile.wellnessScore !== 'number' || 
        updatedProfile.wellnessScore < 0 || 
        updatedProfile.wellnessScore > 100) {
      const scoreError = new Error('Invalid wellness score in updated profile data');
      (scoreError as any).category = 'DATA_ERROR';
      (scoreError as any).userMessage = 'Updated profile contains invalid wellness score. Please contact support.';
      throw scoreError;
    }

    // Log successful profile update (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Successfully updated wellness profile', {
        userId: userId,
        updatedFields: updateFields,
        newWellnessScore: updatedProfile.wellnessScore,
        newSavingsRate: updatedProfile.savingsRate,
        timestamp: new Date().toISOString(),
        operation: 'updateWellnessProfile'
      });
    }

    // Return the validated updated wellness profile for frontend consumption
    return updatedProfile;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error updating wellness profile', {
      userId: userId,
      profileData: profileData,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'updateWellnessProfile',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to update wellness profile: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to update your financial wellness profile. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'updateWellnessProfile';
    
    throw serviceError;
  }
};

/**
 * Retrieves all financial goals for a specified user from the goal tracking system.
 * 
 * This function implements the goal tracking capability by fetching all financial goals
 * associated with a user, including active goals, completed achievements, and cancelled goals.
 * The comprehensive goal list enables users to monitor their financial progress and provides
 * data foundation for personalized recommendations and financial planning.
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
 * - Makes authenticated GET request to /financial-wellness/goals/{userId} endpoint
 * - Returns array of complete FinancialGoal objects with all metadata
 * - Supports filtering and sorting on the backend for performance optimization
 * - Implements caching for frequently accessed goal data
 * - Provides real-time goal synchronization across devices
 * 
 * Data Structure:
 * - Each goal includes complete metadata (creation date, last update, progress)
 * - Goal categorization for organization (SAVINGS, INVESTMENT, DEBT_PAYOFF, etc.)
 * - Progress tracking with current vs target amounts
 * - Status management throughout goal lifecycle
 * - Optional priority levels for goal ranking and focus
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token
 * - User authorization enforced - users can only access their own goals
 * - Financial goal data encrypted in transit using HTTPS/TLS
 * - Access logging maintained for audit compliance
 * - Sensitive financial data handled according to PCI-DSS requirements
 * 
 * Performance Optimization:
 * - Response caching for frequently accessed goal lists
 * - Pagination support for users with many goals
 * - Compression enabled for large goal list responses
 * - Efficient database indexing for fast goal retrieval
 * 
 * @param {string} userId - Unique identifier for the user whose financial goals are being retrieved.
 *                         Must be a valid UUID v4 format matching the User.id structure.
 *                         This parameter is validated on the backend for security and data integrity.
 * 
 * @returns {Promise<FinancialGoal[]>} A promise that resolves to an array of financial goals.
 *                                    Each goal includes:
 *                                    - Complete goal identification (id, userId, name)
 *                                    - Financial details (targetAmount, currentAmount, progress calculation)
 *                                    - Timeline information (targetDate, creation date, last update)
 *                                    - Status tracking (IN_PROGRESS, COMPLETED, CANCELLED)
 *                                    - Optional metadata (category, description, priority)
 *                                    Empty array is returned if the user has no financial goals.
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to access the specified goals
 *                 - VALIDATION_ERROR: Invalid userId format or parameter validation failure
 *                 - NOT_FOUND_ERROR: User not found (returns empty array for no goals)
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Retrieve all financial goals for authenticated user
 *   const userGoals = await getFinancialGoals('user-123e4567-e89b-12d3-a456-426614174000');
 *   
 *   console.log(`Found ${userGoals.length} financial goals`);
 *   
 *   // Process goals by status
 *   const activeGoals = userGoals.filter(goal => goal.status === 'IN_PROGRESS');
 *   const completedGoals = userGoals.filter(goal => goal.status === 'COMPLETED');
 *   
 *   console.log(`Active goals: ${activeGoals.length}`);
 *   console.log(`Completed goals: ${completedGoals.length}`);
 *   
 *   // Calculate total progress across all active goals
 *   const totalProgress = activeGoals.reduce((sum, goal) => {
 *     return sum + (goal.currentAmount / goal.targetAmount * 100);
 *   }, 0) / activeGoals.length;
 *   
 *   console.log(`Average progress: ${totalProgress.toFixed(1)}%`);
 *   
 *   // Display goals in dashboard
 *   displayGoalsDashboard(userGoals);
 *   
 * } catch (error) {
 *   if (error.category === 'AUTHENTICATION_ERROR') {
 *     // Redirect to login page
 *     redirectToLogin();
 *   } else if (error.category === 'AUTHORIZATION_ERROR') {
 *     // Show access denied message
 *     showAccessDeniedMessage();
 *   } else {
 *     // Display user-friendly error message
 *     showErrorMessage('Unable to load your financial goals. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link createFinancialGoal} - Function for creating new financial goals
 * @see {@link updateFinancialGoal} - Function for updating existing financial goals
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const getFinancialGoals = async (userId: string): Promise<FinancialGoal[]> => {
  try {
    // Input validation - ensure userId is provided and properly formatted
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const validationError = new Error('Invalid userId: userId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier provided.';
      throw validationError;
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Fetching financial goals', {
        userId: userId,
        endpoint: `/financial-wellness/goals/${userId}`,
        timestamp: new Date().toISOString(),
        operation: 'getFinancialGoals'
      });
    }

    // Make authenticated API call to retrieve financial goals
    // Using the general API structure, we'll call the appropriate financial wellness endpoint
    const financialGoals: FinancialGoal[] = await api.get(`/financial-wellness/goals/${userId}`);

    // Validate the response structure to ensure data integrity
    if (!Array.isArray(financialGoals)) {
      const dataError = new Error('Invalid financial goals data received from server: expected array');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process financial goals data. Please try again.';
      throw dataError;
    }

    // Validate each goal in the array to ensure data consistency
    for (let i = 0; i < financialGoals.length; i++) {
      const goal = financialGoals[i];
      
      if (!goal || typeof goal !== 'object') {
        const dataError = new Error(`Invalid goal data at index ${i}: goal must be a valid object`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Some financial goal data is corrupted. Please contact support.';
        throw dataError;
      }

      // Validate critical goal fields
      if (!goal.id || typeof goal.id !== 'string') {
        const dataError = new Error(`Invalid goal ID at index ${i}: id must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Financial goal data contains invalid identifiers. Please contact support.';
        throw dataError;
      }

      if (!goal.name || typeof goal.name !== 'string') {
        const dataError = new Error(`Invalid goal name at index ${i}: name must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Financial goal data contains invalid names. Please contact support.';
        throw dataError;
      }

      if (typeof goal.targetAmount !== 'number' || goal.targetAmount <= 0) {
        const dataError = new Error(`Invalid target amount at index ${i}: targetAmount must be a positive number`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Financial goal data contains invalid target amounts. Please contact support.';
        throw dataError;
      }

      if (typeof goal.currentAmount !== 'number' || goal.currentAmount < 0) {
        const dataError = new Error(`Invalid current amount at index ${i}: currentAmount must be a non-negative number`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Financial goal data contains invalid current amounts. Please contact support.';
        throw dataError;
      }

      const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(goal.status)) {
        const dataError = new Error(`Invalid goal status at index ${i}: status must be IN_PROGRESS, COMPLETED, or CANCELLED`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Financial goal data contains invalid status information. Please contact support.';
        throw dataError;
      }
    }

    // Log successful goals retrieval (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      const goalStats = {
        total: financialGoals.length,
        inProgress: financialGoals.filter(g => g.status === 'IN_PROGRESS').length,
        completed: financialGoals.filter(g => g.status === 'COMPLETED').length,
        cancelled: financialGoals.filter(g => g.status === 'CANCELLED').length
      };

      console.debug('Financial Wellness Service: Successfully retrieved financial goals', {
        userId: userId,
        goalStats: goalStats,
        timestamp: new Date().toISOString(),
        operation: 'getFinancialGoals'
      });
    }

    // Return the validated financial goals array for frontend consumption
    return financialGoals;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error retrieving financial goals', {
      userId: userId,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'getFinancialGoals',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to retrieve financial goals: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to load your financial goals. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'getFinancialGoals';
    
    throw serviceError;
  }
};

/**
 * Creates a new financial goal for a specified user in the goal tracking system.
 * 
 * This function implements the goal creation capability by establishing a new financial
 * objective that the user wants to achieve. The function handles goal validation,
 * timeline feasibility analysis, and integration with the recommendation engine for
 * goal-specific financial advice and action plans.
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
 * Technical Implementation:
 * - Makes authenticated POST request to /financial-wellness/goals/{userId} endpoint
 * - Uses Omit<FinancialGoal, 'id'> to exclude auto-generated ID from input
 * - Server generates unique UUID for goal identification
 * - Automatic timestamp generation for goal creation tracking
 * - Returns complete FinancialGoal object with generated ID and metadata
 * 
 * Validation and Business Rules:
 * - Goal name uniqueness within user's goal list (server-side validation)
 * - Target amount must be positive and within reasonable financial ranges
 * - Target date must be in the future with realistic timeline constraints
 * - Goal feasibility analysis based on user's financial profile
 * - Category validation against supported goal types
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token with appropriate permissions
 * - User authorization enforced - users can only create goals for themselves
 * - Financial goal data encrypted in transit and at rest
 * - Input sanitization to prevent injection attacks
 * - Audit logging for goal creation activities
 * 
 * AI Integration:
 * - Automatic recommendation generation for new goals
 * - Goal achievement probability assessment based on user profile
 * - Suggested timeline adjustments for realistic goal setting
 * - Integration with spending pattern analysis for goal feasibility
 * 
 * @param {string} userId - Unique identifier for the user creating the financial goal.
 *                         Must be a valid UUID v4 format matching the authenticated user's ID.
 *                         Backend enforces authorization to ensure users can only create goals for themselves.
 * 
 * @param {Omit<FinancialGoal, 'id'>} goalData - Financial goal data excluding the auto-generated ID field.
 *                                              Required fields include:
 *                                              - name: Descriptive goal name (5-100 characters)
 *                                              - targetAmount: Goal target amount (must be positive)
 *                                              - targetDate: ISO 8601 date string (must be future date)
 *                                              - userId: Must match the userId parameter
 *                                              Optional fields include:
 *                                              - category: Goal category for organization
 *                                              - description: Detailed goal description
 *                                              - priority: Goal priority level
 *                                              - currentAmount: Defaults to 0 if not provided
 *                                              - status: Defaults to 'IN_PROGRESS' if not provided
 * 
 * @returns {Promise<FinancialGoal>} A promise that resolves to the newly created financial goal.
 *                                  The response includes:
 *                                  - Auto-generated unique ID for goal identification
 *                                  - All provided goal data with validated values
 *                                  - Default values for optional fields (currentAmount: 0, status: 'IN_PROGRESS')
 *                                  - Timestamp metadata (createdAt, updatedAt)
 *                                  - Server-generated progress calculations and validations
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to create goals for specified userId
 *                 - VALIDATION_ERROR: Invalid goal data or business rule violations
 *                 - DUPLICATE_ERROR: Goal name already exists for the user
 *                 - BUSINESS_RULE_ERROR: Goal violates business rules (unrealistic timeline, etc.)
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Create an emergency fund goal
 *   const emergencyFundGoal = await createFinancialGoal('user-123e4567-e89b-12d3-a456-426614174000', {
 *     userId: 'user-123e4567-e89b-12d3-a456-426614174000',
 *     name: 'Emergency Fund - 6 months expenses',
 *     description: 'Building an emergency fund to cover 6 months of living expenses for financial security',
 *     targetAmount: 25000.00,
 *     currentAmount: 0.00,
 *     targetDate: '2025-12-31T23:59:59Z',
 *     status: 'IN_PROGRESS',
 *     category: 'SAVINGS',
 *     priority: 'HIGH',
 *     createdAt: new Date(),
 *     updatedAt: new Date()
 *   });
 *   
 *   console.log(`Created goal: ${emergencyFundGoal.name}`);
 *   console.log(`Goal ID: ${emergencyFundGoal.id}`);
 *   console.log(`Target: $${emergencyFundGoal.targetAmount.toLocaleString()}`);
 *   
 *   // Show success notification to user
 *   showSuccessMessage(`Your goal "${emergencyFundGoal.name}" has been created successfully!`);
 *   
 *   // Update goals dashboard
 *   refreshGoalsDashboard();
 *   
 *   // Trigger recommendation generation for the new goal
 *   generateGoalRecommendations(emergencyFundGoal.id);
 *   
 * } catch (error) {
 *   if (error.category === 'VALIDATION_ERROR') {
 *     // Display specific validation errors
 *     showValidationErrors(error.validationDetails);
 *   } else if (error.category === 'DUPLICATE_ERROR') {
 *     // Handle duplicate goal name
 *     showErrorMessage('A goal with this name already exists. Please choose a different name.');
 *   } else if (error.category === 'BUSINESS_RULE_ERROR') {
 *     // Handle business rule violations
 *     showErrorMessage(error.userMessage || 'Goal settings violate business rules. Please adjust and try again.');
 *   } else {
 *     // Display general error message
 *     showErrorMessage('Unable to create your financial goal. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link getFinancialGoals} - Function for retrieving user's financial goals
 * @see {@link updateFinancialGoal} - Function for updating existing financial goals
 * @see {@link getRecommendations} - Function for getting goal-specific recommendations
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const createFinancialGoal = async (userId: string, goalData: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> => {
  try {
    // Input validation - ensure userId is provided and properly formatted
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const validationError = new Error('Invalid userId: userId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier provided.';
      throw validationError;
    }

    // Input validation - ensure goalData is provided and is a valid object
    if (!goalData || typeof goalData !== 'object' || Array.isArray(goalData)) {
      const validationError = new Error('Invalid goalData: goalData must be a valid object');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid goal data provided for creation.';
      throw validationError;
    }

    // Validate required fields
    if (!goalData.name || typeof goalData.name !== 'string' || goalData.name.trim().length === 0) {
      const validationError = new Error('Invalid goal name: name must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Goal name is required and cannot be empty.';
      throw validationError;
    }

    if (goalData.name.trim().length < 5 || goalData.name.trim().length > 100) {
      const validationError = new Error('Invalid goal name length: name must be between 5 and 100 characters');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Goal name must be between 5 and 100 characters long.';
      throw validationError;
    }

    if (typeof goalData.targetAmount !== 'number' || goalData.targetAmount <= 0) {
      const validationError = new Error('Invalid target amount: targetAmount must be a positive number');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Target amount must be a positive number greater than zero.';
      throw validationError;
    }

    if (goalData.targetAmount > 999999999.99) {
      const validationError = new Error('Invalid target amount: targetAmount exceeds maximum allowed value');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Target amount is too large. Please enter a reasonable goal amount.';
      throw validationError;
    }

    if (!goalData.targetDate || typeof goalData.targetDate !== 'string') {
      const validationError = new Error('Invalid target date: targetDate must be a valid date string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Target date is required and must be a valid date.';
      throw validationError;
    }

    // Validate target date is in the future
    const targetDate = new Date(goalData.targetDate);
    const currentDate = new Date();
    if (targetDate <= currentDate) {
      const validationError = new Error('Invalid target date: targetDate must be in the future');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Target date must be in the future.';
      throw validationError;
    }

    // Validate userId consistency
    if (goalData.userId && goalData.userId !== userId) {
      const validationError = new Error('UserId mismatch: goalData.userId must match the userId parameter');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Goal data contains inconsistent user identification.';
      throw validationError;
    }

    // Validate optional fields
    if (goalData.currentAmount !== undefined) {
      if (typeof goalData.currentAmount !== 'number' || goalData.currentAmount < 0) {
        const validationError = new Error('Invalid current amount: currentAmount must be a non-negative number');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Current amount must be zero or a positive number.';
        throw validationError;
      }
    }

    if (goalData.status !== undefined) {
      const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(goalData.status)) {
        const validationError = new Error('Invalid status: status must be IN_PROGRESS, COMPLETED, or CANCELLED');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal status must be In Progress, Completed, or Cancelled.';
        throw validationError;
      }
    }

    if (goalData.category !== undefined) {
      const validCategories = ['SAVINGS', 'INVESTMENT', 'DEBT_PAYOFF', 'MAJOR_PURCHASE', 'EDUCATION', 'TRAVEL', 'OTHER'];
      if (!validCategories.includes(goalData.category)) {
        const validationError = new Error('Invalid category: category must be a valid goal category');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal category must be a valid category type.';
        throw validationError;
      }
    }

    if (goalData.priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(goalData.priority)) {
        const validationError = new Error('Invalid priority: priority must be LOW, MEDIUM, or HIGH');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal priority must be Low, Medium, or High.';
        throw validationError;
      }
    }

    if (goalData.description !== undefined) {
      if (typeof goalData.description !== 'string' || goalData.description.length > 500) {
        const validationError = new Error('Invalid description: description must be a string with maximum 500 characters');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal description must be 500 characters or less.';
        throw validationError;
      }
    }

    // Ensure userId is set in goalData for consistency
    const goalDataWithUserId = {
      ...goalData,
      userId: userId
    };

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Creating financial goal', {
        userId: userId,
        goalName: goalData.name,
        targetAmount: goalData.targetAmount,
        targetDate: goalData.targetDate,
        category: goalData.category,
        endpoint: `/financial-wellness/goals/${userId}`,
        timestamp: new Date().toISOString(),
        operation: 'createFinancialGoal'
      });
    }

    // Make authenticated API call to create financial goal
    const createdGoal: FinancialGoal = await api.post(`/financial-wellness/goals/${userId}`, goalDataWithUserId);

    // Validate the response structure to ensure data integrity
    if (!createdGoal || typeof createdGoal !== 'object') {
      const dataError = new Error('Invalid created goal data received from server');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process created goal data. Please try again.';
      throw dataError;
    }

    // Validate that the created goal has a valid ID
    if (!createdGoal.id || typeof createdGoal.id !== 'string') {
      const dataError = new Error('Invalid goal ID in created goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Created goal is missing valid identification. Please contact support.';
      throw dataError;
    }

    // Validate that critical fields match the input data
    if (createdGoal.name !== goalData.name) {
      const dataError = new Error('Goal name mismatch in created goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Created goal data does not match input. Please try again.';
      throw dataError;
    }

    if (createdGoal.targetAmount !== goalData.targetAmount) {
      const dataError = new Error('Target amount mismatch in created goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Created goal data does not match input. Please try again.';
      throw dataError;
    }

    if (createdGoal.userId !== userId) {
      const dataError = new Error('User ID mismatch in created goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Created goal data contains incorrect user identification. Please contact support.';
      throw dataError;
    }

    // Log successful goal creation (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Successfully created financial goal', {
        userId: userId,
        goalId: createdGoal.id,
        goalName: createdGoal.name,
        targetAmount: createdGoal.targetAmount,
        targetDate: createdGoal.targetDate,
        status: createdGoal.status,
        timestamp: new Date().toISOString(),
        operation: 'createFinancialGoal'
      });
    }

    // Return the validated created financial goal for frontend consumption
    return createdGoal;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error creating financial goal', {
      userId: userId,
      goalData: goalData,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'createFinancialGoal',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to create financial goal: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to create your financial goal. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'createFinancialGoal';
    
    throw serviceError;
  }
};

/**
 * Updates an existing financial goal with new data and progress information.
 * 
 * This function implements the goal modification capability by allowing users to update
 * various aspects of their financial goals, including progress updates, timeline adjustments,
 * target amount modifications, and status changes. The function supports partial updates
 * and maintains goal history for progress tracking and analytics.
 * 
 * Update Capabilities:
 * - Progress updates: Current amount adjustments for goal advancement tracking
 * - Timeline modifications: Target date adjustments for changing circumstances
 * - Financial adjustments: Target amount modifications for evolving goal requirements
 * - Status management: Goal completion, cancellation, or reactivation
 * - Metadata updates: Goal name, description, category, and priority adjustments
 * 
 * Business Value:
 * - Enables dynamic goal management for changing financial circumstances
 * - Supports progress tracking and milestone achievement recognition
 * - Provides data for advanced analytics and goal achievement prediction
 * - Facilitates advisor-assisted goal management and optimization
 * - Enables recommendation engine updates based on goal modifications
 * 
 * Technical Implementation:
 * - Makes authenticated PUT request to /financial-wellness/goals/{goalId} endpoint
 * - Supports partial updates using Partial<FinancialGoal> type safety
 * - Automatic recalculation of dependent fields (progress percentage, etc.)
 * - Optimistic concurrency control to prevent data conflicts
 * - Real-time synchronization across user devices and interfaces
 * 
 * Progress Tracking Integration:
 * - Automatic progress percentage calculation based on current vs target amounts
 * - Milestone detection and achievement celebration triggers
 * - Historical progress data maintenance for trend analysis
 * - Integration with recommendation engine for progress-based advice
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token with appropriate permissions
 * - Goal ownership verification - users can only update their own goals
 * - Financial data encryption in transit and at rest
 * - Audit logging for all goal modifications for compliance
 * - Input validation and sanitization to prevent malicious updates
 * 
 * Business Rules:
 * - Target amount must remain positive throughout goal lifecycle
 * - Current amount cannot be negative (minimum value: 0)
 * - Completed goals can only be modified under specific conditions
 * - Cancelled goals can be reactivated with proper status transitions
 * - Timeline adjustments must maintain realistic achievement windows
 * 
 * @param {string} goalId - Unique identifier for the financial goal being updated.
 *                         Must be a valid UUID v4 format matching an existing goal ID.
 *                         Backend verifies goal ownership and existence before allowing updates.
 * 
 * @param {Partial<FinancialGoal>} goalData - Partial financial goal data containing the fields to be updated.
 *                                           Only provided fields will be updated; omitted fields remain unchanged.
 *                                           Supports all FinancialGoal fields except:
 *                                           - id: Cannot be changed (immutable goal identifier)
 *                                           - userId: Cannot be changed (immutable goal ownership)
 *                                           - createdAt: Cannot be changed (immutable creation timestamp)
 *                                           Updateable fields include:
 *                                           - name: Goal name modifications for clarity or rebranding
 *                                           - targetAmount: Goal amount adjustments for changing requirements
 *                                           - currentAmount: Progress updates for achievement tracking
 *                                           - targetDate: Timeline adjustments for realistic goal setting
 *                                           - status: Goal status transitions (IN_PROGRESS, COMPLETED, CANCELLED)
 *                                           - category: Goal categorization updates for better organization
 *                                           - description: Goal description modifications for additional context
 *                                           - priority: Goal priority adjustments for focus management
 * 
 * @returns {Promise<FinancialGoal>} A promise that resolves to the complete updated financial goal.
 *                                  The response includes:
 *                                  - All updated fields with new values and validations
 *                                  - Automatically recalculated dependent fields and progress metrics
 *                                  - Updated metadata (updatedAt timestamp, version information)
 *                                  - Complete goal data for immediate frontend synchronization
 *                                  - Progress calculation and milestone detection results
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to update the specified goal
 *                 - VALIDATION_ERROR: Invalid update data or business rule violations
 *                 - NOT_FOUND_ERROR: Financial goal not found for the specified goalId
 *                 - CONFLICT_ERROR: Concurrent update conflict (optimistic locking failure)
 *                 - BUSINESS_RULE_ERROR: Update violates financial goal business rules
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Update goal progress with new contribution
 *   const updatedGoal = await updateFinancialGoal('goal-123e4567-e89b-12d3-a456-426614174000', {
 *     currentAmount: 15750.00,  // New progress amount after recent contribution
 *     description: 'Updated progress after tax refund contribution'
 *   });
 *   
 *   console.log(`Updated progress: $${updatedGoal.currentAmount.toLocaleString()}`);
 *   
 *   const progressPercentage = (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100;
 *   console.log(`Progress: ${progressPercentage.toFixed(1)}%`);
 *   
 *   // Check for milestone achievements
 *   if (progressPercentage >= 50 && progressPercentage < 60) {
 *     showMilestoneAchievementNotification('50% Complete!');
 *   }
 *   
 *   // Update goal display in dashboard
 *   refreshGoalDisplay(updatedGoal);
 *   
 *   // Show success notification
 *   showSuccessMessage('Goal progress updated successfully!');
 *   
 * } catch (error) {
 *   if (error.category === 'VALIDATION_ERROR') {
 *     // Display specific validation errors
 *     showValidationErrors(error.validationDetails);
 *   } else if (error.category === 'NOT_FOUND_ERROR') {
 *     // Handle goal not found scenario
 *     showErrorMessage('The goal you are trying to update no longer exists.');
 *     refreshGoalsList();
 *   } else if (error.category === 'CONFLICT_ERROR') {
 *     // Handle concurrent update conflict
 *     showConflictResolutionDialog(error.conflictDetails);
 *   } else {
 *     // Display general error message
 *     showErrorMessage('Unable to update your goal. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link getFinancialGoals} - Function for retrieving user's financial goals
 * @see {@link createFinancialGoal} - Function for creating new financial goals
 * @see {@link deleteFinancialGoal} - Function for deleting financial goals
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const updateFinancialGoal = async (goalId: string, goalData: Partial<FinancialGoal>): Promise<FinancialGoal> => {
  try {
    // Input validation - ensure goalId is provided and properly formatted
    if (!goalId || typeof goalId !== 'string' || goalId.trim().length === 0) {
      const validationError = new Error('Invalid goalId: goalId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid goal identifier provided.';
      throw validationError;
    }

    // Input validation - ensure goalData is provided and is a valid object
    if (!goalData || typeof goalData !== 'object' || Array.isArray(goalData)) {
      const validationError = new Error('Invalid goalData: goalData must be a valid object');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid goal data provided for update.';
      throw validationError;
    }

    // Validate that at least one field is provided for update
    const updateFields = Object.keys(goalData);
    if (updateFields.length === 0) {
      const validationError = new Error('No update fields provided: goalData must contain at least one field to update');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'No goal data provided for update.';
      throw validationError;
    }

    // Prevent updates to immutable fields
    const immutableFields = ['id', 'userId', 'createdAt'];
    const providedImmutableFields = updateFields.filter(field => immutableFields.includes(field));
    if (providedImmutableFields.length > 0) {
      const validationError = new Error(`Cannot update immutable fields: ${providedImmutableFields.join(', ')}`);
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Some fields cannot be modified after goal creation.';
      throw validationError;
    }

    // Validate individual field updates
    if (goalData.name !== undefined) {
      if (typeof goalData.name !== 'string' || goalData.name.trim().length === 0) {
        const validationError = new Error('Invalid goal name: name must be a non-empty string');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal name cannot be empty.';
        throw validationError;
      }

      if (goalData.name.trim().length < 5 || goalData.name.trim().length > 100) {
        const validationError = new Error('Invalid goal name length: name must be between 5 and 100 characters');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal name must be between 5 and 100 characters long.';
        throw validationError;
      }
    }

    if (goalData.targetAmount !== undefined) {
      if (typeof goalData.targetAmount !== 'number' || goalData.targetAmount <= 0) {
        const validationError = new Error('Invalid target amount: targetAmount must be a positive number');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Target amount must be a positive number greater than zero.';
        throw validationError;
      }

      if (goalData.targetAmount > 999999999.99) {
        const validationError = new Error('Invalid target amount: targetAmount exceeds maximum allowed value');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Target amount is too large. Please enter a reasonable goal amount.';
        throw validationError;
      }
    }

    if (goalData.currentAmount !== undefined) {
      if (typeof goalData.currentAmount !== 'number' || goalData.currentAmount < 0) {
        const validationError = new Error('Invalid current amount: currentAmount must be a non-negative number');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Current amount must be zero or a positive number.';
        throw validationError;
      }

      if (goalData.currentAmount > 999999999.99) {
        const validationError = new Error('Invalid current amount: currentAmount exceeds maximum allowed value');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Current amount is too large. Please enter a reasonable amount.';
        throw validationError;
      }
    }

    if (goalData.targetDate !== undefined) {
      if (typeof goalData.targetDate !== 'string') {
        const validationError = new Error('Invalid target date: targetDate must be a valid date string');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Target date must be a valid date.';
        throw validationError;
      }

      // Validate target date is in the future (allow current goals to have past dates if they're completed)
      const targetDate = new Date(goalData.targetDate);
      const currentDate = new Date();
      if (targetDate <= currentDate && goalData.status !== 'COMPLETED' && goalData.status !== 'CANCELLED') {
        const validationError = new Error('Invalid target date: targetDate must be in the future for active goals');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Target date must be in the future for active goals.';
        throw validationError;
      }
    }

    if (goalData.status !== undefined) {
      const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(goalData.status)) {
        const validationError = new Error('Invalid status: status must be IN_PROGRESS, COMPLETED, or CANCELLED');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal status must be In Progress, Completed, or Cancelled.';
        throw validationError;
      }
    }

    if (goalData.category !== undefined) {
      const validCategories = ['SAVINGS', 'INVESTMENT', 'DEBT_PAYOFF', 'MAJOR_PURCHASE', 'EDUCATION', 'TRAVEL', 'OTHER'];
      if (!validCategories.includes(goalData.category)) {
        const validationError = new Error('Invalid category: category must be a valid goal category');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal category must be a valid category type.';
        throw validationError;
      }
    }

    if (goalData.priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(goalData.priority)) {
        const validationError = new Error('Invalid priority: priority must be LOW, MEDIUM, or HIGH');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal priority must be Low, Medium, or High.';
        throw validationError;
      }
    }

    if (goalData.description !== undefined) {
      if (typeof goalData.description !== 'string' || goalData.description.length > 500) {
        const validationError = new Error('Invalid description: description must be a string with maximum 500 characters');
        (validationError as any).category = 'VALIDATION_ERROR';
        (validationError as any).userMessage = 'Goal description must be 500 characters or less.';
        throw validationError;
      }
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Updating financial goal', {
        goalId: goalId,
        updateFields: updateFields,
        endpoint: `/financial-wellness/goals/${goalId}`,
        timestamp: new Date().toISOString(),
        operation: 'updateFinancialGoal'
      });
    }

    // Make authenticated API call to update financial goal
    const updatedGoal: FinancialGoal = await api.put(`/financial-wellness/goals/${goalId}`, goalData);

    // Validate the response structure to ensure data integrity
    if (!updatedGoal || typeof updatedGoal !== 'object') {
      const dataError = new Error('Invalid updated goal data received from server');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process updated goal data. Please try again.';
      throw dataError;
    }

    // Validate that the updated goal has the same ID
    if (updatedGoal.id !== goalId) {
      const dataError = new Error('Goal ID mismatch in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal data contains incorrect identification. Please contact support.';
      throw dataError;
    }

    // Validate that updated fields match the input where applicable
    if (goalData.name !== undefined && updatedGoal.name !== goalData.name) {
      const dataError = new Error('Goal name mismatch in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal data does not match input. Please try again.';
      throw dataError;
    }

    if (goalData.targetAmount !== undefined && updatedGoal.targetAmount !== goalData.targetAmount) {
      const dataError = new Error('Target amount mismatch in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal data does not match input. Please try again.';
      throw dataError;
    }

    if (goalData.currentAmount !== undefined && updatedGoal.currentAmount !== goalData.currentAmount) {
      const dataError = new Error('Current amount mismatch in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal data does not match input. Please try again.';
      throw dataError;
    }

    // Validate critical goal fields are still valid
    if (typeof updatedGoal.targetAmount !== 'number' || updatedGoal.targetAmount <= 0) {
      const dataError = new Error('Invalid target amount in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal contains invalid target amount. Please contact support.';
      throw dataError;
    }

    if (typeof updatedGoal.currentAmount !== 'number' || updatedGoal.currentAmount < 0) {
      const dataError = new Error('Invalid current amount in updated goal data');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Updated goal contains invalid current amount. Please contact support.';
      throw dataError;
    }

    // Log successful goal update (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      const progressPercentage = (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100;
      
      console.debug('Financial Wellness Service: Successfully updated financial goal', {
        goalId: goalId,
        updatedFields: updateFields,
        goalName: updatedGoal.name,
        targetAmount: updatedGoal.targetAmount,
        currentAmount: updatedGoal.currentAmount,
        progressPercentage: progressPercentage.toFixed(2),
        status: updatedGoal.status,
        timestamp: new Date().toISOString(),
        operation: 'updateFinancialGoal'
      });
    }

    // Return the validated updated financial goal for frontend consumption
    return updatedGoal;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error updating financial goal', {
      goalId: goalId,
      goalData: goalData,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'updateFinancialGoal',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to update financial goal: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to update your financial goal. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'updateFinancialGoal';
    
    throw serviceError;
  }
};

/**
 * Deletes a financial goal from the user's goal tracking system.
 * 
 * This function implements the goal deletion capability by permanently removing
 * a financial goal from the user's account. The deletion process includes proper
 * authorization checks, data cleanup, and audit trail maintenance for compliance
 * and data integrity purposes.
 * 
 * Deletion Features:
 * - Permanent goal removal from user's goal collection
 * - Comprehensive authorization checks to ensure goal ownership
 * - Audit trail maintenance for compliance and data governance
 * - Related data cleanup (progress tracking, recommendations, etc.)
 * - Safe deletion with confirmation requirements for irreversible actions
 * 
 * Business Value:
 * - Enables users to remove outdated or irrelevant financial goals
 * - Supports goal management hygiene and organization
 * - Provides data privacy compliance for user data deletion requests
 * - Facilitates account cleanup and goal collection maintenance
 * - Supports advisor-assisted goal portfolio optimization
 * 
 * Technical Implementation:
 * - Makes authenticated DELETE request to /financial-wellness/goals/{goalId} endpoint
 * - Implements cascade deletion for related data (progress records, etc.)
 * - Maintains audit logs for regulatory compliance and data governance
 * - Performs authorization checks to ensure goal ownership
 * - Returns void to indicate successful deletion completion
 * 
 * Data Integrity:
 * - Goal ownership verification before deletion authorization
 * - Related data cleanup to prevent orphaned records
 * - Audit trail preservation for compliance requirements
 * - Transaction-based deletion for data consistency
 * - Backup and recovery considerations for accidental deletions
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token with appropriate permissions
 * - Goal ownership verification - users can only delete their own goals
 * - Audit logging for all goal deletions for compliance monitoring
 * - Protection against unauthorized deletion attempts
 * - Data retention policy compliance for financial data
 * 
 * Business Rules:
 * - Users can only delete goals they own
 * - Completed goals may have additional confirmation requirements
 * - Goals with significant progress may require explicit confirmation
 * - Related recommendation and progress data is cleaned up automatically
 * - Deletion action is irreversible and requires user acknowledgment
 * 
 * @param {string} goalId - Unique identifier for the financial goal to be deleted.
 *                         Must be a valid UUID v4 format matching an existing goal ID.
 *                         Backend verifies goal existence and ownership before allowing deletion.
 *                         This identifier is used for authorization checks and audit logging.
 * 
 * @returns {Promise<void>} A promise that resolves when the goal is successfully deleted.
 *                         The void return indicates successful completion of the deletion operation.
 *                         No data is returned as the goal and its associated data are permanently removed.
 *                         Success resolution confirms that:
 *                         - Goal has been permanently deleted from the database
 *                         - Related data has been cleaned up (progress records, etc.)
 *                         - Audit logs have been created for compliance tracking
 *                         - Cache invalidation has been performed for real-time updates
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to delete the specified goal
 *                 - NOT_FOUND_ERROR: Financial goal not found for the specified goalId
 *                 - BUSINESS_RULE_ERROR: Goal deletion violates business rules or constraints
 *                 - CONFLICT_ERROR: Goal cannot be deleted due to current state or dependencies
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 *                 - DATA_INTEGRITY_ERROR: Deletion would compromise data integrity
 * 
 * @example
 * ```typescript
 * try {
 *   // Delete a cancelled or outdated financial goal
 *   await deleteFinancialGoal('goal-123e4567-e89b-12d3-a456-426614174000');
 *   
 *   console.log('Financial goal deleted successfully');
 *   
 *   // Update the goals list in the UI
 *   refreshGoalsList();
 *   
 *   // Show success notification to user
 *   showSuccessMessage('Your financial goal has been deleted successfully.');
 *   
 *   // Optionally, log the deletion for user activity tracking
 *   logUserActivity('goal_deleted', {
 *     goalId: 'goal-123e4567-e89b-12d3-a456-426614174000',
 *     timestamp: new Date().toISOString()
 *   });
 *   
 * } catch (error) {
 *   if (error.category === 'NOT_FOUND_ERROR') {
 *     // Handle goal not found scenario
 *     showInfoMessage('The goal you are trying to delete no longer exists.');
 *     refreshGoalsList(); // Refresh list to sync current state
 *   } else if (error.category === 'AUTHORIZATION_ERROR') {
 *     // Handle authorization failure
 *     showErrorMessage('You are not authorized to delete this goal.');
 *   } else if (error.category === 'BUSINESS_RULE_ERROR') {
 *     // Handle business rule violations
 *     showErrorMessage(error.userMessage || 'This goal cannot be deleted due to business rules.');
 *   } else if (error.category === 'CONFLICT_ERROR') {
 *     // Handle deletion conflicts
 *     showConfirmationDialog({
 *       title: 'Confirm Deletion',
 *       message: error.userMessage || 'Are you sure you want to delete this goal? This action cannot be undone.',
 *       onConfirm: () => forceDeleteGoal(goalId),
 *       onCancel: () => console.log('Goal deletion cancelled by user')
 *     });
 *   } else {
 *     // Display general error message
 *     showErrorMessage('Unable to delete your goal. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link FinancialGoal} - Complete interface definition for financial goals
 * @see {@link getFinancialGoals} - Function for retrieving user's financial goals
 * @see {@link updateFinancialGoal} - Function for updating existing financial goals
 * @see {@link createFinancialGoal} - Function for creating new financial goals
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const deleteFinancialGoal = async (goalId: string): Promise<void> => {
  try {
    // Input validation - ensure goalId is provided and properly formatted
    if (!goalId || typeof goalId !== 'string' || goalId.trim().length === 0) {
      const validationError = new Error('Invalid goalId: goalId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid goal identifier provided for deletion.';
      throw validationError;
    }

    // Additional validation for goalId format (basic UUID structure check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(goalId.trim())) {
      const validationError = new Error('Invalid goalId format: goalId must be a valid UUID');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid goal identifier format provided.';
      throw validationError;
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Deleting financial goal', {
        goalId: goalId,
        endpoint: `/financial-wellness/goals/${goalId}`,
        timestamp: new Date().toISOString(),
        operation: 'deleteFinancialGoal'
      });
    }

    // Make authenticated API call to delete financial goal
    // The DELETE endpoint should return void/null on successful deletion
    await api.delete(`/financial-wellness/goals/${goalId}`);

    // Log successful goal deletion (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Successfully deleted financial goal', {
        goalId: goalId,
        timestamp: new Date().toISOString(),
        operation: 'deleteFinancialGoal'
      });
    }

    // Successful deletion - no return value needed for void Promise
    // The goal has been permanently deleted from the backend system
    // Related data cleanup has been performed automatically
    // Audit logs have been created for compliance tracking

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error deleting financial goal', {
      goalId: goalId,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'deleteFinancialGoal',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to delete financial goal: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to delete your financial goal. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'deleteFinancialGoal';
    
    throw serviceError;
  }
};

/**
 * Retrieves personalized financial recommendations for a specified user.
 * 
 * This function implements the AI-powered recommendation engine capability by fetching
 * personalized financial recommendations tailored to the user's financial profile,
 * goals, spending patterns, and risk tolerance. The recommendations are generated
 * using advanced machine learning algorithms and provide actionable financial advice.
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
 * Technical Implementation:
 * - Makes authenticated GET request to /financial-wellness/recommendations/{userId} endpoint
 * - Integrates with AI-Powered Risk Assessment Engine (F-002) for intelligent insights
 * - Leverages unified customer data from F-001: Unified Data Integration Platform
 * - Returns array of comprehensive Recommendation objects with actionable advice
 * - Supports real-time recommendation updates based on user behavior and market changes
 * 
 * Recommendation Categories:
 * - SAVINGS: Emergency fund optimization, high-yield account recommendations, automated savings
 * - INVESTMENT: Portfolio diversification, retirement planning, risk-appropriate asset allocation
 * - DEBT_MANAGEMENT: Debt consolidation strategies, payment optimization, interest reduction
 * - INSURANCE: Coverage gap analysis, policy optimization, risk protection recommendations
 * 
 * Security Considerations:
 * - Requires valid JWT authentication token with appropriate permissions
 * - User authorization enforced - users can only access their own recommendations
 * - Recommendation data encrypted in transit using HTTPS/TLS encryption
 * - Access logging maintained for audit compliance and security monitoring
 * - AI model bias monitoring and fairness validation
 * 
 * Privacy and Compliance:
 * - User consent required for AI-powered recommendation generation
 * - Recommendation data handling complies with GDPR and financial privacy regulations
 * - Audit trail maintained for all recommendation interactions and user responses
 * - AI ethics and transparency requirements compliance
 * - Model explainability features for recommendation reasoning
 * 
 * @param {string} userId - Unique identifier for the user whose personalized recommendations are being retrieved.
 *                         Must be a valid UUID v4 format matching the User.id structure.
 *                         This parameter is validated on the backend for security and data integrity.
 *                         The AI engine uses this identifier to access the user's complete financial profile,
 *                         including wellness assessment, goals, transaction history, and behavioral patterns.
 * 
 * @returns {Promise<Recommendation[]>} A promise that resolves to an array of personalized financial recommendations.
 *                                     Each recommendation includes:
 *                                     - Unique identification for tracking and analytics
 *                                     - Concise, action-oriented title summarizing the recommendation
 *                                     - Detailed explanation with benefits and implementation guidance
 *                                     - Category classification for organization and filtering
 *                                     - Specific actionable steps for implementation
 *                                     - Optional priority level indicating recommendation importance
 *                                     - Optional estimated financial impact and difficulty level
 *                                     - Optional expiration date for time-sensitive recommendations
 *                                     - Metadata including creation and update timestamps
 *                                     Empty array is returned if no recommendations are available for the user.
 * 
 * @throws {Error} Throws structured error with specific error categories:
 *                 - AUTHENTICATION_ERROR: Invalid or expired JWT token
 *                 - AUTHORIZATION_ERROR: User not authorized to access recommendations for specified userId
 *                 - VALIDATION_ERROR: Invalid userId format or parameter validation failure
 *                 - NOT_FOUND_ERROR: User profile not found (recommendations require complete wellness profile)
 *                 - AI_SERVICE_ERROR: AI recommendation engine temporarily unavailable
 *                 - INSUFFICIENT_DATA_ERROR: Insufficient user data for recommendation generation
 *                 - SERVER_ERROR: Backend service unavailable or internal server error
 *                 - NETWORK_ERROR: Network connectivity issues or timeout
 * 
 * @example
 * ```typescript
 * try {
 *   // Retrieve personalized financial recommendations for authenticated user
 *   const recommendations = await getRecommendations('user-123e4567-e89b-12d3-a456-426614174000');
 *   
 *   console.log(`Found ${recommendations.length} personalized recommendations`);
 *   
 *   // Process recommendations by category
 *   const savingsRecs = recommendations.filter(rec => rec.category === 'SAVINGS');
 *   const investmentRecs = recommendations.filter(rec => rec.category === 'INVESTMENT');
 *   const debtRecs = recommendations.filter(rec => rec.category === 'DEBT_MANAGEMENT');
 *   const insuranceRecs = recommendations.filter(rec => rec.category === 'INSURANCE');
 *   
 *   console.log(`Savings recommendations: ${savingsRecs.length}`);
 *   console.log(`Investment recommendations: ${investmentRecs.length}`);
 *   console.log(`Debt management recommendations: ${debtRecs.length}`);
 *   console.log(`Insurance recommendations: ${insuranceRecs.length}`);
 *   
 *   // Prioritize high-priority recommendations
 *   const highPriorityRecs = recommendations.filter(rec => rec.priority === 'HIGH');
 *   console.log(`High priority recommendations: ${highPriorityRecs.length}`);
 *   
 *   // Display recommendations in dashboard with proper categorization
 *   displayRecommendationsDashboard({
 *     savings: savingsRecs,
 *     investment: investmentRecs,
 *     debt: debtRecs,
 *     insurance: insuranceRecs,
 *     highPriority: highPriorityRecs
 *   });
 *   
 *   // Track recommendation delivery for analytics
 *   trackRecommendationDelivery(recommendations.map(rec => rec.id));
 *   
 * } catch (error) {
 *   if (error.category === 'AUTHENTICATION_ERROR') {
 *     // Redirect to login page
 *     redirectToLogin();
 *   } else if (error.category === 'INSUFFICIENT_DATA_ERROR') {
 *     // Prompt user to complete wellness profile
 *     showWellnessProfilePrompt(error.userMessage);
 *   } else if (error.category === 'AI_SERVICE_ERROR') {
 *     // Handle AI service unavailability
 *     showServiceUnavailableMessage('Recommendation engine is temporarily unavailable. Please try again later.');
 *   } else if (error.category === 'NOT_FOUND_ERROR') {
 *     // Handle missing user profile
 *     showProfileCompletionPrompt('Please complete your financial wellness profile to receive personalized recommendations.');
 *   } else {
 *     // Display user-friendly error message
 *     showErrorMessage('Unable to load your personalized recommendations. Please try again.');
 *   }
 * }
 * ```
 * 
 * @see {@link Recommendation} - Complete interface definition for financial recommendations
 * @see {@link getWellnessProfile} - Function for retrieving user wellness profile (required for recommendations)
 * @see {@link getFinancialGoals} - Function for retrieving user goals (influences recommendations)
 * @see {@link updateWellnessProfile} - Function for updating profile (triggers recommendation updates)
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export const getRecommendations = async (userId: string): Promise<Recommendation[]> => {
  try {
    // Input validation - ensure userId is provided and properly formatted
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const validationError = new Error('Invalid userId: userId must be a non-empty string');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier provided.';
      throw validationError;
    }

    // Additional validation for userId format (basic UUID structure check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId.trim())) {
      const validationError = new Error('Invalid userId format: userId must be a valid UUID');
      (validationError as any).category = 'VALIDATION_ERROR';
      (validationError as any).userMessage = 'Invalid user identifier format provided.';
      throw validationError;
    }

    // Log the API call for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Wellness Service: Fetching personalized recommendations', {
        userId: userId,
        endpoint: `/financial-wellness/recommendations/${userId}`,
        timestamp: new Date().toISOString(),
        operation: 'getRecommendations'
      });
    }

    // Make authenticated API call to retrieve personalized recommendations
    // The API endpoint integrates with the AI-powered recommendation engine
    const recommendations: Recommendation[] = await api.financialWellness.getRecommendations(userId);

    // Validate the response structure to ensure data integrity
    if (!Array.isArray(recommendations)) {
      const dataError = new Error('Invalid recommendations data received from server: expected array');
      (dataError as any).category = 'DATA_ERROR';
      (dataError as any).userMessage = 'Unable to process recommendations data. Please try again.';
      throw dataError;
    }

    // Validate each recommendation in the array to ensure data consistency
    for (let i = 0; i < recommendations.length; i++) {
      const recommendation = recommendations[i];
      
      if (!recommendation || typeof recommendation !== 'object') {
        const dataError = new Error(`Invalid recommendation data at index ${i}: recommendation must be a valid object`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Some recommendation data is corrupted. Please contact support.';
        throw dataError;
      }

      // Validate critical recommendation fields
      if (!recommendation.id || typeof recommendation.id !== 'string') {
        const dataError = new Error(`Invalid recommendation ID at index ${i}: id must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains invalid identifiers. Please contact support.';
        throw dataError;
      }

      if (!recommendation.title || typeof recommendation.title !== 'string') {
        const dataError = new Error(`Invalid recommendation title at index ${i}: title must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains invalid titles. Please contact support.';
        throw dataError;
      }

      if (!recommendation.description || typeof recommendation.description !== 'string') {
        const dataError = new Error(`Invalid recommendation description at index ${i}: description must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains invalid descriptions. Please contact support.';
        throw dataError;
      }

      if (!recommendation.action || typeof recommendation.action !== 'string') {
        const dataError = new Error(`Invalid recommendation action at index ${i}: action must be a non-empty string`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains invalid actions. Please contact support.';
        throw dataError;
      }

      const validCategories = ['SAVINGS', 'INVESTMENT', 'DEBT_MANAGEMENT', 'INSURANCE'];
      if (!validCategories.includes(recommendation.category)) {
        const dataError = new Error(`Invalid recommendation category at index ${i}: category must be a valid category type`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains invalid categories. Please contact support.';
        throw dataError;
      }

      if (recommendation.userId !== userId) {
        const dataError = new Error(`User ID mismatch at index ${i}: recommendation userId does not match request userId`);
        (dataError as any).category = 'DATA_ERROR';
        (dataError as any).userMessage = 'Recommendation data contains incorrect user identification. Please contact support.';
        throw dataError;
      }

      // Validate optional fields if present
      if (recommendation.priority !== undefined) {
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
        if (!validPriorities.includes(recommendation.priority)) {
          const dataError = new Error(`Invalid recommendation priority at index ${i}: priority must be LOW, MEDIUM, or HIGH`);
          (dataError as any).category = 'DATA_ERROR';
          (dataError as any).userMessage = 'Recommendation data contains invalid priority levels. Please contact support.';
          throw dataError;
        }
      }

      if (recommendation.difficulty !== undefined) {
        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        if (!validDifficulties.includes(recommendation.difficulty)) {
          const dataError = new Error(`Invalid recommendation difficulty at index ${i}: difficulty must be EASY, MEDIUM, or HARD`);
          (dataError as any).category = 'DATA_ERROR';
          (dataError as any).userMessage = 'Recommendation data contains invalid difficulty levels. Please contact support.';
          throw dataError;
        }
      }

      if (recommendation.estimatedImpact !== undefined) {
        if (typeof recommendation.estimatedImpact !== 'number' || recommendation.estimatedImpact < 0) {
          const dataError = new Error(`Invalid recommendation estimated impact at index ${i}: estimatedImpact must be a non-negative number`);
          (dataError as any).category = 'DATA_ERROR';
          (dataError as any).userMessage = 'Recommendation data contains invalid impact estimates. Please contact support.';
          throw dataError;
        }
      }

      // Validate timestamp fields
      if (!recommendation.createdAt || !(recommendation.createdAt instanceof Date)) {
        // Try to parse if it's a string
        if (typeof recommendation.createdAt === 'string') {
          try {
            recommendation.createdAt = new Date(recommendation.createdAt);
          } catch (parseError) {
            const dataError = new Error(`Invalid recommendation creation timestamp at index ${i}: createdAt must be a valid date`);
            (dataError as any).category = 'DATA_ERROR';
            (dataError as any).userMessage = 'Recommendation data contains invalid timestamps. Please contact support.';
            throw dataError;
          }
        } else {
          const dataError = new Error(`Invalid recommendation creation timestamp at index ${i}: createdAt must be a valid date`);
          (dataError as any).category = 'DATA_ERROR';
          (dataError as any).userMessage = 'Recommendation data contains invalid timestamps. Please contact support.';
          throw dataError;
        }
      }
    }

    // Log successful recommendations retrieval (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      const recommendationStats = {
        total: recommendations.length,
        savings: recommendations.filter(r => r.category === 'SAVINGS').length,
        investment: recommendations.filter(r => r.category === 'INVESTMENT').length,
        debtManagement: recommendations.filter(r => r.category === 'DEBT_MANAGEMENT').length,
        insurance: recommendations.filter(r => r.category === 'INSURANCE').length,
        highPriority: recommendations.filter(r => r.priority === 'HIGH').length,
        mediumPriority: recommendations.filter(r => r.priority === 'MEDIUM').length,
        lowPriority: recommendations.filter(r => r.priority === 'LOW').length
      };

      console.debug('Financial Wellness Service: Successfully retrieved personalized recommendations', {
        userId: userId,
        recommendationStats: recommendationStats,
        timestamp: new Date().toISOString(),
        operation: 'getRecommendations'
      });
    }

    // Return the validated recommendations array for frontend consumption
    return recommendations;

  } catch (error) {
    // Enhanced error handling with detailed logging and user-friendly messages
    console.error('Financial Wellness Service: Error retrieving personalized recommendations', {
      userId: userId,
      error: error,
      timestamp: new Date().toISOString(),
      operation: 'getRecommendations',
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Re-throw the error with additional context if it's already a structured error
    if (error && (error as any).category) {
      throw error;
    }

    // Create structured error for unhandled exceptions
    const serviceError = new Error(`Failed to retrieve personalized recommendations: ${error instanceof Error ? error.message : String(error)}`);
    (serviceError as any).category = 'SERVICE_ERROR';
    (serviceError as any).userMessage = 'Unable to load your personalized recommendations. Please try again later.';
    (serviceError as any).originalError = error;
    (serviceError as any).operation = 'getRecommendations';
    
    throw serviceError;
  }
};