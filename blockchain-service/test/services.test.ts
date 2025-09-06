import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals'; // ^29.7.0 - Jest testing framework for unit and integration tests
import { Gateway, Network, Contract, Wallet, Wallets } from 'fabric-network'; // ^2.2.18 - Hyperledger Fabric SDK for mocking blockchain components
import * as path from 'path'; // ^0.12.7 - Node.js path utilities for file system operations

import { ChaincodeService } from '../src/services/chaincode.service';
import { FabricService } from '../src/services/fabric.service';
import { getWallet, getWalletForUser, isWalletExists } from '../src/services/wallet.service';
import { ApiError, FabricError, WalletError, ChaincodeError, BadRequestError, NotFoundError } from '../src/utils/errors';

// Mock external dependencies
jest.mock('fabric-network');
jest.mock('../src/config/network');
jest.mock('../src/utils/logger');
jest.mock('../src/config');

// Type definitions for mocked dependencies
const mockGateway = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  getNetwork: jest.fn(),
} as jest.Mocked<Gateway>;

const mockNetwork = {
  getContract: jest.fn(),
} as jest.Mocked<Network>;

const mockContract = {
  evaluateTransaction: jest.fn(),
  submitTransaction: jest.fn(),
} as jest.Mocked<Contract>;

const mockWallet = {
  get: jest.fn(),
} as jest.Mocked<Wallet>;

// Mock implementations
const mockWallets = {
  newFileSystemWallet: jest.fn(),
} as jest.Mocked<typeof Wallets>;

const mockGetNetworkConfig = jest.fn();
const mockLogger = {
  blockchain: jest.fn(),
  security: jest.fn(),
  performance: jest.fn(),
  audit: jest.fn(),
  financial: jest.fn(),
  error: jest.fn(),
};

const mockConfig = {
  network: {
    defaultChannel: 'test-channel',
    defaultChaincode: 'test-chaincode',
  },
};

// Configure mocks
beforeAll(() => {
  (require('fabric-network') as any).Gateway = jest.fn(() => mockGateway);
  (require('fabric-network') as any).Wallets = mockWallets;
  (require('../src/config/network') as any).getNetworkConfig = mockGetNetworkConfig;
  (require('../src/utils/logger') as any).logger = mockLogger;
  (require('../src/config') as any).config = mockConfig;
});

/**
 * Test Suite: ChaincodeService
 * 
 * Comprehensive unit and integration tests for ChaincodeService, which provides
 * enterprise-grade interaction with Hyperledger Fabric smart contracts for the
 * blockchain-based settlement network (F-009).
 * 
 * Test Coverage:
 * - Constructor validation and dependency injection
 * - Contract retrieval with caching and error handling
 * - Transaction evaluation (read operations) with security validation
 * - Transaction submission (write operations) with audit logging
 * - Error handling for various failure scenarios
 * - Performance monitoring and compliance logging
 */
