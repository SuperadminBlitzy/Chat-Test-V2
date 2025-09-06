import request from 'supertest'; // Version 6.3.3 - HTTP assertion library for testing Express applications
import app from '../src/app'; // The Express application instance to be tested

/**
 * Integration Tests for Blockchain Service API Routes
 * 
 * This test suite comprehensively tests all API endpoints for the blockchain service,
 * including settlements, smart contracts, and transactions. It covers both success
 * and failure scenarios to ensure robust API behavior.
 * 
 * Testing Framework: Jest 29.7.0
 * HTTP Testing: Supertest 6.3.3
 * 
 * Requirements Addressed:
 * - F-009: Blockchain-based Settlement Network
 * - F-010: Smart Contract Management  
 * - F-011: Cross-border Payment Processing
 */

describe('Blockchain Service Routes', () => {
  
  /**
   * Settlement Routes Test Suite
   * Tests the settlement API endpoints that manage blockchain-based settlements
   * including creation, retrieval, validation, and error handling
   */
  describe('Settlement Routes', () => {
    
    /**
     * Test successful settlement creation
     * Validates POST /settlements endpoint with valid settlement data
     * 
     * Expected behavior:
     * - Accepts valid settlement parameters
     * - Returns 201 Created status
     * - Returns settlement object with generated ID
     * - Includes blockchain transaction hash
     * - Validates settlement amount and currency
     */
    it('should successfully create a new settlement', async () => {
      const settlementData = {
        amount: 10000.50,
        currency: 'USD',
        fromAccount: 'ACC-001-BANK1',
        toAccount: 'ACC-002-BANK2',
        settlementType: 'INSTANT',
        reference: 'TXN-REF-001',
        metadata: {
          orderingCustomer: 'Customer A',
          beneficiaryCustomer: 'Customer B',
          purposeCode: 'TRADE',
          regulatoryReporting: 'REQUIRED'
        }
      };

      const response = await request(app)
        .post('/settlements')
        .send(settlementData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Validate response structure and data
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body.amount).toBe(settlementData.amount);
      expect(response.body.currency).toBe(settlementData.currency);
      expect(response.body.fromAccount).toBe(settlementData.fromAccount);
      expect(response.body.toAccount).toBe(settlementData.toAccount);
      expect(response.body.status).toBe('PENDING');
      expect(response.body.settlementType).toBe(settlementData.settlementType);
      expect(response.body.reference).toBe(settlementData.reference);
      expect(response.body.metadata).toEqual(settlementData.metadata);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.blockchainNetwork).toBe('hyperledger-fabric');
      
      // Validate transaction hash format (64 character hex string)
      expect(response.body.transactionHash).toMatch(/^[a-f0-9]{64}$/);
      
      // Validate compliance fields
      expect(response.body.complianceStatus).toBe('VERIFIED');
      expect(response.body.amlStatus).toBe('CLEARED');
    });

    /**
     * Test successful settlement retrieval by ID
     * Validates GET /settlements/:id endpoint
     * 
     * Expected behavior:
     * - Returns 200 OK for valid settlement ID
     * - Returns complete settlement object
     * - Includes current blockchain status
     * - Shows settlement processing stages
     */
    it('should successfully retrieve a settlement by ID', async () => {
      const settlementId = 'settlement-12345';
      
      const response = await request(app)
        .get(`/settlements/${settlementId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Validate settlement object structure
      expect(response.body).toHaveProperty('id', settlementId);
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('fromAccount');
      expect(response.body).toHaveProperty('toAccount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('settlementType');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('blockchainNetwork');
      expect(response.body).toHaveProperty('confirmations');
      
      // Validate blockchain-specific fields
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('gasUsed');
      expect(response.body).toHaveProperty('networkFee');
      
      // Validate audit trail
      expect(response.body).toHaveProperty('auditTrail');
      expect(Array.isArray(response.body.auditTrail)).toBe(true);
      
      // Validate compliance tracking
      expect(response.body).toHaveProperty('complianceStatus');
      expect(response.body).toHaveProperty('amlStatus');
      expect(response.body).toHaveProperty('kycStatus');
    });

    /**
     * Test settlement creation with invalid data
     * Validates POST /settlements endpoint error handling
     * 
     * Expected behavior:
     * - Returns 400 Bad Request for invalid data
     * - Provides detailed validation error messages
     * - Does not create settlement record
     * - Does not initiate blockchain transaction
     */
    it('should fail to create settlement with invalid data', async () => {
      const invalidSettlementData = {
        amount: -1000, // Invalid negative amount
        currency: 'INVALID_CURRENCY', // Invalid currency code
        fromAccount: '', // Empty account
        toAccount: 'ACC-002-BANK2',
        settlementType: 'UNKNOWN_TYPE', // Invalid settlement type
        // Missing required reference field
        metadata: {
          invalidField: 'should be rejected'
        }
      };

      const response = await request(app)
        .post('/settlements')
        .send(invalidSettlementData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Validate error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('validationErrors');
      expect(Array.isArray(response.body.validationErrors)).toBe(true);
      
      // Validate specific validation errors
      const errors = response.body.validationErrors;
      expect(errors.some((err: any) => err.field === 'amount')).toBe(true);
      expect(errors.some((err: any) => err.field === 'currency')).toBe(true);
      expect(errors.some((err: any) => err.field === 'fromAccount')).toBe(true);
      expect(errors.some((err: any) => err.field === 'reference')).toBe(true);
      
      // Validate error codes
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test settlement retrieval for non-existent ID
     * Validates GET /settlements/:id endpoint error handling
     * 
     * Expected behavior:
     * - Returns 404 Not Found for non-existent settlement
     * - Provides appropriate error message
     * - Includes suggested actions
     */
    it('should return 404 when settlement is not found', async () => {
      const nonExistentId = 'settlement-nonexistent-999';
      
      const response = await request(app)
        .get(`/settlements/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      // Validate error response
      expect(response.body).toHaveProperty('error', 'Settlement not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('settlementId', nonExistentId);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.errorCode).toBe('SETTLEMENT_NOT_FOUND');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test settlement creation with insufficient funds scenario
     * Validates business logic and blockchain validation
     */
    it('should fail settlement creation with insufficient funds', async () => {
      const settlementData = {
        amount: 1000000000, // Extremely large amount
        currency: 'USD',
        fromAccount: 'ACC-001-BANK1',
        toAccount: 'ACC-002-BANK2',
        settlementType: 'INSTANT',
        reference: 'TXN-REF-INSUFFICIENT'
      };

      const response = await request(app)
        .post('/settlements')
        .send(settlementData)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.error).toBe('Insufficient funds');
      expect(response.body.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(response.body).toHaveProperty('availableBalance');
      expect(response.body).toHaveProperty('requestedAmount');
    });
  });

  /**
   * Smart Contract Routes Test Suite
   * Tests the smart contract management API endpoints including deployment,
   * retrieval, execution, and lifecycle management
   */
  describe('Smart Contract Routes', () => {
    
    /**
     * Test successful smart contract deployment
     * Validates POST /contracts endpoint
     * 
     * Expected behavior:
     * - Deploys smart contract to blockchain network
     * - Returns contract address and transaction hash  
     * - Validates contract bytecode and ABI
     * - Initializes contract state correctly
     */
    it('should successfully deploy a smart contract', async () => {
      const contractData = {
        name: 'PaymentContract',
        version: '1.0.0',
        sourceCode: `
          pragma solidity ^0.8.0;
          contract PaymentContract {
            mapping(address => uint256) public balances;
            
            function transfer(address to, uint256 amount) public {
              require(balances[msg.sender] >= amount, "Insufficient balance");
              balances[msg.sender] -= amount;
              balances[to] += amount;
            }
          }
        `,
        constructorParams: {
          initialSupply: 1000000,
          tokenName: 'FinanceToken',
          tokenSymbol: 'FIN'
        },
        metadata: {
          compiler: 'solc 0.8.19',
          optimization: true,
          runs: 200,
          license: 'MIT'
        },
        permissions: {
          admin: 'admin-address-001',
          operators: ['operator-001', 'operator-002'],
          audited: true
        }
      };

      const response = await request(app)
        .post('/contracts')
        .send(contractData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Validate deployment response
      expect(response.body).toHaveProperty('contractAddress');
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body.name).toBe(contractData.name);
      expect(response.body.version).toBe(contractData.version);
      expect(response.body.status).toBe('DEPLOYED');
      expect(response.body.deployedAt).toBeDefined();
      expect(response.body.gasUsed).toBeGreaterThan(0);
      
      // Validate contract address format (42 character hex with 0x prefix)
      expect(response.body.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      
      // Validate blockchain network information
      expect(response.body.networkId).toBeDefined();
      expect(response.body.chainId).toBeDefined();
      
      // Validate ABI and bytecode
      expect(response.body).toHaveProperty('abi');
      expect(response.body).toHaveProperty('bytecode');
      expect(Array.isArray(response.body.abi)).toBe(true);
      
      // Validate security features
      expect(response.body).toHaveProperty('securityAudit');
      expect(response.body.securityAudit.status).toBe('PASSED');
    });

    /**
     * Test successful smart contract retrieval by address
     * Validates GET /contracts/:address endpoint
     * 
     * Expected behavior:
     * - Returns complete contract information
     * - Includes current contract state
     * - Shows transaction history
     * - Provides execution statistics
     */
    it('should successfully retrieve a smart contract by address', async () => {
      const contractAddress = '0x742d35Cc6634C0532925a3b8D31f0d7b1f3f8F8e';
      
      const response = await request(app)
        .get(`/contracts/${contractAddress}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Validate contract object structure
      expect(response.body).toHaveProperty('contractAddress', contractAddress);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('deployedAt');
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('abi');
      expect(response.body).toHaveProperty('bytecode');
      
      // Validate contract state information
      expect(response.body).toHaveProperty('state');
      expect(response.body).toHaveProperty('totalTransactions');
      expect(response.body).toHaveProperty('lastActivity');
      
      // Validate execution statistics
      expect(response.body).toHaveProperty('executionStats');
      expect(response.body.executionStats).toHaveProperty('totalGasUsed');
      expect(response.body.executionStats).toHaveProperty('averageGasPerCall');
      expect(response.body.executionStats).toHaveProperty('successfulCalls');
      expect(response.body.executionStats).toHaveProperty('failedCalls');
      
      // Validate permission structure
      expect(response.body).toHaveProperty('permissions');
      expect(response.body.permissions).toHaveProperty('admin');
      expect(response.body.permissions).toHaveProperty('operators');
      
      // Validate compliance information
      expect(response.body).toHaveProperty('complianceStatus');
      expect(response.body).toHaveProperty('auditReports');
    });

    /**
     * Test smart contract deployment with invalid parameters
     * Validates POST /contracts endpoint error handling
     * 
     * Expected behavior:
     * - Returns 400 Bad Request for invalid parameters
     * - Validates source code syntax
     * - Checks constructor parameter types
     * - Prevents deployment of malicious contracts
     */
    it('should fail to deploy smart contract with invalid parameters', async () => {
      const invalidContractData = {
        name: '', // Empty name
        version: 'invalid-version-format', // Invalid version format
        sourceCode: 'invalid solidity code', // Invalid source code
        constructorParams: {
          invalidParam: 'should cause error'
        },
        metadata: {
          compiler: 'unknown-compiler' // Invalid compiler
        }
      };

      const response = await request(app)
        .post('/contracts')
        .send(invalidContractData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Validate error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('validationErrors');
      expect(Array.isArray(response.body.validationErrors)).toBe(true);
      
      // Validate specific validation errors
      const errors = response.body.validationErrors;
      expect(errors.some((err: any) => err.field === 'name')).toBe(true);
      expect(errors.some((err: any) => err.field === 'sourceCode')).toBe(true);
      expect(errors.some((err: any) => err.field === 'version')).toBe(true);
      
      // Validate compilation errors
      expect(response.body).toHaveProperty('compilationErrors');
      expect(response.body.errorCode).toBe('CONTRACT_VALIDATION_ERROR');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test smart contract retrieval for non-existent address
     * Validates GET /contracts/:address endpoint error handling
     * 
     * Expected behavior:
     * - Returns 404 Not Found for non-existent contract
     * - Validates contract address format
     * - Provides helpful error messages
     */
    it('should return 404 when smart contract is not found', async () => {
      const nonExistentAddress = '0x0000000000000000000000000000000000000000';
      
      const response = await request(app)
        .get(`/contracts/${nonExistentAddress}`)
        .expect('Content-Type', /json/)
        .expect(404);

      // Validate error response
      expect(response.body).toHaveProperty('error', 'Smart contract not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('contractAddress', nonExistentAddress);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.errorCode).toBe('CONTRACT_NOT_FOUND');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test smart contract deployment with insufficient gas
     * Validates gas estimation and blockchain resource management
     */
    it('should fail contract deployment with insufficient gas', async () => {
      const contractData = {
        name: 'LargeContract',
        version: '1.0.0',
        sourceCode: 'contract LargeContract { uint256[1000000] data; }', // Very large contract
        gasLimit: 100000, // Insufficient gas limit
        gasPrice: 1000000000
      };

      const response = await request(app)
        .post('/contracts')
        .send(contractData)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.error).toBe('Insufficient gas for deployment');
      expect(response.body.errorCode).toBe('INSUFFICIENT_GAS');
      expect(response.body).toHaveProperty('estimatedGas');
      expect(response.body).toHaveProperty('providedGas');
    });
  });

  /**
   * Transaction Routes Test Suite
   * Tests the transaction processing API endpoints for cross-border payments
   * and blockchain transaction management
   */
  describe('Transaction Routes', () => {
    
    /**
     * Test successful transaction creation
     * Validates POST /transactions endpoint
     * 
     * Expected behavior:
     * - Creates blockchain transaction
     * - Validates transaction parameters
     * - Returns transaction ID and hash
     * - Initiates settlement process
     */
    it('should successfully create a new transaction', async () => {
      const transactionData = {
        type: 'CROSS_BORDER_PAYMENT',
        amount: 5000.00,
        currency: 'EUR',
        fromAddress: '0x742d35Cc6634C0532925a3b8D31f0d7b1f3f8F8e',
        toAddress: '0x1234567890123456789012345678901234567890',
        gasLimit: 21000,
        gasPrice: 20000000000, // 20 Gwei
        nonce: 42,
        data: '0x', // Empty data for simple transfer
        metadata: {
          senderName: 'Alice Johnson',
          receiverName: 'Bob Smith',
          purpose: 'Trade Settlement',
          reference: 'INV-2024-001',
          complianceCheck: true,
          countryCode: 'DE',
          purposeCode: 'TRADE'
        },
        routing: {
          intermediaryBanks: ['DEUTDEFF', 'CHASUS33'],
          correspondent: 'BANK-CORRESPONDENT-001',
          clearingSystem: 'TARGET2'
        }
      };

      const response = await request(app)
        .post('/transactions')
        .send(transactionData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Validate transaction response
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body.type).toBe(transactionData.type);
      expect(response.body.amount).toBe(transactionData.amount);
      expect(response.body.currency).toBe(transactionData.currency);
      expect(response.body.fromAddress).toBe(transactionData.fromAddress);
      expect(response.body.toAddress).toBe(transactionData.toAddress);
      expect(response.body.status).toBe('PENDING');
      expect(response.body.createdAt).toBeDefined();
      
      // Validate blockchain-specific fields
      expect(response.body.gasLimit).toBe(transactionData.gasLimit);
      expect(response.body.gasPrice).toBe(transactionData.gasPrice);
      expect(response.body.nonce).toBe(transactionData.nonce);
      expect(response.body).toHaveProperty('estimatedConfirmationTime');
      
      // Validate transaction hash format
      expect(response.body.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      
      // Validate metadata preservation
      expect(response.body.metadata).toEqual(transactionData.metadata);
      expect(response.body.routing).toEqual(transactionData.routing);
      
      // Validate compliance fields
      expect(response.body).toHaveProperty('complianceStatus');
      expect(response.body).toHaveProperty('amlCheck');
      expect(response.body).toHaveProperty('sanctionsCheck');
      expect(response.body.complianceStatus).toBe('VERIFIED');
    });

    /**
     * Test successful transaction retrieval by ID
     * Validates GET /transactions/:id endpoint
     * 
     * Expected behavior:
     * - Returns complete transaction details
     * - Shows current blockchain status
     * - Includes confirmation count
     * - Provides execution receipt
     */
    it('should successfully retrieve a transaction by ID', async () => {
      const transactionId = 'txn-67890';
      
      const response = await request(app)
        .get(`/transactions/${transactionId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Validate transaction object structure
      expect(response.body).toHaveProperty('id', transactionId);
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('fromAddress');
      expect(response.body).toHaveProperty('toAddress');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Validate blockchain confirmation details
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('blockHash');
      expect(response.body).toHaveProperty('confirmations');
      expect(response.body).toHaveProperty('gasUsed');
      expect(response.body).toHaveProperty('effectiveGasPrice');
      
      // Validate transaction receipt
      expect(response.body).toHaveProperty('receipt');
      expect(response.body.receipt).toHaveProperty('status');
      expect(response.body.receipt).toHaveProperty('logs');
      expect(Array.isArray(response.body.receipt.logs)).toBe(true);
      
      // Validate timing information
      expect(response.body).toHaveProperty('confirmedAt');
      expect(response.body).toHaveProperty('processingTime');
      
      // Validate compliance tracking
      expect(response.body).toHaveProperty('complianceHistory');
      expect(Array.isArray(response.body.complianceHistory)).toBe(true);
      
      // Validate fee information
      expect(response.body).toHaveProperty('networkFee');
      expect(response.body).toHaveProperty('totalCost');
    });

    /**
     * Test transaction creation with invalid data
     * Validates POST /transactions endpoint error handling
     * 
     * Expected behavior:
     * - Returns 400 Bad Request for invalid data
     * - Validates address formats
     * - Checks amount and gas parameters
     * - Prevents invalid transaction types
     */
    it('should fail to create transaction with invalid data', async () => {
      const invalidTransactionData = {
        type: 'INVALID_TYPE', // Invalid transaction type
        amount: -100, // Negative amount
        currency: 'INVALID', // Invalid currency
        fromAddress: 'invalid-address', // Invalid address format
        toAddress: '0x123', // Too short address
        gasLimit: -1, // Invalid gas limit
        gasPrice: 0, // Zero gas price
        nonce: 'invalid', // Invalid nonce type
        metadata: {
          invalidField: 'should cause validation error'
        }
      };

      const response = await request(app)
        .post('/transactions')
        .send(invalidTransactionData)
        .expect('Content-Type', /json/)
        .expect(400);

      // Validate error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('validationErrors');
      expect(Array.isArray(response.body.validationErrors)).toBe(true);
      
      // Validate specific validation errors
      const errors = response.body.validationErrors;
      expect(errors.some((err: any) => err.field === 'type')).toBe(true);
      expect(errors.some((err: any) => err.field === 'amount')).toBe(true);
      expect(errors.some((err: any) => err.field === 'currency')).toBe(true);
      expect(errors.some((err: any) => err.field === 'fromAddress')).toBe(true);
      expect(errors.some((err: any) => err.field === 'toAddress')).toBe(true);
      expect(errors.some((err: any) => err.field === 'gasLimit')).toBe(true);
      
      // Validate address format errors
      expect(errors.some((err: any) => err.message.includes('Invalid address format'))).toBe(true);
      
      expect(response.body.errorCode).toBe('TRANSACTION_VALIDATION_ERROR');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test transaction retrieval for non-existent ID
     * Validates GET /transactions/:id endpoint error handling
     * 
     * Expected behavior:
     * - Returns 404 Not Found for non-existent transaction
     * - Provides helpful error message
     * - Suggests alternative actions
     */
    it('should return 404 when transaction is not found', async () => {
      const nonExistentId = 'txn-nonexistent-999';
      
      const response = await request(app)
        .get(`/transactions/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      // Validate error response
      expect(response.body).toHaveProperty('error', 'Transaction not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('transactionId', nonExistentId);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.errorCode).toBe('TRANSACTION_NOT_FOUND');
      expect(response.body.timestamp).toBeDefined();
    });

    /**
     * Test transaction creation with compliance violation
     * Validates AML/KYC compliance checks during transaction processing
     */
    it('should fail transaction creation due to compliance violation', async () => {
      const suspiciousTransactionData = {
        type: 'CROSS_BORDER_PAYMENT',
        amount: 50000.00, // Large amount that triggers compliance check
        currency: 'USD',
        fromAddress: '0x742d35Cc6634C0532925a3b8D31f0d7b1f3f8F8e',
        toAddress: '0x0000000000000000000000000000000000000001', // Blacklisted address
        metadata: {
          senderName: 'Suspicious Person',
          purpose: 'Cash Transfer', // High-risk purpose
          countryCode: 'XX' // High-risk country
        }
      };

      const response = await request(app)
        .post('/transactions')
        .send(suspiciousTransactionData)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.error).toBe('Transaction blocked by compliance rules');
      expect(response.body.errorCode).toBe('COMPLIANCE_VIOLATION');
      expect(response.body).toHaveProperty('violationReasons');
      expect(Array.isArray(response.body.violationReasons)).toBe(true);
      expect(response.body).toHaveProperty('complianceReference');
    });

    /**
     * Test transaction creation with network congestion
     * Validates gas price adjustment and network fee handling
     */
    it('should handle transaction creation during network congestion', async () => {
      const transactionData = {
        type: 'PAYMENT',
        amount: 100.00,
        currency: 'ETH',
        fromAddress: '0x742d35Cc6634C0532925a3b8D31f0d7b1f3f8F8e',
        toAddress: '0x1234567890123456789012345678901234567890',
        gasPrice: 1000000000, // Low gas price during congestion
        priority: 'HIGH'
      };

      const response = await request(app)
        .post('/transactions')
        .send(transactionData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Should automatically adjust gas price for high priority
      expect(response.body.gasPrice).toBeGreaterThan(transactionData.gasPrice);
      expect(response.body).toHaveProperty('gasPriceAdjusted', true);
      expect(response.body).toHaveProperty('networkCongestionLevel');
      expect(response.body).toHaveProperty('estimatedConfirmationTime');
    });
  });

  /**
   * Cross-Route Integration Tests
   * Tests the interaction between different API endpoints and ensures
   * proper data flow and consistency across the blockchain service
   */
  describe('Cross-Route Integration', () => {
    
    /**
     * Test end-to-end settlement with smart contract execution
     * Validates the complete workflow from settlement creation to smart contract execution
     */
    it('should complete end-to-end settlement with smart contract execution', async () => {
      // Step 1: Deploy payment smart contract
      const contractData = {
        name: 'AutomatedSettlement',
        version: '1.0.0',
        sourceCode: 'contract AutomatedSettlement { function settle() public returns (bool) { return true; } }',
        constructorParams: {}
      };

      const contractResponse = await request(app)
        .post('/contracts')
        .send(contractData)
        .expect(201);

      const contractAddress = contractResponse.body.contractAddress;

      // Step 2: Create settlement referencing the smart contract
      const settlementData = {
        amount: 1000.00,
        currency: 'USD',
        fromAccount: 'ACC-001-BANK1',
        toAccount: 'ACC-002-BANK2',
        settlementType: 'SMART_CONTRACT',
        contractAddress: contractAddress,
        reference: 'TXN-INTEGRATION-001'
      };

      const settlementResponse = await request(app)
        .post('/settlements')
        .send(settlementData)
        .expect(201);

      // Step 3: Verify settlement references the contract
      expect(settlementResponse.body.contractAddress).toBe(contractAddress);
      expect(settlementResponse.body.settlementType).toBe('SMART_CONTRACT');

      // Step 4: Create transaction for the settlement
      const transactionData = {
        type: 'SETTLEMENT_EXECUTION',
        amount: settlementData.amount,
        currency: settlementData.currency,
        fromAddress: '0x742d35Cc6634C0532925a3b8D31f0d7b1f3f8F8e',
        toAddress: contractAddress,
        settlementId: settlementResponse.body.id,
        gasLimit: 100000
      };

      const transactionResponse = await request(app)
        .post('/transactions')
        .send(transactionData)
        .expect(201);

      // Step 5: Verify transaction links to settlement
      expect(transactionResponse.body.settlementId).toBe(settlementResponse.body.id);
      expect(transactionResponse.body.type).toBe('SETTLEMENT_EXECUTION');
    });
  });

  /**
   * Error Handling and Edge Cases
   * Tests various error scenarios and edge cases to ensure robust error handling
   */
  describe('Error Handling and Edge Cases', () => {
    
    /**
     * Test API rate limiting
     * Validates that the API properly handles high-frequency requests
     */
    it('should handle rate limiting for high-frequency requests', async () => {
      const requests = Array(20).fill(null).map(() => 
        request(app)
          .get('/settlements/test-settlement-001')
          .expect(res => {
            expect([200, 429]).toContain(res.status);
          })
      );

      await Promise.all(requests);
    });

    /**
     * Test malformed JSON handling
     * Validates proper handling of malformed request bodies
     */
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/settlements')
        .send('{"invalid": json,}')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.error).toBe('Invalid JSON format');
      expect(response.body.errorCode).toBe('MALFORMED_JSON');
    });

    /**
     * Test large payload handling
     * Validates handling of requests that exceed size limits
     */
    it('should handle oversized request payloads', async () => {
      const largePayload = {
        name: 'Test',
        data: 'x'.repeat(10000000) // 10MB string
      };

      const response = await request(app)
        .post('/contracts')
        .send(largePayload)
        .expect(413);

      expect(response.body.error).toBe('Payload too large');
      expect(response.body.errorCode).toBe('PAYLOAD_TOO_LARGE');
    });
  });

  /**
   * Performance and Load Tests
   * Tests to ensure the API performs well under various load conditions
   */
  describe('Performance Tests', () => {
    
    /**
     * Test concurrent request handling
     * Validates that the API can handle multiple concurrent requests
     */
    it('should handle concurrent settlement requests', async () => {
      const concurrentRequests = Array(10).fill(null).map((_, index) => {
        const settlementData = {
          amount: 1000 + index,
          currency: 'USD',
          fromAccount: `ACC-${index}-BANK1`,
          toAccount: `ACC-${index}-BANK2`,
          settlementType: 'INSTANT',
          reference: `TXN-CONCURRENT-${index}`
        };

        return request(app)
          .post('/settlements')
          .send(settlementData)
          .expect(201);
      });

      const responses = await Promise.all(concurrentRequests);
      
      // Verify all requests completed successfully
      responses.forEach((response, index) => {
        expect(response.body.amount).toBe(1000 + index);
        expect(response.body.reference).toBe(`TXN-CONCURRENT-${index}`);
      });
    });
  });
});