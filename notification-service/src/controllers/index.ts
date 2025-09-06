/**
 * Controllers Index - Central Barrel File for Notification Service Controllers
 * 
 * This file serves as the central export hub for all controller modules within the 
 * notification service microservice. It implements the barrel export pattern to 
 * simplify imports across the application and provide a clean, maintainable 
 * interface for accessing controller functionality.
 * 
 * Architecture Context:
 * - Part of the microservices architecture supporting F-008 (Real-time Transaction Monitoring)
 * - Enables real-time processing of notifications for financial transaction monitoring
 * - Supports event-driven architecture for high-throughput notification processing
 * - Integrates with common services: Authentication, Data Validation, Audit Logging
 * 
 * Business Context:
 * - Facilitates real-time customer notifications for transaction monitoring alerts
 * - Supports regulatory compliance through centralized notification management
 * - Enables fraud detection notifications and customer protection alerts
 * - Provides foundation for personalized financial service communications
 * 
 * Technical Implementation:
 * - TypeScript 5.3+ with strict type checking for enterprise-grade reliability
 * - Follows controller-service-repository pattern for clean architecture
 * - Implements centralized export pattern for improved maintainability
 * - Supports high-concurrency notification processing (5,000+ requests/sec)
 * 
 * Performance Characteristics:
 * - Optimized for financial services throughput requirements
 * - <500ms response time requirement for real-time processing compliance
 * - Memory-efficient controller instantiation and management
 * - Supports concurrent access patterns for high-volume scenarios
 * 
 * Security Considerations:
 * - All controllers implement enterprise-grade input validation
 * - Proper error handling to prevent information leakage
 * - Audit logging integration for compliance requirements
 * - Rate limiting support through middleware integration
 * 
 * Maintenance & Extensibility:
 * - Centralized exports simplify controller management and updates
 * - Easy addition of new controllers without breaking existing imports
 * - Consistent interface for route definition and dependency injection
 * - Supports future enhancement with IoC container integration
 * 
 * Integration Points:
 * - Route definitions import controllers through this barrel file
 * - Service layer integration through dependency injection
 * - Middleware integration for cross-cutting concerns
 * - Event-driven architecture integration for real-time processing
 * 
 * @fileoverview Central barrel export file for notification service controllers
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 * @module Controllers
 */

// Import controller classes from their respective modules
// These imports use relative paths to maintain module isolation and ensure
// proper dependency resolution within the notification service microservice

/**
 * Import NotificationController for handling notification-related HTTP requests
 * 
 * The NotificationController manages the complete lifecycle of notifications
 * including creation, delivery, status tracking, and historical querying.
 * It supports multiple notification channels (EMAIL, SMS, PUSH) and integrates
 * with the real-time transaction monitoring system for fraud detection alerts.
 * 
 * Key Responsibilities:
 * - RESTful endpoint management for notification operations
 * - Real-time notification processing and delivery coordination
 * - Integration with AI-powered risk assessment for fraud notifications
 * - Support for high-throughput notification scenarios
 * - Comprehensive error handling and status reporting
 * 
 * Performance Features:
 * - Async/await pattern for non-blocking request processing
 * - Support for batch notification operations
 * - Real-time delivery status tracking and reporting
 * - Integration with event-driven architecture for scalability
 */
import { NotificationController } from './notification.controller';

/**
 * Import TemplateController for managing notification template operations
 * 
 * The TemplateController provides comprehensive template management functionality
 * supporting the creation, modification, and management of notification templates
 * across multiple communication channels. It enables standardized communications
 * for regulatory compliance and personalized customer experiences.
 * 
 * Key Responsibilities:
 * - Template CRUD operations with comprehensive validation
 * - Multi-channel template support (EMAIL, SMS, PUSH)
 * - Template versioning and audit trail management
 * - Integration with regulatory compliance requirements
 * - Support for dynamic content placeholders and personalization
 * 
 * Business Features:
 * - Standardized communication templates for regulatory compliance
 * - Support for personalized financial service communications
 * - Template inheritance and composition for complex scenarios
 * - Multi-language template support for global operations
 */
import { TemplateController } from './template.controller';

// Export all controller classes for use throughout the notification service
// These exports provide a clean, centralized interface for importing controllers
// in route definitions, dependency injection configurations, and testing scenarios

