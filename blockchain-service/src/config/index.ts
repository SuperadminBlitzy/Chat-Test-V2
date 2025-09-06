import * as dotenv from 'dotenv'; // ^16.4.5 - Environment variable management for secure configuration loading
import { getNetworkConfig, NetworkConfiguration } from './network';
import { logger } from '../utils/logger';

// Load environment variables from .env file before accessing process.env
// This ensures all required configuration is available during initialization
dotenv.config();

/**
 * Interface defining the structure of the main blockchain service configuration
 * Consolidates settings from various configuration sources for centralized access
 */
interface BlockchainServiceConfig {
  /** Current runtime environment (development, staging, production) */
  env: string;
  
  /** Port number for the blockchain service HTTP server */
  port: number;
  
  /** Hyperledger Fabric network configuration object containing connection profiles and settings */
  network: NetworkConfiguration;
  
  /** Service identification and metadata */
  service: {
    name: string;
    version: string;
    description: string;
  };
  
  /** Security configuration for the blockchain service */
  security: {
    enableTLS: boolean;
    corsEnabled: boolean;
    rateLimitEnabled: boolean;
    maxRequestSize: string;
  };
  
  /** Database and storage configuration */
  storage: {
    enablePersistence: boolean;
    walletBackup: boolean;
    dataRetentionDays: number;
  };
  
  /** Monitoring and observability configuration */
  monitoring: {
    enableMetrics: boolean;
    enableTracing: boolean;
    healthCheckInterval: number;
  };
  
  /** Compliance and audit configuration */
  compliance: {
    enableAuditLogging: boolean;
    dataClassification: string;
    retentionPeriod: number;
    complianceFrameworks: string[];
  };
}

/**
 * Environment variable configuration with secure defaults
 * Implements financial services security best practices and compliance requirements
 */
const environmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  SERVICE_NAME: process.env.SERVICE_NAME || 'blockchain-service',
  SERVICE_VERSION: process.env.SERVICE_VERSION || '1.0.0',
  
  // Security configuration
  ENABLE_TLS: process.env.ENABLE_TLS === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
  MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '10mb',
  
  // Storage and persistence
  ENABLE_PERSISTENCE: process.env.ENABLE_PERSISTENCE !== 'false',
  WALLET_BACKUP_ENABLED: process.env.WALLET_BACKUP_ENABLED !== 'false',
  DATA_RETENTION_DAYS: parseInt(process.env.DATA_RETENTION_DAYS || '2555', 10), // 7 years for financial compliance
  
  // Monitoring and observability
  ENABLE_METRICS: process.env.ENABLE_METRICS !== 'false',
  ENABLE_TRACING: process.env.ENABLE_TRACING !== 'false',
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // 30 seconds
  
  // Compliance and audit
  AUDIT_LOGGING_ENABLED: process.env.AUDIT_LOGGING_ENABLED !== 'false',
  DATA_CLASSIFICATION: process.env.DATA_CLASSIFICATION || 'confidential',
  COMPLIANCE_FRAMEWORKS: (process.env.COMPLIANCE_FRAMEWORKS || 'SOX,PCI_DSS,GDPR,Basel_III').split(',')
};

/**
 * Validates the port configuration to ensure it's within acceptable ranges
 * Financial services require specific port configurations for security compliance
 */
