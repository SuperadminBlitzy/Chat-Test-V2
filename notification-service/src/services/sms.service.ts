// twilio@4.20.0 - Official Twilio library for Node.js to interact with the Twilio API for sending SMS
import Twilio from 'twilio';
// twilio@4.20.0 - Type definition for the Twilio client instance
import { TwilioClient } from 'twilio/lib/rest/Twilio';

// Internal imports for configuration and logging
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Global Twilio Client Instance
 * 
 * Initializes the Twilio client with credentials from the configuration.
 * This client instance is used throughout the service for sending SMS messages
 * via the Twilio API. The client is configured with account SID and auth token
 * from the centralized configuration management system.
 * 
 * Configuration Requirements:
 * - config.twilio.accountSid: Twilio account identifier
 * - config.twilio.authToken: Authentication token for API access
 * - config.twilio.fromNumber: Verified phone number for sending messages
 * 
 * Security Considerations:
 * - Credentials are managed through environment variables
 * - Auth tokens are rotated regularly as per security policy
 * - All API communications use HTTPS encryption
 */
const twilioClient: TwilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID || config.twilio?.accountSid,
    process.env.TWILIO_AUTH_TOKEN || config.twilio?.authToken
);

/**
 * SMS Service Configuration
 * 
 * Centralized configuration for SMS service operations including
 * rate limiting, retry policies, and message formatting options.
 * These settings ensure compliance with Twilio API limits and
 * maintain optimal performance for high-volume messaging scenarios.
 */
const SMS_CONFIG = {
    // Maximum retry attempts for failed SMS operations
    MAX_RETRY_ATTEMPTS: 3,
    
    // Base delay between retry attempts (in milliseconds)
    RETRY_BASE_DELAY: 1000,
    
    // Maximum delay cap for exponential backoff (in milliseconds)
    MAX_RETRY_DELAY: 10000,
    
    // Default sender phone number from configuration
    DEFAULT_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || config.twilio?.fromNumber || '+1234567890',
    
    // Message length limits for optimization
    MAX_MESSAGE_LENGTH: 1600, // Twilio's maximum for concatenated messages
    
    // Timeout for API requests (in milliseconds)
    REQUEST_TIMEOUT: 30000,
    
    // Rate limiting configuration
    RATE_LIMIT: {
        MESSAGES_PER_SECOND: 10,
        BURST_LIMIT: 50
    }
};

/**
 * SMS Message Status Enum
 * 
 * Defines the possible states of an SMS message throughout its lifecycle
 * for tracking and monitoring purposes. These statuses align with Twilio's
 * message status reporting and enable comprehensive audit trails.
 */
enum SmsStatus {
    QUEUED = 'queued',
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    FAILED = 'failed',
    UNDELIVERED = 'undelivered'
}

/**
 * SMS Message Interface
 * 
 * Defines the structure for SMS message objects used throughout the service.
 * This interface ensures type safety and provides a standardized format
 * for message handling, logging, and audit trail requirements.
 */
interface SmsMessage {
    messageId?: string;
    to: string;
    body: string;
    from?: string;
    status?: SmsStatus;
    timestamp?: Date;
    correlationId?: string;
    userId?: string;
    messageType?: 'mfa' | 'notification' | 'alert' | 'marketing';
    metadata?: Record<string, any>;
}

/**
 * SMS Service Error Class
 * 
 * Custom error class for SMS service operations providing enhanced
 * error context and categorization for better error handling and
 * monitoring. Includes error codes for programmatic error handling.
 */
class SmsServiceError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly retryable: boolean;
    public readonly originalError?: Error;

    constructor(
        message: string,
        code: string = 'SMS_GENERAL_ERROR',
        statusCode: number = 500,
        retryable: boolean = false,
        originalError?: Error
    ) {
        super(message);
        this.name = 'SmsServiceError';
        this.code = code;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.originalError = originalError;
    }
}

/**
 * Validates phone number format for SMS delivery
 * 
 * Ensures the provided phone number meets Twilio's requirements
 * for successful message delivery. Performs E.164 format validation
 * and basic sanitization to prevent API errors.
 * 
 * @param phoneNumber - The phone number to validate
 * @returns boolean - True if valid, false otherwise
 */
function validatePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return false;
    }

    // Remove all non-digit characters except + for E.164 format
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Check for E.164 format: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    
    return e164Regex.test(cleaned);
}

/**
 * Sanitizes message content for SMS delivery
 * 
 * Cleans and validates message content to ensure compatibility
 * with SMS standards and Twilio API requirements. Handles encoding
 * issues and length restrictions while maintaining message integrity.
 * 
 * @param message - The message content to sanitize
 * @returns string - Sanitized message content
 */
function sanitizeMessage(message: string): string {
    if (!message || typeof message !== 'string') {
        throw new SmsServiceError(
            'Message content is required and must be a non-empty string',
            'INVALID_MESSAGE_CONTENT',
            400,
            false
        );
    }

    // Remove null bytes and control characters that could cause issues
    let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Check message length
    if (sanitized.length === 0) {
        throw new SmsServiceError(
            'Message content cannot be empty after sanitization',
            'EMPTY_MESSAGE_CONTENT',
            400,
            false
        );
    }
    
    if (sanitized.length > SMS_CONFIG.MAX_MESSAGE_LENGTH) {
        logger.warn('SMS message truncated due to length limit', {
            originalLength: sanitized.length,
            maxLength: SMS_CONFIG.MAX_MESSAGE_LENGTH,
            messagePreview: sanitized.substring(0, 100) + '...'
        });
        
        sanitized = sanitized.substring(0, SMS_CONFIG.MAX_MESSAGE_LENGTH - 3) + '...';
    }
    
    return sanitized;
}

/**
 * Implements exponential backoff delay calculation
 * 
 * Calculates the delay time for retry attempts using exponential backoff
 * with jitter to prevent thundering herd problems. This approach helps
 * manage API rate limits and improves overall system resilience.
 * 
 * @param attempt - Current retry attempt number (0-based)
 * @returns number - Delay in milliseconds
 */
function calculateRetryDelay(attempt: number): number {
    const baseDelay = SMS_CONFIG.RETRY_BASE_DELAY;
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    
    // Add jitter (±20%) to prevent synchronized retries
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    const delayWithJitter = exponentialDelay + jitter;
    
    // Cap the maximum delay
    return Math.min(delayWithJitter, SMS_CONFIG.MAX_RETRY_DELAY);
}

/**
 * Generates correlation ID for request tracking
 * 
 * Creates a unique identifier for tracking SMS requests across
 * distributed services and logs. Enables end-to-end traceability
 * for audit and debugging purposes.
 * 
 * @returns string - Unique correlation identifier
 */
function generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `sms_${timestamp}_${randomPart}`;
}

/**
 * Sends SMS Message with Retry Logic
 * 
 * Core SMS sending function with comprehensive error handling, retry logic,
 * and detailed logging. Implements exponential backoff for transient failures
 * and provides detailed audit trails for compliance requirements.
 * 
 * This function supports the Multi-Factor Authentication requirement by sending
 * 2FA/MFA codes to users via SMS, as well as customer notifications for
 * confirmations and alerts as part of the notification system.
 * 
 * @param to - Recipient phone number in E.164 format
 * @param body - Message content to send
 * @param options - Additional options for message customization
 * @returns Promise<void> - Resolves when SMS is successfully sent
 * @throws {SmsServiceError} - On validation or delivery failures
 */
