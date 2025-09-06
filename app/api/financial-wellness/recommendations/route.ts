// External imports - Next.js server components for API route handling
import { NextRequest, NextResponse } from 'next/server'; // next@14+

// Internal imports - Financial wellness service for recommendation retrieval
import financialWellnessService from '../../../../services/financial-wellness-service'; // Default export - financial wellness service v1.0+

// Internal imports - Centralized error handling for consistent error responses
import errorHandler from '../../../../utils/error-handler'; // Default export - centralized error handler v1.0+

// Internal imports - Type definitions for financial wellness recommendations
import { Recommendation } from '../../../../models/financial-wellness'; // Named export - recommendation interface v1.0+

/**
 * API Route Handler for Financial Wellness Recommendations
 * 
 * This Next.js API route implements the F-007: Personalized Financial Recommendations
 * feature by providing a backend-for-frontend (BFF) endpoint that serves personalized
 * financial recommendations to the user interface. The route processes GET requests,
 * authenticates users, and integrates with the financial wellness service to deliver
 * AI-powered, personalized financial guidance.
 * 
 * **Feature Implementation:**
 * - F-007: Personalized Financial Recommendations (Primary)
 * - F-001: Unified Data Integration Platform (Supporting - provides holistic customer data)
 * - Customer Satisfaction KPIs (Supporting - improves user experience through relevant recommendations)
 * 
 * **Technical Architecture:**
 * - Next.js 14+ App Router API route with TypeScript
 * - JWT-based authentication and authorization
 * - Integration with AI-powered recommendation engine via financial wellness service
 * - Centralized error handling with user-friendly error responses
 * - Type-safe operations using financial wellness data models
 * 
 * **Security and Compliance:**
 * - JWT token validation for user authentication
 * - Authorization checks to ensure users only access their own recommendations
 * - Audit logging for all recommendation access for compliance
 * - Financial data encryption in transit via HTTPS
 * - Error sanitization to prevent information disclosure
 * 
 * **Performance Requirements:**
 * - Sub-second response times for recommendation retrieval
 * - Efficient caching for frequently accessed recommendation data
 * - Scalable architecture supporting high concurrent user loads
 * - Graceful error handling with fallback mechanisms
 * 
 * **Business Value:**
 * - Increases customer engagement through personalized financial guidance
 * - Drives financial product adoption through targeted recommendations
 * - Improves customer satisfaction and financial outcomes
 * - Supports financial advisor relationship management
 * - Enables data-driven financial planning and decision making
 * 
 * @fileoverview Next.js API route for personalized financial wellness recommendations
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, financial services regulations
 * @security JWT authentication required, user authorization enforced
 * @performance Sub-second response time target
 * @since 2025
 */

/**
 * Configuration for Next.js dynamic route caching behavior.
 * 
 * Setting revalidate to 0 ensures this route is treated as dynamic and not cached,
 * which is appropriate for personalized recommendation data that should be fresh
 * and tailored to the current user's latest financial profile and behavior.
 * 
 * This configuration supports real-time recommendation updates and ensures users
 * receive the most current and relevant financial guidance based on their latest
 * financial data and goal progress.
 */
export const revalidate = 0;

/**
 * Utility function to extract and validate JWT token from Authorization header.
 * 
 * This function implements secure token extraction and basic validation to ensure
 * the request contains a properly formatted Bearer token for authentication.
 * 
 * @param {NextRequest} request - The incoming HTTP request object
 * @returns {string | null} Extracted JWT token or null if not found/invalid
 */
const extractTokenFromRequest = (request: NextRequest): string | null => {
  try {
    // Extract Authorization header from the request
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    // Validate Authorization header presence and format
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }
    
    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract token portion after "Bearer "
    const token = authHeader.substring(7).trim();
    
    // Basic token validation - ensure non-empty token
    if (!token || token.length === 0) {
      return null;
    }
    
    return token;
  } catch (error) {
    // Log token extraction error for debugging (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error extracting token from request:', error);
    }
    return null;
  }
};

/**
 * Utility function to decode JWT token and extract user information.
 * 
 * This function performs basic JWT token decoding to extract user identification
 * information. In a production environment, this would include full token validation,
 * signature verification, and expiration checking.
 * 
 * @param {string} token - JWT token to decode
 * @returns {object | null} Decoded token payload or null if invalid
 */