function validatePort(port: number): number {
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid port configuration: ${port}. Port must be between 1 and 65535.`);
  }
  
  // Warn about common reserved ports that may cause conflicts
  const reservedPorts = [22, 23, 25, 53, 80, 110, 443, 993, 995];
  if (reservedPorts.includes(port)) {
    logger.warn('Using reserved port number', {
      port,
      warning: 'This port is commonly reserved for system services',
      recommendation: 'Consider using a port above 1024 for application services'
    });
  }
  
  logger.blockchain('Port configuration validated', {
    port,
    environment: environmentConfig.NODE_ENV,
    blockchainNetwork: 'financial-services-network'
  });
  
  return port;
}

/**
 * Validates the environment configuration to ensure compliance with enterprise standards
 * Implements security checks and regulatory compliance validation
 */
function validateEnvironment(env: string): string {
  const validEnvironments = ['development', 'dev', 'staging', 'stage', 'production', 'prod', 'test', 'testing'];
  
  if (!validEnvironments.includes(env.toLowerCase())) {
    logger.warn('Unknown environment detected', {
      environment: env,
      validEnvironments,
      defaulting: 'development'
    });
    return 'development';
  }
  
  // Additional security checks for production environment
  if (env.toLowerCase() === 'production' || env.toLowerCase() === 'prod') {
    if (!environmentConfig.ENABLE_TLS) {
      throw new Error('TLS must be enabled in production environment for financial services compliance');
    }
    
    if (environmentConfig.NODE_ENV !== 'production') {
      logger.warn('Environment mismatch detected', {
        configuredEnv: env,
        nodeEnv: environmentConfig.NODE_ENV,
        warning: 'NODE_ENV should match the configured environment in production'
      });
    }
  }
  
  logger.blockchain('Environment configuration validated', {
    environment: env,
    tlsEnabled: environmentConfig.ENABLE_TLS,
    blockchainNetwork: 'financial-services-network'
  });
  
  return env.toLowerCase();
}

/**
 * Initializes and validates the complete blockchain service configuration
 * Consolidates settings from environment variables, network configuration, and security policies
 * 
 * This function implements enterprise-grade configuration management including:
 * - Comprehensive validation of all configuration parameters
 * - Security policy enforcement for financial services compliance
 * - Detailed audit logging for regulatory requirements
 * - Error handling with proper logging and monitoring
 * - Support for multiple deployment environments
 * 
 * @returns Complete blockchain service configuration object
 * @throws Error if any critical configuration is invalid or missing
 */
function initializeConfiguration(): BlockchainServiceConfig {
  const startTime = Date.now();
  
  logger.blockchain('Initializing blockchain service configuration', {
    environment: environmentConfig.NODE_ENV,
    service: environmentConfig.SERVICE_NAME,
    version: environmentConfig.SERVICE_VERSION,
    blockchainNetwork: 'financial-services-network'
  });
  
  try {
    // Validate core configuration parameters
    const validatedEnv = validateEnvironment(environmentConfig.NODE_ENV);
    const validatedPort = validatePort(environmentConfig.PORT);
    
    // Load and validate network configuration
    const networkConfig = getNetworkConfig();
    
    // Construct the complete configuration object
    const config: BlockchainServiceConfig = {
      env: validatedEnv,
      port: validatedPort,
      network: networkConfig,
      
      service: {
        name: environmentConfig.SERVICE_NAME,
        version: environmentConfig.SERVICE_VERSION,
        description: 'Hyperledger Fabric blockchain service for secure financial settlement processing'
      },
      
      security: {
        enableTLS: environmentConfig.ENABLE_TLS,
        corsEnabled: validatedEnv !== 'production', // Disable CORS in production unless explicitly configured
        rateLimitEnabled: environmentConfig.RATE_LIMIT_ENABLED,
        maxRequestSize: environmentConfig.MAX_REQUEST_SIZE
      },
      
      storage: {
        enablePersistence: environmentConfig.ENABLE_PERSISTENCE,
        walletBackup: environmentConfig.WALLET_BACKUP_ENABLED,
        dataRetentionDays: environmentConfig.DATA_RETENTION_DAYS
      },
      
      monitoring: {
        enableMetrics: environmentConfig.ENABLE_METRICS,
        enableTracing: environmentConfig.ENABLE_TRACING,
        healthCheckInterval: environmentConfig.HEALTH_CHECK_INTERVAL
      },
      
      compliance: {
        enableAuditLogging: environmentConfig.AUDIT_LOGGING_ENABLED,
        dataClassification: environmentConfig.DATA_CLASSIFICATION,
        retentionPeriod: environmentConfig.DATA_RETENTION_DAYS,
        complianceFrameworks: environmentConfig.COMPLIANCE_FRAMEWORKS
      }
    };
    
    // Validate configuration consistency
    if (config.network.tlsEnabled && !config.security.enableTLS) {
      logger.warn('Configuration inconsistency detected', {
        issue: 'Network TLS enabled but service TLS disabled',
        networkTLS: config.network.tlsEnabled,
        serviceTLS: config.security.enableTLS,
        recommendation: 'Enable service TLS to match network configuration'
      });
    }
    
    // Security validation for production environment
    if (config.env === 'production') {
      if (!config.security.enableTLS) {
        throw new Error('TLS must be enabled in production for financial services compliance');
      }
      
      if (!config.compliance.enableAuditLogging) {
        throw new Error('Audit logging must be enabled in production for regulatory compliance');
      }
      
      if (config.compliance.retentionPeriod < 2555) { // 7 years minimum
        logger.warn('Data retention period may not meet regulatory requirements', {
          currentRetention: config.compliance.retentionPeriod,
          recommendedMinimum: 2555,
          regulation: 'Financial services typically require 7+ years retention'
        });
      }
    }
    
    const initializationTime = Date.now() - startTime;
    
    logger.blockchain('Blockchain service configuration initialized successfully', {
      environment: config.env,
      port: config.port,
      networkName: config.network.networkName,
      tlsEnabled: config.security.enableTLS,
      auditEnabled: config.compliance.enableAuditLogging,
      initializationTime,
      blockchainNetwork: config.network.networkName || 'financial-services-network'
    });
    
    logger.performance('Configuration initialization completed', {
      operation: 'initializeConfiguration',
      duration: initializationTime,
      configurationSize: JSON.stringify(config).length
    });
    
    // Log audit event for configuration initialization
    logger.audit('Blockchain service configuration initialized', {
      event_type: 'configuration_initialization',
      event_action: 'initialize_config',
      event_outcome: 'success',
      service: config.service.name,
      version: config.service.version,
      environment: config.env,
      duration: initializationTime,
      complianceFramework: config.compliance.complianceFrameworks,
      dataClassification: config.compliance.dataClassification
    });
    
    return config;
    
  } catch (error) {
    const initializationTime = Date.now() - startTime;
    
    logger.error('Failed to initialize blockchain service configuration', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: initializationTime,
      environment: environmentConfig.NODE_ENV,
      service: environmentConfig.SERVICE_NAME
    });
    
    logger.security('Configuration initialization failure', {
      event_type: 'configuration_failure',
      threat_level: 'high',
      error: error instanceof Error ? error.message : String(error),
      environment: environmentConfig.NODE_ENV
    });
    
    // Log audit event for failed initialization
    logger.audit('Failed blockchain service configuration initialization', {
      event_type: 'configuration_initialization',
      event_action: 'initialize_config',
      event_outcome: 'failure',
      environment: environmentConfig.NODE_ENV,
      duration: initializationTime,
      error: error instanceof Error ? error.message : String(error),
      complianceFramework: environmentConfig.COMPLIANCE_FRAMEWORKS,
      dataClassification: environmentConfig.DATA_CLASSIFICATION
    });
    
    throw error;
  }
}

/**
 * Main configuration object for the blockchain service
 * Consolidates all configuration settings from various sources into a single, validated object
 * 
 * This configuration object serves as the single source of truth for:
 * - Network connectivity to Hyperledger Fabric
 * - Service runtime parameters and security settings
 * - Compliance and audit requirements
 * - Monitoring and observability configuration
 * - Storage and persistence settings
 */
export const config: BlockchainServiceConfig = initializeConfiguration();

// Export individual configuration sections for convenience and backward compatibility
export const {
  env,
  port,
  network
} = config;

// Export types for use in other modules
export type {
  BlockchainServiceConfig,
  NetworkConfiguration
};

// Export network configuration function for advanced use cases
export { getNetworkConfig } from './network';

// Log successful module initialization
logger.blockchain('Configuration module exported successfully', {
  environment: config.env,
  service: config.service.name,
  version: config.service.version,
  networkName: config.network.networkName,
  moduleVersion: '1.0.0',
  blockchainNetwork: config.network.networkName || 'financial-services-network'
});