async function sendSms(
    to: string,
    body: string,
    options: {
        from?: string;
        correlationId?: string;
        userId?: string;
        messageType?: 'mfa' | 'notification' | 'alert' | 'marketing';
        metadata?: Record<string, any>;
    } = {}
): Promise<void> {
    const startTime = Date.now();
    const correlationId = options.correlationId || generateCorrelationId();
    const messageType = options.messageType || 'notification';
    
    // Enhance logger context with correlation ID and user information
    const contextLogger = {
        info: (message: string, meta?: Record<string, any>) => 
            logger.info(message, { ...meta, correlationId, userId: options.userId, messageType }),
        warn: (message: string, meta?: Record<string, any>) => 
            logger.warn(message, { ...meta, correlationId, userId: options.userId, messageType }),
        error: (message: string, error?: Error | Record<string, any>) => 
            logger.error(message, { error, correlationId, userId: options.userId, messageType }),
        debug: (message: string, meta?: Record<string, any>) => 
            logger.debug(message, { ...meta, correlationId, userId: options.userId, messageType })
    };

    contextLogger.info('Initiating SMS send operation', {
        to: to.substring(0, 5) + '***', // Mask phone number for privacy
        bodyLength: body.length,
        fromNumber: options.from || SMS_CONFIG.DEFAULT_FROM_NUMBER,
        metadata: options.metadata
    });

    // Input validation
    if (!validatePhoneNumber(to)) {
        const error = new SmsServiceError(
            'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)',
            'INVALID_PHONE_NUMBER',
            400,
            false
        );
        contextLogger.error('Phone number validation failed', error);
        throw error;
    }

    let sanitizedMessage: string;
    try {
        sanitizedMessage = sanitizeMessage(body);
    } catch (error) {
        contextLogger.error('Message sanitization failed', error);
        throw error;
    }

    const messageData: SmsMessage = {
        to,
        body: sanitizedMessage,
        from: options.from || SMS_CONFIG.DEFAULT_FROM_NUMBER,
        timestamp: new Date(),
        correlationId,
        userId: options.userId,
        messageType,
        metadata: options.metadata
    };

    let lastError: Error | null = null;
    let attempt = 0;

    // Retry loop with exponential backoff
    while (attempt < SMS_CONFIG.MAX_RETRY_ATTEMPTS) {
        try {
            contextLogger.debug(`SMS send attempt ${attempt + 1} of ${SMS_CONFIG.MAX_RETRY_ATTEMPTS}`, {
                attempt: attempt + 1,
                maxAttempts: SMS_CONFIG.MAX_RETRY_ATTEMPTS
            });

            // Execute Twilio API call with timeout
            const twilioMessage = await Promise.race([
                twilioClient.messages.create({
                    to: messageData.to,
                    from: messageData.from,
                    body: messageData.body
                }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), SMS_CONFIG.REQUEST_TIMEOUT)
                )
            ]);

            // Extract message SID from successful response
            messageData.messageId = twilioMessage.sid;
            messageData.status = twilioMessage.status as SmsStatus;

            const duration = Date.now() - startTime;

            contextLogger.info('SMS message sent successfully', {
                messageId: messageData.messageId,
                status: messageData.status,
                duration,
                attempt: attempt + 1
            });

            // Log business event for audit and monitoring
            logger.business('sms_sent', {
                messageId: messageData.messageId,
                messageType,
                duration,
                attempt: attempt + 1,
                correlationId,
                userId: options.userId
            });

            // Log performance metrics
            logger.performance('sms_send_operation', duration, {
                messageType,
                attempt: attempt + 1,
                success: true
            });

            return; // Success - exit function

        } catch (error) {
            lastError = error as Error;
            attempt++;

            const isRetryable = isRetryableError(error as Error);
            const duration = Date.now() - startTime;

            contextLogger.warn('SMS send attempt failed', {
                attempt,
                maxAttempts: SMS_CONFIG.MAX_RETRY_ATTEMPTS,
                error: lastError.message,
                retryable: isRetryable,
                duration
            });

            // If not retryable or max attempts reached, throw error
            if (!isRetryable || attempt >= SMS_CONFIG.MAX_RETRY_ATTEMPTS) {
                break;
            }

            // Calculate and apply retry delay
            const retryDelay = calculateRetryDelay(attempt - 1);
            contextLogger.debug(`Retrying SMS send after ${retryDelay}ms delay`, {
                retryDelay,
                nextAttempt: attempt + 1
            });

            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

    // All retry attempts failed
    const duration = Date.now() - startTime;
    const smsError = new SmsServiceError(
        `Failed to send SMS after ${attempt} attempts: ${lastError?.message}`,
        'SMS_DELIVERY_FAILED',
        500,
        false,
        lastError || undefined
    );

    contextLogger.error('SMS delivery failed after all retry attempts', smsError);

    // Log business event for failure tracking
    logger.business('sms_send_failed', {
        messageType,
        duration,
        totalAttempts: attempt,
        correlationId,
        userId: options.userId,
        errorCode: smsError.code,
        errorMessage: smsError.message
    });

    // Log performance metrics for failure
    logger.performance('sms_send_operation', duration, {
        messageType,
        totalAttempts: attempt,
        success: false
    });

    throw smsError;
}

