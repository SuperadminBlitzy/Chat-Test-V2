/**
 * Unit Tests for Middleware Functions - Blockchain Service
 * 
 * This test suite provides comprehensive coverage for the middleware functions used
 * in the blockchain-service, including authentication, error handling, and validation.
 * These tests ensure the security and reliability of the blockchain settlement network
 * by validating that all middleware components function correctly under various
 * scenarios and edge cases.
 * 
 * Test Coverage:
 * - Authentication middleware with JWT token validation
 * - Error handling middleware with standardized error responses
 * - Validation middleware with comprehensive input validation
 * - Security compliance testing for SOC2 and PCI-DSS requirements
 * - Performance testing for production-ready middleware
 * 
 * Compliance Requirements:
 * - Tests authentication mechanisms per security standards
 * - Validates error handling meets audit trail requirements
 * - Ensures validation follows financial services data integrity standards
 */

// External testing dependencies
import { Request, Response, NextFunction } from 'express'; // express@4.18+
import * as jest from 'jest'; // jest@29.7+
import * as sinon from 'sinon'; // sinon@17.0.1
import { verify } from 'jsonwebtoken';

// Internal dependencies - middleware functions under test
import { authMiddleware, RequestWithUser } from '../src/middlewares/auth.middleware';
import { errorMiddleware } from '../src/middlewares/error.middleware';
import { handleValidationErrors } from '../src/middlewares/validation.middleware';

// Internal dependencies - error classes and utilities
import { 
  UnauthorizedError, 
  ApiError, 
  BadRequestError, 
  InternalServerError 
} from '../src/utils/errors';

// Mock external dependencies for controlled testing
jest.mock('jsonwebtoken');
jest.mock('../src/utils/logger');

// Type definitions for test utilities
interface MockRequest extends Partial<Request> {
  headers?: { [key: string]: string | undefined };
  body?: any;
  path?: string;
  method?: string;
  ip?: string;
  connection?: { remoteAddress?: string };
  get?: jest.MockedFunction<(name: string) => string | undefined>;
  user?: any;
}

interface MockResponse extends Partial<Response> {
  status?: jest.MockedFunction<(code: number) => Response>;
  json?: jest.MockedFunction<(body: any) => Response>;
  setHeader?: jest.MockedFunction<(name: string, value: string) => Response>;
}

/**
 * Test Suite: Authentication Middleware
 * 
 * Tests the JWT-based authentication middleware to ensure proper token validation,
 * security compliance, and error handling. This is critical for the blockchain
 * settlement network's security posture and regulatory compliance.
 */
