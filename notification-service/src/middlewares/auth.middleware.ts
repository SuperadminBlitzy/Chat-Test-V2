// express@4.18+ - Express.js framework for building web applications and APIs
import { Request, Response, NextFunction } from 'express';

// jsonwebtoken@9.0.2 - Library for JSON Web Token implementation
import { verify, JwtPayload } from 'jsonwebtoken';

// Import configuration for JWT secret - assuming it's available in the default export
import config from '../config';

// Import custom error class for unauthorized access
// Note: Creating UnauthorizedError as it's not exported from errors.ts but required by spec
import { ApiError } from '../utils/errors';

// Import logger for security monitoring and audit trails
import logger from '../utils/logger';

/**
 * Custom UnauthorizedError class for authentication failures
 * 
 * This error class handles authentication-specific failures in the notification service,
 * including invalid tokens, expired tokens, and missing authentication credentials.
 * Extends the base ApiError class to provide consistent error handling with proper
 * HTTP status codes for API responses in the financial services platform.
 */
class UnauthorizedError extends ApiError {
    /**
     * Initializes a new instance of the UnauthorizedError class.
     * 
     * @param message - Optional custom error message. Defaults to 'Unauthorized'
     */
    constructor(message: string = 'Unauthorized') {
        // Call the parent ApiError constructor with a 401 status code and the provided message
        super(401, message);
    }
}

/**
 * Extended Request interface to include user information
 * 
 * This interface extends the Express Request object to include user information
 * extracted from the JWT token. This provides type safety and ensures consistent
 * user data structure throughout the notification service.
 */
interface AuthenticatedRequest extends Request {
    /**
     * User information extracted from the validated JWT token
     * Contains user ID, roles, permissions, and other relevant authentication data
     */
    user?: {
        /** Unique identifier for the authenticated user */
        userId: string;
        /** User's email address */
        email: string;
        /** User's assigned roles for authorization purposes */
        roles: string[];
        /** Specific permissions granted to the user */
        permissions: string[];
        /** Timestamp when the token was issued */
        iat: number;
        /** Timestamp when the token expires */
        exp: number;
        /** Token issuer identifier */
        iss?: string;
        /** Intended audience for the token */
        aud?: string;
        /** Additional custom claims */
        [key: string]: any;
    };
}

/**
 * Authentication middleware function for securing Notification Service endpoints
 * 
 * This middleware implements the zero-trust security principle by validating JSON Web Tokens
 * from incoming requests to ensure that only authenticated and authorized users can access
 * protected routes. It supports the OAuth2 and RBAC security model of the platform and
 * contributes to SOC2, PCI DSS, and GDPR compliance requirements.
 * 
 * The middleware performs the following operations:
 * 1. Extracts the Authorization header from incoming requests
 * 2. Validates the Bearer token format
 * 3. Verifies the JWT signature using the configured secret
 * 4. Decodes and validates the token payload
 * 5. Attaches user information to the request object
 * 6. Logs authentication events for security monitoring
 * 7. Handles authentication failures with appropriate error responses
 * 
 * Security Features:
 * - JWT signature verification for token integrity
 * - Token expiration validation
 * - Comprehensive audit logging for compliance
 * - Protection against common authentication attacks
 * - Integration with centralized authentication framework
 * 
 * Performance Characteristics:
 * - Optimized for high-concurrency financial services
 * - Minimal latency impact on request processing
 * - Efficient token validation without external calls
 * - Cached secret loading for optimal performance
 * 
 * @param req - Express request object containing the HTTP request data
 * @param res - Express response object for sending HTTP responses
 * @param next - Express next function to pass control to the next middleware
 * 
 * @throws {UnauthorizedError} When authentication fails due to invalid, missing, or expired tokens
 * 
 * @returns {void} Calls the next middleware in the stack or sends an HTTP error response
 */
