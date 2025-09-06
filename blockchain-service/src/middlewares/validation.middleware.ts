/**
 * Validation Middleware for Blockchain Service
 * 
 * This module provides comprehensive validation middleware for the blockchain-based
 * settlement network within the financial services platform. It implements robust
 * validation rules for transaction creation, settlement processing, and smart contract
 * invocation, ensuring data integrity and compliance with financial services regulations.
 * 
 * Features:
 * - Transaction validation with financial compliance checks
 * - Settlement validation for multi-party processing
 * - Smart contract parameter validation
 * - Comprehensive error handling with structured responses
 * - ISO 4217 currency code validation
 * - UUID validation for transaction identifiers
 * - Array validation for complex data structures
 * 
 * Security Features:
 * - Input sanitization to prevent injection attacks
 * - Type validation to ensure data integrity
 * - Length restrictions to prevent buffer overflow attacks
 * - Format validation for financial data standards compliance
 * 
 * Compliance:
 * - Supports regulatory requirements for transaction validation
 * - Implements audit trail requirements through validation logging
 * - Ensures data quality standards for financial settlement networks
 */

// External dependencies
import { Request, Response, NextFunction } from 'express'; // v4.18.2 - Express framework types for HTTP handling
import { body, validationResult, ValidationChain } from 'express-validator'; // v7.0.1 - Validation library for request validation

// Internal dependencies
import { ApiError } from '../utils/errors';

/**
 * Validation middleware for creating a new blockchain transaction.
 * 
 * This middleware validates all required fields for transaction creation in the
 * blockchain-based settlement network. It ensures compliance with financial
 * services standards and prevents invalid transactions from entering the system.
 * 
 * Validation Rules:
 * - 'from': Must be a non-empty string representing the sender's identifier
 * - 'to': Must be a non-empty string representing the recipient's identifier
 * - 'amount': Must be a positive number with up to 2 decimal places for financial precision
 * - 'currency': Must be a valid ISO 4217 currency code (3-letter format)
 * 
 * Security Considerations:
 * - Input sanitization prevents injection attacks
 * - Length limits prevent buffer overflow
 * - Type validation ensures data integrity
 * - Currency validation prevents invalid currency operations
 * 
 * @returns {ValidationChain[]} Array of express-validator validation chains
 */
export const validateCreateTransaction = (): ValidationChain[] => {
  return [
    // Validate 'from' field - sender identifier
    body('from')
      .notEmpty()
      .withMessage('From field is required and cannot be empty')
      .isString()
      .withMessage('From field must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('From field must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\-_@.]+$/)
      .withMessage('From field contains invalid characters. Only alphanumeric characters, hyphens, underscores, @ symbols, and dots are allowed')
      .escape(), // Sanitize input to prevent XSS attacks

    // Validate 'to' field - recipient identifier
    body('to')
      .notEmpty()
      .withMessage('To field is required and cannot be empty')
      .isString()
      .withMessage('To field must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('To field must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\-_@.]+$/)
      .withMessage('To field contains invalid characters. Only alphanumeric characters, hyphens, underscores, @ symbols, and dots are allowed')
      .escape() // Sanitize input to prevent XSS attacks
      .custom((value, { req }) => {
        // Ensure 'from' and 'to' are different
        if (value === req.body.from) {
          throw new Error('To field cannot be the same as From field');
        }
        return true;
      }),

    // Validate 'amount' field - transaction amount
    body('amount')
      .notEmpty()
      .withMessage('Amount field is required')
      .isNumeric({ no_symbols: false })
      .withMessage('Amount must be a valid number')
      .custom((value) => {
        const numValue = parseFloat(value);
        if (numValue <= 0) {
          throw new Error('Amount must be a positive number greater than 0');
        }
        if (numValue > 999999999.99) {
          throw new Error('Amount exceeds maximum allowed value of 999,999,999.99');
        }
        // Check for valid decimal places (max 2 for financial precision)
        const decimalCheck = /^\d+(\.\d{1,2})?$/.test(value.toString());
        if (!decimalCheck) {
          throw new Error('Amount can have maximum 2 decimal places');
        }
        return true;
      }),

    // Validate 'currency' field - ISO 4217 currency code
    body('currency')
      .notEmpty()
      .withMessage('Currency field is required')
      .isString()
      .withMessage('Currency must be a string')
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be exactly 3 characters long')
      .isAlpha()
      .withMessage('Currency must contain only alphabetic characters')
      .toUpperCase()
      .custom((value) => {
        // Validate against common ISO 4217 currency codes
        const validCurrencies = [
          'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
          'MXN', 'SGD', 'HKD', 'NOK', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'KRW',
          'PLN', 'DKK', 'CZK', 'HUF', 'ILS', 'CLP', 'PHP', 'AED', 'THB', 'MYR'
        ];
        if (!validCurrencies.includes(value)) {
          throw new Error(`Currency ${value} is not supported. Please use a valid ISO 4217 currency code`);
        }
        return true;
      }),

    // Optional: Validate transaction description if provided
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .escape(), // Sanitize input to prevent XSS attacks

    // Optional: Validate transaction reference if provided
    body('reference')
      .optional()
      .isString()
      .withMessage('Reference must be a string')
      .trim()
      .isLength({ max: 50 })
      .withMessage('Reference cannot exceed 50 characters')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Reference can only contain alphanumeric characters, hyphens, and underscores')
      .escape() // Sanitize input to prevent XSS attacks
  ];
};

