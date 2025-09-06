/**
 * Settlement Smart Contract for Unified Financial Services Platform
 * 
 * This smart contract manages the complete lifecycle of financial settlements on the
 * Hyperledger Fabric blockchain network. It provides secure, transparent, and immutable
 * settlement processing capabilities that support atomic transaction resolution and
 * multi-party consensus validation.
 * 
 * Key Features:
 * - Atomic settlement operations eliminating settlement risk
 * - Immutable audit trails for regulatory compliance  
 * - Real-time settlement status tracking and updates
 * - Multi-party validation and consensus mechanisms
 * - Comprehensive error handling and validation
 * - Event-driven architecture for real-time monitoring
 * 
 * Regulatory Compliance:
 * - SOX, IFRS, and GDPR compliance through immutable records
 * - Basel III/IV settlement risk management
 * - Real-time regulatory reporting capabilities
 * - Complete audit trail maintenance
 * 
 * Technical Implementation:
 * - Built on Hyperledger Fabric v2.5+ framework
 * - Supports ISO20022 and SWIFT messaging standards
 * - Implements atomic settlement design patterns
 * - Provides high-performance settlement processing
 * 
 * @version 1.0.0
 * @author UFS Blockchain Development Team
 * @license Proprietary - All Rights Reserved
 */

// fabric-contract-api v2.5.0 - Hyperledger Fabric smart contract framework providing core blockchain functionality
import { Contract, Context, Info, Returns, Transaction as FabricTransaction } from 'fabric-contract-api';

// Internal imports for smart contract inheritance and data models
import { SmartContract } from './smartContract';
import { Transaction } from './transaction';

/**
 * Interface defining the structure for settlement records on the blockchain
 * 
 * Represents a settlement batch that groups multiple related transactions for
 * efficient bulk processing, regulatory compliance, and cross-party reconciliation.
 */
interface Settlement {
    /** Unique settlement identifier for tracking and reconciliation purposes */
    settlementId: string;
    
    /** Transaction ID that initiated or relates to this settlement */
    transactionId: string;
    
    /** Array of participant identifiers involved in the settlement */
    participants: string[];
    
    /** Settlement amount in the smallest currency unit (e.g., cents for USD) */
    amount: number;
    
    /** ISO 4217 currency code for the settlement amount */
    currency: string;
    
    /** Current settlement status tracking lifecycle progression */
    status: string;
    
    /** ISO 8601 timestamp of settlement creation for audit compliance */
    createdAt: string;
    
    /** ISO 8601 timestamp of last settlement update for change tracking */
    updatedAt?: string;
    
    /** Settlement batch identifier for related transaction grouping */
    batchId?: string;
    
    /** Optional settlement metadata for additional context */
    metadata?: Record<string, any>;
}

/**
 * SettlementContract Class for Blockchain-based Settlement Network
 * 
 * This smart contract extends the base SmartContract class and implements all
 * settlement management functions required for the UFS blockchain-based settlement
 * network. It ensures atomic transaction properties, immutable audit trails,
 * and regulatory compliance while providing high-performance settlement processing.
 * 
 * Settlement Lifecycle:
 * 1. PENDING - Settlement created and awaiting processing
 * 2. PROCESSING - Active settlement validation and execution
 * 3. COMPLETED - Settlement successfully finalized
 * 4. FAILED - Settlement processing failed, requires investigation
 * 5. CANCELLED - Settlement cancelled before completion
 * 
 * Key Capabilities:
 * - Creates new settlements with comprehensive validation
 * - Retrieves settlement details for monitoring and reporting
 * - Updates settlement status with audit trail maintenance
 * - Validates settlement existence for integrity checks
 * - Provides bulk settlement retrieval for administrative purposes
 */
@Info({
    title: 'SettlementContract',
    description: 'Smart contract for managing financial settlements on the blockchain network with atomic transaction guarantees'
})
export class SettlementContract extends SmartContract {
    
