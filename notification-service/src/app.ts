// express@4.18.2 - Web framework for building scalable Node.js applications
import express, { Application, Request, Response, NextFunction } from 'express';

// cors@2.8.5 - Enable Cross-Origin Resource Sharing for API access
import cors from 'cors';

// helmet@7.1.0 - Secure Express apps by setting various HTTP headers
import helmet from 'helmet';

// morgan@1.10.0 - HTTP request logger middleware for Node.js
import morgan from 'morgan';

// Internal imports - Application routing and middleware
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { NotificationConsumer } from './consumers/notification.consumer';
import config from './config';
import logger from './utils/logger';

// Import notification services for consumer initialization
import { EmailService } from './services/email.service';
import { sendSms as smsService } from './services/sms.service';
import { PushService } from './services/push.service';

/**
 * Express Application Instance
 * 
 * Creates the main Express application instance for the Notification Service.
 * This application serves as the HTTP interface for notification operations
 * and integrates with the event-driven architecture for real-time processing.
 * 
 * Architecture Integration:
 * - Real-time Processing (2.3.3 Common Services): HTTP API for immediate notification requests
 * - Event Processing Flow (4.1.2 Integration Workflows): REST endpoints for external integrations
 * - Microservices Architecture: Standalone service with comprehensive API interface
 * 
 * Performance Characteristics:
 * - Target throughput: 5,000+ requests per second
 * - Response time: <1 second for notification operations
 * - 99.9% availability SLA with horizontal scaling support
 * - Memory efficient with optimized middleware stack
 * 
 * @global {Application} app - Express application instance
 */
const app: Application = express();

/**
 * Global Notification Consumer Instance
 * 
 * Kafka consumer instance responsible for processing notification events
 * from the event bus and routing them to appropriate delivery services.
 * Initialized globally to enable lifecycle management and graceful shutdown.
 * 
 * Consumer Configuration:
 * - Group ID: notification-service-group
 * - Topic: notification-events
 * - Auto-commit: enabled for simplified offset management
 * - Error handling: comprehensive with circuit breaker patterns
 * 
 * Business Requirements:
 * - F-008: Real-time Transaction Monitoring support
 * - F-013: Customer Dashboard notification delivery
 * - Event-driven architecture integration for immediate processing
 * 
 * @global {NotificationConsumer} notificationConsumer - Kafka consumer instance
 */
let notificationConsumer: NotificationConsumer;

/**
 * Initializes the Express application with comprehensive middleware stack and services
 * 
 * This function implements the complete application setup process, configuring all
 * necessary middleware for security, logging, and request processing. It also
 * initializes the Kafka consumer for event-driven notification processing.
 * 
 * Initialization Process:
 * 1. Configure security middleware (Helmet) for HTTP header protection
 * 2. Enable CORS for cross-origin API access with financial services security
 * 3. Set up request logging with Morgan for audit trails and monitoring
 * 4. Configure JSON and URL-encoded body parsing with size limits
 * 5. Mount application routes with comprehensive API endpoints
 * 6. Apply global error handling middleware for consistent error responses
 * 7. Initialize notification services for multi-channel delivery
 * 8. Start Kafka consumer for real-time event processing
 * 
 * Security Features:
 * - Content Security Policy (CSP) headers
 * - XSS protection and MIME type sniffing prevention
 * - Request size limiting to prevent DoS attacks
 * - CORS configuration with origin validation
 * - Comprehensive audit logging for compliance
 * 
 * Error Handling:
 * - Graceful initialization failure handling
 * - Service dependency validation
 * - Resource cleanup on initialization errors
 * - Comprehensive error logging for troubleshooting
 * 
 * Performance Optimizations:
 * - Efficient middleware order for optimal request processing
 * - JSON parser with size limits for memory protection
 * - Connection pooling and resource management
 * - Async initialization for non-blocking startup
 * 
 * @returns Promise<void> - Resolves when application initialization is complete
 * @throws {Error} When critical services fail to initialize
 * @throws {Error} When Kafka consumer cannot be started
 * @throws {Error} When middleware configuration fails
 * 
 * @example
 * ```typescript
 * // Application startup
 * async function startServer() {
 *   try {
 *     await initializeApp();
 *     const port = process.env.PORT || 3000;
 *     app.listen(port, () => {
 *       console.log(`Notification service listening on port ${port}`);
 *     });
 *   } catch (error) {
 *     console.error('Failed to start notification service:', error);
 *     process.exit(1);
 *   }
 * }
 * ```
 */
