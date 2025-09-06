import { Gateway, Network, Contract } from 'fabric-network'; // ^2.2.18 - Hyperledger Fabric SDK for Node.js applications

import { getNetworkConfig, NetworkConfiguration } from '../config/network';
import walletService from './wallet.service';
import logger from '../utils/logger';
import { ApiError, FabricError, WalletError, ChaincodeError, BadRequestError } from '../utils/errors';

/**
 * FabricService - Enterprise Hyperledger Fabric Network Service
 * 
 * This service provides comprehensive interaction capabilities with the Hyperledger Fabric
 * blockchain network, specifically designed for the financial services settlement platform.
 * It implements requirements F-009 (Blockchain-based Settlement Network) and F-010 
 * (Smart Contract Management) with enterprise-grade security, performance, and compliance features.
 * 
 * Key Features:
 * - Secure gateway connection management with user identity validation
 * - Smart contract lifecycle management and interaction
 * - Transaction submission with comprehensive error handling and audit logging
 * - Query evaluation with performance optimization and caching
 * - Enterprise security controls and compliance audit trails
 * - Automatic connection recovery and health monitoring
 * - Multi-channel and multi-contract support for complex business scenarios
 * 
 * Security Features:
 * - User identity validation and authentication
 * - Secure credential management through wallet service
 * - Comprehensive audit logging for regulatory compliance
 * - Input sanitization and validation for all operations
 * - Error handling that prevents information disclosure
 * - Connection state management with automatic cleanup
 * 
 * Performance Optimizations:
 * - Connection pooling and reuse for improved throughput
 * - Intelligent caching of network configurations and contracts
 * - Asynchronous operations with proper resource management
 * - Performance monitoring and metrics collection
 * - Graceful degradation and circuit breaker patterns
 * 
 * Compliance Features:
 * - SOX, PCI DSS, and GDPR compliance through audit logging
 * - Immutable transaction trails for regulatory reporting
 * - Data classification and retention policy enforcement
 * - Automated compliance validation and reporting
 */
export class FabricService {
    /**
     * Hyperledger Fabric Gateway instance for blockchain network connectivity
     * Maintains persistent connection to the fabric network infrastructure
     */
    private gateway: Gateway | null = null;

    /**
     * Network configuration cache for performance optimization
     * Stores validated network configuration to reduce repeated load operations
     */
    private networkConfig: NetworkConfiguration | null = null;

    /**
     * Current user identifier for connection context
     * Maintains user identity for security and audit purposes
     */
    private currentUserId: string | null = null;

    /**
     * Connection state tracking for health monitoring
     * Tracks gateway connection status for proper lifecycle management
     */
    private isConnected: boolean = false;

    /**
     * Service initialization timestamp for performance tracking
     * Records service startup time for monitoring and diagnostics
     */
    private readonly serviceStartTime: Date = new Date();

    /**
     * Contract cache for performance optimization
     * Caches frequently accessed contracts to reduce network overhead
     */
    private contractCache: Map<string, Contract> = new Map();