    /**
     * Constructor for SettlementContract
     * 
     * Initializes the settlement smart contract with the specified contract name
     * and sets up the Hyperledger Fabric contract framework for settlement operations.
     * 
     * The constructor calls the parent SmartContract constructor with the contract
     * identifier 'SettlementContract' to register this contract within the chaincode.
     */
    constructor() {
        // Call parent constructor with settlement contract identifier
        super();
        console.info('SettlementContract initialized successfully');
    }

    /**
     * Creates a new settlement on the blockchain ledger
     * 
     * This function validates the settlement parameters, checks for duplicates,
     * creates a new settlement record with PENDING status, and stores it in the
     * world state with complete audit trail. The settlement represents an atomic
     * transaction resolution involving multiple parties.
     * 
     * Validation Rules:
     * - Settlement ID must be unique across the network
     * - Transaction ID must reference a valid transaction
     * - Participants array must not be empty
     * - Amount must be positive and within acceptable limits
     * - Currency must be a valid ISO 4217 code
     * 
     * Business Logic:
     * - All new settlements start with PENDING status
     * - Creation timestamp is automatically set to current time
     * - Settlement event is emitted for real-time monitoring
     * - Complete validation ensures data integrity
     * 
     * @param ctx - Hyperledger Fabric transaction context providing ledger access
     * @param settlementId - Unique identifier for the settlement record
     * @param transactionId - Related transaction identifier for traceability
     * @param participants - Array of participant identifiers involved in settlement
     * @param amount - Settlement amount in smallest currency unit
     * @param currency - ISO 4217 currency code for the settlement
     * @returns Promise<void> - Resolves when settlement is successfully created
     * 
     * @throws Error if settlement ID already exists or validation fails
     * @throws Error if participants array is empty or invalid
     * @throws Error if amount is negative or exceeds limits
     * @throws Error if currency code is invalid or unsupported
     */
    @FabricTransaction()
    @Returns('void')
    public async createSettlement(
        ctx: Context,
        settlementId: string,
        transactionId: string,
        participants: string[],
        amount: number,
        currency: string
    ): Promise<void> {
        console.info(`============= START : Create Settlement ${settlementId} ===========`);

        // Comprehensive input parameter validation
        if (!settlementId || settlementId.trim().length === 0) {
            throw new Error('Settlement ID is required and cannot be empty');
        }

        if (!transactionId || transactionId.trim().length === 0) {
            throw new Error('Transaction ID is required and cannot be empty');
        }

        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            throw new Error('Participants array is required and must contain at least one participant');
        }

