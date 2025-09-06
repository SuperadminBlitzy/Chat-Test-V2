/**
 * Unified Financial Services Smart Contract
 * 
 * This smart contract provides the core blockchain functionality for the UFS platform's
 * settlement network, implementing secure transaction processing and settlement management
 * with full regulatory compliance and audit trail capabilities.
 * 
 * Features:
 * - Immutable transaction recording
 * - Multi-party settlement processing  
 * - Real-time transaction status tracking
 * - Comprehensive audit logging
 * - Regulatory compliance automation
 * 
 * @version 1.0.0
 * @author Unified Financial Services Platform Team
 * @license Proprietary - All Rights Reserved
 */

// fabric-contract-api v2.5.4 - Hyperledger Fabric smart contract framework
import { Context, Contract, Info, Transaction as FabricTransaction } from 'fabric-contract-api';

/**
 * Interface defining the structure for financial transactions on the blockchain
 * 
 * Represents a complete financial transaction with all required metadata
 * for settlement processing and regulatory compliance
 */
interface Transaction {
    /** Unique transaction identifier - must be globally unique across the network */
    id: string;
    
    /** Transaction amount in the smallest currency unit (e.g., cents for USD) */
    amount: string;
    
    /** Sender's unique identifier - linked to verified KYC identity records */
    sender: string;
    
    /** Receiver's unique identifier - linked to verified KYC identity records */
    receiver: string;
    
    /** ISO 8601 timestamp of transaction initiation for audit trail compliance */
    timestamp: string;
    
    /** Current transaction status - tracks processing lifecycle */
    status: string;
}

/**
 * Interface defining the structure for settlement records
 * 
 * Represents a settlement batch that groups multiple related transactions
 * for efficient bulk processing and reconciliation
 */
interface Settlement {
    /** Unique settlement identifier for tracking and reconciliation */
    id: string;
    
    /** Array of transaction IDs included in this settlement batch */
    transactionIds: string[];
    
    /** Total settlement amount - sum of all included transactions */
    amount: string;
    
    /** Settlement processing status - tracks settlement lifecycle */
    status: string;
    
    /** ISO 8601 timestamp of settlement creation for audit compliance */
    timestamp: string;
}

/**
 * Main Smart Contract Class for Unified Financial Services Platform
 * 
 * This contract extends Hyperledger Fabric's base Contract class and implements
 * all transaction and settlement management functions required for the UFS
 * blockchain-based settlement network.
 * 
 * The contract ensures:
 * - ACID transaction properties
 * - Immutable audit trails
 * - Regulatory compliance
 * - High-performance settlement processing
 * - Multi-party consensus validation
 */
@Info({
    title: 'UfsSmartContract',
    description: 'Smart Contract for Unified Financial Services Platform - Blockchain Settlement Network'
})
export class SmartContract extends Contract {

    /**
     * Constructor for the SmartContract
     * 
     * Initializes the smart contract with the specified contract name
     * and sets up the Hyperledger Fabric contract framework
     */
    constructor() {
        // Call parent constructor with contract identifier
        super('SmartContract');
    }