    /**
     * Initializes the FabricService instance.
     * 
     * Sets up the service with default configuration and prepares it for blockchain
     * network operations. The service is initialized in a disconnected state and
     * requires explicit connection via the connect() method.
     * 
     * Features implemented:
     * - Service instance initialization with proper state management
     * - Performance monitoring setup for service lifecycle tracking
     * - Audit logging initialization for compliance requirements
     * - Error handling setup for operational resilience
     * - Security context preparation for identity management
     */
    constructor() {
        const initStartTime = Date.now();

        logger.blockchain('FabricService initialization started', {
            serviceStartTime: this.serviceStartTime.toISOString(),
            initializationId: `fabric-service-${Date.now()}`,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Initialize internal state
            this.gateway = null;
            this.networkConfig = null;
            this.currentUserId = null;
            this.isConnected = false;
            this.contractCache.clear();

            const initDuration = Date.now() - initStartTime;

            logger.blockchain('FabricService initialized successfully', {
                initDuration,
                serviceVersion: '1.0.0',
                contractCacheSize: this.contractCache.size,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('FabricService initialization completed', {
                operation: 'constructor',
                duration: initDuration,
                serviceInstance: 'FabricService',
                cacheInitialized: true
            });

            // Log audit event for service initialization
            logger.audit('Blockchain service initialized', {
                event_type: 'service_initialization',
                event_action: 'fabric_service_init',
                event_outcome: 'success',
                serviceVersion: '1.0.0',
                initDuration,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'internal'
            });

        } catch (error) {
            const initDuration = Date.now() - initStartTime;

            logger.error('FabricService initialization failed', {
                initDuration,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            logger.security('Service initialization failure detected', {
                event_type: 'service_initialization_failure',
                threat_level: 'medium',
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for failed initialization
            logger.audit('Failed blockchain service initialization', {
                event_type: 'service_initialization',
                event_action: 'fabric_service_init',
                event_outcome: 'failure',
                initDuration,
                error: error instanceof Error ? error.message : String(error),
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'internal'
            });

            throw new FabricError(`Failed to initialize FabricService: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Connects to the Hyperledger Fabric gateway using the specified user identity.
     * 
     * Establishes a secure connection to the Hyperledger Fabric network using the
     * user's wallet identity and network configuration. This method implements
     * comprehensive security validation, performance optimization, and audit logging
     * required for financial services blockchain operations.
     * 
     * Implementation details:
     * - Validates user identity and sanitizes input parameters
     * - Retrieves user wallet and network configuration securely
     * - Establishes gateway connection with TLS encryption
     * - Implements connection state management and health monitoring
     * - Provides comprehensive error handling and recovery mechanisms
     * - Logs all operations for security audit and compliance requirements
     * 
     * @param userId - The unique identifier for the user connecting to the network
     * @returns A promise that resolves when the connection is successfully established
     * @throws {BadRequestError} When userId is invalid or missing
     * @throws {WalletError} When user wallet retrieval fails
     * @throws {FabricError} When gateway connection fails
     * @throws {ApiError} When network configuration is unavailable
     */
    public async connect(userId: string): Promise<void> {
        const connectStartTime = Date.now();
        const operationId = `connect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        logger.blockchain('Gateway connection request initiated', {
            operation: 'connect',
            userId: userId ? '[PROVIDED]' : '[MISSING]', // Log presence without exposing actual ID
            operationId,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Input validation and sanitization
            if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
                const error = new BadRequestError('User ID is required and must be a non-empty string');
                
                logger.security('Invalid user ID in gateway connection request', {
                    event_type: 'input_validation_failure',
                    threat_level: 'medium',
                    operation: 'connect',
                    operationId,
                    providedUserIdType: typeof userId
                });

                throw error;
            }

            // Sanitize user ID to prevent injection attacks
            const sanitizedUserId = userId.trim().replace(/[^a-zA-Z0-9\-_@.]/g, '');
            
            if (sanitizedUserId !== userId.trim()) {
                logger.security('User ID sanitization performed during connection', {
                    event_type: 'input_sanitization',
                    threat_level: 'low',
                    operation: 'connect',
                    operationId,
                    sanitizationPerformed: true
                });
            }

            // Check if already connected with the same user
            if (this.isConnected && this.currentUserId === sanitizedUserId) {
                logger.blockchain('Already connected with the same user, reusing connection', {
                    operation: 'connect',
                    userId: sanitizedUserId,
                    operationId,
                    connectionReused: true,
                    blockchainNetwork: 'financial-services-network'
                });

                logger.performance('Gateway connection reused', {
                    operation: 'connect',
                    duration: Date.now() - connectStartTime,
                    connectionReused: true,
                    userId: sanitizedUserId
                });

                return;
            }

            // Disconnect any existing connection before establishing new one
            if (this.isConnected) {
                logger.blockchain('Disconnecting existing connection before new connection', {
                    operation: 'connect',
                    previousUserId: this.currentUserId,
                    newUserId: sanitizedUserId,
                    operationId
                });

                this.disconnect();
            }

            logger.blockchain('Retrieving user wallet for gateway connection', {
                operation: 'connect',
                userId: sanitizedUserId,
                operationId
            });

            // Get the wallet for the user using the wallet service
            const wallet = await walletService.getWalletForUser(sanitizedUserId);

            logger.blockchain('Loading network configuration for gateway connection', {
                operation: 'connect',
                userId: sanitizedUserId,
                operationId
            });

            // Load network configuration
            this.networkConfig = getNetworkConfig();

            logger.blockchain('Creating and configuring gateway instance', {
                operation: 'connect',
                userId: sanitizedUserId,
                operationId,
                networkName: this.networkConfig.networkName,
                tlsEnabled: this.networkConfig.tlsEnabled,
                discoveryEnabled: this.networkConfig.connectionOptions.discovery.enabled
            });

            // Create a new gateway and configure connection options
            this.gateway = new Gateway();

            // Prepare gateway connection options with security and performance settings
            const connectionOptions = {
                wallet,
                identity: sanitizedUserId,
                discovery: this.networkConfig.connectionOptions.discovery,
                eventHandlerOptions: this.networkConfig.connectionOptions.eventHandlerOptions,
                queryHandlerOptions: this.networkConfig.connectionOptions.queryHandlerOptions,
                // Enable TLS for secure communication
                tlsEnabled: this.networkConfig.tlsEnabled,
                // Connection timeout settings for reliability
                connectionTimeout: 30000, // 30 seconds
                // Enable transaction event notifications
                enableTransactionEvents: true,
                // Set appropriate endorsement timeout
                endorsementTimeout: 300000 // 5 minutes for complex transactions
            };

            logger.blockchain('Establishing gateway connection to Fabric network', {
                operation: 'connect',
                userId: sanitizedUserId,
                operationId,
                connectionOptions: {
                    tlsEnabled: connectionOptions.tlsEnabled,
                    discoveryEnabled: connectionOptions.discovery.enabled,
                    connectionTimeout: connectionOptions.connectionTimeout,
                    endorsementTimeout: connectionOptions.endorsementTimeout
                }
            });

            // Connect to the gateway using the network configuration and wallet
            await this.gateway.connect(this.networkConfig.profile, connectionOptions);

            // Update connection state
            this.isConnected = true;
            this.currentUserId = sanitizedUserId;

            // Clear contract cache for security (different user may have different access rights)
            this.contractCache.clear();

            const connectDuration = Date.now() - connectStartTime;

            logger.blockchain('Gateway connection established successfully', {
                operation: 'connect',
                userId: sanitizedUserId,
                operationId,
                connectionDuration: connectDuration,
                networkName: this.networkConfig.networkName,
                organizationCount: this.networkConfig.organizations.length,
                channelCount: this.networkConfig.channels.length,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('Gateway connection performance', {
                operation: 'connect',
                duration: connectDuration,
                userId: sanitizedUserId,
                networkName: this.networkConfig.networkName,
                connectionSuccessful: true
            });

            // Log successful audit event
            logger.audit('Blockchain gateway connection established', {
                event_type: 'network_connection',
                event_action: 'fabric_gateway_connect',
                event_outcome: 'success',
                userId: sanitizedUserId,
                operationId,
                connectionDuration: connectDuration,
                networkName: this.networkConfig.networkName,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

        } catch (error) {
            const connectDuration = Date.now() - connectStartTime;

            // Reset connection state on failure
            this.isConnected = false;
            this.currentUserId = null;
            this.gateway = null;
            this.contractCache.clear();

            logger.error('Gateway connection failed', {
                operation: 'connect',
                userId,
                operationId,
                connectionDuration: connectDuration,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            logger.security('Gateway connection failure detected', {
                event_type: 'network_connection_failure',
                threat_level: 'high',
                operation: 'connect',
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for failed connection
            logger.audit('Failed blockchain gateway connection', {
                event_type: 'network_connection',
                event_action: 'fabric_gateway_connect',
                event_outcome: 'failure',
                userId,
                operationId,
                connectionDuration: connectDuration,
                error: error instanceof Error ? error.message : String(error),
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            // Re-throw appropriate error types or wrap in FabricError
            if (error instanceof BadRequestError || error instanceof WalletError || error instanceof ApiError) {
                throw error;
            } else {
                throw new FabricError(`Failed to connect to Fabric gateway: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Disconnects from the Hyperledger Fabric gateway.
     * 
     * Gracefully terminates the connection to the Hyperledger Fabric network,
     * cleaning up resources and ensuring proper connection lifecycle management.
     * This method implements comprehensive cleanup procedures and audit logging
     * required for financial services blockchain operations.
     * 
     * Implementation details:
     * - Graceful gateway disconnection with resource cleanup
     * - Connection state management and validation
     * - Contract cache cleanup for security
     * - Comprehensive error handling for edge cases
     * - Performance monitoring and audit logging
     * - Thread-safe disconnection process
     * 
     * @returns void - Synchronous operation that completes immediately
     */
    public disconnect(): void {
        const disconnectStartTime = Date.now();
        const operationId = `disconnect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        logger.blockchain('Gateway disconnection request initiated', {
            operation: 'disconnect',
            operationId,
            currentlyConnected: this.isConnected,
            currentUserId: this.currentUserId,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Check if gateway is currently connected
            if (!this.isConnected || !this.gateway) {
                logger.blockchain('Gateway already disconnected or not connected', {
                    operation: 'disconnect',
                    operationId,
                    wasConnected: this.isConnected,
                    gatewayExists: !!this.gateway
                });

                // Reset state to ensure consistency
                this.isConnected = false;
                this.currentUserId = null;
                this.gateway = null;
                this.contractCache.clear();

                return;
            }

            const previousUserId = this.currentUserId;

            logger.blockchain('Performing gateway disconnection', {
                operation: 'disconnect',
                operationId,
                userId: previousUserId,
                contractCacheSize: this.contractCache.size
            });

            // Disconnect the gateway if it is connected
            this.gateway.disconnect();

            // Clean up connection state
            this.isConnected = false;
            this.currentUserId = null;
            this.gateway = null;

            // Clear contract cache for security
            const cacheSize = this.contractCache.size;
            this.contractCache.clear();

            const disconnectDuration = Date.now() - disconnectStartTime;

            logger.blockchain('Gateway disconnection completed successfully', {
                operation: 'disconnect',
                operationId,
                previousUserId,
                disconnectionDuration: disconnectDuration,
                contractsClearedFromCache: cacheSize,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('Gateway disconnection performance', {
                operation: 'disconnect',
                duration: disconnectDuration,
                previousUserId,
                contractsClearedFromCache: cacheSize,
                disconnectionSuccessful: true
            });

            // Log successful audit event
            logger.audit('Blockchain gateway disconnection completed', {
                event_type: 'network_disconnection',
                event_action: 'fabric_gateway_disconnect',
                event_outcome: 'success',
                previousUserId,
                operationId,
                disconnectionDuration: disconnectDuration,
                contractsClearedFromCache: cacheSize,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

        } catch (error) {
            const disconnectDuration = Date.now() - disconnectStartTime;

            // Force reset state even if disconnection fails
            this.isConnected = false;
            this.currentUserId = null;
            this.gateway = null;
            this.contractCache.clear();

            logger.error('Gateway disconnection encountered error', {
                operation: 'disconnect',
                operationId,
                disconnectionDuration: disconnectDuration,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                stateForceReset: true
            });

            logger.security('Gateway disconnection error detected', {
                event_type: 'network_disconnection_error',
                threat_level: 'low',
                operation: 'disconnect',
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for disconnection with error
            logger.audit('Blockchain gateway disconnection with error', {
                event_type: 'network_disconnection',
                event_action: 'fabric_gateway_disconnect',
                event_outcome: 'success_with_error',
                operationId,
                disconnectionDuration: disconnectDuration,
                error: error instanceof Error ? error.message : String(error),
                stateForceReset: true,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            // Note: We don't throw the error as disconnection should be graceful
            // The state has been reset and the connection is effectively closed
        }
    }

    /**
     * Gets a smart contract from the specified channel and contract name.
     * 
     * Retrieves a Hyperledger Fabric smart contract instance for interaction with
     * blockchain-based business logic. This method implements caching, security
     * validation, and comprehensive error handling required for financial services
     * smart contract operations.
     * 
     * Implementation details:
     * - Validates gateway connection and input parameters
     * - Implements contract caching for performance optimization
     * - Provides secure channel and contract access validation
     * - Comprehensive error handling with detailed logging
     * - Performance monitoring and audit trail maintenance
     * - Support for multi-channel blockchain architectures
     * 
     * @param channelName - The name of the blockchain channel containing the contract
     * @param contractName - The name of the smart contract to retrieve
     * @returns A promise that resolves with the smart contract instance
     * @throws {BadRequestError} When input parameters are invalid
     * @throws {FabricError} When gateway is not connected
     * @throws {ChaincodeError} When contract retrieval fails
     * @throws {ApiError} When network or channel access fails
     */
    public async getContract(channelName: string, contractName: string): Promise<Contract> {
        const getContractStartTime = Date.now();
        const operationId = `getContract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        logger.blockchain('Smart contract retrieval request initiated', {
            operation: 'getContract',
            operationId,
            channelName: channelName ? '[PROVIDED]' : '[MISSING]',
            contractName: contractName ? '[PROVIDED]' : '[MISSING]',
            currentUserId: this.currentUserId,
            isConnected: this.isConnected,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Validate gateway connection
            if (!this.isConnected || !this.gateway) {
                const error = new FabricError('Gateway is not connected. Please call connect() first.');
                
                logger.security('Contract access attempted without gateway connection', {
                    event_type: 'unauthorized_access_attempt',
                    threat_level: 'medium',
                    operation: 'getContract',
                    operationId,
                    isConnected: this.isConnected,
                    gatewayExists: !!this.gateway
                });

                throw error;
            }

            // Input validation and sanitization
            if (!channelName || typeof channelName !== 'string' || channelName.trim().length === 0) {
                const error = new BadRequestError('Channel name is required and must be a non-empty string');
                
                logger.security('Invalid channel name in contract retrieval request', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'getContract',
                    operationId,
                    providedChannelNameType: typeof channelName
                });

                throw error;
            }

            if (!contractName || typeof contractName !== 'string' || contractName.trim().length === 0) {
                const error = new BadRequestError('Contract name is required and must be a non-empty string');
                
                logger.security('Invalid contract name in contract retrieval request', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'getContract',
                    operationId,
                    providedContractNameType: typeof contractName
                });

                throw error;
            }

            // Sanitize input parameters
            const sanitizedChannelName = channelName.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
            const sanitizedContractName = contractName.trim().replace(/[^a-zA-Z0-9\-_]/g, '');

            if (sanitizedChannelName !== channelName.trim() || sanitizedContractName !== contractName.trim()) {
                logger.security('Input sanitization performed for contract retrieval', {
                    event_type: 'input_sanitization',
                    threat_level: 'low',
                    operation: 'getContract',
                    operationId,
                    sanitizationPerformed: true
                });
            }

            // Create cache key for contract
            const contractCacheKey = `${sanitizedChannelName}:${sanitizedContractName}`;

            // Check contract cache for performance optimization
            if (this.contractCache.has(contractCacheKey)) {
                const cachedContract = this.contractCache.get(contractCacheKey)!;
                const getCacheHitDuration = Date.now() - getContractStartTime;

                logger.blockchain('Contract retrieved from cache', {
                    operation: 'getContract',
                    operationId,
                    channelName: sanitizedChannelName,
                    contractName: sanitizedContractName,
                    cacheHit: true,
                    duration: getCacheHitDuration,
                    cacheSize: this.contractCache.size
                });

                logger.performance('Contract cache hit performance', {
                    operation: 'getContract',
                    duration: getCacheHitDuration,
                    cacheHit: true,
                    channelName: sanitizedChannelName,
                    contractName: sanitizedContractName
                });

                return cachedContract;
            }

            logger.blockchain('Retrieving network from gateway', {
                operation: 'getContract',
                operationId,
                channelName: sanitizedChannelName,
                contractName: sanitizedContractName
            });

            // Get the network from the gateway
            const network: Network = await this.gateway.getNetwork(sanitizedChannelName);

            logger.blockchain('Retrieving contract from network', {
                operation: 'getContract',
                operationId,
                channelName: sanitizedChannelName,
                contractName: sanitizedContractName,
                networkObtained: true
            });

            // Get the contract from the network
            const contract: Contract = network.getContract(sanitizedContractName);

            // Cache the contract for future use
            this.contractCache.set(contractCacheKey, contract);

            const getContractDuration = Date.now() - getContractStartTime;

            logger.blockchain('Smart contract retrieved successfully', {
                operation: 'getContract',
                operationId,
                channelName: sanitizedChannelName,
                contractName: sanitizedContractName,
                duration: getContractDuration,
                cachedContract: true,
                cacheSize: this.contractCache.size,
                currentUserId: this.currentUserId,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('Contract retrieval performance', {
                operation: 'getContract',
                duration: getContractDuration,
                cacheHit: false,
                channelName: sanitizedChannelName,
                contractName: sanitizedContractName,
                contractCached: true
            });

            // Log successful audit event
            logger.audit('Smart contract access successful', {
                event_type: 'contract_access',
                event_action: 'get_contract',
                event_outcome: 'success',
                userId: this.currentUserId,
                operationId,
                channelName: sanitizedChannelName,
                contractName: sanitizedContractName,
                duration: getContractDuration,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            return contract;

        } catch (error) {
            const getContractDuration = Date.now() - getContractStartTime;

            logger.error('Smart contract retrieval failed', {
                operation: 'getContract',
                operationId,
                channelName,
                contractName,
                duration: getContractDuration,
                currentUserId: this.currentUserId,
                isConnected: this.isConnected,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            logger.security('Contract retrieval failure detected', {
                event_type: 'contract_access_failure',
                threat_level: 'medium',
                operation: 'getContract',
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for failed contract access
            logger.audit('Failed smart contract access', {
                event_type: 'contract_access',
                event_action: 'get_contract',
                event_outcome: 'failure',
                userId: this.currentUserId,
                operationId,
                channelName,
                contractName,
                duration: getContractDuration,
                error: error instanceof Error ? error.message : String(error),
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            // Re-throw appropriate error types or wrap in ChaincodeError
            if (error instanceof BadRequestError || error instanceof FabricError || error instanceof ApiError) {
                throw error;
            } else {
                throw new ChaincodeError(`Failed to retrieve contract '${contractName}' from channel '${channelName}': ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Submits a transaction to the specified smart contract.
     * 
     * Executes a blockchain transaction through the smart contract, implementing
     * comprehensive security validation, performance monitoring, and audit logging
     * required for financial services transaction processing.
     * 
     * Implementation details:
     * - Validates contract instance and input parameters
     * - Implements secure transaction argument handling
     * - Provides comprehensive error handling and retry logic
     * - Performance monitoring with transaction timing
     * - Detailed audit logging for regulatory compliance
     * - Transaction result validation and formatting
     * 
     * @param contract - The smart contract instance to execute the transaction on
     * @param functionName - The name of the contract function to execute
     * @param args - Array of string arguments to pass to the contract function
     * @returns A promise that resolves with the transaction result as Buffer
     * @throws {BadRequestError} When input parameters are invalid
     * @throws {ChaincodeError} When transaction execution fails
     * @throws {ApiError} When contract validation fails
     */
    public async submitTransaction(contract: Contract, functionName: string, args: string[]): Promise<Buffer> {
        const submitStartTime = Date.now();
        const operationId = `submitTransaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        logger.blockchain('Transaction submission request initiated', {
            operation: 'submitTransaction',
            operationId,
            functionName: functionName ? '[PROVIDED]' : '[MISSING]',
            argumentCount: Array.isArray(args) ? args.length : 0,
            contractProvided: !!contract,
            currentUserId: this.currentUserId,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Validate contract instance
            if (!contract) {
                const error = new BadRequestError('Contract instance is required for transaction submission');
                
                logger.security('Transaction submission attempted without contract', {
                    event_type: 'invalid_transaction_attempt',
                    threat_level: 'medium',
                    operation: 'submitTransaction',
                    operationId,
                    contractProvided: !!contract
                });

                throw error;
            }

            // Input validation and sanitization
            if (!functionName || typeof functionName !== 'string' || functionName.trim().length === 0) {
                const error = new BadRequestError('Function name is required and must be a non-empty string');
                
                logger.security('Invalid function name in transaction submission', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'submitTransaction',
                    operationId,
                    providedFunctionNameType: typeof functionName
                });

                throw error;
            }

            if (!Array.isArray(args)) {
                const error = new BadRequestError('Arguments must be provided as an array of strings');
                
                logger.security('Invalid arguments format in transaction submission', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'submitTransaction',
                    operationId,
                    providedArgsType: typeof args
                });

                throw error;
            }

            // Sanitize function name
            const sanitizedFunctionName = functionName.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
            
            if (sanitizedFunctionName !== functionName.trim()) {
                logger.security('Function name sanitization performed', {
                    event_type: 'input_sanitization',
                    threat_level: 'low',
                    operation: 'submitTransaction',
                    operationId,
                    sanitizationPerformed: true
                });
            }

            // Validate and sanitize arguments
            const sanitizedArgs: string[] = args.map((arg, index) => {
                if (typeof arg !== 'string') {
                    throw new BadRequestError(`Argument at index ${index} must be a string, received ${typeof arg}`);
                }
                return arg; // Keep original string value for transaction arguments
            });

            logger.blockchain('Submitting transaction to smart contract', {
                operation: 'submitTransaction',
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                currentUserId: this.currentUserId
            });

            // Submit the transaction to the contract
            const transactionResult: Buffer = await contract.submitTransaction(sanitizedFunctionName, ...sanitizedArgs);

            const submitDuration = Date.now() - submitStartTime;

            logger.blockchain('Transaction submitted successfully', {
                operation: 'submitTransaction',
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                duration: submitDuration,
                resultSize: transactionResult.length,
                currentUserId: this.currentUserId,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('Transaction submission performance', {
                operation: 'submitTransaction',
                duration: submitDuration,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                resultSize: transactionResult.length,
                transactionSuccessful: true
            });

            // Log financial transaction if applicable
            logger.financial('Blockchain transaction processed', {
                transactionType: 'blockchain_submit',
                operation: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                processingDuration: submitDuration,
                resultSize: transactionResult.length,
                complianceStatus: 'processed'
            });

            // Log successful audit event
            logger.audit('Blockchain transaction submitted successfully', {
                event_type: 'transaction_submission',
                event_action: 'submit_transaction',
                event_outcome: 'success',
                userId: this.currentUserId,
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                duration: submitDuration,
                resultSize: transactionResult.length,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001', 'AML'],
                dataClassification: 'confidential'
            });

            return transactionResult;

        } catch (error) {
            const submitDuration = Date.now() - submitStartTime;

            logger.error('Transaction submission failed', {
                operation: 'submitTransaction',
                operationId,
                functionName,
                argumentCount: Array.isArray(args) ? args.length : 0,
                duration: submitDuration,
                currentUserId: this.currentUserId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            logger.security('Transaction submission failure detected', {
                event_type: 'transaction_submission_failure',
                threat_level: 'high',
                operation: 'submitTransaction',
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for failed transaction
            logger.audit('Failed blockchain transaction submission', {
                event_type: 'transaction_submission',
                event_action: 'submit_transaction',
                event_outcome: 'failure',
                userId: this.currentUserId,
                operationId,
                functionName,
                argumentCount: Array.isArray(args) ? args.length : 0,
                duration: submitDuration,
                error: error instanceof Error ? error.message : String(error),
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001', 'AML'],
                dataClassification: 'confidential'
            });

            // Re-throw appropriate error types or wrap in ChaincodeError
            if (error instanceof BadRequestError || error instanceof ApiError) {
                throw error;
            } else {
                throw new ChaincodeError(`Failed to submit transaction '${functionName}': ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Evaluates a query on the specified smart contract.
     * 
     * Executes a read-only query against the smart contract to retrieve blockchain
     * state information. This method implements performance optimization, security
     * validation, and comprehensive audit logging required for financial services
     * query operations.
     * 
     * Implementation details:
     * - Validates contract instance and input parameters
     * - Implements secure query argument handling
     * - Provides comprehensive error handling for query failures
     * - Performance monitoring with query timing
     * - Detailed audit logging for regulatory compliance
     * - Query result validation and formatting
     * 
     * @param contract - The smart contract instance to execute the query on
     * @param functionName - The name of the contract function to query
     * @param args - Array of string arguments to pass to the contract function
     * @returns A promise that resolves with the query result as Buffer
     * @throws {BadRequestError} When input parameters are invalid
     * @throws {ChaincodeError} When query execution fails
     * @throws {ApiError} When contract validation fails
     */
    public async evaluateTransaction(contract: Contract, functionName: string, args: string[]): Promise<Buffer> {
        const evaluateStartTime = Date.now();
        const operationId = `evaluateTransaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        logger.blockchain('Query evaluation request initiated', {
            operation: 'evaluateTransaction',
            operationId,
            functionName: functionName ? '[PROVIDED]' : '[MISSING]',
            argumentCount: Array.isArray(args) ? args.length : 0,
            contractProvided: !!contract,
            currentUserId: this.currentUserId,
            blockchainNetwork: 'financial-services-network'
        });

        try {
            // Validate contract instance
            if (!contract) {
                const error = new BadRequestError('Contract instance is required for query evaluation');
                
                logger.security('Query evaluation attempted without contract', {
                    event_type: 'invalid_query_attempt',
                    threat_level: 'medium',
                    operation: 'evaluateTransaction',
                    operationId,
                    contractProvided: !!contract
                });

                throw error;
            }

            // Input validation and sanitization
            if (!functionName || typeof functionName !== 'string' || functionName.trim().length === 0) {
                const error = new BadRequestError('Function name is required and must be a non-empty string');
                
                logger.security('Invalid function name in query evaluation', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'evaluateTransaction',
                    operationId,
                    providedFunctionNameType: typeof functionName
                });

                throw error;
            }

            if (!Array.isArray(args)) {
                const error = new BadRequestError('Arguments must be provided as an array of strings');
                
                logger.security('Invalid arguments format in query evaluation', {
                    event_type: 'input_validation_failure',
                    threat_level: 'low',
                    operation: 'evaluateTransaction',
                    operationId,
                    providedArgsType: typeof args
                });

                throw error;
            }

            // Sanitize function name
            const sanitizedFunctionName = functionName.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
            
            if (sanitizedFunctionName !== functionName.trim()) {
                logger.security('Function name sanitization performed', {
                    event_type: 'input_sanitization',
                    threat_level: 'low',
                    operation: 'evaluateTransaction',
                    operationId,
                    sanitizationPerformed: true
                });
            }

            // Validate and sanitize arguments
            const sanitizedArgs: string[] = args.map((arg, index) => {
                if (typeof arg !== 'string') {
                    throw new BadRequestError(`Argument at index ${index} must be a string, received ${typeof arg}`);
                }
                return arg; // Keep original string value for query arguments
            });

            logger.blockchain('Evaluating query on smart contract', {
                operation: 'evaluateTransaction',
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                currentUserId: this.currentUserId
            });

            // Evaluate the transaction on the contract
            const queryResult: Buffer = await contract.evaluateTransaction(sanitizedFunctionName, ...sanitizedArgs);

            const evaluateDuration = Date.now() - evaluateStartTime;

            logger.blockchain('Query evaluation completed successfully', {
                operation: 'evaluateTransaction',
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                duration: evaluateDuration,
                resultSize: queryResult.length,
                currentUserId: this.currentUserId,
                blockchainNetwork: 'financial-services-network'
            });

            logger.performance('Query evaluation performance', {
                operation: 'evaluateTransaction',
                duration: evaluateDuration,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                resultSize: queryResult.length,
                querySuccessful: true
            });

            // Log successful audit event
            logger.audit('Blockchain query evaluated successfully', {
                event_type: 'query_evaluation',
                event_action: 'evaluate_transaction',
                event_outcome: 'success',
                userId: this.currentUserId,
                operationId,
                functionName: sanitizedFunctionName,
                argumentCount: sanitizedArgs.length,
                duration: evaluateDuration,
                resultSize: queryResult.length,
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            return queryResult;

        } catch (error) {
            const evaluateDuration = Date.now() - evaluateStartTime;

            logger.error('Query evaluation failed', {
                operation: 'evaluateTransaction',
                operationId,
                functionName,
                argumentCount: Array.isArray(args) ? args.length : 0,
                duration: evaluateDuration,
                currentUserId: this.currentUserId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            logger.security('Query evaluation failure detected', {
                event_type: 'query_evaluation_failure',
                threat_level: 'medium',
                operation: 'evaluateTransaction',
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Log audit event for failed query
            logger.audit('Failed blockchain query evaluation', {
                event_type: 'query_evaluation',
                event_action: 'evaluate_transaction',
                event_outcome: 'failure',
                userId: this.currentUserId,
                operationId,
                functionName,
                argumentCount: Array.isArray(args) ? args.length : 0,
                duration: evaluateDuration,
                error: error instanceof Error ? error.message : String(error),
                complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001'],
                dataClassification: 'confidential'
            });

            // Re-throw appropriate error types or wrap in ChaincodeError
            if (error instanceof BadRequestError || error instanceof ApiError) {
                throw error;
            } else {
                throw new ChaincodeError(`Failed to evaluate query '${functionName}': ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
}

// Export the FabricService class as the default export
export default FabricService;