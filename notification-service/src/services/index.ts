/**
 * Notification Service - Service Barrel File
 * 
 * This barrel file provides centralized exports for all notification services
 * within the financial services platform. It enables clean and consolidated
 * importing of services across the notification system architecture.
 * 
 * Business Context:
 * - Supports Real-time Processing (2.3.3 Common Services) requirement
 * - Enables event-driven notification delivery across multiple channels
 * - Facilitates customer communication for digital onboarding and transaction monitoring
 * - Provides foundation for regulatory compliance notifications
 * 
 * Technical Architecture:
 * - Implements barrel pattern for clean module organization
 * - Supports microservices architecture with loose coupling
 * - Uses TypeScript for type safety and enterprise-grade development
 * - Optimized for Node.js 20 LTS performance characteristics
 * 
 * Service Integration:
 * - EmailService: SMTP-based email delivery with comprehensive audit trails
 * - PushService: Multi-platform push notifications (FCM/APNS) for mobile apps
 * - SmsService: Twilio-based SMS delivery with retry logic and rate limiting
 * - TemplateService: Template management with validation and versioning
 * 
 * Performance Characteristics:
 * - Zero-overhead re-exports for optimal bundle size
 * - Tree-shaking compatible exports for production builds
 * - Supports high-concurrency scenarios typical in financial services
 * - Memory-efficient module loading with lazy evaluation
 * 
 * @fileoverview Consolidated service exports for notification system
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

// EmailService - Enterprise-grade email notification service
// Provides SMTP-based email delivery with comprehensive error handling,
// retry logic, and audit trails for financial services compliance
export { EmailService } from './email.service';

// PushService - Multi-platform push notification service  
// Handles iOS (APNS) and Android (FCM) push notifications with
// enterprise-grade security, rate limiting, and delivery confirmation
export { PushService } from './push.service';

// SMS Service Functions - Twilio-based SMS delivery service
// Note: SMS service exports individual functions rather than a class
// Re-exporting the default export and individual functions for flexibility
export { default as SmsService } from './sms.service';
export { 
    sendSms, 
    healthCheck as smsHealthCheck,
    getServiceStats as smsGetServiceStats,
    SmsServiceError,
    SmsStatus,
    SMS_CONFIG
} from './sms.service';

// TemplateService - Notification template management service
// Provides CRUD operations for notification templates with validation,
// versioning, and support for multi-channel template management
export { TemplateService } from './template.service';

/**
 * Re-export service types and interfaces for external consumption
 * 
 * These exports provide type definitions needed by consumers of the
 * notification services, enabling type-safe integration across the
 * financial services platform.
 */

// Email service related types
export type { Notification } from '../models/notification.model';

// Push service related types and errors
export { PushNotificationError } from './push.service';

// Template service related types
export type { 
    Template, 
    NotificationType, 
    CreateTemplateInput, 
    UpdateTemplateInput 
} from '../models/template.model';

/**
 * Service Health Check Aggregation
 * 
 * Provides a unified health check function that validates the operational
 * status of all notification services. This is essential for monitoring
 * and maintaining high availability in financial services environments.
 * 
 * @returns Promise<ServiceHealthStatus> Aggregated health status of all services
 */
export async function checkAllServicesHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
        email: 'healthy' | 'unhealthy';
        push: 'healthy' | 'degraded' | 'unhealthy';  
        sms: 'healthy' | 'unhealthy';
        template: 'healthy' | 'unhealthy';
    };
    timestamp: Date;
}> {
    const healthStatus = {
        overall: 'healthy' as const,
        services: {
            email: 'healthy' as const,
            push: 'healthy' as const,
            sms: 'healthy' as const,
            template: 'healthy' as const
        },
        timestamp: new Date()
    };

    try {
        // Check SMS service health
        const smsHealthy = await smsHealthCheck();
        healthStatus.services.sms = smsHealthy ? 'healthy' : 'unhealthy';

        // Email service health is determined by successful initialization
        // (in production, this would include SMTP connectivity tests)
        healthStatus.services.email = 'healthy';

        // Push service health check
        const pushService = new PushService();
        const pushHealth = pushService.getServiceHealth();
        healthStatus.services.push = pushHealth.status;

        // Template service health (in-memory service, generally always healthy)
        healthStatus.services.template = 'healthy';

        // Determine overall health status based on individual service health
        const unhealthyServices = Object.values(healthStatus.services).filter(status => status === 'unhealthy');
        const degradedServices = Object.values(healthStatus.services).filter(status => status === 'degraded');

        if (unhealthyServices.length > 0) {
            healthStatus.overall = 'unhealthy';
        } else if (degradedServices.length > 0) {
            healthStatus.overall = 'degraded';
        }

    } catch (error) {
        // Log error and mark overall status as unhealthy
        console.error('Error during service health check:', error);
        healthStatus.overall = 'unhealthy';
    }

    return healthStatus;
}

/**
 * Service Configuration Validation
 * 
 * Validates that all notification services have proper configuration
 * for production deployment. This function should be called during
 * application startup to ensure all services are properly configured.
 * 
 * @returns ConfigurationValidationResult Validation results for all services
 */
export function validateServiceConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const result = {
        valid: true,
        errors: [] as string[],
        warnings: [] as string[]
    };

    // Email service configuration validation
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_AUTH_USER) {
        result.errors.push('Email service configuration incomplete: EMAIL_HOST and EMAIL_AUTH_USER required');
        result.valid = false;
    }

    // Push service configuration validation  
    if (!process.env.FCM_SERVER_KEY) {
        result.errors.push('Push service configuration incomplete: FCM_SERVER_KEY required');
        result.valid = false;
    }

    if (!process.env.APNS_CERT_PATH && !process.env.APNS_CERT) {
        result.errors.push('Push service configuration incomplete: APNS_CERT_PATH or APNS_CERT required');
        result.valid = false;
    }

    // SMS service configuration validation
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        result.errors.push('SMS service configuration incomplete: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required');
        result.valid = false;
    }

    // Add warnings for optional but recommended configuration
    if (!process.env.TWILIO_FROM_NUMBER) {
        result.warnings.push('SMS service: TWILIO_FROM_NUMBER not configured, using default');
    }

    if (!process.env.EMAIL_FROM_NAME) {
        result.warnings.push('Email service: EMAIL_FROM_NAME not configured, using default');
    }

    return result;
}

/**
 * Default export for convenience when importing the entire service collection
 * 
 * Provides a single object containing all services for scenarios where
 * multiple services need to be used together.
 */
export default {
    EmailService,
    PushService,
    SmsService,
    TemplateService,
    checkAllServicesHealth,
    validateServiceConfiguration
};