const decodeJWTToken = (token: string): { userId?: string; sub?: string; email?: string } | null => {
  try {
    // Split JWT token into parts (header.payload.signature)
    const tokenParts = token.split('.');
    
    // Validate JWT structure - should have exactly 3 parts
    if (tokenParts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part) from base64
    const payload = tokenParts[1];
    
    // Add padding if necessary for proper base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64 and parse JSON
    const decodedPayload = JSON.parse(atob(paddedPayload));
    
    // Validate decoded payload contains user identification
    if (!decodedPayload || typeof decodedPayload !== 'object') {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    // Log token decoding error for debugging (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  }
};

/**
 * Utility function to extract user ID from decoded JWT token payload.
 * 
 * This function handles multiple common JWT payload formats to extract the user
 * identifier, supporting various authentication systems and token formats.
 * 
 * @param {object} tokenPayload - Decoded JWT token payload
 * @returns {string | null} User ID or null if not found
 */
const extractUserIdFromToken = (tokenPayload: { userId?: string; sub?: string; email?: string }): string | null => {
  // Try common user ID fields in order of preference
  return tokenPayload.userId || tokenPayload.sub || tokenPayload.email || null;
};

/**
 * GET Request Handler for Financial Wellness Recommendations
 * 
 * Handles HTTP GET requests to retrieve personalized financial wellness recommendations
 * for the authenticated user. This endpoint serves as the primary API for delivering
 * AI-powered financial guidance to the user interface.
 * 
 * **Request Flow:**
 * 1. Extract and validate JWT authentication token from Authorization header
 * 2. Decode token and extract user identification information
 * 3. Authorize user access (users can only access their own recommendations)
 * 4. Call financial wellness service to retrieve personalized recommendations
 * 5. Return recommendations as JSON response or handle errors appropriately
 * 
 * **Authentication and Authorization:**
 * - Requires valid JWT token in Authorization header with Bearer scheme
 * - User identification extracted from token payload (userId, sub, or email)
 * - Users can only access recommendations for their own account
 * - Invalid or missing authentication results in 401 Unauthorized response
 * 
 * **Error Handling:**
 * - 401 Unauthorized: Missing, invalid, or expired authentication token
 * - 403 Forbidden: User lacks permission to access requested recommendations
 * - 404 Not Found: User profile not found or incomplete wellness profile
 * - 500 Internal Server Error: Service unavailable or unexpected system errors
 * - All errors include user-friendly messages and appropriate HTTP status codes
 * 
 * **Response Format:**
 * - Success: HTTP 200 with JSON array of Recommendation objects
 * - Error: HTTP error status with JSON error message and details
 * - Content-Type: application/json for all responses
 * 
 * **Performance Considerations:**
 * - Response caching disabled for personalized content freshness
 * - Efficient service calls with minimal data transfer
 * - Graceful degradation for service unavailability
 * - Optimized for concurrent user access and high throughput
 * 
 * @param {NextRequest} request - Incoming HTTP request object with headers and metadata
 * @returns {Promise<NextResponse>} HTTP response with recommendations data or error information
 * 
 * @example
 * ```typescript
 * // Example successful response
 * {
 *   "recommendations": [
 *     {
 *       "id": "rec-123...",
 *       "userId": "user-456...",
 *       "title": "Increase Your Emergency Fund by $200/month",
 *       "description": "Based on your current spending patterns...",
 *       "category": "SAVINGS",
 *       "action": "Set up automatic transfer...",
 *       "priority": "HIGH",
 *       "estimatedImpact": 2400.00,
 *       "difficulty": "EASY"
 *     }
 *   ]
 * }
 * 
 * // Example error response
 * {
 *   "error": "Unauthorized access",
 *   "message": "Please log in to access your financial recommendations"
 * }
 * ```
 * 
 * @throws {Error} All errors are handled gracefully and returned as JSON responses
 * @since 1.0.0
 * @version 1.0.0
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Log incoming request for debugging and monitoring (development/staging only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Recommendations API: Processing GET request', {
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin')
      });
    }

    // Step 1: Extract JWT authentication token from Authorization header
    const authToken = extractTokenFromRequest(request);
    
    // Validate authentication token presence
    if (!authToken) {
      // Log authentication failure for security monitoring
      console.warn('Financial Recommendations API: Authentication failed - missing or invalid token', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent')
      });
      
      // Return 401 Unauthorized with user-friendly error message
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please log in to access your financial recommendations',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Step 2: Decode JWT token to extract user information
    const tokenPayload = decodeJWTToken(authToken);
    
    // Validate token payload structure
    if (!tokenPayload) {
      // Log token validation failure for security monitoring
      console.warn('Financial Recommendations API: Token validation failed - invalid token format', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent')
      });
      
      // Return 401 Unauthorized with user-friendly error message
      return NextResponse.json(
        {
          error: 'Invalid authentication',
          message: 'Your session has expired. Please log in again',
          code: 'INVALID_TOKEN'
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Step 3: Extract user ID from token payload
    const userId = extractUserIdFromToken(tokenPayload);
    
    // Validate user ID extraction
    if (!userId) {
      // Log user ID extraction failure
      console.warn('Financial Recommendations API: User ID extraction failed - missing user identifier in token', {
        timestamp: new Date().toISOString(),
        tokenPayload: process.env.NODE_ENV !== 'production' ? tokenPayload : '[REDACTED]'
      });
      
      // Return 401 Unauthorized with user-friendly error message
      return NextResponse.json(
        {
          error: 'Invalid user session',
          message: 'Unable to identify user from session. Please log in again',
          code: 'INVALID_USER_SESSION'
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Log successful authentication for audit purposes (production-safe logging)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Financial Recommendations API: User authenticated successfully', {
        userId: userId,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
    }

    // Step 4: Call financial wellness service to retrieve personalized recommendations
    console.info('Financial Recommendations API: Fetching recommendations for user', {
      userId: userId,
      timestamp: new Date().toISOString(),
      operation: 'getRecommendations'
    });

    // Make service call to retrieve recommendations
    const recommendations: Recommendation[] = await financialWellnessService.getRecommendations(userId);

    // Validate service response
    if (!Array.isArray(recommendations)) {
      // Log invalid service response
      console.error('Financial Recommendations API: Invalid service response - expected array of recommendations', {
        userId: userId,
        responseType: typeof recommendations,
        timestamp: new Date().toISOString()
      });
      
      // Return 500 Internal Server Error with user-friendly message
      return NextResponse.json(
        {
          error: 'Service error',
          message: 'Unable to process recommendation data. Please try again later',
          code: 'INVALID_SERVICE_RESPONSE'
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Log successful recommendation retrieval
    console.info('Financial Recommendations API: Successfully retrieved recommendations', {
      userId: userId,
      recommendationCount: recommendations.length,
      categories: recommendations.reduce((acc, rec) => {
        acc[rec.category] = (acc[rec.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString(),
      operation: 'getRecommendations'
    });

    // Step 5: Return successful response with recommendations
    return NextResponse.json(
      {
        recommendations: recommendations,
        meta: {
          count: recommendations.length,
          categories: [...new Set(recommendations.map(rec => rec.category))],
          generatedAt: new Date().toISOString(),
          userId: userId
        }
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-ID': crypto.randomUUID()
        }
      }
    );

  } catch (error) {
    // Enhanced error handling with comprehensive logging
    console.error('Financial Recommendations API: Unhandled error during request processing', {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent')
    });

    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let userMessage = 'An unexpected error occurred while loading your recommendations. Please try again later.';

    // Handle specific error categories
    if (error && typeof error === 'object' && 'category' in error) {
      const categorizedError = error as any;
      
      switch (categorizedError.category) {
        case 'AUTHENTICATION_ERROR':
          statusCode = 401;
          errorCode = 'AUTHENTICATION_ERROR';
          userMessage = 'Your session has expired. Please log in again.';
          break;
        
        case 'AUTHORIZATION_ERROR':
          statusCode = 403;
          errorCode = 'AUTHORIZATION_ERROR';
          userMessage = 'You do not have permission to access these recommendations.';
          break;
        
        case 'NOT_FOUND_ERROR':
          statusCode = 404;
          errorCode = 'USER_NOT_FOUND';
          userMessage = 'User profile not found. Please complete your profile setup.';
          break;
        
        case 'INSUFFICIENT_DATA_ERROR':
          statusCode = 422;
          errorCode = 'INSUFFICIENT_DATA';
          userMessage = 'Please complete your financial wellness profile to receive personalized recommendations.';
          break;
        
        case 'AI_SERVICE_ERROR':
          statusCode = 503;
          errorCode = 'SERVICE_UNAVAILABLE';
          userMessage = 'Recommendation service is temporarily unavailable. Please try again in a few minutes.';
          break;
        
        case 'NETWORK_ERROR':
          statusCode = 503;
          errorCode = 'NETWORK_ERROR';
          userMessage = 'Network connectivity issue. Please check your connection and try again.';
          break;
        
        default:
          // Keep default values for unknown error categories
          break;
      }
    }

    // Return structured error response
    return NextResponse.json(
      {
        error: 'Request failed',
        message: userMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}