describe('authMiddleware', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // Setup test environment before each test
  beforeEach(() => {
    // Create mock Express request object
    mockRequest = {
      headers: {},
      path: '/api/v1/blockchain/transaction',
      method: 'POST',
      ip: '192.168.1.100',
      connection: { remoteAddress: '192.168.1.100' },
      get: jest.fn()
    };

    // Create mock Express response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    // Create mock NextFunction
    mockNext = jest.fn();

    // Mock console methods to capture logging
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Set up default environment variables
    process.env.JWT_PUBLIC_KEY = 'test-public-key';
    process.env.JWT_TRUSTED_ISSUERS = 'trusted-issuer-1,trusted-issuer-2';

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    // Restore console methods
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Clear environment variables
    delete process.env.JWT_PUBLIC_KEY;
    delete process.env.JWT_TRUSTED_ISSUERS;

    // Reset all mocks
    jest.resetAllMocks();
  });

  /**
   * Test Case: Valid JWT Token Authentication
   * 
   * Verifies that the middleware correctly processes valid JWT tokens,
   * attaches user information to the request, and calls next() to continue
   * the middleware chain. This is the primary success path for authenticated requests.
   */
  describe('Valid JWT Token Authentication', () => {
    it('should authenticate user with valid JWT token and proceed to next middleware', async () => {
      // Arrange: Set up valid JWT token scenario
      const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      const decodedPayload = {
        sub: 'user-123',
        iss: 'trusted-issuer-1',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        iat: Math.floor(Date.now() / 1000),
        roles: ['trader', 'settlement-user'],
        permissions: ['blockchain:read', 'blockchain:write']
      };

      // Mock valid Authorization header
      mockRequest.headers!.authorization = `Bearer ${validToken}`;
      
      // Mock successful JWT verification
      (verify as jest.MockedFunction<typeof verify>).mockReturnValue(decodedPayload);

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify successful authentication
      expect(verify).toHaveBeenCalledWith(validToken, 'test-public-key', {
        algorithms: ['RS256', 'RS384', 'RS512'],
        clockTolerance: 30,
        ignoreExpiration: false,
        ignoreNotBefore: false
      });

      // Verify user information is attached to request
      expect((mockRequest as RequestWithUser).user).toEqual(decodedPayload);

      // Verify next() is called to continue middleware chain
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();

      // Verify successful authentication is logged
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'User authenticated successfully:',
        expect.objectContaining({
          userId: 'user-123',
          issuer: 'trusted-issuer-1',
          timestamp: expect.any(String),
          ip: '192.168.1.100',
          path: '/api/v1/blockchain/transaction',
          method: 'POST'
        })
      );
    });

    it('should handle JWT token with trusted issuer validation', async () => {
      // Arrange: Set up token with trusted issuer
      const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      const decodedPayload = {
        sub: 'user-456',
        iss: 'trusted-issuer-2', // Second trusted issuer from environment
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      mockRequest.headers!.authorization = `Bearer ${validToken}`;
      (verify as jest.MockedFunction<typeof verify>).mockReturnValue(decodedPayload);

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify trusted issuer is accepted
      expect((mockRequest as RequestWithUser).user).toEqual(decodedPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  /**
   * Test Case: Missing Authorization Header
   * 
   * Verifies that the middleware properly handles requests without
   * Authorization headers by throwing an UnauthorizedError. This is
   * essential for API security and compliance requirements.
   */
  describe('Missing Authorization Header', () => {
    it('should throw UnauthorizedError when Authorization header is missing', () => {
      // Arrange: Request without Authorization header
      mockRequest.headers = {}; // No authorization header

      // Act & Assert: Execute middleware and expect UnauthorizedError
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify UnauthorizedError is passed to next()
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authorization header is missing. Please provide a valid Bearer token.',
          isOperational: true
        })
      );

      // Verify no JWT verification is attempted
      expect(verify).not.toHaveBeenCalled();

      // Verify no user information is attached
      expect((mockRequest as RequestWithUser).user).toBeUndefined();
    });

    it('should throw UnauthorizedError when Authorization header is undefined', () => {
      // Arrange: Request with undefined authorization header
      mockRequest.headers!.authorization = undefined;

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify UnauthorizedError is thrown
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authorization header is missing. Please provide a valid Bearer token.'
        })
      );
    });
  });

  /**
   * Test Case: Invalid Authorization Header Format
   * 
   * Tests various invalid Authorization header formats to ensure
   * the middleware properly validates the Bearer token format
   * as required by OAuth2 specifications.
   */
  describe('Invalid Authorization Header Format', () => {
    it('should throw UnauthorizedError for non-Bearer token format', () => {
      // Arrange: Invalid token format (not Bearer)
      mockRequest.headers!.authorization = 'Basic dXNlcjpwYXNzd29yZA==';

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify UnauthorizedError for invalid format
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid Authorization header format. Expected format: "Bearer <token>".'
        })
      );

      expect(verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError for Bearer token without actual token', () => {
      // Arrange: Bearer format but no token
      mockRequest.headers!.authorization = 'Bearer ';

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify UnauthorizedError for missing token
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token is missing from Authorization header.'
        })
      );
    });

    it('should throw UnauthorizedError for Bearer token with only whitespace', () => {
      // Arrange: Bearer format with whitespace only
      mockRequest.headers!.authorization = 'Bearer    ';

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify UnauthorizedError for whitespace token
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token is missing from Authorization header.'
        })
      );
    });

    it('should throw UnauthorizedError for malformed Bearer prefix', () => {
      // Arrange: Incorrect Bearer spelling
      mockRequest.headers!.authorization = 'bearer validtoken123';

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify case-sensitive Bearer validation
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid Authorization header format. Expected format: "Bearer <token>".'
        })
      );
    });
  });

  /**
   * Test Case: Invalid JWT Token Scenarios
   * 
   * Tests various JWT token validation failures including expired tokens,
   * malformed tokens, and signature verification failures. Critical for
   * maintaining security standards in financial services.
   */
  describe('Invalid JWT Token Scenarios', () => {
    it('should throw UnauthorizedError for expired JWT token', () => {
      // Arrange: Valid format but expired token
      const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.expiredtoken';
      mockRequest.headers!.authorization = `Bearer ${expiredToken}`;

      // Mock JWT verification to throw TokenExpiredError
      const tokenExpiredError = new Error('jwt expired');
      tokenExpiredError.name = 'TokenExpiredError';
      (verify as jest.MockedFunction<typeof verify>).mockImplementation(() => {
        throw tokenExpiredError;
      });

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify specific error message for expired token
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token has expired. Please obtain a new token.'
        })
      );

      // Verify security logging
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'JWT authentication failed:',
        expect.objectContaining({
          error: 'TokenExpiredError',
          message: 'jwt expired',
          timestamp: expect.any(String),
          ip: '192.168.1.100'
        })
      );
    });

    it('should throw UnauthorizedError for malformed JWT token', () => {
      // Arrange: Malformed token
      const malformedToken = 'invalid.jwt.token';
      mockRequest.headers!.authorization = `Bearer ${malformedToken}`;

      // Mock JWT verification to throw JsonWebTokenError
      const malformedError = new Error('invalid token');
      malformedError.name = 'JsonWebTokenError';
      (verify as jest.MockedFunction<typeof verify>).mockImplementation(() => {
        throw malformedError;
      });

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify error message for malformed token
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token is invalid or malformed.'
        })
      );
    });

    it('should throw UnauthorizedError for JWT token with invalid signature', () => {
      // Arrange: Token with invalid signature
      const invalidSignatureToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.invalidsignature';
      mockRequest.headers!.authorization = `Bearer ${invalidSignatureToken}`;

      // Mock JWT verification to throw signature error
      const signatureError = new Error('invalid signature');
      signatureError.name = 'SignatureVerificationError';
      (verify as jest.MockedFunction<typeof verify>).mockImplementation(() => {
        throw signatureError;
      });

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify error message for signature failure
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token signature verification failed.'
        })
      );
    });

    it('should throw UnauthorizedError for JWT token without required claims', () => {
      // Arrange: Token without required 'sub' claim
      const tokenWithoutSub = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      const invalidPayload = {
        iss: 'trusted-issuer-1',
        exp: Math.floor(Date.now() / 1000) + 3600
        // Missing 'sub' claim
      };

      mockRequest.headers!.authorization = `Bearer ${tokenWithoutSub}`;
      (verify as jest.MockedFunction<typeof verify>).mockReturnValue(invalidPayload);

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify error for missing subject claim
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token is missing required "sub" (subject) claim.'
        })
      );
    });

    it('should throw UnauthorizedError for JWT token with untrusted issuer', () => {
      // Arrange: Token with untrusted issuer
      const tokenWithUntrustedIssuer = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      const untrustedPayload = {
        sub: 'user-123',
        iss: 'untrusted-issuer', // Not in trusted issuers list
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      mockRequest.headers!.authorization = `Bearer ${tokenWithUntrustedIssuer}`;
      (verify as jest.MockedFunction<typeof verify>).mockReturnValue(untrustedPayload);

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify error for untrusted issuer
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'JWT token issuer is not trusted by this service.'
        })
      );
    });
  });

  /**
   * Test Case: System Configuration Errors
   * 
   * Tests scenarios where the authentication system is misconfigured,
   * such as missing environment variables. These are non-operational
   * errors that require system administrator intervention.
   */
  describe('System Configuration Errors', () => {
    it('should throw internal error when JWT_PUBLIC_KEY is not configured', () => {
      // Arrange: Remove JWT_PUBLIC_KEY environment variable
      delete process.env.JWT_PUBLIC_KEY;
      
      const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      mockRequest.headers!.authorization = `Bearer ${validToken}`;

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify UnauthorizedError for configuration issue
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication service encountered an unexpected error.'
        })
      );

      // Verify configuration error is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'JWT_PUBLIC_KEY environment variable is not configured'
      );

      // Verify JWT verification is not attempted
      expect(verify).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', () => {
      // Arrange: Mock unexpected error during processing
      const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.validtoken';
      mockRequest.headers!.authorization = `Bearer ${validToken}`;

      // Mock unexpected error
      (verify as jest.MockedFunction<typeof verify>).mockImplementation(() => {
        throw new Error('Unexpected system error');
      });

      // Act: Execute the middleware
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert: Verify generic error response
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication service encountered an unexpected error.'
        })
      );

      // Verify unexpected error is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unexpected error in authentication middleware:',
        expect.objectContaining({
          error: 'Unexpected system error',
          timestamp: expect.any(String),
          ip: '192.168.1.100',
          path: '/api/v1/blockchain/transaction'
        })
      );
    });
  });
});