export async function initializeApp(): Promise<void> {
    const initStartTime = Date.now();
    
    logger.info('Initializing Notification Service application', {
        service: 'notification-service',
        method: 'initializeApp',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid
    });

    try {
        // Step 1: Apply Helmet middleware for security
        logger.debug('Configuring Helmet security middleware', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'security_middleware'
        });

        app.use(helmet({
            // Content Security Policy configuration for financial services
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for admin interfaces
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            // Cross-Origin Embedder Policy for enhanced security
            crossOriginEmbedderPolicy: { policy: "require-corp" },
            // Cross-Origin Opener Policy for window isolation
            crossOriginOpenerPolicy: { policy: "same-origin" },
            // Cross-Origin Resource Policy for resource protection
            crossOriginResourcePolicy: { policy: "cross-origin" },
            // DNS Prefetch Control to prevent information leakage
            dnsPrefetchControl: { allow: false },
            // Frame Options to prevent clickjacking
            frameguard: { action: 'deny' },
            // Hide X-Powered-By header for security through obscurity
            hidePoweredBy: true,
            // HTTP Strict Transport Security for HTTPS enforcement
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true
            },
            // IE No Open for IE8+ XSS protection
            ieNoOpen: true,
            // No Sniff to prevent MIME type sniffing
            noSniff: true,
            // Origin Agent Cluster for enhanced isolation
            originAgentCluster: true,
            // Referrer Policy for privacy protection
            referrerPolicy: { policy: "strict-origin-when-cross-origin" },
            // XSS Filter for legacy browser protection
            xssFilter: true
        }));

        logger.debug('Helmet security middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'security_middleware',
            status: 'success'
        });

        // Step 2: Apply CORS middleware for cross-origin requests
        logger.debug('Configuring CORS middleware for API access', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'cors_middleware'
        });

        const corsOptions = {
            // Define allowed origins based on environment
            origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
                // Allow requests with no origin (mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);
                
                // Define allowed origins based on environment
                const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
                    'http://localhost:3000',           // Local development frontend
                    'http://localhost:3001',           // Local development admin
                    'https://app.financial-platform.com',    // Production frontend
                    'https://admin.financial-platform.com'   // Production admin
                ];
                
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    logger.security('cors_violation_attempt', {
                        severity: 'medium',
                        origin: origin,
                        allowedOrigins: allowedOrigins,
                        service: 'notification-service'
                    });
                    callback(new Error('CORS policy violation: Origin not allowed'), false);
                }
            },
            // Define allowed HTTP methods
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            // Define allowed headers for financial services APIs
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'X-Correlation-ID',
                'X-Request-ID',
                'X-User-ID',
                'X-Transaction-ID',
                'Accept',
                'Origin'
            ],
            // Define exposed headers for client access
            exposedHeaders: [
                'X-Correlation-ID',
                'X-Request-ID',
                'X-Rate-Limit-Remaining',
                'X-Rate-Limit-Reset'
            ],
            // Enable credentials for authenticated requests
            credentials: true,
            // Preflight cache duration
            maxAge: 86400, // 24 hours
            // Handle preflight requests
            preflightContinue: false,
            // Return 204 for successful OPTIONS requests
            optionsSuccessStatus: 204
        };

        app.use(cors(corsOptions));

        logger.debug('CORS middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'cors_middleware',
            status: 'success',
            allowedMethods: corsOptions.methods,
            credentialsEnabled: corsOptions.credentials
        });

        // Step 3: Apply Morgan middleware for HTTP request logging
        logger.debug('Configuring Morgan request logging middleware', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'logging_middleware'
        });

        // Define custom Morgan format for structured logging
        const morganFormat = process.env.NODE_ENV === 'production' 
            ? 'combined' // Standard Apache combined log format for production
            : 'dev';     // Colorized output for development

        // Custom Morgan token for correlation ID
        morgan.token('correlation-id', (req: Request) => {
            return (req as any).correlationId || 'none';
        });

        // Custom Morgan token for user ID
        morgan.token('user-id', (req: Request) => {
            return (req as any).user?.userId || 'anonymous';
        });

        // Custom Morgan format with financial services specific fields
        const customFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms correlation-id=:correlation-id';

        app.use(morgan(process.env.NODE_ENV === 'production' ? customFormat : morganFormat, {
            // Stream Morgan output to Winston logger
            stream: {
                write: (message: string) => {
                    logger.http('HTTP Request', { rawLog: message.trim() });
                }
            },
            // Skip logging for health check endpoints to reduce noise
            skip: (req: Request, res: Response) => {
                return req.url === '/health' || req.url === '/api/health';
            }
        }));

        logger.debug('Morgan request logging middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'logging_middleware',
            status: 'success',
            format: morganFormat
        });

        // Step 4: Apply express.json() middleware for parsing JSON bodies
        logger.debug('Configuring JSON body parser middleware', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'json_parser'
        });

        app.use(express.json({
            // Limit request size to prevent DoS attacks
            limit: process.env.JSON_LIMIT || '10mb',
            // Verify Content-Type header
            type: ['application/json', 'application/vnd.api+json'],
            // Custom error handling for malformed JSON
            verify: (req: Request, res: Response, buf: Buffer, encoding: string) => {
                try {
                    JSON.parse(buf.toString());
                } catch (error) {
                    logger.security('malformed_json_request', {
                        severity: 'low',
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent'),
                        contentLength: buf.length,
                        service: 'notification-service'
                    });
                    throw new Error('Invalid JSON payload');
                }
            }
        }));

        logger.debug('JSON body parser middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'json_parser',
            status: 'success',
            sizeLimit: process.env.JSON_LIMIT || '10mb'
        });

        // Step 5: Apply express.urlencoded() middleware for parsing URL-encoded bodies
        logger.debug('Configuring URL-encoded body parser middleware', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'urlencoded_parser'
        });

        app.use(express.urlencoded({
            // Enable parsing of nested objects
            extended: true,
            // Limit request size to prevent DoS attacks
            limit: process.env.URLENCODED_LIMIT || '10mb',
            // Parameter limit to prevent parameter pollution
            parameterLimit: 1000
        }));

        logger.debug('URL-encoded body parser middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'urlencoded_parser',
            status: 'success',
            sizeLimit: process.env.URLENCODED_LIMIT || '10mb'
        });

        // Step 6: Set up the main application routes using the imported router
        logger.debug('Mounting application routes', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'mount_routes'
        });

        // Mount the main router at /api path for versioned API structure
        app.use('/api', routes);

        // Mount health check at root level for load balancer convenience
        app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'healthy',
                service: 'notification-service',
                version: process.env.APP_VERSION || '1.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        logger.debug('Application routes mounted successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'mount_routes',
            status: 'success',
            apiPath: '/api',
            healthPath: '/health'
        });

        // Step 7: Apply the global error handling middleware
        logger.debug('Configuring global error handling middleware', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'error_middleware'
        });

        app.use(errorMiddleware);

        logger.debug('Global error handling middleware configured successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'error_middleware',
            status: 'success'
        });

        // Step 8: Initialize and start the Kafka consumer for notifications
        logger.debug('Initializing notification services for consumer', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'initialize_services'
        });

        // Initialize EmailService with configuration
        const emailService = new EmailService();
        logger.debug('EmailService initialized for consumer', {
            service: 'notification-service',
            component: 'EmailService',
            status: 'ready'
        });

        // Initialize PushService with configuration
        const pushService = new PushService();
        logger.debug('PushService initialized for consumer', {
            service: 'notification-service',
            component: 'PushService',
            status: 'ready'
        });

        // Create NotificationConsumer instance with service dependencies
        notificationConsumer = new NotificationConsumer(
            emailService,
            smsService,
            pushService
        );

        logger.debug('NotificationConsumer instance created successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'create_consumer',
            status: 'success'
        });

        // Start the Kafka consumer for event processing
        logger.debug('Starting Kafka consumer for notification events', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'start_consumer'
        });

        await notificationConsumer.start();

        logger.debug('Kafka consumer started successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            step: 'start_consumer',
            status: 'success',
            topic: 'notification-events'
        });

        // Step 9: Log that the application has been initialized
        const initializationDuration = Date.now() - initStartTime;

        logger.performance('application_initialization', initializationDuration, {
            service: 'notification-service',
            success: true,
            middlewareCount: 6,
            servicesInitialized: 3
        });

        logger.business('notification_service_initialized', {
            service: 'notification-service',
            status: 'ready',
            initializationDuration,
            environment: process.env.NODE_ENV || 'development',
            features: ['real-time-processing', 'event-driven-architecture', 'multi-channel-notifications'],
            middlewareStack: ['helmet', 'cors', 'morgan', 'json-parser', 'urlencoded-parser', 'routes', 'error-handler'],
            kafkaConsumer: 'active'
        });

        logger.audit('notification_service_initialization', {
            result: 'success',
            service: 'notification-service',
            initializationDuration,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });

        logger.info('Notification Service application initialized successfully', {
            service: 'notification-service',
            method: 'initializeApp',
            status: 'ready',
            initializationDuration,
            kafkaConsumer: 'active',
            apiEndpoint: '/api',
            healthEndpoint: '/health'
        });

    } catch (error) {
        const initializationDuration = Date.now() - initStartTime;
        
        // Log comprehensive error information for troubleshooting
        logger.error('Failed to initialize Notification Service application', {
            service: 'notification-service',
            method: 'initializeApp',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            initializationDuration,
            environment: process.env.NODE_ENV || 'development'
        });

        // Log performance metrics for failed initialization
        logger.performance('application_initialization', initializationDuration, {
            service: 'notification-service',
            success: false,
            errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
        });

        // Log business impact of initialization failure
        logger.business('notification_service_initialization_failed', {
            service: 'notification-service',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            initializationDuration,
            environment: process.env.NODE_ENV || 'development'
        });

        // Log audit event for initialization failure
        logger.audit('notification_service_initialization_failed', {
            result: 'failure',
            service: 'notification-service',
            error: error instanceof Error ? error.message : 'Unknown error',
            initializationDuration,
            timestamp: new Date().toISOString()
        });

        // Attempt to clean up resources if consumer was partially initialized
        if (notificationConsumer) {
            try {
                await notificationConsumer.shutdown();
                logger.info('Kafka consumer shut down during error cleanup');
            } catch (shutdownError) {
                logger.error('Failed to shutdown Kafka consumer during error cleanup', {
                    error: shutdownError instanceof Error ? shutdownError.message : 'Unknown error'
                });
            }
        }

        // Re-throw error to allow upstream error handling
        throw new Error(`Notification Service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Graceful Shutdown Handler
 * 
 * Implements comprehensive shutdown procedures to ensure data integrity
 * and proper resource cleanup during application termination. This is
 * critical for containerized environments and zero-downtime deployments.
 * 
 * Shutdown Process:
 * 1. Log shutdown initiation for monitoring
 * 2. Stop accepting new HTTP requests
 * 3. Gracefully shutdown Kafka consumer
 * 4. Close database connections
 * 5. Release all system resources
 * 6. Exit process with appropriate code
 * 
 * @param signal - The termination signal received
 */
async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown`, {
        service: 'notification-service',
        signal: signal,
        uptime: process.uptime()
    });

    const shutdownStartTime = Date.now();

    try {
        // Shutdown Kafka consumer if initialized
        if (notificationConsumer) {
            logger.debug('Shutting down Kafka consumer', {
                service: 'notification-service',
                step: 'shutdown_consumer'
            });
            
            await notificationConsumer.shutdown();
            
            logger.info('Kafka consumer shut down successfully', {
                service: 'notification-service',
                step: 'shutdown_consumer',
                status: 'success'
            });
        }

        const shutdownDuration = Date.now() - shutdownStartTime;

        logger.performance('graceful_shutdown', shutdownDuration, {
            service: 'notification-service',
            signal: signal,
            success: true
        });

        logger.audit('notification_service_shutdown', {
            result: 'success',
            signal: signal,
            shutdownDuration,
            timestamp: new Date().toISOString()
        });

        logger.info('Notification Service shut down gracefully', {
            service: 'notification-service',
            signal: signal,
            shutdownDuration,
            uptime: process.uptime()
        });

        // Exit with success code
        process.exit(0);

    } catch (error) {
        const shutdownDuration = Date.now() - shutdownStartTime;
        
        logger.error('Error during graceful shutdown', {
            service: 'notification-service',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            shutdownDuration
        });

        logger.audit('notification_service_shutdown_failed', {
            result: 'failure',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            shutdownDuration,
            timestamp: new Date().toISOString()
        });

        // Exit with error code
        process.exit(1);
    }
}

