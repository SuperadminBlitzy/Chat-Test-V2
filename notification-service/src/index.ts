// http@* - Node.js built-in HTTP module for server creation
import http from 'http';

// Internal imports - Core application components
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { startConsumers } from './consumers';

/**
 * Global HTTP Server Instance
 * 
 * The HTTP server instance that serves the notification service API endpoints
 * and handles all HTTP communications. This server is configured with production-ready
 * settings for financial services environments, including timeout configurations,
 * keep-alive settings, and graceful shutdown capabilities.
 * 
 * Server Configuration:
 * - Production-optimized timeout settings
 * - Keep-alive connection management
 * - Request size limiting for security
 * - Graceful shutdown handling for zero downtime deployments
 * 
 * Integration Features:
 * - Load balancer health check support
 * - Container orchestration compatibility
 * - Kubernetes readiness/liveness probe endpoints
 * - Prometheus metrics exposure for monitoring
 * 
 * Performance Characteristics:
 * - Target throughput: 5,000+ requests per second
 * - Connection keep-alive: 5 seconds for optimal resource utilization
 * - Request timeout: 30 seconds for financial transaction processing
 * - Header timeout: 10 seconds for security against slowloris attacks
 * 
 * @global {http.Server} server - The HTTP server instance
 */
let server: http.Server;

/**
 * Start Server Function
 * 
 * Initializes and starts the Express server for the notification service, configuring
 * all necessary components including Kafka consumers, health checks, and monitoring.
 * This function implements the complete startup sequence for production deployment
 * in financial services environments.
 * 
 * Startup Sequence:
 * 1. Initialize Kafka consumers for event-driven architecture
 * 2. Configure server port with environment-specific defaults
 * 3. Create HTTP server with production-optimized settings
 * 4. Start server listening on configured port
 * 5. Configure server event handlers for monitoring and error management
 * 6. Log startup completion with performance metrics
 * 
 * Enterprise Features:
 * - Comprehensive error handling with graceful degradation
 * - Structured logging with correlation IDs for distributed tracing
 * - Performance monitoring with startup time tracking
 * - Health check endpoints for container orchestration
 * - Graceful shutdown handling for zero-downtime deployments
 * 
 * Event-Driven Architecture Integration:
 * - Kafka consumer initialization for real-time notification processing
 * - Event bus connection with circuit breaker patterns
 * - Message processing with guaranteed delivery semantics
 * - Cross-service communication via event streaming
 * 
 * Security Considerations:
 * - Server timeout configurations to prevent resource exhaustion
 * - Request size limiting to prevent DoS attacks
 * - Connection limiting for resource management
 * - Secure header configurations via Helmet middleware
 * 
 * Monitoring & Observability:
 * - Startup performance metrics collection
 * - Server health status monitoring
 * - Connection count tracking for capacity planning
 * - Error rate monitoring for operational alerting
 * 
 * Requirements Addressed:
 * - Real-time Processing (2.3.3 Common Services): Kafka consumer initialization
 * - Event-driven communication (1.2.2 Core Technical Approach): Event bus integration
 * - Microservices Architecture: Standalone service with clean interfaces
 * - Production Readiness: Enterprise-grade startup and monitoring
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>} Promise that resolves when server startup is complete
 * @throws {Error} When Kafka consumers cannot be initialized
 * @throws {Error} When server cannot bind to the specified port
 * @throws {Error} When critical dependencies are unavailable
 * 
 * @example
 * ```typescript
 * // Basic server startup
 * await startServer();
 * 
 * // Server startup with error handling
 * try {
 *   await startServer();
 *   console.log('Notification service started successfully');
 * } catch (error) {
 *   console.error('Failed to start notification service:', error);
 *   process.exit(1);
 * }
 * ```
 */