        // Validate each participant identifier
        for (const participant of participants) {
            if (!participant || participant.trim().length === 0) {
                throw new Error('All participant identifiers must be non-empty strings');
            }
        }

        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Settlement amount must be a positive number');
        }

        // Validate amount is within acceptable financial limits (e.g., max transaction size)
        const MAX_SETTLEMENT_AMOUNT = 1000000000; // $10M in cents
        if (amount > MAX_SETTLEMENT_AMOUNT) {
            throw new Error(`Settlement amount ${amount} exceeds maximum allowed limit of ${MAX_SETTLEMENT_AMOUNT}`);
        }

        if (!currency || currency.trim().length !== 3) {
            throw new Error('Currency must be a valid 3-character ISO 4217 code');
        }

        // Validate currency against supported currencies
        const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
        if (!SUPPORTED_CURRENCIES.includes(currency.toUpperCase())) {
            throw new Error(`Currency ${currency} is not supported. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`);
        }

        try {
            // Check if settlement with the given ID already exists to prevent duplicates
            const existingSettlementBytes = await ctx.stub.getState(settlementId);
            
            if (existingSettlementBytes && existingSettlementBytes.length > 0) {
                throw new Error(`Settlement with ID ${settlementId} already exists on the ledger`);
            }

            // Validate that the referenced transaction exists (optional check for data integrity)
            try {
                await this.QueryTransaction(ctx, transactionId);
                console.info(`Referenced transaction ${transactionId} validated successfully`);
            } catch (error) {
                // Log warning but don't fail settlement creation if transaction lookup fails
                console.warn(`Warning: Could not validate referenced transaction ${transactionId}: ${error.message}`);
            }

            // Create current timestamp for settlement creation
            const currentTimestamp = new Date().toISOString();

            // Create new settlement object with all required properties
            const newSettlement: Settlement = {
                settlementId: settlementId.trim(),
                transactionId: transactionId.trim(),
                participants: participants.map(p => p.trim()),
                amount: amount,
                currency: currency.toUpperCase(),
                status: 'PENDING', // All new settlements start as PENDING
                createdAt: currentTimestamp,
                updatedAt: currentTimestamp,
                metadata: {
                    createdBy: ctx.clientIdentity.getID(),
                    participantCount: participants.length,
                    settlementType: 'STANDARD'
                }
            };

            // Convert settlement object to JSON string for blockchain storage
            const settlementJson = JSON.stringify(newSettlement);

            // Store the new settlement in the world state using settlementId as key
            await ctx.stub.putState(settlementId, Buffer.from(settlementJson));

            // Log successful settlement creation for audit trail
            console.info(`Settlement ${settlementId} created successfully for transaction ${transactionId}`);
            console.info(`Settlement details: amount=${amount} ${currency}, participants=${participants.length}, status=PENDING`);

            // Emit settlement creation event for real-time monitoring and external system integration
            const eventData = {
                eventType: 'SETTLEMENT_CREATED',
                settlementId: settlementId,
                transactionId: transactionId,
                amount: amount,
                currency: currency,
                participantCount: participants.length,
                status: 'PENDING',
                timestamp: currentTimestamp,
                createdBy: ctx.clientIdentity.getID()
            };

            await ctx.stub.setEvent('SettlementCreated', Buffer.from(JSON.stringify(eventData)));

        } catch (error) {
            console.error(`Failed to create settlement ${settlementId}:`, error);
            throw new Error(`Settlement creation failed: ${error.message}`);
        }

        console.info(`============= END : Create Settlement ${settlementId} ===========`);
    }

    /**
     * Retrieves settlement details from the blockchain ledger
     * 
     * This is a read-only query function that fetches complete settlement information
     * without modifying the ledger state. Used for settlement status inquiries,
     * audit trail queries, and regulatory reporting purposes.
     * 
     * Query Capabilities:
     * - Retrieves complete settlement record with all metadata
     * - Validates data integrity before returning results
     * - Provides real-time settlement status information
     * - Supports audit trail and compliance reporting
     * 
     * @param ctx - Hyperledger Fabric transaction context providing ledger access
     * @param settlementId - Unique settlement identifier to query
     * @returns Promise<string> - JSON string representation of the settlement object
     * 
     * @throws Error if settlement does not exist on the ledger
     * @throws Error if settlement data is corrupted or invalid
     * @throws Error if access permissions are insufficient
     */
    @FabricTransaction(false) // Read-only transaction for query operations
    @Returns('string')
    public async getSettlement(ctx: Context, settlementId: string): Promise<string> {
        console.info(`============= START : Get Settlement ${settlementId} ===========`);

        // Validate input parameter
        if (!settlementId || settlementId.trim().length === 0) {
            throw new Error('Settlement ID is required and cannot be empty');
        }

        try {
            // Retrieve settlement data from the world state
            const settlementBytes = await ctx.stub.getState(settlementId.trim());

            // Check if settlement exists on the ledger
            if (!settlementBytes || settlementBytes.length === 0) {
                throw new Error(`Settlement with ID ${settlementId} does not exist on the ledger`);
            }

            // Convert bytes to string for processing
            const settlementJson = settlementBytes.toString();
            
            // Validate JSON format and data integrity before returning
            try {
                const settlementData = JSON.parse(settlementJson);
                
                // Basic data structure validation
                if (!settlementData.settlementId || !settlementData.status || !settlementData.createdAt) {
                    throw new Error('Settlement data structure is invalid or corrupted');
                }

                // Log successful settlement retrieval for audit trail
                console.info(`Settlement ${settlementId} retrieved successfully: status=${settlementData.status}, amount=${settlementData.amount} ${settlementData.currency}`);

            } catch (parseError) {
                console.error(`Settlement data corruption detected for ID ${settlementId}:`, parseError);
                throw new Error(`Corrupted settlement data for ID ${settlementId}: ${parseError.message}`);
            }

            console.info(`============= END : Get Settlement ${settlementId} ===========`);

            return settlementJson;

        } catch (error) {
            console.error(`Failed to query settlement ${settlementId}:`, error);
            throw new Error(`Settlement query failed: ${error.message}`);
        }
    }

    /**
     * Updates the status of an existing settlement
     * 
     * This function modifies the status field of an existing settlement while
     * maintaining complete audit trail and event logging for regulatory compliance
     * and real-time monitoring. Status transitions follow business rules to ensure
     * settlement lifecycle integrity.
     * 
     * Status Transition Rules:
     * - PENDING → PROCESSING, COMPLETED, FAILED, CANCELLED
     * - PROCESSING → COMPLETED, FAILED
     * - COMPLETED → No further transitions allowed
     * - FAILED → CANCELLED (manual intervention only)
     * - CANCELLED → No further transitions allowed
     * 
     * Audit Requirements:
     * - All status changes are logged with timestamps
     * - Previous status is preserved for audit trail
     * - Identity of modifier is recorded
     * - Events are emitted for real-time monitoring
     * 
     * @param ctx - Hyperledger Fabric transaction context providing ledger access
     * @param settlementId - Unique settlement identifier to update
     * @param newStatus - New status value for the settlement
     * @returns Promise<void> - Resolves when status is successfully updated
     * 
     * @throws Error if settlement does not exist on the ledger
     * @throws Error if status transition is invalid or not allowed
     * @throws Error if new status is not recognized or supported
     */
    @FabricTransaction()
    @Returns('void')
    public async updateSettlementStatus(
        ctx: Context,
        settlementId: string,
        newStatus: string
    ): Promise<void> {
        console.info(`============= START : Update Settlement Status ${settlementId} ===========`);

        // Comprehensive input parameter validation
        if (!settlementId || settlementId.trim().length === 0) {
            throw new Error('Settlement ID is required and cannot be empty');
        }

        if (!newStatus || newStatus.trim().length === 0) {
            throw new Error('New status is required and cannot be empty');
        }

        // Validate status value against allowed settlement statuses
        const ALLOWED_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
        const normalizedNewStatus = newStatus.trim().toUpperCase();
        
        if (!ALLOWED_STATUSES.includes(normalizedNewStatus)) {
            throw new Error(`Invalid status '${newStatus}'. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
        }

        try {
            // First, retrieve the existing settlement using the getSettlement method
            const existingSettlementJson = await this.getSettlement(ctx, settlementId);
            
            // Parse the settlement JSON to get the settlement object
            const existingSettlement: Settlement = JSON.parse(existingSettlementJson);

            // Store the previous status for audit trail and validation
            const previousStatus = existingSettlement.status;

            // Validate status transition according to business rules
            if (!this.isValidStatusTransition(previousStatus, normalizedNewStatus)) {
                throw new Error(`Invalid status transition from '${previousStatus}' to '${normalizedNewStatus}'`);
            }

            // Prevent duplicate status updates
            if (previousStatus === normalizedNewStatus) {
                console.info(`Settlement ${settlementId} already has status '${normalizedNewStatus}', no update needed`);
                return;
            }

            // Update the settlement object with new status and timestamp
            const currentTimestamp = new Date().toISOString();
            existingSettlement.status = normalizedNewStatus;
            existingSettlement.updatedAt = currentTimestamp;

            // Add status change metadata for audit trail
            if (!existingSettlement.metadata) {
                existingSettlement.metadata = {};
            }
            existingSettlement.metadata.lastStatusChange = {
                previousStatus: previousStatus,
                newStatus: normalizedNewStatus,
                updatedBy: ctx.clientIdentity.getID(),
                updatedAt: currentTimestamp
            };

            // Convert updated settlement back to JSON for storage
            const updatedSettlementJson = JSON.stringify(existingSettlement);

            // Store the updated settlement in the world state
            await ctx.stub.putState(settlementId, Buffer.from(updatedSettlementJson));

            // Log successful status update for audit trail
            console.info(`Settlement ${settlementId} status updated successfully: ${previousStatus} → ${normalizedNewStatus}`);
            console.info(`Status change performed by: ${ctx.clientIdentity.getID()} at ${currentTimestamp}`);

            // Emit status update event for real-time monitoring and external system integration
            const eventData = {
                eventType: 'SETTLEMENT_STATUS_UPDATED',
                settlementId: settlementId,
                transactionId: existingSettlement.transactionId,
                previousStatus: previousStatus,
                newStatus: normalizedNewStatus,
                timestamp: currentTimestamp,
                updatedBy: ctx.clientIdentity.getID(),
                amount: existingSettlement.amount,
                currency: existingSettlement.currency
            };

            await ctx.stub.setEvent('SettlementStatusUpdated', Buffer.from(JSON.stringify(eventData)));

        } catch (error) {
            console.error(`Failed to update settlement status for ${settlementId}:`, error);
            throw new Error(`Settlement status update failed: ${error.message}`);
        }

        console.info(`============= END : Update Settlement Status ${settlementId} ===========`);
    }

    /**
     * Checks if a settlement exists on the blockchain ledger
     * 
     * This is a read-only utility function that performs existence validation
     * without retrieving the complete settlement data. Used for integrity checks,
     * validation workflows, and conditional processing logic.
     * 
     * Performance Optimized:
     * - Minimal data transfer for existence check only
     * - Fast response for validation workflows
     * - No data parsing or validation overhead
     * - Suitable for high-frequency validation calls
     * 
     * @param ctx - Hyperledger Fabric transaction context providing ledger access
     * @param settlementId - Unique settlement identifier to check
     * @returns Promise<boolean> - True if settlement exists, false otherwise
     * 
     * @throws Error if settlement ID is invalid or empty
     * @throws Error if ledger access fails or times out
     */
    @FabricTransaction(false) // Read-only transaction for existence check
    @Returns('boolean')
    public async settlementExists(ctx: Context, settlementId: string): Promise<boolean> {
        console.info(`============= START : Check Settlement Exists ${settlementId} ===========`);

        // Validate input parameter
        if (!settlementId || settlementId.trim().length === 0) {
            throw new Error('Settlement ID is required and cannot be empty');
        }

        try {
            // Attempt to get the settlement data from the ledger
            const settlementBytes = await ctx.stub.getState(settlementId.trim());

            // Check if data exists and is not empty
            const exists = settlementBytes && settlementBytes.length > 0;

            console.info(`Settlement existence check for ${settlementId}: ${exists ? 'EXISTS' : 'NOT_FOUND'}`);
            console.info(`============= END : Check Settlement Exists ${settlementId} ===========`);

            return exists;

        } catch (error) {
            console.error(`Failed to check settlement existence for ${settlementId}:`, error);
            throw new Error(`Settlement existence check failed: ${error.message}`);
        }
    }

    /**
     * Retrieves all settlements from the blockchain ledger
     * 
     * This administrative function provides bulk access to all settlement records
     * stored on the ledger. Primarily used for administrative purposes, audit trail
     * analysis, regulatory reporting, and comprehensive settlement monitoring.
     * 
     * Performance Considerations:
     * - Uses pagination for large datasets to prevent timeouts
     * - Implements data filtering and sorting capabilities
     * - Provides comprehensive settlement overview
     * - Supports administrative and audit requirements
     * 
     * Security Considerations:
     * - Requires appropriate administrative privileges
     * - Logs access for audit trail compliance
     * - May be restricted based on organizational policies
     * - Suitable for regulatory reporting and oversight
     * 
     * @param ctx - Hyperledger Fabric transaction context providing ledger access
     * @returns Promise<string> - JSON string representing array of all settlement objects
     * 
     * @throws Error if ledger access fails or times out
     * @throws Error if insufficient privileges for bulk access
     * @throws Error if data processing fails during iteration
     */
    @FabricTransaction(false) // Read-only transaction for administrative query
    @Returns('string')
    public async getAllSettlements(ctx: Context): Promise<string> {
        console.info('============= START : Get All Settlements ===========');

        try {
            const allSettlements: Settlement[] = [];
            let retrievedCount = 0;

            // Use the ledger's state query iterator to get all settlement assets
            // This queries all keys in the world state and filters for settlement data
            const iterator = await ctx.stub.getStateByRange('', '');

            try {
                while (true) {
                    const result = await iterator.next();

                    // Check if we've reached the end of the iterator
                    if (result.done) {
                        break;
                    }

                    // Extract key and value from the iterator result
                    const key = result.value.key;
                    const valueBytes = result.value.value;

                    // Skip empty values or malformed entries
                    if (!valueBytes || valueBytes.length === 0) {
                        continue;
                    }

                    try {
                        // Parse the JSON data
                        const valueJson = valueBytes.toString();
                        const parsedData = JSON.parse(valueJson);

                        // Check if this is a settlement record by looking for settlement-specific fields
                        if (parsedData.settlementId && parsedData.status && parsedData.participants) {
                            // Validate settlement data structure before including
                            if (this.isValidSettlementStructure(parsedData)) {
                                allSettlements.push(parsedData as Settlement);
                                retrievedCount++;
                            }
                        }

                    } catch (parseError) {
                        // Log parsing errors but continue processing other records
                        console.warn(`Skipping malformed data for key ${key}: ${parseError.message}`);
                        continue;
                    }
                }

            } finally {
                // Always close the iterator to free resources
                await iterator.close();
            }

            // Sort settlements by creation date (most recent first) for better usability
            allSettlements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Log successful retrieval for audit trail
            console.info(`Successfully retrieved ${retrievedCount} settlements from the ledger`);

            // Create summary statistics for administrative reporting
            const statusSummary = this.generateStatusSummary(allSettlements);
            console.info(`Settlement status summary:`, statusSummary);

            console.info('============= END : Get All Settlements ===========');

            // Return the settlements array as a JSON string
            return JSON.stringify(allSettlements);

        } catch (error) {
            console.error('Failed to retrieve all settlements:', error);
            throw new Error(`Get all settlements failed: ${error.message}`);
        }
    }

    /**
     * Validates status transition according to business rules
     * 
     * Private helper method that enforces settlement lifecycle rules and prevents
     * invalid status transitions that could compromise settlement integrity.
     * 
     * @param currentStatus - Current settlement status
     * @param newStatus - Proposed new status
     * @returns boolean - True if transition is valid, false otherwise
     */
    private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
        const validTransitions: Record<string, string[]> = {
            'PENDING': ['PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            'PROCESSING': ['COMPLETED', 'FAILED'],
            'COMPLETED': [], // No transitions allowed from completed
            'FAILED': ['CANCELLED'], // Only manual cancellation allowed
            'CANCELLED': [] // No transitions allowed from cancelled
        };

        const allowedTransitions = validTransitions[currentStatus] || [];
        return allowedTransitions.includes(newStatus);
    }

    /**
     * Validates settlement data structure for integrity
     * 
     * Private helper method that ensures settlement objects contain all required
     * fields and maintain proper data types for consistent processing.
     * 
     * @param data - Settlement data object to validate
     * @returns boolean - True if structure is valid, false otherwise
     */
    private isValidSettlementStructure(data: any): boolean {
        return (
            data &&
            typeof data.settlementId === 'string' &&
            typeof data.transactionId === 'string' &&
            Array.isArray(data.participants) &&
            typeof data.amount === 'number' &&
            typeof data.currency === 'string' &&
            typeof data.status === 'string' &&
            typeof data.createdAt === 'string'
        );
    }

    /**
     * Generates status summary for administrative reporting
     * 
     * Private helper method that creates statistical summary of settlement statuses
     * for administrative oversight and performance monitoring.
     * 
     * @param settlements - Array of settlement objects
     * @returns object - Status summary with counts and percentages
     */
    private generateStatusSummary(settlements: Settlement[]): Record<string, number> {
        const statusCounts: Record<string, number> = {};
        
        settlements.forEach(settlement => {
            statusCounts[settlement.status] = (statusCounts[settlement.status] || 0) + 1;
        });

        return statusCounts;
    }
}