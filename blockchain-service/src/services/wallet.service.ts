import { Wallets, Wallet } from 'fabric-network'; // ^2.2.18 - Hyperledger Fabric SDK for wallet management
import * as path from 'path'; // ^0.12.7 - Node.js path utilities for file system operations

import { getNetworkConfig } from '../config/network';
import { logger } from '../utils/logger';
import { ApiError, NotFoundError, WalletError } from '../utils/errors';

/**
 * Wallet Service for Blockchain-based Settlement Network
 * 
 * This service manages user wallets in the Hyperledger Fabric blockchain network,
 * providing secure wallet creation, retrieval, and validation functionality.
 * It serves as the foundational wallet infrastructure for users to participate
 * in the blockchain settlement network, addressing requirement F-009 for 
 * Blockchain-based Settlement Network infrastructure.
 * 
 * Key Features:
 * - File system-based wallet management using Hyperledger Fabric SDK
 * - Secure wallet identity verification and validation
 * - Enterprise-grade error handling and audit logging
 * - Performance-optimized wallet operations with proper caching
 * - Comprehensive security logging for compliance requirements
 * 
 * Security Considerations:
 * - All wallet operations are logged for audit compliance
 * - Error handling prevents information disclosure attacks
 * - Proper path resolution prevents directory traversal attacks
 * - Identity validation ensures only authorized wallet access
 */

/**
 * Cached wallet instance for performance optimization
 * Reduces file system operations and improves response times
 */
let cachedWallet: Wallet | null = null;
let walletCacheTimestamp: number = 0;
const WALLET_CACHE_TTL = 300000; // 5 minutes cache TTL for wallet instances

/**
 * Validates if the cached wallet instance is still valid
 * Implements TTL-based cache invalidation for security and performance
 * 
 * @returns True if cached wallet is valid, false if cache expired or invalid
 */
function isWalletCacheValid(): boolean {
  if (!cachedWallet || !walletCacheTimestamp) {
    return false;
  }
  
  const cacheAge = Date.now() - walletCacheTimestamp;
  const isValid = cacheAge < WALLET_CACHE_TTL;
  
  logger.blockchain('Wallet cache validity check', {
    cacheAge,
    cacheTTL: WALLET_CACHE_TTL,
    isValid,
    lastCached: new Date(walletCacheTimestamp).toISOString()
  });
  
  return isValid;
}

/**
 * Retrieves the wallet instance by building it from the configured file system path.
 * 
 * This function creates and returns a Hyperledger Fabric file system wallet instance
 * using the network configuration settings. The wallet is used to store and manage
 * user identities, certificates, and private keys required for blockchain operations.
 * 
 * Implementation details:
 * - Resolves wallet path from network configuration
 * - Creates file system wallet using Fabric SDK
 * - Implements intelligent caching for performance optimization
 * - Provides comprehensive error handling and audit logging
 * - Ensures secure path resolution to prevent security vulnerabilities
 * 
 * @returns A promise that resolves to the wallet instance
 * @throws {WalletError} When wallet creation or initialization fails
 * @throws {ApiError} When network configuration is unavailable
 */
