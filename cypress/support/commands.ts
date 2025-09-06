/// <reference types="cypress" />

// cypress v13.6+ - Custom commands for financial services platform E2E testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to authenticate users in the financial services platform
       * Supports both direct credentials and fixture-based authentication
       * Handles clearing session state and verifying successful login
       * 
       * @param credentials - Either an object with username/password or fixture name string
       * @example cy.login({ username: 'admin@company.com', password: 'securePass123' })
       * @example cy.login('validUser') // loads from cypress/fixtures/validUser.json
       */
      login(credentials: { username: string; password: string } | string): Chainable<void>;

      /**
       * Custom command to select elements using data-cy attribute for resilient testing
       * Follows testing best practices by using data attributes instead of CSS selectors
       * 
       * @param selector - The value of the data-cy attribute
       * @returns Chainable element for further commands
       * @example cy.dataCy('login-button').click()
       * @example cy.dataCy('username-input').type('user@example.com')
       */
      dataCy(selector: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to intercept and mock API calls for isolated frontend testing
       * Critical for testing without backend dependencies in CI/CD pipeline
       * 
       * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
       * @param url - API endpoint URL or pattern to intercept
       * @param response - Mock response object or status code
       * @example cy.interceptAPI('POST', '/api/auth/login', { token: 'mock-jwt-token' })
       * @example cy.interceptAPI('GET', '/api/customer/profile', { fixture: 'customerProfile.json' })
       */
      interceptAPI(method: string, url: string, response: any): Chainable<void>;

      /**
       * Custom command to complete the multi-step digital customer onboarding process
       * Implements the F-004 Digital Customer Onboarding feature requirements
       * Handles KYC/AML compliance, document verification, and biometric authentication
       * 
       * @param onboardingData - Complete customer data for onboarding process
       * @example cy.completeOnboarding({ personalInfo: {...}, documents: {...}, biometric: true })
       */
      completeOnboarding(onboardingData: {
        personalInfo: {
          firstName: string;
          lastName: string;
          dateOfBirth: string;
          address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
          };
          phone: string;
          email: string;
          ssn?: string;
        };
        documents: {
          idType: 'passport' | 'driversLicense' | 'nationalId';
          idNumber: string;
          frontImage?: string;
          backImage?: string;
          proofOfAddress?: string;
        };
        biometric: {
          enabled: boolean;
          selfieImage?: string;
        };
        riskProfile: {
          investmentExperience: 'none' | 'basic' | 'intermediate' | 'advanced';
          riskTolerance: 'conservative' | 'moderate' | 'aggressive';
          annualIncome: string;
          liquidNetWorth: string;
        };
      }): Chainable<void>;
    }
  }
}

/**
 * Custom login command for financial services platform
 * Handles authentication with session management and verification
 * Supports both direct credentials and fixture-based user data
 */
Cypress.Commands.add('login', (credentials: { username: string; password: string } | string) => {
  // Clear any existing session state to ensure clean authentication
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
  
  // Navigate to login page
  cy.visit('/auth/login');
  
  // Wait for login form to be fully loaded
  cy.dataCy('login-form').should('be.visible');
  
  let username: string;
  let password: string;
  
  // Handle both direct credentials and fixture-based authentication
  if (typeof credentials === 'string') {
    // Load user credentials from fixture file
    cy.fixture(credentials).then((userData) => {
      username = userData.username;
      password = userData.password;
      
      // Perform login with fixture data
      performLogin(username, password);
    });
  } else {
    // Use directly provided credentials
    username = credentials.username;
    password = credentials.password;
    
    // Perform login with direct credentials
    performLogin(username, password);
  }
  
  /**
   * Internal helper function to perform the actual login process
   * Handles form interaction and post-login verification
   */
  function performLogin(user: string, pass: string): void {
    // Enter username with validation
    cy.dataCy('username-input')
      .should('be.visible')
      .clear()
      .type(user)
      .should('have.value', user);
    
    // Enter password with security considerations
    cy.dataCy('password-input')
      .should('be.visible')
      .clear()
      .type(pass, { log: false }) // Don't log password for security
      .should('have.value', pass);
    
    // Handle potential CAPTCHA or additional security measures
    cy.get('body').then($body => {
      if ($body.find('[data-cy="captcha-container"]').length > 0) {
        // Skip CAPTCHA in test environment
        cy.dataCy('captcha-skip').click();
      }
    });
    
    // Submit login form
    cy.dataCy('login-submit-button')
      .should('be.enabled')
      .click();
    
    // Wait for authentication to complete
    cy.dataCy('login-loading').should('not.exist');
    
    // Verify successful login by checking URL change and dashboard presence
    cy.url().should('include', '/dashboard');
    
    // Verify user is properly authenticated
    cy.dataCy('user-profile-menu').should('be.visible');
    cy.dataCy('welcome-message').should('contain.text', 'Welcome');
    
    // Verify session token exists
    cy.window().its('localStorage').invoke('getItem', 'authToken').should('exist');
    
    // Additional verification for financial services security
    cy.dataCy('security-indicator').should('have.class', 'secure-session');
  }
});

