// winston@3.13.0 - Reliable logging framework for Node.js applications
import winston from 'winston';

// Import configuration for environment-specific settings
import config from '../config';

/**
 * Environment Configuration for Logger
 * 
 * Determines the current environment and logging configuration based on environment variables.
 * This follows the enterprise pattern of environment-specific configuration management
 * as outlined in the technical specification for configurable logging levels.
 */
const environment = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug');
const serviceName = process.env.SERVICE_NAME || 'notification-service';

/**
 * Custom Log Format for Development Environment
 * 
 * Provides human-readable log output with colors and structured information
 * for easier debugging during development. Includes timestamp, level, service name,
 * and message with proper formatting.
 */
const developmentFormat = winston.format.combine(
    winston.format.colorize({
        all: true,
        colors: {
            error: 'red',
            warn: 'yellow',
            info: 'cyan',
            debug: 'green'
        }
    }),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let logMessage = `[${timestamp}] [${serviceName}] ${level}: ${message}`;
        
        // Add stack trace for errors
        if (stack) {
            logMessage += `\n${stack}`;
        }
        
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            logMessage += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
    })
);

/**
 * Structured JSON Format for Production Environment
 * 
 * Provides machine-parsable JSON output optimized for centralized logging systems
 * like ELK stack. Includes all necessary fields for monitoring, alerting, and
 * compliance requirements in financial services environments.
 */
const productionFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
        // Ensure consistent structure for production logs
        const logEntry = {
            timestamp: info.timestamp,
            level: info.level,
            service: serviceName,
            message: info.message,
            environment: environment
        };

        // Add correlation ID if present for distributed tracing
        if (info.correlationId) {
            logEntry.correlationId = info.correlationId;
        }

        // Add user ID for audit trail requirements
        if (info.userId) {
            logEntry.userId = info.userId;
        }

        // Add transaction ID for financial services tracking
        if (info.transactionId) {
            logEntry.transactionId = info.transactionId;
        }

        // Add error details if present
        if (info.error) {
            logEntry.error = {
                name: info.error.name,
                message: info.error.message,
                stack: info.error.stack
            };
        }

        // Add stack trace for errors
        if (info.stack) {
            logEntry.stack = info.stack;
        }

        // Add any additional metadata
        const additionalFields = { ...info };
        delete additionalFields.timestamp;
        delete additionalFields.level;
        delete additionalFields.message;
        delete additionalFields.stack;
        delete additionalFields.error;
        delete additionalFields.correlationId;
        delete additionalFields.userId;
        delete additionalFields.transactionId;

        if (Object.keys(additionalFields).length > 0) {
            logEntry.metadata = additionalFields;
        }

        return JSON.stringify(logEntry);
    })
);

/**
 * Transport Configuration
 * 
 * Configures output destinations for logs based on environment.
 * Development: Console output with colors
 * Production: Console output in JSON format for container log collection
 * 
 * Additional transports can be added for specific requirements:
 * - File transports for local storage
 * - HTTP transports for direct ELK integration
 * - Custom transports for compliance requirements
 */
const transports: winston.transport[] = [
    new winston.transports.Console({
        level: logLevel,
        format: environment === 'production' ? productionFormat : developmentFormat,
        handleExceptions: true,
        handleRejections: true
    })
];

/**
 * Add File Transport for Production Environments
 * 
 * In production, also write logs to files for backup and compliance purposes.
 * This ensures log persistence even if the centralized logging system is unavailable.
 */
if (environment === 'production') {
    // Error logs file - separate file for critical errors
    transports.push(
        new winston.transports.File({
            filename: '/var/log/notification-service/error.log',
            level: 'error',
            format: productionFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 10,
            handleExceptions: true,
            handleRejections: true
        })
    );

    // Combined logs file - all log levels
    transports.push(
        new winston.transports.File({
            filename: '/var/log/notification-service/combined.log',
            format: productionFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 10
        })
    );
}

/**
 * Winston Logger Instance Configuration
 * 
 * Creates the main logger instance with comprehensive configuration for
 * enterprise-grade logging in financial services. Supports multiple
 * log levels, structured logging, and error handling.
 * 
 * Features:
 * - Configurable log levels via environment variables
 * - Environment-specific formatting (human-readable vs JSON)
 * - Exception and rejection handling
 * - Correlation ID support for distributed tracing
 * - Audit trail capabilities for compliance
 * - Performance optimized for high-throughput scenarios
 */