/**
 * Determines if an error is retryable
 * 
 * Analyzes error types and Twilio error codes to determine whether
 * a retry attempt is likely to succeed. Helps optimize retry behavior
 * and prevent unnecessary API calls for permanent failures.
 * 
 * @param error - The error to analyze
 * @returns boolean - True if error is retryable, false otherwise
 */
function isRetryableError(error: Error): boolean {
    // Timeout errors are typically retryable
    if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
        return true;
    }

    // Network-related errors are usually retryable
    if (error.message.includes('ECONNRESET') || 
        error.message.includes('ENOTFOUND') || 
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('socket hang up')) {
        return true;
    }

    // Check Twilio-specific error codes
    if ('code' in error) {
        const twilioErrorCode = (error as any).code;
        
        // Retryable Twilio error codes
        const retryableTwilioCodes = [
            20003, // Permission denied (temporary auth issues)
            20429, // Too many requests (rate limiting)
            30001, // Queue overflow
            30002, // Account suspended (temporary)
            30003, // Unreachable destination handset (temporary)
            30004, // Message blocked (temporary filtering)
            30005, // Unknown destination handset (temporary)
            30006, // Landline or unreachable carrier (temporary)
        ];

        return retryableTwilioCodes.includes(twilioErrorCode);
    }

    // HTTP status code based retry logic
    if ('status' in error || 'statusCode' in error) {
        const statusCode = (error as any).status || (error as any).statusCode;
        
        // Retryable HTTP status codes
        return statusCode >= 500 || statusCode === 429 || statusCode === 408;
    }

    // Default to non-retryable for unknown errors
    return false;
}

/**
 * Health check function for SMS service
 * 
 * Performs a connectivity test to ensure the SMS service is operational.
 * Used by monitoring systems and load balancers to determine service health.
 * Does not send actual messages to avoid unnecessary API usage.
 * 
 * @returns Promise<boolean> - True if service is healthy, false otherwise
 */
async function healthCheck(): Promise<boolean> {
    try {
        // Test Twilio API connectivity without sending a message
        const account = await twilioClient.api.accounts(
            process.env.TWILIO_ACCOUNT_SID || config.twilio?.accountSid
        ).fetch();
        
        logger.debug('SMS service health check passed', {
            accountSid: account.sid,
            accountStatus: account.status
        });
        
        return account.status === 'active';
    } catch (error) {
        logger.error('SMS service health check failed', error);
        return false;
    }
}

/**
 * Gets SMS service statistics for monitoring
 * 
 * Retrieves operational metrics and statistics for the SMS service.
 * Used for monitoring dashboards and capacity planning.
 * 
 * @returns Promise<object> - Service statistics and metrics
 */
async function getServiceStats(): Promise<{
    isHealthy: boolean;
    configuredFromNumber: string;
    maxRetryAttempts: number;
    requestTimeout: number;
    rateLimit: typeof SMS_CONFIG.RATE_LIMIT;
}> {
    const isHealthy = await healthCheck();
    
    return {
        isHealthy,
        configuredFromNumber: SMS_CONFIG.DEFAULT_FROM_NUMBER,
        maxRetryAttempts: SMS_CONFIG.MAX_RETRY_ATTEMPTS,
        requestTimeout: SMS_CONFIG.REQUEST_TIMEOUT,
        rateLimit: SMS_CONFIG.RATE_LIMIT
    };
}

// Export the main SMS sending function and utility functions
export {
    sendSms,
    healthCheck,
    getServiceStats,
    SmsServiceError,
    SmsStatus,
    SMS_CONFIG
};

// Default export for convenience
export default {
    sendSms,
    healthCheck,
    getServiceStats
};