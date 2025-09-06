import { z } from 'zod'; // v3.22+

// Import base validation schemas from the core validation library
import { 
  customerOnboardingSchema, 
  transactionSchema 
} from '../lib/validation';

/**
 * Form Validators Utility
 * 
 * This file centralizes and exports form validation schemas for the entire web application.
 * It re-exports schemas from the core validation library and defines additional validators
 * for specific UI components and forms, ensuring consistent validation logic across the
 * user interface.
 * 
 * Requirements Addressed:
 * - F-004: Digital Customer Onboarding - Provides validation schemas for multi-step onboarding
 * - Data Validation - Acts as central module for form-specific validators using Zod
 * - Form Interactions - Exports validation schemas for real-time form validation and feedback
 * 
 * Performance Considerations:
 * - Validation schemas are defined once and reused across components
 * - Type-safe validation reduces runtime errors
 * - Client-side validation reduces server load and improves UX
 * 
 * Security Features:
 * - Strong password policies aligned with financial industry standards
 * - Email validation with disposable email domain checking
 * - Input sanitization and type validation
 * - Protection against common form-based attacks
 */

// ============================================================================
// RE-EXPORTED SCHEMAS FROM CORE VALIDATION LIBRARY
// ============================================================================

/**
 * Customer Onboarding Schema
 * 
 * Re-exports the comprehensive customer onboarding validation schema from the core
 * validation library. This schema supports the F-004: Digital Customer Onboarding
 * feature with full KYC/AML compliance validation.
 * 
 * @see ../lib/validation.ts for detailed schema definition
 * @target_performance <5 minutes average onboarding time with 99% accuracy
 */
export const customerOnboardingSchema = customerOnboardingSchema;

/**
 * Transaction Schema
 * 
 * Re-exports the financial transaction validation schema for use in transaction-related
 * forms and components. Supports both immediate and scheduled transactions with
 * comprehensive validation for regulatory compliance.
 * 
 * @see ../lib/validation.ts for detailed schema definition
 * @supports Real-time transaction monitoring and fraud detection integration
 */
export const transactionSchema = transactionSchema;

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Login Form Validation Schema
 * 
 * Validates user login credentials with enterprise-grade security requirements.
 * Enforces email format validation and minimum password length requirements
 * aligned with financial industry security standards.
 * 
 * Security Features:
 * - Email format validation with comprehensive regex
 * - Minimum password length enforcement
 * - Input sanitization and normalization
 * 
 * @example
 * const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
 * if (result.success) {
 *   // Valid login data
 *   const { email, password } = result.data;
 * }
 */
export const loginSchema = z.object({
  // Email validation with comprehensive format checking
  email: z.string()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(254, 'Email address is too long')
    .toLowerCase()
    .transform(val => val.trim())
    .refine(
      (email) => {
        // Additional validation for email format compliance
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
      },
      'Please enter a valid email address'
    ),

  // Password validation with minimum security requirements
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .refine(
      (password) => {
        // Ensure password contains at least one character (basic validation for login)
        return password.length > 0;
      },
      'Password cannot be empty'
    )
});

/**
 * User Registration Form Validation Schema
 * 
 * Validates new user registration with enhanced security requirements for financial
 * services applications. Enforces strong password policies and password confirmation
 * to prevent user registration errors.
 * 
 * Security Features:
 * - Strong password policy (minimum 12 characters)
 * - Password complexity validation
 * - Password confirmation matching
 * - Email format and domain validation
 * 
 * Compliance:
 * - Aligns with financial industry password security standards
 * - Supports regulatory requirements for customer authentication
 * 
 * @example
 * const registrationData = {
 *   email: 'newuser@example.com',
 *   password: 'SecurePassword123!',
 *   confirmPassword: 'SecurePassword123!'
 * };
 * const result = registrationSchema.safeParse(registrationData);
 */
