import { createLogger, format, transports } from 'winston'; // ^3.13.0

/**
 * Environment variables interface for type safety and documentation
 */
interface LoggerEnvironment {
  NODE_ENV: string;
  LOG_LEVEL: string;
  SERVICE_NAME: string;
  SERVICE_VERSION: string;
  LOG_FILE_PATH?: string;
  LOG_MAX_FILE_SIZE?: string;
  LOG_MAX_FILES?: string;
  ENABLE_CONSOLE_LOGS?: string;
  AUDIT_LOG_ENABLED?: string;
  STRUCTURED_LOGGING?: string;
}

/**
 * Custom log levels for financial services compliance
 * Includes audit level for regulatory compliance requirements
 */
const customLevels = {
  levels: {
    error: 0,     // Critical errors requiring immediate attention
    warn: 1,      // Warning conditions that should be addressed
    audit: 2,     // Audit events for compliance and regulatory requirements
    info: 3,      // General informational messages
    http: 4,      // HTTP request/response logging
    debug: 5,     // Debug information for troubleshooting
    trace: 6      // Detailed trace information for development
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    audit: 'magenta',
    info: 'green',
    http: 'cyan',
    debug: 'blue',
    trace: 'gray'
  }
};

/**
 * Environment configuration with defaults
 */
const env: LoggerEnvironment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  SERVICE_NAME: process.env.SERVICE_NAME || 'blockchain-service',
  SERVICE_VERSION: process.env.SERVICE_VERSION || '1.0.0',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',
  LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || '50m',
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || '10',
  ENABLE_CONSOLE_LOGS: process.env.ENABLE_CONSOLE_LOGS || 'true',
  AUDIT_LOG_ENABLED: process.env.AUDIT_LOG_ENABLED || 'true',
  STRUCTURED_LOGGING: process.env.STRUCTURED_LOGGING || (process.env.NODE_ENV === 'production' ? 'true' : 'false')
};

/**
 * Common metadata fields for all log entries
 * Includes service identification and tracing information
 */
const commonMetadata = {
  service: env.SERVICE_NAME,
  version: env.SERVICE_VERSION,
  environment: env.NODE_ENV,
  timestamp: () => new Date().toISOString(),
  hostname: process.env.HOSTNAME || require('os').hostname(),
  pid: process.pid
};

/**
 * Development format - Human readable with colors and detailed information
 * Optimized for developer experience during local development
 */
const developmentFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.colorize({ all: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Remove common metadata from display to reduce noise
    const { service, version, environment, hostname, pid, ...displayMeta } = meta;
    
    let logLine = `${timestamp} [${level}] [${service}:${pid}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logLine += `\n${stack}`;
    }
    
    // Add additional metadata if present
    if (Object.keys(displayMeta).length > 0) {
      logLine += `\n  Metadata: ${JSON.stringify(displayMeta, null, 2)}`;
    }
    
    return logLine;
  })
);

/**
 * Production format - Structured JSON for machine parsing and compliance
 * Includes all necessary fields for audit trails and monitoring systems
 */
const productionFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf((info) => {
    // Ensure all required fields are present for compliance
    const logEntry = {
      '@timestamp': info.timestamp,
      level: info.level,
      message: info.message,
      service: commonMetadata.service,
      version: commonMetadata.version,
      environment: commonMetadata.environment,
      hostname: commonMetadata.hostname,
      pid: commonMetadata.pid,
      ...(info.stack && { stack: info.stack }),
      ...(info.traceId && { traceId: info.traceId }),
      ...(info.spanId && { spanId: info.spanId }),
      ...(info.userId && { userId: info.userId }),
      ...(info.sessionId && { sessionId: info.sessionId }),
      ...(info.transactionId && { transactionId: info.transactionId }),
      ...(info.blockchainNetwork && { blockchainNetwork: info.blockchainNetwork }),
      ...(info.contractAddress && { contractAddress: info.contractAddress }),
      ...info
    };
    
    // Remove duplicate fields to avoid redundancy
    delete logEntry.timestamp;
    
    return JSON.stringify(logEntry);
  })
);

/**
 * Audit format - Specialized format for regulatory compliance
 * Includes additional compliance-specific fields and immutable log structure
 */
const auditFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' }),
  format.json(),
  format.printf((info) => {
    const auditEntry = {
      '@timestamp': info.timestamp,
      level: 'audit',
      event_type: info.event_type || 'system_event',
      event_category: info.event_category || 'application',
      event_action: info.event_action || info.message,
      event_outcome: info.event_outcome || 'unknown',
      message: info.message,
      service: commonMetadata.service,
      version: commonMetadata.version,
      environment: commonMetadata.environment,
      hostname: commonMetadata.hostname,
      pid: commonMetadata.pid,
      user_id: info.userId || 'system',
      session_id: info.sessionId || null,
      request_id: info.requestId || null,
      transaction_id: info.transactionId || null,
      blockchain_network: info.blockchainNetwork || null,
      contract_address: info.contractAddress || null,
      gas_used: info.gasUsed || null,
      block_number: info.blockNumber || null,
      compliance_framework: info.complianceFramework || ['SOX', 'PCI_DSS', 'GDPR'],
      data_classification: info.dataClassification || 'internal',
      retention_period: info.retentionPeriod || '2555', // 7 years in days for financial compliance
      ...info
    };
    
    // Remove duplicate timestamp field
    delete auditEntry.timestamp;
    
    return JSON.stringify(auditEntry);
  })
);

/**
 * Security filter to redact sensitive information from logs
 * Prevents accidental logging of PII, credentials, and financial data
 */
const securityFilter = format((info) => {
  const sensitiveFields = [
    'password', 'token', 'key', 'secret', 'auth', 'authorization',
    'ssn', 'social_security', 'credit_card', 'card_number', 'cvv',
    'account_number', 'routing_number', 'iban', 'swift_code',
    'private_key', 'seed_phrase', 'mnemonic', 'wallet_address'
  ];
  
  const redactSensitiveData = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        (result as any)[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        (result as any)[key] = redactSensitiveData(value);
      } else {
        (result as any)[key] = value;
      }
    }
    
    return result;
  };
  
  return redactSensitiveData(info);
});

/**
 * Create transport configurations based on environment
 */
const createTransports = (): any[] => {
  const logTransports: any[] = [];
  
  // Console transport for development and optionally for production
  if (env.ENABLE_CONSOLE_LOGS === 'true') {
    logTransports.push(
      new transports.Console({
        level: env.LOG_LEVEL,
        format: env.NODE_ENV === 'production' 
          ? format.combine(securityFilter(), productionFormat)
          : format.combine(securityFilter(), developmentFormat),
        handleExceptions: true,
        handleRejections: true
      })
    );
  }
  
  // File transports for production and persistent logging
  if (env.NODE_ENV === 'production' || env.LOG_FILE_PATH) {
    // General application logs
    logTransports.push(
      new transports.File({
        filename: `${env.LOG_FILE_PATH}/application.log`,
        level: env.LOG_LEVEL,
        format: format.combine(securityFilter(), productionFormat),
        maxsize: parseInt(env.LOG_MAX_FILE_SIZE!) * 1024 * 1024, // Convert MB to bytes
        maxFiles: parseInt(env.LOG_MAX_FILES!),
        tailable: true,
        handleExceptions: true,
        handleRejections: true
      })
    );
    
    // Error-specific logs for faster troubleshooting
    logTransports.push(
      new transports.File({
        filename: `${env.LOG_FILE_PATH}/error.log`,
        level: 'error',
        format: format.combine(securityFilter(), productionFormat),
        maxsize: parseInt(env.LOG_MAX_FILE_SIZE!) * 1024 * 1024,
        maxFiles: parseInt(env.LOG_MAX_FILES!),
        tailable: true
      })
    );
    
    // Audit logs for compliance (if enabled)
    if (env.AUDIT_LOG_ENABLED === 'true') {
      logTransports.push(
        new transports.File({
          filename: `${env.LOG_FILE_PATH}/audit.log`,
          level: 'audit',
          format: auditFormat,
          maxsize: parseInt(env.LOG_MAX_FILE_SIZE!) * 1024 * 1024,
          maxFiles: parseInt(env.LOG_MAX_FILES!) * 2, // Keep more audit files for compliance
          tailable: true
        })
      );
    }
  }
  
  return logTransports;
};

/**
 * Create and configure the Winston logger instance
 * Implements singleton pattern for consistent logging across the application
 */
const logger = createLogger({
  levels: customLevels.levels,
  level: env.LOG_LEVEL,
  defaultMeta: commonMetadata,
  transports: createTransports(),
  exitOnError: false, // Don't exit on handled exceptions
  silent: false, // Enable logging
  
  // Exception handling configuration
  exceptionHandlers: env.NODE_ENV === 'production' ? [
    new transports.File({ 
      filename: `${env.LOG_FILE_PATH}/exceptions.log`,
      maxsize: parseInt(env.LOG_MAX_FILE_SIZE!) * 1024 * 1024,
      maxFiles: parseInt(env.LOG_MAX_FILES!)
    })
  ] : [],
  
  // Promise rejection handling
  rejectionHandlers: env.NODE_ENV === 'production' ? [
    new transports.File({ 
      filename: `${env.LOG_FILE_PATH}/rejections.log`,
      maxsize: parseInt(env.LOG_MAX_FILE_SIZE!) * 1024 * 1024,
      maxFiles: parseInt(env.LOG_MAX_FILES!)
    })
  ] : []
});

// Add colors to Winston for development
if (env.NODE_ENV !== 'production') {
  require('winston').addColors(customLevels.colors);
}

/**
 * Enhanced logger with additional utility methods for blockchain and financial services
 */
const enhancedLogger = {
  ...logger,
  
  /**
   * Log blockchain transaction events with specialized metadata
   */
  blockchain: (message: string, metadata: {
    transactionId?: string;
    blockchainNetwork?: string;
    contractAddress?: string;
    gasUsed?: number;
    blockNumber?: number;
    fromAddress?: string;
    toAddress?: string;
    value?: string;
    [key: string]: any;
  }) => {
    logger.info(message, {
      event_category: 'blockchain',
      ...metadata
    });
  },
  
  /**
   * Log audit events for compliance and regulatory requirements
   */
  audit: (message: string, metadata: {
    event_type?: string;
    event_action?: string;
    event_outcome?: 'success' | 'failure' | 'unknown';
    userId?: string;
    sessionId?: string;
    requestId?: string;
    complianceFramework?: string[];
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
    [key: string]: any;
  }) => {
    logger.log('audit', message, {
      event_category: 'audit',
      event_type: metadata.event_type || 'compliance_event',
      ...metadata
    });
  },
  
  /**
   * Log performance metrics for monitoring and optimization
   */
  performance: (message: string, metadata: {
    operation?: string;
    duration?: number;
    requestId?: string;
    endpoint?: string;
    statusCode?: number;
    responseSize?: number;
    [key: string]: any;
  }) => {
    logger.info(message, {
      event_category: 'performance',
      ...metadata
    });
  },
  
  /**
   * Log security events for threat detection and compliance
   */
  security: (message: string, metadata: {
    event_type?: string;
    threat_level?: 'low' | 'medium' | 'high' | 'critical';
    source_ip?: string;
    user_agent?: string;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
  }) => {
    logger.warn(message, {
      event_category: 'security',
      threat_level: metadata.threat_level || 'medium',
      ...metadata
    });
  },
  
  /**
   * Log financial transaction events with specialized compliance metadata
   */
  financial: (message: string, metadata: {
    transactionType?: string;
    amount?: number;
    currency?: string;
    accountId?: string;
    merchantId?: string;
    paymentMethod?: string;
    riskScore?: number;
    complianceStatus?: string;
    [key: string]: any;
  }) => {
    logger.info(message, {
      event_category: 'financial',
      data_classification: 'confidential',
      retention_period: '2555', // 7 years for financial records
      ...metadata
    });
  }
};

// Export the singleton logger instance for use throughout the blockchain service
export { enhancedLogger as logger };

// Export types for use in other modules
export type {
  LoggerEnvironment
};

// Add process exit handlers for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down gracefully');
  logger.end();
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down gracefully');
  logger.end();
});

// Log initialization message
logger.info('Logger initialized successfully', {
  environment: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  service: env.SERVICE_NAME,
  version: env.SERVICE_VERSION,
  auditEnabled: env.AUDIT_LOG_ENABLED === 'true',
  structuredLogging: env.STRUCTURED_LOGGING === 'true'
});