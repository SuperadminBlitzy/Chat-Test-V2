/**
 * Authentication Middleware for Blockchain Service
 * 
 * This middleware implements JWT-based authentication for the blockchain service
 * as part of the Unified Financial Services Platform. It provides secure token
 * validation following OAuth2 and RBAC security models, ensuring all API requests
 * are properly authenticated before accessing blockchain operations.
 * 
 * Key Features:
 * - JWT token extraction and validation from Authorization header
 * - Bearer token format validation
 * - Comprehensive error handling with standardized HTTP exceptions
 * - User payload attachment to request object for downstream middleware
 * - Production-ready security implementation for financial services
 * 
 * Security Compliance:
 * - Follows financial industry security standards
 * - Implements proper token validation patterns
 * - Provides detailed audit logging capabilities
 * - Supports enterprise authentication workflows
 */

import { Request, Response, NextFunction } from 'express'; // express@4.18.2
import { verify, JwtPayload } from 'jsonwebtoken'; // jsonwebtoken@9.0.2
import { UnauthorizedError } from '../utils/errors';

/**
 * Extended Request interface that includes authenticated user information.
 * 
 * This interface extends the standard Express Request to include user data
 * extracted from the validated JWT token. This allows downstream middleware
 * and route handlers to access authenticated user information safely.
 * 
 * @interface RequestWithUser
 * @extends Request
 */
export interface RequestWithUser extends Request {
  /**
   * User information extracted from the validated JWT token.
   * Contains the decoded JWT payload with user identification,
   * roles, permissions, and other relevant authentication data.
   */
  user: JwtPayload;
}

/**
 * Authentication middleware for Express.js applications.
 * 
 * This middleware function validates JWT tokens provided in the Authorization
 * header of incoming requests. It follows the OAuth2 Bearer token specification
 * and implements comprehensive security validation suitable for financial services.
 * 
 * The middleware performs the following operations:
 * 1. Extracts the Authorization header from the incoming request
 * 2. Validates the header format (must start with 'Bearer ')
 * 3. Extracts the JWT token from the header
 * 4. Retrieves the JWT public key from environment configuration
 * 5. Verifies the token signature and validity using jsonwebtoken
 * 6. Handles various token validation errors (expired, invalid, malformed)
 * 7. Attaches the decoded user payload to the request object
 * 8. Passes control to the next middleware in the chain
 * 
 * Error Handling:
 * - Returns 401 Unauthorized for missing or invalid Authorization header
 * - Returns 401 Unauthorized for malformed Bearer token format
 * - Returns 401 Unauthorized for missing or invalid JWT token
 * - Returns 401 Unauthorized for expired or tampered tokens
 * - Returns 500 Internal Server Error for configuration issues
 * 
 * Environment Variables Required:
 * - JWT_PUBLIC_KEY: The public key used for JWT signature verification
 * 
 * @param req - Express request object, will be extended with user information
 * @param res - Express response object for sending error responses
 * @param next - Express next function to pass control to subsequent middleware
 * 
 * @throws {UnauthorizedError} When authentication fails due to invalid credentials
 * @throws {Error} When system configuration errors occur
 * 
 * @example
 * ```typescript
 * // Usage in Express router
 * import express from 'express';
 * import { authMiddleware } from './middlewares/auth.middleware';
 * 
 * const router = express.Router();
 * 
 * // Apply authentication to all routes
 * router.use(authMiddleware);
 * 
 * // Protected route - user information available in req.user
 * router.get('/blockchain/balance', (req: RequestWithUser, res) => {
 *   const userId = req.user.sub; // User ID from JWT payload
 *   const userRoles = req.user.roles; // User roles for authorization
 *   // ... blockchain balance logic
 * });
 * ```
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Step 1: Extract the Authorization header from the request
    const authorizationHeader = req.headers.authorization;
    
    // Step 2: Check if the Authorization header exists
    if (!authorizationHeader) {
      throw new UnauthorizedError(
        'Authorization header is missing. Please provide a valid Bearer token.'
      );
    }
    
    // Step 3: Validate that the header starts with 'Bearer '
    if (!authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'Invalid Authorization header format. Expected format: "Bearer <token>".'
      );
    }
    
    // Step 4: Extract the JWT token from the Authorization header
    const token = authorizationHeader.slice(7); // Remove 'Bearer ' prefix
    
    // Validate that a token was actually provided after 'Bearer '
    if (!token || token.trim() === '') {
      throw new UnauthorizedError(
        'JWT token is missing from Authorization header.'
      );
    }
    
    // Step 5: Retrieve the JWT public key from environment variables
    const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
    
    // Validate that the JWT public key is configured
    if (!jwtPublicKey) {
      // This is a system configuration error, not a client error
      console.error('JWT_PUBLIC_KEY environment variable is not configured');
      throw new Error(
        'Authentication service is not properly configured. Please contact system administrator.'
      );
    }
    
    // Step 6: Verify the JWT token using the public key
    let decodedPayload: JwtPayload;
    
    try {
      // Use jsonwebtoken.verify to validate the token signature and claims
      const decoded = verify(token, jwtPublicKey, {
        // Additional verification options for enhanced security
        algorithms: ['RS256', 'RS384', 'RS512'], // Only allow RSA algorithms
        clockTolerance: 30, // Allow 30 seconds of clock skew
        ignoreExpiration: false, // Enforce token expiration
        ignoreNotBefore: false, // Enforce 'not before' claim
      });
      
      // Ensure the decoded result is a JwtPayload object (not string)
      if (typeof decoded === 'string') {
        throw new UnauthorizedError(
          'Invalid JWT token format. Token must contain a valid JSON payload.'
        );
      }
      
      decodedPayload = decoded;
      
    } catch (jwtError: any) {
      // Handle specific JWT verification errors with descriptive messages
      let errorMessage = 'JWT token validation failed.';
      
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'JWT token has expired. Please obtain a new token.';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'JWT token is invalid or malformed.';
      } else if (jwtError.name === 'NotBeforeError') {
        errorMessage = 'JWT token is not yet valid. Check the token\'s "not before" claim.';
      } else if (jwtError.name === 'SignatureVerificationError') {
        errorMessage = 'JWT token signature verification failed.';
      }
      
      // Log the specific error for security monitoring and debugging
      console.warn('JWT authentication failed:', {
        error: jwtError.name,
        message: jwtError.message,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      throw new UnauthorizedError(errorMessage);
    }
    
    // Step 7: Validate essential JWT claims for financial services security
    if (!decodedPayload.sub) {
      throw new UnauthorizedError(
        'JWT token is missing required "sub" (subject) claim.'
      );
    }
    
    if (!decodedPayload.iss) {
      throw new UnauthorizedError(
        'JWT token is missing required "iss" (issuer) claim.'
      );
    }
    
    // Validate that the token issuer is trusted (additional security layer)
    const trustedIssuers = process.env.JWT_TRUSTED_ISSUERS?.split(',') || [];
    if (trustedIssuers.length > 0 && !trustedIssuers.includes(decodedPayload.iss)) {
      throw new UnauthorizedError(
        'JWT token issuer is not trusted by this service.'
      );
    }
    
    // Step 8: Attach the decoded user payload to the request object
    // This allows downstream middleware and route handlers to access user information
    (req as RequestWithUser).user = decodedPayload;
    
    // Log successful authentication for audit purposes
    console.info('User authenticated successfully:', {
      userId: decodedPayload.sub,
      issuer: decodedPayload.iss,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    
    // Step 9: Call next() to pass control to the next middleware in the chain
    next();
    
  } catch (error) {
    // Handle any unexpected errors that occur during authentication
    if (error instanceof UnauthorizedError) {
      // Re-throw UnauthorizedError as-is for proper error handling
      next(error);
    } else {
      // Log unexpected errors for system monitoring
      console.error('Unexpected error in authentication middleware:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        path: req.path,
      });
      
      // Return a generic error to avoid exposing internal system details
      next(new UnauthorizedError(
        'Authentication service encountered an unexpected error.'
      ));
    }
  }
};

/**
 * Type guard function to check if a request object has been extended with user information.
 * 
 * This utility function helps TypeScript understand when a Request object has been
 * processed by the authentication middleware and contains user information.
 * 
 * @param req - Express request object to check
 * @returns True if the request contains authenticated user information
 * 
 * @example
 * ```typescript
 * function handleProtectedRoute(req: Request, res: Response) {
 *   if (isAuthenticatedRequest(req)) {
 *     // TypeScript now knows req.user is available
 *     const userId = req.user.sub;
 *     console.log(`Authenticated user: ${userId}`);
 *   }
 * }
 * ```
 */
