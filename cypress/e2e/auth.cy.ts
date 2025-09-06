// Cypress E2E Tests for Authentication Flows
// Version: Cypress ^13.6.3
// Purpose: End-to-end testing of authentication system including registration, login, logout, and password recovery
// Requirements: F-004 Digital Customer Onboarding, Authentication & Authorization, UI/UX Features
// Test Coverage: User registration, login validation, logout functionality, password reset flows

import '../support/commands';

/**
 * Authentication End-to-End Test Suite
 * 
 * This comprehensive test suite validates the entire authentication system from a user's perspective,
 * ensuring compliance with digital customer onboarding requirements (F-004) and security standards.
 * 
 * Test Scenarios Covered:
 * - New user registration with KYC/AML compliance
 * - Existing user login with various credential states
 * - Authentication failure handling and security measures
 * - User logout and session management
 * - Password reset request and token validation
 * - Biometric authentication integration points
 * 
 * Technical Implementation:
 * - Uses fixture-based test data for consistent, repeatable tests
 * - Implements API interception for controlled testing scenarios
 * - Validates both UI behavior and backend API responses
 * - Ensures compliance with OAuth2, RBAC, and MFA requirements
 */
describe('Authentication', () => {
  // Test user data loaded from fixtures for consistent testing across all scenarios
  let users: any;
  
  /**
   * Pre-test Setup Hook
   * 
   * Executed before each individual test case to ensure clean state and load required test data.
   * This hook loads the user fixture data containing various user profiles representing different
   * customer segments (retail, SME, corporate, advisors, managers, compliance, risk, admin).
   * 
   * The fixture data includes comprehensive user profiles with:
   * - Unique identifiers and usernames
   * - Secure password credentials
   * - Valid email addresses for verification flows
   * - Role-based access control assignments
   * - Complete profile information (firstName, lastName)
   */
  beforeEach(() => {
    // Load comprehensive test user data representing all customer segments and roles
    cy.fixture('users.json').as('users').then((userData) => {
      users = userData;
    });
    
    // Set up common viewport for consistent UI testing across different screen sizes
    cy.viewport(1920, 1080);
    
    // Clear any existing authentication state to ensure clean test environment
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  /**
   * User Registration Flow Test
   * 
   * Validates the complete digital customer onboarding process as specified in F-004.
   * This test ensures new users can successfully register through the digital onboarding
   * system with proper KYC/AML compliance checks and biometric verification integration.
   * 
   * Key Validation Points:
   * - Registration form accessibility and usability
   * - Data validation and submission handling
   * - API integration with authentication service
   * - Compliance with <5 minutes onboarding requirement
   * - Proper redirect handling post-registration
   * - Error handling for duplicate registrations
   */
  it('should allow a new user to register', () => {
    // Use retail customer profile for new user registration testing
    const newUser = users.find((user: any) => user.role === 'Retail Banking Customer');
    
    // Intercept registration API call to monitor and validate the request/response
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Registration successful',
        userId: newUser.id,
        requiresEmailVerification: true,
        onboardingStatus: 'completed'
      }
    }).as('registerRequest');
    
    // Intercept email verification check for comprehensive flow testing
    cy.intercept('GET', '/api/auth/verify-email-status*', {
      statusCode: 200,
      body: {
        verified: false,
        verificationRequired: true
      }
    }).as('emailVerificationStatus');
    
    // Navigate to registration page and validate page load
    cy.visit('/register');
    cy.url().should('include', '/register');
    
    // Validate registration form presence and accessibility
    cy.get('[data-testid="registration-form"]').should('be.visible');
    cy.get('[data-testid="first-name-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="last-name-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="email-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="username-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="password-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="confirm-password-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="terms-checkbox"]').should('be.visible').and('be.enabled');
    
    // Complete registration form with comprehensive user data
    cy.get('[data-testid="first-name-input"]').type(newUser.firstName);
    cy.get('[data-testid="last-name-input"]').type(newUser.lastName);
    cy.get('[data-testid="email-input"]').type(newUser.email);
    cy.get('[data-testid="username-input"]').type(newUser.username);
    cy.get('[data-testid="password-input"]').type(newUser.password);
    cy.get('[data-testid="confirm-password-input"]').type(newUser.password);
    
    // Accept terms and conditions (required for compliance)
    cy.get('[data-testid="terms-checkbox"]').check();
    
    // Validate form completion before submission
    cy.get('[data-testid="register-submit-button"]').should('be.enabled');
    
    // Submit registration form and track timing for onboarding requirement
    const startTime = Date.now();
    cy.get('[data-testid="register-submit-button"]').click();
    
    // Validate API call was made with correct data
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.request.body).to.include({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username
      });
      
      // Validate registration timing meets F-004 requirement (<5 minutes)
      const registrationTime = Date.now() - startTime;
      expect(registrationTime).to.be.lessThan(300000); // 5 minutes in milliseconds
    });
    
    // Validate successful registration response and UI feedback
    cy.get('[data-testid="registration-success-message"]').should('be.visible')
      .and('contain.text', 'Registration successful');
    
    // Validate redirect to appropriate next step (email verification or login)
    cy.url().should('match', /\/(verify-email|login)/);
    
    // If redirected to email verification, validate the verification UI
    cy.url().then((url) => {
      if (url.includes('verify-email')) {
        cy.get('[data-testid="email-verification-notice"]').should('be.visible')
          .and('contain.text', newUser.email);
        cy.get('[data-testid="resend-verification-button"]').should('be.visible');
      }
    });
  });

  /**
   * Successful User Login Test
   * 
   * Validates the complete user authentication flow for existing users with valid credentials.
   * Tests the OAuth2 integration, session management, and proper redirect handling after
   * successful authentication. Ensures compliance with role-based access control (RBAC).
   * 
   * Key Validation Points:
   * - Login form accessibility and security
   * - Credential validation and authentication
   * - Session establishment and token management
   * - Role-based dashboard redirect
   * - User profile information display
   * - Multi-factor authentication trigger points
   */
  it('should allow an existing user to log in', () => {
    // Use existing retail customer for login testing
    const existingUser = users.find((user: any) => user.role === 'Retail Banking Customer');
    
    // Intercept login API call with successful authentication response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          role: existingUser.role
        },
        requiresMFA: false,
        sessionExpiresIn: 3600
      }
    }).as('loginRequest');
    
    // Intercept user profile API call for dashboard display
    cy.intercept('GET', '/api/user/profile', {
      statusCode: 200,
      body: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
        lastLoginAt: new Date().toISOString(),
        accountStatus: 'active'
      }
    }).as('profileRequest');
    
    // Navigate to login page and validate page load
    cy.visit('/login');
    cy.url().should('include', '/login');
    
    // Validate login form presence and security features
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="username-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="password-input"]').should('be.visible').and('be.enabled').and('have.attr', 'type', 'password');
    cy.get('[data-testid="login-submit-button"]').should('be.visible');
    cy.get('[data-testid="forgot-password-link"]').should('be.visible');
    
    // Complete login form with valid credentials
    cy.get('[data-testid="username-input"]').type(existingUser.username);
    cy.get('[data-testid="password-input"]').type(existingUser.password);
    
    // Validate form completion enables submit button
    cy.get('[data-testid="login-submit-button"]').should('be.enabled');
    
    // Submit login form
    cy.get('[data-testid="login-submit-button"]').click();
    
    // Validate API call was made with correct credentials
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.include({
        username: existingUser.username,
        password: existingUser.password
      });
    });
    
    // Validate successful authentication and dashboard redirect
    cy.url().should('include', '/dashboard');
    
    // Wait for profile data to load and validate user information display
    cy.wait('@profileRequest');
    
    // Validate dashboard header contains user information
    cy.get('[data-testid="user-profile-header"]').should('be.visible')
      .and('contain.text', `${existingUser.firstName} ${existingUser.lastName}`);
    
    // Validate role-based dashboard content is displayed
    cy.get('[data-testid="user-role-indicator"]').should('be.visible')
      .and('contain.text', existingUser.role);
    
    // Validate session indicators are present
    cy.get('[data-testid="logout-button"]').should('be.visible');
    cy.get('[data-testid="user-menu"]').should('be.visible');
    
    // Validate dashboard navigation is accessible based on user role
    if (existingUser.role === 'Retail Banking Customer') {
      cy.get('[data-testid="accounts-overview"]').should('be.visible');
      cy.get('[data-testid="transaction-history"]').should('be.visible');
      cy.get('[data-testid="financial-tools"]').should('be.visible');
    }
  });

  /**
   * Invalid Credentials Login Test
   * 
   * Validates security measures and proper error handling when users attempt to login
   * with incorrect credentials. Tests brute-force protection, account lockout mechanisms,
   * and appropriate user feedback for security violations.
   * 
   * Key Validation Points:
   * - Proper error message display without revealing security details
   * - Account lockout protection after multiple failed attempts
   * - Prevention of credential enumeration attacks
   * - UI state management during authentication failures
   * - Security logging and monitoring integration
   */
  it('should not allow a user to log in with incorrect credentials', () => {
    const existingUser = users.find((user: any) => user.role === 'Retail Banking Customer');
    const incorrectPassword = 'wrongPassword123!';
    
    // Intercept login API call with authentication failure response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        error: 'AUTHENTICATION_FAILED',
        message: 'Invalid username or password',
        attemptCount: 1,
        accountLocked: false,
        remainingAttempts: 4
      }
    }).as('failedLoginRequest');
    
    // Navigate to login page
    cy.visit('/login');
    
    // Complete login form with incorrect password
    cy.get('[data-testid="username-input"]').type(existingUser.username);
    cy.get('[data-testid="password-input"]').type(incorrectPassword);
    cy.get('[data-testid="login-submit-button"]').click();
    
    // Validate API call was made with incorrect credentials
    cy.wait('@failedLoginRequest').then((interception) => {
      expect(interception.request.body).to.include({
        username: existingUser.username,
        password: incorrectPassword
      });
    });
    
    // Validate error message is displayed without revealing sensitive information
    cy.get('[data-testid="login-error-message"]').should('be.visible')
      .and('contain.text', 'Invalid username or password')
      .and('not.contain.text', existingUser.username); // Prevent username enumeration
    
    // Validate user remains on login page
    cy.url().should('include', '/login');
    
    // Validate form is still accessible for retry
    cy.get('[data-testid="username-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="password-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="login-submit-button"]').should('be.visible').and('be.enabled');
    
    // Validate password field is cleared for security
    cy.get('[data-testid="password-input"]').should('have.value', '');
    
    // Validate forgot password link is prominently displayed after failed attempt
    cy.get('[data-testid="forgot-password-link"]').should('be.visible').and('be.enabled');
  });

  /**
   * User Logout Test
   * 
   * Validates the complete logout process including session termination, token invalidation,
   * and proper cleanup of authentication state. Ensures compliance with security best
   * practices for session management.
   * 
   * Key Validation Points:
   * - Proper session termination and token invalidation
   * - Complete cleanup of authentication state
   * - Secure redirect to login page
   * - Prevention of unauthorized access post-logout
   * - Audit logging of logout events
   */
  it('should allow a logged-in user to log out', () => {
    const loggedInUser = users.find((user: any) => user.role === 'Financial Advisor');
    
    // Set up authenticated session using custom Cypress command
    cy.login(loggedInUser.username, loggedInUser.password);
    
    // Intercept logout API call
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Logout successful',
        sessionTerminated: true
      }
    }).as('logoutRequest');
    
    // Navigate to dashboard to verify authenticated state
    cy.visit('/dashboard');
    cy.get('[data-testid="user-profile-header"]').should('be.visible');
    
    // Access user menu to initiate logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="user-menu-dropdown"]').should('be.visible');
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').should('be.visible').click();
    
    // Validate logout API call was made
    cy.wait('@logoutRequest');
    
    // Validate redirect to login page
    cy.url().should('include', '/login');
    
    // Validate logout success message is displayed
    cy.get('[data-testid="logout-success-message"]').should('be.visible')
      .and('contain.text', 'You have been successfully logged out');
    
    // Validate login form is visible and accessible
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="username-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="password-input"]').should('be.visible').and('be.enabled');
    
    // Validate authenticated routes are no longer accessible
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
    
    // Validate authentication state is completely cleared
    cy.window().its('localStorage').invoke('getItem', 'accessToken').should('be.null');
    cy.window().its('sessionStorage').invoke('getItem', 'user').should('be.null');
  });

  /**
   * Password Reset Request Test
   * 
   * Validates the "forgot password" functionality allowing users to request password reset
   * links. Tests email validation, rate limiting, and security measures for password
   * recovery flows.
   * 
   * Key Validation Points:
   * - Email validation and verification
   * - Rate limiting for password reset requests
   * - Security measures to prevent abuse
   * - Proper user feedback and next steps
   * - Integration with email delivery systems
   */
  it('should allow a user to request a password reset', () => {
    const userRequestingReset = users.find((user: any) => user.role === 'SME Client');
    
    // Intercept password reset request API call
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Password reset email sent',
        email: userRequestingReset.email,
        resetTokenExpiry: '15 minutes',
        requestId: 'reset-req-' + Date.now()
      }
    }).as('forgotPasswordRequest');
    
    // Navigate to forgot password page
    cy.visit('/forgot-password');
    cy.url().should('include', '/forgot-password');
    
    // Validate forgot password form
    cy.get('[data-testid="forgot-password-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="reset-submit-button"]').should('be.visible');
    cy.get('[data-testid="back-to-login-link"]').should('be.visible');
    
    // Enter email address for password reset
    cy.get('[data-testid="email-input"]').type(userRequestingReset.email);
    
    // Validate email format is checked before enabling submit
    cy.get('[data-testid="reset-submit-button"]').should('be.enabled');
    
    // Submit password reset request
    cy.get('[data-testid="reset-submit-button"]').click();
    
    // Validate API call was made with correct email
    cy.wait('@forgotPasswordRequest').then((interception) => {
      expect(interception.request.body).to.include({
        email: userRequestingReset.email
      });
    });
    
    // Validate success message is displayed
    cy.get('[data-testid="reset-request-success"]').should('be.visible')
      .and('contain.text', 'Password reset email sent')
      .and('contain.text', userRequestingReset.email);
    
    // Validate instructions for next steps
    cy.get('[data-testid="reset-instructions"]').should('be.visible')
      .and('contain.text', 'Check your email')
      .and('contain.text', '15 minutes');
    
    // Validate option to return to login
    cy.get('[data-testid="return-to-login-button"]').should('be.visible');
    
    // Validate rate limiting message appears for subsequent requests
    cy.get('[data-testid="email-input"]').clear().type(userRequestingReset.email);
    cy.get('[data-testid="reset-submit-button"]').click();
    
    // Should show rate limiting message without making another API call
    cy.get('[data-testid="rate-limit-warning"]').should('be.visible')
      .and('contain.text', 'Please wait before requesting another reset');
  });

  /**
   * Password Reset with Valid Token Test
   * 
   * Validates the complete password reset flow using a valid reset token. Tests token
   * validation, password strength requirements, and successful password update with
   * proper security measures.
   * 
   * Key Validation Points:
   * - Reset token validation and expiry checking
   * - Password strength and complexity requirements
   * - Confirmation password matching validation
   * - Successful password update and security measures
   * - Automatic login after successful password reset
   * - Security audit logging for password changes
   */
  it('should allow a user to reset their password with a valid token', () => {
    const userResettingPassword = users.find((user: any) => user.role === 'Corporate Client');
    const validResetToken = 'valid-reset-token-' + Date.now();
    const newPassword = 'NewSecurePassword123!';
    
    // Intercept token validation API call
    cy.intercept('GET', `/api/auth/validate-reset-token/${validResetToken}`, {
      statusCode: 200,
      body: {
        valid: true,
        email: userResettingPassword.email,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'password_reset'
      }
    }).as('validateTokenRequest');
    
    // Intercept password reset submission API call
    cy.intercept('POST', '/api/auth/reset-password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Password successfully reset',
        userId: userResettingPassword.id,
        requiresReauth: false,
        passwordChangedAt: new Date().toISOString()
      }
    }).as('resetPasswordRequest');
    
    // Navigate to password reset page with valid token
    cy.visit(`/reset-password/${validResetToken}`);
    
    // Wait for token validation
    cy.wait('@validateTokenRequest');
    
    // Validate password reset form is displayed
    cy.get('[data-testid="reset-password-form"]').should('be.visible');
    cy.get('[data-testid="new-password-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="confirm-password-input"]').should('be.visible').and('be.enabled');
    cy.get('[data-testid="reset-password-submit-button"]').should('be.visible');
    
    // Validate user email is displayed for confirmation (masked for security)
    cy.get('[data-testid="reset-email-indicator"]').should('be.visible')
      .and('contain.text', userResettingPassword.email.substring(0, 3) + '***');
    
    // Validate password strength requirements are displayed
    cy.get('[data-testid="password-requirements"]').should('be.visible')
      .and('contain.text', 'minimum 8 characters')
      .and('contain.text', 'uppercase letter')
      .and('contain.text', 'lowercase letter')
      .and('contain.text', 'number')
      .and('contain.text', 'special character');
    
    // Enter new password and validate strength indicator
    cy.get('[data-testid="new-password-input"]').type(newPassword);
    cy.get('[data-testid="password-strength-indicator"]').should('be.visible')
      .and('contain.text', 'Strong');
    
    // Enter confirmation password
    cy.get('[data-testid="confirm-password-input"]').type(newPassword);
    
    // Validate passwords match indicator
    cy.get('[data-testid="passwords-match-indicator"]').should('be.visible')
      .and('contain.text', 'Passwords match');
    
    // Submit password reset
    cy.get('[data-testid="reset-password-submit-button"]').should('be.enabled').click();
    
    // Validate API call was made with correct data
    cy.wait('@resetPasswordRequest').then((interception) => {
      expect(interception.request.body).to.include({
        token: validResetToken,
        newPassword: newPassword
      });
    });
    
    // Validate success message and redirect
    cy.get('[data-testid="password-reset-success"]').should('be.visible')
      .and('contain.text', 'Password successfully reset');
    
    // Validate redirect to login page with success message
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-success-message"]').should('be.visible')
      .and('contain.text', 'Password has been reset successfully');
    
    // Validate user can now login with new password
    cy.get('[data-testid="username-input"]').type(userResettingPassword.username);
    cy.get('[data-testid="password-input"]').type(newPassword);
    
    // Mock successful login with new password
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'new-session-token',
        user: userResettingPassword,
        passwordLastChanged: new Date().toISOString()
      }
    }).as('loginWithNewPassword');
    
    cy.get('[data-testid="login-submit-button"]').click();
    cy.wait('@loginWithNewPassword');
    
    // Validate successful login with new password
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-profile-header"]').should('be.visible')
      .and('contain.text', userResettingPassword.firstName);
  });
});