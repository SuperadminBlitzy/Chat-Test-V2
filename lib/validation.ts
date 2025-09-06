import { z } from 'zod'; // v3.22+

/**
 * Customer Onboarding Validation Schema
 * 
 * This schema implements validation rules for the F-004: Digital Customer Onboarding feature,
 * ensuring compliance with KYC/AML requirements and regulatory standards.
 * 
 * Requirements addressed:
 * - Digital identity verification (F-004-RQ-001)
 * - KYC/AML compliance checks (F-004-RQ-002)
 * - Document validation for regulatory compliance
 * - Data integrity for financial services onboarding
 * 
 * Performance target: <5 minutes average onboarding time with 99% accuracy
 */
export const customerOnboardingSchema = z.object({
  personalInfo: z.object({
    // First name validation - minimum 2 characters for valid identity verification
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim()),

    // Last name validation - minimum 2 characters for valid identity verification
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim()),

    // Date of birth validation - must be in the past and minimum age requirements
    dateOfBirth: z.string()
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          return birthDate < today;
        },
        'Date of birth must be in the past'
      )
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
          }
          return age >= 18;
        },
        'Customer must be at least 18 years old'
      )
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age <= 120;
        },
        'Please enter a valid date of birth'
      ),

    // Email validation for communication and account verification
    email: z.string()
      .email('Invalid email address')
      .max(254, 'Email address is too long')
      .toLowerCase()
      .refine(
        (email) => {
          // Additional email validation for financial services compliance
          const disposableEmailDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
          const domain = email.split('@')[1];
          return !disposableEmailDomains.includes(domain);
        },
        'Disposable email addresses are not allowed'
      ),

    // Phone number validation - international format support for global customers
    phone: z.string()
      .regex(/^(\+?[1-9]\d{0,3})?[\s.-]?(\(?\d{1,4}\)?[\s.-]?)?[\d\s.-]{4,14}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .transform(val => val.replace(/\s/g, '')),

    // Nationality validation for regulatory compliance and sanctions screening
    nationality: z.string()
      .min(2, 'Nationality is required')
      .max(100, 'Nationality name is too long')
      .regex(/^[a-zA-Z\s]+$/, 'Nationality can only contain letters and spaces')
      .transform(val => val.trim())
  }),

  address: z.object({
    // Street address validation for identity verification
    street: z.string()
      .min(5, 'Street address must be at least 5 characters')
      .max(200, 'Street address cannot exceed 200 characters')
      .regex(/^[a-zA-Z0-9\s,.-]+$/, 'Street address contains invalid characters')
      .transform(val => val.trim()),

    // City validation
    city: z.string()
      .min(2, 'City is required')
      .max(100, 'City name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'City can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim()),

    // State/Province validation
    state: z.string()
      .min(2, 'State/Province is required')
      .max(100, 'State/Province name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'State/Province can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim()),

    // Postal/Zip code validation - flexible format for international addresses
    zipCode: z.string()
      .min(3, 'Postal/Zip code must be at least 3 characters')
      .max(12, 'Postal/Zip code cannot exceed 12 characters')
      .regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid postal/zip code format')
      .transform(val => val.trim().toUpperCase()),

    // Country validation for regulatory compliance
    country: z.string()
      .min(2, 'Country is required')
      .max(100, 'Country name is too long')
      .regex(/^[a-zA-Z\s]+$/, 'Country can only contain letters and spaces')
      .transform(val => val.trim())
  }),

  // Document validation for KYC/AML compliance
  documents: z.array(z.object({
    // Document type - restricted to acceptable government-issued IDs
    type: z.enum(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'], {
      errorMap: () => ({ message: 'Document type must be Passport, Driver\'s License, or National ID' })
    }),

    // Document number validation
    number: z.string()
      .min(5, 'Document number must be at least 5 characters')
      .max(50, 'Document number cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Document number can only contain letters and numbers')
      .transform(val => val.trim().toUpperCase()),

    // Expiry date validation - document must not be expired
    expiryDate: z.string()
      .refine(
        (date) => {
          const expiryDate = new Date(date);
          const today = new Date();
          // Add 30-day buffer for processing time
          const bufferDate = new Date(today);
          bufferDate.setDate(today.getDate() + 30);
          return expiryDate > bufferDate;
        },
        'Document must be valid for at least 30 days from today'
      )
      .refine(
        (date) => {
          const expiryDate = new Date(date);
          const today = new Date();
          const yearsDiff = expiryDate.getFullYear() - today.getFullYear();
          return yearsDiff <= 20;
        },
        'Document expiry date seems unrealistic'
      ),

    // Optional file upload for document scanning
    file: z.instanceof(File, { message: 'Invalid file format' })
      .optional()
      .refine(
        (file) => {
          if (!file) return true;
          const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
          return allowedTypes.includes(file.type);
        },
        'File must be JPEG, PNG, or PDF format'
      )
      .refine(
        (file) => {
          if (!file) return true;
          const maxSize = 10 * 1024 * 1024; // 10MB
          return file.size <= maxSize;
        },
        'File size must not exceed 10MB'
      ),

    // Document issuing country for additional validation
    issuingCountry: z.string()
      .min(2, 'Issuing country is required')
      .max(100, 'Country name is too long')
      .regex(/^[a-zA-Z\s]+$/, 'Country can only contain letters and spaces')
      .transform(val => val.trim())
      .optional()
  }))
  .min(1, 'At least one identity document is required')
  .max(3, 'Maximum 3 documents allowed')
  .refine(
    (documents) => {
      // Ensure no duplicate document types
      const types = documents.map(doc => doc.type);
      return new Set(types).size === types.length;
    },
    'Duplicate document types are not allowed'
  ),

  // Terms and conditions acceptance for legal compliance
  termsAccepted: z.boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),

  // Privacy policy acceptance for GDPR compliance
  privacyPolicyAccepted: z.boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),

  // Marketing consent (optional but trackable for compliance)
  marketingConsent: z.boolean().optional().default(false)
});