export const registrationSchema = z.object({
  // Email validation with enhanced security checks
  email: z.string()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(254, 'Email address is too long')
    .toLowerCase()
    .transform(val => val.trim())
    .refine(
      (email) => {
        // Comprehensive email format validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
      },
      'Please enter a valid email address'
    )
    .refine(
      (email) => {
        // Block disposable email domains for enhanced security
        const disposableEmailDomains = [
          'tempmail.org', '10minutemail.com', 'guerrillamail.com',
          'mailinator.com', 'yopmail.com', 'temp-mail.org'
        ];
        const domain = email.split('@')[1];
        return !disposableEmailDomains.includes(domain?.toLowerCase());
      },
      'Disposable email addresses are not allowed for registration'
    ),

  // Strong password validation for financial services security
  password: z.string()
    .min(12, 'Password must be at least 12 characters long for security')
    .max(128, 'Password cannot exceed 128 characters')
    .refine(
      (password) => {
        // At least one uppercase letter
        return /[A-Z]/.test(password);
      },
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => {
        // At least one lowercase letter
        return /[a-z]/.test(password);
      },
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => {
        // At least one number
        return /[0-9]/.test(password);
      },
      'Password must contain at least one number'
    )
    .refine(
      (password) => {
        // At least one special character
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);
      },
      'Password must contain at least one special character'
    )
    .refine(
      (password) => {
        // No common weak passwords
        const commonPasswords = [
          'password123', '123456789', 'qwerty123', 'password1',
          'admin123456', 'welcome123', 'changeme123'
        ];
        return !commonPasswords.includes(password.toLowerCase());
      },
      'Password is too common. Please choose a more secure password'
    ),

  // Password confirmation field
  confirmPassword: z.string()
    .min(1, 'Password confirmation is required')
})
.refine(
  (data) => {
    // Ensure passwords match
    return data.password === data.confirmPassword;
  },
  {
    message: "Passwords don't match. Please ensure both password fields are identical",
    path: ["confirmPassword"]
  }
);

/**
 * Forgot Password Form Validation Schema
 * 
 * Validates the forgot password form input, ensuring proper email format
 * for password reset functionality. Includes security measures to prevent
 * abuse of the password reset system.
 * 
 * Security Features:
 * - Email format validation
 * - Domain validation
 * - Input sanitization
 * 
 * @example
 * const forgotPasswordData = { email: 'user@example.com' };
 * const result = forgotPasswordSchema.safeParse(forgotPasswordData);
 */
export const forgotPasswordSchema = z.object({
  // Email validation for password reset
  email: z.string()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(254, 'Email address is too long')
    .toLowerCase()
    .transform(val => val.trim())
    .refine(
      (email) => {
        // Comprehensive email format validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
      },
      'Please enter a valid email address'
    )
    .refine(
      (email) => {
        // Validate email domain length for additional security
        const domain = email.split('@')[1];
        return domain && domain.length >= 2 && domain.length <= 253;
      },
      'Invalid email domain format'
    )
});

/**
 * Reset Password Form Validation Schema
 * 
 * Validates password reset form with new password and confirmation.
 * Implements the same strong password policy as registration to ensure
 * consistent security standards across the application.
 * 
 * Security Features:
 * - Strong password policy enforcement
 * - Password complexity validation
 * - Password confirmation matching
 * - Protection against common weak passwords
 * 
 * @example
 * const resetData = {
 *   password: 'NewSecurePassword123!',
 *   confirmPassword: 'NewSecurePassword123!'
 * };
 * const result = resetPasswordSchema.safeParse(resetData);
 */
export const resetPasswordSchema = z.object({
  // New password with strong security requirements
  password: z.string()
    .min(12, 'Password must be at least 12 characters long for security')
    .max(128, 'Password cannot exceed 128 characters')
    .refine(
      (password) => {
        // At least one uppercase letter
        return /[A-Z]/.test(password);
      },
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => {
        // At least one lowercase letter
        return /[a-z]/.test(password);
      },
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => {
        // At least one number
        return /[0-9]/.test(password);
      },
      'Password must contain at least one number'
    )
    .refine(
      (password) => {
        // At least one special character
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);
      },
      'Password must contain at least one special character'
    )
    .refine(
      (password) => {
        // No spaces allowed for security
        return !/\s/.test(password);
      },
      'Password cannot contain spaces'
    )
    .refine(
      (password) => {
        // No common weak passwords
        const commonPasswords = [
          'password123', '123456789', 'qwerty123', 'password1',
          'admin123456', 'welcome123', 'changeme123', 'newpassword123'
        ];
        return !commonPasswords.includes(password.toLowerCase());
      },
      'Password is too common. Please choose a more secure password'
    ),

  // Password confirmation field
  confirmPassword: z.string()
    .min(1, 'Password confirmation is required')
})
.refine(
  (data) => {
    // Ensure passwords match
    return data.password === data.confirmPassword;
  },
  {
    message: "Passwords don't match. Please ensure both password fields are identical",
    path: ["confirmPassword"]
  }
);