/**
 * Validation middleware for creating a new blockchain settlement.
 * 
 * This middleware validates all required fields for settlement creation in the
 * blockchain network. Settlements involve multiple parties and require strict
 * validation to ensure all participants are properly identified and the settlement
 * references a valid transaction.
 * 
 * Validation Rules:
 * - 'transactionId': Must be a valid UUID format string
 * - 'parties': Must be an array with at least two party objects
 * - Each party must have 'id', 'role', and 'status' fields
 * 
 * Security Considerations:
 * - UUID validation prevents invalid transaction references
 * - Party validation ensures proper settlement participant identification
 * - Role validation ensures only valid settlement roles are used
 * 
 * @returns {ValidationChain[]} Array of express-validator validation chains
 */
export const validateCreateSettlement = (): ValidationChain[] => {
  return [
    // Validate 'transactionId' field - must be a valid UUID
    body('transactionId')
      .notEmpty()
      .withMessage('Transaction ID is required')
      .isString()
      .withMessage('Transaction ID must be a string')
      .trim()
      .isUUID()
      .withMessage('Transaction ID must be a valid UUID format')
      .isLength({ min: 36, max: 36 })
      .withMessage('Transaction ID must be exactly 36 characters long'),

    // Validate 'parties' field - array of settlement participants
    body('parties')
      .notEmpty()
      .withMessage('Parties field is required')
      .isArray({ min: 2 })
      .withMessage('Parties must be an array with at least 2 parties')
      .custom((parties) => {
        if (parties.length > 10) {
          throw new Error('Maximum 10 parties allowed per settlement');
        }
        return true;
      }),

    // Validate each party in the parties array
    body('parties.*.id')
      .notEmpty()
      .withMessage('Each party must have an ID')
      .isString()
      .withMessage('Party ID must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Party ID must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\-_@.]+$/)
      .withMessage('Party ID contains invalid characters')
      .escape(),

    // Validate party role
    body('parties.*.role')
      .notEmpty()
      .withMessage('Each party must have a role')
      .isString()
      .withMessage('Party role must be a string')
      .trim()
      .isIn(['payer', 'payee', 'intermediary', 'correspondent', 'beneficiary'])
      .withMessage('Party role must be one of: payer, payee, intermediary, correspondent, beneficiary'),

    // Validate party status
    body('parties.*.status')
      .notEmpty()
      .withMessage('Each party must have a status')
      .isString()
      .withMessage('Party status must be a string')
      .trim()
      .isIn(['pending', 'confirmed', 'rejected', 'processing'])
      .withMessage('Party status must be one of: pending, confirmed, rejected, processing'),

    // Optional: Validate party name if provided
    body('parties.*.name')
      .optional()
      .isString()
      .withMessage('Party name must be a string')
      .trim()
      .isLength({ max: 200 })
      .withMessage('Party name cannot exceed 200 characters')
      .escape(),

    // Validate settlement type
    body('settlementType')
      .notEmpty()
      .withMessage('Settlement type is required')
      .isString()
      .withMessage('Settlement type must be a string')
      .trim()
      .isIn(['immediate', 'deferred', 'batch', 'realtime'])
      .withMessage('Settlement type must be one of: immediate, deferred, batch, realtime'),

    // Optional: Validate settlement deadline if provided
    body('deadline')
      .optional()
      .isISO8601({ strict: true })
      .withMessage('Deadline must be a valid ISO 8601 datetime')
      .custom((value) => {
        const deadlineDate = new Date(value);
        const now = new Date();
        if (deadlineDate <= now) {
          throw new Error('Deadline must be in the future');
        }
        // Maximum deadline of 30 days
        const maxDeadline = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        if (deadlineDate > maxDeadline) {
          throw new Error('Deadline cannot be more than 30 days in the future');
        }
        return true;
      }),

    // Custom validation to ensure unique party IDs
    body('parties').custom((parties) => {
      const partyIds = parties.map((party: any) => party.id);
      const uniqueIds = new Set(partyIds);
      if (partyIds.length !== uniqueIds.size) {
        throw new Error('All party IDs must be unique within the settlement');
      }
      return true;
    }),

    // Custom validation to ensure proper party roles distribution
    body('parties').custom((parties) => {
      const roles = parties.map((party: any) => party.role);
      const hasPayer = roles.includes('payer');
      const hasPayee = roles.includes('payee') || roles.includes('beneficiary');
      
      if (!hasPayer) {
        throw new Error('At least one party must have the role of payer');
      }
      if (!hasPayee) {
        throw new Error('At least one party must have the role of payee or beneficiary');
      }
      return true;
    })
  ];
};

/**
 * Validation middleware for invoking a smart contract on the blockchain.
 * 
 * This middleware validates all parameters required for smart contract invocation
 * in the Hyperledger Fabric network. It ensures that contract names, function names,
 * and arguments are properly formatted and secure.
 * 
 * Validation Rules:
 * - 'contractName': Must be a non-empty string with valid naming conventions
 * - 'functionName': Must be a non-empty string with valid function naming
 * - 'args': Must be an array of string arguments for the contract function
 * 
 * Security Considerations:
 * - Contract name validation prevents unauthorized contract access
 * - Function name validation ensures only valid functions are called
 * - Argument validation prevents injection attacks through contract parameters
 * 
 * @returns {ValidationChain[]} Array of express-validator validation chains
 */
export const validateInvokeSmartContract = (): ValidationChain[] => {
  return [
    // Validate 'contractName' field - smart contract identifier
    body('contractName')
      .notEmpty()
      .withMessage('Contract name is required')
      .isString()
      .withMessage('Contract name must be a string')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Contract name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z][a-zA-Z0-9\-_]*$/)
      .withMessage('Contract name must start with a letter and contain only alphanumeric characters, hyphens, and underscores')
      .custom((value) => {
        // Validate against allowed contract names for security
        const allowedContracts = [
          'payment-processor',
          'identity-manager', 
          'compliance-automation',
          'asset-tokenization',
          'settlement-engine',
          'kyc-verification',
          'audit-logger',
          'risk-assessment'
        ];
        if (!allowedContracts.includes(value)) {
          throw new Error(`Contract '${value}' is not authorized for invocation`);
        }
        return true;
      }),

    // Validate 'functionName' field - contract function to invoke
    body('functionName')
      .notEmpty()
      .withMessage('Function name is required')
      .isString()
      .withMessage('Function name must be a string')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Function name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
      .withMessage('Function name must start with a letter and contain only alphanumeric characters and underscores')
      .custom((value) => {
        // Prevent dangerous function names
        const forbiddenFunctions = [
          'delete', 'destroy', 'remove', 'drop', 'truncate', 'clear',
          'admin', 'root', 'sudo', 'exec', 'eval', 'system'
        ];
        const lowerValue = value.toLowerCase();
        if (forbiddenFunctions.some(forbidden => lowerValue.includes(forbidden))) {
          throw new Error(`Function name '${value}' contains forbidden keywords`);
        }
        return true;
      }),

    // Validate 'args' field - array of function arguments
    body('args')
      .isArray()
      .withMessage('Arguments must be an array')
      .custom((args) => {
        if (args.length > 20) {
          throw new Error('Maximum 20 arguments allowed per function call');
        }
        return true;
      }),

    // Validate each argument in the args array
    body('args.*')
      .isString()
      .withMessage('All arguments must be strings')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Each argument cannot exceed 1000 characters')
      .custom((value) => {
        // Prevent potentially dangerous content in arguments
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /expression\s*\(/i
        ];
        
        if (dangerousPatterns.some(pattern => pattern.test(value))) {
          throw new Error('Arguments contain potentially dangerous content');
        }
        return true;
      })
      .escape(), // Sanitize each argument

    // Optional: Validate contract version if provided
    body('version')
      .optional()
      .isString()
      .withMessage('Version must be a string')
      .trim()
      .matches(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      .withMessage('Version must follow semantic versioning format (e.g., 1.0.0)'),

    // Optional: Validate channel name if provided
    body('channelName')
      .optional()
      .isString()
      .withMessage('Channel name must be a string')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Channel name must be between 1 and 50 characters')
      .matches(/^[a-z][a-z0-9\-]*$/)
      .withMessage('Channel name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens')
      .custom((value) => {
        // Validate against allowed channels
        const allowedChannels = [
          'financial-services',
          'payments-channel',
          'compliance-channel',
          'settlement-channel',
          'audit-channel'
        ];
        if (!allowedChannels.includes(value)) {
          throw new Error(`Channel '${value}' is not authorized`);
        }
        return true;
      }),

    // Optional: Validate transient data if provided
    body('transientData')
      .optional()
      .isObject()
      .withMessage('Transient data must be an object')
      .custom((transientData) => {
        const keys = Object.keys(transientData);
        if (keys.length > 10) {
          throw new Error('Maximum 10 transient data keys allowed');
        }
        
        // Validate each key and value
        for (const key of keys) {
          if (typeof key !== 'string' || key.length > 50) {
            throw new Error('Transient data keys must be strings with maximum 50 characters');
          }
          
          const value = transientData[key];
          if (typeof value !== 'string' || value.length > 1000) {
            throw new Error('Transient data values must be strings with maximum 1000 characters');
          }
        }
        return true;
      })
  ];
};

