import fs from 'fs'; // v20.LTS - Node.js built-in filesystem module
import path from 'path'; // v20.LTS - Node.js built-in path manipulation module
import { Wallets, Wallet } from 'fabric-network'; // v2.5+ - Hyperledger Fabric SDK for wallet management

/**
 * Enterprise-grade helper utilities for Hyperledger Fabric blockchain service
 * Supporting blockchain-based settlement network (F-009) requirements
 * 
 * This module provides core functionality for:
 * - Building Common Connection Profiles (CCP) for Fabric network connectivity
 * - Managing cryptographic wallets for identity and transaction signing
 * - Formatting JSON data for logging and debugging purposes
 */

/**
 * Builds a Common Connection Profile (CCP) for Hyperledger Fabric from a JSON file.
 * The CCP defines the network topology, peer endpoints, certificate authorities, and
 * organizational configurations required for blockchain network connectivity.
 * 
 * @param orgMsp - The organization's Membership Service Provider (MSP) identifier
 * @returns The constructed CCP object containing network configuration details
 * @throws Error if the CCP file cannot be read or parsed
 */
export function buildCCP(orgMsp: string): object {
    try {
        // Validate input parameter
        if (!orgMsp || typeof orgMsp !== 'string' || orgMsp.trim().length === 0) {
            throw new Error('Organization MSP ID must be a non-empty string');
        }

        // Sanitize the MSP ID for safe file path construction (remove potentially dangerous characters)
        const sanitizedMsp = orgMsp.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        if (sanitizedMsp !== orgMsp.trim()) {
            throw new Error('Organization MSP ID contains invalid characters. Only alphanumeric, underscore, and hyphen are allowed.');
        }

        // Construct the path to the CCP JSON file based on the organization's MSP ID
        // Following Hyperledger Fabric convention: connection-<org>.json
        const ccpFileName = `connection-${sanitizedMsp.toLowerCase()}.json`;
        const ccpPath = path.resolve(__dirname, '..', '..', 'config', 'connection-profiles', ccpFileName);

        // Verify the file exists before attempting to read
        if (!fs.existsSync(ccpPath)) {
            throw new Error(`Connection profile not found: ${ccpPath}. Ensure the file exists for organization ${orgMsp}`);
        }

        // Read the content of the JSON file with explicit UTF-8 encoding
        const ccpContent = fs.readFileSync(ccpPath, 'utf8');

        // Validate that the file content is not empty
        if (!ccpContent || ccpContent.trim().length === 0) {
            throw new Error(`Connection profile file is empty: ${ccpPath}`);
        }

        // Parse the JSON content into a JavaScript object with error handling
        let ccpObject: object;
        try {
            ccpObject = JSON.parse(ccpContent);
        } catch (parseError) {
            throw new Error(`Invalid JSON in connection profile ${ccpPath}: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }

        // Validate that the parsed object is not null and contains expected structure
        if (!ccpObject || typeof ccpObject !== 'object') {
            throw new Error(`Invalid connection profile structure in ${ccpPath}`);
        }

        // Verify essential CCP properties for Hyperledger Fabric compliance
        const requiredProperties = ['name', 'version', 'client', 'organizations', 'peers'];
        const ccpTyped = ccpObject as Record<string, unknown>;
        
        for (const prop of requiredProperties) {
            if (!(prop in ccpTyped)) {
                throw new Error(`Missing required property '${prop}' in connection profile for ${orgMsp}`);
            }
        }

        // Return the CCP object for use in Fabric network connection
        return ccpObject;

    } catch (error) {
        // Re-throw with enhanced error context for debugging and monitoring
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to build CCP for organization ${orgMsp}: ${errorMessage}`);
    }
}

/**
 * Builds a wallet instance for managing identities in Hyperledger Fabric.
 * Wallets store cryptographic materials (certificates and private keys) required
 * for transaction signing and identity verification within the blockchain network.
 * 
 * @param Wallets - The Wallets class from fabric-network SDK for wallet creation
 * @param walletPath - Filesystem path where wallet data will be stored
 * @returns A promise that resolves to a Wallet instance for identity management
 * @throws Error if wallet creation fails or path is invalid
 */
export async function buildWallet(Wallets: typeof import('fabric-network').Wallets, walletPath: string): Promise<Wallet> {
    try {
        // Validate input parameters
        if (!Wallets) {
            throw new Error('Wallets class is required for wallet creation');
        }

        if (!walletPath || typeof walletPath !== 'string' || walletPath.trim().length === 0) {
            throw new Error('Wallet path must be a non-empty string');
        }

        // Normalize and resolve the wallet path to prevent directory traversal attacks
        const normalizedPath = path.resolve(walletPath.trim());
        
        // Ensure the wallet directory exists, create if necessary
        const walletDir = path.dirname(normalizedPath);
        try {
            if (!fs.existsSync(walletDir)) {
                fs.mkdirSync(walletDir, { recursive: true, mode: 0o700 }); // Restricted permissions for security
            }
        } catch (dirError) {
            throw new Error(`Failed to create wallet directory ${walletDir}: ${dirError instanceof Error ? dirError.message : 'Unknown directory error'}`);
        }

        // Create a new wallet instance using the provided path
        // This supports file system-based wallet storage for development and production
        const wallet = await Wallets.newFileSystemWallet(normalizedPath);

        // Validate wallet creation success
        if (!wallet) {
            throw new Error('Failed to create wallet instance - null returned from Wallets.newFileSystemWallet');
        }

        // Return the wallet instance for identity management operations
        return wallet;

    } catch (error) {
        // Enhance error context for operational monitoring and debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to build wallet at path ${walletPath}: ${errorMessage}`);
    }
}

/**
 * Converts a JSON string to a pretty-printed string with consistent formatting.
 * Essential for logging, debugging, and human-readable output of blockchain
 * transaction data, connection profiles, and system configurations.
 * 
 * @param input - JSON string to be formatted
 * @returns A formatted JSON string with 2-space indentation
 * @throws Error if input is not valid JSON or formatting fails
 */
export function prettyJSONString(input: string): string {
    try {
        // Validate input parameter
        if (typeof input !== 'string') {
            throw new Error('Input must be a string type');
        }

        if (input.trim().length === 0) {
            throw new Error('Input string cannot be empty');
        }

        // Parse the input string to a JSON object with comprehensive error handling
        let jsonObject: unknown;
        try {
            jsonObject = JSON.parse(input);
        } catch (parseError) {
            // Provide detailed parsing error information
            const errorDetail = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
            throw new Error(`Invalid JSON input: ${errorDetail}`);
        }

        // Stringify the JSON object with an indentation of 2 spaces for readability
        // This follows industry standards for JSON formatting and logging
        const formattedString = JSON.stringify(jsonObject, null, 2);

        // Validate formatting success
        if (!formattedString) {
            throw new Error('JSON formatting resulted in empty string');
        }

        // Return the formatted string for logging, debugging, or display
        return formattedString;

    } catch (error) {
        // Provide enhanced error context for troubleshooting
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to format JSON string: ${errorMessage}`);
    }
}

/**
 * Additional utility types for enhanced type safety in blockchain operations
 */
export interface CCPValidationResult {
    isValid: boolean;
    missingProperties: string[];
    organizationMsp: string;
}

/**
 * Validates the structure of a Common Connection Profile
 * @param ccp - The connection profile object to validate
 * @param expectedMsp - Expected MSP identifier
 * @returns Validation result with details about missing properties
 */
export function validateCCP(ccp: unknown, expectedMsp: string): CCPValidationResult {
    const result: CCPValidationResult = {
        isValid: true,
        missingProperties: [],
        organizationMsp: expectedMsp
    };

    if (!ccp || typeof ccp !== 'object') {
        result.isValid = false;
        result.missingProperties.push('Invalid object structure');
        return result;
    }

    const ccpTyped = ccp as Record<string, unknown>;
    const requiredProperties = ['name', 'version', 'client', 'organizations', 'peers', 'certificateAuthorities'];

    for (const prop of requiredProperties) {
        if (!(prop in ccpTyped)) {
            result.isValid = false;
            result.missingProperties.push(prop);
        }
    }

    return result;
}

/**
 * Constants for blockchain service configuration
 */
export const BLOCKCHAIN_CONSTANTS = {
    DEFAULT_WALLET_PATH: path.resolve(__dirname, '..', '..', 'wallets'),
    CONNECTION_PROFILE_DIR: path.resolve(__dirname, '..', '..', 'config', 'connection-profiles'),
    SUPPORTED_CCP_VERSION: '2.0.0',
    MAX_WALLET_SIZE_MB: 100,
    DEFAULT_TIMEOUT_MS: 30000
} as const;

/**
 * Error types for enhanced error handling in blockchain operations
 */
export class BlockchainConfigError extends Error {
    constructor(message: string, public readonly organizationMsp?: string) {
        super(message);
        this.name = 'BlockchainConfigError';
    }
}

export class WalletManagementError extends Error {
    constructor(message: string, public readonly walletPath?: string) {
        super(message);
        this.name = 'WalletManagementError';
    }
}

export class JSONFormattingError extends Error {
    constructor(message: string, public readonly inputLength?: number) {
        super(message);
        this.name = 'JSONFormattingError';
    }
}