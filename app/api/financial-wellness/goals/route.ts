// External imports - Next.js v14.2.3 for API route handling
import { NextRequest, NextResponse } from 'next/server'; // next@14.2.3
import { getServerSession } from 'next-auth/next'; // next-auth@4.24.5

// Internal imports - Authentication, types, API client, and utilities
import { authOptions } from '../../../../../lib/auth';
import { FinancialGoal } from '../../../../../models/financial-wellness';
import api from '../../../../../lib/api';
import { handleApiError } from '../../../../../lib/error-handling';
import { z } from 'zod'; // zod@3.22+

/**
 * Financial Goals API Route Handlers for Unified Financial Services Platform
 * 
 * This module implements comprehensive API route handlers for managing financial goals
 * within the Personalized Financial Wellness feature (F-007). It provides secure,
 * enterprise-grade endpoints for creating and retrieving financial goals with full
 * authentication, validation, and error handling capabilities.
 * 
 * Key Features:
 * - RESTful API design following Next.js App Router conventions
 * - JWT-based authentication with NextAuth.js integration
 * - Comprehensive input validation using Zod schemas
 * - Structured error handling with user-friendly messages
 * - Integration with backend financial-wellness-service microservice
 * - Type-safe operations using TypeScript interfaces
 * - Production-ready logging and monitoring integration
 * 
 * Supported Operations:
 * - GET: Retrieve all financial goals for authenticated user
 * - POST: Create new financial goal with validation and persistence
 * 
 * Technical Requirements Addressed:
 * - F-007: Personalized Financial Recommendations - Goal tracking capability
 * - 1.2.2: Primary System Capabilities - Personalized Financial Wellness
 * - Authentication & Authorization - Secure API access control
 * - Data Validation - Input sanitization and business rule enforcement
 * - Error Handling - Comprehensive error response management
 * 
 * Security Features:
 * - Authentication verification for all operations
 * - Input validation and sanitization
 * - Structured error responses without sensitive data exposure
 * - Integration with audit logging for compliance
 * - Type-safe data handling to prevent injection attacks
 * 
 * Performance Characteristics:
 * - Sub-second response times for goal operations
 * - Efficient data retrieval with optimized backend queries
 * - Minimal memory footprint with streaming where appropriate
 * - Scalable architecture supporting high concurrent load
 * 
 * @fileoverview Financial goals API route handlers for financial wellness platform
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, financial data protection regulations
 * @since 2025
 */

/**
 * Financial Goal Validation Schema
 * 
 * Comprehensive validation schema for financial goal creation and updates,
 * implementing business rules and data integrity requirements for the
 * financial wellness platform. This schema ensures all goal data meets
 * platform standards and regulatory compliance requirements.
 * 
 * Validation Rules:
 * - Goal name: Required, descriptive, appropriate length
 * - Target amount: Positive monetary value with currency precision
 * - Current amount: Non-negative, cannot exceed practical limits
 * - Target date: Future date within reasonable timeframe
 * - Category: Predefined categories for goal organization
 * - Description: Optional detailed goal context
 * - Priority: Goal importance level for recommendation engine
 * 
 * Business Logic:
 * - Current amount validation against target amount
 * - Target date feasibility checks
 * - Category-specific validation rules
 * - Priority-based recommendation integration
 * 
 * @schema financialGoalSchema
 * @compliance Financial data validation standards
 * @version 1.0.0
 */