/**
 * Financial Transaction Validation Schema
 * 
 * This schema validates financial transaction data to ensure:
 * - Regulatory compliance with financial transaction requirements
 * - Data integrity for monetary transfers
 * - Proper validation of account identifiers
 * - Support for scheduled and recurring transactions
 * 
 * Supports real-time transaction monitoring and fraud detection integration.
 */
export const transactionSchema = z.object({
  // Transaction amount validation - must be positive and within limits
  amount: z.number()
    .positive('Transaction amount must be positive')
    .min(0.01, 'Minimum transaction amount is 0.01')
    .max(1000000, 'Maximum transaction amount is 1,000,000')
    .refine(
      (amount) => {
        // Validate decimal places for currency precision
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      },
      'Amount cannot have more than 2 decimal places'
    ),

  // Currency code validation - ISO 4217 standard
  currency: z.string()
    .length(3, 'Currency code must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters only')
    .refine(
      (currency) => {
        // Major currencies supported - can be extended
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
        return supportedCurrencies.includes(currency);
      },
      'Currency is not supported'
    ),

  // Source account validation - must be valid UUID
  fromAccount: z.string()
    .uuid('Source account ID must be a valid UUID')
    .refine(
      (accountId) => {
        // Additional validation can be added for account existence
        return accountId.length === 36;
      },
      'Invalid source account format'
    ),

  // Destination account validation - must be valid UUID and different from source
  toAccount: z.string()
    .uuid('Destination account ID must be a valid UUID')
    .refine(
      (accountId) => {
        // Additional validation can be added for account existence
        return accountId.length === 36;
      },
      'Invalid destination account format'
    ),

  // Transaction description for audit trail and user reference
  description: z.string()
    .max(255, 'Description cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s.,;:!?'"()\-_@#$%&*+=<>[\]{}|\\\/]+$/, 'Description contains invalid characters')
    .transform(val => val.trim())
    .optional(),

  // Transaction category for analytics and budgeting
  category: z.string()
    .max(50, 'Category cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s_-]+$/, 'Category can only contain letters, spaces, underscores, and hyphens')
    .transform(val => val.trim().toLowerCase())
    .optional(),

  // Scheduled transaction date (optional for immediate transactions)
  scheduledDate: z.string()
    .refine(
      (date) => {
        if (!date) return true;
        const scheduledDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return scheduledDate >= today;
      },
      'Scheduled date cannot be in the past'
    )
    .refine(
      (date) => {
        if (!date) return true;
        const scheduledDate = new Date(date);
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);
        return scheduledDate <= maxFutureDate;
      },
      'Scheduled date cannot be more than 5 years in the future'
    )
    .optional(),

  // Recurring transaction configuration
  recurring: z.object({
    // Enable/disable recurring transactions
    enabled: z.boolean(),

    // Frequency of recurring transactions
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
      errorMap: () => ({ message: 'Frequency must be Daily, Weekly, Monthly, or Yearly' })
    }).optional(),

    // End date for recurring transactions
    endDate: z.string()
      .refine(
        (date) => {
          if (!date) return true;
          const endDate = new Date(date);
          const today = new Date();
          return endDate > today;
        },
        'End date must be in the future'
      )
      .refine(
        (date) => {
          if (!date) return true;
          const endDate = new Date(date);
          const maxEndDate = new Date();
          maxEndDate.setFullYear(maxEndDate.getFullYear() + 10);
          return endDate <= maxEndDate;
        },
        'End date cannot be more than 10 years in the future'
      )
      .optional(),

    // Maximum number of occurrences (alternative to end date)
    maxOccurrences: z.number()
      .int('Maximum occurrences must be a whole number')
      .min(1, 'Maximum occurrences must be at least 1')
      .max(1000, 'Maximum occurrences cannot exceed 1000')
      .optional()
  })
  .optional()
  .refine(
    (recurring) => {
      if (!recurring || !recurring.enabled) return true;
      // If recurring is enabled, frequency must be specified
      return recurring.frequency !== undefined;
    },
    'Frequency is required when recurring is enabled'
  )
  .refine(
    (recurring) => {
      if (!recurring || !recurring.enabled) return true;
      // Either end date or max occurrences should be specified
      return recurring.endDate !== undefined || recurring.maxOccurrences !== undefined;
    },
    'Either end date or maximum occurrences must be specified for recurring transactions'
  ),

  // Transaction reference number for external systems
  referenceNumber: z.string()
    .max(100, 'Reference number cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Reference number can only contain letters, numbers, hyphens, and underscores')
    .optional(),

  // Additional metadata for transaction processing
  metadata: z.record(z.string(), z.unknown())
    .optional()
    .refine(
      (metadata) => {
        if (!metadata) return true;
        return Object.keys(metadata).length <= 10;
      },
      'Metadata cannot have more than 10 fields'
    )
})
.refine(
  (transaction) => {
    // Ensure source and destination accounts are different
    return transaction.fromAccount !== transaction.toAccount;
  },
  'Source and destination accounts must be different'
);

/**
 * Type definitions for TypeScript integration
 */
export type CustomerOnboardingData = z.infer<typeof customerOnboardingSchema>;
export type TransactionData = z.infer<typeof transactionSchema>;

/**
 * Validation helper functions for reusable validation logic
 */
export const validationHelpers = {
  /**
   * Validates if a date string represents a valid age
   */
  isValidAge: (dateString: string, minAge: number = 18, maxAge: number = 120): boolean => {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1;
    }
    
    return actualAge >= minAge && actualAge <= maxAge;
  },

  /**
   * Validates currency code against supported currencies
   */
  isSupportedCurrency: (currencyCode: string): boolean => {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
    return supportedCurrencies.includes(currencyCode.toUpperCase());
  },

  /**
   * Validates document expiry with buffer period
   */
  isDocumentValid: (expiryDate: string, bufferDays: number = 30): boolean => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const buffer = new Date(today);
    buffer.setDate(today.getDate() + bufferDays);
    
    return expiry > buffer;
  }
};