export const isAuthenticatedRequest = (req: Request): req is RequestWithUser => {
  return 'user' in req && req.user !== undefined;
};

/**
 * Utility function to extract user roles from JWT payload for authorization checks.
 * 
 * This helper function safely extracts user roles from the JWT payload,
 * supporting both string arrays and comma-separated string formats.
 * 
 * @param user - JWT payload containing user information
 * @returns Array of user roles, empty array if no roles found
 * 
 * @example
 * ```typescript
 * router.get('/admin/dashboard', authMiddleware, (req: RequestWithUser, res) => {
 *   const userRoles = extractUserRoles(req.user);
 *   
 *   if (!userRoles.includes('admin')) {
 *     return res.status(403).json({ error: 'Insufficient privileges' });
 *   }
 *   
 *   // Admin dashboard logic...
 * });
 * ```
 */
export const extractUserRoles = (user: JwtPayload): string[] => {
  if (!user.roles) {
    return [];
  }
  
  // Handle roles as string array
  if (Array.isArray(user.roles)) {
    return user.roles.filter((role: any) => typeof role === 'string');
  }
  
  // Handle roles as comma-separated string
  if (typeof user.roles === 'string') {
    return user.roles.split(',').map(role => role.trim()).filter(role => role.length > 0);
  }
  
  return [];
};

/**
 * Utility function to check if an authenticated user has specific permissions.
 * 
 * This helper function validates user permissions against required permissions
 * for fine-grained access control in financial services applications.
 * 
 * @param user - JWT payload containing user information
 * @param requiredPermissions - Array of permissions required for access
 * @returns True if user has all required permissions
 * 
 * @example
 * ```typescript
 * router.post('/blockchain/transfer', authMiddleware, (req: RequestWithUser, res) => {
 *   if (!hasRequiredPermissions(req.user, ['blockchain:transfer', 'funds:send'])) {
 *     return res.status(403).json({ error: 'Insufficient permissions' });
 *   }
 *   
 *   // Transfer logic...
 * });
 * ```
 */
export const hasRequiredPermissions = (
  user: JwtPayload,
  requiredPermissions: string[]
): boolean => {
  if (!user.permissions || requiredPermissions.length === 0) {
    return false;
  }
  
  let userPermissions: string[] = [];
  
  // Handle permissions as string array
  if (Array.isArray(user.permissions)) {
    userPermissions = user.permissions.filter((perm: any) => typeof perm === 'string');
  }
  // Handle permissions as comma-separated string
  else if (typeof user.permissions === 'string') {
    userPermissions = user.permissions.split(',').map(perm => perm.trim());
  }
  
  // Check if user has all required permissions
  return requiredPermissions.every(requiredPerm => userPermissions.includes(requiredPerm));
};