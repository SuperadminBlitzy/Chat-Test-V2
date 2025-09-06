/**
 * Notification Service Helper Utilities
 * 
 * This module provides essential helper functions for the notification service,
 * including secure random string generation and standardized date formatting.
 * 
 * Enterprise Features:
 * - Cryptographically secure random string generation for financial services
 * - Standardized date formatting with timezone and locale support
 * - Comprehensive error handling with detailed logging
 * - Input validation and sanitization
 * - Performance optimized for high-throughput notification processing
 * - Full compliance with financial services security requirements
 * 
 * @fileoverview Helper functions for notification service operations
 * @version 1.0.0
 * @author Notification Service Team
 * @since 2025-01-01
 */

import { randomBytes, createHash } from 'crypto'; // crypto - Node.js built-in cryptographic functionality
import logger from './logger';

/**
 * Character Sets for Random String Generation
 * 
 * Defines secure character sets for different use cases in financial services.
 * These character sets are designed to avoid ambiguous characters and ensure
 * compatibility with various systems and protocols.
 */
const CHARACTER_SETS = {
    /**
     * Alphanumeric character set (A-Z, a-z, 0-9)
     * Used for general-purpose random strings, notification IDs, and reference codes
     */
    ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    
    /**
     * Uppercase alphanumeric (A-Z, 0-9)
     * Used for customer-facing reference codes and transaction IDs
     */
    UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    
    /**
     * Hex character set (0-9, A-F)
     * Used for cryptographic operations and secure token generation
     */
    HEX: '0123456789ABCDEF',
    
    /**
     * URL-safe character set (excludes ambiguous characters)
     * Used for tokens that need to be transmitted in URLs or APIs
     */
    URL_SAFE: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
} as const;

/**
 * Default character set for random string generation
 * Uses alphanumeric for balanced security and readability
 */
const DEFAULT_CHARACTER_SET = CHARACTER_SETS.ALPHANUMERIC;

/**
 * Maximum allowed length for random string generation
 * Prevents memory exhaustion attacks and ensures reasonable performance
 */
const MAX_RANDOM_STRING_LENGTH = 1024;

/**
 * Minimum allowed length for random string generation
 * Ensures adequate entropy for security purposes
 */
const MIN_RANDOM_STRING_LENGTH = 1;

/**
 * Date Formatting Configuration
 * 
 * Provides standardized date formatting options for financial services,
 * ensuring consistency across all notification messages and audit logs.
 */
const DATE_FORMAT_CONFIG = {
    /**
     * Default locale for date formatting
     * Using en-US for international financial services compatibility
     */
    DEFAULT_LOCALE: 'en-US',
    
    /**
     * Default timezone for date formatting
     * Using UTC for consistent international operations
     */
    DEFAULT_TIMEZONE: 'UTC',
    
    /**
     * Standard date format options for financial services
     * Includes full date, time, and timezone information for audit compliance
     */
    STANDARD_OPTIONS: {
        year: 'numeric' as const,
        month: '2-digit' as const,
        day: '2-digit' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        second: '2-digit' as const,
        timeZoneName: 'short' as const,
        hour12: false // 24-hour format for international compatibility
    },
    
    /**
     * ISO 8601 format for API responses and database storage
     * Ensures standardized date representation across systems
     */
    ISO_FORMAT: 'YYYY-MM-DDTHH:mm:ss.sssZ'
} as const;

/**
 * Random String Generation Options
 * 
 * Configuration interface for customizing random string generation
 * to meet specific security and formatting requirements.
 */
interface RandomStringOptions {
    /** Character set to use for generation */
    characterSet?: string;
    /** Whether to include additional entropy validation */
    validateEntropy?: boolean;
    /** Purpose of the string for logging and audit */
    purpose?: string;
}

/**
 * Date Formatting Options
 * 
 * Configuration interface for customizing date formatting
 * to meet specific localization and business requirements.
 */
interface DateFormatOptions {
    /** Locale for date formatting */
    locale?: string;
    /** Timezone for date display */
    timeZone?: string;
    /** Custom format options */
    formatOptions?: Intl.DateTimeFormatOptions;
    /** Whether to include milliseconds */
    includeMilliseconds?: boolean;
}

