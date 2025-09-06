import { Request, Response, NextFunction } from 'express'; // ^4.18+
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Error Response Interface for standardized API error responses
 * Ensures consistent error structure across the blockchain service
 */
interface ErrorResponse {
  success: false;
  error: {
    status: number;
    message: string;
    code?: string;
    timestamp: string;
    path: string;
    requestId?: string;
    details?: any;
  };
}

/**
 * Enhanced Request interface to include tracing information
 * Extends Express Request with additional metadata for financial services compliance
 */
interface EnhancedRequest extends Request {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  startTime?: number;
}

/**
 * Centralized error handling middleware for the blockchain service.
 * 
 * This middleware implements enterprise-grade error handling patterns designed
 * for financial services reliability requirements. It provides:
 * 
 * - Comprehensive error logging with audit trails
 * - Standardized error responses for API consistency
 * - Security-aware error messaging to prevent information disclosure
 * - Compliance-ready error categorization and retention
 * - Performance monitoring for error response times
 * - Integration with monitoring and alerting systems
 * 
 * The middleware handles both operational errors (expected business logic errors)
 * and non-operational errors (system failures requiring immediate attention).
 * 
 * @param error - The error object thrown by the application
 * @param req - Express request object with enhanced tracing information
 * @param res - Express response object for sending the error response
 * @param next - Express next function (unused in error middleware but required for signature)
 */
export const errorMiddleware = (
  error: Error | ApiError,
  req: EnhancedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Calculate request processing time for performance monitoring
  const processingTime = req.startTime ? Date.now() - req.startTime : null;
  
  // Extract error properties with safe defaults
  let statusCode: number = 500;
  let message: string = 'Internal Server Error';
  let isOperational: boolean = false;
  let errorCode: string | undefined;

  // Check if the error is an instance of our custom ApiError class
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
    errorCode = error.constructor.name;
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors
    message = error.message || 'An unexpected error occurred';
    errorCode = error.name || 'UnknownError';
  }

  // For production, sanitize error messages to prevent information disclosure
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'Internal Server Error';
  }

  // Generate unique request identifier if not present
  const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Prepare comprehensive error metadata for logging
  const errorMetadata = {
    // Request context
    requestId,
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    
    // User context (if available)
    userId: req.userId,
    sessionId: req.sessionId,
    traceId: req.traceId,
    
    // Error details
    errorName: error.name,
    errorCode,
    statusCode,
    isOperational,
    stack: error.stack,
    
    // Performance metrics
    processingTime,
    timestamp: new Date().toISOString(),
    
    // Request headers (filtered for security)
    headers: {
      'content-type': req.get('Content-Type'),
      'accept': req.get('Accept'),
      'origin': req.get('Origin'),
      'referer': req.get('Referer'),
    },
    
    // Request body (if present and safe to log)
    body: req.body && typeof req.body === 'object' ? 
      Object.keys(req.body).length > 0 ? '[REQUEST_BODY_PRESENT]' : null : null,
    
    // Query parameters
    query: Object.keys(req.query).length > 0 ? req.query : null,
    
    // Route parameters
    params: Object.keys(req.params).length > 0 ? req.params : null
  };

  // Log error based on severity and operational status
  if (isOperational) {
    // Operational errors are expected and logged as warnings
    logger.warn(`Operational error occurred: ${message}`, {
      event_category: 'operational_error',
      event_type: 'business_logic_error',
      event_outcome: 'failure',
      ...errorMetadata
    });
  } else {
    // Non-operational errors are system failures requiring immediate attention
    logger.error(`System error occurred: ${message}`, {
      event_category: 'system_error',
      event_type: 'application_error',
      event_outcome: 'failure',
      severity: statusCode >= 500 ? 'high' : 'medium',
      ...errorMetadata
    });
    
    // Log critical errors to audit trail for compliance
    if (statusCode >= 500) {
      logger.audit('Critical system error detected', {
        event_type: 'system_failure',
        event_action: 'error_middleware_triggered',
        event_outcome: 'failure',
        userId: req.userId || 'anonymous',
        sessionId: req.sessionId,
        requestId,
        complianceFramework: ['SOX', 'Basel_III', 'PCI_DSS'],
        dataClassification: 'internal',
        errorDetails: {
          name: error.name,
          message: error.message,
          statusCode,
          path: req.path
        }
      });
    }
  }

  // Log performance metrics for monitoring
  if (processingTime !== null) {
    logger.performance('Error response performance', {
      operation: 'error_handling',
      duration: processingTime,
      requestId,
      endpoint: req.path,
      statusCode,
      method: req.method
    });
  }

  // Prepare standardized error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      status: statusCode,
      message,
      code: errorCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId,
      // Include additional details only in development or for operational errors
      ...(process.env.NODE_ENV === 'development' || isOperational ? {
        details: {
          method: req.method,
          url: req.originalUrl,
          ...(process.env.NODE_ENV === 'development' && error.stack ? { stack: error.stack } : {})
        }
      } : {})
    }
  };

  // Set appropriate response headers for API consistency
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-ID', requestId);
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Set cache control for error responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Send the standardized JSON error response
  res.status(statusCode).json(errorResponse);

  // Log the final response for audit trail
  logger.info('Error response sent to client', {
    event_category: 'api_response',
    event_type: 'error_response',
    event_outcome: 'success',
    statusCode,
    requestId,
    path: req.path,
    method: req.method,
    processingTime,
    userId: req.userId || 'anonymous',
    responseSize: JSON.stringify(errorResponse).length
  });
};