describe('ChaincodeService', () => {
  let chaincodeService: ChaincodeService;
  let mockFabricService: jest.Mocked<FabricService>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock FabricService with required methods
    mockFabricService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getGateway: jest.fn(),
      getContract: jest.fn(),
      submitTransaction: jest.fn(),
      evaluateTransaction: jest.fn(),
    } as unknown as jest.Mocked<FabricService>;

    // Setup successful default mock responses
    mockFabricService.getGateway.mockResolvedValue(mockGateway);
    mockGateway.getNetwork.mockResolvedValue(mockNetwork);
    mockNetwork.getContract.mockReturnValue(mockContract);
  });

  describe('Constructor', () => {
    it('should initialize ChaincodeService with valid FabricService dependency', () => {
      // Arrange & Act
      const service = new ChaincodeService(mockFabricService);

      // Assert
      expect(service).toBeInstanceOf(ChaincodeService);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'ChaincodeService initialization started',
        expect.objectContaining({
          operation: 'constructor',
          blockchainNetwork: 'financial-services-network'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Chaincode service initialized',
        expect.objectContaining({
          event_type: 'service_initialization',
          event_outcome: 'success',
          complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001', 'Basel_III']
        })
      );
    });

    it('should throw error when FabricService is null', () => {
      // Arrange & Act & Assert
      expect(() => {
        new ChaincodeService(null as any);
      }).toThrow('FabricService is required for ChaincodeService initialization');

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid dependency injection detected',
        expect.objectContaining({
          event_type: 'dependency_injection_failure',
          threat_level: 'high'
        })
      );
    });

    it('should throw error when channel configuration is missing', () => {
      // Arrange
      const configWithoutChannel = {
        network: {
          defaultChaincode: 'test-chaincode'
        }
      };
      (require('../src/config') as any).config = configWithoutChannel;

      // Act & Assert
      expect(() => {
        new ChaincodeService(mockFabricService);
      }).toThrow('Channel name configuration is missing or invalid');

      // Restore config
      (require('../src/config') as any).config = mockConfig;
    });

    it('should throw error when chaincode configuration is missing', () => {
      // Arrange
      const configWithoutChaincode = {
        network: {
          defaultChannel: 'test-channel'
        }
      };
      (require('../src/config') as any).config = configWithoutChaincode;

      // Act & Assert
      expect(() => {
        new ChaincodeService(mockFabricService);
      }).toThrow('Chaincode name configuration is missing or invalid');

      // Restore config
      (require('../src/config') as any).config = mockConfig;
    });
  });

  describe('getContract', () => {
    beforeEach(() => {
      chaincodeService = new ChaincodeService(mockFabricService);
    });

    it('should successfully retrieve contract from gateway', async () => {
      // Arrange
      const expectedContract = mockContract;

      // Act
      const result = await chaincodeService.getContract();

      // Assert
      expect(result).toBe(expectedContract);
      expect(mockFabricService.getGateway).toHaveBeenCalledTimes(1);
      expect(mockGateway.getNetwork).toHaveBeenCalledWith('test-channel');
      expect(mockNetwork.getContract).toHaveBeenCalledWith('test-chaincode');
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Smart contract retrieved successfully',
        expect.objectContaining({
          operation: 'getContract',
          channelName: 'test-channel',
          chaincodeName: 'test-chaincode',
          contractObtained: true
        })
      );
    });

    it('should handle gateway connection failure', async () => {
      // Arrange
      mockFabricService.getGateway.mockResolvedValue(null as any);

      // Act & Assert
      await expect(chaincodeService.getContract()).rejects.toThrow(
        'Gateway is not available from FabricService'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Gateway access failure in contract retrieval',
        expect.objectContaining({
          event_type: 'gateway_access_failure',
          threat_level: 'high'
        })
      );
    });

    it('should handle network retrieval failure', async () => {
      // Arrange
      mockGateway.getNetwork.mockResolvedValue(null as any);

      // Act & Assert
      await expect(chaincodeService.getContract()).rejects.toThrow(
        "Network for channel 'test-channel' is not available"
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Network access failure in contract retrieval',
        expect.objectContaining({
          event_type: 'network_access_failure',
          threat_level: 'high'
        })
      );
    });

    it('should handle contract retrieval failure', async () => {
      // Arrange
      mockNetwork.getContract.mockReturnValue(null as any);

      // Act & Assert
      await expect(chaincodeService.getContract()).rejects.toThrow(
        "Contract 'test-chaincode' is not available from channel 'test-channel'"
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Contract access failure in retrieval',
        expect.objectContaining({
          event_type: 'contract_access_failure',
          threat_level: 'high'
        })
      );
    });
  });

  describe('evaluateTransaction', () => {
    beforeEach(() => {
      chaincodeService = new ChaincodeService(mockFabricService);
    });

    it('should successfully evaluate transaction with valid parameters', async () => {
      // Arrange
      const functionName = 'queryAsset';
      const args = ['asset123'];
      const expectedResult = Buffer.from('{"id":"asset123","value":"1000"}');
      mockContract.evaluateTransaction.mockResolvedValue(expectedResult);

      // Act
      const result = await chaincodeService.evaluateTransaction(functionName, ...args);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockContract.evaluateTransaction).toHaveBeenCalledWith(functionName, ...args);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Transaction evaluation completed successfully',
        expect.objectContaining({
          operation: 'evaluateTransaction',
          functionName,
          argumentCount: args.length,
          resultSize: expectedResult.length
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain transaction evaluation successful',
        expect.objectContaining({
          event_type: 'transaction_evaluation',
          event_outcome: 'success',
          complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001', 'Basel_III']
        })
      );
    });

    it('should handle empty function name', async () => {
      // Arrange & Act & Assert
      await expect(chaincodeService.evaluateTransaction('')).rejects.toThrow(
        'Function name is required and must be a non-empty string'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid function name in transaction evaluation',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'medium'
        })
      );
    });

    it('should handle null function name', async () => {
      // Arrange & Act & Assert
      await expect(chaincodeService.evaluateTransaction(null as any)).rejects.toThrow(
        'Function name is required and must be a non-empty string'
      );
    });

    it('should handle invalid arguments type', async () => {
      // Arrange & Act & Assert
      await expect(chaincodeService.evaluateTransaction('testFunction', 'arg1', 123 as any)).rejects.toThrow(
        'Argument at index 1 must be a string, received number'
      );
    });

    it('should sanitize function name with special characters', async () => {
      // Arrange
      const functionName = 'query<Asset>';
      const sanitizedName = 'queryAsset';
      const expectedResult = Buffer.from('test');
      mockContract.evaluateTransaction.mockResolvedValue(expectedResult);

      // Act
      const result = await chaincodeService.evaluateTransaction(functionName);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockContract.evaluateTransaction).toHaveBeenCalledWith(sanitizedName);
      expect(mockLogger.security).toHaveBeenCalledWith(
        'Function name sanitization performed',
        expect.objectContaining({
          event_type: 'input_sanitization',
          sanitizationPerformed: true
        })
      );
    });

    it('should handle contract evaluation failure', async () => {
      // Arrange
      const error = new Error('Chaincode evaluation failed');
      mockContract.evaluateTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(chaincodeService.evaluateTransaction('testFunction')).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Transaction evaluation failed',
        expect.objectContaining({
          operation: 'evaluateTransaction',
          error: error.message
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain transaction evaluation',
        expect.objectContaining({
          event_type: 'transaction_evaluation',
          event_outcome: 'failure'
        })
      );
    });
  });

  describe('submitTransaction', () => {
    beforeEach(() => {
      chaincodeService = new ChaincodeService(mockFabricService);
    });

    it('should successfully submit transaction with valid parameters', async () => {
      // Arrange
      const functionName = 'createAsset';
      const args = ['asset123', '1000', 'USD'];
      const expectedResult = Buffer.from('{"txId":"tx123","status":"SUCCESS"}');
      mockContract.submitTransaction.mockResolvedValue(expectedResult);

      // Act
      const result = await chaincodeService.submitTransaction(functionName, ...args);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockContract.submitTransaction).toHaveBeenCalledWith(functionName, ...args);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Transaction submission completed successfully',
        expect.objectContaining({
          operation: 'submitTransaction',
          functionName,
          argumentCount: args.length,
          resultSize: expectedResult.length
        })
      );
      expect(mockLogger.financial).toHaveBeenCalledWith(
        'Blockchain transaction processed',
        expect.objectContaining({
          transactionType: 'blockchain_submit',
          operation: functionName,
          settlementNetwork: 'hyperledger-fabric'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain transaction submitted successfully',
        expect.objectContaining({
          event_type: 'transaction_submission',
          event_outcome: 'success',
          transactionCategory: 'financial_settlement'
        })
      );
    });

    it('should handle empty function name in submission', async () => {
      // Arrange & Act & Assert
      await expect(chaincodeService.submitTransaction('')).rejects.toThrow(
        'Function name is required and must be a non-empty string'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid function name in transaction submission',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'high'
        })
      );
    });

    it('should handle arguments with excessive length', async () => {
      // Arrange
      const longArg = 'a'.repeat(10001); // Exceeds 10000 character limit

      // Act & Assert
      await expect(chaincodeService.submitTransaction('testFunction', longArg)).rejects.toThrow(
        'Argument at index 0 exceeds maximum length of 10000 characters'
      );
    });

    it('should handle contract submission failure', async () => {
      // Arrange
      const error = new Error('Chaincode submission failed');
      mockContract.submitTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(chaincodeService.submitTransaction('testFunction')).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Transaction submission failed',
        expect.objectContaining({
          operation: 'submitTransaction',
          error: error.message
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain transaction submission',
        expect.objectContaining({
          event_type: 'transaction_submission',
          event_outcome: 'failure'
        })
      );
    });

    it('should handle network timeout during submission', async () => {
      // Arrange
      const timeoutError = new Error('Transaction timeout');
      mockContract.submitTransaction.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(chaincodeService.submitTransaction('createAsset', 'asset123')).rejects.toThrow(timeoutError);

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Transaction submission failure detected',
        expect.objectContaining({
          event_type: 'transaction_submission_failure',
          threat_level: 'high'
        })
      );
    });
  });
});