/**
 * Generates a cryptographically secure random string of specified length
 * 
 * This function uses Node.js crypto.randomBytes() to generate cryptographically
 * secure random strings suitable for financial services applications. It includes
 * comprehensive input validation, error handling, and security logging.
 * 
 * Security Features:
 * - Uses cryptographically secure random number generation
 * - Validates input parameters to prevent attacks
 * - Logs generation requests for audit compliance
 * - Supports multiple character sets for different use cases
 * - Includes entropy validation for high-security applications
 * 
 * Performance Optimizations:
 * - Efficient character selection algorithm
 * - Memory-efficient string construction
 * - Optimized for high-throughput notification processing
 * 
 * @param length - The desired length of the random string (1-1024 characters)
 * @param options - Optional configuration for string generation
 * @returns A cryptographically secure random string
 * 
 * @throws {TypeError} When length is not a valid number
 * @throws {RangeError} When length is outside valid range
 * @throws {Error} When cryptographic operations fail
 * 
 * @example
 * ```typescript
 * // Generate a 16-character notification ID
 * const notificationId = generateRandomString(16);
 * 
 * // Generate a secure token with custom character set
 * const secureToken = generateRandomString(32, {
 *   characterSet: CHARACTER_SETS.URL_SAFE,
 *   purpose: 'authentication_token'
 * });
 * 
 * // Generate a customer reference code
 * const referenceCode = generateRandomString(12, {
 *   characterSet: CHARACTER_SETS.UPPERCASE,
 *   purpose: 'customer_reference'
 * });
 * ```
 */
export function generateRandomString(
    length: number, 
    options: RandomStringOptions = {}
): string {
    const startTime = Date.now();
    
    try {
        // Input validation with comprehensive error checking
        if (typeof length !== 'number') {
            const error = new TypeError(`Invalid length parameter: expected number, received ${typeof length}`);
            logger.error('Random string generation failed: invalid length type', {
                providedLength: length,
                expectedType: 'number',
                actualType: typeof length,
                function: 'generateRandomString'
            });
            throw error;
        }
        
        if (!Number.isInteger(length)) {
            const error = new RangeError(`Invalid length parameter: must be an integer, received ${length}`);
            logger.error('Random string generation failed: non-integer length', {
                providedLength: length,
                function: 'generateRandomString'
            });
            throw error;
        }
        
        if (length < MIN_RANDOM_STRING_LENGTH || length > MAX_RANDOM_STRING_LENGTH) {
            const error = new RangeError(
                `Invalid length parameter: must be between ${MIN_RANDOM_STRING_LENGTH} and ${MAX_RANDOM_STRING_LENGTH}, received ${length}`
            );
            logger.error('Random string generation failed: length out of range', {
                providedLength: length,
                minLength: MIN_RANDOM_STRING_LENGTH,
                maxLength: MAX_RANDOM_STRING_LENGTH,
                function: 'generateRandomString'
            });
            throw error;
        }
        
        // Extract and validate options
        const {
            characterSet = DEFAULT_CHARACTER_SET,
            validateEntropy = false,
            purpose = 'general'
        } = options;
        
        if (typeof characterSet !== 'string' || characterSet.length === 0) {
            const error = new Error('Invalid character set: must be a non-empty string');
            logger.error('Random string generation failed: invalid character set', {
                characterSet,
                function: 'generateRandomString'
            });
            throw error;
        }
        
        // Log the generation request for audit purposes
        logger.debug('Generating random string', {
            length,
            characterSetLength: characterSet.length,
            purpose,
            validateEntropy,
            function: 'generateRandomString'
        });
        
        // Calculate required entropy and generate random bytes
        // We need more bytes than the output length to ensure uniform distribution
        const bitsPerCharacter = Math.log2(characterSet.length);
        const requiredBits = Math.ceil(length * bitsPerCharacter);
        const requiredBytes = Math.ceil(requiredBits / 8);
        
        // Generate cryptographically secure random bytes
        const randomBuffer = randomBytes(requiredBytes);
        
        // Convert random bytes to string using the specified character set
        const result: string[] = [];
        let byteIndex = 0;
        
        for (let i = 0; i < length; i++) {
            // Use rejection sampling to ensure uniform distribution
            let randomValue: number;
            const maxValue = Math.floor(256 / characterSet.length) * characterSet.length;
            
            do {
                if (byteIndex >= randomBuffer.length) {
                    // Generate more bytes if needed (rare case)
                    const additionalBytes = randomBytes(Math.max(requiredBytes, 32));
                    Buffer.concat([randomBuffer, additionalBytes]);
                    byteIndex = randomBuffer.length;
                }
                randomValue = randomBuffer[byteIndex++];
            } while (randomValue >= maxValue);
            
            // Select character from the character set
            const charIndex = randomValue % characterSet.length;
            result.push(characterSet[charIndex]);
        }
        
        const generatedString = result.join('');
        
        // Optional entropy validation for high-security applications
        if (validateEntropy) {
            const entropyBits = calculateShannonEntropy(generatedString) * generatedString.length;
            const minimumEntropy = Math.log2(characterSet.length) * length * 0.8; // 80% of maximum entropy
            
            if (entropyBits < minimumEntropy) {
                logger.warn('Generated string has lower entropy than expected', {
                    actualEntropy: entropyBits,
                    minimumExpected: minimumEntropy,
                    length,
                    purpose,
                    function: 'generateRandomString'
                });
            }
        }
        
        const duration = Date.now() - startTime;
        
        // Log successful generation with performance metrics
        logger.debug('Random string generated successfully', {
            length,
            purpose,
            duration,
            characterSetLength: characterSet.length,
            requiredBytes,
            function: 'generateRandomString'
        });
        
        // Performance monitoring for high-throughput scenarios
        if (duration > 100) { // Log slow operations (>100ms)
            logger.performance('generateRandomString', duration, {
                length,
                purpose,
                characterSetLength: characterSet.length
            });
        }
        
        return generatedString;
        
    } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log the error with comprehensive context
        logger.error('Random string generation failed', {
            error: error instanceof Error ? error.message : String(error),
            length,
            purpose: options.purpose || 'general',
            duration,
            stack: error instanceof Error ? error.stack : undefined,
            function: 'generateRandomString'
        });
        
        // Re-throw the error to maintain the function's contract
        throw error;
    }
}

