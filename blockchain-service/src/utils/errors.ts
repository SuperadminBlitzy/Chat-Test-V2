/**
 * Custom Error Classes for Blockchain Service
 * 
 * This module provides a comprehensive set of error classes designed for the
 * blockchain-based settlement network within the financial services platform.
 * These classes implement the structured error handling patterns required for
 * financial services reliability and compliance.
 * 
 * Features:
 * - Base ApiError class with operational error classification
 * - Standard HTTP error classes for REST API operations
 * - Blockchain-specific errors for Hyperledger Fabric operations
 * - Settlement-specific errors for transaction processing
 * - Proper error categorization for monitoring and alerting
 */

/**
 * Base class for custom application errors extending the built-in Error class.
 * 
 * This class provides a foundation for all application-specific errors with
 * HTTP status codes and operational error classification. Operational errors
 * are expected errors that are part of normal application flow (e.g., user
 * validation failures), while non-operational errors indicate system issues.
 * 
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * HTTP status code associated with this error
   */
  public readonly statusCode: number;

  /**
   * Flag indicating if this is an operational error (expected/handled)
   * vs a system error (unexpected/critical)
   */
  public readonly isOperational: boolean;

  /**
   * Creates an instance of ApiError
   * 
   * @param statusCode - HTTP status code for the error
   * @param message - Error message describing the issue
   * @param isOperational - Whether this is an operational error (default: true)
   * @param stack - Optional stack trace (will be captured if not provided)
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack?: string
  ) {
    // Call the parent Error constructor with the message
    super(message);

    // Set the statusCode property
    this.statusCode = statusCode;

    // Set the isOperational property
    this.isOperational = isOperational;

    // Capture the stack trace if not provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Ensure the class name is correctly set for debugging
    this.name = this.constructor.name;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents a 400 Bad Request error for invalid client requests.
 * 
 * This error is used when the server cannot process the request due to
 * client-side input errors such as malformed request syntax, invalid
 * request parameters, or failed validation rules.
 * 
 * @class BadRequestError
 * @extends ApiError
 */
export class BadRequestError extends ApiError {
  /**
   * Creates an instance of BadRequestError
   * 
   * @param message - Error message describing the bad request issue
   */
  constructor(message: string = 'Bad Request') {
    // Call the parent ApiError constructor with a 400 status code
    super(400, message, true);
  }
}

/**
 * Represents a 404 Not Found error for missing resources.
 * 
 * This error is used when the requested resource cannot be found on the server.
 * Common scenarios include non-existent transactions, missing user accounts,
 * or unavailable blockchain assets.
 * 
 * @class NotFoundError
 * @extends ApiError
 */
export class NotFoundError extends ApiError {
  /**
   * Creates an instance of NotFoundError
   * 
   * @param message - Error message describing the missing resource
   */
  constructor(message: string = 'Resource Not Found') {
    // Call the parent ApiError constructor with a 404 status code
    super(404, message, true);
  }
}

/**
 * Represents a 401 Unauthorized error for authentication failures.
 * 
 * This error is used when the request lacks valid authentication credentials
 * or when the provided credentials are invalid. This includes scenarios like
 * missing JWT tokens, expired tokens, or invalid API keys.
 * 
 * @class UnauthorizedError
 * @extends ApiError
 */
export class UnauthorizedError extends ApiError {
  /**
   * Creates an instance of UnauthorizedError
   * 
   * @param message - Error message describing the authentication failure
   */
  constructor(message: string = 'Unauthorized Access') {
    // Call the parent ApiError constructor with a 401 status code
    super(401, message, true);
  }
}

/**
 * Represents a 403 Forbidden error for authorization failures.
 * 
 * This error is used when the server understands the request but refuses
 * to authorize it. The client is authenticated but lacks permission to
 * access the requested resource or perform the requested action.
 * 
 * @class ForbiddenError
 * @extends ApiError
 */
export class ForbiddenError extends ApiError {
  /**
   * Creates an instance of ForbiddenError
   * 
   * @param message - Error message describing the authorization failure
   */
  constructor(message: string = 'Forbidden Access') {
    // Call the parent ApiError constructor with a 403 status code
    super(403, message, true);
  }
}

/**
 * Represents a 500 Internal Server Error for system failures.
 * 
 * This error is used when the server encounters an unexpected condition
 * that prevents it from fulfilling the request. These are typically
 * non-operational errors indicating system issues that require investigation.
 * 
 * @class InternalServerError
 * @extends ApiError
 */
export class InternalServerError extends ApiError {
  /**
   * Creates an instance of InternalServerError
   * 
   * @param message - Error message describing the internal server error
   */
  constructor(message: string = 'Internal Server Error') {
    // Call the parent ApiError constructor with a 500 status code and mark as non-operational
    super(500, message, false);
  }
}

/**
 * Custom error for issues related to Hyperledger Fabric network interactions.
 * 
 * This error is used for failures in blockchain network operations such as
 * peer connectivity issues, channel access problems, certificate validation
 * failures, or general Fabric network infrastructure problems.
 * 
 * @class FabricError
 * @extends ApiError
 */
export class FabricError extends ApiError {
  /**
   * Creates an instance of FabricError
   * 
   * @param message - Error message describing the Fabric network issue
   */
  constructor(message: string = 'Fabric network error') {
    // Call the parent ApiError constructor with a 500 status code and default/provided message
    super(500, message, false);
  }
}

/**
 * Custom error for issues related to user wallet operations.
 * 
 * This error is used for wallet-related failures such as identity not found,
 * certificate issues, private key problems, wallet initialization failures,
 * or user credential management issues within the Hyperledger Fabric network.
 * 
 * @class WalletError
 * @extends ApiError
 */
export class WalletError extends ApiError {
  /**
   * Creates an instance of WalletError
   * 
   * @param message - Error message describing the wallet operation failure
   */
  constructor(message: string = 'Wallet operation failed') {
    // Call the parent ApiError constructor with a 400 status code and default/provided message
    super(400, message, true);
  }
}

/**
 * Custom error for issues related to chaincode (smart contract) execution.
 * 
 * This error is used for smart contract execution failures such as chaincode
 * invocation errors, transaction proposal failures, endorsement policy violations,
 * or business logic errors within the deployed chaincode.
 * 
 * @class ChaincodeError
 * @extends ApiError
 */
export class ChaincodeError extends ApiError {
  /**
   * Creates an instance of ChaincodeError
   * 
   * @param message - Error message describing the chaincode execution failure
   */
  constructor(message: string = 'Chaincode execution error') {
    // Call the parent ApiError constructor with a 500 status code and default/provided message
    super(500, message, false);
  }
}

/**
 * Custom error for issues occurring during the blockchain settlement process.
 * 
 * This error is used for settlement-specific failures such as insufficient funds,
 * settlement validation errors, cross-border payment processing issues, settlement
 * reconciliation failures, or regulatory compliance violations during settlement.
 * 
 * @class SettlementError
 * @extends ApiError
 */
export class SettlementError extends ApiError {
  /**
   * Creates an instance of SettlementError
   * 
   * @param message - Error message describing the settlement process failure
   */
  constructor(message: string = 'Settlement failed') {
    // Call the parent ApiError constructor with a 400 status code and default/provided message
    super(400, message, true);
  }
}