/**
 * Middleware function to handle validation errors from express-validator.
 * 
 * This function processes validation results from the express-validator library
 * and converts them into standardized API error responses. If validation errors
 * are present, it creates a structured error response with detailed information
 * about each validation failure.
 * 
 * Error Response Structure:
 * - Uses ApiError class for consistent error formatting
 * - Provides detailed validation error messages
 * - Includes field-specific error information
 * - Maintains audit trail for compliance requirements
 * 
 * Flow Control:
 * - If validation errors exist: Creates ApiError and passes to error handler
 * - If no validation errors: Calls next() to continue request processing
 * 
 * Security Features:
 * - Prevents sensitive information leakage in error messages
 * - Logs validation failures for security monitoring
 * - Sanitizes error output to prevent XSS attacks
 * 
 * @param {Request} req - Express request object containing validation results
 * @param {Response} res - Express response object for sending error responses
 * @param {NextFunction} next - Express next function to continue middleware chain
 * @returns {void} This function does not return a value but calls next() or sends response
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract validation errors from the request using validationResult
    const errors = validationResult(req);

    // Check if there are any validation errors
    if (!errors.isEmpty()) {
      // Format validation errors for structured response
      const formattedErrors = errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? (error as any).value : undefined,
        location: error.type === 'field' ? (error as any).location : 'body'
      }));

      // Create comprehensive error message
      const errorMessage = `Validation failed: ${formattedErrors.length} error(s) found`;
      
      // Log validation failure for audit purposes (without sensitive data)
      console.error('Validation Error:', {
        timestamp: new Date().toISOString(),
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        errorCount: formattedErrors.length,
        fields: formattedErrors.map(e => e.field)
      });

      // Create ApiError with validation details
      const validationError = new ApiError(
        400,
        errorMessage,
        true // Mark as operational error
      );

      // Add validation details to the error object for client consumption
      (validationError as any).validationErrors = formattedErrors;
      (validationError as any).errorType = 'VALIDATION_ERROR';
      (validationError as any).timestamp = new Date().toISOString();

      // Pass the error to the next middleware (global error handler)
      return next(validationError);
    }

    // If there are no validation errors, proceed to the next middleware
    next();
  } catch (error) {
    // Handle unexpected errors in validation processing
    console.error('Unexpected error in validation middleware:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: req.path,
      method: req.method
    });

    // Create internal server error for unexpected validation processing failures
    const internalError = new ApiError(
      500,
      'Internal error occurred during request validation',
      false // Mark as non-operational error
    );

    next(internalError);
  }
};