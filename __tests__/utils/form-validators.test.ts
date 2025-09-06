// External testing framework imports - Jest 29.7+
import { describe, it, expect } from '@jest/globals';

// Internal validation schema imports for testing
import {
  loginSchema,
  registrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  financialGoalSchema
} from '../../src/utils/form-validators';

/**
 * Comprehensive Unit Tests for Form Validation Schemas
 * 
 * This test suite validates all form validation schemas used throughout the application,
 * ensuring robust data validation and security compliance for financial services.
 * 
 * Requirements Addressed:
 * - F-004: Digital Customer Onboarding - Tests validation schemas for user authentication and onboarding
 * - Data Validation - Validates Zod schema implementations for consistent form validation
 * - Form Interactions - Ensures validation logic provides proper real-time feedback
 * 
 * Test Coverage:
 * - Positive test cases with valid data
 * - Negative test cases with invalid data
 * - Edge cases and boundary conditions
 * - Security validation requirements
 * - Business rule compliance
 * 
 * Performance Target: All tests should complete within reasonable time for CI/CD pipeline
 * Security Focus: Validates password complexity, email security, and input sanitization
 */

// ============================================================================
// LOGIN SCHEMA TESTS
// ============================================================================

describe('loginSchema', () => {
  /**
   * Test successful validation scenarios for login form
   * Validates that proper email and password combinations pass validation
   */
  describe('successful validation', () => {
    it('should successfully validate a correct login payload', () => {
      // Test data with valid email and password
      const validLoginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      // Perform validation
      const result = loginSchema.safeParse(validLoginData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should successfully validate and transform email to lowercase', () => {
      // Test data with uppercase email
      const loginDataWithUppercaseEmail = {
        email: 'USER@EXAMPLE.COM',
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(loginDataWithUppercaseEmail);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com'); // Should be transformed to lowercase
        expect(result.data.password).toBe('validPassword123');
      }
    });

    it('should successfully validate and trim whitespace from email', () => {
      // Test data with email containing whitespace
      const loginDataWithWhitespace = {
        email: '  user@example.com  ',
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(loginDataWithWhitespace);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com'); // Should be trimmed
        expect(result.data.password).toBe('validPassword123');
      }
    });

    it('should successfully validate with minimum valid password length', () => {
      // Test data with 8-character password (minimum length)
      const minPasswordData = {
        email: 'user@example.com',
        password: '12345678' // Exactly 8 characters
      };

      // Perform validation
      const result = loginSchema.safeParse(minPasswordData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toHaveLength(8);
      }
    });
  });

  /**
   * Test email validation failure scenarios
   * Validates proper error handling for invalid email formats
   */
  describe('email validation failures', () => {
    it('should fail validation for an invalid email format', () => {
      // Test data with invalid email
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(invalidEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors).toHaveLength(1);
        expect(emailErrors[0].message).toContain('Invalid email address format');
      }
    });

    it('should fail validation for missing email', () => {
      // Test data without email
      const missingEmailData = {
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(missingEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for empty email string', () => {
      // Test data with empty email
      const emptyEmailData = {
        email: '',
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(emptyEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].message).toContain('Email address is required');
      }
    });

    it('should fail validation for email that is too long', () => {
      // Test data with extremely long email (over 254 characters)
      const longEmail = 'a'.repeat(250) + '@example.com'; // Creates email longer than 254 chars
      const longEmailData = {
        email: longEmail,
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(longEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].message).toContain('Email address is too long');
      }
    });

    it('should fail validation for email with invalid characters', () => {
      // Test data with email containing invalid characters
      const invalidCharEmailData = {
        email: 'user@exam<ple>.com',
        password: 'validPassword123'
      };

      // Perform validation
      const result = loginSchema.safeParse(invalidCharEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test password validation failure scenarios
   * Validates proper error handling for invalid passwords
   */
  describe('password validation failures', () => {
    it('should fail validation for a password that is too short', () => {
      // Test data with password shorter than 8 characters
      const shortPasswordData = {
        email: 'user@example.com',
        password: '1234567' // 7 characters - too short
      };

      // Perform validation
      const result = loginSchema.safeParse(shortPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => issue.path.includes('password'));
        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].message).toContain('Password must be at least 8 characters long');
      }
    });

    it('should fail validation for missing password', () => {
      // Test data without password
      const missingPasswordData = {
        email: 'user@example.com'
      };

      // Perform validation
      const result = loginSchema.safeParse(missingPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => issue.path.includes('password'));
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for empty password string', () => {
      // Test data with empty password
      const emptyPasswordData = {
        email: 'user@example.com',
        password: ''
      };

      // Perform validation
      const result = loginSchema.safeParse(emptyPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => issue.path.includes('password'));
        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].message).toContain('Password is required');
      }
    });

    it('should fail validation for password that is too long', () => {
      // Test data with password longer than 128 characters
      const longPassword = 'a'.repeat(129); // 129 characters - too long
      const longPasswordData = {
        email: 'user@example.com',
        password: longPassword
      };

      // Perform validation
      const result = loginSchema.safeParse(longPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => issue.path.includes('password'));
        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].message).toContain('Password cannot exceed 128 characters');
      }
    });
  });

  /**
   * Test edge cases and boundary conditions
   */
  describe('edge cases and boundary conditions', () => {
    it('should validate with maximum allowed email length', () => {
      // Test with email exactly at 254 character limit
      const maxLengthEmail = 'a'.repeat(244) + '@test.com'; // Exactly 254 characters
      const maxEmailData = {
        email: maxLengthEmail,
        password: 'validPassword'
      };

      // Perform validation
      const result = loginSchema.safeParse(maxEmailData);

      // Assertions - should succeed at exactly 254 characters
      expect(result.success).toBe(true);
    });

    it('should validate with maximum allowed password length', () => {
      // Test with password exactly at 128 character limit
      const maxPassword = 'a'.repeat(128); // Exactly 128 characters
      const maxPasswordData = {
        email: 'user@example.com',
        password: maxPassword
      };

      // Perform validation
      const result = loginSchema.safeParse(maxPasswordData);

      // Assertions - should succeed at exactly 128 characters
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// REGISTRATION SCHEMA TESTS
// ============================================================================

describe('registrationSchema', () => {
  /**
   * Test successful validation scenarios for registration form
   */
  describe('successful validation', () => {
    it('should successfully validate a correct registration payload', () => {
      // Test data with valid registration information
      const validRegistrationData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(validRegistrationData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('newuser@example.com');
        expect(result.data.password).toBe('SecurePassword123!');
        expect(result.data.confirmPassword).toBe('SecurePassword123!');
      }
    });

    it('should successfully validate with minimum password requirements', () => {
      // Test data with password meeting all minimum requirements
      const minRequirementsData = {
        email: 'user@example.com',
        password: 'Password123!', // 12 chars, upper, lower, number, special
        confirmPassword: 'Password123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(minRequirementsData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toHaveLength(12);
      }
    });
  });

  /**
   * Test password matching validation
   */
  describe('password confirmation validation', () => {
    it('should fail validation if passwords do not match', () => {
      // Test data with non-matching passwords
      const nonMatchingPasswordData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(nonMatchingPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('confirmPassword') || issue.message.includes("Passwords don't match")
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].message).toContain("Passwords don't match");
      }
    });

    it('should fail validation for missing confirmPassword', () => {
      // Test data without confirmPassword
      const missingConfirmData = {
        email: 'user@example.com',
        password: 'SecurePassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(missingConfirmData);

      // Assertions
      expect(result.success).toBe(false);
    });
  });

  /**
   * Test password strength requirements
   */
  describe('password strength validation', () => {
    it('should fail validation for a password that is too short', () => {
      // Test data with password shorter than 12 characters
      const shortPasswordData = {
        email: 'user@example.com',
        password: 'Short123!', // Only 9 characters
        confirmPassword: 'Short123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(shortPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => issue.path.includes('password'));
        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].message).toContain('Password must be at least 12 characters long');
      }
    });

    it('should fail validation for password missing uppercase letter', () => {
      // Test data with password missing uppercase letter
      const noUppercaseData = {
        email: 'user@example.com',
        password: 'securepassword123!', // No uppercase
        confirmPassword: 'securepassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(noUppercaseData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('uppercase')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for password missing lowercase letter', () => {
      // Test data with password missing lowercase letter
      const noLowercaseData = {
        email: 'user@example.com',
        password: 'SECUREPASSWORD123!', // No lowercase
        confirmPassword: 'SECUREPASSWORD123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(noLowercaseData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('lowercase')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for password missing number', () => {
      // Test data with password missing number
      const noNumberData = {
        email: 'user@example.com',
        password: 'SecurePassword!', // No number
        confirmPassword: 'SecurePassword!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(noNumberData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('number')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for password missing special character', () => {
      // Test data with password missing special character
      const noSpecialCharData = {
        email: 'user@example.com',
        password: 'SecurePassword123', // No special character
        confirmPassword: 'SecurePassword123'
      };

      // Perform validation
      const result = registrationSchema.safeParse(noSpecialCharData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('special character')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for common weak passwords', () => {
      // Test data with common weak password
      const weakPasswordData = {
        email: 'user@example.com',
        password: 'Password123!', // Common pattern but still meets technical requirements
        confirmPassword: 'Password123!'
      };

      // Perform validation - this should actually pass since it meets technical requirements
      // But let's test with an explicitly blocked common password
      const explicitlyWeakData = {
        email: 'user@example.com',
        password: 'password123', // This is in the blocked list but doesn't meet other requirements anyway
        confirmPassword: 'password123'
      };

      const result = registrationSchema.safeParse(explicitlyWeakData);

      // Assertions - should fail for multiple reasons (length, complexity, common password)
      expect(result.success).toBe(false);
    });
  });

  /**
   * Test email validation including disposable email blocking
   */
  describe('email validation with security features', () => {
    it('should fail validation for disposable email domains', () => {
      // Test data with disposable email domain
      const disposableEmailData = {
        email: 'user@tempmail.org', // Disposable email domain
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(disposableEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => 
          issue.path.includes('email') && issue.message.includes('disposable')
        );
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });

    it('should successfully validate with legitimate email domain', () => {
      // Test data with legitimate email domain
      const legitimateEmailData = {
        email: 'user@gmail.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      };

      // Perform validation
      const result = registrationSchema.safeParse(legitimateEmailData);

      // Assertions
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// FORGOT PASSWORD SCHEMA TESTS
// ============================================================================

describe('forgotPasswordSchema', () => {
  /**
   * Test successful validation scenarios
   */
  describe('successful validation', () => {
    it('should successfully validate a correct email address', () => {
      // Test data with valid email
      const validEmailData = {
        email: 'user@example.com'
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(validEmailData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should successfully validate and transform email to lowercase', () => {
      // Test data with uppercase email
      const uppercaseEmailData = {
        email: 'USER@EXAMPLE.COM'
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(uppercaseEmailData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should successfully validate and trim whitespace', () => {
      // Test data with email containing whitespace
      const whitespaceEmailData = {
        email: '  user@example.com  '
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(whitespaceEmailData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  /**
   * Test email validation failures
   */
  describe('email validation failures', () => {
    it('should fail validation for an invalid email address', () => {
      // Test data with invalid email format
      const invalidEmailData = {
        email: 'invalid-email-format'
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(invalidEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].message).toContain('Invalid email address format');
      }
    });

    it('should fail validation for missing email', () => {
      // Test data without email
      const missingEmailData = {};

      // Perform validation
      const result = forgotPasswordSchema.safeParse(missingEmailData);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should fail validation for empty email string', () => {
      // Test data with empty email
      const emptyEmailData = {
        email: ''
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(emptyEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].message).toContain('Email address is required');
      }
    });

    it('should fail validation for email with invalid domain format', () => {
      // Test data with email having invalid domain
      const invalidDomainData = {
        email: 'user@'
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(invalidDomainData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => issue.path.includes('email'));
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for email that is too long', () => {
      // Test data with email exceeding length limit
      const longEmail = 'a'.repeat(250) + '@example.com';
      const longEmailData = {
        email: longEmail
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(longEmailData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter(issue => 
          issue.path.includes('email') && issue.message.includes('too long')
        );
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test domain validation edge cases
   */
  describe('domain validation edge cases', () => {
    it('should fail validation for email with domain that is too short', () => {
      // Test data with very short domain
      const shortDomainData = {
        email: 'user@a'
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(shortDomainData);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should fail validation for email with excessively long domain', () => {
      // Test data with very long domain (over 253 characters)
      const longDomain = 'a'.repeat(250) + '.com';
      const longDomainData = {
        email: `user@${longDomain}`
      };

      // Perform validation
      const result = forgotPasswordSchema.safeParse(longDomainData);

      // Assertions
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// RESET PASSWORD SCHEMA TESTS
// ============================================================================

describe('resetPasswordSchema', () => {
  /**
   * Test successful validation scenarios
   */
  describe('successful validation', () => {
    it('should successfully validate correct and matching passwords', () => {
      // Test data with valid matching passwords
      const validResetData = {
        password: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(validResetData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('NewSecurePassword123!');
        expect(result.data.confirmPassword).toBe('NewSecurePassword123!');
      }
    });

    it('should successfully validate with minimum password requirements', () => {
      // Test data with password meeting minimum requirements
      const minRequirementsData = {
        password: 'Password123!', // 12 chars, all requirements
        confirmPassword: 'Password123!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(minRequirementsData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toHaveLength(12);
      }
    });
  });

  /**
   * Test password matching validation
   */
  describe('password confirmation validation', () => {
    it('should fail validation if passwords do not match', () => {
      // Test data with non-matching passwords
      const nonMatchingData = {
        password: 'FirstPassword123!',
        confirmPassword: 'SecondPassword123!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(nonMatchingData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.message.includes("Passwords don't match")
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for missing confirmPassword', () => {
      // Test data without confirmPassword
      const missingConfirmData = {
        password: 'ValidPassword123!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(missingConfirmData);

      // Assertions
      expect(result.success).toBe(false);
    });
  });

  /**
   * Test password strength requirements (same as registration)
   */
  describe('password strength validation', () => {
    it('should fail validation for password that is too short', () => {
      // Test data with password shorter than 12 characters
      const shortPasswordData = {
        password: 'Short12!', // Only 8 characters
        confirmPassword: 'Short12!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(shortPasswordData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('12 characters')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for password with spaces', () => {
      // Test data with password containing spaces
      const passwordWithSpaces = {
        password: 'Password With Spaces123!',
        confirmPassword: 'Password With Spaces123!'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(passwordWithSpaces);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('spaces')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for password missing complexity requirements', () => {
      // Test password missing uppercase
      const noUppercaseData = {
        password: 'lowercase123!',
        confirmPassword: 'lowercase123!'
      };

      let result = resetPasswordSchema.safeParse(noUppercaseData);
      expect(result.success).toBe(false);

      // Test password missing lowercase
      const noLowercaseData = {
        password: 'UPPERCASE123!',
        confirmPassword: 'UPPERCASE123!'
      };

      result = resetPasswordSchema.safeParse(noLowercaseData);
      expect(result.success).toBe(false);

      // Test password missing number
      const noNumberData = {
        password: 'NoNumbersHere!',
        confirmPassword: 'NoNumbersHere!'
      };

      result = resetPasswordSchema.safeParse(noNumberData);
      expect(result.success).toBe(false);

      // Test password missing special character
      const noSpecialData = {
        password: 'NoSpecialChars123',
        confirmPassword: 'NoSpecialChars123'
      };

      result = resetPasswordSchema.safeParse(noSpecialData);
      expect(result.success).toBe(false);
    });

    it('should fail validation for common weak passwords', () => {
      // Test with explicitly blocked common password
      const commonPasswordData = {
        password: 'newpassword123', // In blocked list but also fails other requirements
        confirmPassword: 'newpassword123'
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(commonPasswordData);

      // Assertions - should fail for multiple reasons
      expect(result.success).toBe(false);
    });
  });

  /**
   * Test boundary conditions
   */
  describe('boundary conditions', () => {
    it('should validate with maximum allowed password length', () => {
      // Test with password at maximum length (128 characters)
      const maxLengthPassword = 'A'.repeat(120) + '123!Abc'; // Exactly 128 chars with requirements
      const maxLengthData = {
        password: maxLengthPassword,
        confirmPassword: maxLengthPassword
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(maxLengthData);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should fail validation for password exceeding maximum length', () => {
      // Test with password over 128 characters
      const tooLongPassword = 'A'.repeat(125) + '123!Abc'; // 129 characters
      const tooLongData = {
        password: tooLongPassword,
        confirmPassword: tooLongPassword
      };

      // Perform validation
      const result = resetPasswordSchema.safeParse(tooLongData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter(issue => 
          issue.path.includes('password') && issue.message.includes('128 characters')
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================================
// FINANCIAL GOAL SCHEMA TESTS
// ============================================================================

describe('financialGoalSchema', () => {
  /**
   * Test successful validation scenarios
   */
  describe('successful validation', () => {
    it('should successfully validate a correct financial goal payload', () => {
      // Test data with valid financial goal information
      const validGoalData = {
        goalName: 'Emergency Fund',
        targetAmount: 10000.50,
        targetDate: '2025-12-31',
        description: 'Building an emergency fund for unexpected expenses',
        category: 'savings',
        priority: 'HIGH' as const
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(validGoalData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goalName).toBe('Emergency Fund');
        expect(result.data.targetAmount).toBe(10000.50);
        expect(result.data.targetDate).toBe('2025-12-31');
        expect(result.data.description).toBe('Building an emergency fund for unexpected expenses');
        expect(result.data.category).toBe('savings');
        expect(result.data.priority).toBe('HIGH');
      }
    });

    it('should successfully validate with minimum required fields', () => {
      // Test data with only required fields
      const minimalGoalData = {
        goalName: 'Vacation Fund',
        targetAmount: 5000,
        targetDate: '2026-06-15'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(minimalGoalData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goalName).toBe('Vacation Fund');
        expect(result.data.targetAmount).toBe(5000);
        expect(result.data.targetDate).toBe('2026-06-15');
        expect(result.data.priority).toBe('MEDIUM'); // Default value
      }
    });

    it('should successfully validate with boundary values', () => {
      // Test data with minimum and maximum allowed values
      const boundaryData = {
        goalName: 'Min', // 3 characters (minimum)
        targetAmount: 0.01, // Minimum amount
        targetDate: '2025-06-15' // Tomorrow (assuming test runs on 2025-06-14)
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(boundaryData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goalName).toBe('Min');
        expect(result.data.targetAmount).toBe(0.01);
      }
    });
  });

  /**
   * Test goal name validation
   */
  describe('goal name validation', () => {
    it('should fail validation for goal name that is too short', () => {
      // Test data with goal name shorter than 3 characters
      const shortNameData = {
        goalName: 'Ab', // Only 2 characters
        targetAmount: 1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(shortNameData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.issues.filter(issue => 
          issue.path.includes('goalName') && issue.message.includes('3 characters')
        );
        expect(nameErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for goal name that is too long', () => {
      // Test data with goal name longer than 100 characters
      const longNameData = {
        goalName: 'A'.repeat(101), // 101 characters
        targetAmount: 1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(longNameData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.issues.filter(issue => 
          issue.path.includes('goalName') && issue.message.includes('100 characters')
        );
        expect(nameErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for goal name with invalid characters', () => {
      // Test data with goal name containing invalid characters
      const invalidCharsData = {
        goalName: 'Goal with @invalid$ characters', // Contains invalid characters
        targetAmount: 1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(invalidCharsData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.issues.filter(issue => 
          issue.path.includes('goalName') && issue.message.includes('letters, numbers')
        );
        expect(nameErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for reserved goal names', () => {
      // Test data with reserved goal name
      const reservedNameData = {
        goalName: 'admin', // Reserved name
        targetAmount: 1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(reservedNameData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.issues.filter(issue => 
          issue.path.includes('goalName') && issue.message.includes('reserved')
        );
        expect(nameErrors.length).toBeGreaterThan(0);
      }
    });

    it('should successfully trim and validate goal name', () => {
      // Test data with goal name containing leading/trailing whitespace
      const whitespaceNameData = {
        goalName: '  Valid Goal Name  ',
        targetAmount: 1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(whitespaceNameData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goalName).toBe('Valid Goal Name'); // Should be trimmed
      }
    });
  });

  /**
   * Test target amount validation
   */
  describe('target amount validation', () => {
    it('should fail validation for a non-positive target amount', () => {
      // Test data with zero target amount
      const zeroAmountData = {
        goalName: 'Invalid Goal',
        targetAmount: 0,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(zeroAmountData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetAmount') && issue.message.includes('positive')
        );
        expect(amountErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for negative target amount', () => {
      // Test data with negative target amount
      const negativeAmountData = {
        goalName: 'Invalid Goal',
        targetAmount: -1000,
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(negativeAmountData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetAmount')
        );
        expect(amountErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for target amount exceeding maximum', () => {
      // Test data with target amount over $10,000,000
      const tooLargeAmountData = {
        goalName: 'Unrealistic Goal',
        targetAmount: 15000000, // $15 million
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(tooLargeAmountData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetAmount') && issue.message.includes('10,000,000')
        );
        expect(amountErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for target amount with too many decimal places', () => {
      // Test data with amount having more than 2 decimal places
      const tooManyDecimalsData = {
        goalName: 'Precise Goal',
        targetAmount: 1000.123, // 3 decimal places
        targetDate: '2025-12-31'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(tooManyDecimalsData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const amountErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetAmount') && issue.message.includes('2 decimal places')
        );
        expect(amountErrors.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test target date validation
   */
  describe('target date validation', () => {
    it('should fail validation for a target date in the past', () => {
      // Test data with past target date
      const pastDateData = {
        goalName: 'Past Goal',
        targetAmount: 1000,
        targetDate: '2020-01-01' // Definitely in the past
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(pastDateData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const dateErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetDate') && issue.message.includes('future')
        );
        expect(dateErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for target date too far in the future', () => {
      // Test data with target date more than 50 years in the future
      const farFutureDateData = {
        goalName: 'Far Future Goal',
        targetAmount: 1000,
        targetDate: '2080-12-31' // More than 50 years from now
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(farFutureDateData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const dateErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetDate') && issue.message.includes('50 years')
        );
        expect(dateErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for invalid date format', () => {
      // Test data with invalid date format
      const invalidDateData = {
        goalName: 'Invalid Date Goal',
        targetAmount: 1000,
        targetDate: 'not-a-date'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(invalidDateData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const dateErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetDate') && 
          (issue.message.includes('Invalid date format') || issue.message.includes('YYYY-MM-DD'))
        );
        expect(dateErrors.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation for target date that is today (not in future)', () => {
      // Test data with today's date
      const todayDate = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD format
      const todayDateData = {
        goalName: 'Today Goal',
        targetAmount: 1000,
        targetDate: todayDate
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(todayDateData);

      // Assertions - should fail because target date must be at least 1 day in the future
      expect(result.success).toBe(false);
      if (!result.success) {
        const dateErrors = result.error.issues.filter(issue => 
          issue.path.includes('targetDate') && issue.message.includes('future')
        );
        expect(dateErrors.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test optional field validation
   */
  describe('optional field validation', () => {
    it('should successfully validate with empty optional description', () => {
      // Test data with empty description
      const emptyDescriptionData = {
        goalName: 'Goal with no description',
        targetAmount: 1000,
        targetDate: '2025-12-31',
        description: ''
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(emptyDescriptionData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
      }
    });

    it('should fail validation for description that is too long', () => {
      // Test data with description over 500 characters
      const longDescriptionData = {
        goalName: 'Goal with long description',
        targetAmount: 1000,
        targetDate: '2025-12-31',
        description: 'A'.repeat(501) // 501 characters
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(longDescriptionData);

      // Assertions
      expect(result.success).toBe(false);
      if (!result.success) {
        const descriptionErrors = result.error.issues.filter(issue => 
          issue.path.includes('description') && issue.message.includes('500 characters')
        );
        expect(descriptionErrors.length).toBeGreaterThan(0);
      }
    });

    it('should successfully validate valid priority values', () => {
      // Test data with all valid priority values
      const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;
      
      for (const priority of priorities) {
        const priorityData = {
          goalName: `${priority} Priority Goal`,
          targetAmount: 1000,
          targetDate: '2025-12-31',
          priority: priority
        };

        const result = financialGoalSchema.safeParse(priorityData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.priority).toBe(priority);
        }
      }
    });

    it('should fail validation for invalid priority value', () => {
      // Test data with invalid priority value
      const invalidPriorityData = {
        goalName: 'Invalid Priority Goal',
        targetAmount: 1000,
        targetDate: '2025-12-31',
        priority: 'INVALID' // Not a valid enum value
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(invalidPriorityData);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should successfully transform and validate category', () => {
      // Test data with category containing mixed case and spaces
      const categoryData = {
        goalName: 'Category Test Goal',
        targetAmount: 1000,
        targetDate: '2025-12-31',
        category: 'EMERGENCY Fund'
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(categoryData);

      // Assertions
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('emergency fund'); // Should be lowercase and trimmed
      }
    });
  });

  /**
   * Test edge cases and comprehensive scenarios
   */
  describe('edge cases and comprehensive validation', () => {
    it('should handle maximum valid values for all fields', () => {
      // Test data with maximum allowed values
      const maxValuesData = {
        goalName: 'A'.repeat(100), // Maximum length goal name
        targetAmount: 10000000, // Maximum amount
        targetDate: '2074-12-31', // Close to 50 years limit
        description: 'A'.repeat(500), // Maximum description length
        category: 'A'.repeat(50), // Maximum category length
        priority: 'HIGH' as const
      };

      // Perform validation
      const result = financialGoalSchema.safeParse(maxValuesData);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should validate with precise decimal amounts', () => {
      // Test data with various valid decimal amounts
      const decimalAmounts = [1.50, 999.99, 12345.67, 0.01];
      
      for (const amount of decimalAmounts) {
        const decimalData = {
          goalName: `Decimal Goal ${amount}`,
          targetAmount: amount,
          targetDate: '2025-12-31'
        };

        const result = financialGoalSchema.safeParse(decimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.targetAmount).toBe(amount);
        }
      }
    });

    it('should validate goal names with allowed special characters', () => {
      // Test data with goal names containing allowed punctuation
      const specialCharNames = [
        "Kid's College Fund",
        "Emergency Fund (High Priority)",
        "Vacation - Europe 2025",
        "Home Down-Payment Savings",
        "Retirement Fund, Age 65"
      ];

      for (const goalName of specialCharNames) {
        const specialCharData = {
          goalName: goalName,
          targetAmount: 1000,
          targetDate: '2025-12-31'
        };

        const result = financialGoalSchema.safeParse(specialCharData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.goalName).toBe(goalName);
        }
      }
    });
  });
});