/// <reference types="cypress" />

// cypress v13.6+ - End-to-end tests for customer onboarding workflow
// Tests the F-004 Digital Customer Onboarding feature with KYC/AML compliance,
// biometric authentication, and performance validation for <5 minute completion target

// Import support files for custom commands and global configuration
import '../../support/commands';
import '../../support/e2e';

describe('Onboarding Workflow', () => {
  let testUser: any;
  let onboardingStartTime: number;
  
  beforeEach(() => {
    // Load test user data fixture for consistent testing across all scenarios
    cy.fixture('users.json').then((userData) => {
      testUser = userData.validUser;
    });
    
    // Set up API interceptions for isolated frontend testing
    // Mock the AI-powered risk assessment service (F-002 integration)
    cy.interceptAPI('POST', '/api/risk-assessment/score', {
      statusCode: 200,
      body: {
        riskScore: 750,
        riskCategory: 'LOW',
        confidence: 0.95,
        processingTime: 450 // milliseconds - meets <500ms requirement
      }
    });
    
    // Mock KYC/AML verification service for consistent test results
    cy.interceptAPI('POST', '/api/kyc/verify', {
      statusCode: 200,
      body: {
        verificationId: 'kyc-test-12345',
        status: 'VERIFIED',
        checks: {
          identity: 'PASS',
          aml: 'PASS',
          sanctions: 'CLEAR',
          pep: 'CLEAR'
        },
        processingTime: 2500 // milliseconds
      }
    });
    
    // Mock document verification service with AI processing
    cy.interceptAPI('POST', '/api/documents/verify', {
      statusCode: 200,
      body: {
        documentId: 'doc-test-67890',
        frontImageStatus: 'VERIFIED',
        backImageStatus: 'VERIFIED',
        extractedData: {
          firstName: testUser.personalInfo.firstName,
          lastName: testUser.personalInfo.lastName,
          dateOfBirth: testUser.personalInfo.dateOfBirth,
          documentNumber: testUser.documents.idNumber
        },
        confidence: 0.98,
        processingTime: 3200 // milliseconds
      }
    });
    
    // Mock biometric verification service
    cy.interceptAPI('POST', '/api/biometric/verify', {
      statusCode: 200,
      body: {
        biometricId: 'bio-test-11111',
        matchScore: 0.96,
        livenessScore: 0.94,
        status: 'VERIFIED',
        processingTime: 1800 // milliseconds
      }
    });
    
    // Mock compliance validation service (F-003 integration)
    cy.interceptAPI('POST', '/api/compliance/validate', {
      statusCode: 200,
      body: {
        complianceId: 'comp-test-22222',
        overallStatus: 'COMPLIANT',
        checks: {
          bsa: 'COMPLIANT',
          cip: 'COMPLIANT',
          cdd: 'COMPLIANT',
          usa_patriot_act: 'COMPLIANT'
        },
        auditTrailId: 'audit-test-33333'
      }
    });
    
    // Navigate to onboarding start page and record performance baseline
    onboardingStartTime = Date.now();
    cy.visit('/onboarding/personal-info');
    
    // Verify page security and accessibility standards
    cy.verifySecurityHeaders();
    cy.checkAccessibility();
    
    // Wait for onboarding container to fully load
    cy.dataCy('onboarding-container').should('be.visible');
    cy.dataCy('onboarding-progress').should('be.visible');
    
    // Verify SSL/TLS security for financial services compliance
    cy.location('protocol').should('eq', 'https:');
  });
  
  it('should successfully complete the personal info step', () => {
    // Verify we start on the correct step of the onboarding process
    cy.dataCy('step-personal-info').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 1 of 4');
    
    // Verify form validation is active
    cy.dataCy('personal-info-form').should('be.visible');
    cy.dataCy('form-validation-status').should('contain.text', 'Required fields');
    
    // Fill personal information form with test data
    cy.dataCy('first-name-input')
      .should('be.visible')
      .clear()
      .type(testUser.personalInfo.firstName)
      .should('have.value', testUser.personalInfo.firstName);
      
    cy.dataCy('last-name-input')
      .clear()
      .type(testUser.personalInfo.lastName)
      .should('have.value', testUser.personalInfo.lastName);
      
    cy.dataCy('date-of-birth-input')
      .clear()
      .type(testUser.personalInfo.dateOfBirth)
      .should('have.value', testUser.personalInfo.dateOfBirth);
      
    cy.dataCy('email-input')
      .clear()
      .type(testUser.personalInfo.email)
      .should('have.value', testUser.personalInfo.email);
      
    // Verify email format validation
    cy.dataCy('email-validation-indicator').should('have.class', 'valid');
      
    cy.dataCy('phone-input')
      .clear()
      .type(testUser.personalInfo.phone)
      .should('have.value', testUser.personalInfo.phone);
    
    // Fill address information for KYC compliance
    cy.dataCy('address-street-input')
      .clear()
      .type(testUser.personalInfo.address.street);
      
    cy.dataCy('address-city-input')
      .clear()
      .type(testUser.personalInfo.address.city);
      
    cy.dataCy('address-state-select')
      .select(testUser.personalInfo.address.state);
      
    cy.dataCy('address-zip-input')
      .clear()
      .type(testUser.personalInfo.address.zipCode);
      
    cy.dataCy('address-country-select')
      .select(testUser.personalInfo.address.country);
    
    // Handle sensitive SSN input with security measures
    if (testUser.personalInfo.ssn) {
      cy.dataCy('ssn-input')
        .clear()
        .type(testUser.personalInfo.ssn, { log: false }); // Don't log SSN for security
      
      // Verify SSN encryption indicator appears
      cy.dataCy('ssn-encryption-indicator').should('have.class', 'encrypted');
    }
    
    // Verify all form validation passes before submission
    cy.dataCy('personal-info-form').within(() => {
      cy.get('.validation-error').should('not.exist');
    });
    
    cy.dataCy('form-validation-status').should('contain.text', 'All fields valid');
    
    // Submit personal information form
    cy.dataCy('continue-to-documents')
      .should('be.enabled')
      .click();
    
    // Verify successful progression to next step
    cy.url().should('include', '/onboarding/documents');
    cy.dataCy('step-documents').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 2 of 4');
    
    // Verify personal info data persistence
    cy.dataCy('review-personal-info').should('contain.text', testUser.personalInfo.firstName);
  });
  
  it('should successfully complete the document upload step', () => {
    // First complete personal info step programmatically to reach document upload
    cy.dataCy('first-name-input').type(testUser.personalInfo.firstName);
    cy.dataCy('last-name-input').type(testUser.personalInfo.lastName);
    cy.dataCy('date-of-birth-input').type(testUser.personalInfo.dateOfBirth);
    cy.dataCy('email-input').type(testUser.personalInfo.email);
    cy.dataCy('phone-input').type(testUser.personalInfo.phone);
    cy.dataCy('address-street-input').type(testUser.personalInfo.address.street);
    cy.dataCy('address-city-input').type(testUser.personalInfo.address.city);
    cy.dataCy('address-state-select').select(testUser.personalInfo.address.state);
    cy.dataCy('address-zip-input').type(testUser.personalInfo.address.zipCode);
    cy.dataCy('address-country-select').select(testUser.personalInfo.address.country);
    cy.dataCy('continue-to-documents').click();
    
    // Verify we're on the document upload step
    cy.dataCy('step-documents').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 2 of 4');
    
    // Select document type for KYC verification
    cy.dataCy('document-type-select')
      .should('be.visible')
      .select(testUser.documents.idType);
      
    cy.dataCy('document-number-input')
      .clear()
      .type(testUser.documents.idNumber)
      .should('have.value', testUser.documents.idNumber);
    
    // Upload front image of ID document
    cy.dataCy('id-front-upload')
      .should('be.visible')
      .selectFile('cypress/fixtures/documents/valid-id-front.jpg', { force: true });
    
    // Wait for document processing and AI verification
    cy.dataCy('document-processing-indicator').should('be.visible');
    cy.dataCy('ai-verification-progress').should('be.visible');
    
    // Verify document verification completed successfully
    cy.dataCy('id-front-verification', { timeout: 15000 })
      .should('contain.text', 'Verified');
    
    // Upload back image of ID document if required
    cy.get('body').then($body => {
      if ($body.find('[data-cy="id-back-upload"]').length > 0) {
        cy.dataCy('id-back-upload')
          .selectFile('cypress/fixtures/documents/valid-id-back.jpg', { force: true });
        
        cy.dataCy('id-back-verification', { timeout: 15000 })
          .should('contain.text', 'Verified');
      }
    });
    
    // Upload proof of address document
    cy.dataCy('proof-address-upload')
      .selectFile('cypress/fixtures/documents/utility-bill.pdf', { force: true });
    
    // Wait for address verification processing
    cy.dataCy('address-verification-status', { timeout: 12000 })
      .should('contain.text', 'Processed');
    
    // Verify AI-powered document verification completed (F-002 integration)
    cy.dataCy('ai-verification-complete', { timeout: 20000 }).should('be.visible');
    cy.dataCy('verification-confidence-score').should('contain.text', '98%');
    
    // Verify extracted data matches input data
    cy.dataCy('extracted-name').should('contain.text', testUser.personalInfo.firstName);
    cy.dataCy('extracted-document-number').should('contain.text', testUser.documents.idNumber);
    
    // Continue to biometric verification step
    cy.dataCy('continue-to-biometric')
      .should('be.enabled')
      .click();
    
    // Verify successful progression to biometric step
    cy.url().should('include', '/onboarding/biometric');
    cy.dataCy('step-biometric').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 3 of 4');
  });
  
  it('should successfully complete the biometric verification step', () => {
    // Programmatically complete previous steps to reach biometric verification
    cy.dataCy('first-name-input').type(testUser.personalInfo.firstName);
    cy.dataCy('last-name-input').type(testUser.personalInfo.lastName);
    cy.dataCy('date-of-birth-input').type(testUser.personalInfo.dateOfBirth);
    cy.dataCy('email-input').type(testUser.personalInfo.email);
    cy.dataCy('phone-input').type(testUser.personalInfo.phone);
    cy.dataCy('address-street-input').type(testUser.personalInfo.address.street);
    cy.dataCy('address-city-input').type(testUser.personalInfo.address.city);
    cy.dataCy('address-state-select').select(testUser.personalInfo.address.state);
    cy.dataCy('address-zip-input').type(testUser.personalInfo.address.zipCode);
    cy.dataCy('address-country-select').select(testUser.personalInfo.address.country);
    cy.dataCy('continue-to-documents').click();
    
    // Complete document upload step
    cy.dataCy('document-type-select').select(testUser.documents.idType);
    cy.dataCy('document-number-input').type(testUser.documents.idNumber);
    cy.dataCy('id-front-upload').selectFile('cypress/fixtures/documents/valid-id-front.jpg', { force: true });
    cy.dataCy('id-front-verification', { timeout: 15000 }).should('contain.text', 'Verified');
    cy.dataCy('proof-address-upload').selectFile('cypress/fixtures/documents/utility-bill.pdf', { force: true });
    cy.dataCy('ai-verification-complete', { timeout: 20000 }).should('be.visible');
    cy.dataCy('continue-to-biometric').click();
    
    // Verify we're on the biometric verification step
    cy.dataCy('step-biometric').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 3 of 4');
    
    // Enable biometric verification
    cy.dataCy('enable-biometric-toggle')
      .should('be.visible')
      .click();
    
    // Mock camera access for testing environment
    cy.window().then((win) => {
      // Override getUserMedia to simulate camera access
      Object.defineProperty(win.navigator, 'mediaDevices', {
        value: {
          getUserMedia: cy.stub().resolves({
            getTracks: () => [{ 
              stop: cy.stub(),
              getSettings: () => ({ width: 640, height: 480 })
            }]
          })
        },
        writable: true
      });
    });
    
    // Wait for camera initialization and preview
    cy.dataCy('camera-preview', { timeout: 10000 }).should('be.visible');
    cy.dataCy('camera-status').should('contain.text', 'Camera ready');
    
    // Verify biometric capture instructions are displayed
    cy.dataCy('biometric-instructions')
      .should('be.visible')
      .should('contain.text', 'Position your face');
    
    // Simulate biometric capture process
    cy.dataCy('capture-biometric')
      .should('be.enabled')
      .click();
    
    // Wait for biometric processing with liveness detection
    cy.dataCy('biometric-processing').should('be.visible');
    cy.dataCy('liveness-check-indicator').should('be.visible');
    
    // Verify biometric verification completed successfully
    cy.dataCy('biometric-match-success', { timeout: 20000 })
      .should('be.visible')
      .should('contain.text', 'Identity verified');
    
    // Verify biometric match score meets security threshold
    cy.dataCy('match-score-display').should('contain.text', '96%');
    cy.dataCy('liveness-score-display').should('contain.text', '94%');
    
    // Continue to review step
    cy.dataCy('continue-to-review')
      .should('be.enabled')
      .click();
    
    // Verify successful progression to review step
    cy.url().should('include', '/onboarding/review');
    cy.dataCy('step-review').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 4 of 4');
  });
  
  it('should successfully complete the review step and submit the application', () => {
    // Programmatically complete all previous steps to reach review
    cy.dataCy('first-name-input').type(testUser.personalInfo.firstName);
    cy.dataCy('last-name-input').type(testUser.personalInfo.lastName);
    cy.dataCy('date-of-birth-input').type(testUser.personalInfo.dateOfBirth);
    cy.dataCy('email-input').type(testUser.personalInfo.email);
    cy.dataCy('phone-input').type(testUser.personalInfo.phone);
    cy.dataCy('address-street-input').type(testUser.personalInfo.address.street);
    cy.dataCy('address-city-input').type(testUser.personalInfo.address.city);
    cy.dataCy('address-state-select').select(testUser.personalInfo.address.state);
    cy.dataCy('address-zip-input').type(testUser.personalInfo.address.zipCode);
    cy.dataCy('address-country-select').select(testUser.personalInfo.address.country);
    cy.dataCy('continue-to-documents').click();
    
    // Complete document and biometric steps
    cy.dataCy('document-type-select').select(testUser.documents.idType);
    cy.dataCy('document-number-input').type(testUser.documents.idNumber);
    cy.dataCy('id-front-upload').selectFile('cypress/fixtures/documents/valid-id-front.jpg', { force: true });
    cy.dataCy('ai-verification-complete', { timeout: 20000 }).should('be.visible');
    cy.dataCy('continue-to-biometric').click();
    
    cy.dataCy('enable-biometric-toggle').click();
    cy.dataCy('capture-biometric').click();
    cy.dataCy('biometric-match-success', { timeout: 20000 }).should('be.visible');
    cy.dataCy('continue-to-review').click();
    
    // Verify we're on the review step
    cy.dataCy('step-review').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 4 of 4');
    
    // Complete risk profile assessment for regulatory compliance
    cy.dataCy('investment-experience-select')
      .should('be.visible')
      .select(testUser.riskProfile.investmentExperience);
      
    cy.dataCy('risk-tolerance-select')
      .select(testUser.riskProfile.riskTolerance);
      
    cy.dataCy('annual-income-input')
      .clear()
      .type(testUser.riskProfile.annualIncome);
      
    cy.dataCy('net-worth-input')
      .clear()
      .type(testUser.riskProfile.liquidNetWorth);
    
    // Wait for AI risk assessment processing (F-002 integration)
    cy.dataCy('risk-assessment-processing').should('be.visible');
    cy.dataCy('risk-score-display', { timeout: 15000 })
      .should('be.visible')
      .should('contain.text', '750'); // From mocked API response
    
    // Verify all collected information is displayed correctly
    cy.dataCy('review-personal-info')
      .should('contain.text', testUser.personalInfo.firstName)
      .should('contain.text', testUser.personalInfo.lastName)
      .should('contain.text', testUser.personalInfo.email);
      
    cy.dataCy('review-documents')
      .should('contain.text', testUser.documents.idType)
      .should('contain.text', 'Verified');
      
    cy.dataCy('review-biometric')
      .should('contain.text', 'Identity verified')
      .should('contain.text', '96%'); // Match score
      
    cy.dataCy('review-risk-profile')
      .should('contain.text', testUser.riskProfile.riskTolerance)
      .should('contain.text', testUser.riskProfile.investmentExperience);
    
    // Accept terms and conditions for regulatory compliance
    cy.dataCy('terms-conditions-checkbox')
      .should('be.visible')
      .check()
      .should('be.checked');
      
    cy.dataCy('privacy-policy-checkbox')
      .check()
      .should('be.checked');
      
    cy.dataCy('kyc-aml-consent-checkbox')
      .check()
      .should('be.checked');
    
    // Verify final compliance checks passed (F-003 integration)
    cy.dataCy('compliance-verification')
      .should('be.visible')
      .should('contain.text', 'All checks passed');
    
    // Submit the complete onboarding application
    cy.dataCy('submit-onboarding')
      .should('be.enabled')
      .click();
    
    // Verify successful onboarding completion
    cy.dataCy('onboarding-success', { timeout: 30000 })
      .should('be.visible')
      .should('contain.text', 'Welcome to our platform');
    
    // Verify account creation success indicators
    cy.dataCy('success-message').should('contain.text', 'Account created successfully');
    cy.dataCy('account-number').should('be.visible').and('not.be.empty');
    cy.dataCy('customer-id').should('be.visible').and('not.be.empty');
    
    // Verify URL change to customer dashboard
    cy.url().should('include', '/dashboard/customer');
    
    // Verify customer profile accessibility
    cy.dataCy('customer-profile-link').should('be.visible');
    cy.dataCy('welcome-message').should('contain.text', testUser.personalInfo.firstName);
    
    // Verify audit trail creation for compliance (F-003)
    cy.window().its('localStorage').invoke('getItem', 'onboardingAuditId').should('exist');
    
    // Validate performance requirement: onboarding completed in under 5 minutes
    cy.then(() => {
      const onboardingEndTime = Date.now();
      const totalOnboardingTime = onboardingEndTime - onboardingStartTime;
      const timeInMinutes = totalOnboardingTime / 60000;
      
      // Log performance metrics for compliance reporting
      cy.log(`Total onboarding time: ${timeInMinutes.toFixed(2)} minutes`);
      
      // Assert performance target met (under 5 minutes)
      expect(timeInMinutes).to.be.lessThan(5, 'Onboarding should complete in under 5 minutes');
    });
  });
  
  it('should display an error message for invalid input in the personal info step', () => {
    // Test form validation with invalid email format
    cy.dataCy('first-name-input').type('John');
    cy.dataCy('last-name-input').type('Doe');
    cy.dataCy('date-of-birth-input').type('1990-01-01');
    
    // Enter invalid email format to trigger validation
    cy.dataCy('email-input')
      .clear()
      .type('invalid-email-format')
      .blur(); // Trigger validation
    
    // Verify email validation error appears
    cy.dataCy('email-validation-error')
      .should('be.visible')
      .should('contain.text', 'Please enter a valid email address');
    
    cy.dataCy('email-validation-indicator').should('have.class', 'invalid');
    
    // Test phone number validation
    cy.dataCy('phone-input')
      .clear()
      .type('123') // Invalid phone number
      .blur();
    
    cy.dataCy('phone-validation-error')
      .should('be.visible')
      .should('contain.text', 'Please enter a valid phone number');
    
    // Test date of birth validation (future date)
    cy.dataCy('date-of-birth-input')
      .clear()
      .type('2030-12-31') // Future date should be invalid
      .blur();
    
    cy.dataCy('dob-validation-error')
      .should('be.visible')
      .should('contain.text', 'Date of birth cannot be in the future');
    
    // Test required field validation
    cy.dataCy('first-name-input').clear().blur();
    cy.dataCy('first-name-validation-error')
      .should('be.visible')
      .should('contain.text', 'First name is required');
    
    // Verify form cannot be submitted with validation errors
    cy.dataCy('continue-to-documents').should('be.disabled');
    
    // Verify form validation status shows errors
    cy.dataCy('form-validation-status').should('contain.text', 'Please correct errors');
    
    // Verify URL has not changed (still on personal info step)
    cy.url().should('include', '/onboarding/personal-info');
    
    // Verify error state indicators
    cy.dataCy('personal-info-form').should('have.class', 'has-errors');
    cy.dataCy('step-personal-info').should('have.class', 'error-state');
    
    // Test fixing validation errors
    cy.dataCy('first-name-input').type('John');
    cy.dataCy('email-input').clear().type('john.doe@example.com');
    cy.dataCy('phone-input').clear().type('+1-555-123-4567');
    cy.dataCy('date-of-birth-input').clear().type('1990-01-01');
    
    // Fill remaining required fields
    cy.dataCy('last-name-input').type('Doe');
    cy.dataCy('address-street-input').type('123 Main St');
    cy.dataCy('address-city-input').type('Anytown');
    cy.dataCy('address-state-select').select('NY');
    cy.dataCy('address-zip-input').type('12345');
    cy.dataCy('address-country-select').select('US');
    
    // Verify validation errors are cleared
    cy.dataCy('email-validation-error').should('not.exist');
    cy.dataCy('phone-validation-error').should('not.exist');
    cy.dataCy('dob-validation-error').should('not.exist');
    cy.dataCy('first-name-validation-error').should('not.exist');
    
    // Verify form can now be submitted
    cy.dataCy('continue-to-documents').should('be.enabled');
    cy.dataCy('form-validation-status').should('contain.text', 'All fields valid');
  });
  
  it('should handle API errors gracefully during onboarding', () => {
    // Mock API failure scenarios for error handling testing
    cy.interceptAPI('POST', '/api/kyc/verify', {
      statusCode: 500,
      body: { error: 'KYC service temporarily unavailable' }
    });
    
    // Complete personal info step
    cy.dataCy('first-name-input').type(testUser.personalInfo.firstName);
    cy.dataCy('last-name-input').type(testUser.personalInfo.lastName);
    cy.dataCy('date-of-birth-input').type(testUser.personalInfo.dateOfBirth);
    cy.dataCy('email-input').type(testUser.personalInfo.email);
    cy.dataCy('phone-input').type(testUser.personalInfo.phone);
    cy.dataCy('address-street-input').type(testUser.personalInfo.address.street);
    cy.dataCy('address-city-input').type(testUser.personalInfo.address.city);
    cy.dataCy('address-state-select').select(testUser.personalInfo.address.state);
    cy.dataCy('address-zip-input').type(testUser.personalInfo.address.zipCode);
    cy.dataCy('address-country-select').select(testUser.personalInfo.address.country);
    cy.dataCy('continue-to-documents').click();
    
    // Attempt document upload with API failure
    cy.dataCy('document-type-select').select(testUser.documents.idType);
    cy.dataCy('document-number-input').type(testUser.documents.idNumber);
    cy.dataCy('id-front-upload').selectFile('cypress/fixtures/documents/valid-id-front.jpg', { force: true });
    
    // Verify error handling
    cy.dataCy('api-error-message', { timeout: 15000 })
      .should('be.visible')
      .should('contain.text', 'Verification service temporarily unavailable');
    
    cy.dataCy('retry-verification-button').should('be.visible');
    cy.dataCy('error-help-text').should('contain.text', 'Please try again or contact support');
    
    // Test retry functionality
    cy.interceptAPI('POST', '/api/kyc/verify', {
      statusCode: 200,
      body: {
        verificationId: 'kyc-retry-success',
        status: 'VERIFIED',
        checks: { identity: 'PASS', aml: 'PASS' }
      }
    });
    
    cy.dataCy('retry-verification-button').click();
    cy.dataCy('api-error-message').should('not.exist');
    cy.dataCy('id-front-verification').should('contain.text', 'Verified');
  });
  
  it('should maintain session state across page refreshes during onboarding', () => {
    // Complete first step
    cy.dataCy('first-name-input').type(testUser.personalInfo.firstName);
    cy.dataCy('last-name-input').type(testUser.personalInfo.lastName);
    cy.dataCy('date-of-birth-input').type(testUser.personalInfo.dateOfBirth);
    cy.dataCy('email-input').type(testUser.personalInfo.email);
    cy.dataCy('phone-input').type(testUser.personalInfo.phone);
    cy.dataCy('address-street-input').type(testUser.personalInfo.address.street);
    cy.dataCy('address-city-input').type(testUser.personalInfo.address.city);
    cy.dataCy('address-state-select').select(testUser.personalInfo.address.state);
    cy.dataCy('address-zip-input').type(testUser.personalInfo.address.zipCode);
    cy.dataCy('address-country-select').select(testUser.personalInfo.address.country);
    cy.dataCy('continue-to-documents').click();
    
    // Verify we're on step 2
    cy.dataCy('step-documents').should('have.class', 'active');
    
    // Refresh the page to test session persistence
    cy.reload();
    
    // Verify onboarding state is maintained
    cy.dataCy('onboarding-container').should('be.visible');
    cy.dataCy('step-documents').should('have.class', 'active');
    cy.dataCy('progress-indicator').should('contain.text', 'Step 2 of 4');
    
    // Verify personal info data is still available in review section
    cy.dataCy('review-personal-info').should('contain.text', testUser.personalInfo.firstName);
    
    // Verify session storage contains onboarding data
    cy.window().its('sessionStorage').invoke('getItem', 'onboardingProgress').should('exist');
    cy.window().its('sessionStorage').invoke('getItem', 'personalInfoData').should('exist');
  });
  
  afterEach(() => {
    // Performance monitoring and cleanup
    cy.then(() => {
      const testEndTime = Date.now();
      const testDuration = testEndTime - onboardingStartTime;
      
      cy.log(`Test completed in ${testDuration}ms`);
      
      // Generate audit log for compliance tracking
      const auditData = {
        testName: Cypress.currentTest.title,
        duration: testDuration,
        timestamp: new Date().toISOString(),
        onboardingStepsCompleted: Cypress.currentTest.state === 'passed' ? 'ALL' : 'PARTIAL',
        complianceValidation: 'COMPLETED'
      };
      
      cy.window().then((win) => {
        win.sessionStorage.setItem('testAuditLog', JSON.stringify(auditData));
      });
    });
    
    // Clear sensitive test data for security
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });
});