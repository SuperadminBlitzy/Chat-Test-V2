/**
 * Blockchain Service - Main Entry Point
 * 
 * This file serves as the primary entry point for the blockchain microservice, implementing
 * F-009: Blockchain-based Settlement Network as part of the financial services platform.
 * 
 * The service provides secure, scalable blockchain-based settlement processing using
 * Hyperledger Fabric technology stack, designed for enterprise financial operations
 * with comprehensive compliance, monitoring, and audit capabilities.
 * 
 * Key Features:
 * - Microservices architecture with independent deployment and scaling
 * - Enterprise-grade error handling and graceful shutdown procedures
 * - Comprehensive audit logging for regulatory compliance (SOX, PCI DSS, GDPR)
 * - Performance monitoring and observability integration
 * - Security-first design with TLS encryption and access controls
 * 
 * @author Blockchain Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// Core Express application instance - contains all middleware, routes, and blockchain service logic
import app from './app';

// Configuration management - loads environment-specific settings, network profiles, and security policies
import { config } from './config';

// Enhanced logging utility with blockchain-specific methods and compliance features
import { logger } from './utils/logger';

/**
 * Server port configuration with fallback mechanism
 * 
 * Priority order:
 * 1. config.port (from environment variables and configuration files)
 * 2. 3010 (hardcoded fallback for blockchain services)
 * 
 * Port 3010 is specifically chosen for blockchain services to avoid conflicts
 * with other microservices in the financial platform (e.g., API Gateway on 3000,
 * Auth Service on 3001, Payment Service on 3002, etc.)
 */
const PORT = config.port || 3010;

/**
 * Application startup process with comprehensive error handling
 * 
 * This function implements enterprise-grade server initialization including:
 * - Graceful error handling with proper exit codes
 * - Detailed startup logging for monitoring and debugging
 * - Audit trail creation for compliance requirements
 * - Performance timing for operational metrics
 * - Security event logging for threat detection
 */