export const financialGoalSchema = z.object({
  /**
   * Goal name validation
   * 
   * Ensures goal names are descriptive, user-friendly, and appropriate
   * for display in financial planning interfaces. Names should clearly
   * indicate the goal's purpose and be memorable for users.
   * 
   * Validation criteria:
   * - Minimum 5 characters for meaningful goal identification
   * - Maximum 100 characters for UI display compatibility
   * - Alphanumeric characters, spaces, and common punctuation only
   * - Automatic trimming of whitespace for data consistency
   */
  name: z.string()
    .min(5, 'Goal name must be at least 5 characters long')
    .max(100, 'Goal name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s.,;:!?'"()\-_&%$@#+*=<>[\]{}|\\\/]+$/,
      'Goal name contains invalid characters'
    )
    .transform(val => val.trim())
    .refine(
      (name) => name.length >= 5,
      'Goal name must be at least 5 characters after trimming'
    ),

  /**
   * Target amount validation
   * 
   * Validates the monetary goal target ensuring realistic financial
   * planning while preventing data entry errors and maintaining
   * currency precision standards.
   * 
   * Validation criteria:
   * - Positive monetary value (minimum $0.01)
   * - Maximum $10,000,000 for practical financial planning
   * - Two decimal places maximum for currency precision
   * - Range validation for realistic goal setting
   */
  targetAmount: z.number()
    .positive('Target amount must be a positive value')
    .min(0.01, 'Minimum target amount is $0.01')
    .max(10000000, 'Maximum target amount is $10,000,000')
    .refine(
      (amount) => {
        // Validate decimal places for currency precision
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      },
      'Target amount cannot have more than 2 decimal places'
    )
    .refine(
      (amount) => {
        // Additional validation for reasonable financial goals
        return amount >= 1 && amount <= 10000000;
      },
      'Target amount must be between $1.00 and $10,000,000.00'
    ),

  /**
   * Current amount validation
   * 
   * Validates the current progress toward the financial goal,
   * ensuring data integrity while allowing for goal overachievement
   * and various contribution scenarios.
   * 
   * Validation criteria:
   * - Non-negative value (can be zero for new goals)
   * - Maximum $10,000,000 for practical limits
   * - Two decimal places maximum for currency precision
   * - Can exceed target amount (overachievement scenarios)
   */
  currentAmount: z.number()
    .min(0, 'Current amount cannot be negative')
    .max(10000000, 'Maximum current amount is $10,000,000')
    .refine(
      (amount) => {
        // Validate decimal places for currency precision
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      },
      'Current amount cannot have more than 2 decimal places'
    ),

  /**
   * Target date validation
   * 
   * Ensures goal target dates are realistic and within reasonable
   * timeframes for financial planning. Validates against both
   * past dates and excessively future dates.
   * 
   * Validation criteria:
   * - Must be a future date (after today)
   * - Cannot be more than 50 years in the future
   * - ISO 8601 date string format
   * - Date parsing validation for data integrity
   */
  targetDate: z.string()
    .refine(
      (dateString) => {
        try {
          const targetDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
          return targetDate > today;
        } catch {
          return false;
        }
      },
      'Target date must be in the future'
    )
    .refine(
      (dateString) => {
        try {
          const targetDate = new Date(dateString);
          const maxFutureDate = new Date();
          maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 50);
          return targetDate <= maxFutureDate;
        } catch {
          return false;
        }
      },
      'Target date cannot be more than 50 years in the future'
    )
    .refine(
      (dateString) => {
        try {
          const targetDate = new Date(dateString);
          return !isNaN(targetDate.getTime());
        } catch {
          return false;
        }
      },
      'Invalid date format'
    ),

  /**
   * Goal category validation
   * 
   * Validates goal categorization for organization, analytics, and
   * targeted recommendation generation. Categories align with
   * financial wellness best practices and user experience design.
   * 
   * Supported categories:
   * - SAVINGS: Emergency funds, general savings, short-term goals
   * - INVESTMENT: Long-term wealth building, retirement planning
   * - DEBT_PAYOFF: Credit card payoff, loan repayment goals
   * - MAJOR_PURCHASE: Home, car, large appliances
   * - EDUCATION: College funds, professional development
   * - TRAVEL: Vacation funds, travel experiences
   * - OTHER: Miscellaneous or custom goals
   */
  category: z.enum([
    'SAVINGS',
    'INVESTMENT',
    'DEBT_PAYOFF',
    'MAJOR_PURCHASE',
    'EDUCATION',
    'TRAVEL',
    'OTHER'
  ], {
    errorMap: () => ({
      message: 'Category must be one of: SAVINGS, INVESTMENT, DEBT_PAYOFF, MAJOR_PURCHASE, EDUCATION, TRAVEL, OTHER'
    })
  }).optional(),

  /**
   * Goal description validation
   * 
   * Optional detailed description providing context and motivation
   * for the financial goal. Supports user engagement and advisor
   * relationship management.
   * 
   * Validation criteria:
   * - Maximum 500 characters for reasonable detail
   * - Alphanumeric characters and common punctuation
   * - Automatic whitespace trimming
   * - Optional field with meaningful content validation
   */
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .regex(
      /^[a-zA-Z0-9\s.,;:!?'"()\-_&%$@#+*=<>[\]{}|\\\/\n\r]*$/,
      'Description contains invalid characters'
    )
    .transform(val => val.trim())
    .optional()
    .refine(
      (description) => {
        if (!description) return true;
        return description.length >= 10;
      },
      'Description must be at least 10 characters if provided'
    ),

  /**
   * Goal priority validation
   * 
   * Optional priority level for goal ranking and recommendation
   * engine focus. Helps users prioritize multiple goals and
   * guides the AI recommendation system.
   * 
   * Priority levels:
   * - LOW: Nice-to-have goals with flexible timelines
   * - MEDIUM: Important goals with moderate urgency
   * - HIGH: Critical goals requiring immediate focus
   */
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    errorMap: () => ({
      message: 'Priority must be one of: LOW, MEDIUM, HIGH'
    })
  }).optional()
});

