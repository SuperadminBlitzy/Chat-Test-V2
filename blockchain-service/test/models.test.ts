// Jest testing framework - v29.7+
import { describe, it, expect, beforeEach } from 'jest';

// Internal model imports for testing
import { 
  Settlement, 
  SettlementStatus, 
  SettlementUpdate,
  StatusTransition,
  SETTLEMENT_STATUS_TRANSITIONS,
  isSettlement, 
  isValidSettlementStatus, 
  createSettlement,
  isValidStatusTransition
} from '../src/models/settlement.model';

import { 
  ISmartContract,
  ISmartContractDeployment,
  SmartContractType,
  isValidSmartContract
} from '../src/models/smartContract.model';

import { 
  Transaction, 
  TransactionStatus 
} from '../src/models/transaction.model';

/**
 * Comprehensive test suite for Settlement Model
 * 
 * Tests the Settlement model implementation to ensure proper functionality
 * for the Blockchain-based Settlement Network (F-009) feature.
 * Validates data structures, enums, type guards, and business logic
 * compliance with settlement processing requirements.
 */
describe('Settlement Model', () => {
  let validSettlementData: Settlement;
  let mockDate: Date;

  beforeEach(() => {
    // Set up consistent test data for each test
    mockDate = new Date('2025-01-15T10:30:00.000Z');
    validSettlementData = {
      settlementId: '550e8400-e29b-41d4-a716-446655440000',
      transactionId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      amount: 1250.75,
      currency: 'USD',
      status: SettlementStatus.PENDING,
      createdAt: mockDate,
      updatedAt: mockDate
    };
  });

  /**
   * Tests for Settlement interface and object creation
   */
  describe('Settlement Interface', () => {
    it('should create a valid Settlement object with all required properties', () => {
      const settlement: Settlement = validSettlementData;

      // Validate all required properties exist and have correct types
      expect(settlement.settlementId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(settlement.transactionId).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
      expect(settlement.amount).toBe(1250.75);
      expect(settlement.currency).toBe('USD');
      expect(settlement.status).toBe(SettlementStatus.PENDING);
      expect(settlement.createdAt).toBeInstanceOf(Date);
      expect(settlement.updatedAt).toBeInstanceOf(Date);
    });

    it('should support all valid currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
      
      currencies.forEach(currency => {
        const settlement: Settlement = { ...validSettlementData, currency };
        expect(settlement.currency).toBe(currency);
        expect(settlement.currency).toHaveLength(3);
        expect(settlement.currency).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should handle decimal amounts with precision', () => {
      const testAmounts = [0.01, 99.99, 1000.50, 9999999.99];
      
      testAmounts.forEach(amount => {
        const settlement: Settlement = { ...validSettlementData, amount };
        expect(settlement.amount).toBe(amount);
        expect(settlement.amount).toBeGreaterThan(0);
      });
    });

    it('should maintain immutable timestamp references', () => {
      const originalCreatedAt = new Date('2025-01-01T00:00:00.000Z');
      const originalUpdatedAt = new Date('2025-01-02T00:00:00.000Z');
      
      const settlement: Settlement = {
        ...validSettlementData,
        createdAt: originalCreatedAt,
        updatedAt: originalUpdatedAt
      };

      expect(settlement.createdAt).toBe(originalCreatedAt);
      expect(settlement.updatedAt).toBe(originalUpdatedAt);
      expect(settlement.createdAt).not.toBe(settlement.updatedAt);
    });
  });

  /**
   * Tests for SettlementStatus enumeration
   */
  describe('SettlementStatus Enum', () => {
    it('should define all required settlement statuses', () => {
      expect(SettlementStatus.PENDING).toBe('PENDING');
      expect(SettlementStatus.COMPLETED).toBe('COMPLETED');
      expect(SettlementStatus.FAILED).toBe('FAILED');
    });

    it('should contain exactly three status values', () => {
      const statusValues = Object.values(SettlementStatus);
      expect(statusValues).toHaveLength(3);
      expect(statusValues).toContain('PENDING');
      expect(statusValues).toContain('COMPLETED');
      expect(statusValues).toContain('FAILED');
    });

    it('should support status comparison operations', () => {
      expect(SettlementStatus.PENDING).not.toBe(SettlementStatus.COMPLETED);
      expect(SettlementStatus.COMPLETED).not.toBe(SettlementStatus.FAILED);
      expect(SettlementStatus.FAILED).not.toBe(SettlementStatus.PENDING);
    });
  });

  /**
   * Tests for isSettlement type guard function
   */
  describe('isSettlement Type Guard', () => {
    it('should return true for valid Settlement objects', () => {
      const validSettlement = validSettlementData;
      expect(isSettlement(validSettlement)).toBe(true);
    });

    it('should return false for null or undefined values', () => {
      expect(isSettlement(null)).toBe(false);
      expect(isSettlement(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isSettlement('string')).toBe(false);
      expect(isSettlement(123)).toBe(false);
      expect(isSettlement(true)).toBe(false);
      expect(isSettlement([])).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      const incompleteObjects = [
        { ...validSettlementData, settlementId: undefined },
        { ...validSettlementData, transactionId: undefined },
        { ...validSettlementData, amount: undefined },
        { ...validSettlementData, currency: undefined },
        { ...validSettlementData, status: undefined },
        { ...validSettlementData, createdAt: undefined },
        { ...validSettlementData, updatedAt: undefined }
      ];

      incompleteObjects.forEach(obj => {
        expect(isSettlement(obj)).toBe(false);
      });
    });

    it('should return false for objects with invalid property types', () => {
      const invalidTypeObjects = [
        { ...validSettlementData, settlementId: 123 },
        { ...validSettlementData, transactionId: {} },
        { ...validSettlementData, amount: 'invalid' },
        { ...validSettlementData, currency: 123 },
        { ...validSettlementData, status: 'INVALID_STATUS' },
        { ...validSettlementData, createdAt: 'not-a-date' },
        { ...validSettlementData, updatedAt: new Date().toISOString() }
      ];

      invalidTypeObjects.forEach(obj => {
        expect(isSettlement(obj)).toBe(false);
      });
    });

    it('should validate SettlementStatus enum values', () => {
      const validStatuses = [SettlementStatus.PENDING, SettlementStatus.COMPLETED, SettlementStatus.FAILED];
      
      validStatuses.forEach(status => {
        const settlement = { ...validSettlementData, status };
        expect(isSettlement(settlement)).toBe(true);
      });

      const invalidStatus = { ...validSettlementData, status: 'INVALID' };
      expect(isSettlement(invalidStatus)).toBe(false);
    });
  });

  /**
   * Tests for isValidSettlementStatus type guard function
   */
  describe('isValidSettlementStatus Type Guard', () => {
    it('should return true for valid SettlementStatus values', () => {
      expect(isValidSettlementStatus('PENDING')).toBe(true);
      expect(isValidSettlementStatus('COMPLETED')).toBe(true);
      expect(isValidSettlementStatus('FAILED')).toBe(true);
    });

    it('should return false for invalid status strings', () => {
      const invalidStatuses = ['INVALID', 'pending', 'Completed', 'PROCESSING', '', null, undefined];
      
      invalidStatuses.forEach(status => {
        expect(isValidSettlementStatus(status as string)).toBe(false);
      });
    });

    it('should be case-sensitive', () => {
      expect(isValidSettlementStatus('pending')).toBe(false);
      expect(isValidSettlementStatus('completed')).toBe(false);
      expect(isValidSettlementStatus('failed')).toBe(false);
      expect(isValidSettlementStatus('Pending')).toBe(false);
    });
  });

  /**
   * Tests for createSettlement factory function
   */
  describe('createSettlement Factory Function', () => {
    it('should create a settlement with provided required parameters', () => {
      const params = {
        settlementId: 'test-settlement-id',
        transactionId: 'test-transaction-id',
        amount: 500.00,
        currency: 'EUR'
      };

      const settlement = createSettlement(params);

      expect(settlement.settlementId).toBe(params.settlementId);
      expect(settlement.transactionId).toBe(params.transactionId);
      expect(settlement.amount).toBe(params.amount);
      expect(settlement.currency).toBe(params.currency);
      expect(settlement.status).toBe(SettlementStatus.PENDING);
      expect(settlement.createdAt).toBeInstanceOf(Date);
      expect(settlement.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided optional parameters', () => {
      const customDate = new Date('2025-01-01T00:00:00.000Z');
      const params = {
        settlementId: 'test-settlement-id',
        transactionId: 'test-transaction-id',
        amount: 500.00,
        currency: 'EUR',
        status: SettlementStatus.COMPLETED,
        createdAt: customDate,
        updatedAt: customDate
      };

      const settlement = createSettlement(params);

      expect(settlement.status).toBe(SettlementStatus.COMPLETED);
      expect(settlement.createdAt).toBe(customDate);
      expect(settlement.updatedAt).toBe(customDate);
    });

    it('should set default values for optional parameters', () => {
      const beforeCreation = Date.now();
      const params = {
        settlementId: 'test-settlement-id',
        transactionId: 'test-transaction-id',
        amount: 500.00,
        currency: 'EUR'
      };

      const settlement = createSettlement(params);
      const afterCreation = Date.now();

      expect(settlement.status).toBe(SettlementStatus.PENDING);
      expect(settlement.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation);
      expect(settlement.createdAt.getTime()).toBeLessThanOrEqual(afterCreation);
      expect(settlement.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation);
      expect(settlement.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation);
    });
  });

  /**
   * Tests for Settlement status transitions
   */
  describe('Settlement Status Transitions', () => {
    it('should define all valid status transitions', () => {
      expect(SETTLEMENT_STATUS_TRANSITIONS).toHaveLength(6);
      
      // Check specific transitions exist
      const transitions = SETTLEMENT_STATUS_TRANSITIONS;
      expect(transitions.find(t => t.from === SettlementStatus.PENDING && t.to === SettlementStatus.COMPLETED && t.allowed)).toBeDefined();
      expect(transitions.find(t => t.from === SettlementStatus.PENDING && t.to === SettlementStatus.FAILED && t.allowed)).toBeDefined();
      expect(transitions.find(t => t.from === SettlementStatus.FAILED && t.to === SettlementStatus.PENDING && t.allowed)).toBeDefined();
    });

    it('should validate allowed status transitions', () => {
      // Valid transitions
      expect(isValidStatusTransition(SettlementStatus.PENDING, SettlementStatus.COMPLETED)).toBe(true);
      expect(isValidStatusTransition(SettlementStatus.PENDING, SettlementStatus.FAILED)).toBe(true);
      expect(isValidStatusTransition(SettlementStatus.FAILED, SettlementStatus.PENDING)).toBe(true);
    });

    it('should reject invalid status transitions', () => {
      // Invalid transitions
      expect(isValidStatusTransition(SettlementStatus.COMPLETED, SettlementStatus.PENDING)).toBe(false);
      expect(isValidStatusTransition(SettlementStatus.COMPLETED, SettlementStatus.FAILED)).toBe(false);
      expect(isValidStatusTransition(SettlementStatus.FAILED, SettlementStatus.COMPLETED)).toBe(false);
    });

    it('should provide reasons for invalid transitions', () => {
      const completedToPending = SETTLEMENT_STATUS_TRANSITIONS.find(
        t => t.from === SettlementStatus.COMPLETED && t.to === SettlementStatus.PENDING
      );
      expect(completedToPending?.reason).toBe('Completed settlements cannot be reverted');

      const failedToCompleted = SETTLEMENT_STATUS_TRANSITIONS.find(
        t => t.from === SettlementStatus.FAILED && t.to === SettlementStatus.COMPLETED
      );
      expect(failedToCompleted?.reason).toBe('Failed settlements must be reprocessed through pending state');
    });
  });

  /**
   * Tests for SettlementUpdate interface
   */
  describe('SettlementUpdate Interface', () => {
    it('should support partial updates with optional fields', () => {
      const update: SettlementUpdate = {
        amount: 750.50
      };
      expect(update.amount).toBe(750.50);
      expect(update.currency).toBeUndefined();
      expect(update.status).toBeUndefined();
    });

    it('should support all updatable fields', () => {
      const update: SettlementUpdate = {
        amount: 1000.00,
        currency: 'EUR',
        status: SettlementStatus.COMPLETED
      };
      expect(update.amount).toBe(1000.00);
      expect(update.currency).toBe('EUR');
      expect(update.status).toBe(SettlementStatus.COMPLETED);
    });

    it('should not include immutable fields', () => {
      const update: SettlementUpdate = {};
      // TypeScript should prevent these properties from being defined
      expect('settlementId' in update).toBe(false);
      expect('transactionId' in update).toBe(false);
      expect('createdAt' in update).toBe(false);
    });
  });
});

/**
 * Comprehensive test suite for SmartContract Model
 * 
 * Tests the SmartContract model implementation to ensure proper functionality
 * for the Smart Contract Management (F-010) feature.
 * Validates interface compliance, type guards, and Hyperledger Fabric integration.
 */
describe('SmartContract Model', () => {
  let validSmartContractData: ISmartContract;
  let mockCreatedAt: Date;
  let mockUpdatedAt: Date;

  beforeEach(() => {
    mockCreatedAt = new Date('2024-01-15T10:30:00.000Z');
    mockUpdatedAt = new Date('2024-03-20T14:45:30.000Z');
    
    validSmartContractData = {
      id: 'sc_001_payment_processor',
      name: 'Payment Processing Contract',
      version: '1.2.0',
      description: 'Handles secure payment transactions with multi-signature approval',
      channel: 'financial-services-channel',
      chaincodeId: 'payment-chaincode-v1',
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt
    };
  });

  /**
   * Tests for ISmartContract interface
   */
  describe('ISmartContract Interface', () => {
    it('should create a valid SmartContract object with all required properties', () => {
      const contract: ISmartContract = validSmartContractData;

      expect(contract.id).toBe('sc_001_payment_processor');
      expect(contract.name).toBe('Payment Processing Contract');
      expect(contract.version).toBe('1.2.0');
      expect(contract.description).toBe('Handles secure payment transactions with multi-signature approval');
      expect(contract.channel).toBe('financial-services-channel');
      expect(contract.chaincodeId).toBe('payment-chaincode-v1');
      expect(contract.createdAt).toBe(mockCreatedAt);
      expect(contract.updatedAt).toBe(mockUpdatedAt);
    });

    it('should support various contract ID formats', () => {
      const validIds = [
        'sc_001_payment_processor',
        'smart_contract_kyc_verification',
        'contract-compliance-automation',
        'SC_ASSET_TOKENIZATION_001'
      ];

      validIds.forEach(id => {
        const contract: ISmartContract = { ...validSmartContractData, id };
        expect(contract.id).toBe(id);
      });
    });

    it('should enforce semantic versioning format', () => {
      const validVersions = ['1.0.0', '2.1.3', '0.5.0', '10.15.25'];
      
      validVersions.forEach(version => {
        const contract: ISmartContract = { ...validSmartContractData, version };
        expect(contract.version).toBe(version);
        expect(contract.version).toMatch(/^\d+\.\d+\.\d+/);
      });
    });

    it('should support Hyperledger Fabric channel naming conventions', () => {
      const validChannels = [
        'financial-services-channel',
        'payment-processing-channel',
        'kyc-verification-channel',
        'compliance-automation-channel'
      ];

      validChannels.forEach(channel => {
        const contract: ISmartContract = { ...validSmartContractData, channel };
        expect(contract.channel).toBe(channel);
        expect(contract.channel).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('should support chaincode ID formats', () => {
      const validChaincodeIds = [
        'payment-chaincode-v1',
        'kyc_verification_cc',
        'compliance-automation-chaincode',
        'AssetTokenization-CC-v2'
      ];

      validChaincodeIds.forEach(chaincodeId => {
        const contract: ISmartContract = { ...validSmartContractData, chaincodeId };
        expect(contract.chaincodeId).toBe(chaincodeId);
        expect(contract.chaincodeId).toMatch(/^[a-zA-Z0-9-_]+$/);
      });
    });

    it('should maintain timestamp integrity', () => {
      const contract: ISmartContract = validSmartContractData;
      
      expect(contract.createdAt).toBeInstanceOf(Date);
      expect(contract.updatedAt).toBeInstanceOf(Date);
      expect(contract.updatedAt.getTime()).toBeGreaterThanOrEqual(contract.createdAt.getTime());
    });
  });

  /**
   * Tests for isValidSmartContract type guard
   */
  describe('isValidSmartContract Type Guard', () => {
    it('should return true for valid SmartContract objects', () => {
      expect(isValidSmartContract(validSmartContractData)).toBe(true);
    });

    it('should return false for null or undefined values', () => {
      expect(isValidSmartContract(null)).toBe(false);
      expect(isValidSmartContract(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isValidSmartContract('string')).toBe(false);
      expect(isValidSmartContract(123)).toBe(false);
      expect(isValidSmartContract(true)).toBe(false);
      expect(isValidSmartContract([])).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      const incompleteObjects = [
        { ...validSmartContractData, id: undefined },
        { ...validSmartContractData, name: undefined },
        { ...validSmartContractData, version: undefined },
        { ...validSmartContractData, description: undefined },
        { ...validSmartContractData, channel: undefined },
        { ...validSmartContractData, chaincodeId: undefined },
        { ...validSmartContractData, createdAt: undefined },
        { ...validSmartContractData, updatedAt: undefined }
      ];

      incompleteObjects.forEach(obj => {
        expect(isValidSmartContract(obj)).toBe(false);
      });
    });

    it('should return false for objects with invalid property types', () => {
      const invalidTypeObjects = [
        { ...validSmartContractData, id: 123 },
        { ...validSmartContractData, name: {} },
        { ...validSmartContractData, version: [] },
        { ...validSmartContractData, description: null },
        { ...validSmartContractData, channel: true },
        { ...validSmartContractData, chaincodeId: 456 },
        { ...validSmartContractData, createdAt: 'not-a-date' },
        { ...validSmartContractData, updatedAt: 'also-not-a-date' }
      ];

      invalidTypeObjects.forEach(obj => {
        expect(isValidSmartContract(obj)).toBe(false);
      });
    });

    it('should validate string field lengths and patterns', () => {
      // Empty strings should fail validation
      const emptyFieldObjects = [
        { ...validSmartContractData, id: '' },
        { ...validSmartContractData, name: '' }
      ];

      emptyFieldObjects.forEach(obj => {
        expect(isValidSmartContract(obj)).toBe(false);
      });

      // Invalid version format
      const invalidVersions = ['1.0', 'v1.0.0', '1.0.0-beta', 'invalid'];
      invalidVersions.forEach(version => {
        const obj = { ...validSmartContractData, version };
        expect(isValidSmartContract(obj)).toBe(false);
      });

      // Invalid channel format (uppercase letters, special characters)
      const invalidChannels = ['Channel-Name', 'channel_name', 'channel@name', 'CHANNEL'];
      invalidChannels.forEach(channel => {
        const obj = { ...validSmartContractData, channel };
        expect(isValidSmartContract(obj)).toBe(false);
      });

      // Invalid chaincode ID format
      const invalidChaincodeIds = ['', 'chaincode@name', 'chaincode name', 'chaincode!id'];
      invalidChaincodeIds.forEach(chaincodeId => {
        const obj = { ...validSmartContractData, chaincodeId };
        expect(isValidSmartContract(obj)).toBe(false);
      });
    });
  });

  /**
   * Tests for SmartContractType enumeration
   */
  describe('SmartContractType Enum', () => {
    it('should define all supported contract types', () => {
      expect(SmartContractType.PAYMENT_PROCESSING).toBe('PAYMENT_PROCESSING');
      expect(SmartContractType.IDENTITY_MANAGEMENT).toBe('IDENTITY_MANAGEMENT');
      expect(SmartContractType.COMPLIANCE_AUTOMATION).toBe('COMPLIANCE_AUTOMATION');
      expect(SmartContractType.ASSET_TOKENIZATION).toBe('ASSET_TOKENIZATION');
    });

    it('should contain exactly four contract types', () => {
      const contractTypes = Object.values(SmartContractType);
      expect(contractTypes).toHaveLength(4);
    });

    it('should support enum value comparisons', () => {
      expect(SmartContractType.PAYMENT_PROCESSING).not.toBe(SmartContractType.IDENTITY_MANAGEMENT);
      expect(SmartContractType.COMPLIANCE_AUTOMATION).not.toBe(SmartContractType.ASSET_TOKENIZATION);
    });
  });

  /**
   * Tests for ISmartContractDeployment extended interface
   */
  describe('ISmartContractDeployment Interface', () => {
    it('should extend ISmartContract with additional deployment properties', () => {
      const deployment: ISmartContractDeployment = {
        ...validSmartContractData,
        status: 'DEPLOYED',
        contractType: SmartContractType.PAYMENT_PROCESSING,
        networkEndpoint: 'https://blockchain-network.example.com:7051',
        estimatedGasLimit: 100000,
        authorizedOrganizations: ['Org1MSP', 'Org2MSP', 'Org3MSP']
      };

      // Verify base interface properties
      expect(deployment.id).toBe(validSmartContractData.id);
      expect(deployment.name).toBe(validSmartContractData.name);
      expect(deployment.version).toBe(validSmartContractData.version);

      // Verify extended properties
      expect(deployment.status).toBe('DEPLOYED');
      expect(deployment.contractType).toBe(SmartContractType.PAYMENT_PROCESSING);
      expect(deployment.networkEndpoint).toBe('https://blockchain-network.example.com:7051');
      expect(deployment.estimatedGasLimit).toBe(100000);
      expect(deployment.authorizedOrganizations).toHaveLength(3);
    });

    it('should support all deployment status values', () => {
      const statuses = ['DEPLOYED', 'PENDING', 'FAILED', 'UPGRADING', 'DEPRECATED'];
      
      statuses.forEach(status => {
        const deployment: ISmartContractDeployment = {
          ...validSmartContractData,
          status: status as any,
          contractType: SmartContractType.PAYMENT_PROCESSING
        };
        expect(deployment.status).toBe(status);
      });
    });

    it('should support optional deployment properties', () => {
      const minimalDeployment: ISmartContractDeployment = {
        ...validSmartContractData,
        status: 'DEPLOYED',
        contractType: SmartContractType.IDENTITY_MANAGEMENT
      };

      expect(minimalDeployment.networkEndpoint).toBeUndefined();
      expect(minimalDeployment.estimatedGasLimit).toBeUndefined();
      expect(minimalDeployment.authorizedOrganizations).toBeUndefined();
    });
  });
});

/**
 * Comprehensive test suite for Transaction Model
 * 
 * Tests the Transaction class implementation to ensure proper functionality
 * for blockchain transaction processing and settlement operations.
 * Validates class properties, methods, validation decorators, and business logic.
 */
describe('Transaction Model', () => {
  let validTransaction: Transaction;
  let mockTimestamp: Date;

  beforeEach(() => {
    mockTimestamp = new Date('2024-01-15T10:30:00.000Z');
    validTransaction = new Transaction();
    
    // Set up valid transaction data
    validTransaction.id = '123e4567-e89b-12d3-a456-426614174000';
    validTransaction.accountId = 'ACC123456789';
    validTransaction.amount = 1500.75;
    validTransaction.currency = 'USD';
    validTransaction.status = TransactionStatus.PENDING;
    validTransaction.timestamp = mockTimestamp;
    validTransaction.transactionType = 'PAYMENT';
    validTransaction.description = 'International wire transfer to supplier payment';
    validTransaction.referenceNumber = 'REF-2024-001-ABC123';
    validTransaction.exchangeRate = 1.0;
    validTransaction.counterpartyAccountId = 'ACC987654321';
  });

  /**
   * Tests for Transaction class construction and initialization
   */
  describe('Transaction Class Construction', () => {
    it('should create a new Transaction with default values', () => {
      const transaction = new Transaction();
      
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.timestamp).toBeInstanceOf(Date);
      expect(transaction.exchangeRate).toBe(1.0);
    });

    it('should initialize with current timestamp', () => {
      const beforeCreation = Date.now();
      const transaction = new Transaction();
      const afterCreation = Date.now();
      
      expect(transaction.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation);
      expect(transaction.timestamp.getTime()).toBeLessThanOrEqual(afterCreation);
    });

    it('should allow property assignment after construction', () => {
      const transaction = new Transaction();
      transaction.id = 'test-id';
      transaction.amount = 100.50;
      transaction.currency = 'EUR';
      
      expect(transaction.id).toBe('test-id');
      expect(transaction.amount).toBe(100.50);
      expect(transaction.currency).toBe('EUR');
    });
  });

  /**
   * Tests for TransactionStatus enumeration
   */
  describe('TransactionStatus Enum', () => {
    it('should define all required transaction statuses', () => {
      expect(TransactionStatus.PENDING).toBe('PENDING');
      expect(TransactionStatus.PROCESSING).toBe('PROCESSING');
      expect(TransactionStatus.SETTLED).toBe('SETTLED');
      expect(TransactionStatus.FAILED).toBe('FAILED');
      expect(TransactionStatus.REJECTED).toBe('REJECTED');
    });

    it('should contain exactly five status values', () => {
      const statusValues = Object.values(TransactionStatus);
      expect(statusValues).toHaveLength(5);
    });

    it('should support status workflow progression', () => {
      const workflowStatuses = [
        TransactionStatus.PENDING,
        TransactionStatus.PROCESSING,
        TransactionStatus.SETTLED
      ];
      
      workflowStatuses.forEach((status, index) => {
        expect(Object.values(TransactionStatus)).toContain(status);
        if (index > 0) {
          expect(status).not.toBe(workflowStatuses[index - 1]);
        }
      });
    });
  });

  /**
   * Tests for Transaction property validation
   */
  describe('Transaction Properties', () => {
    it('should support UUID v4 format for ID fields', () => {
      const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      validTransaction.id = '123e4567-e89b-12d3-a456-426614174000';
      validTransaction.accountId = '456f7890-1234-4567-8901-234567890123';
      validTransaction.counterpartyAccountId = '789a0123-4567-4890-1234-567890123456';
      
      expect(validTransaction.id).toMatch(uuidV4Pattern);
      expect(validTransaction.accountId).toMatch(uuidV4Pattern);
      expect(validTransaction.counterpartyAccountId).toMatch(uuidV4Pattern);
    });

    it('should handle decimal amounts with proper precision', () => {
      const testAmounts = [0.01, 99.99, 1000.50, 9999999.99, 0.1];
      
      testAmounts.forEach(amount => {
        validTransaction.amount = amount;
        expect(validTransaction.amount).toBe(amount);
        expect(typeof validTransaction.amount).toBe('number');
      });
    });

    it('should support ISO 4217 currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
      
      validCurrencies.forEach(currency => {
        validTransaction.currency = currency;
        expect(validTransaction.currency).toBe(currency);
        expect(validTransaction.currency).toHaveLength(3);
        expect(validTransaction.currency).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should support various transaction types', () => {
      const transactionTypes = [
        'PAYMENT',
        'TRANSFER',
        'SETTLEMENT',
        'REFUND',
        'ADJUSTMENT',
        'CROSS_BORDER_TRANSFER',
        'WIRE_TRANSFER'
      ];
      
      transactionTypes.forEach(type => {
        validTransaction.transactionType = type;
        expect(validTransaction.transactionType).toBe(type);
      });
    });

    it('should handle optional properties correctly', () => {
      const transaction = new Transaction();
      
      // Optional properties should be undefined initially
      expect(transaction.description).toBeUndefined();
      expect(transaction.counterpartyAccountId).toBeUndefined();
      expect(transaction.blockchainTransactionId).toBeUndefined();
      
      // Should allow setting optional properties
      transaction.description = 'Test description';
      transaction.counterpartyAccountId = 'counterparty-id';
      transaction.blockchainTransactionId = '0x1234567890abcdef';
      
      expect(transaction.description).toBe('Test description');
      expect(transaction.counterpartyAccountId).toBe('counterparty-id');
      expect(transaction.blockchainTransactionId).toBe('0x1234567890abcdef');
    });
  });

  /**
   * Tests for canProceedToSettlement method
   */
  describe('canProceedToSettlement Method', () => {
    it('should return true for valid transactions ready for settlement', () => {
      validTransaction.status = TransactionStatus.PROCESSING;
      validTransaction.amount = 100.00;
      validTransaction.accountId = 'valid-account-id';
      validTransaction.currency = 'USD';
      validTransaction.transactionType = 'PAYMENT';
      validTransaction.referenceNumber = 'REF123';
      
      expect(validTransaction.canProceedToSettlement()).toBe(true);
    });

    it('should return false for transactions not in PROCESSING status', () => {
      const invalidStatuses = [
        TransactionStatus.PENDING,
        TransactionStatus.SETTLED,
        TransactionStatus.FAILED,
        TransactionStatus.REJECTED
      ];
      
      invalidStatuses.forEach(status => {
        validTransaction.status = status;
        expect(validTransaction.canProceedToSettlement()).toBe(false);
      });
    });

    it('should return false for transactions with invalid amounts', () => {
      validTransaction.status = TransactionStatus.PROCESSING;
      
      const invalidAmounts = [0, -100, -0.01];
      
      invalidAmounts.forEach(amount => {
        validTransaction.amount = amount;
        expect(validTransaction.canProceedToSettlement()).toBe(false);
      });
    });

    it('should return false for transactions with missing required fields', () => {
      validTransaction.status = TransactionStatus.PROCESSING;
      validTransaction.amount = 100.00;
      
      // Test missing accountId
      validTransaction.accountId = '';
      expect(validTransaction.canProceedToSettlement()).toBe(false);
      
      // Test missing currency
      validTransaction.accountId = 'valid-id';
      validTransaction.currency = 'INVALID_CURRENCY';
      expect(validTransaction.canProceedToSettlement()).toBe(false);
      
      // Test missing transaction type
      validTransaction.currency = 'USD';
      validTransaction.transactionType = '';
      expect(validTransaction.canProceedToSettlement()).toBe(false);
      
      // Test missing reference number
      validTransaction.transactionType = 'PAYMENT';
      validTransaction.referenceNumber = '';
      expect(validTransaction.canProceedToSettlement()).toBe(false);
    });
  });

  /**
   * Tests for markAsSettled method
   */
  describe('markAsSettled Method', () => {
    it('should update status to SETTLED and set blockchain transaction ID', () => {
      const blockchainTxId = '0x1234567890abcdef1234567890abcdef12345678';
      
      validTransaction.markAsSettled(blockchainTxId);
      
      expect(validTransaction.status).toBe(TransactionStatus.SETTLED);
      expect(validTransaction.blockchainTransactionId).toBe(blockchainTxId);
    });

    it('should handle various blockchain transaction ID formats', () => {
      const blockchainTxIds = [
        '0x1234567890abcdef1234567890abcdef12345678',
        'blockchain-tx-id-12345',
        'HF_TX_456789',
        'fabric-transaction-hash-abc123'
      ];
      
      blockchainTxIds.forEach(txId => {
        const transaction = new Transaction();
        transaction.markAsSettled(txId);
        
        expect(transaction.status).toBe(TransactionStatus.SETTLED);
        expect(transaction.blockchainTransactionId).toBe(txId);
      });
    });
  });

  /**
   * Tests for updateStatus method
   */
  describe('updateStatus Method', () => {
    it('should allow valid status transitions', () => {
      // PENDING -> PROCESSING
      validTransaction.status = TransactionStatus.PENDING;
      validTransaction.updateStatus(TransactionStatus.PROCESSING);
      expect(validTransaction.status).toBe(TransactionStatus.PROCESSING);
      
      // PROCESSING -> SETTLED
      validTransaction.updateStatus(TransactionStatus.SETTLED);
      expect(validTransaction.status).toBe(TransactionStatus.SETTLED);
    });

    it('should allow retry transitions from FAILED', () => {
      validTransaction.status = TransactionStatus.FAILED;
      validTransaction.updateStatus(TransactionStatus.PROCESSING);
      expect(validTransaction.status).toBe(TransactionStatus.PROCESSING);
    });

    it('should allow rejection from any processable state', () => {
      const rejectableStates = [TransactionStatus.PENDING, TransactionStatus.PROCESSING];
      
      rejectableStates.forEach(state => {
        const transaction = new Transaction();
        transaction.status = state;
        transaction.updateStatus(TransactionStatus.REJECTED);
        expect(transaction.status).toBe(TransactionStatus.REJECTED);
      });
    });

    it('should throw error for invalid status transitions', () => {
      // SETTLED is final state
      validTransaction.status = TransactionStatus.SETTLED;
      expect(() => {
        validTransaction.updateStatus(TransactionStatus.PROCESSING);
      }).toThrow('Invalid status transition from SETTLED to PROCESSING');
      
      // REJECTED is final state
      validTransaction.status = TransactionStatus.REJECTED;
      expect(() => {
        validTransaction.updateStatus(TransactionStatus.PROCESSING);
      }).toThrow('Invalid status transition from REJECTED to PROCESSING');
    });

    it('should handle update status with optional reason parameter', () => {
      validTransaction.status = TransactionStatus.PENDING;
      
      // Method should not throw with reason parameter
      expect(() => {
        validTransaction.updateStatus(TransactionStatus.PROCESSING, 'Risk assessment completed');
      }).not.toThrow();
      
      expect(validTransaction.status).toBe(TransactionStatus.PROCESSING);
    });
  });

  /**
   * Tests for getBaseAmount method
   */
  describe('getBaseAmount Method', () => {
    it('should return amount multiplied by exchange rate', () => {
      validTransaction.amount = 1000.00;
      validTransaction.exchangeRate = 1.2345;
      
      const baseAmount = validTransaction.getBaseAmount();
      expect(baseAmount).toBe(1234.5);
    });

    it('should return original amount when exchange rate is 1.0', () => {
      validTransaction.amount = 500.75;
      validTransaction.exchangeRate = 1.0;
      
      const baseAmount = validTransaction.getBaseAmount();
      expect(baseAmount).toBe(500.75);
    });

    it('should handle undefined exchange rate as 1.0', () => {
      validTransaction.amount = 750.25;
      validTransaction.exchangeRate = undefined as any;
      
      const baseAmount = validTransaction.getBaseAmount();
      expect(baseAmount).toBe(750.25);
    });

    it('should calculate precise amounts with decimal exchange rates', () => {
      const testCases = [
        { amount: 100, rate: 0.85, expected: 85 },
        { amount: 1000, rate: 1.5678, expected: 1567.8 },
        { amount: 50.50, rate: 2.0, expected: 101 }
      ];
      
      testCases.forEach(testCase => {
        validTransaction.amount = testCase.amount;
        validTransaction.exchangeRate = testCase.rate;
        
        const baseAmount = validTransaction.getBaseAmount();
        expect(baseAmount).toBeCloseTo(testCase.expected, 10);
      });
    });
  });

  /**
   * Tests for isCrossBorder method
   */
  describe('isCrossBorder Method', () => {
    it('should return true for transactions with exchange rate not equal to 1.0', () => {
      const crossBorderRates = [0.85, 1.2345, 2.0, 0.5678];
      
      crossBorderRates.forEach(rate => {
        validTransaction.exchangeRate = rate;
        expect(validTransaction.isCrossBorder()).toBe(true);
      });
    });

    it('should return false for transactions with exchange rate equal to 1.0', () => {
      validTransaction.exchangeRate = 1.0;
      expect(validTransaction.isCrossBorder()).toBe(false);
    });

    it('should return false for transactions with undefined exchange rate', () => {
      validTransaction.exchangeRate = undefined as any;
      expect(validTransaction.isCrossBorder()).toBe(false);
    });

    it('should handle edge cases around 1.0', () => {
      const nearOneRates = [0.9999, 1.0001, 1.0000001];
      
      nearOneRates.forEach(rate => {
        validTransaction.exchangeRate = rate;
        expect(validTransaction.isCrossBorder()).toBe(true);
      });
    });
  });

  /**
   * Tests for generateAuditLog method
   */
  describe('generateAuditLog Method', () => {
    it('should generate comprehensive audit log with all transaction data', () => {
      const auditLog = validTransaction.generateAuditLog();
      
      // Verify all expected fields are present
      expect(auditLog).toHaveProperty('transactionId', validTransaction.id);
      expect(auditLog).toHaveProperty('accountId', validTransaction.accountId);
      expect(auditLog).toHaveProperty('amount', validTransaction.amount);
      expect(auditLog).toHaveProperty('currency', validTransaction.currency);
      expect(auditLog).toHaveProperty('status', validTransaction.status);
      expect(auditLog).toHaveProperty('timestamp', validTransaction.timestamp.toISOString());
      expect(auditLog).toHaveProperty('transactionType', validTransaction.transactionType);
      expect(auditLog).toHaveProperty('referenceNumber', validTransaction.referenceNumber);
      expect(auditLog).toHaveProperty('exchangeRate', validTransaction.exchangeRate);
      expect(auditLog).toHaveProperty('counterpartyAccountId', validTransaction.counterpartyAccountId);
      expect(auditLog).toHaveProperty('blockchainTransactionId', validTransaction.blockchainTransactionId);
    });

    it('should include calculated fields in audit log', () => {
      validTransaction.exchangeRate = 1.5;
      const auditLog = validTransaction.generateAuditLog();
      
      expect(auditLog).toHaveProperty('isCrossBorder', true);
      expect(auditLog).toHaveProperty('baseAmount', validTransaction.getBaseAmount());
    });

    it('should include audit timestamp in ISO format', () => {
      const beforeAudit = Date.now();
      const auditLog = validTransaction.generateAuditLog();
      const afterAudit = Date.now();
      
      expect(auditLog).toHaveProperty('auditTimestamp');
      expect(typeof auditLog.auditTimestamp).toBe('string');
      
      const auditTimestamp = new Date(auditLog.auditTimestamp as string);
      expect(auditTimestamp.getTime()).toBeGreaterThanOrEqual(beforeAudit);
      expect(auditTimestamp.getTime()).toBeLessThanOrEqual(afterAudit);
    });

    it('should handle undefined optional fields in audit log', () => {
      const transaction = new Transaction();
      transaction.id = 'test-id';
      transaction.accountId = 'test-account';
      transaction.amount = 100;
      transaction.currency = 'USD';
      transaction.transactionType = 'PAYMENT';
      transaction.referenceNumber = 'REF123';
      
      const auditLog = transaction.generateAuditLog();
      
      expect(auditLog).toHaveProperty('counterpartyAccountId', undefined);
      expect(auditLog).toHaveProperty('blockchainTransactionId', undefined);
      expect(auditLog).toHaveProperty('isCrossBorder', false);
    });

    it('should create immutable audit log objects', () => {
      const auditLog1 = validTransaction.generateAuditLog();
      const auditLog2 = validTransaction.generateAuditLog();
      
      // Each call should generate a new object
      expect(auditLog1).not.toBe(auditLog2);
      
      // Audit timestamps should be different (or very close)
      expect(auditLog1.auditTimestamp).toBeDefined();
      expect(auditLog2.auditTimestamp).toBeDefined();
    });
  });

  /**
   * Tests for comprehensive business logic scenarios
   */
  describe('Business Logic Integration', () => {
    it('should support complete transaction lifecycle', () => {
      const transaction = new Transaction();
      
      // Initialize transaction
      transaction.id = '123e4567-e89b-12d3-a456-426614174000';
      transaction.accountId = 'ACC123456789';
      transaction.amount = 1000.00;
      transaction.currency = 'USD';
      transaction.transactionType = 'PAYMENT';
      transaction.referenceNumber = 'REF-2024-001';
      
      // Verify initial state
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      // Move to processing
      transaction.updateStatus(TransactionStatus.PROCESSING);
      expect(transaction.status).toBe(TransactionStatus.PROCESSING);
      expect(transaction.canProceedToSettlement()).toBe(true);
      
      // Complete settlement
      transaction.markAsSettled('blockchain-tx-12345');
      expect(transaction.status).toBe(TransactionStatus.SETTLED);
      expect(transaction.blockchainTransactionId).toBe('blockchain-tx-12345');
      
      // Generate final audit log
      const auditLog = transaction.generateAuditLog();
      expect(auditLog.status).toBe(TransactionStatus.SETTLED);
      expect(auditLog.blockchainTransactionId).toBe('blockchain-tx-12345');
    });

    it('should handle cross-border transaction processing', () => {
      validTransaction.amount = 1000.00;
      validTransaction.currency = 'EUR';
      validTransaction.exchangeRate = 1.1234;
      
      expect(validTransaction.isCrossBorder()).toBe(true);
      expect(validTransaction.getBaseAmount()).toBeCloseTo(1123.4, 2);
      
      const auditLog = validTransaction.generateAuditLog();
      expect(auditLog.isCrossBorder).toBe(true);
      expect(auditLog.baseAmount).toBeCloseTo(1123.4, 2);
    });

    it('should enforce business rules for settlement processing', () => {
      const transaction = new Transaction();
      
      // Transaction without required fields cannot proceed to settlement
      transaction.status = TransactionStatus.PROCESSING;
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      // Add required fields one by one
      transaction.amount = 100;
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      transaction.accountId = 'valid-account';
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      transaction.currency = 'USD';
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      transaction.transactionType = 'PAYMENT';
      expect(transaction.canProceedToSettlement()).toBe(false);
      
      transaction.referenceNumber = 'REF123';
      expect(transaction.canProceedToSettlement()).toBe(true);
    });
  });
});