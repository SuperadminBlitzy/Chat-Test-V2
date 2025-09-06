import * as fs from 'fs'; // Node.js 20.LTS - File system operations for reading connection profiles
import * as path from 'path'; // Node.js 20.LTS - Path utilities for resolving file paths
import { logger } from '../utils/logger';

/**
 * Interface defining the structure of a Hyperledger Fabric connection profile
 * Based on the Fabric Common Connection Profile specification
 */
interface ConnectionProfile {
  name: string;
  version: string;
  client: {
    organization: string;
    connection: {
      timeout: {
        peer: {
          endorser: string;
          eventHub: string;
          eventReg: string;
        };
        orderer: string;
      };
    };
  };
  organizations: {
    [key: string]: {
      mspid: string;
      peers: string[];
      certificateAuthorities: string[];
      adminPrivateKeyPEM?: {
        path: string;
      };
      signedCertPEM?: {
        path: string;
      };
    };
  };
  orderers: {
    [key: string]: {
      url: string;
      tlsCACerts: {
        path: string;
      };
      grpcOptions: {
        'ssl-target-name-override': string;
        hostnameOverride: string;
      };
    };
  };
  peers: {
    [key: string]: {
      url: string;
      eventUrl: string;
      tlsCACerts: {
        path: string;
      };
      grpcOptions: {
        'ssl-target-name-override': string;
        hostnameOverride: string;
        'request-timeout': number;
      };
    };
  };
  certificateAuthorities: {
    [key: string]: {
      url: string;
      caName: string;
      tlsCACerts: {
        path: string;
      };
      httpOptions: {
        verify: boolean;
      };
      registrar: {
        enrollId: string;
        enrollSecret: string;
      };
    };
  };
  channels: {
    [key: string]: {
      orderers: string[];
      peers: {
        [key: string]: {
          endorsingPeer: boolean;
          chaincodeQuery: boolean;
          ledgerQuery: boolean;
          eventSource: boolean;
        };
      };
    };
  };
}

/**
 * Interface for network configuration options and environment variables
 */
interface NetworkEnvironment {
  NODE_ENV: string;
  BLOCKCHAIN_NETWORK: string;
  CONNECTION_PROFILE_PATH: string;
  NETWORK_CONFIG_CACHE_TTL: string;
  ENABLE_TLS: string;
  MSP_CONFIG_PATH: string;
  WALLET_PATH: string;
  DISCOVERY_ENABLED: string;
  DISCOVERY_AS_LOCALHOST: string;
}

/**
 * Interface for the processed network configuration object
 */
interface NetworkConfiguration {
  profile: ConnectionProfile;
  environment: string;
  networkName: string;
  tlsEnabled: boolean;
  organizations: string[];
  channels: string[];
  orderers: string[];
  peers: string[];
  certificateAuthorities: string[];
  connectionOptions: {
    discovery: {
      enabled: boolean;
      asLocalhost: boolean;
    };
    eventHandlerOptions: {
      strategy: string;
    };
    queryHandlerOptions: {
      strategy: string;
    };
  };
  walletPath: string;
  mspConfigPath: string;
  loadedAt: Date;
}

/**
 * Environment configuration with secure defaults
 * Follows financial services security best practices
 */
const networkEnv: NetworkEnvironment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  BLOCKCHAIN_NETWORK: process.env.BLOCKCHAIN_NETWORK || 'financial-services-network',
  CONNECTION_PROFILE_PATH: process.env.CONNECTION_PROFILE_PATH || path.join(__dirname, '../../config/connection-profiles'),
  NETWORK_CONFIG_CACHE_TTL: process.env.NETWORK_CONFIG_CACHE_TTL || '300000', // 5 minutes cache
  ENABLE_TLS: process.env.ENABLE_TLS || 'true',
  MSP_CONFIG_PATH: process.env.MSP_CONFIG_PATH || path.join(__dirname, '../../crypto-config'),
  WALLET_PATH: process.env.WALLET_PATH || path.join(__dirname, '../../wallet'),
  DISCOVERY_ENABLED: process.env.DISCOVERY_ENABLED || 'true',
  DISCOVERY_AS_LOCALHOST: process.env.DISCOVERY_AS_LOCALHOST || (process.env.NODE_ENV === 'development' ? 'true' : 'false')
};

/**
 * Global connection profile cache for performance optimization
 * Implements TTL-based caching to reduce file I/O operations
 */
