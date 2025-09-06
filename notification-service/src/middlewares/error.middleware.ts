// express@4.18+ - Web framework for Node.js applications
import { Request, Response, NextFunction } from 'express';

// Internal imports for custom error handling and logging
import { ApiError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Request interface extension to support correlation tracking
 * 
 * Extends the standard Express Request interface to include correlation ID
 * for distributed tracing across microservices. This is essential for
 * tracking requests across the financial services platform and meeting
 * audit requirements.
 */
interface ExtendedRequest extends Request {
    correlationId?: string;
    userId?: string;
    transactionId?: string;
    requestStartTime?: number;
}

/**
 * Standard Error Response Interface
 * 
 * Defines the structure of error responses sent to clients.
 * This standardized format ensures consistent error handling
 * across all microservices in the financial platform.
 */
interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code: string;
        statusCode: number;
        correlationId?: string;
        timestamp: string;
        path: string;
        method: string;
    };
    data: null;
}

/**
 * Security-sensitive fields that should be excluded from error logs
 * 
 * These fields contain sensitive information that should not be logged
 * for security and compliance reasons in financial services environments.
 */
const SENSITIVE_FIELDS = [
    'password',
    'token',
    'authorization',
    'cookie',
    'secret',
    'key',
    'credential',
    'ssn',
    'accountNumber',
    'routingNumber',
    'cardNumber',
    'cvv',
    'pin'
];

/**
 * Sanitizes request data by removing sensitive fields
 * 
 * @param data - The data object to sanitize
 * @returns Sanitized data object with sensitive fields removed
 */
function sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sanitized = { ...data };
    
    for (const field of SENSITIVE_FIELDS) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
}

/**
 * Determines if an error should be exposed to the client
 * 
 * @param error - The error to evaluate
 * @returns True if the error should be exposed, false otherwise
 */
function shouldExposeError(error: any): boolean {
    // Always expose custom ApiError instances
    if (error instanceof ApiError) {
        return true;
    }

    // Don't expose internal system errors in production
    const environment = process.env.NODE_ENV || 'development';
    return environment !== 'production';
}

/**
 * Gets a safe error message for client response
 * 
 * @param error - The error object
 * @param defaultMessage - Default message to use if error shouldn't be exposed
 * @returns Safe error message for client
 */
function getSafeErrorMessage(error: any, defaultMessage: string = 'Internal Server Error'): string {
    if (shouldExposeError(error)) {
        return error.message || defaultMessage;
    }
    return defaultMessage;
}

/**
 * Global Error Handling Middleware for Express Applications
 * 
 * This middleware serves as the central error handling mechanism for the notification service,
 * implementing enterprise-grade error handling patterns specifically designed for financial
 * services reliability requirements. It provides comprehensive error logging, audit trails,
 * and standardized error responses while maintaining security best practices.
 * 
 * Key Features:
 * - Handles both custom ApiError instances and generic JavaScript errors
 * - Implements structured logging with correlation IDs for distributed tracing
 * - Provides sanitized error responses that don't expose sensitive information
 * - Supports audit logging for compliance and regulatory requirements
 * - Measures and logs request processing time for performance monitoring
 * - Follows financial services security patterns for error information disclosure
 * - Generates consistent error response format across the platform
 * 
 * Error Handling Strategy:
 * 1. Custom ApiError instances: Extract status code and message, log as business errors
 * 2. Generic errors: Default to 500 status, log as system errors with full context
 * 3. Security: Sanitize request data and limit error information exposure
 * 4. Compliance: Generate audit trails with correlation IDs and user context
 * 5. Monitoring: Log performance metrics and error patterns for observability
 * 
 * Integration with Platform:
 * - Supports distributed tracing via correlation IDs
 * - Integrates with centralized logging infrastructure (ELK stack)
 * - Provides metrics for Prometheus monitoring
 * - Maintains audit trails for regulatory compliance
 * 
 * @param error - The error object caught by Express error handling
 * @param req - Express Request object with extended properties for correlation tracking
 * @param res - Express Response object for sending standardized error responses
 * @param next - Express NextFunction for passing control (not used in error middleware)
 */