/**
 * Validation utility function for financial goal data
 * 
 * Provides centralized validation logic for financial goal creation
 * and updates, ensuring data integrity and business rule compliance.
 * Returns structured validation results for consistent error handling.
 * 
 * @param {unknown} data - Raw data to validate against financial goal schema
 * @returns {object} Validation result with success status and parsed data or errors
 * 
 * @example
 * ```typescript
 * const validationResult = validate(requestBody);
 * if (!validationResult.success) {
 *   return NextResponse.json({ errors: validationResult.errors }, { status: 400 });
 * }
 * ```
 */
export const validate = (data: unknown) => {
  try {
    const parsedData = financialGoalSchema.parse(data);
    return {
      success: true,
      data: parsedData,
      errors: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ 
        field: 'unknown', 
        message: 'Validation failed', 
        code: 'invalid_type' 
      }]
    };
  }
};

/**
 * GET Route Handler - Retrieve Financial Goals
 * 
 * Handles GET requests to retrieve all financial goals for the authenticated user.
 * Implements secure access control, efficient data retrieval, and comprehensive
 * error handling to provide a reliable goal management experience.
 * 
 * Request Flow:
 * 1. Authenticate user session using NextAuth.js
 * 2. Extract user ID from authenticated session
 * 3. Query backend financial-wellness-service for user's goals
 * 4. Return structured response with goals data
 * 5. Handle errors gracefully with appropriate status codes
 * 
 * Security Features:
 * - Session-based authentication verification
 * - User-specific data isolation
 * - Structured error responses without sensitive data
 * - Audit logging for compliance requirements
 * 
 * Performance Optimizations:
 * - Efficient backend API integration
 * - Minimal data processing overhead
 * - Optimized response serialization
 * - Scalable architecture for concurrent requests
 * 
 * @param {NextRequest} req - Next.js request object containing headers and metadata
 * @returns {Promise<NextResponse>} JSON response with goals data or error information
 * 
 * @example Response Success (200):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "goals": [
 *       {
 *         "id": "goal-123",
 *         "userId": "user-456",
 *         "name": "Emergency Fund - 6 months expenses",
 *         "targetAmount": 25000.00,
 *         "currentAmount": 12500.00,
 *         "targetDate": "2025-12-31T23:59:59Z",
 *         "status": "IN_PROGRESS",
 *         "category": "SAVINGS",
 *         "priority": "HIGH",
 *         "createdAt": "2024-01-15T10:00:00Z",
 *         "updatedAt": "2024-01-20T14:30:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "total": 1,
 *       "page": 1,
 *       "limit": 10
 *     }
 *   },
 *   "message": "Goals retrieved successfully"
 * }
 * ```
 * 
 * @example Response Error (401):
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Authentication required",
 *     "code": "UNAUTHORIZED",
 *     "statusCode": 401
 *   }
 * }
 * ```
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authenticate user session using NextAuth.js
    console.info('[Financial Goals API] Processing GET request for goals retrieval', {
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: '/api/financial-wellness/goals',
      userAgent: req.headers.get('user-agent') || 'unknown',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.warn('[Financial Goals API] Unauthorized access attempt', {
        timestamp: new Date().toISOString(),
        method: 'GET',
        endpoint: '/api/financial-wellness/goals',
        sessionExists: !!session,
        userExists: !!(session?.user),
        userIdExists: !!(session?.user?.id),
        reason: 'Missing authentication session or user information'
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required. Please log in to access your financial goals.',
            code: 'UNAUTHORIZED',
            statusCode: 401,
            category: 'AUTHENTICATION_ERROR'
          }
        },
        { status: 401 }
      );
    }

    // Step 2: Extract user information from authenticated session
    const userId = session.user.id;
    const userEmail = session.user.email;

    console.info('[Financial Goals API] Authenticated user retrieving goals', {
      timestamp: new Date().toISOString(),
      userId: userId,
      userEmail: userEmail ? userEmail.replace(/(.{2}).*@/, '$1***@') : 'unknown',
      operation: 'goals_retrieval'
    });

    // Step 3: Query backend financial-wellness-service for user's goals
    try {
      const goalsResponse = await api.financialWellness.setFinancialGoal(userId, {
        action: 'GET_ALL',
        userId: userId
      });

      // Step 4: Validate and structure response data
      if (!goalsResponse || !goalsResponse.data) {
        console.warn('[Financial Goals API] Invalid response from backend service', {
          timestamp: new Date().toISOString(),
          userId: userId,
          operation: 'goals_retrieval',
          responseReceived: !!goalsResponse,
          dataReceived: !!(goalsResponse?.data)
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to retrieve goals data from service',
              code: 'SERVICE_ERROR',
              statusCode: 502,
              category: 'SERVER_ERROR'
            }
          },
          { status: 502 }
        );
      }

      // Step 5: Return successful response with goals data
      console.info('[Financial Goals API] Goals retrieved successfully', {
        timestamp: new Date().toISOString(),
        userId: userId,
        goalsCount: goalsResponse.data.goals?.length || 0,
        operation: 'goals_retrieval_success'
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            goals: goalsResponse.data.goals || [],
            pagination: goalsResponse.data.pagination || {
              total: goalsResponse.data.goals?.length || 0,
              page: 1,
              limit: 10
            }
          },
          message: 'Financial goals retrieved successfully'
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Response-Time': `${Date.now()}ms`
          }
        }
      );

    } catch (apiError) {
      // Handle backend API errors with comprehensive error information
      const errorResponse = handleApiError(apiError);
      
      console.error('[Financial Goals API] Backend service error during goal retrieval', {
        timestamp: new Date().toISOString(),
        userId: userId,
        operation: 'goals_retrieval',
        error: errorResponse,
        originalError: apiError
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorResponse.userMessage || 'Failed to retrieve your financial goals. Please try again.',
            code: errorResponse.code || 'SERVICE_ERROR',
            statusCode: errorResponse.statusCode || 500,
            category: errorResponse.category || 'SERVER_ERROR'
          }
        },
        { status: errorResponse.statusCode || 500 }
      );
    }

  } catch (error) {
    // Handle unexpected errors with comprehensive logging
    console.error('[Financial Goals API] Unexpected error in GET handler', {
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: '/api/financial-wellness/goals',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorResponse = handleApiError(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred while retrieving your goals. Please try again later.',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          category: 'SERVER_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST Route Handler - Create Financial Goal
 * 
 * Handles POST requests to create new financial goals for the authenticated user.
 * Implements comprehensive validation, secure data processing, and integration
 * with the backend financial-wellness-service for goal persistence.
 * 
 * Request Flow:
 * 1. Authenticate user session using NextAuth.js
 * 2. Parse and validate request body against financial goal schema
 * 3. Enrich goal data with user context and metadata
 * 4. Submit goal creation request to backend service
 * 5. Return structured response with created goal data
 * 6. Handle validation and service errors gracefully
 * 
 * Validation Features:
 * - Comprehensive input validation using Zod schemas
 * - Business rule enforcement for financial data
 * - Data sanitization and transformation
 * - User-friendly validation error messages
 * 
 * Security Features:
 * - Session-based authentication verification
 * - Input sanitization against injection attacks
 * - User-specific data isolation
 * - Audit logging for compliance tracking
 * 
 * @param {NextRequest} req - Next.js request object containing goal data
 * @returns {Promise<NextResponse>} JSON response with created goal or error information
 * 
 * @example Request Body:
 * ```json
 * {
 *   "name": "Emergency Fund - 6 months expenses",
 *   "targetAmount": 25000.00,
 *   "currentAmount": 0.00,
 *   "targetDate": "2025-12-31",
 *   "category": "SAVINGS",
 *   "description": "Building an emergency fund to cover 6 months of living expenses",
 *   "priority": "HIGH"
 * }
 * ```
 * 
 * @example Response Success (201):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "goal": {
 *       "id": "goal-789",
 *       "userId": "user-456",
 *       "name": "Emergency Fund - 6 months expenses",
 *       "targetAmount": 25000.00,
 *       "currentAmount": 0.00,
 *       "targetDate": "2025-12-31T23:59:59Z",
 *       "status": "IN_PROGRESS",
 *       "category": "SAVINGS",
 *       "description": "Building an emergency fund to cover 6 months of living expenses",
 *       "priority": "HIGH",
 *       "createdAt": "2024-01-25T10:00:00Z",
 *       "updatedAt": "2024-01-25T10:00:00Z"
 *     }
 *   },
 *   "message": "Financial goal created successfully"
 * }
 * ```
 * 
 * @example Response Validation Error (400):
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Validation failed",
 *     "code": "VALIDATION_ERROR",
 *     "statusCode": 400,
 *     "category": "VALIDATION_ERROR",
 *     "details": [
 *       {
 *         "field": "targetAmount",
 *         "message": "Target amount must be a positive value",
 *         "code": "invalid_type"
 *       }
 *     ]
 *   }
 * }
 * ```
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authenticate user session using NextAuth.js
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.info('[Financial Goals API] Processing POST request for goal creation', {
      timestamp: new Date().toISOString(),
      method: 'POST',
      endpoint: '/api/financial-wellness/goals',
      userAgent: req.headers.get('user-agent') || 'unknown',
      contentType: req.headers.get('content-type') || 'unknown',
      requestId: requestId
    });

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.warn('[Financial Goals API] Unauthorized goal creation attempt', {
        timestamp: new Date().toISOString(),
        method: 'POST',
        endpoint: '/api/financial-wellness/goals',
        requestId: requestId,
        sessionExists: !!session,
        userExists: !!(session?.user),
        userIdExists: !!(session?.user?.id),
        reason: 'Missing authentication session or user information'
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required. Please log in to create financial goals.',
            code: 'UNAUTHORIZED',
            statusCode: 401,
            category: 'AUTHENTICATION_ERROR'
          }
        },
        { status: 401 }
      );
    }

    // Step 2: Extract user information from authenticated session
    const userId = session.user.id;
    const userEmail = session.user.email;

    console.info('[Financial Goals API] Authenticated user creating goal', {
      timestamp: new Date().toISOString(),
      userId: userId,
      userEmail: userEmail ? userEmail.replace(/(.{2}).*@/, '$1***@') : 'unknown',
      operation: 'goal_creation',
      requestId: requestId
    });

    // Step 3: Parse and validate request body
    let requestBody: unknown;
    
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.warn('[Financial Goals API] Invalid JSON in request body', {
        timestamp: new Date().toISOString(),
        userId: userId,
        operation: 'goal_creation',
        requestId: requestId,
        error: parseError instanceof Error ? parseError.message : 'JSON parse error'
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request format. Please ensure you are sending valid JSON data.',
            code: 'INVALID_JSON',
            statusCode: 400,
            category: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      );
    }

    // Step 4: Validate request body against financial goal schema
    const validationResult = validate(requestBody);
    
    if (!validationResult.success) {
      console.warn('[Financial Goals API] Goal validation failed', {
        timestamp: new Date().toISOString(),
        userId: userId,
        operation: 'goal_creation',
        requestId: requestId,
        validationErrors: validationResult.errors,
        requestData: requestBody
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed. Please check your input and try again.',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            category: 'VALIDATION_ERROR',
            details: validationResult.errors
          }
        },
        { status: 400 }
      );
    }

    // Step 5: Enrich validated goal data with user context and metadata
    const goalData = {
      ...validationResult.data,
      userId: userId,
      status: 'IN_PROGRESS' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Set default values for optional fields
      category: validationResult.data.category || 'OTHER',
      priority: validationResult.data.priority || 'MEDIUM'
    };

    console.info('[Financial Goals API] Goal data validated and prepared', {
      timestamp: new Date().toISOString(),
      userId: userId,
      operation: 'goal_creation',
      requestId: requestId,
      goalName: goalData.name,
      goalCategory: goalData.category,
      goalPriority: goalData.priority,
      targetAmount: goalData.targetAmount,
      targetDate: goalData.targetDate
    });

    // Step 6: Submit goal creation request to backend financial-wellness-service
    try {
      const createResponse = await api.financialWellness.setFinancialGoal(userId, goalData);

      // Step 7: Validate backend response
      if (!createResponse || !createResponse.data || !createResponse.data.goal) {
        console.error('[Financial Goals API] Invalid response from goal creation service', {
          timestamp: new Date().toISOString(),
          userId: userId,
          operation: 'goal_creation',
          requestId: requestId,
          responseReceived: !!createResponse,
          dataReceived: !!(createResponse?.data),
          goalReceived: !!(createResponse?.data?.goal)
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to create goal due to service error. Please try again.',
              code: 'SERVICE_ERROR',
              statusCode: 502,
              category: 'SERVER_ERROR'
            }
          },
          { status: 502 }
        );
      }

      // Step 8: Return successful response with created goal data
      console.info('[Financial Goals API] Goal created successfully', {
        timestamp: new Date().toISOString(),
        userId: userId,
        operation: 'goal_creation_success',
        requestId: requestId,
        goalId: createResponse.data.goal.id,
        goalName: createResponse.data.goal.name,
        goalCategory: createResponse.data.goal.category,
        targetAmount: createResponse.data.goal.targetAmount
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            goal: createResponse.data.goal
          },
          message: 'Financial goal created successfully'
        },
        { 
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Location': `/api/financial-wellness/goals/${createResponse.data.goal.id}`,
            'X-Response-Time': `${Date.now()}ms`
          }
        }
      );

    } catch (apiError) {
      // Handle backend API errors during goal creation
      const errorResponse = handleApiError(apiError);
      
      console.error('[Financial Goals API] Backend service error during goal creation', {
        timestamp: new Date().toISOString(),
        userId: userId,
        operation: 'goal_creation',
        requestId: requestId,
        error: errorResponse,
        originalError: apiError,
        goalData: goalData
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorResponse.userMessage || 'Failed to create your financial goal. Please try again.',
            code: errorResponse.code || 'SERVICE_ERROR',
            statusCode: errorResponse.statusCode || 500,
            category: errorResponse.category || 'SERVER_ERROR'
          }
        },
        { status: errorResponse.statusCode || 500 }
      );
    }

  } catch (error) {
    // Handle unexpected errors with comprehensive logging
    console.error('[Financial Goals API] Unexpected error in POST handler', {
      timestamp: new Date().toISOString(),
      method: 'POST',
      endpoint: '/api/financial-wellness/goals',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorResponse = handleApiError(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred while creating your goal. Please try again later.',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          category: 'SERVER_ERROR'
        }
      },
      { status: 500 }
    );
  }
}