    /**
     * Initialize the ledger with sample transaction data
     * 
     * This function is typically called once during chaincode instantiation
     * to bootstrap the ledger with initial data for testing and demonstration
     * purposes. In production, this would be replaced with actual initial state.
     * 
     * @param ctx - Hyperledger Fabric transaction context
     * @returns Promise<void> - Resolves when initialization is complete
     * 
     * @throws Error if ledger initialization fails
     */
    @FabricTransaction()
    public async InitLedger(ctx: Context): Promise<void> {
        console.info('============= START : Initialize Ledger ===========');

        // Define sample transactions for ledger initialization
        // These represent typical financial transactions in the UFS network
        const sampleTransactions: Transaction[] = [
            {
                id: 'TXN001',
                amount: '100000', // $1,000.00 in cents
                sender: 'BANK_A_CUSTOMER_001',
                receiver: 'BANK_B_CUSTOMER_001',
                timestamp: new Date().toISOString(),
                status: 'PENDING'
            },
            {
                id: 'TXN002',
                amount: '250000', // $2,500.00 in cents
                sender: 'BANK_B_CUSTOMER_002',
                receiver: 'BANK_C_CUSTOMER_001',
                timestamp: new Date().toISOString(),
                status: 'PENDING'
            },
            {
                id: 'TXN003',
                amount: '75000', // $750.00 in cents
                sender: 'BANK_C_CUSTOMER_003',
                receiver: 'BANK_A_CUSTOMER_002',
                timestamp: new Date().toISOString(),
                status: 'COMPLETED'
            },
            {
                id: 'TXN004',
                amount: '500000', // $5,000.00 in cents
                sender: 'BANK_A_CUSTOMER_003',
                receiver: 'BANK_D_CUSTOMER_001',
                timestamp: new Date().toISOString(),
                status: 'PROCESSING'
            },
            {
                id: 'TXN005',
                amount: '125000', // $1,250.00 in cents
                sender: 'BANK_D_CUSTOMER_002',
                receiver: 'BANK_B_CUSTOMER_003',
                timestamp: new Date().toISOString(),
                status: 'PENDING'
            }
        ];

        // Iterate through sample transactions and store each in the world state
        for (const transaction of sampleTransactions) {
            try {
                // Convert transaction object to JSON string for storage
                const transactionJson = JSON.stringify(transaction);
                
                // Store transaction in the world state using transaction ID as key
                await ctx.stub.putState(transaction.id, Buffer.from(transactionJson));
                
                // Log successful transaction addition for audit trail
                console.info(`Transaction ${transaction.id} added to ledger: ${transactionJson}`);
                
            } catch (error) {
                // Log error details for troubleshooting
                console.error(`Failed to add transaction ${transaction.id} to ledger:`, error);
                throw new Error(`Ledger initialization failed for transaction ${transaction.id}: ${error.message}`);
            }
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Create a new financial transaction on the blockchain
     * 
     * This function validates the transaction parameters, checks for duplicates,
     * creates a new transaction record with PENDING status, and stores it in
     * the world state with complete audit trail.
     * 
     * @param ctx - Hyperledger Fabric transaction context
     * @param id - Unique transaction identifier
     * @param amount - Transaction amount in smallest currency unit
     * @param sender - Sender's unique identifier
     * @param receiver - Receiver's unique identifier  
     * @param timestamp - ISO 8601 timestamp of transaction initiation
     * @returns Promise<void> - Resolves when transaction is created
     * 
     * @throws Error if transaction ID already exists or validation fails
     */
    @FabricTransaction()
    public async CreateTransaction(
        ctx: Context,
        id: string,
        amount: string,
        sender: string,
        receiver: string,
        timestamp: string
    ): Promise<void> {
        console.info(`============= START : Create Transaction ${id} ===========`);

        // Validate input parameters
        if (!id || !amount || !sender || !receiver || !timestamp) {
            throw new Error('All transaction parameters are required: id, amount, sender, receiver, timestamp');
        }

        // Validate amount is a positive number
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Transaction amount must be a positive number');
        }

        // Validate sender and receiver are different
        if (sender === receiver) {
            throw new Error('Sender and receiver cannot be the same');
        }

        // Validate timestamp format (basic ISO 8601 check)
        const timestampDate = new Date(timestamp);
        if (isNaN(timestampDate.getTime())) {
            throw new Error('Invalid timestamp format. Expected ISO 8601 format.');
        }

        try {
            // Check if transaction with the given ID already exists
            const existingTransactionBytes = await ctx.stub.getState(id);
            
            if (existingTransactionBytes && existingTransactionBytes.length > 0) {
                throw new Error(`Transaction with ID ${id} already exists`);
            }

            // Create new transaction object with PENDING status
            const newTransaction: Transaction = {
                id: id,
                amount: amount,
                sender: sender,
                receiver: receiver,
                timestamp: timestamp,
                status: 'PENDING' // All new transactions start as PENDING
            };

            // Convert transaction object to JSON for storage
            const transactionJson = JSON.stringify(newTransaction);

            // Store the new transaction in the world state
            await ctx.stub.putState(id, Buffer.from(transactionJson));

            // Log successful transaction creation for audit trail
            console.info(`Transaction ${id} created successfully: ${transactionJson}`);

            // Emit transaction creation event for real-time monitoring
            const eventData = {
                transactionId: id,
                amount: amount,
                sender: sender,
                receiver: receiver,
                timestamp: timestamp,
                status: 'PENDING',
                action: 'CREATE'
            };

            await ctx.stub.setEvent('TransactionCreated', Buffer.from(JSON.stringify(eventData)));

        } catch (error) {
            console.error(`Failed to create transaction ${id}:`, error);
            throw new Error(`Transaction creation failed: ${error.message}`);
        }

        console.info(`============= END : Create Transaction ${id} ===========`);
    }

    /**
     * Retrieve a transaction from the world state by its ID
     * 
     * This is a read-only query function that fetches transaction details
     * without modifying the ledger state. Used for transaction status checks,
     * balance inquiries, and audit trail queries.
     * 
     * @param ctx - Hyperledger Fabric transaction context
     * @param id - Unique transaction identifier to query
     * @returns Promise<string> - JSON string of the transaction object
     * 
     * @throws Error if transaction does not exist
     */
    @FabricTransaction(false) // Read-only transaction
    public async QueryTransaction(ctx: Context, id: string): Promise<string> {
        console.info(`============= START : Query Transaction ${id} ===========`);

        // Validate input parameter
        if (!id) {
            throw new Error('Transaction ID is required');
        }

        try {
            // Retrieve transaction from world state
            const transactionBytes = await ctx.stub.getState(id);

            // Check if transaction exists
            if (!transactionBytes || transactionBytes.length === 0) {
                throw new Error(`Transaction with ID ${id} does not exist`);
            }

            // Convert bytes to string and return
            const transactionJson = transactionBytes.toString();
            
            // Validate JSON format before returning
            try {
                JSON.parse(transactionJson);
            } catch (parseError) {
                throw new Error(`Corrupted transaction data for ID ${id}`);
            }

            console.info(`Transaction ${id} retrieved successfully`);
            console.info(`============= END : Query Transaction ${id} ===========`);

            return transactionJson;

        } catch (error) {
            console.error(`Failed to query transaction ${id}:`, error);
            throw new Error(`Transaction query failed: ${error.message}`);
        }
    }

    /**
     * Update the status of an existing transaction
     * 
     * This function modifies the status field of an existing transaction,
     * maintaining the complete audit trail and event logging for regulatory
     * compliance and real-time monitoring.
     * 
     * @param ctx - Hyperledger Fabric transaction context
     * @param id - Unique transaction identifier
     * @param newStatus - New status value (e.g., PROCESSING, COMPLETED, FAILED)
     * @returns Promise<void> - Resolves when status is updated
     * 
     * @throws Error if transaction does not exist or status is invalid
     */
    @FabricTransaction()
    public async UpdateTransactionStatus(
        ctx: Context,
        id: string,
        newStatus: string
    ): Promise<void> {
        console.info(`============= START : Update Transaction Status ${id} ===========`);

        // Validate input parameters
        if (!id || !newStatus) {
            throw new Error('Transaction ID and new status are required');
        }

        // Validate status value against allowed statuses
        const allowedStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!allowedStatuses.includes(newStatus.toUpperCase())) {
            throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
        }

        try {
            // First, retrieve the existing transaction using the QueryTransaction method
            const existingTransactionJson = await this.QueryTransaction(ctx, id);
            
            // Parse the transaction JSON to get the transaction object
            const existingTransaction: Transaction = JSON.parse(existingTransactionJson);

            // Store the previous status for audit trail
            const previousStatus = existingTransaction.status;

            // Validate status transition (basic business rules)
            if (previousStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
                throw new Error('Cannot change status of a completed transaction');
            }

            if (previousStatus === 'FAILED' && !['FAILED', 'CANCELLED'].includes(newStatus)) {
                throw new Error('Failed transactions can only be cancelled');
            }

            // Update the status field
            existingTransaction.status = newStatus.toUpperCase();

            // Convert updated transaction back to JSON
            const updatedTransactionJson = JSON.stringify(existingTransaction);

            // Store the updated transaction in the world state
            await ctx.stub.putState(id, Buffer.from(updatedTransactionJson));

            // Log successful status update for audit trail
            console.info(`Transaction ${id} status updated from ${previousStatus} to ${newStatus}`);

            // Emit status update event for real-time monitoring
            const eventData = {
                transactionId: id,
                previousStatus: previousStatus,
                newStatus: newStatus,
                timestamp: new Date().toISOString(),
                action: 'STATUS_UPDATE'
            };

            await ctx.stub.setEvent('TransactionStatusUpdated', Buffer.from(JSON.stringify(eventData)));

        } catch (error) {
            console.error(`Failed to update transaction status for ${id}:`, error);
            throw new Error(`Transaction status update failed: ${error.message}`);
        }

        console.info(`============= END : Update Transaction Status ${id} ===========`);
    }