/**
 * Re-export NotificationController for external consumption
 * 
 * This export enables clean imports in route definitions and other application
 * components that need to instantiate or reference the NotificationController.
 * The controller supports real-time notification processing requirements and
 * integrates with the broader microservices architecture for event-driven
 * notification delivery.
 * 
 * Usage Example:
 * ```typescript
 * import { NotificationController } from '../controllers';
 * const notificationController = new NotificationController();
 * ```
 * 
 * Integration Points:
 * - Route definitions: '/api/notifications/*' endpoints
 * - Event handlers: Real-time notification triggers
 * - Middleware: Authentication, validation, rate limiting
 * - Services: Integration with NotificationService and external APIs
 */
export { NotificationController };

/**
 * Re-export TemplateController for external consumption
 * 
 * This export provides access to comprehensive template management functionality
 * for notification standardization and regulatory compliance. The controller
 * supports enterprise-grade template operations with full audit trails and
 * validation capabilities.
 * 
 * Usage Example:
 * ```typescript
 * import { TemplateController } from '../controllers';
 * const templateController = new TemplateController();
 * ```
 * 
 * Integration Points:
 * - Route definitions: '/api/templates/*' endpoints
 * - Administrative interfaces: Template management UI
 * - Compliance systems: Regulatory template requirements
 * - Services: Integration with TemplateService and storage layers
 */
export { TemplateController };

/**
 * Default export providing all controllers as a unified object
 * 
 * This default export pattern provides an alternative import mechanism
 * for scenarios where all controllers need to be accessed together,
 * such as in dependency injection configurations or comprehensive
 * testing scenarios.
 * 
 * Usage Example:
 * ```typescript
 * import Controllers from '../controllers';
 * const notificationController = new Controllers.NotificationController();
 * const templateController = new Controllers.TemplateController();
 * ```
 * 
 * Benefits:
 * - Single import for all controller functionality
 * - Namespace organization for large-scale applications
 * - Easy integration with IoC containers and dependency injection
 * - Simplified testing and mock implementations
 */
export default {
  NotificationController,
  TemplateController
};

/**
 * Type definitions for exported controllers
 * 
 * These type exports provide TypeScript type information for the controllers,
 * enabling better type safety and developer experience when working with
 * the notification service controllers in other parts of the application.
 */
export type { NotificationController as NotificationControllerType };
export type { TemplateController as TemplateControllerType };

/**
 * Controller registry for dynamic instantiation and configuration
 * 
 * This registry provides metadata about available controllers for scenarios
 * requiring dynamic controller discovery, dependency injection configuration,
 * or automated route generation based on controller capabilities.
 * 
 * Features:
 * - Controller metadata for automated configuration
 * - Support for dependency injection frameworks
 * - Dynamic route generation capabilities
 * - Testing and mock configuration support
 */
export const CONTROLLER_REGISTRY = {
  notification: {
    name: 'NotificationController',
    controller: NotificationController,
    endpoints: [
      'POST /notifications',
      'GET /notifications',
      'GET /notifications/:id',
      'PUT /notifications/:id/status',
      'DELETE /notifications/:id'
    ],
    features: ['real-time-processing', 'multi-channel', 'fraud-detection'],
    dependencies: ['NotificationService', 'AuditService']
  },
  template: {
    name: 'TemplateController', 
    controller: TemplateController,
    endpoints: [
      'POST /templates',
      'GET /templates',
      'GET /templates/:id',
      'PUT /templates/:id',
      'DELETE /templates/:id'
    ],
    features: ['template-management', 'validation', 'audit-trail'],
    dependencies: ['TemplateService', 'ValidationService']
  }
} as const;

/**
 * Controller factory function for dependency injection scenarios
 * 
 * This factory function provides a standardized way to instantiate controllers
 * with proper dependency injection, configuration, and initialization. It supports
 * enterprise-grade patterns for scalable application architecture.
 * 
 * @template T - Controller type to instantiate
 * @param controllerName - Name of the controller to create
 * @param dependencies - Optional dependencies to inject
 * @returns Properly initialized controller instance
 * 
 * Usage Example:
 * ```typescript
 * const notificationController = createController('notification', { 
 *   logger: loggerService,
 *   metrics: metricsService 
 * });
 * ```
 */
export function createController<T extends keyof typeof CONTROLLER_REGISTRY>(
  controllerName: T,
  dependencies?: Record<string, any>
): InstanceType<typeof CONTROLLER_REGISTRY[T]['controller']> {
  const controllerConfig = CONTROLLER_REGISTRY[controllerName];
  const ControllerClass = controllerConfig.controller;
  
  // In a full dependency injection implementation, this would inject
  // the provided dependencies into the controller constructor
  return new ControllerClass() as InstanceType<typeof ControllerClass>;
}