let connectionProfile: NetworkConfiguration | null = null;
let cacheTimestamp: number = 0;
const cacheTTL: number = parseInt(networkEnv.NETWORK_CONFIG_CACHE_TTL);

/**
 * Validates the connection profile structure and required fields
 * Ensures compliance with Hyperledger Fabric connection profile specification
 */
function validateConnectionProfile(profile: any): profile is ConnectionProfile {
  const requiredFields = [
    'name', 'version', 'client', 'organizations', 
    'orderers', 'peers', 'certificateAuthorities', 'channels'
  ];
  
  // Check for required top-level fields
  for (const field of requiredFields) {
    if (!profile[field]) {
      throw new Error(`Invalid connection profile: missing required field '${field}'`);
    }
  }
  
  // Validate client configuration
  if (!profile.client.organization) {
    throw new Error('Invalid connection profile: client.organization is required');
  }
  
  // Validate that at least one organization exists
  if (Object.keys(profile.organizations).length === 0) {
    throw new Error('Invalid connection profile: at least one organization must be defined');
  }
  
  // Validate that each organization has required MSP ID
  for (const [orgName, orgConfig] of Object.entries(profile.organizations as any)) {
    if (!orgConfig.mspid) {
      throw new Error(`Invalid connection profile: organization '${orgName}' missing mspid`);
    }
  }
  
  // Validate that at least one orderer exists
  if (Object.keys(profile.orderers).length === 0) {
    throw new Error('Invalid connection profile: at least one orderer must be defined');
  }
  
  // Validate that at least one peer exists
  if (Object.keys(profile.peers).length === 0) {
    throw new Error('Invalid connection profile: at least one peer must be defined');
  }
  
  // Validate that at least one CA exists
  if (Object.keys(profile.certificateAuthorities).length === 0) {
    throw new Error('Invalid connection profile: at least one certificate authority must be defined');
  }
  
  // Validate channel configuration
  for (const [channelName, channelConfig] of Object.entries(profile.channels as any)) {
    if (!channelConfig.orderers || channelConfig.orderers.length === 0) {
      throw new Error(`Invalid connection profile: channel '${channelName}' must have at least one orderer`);
    }
    if (!channelConfig.peers || Object.keys(channelConfig.peers).length === 0) {
      throw new Error(`Invalid connection profile: channel '${channelName}' must have at least one peer`);
    }
  }
  
  return true;
}

/**
 * Determines the appropriate connection profile filename based on environment
 * Supports environment-specific configurations for development, staging, and production
 */
function getConnectionProfileFilename(): string {
  const environment = networkEnv.NODE_ENV.toLowerCase();
  const networkName = networkEnv.BLOCKCHAIN_NETWORK.toLowerCase();
  
  // Define environment-specific profile mapping
  const profileMapping: { [key: string]: string } = {
    'development': `connection-${networkName}-dev.json`,
    'dev': `connection-${networkName}-dev.json`,
    'staging': `connection-${networkName}-staging.json`,
    'stage': `connection-${networkName}-staging.json`,
    'production': `connection-${networkName}-prod.json`,
    'prod': `connection-${networkName}-prod.json`,
    'test': `connection-${networkName}-test.json`,
    'testing': `connection-${networkName}-test.json`
  };
  
  const filename = profileMapping[environment];
  
  if (!filename) {
    logger.warn('Unknown environment for connection profile selection', {
      environment,
      networkName,
      defaulting: 'development profile'
    });
    return profileMapping['development'];
  }
  
  logger.blockchain('Connection profile filename determined', {
    environment,
    networkName,
    filename,
    blockchainNetwork: networkName
  });
  
  return filename;
}

/**
 * Reads and parses the connection profile JSON file from the filesystem
 * Implements comprehensive error handling and security validation
 */