/**
 * Test Suite: FabricService
 * 
 * Comprehensive unit and integration tests for FabricService, which manages
 * Hyperledger Fabric network connections and gateway operations for the
 * blockchain-based settlement network (F-009).
 * 
 * Test Coverage:
 * - Service initialization and configuration validation
 * - Gateway connection establishment with user authentication
 * - Network disconnection and cleanup procedures
 * - Contract retrieval with caching and performance optimization
 * - Transaction submission and evaluation through gateway
 * - Error handling for network failures and security violations
 * - Audit logging and compliance monitoring
 */
describe('FabricService', () => {
  let fabricService: FabricService;
  let mockWalletService: jest.Mocked<any>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup network configuration mock
    mockGetNetworkConfig.mockReturnValue({
      networkName: 'financial-services-network',
      environment: 'test',
      tlsEnabled: true,
      walletPath: '/test/wallets',
      profile: {
        peers: ['peer0.bank1.financial.com'],
        orderers: ['orderer.financial.com']
      },
      organizations: ['Bank1MSP', 'Bank2MSP'],
      channels: ['settlement-channel'],
      connectionOptions: {
        discovery: { enabled: true, asLocalhost: false },
        eventHandlerOptions: { strategy: 'NETWORK_SCOPE_ALLFORTX' },
        queryHandlerOptions: { strategy: 'ROUND_ROBIN' }
      }
    });

    // Setup wallet service mock
    mockWalletService = {
      getWalletForUser: jest.fn()
    };
    mockWalletService.getWalletForUser.mockResolvedValue(mockWallet);

    // Replace wallet service import
    jest.doMock('../src/services/wallet.service', () => ({
      default: mockWalletService
    }));

    fabricService = new (require('../src/services/fabric.service').FabricService)();
  });

  describe('Constructor', () => {
    it('should initialize FabricService with default state', () => {
      // Arrange & Act
      const service = new (require('../src/services/fabric.service').FabricService)();

      // Assert
      expect(service).toBeInstanceOf(require('../src/services/fabric.service').FabricService);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'FabricService initialization started',
        expect.objectContaining({
          blockchainNetwork: 'financial-services-network'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain service initialized',
        expect.objectContaining({
          event_type: 'service_initialization',
          event_outcome: 'success'
        })
      );
    });
  });

  describe('connect', () => {
    it('should successfully connect to gateway with valid user ID', async () => {
      // Arrange
      const userId = 'user123';
      mockGateway.connect.mockResolvedValue(undefined);

      // Act
      await fabricService.connect(userId);

      // Assert
      expect(mockWalletService.getWalletForUser).toHaveBeenCalledWith(userId);
      expect(mockGateway.connect).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identity: userId,
          tlsEnabled: true,
          connectionTimeout: 30000,
          endorsementTimeout: 300000
        })
      );
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Gateway connection established successfully',
        expect.objectContaining({
          operation: 'connect',
          userId,
          networkName: 'financial-services-network'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain gateway connection established',
        expect.objectContaining({
          event_type: 'network_connection',
          event_outcome: 'success',
          userId
        })
      );
    });

    it('should handle empty user ID', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.connect('')).rejects.toThrow(BadRequestError);
      await expect(fabricService.connect('')).rejects.toThrow(
        'User ID is required and must be a non-empty string'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid user ID in gateway connection request',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'medium'
        })
      );
    });

    it('should handle null user ID', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.connect(null as any)).rejects.toThrow(BadRequestError);
    });

    it('should sanitize user ID with special characters', async () => {
      // Arrange
      const userId = 'user<123>';
      const sanitizedUserId = 'user123';

      // Act
      await fabricService.connect(userId);

      // Assert
      expect(mockWalletService.getWalletForUser).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockLogger.security).toHaveBeenCalledWith(
        'User ID sanitization performed during connection',
        expect.objectContaining({
          event_type: 'input_sanitization',
          sanitizationPerformed: true
        })
      );
    });

    it('should reuse existing connection for same user', async () => {
      // Arrange
      const userId = 'user123';
      await fabricService.connect(userId);
      jest.clearAllMocks();

      // Act
      await fabricService.connect(userId);

      // Assert
      expect(mockGateway.connect).not.toHaveBeenCalled();
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Already connected with the same user, reusing connection',
        expect.objectContaining({
          connectionReused: true
        })
      );
    });

    it('should handle wallet service failure', async () => {
      // Arrange
      const userId = 'user123';
      const walletError = new WalletError('Wallet not found');
      mockWalletService.getWalletForUser.mockRejectedValue(walletError);

      // Act & Assert
      await expect(fabricService.connect(userId)).rejects.toThrow(walletError);

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Gateway connection failure detected',
        expect.objectContaining({
          event_type: 'network_connection_failure',
          threat_level: 'high'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain gateway connection',
        expect.objectContaining({
          event_type: 'network_connection',
          event_outcome: 'failure'
        })
      );
    });

    it('should handle gateway connection failure', async () => {
      // Arrange
      const userId = 'user123';
      const connectionError = new Error('Gateway connection failed');
      mockGateway.connect.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(fabricService.connect(userId)).rejects.toThrow(FabricError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Gateway connection failed',
        expect.objectContaining({
          operation: 'connect',
          error: connectionError.message
        })
      );
    });
  });

  describe('disconnect', () => {
    it('should successfully disconnect from gateway', async () => {
      // Arrange
      await fabricService.connect('user123');
      jest.clearAllMocks();

      // Act
      fabricService.disconnect();

      // Assert
      expect(mockGateway.disconnect).toHaveBeenCalledTimes(1);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Gateway disconnection completed successfully',
        expect.objectContaining({
          operation: 'disconnect'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain gateway disconnection completed',
        expect.objectContaining({
          event_type: 'network_disconnection',
          event_outcome: 'success'
        })
      );
    });

    it('should handle disconnection when not connected', () => {
      // Arrange & Act
      fabricService.disconnect();

      // Assert
      expect(mockGateway.disconnect).not.toHaveBeenCalled();
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Gateway already disconnected or not connected',
        expect.objectContaining({
          operation: 'disconnect',
          wasConnected: false
        })
      );
    });

    it('should handle disconnection errors gracefully', async () => {
      // Arrange
      await fabricService.connect('user123');
      const disconnectError = new Error('Disconnect failed');
      mockGateway.disconnect.mockImplementation(() => {
        throw disconnectError;
      });
      jest.clearAllMocks();

      // Act
      fabricService.disconnect();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Gateway disconnection encountered error',
        expect.objectContaining({
          operation: 'disconnect',
          error: disconnectError.message,
          stateForceReset: true
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain gateway disconnection with error',
        expect.objectContaining({
          event_type: 'network_disconnection',
          event_outcome: 'success_with_error'
        })
      );
    });
  });

  describe('getContract', () => {
    beforeEach(async () => {
      await fabricService.connect('user123');
      jest.clearAllMocks();
    });

    it('should successfully retrieve contract from network', async () => {
      // Arrange
      const channelName = 'settlement-channel';
      const contractName = 'settlement-contract';

      // Act
      const result = await fabricService.getContract(channelName, contractName);

      // Assert
      expect(result).toBe(mockContract);
      expect(mockGateway.getNetwork).toHaveBeenCalledWith(channelName);
      expect(mockNetwork.getContract).toHaveBeenCalledWith(contractName);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Smart contract retrieved successfully',
        expect.objectContaining({
          operation: 'getContract',
          channelName,
          contractName,
          contractObtained: true
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Smart contract access successful',
        expect.objectContaining({
          event_type: 'contract_access',
          event_outcome: 'success'
        })
      );
    });

    it('should return cached contract on subsequent requests', async () => {
      // Arrange
      const channelName = 'settlement-channel';
      const contractName = 'settlement-contract';
      await fabricService.getContract(channelName, contractName);
      jest.clearAllMocks();

      // Act
      const result = await fabricService.getContract(channelName, contractName);

      // Assert
      expect(result).toBe(mockContract);
      expect(mockGateway.getNetwork).not.toHaveBeenCalled();
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Contract retrieved from cache',
        expect.objectContaining({
          cacheHit: true
        })
      );
    });

    it('should handle gateway not connected error', async () => {
      // Arrange
      fabricService.disconnect();
      
      // Act & Assert
      await expect(fabricService.getContract('channel', 'contract')).rejects.toThrow(FabricError);
      await expect(fabricService.getContract('channel', 'contract')).rejects.toThrow(
        'Gateway is not connected. Please call connect() first.'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Contract access attempted without gateway connection',
        expect.objectContaining({
          event_type: 'unauthorized_access_attempt',
          threat_level: 'medium'
        })
      );
    });

    it('should handle empty channel name', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.getContract('', 'contract')).rejects.toThrow(BadRequestError);
      await expect(fabricService.getContract('', 'contract')).rejects.toThrow(
        'Channel name is required and must be a non-empty string'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid channel name in contract retrieval request',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'low'
        })
      );
    });

    it('should handle empty contract name', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.getContract('channel', '')).rejects.toThrow(BadRequestError);
      await expect(fabricService.getContract('channel', '')).rejects.toThrow(
        'Contract name is required and must be a non-empty string'
      );
    });

    it('should sanitize channel and contract names', async () => {
      // Arrange
      const channelName = 'channel<name>';
      const contractName = 'contract/name';
      const sanitizedChannel = 'channelname';
      const sanitizedContract = 'contractname';

      // Act
      await fabricService.getContract(channelName, contractName);

      // Assert
      expect(mockGateway.getNetwork).toHaveBeenCalledWith(sanitizedChannel);
      expect(mockNetwork.getContract).toHaveBeenCalledWith(sanitizedContract);
      expect(mockLogger.security).toHaveBeenCalledWith(
        'Input sanitization performed for contract retrieval',
        expect.objectContaining({
          event_type: 'input_sanitization',
          sanitizationPerformed: true
        })
      );
    });
  });

  describe('submitTransaction', () => {
    beforeEach(async () => {
      await fabricService.connect('user123');
      jest.clearAllMocks();
    });

    it('should successfully submit transaction to contract', async () => {
      // Arrange
      const functionName = 'createAsset';
      const args = ['asset123', '1000'];
      const expectedResult = Buffer.from('success');
      mockContract.submitTransaction.mockResolvedValue(expectedResult);

      // Act
      const result = await fabricService.submitTransaction(mockContract, functionName, args);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockContract.submitTransaction).toHaveBeenCalledWith(functionName, ...args);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Transaction submitted successfully',
        expect.objectContaining({
          operation: 'submitTransaction',
          functionName,
          argumentCount: args.length
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain transaction submitted successfully',
        expect.objectContaining({
          event_type: 'transaction_submission',
          event_outcome: 'success'
        })
      );
    });

    it('should handle null contract', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.submitTransaction(null as any, 'function', [])).rejects.toThrow(BadRequestError);
      await expect(fabricService.submitTransaction(null as any, 'function', [])).rejects.toThrow(
        'Contract instance is required for transaction submission'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Transaction submission attempted without contract',
        expect.objectContaining({
          event_type: 'invalid_transaction_attempt',
          threat_level: 'medium'
        })
      );
    });

    it('should handle invalid arguments type', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.submitTransaction(mockContract, 'function', 'invalid' as any)).rejects.toThrow(BadRequestError);
      await expect(fabricService.submitTransaction(mockContract, 'function', 'invalid' as any)).rejects.toThrow(
        'Arguments must be provided as an array of strings'
      );
    });

    it('should handle contract submission failure', async () => {
      // Arrange
      const error = new Error('Submission failed');
      mockContract.submitTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(fabricService.submitTransaction(mockContract, 'function', [])).rejects.toThrow(ChaincodeError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Transaction submission failed',
        expect.objectContaining({
          operation: 'submitTransaction',
          error: error.message
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain transaction submission',
        expect.objectContaining({
          event_type: 'transaction_submission',
          event_outcome: 'failure'
        })
      );
    });
  });

  describe('evaluateTransaction', () => {
    beforeEach(async () => {
      await fabricService.connect('user123');
      jest.clearAllMocks();
    });

    it('should successfully evaluate transaction on contract', async () => {
      // Arrange
      const functionName = 'queryAsset';
      const args = ['asset123'];
      const expectedResult = Buffer.from('{"id":"asset123","value":"1000"}');
      mockContract.evaluateTransaction.mockResolvedValue(expectedResult);

      // Act
      const result = await fabricService.evaluateTransaction(mockContract, functionName, args);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockContract.evaluateTransaction).toHaveBeenCalledWith(functionName, ...args);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Query evaluation completed successfully',
        expect.objectContaining({
          operation: 'evaluateTransaction',
          functionName,
          argumentCount: args.length
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain query evaluated successfully',
        expect.objectContaining({
          event_type: 'query_evaluation',
          event_outcome: 'success'
        })
      );
    });

    it('should handle null contract in evaluation', async () => {
      // Arrange & Act & Assert
      await expect(fabricService.evaluateTransaction(null as any, 'function', [])).rejects.toThrow(BadRequestError);
      await expect(fabricService.evaluateTransaction(null as any, 'function', [])).rejects.toThrow(
        'Contract instance is required for query evaluation'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Query evaluation attempted without contract',
        expect.objectContaining({
          event_type: 'invalid_query_attempt',
          threat_level: 'medium'
        })
      );
    });

    it('should handle contract evaluation failure', async () => {
      // Arrange
      const error = new Error('Evaluation failed');
      mockContract.evaluateTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(fabricService.evaluateTransaction(mockContract, 'function', [])).rejects.toThrow(ChaincodeError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Query evaluation failed',
        expect.objectContaining({
          operation: 'evaluateTransaction',
          error: error.message
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain query evaluation',
        expect.objectContaining({
          event_type: 'query_evaluation',
          event_outcome: 'failure'
        })
      );
    });
  });
});

