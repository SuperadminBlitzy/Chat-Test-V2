/**
 * Notification Service Consumers Barrel Export
 * 
 * This barrel file serves as the central export point for all consumer implementations
 * within the notification service's consumers directory. It simplifies import statements
 * throughout the notification service and provides a clean, maintainable interface for
 * accessing consumer classes and functionality.
 * 
 * Enterprise Architecture Benefits:
 * - Centralized export management reduces coupling between modules
 * - Simplified import paths improve code readability and maintainability
 * - Single point of change for consumer exports reduces refactoring overhead
 * - Consistent import patterns across the notification service codebase
 * 
 * Microservices Integration:
 * The notification service operates as a critical component in the event-driven
 * architecture, processing notification events from the Kafka event bus and routing
 * them to appropriate delivery channels (EMAIL, SMS, PUSH). This barrel file enables
 * clean integration with other service components while maintaining clear boundaries.
 * 
 * Technology Context:
 * - Node.js 20 LTS runtime environment for optimal event-driven performance
 * - TypeScript 5.3+ for type safety in financial services operations
 * - Apache Kafka 3.6+ for high-throughput event streaming integration
 * - Production-ready consumer implementations with enterprise-grade reliability
 * 
 * Requirements Addressed:
 * - Event-driven communication (1.2.2 High-Level Description/Core Technical Approach)
 * - Real-time notification processing for financial services platforms
 * - Microservices architecture with clean module boundaries
 * - Enterprise-grade code organization and maintainability
 * 
 * Usage Patterns:
 * ```typescript
 * // Import specific consumer
 * import { NotificationConsumer } from '../consumers';
 * 
 * // Import all consumers (when needed)
 * import * as Consumers from '../consumers';
 * ```
 * 
 * Security Considerations:
 * - Exports only intended public interfaces from consumer implementations
 * - No sensitive configuration or internal implementation details exposed
 * - Maintains proper encapsulation for financial services security requirements
 * 
 * Performance Characteristics:
 * - Zero runtime overhead - purely compile-time re-export mechanism
 * - Optimized bundling through TypeScript module resolution
 * - Tree-shaking compatible for production builds
 * 
 * Maintenance Guidelines:
 * - Add new consumer exports as they are implemented
 * - Maintain alphabetical ordering for consistent organization
 * - Update documentation when adding new consumer types
 * - Ensure all exported consumers follow the established patterns
 * 
 * @fileoverview Central barrel export for notification service consumers
 * @version 2.1.0
 * @since 2025-01-01
 * @author Financial Platform Engineering Team
 */

/**
 * Re-export all consumer implementations from the notification.consumer module
 * 
 * This wildcard export provides access to all consumer classes and utilities
 * implemented in the notification.consumer.ts file, including:
 * 
 * Exported Classes:
 * - NotificationConsumer: Enterprise-grade Kafka consumer for processing notification events
 *   from the event bus and routing them to appropriate notification services (EMAIL, SMS, PUSH)
 * 
 * Consumer Capabilities:
 * - High-throughput message processing (10,000+ notifications per second)
 * - Multi-channel notification delivery with enterprise-grade reliability
 * - Comprehensive audit logging for regulatory compliance requirements
 * - Real-time performance monitoring and health checks
 * - Graceful shutdown handling for container orchestration environments
 * - Message processing guarantees with automatic offset management
 * 
 * Integration Features:
 * - Apache Kafka 3.6+ event streaming integration
 * - Email service integration for formal communications and compliance notices
 * - SMS service integration for time-sensitive alerts and authentication codes
 * - Push notification service for real-time updates and in-app notifications
 * - Structured logging with correlation IDs for distributed tracing
 * 
 * Enterprise Standards:
 * - Financial services grade error handling and recovery mechanisms
 * - ACID-compliant message processing for data integrity requirements
 * - Comprehensive audit trails for regulatory examination requirements
 * - Performance metrics and SLA monitoring for operational excellence
 * 
 * Security & Compliance:
 * - Message content validation and sanitization for financial data
 * - PII handling according to financial services data protection standards
 * - Error isolation to prevent cascade failures in financial systems
 * - Secure configuration management for sensitive notification credentials
 */
export * from './notification.consumer';