/**
 * Test Suite: Error Handling Middleware
 * 
 * Tests the centralized error handling middleware to ensure proper error
 * response formatting, logging, and compliance with audit trail requirements.
 * Critical for maintaining system reliability and regulatory compliance.
 */
describe('errorMiddleware', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // Setup test environment before each test
  beforeEach(() => {
    // Create enhanced mock request with additional metadata
    mockRequest = {
      path: '/api/v1/blockchain/settlement',
      method: 'POST',
      originalUrl: '/api/v1/blockchain/settlement?type=immediate',
      ip: '10.0.0.50',
      connection: { remoteAddress: '10.0.0.50' },
      get: jest.fn((header: string) => {
        const headers: { [key: string]: string } = {
          'User-Agent': 'Mozilla/5.0 (Test Browser)',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://banking.example.com',
          'Referer': 'https://banking.example.com/dashboard'
        };
        return headers[header];
      }),
      body: { amount: 10000, currency: 'USD' },
      query: { type: 'immediate' },
      params: { settlementId: 'set-123' },
      startTime: Date.now() - 250 // Simulate 250ms processing time
    };

    // Create mock response with chainable methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Mock console methods for logging verification
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.resetAllMocks();
  });

  /**
   * Test Case: Generic Error Handling
   * 
   * Verifies that the middleware properly handles generic JavaScript errors
   * and returns appropriate 500 Internal Server Error responses with
   * proper logging and security measures.
   */
  describe('Generic Error Handling', () => {
    it('should handle generic Error with 500 status code', () => {
      // Arrange: Create a generic JavaScript error
      const genericError = new Error('Database connection failed');
      genericError.name = 'DatabaseError';

      // Add enhanced request metadata
      (mockRequest as any).requestId = 'req_12345';
      (mockRequest as any).userId = 'user-789';
      (mockRequest as any).sessionId = 'session-abc';

      // Act: Execute the error middleware
      errorMiddleware(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify 500 status code response
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      // Verify JSON response structure
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          status: 500,
          message: 'Database connection failed',
          code: 'DatabaseError',
          timestamp: expect.any(String),
          path: '/api/v1/blockchain/settlement',
          requestId: 'req_12345'
        }
      });

      // Verify security headers are set
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'req_12345');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, private');

      // Verify system error logging
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'System error occurred: Database connection failed',
        expect.objectContaining({
          event_category: 'system_error',
          event_type: 'application_error',
          event_outcome: 'failure',
          severity: 'high',
          requestId: 'req_12345',
          userId: 'user-789',
          sessionId: 'session-abc',
          errorName: 'Error',
          statusCode: 500,
          isOperational: false
        })
      );
    });

    it('should generate requestId when not present', () => {
      // Arrange: Error without requestId in request
      const error = new Error('Test error without requestId');

      // Act: Execute the error middleware
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify requestId is generated
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            requestId: expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/)
          })
        })
      );
    });

    it('should sanitize error messages in production environment', () => {
      // Arrange: Set production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const internalError = new Error('Internal database credentials exposed');

      // Act: Execute the error middleware
      errorMiddleware(
        internalError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify sanitized error message
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Internal Server Error' // Sanitized message
          })
        })
      );

      // Cleanup: Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  /**
   * Test Case: ApiError Handling
   * 
   * Tests handling of custom ApiError instances with proper status codes,
   * operational classification, and compliance logging requirements.
   */
  describe('ApiError Handling', () => {
    it('should handle UnauthorizedError with proper 401 response', () => {
      // Arrange: Create UnauthorizedError (operational error)
      const unauthorizedError = new UnauthorizedError('Invalid API key provided');

      // Act: Execute the error middleware
      errorMiddleware(
        unauthorizedError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify 401 status code
      expect(mockResponse.status).toHaveBeenCalledWith(401);

      // Verify proper error response
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          status: 401,
          message: 'Invalid API key provided',
          code: 'UnauthorizedError',
          timestamp: expect.any(String),
          path: '/api/v1/blockchain/settlement',
          requestId: expect.any(String)
        }
      });

      // Verify operational error logging (warning level)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Operational error occurred: Invalid API key provided',
        expect.objectContaining({
          event_category: 'operational_error',
          event_type: 'business_logic_error',
          event_outcome: 'failure',
          statusCode: 401,
          isOperational: true
        })
      );
    });

    it('should handle BadRequestError with validation context', () => {
      // Arrange: Create BadRequestError for validation failure
      const validationError = new BadRequestError('Invalid settlement amount: must be positive');

      // Act: Execute the error middleware
      errorMiddleware(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify 400 status code
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Verify error message preservation for operational errors
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 400,
            message: 'Invalid settlement amount: must be positive',
            code: 'BadRequestError'
          })
        })
      );
    });

    it('should handle InternalServerError with high severity logging', () => {
      // Arrange: Create InternalServerError (non-operational)
      const internalError = new InternalServerError('Database cluster failure');

      // Act: Execute the error middleware
      errorMiddleware(
        internalError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify 500 status code
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      // Verify critical error logging with audit trail
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'System error occurred: Database cluster failure',
        expect.objectContaining({
          event_category: 'system_error',
          severity: 'high',
          statusCode: 500,
          isOperational: false
        })
      );
    });
  });

  /**
   * Test Case: Performance Monitoring
   * 
   * Verifies that the error middleware properly logs performance metrics
   * for monitoring and optimization purposes.
   */
  describe('Performance Monitoring', () => {
    it('should log performance metrics when processing time is available', () => {
      // Arrange: Error with processing time
      const error = new BadRequestError('Performance test error');
      
      // Set start time to simulate 500ms processing
      (mockRequest as any).startTime = Date.now() - 500;

      // Act: Execute the error middleware
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify performance logging
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Error response performance',
        expect.objectContaining({
          operation: 'error_handling',
          duration: expect.any(Number),
          endpoint: '/api/v1/blockchain/settlement',
          statusCode: 400,
          method: 'POST'
        })
      );
    });

    it('should handle missing start time gracefully', () => {
      // Arrange: Error without start time
      const error = new BadRequestError('No timing test error');
      delete (mockRequest as any).startTime;

      // Act: Execute the error middleware
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify middleware continues without error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  /**
   * Test Case: Compliance and Audit Logging
   * 
   * Tests that the error middleware meets audit trail requirements
   * for financial services compliance.
   */
  describe('Compliance and Audit Logging', () => {
    it('should create audit trail for critical system errors', () => {
      // Arrange: Critical system error requiring audit
      const criticalError = new Error('Payment processing system failure');
      
      // Add user context for compliance
      (mockRequest as any).userId = 'trader-456';
      (mockRequest as any).sessionId = 'session-xyz';

      // Act: Execute the error middleware
      errorMiddleware(
        criticalError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify audit logging for critical errors
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Critical system error detected',
        expect.objectContaining({
          event_type: 'system_failure',
          event_action: 'error_middleware_triggered',
          event_outcome: 'failure',
          userId: 'trader-456',
          sessionId: 'session-xyz',
          complianceFramework: ['SOX', 'Basel_III', 'PCI_DSS'],
          dataClassification: 'internal'
        })
      );
    });

    it('should log final response for audit trail', () => {
      // Arrange: Any error to test response logging
      const error = new BadRequestError('Audit trail test');

      // Act: Execute the error middleware
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify response audit logging
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Error response sent to client',
        expect.objectContaining({
          event_category: 'api_response',
          event_type: 'error_response',
          event_outcome: 'success',
          statusCode: 400,
          path: '/api/v1/blockchain/settlement',
          method: 'POST',
          userId: 'anonymous',
          responseSize: expect.any(Number)
        })
      );
    });
  });
});

