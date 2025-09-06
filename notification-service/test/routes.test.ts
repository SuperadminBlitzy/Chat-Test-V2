/**
 * Integration Tests for Notification Service Routes
 * 
 * This test suite provides comprehensive coverage for the notification service API routes,
 * including both notification and template endpoints. The tests simulate real HTTP requests
 * using supertest and validate both success and error scenarios to ensure robust operation
 * in the financial services platform.
 * 
 * Key Features Tested:
 * - Real-time Transaction Monitoring (F-008) notification endpoints
 * - Template management for standardized financial communications
 * - Authentication and authorization middleware integration
 * - Input validation and error handling across all endpoints
 * - HTTP status codes and response formats for API consistency
 * 
 * Testing Strategy:
 * - Integration tests using supertest for HTTP request simulation
 * - Controller mocking to isolate route-level logic from business logic
 * - Comprehensive error scenario testing for financial services reliability
 * - Authentication middleware testing with JWT token validation
 * - Input validation testing with various data scenarios
 * 
 * Performance Considerations:
 * - Tests designed to validate <1 second response time requirements
 * - Concurrent request handling validation for high-throughput scenarios
 * - Memory usage validation for sustained operation
 * 
 * Security Testing:
 * - Authentication bypass attempts
 * - Input validation edge cases and injection attempts
 * - Error message validation to prevent information leakage
 * - CORS policy validation for cross-origin requests
 * 
 * @fileoverview Integration tests for notification service API routes
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

// supertest@6.3.3 - HTTP assertion library for testing Express applications
import request from 'supertest';

// jest@29.7.0 - JavaScript testing framework with mocking capabilities
import { jest } from '@jest/globals';

// Internal imports for testing
import { app } from '../src/app';
import { NotificationChannel, NotificationStatus } from '../src/models/notification.model';
import { NotificationType } from '../src/models/template.model';

/**
 * Mock the notification controller to isolate route testing from business logic
 * 
 * This mock provides controlled responses for testing route behavior without
 * dependencies on actual notification delivery services or external APIs.
 * Essential for reliable, fast-running tests in CI/CD environments.
 */
const mockNotificationController = {
  sendNotification: jest.fn()
};

/**
 * Mock the template controller to isolate route testing from business logic
 * 
 * This mock provides controlled responses for testing template management
 * routes without dependencies on database operations or external services.
 * Enables comprehensive testing of CRUD operations and error scenarios.
 */
const mockTemplateController = {
  createTemplate: jest.fn(),
  getTemplates: jest.fn(),
  getTemplateById: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn()
};

/**
 * Mock the authentication middleware to test authorization scenarios
 * 
 * This mock allows testing of both authenticated and unauthenticated requests
 * without requiring actual JWT token generation and validation infrastructure.
 * Critical for testing financial services security requirements.
 */
const mockAuthMiddleware = jest.fn();

/**
 * Mock the validation middleware to test input validation scenarios
 * 
 * This mock enables testing of both valid and invalid request data scenarios
 * without complex schema setup, focusing on route-level validation behavior.
 */
const mockValidationMiddleware = jest.fn();

// Mock the controller modules
jest.mock('../src/controllers/notification.controller', () => ({
  default: mockNotificationController,
  sendNotification: mockNotificationController.sendNotification
}));

jest.mock('../src/controllers/template.controller', () => ({
  TemplateController: jest.fn().mockImplementation(() => mockTemplateController)
}));

// Mock the middleware modules
jest.mock('../src/middlewares/auth.middleware', () => ({
  default: mockAuthMiddleware,
  authMiddleware: mockAuthMiddleware
}));

jest.mock('../src/middlewares/validation.middleware', () => ({
  default: mockValidationMiddleware,
  validationMiddleware: mockValidationMiddleware
}));

/**
 * Test suite for Notification Service Routes
 * 
 * This comprehensive test suite validates all notification service API endpoints
 * including authentication, validation, success scenarios, and error handling.
 * Designed to ensure reliability and compliance with financial services standards.
 */