/**
 * Custom command for selecting elements using data-cy attributes
 * Provides more resilient test selectors compared to CSS classes or IDs
 * Following Cypress best practices for maintainable test automation
 */
Cypress.Commands.add('dataCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

/**
 * Custom API interception command for isolated frontend testing
 * Essential for CI/CD pipeline integration where backend may not be available
 * Supports both static responses and fixture-based mocking
 */
Cypress.Commands.add('interceptAPI', (method: string, url: string, response: any) => {
  // Create a unique alias for this interception
  const aliasName = `api-${method.toLowerCase()}-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  // Set up the API interception with comprehensive options
  cy.intercept({
    method: method.toUpperCase(),
    url: url
  }, (req) => {
    // Log request details for debugging (in non-production)
    if (!Cypress.env('hideAPILogs')) {
      cy.log(`API Intercepted: ${method.toUpperCase()} ${url}`);
    }
    
    // Add realistic delay to simulate network latency
    req.reply((res) => {
      // Simulate realistic API response time (100-500ms)
      const delay = Cypress.env('apiDelay') || Math.floor(Math.random() * 400) + 100;
      
      setTimeout(() => {
        res.send(response);
      }, delay);
    });
  }).as(aliasName);
  
  // Return the alias for potential chaining
  return cy.get(`@${aliasName}`);
});

/**
 * Custom command for completing the digital customer onboarding process
 * Implements F-004 Digital Customer Onboarding feature requirements
 * Handles multi-step process with KYC/AML compliance and biometric verification
 */
Cypress.Commands.add('completeOnboarding', (onboardingData) => {
  // Navigate to onboarding start page
  cy.visit('/onboarding/start');
  
  // Wait for onboarding process to initialize
  cy.dataCy('onboarding-container').should('be.visible');
  cy.dataCy('onboarding-progress').should('be.visible');
  
  // Step 1: Personal Information Collection
  cy.log('Step 1: Completing Personal Information');
  
  // Verify we're on the correct step
  cy.dataCy('step-personal-info').should('have.class', 'active');
  cy.dataCy('progress-indicator').should('contain.text', 'Step 1 of 4');
  
  // Fill personal information form
  const { personalInfo } = onboardingData;
  
  cy.dataCy('first-name-input').type(personalInfo.firstName);
  cy.dataCy('last-name-input').type(personalInfo.lastName);
  cy.dataCy('date-of-birth-input').type(personalInfo.dateOfBirth);
  cy.dataCy('email-input').type(personalInfo.email);
  cy.dataCy('phone-input').type(personalInfo.phone);
  
  // Handle SSN input with encryption indicator
  if (personalInfo.ssn) {
    cy.dataCy('ssn-input').type(personalInfo.ssn);
    cy.dataCy('ssn-encryption-indicator').should('have.class', 'encrypted');
  }
  
  // Fill address information
  cy.dataCy('address-street-input').type(personalInfo.address.street);
  cy.dataCy('address-city-input').type(personalInfo.address.city);
  cy.dataCy('address-state-select').select(personalInfo.address.state);
  cy.dataCy('address-zip-input').type(personalInfo.address.zipCode);
  cy.dataCy('address-country-select').select(personalInfo.address.country);
  
  // Verify form validation
  cy.dataCy('personal-info-form').within(() => {
    cy.get('.validation-error').should('not.exist');
  });
  
  // Continue to next step
  cy.dataCy('continue-to-documents').click();
  
  // Step 2: Document Upload and Verification
  cy.log('Step 2: Document Upload and KYC Verification');
  
  // Wait for document upload step to load
  cy.dataCy('step-documents').should('have.class', 'active');
  cy.dataCy('progress-indicator').should('contain.text', 'Step 2 of 4');
  
  const { documents } = onboardingData;
  
  // Select document type
  cy.dataCy('document-type-select').select(documents.idType);
  cy.dataCy('document-number-input').type(documents.idNumber);
  
  // Upload document images (using fixtures)
  if (documents.frontImage) {
    cy.dataCy('id-front-upload').selectFile(`cypress/fixtures/documents/${documents.frontImage}`, {
      force: true
    });
    
    // Wait for upload and verification
    cy.dataCy('id-front-verification').should('contain.text', 'Verified');
  }
  
  if (documents.backImage) {
    cy.dataCy('id-back-upload').selectFile(`cypress/fixtures/documents/${documents.backImage}`, {
      force: true
    });
    
    // Wait for back image verification
    cy.dataCy('id-back-verification').should('contain.text', 'Verified');
  }
  
  // Upload proof of address
  if (documents.proofOfAddress) {
    cy.dataCy('proof-address-upload').selectFile(`cypress/fixtures/documents/${documents.proofOfAddress}`, {
      force: true
    });
    
    // Verify address document processing
    cy.dataCy('address-verification-status').should('contain.text', 'Processed');
  }
  
  // Wait for AI-powered document verification (F-002 AI Risk Assessment integration)
  cy.dataCy('ai-verification-progress').should('be.visible');
  cy.dataCy('ai-verification-complete', { timeout: 10000 }).should('be.visible');
  
  // Proceed to biometric verification
  cy.dataCy('continue-to-biometric').click();
  
  // Step 3: Biometric Verification
  cy.log('Step 3: Biometric Authentication');
  
  cy.dataCy('step-biometric').should('have.class', 'active');
  cy.dataCy('progress-indicator').should('contain.text', 'Step 3 of 4');
  
  const { biometric } = onboardingData;
  
  if (biometric.enabled) {
    // Enable biometric verification
    cy.dataCy('enable-biometric-toggle').click();
    
    // Simulate camera access permission
    cy.window().then((win) => {
      // Mock getUserMedia for testing environment
      Object.defineProperty(win.navigator, 'mediaDevices', {
        value: {
          getUserMedia: cy.stub().resolves({
            getTracks: () => [{ stop: cy.stub() }]
          })
        }
      });
    });
    
    // Wait for camera initialization
    cy.dataCy('camera-preview').should('be.visible');
    
    // Simulate biometric capture
    if (biometric.selfieImage) {
      cy.dataCy('capture-biometric').click();
      
      // Wait for biometric processing
      cy.dataCy('biometric-processing').should('be.visible');
      cy.dataCy('biometric-match-success', { timeout: 15000 }).should('be.visible');
    }
  } else {
    // Skip biometric verification
    cy.dataCy('skip-biometric').click();
    cy.dataCy('biometric-skip-confirmation').click();
  }
  
  // Continue to risk profile
  cy.dataCy('continue-to-review').click();
  
  // Step 4: Risk Profile and Review
  cy.log('Step 4: Risk Assessment and Final Review');
  
  cy.dataCy('step-review').should('have.class', 'active');
  cy.dataCy('progress-indicator').should('contain.text', 'Step 4 of 4');
  
  const { riskProfile } = onboardingData;
  
  // Complete risk assessment questionnaire
  cy.dataCy('investment-experience-select').select(riskProfile.investmentExperience);
  cy.dataCy('risk-tolerance-select').select(riskProfile.riskTolerance);
  cy.dataCy('annual-income-input').type(riskProfile.annualIncome);
  cy.dataCy('net-worth-input').type(riskProfile.liquidNetWorth);
  
  // Wait for AI risk assessment (F-002 integration)
  cy.dataCy('risk-assessment-processing').should('be.visible');
  cy.dataCy('risk-score-display', { timeout: 10000 }).should('be.visible');
  
  // Review all collected information
  cy.dataCy('review-personal-info').should('contain.text', personalInfo.firstName);
  cy.dataCy('review-documents').should('contain.text', documents.idType);
  cy.dataCy('review-risk-profile').should('contain.text', riskProfile.riskTolerance);
  
  // Accept terms and conditions
  cy.dataCy('terms-conditions-checkbox').check();
  cy.dataCy('privacy-policy-checkbox').check();
  cy.dataCy('kyc-aml-consent-checkbox').check();
  
  // Final compliance checks
  cy.dataCy('compliance-verification').should('contain.text', 'All checks passed');
  
  // Submit onboarding application
  cy.dataCy('submit-onboarding').click();
  
  // Verify successful onboarding completion
  cy.dataCy('onboarding-success', { timeout: 20000 }).should('be.visible');
  cy.dataCy('success-message').should('contain.text', 'Welcome to our platform');
  cy.dataCy('account-number').should('be.visible');
  
  // Verify URL change to customer dashboard
  cy.url().should('include', '/dashboard/customer');
  
  // Verify customer profile is accessible
  cy.dataCy('customer-profile-link').should('be.visible');
  
  // Log successful completion for audit trail
  cy.log('Digital onboarding completed successfully');
  
  // Verify compliance logging (F-003 Regulatory Compliance)
  cy.window().its('localStorage').invoke('getItem', 'onboardingAuditId').should('exist');
});

// Export types for TypeScript support
export {};