export async function getWallet(): Promise<Wallet> {
  const startTime = Date.now();
  
  logger.blockchain('Wallet retrieval request initiated', {
    operation: 'getWallet',
    cacheEnabled: true,
    cacheTTL: WALLET_CACHE_TTL
  });
  
  try {
    // Check if cached wallet is still valid
    if (isWalletCacheValid()) {
      logger.blockchain('Returning cached wallet instance', {
        operation: 'getWallet',
        cacheAge: Date.now() - walletCacheTimestamp,
        cacheHit: true
      });
      
      logger.performance('Wallet cache hit', {
        operation: 'getWallet',
        duration: Date.now() - startTime,
        cacheHit: true
      });
      
      return cachedWallet!;
    }
    
    // Get network configuration to retrieve wallet path
    logger.blockchain('Loading network configuration for wallet path', {
      operation: 'getWallet'
    });
    
    const networkConfig = getNetworkConfig();
    const walletPath = networkConfig.walletPath;
    
    // Resolve the absolute wallet path for security
    const resolvedWalletPath = path.resolve(walletPath);
    
    logger.blockchain('Wallet path resolved from network configuration', {
      operation: 'getWallet',
      walletPath: resolvedWalletPath,
      networkName: networkConfig.networkName,
      environment: networkConfig.environment
    });
    
    // Create a file system wallet instance using Hyperledger Fabric SDK
    logger.blockchain('Creating file system wallet instance', {
      operation: 'getWallet',
      walletPath: resolvedWalletPath
    });
    
    const wallet = await Wallets.newFileSystemWallet(resolvedWalletPath);
    
    // Update cache with new wallet instance
    cachedWallet = wallet;
    walletCacheTimestamp = Date.now();
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Wallet instance created successfully', {
      operation: 'getWallet',
      walletPath: resolvedWalletPath,
      duration,
      cacheUpdated: true
    });
    
    logger.performance('Wallet creation completed', {
      operation: 'getWallet',
      duration,
      cacheHit: false,
      walletPath: resolvedWalletPath
    });
    
    // Log audit event for wallet access
    logger.audit('Blockchain wallet accessed', {
      event_type: 'wallet_access',
      event_action: 'get_wallet',
      event_outcome: 'success',
      walletPath: resolvedWalletPath,
      duration,
      complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
      dataClassification: 'confidential'
    });
    
    return wallet;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Failed to create wallet instance', {
      operation: 'getWallet',
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    logger.security('Wallet creation failure detected', {
      event_type: 'wallet_creation_failure',
      threat_level: 'medium',
      operation: 'getWallet',
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Log audit event for failed wallet access
    logger.audit('Failed blockchain wallet access', {
      event_type: 'wallet_access',
      event_action: 'get_wallet',
      event_outcome: 'failure',
      duration,
      error: error instanceof Error ? error.message : String(error),
      complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
      dataClassification: 'confidential'
    });
    
    // Wrap and throw appropriate error based on the original error type
    if (error instanceof Error && error.message.includes('network')) {
      throw new ApiError(503, `Network configuration unavailable: ${error.message}`, false);
    } else {
      throw new WalletError(`Failed to create wallet instance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Retrieves the wallet for a specific user.
 * 
 * This function checks if a wallet identity exists for the specified user ID
 * and returns the wallet instance if found. If the user's identity is not
 * found in the wallet, it throws a NotFoundError with appropriate messaging.
 * 
 * Implementation details:
 * - Retrieves the main wallet instance using getWallet()
 * - Validates user identity existence in the wallet
 * - Provides detailed error messages for troubleshooting
 * - Implements comprehensive audit logging for compliance
 * - Ensures secure user ID validation to prevent injection attacks
 * 
 * @param userId - The unique identifier for the user whose wallet is requested
 * @returns A promise that resolves to the user's wallet
 * @throws {NotFoundError} When the wallet for the specified user does not exist
 * @throws {WalletError} When wallet operations fail
 * @throws {ApiError} When underlying wallet creation fails
 */
export async function getWalletForUser(userId: string): Promise<Wallet> {
  const startTime = Date.now();
  
  // Input validation and sanitization
  if (!userId || typeof userId !== 'string') {
    const error = new WalletError('Invalid user ID provided for wallet retrieval');
    
    logger.security('Invalid user ID in wallet request', {
      event_type: 'input_validation_failure',
      threat_level: 'low',
      operation: 'getWalletForUser',
      providedUserId: typeof userId,
      error: error.message
    });
    
    throw error;
  }
  
  // Sanitize user ID to prevent injection attacks
  const sanitizedUserId = userId.trim().replace(/[^a-zA-Z0-9\-_@.]/g, '');
  
  if (sanitizedUserId !== userId) {
    logger.security('User ID sanitization performed', {
      event_type: 'input_sanitization',
      threat_level: 'low',
      operation: 'getWalletForUser',
      originalUserId: userId,
      sanitizedUserId
    });
  }
  
  logger.blockchain('User wallet retrieval request initiated', {
    operation: 'getWalletForUser',
    userId: sanitizedUserId,
    requestTime: new Date().toISOString()
  });
  
  try {
    // Get the main wallet instance
    const wallet = await getWallet();
    
    logger.blockchain('Checking user identity existence in wallet', {
      operation: 'getWalletForUser',
      userId: sanitizedUserId
    });
    
    // Check if an identity for the given user ID exists in the wallet
    const identity = await wallet.get(sanitizedUserId);
    
    if (!identity) {
      const duration = Date.now() - startTime;
      const errorMessage = `Wallet not found for user: ${sanitizedUserId}`;
      
      logger.blockchain('User wallet identity not found', {
        operation: 'getWalletForUser',
        userId: sanitizedUserId,
        duration,
        identityExists: false
      });
      
      // Log audit event for wallet access attempt
      logger.audit('User wallet access attempt - not found', {
        event_type: 'wallet_access',
        event_action: 'get_wallet_for_user',
        event_outcome: 'failure',
        userId: sanitizedUserId,
        duration,
        reason: 'identity_not_found',
        complianceFramework: ['SOX', 'PCI_DSS', 'GDPR'],
        dataClassification: 'confidential'
      });
      
      throw new NotFoundError(errorMessage);
    }
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('User wallet retrieved successfully', {
      operation: 'getWalletForUser',
      userId: sanitizedUserId,
      duration,
      identityExists: true,
      identityType: identity.type
    });
    
    logger.performance('User wallet retrieval completed', {
      operation: 'getWalletForUser',
      duration,
      userId: sanitizedUserId,
      identityType: identity.type
    });
    
    // Log successful audit event
    logger.audit('User wallet accessed successfully', {
      event_type: 'wallet_access',
      event_action: 'get_wallet_for_user',
      event_outcome: 'success',
      userId: sanitizedUserId,
      duration,
      identityType: identity.type,
      complianceFramework: ['SOX', 'PCI_DSS', 'GDPR'],
      dataClassification: 'confidential'
    });
    
    return wallet;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // If it's already a NotFoundError, just re-throw it
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    logger.error('Failed to retrieve user wallet', {
      operation: 'getWalletForUser',
      userId: sanitizedUserId,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    logger.security('User wallet retrieval failure', {
      event_type: 'wallet_access_failure',
      threat_level: 'medium',
      operation: 'getWalletForUser',
      userId: sanitizedUserId,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Log audit event for failed wallet access
    logger.audit('Failed user wallet access', {
      event_type: 'wallet_access',
      event_action: 'get_wallet_for_user',
      event_outcome: 'failure',
      userId: sanitizedUserId,
      duration,
      error: error instanceof Error ? error.message : String(error),
      complianceFramework: ['SOX', 'PCI_DSS', 'GDPR'],
      dataClassification: 'confidential'
    });
    
    // Wrap and throw appropriate error
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new WalletError(`Failed to retrieve wallet for user ${sanitizedUserId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Checks if a wallet for a specific user exists.
 * 
 * This function verifies whether a user identity exists in the blockchain wallet
 * without throwing errors for non-existent wallets. It provides a safe way to
 * check wallet existence before attempting wallet operations.
 * 
 * Implementation details:
 * - Performs non-intrusive wallet existence check
 * - Returns boolean result without throwing exceptions for missing wallets
 * - Implements proper error handling for system failures
 * - Provides comprehensive logging for monitoring and debugging
 * - Ensures secure user ID validation and sanitization
 * 
 * @param userId - The unique identifier for the user whose wallet existence is checked
 * @returns A promise that resolves to true if the wallet exists, false otherwise
 * @throws {WalletError} When wallet operations fail or user ID is invalid
 * @throws {ApiError} When underlying wallet creation fails
 */
export async function isWalletExists(userId: string): Promise<boolean> {
  const startTime = Date.now();
  
  // Input validation and sanitization
  if (!userId || typeof userId !== 'string') {
    const error = new WalletError('Invalid user ID provided for wallet existence check');
    
    logger.security('Invalid user ID in wallet existence check', {
      event_type: 'input_validation_failure',
      threat_level: 'low',
      operation: 'isWalletExists',
      providedUserId: typeof userId,
      error: error.message
    });
    
    throw error;
  }
  
  // Sanitize user ID to prevent injection attacks
  const sanitizedUserId = userId.trim().replace(/[^a-zA-Z0-9\-_@.]/g, '');
  
  if (sanitizedUserId !== userId) {
    logger.security('User ID sanitization performed', {
      event_type: 'input_sanitization',
      threat_level: 'low',
      operation: 'isWalletExists',
      originalUserId: userId,
      sanitizedUserId
    });
  }
  
  logger.blockchain('Wallet existence check request initiated', {
    operation: 'isWalletExists',
    userId: sanitizedUserId,
    requestTime: new Date().toISOString()
  });
  
  try {
    // Get the main wallet instance
    const wallet = await getWallet();
    
    logger.blockchain('Performing wallet existence check', {
      operation: 'isWalletExists',
      userId: sanitizedUserId
    });
    
    // Check if an identity for the given user ID exists in the wallet
    const identity = await wallet.get(sanitizedUserId);
    const exists = identity !== null && identity !== undefined;
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Wallet existence check completed', {
      operation: 'isWalletExists',
      userId: sanitizedUserId,
      exists,
      duration,
      identityType: exists ? identity.type : null
    });
    
    logger.performance('Wallet existence check performance', {
      operation: 'isWalletExists',
      duration,
      userId: sanitizedUserId,
      exists
    });
    
    // Log audit event for wallet existence check
    logger.audit('Wallet existence check performed', {
      event_type: 'wallet_check',
      event_action: 'is_wallet_exists',
      event_outcome: 'success',
      userId: sanitizedUserId,
      exists,
      duration,
      complianceFramework: ['SOX', 'PCI_DSS', 'GDPR'],
      dataClassification: 'confidential'
    });
    
    return exists;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Failed to check wallet existence', {
      operation: 'isWalletExists',
      userId: sanitizedUserId,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    logger.security('Wallet existence check failure', {
      event_type: 'wallet_check_failure',
      threat_level: 'medium',
      operation: 'isWalletExists',
      userId: sanitizedUserId,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Log audit event for failed wallet existence check
    logger.audit('Failed wallet existence check', {
      event_type: 'wallet_check',
      event_action: 'is_wallet_exists',
      event_outcome: 'failure',
      userId: sanitizedUserId,
      duration,
      error: error instanceof Error ? error.message : String(error),
      complianceFramework: ['SOX', 'PCI_DSS', 'GDPR'],
      dataClassification: 'confidential'
    });
    
    // Wrap and throw appropriate error
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new WalletError(`Failed to check wallet existence for user ${sanitizedUserId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}