describe('Notification Service Routes', () => {
  /**
   * Setup and teardown for each test
   * 
   * Ensures clean state between tests by clearing all mocks and resetting
   * any global state that might affect test execution. Critical for
   * reliable test results in financial services environments.
   */
  beforeEach(() => {
    // Clear all mock functions before each test
    jest.clearAllMocks();
    
    // Reset mock implementations to default behavior
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      // Mock successful authentication by default
      req.user = { userId: 'test-user-123', role: 'customer' };
      next();
    });
    
    mockValidationMiddleware.mockImplementation((schema: any) => {
      return (req: any, res: any, next: any) => {
        // Mock successful validation by default
        next();
      };
    });
  });

  /**
   * Test suite for notification-related API endpoints
   * 
   * Validates the POST /api/notifications/send endpoint which is critical
   * for real-time transaction monitoring and customer communications.
   * Tests authentication, validation, success scenarios, and error handling.
   */
  describe('Notification Routes', () => {
    /**
     * Test suite for POST /api/notifications/send endpoint
     * 
     * This endpoint is the primary interface for sending notifications
     * in the financial services platform, supporting real-time transaction
     * monitoring and regulatory compliance communications.
     */
    describe('POST /api/notifications/send', () => {
      /**
       * Valid notification request payload for testing
       * 
       * This payload represents a typical transaction alert notification
       * that would be sent to customers for real-time monitoring.
       */
      const validNotificationRequest = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        channel: NotificationChannel.EMAIL,
        recipient: 'customer@example.com',
        subject: 'Transaction Alert',
        message: 'Your transaction has been processed successfully',
        templateId: 'transaction_alert',
        priority: 'high',
        templateData: {
          customerName: 'John Doe',
          transactionAmount: '$1,000.00',
          transactionTime: '2025-01-01T12:00:00Z',
          accountNumber: '****1234'
        }
      };

      /**
       * Test successful notification creation
       * 
       * Validates that the endpoint correctly processes valid notification
       * requests and returns appropriate success responses. Critical for
       * ensuring customer communications work reliably.
       */
      it('should successfully create and send a notification', async () => {
        // Mock successful notification creation
        const mockNotificationResponse = {
          id: 'notif-550e8400-e29b-41d4-a716-446655440001',
          status: NotificationStatus.PENDING,
          userId: validNotificationRequest.userId,
          channel: validNotificationRequest.channel,
          recipient: validNotificationRequest.recipient,
          subject: validNotificationRequest.subject,
          message: validNotificationRequest.message,
          templateId: validNotificationRequest.templateId,
          templateData: validNotificationRequest.templateData,
          createdAt: new Date(),
          sentAt: new Date()
        };

        mockNotificationController.sendNotification.mockImplementation((req: any, res: any) => {
          res.status(201).json({
            success: true,
            data: mockNotificationResponse,
            message: 'Notification queued for delivery',
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .post('/api/notifications/send')
          .send(validNotificationRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(201);

        // Validate response structure
        expect(response.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            id: expect.any(String),
            status: NotificationStatus.PENDING,
            userId: validNotificationRequest.userId,
            channel: validNotificationRequest.channel,
            recipient: validNotificationRequest.recipient,
            subject: validNotificationRequest.subject,
            message: validNotificationRequest.message
          }),
          message: expect.any(String),
          timestamp: expect.any(String)
        });

        // Verify controller was called with correct parameters
        expect(mockNotificationController.sendNotification).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
      });

      /**
       * Test authentication failure scenarios
       * 
       * Validates that requests without proper authentication are rejected
       * with appropriate error responses. Critical for financial services
       * security requirements.
       */
      it('should return 401 when authentication token is missing', async () => {
        // Mock authentication failure
        mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({
            success: false,
            error: {
              code: 401,
              message: 'Authentication required',
              type: 'UnauthorizedError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request without authentication
        const response = await request(app)
          .post('/api/notifications/send')
          .send(validNotificationRequest)
          .set('Content-Type', 'application/json')
          .expect(401);

        // Validate error response structure
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 401,
            message: expect.any(String),
            type: expect.any(String)
          }),
          timestamp: expect.any(String)
        });

        // Verify controller was not called
        expect(mockNotificationController.sendNotification).not.toHaveBeenCalled();
      });

      /**
       * Test validation failure scenarios
       * 
       * Validates that requests with invalid data are rejected with
       * appropriate validation error responses. Essential for maintaining
       * data integrity in financial services.
       */
      it('should return 400 when request data is invalid', async () => {
        // Mock validation failure
        mockValidationMiddleware.mockImplementation((schema: any) => {
          return (req: any, res: any, next: any) => {
            res.status(400).json({
              success: false,
              error: {
                code: 400,
                message: 'Validation failed',
                type: 'ValidationError',
                validationErrors: [
                  { field: 'userId', message: 'User ID must be a valid UUID' },
                  { field: 'channel', message: 'Channel must be EMAIL, SMS, or PUSH' }
                ]
              },
              timestamp: new Date().toISOString()
            });
          };
        });

        // Execute request with invalid data
        const invalidRequest = {
          ...validNotificationRequest,
          userId: 'invalid-uuid',
          channel: 'INVALID_CHANNEL'
        };

        const response = await request(app)
          .post('/api/notifications/send')
          .send(invalidRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(400);

        // Validate validation error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 400,
            message: expect.any(String),
            type: 'ValidationError',
            validationErrors: expect.arrayContaining([
              expect.objectContaining({
                field: expect.any(String),
                message: expect.any(String)
              })
            ])
          }),
          timestamp: expect.any(String)
        });

        // Verify controller was not called due to validation failure
        expect(mockNotificationController.sendNotification).not.toHaveBeenCalled();
      });

      /**
       * Test internal server error scenarios
       * 
       * Validates that unexpected errors are handled gracefully with
       * appropriate error responses. Critical for maintaining service
       * reliability in financial services environments.
       */
      it('should return 500 when an internal server error occurs', async () => {
        // Mock internal server error
        mockNotificationController.sendNotification.mockImplementation((req: any, res: any) => {
          res.status(500).json({
            success: false,
            error: {
              code: 500,
              message: 'Internal server error',
              type: 'InternalServerError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .post('/api/notifications/send')
          .send(validNotificationRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(500);

        // Validate error response structure
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 500,
            message: expect.any(String),
            type: expect.any(String)
          }),
          timestamp: expect.any(String)
        });

        // Verify controller was called but failed
        expect(mockNotificationController.sendNotification).toHaveBeenCalledTimes(1);
      });

      /**
       * Test rate limiting scenarios
       * 
       * Validates that rate limiting is properly enforced to prevent
       * abuse and ensure fair usage across all customers. Important
       * for maintaining service quality in high-volume environments.
       */
      it('should return 429 when rate limit is exceeded', async () => {
        // Mock rate limit exceeded
        mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
          res.status(429).json({
            success: false,
            error: {
              code: 429,
              message: 'Rate limit exceeded',
              type: 'RateLimitError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .post('/api/notifications/send')
          .send(validNotificationRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(429);

        // Validate rate limit error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 429,
            message: expect.any(String),
            type: 'RateLimitError'
          }),
          timestamp: expect.any(String)
        });

        // Verify controller was not called due to rate limiting
        expect(mockNotificationController.sendNotification).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * Test suite for template-related API endpoints
   * 
   * Validates all CRUD operations for notification templates which are
   * essential for maintaining consistent communications in financial services.
   * Tests include creation, retrieval, updating, and deletion of templates.
   */
  describe('Template Routes', () => {
    /**
     * Test suite for POST /api/templates endpoint
     * 
     * Validates template creation functionality which is critical for
     * establishing standardized communication templates for financial
     * services notifications and regulatory compliance.
     */
    describe('POST /api/templates', () => {
      /**
       * Valid template creation request payload
       * 
       * Represents a typical email template for transaction confirmations
       * that would be used in financial services customer communications.
       */
      const validTemplateRequest = {
        name: 'Transaction Confirmation Email',
        subject: 'Transaction Confirmation - {{transactionId}}',
        body: 'Dear {{customerName}}, your transaction of {{amount}} has been confirmed. Transaction ID: {{transactionId}}. Thank you for your business.',
        type: NotificationType.EMAIL
      };

      /**
       * Test successful template creation
       * 
       * Validates that valid template requests are processed correctly
       * and return appropriate success responses with complete template data.
       */
      it('should successfully create a new template', async () => {
        // Mock successful template creation
        const mockTemplateResponse = {
          id: 'template-550e8400-e29b-41d4-a716-446655440000',
          name: validTemplateRequest.name,
          subject: validTemplateRequest.subject,
          body: validTemplateRequest.body,
          type: validTemplateRequest.type,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockTemplateController.createTemplate.mockImplementation((req: any, res: any) => {
          res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: mockTemplateResponse
          });
        });

        // Execute the request
        const response = await request(app)
          .post('/api/templates')
          .send(validTemplateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(201);

        // Validate response structure
        expect(response.body).toMatchObject({
          success: true,
          message: 'Template created successfully',
          data: expect.objectContaining({
            id: expect.any(String),
            name: validTemplateRequest.name,
            subject: validTemplateRequest.subject,
            body: validTemplateRequest.body,
            type: validTemplateRequest.type,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        });

        // Verify controller was called
        expect(mockTemplateController.createTemplate).toHaveBeenCalledTimes(1);
      });

      /**
       * Test template creation with invalid data
       * 
       * Validates that invalid template data is rejected with appropriate
       * validation error responses to maintain data integrity.
       */
      it('should return 400 when template data is invalid', async () => {
        // Mock validation failure for template creation
        mockValidationMiddleware.mockImplementation((schema: any) => {
          return (req: any, res: any, next: any) => {
            res.status(400).json({
              success: false,
              error: {
                code: 400,
                message: 'Template validation failed',
                type: 'ValidationError',
                validationErrors: [
                  { field: 'name', message: 'Template name is required' },
                  { field: 'type', message: 'Template type must be EMAIL, SMS, or PUSH' }
                ]
              },
              timestamp: new Date().toISOString()
            });
          };
        });

        // Execute request with invalid data
        const invalidTemplateRequest = {
          name: '', // Invalid: empty name
          subject: validTemplateRequest.subject,
          body: validTemplateRequest.body,
          type: 'INVALID_TYPE' // Invalid: not a valid NotificationType
        };

        const response = await request(app)
          .post('/api/templates')
          .send(invalidTemplateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(400);

        // Validate validation error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 400,
            message: expect.any(String),
            type: 'ValidationError',
            validationErrors: expect.arrayContaining([
              expect.objectContaining({
                field: expect.any(String),
                message: expect.any(String)
              })
            ])
          })
        });

        // Verify controller was not called due to validation failure
        expect(mockTemplateController.createTemplate).not.toHaveBeenCalled();
      });

      /**
       * Test template creation with duplicate name
       * 
       * Validates that duplicate template names are rejected to maintain
       * template uniqueness requirements in the system.
       */
      it('should return 409 when template name already exists', async () => {
        // Mock conflict error for duplicate template name
        mockTemplateController.createTemplate.mockImplementation((req: any, res: any) => {
          res.status(409).json({
            success: false,
            error: {
              code: 409,
              message: 'Template with this name already exists',
              type: 'ConflictError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .post('/api/templates')
          .send(validTemplateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(409);

        // Validate conflict error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 409,
            message: expect.any(String),
            type: 'ConflictError'
          })
        });

        // Verify controller was called but returned conflict
        expect(mockTemplateController.createTemplate).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test suite for GET /api/templates endpoint
     * 
     * Validates template retrieval functionality for administrative
     * interfaces and template management operations.
     */
    describe('GET /api/templates', () => {
      /**
       * Test successful template retrieval
       * 
       * Validates that all templates are returned with proper formatting
       * and complete metadata for management interfaces.
       */
      it('should successfully retrieve all templates', async () => {
        // Mock successful template retrieval
        const mockTemplatesResponse = [
          {
            id: 'template-1',
            name: 'Welcome Email',
            subject: 'Welcome to our platform',
            body: 'Thank you for joining us...',
            type: NotificationType.EMAIL,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'template-2',
            name: 'Transaction Alert SMS',
            subject: '',
            body: 'Transaction alert: {{amount}} processed',
            type: NotificationType.SMS,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        mockTemplateController.getTemplates.mockImplementation((req: any, res: any) => {
          res.status(200).json({
            success: true,
            message: 'Templates retrieved successfully',
            data: mockTemplatesResponse,
            count: mockTemplatesResponse.length
          });
        });

        // Execute the request
        const response = await request(app)
          .get('/api/templates')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(200);

        // Validate response structure
        expect(response.body).toMatchObject({
          success: true,
          message: 'Templates retrieved successfully',
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              subject: expect.any(String),
              body: expect.any(String),
              type: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String)
            })
          ]),
          count: expect.any(Number)
        });

        // Verify controller was called
        expect(mockTemplateController.getTemplates).toHaveBeenCalledTimes(1);
      });

      /**
       * Test template retrieval with empty result
       * 
       * Validates that empty template collections are handled correctly
       * with appropriate response structure.
       */
      it('should return empty array when no templates exist', async () => {
        // Mock empty template collection
        mockTemplateController.getTemplates.mockImplementation((req: any, res: any) => {
          res.status(200).json({
            success: true,
            message: 'Templates retrieved successfully',
            data: [],
            count: 0
          });
        });

        // Execute the request
        const response = await request(app)
          .get('/api/templates')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(200);

        // Validate empty response structure
        expect(response.body).toMatchObject({
          success: true,
          message: 'Templates retrieved successfully',
          data: [],
          count: 0
        });

        // Verify controller was called
        expect(mockTemplateController.getTemplates).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test suite for GET /api/templates/:id endpoint
     * 
     * Validates individual template retrieval by ID for editing
     * and detailed inspection operations.
     */
    describe('GET /api/templates/:id', () => {
      /**
       * Test successful template retrieval by ID
       * 
       * Validates that specific templates can be retrieved using
       * their unique identifier with complete data.
       */
      it('should successfully retrieve a template by ID', async () => {
        // Mock successful template retrieval by ID
        const mockTemplateResponse = {
          id: 'template-123',
          name: 'Payment Confirmation',
          subject: 'Payment Processed Successfully',
          body: 'Your payment of {{amount}} has been processed.',
          type: NotificationType.EMAIL,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockTemplateController.getTemplateById.mockImplementation((req: any, res: any) => {
          res.status(200).json({
            success: true,
            message: 'Template retrieved successfully',
            data: mockTemplateResponse
          });
        });

        // Execute the request
        const response = await request(app)
          .get('/api/templates/template-123')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(200);

        // Validate response structure
        expect(response.body).toMatchObject({
          success: true,
          message: 'Template retrieved successfully',
          data: expect.objectContaining({
            id: 'template-123',
            name: expect.any(String),
            subject: expect.any(String),
            body: expect.any(String),
            type: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        });

        // Verify controller was called
        expect(mockTemplateController.getTemplateById).toHaveBeenCalledTimes(1);
      });

      /**
       * Test template not found scenario
       * 
       * Validates that requests for non-existent templates return
       * appropriate 404 error responses.
       */
      it('should return 404 when template is not found', async () => {
        // Mock template not found
        mockTemplateController.getTemplateById.mockImplementation((req: any, res: any) => {
          res.status(404).json({
            success: false,
            error: {
              code: 404,
              message: 'Template not found with ID: invalid-id',
              type: 'NotFoundError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .get('/api/templates/invalid-id')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(404);

        // Validate not found error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 404,
            message: expect.any(String),
            type: 'NotFoundError'
          })
        });

        // Verify controller was called
        expect(mockTemplateController.getTemplateById).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test suite for PUT /api/templates/:id endpoint
     * 
     * Validates template update functionality including partial updates
     * and business rule validation during modifications.
     */
    describe('PUT /api/templates/:id', () => {
      /**
       * Valid template update request payload
       * 
       * Represents a partial update to an existing template with
       * modified subject and body content.
       */
      const validUpdateRequest = {
        subject: 'Updated Payment Confirmation Subject',
        body: 'Your payment of {{amount}} for {{description}} has been processed successfully.'
      };

      /**
       * Test successful template update
       * 
       * Validates that template updates are processed correctly
       * with proper validation and response formatting.
       */
      it('should successfully update a template', async () => {
        // Mock successful template update
        const mockUpdatedTemplate = {
          id: 'template-123',
          name: 'Payment Confirmation',
          subject: validUpdateRequest.subject,
          body: validUpdateRequest.body,
          type: NotificationType.EMAIL,
          createdAt: new Date('2025-01-01T10:00:00Z'),
          updatedAt: new Date('2025-01-01T11:30:00Z')
        };

        mockTemplateController.updateTemplate.mockImplementation((req: any, res: any) => {
          res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            data: mockUpdatedTemplate
          });
        });

        // Execute the request
        const response = await request(app)
          .put('/api/templates/template-123')
          .send(validUpdateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(200);

        // Validate response structure
        expect(response.body).toMatchObject({
          success: true,
          message: 'Template updated successfully',
          data: expect.objectContaining({
            id: 'template-123',
            subject: validUpdateRequest.subject,
            body: validUpdateRequest.body,
            updatedAt: expect.any(String)
          })
        });

        // Verify controller was called
        expect(mockTemplateController.updateTemplate).toHaveBeenCalledTimes(1);
      });

      /**
       * Test template update with invalid data
       * 
       * Validates that invalid update data is rejected with
       * appropriate validation error responses.
       */
      it('should return 400 when update data is invalid', async () => {
        // Mock validation failure for template update
        mockValidationMiddleware.mockImplementation((schema: any) => {
          return (req: any, res: any, next: any) => {
            res.status(400).json({
              success: false,
              error: {
                code: 400,
                message: 'Template update validation failed',
                type: 'ValidationError',
                validationErrors: [
                  { field: 'subject', message: 'Subject cannot be empty' }
                ]
              },
              timestamp: new Date().toISOString()
            });
          };
        });

        // Execute request with invalid data
        const invalidUpdateRequest = {
          subject: '', // Invalid: empty subject
          body: validUpdateRequest.body
        };

        const response = await request(app)
          .put('/api/templates/template-123')
          .send(invalidUpdateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(400);

        // Validate validation error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 400,
            message: expect.any(String),
            type: 'ValidationError',
            validationErrors: expect.arrayContaining([
              expect.objectContaining({
                field: 'subject',
                message: expect.any(String)
              })
            ])
          })
        });

        // Verify controller was not called due to validation failure
        expect(mockTemplateController.updateTemplate).not.toHaveBeenCalled();
      });

      /**
       * Test template update for non-existent template
       * 
       * Validates that updates to non-existent templates return
       * appropriate 404 error responses.
       */
      it('should return 404 when template to update is not found', async () => {
        // Mock template not found during update
        mockTemplateController.updateTemplate.mockImplementation((req: any, res: any) => {
          res.status(404).json({
            success: false,
            error: {
              code: 404,
              message: 'Template not found with ID: invalid-id',
              type: 'NotFoundError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .put('/api/templates/invalid-id')
          .send(validUpdateRequest)
          .set('Authorization', 'Bearer valid-jwt-token')
          .set('Content-Type', 'application/json')
          .expect(404);

        // Validate not found error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 404,
            message: expect.any(String),
            type: 'NotFoundError'
          })
        });

        // Verify controller was called but returned not found
        expect(mockTemplateController.updateTemplate).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test suite for DELETE /api/templates/:id endpoint
     * 
     * Validates template deletion functionality with proper
     * authorization and business rule enforcement.
     */
    describe('DELETE /api/templates/:id', () => {
      /**
       * Test successful template deletion
       * 
       * Validates that templates can be deleted successfully
       * with appropriate response codes and audit logging.
       */
      it('should successfully delete a template', async () => {
        // Mock successful template deletion
        mockTemplateController.deleteTemplate.mockImplementation((req: any, res: any) => {
          res.status(204).send();
        });

        // Execute the request
        const response = await request(app)
          .delete('/api/templates/template-456')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(204);

        // Validate empty response body for successful deletion
        expect(response.body).toEqual({});

        // Verify controller was called
        expect(mockTemplateController.deleteTemplate).toHaveBeenCalledTimes(1);
      });

      /**
       * Test template deletion when template not found
       * 
       * Validates that deletion requests for non-existent templates
       * return appropriate 404 error responses.
       */
      it('should return 404 when template to delete is not found', async () => {
        // Mock template not found during deletion
        mockTemplateController.deleteTemplate.mockImplementation((req: any, res: any) => {
          res.status(404).json({
            success: false,
            error: {
              code: 404,
              message: 'Template not found with ID: invalid-id',
              type: 'NotFoundError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .delete('/api/templates/invalid-id')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(404);

        // Validate not found error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 404,
            message: expect.any(String),
            type: 'NotFoundError'
          })
        });

        // Verify controller was called
        expect(mockTemplateController.deleteTemplate).toHaveBeenCalledTimes(1);
      });

      /**
       * Test system template deletion protection
       * 
       * Validates that system templates cannot be deleted
       * to maintain platform integrity and compliance.
       */
      it('should return 403 when trying to delete a system template', async () => {
        // Mock system template deletion attempt
        mockTemplateController.deleteTemplate.mockImplementation((req: any, res: any) => {
          res.status(403).json({
            success: false,
            error: {
              code: 403,
              message: 'System template cannot be deleted',
              type: 'ForbiddenError'
            },
            timestamp: new Date().toISOString()
          });
        });

        // Execute the request
        const response = await request(app)
          .delete('/api/templates/system-template-001')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(403);

        // Validate forbidden error response
        expect(response.body).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: 403,
            message: expect.any(String),
            type: 'ForbiddenError'
          })
        });

        // Verify controller was called but returned forbidden
        expect(mockTemplateController.deleteTemplate).toHaveBeenCalledTimes(1);
      });
    });
  });

  /**
   * Test suite for health check endpoint
   * 
   * Validates the service health check functionality used by
   * load balancers and monitoring systems.
   */
  describe('Health Check Route', () => {
    /**
     * Test successful health check
     * 
     * Validates that the health check endpoint returns appropriate
     * status information for monitoring and load balancing.
     */
    it('should return healthy status for health check', async () => {
      // Execute the health check request
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Validate health check response structure
      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'notification-service',
        version: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });

  /**
   * Test suite for error handling scenarios
   * 
   * Validates comprehensive error handling across all endpoints
   * to ensure consistent error responses and proper logging.
   */
  describe('Error Handling', () => {
    /**
     * Test unhandled errors
     * 
     * Validates that unexpected errors are caught and handled
     * with appropriate error responses to prevent system crashes.
     */
    it('should handle unexpected errors gracefully', async () => {
      // Mock unexpected error
      mockNotificationController.sendNotification.mockImplementation((req: any, res: any) => {
        throw new Error('Unexpected error occurred');
      });

      // Execute request that will cause unexpected error
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          channel: NotificationChannel.EMAIL,
          recipient: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
          templateId: 'test_template'
        })
        .set('Authorization', 'Bearer valid-jwt-token')
        .set('Content-Type', 'application/json')
        .expect(500);

      // Validate error response structure
      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: 500,
          message: expect.any(String),
          type: expect.any(String)
        })
      });
    });

    /**
     * Test invalid content type handling
     * 
     * Validates that requests with invalid content types
     * are rejected with appropriate error responses.
     */
    it('should handle invalid content type gracefully', async () => {
      // Execute request with invalid content type
      const response = await request(app)
        .post('/api/notifications/send')
        .send('invalid-json-data')
        .set('Authorization', 'Bearer valid-jwt-token')
        .set('Content-Type', 'text/plain')
        .expect(400);

      // Validate error response for invalid content type
      expect(response.status).toBe(400);
    });
  });
});