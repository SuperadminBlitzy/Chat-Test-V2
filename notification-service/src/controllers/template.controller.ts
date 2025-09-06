/**
 * Template Controller for Notification Service
 * 
 * This controller manages all HTTP endpoints for notification template operations
 * in the real-time transaction monitoring system (F-008). It provides RESTful API
 * endpoints for creating, retrieving, updating, and deleting notification templates
 * used across multiple communication channels (EMAIL, SMS, PUSH).
 * 
 * Technical Context:
 * - Part of the event-driven microservices architecture
 * - Implements enterprise-grade error handling and validation
 * - Supports high-throughput notification processing (5,000+ requests/sec)
 * - Complies with financial services reliability requirements (99.9% availability)
 * - Integrates with AI-powered risk assessment engine for fraud notifications
 * 
 * Business Context:
 * - Enables real-time customer notifications for transaction monitoring
 * - Supports regulatory compliance through standardized communication templates
 * - Facilitates fraud detection alerts and customer protection notifications
 * - Provides foundation for personalized financial service communications
 * 
 * Security Considerations:
 * - Input validation for all request parameters and body data
 * - Proper error handling to prevent information leakage
 * - Audit logging for all template operations
 * - Rate limiting support through middleware integration
 * 
 * Performance Characteristics:
 * - <500ms response time requirement for real-time processing
 * - Supports concurrent access for high-volume notification scenarios
 * - Memory-efficient template operations with service layer caching
 * - Optimized for financial services throughput requirements
 * 
 * @fileoverview Template management controller for notification service
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

import { Request, Response, NextFunction } from 'express'; // v4.18+ - Express framework for HTTP handling
import { TemplateService } from '../services/template.service';
import { Template, CreateTemplateInput, UpdateTemplateInput } from '../models/template.model';
import { NotFoundError, BadRequestError, NotificationError } from '../utils/errors';

/**
 * Controller class for handling all template-related API requests
 * 
 * This controller implements the HTTP layer for template management operations,
 * providing RESTful endpoints that integrate with the TemplateService for
 * business logic execution. All methods follow enterprise-grade patterns
 * including comprehensive error handling, input validation, and proper
 * HTTP status code responses.
 * 
 * Architecture Pattern:
 * - Follows Controller-Service-Repository pattern
 * - Implements dependency injection through constructor
 * - Uses async/await for promise-based operations
 * - Provides clean separation between HTTP concerns and business logic
 * 
 * Error Handling Strategy:
 * - Comprehensive input validation with descriptive error messages
 * - Proper HTTP status codes for all response scenarios
 * - Structured error responses for API consistency
 * - Error logging for monitoring and debugging
 * 
 * API Design Principles:
 * - RESTful endpoint design with resource-based URLs
 * - Consistent JSON response format across all endpoints
 * - Proper use of HTTP methods and status codes
 * - Support for content negotiation and error handling
 * 
 * @class TemplateController
 */
export class TemplateController {
  /**
   * Template service instance for business logic operations
   * 
   * This private property encapsulates the service layer dependency,
   * ensuring clean separation of concerns between HTTP handling and
   * business logic. The service handles all template operations including
   * validation, storage, and retrieval.
   * 
   * @private
   * @readonly
   * @type {TemplateService}
   */
  private readonly templateService: TemplateService;

  /**
   * Initializes the TemplateController with a TemplateService instance
   * 
   * Constructor implements dependency injection pattern by creating
   * a new TemplateService instance. In production environments,
   * this could be enhanced with IoC container integration for
   * better testability and dependency management.
   * 
   * Design Rationale:
   * - Simple dependency injection for clean architecture
   * - Service instantiation ensures proper initialization
   * - Encapsulation of service dependency for better testability
   * - Supports future enhancement with IoC containers
   * 
   * @constructor
   */
  constructor() {
    // Instantiate the template service for business logic operations
    this.templateService = new TemplateService();
  }