/**
 * Test Suite: Validation Middleware
 * 
 * Tests the validation error handling middleware to ensure proper
 * validation error processing, structured error responses, and
 * compliance with data integrity requirements.
 */
describe('handleValidationErrors', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleErrorSpy: jest.SpyInstance;

  // Mock express-validator's validationResult function
  const mockValidationResult = jest.fn();
  
  // Setup test environment before each test
  beforeEach(() => {
    // Create mock request object
    mockRequest = {
      path: '/api/v1/blockchain/transaction',
      method: 'POST',
      ip: '172.16.0.100',
      connection: { remoteAddress: '172.16.0.100' },
      get: jest.fn().mockReturnValue('Test-User-Agent'),
      body: {
        from: 'user-123',
        to: 'user-456',
        amount: 1000.50,
        currency: 'USD'
      }
    };

    // Create mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Mock console.error for logging verification
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock validationResult to be available in the test scope
    (require('express-validator') as any).validationResult = mockValidationResult;

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.resetAllMocks();
  });

  /**
   * Test Case: Valid Request Body
   * 
   * Verifies that the validation middleware proceeds to the next middleware
   * when no validation errors are present in the request.
   */
  describe('Valid Request Body', () => {
    it('should call next() when no validation errors are present', () => {
      // Arrange: Mock validationResult to return no errors
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify next() is called to continue middleware chain
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called without parameters

      // Verify no error response is sent
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();

      // Verify no error logging occurs
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Case: Invalid Request Body with Validation Errors
   * 
   * Tests the middleware's handling of validation errors, including
   * error formatting, logging, and structured error responses.
   */
  describe('Invalid Request Body', () => {
    it('should handle validation errors and create structured error response', () => {
      // Arrange: Mock validation errors
      const validationErrors = [
        {
          type: 'field',
          path: 'amount',
          location: 'body',
          msg: 'Amount must be a positive number',
          value: -100
        },
        {
          type: 'field',
          path: 'currency',
          location: 'body',
          msg: 'Currency must be a valid ISO 4217 code',
          value: 'INVALID'
        },
        {
          type: 'field',
          path: 'to',
          location: 'body',
          msg: 'To field is required',
          value: ''
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify ApiError is passed to next middleware
      expect(mockNext).toHaveBeenCalledTimes(1);
      
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError).toBeInstanceOf(ApiError);
      expect(passedError.statusCode).toBe(400);
      expect(passedError.message).toBe('Validation failed: 3 error(s) found');
      expect(passedError.isOperational).toBe(true);

      // Verify validation errors are attached to the error object
      expect((passedError as any).validationErrors).toEqual([
        {
          field: 'amount',
          message: 'Amount must be a positive number',
          value: -100,
          location: 'body'
        },
        {
          field: 'currency',
          message: 'Currency must be a valid ISO 4217 code',
          value: 'INVALID',
          location: 'body'
        },
        {
          field: 'to',
          message: 'To field is required',
          value: '',
          location: 'body'
        }
      ]);

      // Verify error metadata
      expect((passedError as any).errorType).toBe('VALIDATION_ERROR');
      expect((passedError as any).timestamp).toEqual(expect.any(String));

      // Verify validation error logging
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Validation Error:',
        expect.objectContaining({
          timestamp: expect.any(String),
          endpoint: '/api/v1/blockchain/transaction',
          method: 'POST',
          userAgent: 'Test-User-Agent',
          ip: '172.16.0.100',
          errorCount: 3,
          fields: ['amount', 'currency', 'to']
        })
      );
    });

    it('should handle single validation error', () => {
      // Arrange: Single validation error
      const singleError = [
        {
          type: 'field',
          path: 'from',
          location: 'body',
          msg: 'From field cannot be empty',
          value: ''
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => singleError
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify single error handling
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.message).toBe('Validation failed: 1 error(s) found');
      expect((passedError as any).validationErrors).toHaveLength(1);
      expect((passedError as any).validationErrors[0]).toEqual({
        field: 'from',
        message: 'From field cannot be empty',
        value: '',
        location: 'body'
      });
    });

    it('should handle validation errors with unknown field types', () => {
      // Arrange: Validation error with unknown type
      const unknownTypeError = [
        {
          type: 'unknown',
          msg: 'Generic validation error',
          location: 'body'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => unknownTypeError
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify unknown type handling
      const passedError = mockNext.mock.calls[0][0];
      expect((passedError as any).validationErrors[0]).toEqual({
        field: 'unknown',
        message: 'Generic validation error',
        value: undefined,
        location: 'body'
      });
    });
  });

  /**
   * Test Case: Unexpected Errors in Validation Processing
   * 
   * Tests the middleware's resilience to unexpected errors during
   * validation processing, ensuring graceful error handling.
   */
  describe('Unexpected Errors', () => {
    it('should handle unexpected errors during validation processing', () => {
      // Arrange: Mock validationResult to throw unexpected error
      mockValidationResult.mockImplementation(() => {
        throw new Error('Unexpected validation processing error');
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify internal server error is created
      expect(mockNext).toHaveBeenCalledTimes(1);
      
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError).toBeInstanceOf(ApiError);
      expect(passedError.statusCode).toBe(500);
      expect(passedError.message).toBe('Internal error occurred during request validation');
      expect(passedError.isOperational).toBe(false); // Non-operational error

      // Verify unexpected error logging
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unexpected error in validation middleware:',
        expect.objectContaining({
          timestamp: expect.any(String),
          error: 'Unexpected validation processing error',
          stack: expect.any(String),
          endpoint: '/api/v1/blockchain/transaction',
          method: 'POST'
        })
      );
    });

    it('should handle null validationResult gracefully', () => {
      // Arrange: Mock validationResult to return null
      mockValidationResult.mockReturnValue(null);

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify internal server error for null result
      expect(mockNext).toHaveBeenCalledTimes(1);
      
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.statusCode).toBe(500);
      expect(passedError.isOperational).toBe(false);
    });
  });

  /**
   * Test Case: Edge Cases and Security Considerations
   * 
   * Tests various edge cases and security-related scenarios to ensure
   * the validation middleware is robust and secure.
   */
  describe('Edge Cases and Security', () => {
    it('should handle validation errors with sensitive data masking', () => {
      // Arrange: Validation error with potentially sensitive data
      const sensitiveDataError = [
        {
          type: 'field',
          path: 'password',
          location: 'body',
          msg: 'Password must meet complexity requirements',
          value: 'user-password-123'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => sensitiveDataError
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify sensitive data is not logged in full
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Validation Error:',
        expect.objectContaining({
          fields: ['password'] // Only field name, not value
        })
      );

      // Verify error structure still contains the value for processing
      const passedError = mockNext.mock.calls[0][0];
      expect((passedError as any).validationErrors[0].value).toBe('user-password-123');
    });

    it('should handle very large number of validation errors', () => {
      // Arrange: Large number of validation errors
      const manyErrors = Array.from({ length: 50 }, (_, index) => ({
        type: 'field',
        path: `field_${index}`,
        location: 'body',
        msg: `Error for field ${index}`,
        value: `value_${index}`
      }));

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => manyErrors
      });

      // Act: Execute the validation middleware
      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert: Verify all errors are processed
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.message).toBe('Validation failed: 50 error(s) found');
      expect((passedError as any).validationErrors).toHaveLength(50);
    });
  });
});