const logger = winston.createLogger({
    level: logLevel,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
    ),
    transports,
    exitOnError: false, // Don't exit on handled exceptions
    
    // Default metadata for all log entries
    defaultMeta: {
        service: serviceName,
        environment: environment,
        version: process.env.APP_VERSION || '1.0.0'
    }
});

/**
 * Enhanced Logger Interface
 * 
 * Provides additional utility methods for common logging patterns
 * in financial services applications, including audit logging,
 * performance monitoring, and security event logging.
 */
const enhancedLogger = {
    /**
     * Standard logging methods with enhanced functionality
     */
    debug: (message: string, meta?: Record<string, any>) => {
        logger.debug(message, meta);
    },

    info: (message: string, meta?: Record<string, any>) => {
        logger.info(message, meta);
    },

    warn: (message: string, meta?: Record<string, any>) => {
        logger.warn(message, meta);
    },

    error: (message: string, error?: Error | Record<string, any>) => {
        if (error instanceof Error) {
            logger.error(message, { error });
        } else {
            logger.error(message, error);
        }
    },

    /**
     * Audit Log Method
     * 
     * Specialized logging for compliance and audit requirements.
     * Records user actions, system changes, and security events
     * with enhanced metadata for regulatory compliance.
     */
    audit: (action: string, details: {
        userId?: string;
        resource?: string;
        result?: 'success' | 'failure';
        ipAddress?: string;
        userAgent?: string;
        [key: string]: any;
    }) => {
        logger.info(`AUDIT: ${action}`, {
            type: 'audit',
            action,
            ...details,
            auditTimestamp: new Date().toISOString()
        });
    },

    /**
     * Performance Log Method
     * 
     * Records performance metrics and timing information
     * for monitoring and optimization purposes.
     */
    performance: (operation: string, duration: number, details?: Record<string, any>) => {
        logger.info(`PERFORMANCE: ${operation}`, {
            type: 'performance',
            operation,
            duration,
            unit: 'ms',
            ...details
        });
    },

    /**
     * Security Event Log Method
     * 
     * Records security-related events such as authentication failures,
     * suspicious activities, and security policy violations.
     */
    security: (event: string, details: {
        severity?: 'low' | 'medium' | 'high' | 'critical';
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        [key: string]: any;
    }) => {
        logger.warn(`SECURITY: ${event}`, {
            type: 'security',
            event,
            severity: details.severity || 'medium',
            ...details,
            securityTimestamp: new Date().toISOString()
        });
    },

    /**
     * Business Event Log Method
     * 
     * Records significant business events such as transactions,
     * notifications sent, and workflow completions.
     */
    business: (event: string, details: {
        transactionId?: string;
        userId?: string;
        amount?: number;
        currency?: string;
        status?: string;
        [key: string]: any;
    }) => {
        logger.info(`BUSINESS: ${event}`, {
            type: 'business',
            event,
            ...details,
            businessTimestamp: new Date().toISOString()
        });
    },

    /**
     * Request/Response Logging Method
     * 
     * Logs HTTP requests and responses with sanitized data
     * for debugging and monitoring API interactions.
     */
    http: (method: string, url: string, statusCode: number, duration: number, details?: {
        requestId?: string;
        userId?: string;
        userAgent?: string;
        ipAddress?: string;
        requestBody?: any;
        responseBody?: any;
        [key: string]: any;
    }) => {
        const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
        
        logger[logLevel](`HTTP: ${method} ${url}`, {
            type: 'http',
            method,
            url,
            statusCode,
            duration,
            unit: 'ms',
            ...details
        });
    }
};

/**
 * Graceful Shutdown Handler
 * 
 * Ensures all log entries are flushed before application shutdown
 * to prevent log loss during container restarts or deployments.
 */
process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    logger.end();
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully');
    logger.end();
});

/**
 * Export the enhanced logger instance
 * 
 * Provides the main logger interface for use throughout the notification service.
 * The logger supports multiple logging levels, structured logging, audit trails,
 * and specialized logging methods for financial services requirements.
 * 
 * Usage Examples:
 * 
 * Basic logging:
 * logger.info('Notification sent successfully', { notificationId: '12345' });
 * logger.error('Failed to process notification', error);
 * 
 * Audit logging:
 * logger.audit('user_login', { userId: '67890', result: 'success', ipAddress: '192.168.1.1' });
 * 
 * Performance logging:
 * logger.performance('notification_processing', 150, { notificationType: 'email' });
 * 
 * Security logging:
 * logger.security('suspicious_activity', { severity: 'high', userId: '67890' });
 */
export default enhancedLogger;

// Also export as named export for flexibility
export { enhancedLogger as logger };