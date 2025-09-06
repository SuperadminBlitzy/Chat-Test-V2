import { format, formatDistanceToNow } from 'date-fns'; // ^2.30.0

/**
 * Date Formatter Utility
 * 
 * Provides consistent date and time formatting functions for the Unified Financial Services Platform.
 * This utility ensures that all dates and timestamps are displayed in a standardized format
 * across the entire web application, maintaining consistency in user experience and 
 * compliance with financial industry standards.
 * 
 * All functions handle multiple input types (Date objects, timestamps, date strings)
 * and include comprehensive error handling for production reliability.
 * 
 * @module DateFormatter
 * @version 1.0.0
 * @author Financial Services Platform Team
 */

/**
 * Formats a given date into a standard 'MM/dd/yyyy' string format.
 * 
 * This function provides consistent short date formatting across the application,
 * ensuring dates are displayed in the standard US format expected by financial
 * institutions and their customers.
 * 
 * @param {Date | number | string} date - The date to format. Can be:
 *   - Date object: new Date()
 *   - Number: Unix timestamp (milliseconds since epoch)
 *   - String: ISO date string or other parseable date format
 * 
 * @returns {string} The formatted date string in 'MM/dd/yyyy' format
 * 
 * @throws {Error} Throws an error if the input cannot be parsed as a valid date
 * 
 * @example
 * // With Date object
 * formatDate(new Date(2024, 2, 15)) // Returns: "03/15/2024"
 * 
 * @example
 * // With timestamp
 * formatDate(1710504000000) // Returns: "03/15/2024"
 * 
 * @example
 * // With ISO string
 * formatDate("2024-03-15T10:30:00Z") // Returns: "03/15/2024"
 */
export function formatDate(date: Date | number | string): string {
  try {
    // Convert input to Date object for consistent processing
    const dateObject = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    // Validate that the date is valid
    if (isNaN(dateObject.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }

    // Use date-fns format function to ensure consistent formatting
    // MM/dd/yyyy format is standard for financial applications in the US market
    return format(dateObject, 'MM/dd/yyyy');
  } catch (error) {
    // Log error for debugging in production environments
    console.error('Error formatting date:', error);
    throw new Error(`Failed to format date: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Formats a given date and time into a standard 'MM/dd/yyyy hh:mm:ss a' string format.
 * 
 * This function provides comprehensive date and time formatting for detailed timestamps
 * required in financial transactions, audit logs, and compliance reporting. The format
 * includes 12-hour time with AM/PM indicator for user-friendly display.
 * 
 * @param {Date | number | string} date - The date and time to format. Can be:
 *   - Date object: new Date()
 *   - Number: Unix timestamp (milliseconds since epoch)
 *   - String: ISO date string or other parseable date format
 * 
 * @returns {string} The formatted date and time string in 'MM/dd/yyyy hh:mm:ss a' format
 * 
 * @throws {Error} Throws an error if the input cannot be parsed as a valid date
 * 
 * @example
 * // With Date object
 * formatDateTime(new Date(2024, 2, 15, 14, 30, 45)) // Returns: "03/15/2024 02:30:45 PM"
 * 
 * @example
 * // With timestamp
 * formatDateTime(1710519045000) // Returns: "03/15/2024 02:30:45 PM"
 * 
 * @example
 * // With ISO string
 * formatDateTime("2024-03-15T14:30:45Z") // Returns: "03/15/2024 02:30:45 PM"
 */
export function formatDateTime(date: Date | number | string): string {
  try {
    // Convert input to Date object for consistent processing
    const dateObject = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    // Validate that the date is valid
    if (isNaN(dateObject.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }

    // Use date-fns format function with comprehensive date-time pattern
    // MM/dd/yyyy hh:mm:ss a format provides full timestamp with AM/PM indicator
    // This format is essential for audit trails and transaction timestamps in financial systems
    return format(dateObject, 'MM/dd/yyyy hh:mm:ss a');
  } catch (error) {
    // Log error for debugging in production environments
    console.error('Error formatting date and time:', error);
    throw new Error(`Failed to format date and time: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Formats a given date into a string representing the relative time from now.
 * 
 * This function provides user-friendly relative time display (e.g., '2 hours ago',
 * '3 days ago') which enhances user experience by showing how recent events occurred.
 * This is particularly useful for transaction histories, notification timestamps,
 * and activity feeds in financial applications.
 * 
 * @param {Date | number | string} date - The date to format relative to now. Can be:
 *   - Date object: new Date()
 *   - Number: Unix timestamp (milliseconds since epoch)
 *   - String: ISO date string or other parseable date format
 * 
 * @returns {string} The formatted relative time string with ' ago' suffix
 * 
 * @throws {Error} Throws an error if the input cannot be parsed as a valid date
 * 
 * @example
 * // If current time is March 15, 2024 at 3:00 PM
 * formatRelativeTime(new Date(2024, 2, 15, 13, 0, 0)) // Returns: "2 hours ago"
 * 
 * @example
 * // With timestamp from 1 day ago
 * formatRelativeTime(Date.now() - 86400000) // Returns: "1 day ago"
 * 
 * @example
 * // With ISO string from 30 minutes ago
 * formatRelativeTime("2024-03-15T14:30:00Z") // Returns: "30 minutes ago"
 */
export function formatRelativeTime(date: Date | number | string): string {
  try {
    // Convert input to Date object for consistent processing
    const dateObject = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    // Validate that the date is valid
    if (isNaN(dateObject.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }

    // Use date-fns formatDistanceToNow function to calculate relative time
    // This function automatically handles pluralization and various time units
    const relativeTime = formatDistanceToNow(dateObject);

    // Append ' ago' suffix for clarity and consistency with user expectations
    // This makes it immediately clear that the time refers to the past
    return `${relativeTime} ago`;
  } catch (error) {
    // Log error for debugging in production environments
    console.error('Error formatting relative time:', error);
    throw new Error(`Failed to format relative time: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Type definitions for improved TypeScript support and documentation
 */
export type DateInput = Date | number | string;

/**
 * Configuration object for future extensibility
 * Currently not used but reserved for future enhancements such as:
 * - Timezone handling
 * - Locale-specific formatting
 * - Custom format patterns
 */
export interface DateFormatterConfig {
  timezone?: string;
  locale?: string;
  customFormats?: Record<string, string>;
}

/**
 * Validation utility to check if a given input is a valid date
 * 
 * @param {unknown} input - The input to validate
 * @returns {boolean} True if the input can be converted to a valid Date
 * 
 * @example
 * isValidDate(new Date()) // Returns: true
 * isValidDate("2024-03-15") // Returns: true
 * isValidDate("invalid") // Returns: false
 */
export function isValidDate(input: unknown): boolean {
  try {
    if (input instanceof Date) {
      return !isNaN(input.getTime());
    }
    
    if (typeof input === 'string' || typeof input === 'number') {
      const date = new Date(input);
      return !isNaN(date.getTime());
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Re-export commonly used date-fns functions for convenience
 * This allows consumers to import additional date utilities from the same module
 * while maintaining consistency with the date-fns version used by the formatter
 */
export { format as dateFormat } from 'date-fns';
export { formatDistanceToNow as formatDistance } from 'date-fns';

/**
 * Default export object containing all formatter functions
 * Provides an alternative import pattern for consumers who prefer object destructuring
 */
const dateFormatter = {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isValidDate
};

export default dateFormatter;