    /**
     * Create a new settlement record on the blockchain
     * 
     * This function creates a settlement batch that groups multiple transactions
     * for bulk processing, reconciliation, and regulatory reporting. Settlements
     * enable efficient processing of related transactions and provide clear
     * audit trails for compliance purposes.
     * 
     * @param ctx - Hyperledger Fabric transaction context
     * @param settlementId - Unique settlement identifier
     * @param transactionIds - Array of transaction IDs to include in settlement
     * @param amount - Total settlement amount
     * @param status - Settlement status
     * @param timestamp - ISO 8601 timestamp of settlement creation
     * @returns Promise<void> - Resolves when settlement is created
     * 
     * @throws Error if settlement ID already exists or validation fails
     */
    @FabricTransaction()
    public async CreateSettlement(
        ctx: Context,
        settlementId: string,
        transactionIds: string[],
        amount: string,
        status: string,
        timestamp: string
    ): Promise<void> {
        console.info(`============= START : Create Settlement ${settlementId} ===========`);

        // Validate input parameters
        if (!settlementId || !transactionIds || !amount || !status || !timestamp) {
            throw new Error('All settlement parameters are required: settlementId, transactionIds, amount, status, timestamp');
        }

        // Validate transactionIds is an array and not empty
        if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
            throw new Error('Transaction IDs must be a non-empty array');
        }