export function errorMiddleware(
    error: any,
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
): void {
    // Extract correlation tracking information from request
    const correlationId = req.correlationId || req.headers['x-correlation-id'] as string || 
                         req.headers['x-request-id'] as string || 
                         `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const userId = req.userId || req.headers['x-user-id'] as string;
    const transactionId = req.transactionId || req.headers['x-transaction-id'] as string;
    const requestStartTime = req.requestStartTime || Date.now();
    const requestDuration = Date.now() - requestStartTime;
    
    // Determine error status code and type
    let statusCode: number;
    let errorCode: string;
    let isCustomError = false;

    if (error instanceof ApiError) {
        // Handle custom ApiError instances with specific status codes
        statusCode = error.statusCode;
        errorCode = error.constructor.name;
        isCustomError = true;
    } else {
        // Handle generic JavaScript errors with default 500 status
        statusCode = error.statusCode || error.status || 500;
        errorCode = error.name || 'InternalServerError';
        isCustomError = false;
    }

    // Sanitize request data for logging (remove sensitive information)
    const sanitizedBody = sanitizeData(req.body);
    const sanitizedQuery = sanitizeData(req.query);
    const sanitizedParams = sanitizeData(req.params);

    // Prepare comprehensive error context for logging
    const errorContext = {
        correlationId,
        userId,
        transactionId,
        requestId: req.headers['x-request-id'],
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        method: req.method,
        url: req.originalUrl || req.url,
        path: req.path,
        statusCode,
        errorCode,
        errorType: isCustomError ? 'business' : 'system',
        duration: requestDuration,
        timestamp: new Date().toISOString(),
        requestBody: sanitizedBody,
        requestQuery: sanitizedQuery,
        requestParams: sanitizedParams,
        headers: {
            'content-type': req.headers['content-type'],
            'accept': req.headers['accept'],
            'origin': req.headers['origin'],
            'referer': req.headers['referer']
        }
    };

    // Log error with appropriate level and context
    if (statusCode >= 500) {
        // System errors - log as errors with full context including stack trace
        logger.error(
            `System Error: ${error.message || 'Unknown error'} - ${req.method} ${req.originalUrl || req.url}`,
            {
                ...errorContext,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                environment: process.env.NODE_ENV,
                service: 'notification-service'
            }
        );

        // Log security event for potential system compromise
        if (statusCode === 500 && !isCustomError) {
            logger.security('unexpected_system_error', {
                severity: 'high',
                correlationId,
                userId,
                ipAddress: errorContext.ipAddress,
                userAgent: errorContext.userAgent,
                endpoint: `${req.method} ${req.originalUrl || req.url}`,
                errorMessage: error.message
            });
        }
    } else if (statusCode >= 400) {
        // Client errors - log as warnings with context
        logger.warn(
            `Client Error: ${error.message || 'Bad request'} - ${req.method} ${req.originalUrl || req.url}`,
            errorContext
        );

        // Log potential security events for suspicious client behavior
        if (statusCode === 401 || statusCode === 403) {
            logger.security('authentication_authorization_failure', {
                severity: 'medium',
                correlationId,
                userId,
                ipAddress: errorContext.ipAddress,
                userAgent: errorContext.userAgent,
                endpoint: `${req.method} ${req.originalUrl || req.url}`,
                statusCode
            });
        }
    } else {
        // Informational responses - log as info
        logger.info(
            `Request completed with status ${statusCode} - ${req.method} ${req.originalUrl || req.url}`,
            errorContext
        );
    }

    // Generate audit log for compliance and regulatory requirements
    logger.audit('error_response', {
        correlationId,
        userId,
        resource: req.originalUrl || req.url,
        action: `${req.method} request`,
        result: 'failure',
        statusCode,
        errorCode,
        ipAddress: errorContext.ipAddress,
        userAgent: errorContext.userAgent,
        duration: requestDuration,
        errorType: isCustomError ? 'business' : 'system'
    });

    // Log performance metrics for monitoring and optimization
    logger.performance('error_request_processing', requestDuration, {
        correlationId,
        method: req.method,
        path: req.path,
        statusCode,
        errorCode,
        isCustomError
    });

    // Prepare standardized error response for client
    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            message: getSafeErrorMessage(error, 'An error occurred while processing your request'),
            code: errorCode,
            statusCode,
            correlationId,
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.url,
            method: req.method
        },
        data: null
    };

    // Set security headers for error responses
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'X-Correlation-ID': correlationId
    });

    // Send standardized JSON error response to client
    res.status(statusCode).json(errorResponse);

    // Log business event for successful error handling
    logger.business('error_response_sent', {
        correlationId,
        userId,
        transactionId,
        statusCode,
        errorCode,
        duration: requestDuration,
        endpoint: `${req.method} ${req.originalUrl || req.url}`,
        status: 'error_handled'
    });
}

/**
 * Export the error middleware function for use in Express applications
 * 
 * This middleware should be registered as the last middleware in the Express
 * application stack to catch all unhandled errors. It provides comprehensive
 * error handling, logging, and response generation for the notification service.
 * 
 * Usage:
 * ```typescript
 * import express from 'express';
 * import { errorMiddleware } from './middlewares/error.middleware';
 * 
 * const app = express();
 * 
 * // Register other middlewares and routes...
 * 
 * // Register error middleware as the last middleware
 * app.use(errorMiddleware);
 * ```
 * 
 * The middleware integrates with:
 * - Distributed tracing systems via correlation IDs
 * - Centralized logging infrastructure (ELK stack)
 * - Monitoring systems (Prometheus/Grafana)
 * - Audit systems for compliance requirements
 * - Security monitoring for threat detection
 */
export default errorMiddleware;