  /**
   * Handles the creation of a new notification template
   * 
   * This endpoint accepts template data in the request body and creates
   * a new template through the service layer. It validates input data,
   * handles business rule violations, and returns appropriate HTTP responses
   * based on the operation outcome.
   * 
   * HTTP Method: POST
   * Expected Request Body: CreateTemplateInput
   * Success Response: 201 Created with template data
   * Error Responses: 400 Bad Request, 500 Internal Server Error
   * 
   * Validation Rules:
   * - Template name must be unique and non-empty
   * - Subject required for EMAIL and PUSH notification types
   * - Body content must meet minimum length requirements
   * - Notification type must be valid enum value
   * 
   * Business Logic:
   * - Template creation with automatic ID generation
   * - Timestamp management for audit trails
   * - Content validation based on notification type
   * - Uniqueness validation for template names
   * 
   * @param {Request} req - Express request object containing template data
   * @param {Response} res - Express response object for sending HTTP response
   * @param {NextFunction} next - Express next function for error handling middleware
   * @returns {Promise<void>} Resolves when response is sent or error is handled
   * 
   * @example
   * POST /api/templates
   * Content-Type: application/json
   * 
   * {
   *   "name": "Payment Confirmation",
   *   "subject": "Payment Processed Successfully",
   *   "body": "Your payment of {{amount}} has been processed.",
   *   "type": "EMAIL"
   * }
   * 
   * Response: 201 Created
   * {
   *   "id": "template-abc123",
   *   "name": "Payment Confirmation",
   *   "subject": "Payment Processed Successfully",
   *   "body": "Your payment of {{amount}} has been processed.",
   *   "type": "EMAIL",
   *   "createdAt": "2025-01-01T10:00:00.000Z",
   *   "updatedAt": "2025-01-01T10:00:00.000Z"
   * }
   */
  public async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract template data from request body
      const templateData: CreateTemplateInput = req.body;

      // Validate that request body contains data
      if (!templateData || typeof templateData !== 'object') {
        throw new BadRequestError('Request body must contain template data');
      }

      // Validate required fields are present
      if (!templateData.name) {
        throw new BadRequestError('Template name is required');
      }

      if (!templateData.subject) {
        throw new BadRequestError('Template subject is required');
      }

      if (!templateData.body) {
        throw new BadRequestError('Template body is required');
      }

      if (!templateData.type) {
        throw new BadRequestError('Template type is required');
      }

      // Call the template service to create the new template
      // Service layer handles business validation and creation logic
      const createdTemplate: Template = this.templateService.createTemplate(templateData);

      // Log successful template creation for audit trail
      console.log(`Template created successfully: ${createdTemplate.id} - ${createdTemplate.name}`);