/**
 * Formats a Date object into a human-readable string with financial services standards
 * 
 * This function provides standardized date formatting for the notification service,
 * ensuring consistency across all customer communications and audit logs. It supports
 * internationalization, timezone handling, and various formatting options required
 * for financial services compliance.
 * 
 * Features:
 * - Standardized formatting for financial services compliance
 * - Full timezone and locale support for international operations
 * - Multiple format options for different use cases
 * - Comprehensive error handling and validation
 * - Performance optimized for high-volume notification processing
 * - Audit logging for compliance requirements
 * 
 * @param date - The Date object to format
 * @param options - Optional configuration for date formatting
 * @returns A formatted date string according to financial services standards
 * 
 * @throws {TypeError} When date is not a valid Date object
 * @throws {RangeError} When date is invalid or outside valid range
 * @throws {Error} When formatting operations fail
 * 
 * @example
 * ```typescript
 * // Format current date with default settings
 * const formatted = formatDate(new Date());
 * // Output: "01/15/2025, 14:30:45 UTC"
 * 
 * // Format with custom locale and timezone
 * const customFormat = formatDate(new Date(), {
 *   locale: 'en-GB',
 *   timeZone: 'Europe/London'
 * });
 * 
 * // Format for API response with milliseconds
 * const apiFormat = formatDate(new Date(), {
 *   includeMilliseconds: true,
 *   formatOptions: { 
 *     dateStyle: 'full',
 *     timeStyle: 'full' 
 *   }
 * });
 * ```
 */