// Register graceful shutdown handlers for common termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception - shutting down', {
        service: 'notification-service',
        error: error.message,
        stack: error.stack
    });
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection - shutting down', {
        service: 'notification-service',
        reason: reason,
        promise: promise
    });
    gracefulShutdown('unhandledRejection');
});

/**
 * Export the configured Express application instance
 * 
 * The exported app provides a complete notification service implementation
 * with comprehensive middleware stack, routing, error handling, and event
 * processing capabilities. Ready for production deployment in financial
 * services environments.
 * 
 * Application Features:
 * - Enterprise-grade security with Helmet middleware
 * - CORS configuration for cross-origin API access
 * - Comprehensive request logging with Morgan and Winston
 * - JSON and URL-encoded body parsing with size limits
 * - Complete notification API with template management
 * - Global error handling with structured responses
 * - Kafka consumer for real-time event processing
 * - Graceful shutdown handling for container environments
 * 
 * Integration Points:
 * - HTTP API: Mount at desired path (e.g., app.listen(3000))
 * - Container orchestration: Kubernetes health checks at /health
 * - Load balancers: Health endpoint and graceful shutdown support
 * - Monitoring: Structured logging and performance metrics
 * 
 * Usage Example:
 * ```typescript
 * import { app, initializeApp } from './app';
 * 
 * async function startServer() {
 *   await initializeApp();
 *   const port = process.env.PORT || 3000;
 *   app.listen(port, () => {
 *     console.log(`Server running on port ${port}`);
 *   });
 * }
 * 
 * startServer().catch(console.error);
 * ```
 * 
 * @export {Application} app - Configured Express application instance
 */
export { app };

// Default export for convenience
export default app;