        // Validate amount is a positive number
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Settlement amount must be a positive number');
        }

        // Validate timestamp format
        const timestampDate = new Date(timestamp);
        if (isNaN(timestampDate.getTime())) {
            throw new Error('Invalid timestamp format. Expected ISO 8601 format.');
        }

        // Validate status
        const allowedSettlementStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
        if (!allowedSettlementStatuses.includes(status.toUpperCase())) {
            throw new Error(`Invalid settlement status. Allowed values: ${allowedSettlementStatuses.join(', ')}`);
        }

        try {
            // Check if settlement with the given ID already exists
            const existingSettlementBytes = await ctx.stub.getState(settlementId);
            
            if (existingSettlementBytes && existingSettlementBytes.length > 0) {
                throw new Error(`Settlement with ID ${settlementId} already exists`);
            }

            // Validate that all referenced transactions exist
            const transactionValidationPromises = transactionIds.map(async (txnId) => {
                try {
                    await this.QueryTransaction(ctx, txnId);
                    return true;
                } catch (error) {
                    throw new Error(`Referenced transaction ${txnId} does not exist`);
                }
            });

            // Wait for all transaction validations to complete
            await Promise.all(transactionValidationPromises);

            // Create new settlement object
            const newSettlement: Settlement = {
                id: settlementId,
                transactionIds: transactionIds,
                amount: amount,
                status: status.toUpperCase(),
                timestamp: timestamp
            };

            // Convert settlement object to JSON for storage
            const settlementJson = JSON.stringify(newSettlement);

            // Store the new settlement in the world state
            await ctx.stub.putState(settlementId, Buffer.from(settlementJson));

            // Log successful settlement creation for audit trail
            console.info(`Settlement ${settlementId} created successfully with ${transactionIds.length} transactions`);
            console.info(`Settlement details: ${settlementJson}`);

            // Emit settlement creation event for real-time monitoring
            const eventData = {
                settlementId: settlementId,
                transactionCount: transactionIds.length,
                amount: amount,
                status: status.toUpperCase(),
                timestamp: timestamp,
                action: 'CREATE_SETTLEMENT'
            };

            await ctx.stub.setEvent('SettlementCreated', Buffer.from(JSON.stringify(eventData)));

        } catch (error) {
            console.error(`Failed to create settlement ${settlementId}:`, error);
            throw new Error(`Settlement creation failed: ${error.message}`);
        }

        console.info(`============= END : Create Settlement ${settlementId} ===========`);
    }

    /**
     * Retrieve a settlement record from the world state by its ID
     * 
     * This is a read-only query function that fetches settlement details
     * including all associated transaction IDs, amounts, and status information.
     * Used for settlement tracking, reconciliation, and regulatory reporting.
     * 
     * @param ctx - Hyperledger Fabric transaction context  
     * @param settlementId - Unique settlement identifier to query
     * @returns Promise<string> - JSON string of the settlement object
     * 
     * @throws Error if settlement does not exist
     */
    @FabricTransaction(false) // Read-only transaction
    public async QuerySettlement(ctx: Context, settlementId: string): Promise<string> {
        console.info(`============= START : Query Settlement ${settlementId} ===========`);

        // Validate input parameter
        if (!settlementId) {
            throw new Error('Settlement ID is required');
        }

        try {
            // Retrieve settlement from world state
            const settlementBytes = await ctx.stub.getState(settlementId);

            // Check if settlement exists
            if (!settlementBytes || settlementBytes.length === 0) {
                throw new Error(`Settlement with ID ${settlementId} does not exist`);
            }

            // Convert bytes to string and return
            const settlementJson = settlementBytes.toString();
            
            // Validate JSON format before returning
            try {
                JSON.parse(settlementJson);
            } catch (parseError) {
                throw new Error(`Corrupted settlement data for ID ${settlementId}`);
            }

            console.info(`Settlement ${settlementId} retrieved successfully`);
            console.info(`============= END : Query Settlement ${settlementId} ===========`);

            return settlementJson;

        } catch (error) {
            console.error(`Failed to query settlement ${settlementId}:`, error);
            throw new Error(`Settlement query failed: ${error.message}`);
        }
    }
}

/**
 * Export the contract array for chaincode module
 * 
 * This array contains the contract classes that will be registered
 * when the chaincode is instantiated on the Hyperledger Fabric network.
 * Multiple contracts can be exported for complex chaincode scenarios.
 */
export const contracts: typeof Contract[] = [SmartContract];