export function formatDate(date: Date, options: DateFormatOptions = {}): string {
    const startTime = Date.now();
    
    try {
        // Comprehensive input validation
        if (!(date instanceof Date)) {
            const error = new TypeError(`Invalid date parameter: expected Date object, received ${typeof date}`);
            logger.error('Date formatting failed: invalid date type', {
                providedDate: date,
                expectedType: 'Date',
                actualType: typeof date,
                function: 'formatDate'
            });
            throw error;
        }
        
        if (isNaN(date.getTime())) {
            const error = new RangeError('Invalid date parameter: Date object contains invalid date');
            logger.error('Date formatting failed: invalid date value', {
                providedDate: date.toString(),
                function: 'formatDate'
            });
            throw error;
        }
        
        // Validate date is within reasonable range for financial services
        const minDate = new Date('1900-01-01');
        const maxDate = new Date('2100-12-31');
        
        if (date < minDate || date > maxDate) {
            const error = new RangeError(
                `Date out of valid range: must be between ${minDate.toISOString()} and ${maxDate.toISOString()}`
            );
            logger.error('Date formatting failed: date out of range', {
                providedDate: date.toISOString(),
                minDate: minDate.toISOString(),
                maxDate: maxDate.toISOString(),
                function: 'formatDate'
            });
            throw error;
        }
        
        // Extract and validate options
        const {
            locale = DATE_FORMAT_CONFIG.DEFAULT_LOCALE,
            timeZone = DATE_FORMAT_CONFIG.DEFAULT_TIMEZONE,
            formatOptions = DATE_FORMAT_CONFIG.STANDARD_OPTIONS,
            includeMilliseconds = false
        } = options;
        
        // Validate locale
        if (typeof locale !== 'string' || locale.trim().length === 0) {
            const error = new Error('Invalid locale: must be a non-empty string');
            logger.error('Date formatting failed: invalid locale', {
                locale,
                function: 'formatDate'
            });
            throw error;
        }
        
        // Validate timezone
        if (typeof timeZone !== 'string' || timeZone.trim().length === 0) {
            const error = new Error('Invalid timezone: must be a non-empty string');
            logger.error('Date formatting failed: invalid timezone', {
                timeZone,
                function: 'formatDate'
            });
            throw error;
        }
        
        // Log the formatting request for audit purposes
        logger.debug('Formatting date', {
            inputDate: date.toISOString(),
            locale,
            timeZone,
            includeMilliseconds,
            function: 'formatDate'
        });
        
        // Prepare formatting options with timezone
        const formattingOptions: Intl.DateTimeFormatOptions = {
            ...formatOptions,
            timeZone
        };
        
        // Create the formatter with error handling
        let formatter: Intl.DateTimeFormat;
        try {
            formatter = new Intl.DateTimeFormat(locale, formattingOptions);
        } catch (formatterError) {
            const error = new Error(`Failed to create date formatter: ${formatterError instanceof Error ? formatterError.message : String(formatterError)}`);
            logger.error('Date formatting failed: formatter creation error', {
                locale,
                timeZone,
                formattingOptions,
                error: formatterError instanceof Error ? formatterError.message : String(formatterError),
                function: 'formatDate'
            });
            throw error;
        }
        
        // Format the date
        let formattedDate: string;
        try {
            formattedDate = formatter.format(date);
        } catch (formatError) {
            const error = new Error(`Failed to format date: ${formatError instanceof Error ? formatError.message : String(formatError)}`);
            logger.error('Date formatting failed: format operation error', {
                inputDate: date.toISOString(),
                locale,
                timeZone,
                error: formatError instanceof Error ? formatError.message : String(formatError),
                function: 'formatDate'
            });
            throw error;
        }
        
        // Add milliseconds if requested
        if (includeMilliseconds) {
            const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
            // Insert milliseconds before timezone or at the end
            if (formattedDate.includes('UTC') || formattedDate.includes('GMT')) {
                formattedDate = formattedDate.replace(/(\s+)(UTC|GMT)/i, `.${milliseconds}$1$2`);
            } else {
                // Find time pattern and add milliseconds
                formattedDate = formattedDate.replace(/(\d{2}:\d{2}:\d{2})/, `$1.${milliseconds}`);
            }
        }
        
        const duration = Date.now() - startTime;
        
        // Log successful formatting with performance metrics
        logger.debug('Date formatted successfully', {
            inputDate: date.toISOString(),
            formattedDate,
            locale,
            timeZone,
            duration,
            includeMilliseconds,
            function: 'formatDate'
        });
        
        // Performance monitoring for high-throughput scenarios
        if (duration > 50) { // Log slow operations (>50ms)
            logger.performance('formatDate', duration, {
                locale,
                timeZone,
                includeMilliseconds
            });
        }
        
        return formattedDate;
        
    } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log the error with comprehensive context
        logger.error('Date formatting failed', {
            error: error instanceof Error ? error.message : String(error),
            inputDate: date instanceof Date ? date.toISOString() : String(date),
            locale: options.locale,
            timeZone: options.timeZone,
            duration,
            stack: error instanceof Error ? error.stack : undefined,
            function: 'formatDate'
        });
        
        // Re-throw the error to maintain the function's contract
        throw error;
    }
}