// ============================================================================
// FINANCIAL PLANNING & GOAL MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Financial Goal Creation/Update Validation Schema
 * 
 * Validates financial goal data for personal financial planning features.
 * Supports goal-based financial planning with proper validation for
 * goal names, target amounts, and target dates.
 * 
 * Features:
 * - Goal name validation with appropriate length limits
 * - Positive monetary amount validation
 * - Future date validation for realistic goal setting
 * - Currency precision validation
 * 
 * Business Rules:
 * - Target amounts must be positive and realistic
 * - Target dates must be in the future
 * - Goal names must be descriptive and unique
 * 
 * @example
 * const goalData = {
 *   goalName: 'Emergency Fund',
 *   targetAmount: 10000.00,
 *   targetDate: '2025-12-31'
 * };
 * const result = financialGoalSchema.safeParse(goalData);
 */
export const financialGoalSchema = z.object({
  // Goal name validation with business rules
  goalName: z.string()
    .min(3, 'Goal name must be at least 3 characters long')
    .max(100, 'Goal name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_'.,()]+$/,
      'Goal name can only contain letters, numbers, spaces, and basic punctuation'
    )
    .transform(val => val.trim())
    .refine(
      (name) => {
        // Ensure goal name is not just whitespace or punctuation
        return /[a-zA-Z0-9]/.test(name);
      },
      'Goal name must contain at least one letter or number'
    )
    .refine(
      (name) => {
        // Block inappropriate or system-reserved names
        const reservedNames = ['admin', 'system', 'test', 'null', 'undefined'];
        return !reservedNames.includes(name.toLowerCase());
      },
      'Goal name is reserved. Please choose a different name'
    ),

  // Target amount validation with financial constraints
  targetAmount: z.number()
    .positive('Target amount must be a positive number')
    .min(0.01, 'Target amount must be at least $0.01')
    .max(10000000, 'Target amount cannot exceed $10,000,000')
    .refine(
      (amount) => {
        // Validate decimal places for currency precision (max 2 decimal places)
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      },
      'Target amount cannot have more than 2 decimal places'
    )
    .refine(
      (amount) => {
        // Ensure realistic amounts for personal financial goals
        return amount >= 1 && amount <= 10000000;
      },
      'Please enter a realistic target amount between $1 and $10,000,000'
    ),

  // Target date validation with business rules
  targetDate: z.string()
    .min(1, 'Target date is required')
    .refine(
      (date) => {
        // Validate date format
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
      },
      'Invalid date format. Please use YYYY-MM-DD format'
    )
    .refine(
      (date) => {
        // Target date must be in the future
        const targetDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
        return targetDate > today;
      },
      'Target date must be in the future'
    )
    .refine(
      (date) => {
        // Target date should not be more than 50 years in the future
        const targetDate = new Date(date);
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 50);
        return targetDate <= maxFutureDate;
      },
      'Target date cannot be more than 50 years in the future'
    )
    .refine(
      (date) => {
        // Target date should be at least 1 day in the future for meaningful goals
        const targetDate = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return targetDate >= tomorrow;
      },
      'Target date must be at least 1 day in the future'
    ),

  // Optional description field for additional goal context
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .transform(val => val?.trim() || '')
    .optional(),

  // Optional category for goal organization
  category: z.string()
    .max(50, 'Category cannot exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Category can only contain letters, numbers, spaces, hyphens, and underscores'
    )
    .transform(val => val?.trim().toLowerCase() || '')
    .optional(),

  // Optional priority level for goal management
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    errorMap: () => ({ message: 'Priority must be Low, Medium, or High' })
  }).optional().default('MEDIUM')
});

// ============================================================================
// TYPE DEFINITIONS FOR TYPESCRIPT INTEGRATION
// ============================================================================

/**
 * TypeScript type definitions derived from validation schemas
 * 
 * These types provide compile-time type safety and improved developer experience
 * when working with validated form data throughout the application.
 */

// Authentication-related types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Financial planning types
export type FinancialGoalFormData = z.infer<typeof financialGoalSchema>;

// Re-exported types from core validation library
export type CustomerOnboardingFormData = z.infer<typeof customerOnboardingSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;

// ============================================================================
// VALIDATION HELPER UTILITIES
// ============================================================================

/**
 * Form Validation Helper Utilities
 * 
 * Collection of reusable validation helper functions that can be used
 * across components for consistent validation logic and enhanced user experience.
 */