function loadConnectionProfile(): ConnectionProfile {
  const filename = getConnectionProfileFilename();
  const profilePath = path.resolve(networkEnv.CONNECTION_PROFILE_PATH, filename);
  
  logger.blockchain('Loading connection profile from filesystem', {
    profilePath,
    filename,
    blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
  });
  
  try {
    // Verify file exists and is readable
    if (!fs.existsSync(profilePath)) {
      throw new Error(`Connection profile file not found: ${profilePath}`);
    }
    
    // Check file permissions (readable)
    try {
      fs.accessSync(profilePath, fs.constants.R_OK);
    } catch (accessError) {
      throw new Error(`Connection profile file is not readable: ${profilePath}`);
    }
    
    // Get file stats for security validation
    const stats = fs.statSync(profilePath);
    
    // Validate file size (prevent loading extremely large files)
    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
    if (stats.size > maxFileSize) {
      throw new Error(`Connection profile file too large: ${stats.size} bytes (max: ${maxFileSize})`);
    }
    
    // Read file content with explicit encoding
    const fileContent = fs.readFileSync(profilePath, { encoding: 'utf8' });
    
    // Parse JSON with error handling
    let profile: any;
    try {
      profile = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON in connection profile: ${parseError}`);
    }
    
    // Validate profile structure
    validateConnectionProfile(profile);
    
    logger.blockchain('Connection profile loaded and validated successfully', {
      profilePath,
      filename,
      networkName: profile.name,
      version: profile.version,
      organizationCount: Object.keys(profile.organizations).length,
      peerCount: Object.keys(profile.peers).length,
      ordererCount: Object.keys(profile.orderers).length,
      caCount: Object.keys(profile.certificateAuthorities).length,
      channelCount: Object.keys(profile.channels).length,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
      fileSize: stats.size
    });
    
    // Log audit event for compliance
    logger.audit('Blockchain network configuration loaded', {
      event_type: 'configuration_access',
      event_action: 'load_connection_profile',
      event_outcome: 'success',
      profilePath,
      networkName: profile.name,
      complianceFramework: ['SOX', 'PCI_DSS'],
      dataClassification: 'internal'
    });
    
    return profile as ConnectionProfile;
    
  } catch (error) {
    logger.error('Failed to load connection profile', {
      profilePath,
      filename,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
    });
    
    // Log security event for failed configuration access
    logger.security('Failed blockchain configuration access', {
      event_type: 'configuration_access',
      threat_level: 'medium',
      profilePath,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
}

/**
 * Processes the raw connection profile into a structured network configuration
 * Enriches the profile with additional metadata and configuration options
 */
function processNetworkConfiguration(profile: ConnectionProfile): NetworkConfiguration {
  logger.blockchain('Processing network configuration', {
    networkName: profile.name,
    version: profile.version,
    blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
  });
  
  const organizations = Object.keys(profile.organizations);
  const channels = Object.keys(profile.channels);
  const orderers = Object.keys(profile.orderers);
  const peers = Object.keys(profile.peers);
  const certificateAuthorities = Object.keys(profile.certificateAuthorities);
  
  const networkConfig: NetworkConfiguration = {
    profile,
    environment: networkEnv.NODE_ENV,
    networkName: profile.name,
    tlsEnabled: networkEnv.ENABLE_TLS === 'true',
    organizations,
    channels,
    orderers,
    peers,
    certificateAuthorities,
    connectionOptions: {
      discovery: {
        enabled: networkEnv.DISCOVERY_ENABLED === 'true',
        asLocalhost: networkEnv.DISCOVERY_AS_LOCALHOST === 'true'
      },
      eventHandlerOptions: {
        strategy: 'MSPID_SCOPE_ANYFORTX' // Default event handling strategy for financial transactions
      },
      queryHandlerOptions: {
        strategy: 'MSPID_SCOPE_ROUND_ROBIN' // Load balancing for query operations
      }
    },
    walletPath: path.resolve(networkEnv.WALLET_PATH),
    mspConfigPath: path.resolve(networkEnv.MSP_CONFIG_PATH),
    loadedAt: new Date()
  };
  
  logger.blockchain('Network configuration processed successfully', {
    networkName: networkConfig.networkName,
    environment: networkConfig.environment,
    tlsEnabled: networkConfig.tlsEnabled,
    organizationCount: organizations.length,
    channelCount: channels.length,
    ordererCount: orderers.length,
    peerCount: peers.length,
    caCount: certificateAuthorities.length,
    discoveryEnabled: networkConfig.connectionOptions.discovery.enabled,
    blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
  });
  
  return networkConfig;
}

/**
 * Checks if the cached network configuration is still valid
 * Implements TTL-based cache invalidation for performance optimization
 */
function isCacheValid(): boolean {
  if (!connectionProfile || !cacheTimestamp) {
    return false;
  }
  
  const now = Date.now();
  const cacheAge = now - cacheTimestamp;
  const isValid = cacheAge < cacheTTL;
  
  logger.blockchain('Cache validity check', {
    cacheAge,
    cacheTTL,
    isValid,
    lastLoaded: new Date(cacheTimestamp).toISOString(),
    blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
  });
  
  return isValid;
}

/**
 * Loads and returns the Hyperledger Fabric network configuration based on the current environment.
 * Reads the appropriate connection profile (e.g., connection-dev.json, connection-prod.json) 
 * and prepares it for use by the Fabric SDK.
 * 
 * This function implements enterprise-grade features including:
 * - Environment-specific configuration loading
 * - Comprehensive input validation and security checks
 * - Performance optimization through intelligent caching
 * - Detailed audit logging for compliance requirements
 * - Error handling with proper logging and monitoring
 * - Support for TLS-enabled networks and MSP configuration
 * 
 * @returns The network configuration object containing connection profile, 
 *          environment metadata, and SDK configuration options
 * @throws Error if the connection profile cannot be loaded or is invalid
 */
export function getNetworkConfig(): NetworkConfiguration {
  const startTime = Date.now();
  
  logger.blockchain('Network configuration request initiated', {
    environment: networkEnv.NODE_ENV,
    blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
    cacheEnabled: true,
    cacheTTL
  });
  
  try {
    // Check cache validity and return cached configuration if available
    if (isCacheValid()) {
      logger.blockchain('Returning cached network configuration', {
        cacheAge: Date.now() - cacheTimestamp,
        networkName: connectionProfile!.networkName,
        blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
      });
      
      logger.performance('Network configuration cache hit', {
        operation: 'getNetworkConfig',
        duration: Date.now() - startTime,
        cacheHit: true
      });
      
      return connectionProfile!;
    }
    
    // Load fresh configuration from filesystem
    logger.blockchain('Cache invalid or expired, loading fresh configuration', {
      cacheTimestamp: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : 'never',
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
    });
    
    const profile = loadConnectionProfile();
    const networkConfig = processNetworkConfiguration(profile);
    
    // Update cache
    connectionProfile = networkConfig;
    cacheTimestamp = Date.now();
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Network configuration loaded successfully', {
      networkName: networkConfig.networkName,
      environment: networkConfig.environment,
      loadDuration: duration,
      tlsEnabled: networkConfig.tlsEnabled,
      organizationCount: networkConfig.organizations.length,
      channelCount: networkConfig.channels.length,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK
    });
    
    logger.performance('Network configuration loaded from filesystem', {
      operation: 'getNetworkConfig',
      duration,
      cacheHit: false,
      networkName: networkConfig.networkName
    });
    
    // Log successful configuration load for audit purposes
    logger.audit('Blockchain network configuration accessed', {
      event_type: 'configuration_access',
      event_action: 'get_network_config',
      event_outcome: 'success',
      networkName: networkConfig.networkName,
      environment: networkConfig.environment,
      duration,
      complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
      dataClassification: 'internal'
    });
    
    return networkConfig;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Failed to get network configuration', {
      environment: networkEnv.NODE_ENV,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    logger.performance('Network configuration load failed', {
      operation: 'getNetworkConfig',
      duration,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Log security event for configuration access failure
    logger.security('Failed blockchain network configuration access', {
      event_type: 'configuration_access_failure',
      threat_level: 'high',
      environment: networkEnv.NODE_ENV,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Log audit event for failed access
    logger.audit('Failed blockchain network configuration access', {
      event_type: 'configuration_access',
      event_action: 'get_network_config',
      event_outcome: 'failure',
      environment: networkEnv.NODE_ENV,
      blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
      duration,
      error: error instanceof Error ? error.message : String(error),
      complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
      dataClassification: 'internal'
    });
    
    throw error;
  }
}

// Export types for use in other modules
export type {
  ConnectionProfile,
  NetworkConfiguration,
  NetworkEnvironment
};

// Initialize logger for startup
logger.blockchain('Network configuration module initialized', {
  environment: networkEnv.NODE_ENV,
  blockchainNetwork: networkEnv.BLOCKCHAIN_NETWORK,
  connectionProfilePath: networkEnv.CONNECTION_PROFILE_PATH,
  tlsEnabled: networkEnv.ENABLE_TLS === 'true',
  discoveryEnabled: networkEnv.DISCOVERY_ENABLED === 'true',
  cacheTTL,
  moduleVersion: '1.0.0'
});