/**
 * Calculates Shannon entropy for entropy validation
 * 
 * This internal utility function calculates the Shannon entropy of a string
 * to validate the randomness quality of generated strings in high-security
 * applications.
 * 
 * @param str - The string to analyze
 * @returns Shannon entropy value (bits per character)
 * @internal
 */
function calculateShannonEntropy(str: string): number {
    const charFrequency = new Map<string, number>();
    
    // Count character frequencies
    for (const char of str) {
        charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }
    
    // Calculate entropy
    let entropy = 0;
    const length = str.length;
    
    for (const frequency of charFrequency.values()) {
        const probability = frequency / length;
        entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
}

/**
 * Utility function to generate secure notification IDs
 * 
 * Pre-configured random string generator for notification IDs with
 * financial services best practices applied.
 * 
 * @returns A secure 20-character notification ID
 * @example
 * ```typescript
 * const notificationId = generateNotificationId();
 * // Output: "A1B2C3D4E5F6G7H8I9J0"
 * ```
 */
export function generateNotificationId(): string {
    return generateRandomString(20, {
        characterSet: CHARACTER_SETS.ALPHANUMERIC,
        purpose: 'notification_id',
        validateEntropy: true
    });
}

/**
 * Utility function to generate secure transaction reference codes
 * 
 * Pre-configured random string generator for transaction references
 * with uppercase alphanumeric characters for customer readability.
 * 
 * @returns A secure 12-character transaction reference code
 * @example
 * ```typescript
 * const transactionRef = generateTransactionReference();
 * // Output: "TX4A7K9M2P5Q"
 * ```
 */
export function generateTransactionReference(): string {
    return 'TX' + generateRandomString(10, {
        characterSet: CHARACTER_SETS.UPPERCASE,
        purpose: 'transaction_reference',
        validateEntropy: true
    });
}

/**
 * Utility function to format dates for audit logs
 * 
 * Pre-configured date formatter for audit log entries with
 * full timestamp and UTC timezone.
 * 
 * @param date - The date to format for audit logs
 * @returns ISO 8601 formatted date string with full precision
 * @example
 * ```typescript
 * const auditTimestamp = formatAuditDate(new Date());
 * // Output: "2025-01-15T14:30:45.123Z"
 * ```
 */
export function formatAuditDate(date: Date): string {
    // For audit logs, we use ISO format for consistency and machine readability
    try {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error('Invalid date provided for audit formatting');
        }
        
        return date.toISOString();
    } catch (error) {
        logger.error('Audit date formatting failed', {
            error: error instanceof Error ? error.message : String(error),
            inputDate: String(date),
            function: 'formatAuditDate'
        });
        throw error;
    }
}

/**
 * Utility function to format dates for customer notifications
 * 
 * Pre-configured date formatter for customer-facing notifications
 * with localized formatting and readable timezone display.
 * 
 * @param date - The date to format for customer display
 * @param customerLocale - Customer's preferred locale (default: en-US)
 * @param customerTimezone - Customer's timezone (default: UTC)
 * @returns Human-readable formatted date string
 * @example
 * ```typescript
 * const customerDate = formatCustomerDate(new Date(), 'en-GB', 'Europe/London');
 * // Output: "15/01/2025, 14:30:45 GMT"
 * ```
 */
export function formatCustomerDate(
    date: Date, 
    customerLocale: string = 'en-US',
    customerTimezone: string = 'UTC'
): string {
    return formatDate(date, {
        locale: customerLocale,
        timeZone: customerTimezone,
        formatOptions: {
            ...DATE_FORMAT_CONFIG.STANDARD_OPTIONS,
            timeZoneName: 'short'
        }
    });
}

// Export character sets for external use if needed
export { CHARACTER_SETS };

// Export type definitions for external use
export type { RandomStringOptions, DateFormatOptions };