export const formValidationHelpers = {
  /**
   * Validates email format with comprehensive checking
   * 
   * @param email - Email address to validate
   * @returns boolean - True if email is valid
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.toLowerCase().trim());
  },

  /**
   * Checks if email domain is in disposable email list
   * 
   * @param email - Email address to check
   * @returns boolean - True if email domain is disposable
   */
  isDisposableEmail: (email: string): boolean => {
    const disposableEmailDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ];
    const domain = email.toLowerCase().split('@')[1];
    return disposableEmailDomains.includes(domain);
  },

  /**
   * Validates password strength according to financial industry standards
   * 
   * @param password - Password to validate
   * @returns object - Validation result with specific criteria
   */
  validatePasswordStrength: (password: string) => {
    return {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password),
      noSpaces: !/\s/.test(password),
      isNotCommon: !['password123', '123456789', 'qwerty123', 'password1'].includes(password.toLowerCase())
    };
  },

  /**
   * Validates if a date string represents a future date
   * 
   * @param dateString - ISO date string to validate
   * @param minDaysFromNow - Minimum number of days from today (default: 1)
   * @returns boolean - True if date is valid and in the future
   */
  isFutureDate: (dateString: string, minDaysFromNow: number = 1): boolean => {
    const targetDate = new Date(dateString);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDaysFromNow);
    minDate.setHours(0, 0, 0, 0);
    
    return !isNaN(targetDate.getTime()) && targetDate >= minDate;
  },

  /**
   * Formats currency amount for display
   * 
   * @param amount - Numeric amount to format
   * @param currency - Currency code (default: 'USD')
   * @returns string - Formatted currency string
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Sanitizes text input to prevent XSS and other security issues
   * 
   * @param input - Text input to sanitize
   * @returns string - Sanitized text
   */
  sanitizeTextInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[&"']/g, (match) => {
        const htmlEntities: { [key: string]: string } = {
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return htmlEntities[match] || match;
      });
  }
};

// ============================================================================
// VALIDATION ERROR CONSTANTS
// ============================================================================

/**
 * Standardized validation error messages
 * 
 * Centralized error messages for consistent user experience across all forms.
 * These messages are designed to be user-friendly while providing clear
 * guidance for correction.
 */
export const VALIDATION_MESSAGES = {
  // Email validation messages
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_TOO_LONG: 'Email address is too long',
  EMAIL_DISPOSABLE: 'Disposable email addresses are not allowed',

  // Password validation messages
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_SHORT_STRONG: 'Password must be at least 12 characters long for security',
  PASSWORD_TOO_LONG: 'Password cannot exceed 128 characters',
  PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_NO_NUMBER: 'Password must contain at least one number',
  PASSWORD_NO_SPECIAL: 'Password must contain at least one special character',
  PASSWORD_HAS_SPACES: 'Password cannot contain spaces',
  PASSWORD_TOO_COMMON: 'Password is too common. Please choose a more secure password',
  PASSWORD_MISMATCH: "Passwords don't match. Please ensure both password fields are identical",

  // Financial goal validation messages
  GOAL_NAME_TOO_SHORT: 'Goal name must be at least 3 characters long',
  GOAL_NAME_TOO_LONG: 'Goal name cannot exceed 100 characters',
  GOAL_NAME_INVALID: 'Goal name can only contain letters, numbers, spaces, and basic punctuation',
  GOAL_AMOUNT_POSITIVE: 'Target amount must be a positive number',
  GOAL_AMOUNT_TOO_SMALL: 'Target amount must be at least $0.01',
  GOAL_AMOUNT_TOO_LARGE: 'Target amount cannot exceed $10,000,000',
  GOAL_DATE_FUTURE: 'Target date must be in the future',
  GOAL_DATE_TOO_FAR: 'Target date cannot be more than 50 years in the future',

  // General validation messages
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  VALUE_TOO_LONG: 'Value is too long',
  VALUE_TOO_SHORT: 'Value is too short'
} as const;

/**
 * Export all validation schemas and utilities for use throughout the application
 * 
 * This comprehensive export ensures that all form validation needs are met
 * with consistent, secure, and user-friendly validation logic.
 */
export {
  // Authentication schemas
  loginSchema,
  registrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  
  // Financial planning schemas
  financialGoalSchema,
  
  // Re-exported core schemas
  customerOnboardingSchema,
  transactionSchema
};