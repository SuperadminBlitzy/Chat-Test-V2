/**
 * Currency Formatting Utility
 * 
 * This utility provides consistent, locale-aware currency formatting across the web application.
 * It addresses the Currency Formatting requirement from the technical specification's Frontend Languages section,
 * ensuring financial data is displayed consistently in transaction lists, dashboards, and reports.
 * 
 * Uses the Intl.NumberFormat API for robust international currency formatting with proper locale support.
 * Designed for enterprise-grade financial applications with comprehensive error handling and validation.
 * 
 * @fileoverview Currency formatting utility for financial data display
 * @version 1.0.0
 * @author Financial Services Development Team
 */

/**
 * Default locale for currency formatting when none is specified
 * Uses US English as the default locale following common financial application patterns
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Default currency code when none is specified
 * Uses USD as the default currency for financial applications
 */
const DEFAULT_CURRENCY = 'USD';

/**
 * Formats a numerical value as a currency string using locale-aware formatting
 * 
 * This function leverages the Intl.NumberFormat API to provide consistent currency formatting
 * across different locales and currencies. It handles edge cases and provides comprehensive
 * error handling suitable for production financial applications.
 * 
 * @param value - The numerical value to format as currency
 * @param currency - The currency code (ISO 4217 format, e.g., 'USD', 'EUR', 'GBP')
 * @param locale - The locale string for formatting (e.g., 'en-US', 'de-DE', 'ja-JP')
 * @returns The formatted currency string (e.g., '$1,234.56', '€1.234,56', '¥1,235')
 * 
 * @throws {TypeError} When value is not a valid number
 * @throws {RangeError} When currency code is invalid or unsupported
 * @throws {RangeError} When locale is invalid or unsupported
 * 
 * @example
 * // Basic usage with default locale (en-US)
 * formatCurrency(1234.56, 'USD') // Returns: '$1,234.56'
 * 
 * @example
 * // European formatting
 * formatCurrency(1234.56, 'EUR', 'de-DE') // Returns: '1.234,56 €'
 * 
 * @example
 * // Japanese Yen (no decimal places)
 * formatCurrency(1234.56, 'JPY', 'ja-JP') // Returns: '¥1,235'
 * 
 * @example
 * // British Pound with UK locale
 * formatCurrency(1234.56, 'GBP', 'en-GB') // Returns: '£1,234.56'
 */
export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  // Input validation for value parameter
  if (typeof value !== 'number') {
    throw new TypeError(`Expected 'value' to be a number, but received ${typeof value}`);
  }
  
  // Check for invalid number values (NaN, Infinity)
  if (!isFinite(value)) {
    throw new TypeError(`Expected 'value' to be a finite number, but received ${value}`);
  }
  
  // Input validation for currency parameter
  if (typeof currency !== 'string' || currency.trim().length === 0) {
    throw new TypeError(`Expected 'currency' to be a non-empty string, but received ${typeof currency}`);
  }
  
  // Normalize currency code to uppercase (ISO 4217 standard)
  const normalizedCurrency = currency.trim().toUpperCase();
  
  // Basic currency code format validation (3 characters)
  if (normalizedCurrency.length !== 3) {
    throw new RangeError(`Invalid currency code: '${currency}'. Expected 3-character ISO 4217 code.`);
  }
  
  // Input validation for locale parameter
  if (typeof locale !== 'string' || locale.trim().length === 0) {
    throw new TypeError(`Expected 'locale' to be a non-empty string, but received ${typeof locale}`);
  }
  
  const normalizedLocale = locale.trim();
  
  try {
    // Initialize Intl.NumberFormat with specified locale and currency options
    // Using 'currency' style for proper currency symbol display
    // minimumFractionDigits and maximumFractionDigits are automatically set based on currency
    const formatter = new Intl.NumberFormat(normalizedLocale, {
      style: 'currency',
      currency: normalizedCurrency,
      // Automatically handle fraction digits based on currency
      // For example, JPY typically has 0 decimal places, while USD has 2
      minimumFractionDigits: undefined, // Let Intl.NumberFormat decide
      maximumFractionDigits: undefined, // Let Intl.NumberFormat decide
    });
    
    // Format the value using the configured formatter
    const formattedValue = formatter.format(value);
    
    // Return the formatted currency string
    return formattedValue;
    
  } catch (error) {
    // Handle Intl.NumberFormat errors gracefully
    if (error instanceof RangeError) {
      // Check if it's a currency-related error
      if (error.message.includes('currency')) {
        throw new RangeError(`Unsupported currency code: '${normalizedCurrency}'. Please use a valid ISO 4217 currency code.`);
      }
      // Check if it's a locale-related error
      if (error.message.includes('locale') || error.message.includes('Invalid language tag')) {
        throw new RangeError(`Unsupported locale: '${normalizedLocale}'. Please use a valid BCP 47 language tag.`);
      }
      // Re-throw other RangeErrors
      throw error;
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Type definition for supported currency codes
 * This can be extended to include validation for specific currency codes
 * that are supported by the financial application
 */
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY';

/**
 * Type definition for commonly used locales in financial applications
 * This helps with type safety when using the formatCurrency function
 */
export type SupportedLocale = 'en-US' | 'en-GB' | 'de-DE' | 'fr-FR' | 'ja-JP' | 'zh-CN' | 'es-ES' | 'it-IT';

/**
 * Utility function to check if a currency code is supported
 * This can be used for validation in forms or API endpoints
 * 
 * @param currency - The currency code to validate
 * @returns True if the currency is supported, false otherwise
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  const supportedCurrencies: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
  return supportedCurrencies.includes(currency.toUpperCase() as SupportedCurrency);
}

/**
 * Utility function to check if a locale is supported
 * This can be used for validation in user preference settings
 * 
 * @param locale - The locale to validate
 * @returns True if the locale is supported, false otherwise
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  const supportedLocales: SupportedLocale[] = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'zh-CN', 'es-ES', 'it-IT'];
  return supportedLocales.includes(locale as SupportedLocale);
}

/**
 * Configuration object for currency formatting options
 * This provides additional flexibility for specific formatting requirements
 */
export interface CurrencyFormatOptions {
  /** The locale for formatting */
  locale?: string;
  /** The currency code */
  currency?: string;
  /** Minimum number of fraction digits */
  minimumFractionDigits?: number;
  /** Maximum number of fraction digits */
  maximumFractionDigits?: number;
  /** Whether to use grouping separators (e.g., commas) */
  useGrouping?: boolean;
}

/**
 * Advanced currency formatting function with additional options
 * Provides more control over the formatting process for specific use cases
 * 
 * @param value - The numerical value to format
 * @param options - Configuration options for formatting
 * @returns The formatted currency string
 */
export function formatCurrencyAdvanced(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true
  } = options;
  
  // Input validation
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new TypeError(`Expected 'value' to be a finite number, but received ${value}`);
  }
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping
    });
    
    return formatter.format(value);
  } catch (error) {
    if (error instanceof RangeError) {
      throw new RangeError(`Formatting error: ${error.message}`);
    }
    throw error;
  }
}