/**
 * Test Suite: WalletService
 * 
 * Comprehensive unit and integration tests for WalletService, which manages
 * user wallets and identities in the Hyperledger Fabric blockchain network
 * for the blockchain-based settlement network (F-009).
 * 
 * Test Coverage:
 * - Wallet instance creation and caching
 * - User-specific wallet retrieval with validation
 * - Wallet existence checks with security validation
 * - Error handling for wallet operations
 * - Input sanitization and security measures
 * - Performance optimization through caching
 * - Audit logging and compliance monitoring
 */
describe('WalletService', () => {
  beforeEach(() => {
    // Reset all mocks and cache before each test
    jest.clearAllMocks();
    
    // Reset wallet cache by mocking the module
    jest.resetModules();

    // Setup wallet mock with get method
    mockWallet.get.mockResolvedValue({
      type: 'X.509',
      mspId: 'Bank1MSP',
      credentials: {
        certificate: 'test-cert',
        privateKey: 'test-key'
      }
    });

    // Setup Wallets mock
    mockWallets.newFileSystemWallet.mockResolvedValue(mockWallet);

    // Setup network configuration mock
    mockGetNetworkConfig.mockReturnValue({
      networkName: 'financial-services-network',
      environment: 'test',
      walletPath: './test-wallets',
      tlsEnabled: true,
      organizations: ['Bank1MSP'],
      channels: ['settlement-channel']
    });
  });

  describe('getWallet', () => {
    it('should successfully create and return wallet instance', async () => {
      // Arrange & Act
      const { getWallet } = require('../src/services/wallet.service');
      const result = await getWallet();

      // Assert
      expect(result).toBe(mockWallet);
      expect(mockWallets.newFileSystemWallet).toHaveBeenCalledWith(
        path.resolve('./test-wallets')
      );
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Wallet instance created successfully',
        expect.objectContaining({
          operation: 'getWallet',
          cacheUpdated: true
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Blockchain wallet accessed',
        expect.objectContaining({
          event_type: 'wallet_access',
          event_outcome: 'success',
          complianceFramework: ['SOX', 'PCI_DSS', 'ISO27001']
        })
      );
    });

    it('should return cached wallet on subsequent calls', async () => {
      // Arrange
      const { getWallet } = require('../src/services/wallet.service');
      await getWallet(); // First call to cache the wallet
      jest.clearAllMocks();

      // Act
      const result = await getWallet();

      // Assert
      expect(result).toBe(mockWallet);
      expect(mockWallets.newFileSystemWallet).not.toHaveBeenCalled();
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Returning cached wallet instance',
        expect.objectContaining({
          cacheHit: true
        })
      );
    });

    it('should handle wallet creation failure', async () => {
      // Arrange
      const walletError = new Error('Wallet creation failed');
      mockWallets.newFileSystemWallet.mockRejectedValue(walletError);
      const { getWallet } = require('../src/services/wallet.service');

      // Act & Assert
      await expect(getWallet()).rejects.toThrow(WalletError);
      await expect(getWallet()).rejects.toThrow(
        'Failed to create wallet instance: Wallet creation failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create wallet instance',
        expect.objectContaining({
          operation: 'getWallet',
          error: walletError.message
        })
      );
      expect(mockLogger.security).toHaveBeenCalledWith(
        'Wallet creation failure detected',
        expect.objectContaining({
          event_type: 'wallet_creation_failure',
          threat_level: 'medium'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed blockchain wallet access',
        expect.objectContaining({
          event_type: 'wallet_access',
          event_outcome: 'failure'
        })
      );
    });

    it('should handle network configuration unavailable', async () => {
      // Arrange
      const networkError = new Error('Network configuration unavailable');
      mockGetNetworkConfig.mockImplementation(() => {
        throw networkError;
      });
      const { getWallet } = require('../src/services/wallet.service');

      // Act & Assert
      await expect(getWallet()).rejects.toThrow(ApiError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create wallet instance',
        expect.objectContaining({
          error: networkError.message
        })
      );
    });
  });

  describe('getWalletForUser', () => {
    it('should successfully retrieve wallet for existing user', async () => {
      // Arrange
      const userId = 'user123';
      const { getWalletForUser } = require('../src/services/wallet.service');

      // Act
      const result = await getWalletForUser(userId);

      // Assert
      expect(result).toBe(mockWallet);
      expect(mockWallet.get).toHaveBeenCalledWith(userId);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'User wallet retrieved successfully',
        expect.objectContaining({
          operation: 'getWalletForUser',
          userId,
          identityExists: true
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'User wallet accessed successfully',
        expect.objectContaining({
          event_type: 'wallet_access',
          event_outcome: 'success',
          userId
        })
      );
    });

    it('should handle user not found in wallet', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      mockWallet.get.mockResolvedValue(null);
      const { getWalletForUser } = require('../src/services/wallet.service');

      // Act & Assert
      await expect(getWalletForUser(userId)).rejects.toThrow(NotFoundError);
      await expect(getWalletForUser(userId)).rejects.toThrow(
        `Wallet not found for user: ${userId}`
      );

      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'User wallet identity not found',
        expect.objectContaining({
          operation: 'getWalletForUser',
          userId,
          identityExists: false
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'User wallet access attempt - not found',
        expect.objectContaining({
          event_type: 'wallet_access',
          event_outcome: 'failure',
          reason: 'identity_not_found'
        })
      );
    });

    it('should handle invalid user ID', async () => {
      // Arrange & Act & Assert
      const { getWalletForUser } = require('../src/services/wallet.service');
      
      await expect(getWalletForUser('')).rejects.toThrow(WalletError);
      await expect(getWalletForUser('')).rejects.toThrow(
        'Invalid user ID provided for wallet retrieval'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid user ID in wallet request',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'low'
        })
      );
    });

    it('should handle null user ID', async () => {
      // Arrange & Act & Assert
      const { getWalletForUser } = require('../src/services/wallet.service');
      
      await expect(getWalletForUser(null as any)).rejects.toThrow(WalletError);
    });

    it('should sanitize user ID with special characters', async () => {
      // Arrange
      const userId = 'user<123>';
      const sanitizedUserId = 'user123';
      const { getWalletForUser } = require('../src/services/wallet.service');

      // Act
      await getWalletForUser(userId);

      // Assert
      expect(mockWallet.get).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockLogger.security).toHaveBeenCalledWith(
        'User ID sanitization performed',
        expect.objectContaining({
          event_type: 'input_sanitization',
          sanitizedUserId
        })
      );
    });

    it('should handle wallet retrieval system failure', async () => {
      // Arrange
      const userId = 'user123';
      const systemError = new Error('System failure');
      mockWallets.newFileSystemWallet.mockRejectedValue(systemError);
      const { getWalletForUser } = require('../src/services/wallet.service');

      // Act & Assert
      await expect(getWalletForUser(userId)).rejects.toThrow(WalletError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve user wallet',
        expect.objectContaining({
          operation: 'getWalletForUser',
          userId,
          error: systemError.message
        })
      );
      expect(mockLogger.security).toHaveBeenCalledWith(
        'User wallet retrieval failure',
        expect.objectContaining({
          event_type: 'wallet_access_failure',
          threat_level: 'medium'
        })
      );
    });
  });

  describe('isWalletExists', () => {
    it('should return true for existing user wallet', async () => {
      // Arrange
      const userId = 'user123';
      const { isWalletExists } = require('../src/services/wallet.service');

      // Act
      const result = await isWalletExists(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockWallet.get).toHaveBeenCalledWith(userId);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Wallet existence check completed',
        expect.objectContaining({
          operation: 'isWalletExists',
          userId,
          exists: true
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Wallet existence check performed',
        expect.objectContaining({
          event_type: 'wallet_check',
          event_outcome: 'success',
          exists: true
        })
      );
    });

    it('should return false for non-existing user wallet', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      mockWallet.get.mockResolvedValue(null);
      const { isWalletExists } = require('../src/services/wallet.service');

      // Act
      const result = await isWalletExists(userId);

      // Assert
      expect(result).toBe(false);
      expect(mockWallet.get).toHaveBeenCalledWith(userId);
      expect(mockLogger.blockchain).toHaveBeenCalledWith(
        'Wallet existence check completed',
        expect.objectContaining({
          operation: 'isWalletExists',
          userId,
          exists: false
        })
      );
    });

    it('should handle invalid user ID in existence check', async () => {
      // Arrange & Act & Assert
      const { isWalletExists } = require('../src/services/wallet.service');
      
      await expect(isWalletExists('')).rejects.toThrow(WalletError);
      await expect(isWalletExists('')).rejects.toThrow(
        'Invalid user ID provided for wallet existence check'
      );

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Invalid user ID in wallet existence check',
        expect.objectContaining({
          event_type: 'input_validation_failure',
          threat_level: 'low'
        })
      );
    });

    it('should sanitize user ID in existence check', async () => {
      // Arrange
      const userId = 'user@123!';
      const sanitizedUserId = 'user@123';
      const { isWalletExists } = require('../src/services/wallet.service');

      // Act
      await isWalletExists(userId);

      // Assert
      expect(mockWallet.get).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockLogger.security).toHaveBeenCalledWith(
        'User ID sanitization performed',
        expect.objectContaining({
          event_type: 'input_sanitization'
        })
      );
    });

    it('should handle wallet existence check system failure', async () => {
      // Arrange
      const userId = 'user123';
      const systemError = new Error('System failure');
      mockWallets.newFileSystemWallet.mockRejectedValue(systemError);
      const { isWalletExists } = require('../src/services/wallet.service');

      // Act & Assert
      await expect(isWalletExists(userId)).rejects.toThrow(WalletError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to check wallet existence',
        expect.objectContaining({
          operation: 'isWalletExists',
          userId,
          error: systemError.message
        })
      );
      expect(mockLogger.security).toHaveBeenCalledWith(
        'Wallet existence check failure',
        expect.objectContaining({
          event_type: 'wallet_check_failure',
          threat_level: 'medium'
        })
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Failed wallet existence check',
        expect.objectContaining({
          event_type: 'wallet_check',
          event_outcome: 'failure'
        })
      );
    });
  });
});

// Cleanup after all tests
afterAll(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});