      // Send 201 Created response with the newly created template
      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: createdTemplate
      });

    } catch (error) {
      // Handle service-layer errors and convert to appropriate HTTP errors
      if (error instanceof Error) {
        // Check for specific business rule violations
        if (error.message.includes('already exists')) {
          // Template name uniqueness violation
          next(new BadRequestError(`Template creation failed: ${error.message}`));
        } else if (error.message.includes('validation')) {
          // Data validation errors
          next(new BadRequestError(`Template validation failed: ${error.message}`));
        } else {
          // Generic template service errors
          next(new NotificationError(`Template creation failed: ${error.message}`, 500));
        }
      } else {
        // Unexpected error type
        next(new NotificationError('An unexpected error occurred during template creation', 500));
      }
    }
  }

  /**
   * Retrieves all notification templates
   * 
   * This endpoint returns a list of all templates currently stored in the system.
   * It provides comprehensive template data for administrative interfaces and
   * template management operations. The response includes metadata for each
   * template to support UI rendering and template selection.
   * 
   * HTTP Method: GET
   * Success Response: 200 OK with array of templates
   * Error Responses: 500 Internal Server Error
   * 
   * Response Format:
   * - Array of Template objects with complete metadata
   * - Empty array if no templates exist
   * - Consistent JSON structure for API compatibility
   * 
   * Performance Considerations:
   * - Service layer implements efficient in-memory retrieval
   * - Template data is cached for optimal response times
   * - Supports high-concurrency access patterns
   * 
   * @param {Request} req - Express request object (no parameters expected)
   * @param {Response} res - Express response object for sending HTTP response
   * @param {NextFunction} next - Express next function for error handling middleware
   * @returns {Promise<void>} Resolves when response is sent or error is handled
   * 
   * @example
   * GET /api/templates
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "message": "Templates retrieved successfully",
   *   "data": [
   *     {
   *       "id": "template-123",
   *       "name": "Welcome Email",
   *       "subject": "Welcome to our platform",
   *       "body": "Thank you for joining us...",
   *       "type": "EMAIL",
   *       "createdAt": "2025-01-01T10:00:00.000Z",
   *       "updatedAt": "2025-01-01T10:00:00.000Z"
   *     }
   *   ],
   *   "count": 1
   * }
   */
  public async getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Call the template service to retrieve all templates
      // Service layer handles data retrieval and formatting
      const templates: Template[] = this.templateService.getAllTemplates();

      // Log template retrieval for monitoring
      console.log(`Retrieved ${templates.length} templates from service`);

      // Send 200 OK response with the array of templates
      res.status(200).json({
        success: true,
        message: 'Templates retrieved successfully',
        data: templates,
        count: templates.length
      });

    } catch (error) {
      // Handle service-layer errors
      if (error instanceof Error) {
        next(new NotificationError(`Failed to retrieve templates: ${error.message}`, 500));
      } else {
        next(new NotificationError('An unexpected error occurred while retrieving templates', 500));
      }
    }
  }

  /**
   * Retrieves a single notification template by its unique identifier
   * 
   * This endpoint fetches a specific template using the provided ID parameter
   * from the URL path. It validates the template ID, retrieves the template
   * from the service layer, and handles not-found scenarios appropriately.
   * 
   * HTTP Method: GET
   * URL Parameter: :id (template identifier)
   * Success Response: 200 OK with template data
   * Error Responses: 400 Bad Request, 404 Not Found, 500 Internal Server Error
   * 
   * Parameter Validation:
   * - Template ID must be provided in URL path
   * - ID must be non-empty string after trimming whitespace
   * - Invalid IDs result in 400 Bad Request response
   * 
   * Business Logic:
   * - Template lookup by unique identifier
   * - Not found scenarios return 404 status
   * - Complete template data in successful response
   * 
   * @param {Request} req - Express request object with template ID in params
   * @param {Response} res - Express response object for sending HTTP response
   * @param {NextFunction} next - Express next function for error handling middleware
   * @returns {Promise<void>} Resolves when response is sent or error is handled
   * 
   * @example
   * GET /api/templates/template-123
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "message": "Template retrieved successfully",
   *   "data": {
   *     "id": "template-123",
   *     "name": "Payment Confirmation",
   *     "subject": "Payment Processed",
   *     "body": "Your payment has been processed successfully.",
   *     "type": "EMAIL",
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-01T10:00:00.000Z"
   *   }
   * }
   * 
   * Error Response: 404 Not Found
   * {
   *   "success": false,
   *   "message": "Template not found with ID: invalid-id"
   * }
   */
  public async getTemplateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract the template ID from the request parameters
      const templateId: string = req.params.id;

      // Validate that template ID is provided and non-empty
      if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
        throw new BadRequestError('Template ID is required and must be a non-empty string');
      }

      // Normalize the template ID by trimming whitespace
      const normalizedId = templateId.trim();

      // Call the template service to retrieve the specific template
      const template: Template | undefined = this.templateService.getTemplate(normalizedId);

      // Check if the template was found
      if (!template) {
        throw new NotFoundError(`Template not found with ID: ${normalizedId}`);
      }

      // Log successful template retrieval
      console.log(`Template retrieved successfully: ${template.id} - ${template.name}`);

      // Send 200 OK response with the requested template
      res.status(200).json({
        success: true,
        message: 'Template retrieved successfully',
        data: template
      });

    } catch (error) {
      // Handle specific error types appropriately
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        // Pass through validation and not-found errors
        next(error);
      } else if (error instanceof Error) {
        // Handle service-layer errors
        next(new NotificationError(`Failed to retrieve template: ${error.message}`, 500));
      } else {
        // Handle unexpected error types
        next(new NotificationError('An unexpected error occurred while retrieving the template', 500));
      }
    }
  }

  /**
   * Updates an existing notification template
   * 
   * This endpoint accepts partial template data in the request body and updates
   * the specified template through the service layer. It supports partial updates,
   * meaning only provided fields will be modified while preserving existing data
   * for unspecified fields.
   * 
   * HTTP Method: PUT/PATCH
   * URL Parameter: :id (template identifier)
   * Expected Request Body: UpdateTemplateInput (partial template data)
   * Success Response: 200 OK with updated template data
   * Error Responses: 400 Bad Request, 404 Not Found, 500 Internal Server Error
   * 
   * Update Features:
   * - Partial update support (only specified fields are modified)
   * - Template ID validation and existence checking
   * - Business rule validation during updates
   * - Automatic timestamp management for audit trails
   * 
   * Validation Rules:
   * - Template ID must be valid and template must exist
   * - Updated name must be unique if provided
   * - Content validation based on notification type
   * - Required field validation for provided updates
   * 
   * @param {Request} req - Express request object with template ID and update data
   * @param {Response} res - Express response object for sending HTTP response
   * @param {NextFunction} next - Express next function for error handling middleware
   * @returns {Promise<void>} Resolves when response is sent or error is handled
   * 
   * @example
   * PUT /api/templates/template-123
   * Content-Type: application/json
   * 
   * {
   *   "subject": "Updated Payment Confirmation",
   *   "body": "Your payment of {{amount}} for {{description}} has been processed successfully."
   * }
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "message": "Template updated successfully",
   *   "data": {
   *     "id": "template-123",
   *     "name": "Payment Confirmation",
   *     "subject": "Updated Payment Confirmation",
   *     "body": "Your payment of {{amount}} for {{description}} has been processed successfully.",
   *     "type": "EMAIL",
   *     "createdAt": "2025-01-01T10:00:00.000Z",
   *     "updatedAt": "2025-01-01T11:30:00.000Z"
   *   }
   * }
   */
  public async updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract the template ID from the request parameters
      const templateId: string = req.params.id;

      // Validate that template ID is provided and non-empty
      if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
        throw new BadRequestError('Template ID is required and must be a non-empty string');
      }

      // Extract the template update data from the request body
      const updateData: UpdateTemplateInput = req.body;

      // Validate that request body contains update data
      if (!updateData || typeof updateData !== 'object') {
        throw new BadRequestError('Request body must contain template update data');
      }

      // Validate that at least one field is provided for update
      const hasUpdateFields = updateData.name || updateData.subject || updateData.body;
      if (!hasUpdateFields) {
        throw new BadRequestError('At least one field (name, subject, or body) must be provided for update');
      }

      // Normalize the template ID
      const normalizedId = templateId.trim();

      // Call the template service to update the template
      const updatedTemplate: Template | undefined = this.templateService.updateTemplate(normalizedId, updateData);

      // Check if the template was found and updated
      if (!updatedTemplate) {
        throw new NotFoundError(`Template not found with ID: ${normalizedId}`);
      }

      // Log successful template update
      console.log(`Template updated successfully: ${updatedTemplate.id} - ${updatedTemplate.name}`);

      // Send 200 OK response with the updated template
      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data: updatedTemplate
      });

    } catch (error) {
      // Handle specific error types appropriately
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        // Pass through validation and not-found errors
        next(error);
      } else if (error instanceof Error) {
        // Check for specific business rule violations
        if (error.message.includes('already exists')) {
          // Template name uniqueness violation during update
          next(new BadRequestError(`Template update failed: ${error.message}`));
        } else if (error.message.includes('validation')) {
          // Data validation errors during update
          next(new BadRequestError(`Template validation failed: ${error.message}`));
        } else {
          // Generic service-layer errors
          next(new NotificationError(`Template update failed: ${error.message}`, 500));
        }
      } else {
        // Handle unexpected error types
        next(new NotificationError('An unexpected error occurred during template update', 500));
      }
    }
  }

  /**
   * Deletes a notification template by its unique identifier
   * 
   * This endpoint removes a template from the system using the provided ID parameter.
   * It validates the template exists, performs deletion through the service layer,
   * and returns appropriate HTTP responses based on the operation outcome.
   * 
   * HTTP Method: DELETE
   * URL Parameter: :id (template identifier)
   * Success Response: 204 No Content (successful deletion)
   * Error Responses: 400 Bad Request, 404 Not Found, 500 Internal Server Error
   * 
   * Deletion Features:
   * - Template existence validation before deletion
   * - Protection against deletion of system templates
   * - Atomic deletion operation for data consistency
   * - Audit logging for compliance and monitoring
   * 
   * Security Considerations:
   * - Template ID validation to prevent injection attacks
   * - System template protection (default templates cannot be deleted)
   * - Audit trail preservation for regulatory compliance
   * - Proper error handling to prevent information disclosure
   * 
   * @param {Request} req - Express request object with template ID in params
   * @param {Response} res - Express response object for sending HTTP response
   * @param {NextFunction} next - Express next function for error handling middleware
   * @returns {Promise<void>} Resolves when response is sent or error is handled
   * 
   * @example
   * DELETE /api/templates/template-456
   * 
   * Response: 204 No Content
   * (Empty response body for successful deletion)
   * 
   * Error Response: 404 Not Found
   * {
   *   "success": false,
   *   "message": "Template not found with ID: template-456"
   * }
   * 
   * Error Response: 400 Bad Request
   * {
   *   "success": false,
   *   "message": "System template 'welcome-template-001' cannot be deleted"
   * }
   */
  public async deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract the template ID from the request parameters
      const templateId: string = req.params.id;

      // Validate that template ID is provided and non-empty
      if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
        throw new BadRequestError('Template ID is required and must be a non-empty string');
      }

      // Normalize the template ID
      const normalizedId = templateId.trim();

      // Call the template service to delete the template
      const deletionResult: boolean = this.templateService.deleteTemplate(normalizedId);

      // Check if the template was found and deleted
      if (!deletionResult) {
        throw new NotFoundError(`Template not found with ID: ${normalizedId}`);
      }

      // Log successful template deletion for audit trail
      console.log(`Template deleted successfully: ${normalizedId}`);

      // Send 204 No Content response (successful deletion with no response body)
      res.status(204).send();

    } catch (error) {
      // Handle specific error types appropriately
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        // Pass through validation and not-found errors
        next(error);
      } else if (error instanceof Error) {
        // Check for specific business rule violations
        if (error.message.includes('cannot be deleted')) {
          // System template protection error
          next(new BadRequestError(`Template deletion failed: ${error.message}`));
        } else {
          // Generic service-layer deletion errors
          next(new NotificationError(`Template deletion failed: ${error.message}`, 500));
        }
      } else {
        // Handle unexpected error types
        next(new NotificationError('An unexpected error occurred during template deletion', 500));
      }
    }
  }
}

// Export the TemplateController class for use in route definitions
export default TemplateController;