export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract the Authorization header from the incoming request
        const authorizationHeader = req.headers.authorization;
        
        // Log the authentication attempt for security monitoring
        logger.security('authentication_attempt', {
            severity: 'low',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        // Check if the Authorization header exists and starts with 'Bearer '
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            // Log the missing or malformed authorization header
            logger.security('authentication_failed', {
                severity: 'medium',
                reason: 'missing_or_malformed_authorization_header',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            // Throw UnauthorizedError for missing or malformed header
            throw new UnauthorizedError('Authorization header must be provided in format: Bearer <token>');
        }

        // Extract the token string from the Authorization header
        // Remove 'Bearer ' prefix (7 characters) to get the actual token
        const token = authorizationHeader.substring(7);

        // Validate that the token is not empty after extraction
        if (!token || token.trim().length === 0) {
            // Log the empty token attempt
            logger.security('authentication_failed', {
                severity: 'medium',
                reason: 'empty_token',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            throw new UnauthorizedError('JWT token cannot be empty');
        }

        // Get JWT secret from configuration
        // Note: Assuming jwtSecret is available in config or environment variables
        const jwtSecret = process.env.JWT_SECRET || config.jwtSecret || 'default-secret-for-development';

        // Validate that JWT secret is configured
        if (!jwtSecret || jwtSecret === 'default-secret-for-development') {
            // Log configuration error (this should not happen in production)
            logger.error('JWT secret not properly configured', {
                environment: process.env.NODE_ENV,
                configSource: process.env.JWT_SECRET ? 'environment' : 'config',
                timestamp: new Date().toISOString()
            });

            // In production, this should cause an immediate failure
            if (process.env.NODE_ENV === 'production') {
                throw new Error('JWT secret not configured for production environment');
            }
        }

        // Use the jsonwebtoken library's verify function to validate the token
        // This verifies the signature, expiration, and other standard JWT claims
        const decoded = verify(token, jwtSecret, {
            // Additional verification options for enhanced security
            algorithms: ['HS256', 'HS384', 'HS512'], // Allowed signing algorithms
            issuer: process.env.JWT_ISSUER, // Expected token issuer (optional)
            audience: process.env.JWT_AUDIENCE, // Expected token audience (optional)
            clockTolerance: 30, // Allow 30 seconds clock skew
            ignoreExpiration: false, // Strictly enforce token expiration
            ignoreNotBefore: false, // Enforce the 'not before' claim
        }) as JwtPayload;

        // Validate that the decoded payload contains required user information
        if (!decoded || typeof decoded !== 'object') {
            logger.security('authentication_failed', {
                severity: 'high',
                reason: 'invalid_token_payload',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            throw new UnauthorizedError('Invalid token payload structure');
        }

        // Extract and validate required user information from the token payload
        const userId = decoded.userId || decoded.sub || decoded.id;
        const email = decoded.email;
        const roles = decoded.roles || [];
        const permissions = decoded.permissions || [];

        // Ensure critical user information is present
        if (!userId) {
            logger.security('authentication_failed', {
                severity: 'high',
                reason: 'missing_user_id_in_token',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            throw new UnauthorizedError('Token must contain valid user identification');
        }

        // Attach the decoded user information to the request object
        // This makes the user data available to subsequent middleware and route handlers
        req.user = {
            userId: userId.toString(),
            email: email || '',
            roles: Array.isArray(roles) ? roles : [],
            permissions: Array.isArray(permissions) ? permissions : [],
            iat: decoded.iat || Math.floor(Date.now() / 1000),
            exp: decoded.exp || Math.floor(Date.now() / 1000) + 3600,
            iss: decoded.iss,
            aud: decoded.aud,
            // Include any additional custom claims from the token
            ...Object.keys(decoded)
                .filter(key => !['userId', 'sub', 'id', 'email', 'roles', 'permissions', 'iat', 'exp', 'iss', 'aud'].includes(key))
                .reduce((acc, key) => ({ ...acc, [key]: decoded[key] }), {})
        };

        // Log successful authentication for audit trail and security monitoring
        logger.audit('user_authenticated', {
            userId: req.user.userId,
            email: req.user.email,
            roles: req.user.roles,
            result: 'success',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            tokenExpiry: new Date(req.user.exp * 1000).toISOString(),
            timestamp: new Date().toISOString()
        });

        // Log successful authentication for business monitoring
        logger.business('user_session_validated', {
            userId: req.user.userId,
            sessionDuration: req.user.exp - req.user.iat,
            accessLevel: req.user.roles.join(','),
            timestamp: new Date().toISOString()
        });

        // Call the next middleware function to continue processing the request
        next();

    } catch (error) {
        // Handle JWT verification errors and other authentication failures
        let errorMessage = 'Authentication failed';
        let errorDetails: Record<string, any> = {
            severity: 'medium',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        };

        // Determine the specific type of authentication error
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'JWT token has expired';
            errorDetails.reason = 'token_expired';
            errorDetails.expiredAt = error.expiredAt;
            errorDetails.severity = 'low'; // Common occurrence, lower severity
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid JWT token signature or format';
            errorDetails.reason = 'invalid_token_signature';
            errorDetails.severity = 'high'; // Potential security threat
        } else if (error.name === 'NotBeforeError') {
            errorMessage = 'JWT token is not active yet';
            errorDetails.reason = 'token_not_before';
            errorDetails.notBefore = error.date;
            errorDetails.severity = 'medium';
        } else if (error instanceof UnauthorizedError) {
            errorMessage = error.message;
            errorDetails.reason = 'authorization_header_issue';
        } else {
            // Unknown error type, log additional details for debugging
            errorMessage = 'Unknown authentication error occurred';
            errorDetails.reason = 'unknown_error';
            errorDetails.errorName = error.name;
            errorDetails.errorMessage = error.message;
            errorDetails.severity = 'high';
        }

        // Log the authentication failure for security monitoring
        logger.security('authentication_failed', errorDetails);

        // Log warning for operational monitoring
        logger.warn(`Authentication middleware error: ${errorMessage}`, {
            error: error.message,
            path: req.path,
            method: req.method,
            ipAddress: req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString()
        });

        // Create and throw UnauthorizedError with appropriate message
        // This will be caught by the error handling middleware
        const unauthorizedError = new UnauthorizedError(errorMessage);
        
        // Pass the error to the Express error handling middleware
        next(unauthorizedError);
    }
};

// Export the middleware as default export for flexible import patterns
export default authMiddleware;

// Additional type exports for use in other parts of the application
export type { AuthenticatedRequest };
export { UnauthorizedError };