async function startServer(): Promise<void> {
  const startupStartTime = Date.now();
  
  logger.blockchain('Initiating blockchain service startup sequence', {
    service: config.service.name,
    version: config.service.version,
    environment: config.env,
    port: PORT,
    blockchainNetwork: config.network.networkName,
    tlsEnabled: config.security.enableTLS,
    complianceFrameworks: config.compliance.complianceFrameworks
  });

  try {
    // Start the HTTP server with the configured Express application
    const server = app.listen(PORT, () => {
      const startupDuration = Date.now() - startupStartTime;
      
      // Log successful startup with comprehensive metadata
      logger.info(`🚀 Blockchain service is running successfully on port ${PORT}`, {
        event_category: 'server_lifecycle',
        event_action: 'server_start',
        event_outcome: 'success',
        port: PORT,
        environment: config.env,
        service: config.service.name,
        version: config.service.version,
        networkName: config.network.networkName,
        startupDuration,
        pid: process.pid,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });

      // Log blockchain-specific startup information
      logger.blockchain('Blockchain settlement network service online', {
        networkName: config.network.networkName,
        tlsEnabled: config.network.tlsEnabled,
        organizationCount: config.network.organizations.length,
        channelCount: config.network.channels.length,
        peerCount: config.network.peers.length,
        ordererCount: config.network.orderers.length,
        discoveryEnabled: config.network.connectionOptions.discovery.enabled,
        blockchainNetwork: config.network.networkName
      });

      // Log performance metrics for monitoring
      logger.performance('Server startup completed', {
        operation: 'server_startup',
        duration: startupDuration,
        port: PORT,
        environment: config.env,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      });

      // Create audit log entry for compliance tracking
      logger.audit('Blockchain service started successfully', {
        event_type: 'service_lifecycle',
        event_action: 'service_start',
        event_outcome: 'success',
        service: config.service.name,
        version: config.service.version,
        environment: config.env,
        port: PORT,
        duration: startupDuration,
        complianceFramework: config.compliance.complianceFrameworks,
        dataClassification: config.compliance.dataClassification,
        retentionPeriod: config.compliance.retentionPeriod
      });

      // Log financial services specific metadata
      logger.financial('Settlement network service initialized', {
        transactionType: 'system_initialization',
        networkName: config.network.networkName,
        complianceStatus: 'active',
        riskScore: 0, // Low risk for service startup
        operationalMode: config.env === 'production' ? 'live' : 'test'
      });
    });

    // Configure server timeout settings for financial transaction processing
    // Extended timeouts are necessary for blockchain consensus operations
    server.timeout = 120000; // 2 minutes for complex blockchain operations
    server.keepAliveTimeout = 65000; // 65 seconds for connection keep-alive
    server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

    // Configure graceful shutdown handlers for production deployment
    setupGracefulShutdown(server);

  } catch (error) {
    const startupDuration = Date.now() - startupStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log critical startup failure
    logger.error('❌ Critical failure during blockchain service startup', {
      event_category: 'server_lifecycle',
      event_action: 'server_start',
      event_outcome: 'failure',
      error: errorMessage,
      stack: errorStack,
      port: PORT,
      environment: config.env,
      service: config.service.name,
      version: config.service.version,
      startupDuration,
      pid: process.pid
    });

    // Log security event for startup failure (potential security concern)
    logger.security('Blockchain service startup failure detected', {
      event_type: 'service_failure',
      threat_level: 'high',
      error: errorMessage,
      port: PORT,
      environment: config.env,
      service: config.service.name
    });

    // Create audit log entry for failed startup
    logger.audit('Blockchain service startup failed', {
      event_type: 'service_lifecycle',
      event_action: 'service_start',
      event_outcome: 'failure',
      service: config.service.name,
      version: config.service.version,
      environment: config.env,
      port: PORT,
      error: errorMessage,
      duration: startupDuration,
      complianceFramework: config.compliance.complianceFrameworks,
      dataClassification: config.compliance.dataClassification
    });

    // Log performance metrics for failed startup (for debugging and monitoring)
    logger.performance('Server startup failed', {
      operation: 'server_startup',
      duration: startupDuration,
      error: errorMessage,
      port: PORT,
      environment: config.env,
      memoryUsage: process.memoryUsage()
    });

    // Exit process with error code 1 to signal failure to container orchestration
    // This ensures proper handling by Kubernetes, Docker Compose, or other deployment systems
    logger.info('Terminating process due to startup failure', {
      exitCode: 1,
      reason: 'server_startup_failure'
    });
    
    process.exit(1);
  }
}

/**
 * Configures graceful shutdown handlers for production deployment
 * 
 * Implements enterprise-grade shutdown procedures including:
 * - Connection draining to complete in-flight requests
 * - Resource cleanup and connection closure
 * - Audit logging for compliance tracking
 * - Proper exit code handling for container orchestration
 * 
 * @param server - HTTP server instance to manage
 */