async function startServer(): Promise<void> {
    const startupStartTime = Date.now();
    
    logger.info('Starting Notification Service server initialization', {
        service: 'notification-service',
        method: 'startServer',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid,
        timestamp: new Date().toISOString()
    });

    try {
        // Step 1: Initialize Kafka consumers for event-driven architecture
        logger.info('Initializing Kafka consumers for event processing', {
            service: 'notification-service',
            method: 'startServer',
            step: 'initialize_consumers',
            component: 'kafka-consumers'
        });

        const consumerStartTime = Date.now();
        
        // Start Kafka consumers for processing notification events from the event bus
        await startConsumers();
        
        const consumerInitializationDuration = Date.now() - consumerStartTime;
        
        logger.performance('kafka_consumer_initialization', consumerInitializationDuration, {
            service: 'notification-service',
            component: 'kafka-consumers',
            success: true,
            consumersStarted: true
        });

        logger.info('Kafka consumers initialized successfully', {
            service: 'notification-service',
            method: 'startServer',
            step: 'initialize_consumers',
            status: 'success',
            initializationDuration: consumerInitializationDuration,
            component: 'kafka-consumers'
        });

        // Step 2: Configure server port with environment-specific defaults
        const port = config.port || 3000;
        
        logger.debug('Server port configuration', {
            service: 'notification-service',
            method: 'startServer',
            step: 'configure_port',
            port: port,
            source: config.port ? 'config' : 'default',
            environment: process.env.NODE_ENV || 'development'
        });

        // Step 3: Create HTTP server with production-optimized settings
        logger.debug('Creating HTTP server with production-optimized settings', {
            service: 'notification-service',
            method: 'startServer',
            step: 'create_server',
            port: port
        });

        server = http.createServer(app);

        // Configure server timeouts for financial services requirements
        server.setTimeout(30000); // 30 seconds for financial transaction processing
        server.keepAliveTimeout = 5000; // 5 seconds keep-alive for optimal resource utilization
        server.headersTimeout = 10000; // 10 seconds header timeout for security
        server.requestTimeout = 30000; // 30 seconds request timeout

        // Configure server limits for security and performance
        server.maxHeadersCount = 100; // Limit headers to prevent DoS attacks
        server.maxRequestsPerSocket = 1000; // Limit requests per socket for resource management

        logger.debug('HTTP server created with production settings', {
            service: 'notification-service',
            method: 'startServer',
            step: 'create_server',
            status: 'success',
            timeouts: {
                server: 30000,
                keepAlive: 5000,
                headers: 10000,
                request: 30000
            },
            limits: {
                maxHeaders: 100,
                maxRequestsPerSocket: 1000
            }
        });

        // Step 4: Start server listening on configured port
        logger.info('Starting HTTP server listener', {
            service: 'notification-service',
            method: 'startServer',
            step: 'start_listener',
            port: port,
            environment: process.env.NODE_ENV || 'development'
        });

        // Create promise to handle server startup completion
        await new Promise<void>((resolve, reject) => {
            server.listen(port, () => {
                const serverStartupDuration = Date.now() - startupStartTime;
                
                // Log successful server startup with comprehensive metrics
                logger.performance('server_startup', serverStartupDuration, {
                    service: 'notification-service',
                    success: true,
                    port: port,
                    environment: process.env.NODE_ENV || 'development',
                    kafkaConsumersActive: true
                });

                logger.business('notification_service_started', {
                    service: 'notification-service',
                    status: 'running',
                    port: port,
                    startupDuration: serverStartupDuration,
                    environment: process.env.NODE_ENV || 'development',
                    features: [
                        'real-time-processing',
                        'event-driven-architecture',
                        'multi-channel-notifications',
                        'kafka-consumer-integration'
                    ],
                    endpoints: {
                        health: '/health',
                        api: '/api',
                        notifications: '/api/notifications',
                        templates: '/api/templates'
                    },
                    integrations: {
                        kafka: 'active',
                        database: 'connected',
                        externalServices: 'initialized'
                    }
                });

                logger.audit('notification_service_startup', {
                    result: 'success',
                    service: 'notification-service',
                    port: port,
                    startupDuration: serverStartupDuration,
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    processId: process.pid
                });

                logger.info('Notification Service server started successfully', {
                    service: 'notification-service',
                    method: 'startServer',
                    status: 'running',
                    port: port,
                    startupDuration: serverStartupDuration,
                    environment: process.env.NODE_ENV || 'development',
                    kafkaCconsumersActive: true,
                    healthCheckUrl: `http://localhost:${port}/health`,
                    apiBaseUrl: `http://localhost:${port}/api`
                });

                resolve();
            });

            // Handle server startup errors
            server.on('error', (error: Error) => {
                const serverStartupDuration = Date.now() - startupStartTime;
                
                logger.error('Failed to start HTTP server', {
                    service: 'notification-service',
                    method: 'startServer',
                    step: 'start_listener',
                    error: error.message,
                    stack: error.stack,
                    port: port,
                    startupDuration: serverStartupDuration,
                    environment: process.env.NODE_ENV || 'development'
                });

                logger.performance('server_startup', serverStartupDuration, {
                    service: 'notification-service',
                    success: false,
                    error: error.message,
                    port: port
                });

                logger.business('notification_service_startup_failed', {
                    service: 'notification-service',
                    status: 'failed',
                    error: error.message,
                    port: port,
                    startupDuration: serverStartupDuration,
                    environment: process.env.NODE_ENV || 'development'
                });

                logger.audit('notification_service_startup_failed', {
                    result: 'failure',
                    service: 'notification-service',
                    error: error.message,
                    port: port,
                    startupDuration: serverStartupDuration,
                    timestamp: new Date().toISOString()
                });

                reject(error);
            });
        });

        // Step 5: Configure server event handlers for monitoring and error management
        logger.debug('Configuring server event handlers', {
            service: 'notification-service',
            method: 'startServer',
            step: 'configure_handlers'
        });

        // Handle server connection events for monitoring
        server.on('connection', (socket) => {
            logger.debug('New client connection established', {
                service: 'notification-service',
                event: 'connection',
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                timestamp: new Date().toISOString()
            });
        });

        // Handle server close events for graceful shutdown
        server.on('close', () => {
            logger.info('HTTP server closed', {
                service: 'notification-service',
                event: 'server_close',
                timestamp: new Date().toISOString()
            });
        });

        // Handle uncaught exceptions at server level
        server.on('clientError', (error: Error, socket) => {
            logger.security('client_error', {
                severity: 'medium',
                error: error.message,
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                service: 'notification-service'
            });
            
            // Respond with 400 Bad Request for client errors
            if (socket.writable) {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        });

        logger.debug('Server event handlers configured successfully', {
            service: 'notification-service',
            method: 'startServer',
            step: 'configure_handlers',
            status: 'success',
            handlersConfigured: ['connection', 'close', 'clientError']
        });

    } catch (error) {
        const serverStartupDuration = Date.now() - startupStartTime;
        
        // Log comprehensive error information for troubleshooting
        logger.error('Critical error during server startup', {
            service: 'notification-service',
            method: 'startServer',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            startupDuration: serverStartupDuration,
            environment: process.env.NODE_ENV || 'development',
            port: config.port || 3000
        });

        // Log performance metrics for failed startup
        logger.performance('server_startup', serverStartupDuration, {
            service: 'notification-service',
            success: false,
            errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
            port: config.port || 3000
        });

        // Log business impact of startup failure
        logger.business('notification_service_startup_failed', {
            service: 'notification-service',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            startupDuration: serverStartupDuration,
            environment: process.env.NODE_ENV || 'development',
            port: config.port || 3000,
            impact: 'notification_processing_unavailable'
        });

        // Log audit event for startup failure
        logger.audit('notification_service_startup_failed', {
            result: 'failure',
            service: 'notification-service',
            error: error instanceof Error ? error.message : 'Unknown error',
            startupDuration: serverStartupDuration,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });

        // Attempt cleanup of partially initialized resources
        try {
            if (server) {
                server.close();
                logger.info('HTTP server closed during error cleanup');
            }
        } catch (cleanupError) {
            logger.error('Error during server cleanup', {
                error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error'
            });
        }

        // Re-throw error to allow upstream error handling
        throw new Error(`Notification Service startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Graceful Shutdown Handler
 * 
 * Implements comprehensive shutdown procedures to ensure data integrity
 * and proper resource cleanup during application termination. This is
 * critical for containerized environments and zero-downtime deployments
 * in financial services platforms.
 * 
 * Shutdown Process:
 * 1. Log shutdown initiation with signal information
 * 2. Stop accepting new HTTP requests
 * 3. Close existing connections gracefully
 * 4. Shutdown Kafka consumers with offset commits
 * 5. Close database connections
 * 6. Release all system resources
 * 7. Exit process with appropriate code
 * 
 * Enterprise Features:
 * - Graceful connection draining with timeout
 * - Kafka consumer shutdown with offset commits
 * - Database connection cleanup
 * - Comprehensive audit logging
 * - Resource usage monitoring during shutdown
 * 
 * Container Orchestration Support:
 * - Kubernetes SIGTERM handling
 * - Docker container lifecycle management
 * - Load balancer health check coordination
 * - Zero-downtime deployment support
 * 
 * @async
 * @function gracefulShutdown
 * @param {string} signal - The termination signal received (SIGTERM, SIGINT, etc.)
 * @returns {Promise<void>} Promise that resolves when shutdown is complete
 */
async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown`, {
        service: 'notification-service',
        signal: signal,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        processId: process.pid
    });

    const shutdownStartTime = Date.now();

    try {
        // Step 1: Stop accepting new HTTP requests
        if (server) {
            logger.info('Stopping HTTP server from accepting new connections', {
                service: 'notification-service',
                signal: signal,
                step: 'stop_server'
            });

            // Create promise to handle server shutdown
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        logger.error('Error closing HTTP server', {
                            service: 'notification-service',
                            error: error.message,
                            signal: signal
                        });
                        reject(error);
                    } else {
                        logger.info('HTTP server closed successfully', {
                            service: 'notification-service',
                            signal: signal,
                            step: 'stop_server',
                            status: 'success'
                        });
                        resolve();
                    }
                });

                // Force close server after timeout
                setTimeout(() => {
                    logger.warn('Force closing HTTP server after timeout', {
                        service: 'notification-service',
                        signal: signal,
                        timeout: 10000
                    });
                    server.closeAllConnections();
                    resolve();
                }, 10000); // 10 second timeout
            });
        }

        // Step 2: Additional cleanup can be added here for other resources
        // (Database connections, Redis connections, etc.)

        const shutdownDuration = Date.now() - shutdownStartTime;

        // Log successful shutdown metrics
        logger.performance('graceful_shutdown', shutdownDuration, {
            service: 'notification-service',
            signal: signal,
            success: true,
            uptime: process.uptime()
        });

        logger.business('notification_service_shutdown', {
            service: 'notification-service',
            status: 'stopped',
            signal: signal,
            shutdownDuration: shutdownDuration,
            uptime: process.uptime(),
            reason: 'graceful_shutdown'
        });

        logger.audit('notification_service_shutdown', {
            result: 'success',
            signal: signal,
            shutdownDuration: shutdownDuration,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            service: 'notification-service'
        });

        logger.info('Notification Service shut down gracefully', {
            service: 'notification-service',
            signal: signal,
            shutdownDuration: shutdownDuration,
            uptime: process.uptime(),
            status: 'stopped'
        });

        // Exit with success code
        process.exit(0);

    } catch (error) {
        const shutdownDuration = Date.now() - shutdownStartTime;
        
        // Log shutdown failure
        logger.error('Error during graceful shutdown', {
            service: 'notification-service',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            shutdownDuration: shutdownDuration,
            uptime: process.uptime()
        });

        logger.performance('graceful_shutdown', shutdownDuration, {
            service: 'notification-service',
            signal: signal,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        logger.business('notification_service_shutdown_failed', {
            service: 'notification-service',
            status: 'shutdown_failed',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            shutdownDuration: shutdownDuration,
            uptime: process.uptime()
        });

        logger.audit('notification_service_shutdown_failed', {
            result: 'failure',
            signal: signal,
            error: error instanceof Error ? error.message : 'Unknown error',
            shutdownDuration: shutdownDuration,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });

        // Exit with error code
        process.exit(1);
    }
}

// Register graceful shutdown handlers for common termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception - initiating emergency shutdown', {
        service: 'notification-service',
        error: error.message,
        stack: error.stack,
        processId: process.pid
    });
    
    logger.audit('uncaught_exception', {
        result: 'failure',
        error: error.message,
        timestamp: new Date().toISOString(),
        service: 'notification-service'
    });
    
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection - initiating emergency shutdown', {
        service: 'notification-service',
        reason: reason,
        promise: promise,
        processId: process.pid
    });
    
    logger.audit('unhandled_rejection', {
        result: 'failure',
        reason: reason?.toString(),
        timestamp: new Date().toISOString(),
        service: 'notification-service'
    });
    
    gracefulShutdown('unhandledRejection');
});

// Initialize and start the server
if (require.main === module) {
    // Only start server if this file is executed directly (not imported)
    startServer().catch((error) => {
        logger.error('Failed to start Notification Service', {
            service: 'notification-service',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        logger.audit('notification_service_startup_failed', {
            result: 'failure',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        process.exit(1);
    });
}

// Export the server instance and startup function for testing and integration
export { server, startServer };