function setupGracefulShutdown(server: any): void {
  const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGQUIT', 'SIGHUP'] as const;

  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      const shutdownStartTime = Date.now();
      
      logger.info(`📡 Received ${signal} signal, initiating graceful shutdown`, {
        event_category: 'server_lifecycle',
        event_action: 'shutdown_initiated',
        signal,
        timestamp: new Date().toISOString()
      });

      // Log blockchain-specific shutdown information
      logger.blockchain('Blockchain service shutdown initiated', {
        signal,
        networkName: config.network.networkName,
        blockchainNetwork: config.network.networkName,
        environment: config.env
      });

      try {
        // Close the HTTP server and stop accepting new connections
        server.close(async () => {
          const shutdownDuration = Date.now() - shutdownStartTime;
          
          logger.info('✅ Blockchain service shutdown completed successfully', {
            event_category: 'server_lifecycle', 
            event_action: 'shutdown_completed',
            event_outcome: 'success',
            signal,
            duration: shutdownDuration,
            service: config.service.name,
            environment: config.env
          });

          // Log final blockchain service status
          logger.blockchain('Blockchain settlement network service offline', {
            networkName: config.network.networkName,
            shutdownReason: signal,
            blockchainNetwork: config.network.networkName,
            finalStatus: 'graceful_shutdown'
          });

          // Create audit log entry for shutdown completion
          logger.audit('Blockchain service shutdown completed', {
            event_type: 'service_lifecycle',
            event_action: 'service_stop',
            event_outcome: 'success',
            signal,
            duration: shutdownDuration,
            service: config.service.name,
            environment: config.env,
            complianceFramework: config.compliance.complianceFrameworks
          });

          // Log performance metrics for shutdown process
          logger.performance('Server shutdown completed', {
            operation: 'server_shutdown',
            duration: shutdownDuration,
            signal,
            environment: config.env
          });

          // Exit cleanly with success code
          process.exit(0);
        });

        // Set shutdown timeout to force exit if graceful shutdown takes too long
        // Critical for financial services to prevent hanging processes
        setTimeout(() => {
          logger.error('⚠️ Graceful shutdown timeout exceeded, forcing exit', {
            event_category: 'server_lifecycle',
            event_action: 'forced_shutdown',
            signal,
            timeout: 30000
          });

          logger.security('Forced shutdown due to timeout', {
            event_type: 'service_failure',
            threat_level: 'medium',
            signal,
            reason: 'shutdown_timeout'
          });

          process.exit(1);
        }, 30000); // 30 second timeout for graceful shutdown

      } catch (shutdownError) {
        const shutdownDuration = Date.now() - shutdownStartTime;
        const errorMessage = shutdownError instanceof Error ? shutdownError.message : String(shutdownError);

        logger.error('❌ Error during graceful shutdown', {
          event_category: 'server_lifecycle',
          event_action: 'shutdown_error',
          error: errorMessage,
          signal,
          duration: shutdownDuration
        });

        logger.security('Shutdown error detected', {
          event_type: 'service_failure',
          threat_level: 'medium',
          error: errorMessage,
          signal
        });

        // Force exit with error code
        process.exit(1);
      }
    });
  });
}

/**
 * Handle uncaught exceptions and unhandled promise rejections
 * Critical for financial services to prevent service interruption
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('🚨 Uncaught Exception detected', {
    event_category: 'error_handling',
    event_action: 'uncaught_exception',
    error: error.message,
    stack: error.stack,
    pid: process.pid
  });

  logger.security('Uncaught exception security event', {
    event_type: 'runtime_error',
    threat_level: 'critical',
    error: error.message
  });

  logger.audit('Service terminated due to uncaught exception', {
    event_type: 'service_lifecycle',
    event_action: 'service_crash',
    event_outcome: 'failure',
    error: error.message,
    complianceFramework: config.compliance.complianceFrameworks
  });

  // Allow some time for logs to be written before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  
  logger.error('🚨 Unhandled Promise Rejection detected', {
    event_category: 'error_handling',
    event_action: 'unhandled_rejection',
    reason: errorMessage,
    promise: promise.toString(),
    pid: process.pid
  });

  logger.security('Unhandled promise rejection security event', {
    event_type: 'runtime_error',
    threat_level: 'high',
    reason: errorMessage
  });

  logger.audit('Service error due to unhandled promise rejection', {
    event_type: 'service_lifecycle',
    event_action: 'service_error',
    event_outcome: 'failure',
    reason: errorMessage,
    complianceFramework: config.compliance.complianceFrameworks
  });
});

// Start the blockchain service
startServer().catch((error) => {
  // This catch block should not normally be reached due to try-catch in startServer,
  // but provides an additional safety net for unexpected startup failures
  logger.error('🚨 Unexpected error in server startup process', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});